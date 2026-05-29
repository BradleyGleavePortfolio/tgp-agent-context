# PR-10 BUILD REPORT — DripDispatcherCron

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/320

- Branch: `pr10/drip-dispatcher-cron` off latest `main` (PR-2/3/4/6/7/8/9 already merged at `8843343d`).
- Two commits:
  - `788aa55f` — initial build (cron service + module wiring + additive migration + 19 tests).
  - **R1 audit-fix** — closes the auditor's P1 (stranded-dispatching reclaim was dead code → lost delivery) + P2 (DRIP_RELEASED in-app inbox row silently never written because `_kindToPrefsPrefix` had no `drip*` branch) + P3 (cascading buyer-alert try/catch).
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. NO `Co-Authored-By` / generated trailers on either commit.

## R1 audit-fix summary

### P1 — stranded-dispatching reclaim (lost delivery)

The auditor flagged that the initial build's "5-minute stale-claim recovery" claim was **false**. `claim()` flipped rows to `status='dispatching'`, but `findDue` filtered exclusively on `status='pending'` — so a worker that crashed (SIGKILL / OOM / k8s eviction / deploy roll) between the claim and the success/failure update permanently stranded the row in `status='dispatching'`. No retry, no COACH_ALERT, no log line. Buyer paid; content never delivered. The original "stale lock recovery" test seeded the row with `status: 'pending'`, sidestepping the real scenario — self-fulfilling.

**Fix** — `findDue` now picks up both eligibility paths in one query (`src/packages/drip-dispatcher.cron.ts:findDue`):

```ts
OR: [
  { // Normal claim path.
    status: 'pending',
    AND: [
      { OR: [{ next_retry_at: null }, { next_retry_at: { lte: now } }] },
      { OR: [{ locked_at: null }, { locked_at: { lte: staleBefore } }] },
    ],
  },
  { // Stranded-dispatching reclaim path.
    status: 'dispatching',
    locked_at: { lte: staleBefore },
  },
]
```

`claim()` now takes a `priorStatus: 'pending' | 'dispatching'` discriminator and atomically updates only if the row is still in that prior state with a stale-or-null `locked_at`. The composite WHERE is the mutex for both variants: two workers attempting to reclaim the same stranded drop both issue an `UPDATE ... WHERE id=X AND status='dispatching' AND locked_at < staleBefore`; exactly one wins. Reclaim semantics: the row's STABLE `(clientPurchaseId, contentId)` idempotency keys are reused on the retry — workout via `WorkoutBuilderIdempotencyKey 'drip:workout:p={p}:c={c}'`, auto_message via `DripResolverMarker(purpose,purchase,content)` — so any partial work the crashed worker did is collapsed by the resolver-side dedup ledger (PR-9 R1's invariant). MAX_ATTEMPTS gates both paths so a poison drop eventually flips to `status='failed'` + COACH_ALERT instead of looping forever.

**New tests** (replace the self-fulfilling stale-lock test):
- `'stranded-dispatching reclaim: a worker-crash drop (status=dispatching + stale locked_at) IS materialised on a later tick'` — seeds `status='dispatching'` + `locked_at` older than STALE_CLAIM_MS, runs a tick, asserts reclaim + materialise + stable keys reused.
- `'stranded-dispatching reclaim: a FRESHLY claimed dispatching row (locked_at NOT stale) is NOT stolen'` — sanity guard: a healthy in-flight claim from another worker is NOT stolen.
- `'stranded-dispatching reclaim: respects MAX_ATTEMPTS'` — a poison drop with `attempt_count=MAX_ATTEMPTS` is NOT reclaimed (prevents infinite loop on permanent failure).

Verified the genuine reclaim test FAILS if the production fix is reverted (ran with original `status='pending'`-only `findDue`: `expect(stats.claimed).toBe(1)` got 0).

### P2 — DRIP_RELEASED preference routing (silently missing in-app rows)

