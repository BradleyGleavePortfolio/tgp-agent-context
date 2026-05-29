# Commerce Hunt — COACH SIDE (Package Creation & Asset Attachment)

**Author:** GPT-5.5 (read-only investigator).
**Date:** 2026-05-29.
**Scope:** Coach (and sub-coach) experience of *making packages to sell* and *attaching deliverables*. Client/guest/web-checkout buyer side is owned by a separate Opus agent (see boundary notes §7).
**Repos read:** backend `growth-project-backend-801d704e` @ `d8698b77`, mobile `growth-project-mobile-e086da42` @ `6d17664f`.
**Cross-refs:** consumes the `AssignableAssetRef` seam defined in `MASTER_WORKOUT_BUILDER_SPEC.md` §3.2.1; reads `COMMERCE_DRIP_INVENTORY.md` only if present (not present at start of run — proceeded without).

> **TL;DR for the operator (in one breath):**
> Today a coach "package" is a price tag with a name. Nothing about a workout, meal plan, PDF, video, or auto-message ever touches it. There are **two parallel coach-package surfaces** wired into navigation, **two parallel API clients** pointed at the same backend route, **two contradictory billing-interval vocabularies** in the mobile codebase, **no `/v1/coach/packages/:id` GET**, **no `:id/subscribers`**, **no draft state**, **no asset-attachment table**, and **the only side effect of `checkout.session.completed` is flipping `entitlement_active = true`** (`checkout-webhook-handler.service.ts:135–146`). Coaches can author packages, but a buyer who completes checkout receives **literally nothing** materialised — no workout assignment, no meal-plan assignment, no welcome message, no notification. This is the activation gap. The fix is a focused new layer (`CoachPackageContent` + drop schedule + post-paid fan-out into the existing materialiser registry) on top of the existing CRUD, **plus** picking ONE of the two competing coach-package surfaces and ripping the other out.

---

## 0. Method

Walked both repos via Grep + Read, traced the actual coach mobile entry paths to the package surfaces, read every DTO + service path that touches `CoachPackage`, audited the Stripe webhook handler for post-purchase side-effects, mapped to existing assignment models (`ClientWorkoutAssignment`, `DailyMealPlanAssignment`) and the AI gateway materialisers (`assign_workout`, `assign_meal_plan`, `coach_message`, `send_notification`) that already exist for delivering each of the deliverable types the brief names. Did NOT read the sibling `COMMERCE_DRIP_INVENTORY.md` — does not exist yet.

---

## 1. CURRENT STATE — how a coach makes a package today (the actual page path)

### 1.1 The two parallel surfaces (yes, both are wired)

There are **two completely separate coach-package UIs** in the mobile app, both registered in the same Settings stack, **fed from two separate API clients** that hit the same backend routes with different request/response vocabularies. Whichever entry point a coach taps first decides which UI they get.

| Surface | Entry path (coach) | Screen file | Nav route | API client |
|---|---|---|---|---|
| **Surface A** — single-screen modal CRUD ("packages CRUD inline") | Settings → `BillingSection.onOpenPackages` (`SettingsScreen.tsx:520-523`) → `CoachPackages` | `src/screens/coach/CoachPackagesScreen.tsx` (740 lines, line 277 entry) | `CoachPackages` registered at `CoachNavigator.tsx:407-409` | `src/api/coachPaymentsApi.ts:183-236` (`coachPaymentsApi`) |
| **Surface B** — list + edit + subscribers (3-screen stack, has share-link UX, archive copy) | Settings → `handleOpenPackages` (`SettingsScreen.tsx:235-238`) → `CoachPackagesList` | `src/screens/coach/payments/CoachPackagesListScreen.tsx`, `CoachPackageEditScreen.tsx`, `CoachPackageSubscribersScreen.tsx` | `CoachPackagesList`/`CoachPackageEdit`/`CoachPackageSubscribers` at `CoachNavigator.tsx:412-417` | `src/api/packagesApi.ts:357-432` (`coachPackagesApi`) |

`SettingsScreen.tsx` literally has **both handlers in the same file**: `handleOpenPackages` at L235-238 navigates to surface B (`CoachPackagesList`), but `BillingSection` is given `onOpenPackages: () => navigation.navigate('CoachPackages')` at L520-523 which navigates to surface A. `SettingsScreen.tsx:237` (`navigation.navigate('CoachPackagesList')`) is dead — nothing in the rendered Settings tree triggers it; the actual "Packages" row a coach taps lives inside `BillingSection` and routes to Surface A.

So in *runtime practice today*: **a coach hits Surface A.** Surface B is orphaned but compiled, linked into the nav graph, and accumulates maintenance burden. The test `src/__tests__/paymentsConnectPackages.test.ts:354-372` asserts `navigation.navigate('CoachPackages')` (surface A), confirming the active path.

### 1.2 Page path (what the active coach actually walks through, today)

```
Tab bar → Settings (SettingsScreen.tsx)
  └─ BillingSection ("Business" group)
       └─ "Packages" row (BillingSection.tsx:54-63)
            → CoachPackages route (Surface A: CoachPackagesScreen.tsx)
                 ├─ Top bar: ← Packages  + (add) — disabled when notConfigured OR !charges_enabled (L427-439)
                 ├─ Body:
                 │    • if Stripe not connected: "Connect Stripe to create plans" gate (L472-495)
                 │      with "Connect Stripe" CTA → coachConnectApi.createOnboardingLink (L316-324)
                 │    • else if charges_enabled === false: yellow readiness banner (L450-470)
                 │    • else if list empty: "No packages yet" empty state (L497-504)
                 │    • else: list of cards [name, price/interval, "N active", hide/restore + pencil] (L506-540)
                 └─ PackageEditor (modal sheet, L72-275)
                      Fields: name, description, price, currency (3-char), type (Subscription|One-time),
                      billing interval (month|year), Visible-to-clients toggle, fee hint
                      Save → coachPaymentsApi.create/update (L351-352) → reload
```

Surface B's user journey is more elaborate (List → Edit screen with archive + share + subscribers link), but no coach ever sees it through the live SettingsScreen.

### 1.3 The full inventory (file:line cited)

**Backend (NestJS):**

