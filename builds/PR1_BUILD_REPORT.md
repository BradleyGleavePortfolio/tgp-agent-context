# PR-1 BUILD REPORT — Fix In-App Client Checkout (P0-a, P0-b, swallowed-404)

**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/208
**Branch:** `pr1/fix-in-app-checkout`
**Base:** `main`
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — no Co-Authored-By / Generated-with trailers.
**Status:** revised after round-3 audit. Three commits on the branch.

---

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/208

## (b) Call-site changes (final, old → new)

Cloned `BradleyGleavePortfolio/growth-project-backend@main` and read `src/checkout/checkout.controller.ts`, `src/checkout/checkout.service.ts`, `src/packages/packages.controller.ts`, `src/packages/packages.service.ts`, and `prisma/schema.prisma` directly. Backend file:line cited next to every field this PR consumes.

| Caller in `clientPaymentsApi.ts` | Original (dead) | Final (real, backend file:line) |
| --- | --- | --- |
| `createCheckoutSession` | `POST /v1/clients/me/coach/checkout` | `POST /v1/checkout/sessions` (`checkout.controller.ts:94`) + `Idempotency-Key` header (R19) |
| `confirmCheckoutSession` | `POST /v1/clients/me/coach/checkout/confirm` (body `{session_id}`) | `GET /v1/checkout/sessions/:id/confirm` (`checkout.controller.ts:236`); real response shape `{paid: boolean; status: string; package_name: string \| null}` (`checkout.service.ts:677-735`) adapted to `ClientPaymentStatus` on the way out |
| `createBillingPortalSession` | `POST /v1/clients/me/coach/billing-portal` | `POST /v1/checkout/billing-portal` (`checkout.controller.ts:207`) |
| `getEntitlement` | `GET /v1/clients/me/coach/entitlement` | `GET /v1/checkout/entitlement` (`checkout.controller.ts:168`); response `{active, entitlement_active}` (`checkout.controller.ts:182`) |
| `getPurchases` (new) | n/a | `GET /v1/checkout/purchases` (`checkout.controller.ts:147`); raw `ClientPurchase` Prisma rows (`checkout.service.ts:623-635`) |
| `getPaymentStatus` | `GET /v1/clients/me/coach/payment-status` (round 1: `GET /v1/checkout/status` — also dead) | **Derived** from `getPurchases()` + `getPackages()`. Every output field maps to a real Prisma column on `ClientPurchase` (`prisma/schema.prisma:3189-3256`) or `CoachPackage` (`prisma/schema.prisma:2942-3000`). |

### `getPaymentStatus` field provenance (real backend columns only)

| `ClientPaymentStatus` field | Source (backend file:line) |
| --- | --- |
| `state` | derived from `ClientPurchase.entitlement_active` (`schema.prisma:3215`) + `ClientPurchase.status` (`schema.prisma:3214` — enum `pending\|paid\|active\|past_due\|canceled\|payment_failed\|expired`). `'trialing'` is not produced — backend has no trial column today. |
| `package_id` | `ClientPurchase.package_id` (`schema.prisma:3195`) |
| `package_name` | join `getPackages()` by `package_id` → `CoachPackage.name` (`schema.prisma:2946`). Purchases endpoint does NOT include the `package` relation — verified `checkout.service.ts:623-635` uses bare `findMany`. |
| `current_period_end` | `ClientPurchase.current_period_end` (`schema.prisma:3220`) |
| `trial_ends_at` | always `null` — no backend column today |
| `dunning` | always `null` — see (d) below |

Active-row selection mirrors the server rule in `checkout.service.ts:744-757`: `entitlement_active === true` AND (`access_expires_at` is null OR in the future).

### Drops in round 3

- `ClientCoachPackage.is_current` removed. The backend `CoachPackage` Prisma model has no such column (`prisma/schema.prisma:2942-3000`) — the field was a mobile fabrication that round 1 introduced. `ClientPackagesScreen` now reads "current package" from `status.data.package_id === pkg.id` (real backend signal).
- Round-2 derivation of status from `getEntitlement` removed. Entitlement only returns `{active, entitlement_active}`; it does not carry `package_id`. Status is now derived from `getPurchases()` instead, which DOES carry `package_id`.

### `isNotConfigured` swallow-404 fix (preserved across all rounds)
- Before: `status === 404 || status === 501` → `reason: 'not_configured'`
- After: `status === 501` only → `reason: 'not_configured'`. A 404 / transport failure surfaces as `reason: 'error'` (retryable).

