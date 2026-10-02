# B-PAYSHEET (agent 112, round 3) — builder, Claude Opus 5.5 — launch blocker OR-112-22

## mobile #334 — fix(payments): Day 1 package sheet takes payment through payment-intent (T4: money)
- PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334
- Branch `fix/package-sheet-payment-intent` from mobile main f34b5b99. Head: 5b6eb654e29abd1de51e1d6f48903abc260aae25 (single commit).
- Files (3): `src/components/PackageSelectionSheet.tsx`, `src/lib/packagePayment.ts` (new),
  `src/components/__tests__/PackageSelectionSheet.payment.test.tsx` (new). No package.json/lockfile, no CI gate files, no env names.

### Contract (backend main 9cfd70d6, read-only)
- `POST /v1/checkout/payment-intent`, `CreatePaymentIntentDto { package_id @IsUUID, idempotency_key @IsUUID }`,
  controller ValidationPipe whitelist + forbidNonWhitelisted. 200 `{ client_secret, ephemeral_key, customer_id, publishable_key }`.
  No purchase id in the response. Dedupe by (client, key): same key -> same PI, no second Stripe call.
- Error machine code is in the body `error` field (HttpExceptionFilter keeps the thrown body's `error`; `code` only if set), plus `request_id`.
  Codes: PACKAGE_NOT_FOUND, CLIENT_NOT_FOUND, COACH_NOT_FOUND (404); PACKAGE_IS_FREE (400); COACH_NOT_CONNECTED, COACH_NOT_PAYOUT_READY,
  CONTRACT_SIGNATURE_REQUIRED (409); CONNECT_NOT_CONFIGURED, PAYMENT_IN_PROGRESS, PAYMENT_RETRY (503); 429 throttle (retryAfter);
  STRIPE_CHECKOUT_ERROR / INTERNAL. No "price changed" code exists on this route (the PaymentSheet shows the PI's own amount);
  `PACKAGE_NOT_FREE` on claim-free is the real price-changed case and is mapped.
- `POST /v1/packages/:id/claim-free` for $0 plans: 200 `{ active, status }`, 400 PACKAGE_NOT_FREE, 409 GRANT_REVOKED.

### What changed
- Sheet now: payment-intent with exactly the DTO body; one UUID key per attempt (reused on retry/cancel/decline/in-progress, new per
  package or reload, in-flight guard); lazy native module; `initStripe` (backend publishable key, build key fallback, urlScheme tgp);
  `initPaymentSheet` with customerId + ephemeral key + client secret, returnURL `tgp://stripe-redirect`, TGP token appearance, pinned
  light/dark; `presentPaymentSheet`; cancel silent.
- Success: bounded (~10 s) poll of `GET /v1/checkout/entitlement`, `refreshEntitlement()`, then `onPaymentSuccess()`; if not active yet,
  "Your payment went through ..." + Continue.
- Specific copy per cause (see PR body); unknown + payments-off -> short reference (server request_id, else attempt key prefix) +
  "Email support" + shared SupportEmailFallback + Sentry (step/cause/status/code/stripe codes/reference only; never secrets).
- $0 -> claim-free; recurring -> not sold through payment-intent (backend route makes a one-off charge with no subscription and
  open-ended access). Price from `amount_cents` (main read `price_cents` -> `$NaN`).

### Tests (sandbox, ops/heavy.sh, --runInBand)
- New suite at head: 22/22 pass. Same suite with main's sheet restored and the new lib removed: 22/22 FAIL
  (e.g. Expected "/v1/checkout/payment-intent", Received "/v1/checkout/sessions"; Expected specific copy, Received
  "Payment failed. Please try again."). Log: ops/bpaysheet112/failing-before-main.log.
- Related: new suite + quietLuxuryDoctrine, scopedTokenGate, stripePublishableKey, Day1WinScreen, Day1WinScreen.packagePrompt,
  declaredDependencies, supportEmail.guard, SupportEmailFallback: 9 suites / 164 tests pass (ops/bpaysheet112/jest-head.log).
- eslint on the 3 files clean; `tsc --noEmit -p tsconfig.json` clean (ops/bpaysheet112/tsc.log).

### Overlaps
- No open mobile PR touches the 3 files (all open PRs checked incl. #321, #329, #332).
- #322: own PaymentSheet appearance + same return URL + `handleURLCallback` wiring (iOS redirect return). Independent; follow-up can
  switch the sheet to `buildPaymentSheetAppearance()` after both land. Sheet is hidden on iOS builds today.
- #322/#283 touch RootNavigator + rootNavigatorPackagePromptGate test (mocks the sheet): untouched here.
- #327/#315/#330/#326 touch sentry.ts / correlation.ts: signatures used here unchanged on those branches.

### Operator decisions needed (backend, outside this PR)
1. Recurring packages on `/v1/checkout/payment-intent` (recommended: backend slice making it subscription-aware with
   `payment_behavior=default_incomplete` like guest checkout, or reject recurring with a machine code). Until then the sheet does not
   sell renewing plans; they stay on Membership > View coaching plans (hosted Checkout, existing main behavior).
2. Optional: return `purchase_id` from payment-intent.

### CI (head 5b6eb654)
- Typecheck, lint, test: pass (1m59s; Test Suites 415 passed, Tests 5705 passed; new suite PASS). Run 37075224158.
- Analyze (javascript-typescript): pass (2m6s). Analyze (actions): pass (38s). CodeQL: pass.
- PR state OPEN, MERGEABLE. Not merged, no workflows dispatched, no EAS build, nothing in production touched.

### Cleanup
- node_modules symlink removed; worktree /home/user/workspace/wt/b-paysheet removed (`git worktree remove --force`). df 61%.
- Evidence kept in /home/user/workspace/ops/bpaysheet112/ (failing-before-main.log, jest-head.log, tsc.log, PR_BODY.md, file copies).

## HANDOFF FOR AGENT 113
- mobile #334 (head 5b6eb654e29abd1de51e1d6f48903abc260aae25, branch fix/package-sheet-payment-intent, base main f34b5b99) is
  green on all 3 required checks and needs an independent T4 audit (money path). Audit focus: DTO body vs backend 9cfd70d6
  `CreatePaymentIntentDto`; idempotency key lifetime (per package per sheet load; reused on retry/cancel/decline/503 in-progress);
  no secret in Sentry context or messages; entitlement-wait copy after a real charge; recurring branch.
- Merge order: independent of #322; if #322 lands first, nothing breaks (same return URL). Follow-up after both: switch the sheet's
  inline appearance to `buildPaymentSheetAppearance()`.
- Open backend decision for the operator: payment-intent charges recurring packages as a one-off PI with open-ended access.
  Recommend a backend slice (subscription-aware route, or reject recurring with a machine code). Mobile now refuses to sell
  recurring plans through this sheet, so the risk is closed on the client but not at the API.
- No package.json change, no CI gate file change, no env name added.
