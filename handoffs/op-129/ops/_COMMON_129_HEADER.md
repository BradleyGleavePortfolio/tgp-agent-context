# OPERATOR AGENT 129 OVERRIDES (2026-10-07 15:58 PDT). These win over everything below and over JOBS128.md / JOBS129.md where they differ.
# 1. Operator is agent 129 (agent 128 retired at 15:35; its workers are stopped). Sign every comment "agent 129". New branches are
#    agent129/<job-lower> (job IDs keep their names: CF-SETTINGS-128 -> agent129/cf-settings-128). READY first line, exactly:
#    `FIX ROUND 1 (OPENING) (<JOB>, agent 129) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`
#    (finishing an existing PR: `FIX ROUND <k> (<JOB>, agent 129) — ...`). Lenses and fixers: agent127/*, agent128/* and agent129/*
#    head branches are all in scope.
# 2. Verified on GitHub at 15:56 PDT: production = backend deploy 26 87f4489b, healthy. Backend main c3324d4a, mobile main a1be6fb2 (always
#    re-fetch; GitHub wins). FEATURE_ROMAN_TOOLS on since 15:05; FEATURE_ROMAN_MEMORY is being turned on by the operator; FEATURE_ROMAN_PLAYBOOK
#    stays off (b#855 waits for m#513 and PB-GAP-129). The read-only worktrees wt/RO-backend and wt/RO-mobile are at those two mains.
# 3. Deadlines (PDT): builders post READY by 21:30. Mobile main is cut for the iOS build at 23:00 (owner: "regardless"). Lenses loop until
#    22:45 (not 18:30). Standing fixers loop until 22:30. Wall clock is the main constraint, but never trade a rule for speed.
# 4. Up to about 75 workers share ONE sandbox (2 CPU, 7.9 GB) and ONE GitHub token (5,000 requests per hour for everyone; it ran out at
#    15:31 today). GitHub economy, binding:
#    a. Find work on /home/user/workspace/ops/board/board.md: every open PR with head, lines, draft, merge state, CI, the READY line, the
#       Opus and Sol verdicts AT THE HEAD, claims at the head with their age, and what it needs. The operator rewrites it every 3 minutes
#       (time at the top). Do NOT list PRs or read comments across PRs on GitHub to find work.
#    b. Call GitHub only for the PR you are working on (its diff, comments, checks) and for your own pushes and comments. Re-check the head
#       on GitHub right before you post a claim or a verdict.
#    c. Poll CI or a PR at most once every 3 minutes (sleep 180). Never loop on errors. On a rate-limit error run
#       `gh api rate_limit --jq .resources.core` once, sleep until the reset time, then continue.
#    d. Local tests only through /home/user/workspace/ops/heavy.sh, one targeted file at a time; if the heavy line makes you wait more than
#       15 minutes, push and let CI prove it (cite the failing-first test in the PR body).
# 5. Shared deps: /home/user/workspace/deps/<repo>/READY appears when the install finishes (started 15:58). Until then read code and rely on
#    PR CI. The backend's shared node_modules already holds a Prisma client generated from main's schema; run prisma generate only if your
#    PR changes prisma/schema.prisma.
# 6. The 10-07 afternoon owner decisions (13:00-15:35) are not yet in SoT A6.10: read section 9 of
#    /home/user/workspace/tgp-agent-context/handoffs/op-128/HANDOFF.md for them.
# 7. No tester accounts yet (the owner was asked). Explorers and auditors trace from code, read-only SELECTs and unauthenticated GETs; never
#    sign in to production, never create or change data.
# 8. Reports: /home/user/workspace/ops/reports/<ID>.md ("reports/" in any entry means this folder). Notify line:
#    /home/user/workspace/ops/lanes128/notify/<ID>.txt. Put any proven B at the top of your report the moment you prove it.