## (c) Typecheck / lint / test results (round 3 — final)

- `npm run typecheck` → **clean** (`tsc --noEmit`, 0 errors)
- `npm run lint` → **0 errors** (72 pre-existing warnings, under the existing `--max-warnings=99999` cap)
- `npx jest` → **1434 / 1434 passing** across 135 suites
  - `paymentsConnectPackages.test.ts` rewritten around REAL backend response shapes — every mock uses only columns confirmed present on the real Prisma model. New tests:
    - `getPaymentStatus` derives `state='active'` + `package_id` + `package_name` from `ClientPurchase` (real `entitlement_active`, `status`, `current_period_end`, `package_id` fields).
    - Drops a purchase whose `access_expires_at` is in the past (mirrors `checkout.service.ts:744-757`).
    - Surfaces `state='past_due'` even when entitlement is off (real `status='past_due'` from `schema.prisma:3214`).
    - `getPurchases` envelope unwrap.
    - `confirmCheckoutSession` adapts the real `{paid,status,package_name}` shape into `ClientPaymentStatus`.
  - Regression guard: a new assertion confirms `is_current` is undefined on the mobile `ClientCoachPackage` type so a future re-introduction of the fabrication breaks CI.

## (d) Backend assumptions (none — every field verified first-hand)

Every field this PR consumes was verified against a specific file and line in `BradleyGleavePortfolio/growth-project-backend@main`. The provenance table above cites each one. The only remaining gap is dunning.

**Dunning gap (audit P2).** `DunningState` exists in the DB (`growth-project-backend/prisma/schema.prisma:3424`) with rich state (`status`, `failure_count`, `grace_period_ends_at`, etc.) but is only read by internal services today. There is NO client-facing route that exposes it — confirmed by grepping `checkout.controller.ts` (no `dunning` handler). `dunning` is therefore `null` on every page-load response. The screen's past-due banner stays hidden until the backend ships a dunning read route; the banner code is wired and will render the moment this stops being null. The file-header docstring in `clientPaymentsApi.ts` carries a `TODO(backend): expose GET /v1/checkout/dunning (or fold dunning fields into the purchases response)` so the gap is tracked and not silently lost. Change point if/when the backend adds the route: one `null` literal in `getPaymentStatus`.

## (e) Other dead-route call sites (re-grepped after round 3)

All remaining `/v1/clients/me/coach/` hits in the mobile repo are out of scope:

- `services/api.ts:80` — references `/v1/clients/me/coach/packages` in `isEntitlementEndpoint`. Already covers `/v1/checkout/*` so the new routes are recognised by the 402-paywall interceptor automatically.
- `components/PackageSelectionSheet.tsx:232` and `screens/client/Day1WinScreen.tsx:145` — both call `/v1/clients/me/coach/packages` (real packages-list route, verified `packages.controller.ts:161`).
- `components/home/CoachIntroductionBanner.tsx:124` — GETs `/v1/clients/me/coach` (real coach-profile route, verified `packages.controller.ts:126`).

No remaining dead checkout / entitlement / status / billing call sites.

## Files touched (across all three commits)

```
src/__tests__/paymentsConnectPackages.test.ts   | rewritten around real backend shapes
src/__tests__/paywallSheet.test.tsx             | drop fabricated is_current from mocks (round 3)
src/api/clientPaymentsApi.ts                    | route rewires; getPaymentStatus derives from real ClientPurchase
src/screens/client/ClientPackagesScreen.tsx     | "Current" pill reads status.data.package_id, not pkg.is_current
src/screens/client/CheckoutReturnScreen.tsx     | (round 1) docstring only — API call signature unchanged
```

Commits on this branch:
- `14cd9e1` round 1 — original rewire to `/v1/checkout/*`
- `621e921` round 2 — audit fix: derive status, rewire entitlement
- `fa428d4` round 3 — audit fix: derive from real `ClientPurchase` rows, kill fabricated `is_current`

## Scope discipline (per brief guardrails)

- Mobile fix/rewire only — no backend changes, no drip-feed, no new models.
- `PackageCheckoutScreen` (the working public-share-link flow) untouched.
- Surface A and the package surfaces untouched (later PR).
- Diff is tight: API client + screen-level doc-string + minimal `current` derivation update + test updates.
