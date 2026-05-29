# Commerce Hunt — BUYER SIDE (current state + target convergence)

Read-only hunt of the **buyer experience** in TGP — backend (`growth-project-backend-2d534486` @ `d8698b77`) + mobile (`mobile-commerce-hunt-buyer-readonly` @ `8e48a0b1`). Covers (1) logged-in client picking & purchasing a package, (2) guest checkout, (3) web-page (storefront / landing-page) checkout. Cites file:line. All citations against the snapshots above.

> **Author:** Claude Opus 4.7 · **Date:** 2026-05-29.
> **North star:** 3/10 coaches Activated. ICP = trainers $2K–$8K/mo, 10–40 clients. Buyer side is the *last mile* of activation — when a coach turns on packages, every checkout that fails or doesn't fan-out is a directly attributable activation miss.
> Sibling specs: `MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1 (the `AssignableAssetRef` seam this report consumes). `COMMERCE_DRIP_INVENTORY.md` and `COMMERCE_HUNT_COACH.md` were **not** present at write time and are not blocked on.

---

## 0. TL;DR — three independent buyer paths that never converge into a single post-purchase fan-out

1. There are **three distinct checkout entrypoints** and **three distinct purchase-creation code paths** writing into the same `ClientPurchase` table — but the **post-checkout side has zero content fan-out** (no workout assignment, no meal-plan attach, no drip seeding, no welcome push). The only thing that fires today is **revenue-split bookkeeping** (`PurchaseSplitHandlerService.onChargeSucceeded`, `src/checkout/purchase-split-handler.service.ts:63-164`) and, for guests only, a **Supabase invite-link email** (`src/storefront/guest-checkout.service.ts:1615-1706`).
2. There is **no `is_sellable`, no `AssignableAssetRef`, no package↔asset attachment table** anywhere in the schema — the `AssignableAssetRef` seam declared in `MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1 (`is_sellable Boolean`, revision pointer, `resolveWorkoutAsset(...)`) **has not been built**. `CoachPackage` (`prisma/schema.prisma:2937-2989`) is a pure price-tag with `name + description + amount_cents` and **no relation to any deliverable**.
3. The mobile client API layer for in-app purchase (`src/api/clientPaymentsApi.ts`) is **wired to endpoints that don't exist** on the backend (`/v1/clients/me/coach/checkout`, `/v1/clients/me/coach/payment-status`, `/v1/clients/me/coach/checkout/confirm`, `/v1/clients/me/coach/billing-portal`). The backend only ships `/v1/checkout/sessions`, `/v1/checkout/sessions/:sessionId/confirm`, `/v1/checkout/billing-portal`, `/v1/checkout/entitlement`. **Every in-app client checkout 404s silently** and renders the "Self-serve checkout is not enabled yet" empty state (`ClientPackagesScreen.tsx:298-315`). This is a **P0 silent breakage** affecting the entire client-pays-via-app path.
4. **B7 partially fixed, transfer.failed still silently ignored.** `payout.failed`/`payout.canceled` are now routed via `CheckoutWebhookHandlerService.handle` → `RefundDisputeHandlerService.onPayoutEvent` (`src/checkout/checkout-webhook-handler.service.ts:94-97`, `src/checkout/refund-dispute-handler.service.ts:733-763`). **But `transfer.failed` is not handled anywhere** — it falls into `billing.service.ts:372-373` default and is logged as "unhandled" only. A failed transfer to a head-coach (sub-coach selling under a head coach) silently leaks money on the books. **B7 is partially resolved; the `transfer.failed` half is still open.**
5. **Two parallel guest "convert-to-account" flows** with subtly different idempotency semantics: the in-app PaymentIntent flow refuses guests entirely (`checkout.service.ts:368-374` hard-requires `client.coach_id`); the storefront flow has a full guest→Supabase invite-link conversion pipeline (`guest-checkout.service.ts:1168-1342`). There is no single "post-purchase converge here" function — instead, two duplicated ClientPurchase write paths (`storefront/guest-checkout.service.ts:1273-1313` and `checkout/checkout-webhook-handler.service.ts:104-159`/`:320-357`).

---

## 1. Backend commerce surface (inventory)

### 1.1 Modules / files (line counts)
| Module | Path | LOC |
|---|---|---|
| `packages` (CRUD) | `src/packages/{packages.controller, packages.service, packages.dto}.ts` | 502 |
| `checkout` (in-app + webhooks) | `src/checkout/{checkout.controller, checkout.service, checkout-webhook-handler.service, purchase-split-handler.service, dunning.service, refund-dispute-handler.service, admin-analytics.service, payment-ops.controller, checkout.module}.ts` | ~5,800 |
| `storefront` (guest + branded SSR API) | `src/storefront/{storefront-public.controller, storefront.service, guest-checkout.service, checkout-recovery.service, checkout-idempotency.service, checkout-rate-limiter.service, checkout-receipt.{scheduler,service}, checkout-cookie.service, connect-preflight.service, guest-checkout-pii-scrub.service, guest-checkout-reconciliation.service, lost-webhook-reconcile.service, webview-detect.middleware, storefront.{dto,types}}.ts + errors/` | ~5,400 |
| `landing-pages` (coach in-app websites + SSR) | `src/landing-pages/*.ts + crm/` | ~3,800 |
| `billing` (SaaS coach billing + Stripe webhook entry) | `src/billing/*.ts` | ~2,500 |

### 1.2 Endpoint surface (buyer-relevant)

In-app authed client checkout (mobile native flow):
- `POST /v1/checkout/sessions` — `CheckoutController.createSession` (`src/checkout/checkout.controller.ts:101-118`) — Stripe Hosted Checkout, returns `{ session_id, url, purchase_id, status, package }`.
- `POST /v1/checkout/payment-intent` — `CheckoutController.createPaymentIntent` (`:132-141`) — PaymentSheet variant, returns `{ client_secret, ephemeral_key, customer_id, publishable_key }`.
- `GET /v1/checkout/sessions/:sessionId/confirm` — `CheckoutController.confirmSession` (`:238-247`).
- `POST /v1/checkout/billing-portal` (`:209-215`).
- `GET /v1/checkout/entitlement` (`:170-183`).
- `GET /v1/checkout/payment-method` (`:190-192`).
- `GET /v1/checkout/purchases` (`:149-162`).

In-app authed client *catalog* (separate prefix, only GETs):
- `GET /v1/clients/me/coach` — coach profile (`packages.controller.ts:127-153`).
- `GET /v1/clients/me/coach/packages` — list active offers (`:163-172`).
- `GET /v1/clients/me/coach/packages/:id` — fetch one (`:180-190`).

Coach catalog CRUD (seller side, mentioned only for boundary):
- `GET/POST/PATCH/DELETE /v1/coach/packages[/...]` (`packages.controller.ts:41-103`).

Public (guest) storefront API (mounted under `/api` global prefix; consumed by the external `joingrowthproject.com` SSR frontend, NOT served as HTML by this backend):
- `GET /v1/packages/public/join/:token` (`storefront-public.controller.ts:120-123`).
- `POST /v1/packages/public/join/:token/checkout` (`:144-185`).
- `POST /v1/packages/public/join/:token/checkout/resume` (`:218-256`).
- `POST /v1/packages/public/join/:token/checkout/send-recovery-link` (`:277-303`).
- `GET /v1/packages/public/join/:token/checkout/resume/:jwt` (`:331-372`).