| Concern | Location |
|---|---|
| HTTP routes (coach CRUD) | `src/packages/packages.controller.ts:43-103` — `GET /v1/coach/packages`, `POST`, `PATCH :id`, `DELETE :id`. Guards: `JwtAuthGuard, CoachOrOwnerGuard, SubscriptionGuard` (L42). |
| HTTP routes (client read) | `src/packages/packages.controller.ts:111-191` — `GET /v1/clients/me/coach` (coach profile), `GET /v1/clients/me/coach/packages` (list active), `GET /v1/clients/me/coach/packages/:id`. **No `GET /v1/coach/packages/:id`** despite mobile expecting it (`packagesApi.ts:372-377` "TODO not yet deployed"). |
| Service | `src/packages/packages.service.ts` — `create` L46-61, `update` L63-115, `archive` L117-124, `listForCoach` L128-140, `listPublicForCoach` L144-149, `getById` L151-153 (used internally, not exposed), `requireOwnedPackage` L155-169, `setStripeIds` L173-181 (called by checkout lazy Price mint), `assertValidPricing` L183-245. |
| DTOs | `src/packages/packages.dto.ts` — `CreatePackageDto` L4-39 accepts `billing_interval ∈ {week,month,year}` (L28); `UpdatePackageDto` L41-65 accepts ONLY `name, description, amount_cents, currency, is_active` (no interval changes after create). |
| Module | `src/packages/packages.module.ts` — registers controllers + exports `PackagesService` for checkout's lazy Price-mint cache. |
| Share-link | `src/share-link/share-link.controller.ts:31-73` — `POST /v1/coach/packages/:id/share-link` (mint or get), `POST .../revoke`. Throttle 30/min. |
| Storefront public | `src/storefront/storefront-public.controller.ts:61+` — `/v1/packages/public/...` for guest-checkout buyers (out of scope). |
| Checkout creation | `src/checkout/checkout.controller.ts:101-118` — `POST /v1/checkout/sessions` for authed clients. |
| Webhook → entitlement | `src/checkout/checkout-webhook-handler.service.ts:104-160` — `applyCheckoutCompleted` flips `status` + `entitlement_active` + records Stripe ids + (optional) split posting. **Nothing else.** |
| Prisma `CoachPackage` | `prisma/schema.prisma:2937-2989` (53 lines) — id, coach_id, name, description, amount_cents, currency, billing_type, interval, interval_count, **duration_periods** (L2951 — already in schema but **not surfaced anywhere in UI**), stripe_price_id, stripe_product_id, is_active, archived_at, share_token (L2976), share_link_enabled, share_link_generated_at, share_link_expires_at, share_link_revoked_at. |
| Prisma `ClientPurchase` | `prisma/schema.prisma:3178-3239` — snapshot of amount/currency/billing_type + status enum {pending|paid|active|past_due|canceled|payment_failed|expired} + entitlement_active + access_expires_at + dunning + splits + reconciliation. |
| Prisma `GuestCheckout` (out of scope but adjacent) | `schema.prisma:3007-3060` — guest-checkout state machine for shared-link buyers. |

**Mobile (RN/Expo):**

| Concern | Location |
|---|---|
| Surface A screen | `src/screens/coach/CoachPackagesScreen.tsx:277-563`; modal editor L72-275; styles via legacy `ThemeColors` (L47) NOT semantic tokens. |
| Surface B list | `src/screens/coach/payments/CoachPackagesListScreen.tsx:56-202`. |
| Surface B edit (with archive + share + subscribers nav) | `src/screens/coach/payments/CoachPackageEditScreen.tsx:69-485`. |
| Surface B subscribers (talks to a non-existent backend route) | `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx:50-211`. |
| API client A | `src/api/coachPaymentsApi.ts` — uses `name`, `price` (major units), `type ∈ {one_time,recurring}`, `interval ∈ {month,year}`, `active`. Maps backend `amount_cents → price = amount_cents/100` (L147-148). |
| API client B | `src/api/packagesApi.ts` — uses `title`, `priceCents`, `billingInterval ∈ {one_time,monthly,quarterly,yearly}`, `status ∈ {draft,active,archived}`, `shareToken`, `subscriberCount`, `monthlyRevenueCents`, `trialDays`, `features[]`. Maps to backend on the wire (L207-353). **`quarterly`** is faked as `month` × `intervalCount=3` (L226-228); backend never knows it was quarterly. |
| Navigation registration | `src/navigation/CoachNavigator.tsx:26-28, 80, 195-200, 407-417`. |
| Settings entry | `src/screens/coach/SettingsScreen.tsx:235-238` (handleOpenPackages, navigates Surface B — **unreachable from rendered UI**), `:520-523` (BillingSection.onOpenPackages, navigates Surface A — **the actually-reachable one**). |
| Tests asserting Surface A is the live one | `src/__tests__/paymentsConnectPackages.test.ts:354-372`. |

---

## 2. WHAT'S BROKEN / WEIRD ALREADY (with file:line + severity)

