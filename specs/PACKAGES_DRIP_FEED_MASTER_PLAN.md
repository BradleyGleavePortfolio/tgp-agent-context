# PACKAGES & DRIP-FEED FULFILLMENT — MASTER PLAN

**The Growth Project (TGP) · Commerce + Drip-Feed Engine · 2026-05-29**
**Author:** Operator agent (CPO mode). Synthesises three read-only hunts:
- `COMMERCE_DRIP_INVENTORY.md` (584 lines — raw infra model catalogue)
- `COMMERCE_HUNT_COACH.md` (488 lines — GPT-5.5, coach authoring journey)
- `COMMERCE_HUNT_BUYER.md` (421 lines — Opus 4.7, buyer/guest/web journeys)

**Cross-refs:** `MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1 (the `AssignableAssetRef` seam this plan consumes).
**Backend** @ `d8698b77` · **Mobile** @ `6d17664f` (icon merge `8e48a0b`).

---

## 0. The one-sentence truth

> Today a TGP "package" is a **price tag with a name** — a successful checkout flips `entitlement_active=true`, runs a revenue split, and delivers **literally nothing** to the buyer. The entire feature is: make packages carry **content-agnostic deliverables** (workouts, meal plans, PDFs, videos, auto-messages), and make every checkout (in-app, guest, web) **fan that content out on a coach-authored drip schedule** — Apple-grade, end-to-end, above Everfit.

Three independent agents converged on the **same architecture** (one fan-out service fired inside the entitlement transaction at the same three hook points). That convergence is our strongest design signal.

---

## 1. Locked operator decisions (the 12 answers — these are law)

| # | Decision | Effect on the build |
|---|---|---|
| **1. Billing** | Coach chooses **per package**: amount, when to charge, one-time / recurring / **one-time + recurring**, recurring cadence (weekly/monthly/yearly). | Pricing config becomes a richer object than today's `billing_type`. One-time+recurring combos = a package can mint both a one-off charge AND a subscription. |
| **2. Edits after purchase** | **Coach chooses per edit**: apply to new buyers only, OR also push to existing buyers' undelivered drops. | Snapshot-at-purchase is the default/safe path; we add an explicit "push to existing" action that only ever touches `status='pending'` drops. |
| **3. Default cadence** | **Immediate on checkout** when coach doesn't set one. | New `CoachPackageContent` rows default `cadence_kind='immediate'`. |
| **4. Guest checkout** | **In scope NOW** — website checkouts must flow with auto-drip as a key function. | The guest path (`convertGuestToUser`) gets the fan-out hook this session, not later. |
| **5. Asset storage** | Highest quality → **Supabase Storage behind a `StorageProvider` interface** (S3-swappable). | PDFs/docs → Supabase signed URLs. One upload pipeline, provider-abstracted. |
| **6. Video pipeline** | Highest quality → **Mux** (adaptive HLS). Coach videos attachable to **workouts as demo videos OR to packages**. | One `CoachMediaAsset`/Mux upload pipeline, two reference points (workout exercise + package deliverable). |
| **7. Poll cadence** | Highest quality → **1-minute** `@Cron` dispatcher for scheduled drops. | `@Cron('*/1 * * * *', { name: 'drip-dispatcher' })`, env-gated like the repo's other crons. |
| **8. Immediate delivery** | **Inline at checkout** for immediate + **queue** future-dated drops. | Immediate assets materialise synchronously inside the entitlement tx; future drops become `pending` rows for the poller. |
| **9. Drop alerts** | **Push + in-app** every time content unlocks. | New `DRIP_RELEASED` (+ per-type) notification kinds; dispatcher fires both. |
| **10. Failure policy** | **Retry with backoff, then alert the coach + log.** | `ScheduledDrop.attempt_count` + backoff; on terminal failure → `COACH_ALERT` notification + structured log. |
| **11. PR ordering** | **Supersede vs fix:** if the new foundation replaces broken code, just replace it; only fix broken code the new work must build on. | Surface A + `clientPaymentsApi` get *replaced*; `transfer.failed` + webhook fan-out hook get *fixed* (engine depends on them). |
| **12. Stop rule** | **None — build straight through as CPO.** Apple-grade bar. Only surface on risk of irreversible damage. | Auto-merge each PR after Auditor confirms CLEAN of P0/P1/P2 + on-intent. |

---

## 2. Confirmed current-state facts (file:line, from the hunts)

### 2.1 What's genuinely broken TODAY (must address regardless)
| ID | Severity | What | Where | Verdict |
|---|---|---|---|---|
| **P0-a** | P0 | In-app client checkout calls **4 non-existent routes** under `/v1/clients/me/coach/*`; every buy 404s into a misleading "not enabled yet" state. | `mobile/src/api/clientPaymentsApi.ts:147,179-189,202-205,251-259` vs `src/checkout/checkout.controller.ts:82-247` | **REBUILD** (rewire to `/v1/checkout/*`) |
| **P0-b** | P0 | Confirm endpoint verb/path mismatch (POST `/clients/me/coach/checkout/confirm` vs `GET /v1/checkout/sessions/:id/confirm`) → permanent "confirmation pending". | `mobile/.../CheckoutReturnScreen.tsx:53-54` | **FIX** |
| **P0-c** | P0 | **`transfer.failed` silently dropped** (B7's genuine remaining half; `payout.failed` IS handled). Sub-coach head-coach transfer can fail invisibly. | `src/billing/billing.service.ts:372-373` | **FIX** (engine depends on it) |
| **P0-d** | P0 | **Zero post-purchase content fan-out** on any of the 3 paths. Only side effects: revenue split + (guest) welcome email. | `checkout-webhook-handler.service.ts:135-159,320-357`; `guest-checkout.service.ts:711-802,1168-1342` | **BUILD-NEW** (the whole point) |
| **B1/B2** | P0(coherence) | **Two parallel coach package surfaces**, two API clients, only one reachable; vocabularies disagree. | `CoachNavigator.tsx:406-417`; `SettingsScreen.tsx:235-238` vs `:520-523` | **SUPERSEDE** (kill Surface A) |
| **B6** | P1 | `duration_periods` is a real column consumed by the webhook but exposed in NO editor → one-time programs never expire. | `schema.prisma:2951`; absent from editors | **FIX** (expose it) |
| **B10** | P1 | **No draft/publish state** — a package goes live the instant it's saved, even empty. | `packagesApi.ts:281-282`; `packages.service.ts:46-61` | **BUILD-NEW** (publish gate) |
| **B4** | P1 | Surface B silently drops `trial_days`/`features` at DTO whitelist. | `packagesApi.ts:304-353` | resolved by SUPERSEDE |
| Guest-recurring | P1 | Storefront **refuses recurring + non-USD** → web checkout capped to one-time USD; kills subscription sales for the ICP. | `guest-checkout.service.ts:287-322` | **FIX** (decision #1 needs recurring on web) |
| `lp` attribution | P1 | `landing_page_id` captured on `GuestCheckout` but dropped before `ClientPurchase`; per-page LTV broken. | `guest-checkout.service.ts:1287-1308` | **FIX** |

### 2.2 What's solid and we REUSE
- `CoachPackage` model (extend additively), `PackagesService` CRUD, `assertValidPricing`, lazy Stripe Price cache (`packages.service.ts:46-245`).
- `CheckoutController` + `CheckoutService` — IDOR-blocked, idempotent, URL allow-listed (`checkout.controller/service.ts`).
- `PackageCheckoutScreen` (mobile) — correctly hits `/v1/checkout/sessions`; the rebuild template.
- The **entire guest pipeline** — single-flight gate, content-addressable idempotency, snapshot column, preflight cache, lost-webhook reconciler (`guest-checkout.service.ts` — "most mature surface in the repo").
- Share-link mint (idempotent, throttled) `share-link.controller.ts:51-72`.
- **AI gateway materialisers** (`assign-workout`, `assign-meal-plan`, `coach-message`, `send-notification`) — they ALREADY assign exactly our deliverable types given `(client_id, asset_ref)`. The drip executor REUSES them, it does not reimplement assignment.
- `@nestjs/schedule` + status-row + `(status, fire_at)` index — the canonical deferred-work pattern (15+ existing crons). The drip dispatcher fits this house style exactly.
- Expo push via `NotificationsService`; adding `DRIP_RELEASED` kinds is additive.

### 2.3 Hard infra gaps (net-new, confirmed absent)
- **No event bus / no BullMQ** → use cron-row pattern; hook the **3 inline call sites**.
- **No coach file/video upload, no `Asset`/`Document`/`MediaAsset` model** → new `CoachMediaAsset` + Supabase(PDF)/Mux(video).
- **No scheduled message** (`CoachMessage` has no `send_at`) → drip fires `sendAsCoach` at fire-time (no schema change needed; the drop row IS the schedule).
- **`ClientEntitlementGuard` is coarse** (any active purchase unlocks everything) → need per-(client,asset) grant for PDFs/videos (`ClientAssetGrant`).

---

## 3. Canonical schema (reconciling the two hunts' naming)

The coach hunt proposed `CoachPackageContent`/`ScheduledPackageDrop`; the buyer hunt proposed `CoachPackageAsset`/`PurchaseFanout`. **Canonical names for the build** (one source of truth):

```prisma
// ── AUTHORING: what a coach attaches to a sellable package ──
model CoachPackageContent {                 // (coach hunt's name wins — more descriptive)
  id                String   @id @default(uuid())
  package_id        String
  package           CoachPackage @relation(fields:[package_id], references:[id], onDelete: Cascade)
  asset_type        String   // workout_program | workout_plan | meal_plan | pdf | video | auto_message
  asset_id          String
  asset_revision_id String?  // pinned revision (AssignableAssetRef §3.2.1); null=HEAD only for auto_message
  display_order     Int      @default(0)
  cadence_kind      String   @default("immediate") // immediate | relative_to_purchase | fixed_calendar | on_completion | on_milestone
  cadence_payload   Json     // zod-validated per kind
  display_title     String?
  display_caption   String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  removed_at        DateTime?
  @@index([package_id, removed_at, display_order])
  @@index([asset_type, asset_id])
}

// ── PRICING: per decision #1 — coach-configurable, supports one-time + recurring together ──
// CoachPackage gains: is_sellable Boolean @default(false)
// Pricing stays on CoachPackage (amount_cents/billing_type/interval/duration_periods already exist);
// the one-time+recurring combo is modelled as an optional second Stripe price — see §6 PR-2.

// ── RUNTIME: per-buyer schedule materialised at checkout (snapshot-at-purchase) ──
model ScheduledDrop {                        // (inventory's name — clearest runtime semantics)
  id                  String   @id @default(uuid())
  client_purchase_id  String
  client_purchase     ClientPurchase @relation(fields:[client_purchase_id], references:[id], onDelete: Cascade)
  content_id          String   // snapshot ref (NOT FK — content can be soft-removed)
  asset_type          String
  asset_id            String
  asset_revision_id   String?
  cadence_kind        String
  cadence_payload     Json
  display_title       String?
  display_caption     String?
  fire_at             DateTime?              // null until trigger for on_completion/on_milestone
  fired_at            DateTime?
  status              String   @default("pending") // pending|due|fired|skipped|failed|canceled
  attempt_count       Int      @default(0)  // decision #10 backoff
  materialised_ref    String?
  failure_reason      String?
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  @@index([status, fire_at])                 // dispatcher hot path
  @@index([client_purchase_id, status])
  @@unique([client_purchase_id, content_id]) // idempotent fan-out
}

// ── FAN-OUT bookkeeping (buyer hunt's PurchaseFanout — one row per purchase) ──
model PurchaseFanout {
  id            String   @id @default(uuid())
  purchase_id   String   @unique
  purchase      ClientPurchase @relation(fields:[purchase_id], references:[id], onDelete: Cascade)
  state         String   @default("pending") // pending|in_progress|succeeded|failed
  entrypoint    String   // in_app_hosted | in_app_ps | storefront_guest
  started_at    DateTime?
  finished_at   DateTime?
  retry_count   Int      @default(0)
  last_error    String?
  created_at    DateTime @default(now())
}

// ── COACH-UPLOADED MEDIA (PDF + video) — decisions #5/#6 ──
model CoachMediaAsset {
  id            String   @id @default(uuid())
  coach_id      String
  coach         User     @relation("CoachMediaAssetCoach", fields:[coach_id], references:[id], onDelete: Cascade)
  kind          String   // pdf | video
  title         String
  description   String?
  storage_key   String   // Supabase object key (pdf) OR Mux upload/asset id (video)
  provider      String   // supabase | mux  (StorageProvider abstraction, decision #5)
  byte_size     BigInt?
  content_type  String?
  duration_sec  Int?     // video
  page_count    Int?     // pdf
  mux_playback_id String?
  created_at    DateTime @default(now())
  archived_at   DateTime?
  @@index([coach_id, archived_at, kind])
}

// ── PER-ASSET ENTITLEMENT for PDFs/videos (gap §g) ──
model ClientAssetGrant {
  id            String   @id @default(uuid())
  client_id     String
  media_asset_id String
  granted_via_drop_id String?
  granted_at    DateTime @default(now())
  revoked_at    DateTime?
  @@unique([client_id, media_asset_id])
  @@index([client_id, revoked_at])
}
```

All migrations are **additive** — `CoachPackage` only gains `is_sellable`; every existing package keeps behaving as today (paywall-only, zero content rows) until a coach attaches content.

---

## 4. The three pillars (your master-plan structure)

### Pillar 1 — Polish existing commerce to the UI/UX bible
- Kill Surface A; promote Surface B into the sectioned editor (Basics · Deliverables · Pricing · Storefront · Publish).
- Migrate off legacy `ThemeColors` → semantic tokens (builder spec §8).
- Sectioned `CoachPackageEditScreen v2`, asset-card list with inline cadence chips, bottom-sheet pickers, Preview-as-buyer.
- Buyer side: `PackageDetailSheet` (kills the silent in-line buy), `PurchaseUnpackScreen` ("here's what you just got + what's coming"), SSR thank-you parity.

### Pillar 2 — Harden existing infra to decacorn quality
- Rewire in-app checkout to real routes (P0-a, P0-b).
- Handle `transfer.failed` + coach alert (P0-c).
- Allow recurring + (phase) non-USD on storefront (decision #1 needs it).
- Propagate `landing_page_id` → `ClientPurchase`.
- Refactor guest welcome email → `NotificationsService` envelope (so the fan-out outbox owns it).
- Webhook fan-out hardening: fan-out inside the entitlement tx, no sync Stripe calls in-tx, idempotent across retries.

### Pillar 3 — Build the new master engine (content-agnostic Packages & Drip-Feed)
- `CoachPackageContent` attach model + `AssignableAssetResolver` registry (mirrors `CapabilityMaterializerRegistry`).
- `PurchaseFanoutService.onPurchaseEntitled` at all 3 hook points → seeds `ScheduledDrop` + fires immediate inline.
- `DripDispatcherCron` (1-min) → fires due drops via per-type dispatchers (REUSE materialisers).
- `on_completion`/`on_milestone` trigger glue (listens for `WorkoutSession.completed`, milestone emits → sets `fire_at`).
- `CoachMediaAsset` upload (Supabase PDF + Mux video, provider-abstracted) — dual attach (workout demo + package).
- Refund/cancel → `cancelPendingForPurchase` from refund/dispute/sub-deleted handlers.
- New notification kinds `DRIP_RELEASED` / `DOCUMENT_RELEASED` / `VIDEO_RELEASED` / `COACH_NEW_PURCHASE` + prefs backfill.

---

## 5. Hook points (exact, file:line — the convergence)

All three checkout paths flip `entitlement_active=true`; all three call **one** `PurchaseFanoutService.onPurchaseEntitled(purchase, ctx, tx)` **inside the same `$transaction`**:

1. `src/checkout/checkout-webhook-handler.service.ts:152` — `applyCheckoutCompleted` (in-app hosted), after `splits.onChargeSucceeded`.
2. `src/checkout/checkout-webhook-handler.service.ts:348` — `applyPaymentIntentSucceeded` (in-app PaymentSheet).
3. `src/storefront/guest-checkout.service.ts:1320` — inside `convertGuestToUser`'s tx, after `ClientPurchase.create`. **Guest needs no late-binding** — User is created → ClientPurchase written → fan-out, all in one tx.

Fan-out logic: for each `CoachPackageContent` (removed_at null) → compute `fire_at` per cadence → upsert `ScheduledDrop` (on-conflict-nothing = idempotent) → for `immediate` rows, dispatch inline via resolver, set `status='fired'`. Future rows wait for the 1-min cron.

Refund/cancel cancellation hooks: `applySubscriptionDeleted` (`:284-313`), `applyPaymentIntentFailed` (`:359-406`), `RefundDisputeHandlerService.handle`.

---

## 6. PR SEQUENCE (build → audit → fix-until-CLEAN P0/P1/P2 → auto-merge → next)

Ordered per decision #11 (supersede vs fix) and to unblock the activation gap fastest. Each PR = one Opus 4.7 builder worktree → separate Auditor worktree → fix loop → auto-merge.

| PR | Title | Pillar | Type | Key files |
|---|---|---|---|---|
| **PR-1** | **Fix in-app checkout (P0-a/P0-b) + stop swallowing real 404s.** Rewire `clientPaymentsApi` → `/v1/checkout/*`; flip confirm POST→GET; fix `isNotConfigured`. | 2 | FIX | `clientPaymentsApi.ts`, `CheckoutReturnScreen.tsx`, `ClientPackagesScreen.tsx` |
| **PR-2** | **Handle `transfer.failed` (P0-c)** + persist `ConnectTransfer.status='failed'` + `COACH_ALERT`. | 2 | FIX | `billing.service.ts:372`, `refund-dispute-handler.service.ts` |
| **PR-3** | **Additive schema migration:** `is_sellable`, `CoachPackageContent`, `ScheduledDrop`, `PurchaseFanout`, `CoachMediaAsset`, `ClientAssetGrant`. No behaviour change. | 3 | BUILD | `prisma/schema.prisma` |
| **PR-4** | **`PurchaseFanoutService` (no-op body) + wire all 3 hook points** inside the tx. Gets the seam in. | 2/3 | BUILD | hooks at §5; `checkout.module.ts` |
| **PR-5** | **Kill Surface A; unify on Surface B + one API client.** Re-home earnings/payout methods to `coachEarningsApi`. | 1 | SUPERSEDE | `CoachPackagesScreen.tsx` (del), `coachPaymentsApi.ts`, `CoachNavigator.tsx`, `SettingsScreen.tsx`, `BillingSection.tsx` |
| **PR-6** | **Backend reads + draft/publish + duration_periods + pricing config (decision #1).** `GET :id`, `GET :id/subscribers`, `POST :id/publish`/`unpublish`, expose `duration_periods`, one-time+recurring combo pricing. | 1/2 | FIX+BUILD | `packages.controller/service/dto.ts` |
| **PR-7** | **`AssignableAssetResolver` registry** + workout/meal/auto-message/pdf/video resolvers (each module registers). | 3 | BUILD | new `assignable-asset.registry.ts`; module wiring |
| **PR-8** | **Coach contents endpoints** (`GET/PUT/POST/PATCH/DELETE :id/contents`) + zod-per-cadence validation. | 3 | BUILD | `packages.controller/service.ts` |
| **PR-9** | **Real fan-out body**: seed `ScheduledDrop`, fire immediate inline (decision #8). | 3 | BUILD | `PurchaseFanoutService` |
| **PR-10** | **`DripDispatcherCron` (1-min, env-gated)** + per-type dispatchers (REUSE materialisers) + push (decision #9) + backoff/coach-alert (decision #10). | 3 | BUILD | new `drip-dispatcher.*`; notification kinds |
| **PR-11** | **`on_completion` / `on_milestone` trigger glue** — set `fire_at` on event. | 3 | BUILD | event listeners; dispatcher |
| **PR-12** | **`CoachMediaAsset` upload** — Supabase(PDF)+Mux(video) behind `StorageProvider`; dual attach (workout demo + package); `ClientAssetGrant` + download/playback endpoints. | 3 | BUILD | new media module; mux/supabase |
| **PR-13** | **Mobile Deliverables section** in `CoachPackageEditScreen v2` — asset cards + cadence chips + picker from Assignables Library. | 1 | BUILD | mobile edit screen |
| **PR-14** | **Guest recurring + landing_page_id propagation** (decision #1 web; lp attribution). | 2 | FIX | `guest-checkout.service.ts`, `storefront.service.ts` |
| **PR-15** | **Buyer `PurchaseUnpackScreen` + SSR thank-you parity + `COACH_NEW_PURCHASE`** + receipt surfacing. | 1 | BUILD | mobile + SSR + notifications |
| **PR-16** | **Refund/cancel → `cancelPendingForPurchase`** from refund/dispute/sub-deleted handlers. | 2/3 | FIX | webhook handlers |
| **PR-17** | **Edit-after-purchase "push to existing" action** (decision #2) — apply to `pending` drops only; "future buyers only" copy. | 1/3 | BUILD | contents endpoints + mobile |
| **PR-18** | **Polish pass**: semantic tokens, Preview-as-buyer, sub-coach fork-on-attach guard, custom-domain host-header TODO, lock-pricing-after-subscriber. | 1 | POLISH | mobile + backend |

Dependencies: PR-3 unblocks 4,7,8,9,12; PR-7 unblocks 9,10; PR-4 unblocks 9; PR-5 unblocks 6,13. PR-1/2 are independent and ship first (stabilise).

---

## 7. The 50-Failures Auditor gate (every PR must pass; merge bar = CLEAN of P0/P1/P2)

Commerce/drip-critical passes: **#2 RLS, #5 IDOR, #8 input-validation, #21 N+1, #23 pagination, #28 race, #30 optimistic-rollback, #44 transactions, #45 soft-deletes** — plus drip-specific:
- **Idempotent fan-out** (`@@unique([client_purchase_id, content_id])`; Stripe event replay safe).
- **No sync Stripe HTTP in-tx** (existing anti-pattern A276-P1-3).
- **Money+content commit-or-rollback together** (fan-out inside entitlement tx).
- **Per-(client,asset) entitlement** for PDFs/videos (no cross-package leakage).
- **Sub-coach scope**: dispatcher impersonation respects `SubCoachScopeService`, not raw `User.coach_id`.
- **`SKIP LOCKED`** on the dispatcher claim query (multi-instance safe).
- **Snapshot-at-purchase**: coach edits never retroactively mutate a buyer's scheduled drops (except explicit decision-#2 push).

---

## 8. Doctrine (R-rules) in force this session
- **R4** commit identity `Dynasia G <dynasia@trygrowthproject.com>`, no Co-Authored-By/Generated trailers.
- **R31** audits never by the implementing agent. **R56-R60** one subagent/worktree; backend-main & mobile READ-ONLY.
- **R64** push every artifact to tgp-agent-context the **same turn**.
- **Tonight only:** operator authorised auto-merge (overrides R32) — merge only when Auditor-CLEAN of P0/P1/P2 + on-intent; stop only on irreversible-damage risk.

— end MASTER PLAN —
