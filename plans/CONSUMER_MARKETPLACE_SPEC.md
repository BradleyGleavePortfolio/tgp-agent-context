# TGP Consumer Marketplace — Product Spec (operator-locked)

**Owner:** Bradley Gleave · **Captured by:** Agent 46 · **Date:** 2026-06-16
**Status:** Product decisions LOCKED by operator. Architecture/PR-chain = next planner stage.
**Design doctrine:** ENG §11 quiet-luxury + uploaded Mobile App Design Intelligence (emotional design, Apple cognitive de-load, sustainable gamification — NO badge theater, outcomes-over-opens, Coach Maya voice, ≤300ms motion, semantic theme tokens only, calm/professional financial surface).

> **Scope boundary:** This is the **CONSUMER-FACING** marketplace — clients discover, evaluate, and engage coaches. It is DISTINCT from the **Talent Marketplace** (gyms / growing head-coaches hiring new coaches — original PR #183 intent), which is specced separately. The two share infrastructure (coach profiles, Stripe Connect, RLS spine, the badge engine) but are different products with different audiences.

---

## 1. Core concept
A client-facing storefront where clients find a coach by location, modality, and goal; evaluate them via profile + verified reviews + trust badges; and engage via buy-now / message / book-appointment. Also renders as SEO-indexable web pages for organic acquisition ("Best Personal Trainers in Seattle" → TGP Seattle marketplace, pre-filtered).

## 2. Confirmed product decisions

### 2.1 Coach profile (the unit of the marketplace)
Every coach profile carries:
- **Profile picture — MANDATORY** (gate to being listed; no photo = not listed).
- Bio, specialties, location (geocoded/searchable), **practice modality**: `in_person` / `hybrid` / `online`.
- Packages (with pricing shown upfront — no "DM for price").
- Trust stack (see 2.5), badges (see 2.3), reviews (see 2.4), tenure on TGP, unique clients served.
- Coach-controlled state (see 2.6).

### 2.2 Engagement / booking flow (decision C)
Client opens profile → sees available packages → THREE paths:
1. **Buy now** — purchase a package in-app (money routes per 2.7).
2. **Message in-app** — start a conversation with the coach.
3. **Book an appointment in-app** — ONLY if the coach has enabled calendar booking (incl. pre-purchase booking if the coach allows it).

### 2.3 "TGP Certified" badge tiers (decisions A + B) — AUTOMATIC (operator changed 2026-06-16)
Three named, **revocable** stamps. **Certified & Elite are AUTO-AWARDED** the instant a coach meets criteria (no admin step). **Sponsored stays admin/commercial.**
| Badge | Criteria | Award mechanism |
|---|---|---|
| **Certified** | 300+ unique clients helped AND ≥4.0★ rating | **AUTO-flips on** when criteria met |
| **Elite** | 1,500+ unique clients helped AND ≥4.3★ rating AND $150k+ processed on TGP | **AUTO-flips on** when criteria met |
| **Sponsored** | Pure admin discretion — **paid promotion / search-bump tier** (commercial, NOT merit) | Admin grants; powers paid rail (2.8) |
Badges render as quiet approval seals (luxury doctrine: competence signal, not vanity/badge-theater).

**Auto-award celebration moment (NEW):** when a coach crosses a badge threshold, the system AUTOMATICALLY: (1) flips the badge on (real-time on profile, both mobile + web), (2) fires a **rewarding notification**, and (3) shows an in-app **and** on-web **popup with Roman**: e.g. *"Great job — you've been deemed a [BADGE] coach now. Everyone will notice in the marketplace!"* This is an Apple-Watch-rings-style earned celebration (design-doc §3.6/competence feedback, NOT badge theater — it lands because it's genuinely earned). Revocation (drop below floor) does NOT celebrate — it quietly removes the badge.
**Engineering implications:** badge eligibility must be evaluated on the events that move the criteria (new unique client, new review affecting rating, payment processed crossing the $ threshold) — an event-driven evaluator + idempotent award (never double-celebrate). Criteria thresholds are config so they can be tuned without redeploy.

### 2.4 Reviews (decision D) — relationship-gated
Only **verified clients** who actually trained with / purchased from the coach can review. Each review shows a "✓ Verified client" mark. Profile aggregates: rating, review count, tenure on TGP, unique clients served — plus the cert tier and full client reviews.

### 2.5 Trust & safety (decision G) — ALL of it, within luxury doctrine
Single **revocable-credential/badge engine** powers cert stamps (2.3), trust badges, and verified-client marks uniformly.
- **Credentials-of-record** — coach uploads NASM/CPT/etc.; "Credentials verified" badge only after admin/partner confirms the document.
- **Insurance / liability attestation** — coach attests + uploads proof of liability insurance → "Insured" badge. (Critical for in-person physical-training liability.)
- **Background-check badge** — via integration (Checkr industry standard); "Background checked ✓" + date; re-runs annually.
- **Identity verification** — Stripe Identity (already on Stripe Connect) → lightweight "Identity verified."
- **Report / flag path** — every profile + message thread has Report → admin moderation queue → suspend/unlist pending review.
- **Response-rate / response-time signal** — "Typically responds within ~Nh."
- **Profile transparency** — real photo (mandatory), optional intro video, upfront package pricing.
- **On-platform payment = trust feature** — secure in-app payment only; protects clients, no off-platform risk.
**Enforcement:**
- Listing gate: profile photo + baseline identity verification required to be listed at all.
- Badge gate: each trust badge requires the corresponding admin-verified document.
- **Tiered bar by modality:** in-person/hybrid coaches face a HIGHER bar (insurance + background check) than online-only — physical-risk surface differs.
- **Revocation:** badges auto-pull on sustained rating-floor breach, substantiated report, or expired insurance/check.

### 2.6 Coach self-controls (decision E)
Coaches self-manage:
- Availability/capacity toggle: **"accepting clients" vs "full."**
- Pricing display.
- **Listed vs unlisted.**
- Calendar booking toggle (+ pre-purchase booking option).
- **Profile picture upload — required.**

### 2.7 Monetization (decision H)
- **EVERY purchase auto-routes 2% of purchase price to operator's (Bradley's) Stripe.**
- Stripe takes its own fees on top.
- Sub-coach sales: a **relational % to the head coach**, applied ONLY when the head coach toggles it on.
- (Flat 2% platform fee — no further deliberation.)

### 2.8 Search & ranking (decision F) — FOUR rails
Free-text search ("build muscle at home") OR stacked filters (online + hypertrophy + woman-led + …). Results presented as FOUR separated groups (Apple App Store / bookstore model — paid never masquerades as merit):
1. **Top results (earned/merit)** — blend of rating + unique-clients-served + recent activity + filter relevance. Certified/Elite rise here naturally by merit.
2. **New / upcoming coaches (rotational fairness)** — rotated slot surfacing newer/smaller coaches who clear a quality floor (e.g. ≥4.0★, complete profile, responsive). Prevents rich-get-richer supply starvation.
3. **Paid coaches (Sponsored, clearly labeled)** — Sponsored-tier bumped slot, visually marked "Sponsored," separated from earned ranking.
4. **Coaches at your gym (auto-suggested, when applicable)** — for clients with a gym membership, a pinned group of coaches under their gym's control, shown ABOVE the other rails. Couples to the A2 `app.current_gym_ids()` RLS spine.
Faceted filters: specialization, modality, goal, and coach attributes (e.g. woman-led).

### 2.9 Web parity + SEO surface (idea #5 + operator addition 2026-06-16)
**EVERY mobile screen gets a corresponding web page, at full parity** — not just SEO landing pages. Coach profile, marketplace browse/scroll, search/filters, package purchase, booking, messaging entry, review submission, the badge-celebration popup, etc. Web is a first-class surface (Airbnb model): a user can discover, evaluate, and transact entirely on web OR entirely in-app, no mobile-only dead-ends. Consumes the same marketplace API as mobile (SSR / Next.js web lane).
SEO is a subset: city/location landing pages ("Best Personal Trainers in Seattle" → pre-filtered Seattle marketplace), schema.org structured data (Person / LocalBusiness). **Each mobile PR in the build chain pairs with a web PR for the same surface.**

## 3. Open architecture questions (for the next planner stage, NOT product decisions)
- One unified marketplace product with the talent pipeline as a secondary surface? → **RESOLVED: NO. Two separate marketplaces sharing infrastructure.**
- Whether the consumer marketplace ships as its own PR chain (TM-C*) on top of the shared coach-profile / Connect / RLS / badge-engine foundation.
- Sequencing vs. the talent-marketplace rebuild and the Wave-1.5 RLS spine.

## 4. Shared foundation both marketplaces depend on
- **Coach profile** model (photo, bio, location, modality, packages).
- **Stripe Connect** account (REUSE existing `/coach/connect/*` — do NOT build a second; per planner P0 finding).
- **RLS spine** (A1–A4: `app.current_user_id()`, `app.current_gym_ids()`, `withRlsContext`).
- **Revocable badge/credential engine** (cert tiers + trust badges + verified-client).
- **Reviews + ratings aggregation.**
- **Faceted search + free-text.**