Coach landing pages (in-TGP "websites", SSR by NestJS, **excluded** from `/api` prefix — see `src/main.ts:204-210`):
- `GET /p/:coachSlug/:pageSlug` — full SSR HTML (`landing-pages.public.controller.ts:51-77`).
- `GET /p/:coachSlug/:pageSlug/checkout?tier=<package_id>` — 302 to storefront (`:93-121`).
- `POST /p/:coachSlug/:pageSlug/leads` — lead capture (`:134-148`).
- `POST /p/:coachSlug/:pageSlug/view` — sendBeacon analytics (`:161-179`).

Webhook entry: `POST /v1/webhooks/stripe` — `StripeWebhookController.stripe` (`src/billing/stripe-webhook.controller.ts:53-107`). Verifies HMAC with dual-secret rotation support (`stripe-signature.ts`) and dispatches to `BillingService.handleEvent` (`billing.service.ts:140-404`).

### 1.3 DB models (buyer-relevant)
- `CoachPackage` (`prisma/schema.prisma:2937-2989`) — `id, coach_id, name, description, amount_cents, currency, billing_type ('one_time'|'recurring'), interval, interval_count, duration_periods, stripe_price_id, stripe_product_id, is_active, archived_at, share_token, share_link_enabled, share_link_generated_at, share_link_expires_at, share_link_revoked_at`. **No `is_sellable`, no asset linkage, no `package_assets` join table, no `package_revision` for sale-time pinning.**
- `GuestCheckout` (`:3007-3175`) — `id, package_id, stripe_payment_intent_id @unique, stripe_customer_id?, guest_email, guest_name, status (pending|paid|failed|converted|conversion_failed_retryable|conversion_failed_terminal|refunded|disputed), created_user_id?, idempotency_key @unique, retry_count, last_error, last_retry_at, created_at, expires_at, data_retention_at, scrubbed_at, landing_page_id?, last_reconciled_at?, reconcile_attempts, package_snapshot Json?, refunded_at, disputed_at, dispute_reason, receipt_url`.
- `ClientPurchase` (`:3178-3239`) — `id, client_user_id, coach_user_id, package_id, amount_cents, currency, billing_type, stripe_checkout_session_id @unique, stripe_payment_intent_id?, stripe_subscription_id? @unique, stripe_customer_id?, stripe_destination_account?, status (pending|paid|active|past_due|canceled|payment_failed|expired|refunded|chargeback_lost|disputed), entitlement_active, access_expires_at, current_period_end?, cancel_at_period_end, canceled_at?, idempotency_key @unique, stripe_client_secret?, stripe_ephemeral_key?, last_error?`.
- `CoachLandingPage` (`:4256+`) — has `package_ids String[]` (`:4285`). One-way pointer to packages; no inverse FK so a deleted package leaves dangling ids.
- `ConnectCustomer`, `ConnectAccount`, `SplitLedgerEntry`, `ConnectTransfer`, `ChargeRefund`, `ChargeDispute`, `DunningState`, `PaymentReminder`, `StripeProcessedEvent` — all involved on the money path but **out of scope** for buyer fan-out; cited only where relevant.

### 1.4 Stripe webhook event routing matrix (`billing.service.ts:216-374` + `checkout-webhook-handler.service.ts:60-101`)
| Event | Handler chain | Notes |
|---|---|---|
| `checkout.session.completed` | `checkout-webhook-handler.applyCheckoutCompleted` (`:104-160`) → `splits.onChargeSucceeded` | In-app flow only (storefront uses PI, not session). |
| `checkout.session.expired` | `checkout-webhook-handler.applyCheckoutExpired` (`:162-180`) | |
| `customer.subscription.{created,updated,deleted}` | `checkout-webhook-handler.applySubscription{Updated,Deleted}` (`:182-313`) | Has a metadata-fallback rebind for race ordering (`:209-251`). |
| `payment_intent.succeeded` | `checkout-webhook-handler.applyPaymentIntentSucceeded` (`:320-357`) for in-app PI; OR `guestCheckout.handlePaymentSucceeded` for storefront PI (`billing.service.ts:240-300`) | **Disjoint by `metadata[GUEST_CHECKOUT_METADATA_KEY]`** — guest PIs carry `guest_checkout_idempotency_key`, in-app PIs do not. |
| `payment_intent.payment_failed` | in-app: `checkout-webhook-handler.applyPaymentIntentFailed` (`:359-406`); guest: `guestCheckout.handlePaymentFailed` (`billing.service.ts:302-315`) | |
| `payment_intent.requires_action` | log only (`billing.service.ts:319-325`) | 3DS handled client-side. |
| `invoice.paid` / `invoice.payment_succeeded` | `applyInvoicePaid` (`:408-479`) | Renewals re-mint head-coach split. |
| `invoice.payment_failed` | `applyInvoicePaymentFailed` (`:481-524`) → `dunning.recordFailure` | |
| `customer.updated` | `applyCustomerUpdated` (`:526-583`) → mirror default payment method onto `ConnectCustomer`. | |
| `charge.refunded` | First refusal: `refund-dispute-handler.onChargeRefunded` (`refund-dispute-handler.service.ts:103-225`); fallback: `guestCheckout.handleChargeRefunded` (`billing.service.ts:331-348`). | Two paths because guest rows pre-conversion don't yet have a `SplitLedgerEntry`. |
| `charge.refund.updated` | `refund-dispute-handler.onRefundUpdated` (`:227-253`). | |
| `charge.dispute.{created,updated,closed}` | `refund-dispute-handler.{onDisputeOpened,onDisputeUpdated,onDisputeClosed}` (`:441-508`); guest fallback for `created` (`billing.service.ts:351-364`). | |
| `transfer.reversed` | `refund-dispute-handler.onTransferReversed` (`:702-729`). | |
| `payout.paid` / `payout.failed` / `payout.canceled` | `refund-dispute-handler.onPayoutEvent` (`:733-763`) → `payoutReadiness.recordPayoutEvent`. | **B7 PARTIALLY FIXED** here. |
| `transfer.failed` | **NOT handled.** Falls into `billing.service.ts:372-373` default branch: `this.logger.log('Ignoring unhandled Stripe event type: …')`. | **B7 partial: the `transfer.failed` half is still silently ignored.** |
| `account.updated` / `capability.updated` / `account.application.deauthorized` | `applyConnectAccountUpdated/Deauthorized` (`:365-371`). | Coach-side. |

---

## 2. Current state — CLIENT picking & purchasing packages

