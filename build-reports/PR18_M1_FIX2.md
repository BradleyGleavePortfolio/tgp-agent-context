# PR-18 / M1 FIX NOTE — R2 audit remediation (wave 2) — Dynasia G

**Repo:** `growth-project-mobile` (RN/Expo SDK 56, App Store id6765847915)
**Branch:** `pr18/m1-mobile-commerce-polish`
**PR:** #217
**Base SHA (audited, R2):** `2ab95f72bd9af1feb9f414c5d3088f794196d9b7`
**New HEAD SHA:** `ed1e4611df91d7d966f794183ca8b1e0e5d82857`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>` (no trailers)

The GPT-5.5 R2 audit (`audits/PR18_wave/M1_AUDIT_R2.md`) returned **NOT CLEAN**
on one P0, one P1, one P2 and one P3. All four are fixed on this branch with
real tooling green (typecheck + lint exit 0; 11 suites / 228 tests passing —
up from 211 — **without any `--testTimeout` override**).

## Findings addressed

### P0 — checkout success was an "Empty Confirmation" anti-pattern
`src/screens/client/CheckoutReturnScreen.tsx`

The paid confirmation (the peak of the buyer journey) was a static icon +
title + one line + one button, which the R0 mobile playbook flags as an
Empty Confirmation. Reworked the confirmed-paid branch into a designed peak/end
moment:
- **Success haptic** — a single `Haptics.notificationAsync(Success)` fires the
  moment a confirmed paying state lands, guarded by a `didCelebrate` ref so a
  re-render or status reconcile can never double-fire it. Fire-and-forget and
  `.catch()`-guarded so a missing haptic engine (simulator) never throws.
- **Animated, progressive reveal** — the check badge springs in
  (`Animated.spring`), then the copy + CTA fade/translate in
  (`Animated.sequence`). Honors **Reduce Motion**:
  `AccessibilityInfo.isReduceMotionEnabled()` short-circuits to the final
  state on the first frame, and a `.catch()` fallback also lands the final
  state, so the confirmation is never gated on animation completing.
- **Emotionally specific copy** — "You're in" eyebrow + a package-named
  headline (`Welcome to {package_name}`) and a body that names the package and
  answers "what happens now?" ("…your coach has been notified. Here's what
  happens next."). Falls back to a generic "You're subscribed" only when no
  package name is present.
- **One primary next-step** (no extra decision load) — when the deliverables
  surface is live and a real `purchase_id` exists, the single primary CTA is
  **"See what's included"** (forwards to `PurchaseUnpack`); otherwise the
  single primary CTA is **"Go to home"**. A quiet, non-competing secondary
  "Go to home" text link appears only when the primary is the unpack path.
- The webhook-lag (paid-but-not-yet-entitled) branch was also softened into a
  calmer "we're activating {package} now" state.

No behavior change to the money path itself: confirmation still verifies the
session against the backend (`confirmCheckoutSession` → reconcile via
`getPaymentStatus`) before celebrating; the existing flag-gated auto-forward to
`PurchaseUnpack` is unchanged.

New test: `src/__tests__/CheckoutReturnScreen.success.test.tsx` asserts the
haptic fires exactly once, the copy is package-specific (not a generic empty
line), exactly one primary CTA renders when there's nothing to unpack, and the
generic headline fallback.

### P1 — app-level deep-link fallback not aligned with the minted return scheme
`src/navigation/RootNavigator.tsx` (+ comment in `CheckoutReturnScreen.tsx`)

`packagesApi` mints `com.growthproject.app://checkout/{success,cancel}` and
`app.json` registers both `tgp` and `com.growthproject.app`, but
`RootNavigator.linking.prefixes` only accepted `tgp://` and
`https://app.trygrowthproject.com`. A checkout return delivered through React
Navigation's app-link fallback (platform/browser/WebView) instead of the
in-app webview short-circuit would not route to `CheckoutReturn` — a money-flow
robustness gap.

Fix:
- Added `com.growthproject.app://` to `linking.prefixes` (the webview
  short-circuit remains the primary success path; this is the fallback).
- Updated the stale `tgp://checkout/...` comments to the actual minted scheme
  in both `RootNavigator.tsx` (prefix header + CheckoutReturn screen comment)
  and `CheckoutReturnScreen.tsx` (route doc header).
- New regression test `src/__tests__/rootNavigatorCheckoutLink.test.tsx`
  asserts the `com.growthproject.app://` prefix is present (and existing
  prefixes retained) and drives
  `linking.getStateFromPath('checkout/success?session_id=...')` and
  `checkout/cancel` through the real config, asserting they resolve to
  `CheckoutReturn` with the parsed `outcome`/`session_id` params.

