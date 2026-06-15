**CHANGES_REQUESTED — P0: 0 · P1: 2 · P2: 4 · P3: 3**

# Post-Merge PR #253 Solo Re-Audit — R81 Strict Mode — 2026-06-15

## 1. Scope

- **Repo / PR:** `BradleyGleavePortfolio/growth-project-mobile#253` — `feat(mwb): EW2 undo button + command stack (mobile) — EXPO_PUBLIC_FF_MWB_UNDO off`.
- **Merge commit audited:** `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- **Current main checked:** `/home/user/workspace/audit-work/worktrees/mobile` is on `main` at `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`, with `main...origin/main` clean; no post-audit fixer commit is present.
- **Parent / diff swept:** `8166486bfd386e6b3ac3c48d4b6bd660376eae8d..64e2de4dd4625e20fa6b41b7678d999be53ba4fc` — 10 files, +1789/−12.
- **Changed files read in full on current main:**
  - `src/__tests__/coachWorkoutBuilderAutosave.test.tsx`
  - `src/components/coach/workout-builder/UndoButton.tsx`
  - `src/components/coach/workout-builder/__tests__/UndoButton.test.tsx`
  - `src/config/featureFlags.ts`
  - `src/hooks/__tests__/useBuilderCommandStack.test.tsx`
  - `src/hooks/useBuilderCommandStack.ts`
  - `src/hooks/useWorkoutBuilder.ts`
  - `src/lib/roman/copy.ts`
  - `src/screens/coach/CoachWorkoutBuilderScreen.tsx`
  - `src/screens/coach/__tests__/mwbUndoFlagOff.test.tsx`
- **Additional context swept:** prior audits, canonical audit brief, R72/R74/R77/R79/R81/R82, PR file inventory via `gh api repos/BradleyGleavePortfolio/growth-project-mobile/commits/64e2de4d --jq '.files'`, R0 changed-prod-file grep, commit-trailer grep, analytics/telemetry grep, and surrounding callers for the new command-stack APIs.

## 2. Verdict rationale

This PR remains **not clean under R81**. The prior six findings are all still present on current `main`, because `main` is still exactly the squash merge commit.

The solo pass found additional command-stack defects the paired audit missed. The most serious new one is a second P1: an `addExercise` command stores the newly minted `clientId`, but the normal post-insert adoption path remaps the saved server row to a fresh `clientId`; after that adoption, Undo cannot find the row by the command's original `clientId`, silently pops the command, and shows success while leaving the exercise in the plan. This violates the command-stack identity contract and is not covered by the existing “add then undo” test because the mock refetch never simulates real server-id adoption.

## 3. Prior-finding verification

| Prior ID | Sev | Current status | Verification |
|---|---:|---|---|
| Prior F1 — D7B canonical delete-set absent / remove-then-undo stale delete markers | **P1** | **STILL_PRESENT** | `deletedKeysRef` and `deletedSignaturesRef` still live directly in `CoachWorkoutBuilderScreen.tsx` (`:337-417`), and `applyInverse → addExercise` still re-adds with a fresh `clientId` without clearing either marker (`:1333-1356`). |
| Prior F2 — missing D7B / undo integration pins | **P2** | **STILL_PRESENT** | The undo integration suite still covers only add-then-undo, plan-name edit-then-undo, and empty-stack no-op (`coachWorkoutBuilderAutosave.test.tsx:981-1118`). No remove-then-undo/adoption, reorder-undo, or exercise-field-undo pin exists. |
| Prior F3 — undo toast not announced | **P2** | **STILL_PRESENT** | The toast `<View>` still has only `style` and `testID`, with no `accessibilityLiveRegion`, `accessibilityRole="status"`, or `AccessibilityInfo.announceForAccessibility` (`CoachWorkoutBuilderScreen.tsx:1482-1490`). |
| Prior F4 — `applyInverse` empty dependency array is fragile | **P3** | **STILL_PRESENT** | `applyInverse` still uses `useCallback((op) => ..., [])` while reading refs/helpers and setters (`CoachWorkoutBuilderScreen.tsx:1315-1392`). |
| Prior F5 — toast passes capacity, not remaining depth | **P3** | **STILL_PRESENT** | `commandCapacity = commandStack.capacity` is passed to `romanBuilderUndoToast.success({ depth: commandCapacity })`, so the copy is always capacity-based (`CoachWorkoutBuilderScreen.tsx:1394-1424`). |
| Prior F6 — stale divider-token docstring | **P3** | **STILL_PRESENT** | `UndoButton` docstring still says `textMuted` for the divider while implementation uses `sc.border` (`UndoButton.tsx:17-19`, `:121-126`). |

## 4. NEW findings missed by prior audit

| ID | Sev | Area | Finding |
|---|---:|---|---|
| N1 | **P1** | Command identity / add undo after adoption | Normal post-insert adoption changes the row `clientId`, so undoing an add after it autosaves silently no-ops while showing success. |
| N2 | **P2** | Command stack purity / one-entry-per-gesture | `moveRow`, `removeRow`, and `updateRow` push undo actions from inside React state updater functions, so React replay/double-invoke can push duplicate commands for one gesture. |
| N3 | **P2** | Observability / telemetry | No telemetry exists for undo invocation, undo failure/no-op, or command-stack overflow/eviction; overflow is silently discarded. |

### N1 (P1) — `addExercise` undo breaks after normal row-id adoption remaps `clientId`

**Files:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:364-390`, `313-320`, `968-980`, `1317-1320`; `src/__tests__/coachWorkoutBuilderAutosave.test.tsx:981-1045`.

