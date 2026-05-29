# AUDIT — PR-1: fix(payments): rewire in-app client checkout to real CheckoutController (PR #208)
VERDICT: NOT CLEAN
Typecheck: pass (`npx tsc --noEmit`, 0 errors)
Lint: pass (`npx eslint "src/**/*.{ts,tsx}" --max-warnings=99999`, 0 errors, 72 pre-existing warnings — none in files touched by this PR)
Tests: pass (`npx jest`, 135 suites / 1427 tests, 0 failures; targeted `paymentsConnectPackages.test.ts` = 27/27 pass)

Branch audited: `pr1/fix-in-app-checkout` @ commit `14cd9e1` (single commit on top of `main`).

Cross-checked against backend `CheckoutController` at `/home/user/workspace/growth-project-backend-27454ddb/src/checkout/checkout.controller.ts` (also confirmed identical in the most-recent backend repo `growth-project-backend-52be7000` — neither contains a `status` route).

---

## P0 findings

### P0-1 — `GET /v1/checkout/status` is a phantom route. Every payment-status read still 404s.
- **Where:** `src/api/clientPaymentsApi.ts:245` (`api.get<ClientPaymentStatus>('/v1/checkout/status')`).
- **Evidence:** Backend `CheckoutController` (`@Controller('v1/checkout')`) declares only these handlers (`checkout.controller.ts:94..236`):
  - `POST sessions`
  - `POST payment-intent`
  - `GET  purchases`
  - `GET  entitlement`
  - `GET  payment-method`
  - `POST billing-portal`
  - `GET  sessions/:sessionId/confirm`
  No `status` route exists. A repo-wide grep across `/home/user/workspace/growth-project-backend-27454ddb/src` for `/v1/checkout/status`, `'status'`, `@Get('status')`, and `payment-status` returns zero matching handlers — the only `'status'` hits are `@Query('status')` parameters on admin payment-ops endpoints, which are query params on `purchases` / `failed` lookups, not a status route. The historical mobile path `/v1/clients/me/coach/payment-status` is *also* absent from the `ClientPackagesController` (`packages.controller.ts:108..191`).
- **Why P0:** The auditor brief explicitly flagged that this assumption "may be broken" and instructed it to be P0 if unconfirmable. It is unconfirmable from the mobile side AND positively disproven on the backend. After this PR, every `clientPaymentsApi.getPaymentStatus()` call (`ClientPackagesScreen.load()`, the past-due billing-portal fallback on `clientPaymentsApi.ts:250`, dunning banner, "Current plan" card) hits a non-existent path and falls into the new `reason: 'error'` branch — which is *worse* than pre-PR behavior in one respect: a past-due client now sees a generic error banner instead of the (still-broken) "not configured" empty state. The screen will never render the "Current plan" card or the dunning banner. The PR's stated bug ("payment-status was dead") is not actually fixed — it's just swapped for a different dead route.
- **Concrete fix:** Either (a) add a `GET /v1/checkout/status` (or `GET /v1/checkout/me/status`) route to `CheckoutController` on the backend that returns the `ClientPaymentStatus` shape the mobile expects (`state`, `package_name`, `current_period_end`, `trial_ends_at`, `dunning`) AND ship that backend change as a prerequisite to this PR; or (b) reuse the existing `GET /v1/checkout/entitlement` + a derived state, but this loses the dunning fields and is a contract regression. Option (a) is the right fix.

### P0-2 — `POST /v1/checkout/billing-portal` body shape is OK, but the mobile call passes an empty object body that the backend ValidationPipe will reject with `forbidNonWhitelisted: true` if the body is non-empty. Verified harmless for the empty case, BUT note for completeness.
- Actually, after re-checking `checkout.controller.ts:84` the pipe is `{ whitelist: true, forbidNonWhitelisted: true, transform: true }` and the handler takes no `@Body()` at `:209`, so a `{}` body is fine. **Downgrading: no finding.** (Kept here as an audit-trail note so the reader can see this case was actually considered, not skipped.)

---

## P1 findings

### P1-1 — `GET /v1/clients/me/coach/entitlement` is still a dead route in this same file; not addressed by this PR.
- **Where:** `src/api/clientPaymentsApi.ts:285` (`api.get<{ active: boolean; reason?: string }>('/v1/clients/me/coach/entitlement')`).
- **Evidence:** The real backend route is `GET /v1/checkout/entitlement` (`checkout.controller.ts:168`); `/v1/clients/me/coach/entitlement` does not exist on `ClientPackagesController` (`packages.controller.ts:108..191`).
- **Why P1 (not P0):** Not in the four routes the PR description claimed to fix, so technically out-of-scope. But (a) the PR rewrote exactly this file and exactly this `clientPaymentsApi` surface, (b) it leaves a fifth dead route untouched in the same surface, (c) `getEntitlement` is invoked by `EntitlementProvider` to gate paid features (per its own doc comment at `:278..283`), and (d) the auditor brief asked for "any remaining dead route" — this is one. The mobile file's header at `:7..12` even still lists `GET /v1/clients/me/coach/entitlement` as a documented endpoint, perpetuating the bug.
- **Concrete fix:** Change the path to `/v1/checkout/entitlement` (the route already exists, takes `?package_id=&coach_user_id=`, returns `{ active, entitlement_active }`). Add an `it()` for it in `paymentsConnectPackages.test.ts` alongside the four routes this PR did test.

