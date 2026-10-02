# Lane B-JOURNEY (agent 111) — Claude Opus 5.5 builder: welcome message + workout reminders, then three small launch items

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; prompt v5 section 4.3 items 8 (welcome message, +13 min, Bradley's exact
text is runtime data set at C04 and NEVER enters a repo — write "the coach's welcome text" in code/tests/docs) and the reminders
line, section 4.9 (flags), section 12 items 6, 8 and 10 in
/home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md; /home/user/workspace/ops/lanes110/B-TRAIN-2.md
and B-607-FIX.md (110's notes on #609 readiness: env registration, live RLS tests).
Do in order, pushing each as soon as its tests pass:
1. backend #609 @ 5fd61a1b (T3; no audits yet; CI green at that head but it predates main's #624 env registration, #626, #604,
   #629): merge main b9ee8e0a (merge commit, no rebase), register every env name #609 reads in ENV_RULES with its real default +
   reason, make sure the welcome job respects consent/AI rules where relevant, keep migration 20270213000000, confirm RLS tests run
   in CI, update the PR body (tier header, evidence). Its flag must have an entry in the launch-flag manifest from backend #637
   (branch agent/clinic/flags-manifest; not merged yet): if #609 introduces a flag not in #637's manifest, say so in your report
   with the exact entry text the operator should add (do not edit #637).
2. mobile #312 @ 5b26e1f4 (T3; DIRTY): merge main e3986e89 (merge commit), resolve conflicts, align with #609's API exactly, tests.
3. mobile #324 @ 7f20255d (T2; Sol REQUEST CHANGES B-324-1: a support email that fails to launch is silent -> visible failure,
   selectable/copyable address, Retry, tests; also any Sol C): merge main first. (B-UGC-3 solved the same problem for the safety
   email on mobile #314 head 4192ba9 — reuse that pattern/component if sensible, without depending on #314 being merged.)
4. B-QUIZ-OFF (new small backend PR, T2): switch the TGP Finance diagnostic quiz off in the fitness backend (it belongs to another
   product): routes/flags off and unreachable, no table drops, tests proving the routes are gone/closed; no public text mentions it.
5. scripts/setup-branch-protection.sh (new small backend PR, T4 CI-gate file): list all 10 required checks exactly as live branch
   protection has them (adds "Schema parity (migrations match schema.prisma)"), with a test that the script's list equals the
   expected list. Do not run the script.
Tests via heavy.sh (targeted jest --runInBand; backend tsc with NODE_OPTIONS=--max-old-space-size=3584 once per round). Never
merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/B-JOURNEY-111.md (append per item).
Final answer (<400 words): PRs, heads, what changed, tests, CI.
