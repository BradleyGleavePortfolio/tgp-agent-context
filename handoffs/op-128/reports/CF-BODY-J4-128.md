# CF-BODY-J4-128 — Report screen

## Scope traced
- Assigned FW-BODY-J4-128 only: ReportScreen.tsx, its tests and matching client README.
- Worktree: /home/user/workspace/wt/CF-BODY-J4-128-mobile; branch agent128/cf-body-j4-128.
- Main at start: 084ed613; no currently open PR changes ReportScreen.tsx.
- U7: Report reads obsolete profile.current_weight instead of current_weight_lbs; start is blank and change absent.
- U9: Report entry dates display raw calendar keys.
- Normal mount initially receives null from useCurrentUser; empty-dependency effect never loads report data after hydration.

## B list
- B1: A client opens Report after signing in and sees zero food totals and no weekly weigh-ins because the initial null user prevents the only load.

## U list
- U7: Read saved profile.current_weight_lbs; show neutral weight change, without gain/loss judgement.
- U9: Format entry dates as Wed 7 Oct.

## C one-liners
- No edge-case work.

## PRs
- Not yet opened. Added failing-first runtime tests; production patch pending.

## Not fixed (needs operator)
- None within assigned scope.

## HANDOFF
In progress: run new runtime tests against unchanged screen, implement narrow fix, run touched tests, merge current main, push once, obtain CI green, post READY, then finish.
