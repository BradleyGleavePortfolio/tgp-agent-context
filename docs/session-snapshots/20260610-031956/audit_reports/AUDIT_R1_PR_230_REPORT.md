# AUDIT R1 — PR #230 (EW3 P1 Android Safe-Area Pack)

**Auditor:** GPT-5.5 R1 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** #230 · Branch `feature/ew3-android-safe-area-p1` · Head `c67bab5` · Base `5adba07` (main)
**Worktree:** `/home/user/workspace/tgp/mobile-230-audit` (detached @ `c67bab5`)
**Date:** 2026-06-10

**VERDICT: DIRTY** (one functional layout-regression risk that the PR's own risk note understates)

---

## Executive summary

The two scoped fixes are implemented correctly and cleanly:
- **EW3-001** — the deprecated `RNStatusBar.setBackgroundColor` call is removed; the bone (`#F5EFE4`) band is now painted by a top-inset `View` (`StatusBarBand`) sized to `useSafeAreaInsets().top`, rendered inside a new `SafeAreaProvider`; `expo-status-bar` keeps `style="dark"`.
- **EW3-003** — `ForegroundNotificationBanner` `paddingTop` is now `Math.max(useSafeAreaInsets().top, 12)`, replacing the `Platform.OS === 'ios' ? 44 : 12` magic numbers.

Scope discipline is exact (7 files, all on the allow-list), no dependency bumps, no `app.json` change, and all gates reproduce green (lint 0 errors, typecheck 0 errors, 32 tests pass, 1 snapshot). The PR body covers the triage reference, both deviations, the EW3-002 out-of-scope note, the QA plan, and the "banner not mounted" caveat.

**Why DIRTY and not CLEAN/DIRTY-MINOR:** `StatusBarBand` is rendered as a **layout-occupying flow `View`** (height `insets.top`, not absolutely positioned) at the very top of the app tree — *above* every screen. Many already-shipped screens additionally apply their own top safe-area padding (13 screens import `SafeAreaView` from `react-native-safe-area-context`; others use RN's iOS-only `SafeAreaView`). On those screens the top inset is now consumed **twice** (band height + screen's own top padding → content offset by ~`2 × insets.top`). The PR's risk note claims "cosmetic-only … iOS unchanged," which understates this. This is a plausible functional regression on notched devices that needs device verification, so it exceeds the "cosmetic only" bar for DIRTY-MINOR. (See R1-P1-01.)

---

## Findings

### R1-P1-01 — Layout-occupying band is additive to existing per-screen safe-area padding (functional regression risk)
**Files:** `App.tsx:213-218`, `src/components/StatusBarBand.tsx:13-20`
`StatusBarBand` renders a plain in-flow `View` of `height: insets.top` as the first child of `SafeAreaProvider`, directly above `<ErrorBoundary>` and the whole app tree. It is **not** absolutely positioned, so it occupies vertical layout space and pushes all subsequent content down by `insets.top`.

The previous implementation painted the bone color *behind* the status bar (`RNStatusBar.setBackgroundColor`, Android-only, **no layout offset**) and added no band on iOS. The new band therefore introduces a **new top layout offset that did not exist before**.

Meanwhile, app screens already consume the top inset themselves:
- `src/screens/auth/WelcomeScreen.tsx:8,24` — `SafeAreaView` from `react-native` (applies top padding on iOS; no-op on Android).
- `src/screens/client/HomeScreen.tsx:22,287` — `SafeAreaView`.
- 13 screens import from `react-native-safe-area-context` (consume the provider insets on **both** platforms); 6 screens call `useSafeAreaInsets` directly.

Net effect on inset-consuming screens: content offset ≈ `band height (insets.top)` **+** `screen's own top safe-area padding`, i.e. a double top inset.
- On **iOS** this hits screens using RN `SafeAreaView` (e.g. WelcomeScreen — the exact screen the QA plan targets) and any `react-native-safe-area-context` screen.
- On **Android**, RN `SafeAreaView` is a no-op so those screens are fine, but the 13 `react-native-safe-area-context` screens still double-inset.

The builder's risk note ("Risk: cosmetic-only … iOS unchanged in behaviour") is **inaccurate** for these screens. Recommend either (a) absolutely-position the band as an overlay so it paints behind the status bar without occupying layout, matching the prior no-offset behavior, or (b) device-verify each top-level screen and confirm no double offset before merge. **Requires Android API 30/33/34 + notched-iPhone capture to confirm severity.**

---

### R1-P2-01 — No negative-case (floor) test for `Math.max(insets.top, 12)`
**Files:** `src/components/__tests__/ForegroundNotificationBanner.test.tsx`, `App.test.tsx`
Both tests mock `useSafeAreaInsets()` to return `{ top: 47 }` only. Neither asserts the 12px floor that is the whole point of `Math.max(..., 12)` — i.e. a `top: 0` device should still yield `paddingTop: 12` (banner) and the band should render `height: 0` gracefully. The brief explicitly called out this gap. The implemented logic is correct on inspection; only test coverage of the floor branch is missing.

### R1-P2-02 — "4 suites / 32 tests" count is inflated by incidental pattern matches
**Evidence:** `--testPathPattern='(App|...)'` also matches `scripts/__tests__/validateAppConfig.test.js` and `src/utils/__tests__/appleAuth.test.ts` (both contain "App"). Only **2** of the 4 suites are EW3 tests. The 32-test total is therefore mostly pre-existing tests, not new coverage. Not a false claim (the builder ran the same pattern and reported it transparently), but the headline "32 tests passing" overstates the new test footprint — the EW3-specific assertions are 2 tests.

### R1-P3-01 — `ForegroundNotificationBanner` is not mounted anywhere in the app
**Evidence:** `grep` for `ForegroundNotificationBanner` across `src/` finds only comment references (`src/services/pushNotifications.ts:10`, `src/store/foregroundBannerStore.ts:4`); no JSX mount. The EW3-003 fix is correct but has **zero runtime effect** until the banner is wired in. Acknowledged in the PR body and brief; flagged here per the audit instructions.

### R1-P3-02 — Root-level `App.tsx` / `App.test.tsx` are outside the lint glob
**Evidence:** `package.json` lint script = `eslint "src/**/*.{ts,tsx}" --max-warnings=99999`. Root-level `App.tsx` and `App.test.tsx` are **not** linted. The EW3-001 edits to `App.tsx` therefore received no lint coverage (typecheck does cover them). Pre-existing repo config, not introduced by this PR; noted for completeness. (`--max-warnings=99999` also masks the 82 warnings, again pre-existing.)

---

## Acceptance-check matrix

| # | Check | Result |
|---|-------|--------|
| 1 | EW3-001: `RNStatusBar.setBackgroundColor` removed | PASS — only a comment mentions it; no live call/import (`App.tsx` import line removed) |
| 1 | `SafeAreaProvider` is outermost wrapper | PASS — `App.tsx:213` wraps `<StatusBarBand>` + `<ErrorBoundary>` |
| 1 | `StatusBarBand` renders `View` h=`insets.top`, bg=`#F5EFE4` | PASS — `StatusBarBand.tsx:16-18` |
| 1 | `expo-status-bar` kept `style="dark"` | PASS — `App.tsx` `<StatusBar style="dark" />` retained |
| 2 | EW3-003: `paddingTop = Math.max(insets.top, 12)` | PASS — `ForegroundNotificationBanner.tsx:115` |
| 2 | `useSafeAreaInsets` from `react-native-safe-area-context` | PASS — import added line 22; old `44/12` magic removed from StyleSheet |
| 3 | Scope: only the 7 allow-listed files | PASS — exact match; no OfflineBanner/PlanScreen/charts/biometrics/package.json/app.json |
| 4 | StatusBarBand test mocks insets, asserts band height 47 | PASS — `App.test.tsx` asserts `height===47`, `backgroundColor==='#F5EFE4'` + snapshot |
| 4 | Banner test mocks `{top:47}`, asserts `paddingTop:47` | PASS — `ForegroundNotificationBanner.test.tsx` asserts `paddingTop===47` |
| 4 | Negative case (top=0 → 12px floor) | **FAIL** — not tested (R1-P2-01) |
| 5 | PR body refs triage #11@`41c6186`, EW3-001+003, EW3-002 OOS, both deviations, QA plan, banner-not-mounted | PASS — all present in `PR_BODY.md` |
| 6 | Gates: lint 0 err / typecheck 0 err / 32 tests / no new deps | PASS — reproduced (lint 0 err 82 warn; tsc 0 err; 4 suites/32 tests/1 snapshot; deps unchanged) |

## Gate reproduction (worktree @ c67bab5)
```
npm ci        → clean install, no lockfile change
npm run typecheck → tsc --noEmit, EXIT 0
npm run lint  → ✖ 82 problems (0 errors, 82 warnings), EXIT 0
npm test -- --testPathPattern='(StatusBarBand|ForegroundNotificationBanner|App)'
              → Test Suites: 4 passed; Tests: 32 passed; Snapshots: 1 passed; EXIT 0
```
Snapshot reports "1 passed" (committed), not "1 written" — confirms the snapshot is reproducible from the committed file.

## Recommendation
The two fixes are individually correct and the engineering hygiene is good. **Block on R1-P1-01**: confirm via device capture that the layout-occupying band does not double-offset content on screens that already apply top safe-area padding (start with WelcomeScreen on a notched iPhone and any `react-native-safe-area-context` screen on Android), or convert the band to an absolutely-positioned overlay so it restores the prior no-layout-offset behavior. Correct the PR risk note, which currently claims "cosmetic-only / iOS unchanged." Add the floor-case test (R1-P2-01) before merge.