### 2.1 Real-current page path the client walks
1. **App → More tab → "Coaching plans"** = `ClientPackagesScreen` (`mobile/src/screens/client/ClientPackagesScreen.tsx:108`). Loads:
   - `clientPaymentsApi.getPackages()` → **calls** `GET /v1/clients/me/coach/packages` (`mobile/src/api/clientPaymentsApi.ts:149-166`). Matches backend `ClientPackagesController.list` (`packages.controller.ts:163-172`). **OK.**
   - `clientPaymentsApi.getPaymentStatus()` → **calls** `GET /v1/clients/me/coach/payment-status` (`clientPaymentsApi.ts:202-205`). **NO SUCH ENDPOINT** on the backend; this 404s. Wrapped through `isNotConfigured(err)` (`:124-128`) which collapses 404/501 → `{ok:false, reason:'not_configured'}`. The screen then silently degrades to the "Self-serve checkout not enabled" state (`ClientPackagesScreen.tsx:230-237, 298-315`).
2. Tap "Buy" → `handleBuy(pkg)` (`ClientPackagesScreen.tsx:174-204`) calls `clientPaymentsApi.createCheckoutSession(pkg.id)` → POSTs `/v1/clients/me/coach/checkout` (`clientPaymentsApi.ts:179-189`). **NO SUCH ENDPOINT.** Backend has `POST /v1/checkout/sessions` (`checkout.controller.ts:94`). **Hard 404 → checkoutError banner "Self-serve checkout is not enabled yet. Message your coach."** (`ClientPackagesScreen.tsx:180-186`).
3. **There is a second working buyer screen** — `PackageCheckoutScreen` (`mobile/src/screens/client/PackageCheckoutScreen.tsx:69`) which IS wired to the correct backend (`publicPackagesApi.createCheckoutSession` → `POST /v1/checkout/sessions`, `packagesApi.ts:450-469`). But this screen is **only reachable via `tgp://p/:token` / `https://app.trygrowthproject.com/p/:token` deep-link** (`RootNavigator.tsx:210, 245`), i.e. when a coach **share-link** is opened from outside the app, NOT from the in-app "Coaching plans" tab. The two flows have diverged.
4. After Stripe Hosted Checkout completes, Stripe redirects to `growthproject://checkout/success?session_id=…` or `com.growthproject.app://checkout/success?session_id=…` (`checkout.controller.ts:30-38, 142-149`). `BrandedCheckoutWebViewScreen` intercepts via the deep-link gate, navigates to `CheckoutReturnScreen` (`mobile/src/screens/client/CheckoutReturnScreen.tsx:37`), which calls `clientPaymentsApi.confirmCheckoutSession(sessionId)` → POSTs `/v1/clients/me/coach/checkout/confirm` (`clientPaymentsApi.ts:251-259`). **Backend route is `GET /v1/checkout/sessions/:sessionId/confirm`** (`checkout.controller.ts:236-247`). **Verb + path mismatch → 404 → "Payment received — confirmation pending" warning state** (`CheckoutReturnScreen.tsx:119-137`).
5. Post-purchase: webhook lands → `applyCheckoutCompleted` flips `ClientPurchase.status = 'paid' | 'active'`, sets `entitlement_active = true`, `access_expires_at` (`checkout-webhook-handler.service.ts:135-159`) → `splits.onChargeSucceeded` (revenue split). **Nothing else fires.** No assignment of any workout/meal/PDF/video. No push. No welcome message. No deep-link into "what you just bought".

### 2.2 What the client actually gets after a successful client-checkout today
| Thing | Status |
|---|---|
| `ClientPurchase` row (paid + entitlement_active) | ✅ written by `applyCheckoutCompleted` |
| `SplitLedgerEntry` rows + head-coach transfer queued | ✅ via `purchase-split-handler` |
| `ChargeRefund`/`ChargeDispute` linkage on later events | ✅ |
| In-app push notification "Welcome to <package>" | ❌ |
| In-app system message / chat seed | ❌ |
| Workout plan assigned | ❌ |
| Meal plan assigned | ❌ |
| Any drip schedule | ❌ |
| Receipt email | ❌ (the in-app flow has no email path; only the storefront/guest flow does, `guest-checkout.service.ts:1615-1706`) |
| Coach gets a "X just bought Y" alert | ❌ on this path (coach learns via revenue dashboard / `GET /v1/coach/purchases`) |

### 2.3 Per-component verdict (client-pays path)
| Component | Path | Verdict | Reason |
|---|---|---|---|
| `ClientPackagesScreen` (in-app catalog) | `mobile/src/screens/client/ClientPackagesScreen.tsx` | **RIP-OUT-AND-REBUILD** | Wired to 4 non-existent endpoints; silently renders empty state for every user. Rebuild against `/v1/checkout/sessions` + `/v1/checkout/entitlement` + `/v1/checkout/billing-portal`, OR ship the backend `/v1/clients/me/coach/checkout` controller it expects. |
| `clientPaymentsApi.ts` (mobile API) | `mobile/src/api/clientPaymentsApi.ts` | **RIP-OUT-AND-REBUILD** | Same root cause. The route prefix `/v1/clients/me/coach/...` for write ops doesn't exist on the server. |
| `PackageCheckoutScreen` (share-link variant) | `mobile/src/screens/client/PackageCheckoutScreen.tsx` | **REUSE** | Correctly hits `POST /v1/checkout/sessions`. Good template for the rebuild. |
| `BrandedCheckoutWebViewScreen` | `mobile/src/screens/client/BrandedCheckoutWebViewScreen.tsx` | **REUSE** | URL allow-list + deep-link short-circuit are sound. |
| `CheckoutReturnScreen` | `mobile/src/screens/client/CheckoutReturnScreen.tsx` | **REFACTOR** | Confirm endpoint is the only thing broken; flip POST→GET + fix path to `/v1/checkout/sessions/:id/confirm`. |
| `CheckoutController` + `CheckoutService` | `src/checkout/checkout.{controller,service}.ts` | **REUSE** | Solid: IDOR-blocked (`:103-108`, `:386-391`), idempotent (`:151-181`, `:407-505`), URL allow-list (`:30-38`), per-route Stripe-error mapping. |
| `CheckoutWebhookHandlerService` | `src/checkout/checkout-webhook-handler.service.ts` | **REFACTOR** | Sound for what it covers; needs a **content-fan-out hook** added after `applyCheckoutCompleted` + `applyPaymentIntentSucceeded` (gap below). |
| `PackagesService` | `src/packages/packages.service.ts` | **REFACTOR** | Add `is_sellable` + the asset attachment column(s) per `MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1. |
| `ClientPackagesController` (catalog GET) | `src/packages/packages.controller.ts:111-191` | **REUSE** | |

---

## 3. Current state — GUEST checkout

### 3.1 Real-current page path the guest walks
1. **Coach shares a `share_token` URL** (minted via the coach side; out of scope). Format: `https://joingrowthproject.com/p/<share_token>` (SSR frontend lives in a **separate repo**, not this backend — there is no NestJS controller serving SSR HTML for this path; the backend only serves the API).
2. SSR storefront calls `GET /api/v1/packages/public/join/:token` (`storefront-public.controller.ts:120-123`) → `StorefrontService.getPublicPackageByToken` (`storefront.service.ts:72-203`). Strict gates: token regex (`:77-82`), package active + non-archived + share-link enabled + not revoked + not expired (`:101-121`), `billing_type === 'one_time' && currency === 'usd'` only (`:113-115`), coach not GDPR-deleted (`:130-135`), Connect account ready on **all four axes** — not just `charges_enabled` (`:140-150`, helper `isConnectAccountReadyForCheckout` `:44-55`).
3. Guest fills email + name + Stripe Elements card. SSR posts `POST /api/v1/packages/public/join/:token/checkout` (`storefront-public.controller.ts:144-185`) → `GuestCheckoutService.createIntent` (`guest-checkout.service.ts:212-607`). Lots happens:
   - **Per-route IP rate limiter** at 10/hr (`storefront-public.controller.ts:159-175`).
   - **Live Stripe Connect preflight** with 60s Redis cache (`guest-checkout.service.ts:260-278`).
   - **Currency + billing_type + amount range guards** (`:287-322`).
   - **`landing_page_id` attribution validation** — must be a published `CoachLandingPage` of the same coach AND list this package (`:338-351`).
   - **Content-addressable idempotency cache** keyed on `(token, email, session_id)` (`:358-386`) — recovers a network-dropped retry that rolled a fresh `idempotency_key`.
   - **GuestCheckout sentinel row** inserted FIRST with `stripe_payment_intent_id = pending_<key>` placeholder (`:447-490`); P2002-on-`idempotency_key` triggers the **replay path** (`:494-515`, `replayExistingIntent` `:615-686`).
   - **PaymentIntent mint** with `applicationFeeAmount = platform 2% + Stripe pass-through estimate (2.9% + 30¢)` (`:431-441, 522-548`), `on_behalf_of = connected account` (`:531`), `transferDestination = connected account` (`:528`).
   - **Sentinel patched** with real PI id (`:577-583`).
   - 7-day signed **cookie** dropped on success (`storefront-public.controller.ts:180-184`, `checkout-cookie.service.ts`).