| # | Finding | File:Line | Severity |
|---|---|---|---|
| **B1** | **Two parallel coach-package surfaces, both wired.** Surface A (`CoachPackagesScreen`) and Surface B (`CoachPackagesListScreen`+`CoachPackageEditScreen`+`CoachPackageSubscribersScreen`) are both registered in the SettingsStack and reachable via different (dead vs live) navigation calls. They use different vocabularies, different APIs, and disagree on data shape. | `CoachNavigator.tsx:406-417`; `SettingsScreen.tsx:235-238` vs `:520-523` | **CRITICAL — coherence killer; the codebase is lying about which one is canon.** |
| **B2** | **Two competing API clients for the same backend route.** `coachPaymentsApi` (`name`/`price`/`type`) and `coachPackagesApi` (`title`/`priceCents`/`billingInterval`) both call `GET/POST/PATCH/DELETE /v1/coach/packages`. They diverge on currency case (one defaults `'USD'` upper, backend lowercases L54), on interval vocabulary (`month/year` vs `monthly/quarterly/yearly`), and on which fields they send. | `coachPaymentsApi.ts:183-236` vs `packagesApi.ts:357-432` | **CRITICAL** |
| **B3** | **Surface B fakes "quarterly" on the wire.** Mobile sends `billing_interval='month'`, `billing_interval_count=3` to the backend (`packagesApi.ts:226-228`), then re-derives `quarterly` from `count>=3 && count<12` on read (`packagesApi.ts:267-270`). Backend has no notion of quarterly. Editing the same row via Surface A's "Subscription · Monthly | Yearly" segment silently loses the quarterly intent on the next save. | `packagesApi.ts:222-228, 260-276` | **HIGH** |
| **B4** | **Surface B sends `trial_days`/`features` that the backend rejects.** The DTO whitelist (`forbidNonWhitelisted: true` is the global default, confirmed in `checkout.controller.ts:84`) silently drops them via DTO transformation. Surface B's edit form (`CoachPackageEditScreen.tsx:372-393`) collects them and the UI shows them on the next render — but they are **never persisted server-side**; the next list reload returns `trialDays: null, features: []` (mapping default in `packagesApi.ts:292-293`). The mobile-side TODO comments admit it: `packagesApi.ts:313-316, 331, 341-343`. | `packagesApi.ts:304-353`; `CoachPackageEditScreen.tsx:372-393` | **HIGH — silent data loss** |
| **B5** | **`UpdatePackageDto` cannot change billing shape after create.** It only accepts `{name, description, amount_cents, currency, is_active}` (`packages.dto.ts:41-65`). A coach who creates "Monthly $199" cannot change it to "One-time $1500" without archiving + recreating, but no UI tells them this — the Surface B segment lets you tap "One-time" and "Save" succeeds (server ignores the unknown field) with no error and no change. | `packages.dto.ts:41-65`; `CoachPackageEditScreen.tsx:344-368` | **HIGH** |
| **B6** | **`duration_periods` is a real schema column with no UI anywhere.** The schema column at `schema.prisma:2951` is documented as "number of weeks/sessions the program lasts (entitlement expiry) — null means lifetime", and the checkout webhook actually consumes it to compute `access_expires_at` (`checkout-webhook-handler.service.ts:133` via `computeAccessExpiry`). But **neither surface exposes it**, so a coach selling a "12-week program" cannot set the 12-week duration that ends entitlement, and **every `one_time` package effectively has no expiry**. | `schema.prisma:2951`; absent from both editors | **HIGH** |
| **B7** | **`POST /checkout/sessions` is the only buy path; webhook materialises NOTHING beyond `entitlement_active=true`.** No assignment of a workout, meal plan, welcome message, push, scheduled message, or anything else fires when a purchase completes. The package is purely a paywall. | `checkout-webhook-handler.service.ts:104-160` | **CRITICAL (the activation gap)** |
| **B8** | **No `GET /v1/coach/packages/:id` endpoint.** Surface B works around it by piping the list row through nav params (`CoachPackageEditScreen.tsx:54-56, 89-115`), which means: refreshing the edit screen / deep-linking to it / navigating from a push hard-fails with the "Could not load package — Open the package from the list" alert at L109-114. | `packages.controller.ts` (absent); `CoachPackageEditScreen.tsx:88-115`; `packagesApi.ts:370-377` (TODO) | **MEDIUM** |
| **B9** | **No `GET /v1/coach/packages/:id/subscribers` endpoint.** `CoachPackageSubscribersScreen` exists, has a working error path for 404 (`L70-76`), but every coach who taps "View subscribers" gets the "Not available in this environment yet" message — meaning Surface B's biggest unique feature is permanently unfulfilled. | `packages.controller.ts` (absent); `CoachPackageSubscribersScreen.tsx:60-81`; `packagesApi.ts:414-420` (TODO) | **MEDIUM (in surface B; moot if we kill surface B)** |
| **B10** | **No draft / publish state.** Both surfaces conflate `is_active` (visible to clients) with "ready". The instant a coach types a name + price and taps Save, the package is **live, visible at `GET /clients/me/coach/packages`, and purchasable** — even with no description, no attached deliverable, no share link minted. Surface B's `status: 'draft'` field (`packagesApi.ts:31, 49`) is **only ever inferred from `is_active === false` on read** (`packagesApi.ts:281-282`); it cannot be set independently. There's no "Publish" action anywhere. | `packagesApi.ts:281-282`; `packages.service.ts:46-61` (create sets `is_active=true` by default) | **HIGH (essential for the attach-deliverables flow)** |
| **B11** | **Share-link UI half-wired.** `POST /v1/coach/packages/:id/share-link` exists in `share-link.controller.ts:51-58` and Surface B has a "Share link" button (`CoachPackageEditScreen.tsx:415-435`), but the mint is **never called from the edit screen** — the button only does `Share.share()` IF `original.shareToken` is already populated. The list/get response never includes it for non-minted packages. So the button is permanently in the disabled "Share links are coming soon" state (L425-436) for any package the coach hasn't manually triggered a mint for somewhere else (and that surface doesn't exist). | `CoachPackageEditScreen.tsx:250-269, 415-436`; `share-link.controller.ts:50-58` | **MEDIUM (acquisitions blocker for surface B)** |
| **B12** | **Surface A button gates on Connect readiness, Surface B doesn't.** Surface A grays the `+` and disables it when `notConfigured || !charges_enabled` (`CoachPackagesScreen.tsx:432-439`), Surface B never checks payout readiness at all — a coach can author a package on Surface B with no Connect account; first checkout 4xxs at Stripe. | `CoachPackagesListScreen.tsx:56-202`; cf. `CoachPackagesScreen.tsx:312-314` | **MEDIUM** |
| **B13** | **Currency mismatch.** Surface A defaults `DEFAULT_INPUT.currency = 'USD'` upper-case (`CoachPackagesScreen.tsx:62-70`), backend lowercases it on insert (`packages.service.ts:54`). Round-trip works, but the on-screen currency input shows whatever case the user typed and the displayed price after save is suddenly lowercased — visual jitter, no functional break. Surface B sends lowercase. | `CoachPackagesScreen.tsx:62-70, 183-188`; `packages.service.ts:54` | **LOW** |
| **B14** | **`SkipClientEntitlement` decorator on coach reads ignored / wrong layer.** Coach-facing `GET /v1/coach/packages` is guarded by `SubscriptionGuard` (`packages.controller.ts:42`) — a coach whose own platform subscription is past-due cannot read their own package catalog, even read-only. Same on update/delete. (The same controller has a `@SkipClientEntitlement` decorator on the *client* path L161, confirming it's a known pattern — just not applied to the coach side, where it's arguably wrong because a coach should be able to view/archive even in a downgraded state.) | `packages.controller.ts:42, 49-103` | **LOW–MEDIUM** |
| **B15** | **Inconsistent fee disclosure.** Surface A shows a "TGP fee 2% + Stripe fees ~2.9% + 30¢" estimate in the editor (`CoachPackagesScreen.tsx:192-199`), Surface B shows nothing. The 5% head-coach-split case (sub-coaches under a head coach, `coachPaymentsApi.ts:25-26`) is documented in code comments but never surfaced anywhere in either editor. | `CoachPackagesScreen.tsx:118-124, 192-199` | **LOW** |
| **B16** | **Surface A uses legacy `ThemeColors`**, not `semanticColors`/`tokens.ts`, contradicting the design-system standardisation that the Master Workout Builder spec §8 mandates. | `CoachPackagesScreen.tsx:47` | **LOW (style debt)** |
| **B17** | **Confusing CTA semantics on the empty state.** Surface B's PACKAGES_NOT_CONFIGURED branch renders "Create your first package" (`CoachPackagesListScreen.tsx:43-48`) when the backend itself is not deployed — that copy promises an action that cannot succeed; tapping `+` will 404. | `CoachPackagesListScreen.tsx:41-54, 150-161` | **LOW** |
| **B18** | **No coach-facing "what does this package deliver?" anywhere.** This is the brief's whole point — there is no surface for attaching workouts, meal plans, PDFs, videos, or auto-messages to a package today. The package row stops at price + name + description (free text). | n/a (absence) | **CRITICAL (the build target)** |

---

