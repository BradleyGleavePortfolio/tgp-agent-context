# AUDIT — PR-1 R2 fix(payments): in-app client checkout (PR #208)
VERDICT: NOT CLEAN
Typecheck: PASS (`npm run typecheck` — 0 errors)
Lint: PASS (`npm run lint` — 0 errors, 72 pre-existing warnings, under max-warnings cap)
Tests: PASS (`npm test` — 135 suites, 1430 tests, 4 snapshots, all pass)

Branch: pr1/fix-in-app-checkout @ 621e921
Commits in PR: 14cd9e1, 621e921

---

## P0 findings
*(none)*

## P1 findings

### `package_name` is permanently null for paying clients — derivation reads a field the backend never sets
`src/api/clientPaymentsApi.ts:296`

```ts
const currentPackage = packagesResult.data.find((p) => p.is_current) ?? null;
```

The R2 comment block (`src/api/clientPaymentsApi.ts:249–265`) promises that `package_name` is derived from the packages list's `is_current` flag. That flag does not exist on the backend wire response.

Evidence:
- Backend handler `ClientPackagesController.list` returns `{ packages: rows }` where `rows` are raw Prisma `CoachPackage` rows (`growth-project-backend-c884e2de/src/packages/packages.controller.ts:170` → `growth-project-backend-c884e2de/src/packages/packages.service.ts:144-149` — straight `findMany` with no enrichment).
- The Prisma model `CoachPackage` (`growth-project-backend-c884e2de/prisma/schema.prisma:2937-2961`) has no `is_current` column.
- `grep -rn is_current /home/user/workspace/growth-project-backend-c884e2de/src` returns zero hits anywhere in backend `src/`.
- Mobile normalizer `normalizeClientPackage` (`src/api/clientPaymentsApi.ts:144`) coerces missing `is_current` to `false`, so `find((p) => p.is_current)` always returns `undefined` → `package_name === null`.

Downstream UX impact (`src/screens/client/ClientPackagesScreen.tsx:286`): the "Current plan" card renders only when `status.data.state !== 'none' && status.data.package_name`. With `package_name` always null, paying clients with an active entitlement will never see the current-plan summary — they get the buy-side packages list as if they had no plan, and every package's "Current" pill (line 363, also driven by `pkg.is_current`) is also dead. The buyer can re-purchase the plan they already own; checkout is idempotent on Stripe's side but the UI gives no indication of which plan they're already on. This is a meaningful correctness/UX gap that the PR description claims is fixed.

Why P1 (not P0): the in-call envelope and `state` are honest (`active|none`) — entitlement gating, paywall, dunning behavior, and protected screens still work. The bug is confined to display of the plan name and the "Current" pill on the packages screen. No money bug, no crash, no double-charge. The unit test at `src/__tests__/paymentsConnectPackages.test.ts:115-138` masks the gap by mocking `is_current: true` directly into the fake `mockedApi.get` payload — a real `/v1/clients/me/coach/packages` response does not contain that flag.

Concrete fix options (any one):
1. Derive `currentPackage` from `confirmCheckoutSession`'s response and cache, not from the packages list flag — backend `confirm` already returns `package_name`.
2. Add a `purchases` join in `listPublicForCoach` and stamp `is_current` server-side (one-line backend change).
3. Pull current package via `GET /v1/checkout/purchases` (route exists at `growth-project-backend-c884e2de/src/checkout/checkout.controller.ts:147`) and intersect with the packages list.

## P2 findings

### Dunning / past-due banner is permanently unreachable; PR comment acknowledges but does not flag it as a tracked gap
`src/api/clientPaymentsApi.ts:311` (`dunning: null`), `src/screens/client/ClientPackagesScreen.tsx:277`

R2's `getPaymentStatus` hardcodes `dunning: null`, so the `DunningBanner` at line 277 never renders. The audit brief calls this out explicitly. Past-due / card-failed clients receive zero in-app warning until the backend ships a past-due signal.