4. Guest confirms with Stripe.js using `stripe_publishable_key` (PLATFORM key, not connected — `storefront.service.ts:152-166`). On success the SSR shows a thank-you. Behind the scenes Stripe sends `payment_intent.succeeded` →
5. `BillingService.handleEvent` → preResolves `receipt_url` outside-tx (`billing.service.ts:90-138, 171`), opens `$transaction`, inserts `StripeProcessedEvent` dedup row (`:180-182`), then dispatches via `payment_intent.succeeded` branch (`:240-300`) → `GuestCheckoutService.handlePaymentSucceeded(piId, chargeInfo)` (`guest-checkout.service.ts:711-802`).
6. **handlePaymentSucceeded**: atomic `pending → paid` claim (`:728-741`), persist `receipt_url` (`:764-780`), then **INLINE** `convertGuestToUser` (`:782-802`) — this used to be `setImmediate` and the audit-3 P1-4 fix made it inline so a Fly redeploy doesn't lose the conversion.
7. **convertGuestToUser** (`:1168-1342`):
   - `ensureSupabaseUser(email, name)` (`:1186-1192, 1379-1472`) — creates Supabase user with `email_confirm: false`, generates an **invite link** (not a password), or finds an existing user by paging `listUsers` up to 50 pages × 200 / 8s deadline (`:1437-1470`).
   - `resolveDestinationAccount(coach_user_id)` (`:1222-1236, 1367-1377`) — throws `DestinationAccountMissingError` if coach disconnected after gate (TOCTOU close).
   - One `$transaction` upserts `User`, attaches `coach_id` for orphan accounts, creates `ClientPurchase` row with `stripe_checkout_session_id = guest_pi_<piId>` sentinel (`:1287-1308`), flips `GuestCheckout.status = 'converted'` (`:1315-1321`).
   - Fires welcome email (`:1337-1341, 1615-1706`) with Resend — invite-link branch or "added to your existing account" branch. Includes Stripe `receipt_url` when available.
8. Lost-webhook reconciliation: `LostWebhookReconcileService` (`src/storefront/lost-webhook-reconcile.service.ts`) + `CheckoutReceiptScheduler` walk rows stuck in `pending > 30s` or `paid > grace`, re-pull from Stripe and re-invoke `handlePaymentSucceeded` (`reconcilePaidCheckout`, `guest-checkout.service.ts:1534-1564`). PII scrub job (`guest-checkout-pii-scrub.service.ts`) hashes `guest_email` and redacts `guest_name` on rows past `data_retention_at` (13 mo) that never converted.

### 3.2 Where guest becomes a real account
- **Guest payment SUCCEEDS first, account is created SECOND.** That ordering is correct for conversion: money is the commit point.
- Account linkage anchor is **Supabase `user.id` ↔ `User.supabase_id` ↔ `ClientPurchase.client_user_id`**. The `GuestCheckout` row keeps a separate `created_user_id` (`prisma/schema.prisma:3037-3038`) and flips status `paid → converted` only after the User row exists.
- **Coach assignment is hardcoded to `checkout.package.coach_id`** in the same transaction (`:1258, 1267-1270`). Orphan-account heal path attaches the coach if the existing User has no `coach_id`, but **never re-routes** an already-attached User to a second coach — they'd buy a package but their `User.coach_id` stays pinned to coach A even though `ClientPurchase.coach_user_id` is coach B. Multi-coach attribution is unsupported.
- **Welcome path is a Supabase magic invite link** (`:1379-1472, 1576-1605`). Used to be a temp-password email — audit #3 P1-9 rewrote it (`:1386-1402`). Link expires in 24h; otherwise the user needs to do password-reset.

### 3.3 Per-component verdict (guest path)
| Component | Path | Verdict | Reason |
|---|---|---|---|
| `StorefrontPublicController` | `src/storefront/storefront-public.controller.ts` | **REUSE** | Excellent: per-route rate-limit scopes, share-token regex pipe, ref-policy on JWT redirects. |
| `StorefrontService.getPublicPackageByToken` | `src/storefront/storefront.service.ts:72-203` | **REUSE** | Hard, enumeration-resistant gates. |
| `GuestCheckoutService.createIntent` | `src/storefront/guest-checkout.service.ts:212-607` | **REUSE** | Most mature surface in the repo — single-flight gate, content-addressable cache, snapshot column, preflight cache. |
| `GuestCheckoutService.handlePaymentSucceeded` + `convertGuestToUser` | `:711-802, 1168-1342` | **REUSE w/ a small REFACTOR** | Add the post-purchase content-fan-out hook here (gap §6). |
| `GuestCheckoutService.handleChargeRefunded` / `handleDisputeOpened` | `:920-1161` | **REUSE** | A276-P1-5 propagate-on-throw so the dedup row rolls back on failure. |
| `CheckoutRecoveryService` + magic-link JWT | `src/storefront/checkout-recovery.service.ts` | **REUSE** | |
| Welcome email (Resend) | `:1615-1706` | **REFACTOR** | Should be re-issued as a `NotificationsService` envelope so it joins the same drip-cadence fan-out as everything else. Today it's a one-off `fetch()` inside guest-checkout — bypasses the unified notification log and can't be inspected from coach tooling. |
| `GuestCheckout` table | `prisma/schema.prisma:3007+` | **REUSE** | Add a `seeded_drip_at DateTime?` column (or its equivalent) when the fan-out lands, so the lost-webhook reconciler can re-drive seeding too. |