## 3. REUSE / REFACTOR / REBUILD / BUILD-NEW — per coach-side component

| Component (coach side) | Today | Verdict | Rationale |
|---|---|---|---|
| `CoachPackage` Prisma model (`schema.prisma:2937-2989`) | Solid 53-line table with stripe ids, share-link, archive, duration_periods | **REUSE — extend additively** | The columns are right; we just need new tables next to it (see §4). Touching this row's shape risks breaking checkout/webhook/share-link/lazy-Price-cache. Add columns only if absolutely needed. |
| `PackagesService` (create/update/archive/list, `packages.service.ts`) | Clean, transactional, validates pricing, lazy Stripe Price cache | **REUSE; expose `getById` route + add `setContents` method** | The CRUD is fine. Add a thin `POST /v1/coach/packages/:id/contents` (or `PATCH …/contents`) for attaching deliverables (§4.4) and add `GET /v1/coach/packages/:id`. |
| `CreatePackageDto` / `UpdatePackageDto` (`packages.dto.ts`) | Whitelist DTO; cannot change billing shape on update | **REFACTOR** | Add `duration_periods` to both (fixes B6); add `status ∈ {draft, active}` (fixes B10); allow `UpdatePackageDto` to receive `billing_type/interval/interval_count` for the pre-publish (draft) window only — once `status='active'` and a `ClientPurchase` exists, lock pricing fields (preserves Stripe Price immutability invariant). Reject `trial_days`/`features` (fix B4) UNTIL the schema actually supports them. |
| `CoachPackagesController` (`packages.controller.ts`) | Coach CRUD + client read in one file | **REUSE; add `GET :id`, `GET :id/contents`, `PUT :id/contents`, `POST :id/publish`, `POST :id/unpublish`, `GET :id/subscribers`** | All net-new routes (§4). Keep the existing route shapes — the mobile code already calls them. |
| `CoachPackagesScreen.tsx` (Surface A) — single modal | Active path today, gates on Stripe Connect, fee hint | **RIP OUT** | A single modal is the wrong shape once we attach N heterogeneous deliverables with per-asset drip cadence. A modal cannot host an asset picker + cadence pickers without becoming horrible. |
| Surface B (`CoachPackagesListScreen` + `CoachPackageEditScreen` + `CoachPackageSubscribersScreen`) | 3-screen stack, has archive copy + share + subscribers nav | **REFACTOR & PROMOTE** | The 3-screen structure is the right scaffold for the build target (list → editor with sections → subscribers as a separate sheet). The edit screen needs: (a) sectioned form (Basics · Deliverables · Pricing · Publish), (b) ditch fake `quarterly`, (c) wire to ONE API client (B), (d) actually call share-link mint on save, (e) surface `duration_periods`. |
| `coachPaymentsApi.ts` | Surface A's API client | **RIP OUT** (in favour of `packagesApi.ts`) | Surface A goes; this client goes with it. The earnings/payout/reconciliation/refunds endpoints it ALSO covers (L216-235) should be re-homed into a tightly-scoped `coachEarningsApi` (or merged into `packagesApi.ts` as a separate section) so we don't lose them. |
| `packagesApi.ts` | Surface B's API client; richer mapping; has share-link helper | **REFACTOR** | Keep, but: (a) drop fake `quarterly` (B3) — either add `'quarterly'` to backend `billing_interval` enum or remove from UI; (b) stop sending `trial_days`/`features` until backend accepts them; (c) wire `coachPackagesApi.get(id)` once the backend route lands (B8); (d) add helpers for new `:id/contents` routes (§4.4). |
| `CoachNavigator.tsx` package route block (L406-417) | Both surfaces registered | **REFACTOR** | Keep `CoachPackagesList`, `CoachPackageEdit`, `CoachPackageSubscribers`. Delete the `CoachPackages` route + the `CoachPackagesScreen` import. Add a new `CoachPackageAttachAsset` route (asset-picker modal/sheet). |
| `SettingsScreen.tsx` entry handlers (L235-238 + L520-523) | Conflicting handlers, only one reachable | **REFACTOR** | Drop the inline `BillingSection.onOpenPackages` redirect to `CoachPackages`; have it call `handleOpenPackages` (which already navigates `CoachPackagesList`). |
| Share-link endpoint (`share-link.controller.ts`) | Works, throttled, idempotent | **REUSE** | Just call it from the edit screen on first save / publish so the share link materialises (fixes B11). |
| Checkout webhook (`checkout-webhook-handler.service.ts:104-160`) | Flips entitlement, runs splits | **REFACTOR — wedge in a "post-purchase fan-out" step** | After the `clientPurchase.update` at L135 succeeds, call a new `PackageContentsFanoutService.onPurchasePaid(purchase)`. That service reads the package's attached `CoachPackageContent` rows and, for each, either (a) directly creates the `ClientWorkoutAssignment` / `DailyMealPlanAssignment` / sends `CoachMessage` / schedules `Notification` for the `'immediate'` cadence, or (b) writes a `ScheduledPackageDrop` row for later cadences (§4.5). |
| Mobile `PackageEditor` modal (Surface A `CoachPackagesScreen.tsx:72-275`) | Self-contained, dies with surface A | **RIP OUT** | — |
| Mobile `CoachPackageSubscribersScreen` | Reads non-existent endpoint | **REUSE + ship the backend** | Backend ships `GET /v1/coach/packages/:id/subscribers` (`ClientPurchase` join + aggregate); screen already handles the loading/empty/error paths. |
| **NEW: Assignables Library** (workouts + meals + PDFs + videos + auto-messages) | Doesn't exist for packages | **BUILD-NEW** | The Master Workout Builder spec §8.2 already calls for a unified Assignables Library tab repurposed from the "Templates" tab. The coach-side package-creation flow should attach assets *by picking from that library*. Today neither the library nor the picker exists; both need to ship (workout side covered by Master Workout Builder; meals/PDF/video/auto-message are net new). |
| **NEW: `CoachPackageContent` table** | Doesn't exist | **BUILD-NEW** | The whole attach-deliverables model (§4). |
| **NEW: `ScheduledPackageDrop` table** | Doesn't exist | **BUILD-NEW** | The whole drip-cadence model (§4.5). |
| **NEW: PDF / video upload media (coach-uploaded, not Mux exercise demos)** | Doesn't exist — `Mux` is exercise-library only; no general media table | **BUILD-NEW** | Need a `CoachMediaAsset` table + S3 upload service or extend the existing Mux/profile-avatar pattern. Out of strict scope of THIS spec but a hard dependency for "attach a PDF / video as deliverable". |

---

## 4. ATTACHING DELIVERABLES — design (the build target)

### 4.1 Constraint recap (from the brief + builder spec §3.2.1)