Severity rationale: this is the same behavior as before this PR (every prior call 404'd → silently mapped to `not_configured` → banner also never rendered), so it is **not a regression vs. main** — but it IS a known UX gap that this PR was the right moment to land alongside the rest of the rewire. Past-due users with a real card-update workflow waiting on them silently keep failing until they notice access loss. Either:
- ship a server-side derivation now (the dunning fields it needs are already on the Stripe subscription object reachable from `CheckoutService`), or
- file a tracked follow-up issue and link it from the code comment so the gap doesn't ossify under "we'll handle that later."

The PR-1 R2 commentary acknowledges the gap (`clientPaymentsApi.ts:308-311`, "No status route → no past-due signal") but does not link a follow-up. Without a tracking link this is the kind of gap that quietly stays open for two quarters.

### Test mocks the very field whose absence is the P1 bug, masking it from CI
`src/__tests__/paymentsConnectPackages.test.ts:122`

The test `'derives state=active + package_name when entitlement is active and a current package exists'` mocks `is_current: true` directly into the fake response. The real backend response shape does not include that field. A faithful contract test would either:
- replay a recorded real response (no `is_current`), or
- import the Prisma `CoachPackage` row shape from a shared types file the backend publishes.

Without one of those, this test will keep passing forever while the user-visible feature stays broken — exactly the failure-mode that made R1 land with a fake `/status` route in the first place.

## P3 (non-blocking)
- `src/api/clientPaymentsApi.ts:283-288` — the early-return on `not_configured` short-circuits before checking the other call. If entitlement returns 501 and packages returns a real error, the user sees the gentler "not configured" copy rather than the truthful "we couldn't load packages either" — minor ordering nit.
- Long block comment at top of `clientPaymentsApi.ts` (lines 14-38) is now a historical record of two prior round audits. Useful, but it's getting long; could be condensed once R2 is merged.

## Verification of PR claims
- "P0 FIX: `getPaymentStatus` no longer calls any `/status` route — it now DERIVES status from entitlement + packages-list `is_current`" → **PARTIALLY TRUE.** No `/status` call remains in code (verified: only two `/v1/checkout/status` references, both in comments at `clientPaymentsApi.ts:21` and tests at `paymentsConnectPackages.test.ts:109`). Backend `/v1/checkout/entitlement` exists (`checkout.controller.ts:168`) and returns `{active, entitlement_active}` — code reads `.active` correctly. However the `is_current` derivation is broken — see P1.
- "GET /v1/checkout/entitlement and the packages-list route it derives from ACTUALLY exist" → entitlement: TRUE. packages list: TRUE (`/v1/clients/me/coach/packages` exists at `packages.controller.ts:161`). `is_current` field on the packages-list response: **FALSE** — does not exist.
- "Derivation is correct and does not crash on empty/error responses" → TRUE for crash safety (`.find()` on `[]` returns `undefined`, `?? null` handles it; `Promise.all` followed by explicit envelope checks). Correctness is the P1 above.
- "Dunning banner permanently hidden — acceptable or regression?" → **NOT a regression** (prior behavior: 404 → swallowed → banner also never shown). Logged as P2 because the silent-gap is now ossified into deliberate code and not tracked by a follow-up. Past-due clients still get zero in-app warning.
- "P1 FIX: `getEntitlement` now calls `GET /v1/checkout/entitlement`" → TRUE (`clientPaymentsApi.ts:331`). Test covers it (`paymentsConnectPackages.test.ts:213-221`).
- "`EntitlementProvider.refreshEntitlement` no longer fail-closes the app at boot" → PARTIALLY TRUE. The previous dead route returned `reason: 'error'` (404 → not 501) and `EntitlementProvider.refreshEntitlement` (`src/entitlements/EntitlementProvider.tsx:65-74`) sets status `unavailable` on `!result.ok`, which `ProtectedScreen` reads to fail closed. The fix is that the route now exists, so a healthy backend returns `{active: true|false}` and the gate behaves correctly. The fail-closed behavior on transport error is unchanged (it's by design — `EntitlementProvider.tsx:66-68` comment "Defense in depth (Option B): transport / config failures must fail closed"). So "no longer fail-closes the app at boot" is true only because the upstream now succeeds — fail-closed for real transport failures is still intentional and correct.
- "Re-grep for remaining `/v1/clients/me/coach/` checkout/entitlement/status/billing call sites" → CONFIRMED. The only remaining live references in production code are `/v1/clients/me/coach/packages` at:
  - `src/api/clientPaymentsApi.ts:194` (getPackages — correct, the route exists)
  - `src/screens/client/Day1WinScreen.tsx:145` (sheet gate — correct route)
  - `src/components/PackageSelectionSheet.tsx:232` (selection sheet — correct route)
  - `src/services/api.ts:80` (predicate for entitlement-endpoint matching — uses substring check, correct)
  All four are the same real route. No other `/v1/clients/me/coach/{checkout|entitlement|status|billing-portal|confirm}` call sites exist.

---

VERDICT: NOT CLEAN (1× P1, 2× P2)

The PR fixes the load-bearing R1 audit findings (dead `/status` and `/entitlement` routes are gone, real backend routes are used, EntitlementProvider works against a live endpoint). But it ships a new derivation bug: `is_current` is read from a field the backend never returns, so the "Current plan" card and "Current" pill are dead for every paying client. The test suite is green because the unit test invents the missing field in its mock — exactly the same masking pattern that allowed R1 to ship a fake route. Recommend rebuilding the derivation against a real backend signal (or having the backend stamp `is_current` server-side) before merge.
