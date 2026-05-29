# AUDIT — PR-6: package reads + draft/publish + duration_periods + pricing combos (PR #317)

VERDICT: CLEAN

Typecheck/Build: pass (`npx nest build` exit 0)
Lint: pass (`npx eslint src/` — 0 errors, 17 pre-existing warnings)
Prisma: `npx prisma validate` ✓, `npx prisma generate` ✓
Tests:
- Target suites: 4 suites / 138 tests passed (`test/packages.service.spec.ts`, `test/checkout.service.spec.ts`, `test/storefront.service.spec.ts`, `test/guest-checkout.service.spec.ts`)
- Full repo: 281 suites / 3354 tests passed, 20 skipped, 5 todo

---

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking)
1. **DTO comment vs validator semantics (packages.dto.ts:114-120, 122-137).** The comments say "Pass `null` to clear" on `UpdatePackageDto.duration_periods` / `recurring_amount_cents` / `recurring_interval_count`. The validators (`@IsInt()`, `@Min(1)`) would normally reject null — but `@IsOptional()` from class-validator short-circuits on null, so this works. The behaviour is correct; the comment is just easier to misread. Optional nit.
2. **Half-set companion clearing requires nulling 3 fields (packages.service.ts:458-501).** To revert a one-time+recurring combo to a single-price package the coach must send null for `recurring_amount_cents`, `recurring_interval`, AND `recurring_interval_count` in the same PATCH. Sending only `recurring_amount_cents: null` leaves the row half-set and `assertValidPricing` rightly rejects it. Worth documenting on the editor side; not a backend defect.
3. **PR description overclaims companion-price minting.** The PR body says "The companion mints its own Stripe Price lazily (`recurring_stripe_price_id` cache)". The data model + writer `setRecurringStripePriceId` exist (packages.service.ts:370-378), but no caller in `src/` actually mints the companion Price during checkout. This is acceptable per the brief's scope (the data foundation is laid; combo charging follows in a later PR) but the PR body should say "data model + cache slot in place; checkout wiring follows in a later PR" rather than implying the lazy mint is wired today. Documentation nit, not a correctness bug.

---

## Verification of PR claims

- **Migration is additive-only, backfills existing rows to PUBLISHED.** VERIFIED.
  `prisma/migrations/20261203100000_pr6_packages_publish_pricing/migration.sql:32-44` adds five nullable columns (`published_at`, `recurring_amount_cents`, `recurring_interval`, `recurring_interval_count`, `recurring_stripe_price_id`) and a `(coach_id, published_at)` index. The single `UPDATE "CoachPackage" SET "published_at" = NOW() WHERE "published_at" IS NULL;` sets every pre-existing row to published before any service code references the column. No DROP / RENAME / type changes. No way for a currently-selling package to land in DRAFT after the migration. P0 backfill-safety: SAFE.

- **Purchasability gated on `published_at IS NOT NULL` at all four sites.** VERIFIED at:
  - `src/checkout/checkout.service.ts:82` (createCheckoutSession)
  - `src/checkout/checkout.service.ts:378` (createPaymentIntent)
  - `src/storefront/storefront.service.ts:107` (public storefront)
  - `src/storefront/guest-checkout.service.ts:236` (guest-checkout)
  - `src/packages/packages.controller.ts:275` (ClientPackagesController.detail, the 5th gate the brief listed under #2).
  Each gate is OR'd with the existing `!is_active`, `archived_at`, etc. checks; a backfilled (published) package passes; a DRAFT (null) is 404'd. None of these gates is on the post-purchase entitlement path.

- **Unpublish does NOT revoke existing buyer entitlements.** VERIFIED.
  `unpublish` only writes `published_at: null` on the `CoachPackage` row (packages.service.ts:241-249). Entitlement state lives on `ClientPurchase` (status, access_expires_at) and is untouched. The webhook handler (`src/checkout/checkout-webhook-handler.service.ts`) does not reference `published_at` at all — payment processing for already-in-flight purchases, refunds, disputes, and renewals continues regardless of publish state. Existing buyers keep access.

- **IDOR / sub-coach scope on every new endpoint.** VERIFIED.
  All four new handlers (`detail`, `subscribers`, `publish`, `unpublish` — packages.controller.ts:69, 80, 166, 174) call `resolveEffectiveCoachId` → `SubCoachScopeService.getHeadCoachIdForSubCoach` (packages.service.ts:332-336; sub-coach-scope.service.ts:91-98) which promotes a sub-coach's id to their head-coach id (since `CoachPackage.coach_id` is the head coach in this team model), then `requireOwnedPackage` (packages.service.ts:338-352) does `findFirst({ id, coach_id })` and 404s on miss — non-leaking on cross-coach AND unknown id (DL-5 preserved). A coach hitting another coach's package id → 404. A sub-coach acts on their head coach's catalog as expected.

- **Idempotent publish/unpublish.** VERIFIED.
  `publish`: re-checks ownership, rejects archived, re-runs `assertValidPricing`, then `if (row.published_at) return row;` (packages.service.ts:234) — no DB write on the second call, no error, returns the existing timestamp unchanged.
  `unpublish`: `if (!row.published_at) return row;` (packages.service.ts:244) — idempotent on already-draft. Test coverage exists in `test/packages.service.spec.ts` for both.

- **Pricing combos validated; invalid combos rejected.** VERIFIED.
  `assertValidPricing` (packages.service.ts:380-502) accepts (1) one_time-only, (2) recurring-only, (3) one_time + recurring companion, and rejects (a) recurring primary + any recurring_* (4-combo rule), (b) half-set companion (recurring_amount_cents set but recurring_interval missing or vice versa), (c) sub-50¢ companion, (d) bad companion cadence, (e) non-positive interval_count, (f) interval on one_time, (g) bad primary cadence. Test suite covers each.

- **No synchronous Stripe HTTP inside a DB `$transaction`.** VERIFIED.
  `packages.service.ts` does not import or call any Stripe client. `setStripeIds` and `setRecurringStripePriceId` are bare Prisma updates outside any `$transaction`. The existing `ensurePriceForPackage` in `checkout.service.ts:840` was untouched by PR-6; checkout still creates Stripe Prices outside any tx (the PR did not introduce new tx-wrapping). No anti-pattern A276-P1-3 regression.

- **Pagination cap on /subscribers.** VERIFIED.
  Controller clamps `limit` via `Math.min(parseInt(limitRaw ?? '50', 10) || 50, 200)` (packages.controller.ts:87). Service re-clamps `Math.min(Math.max(opts.limit ?? 50, 1), 200)` (packages.service.ts:309) — defense in depth, both sides cap at 200. Uses `take: limit + 1` peek pattern for `next_offset`. No unbounded query.

- **duration_periods round-trips.** VERIFIED.
  Exposed on both `CreatePackageDto` and `UpdatePackageDto` (packages.dto.ts:48-51, 117-120), wired through service create/update, validated `Int ≥ 1` or null. Webhook consumer unchanged.

- **Build + lint + test counts match PR description.** VERIFIED.
  PR description claims "281 suites, 3354 passed, 20 skipped, 5 todo" and "0 eslint errors, 17 pre-existing warnings" — both reproduced exactly on a fresh `npm ci` run.

---

No P0 / P1 / P2 findings. Three P3 nits noted, none blocking. The two real revenue-risk areas (backfill safety + purchase-path gating + buyer-entitlement independence) all pass.

VERDICT: CLEAN