A package may carry **N heterogeneous deliverables**. Each deliverable is:
1. A reference to an existing **assignable asset** (workout program, meal plan, PDF, video, auto-message template) — never a copy of the asset's content, and **never** a reference to a mutable HEAD (the asset must be pinned to an immutable revision per builder §3.2.1).
2. Decorated with a **drip cadence** the coach chooses per-asset: `immediate` / `relative_to_purchase(offset)` / `fixed_calendar(date)` / `on_completion(asset_ref)` / `on_milestone(milestone_key)`.

The builder spec calls this stable, content-agnostic identity `AssignableAssetRef`. The package side **consumes** that contract; the runtime scheduler that fires drops at the right time is the **drip spec** (sibling — `PACKAGES_DRIP_FEED_SPEC.md`), not this spec.

### 4.2 New Prisma tables (consume `AssignableAssetRef`)

```prisma
// One row per "this asset is attached to this package", with the per-asset
// drip cadence the coach configured at authoring time. Append-only at the
// table level (we soft-delete via `removed_at`); the editor mutates by
// adding a new row and tombstoning the old, so paying clients with a frozen
// snapshot of the package they bought (§4.3) keep a stable history.
model CoachPackageContent {
  id            String       @id @default(uuid())
  package_id    String
  package       CoachPackage @relation(fields: [package_id], references: [id], onDelete: Cascade)

  // ── AssignableAssetRef seam (builder spec §3.2.1) ──
  // asset_type discriminates which other table to resolve against; the
  // resolver is owned by each asset's own master-builder module (workout
  // builder owns `resolveWorkoutAsset`, the future nutrition planner owns
  // `resolveMealAsset`, etc). The package module never imports them
  // directly — it dispatches by string.
  asset_type    String       // 'workout_program' | 'workout_plan' | 'meal_plan' | 'pdf' | 'video' | 'auto_message'
  asset_id      String       // FK target lives in the owning module's table
  asset_revision_id String?  // pinned revision pointer; null = follow HEAD (only valid for `auto_message`)

  // Position in the bundle (display order on storefront + drop dispatch order).
  display_order Int          @default(0)

  // ── Drip cadence (authoring shape) ──
  // ENUM is the canonical taxonomy; the per-mode payload lives in cadence_payload (JSONB).
  cadence_kind     String    // 'immediate' | 'relative_to_purchase' | 'fixed_calendar' | 'on_completion' | 'on_milestone'
  // Discriminated-union payload, zod-validated per cadence_kind in the service layer:
  //   immediate:             {} (empty)
  //   relative_to_purchase:  { offset_days: int >= 0, time_of_day_local?: "HH:mm", timezone?: IANA }
  //   fixed_calendar:        { calendar_date: ISO-date, time_of_day_local: "HH:mm", timezone: IANA }
  //   on_completion:         { trigger_asset_id: uuid, trigger_asset_type: same enum }
  //   on_milestone:          { milestone_key: enum {weekly_checkin_complete | streak_n_days | ...} }
  cadence_payload  Json

  // Optional coach-authored override of the deliverable display name on the
  // purchase receipt + buyer side. Null = use the asset's own title.
  display_title    String?
  display_caption  String?

  // Audit
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  removed_at    DateTime?

  @@index([package_id, removed_at, display_order])
  @@index([asset_type, asset_id])
}

// Per-purchase, per-content drop schedule materialised at checkout time.
// One row per (purchase, content). Created in a single transaction inside
// PackageContentsFanoutService.onPurchasePaid (§4.5) so the schedule is
// frozen against the package contents AS THEY EXISTED at purchase time.
// The drip-engine (sibling spec) cron iterates over `status='pending'`
// rows whose `fire_at` is in the past.
model ScheduledPackageDrop {
  id                  String        @id @default(uuid())
  client_purchase_id  String
  client_purchase     ClientPurchase @relation(fields: [client_purchase_id], references: [id], onDelete: Cascade)
  content_id          String         // snapshot reference — NOT an FK to allow the content row to be removed without breaking history
  // Frozen snapshot at fan-out time so coach edits to the package after
  // purchase don't retroactively change a buyer's schedule. (mirrors the
  // ClientWorkoutAssignmentSnapshot rationale from builder spec §3.3)
  asset_type          String
  asset_id            String
  asset_revision_id   String?
  cadence_kind        String
  cadence_payload     Json
  display_title       String?
  display_caption     String?

  // Computed firing window (UTC). For immediate, equals created_at; for
  // on_completion/on_milestone, set on the triggering event (null until then).
  fire_at             DateTime?
  fired_at            DateTime?
  // 'pending' | 'fired' | 'skipped' (e.g. purchase already had this content) | 'failed'
  status              String        @default("pending")
  // The materialised side-effect: assignment id / message id / notification id.
  materialised_ref    String?
  failure_reason      String?

  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt

  @@index([status, fire_at])
  @@index([client_purchase_id, status])
  @@unique([client_purchase_id, content_id]) // idempotent fan-out
}

// (Optional, §4.6) — coach-uploaded media (PDF/video). NOT a Mux exercise
// asset; the existing Mux module is for exercise demos only.
model CoachMediaAsset {
  id            String   @id @default(uuid())
  coach_id      String
  coach         User     @relation("CoachMediaAssetCoach", fields: [coach_id], references: [id], onDelete: Cascade)
  kind          String   // 'pdf' | 'video'
  title         String
  description   String?
  // S3-style object key (reuse the avatar/MediaService pattern in src/profile/profile.service.ts)
  storage_key   String
  byte_size     BigInt
  content_type  String
  duration_sec  Int?     // video only
  page_count    Int?     // pdf only
  // Revision is the storage_key itself — replacing the file = bump revision.
  // The "AssignableAssetRef" pinning on a CoachPackageContent uses storage_key
  // for video/pdf instead of a separate revision table.
  created_at    DateTime @default(now())
  archived_at   DateTime?
  @@index([coach_id, archived_at, kind])
}
```

**Migration is purely additive** — `CoachPackage` is untouched, every existing package automatically has zero `CoachPackageContent` rows and behaves exactly as today (paywall-only), then individual packages can have content attached without affecting outstanding purchases.

### 4.3 Snapshot-at-purchase (immutability for the buyer)

Same rationale and pattern as the builder spec §3.3's `ClientWorkoutAssignmentSnapshot`: `ScheduledPackageDrop` rows freeze the cadence + asset_revision_id at fan-out time, so a coach who edits the package after a purchase **does not** retroactively change what the buyer's already-scheduled drops will deliver. New buyers get the new shape. This is the only correct behaviour and removes the need for any "lock the package once it has subscribers" rule.

### 4.4 Coach-facing endpoints (new) — minimal, on top of existing CRUD

