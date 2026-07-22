# A23 · Mobile Screen Overhaul (Luxury Doctrine visual pass)

**Status:** NEW · PLANNING-ONLY · AUDIT-FIRST (no implementation authorized; no screen designs invented)
**Owner:** *(set by operator on agent dispatch)*
**Backlog source:** [`NEW_A_ITEMS_BACKLOG.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/NEW_A_ITEMS_BACKLOG.md) A23
**Tier/lane:** Tier 5 (Mobile design & UX polish) — executed via Stillwater lanes T5.A–T5.D (`POST_H_LADDER.md` §6)
**Filed:** 2026-07-22

---

## Number-collision note

The owner directed adding this as **"A14 — Mobile screen overhaul per LUXURY DOCTRINE (visual improvements per pages)"**. A14 is already the owner-approved **"AI Program Generation"** item (`NEW_A_ITEMS_BACKLOG.md` A14, `IDIOT_INDEX_RULINGS.md` §2.2, cross-referenced across the tree). To preserve existing owner-approved scope and avoid renumbering a heavily cross-referenced item, this item is filed at the next free contiguous number, **A23**. See `OPERATOR_DECISIONS_LOG.md` 2026-07-22 · A-NUMBERING.

## Owner directive (verbatim)

> "A14 - Mobile screen overhaul per LUXURY DOCTRINE (visual improvements per pages)"

## State of build

**The Luxury Doctrine already exists — this item does not author a new one.** It is a page-by-page visual audit of the mobile app against that doctrine, plus the visual-improvement PRs that close the gap.

**What exists to audit against:**
- `design-targets/mobile/CATALOG.md` — the Mobile Luxury Target Catalog: universal design language (parchment ground, single deep-sage accent `#1F3A1F`, serif display type, hairline dividers, generous negative space, one primary CTA per screen, Maya/Roman voice) + a patterns table + 10 per-screen luxury references. Operator directive on the catalog: *"THESE IMAGES ARE THE BAR, NOT THE BLUEPRINT … at the same par."*
- Stillwater Tier 5 primitives + lints (`POST_H_LADDER.md` §6.1–§6.4): `CompletionMoment`, `useHaptic`, `useSpring`, `QuietSkeleton`, `CalmError`, token-discipline lint, banned-vocabulary lint, Stillwater meta-export lint.

## What this item is

1. A **page-by-page visual audit** of every shipped mobile screen, each scored against the catalog's universal design language and patterns table, producing a prioritised gap list (distance-from-bar, not "is anything there").
2. **Visual-improvement PRs** that raise each screen to the doctrine bar, built on the Stillwater primitives — matching quality/restraint, not necessarily replicating exact layout (per `CATALOG.md` "bar, not blueprint").

## Relationship to Stillwater (no duplication)

A23 is the roadmap-item **umbrella** making "every mobile screen reaches the Luxury Doctrine bar" a discoverable first-class A-item. The Stillwater lanes (T5.A primitives/lints, T5.B eight highest-leverage redesigns, T5.C TM/web mobile screens, T5.D quarter sweep) are the **execution lanes** that satisfy it. A23 does not fork or replace those lanes; the page-by-page audit drives their prioritisation.

## Acceptance criteria

- [ ] **Page-by-page visual audit** enumerates every shipped mobile screen and scores each against `design-targets/mobile/CATALOG.md` (universal design language + patterns table). Output = a prioritised gap list.
- [ ] Each audited screen cites the matching catalog folder (or records "no direct reference — judged against universal language") and states match-vs-intentional-divergence explicitly.
- [ ] Improvement PRs raise each targeted screen to the doctrine bar (the "same-studio" test from `CATALOG.md`), built on Stillwater T5.A primitives — never a bespoke re-implementation of a primitive.
- [ ] Voice/copy on every overhauled screen passes the Stillwater banned-vocabulary lint and R107 (no exclamation points, no unrequested emoji, Maya/Roman voice per surface).
- [ ] Motion ≤300ms; tap targets ≥44×44pt; text contrast WCAG AA (DOCTRINE_INVARIANTS §8) on every overhauled screen.
- [ ] Token discipline: no hardcoded hex outside `tokens.ts`; every overhauled screen exports the `stillwater` meta const (Stillwater lints green).
- [ ] Doctrine-pin tests (`quietLuxuryDoctrine.test.ts` and siblings) stay green across the wave.
- [ ] Each PR dual-CLEAN (Lens A + Lens B) per R14/R72.

## Doctrine flags

- **Tier:** **Tier 5 — Mobile design & UX polish.** Lowest band of the locked priority pyramid (`POST_H_LADDER.md`: Infrastructure → Security → Data → Unique features → **Mobile design & UX polish**). Sits **behind the Tier 1–4 gates**; must not jump the pyramid.
- **Voice/UI (R107, DOCTRINE_INVARIANTS §10):** Maya voice on operator surfaces; Roman voice in celebration moments only; no hype vocabulary.
- **Motion/a11y (DOCTRINE_INVARIANTS §8):** ≤300ms, 44×44pt, WCAG AA.
- **No half-ass (R109):** no stub screens, no "coming soon" copy in shipped surfaces.

## Dependencies

- **Blocks:** nothing.
- **Blocked by:** Tier 1–4 gates (pyramid); Stillwater T5.A primitives/lints must exist before screen-level overhaul PRs land.
- **Reference bar:** `design-targets/mobile/CATALOG.md`; per-screen luxury references under `design-targets/mobile/<screen>/`.

## Approval gates

- **Planning-only.** This spec authorizes the audit-first framing, not implementation.
- **Implementation dispatch requires explicit operator approval** per `POST_H_LADDER.md` §7.6 ("adding a lane requires operator approval"; pyramid is authority on tier placement). Do not dispatch overhaul PRs until the operator approves the audit's prioritised gap list.

## Open operator questions

- Screen priority: drive purely off the audit's gap score, or does the operator pre-rank a "first five" (e.g. Coach Home, Plan, Progress Details) ahead of the sweep?
- Does A23 own only the screens already in `CATALOG.md`, or the entire shipped mobile surface (catalog screens = the bar, remaining screens judged against the universal language)?
- Sequence vs Stillwater T5.B's existing eight redesigns — fold T5.B into A23's gap list, or run T5.B first and let A23 sweep the remainder?

## Previous-operator working notes

*First operator on this item appends here.*
