# Lane B-TRAIN-2 (agent 110) — Claude Opus 5.5 builder: forward-merge dual-approved T4 PRs onto main

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first. Builder: push only to these PR branches with MERGE commits (never
rebase or force-push audited branches). Goal: each PR's new head = old audited head + a merge of current main, with conflict
resolutions that are integration-only and provable, so auditors can attest a delta in one pass.
1. backend #604 @ 21ffc02c (C14 throttler isolation, T4, dual APPROVE on its old base). It was stacked on #595, which is now
   squash-merged into main (990d2f31) with its migration renamed to 20270205000000_invite_grant_bindings. Merging main produces
   10 conflicts (prod-switches.yml, src/auth/README.md, auth.controller.ts, auth.service.ts, invite-codes.service.ts,
   login-throttle-reset.service.ts, throttler.config.ts, and add/add in test/auth-signup-role-choice.spec.ts,
   test/c13-fix-round.spec.ts, test/invite-attach-reliability.spec.ts). Rule: main's version wins for every hunk that came from
   #595/#597/#599/#306 lineage; #604's own throttler/login-reset changes are kept. Delete the stale
   prisma/migrations/20270125000000_invite_grant_bindings dir (main carries the renamed one). After the merge, `git diff
   origin/main...HEAD` must contain ONLY #604's own change set; write that file list + a per-conflict resolution table in the PR
   body, run the targeted throttler/auth/invite suites and tsc through heavy.sh, push, confirm CI + schema parity green.
2. backend #607 @ 245da2e7 (DIRTY; Sol APPROVE + Opus APPROVE at head) and #609 @ 1f8b22b9 (DIRTY): same procedure, one at a
   time; read each PR's verdicts first and report what each PR is and whether it is launch scope.
Report to /home/user/workspace/ops/reports/B-TRAIN-2-110.md after each push (new head, conflict table, tests). Final answer
(<400 words): new heads, per-PR proof that the delta is integration-only, tests, CI, risks.