---

## 4. Current state — WEB-PAGE checkout (coach/subcoach in-TGP storefront websites)

### 4.1 Real-current page path
1. **Coach creates a landing page** via the in-app authoring flow (out of scope for buyer hunt; `LandingPageService.createPage`). Page has `slug, coach_slug, package_ids String[], status` (`prisma/schema.prisma:4256-4329`). `package_ids` is validated coach-owned at write time (`landing-pages.service.ts:580-600`).
2. **Visitor opens `https://app.trygrowthproject.com/p/:coachSlug/:pageSlug`** — served by `LandingPagePublicController.renderPage` (`landing-pages.public.controller.ts:51-77`) → `LandingPagePublicService.renderPage` → `renderPublicPage()` (`landing-pages.html.ts`). HTML is built inline in `landing-pages.html.ts:577-858`. CDN cached `max-age=60, swr=300`. The CTA `<a href>` points at `/p/:coachSlug/:pageSlug/checkout?tier=<package_id>` (`:851-858`).
3. **Click Buy** → `GET /p/:coachSlug/:pageSlug/checkout?tier=<pkgId>` → `LandingPagePublicController.checkout` (`:93-121`) → `LandingPagePublicService.resolveCheckoutUrl` (`landing-pages.public.service.ts:66-106`):
   - 404 if page not published, tier not in `page.package_ids`, or package not active.
   - Else build `${STOREFRONT_BASE_URL}/v1/packages/public/join/<share_token>?lp=<page_id>` and **302**.
4. Visitor lands on the **external SSR storefront** (`joingrowthproject.com`) — same flow as §3 from here.
5. **`lp=<page_id>` is the *only* attribution link**. Stamped on `GuestCheckout.landing_page_id` (`guest-checkout.service.ts:338-351, 466-474`). No revenue join exists yet from `landing_page_id` back to `ClientPurchase` — the analytics worker would have to traverse `GuestCheckout → ClientPurchase` by PI id.

### 4.2 What's already broken/weird on the web path
- The Buy button **goes through a 302 to the storefront origin instead of a direct API call**. That's fine for SEO/CSRF but it means the SSR storefront has to **re-resolve the package** by calling `GET /v1/packages/public/join/:token` — and any state the landing page added (selected tier, scroll position, UTMs) is lost across the hop unless propagated as query params. Only `lp=` is propagated.
- **Custom domain support exists** (`landing-pages/custom-domain.{controller,service}.ts`, `dns-verifier.ts`, `banned-payment-hosts.ts`) but `landing-pages.public.controller.ts:22-26` carries an open `TODO PR #4` that **the host-header check is not yet wired** — a request hitting a verified custom domain still resolves via `coachSlug/pageSlug` path params, so a coach who set `coaching.example.com` can't actually serve a path-less landing page from it today. Buyer-side this means **the public address bar still has to be `app.trygrowthproject.com/p/...`** even for Pro+ coaches who paid for the custom-domain feature. (Out of buyer scope but it directly affects how a buyer perceives the brand on arrival.)
- **`landing_page_id` does NOT propagate from storefront → ClientPurchase.** The id is captured on `GuestCheckout.landing_page_id` but the `convertGuestToUser` ClientPurchase write (`guest-checkout.service.ts:1287-1308`) drops it on the floor. Per-page $/visitor needs the join through `GuestCheckout`; per-page LTV is structurally broken.
- **CTA copy is hardcoded** "Get started" in `landing-pages.html.ts:858` — coaches can't customize. (Minor.)

### 4.3 Per-component verdict (web path)
| Component | Path | Verdict | Reason |
|---|---|---|---|
| `LandingPagePublicController` + `LandingPagePublicService` | `landing-pages.public.{controller,service}.ts` | **REUSE** | Clean separation of SSR + analytics + checkout-redirect. |
| `landing-pages.html.ts` (SSR template) | `landing-pages.html.ts` | **REFACTOR** | Move the CTA copy + tier-card markup to coach-configurable schema (`section-schemas.ts`). |
| Custom domain pipeline | `landing-pages/custom-domain.*` | **REFACTOR** | Wire the host-header check the TODO calls out. |
| `LeadSyncQueue` + CRM adapters | `landing-pages/crm/*` | Out of buyer scope. | |
| Storefront SSR (external Next.js) | external repo | (not visible to this hunt) | |
| `GuestCheckout.landing_page_id` non-propagation | `guest-checkout.service.ts:1287-1308` | **REFACTOR** | Add `landing_page_id` to ClientPurchase OR propagate in convert (column add). |

---

## 5. Cross-cutting brokenness across all three buyer journeys

