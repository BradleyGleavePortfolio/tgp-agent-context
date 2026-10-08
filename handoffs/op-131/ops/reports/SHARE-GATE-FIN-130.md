# SHARE-GATE-FIN-130 — finish the coach sharing gates (finisher, agent 130, Claude Opus 5.5, T4 privacy)
Status: DONE 18:46 PDT 10-07. b#865 open, CI green at 9523b5ec, merge state CLEAN, READY posted. Builder ends (no verdict wait). Source: FIX_PLANS_130_131 section B row SHARE-GATE-FIN-130; original job CF-SHARE-GATE-128
(FW-COACH-128 U2 / FWC-SHARE-GATE-128); builder report reports/CF-SHARE-GATE-128.md.

## PR
- growth-project-backend#865 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/865
- Branch agent129/cf-share-gate-128, head 9523b5ec65d32cf8087ed3b6dfe361c59395033f (builder commit dc75b0e5 + merge of origin/main
  d6065661 at 78f513ac, clean + test typing fix 9523b5ec).
- 503 changed lines (source 224, tests 279), 8 files. Title: fix(privacy): coach sharing switches gate every coach read (CF-SHARE-GATE-128, T4).
- Body: /home/user/workspace/ops/reports/SHARE-GATE-FIN-130.pr-body.md (tier header, what changes, scope table, B/U, not-in-PR reads).
- CI run 1 at 78f513ac: build-and-test FAILED at Type-check: test/coach-sharing-coach-reads.spec.ts(184,19) TS2339 'checkIn' not on
  the mock type (in `{ ...fromEntries(...), named keys }` tsc keeps only index signatures common to both sides). The builder ran jest
  only (babel, no type-check), so it never showed locally. Fix 9523b5ec: name `checkIn: prisma.checkIn` in the mock (2 lines,
  tests only); a lib-only repro reproduces TS2339 before and compiles after; spec 10/10 still passes.
- CI run 2 at 9523b5ec: all checks green (build-and-test run 37714001777 SUCCESS), mergeable, merge state CLEAN (18:46).
- READY posted 18:46:32 (head re-checked on GitHub just before):
  https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/865#issuecomment-6050477963
  First line: FIX ROUND 1 (OPENING) (SHARE-GATE-FIN-130, agent 130) — growth-project-backend#865 @ 9523b5ec65d32cf8087ed3b6dfe361c59395033f — READY FOR AUDIT
- Verdicts: none yet (lenses: Claude Opus 5.5 + GPT-6.1 Sol at 9523b5ec).

## Evidence (local, through heavy.sh, one file at a time)
- test/coach-sharing-coach-reads.spec.ts: 10/10 pass at 78f513ac; 10/10 FAIL on main d6065661 (main's six source files swapped in,
  then restored; assertion diffs such as "Expected [] / Received 14 lines" on the check-ins list, not import errors).
- Pass at 78f513ac: coach-ptm-risk-board (11), command-center.service (24), check-ins.service (20), client-guidelines-read (5, new on
  main, builds CoachController), coach.service (8), coach.service.sub-coach-scope (5), coach-roster-activity (4), module-graph (2,
  compiles AppModule with ConsentService DI-required).
- AdminPtmService.getRiskBoardForCoach on main honours opts.clientIds (admin-ptm.service.ts:437), so the risk-board filter is real.

## B list
- B1 (seen in a test) Command Center (first coach tab, live API: mobile commandCenterApi.ts __USING_MOCK_DATA=false) and Clients >
  Risk board ignored the sharing switches. command-center.service.ts getOverview :294, getAtRisk :452, getWinStreaks :580,
  getActionQueue :791; coach.controller.ts :114 + coach.service.ts riskBoardClientIds :348. Fixed in b#865. How a coach hits it: a
  client turns "Check-ins and habits" off and the coach still sees that client's missed check-in alert, streak and At risk entry.

## U list
- U1 (seen in a test) API-only reads (no caller in mobile main 9b37c5df): GET /coach/clients/:id/check-ins full rows
  (check-ins.service.ts :317; mobile getClientCheckIns has no caller, README stale); GET /coach/dashboard, /coach/alerts,
  /coach/dashboard/summary (legacy CoachHomeScreen "Dashboard" route, nothing navigates to it) (coach.service.ts :713, :769, :864).
  Fixed in b#865. How: a coach calling the API directly saw the switched-off data.

## C one-liners
- C (edge, deferred to 10k clients): CheckIn.weight_kg rides inside a shared check-in even with Weigh-ins off; the app never sends it.
- C (edge, deferred to 10k clients): POST /coach/clients/:id/check-ins/:id/reviewed returns the full row (needs an id the coach can no longer list).

## The three extra reads (row: "only matter if their screens ship") — checked: none ships, not changed
- GET /coach/home/daily-rings (src/coach/home/coach-home.service.ts:190-195): only consumer is CoachHomeScreen's three-arc widget,
  behind EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER (default off, absent from eas.json); backend behind FEATURE_ROMAN_THREE_ARC_COUNTS
  (absent from fly-env-desired-state.json = off, returns a zeroed shape).
- GET /v1/coach/me/clients (src/v1/v1-coach.service.ts:144-155): no mobile caller (mobile uses /v1/coach/me/billing and media only).
- GET /coach/command-center/churn-at-risk (src/coach/command-center/command-center.controller.ts:237): no mobile caller.

## Proposed (needs operator)
1. If any of the three reads above ships (three-arc flags on, web console roster, churn intervention UI): gate it the same way
   (habits scope for the rings and last check-in date, workouts scope for last workout date, all four for churn-at-risk).
   Default: no work now; add to the launch-flags runbook as a precondition for FEATURE_ROMAN_THREE_ARC_COUNTS.

## HANDOFF
- PR growth-project-backend#865, branch agent129/cf-share-gate-128, head 9523b5ec65d32cf8087ed3b6dfe361c59395033f (pushed), base main
  d6065661, 503 changed lines (source 224, tests 279), 3 commits on top of main: dc75b0e5 (builder), 78f513ac (merge origin/main),
  9523b5ec (test typing fix). All Bradley Gleave identity, LEFTHOOK=0, no AI co-author.
- CI green at the head; READY posted (round 1, opening). Nothing left for the builder. Next: two lens verdicts at 9523b5ec; any
  REQUEST CHANGES goes to FIX-OPUS-130 (T4). Later rounds use `FIX ROUND 2 (SHARE-GATE-FIN-130, agent 130, <fixer ID>) — ...`.
- If main moves before merge and conflicts: `git merge origin/main` in /home/user/workspace/wt/SHARE-GATE-FIN-130-backend (no rebase,
  no force-push); files: src/consent/consent.service.ts, src/check-ins/check-ins.service.ts, src/check-ins/coach-check-ins.controller.ts,
  src/coach/coach.controller.ts, src/coach/coach.service.ts, src/coach/command-center/command-center.service.ts,
  test/coach-ptm-risk-board.spec.ts, test/coach-sharing-coach-reads.spec.ts.
- COACH-ROW-SCRUB-130 (coach.service.ts archiveClient :325, unarchiveClient :359, getClientTimeline :402 on main) waits for this merge;
  on this branch those functions sit about 33 lines lower (new helpers sharedClientIds / riskBoardClientIds at :325-357).
- Local verification tip: jest here runs through babel (no type-check); CI's `npx tsc --noEmit` is the type gate.
- Needs operator: 1 (Proposed item 1: gate the three non-shipped reads if their screens ever ship; default no work now).
