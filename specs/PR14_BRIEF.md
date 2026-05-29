# PR-14 BRIEF — Guest recurring + landing_page_id propagation (backend)

**Repo:** growth-project-backend. **Type:** FIX. **Pillar:** 2.
**Branch:** `pr14/guest-recurring-lp-attribution` (create off latest default; pull latest first).
**PR title:** `PR-14: Guest storefront recurring support + landing_page_id propagation`

## Why (master plan refs)
- Master plan §1 **decision #1** (billing): coach chooses per package — one-time / recurring / one-time+recurring, cadence weekly/monthly/yearly. The **web/guest storefront** must support recurring; today it refuses recurring and caps to one-time USD, which kills subscription sales for the ICP.
- §3 inventory **Guest-recurring (P1)**: `guest-checkout.service.ts:287-322` — storefront refuses recurring + non-USD.
- §3 inventory **`lp` attribution (P1)**: `landing_page_id` captured on `GuestCheckout` but dropped before `ClientPurchase`; per-page LTV is broken. Fix at `guest-checkout.service.ts:1287-1308`.
- §4 Pillar 2: "Allow recurring + (phase) non-USD on storefront", "Propagate `landing_page_id` → `ClientPurchase`".

## Scope — do EXACTLY these two things, nothing more
This is a FIX PR. Do NOT touch the fan-out engine (PR-9), the cron (PR-10), media (PR-12), or the in-app paths. Stay inside the guest/storefront pipeline.

### Part A — Guest storefront recurring support (decision #1 on web)
1. Locate the guard at `src/storefront/guest-checkout.service.ts:287-322` (and `src/storefront/storefront.service.ts` if it mirrors the cap) that currently **refuses recurring** and/or **caps to one-time USD**. Read the surrounding preflight/single-flight code first — this is "the most mature surface in the repo"; respect its existing idempotency, single-flight gate, content-addressable idempotency key, snapshot column, and preflight cache.
2. Allow a package whose pricing config (per PR-6's richer pricing object: one-time / recurring / one-time+recurring, cadence weekly|monthly|yearly) to be purchased via the guest/web path:
   - When the package has a recurring component, create the Stripe **subscription** on the guest path the same way the in-app path does (reuse the existing pricing → Stripe price resolution introduced in PR-6 — do NOT duplicate price-creation logic; find the shared helper and call it). For one-time+recurring combos, mint BOTH the one-off charge AND the subscription, mirroring whatever the in-app path does.
   - Preserve guest single-flight + idempotency: the recurring path must be idempotent across Stripe webhook replays exactly like the one-time path is today. Do NOT make synchronous Stripe HTTP calls INSIDE a Prisma `$transaction` (50-Failures rule). Follow the existing pattern (Stripe calls outside the tx; DB writes inside).
3. **Non-USD:** the master plan says "(phase) non-USD". Treat non-USD as **out of scope for this PR unless it is trivially already supported by the shared pricing helper.** If enabling recurring requires no currency change, leave the currency handling exactly as the in-app path. Do NOT build new FX/multi-currency logic here. If the existing cap couples "recurring" and "non-USD" in one guard, split them: lift the recurring restriction, keep any currency restriction intact (so we don't accidentally ship unvalidated non-USD). Document this choice in the build report.

### Part B — landing_page_id propagation
4. `GuestCheckout` row already captures `landing_page_id` (verify the column/field name in `prisma/schema.prisma` — it may be `landing_page_id` or `lp`/`landingPageId`). Confirm `ClientPurchase` has a nullable `landing_page_id` column; if PR-3's additive migration did NOT add it, add it now as an **additive, nullable** migration (no DROP/RENAME/type-change; default NULL; existing rows unaffected). Check first — do not duplicate an existing column.
5. In `convertGuestToUser` (around `guest-checkout.service.ts:1287-1320`), when creating the `ClientPurchase` INSIDE the conversion `$transaction`, copy `landing_page_id` from the `GuestCheckout` row onto the new `ClientPurchase`. This must happen in the same tx that creates the purchase (the fan-out hook at :1320 also runs here — do not disturb it; just add the field to the create payload).

## Idempotency / correctness requirements (the merge bar)
- Recurring guest checkout must be idempotent on Stripe webhook replay (no double subscription, no double ClientPurchase). Re-use the existing content-addressable idempotency key / single-flight gate — do not invent a new one.
- No sync Stripe HTTP inside any `$transaction`.
- `landing_page_id` propagation must not break when the GuestCheckout has a NULL landing_page_id (just propagate NULL).
- The fan-out hook at :1320 (PR-4/PR-9) must still fire exactly once for guest purchases, including recurring ones — verify the recurring path reaches the same entitlement+fan-out code, not a divergent branch that skips fan-out.

## Tests (must add real tests, not mocked-away)
- Guest checkout of a **recurring** package → creates subscription + ClientPurchase + reaches fan-out hook; replay of the same Stripe event does NOT double-create.
- Guest checkout of a **one-time+recurring combo** → both charge and subscription created once.
- `landing_page_id` present on GuestCheckout → propagated to ClientPurchase.
- `landing_page_id` NULL → ClientPurchase.landing_page_id is NULL, no crash.
- Existing one-time guest path regression test still passes.

## Deliverables
- Branch `pr14/guest-recurring-lp-attribution`, PR opened against default.
- Write `/home/user/workspace/specs/PR14_BUILD_REPORT.md`: what changed (file:line), how recurring is wired to the shared pricing helper, the non-USD decision you made, the landing_page_id migration status (added vs already-present), idempotency proof, and ACTUAL typecheck/lint/test counts (run them yourself).
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.
