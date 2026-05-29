# Commerce & Drip-Feed Inventory — Packages & Drip-Feed Fulfillment Engine

Read-only inventory feeding the design spec for the **Packages & Drip-Feed Fulfillment** engine
(coach builds a sellable package; checkout auto-assigns content that drips over time across
workouts, meal plans, PDFs, videos and in-app messages).

All file:line citations are relative to `/home/user/workspace/growth-project-backend-c6b0dc34/` at HEAD `d8698b77`.

---

## 1. Commerce / Packages / Pricing

### 1.1 `src/packages/*` — `CoachPackage` CRUD

Module wiring: `src/packages/packages.module.ts:17-23`
- Imports: none (BillingModule cycle was hot-fixed; guards now live in the @Global SecurityGuardsModule — `packages.module.ts:13-16`).
- Controllers: `CoachPackagesController`, `ClientPackagesController`.
- Providers/exports: `PackagesService` (consumed by `CheckoutModule`).

#### Coach-facing — `CoachPackagesController` (`/v1/coach/packages`) (`packages.controller.ts:40-103`)

Class-level guards: `JwtAuthGuard, CoachOrOwnerGuard, SubscriptionGuard` (`packages.controller.ts:42`).

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/v1/coach/packages` | `list` (`packages.controller.ts:49-59` → `service.ts:128-140`) | `@Roles('coach','owner')`. Optional `?include_archived=true`. |
| POST | `/v1/coach/packages` | `create` (`packages.controller.ts:63-75` → `service.ts:46-61`) | `CreatePackageDto` (`packages.dto.ts:4-39`): `name ≤120`, `amount_cents ≥50` (Stripe min), `currency ∈ {usd,gbp,eur,aud,cad}`, `billing_type ∈ {one_time,recurring}`, optional `billing_interval ∈ {week,month,year}`, `billing_interval_count ≥1`. |
| PATCH | `/v1/coach/packages/:id` | `update` (`packages.controller.ts:79-93` → `service.ts:63-115`) | `UpdatePackageDto` (`packages.dto.ts:41-65`) — `name`, `description`, `amount_cents`, `currency`, `is_active` only. If price-shaping fields change → `stripe_price_id` cleared so next checkout mints a fresh Stripe Price (`service.ts:103-109`). |
| DELETE | `/v1/coach/packages/:id` | `archive` (`packages.controller.ts:97-102` → `service.ts:117-124`) | Soft archive (`archived_at = now()`, `is_active = false`). |

Plus share-link mint/revoke on the same `/v1/coach/packages/:id/share-link[/revoke]` path-prefix, owned by `ShareLinkController` (`src/share-link/share-link.controller.ts:27-73`):
- `POST .../share-link` (`share-link.controller.ts:51-58`) → `mintOrGet` — idempotent: same coach + same package always returns the same token.
- `POST .../share-link/revoke` (`share-link.controller.ts:65-72`) → one-way kill switch (a re-mint produces a NEW token rather than reviving the old one).
- Throttled 30/min per coach.

#### Client-facing — `ClientPackagesController` (`/v1/clients/me/coach`) (`packages.controller.ts:108-191`)

- `GET /v1/clients/me/coach` (`packages.controller.ts:125-154`) — returns the requesting client's coach profile (name, avatar). 404 when `req.user.coach_id` is null.
- `GET /v1/clients/me/coach/packages` (`packages.controller.ts:160-172`) — student browses the assigned coach's active offers. Returns empty list (not 404) when no coach assigned.
- `GET /v1/clients/me/coach/packages/:id` (`packages.controller.ts:177-190`) — single offer for the purchase sheet. Re-checks `pkg.coach_id === req.user.coach_id`, `is_active`, not archived.

`@SkipClientEntitlement()` on the list/detail routes (`packages.controller.ts:162,179`) — buyers must browse packages before they have an entitlement.

#### Public storefront — `StorefrontPublicController` (`/v1/packages/public`) (`src/storefront/storefront-public.controller.ts:53-373`)

All routes `@Public()` — anonymous traffic. Security comes from opaque 21-char nanoid share token (`SHARE_TOKEN_REGEX` regex-guarded by `ShareTokenPipe`, `storefront-public.controller.ts:41-51`), UUID v4 idempotency keys, Stripe webhook signature verification, and per-route throttle + per-IP Redis-backed bucket (`checkout-rate-limiter.service.ts`).

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/v1/packages/public/join/:token` | `getPublicPackage` (`storefront-public.controller.ts:118-123` → `storefront.service.ts:72-160`) | Returns coach + package metadata for SSR. 404 on bad/paused/revoked/expired token. Phase 1 only supports **one-time USD** packages on the public storefront (`storefront.service.ts:109-115`). |
| POST | `/v1/packages/public/join/:token/checkout` | `createGuestCheckout` (`storefront-public.controller.ts:142-185`) | Creates the Stripe PaymentIntent and a `GuestCheckout` row. Throttle 20/min + per-route IP bucket 10/hr. Sets a 7-day signed cookie. |
| POST | `/v1/packages/public/join/:token/checkout/resume` | `resumeGuestCheckout` (`storefront-public.controller.ts:216-256`) | Recovers an in-flight checkout. |
| POST | `/v1/packages/public/join/:token/checkout/send-recovery-link` | `sendRecoveryLink` (`storefront-public.controller.ts:275-303`) | Emails a 15-min recovery JWT. |
| GET | `/v1/packages/public/join/:token/checkout/resume/:jwt` | `resumeFromMagicLink` (`storefront-public.controller.ts:329-372`) | 302 redirect to SSR with `?resume=<guest_checkout_id>`. |

### 1.2 `model CoachPackage` (`prisma/schema.prisma:2937-2989`)

```
id                 String  @id @default(uuid())
coach_id           String  (FK User; @relation "CoachPackageCoach")
name               String
description        String?
amount_cents       Int
currency           String  @default("usd")
billing_type       String  @default("one_time")   // one_time | recurring
interval           String?                         // month | year — recurring only
interval_count     Int     @default(1)
duration_periods   Int?                            // recurring: # periods to bill; one_time: # WEEKS access lasts (null = lifetime)
stripe_price_id    String?                         // cached, lazily created on first checkout
stripe_product_id  String?                         // cached, lazily created on first checkout
is_active          Boolean @default(true)
archived_at        DateTime?
created_at         DateTime @default(now())
updated_at         DateTime @updatedAt
// R43 storefront share-link state
share_token              String?  @unique
share_link_enabled       Boolean  @default(true)
share_link_generated_at  DateTime?
share_link_expires_at    DateTime?
share_link_revoked_at    DateTime?
purchases       ClientPurchase[]
guest_checkouts GuestCheckout[]
@@index([coach_id, is_active])
@@index([coach_id, archived_at])
@@index([stripe_price_id])
```

