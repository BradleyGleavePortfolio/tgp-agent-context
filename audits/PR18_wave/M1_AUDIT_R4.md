# AUDIT — PR-18 M1 Mobile package/commerce polish R4 (PR #217)
VERDICT: CLEAN
Pinned SHA: `dab2dd67760d03d75fb248f7e367c7f4f4f217b6`
Branch audited: `pr18/m1-mobile-commerce-polish`
Author required/verified: `Dynasia G <dynasia@trygrowthproject.com>`; no commit trailers.

Typecheck: pass — `npx tsc --noEmit` exited 0.
Lint: pass — `npm run lint -- --quiet` exited 0.
Tests: pass for the required M1 command — 12 suites / 268 tests passed with:

```bash
npx jest \
  src/__tests__/BrandedCheckoutWebViewScreen.test.tsx \
  src/__tests__/CheckoutReturnScreen.success.test.tsx \
  src/__tests__/CoachPackageContentsScreen.test.tsx \
  src/__tests__/CoachPackageEditScreen.lockPreview.test.tsx \
  src/__tests__/Day1WinScreen.test.tsx \
  src/__tests__/PackageCheckoutScreen.buyer.test.tsx \
  src/__tests__/PackageDetailSurface.preview.test.tsx \
  src/__tests__/deliverablesScreen.test.tsx \
  src/__tests__/purchaseUnpackScreen.test.tsx \
  src/__tests__/rootNavigatorCheckoutLink.test.tsx \
  src/__tests__/scopedTokenGate.test.ts \
  src/api/__tests__/paymentsApi.test.ts \
  --runInBand --silent
```

Additional doctrine check: `npx jest src/__tests__/quietLuxuryDoctrine.test.ts --runInBand --silent` no longer reports the M1 `fontWeight: '700'` failure. The suite still exits 1 on the pre-existing `src/screens/coach/payments/contents/ContentAttachForm.tsx:476` TODO, which is unchanged from `origin/main` and outside this M1 write-set.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## Verification of R3 P2 fixes
- **Lint gate / bad eslint-disable-line:** Verified fixed. `src/__tests__/rootNavigatorCheckoutLink.test.tsx:44-49` now uses a plain explanatory comment before the post-mock `import { linking }` and does not include the unknown `eslint-disable-line import/first` directive. `npm run lint -- --quiet` exits 0.
- **Stale semantic-token theme mocks:** Verified fixed. `src/__tests__/purchaseUnpackScreen.test.tsx:267-299` and `src/__tests__/Day1WinScreen.test.tsx:88-118` now use the canonical real-token mock pattern with `jest.requireActual('../theme/tokens').default`, `tokens: realTokens`, `semanticColors: realTokens.lightTokens`, and `colorScheme: 'light'` while preserving legacy `colors` fields needed by older test paths.
- **CheckoutReturn successEyebrow doctrine:** Verified fixed. `src/screens/client/CheckoutReturnScreen.tsx:417-423` sets `successEyebrow.fontWeight` to `'600'`; static scoped-file grep found no `fontWeight: '700'` or `fontWeight: '800'` in the M1 scoped files.

## Tooling evidence
- Worktree was pinned with `git worktree add /home/user/workspace/r4-audit-m1 dab2dd67`; audited HEAD resolved to `dab2dd67760d03d75fb248f7e367c7f4f4f217b6`.
- Dependencies were made available by symlinking the already-installed `node_modules` from `/home/user/workspace/repos/growth-project-mobile`; `package.json` and `package-lock.json` matched byte-for-byte between the source checkout and the audit worktree.
- `npx tsc --noEmit` passed.
- `npm run lint -- --quiet` passed.
- The 12 required M1 Jest suites passed: 12/12 suites, 268/268 tests.
- `git diff --check origin/main...HEAD` passed.

## Write-set verification
Changed files versus `origin/main` are M1 package/commerce/deliverables files, scoped tests, and two previously justified support files:

