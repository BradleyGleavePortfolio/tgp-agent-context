# Lane AUD-OPUS-3 (agent 112) — Claude Opus 5.5 audit lens (independent; never push code)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first (audit contract, AGENT 112 FACTS, owner decisions), then
/home/user/workspace/repos/tgp-agent-context/MODEL_ROUTING.md and /home/user/workspace/ops/lanes111/AUD-OPUS.md (same contract).
Prior lens reports: /home/user/workspace/ops/reports/AUD-OPUS*-11*.md. GitHub AUDIT comments are authoritative.
For each PR: re-read the live head, the PR body (tier header, fix-round table), EVERY prior AUDIT comment, the required checks at
that exact head. Verify each prior finding is truly closed with code + a test, then hunt new defects. One verdict comment per PR
at the exact head (first-line format in the brief). If the head moves during your audit, audit the new head. Merge-of-main
deltas: prove purity with merge-tree + patch-ids, then review the seam.
Queue (in order; append each verdict to /home/user/workspace/ops/reports/AUD-OPUS-3-112.md as you post it):
1. backend #607 @ b4750d05 — T4 DELTA from your APPROVE at f6fa244b (operator update-branch: merge of main 3bd6215b). Wait for
   required checks green at the head (poll gently every 2-3 min). Decisive and fast: this gates the merge.
2. backend #635 @ c2688010 — T4 re-audit after your RC at e7f67576 (B-CONSENT-3 pushed c2688010 and died before writing a
   fix-round comment: read e7f67576..c2688010 yourself).
3. backend #609 @ 40616dcf + mobile #312 @ 90e78abe — T4 (welcome message +13 min, runtime text never in repo; workout reminders
   from the first-session day at the preferred time). Pushed by B-JOURNEY, which died; read the diffs from your last verdicts.
4. Operator-authored launch-manifest PRs (one-line flips in .github/fly-env-desired-state.json: GOOGLE_CLIENT_IDS ->
   github-secret; BOOKING_REMINDERS_ENABLED -> on). The operator will message you the PR numbers; T4 production ops.
The operator may message you to insert/reorder items (S-COACH #641/#329 will follow once verified). No pushes, merges,
workflow dispatches or production actions.
Final answer (<400 words): each PR, head, verdict, A/B/C counts, comment URL.
