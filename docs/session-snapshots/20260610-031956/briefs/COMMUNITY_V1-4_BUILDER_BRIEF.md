# Community v1-4 — Builder Brief

**Slice:** realtime + push + telemetry
**Branch:** `feature/community-v1-realtime-push`
**Base SHA:** `ed78bbef` (current `main`, v1-3 just merged as PR #368)
**Builder model:** Opus 4.8 (MANDATORY — Sonnet 4.6 forbidden per R31; auditor greps for "sonnet")
**Subagent type:** `general_purpose` (NOT `codebase` — sandbox bug per engineering ticket e2209543)
**Worktree:** `/home/user/workspace/tgp/backend-community-v1-4` (READ-ONLY for any other subagent per R57)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Estimated LOC:** ~1100
**Estimated rounds:** R1 audit + 1-2 fixer cycles (v1-3 took 3, target 2 here)

---

## 0. Standing rules — read FIRST

You are one builder in a chain of ~100 agents shipping the Community Expansion. Do **this slice** right; do not touch v1-5 or v1-6 territory. The standing rules apply unconditionally:

- **R0** — Decacorn quality. Never stub data. Never silent failures. Never quick patches. Do the work right.
- **R1** — All work to decacorn quality.
- **R2** — Builder → R1 audit (fresh GPT-5.5) → fixer → R2 audit → … until CLEAN.
- **R5** — Avoid the 50 documented AI-coding failure patterns (see §11 below for the v1-4-specific subset).
- **R6** — Never kick the can. Fix at the root.
- **R8** — Never visibly leave the app.
- **R9** — No raw error codes. All errors structured (use the existing `disabled-response.dto.ts` pattern from v1-3 for kill-switch responses).
- **R11** — Never delete features. Always build outward.
- **R14** — Always build with latest stable plumbing.
- **R31 (audit cycle)** — Builder ≠ auditor ≠ fixer; every audit round fresh GPT-5.5 with new context.
- **R56-R60 (worktrees)** — Work ONLY in your worktree path. Do not `cd` elsewhere. Never write to `backend-main` or `mobile`.
- **R61** — Push to GitHub every 2 minutes minimum. WIP commits welcome (`wip-autopush: <ISO>`).
- **R64** — Append journal + push at every state change.
- **R66 — Full-Suite-Before-PR.** Before final push, run `npx jest --runInBand` to completion. Log to `/home/user/workspace/v1-4-jest-full-<ISO>.log`. R66 partial runs hide cross-suite regressions — this is what killed PR #365.
- **R67** — Dispatch-state-persisted (parent's responsibility, not yours).
- **R68** — Doctrine changes need a merged ADR. v1-4 should NOT change doctrine.
- **R69 — Skipped-tests-are-red.** Any `it.skip` / `describe.skip` needs `// SKIP-BECAUSE: <reason> — owner: <name> — expires: <YYYY-MM-DD>` on the line above. Env-gated skips (`liveDbUrl() ? describe : describe.skip`) are exempt — the gate IS the reason, but the surrounding comment must still say what the gate means.
- **R70 — Fail-fast pre-push lane.** BEFORE the R66 full suite, run:
  ```bash
  npx jest test/doctrine-cleanup.spec.ts test/invariants/locked_defaults.spec.ts test/diagnostic-prompt-doctrine.spec.ts --runInBand
  ```
  Must be 15/15. If red, fix BEFORE the full suite.

**Commit hygiene (auditor checks as H1):**
```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "community: v1-4 realtime push telemetry"
```
Title-only. No body. No emoji. No `Co-Authored-By`. No `Generated-With`. Anything else → automatic DIRTY on H1.

---

## 1. Why this slice exists (the WHY)

Authoritative source: `/tmp/tgp-agent-context/COMMUNITY_PRODUCT_PLAN.md` (440 lines).

The community must feel **alive without being noisy**. Today, after v1-3, REST polling at 60s is the only refresh path — the floor. v1-4 builds the **two channels above the floor**:

1. **Supabase Realtime broadcasts** (in-app, when the app is open) — sub-second feedback for posts/messages/reactions/events/challenges/moderation/membership state changes.
2. **Expo push notifications** (out-of-app, lock-screen-aware) — for high-signal events the user opted in to. Default-off per category.

The polling floor never goes away. Realtime and push are **best-effort layers above** REST. If either fails, the user sees a stale list for ≤60s, not an empty screen.

**Telemetry** lights up PostHog instrumentation so we can prove the realtime/push layers actually moved metrics (DAU, message-to-coach-reply latency, event RSVP rate) once we flip the flags ON in staging.

---

## 2. Authoritative source documents

Read these BEFORE writing code. In this order:

1. **`/tmp/tgp-agent-context/COMMUNITY_EXECUTION_PLAN.md`** — §v1-4 PR spec at **lines 252-263**. That's the source of truth for files, flags, tests, kill switch.
2. **`/tmp/tgp-agent-context/COMMUNITY_PRODUCT_PLAN.md`** — design principles. Specifically:
   - "Ack signals, not read receipts" — no read-receipt fanout
   - "Default-quiet" — lock-screen privacy must hide bodies
   - "Best-effort realtime + REST floor" — realtime is never the source of truth
3. **`/tmp/backend-main/AGENT_RULES.md`** — rules R1-R14, R56-R70 in full.
4. **`/tmp/backend-main/docs/REPO_DOCTRINE_GUARDS.md`** — the guard test index. Do NOT add a new doctrine guard; do NOT modify an existing one. v1-4 has no doctrine implications.
5. **`/tmp/backend-main/docs/decisions/0001-community-v1-1-doctrine-collision-path-a.md`** — the ADR that codified R66-R70 after PR #365's 5-day red. Internalize the lesson: full Jest before push, persisted dispatch state, ADRs for doctrine.
6. **`/tmp/tgp-agent-context/COMMUNITY_BUILD_JOURNAL.md`** — the last 100 lines. Specifically the v1-3 closeout, which lists the gateDmRead helper pattern. Reuse that pattern for any new authorisation paths in v1-4.

---

## 3. Existing primitives to REUSE (not rewrite — anti-pattern #15)

Before writing a new file, confirm you're not duplicating one of these:

| Primitive | Path | What v1-4 must do with it |
|-----------|------|---------------------------|
| `SupabaseService.broadcastNewMessage(userId)` | `src/supabase/supabase.service.ts:43` | **EXTEND.** The proven no-PII fire-and-forget pattern. v1-4 adds `broadcastCommunityEvent(channel, event, payload)` next to it. Same swallowed-failure semantics. Same `subscribe-then-send-then-removeChannel` pattern. |
| `NotificationsService` | `src/notifications/notifications.service.ts` (712 LOC) | **EXTEND.** Already has Expo SDK wiring, PII stripping, preference defaults, push payload envelope. Add `sendCommunityPush()` that respects `FEATURE_COMMUNITY_PUSH` and uses `NotificationCategory.COACH_DIRECT` / `CLIENT_BOT` per kind. |
| `NotificationKind` | `src/notifications/notification-kind.ts` | **EXTEND.** Add the v1-4 kinds (see §6 below). One value per kind, snake_case string, no schema migration. |
| `NotificationCategory` | `src/notifications/notification-category.enum.ts` | **REUSE.** Already has COACH_DIRECT / CLIENT_BOT / MILESTONE / SYSTEM. Map community kinds onto these — do NOT add a new category. |
| `AnalyticsService` | `src/analytics/analytics.service.ts` | **REUSE.** Already has PostHog SDK + PII stripping + no-op fallback. Inject and call `track(distinctId, event, properties)`. Do not instantiate PostHog directly. |
| `CommunityFeatureFlagGuard` | `src/community/community-feature-flag.guard.ts` | **REUSE.** Already wired to `FEATURE_COMMUNITY` per v1-2. Do NOT introduce a parallel guard for v1-4 flags. v1-4 flags are checked **inside** services, not at guard level (the realtime/push surfaces are not new HTTP endpoints — they're invoked from existing flows). |
| `CommunityAccessService` | `src/community/community-access.service.ts` | **REUSE for any membership check.** Do not re-implement workspace/cohort membership lookups. |
| `gateDmRead(membership, workspace)` | `src/community/dms/community-dms.service.ts:113` | **REFERENCE PATTERN.** If you need to filter what a user sees in a broadcast subscription (you shouldn't — see §4), use this helper's repo-boundary style, not controller-level. |
| `disabled-response.dto.ts` | `src/community/dto/disabled-response.dto.ts` | **REUSE for kill-switch.** When `FEATURE_COMMUNITY_REALTIME=false`, any caller asking for the realtime channel name must get a typed disabled response, not a 404. |
| `Logger` from `@nestjs/common` | n/a | **USE for swallowed failures.** Realtime and push errors are logged at `warn`, never thrown to the caller. See §7 anti-pattern #36. |

---

## 4. Architecture — the four sub-modules

```
src/community/realtime/
├── community-realtime.module.ts          (NEW — exports RealtimeService)
├── community-realtime.service.ts         (NEW — channel name builders, broadcast wrapper)
├── community-realtime.types.ts           (NEW — typed broadcast event payloads)
└── community-realtime.spec.ts            (NEW — unit: channel names, no-PII assertion)

src/community/notifications/
├── community-notifications.module.ts     (NEW — exports CommunityNotificationsService)
├── community-notifications.service.ts    (NEW — push preference defaults + sendCommunityPush)
├── community-notifications.types.ts      (NEW — typed community push payloads)
└── community-notifications.spec.ts       (NEW — unit: preference defaults, lock-screen privacy)

src/notifications/notification-kind.ts    (MODIFY — add 7 v1-4 kinds, see §6)
src/notifications/notifications.service.ts (MODIFY only if absolutely required — prefer wrapper in community-notifications.service.ts)
src/community/community.module.ts         (MODIFY — import RealtimeModule + CommunityNotificationsModule)
src/community/messages/community-messages.service.ts (MODIFY — call broadcastCommunityEvent post-write)
src/community/posts/community-posts.service.ts        (MODIFY — call broadcastCommunityEvent post-write)
src/community/reactions/community-reactions.service.ts (MODIFY — call broadcastCommunityEvent post-write)
src/community/dms/community-dms.service.ts            (MODIFY — call broadcastCommunityEvent post-write, after gateDmRead)
src/community/moderation/community-moderation.service.ts (MODIFY — call broadcastCommunityEvent post-action)
```

**File-ownership rule:** v1-4 is the SOLE writer of every file marked NEW. v1-4 modifies the existing community sub-module services ONLY at the **post-write tail** — append a single `void this.realtime.broadcastCommunityEvent(...)` call after the existing DB write returns. Do NOT refactor the existing service methods. Do NOT change return shapes.

**Why a separate `realtime/` sub-module instead of extending `src/supabase/supabase.service.ts`?**
- Keeps `SupabaseService` as a thin Supabase-client wrapper (single responsibility).
- Lets v1-4 tests mock `RealtimeService` without mocking the whole Supabase client.
- Matches the v1-3 sub-module pattern (`messages/`, `posts/`, `reactions/`, `dms/`, `moderation/`).

---

## 5. Realtime channels (memorize these exactly)

Channel names follow the convention `community:<scope>:<id>[:<sub>]`. Builder MUST export them from `community-realtime.service.ts` as a typed const map so the auditor can grep for drift:

```ts
export const COMMUNITY_REALTIME_CHANNELS = {
  user:        (userId: string)      => `community:user:${userId}`,
  cohort:      (cohortId: string, shard: number) => `community:cohort:${cohortId}:messages:${shard}`,
  workspace:   (wsId: string)        => `community:workspace:${wsId}:hall`,
  event:       (eventId: string)     => `community:event:${eventId}`,
  challenge:   (challengeId: string) => `community:challenge:${challengeId}`,
  moderation:  (wsId: string)        => `community:moderation:${wsId}`,
} as const;
```

- `cohort` is **sharded by `shard:number`** (compute as `hash(cohortId) % 4` — exact algorithm in v1-3 messages module: `community-messages.repository.ts`). This is the only sharded channel because cohorts can have hundreds of members.
- v1-4 only BROADCASTS to these channels. Mobile (v1-5/v1-6) subscribes. There is no server-side subscription in v1-4.

---

## 6. Broadcast event names (exact spelling, do not improvise)

| Event name | Emitted from | Payload shape (NO BODY) | Channel |
|------------|--------------|--------------------------|---------|
| `community.message.created` | `community-messages.service.ts.createMessage()` post-write | `{ id, cohortId, authorId, createdAt }` | cohort(cohortId, shard) |
| `community.message.updated` | `community-messages.service.ts.updateMessage()` post-write | `{ id, cohortId, updatedAt }` | cohort(cohortId, shard) |
| `community.post.created` | `community-posts.service.ts.createPost()` post-write | `{ id, workspaceId, authorId, createdAt }` | workspace(wsId) |
| `community.post.updated` | `community-posts.service.ts.updatePost()` post-write | `{ id, workspaceId, updatedAt }` | workspace(wsId) |
| `community.reaction.changed` | `community-reactions.service.ts.react()` post-write | `{ targetType, targetId, kind, delta }` | workspace(wsId) or cohort(cohortId, shard) — derive from target |
| `community.event.state_changed` | (stub — emitter wiring; full event lifecycle is v2-3) | `{ eventId, fromState, toState, at }` | event(eventId) |
| `community.challenge.progress_changed` | (stub — emitter wiring; full challenge lifecycle is v3-1) | `{ challengeId, userId, percent }` | challenge(challengeId) |
| `community.moderation.action_created` | `community-moderation.service.ts.takeAction()` post-write | `{ actionId, wsId, targetType, targetId, action }` | moderation(wsId) |
| `community.membership.changed` | `community-access.service.ts` (or wherever join/leave lands — verify on read) | `{ wsId, userId, change: 'joined'|'left'|'promoted'|'demoted' }` | user(userId) AND workspace(wsId) |

**ABSOLUTE RULE (DIRTY-CRITICAL trigger):** broadcast payloads MUST NEVER include a message body, post body, DM body, reaction emoji string, moderation reason, challenge progress notes, or any user-authored text. Just IDs, timestamps, and enum state values. The mobile client receives the ping → refetches via REST → REST returns body content via authenticated, tenant-scoped repo.

**Auditor check:** every broadcast call site must show a payload object that an unauthenticated observer of the channel could not extract user content from. The v1-4 unit test `community-realtime.spec.ts` enforces this with `expect(payload).not.toContain(/(message|body|content|text|emoji|reason)/i)` against every typed payload shape.

---

## 7. Feature flags (3 new — all OFF in prod by default)

| Flag | Default prod | Default staging | Surface | Kill-switch behavior |
|------|--------------|-----------------|---------|-----------------------|
| `FEATURE_COMMUNITY_REALTIME` | `false` | `false` (operator flips to test) | Server: gate the `broadcastCommunityEvent` call (no-op when false). Client `/community/me` flags `community_realtime` already exists at `community.service.ts:115` — confirm it still reads from env. | When false, the server never calls Supabase Realtime. Mobile's 60s REST poll continues. |
| `FEATURE_COMMUNITY_PUSH` | `false` | `false` | Server: gate `sendCommunityPush()` in `community-notifications.service.ts` (no-op when false). | When false, no community push payloads are constructed. Standard NotificationsService continues for non-community kinds (messages, milestones, etc.). |
| `FEATURE_COMMUNITY_TELEMETRY` | `false` | **`true`** (only staging is ON by default) | Server: gate `analytics.track()` calls inside RealtimeService + CommunityNotificationsService. | When false, no PostHog events from community surfaces. AnalyticsService no-op fallback still works (POSTHOG_KEY may be unset). |

Flags are read from `process.env.*` at the **call site**, not cached at boot. This matches the pattern at `community.service.ts:115`. Reasoning: lets staging toggle without a restart.

**Add these to `community.service.ts`'s `/community/me` response** under the existing `feature_flags` object so the mobile client can subscribe conditionally:
- `community_realtime` (already there — verify)
- `community_push` (NEW — add)
- `community_telemetry` (NEW — add; mobile likely won't gate on this but include for parity)

---

## 8. Push notification rules

### 8.1 Per-kind defaults (preference defaults table)

| NotificationKind value (new) | NotificationCategory | Default channels |
|------------------------------|----------------------|-------------------|
| `community_message_received` | `COACH_DIRECT` | push: ON, inapp: ON, email: OFF |
| `community_dm_received` | `COACH_DIRECT` | push: ON, inapp: ON, email: OFF |
| `community_post_replied` | `CLIENT_BOT` | push: ON, inapp: ON, email: OFF |
| `community_event_starting_soon` | `MILESTONE` | push: ON, inapp: ON, email: OFF |
| `community_challenge_milestone` | `MILESTONE` | push: ON, inapp: ON, email: OFF |
| `community_moderation_action_against_me` | `SYSTEM` | push: ON, inapp: ON, email: ON |
| `community_membership_changed` | `SYSTEM` | push: OFF (too noisy), inapp: ON, email: OFF |

Defaults land in the same place as existing kinds — extend the matrix in `src/notifications/README.md` (per the doc comment in `notification-kind.ts` lines 9-12) AND wire defaults via the existing `NotificationPreferences` resolver in `notifications.service.ts`. **DO NOT add a migration.** Defaults are code-level, applied at the read path.

### 8.2 Lock-screen privacy (DIRTY-CRITICAL)

When the user has lock-screen privacy enabled (`User.lockscreenPrivacy === true` — verify exact field on the User model), the push payload `body` MUST be a fixed safe string per kind:

| Kind | Privacy-on body | Privacy-off body |
|------|-----------------|-------------------|
| `community_message_received` | "New community message" | "{cohortName} · new message" |
| `community_dm_received` | "New direct message" | "{senderInitial} sent you a message" |
| `community_post_replied` | "New reply on your post" | "{replierInitial} replied to your post" |
| `community_event_starting_soon` | "Event starting soon" | "{eventTitle} starts in 15 min" |

Privacy-on bodies must NEVER contain user names, message excerpts, post content, cohort names, event titles, or any tenant-scoped data. The auditor will grep every push payload constructor.

### 8.3 Idempotency

Every push send goes through `NotificationsService.createNotification()` which already writes a `Notification` row. v1-4 must pass a stable idempotency key derived from `(kind, recipientId, targetType, targetId)` so Stripe-webhook-style replays don't double-push. Reuse the existing pattern from `DRIP_RELEASED` / `COACH_NEW_PURCHASE` (see `notification-kind.ts:67-78`).

---

## 9. Telemetry — PostHog events to emit (when `FEATURE_COMMUNITY_TELEMETRY=true`)

Inject `AnalyticsService` into `RealtimeService` and `CommunityNotificationsService`. Emit AFTER successful broadcast/send. All events use `distinctId = userId` (recipient's id). All property keys snake_case.

| Event name | Properties | Emitted from |
|------------|------------|--------------|
| `community.realtime.broadcast_sent` | `{ channel_kind, event_name, payload_size_bytes }` | RealtimeService.broadcastCommunityEvent (after subscribe-send success) |
| `community.realtime.broadcast_failed` | `{ channel_kind, event_name, error_code }` | RealtimeService catch block (do NOT swallow the analytics call) |
| `community.push.sent` | `{ kind, category, privacy_on }` | CommunityNotificationsService.sendCommunityPush (after Expo accepts the ticket) |
| `community.push.skipped` | `{ kind, reason: 'flag_off'|'preference_off'|'no_token' }` | CommunityNotificationsService.sendCommunityPush (early returns) |
| `community.digest.queued` | `{ user_id, item_count }` | digest.service.ts extension (one new method `queueCommunityDigest()`) |
| `community.push.delivery_failed` | `{ kind, error_code }` | CommunityNotificationsService catch |
| `community.realtime.subscriber_count_unknown` | `{ channel }` | Optional — only if Supabase exposes a count; skip if not trivially available |

Property values must never include user-authored text or PII. AnalyticsService already strips known PII keys (`email`, `name`, `phone`, etc.) but DO NOT rely on it — pre-strip at the call site.

---

## 10. Tests required (R66 gate)

Write these BEFORE running the full suite. All in `test/community/`:

### 10.1 Unit tests (new files)

- **`test/community/realtime/broadcast-ping-contract.spec.ts`** — every typed payload shape has zero user-content fields. Use `expect(JSON.stringify(payload)).not.toMatch(/body|content|text|emoji|reason|title|excerpt/i)` for each of the 9 events.
- **`test/community/realtime/no-pii-in-broadcast.spec.ts`** — DIRTY-CRITICAL guard. Constructs each broadcast event with adversarial inputs (message body = "SECRET-LEAK-TOKEN-XYZ") and asserts the SECRET-LEAK token NEVER appears in the broadcast payload that would reach Supabase.
- **`test/community/notifications/push-preference-defaults.spec.ts`** — for each of the 7 new community kinds, assert defaults match §8.1 table.
- **`test/community/notifications/lockscreen-privacy.spec.ts`** — for each kind in §8.2, assert privacy-on body matches the safe string and privacy-off body matches the templated string.
- **`test/community/realtime/posthog-event-names.spec.ts`** — assert the 7 telemetry event names match §9 exactly (string equality on a typed const).

### 10.2 Extend existing pins

- **`test/entitlement-guards-mounted.spec.ts`** — currently 17/17 PAID_ROUTES (confirmed by reading the file). v1-4 does NOT add new paid HTTP endpoints (realtime/push are server→client side-channels, not new routes). **Do not modify this file.** If you find yourself wanting to, you've introduced a new paid endpoint that needs reconsideration — stop and discuss with the parent agent first.

  Wait — the v1-4 spec in `COMMUNITY_EXECUTION_PLAN.md` line 263 says "Entitlement guards: must bump `test/community/entitlement-guards-mounted.spec.ts` above current 17/17." The file at `test/entitlement-guards-mounted.spec.ts` (NOT `test/community/`) is the only one that exists. The execution plan's path reference is **incorrect by 11 chars** — the file lives at the repo `test/` root. Treat the requirement as: "if v1-4 adds any new paid surface, pin it here; if not, no change."

  v1-4 SHOULD NOT add any new paid surface — broadcasts are side-channels off existing paid writes (messages/posts/reactions/dms/moderation), and push is best-effort delivery off existing notifications infrastructure. **Expected result: 17/17 pin count unchanged, but the EXISTING pins must still pass.** If any existing community pin breaks because of a refactor, that's a regression — DIRTY-CRITICAL.

### 10.3 R70 fail-fast lane (must pass FIRST)

```bash
cd /home/user/workspace/tgp/backend-community-v1-4
npx jest test/doctrine-cleanup.spec.ts test/invariants/locked_defaults.spec.ts test/diagnostic-prompt-doctrine.spec.ts --runInBand
```
Must report **15/15 passing**. If red, fix before running anything else.

### 10.4 R66 full suite (must pass BEFORE final push)

```bash
cd /home/user/workspace/tgp/backend-community-v1-4
npx jest --runInBand 2>&1 | tee /home/user/workspace/v1-4-jest-full-$(date -Iseconds).log
```

Pre-existing grandfathered failures from `docs/PRE_EXISTING_TEST_FAILURES.md` (5 suites: messages-safety, v1-coach, roles-enforced, cross-tenant-isolation, check-ins) may be red, but **they must be no MORE red than on `ed78bbef`**. v1-3 base count is the bar. Note: R10 is RETIRED — the new CLEAN bar is "0 P0/P1/P2 + CI green," and these 5 are tracked separately.

### 10.5 Zero-schema-mutation gate (DIRTY-CRITICAL)

```bash
cd /home/user/workspace/tgp/backend-community-v1-4
git diff main..HEAD -- prisma/
# Expected output: empty
```
If `prisma/**` is touched at all (schema, migrations, seed), this is DIRTY-CRITICAL. v1-4 is **infra-only** — channels, events, push wiring, telemetry. Zero new tables, zero new columns. The 3 schema-PR backlog items (`dm_policy:enum`, `clientPostsEnabled:boolean`, first-class `CommunityComment` model) are explicitly **deferred** to a future schema PR.

---

## 11. The 50 failures of AI-generated code — v1-4-specific subset

Per R5. The audit will check these. Pre-empt them:

| # | Failure | v1-4 calibration |
|---|---------|------------------|
| #5 IDOR | Re-broadcast a private cohort message to the workspace channel by mistake → tenant leak | Channel derivation must read the message's `cohortId` from the DB write result, NOT from request params. Test: try to inject a foreign `cohortId` and assert broadcast goes to the correct channel. |
| #8 Phantom validation | TypeScript types for payload != runtime check | All broadcast payload constructors use Zod schemas; runtime validate before send. |
| #10 Unverified deps | New dep added without audit | v1-4 should add **zero new dependencies**. `@supabase/supabase-js`, `expo-server-sdk`, `posthog-node` are already in the lockfile. If you find yourself reaching for a new package, stop. |
| #12 Secrets in errors | Stack trace with `SUPABASE_SERVICE_ROLE_KEY` leaks into client error | Realtime errors are logged server-side at `warn`, NEVER returned to the HTTP response. The HTTP response is always the original write's success shape. |
| #17 Fake tests | `toBeDefined()` on broadcast result | Every test asserts specific values: exact channel name, exact event name, exact payload keys. |
| #24 Sync blocking | Await broadcast inside the request handler | Broadcasts must be `void`-prefixed fire-and-forget — match `messaging.service.ts:448` pattern: `void this.supabase.broadcastNewMessage(clientId);` |
| #27 Polling instead of WS | Mobile keeps polling at 60s even when realtime is ON | This is INTENDED. REST polling is the floor. Realtime is the layer above. Document this in the module-level docblock so the next builder doesn't "optimize" the poll away. |
| #29 Missing idempotency | Stripe-style replay double-sends a push | Use the existing idempotency key pattern from `DRIP_RELEASED` for push sends. |
| #34 No observability | Realtime failures silent forever | Log at `warn` level with userId + channel + error message. Emit `community.realtime.broadcast_failed` PostHog event. |
| #35 Missing timeout | broadcast hangs on Supabase outage | Reuse the 1500ms timeout pattern from `broadcastNewMessage` (see `supabase.service.ts:50`). |
| #36 Silent failures | catch(e){} on broadcast errors | NEVER. Always log at `warn` with context, even though we don't surface to caller. |
| #44 No transactions | Push send happens before DB commit, then commit fails → push sent for nonexistent message | Broadcast and push are fire-and-forget AFTER the DB write returns. They don't enter the transaction. If the DB write rolls back, the broadcast/push were never queued because the post-write tail wasn't reached. |
| #50 No graceful degradation | Supabase outage breaks the whole write path | Realtime is wrapped in try/catch with logged-and-swallowed failure. The DB write's HTTP response is unaffected. |

---

## 12. Out of scope — DO NOT DO

- **Do NOT modify `prisma/schema.prisma`** or any file in `prisma/`. v1-4 is schema-frozen.
- **Do NOT add `it.skip`** for any test. If a test is genuinely env-gated (Supabase Realtime requires a live URL for the broadcast-actually-reaches-channel integration test), use the `liveDbUrl() ? describe : describe.skip` pattern and add a surrounding comment explaining what the gate means (R69 carve-out).
- **Do NOT build the v1-5 mobile subscriber.** That's v1-5's job. v1-4 ends at "broadcast leaves the server."
- **Do NOT build the v2-3 event lifecycle state machine.** v1-4 wires the broadcast event name `community.event.state_changed` but the actual state transitions (`tomorrow → live → reflected`) come in v2-3.
- **Do NOT build the v3-1 challenge progress tracker.** Same logic — wire the event name only.
- **Do NOT add a new feature flag guard** at the controller level. The 3 v1-4 flags are checked **inside services** at the call site. The HTTP layer doesn't change.
- **Do NOT touch `community.controller.ts`.** No new endpoints in v1-4. (The `/community/me` flag additions go in the service, not the controller.)
- **Do NOT touch `growth-project-mobile`.** That repo isn't even cloned to the sandbox.
- **Do NOT introduce SMS or any non-Expo push provider.** Decided/settled: Expo only.
- **Do NOT remove or "consolidate" the existing `broadcastNewMessage` in `supabase.service.ts`.** It serves the legacy 1:1 messaging flow. Build alongside, not on top.

---

## 13. Done definition

You're done when ALL of these are true on your worktree HEAD:

- [ ] Branch `feature/community-v1-realtime-push` exists, pushed to `origin`
- [ ] PR is open against `main` with title `community: v1-4 realtime push telemetry`
- [ ] PR body is empty (auditor's H1 check)
- [ ] `git diff main..HEAD -- prisma/` is empty
- [ ] R70 fail-fast lane: 15/15 passing
- [ ] R66 full Jest suite: green (modulo pre-existing red suites per docs/PRE_EXISTING_TEST_FAILURES.md), log saved to `/home/user/workspace/v1-4-jest-full-<ISO>.log`
- [ ] `test/entitlement-guards-mounted.spec.ts` still passes 17/17
- [ ] All 5 new test files (§10.1) green
- [ ] All 9 broadcast event names emit from the right service tail
- [ ] All 7 community push kinds wired with defaults
- [ ] All 7 PostHog event names emit when `FEATURE_COMMUNITY_TELEMETRY=true`
- [ ] All 3 flags default OFF in prod (env-read at call site, not boot)
- [ ] No new dependencies added (`package.json` `dependencies` and `devDependencies` byte-identical to base + nothing new)
- [ ] No silent failures (every catch logs + telemetry-fires)
- [ ] Commit messages: `community: v1-4 realtime push telemetry` (one per logical chunk; squash on merge)
- [ ] Authored as Dynasia G `<dynasia@trygrowthproject.com>`
- [ ] Zero `Co-Authored-By` / `Generated-With` trailers
- [ ] Zero references to "sonnet" anywhere in commits or comments
- [ ] Build report written to `/home/user/workspace/COMMUNITY_V1-4_BUILD_REPORT.md` with: SHA, line count, endpoint count (expected: 0 new HTTP endpoints), R70 result, R66 result, list of files added/modified, and any judgment calls

---

## 14. When you're done

1. Final WIP-autopush per R61.
2. Open PR with `gh pr create --title "community: v1-4 realtime push telemetry" --body "" --base main` (use `api_credentials=["github"]`).
3. Write build report to `/home/user/workspace/COMMUNITY_V1-4_BUILD_REPORT.md`.
4. Return: PR number, head SHA, R70 result (15/15 expected), R66 result (X/Y passing with pre-existing reds noted), zero-schema-diff confirmation, list of new files.

**Do NOT merge.** The parent agent will dispatch a fresh GPT-5.5 R1 auditor against your PR. You may go DIRTY on R1 — that's expected and normal. The cycle handles it.

---

## 15. Reference files (open these as you build)

- `/tmp/backend-main/src/supabase/supabase.service.ts` — the broadcastNewMessage template
- `/tmp/backend-main/src/notifications/notifications.service.ts` — the push template (712 LOC, read it)
- `/tmp/backend-main/src/notifications/notification-kind.ts` — extend this
- `/tmp/backend-main/src/notifications/notification-category.enum.ts` — reuse, do not extend
- `/tmp/backend-main/src/analytics/analytics.service.ts` — telemetry template
- `/tmp/backend-main/src/community/dms/community-dms.service.ts` — the gateDmRead pattern (line 113)
- `/tmp/backend-main/src/community/messages/community-messages.service.ts` — where to add the broadcast tail
- `/tmp/backend-main/src/messaging/messaging.service.ts:448` — the `void this.supabase.broadcastNewMessage(...)` fire-and-forget call site
- `/tmp/tgp-agent-context/COMMUNITY_EXECUTION_PLAN.md` lines 252-263 — the v1-4 source-of-truth spec
- `/tmp/tgp-agent-context/COMMUNITY_PRODUCT_PLAN.md` — the WHY
- `/tmp/backend-main/AGENT_RULES.md` — R1-R14, R56-R70

You are one builder in a chain of ~100. Do v1-4 right. Slow is smooth, smooth is fast.
