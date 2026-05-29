# PR-1 BUILD REPORT — Fix In-App Client Checkout (P0-a, P0-b, swallowed-404)

**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/208
**Branch:** `pr1/fix-in-app-checkout`
**Base:** `main`
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — no Co-Authored-By / Generated-with trailers.
**Status:** revised after round-2 audit. Two commits on the branch.

---

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/208

## (b) Call-site changes (final, old → new)

The independent auditor verified the backend `checkout.controller.ts` exposes ONLY four routes: `POST /v1/checkout/sessions`, `POST /v1/checkout/billing-portal`, `GET /v1/checkout/sessions/:id/confirm`, and `GET /v1/checkout/entitlement`. There is **no `/v1/checkout/status` route**. Round 1's `/v1/checkout/status` swap and unfixed `getEntitlement` were corrected in round 2.

| Caller in `clientPaymentsApi.ts` | Original (dead) | Final (real) |
| --- | --- | --- |
| `createCheckoutSession` | `POST /v1/clients/me/coach/checkout` | `POST /v1/checkout/sessions` (+ `Idempotency-Key` header, R19) |
| `confirmCheckoutSession` | `POST /v1/clients/me/coach/checkout/confirm` (body `{session_id}`) | `GET /v1/checkout/sessions/:id/confirm` (id URL-encoded in path) |
| `createBillingPortalSession` | `POST /v1/clients/me/coach/billing-portal` | `POST /v1/checkout/billing-portal` |
| `getEntitlement` | `GET /v1/clients/me/coach/entitlement` | `GET /v1/checkout/entitlement` |
| `getPaymentStatus` | `GET /v1/clients/me/coach/payment-status` (round 1: `GET /v1/checkout/status` — also dead) | **Derived** from `getEntitlement()` + `getPackages()` — no route call |

`CheckoutReturnScreen.tsx` is unchanged at the call-site level — it calls `clientPaymentsApi.confirmCheckoutSession(sessionId)` — but the API client now sends the right verb / path.

### Why `getPaymentStatus` is derived, not fetched
The auditor's verified route list does not include `/status`. Inventing another path would repeat the exact failure mode this PR was meant to fix. Status is composed from the two authoritative signals the controller DOES expose:

- **`GET /v1/checkout/entitlement`** — single source of truth for whether the client currently has paid access (R20).
- **`GET /v1/clients/me/coach/packages`** — the client's package list carries an `is_current` flag naming the package they're on.

Derivation:
- `state = entitlement.active ? 'active' : 'none'`
- `package_name = packages.find(p => p.is_current)?.name ?? null`
- `current_period_end`, `trial_ends_at`, `dunning` = `null` (rule 18: no fabricated values for fields no real backend route exposes)

When the backend ships a real status route, the derivation is a single point to replace.

### `isNotConfigured` swallow-404 fix
- Before: `status === 404 || status === 501` → `reason: 'not_configured'`
- After: `status === 501` only → `reason: 'not_configured'`. A 404 / transport failure surfaces as `reason: 'error'` so the UI shows a retryable banner.

### `ClientPackagesScreen` not-configured derivation
The gate now fires only on real signal: explicit 501 (`reason: 'not_configured'`) OR an empty published package list combined with payment-status `state: 'none'`. A 404 lands in the retryable error banner.

## (c) Typecheck / lint / test results (final, round 2)

- `npm run typecheck` → **clean** (`tsc --noEmit`, 0 errors)
- `npm run lint` → **0 errors** (72 pre-existing warnings, under the configured `--max-warnings=99999`)
- `npx jest` → **1430 / 1430 passing** across 135 suites
  - `src/__tests__/paymentsConnectPackages.test.ts` rewritten around the derived `getPaymentStatus` contract: asserts the entitlement + packages calls, the active/none derivation, period_end/trial_ends/dunning are null, and 404 on either upstream propagates as a retryable error.
  - New tests lock `getEntitlement` → `/v1/checkout/entitlement` and `createBillingPortalSession` → `/v1/checkout/billing-portal`.
  - `src/api/__tests__/paymentsApi.test.ts` (canonical CheckoutController contract) continues to pass against `/v1/checkout/sessions`.

## (d) Assumptions about the real backend routes (final)

The independent auditor verified the backend `checkout.controller.ts` exposes ONLY:

- `POST /v1/checkout/sessions` — also confirmed by `publicPackagesApi.createCheckoutSession` (`src/api/packagesApi.ts:461`) used in production by `PackageCheckoutScreen`. Locked by `src/api/__tests__/paymentsApi.test.ts:241`.
- `POST /v1/checkout/billing-portal` — auditor-verified.
- `GET /v1/checkout/sessions/:id/confirm` — auditor-verified.
- `GET /v1/checkout/entitlement` — auditor-verified.

There is **no `/v1/checkout/status` route**. `getPaymentStatus` is therefore **derived** from `getEntitlement()` + `getPackages()` rather than fetched. This is the only safe option without backend work — round 1's invention of `/v1/checkout/status` was the failure mode this revision corrects. No invented routes remain.

## (e) Other dead-route call sites (final, re-grepped)

Re-grepped the mobile repo after the audit. All remaining `/v1/clients/me/coach/` hits are out of scope:

- `services/api.ts:80` — references `/v1/clients/me/coach/packages` in `isEntitlementEndpoint`. Already covers `/v1/checkout/*` so the new routes are picked up by the 402-paywall interceptor automatically.
- `components/PackageSelectionSheet.tsx:232` and `screens/client/Day1WinScreen.tsx:145` — both call `/v1/clients/me/coach/packages` (packages list, separate controller, treated as live).
- `components/home/CoachIntroductionBanner.tsx:124` — GETs `/v1/clients/me/coach` (coach profile, not a payments call). Out of scope.

No remaining dead checkout / entitlement / status / billing call sites.

## Files touched (across both commits)

```
src/__tests__/paymentsConnectPackages.test.ts   | rewritten around derived status contract
src/api/clientPaymentsApi.ts                    | route rewires; getPaymentStatus derived
src/screens/client/ClientPackagesScreen.tsx     | docstring updates + not_configured derivation
src/screens/client/CheckoutReturnScreen.tsx     | docstring only — API call signature unchanged
```

Round-1 commit: `14cd9e1 fix(payments): rewire in-app client checkout to real CheckoutController`
Round-2 commit: `621e921 fix(payments): address PR-1 audit — derive status from entitlement, kill 2 more dead routes`

## Scope discipline (per brief guardrails)

- Mobile fix/rewire only — no backend changes, no drip-feed, no new models.
- `PackageCheckoutScreen` (the working public-share-link flow) untouched.
- Surface A and the package surfaces untouched (later PR).
- Diff is tight: API client rewire + confirm verb/path + error mapping + screen-level doc-string + derivation update + test updates.
