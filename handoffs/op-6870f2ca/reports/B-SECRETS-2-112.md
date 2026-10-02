# B-SECRETS-2 (agent 112) — backend PR #646, OR-112-19 client purchases secret

Builder lane, Claude Opus 5.5. Scope: growth-project-backend #646 only.

## Result
- PR #646 branch `agent/clinic/coach-payments-field-select`: ea919f6b -> **32f7ede45e065175b04c228732e32382006057f9**.
- Retitled: `fix(payments): never send Stripe client secrets to coach routes or client purchase lists`. Tier T4 unchanged; PR body gained an OR-112-19 Why paragraph, T3 scan, What changed, Acceptance evidence, and the fix-round row "OR-112-19 client purchases secret".
- Fix-round comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5961705101
- Main not merged (PR was MERGEABLE; main has moved to 5d1f224a, no conflict).

## Mobile grep (growth-project-mobile origin/main f34b5b99, src/)
- No code reads `stripe_client_secret`, `stripe_ephemeral_key` or any `*_secret` from a purchase row.
- `ClientPurchase` type (`src/api/clientPaymentsApi.ts`) has only `id, package_id, status, entitlement_active, access_expires_at, current_period_end, cancel_at_period_end, canceled_at, created_at`. Readers: `getPurchases`, `getPaymentStatus`, `PurchaseUnpackScreen.buildReceipt`.
- Client secrets are read only from mint responses: `POST /v1/checkout/sessions` (`PackageSelectionSheet.tsx`), `CheckoutSessionResponse` (`packagesApi.ts`, `PackageCheckoutScreen`).
- Mobile does not call `GET /v1/coach/purchases`. There is no client `GET /v1/checkout/purchases/:id` route.
- Ruling applied: mobile never reads it, so the secret is dropped from the client list for every status.

## What changed (32f7ede4)
- New `src/checkout/client-purchases.select.ts`: `CLIENT_PURCHASE_SELECT` allow-list + `ClientPurchaseView` type.
- `CheckoutService.listForClient` (GET /v1/checkout/purchases) selects it.
- Found during the route check: `CheckoutService.listForCoach` (GET /v1/coach/purchases, `CoachPurchasesController`) returned raw rows to coaches, the same C-641-2 leak #646 targets. It now selects `COACH_PURCHASE_SELECT`; `CoachPurchaseView` exported from `coach-payments.select.ts`.
- Other client purchase reads checked and already shaped: `/purchases/:id/drops`, `/sessions/:id/confirm`, `claim-free`, `claim-grant`, public thank-you page.
- Resume path unchanged: `POST /v1/checkout/payment-intent` replay with the same idempotency key returns the cached secret to its owner only (test covers it).

## Tests
- New `test/client-purchases-field-select.spec.ts` (6 tests). Failing-before: on ea919f6b + the spec + the new select file (service unchanged): 3 failed / 3 passed. The client list, client pagination and coach feed responses carried the planted secret, ephemeral key, idempotency key, Stripe ids and grant metadata. After: 6/6 pass. Log: ops/b-secrets-2-failing-before.log.
- `heavy.sh npx jest --runInBand test/client-purchases-field-select.spec.ts test/coach-payments-field-select.spec.ts test/checkout.service.spec.ts test/checkout-buyer-drops.spec.ts test/payment-ops.controller.spec.ts test/packages.service.spec.ts test/dunning-v2-lockout-allowlist-route-table.spec.ts`: 7 suites, 207 passed (ops/b-secrets-2-after.log).
- Scoped strict tsc over the touched files (ops/b-secrets-2-tsconfig.json): clean. eslint on changed files: clean. `node scripts/check-r75.js --mode=staged`: OK.

## CI at 32f7ede4
All 10 required checks green: build-and-test (7m41s), rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity. Also green: test-deploy-readiness, size-label. deploy-readiness-gate was skipped. The PR is MERGEABLE, merge state BEHIND (main is 5d1f224a, no conflict, main not merged per lane rule).

## Risks
- The client list drops fields no mobile code reads (Stripe ids, idempotency key, landing_page_id, contract_envelope_id, grant_metadata). A web client outside these two repos that reads them would lose them; none was found.
- `GET /v1/coach/purchases` now omits the same fields the /v1/coach/payments routes already omit.
- Mobile doc comments still say the endpoint returns "raw ClientPurchase rows" (comments only, no behavior impact).
- The secret still sits in the DB row for replay. That is by design and not in scope.

## HANDOFF FOR AGENT 113
- Head: 32f7ede45e065175b04c228732e32382006057f9 on `agent/clinic/coach-payments-field-select` (#646). All required CI is green at this head.
- Done: mobile grep, client list allow-list, coach `/v1/coach/purchases` allow-list, failing-before spec, PR body row + retitle, fix-round comment (issuecomment-5961705101).
- Not done: an independent audit of #646 at 32f7ede4 (it was never audited). The operator merges. The branch is BEHIND main with no conflict; if branch protection requires up-to-date, use update-branch and then re-check that CI is green.
- Worktree /home/user/workspace/wt/b-secrets-2 removed.
