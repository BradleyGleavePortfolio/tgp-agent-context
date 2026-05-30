# PR-17 EXPANSION PLAN — "edit-after-purchase → push to existing buyers" + coach content-authoring UI

**Author:** Planner subagent · **Date:** 2026-05-30
**Repos:** `growth-project-backend` (NestJS+Prisma, main @ 3f7ab76) · `growth-project-mobile` (RN/Expo, main @ 0b83c75)
**Scope discipline:** This plan designs AROUND the 12 LOCKED decisions and the UI Bible. It does NOT relitigate them. All citations verified against the actual repos.

---

## 0. TL;DR for the operator

- **#5 schema solution (recommended):** add ONE nullable additive column `push_seq Int? @default(0)` to `ScheduledDrop` and fold it into the unique key → `@@unique([client_purchase_id, content_id, push_seq])`. Original fan-out keeps writing `push_seq=0` (default), so it is byte-compatible. A re-send of an already-fired drop inserts a NEW row with `push_seq = max+1`. **Critically, the re-send drop must NOT be dispatched with the `(clientPurchaseId, contentId)` resolver-idempotency pair** (which would short-circuit to the cached delivery in `auto-message.resolver.ts` / `workout.resolver.ts`); instead the dispatcher passes `scheduledDropId` only for `push_seq > 0` drops, so the resolver falls back to the per-drop key and produces a genuinely fresh delivery. Full trace in §1.3 + §2.4.
- **PR units:** 6 units. **2 backend (B1→B2 sequential)**, **4 mobile (M1→M2→{M3 ∥ M4} → M5)**. Backend B1 must merge before mobile M2 wiring is testable end-to-end, but mobile M1 (API-client wiring) can be authored in parallel with backend once the endpoint contracts in §2 are frozen. Parallelism map in §5.
- **Broken/missing foundation that MUST be fixed first:** (a) mobile has NO content-authoring screen and NO contents API methods (the whole authoring UI is greenfield); (b) the `@@unique([client_purchase_id, content_id])` conflict blocks #5 re-send (the additive migration fixes it); (c) a **status-vocabulary split** — inline fan-out stamps `status='fired'`, the cron stamps `status='delivered'` — the push backfill and audience query must treat BOTH as "already shipped" (detail §1.4).

---

## 1. FOUNDATION AUDIT

### 1.1 What exists and is SOUND to build on

