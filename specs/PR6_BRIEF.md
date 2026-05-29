# PR-6 BUILD BRIEF — Backend package reads + draft/publish + duration_periods + pricing config (decision #1)

**Repo:** growth-project-backend (NestJS). **Pillar 1/2. Type: FIX + BUILD.**
**Branch:** `pr6/package-reads-publish-pricing` off latest default (now has PR-2/3/4/7).

## GOAL
Round out the backend `CoachPackage` API so the unified Surface B editor (PR-13) has everything it needs: detail/read endpoints, a draft→publish lifecycle (so an empty package isn't live the instant it's saved), exposure of the existing-but-hidden `duration_periods`, and the richer pricing config from operator decision #1 (coach chooses amount, when to charge, one-time / recurring / one-time+recurring, recurring cadence weekly/monthly/yearly).

## CONTEXT (from the hunt)
- `PackagesService` CRUD + `assertValidPricing` + lazy Stripe Price cache already exist and are solid — EXTEND, don't rewrite (`packages.service.ts:46-245`).
- `CoachPackage.duration_periods` (`schema.prisma:2951`) is a real column the webhook ALREADY consumes (one-time programs expire after N periods), but it's exposed in NO editor/DTO → B6. Expose it on read + write DTOs.
- B10: no draft/publish state — a package goes live the instant it's saved, even empty. Add a publish gate.
- PR-3 already added `is_sellable Boolean @default(false)` to CoachPackage.
- Pricing today is `amount_cents` + `billing_type` + `interval`. Decision #1 needs: one-time, recurring, AND one-time+recurring combos, with recurring cadence weekly/monthly/yearly.

## DO
1. **Read endpoints:**
   - `GET /v1/packages/:id` (coach-owned detail incl. is_sellable, duration_periods, pricing config, publish state, and content count). IDOR-guard to the owning coach (+ sub-coach scope where applicable).
   - `GET /v1/packages/:id/subscribers` (paginated list of buyers/active purchases for that package — use existing pagination conventions; this powers the "who's on this" view). Guard ownership.
   Inspect existing controller for the conventions (guards, pagination, response shape) and MATCH them.
2. **Draft/publish lifecycle (B10):**
   - Add a publish state to CoachPackage. PREFERRED: a `status`/`published_at` style field (inspect whether a suitable column/enum already exists before adding; if you add one, additive migration, default to the SAFE state). Decide: new packages default to DRAFT (not live). Existing packages must remain in their current live behavior (backfill existing rows to "published" so nothing that's already selling disappears — this is critical, do NOT hide existing live packages).
   - `POST /v1/packages/:id/publish` and `POST /v1/packages/:id/unpublish`. Publish should enforce minimum validity (valid pricing; a sellable package being published with zero content is allowed for now since content attach is PR-8, but the gate must be in place and easy to extend — add a TODO referencing PR-8 content-required check). Unpublish takes it off the storefront/purchasable surface WITHOUT affecting existing buyers' entitlements.
   - Ensure the storefront/purchase paths only allow buying PUBLISHED packages (find where purchasability is determined and gate on publish state). Do NOT break existing published packages.
3. **Expose `duration_periods` (B6):** add to read + create/update DTOs with validation (positive int or null = unlimited). Don't change the webhook's existing consumption — just surface it.
4. **Pricing config (decision #1):** extend the pricing model/DTO so a coach can configure: one-time only, recurring only, OR one-time + recurring together; recurring cadence ∈ {weekly, monthly, yearly}. The one-time+recurring combo is modeled as an optional SECOND Stripe price (per master plan §3) — i.e. a package can mint both a one-off charge AND a subscription. Extend `assertValidPricing` to validate the new combos. Reuse the lazy Stripe Price cache pattern for any new price. If adding fields, additive migration; keep existing single-price packages working unchanged.

## CRITICAL CORRECTNESS
- **No sync Stripe HTTP inside a DB transaction** (anti-pattern A276-P1-3). Create/lookup Stripe prices outside any tx; persist refs in the tx.
- **Backfill safety:** any new publish-state or pricing column must default such that EXISTING packages keep behaving exactly as today (already-selling packages stay published/purchasable). Verify the migration backfills correctly.
- **IDOR / sub-coach scope** on every new endpoint (gate #5, #2). A coach can only read/publish their own packages; sub-coach scope respected per SubCoachScopeService.
- **Idempotent publish/unpublish** (calling publish twice is a no-op, not an error).
- Pagination on `/subscribers` (gate #23) — no unbounded list.

## SCOPE GUARDRAILS
- Backend only. No mobile (PR-13). No content-attach endpoints (PR-8). No cron/fan-out.
- Extend existing PackagesService/controller/DTOs — do not rewrite. Match conventions.

## VERIFICATION
1. tsc/nest build + eslint pass; prisma validate/generate if a migration is added; confirm migration additive + backfill correct (existing rows → published).
2. Unit/e2e tests: read endpoints IDOR-guarded; publish/unpublish idempotent + gates purchasability; duration_periods round-trips; pricing combos (one-time, recurring-each-cadence, one-time+recurring) validate + reject invalid combos; existing packages unaffected.
3. Existing tests pass.

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr6/package-reads-publish-pricing`, PR against default, report PR URL.
- PR description: endpoints added, publish-state design + backfill proof, duration_periods exposure, pricing-combo model + Stripe second-price approach, IDOR/scope handling, test results.

## DELIVERABLE
Report: (a) PR URL, (b) endpoints added, (c) publish-state field + migration + backfill confirmation, (d) pricing config model + how one-time+recurring maps to Stripe, (e) IDOR/scope approach, (f) test results. Copy to /home/user/workspace/specs/PR6_BUILD_REPORT.md.
