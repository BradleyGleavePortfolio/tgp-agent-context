# AUDIT — PR-11: on_completion / on_milestone trigger glue (PR #321)

VERDICT: CLEAN
Typecheck: pass (`node_modules/.bin/tsc --noEmit -p tsconfig.json` — 0 errors)
Lint: pass (`npm run lint` — 0 errors; 17 pre-existing warnings unchanged from `main`)
Build: pass (`npm run build` / `nest build` — clean)
Tests: pass — 288 suites; 3468/3468 active passed (+17 over main's 3451 from PR-10), 20 skipped + 5 todo + 6 snapshots unchanged (`node_modules/.bin/jest`)

Branch: `pr11/trigger-glue` (head `a9aa1ab7`) → base `main` (head `adab4f8c`). 8 files changed, +1163/-5 LOC.

---

## P0 findings

None.

## P1 findings

None.

## P2 findings

None.

## P3 (non-blocking)

### P3-1. `flipMatchingOnCompletion` fallback path for null `package_id` is unreachable & subtly incorrect

`src/packages/drip-trigger.service.ts:296-311` — `purchaseRow?.package_id ?? null` fallback runs `coachPackageContent.findMany` over only `[completedContentId, ...candidates.map(c.content_id)]` when `packageId` is null. But `ClientPurchase.package_id` is **non-nullable** in `prisma/schema.prisma:3234` (`package_id String`, not `String?`). So this branch is dead. If it were ever reachable, it would mis-evaluate the "immediately-prior" check by failing to detect intermediate content rows not in the candidate set (those rows would be missing from `orderById`, allowing a false "no between" determination and incorrect flip).

Fix: drop the fallback branch entirely; or, if defensive, treat null `packageId` as "fail-closed, return no flips."

### P3-2. `flipByIds` post-read uses `fire_at: { gte: now }` to identify flipped rows

`src/packages/drip-trigger.service.ts:388-396` — reads back drops via `fire_at: { gte: now }` to determine which were just flipped. A drop that was flipped microseconds earlier by a concurrent emit could still be counted. In practice this is benign (the dispatcher dedupes), and the contract is "drops in flipped state" rather than "drops we exclusively flipped." Worth a comment if not changed.

### P3-3. Trigger lookup query is not covered by a tightly-fitting index

`src/packages/drip-trigger.service.ts:158-163` — the first query filters by `(asset_type, asset_id, client_purchase.client_user_id)`. PR-3 indexes are `@@index([status, fire_at])`, `@@index([client_purchase_id, status])`, `@@index([status, next_retry_at, fire_at])`. None cover `(asset_type, asset_id)` directly. The Postgres planner will likely use the implicit ClientPurchase index on `client_user_id` to narrow purchase_ids, then `[client_purchase_id, status]` to filter ScheduledDrop, then post-filter `asset_type`/`asset_id`. Acceptable in early-stage volume; revisit if completion latency p99 climbs. The build report's claim that "PR-3 indexes cover the trigger queries" is overstated for this specific query but not materially wrong for the workload.

### P3-4. WorkoutBuilderService awaits the trigger inside the completion path

`src/workout-builder/workout-builder.service.ts:771-795` — the trigger is `await`ed twice (workout_plan + workout_program aliases). Each call issues 2-3 DB round trips. Combined with `BuildWeekService.completeDay`'s awaited `milestones.emit`, this couples buyer-facing completion latency to the trigger pipeline's responsiveness. The trigger's never-throws guarantee handles correctness, but the latency coupling contradicts the build report's "<10ms" claim under degraded DB conditions. Consider firing as `void this.dripTrigger.onContentCompleted(...)` if completion-response p99 becomes a concern.

### P3-5. `package_id`-scoped CoachPackageContent fetch is unbounded

`src/packages/drip-trigger.service.ts:301-305` — reads every CoachPackageContent row for the package each completion. With typical package sizes (<20 rows per the comment at :294-295) this is fine, but for a hypothetical 1000-content package this becomes a hot-path scan per completion. No measurable problem today; documenting as a horizon item.

---

## Verification of PR claims

| Claim | Verdict | Evidence |
|---|---|---|
| Flip `fire_at` (option a) chosen; PR-9 inline path + PR-10 cron query untouched | TRUE | `git diff main..HEAD -- src/packages/purchase-fanout.service.ts src/packages/drip-dispatcher.cron.ts` — no changes. |
| on_completion hook in `WorkoutBuilderService.completeAssignment` real-completion branch only | TRUE | `src/workout-builder/workout-builder.service.ts:755-797` — trigger fires inside `if (updated.count === 1)`; the idempotent-replay branch at :727-734 short-circuits before reaching the conditional update; the ConflictException branch at :815 throws before reaching the trigger. |
| Two `onContentCompleted` calls (workout_plan + workout_program) cannot double-fire | TRUE | `src/packages/drip-trigger.service.ts:160-161` — query filters `asset_type` verbatim; the two emits scope to disjoint snapshot sets. |
| `MilestoneService.emit('build_week_complete')` fires on final-day branch only | TRUE | `src/build-week/build-week.service.ts:259-279` — wrapped in `if (isFinalDay)`. A second day-7 submission throws `ConflictException` at :201 (status='completed' after first finalization) before re-emitting. |
| on_completion default = immediately-prior content by display_order in same purchase | TRUE | `src/packages/drip-trigger.service.ts:317-356` — explicit check that no other content row sits strictly between `completedOrder` and `candidateOrder` in the in-memory order map; first-content fail-closes (any completedOrder >= candidateOrder is skipped at :337). |
| Cross-buyer isolation | TRUE | All four query sites scope via `client_purchase: { client_user_id: input.buyerUserId }` (`drip-trigger.service.ts:162`, :224) or via a `client_purchase_id` already derived from a buyer-scoped query result (:267, :380). Test at `test/drip-trigger.service.spec.ts:316-343` constructs both buyers' drops with the SAME asset and asserts only A's drop flips. |
| Idempotent on doubled completion / doubled emit | TRUE | `updateMany` WHERE re-asserts `fire_at: null`, `status: 'pending'`, `materialised_ref: null` (`drip-trigger.service.ts:380-384`). Test at :267-297 calls `onContentCompleted` twice and asserts flipped=1 then 0; test at :433-458 same for milestones. The candidates query at :270-272 also re-asserts all three guards. |
| Already-delivered drop (materialised_ref set) not re-flipped | TRUE | Candidates query filters `materialised_ref: null` (:271); test at :346-368 verifies. |
| No-op on no waiting drop; never throws on prisma error | TRUE | Outer try/catch returns empty on error (`drip-trigger.service.ts:199-204`, :249-254); tests at :300-313, :531-560 verify both paths. |
| Buyer A's milestone does not fire buyer B's drops | TRUE | `drip-trigger.service.ts:224` scopes; test at :461-502 verifies. |
| meal-plan completion not wired (documented choice) | TRUE | No call to `dripTrigger.onContentCompleted` from `src/log/log.service.ts` or meal-plan services. Build report (b) explicitly documents the rationale; no evidence of silent miss. |
| `nest build` / tsc / eslint clean | TRUE | All three commands run; tsc 0 errors, build clean, lint 0 errors (17 pre-existing warnings unchanged). |
| 3468 tests pass (+17 over main) | TRUE | `node_modules/.bin/jest` — `Tests: 20 skipped, 5 todo, 3468 passed, 3493 total`. |
| Tests are not self-fulfilling | TRUE | Mock prisma at `test/drip-trigger.service.spec.ts:95-145` implements a real in-memory store with WHERE matching, projection, and updateMany semantics. Cross-buyer test (:316-343) and idempotency tests (:267-297, :433-458) exercise the full service path against this store; updates are observable on the shared state object. No mock stubs the matching logic itself. |

---

## Detailed correctness traces

### Replay path (workout completion)
1. Client sends request R1 with `idempotency_key=K`. Row not completed. Passes :727 short-circuit. `updateMany` succeeds (count=1). Trigger fires.
2. Client retries with same `idempotency_key=K`. Row now completed AND `completion_idempotency_key === K`. Short-circuits at :727-734. **Trigger NOT re-fired.** ✓
3. Concurrent R1+R2 with same K: both pass :727 (completed_at still null), both enter `updateMany`. Only one matches `completed_at: null` filter. Loser drops to :801-815, sees idempotency_key match, returns idempotent. **Trigger fires exactly once.** ✓
4. R1 with `K1`, then R2 with `K2`: R1 fires trigger. R2 throws `ConflictException` at :815. **Trigger fires exactly once.** ✓

### Replay path (milestone)
1. First final-day submission: `isFinalDay && status='active' && current_day===7`. Transaction sets status='completed', current_day=7. After commit, `milestones.emit('build_week_complete')` runs. Trigger flips matching drops.
2. Second final-day submission: gets `ConflictException` at :201 (`status !== 'active'`). **Trigger NOT re-emitted.** ✓
3. Even if step 2 somehow re-emitted, `onMilestone`'s candidates query re-asserts `fire_at: null` AND `status: 'pending'` AND `materialised_ref: null`; an already-flipped or delivered drop is excluded. ✓

### Cross-buyer trace
1. Buyer A completes workout_plan WP. Hook fires `onContentCompleted({ buyerUserId: A, assetType: 'workout_plan', assetId: WP })`.
2. Step-1 query: `scheduledDrop.findMany({ where: { asset_type: 'workout_plan', asset_id: WP, client_purchase: { client_user_id: A } } })`. Postgres planner joins ClientPurchase, filters by `client_user_id = A`. Buyer B's drops on the same asset are filtered out at the join.
3. Step-2 query (`flipMatchingOnCompletion`): scoped to `client_purchase_id: <one of A's purchases>`. Buyer B's purchases excluded by definition.
4. `flipByIds`: only operates on ids returned from the buyer-scoped query.
5. **No cross-buyer fire possible.** ✓ Test at `:316-343` provides regression coverage.

### Default-rule trace ("immediately prior")
Given package with content `c1` (display_order=0), `c2` (1), `c3` (2). Drop on `c3` has cadence=on_completion, no `depends_on`.
- Buyer completes `c1`: `completedOrder=0`, `candidateOrder=2`. Walk orderById values, find `c2` (order 1) is strictly between → `between=true` → NOT flipped. ✓
- Buyer completes `c2`: `completedOrder=1`, `candidateOrder=2`. No other row between → `between=false` → flipped. ✓
- Buyer completes `c3`: `completedOrder >= candidateOrder` → skipped at line 337. ✓
- Buyer completes nothing in the package (first content, no preceding): `completedOrder=undefined` for any "before-c1" asset → skipped. First-content omitted-default never fires (fail-closed as documented). ✓

### Schema sanity
`ScheduledDrop` (`prisma/schema.prisma:4683-4713`) — `client_purchase_id` is FK with cascade; `@@unique([client_purchase_id, content_id])` guarantees one drop per (purchase, content). `ClientPurchase.package_id` is non-nullable (`schema.prisma:3234`), confirming P3-1's "unreachable fallback" observation.

---

## Scope discipline check

- `git diff main..HEAD --stat`: 8 files, all in `src/packages/`, `src/workout-builder/`, `src/build-week/`, `test/`. No changes to checkout, billing, storefront, mobile, media, refund flows.
- `purchase-fanout.service.ts` (PR-9) and `drip-dispatcher.cron.ts` (PR-10): unchanged (verified via `git diff main..HEAD -- src/packages/purchase-fanout.service.ts src/packages/drip-dispatcher.cron.ts` — empty).
- No new schema migration (none required; existing indexes are reused).
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`, no Co-Authored-By trailers (verified via `git log -1 --format=fuller`).

---

## Findings summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 5 (all non-blocking) |

VERDICT: CLEAN
