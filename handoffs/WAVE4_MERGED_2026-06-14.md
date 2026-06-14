# Wave-4 — MERGED 2026-06-14

Three parallel lanes shipped in one wave. All four PRs landed clean, all CI empirically green (bucket=pass + state=SUCCESS, never on check names alone).

## Final mains

| Repo | HEAD |
|---|---|
| growth-project-backend | `0d13bfb2` |
| growth-project-mobile | `64e2de4d` |

## PRs merged (in merge-train order)

| Order | Lane | PR | Repo | Title |
|---|---|---|---|---|
| 1 | L12 | [#252](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/252) | mobile | feat(roman): ED.5 onboarding polish — step transitions + Stripe Connect card flip + permanence markers |
| 2 | L11 | [#400](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/400) | backend | feat(roman): ED.2 three-arc router daily counts endpoint |
| 3 | L11 | [#254](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/254) | mobile | feat(roman): ED.2 three-arc router widget |
| 4 | L13 | [#253](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/253) | mobile | feat(mwb): EW2 undo button + command stack |

## What shipped (all flag-gated, default OFF)

### L11 — Roman ED.2 three-arc router (backend + mobile)
- **Backend:** `GET /coach/home/daily-rings` with class-level `@Roles('coach')`, 30s cache, zeroed-shape fallback. Flag `FEATURE_ROMAN_THREE_ARC_COUNTS`. +610 LOC, 25 tests.
- **Mobile:** new `CoachThreeArcRouter` component (independent of client `ThreeRingHero`), flag-gated mount in `CoachHomeScreen` with deep-links to ClientsStack / SettingsStack→CoachBrief / Messages. Flag `EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER`. +826 LOC, 19 tests.

### L12 — Roman ED.5 onboarding polish (mobile only)
- 3 new flag-gated components: `StepTransitionView` (cross-fade + 8px slide, 220ms), `StripeConnectCard` (180° flip, 360ms), `PermanenceMarker` (calm checkmark + 1.6s Roman line).
- Integrated into `OnboardingLayout` + Lean Q2/Q3/Q5 + Results.
- Reduce-motion honored, accessibility labels on all new components.
- Flag `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH`. 14 files (+1334/-9), 34 tests across 4 new suites.

### L13 — EW2 undo button (mobile only, NO backend)
- `useBuilderCommandStack` hook: snapshot-at-gesture command stack with inverse-op map for `addExercise`/`removeExercise`/`reorderExercise`/`editExerciseField`/`editPlan`. FIFO eviction at N=20. Ref-backed stack mirrored to size state for deterministic RNTL.
- `UndoButton` component: toolbar glyph + two-finger swipe-down gesture, disabled at empty stack.
- Wired into `CoachWorkoutBuilderScreen` with Roman success/error toast (`romanBuilderUndoToast.success`).
- Flag `EXPO_PUBLIC_FF_MWB_UNDO`. 37/37 hook + component tests, 86/86 doctrine pin.
- One contract refinement: add→undo nets zero server delta (the new row has no server row_id yet), so the "autosave fires inverse" guarantee is proven by edit-then-undo (which always diffs).

## Merge train notes (parent-handled)

Two of the three lanes required parent-side merge-conflict resolution after L12 landed first (both L12 and L11-mobile and L13-mobile added entries to the shared files `src/config/featureFlags.ts` and `src/lib/roman/copy.ts`). Pattern was always "keep both halves" because each lane added independent flag/Roman-stem entries with no semantic overlap. Resolution flow:

```
git fetch origin main
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
  merge origin/main --no-edit
# python3 keep-both resolver on the marker blocks
NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit   # 0 errors
npx jest --testPathPattern='(quietLuxuryDoctrine|FlagOff|doctrine|pin)'  # 95-101 tests green
git add <conflict files>
git -c user.name='Bradley Gleave' ... commit --no-edit
git push
```

L13 required this twice (once after L12 landed, once after L11 mobile landed) — that's the cost of parallel mobile-only lanes touching shared flag/copy files. Acceptable; the merge resolutions are mechanical and deterministic.

L11 also flagged that mobile CI didn't auto-dispatch on PR creation (~5 min no-show) and was unblocked by an empty R74-identity commit (`0c4e5f5`) that triggered the synchronize event.

## Roman backlog snapshot post-Wave-4

| Item | Status |
|---|---|
| ED.1 | ✅ DONE (prior wave) |
| ED.2 | ✅ DONE — this wave (#400 + #254) |
| ED.3 | ✅ DONE (#395 + #242) |
| ED.4 | ✅ DONE (#242) |
| ED.5 | ✅ DONE — this wave (#252) |
| ED.6 | ✅ DONE (#398 + #250) |
| EW2 | ✅ DONE — this wave (#253) |

## R-rule compliance (all four PRs)

- **R0** ban-scan clean on every diff
- **R52** push cadence ~2min where in-flight; parent's merge-resolution commits all pushed immediately
- **R74** every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>` verified post-commit
- **R77** lane scope held — no cross-lane worktree contamination
- **R78** no new telemetry events shipped (none needed)
- **R79** doctrine sweeps green pre-PR-open on every lane (94-101 tests depending on lane)
- **R80** pre-existing-failure claims always verified against `origin/main` first

## Deferred / candidates for next wave

- **D** MWB visual luxury refactor (still needs R73 planner brief at `design-targets/mobile/coach-workout-builder/README.md` before dispatch)
- **F** Named regimes + auto-assign (full spec needed)
- **G** EW1 exercise library completion (empirical audit then spec)
- **H** Coach Brief v2 — replay, cross-brief streaks, per-coach voice variants, sub-coach→head-coach escalation (large; operator to write spec)

Operator decides next dispatch.

---

Filed 2026-06-14 ~3:25 PM PDT.
