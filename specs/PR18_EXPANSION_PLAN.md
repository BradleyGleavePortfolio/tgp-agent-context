# PR-18 Expansion Plan — Packages & Drip-Feed Polish Pass

Status: planning only; no product-code changes made.  
Planner: Dynasia G.  
Current main inspected: backend `origin/main` = `19e51b0`; mobile `origin/main` = `6b6f820`; docs `origin/main` = `4a16c41` at start of this planning pass.

## 0) Reference inputs reconciled

Authoritative PR-18 scope has two sources:

1. `specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md:246` names PR-18 as the final polish pass and calls out: semantic tokens, preview-as-buyer, sub-coach fork-on-attach guard, custom-domain Host-header TODO, and lock-pricing-after-subscriber.
2. `specs/PR18_POLISH_BACKLOG.md` accumulates P3/P4 items from PR-8/9/10/14. Each backlog item is dispositioned below as INCLUDE or DEFER.

50-Failures gates to keep front-of-mind for every builder/auditor: the master plan calls out RLS/IDOR, input validation, N+1, pagination, race/transactions, soft deletes, idempotent fan-out, no Stripe HTTP inside DB transactions, sub-coach scope, SKIP LOCKED / idempotent cron semantics, and snapshot-at-purchase invariants (`specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md:252-260`).

## 1) Foundation check

### 1.1 Latest-origin confirmation

Ran the required fetch/log checks before inspecting code:

- Backend: `/home/user/workspace/repos/growth-project-backend`, `git fetch origin main`, `origin/main` top commit `19e51b0`.
- Mobile: `/home/user/workspace/repos/growth-project-mobile`, `git fetch origin main`, `origin/main` top commit `6b6f820`.
- Docs: `/home/user/workspace/repos/tgp-agent-context`, `git fetch origin main`, `origin/main` top commit `4a16c41`.

### 1.2 Cheap smoke checks

Attempted cheap compile/type checks:

- Backend `npm run build` failed before TypeScript compilation because local dependency binaries are not installed: `sh: 1: nest: not found` from `package.json:4-11` script `build: nest build`.
- Mobile `npm run typecheck` failed before TypeScript compilation because local dependency binaries are not installed: `sh: 1: tsc: not found` from `package.json:5-12` script `typecheck: tsc --noEmit`.

Interpretation: this workspace cannot currently run the cheap smoke checks without installing dependencies; these failures are environment/dependency-install failures, not code compile failures.

### 1.3 Foundational breakage found in main

**BROKEN: public package share-token lookup used by mobile does not match backend routes.**

- Mobile buyer checkout calls `publicPackagesApi.getByShareToken()` from `PackageCheckoutScreen` at `src/screens/client/PackageCheckoutScreen.tsx:101-103`.
- That API currently requests `GET /v1/packages/:shareToken` at `src/api/packagesApi.ts:436-444`, with a TODO saying the route is planned but not deployed.
- Backend's public package route is actually `@Controller('v1/packages/public')` in `src/storefront/storefront-public.controller.ts:63` and `@Get('join/:token')` at `src/storefront/storefront-public.controller.ts:119-127`.
- Backend response shape is snake_case (`package_id`, `package_name`, `price_cents`, `billing_cycle`, `coach.display_name`) at `src/storefront/storefront.service.ts:177-205`, while mobile expects camelCase `PublicPackageView` fields.

Required PR-18 fix: include this in the mobile commerce polish unit. Change `publicPackagesApi.getByShareToken()` to call `/v1/packages/public/join/:token` and adapt the backend response into `PublicPackageView` before `PackageCheckoutScreen` consumes it. This is foundational because the buyer package detail/checkout surface cannot reliably load from share links on current main.

No additional foundational breakage was confirmed from static inspection. The remaining findings below are scoped polish/risk items.

---

## 2) Named PR-18 items

## 2.1 SEMANTIC TOKENS — migrate package/commerce/deliverables mobile surfaces

**Decision:** INCLUDE in PR-18.  
**Repo:** mobile.  
**Primary risk:** visual regression / dark-mode mismatch / continued legacy token drift.

### Exact code locations

Theme/token infrastructure:

- Legacy `ThemeColors` and legacy `colors` are still exposed by `src/theme/ThemeProvider.tsx:39-58` and `src/theme/ThemeProvider.tsx:112-118`.
- `useTheme()` explicitly says new consumers should use `semanticColors` at `src/theme/useTheme.ts:1-18`.
- The theme README says the theme files are the sanctioned source for color/font constants at `src/theme/README.md:3-9`.
- Palette/typography source of truth: bone `#F5EFE4` at `src/theme/tokens.ts:31-33`, forest `#2C4A36` at `src/theme/tokens.ts:38-40`, Cormorant/Inter typography at `src/theme/tokens.ts:131-216`.
- Current semantic token shape is only `bgPrimary`, `bgSurface`, `textPrimary`, `textMuted`, `accent`, `border` at `src/theme/tokens.ts:300-313`; light tokens are at `src/theme/tokens.ts:315-323`.

Package/commerce/deliverables files still using legacy `ThemeColors` / `const { colors } = useTheme()`:

