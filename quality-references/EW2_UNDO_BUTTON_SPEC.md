# L13 — EW2: Undo Button on Coach Workout Builder (mobile-only)

## One-paragraph spec

Ship a **client-side optimistic undo button** in the toolbar of `CoachWorkoutBuilderScreen` that lets the coach reverse the last N edits (default N = 20) made in the current session. The undo is a **local command stack** layered over the already-shipped MWB-4 autosave (`useAutosave` + `workoutBuilderAutosaveDiff`); each user-driven mutation that today flows through `useWorkoutBuilder` (`addExercise`, `removeExercise`, `reorderExercise`, `editExerciseField`, plan-level `editPlan`) gets wrapped in a new `useBuilderCommandStack` hook that pushes an inverse op onto an in-memory `Action[]` stack BEFORE the mutation fires and pops the inverse on undo, immediately re-running the mutation in reverse through the same autosave channel so the persisted state matches the on-screen state. The toolbar gets a single visible undo glyph button (left-justified, hairline-divided from the title); pressing it pops the most recent action and re-applies the inverse; the button is disabled (50% opacity, `accessibilityState.disabled = true`) when the stack is empty; a two-finger-swipe-down gesture binds to the same handler (matches the doctrine spec in MOBILE_WORKOUT_INVENTORY.md §3). The stack lives in component state — it is **wiped on screen unmount** by design (this is a "fearless experimentation" tool, not durable history; durable history is the deferred WorkoutPlanRevision feature in MASTER_WORKOUT_BUILDER_SPEC.md §5). No new backend, no new endpoints, no schema changes; everything goes through the existing autosave PATCH/PUT pipe.

## Surfaces touched (mobile only)

- **NEW:** `src/hooks/useBuilderCommandStack.ts` — generic command-stack hook: `{ push(action), undo(), canUndo, depth }` with inverse-op map keyed by `action.kind`.
- **NEW:** `src/components/coach/workout-builder/UndoButton.tsx` — small toolbar button + two-finger-swipe gesture binding (`react-native-gesture-handler` `TwoFingerSwipeDownGesture`).
- **MODIFY:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx` — instantiate the stack, route every existing mutation call through `pushAction`, mount the toolbar button.
- **MODIFY:** `src/hooks/useWorkoutBuilder.ts` — expose inverse-op metadata from each mutation (e.g. `addExercise` returns the new row id so undo can `removeExercise(rowId)`; `removeExercise` snapshots the removed row so undo can `addExercise(snapshot)`).
- **NEW Roman voice line in `src/lib/roman/copy.ts`:** `romanBuilderUndoToast.success` = `"Reverted. Twenty steps still in the bank."` (template; N parameterized) — fired as a 1.4 s in-screen toast on undo. No exclamation, no emoji, no contractions.
- **NO backend changes.** No new Prisma migration. No new endpoint. No new env flag is required because the feature is purely additive and is safely off-by-default-as-rendered: mount behind `EXPO_PUBLIC_FF_MWB_UNDO` (default OFF), guard with `featureFlags.mwbUndo`.

## Inverse-op contract (the heart of the feature)

| Forward op | Snapshot captured at push time | Inverse op |
|---|---|---|
| `addExercise(row)` | `row.id` after server confirms | `removeExercise(row.id)` |
| `removeExercise(rowId)` | full `row` BEFORE removal | `addExercise(row)` at original position |
| `reorderExercise(rowId, fromIdx, toIdx)` | `fromIdx`, `toIdx` | `reorderExercise(rowId, toIdx, fromIdx)` |
| `editExerciseField(rowId, field, newValue)` | `previousValue` BEFORE edit | `editExerciseField(rowId, field, previousValue)` |
| `editPlan(planId, patch)` | full `previousPlan` shape for the patched fields | `editPlan(planId, previousPatch)` |

The hook MUST snapshot at the moment the user fires the action, NOT after the server confirms — that way a server failure on the forward path still leaves the stack consistent with what the screen showed.

## Edge cases the builder MUST handle

1. **Autosave 409 (stale lock token) during forward op** — the existing `useAutosave` 409 path retries with a fresh token. The undo stack must NOT push a duplicate action if the retry happens transparently; only push when the user-driven mutation returns success (or returns a known retried-success state from the autosave layer).
2. **Undo of an action that itself was a retry** — push only one entry per user gesture; the autosave retry is internal.
3. **Network failure during undo** — show the same Roman error voice as other mutation failures (use the existing `romanError` stem in `copy.ts`); do NOT pop the stack on failure (so the coach can retry).
4. **Stack full (N = 20)** — silently drop the oldest entry (FIFO eviction).
5. **Concurrent edit by sub-coach on same plan** — out of scope here; the autosave layer already handles row-version conflicts. The stack reflects local intent only.

## Tests (required before PR open)

- `src/hooks/__tests__/useBuilderCommandStack.test.tsx` — push/undo cycle for every inverse op; FIFO eviction at depth N=20; `canUndo` flips false at empty; depth counter accuracy.
- `src/components/coach/workout-builder/__tests__/UndoButton.test.tsx` — button enabled/disabled states, tap fires `onUndo`, two-finger gesture fires `onUndo`, disabled when `canUndo=false`, theme tokens correct (`semanticColors.bgSurface`, no `surface`).
- Integration: extend `src/__tests__/coachWorkoutBuilderAutosave.test.tsx` (already exists, do NOT rewrite — APPEND new cases) with: "add exercise then undo → row removed AND autosave fires inverse"; "edit field then undo → field reverts AND autosave fires inverse"; "undo with empty stack is a no-op".
- Doctrine pin in `src/__tests__/quietLuxuryDoctrine.test.ts` — new files must respect the doctrine globs (already wired; just keep glob coverage).
- Flag-off test: `src/screens/coach/__tests__/mwbUndoFlagOff.test.tsx` — when `EXPO_PUBLIC_FF_MWB_UNDO` is OFF, the toolbar button is NOT in the tree and the gesture is not bound.

## R-rule compliance (required)

R0 ban-scan, R52 push cadence, R74 Bradley authorship verified per commit, R77 lane scope (no backend, no non-builder surfaces), R78 no new telemetry expected, R79 doctrine sweep green pre-PR, R80 verify any pre-existing-failure claim against `origin/main`. Encode L8 + L10 learnings in every new test: `await render(...)` (RNTL v14), default-import AsyncStorage, `await waitFor(...)` after `mutateAsync`, `semanticColors.bgSurface` not `surface`.

## Branch + PR

- Branch (mobile only): `feature/mwb-undo-button`
- PR title: `feat(mwb): EW2 undo button + command stack (mobile) — EXPO_PUBLIC_FF_MWB_UNDO off`
- PR body: scope, feature flag, inverse-op table, tests added, R-rule compliance, explicit "**no backend changes**".

Do NOT merge. Parent handles the merge train.

---

Filed 2026-06-14. Operator-approved one-paragraph spec. Sized as a ~1-day mobile lane.
