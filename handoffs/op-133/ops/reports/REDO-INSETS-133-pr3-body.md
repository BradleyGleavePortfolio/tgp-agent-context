[133] REDO-INSETS-133 PR 3 (operator 18:29 addition, from REDO-LIVE-133 Proposed 1): WorkoutHistoryEditScreen top inset. Bugs: B13, B28, B39. PR 1 #586 (merged), PR 2 #593 (all file-disjoint).

**Tier:** T1 (mobile presentation only).
**Why:** the Edit workout top bar inherits `paddingTop: 56` from the live-workout styles and ignores the safe area, so it sits too tight under an iPhone notch and too low on Android edge-to-edge.
**T4 trigger scan:** none (the save payload, PUT endpoint, discard confirmation and query invalidation are untouched).
**T3 trigger scan:** none (no route, API, flag or storage change).
**Bounded T1:** one style value per screen, from `src/ui` `useScreenInsets` (DS-PRIMITIVES-133 #577).
**Canonical builder:** REDO-INSETS-133 (claude_opus_5_5, agent 133). **Parent owner:** operator agent 133.
**Acceptance evidence:** test below, rendered at 360x800 and 390x844. Not seen on a device.
**Promotion triggers:** none.

## What changes for clients (plain words)
- Train → history → Edit workout: the Cancel / Edit workout / Save changes bar starts 12 pt under the real status bar on every phone. Nothing else moves; both buttons stay.

## B/U list
- B13 / B28 / B39 on WorkoutHistoryEdit: fixed. U: none.

## R1
Verified on main da6442e3: `topBar` spreads `base.topBar` from `active-workout/styles.ts` (`paddingTop: 56`) with no inset. Not already fixed.

## WHY / WHEN / WHO
- The screen was added in 25a46fa0 (#401, WORKOUT-SESSION-124) reusing the live-workout stylesheet, whose fixed `paddingTop: 56` top bar dates from 8cbde425 (#162). The live screen gets its own fix in REDO-LIVE-133 (#583).
- Overlap with #583 (REDO-LIVE-133): it changes this file's `finishBtn` (Save radius) and `setRowCompleted` lines; this PR touches neither (only the `topBar` line, the memo deps, one import and a testID), so the two merge in either order. The Save radius is left to #583.

## Parity table
| Reference | Today's file | What matches | What differs and why |
|---|---|---|---|
| No CATALOG folder for workout editing; CATALOG universal rules + Q5 (breathing room under the status bar) | `WorkoutHistoryEditScreen.tsx` | Top bar breathing room = insets.top + 12, like every screen on `Screen` | Keeps its own bar (not `Screen`): it shares the live-workout stylesheet and its KeyboardAvoidingView; a full move belongs with REDO-LIVE-133's restyle |

## Truthful sweep
No copy changed.

## Evidence
- NEW `src/__tests__/workoutHistoryEditInsets133.test.tsx` (2, failing on main: 56 instead of 36 / 59): rendered in a SafeAreaProvider at 360x800 (top 24) and 390x844 (top 47): bar paddingTop = insets.top + 12; Cancel and Save reachable.
- Green locally: `workoutSession124.test.tsx`, `workoutSessionReachability124.test.ts`, `AssignedWorkoutQuiet127.test.tsx`; `tsc --noEmit` clean.
- README: doc-free on purpose (the `src/screens/client/README.md` row stays true; #583 edits that file).
- Not seen on a device.

agent 133