**Critical absence — there is NO field on `CoachPackage` that attaches content/assets to a package.** No `included_workouts[]`, no `included_meal_plans[]`, no `attached_documents[]`, no join table `PackageAsset` / `PackageContent`. The model is *pure pricing metadata* — a package is a Stripe Product with an entitlement window (`duration_periods` weeks for one-time, `current_period_end` for recurring). What the client receives in exchange for paying is currently **out-of-band** (coach manually messages them, manually assigns workouts/meals after seeing the purchase in the revenue feed).

`duration_periods` is the closest thing to a "drip horizon" today, but it only sets `ClientPurchase.access_expires_at` (`checkout-webhook-handler.service.ts:594-615`); nothing else is scheduled off it.

### 1.3 `GuestCheckout` (`prisma/schema.prisma:3007-3133`)

Pre-conversion state machine row keyed by `stripe_payment_intent_id`. Status: `pending → paid → converted` (or `conversion_failed_retryable → conversion_failed_terminal` / `failed` / `refunded` / `disputed`). Has `package_snapshot Json?` (`schema.prisma:3097`) so a coach editing mid-checkout cannot retroactively change the guest's price — same snapshot pattern a drip engine would need at checkout time.

---

## 2. Checkout → Purchase Lifecycle

### 2.1 The two purchase-create paths

Two distinct services create `ClientPurchase` rows — one per checkout surface:

| Surface | Creator | Lifecycle entry status |
|---|---|---|
| Authed Stripe-hosted checkout session | `CheckoutService.createCheckoutForClient` (`src/checkout/checkout.service.ts:281-303`) — upserts on `idempotency_key` | `pending` |
| Authed PaymentSheet (in-app) | `CheckoutService.createPaymentIntentForClient` (`src/checkout/checkout.service.ts:461-475`) — single-flight reservation row before Stripe call | `pending` |
| Authed (no row yet) | `GuestCheckoutService.convertGuestToUser` (`src/storefront/guest-checkout.service.ts:1287-1313`) | `paid` (immediate, since payment already cleared) |

Both authed surfaces are mounted by `CheckoutController` (`src/checkout/checkout.controller.ts:81-268`) under JWT + `@Roles('student','coach','owner')` + `CHECKOUT_MINT` throttle.

### 2.2 Stripe webhook routing (`src/billing/billing.service.ts:216-374`)

`BillingService.handleStripeEvent` is the single entry for Stripe webhooks. Inside one outer `$transaction` it:
1. Writes a dedup row to `StripeProcessedEvent` (`schema.prisma:536`) — replays are absorbed by the @unique constraint (`billing.service.ts:175-182`).
2. Offers the event to `CheckoutWebhookHandlerService.handle(event)` first (`billing.service.ts:192-196`); the checkout handler claims any event that maps to an existing `ClientPurchase` row.
3. Offers to `CoachAiCreditPackService.handleStripeEvent` (Stream 1 AI credit packs) (`billing.service.ts:210-214`) — claims only when `metadata.tgp_kind=coach_ai_credit_pack`.
4. Routes by `event.type` to a SaaS-coach-subscription handler if not claimed.

#### Events handled by `CheckoutWebhookHandlerService.handle` (`src/checkout/checkout-webhook-handler.service.ts:60-102`)

```
checkout.session.completed        → applyCheckoutCompleted    (status: pending → paid|active, entitlement_active=true)
checkout.session.expired          → applyCheckoutExpired      (pending → expired, entitlement_active=false)
customer.subscription.updated     → applySubscriptionUpdated  (mirror status; entitlement on for active|trialing|past_due)
customer.subscription.created     → applySubscriptionUpdated
customer.subscription.deleted     → applySubscriptionDeleted  (canceled, entitlement off; terminate dunning)
payment_intent.succeeded          → applyPaymentIntentSucceeded   (PaymentSheet path: pending → paid)
payment_intent.payment_failed     → applyPaymentIntentFailed      (→ payment_failed; last_error stamped)
invoice.paid | invoice.payment_succeeded → applyInvoicePaid       (renewal: resync sub state, per-renewal split, clear dunning)
invoice.payment_failed            → applyInvoicePaymentFailed     (→ past_due; open/extend dunning)
customer.updated                  → applyCustomerUpdated          (mirror default payment method on ConnectCustomer)
charge.refunded / refund.updated  → refundDispute.handle
charge.dispute.created / .updated / .closed → refundDispute.handle
transfer.reversed                 → refundDispute.handle
payout.paid / .failed / .canceled → refundDispute.handle
```

B7 issue says `transfer.failed` and `payout.failed` are ignored — `payout.failed` IS in the switch (`checkout-webhook-handler.service.ts:95`) and delegated to `RefundDisputeHandlerService` but `transfer.failed` is **not** present in either the `CheckoutWebhookHandlerService.handle` switch or the `BillingService.handleStripeEvent` switch (`billing.service.ts:216-374`). Confirmed.

### 2.3 `model ClientPurchase` (`prisma/schema.prisma:3178-3239`)

```
id                          String  @id @default(uuid())
client_user_id              String  (FK User; @relation "ClientPurchaseClient")
coach_user_id               String  (FK User; @relation "ClientPurchaseCoach")
package_id                  String  (FK CoachPackage)
amount_cents                Int        // snapshot at purchase time
currency                    String  @default("usd")  // snapshot
billing_type                String  @default("one_time")  // snapshot
stripe_checkout_session_id  String  @unique
stripe_payment_intent_id    String?
stripe_subscription_id      String? @unique
stripe_customer_id          String?
stripe_destination_account  String?  // coach's Connect Express id
status                      String  @default("pending")
  // ^ pending | paid | active | past_due | canceled | payment_failed | expired
entitlement_active          Boolean @default(false)
access_expires_at           DateTime?   // one_time + duration_periods → created_at + N*7 days; recurring → current_period_end + 24h pad
current_period_end          DateTime?
cancel_at_period_end        Boolean @default(false)
canceled_at                 DateTime?
idempotency_key             String  @unique
stripe_client_secret        String?    // PaymentSheet flow only
stripe_ephemeral_key        String?
last_error                  String?
created_at                  DateTime @default(now())
updated_at                  DateTime @updatedAt
splits     SplitLedgerEntry[]
transfers  ConnectTransfer[]
dunning    DunningState?
reminders  PaymentReminder[]
refunds    ChargeRefund[]
disputes   ChargeDispute[]
reconciliation ReconciliationSnapshot?
@@index([client_user_id, status])
@@index([coach_user_id, status])
@@index([package_id])
@@index([stripe_subscription_id])
@@index([entitlement_active, access_expires_at])
```

### 2.4 Post-checkout hook surface — what fires on `pending → paid|active`?

**There is no application-level EventEmitter / event-bus.** The repo has no `@nestjs/event-emitter`, no `EventBus`, no `@OnEvent` pattern (`app.module.ts` grep — nothing); the existing emitter files in `src/notifications/emitters/*.emitter.ts` are plain services that imperatively call `NotificationsService.createNotification`.

