**CHANGES_REQUESTED — P0: 0 · P1: 1 · P2: 2 · P3: 3**

# Post-Merge PR #253 Audit — R81 Re-Audit — 2026-06-15

## 1. Scope

- **Repo / PR:** `BradleyGleavePortfolio/growth-project-mobile#253` — `feat(mwb): EW2 undo button + command stack (mobile) — EXPO_PUBLIC_FF_MWB_UNDO off`.
- **Merge commit audited:** `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- **Parent / diff swept:** `8166486bfd386e6b3ac3c48d4b6bd660376eae8d..64e2de4dd4625e20fa6b41b7678d999be53ba4fc` — 10 files, +1789/−12.
- **Current main checked:** `origin/main` currently resolves to the same merge commit, `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`; no later mobile fix is present on main.
- **Read-only worktrees:** `/tmp/post-merge-pr253` at the merge commit and `/tmp/post-merge-mobile-main` at current main.
- **Method:** R72 full-surface re-audit plus targeted validation of the operator decision called out for this post-merge pass: D7B canonical delete-set refactor, command-stack push/pop/replay behavior, `EXPO_PUBLIC_FF_MWB_UNDO` flag-off containment, and R79 pin coverage.

## 2. Verdict rationale

The merge remains **not clean under R81**. The command-stack hook itself exists and implements the required push/pop/inverse replay pattern with FIFO depth 20 and no-pop-on-failure recovery. The undo UI is also correctly gated by `EXPO_PUBLIC_FF_MWB_UNDO`, and a flag-off test verifies no button/toast/gesture is bound when the flag is off.

However, the required D7B canonical delete-set refactor was **not applied**. Current main still has the legacy two-structure delete tracking (`deletedKeysRef` plus `deletedSignaturesRef`) embedded inside `CoachWorkoutBuilderScreen`, and the `inverse addExercise` path still re-adds a removed row with a fresh `clientId` without clearing the original delete-tracking entries. That leaves the prior P1 intact: remove an exercise, undo it, and the next autosave adoption can silently drop the restored row because stale D-045 delete intent is still live.

## 3. Charge-by-charge verification table

| Charge | Result | Evidence |
|---|---:|---|
| D7B canonical delete-set refactor applied | **FAIL** | Current main still declares `deletedKeysRef = useRef<Set<string>>(new Set())` and `deletedSignaturesRef = useRef<Map<string, string[]>>(new Map())` in the screen (`src/screens/coach/CoachWorkoutBuilderScreen.tsx:337-417`). No canonical delete-set helper/module/API exists in the changed file set. |
| Delete tracking cleared on undo restore | **FAIL** | `applyInverse → case 'addExercise'` mints a fresh `clientId` and inserts the row, but does not delete from `deletedKeysRef`, consume `deletedSignaturesRef`, or update `rowIdToClientIdRef` (`src/screens/coach/CoachWorkoutBuilderScreen.tsx:1333-1356`). |
| Command stack push/pop/replay implemented | **PASS** | `useBuilderCommandStack` stores a ref-backed stack, FIFO-evicts at capacity, pops before replay, derives `inverseOf(popped)`, calls `applyInverseRef.current(op)`, and restores the popped action on rejection (`src/hooks/useBuilderCommandStack.ts:221-309`). |
| Undo button gated by `EXPO_PUBLIC_FF_MWB_UNDO` off | **PASS** | `mwbUndo: readFlag('EXPO_PUBLIC_FF_MWB_UNDO', false)` (`src/config/featureFlags.ts:277-294`); `CoachWorkoutBuilderScreen` renders `<UndoButton>` only when `undoEnabled` is true (`src/screens/coach/CoachWorkoutBuilderScreen.tsx:1289-1410`, `1458-1463`). |
| R79 flag-off pin | **PASS for flag containment** | `mwbUndoFlagOff.test.tsx` asserts no undo button, no toast, and no Pan gesture with the flag unset (`src/screens/coach/__tests__/mwbUndoFlagOff.test.tsx:181-205`). |
| R79 regression pin for D7B/remove-undo | **FAIL** | Integration tests cover add-then-undo, edit-plan-field-then-undo, and empty-stack no-op only; there is no remove-then-undo/adoption-refetch test (`src/__tests__/coachWorkoutBuilderAutosave.test.tsx:981-1118`). |
| Undo toast live-region confirmation | **FAIL** | Toast view has `style` and `testID` only; no `accessibilityLiveRegion`, `accessibilityRole="status"`, or `AccessibilityInfo.announceForAccessibility` (`src/screens/coach/CoachWorkoutBuilderScreen.tsx:1482-1490`). |

## 4. Findings

| ID | Sev | Area | Finding |
|---|---:|---|---|
| F1 | **P1** | D7B / D-045 delete tracking | Canonical delete-set refactor was not applied; remove-then-undo still leaves stale delete tracking and can be dropped by autosave adoption. |
| F2 | **P2** | R79 regression coverage | No integration pin covers `removeExercise → undo → adoption refetch`, `reorderExercise → undo`, or exercise-field edit undo. |
| F3 | **P2** | Accessibility | Undo success toast is visual-only; no live region/status announcement. |
| F4 | **P3** | Maintainability | `applyInverse` is declared with `useCallback(..., [])` while depending on refs/setters/helpers, preserving the fragile contract from the prior audit. |
| F5 | **P3** | Roman copy semantics | Undo toast passes stack capacity (`20`) as `depth`, so the “steps still in the bank” copy is constant rather than remaining stack depth. |
| F6 | **P3** | Doc hygiene | `UndoButton` docstring still says the divider uses `textMuted`; implementation uses the correct `border` token. |

## 5. Per-finding detail

### F1 (P1) — D7B canonical delete-set refactor is absent; remove-then-undo can still be re-dropped

**Files:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:337-417`, `927-996`, `1315-1356`.

