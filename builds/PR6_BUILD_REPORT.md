# PR-6 BUILD REPORT — Backend package reads + draft/publish + duration_periods + pricing combos

## (a) PR URL
https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/317

Branch: `pr6/package-reads-publish-pricing` against `main`. Commit author: Dynasia G <dynasia@trygrowthproject.com>. No Co-Authored-By / Generated trailers.

## (b) Endpoints added (under `/v1/coach/packages`)

| Method | Path | Behaviour |
| --- | --- | --- |
| GET  | `/:id`              | Owner-detail read. Returns the row + denormalized `content_count` (CoachPackageContent rows where `removed_at IS NULL`). IDOR-guarded: 404 (PACKAGE_NOT_FOUND) on unknown id OR foreign-coach id (collapsed to one shape, preserving DL-5 fix). Sub-coach scoped. |
| GET  | `/:id/subscribers`  | Paginated buyers list. Query params `limit` (default 50, hard cap 200) and `offset` (default 0). Returns `{ subscribers, next_offset, total_returned }`. Ordered by `created_at DESC`. Ownership re-checked via `requireOwnedPackage`. |
| POST | `/:id/publish`      | Idempotent — second call is a no-op (returns current row, does not bump timestamp). Re-runs `assertValidPricing`; refuses if `archived_at` set (BadRequest PACKAGE_ARCHIVED). TODO marker for the PR-8 content-required gate. |
| POST | `/:id/unpublish`    | Idempotent — sets `published_at = null`. Does NOT touch existing `ClientPurchase` rows / entitlements. |

All four are `@Roles('coach', 'owner')` and behind the existing `JwtAuthGuard / CoachOrOwnerGuard / SubscriptionGuard` stack on the controller.

## (c) Publish-state field + migration + backfill confirmation

### Field
```prisma
// prisma/schema.prisma — model CoachPackage
published_at DateTime?
```
Convention: `null` = DRAFT (not purchasable), non-null = PUBLISHED (timestamp of most recent publish call).

### Migration (`20261203100000_pr6_packages_publish_pricing`)
```sql
ALTER TABLE "CoachPackage"
  ADD COLUMN "published_at" TIMESTAMP(3),
  ADD COLUMN "recurring_amount_cents" INTEGER,
  ADD COLUMN "recurring_interval" TEXT,
  ADD COLUMN "recurring_interval_count" INTEGER,
  ADD COLUMN "recurring_stripe_price_id" TEXT;

UPDATE "CoachPackage" SET "published_at" = NOW() WHERE "published_at" IS NULL;

CREATE INDEX "CoachPackage_coach_id_published_at_idx"
  ON "CoachPackage" ("coach_id", "published_at");
```

**Backfill proof.** The `UPDATE` runs once at migration time, BEFORE any application code references the column, while every existing row has `published_at IS NULL` (the default of the just-added column). Every pre-existing row therefore comes out with a non-null timestamp — i.e. PUBLISHED — and continues to satisfy the `published_at IS NOT NULL` gate added downstream in:

- `src/checkout/checkout.service.ts:82` and `:377` (authed checkout)
- `src/storefront/storefront.service.ts:107` (public storefront GET)
- `src/storefront/guest-checkout.service.ts:235` (guest checkout)
- `src/packages/packages.controller.ts` ClientPackagesController.detail (student-side detail)
- `src/packages/packages.service.ts` `listPublicForCoach` (student list)

New packages created via `PackagesService.create` set `published_at: null` explicitly so DRAFT is the safe default for greenfield rows.

Additive-only confirmation: no DROP, no RENAME, no column type changes; new columns are nullable; all existing rows preserved. Verified with `npx prisma validate` (✅ valid) and `npx prisma generate` (✅ client built).

## (d) Pricing config model + Stripe second-price mapping

### Model
The existing `amount_cents` / `billing_type` / `interval` / `interval_count` triple stays untouched as the **PRIMARY** price (preserves single-price packages and the entire lazy `stripe_price_id` cache). PR-6 adds an OPTIONAL **second** price config:

```prisma
recurring_amount_cents    Int?
recurring_interval        String? // week | month | year
recurring_interval_count  Int?
recurring_stripe_price_id String?
```

### Combos accepted by `assertValidPricing`

