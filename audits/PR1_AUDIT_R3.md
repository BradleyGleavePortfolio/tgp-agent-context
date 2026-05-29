# AUDIT — PR-1 round 3: fix in-app checkout (PR #208, commit fa428d4)

VERDICT: CLEAN
Typecheck: pass (`npm run typecheck` → `tsc --noEmit`, no output)
Lint: pass (`npm run lint` → 0 errors, 72 pre-existing warnings, none in PR-touched files; under the `--max-warnings=99999` cap)
Tests: pass (`npm test` → 1434 / 1434 passing across 135 suites, 4 snapshots)

Scope of round 3: revert the fabricated `is_current` column, derive payment status from real `ClientPurchase` rows via `GET /v1/checkout/purchases`, adapt `confirmCheckoutSession` to the real `{paid,status,package_name}` shape, leave dunning null with a tracked TODO.

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings
*(none)*

## P3 (non-blocking)
- `src/api/clientPaymentsApi.ts:190` — `state` type still includes `'trialing'` even though the inline doc admits the backend never emits it. Not actually wrong (the screen still does `state === 'trialing'` checks at `ClientPackagesScreen.tsx:298` and `CheckoutReturnScreen.tsx:146`), but the dead enum widens the union for no real benefit. Could be tightened to `'active' | 'past_due' | 'canceled' | 'none'` and the trial branches removed in a follow-up. Non-blocking.
- `src/api/clientPaymentsApi.ts:446` — `Number.isNaN(ts) || ts > now` keeps an `entitlement_active` row whose `access_expires_at` is unparseable, which is slightly more permissive than the backend rule (the backend stores a `DateTime` column that cannot be NaN; only the wire-layer JSON round-trip could produce one). Defensive and harmless — flagging only because it's a minor divergence from the cited backend rule.
- The mobile call `clientPaymentsApi.getPaymentStatus` calls `clientPaymentsApi.getPurchases()` and `clientPaymentsApi.getPackages()` rather than the local non-exported underlying helpers. Tests jest.mock the api transport, not these methods, so this is fine in practice. Non-blocking.

## Verification of PR claims

1. **Removed fabricated `is_current` entirely from mobile type + normalizer.** — VERIFIED TRUE. `grep is_current src/**` shows references only in regression-guard test (`paymentsConnectPackages.test.ts:99` asserts `undefined`) and in three documentation comments. `ClientCoachPackage` interface (`src/api/clientPaymentsApi.ts:93-106`) has no `is_current` property; `normalizeClientPackage` (`:223-237`) does not produce one.

