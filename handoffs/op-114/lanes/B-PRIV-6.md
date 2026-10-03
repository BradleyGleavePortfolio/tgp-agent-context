# B-PRIV-6 — Claude Opus 5.5 builder (T4), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports, Final
answer), /home/user/workspace/ops/_BUILD_COMMON.md, /home/user/workspace/ops/CONSENT_D2_CONTRACT.md, then
/home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict). Report: /home/user/workspace/ops/reports/B-PRIV-6-114.md.
You are the only writer on backend #611.

backend #611 (public privacy policy / terms pages, App Store 5.1.1, re-graded T4) @ fda3afad, BEHIND main. Opus APPROVE at fda3afad
(issuecomment-5963174760); Sol REQUEST CHANGES 0/2/0 at fda3afad (issuecomment-5963440291): B-611-5 the restore procedure does not
preserve the AI choice safely; B-611-6 the new operational backup/restore slice is T4, not bounded T1 documentation. Read every AUDIT and
FIX ROUND comment on #611 first.
1. Operator ruling OR-114-1: resolve B-611-5/B-611-6 by SPLITTING the operational backup/restore procedure out of #611 (simplest adequate
   design, G21): #611 keeps the public policy text and pages; the restore runbook moves to a clearly named follow-up doc/issue that
   states the AI-consent-preserving restore requirement Sol described (re-apply withdrawals/erasures after any restore before the app
   reads the data). The public policy text must still be true (backups, retention window wording) without promising a procedure that
   does not exist. If Sol's comment shows the split cannot make the policy text true, correct the procedure instead and explain why.
   Keep the T4 tier header (never lower a tier).
2. Merge origin/main (merge commit). All 11 required checks green at your head.
3. Publication hold: #611 must not go live until the owner answers its open facts. Collect, from #611's body/comments and the copy itself,
   the exact owner questions (at most 5, plain words, each with a recommended default and what the text says under each answer): the
   "Deleting your account" paragraph, Anthropic retention / zero-data-retention wording, whether Mux is live, Supabase plan + PITR window,
   Stripe/Sentry/Resend/PostHog plan settings. Put them under "## OWNER QUESTIONS" in your report. Do not message the owner.
4. Post "FIX ROUND 6 (B-PRIV-6, agent 114) — growth-project-backend#611 @ <full sha>", update the body, end with "READY FOR AUDIT".
Never name the clinic partner. Quiet Luxury copy. Final answer (<300 words).
