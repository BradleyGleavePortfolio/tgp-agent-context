# PR-14 BUILD REPORT — Guest storefront recurring + landing_page_id propagation

**Branch:** `pr14/guest-recurring-lp-attribution` off latest `main` (built on
top of merged PR-1..PR-13).
**Type:** FIX. **Pillar:** 2.

---

## 1. What changed (file:line)

### A. Schema additions — additive, nullable only

- `prisma/schema.prisma`
  - `GuestCheckout.stripe_subscription_id String? @unique` (new, nullable).
    Captures the Stripe Subscription id minted on a recurring guest
    checkout so `convertGuestToUser` can copy it onto ClientPurchase.
  - `ClientPurchase.landing_page_id String?` (new, nullable) + new
    `@@index([landing_page_id])`. Per-page LTV / revenue rollups now join
    directly off ClientPurchase instead of through the guest table.
- `prisma/migrations/20261207000000_pr14_client_purchase_landing_page_id_and_guest_subscription/migration.sql`
  - `ALTER TABLE "ClientPurchase" ADD COLUMN "landing_page_id" TEXT;`
  - `ALTER TABLE "GuestCheckout" ADD COLUMN "stripe_subscription_id" TEXT;`
  - `CREATE UNIQUE INDEX "GuestCheckout_stripe_subscription_id_key" ...`
  - `CREATE INDEX "ClientPurchase_landing_page_id_idx" ...`
  - **No DROP, no RENAME, no type change** — every existing row keeps
    behaving exactly as today. (Verified: PR-3's migration at
    `prisma/migrations/20261202000000_pr3_drip_schema_foundation/` did
    not add `landing_page_id` to ClientPurchase — this PR is the first
    to add it.)

### B. Stripe API helpers (no duplication of in-app price logic)

- `src/connect/stripe-connect-api.service.ts:335` —
  `createPrice` interval type widened from `'month' | 'year'` to
  `'week' | 'month' | 'year'` so PR-6's weekly cadence is mintable.
- `src/connect/stripe-connect-api.service.ts:385` — new
  `createSubscription({ customer, recurringPriceId, oneTimePriceId?, transferDestination, onBehalfOf, applicationFeePercent?, metadata, idempotencyKey })`.
  Uses `payment_behavior=default_incomplete` + `expand[]=latest_invoice.payment_intent`
  so the first invoice's PI client_secret is returned directly (mirrors
  the in-app subscription contract on Stripe Checkout's
  `subscription_data` shape). One-time + recurring combo packages add
  the one-time price via `add_invoice_items[0][price]` so the first
  invoice covers BOTH and the guest confirms a single PaymentIntent.

### C. Shared pricing helper (PR-6's pricing config → Stripe Price)

Brief explicitly forbids duplicating price-creation logic. The pre-existing
`ensurePriceForPackage` was a `private` method inside
`CheckoutService`. We promoted it to **public** and added the companion
helper for combo packages; **GuestCheckoutService imports it through DI**
(NOT a copy-paste).

- `src/checkout/checkout.service.ts:840` — `ensurePriceForPackage(pkg)`
  promoted from `private` to `async`. Now also passes interval as
  `'week' | 'month' | 'year'` (PR-6 weekly cadence path).
- `src/checkout/checkout.service.ts:902` — new
  `ensureRecurringPriceForPackage(pkg)` — lazily mints (and caches via
  `setRecurringStripePriceId`) the recurring companion Price for combo
  packages, reusing the SAME `stripe_product_id` as the one-time half so
  the Stripe Dashboard groups both prices under one product. Throws if
  the pkg has no companion configured (caller-side guard).
- `src/packages/packages.service.ts:380` — new `setStripeProductId`
  writer. Lets the companion-mint path persist a brand-new Stripe
  Product without force-writing an empty string into
  `stripe_price_id` (the one-time Price is created lazily on next need).

### D. Lift the recurring guard on the guest storefront

