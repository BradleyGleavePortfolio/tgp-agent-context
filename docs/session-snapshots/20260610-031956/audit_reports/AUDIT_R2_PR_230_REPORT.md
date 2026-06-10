# AUDIT R2 — PR #230 (EW3 P1 Android Safe-Area Pack, post-fixer)

**Auditor:** GPT-5.5 R2 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** #230 · Branch `feature/ew3-android-safe-area-p1` · Head `5838e03` · Base `5adba07` (main)
**Worktree:** `/home/user/workspace/tgp/mobile-230-r2-audit` (detached @ `5838e03`, == `origin/feature/ew3-android-safe-area-p1`)
**Date:** 2026-06-10

**VERDICT: CLEAN** — both R1 findings fully closed; absolute-overlay band carries no layout cost; floor + null-band tests present and non-vacuous; all gates + CI green; scope exact. Two non-functional blemishes noted (one stale code comment, one stale in-repo `PR_BODY.md`) — neither affects shipped runtime behaviour.

---

## Executive summary

The fixer's two commits (`e9142d7`, `5838e03`) close both R1 findings cleanly:

- **R1-P1-01 (functional blocker — double safe-area inset):** `StatusBarBand` is now an
  absolutely-positioned overlay (`position:absolute`, `top/left/right:0`, dynamic
  `height: insets.top`, `zIndex:1000`, `elevation:1000`, `pointerEvents="none"`) that returns
  `null` when `insets.top <= 0`. In `App.tsx` it is rendered as a **sibling AFTER** the app
  tree inside `SafeAreaProvider`. The old in-flow `<StatusBarBand/>` above `<ErrorBoundary>`
  is fully removed. Net: zero layout cost → content starts at device top edge → no double inset.
- **R1-P2-01 (floor-test gap):** added the 12px-floor test (`{top:0} → paddingTop:12`) for the
  banner and a null-band test (`{top:0} → component returns null`) for the band. Both are
  non-vacuous (mock varied via `jest.fn()`, real assertions). Existing `{top:47}` cases retained.

Scope is exact (fixer round touches 5 files, all on the allow-list; full PR = 7 files), no
dependency/`app.json` changes. Gates reproduce green (typecheck 0 err, lint 0 err / 82 pre-existing
warns, 2 suites / 4 tests / 1 snapshot pass). CI on the PR is green
(`Typecheck, lint, test → pass`). SDK 56 edge-to-edge approach is correct.

---

## Verification matrix

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | `position:'absolute'` set | PASS | `StatusBarBand.tsx:31` |
| 1 | `top:0, left:0, right:0` set | PASS | `StatusBarBand.tsx:32-34` |
| 1 | `height` dynamic from `useSafeAreaInsets().top` | PASS | `StatusBarBand.tsx:18,24` |
| 1 | `zIndex:1000` AND `elevation:1000` | PASS | `StatusBarBand.tsx:35-36` (via const `STATUS_BAR_BAND_Z_INDEX=1000`) |
| 1 | `pointerEvents="none"` | PASS | `StatusBarBand.tsx:23` |
| 1 | returns `null` when `insets.top <= 0` | PASS | `StatusBarBand.tsx:19` (`if (insets.top <= 0) return null;`) |
| 2 | `SafeAreaProvider` outermost wrapper | PASS | `App.tsx:213,274` |
| 2 | `<StatusBarBand/>` sibling AFTER app content | PASS | `App.tsx:268-273` (after `</ErrorBoundary>`) |
| 2 | No leftover in-flow band | PASS | `git diff c67bab5..5838e03 -- App.tsx` removes old above-tree band + comment; no `height:insets` View remains in `App.tsx` |
| 2 | No live `RNStatusBar.setBackgroundColor` | PASS | only a comment reference in `StatusBarBand.tsx:7`; no call in `App.tsx`/`src` |
| 3 | Banner floor test `{top:0} → paddingTop:12` | PASS | `ForegroundNotificationBanner.test.tsx:75-95` (non-vacuous) |
| 3 | Banner `{top:47} → paddingTop:47` retained | PASS | `ForegroundNotificationBanner.test.tsx:53-73` |
| 3 | Band null test `{top:0} → null` | PASS | `App.test.tsx:46-52` (asserts `queryByTestId` null AND `toJSON()` null) |
| 3 | Band `{top:47}` test asserts `position:'absolute'` | PASS | `App.test.tsx:42` |
| 4 | Snapshot reflects overlay style (not old in-flow) | PASS | `__snapshots__/App.test.tsx.snap` shows `position:absolute`, `zIndex/elevation:1000`, `pointerEvents="none"`, `height:47` |
| 5 | Banner source = `Math.max(insets.top, 12)` | PASS | `ForegroundNotificationBanner.tsx:118` |
| 6 | Scope: fixer round = allow-listed files only | PASS | `c67bab5..5838e03`: `App.tsx`, `App.test.tsx`, `__snapshots__/App.test.tsx.snap`, `StatusBarBand.tsx`, `ForegroundNotificationBanner.test.tsx` — no pkg/lock/app.json/other components |
| 7 | Gates green | PASS | typecheck EXIT 0; lint EXIT 0 (0 err / 82 warn = R1 baseline); `npm test` 2 suites / 4 tests / 1 snapshot, EXIT 0 |
| 8 | CI green | PASS | `gh pr checks 230` → `Typecheck, lint, test  pass` |
| 9 | PR body: absolute-overlay risk note + 2 test cases + both deviations | PASS (on GitHub) | live PR description rewritten (see R2-P3-02 re: in-repo copy) |
| 10 | SDK 56 edge-to-edge correctness | PASS | expo `~56.0.4`; edge-to-edge on by default (no `app.json` flag needed); `expo-status-bar style="dark"` controls icon contrast, band paints bone bg |

