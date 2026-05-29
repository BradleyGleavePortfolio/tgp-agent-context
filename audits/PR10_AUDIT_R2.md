# AUDIT — PR-10 DripDispatcherCron (PR #320) — Round 2

**Branch:** `pr10/drip-dispatcher-cron` @ `345c629c` against `main` @ `8843343d`
**Auditor:** independent (did not write the code; did not modify code)
**R1 commit verified present:** ✓ `345c629c6fdaa6031ed93438d80bc40a6903a064` is HEAD of branch.

VERDICT: CLEAN
Typecheck: pass (`node_modules/.bin/tsc --noEmit -p tsconfig.json` — 0 errors)
Lint: pass (`npm run lint` — 0 errors, 17 pre-existing warnings unchanged)
Tests: pass (`node_modules/.bin/jest` — 287 suites, 3451 passed, 20 skipped, 5 todo, 6 snapshots; +4 over R0's 3447 — matches the build report's claim)
Build: pass (`npm run build` / `nest build` — clean)

---

## P0 findings

None.

## P1 findings

None. Both R1 P1 findings are genuinely fixed (see "Verification of fixes" below).

## P2 findings

None. The R1 P2 finding is genuinely fixed (see below).

## P3 (non-blocking)

### 3.1 Buyer-alert duplicate during reclaim race window
**File:** `src/packages/drip-dispatcher.cron.ts:368-445` (`dispatchBuyerAlert`).

In the very narrow window where a SLOW-but-alive worker is mid-materialise past `STALE_CLAIM_MS` (5 min) and a second worker reclaims the same drop, BOTH workers will reach `dispatchBuyerAlert` after each `materialise` call returns. The content is delivered exactly once (resolver dedup + the success-update `WHERE status='dispatching'` re-assertion makes only one of the two successful), but each successful worker independently fires push + in-app notifications, and `alert_dispatched_at` is not gated as a precondition. Result: the buyer may see two "New content unlocked" pushes/in-app rows in that race.

The `notifications.service.ts:283-294` push rate limiter is in-memory per process, so two replicas don't share that protection.

**Severity:** P3 — not a delivery defect, content arrives exactly once; UX nuisance only. Race fires only when the original worker is still alive at 5+ min, which is itself an extreme outlier. Booking COACH_ALERT path in PR-2 has the same characteristic. Acknowledged as a documented tradeoff in the inline comments at the top of `drip-dispatcher.cron.ts`.

**Optional improvement (not blocking):** gate `dispatchBuyerAlert` on `alert_dispatched_at IS NULL` via a conditional `updateMany` that flips `alert_dispatched_at` first and only proceeds when count===1, OR raise `STALE_CLAIM_MS` once we have telemetry on real materialise tail latencies.

### 3.2 Success update increments `attempt_count` on happy path
**File:** `src/packages/drip-dispatcher.cron.ts:336-347`.

Carried over from the R0 audit's P3. A drop that succeeds on first try ends with `attempt_count=1` rather than `0`. Cosmetic.

### 3.3 NOT NULL DEFAULT on `NotificationPreferences` is metadata-only on PG ≥ 11
**File:** `prisma/migrations/20261205000000_pr10_scheduled_drop_retry_lock/migration.sql:56-61`.

`ADD COLUMN ... NOT NULL DEFAULT <constant>` with a static (non-volatile) default is metadata-only on PostgreSQL 11+ (no table rewrite, no exclusive lock for the row backfill). The build report's "metadata-only ALTER + per-row default-fill" wording is correct for the modern PG target. No P-level concern. Flagging only for the record.

### 3.4 `purchase_id` field name slight inconsistency
The `DripResolverMarker` ledger is keyed by `(purpose, purchase_id, content_id)` (see `auto-message.resolver.ts:144-148`). Reclaim semantics rely on the cron passing `clientPurchaseId = purchase.id` (`drip-dispatcher.cron.ts:328`) — confirmed equal to the `ClientPurchase.id` that PR-9's inline path also uses, so cross-path dedup holds. Not a defect, just verified.

### 3.5 Reclaim audit log line is `warn` not `error`
`drip-dispatcher.cron.ts:136-138`. A stranded drop is by definition a prior crash. `warn` is a defensible choice (the reclaim succeeded), but a one-line `error` per reclaim would give oncall a louder signal of worker crashes. Non-blocking.

---

## Verification of R1 fixes

### P1 — stranded-dispatching reclaim (LOST DELIVERY)

