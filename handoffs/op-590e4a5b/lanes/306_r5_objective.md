# #306 fix round 5 (owner go 2026-10-01 11:38 PDT) — mobile signup role choice (T4 by inheritance from auth)

Builder: read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly (own worktree, api_credentials=["github"], heavy commands ONLY via /home/user/workspace/ops/heavy.sh, never npm install into shared deps, never run full jest unscoped, never merge). Owner warning: a sandbox crash wastes massive work — keep memory/CPU low (targeted jest with --runInBand, one heavy command at a time).

PR: BradleyGleavePortfolio/growth-project-mobile #306, branch clinic/m4-role-choice, head 4b349d3211f69168baf020f28a650a2bb403da1f.
Findings to close (read them in full first):
- Sol r4: /home/user/workspace/ops/sol_306_r4_findings.json and comment https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306#issuecomment-5936578708 (B-306-1/2/3).
- Opus r4: /home/user/workspace/ops/opus_audit_306_r4_comment.md and https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306#issuecomment-5936642531 (B-306-1, C-306-1..3). Prior round notes: /home/user/workspace/ops/build_306_r4_fixes_report.md.
New backend contract to match (#597 now at e3167fe7, fix round 4, report /home/user/workspace/wt/authstack-logs/authstack_fix_report.md):
- Registration never deletes identities. A pre-existing unconfirmed identity is bound only with password proof; otherwise `409 signup_pending`. Mobile must handle `signup_pending` with calm copy: "Check your email to finish signing up, or reset your password." plus actions: Resend email (if an endpoint exists; else omit), Reset password (existing flow), Back. No dead buttons.
- Role choice flag: backend SIGNUP_ROLE_CHOICE_ENABLED / signup-policy; when off, the mobile must show client-only signup with no role UI (D4 fallback). Invite-code (#599) and Google/Apple paths must carry intended_role correctly or omit it per policy.
Deadline: dual approval by Fri 10-02 12:00 PDT or the launch goes client-only (D4) — finish today.
Deliver: push to the existing branch (rebase on current origin/main first if needed; force-with-lease only on our branch), fix-round-5 table in the PR body (each finding → change → test), targeted tests for every finding + signup_pending + flag-off path, tsc/eslint clean on touched files, CI green at the final head. Report to /home/user/workspace/ops/build_306_r5_report.md and as your final answer: head SHA, per-finding disposition, tests, CI, open risks.