- `src/components/PackageSelectionSheet.tsx:38`, `src/components/PackageSelectionSheet.tsx:168-169`, `src/components/PackageSelectionSheet.tsx:432`
- `src/screens/client/ClientPackagesScreen.tsx:62`, `src/screens/client/ClientPackagesScreen.tsx:130-131`, `src/screens/client/ClientPackagesScreen.tsx:485`
- `src/screens/client/PackageCheckoutScreen.tsx:45`, `src/screens/client/PackageCheckoutScreen.tsx:70-71`, `src/screens/client/PackageCheckoutScreen.tsx:319`
- `src/screens/client/CheckoutReturnScreen.tsx:37`, `src/screens/client/CheckoutReturnScreen.tsx:46-47`, `src/screens/client/CheckoutReturnScreen.tsx:242`
- `src/screens/client/BrandedCheckoutWebViewScreen.tsx:64`, `src/screens/client/BrandedCheckoutWebViewScreen.tsx:195-196`, `src/screens/client/BrandedCheckoutWebViewScreen.tsx:502`, `src/screens/client/BrandedCheckoutWebViewScreen.tsx:619`
- `src/screens/client/DeliverablesScreen.tsx:47`, `src/screens/client/DeliverablesScreen.tsx:80-81`, `src/screens/client/DeliverablesScreen.tsx:241-242`, `src/screens/client/DeliverablesScreen.tsx:314`
- `src/screens/client/PurchaseUnpackScreen.tsx:64`, `src/screens/client/PurchaseUnpackScreen.tsx:149-150`, `src/screens/client/PurchaseUnpackScreen.tsx:411-412`, `src/screens/client/PurchaseUnpackScreen.tsx:537`
- `src/screens/client/deliverables/dropRow.tsx:35`, `src/screens/client/deliverables/dropRow.tsx:266-267`, `src/screens/client/deliverables/dropRow.tsx:348`
- `src/screens/coach/payments/CoachPackageEditScreen.tsx:42`, `src/screens/coach/payments/CoachPackageEditScreen.tsx:70-71`, `src/screens/coach/payments/CoachPackageEditScreen.tsx:509`, `src/screens/coach/payments/CoachPackageEditScreen.tsx:528`
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx:63`, `src/screens/coach/payments/CoachPackageContentsScreen.tsx:87-88`, `src/screens/coach/payments/CoachPackageContentsScreen.tsx:661`
- `src/screens/coach/payments/CoachPackagesListScreen.tsx:27`, `src/screens/coach/payments/CoachPackagesListScreen.tsx:57-58`, `src/screens/coach/payments/CoachPackagesListScreen.tsx:211-212`, `src/screens/coach/payments/CoachPackagesListScreen.tsx:270`
- `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx:24`, `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx:51-52`, `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx:214`

Hardcoded hex in scoped package/commerce/deliverables files:

- `src/screens/client/ClientPackagesScreen.tsx:95` icon color `#fff`
- `src/screens/client/ClientPackagesScreen.tsx:348` `#fff`
- `src/screens/client/ClientPackagesScreen.tsx:471` `#fff`
- `src/screens/client/ClientPackagesScreen.tsx:511`, `src/screens/client/ClientPackagesScreen.tsx:512`, `src/screens/client/ClientPackagesScreen.tsx:514`, `src/screens/client/ClientPackagesScreen.tsx:561` style `#fff`
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx:21` comment still names raw forest/cream hex values; update comment to token names to avoid future copying.

### What's there today

The target screens are mostly wired to the legacy `ThemeColors` object rather than `semanticColors`. The semantic token object is intentionally smaller than legacy `ThemeColors`, so builders must map each legacy usage deliberately instead of doing a mechanical rename.

### Precise change required

1. In each scoped package/commerce/deliverables file above, replace legacy `ThemeColors` typing with `SemanticTokens` plus the non-color token families needed (`tokens.typography`, `tokens.spacing`, `tokens.radius`, etc.). Prefer this pattern:
   - `const { semanticColors, tokens } = useTheme();`
   - `const styles = useMemo(() => makeStyles(semanticColors, tokens), [semanticColors, tokens]);`
   - `makeStyles(colors: SemanticTokens, tokens: Tokens)` or a narrower type.
2. Map legacy roles deliberately:
   - backgrounds → `bgPrimary` / `bgSurface`
   - body/heading text → `textPrimary`
   - secondary/meta text → `textMuted`
   - borders/hairlines → `border`
   - primary CTA/icon/accent → `accent` unless the UI Bible specifically requires forest/body-pillar accent; if so use a named token from `tokens.colors.forest` or `tokens.brand[600]`, not a literal hex.
3. Remove hardcoded `#fff`; for on-accent text add a named semantic role before use, or use an existing sanctioned token. The current `SemanticTokens` lacks `textOnAccent`, so this PR should either add `textOnAccent`/`accentOn` to `SemanticTokens` in `src/theme/tokens.ts` or route those cases to a named neutral token through the theme object. Do not leave literal `#fff`.
4. Make Cormorant/Inter explicit through `tokens.typography` for package titles, buyer-package hero title, and editor headings where they still use ad hoc font settings.
5. Update test mocks that provide `useTheme()` so they include `semanticColors`; known relevant mocks include `src/__tests__/deliverablesScreen.test.tsx:212-213` and `src/__tests__/CoachPackageContentsScreen.test.tsx:83-86`.

### Exact write-set

Mobile unit `M1` owns this entire write-set to avoid overlaps with preview/pricing UX:

- `src/theme/tokens.ts` if adding `textOnAccent` / `accentOn`
- `src/theme/ThemeProvider.tsx` if the new token must be surfaced through the built theme
- all scoped package/commerce/deliverables screens listed above
- test mocks for the touched screens

### 50-Failures / audit concerns

- No hardcoded hex in scoped files after migration.
- No accidental use of legacy `ThemeColors` in package/commerce/deliverables surfaces.
- Contrast: accent/on-accent and muted text on bone/cream must pass AA for body-sized text.
- No behavior changes to checkout, content delivery, or permissions while changing styles.

### Tests

- `npm run typecheck` after dependencies are installed.
- Jest snapshots / render tests for `PackageCheckoutScreen`, `ClientPackagesScreen`, `DeliverablesScreen`, `CoachPackageContentsScreen`, and `CoachPackageEditScreen` mocks updated to include `semanticColors`.
- Static grep gate for scoped files: no `#[0-9a-fA-F]{3,8}` literals except sanctioned comments in token files, and no `ThemeColors` imports in the scoped package/commerce/deliverables files.

---

## 2.2 PREVIEW-AS-BUYER — coach previews package as buyer sees it

**Decision:** INCLUDE in PR-18.  
**Repo:** mobile.  
**Primary risk:** divergence between preview and actual buyer surface; accidentally enabling checkout from coach preview.

### Exact code locations

- Coach editor: `src/screens/coach/payments/CoachPackageEditScreen.tsx:180-216` save flow, `src/screens/coach/payments/CoachPackageEditScreen.tsx:250-269` share action, and `src/screens/coach/payments/CoachPackageEditScreen.tsx:413-498` edit-mode secondary actions.
- Buyer surface currently exists as `PackageCheckoutScreen`, not as a reusable `PackageDetailSheet`: load via `publicPackagesApi.getByShareToken()` at `src/screens/client/PackageCheckoutScreen.tsx:101-103`; render buyer card/price/features/pay CTA at `src/screens/client/PackageCheckoutScreen.tsx:237-313`.
- Public API route bug to fix as part of this: mobile calls `/v1/packages/:shareToken` at `src/api/packagesApi.ts:436-444`, but backend route is `/v1/packages/public/join/:token` at `src/storefront/storefront-public.controller.ts:63` and `src/storefront/storefront-public.controller.ts:119-127`.

