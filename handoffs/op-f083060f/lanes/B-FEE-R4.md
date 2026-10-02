# Lane B-FEE-R4 (agent 110) — Claude Opus 5.5 builder: fee model fix round 4 (#627, #629, mobile #321; T4)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then /home/user/workspace/ops/reports/B-FEE-R3-110.md, then every AUDIT
comment on backend #627, #629 and mobile #321 (gh pr view N --comments). Owner fee model (binding): coach payout = price - actual
Stripe processing - 2% TGP; TGP is never net-negative on any charge, refund or dispute; integer cents; no fee shown to clients.
Fix every A/B finding (and C where cheap) in one pass per PR, with tests that fail on the old code:
- #627 @ 2c57cc41: Sol B-627-2 (120 s lease admits a second live holder without fencing: add a fencing token / version check so a
  stale holder's writes are refused), B-627-3 (unsecured recovery can leave platform cash negative indefinitely: implement the
  strongest no-owner-action mitigation available in code — reverse_transfer + refund_application_fee on refunds, recovery ledger
  netted from the coach's next transfers, payouts held while a recovery balance is open, alerting; and document the Stripe setting
  that removes the residual (Connect account debits) as an owner decision), B-627-4 (stale dispute state applied after a failed
  canonical read: refuse and retry), B-627-5 (uncertain reversal success double-recovers: idempotency key + reconcile by Stripe
  object id), plus Opus's B findings (read his verdict at 2c57cc41).
- #629 @ 858eb40b: Sol's B and Opus's two B + one C at that head.
- mobile #321 @ a9b1f49d: Opus's two B + one C.
Merge main (now 7a6cfd82) into each backend branch first (no rebase). Migration prefixes: #627 keeps 20270210000000 and #629 keeps
20270216000000 unless a reviewer requires otherwise; if you need a new one, take 20270223000000. Update each PR body with a fix-round
table (finding -> fix -> test). If a body edit is refused by a safety check, do not work around it; put the text in your report.
Report to /home/user/workspace/ops/reports/B-FEE-R4-110.md. Final answer (<400 words): heads, findings closed, tests, CI, risks.
