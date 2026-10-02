# Lane S-DUNNING-R4 (agent 112) — Claude Opus 5.5 builder: dunning v2 fix round 4 (backend #628 + mobile #322; T4 money)

Owner: dunning v2 ON at launch (10-01 11:31/12:51); non-payment = 10-day lockout, wired + live, audited/tested then flipped (13:41/13:43);
16:30 Dunning 1A (a card update in dunning charges the open invoice right away and unlocks on success) and 2A (cancelling while in
dunning voids the unpaid invoice and ends access immediately); voluntary cancel keeps access through the paid period; OR-110-2 native
Stripe PaymentSheet + native billing screens; no generic errors; truthful copy (never "nothing was charged" unless proven).
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/S-DUNNING-R3.md +
/home/user/workspace/ops/reports/S-DUNNING-R3-111.md; Opus APPROVE comments at the current heads; Sol REQUEST CHANGES on backend #628
@ 739e9a54 (0/3/0, comment 5960160607: duplicate concurrent notice delivery; unrelated outstanding disputes cleared by one won charge;
lost pay/void receipts after a post-money journal failure) and mobile #322 @ 0b4813dc (0/3/1, comment 5960166963: false "nothing was
charged" bank-error copy after partial collection; invisible approval from malformed quote totals; valid backend in_progress rejected).
Sol's executable probes: /home/user/workspace/ops/aud-sol3-112/ — turn each into a failing-before regression test.
Do (one pass): close all 6 B's + the C; merge backend main (now f04289f9: #607 merged) / mobile main 2c17c241 (merge commits; env
registry per #624; migration 20270215000000 stays). Keep Opus's approved behaviour intact (re-read his verdicts; do not regress).
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites). PR titles Conventional Commits; fix-round tables.
Never merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/S-DUNNING-R4-112.md. Final answer (<400 words).