### What's there today

There is no `PackageDetailSheet` component in the mobile repo. The only true buyer/package-detail surface is embedded inside `PackageCheckoutScreen`, which mixes data loading, checkout behavior, and presentation. The coach editor can share a link, manage content, archive, and view subscribers, but cannot preview the buyer surface from the editor.

### Precise change required

1. Extract the presentational buyer package detail into a reusable component, e.g. `src/screens/client/packageDetail/PackageDetailSurface.tsx`.
2. Component input should be normalized, not route/API-specific:
   - `package`: `PublicPackageView`-like data (`id`, `title`, `description`, `priceCents`, `currency`, `billingInterval`, `trialDays`, `features`, `coach`).
   - `mode`: `'buyer' | 'coachPreview'`.
   - `onPay`: only present in buyer mode.
3. `PackageCheckoutScreen` keeps share-token loading and payment creation, then renders `PackageDetailSurface mode="buyer"`.
4. `CoachPackageEditScreen` adds a `Preview as buyer` action near the existing share/manage/subscriber actions (`src/screens/coach/payments/CoachPackageEditScreen.tsx:413-498`). It opens a modal/sheet rendering `PackageDetailSurface mode="coachPreview"` using the saved `original` package plus local draft fields if the form is dirty.
5. Coach preview must not call `createCheckoutSession`, must not show a functional payment CTA, and should show copy such as: “Buyer preview — checkout is disabled for coaches.”
6. Fix `publicPackagesApi.getByShareToken()` to call `/v1/packages/public/join/:token` and adapt backend snake_case into `PublicPackageView` so both buyer checkout and the extracted component use the same normalized model.

### Exact write-set

Covered by mobile unit `M1`:

- `src/api/packagesApi.ts`
- `src/screens/client/PackageCheckoutScreen.tsx`
- `src/screens/client/packageDetail/PackageDetailSurface.tsx` (new)
- `src/screens/coach/payments/CoachPackageEditScreen.tsx`
- related render/API tests

### 50-Failures / audit concerns

- IDOR is backend-owned for public token lookup; mobile must not invent package IDs or bypass share-token validation.
- Payment safety: preview mode must not invoke checkout session creation.
- Consistency: buyer and preview must share presentation code; do not fork two visual implementations.
- No N+1 risk on mobile; avoid extra network fetch for preview when editor already has `original`.

### Tests

- Unit test `publicPackagesApi.getByShareToken()` adapts backend snake_case to `PublicPackageView` and rejects invalid tokens.
- Render test that `PackageCheckoutScreen` shows pay CTA in buyer mode.
- Render test that coach preview shows preview banner/disabled CTA and does not call `createCheckoutSession`.

---

## 2.3 SUB-COACH FORK-ON-ATTACH GUARD — enforce scope through `SubCoachScopeService`

**Decision:** INCLUDE in PR-18.  
**Repo:** backend.  
**Primary risk:** IDOR / cross-client sub-coach privilege escalation.

### Exact code locations

- Scope service: `src/sub-coach/sub-coach-scope.service.ts:4-24` documents the head/sub-coach model; `getAuthorizedClientIds()` is at `src/sub-coach/sub-coach-scope.service.ts:50-79`; `getHeadCoachIdForSubCoach()` is at `src/sub-coach/sub-coach-scope.service.ts:91-98`; `canAccessClient()` is at `src/sub-coach/sub-coach-scope.service.ts:105-108`.
- Correct resolver-side helper already exists: `src/packages/asset-resolvers/sub-coach-scope.helper.ts:5-16` says not to trust raw `User.coach_id`; it calls `canAccessClient()` at `src/packages/asset-resolvers/sub-coach-scope.helper.ts:38-48` and promotes to head coach at `src/packages/asset-resolvers/sub-coach-scope.helper.ts:49-54`.
- Attach controller currently loses the actor: `src/packages/package-contents.controller.ts:70-79` resolves `coachId = resolveEffectiveCoachId(req.user.id)` and calls `contents.attach(coachId, packageId, body)`.
- `resolveEffectiveCoachId()` promotes sub-coach to head coach at `src/packages/packages.service.ts:326-335`.
- Attach service checks tenant ownership only: `src/packages/package-contents.service.ts:75-91` calls `requireOwnedPackage(coachUserId, packageId)` then `assertAssetOwnedByCoach(coachUserId, ...)`.
- The asset-ownership check explicitly assumes the caller has already been promoted: `src/packages/package-contents.service.ts:504-507`.
- Current asset queries only check head/tenant ownership: workouts `src/packages/package-contents.service.ts:516-523`, meal plans `src/packages/package-contents.service.ts:532-540`, media `src/packages/package-contents.service.ts:551-558`.
- Existing tests assert promotion but not sub-coach scope denial around `test/package-contents.service.spec.ts:727-739`.

### What's there today

The runtime materialisation path has a scope helper that consults `SubCoachScopeService`, but the authoring attach path promotes a sub-coach to the head coach and then checks only head-owned assets. That creates a guard gap: a sub-coach can attach/fork a head-owned asset into a package without the attach path proving the sub-coach is allowed to act on the relevant client/content scope.

### Precise change required

1. Preserve actor identity separately from tenant/head identity:
   - Controller should pass both `actorUserId = req.user.id` and `tenantCoachId = await resolveEffectiveCoachId(req.user.id)` into attach/fork operations.
   - Do not pass only the promoted coach ID.
2. Inject/use `SubCoachScopeService` in `PackageContentsService` for authoring attach/fork guard.
3. Add a pre-attach method such as `assertActorCanAttachAsset(actorUserId, tenantCoachId, assetType, input)`:
   - If actor is a head coach, existing ownership checks are sufficient.
   - If actor is a sub-coach, require `getHeadCoachIdForSubCoach(actorUserId) === tenantCoachId` and then enforce the relevant client scope through `SubCoachScopeService` instead of raw `User.coach_id`.
   - For assets with an owning/client context, check `canAccessClient(actorUserId, clientId)`; if the asset is global coach media with no client dimension, require an explicit policy decision in code/tests. Default-safe option for PR-18: allow only if the asset has no client-private context and the actor belongs to the head coach team; deny client-bound assets outside `canAccessClient()`.