2. **`getPaymentStatus` re-derived from `GET /v1/checkout/purchases` joined with `getPackages()` by `package_id`.** — VERIFIED TRUE.
   - Real backend route confirmed: `GET /v1/checkout/purchases` exists at `growth-project-backend/src/checkout/checkout.controller.ts:147` (`@Get('purchases')` on `@Controller('v1/checkout')` line 82). Returns `{ purchases: items, next_cursor }` where `items` is `ClientPurchase[]` from `checkout.service.ts:623-636`.
   - Every field the mobile code reads is a real Prisma column on `ClientPurchase` (`growth-project-backend/prisma/schema.prisma:3189-3256`): `entitlement_active` (line 3215), `status` (line 3213, with documented enum at line 3214), `current_period_end` (line 3220), `package_id` (line 3195), `access_expires_at` (line 3219), `cancel_at_period_end` (line 3221), `canceled_at` (line 3222), `created_at` (line 3234).
   - Status enum used by mobile mapping (`src/api/clientPaymentsApi.ts:124-131`) exactly matches the backend enum: `pending | paid | active | past_due | canceled | payment_failed | expired`. No value the backend never emits; no `'trialing'` fabrication in the wire type. The screen-state union does still mention `'trialing'` but it is never produced by the mapping (`:456-465`) — confirmed by reading the conditional.
   - Active-row selection (`:441-447`) faithfully mirrors `checkout.service.ts:744-757` (`entitlement_active === true AND (access_expires_at IS NULL OR > now)`). The NaN guard is defensive (Prisma DateTime can't be NaN; harmless).
   - Packages join uses `getPackages()` (which hits `/v1/clients/me/coach/packages`, verified at `growth-project-backend/src/packages/packages.controller.ts:161`) and looks up `name` by `package_id`. The backend `CoachPackage` model (`prisma/schema.prisma:2942-3000`) has `id`, `name`, `description`, `amount_cents`, `currency`, `billing_type`, `interval` — every field the normalizer reads is a real column.

3. **`confirmCheckoutSession` adapted to real `{paid,status,package_name}` shape.** — VERIFIED TRUE. Backend confirms this exact return shape at `growth-project-backend/src/checkout/checkout.service.ts:677-735` (`return { paid, status: stripeStatus, package_name: pkgWithRelation.package?.name ?? null }`). Mobile call site (`src/api/clientPaymentsApi.ts:533-554`) types the response as `{ paid: boolean; status: string; package_name: string | null }`, maps `paid → state: 'active'|'none'`, propagates `package_name`, leaves `package_id` / `current_period_end` / `dunning` null with a code comment explaining why. Two regression tests (`paymentsConnectPackages.test.ts:391-425`) lock in this contract.

4. **Dunning stays null with a tracked TODO; backend has no client route.** — VERIFIED TRUE. `DunningState` model exists at `growth-project-backend/prisma/schema.prisma:3424`. Reviewed every `@Get`/`@Post` decorator in `growth-project-backend/src/checkout/`: the only dunning routes are under `/v1/admin/payments/dunning/*` (`payment-ops.controller.ts:192,200,212,224,236,241,256` on `@Controller('v1/admin/payments')` gated `@Roles('owner')`). No client-facing dunning read route exists. The mobile code returns `dunning: null` (`src/api/clientPaymentsApi.ts:485`) with a TODO(backend) in the file header (`:56-58`) and a wired-but-hidden banner in `ClientPackagesScreen.tsx:284-290`. Honest gap; not silently lost.

5. **Regression test asserts `is_current` is `undefined`.** — VERIFIED TRUE. `paymentsConnectPackages.test.ts:99`: `expect((res.data[0] as unknown as Record<string, unknown>).is_current).toBeUndefined();` runs against a mock that includes only real backend columns.

6. **No remaining fabricated field anywhere in the diff.** — VERIFIED TRUE. Cross-checked every property the mobile diff reads against the real Prisma models:
   - `ClientPurchase` reads: `id`, `package_id`, `status`, `entitlement_active`, `access_expires_at`, `current_period_end`, `cancel_at_period_end`, `canceled_at`, `created_at` — all present at `schema.prisma:3189-3256`.
   - `CoachPackage` reads (via normalizer): `id`, `name`, `description`, `amount_cents`, `billing_type` (or `type`), `currency`, `interval`, `price`, `features` — all present at `schema.prisma:2942-3000` except `price` (mobile-only convenience derived from `amount_cents`) and `features` (mobile defaults to `[]`, doc comment marks as "not yet exposed by backend"). Neither is fabricated as wire-input; both are honest local defaults.
   - confirm endpoint reads: `paid`, `status`, `package_name` — all present in the backend return shape at `checkout.service.ts:730-734`.

## Side checks (not in builder's claim list but worth confirming)

- **Envelope: 404 ≠ not_configured.** `isNotConfigured` (`:253-256`) only treats 501 as `not_configured`. Tests `:103-117`, `:275-291`, `:293-305` enforce this on both upstreams. The original PR-1 regression is locked down.
- **Idempotency.** `createCheckoutSession` (`:319-333`) still attaches `Idempotency-Key: generateIdempotencyKey()`. Test `:357-389` asserts both the URL templates and the header.
- **URL-encoding.** `confirmCheckoutSession` (`:538`) uses `encodeURIComponent(sessionId)`, locked by `:427-437`.
- **Promise.all ordering.** `getPaymentStatus` ordering (`:418-421`) is purchases-then-packages; tests use `mockResolvedValueOnce` in that same order. Stable.
- **Not_configured precedence.** If either upstream is 501, `getPaymentStatus` returns `not_configured` even when the other is a 404 (the 501 branches at `:426-431` return before the generic error branches at `:435-436`). Tests `:258-273` cover both sides. Correct.
- **Active-row vs status mapping interaction.** A `paid+entitlement_active` row maps to `'active'`; a `past_due` row with `entitlement_active=false` is found by the `pastDuePurchase` fallback (`:452`) and maps to `'past_due'` even though no active row exists. Test `:211-243` locks this in.

## Backend files read first-hand (BradleyGleavePortfolio/growth-project-backend @ main, commit ac82e496)

- `src/checkout/checkout.controller.ts` (every CheckoutController route + decorators)
- `src/checkout/checkout.service.ts:600-800` (listForClient, confirmSession, hasActiveEntitlement, getSavedPaymentMethodForClient)
- `src/checkout/payment-ops.controller.ts:1-60,192-256` (dunning route surface — confirmed admin-only)
- `src/packages/packages.controller.ts:155-189` (client-facing packages list)
- `src/packages/packages.service.ts:144-170` (listPublicForCoach)
- `prisma/schema.prisma:2942-3000` (CoachPackage), `:3189-3256` (ClientPurchase), `:3424` (DunningState)

## Bottom line

Round 3 cleanly addresses both round-2 findings. The mobile derivation now consumes only fields that exist on the real backend Prisma models and exposes only enum values the backend can produce. The status enum, the active-row selection rule, the packages join, and the confirm-endpoint adaptation all match the real backend code I read first-hand. The dunning gap is null-with-TODO rather than null-without-acknowledgement, and the wired banner means flipping it on is a one-line change once the backend ships the route. Type-check, lint, and 1434 tests all pass.

VERDICT: CLEAN
