# Lane B-TRAIN — resolve merge conflicts for dual-approved backend PRs (T4; builder Claude Opus 5.5)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly (heavy.sh only, targeted jest
--runInBand, df -h / each block, no npm install, own worktree via ops/link_deps.sh backend <wt>, never merge).
Context: branch protection on backend main is strict. Main is now 10dff85c (#606, #625 schema drift + schema-parity
gate, #597 signup role choice C13, #622 AI consent ledger). These dual-approved PRs now conflict with main:
1. #599 fix(auth): report invite attach outcome, refuse silent re-parent (approved head 7b496aca). Conflicts:
   .env.example, src/auth/auth.service.ts, src/common/env-validation.ts, src/invite-codes/invite-codes.service.ts,
   test/invite-codes.service.spec.ts. #597 and #599 BOTH reworked attachUserToCoachByCode (conditional attach,
   same-coach race class: main has SameCoachAttachRace, #599 has AttachRaceSameCoach + INVITE_ATTACH_ERROR codes +
   tryAttachInviteCode). Resolve semantically: keep every guarantee of BOTH PRs (main's C13 role choice and
   coach-cannot-redeem behavior; #599's machine-readable attach outcome, refusal to re-parent, idempotent same-coach,
   AUTH_SIGNUP_WITH_CODE_PER_HOUR burst cap), one race class, one code path, no duplicated helpers. Read both PRs'
   audit comments (Sol + Opus) so no closed finding reopens.
2. Then #595 (invite-code package bindings; approved head e1dd4c39) once #599 merges — the operator will message you.
3. Then #604 (throttler isolation; approved head 21ffc02c) — operator will message you.
Method per PR: worktree from the PR branch; `git merge origin/main` (merge commit, NO rebase, NO force push, so
auditors can diff the resolution); resolve; run tsc, eslint on touched files, targeted jest for every touched area
(auth, invite-codes, throttler/entitlement as relevant) plus `node scripts/ci/schema-parity-gate.js` if prisma files
are touched; push to the PR branch; post a PR comment "Merge-train conflict resolution" listing each conflicted hunk,
which side won and why, and the tests run; append to /home/user/workspace/ops/reports/B-TRAIN.md; final answer per PR
with the new head. Stop after each PR and wait for the operator's message before starting the next one.
