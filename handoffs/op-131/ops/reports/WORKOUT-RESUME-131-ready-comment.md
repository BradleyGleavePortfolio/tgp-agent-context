FIX ROUND 1 (OPENING) (WORKOUT-RESUME-131, agent 131) — growth-project-mobile#553 @ eb552f226dc6a4cbb3d0a814e440594f8a4e13dd — READY FOR AUDIT

B: none.

U1 — seen in a test: a saved workout reopened more than 12 hours after its last change counted its clock from the start to now. Failing-first on main e1688b51 showed 108,004 s for a one-hour workout, so Finish would send 1,800 minutes. From the code: the server refuses more than 1,440 (`src/workout/workout.dto.ts:80-84` at production 80cebd11), so that workout could not be saved. Fix: `resumedPausedMs` (`src/utils/workout/workoutLogging.ts:309-319`) leaves the gap since the last change out. `pausedMsRef` (`ActiveWorkoutScreen.tsx:176`) is used by the clock (`:250`, `:263-267`), the rollback re-anchor (`:405-406`), the autosave (`:429`) and the refused-save re-save (`:1038`), and is saved as optional `pausedMs` (`src/storage/activeWorkoutSession.ts:60-62`), so a later reopen keeps the gap out. Start time, offline key `<user>:<startedAtMs>` and assignment `started_at` stay the true start.

U2 — seen in a test: when the phone closed the app before anything was entered, opening a different workout opened the old empty session under its old name. Failing-first: Leg Day opened, but Push Day's Bench Press was shown and Back Squat was missing. Fix: `ActiveWorkoutScreen.tsx:321-330` clears a saved session that `isUntouchedSession` (`workoutLogging.ts:292-301`) finds exactly as it opened, when the opened workout differs (name, assignment or exercises), and starts the opened workout. The same workout or the Resume card still reopens it. A session with anything entered (ticked set, notes, edits) still reopens whichever workout is opened (m#521 Sol B rule). The routine mapping moved unchanged into `routineSessionExercises` (`workoutLogging.ts:260-285`), so the screen and the check share one definition.

Acceptance: before the fix, `src/__tests__/workoutResume131.test.tsx` had 5 of 8 tests failing on main; after it, 8 of 8 pass. 13 related files also passed locally, one targeted file per `ops/heavy.sh` run: ActiveWorkoutScreen.persistence 40/40 (one source regex updated for the new `adoptPersistedSession(session, isStale)` call), workoutLogging2126, workoutSync124.screen, restAlertQuietFinish127, homeWorkoutEntry130, romanP3FlagOffFinishWorkout, entitlementGateKeepsWorkout, workoutLoggingUx124, romanP3HostWiring, romanP3FlagOff, assignedWorkoutEntry127, copyVoice.guard, truthfulCopy.guard and quietLuxuryDoctrine.

CI ("Typecheck, lint, test" and CodeQL) is green at this exact head ([CI run 37726333412](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37726333412)). origin/main was merged in at 2bed5deb with no conflict. Size: 354 additions, 46 deletions, 6 files.

No route, button or copy change; parity table and truthful sweep are in the PR body. `src/screens/client/README.md` is updated. The request shape is unchanged, so this works against the current production backend. No backend, flag, dependency, lockfile or production change.

Not fixed (in the report as Proposed): an app left suspended in memory for more than 12 hours still counts the gap on the foreground path (`ActiveWorkoutScreen.tsx:399-411`). Gaps under 12 hours still count.

agent 131