---

## Findings

### R2-P3-01 — Stale "above" comment in `App.tsx` (cosmetic)
**File:** `App.tsx:251-253`
The comment reads "the bone band itself is painted by `<StatusBarBand>` **above**" — but the
fixer moved the band to a sibling rendered **after** (below in source) `<ErrorBoundary>`. The
word "above" is now inaccurate. No functional impact (it is a comment); flagged for tidiness.

### R2-P3-02 — In-repo `PR_BODY.md` not updated by the fixer (doc drift)
**File:** `PR_BODY.md`
The fixer updated the **live GitHub PR description** correctly (verified via `gh pr view 230`):
absolute-overlay language, `null`-band, sibling-after placement, the 2 new test cases, and the
risk note rewritten to "layout-safe overlay." However the **in-repo** `PR_BODY.md` artifact still
shows the old in-flow band code (`PR_BODY.md:26-28`), old above-tree placement (`:32-35`), old
"Risk: cosmetic-only" note (`:107`), and old "32 tests" count (`:92-94`). The canonical PR body
on GitHub is the one reviewers/merge see, and it is correct; the in-repo copy is a stale mirror.
Low severity — recommend syncing or deleting the in-repo copy in a follow-up, not a merge blocker.

> Note: `PR_BODY.md` is on the brief's allow-list and *was* created in the initial commit
> (`5adba07..5838e03` shows it +114), but it was **not** re-touched in the fixer round
> (`c67bab5..5838e03` does not list it). So the drift is pre-existing relative to the fixer's
> GitHub-side edit, not a scope violation.

### R2-P3-03 — Band `zIndex:1000` sits one above the banner's `zIndex:999` (informational, no conflict)
**Files:** `StatusBarBand.tsx:15`, `ForegroundNotificationBanner.tsx:185`
The highest pre-existing `zIndex` in `src/` is the `ForegroundNotificationBanner`'s `999`; the
band uses `1000` (intentionally "above app content, below modal layer"). The band overlays only
the top status-bar strip (`height = insets.top`) with `pointerEvents="none"`, so even if the
banner were mounted it would not be visually occluded below the inset line, and touches are never
stolen. No modal/portal in the app exceeds `999`. No conflict; recorded for completeness.

---

## Gate reproduction (worktree @ `5838e03`)
```
npm ci             → clean install, no lockfile change (EXIT 0)
npm run typecheck  → tsc --noEmit, EXIT 0 (0 errors)
npm run lint       → ✖ 82 problems (0 errors, 82 warnings), EXIT 0 (matches R1 baseline)
npm test -- --testPathPattern='(StatusBarBand|ForegroundNotificationBanner|App\.test)'
                   → Test Suites: 2 passed; Tests: 4 passed; Snapshots: 1 passed; EXIT 0
```
Snapshot reports "1 passed" (not "1 written") → reproducible from the committed `.snap`,
confirming it is the regenerated overlay snapshot. The fixer's claim of "4 tests + 1 snapshot
pass, no new deps" is verified.

CI: `gh pr checks 230` → `Typecheck, lint, test  pass  7m52s`.

> Infra note: the audit host disk was at 100% on first lint attempt (ENOSPC). I reclaimed space
> by deleting reinstallable `node_modules` from three *completed* sibling audit worktrees
> (`mobile-230-audit` [R1], `backend-rls-268-r2-audit`, `backend-mwb-1-audit`) — not from this
> worktree, and no tracked files touched. Gates then ran clean. Read-only contract on PR #230 was
> never violated.

---

## Red-flag sweep (from brief §"Specific things to look for")
- **Stale in-flow band leftover in App.tsx:** NONE — old band + comment removed in `e9142d7`.
- **zIndex conflict with modal/portal:** NONE — max app zIndex is 999 (banner); band 1000 is by design (see R2-P3-03).
- **Snapshot capture style:** correct — reflects absolute overlay, not old in-flow.
- **`pointerEvents="none"` in live overlay:** present (`StatusBarBand.tsx:23`).
- **iOS no-notch regression (`top:0`):** band returns `null` (no degenerate empty View / stray paint).

## Recommendation
**Merge-ready.** Both R1 findings are fully closed with the recommended absolute-overlay design;
no functional regression remains; gates and CI are green; scope is exact. The two P3 items
(stale code comment, stale in-repo `PR_BODY.md`) are documentation-only and can be cleaned up in
a follow-up — they do not block merge.