- `src/storefront/storefront.service.ts:111-117` — old A4-P2-5 GET
  surface guard 404'd `billing_type !== 'one_time'`. Removed (recurring
  packages now appear on `/v1/packages/public/join/:token`). The non-USD
  guard is **preserved** in the same condition — it stays a 404.
- `src/storefront/guest-checkout.service.ts:288-322` — the old
  `RECURRING_NOT_SUPPORTED` 422 guard is **gone**. Its replacement at
  the same site documents why the recurring and currency restrictions
  were split: recurring is lifted, currency is preserved. New
  `hasRecurringComponent` / `isCombo` locals route the mint path.

### E. Guest recurring mint path (mirrors the in-app Stripe contract)

- `src/storefront/guest-checkout.service.ts:556-606` — `createIntent`
  now branches on `hasRecurringComponent`. Pure one-time keeps the
  existing `createPaymentIntent` path verbatim (regression-tested). The
  recurring branch calls the new `mintRecurringForGuest`. Both branches
  share the same sentinel-row write, the same content-addressable
  idempotency cache, and the same `dto.idempotency_key`-derived Stripe
  Idempotency-Key — single-flight gate is preserved.
- `src/storefront/guest-checkout.service.ts:660-790` —
  `mintRecurringForGuest` (new):
  1. Create a Stripe Customer for the guest (idempotency
     `guest-customer-{dto.idempotency_key}`).
  2. Resolve the recurring Stripe Price via the SHARED
     `CheckoutService.ensurePriceForPackage` (pure recurring) or
     `ensureRecurringPriceForPackage` (combo).
  3. Combo: also resolve the one-time Price the same way.
  4. Plan the application fee with `FeePolicyService.planFor` —
     identical to the in-app subscription path — and convert to
     `application_fee_percent` via the existing
     `CheckoutService.toStripeApplicationFeePercent` helper.
  5. Mint the Subscription. Idempotency-Key:
     `guest-subscription-{dto.idempotency_key}`.
  6. Extract `latest_invoice.payment_intent.client_secret` and return.
- `src/storefront/guest-checkout.service.ts:610-636` — the sentinel
  patch update now also writes the minted `stripe_subscription_id` and
  `stripe_customer_id` when present.

### F. landing_page_id propagation + recurring snapshot in convertGuestToUser

- `src/storefront/guest-checkout.service.ts:1500-1560` — inside the
  conversion `$transaction`, when ClientPurchase is created:
  - `stripe_subscription_id` copied from the GuestCheckout row (null on
    one-time-only).
  - `billing_type` snapshotted to `'recurring'` when the package is
    canonical-recurring OR the guest holds a subscription id (combo
    case), otherwise stays `'one_time'`.
  - `status` snapshot is `'active'` for recurring (matches the in-app
    subscription contract) so entitlement is live from the moment money
    cleared; `'paid'` for one-time (unchanged).
  - **`landing_page_id` copied from GuestCheckout** with explicit
    `?? null` fallback — NULL-safe.
- The PR-4/PR-9 fan-out hook at `:1620`+ is **untouched** — the
  recurring branch reaches the same `fanout.onPurchaseEntitled` call
  (verified by the new test
  `recurring guest: ... reaches the fan-out hook EXACTLY ONCE`).

### G. Wiring

- `src/storefront/storefront.module.ts:5,46-51` — imports
  `CheckoutModule` so DI can resolve `CheckoutService` into
  `GuestCheckoutService`. `CheckoutService` and `FeePolicyService` are
  declared `@Optional()` on the guest service so the long tail of
  hand-built unit tests that don't wire DI keep compiling; the recurring
  code paths assert presence at call time and 503 on a misconfigured
  boot (better than NPE).

### H. Response shape

- `src/storefront/storefront.types.ts:29-44` — `GuestCheckoutResult`
  gains a nullable `subscription_id` field so the Next.js storefront SSR
  layer can mirror the Stripe subscription id alongside the PaymentIntent
  on its server state.