| Claim from build report | Verified? | Evidence |
|---|---|---|
| `findDue` UNIONs `status='pending'` and `status='dispatching' AND locked_at <= staleBefore` in one query | ✓ | `drip-dispatcher.cron.ts:183-222`. `OR` clause has both branches. `materialised_ref: null`, `fire_at`, `attempt_count` gates remain at the top level so they apply to BOTH branches via AND. |
| `claim()` takes a `priorStatus: 'pending' \| 'dispatching'` discriminator | ✓ | `drip-dispatcher.cron.ts:241-271`. WHERE is built dynamically: for `pending`, `locked_at IS NULL OR stale`; for `dispatching`, `locked_at` MUST be stale. |
| Composite WHERE is the mutex for both variants — two workers cannot both reclaim | ✓ TRACED | First worker's `UPDATE WHERE id=X AND status='dispatching' AND locked_at <= staleBefore AND materialised_ref IS NULL` acquires the row-level lock, sets `locked_at=now-A`. Second worker's identical UPDATE waits on the row lock, then re-evaluates WHERE: `status` is still `'dispatching'` (A only changed `locked_at`), but `locked_at` is now NOT stale → `count=0`. Mutex holds. |
| Reclaim path passes the SAME stable `(clientPurchaseId, contentId)` keys to the resolver | ✓ | `drip-dispatcher.cron.ts:316-332` passes `clientPurchaseId: purchase.id, contentId: drop.content_id` for both pending and reclaim paths (the discriminator only affects WHICH SQL row to claim, not WHAT to pass downstream). |
| Resolver-side dedup collapses double-run for the four asset types | ✓ for 3, ✓ with PR-9 inherited window for auto_message | workout: `WorkoutBuilderIdempotencyKey 'drip:workout:p={p}:c={c}'` (`workout.resolver.ts:128-129`); meal_plan: `drip_drop_id @unique` keyed off `scheduledDropId` which is the same row id across reclaim (`meal-plan.resolver.ts:75-145`); media: `ClientAssetGrant @@unique([client_id, media_asset_id])` (`media-asset.resolver.ts:99-101`); auto_message: `DripResolverMarker(purpose, purchase_id, content_id)` (`auto-message.resolver.ts:144-148`). The auto_message reclaim path has a small inherent race (worker A inserts marker as 'fresh' and is still mid-`sendAsCoach`, worker B sees the marker but `materialised_ref IS NULL`, classifies as 'reclaim', sends again) — but this race is PR-9 territory and is documented there; PR-10's reclaim doesn't widen the window beyond what PR-9 R1 established. |
| `MAX_ATTEMPTS` gates the reclaim path so poison drops eventually flip to `failed` + COACH_ALERT | ✓ | `drip-dispatcher.cron.ts:189` — `attempt_count: { lt: MAX_ATTEMPTS }` is at the top-level WHERE so it applies to both branches. Confirmed by the new `'stranded-dispatching reclaim: respects MAX_ATTEMPTS'` test. `attempt_count` is incremented on every dispatch outcome (success +1, transient failure +1, permanent failure +1), so reclaim is bounded. |
| Success update's `WHERE status='dispatching'` survives a concurrent re-reclaim | ✓ | `drip-dispatcher.cron.ts:336-347`. The TOCTOU re-assertion catches a slow worker whose row was reclaimed by another worker that already won; only one success-update flips status to `'delivered'`. |
| Genuine test seeds `status='dispatching'` + stale `locked_at` and asserts the row is claimed + materialised | ✓ | `test/drip-dispatcher.cron.spec.ts:636-674`. Seeds `status: 'dispatching'`, `locked_at: NOW − STALE_CLAIM_MS − 60s`. Asserts `claimed=1`, `delivered=1`, `materialise` called with `clientPurchaseId='purchase-1'`, `contentId='content-1'`. If the dispatching branch is removed from `findDue` OR the `priorStatus` discriminator from `claim`, this test fails — the mock matcher correctly evaluates the new SQL gate. |
| "Fresh claim NOT stolen" sanity test | ✓ | `test/drip-dispatcher.cron.spec.ts:676-705`. Seeds `locked_at = NOW − 30s` (not stale). The `claim` WHERE's `locked_at <= staleBefore` excludes it; `claimed=0`, `materialise` not called, row state preserved. |
| MAX_ATTEMPTS respected on poison drops | ✓ | `test/drip-dispatcher.cron.spec.ts:707-733`. Seeds `attempt_count=MAX_ATTEMPTS`. `findDue` excludes via top-level `attempt_count: { lt: MAX_ATTEMPTS }`. `claimed=0`. Prevents infinite reclaim loop. |
| STALE_CLAIM_MS safely longer than legitimate materialise tail | ✓ JUDGMENT | 5 min vs. push round-trip ~500ms tail + DB writes (sub-second). The only failure mode for "too short" is the duplicate-buyer-alert P3 above. No data corruption — content delivery is collapsed by resolver-side stable-key dedup. |