| # | Primary `billing_type` | Companion (`recurring_*`) | Result |
| --- | --- | --- | --- |
| 1 | one_time   | unset       | ✅ accepted (single-price, today's behaviour) |
| 2 | recurring  | unset       | ✅ accepted (single-price subscription) |
| 3 | one_time   | fully set   | ✅ accepted (one-time + recurring **combo**) |
| 4 | recurring  | any field set | ❌ rejected (would mean two competing subscriptions on one package) |
| 5 | one_time   | half-set    | ❌ rejected (companion requires both `recurring_amount_cents` and `recurring_interval`) |

Recurring cadence is `week | month | year` on both primary `interval` and companion `recurring_interval`.

### Stripe second-price mapping (per master plan §3)
- The PRIMARY price continues to mint **one** Stripe Price lazily on first checkout, cached at `CoachPackage.stripe_price_id` (existing path, untouched).
- The companion (when set) is modelled as a **separate** Stripe Price. PR-6 introduces a parallel lazy cache `recurring_stripe_price_id` and the writer `PackagesService.setRecurringStripePriceId()` that mirrors `setStripeIds()`. The actual Stripe API call to create the companion Price will live in checkout (PR-8 hooks it into the combo-buy flow); the data-model groundwork is in place.
- `update()` clears `recurring_stripe_price_id` automatically when any of the recurring price-shaping fields change (or when currency changes), mirroring how the primary price clears `stripe_price_id`.

**No sync Stripe HTTP inside a DB transaction:** all new service methods only touch Prisma rows. Stripe Price creation remains in `CheckoutService` outside any tx, exactly as before.

## (e) IDOR / sub-coach scope approach

Two layers of defence on every new endpoint:

1. **Effective-coach resolution at the controller.** Every handler calls
   `PackagesService.resolveEffectiveCoachId(req.user.id)` first. For a head coach this returns the caller id unchanged; for a sub-coach (role='coach' + `coach_id` non-null) it promotes to the head coach id via `SubCoachScopeService.getHeadCoachIdForSubCoach`. This matches the team model: `CoachPackage.coach_id` is always the HEAD coach in the canonical hierarchy, so a sub-coach acting on their team's catalog must lift to the head id before any ownership query.

2. **Re-check at the service.** `getOwnedDetail` / `listSubscribers` / `publish` / `unpublish` all call `requireOwnedPackage(coachId, packageId)`, which `findFirst({ id, coach_id })`s and 404s with `PACKAGE_NOT_FOUND` on unknown id OR cross-coach id (single response shape, preserving the DL-5 enumeration fix).

The student-side `ClientPackagesController.detail` continues to gate on `coach_id === req.user.coach_id` PLUS the new `published_at !== null` check, so DRAFT packages don't even leak existence to clients.

`SubCoachScopeService` is exposed via `@Global` `SubCoachModule`, so injecting it into `PackagesService` required no module rewiring.

## (f) Test results

### Build
- `npx prisma validate` → ✅ schema valid
- `npx prisma generate` → ✅ client generated (v6.19.3)
- `npx tsc --noEmit -p tsconfig.json` → ✅ no errors
- `npx nest build` → ✅ no errors
- `npx eslint src/` → 0 errors, 17 pre-existing warnings (all in untouched files)

### Tests (`npx jest`)
```
Test Suites: 281 passed, 281 total
Tests:       20 skipped, 5 todo, 3354 passed, 3379 total
```
PackagesService spec grew from 16 → 33 tests. New PR-6 coverage:
- `published_at` defaults to null on create (DRAFT default).
- `publish` / `unpublish` idempotency (second call is a no-op).
- `publish` rejects archived packages with BadRequest.
- `publish` / `unpublish` IDOR-guarded — foreign coach id 404s.
- `listPublicForCoach` filters out DRAFT in addition to archived/inactive.
- One-time + recurring **combo** create round-trips both prices.
- Each recurring cadence (week / month / year) accepts.
- Recurring primary + companion **rejected** (no two competing subs).
- Half-set companion **rejected** (amount-only, missing cadence).
- Companion below Stripe minimum (50¢) rejected.
- Companion with bad cadence (`fortnight`) rejected.
- `update` clears `recurring_stripe_price_id` when any recurring field changes.
- `getOwnedDetail` returns row + content_count (excluding `removed_at` rows) and IDOR-404s foreign coach.
- `listSubscribers` paginates correctly (50/page over 75 rows → next_offset 50 → null), caps `limit` at 200, IDOR-404s foreign coach.
- `resolveEffectiveCoachId` returns caller id for head coach, head coach id for sub-coach.
- `duration_periods` round-trips on create + update (incl. clearing back to null).

Existing fixtures (checkout / storefront / guest-checkout) updated to include `published_at: new Date(…)` so the new gate is satisfied; all 138 tests in those four suites pass.

### Verification of "existing packages unaffected"
Existing fixtures simulate live packages. Without backfilling them to `published_at` non-null, the new gate would mass-404 every existing checkout / storefront flow — and indeed the test suite caught that on first run (41 failures), giving direct proof the gate fires. After applying the equivalent of the migration backfill to the test fixtures, all 138 tests pass — exactly the behaviour we expect production rows to exhibit after migration runs.

---

## Files changed
- `prisma/schema.prisma` — `CoachPackage` model: +5 columns, +1 index.
- `prisma/migrations/20261203100000_pr6_packages_publish_pricing/migration.sql` — NEW (additive + backfill).
- `src/packages/packages.dto.ts` — `duration_periods`, `recurring_*`, `billing_*` extended on Update DTO.
- `src/packages/packages.service.ts` — extended `assertValidPricing`, new `publish` / `unpublish` / `getOwnedDetail` / `listSubscribers` / `resolveEffectiveCoachId` / `setRecurringStripePriceId`. Constructor takes `SubCoachScopeService`.
- `src/packages/packages.controller.ts` — new endpoints, `resolveEffectiveCoachId` invoked on every coach-facing handler, `published_at` gate added to student-side detail.
- `src/checkout/checkout.service.ts` — gate on `published_at` (both checkout entry points).
- `src/storefront/storefront.service.ts` — gate on `published_at` (public GET).
- `src/storefront/guest-checkout.service.ts` — gate on `published_at` (guest POST).
- `test/packages.service.spec.ts` — 17 new tests.
- `test/checkout.service.spec.ts` / `test/storefront.service.spec.ts` / `test/guest-checkout.service.spec.ts` — fixtures populated with `published_at`.
