# QA-COACH-HOME-131 (Claude Opus 5.5, T1 mobile, agent 131)

Started 21:03 PDT 10-07. Status: done. m#554 READY FOR AUDIT at da05524f (21:36 PDT), CI green, mergeable clean.
Worktree: /home/user/workspace/wt/QA-COACH-HOME-131-mobile, branch agent131/qa-coach-home-131 from mobile main e1688b51.
Entry: FIX_PLANS_130_131.md C3 row QA-COACH-HOME-131 + JOBS131.md recon row (all eight files exist on e1688b51; nothing waits).
Source report: tgp-agent-context/handoffs/op-129/reports/AUD-FIN-DESIGN-129.md (U1-U4, R1-R4, R7, C7; job row QA-COACH-HOME-129).

## Scope traced (mobile main e1688b51)
- coach Home = CoachTabs `CommandCenter` (tab label "Overview") > CommandCenterScreen > OverviewScreen, header = CoachHomeCards
  (setup checklist, brief, Money card) passed at CommandCenterScreen.tsx:93.
- OverviewScreen.tsx:51 starts 'idle'; :73-79 loading branch = bare ActivityIndicator, no header; :81-95 error branch, no header;
  header only in the data branch :116. Colour ladder :145-153 (forest / mutedGold / error), :171 and :220 (error when > 0).
- Same loading/error pattern: AtRiskScreen.tsx:59-81, WinStreaksScreen.tsx:97-119, InboxScreen.tsx:64-86, ActionQueueScreen.tsx:84-106
  (Retry: forest fill, radius 0, 12 pt caption label).
- CommandCenterScreen.tsx:39-45 labels ("At-Risk"), :121-135 tabs, :163-179 styles (12 pt caption, stone #B1A89F, 34 pt tall).
- KpiTile.tsx:43-48 valueColor override. Its only other user, MoneyScreen.tsx:687-739, never passes valueColor.
- TeamManagementScreen.tsx:255-263 red error line + :271-277 "No sub-coaches yet" shown together on a failed GET /sub-coaches.

## Failing-first (seen in a test)
`src/__tests__/qaCoachHome131.test.tsx` (16 tests) run on unmodified main e1688b51: 15 failed, 1 passed (the parity test, which is
meant to pass before and after). Log tail: ops/reports/QA-COACH-HOME-131-failing-first-main-e1688b51.log.

## B list
None.

## U list
- U1 (fixed, seen in a test): the setup checklist and Money card (only links to Stripe setup and Money) were hidden while the
  roster numbers loaded and after a failed read. Overview now renders the header in every state; below it SkeletonScreen
  (testID command-center-overview-loading) or LoadFailedNotice "Roster numbers could not load." with Try again.
- U2 (fixed, seen in a test): numbers in red #B91C1C and gold #C5A253 (2.12:1). All values ink; "Need attention" /
  "Needs attention" under Clients at risk, "Waiting in Actions" under Open alerts. KpiTile `valueColor` prop removed.
- U3 (fixed, seen in a test): 12 pt stone tabs, 34 pt tall, "At-Risk". Now Inter 14 pt (bodySmall), textMuted 4.92:1 on bone /
  accentText active, 2 pt accent underline, minHeight 44, "At risk"; colours from useTheme().semanticColors.
- U4 (fixed, seen in a test): Team red "Could not load team... Tap to retry." beside "No sub-coaches yet". Now LoadFailedNotice
  "Your team could not load." + Try again; the empty line shows only after a successful read.
- U1, R2 part (fixed, seen in a test): At risk / Streaks / Inbox / Actions start in 'loading', SkeletonScreen while loading, calm named error
  with Try again that reloads (generic "Unable to load ... Check your connection" + forest-fill "Retry" removed).

## C one-liners
- C7 (fixed, seen in a test): header flashed in, out, in from the 'idle' first frame; now starts 'loading' and mounts once.

## Changes (from the code)
- New src/components/coach/LoadFailedNotice.tsx (textPrimary sentence, forest accentText "Try again" text button on
  HapticPressable, minHeight 44, no red, icon or fill). CoachErrorState not used: it carries a red chip and RomanAvatar.
- OverviewScreen, AtRiskScreen, WinStreaksScreen, InboxScreen, ActionQueueScreen, CommandCenterScreen, KpiTile,
  TeamManagementScreen; commandCenterScreens.test.tsx error-copy regex `/unable to load/i` -> `/could not load/i` (5 places).
- Docs: src/screens/coach/command-center/README.md (states, header rule, monochrome numbers, tabs, LoadFailedNotice, tests),
  src/components/README.md (LoadFailedNotice row).
- Size: 13 files, 488 + / 276 - = 764 changed lines (under the 800 target).

## Local checks (seen in a test, one file at a time through heavy.sh)
qaCoachHome131 16/16, commandCenterScreens 28/28, coachHomeAudit13 7/7, coachDay1Hunt05 6/6, coachCheckInReviewFu126 9/9,
TeamManagementScreen 14/14, coachSaasBlockers 29/29, iosNonP2PSurfacesMatrix 181/181, commandCenterNavigation 11/11,
quietLuxuryDoctrine 30/30. `tsc --noEmit` exit 0. Logs: ops/reports/QA-COACH-HOME-131-related-tests.log, QA-COACH-HOME-131-tsc.log.

## PRs
- growth-project-mobile#554 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554
  head da05524f07dcca64465e50634d62478e4887a1fe, opened 21:27 PDT. CI green at the head (Typecheck, lint, test; CodeQL;
  Analyze actions; Analyze javascript-typescript), MERGEABLE / CLEAN at 21:36 PDT (main 96b83d0f does not touch these files).
  READY comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554#issuecomment-6052346724
  (text: ops/reports/QA-COACH-HOME-131-ready.md; PR body: ops/reports/QA-COACH-HOME-131-pr-body.md).

## Proposed (needs operator)
- KpiTile keeps its cream fill on bone (Home and Money tiles). Default: leave.
- Team CapacityBar and ScoreBadge still colour-code red / gold; Team still loads with a spinner. Default: separate redo lane.
- CoachLtvDashboard keeps its own older error copy ("Unable to load LTV metrics. Check your connection."). Default: separate lane.
- A failed pull-to-refresh keeps the old numbers with no notice. Default: leave.
- command-center README API table still says MOCKED though `__USING_MOCK_DATA` is false. Default: docs fix in a later lane.
- LoadFailedNotice could become the shared calm error for QA-COACH-STATES-131 / QA-PRIM. Default: reuse after merge.

## HANDOFF
- Done at 21:37 PDT. One PR: growth-project-mobile#554, head da05524f07dcca64465e50634d62478e4887a1fe, READY FOR AUDIT posted
  after the head re-check. Not merged, not deployed, no flags touched.
- B=0, U=4 (U1-U4 fixed, all seen in a test), C7 fixed. 13 files, 764 changed lines.
- For the auditor: the C7 fix relies on the Overview loading/error return and the data return sharing the same leading
  children (banner, header, heading, subheading), so React keeps the header instance; `mounts the header once` in
  qaCoachHome131.test.tsx proves it. KpiTile lost its `valueColor` prop; MoneyScreen never used it (tsc clean).
- needs operator: 6 items under "Proposed (needs operator)", each with a default; none blocks the PR.
- Notify: ops/lanes131/notify/QA-COACH-HOME-131.txt.
