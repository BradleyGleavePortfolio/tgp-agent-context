# AUDIT — PR-4 PurchaseFanout seam wired into all 3 checkout paths (no-op body) (PR #315)

VERDICT: **CLEAN**

Typecheck: **pass** (`npx tsc --noEmit` — zero errors)
Lint: **pass** (`npm run lint` — 0 errors, 21 warnings, all pre-existing in unrelated files; PR-4 introduces zero)
Build: **pass** (`npx nest build`)
Tests: **pass** — 27 suites / 330 tests green via `npx jest --testPathPatterns='(checkout|guest|webhook|packages|billing|purchase-fanout)'`. The two new spec files (`test/purchase-fanout.service.spec.ts` 4 tests, `test/purchase-fanout-hooks.spec.ts` 3 tests) all pass.

## Critical finding to adjudicate — transaction wrapping of hook points #1 and #2

**Builder's claim VERIFIED — applyCheckoutCompleted and applyPaymentIntentSucceeded are NOT inside a `$transaction` in `checkout-webhook-handler.service.ts`.**

Quoting the code:

- `src/checkout/checkout-webhook-handler.service.ts:141-152` — `applyCheckoutCompleted` calls `await this.prisma.clientPurchase.update(...)` directly, not `tx.clientPurchase.update(...)`. There is no surrounding `$transaction(async (tx) => ...)` wrapper anywhere in this method.
- `src/checkout/checkout-webhook-handler.service.ts:365-372` — `applyPaymentIntentSucceeded` likewise calls `await this.prisma.clientPurchase.update(...)` directly.
- `src/checkout/checkout-webhook-handler.service.ts:174-186, 386-398` — the fanout is invoked with `this.prisma` (the live PrismaService), not a tx client. Code comments at L166-173 and L385 explicitly flag this.

Compare with hook point #3, `src/storefront/guest-checkout.service.ts:1245-1350`, where the entire convertGuestToUser flow runs inside `await this.prisma.$transaction(async (tx) => { ... })` and `onPurchaseEntitled(purchaseRow, ..., tx)` at L1344-1348 passes the real tx client. That one is correctly atomic.

