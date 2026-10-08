# WORKOUT-RESUME-131 (agent 131) — report

Status: PR open, CI pending (updated 21:12 PDT).
PR: growth-project-mobile#553 (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/553), branch `agent131/workout-resume-131`, head eb552f226dc6a4cbb3d0a814e440594f8a4e13dd (fix commit d6a1836a + `git merge origin/main` at 2bed5deb, clean).
Size: 354 additions, 46 deletions, 6 files (400 changed lines; 45 of the deletions are the routine mapping moved unchanged into a helper).

## Scope traced

- Plan row C2 (FIX_PLANS_130_131.md) and recon row (JOBS131.md): `src/screens/client/ActiveWorkoutScreen.tsx` resume :319-334, elapsed from `startedAtMs` :264-279 (main e1688b51 line numbers).
- Clock: `sessionStartMsRef` anchor, `recomputeElapsed` (was `Date.now() - startedAtMs`), `adoptPersistedSession` (same), Finish `durationMinutes = Math.round(timer / 60)` (now :734), queue key `<user>:<startedAtMs>` (now :806), assignment `started_at` (now :824, :955), AppState foreground re-anchor (now :399-411), autosave payload (now :427-440), refused-save re-save (now :1036-1045).
- Restore: `loadActiveWorkoutSession` returns `{ session, isStale }` (stale = 12 h since `updatedAtMs`, `src/storage/activeWorkoutSession.ts`); TRAIN-GATE-128 reopens with no prompt; FU-WORKLOG2-126 `resumedSessionRouteParams` carries the saved name and assignment when a different workout is opened.
- Readers of the saved session outside the screen: `WorkoutSyncCards.tsx:89-95,140` ("Started ... ago" from `startedAtMs`, Resume sends `resume: true`), Home Resume, WorkoutAssignmentDetail "Resume workout" label (keyed by assignment).
- Backend (RO-backend 80cebd11, production): `src/workout/workout.dto.ts:80-84` `duration_minutes` `@Max(1440)`; `workout-builder.service.ts:856` stores `started_at` as sent, no duration derived from it.

## B list

- none.

## U list

- U1 — seen in a test. Reopening a saved workout more than 12 hours after its last change counted the clock from the start to now (failing-first on main e1688b51: 108,004 s shown for a one-hour workout; Finish would send 1,800 minutes). From the code: the server refuses more than 1,440 minutes, so that workout could not be saved. Fixed: the gap since the last change is left out (`resumedPausedMs`, `src/utils/workout/workoutLogging.ts:309-319`), kept in `pausedMsRef` (`ActiveWorkoutScreen.tsx:176`) and saved with the session as `pausedMs` (`activeWorkoutSession.ts:60-62`), used at `:250`, `:263-267`, `:405-406`, `:429`, `:1038`. Start time, offline key and assignment `started_at` stay the true start.
- U2 — seen in a test. When the phone closed the app before anything was entered, opening a different workout opened the old empty session under its old name (failing-first: Leg Day opened, Bench Press from Push Day shown, Back Squat absent). Fixed: `ActiveWorkoutScreen.tsx:321-330` clears a saved session that `isUntouchedSession` (`workoutLogging.ts:292-301`) finds exactly as it opened, when the opened workout differs (name, assignment or exercises), and starts the opened workout. Same workout or Resume card: still reopens. Anything entered (ticked set, notes, edits): still reopens (m#521 Sol B rule).

## C one-liners

- C1: the routine-to-session mapping moved unchanged from the screen's `useMemo` into `routineSessionExercises` (`workoutLogging.ts:260-285`) so the screen and the untouched check share one definition.
- C2: outdated comments ("Resume?" prompt) in the restore effect and the storage header now describe the current behaviour.
- C3: existing lint warning, unused `toServerMuscleGroup` import (`ActiveWorkoutScreen.tsx:38`, also on main). Not touched.

## Evidence

- Failing-first (main e1688b51, only the new test file added): `ops/reports/WORKOUT-RESUME-131-failing-first-main-e1688b51.log` — 5 failed, 3 passed (the 3 are regression guards that must keep passing).
- After: `ops/reports/WORKOUT-RESUME-131-after.log` 8/8; `ops/reports/WORKOUT-RESUME-131-regression.log` (14 files, one per heavy.sh run, all green). Re-run after `git merge origin/main`: workoutResume131 8/8, ActiveWorkoutScreen.persistence 40/40.
- Targeted eslint on the changed files: 0 errors, 1 existing warning (C3).

## PRs

- growth-project-mobile#553 — CI pending.

## Proposed (needs operator)

- P1. App kept suspended in memory for more than 12 hours (screen still mounted), then brought back: the foreground path (`ActiveWorkoutScreen.tsx:399-411`) does not go through the restore, so the gap still counts. Default: a follow-up of about 10 lines plus a test (note the time on background; on return after more than 12 hours add the gap to `pausedMs` and save). Not done here: no new work beyond the entry.
- P2. Gaps under 12 hours (for example a workout left open for 6 hours) still count in full; the 12-hour window is the existing boundary. Default: leave as is.
- P3. Unused import warning at `ActiveWorkoutScreen.tsx:38` (C3). Default: leave for a lint-cleanup lane.
