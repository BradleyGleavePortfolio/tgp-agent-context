# CF-TRAIN-TAB-128 (CLIENTFIX-128, agent 129, Claude Opus 5.5, mobile T1/T2)

Row: FW-TRAIN-128:TRAIN-TAB-128 (J4: U5 tab copy, U10, U11 tab visual pass, U4 "lb" label) + DESIGN-QA-128:QA-TRAIN-128
(title h1, overlines, hairlines instead of cream boxes, one forest primary, CoachErrorState, chart labels 11 pt, tabular ink stats,
sentence case). Live workout NOT touched (TRAIN-GATE m#521 owns ActiveWorkoutScreen, ClientNavigator, workoutLeaveGuard, entitlements);
m#485 files (ClientWorkoutViewerScreen, WorkoutHistoryEditScreen) NOT touched.

## Status (updated 16:37 PDT, stopped by operator 16:35)
- Worktree /home/user/workspace/wt/CF-TRAIN-TAB-128-mobile, branch agent129/cf-train-tab-128, based on mobile main a1be6fb2. Deps linked.
- Open-PR file check done: no open PR touches WorkoutScreen.tsx, WorkoutSyncCards.tsx, EmptyStateNoWorkouts.tsx. Shared files:
  src/screens/client/README.md (8 PRs; m#521 inserts a row right after the WorkoutScreen row, so the README change goes in a new
  "Train tab" section between Calendar and Health, untouched by every open PR) and src/__tests__/quietLuxuryDoctrine.test.ts (m#522
  edits the Profile lines only; this PR edits the Train strings only).
- Next: failing-first test file -> run on main -> implement -> targeted tests -> push -> CI -> READY.

## Scope traced
WorkoutScreen.tsx (main a1be6fb2), WorkoutSyncCards.tsx, EmptyStateNoWorkouts.tsx, ClientWorkoutViewerScreen (reads no params, lists
upcoming + completed), CoachErrorState, RomanErrorBanner + lib/roman/copy.ts romanGenericError, services/api.ts (only 401s are retried),
tests pinning WorkoutScreen: quietLuxuryDoctrine, workoutLogging126/2126, workoutSessionReachability124, reachabilityGates,
romanP3HostWiring, romanP3FlagOff, workoutSync124.screen (m#521 file, not edited), EmptyState.test.

## B list
none.

## U list (fixed in this PR, planned)
- U-a (FW-TRAIN dead-button table): any load failure replaces the whole Train tab with an error screen, hiding Quick workout, the
  Resume card and the queued-workout notice on weak gym signal. Fix: the error shows inline where routines/history were; header,
  sync cards and Quick workout stay.
- U-b (honest copy): flag-on error line says "my attempts to retry have not succeeded either" but nothing retried (api.ts retries
  only 401s). Fix: CoachErrorState with a true line (QA-TRAIN row).
- U5: coachless copy promises a coach (queued notice "sent to your coach", delete "what your coach sees").
- U10: completed coach workouts unreachable with 0 or 1 pending -> "All coach workouts" row.
- U11 / QA-TRAIN: system-font title, cream boxes, flash tile, 8-9 pt chart text, Title Case, forest numbers, radius-8 Retry.
- U4 short-term: "lbs" -> "lb" in WorkoutScreen.

## C one-liners
- C: "N workouts waiting" counts future-scheduled program workouts (true; FW-TRAIN P5).
- C: CoachErrorState keeps its small red "Could not load" chip on every screen (QA-PRIM owns the calm variant; not launched).

## PRs
- none yet.

## Not fixed (needs operator)
- Coach guidelines icon kept (rule 6); CF-GUIDE-READ-128 owns making GET guidelines work for clients. If GUIDE-READ is not live at the
  23:00 cut the icon still opens a 403 error. Default: keep the icon (GUIDE-READ ships).

## HANDOFF
- Branch agent129/cf-train-tab-128 (worktree /home/user/workspace/wt/CF-TRAIN-TAB-128-mobile); head = main a1be6fb25538b02e961fd379a0d86d71d610ad7a, no commits, nothing pushed, no PR.
- Done (uncommitted, untested): new failing-first test src/screens/client/__tests__/WorkoutScreen.calm128.test.tsx (8 of 9 fail on main, log ops/reports/CF-TRAIN-TAB-128.failing-first-main.log); src/screens/client/WorkoutScreen.tsx rewritten (one forest action per state, All coach workouts row, inline CoachErrorState keeping Quick workout, coachless delete copy, lb, hairlines, 11 pt tabular chart labels, typed getParent instead of the as-any cast).
- Left: WorkoutSyncCards.tsx (neutral queued copy + hairline rows), EmptyStateNoWorkouts.tsx (HapticPressable), quietLuxuryDoctrine Train strings to sentence case, romanP3HostWiring + romanP3FlagOff section 2.10 WorkoutScreen expectations (RomanErrorBanner removed), README "Train tab" section after the Calendar paragraph; then run each targeted jest file via heavy.sh, check size under 800, commit with Bradley identity, push, open PR, CI, READY.