**There IS an outer wrap** — `BillingService.handleEvent` at `src/billing/billing.service.ts:185-207` does `await this.prisma.$transaction(async (tx) => { ... checkoutWebhooks.handle(event); ... })`, with the `StripeProcessedEvent` dedup row inserted inside that same tx. But because the checkout webhook handler does not accept/use the `tx` client, its writes (and now PR-4's fanout writes) commit on a *different* connection from the dedup row. The handler's own L195-202 comment acknowledges this explicitly.

### Severity adjudication for THIS PR's scope

For PR-4's no-op body (a single idempotent bookkeeping upsert with `state='pending'`), this is **P3 (informational, non-blocking)**:

- An orphaned `PurchaseFanout='pending'` row is *write-only bookkeeping* with no observable side effect — nothing reads it yet, no money moves, no asset materialises, no notification fires.
- Even in the worst case (entitlement write succeeds, fanout write fails, or vice-versa), idempotency on replay re-converges them: the surrounding webhook handler is itself idempotent via `StripeProcessedEvent` (`billing.service.ts:185-193`), and the `PurchaseFanout.purchase_id @unique` upsert with `update:{}` collapses retries to a true on-conflict-do-nothing.
- A redelivered Stripe event will not double-create a fanout row, will not throw a unique-violation that aborts checkout, and will not double-flip entitlement.

**But this BECOMES a real P1 (transaction-atomicity bug) in PR-9** when the fanout body starts (a) seeding `ScheduledDrop` rows and (b) firing immediate-cadence drops. At that point:
- An orphaned `PurchaseFanout` row created by a fanout invocation whose entitlement update later rolled back would seed drops for a non-entitled purchase.
- Conversely, an entitlement write that succeeds while the fanout side fails leaves a paying client without their scheduled drops.

### What PR-9 MUST guarantee (called out so it isn't forgotten)

PR-9 cannot land safely without first refactoring **both** `applyCheckoutCompleted` (`checkout-webhook-handler.service.ts:110-188`) and `applyPaymentIntentSucceeded` (`checkout-webhook-handler.service.ts:348-401`) to:

1. Open (or accept from `BillingService`) a `prisma.$transaction(async (tx) => ...)` that wraps the `clientPurchase.update` + `splits.onChargeSucceeded` + `fanout.onPurchaseEntitled` triplet.
2. Pass that `tx` into `splits.onChargeSucceeded` *and* `fanout.onPurchaseEntitled` so all three side-effects commit or roll back together.
3. Ideally, plumb the existing outer tx from `BillingService.handleEvent` (`billing.service.ts:185`) down through `checkoutWebhooks.handle(event, tx)` so the entitlement+fanout+`StripeProcessedEvent` dedup all share a single Postgres tx — the comment at `billing.service.ts:195-202` already flags this as the intended refactor.
4. Keep all synchronous Stripe HTTP calls (e.g. `applyInvoicePaid`'s `stripeConnect.retrieveSubscription` at L471, and `applyCustomerUpdated`'s `retrievePaymentMethod` at L598) OUTSIDE that tx — A276-P1-3 anti-pattern guard. PR-4 itself does not introduce any sync Stripe call (verified — fanout body is DB-only).

The TODO comment at `checkout-webhook-handler.service.ts:171-173` ("Follow-up: atomic-ify the entitlement+split+fanout block in a dedicated PR") explicitly defers this — that defer is acceptable ONLY because the fanout body is currently a no-op. PR-9 must NOT inherit it.

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings
*(none)*

## P3 (non-blocking)
- `src/checkout/checkout-webhook-handler.service.ts:174-186, 386-398` — fanout invoked with `this.prisma` instead of a tx client at hook points #1 and #2. Acceptable at no-op stage; see PR-9 requirements above. The in-code TODO is present and visible.
- `src/packages/purchase-fanout.service.ts:33-35` — the `TxOrPrisma` union type (`Prisma.TransactionClient | {purchaseFanout: …}`) is slightly more permissive than strictly necessary, which is what enables silently accepting `this.prisma` at the two webhook sites. Consider tightening to `Prisma.TransactionClient` once hook points #1/#2 are tx-wrapped in PR-9 — that change will compile-fail the no-tx call sites, which is the right migration forcing-function.
- `src/storefront/guest-checkout.service.ts:1320-1326` — the unique-violation race-recovery `findFirst` after `clientPurchase.create` runs inside the tx, which is correct, but if it returns `undefined` (extremely unlikely — the racer just wrote the row), the guard `if (this.fanout && purchaseRow)` at L1343 silently skips fanout for that purchase. Logging the skip would aid future debugging if it ever fires. Not blocking.

## Verification of PR claims
- "3 hook points wired" → **verified true**. (1) `checkout-webhook-handler.service.ts:176-180` entrypoint `in_app_hosted`. (2) `checkout-webhook-handler.service.ts:388-392` entrypoint `in_app_ps`. (3) `guest-checkout.service.ts:1344-1348` entrypoint `storefront_guest`.
- "Idempotent via `PurchaseFanout.purchase_id @unique` + `upsert(update:{})`" → **verified true**. Schema confirms `purchase_id String @unique` at `prisma/schema.prisma:4674`. Service body at `src/packages/purchase-fanout.service.ts:46-54` uses `upsert({where:{purchase_id}, create:{...}, update:{}})` — true on-conflict-do-nothing. Replay test (`test/purchase-fanout-hooks.spec.ts:134-169`) green: same event handled twice → still one fanout row.
- "StripeProcessedEvent dedup intact" → **verified true**. `billing.service.ts:160-166, 185-193` unchanged by this PR; the dedup row is still inserted inside `BillingService.handleEvent`'s outer `$transaction`. PR-4 adds nothing to that path.
- "Guest hook is inside the entitlement `$transaction`" → **verified true**. `guest-checkout.service.ts:1245` opens the tx; `:1344-1348` passes that same `tx` to the fanout.
- "Webhook hook points #1/#2 are NOT in a `$transaction`, so passes `this.prisma` and flags in TODO" → **verified true**. (See critical finding above.)
- "No synchronous Stripe HTTP call inside the fanout body" → **verified true**. `purchase-fanout.service.ts:41-61` only touches `tx.purchaseFanout.upsert` and logs; no Stripe call, no other I/O.
- "Module wiring avoids DI cycle — service lives in `PackagesModule`, both `CheckoutModule` and `StorefrontModule` already import `PackagesModule`" → **verified true**. `packages.module.ts:28-30` provides+exports `PurchaseFanoutService`. `checkout.module.ts:46` imports `PackagesModule`. `storefront.module.ts:48` newly imports `PackagesModule`. The constructor `@Optional()` at `checkout-webhook-handler.service.ts:58` and `guest-checkout.service.ts:199-200` is graceful-degradation only; under production wiring the provider is always resolvable. Typecheck and full test boot (27 suites green) confirm no cycle.
- "Scope discipline — no `ScheduledDrop`/resolver/cron/endpoint/mobile changes" → **verified true**. Diff is 7 files, all confined to the seam: `purchase-fanout.service.ts` (new), two module files for wiring, the two consumer service files for the call sites, and two new test files. No controller, no scheduler, no mobile, no resolver, no migration.

---
**Bottom line:** PR-4 is a clean, scoped seam landing. Idempotency is real and tested. Module wiring is correct. The only structural debt — that hook points #1 and #2 are not yet inside a Postgres transaction — is harmless at no-op stage, explicitly flagged in code TODOs, and verified to be P3 for this PR. **PR-9 must transaction-wrap both webhook hook points (and ideally plumb `BillingService`'s outer tx through) BEFORE introducing the real fanout body, or it will introduce a P1 atomicity bug at that point.**
