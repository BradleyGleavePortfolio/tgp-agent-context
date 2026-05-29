# PR-11 BUILD REPORT — on_completion / on_milestone trigger glue

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/321

- Branch: `pr11/trigger-glue` off latest `main` (PR-2/3/4/6/7/8/9/10 already merged at `adab4f8c`).
- One commit: `a9aa1ab7` — "PR-11: on_completion / on_milestone trigger glue".
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. NO `Co-Authored-By` / generated trailers.

## (b) Which existing completion / milestone signals were hooked

### on_completion — `WorkoutBuilderService.completeAssignment`

`src/workout-builder/workout-builder.service.ts:746` — the existing client-facing workout completion endpoint (`PATCH /assignments/:assignmentId/complete`) routes here. The service uses a conditional `updateMany(WHERE completed_at IS NULL)` so concurrent completion requests can't both succeed — only the FIRST one returns `updated.count === 1`. We fire the drip trigger INSIDE that `count === 1` branch so:

- Replayed mobile requests (same `idempotency_key`) short-circuit before the trigger fires.
- Concurrent doubled requests only enter the trigger code once (the loser sees `count === 0`).

The trigger emits TWO `onContentCompleted` calls — one with `asset_type='workout_plan'` and one with `asset_type='workout_program'`. Both forms resolve to the same underlying `WorkoutPlan` id; the snapshot's `asset_type` is whichever the coach chose at authoring time, so we cover both. The trigger query filters by `asset_type+asset_id` so the two emits scope to their own snapshot type and cannot double-fire.

### on_milestone — `BuildWeekService.completeDay` (final day)

`src/build-week/build-week.service.ts:259` — the existing Build Week 7-day completion path. We hook the `isFinalDay` branch (the same site that already emits the `finance_milestone` PTM signal). On day 7 success we call `MilestoneService.emit(userId, 'build_week_complete')`.

### Meal-plan completion — intentionally NOT hooked

The repo logs meals **entry-by-entry** via `LoggedFoodEntry` (`src/log/log.service.ts:42`). There is no per-`DailyMealPlanAssignment` completion event and no "plan completed" semantic. The PR-11 brief explicitly says "do NOT invent new tracking." When a per-plan completion signal is added (likely in a future PR for client-facing plan tracking), wiring `onContentCompleted` from there is a trivial 5-line change.

## (c) Trigger → fire mechanism and rationale

**Choice: flip `fire_at = now()`** (option (a) in the brief). Documented inline at the top of `src/packages/drip-trigger.service.ts`:

