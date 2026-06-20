# A10 · Consumer Marketplace

**Status:** NOT STARTED on consumer side (foundation reusable from Talent Marketplace)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A10
**Authoritative spec:** [`plans/CONSUMER_MARKETPLACE_SPEC.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/CONSUMER_MARKETPLACE_SPEC.md) (operator-locked 2026-06-16)
**Tier/lane:** Tier 4 / T4.A10
**Rank rationale:** Launch-gate item per Master Plan.

---

## State of build

**ZERO on consumer side.** Foundation reusable from Talent Marketplace:
- Coach profile model
- Stripe Connect spine
- RLS spine
- Badge engine
- Web SSR shell pattern (TM-W lanes — to be reused)

## What to build (per spec §1–§8)

- **Coach profile** (mandatory photo, modality, packages, trust stack, badges, reviews)
- **Three-path engagement** (buy-now / message / book-appointment)
- **Auto-award badge engine** (Certified 300+ clients ≥4.0★; Elite 1500+ + ≥4.3★ + $150k+; Sponsored admin-grant)
- **Verified-client reviews**
- **Trust stack** (Stripe Identity + Checkr + insurance + admin moderation + response-rate signal) — leverages T2.C credential engine
- **4-rail ranked search** (merit / new+upcoming / sponsored / your-gym)
- **Modality filters** (in-person/hybrid/online)
- **Web parity** (every mobile screen = web page)
- **Gym-affinity rail** via `app.current_gym_ids()` RLS
- **Flat 2% platform fee per purchase + sub-coach head-coach split toggle**
- **Roman celebration popup** on badge auto-award

## Includes (absorbed)

Old POST_H Tier 4 lane T4.A (Talent Marketplace web SSR — TM-W2/W5/W8/W9/W12, 5 PRs) is **absorbed into this lane's web-parity scope**. Build the shared Next.js shell here.

## Acceptance criteria

- [ ] Coach profile renders identically on mobile and web
- [ ] Three-path engagement screens ship (buy-now / message / book-appointment)
- [ ] Auto-award engine fires on threshold cross (Certified 300+ / Elite 1500+ / Sponsored)
- [ ] Roman celebration popup ships on badge award
- [ ] 4-rail search returns results in <500ms
- [ ] Trust stack surfaces all 5 signals
- [ ] Flat 2% platform fee enforced on every checkout; SC split toggle works
- [ ] Gym-affinity rail respects `app.current_gym_ids()` RLS
- [ ] Web SSR shell shared with future web work
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** **elevated** — financial (2% fee, SC split) + cross-tenant search (gym-affinity)
- **Idempotency:** badge auto-award scheduler must be idempotent (re-award on retry = no-op)
- **Audit events:** every badge award, every checkout, every review = `AuditEvent`
- **Voice/UI:** Roman voice on celebration popup; Maya voice everywhere else
- **AI cost gating:** if AI ranks search rails, flows through Coach AI Budget
- **Anti-badge-theater (§9 of DOCTRINE_INVARIANTS):** badges are outcome-driven (clients × rating × revenue), not vanity. Verify thresholds keep this true.

## Dependencies

- **Blocks:** nothing further
- **Blocked by:** Tier 1–3 gates; T2.C credential engine (trust stack); T3.B per-coach metrics (badge thresholds); T1.E TM backend
- **Spec dependency:** read `CONSUMER_MARKETPLACE_SPEC.md` in full before opening any PR

## Operator decisions (locked)

Per `CONSUMER_MARKETPLACE_SPEC.md` (operator-locked 2026-06-16). No further reopening without explicit operator request.

**Largest single A-item wave** — expect ~15–20 PRs.

## Previous-operator working notes

*First operator on this item appends here.*
