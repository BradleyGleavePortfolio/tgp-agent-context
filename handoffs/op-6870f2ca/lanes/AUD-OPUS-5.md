# Lane AUD-OPUS-5 (agent 112, post-stop light round) — Claude Opus 5.5 audit lens (independent; never push code)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully (verdict format at line ~141: first line exactly
`AUDIT Claude Opus 5.5 — <repo>#<n> @ <full 40-char head sha> — VERDICT: APPROVE | REQUEST CHANGES | BLOCK`, then A/B/C findings with
evidence, tier header check, and "outside this diff" notes). Use /home/user/workspace/ops/lanes/AUD-OPUS-3.md as the contract for
method (worktree per PR under /home/user/workspace/wt/aud-opus5-<n>, link_deps.sh, targeted tests/probes via heavy.sh, never wrap heavy.sh
in a short timeout). gh needs bash api_credentials=["github"]. Re-read each PR head right before posting; if it moved, re-check.

Queue (in order; append each verdict to /home/user/workspace/ops/reports/AUD-OPUS-5-112.md; remove each worktree right after posting):
1. backend #649 @ aa1da69ddf0929c52c1186cef845046d28411b93 — T3 (single Opus lens suffices: one repo, data-only migration).
   Migration 20270224000000_build_week_day1_consultation_copy: Day 1 of Build Week points to the consultation instead of the
   switched-off diagnostic quiz (#644 merged). Check: each UPDATE is limited to day_number = 1 and old text (idempotent); the end
   guard (raises if Day 1 still names the diagnostic; operator ruling OR-112-20 keeps it with a read-only pre-deploy SELECT); down.sql
   restores exactly; seed JSON + docs match; Schema parity / forward / reversible CI green; copy rules (no first person, no generic copy).
   Write the exact read-only pre-deploy SELECT the operator should run into your comment.
2. backend #635 @ 9c5ae5efec13807a62bc39d40800b66e6bbeade9 — T4 DELTA audit. Your lens (AUD-OPUS-3) APPROVED at c2688010
   (comment on #635). Audit c2688010..9c5ae5ef: B-CONSENT-4's fix round for Sol's findings at c2688010 (comment 5960268631:
   B-635-4 coded 503 on delete failure, B-635-5 coded 400 on bad list query, C-635-4 deferred) plus the main merge. Confirm the new
   tests fail before / pass after, no regression in consent/retention semantics, error codes stable (ROMAN_SESSIONS_QUERY_INVALID new;
   docs/roman-chat-deletion.md), required checks green at head (build-and-test was re-run after a known flake and is green).
3. mobile #315 — T3 DELTA audit after lane B-315-ERR pushes its fix (poll `gh pr view 315 -R BradleyGleavePortfolio/growth-project-mobile
   --json headRefOid` until it is no longer de1c79aa and the 3 required checks are green; wait at most 30 min, then skip and say so).
   Audit from the last dual APPROVE at d9c2e669 to the new head: B-CONSENT-4's changes ("kept until you delete them or your account")
   and the new policy-link failure copy (must be specific per cause, name the page, give the web address / support email, no generic
   "try again later", no PII to Sentry).
No pushes, merges, workflow dispatches or production actions. Report ends with "## HANDOFF FOR AGENT 113".
Final answer (<300 words): each PR, exact head, verdict, A/B/C, comment URL.
