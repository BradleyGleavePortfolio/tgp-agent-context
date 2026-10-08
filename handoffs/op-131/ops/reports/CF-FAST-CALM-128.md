# CF-FAST-CALM-128 (CLIENTFIX-128 row; operator agent 129; Claude Opus 5.5 builder, T1 mobile)

Source: reports/FW-FOOD-128.md job FAST-CALM-128 = U2 + U8 + U9 + U11 + U12 (Widgets start alert) + the U5 profile seed in useSettings.ts.
Started 16:09 PDT 10-07. Branch agent129/cf-fast-calm-128, worktree /home/user/workspace/wt/CF-FAST-CALM-128-mobile, base origin/main
e634d19e (no commits yet; nothing pushed).

## Scope traced
- Open-PR file check (16:12, git only): only m#521 (agent128/train-gate-128) touches src/navigation/ClientNavigator.tsx (imports + tab
  listeners, far from the `Fast` route). Several PRs touch src/screens/client/README.md (lines 20-53); my rows are 56 and 67.
  m#522 touches src/__tests__/quietLuxuryDoctrine.test.ts and m#523 src/navigation/README.md (neither edited here).
- Mobile main code (e634d19e): FastingScreen.tsx:200 schedules the end alert for every fast (switch ignored); useSettings.ts:26 default
  fastingAlerts false; Fast route has no header (ClientNavigator.tsx:496); WidgetsScreen.tsx:69 starts a fast with no alert.

## B list
None.

## U list (all from FW-FOOD-128, fixed in this PR)
- U2 Fasting Alerts honoured (default on). U8 back header on `Fast`. U9 calm Fasting look. U11 honest stat labels. U12 Shortcuts
  "Start fast" schedules the same end alert. U5 (seed part): water goal taken from the profile when the phone has none.

## C one-liners
- C (edge, deferred to 10k clients): settings stay device-wide, not per user (`gp_client_settings`), pre-existing.
- C (edge, deferred to 10k clients): an install that saved any setting before this build keeps the old stored `fastingAlerts: false`;
  the switch shows off and the app obeys it (truthful).

## PRs
None opened (operator STOP at 16:35; nothing committed or pushed).

## Not fixed (needs operator)
- For CF-SETTINGS-128 (owns SettingsScreen.tsx): turning Fasting Alerts off during a running fast leaves that fast's scheduled alert.
  Smallest fix: on toggle off call `cancelFastEndAlert(currentUser.id)` from the new src/utils/fastingAlert.ts.

## Done so far (16:37, uncommitted)
- All code and test edits listed in Left below are written. Tests run via heavy.sh: S-REACH `Fast` back-header case fails on main's
  ClientNavigator line (failing-first, 16:34); with the fix, reachabilityGates 20/20, FastingScreen.p0 8/8, useSettings 3/3 (16:36).

## Left
Run HabitsFasting.launch.test.tsx and WidgetsScreen.test.tsx; READMEs (client rows 56/67, hooks useSettings row, utils fastingAlert
row); commit with the Bradley identity; one push; PR (tier header, parity table, truthful sweep, minimal-diff note: m#521 also edits
ClientNavigator.tsx); CI; READY; notify.

## HANDOFF
- Branch agent129/cf-fast-calm-128 (local only, never pushed), worktree /home/user/workspace/wt/CF-FAST-CALM-128-mobile, exact head
  e634d19e2869e775cc80367732718caba8b371ba (= base origin/main) with uncommitted work: 10 files changed, 442 insertions(+), 238 deletions(-); copy in ops/reports/CF-FAST-CALM-128.wip.patch.
- Done: fastingAlert.ts helper, useSettings default-on + profile water seed, FastingScreen calm pass, Widgets alert, `Fast` back header, tests.
- Left: run the two remaining test files, READMEs, commit, push, PR, CI, READY (see Left). No B found; 6 U fixed locally (U2 U5 U8 U9 U11 U12).
