# PR #230 R1 Audit Brief — EW3 P1 Android Safe-Area Pack

**Role:** GPT-5.5 R1 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** #230 · Branch `feature/ew3-android-safe-area-p1` · Head SHA `c67bab5` · Base `5adba07` (main)
**Worktree:** `/home/user/workspace/tgp/mobile-230-audit` (detached @ `c67bab5`)
**Verdict rubric:** CLEAN / DIRTY-MINOR (cosmetic only) / DIRTY (functional)

## Context

Builder delivered EW3 P1 Android safe-area pack per `/home/user/workspace/EW3_P1_SAFE_AREA_PACK_BRIEF.md` and result `/home/user/workspace/EW3_P1_SAFE_AREA_PACK_RESULT.md`.

**Claimed deliverables (with 2 documented deviations):**
- EW3-001: removed deprecated `RNStatusBar.setBackgroundColor`; bone (`#F5EFE4`) band painted via top-inset `View` sized to `useSafeAreaInsets().top`; `expo-status-bar` kept at `style="dark"`.
- EW3-003: `ForegroundNotificationBanner` `paddingTop` → `Math.max(useSafeAreaInsets().top, 12)`.
- **Deviation 1:** added `SafeAreaProvider` root wrapper (it wasn't there; needed for `useSafeAreaInsets()` to return non-zero).
- **Deviation 2:** band logic extracted to `src/components/StatusBarBand.tsx` because full `App` render isn't testable under jest (`expo-video` crashes at module load).
- Gates: lint 0 errors, typecheck 0 errors, 4 suites / 32 tests passing + 1 snapshot, no new deps.
- Note: `ForegroundNotificationBanner` is not currently mounted anywhere in the app (only referenced in comments) — fix is correct but won't be visible until banner is wired in (out-of-scope).

## Audit scope

1. **Edge-to-edge correctness (EW3-001)** — `App.tsx` and `src/components/StatusBarBand.tsx`:
   - `RNStatusBar.setBackgroundColor` call removed; no remaining import of `StatusBar` from `react-native` for backgroundColor purpose.
   - `SafeAreaProvider` is the outermost wrapper before any content (otherwise `useSafeAreaInsets()` returns 0).
   - `StatusBarBand` renders a `View` of `height: insets.top, backgroundColor: '#F5EFE4'` ABOVE the rest of the content (z-order or render-order makes it the topmost band).
   - On iOS, this should still render correctly (the notch area gets a bone band — visually consistent with old behavior).
   - `expo-status-bar` kept at `style="dark"`.

2. **Push banner inset (EW3-003)** — `src/components/ForegroundNotificationBanner.tsx:~182`:
   - `paddingTop` now `Math.max(useSafeAreaInsets().top, 12)`.
   - `useSafeAreaInsets` imported from `react-native-safe-area-context`.
   - No fallback to the old magic number `44` for iOS.

3. **Scope discipline** — `git diff 5adba07..c67bab5` should touch ONLY:
   - `App.tsx`
   - `src/components/ForegroundNotificationBanner.tsx`
   - `src/components/StatusBarBand.tsx` (NEW)
   - Test files for the above (`__tests__/StatusBarBand.test.tsx` or similar, `ForegroundNotificationBanner.test.tsx`)
   - PR_BODY.md (allowed scratch)
   - No edits to `OfflineBanner.tsx`, `PlanScreen.tsx`, `LoginScreen.tsx`, `CreateAccountScreen.tsx`, chart components, biometric files (those are P2/P3 — separate tickets).
   - No `package.json` / `package-lock.json` bump.
   - No `app.json` change (assetlinks.json is ops/config, out of scope).

4. **Test coverage**:
   - `StatusBarBand` test renders with `useSafeAreaInsets` mocked to return `{top: 47}` and asserts the band view height matches.
   - `ForegroundNotificationBanner` test mocks `useSafeAreaInsets` returning `{top: 47}` and asserts style `paddingTop: 47`.
   - Both tests use `jest` mock of `react-native-safe-area-context` properly (not just bypassing).
   - Snapshot test for `StatusBarBand` is acceptable but should also have a numeric assertion.

5. **Re-run gates**:
   ```bash
   cd /home/user/workspace/tgp/mobile-230-audit
   npm ci 2>&1 | tail -3
   npm run lint
   npm run typecheck
   npm test -- --testPathPattern='(StatusBarBand|ForegroundNotificationBanner|App)' 2>&1 | tail -20
   ```
   Confirm: lint 0 errors, typecheck 0 errors, 32 tests passing claim, no new deps.

6. **PR body content** — verify the PR body references:
   - Triage PR #11 @ `41c6186`, items EW3-001 + EW3-003.
   - Out-of-scope note for EW3-002 (assetlinks.json ops/config).
   - Both deviations called out (SafeAreaProvider added, StatusBarBand extracted).
   - Manual QA plan for device capture.
   - Mention that `ForegroundNotificationBanner` is not currently mounted in the app.

## Findings format

R1-P0/P1/P2/P3 with file:line refs.

Specifically look for:
- `useSafeAreaInsets()` called above `SafeAreaProvider` in the tree (would return 0 silently).
- iOS regression: bone band painted differently than before for iPhone notch.
- Any imported but unused `RNStatusBar` left over.
- Missing test for the negative case (`insets.top === 0` → still renders 12px floor in banner).
- ForegroundNotificationBanner being unused in the codebase: flag as P3 (cosmetic / nice-to-have to wire it in, but the brief acknowledged this).

## Deliverables

1. `/home/user/workspace/AUDIT_R1_PR_230_REPORT.md` — structured R1 report
2. `/home/user/workspace/PR230_R1_AUDIT_RESULT.md` — short verdict summary
3. PR comment via `gh api repos/BradleyGleavePortfolio/growth-project-mobile/issues/230/comments` — top 5 findings + verdict

## Constraints

- READ-ONLY.
- Do NOT use `gh pr comment` — use `gh api`.
- `gh` with `api_credentials=["github"]`.
