# AUDIT — PR-18 M1 Mobile package/commerce polish R3 (PR #217)
VERDICT: NOT CLEAN
Pinned SHA: `ed1e4611df91d7d966f794183ca8b1e0e5d82857`
Author required: `Dynasia G <dynasia@trygrowthproject.com>`; no trailers.

Typecheck: inconclusive/fail in local verification. `npm ci` was killed by the harness; after a partial dependency recovery, `npx tsc --noEmit` first failed on missing dependency type files, then on two unchanged non-M1 files (`src/services/sentry.ts`, `src/ui/charts/TgpBarChart.tsx`). A symlink attempt against the known-good main dependency tree OOMed. I am not counting this as an M1 finding.

Lint: fail. `npm run lint -- --quiet` exits 1 on the new `src/__tests__/rootNavigatorCheckoutLink.test.tsx` disable comment for a rule that is not installed/configured.

Tests: fail for full mobile Jest. After dependencies were locally recovered, the touched M1 suites passed (`npx jest <10 changed suites> --runInBand --silent` → 10 suites / 220 tests passing, no `--testTimeout` override). The full command `npx jest --runInBand --silent` fails 3 suites / 21 tests (`purchaseUnpackScreen.test.tsx`, `Day1WinScreen.test.tsx`, `quietLuxuryDoctrine.test.ts`) with 147 suites / 1668 tests passing.

Write-set: mostly expected M1 files plus tests; `src/navigation/RootNavigator.tsx` is outside the strict original M1 source write-set, but this deviation is explicitly justified in `build-reports/PR18_M1_FIX2.md:81-85` as the R2-auditor-mandated remedy for the P1 money-flow fallback.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [src/__tests__/rootNavigatorCheckoutLink.test.tsx:44, .eslintrc.js:25-33] The new RootNavigator checkout-link regression test makes the lint gate fail by disabling `import/first`, but the repo does not install/configure `eslint-plugin-import`; ESLint reports `Definition for rule 'import/first' was not found`. This is a merge-blocking quality issue because the claimed lint gate is red. Fix by removing the disable comment or adding/configuring the plugin intentionally.
- [src/screens/client/PurchaseUnpackScreen.tsx:411-415, src/__tests__/purchaseUnpackScreen.test.tsx:267-293, src/components/PackageSelectionSheet.tsx:166-170, src/__tests__/Day1WinScreen.test.tsx:88-107] The semantic-token migration did not update all existing theme mocks, so full `npx jest --runInBand --silent` is red. `PurchaseUnpackScreen` now destructures `semanticColors`/`tokens`, but `purchaseUnpackScreen.test.tsx` still mocks only `colors`; `PackageSelectionSheet` now destructures `semanticColors`/`tokens`, but `Day1WinScreen.test.tsx` still mocks only `colors` while mounting the package sheet path. Fix the legacy mocks (or provide a shared complete theme mock) so the full suite passes, not just the newly touched suites.
- [src/screens/client/CheckoutReturnScreen.tsx:417-423, src/__tests__/quietLuxuryDoctrine.test.ts:65-74] The checkout peak-end copy adds `fontWeight: '700'` to `successEyebrow`, which violates the repo's quiet-luxury doctrine gate and causes `quietLuxuryDoctrine.test.ts` to fail. This also misses the mobile design bible's restrained-luxury bar: the paid confirmation should feel premium through timing, hierarchy, and calm motion, not a heavier shouting eyebrow. Use an allowed lighter weight (e.g. 500/600 with letterspacing/color) or add a deliberate allowlist entry with design justification if the doctrine owner approves.

## P3 (non-blocking)
- None.

