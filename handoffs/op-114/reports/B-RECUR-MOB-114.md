# B-RECUR-MOB (agent 114) — growth-project-mobile #334

Branch `fix/package-sheet-payment-intent`. Start head 5b6eb654e29abd1de51e1d6f48903abc260aae25.
Merged origin/main aae30ac0 (merge commit 552d093), then:
- 632ab782 feat(payments): one shared purchase flow sells renewing plans as native subscriptions
- e9499f8f test(payments): renewing plans, trials, every error code, poll timeout, double tap, wallets off by config
- 00d77337 test(payments): pass the required sheet appearance in the hook-level double-tap test (CI typecheck fix)
- 59d3192f docs(env): document the off-by-default Apple Pay / Google Pay switches
- 3fc925d4 fix(payments): plan actions get specific copy for PURCHASE_NOT_FOUND / PLAN_ALREADY_ENDED and reload the list

Final head: see HANDOFF (CI state recorded there).

## Sell surfaces (inventory) and routing
All go through `src/hooks/usePackagePurchase.ts` (one flow):
renewing (billing_type recurring, or combo recurring_amount_cents + recurring_interval) -> POST /v1/checkout/subscription-intent
-> native PaymentSheet (payment mode, or setup mode for a trial) -> "Confirming your plan" polling GET /v1/checkout/subscriptions/:id
(bounded ~30 s, then calm slow state with Check again / Continue) -> success moment. One-time -> POST /v1/checkout/payment-intent ->
PaymentSheet -> entitlement wait. $0 -> POST /v1/packages/:id/claim-free.

| Surface | Before | After |
|---|---|---|
| Day 1 sheet / package_prompt (`PackageSelectionSheet`, Day1WinScreen + RootNavigator) | refused renewing plans | shared flow, terms block, success moment |
| Membership plans (`ClientPackagesScreen`, More > Membership) | hosted Checkout in BrandedCheckoutWebView | shared flow, terms per plan, Your plans panel |
| Share link `tgp://p/:token` (`PackageCheckoutScreen` + `PackageDetailSurface`) | hosted Checkout in webview | shared flow, terms, specific share-link copy |
| Join links `/join/<code>` (AcceptInviteScreen) | attaches, then package prompt / plans | unchanged; sells through the two surfaces above |
| Paywall (`PaywallSheet`) | routes to Membership plans | unchanged (no direct sale) |
| CreditPackCheckoutScreen | coach AI credits, not a package | untouched |

BrandedCheckoutWebView remains only for the dunning "Update card" Billing Portal link (pre-existing, not a sale).

## Owner rulings covered
- Renewing plans sell as real subscriptions on every package surface; never refused, never a one-off PaymentIntent (test-locked).
- OR-113-1: native TGP-themed PaymentSheet (usePaymentSheetAppearance tokens); no hosted Checkout, no webview in these flows.
- OR-113-2: Apple Pay only with a valid `merchant.*` EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER on iOS; Google Pay only with
  EXPO_PUBLIC_GOOGLE_PAY_ENABLED=1/true on Android (test env with pk_test_). Unset = no wallet, no error, no button. app.config.js adds
  the `@stripe/stripe-react-native` config plugin (entitlement / wallet meta-data) only when configured. Names registered in
  config/expected-env.json (optional) and .env.example.
