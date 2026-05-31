# PR-18 / B1 — Backend pricing lock + combo error copy

**Repo:** growth-project-backend. **Off backend main `19e51b0`.** Builder = Opus 4.8.
**Source plan:** `specs/PR18_EXPANSION_PLAN.md` §2.5, §3.9, §4(B1).

## Write-set (STRICT — touch ONLY these)
- `src/packages/packages.service.ts`
- `test/packages.service.spec.ts`

Do NOT touch any other file. Do NOT touch `package-contents.*`, `drip-dispatcher.cron.ts`, `landing-pages.*`. Those are other units.

## Item 1 — Lock pricing after active recurring subscriber
In `PackagesService.update()` (~`:103-185`):
1. Compute `priceChanged` and `recurringChanged` before writing — include `amount_cents`, `currency`, `billing_type`, interval fields, `duration_periods` (if it changes buyer entitlement economics), and recurring companion fields.
2. If NO price-shaping field changed → update as today (name/description/status/availability always allowed).
3. If price-shaping fields changed → BEFORE clearing Stripe price IDs or updating, check for active recurring buyers:
   - Count `ClientPurchase` rows for the package with `entitlement_active = true` AND a recurring/subscription fingerprint: `stripe_subscription_id IS NOT NULL` and status in active-ish set (`active`, `trialing`, `past_due` + provider-normalized equivalents).
   - Combo packages: a one-time primary + recurring companion must lock BOTH primary and companion price fields once ANY active recurring buyer exists.
4. If locked → throw `ConflictException` with body `{ error: 'PACKAGE_PRICING_LOCKED', message: 'Pricing is locked because this package has active subscribers. Create a new package for new pricing.' }`.
5. Race: wrap the price-change branch in a Prisma `$transaction` and lock the package row (`SELECT id FROM "CoachPackage" WHERE id = ... FOR UPDATE`) before counting subscribers and updating. Keep `requireOwnedPackage()` (IDOR guard) BEFORE any subscriber count.
6. Do NOT mutate existing buyer snapshots / Stripe subscriptions. One count query only (no N+1).

## Item 2 — Combo min/max guard error copy (PR-14)
- Primary minimum error (~`:415-420`): if a recurring companion is present, message = `one-time amount_cents must be an integer ≥ 50 (Stripe minimum)`; otherwise keep existing generic copy.
- Recurring companion minimum (~`:497-501`): `recurring_amount_cents must be an integer ≥ 50 (Stripe minimum for the recurring companion)`.
- Validation SEMANTICS unchanged; error CODE must remain `PACKAGE_INVALID`.

## Tests (`test/packages.service.spec.ts`)
- Allows name/description/status update WITH active recurring subscribers.
- BLOCKS `amount_cents`, `currency`, `billing_type`, interval, `duration_periods`, recurring companion changes when an active recurring subscriber exists.
- Allows pricing edit when subscribers inactive/canceled or no recurring sub (chosen policy).
- Error code on lock is `PACKAGE_PRICING_LOCKED`.
- Combo copy: primary vs recurring messages assert exactly; error code stays `PACKAGE_INVALID`.

## Doctrine
- Commit identity (R4 STRICT, NO trailers): `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit -m "..."`.
- Push every ~2 min to `pr18/b1-pricing-lock` (R61). All git fetch/push need `api_credentials=["github"]`.
- Bar = CLEAN of P0/P1/P2 (see `AUDITOR_BRIEF_COMMON.md`). Do NOT weaken guards. No Stripe HTTP inside a Prisma tx.