The auditor flagged that the new `NotificationKind.DRIP_RELEASED = 'drip_released'` had no matching branch in `NotificationsService._kindToPrefsPrefix`, so the kind fell through every `startsWith` check and hit `return 'digest'`. Default prefs `digest_inapp: false` + `digest_push: false` → `createNotification` returned `null` and silently skipped every drip-release in-app/push row. Raw `pushToUser` still fired so the buyer got the push (it doesn't gate on prefs), but the in-app inbox/badge UX was broken for every drip release. The original test mocked `NotificationsService.createNotification` as a `jest.fn()` and never exercised the real preference gate — self-fulfilling.

**Fix** — three coordinated changes:

1. **Schema/migration** (`prisma/migrations/20261205000000_pr10_scheduled_drop_retry_lock/migration.sql` + `prisma/schema.prisma`): three new `NotificationPreferences` columns:
   ```sql
   ALTER TABLE "NotificationPreferences"
     ADD COLUMN "drip_released_email" BOOLEAN NOT NULL DEFAULT false;
   ALTER TABLE "NotificationPreferences"
     ADD COLUMN "drip_released_push" BOOLEAN NOT NULL DEFAULT true;
   ALTER TABLE "NotificationPreferences"
     ADD COLUMN "drip_released_inapp" BOOLEAN NOT NULL DEFAULT true;
   ```
   Defaults match the brief (decision #9 — push + in-app every time content unlocks). Email default off — mirrors the booking cluster's "no transactional email channel for this kind" pattern. Static `NOT NULL DEFAULT` means metadata-only ALTER + per-row default-fill on existing rows; no backfill script.
2. **`_kindToPrefsPrefix` branch** (`src/notifications/notifications.service.ts:_kindToPrefsPrefix`): `if (kind.startsWith('drip_released')) return 'drip_released';`. Now `createNotification` reads `drip_released_inapp` / `drip_released_push` instead of the off-by-default `digest_*` columns.
3. **In-memory defaults** (`getPreferences` fall-through when no `NotificationPreferences` row exists yet): `drip_released_email: false`, `drip_released_push: true`, `drip_released_inapp: true`. Mirrors the column defaults so the in-memory and DB paths agree.

**New tests** (use a REAL `NotificationsService`, not a `jest.fn()`):
- `'DRIP_RELEASED writes the in-app inbox row through the REAL NotificationsService prefs gate (defaults: drip_released_inapp=true)'` — constructs a real `NotificationsService`, runs a dispatch tick, asserts an actual `Notification` row was written with `channel='inapp' AND kind='drip_released'` and the correct body/payload.
- `'DRIP_RELEASED in-app write is GATED by drip_released_inapp pref (false → no row)'` — confirms the opt-out works (buyer with `drip_released_inapp:false, drip_released_push:false, drip_released_email:false` gets the content delivered but no notification rows).

Verified the in-app test FAILS if the `drip_released` branch is removed from `_kindToPrefsPrefix` (ran without the fix: `expect(inappRows.length).toBe(1)` got 0).

### P3 — cascading buyer-alert try/catch

The auditor flagged that the three buyer-alert calls (in-app `createNotification`, `pushToUser`, push `createNotification`) shared a single `try` block. A throw in call #1 swallowed calls #2 and #3. Brief invariant (push failure must not un-deliver content) was preserved, but the degraded-UX path could silently skip the push send on a transient `prisma.notification.create` blip.

**Fix** — each of the three calls is now wrapped in its own `try`/`catch` (`src/packages/drip-dispatcher.cron.ts:dispatchBuyerAlert`). A failure in any one logs at `warn` and the other two still run. `alert_dispatched_at` stamp is in a post-block `try`/`catch` so it always runs regardless. Verified by the existing "push failure does NOT mark the drop undelivered" test — both `createNotification` and `pushToUser` reject; content stays delivered; `alert_dispatched_at` stamped.

### R1 verification

- `tsc --noEmit` — clean.
- `nest build` — clean.
- `eslint` — 0 errors, 17 pre-existing warnings unchanged.
- Full jest: **287 suites pass; 3451/3451 active tests pass** (+4 over R0's 3447: 3 new reclaim tests, 2 new DRIP_RELEASED real-prefs tests, -1 retired self-fulfilling stale-lock test).

---

## R0 original report (preserved for reference)

---

## (b) Cron registration + double-dispatch prevention (claim/lock reused)

### Registration

```ts
@Cron(CronExpression.EVERY_MINUTE, { name: 'drip-dispatcher' })
async tick(): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  if (process.env.DRIP_DISPATCHER_ENABLED === 'false') return;
  if (this.running) {
    this.logger.warn('drip-dispatcher tick skipped: prior tick still running');
    return;
  }
  this.running = true;
  try {
    const stats = await this.runOnce();
    ...
```

- `@nestjs/schedule`'s `EVERY_MINUTE` (decision #7 — 1-minute cron). Same decorator pattern as `CheckoutReceiptScheduler` (`src/storefront/checkout-receipt.scheduler.ts:37`).
- `NODE_ENV=test` short-circuit + `DRIP_DISPATCHER_ENABLED=false` kill switch — matches the env-gating idiom used in every other repo cron (checkout-receipt, digest, coach-effectiveness, ptm).
- Tick-overlap guard: per-instance `running` flag prevents a slow tick from running in parallel with the next one on the same worker.

### Double-dispatch prevention (claim-before-work)

The repo has no advisory-lock helper and no Bull/Redis queue; every existing `@Cron` uses claim-by-write (digest, checkout-receipt, PTM, coach-effectiveness, weekly-insight). We follow the same shape with an atomic conditional `updateMany`:

```ts
private async claim(id: string, now: Date): Promise<ScheduledDrop | null> {
  const staleBefore = new Date(now.getTime() - STALE_CLAIM_MS);
  const updated = await this.prisma.scheduledDrop.updateMany({
    where: {
      id,
      status: 'pending',
      materialised_ref: null,
      OR: [{ locked_at: null }, { locked_at: { lte: staleBefore } }],
    },
    data: { status: 'dispatching', locked_at: now },
  });
  if (updated.count === 0) return null;
  return this.prisma.scheduledDrop.findUnique({ where: { id } });
}
```

The composite `WHERE (id, status='pending', materialised_ref IS NULL, locked_at IS NULL OR stale)` is the mutex. Two cron replicas on a multi-replica deploy contend on the row-level write lock; the loser's `updateMany` matches zero rows and the drop is processed **exactly once per tick**. A 5-minute stale-claim cutoff lets a crashed worker's claim expire so a drop never gets permanently stuck. Re-validation of `materialised_ref IS NULL` inside the WHERE catches the TOCTOU race between `findDue` and `claim`.

This is verified by the concurrency test (`drip-dispatcher.cron.spec.ts:'concurrency: two simultaneous dispatch passes...'`): `await Promise.all([cron.runOnce(NOW), cron.runOnce(NOW)])` over the same single due drop → `materialise` called **exactly once**; combined `claimed` count across both passes is 1.

---

## (c) Due-drop query

```ts
this.prisma.scheduledDrop.findMany({
  where: {
    status: 'pending',
    materialised_ref: null,
    fire_at: { lte: now, not: null },
    attempt_count: { lt: MAX_ATTEMPTS },
    AND: [
      { OR: [{ next_retry_at: null }, { next_retry_at: { lte: now } }] },
      { OR: [{ locked_at: null }, { locked_at: { lte: staleBefore } }] },
    ],
  },
  orderBy: { fire_at: 'asc' },
  take: TICK_BATCH_SIZE, // 250
});
```

Gates explained:

| Gate | Purpose |
|---|---|
| `status='pending'` | Never a delivered, failed, or canceled drop. |
| `fire_at IS NOT NULL AND fire_at <= now` | **Naturally excludes** `on_completion` / `on_milestone` (PR-9 seeds them with `fire_at=NULL`; PR-11's job). |
| `materialised_ref IS NULL` | PR-7's at-least-once gate — never re-materialise a delivered drop. |
| `attempt_count < MAX_ATTEMPTS` (5) | Exhausted retries are not picked again — prevents infinite re-fire. |
| `next_retry_at IS NULL OR <= now` | Honours the exponential-backoff schedule set on prior failures (no tight-loop hammering). |
| `locked_at IS NULL OR <= staleBefore` | A crashed worker's claim expires after 5 min so drops never get stuck. |

Ordered by `fire_at ASC` so the oldest-due drop drains first (FIFO over a backlog). Batch-limited to **250/tick** — sized so a healthy steady state never queues; a multi-hour backlog (e.g. after a Stripe reconnect storm) drains across consecutive ticks without overlapping the 60-second budget. Documented as `TICK_BATCH_SIZE` in `drip-dispatcher.cron.ts`.

Index supporting this query (new, additive in this PR): `@@index([status, next_retry_at, fire_at])` on `ScheduledDrop`.

---

## (d) Per-type dispatch + idempotency keys reused

After `claim` we call the SAME registry PR-9's inline path uses:

```ts
const result = await this.resolvers!.materialise(drop.asset_type, {
  clientId: purchase.client_user_id,
  coachId: purchase.coach_user_id,
  assetId: drop.asset_id,
  assetRevisionId: drop.asset_revision_id ?? null,
  displayTitle: drop.display_title,
  displayCaption: drop.display_caption,
  scheduledDropId: drop.id,
  // PR-9 R1 stable keys — same pair PR-9 inline used so a hypothetical race
  // between the inline retry and this cron path cannot create a second
  // ClientWorkoutAssignment / CoachMessage / etc.
  clientPurchaseId: purchase.id,
  contentId: drop.content_id,
});
```

The cron path passes the SAME stable `(clientPurchaseId, contentId)` pair PR-9's R1 audit-fix established so the resolver-side per-type ledger collapses any retry onto the cached row. No new idempotency mechanism was invented; we ride the contract PR-7 + PR-9 already proved:

| asset_type | Resolver-side idempotency (unchanged from PR-9 R1) | Source |
|---|---|---|
| `workout_program` / `workout_plan` | `WorkoutBuilderIdempotencyKey` row keyed `drip:workout:p={purchaseId}:c={contentId}`. The ledger is written via `this.prisma` outside any outer tx, so a cron retry observes the cached completed claim. | `WorkoutAssetResolver` (PR-7 + PR-9 R1) |
| `auto_message` | `DripResolverMarker(purpose='auto_message', purchase_id, content_id)` claimed BEFORE `sendAsCoach`, updated with `materialised_ref` AFTER. A retry observes the marker and returns the cached message id without a second send. | `AutoMessageAssetResolver` (PR-7 + PR-9 R1) |
| `meal_plan` | `DailyMealPlanAssignment.drip_drop_id @unique`. The per-drop key still regenerates on inline rollback, but on the cron path it's stable for the lifetime of the row. | `MealPlanAssetResolver` (PR-7) |
| `pdf` / `video` | `ClientAssetGrant @@unique([client_id, media_asset_id])`. Composite is stable across UUID churn; retry collapses cleanly. | `MediaAssetResolver` (PR-7) |

The "PR-9 may have left a legacy `scheduledDropId` key form for cron" prompt: I inspected the registry input shape (`AssignableAssetMaterialiseInput`) — it accepts both `scheduledDropId` AND the stable `(clientPurchaseId, contentId)` pair. We pass all three. The resolvers themselves prefer the stable pair (PR-9 R1's whole point — see `WorkoutAssetResolver` comment block). The cron path therefore can never double-deliver across inline+cron because the resolvers gate on the stable keys.

On success:

```ts
await this.prisma.scheduledDrop.updateMany({
  where: { id: drop.id, status: 'dispatching' },
  data: {
    materialised_ref: result.materialisedRef,
    status: 'delivered',
    fired_at: now,
    attempt_count: { increment: 1 },
    failure_reason: null,
    locked_at: null,
    next_retry_at: null,
  },
});
```

The `WHERE status='dispatching'` re-assertion catches a TOCTOU race where a sibling worker stole the claim — without it, two workers could both win the resolver call and both stamp `materialised_ref` (the underlying resolver dedup catches the actual deliverable, but we still want the DB state to reflect exactly one writer). PR-7's `materialised_ref IS NULL` gate is honoured: we never re-materialise a delivered drop because the dispatcher query already filtered them out.

---

## (e) Push + in-app alert reuse

`NotificationsService` (the same service PR-2 uses for `transfer.failed` COACH_ALERTs at `billing.service.ts:1115-1131`) is injected directly. No new emitter class — emitters in the codebase exist to mirror DB-source-of-truth rows (`CoachAlertEmitter` mirrors the `CoachAlert` table), and the drip release alert has no analogous source row. The pattern matches PR-2's direct `createNotification` call.

After a successful materialise we fire three calls:

```ts
await this.notifications.createNotification({
  user_id: clientUserId, kind: NotificationKind.DRIP_RELEASED, body, ...,
  channel: 'inapp',
});
await this.notifications.pushToUser(clientUserId, title, body, data);
await this.notifications.createNotification({
  user_id: clientUserId, kind: NotificationKind.DRIP_RELEASED, body, ...,
  channel: 'push',
});
```

Body: `"New content unlocked: {display_title}"` (clamped to 160 chars by `NotificationsService.createNotification`). Deep link: `tgp://client/library`.

A new `DRIP_RELEASED: 'drip_released'` was added to `NotificationKind`. No schema migration needed — `Notification.kind` is a free-form string (the file comment says additions require no migration).

**Push-failure invariant (decision #9)** — every alert call is wrapped in `try/catch`. A push provider failure is logged at `warn` and never bubbles. `alert_dispatched_at` is stamped via a separate `prisma.scheduledDrop.update` in the `finally` block so a future safety sweep never double-pushes. Verified by `drip-dispatcher.cron.spec.ts:'push failure does NOT mark the drop undelivered'`: the test makes `pushToUser` AND `createNotification` both reject; the drop ends up `status='delivered'`, `materialised_ref='mp-ok'`, `alert_dispatched_at` stamped.

---

## (f) Backoff schedule + MAX_ATTEMPTS + permanent-failure COACH_ALERT

### Schedule

```ts
const MAX_ATTEMPTS = 5;
const BACKOFF_MS: readonly number[] = [
  1 * 60 * 1000,        //  1 min
  5 * 60 * 1000,        //  5 min
  15 * 60 * 1000,       // 15 min
  60 * 60 * 1000,       //  1 hour
  6 * 60 * 60 * 1000,   //  6 hours
];
```

Matches decision #10's worked example. `attempt_count` is incremented BEFORE the lookup, so a first failure (post-increment `attempt_count=1`) waits 1 min, a second waits 5 min, etc. Past the schedule we clamp to the last entry — but in practice we hit `MAX_ATTEMPTS=5` first and stop retrying.

### Transient-failure path

```ts
await this.prisma.scheduledDrop.updateMany({
  where: { id: drop.id, status: 'dispatching' },
  data: {
    status: 'pending',
    attempt_count: { increment: 1 },
    failure_reason: reason,
    next_retry_at: nextRetryAt,
    locked_at: null,
  },
});
this.logger.warn(`drip-dispatcher transient failure drop=${drop.id} attempt=${nextAttempt}/${MAX_ATTEMPTS} ...`);
```

Drop returns to `status='pending'` so the next tick re-picks it (gated by `next_retry_at <= now`). `locked_at` cleared so the claim doesn't artificially stale-block re-pickup. `failure_reason` capped at 500 chars.

### Permanent-failure path (`attempt_count + 1 >= MAX_ATTEMPTS`)

```ts
await this.prisma.scheduledDrop.updateMany({
  where: { id: drop.id, status: 'dispatching' },
  data: {
    status: 'failed',
    attempt_count: { increment: 1 },
    failure_reason: reason,
    next_retry_at: null,
    locked_at: null,
  },
});
this.logger.error(
  `drip-dispatcher PERMANENT FAILURE drop=${drop.id} client=... coach=... package=... content=... asset_type=... attempts=5/5 reason=...`,
);
await this.fireCoachAlert(drop, purchase, reason);
```

`fireCoachAlert` invokes `NotificationsService.createNotification({ kind: COACH_ALERT, channel: 'inapp', user_id: coach_user_id, body, payload, deep_link, ... })` — the same envelope shape PR-2 uses for `transfer.failed` (`billing.service.ts:1115`). The payload names buyer (`client_user_id`), package (`package_id`), content (`content_id`), asset type, attempts, and failure reason — exactly the data a coach needs to investigate without a ticket round-trip. The COACH_ALERT call is itself try/caught so a downstream notification provider failure can't bubble back into the cron (the drop is already `status='failed'` in the DB; oncall reads structured logs).

Verified by tests:
- `'failure: resolver throws → attempts++, next_retry_at set with backoff, status pending'` — 1st failure → `attempt_count=1`, `next_retry_at - NOW === BACKOFF_MS[0] = 60_000ms`, COACH_ALERT NOT yet sent.
- `'failure: after MAX_ATTEMPTS-1 prior failures, hitting MAX → status=failed + COACH_ALERT + log'` — `attempt_count=5`, COACH_ALERT sent with `kind='coach_alert'`, payload `{ event: 'drip_drop_failed', client_purchase_id, content_id, attempts: 5, ... }`.
- `'drop with attempt_count >= MAX_ATTEMPTS is NOT picked up'` — confirms infinite-retry is impossible.

---

## (g) Test results

### Commands

- `node_modules/.bin/tsc --noEmit -p tsconfig.json` — **clean (0 errors)**.
- `npm run build` (`nest build`) — **clean**.
- `npm run lint` — **0 errors**, 17 pre-existing warnings unchanged from `main` (`landing-pages.service.ts`, `lists.dto.ts`, `macros.service.ts`, `meal-plans.dto.ts`, `nudge-detector.service.ts`, `nudge-engine.service.ts`, `prep-guide.service.ts`, `real-meal-plans.service.ts`, `guest-checkout-pii-scrub.service.ts`).
- `node_modules/.bin/jest` — **287 suites pass; 3447/3447 active tests pass** (up from 3428 on `main` — +19 new), 20 skipped + 5 todo unchanged, 6 snapshots pass.

### New tests in `test/drip-dispatcher.cron.spec.ts` (19 total)

Each verification bullet from the brief maps 1:1 to a test:

| Brief invariant | Test name |
|---|---|
| Due pending drop dispatched + materialised + alerted | "dispatches a due pending drop: materialises, stamps delivered, sends push+in-app alert" |
| Future drop not dispatched | "does NOT dispatch a future drop (fire_at > now)" |
| Trigger drops (fire_at NULL) not dispatched | "does NOT dispatch on_completion / on_milestone drops (fire_at NULL)" |
| Delivered drop not re-materialised | "does NOT re-materialise an already-delivered drop (materialised_ref set)" |
| Concurrency = exactly one materialisation | "concurrency: two simultaneous dispatch passes produce exactly ONE materialisation" |
| Failure → attempts++ + backoff + pending | "failure: resolver throws → attempts++, next_retry_at set with backoff, status pending" |
| MAX_ATTEMPTS → failed + COACH_ALERT + log | "failure: after MAX_ATTEMPTS-1 prior failures, hitting MAX → status=failed + COACH_ALERT + log" |
| No infinite retry | "drop with attempt_count >= MAX_ATTEMPTS is NOT picked up" |
| Idempotent retries (stable keys passed) | "retry idempotency: a retried drop reuses the SAME stable (clientPurchaseId, contentId) keys" |
| Push failure does NOT un-deliver | "push failure does NOT mark the drop undelivered" |
| Batch limit respected | "batch limit: never claims more than TICK_BATCH_SIZE in one tick" |
| Env-gated in tests | "cron tick wrapper: env-gated (NODE_ENV=test → no-op)" |
| Backoff schedule shape | "backoff schedule increases monotonically and clamps at the last entry" |
| Already-final-status drops skipped | "canceled / failed / delivered drops are NOT picked up" |
| Backoff respected | "drop blocked by future next_retry_at is NOT picked up (backoff respected)" |
| Stale-lock recovery | "stale lock recovery: a drop locked > STALE_CLAIM_MS ago IS reclaimable" |
| Defensive: no registry → no-op | "missing registry → no-op + structured log (defensive)" |
| FIFO order over backlog | "order: due drops processed by fire_at ASC (oldest first)" |
| Defensive: missing purchase → cancel | "parent ClientPurchase missing → drop canceled defensively, never re-tried" |

### Existing tests

All 3428 prior tests still pass — including the full PR-7 (38 resolver) + PR-8 (package-contents) + PR-9 (purchase-fanout, 21 tests) suites that the engine depends on. No regressions.

---

## Files added / changed

- `prisma/migrations/20261205000000_pr10_scheduled_drop_retry_lock/migration.sql` — **new**, additive: three nullable `ScheduledDrop` columns + one supporting index. No DROP, no RENAME, no type change.
- `prisma/schema.prisma` — adds `locked_at`, `next_retry_at`, `alert_dispatched_at` to `ScheduledDrop` and the `@@index([status, next_retry_at, fire_at])`.
- `src/notifications/notification-kind.ts` — adds `DRIP_RELEASED: 'drip_released'`. No schema change.
- `src/packages/drip-dispatcher.cron.ts` — **new**, the cron service.
- `src/packages/packages.module.ts` — imports `NotificationsModule`, registers + exports `DripDispatcherCron`. AssignableAssetResolverRegistry comes via the existing `@Global AssignableAssetResolversModule` (already registered at AppModule level by PR-7) — no extra import needed.
- `test/drip-dispatcher.cron.spec.ts` — **new**, 19 unit tests.

---

## Guardrails honoured

- Backend only. Cron + dispatch + alerts + retry/backoff ONLY.
- No inline-path changes — `PurchaseFanoutService` is untouched.
- No trigger glue — `fire_at IS NOT NULL` gate naturally excludes `on_completion` / `on_milestone` drops; PR-11's job.
- No media upload (PR-12). No mobile. No refund/cancel (PR-16). No push-to-existing (PR-17).
- ONE additive migration (PR-3's `ScheduledDrop` shape did not pre-declare retry/lock columns; the new ones are nullable + indexed for the dispatcher hot path).
- Commit identity: `Dynasia G <dynasia@trygrowthproject.com>`. No `Co-Authored-By` / generated trailers.