```
GET    /v1/coach/packages/:id                    — full package incl. contents[] (fixes B8)
GET    /v1/coach/packages/:id/contents           — list contents (paginated only if N > 50)
PUT    /v1/coach/packages/:id/contents           — bulk-replace contents (idempotent under Idempotency-Key)
POST   /v1/coach/packages/:id/contents           — add a single content
PATCH  /v1/coach/packages/:id/contents/:contentId — edit cadence / display
DELETE /v1/coach/packages/:id/contents/:contentId — soft-delete (sets removed_at)
POST   /v1/coach/packages/:id/publish            — transitions status draft → active (validates ≥1 content; mints share-link)
POST   /v1/coach/packages/:id/unpublish          — active → draft (sets is_active=false; existing purchases unaffected)
GET    /v1/coach/packages/:id/subscribers        — already specced by Surface B; ship it (fixes B9)
```

DTO for content add/edit (zod- and class-validator-validated):

```ts
class CoachPackageContentDto {
  @IsIn(['workout_program', 'workout_plan', 'meal_plan', 'pdf', 'video', 'auto_message'])
  asset_type!: string;
  @IsUUID() asset_id!: string;
  @IsOptional() @IsUUID() asset_revision_id?: string;  // required for workout/meal; ignored for auto_message
  @IsInt() @Min(0) display_order!: number;

  @IsIn(['immediate', 'relative_to_purchase', 'fixed_calendar', 'on_completion', 'on_milestone'])
  cadence_kind!: string;
  @IsObject() cadence_payload!: Record<string, unknown>;  // zod-validated per kind in service

  @IsOptional() @IsString() @MaxLength(120) display_title?: string;
  @IsOptional() @IsString() @MaxLength(280) display_caption?: string;
}
```

The service layer resolves `asset_type → owning module` via a small `AssignableAssetResolver` registry (mirrors the existing `CapabilityMaterializerRegistry`, `src/ai/gateway/materialisers/capability-materialiser.registry.ts:24-75`) so the packages module never imports the workout-builder or meal-plan module directly. Each owning module registers a `validateAssetRef({asset_id, asset_revision_id}) → boolean` + `assignToClient({clientId, assetRef, scheduled_for}) → entity_id`.

### 4.5 Post-purchase fan-out (the missing thing — fixes B7)

A new `PackageContentsFanoutService.onPurchasePaid(purchase: ClientPurchase)` is called from `checkout-webhook-handler.service.ts:158` (right after the optional splits posting):

```
for each CoachPackageContent of purchase.package (where removed_at IS NULL):
  compute fire_at:
    - immediate              → fire_at = now()
    - relative_to_purchase   → fire_at = now() + offset_days @ time_of_day in tz
    - fixed_calendar         → fire_at = calendar_date @ time_of_day in tz
    - on_completion / on_milestone → fire_at = null (set later by trigger)
  upsert ScheduledPackageDrop(client_purchase_id, content_id, …)
    on conflict do nothing (the @@unique guards idempotent fan-out)

for each immediate row created:
  dispatch via AssignableAssetResolver.assignToClient → record materialised_ref → set status='fired', fired_at=now()
  (this REUSES the same materialisers the AI gateway already calls:
   src/ai/gateway/materialisers/assign-workout.materialiser.ts,
   assign-meal-plan.materialiser.ts, coach-message.materialiser.ts,
   send-notification.materialiser.ts — they ALREADY assign the right thing
   given an asset ref + client id; we hand them a non-AI "package_drop" provenance
   instead of an ai_draft_id.)
```

For workout assets specifically, the resolver calls the builder's existing `cloneProgramToClient` + snapshot-at-assignment paths (Master Workout Builder spec §3.2 + §3.3) — i.e. the SAME path used when a coach assigns a workout from the library. The package's role is to fire it on the right schedule, not to reimplement assignment.

For `auto_message` deliverables: the `coach-message.materialiser.ts` already knows how to insert a `CoachMessage` row (`schema.prisma:1076-1116`) with a `sender_id` and body. We just call it with `sender_id = purchase.coach_user_id`, `client_id = purchase.client_user_id`, body from the message template — and the existing thread + push notification path takes over.

### 4.6 The PDF / video question (the one real gap)

The brief lists "uploaded PDFs, uploaded videos" as deliverable types. Backend has **Mux** (`src/video/`) for exercise-demo videos and **profile** (avatar uploads) but **no coach-owned general media library**. This is the only deliverable type that needs a new owning module before the package side can reference it. The minimum is `CoachMediaAsset` (§4.2) + an upload endpoint that mints a signed S3 URL + an authed download endpoint that the mobile client reads from. Recommendation: keep this module deliberately tiny in v1 (no thumbnailing, no transcoding, no preview pages) — packages just attach an `asset_id` and the buyer-side renders a "Download / Watch" CTA.

---

## 5. Content-agnostic delivery model — what the coach configures, what it serializes to

### 5.1 What the coach sees per attached asset (the authoring shape)

For every item the coach adds via the asset picker, an inline cadence chip appears:

| Cadence | Coach picks | UI affordance | Serialised payload |
|---|---|---|---|
| **Immediate on checkout** | Default for "1:1 onboarding pack" style assets | Single tap "On purchase" | `{}` |
| **Relative to purchase** | Day N after they buy | "On day __ at __" inline two-field input | `{ offset_days, time_of_day_local, timezone }` |
| **Fixed calendar** | A specific date (e.g. cohort starts Mon Mar 4) | Date + time picker | `{ calendar_date, time_of_day_local, timezone }` |
| **On completion of another asset** | "When they finish Week 1" | Picker shows the other attached assets in the same package as the eligible trigger set; no cross-package triggers in v1 | `{ trigger_asset_id, trigger_asset_type }` |
| **On milestone** | "When their streak hits 7 days" | Dropdown over a fixed enum of milestones the platform emits | `{ milestone_key }` |

The coach **never types a cron expression, ISO duration, or trigger function name** — every cadence is a discriminated UI mode that serialises to the JSON payload shape in §4.2 verbatim. Validation lives in the service layer (zod schema per `cadence_kind`) so a malformed payload from a future SDK version fails closed.

### 5.2 One package, N heterogeneous deliverables — concrete example

A coach builds "12-Week Body Recomp — $499 one-time":
- **Welcome message** (auto_message, immediate) — populates the messaging thread with "Welcome! Here's how this works…"
- **Week-1 workout program** (workout_program, immediate) — fan-out clones the program to the client and creates ClientWorkoutAssignment rows for week 1's plans
- **Meal plan starter** (meal_plan, immediate) — DailyMealPlanAssignment with starts_on = today
- **Mid-program check-in nudge** (auto_message, relative_to_purchase day_offset=42) — surfaces a "How's it going?" thread
- **Week-12 graduation PDF** (pdf, relative_to_purchase day_offset=83) — drops a "Your wins" certificate into Files
- **Week-13 upsell ping** (auto_message, relative_to_purchase day_offset=90) — "Want to renew?"