- `jest.setup.js`
- `src/__tests__/BrandedCheckoutWebViewScreen.test.tsx`
- `src/__tests__/CheckoutReturnScreen.success.test.tsx`
- `src/__tests__/CoachPackageContentsScreen.test.tsx`
- `src/__tests__/CoachPackageEditScreen.lockPreview.test.tsx`
- `src/__tests__/Day1WinScreen.test.tsx`
- `src/__tests__/PackageCheckoutScreen.buyer.test.tsx`
- `src/__tests__/PackageDetailSurface.preview.test.tsx`
- `src/__tests__/deliverablesScreen.test.tsx`
- `src/__tests__/purchaseUnpackScreen.test.tsx`
- `src/__tests__/rootNavigatorCheckoutLink.test.tsx`
- `src/__tests__/scopedTokenGate.test.ts`
- `src/api/__tests__/paymentsApi.test.ts`
- `src/api/packagesApi.ts`
- `src/components/PackageSelectionSheet.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/screens/client/BrandedCheckoutWebViewScreen.tsx`
- `src/screens/client/CheckoutReturnScreen.tsx`
- `src/screens/client/ClientPackagesScreen.tsx`
- `src/screens/client/DeliverablesScreen.tsx`
- `src/screens/client/PackageCheckoutScreen.tsx`
- `src/screens/client/PurchaseUnpackScreen.tsx`
- `src/screens/client/deliverables/dropRow.tsx`
- `src/screens/client/packageDetail/PackageDetailSurface.tsx`
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx`
- `src/screens/coach/payments/CoachPackageEditScreen.tsx`
- `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx`
- `src/screens/coach/payments/CoachPackagesListScreen.tsx`
- `src/theme/tokens.ts`

`src/navigation/RootNavigator.tsx` remains outside the original strict source list but is the R2-auditor-mandated deep-link fallback fix. `jest.setup.js` is the R3-documented timeout support change for the scoped mobile Jest harness. No unrelated files were changed.

## Verification of PR claims / mobile 50-failures subset
- **Public package share-token route:** Verified. `publicPackagesApi.getByShareToken()` calls `GET /v1/packages/public/join/:token` with `encodeURIComponent`, rejects malformed tokens before network, and adapts the backend snake_case payload to `PublicPackageView` (`src/api/packagesApi.ts:214-276`, `src/api/packagesApi.ts:523-538`). Backend contract exists at `growth-project-backend/src/storefront/storefront-public.controller.ts:63,124` and `storefront.service.ts:178-183`.
- **Checkout session route / redirect shape:** Verified. `publicPackagesApi.createCheckoutSession()` posts to `/v1/checkout/sessions` with `package_id`, `success_url`, `cancel_url`, and an idempotency header (`src/api/packagesApi.ts:540-561`). Backend accepts `POST /v1/checkout/sessions` and the `com.growthproject.app://` prefix (`growth-project-backend/src/checkout/checkout.controller.ts:30-38`, `:82-115`).
- **Checkout return confirmation:** Verified. `CheckoutReturnScreen` calls `clientPaymentsApi.confirmCheckoutSession(sessionId)` on success and falls back to `getPaymentStatus()` when needed, with no swallowed 404-as-empty path in this screen (`src/screens/client/CheckoutReturnScreen.tsx:81-134`). Backend confirm route exists at `GET /v1/checkout/sessions/:sessionId/confirm` (`growth-project-backend/src/checkout/checkout.controller.ts:217-247`).
- **Deep-link fallback:** Verified. `RootNavigator.linking.prefixes` includes `com.growthproject.app://`, retains `tgp://` and the universal-link prefix, and maps `checkout/:outcome` to `CheckoutReturn` with `session_id` parsing (`src/navigation/RootNavigator.tsx:106-115`, `:235-240`).
- **Preview-as-buyer safety:** Verified. `PackageDetailSurface` is shared between buyer and coach preview; preview mode shows the disabled-checkout banner and never wires `onPress` to checkout (`src/screens/client/packageDetail/PackageDetailSurface.tsx:82-107`, `:152-159`). `CoachPackageEditScreen` renders preview with `mode="coachPreview"`, does not call `createCheckoutSession`, and builds the preview from draft/original state without a share-token fetch (`src/screens/coach/payments/CoachPackageEditScreen.tsx:487-610`).
- **Buyer checkout path:** Verified. `PackageCheckoutScreen` validates the share token, loads via `getByShareToken`, uses the returned package UUID for `createCheckoutSession(pkg.id)`, validates the returned Stripe URL, and opens `BrandedCheckoutWebView` with the matching `PACKAGE_CHECKOUT_RETURN_SCHEME` (`src/screens/client/PackageCheckoutScreen.tsx:89-140`, `:147-204`).
- **Pricing lock UX:** Verified. Existing packages with subscribers show the requested lock copy without front-end over-disabling price/billing controls, and `PACKAGE_PRICING_LOCKED` save errors show the actionable backend-owned lock explanation (`src/screens/coach/payments/CoachPackageEditScreen.tsx:172-230`, `:410-442`).
- **Semantic token / hardcoded color gate:** Verified. Scoped package/commerce/deliverables files contain no raw hex literals and no `ThemeColors` references; `scopedTokenGate.test.ts` enforces this across the M1 scoped files (`src/__tests__/scopedTokenGate.test.ts:48-91`).
- **Disabled CTA contrast:** Verified. `SemanticTokens` expose `disabledBg` and `textOnDisabled`; comments and tests lock the light contrast at ~5.90:1 and dark contrast at ~4.99:1 (`src/theme/tokens.ts:323-355`, `src/theme/tokens.ts:358-373`, `src/__tests__/scopedTokenGate.test.ts:123-132`).
- **IDOR / invented IDs:** Verified for the mobile surface. Public package adaptation sets `coach.id` to `null` because the anonymous storefront payload does not expose it, and checkout uses only the backend-returned package UUID (`src/api/packagesApi.ts:200-209`, `:255-275`; `src/screens/client/PackageCheckoutScreen.tsx:152-160`).
- **Error mapping / no fake empty states:** Verified. Package checkout invalid/404/configuration failures render actionable errors, not synthesized success or benign empty states (`src/screens/client/PackageCheckoutScreen.tsx:96-136`, `:205-222`).
- **Diff hygiene:** `git diff --check origin/main...HEAD` passed.

