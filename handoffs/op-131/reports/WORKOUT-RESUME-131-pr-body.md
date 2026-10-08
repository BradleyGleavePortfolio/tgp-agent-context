Tier: T3
Why: changes how the live workout restores its saved per-user session (the clock base, and when a saved session is cleared) and adds one optional field to that saved session. Mobile only, no backend change.
T4 trigger scan: none. No auth/session, tenancy/RLS, sharing, payment or credential change. The only removal is of a saved session still exactly as it opened (no ticked set, no notes, no edited or added set), the same "untouched" test the leave path already uses to release an empty session (TRAIN-GATE-128, m#521 Sol B rule). A session with anything entered is never cleared.
T3 trigger scan: per-user local storage shape gains optional `pausedMs` (backward compatible both ways: sessions saved by older builds read as 0; older builds ignore the field). Restore logic of the live workout changes. The server payload shape is unchanged (`duration_minutes` is still an integer minute count); the offline copy key (`<user>:<startedAtMs>`) and assignment `started_at` stay the true start.
Bounded T1: no (live workout restore path), hence T3.
Canonical builder: Claude Opus 5.5
Parent owner: operator agent 131
Acceptance evidence: failing-first run of the new test file against main e1688b51 (5 of 8 fail: clock shows 108,004 s and 108,000 s for a one-hour workout; the opened Leg Day cannot be found because the old Push Day session opened; the two new helpers do not exist yet). After the change: 8/8, plus 13 related files passed locally, one targeted file per `ops/heavy.sh` run (ActiveWorkoutScreen.persistence 40/40, workoutLogging2126 11/11, workoutSync124.screen 8/8, restAlertQuietFinish127 26/26, homeWorkoutEntry130 3/3, romanP3FlagOffFinishWorkout 4/4, entitlementGateKeepsWorkout 5/5, workoutLoggingUx124 13/13, romanP3HostWiring 35/35, romanP3FlagOff 11/11, assignedWorkoutEntry127 15/15, copyVoice.guard 8/8, truthfulCopy.guard 20/20, quietLuxuryDoctrine 30/30); targeted eslint on the changed files: 0 errors, 1 existing warning (unused `toServerMuscleGroup` import at ActiveWorkoutScreen.tsx:38, on main too); PR CI.
Promotion triggers: changing the offline copy key, the assignment `started_at`, the server payload, or clearing a saved session that holds anything the client entered would need re-grading (T4 if client work could be lost).

## What changes for coaches/clients

Clients:
- A workout reopened more than 12 hours after its last change (for example the next morning) shows the time trained up to that change and carries on from the reopen. Before, the clock counted from the start to now: a one-hour workout reopened the next day read 30:00:00 and Finish sent 1,800 minutes, which the server refuses (`duration_minutes` maximum 1,440, backend `src/workout/workout.dto.ts:80-84` at production 80cebd11), so that workout could not be saved. The gap also stays out when the workout is reopened again and after a refused save. The Resume card still says when the workout started ("Started ... ago" uses the true start).
- If the phone closed the app before anything was entered, opening a different workout (another routine, Quick Workout or another coach workout) now opens that workout. Before, the old empty session opened instead, under its old name (Push Day's exercises when Leg Day was opened).
- Opening the same workout again still goes back into the saved one (same start time), and the Resume card still reopens the saved workout as it is.
- A saved workout with anything entered (a ticked set, notes, an edited or added set) still reopens, whichever workout is opened (unchanged, TRAIN-GATE-128).

Coaches: a workout finished after such a reopen arrives with the time trained instead of being refused (from the code: the server stores the minutes the app sends).

## B / U list

- B: none.
- U1 (EXPLORE-CLIENT-129 U1): Resume of a stale session counted the duration up to "now". Seen in a test (failing-first: 108,004 s shown, 1,800 minutes would be sent); server refusal over 1,440 minutes is from the code. Fix: `resumedPausedMs` (`src/utils/workout/workoutLogging.ts:309-319`) leaves the gap since the last change out of the clock; `pausedMsRef` (`ActiveWorkoutScreen.tsx:176`) is used by the clock (`:250`, `:267`), the rollback re-anchor (`:405-406`), the autosave (`:429`) and the refused-save re-save (`:1038`); `pausedMs?` in `src/storage/activeWorkoutSession.ts:60-62`.
- U2 (LN-OPUS-B3-129, FIX-OPUS-129 C): an empty saved session was adopted when a different workout was opened. Seen in a test (failing-first: Back Squat never shown, Bench Press shown). Fix: `ActiveWorkoutScreen.tsx:321-330` clears a saved session that `isUntouchedSession` (`workoutLogging.ts:292-301`) finds exactly as it opened when the opened workout differs (name, coach assignment or exercises), then starts the opened workout. The routine-to-session mapping moved unchanged into `routineSessionExercises` (`workoutLogging.ts:260-285`) so the screen and the check share one definition.

## Routes/actions before -> after

No route, tab, navigator or button changes. Entry points into `ActiveWorkout`:

| Entry | Before | After | Test |
|---|---|---|---|
| Resume card (Home/Train, `resume: true`), saved workout last changed 12 h+ ago | opens it; clock = now minus start | opens it; clock = time to last change plus time since the reopen | workoutResume131 "counts the clock only up to that change, and Finish sends that duration" |
| Same, reopened again later | clock = now minus start | gap still left out | workoutResume131 "keeps the gap out when the workout is reopened again later" |
| Resume card, saved workout changed within 12 h | opens it; clock from start | same | workoutResume131 "a workout reopened within 12 hours still counts from its start"; homeWorkoutEntry130 |
| Any workout opened while a saved workout with entries exists | opens the saved workout under its own name and assignment | same | workoutResume131 "a saved workout with notes but no ticked set still reopens ..."; workoutLogging2126 |
| A different workout opened while the saved session is untouched | opens the old empty session under its old name | clears it; opens the chosen workout | workoutResume131 "opening a different workout clears the empty one and opens the chosen workout" |
| The same workout opened while the saved session is untouched | goes back into it | same | workoutResume131 "opening the same workout again goes back into the saved one" |
| Finish | duration = clock shown (now minus start) | duration = clock shown (without the gap); offline key and `started_at` unchanged | workoutResume131 (60 minutes, key `c1:<start>`) |
| Leave, Android back, other tab | ask / release empty session | same | ActiveWorkoutScreen.persistence (40) |

## Truthful sweep

- No on-screen copy changed. The clock and the finish summary time show the same elapsed value, now the time trained after a stale reopen.
- Resume card "Started ... ago" (`WorkoutSyncCards.tsx:89-95`, `:140`, unchanged) still measures from the true start, which stays the saved `startedAtMs`.
- Coach assignment `started_at` (`ActiveWorkoutScreen.tsx:824`, `:955`) stays the true start; the backend stores it as sent and derives no duration from it (backend `workout-builder.service.ts:856`, from the code).
- Works against the current production backend: request shape unchanged; `duration_minutes` is now within the limit for a workout reopened the next day.

## README

`src/screens/client/README.md` (ActiveWorkoutScreen row): one sentence on both behaviours.

## Not in this PR (in the report as "Proposed (needs operator)")

- The app left suspended in memory for more than 12 hours (screen still mounted) and brought back still counts the gap (`ActiveWorkoutScreen.tsx:399-411`, the foreground path does not go through the restore).
- Gaps under 12 hours still count (the existing 12-hour window).

agent 131
