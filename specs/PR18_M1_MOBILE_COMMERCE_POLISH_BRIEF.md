# PR-18 / M1 — Mobile package/commerce polish bundle

**Repo:** growth-project-mobile (RN/Expo SDK 56). **Off mobile main `6b6f820`.** Builder = Opus 4.8.
**Source plan:** `specs/PR18_EXPANSION_PLAN.md` §2.1, §2.2, §2.5(mobile), §1.3, §4(M1).
**UI Bible** (`/home/user/workspace/UI_BIBLE.txt`): brand cream `#F5EFE4`, forest `#2C4A36`, Cormorant Garamond/Inter, NO emoji, NO hardcoded hex (use `useTheme()`).

## Write-set (STRICT — this is ONE serialized unit; touch ONLY these)
- `src/theme/tokens.ts` (only if adding on-accent token)
- `src/theme/ThemeProvider.tsx` (only if token exposure changes)
- `src/api/packagesApi.ts`
- `src/components/PackageSelectionSheet.tsx`
- `src/screens/client/ClientPackagesScreen.tsx`
- `src/screens/client/PackageCheckoutScreen.tsx`
- `src/screens/client/CheckoutReturnScreen.tsx`
- `src/screens/client/BrandedCheckoutWebViewScreen.tsx`
- `src/screens/client/DeliverablesScreen.tsx`
- `src/screens/client/PurchaseUnpackScreen.tsx`
- `src/screens/client/deliverables/dropRow.tsx`
- `src/screens/client/packageDetail/PackageDetailSurface.tsx` (NEW)
- `src/screens/coach/payments/CoachPackageEditScreen.tsx`
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx`
- `src/screens/coach/payments/CoachPackagesListScreen.tsx`
- `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx`
- relevant `src/__tests__/*` mocks/render tests for touched screens/API

Do NOT split into parallel sub-units — semantic tokens, preview, public-route fix, and pricing UX all overlap on `CoachPackageEditScreen.tsx`, `PackageCheckoutScreen.tsx`, `packagesApi.ts`.

## Item 0 (FOUNDATIONAL — do first) — Fix public package share-token route mismatch
Mobile `publicPackagesApi.getByShareToken()` (~`packagesApi.ts:436-444`) requests `GET /v1/packages/:shareToken` (TODO route, not deployed). Backend route is actually `/v1/packages/public/join/:token` (`storefront-public.controller.ts:63,119-127`) with snake_case response (`package_id`, `package_name`, `price_cents`, `billing_cycle`, `coach.display_name`; `storefront.service.ts:177-205`).
→ Change `getByShareToken()` to call `/v1/packages/public/join/:token` and ADAPT backend snake_case into the camelCase `PublicPackageView` model before consumers use it.

## Item 1 — Semantic token migration
Migrate scoped package/commerce/deliverables surfaces off legacy `ThemeColors`/`const { colors } = useTheme()` to `semanticColors` (+ `tokens` families). Pattern:
- `const { semanticColors, tokens } = useTheme();`
- `const styles = useMemo(() => makeStyles(semanticColors, tokens), [semanticColors, tokens]);`
Map roles deliberately: backgrounds→`bgPrimary`/`bgSurface`; body/heading→`textPrimary`; secondary/meta→`textMuted`; borders→`border`; primary CTA/icon/accent→`accent` (or a named `tokens.colors.forest`/`tokens.brand[600]` if UI Bible requires forest — never a literal hex).
- Remove all hardcoded hex (e.g. `#fff` in `ClientPackagesScreen.tsx:95,348,471,511,512,514,561`). For on-accent text, ADD a `textOnAccent`/`accentOn` semantic role to `tokens.ts` (and surface via `ThemeProvider.tsx` if needed) rather than leaving literals.
- Make Cormorant/Inter explicit via `tokens.typography` for package titles, buyer hero title, editor headings using ad hoc fonts.
- Update test mocks providing `useTheme()` to include `semanticColors` (e.g. `deliverablesScreen.test.tsx:212-213`, `CoachPackageContentsScreen.test.tsx:83-86`).
- Files per plan §2.1 (all the scoped screens listed in the write-set above).

## Item 2 — Preview-as-buyer
1. Extract presentational buyer detail into NEW `src/screens/client/packageDetail/PackageDetailSurface.tsx`. Input: normalized `package` (`id,title,description,priceCents,currency,billingInterval,trialDays,features,coach`), `mode: 'buyer'|'coachPreview'`, `onPay` (buyer only).
2. `PackageCheckoutScreen` keeps share-token loading + payment creation, renders `PackageDetailSurface mode="buyer"`.
3. `CoachPackageEditScreen` adds a "Preview as buyer" action near share/manage/subscriber actions (~`:413-498`); opens modal/sheet rendering `PackageDetailSurface mode="coachPreview"` using saved `original` + local draft fields if dirty.
4. Coach preview MUST NOT call `createCheckoutSession`, MUST NOT show a functional pay CTA; show copy: "Buyer preview — checkout is disabled for coaches."

## Item 3 — Lock-pricing mobile UX (pairs with backend B1 contract `PACKAGE_PRICING_LOCKED`)
1. Editing existing package with `original.subscriberCount > 0` → helper copy under price/billing: "Pricing is locked after subscribers join. Create a new package for new pricing."
2. Do NOT over-disable fields based on total `subscriberCount` alone (one-time historical buyers ≠ active recurring). Handle the error on save.
3. On `PACKAGE_PRICING_LOCKED` response, show: "Pricing is locked because this package already has active subscribers. Create a new package for new pricing; you can still edit name, description, deliverables, and availability."

## 50-Failures / audit concerns
- No hardcoded hex / no legacy `ThemeColors` in scoped files (static grep gate). Contrast AA for accent/on-accent + muted on cream.
- Preview mode must not invoke checkout. Buyer and preview share presentation code (no forked visuals). No extra network fetch for preview when editor already has `original`. Mobile must not invent package IDs / bypass share-token validation (IDOR backend-owned).
- No behavior changes to checkout/content delivery/permissions while restyling.

## Tests
- `getByShareToken()` adapts backend snake_case → `PublicPackageView` and rejects invalid tokens.
- `PackageCheckoutScreen` shows pay CTA in buyer mode. Coach preview shows banner/disabled CTA and does NOT call `createCheckoutSession`.
- Jest render/snapshot for `PackageCheckoutScreen`, `ClientPackagesScreen`, `DeliverablesScreen`, `CoachPackageContentsScreen`, `CoachPackageEditScreen` with `semanticColors` mocks.
- Static grep gate on scoped files: no `#[0-9a-fA-F]{3,8}` literals (except sanctioned token-file comments), no `ThemeColors` imports.

## Doctrine
- Commit (R4 STRICT, NO trailers): `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit -m "..."`.
- Push every ~2 min to `pr18/m1-mobile-commerce-polish` (R61). `api_credentials=["github"]` for all git. Bar = CLEAN P0/P1/P2. App Store ready, no feature flag.
