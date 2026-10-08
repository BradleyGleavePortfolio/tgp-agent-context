# QA-COACH-HOME-131 (Claude Opus 5.5, T1 mobile, agent 131)

Started 21:03 PDT 10-07. Status: in progress (building).
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
- KpiTile.tsx:43-48 valueColor override.
- TeamManagementScreen.tsx:255-263 red error line + :271-277 "No sub-coaches yet" shown together on a failed GET /sub-coaches.

## B list
None.

## U list
(filled in as proven)

## C one-liners
(filled in)

## PRs
(none yet)

## Proposed (needs operator)
(none yet)

## HANDOFF
(written at the end)
