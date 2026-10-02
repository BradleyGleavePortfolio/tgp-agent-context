# Lane B-FEE-R5 (agent 111) — Claude Opus 5.5 builder: fee model round 5 (#627; T4 money) — owner decision OR-111-1

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (AGENT 111 FACTS + OWNER DECISION 08:03 / OR-111-1 refund and
chargeback recovery); /home/user/workspace/ops/lanes110/B-FEE-R4.md + /home/user/workspace/ops/reports/B-FEE-R4-110.md + B-FEE-R3-110.md;
the #627 PR body (round-4 status, risk 1 = B-627-3) and every AUDIT comment on #627.
1. CI is RED at ef19980f (run 36973729270): test/prod-readiness/env-registration.spec.ts ("zero unregistered env reads" and "every
   rule added after the legacy set records its real code default and a reason") and test/deploy-readiness.spec.ts full mode. Merge
   main (now b9ee8e0a: includes #604 throttler and #629 $19.99-minimum packages; merge commit, no rebase; resolve any overlap with
   #629 keeping both behaviors) and register every env name #627 reads in src/common/env-validation.ts ENV_RULES with its
   real code default + reason (never weaken the test or widen the legacy exemption). Make deploy-readiness pass.
2. Implement OR-111-1 exactly: on refund or chargeback, coach alert (push + Money "needs attention" record; email hook when the
   provider is live) with exact integer-cent amounts: what the customer got back, and what TGP holds from the coach's next sale =
   TGP 2% + every Stripe fee on that charge (non-returned processing fee, dispute fee), on top of the next sale's standard fees.
   The coach's share comes back by reversing that charge's own transfer (keep round 4's durable TransferReversalOp + uncertainty
   handling); anything Stripe refuses joins the held amount. Recovery = forward-only netting from the coach's next transfer(s)
   until fully settled (carried across sales, idempotent, race-safe with the CAS lease fence). REMOVE round 4's reversal of the
   coach's OTHER past transfers (90-day clawback). Won disputes / reinstatements net the open balance. A coach who never sells
   again keeps an open receivable with the SFEE_RECOVERY_OPEN alert. Coach-facing breakdown and the open balance are readable via
   an API the Money page can use. TGP is never net-negative on a settled charge once netting completes.
3. Update the PR body: owner decision text (verbatim answer + OR-111-1), worked examples ($100 full refund; $100 lost dispute with
   $15 fee; refused reversal after payout followed by a $49 sale and a $100 sale), fix-round table, failing-before tests.
4. Then mobile #321 @ 4295fc79 (T3 fix round 5; base main e3986e89+): close Opus REQUEST CHANGES (0/2/4) at 4295fc79 — read the
   AUDIT comment — plus any open Sol finding; editor shows the $19.99-minimum-or-free rule matching merged backend #629 exactly
   (PACKAGE_INVALID mapping in plain words, per Sol C-629-4). Merge mobile main first (merge commit).
Tests via heavy.sh (targeted jest --runInBand; tsc with NODE_OPTIONS=--max-old-space-size=3584 once). Never merge, dispatch
workflows or touch production. Report: /home/user/workspace/ops/reports/B-FEE-R5-111.md. Final answer (<400 words).