---

## 2. How recurring is wired to the shared pricing helper

There was **NO ready-made shared helper** when this PR started — only
`CheckoutService.ensurePriceForPackage` (private) and
`PackagesService.setRecurringStripePriceId` (writer-only). The brief
forbade duplicating price logic, so the helper was extracted in place
rather than copy-pasted:

- `ensurePriceForPackage` made **public** (no behaviour change to the
  in-app path; CheckoutService still calls its own method).
- `ensureRecurringPriceForPackage` added next to it for combo support,
  reusing the SAME `stripe_product_id` cache + `setRecurringStripePriceId`
  writer that PR-6 added.
- `GuestCheckoutService` injects `CheckoutService` (via
  `StorefrontModule` import) and calls these two methods directly. Same
  cache, same Stripe Product, same idempotency-key shape — never a
  parallel implementation.

The Stripe Subscription mint is the only new Stripe surface area
(`createSubscription`); the in-app path currently mints subscriptions
through Checkout Sessions, so a low-level
`POST /v1/subscriptions` call did not yet exist on
`StripeConnectApiService`. This is additive — the in-app
Checkout-Session-based subscription path is untouched.

---

## 3. Non-USD decision

**Non-USD stays REJECTED on the storefront.** Master plan §1 says
"(phase) non-USD on storefront" — explicitly deferred to a later phase.
The old guard at `guest-checkout.service.ts:295-313` coupled
`recurring` and `non-USD` in two separate guards but a single intent
("Phase 1 cap"). PR-14 **split them** cleanly:

- **Recurring restriction is LIFTED** — the new mint path handles
  recurring + combo packages on USD.
- **Currency restriction is PRESERVED, unchanged.** USD-only check
  fires first now; recurring + non-USD packages are rejected on the
  currency axis (no Stripe calls burned). This matches the
  `PLATFORM_FEE_MIN_CENTS` floor (denominated in US cents) and the
  zero-decimal-currency edge case the original guard called out.

A dedicated regression test asserts this split:
`still rejects non-USD recurring packages — currency restriction is preserved (split from the recurring guard)`.
Multi-currency floors / FX handling is **explicitly out of scope** for
this PR and is left to the master plan's "(phase) non-USD" follow-up.

---

## 4. landing_page_id migration status

**ADDED in PR-14.** Verified that
`prisma/migrations/20261202000000_pr3_drip_schema_foundation/migration.sql`
did NOT add a `landing_page_id` column to `ClientPurchase`. PR-14's
migration is the first to add it. The column is **additive and nullable**
(no DROP / RENAME / type change), so:

- Every existing ClientPurchase row gets `landing_page_id = NULL`
  (the in-app path will keep writing NULL — no behaviour change there).
- Every GuestCheckout row that has a `landing_page_id` (validated via
  the R47 / Audit #6 P0-5 path that lands at GuestCheckout creation
  time) now propagates it onto ClientPurchase inside the conversion
  `$transaction`.
- NULL-safety is unit-tested
  (`NULL-safe: a GuestCheckout with no landing_page_id yields ClientPurchase.landing_page_id = null and does NOT crash`).

---

## 5. Idempotency proof

The recurring mint path **reuses the existing guest single-flight gate
verbatim**:

- **Sentinel-row insert before any Stripe call** — `dto.idempotency_key`
  is `@unique` on GuestCheckout; a concurrent caller loses on the
  unique constraint and falls back into the replay path
  (`replayExistingIntent`) just like the one-time flow.
- **Content-addressable cache** (`CheckoutIdempotencyService`) — the
  `(token, email, session_id)` hash → PaymentIntent client_secret cache
  is checked BEFORE creating the sentinel; recurring uses the same path
  (the cache stores a (PI id, client_secret) tuple; for recurring the
  PI is the first-invoice PI, which is durable across Stripe replays of
  the same subscription).