Forward add captures the original on-device `clientId`:

```ts
const addExercise = useCallback((ex: Exercise) => {
  const clientId = generateClientId();
  setRows((cur) => [
    ...cur,
    { clientId, row_id: undefined, exercise_external_id: ex.id, ... },
  ]);
  pushUndoActionRef.current?.(actionForAddExercise(clientId));
}, []);
```

When the id-less insert is saved and the post-save refetch returns server truth, the clean adoption branch maps every server row through `clientIdForServerRow(e.id)`:

```ts
const clientIdForServerRow = useCallback((serverRowId: string): string => {
  const existing = rowIdToClientIdRef.current.get(serverRowId);
  if (existing) return existing;
  const minted = generateClientId();
  rowIdToClientIdRef.current.set(serverRowId, minted);
  return minted;
}, []);
...
setRows(
  keptExercises.map((e) => ({
    clientId: clientIdForServerRow(e.id),
    row_id: e.id,
    ...
  })),
);
```

For a newly added id-less row in the normal no-pending path, `rowIdToClientIdRef` has no mapping for the server-assigned row id, so `clientIdForServerRow` mints a new `clientId`. The command stack still holds the original `clientId` from `actionForAddExercise(clientId)`. Later undo resolves removal by the stale id:

```ts
case 'removeExercise': {
  setRows((cur) => {
    const idx = cur.findIndex((r) => r.clientId === op.clientId);
    if (idx === -1) return cur;
    ...
  });
  return;
}
```

After adoption, `idx === -1`, so the inverse returns the current rows unchanged. `useBuilderCommandStack.undo()` has already popped the action, `applyInverse` does not reject, and `onUndo` shows the success toast. The coach sees “Reverted” while the just-added exercise remains in the plan.

The existing `add then undo` integration test does not catch this because its mocked `refetchPlan` returns `{}` and never updates `existingPlan` with the server-assigned row id; the test undoes before real adoption semantics can remap identity (`coachWorkoutBuilderAutosave.test.tsx:1008-1045`).

**Why P1:** This is a real correctness defect in a core undo path. It is latent behind `EXPO_PUBLIC_FF_MWB_UNDO`, but once the flag is on, the common “add an exercise, wait for save, undo” path silently fails and consumes the user's undo slot.

**Recommended fix:** Preserve the original `clientId` across clean post-insert adoption. The adoption path needs a canonical mapping from id-less local rows to server rows (signature/order-aware, same care as D-045) and must seed `rowIdToClientIdRef.current.set(adoptedId, oldClientId)` before the full replace. Add a regression test that returns a refetched plan containing the new server row id, rerenders/adopts it, then presses Undo and asserts the added row is removed.

### N2 (P2) — undo pushes happen inside React state updater functions

