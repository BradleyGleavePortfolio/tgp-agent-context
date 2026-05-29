# AUDIT — PR-10 DripDispatcherCron (PR #320)

**Branch:** `pr10/drip-dispatcher-cron` @ `788aa55f` against `main` @ `8843343d`
**Auditor:** independent (did not write the code; did not modify code)

VERDICT: NOT CLEAN
Typecheck: pass (`node_modules/.bin/tsc --noEmit -p tsconfig.json` — 0 errors)
Lint: pass (`npm run lint` — 0 errors, 17 pre-existing unrelated warnings)
Tests: pass (`node_modules/.bin/jest` — 287 suites, 3447/3447 active pass, 20 skipped, 5 todo, +19 new vs `main` 3428 — matches claim)
Build: pass (`npm run build` — clean)

---

## P0 findings
None.

## P1 findings

### 1. Stuck-`dispatching` lost delivery — stale-claim recovery is effectively dead code
**File:** `src/packages/drip-dispatcher.cron.ts:157-177` (`findDue`) + `:188-207` (`claim`) + `:387-414` (`handleDispatchFailure`).

The `claim` step does:
```ts
data: { status: 'dispatching', locked_at: now }
```
so a claimed-but-not-yet-finished drop is `status='dispatching'`.

`findDue` filters on `status: 'pending'` (line 161). The "stale lock recovery" OR clause on `locked_at` (lines 169-171) is only checked alongside `status='pending'`, so a drop with `status='dispatching'` is NEVER re-picked by `findDue` regardless of how stale `locked_at` is.

`handleDispatchFailure` is the only place that flips a `dispatching` row back to `pending`, and it clears `locked_at` at the same time (`locked_at: null` lines 408 and 424). So a `pending` row will never carry a non-null stale `locked_at` via the normal failure path either.

**Net effect:** if a worker process crashes (SIGKILL, OOM, k8s eviction, deploy roll, unhandled rejection) AFTER `claim` returned success and BEFORE either `dispatch` finishes the success-update or `handleDispatchFailure` resets status, the drop is permanently stuck at `status='dispatching'` and is **never re-attempted**. No retry. No COACH_ALERT. No log line. The buyer silently never gets the content. This is exactly the lost-delivery class the brief flags as P1.

The build report (b) claims: "A 5-minute stale-claim cutoff lets a crashed worker's claim expire so a drop never gets stuck." — that claim is **false** given the actual `findDue` predicate. The stale-claim recovery test at `test/drip-dispatcher.cron.spec.ts:618-640` ("stale lock recovery: a drop locked > STALE_CLAIM_MS ago IS reclaimable") seeds the row with `status: 'pending'`, which sidesteps the real scenario — a crash leaves it `status='dispatching'`, and that case is not tested. The test is **self-fulfilling**.

**Fix recommendation:** widen `findDue` to also pick up dispatching+stale rows, OR add a separate stale-sweep that resets them back to `pending`:
```ts
// option A: union into findDue
where: {
  OR: [
    { status: 'pending', /* …existing gates… */ },
    {
      status: 'dispatching',
      locked_at: { lte: staleBefore },
      materialised_ref: null,
      attempt_count: { lt: MAX_ATTEMPTS },
    },
  ],
}
```
plus a test that simulates a mid-dispatch crash (claim, abort, advance clock past `STALE_CLAIM_MS`, re-tick, assert the drop materialises).

---

## P2 findings

### 2. `DRIP_RELEASED` in-app inbox row will NEVER be written — preference routing falls through to `digest_*` defaults which are `false`
**Files:** `src/notifications/notification-kind.ts:71` (new kind), `src/notifications/notifications.service.ts:269-274` (gate) + `:659-679` (`_kindToPrefsPrefix`) + `:78-117` (default prefs).

`NotificationKind.DRIP_RELEASED = 'drip_released'` is added (`notification-kind.ts:71`) but `_kindToPrefsPrefix` (`notifications.service.ts:659-679`) has **no `drip*` branch**. The string `'drip_released'` falls through every `startsWith` check and hits the `return 'digest'` safe-default at line 678.