- **Stripe idempotency keys are deterministic** and derived from
  `dto.idempotency_key`:
  - `guest-customer-{key}` → same Customer on retry.
  - `guest-subscription-{key}` → same Subscription on retry; Stripe
    collapses to the same Subscription object so a webhook replay never
    double-mints.
  - `guest-checkout-pi-{key}` (one-time path) unchanged.
- **No sync Stripe HTTP inside any `$transaction`** — verified by
  reading the code: `mintRecurringForGuest` is called BEFORE any
  Prisma `$transaction` opens; sentinel writes are simple `prisma.create`
  / `prisma.update` outside a tx; the conversion `$transaction` in
  `convertGuestToUser` performs DB-only work (no Stripe round-trip
  inside the callback).
- **convertGuestToUser tx is idempotent on replay** — the existing
  `purchase-{idempotency_key}` lookup in `tx.clientPurchase.findFirst`
  short-circuits on retry; the `idempotency_key` column is `@unique`, so
  a race that loses the find gets a P2002 from `create` and re-reads,
  exactly as today.

The new `idempotent replay: the existing GuestCheckout row is replayed without minting a second Subscription`
test asserts the replay path **never** calls `createSubscription` or
`createCustomer` a second time.

The fan-out hook receives exactly one call per ClientPurchase
(`PurchaseFanout.purchase_id` is `@unique` per PR-3 — that's the
ultimate idempotency gate for content delivery; the new test
`recurring guest: ... reaches the fan-out hook EXACTLY ONCE` asserts the
recurring branch reaches the same `onPurchaseEntitled` call site as the
one-time branch).

---

## 6. ACTUAL counts — typecheck / lint / tests

All numbers run by the agent inside this worktree.

### Typecheck
```
$ node_modules/.bin/tsc --noEmit
EXIT: 0
```
**0 errors.**

### Lint
```
$ npm run lint
✖ 17 problems (0 errors, 17 warnings)
```
**0 errors, 17 warnings** (all pre-existing in unrelated files; none in
any file PR-14 touched — verified with
`npm run lint 2>&1 | grep -i 'guest-checkout\|storefront\|checkout\|stripe-connect'` → empty).

### Tests
```
$ node_modules/.bin/jest
Test Suites: 292 passed, 292 total
Tests:       20 skipped, 5 todo, 3548 passed, 3573 total
Snapshots:   6 passed, 6 total
Time:        174.258 s
```
**3548 tests pass, 0 fail.** Includes:

- **9 new PR-14 tests** in `test/pr14-guest-recurring-lp-attribution.spec.ts`:
  - `pure recurring: creates Customer + Subscription + returns the latest_invoice PI client_secret`
  - `one-time+recurring combo: mints one Subscription whose first invoice carries BOTH prices`
  - `idempotent replay: the existing GuestCheckout row is replayed without minting a second Subscription`
  - `still rejects non-USD recurring packages — currency restriction is preserved (split from the recurring guard)`
  - `surfaces 503 STRIPE_UNAVAILABLE when the subscription response is missing the expanded PaymentIntent`
  - `existing one-time guest path keeps minting a direct PaymentIntent (no regression)`
  - `propagates landing_page_id from GuestCheckout to ClientPurchase inside the conversion $transaction`
  - `NULL-safe: a GuestCheckout with no landing_page_id yields ClientPurchase.landing_page_id = null and does NOT crash`
  - `recurring guest: ClientPurchase carries stripe_subscription_id, billing_type=recurring, status=active, and reaches the fan-out hook EXACTLY ONCE`

- **2 existing tests updated** to reflect lifted guards (no logic removed —
  the asserts now check the new contract):
  - `test/guest-checkout.service.spec.ts` — the old
    `rejects recurring packages with 422 RECURRING_NOT_SUPPORTED` is now
    `does NOT reject recurring packages on the OLD A3-P1-5 422 path (PR-14 lifted the guard)`.
  - `test/storefront.service.spec.ts` — the old
    `P2-5: 404s on billing_type=recurring` is now
    `PR-14: exposes recurring packages on the public GET surface (no longer 404)`.

