# AUDIT — PR-18 M1 Mobile package/commerce polish (PR #217)
VERDICT: NOT CLEAN
Typecheck: pass (`npx tsc --noEmit`, exit 0)
Lint: not run (not requested for this audit)
Tests: pass (`npx jest` targeted touched suites, 8 suites / 204 tests passing)
Static grep: source scoped files pass for raw hex and `ThemeColors`; raw grep over tests additionally matches only comments in the grep-gate tests.

Pinned HEAD: verified `c6284579d2770f67c59ee5867b056d294797393b`.
Write-set: respected. Diff against `origin/main...c6284579` is limited to the M1 source files plus relevant touched tests.

## P0 findings
- [src/screens/client/PackageCheckoutScreen.tsx:151, src/api/packagesApi.ts:35, src/api/packagesApi.ts:536, src/screens/client/PackageCheckoutScreen.tsx:190, src/screens/client/BrandedCheckoutWebViewScreen.tsx:161] Public package checkout mints sessions with the default `growthproject://checkout/return` / `growthproject://checkout/cancel` redirects, but the webview for this flow is configured with `returnScheme: 'tgp'` and only intercepts `<scheme>://checkout/success` or `<scheme>://checkout/cancel`. This means a successful Stripe payment from the public share-link buyer flow will not be routed to `CheckoutReturn` for confirmation; the money flow can complete while the app remains stuck on an unhandled custom-scheme return. Fix by aligning the public checkout session redirect URLs and the webview return scheme, e.g. pass explicit `com.growthproject.app://checkout/success?session_id={CHECKOUT_SESSION_ID}` / `com.growthproject.app://checkout/cancel` (or another app-registered scheme) to `createCheckoutSession` and use the same scheme in `BrandedCheckoutWebView`.

## P1 findings
- None.

## P2 findings
- [src/theme/tokens.ts:325, src/theme/tokens.ts:328, src/theme/tokens.ts:329, src/theme/tokens.ts:330, src/theme/tokens.ts:340, src/theme/tokens.ts:341, src/screens/client/packageDetail/PackageDetailSurface.tsx:257, src/screens/client/packageDetail/PackageDetailSurface.tsx:289] The semantic-token contrast requirement is not met. Using the token values in `tokens.ts`, dark-mode `textOnAccent` (`#1A1714`) on dark-mode `accent` (`#B43C3C`) is about 3.1:1, below WCAG AA body-text contrast; light-mode `textMuted` (`#78736E`) on cream/bone (`#F5EFE4`) is about 4.1:1, also below AA for the small 12–13px muted text used across the package detail surface. Fix by changing the semantic tokens to AA-compliant values (or limiting failed pairs to large/non-text-only roles) and add a test/calculation gate so the documented ratios cannot drift.

## P3 (non-blocking)
- Targeted Jest passes, but the run emits existing React `act(...)` warnings from touched suites. These do not fail the audit tooling but should be cleaned up separately.

## Verification of PR claims
- Public route fix: mostly verified. `getByShareToken()` validates malformed tokens before the network, calls `/v1/packages/public/join/:token`, adapts snake_case public payloads into `PublicPackageView`, and does not invent coach ids [src/api/packagesApi.ts:515, src/api/packagesApi.ts:519, src/api/packagesApi.ts:240, src/api/packagesApi.ts:253]. The checkout-return URL mismatch above still blocks the end-to-end public buyer money flow.
- Semantic token migration: source scoped files have no raw hex literals and no `ThemeColors` references. However, the AA contrast requirement is false for the token pairs listed in P2.
- Preview-as-buyer: verified. `PackageCheckoutScreen` and `CoachPackageEditScreen` share `PackageDetailSurface`; coach preview renders `mode="coachPreview"`, does not pass `onPay`, disables the CTA, and the editor source does not call `createCheckoutSession` or `getByShareToken` [src/screens/client/PackageCheckoutScreen.tsx:244, src/screens/coach/payments/CoachPackageEditScreen.tsx:610, src/screens/client/packageDetail/PackageDetailSurface.tsx:145, src/screens/client/packageDetail/PackageDetailSurface.tsx:148].
- Lock-pricing UX: verified. The helper copy appears when `original.subscriberCount > 0`, price/billing fields remain editable, and `PACKAGE_PRICING_LOCKED` maps to the specified actionable alert [src/screens/coach/payments/CoachPackageEditScreen.tsx:343, src/screens/coach/payments/CoachPackageEditScreen.tsx:397, src/screens/coach/payments/CoachPackageEditScreen.tsx:416, src/screens/coach/payments/CoachPackageEditScreen.tsx:215].

VERDICT: NOT-CLEAN