**Backend — the fan-out engine is the reusable core.**
- `src/packages/purchase-fanout.service.ts:197` `onPurchaseEntitled(purchase, ctx, tx)` — the seed-at-purchase engine. Its inner shape is exactly what the push method must mirror: load non-removed contents (`:236`), `computeFireAt` per cadence (`:257`), bulk `createMany({ skipDuplicates: true })` keyed on the unique pair (`:281`), then materialise due-now inline (`:306-354`).
- `src/packages/purchase-fanout.service.ts:686` `computeFireAt(kind, payload, purchaseTime, now)` — **REUSE VERBATIM.** immediate→now (`:693`); relative_to_purchase→purchaseTime+offset_days (`:695-698`); fixed_calendar future→release_at, past→now (`:699-707`); on_completion/on_milestone→null (`:708-710`). The push backfill must anchor `relative_to_purchase` to EACH buyer's own `purchaseTime` (their `ClientPurchase.created_at`), not the push time — this is the whole reason to reuse this function.
- `src/packages/purchase-fanout.service.ts:547` `cancelPendingForPurchase(clientPurchaseId, reason, tx?)` — the **template** for PR-17's push method: set-based `updateMany` (`:564`), idempotent on a status filter, optional-tx, returns a count, logs. PR-17 mirrors this style (set-based, chunked, tx-accepting, idempotent).
- `src/packages/drip-dispatcher.cron.ts:183` `findDue(now)` — backfilled pending drops with a FUTURE `fire_at` are naturally excluded until due (`fire_at: { lte: now, not: null }`, `:188`) and picked up FIFO (`orderBy fire_at asc`, `:219`). **The cron requires NO change for forward-dated pushes** — verified: a pending drop with `fire_at` in the future simply waits. The cron also already fires `DRIP_RELEASED` buyer push+in-app on delivery (`:393,407,418`) — decision #9 reuse is FREE on the dispatched path.
- `src/packages/package-contents.controller.ts:44` `@Controller('v1/coach/packages/:id/contents')` with `JwtAuthGuard, CoachOrOwnerGuard, SubscriptionGuard` (`:43`), roles `coach/owner`, IDOR via `PackagesService.requireOwnedPackage` inside the service. Endpoints GET/POST/PUT reorder/PATCH/DELETE all present (`:51-109`). **This is where the push trigger hooks in** (decision #3) — on `attach` (`:60`) and `patch` (`:86`).
- `src/packages/package-contents.service.ts:75` attach / `:124` patch / `:291` reorder / `:253` softDelete — full authoring service with zod per-cadence validation, advisory-lock display_order integrity, auto_message body contract.
- IDOR / tenant scope helpers: `packages.service.ts:332` `resolveEffectiveCoachId` (sub-coach → head-coach promotion) and `:338` `requireOwnedPackage`. **Every new endpoint reuses these.**
- Audience source: `packages.service.ts:303` `listSubscribers` queries `clientPurchase.where({ package_id })` only (no entitlement filter) — so audience scoping (#1) is a NEW filtered query, not a reuse, but the IDOR pattern is identical.
- Resolver registry: `assignable-asset-resolver.registry.ts:79` `materialise(assetType, input)`; the input interface `assignable-asset-resolver.interface.ts:74-89` has OPTIONAL `clientPurchaseId`, `contentId`, `scheduledDropId`, `tx` — this optionality is the lever the #5 re-send relies on (§2.4).
- Module wiring: `packages.module.ts:41-60` registers `CoachPackageContentsController`, `PackageContentsService`, `PurchaseFanoutService`, `DripDispatcherCron` and exports the services. A new push service/controller hangs here.
- Post-commit alert flush call sites already exist: `checkout-webhook-handler.service.ts:135` `flushAlerts` / `:144` `discardPendingAlerts`; `guest-checkout.service.ts:1783/1769`. The push path does NOT touch these (it has no Stripe tx), but it reuses the same `NotificationKind.DRIP_RELEASED` (`notification-kind.ts:71`).

**Mobile — the consumer side is sound; the authoring side is missing.**
- API base: `src/services/api.ts:93` axios instance, auth-header interceptor (`:102-108`), 401 refresh mutex. `default export api`. Mutations are plain `api.post/patch/delete`.
- `src/api/packagesApi.ts:357-432` `coachPackagesApi` has list/get/create/update/archive/subscribers/earnings. `idemHeaders(key?)` (`:203`) → `{ headers: { 'Idempotency-Key': key ?? generateIdempotencyKey() } }`; `generateIdempotencyKey()` in `src/utils/idempotency.ts:36`. **Reuse both for decision #8.**
- Navigation: `src/navigation/CoachNavigator.tsx:218` `SettingsStack` (`createNativeStackNavigator<SettingsStackParamList>`); ParamList type `:176-207`; coach payments screens registered `:407-413`; `headerShown:false` global (`:366`); `presentation:'modal'` precedent `:450`.
- Coach screens: `CoachPackagesListScreen.tsx` → navigates `CoachPackageEdit {packageId, initialPackage}` (`:105-110`); `CoachPackageEditScreen.tsx:469` → `CoachPackageSubscribers {packageId, title}`; `CoachPackageSubscribersScreen.tsx` renders subscriber status pills.
- Tokens: brand colors `src/constants/colors.ts` cream `#F5EFE4` (`:17`), forest `#2C4A36` (`:9`); design tokens `src/theme/tokens.ts` (bone/cream/forest `:32,33,39`); runtime via `useTheme()` from `src/theme/ThemeProvider.tsx` → `{ colors }`.
- Reuse primitives: modal = RN core `<Modal animationType="slide" presentationStyle="pageSheet">` precedent `src/components/PackageSelectionSheet.tsx:343-354`; tactile primitive `src/components/HapticPressable.tsx`; haptics wrapper `src/utils/haptics.ts` (`lightTap/mediumTap/successTap/warningTap`); motion `tokens.ts:271-286` + `FadeInView.tsx`.
- Buyer drip consumer (must keep rendering pushed drops): `src/screens/client/DeliverablesScreen.tsx` + `deliverables/dropRow.tsx` read `asset_type, display_title, display_caption, fired_at, fire_at, status, materialised_ref`; status union `pending|due|fired|skipped|failed|canceled` (`clientPaymentsApi.ts:186-192`); `buyerStatusOf` maps `fired`→delivered, `pending|due`→upcoming. **Pushed drops are ordinary ScheduledDrop rows, so they render here with no buyer-side change** (a re-send `push_seq>0` row is just another row that becomes `fired`/`delivered`).

### 1.2 What is BROKEN / MISSING — and the fix

| # | Gap | Fix / build-on |
|---|-----|----------------|
| G1 | **Mobile: no coach content-authoring screen at all.** `CoachPackageEditScreen` edits package-level fields only (price/interval/share/archive). | Build greenfield `CoachPackageContentsScreen` (M2) hanging off `CoachPackageEdit`. |
| G2 | **Mobile: contents endpoints NOT wired into the API client.** `coachPackagesApi` has no list/attach/patch/reorder/delete-content methods. | Add a `coachPackageContentsApi` (or extend `coachPackagesApi`) in M1 mirroring the backend controller paths. |
| G3 | **#5 re-send vs `@@unique([client_purchase_id, content_id])`.** A re-send needs a fresh row but the pair is taken. | Additive `push_seq` column folded into the unique key (§2.5) + resolver-key bypass for `push_seq>0` (§2.4). |
| G4 | **Status-vocabulary split:** inline fan-out → `status='fired'` (`purchase-fanout.service.ts:338`); cron → `status='delivered'` (`drip-dispatcher.cron.ts:340`). | The push backfill's "already-shipped" guard and the audience preview count must treat BOTH `fired` AND `delivered` as terminal/shipped. Documented in §2.3/§2.6. NO schema change — just consistent filtering. |
| G5 | **No mobile date picker, no Switch usage, no Lottie.** Date picker / toggle / celebration are greenfield. | Add `@react-native-community/datetimepicker` (or modal-datetime-picker) for the past-date-blocked picker (#6); use RN core `Switch` for notify toggle (#9); success closure via existing `FadeInView` + motion tokens + `successTap` haptic (no new Lottie dependency needed; decision Anti-Pattern 4 satisfied by an animated check + warm copy). |
| G6 | **Empty-package edge in backfill.** Fan-out early-returns on empty contents (`:246`) staging a COACH_NEW_PURCHASE; the push path has DIFFERENT semantics (it's per-content, coach-initiated, no purchase event). | The push service does NOT reuse the COACH_NEW_PURCHASE staging at all — it operates on a single content row (or the whole package on demand), and notify is the buyer-side `DRIP_RELEASED` only. |

### 1.3 The #5 hard problem — full resolution

**Constraint today:** `ScheduledDrop @@unique([client_purchase_id, content_id])` (`schema.prisma:4735`). A buyer who purchased before a content row existed has NO drop for it → push = create the missing drop (the pair is FREE, ordinary insert). But for an already-FIRED drop (decision #5 "re-send updated version"), the pair is TAKEN, so a second insert violates the unique constraint.

**Why a naive "reuse the row" is wrong:** decision #5 says fired drops are IMMUTABLE; mutating the fired row's `fire_at`/`materialised_ref` is forbidden and would corrupt the buyer's delivery history.

**Why reusing the same pair on a NEW row is wrong even if the constraint allowed it:** the resolver idempotency keys ride the stable pair. `auto-message.resolver.ts:106-118` claims `DripResolverMarker(purpose='auto_message', purchase_id, content_id)` and, on a second call with the same pair, returns the CACHED `materialisedRef` (`:118`) — NO new message is sent. `workout.resolver.ts:128-129` builds key `drip:workout:p={purchaseId}:c={contentId}` against the `WorkoutBuilderIdempotencyKey` ledger — a second call collapses to the cached assignment. So a re-send that reused the pair would be SILENTLY SWALLOWED — the buyer gets nothing new. That is the exact opposite of "fresh delivery."

**The fix (additive, minimal):**
1. Add `push_seq Int @default(0)` and change the unique key to `@@unique([client_purchase_id, content_id, push_seq])`. Original fan-out inserts with the default `0` → unchanged behavior, no backfill of existing rows needed (default applies). New content push to a buyer who never had the drop → also `push_seq=0` (free). Re-send of an already-fired drop → `push_seq = (max push_seq for that pair) + 1`.
2. **Resolver-key bypass for re-sends:** the dispatcher (cron) and any inline materialise for a `push_seq > 0` drop must pass `scheduledDropId` (and OMIT `clientPurchaseId`/`contentId`, or pass them in a way that does not collide). Both resolvers already have a fallback: `auto-message.resolver.ts:64-65` "when (purchaseId, contentId) are NOT supplied … skip the marker"; `workout.resolver.ts:131` falls back to `drip:workout:{clientId}:{assetId}:{scheduledDropId|no-drop}`. So a `push_seq>0` drop dispatched with only `scheduledDropId` gets a genuinely fresh delivery. **This is the single most important correctness rule in the whole feature.**

**Cron impact:** `drip-dispatcher.cron.ts:317-332` currently ALWAYS passes `clientPurchaseId: purchase.id, contentId: drop.content_id`. **This must become conditional on `drop.push_seq`:** for `push_seq === 0` keep passing the pair (preserves existing rollback-retry idempotency for original drops); for `push_seq > 0` pass `scheduledDropId` only. This is the ONE change to the cron file (B1). The `findDue`/`claim`/backoff logic is otherwise untouched — a backfilled or re-send pending drop flows through identically.

**Inline-materialise impact:** the push service may materialise a due-NOW pushed drop inline (coach chose today). For `push_seq>0` it must apply the same key-bypass. For `push_seq=0` new-content backfill it may keep the pair (it's the first delivery for that pair, so the marker/ledger is empty — safe). Simplest rule for the push service: **always materialise pushed drops through the SAME conditional key logic** (pair iff `push_seq===0`).

### 1.4 Idempotency layering recap (decision #8 honored)
Two independent guards survive: (a) the mutation-level UUID `Idempotency-Key` header from mobile (`idemHeaders`/`generateIdempotencyKey`) protects against double-submit of the push request itself; (b) the DB `createMany({ skipDuplicates:true })` on the (now 3-col) unique key protects against re-running the same push (same `push_seq`) — a replay is a true no-op. The push service computes the target `push_seq` deterministically per (purchase, content) so a replayed request lands on the same `push_seq` and dedups.

---

## 2. BACKEND WORK BREAKDOWN

### 2.1 New endpoint(s)
Add to a new controller method group (cleanest: extend `CoachPackageContentsController`, reuse its guards/IDOR). All paths inherit `@Controller('v1/coach/packages/:id/contents')` and `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard, SubscriptionGuard)` + `@Roles('coach','owner')`.

- **`POST v1/coach/packages/:id/contents/:contentId/push`** — push/backfill ONE content row to existing buyers.
  - Body (zod, new schema in `package-contents.dto.ts`):
    ```
    {
      audience: 'all' | 'active' | 'cohort',     // #1; default 'active' (safe default)
      cohort_purchase_ids?: string[],             // required iff audience==='cohort'
      fire_at: string (ISO 8601),                 // #2/#6, must be today-or-later (server re-validates)
      mode: 'push_existing' | 'resend',           // #5: 'resend' targets already-fired pairs → push_seq+1
      notify: boolean,                            // #9, default true
    }
    ```
  - Header: `Idempotency-Key` (UUID) — read + dedup (decision #8).
  - Guards re-validate IDOR via `resolveEffectiveCoachId` + `requireOwnedPackage` (mirror `package-contents.controller.ts:53,65`).
  - Returns `{ scheduled: N, skipped: M, fire_at, audience, notify }` for the success preview.
- **`GET v1/coach/packages/:id/contents/:contentId/push/preview?audience=…&mode=…`** — returns the buyer COUNT for the confirm-preview modal (#10) WITHOUT scheduling. Pure read, same guards. Returns `{ count: N, audience, already_delivered: K }`. (Lets the mobile confirm modal show "delivers to N buyers" before the coach commits — error-prevention, not reporting.)

> Note on coverage (#4): new content + cadence edits + full edits all can trigger a push. The push endpoint is content-scoped and cadence-agnostic — it reads the CURRENT `CoachPackageContent` row and snapshots it, so a cadence edit followed by a push naturally carries the new cadence. No separate endpoints per edit-type.

### 2.2 New push/backfill service method
New `PackagePushService` (new file `src/packages/package-push.service.ts`), registered in `packages.module.ts` providers/exports. Method:

```
pushContentToExistingBuyers(
  coachUserId, packageId, contentId,
  opts: { audience, cohortPurchaseIds?, fireAt: Date, mode, notify },
  idempotencyKey,
): Promise<{ scheduled: number; skipped: number }>
```

Algorithm (mirrors `purchase-fanout.service.ts` shape + `cancelPendingForPurchase` set-based/tx style):
1. IDOR: `requireOwnedPackage(coachUserId, packageId)`; load the content row (`removed_at: null`) or 404.
2. **Server-side past-date guard (#6):** reject `fireAt < startOfToday` with a 400 (defense-in-depth behind the disabled mobile picker).
3. Resolve audience → list of `ClientPurchase` rows (§2.6).
4. For each buyer compute `fire_at` via **`computeFireAt`** anchored to THAT buyer's `purchase.created_at` IF the cadence is relative; but per decision #2 the coach picks an explicit date, so the PUSH path uses the coach-chosen `fireAt` as the drop's `fire_at` directly (the cadence is snapshotted onto the drop for the buyer's history/consumer, but scheduling uses the coach's date). **Reuse `computeFireAt` only for the `immediate`/past handling normalization** (i.e. if coach picks today/now, treat as due-now). Document this clearly: decision #2 (coach-chosen date) OVERRIDES cadence-derived timing for pushes; cadence fields are still snapshotted for buyer-side display + consumer routing.
5. Determine `push_seq` per (purchase, content): `mode==='push_existing'` → `push_seq=0` for buyers with NO existing drop for the pair (skip buyers who already have a `push_seq=0` row — that's a `skipped`); `mode==='resend'` → `push_seq = currentMax+1` for buyers whose existing drop is `fired`/`delivered` (treat both per G4).
6. **ONE atomic `$transaction`, CHUNKED** (decision #7): build the seed rows (same shape as `purchase-fanout.service.ts:256-276` PLUS `push_seq`, `fire_at` = coach date), then `createMany({ data: chunk, skipDuplicates: true })` per chunk of e.g. 500 inside the SAME tx. **NO Stripe calls anywhere** (decision #7 — this path never touches billing).
7. Materialise due-NOW drops inline only if `fireAt <= now` (coach chose today). Use the **conditional resolver-key rule from §1.3/§2.4** (pair iff `push_seq===0`). For forward-dated pushes, do NOTHING inline — the cron picks them up.
8. Buyer notify (#9): the cron already fires `DRIP_RELEASED` on its delivery path (`drip-dispatcher.cron.ts:393-431`) — so forward-dated pushes notify automatically when they fire. For inline due-now materialise, stage a `DRIP_RELEASED` alert the same fire-and-forget way fan-out does (`purchase-fanout.service.ts:345-353` + `flushAlerts`). If `notify===false`, set a flag on the drop OR skip staging — **simplest: when `notify===false`, stamp `alert_dispatched_at = now` at seed time so both the inline path and the cron's `dispatchBuyerAlert` skip the push** (the cron stamps/【checks】`alert_dispatched_at`; verify it gates on it — currently it stamps but does not gate, so add a `notify` suppression: set `alert_dispatched_at` AND have the cron skip when already set). **B1 must add a guard in `dispatchBuyerAlert` to skip when `alert_dispatched_at` is already set** (today it always sends then stamps, `:368-445`). This is the second small cron change.
9. Return `{ scheduled, skipped }`. Idempotent: a replayed identical request re-computes the same `push_seq` and `createMany skipDuplicates` makes it a no-op.

### 2.3 "Already shipped" guard (G4)
When computing `skipped` and when choosing `mode==='resend'` targets, treat a drop as shipped iff `status IN ('fired','delivered')`. `push_existing` skips buyers who already have ANY drop for the pair; `resend` only applies to buyers whose latest drop for the pair is shipped (you don't re-send to someone whose original is still pending).

### 2.4 Resolver-key conditional (the #5 correctness core)
- **Cron change (`drip-dispatcher.cron.ts:317-332`):** pass `clientPurchaseId`+`contentId` ONLY when `drop.push_seq === 0`; otherwise pass `scheduledDropId: drop.id` and OMIT the pair so resolvers use their per-drop fallback (`auto-message.resolver.ts:64-65`, `workout.resolver.ts:131`). meal_plan/pdf/video ride composite/outer-tx keys that are already drop-safe; verify they don't independently collapse on the pair (meal_plan uses `DailyMealPlanAssignment.drip_drop_id @unique` per `purchase-fanout.service.ts:55` — drop-id based, already fresh-per-row; media uses `ClientAssetGrant @@unique[client_id, media_asset_id]` — this WOULD collapse a re-send of the same media to the same client → acceptable: re-granting identical media is idempotent and the buyer already has access; the re-send's VALUE for media is the new `fire_at`/notification, not a new grant. Document this as expected.).
- **Inline push materialise:** same conditional.

### 2.5 Additive migration (#5)
New migration dir `prisma/migrations/20261209000000_pr17_scheduled_drop_push_seq/migration.sql` (next sequential after `20261208000000_pr15…`):
```sql
ALTER TABLE "ScheduledDrop" ADD COLUMN "push_seq" INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS "ScheduledDrop_client_purchase_id_content_id_key";
CREATE UNIQUE INDEX "ScheduledDrop_client_purchase_id_content_id_push_seq_key"
  ON "ScheduledDrop"("client_purchase_id","content_id","push_seq");
```
Plus the `schema.prisma:4735` edit: add `push_seq Int @default(0)` and change `@@unique([client_purchase_id, content_id, push_seq])`. **Fully additive** — existing rows get `push_seq=0`, the old (pair) uniqueness is preserved as a subset (pair+0). `createMany skipDuplicates` in fan-out (`:281`) still dedups originals because they all use seq 0.

### 2.6 Audience scoping query (#1)
New read in `PackagePushService` (or a helper on `PackagesService`), IDOR-guarded:
```
where = { package_id: packageId,
          ...(audience==='active' ? { entitlement_active: true } : {}),
          ...(audience==='cohort' ? { id: { in: cohortPurchaseIds } } : {}) }
```
- `all` → every `ClientPurchase` for the package.
- `active` (**safe default**, decision Hick's Law) → `entitlement_active: true` (`ClientPurchase.entitlement_active`, `schema.prisma:3272`; index `entitlement_active, access_expires_at` `:3319`). Optionally also filter `status IN ('paid','active','trialing')`.
- `cohort` → explicit `cohort_purchase_ids` (validated to belong to this package — re-filter by `package_id` to prevent cross-package IDOR).

### 2.7 Trigger wiring (#3)
The PROMPT itself is a mobile-UI concern (the modal). The backend does NOT auto-push on attach/patch — it exposes the push endpoint and the mobile authoring flow calls it after a save when the coach chooses "push to existing." So `package-contents.service.ts` `attach`/`patch` are UNCHANGED; the trigger is the mobile sequence (edit → save → prompt → push call). This keeps the money-path-free push fully decoupled and testable.

### 2.8 Backend tests (convention: `test/*.spec.ts`, hand-rolled prisma stubs)
New `test/package-push.service.spec.ts` mirroring `test/package-contents.service.spec.ts` stub style: audience scoping (all/active/cohort), chunking, push_seq computation, resend-vs-unique, past-date 400, idempotent replay no-op, notify-suppression stamps `alert_dispatched_at`, NO Stripe. Extend `test/drip-dispatcher.cron.spec.ts` for the `push_seq>0` key-bypass and the `alert_dispatched_at` skip. Add controller-level test if an e2e harness exists (mirror existing controller specs).

---

## 3. MOBILE WORK BREAKDOWN (each item → UI Bible principle + reuse citation)

### 3.1 API client (M1) — wire the contents + push endpoints
New `coachPackageContentsApi` block in `src/api/packagesApi.ts` (or a sibling `contentsApi.ts`):
- `list(packageId)` → `GET …/contents`
- `attach(packageId, body, key?)` → `POST …/contents` + `idemHeaders(key)` (`packagesApi.ts:203`)
- `patch(packageId, contentId, body, key?)` → `PATCH …/contents/:contentId` + `idemHeaders`
- `reorder(packageId, contentIds)` → `PUT …/contents/reorder`
- `remove(packageId, contentId, key?)` → `DELETE …/contents/:contentId`
- `pushPreview(packageId, contentId, {audience, mode})` → `GET …/contents/:contentId/push/preview`
- `push(packageId, contentId, body, key)` → `POST …/contents/:contentId/push` + `idemHeaders(key)` (decision #8)
- New exported TS types: `PackageContent`, `CadenceKind`, `PushAudience`, `PushRequest`, `PushPreview`, `PushResult` — mirror the backend DTO shapes (§2.1, `package-contents.dto.ts`).
- Reuse axios `default api` + auth interceptor (`services/api.ts:93-108`); reuse `generateIdempotencyKey()` (`utils/idempotency.ts:36`).

### 3.2 Content-authoring UI (M2) — `CoachPackageContentsScreen`
*One-sentence screen test:* "This is where the coach authors package content."
- Lists contents via `coachPackageContentsApi.list`; each row shows title/asset_type/cadence + a per-row overflow with **"Push to existing"** (decision #12 per-card entry point).
- "Add content" → an attach form (asset picker + cadence picker + title/caption). **Progressive disclosure** — cadence advanced options behind a disclosure; safe default `immediate`.
- Reuses `useTheme()` colors (forest `#2C4A36`, cream `#F5EFE4`), `HapticPressable`, the `TouchableOpacity` primary-button style pattern from `CoachPackageEditScreen.tsx:397-411` (no shared Button exists). **Consistency** principle.
- Hangs off `CoachPackageEdit` via a new nav button (mirrors `CoachPackageEditScreen.tsx:469` subscribers-button pattern).

### 3.3 Push entry point (M3 inline) — per-card "Push to existing"
*One-sentence screen test:* "This is where the coach pushes an update to existing buyers."
- The per-row action opens the **push-vs-future-only prompt** (decision #3, **One-concept-per-moment** — its own modal, NOT inside the edit form). RN core `<Modal presentationStyle="pageSheet">` (precedent `PackageSelectionSheet.tsx:343-354`). Two choices: "Push to existing buyers" (primary) / "Future buyers only" (secondary, de-emphasized — **Hick's Law** one primary path).

### 3.4 CALM confirm-preview modal (M4) — `PushConfirmModal`
- On "push to existing," fetch `pushPreview` and render the **full preview** (decision #10, **Clarity**): "Delivers to **N** buyers on **<date>**." ≤5 actionable elements (**Miller's Law**): (1) audience picker, (2) date picker, (3) notify toggle, (4) primary CTA "Send update", (5) cancel as tertiary text link.
- **Audience picker (#1):** segmented control (reuse the segmented-`TouchableOpacity` pattern from `CoachPackageEditScreen.tsx:62-67` `INTERVAL_OPTIONS`); options All / Active / Cohort; **"Active" preselected** (safe default, **progressive disclosure** — cohort opens a buyer multi-select behind disclosure).
- **Date picker with past-date block (#6):** add `@react-native-community/datetimepicker` (G5) with `minimumDate={startOfToday}` → past dates physically un-selectable (**Error prevention not reporting**; the wrong action is impossible).
- **Notify toggle (#9):** RN core `<Switch>`, **default ON** (smart default).
- **Animation/Light feedback:** ≥300ms confirmation micro-interaction on submit (reuse `tokens.ts:271-286` motion + `FadeInView`); `successTap`/`mediumTap` haptic from `utils/haptics.ts` on confirm.
- **Re-send affordance (#5):** if the preview reports drops already delivered, surface an explicit "Re-send updated version" option (sets `mode:'resend'`) — the safe action (no-op push) is default; re-send is the deliberate, harder path.

### 3.5 Success closure (M4) — Anti-Pattern 4
- Dedicated celebration/closure state (NOT static text): animated check (FadeInView + scale via motion tokens) + warm copy **"Update sent to N buyers"** / "Your buyers are getting the update" (NOT "Action complete"). `successTap` haptic. Auto-dismiss back to the contents list after the micro-interaction. **Emotional target:** coach leaves "in control / reassured."

### 3.6 Mobile tests (M5) — convention from survey
- API tests (`src/api/__tests__/packagesApi*.test.ts`): mock `../../services/api` default instance `{get,post,patch,delete:jest.fn()}`; assert path/body/`Idempotency-Key` on `.post.mock.calls[0]`. Cover the new contents+push methods.
- Screen tests (`src/__tests__/` or co-located `__tests__`): RTL mount mocking `@react-navigation/native`, `useTheme`, partial-mock api; source-grep guards for nav/screen wiring; assert preview count renders, past-date disabled, notify default ON, success copy. Cover `CoachPackageContentsScreen`, `PushConfirmModal`.

---

## 4. PAGE / PATH LAYOUT

**Mobile navigation (`src/navigation/CoachNavigator.tsx`):**
- Add to `SettingsStackParamList` (`:176-207`, insert ~`:199`):
  - `CoachPackageContents: { packageId: string; title?: string }`
- Register in `SettingsStackNavigator()` (`:407-413`):
  - `<SettingsStack.Screen name="CoachPackageContents" component={CoachPackageContentsScreen} />`
- The `PushConfirmModal` + push-vs-future prompt are **components rendered within** `CoachPackageContentsScreen` (RN `<Modal>`), NOT separate routes — keeps the push decision local to the authoring screen (one-concept-per-moment without a route change).
- Entry: `CoachPackageEditScreen` adds a "Manage content" button → `navigate('CoachPackageContents', {packageId, title})` (mirror `:469`).

**New mobile files:**
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx`
- `src/screens/coach/payments/contents/PushConfirmModal.tsx`
- `src/screens/coach/payments/contents/PushPromptSheet.tsx` (push-vs-future)
- `src/screens/coach/payments/contents/ContentAttachForm.tsx`
- API: extend `src/api/packagesApi.ts` (or new `src/api/packageContentsApi.ts`)

**New backend files:**
- `src/packages/package-push.service.ts`
- push schemas appended to `src/packages/package-contents.dto.ts`
- push methods appended to `src/packages/package-contents.controller.ts` (reuse guards) — OR a thin `package-push.controller.ts` (see §5 file-overlap note)
- migration `prisma/migrations/20261209000000_pr17_scheduled_drop_push_seq/migration.sql` + `prisma/schema.prisma` edit

---

## 5. SEQUENCED PR PLAN (parallel vs sequential)

| Unit | Repo | Branch | Files touched | Depends on | Parallel? |
|------|------|--------|---------------|-----------|-----------|
| **B1** schema+migration+engine | backend | `pr17/b1-push-seq-engine` | `prisma/schema.prisma`, `prisma/migrations/20261209000000_pr17_scheduled_drop_push_seq/*`, `src/packages/drip-dispatcher.cron.ts`, `test/drip-dispatcher.cron.spec.ts` | — | First. Sequential root. |
| **B2** push service+endpoint+dto | backend | `pr17/b2-push-endpoint` | `src/packages/package-push.service.ts` (new), `src/packages/package-contents.dto.ts`, `src/packages/package-contents.controller.ts`, `src/packages/packages.module.ts`, `test/package-push.service.spec.ts` (new) | **B1** (needs `push_seq` + cron key-bypass) | After B1. |
| **M1** API client wiring | mobile | `pr17/m1-contents-api` | `src/api/packagesApi.ts` (or new `src/api/packageContentsApi.ts`), `src/api/__tests__/…test.ts` | contract freeze from §2.1 (NOT code) | **∥ with B1/B2** (different repo, contracts frozen). |
| **M2** authoring screen + nav | mobile | `pr17/m2-contents-screen` | `src/screens/coach/payments/CoachPackageContentsScreen.tsx` (new), `src/screens/coach/payments/contents/ContentAttachForm.tsx` (new), `src/navigation/CoachNavigator.tsx`, `src/screens/coach/payments/CoachPackageEditScreen.tsx` (add nav button) | **M1** (uses the API methods) | After M1. |
| **M3** push prompt sheet | mobile | `pr17/m3-push-prompt` | `src/screens/coach/payments/contents/PushPromptSheet.tsx` (new) | **M2** (rendered from the contents screen) | **∥ with M4** — disjoint new files. |
| **M4** confirm-preview modal + success + date picker dep | mobile | `pr17/m4-push-confirm` | `src/screens/coach/payments/contents/PushConfirmModal.tsx` (new), `package.json`/lockfile (add datetimepicker), `src/__tests__/pushConfirmModal.test.tsx` | **M2** + **M1** (uses `push`/`pushPreview`) | **∥ with M3** — disjoint new files. |
| **M5** wiring + screen tests | mobile | `pr17/m5-push-tests` | `src/screens/coach/payments/CoachPackageContentsScreen.tsx` (wire prompt→confirm), `src/__tests__/coachPackageContentsScreen.test.tsx` | **M3 + M4** | Last mobile. |

### Parallelism map (the critical part)
- **B1 ∥ M1** — different repos, no file overlap. M1 only needs the FROZEN endpoint contract from §2.1, not B1 merged. SAFE PARALLEL.
- **B2 must be sequential after B1** — both touch `drip-dispatcher.cron.ts`? No: B1 touches the cron, B2 does NOT. But B2's service depends on the `push_seq` column and the cron key-bypass behavior, so it's a logical (not file) dependency → sequential.
- **M2 sequential after M1** — M2 imports the M1 API methods.
- **M3 ∥ M4** — **SAFE PARALLEL**: each creates its OWN new file (`PushPromptSheet.tsx` vs `PushConfirmModal.tsx`), no shared file. Both depend on M2 being merged (they render from the contents screen) but do NOT touch the contents screen file themselves — M5 does the final wiring.
- **M5 sequential after M3+M4** — M5 edits `CoachPackageContentsScreen.tsx` to wire both, and adds the integration test.

### FORBIDDEN-parallel flags (files two units would both touch)
- `src/api/packagesApi.ts` — touched ONLY by M1 (if M3/M4 needed it, they'd conflict — they don't; they import M1's methods). ✅
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx` — touched by **M2** (create) and **M5** (wire). **M5 MUST follow M2; never parallel.** ⛔ if attempted in parallel.
- `src/navigation/CoachNavigator.tsx` — touched ONLY by M2. ✅
- `prisma/schema.prisma` + `drip-dispatcher.cron.ts` — touched ONLY by B1. ✅
- `src/packages/package-contents.dto.ts` + `package-contents.controller.ts` + `packages.module.ts` — touched ONLY by B2. ✅ (If a separate `package-push.controller.ts` is preferred to avoid editing the existing controller, B2 still owns it alone.)

**Net:** two true parallel opportunities — **{B1, M1} concurrently** and **{M3, M4} concurrently**. Everything else is a sequential chain dictated by file-overlap (M2→M5 on the contents screen) or logical dependency (B1→B2).

---

## 6. RISKS & R1 WATCHPOINTS

1. **Idempotency (#8):** the deterministic `push_seq` computation is the lynchpin — a replay MUST land on the same seq or `createMany skipDuplicates` won't dedup and a double-push slips through. Compute seq from the DB max INSIDE the tx, and let the mutation `Idempotency-Key` header dedup at the request layer. **Test the replay no-op explicitly.**
2. **Atomicity + chunking (#7):** all seeds in ONE `$transaction`, chunked at ~500. Watch the interaction: chunking inside a single interactive tx is fine, but a very large `all` audience (10k+ buyers) could exceed statement timeout — cap audience size or paginate the tx. Flag for the builder: confirm the deploy's `$transaction` timeout tolerates the max realistic buyer count; if not, document a per-chunk-tx fallback (each chunk its own tx — sacrifices all-or-nothing for scalability; **needs an explicit operator decision if buyer counts are huge**).
3. **NO Stripe in tx (#7):** the push path NEVER calls Stripe — verify no transitive Stripe call sneaks in via a resolver. The inline-materialise resolvers (workout/meal_plan/auto_message/media) do NOT touch Stripe; confirm during build. Document the invariant in the service header.
4. **IDOR / tenant-scope on the new endpoint:** reuse `resolveEffectiveCoachId` + `requireOwnedPackage` (`packages.service.ts:332,338`); for `cohort` audience, re-filter `cohort_purchase_ids` by `package_id` so a coach can't push to another package's purchases by id-guessing. **Test cross-tenant push rejection.**
5. **Immutable-fired-drop invariant (#5):** the push NEVER mutates a `fired`/`delivered` drop. Re-send creates a NEW `push_seq+1` row. **Test:** a re-send leaves the original fired row byte-identical and produces a genuinely fresh delivery (assert the auto_message resolver SENDS a second message because the marker is bypassed for `push_seq>0`).
6. **Resolver-key bypass correctness:** the single most fragile point. If the cron/inline path forgets the `push_seq>0 → scheduledDropId-only` rule, re-sends silently no-op (auto_message/workout collapse to cached). **This MUST have a dedicated cron test** (`push_seq>0` drop → resolver called WITHOUT the pair). Media re-send collapsing on `ClientAssetGrant @@unique` is EXPECTED/acceptable (re-grant is idempotent; the re-send's value is the new notification) — document so it isn't "fixed" by mistake.
7. **Status-vocabulary split (G4):** the audience/skip/resend logic must treat BOTH `fired` and `delivered` as shipped. A builder who checks only one will mis-scope. **Centralize the SHIPPED set as a constant.**
8. **Notify suppression (#9):** the `alert_dispatched_at` skip in `dispatchBuyerAlert` is a behavior change to the cron — verify it doesn't suppress NORMAL drip alerts (only push drops with `notify=false` get the pre-stamp). Gate the skip on the column being pre-set, which normal drops never are at seed time.
9. **Forward-dated push + cron:** verified the cron picks up future-dated pending drops when due with no change. Watch that `computeFireAt`'s past→now normalization isn't accidentally applied to the coach's chosen date (the push uses the coach date directly per #2). **Don't double-normalize.**
10. **Buyer-side rendering:** pushed/re-send drops are ordinary `ScheduledDrop` rows → render in `DeliverablesScreen`/`dropRow.tsx` unchanged. A `push_seq>0` re-send shows as a second delivered row for the same content — confirm that's acceptable UX (it is: "updated version" should appear as a new delivery). No mobile buyer-side change needed.
11. **Scope-creep boundaries:** do NOT build cohort-management UI beyond a buyer multi-select; do NOT add analytics/audit dashboards; do NOT add a feature flag (#11 — full production); do NOT refactor the fan-out engine (reuse `computeFireAt`, don't rewrite it); do NOT touch the money/Stripe path. The authoring UI is greenfield but minimal — list/attach/edit-cadence/push, nothing more.
