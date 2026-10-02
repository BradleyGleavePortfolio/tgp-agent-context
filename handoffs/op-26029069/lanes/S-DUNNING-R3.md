# Lane S-DUNNING-R3 (agent 111) — Claude Opus 5.5 builder: dunning fix round 3 (#628 backend, mobile #322; T4 money)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes110/S-DUNNING-R3.md (110's objective,
never run) + /home/user/workspace/ops/reports/S-DUNNING-R2-110.md + S-DUNNING.md if present; prompt v5 section 4.12 payment rules
(/home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md: 10-day lockout, charges
Day 0/1/3/7, 1A = card update auto-charges the open invoice and unlocks on success, 2A = cancel while in dunning voids the unpaid
invoice and ends access immediately, voluntary cancel otherwise runs to period end, OR-110-2 native TGP PaymentSheet, no hosted
portal); EVERY AUDIT comment on backend #628 (Opus RC 0/2/4 at ba1d9480; Sol RC 0/10/1 at ba1d9480: B-628-1..10, C-628-2) and
mobile #322 (Opus RC 0/2/1; Sol RC 0/6/1: B-322-1..6, C-322-1). The Sol/Opus probe files referenced in those comments are gone;
rebuild each repro as a regression test from the comment text.
Close every A/B finding from both lenses in ONE pass (no ping-pong), each with a failing-before test, and every cheap C. Do not
cut scope. Highlights: paid-before-list cancel must not end a just-paid period (re-read Stripe inside the action, idempotent);
per-invoice integer-cent results, never "nothing was charged" after a partial success, no summing across currencies; lost
confirm reply = "confirming" + server reconcile; pagination; durable intent before void; dedupe keys per cycle; comp/live-grant
parity; dispute cycles; lease fencing (CAS on holder inside each money-write tx); every validation failure carries a stable code
and the production filter keeps the phase; mobile: uncaught native SDK promise rejections, malformed-success fail-closed, visible
references, bound/fresh pre-charge amount.
Merge main first (backend e5a6044a: register every env read per #624 with real defaults; mobile e3986e89: #322 is DIRTY) using
merge commits, no rebase. Migration stays 20270215000000. PR bodies: fix-round table + a worked money example per path.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/S-DUNNING-R3-111.md. Final answer (<400 words).
