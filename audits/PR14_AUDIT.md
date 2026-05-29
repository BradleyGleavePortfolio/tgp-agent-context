# AUDIT — PR-14: Guest storefront recurring support + landing_page_id propagation (PR #323)
VERDICT: NOT CLEAN
Typecheck: pass (`node_modules/.bin/tsc --noEmit -p tsconfig.json` → exit 0, 0 errors)
Lint: pass (`npm run lint` → 0 errors, 17 pre-existing warnings, none in PR-14 files)
Tests: pass (`node_modules/.bin/jest --runInBand` → 292 suites, 3548 tests passed, 20 skipped, 5 todo, 0 failures; 119s). PR-14 focused suites (3 files / 89 tests) all green. But: the PR-14 tests bypass the real `BillingService.handleEvent` dispatcher and so they cannot catch the P0 below.

Head commit: `2f48efca5eb469ddf9e5bb1950afadbdb32c5982`

---

## P0 findings

### P0-1 — Recurring (and combo) guest checkouts are paid but NEVER fulfilled: `payment_intent.succeeded` for the subscription's first invoice does not route to `GuestCheckoutService.handlePaymentSucceeded`, so `convertGuestToUser` is never invoked. No User, no ClientPurchase, no entitlement, no fan-out, no landing_page_id propagation. Stripe takes the money and the buyer gets nothing.

Trace:

1. `src/storefront/guest-checkout.service.ts:775-791` — `mintRecurringForGuest` calls `this.stripe.createSubscription({...metadata: { [GUEST_CHECKOUT_METADATA_KEY]: idempotencyKey, tgp_package_id, tgp_coach_user_id, tgp_guest_checkout_id }})`. The metadata is set on the **Subscription**, not the underlying PaymentIntent.
2. `src/connect/stripe-connect-api.service.ts:411-435` — `createSubscription` posts ONLY `metadata[k]=v` on the subscription object. There is no `payment_settings[...]`, no `payment_intent_data[...]`, no other mechanism that would propagate the metadata onto the first invoice's PaymentIntent. Stripe does **not** automatically copy subscription metadata onto its child PaymentIntents (per Stripe API: PI metadata starts empty unless explicitly set).
3. `src/billing/billing.service.ts:280-284` — the routing gate for `payment_intent.succeeded` is:
   ```ts
   if (
     this.guestCheckout &&
     pi?.id &&
     pi.metadata?.[GUEST_CHECKOUT_METADATA_KEY]
   ) {
     await this.guestCheckout.handlePaymentSucceeded(pi.id, ...);
   }
   ```
   `pi.metadata?.[GUEST_CHECKOUT_METADATA_KEY]` is FALSE for the recurring-subscription first-invoice PI (the metadata only lives on the Subscription). `handlePaymentSucceeded` is therefore never called for the recurring branch.