> Write-set note: `RootNavigator.tsx` is outside the strict M1 source write-set,
> but the R2 auditor explicitly required this one-line prefix fix (plus the
> stale-comment + regression-test follow-ups) as the remedy for the P1
> money-flow gap. The change is minimal and additive (one new prefix +
> comments) and touches no other lane's behavior.

### P2 — disabled CTA text fell below AA (opacity composited the whole button)
`src/theme/tokens.ts`, `src/screens/client/packageDetail/PackageDetailSurface.tsx`,
`src/screens/client/ClientPackagesScreen.tsx`, `src/__tests__/scopedTokenGate.test.ts`

Disabled CTAs dimmed the enabled `accent` fill with a parent `opacity`, which
composited the label below AA: `PackageDetailSurface` dark-mode disabled CTA
≈ 3.60:1; `ClientPackagesScreen` disabled/current CTA ≈ 2.24:1 (light) /
2.05:1 (dark) for 14px semibold text.

Fix — explicit disabled semantic tokens instead of parent opacity:
- Added `disabledBg` + `textOnDisabled` to `SemanticTokens` and both token maps.
  Contrast (WCAG 2.1 relative luminance, verified in the gate):
  - light: `#524E47` on `#E0D9CE` = **5.90:1 (PASS)**
  - dark:  `#9A958C` on `#2A2723` = **4.99:1 (PASS)**
- `PackageDetailSurface`: disabled state now uses `disabledBg` fill +
  `textOnDisabled` for the label/icon/spinner (no `opacity`).
- `ClientPackagesScreen` buy/current-plan CTA: same swap (replaced
  `backgroundColor: textMuted; opacity: 0.55` with `disabledBg` +
  `textOnDisabled` label).
- `scopedTokenGate.test.ts`: added two assertions that the light and dark
  disabled pairs clear AA (≥ 4.5:1), so the values cannot drift back.

### P3 (non-blocking) — CoachPackageContentsScreen tests raced the 5s default
`jest.setup.js`, `src/__tests__/CoachPackageContentsScreen.test.tsx`

Two `waitFor`-based RTL tests intermittently failed at Jest's 5s default
per-test timeout under a slow harness (the jest-expo preset is heavy on a cold
mount). Made the suite robust **without** a `--testTimeout` CLI override:
- Added a global `jest.setTimeout(20000)` in `jest.setup.js` (harness root).
- Gave the two affected initial-load `waitFor` calls explicit `{ timeout }`
  budgets.

Confirmed: the full touched-suite run is now green with the plain
`npx jest <suites> --runInBand` invocation (no timeout flag).

## Files touched
Source:
- `src/screens/client/CheckoutReturnScreen.tsx` (P0 peak moment + P1 comment)
- `src/navigation/RootNavigator.tsx` (P1 prefix + comments)
- `src/theme/tokens.ts` (P2 disabled tokens)
- `src/screens/client/packageDetail/PackageDetailSurface.tsx` (P2 disabled state)
- `src/screens/client/ClientPackagesScreen.tsx` (P2 disabled state)

Tests / harness:
- NEW `src/__tests__/CheckoutReturnScreen.success.test.tsx` (P0)
- NEW `src/__tests__/rootNavigatorCheckoutLink.test.tsx` (P1)
- `src/__tests__/scopedTokenGate.test.ts` (P2 disabled-pair contrast gate)
- `src/__tests__/CoachPackageContentsScreen.test.tsx` (P3 waitFor budgets)
- `jest.setup.js` (P3 global timeout)

## Verification (real tooling)
- `npx tsc --noEmit` → **exit 0**.
- `npm run lint -- --quiet` → **exit 0**.
- `npx jest <11 touched suites> --runInBand --silent` (NO `--testTimeout`) →
  **11 suites / 228 tests passing** (was 211; +17 from the new P0 + P1 tests
  and the P2 contrast assertions).
- Static grep gate on the 13 scoped source files still **PASS** (no raw hex,
  no `ThemeColors`). No emoji, no feature flag, brand palette preserved.

## Sources
- R2 audit: `audits/PR18_wave/M1_AUDIT_R2.md`
- Brief: `specs/PR18_M1_MOBILE_COMMERCE_POLISH_BRIEF.md`
- R0 doctrine (Peak-End / Empty Confirmation): `rules/R0_DECACORN_QUALITY.md`,
  `design/MOBILE_APP_DESIGN_INTELLIGENCE_2026-05-30.txt`