That's six rows in `CoachPackageContent`. At checkout, six `ScheduledPackageDrop` rows are created. Two fire immediately, one fires on day 42, two on day 83 and day 90. The cron is identical for every package; only the rows differ.

### 5.3 Editing semantics (what happens when the coach changes a package post-publish)

- **Add a content row to a published package** → all existing `ClientPurchase` rows are *not* retroactively given the new drop. New buyers (post-edit) get it. (Reason: paying-buyer immutability is the contract.) The editor surfaces this clearly: "This will apply to future purchases only — N existing subscribers keep their original schedule."
- **Remove a content row** → soft-delete the `CoachPackageContent` (set `removed_at`); existing `ScheduledPackageDrop` rows already created remain valid and continue to fire. New buyers do not get drops for the removed content.
- **Edit cadence on an existing content row** → same: future buyers see the new cadence, existing buyers keep what was scheduled at their purchase time.
- **Change the asset revision pointer** → only meaningful for `workout_program`/`meal_plan` (immutable revision pin). Same forward-only semantics.

A coach who *needs* to retroactively give existing subscribers something new should send it via the messaging surface manually, or via a separate "Bonus drop" admin action — out of scope for v1.

---

## 6. The ideal coach navigation flow (target vs today)

### 6.1 Target page path (what we are building toward)

```
Coach tab bar → [Assignables Library] tab            (the unified library from Master Workout Builder §8.2)
  ├─ filter: My programs | My meal plans | My PDFs | My videos | My auto-messages | Shared building blocks
  └─ + New … →
      ├─ Workout program   → WorkoutProgramBuilder      (Master Workout Builder §8.2.1)
      ├─ Meal plan         → MealPlanBuilder            (future stream)
      ├─ Upload PDF/Video  → CoachMediaUpload           (§4.6)
      ├─ Auto-message      → CoachAutoMessageEditor     (new, tiny — title + body + optional voice url)
      └─ Package           → CoachPackageEditScreen v2  (this spec)
                                  │
                                  ├─ Section: BASICS   (name, description, currency)
                                  ├─ Section: DELIVERABLES
                                  │     [Empty state: "Attach what the buyer gets"]
                                  │     [Asset card] [+ Add asset →] ─┐
                                  │                                    ▼
                                  │                              CoachPackageAttachAsset (sheet)
                                  │                                Picks from the Assignables Library;
                                  │                                pins to the asset's HEAD revision; back
                                  │                                to editor with the new card inserted.
                                  │     For each [Asset card]: inline cadence chip → tap → cadence sheet
                                  ├─ Section: PRICING (price, billing_type, interval, duration_periods)
                                  ├─ Section: STOREFRONT (share link auto-minted on first save; preview)
                                  └─ Section: PUBLISH (CTA "Publish package" → POST :id/publish; validates ≥1 deliverable)

(Lateral nav from edit screen, edit mode only:)
  → CoachPackageSubscribers   (already exists, ship the backend route)
  → CoachPackagePreviewAsBuyer (new, mirrors the builder's "Preview-as-client")
```

The Assignables Library is the **one home** the coach reaches for "make / find / sell things." That tab is the Master Workout Builder spec's operator-decided "D" (`MASTER_WORKOUT_BUILDER_SPEC.md` §8.2). Packages slot in as one of the New-this types.

### 6.2 Today's flow vs target — side by side

| Step | Today | Target |
|---|---|---|
| Find packages | Settings → Business → Packages (buried) | Assignables Library tab (peer with workouts/meals/etc) |
| Create | Modal pop-up over Settings | Full screen with sectioned form |
| Attach deliverables | n/a — packages are price tags | Section "Deliverables" → picker → cadence chip per asset |
| Set cadence | n/a | Inline chip per asset → bottom sheet picker |
| Set price | Same modal | Section "Pricing" — with duration_periods exposed |
| Publish | Implicit (created = published) | Explicit "Publish" CTA gated on ≥1 deliverable + Connect ready |
| Share | "Coming soon" button | Auto-minted on first publish; share sheet from the screen |
| See subscribers | Surface B nav exists but 404s | Lateral nav, working |
| Edit later | Re-opens modal; only some fields editable | Re-opens sectioned editor; pricing locked once any active subscriber exists; deliverables editable with "future-buyers-only" copy |

### 6.3 Sub-coach considerations (consistent with builder §7)

- A sub-coach can **author their own** packages (`coach_id = self`, normal flow).
- A sub-coach selling a workout/meal asset they don't own attaches a **forked copy** of that asset (per builder §7.3 `forkTemplate` for workouts; mirror for meals). The attachment record's `asset_id` points at the sub-coach's owned fork.
- A sub-coach **never sells the head-coach's master directly** — same "grab a copy" rule from operator decision A.
- `tenant_shared` does not extend to packages: a package row is always individually owned and tenant-isolated by `coach_id`. The Assignables Library "Shared building blocks" filter applies to *building-block assets* (workouts/meals/PDFs), not to packages.

---

## 7. Boundary notes for the buyer-side / web-checkout Opus agent

The COACH side and the BUYER side meet at these seams:

1. **`GET /v1/clients/me/coach/packages`** (`packages.controller.ts:161-172`) and **`GET /v1/clients/me/coach/packages/:id`** (`L177-190`) — buyer reads the active catalog of their coach. **Add a `contents` projection** so the buyer's package detail page shows what's included (titles + captions + cadence summaries — "Day 1: Welcome message · Day 1: Week-1 workout · Day 42: Check-in"). Do not expose the raw `asset_revision_id`.
2. **`GET /v1/packages/public/:shareToken`** (the planned guest-checkout get-by-token route, `packagesApi.ts:437-445` TODO; backend has `storefront-public.controller.ts:61+`) — guest version of the same content projection. Must be safe for unauthenticated render.
3. **`POST /v1/checkout/sessions`** (`checkout.controller.ts:101-118`) — buyer mints checkout for an authed purchase. Body shape (`{package_id, success_url, cancel_url}`) is fine as-is; **no content attachment changes its shape**.
4. **`POST /v1/packages/public/.../checkout`** (`storefront-public.controller.ts`) — the guest checkout path. Same: no shape change.
5. **Webhook fan-out (§4.5)** — this is the join point. The buyer side has zero responsibility for fan-out; it happens server-side after `checkout.session.completed`. The buyer's app SHOULD poll `GET /v1/checkout/sessions/:sessionId/confirm` (already exists, `checkout.controller.ts:235-247`) to know when entitlement is live, and once it returns paid, the in-app surfaces (workouts list, messages, etc.) populate naturally because the materialisers used the same tables those screens already read from.
6. **`MembershipScreen.tsx`** (mobile, `src/screens/client/MembershipScreen.tsx`) is the buyer's "what did I get" hub — it MUST be extended to list scheduled and fired drops for each `ClientPurchase`. The Opus agent owns that screen; this spec just notes that `ScheduledPackageDrop` (§4.2) is its data source.
7. **`PackageCheckoutScreen.tsx`** (mobile, buyer side) needs to render the contents projection before the user pays — "Here's what you get" is the conversion lift Surface B's `features[]` was trying to be (B4), now backed by real attached assets.

