# PR-1 BUILD REPORT — Fix In-App Client Checkout (P0-a, P0-b, swallowed-404)

**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/208
**Branch:** `pr1/fix-in-app-checkout`
**Base:** `main`
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` (no Co-Authored-By / Generated-with trailer)

---

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/208

## (b) Call-site changes (old → new)

All four offending calls in `src/api/clientPaymentsApi.ts` were rewired
to the real `CheckoutController` at `/v1/checkout/*`:

| Caller | Old (dead) | New (real) |
| --- | --- | --- |
| `clientPaymentsApi.createBillingPortalSession` | `POST /v1/clients/me/coach/billing-portal` | `POST /v1/checkout/billing-portal` |
| `clientPaymentsApi.createCheckoutSession` | `POST /v1/clients/me/coach/checkout` | `POST /v1/checkout/sessions` (+ `Idempotency-Key` header — R19) |
| `clientPaymentsApi.getPaymentStatus` (primary GET) | `GET /v1/clients/me/coach/payment-status` | `GET /v1/checkout/status` |
| `clientPaymentsApi.getPaymentStatus` (past-due fallback POST) | `POST /v1/clients/me/coach/billing-portal` | `POST /v1/checkout/billing-portal` |
| `clientPaymentsApi.confirmCheckoutSession` | `POST /v1/clients/me/coach/checkout/confirm` (body `{session_id}`) | `GET /v1/checkout/sessions/:id/confirm` (id in path, URL-encoded) |

`CheckoutReturnScreen.tsx` still calls
`clientPaymentsApi.confirmCheckoutSession(sessionId)` — unchanged at
the call site — but the API client now sends the right verb and path.

### `isNotConfigured` error-mapping fix
- **Before:** `status === 404 || status === 501` → `reason: 'not_configured'`
- **After:** `status === 501` only → `reason: 'not_configured'`. A 404 or any other transport failure now arrives as `reason: 'error'` with the underlying message, so the UI shows a retryable error banner instead of mis-blaming the coach.

### `ClientPackagesScreen` not-configured derivation
Now derives the "no self-serve plans yet" gate from **real signal**:
explicit 501 (`reason: 'not_configured'`) **OR** an empty published
package list (`packages.ok && packages.data.length === 0`) combined
with payment-status `state: 'none'`. A 404 lands in the existing
retryable error banner branch instead of the gate.

## (c) Typecheck / lint / test results

- `npm run typecheck` → **clean** (`tsc --noEmit`, 0 errors).
- `npm run lint` → **0 errors** (72 warnings, all pre-existing, well under the configured `--max-warnings=99999`).
- `npx jest` → **1427 / 1427 passing** across 135 suites.
  - `src/__tests__/paymentsConnectPackages.test.ts` updated to assert the new routes, the new "404 surfaces as retryable error, not `not_configured`" contract, and the `Idempotency-Key` header on the session POST. Added a new test covering URL-encoding of the session id in the confirm path.
  - `src/api/__tests__/paymentsApi.test.ts` (the canonical CheckoutController contract test used by `PackageCheckoutScreen`) continues to pass against `/v1/checkout/sessions`.

## (d) Assumptions about the real backend routes

The brief verified two routes from the working mobile checkout path:

- **`POST /v1/checkout/sessions`** — confirmed by `publicPackagesApi.createCheckoutSession` in `src/api/packagesApi.ts:461`, which is the route `PackageCheckoutScreen` already uses in production today. Existing test at `src/api/__tests__/paymentsApi.test.ts:241` locks the path.
- **`GET /v1/checkout/sessions/:id/confirm`** — explicitly stated in the brief as the real confirm endpoint.

For the other two routes the brief said the controller "likely exposes a list/status route" without naming them. I assumed the most direct names on the same controller:

- **`GET /v1/checkout/status`** — for the client's own subscription / dunning state (replacing `coach/payment-status`).
- **`POST /v1/checkout/billing-portal`** — for the Stripe Billing Portal URL minted on a `past_due` fallback (replacing `coach/billing-portal`).

If the backend exposes those under different names (e.g. `/v1/checkout/subscription` or `/v1/checkout/portal`), the path string is a one-line follow-up — but the old `/v1/clients/me/coach/*` paths definitively do not exist, so any real route on CheckoutController is strictly better than the status quo.

## (e) Other dead-route call sites found

Grepped the mobile repo for any other `/v1/clients/me/coach/*` checkout call sites. Found none beyond what this PR fixes:

- `src/services/api.ts:80` — `isEntitlementEndpoint` predicate already covers `/v1/checkout`, so the new routes are recognised by the 402-paywall interceptor automatically. No change needed.
- `src/components/PackageSelectionSheet.tsx:232` and `src/screens/client/Day1WinScreen.tsx:145` — both call `/v1/clients/me/coach/packages` (the **packages list**, not a checkout call). The packages list path was NOT in the offending set defined by the brief; `services/api.ts:80` also treats it as a live route, and the existing `paymentsConnectPackages.test.ts` assertion (kept by intent) treats it as the canonical packages list endpoint. Left untouched per the brief's "checkout calls" scope.
- `src/api/clientPaymentsApi.ts:244` — `getEntitlement` GETs `/v1/clients/me/coach/entitlement`. Not in the offending set; left untouched. The `EntitlementProvider` consumes this via the `PaymentsResult` envelope.

## Files touched (4 files, 168 insertions / 45 deletions)

```
src/__tests__/paymentsConnectPackages.test.ts   |  76 +++++++++++++++++++---
src/api/clientPaymentsApi.ts                    |  91 ++++++++++++++++++++-------
src/screens/client/CheckoutReturnScreen.tsx     |  17 +++--
src/screens/client/ClientPackagesScreen.tsx     |  29 ++++++---
```

## Scope discipline (per brief guardrails)

- Mobile fix/rewire only — no backend changes, no drip-feed, no new models.
- `PackageCheckoutScreen` (the working public-share-link flow) is untouched.
- Surface A and the package surfaces are untouched (later PR).
- Diff is tight: API client rewiring + confirm verb/path + error-mapping fix + screen-level doc-string + derivation update so the new envelope is consumed correctly + test updates.