4. Keep existing head-coach asset-ownership check; the new sub-coach check is an additional actor-scope gate, not a replacement for tenant ownership.
5. Return `NotFoundException`/404-style errors for unauthorized assets to avoid leaking asset existence across scopes.

### Exact write-set

Backend unit `B2`:

- `src/packages/package-contents.controller.ts`
- `src/packages/package-contents.service.ts`
- `test/package-contents.service.spec.ts`

### 50-Failures / audit concerns

- IDOR: do not leak whether a cross-scope asset exists.
- Sub-coach scope: use `SubCoachScopeService`; do not trust `User.coach_id` directly.
- Race/tx: guard and attach should remain coherent; if scope lookup and insert are separate, a scope revocation race is possible. For polish, re-check just before insert; if stricter, wrap with the existing display-order transaction.
- N+1: attach is single-row, so direct lookups are acceptable.

### Tests

- Head coach can attach own asset as before.
- Sub-coach assigned to the relevant client/context can attach.
- Sub-coach on same head team but not assigned to the client/context receives 404/`ASSET_NOT_FOUND`-style denial.
- Regression that controller passes both actor and effective tenant.

---

## 2.4 CUSTOM-DOMAIN HOST-HEADER TODO — resolve published storefront/landing page by Host header

**Decision:** INCLUDE in PR-18.  
**Repo:** backend.  
**Primary risk:** Host-header poisoning / custom-domain account takeover / routing unverified domains.

### Exact code locations

- TODO is in `src/landing-pages/landing-pages.public.controller.ts:22-27`.
- Current public render route requires path slugs: `GET /p/:coachSlug/:pageSlug` at `src/landing-pages/landing-pages.public.controller.ts:49-77`.
- Checkout route also requires slugs and tier query: `src/landing-pages/landing-pages.public.controller.ts:91-121`.
- Lead route: `src/landing-pages/landing-pages.public.controller.ts:132-147`.
- View route: `src/landing-pages/landing-pages.public.controller.ts:159-178`.
- Existing verified-domain lookup already exists at `src/landing-pages/landing-pages.service.ts:673-713`; it normalizes host at `src/landing-pages/landing-pages.service.ts:681-684` and requires `custom_domain_verified_at not null` plus `status: 'published'` at `src/landing-pages/landing-pages.service.ts:686-691`.
- Storefront/webview code has a host-header safety precedent: `src/storefront/webview-detect.middleware.ts:41-56` explains host poisoning; `resolveTrustedHost()` is at `src/storefront/webview-detect.middleware.ts:83-95` but is allow-list-oriented for canonical storefront hosts, not arbitrary verified coach custom domains.

### What's there today

The data lookup for verified custom domains exists, but the public controller never reads the request Host header and never rewrites `coachSlug/pageSlug`. Custom domains therefore cannot resolve the coach landing page directly.

### Precise change required

1. Add a private helper in the landing-page public layer, e.g. `resolvePageAddress(req, params)`, that returns `{ coachSlug, pageSlug, source: 'path' | 'customDomain' }`.
2. For custom-domain candidates:
   - Read a trusted host candidate deliberately. Prefer `Host` unless the deployment explicitly trusts a proxy header; if using `X-Forwarded-Host`, document and constrain it. Strip port, trim, lower-case, remove trailing dot, reject comma chains unless intentionally taking one value.
   - Ignore canonical app/API hosts so normal `/p/:coachSlug/:pageSlug` behavior remains unchanged.
   - Call `LandingPagesService.findPublishedByCustomDomain(host)` or expose a wrapper through `LandingPagePublicService`.
   - Only route if the page is published and `custom_domain_verified_at` is set; existing service already enforces this.
3. Implement custom-domain rendering for the expected URL shape. Recommended minimal PR-18 behavior:
   - `GET /` on a verified custom domain renders that domain's published landing page.
   - `GET /checkout?tier=...`, `POST /leads`, and `POST /view` on a verified custom domain map to the same page's checkout/lead/view logic.
   - Existing `/p/:coachSlug/:pageSlug[...]` routes stay backwards-compatible and can also choose host resolution when Host is a verified custom domain.
4. Never redirect to an untrusted Host value; render/resolve server-side only after DB verification.

### Exact write-set

Backend unit `B3`:

- `src/landing-pages/landing-pages.public.controller.ts`
- `src/landing-pages/landing-pages.public.service.ts` if adding wrapper methods
- `src/landing-pages/landing-pages.service.ts` only if the existing custom-domain lookup needs a slug/address projection
- landing-page public controller/service tests, e.g. `test/landing-pages.public.controller.spec.ts` or a new focused spec if none exists

### 50-Failures / audit concerns

- Host-header poisoning: never trust arbitrary `X-Forwarded-Host`; avoid reflecting host into redirects or HTML without verification.
- IDOR: only route verified domains to their own page.
- Input validation: normalize host consistently and reject empty/long/invalid hostnames.
- Rate limits: preserve existing throttles for render/checkout/lead/view routes.
- Cache: custom-domain 404s should be `no-store`; published pages can use existing 60s + SWR cache.

### Tests

- Verified custom domain Host renders page without `/p/...` path.
- Unverified or unknown custom domain Host returns 404/no-store.
- Canonical app host still requires `/p/:coachSlug/:pageSlug` and is not hijacked by custom-domain branch.
- Malicious comma/port/trailing-dot host variants normalize or reject as designed.
- Checkout/lead/view custom-domain routes map to the same page and keep throttled behavior.

---

## 2.5 LOCK-PRICING-AFTER-SUBSCRIBER — block pricing edits once package has active recurring buyers

**Decision:** INCLUDE in PR-18.  
**Repo:** backend + mobile.  
**Primary risk:** money correctness / race between checkout and price edit / misleading mobile UX.

### Exact code locations

Backend:

- Update controller maps all pricing fields into service input at `src/packages/packages.controller.ts:123-157`.
- Update DTO accepts price-shaping fields at `src/packages/packages.dto.ts:78-142`.
- `PackagesService.update()` builds `data` and allows price changes at `src/packages/packages.service.ts:103-185`.
- Price cache invalidation for primary price is at `src/packages/packages.service.ts:159-168`; recurring companion invalidation is at `src/packages/packages.service.ts:170-180`.
- Subscriber listing exists but is not active-recurring-specific: `src/packages/packages.service.ts:299-324`, with `findMany where: { package_id: packageId }` at `src/packages/packages.service.ts:311-316`.