`createNotification` then computes `enabledKey = 'digest_inapp'` (or `'digest_push'` for the second call) and reads it off prefs. Default prefs (`notifications.service.ts:113-115`):
```ts
digest_email: true,
digest_push: false,
digest_inapp: false,
```
Both are `false`, so the `if (enabled === false) return null;` (line 272) **silently short-circuits**. The buyer never gets an inbox row when content unlocks. Raw `pushToUser` (line 461) doesn't gate on prefs, so push still fires — but the in-app inbox/badge UX is broken for every drip release.

The brief explicitly requires "push + in-app notification ('New content unlocked: {title}')". The notification-kind file's own comment (lines 7-13) reminds the developer to (1) add a matrix row and (2) **add per-kind channel defaults to NotificationPreferences migration**. Neither was done.

The test at `test/drip-dispatcher.cron.spec.ts:202-244` asserts `createNotification` was called twice with channels `['inapp', 'push']` — but the mock is `jest.fn()` (line 194) and doesn't run the real `_kindToPrefsPrefix` / prefs check, so the test is **self-fulfilling**. Against the real `NotificationsService` the calls return `null` and no row is written.

**Severity:** P2, not P1, because content is still delivered (resolver wrote the assignment/message/grant) and Expo push still fires; only the in-app inbox row is missing. But the brief's stated UX invariant is violated, and oncall has no inbox audit trail of drip releases.

**Fix recommendation:** add a `if (kind.startsWith('drip')) return 'drip_released';` branch in `_kindToPrefsPrefix` AND add `drip_released_inapp`, `drip_released_push`, `drip_released_email` columns + defaults to `NotificationPreferences` (migration). At minimum, route `drip_released` to the `coach_alert` or a new prefix whose defaults are `true`. Add an integration-style test that builds the real `NotificationsService` (not a jest.fn mock) and asserts a `Notification` row is actually written for a DRIP_RELEASED.

---

### 3. Buyer alert sequence aborts on first throw — push can be skipped by an earlier in-app failure
**File:** `src/packages/drip-dispatcher.cron.ts:312-351`.

Inside the single `try`:
```ts
await this.notifications.createNotification({ channel: 'inapp', ... });  // 1
await this.notifications.pushToUser(...);                                  // 2
await this.notifications.createNotification({ channel: 'push',  ... });   // 3
```

If call #1 throws, the catch at line 352 swallows it but #2 and #3 never run. The brief says push failure must not un-deliver content (✓ — `materialised_ref` is already committed), but it also says the buyer should get push + in-app. A failure in the FIRST call masks BOTH the push send and the second DB row write. In production this could happen on a transient `prisma.notification.create` blip and silently skip the push.

