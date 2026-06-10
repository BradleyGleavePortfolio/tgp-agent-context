# PR #230 R2 Audit Brief — EW3 Safe-Area Pack (Post-Fixer)

**Role:** GPT-5.5 R2 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** #230 · Branch `feature/ew3-android-safe-area-p1` · Head SHA `5838e03a` · Base `5adba07`
**Worktree:** create `/home/user/workspace/tgp/mobile-230-r2-audit` (detached @ `5838e03a`) or reuse `/home/user/workspace/tgp/mobile-230-audit` after sync.
**Verdict rubric:** CLEAN / DIRTY-MINOR (cosmetic only) / DIRTY (functional)

## Context

R1 audit (`/home/user/workspace/AUDIT_R1_PR_230_REPORT.md`) returned DIRTY with:
- R1-P1-01: StatusBarBand in-flow → double safe-area inset on 13+ screens (blocker)
- R1-P2-01: No floor-case test for ForegroundNotificationBanner (`{top:0} → paddingTop:12`)
- R1-P2-02, P3-01, P3-02 deferred

Fixer pushed 2 commits (`c67bab5 → 5838e03a`). See `/home/user/workspace/PR230_FIXER_RESULT.md` and step log `/home/user/workspace/audit_cycle_log/STEP_05_PR230_fixer_complete.md`.

## R2 audit scope

### Verify R1-P1-01 fix (absolute-overlay band)

In `src/components/StatusBarBand.tsx`:
- `position: 'absolute'` set
- `top: 0`, `left: 0`, `right: 0` set
- `height` is dynamic from `useSafeAreaInsets().top`
- `zIndex: 1000` AND `elevation: 1000` (both Android and iOS stacking)
- `pointerEvents="none"` to never block touches
- Returns `null` when `insets.top <= 0` (no degenerate empty View)

In `App.tsx`:
- `SafeAreaProvider` still outermost wrapper
- `<StatusBarBand />` rendered as a **SIBLING AFTER** the main app content within `SafeAreaProvider` (not above in flow — that would still consume layout)
- No leftover in-flow band code

**Layout verification:** the band must NOT consume layout. Manual sanity-check: after this fix, a screen with `useSafeAreaInsets().top = 47` should render its content starting at y=0 (the band overlays the top 47px), NOT at y=47. Walk through the App.tsx render tree and confirm no `View` above the navigation container has a non-zero height.

### Verify R1-P2-01 fix (floor-case tests)

In `__tests__/ForegroundNotificationBanner.test.tsx` (or wherever):
- Test case mocks `useSafeAreaInsets` to `{top: 0}` and asserts `paddingTop === 12` (the floor in `Math.max(insets.top, 12)`).
- Existing `{top: 47}` test still present and passing.

In `__tests__/StatusBarBand.test.tsx`:
- Test case mocks `useSafeAreaInsets` to `{top: 0}` and asserts the component returns `null` (no degenerate render).

### Scope discipline

`git diff c67bab5..5838e03a` should touch ONLY:
- `src/components/StatusBarBand.tsx`
- `App.tsx`
- `__tests__/StatusBarBand.test.tsx` (or equivalent)
- `__tests__/ForegroundNotificationBanner.test.tsx` (or equivalent)
- PR_BODY.md if maintained in repo
- Snapshot file regenerated

NO new files outside these. No `package.json`/lock bump. No `app.json`. No other component edits.

### Re-run gates

```bash
cd /home/user/workspace/tgp/mobile-230-audit   # or fresh worktree
git fetch origin
git checkout feature/ew3-android-safe-area-p1
git pull --ff-only origin feature/ew3-android-safe-area-p1
npm run lint
npm run typecheck
npm test -- --testPathPattern='(StatusBarBand|ForegroundNotificationBanner)' 2>&1 | tail -30
```

Cross-check the fixer's claim of "4 tests + 1 snapshot pass, no new deps".

### CI verification

- `gh pr checks 230 --repo BradleyGleavePortfolio/growth-project-mobile` → confirm `Typecheck, lint, test` passes.
- If CI fails, log as R2-P1 with the failure detail.

### PR body sanity

- Risk note updated from "cosmetic-only / iOS unchanged" to absolute-overlay language
- Tests section references the 2 new test cases
- Both deviations (SafeAreaProvider, StatusBarBand extraction) still noted

## Specific things to look for (red flags)

- **Stale in-flow band leftover:** any `<View style={{height: insets.top}}>` left in `App.tsx` that wasn't deleted when adding the absolute version. Easy to miss.
- **zIndex conflict:** if `1000` collides with any modal/portal in the app (most don't go that high — usually 100-500), the band might appear above modals it shouldn't. Note as P3 if found.
- **Snapshot capture style:** the snapshot should reflect the absolute style (position, zIndex, etc.) — confirm it's not still the old in-flow snapshot.
- **`pointerEvents="none"` confirmed in the live overlay** — without this, the band's hit region would steal taps from the status bar area on iOS (rare but possible).
- **iOS regression check:** in pure iOS (no notch / `top: 0`), the band returns null. Confirm no leftover hardcoded color band painting where there shouldn't be one.

## Findings format

R2-P0/P1/P2/P3 with file:line refs.

## Verdict thresholds

- **CLEAN:** R1-P1-01 fully closed (absolute overlay, no layout cost); R1-P2-01 floor test present; CI green; no new findings.
- **DIRTY-MINOR:** cosmetic-only.
- **DIRTY:** layout regression returns, floor test missing, or new functional finding.

## Deliverables

1. `/home/user/workspace/AUDIT_R2_PR_230_REPORT.md` — structured findings
2. `/home/user/workspace/PR230_R2_AUDIT_RESULT.md` — verdict summary
3. PR comment via `gh api repos/BradleyGleavePortfolio/growth-project-mobile/issues/230/comments`. USE `gh api`.

## Constraints

- READ-ONLY.
- `gh` with `api_credentials=["github"]`.