Mobile:

- Coach editor generic save error handling is at `src/screens/coach/payments/CoachPackageEditScreen.tsx:197-213`.
- Price field is at `src/screens/coach/payments/CoachPackageEditScreen.tsx:333-342`.
- Billing selector is at `src/screens/coach/payments/CoachPackageEditScreen.tsx:344-368`.
- Trial field is at `src/screens/coach/payments/CoachPackageEditScreen.tsx:370-383`.
- Subscribers count is already displayed at `src/screens/coach/payments/CoachPackageEditScreen.tsx:483-496`.
- Mobile API maps backend `subscriber_count` to `CoachPackage.subscriberCount` at `src/api/packagesApi.ts:278-301`.

### What's there today

A coach can patch `amount_cents`, `currency`, `billing_type`, interval fields, duration, and recurring companion fields even after buyers exist. Backend clears Stripe price IDs so future checkout mints a new Price, but there is no guard for active subscribers/recurring buyers. Mobile gives no warning or disabled-state for price/billing fields.

### Precise change required

Backend:

1. In `PackagesService.update()`, compute `priceChanged` and `recurringChanged` before writing, including `duration_periods` if it changes buyer entitlement economics.
2. If no price-shaping fields changed, update as today.
3. If price-shaping fields changed, check for active recurring buyers/subscribers before clearing Stripe price IDs or updating the package.
4. Define the guard narrowly enough for the business rule:
   - Count `ClientPurchase` rows for the package with `entitlement_active = true` and a recurring/subscription fingerprint, e.g. `stripe_subscription_id IS NOT NULL` and status in active-ish statuses (`active`, `trialing`, `past_due`, possibly provider-specific normalized statuses).
   - Consider combo packages: a one-time primary + recurring companion must lock both primary and companion price fields once any active recurring buyer exists, because future checkout economics and existing subscriber expectations diverge.
5. Throw a stable application error, recommended `ConflictException` with `{ error: 'PACKAGE_PRICING_LOCKED', message: 'Pricing is locked because this package has active subscribers. Create a new package for new pricing.' }`.
6. Race concern: perform the active-subscriber check as close to the update as possible. Recommended implementation wraps the price-change branch in a Prisma transaction and locks the package row (`SELECT id FROM "CoachPackage" WHERE id = ... FOR UPDATE`) before counting subscribers and updating. This does not fully serialize against checkout unless checkout also locks the package row, but it materially reduces update/update races and makes the intended invariant explicit for auditors.

Mobile:

1. When editing an existing package with `original.subscriberCount > 0`, show helper copy under price/billing: “Pricing is locked after subscribers join. Create a new package for new pricing.”
2. Disable price/billing/trial/recurring fields only if backend exposes an active-recurring subscriber flag; until then, do not over-disable based solely on total `subscriberCount`, because one-time historical buyers are not necessarily active recurring subscribers. Instead, handle `PACKAGE_PRICING_LOCKED` on save.
3. On `PACKAGE_PRICING_LOCKED`, show exact UX copy: “Pricing is locked because this package already has active subscribers. Create a new package for new pricing; you can still edit name, description, deliverables, and availability.”

### Exact write-set

Backend unit `B1`:

- `src/packages/packages.service.ts`
- `test/packages.service.spec.ts`

Mobile unit `M1`:

- `src/screens/coach/payments/CoachPackageEditScreen.tsx`
- `src/api/packagesApi.ts` only if adding typed error helpers or active-subscriber metadata
- related editor tests

### 50-Failures / audit concerns

- Race/money correctness: checkout and update can race; guard must be close to update and covered by tests.
- IDOR: keep `requireOwnedPackage()` before any subscriber count.
- N+1: one count query only.
- Snapshot-at-purchase: existing buyer snapshots/Stripe subscriptions must not be mutated.
- Backwards compatibility: non-pricing edits remain allowed.

### Tests

- Service allows name/description/status update with active recurring subscribers.
- Service blocks `amount_cents`, `currency`, `billing_type`, interval, duration, and recurring companion changes with an active recurring subscriber.
- Service allows pricing edit when subscribers are inactive/canceled or no recurring subscription exists, if that is the chosen policy.
- Error code is `PACKAGE_PRICING_LOCKED` and mobile renders the targeted copy.

---

## 3) Backlog dispositions

## 3.1 PR-8: `display_order` gaps after soft delete

**Decision:** INCLUDE in PR-18 as part of backend content/order unit `B2`.

### Exact code locations

- Soft delete currently only stamps `removed_at` and does not compact active rows: `src/packages/package-contents.service.ts:253-277`.
- Append uses `max(display_order)+1`, so gaps persist after deletes: `src/packages/package-contents.service.ts:455-465`.
- Reorder can compact when the full active list is supplied: `src/packages/package-contents.service.ts:279-356`.

### What's there today

A deleted row leaves a display-order hole. Future appends go to max+1, so authoring lists can remain sparse forever unless the UI performs a full reorder.

### Precise change required

Inside `softDelete()`, after idempotently marking a non-removed row removed, acquire the existing per-package display-order advisory lock and decrement `display_order` for non-removed rows whose order was greater than the removed row. Keep idempotent behavior for already removed rows.

### Exact write-set

- `src/packages/package-contents.service.ts`
- `test/package-contents.service.spec.ts`

### 50-Failures / audit concerns

- Race: use the same advisory lock used by attach/patch/reorder.
- Soft-delete invariant: never mutate removed rows; do not resurrect content.
- Snapshot-at-purchase: existing `ScheduledDrop` rows should not be reordered; only authoring `CoachPackageContent` active rows compact.

### Tests

- Deleting middle row compacts active orders to contiguous `0..n-1`.
- Deleting already-removed row remains idempotent and does not double-compact.
- Delete-vs-attach/reorder interleaving preserves distinct display orders.

## 3.2 PR-8: `DISPLAY_ORDER_TAKEN` swap dead-end

**Decision:** INCLUDE in PR-18 as part of backend content/order unit `B2`.

### Exact code locations

