# PR-16 BUILD REPORT — Refund/cancel → cancelPendingForPurchase

**Branch:** `pr16/cancel-pending-on-refund`
**PR:** [#325](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/325)
**Builds on:** merged PR-1..PR-15 (main @ `cae2fab6`)

---

## Files & line numbers

### New method
- `src/packages/purchase-fanout.service.ts:511-587` — `cancelPendingForPurchase(clientPurchaseId, reason, tx?)`.
  - Lives on `PurchaseFanoutService`, the existing owner of `ScheduledDrop` writes (PR-9 seed path). No parallel writer introduced.
  - Single set-based `scheduledDrop.updateMany({ where: { client_purchase_id, status: { in: ['pending','due'] } }, data: { status: 'canceled', failure_reason: 'canceled:{reason}', next_retry_at: null, locked_at: null } })`.
  - Accepts an optional `tx`; falls back to `this.prisma` when called outside a transaction (or returns 0 when neither is available — graceful no-op for legacy stubbed test wiring without `scheduledDrop`).
  - Reason is stamped into the existing `failure_reason` column as `canceled:refund | canceled:dispute | canceled:subscription_canceled | canceled:payment_failed`. **No schema change** — per brief, the column already exists and re-purposing it (audit trail) avoided an additive migration.

### Three handler wirings (inside their existing revocation tx)
- `src/checkout/checkout-webhook-handler.service.ts:91` — route `customer.subscription.deleted` with the outer billing tx.
- `src/checkout/checkout-webhook-handler.service.ts:96` — route `payment_intent.payment_failed` with the outer billing tx.
- `src/checkout/checkout-webhook-handler.service.ts:118-122` — route refund/dispute events through `RefundDisputeHandlerService.handle(event, tx)`.
- `src/checkout/checkout-webhook-handler.service.ts:383-432` — `applySubscriptionDeleted(event, tx?)`: reads pre-flip `entitlement_active`, flips the purchase to `canceled`, then calls `fanout.cancelPendingForPurchase(purchase.id, 'subscription_canceled', tx)` (only when `wasEntitled === true`).
- `src/checkout/checkout-webhook-handler.service.ts:494-563` — `applyPaymentIntentFailed(event, tx?)`: in the metadata-fallback (never-entitled) branch, deliberately does NOT call cancel. In the main branch (lookup by `stripe_payment_intent_id`), reads pre-flip `entitlement_active` and only calls cancel when `wasEntitled === true`.
- `src/checkout/refund-dispute-handler.service.ts:96-122` — `handle(event, tx?)` forwards the tx to `onChargeRefunded` and `onDisputeClosed`.
- `src/checkout/refund-dispute-handler.service.ts:181-208` — `onChargeRefunded`'s **full-refund** inner `$transaction` now includes `fanout.cancelPendingForPurchase(purchase.id, 'refund', tx)` so the entitlement flip + GuestCheckout mirror + drop cancel commit atomically.
- `src/checkout/refund-dispute-handler.service.ts:541-571` — `onDisputeClosed` **lost** branch wraps the dispute.ledger_reversed update + clientPurchase entitlement flip + `fanout.cancelPendingForPurchase(purchase.id, 'dispute', tx)` in a new inner `$transaction`.

### Tests
- `test/cancel-pending-on-refund.spec.ts` — 12 new tests (see Tests section).

---

## Dispatching-row rule (chosen)

**Rule:** cancel pending + due now; **let an already-claimed `dispatching` row finish on its own**. Do NOT flip dispatching to canceled.

**Why:**
1. PR-10's claim is exactly-once: the row was already taken off the candidate set when status flipped pending → dispatching, and the cron's post-success update asserts `status='dispatching'` (drip-dispatcher.cron.ts:336-347, :473-484, :490-499). A racing flip to canceled either strands the row (the cron's `status='dispatching'` guard fails) or, worse, lets a concurrent cron UPDATE clobber the cancel.
2. Resolver side-effects ride **stable** `(clientPurchaseId, contentId)` idempotency keys (PR-9 R1 — see purchase-fanout.service.ts:42-61). An in-flight dispatch finishing one millisecond after we'd have wanted to cancel does NOT create a second `ClientWorkoutAssignment` / `CoachMessage` / `DailyMealPlanAssignment` / `ClientAssetGrant`.
3. A dispatching row that crashes mid-resolver becomes stale after `STALE_CLAIM_MS=5min`; the next tick reclaims it (drip-dispatcher.cron.ts:204-216) and our `failure_reason='canceled:*'` is irrelevant because that row will still reach permanent failure or success.

**No double-delivery, no stranded row.** Code comment block at `src/packages/purchase-fanout.service.ts:511-559` documents this rule for future readers.

---

## Partial-refund decision

**Drops are canceled ONLY on FULL refund.** Partial refunds keep drops.

**Why:** Matches the existing entitlement rule. `RefundDisputeHandlerService.onChargeRefunded` only flips `entitlement_active=false` when `total_amount > 0 && refundedCents >= totalAmount` (`refund-dispute-handler.service.ts:157`). The PR-16 cancel call sits INSIDE the same `fullyRefunded` block (lines 181-208). A partial refund:
- keeps `entitlement_active=true`,
- keeps `status='paid'`,
- therefore keeps drops firing.

This matches the existing comment at lines 148-152: *"Partial refunds keep entitlement_active true; the client keeps the access they paid net-of-credit for."* Documented inline in the code at lines 200-207.

---

## PI-failed never-entitled semantic

**Rule:** PI-failed for a purchase that was never entitled does NOT cancel drops.

**Mechanism:** `applyPaymentIntentFailed` captures `wasEntitled = !!purchase.entitlement_active` **before** the flip (`checkout-webhook-handler.service.ts:548`) and only calls `cancelPendingForPurchase` when `wasEntitled === true` (line 559). The metadata-fallback branch (which by construction operates on `status='pending'` rows that were never entitled) deliberately skips the call entirely.

In practice the WHERE-clause inside `cancelPendingForPurchase` would also return 0 rows for a never-entitled purchase (no `pending`/`due` drops exist because fan-out never ran), but the explicit guard:
1. matches the brief's semantic exactly,
2. keeps the log line out of the never-entitled path,
3. avoids a spurious DB round-trip on the common payment-failure-before-entitlement case.

Test: `applyPaymentIntentFailed × never-entitled → drops untouched, cancel-spy NOT called`.

---

## Idempotency proof

**Replay-safe by construction.** The single `updateMany`'s `WHERE status IN ('pending','due')` excludes:
- `canceled` rows (already transitioned),
- `fired` / `delivered` / `failed` / `skipped` (terminal, not eligible).

Therefore the second invocation of an identical Stripe webhook (e.g. duplicate `customer.subscription.deleted`) matches zero rows and returns `count=0` — a true no-op, not a unique-constraint abort.

**Test:** `is idempotent — a second call returns 0 and changes nothing` (cancel-pending-on-refund.spec.ts).

Additionally, the per-handler outer idempotency was already in place before PR-16:
- `applySubscriptionDeleted` is gated by Stripe's `StripeProcessedEvent` dedup in `BillingService.handleEvent`.
- `applyPaymentIntentFailed` same.
- `onChargeRefunded` is gated by `ChargeRefund.ledger_reversed`.
- `onDisputeClosed` is gated by `ChargeDispute.ledger_reversed`.

So the cancel only runs once per refund/dispute outcome, and even if it somehow ran twice the WHERE-clause makes it a no-op.

---

## Atomicity proof

**Cancel rolls back with the outer revocation tx.**

- `applySubscriptionDeleted` and `applyPaymentIntentFailed` receive the outer `$transaction` client opened by `BillingService.handleEvent` (`src/billing/billing.service.ts:202`) and pass it as the third arg to `cancelPendingForPurchase`. The cancel's `updateMany` rides that tx; if any other write in the outer block (e.g. the dedup row, the entitlement flip itself, a downstream handler) fails, **Stripe retries the whole event** and the cancel is replayed safely (idempotency proof above).

- `RefundDisputeHandlerService.onChargeRefunded` already opened an INNER `$transaction` (lines 181-208) around the `clientPurchase.status='refunded'` flip + GuestCheckout mirror. PR-16 placed the cancel **inside that same tx**, so a crash between the entitlement flip and the cancel (or vice-versa) leaves both writes uncommitted.

- `RefundDisputeHandlerService.onDisputeClosed` now wraps the `chargeDispute.ledger_reversed` update + `clientPurchase.status='chargeback_lost' / entitlement_active=false` flip + cancel in a NEW inner `$transaction` (lines 541-571). Stripe-HTTP-bearing ledger / transfer reversals stay outside (P1-3 anti-pattern avoidance) and are gated by `ledger_reversed`.

**Tests:**
- `a thrown error inside the tx callback prevents the cancel from being observed in the store` — simulates Prisma `$transaction` with a scratch copy that is discarded on throw, asserts `persistent[0].status === 'pending'` after a thrown cancel.
- `a successful tx commits the cancel atomically with whatever else the caller did` — same harness, no throw, asserts `persistent[0].status === 'canceled'`.

---

## Cron-exclusion proof

PR-10's `DripDispatcherCron.findDue` (`src/packages/drip-dispatcher.cron.ts:183-222`) gates candidate selection on:

```ts
where: {
  materialised_ref: null,
  fire_at: { lte: now, not: null },
  attempt_count: { lt: MAX_ATTEMPTS },
  OR: [
    { status: 'pending', AND: [...] },           // normal path
    { status: 'dispatching', locked_at: { lte: staleBefore } }, // stranded reclaim
  ],
}
```

The OR-branches enumerate **exactly** `pending` and `dispatching` — `canceled` is NOT a member of either branch and is therefore excluded at the SQL level. The atomic `claim` method (lines 241-271) additionally re-asserts `status: priorStatus` in its UPDATE WHERE, so a TOCTOU race after `findDue` cannot flip a canceled row back to dispatching either.

**Test:** `a canceled drop is NOT returned by findDue (status gate excludes canceled)` simulates the dispatcher's WHERE clause against a canceled drop and asserts `candidates.length === 0`.

---

## Actual counts (run myself)

| Check | Command | Result |
|---|---|---|
| **TypeScript** | `node_modules/.bin/tsc --noEmit -p tsconfig.json` | **clean** (0 errors) |
| **Lint** | `npm run lint` | **0 errors**, 17 pre-existing warnings (unrelated to this PR — `LandingPageStatus`, `IsIn`, etc.) |
| **Lint of changed files** | `npx eslint src/packages/purchase-fanout.service.ts src/checkout/checkout-webhook-handler.service.ts src/checkout/refund-dispute-handler.service.ts` | **clean (0 messages)** |
| **Tests (related suites)** | `jest test/refund-dispute-handler.service.spec.ts test/checkout-webhook-handler.spec.ts test/purchase-fanout.service.spec.ts test/purchase-fanout-hooks.spec.ts test/purchase-fanout-real-body.spec.ts test/purchase-fanout-rollback-retry.spec.ts test/purchase-fanout-tx-plumbing.spec.ts test/purchase-fanout-coach-new-purchase.spec.ts test/drip-dispatcher.cron.spec.ts test/billing-drip-alert-flush.spec.ts test/cancel-pending-on-refund.spec.ts` | **11 suites, 115 tests, 115 passed** |
| **Tests (full)** | `node_modules/.bin/jest` | **300 suites, 3634 tests, 3609 passed, 20 skipped, 5 todo, 0 failures** |
| **New tests added** | `test/cancel-pending-on-refund.spec.ts` | **12 tests** (set-based cancel, idempotent replay, tx-routing, graceful no-op without scheduledDrop, cron findDue exclusion, sub-deleted scope isolation, sub-deleted replay, PI-failed never-entitled, PI-failed previously-entitled, dispute-lost wiring, atomic rollback, atomic commit) |

---

## Scope guard checklist (per brief)

- [x] Did NOT change PR-9 fan-out seeding.
- [x] Did NOT change PR-10 cron dispatch logic.
- [x] Did NOT change resolvers beyond setting status to `canceled`.
- [x] Did NOT add a new notification kind (cancellation alerts not listed in master plan §1 / §4).
- [x] Reused each handler's EXISTING ClientPurchase lookup (by subscription id / PI id / charge id) — no new lookup paths.
- [x] No new column on `ScheduledDrop` — reused existing `failure_reason` for the audit trail (`canceled:{reason}`).

---

## Commit identity verified

```
$ git log -1 --format='%an <%ae>'
Dynasia G <dynasia@trygrowthproject.com>
```

No `Co-Authored-By:` / `Generated with` trailers.
