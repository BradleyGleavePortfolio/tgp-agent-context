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

- 22:2x operator: YES to the 3 NEED items as one follow-up PR + the Opus a11y C + one-liner Cs + SHOTS-134B item f.
- PR m#641: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/641, branch agent134/coach-home-cards-134 (off main
  e3c55596, merged origin/main 737f4e60; README rows last). 231 lines. Head e60b8ec45e69beba46f91389f28c8b61e13af338.
  Cards: radius.card hairline, serif titles, Money need in forest words. Urgent card: "Send a message" accessibilityAction.
  Change line "on the same days in <month>". f: tabs gutter to gutter (space-between, minWidth 44, maxFontSizeMultiplier 1.2;
  17.218 em measured from Inter TTF); overlinePair (short date / no name when it does not fit, widths from Inter Medium hmtx);
  lining-nums on serif figures. Web render of this branch (harness copy shots134/harness-ch134, output shots134/ch134/*.png):
  tabs fit, one-line overline, lining 1, rounded cards (seen in a web render, not a device).
  Local tests all pass (list in the PR body); tsc + eslint clean. CI green, MERGEABLE CLEAN; READY posted (FIX ROUND 1).
- SAFE STOP received after READY; nothing else pushed.
- Seen in a web render, outside my entry: the LTV dashboard's failed state says "Unable to load LTV metrics. Check your
  connection." with a filled Retry (CoachLtvDashboard.tsx; generic copy). Harness had no ltv fixture. Not changed.

## HANDOFF
- SAFE STOP. m#633 MERGED (13081f41). Follow-up **m#641** open for the lenses and the merge loop: branch
  agent134/coach-home-cards-134, head e60b8ec45e69beba46f91389f28c8b61e13af338, CI green, CLEAN, 231 lines,
  `FIX ROUND 1 (OPENING)` READY posted. No verdicts yet. Worktree /home/user/workspace/wt/COACH-HOME-134-mobile is on that
  branch, clean, nothing unpushed. No other WIP branches.
- Next for agent 135: wait for LN-OPUS-D-134 and LN-SOL-D-134 at e60b8ec4. On a B: fix at the current head in the worktree, run
  each touched test file alone via `/home/user/workspace/ops/heavy.sh npx jest <file>` (coachHomeCards134, coachHome134,
  qaCoachHome131, money, coachSetup, coachSetupRound2), `heavy.sh npx tsc --noEmit -p .`, one push, CI green, then post
  `FIX ROUND 2 (COACH-HOME-134, agent 134, COACH-HOME-134) — growth-project-mobile#641 @ <sha> — READY FOR AUDIT`.
  If main conflicts: `git merge origin/main` (never rebase).
- Left out on purpose (not one-liners): ltv-metrics is read twice (CoachLtvDashboard fetches on its own); the narrative count vs
  the sharing-gated cards; Sol C, failed optional reads stay silent. Outside my entry, seen in a web render: CoachLtvDashboard's
  failed state uses generic copy ("Check your connection") with a filled Retry.
- Web render of a branch: shots134/harness-ch134 points at this worktree (`cd shots134/harness-ch134 &&
  /home/user/workspace/ops/heavy.sh ./build.sh dist`, then `python3 capture_scroll.py dist /home/user/workspace/shots134/ch134
  coach-home`). Current shots: shots134/ch134/coach-home-{360x800,390x844}{,-cards}.png (web render, not a device).