- Patch duplicate rejection currently throws `DISPLAY_ORDER_TAKEN` at `src/packages/package-contents.service.ts:225-242`.
- The only current workaround is bulk `/reorder`, implemented at `src/packages/package-contents.service.ts:279-356` and routed at `src/packages/package-contents.controller.ts:81-93`.
- Tests currently assert rejection at `test/package-contents.service.spec.ts:877-896`.

### What's there today

Single-row patch cannot move row A to row B's order because it rejects the collision; users must submit a full reorder. That is safe but creates a UI dead-end for simple adjacent swaps.

### Precise change required

Change the patch-with-display-order branch under the existing advisory lock: when the target order is held by exactly one active row, swap that row to the patched row's old order, then update the patched row to the requested order. Preserve duplicate rejection for out-of-range or ambiguous states. Keep full `/reorder` for multi-row moves.

### Exact write-set

- `src/packages/package-contents.service.ts`
- `test/package-contents.service.spec.ts`

### 50-Failures / audit concerns

- Race: keep swap inside the current transaction and lock.
- Input validation: define accepted target order range; avoid creating sparse or negative orders.
- Idempotency: patch to same order remains no-op.

### Tests

- Adjacent swap succeeds and produces unique contiguous orders.
- Non-adjacent swap succeeds if target order exists.
- Patch to an order with no row is rejected unless explicitly choosing move+shift semantics; do not create gaps.
- Patch-vs-attach/reorder race tests still pass.

## 3.3 PR-9: process-crash window between send commit and `materialised_ref` stamp / transactional outbox

**Decision:** DEFER full transactional outbox from PR-18. No product-code write in PR-18 except optional comments/tests if builders are already in nearby code.

### Exact code locations

- Fan-out service documents the stable-key/idempotency surfaces at `src/packages/purchase-fanout.service.ts:43-52`.
- Auto-message resolver documents the `DripResolverMarker` mitigation at `src/packages/asset-resolvers/auto-message.resolver.ts:48` and surrounding comments.
- Cron materialises then stamps `materialised_ref` after resolver success at `src/packages/drip-dispatcher.cron.ts:345-383`.
- Dispatcher comments explain resolver stable keys for reclaim at `src/packages/drip-dispatcher.cron.ts:224-240` and `src/packages/drip-dispatcher.cron.ts:317-363`.

### What's there today

The system has resolver-level idempotency, but not a true transactional outbox. A process can still die after an external/send-side commit but before `ScheduledDrop.materialised_ref` is stamped; stable keys reduce duplicate side effects, but a full outbox would be the stronger architecture.

### Precise change required if/when done later

A full fix is a cross-cutting transactional outbox: persist an outbox/event row in the same DB transaction as entitlement/drop state, have a worker dispatch side effects idempotently, then atomically mark the outbox event done. That is larger than a polish pass because it changes resolver contracts, retry semantics, operational dashboards, and tests.

### 50-Failures / audit concerns

- Race/idempotency: this is exactly the crash-window class; PR-18 should not pretend a comment-only change closes it.
- Transactions: outbox must be in the same tx as entitlement/drop decisions.
- Duplicate delivery: all external side effects need stable idempotency keys.

### Minimal safe improvement for PR-18

Do not implement an outbox in PR-18. If a builder is touching `drip-dispatcher.cron.ts` for PR-10, they may add a targeted test/comment proving existing stable-key behavior remains intact, but no architecture rewrite.

## 3.4 PR-9: splits-outside-tx observability sweeper

**Decision:** DEFER automated sweeper; current main already has a rollback observability warning.

### Exact code locations

- `BillingService` catch block documents outside-tx side effects at `src/billing/billing.service.ts:529-549`.
- It emits a warning naming `SplitLedgerEntry`, `WorkoutBuilderIdempotencyKey`, and `DripResolverMarker` at `src/billing/billing.service.ts:550-553`.

### What's there today

There is an oncall-facing warning/runbook hint on rollback. There is not an automated sweeper that reconciles all three side-effect surfaces after rollback storms.

### Precise change required if/when done later

A sweeper should scan for orphaned `SplitLedgerEntry`/`WorkoutBuilderIdempotencyKey`/`DripResolverMarker` rows tied to failed or non-entitled purchases, classify them by Stripe event/purchase, and emit actionable metrics or admin-console entries. It must avoid mutating money ledger rows without a Stripe-backed reconciliation policy.

### Reason to defer

This is operational tooling across billing, packages, workout-builder, and notifications. It is too broad for a final polish PR and overlaps money-ledger audit risk.

## 3.5 PR-9: `tx ?? this.prisma` type-safety casts

**Decision:** DEFER from PR-18.

### Exact code locations

- Safer union pattern appears at `src/checkout/checkout-webhook-handler.service.ts:165`, `src/checkout/checkout-webhook-handler.service.ts:392`, `src/checkout/checkout-webhook-handler.service.ts:450`, and `src/checkout/checkout-webhook-handler.service.ts:525`.
- Unsafe casts remain when calling fanout cancellation at `src/checkout/checkout-webhook-handler.service.ts:418` and `src/checkout/checkout-webhook-handler.service.ts:579`.

### What's there today

Most local DB usage is typed as `WebhookTx | PrismaService`, but fanout call sites still cast `this.prisma` to `WebhookTx` when no tx is provided.

### Reason to defer

This is a type hygiene item, not user-visible polish, and a correct fix likely requires a shared narrowed transaction/client type accepted by fanout APIs. It should be handled in a focused checkout typing cleanup to avoid destabilizing webhook paths during PR-18.

### Minimal safe improvement for PR-18

No code. Auditors should ensure PR-18 builders do not add new `as unknown as WebhookTx` casts.

## 3.6 PR-10: slow-worker/stale-cutoff duplicate-alert dedup

**Decision:** INCLUDE in PR-18 as backend dispatcher unit `B4`.

### Exact code locations

- Stale cutoff is `STALE_CLAIM_MS = 5 * 60 * 1000` at `src/packages/drip-dispatcher.cron.ts:48-50`.
- `findDue()` reclaims stale `dispatching` rows at `src/packages/drip-dispatcher.cron.ts:183-221`.
- Atomic claim is at `src/packages/drip-dispatcher.cron.ts:241-270`.
- Delivery stamps `materialised_ref` and then calls `dispatchBuyerAlert()` at `src/packages/drip-dispatcher.cron.ts:365-383`.
- Existing alert guard checks stale input `drop.alert_dispatched_at` at `src/packages/drip-dispatcher.cron.ts:411-420`.
- Alert stamp happens after notification attempts at `src/packages/drip-dispatcher.cron.ts:481-493`.
- Existing stale reclaim test is at `test/drip-dispatcher.cron.spec.ts:636-674`.