4. The same `payment_intent.succeeded` event is also offered to `CheckoutWebhookHandlerService.applyPaymentIntentSucceeded` at `src/checkout/checkout-webhook-handler.service.ts:419-437`, which looks for `ClientPurchase.stripe_payment_intent_id = pi.id, status = 'pending'`. Guest-recurring has not yet created a ClientPurchase row (the row is supposed to be created later inside `convertGuestToUser`'s tx), so `findFirst` returns null and `claimed = false`.
5. `customer.subscription.created/updated` routes through `applySubscriptionUpdated` at `src/checkout/checkout-webhook-handler.service.ts:281-351`. It first looks up `ClientPurchase` by `stripe_subscription_id` — none exists yet (only the GuestCheckout sentinel does). It then falls back to the metadata-rebind path that REQUIRES `tgp_client_user_id` to be present in subscription metadata (line 309-318). The guest mint path at `guest-checkout.service.ts:782-789` sets `tgp_package_id`, `tgp_coach_user_id`, `tgp_guest_checkout_id`, and `[GUEST_CHECKOUT_METADATA_KEY]`, but **not** `tgp_client_user_id` (the comment even calls it out: *"tgp_client_user_id is filled in at convertGuestToUser time — intentionally absent here"*). `applySubscriptionUpdated` returns `missing_binding_metadata` and refuses to claim. No ClientPurchase is created or bound.
6. `invoice.paid` routes through `applyInvoicePaid` at `src/checkout/checkout-webhook-handler.service.ts:543-557`. It looks up `ClientPurchase` by `stripe_subscription_id` — none exists. Returns `claimed: false`. BillingService then falls through to its own `applyInvoicePaid` which handles platform/SaaS subscriptions only, not guest packages.

**Net result for a guest paying for a recurring package:** Stripe collects the charge on the first invoice; GuestCheckout sentinel row is left in `status='pending'` (or, only IF the `payment_intent.succeeded` happened to land on the GuestCheckout pending→paid claim path — it doesn't because that claim path lives inside `handlePaymentSucceeded` which is never invoked); Supabase user is never created; ClientPurchase is never created; `entitlement_active` never flips; `fanout.onPurchaseEntitled` never fires; `landing_page_id` is never propagated; welcome email is never sent. **Money taken; service not delivered.** This affects 100% of recurring + combo guest checkouts.

Why PR-14's tests miss it:
- `test/pr14-guest-recurring-lp-attribution.spec.ts:443,471,498` — every assertion that exercises `convertGuestToUser` calls `service.handlePaymentSucceeded('pi_rec')` DIRECTLY on the service instance, bypassing the real `BillingService.handleEvent` dispatcher and its metadata gate. The "reaches the fan-out hook EXACTLY ONCE" test never validates that production routing would actually deliver the event into `handlePaymentSucceeded`.
- The "idempotent replay" test (line 294-318) replays `createIntent` — not a Stripe webhook event — so it doesn't catch the webhook-routing gap either.

**Concrete fix:** Bind the recurring guest path so the webhook dispatcher can find it. At minimum one of:
- (a) `src/billing/billing.service.ts:280-328` — add a sibling routing branch for `payment_intent.succeeded` that, when the event has NO `[GUEST_CHECKOUT_METADATA_KEY]` in the PI metadata, falls back to looking up the GuestCheckout row by `stripe_payment_intent_id` directly (`prisma.guestCheckout.findUnique({ where: { stripe_payment_intent_id: pi.id } })`) and routes to `handlePaymentSucceeded` if a row is found. This is what `handlePaymentSucceeded` itself already keys off.
- (b) `src/connect/stripe-connect-api.service.ts:411-435` — also pass the metadata through to the subscription's invoice/PI surface: subscriptions accept `payment_settings[save_default_payment_method]` etc. but do NOT have a documented `payment_intent_data` for child invoices; the cleanest path is to set `invoice_settings[default_payment_method_for_invoice]` etc., or to set `metadata` on the subscription AND then on the first invoice via a separate `invoices.update` call AFTER `expand[0]=latest_invoice.payment_intent` returns. Easier: include `tgp_client_user_id`/`[GUEST_CHECKOUT_METADATA_KEY]` on the subscription metadata AND add a `customer.subscription.created/invoice.paid` branch in `BillingService` that finds the GuestCheckout sentinel by `stripe_subscription_id` and runs the same conversion path.
- (c) Refactor so the recurring guest path creates the ClientPurchase up-front (before the first webhook) — like the in-app `createPaymentIntentForClient` reservation pattern — so `applySubscriptionUpdated` / `applyInvoicePaid` claim it naturally. This is the most invasive but matches what the in-app code already does.

Whichever option is taken, the test contract must add an integration-shape test that drives a `payment_intent.succeeded` (or `invoice.paid`) event through `BillingService.handleEvent` and asserts the recurring guest ends up `converted` with a ClientPurchase + fan-out call. Calling `handlePaymentSucceeded` directly is insufficient to catch this class of bug.

---

## P1 findings

### P1-1 — Combo first-invoice over-collects platform/head-coach fees by sizing `application_fee_percent` against `recurring_amount_cents` only while the first invoice charges `recurring_amount_cents + amount_cents`. The coach (and head-coach when applicable) under-receives funds on every combo first invoice; subsequent renewals are correct.

Trace:
- `src/storefront/guest-checkout.service.ts:751-768`:
  ```ts
  const recurringAmountCents = isCombo
    ? (pkg.recurring_amount_cents ?? 0)
    : pkg.amount_cents;
  const plan = await this.feePolicy.planFor(pkg.coach_id, recurringAmountCents);
  const applicationFeeForStripe =
    plan.application_fee_cents + plan.head_coach_split_cents;
  const applicationFeePercent =
    applicationFeeForStripe > 0 && recurringAmountCents > 0
      ? CheckoutService.toStripeApplicationFeePercent(
          applicationFeeForStripe,
          recurringAmountCents,
        )
      : undefined;
  ```
- The fee plan and the rounding helper are sized against `recurring_amount_cents` only. The percent is then passed to `createSubscription` and Stripe applies it to the WHOLE first-invoice total — which, for combo, is `recurring_amount_cents + amount_cents` (the one-time half is added via `add_invoice_items` at `stripe-connect-api.service.ts:424-426`).
- Concrete example: `amount_cents=29900` (one-time $299), `recurring_amount_cents=4900` ($49/mo). `toStripeApplicationFeePercent` ceil-rounds the percent so that `Math.round(percent/100 * 4900) >= application_fee_cents` from `planFor(4900)`. With Stripe applying that same percent to a $348 first invoice, the platform collects ~7× the contracted slice on the one-time portion of the combo first invoice; the head-coach (when present) also gets over-extracted from the destination amount, leaving the selling coach short on what they were quoted.
- Renewals are fine because the recurring-only invoice matches the basis the percent was sized against.

**Concrete fix:** Size `applicationFeePercent` against the combo first-invoice total. For combo:
```ts
const firstInvoiceCents = isCombo
  ? pkg.amount_cents + (pkg.recurring_amount_cents ?? 0)
  : pkg.amount_cents;
// FeePolicyService.planFor should still be called per-leg if the policy
// has different bps for one-time vs. recurring, but the percent must be
// sized against firstInvoiceCents so the gross applied by Stripe matches.
```
Or: model combo more honestly by minting a one-time PaymentIntent for the upfront half and a separate subscription for the recurring half, fee-split per leg — at the cost of two confirmations. The brief's stated contract is a single confirmation, so prefer the first option.

### P1-2 — `mintRecurringForGuest` writes only to the existing GuestCheckout sentinel row but does NOT verify that a webhook-delivered `payment_intent.succeeded` can later locate the row. Combined with P0-1, the row remains stuck in `status='pending'` after the buyer's payment confirms — the lost-webhook reconciler (`src/storefront/lost-webhook-reconcile.service.ts`) does call `handlePaymentSucceeded` on rows older than 30s, but `handlePaymentSucceeded` itself only flips `pending → paid` on rows whose `stripe_payment_intent_id` matches the PI id passed in. It does NOT detect that the underlying PI was already confirmed on Stripe's side, so the reconciler also no-ops for recurring guests until/unless a future job calls it with the right PI id.

Even after P0-1 is fixed, you should add either (a) a `paid_at`-driven Stripe-status re-check, or (b) an additional lookup branch that scans pending GuestCheckout rows whose `stripe_subscription_id` is non-null and asks Stripe whether the subscription is `active`.

### P1-3 — Recurring guest path passes only a partial set of binding metadata on the subscription, so the existing `applySubscriptionUpdated` metadata-fallback at `src/checkout/checkout-webhook-handler.service.ts:308-319` refuses to claim. The handler requires `tgp_client_user_id`, `tgp_coach_user_id`, `tgp_package_id`, AND the customer id all from the metadata, but the guest mint at `guest-checkout.service.ts:782-789` deliberately omits `tgp_client_user_id` (the User doesn't exist yet). Result: even if a code path later tried to use this fallback, it would silently `missing_binding_metadata` for every guest-recurring subscription. Couple this with P0-1 and there is no working subscription-webhook entry into the conversion path. The fix landed alongside P0-1 should make the recurring-binding logic understand "no client user yet — look up GuestCheckout by subscription id instead."

### P1-4 — `mintRecurringForGuest` runs Stripe HTTP (`createCustomer`, `ensurePriceForPackage`/`ensureRecurringPriceForPackage` which themselves call `createProduct`/`createPrice`, and `createSubscription`) AFTER the GuestCheckout sentinel row has been INSERTED but BEFORE the sentinel patch update at `guest-checkout.service.ts:636-647`. If the process dies mid-flight between sentinel insert and patch (Fly redeploy, OOM, network blip on the patch UPDATE) the row stays in `pending` with `stripe_payment_intent_id = "pending_<key>"` indefinitely. The cleanup at `guest-checkout.service.ts:436-449` only fires on the NEXT request with the same `idempotency_key`, which the buyer's storefront SDK won't issue (they're stuck on the original token). The replay path at `replayExistingIntent` short-circuits to `return null` for pending_<key> sentinels (line 873-874), but only when the caller is hitting `createIntent` again. The lost-webhook reconciler also only fires on rows with a real PI id. Net effect: a customer left with a paid Stripe subscription whose Tier GP-side sentinel is stuck pending forever (until human intervention). The one-time path has the same shape but the window is much smaller (one Stripe call vs. up to five for combo). At minimum, this PR should patch the sentinel with `stripe_subscription_id` and `stripe_customer_id` BEFORE confirming the PI is in `requires_payment_method`, so a partial-state recovery path has the ids it needs.

---

## P2 findings

### P2-1 — `mintRecurringForGuest` declares CheckoutService and FeePolicyService as `@Optional()` (`guest-checkout.service.ts:210-213`) and falls back to 503 if either is missing (lines 713-722). On production the StorefrontModule imports CheckoutModule + the FeePolicyService is provided transitively, but the `@Optional()` wiring means a wiring-bug regression (e.g. CheckoutModule import accidentally dropped during a future refactor) silently turns every recurring guest purchase into a 503 — observable only via logs, not via a module-boot failure. The "fail-fast at boot" pattern used elsewhere (e.g. `NotificationsService` in this same constructor is HARD per the comment at lines 169-186) is preferable for any service that participates in the money path.

### P2-2 — `createPrice` widening to accept `'week' | 'month' | 'year'` (stripe-connect-api.service.ts:344) is correct, but `checkout.service.ts:870-875` and `checkout.service.ts:932-934` cast `pkg.interval as 'week' | 'month' | 'year'` without runtime validation. `CoachPackage.interval` is a free-form `String?` column in Prisma — a corrupt row (e.g. `'daily'` written by a future migration that wasn't typed) would propagate to Stripe and return an opaque 400. Add a runtime guard before the cast so the failure mode is a typed 422 / 500 with a readable error, not a Stripe 400 bubbled to the buyer.

### P2-3 — `convertGuestToUser`'s recurring branch hard-codes `status: 'active'` on the new ClientPurchase (`guest-checkout.service.ts:1523`). This is correct only if the subscription is `active` on Stripe by the time this code runs. With `payment_behavior=default_incomplete` the subscription is `incomplete` UNTIL the buyer confirms the PI client_secret. If the conversion path is ever called before the buyer has confirmed (e.g. a future code change moves `convertGuestToUser` earlier), the ClientPurchase will have `entitlement_active=true` and `status='active'` while Stripe still has the subscription in `incomplete`. Today this is moot because (post-fix to P0-1) `convertGuestToUser` is supposed to run only on `payment_intent.succeeded`, which means the PI confirmed. Still: prefer reading the live subscription status (via `stripeConnect.retrieveSubscription`) outside any tx before hard-coding `'active'`. The doc-comment at lines 1517-1522 even says "the existing applySubscriptionUpdated webhook handler resolves … by reading the live subscription on its first delivery" — but `applySubscriptionUpdated` won't claim this row (see P1-3), so the comment's contract is broken.

### P2-4 — Tests for the recurring path are entirely Stripe-API-mocked (`test/pr14-guest-recurring-lp-attribution.spec.ts:113-148`). The fan-out invocation count assertion is exercised against the in-process service instance, not against an event going through the dispatcher. A single integration test that constructs a synthetic `payment_intent.succeeded` event (or `invoice.paid`) and routes it through `BillingService.handleEvent` would have caught P0-1, P1-1, and P1-3 in one shot.

---

## P3 (non-blocking)

- `guest-checkout.service.ts:330-336` — `hasRecurringComponent` and `isCombo` are computed AFTER the currency rejection at lines 322-328 but BEFORE the minimum-charge guards. The min/max guards check `pkg.amount_cents` only; for a combo, the buyer is actually charged `amount_cents + recurring_amount_cents` on the first invoice and `recurring_amount_cents` per renewal. Stripe enforces its own $0.50 floor per charge, so this isn't broken — but the guards' error messages refer to "the package" without distinguishing the one-time half from the recurring half, which will confuse coaches whose recurring half happens to fall below the floor.
- `guest-checkout.service.ts:719-721` — error message on the misconfigured-DI fallback says "Payment processing temporarily unavailable. Please try again." That's identical to the Stripe-outage message; an operator reading logs cannot distinguish "Stripe is down" from "we shipped a broken module wiring". Different message strings (still safe to surface to the buyer) would speed up incident triage.
- `prisma/migrations/20261207000000_pr14_…/migration.sql` — `CREATE INDEX "ClientPurchase_landing_page_id_idx"` is non-concurrent. On a large production table this would lock the table for the duration. For the brief's "additive" promise to hold under real production load, `CREATE INDEX CONCURRENTLY` is preferable (requires removing the migration from the transaction wrapper Prisma applies, but the rest of the additive contract is preserved).
- `stripe-connect-api.service.ts:434` — `expand[0]=latest_invoice.payment_intent` only one level of expansion. The combo invoice has multiple line items but the PI is the same; no concern here, just noting that any future code which assumes `latest_invoice.lines` is expanded should add another expand index.

---

## Verification of PR claims

- "RECURRING_NOT_SUPPORTED 422 lifted; non-USD still rejected" → **verified true** at `src/storefront/guest-checkout.service.ts:322-328` (currency guard preserved) and 330-336 (recurring guard removed). Storefront GET also dropped the recurring 404 at `src/storefront/storefront.service.ts:118` and still 404s non-USD.
- "Recurring uses Stripe Subscription with `payment_behavior=default_incomplete`" → **verified true** at `src/connect/stripe-connect-api.service.ts:414`.
- "Combo uses `add_invoice_items` so both halves confirm in one PaymentIntent" → **verified true** at `src/connect/stripe-connect-api.service.ts:424-426`. BUT the fee percent is mis-sized for the combo first invoice — see P1-1.
- "Reused PR-6's pricing helper via DI; zero duplication" → **verified true**. `CheckoutService.ensurePriceForPackage` is promoted to public at `src/checkout/checkout.service.ts:849`; `ensureRecurringPriceForPackage` added at line 901; both called from `mintRecurringForGuest` via DI at `guest-checkout.service.ts:742-749`.
- "Preserved single-flight + content-addressable idempotency" — **partially verified**. The `createIntent` single-flight gate (sentinel insert with `@unique` idempotency_key) and content-addressable cache both still gate the recurring branch (`guest-checkout.service.ts:480-546`). **HOWEVER**, the webhook-replay leg of the idempotency contract — what the brief explicitly called out as the merge bar — is **broken by P0-1**: webhook replays of `payment_intent.succeeded` for a recurring subscription's first invoice don't double-mint, but only because they don't fire the convert path AT ALL. Once P0-1 is fixed, the webhook-replay assertion has to be re-validated end-to-end.
- "No sync Stripe HTTP inside any `$transaction`" → **verified true**. `mintRecurringForGuest` is called from `createIntent` outside any `$transaction` (lines 559-572 — sentinel writes already committed, no tx open). `convertGuestToUser`'s `$transaction` body (lines 1460-1606) does DB-only work (`tx.user.upsert`, `tx.clientPurchase.findFirst`/`create`, `tx.guestCheckout.update`, `this.fanout.onPurchaseEntitled(..., tx)`). Stripe HTTP (Customer/Subscription/Price/Product creation, retrievePaymentIntent, retrieveCharge) all run outside the tx. ✓
- "Fan-out hook still fires exactly once for recurring guests" → **NOT VERIFIED in production routing**. The PR-14 test asserts `fanout.onPurchaseEntitled` is called exactly once when `handlePaymentSucceeded` is invoked directly on the service. But under P0-1, real-world recurring webhooks never invoke `handlePaymentSucceeded` for the recurring path, so the fan-out is **never called**, not "exactly once". The test scaffolding gives a false positive.
- "additive nullable migration; ClientPurchase.landing_page_id + GuestCheckout.stripe_subscription_id; NULL-safe; no DROP/RENAME/type-change" → **verified true** at `prisma/migrations/20261207000000_pr14_client_purchase_landing_page_id_and_guest_subscription/migration.sql`. PR-3 did not previously add `landing_page_id` to ClientPurchase (confirmed by grep across all migrations: only R47 added the column on GuestCheckout, PR-14 is the first to add it on ClientPurchase). Default NULL; existing rows unaffected. Index on `landing_page_id` is created non-concurrently — see P3.
- "convertGuestToUser copies landing_page_id and subscription id inside the conversion `$transaction`" → **verified true** at `guest-checkout.service.ts:1543-1557`. The `?? null` fallback at 1557 satisfies NULL-safety.
- "actuals: tsc 0 errors, lint 0 errors / 17 warnings, jest 292 suites / 3548 tests passing, 9 new tests" → **all verified true by this audit**. `tsc --noEmit` exit 0; `npm run lint` 0 errors / 17 pre-existing warnings; `jest --runInBand` 292 suites / 3548 tests passed / 20 skipped / 5 todo / 0 failures (119s).

---

## Summary
- **Blocking defects:** 1 P0 (recurring guest webhooks never reach conversion → money taken, no service delivered), 4 P1 (combo first-invoice fee math, no recovery path for stuck recurring sentinels, broken subscription-binding metadata, partial-state window in mintRecurringForGuest).
- **Quality issues:** 4 P2 (Optional() on money-path deps, type cast without runtime guard, hard-coded `'active'` status, tests skip the dispatcher).
- **The single P0 alone is sufficient to fail the merge bar.** The brief's central claim — that recurring guest purchases now work — is contradicted by the actual wire-up: Stripe will charge the buyer, but Growth Project's database will never reflect a paid subscription, and the buyer will never get into the app. Fix the dispatcher routing (and add an integration-shape test that drives an event through `BillingService.handleEvent`) before merging.
