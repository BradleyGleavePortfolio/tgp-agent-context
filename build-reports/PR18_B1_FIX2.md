# PR-18 / B1 — R2 audit fix (FIX2)

**PR:** #343 — `PR-18(B1): lock pricing after active subscriber + combo error copy`
**Fixer:** Dynasia G (`dynasia@trygrowthproject.com`)
**Start SHA:** `5f652e6f2d20a75cdce6263dd947b1555b6562e8`
**New SHA (PR #343 head, branch `pr18/b1-pricing-lock`):** `587792a669e150f944b6a5528a966c11e1c15c81`
**Also pushed as:** `origin/pr18/b1-pricing-lock-fix2` (same SHA).

Audit driving this fix: `audits/PR18_wave/B1_AUDIT_R2.md` (VERDICT: NOT CLEAN, one P1, one P3).

---

## Findings addressed

### P1 — outer-transaction threading broken for subscription + invoice activation
**Audit ref:** `B1_AUDIT_R2.md:11-12` (P1 findings) and the `:20-23` claim-verification block
(`"outer tx threaded, no nested $transaction" -> FALSE`), citing
`src/checkout/checkout-webhook-handler.service.ts:83-102, :396-407, :641-662, :845-852`
and `src/billing/billing.service.ts:214-242`.

**Defect:** `BillingService.handleEvent()` opens the outer Prisma `$transaction` and calls
`checkoutWebhooks.handle(event, tx)`. But the checkout dispatcher dropped `tx` for
`customer.subscription.updated`/`.created` and `invoice.paid`/`invoice.payment_succeeded`,
calling `applySubscriptionUpdated(event)` / `applyInvoicePaid(event)` with no tx. Those then
passed `undefined` to `activateUnderPackageLock`, which opened a **nested**
`this.prisma.$transaction(...)`. Result: the CoachPackage `FOR UPDATE` lock + entitlement
activation committed **independently** of the StripeProcessedEvent dedup transaction — so if
later work in the outer handler rolled back, the package activation stayed committed
(atomicity / replay-safety violation). The audit also flagged the related caveat that, because
the checkout handler runs inside the outer tx, the `invoice.paid` Stripe `retrieveSubscription`
HTTP call could execute while a DB transaction (and the row lock) is held.

**Fix (narrowest diff that is actually correct):**
1. **Thread the outer `tx` end-to-end.** `handle()` now forwards `tx` to
   `applySubscriptionUpdated(event, tx)` and `applyInvoicePaid(event, tx, prefetched)`.
   Both methods use `db = tx ?? this.prisma` for their reads/writes and pass `tx` into
   `activateUnderPackageLock(tx, ...)`. When BillingService threads a tx, the lock + activation
   run **on that outer tx** — no nested `$transaction`. When there is no outer tx (legacy/test
   path) the helper still opens its own short tx so the row lock spans the write (unchanged).
   The `applySubscriptionUpdated` metadata-fallback recursion now also forwards `tx`.
2. **No Stripe HTTP while a DB transaction is held (invoice path).** Mirrored the existing
   `preResolveReceiptUrl` pattern: added `CheckoutWebhookHandlerService.prefetchForOuterTx(event)`,
   which BillingService calls **before** opening its `$transaction`. For
   `invoice.paid`/`invoice.payment_succeeded` it resolves the renewed Stripe subscription
   out-of-tx (only when the invoice maps to a ClientPurchase we own) and threads it through
   `handle(event, tx, prefetched)`. `applyInvoicePaid` now consumes `prefetched.invoiceSubscription`
   instead of calling Stripe inside the tx. Defensive guard: if an outer tx is somehow held with
   no prefetch, the resync is **skipped** (degraded, never a Stripe round-trip inside the tx)
   rather than blocking the Postgres connection. The legacy no-outer-tx path still retrieves
   from Stripe directly (safe — `activateUnderPackageLock` opens its own short tx afterwards).
3. The prefetch and the new `handle` arg are both **optional and defensively guarded** in
   BillingService (`typeof this.checkoutWebhooks.prefetchForOuterTx === 'function'`), matching the
   existing `discardPendingDripAlerts` guard, so legacy/unit-test wiring that stubs
   `checkoutWebhooks` with only a `handle` fn still works.

Serialization story is unchanged and now holds for ALL activation events: every path (pricing
edit + every activation) takes exactly the one `CoachPackage` row lock keyed by `packageId`,
so there is no lock-ordering cycle and no deadlock; the activation now genuinely commits within
the same outer dedup transaction.

### P3 (non-blocking) — unused-vars lint warnings
**Audit ref:** `B1_AUDIT_R2.md:17-18`, citing
`test/packages.service.spec.ts:32, :78, :319`.
Resolved the three `@typescript-eslint/no-unused-vars` warnings in the package-service test stub
(dropped unused `orderBy` destructures in two `findMany` stubs; the draft-package fixture row in
the "filters out archived/inactive/draft" test is now created without an unused binding). Lint on
that file now exits with **0 warnings**. This file is part of B1's original strict write-set.

---

## Files changed (vs `5f652e6`)
- `src/checkout/checkout-webhook-handler.service.ts` *(B1 expanded write-set — prior fix)* — tx
  threading for subscription/invoice activation; new `prefetchForOuterTx` + `CheckoutWebhookPrefetch`
  interface; `applyInvoicePaid` consumes the prefetched subscription.
- `test/checkout-webhook-handler.spec.ts` *(B1 expanded write-set — prior fix)* — +5 regression
  tests: subscription.updated locks on the OUTER tx with no nested `$transaction`; invoice.paid
  locks on the OUTER tx with no nested `$transaction` and no in-tx Stripe HTTP (prefetched);
  invoice.paid skips resync (no in-tx Stripe HTTP) when tx held without prefetch;
  `prefetchForOuterTx` resolves out-of-tx; `prefetchForOuterTx` no-op for non-invoice/unknown subs.
- `test/packages.service.spec.ts` *(B1 original write-set)* — P3 lint cleanup only.
- `src/billing/billing.service.ts` *(NEWLY EXPANDED — see scope note below)* — pre-resolve the
  invoice subscription before the outer `$transaction` and thread it + the prefetch into
  `checkoutWebhooks.handle(event, tx, prefetched)`.

### Write-set scope note (billing.service.ts expansion — deliberate, justified)
The R2 P1 fix fundamentally requires both (a) threading the outer tx into the checkout handler's
subscription/invoice activation, and (b) ensuring the invoice-renewal Stripe HTTP runs OUTSIDE
the outer tx. Because `BillingService` is the owner of the outer `$transaction` and invokes the
checkout handler from inside it, requirement (b) cannot be satisfied from within the checkout
handler alone — the prefetch must happen in `BillingService` *before* `this.prisma.$transaction`
opens (exactly as the audit's concrete fix states: "prefetch Stripe subscription state before
the outer DB transaction"). `src/billing/billing.service.ts` is **not** owned by any other
in-flight PR-18 unit (B2 = package-contents, B3 = landing-pages, B4 = drip, M1 = mobile) nor by
any H-unit (H1 payment-ops, H2 admin, H3 coach-messaging, H4 storefront, H5 meal-plans); it had
no commits since the merged base `9a8e210`. The change is additive and isolated (one prefetch
call mirroring the existing `preResolveReceiptUrl`, plus one extra optional `handle` arg), and
all existing BillingService webhook tests stay green. **No B2/B3/B4/M1/H1–H5 files were touched.**

---

## Test results (run in `/home/user/workspace/fix-b1` at `587792a`)
- **Typecheck:** `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` → exit 0.
- **Lint:** `npx eslint src/checkout/checkout-webhook-handler.service.ts
  test/checkout-webhook-handler.spec.ts src/billing/billing.service.ts
  test/packages.service.spec.ts src/packages/packages.service.ts` → exit 0,
  **0 errors, 0 warnings** (the 3 prior P3 warnings are now gone).
- **Tests (`--runInBand`):**
  - `test/packages.service.spec.ts` → **52 passed**.
  - `test/checkout-webhook-handler.spec.ts` → **25 passed** (20 prior + 5 new R2 regression tests).
  - Billing suites exercising `handleEvent` / the new prefetch+handle signature, all green:
    `billing-checkout-routing` , `billing-drip-alert-flush`, `billing-audit`,
    `billing-payout-failed`, `billing/subscription-webhook.tier`, `billing-throttle-metadata`
    → **40 passed**.
  - Combined affected set: **8 suites, 117 tests passed, 0 failed**.

---

## Verdict
R2 P1 (outer-tx threading + in-tx Stripe HTTP caveat) and R2 P3 (lint) are both resolved.
No out-of-scope findings remain flagged. New PR #343 head: `587792a669e150f944b6a5528a966c11e1c15c81`.