### What's there today

The dispatcher skips alerts if `drop.alert_dispatched_at` was already set on the in-memory row. That covers notify-off and already-stamped rows, but a slow worker can send an alert, then before it stamps `alert_dispatched_at`, a stale reclaim worker can also deliver/send because both see null.

### Precise change required

Add an atomic alert-claim step before sending notifications:

1. In `dispatchBuyerAlert()`, replace the stale object-only guard with `updateMany({ where: { id: drop.id, alert_dispatched_at: null }, data: { alert_dispatched_at: now } })`.
2. If count is `0`, log and skip sends.
3. If count is `1`, send in-app/push rows. Keep failure logging, but do not clear the stamp on notification-provider failure; this preserves “delivery is committed; alert is best-effort and never duplicated.”
4. Keep notify-off semantics: rows pre-stamped at seed still skip because the claim count is `0`.

### Exact write-set

- `src/packages/drip-dispatcher.cron.ts`
- `test/drip-dispatcher.cron.spec.ts`

### 50-Failures / audit concerns

- Race/idempotency: this is a duplicate-alert gate; it must be DB-atomic, not JS-memory-only.
- Failure semantics: pre-stamping before send means a send failure suppresses retry; this matches current “stamp regardless of success/failure” policy at `src/packages/drip-dispatcher.cron.ts:481-483` but auditors should verify product accepts it.
- No duplicate in-app + push rows under stale reclaim.

### Tests

- Existing stale reclaim test still delivers once.
- New test: first worker claims alert, second worker sees `updateMany.count === 0` and sends no notifications.
- Notify-off pre-stamped row still materialises content and sends no alert.

## 3.7 PR-10: concurrency test uses JS event loop, not real Postgres

**Decision:** DEFER real Postgres concurrency test from PR-18; include focused unit coverage for the alert-claim logic in `B4`.

### Exact code locations

- Current stale-reclaim unit uses in-memory mocks around `test/drip-dispatcher.cron.spec.ts:636-690`.
- Existing comments rely on stable resolver ledgers around `test/drip-dispatcher.cron.spec.ts:665-668`.

### Reason to defer

A real Postgres concurrency/integration harness would require test infrastructure setup outside this polish unit. It is valuable, but not required to safely add the atomic alert-claim guard.

### Minimal safe improvement for PR-18

Add deterministic unit tests around the new `updateMany count` branch, and leave a TODO/test-plan note for a future DB-backed race harness.

## 3.8 PR-14: `retrieveSubscription` Stripe HTTP under transaction

**Decision:** DEFER/no-op for PR-18 because the named guest-conversion path is already fixed in current main.

### Exact code locations

- Current `convertGuestToUser` pre-resolves live Stripe subscription status before opening the transaction at `src/storefront/guest-checkout.service.ts:1535-1563`.
- The transaction opens after that at `src/storefront/guest-checkout.service.ts:1570-1571`.
- A separate invoice-paid path calls `retrieveSubscription` at `src/checkout/checkout-webhook-handler.service.ts:604`, but the named PR-14 backlog item was the `convertGuestToUser` status read under the outer BillingService tx.

### What's there today

The PR-14 A276-P1-3 pattern is already implemented for guest conversion: Stripe HTTP is performed before `$transaction`. No PR-18 code is needed unless an auditor identifies a new under-transaction call site.

### Tests

No new PR-18 test required. Auditor should verify no builder regresses by placing Stripe HTTP in a Prisma transaction.

## 3.9 PR-14: combo min/max guard error messages distinguish one-time vs recurring half

**Decision:** INCLUDE in PR-18 as part of backend package pricing unit `B1`.

### Exact code locations

- Primary minimum error is generic: `src/packages/packages.service.ts:415-420` message `amount_cents must be an integer ≥ 50 (Stripe minimum)`.
- Recurring companion minimum error is at `src/packages/packages.service.ts:497-501` message `recurring_amount_cents must be an integer ≥ 50`.
- Combo validation comments and branches are at `src/packages/packages.service.ts:467-507`.

### What's there today

The recurring companion branch is distinct, but primary one-time half copy is still generic. In combo packages, auditors/users can misread which half failed.

### Precise change required

Adjust error copy to be explicit in combo context without changing validation semantics. Example:

- Primary branch: if a recurring companion is present, message `one-time amount_cents must be an integer ≥ 50 (Stripe minimum)`; otherwise keep existing generic copy.
- Recurring companion branch: `recurring_amount_cents must be an integer ≥ 50 (Stripe minimum for the recurring companion)`.

### Exact write-set

- `src/packages/packages.service.ts`
- `test/packages.service.spec.ts`

### 50-Failures / audit concerns

- Input validation only; no pricing semantic changes.
- Tests must assert exact error code remains `PACKAGE_INVALID` so API clients do not break.

---

## 4) Work-set partition for parallel builders/auditors

Rule: parallelize only when write-sets are file-disjoint. Backend units below are disjoint from each other. Backend and mobile are inherently parallel because they are different repos. Mobile is intentionally one unit because semantic-token migration, preview-as-buyer, public API fix, and pricing UX all overlap on `CoachPackageEditScreen.tsx`, `PackageCheckoutScreen.tsx`, and/or `packagesApi.ts`.

### B1 — Backend package pricing lock + combo error copy

**Repo:** backend.  
**INCLUDE items:** lock-pricing-after-subscriber backend half; PR-14 combo min/max copy.  
**Write-set:**

- `src/packages/packages.service.ts`
- `test/packages.service.spec.ts`

**Build notes:** implement active-recurring-subscriber guard in `PackagesService.update()`; add `PACKAGE_PRICING_LOCKED`; refine min-copy tests.

### B2 — Backend package content scope + display order polish

**Repo:** backend.  
**INCLUDE items:** sub-coach fork-on-attach guard; PR-8 display_order compaction; PR-8 swap-aware patch.  
**Write-set:**

- `src/packages/package-contents.controller.ts`
- `src/packages/package-contents.service.ts`
- `test/package-contents.service.spec.ts`