---

## 8. Prioritised "build first" list (COACH side)

> Sequence is chosen to (a) unblock the next-buyer activation gap fastest, (b) avoid the two-surface coherence trap from this turn forward, (c) sequence work so each step is shippable on its own.

| # | Task | Why first | Owner module(s) |
|---|---|---|---|
| **1** | **Kill Surface A.** Delete `CoachPackagesScreen.tsx`; remove the `CoachPackages` route from `CoachNavigator.tsx:407-409`; rewire `BillingSection.onOpenPackages` to navigate `CoachPackagesList`; delete `coachPaymentsApi.ts` package methods (keep earnings/payouts/reconciliation/refunds, move to a separate `coachEarningsApi.ts`). One coach-package surface, one API client. | Removes B1, B2, B12, B13, B16 in one PR; nothing depends on Surface A surviving. | mobile only |
| **2** | **Ship the missing backend reads.** `GET /v1/coach/packages/:id` and `GET /v1/coach/packages/:id/subscribers` (Surface B already calls both). | Fixes B8, B9; eliminates the deep-link "Could not load" and the permanent "Not available" subscriber state. Tiny PR. | backend `packages` module |
| **3** | **Add `duration_periods` to the editor + accept it on Create/Update DTOs.** | Fixes B6; lets one-time programs have an actual entitlement expiry, which makes the next stream's "12-week program ends" UX truthful. | backend DTO + mobile edit screen |
| **4** | **Add explicit draft/active state + Publish CTA.** New `POST /v1/coach/packages/:id/publish` and `/unpublish`; create defaults to `status='draft'` (not visible at `listPublicForCoach`); editor renders Publish button gated on validation (name, ≥0 currently — ≥1 deliverable once §5 ships). | Fixes B10. Required before §5: a buyer must not see a half-attached package. | backend + mobile |
| **5** | **Wire the share-link mint into the editor.** Call `POST :id/share-link` on first save (or first publish), display the URL, real Share button. | Fixes B11; turns the coach's storefront into a real acquisition surface. Tiny PR. | mobile + a couple of backend touches |
| **6** | **Schema migration: `CoachPackageContent` + `ScheduledPackageDrop` + `CoachMediaAsset`** (additive). | The whole §4 hinges on these. No behaviour change yet. | backend |
| **7** | **`AssignableAssetResolver` registry + workout resolver + meal-plan resolver + auto-message resolver.** Wire each owning module to register its resolver. PDF/video resolver = trivial (just validates the row exists for that coach). | The seam from builder §3.2.1 made real; required by both fan-out and the editor's asset picker. | backend (cross-module) |
| **8** | **Coach-facing contents endpoints** (§4.4) + zod-per-cadence validation. | The CRUD that the new editor section will call. Ship without UI first; behind a feature flag if needed. | backend `packages` module |
| **9** | **Mobile: Deliverables section in `CoachPackageEditScreen.tsx`.** Asset card list + inline cadence chip + bottom-sheet asset picker pulling from the Assignables Library (workouts first, then meals/PDFs/videos/auto-messages as they ship). | The visible coach-facing win. Builds on #6/#7/#8. | mobile |
| **10** | **`PackageContentsFanoutService.onPurchasePaid` + wedge into the webhook handler** (§4.5). | Fixes B7 — the activation gap. Once shipped, every paid purchase auto-materialises whatever the coach attached. This is the single highest-leverage line in the entire commerce surface. | backend |
| **11** | **Trigger handler for `on_completion` and `on_milestone` cadences.** Listens for `WorkoutSession.completed`, `DailyMealPlanAssignment` end, milestone emissions; finds matching `ScheduledPackageDrop` rows with `fire_at IS NULL`, sets `fire_at = now()` so the cron picks them up on next tick. | Completes the cadence taxonomy. | backend (drip sibling spec owns the cron itself; this is the triggering glue) |
| **12** | **Coach upload UX for `CoachMediaAsset` (PDF + video).** Mirror the profile-avatar S3 pattern; minimum-viable upload + delete + list. | Needed for the "attach a PDF" / "attach a video" cadence types to be honestly available in the picker. Can be feature-flagged off until ready; the picker shows those types greyed-out otherwise. | backend + mobile |
| **13** | **Preview-as-buyer screen** for the editor (mirrors builder's preview-as-client). | Quality of life; eliminates "save → switch accounts → check" loop. | mobile only |
| **14** | **Sub-coach fork-on-attach guard** in the asset picker (consistent with builder §7.3). | Activation parity for sub-coaches selling under a head coach. | mobile (UI) + backend (write check) |
| **15** | **Lock pricing fields on edit once any `ClientPurchase` references a package.** | Eliminates the silent-no-op in B5; surfaces an actionable "Archive + recreate to change pricing" affordance. | backend DTO refinement + mobile gating |

---

## 9. Appendix — short summary of key file:line citations

- Backend CRUD: `src/packages/packages.controller.ts:43-103, 111-191`, `src/packages/packages.service.ts:46-245`, `src/packages/packages.dto.ts:1-65`.
- Share-link: `src/share-link/share-link.controller.ts:31-73`.
- Checkout: `src/checkout/checkout.controller.ts:101-247`, `src/checkout/checkout-webhook-handler.service.ts:104-160` (the activation gap is at L135-146).
- Prisma: `prisma/schema.prisma:2937-2989` (CoachPackage), `3178-3239` (ClientPurchase), `3007-3060` (GuestCheckout — guest-checkout state).
- AI materialisers already wired to assign each deliverable type: `src/ai/gateway/materialisers/{assign-workout, assign-meal-plan, coach-message, send-notification}.materialiser.ts` + registry at `capability-materialiser.registry.ts:12-75`.
- Mobile Surface A (active): `src/screens/coach/CoachPackagesScreen.tsx:72-563`, `src/api/coachPaymentsApi.ts:183-236`.
- Mobile Surface B (orphaned): `src/screens/coach/payments/CoachPackagesListScreen.tsx:56-202`, `CoachPackageEditScreen.tsx:69-485`, `CoachPackageSubscribersScreen.tsx:50-211`, `src/api/packagesApi.ts:357-432`.
- Navigation: `src/navigation/CoachNavigator.tsx:26-28, 80, 195-200, 407-417`. Settings handoff: `src/screens/coach/SettingsScreen.tsx:235-238` (dead), `:520-523` (live), `src/screens/coach/settings/BillingSection.tsx:53-63`.

— end of COMMERCE_HUNT_COACH.md