> We flip fire_at rather than calling the resolver inline (option (a) in PR-11's brief). Two reasons:
>   1. Reuses PR-10's entire dispatch pipeline for free — claim/lock, resolver materialise, push+in-app alert, retry/backoff, COACH_ALERT on permanent failure, stranded-dispatching reclaim. An inline path would duplicate every line of that and is the kind of subtle drift that creates two divergent code paths over time.
>   2. Decouples the completion hook from the resolver. A workout-completion request returns to the buyer in <10ms whether or not the resolver is healthy. An inline path would couple buyer latency to (e.g.) a slow MessagingService send.
> The cost is ~30s worst-case delivery latency (cron tick interval). That is acceptable for trigger drops (the buyer doesn't expect simultaneous firing — they expect "after you finish X, Y unlocks").

PR-9's inline path and PR-10's cron query are **untouched** beyond the flip of `fire_at` on a row that was previously `fire_at = NULL`.

## (d) on_completion default rule (when `depends_on_content_id` is omitted)

**Documented default**: the trigger fires when the buyer completes the **immediately-prior content (by `display_order`)** within the same purchase.

Concretely: a candidate drop fires if and only if the just-completed content's `display_order` is **exactly one less** than the candidate's content's `display_order`, with no other content row in the package sitting between them. The check walks the package's CoachPackageContent ordering in-memory (loaded once per purchase, typically <20 entries).

**Edge case — first content row**: the very first content row in a package (`display_order = 0`) has no preceding sibling, so its omitted-default `on_completion` drop can NEVER fire via the omitted-default path. This is intentional **fail-closed** behaviour — an authoring error (coach forgot to set `depends_on_content_id` on the first row) should not silently fire on every completion in the package.

This rule was picked over alternatives ("fires when ANY prior content is completed", "fires when the asset_type matches") because it (a) matches the natural "Module 1 → Module 2" mental model coaches use, (b) is fully derivable from the snapshot + the authoring ordering with no extra columns, and (c) is the only rule that doesn't silently double-fire when multiple completions happen in the same package.

## (e) Idempotency approach

Three independent layers — a doubled completion / doubled milestone emit cannot deliver the drop twice:

1. **`fire_at IS NULL` re-asserted in the `updateMany` WHERE.** Once we flip a drop to `fire_at = now()`, the next trigger emit's WHERE filter excludes it. This is the primary guard.
2. **`status = 'pending' AND materialised_ref IS NULL`.** A drop that PR-10's cron already delivered (between the first and second emit) is excluded even if a stale event arrives later.
3. **PR-10's claim/atomic-update + PR-9 R1 resolver-side stable-key dedup.** The dispatch path uses `(clientPurchaseId, contentId)` keys: `WorkoutBuilderIdempotencyKey 'drip:workout:p={p}:c={c}'`, `DripResolverMarker(purpose='auto_message', purchase_id, content_id)`. So even if both layers (1) and (2) somehow let a duplicate flip through, the resolver-side ledger collapses the retry onto the cached deliverable.

A trigger emit that matches no pending drop is a **NO-OP** (common — most completions have no waiting drop). The service NEVER throws; on prisma error it logs `warn` and returns `{flipped: 0}` so a trigger-pipeline blip cannot break a legitimate completion request.

## (f) Milestone keys currently live

Exactly one key is wired in this PR:

| Key | Emit site | Trigger condition |
|---|---|---|
| `build_week_complete` | `BuildWeekService.completeDay` final-day branch | Buyer finishes day 7 of the Build Week catalog |

`MilestoneService` is a minimal `emit(buyerId, milestoneKey)` seam — adding more keys later is "find an existing real completion signal in another service and call `milestone.emit(...)` from it." We deliberately did **NOT** pre-define a milestone-key taxonomy (per the brief's "do NOT build a speculative taxonomy" rule). Keys are free-form strings; coaches can attach an `on_milestone` drop with any key, but only keys with a matching `emit()` call site will fire.

## (g) Test results

### Commands
- `node_modules/.bin/tsc --noEmit -p tsconfig.json` — **clean (0 errors)**.
- `npm run build` (`nest build`) — **clean**.
- `npm run lint` — **0 errors**, 17 pre-existing warnings unchanged from `main`.
- `node_modules/.bin/jest` — **288 suites pass; 3468/3468 active tests pass** (+17 over `main`'s 3451 from PR-10), 20 skipped + 5 todo + 6 snapshots unchanged.

### New tests — `test/drip-trigger.service.spec.ts` (17 total)

Each brief verification bullet maps to a test:

| Brief invariant | Test name |
|---|---|
| Buyer completes triggering asset → matching `on_completion` drop is flipped | "flips a matching on_completion drop when buyer completes the depended-on content" |
| Explicit `depends_on_content_id` only fires on THAT content's completion | "does NOT flip a drop whose depends_on_content_id points elsewhere" |
| Omitted `depends_on` fires per the documented immediately-prior default | "with no depends_on, fires when the immediately-prior content (by display_order) is completed" |
| Skipping intermediate content does NOT fire the later trigger | "with no depends_on, completion of N-2 content does NOT fire N content (only immediately-prior fires)" |
| Double completion → exactly one flip | "double completion -> drop flipped exactly once (fire_at NULL re-asserted)" |
| Completion with no waiting drop → no-op, no error | "completion with no waiting drop -> no-op, no error" |
| Buyer A's completion does NOT fire buyer B's drops | "buyer A's completion does NOT fire buyer B's drops" |
| Already-delivered drop not re-flipped | "drop with materialised_ref set is not re-flipped" |
| Milestone emit → matching `on_milestone` fires | "milestone emit fires matching on_milestone drop" |
| Non-matching `milestone_key` is a no-op | "non-matching milestone_key is a no-op" |
| Double milestone emit → exactly one flip | "double milestone emit -> drop flipped exactly once" |
| Buyer scope on milestones | "milestone emit for buyer A does NOT fire buyer B's drops" |
| `MilestoneService` delegates correctly | "delegates to DripTriggerService.onMilestone" |
| `MilestoneService` swallows trigger throw | "swallows a trigger throw (fire-and-forget invariant)" |
| `MilestoneService` no-op on empty args | "no-op on missing buyerUserId or milestoneKey" |
| `onContentCompleted` never throws on DB error | "onContentCompleted never throws even if underlying prisma errors" |
| `onMilestone` never throws on DB error | "onMilestone never throws even if underlying prisma errors" |

### Existing tests
All 3451 prior tests still pass — including the full PR-7 (38 resolvers), PR-8 (package contents), PR-9 (purchase fanout, 21 tests), and PR-10 (DripDispatcherCron, 19 tests) suites. No regressions.

## Files added / changed

- **new** `src/packages/drip-trigger.service.ts` — the core service with `onContentCompleted` + `onMilestone`. Full design rationale documented inline.
- **new** `src/packages/milestone.service.ts` — minimal `emit(buyerId, milestoneKey)` seam.
- **new** `test/drip-trigger.service.spec.ts` — 17 unit tests.
- **modified** `src/packages/packages.module.ts` — register + export both services.
- **modified** `src/workout-builder/workout-builder.service.ts` — fire `DripTriggerService.onContentCompleted` on the real-completion branch of `completeAssignment`.
- **modified** `src/workout-builder/workout-builder.module.ts` — import `PackagesModule` (forwardRef) for `DripTriggerService`.
- **modified** `src/build-week/build-week.service.ts` — emit `'build_week_complete'` milestone on the final day's success path.
- **modified** `src/build-week/build-week.module.ts` — import `PackagesModule` for `MilestoneService`.

**No schema migration.** Existing PR-3 `ScheduledDrop` indexes (`@@index([status, fire_at])`, `@@index([client_purchase_id, status])`) cover the trigger queries; no measurable need for a new index.

## Guardrails honoured

- Backend only. Trigger glue only.
- No change to PR-9's inline materialise path.
- No change to PR-10's cron query (other than the trigger flipping `fire_at`).
- No new client-facing completion UI (PR-13 is mobile).
- No media upload (PR-12). No refund/cancel (PR-16). No push-to-existing (PR-17).
- No schema migration.
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers.