**Severity:** P2 (degraded UX under partial-failure, not a delivery bug — the brief's explicit invariant is preserved).

**Fix recommendation:** wrap each of the three calls in its own try/catch so a failure in one doesn't cascade. Or fire push first and inapp after.

---

## P3 (non-blocking)

- `test/drip-dispatcher.cron.spec.ts:324-349` — the "concurrency: two simultaneous dispatch passes" test uses an in-memory mock whose `updateMany` is a sync `for` loop. `Promise.all([cron.runOnce, cron.runOnce])` serialises at the JS event-loop level, so the test passes because of JS single-threading, not because of real Postgres row-locking semantics. The real `claim` design IS sound (one SQL `UPDATE` with `WHERE status='pending'` is atomic on the row), but the test is self-fulfilling and would still pass even if the SQL ordering were wrong. (Nit, not a defect — the production code is correct.)

- `src/packages/drip-dispatcher.cron.ts:272-283` — the success update increments `attempt_count` (`{ increment: 1 }`) on a successful first delivery. So a healthy drop ends life with `attempt_count=1` rather than `0`. Cosmetic — does not affect the `< MAX_ATTEMPTS` gate. Slight log noise.

- `src/packages/drip-dispatcher.cron.ts:393-394` — `nextAttempt = drop.attempt_count + 1; isPermanent = nextAttempt >= MAX_ATTEMPTS`. Combined with the `findDue` gate `attempt_count < MAX_ATTEMPTS`, a drop is picked up at `attempt_count=4` and on failure flips to `attempt_count=5` + status=failed. Math checks out and matches the documented 5-attempt envelope.

- `src/packages/drip-dispatcher.cron.ts:82-89` — the env gate is `NODE_ENV === 'test'` OR `DRIP_DISPATCHER_ENABLED === 'false'`. The default (env unset) ENABLES the cron in production — correct (a misconfigured gate would silently halt every delivery; this fails-open). Confirmed matches the prior cron pattern.

---

## Verification of PR claims

| Build-report claim | Verified? |
|---|---|
| `@Cron(CronExpression.EVERY_MINUTE)` with `running` overlap guard + `NODE_ENV=test`/`DRIP_DISPATCHER_ENABLED=false` env gates | ✓ `drip-dispatcher.cron.ts:81-109` |
| Claim via atomic conditional `updateMany` flipping pending→dispatching, stamping locked_at | ✓ `drip-dispatcher.cron.ts:188-207`. WHERE composite is correct mutex IN POSTGRES (test only covers JS-serial path) |
| 5-minute stale-claim cutoff recovers crashed workers | ✗ **FALSE.** `findDue` excludes `status='dispatching'` rows regardless of `locked_at` age; see P1 finding #1 |
| Due-drop query gates: status=pending, fire_at IS NOT NULL AND ≤ now, materialised_ref IS NULL, attempt_count<5, next_retry_at gate, locked_at stale-OR-null | ✓ `drip-dispatcher.cron.ts:157-177` |
| `fire_at IS NOT NULL` excludes on_completion/on_milestone | ✓ `drip-dispatcher.cron.ts:163` |
| Cron passes BOTH stable `(clientPurchaseId, contentId)` AND `scheduledDropId` to resolver — matches PR-9 R1 idempotency | ✓ `drip-dispatcher.cron.ts:253-268`. Resolver interface at `assignable-asset-resolver.interface.ts:55-75` documents the contract |
| Success update re-asserts `status='dispatching'` (TOCTOU guard) | ✓ `drip-dispatcher.cron.ts:272-283` |
| Push failure NEVER un-delivers content (`alert_dispatched_at` stamped in finally) | ✓ `drip-dispatcher.cron.ts:357-371`. Materialised_ref + delivered status committed BEFORE alert call |
| Buyer push + in-app alert reuses NotificationsService — same envelope as PR-2 transfer.failed | ✓ for kind/channel shape; ✗ for actual delivery — see P2 finding #2 (`_kindToPrefsPrefix` doesn't route `drip_released`, so in-app rows silently skipped) |
| Exponential backoff `[1m, 5m, 15m, 1h, 6h]`, MAX_ATTEMPTS=5 | ✓ `drip-dispatcher.cron.ts:49-61` |
| Permanent failure sends COACH_ALERT via NotificationsService — same kind/channel as billing.service.ts:1115 | ✓ `drip-dispatcher.cron.ts:439-478`. `coach_alert` kind routes correctly via `_kindToPrefsPrefix` (`coach_alert_inapp` default=true). COACH_ALERT works |
| COACH_ALERT side-effect failure does NOT bubble back into cron | ✓ `drip-dispatcher.cron.ts:471-477` |
| Migration is additive only (3 nullable cols + 1 index, no DROP/RENAME/NOT-NULL) | ✓ `prisma/migrations/20261205000000_pr10_scheduled_drop_retry_lock/migration.sql:33-38` |
| Module wires NotificationsModule + DripDispatcherCron | ✓ `src/packages/packages.module.ts:1-57` |
| PurchaseFanoutService / inline path NOT touched | ✓ — diff stat shows only 6 files; PurchaseFanoutService not among them |
| 19 new tests, 3447/3447 active pass | ✓ verified by running jest |
| Build + tsc + eslint clean | ✓ verified |

---

## Summary

The production-code logic is well-structured and matches the brief on most invariants. Two real issues block merge:

1. **P1** — the "stale-claim recovery" is not implemented; a worker crash mid-dispatch permanently strands a drop in `status='dispatching'` and is never retried (lost delivery).
2. **P2** — the new `DRIP_RELEASED` notification kind has no preferences-prefix mapping, so the in-app inbox row silently does not get written; the test mock hides this because it doesn't run the real preference gate.

Both are introduced by this PR. Both have small, targeted fixes. After the fixes land + a test for each (mid-dispatch crash recovery; real `NotificationsService` exercises DRIP_RELEASED), the PR should clear.

VERDICT: NOT CLEAN