- Trials: setup mode (seti_ secret, primaryButtonLabel "Start free trial"); terms state trial length and first-charge date.
- Terms before paying (PlanTermsBlock): price + interval, first charge incl. one-time part, trial days + date, renewal, cancel anytime
  in Membership (Your plans panel: End my plan via #628 cancel route, Keep my plan via #654 resume).
- Every backend code mapped to specific calm copy + next action (PACKAGE_PRICE_CHANGED shows new price and "Continue at $X" on the
  same key; SUBSCRIPTION_ALREADY_ACTIVE -> Open your plan; COACH_NOT_CONNECTED; COACH_NOT_PAYOUT_READY; PACKAGE_NOT_FOUND (share-link
  variant); CLIENT_NOT_FOUND; CONTRACT_SIGNATURE_REQUIRED; PACKAGE_INTERVAL_INVALID; ONE_TIME_REQUIRES_PAYMENT_INTENT /
  RECURRING_REQUIRES_SUBSCRIPTION (terms changed + reload); PAYMENT_IN_PROGRESS / PAYMENT_RETRY; SUBSCRIPTION_SETUP_UNAVAILABLE,
  STRIPE_CHECKOUT_ERROR, CONNECT_NOT_CONFIGURED (reference + support + Sentry); 429 with minutes; sheet canceled (silent) vs declined
  vs insufficient funds vs 3DS vs network). No "Something went wrong", no first person, no exclamation marks (test-locked).
- Idempotency: one key per (package, sale kind) attempt; reused on retry / cancel / decline / network / price confirm; spent after
  the sheet succeeds. In-flight guard: a double tap makes one attempt (hook-level test calls start() three times before any render).
- Secrets: client_secret / ephemeral key live only in the hook's local call; never in React state, logs, Sentry or analytics
  (Sentry payload asserted secret-free).
- Share-link load errors no longer pass server messages through (specific offline / not-loaded copy).

## Tests
Run via `/home/user/workspace/ops/heavy.sh npx jest --runInBand <files>`:
- New `src/components/__tests__/PackageSelectionSheet.subscription.test.tsx` 26/26 pass.
- New `src/__tests__/ClientPackagesScreen.purchase.test.tsx` 3/3, `src/config/__tests__/wallets.test.ts` 6/6 pass.
- Updated `PackageSelectionSheet.payment.test.tsx`, `PackageCheckoutScreen.buyer.test.tsx`, `stripePublishableKey.test.ts`: pass.
- Related (20 suites, 353 tests incl. Day1WinScreen*, rootNavigatorPackagePromptGate, iosStorePackagePurchasePosture,
  iosHideNonP2PPurchases, scopedTokenGate, PackageDetailSurface.preview, purchaseUnpackScreen, paywallSheet, paymentsConnectPackages,
  entitlementProvider, expectedEnv, validateAppConfig, androidHealthConnectConfig, supportEmail.guard, quietLuxuryDoctrine,
  BrandedCheckoutWebViewScreen): pass after the stripePublishableKey guard update.
- Failing before (base 5b6eb654 + new tests): `ops/brecurmob114/failing-before-5b6eb654.log` (4/4 suites fail: modules missing,
  share-link pays via webview) and `ops/brecurmob114/failing-before-5b6eb654-sheet-ui.log` (24 of 25 sheet behaviours fail; the one
  pass is the "never hand a mismatched secret to the sheet" negative, trivially true when nothing is sold).
- eslint on all changed files: clean. Typecheck: GitHub CI.

## CONTRACT GAP
1. Error envelope drops extra fields. Backend `HttpExceptionFilter` / `buildErrorEnvelope` (src/filters/http-exception.filter.ts,
   not-found-envelope.ts) keeps only statusCode, code, message, error, timestamp, path, request_id. So `amount_cents`/`currency` on
   PACKAGE_PRICE_CHANGED and `purchase_id` / `cancel_at_period_end` / `current_period_end` on SUBSCRIPTION_ALREADY_ACTIVE never reach the
   app; #654's unit tests check the service exception body only. Mobile reads them if present and otherwise falls back to
   GET /v1/clients/me/coach/packages/:id (on main) and GET /v1/checkout/subscriptions (#654). Recommended: filter passes through a
   whitelist of extra fields (backend lane).
2. Share links from a coach the client is not attached to: subscription-intent / payment-intent only sell the client's own coach's
   packages (PACKAGE_NOT_FOUND). No route buys a share-link package by token for a signed-in client of another coach (or attaches
   then buys). Mobile shows specific copy ("belongs to a coach you are not connected with ... Message the coach who shared the link").
   Recommended: share-token-scoped intent or attach-then-buy on the backend.
3. Cancel route lives in backend #628 (POST /v1/checkout/subscriptions/:id/cancel, not on backend main). Your plans "End my plan"
   needs #628 deployed; resume + list + detail need #654.

## Overlaps
- #322 edits ClientPackagesScreen, RootNavigator, ClientNavigator (expect a conflict in ClientPackagesScreen; #322 also has "End my plan").
- #321 edits PackageDetailSurface (this PR adds three optional props: purchaseSlot, payLabel, hidePay) and packagesApi (untouched here).
- #329 packagesApi (untouched). Navigators untouched.

## Operator / owner decisions (recommended default)
- Merge order: backend #654 (and #628 for cancel) deploy before this mobile PR. Default: hold #334 until #654 is live.
- Contract gaps 1 and 2: backend follow-ups; mobile works without them (fallbacks + specific copy). Default: file backend lane.
- Apple merchant ID: none yet; wallets stay off until EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER is set and a new build is made.

## HANDOFF
- PR: growth-project-mobile #334, title `feat(payments): renewing plans and one-time packages through one native PaymentSheet flow`,
  body replaced (T4 header, pairs with backend #654, merge order #654 first, fix-round table): ops/brecurmob114/pr334_body.md.
- Final head: 3fc925d432666eab17d5a51c3e88e3a68efcecb6. Mergeable.
- CI at final head: Typecheck, lint, test PASS (434 suites, 5999 tests); Analyze (javascript-typescript) PASS; Analyze (actions) PASS; CodeQL PASS.
- Comment posted: "FIX ROUND 1 (B-RECUR-MOB, agent 114) — growth-project-mobile#334 @ 3fc925d4..." ending "READY FOR AUDIT"
  (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334#issuecomment-5964380483).
- Not merged. No other lane's branch touched. No package.json / lockfile / workflow change.
- Worktree /home/user/workspace/wt/B-RECUR-MOB-1 removed (node_modules symlink unlinked first); temporary base worktree also removed.
- Next: independent audit; backend lane for CONTRACT GAP 1 and 2; hold merge until backend #654 (and #628) are deployed.
