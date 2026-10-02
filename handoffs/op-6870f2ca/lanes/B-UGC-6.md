# Lane B-UGC-6 (agent 112, round 2 after stop) — Claude Opus 5.5 builder, backend PR #610 only

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Commit identity: git -c user.name="TGP Agent 112" -c user.email="agent@tgp.invalid".
gh/git need bash api_credentials=["github"]. Owner: wall clock is the #1 resource, quality non-negotiable.

PR: BradleyGleavePortfolio/growth-project-backend #610 (community safety backend: report/block/moderation; T4), branch
agent/clinic/ugc-be/7c1d2e9b, head a98d08b5. Opus APPROVE at a98d08b5; GPT-6.1 Sol REQUEST CHANGES 0/2/4 at a98d08b5
(comment https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5960938133 — read it and its probes
under /home/user/workspace/ops/evidence/AUD-SOL-4-112/ if present). Mobile #314 is dual-APPROVED and merges as a pair with #610.
Task: close Sol's 2 B findings with failing-before tests (use Sol's probes as the failing tests where possible). Sol's 4 Cs and
Opus's 5 Cs go to a follow-up PR (B-UGC-5, operator ruling OR-112-6) unless a C is a one-line fix in a file you already touch —
then fix it and say so. Do not change the mobile contract #314 consumes (routes, payload shapes, error codes) unless a B requires
it; if it does, stop and report the exact contract change instead of pushing.
Process: worktree /home/user/workspace/wt/b-ugc-6 from repos/growth-project-backend; `bash /home/user/workspace/ops/link_deps.sh backend`;
`heavy.sh npx prisma generate`; targeted jest via /home/user/workspace/ops/heavy.sh only (never wrap it in a short timeout); eslint on
changed files; `node scripts/check-r75.js --mode=range`. Merge origin/main into the branch (it is BEHIND; main c8e5e71f) and resolve
conflicts if any. Push; wait for all required checks green (max 30 min; community-live-tests too). Update the PR body fix-round
table and post one fix-round comment. Conventional Commits title stays.
At the end unlink node_modules, `git worktree remove --force`. Report: /home/user/workspace/ops/reports/B-UGC-6-112.md ending with
"## HANDOFF FOR AGENT 113". Never merge, dispatch workflows or touch production.
Final answer (<250 words): head, CI, findings closed with test names, anything deferred.