| # | Severity | Where | What |
|---|---|---|---|
| 1 | **P0** | `mobile/src/api/clientPaymentsApi.ts:147, 179-189, 202-205, 251-259` vs `src/checkout/checkout.controller.ts:82-247` | The entire in-app client-pays surface is wired to **non-existent backend routes** under `/v1/clients/me/coach/*`. Every call 404s. The screen silently degrades to "not configured". Coaches with active packages, clients who try to buy in-app see only an empty state. **Either ship the missing controller or rebuild the mobile API to call `/v1/checkout/*`.** |
| 2 | **P0** | `mobile/src/screens/client/CheckoutReturnScreen.tsx:53-54` vs `src/checkout/checkout.controller.ts:236-247` | `confirmCheckoutSession` POSTs to `/v1/clients/me/coach/checkout/confirm` but backend is `GET /v1/checkout/sessions/:sessionId/confirm`. Result is a permanent "Payment received — confirmation pending" warning state even on successful charges. |
| 3 | **P0 / B7-residual** | `src/billing/billing.service.ts:372-373` | **`transfer.failed` is still silently logged & dropped.** `payout.failed` is handled (`refund-dispute-handler.service.ts:733-763`) — `transfer.failed` is not. A sub-coach selling a package whose head-coach Transfer fails leaves a `ConnectTransfer.status='pending'` row with no detector and no coach notification. **The original B7 is only half-fixed.** |
| 4 | **P0** | `src/checkout/checkout-webhook-handler.service.ts:135-159, 320-357`; `src/storefront/guest-checkout.service.ts:711-802, 1168-1342` | **No content fan-out exists after any of the three checkout paths.** Today the only post-charge side effects are revenue split + dunning + (guest only) welcome email. No workout, no meal plan, no PDF, no video, no auto-message, no push, no first-day onboarding seed. This is what the brief asks for and what the `AssignableAssetRef` seam (`MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1) is supposed to terminate into. |
| 5 | P1 | `src/packages/packages.service.ts` + `prisma/schema.prisma:2937-2989` | `CoachPackage` has **no `is_sellable`, no asset attachment, no revision pointer** — the entire seam from MASTER_WORKOUT_BUILDER_SPEC §3.2.1 is not built. A coach today cannot answer "what does the buyer actually get". |
| 6 | P1 | `src/checkout/checkout.service.ts:368-374` | **PaymentSheet endpoint (in-app native flow) hard-rejects guests** (`if (!client.coach_id) → PACKAGE_NOT_FOUND`). The hosted Checkout path silently has the same constraint via `:103-108`. So the **only** way a guest can buy is through the storefront PI path; the in-app PaymentSheet UX is permanently gated for logged-in-only buyers. Fine if intentional — but means a coach can't share a link that opens *in their app* for a new buyer. |
| 7 | P1 | `src/storefront/guest-checkout.service.ts:287-292, 299-305` | Storefront **refuses recurring** + **refuses non-USD**. Any coach with a monthly subscription package gets `RECURRING_NOT_SUPPORTED` from a guest link. A subscription is the primary monetization shape for the ICP; this caps web-checkout to one-time programs only. Phase 1 throttle. |
| 8 | P1 | `src/checkout/checkout-webhook-handler.service.ts:75-102, 87-98` | `transfer.reversed` is routed to `RefundDisputeHandlerService.onTransferReversed` from inside `CheckoutWebhookHandlerService.handle`, but `BillingService.handleEvent` never invokes `checkoutWebhooks.handle` on a bare `transfer.*` event because the outer switch (`billing.service.ts:216-374`) doesn't list `transfer.reversed`/`payout.*` — they only reach `RefundDisputeHandlerService` because `checkoutWebhooks.handle` is invoked **unconditionally** at `:193-196` BEFORE the switch. **OK in practice — but the routing is opaque.** If anyone removes the unconditional `handle()` call, three more event families would silently fall to the default branch. |
| 9 | P1 | `src/storefront/guest-checkout.service.ts:1262-1271` | A second-time guest with an existing `User.coach_id` set to coach A who buys coach B's package gets `ClientPurchase.coach_user_id=B` but `User.coach_id` stays at A. **The buyer's primary coach relationship doesn't change.** That's probably what we want for retention but it means in-app the buyer still sees coach A's catalog/profile — totally undiscoverable that they bought from B. |
| 10 | P1 | `src/storefront/guest-checkout.service.ts:1287-1313` | `landing_page_id` not propagated from `GuestCheckout` → `ClientPurchase`. Per-page $/visitor and LTV joins require a 3-table walk and a successful pre-conversion lookup. Add column or copy. |
| 11 | P2 | `mobile/src/api/clientPaymentsApi.ts:124-128` | `isNotConfigured` collapses any 404/501 to `not_configured` — this is what allows the P0 #1 silent breakage to look like "coach hasn't enabled". A 404 to a known-existing endpoint MUST be a different signal than "no endpoint". |
| 12 | P2 | `mobile/src/screens/client/CheckoutReturnScreen.tsx:1-13` and `RootNavigator.tsx:203-205` | Comments say `tgp://checkout/...` but the actual deep-link scheme is `growthproject://` and `com.growthproject.app://` (matches backend, `checkout.controller.ts:30-38`). The doc-string drift will mislead the next dev. |
| 13 | P2 | `src/checkout/checkout.service.ts:151-153` | The Hosted-Checkout idempotency key is `purchase-{client}-{pkg}-{UTC-date}` — but the PaymentSheet path uses `pi-{client}-{client-supplied-uuid}` (`:407`). Two clients buying the same package on the same day via different paths get different keys; a single client buying *the same package twice in one UTC day* via Hosted Checkout collapses to **the same row** even if it's an intentional second purchase. Probably accidental for one-time programs; for recurring it doesn't matter because there's only ever one active subscription per row, but it'd be wrong if duration_periods + one_time means "buy a 12-week block, then buy a second 12-week block on the same day". |
| 14 | P2 | `src/storefront/storefront.service.ts:113-115` | `getPublicPackageByToken` gates recurring/non-USD at the GET — but `createIntent` re-gates at POST (`guest-checkout.service.ts:287-305`). Single source of truth would be `isPublicSellable(pkg)` shared. |
| 15 | P2 | `prisma/schema.prisma:3037-3038` (`GuestCheckout.created_user_id` is nullable, no FK cascade) and `:3193` (`ClientPurchase.stripe_checkout_session_id @unique` is required + uses synthetic `guest_pi_<piId>` for guest rows) | Synthetic-id pattern works but means a future migration that tightens the column gets a footgun. Document or move to a nullable column + a different unique constraint shape. |
| 16 | P2 | `src/landing-pages/landing-pages.public.controller.ts:22-26` | Custom-domain host-header routing TODO. Buyer arriving on a coach's vanity domain today serves the wrong page (or 404). |
| 17 | P2 | `src/checkout/checkout.controller.ts:206-214` | `POST /v1/checkout/billing-portal` is fine but is mounted on the `/v1/checkout` controller — the mobile client's expectation is `/v1/clients/me/coach/billing-portal` (same as #1). |
| 18 | P3 | `src/billing/billing.service.ts:171` (preResolveReceiptUrl) | Pre-resolve is gated on `payment_intent.succeeded` + GUEST metadata — the in-app PI path (which also produces a Stripe-hosted receipt URL) gets no receipt persistence and the in-app flow gives no receipt to the client. |

---

## 6. Post-purchase fan-out — design (buyer-facing half only)

This section terminates the buyer side of the fan-out. It is **not** the drip-scheduler spec; it defines the **hook points**, the **converge function**, and **what the buyer sees immediately vs over time**.

### 6.1 Converge to one function: `onPurchaseEntitled(purchase, ctx)`

Three checkout paths exist, each flips its own `ClientPurchase` row to `entitlement_active = true`:

```
A. In-app Hosted Checkout    → checkout-webhook-handler.applyCheckoutCompleted        :135-159
B. In-app PaymentSheet PI    → checkout-webhook-handler.applyPaymentIntentSucceeded   :320-357
C. Storefront guest PI       → guest-checkout.convertGuestToUser (after ClientPurchase create)  :1287-1313
```

All three must call **one** new service: `PurchaseFanoutService.onPurchaseEntitled(purchase, { entrypoint: 'in_app_hosted'|'in_app_ps'|'storefront_guest', isFirstPurchaseForBuyer: boolean, guestCheckout?: GuestCheckout })`.

The hook is fired **inside the same Prisma `$transaction`** as the entitlement flip so the fan-out side effects commit-or-rollback atomically with the purchase. It writes one *idempotent* `PurchaseFanout` row (`purchase_id @unique`, `state ∈ {pending, in_progress, succeeded, failed}`, `started_at, finished_at, retry_count, last_error`) and emits an outbox row per asset drop. The actual drip-runtime (`PACKAGES_DRIP_FEED_SPEC.md` — a sibling stream) consumes the outbox.

### 6.2 Asset resolution via `AssignableAssetRef` (consuming MASTER_WORKOUT_BUILDER_SPEC §3.2.1)

A package becomes **deliverable** when its row carries N attachments. Schema add (proposal, names land in coach spec):

```prisma
model CoachPackageAsset {
  id              String   @id @default(uuid())
  package_id      String
  package         CoachPackage @relation(fields: [package_id], references: [id], onDelete: Cascade)
  asset_type      String   // 'workout_program' | 'meal_plan' | 'pdf' | 'video' | 'auto_message'
  asset_id        String   // resolver target (e.g. WorkoutProgram.id)
  asset_revision  Int?     // pinned revision for sale (per MASTER_WORKOUT_BUILDER_SPEC §3.2.1)
  drop_cadence    String   // 'immediate' | 'on_day' | 'on_week' | 'weekly_repeating' | ...
  drop_offset_days Int?    // for 'on_day' / 'on_week'
  order_index     Int
  created_at      DateTime @default(now())
  @@index([package_id])
}
```

`CoachPackage.is_sellable Boolean @default(false)` gates whether a package can be sold from a public storefront — a coach with zero `CoachPackageAsset` rows MAY still sell (vintage behaviour) but the fan-out is a no-op for them; the recommendation surface in coach UI will nag.

`PurchaseFanoutService.onPurchaseEntitled` does:

```
for asset in pkg.assets (ordered):
  switch asset.drop_cadence:
    case 'immediate':
      AssignableAssetRegistry.resolve(asset).materialize(purchase.client_user_id, asset.asset_revision)
      emit fanout outbox event { delivered_at: now }
    case 'on_day' | 'on_week' | 'weekly_repeating':
      emit fanout outbox event { scheduled_for: purchase.created_at + offset }
```

`AssignableAssetRegistry.resolve('workout_program') → resolveWorkoutAsset(programId, revision) → cloneProgramToClient + snapshot-at-assignment + push` per MASTER_WORKOUT_BUILDER_SPEC §3.2.1 step 2. The same registry is shared by the drip runtime for non-immediate drops.

### 6.3 Special case — guest with no User yet

Guest payment succeeds **before** the User row exists. `convertGuestToUser` creates the User inside its own `$transaction` (`guest-checkout.service.ts:1239-1322`). The fan-out call goes inside that same `$transaction`, *after* `tx.clientPurchase.create(...)`. Two consequences:

1. **Schedule rows for non-immediate drops carry `client_user_id` already** — the User exists by the time fan-out runs. There is **no "headless guest schedule"** that needs late-binding because we never schedule before the convert step.
2. If conversion fails into `conversion_failed_retryable` (`guest-checkout.service.ts:1474-1520`), the fan-out has not run — which is correct, because no User exists for the schedule to point at. Reconciliation (`reconcilePaidCheckout` `:1534-1564`) re-runs `convertGuestToUser` end-to-end, and the fan-out is gated on `PurchaseFanout.state == 'pending'` so it's idempotent across retries.

### 6.4 Buyer-visible immediate UX

| Surface | What the buyer sees on the success deep-link / SSR thank-you |
|---|---|
| In-app (paths A & B) | (1) Push notification "Welcome — your <package_name> starts now." (2) `CheckoutReturnScreen` polls `/v1/checkout/entitlement` → `active=true` → routes to a new **`PurchaseUnpackScreen`** that lists what just arrived (`immediate` drops) + an inline timeline of what's coming next (`on_day`/`on_week`). (3) Chat thread with the coach is seeded with a system message "You're in <package_name>". |
| Web (path C — guest) | (1) SSR thank-you renders the same unpack list (server-rendered from `CoachPackageAsset` + immediate-drop state). (2) Welcome email (existing path, refactored to send through `NotificationsService` so the fan-out outbox owns it). (3) Email/SMS reminders for scheduled drops handled by the drip runtime. (4) Magic invite-link to download the app + open straight into `PurchaseUnpackScreen`. |

### 6.5 Webhook hardening required for the fan-out to be safe

The fan-out is fired from the webhook transaction. To avoid leaving money-collected-but-content-un-fanned-out states:

- The `PurchaseFanout` row insert + `entitlement_active=true` flip MUST be in the same `tx`. If the fan-out resolver throws, the `$transaction` rolls back, the dedup row rolls back, **Stripe retries the same event id** (current behaviour, `billing.service.ts:386-402`). This buys us "money + content commit together OR neither".
- The fan-out resolver MUST NOT make synchronous Stripe HTTP calls inside the tx (the codebase already has a strict anti-pattern here, see A276-P1-3 commentary at `billing.service.ts:81-138`).
- `transfer.failed` MUST be handled (§5 #3) so a sub-coach's content fan-out doesn't fire on the back of a transfer that ultimately failed. Today nothing fires off `transfer.failed`, so a sub-coach's package buyer gets the content but the head-coach hasn't been paid — buyer doesn't notice but the platform's books drift.

### 6.6 Concrete hook insertion points (file:line, what to add)

1. **`src/checkout/checkout-webhook-handler.service.ts:152`** (inside `applyCheckoutCompleted`, after `splits.onChargeSucceeded`): `if (this.fanout) await this.fanout.onPurchaseEntitled(updated, { entrypoint: 'in_app_hosted', isFirstPurchaseForBuyer: <derived>, guestCheckout: null });`. Pass the outer tx in.
2. **`src/checkout/checkout-webhook-handler.service.ts:348`** (inside `applyPaymentIntentSucceeded`): same call with `entrypoint: 'in_app_ps'`.
3. **`src/storefront/guest-checkout.service.ts:1320`** (inside `convertGuestToUser`'s `$transaction`, after the `ClientPurchase.create`): same call with `entrypoint: 'storefront_guest', guestCheckout: checkout`.
4. **`src/checkout/checkout.module.ts`** (or new `PurchaseFanoutModule`): provide `PurchaseFanoutService` with `@Optional()` for legacy test wiring.
5. **`prisma/schema.prisma`**: add `CoachPackage.is_sellable`, `CoachPackageAsset` model, `PurchaseFanout` model.

---

## 7. Logical target page paths (buyer side) + convergence diagram

### 7.1 Target — CLIENT picking & buying in-app
```
HomeTab.CoachIntroductionBanner ─┐
MoreTab.Coaching plans          ─┴─► ClientPackagesScreen (catalog)
                                       │
                                       ▼
                                  PackageDetailSheet (NEW — replaces silent in-line buy)
                                       │   tap "Buy / Subscribe"
                                       ▼
                                  CheckoutSheet (Stripe PaymentSheet, in-app native)
                                       │   succeeds
                                       ▼
                                  CheckoutReturnScreen  (existing, fixed)
                                       │   GET /v1/checkout/sessions/:sid/confirm
                                       ▼
                                  PurchaseUnpackScreen (NEW)
                                       │
                                       ▼
                                  HomeTab refreshes — first immediate asset visible
```

### 7.2 Target — GUEST checkout (SSR storefront, joingrowthproject.com)
```
External SSR  ── GET /v1/packages/public/join/:token ──► storefront-public.controller.getPublicPackage
SSR form      ── POST .../join/:token/checkout       ──► GuestCheckoutService.createIntent
guest pays    ── payment_intent.succeeded webhook    ──► GuestCheckoutService.handlePaymentSucceeded
                                                          │ INLINE
                                                          ▼
                                                       convertGuestToUser  (Supabase user + ClientPurchase + fan-out hook + welcome email)
SSR thank-you renders the PurchaseUnpackScreen-equivalent server-side
                                                          ▼
mobile install (invite link)  → opens straight into PurchaseUnpackScreen
```

### 7.3 Target — WEB (coach in-TGP landing page) checkout
```
Visitor on https://app.trygrowthproject.com/p/:coachSlug/:pageSlug (or coach custom domain — TODO #4)
   │  click "Buy" on a tier card
   ▼
GET /p/:coachSlug/:pageSlug/checkout?tier=<pkg_id>
   │  302 to {STOREFRONT_BASE_URL}/v1/packages/public/join/<share_token>?lp=<page_id>
   ▼
Same as 7.2 from here — guest path; `landing_page_id` MUST propagate to ClientPurchase
```

### 7.4 The convergence point

All three terminate at `PurchaseFanoutService.onPurchaseEntitled(purchase, ctx)`, which is the single hook the drip runtime spec (`PACKAGES_DRIP_FEED_SPEC.md` — sibling) consumes. From there, drip cadence + `AssignableAssetRef` resolution is the drip runtime's concern.

### 7.5 Contrast with today

| Aspect | Today | Target |
|---|---|---|
| Client in-app buy works | ❌ silent 404 on every call | ✅ |
| Guest buy works | ✅ for one-time USD only | ✅ + extend to recurring + multi-currency |
| Web/landing-page buy works | ✅ but `lp=` doesn't reach revenue | ✅ + landing_page_id on ClientPurchase |
| Post-purchase content fan-out | ❌ zero | ✅ via `onPurchaseEntitled` |
| Drip schedule seeded | ❌ no schedule at all | ✅ outbox emits one row per asset drop |
| Buyer push / welcome message | ❌ on app paths; email-only on guest | ✅ unified via `NotificationsService` |
| Coach is alerted "X bought Y" | ❌ on app paths; ❌ on guest unless they look at revenue feed | ✅ first-class `COACH_NEW_PURCHASE` notification fired from fan-out |
| `transfer.failed` handled | ❌ silently dropped | ✅ must precede fan-out hardening |
| Receipt URL surfaced to client | only guest welcome email | ✅ in-app `PurchaseUnpackScreen` shows it; coach-side too |

---

## 8. Boundary notes (anything touching the coach side or the drip runtime)

- **`CoachPackage.is_sellable` + `CoachPackageAsset` table** — these are *authoring-side* additions; the COACH hunt owns the UI surface. Buyer side only consumes the resolved attachments. The COACH spec should land the migration; buyer-side stays read-only against it.
- **Drip cadence catalog** (`'immediate' | 'on_day' | 'on_week' | 'weekly_repeating' | ...`) — owned by `PACKAGES_DRIP_FEED_SPEC.md`. Buyer-side fan-out only switches on cadence; the runtime owns when scheduled drops fire.
- **`AssignableAssetRegistry`** — defined in `MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1. The workout-program resolver is in the workout builder's scope; the meal-plan / PDF / video / auto-message resolvers are owned by their respective master-builder streams. Buyer side only needs the registry interface to exist.
- **Welcome email** currently lives inside `GuestCheckoutService` (`:1615-1706`); the refactor to push it through `NotificationsService` is in scope for both the buyer fan-out work (consumer) and the notifications module (provider). Coordinate.
- **`landing_page_id` propagation** — only needs adding to ClientPurchase (a column add + a write in `convertGuestToUser`). Analytics rollup queries (which the coach hunt may own) need to join through it.

---

## 9. Prioritized "build/fix first" list (buyer side)

In order. Each item is sized as a single PR unless noted.

1. **P0 — Fix the in-app client checkout silent breakage.** Pick one of two PRs:
   - (a) **Re-wire `clientPaymentsApi.ts` to the existing backend routes** (`/v1/checkout/sessions`, `GET /v1/checkout/sessions/:id/confirm`, `POST /v1/checkout/billing-portal`, `GET /v1/checkout/entitlement`). Lowest cost, ships the working PaymentSheet/Hosted-Checkout path to clients. Also fix `isNotConfigured` to NOT swallow real 404s from known endpoints.
   - (b) **Add a new `ClientPaymentsController` under `/v1/clients/me/coach/*`** that proxies to `CheckoutService`. More surface but matches the mobile API's expectation. Slower.
   Recommend (a). Sub-PRs: fix the doc-string `tgp://`/`growthproject://` drift in `CheckoutReturnScreen` and `RootNavigator`.
2. **P0 — Close B7's remaining half.** Add `transfer.failed` handling in `RefundDisputeHandlerService.handle` (`refund-dispute-handler.service.ts:79-99`); persist a `ConnectTransfer.status='failed'` + coach `COACH_ALERT` notification; gate the §6 fan-out so a failed-transfer purchase still fan-outs to the buyer but logs a platform-side payable-mismatch for ops.
3. **P0 — Build the `PurchaseFanoutService` hook + `PurchaseFanout` table + invoke it from all three webhook paths.** Empty no-op fan-out body is fine as a first PR — gets the hook in place so the coach + drip streams can build against it. (~150 LoC backend, 1 migration.)
4. **P0 — Add `CoachPackage.is_sellable` + `CoachPackageAsset` migration (consumer-only side).** Buyer-side just reads. Coach side adds UI in a separate PR.
5. **P1 — Allow recurring + (later) non-USD on storefront guest checkout** (`guest-checkout.service.ts:287-322`). Subscriptions are the primary monetization for ICP; refusing them on web costs activations.
6. **P1 — Propagate `landing_page_id` GuestCheckout → ClientPurchase** (`convertGuestToUser`). One-line column add + one-line write.
7. **P1 — Refactor the guest welcome email to send through `NotificationsService`** so the fan-out outbox owns it (consumer-visible: receipt URL surfaces in-app too; coach can see what was sent).
8. **P1 — Build `PurchaseUnpackScreen` (mobile)** + the server-rendered SSR thank-you equivalent. Hooks immediately-cadence assets the buyer just bought.
9. **P1 — `COACH_NEW_PURCHASE` notification** fired from the fan-out hook so the coach gets a real-time "X just bought Y" envelope on all three paths.
10. **P2 — Wire the custom-domain host-header check** (`landing-pages.public.controller.ts:22-26` TODO). Buyer-perceived brand fidelity for Pro+ coaches.
11. **P2 — Pre-resolve `receipt_url` for in-app PI flow** too (`billing.service.ts:90-138` currently gated on guest metadata only). Surface receipts on in-app `PurchaseUnpackScreen`.
12. **P2 — Unify `isPublicSellable(pkg)` predicate** shared between `getPublicPackageByToken` and `createIntent` to prevent gate drift (`storefront.service.ts:113-115` vs `guest-checkout.service.ts:287-305`).
13. **P3 — Re-key the in-app Hosted-Checkout idempotency to include a per-attempt UUID** instead of a UTC-day bucket (`checkout.service.ts:151-153`), or document the collapse semantics for one-time programs.

---

*End of buyer-hunt report. Open questions for the operator: (a) Does "client picking packages in-app" need to support multi-coach catalogs, or is `User.coach_id` the canonical one-coach-per-client constraint? (b) Should the storefront guest path support recurring before the in-app paths do, or together? (c) Is the SSR storefront (`joingrowthproject.com`) frontend a third repo that should also be hunted?*