```ts
const deletedKeysRef = useRef<Set<string>>(new Set());
...
const deletedSignaturesRef = useRef<Map<string, string[]>>(new Map());
```

The post-audit requirement was a canonical delete-set refactor per D7B. Current main still keeps two independent delete-tracking structures in the screen: a client-id set and a composite-signature FIFO map. The adoption path drops a server row if its mapped `clientId` is in `deletedKeysRef`, or if its composite signature consumes an entry from `deletedSignaturesRef`.

```ts
case 'addExercise': {
  setRows((cur) => {
    const next = cur.slice();
    const restored: DraftExerciseRow = {
      clientId: generateClientId(),
      row_id: undefined,
      exercise_external_id: op.row.exerciseExternalId,
      ...
    };
    const at = Math.min(Math.max(op.atIndex, 0), next.length);
    next.splice(at, 0, restored);
    return next;
  });
  return;
}
```

The undo-of-remove path re-adds the snapshotted row but never clears the original row’s delete intent. If the user removes a persisted row, then taps undo before/around the autosave adoption refetch, the old client ID remains in `deletedKeysRef`; for id-less rows, the composite signature remains in `deletedSignaturesRef`. On the next adoption, the restored row can be treated as a resurrection of a deleted row and dropped from local state. This is the same trust-breaking P1 from the prior audit and the explicit D7B fix did not land.

**Recommended fix:** Implement the canonical delete-set abstraction in one place, with operations equivalent to `markDeleted(row)`, `consumeRestore(snapshot)`, `shouldDrop(serverRow)`, and `pruneConfirmedGone(serverRows)`. `consumeRestore` must clear/consume the exact delete marker for the restored row before re-inserting it. Then update `removeRow`, `applyInverse('removeExercise')`, adoption filtering, and cleanup to use that abstraction exclusively.

### F2 (P2) — R79 regression pins do not cover the load-bearing undo paths

**Files:** `src/__tests__/coachWorkoutBuilderAutosave.test.tsx:981-1118`; `src/hooks/__tests__/useBuilderCommandStack.test.tsx`.

The hook unit tests cover inverse shapes for all action kinds, but the screen integration suite covers only:

- add then undo;
- edit plan field then undo;
- empty-stack swipe no-op.

There is no integration test for the bug class that matters: removing an existing row, undoing it, draining autosave, simulating/adopting the refetch, and asserting the restored row remains present. There is also no screen-level integration pin for reorder undo or exercise-field undo flowing through autosave.

**Recommended fix:** Add integration tests for `removeExercise → undo → adoption refetch`, `reorderExercise → undo`, and `editExerciseField → undo`. The remove test must assert row presence after the post-autosave adoption refetch, not merely immediately after local state insertion.

### F3 (P2) — Undo toast is not announced to screen readers