**File:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:394-407`, `419-456`, `462-480`.

`moveRow`, `removeRow`, and `updateRow` all push command-stack actions from inside `setRows((cur) => { ... })` updater functions:

```ts
setRows((cur) => {
  ...
  pushUndoActionRef.current?.(
    actionForReorderExercise(moved.clientId, idx, target),
  );
  return next;
});
```

```ts
setRows((cur) => {
  const target = cur[idx];
  if (target) {
    deletedKeysRef.current.add(target.clientId);
    ...
    pushUndoActionRef.current?.(actionForRemoveExercise(...));
  }
  return cur.filter((_, i) => i !== idx);
});
```

```ts
setRows((cur) =>
  cur.map((r, i) => {
    if (i !== idx) return r;
    ...
    pushUndo(actionForEditExerciseField(r.clientId, field, previousValue));
    return { ...r, ...patch };
  }),
);
```

The hook itself explicitly avoids reading side effects out of a state updater because React may not run updaters synchronously and may double-invoke them under StrictMode (`useBuilderCommandStack.ts:227-233`). The screen then violates that same rule by mutating `pushUndoActionRef`, `deletedKeysRef`, and `deletedSignaturesRef` inside row state updaters.

If React replays an updater, one user gesture can push two undo commands. For remove, that can create two stale remove snapshots; for field edits, the stack can require two undo taps for one visual edit; for reorder, the stack can become out of sync with the committed row order. This directly violates the EW2 invariant documented in the hook: “ONE entry per user gesture.”

**Why P2:** This is a command-stack correctness risk before flag flip. It may surface most obviously in dev/StrictMode, but React updater purity is a production-safety invariant, and the repo already treats StrictMode double-invoke behavior as a known mobile concern.

**Recommended fix:** Compute the command action before calling `setRows` wherever the target row is already knowable (`removeRow`, `moveRow`, field handlers), or split into a pure state update plus a post-compute push using the current `rows` value from the closure. No command-stack push or delete-set mutation should occur inside a React state updater.

### N3 (P2) — no undo/overflow/failure telemetry

**Files:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:1416-1424`; `src/hooks/useBuilderCommandStack.ts:250-258`, `276-288`.

The screen does not import or call `track`, and `onUndo` only shows a toast:

```ts
const onUndo = useCallback(() => {
  void undoStack()
    .then(() => {
      showUndoToast(romanBuilderUndoToast.success({ depth: commandCapacity }));
    })
    .catch(() => {
      showUndoToast(romanGenericError({ mode: 'default' }));
    });
}, [undoStack, showUndoToast, commandCapacity]);
```

The stack silently evicts overflow with no signal:

```ts
if (next.length > capacity) {
  next.splice(0, next.length - capacity);
}
```

There is no event for undo invocation, no event for undo failure/no-op, and no event when a command is evicted at capacity. The grep sweep found analytics infrastructure (`src/lib/analytics.ts`, `src/analytics/events.ts`) and many coach screens calling `track(...)`, but no MWB undo event names or emit sites.

**Why P2:** This feature ships dark and needs observability before rollout. Without invocation/failure/overflow telemetry, ops cannot detect whether coaches are hitting stale-id no-ops, D7B re-drop failures, duplicate-command behavior, or depth overflow after flag flip.

**Recommended fix:** Add typed analytics events such as `mwb_undo_invoked`, `mwb_undo_failed`, and `mwb_undo_stack_evicted` with non-PII props (`plan_id` if allowed by existing analytics practice, action kind, stack size, capacity, failure reason). Emit overflow from `push` or via an injected callback, and pin event constants in the analytics test.

## 5. D7B compliance section

