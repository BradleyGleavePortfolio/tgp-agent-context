# AUD-SOL-114 — GPT-6.1 Sol audit lens (T4), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Audit contract, Sandbox limits, Git and GitHub), /home/user/workspace/ops/_AUD_COMMON.md,
then /home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict). Report: /home/user/workspace/ops/reports/AUD-SOL-114.md.
Verdict line: `AUDIT GPT-6.1 Sol — <repo>#<n> @ <full 40-char sha> — VERDICT: APPROVE | REQUEST CHANGES | BLOCK`.
Re-read each head right before posting; if it moved, audit the new head. One verdict per PR per head. Skip items that wait on CI/builders and come back.

Queue (in order):
1. backend #627 (S-FEE coach payout, money, T4) @ 7c29d98121d931af04d68038f97aec601589e6a2 — RE-AUDIT from your REQUEST CHANGES 0/1/2 at c1d69c7f
   (issuecomment-5962121921). Range c1d69c7f..7c29d981 = round 7 (issuecomment-5963458286): 9fe6d3e7 B-627-8 durable transfer-create
   record + nullable column stripe_send_unresolved_at inside the UNMERGED migration 20270210000000 (schema.prisma parity, down.sql refuses
   while unresolved rows exist), 29666ee4 merge of main 53b6d472 (verify the merge tree claim), 981ecf7a + 7c29d981 test-only. Decide your B-627-8 and your two Cs first, then
   verify B-627-8 is truly closed (double-pay after lost response / key expiry), money in minor units (G13), idempotency, races.
   Pair: mobile #321 (T3, dual APPROVE @4f5b058d) merges with it after a main merge (item 6).
2. mobile #314 (community report/block/moderation, Apple 1.2, T4) @ 47398f73e091e84a1771ed99d337e2519f35d090 — DELTA from your APPROVE at
   48d76d21 (issuecomment-5960886138). Since then: 54c2535e (operator update-branch after #610 merged; Opus RC there,
   issuecomment-5963235411) and fix round 7 47398f73 (issuecomment-5963499028, B-314-11 support-email guard). Check 48d76d21..47398f73.
3. backend #645 (ci: setup script lists the 11 live required checks; T4 CI-gate file) @ f50de1b03fb46269ed3e726961132660072bf0e5 —
   DELTA from your APPROVE at 7b6165ab: merge of main 53b6d472 + REQUIRED list = 11 contexts in live order + new guard "no required
   check from a job with a job-level if:". Read every changed line; compare against live protection (gh api
   repos/BradleyGleavePortfolio/growth-project-backend/branches/main/protection/required_status_checks). Never run the setup script.
4. backend #608 (account deletion, App Store 5.1.1(v), T4) — WAIT until lane B-EXPORT-5 posts a FIX ROUND comment with green CodeQL.
   Then DELTA from your REQUEST CHANGES at bdadfcb4 (issuecomment-5963372835): covers 72e72bd4 (operator composition of #636 into #608), round 7 9650ce14 (B-EXPORT-4:
   B-608-12 composition, B-608-13/C-608-2 admin force-delete step-up re-auth, C-608-7 HMAC receipt digest, C-608-8/10) and the CodeQL
   round. Note C-636-6 (release-role rollback privilege probe) is an operator pre-deploy step; say whether the PR body gives a runnable probe.
5. mobile #327 (data export download, T4) — after B-EXPORT-5 posts its main merge: DELTA from your APPROVE at 395c3312 (merge
   resolution only + confirm #608's contract is unchanged for the client).
6. mobile #321 — only when the operator tells you #627 merged and #321 was brought current: delta from 4f5b058d.
7. backend #654 (native Stripe subscriptions + trials via PaymentSheet, T4, most critical) and mobile #334 (Day 1 package sheet +
   recurring purchase, T4) — FULL audits, paired, when lanes B-RECUR-BE / B-RECUR-MOB post "ready for audit". #654 is stacked on #627's
   branch until the operator retargets it.
8. backend #611 (privacy policy pages, T4) — when B-PRIV-6 posts round 6: RE-AUDIT from your REQUEST CHANGES 0/2/0 at fda3afad (issuecomment-5963440291: B-611-5, B-611-6).
When your queue is empty write QUEUE EMPTY in the report and finish; the operator re-tasks you by message.
Final answer (<300 words): each PR, exact head, verdict, A/B/C counts, comment URL, operator decisions needed.
