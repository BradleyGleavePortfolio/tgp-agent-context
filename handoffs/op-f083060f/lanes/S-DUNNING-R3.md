# Lane S-DUNNING-R3 (agent 110) — Claude Opus 5.5 builder: dunning fix round 3 (#628 backend, #322 mobile; T4 money)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then /home/user/workspace/ops/reports/S-DUNNING-R2-110.md and every AUDIT
comment on backend #628 and mobile #322 (Opus REQUEST CHANGES at ba1d9480 / 8991ddf; Sol's verdicts may land while you work —
re-read before finishing and fold them in). Fix in one pass, failing-before tests for each:
- #628: ending a plan right after Stripe's retry has paid must NOT delete the subscription and end access with no refund — once the
  invoice is paid the client is no longer in dunning, so cancel = run to period end (Opus's probe test is in
  /home/user/workspace/ops/aud-opus-110/; turn it into a regression). Re-read state from Stripe inside the action, idempotently.
- #628 + #322: with two overdue plans and only one payment succeeding, the response and copy must say exactly what was charged
  (per invoice, integer cents) — never "nothing was charged" after a partial success.
- #322: a lost answer on card confirm must not say "nothing was charged"; say the result is being confirmed, reconcile from the
  server (poll/refresh), then show the truth.
- Every Opus C where cheap; anything Sol adds.
Merge main (now 7a6cfd82 or later) first, no rebase; migration stays 20270215000000. Update PR bodies (fix-round table + worked money
example per path); if a body edit is refused by a safety check, do not work around it — keep the text in your report.
Report to /home/user/workspace/ops/reports/S-DUNNING-R3-110.md. Final answer (<400 words): heads, findings closed, tests, CI, risks.