The ONLY automatic side-effect on charge-succeeded is:

- **`PurchaseSplitHandlerService.onChargeSucceeded`** (`src/checkout/purchase-split-handler.service.ts:63-…`) — invoked inline from `applyCheckoutCompleted` (`checkout-webhook-handler.service.ts:150-158`) and `applyPaymentIntentSucceeded` (`checkout-webhook-handler.service.ts:346-354`) and `applyInvoicePaid` (`checkout-webhook-handler.service.ts:455-467`). Posts the `SplitLedgerEntry` rows + queues the head-coach `Transfer`. Side-effects of split posting are caught + logged but never roll back the status flip.

For the guest path, `GuestCheckoutService.convertGuestToUser` (`src/storefront/guest-checkout.service.ts:1287-1313`) creates the `ClientPurchase` row and the matching `User` row in one `tx`, then fires welcome email + invite link **outside** the transaction.

There is **no fan-out hook** that a drip engine could subscribe to. Building one requires either:
- adding a call inside `applyCheckoutCompleted` / `applyPaymentIntentSucceeded` / `convertGuestToUser` next to (or after) `splits.onChargeSucceeded`; OR
- introducing `@nestjs/event-emitter` and re-emitting `purchase.activated` from those three call sites.

The split handler is the structural template to follow — `@Optional()`-injected service called inline at status-flip time, errors logged not propagated.

### 2.5 Idempotency notes
- Stripe event-id dedup row: `StripeProcessedEvent.stripe_event_id @unique` (`schema.prisma:536`) inside the outer `$transaction` (`billing.service.ts:175-196`).
- `ClientPurchase.idempotency_key @unique` (`schema.prisma:3214`) collapses retry storms on Checkout-session mint.
- `ClientPurchase.stripe_checkout_session_id @unique`, `stripe_subscription_id @unique` (`schema.prisma:3193,3195`) — Stripe-side replay protection.
- `GuestCheckout.stripe_payment_intent_id @unique` + `idempotency_key @unique` (`schema.prisma:3012,3043`).

---

## 3. Assignment Primitives — How Content Reaches a Client Today

Every "assign X to client" path is **immediate** (no scheduled / deferred / drip wrapper).
Only `ClientWorkoutAssignment.scheduled_for` is a future-dated field, and even that is "when the client should do the workout", NOT "when the assignment becomes visible".

### 3.1 Workout assignments (`ClientWorkoutAssignment`)

