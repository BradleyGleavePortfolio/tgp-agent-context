# Lane S-COACH-BE-2 (agent 112) — Claude Opus 5.5 builder: Money read model fixes (backend #641) + coach payments secret leak (new PR; T4)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/S-COACH.md; the AUD-OPUS-4 verdict on
backend #641 (REQUEST CHANGES 0/2/4 at 563e3f80, comment 5960027984) and /home/user/workspace/ops/aud-opus4-112/; OR-111-1
(refund/dispute forward netting; backend #627 open) and OR-111-2.
PUSH HOLD: a third Sol lens (AUD-SOL-5) is auditing #641/#329 at 563e3f80/4071d0ce right now. Do not push to #641 or
#329 until its AUDIT comment is posted on that PR (poll gently with gh); read, plan and code locally meanwhile, then fold Sol's
findings into the same round (one round closes both lenses). New PRs/branches you create may be pushed at any time.
Parallel lane: S-COACH-BE-2 (backend #641 + leak PR) and S-COACH-MOB-2 (mobile #329 + stacked Money UI) run at the same time —
read each other's pushes on GitHub; backend owns the API contract, mobile follows it.
Do (one pass; each finding closed with a failing-before test):
1. backend #641 @ 563e3f80: B-641-1 (failed-payment "card update link sent" must come from a real production write: either make
   dunning v2 / the reminder path record it, or derive it from data production actually writes — prove with a test that uses the
   production write path, not a hand-made row), B-641-2 (a lost chargeback is never "paid", never counts as a new client, never
   ticks "first client payment"), C-641-1 (refunds land in the window when the refund happened), C-641-3 (expose the held-from-
   next-sale amount as a nullable field now, wired to #627's model when it lands — coordinate by reading #627's branch; no
   dependency on #627 merging), C-641-4 (tax CSV export route if it fits the read model cleanly; else list as a gap). Merge backend
   main 3bd6215b (merge commit; register env names per #624).
2. NEW small PR off main (branch agent/clinic/coach-payments-field-select; Conventional Commits title, e.g. "fix(payments): never
   send client Stripe secrets to coach routes"; tier T4): C-641-2 — GET /v1/coach/payments/purchases, /purchases/:id and /failed
   send the client's Stripe client_secret and ephemeral key to the coach. Add explicit field selection (allow-list DTO) on every
   coach-facing payments route, plus a regression test that fails if any secret-like field (client_secret, ephemeral key, payment
   method details beyond brand/last4) appears in a coach response. Grep for the same pattern on other coach routes and fix them in
   the same PR.
3. In the report, list the env values the Money/Connect flow needs after deploy (STRIPE_CONNECT_RETURN_URL,
   STRIPE_CONNECT_REFRESH_URL -> the new HTTPS return pages) with exact proposed values; do not edit the manifest.
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/S-COACH-BE-2-112.md. Final answer (<400 words).
