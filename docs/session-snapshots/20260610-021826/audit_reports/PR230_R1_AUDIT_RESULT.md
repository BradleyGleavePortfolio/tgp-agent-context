# PR #230 R1 Audit — Verdict Summary

**Verdict: DIRTY** (functional — one layout-regression risk understated by the PR's risk note)

**PR:** #230 · `feature/ew3-android-safe-area-p1` · head `c67bab5` · base `5adba07` · OPEN · +277/−16 · 7 files

## What's correct
- **EW3-001** implemented: `RNStatusBar.setBackgroundColor` removed, `SafeAreaProvider` added as outermost wrapper, `StatusBarBand` paints a `View` (`height: insets.top`, `bg #F5EFE4`), `expo-status-bar style="dark"` retained.
- **EW3-003** implemented: banner `paddingTop = Math.max(useSafeAreaInsets().top, 12)`; old `44/12` magic numbers removed; hook imported from `react-native-safe-area-context`.
- **Scope exact:** only the 7 allow-listed files; no OfflineBanner/PlanScreen/charts/biometrics; no `package.json`/lock; no `app.json`. No new deps.
- **Gates reproduce green:** lint 0 errors (82 pre-existing warnings), typecheck 0 errors, 4 suites / 32 tests / 1 snapshot pass.
- **PR body complete:** triage #11@`41c6186`, EW3-001+003, EW3-002 OOS note, both deviations (SafeAreaProvider added, StatusBarBand extracted), QA plan, banner-not-mounted caveat.

## Why DIRTY
**R1-P1-01:** `StatusBarBand` is an in-flow, layout-occupying `View` (not absolutely positioned) placed above the entire app tree, adding a NEW top offset of `insets.top` that did not exist before (the old approach painted behind the status bar with no layout cost). 13 screens consume `react-native-safe-area-context` insets and others use RN `SafeAreaView`, so on those screens the top inset is now applied twice (≈ `2 × insets.top`). The PR's "cosmetic-only / iOS unchanged" risk note is inaccurate. Needs device verification or conversion to an absolute overlay.

## Other findings
- **R1-P2-01:** No floor-case test (`insets.top: 0 → paddingTop: 12`); both tests only use `top: 47`. (Brief flagged this.)
- **R1-P2-02:** "32 tests" inflated — 2 of 4 matched suites are incidental (`validateAppConfig`, `appleAuth` match "App"); only 2 EW3 tests are new.
- **R1-P3-01:** `ForegroundNotificationBanner` is never mounted (comment refs only) — fix has no runtime effect yet (acknowledged).
- **R1-P3-02:** Root `App.tsx`/`App.test.tsx` fall outside the `src/**` lint glob (pre-existing config).

## Action before merge
1. Resolve R1-P1-01 (overlay the band, or device-verify no double-offset on WelcomeScreen/Android safe-area screens) and fix the risk note.
2. Add the 12px-floor test.

Deliverables: `AUDIT_R1_PR_230_REPORT.md` (full), this summary, and PR comment via `gh api`.