Model: `prisma/schema.prisma:2035-2066` (full reference in `BACKEND_WORKOUT_INVENTORY.md` §3). Key fields:
- `workout_plan_id`, `client_id`, `assigned_by_coach_id`, `scheduled_for DateTime` (client's training calendar slot, not a release time).
- `completed_at`, `started_at`, `post_rpe`, `post_notes`, `completion_payload`.
- `approved_by_coach_at` (R43 coach reviews submission — column exists, no endpoint writes it).
- `ai_draft_id String? @unique` (`schema.prisma:2060`) — Stream 2 schema-level single-emit guard for the materialiser path.

Creation paths:
- Coach UI: `POST /workout-plans/:planId/assignments` → `WorkoutBuilderService.assignPlan` (`src/workout-builder/workout-builder.service.ts:511-541`).
- AI gateway: `AssignWorkoutMaterializer.materialize` (`src/ai/gateway/materialisers/assign-workout.materialiser.ts:99-256`) — inserts one row + fires `WORKOUT_ASSIGNED` push fire-and-forget (`assign-workout.materialiser.ts:227-253`).

Read path: `GET /assignments/me` (`src/workout-builder/workout-builder.controller.ts:253-262` → `service.ts:593-637`) — paginates the client's assignments, joining live exercises. **No scheduled-release filter** — visibility is governed by `client_id` only; an assignment with `scheduled_for` in 30 days IS visible to the client today.

### 3.2 Meal plans — TWO independent surfaces

#### 3.2.1 `MealPlan` (legacy, free-form JSON items) — `src/meal-plans/*`

Schema: `model MealPlan` (`prisma/schema.prisma:1029-1055`). Single coach-owned row per client.

- `CoachMealPlansController` (`src/meal-plans/coach-meal-plans.controller.ts:26-63`) — `@Controller('coach')`, guards `JwtAuthGuard, CoachGuard, SubscriptionGuard`:
  - `GET /coach/clients/:client_id/meal-plans` → `MealPlansService.listForClientByCoach` (`meal-plans.service.ts:49-55`).
  - `POST /coach/clients/:client_id/meal-plans` → `createForClient` (`meal-plans.service.ts:28-45`) — `items: Json` + optional `days: Json` for AI-generated per-day shape.
  - `PATCH /coach/meal-plans/:id` → `updateByCoach` (`meal-plans.service.ts:61-81`).
  - `DELETE /coach/meal-plans/:id` → `archiveByCoach` (`meal-plans.service.ts:86-93`).
- `ClientMealPlansController` (`src/meal-plans/client-meal-plans.controller.ts:18-34`) — `@Controller('meal-plans')`, guards `JwtAuthGuard, ClientEntitlementGuard, RolesGuard`, `@Roles('student')`:
  - `GET /meal-plans` → `listForClient`.
  - `GET /meal-plans/:id` → `getOneForClient`.

#### 3.2.2 `DailyMealPlan` / `MealTemplate` (structured library) — `src/real-meal-plans/*`

Schema: `MealTemplate` (`prisma/schema.prisma:2119-2137`), `DailyMealPlan` (`prisma/schema.prisma:2139-2152`), `DailyMealPlanSlot` (`prisma/schema.prisma:2154-2166`), `DailyMealPlanAssignment` (`prisma/schema.prisma:2168-2188`).

Coach builds reusable `MealTemplate`s, composes them into a `DailyMealPlan` with `DailyMealPlanSlot[]`, assigns to clients via `DailyMealPlanAssignment` (`starts_on Date`, optional `ends_on Date`):
- `RealMealPlansService.assignPlan` (`src/real-meal-plans/real-meal-plans.service.ts:247-270`).
- `DailyMealPlanAssignment.ai_draft_id String? @unique` (`schema.prisma:2183`) — Stream 2 single-emit guard for `AssignMealPlanMaterializer`.

Read path: `RealMealPlansService.getTodayForClient` (`real-meal-plans.service.ts:282-303`) — finds assignments where `starts_on <= today AND (ends_on IS NULL OR ends_on >= today)`. This IS a **calendar-window visibility filter** — the closest existing primitive to "released between date X and Y" the drip engine needs.

### 3.3 Coach guidelines (`CoachGuideline`)

Schema: `prisma/schema.prisma:1227-1239` — single row keyed `(coach_id, client_id)` with `content String`.

- `POST /coach/guidelines/:client_id` → `CoachService.postGuidelines` (`src/coach/coach.service.ts:357-365`) — Prisma `upsert` (single row per pair, last-write-wins). Mounted at `src/coach/coach.controller.ts:196-200`.
- `GET /coach/my-guidelines` (`coach.controller.ts:186-188`) — client-facing read of "my coach's guidelines for me".
- `GET /coach/guidelines/:client_id` (`coach.controller.ts:191-193`) — coach reads guidelines for a specific client.

No history, no versioning — overwrite only.

### 3.4 Other "assign X" paths
- Push notification: `AssignWorkoutMaterializer` + `AssignMealPlanMaterializer` fire one-shot push on approval (`assign-workout.materialiser.ts:227-253`). No persistent scheduled-message model.
- Coach DM: `MessagingService.sendAsCoach` (`src/messaging/messaging.service.ts:396-…`) — immediate INSERT into `CoachMessage` + realtime ping (Supabase broadcast) + push via `messageReceived.emit` (`messaging.service.ts:447-455`). No `send_at` / `scheduled` column on `CoachMessage` (`schema.prisma:1076-…`).
- Nudge digests: `NotificationsService.createNotification` writes a `Notification` row; the digest scheduler (`src/notifications/digest.scheduler.ts`) sweeps and emails.

### 3.5 Scheduled / deferred assignment — does ANY path exist?

**No.** Every assignment service performs a synchronous INSERT inside the request handler. The schema search for drip-feed-shaped fields (`prisma/schema.prisma` grep `scheduled_for|drip|release_at|scheduled_at|deliver_at|fire_at`) returns only:
- `ClientWorkoutAssignment.scheduled_for` (`schema.prisma:2043`) — client-facing training-calendar slot, not a release time.
- `User.deletion_scheduled_at` (`schema.prisma:174`) — GDPR.
- `CoachSubscription.cancel_scheduled_at` (`schema.prisma:3423`) — SaaS-side, unrelated.
- `PaymentReminder.scheduled_for` (`schema.prisma:3462`) — dunning cadence, has the right shape but tightly coupled to `DunningState`.

The drip engine's "fire a release at time T" semantic does not exist anywhere as a reusable primitive.

---

## 4. File / Media Storage

### 4.1 Mux — the only real video pipeline

`src/video/video.module.ts:1-19` — `@Global()`. Exports `MuxService` (`src/video/mux.service.ts`).

Public methods (`mux.service.ts:74-…`):
- `createDirectUpload()` — owner-only signed-URL upload.
- `getAsset(uploadId | assetId)` — webhook resolution.
- `mintPlaybackUrl({ playbackId, policy, ttlSeconds })` — public or signed playback URL (signed = HMAC-key JWT, default TTL 1h, `mux.service.ts:41`).
- `verifyWebhookSignature` — HMAC for Mux webhook.

Config: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`, optional `MUX_SIGNING_KEY_ID/PRIVATE` (`mux.service.ts:11-22`). When unset, every method throws `MuxDisabledError` — strict no-placeholder rule (`mux.service.ts:23-28`).

Webhook: `MuxWebhookController` (`src/video/mux-webhook.controller.ts`) — flips `ExerciseCatalogItem.mux_asset_status` from `processing → ready|errored`.

### 4.2 Where Mux is consumed today — exercise-catalog only

Used by `src/exercise-catalog/exercise-catalog.service.ts` (admin-only upload routes at `exercise-catalog.controller.ts:106-154`, gated by `OwnerGuard`). The catalog row holds `mux_asset_id`, `mux_playback_id`, `mux_playback_policy`, `mux_asset_status` (enum `none|uploading|processing|ready|errored`), `mux_duration_seconds`, `mux_error_message`, `mux_upload_id @unique` (`schema.prisma:3841-3890`).

**Critical absence:** Mux is currently a *catalog-only* surface — only the platform owner can upload videos (the exercise catalog is the master library). There is **no coach-facing video upload endpoint**. A coach cannot upload "Welcome to Week 1" video today.

### 4.3 Supabase Storage — voice messaging (only)

`MessagingService.createVoiceUpload` (`src/messaging/messaging.service.ts:588-647`):
- Mints a `createSignedUploadUrl()` against bucket `SUPABASE_VOICE_BUCKET` (`messaging.service.ts:602-637`).
- Object path namespaced by user id: `${userId}/${Date.now()}-${randomToken(8)}.${ext}` (`messaging.service.ts:605`).
- Validates content-type (audio/m4a, mp4, ogg, webm), duration, size BEFORE issuing the URL (`messaging.service.ts:592`, helper `assertVoiceWithinLimits`).
- **Known gap noted in source** (`messaging.service.ts:594-600`): no post-upload object verification; URL holder can upload anything within the validity window. Tracked as R7 Finding 4.1.

This is the only Supabase Storage signed-upload surface in the repo.

### 4.4 S3 — placeholders only, NOT wired

- `src/data-export/data-export.service.ts:21-24,184,601-638` — DATA_EXPORT_BUCKET is documented but the code throws "S3 storage requires @aws-sdk/client-s3" (`data-export.service.ts:619-636`). Local filesystem dev fallback only.
- `src/storefront/checkout-receipt.service.ts:15-39,258-270` — same shape; receipts stored on local disk in dev, S3 wiring is a TODO.
- `@aws-sdk/client-s3` package is **not** installed (verify: grep of package.json would confirm — none of the matching files actually import it).

**There is no general-purpose S3 / object-store surface for coach-uploaded PDFs, course materials, or videos.** A drip engine that drops "the Week 1 PDF" needs new infrastructure — either Supabase Storage (the pattern messaging uses), Mux (for video), or a fresh S3 wiring.

### 4.5 Models for coach-uploaded assets

Schema grep `^model (Document|Asset|MediaAsset|FileUpload|Attachment|UploadedFile)` → **no matches**. There is no generic "coach-uploaded file" / "PDF" / "asset" Prisma model anywhere in the schema. The 4580-line schema has:
- `ExerciseCatalogItem` (admin-only video catalog, `schema.prisma:3841-3890`).
- `CoachMessage.voice_url` (`schema.prisma:1076-…`) — just a URL string column on the message, no separate asset table.
- `CoachLandingPage` (`schema.prisma:4256-…`) — landing page content (JSON-blob `sections`, not file uploads).

### 4.6 Push pipeline (Expo)

`NotificationsService` uses `expo-server-sdk` v6 (`src/notifications/notifications.service.ts:9`, `54-59`). The runtime push send is `this.expo.sendPushNotificationsAsync(chunk)` (`notifications.service.ts:426,504`). User push tokens live on `User` / `UserPushToken` (grep would confirm). Per-user-per-kind 60s in-process rate limit (`notifications.service.ts:276-288`).

---

## 5. Messaging / Auto-Message Surface

### 5.1 `MessagingService.sendAsCoach` (`src/messaging/messaging.service.ts:396-…`)

Coach → client DM. Synchronous: validates payload (`assertSendablePayload`, safety block check), INSERTs `CoachMessage` row (`messaging.service.ts:431-442`), then fire-and-forget:
- `supabase.broadcastNewMessage(clientId)` — realtime ping (`messaging.service.ts:447`).
- `messageReceived.emit(clientId, …)` (`messaging.service.ts:450-455`) — routes through `MessageReceivedEmitter` → `NotificationsService.createNotification(kind=message_received, channel='push')`.
- `audit.write({action:'messaging.sent'})` (`messaging.service.ts:456-469`).

Same path is used by the AI gateway via `CoachMessageMaterializer.materialize` (`src/ai/gateway/materialisers/coach-message.materialiser.ts:97-…`) → `this.messaging.sendAsCoach(tenantCoachId, clientId, { body })`.

### 5.2 Can a message be scheduled / automated?

`model CoachMessage` (`prisma/schema.prisma:1076-…`) — has `body`, `voice_url`, `voice_duration_sec`, `voice_size_bytes`, `voice_content_type`, `created_at`, `read_at`, `sender_id`. **No `send_at`, no `scheduled_at`, no `status` column.** Messages are created at the moment they should be visible.

The closest thing to "scheduled message" anywhere is `PaymentReminder.scheduled_for` (`schema.prisma:3462`) inside the dunning system — a separate cadence-driven model, NOT a generic scheduled-message primitive.

### 5.3 Push pipeline + notification kinds

`NotificationsService.createNotification` (`src/notifications/notifications.service.ts:260-300`):
- Reads `NotificationPreferences` for `(user_id, kind, channel)` gate.
- Global mute short-circuit (`notifications.service.ts:264-267`).
- Per-kind 60s rate limit in process (`notifications.service.ts:276-288`).
- Persists a `Notification` row (`schema.prisma:1859-1887`); the actual push delivery happens via Expo on a separate path (`notifications.service.ts:426,504`).

`NotificationKind` enum-like const (`src/notifications/notification-kind.ts`) — 20+ kinds, including:
- `WORKOUT_ASSIGNED` (`notification-kind.ts:63`) — fired by `AssignWorkoutMaterializer` (`assign-workout.materialiser.ts:228-253`).
- `MEAL_PLAN_ASSIGNED` (`notification-kind.ts:64`) — fired by `AssignMealPlanMaterializer`.
- `MESSAGE_RECEIVED`, `MISSED_CHECKIN`, `MILESTONE_REACHED`, `WEIGHT_TREND_ALERT`, `CHECKIN_SUBMITTED`, `BUILD_WEEK_DAY_UNLOCKED`, `COACH_ALERT`.
- Booking lifecycle: `BOOKING_REQUESTED/CONFIRMED/DECLINED/CANCELLED/RESCHEDULED/REMINDER_24H/REMINDER_1H`.
- Re-engagement nudges: `NUDGE_MISSED_CHECKIN`, `NUDGE_STREAK_BROKEN`, `NUDGE_ONBOARDING_ABANDONED`, `NUDGE_INACTIVE`.
- Digest: `CLIENT_DIGEST`, `COACH_DIGEST`.

Adding a `DRIP_RELEASED` (or per-asset-type) kind is purely additive (`notification-kind.ts:11-13` is the documented procedure).

---

## 6. Scheduling / Cron / Deferred-Job Infrastructure

### 6.1 The ONLY scheduler is `@nestjs/schedule`

`src/app.module.ts:4,135` — `import { ScheduleModule } from '@nestjs/schedule'` + `ScheduleModule.forRoot()`.

**There is no Redis-backed queue.** No BullMQ, no `@nestjs/bull`, no Bee, no Agenda. Explicit confirmation: `src/landing-pages/crm/lead-sync.queue.ts:1-38` (the only thing called "queue" in the repo) is a `@Injectable()` stub whose `enqueue()` method just logs — the comment at lines 4-8 explicitly states *"The repo does not currently ship BullMQ; the project uses @nestjs/schedule for cron-style background work and the CoachLandingLead row's `crm_sync_status` + `@@index([crm_sync_status])` is the durable queue (every pending lead is picked up on the next polling tick, so an in-process crash never loses work)."*

The canonical deferred-work pattern, repeated verbatim in 15+ places, is: a Prisma row with a `status` column + `(status, time)` composite index, and a `@Cron`-decorated method on a scheduler service that polls "rows due now".

### 6.2 Every `@Cron` job in the repo (`grep '@Cron(' src/`)

| File:line | Cron expression | Purpose |
|---|---|---|
| `src/users/gdpr-scrub.scheduler.ts:35` | env-driven | GDPR scrub |
| `src/storefront/lost-webhook-reconcile.service.ts:54` | `EVERY_MINUTE` | Stripe lost-webhook reconciler — polls `GuestCheckout` pending rows |
| `src/storefront/guest-checkout-reconciliation.service.ts:49` | `EVERY_MINUTE` | Guest checkout retryable conversion |
| `src/storefront/guest-checkout-pii-scrub.service.ts:59` | `17 3 * * *` UTC | PII scrub of >13-month-old guest rows |
| `src/storefront/checkout-receipt.scheduler.ts:37` | `EVERY_MINUTE` | Receipt PDF generation |
| `src/scheduling/jobs/reminder.job.ts:54` | env: `*/5 * * * *` default | Booking 1h reminder sweep — polls `CoachingSession` due-now |
| `src/scheduling/jobs/reminder.job.ts:80` | env: `*/15 * * * *` default | Booking 24h reminder sweep |
| `src/ptm/ptm.scheduler.ts:41` | env-driven | PTM signal flush |
| `src/notifications/nudges/nudge.scheduler.ts:43` | env: `*/15 * * * *` default | Behavioral nudge detection sweep |
| `src/notifications/digest.scheduler.ts:35` | env: `0 7 * * *` default | Client daily digest |
| `src/notifications/digest.scheduler.ts:53` | env: `0 6 * * *` default | Coach daily digest |
| `src/notifications/digest.scheduler.ts:71` | env: `0 8 * * 0` default | Weekly digest (Sunday) |
| `src/leaderboard/leaderboard.scheduler.ts:31` | env-driven | Leaderboard refresh |
| `src/landing-pages/crm/lead-sync.processor.ts:90` | `EVERY_MINUTE` UTC | CRM lead-sync poll (the "queue") |
| `src/data-export/data-export-cleanup.cron.ts:21` | `30 3 * * *` UTC | Expire old export rows |
| `src/coach/coach-effectiveness.scheduler.ts:46` | env-driven | Coach-effectiveness rollup |
| `src/coach/brief/coach-brief.scheduler.ts` | (registered) | Coach Brief cron |
| `src/bloodwork/bloodwork-stale.scheduler.ts:24` | `15 3 * * *` UTC | Bloodwork stale-flag pass |
| `src/ai-credits/coach-ai-budget.scheduler.ts:28` | env-driven | AI budget rollover |
| `src/ai/coach/weekly-insight.cron.ts:31` | `EVERY_WEEK` | Weekly insight generation (gated by `CRON_COACH_AI_INSIGHT=on`) |
| `src/account-deletion/account-deletion.service.ts:441` | env: `0 3 * * *` default | GDPR finalize cron |

Pattern (every file): `@Cron(expr, { name })` on a method; the method calls `prisma.X.findMany({ where: { status: …, scheduled_for: { lte: now } } })`, processes each row, updates status, logs. See `src/scheduling/jobs/reminder.job.ts:40-103` for the canonical example (find-due-rows + dispatch helper).

**Implication for the drip engine:** the cron + status-row pattern is exactly the right primitive. A `DripJob` (or `ScheduledDrop`) row with `status ∈ {pending,due,fired,failed,canceled}` and a `(status, fire_at)` composite index, plus an `@Cron('*/1 * * * *')` worker that claims and processes rows where `status='pending' AND fire_at <= now`, fits the existing house style exactly. The lost-webhook reconciler (`lost-webhook-reconcile.service.ts`) and booking reminder (`reminder.job.ts`) are the closest existing analogues.

### 6.3 Operator gates

Multiple cron jobs are env-gated to dormant (`process.env.CRON_FOO === 'on'`) — `weekly-insight.cron.ts:33-36`, `nudge.scheduler.ts:43` (`NUDGE_DETECTION_CRON`), etc. The pattern is "scheduler is registered; body short-circuits when env var is off". The drip engine should adopt the same pattern so a misconfigured prod can pause drops without a deploy.

---

## 7. AI Gateway Materialiser Pattern (Confirmation)

`CapabilityMaterializerRegistry` (`src/ai/gateway/materialisers/capability-materialiser.registry.ts:23-75`) is a multi-provider DI registry. `AiGatewayModule` (`src/ai/gateway/ai-gateway.module.ts:60-83`) registers each materialiser as both a concrete provider AND as an entry in the `CAPABILITY_MATERIALIZERS` symbol-keyed array. `AiApprovalService.decide` resolves by capability string and calls `materialize(draft)`.

The four materialisers registered today (`ai-gateway.module.ts:60-82`):
1. **`CoachMessageMaterializer`** (`src/ai/gateway/materialisers/coach-message.materialiser.ts:83-…`, capability `draft.coach_message`) — calls `MessagingService.sendAsCoach`. Single recipient + text body. (Schema enforced by `CoachMessagePayloadSchema` zod at `coach-message.materialiser.ts:28-41`.)
2. **`AssignWorkoutMaterializer`** (`src/ai/gateway/materialisers/assign-workout.materialiser.ts:…`, capability `draft.assign_workout`) — inserts `ClientWorkoutAssignment` with `ai_draft_id` single-emit guard; fires `WORKOUT_ASSIGNED` push.
3. **`AssignMealPlanMaterializer`** (`src/ai/gateway/materialisers/assign-meal-plan.materialiser.ts`, capability `draft.assign_meal_plan`) — inserts `DailyMealPlanAssignment` with `ai_draft_id` single-emit guard; fires `MEAL_PLAN_ASSIGNED` push.
4. **`SendNotificationMaterializer`** (`src/ai/gateway/materialisers/send-notification.materialiser.ts:78-…`, capability `draft.send_notification`) — bypasses `NotificationsService.createNotification`'s pref/rate gates (`send-notification.materialiser.ts:29-42`) and writes a `Notification` row directly via Prisma. Approval IS the consent signal.

> Note: the workout inventory's §4 cites "5 materialisers" but only four are wired into `CAPABILITY_MATERIALIZERS` at HEAD. The 5th referenced (`assign_meal_plan.materialiser.ts`) IS one of the four above. Coach AI v1 workout-program / meal-plan generation paths (`coach-ai.service.ts` inline materialisation) do **not** flow through the registry — they live in `src/ai/coach/coach-ai.service.ts` and bypass the gateway race-guards. The drip engine should NOT reuse that inline pattern.

Each materialiser implements `CapabilityMaterializer` (`capability-materialiser.interface.ts:1-…`):
```ts
interface CapabilityMaterializer {
  readonly capability: string;
  canHandle(capability: string): boolean;
  materialize(draft: AiActionDraft): Promise<MaterializeResult>;
}
```
The `AiActionDraft` row (`schema.prisma:2265-2302`) carries `materialised_at` + `materialised_ref` columns — the single source of truth that the side-effect committed. `AiApprovalService.decide` uses `WHERE materialised_ref IS NULL` for the PRODUCT-1 race guard.

**Reusing this pattern for drips:** if drip releases need coach review before firing (e.g. "AI suggests adding bonus content to Week 3 of this package"), they fit the materialiser pattern. If drips are pre-scheduled at checkout and just fire automatically, the cron + status-row pattern (§6) is the better fit. The two patterns are not mutually exclusive — a drip can be `pending → due → coach-reviewed → fired`, with the review step routed through the gateway.

---

## 8. Gaps for Packages & Drip-Feed Fulfillment

### a. Packages cannot attach assets today

`CoachPackage` (`schema.prisma:2937-2989`) is pure pricing/Stripe metadata. There is no join table `CoachPackageAsset`, no `included_workout_plan_ids[]`, no concept of "this package contains workouts X, Y, Z + meal plan A + PDF B".

Required pieces:
- A polymorphic-or-discriminated `PackageAsset` join row pointing at the asset (`{ package_id, asset_type, asset_id, position }` — asset_type ∈ `workout_plan | daily_meal_plan | document | video | scheduled_message`, asset_id varies by type; alternatively a per-type join table to keep FKs strict).
- A coach UI endpoint to attach/detach/reorder assets on a package.
- Validation that all attached assets are owned by the package's coach.

### b. No content-agnostic droppable-asset model

The five drop types in scope each live in a different table today:
| Drop type | Existing target table | Coach-upload surface today |
|---|---|---|
| Workout plan | `WorkoutPlan` (`schema.prisma:1993-2008`) | ✓ `src/workout-builder/*` |
| Meal plan | `DailyMealPlan` (`schema.prisma:2139-2152`) or legacy `MealPlan` (`schema.prisma:1029-1055`) | ✓ `src/real-meal-plans/*` (preferred) |
| Uploaded PDF | **does not exist** | **none** |
| Uploaded video | `ExerciseCatalogItem` (admin-only, Mux) | **no coach-facing upload** |
| In-app auto-message | `CoachMessage` (immediate-send only) | **no scheduled-message column** |

Required pieces:
- A new `CoachDocument` (or `CoachAsset`) model for PDFs: `{ id, coach_id, kind: 'pdf' | 'video', storage_url, file_size_bytes, mime_type, original_filename, uploaded_at, archived_at, … }`.
- A coach-facing video upload path. Two design choices: (1) extend Mux from admin-only to coach-tenant-scoped (per-coach upload IDs, signed playback policy by default), or (2) Supabase Storage for coach videos with a separate Mux pipeline for transcoding/HLS.
- A coach-facing PDF upload path (Supabase Storage signed URL + size/mime validation, mirroring `MessagingService.createVoiceUpload`).
- A `ScheduledCoachMessage` model (or `CoachMessage.send_at DateTime?` + `status` column) so a drip can release a pre-written message at time T.

### c. No drip schedule model

The spec's four cadences — fixed-calendar / relative-to-purchase / on-completion-milestone / immediate-on-checkout — have no schema representation.

Required model sketch (drawing on the `PaymentReminder` + `DailyMealPlanAssignment` patterns):
- `DripSchedule { id, package_id, name }` (one per package describing its cadence).
- `DripScheduleStep { id, drip_schedule_id, asset_ref, cadence_kind: 'immediate'|'fixed_date'|'relative_days'|'on_milestone', cadence_value Json, position }` — `cadence_value` carries the per-kind config (an ISO date for fixed_date, a day-offset for relative_days, a milestone id for on_milestone).
- The schedule is the *template*; instantiated at checkout-time per buyer.

### d. No scheduler/worker to fire drops

The `@nestjs/schedule` + status-row pattern (§6) is the canonical primitive. Required new pieces:
- `ScheduledDrop { id, client_purchase_id, drip_schedule_step_id, asset_type, asset_id, fire_at DateTime, status: 'pending'|'due'|'fired'|'failed'|'canceled', materialised_ref, attempt_count, last_error, fired_at }`.
- Composite index `(status, fire_at)` so the worker can `SELECT … WHERE status='pending' AND fire_at <= now() LIMIT N FOR UPDATE SKIP LOCKED` cheaply (Postgres pattern; check current Prisma version supports `SKIP LOCKED` via `$queryRaw`).
- A `DripDispatcherCron` decorated `@Cron('*/1 * * * *', { name: 'drip-dispatcher' })` polling the index, with per-tenant fairness (round-robin coach_id).
- Per-asset-type fan-out into the existing assignment surfaces — a `DropDispatchers` registry keyed by `asset_type`, mirroring `CapabilityMaterializerRegistry`. Each dispatcher calls the existing service:
  - `workout_plan` → `WorkoutBuilderService.assignPlan` (`src/workout-builder/workout-builder.service.ts:511-541`).
  - `daily_meal_plan` → `RealMealPlansService.assignPlan` (`src/real-meal-plans/real-meal-plans.service.ts:247-270`).
  - `scheduled_message` → `MessagingService.sendAsCoach` (`src/messaging/messaging.service.ts:396-…`).
  - `document` / `video` → NEW; needs a `ClientAssetGrant` (entitlement row) the client-side download endpoint can check.
- Idempotency on each drop: pattern is the `ai_draft_id @unique` columns (`ClientWorkoutAssignment.ai_draft_id`, `DailyMealPlanAssignment.ai_draft_id`, `Notification.ai_draft_id`). The drip engine needs equivalents — e.g. `ClientWorkoutAssignment.scheduled_drop_id @unique` (or a shared `created_by_drop_id` column on each downstream model) so a re-fired drop collapses on the DB constraint rather than double-creating.

### e. No post-checkout fan-out to seed the drip schedule

There is **no event-bus** the drip engine could subscribe to (§2.4). Options:
1. **Inline call** (matches today's `splits.onChargeSucceeded` pattern, `checkout-webhook-handler.service.ts:150-158`): add `dripSeeder.onPurchaseActivated(updated)` right after `splits.onChargeSucceeded` in all three places that flip status to `paid|active`:
   - `applyCheckoutCompleted` (`checkout-webhook-handler.service.ts:104-160`).
   - `applyPaymentIntentSucceeded` (`checkout-webhook-handler.service.ts:320-357`).
   - `GuestCheckoutService.convertGuestToUser` (`src/storefront/guest-checkout.service.ts:1287-1313`) — note this fires post-tx, so the seed should also fire post-tx.
2. **EventEmitter** — add `@nestjs/event-emitter` and emit `purchase.activated`. Cleaner, but a one-time refactor. The split handler stays inline; the drip seeder subscribes.

`DripSeederService.seed(clientPurchase)` should:
- Look up the `DripSchedule` for `clientPurchase.package_id` (a package without a schedule = no-op, so packages remain backward-compatible).
- For each `DripScheduleStep`, compute `fire_at`:
  - `immediate` → `now()`.
  - `fixed_date` → step's literal date.
  - `relative_days` → `clientPurchase.created_at + Nd`.
  - `on_milestone` → leave `fire_at NULL` + add a milestone-listener that flips `status` when the milestone fires.
- INSERT `ScheduledDrop` rows under the purchase's tenant.
- Idempotency: composite `(client_purchase_id, drip_schedule_step_id) UNIQUE` so a retried webhook does not double-seed.

### f. Delivery + push per drop type — what's missing

Each drop type needs (i) a delivery side-effect and (ii) a notification.

- **Workout drop** — delivery via `WorkoutBuilderService.assignPlan`. The materialiser path already fires a `WORKOUT_ASSIGNED` push (`assign-workout.materialiser.ts:227-253`); the manual `assignPlan` path does NOT (gap noted in `BACKEND_WORKOUT_INVENTORY.md` §7i). The drip dispatcher must explicitly fire the push.
- **Meal-plan drop** — delivery via `RealMealPlansService.assignPlan`. Push: `MEAL_PLAN_ASSIGNED` exists (`notification-kind.ts:64`) — emitted today only by the materialiser. Same dispatcher push requirement.
- **Document/PDF drop** — no delivery surface today. Need: a `ClientAssetGrant { client_id, document_id, granted_via: drop_id, granted_at, revoked_at }` row + a client-facing `GET /v1/clients/me/documents/:id/download` endpoint that mints a Supabase Storage signed download URL. New notification kind: `DOCUMENT_RELEASED`.
- **Video drop** — same shape as document. Mux signed playback URL minted on request (`mux.service.ts:mintPlaybackUrl` already supports `signed` policy with TTL). New notification kind: `VIDEO_RELEASED`.
- **Scheduled-message drop** — delivery via `MessagingService.sendAsCoach`. Side-effect surface already pushes `MESSAGE_RECEIVED` for free (`messaging.service.ts:447-455`). The drip just needs to call into `sendAsCoach` with the pre-authored body at fire time. A wrinkle: today `sendAsCoach` enforces "safety block" + "sender == coach of client" — both still correct for drips, since the package establishes the coach-client relationship.

Notification preferences: new push kinds need rows in `NotificationPreferences` defaults (see `src/notifications/notifications.service.ts:77-125`) and a migration to backfill `*_email/_push/_inapp` columns.

### g. Entitlement on per-asset access (read-time gate)

`ClientEntitlementGuard` (`src/common/guards/client-entitlement.guard.ts:7-55`) gates entire surfaces (workouts, meal plans) on the existence of ANY active `ClientPurchase`. That is coarser than the drip semantic: a buyer who paid for "Package A" should not be able to read "Package B"'s released drops just because they have *some* active entitlement somewhere.

The drip engine needs per-(client, asset) entitlement so reads honor the package boundary:
- For workouts/meals: today `client_id` equality is enough (a workout is created with `client_id=X` and only X reads it). Backwards compatible if drips create per-client assignment rows.
- For documents/videos: `ClientAssetGrant` IS the per-(client, asset) entitlement row.
- For released messages: the message lives in the client's thread already — no additional gate needed.

### h. Sub-coach scope (`SubCoachAssignment`) — same gap as workouts

The 50-Failures #5/#9 shape applies here too: `RealMealPlansService.assertClientOfCoach` / `WorkoutBuilderService.assertClientBelongsToCoach` both check `User.coach_id === coachId` directly and do **not** consult `SubCoachScopeService`. When the drip dispatcher impersonates a coach to call `assignPlan`, the seller-coach (`ClientPurchase.coach_user_id`) MUST be the head coach (which is how `User.coach_id` is always set), so the direct-FK check passes. Verify this still holds for the storefront path — `GuestCheckoutService.convertGuestToUser:1258` sets `coach_id: checkout.package.coach_id`, and packages are owned by the package's coach. If sub-coaches can sell packages (PackagesController allows `@Roles('coach')` without head/sub differentiation, `packages.controller.ts:42-49`), then a sub-coach-owned package would set `coach_id` to the sub-coach — diverging from the head-coach-only convention. Worth a deliberate decision before drips ship.

### i. No "preview drip schedule" UI surface

Coaches will want to preview "what will land in week 1 vs week 4". The schema gives us this once `DripScheduleStep` exists, but no controller mounts it today.

### j. Refund / cancellation handling

When `ClientPurchase` flips to `refunded` / `canceled` / `payment_failed`, pending `ScheduledDrop` rows for that purchase must be canceled. The hook surface again is the webhook handler — `applySubscriptionDeleted` (`checkout-webhook-handler.service.ts:284-313`), `applyPaymentIntentFailed` (`:359-406`), and the refund/dispute handler (`RefundDisputeHandlerService.handle`). Drip engine needs `cancelPendingForPurchase(purchaseId)` invoked from each.

Already-fired drops (workouts already shown, PDFs already downloaded) are harder — that is a product question: do refunds revoke past releases? `ChargeRefund` and `ChargeDispute` models exist (`schema.prisma:3231-3232` relations) so the data is there to audit.

---

## Quick map of the most critical files

| Area | Path | Key lines |
|---|---|---|
| Package CRUD service | `src/packages/packages.service.ts` | 46 (create), 63 (update + price-clear), 117 (archive), 144 (public list), 183 (price validation) |
| Package controllers | `src/packages/packages.controller.ts` | 40-103 (coach), 108-191 (client public), 162 (`@SkipClientEntitlement`) |
| Prisma — CoachPackage | `prisma/schema.prisma` | 2937-2989 (no asset-attachment fields) |
| Prisma — ClientPurchase | `prisma/schema.prisma` | 3178-3239 |
| Prisma — GuestCheckout | `prisma/schema.prisma` | 3007-3133 (state machine) |
| Storefront public controller | `src/storefront/storefront-public.controller.ts` | 53-373 (storefront /join/:token flow) |
| Storefront service | `src/storefront/storefront.service.ts` | 72-160 (`getPublicPackageByToken`) |
| Share-link mint | `src/share-link/share-link.controller.ts` | 51-72 |
| Checkout (authed) controller | `src/checkout/checkout.controller.ts` | 81-268 |
| Checkout service | `src/checkout/checkout.service.ts` | 281-303 (session upsert), 332-… (PaymentSheet path), 461-475 (reservation row) |
| Webhook dispatcher | `src/billing/billing.service.ts` | 216-374 (event-type switch) |
| Checkout webhook handler | `src/checkout/checkout-webhook-handler.service.ts` | 60-102 (switch), 104-160 (completed), 320-357 (PI succeeded), 594-615 (access_expires_at) |
| Split handler (post-charge fan-out) | `src/checkout/purchase-split-handler.service.ts` | 63 (`onChargeSucceeded` — the only existing post-checkout hook) |
| Guest checkout convert | `src/storefront/guest-checkout.service.ts` | 1240-1322 (User + ClientPurchase tx) |
| Workout assignment | `src/workout-builder/workout-builder.service.ts` | 511-541 (`assignPlan`) |
| Workout assignment AI materialiser | `src/ai/gateway/materialisers/assign-workout.materialiser.ts` | 99-256 (incl. push fire) |
| Meal plan v2 service | `src/real-meal-plans/real-meal-plans.service.ts` | 247-270 (`assignPlan`), 282-303 (`getTodayForClient` window) |
| Meal plan v1 service | `src/meal-plans/meal-plans.service.ts` | 28-45 (create), 49-55 (list) |
| Guidelines | `src/coach/coach.service.ts` | 357-365 (`postGuidelines`) |
| Mux service | `src/video/mux.service.ts` | 74-… (createDirectUpload, mintPlaybackUrl), 11-22 (env), 23-28 (disable rule) |
| Mux module | `src/video/video.module.ts` | 1-19 (@Global, exports MuxService) |
| Voice upload (Supabase Storage signed) | `src/messaging/messaging.service.ts` | 588-647 |
| Messaging service `sendAsCoach` | `src/messaging/messaging.service.ts` | 396-… |
| Notification kinds | `src/notifications/notification-kind.ts` | 14-65 |
| Notification createNotification | `src/notifications/notifications.service.ts` | 260-300 (pref + 60s rate gates) |
| Schedule module bootstrap | `src/app.module.ts` | 4, 135 |
| Booking reminder cron (canonical poll example) | `src/scheduling/jobs/reminder.job.ts` | 40-103 |
| Lost-webhook reconciler (durable polling example) | `src/storefront/lost-webhook-reconcile.service.ts` | 54 |
| Lead-sync "queue" (no-BullMQ confirmation) | `src/landing-pages/crm/lead-sync.queue.ts` | 1-38 |
| Capability materialiser registry | `src/ai/gateway/materialisers/capability-materialiser.registry.ts` | 23-75 |
| Materialiser registration | `src/ai/gateway/ai-gateway.module.ts` | 60-83 (4 materialisers in `CAPABILITY_MATERIALIZERS`) |
| `AiActionDraft` | `prisma/schema.prisma` | 2265-2302 (materialised_at, materialised_ref) |
| `Notification` (with `ai_draft_id @unique`) | `prisma/schema.prisma` | 1859-1887 |
| `ClientWorkoutAssignment` (with `ai_draft_id @unique`) | `prisma/schema.prisma` | 2035-2066 |
| `DailyMealPlanAssignment` (with `ai_draft_id @unique`) | `prisma/schema.prisma` | 2168-2188 |