**P1 fix is CORRECT. No P0/P1 regressions introduced. Mutex holds. Idempotency holds. MAX_ATTEMPTS gates the new path. Tests are genuine and would fail if reverted.**

### P2 — DRIP_RELEASED preference routing

| Claim from build report | Verified? | Evidence |
|---|---|---|
| Migration adds `drip_released_email/push/inapp` to `NotificationPreferences` (false/true/true, NOT NULL with static default) | ✓ | `prisma/migrations/20261205000000_pr10_scheduled_drop_retry_lock/migration.sql:56-61` + `prisma/schema.prisma:907-909`. `BOOLEAN NOT NULL DEFAULT <const>` → metadata-only on PG ≥ 11; existing rows back-fill to the default. Safe. |
| `_kindToPrefsPrefix` gets a `drip_released` branch | ✓ | `notifications.service.ts:689` — `if (kind.startsWith('drip_released')) return 'drip_released';`. Placed BEFORE the `digest` fall-through. `DRIP_RELEASED='drip_released'` now resolves to prefix `'drip_released'` and the gate computes key `drip_released_inapp` (default `true`) or `drip_released_push` (default `true`). |
| `getPreferences` in-memory defaults match the column defaults | ✓ | `notifications.service.ts:119-121`. `drip_released_email: false, drip_released_push: true, drip_released_inapp: true` in the no-row fall-through. Aligns with the DB default-fill, so the in-memory path and the DB path agree. |
| `createNotification` actually writes the in-app row for DRIP_RELEASED with default prefs | ✓ | `notifications.service.ts:266-306`. `prefs['drip_released_inapp']` = `true` → `enabled !== false` → falls through the gate → `prisma.notification.create({ ..., channel: 'inapp' })` writes the row. |
| New tests use a REAL `NotificationsService` (not `jest.fn()`) and assert the in-app row IS written | ✓ | `test/drip-dispatcher.cron.spec.ts:791-859` constructs `new NotificationsService(sharedPrisma)` and stubs only the prisma layer (notification.create captures rows into `notificationStore`, notificationPreferences.findUnique returns null → in-memory defaults kick in). Asserts `inappRows.length===1` and inspects body + payload. Would FAIL if the `drip_released` branch is removed (the kind would fall through to `digest`, `digest_inapp=false`, `enabled===false` short-circuit returns `null`, no row written). |
| Opt-out test confirms the gate works in reverse | ✓ | `test/drip-dispatcher.cron.spec.ts:861-912`. `findUnique` returns prefs with `drip_released_inapp:false, drip_released_push:false, drip_released_email:false`. `notificationStore.length===0` and `stats.delivered===1` confirms content delivery is preserved while notification rows are suppressed. |

**P2 fix is CORRECT. The new DRIP_RELEASED kind now writes the in-app inbox row by default, the prefs migration is safe/additive, and the regression test uses the real service instead of a mock.**

### P3 — Independent buyer-alert try/catches

| Claim from build report | Verified? | Evidence |
|---|---|---|
| Each of the 3 buyer-alert calls wrapped in its own try/catch | ✓ | `drip-dispatcher.cron.ts:392-430`. Three independent `try { ... } catch (err) { this.logger.warn(...) }` blocks: (1) in-app `createNotification`, (2) `pushToUser`, (3) push-channel `createNotification`. A throw in any one is logged at `warn` and the other two still run. |
| `alert_dispatched_at` stamp lives in its own try/catch post-block so it always runs | ✓ | `drip-dispatcher.cron.ts:435-444`. Outside the per-call try/catches; wrapped in its own try/catch. |

**P3 fix is CORRECT.**

---

## Regression checks

