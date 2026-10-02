# Lane B-FEE round 3 (agent 110) — Claude Opus 5.5 builder (T4 money: S-FEE, owner's #1 issue)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then /home/user/workspace/ops/lanes/S-FEE_objective.md, lanes/B-FEE.md,
reports/B-FEE.md and every verdict on the PRs. Builder: push to PR branches only, never merge.
Rule (owner): the client pays the listed price; coach payout = price - actual card processing - TGP 2%; no client surcharge;
TGP is never net-negative on any charge, refund or dispute.
1. backend #627 @ 70680675 (round 2 partial). Close Opus B-627-1 fully: renewal backfill must match paid invoices/charges to
   settlements by charge id (not skip purchases that already have a settlement). Close B-627-2: concurrent refunds must not
   over-reverse — serialize per charge, compute reversals from the cumulative refunded amount keyed by refund id; turn the
   probe handoffs/op-7c52cefa/aud-opus/probe_627_concurrency.spec.ts (in tgp-agent-context) into a real passing test. Confirm
   tsc with `NODE_OPTIONS=--max-old-space-size=3584 /home/user/workspace/ops/heavy.sh npx tsc --noEmit -p tsconfig.json` (run
   it alone). Merge main first. Write one worked $100 example (US card, international card, partial refund, dispute) in the body.
2. backend #629 @ 32d81faa (T3): close Sol findings ($0 DTOs must accept exactly 0 for free packages; unchanged grandfathered
   offers can be republished). Minimum paid price $19.99 or exactly free.
3. mobile #321 @ 8bc4de3a (T3): close Sol finding (price-save failures need a specific recovery action and a reference ID).
Report to /home/user/workspace/ops/reports/B-FEE-R3-110.md. Final answer (<400 words): heads, dispositions, tests, CI, risks.