### P1-2 — `notConfigured` gate has a silent-failure mode when `getPaymentStatus()` fails.
- **Where:** `src/screens/client/ClientPackagesScreen.tsx:245..250`.
- **Evidence:** New gate:
  ```ts
  const packagesNotConfigured = !packages.ok && packages.reason === 'not_configured';
  const packagesEmptyOk        = packages.ok && packages.data.length === 0;
  const statusUnavailable      = !status.ok && status.reason === 'not_configured';
  const statusNone             = status.ok && status.data.state === 'none';
  const notConfigured = (packagesNotConfigured || packagesEmptyOk) && (statusUnavailable || statusNone);
  ```
  Because `/v1/checkout/status` doesn't exist (see **P0-1**), `status.ok` will be `false` with `reason: 'error'`, so both `statusUnavailable` and `statusNone` are `false`. That means even when the packages list is genuinely empty (a real "no plans" backend state — `coach_id` resolved, list returned `[]`, see `packages.controller.ts:163..172`), the screen will NOT render the "no plans yet" gate. Instead it falls through to `packages.ok ? packages.data.length === 0 ? <gate>` at `:330..345`, which *does* render a similar gate — so this specific case is OK. BUT: when packages is genuinely 200-empty AND payment-status is genuinely "none" (the canonical "coach hasn't enabled checkout yet" state) the original PR-intended copy at `:311..328` ("No self-serve plans yet — Your coach handles access directly") is NEVER reached after P0-1 lands, because `statusUnavailable || statusNone` is always false when status itself errors. The user sees the secondary "No plans available right now" gate instead, which is a different (and less reassuring) message. Fix is downstream of P0-1.
- **Why P1:** UX regression, not a money bug. Becomes irrelevant once **P0-1** is fixed.
- **Concrete fix:** After fixing P0-1, also consider treating `!status.ok && status.reason === 'error'` as an explicit "show error banner, do not show empty-state gate" so a transient network failure doesn't masquerade as a configured-but-empty offer list.

---

## P2 findings

### P2-1 — Test for the new confirm verb does not assert the verb negatively.
- **Where:** `src/__tests__/paymentsConnectPackages.test.ts:243..255`.
- **Evidence:** The test asserts `mockedApi.get` was called with the right URL but does not assert that `mockedApi.post` was NOT called. Given the previous-version test was a POST assertion and Jest's `toHaveBeenCalledWith` matchers don't enforce exclusivity, a future regression that reverts to POST AND keeps a stray GET would still pass.
- **Why P2:** Defense in depth on a route that just had a verb bug.
- **Concrete fix:** Add `expect(mockedApi.post).not.toHaveBeenCalled();` inside the `confirmCheckoutSession GETs ...` test (mocks are reset per-test via `beforeEach(jest.resetAllMocks)` — verify this exists in the file or add it).