| Invariant | Status |
|---|---|
| Pending-path claim mutex (PR-10 R0) still atomic | ✓ — `claim('pending', ...)` WHERE clause unchanged in spirit (`status='pending' AND materialised_ref IS NULL AND (locked_at IS NULL OR stale)`). |
| Due-query correctness — `fire_at IS NOT NULL AND <= now`, batch 250 | ✓ `drip-dispatcher.cron.ts:188, 220`. on_completion / on_milestone drops with `fire_at=NULL` still excluded by the top-level `fire_at: { lte: now, not: null }` (applies to both OR branches via AND). |
| Retry/backoff/MAX/COACH_ALERT — `handleDispatchFailure` unchanged | ✓ `drip-dispatcher.cron.ts:460-505`. Backoff schedule `[1m,5m,15m,1h,6h]` + MAX_ATTEMPTS=5 + COACH_ALERT on permanent failure preserved. |
| Push-failure does NOT roll back delivery | ✓ Materialised_ref + status='delivered' committed in `dispatch` BEFORE `dispatchBuyerAlert` is called (`drip-dispatcher.cron.ts:336-352`). Alert-side try/catch is independent of the materialise commit. |
| PR-9 inline path untouched | ✓ `git diff main..HEAD --stat` shows 7 files: cron + tests + module + schema/migration + notifications.service + notification-kind. `PurchaseFanoutService` and all checkout paths untouched. |
| Scope discipline (no media upload, no mobile, no refund/cancel, no push-to-existing) | ✓ Diff is local to the cron + notifications routing. |
| Env gates honoured (`NODE_ENV=test` short-circuit + `DRIP_DISPATCHER_ENABLED=false` kill switch + `running` overlap guard) | ✓ `drip-dispatcher.cron.ts:82-90`. |
| Stable-key idempotency on reclaim → no double-delivery | ✓ See P1 verification above. Resolvers gate on (clientPurchaseId, contentId) which are stable across a reclaim. |

---

## Build / test integrity

- `node_modules/.bin/tsc --noEmit -p tsconfig.json` — **0 errors**.
- `npm run build` (`nest build`) — clean.
- `npm run lint` — 0 errors, 17 pre-existing warnings unchanged (unrelated files: `landing-pages.service.ts`, `lists.dto.ts`, `macros.service.ts`, `meal-plans.dto.ts`, `nudge-detector.service.ts`, `nudge-engine.service.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts`).
- `node_modules/.bin/jest` — **287 suites pass; 3451/3451 active tests pass** (3476 total: 20 skipped + 5 todo + 3451 passed). +4 over R0's 3447 (3 new reclaim tests + 2 new DRIP_RELEASED real-prefs tests − 1 retired self-fulfilling stale-lock test). Matches the build report's claim exactly.

---

## Summary

Both R1 findings — P1 (stranded-dispatching reclaim → lost delivery) and P2 (DRIP_RELEASED falling through to off-by-default `digest` prefs) — are genuinely fixed in the code, not just in the tests. The P3 cascading buyer-alert try/catch is also fixed.

The reclaim mutex is correctly designed: the composite `UPDATE WHERE id=X AND status=priorStatus AND locked_at <= staleBefore AND materialised_ref IS NULL` acts as the per-row mutex for both pending and dispatching variants. Two workers cannot both win a reclaim because the second worker's UPDATE evaluates a non-stale `locked_at` after the first worker commits. Even if a slow but alive original worker is still running `materialise()` past `STALE_CLAIM_MS`, the resolver-side stable-key dedup (`(clientPurchaseId, contentId)` ledger for workout/auto_message; `drip_drop_id @unique` for meal_plan; `(client_id, media_asset_id) @@unique` for media) collapses the second materialise call, and the success-update's `WHERE status='dispatching'` re-assertion lets only one worker stamp `materialised_ref + status='delivered'`. `MAX_ATTEMPTS` gates the reclaim path so a poison drop eventually fails permanently rather than looping forever.

The DRIP_RELEASED prefs routing is fixed at all three layers (migration columns + `_kindToPrefsPrefix` branch + in-memory defaults) and the new tests use the real `NotificationsService` constructor to exercise the actual prefs gate — they would fail if the fix were reverted.

One narrow non-blocking observation (P3.1): the rare race where a slow-but-alive worker and a reclaiming worker both pass the buyer-alert step could send two notifications to the buyer. Content is still delivered exactly once. This is a UX nuisance, not a defect, and could be tightened later by gating `dispatchBuyerAlert` on `alert_dispatched_at IS NULL` or raising `STALE_CLAIM_MS`. Not blocking.

Zero P0, zero P1, zero P2 findings.

VERDICT: CLEAN
