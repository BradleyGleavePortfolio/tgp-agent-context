# Audit Cycle — Step 01: PR #230 R1 Audit Complete

**Date:** 2026-06-09 17:12 PDT
**PR:** #230 — EW3 P1 Android safe-area pack
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**Branch:** `feature/ew3-android-safe-area-p1` · Head `c67bab5` · Base `5adba07`
**Auditor:** GPT-5.5 (subagent id `pr_230_r1_audit_ew3_safe_area_mq7b6q52`)
**Worktree used:** `/home/user/workspace/tgp/mobile-230-audit` (detached @ `c67bab5`)

## Verdict: DIRTY (functional)

| Severity | Count | Codes |
|---|---|---|
| R1-P0 | 0 | — |
| R1-P1 | 1 | R1-P1-01 |
| R1-P2 | 2 | R1-P2-01, R1-P2-02 |
| R1-P3 | 2 | R1-P3-01, R1-P3-02 |

## What's correct (verified)
- EW3-001 fix implemented: `RNStatusBar.setBackgroundColor` removed; `SafeAreaProvider` added as outermost wrapper; `StatusBarBand` component renders a `View` of `height: insets.top` with `bg #F5EFE4`; `expo-status-bar style="dark"` retained.
- EW3-003 fix implemented: `ForegroundNotificationBanner` `paddingTop = Math.max(useSafeAreaInsets().top, 12)`; old `44/12` magic numbers removed; hook imported.
- Scope discipline: exactly the 7 allow-listed files touched. No OfflineBanner, PlanScreen, charts, biometric files modified. No `package.json`/`package-lock.json` bump. No `app.json` change.
- Gates reproduce green in the audit worktree: lint 0 errors (82 pre-existing warnings unrelated), typecheck 0 errors, 4 suites / 32 tests / 1 snapshot all pass.
- PR body content complete: triage PR #11 @ `41c6186`, items EW3-001 + EW3-003, EW3-002 out-of-scope note, both deviations called out, QA plan, banner-not-mounted caveat.

## Why DIRTY — R1-P1-01 (layout regression)

**The new `StatusBarBand` is rendered as an in-flow `View` (not absolutely positioned) above the entire app tree.** The previous approach (`RNStatusBar.setBackgroundColor`) painted *behind* the status bar with zero layout cost. The new band consumes `insets.top` of vertical space at the top of every screen.

**Impact:** 13 screens in this codebase already consume `react-native-safe-area-context` insets directly (and others use RN's `SafeAreaView`). On those screens, the top inset is now applied **twice**: once by the band overlay (in-flow) and again by each screen's own safe-area handling — total ≈ `2 × insets.top`. WelcomeScreen (the exact QA target named in the PR body) is one of them.

**The PR's "cosmetic-only / iOS unchanged" risk note is inaccurate.** This is a functional layout regression on every Android device with a non-zero top inset (i.e., basically all modern Android devices) and likely on iPhones with a notch too.

## Other findings

| Code | Sev | File:line | Issue |
|---|---|---|---|
| R1-P2-01 | P2 | `__tests__/ForegroundNotificationBanner.test.tsx` | No floor-case test (`insets.top: 0 → paddingTop: 12`); both tests only use `top: 47`. The brief flagged this. |
| R1-P2-02 | P2 | n/a | "32 tests" inflated — 2 of 4 matched suites are incidental (`validateAppConfig`, `appleAuth` match the regex). Only 2 EW3 tests are net new. |
| R1-P3-01 | P3 | `src/components/ForegroundNotificationBanner.tsx` | Component is never mounted in the app tree (referenced only in comments). Fix has no runtime effect until wired. Acknowledged by the PR. |
| R1-P3-02 | P3 | `App.tsx`, `App.test.tsx` | Root files fall outside the `src/**` lint glob (pre-existing config issue, not introduced by this PR). |

## Required next action
1. **Fix R1-P1-01** before merge: convert `StatusBarBand` to an absolute-position overlay (`position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, zIndex: <high>`) so it paints over the status-bar area without consuming layout space. Update PR risk note accordingly.
2. **Fix R1-P2-01:** add the 12px floor test (`useSafeAreaInsets` mocked to `{top: 0}` → assert `paddingTop: 12`).
3. (Optional) **R1-P2-02:** narrow test-path pattern to actual EW3 surfaces so the count isn't inflated.
4. P3s noted but not blocking — separate cleanup tickets.

## Deliverables produced this step
- `/home/user/workspace/AUDIT_R1_PR_230_REPORT.md` — full structured report
- `/home/user/workspace/PR230_R1_AUDIT_RESULT.md` — verdict summary (read above)
- PR comment posted: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/230#issuecomment-4665236950

## Next step in cycle
**Step 02:** Write PR #230 fixer brief + dispatch Opus 4.8 fixer subagent to address R1-P1-01 (absolute-position band) + R1-P2-01 (floor-case test). Push to existing PR branch `feature/ew3-android-safe-area-p1` so PR updates in place.
