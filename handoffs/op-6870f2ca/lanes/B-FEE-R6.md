# Lane B-FEE-R6 (agent 112) — Claude Opus 5.5 builder: S-FEE round 6 (backend #627 + mobile #321; T4 money)

Owner: 09-30 17:53 client pays list price; coach payout = price - card processing - TGP 2%; $19.99 minimum or exactly $0; 10-01 11:29
fee math is the #1 issue (TGP never loses money on a sale); 10-02 08:03 refund/chargeback -> OR-111-1 forward netting (alert the
coach with exact amounts; reverse that charge's own transfer; the rest held from the next transfer(s); no payout delay, no
debit_negative_balances, no Account Debits, no reversal of other past transfers); OR-111-2 (charge.dispute.closed; lost
subscription disputes settled by hand in v1.0; a repeat confirm reports what the first confirm paid).
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/B-FEE-R5.md +
/home/user/workspace/ops/reports/B-FEE-R5-111.md; EVERY AUDIT comment on backend #627 (Opus REQUEST CHANGES at 9d6351b0) and mobile
#321 (Opus REQUEST CHANGES at 7322bbff).
PUSH HOLD: AUD-SOL-4 is auditing #627/#321 at these heads now. Do not push to #627/#321 until its AUDIT comments are posted (poll
gently with gh); read, plan and code locally meanwhile, then fold Sol's findings in so ONE round closes both lenses.
Do: close every A/B from both lenses + cheap Cs, each with a failing-before test; merge backend main 3bd6215b / mobile main 2c17c241
(merge commits; env registry per #624; migration 20270210000000 stays). Expose the held-from-next-sale open balance in a form
S-COACH-BE-2's Money read model (#641, C-641-3) can read — read that lane's pushes and agree the field name in your PR body.
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/B-FEE-R6-112.md. Final answer (<400 words).
