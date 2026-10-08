# TRAIN-GATE-128 (FIXWAVE-128, agent 128, Claude Opus 5.5, mobile T4)

## Scope traced
FW-TRAIN-128 B1 / J1 + owner correction 15:03 10-07 (operator mail 15:04, overrides the row's "Discard workout" wording).
Files: src/entitlements/{EntitlementProvider,ProtectedScreen}.tsx, src/screens/client/ActiveWorkoutScreen.tsx,
src/screens/client/active-workout/leaveGuard.ts (new), src/navigation/ClientNavigator.tsx (tabPress guard only),
src/screens/client/README.md, tests: entitlementGateKeepsWorkout (new), restAlertQuietFinish127, ActiveWorkoutScreen.persistence,
workoutLogging2126, workoutSync124.screen, protectedScreenFailClosed.

## B list
- B1 fixed: foreground re-check unmounted the live workout (spinner) and weak signal showed "Choose a Plan" to a paid client.
  ProtectedScreen keeps children on 'checking'/'unavailable' once `confirmedActive` (set by server "active"; cleared by "inactive",
  any 402, identity change). First fetch still fails closed.
- Owner 15:03: no delete option in the return path or screen; reopen goes straight in; leaving (back, gesture, Leave, other tab)
  with sets logged asks "Log this workout?" Keep training / Finish and log.

## U list
none new.

## C one-liners
- C (edge, deferred to 10k clients): app killed by the OS mid-workout reopens on Home; Train shows the Resume card (no auto-open on cold start).
- C (edge, deferred to 10k clients): Leave/tab question while ExerciseDetail is pushed above the workout.

## PRs
- m#521 agent128/train-gate-128, head see HANDOFF, ~602 changed lines (447+/155-), 12 files. CI: see HANDOFF. Verdicts: not waited (owner 14:08 override).

## Not fixed (needs operator)
- Decision (default given): nothing-logged leave from the screen releases the empty session (no logged set lost) so the next
  Quick Workout/routine/coach workout opens clean. Default: keep. Alternative: keep empty sessions too (then a different routine
  reopens the empty one).
- "Finish and log" after a tab press lands on Train (normal Finish destination), not the tapped tab. Default: keep.

## HANDOFF
Stopped at 15:28 PDT on owner STOP (operator 15:27). m#521 head 0b10156da508c37cba55a18f902ad97ab6cb953e (602 changed lines, 12 files).
CI history: c7a53b50 failed lint (no-regex-spaces in persistence test, fixed); 87fb6abd failed 1/9228 tests (clientTabLabels: the
test auto-mocks every ../screens/ import, so the guard module moved to src/navigation/workoutLeaveGuard.ts, fixed). CI at 0b10156d
NOT yet observed. Local passes at this head: clientTabLabels 1/1, restAlertQuietFinish127 21/21; earlier: entitlementGateKeepsWorkout 5/5,
ActiveWorkoutScreen.persistence 40/40, workoutLogging2126 11/11, workoutSync124.screen 8/8, romanP3FlagOffFinishWorkout 4/4,
copyVoice.guard 8/8, protectedScreenFailClosed 6/6.
NOT done: READY comment not posted (CI green at head not confirmed). Next agent: check `gh pr view 521 -R BradleyGleavePortfolio/growth-project-mobile
--json statusCheckRollup`; if green, post `FIX ROUND 1 (OPENING) (TRAIN-GATE-128, agent 128) — growth-project-mobile#521 @ <head> — READY FOR AUDIT`;
if red, fix only that failure. PR body still says leaveGuard lives in active-workout/ in one place: no, body does not name the path (OK).
Worktree: /home/user/workspace/wt/TRAIN-GATE-128-mobile (branch agent128/train-gate-128).