## Mobile design bible / decacorn review
- **Don Norman visceral:** The paid success state uses a single success haptic, a springing check badge, and a measured content reveal, with Reduce Motion users taken immediately to final state (`src/screens/client/CheckoutReturnScreen.tsx:61-73`, `:172-237`, `:335-383`).
- **Don Norman behavioral:** The confirmation screen explains what happened and gives one primary next step; the optional home link appears only when the richer unpack path is available and remains secondary (`src/screens/client/CheckoutReturnScreen.tsx:335-383`).
- **Don Norman reflective / restrained luxury:** The success copy names the purchased package when available, avoids trophy/confetti/emoji, and uses `600` maximum weight in the scoped M1 files, so the screen reads premium through hierarchy, timing, and calm copy rather than shouting typography (`src/screens/client/CheckoutReturnScreen.tsx:356-364`, `:417-423`).
- **Apple cognitive de-load:** Buyer, preview, cancel, loading, confirmation-pending, and activation-pending states each keep a small number of clear actions and avoid exposing backend/Stripe internals directly to the user (`src/screens/client/PackageCheckoutScreen.tsx:243-263`, `src/screens/client/CheckoutReturnScreen.tsx:287-402`, `src/screens/client/packageDetail/PackageDetailSurface.tsx:98-181`).
- **No overclaiming:** Success copy says the spot is confirmed and the coach has been notified; pending states say activation opens within a few minutes rather than promising instant fulfillment (`src/screens/client/CheckoutReturnScreen.tsx:360-396`).

## Counts
- P0: 0
- P1: 0
- P2: 0
- P3: 0

VERDICT: CLEAN