## Verification of R2 fixes
- **P0 empty confirmation:** Functionally verified. `CheckoutReturnScreen` now guards the success haptic with `didCelebrate` so it fires once (`src/screens/client/CheckoutReturnScreen.tsx:172-186`), springs/fades the badge and copy (`src/screens/client/CheckoutReturnScreen.tsx:188-225`), falls back to final values when Reduce Motion is enabled or probing fails (`src/screens/client/CheckoutReturnScreen.tsx:188-197`, `src/screens/client/CheckoutReturnScreen.tsx:227-234`), uses package-specific copy (`src/screens/client/CheckoutReturnScreen.tsx:356-364`), and presents one primary CTA label at a time (`src/screens/client/CheckoutReturnScreen.tsx:340-372`). The implementation is no longer the R2 P0 empty-confirmation anti-pattern, but the `700` eyebrow weight creates the P2 doctrine/test failure above.
- **P1 deep-link prefix:** Verified. `RootNavigator.linking.prefixes` now includes `com.growthproject.app://` while retaining the existing `tgp://` and universal-link prefixes (`src/navigation/RootNavigator.tsx:106-115`), and the checkout return path maps into `CheckoutReturn` with `outcome`/`session_id` parsing (`src/navigation/RootNavigator.tsx:235-240`). The regression test asserts the prefix plus success/cancel routing (`src/__tests__/rootNavigatorCheckoutLink.test.tsx:61-97`), although its lint-disable comment must be fixed.
- **P2 disabled CTA contrast:** Verified. `SemanticTokens` now include `disabledBg` and `textOnDisabled` (`src/theme/tokens.ts:323-335`), with light `#524E47` on `#E0D9CE` = 5.90:1 and dark `#9A958C` on `#2A2723` = 4.99:1 (`src/theme/tokens.ts:351-372`). Both disabled pairs are gated in `scopedTokenGate.test.ts` (`src/__tests__/scopedTokenGate.test.ts:123-132`), and the disabled button surfaces consume those tokens without parent opacity (`src/screens/client/packageDetail/PackageDetailSurface.tsx:88-93`, `src/screens/client/packageDetail/PackageDetailSurface.tsx:286-294`, `src/screens/client/ClientPackagesScreen.tsx:625-630`).
- **P3 flaky CoachPackageContentsScreen tests:** Verified for the targeted path. `jest.setup.js` raises the global Jest timeout to 20s (`jest.setup.js:5-10`), the affected waits now have explicit 10s budgets (`src/__tests__/CoachPackageContentsScreen.test.tsx:265-323`), and `CoachPackageContentsScreen.test.tsx` passed in the no-CLI-timeout touched-suite run.

## Mobile design bible / decacorn review
- **Don Norman visceral level:** The success state now has an immediate check badge, motion, and a success haptic, so the buyer gets stronger sensory closure than the R2 static state (`src/screens/client/CheckoutReturnScreen.tsx:172-225`, `src/screens/client/CheckoutReturnScreen.tsx:344-364`).
- **Don Norman behavioral level:** The screen answers “what happens next” and keeps a single dominant path (`src/screens/client/CheckoutReturnScreen.tsx:360-372`); when deliverables are enabled it adds a quiet secondary home link (`src/screens/client/CheckoutReturnScreen.tsx:373-381`), which is acceptable as an escape hatch but should stay visually subordinate.
- **Don Norman reflective level / restrained luxury:** The package-named headline improves ownership and memory (`src/screens/client/CheckoutReturnScreen.tsx:356-364`), but the heavy `700` eyebrow fails the repo's quiet-luxury doctrine and should be toned down.
- **Apple cognitive de-load:** The success/cancel/error branches keep clear, low-choice states, and Reduce Motion users are not forced through animation (`src/screens/client/CheckoutReturnScreen.tsx:188-197`, `src/screens/client/CheckoutReturnScreen.tsx:287-402`).
- **No overclaiming:** Copy says the coach has been notified and access opens/what happens next, without promising instant fulfillment when the backend is still activating (`src/screens/client/CheckoutReturnScreen.tsx:360-396`).

## Counts
- P0: 0
- P1: 0
- P2: 3
- P3: 0

VERDICT: NOT CLEAN
