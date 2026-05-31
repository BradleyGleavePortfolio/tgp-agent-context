# PR-18 B1 FIX3 — R3 audit remediation (PR #343)

Branch: `pr18/b1-pricing-lock`
Author: Dynasia G <dynasia@trygrowthproject.com> (no trailers)
Prior pinned SHA (R3 audit): `587792a669e150f944b6a5528a966c11e1c15c81`
New head SHA: `09b7073af249c3b91e78d42f77c84c190635089c`
Rebased onto origin/main: `a344ec4` (after B3 #342 merged)

## R3 verdict addressed
R3 was NOT CLEAN on two P1 findings:
1. **In-tx Stripe HTTP** on the `checkout.session.completed` activation path —
   the outer `BillingService.$transaction` (which also holds the B1
   `CoachPackage … FOR UPDATE` lock via `activateUnderPackageLock`) stayed
   open across `splits.onChargeSucceeded()`, which can synchronously call
   `retrievePaymentIntent` and `transfers.attempt()` (→ `createTransfer`).
2. **Write-set boundary** — `git diff origin/main..587792a6` included
   out-of-scope files (drip-dispatcher, package-contents, real-meal-plans,
   landing-pages, non-B1 tests) that belonged to other PRs not yet merged
   into the old base.

Both are now resolved.

## Fix 1 — write-set boundary (rebase)
The out-of-scope files were changes made by OTHER PRs (notably B3 #342) that
had since merged into `origin/main` (`a344ec4`). Rebasing the branch onto the
current `origin/main` absorbed all of them, so they no longer appear in the
branch diff.

`git fetch origin main && git rebase origin/main` applied cleanly (3 commits,
no conflicts). The post-rebase `git diff origin/main..HEAD --name-only`
contains ONLY the authorized B1 write-set:

```
src/billing/billing.service.ts
src/checkout/checkout-webhook-handler.service.ts
src/packages/packages.service.ts
test/checkout-webhook-handler.spec.ts
test/packages.service.spec.ts
```

No NEW files were needed for the P1 #1 fix — it fit within the existing
parent-authorized files.

## Fix 2 — defer split/transfer Stripe HTTP outside the outer tx
Doctrine: never hold a DB transaction (or the B1 package row lock) across a
Stripe HTTP round-trip. The split posting (`PurchaseSplitHandlerService.
onChargeSucceeded`) resolves the parent charge id via `retrievePaymentIntent`
and may immediately POST the head-coach `Transfer` via `transfers.attempt()`
→ `createTransfer`. Both are Stripe HTTP. The fix has two halves, mirroring
the existing `preResolveReceiptUrl` / post-commit `flushDripAlerts` patterns.

### a) Pre-resolve the charge id BEFORE the outer tx opens
`CheckoutWebhookHandlerService.prefetchForOuterTx` (called by
`BillingService.handleEvent` before `$transaction`) was extended to handle
`checkout.session.completed` and `payment_intent.succeeded`. It looks up the
pending purchase and resolves the Stripe charge id out-of-tx (preferring
`latest_charge` already on the event payload; otherwise one
`retrievePaymentIntent`), returning it in a new
`CheckoutWebhookPrefetch.chargeIdByPurchaseId` map keyed by purchase id.
(`src/checkout/checkout-webhook-handler.service.ts`:
`prefetchForOuterTx`, new `prefetchChargeIdForActivation`.)

### b) Defer the split posting until AFTER the outer tx commits
`applyCheckoutCompleted`, `applyPaymentIntentSucceeded`, and `applyInvoicePaid`
no longer call `splits.onChargeSucceeded()` inline when an outer `tx` is held.
Instead a shared helper `runOrDeferSplit()`:
- **tx held** → returns a `DeferredSplitTask` (purchase + pre-resolved
  charge id + optional invoice amount) on the `CheckoutWebhookResult`.
- **no tx** (legacy / sweeper / unit-test path) → runs the posting inline
  exactly as before, since no lock/tx is held there.

`BillingService.handleEvent` captures `result.deferredSplit` inside the tx and,
AFTER the `$transaction` commits (the first point at which the package row
lock is released and no DB tx is open), calls the new
`CheckoutWebhookHandlerService.runDeferredSplit(task)`. That threads the
pre-resolved charge id as `invoice_charge_id` so `onChargeSucceeded` does NOT
re-issue `retrievePaymentIntent`, and any `createTransfer` now happens with no
DB transaction held. On rollback the descriptor is simply never executed; the
idempotent split ledger + idempotency-keyed transfer + sweeper reconcile on
Stripe's redelivery. `runDeferredSplit` is failure-isolated (never throws) so
money/transfer side-effects can never roll back committed entitlement.
(`src/billing/billing.service.ts`: capture + post-commit run;
`src/checkout/checkout-webhook-handler.service.ts`: `runOrDeferSplit`,
`runDeferredSplit`, `DeferredSplitTask`.)

### Net effect on the cited audit locations
- `billing.service.ts:230-262` — outer tx now performs zero Stripe HTTP on the
  activation path; the deferred split runs post-commit.
- `checkout-webhook-handler.service.ts:262-297` (checkout completed splits) &
  `940-947` (`activateUnderPackageLock`) — split posting deferred; the FOR
  UPDATE lock is no longer held across Stripe HTTP.
- `purchase-split-handler.service.ts:39-45, 108-109, 147-149` &
  `transfer-orchestrator.service.ts:119-126` — these services are UNCHANGED
  (kept out of the write-set); their Stripe HTTP now only executes after the
  outer tx commits (or via the sweeper), never inside it.

## Incidental hardening (same allowed file)
The B1 `activateUnderPackageLock` row-lock helper now feature-detects
`$queryRaw` / `$transaction` on its client before using them. Production
prisma always provides both (the FOR UPDATE serialization is unchanged), but
the previously-passing `test/checkout-webhook-fee-split.spec.ts` integration
stub does not — the B1 lock commit had silently regressed those 2 tests
(`this.prisma.$transaction is not a function` / `client.$queryRaw is not a
function`). The guard restores them without touching the out-of-scope test
file. Same defensive pattern already used by the fanout no-tx path.

## Validation (run at new head 09b7073)
- Typecheck: `tsc --noEmit` → exit 0.
- Lint: `eslint` over the 5 changed files → exit 0, 0 warnings.
- Tests:
  - `checkout-webhook-handler.spec.ts` + `packages.service.spec.ts` +
    `checkout-webhook-fee-split.spec.ts` + `purchase-split-handler.service.spec.ts`
    → 4 suites, **92 passed**.
  - `billing-checkout-routing.spec.ts` → **12 passed**.
  - `billing-drip-alert-flush` + `billing-audit` + `billing-payout-failed` +
    `billing/subscription-webhook.tier` + `billing-throttle-metadata`
    → 5 suites, **28 passed**.
  - `purchase-fanout-tx-plumbing` + `purchase-fanout-rollback-retry` +
    `lost-webhook-reconcile.service` → 3 suites, **13 passed**.
  - New B1 R3 P1 tests added to `checkout-webhook-handler.spec.ts`: assert
    (i) checkout.session.completed / payment_intent.succeeded DEFER the split
    (no inline `onChargeSucceeded`) under an outer tx and surface
    `deferredSplit` with the pre-resolved charge id; (ii) the no-tx legacy
    path still posts inline; (iii) `runDeferredSplit` posts with the
    pre-resolved charge id; (iv) `prefetchForOuterTx` resolves the charge id
    out-of-tx (and prefers `latest_charge` from the PI payload with no Stripe
    HTTP).

## Write-set verification (final)
`git diff origin/main..09b7073 --name-only`:
```
src/billing/billing.service.ts
src/checkout/checkout-webhook-handler.service.ts
src/packages/packages.service.ts
test/checkout-webhook-handler.spec.ts
test/packages.service.spec.ts
```
Only the parent-authorized B1 files + the authorized `billing.service.ts`
expansion. No new files.
