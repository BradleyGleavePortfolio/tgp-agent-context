# B-RECUR-BE — Claude Opus 5.5 builder (T4, owner's most critical item), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports, Final
answer), /home/user/workspace/ops/_BUILD_COMMON.md, /home/user/workspace/ops/TWO_PACKAGE_DESIGN.md, then
/home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict). Report: /home/user/workspace/ops/reports/B-RECUR-BE-114.md.
You are the only writer on backend #654. NEVER push to #627's branch agent/clinic/s-fee-coach-net (lane B-FEE owns it).

Owner rulings: OWNER 16:04 "recurring packages are literally most critical of all"; OR-113-1 recurring through the native TGP-themed
PaymentSheet (Subscription payment_behavior=default_incomplete, first-invoice PaymentIntent), no hosted Checkout for this flow;
OR-113-2 Apple Pay + Google Pay in the sheet, shipped off-by-config until the owner supplies a merchant ID; trials real (one per client
per coach).

backend #654 @ c95ec9da (read the whole PR body: contract, Stripe objects, idempotency, webhooks, migration 20270225000000, tests). It is
stacked on #627's branch at c1d69c7f; #627 is now at 7c29d981 (round 7: durable transfer-create record, nullable column
stripe_send_unresolved_at inside unmerged migration 20270210000000, merge of main 53b6d472, and 7c29d981 which adds
payeeRecovery.aggregate to main's #641 coach field-select fake). CI build-and-test is red on test/coach-payments-field-select.spec.ts —
almost certainly the same fake gap.
1. Merge origin/agent/clinic/s-fee-coach-net (7c29d981) into #654's branch with a merge commit; resolve conflicts; confirm schema.prisma
   + migrations parity (20270210000000 then 20270225000000) and that #654 still composes with round 7's ConnectTransfer changes.
2. Make every required check green at your head (CI runs on this stacked PR; use it: push early, read logs, keep working).
3. Re-check the PR against the rulings above and close gaps: payment-intent refuses renewing packages with a coded error; subscription-
   intent covers one-time+recurring combos, trials (setup mode), reuse/expiry of incomplete attempts, $0/invite refusal, price-change
   409; webhooks grant entitlement only from Stripe events; renewal failures go to dunning, first-attempt declines do not. Any
   correctness gap you find: fix it now with a failing-before test (do it right once; no audit ping-pong).
4. Lane B-TRIALS' backend #656 adds CoachPackage.trial_days. Read #656; state in #654's body the exact merge order and what each PR does
   if the other is not yet merged. Do not edit #656.
5. Post "FIX ROUND 1 (B-RECUR-BE, agent 114) — growth-project-backend#654 @ <full sha>" + update the body; end with "READY FOR AUDIT"
   when green. Leave the base as is (the operator retargets to main after #627 merges).
Coordinate contract questions with lane B-RECUR-MOB only through your report (the operator relays). Final answer (<300 words).