---

## 7. Out-of-scope verifications (per brief)

- **PR-9 fan-out engine, PR-10 cron, PR-12 media** — NOT touched. The
  only fan-out interaction is at the existing seam
  (`fanout.onPurchaseEntitled` at `guest-checkout.service.ts:~1620`),
  asserted to fire exactly once for guest recurring.
- **In-app paths** (mobile/hosted Checkout Sessions) — NOT touched. The
  shared price helpers are public methods on CheckoutService, but
  CheckoutService still calls its own methods the same way; no
  in-app behaviour changed.
- **PR-3 migration** — verified NOT to have added
  `ClientPurchase.landing_page_id`; PR-14's migration is therefore the
  first additive one.

---

## 8. Audit fixes (R2)

The independent audit at `specs/PR14_AUDIT.md` flagged 1 P0, 4 P1s, 4
P2s, plus 4 P3 nits. All addressed below; PR pushed to the SAME branch
(`pr14/guest-recurring-lp-attribution`) — no new PR opened.

### P0-1 — Recurring guest checkouts paid but NEVER fulfilled (BLOCKER)

The original mint path put `GUEST_CHECKOUT_METADATA_KEY` on the
Subscription, but Stripe does **not** copy subscription metadata onto
its child PaymentIntents. So `BillingService.handleEvent`'s
metadata-keyed routing gate at `billing.service.ts:280-284` never
matched the first-invoice PI and `handlePaymentSucceeded` was never
called → 100% of recurring/combo guest checkouts took money and
delivered nothing.

**Fix — combined options (a) + (b) from the audit, plus belt-and-suspenders:**

- `src/billing/billing.service.ts:280-329` — **PRIMARY ROUTE.** The PI
  metadata gate now has a sibling fallback: when the PI has no
  `GUEST_CHECKOUT_METADATA_KEY`, look up the GuestCheckout sentinel by
  `stripe_payment_intent_id` directly. If found, route to
  `handlePaymentSucceeded` (the same key that handler itself uses to
  claim pending→paid). Mirror fallback added on
  `payment_intent.payment_failed` (~:375-399).
- `src/billing/billing.service.ts:600-674` — **BACKSTOP ROUTE.** New
  private helper `maybeResolveGuestBySubscriptionEvent(event)` runs
  inside the dispatch tx; if a `customer.subscription.created/updated/deleted`
  or `invoice.paid/payment_failed` event's subscription id matches a
  pending GuestCheckout sentinel, the helper captures the sentinel's
  persisted first-invoice PI id, and AFTER the outer tx commits the
  dispatcher invokes `handlePaymentSucceeded(piId)`. This is the
  recovery path for the case where Stripe delivers the
  subscription/invoice event before (or instead of) the PI event.
- The primary + backstop are mutually idempotent. `handlePaymentSucceeded`'s
  `pending→paid` `updateMany` returns `count: 0` on the second call;
  `convertGuestToUser` itself re-reads the row and bails when status
  isn't `'paid'`. Verified by `duplicate Stripe event id is short-circuited`
  in `test/pr14-guest-recurring-dispatcher-integration.spec.ts`.