**File:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:1482-1490`.

```tsx
{undoEnabled && undoToast ? (
  <View style={styles.undoToast} testID="mwb-undo-toast">
    <Text style={[typography.caption, { color: sc.textPrimary }]}>
      {undoToast}
    </Text>
  </View>
) : null}
```

The toast is visual-only. VoiceOver/TalkBack users who trigger undo receive no status announcement confirming the revert. The button state is accessible, but the completion feedback is not.

**Recommended fix:** Add `accessibilityLiveRegion="polite"` and `accessibilityRole="status"` to the toast container, and add a test assertion that the rendered toast exposes those props.

### F4 (P3) — `applyInverse` empty dependency array remains fragile

**File:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:1315-1392`.

`applyInverse` reads stable setters/refs/helpers today, but `useCallback(..., [])` communicates a no-dependency contract to future maintainers. The next non-stable captured value added to this function will not be surfaced by dependency review.

**Recommended fix:** Add explicit dependencies where appropriate or add a narrow lint-disable comment documenting why all current captures are stable.

### F5 (P3) — Undo toast passes stack capacity instead of remaining stack depth

**File:** `src/screens/coach/CoachWorkoutBuilderScreen.tsx:1394-1424`.

```ts
const commandCapacity = commandStack.capacity;
...
showUndoToast(romanBuilderUndoToast.success({ depth: commandCapacity }));
```

`commandCapacity` is always the configured max depth (20), not the number of remaining undo actions after the pop. The copy remains constant and can mislead users about how many steps remain.

**Recommended fix:** Either pass post-pop `commandStack.size` with copy that says “remaining,” or simplify the toast to a count-free “Reverted.”

### F6 (P3) — `UndoButton` docstring still names the wrong divider token

**File:** `src/components/coach/workout-builder/UndoButton.tsx`.

The docstring says `textMuted` is used for the divider, while implementation uses `sc.border`, which is the correct divider token. The implementation is right; the comment is stale.

**Recommended fix:** Change the docstring to say the divider uses `border`.

## 6. Correctly implemented / do not regress

- `useBuilderCommandStack` implements a real ref-backed command stack with LIFO undo, FIFO eviction at depth, inverse replay, and no-pop-on-failure restoration.
- `inverseOf` is pure and exhaustive across add/remove/reorder/exercise-field-edit/plan-edit actions.
- `EXPO_PUBLIC_FF_MWB_UNDO` defaults `false` unconditionally.
- `pushUndoActionRef` stays null when the flag is off, and `UndoButton` mounts only when `undoEnabled` is true.
- `mwbUndoFlagOff.test.tsx` pins no button, no toast, and no Pan gesture construction when the flag is unset.
- The undo button itself has a 44dp minimum target and disabled accessibility state.

## 7. R0/R72/R74/R77/R79/R81/R82 compliance summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned production patterns | **PASS on inspected PR files** | No new P0 banned-pattern hit was found in the re-audit pass. |
| R72 exhaustive audit | **PASS** | Full PR diff inventory and current-main target seams were swept; this pass did not stop at the P1. |
| R74 identity/trailers | **NO AI TRAILER FOUND** | Merge commit contains only Bradley human co-author text, consistent with the earlier audit’s R0 trailer sweep; no assistant/AI trailer was found. |
| R77 read-only | **PASS** | Audit used detached read-only worktrees; no repo edits/commits/pushes were performed. |
| R79 pins | **PARTIAL** | Flag-off pin exists and passes static intent; the load-bearing D7B/remove-undo regression pin is absent. |
| R81 gate | **FAIL** | P1/P2/P3 findings remain; the PR is not clean. |
| R82 tracking | **N/A in this PR** | No new out-of-lane follow-up is accepted as a substitute for fixing F1-F6; all are in-lane for the PR #253 fixer. |

## 8. Hectacorn bar

The command-stack architecture is strong, but the implementation would not pass a Stripe/Linear/Apple-level release review while the most emotionally important undo action — “I deleted the wrong exercise; put it back” — can be silently undone again by autosave adoption. The feature is dark by default, which prevents immediate production exposure, but R81 requires it to be clear of P0-P3 before the surface is considered clean.

## 9. Required follow-up before flag-on / R81 closure

1. **P1:** Apply the D7B canonical delete-set refactor and clear/consume delete markers on undo restore.
2. **P2:** Add remove-then-undo/adoption, reorder-undo, and exercise-field-undo integration regression tests.
3. **P2:** Add live-region/status accessibility to the undo toast and pin it in tests.
4. **P3:** Document or correct `applyInverse` dependencies.
5. **P3:** Fix undo-toast depth/capacity semantics.
6. **P3:** Correct the `UndoButton` divider-token docstring.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/253`.
- Prior audit input: `/home/user/workspace/audit-work/outputs/PR253_AUDIT_2026-06-14.md`.
