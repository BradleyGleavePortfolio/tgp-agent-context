# B-RECUR-MOB — Claude Opus 5.5 builder (T4, owner's most critical item), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports, Final
answer), /home/user/workspace/ops/_BUILD_COMMON.md, /home/user/workspace/ops/TWO_PACKAGE_DESIGN.md, then
/home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict). Report: /home/user/workspace/ops/reports/B-RECUR-MOB-114.md.
You are the only writer on mobile #334.

Owner rulings: OWNER 16:04 recurring packages are literally the most critical item; every surface that sells a package (the Day 1
sheet, package detail, storefront and join links) must sell renewing plans as real subscriptions; one-time-only is never acceptable,
and #334 must NOT merge while it only refuses renewing plans. OR-113-1: recurring goes through the native TGP-themed Stripe
PaymentSheet (no hosted Checkout, no in-app browser for this flow). OR-113-2: Apple Pay + Google Pay enabled in the sheet, off-by-config
(no error, no dead button) until a merchant ID exists. Trials are real, one per client per coach. Apple: TGP is 1:1 personal training
(real-world service), so Stripe in-app is allowed; no Apple IAP.

mobile #334 @ 5b6eb654 (Day 1 package sheet payment-intent fix, never audited, BEHIND). Backend contract = backend #654's PR body
(POST /v1/checkout/subscription-intent, GET /v1/checkout/subscriptions[/:id], POST .../:id/resume, cancel via #628's route, every error
code). Read it with gh pr view 654 -R BradleyGleavePortfolio/growth-project-backend.
1. Merge origin/main into #334 (merge commit). Inventory every place the app sells a package (rg for payment-intent / PaymentSheet /
   checkout / package purchase / join code / storefront). Route all of them through one shared purchase flow: one-time packages ->
   payment-intent; renewing packages -> subscription-intent -> PaymentSheet in payment mode (or setup mode for a trial) -> "Confirming
   your plan" polling GET /subscriptions/:id until entitled (bounded, with a clear calm state if Stripe is slow) -> success moment.
2. Every backend error code gets its own specific, calm, impersonal message and a next action (PACKAGE_PRICE_CHANGED shows the new price
   and asks to confirm; SUBSCRIPTION_ALREADY_ACTIVE routes to the plan; COACH_NOT_CONNECTED; PACKAGE_NOT_FOUND; sheet canceled vs
   declined vs network). No generic errors anywhere in these paths. Plan terms are visible before paying (price, interval, first charge
   incl. any one-time part, trial length and the date the first charge happens, cancel anytime through Billing).
3. Idempotency: one key per purchase attempt, reused on retry; double taps cannot create two attempts. Secrets (client_secret,
   ephemeral key) stay in memory only, never logged, persisted or sent to Sentry/analytics.
4. Tests that fail before and pass after for: renewing plan sells (not refused), trial setup mode, each error code's copy, poll timeout,
   double tap, Apple/Google Pay off when no merchant ID. Typecheck + lint + tests green in CI (push early; CI is the parallel engine).
5. Update the PR title/body to the real scope (tier T4, pairs with backend #654, merge order: backend #654 deploys first), post
   "FIX ROUND 1 (B-RECUR-MOB, agent 114) — growth-project-mobile#334 @ <full sha>", end with "READY FOR AUDIT" when green.
If #654's contract is missing something the app needs, do not invent a route: write it under "## CONTRACT GAP" in your report and keep
going on everything else. Final answer (<300 words).
