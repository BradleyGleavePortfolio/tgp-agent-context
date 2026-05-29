# AUDIT — PR-16: Cancel pending drops on refund / dispute / subscription cancellation (PR #325)

VERDICT: CLEAN
Head commit: b072dbe37998e67e73c223a29f61a15b1e04694e (branch `pr16/cancel-pending-on-refund`)
Typecheck: pass (`node_modules/.bin/tsc --noEmit -p tsconfig.json` → 0 errors)
Lint: pass (`npm run lint` → 0 errors, 17 pre-existing warnings in unrelated files: build-week.dto.ts, ltv-metrics.service.ts, landing-pages*, lists.dto.ts, macros.service.ts, meal-plans.dto.ts, nudge-*.ts, prep-guide.service.ts, real-meal-plans.service.ts, guest-checkout-pii-scrub.service.ts — none from this PR's changed files)
Tests: pass (`node_modules/.bin/jest` → 300 suites, 3634 tests, 3609 passed, 20 skipped, 5 todo, 0 failures; new `test/cancel-pending-on-refund.spec.ts` adds 12/12)

## P0 findings
(none)

## P1 findings
(none)

## P2 findings
(none)

## P3 (non-blocking)

- `src/packages/purchase-fanout.service.ts:567` — the WHERE clause filters `status IN ('pending','due')`, but a repo-wide grep finds NO code path that ever writes `status='due'` to a `ScheduledDrop` (only `pending|dispatching|delivered|failed|canceled` are ever written; `'due'` appears only in the schema-comment enumeration and in the read-side `checkout.service.ts:711` `findMany`). Including `'due'` is defensive and harmless, just dead in practice. **Suggestion:** keep as a future-proof slot for the inventory's brief or drop it; either way no behavior change. Non-blocking.

- `src/packages/purchase-fanout.service.ts:564-575` — the `updateMany`'s `data` resets `next_retry_at: null` and `locked_at: null`. Strictly fine because we just flipped the row to terminal `canceled`. Non-blocking — explicit reset matches PR-10's pattern.

- `src/checkout/refund-dispute-handler.service.ts:550-566` — onDisputeClosed's pre-existing structural risk: `applyLedgerReversal` and `applyHeadCoachReversal` run BEFORE the new inner `$transaction` flips `ledger_reversed=true`. If the inner tx aborts (e.g. cancelPendingForPurchase fails), the ledger writes have already committed but `ledger_reversed=false` lets Stripe redelivery re-enter the block and re-apply reversals. The Stripe HTTP `transfers.reverse` is idempotency-keyed on `tgp-tr-rev-{row.id}-{row.reversed_amount_cents + amount}` (transfer-orchestrator.service.ts:201) so a re-attempt with the SAME amount collapses, but the SplitLedger `applyReversal` does cumulative+cap arithmetic (split-ledger.service.ts:132-135) which is idempotent at the cap but not crisp under retry. **This is pre-existing — the diff did not introduce it.** PR-16 actually narrows the window slightly by bundling more writes into the inner tx. Not a PR-16 regression. Flagging as P3 for the polish backlog because the inner-tx restructure makes the existing pattern more visible.

## Verification of PR claims

| Claim | Status |
|---|---|
| `cancelPendingForPurchase(purchaseId, reason, tx?)` lives on PurchaseFanoutService and is the single drop-writer | **TRUE** (`src/packages/purchase-fanout.service.ts:547-586`). No parallel writer. |
| Single set-based `updateMany` with `WHERE status IN ('pending','due')` | **TRUE** (`purchase-fanout.service.ts:564-575`). No row loop, no N+1. |
| Optional tx; falls back to `this.prisma`; graceful no-op when no scheduledDrop client present | **TRUE** (`purchase-fanout.service.ts:552-563`). |
| Reason stamped into existing `failure_reason` column as `canceled:{reason}`; no schema change | **TRUE** (`purchase-fanout.service.ts:571`). `git diff` over `prisma/schema.prisma` shows no changes — no migration. |
| Idempotent — replay matches zero rows, returns count=0, no error, no extra rows changed | **TRUE.** WHERE clause excludes already-canceled rows; the `(client_purchase_id, content_id)` `@@unique` doesn't apply here (this is a status update, not an insert). Confirmed by spec `cancel-pending-on-refund.spec.ts:141-155`. |
| Wired into `applySubscriptionDeleted` inside outer tx | **TRUE** (`checkout-webhook-handler.service.ts:411-420`). `tx` from BillingService (`billing.service.ts:230` → `this.checkoutWebhooks.handle(event, tx)`) is forwarded. Entitlement flip at line 403-410 and cancel at 414-420 share the same `db` / `tx` client. |
| Wired into `applyPaymentIntentFailed` with `wasEntitled` guard | **TRUE** (`checkout-webhook-handler.service.ts:566-581`). `wasEntitled` is captured pre-flip from the SAME DB read (line 566). Metadata-fallback branch (never-entitled) skips cancel explicitly (line 547). |
| Wired into `onChargeRefunded` full-refund branch inside the existing inner $transaction | **TRUE** (`refund-dispute-handler.service.ts:249-255`). Inside `await this.prisma.$transaction(async (tx) => {...})` at line 204 — same tx as `clientPurchase.status='refunded'` flip and GuestCheckout mirror. |
| Wired into `onDisputeClosed` lost branch inside a new inner $transaction | **TRUE** (`refund-dispute-handler.service.ts:550-566`). Entitlement flip + `chargeDispute.ledger_reversed=true` + cancel are all inside `await this.prisma.$transaction(async (tx) => {...})`. |
| Same tx is passed; entitlement-revoke and drop-cancel commit-or-rollback together (50-Failures #44) | **TRUE for all 4 sites.** Verified by reading the 4 wirings: in each case the cancel's tx parameter is the exact tx client used by the entitlement-revocation write next to it. Tested by `cancel-pending-on-refund.spec.ts:522-578` (atomicity rollback). |
| Scope isolation — each handler only cancels its OWN purchase's drops | **TRUE.** Each handler resolves the ClientPurchase via the EXISTING lookup path (`stripe_subscription_id` for sub.deleted, `stripe_payment_intent_id` for PI.failed, `resolvePurchaseByCharge` for refund/dispute) and passes `purchase.id` as the `clientPurchaseId`. The `updateMany` filters by `client_purchase_id`. Tested by spec at lines 244-306 (sub-deleted) and 424-516 (dispute lost). |
| PI-failed for a never-entitled purchase does NOT cancel drops | **TRUE.** Two layers: (1) metadata-fallback branch (never-entitled) at line 544-557 deliberately skips; (2) main branch reads `wasEntitled = !!purchase.entitlement_active` BEFORE the flip and only calls cancel when `wasEntitled===true` (lines 566, 575). Tested at spec lines 346-417. |
| Dispatching-row race: PR-10 findDue does NOT return canceled rows | **TRUE** (`drip-dispatcher.cron.ts:185-218`). `OR: [{status:'pending', ...}, {status:'dispatching', ...}]` — `canceled` not in either branch. Atomic `claim` (lines 247-271) re-asserts `status: priorStatus` so a TOCTOU race after findDue cannot flip a canceled row to dispatching. |
| Dispatching-row rule: cancel pending+due now; let claimed dispatching rows finish | **TRUE** (`purchase-fanout.service.ts:519-528`). Documented in the method comment block. PR-10's resolver side-effects ride stable `(clientPurchaseId, contentId)` idempotency keys (PR-9 R1 — `purchase-fanout.service.ts:42-61`), so an in-flight dispatch finishing milliseconds after the cancel does NOT create a second ClientWorkoutAssignment / CoachMessage / etc. No double-delivery; no stranded dispatching row (stale dispatching reclaim path at cron lines 209-216). |
| Partial refund does NOT call cancelPendingForPurchase | **TRUE.** The cancel call sits INSIDE the `if (fullyRefunded)` block at `refund-dispute-handler.service.ts:187-256`, so partial refunds bypass it entirely. `fullyRefunded = totalAmount > 0 && refundedCents >= totalAmount` (line 186) correctly mirrors Stripe's `amount_refunded` cumulative semantics, so a partial-as-full mis-detection is not possible (Stripe's `amount_refunded` is the running total; once it hits `amount` it's full). |
| failure_reason reuse does not collide with PR-10 alert/backoff path | **TRUE.** Cron writes `failure_reason` only on `status='dispatching'` rows (cron lines 302-309, 473-484, 490-499, 536-540). PR-16 writes `failure_reason='canceled:{reason}'` only on rows it flipped to `status='canceled'`. The alert path (`handleDispatchFailure`) operates on `status='failed'` rows. No status overlap → no field collision. |
| Additive only — no fan-out seeding / cron dispatch / resolver logic changed beyond marking canceled; no schema migration | **TRUE.** `git diff cae2fab6..HEAD` touches exactly 4 files: `purchase-fanout.service.ts` (added method only), `checkout-webhook-handler.service.ts` (added 4 lines of call site + wasEntitled guard), `refund-dispute-handler.service.ts` (added tx forwarding + cancel calls + onDisputeClosed inner tx wrap), and `test/cancel-pending-on-refund.spec.ts` (new). No changes under `prisma/`. |
| 300 suites / 3609 tests / 12 new | **TRUE.** `node_modules/.bin/jest` → `Test Suites: 300 passed, 300 total; Tests: 20 skipped, 5 todo, 3609 passed, 3634 total`. `test/cancel-pending-on-refund.spec.ts` runs 12/12. |
| Commit identity is `Dynasia G <dynasia@trygrowthproject.com>` with no Co-Authored-By trailer | **TRUE.** `git log -1 --format='%an <%ae>%n%b' b072dbe3` shows the right author and no Co-Authored-By / Generated trailers. |

## Auditor's notes
- The brief's lifecycle states `pending/due/dispatching` (cron claim states); PR-16 also (correctly) covers `due`. No code path writes `'due'` today, but the filter is defensive and matches the brief. Listed as P3.
- The PI-failed wiring's `wasEntitled` guard is technically redundant with the WHERE clause (a never-entitled purchase has no `pending`/`due` drops because fan-out never ran), but the explicit guard matches the brief's stated semantic and keeps the log clean. Defensible.
- Pre-existing structural risk in `onDisputeClosed` (ledger reversals run before the idempotency flip is committed) is NOT introduced by this PR; the inner-tx restructure narrows rather than widens the window. Documented as P3.

VERDICT: **CLEAN** (zero P0/P1/P2 findings; three P3s, non-blocking).