### P2-2 — `getPackages` calls `/v1/clients/me/coach/packages` which returns `{ packages: rows }` even for the no-coach case — `packagesEmptyOk` won't fire on a true "no coach assigned yet" path the way the comment implies.
- **Where:** `src/screens/client/ClientPackagesScreen.tsx:246` and backend `packages.controller.ts:163..172`.
- **Evidence:** The backend "no coach assigned" branch returns `200 { packages: [] }` (not 404, not 501), and the new `packagesEmptyOk = packages.ok && packages.data.length === 0` flag treats that the same as a coach with a fully-empty offer list. The two are semantically different (no coach vs. coach-but-no-plans). The "Message your coach" CTA in the gate at `:320..327` makes no sense if there is no coach to message.
- **Why P2:** Pre-existing latent issue surfaced by this PR's tightened gate logic. The user will hit "Message your coach" → no thread → confusion.
- **Concrete fix:** Use the existing `clientPaymentsApi.getEntitlement()` (after fixing **P1-1**'s path) or a dedicated `coachAssigned` signal to distinguish "no coach" from "no plans".

---

## P3 (non-blocking)

- `src/api/clientPaymentsApi.ts:7..15` — header doc comment lists `GET /v1/clients/me/coach/entitlement` as a consumed endpoint. After P1-1 is fixed, update this to `/v1/checkout/entitlement` and keep the file's route table truthful.
- `src/api/clientPaymentsApi.ts:296` — comment claims "The real endpoint is idempotent (the session id is the dedup key on the server side)". This is true on the backend (`checkout.service.ts` `confirmSession` looks up by `stripe_checkout_session_id` + `client_user_id`), but the comment cites no test and the suite has no replay-confirm test. Add a regression test that calls `confirmCheckoutSession` twice with the same id and asserts both calls return the same `ClientPaymentStatus`.
- `src/__tests__/paymentsConnectPackages.test.ts:266..274` — the URL-encoding test uses `cs/with/slash` (slashes get encoded to `%2F`). Real Stripe session ids are `cs_test_*` / `cs_live_*` with no reserved chars, so the defensive encoding is good but the test name "URL-encodes the session id" understates that the test is exercising a non-Stripe-shaped id. Either add a real `cs_test_…` happy-path assertion (already covered above) or rename to "defensively encodes reserved characters in the session id".

---

## Verification of PR claims

| Claim | Verdict | Evidence |
|---|---|---|
| Rewired four dead `/v1/clients/me/coach/*` checkout calls to real `/v1/checkout/*` routes. | **PARTIALLY TRUE** | Three of four targets exist on the backend (`POST /v1/checkout/sessions`, `POST /v1/checkout/billing-portal`, `GET /v1/checkout/sessions/:id/confirm` — see `checkout.controller.ts:94, 207, 236`). The fourth (`GET /v1/checkout/status`) **does not exist** — see **P0-1**. The PR has swapped one dead route for another. |
| No dead `/v1/clients/me/coach/` checkout call sites remain. | **TRUE for the four claimed sites** | Repo-wide grep finds only doc-comment references in `clientPaymentsApi.ts:172,211,293`, `CheckoutReturnScreen.tsx:15`, and the test file. No live `api.{get,post}(...)` to those paths remain — BUT see **P1-1**: a fifth dead route `/v1/clients/me/coach/entitlement` is still live at `clientPaymentsApi.ts:285`. |
| `CheckoutReturnScreen.tsx` confirm is now `GET /v1/checkout/sessions/:id/confirm`. | **TRUE** | `clientPaymentsApi.ts:303..305` uses `api.get(...)` with `encodeURIComponent(sessionId)` interpolated in the path; verb + path match backend `checkout.controller.ts:236` (`@Get('sessions/:sessionId/confirm')`); session id is correctly placed/encoded. |
| `isNotConfigured` tightened to 501-only. | **TRUE** | `clientPaymentsApi.ts:151` returns `e?.response?.status === 501`. Tests at `paymentsConnectPackages.test.ts:92..107, 114..122` verify 404 now becomes `reason: 'error'` on both `getPackages` and `getPaymentStatus`. |
| The "not configured" gate in `ClientPackagesScreen.tsx` derives from real signal (501 OR empty list + state:'none'). | **TRUE-as-coded BUT undermined by P0-1.** | Logic at `ClientPackagesScreen.tsx:245..250` matches the description. However, because `getPaymentStatus()` always errors after this PR (P0-1), `statusUnavailable` and `statusNone` are both always false, and the PR-1-introduced gate copy at `:311..328` is effectively unreachable until P0-1 is fixed. See **P1-2**. |
| Builder-assumed routes (`GET /v1/checkout/status`, `POST /v1/checkout/billing-portal`) — flag P0 if unconfirmable. | **`billing-portal` CONFIRMED, `status` FALSIFIED.** | `billing-portal` exists at `checkout.controller.ts:207`. `status` is **NOT present** anywhere in `CheckoutController` (or any other controller) on either the `27454ddb` or the most-recent `52be7000` backend repos. This is the P0. Backend confirmation is required — and the backend disconfirms it. |
| Idempotency-Key header added to `POST /v1/checkout/sessions`. | **TRUE and SAFE.** | `clientPaymentsApi.ts:228` attaches `{ headers: { 'Idempotency-Key': generateIdempotencyKey() } }` from `src/utils/idempotency.ts:36`. Header is harmless on the backend (the `CreateCheckoutDto` `forbidNonWhitelisted` gate only applies to body fields, not headers; `checkout.controller.ts:84,94`), and the backend already derives its own per-day idempotency key server-side (`checkout.service.ts:151..158`), so the client header is belt-and-suspenders, not load-bearing. Test coverage exists at `paymentsConnectPackages.test.ts:211..234`. |

---

## Summary

This PR fixes 3 of the 4 claimed broken routes (`sessions`, `confirm`, `billing-portal`) — those three are real and the new code matches the backend contract exactly (verb, path, body shape, URL encoding, idempotency header). It also genuinely tightens `isNotConfigured` to stop swallowing 404s as a benign empty state, with backing test coverage.

**However, the fourth claimed fix — `GET /v1/checkout/status` — is a phantom route.** The backend does not implement it on either inspected backend repo. After this PR ships, every payment-status read still 404s; the past-due dunning banner, the "Current plan" card, and the new "no self-serve plans yet" gate copy are all unreachable. The PR has substituted a different dead route for the original one. This is a P0.

A second, narrower issue: a fifth dead route (`/v1/clients/me/coach/entitlement`, `:285`) sits untouched in the very file this PR rewrote, while `EntitlementProvider` calls it to gate paid features (P1-1).

**Recommendation: do NOT merge until either (a) the backend ships a `GET /v1/checkout/status` route returning the `ClientPaymentStatus` envelope the mobile expects, or (b) the mobile call is repointed at a route that actually exists. P1-1 should be folded into the same PR since it's in the same surface.**

VERDICT: NOT CLEAN