**Build notes:** preserve actor vs tenant; use `SubCoachScopeService`; keep all display-order mutations under the existing per-package advisory lock.

### B3 — Backend landing-page custom-domain Host routing

**Repo:** backend.  
**INCLUDE items:** custom-domain Host-header TODO.  
**Write-set:**

- `src/landing-pages/landing-pages.public.controller.ts`
- `src/landing-pages/landing-pages.public.service.ts` if wrapper methods are added
- `src/landing-pages/landing-pages.service.ts` only if the existing custom-domain method needs projection changes
- `test/landing-pages.public.controller.spec.ts` or a new focused custom-domain public-route spec

**Build notes:** keep host normalization/security self-contained; do not touch package services.

### B4 — Backend drip dispatcher alert dedup

**Repo:** backend.  
**INCLUDE items:** PR-10 slow-worker/stale-cutoff duplicate-alert dedup.  
**Write-set:**

- `src/packages/drip-dispatcher.cron.ts`
- `test/drip-dispatcher.cron.spec.ts`

**Build notes:** atomic `alert_dispatched_at` claim before send; preserve notify-off semantics.

### M1 — Mobile package/commerce polish bundle

**Repo:** mobile.  
**INCLUDE items:** semantic tokens; preview-as-buyer; public package route/adaptor foundational fix; lock-pricing mobile UX.  
**Write-set:**

- `src/theme/tokens.ts` if adding on-accent token
- `src/theme/ThemeProvider.tsx` if token exposure changes
- `src/api/packagesApi.ts`
- `src/components/PackageSelectionSheet.tsx`
- `src/screens/client/ClientPackagesScreen.tsx`
- `src/screens/client/PackageCheckoutScreen.tsx`
- `src/screens/client/CheckoutReturnScreen.tsx`
- `src/screens/client/BrandedCheckoutWebViewScreen.tsx`
- `src/screens/client/DeliverablesScreen.tsx`
- `src/screens/client/PurchaseUnpackScreen.tsx`
- `src/screens/client/deliverables/dropRow.tsx`
- `src/screens/client/packageDetail/PackageDetailSurface.tsx` (new)
- `src/screens/coach/payments/CoachPackageEditScreen.tsx`
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx`
- `src/screens/coach/payments/CoachPackagesListScreen.tsx`
- `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx`
- relevant `src/__tests__/*` mocks/render tests for touched screens/API

**Build notes:** do not split this unit unless the split is serialized. Any attempt to put semantic tokens in one mobile unit and preview/pricing in another will collide on `CoachPackageEditScreen.tsx` and `PackageCheckoutScreen.tsx`.

### Deferred/no-write items

No builder unit for:

- PR-9 transactional outbox (defer).
- PR-9 splits-outside-tx sweeper (defer; warning already exists).
- PR-9 `tx ?? this.prisma` type-safety cleanup (defer).
- PR-10 real Postgres concurrency harness (defer; unit test only in B4).
- PR-14 guest-conversion `retrieveSubscription` under-tx item (already fixed/no-op).

### Serialization calls

- `B1`, `B2`, `B3`, and `B4` are file-disjoint and may be built/audited in parallel.
- `M1` must serialize all mobile PR-18 work internally because `CoachPackageEditScreen.tsx`, `PackageCheckoutScreen.tsx`, and `packagesApi.ts` are shared by multiple named items.
- Backend `B1` and mobile `M1` share an API contract (`PACKAGE_PRICING_LOCKED`), not files. They can run in parallel once the error-code/copy contract above is frozen.

---

## 5) Recommended build order

1. **Freeze contracts first (short sync, no code):** agree on `PACKAGE_PRICING_LOCKED` response shape and mobile copy; agree on public package adaptor shape for `/v1/packages/public/join/:token`; agree on custom-domain host trust rules.
2. **Start B1 and M1 early:** B1 owns the backend pricing lock contract; M1 owns the foundational mobile public-route fix, pricing UX, preview, and token migration. These are the highest user-visible polish areas.
3. **Run B2/B3/B4 in parallel:** they are backend-disjoint and independently buildable.
4. **Audit B1 before mobile final signoff:** mobile should verify backend error code/copy behavior once B1 lands.
5. **Final integrated checks:** after dependencies are installed, run backend build/tests for touched specs and mobile typecheck/tests. Also run static greps for no hardcoded hex / no scoped `ThemeColors` usage in package/commerce/deliverables files.

## 6) Summary matrix

| Item | Decision | Repo/unit | Reason |
|---|---:|---|---|
| Semantic tokens | INCLUDE | mobile M1 | Authoritative PR-18 named item; scoped legacy usage found. |
| Preview-as-buyer | INCLUDE | mobile M1 | Named item; extract shared buyer surface and disable checkout in preview. |
| Sub-coach fork-on-attach guard | INCLUDE | backend B2 | Named item; exact actor-vs-tenant gap found. |
| Custom-domain Host TODO | INCLUDE | backend B3 | Named item; TODO and verified-domain lookup already present. |
| Lock pricing after active subscriber | INCLUDE | backend B1 + mobile M1 | Named item; no guard today. |
| PR-8 display_order gaps | INCLUDE | backend B2 | Small polish in same locked content-order cluster. |
| PR-8 swap dead-end | INCLUDE | backend B2 | Small polish in same locked content-order cluster. |
| PR-9 transactional outbox | DEFER | none | Too large/cross-cutting for polish; resolver idempotency remains. |
| PR-9 outside-tx sweeper | DEFER | none | Current warn/runbook exists; sweeper is cross-domain ops work. |
| PR-9 tx type safety | DEFER | none | Type hygiene in webhook path; avoid destabilizing PR-18. |
| PR-10 duplicate-alert dedup | INCLUDE | backend B4 | Small atomic idempotency improvement; exact race found. |
| PR-10 real PG concurrency test | DEFER | none/B4 unit-only | Needs DB harness; add deterministic unit in B4. |
| PR-14 retrieveSubscription under tx | DEFER/no-op | none | Named guest-conversion path already pre-resolves before tx. |
| PR-14 combo min/max copy | INCLUDE | backend B1 | Small input-validation copy polish in same pricing file. |
| Foundational mobile share-token route mismatch | INCLUDE | mobile M1 | Current buyer checkout route does not match backend. |