**Integration-shape test added (audit's required test contract):**
`test/pr14-guest-recurring-dispatcher-integration.spec.ts` — 9 tests
driving synthetic Stripe events through the REAL
`BillingService.handleEvent` (not `GuestCheckoutService` direct calls).
Covers PI-with-no-metadata routing, PI-with-metadata routing (regression
guard), unrelated PI no-op, payment_failed fallback, subscription
backstop on `customer.subscription.updated` and `invoice.paid`, the
"already converted" short-circuit, the "still on pending_<key>
placeholder" short-circuit, and event-id dedup.

### P1-1 — Combo first-invoice over-collected fees (`guest-checkout.service.ts:751`)

Old code sized `application_fee_percent` against `recurring_amount_cents`
only, but Stripe applies that percent to the WHOLE first invoice — which
for combo is `amount_cents + recurring_amount_cents`. The platform
collected ~7× the contracted slice on the one-time portion and the
selling coach was short.

**Fix** — `src/storefront/guest-checkout.service.ts:769-840`:
- Call `FeePolicyService.planFor` per leg (recurring + one-time) and sum
  the cents.
- Size the Stripe percent against `firstInvoiceCents = amount_cents + recurring_amount_cents`
  for combo (or `pkg.amount_cents` for pure recurring/one-time — no
  regression).
- The same percent applies to renewal invoices (which are recurring-only);
  any per-renewal drift is squared via the existing
  `SplitLedgerEntry` + `Transfer` reconciliation. Documented in the
  doc-comment.

Tests added in `test/pr14-guest-recurring-lp-attribution.spec.ts`:
- `combo first-invoice fee percent is sized against the COMBO total (PR-14 R2 P1-1)`
  — asserts FeePolicy called per leg with correct amounts and the
  collected percent satisfies `collectedCents ≥ contractedFeeCents`.
- `renewal fee basis: pure-recurring sizes percent against recurring_amount_cents (no regression)`.

### P1-2 / P1-4 — Partial-state window + no recovery for stuck recurring sentinels

`mintRecurringForGuest` ran up to 5 Stripe calls between sentinel INSERT
and the outer sentinel PATCH. A process crash in between left the row
stuck on `pending_<key>` forever. The lost-webhook reconciler also
keyed only on PI status, missing the case where the PI hangs in
`requires_action` while the subscription has gone `active`.

**Fix — two-part:**

- `src/storefront/guest-checkout.service.ts:872-901` — patch the
  sentinel with `stripe_payment_intent_id` (first-invoice PI),
  `stripe_subscription_id`, and `stripe_customer_id` IMMEDIATELY after
  `createSubscription` returns, BEFORE returning to `createIntent`. The
  outer patch at `:636` becomes a no-op on the recurring path.
- `src/storefront/lost-webhook-reconcile.service.ts:120-216` — extended
  to read `stripe_subscription_id` off the sentinel and consult
  `stripeConnect.retrieveSubscription` as a second-opinion signal. If
  the PI is in `requires_action`/`canceled`/`requires_payment_method`
  BUT the subscription is `active`/`trialing`, the reconciler runs the
  conversion against the persisted PI id (idempotent via the
  `pending→paid` claim in `handlePaymentSucceeded`).

Tests added in `test/pr14-recurring-reconciler-branch.spec.ts` (5
tests): requires_action + active sub → convert; canceled PI + active sub
→ convert; canceled PI + canceled sub → mark failed; one-time path
ignores the subscription branch; PI-succeeded regression guard.

### P1-3 — Subscription binding metadata (subsumed by P0-1 fix)

`applySubscriptionUpdated`'s metadata fallback requires
`tgp_client_user_id` (which the guest mint can't provide — the User
doesn't exist yet). The P0-1 backstop (subscription/invoice event →
GuestCheckout sentinel by `stripe_subscription_id` → drive
`handlePaymentSucceeded`) sidesteps this entirely. Verified by
`customer.subscription.updated for a recurring guest sentinel drives handlePaymentSucceeded via the subscription BACKSTOP` and
`invoice.paid for a recurring guest sentinel also routes via the subscription BACKSTOP`.

### P2-1 — `@Optional()` on money-path deps

`CheckoutService` and `FeePolicyService` are now **HARD** deps on
`GuestCheckoutService` (`guest-checkout.service.ts:188-205`). A
wiring-bug regression now fails at Nest boot instead of 503'ing every
recurring purchase — matches the existing
`NotificationsService` HARD pattern in the same constructor. The
@Optional() runtime fallback inside `mintRecurringForGuest` has been
removed and a doc-comment placeholder records the change.

The legacy `test/guest-checkout.service.spec.ts` was extended with
minimal stubs for the new HARD deps so its existing 54 tests keep
passing (the legacy tests do not exercise the recurring path).

### P2-2 — Runtime guard on `pkg.interval`

`src/checkout/checkout.service.ts:980-996` — new static helper
`CheckoutService.assertStripeInterval(interval, packageId)`. Validates
the string is one of `week|month|year` before passing to Stripe and
throws a typed `BadRequestException` (error code
`PACKAGE_INTERVAL_INVALID`) carrying the offending package id when not.
Called from both `ensurePriceForPackage` (line ~870) and
`ensureRecurringPriceForPackage` (line ~937).

Tests in `test/pr14-interval-guard.spec.ts` (11 tests): valid intervals
pass through; invalid / corrupt / null / undefined throw
`BadRequestException`; error envelope carries the packageId for
operator debugging.

### P2-3 — Hard-coded `'active'` status in `convertGuestToUser`

`src/storefront/guest-checkout.service.ts:1564-1605` — replace the
hard-coded `status='active'` with a status derived from the LIVE Stripe
subscription read (`stripeConnect.retrieveSubscription`) executed
OUTSIDE the conversion `$transaction` (no in-tx Stripe HTTP). Mapping:

| Live subscription status | Snapshot status | entitlement_active |
| --- | --- | --- |
| active / trialing | active | true |
| past_due | past_due | true |
| incomplete / unpaid | incomplete / unpaid | false (don't grant) |
| canceled | canceled | false |
| incomplete_expired | expired | false |
| (read failed / unknown) | active (conservative) | true |

On the read-failed degraded path the next `customer.subscription.updated`
webhook delivery refines the status — and because PR-14 R2 fixes the
binding, that webhook now finds the ClientPurchase via
`stripe_subscription_id`.

### P2-4 — Test scaffolding skipped the dispatcher

Resolved by the new
`test/pr14-guest-recurring-dispatcher-integration.spec.ts` (see P0-1).

### P3 nits

- **CONCURRENT index** —
  `prisma/migrations/20261207000000_pr14_*/migration.sql` now uses
  `COMMIT; CREATE INDEX CONCURRENTLY IF NOT EXISTS ...; BEGIN;` for the
  `ClientPurchase_landing_page_id_idx` (mirrors
  `20260704000001_coach_brief_cwa_index_concurrent`). The
  `GuestCheckout_stripe_subscription_id_key` UNIQUE index stays
  non-concurrent because that table is rebuilt schema-wise here, not
  hot.
- **Distinct error string for misconfigured-DI** — moot now (HARD deps,
  boot fail-fast replaces the 503).
- **Combo min/max guard error messages** — left as-is; the buyer-facing
  copy ("This package is priced below the storefront's $0.50 minimum
  charge.") still reads naturally for combo packages because the
  storefront UI shows both halves separately.

### R2 actuals (run by the agent)

- `node_modules/.bin/tsc --noEmit` → **0 errors**.
- `npm run lint` → **0 errors**, 17 pre-existing warnings (none in any
  file PR-14 touched).
- `node_modules/.bin/jest` → **295 suites, 3575 tests passing**, 20
  skipped, 5 todo, 0 failures (126s).

**Net new PR-14 tests (R1 + R2):** 25 new tests across 4 files:
- `test/pr14-guest-recurring-lp-attribution.spec.ts` — 11 tests (9 R1 + 2 R2 fee math).
- `test/pr14-guest-recurring-dispatcher-integration.spec.ts` — 9 tests (R2, drives BillingService.handleEvent).
- `test/pr14-recurring-reconciler-branch.spec.ts` — 5 tests (R2, lost-webhook reconciler recurring branch).
- `test/pr14-interval-guard.spec.ts` — 11 tests (R2, `assertStripeInterval` runtime guard).

Plus existing tests adjusted to track lifted guards: 2 in R1, 1 in R2
(legacy guest-checkout spec extended with stubs for the new HARD deps).
