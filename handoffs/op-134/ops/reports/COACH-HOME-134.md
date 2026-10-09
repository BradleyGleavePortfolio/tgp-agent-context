# COACH-HOME-134 (claude_opus_5_5, agent 134) — coach Home (Command Center Overview) to the luxury bar

Worktree /home/user/workspace/wt/COACH-HOME-134-mobile, branch agent134/coach-home-134 (from main 60097251; merged origin/main b3320970).

## Status
- 21:0x read P1-P15, Order, my entry, CATALOG.md, coach-home-solo + coach-home-headcoach targets, today's code.
- 21:00 operator mail applied: built to coach-home-solo for every coach (head-coach layout not built; Home cards stay below);
  every face is a MonogramBadge (no photo upload; AtRiskEntry has no avatar_url); hero = month so far only when real, else
  "No earnings yet this month."; six-month bars left out (no monthly history); retention only from real churn with a base.
- PR m#633: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/633 (790 lines: 589 + 201; tests count).
  README rows commit 8497ec1d, then merged origin/main 382692d8 (conflict in qaCoachHome131 safe-area mock: took main's).
  Head 754e2bf6e001299881a6f907a65b01e13c626e85: CI green (Typecheck, lint, test 6m19s; CodeQL), MERGEABLE CLEAN.
  READY posted 21:42 (FIX ROUND 1 (OPENING)). Opus D: APPROVE @754e2bf6 (B0 U0; Cs deferred: "Send a message" not reachable
  by screen reader inside the card Pressable, ltv read twice, narrative count vs gated rows, change-line wording).
  Sol D: REQUEST CHANGES @754e2bf6, B-633-SOL-D-134-1 (hero hid a real net with no own charge: split income / refunds).
- Fix round 2: commit 13081f41 — hasMonthMoney (charges > 0 or net != 0) for the hero and the earnings link; test for
  split-income and refund-only months. coachHome134 11/11, qaCoachHome131 16/16, coachDay1Hunt05 6/6, tsc + eslint clean.
  796 lines. CI green, CLEAN; FIX ROUND 2 READY posted. Opus D APPROVE and Sol D APPROVE @13081f41 (B0 U0). m#633 MERGED.
- Local (each file alone via heavy.sh): coachHome134 11/11, qaCoachHome131 16/16, coachHomeAudit13 7/7, coachDay1Hunt05 6/6,
  commandCenterScreens 28/28, coachCheckInReviewFu126 9/9, commandCenterNavigation 11/11, quietLuxuryDoctrine 34/34,
  copyVoice.guard 8/8, safeAreaInsets133 17/17; tsc clean; eslint clean on changed files.

## NEED (P10) — changed: NOT done in my PR
The three card restyles were built, then left out of m#633 to keep it one PR under 800 lines (with them it was ~850) and inside my
entry. The ready patch (presentation only, 52 lines) is saved at /home/user/workspace/ops/reports/COACH-HOME-134-cards-proposal.patch.
- NEED src/components/coach/money/MoneyHomeCard.tsx — square boxed card, Inter amount, red "N need attention" pill; restyle to
  radius.card, hairline, serif title/amount, the need in forest words. — COACH-HOME-134. Default: operator assigns (patch ready).
- NEED src/components/coach/setup/CoachSetupChecklist.tsx — square boxed card on Home for every new coach (dot radius 7 literal);
  radius.card + serif title, dot radius.chip. — COACH-HOME-134. Default: operator assigns (patch ready). Note m#622 touches
  other files in components/coach/setup/ (not this one).
- NEED src/components/coach/brief/BriefHomeCard.tsx — same square box (flag coachBrief, on in the clinic profile). — COACH-HOME-134.
  Default: operator assigns (patch ready).

## HANDOFF
- DONE: growth-project-mobile#633 MERGED at head 13081f41696110d58fd84d156dd75ae7640d6a4b (both lenses APPROVE, CI green).
  Branch agent134/coach-home-134; worktree /home/user/workspace/wt/COACH-HOME-134-mobile clean, nothing unpushed.
- Deferred Cs (for a later lane, not blocking): "Send a message" inside the urgent card Pressable is not reachable by screen
  reader (fix: accessibilityActions on the card, CoachHomeSections.tsx ClientCard); ltv-metrics read twice per load; the
  narrative count uses overview at_risk_count while the cards use the sharing-gated at-risk list; change-line wording; silent
  omission of payout/retention/urgent on failed optional reads.
- Needs operator (3 NEED above): the Money card, setup checklist and brief card restyles; patch at
  /home/user/workspace/ops/reports/COACH-HOME-134-cards-proposal.patch (built on main 60097251; `git apply`, then add those three
  files to the source guard list in src/__tests__/coachHome134.test.tsx).