| D7B / command-stack requirement | Status | Evidence |
|---|---:|---|
| Canonical delete-set refactor | **FAIL** | No canonical delete-set abstraction exists. The screen still owns `deletedKeysRef` plus `deletedSignaturesRef` and manually updates them in multiple places. |
| Delete marker clear/consume on undo restore | **FAIL** | `applyInverse → addExercise` re-adds the row but does not clear the old client-id or signature delete markers. |
| Stable command identity through replay/adoption | **FAIL** | Newly added rows lose their command `clientId` on clean post-insert adoption, so `addExercise` undo after adoption no-ops. |
| One command per user gesture | **FAIL** | Several push sites live inside React state updater functions and can be replayed/double-invoked. |
| Push/pop/inverse map | **PARTIAL PASS** | `useBuilderCommandStack` itself is ref-backed, bounded, LIFO, and restores on executor rejection; the screen executor does not preserve all identities or reject on no-op. |
| Idempotent replay / no-op detection | **FAIL** | Missing-row inverse cases return unchanged state without rejecting, so the stack pops and success toast fires even when no inverse was applied. |
| Concurrent edit handling | **PARTIAL** | Existing autosave conflict machinery is extensive, but undo success/failure is local-only and not tied to whether the inverse diff actually persists. |
| Undo across navigation/background/relaunch | **BY DESIGN: NOT DURABLE** | The stack is in component state and wiped on unmount; this matches the hook docstring but should remain explicit before product flag flip. |
| Memory bound | **PASS** | Stack capacity defaults to 20 and FIFO-evicts oldest entries. |
| Telemetry | **FAIL** | No undo invocation/failure/overflow events exist. |

## 6. Correctly implemented / do not regress

- `EXPO_PUBLIC_FF_MWB_UNDO` defaults off unconditionally.
- Flag-off containment is strong: no undo button, no toast, and no Pan gesture when the undo flag is unset.
- `useBuilderCommandStack` uses a ref-backed bounded stack and restores the popped action if the injected executor rejects.
- `inverseOf` is pure and exhaustive over the declared action union.
- `UndoButton` has a 44dp minimum target, disabled accessibility state, and a line icon rather than emoji.
- The autosave replay/refetch gate from MWB-4 remains in place and was not regressed by this audit.

## 7. Rules check

| Rule | Status | Notes |
|---|---:|---|
| R0 banned production patterns | **PASS on inspected PR files** | No `Coming soon`, new `@ts-ignore`, `.catch(()=>undefined)`, `as unknown as`, or `as any` hit was found in changed production files. |
| R0 commit trailers | **PASS** | Trailer sweep found only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`. |
| R72 exhaustive audit | **PASS** | All 10 touched files were read in full on current main; surrounding new API callers and telemetry surfaces were swept. |
| R74 identity | **PASS for audited merge** | The merge trailer is Bradley-only, with no AI attribution. |
| R77 read-only discipline | **PASS** | No repository source files were modified; only this audit output was written. |
| R79 pins | **FAIL/PARTIAL** | Existing pins do not cover remove-undo adoption, add-undo after adoption, reorder undo, exercise-field undo, live-region toast, or telemetry. |
| R81 gate | **FAIL** | P1/P2/P3 findings remain. |
| R82 tracking | **N/A** | Findings are in-lane for the PR #253 fixer; none are accepted as descoped follow-up substitutes. |

## 8. Recommendation

**Do not flip `EXPO_PUBLIC_FF_MWB_UNDO` and do not mark PR #253 clean.** Dispatch a fixer for all prior findings plus N1-N3, then run a fresh R81 re-audit. The first fixer priority should be the D7B canonical delete-set/identity refactor, because it should solve both stale delete markers and post-insert `clientId` preservation in one abstraction.

## 9. Required fixes before R81 closure

1. **P1:** Implement the D7B canonical delete-set abstraction and clear/consume delete intent on undo restore.
2. **P1:** Preserve newly added row command identity across clean server-id adoption; add an add-then-adopt-then-undo regression test.
3. **P2:** Add integration pins for remove-then-undo/adoption, reorder-undo, exercise-field-undo, and no-op inverse detection.
4. **P2:** Add live-region/status accessibility to the undo toast and pin it.
5. **P2:** Move undo pushes and delete-set side effects out of React state updater functions.
6. **P2:** Add undo invocation/failure/overflow telemetry with tests.
7. **P3:** Document/fix `applyInverse` dependency-array contract.
8. **P3:** Fix toast capacity-vs-remaining-depth copy semantics.
9. **P3:** Correct the `UndoButton` divider-token docstring.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/253`.
- Merge commit: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- Prior audit: `/home/user/workspace/audit-work/outputs/POST_MERGE_PR253_AUDIT_2026-06-15.md`.
- Original audit: `/home/user/workspace/audit-work/outputs/PR253_AUDIT_2026-06-14.md`.
