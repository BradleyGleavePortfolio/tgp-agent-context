# AUDIT R4 — PR-18 B1 pricing lock + combo error copy (PR #343)
PINNED SHA: 09b7073af249c3b91e78d42f77c84c190635089c
VERDICT: CLEAN

Typecheck: pass (`NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` at pinned SHA, using the repo dependency cache linked into the SHA-pinned worktree)
Lint: pass (`npx eslint src/billing/billing.service.ts src/checkout/checkout-webhook-handler.service.ts src/packages/packages.service.ts test/checkout-webhook-handler.spec.ts test/packages.service.spec.ts`; exit 0, 0 warnings)
Tests: pass. Targeted Jest suites all passed: B1/checkout/split suites 4 suites / 92 tests; `test/billing-checkout-routing.spec.ts` 1 suite / 12 tests; affected billing expansion suites 5 suites / 28 tests; fanout/reconcile suites 3 suites / 13 tests. Total: 13 suites / 145 tests passed.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## Verification of R3 P1 findings / FIX3 claims
- R3 P1 #1 (deferred Stripe HTTP): verified fixed for the `checkout.session.completed` path. `BillingService.handleEvent()` now calls `checkoutWebhooks.prefetchForOuterTx(event)` before opening its outer `$transaction`, captures `result.deferredSplit` inside the transaction, and calls `checkoutWebhooks.runDeferredSplit(deferredSplit)` only after the transaction returns/commits (src/billing/billing.service.ts:209-213, src/billing/billing.service.ts:248-289, src/billing/billing.service.ts:635-650).
- The prefetch path for `checkout.session.completed` / `payment_intent.succeeded` resolves the purchase charge id before the outer transaction opens, preferring an event `latest_charge` and otherwise calling `stripeConnect.retrievePaymentIntent()` only in `prefetchChargeIdForActivation()` outside the transaction (src/checkout/checkout-webhook-handler.service.ts:215-233, src/checkout/checkout-webhook-handler.service.ts:270-327).
- The activation path still takes the B1 package row lock on the supplied transaction, but the split posting is now routed through `runOrDeferSplit()`: when `tx` is present it returns a `DeferredSplitTask` without calling `splits.onChargeSucceeded()`, and `runDeferredSplit()` later threads the pre-resolved charge id as `invoice_charge_id` after commit (src/checkout/checkout-webhook-handler.service.ts:386-420, src/checkout/checkout-webhook-handler.service.ts:479-538, src/checkout/checkout-webhook-handler.service.ts:1115-1153).
- I found no Stripe HTTP on the checkout-completed transaction/lock path. The remaining Stripe calls in the touched checkout handler are prefetch/out-of-tx calls or guarded no-tx paths: `retrievePaymentIntent()` in the prefetch helper, `retrieveSubscription()` before/without an outer tx, and `retrievePaymentMethod()` on the unrelated customer-updated path (src/checkout/checkout-webhook-handler.service.ts:251-259, src/checkout/checkout-webhook-handler.service.ts:318-325, src/checkout/checkout-webhook-handler.service.ts:899-918, src/checkout/checkout-webhook-handler.service.ts:1046-1055).
- New tests directly cover the R3 P1 boundary: checkout completed under an outer tx does not call `onChargeSucceeded()` inline and returns a deferred descriptor with the pre-resolved charge id; the no-tx path still runs inline; payment-intent succeeded also defers under tx; `runDeferredSplit()` posts using the pre-resolved charge id; prefetch resolves out-of-tx and avoids Stripe HTTP when `latest_charge` is already present (test/checkout-webhook-handler.spec.ts:786-921).
- R3 P1 #2 (write-set boundary): verified fixed. `git diff origin/main..09b7073a --name-only` lists only `src/billing/billing.service.ts`, `src/checkout/checkout-webhook-handler.service.ts`, `src/packages/packages.service.ts`, `test/checkout-webhook-handler.spec.ts`, and `test/packages.service.spec.ts`.

## B1 original scope verification
- Pricing-lock behavior remains intact. `PackagesService.update()` still runs `requireOwnedPackage()` before subscriber counting, computes primary/recurring/duration price-shaping changes, skips the lock for non-price edits, and uses one `$transaction` with `SELECT id FROM "CoachPackage" ... FOR UPDATE` plus one `clientPurchase.count()` before throwing `PACKAGE_PRICING_LOCKED` or updating (src/packages/packages.service.ts:118-123, src/packages/packages.service.ts:184-237, src/packages/packages.service.ts:237-266).
- Combo error copy remains as specified: primary combo minimum copy is `one-time amount_cents must be an integer ≥ 50 (Stripe minimum)` and recurring companion copy is `recurring_amount_cents must be an integer ≥ 50 (Stripe minimum for the recurring companion)`, both under `PACKAGE_INVALID` (src/packages/packages.service.ts:506-513, src/packages/packages.service.ts:590-595).

## 50-failures gate focus areas
- Security / tenant-scope / IDOR: no new issue found. The pricing update path still requires package ownership before any active-subscriber count or pricing mutation (src/packages/packages.service.ts:118-123, src/packages/packages.service.ts:227-237).
- Data integrity / transactions: the R3 checkout-completed split side effect no longer runs while the outer `StripeProcessedEvent` transaction or the B1 package row lock is held; deferred split execution is failure-isolated after commit (src/billing/billing.service.ts:248-289, src/billing/billing.service.ts:635-650, src/checkout/checkout-webhook-handler.service.ts:479-538).
- Race conditions / concurrency: pricing edits and entitlement activation still serialize on the single package row lock, and the pricing edit path recounts active recurring purchases under that lock with one query (src/packages/packages.service.ts:227-266, src/checkout/checkout-webhook-handler.service.ts:1100-1153).
- Stripe replay / idempotency: the event dedup row is still inserted inside the outer transaction, deferred split descriptors are not executed on rollback, and split/transfer posting remains idempotent/sweeper-backed per the deferred execution comments and tests (src/billing/billing.service.ts:248-289, src/billing/billing.service.ts:635-650, test/checkout-webhook-handler.spec.ts:864-875).

## Commands run
- `git fetch origin main pr18/b1-pricing-lock && git worktree add /home/user/workspace/r4-audit-b1 09b7073a`
- `git diff origin/main..09b7073a --name-only`
- `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit`
- `npx eslint src/billing/billing.service.ts src/checkout/checkout-webhook-handler.service.ts src/packages/packages.service.ts test/checkout-webhook-handler.spec.ts test/packages.service.spec.ts`
- `yarn jest test/packages.service.spec.ts test/checkout-webhook-handler.spec.ts test/checkout-webhook-fee-split.spec.ts test/purchase-split-handler.service.spec.ts --runInBand`
- `yarn jest test/billing-checkout-routing.spec.ts --runInBand`
- `yarn jest test/billing-drip-alert-flush.spec.ts test/billing-audit.spec.ts test/billing-payout-failed.spec.ts test/billing/subscription-webhook.tier.spec.ts test/billing-throttle-metadata.spec.ts --runInBand`
- `yarn jest test/purchase-fanout-tx-plumbing.spec.ts test/purchase-fanout-rollback-retry.spec.ts test/lost-webhook-reconcile.service.spec.ts --runInBand`

## R0 (Decacorn) review
- CLEAN. The two R3 P1s are resolved at the required pinned SHA: no checkout-completed split/transfer Stripe HTTP runs while the outer transaction or package `FOR UPDATE` lock is held, and the branch diff against `origin/main` is restricted to the authorized five-file write-set.
