# TGP Master Expansion Plan
### The canonical sequence from "PT system done" to "complete fitness operating system"

> **Single source of truth.** Every Builder, Auditor, Planner, and Fixer reads this file before opening a PR that touches expansion scope. If a proposal isn't here, it isn't being built yet.

---

## Vision

TGP today: an Apple-grade personal training (PT) system. Coach + client. Mobile-first. World-class on the coaching loop.

TGP next: **the complete fitness operating system.** Coach + client + gym member + gym owner + front desk + trainer + manager. Mobile + web parity. Replace Trainerize and Mindbody simultaneously, at a price neither can match, on a UX bar neither can touch.

The expansion is staged so that at **every stage boundary** the product is still shippable, sellable, and demonstrably better than the prior stage. No half-finished tier ever ships.

---

## Quality bar (applies to every stage, every page, every PR)

- **R0 decacorn quality.** Apple/Notion/Linear-tier polish or it doesn't merge.
- **Mobile design doctrine** governs every mobile page.
- **Luxury reference par, not blueprint.** Reference images filed under `./design-targets/mobile/` set the **quality bar** — the restraint, typographic discipline, voice, decision-per-screen focus. Refactor PRs do NOT have to replicate exact layout/copy/ordering. See `./design-targets/mobile/CATALOG.md` for the full rule.
- **Website design doctrine** (`./doctrine-website-design.docx`) governs every web page where applicable, layered with the "general luxury" rules from the mobile doctrine.
- **Persona-fit rule.** Every page must give its persona *exactly* what they want:
  - Front desk → fast, low-click, glanceable, forgiving under pressure.
  - Gym owner → revenue truth + risk board + KPI cadence on the home screen.
  - General gym member → simple booking + check-in + billing self-service. No coaching clutter.
  - Coach → existing decacorn bar preserved.
  - Sub-coach / manager → team ops surface that respects hierarchy.
- **R72 exhaustive audit + R65 50-failure sweep** every PR.
- **R31 fresh role separation** (Builder ≠ Auditor ≠ Fixer ≠ Planner).
- **R73 mobile planner gate** before any mobile screen ships.
- **No exclamation/emoji/hype** in any UX copy unless the design doctrine explicitly permits it for that surface.

---

## The Master Sequence (waterfall — each stage gates the next)

```
STAGE 0 — IN FLIGHT NOW
  └─ Community v3-1 + MWB autosave + Roman expansion PR cleanup
      (PRs #237, #241, #242, #311, #195, #393 — until CLEAN + merged)

STAGE 1 — MOBILE PAGE REFACTOR
  └─ Every existing mobile page rendered "as-is" vs. "luxury target"
      Operator-approved before/after renderings for each screen
      Refactor PRs follow mobile design doctrine

STAGE 2 — MOBILE PAGE RE-ARRANGEMENT
  └─ Information architecture work already planned in GitHub
      Re-ordering tabs, surfacing/hiding screens, navigation polish

STAGE 3 — PRODUCT ROADMAP v1 (PT system → world-class)
  └─ The TGP-Feature-Roadmap-v1.md feature set:
      • Closed-loop adaptive programming (Autopilot)
      • Wearable deep integration
      • Unified coach inbox + AI triage
      • Daily AI coach briefing
      • AI check-in summaries
      • AI video form analysis
      • Native nutrition module
      • Smart check-in forms
      • Re-engagement automations
      • Onboarding flow + e-sign
      • Migration / import tooling (Trainerize/Everfit)
      • Marketplace launch
      • Async video replies
      • Progressive overload visualization
      • Referral tracking
      • Loyalty / rewards
      • Team QA / manager ops
      • Commission tracking
      • White-label (deferred)

🚀 APP STORE LAUNCH GATE
  └─ Ship to Apple App Store for PT use immediately.
      Real PTs start using it. Real revenue. Real reviews.
      This is the "PT system is world-class — go live" moment.
      Gym expansion below builds on top of a live, used product.

STAGE 4 — GYM-LEVEL EXPANSION (chunked, in this exact order)

  4A. GENERAL GYM MEMBERSHIP (no-coach client + owner data surface)
      • Schema: introduce general_member account type
      • Client app: no-coach view (membership, billing, classes, check-in)
      • Gym owner: data surfaces (revenue, churn risk, attendance)
      • Package creation (memberships, drop-ins, session packs)
      • Migration: pull existing clients + card info + billing history
        from Trainerize/Mindbody/spreadsheet into TGP

  4B. GYM OWNER USER TYPE
      • Schema: introduce gym_owner account type as first-class
      • Pages: owner home, member roster, packages, billing, reports
      • Permissions / role architecture (owner ≠ manager ≠ trainer ≠ front desk)
      • Multi-location ownership data model (for later franchise tier)

  4C. PAGE-BY-PAGE LUXURY AUDIT
      • Every page from 4A + 4B rendered "as-is" vs. "luxury target"
      • Operator approves each target before any refactor PR opens
      • Pages refactored to bar before web buildout begins

  4D. FULL WEB APP BUILDOUT (every user type, every page)
      • Web parity for: coach, client, gym member, gym owner,
        manager, front desk, trainer
      • Every web page MUST follow the website design doctrine
        (./doctrine-website-design.docx) where applicable, layered with
        the mobile design doctrine's general luxury rules
      • Mobile remains the primary surface; web is full parity, not
        a stripped admin portal

  4E. KIOSK + BARCODE + CLASS MANAGEMENT
      • Front desk kiosk web app (sub-10-second check-in flow)
      • Barcode scanner integration (retail SKUs, day passes, scanned IDs)
      • Class management at gym level (calendar, capacity, waitlist,
        recurring templates, drag-and-drop edits, trainer subs)
      • Access control (QR/BLE/NFC) — hardware-dependent, last
```

**Gating rule:** No work begins on stage N+1 until stage N is fully shipped, journaled, and operator-confirmed complete.

---

## STAGE 0 — In-flight PR cleanup (now)

Tracked in `tgp-agent-context/COMMUNITY_BUILD_JOURNAL.md` and `tgp-agent-context/handoffs/dispatch.json`.

Open scope: #237 (mobile autosave), #241 (Roman P3 voice expansion), #242 (Roman ED.3/ED.4 — Option C rewrite), #311 ✅ merged, #195 (R34 governance — deferred), #393 (R73 docs).

Exit criteria: every open PR either merged or explicitly deferred with operator sign-off.

---

## STAGE 1 — Mobile page refactor (luxury target)

**Goal:** Every existing mobile page reaches the same bar as the Roman/Community/Active Workout screens.

**Workflow per page:**
1. Render current page "as-is" (screenshot + state matrix).
2. Operator attaches "luxury target" rendering for that page.
3. Planner writes refactor brief grounded in mobile design doctrine.
4. Builder (Opus) implements.
5. Auditor (GPT-5.5) verifies against doctrine + 50-failures.
6. Fixer loop until CLEAN.
7. Merge + journal.

**Required from operator before this stage starts:**
- Luxury-target renderings (or design tokens / Figma references) for each page being refactored. Attach as images in chat; I'll file under `tgp-agent-context/design-targets/mobile/`.

---

## STAGE 2 — Mobile page re-arrangement

**Goal:** Information architecture changes already planned in GitHub.

**Workflow:**
- Read the existing GitHub plan(s).
- Sequence each IA change as its own PR (no megamerges).
- Audit each IA change against mobile design doctrine navigation rules.

---

## STAGE 3 — Product roadmap v1 (PT system → world-class)

Reference: `./TGP-Feature-Roadmap-v1.md`

**Priority order (from feature roadmap §6):**

| # | Feature | Why first |
|---|---|---|
| 1 | Closed-loop adaptive programming | Only feature no competitor executes well; defines the moat |
| 2 | Wearable deep integration | Co-dependent with #1 for closed-loop story |
| 3 | Unified coach inbox + AI triage | Coach operational cockpit |
| 4 | Daily AI coach briefing | Highest leverage per minute saved |
| 5 | AI check-in summaries | Shares inbox AI layer |
| 6 | Migration / import tooling | Required before marketing push |
| 7 | Marketplace launch | Don't launch thin — wait for rich profiles |
| 8 | AI video form analysis | Highest "wow factor" for acquisition |
| 9 | Native nutrition module | Major retention driver |
| 10 | Onboarding flow + e-sign | Closes the lead→client gap |
| 11 | Smart check-in forms | Low effort, high coach satisfaction |
| 12 | Re-engagement automations | Builds on churn prediction |
| 13 | Async video replies | Builds on inbox |
| 14 | Progressive overload visualization | Low effort, high client satisfaction |
| 15 | Referral tracking | Word-of-mouth → managed growth |
| 16 | Loyalty / rewards | 6-week churn cliff intervention |
| 17 | Team QA / manager ops | Enterprise readiness |
| 18 | Commission tracking | Removes admin burden for teams |
| 19 | White-label multi-tenant | Defer until 50+ coaches live |

Each item ships as its own PR train with planner → builder → auditor → fixer loop.

---

## 🚀 APP STORE LAUNCH GATE

**Exit STAGE 3 trigger:** All items 1–10 of the roadmap above shipped, audited CLEAN, and tested under real coach load.

**Launch checklist:**
- App Store metadata + screenshots use luxury-target renderings
- Privacy policy + ToS reflect coach/client + (forthcoming) gym scopes
- Wearable permissions described per Apple HealthKit guidelines
- Stripe Connect onboarding flow tested end-to-end with real coaches
- Marketplace closed-beta with hand-selected coaches before public discovery
- TestFlight cohort runs ≥ 4 weeks with zero P0 bugs
- Migration tooling tested with at least 3 real Trainerize exports

**After launch:** stage 4 begins on top of a live product with paying users.

---

## STAGE 4 — Gym-level expansion (the new section — chunked)

### 4A. General gym membership (no-coach experience + owner data)

**Personas served:** Gym member (no coach) + gym owner (data view).

**Why first:** It's the smallest viable schema change that unlocks a new revenue tier. A gym can sign up, import members, take payments, and let members check in — without any of the staff/kiosk machinery yet.

#### Scope

**Client app (no-coach view):**
- New simplified home: membership status, today's class options, billing summary, check-in QR
- No program tab unless they upgrade to coached
- Self-service: update card, view invoices, request freeze, cancel
- Class booking (read-only at this stage — full booking lands in 4E)

**Gym owner data surface (mobile + minimal web):**
- Revenue snapshot: charged today, upcoming renewals, failed payments
- Member roster with risk indicators (Red / Amber / Green per `research-gym-owner-frontdesk-needs.md` §2)
- Attendance read-only feed
- "What did I miss?" digest (daily AM)

**Package creation:**
- Owner builds memberships from scratch (Stripe Products + Prices under the hood)
- Name, price, cadence, included class types, access rules, capacity
- Publish / draft / archive states with grandfathering

**Migration tooling (gym tier):**
- Trainerize / Mindbody / Wodify CSV+JSON importers
- Stripe customer/source migration via Stripe's PCI-compliant import path (no raw PAN handling — TGP requests Stripe-to-Stripe transfer; documented per Stripe's "Importing PaymentMethods" workflow)
- Member invite emails sent post-import, branded to gym
- Billing migration with prompted Stripe plan equivalence

**Acceptance gates for 4A:**
- A real gym can sign up, build a $X/mo membership, import members + card-on-file, and take their first auto-charge within 60 minutes of account creation.
- A no-coach member can install the app, view their plan, see their next charge, and update their card without contacting support.

---

### 4B. Gym owner as a first-class user type

**Why this comes after 4A:** 4A proves the schema and revenue loop with the *minimum* owner surface. 4B codifies the owner as a top-level account type and builds out the full role architecture.

#### Scope

**Schema:**
- New `gym_owner` account type at the data model level (parallel to `coach`, `client`)
- Multi-location ownership table (one owner → N locations) prepared for franchise tier
- Role table: Owner, Manager, Trainer, Front Desk (per `TGP-Feature-Roadmap-v1.md` §4.7)

**Owner pages (mobile + web):**
- Owner home: morning AI briefing for gyms (per `research-gym-saas-deep.md` Feature #9)
- Members: full roster with filters, segments, tags
- Packages: membership/drop-in/session-pack management
- Billing: revenue dashboard, failed-payment recovery, refunds, comps, coupons
- Reports: cohort retention matrix (Feature #5), class profitability (Feature #6), trainer P&L (Feature #4)
- Team: staff CRUD, role assignment, schedules
- Settings: gym info, branding, Stripe Connect, integrations

**Permissions:**
- Owner = full access including billing config and payout
- Manager = all member data + scheduling + staff mgmt, NO billing config
- Trainer = own clients + own classes only
- Front desk = check-in + walk-in signup + POS (locked-down kiosk view, built in 4E)

**Acceptance gates for 4B:**
- A gym owner can fully operate their gym from TGP — no spreadsheets, no Mindbody, no Trainerize side-by-side — except for the front-desk kiosk and class booking, which arrive in 4E.

---

### 4C. Page-by-page luxury audit (every new page from 4A + 4B)

**Workflow per page:**
1. Builder ships functional page (4A/4B).
2. Operator attaches "as-is" screenshot + "luxury target" rendering.
3. Planner writes luxury refactor brief grounded in:
   - Mobile design doctrine (general luxury)
   - Website design doctrine (`./doctrine-website-design.docx`) where the page has a web variant
   - Persona-fit rules at the top of this document
4. Builder refactors.
5. Auditor verifies against doctrine + 50-failures + persona-fit.
6. Fixer loop until CLEAN.

**Required from operator before this stage starts:**
- Luxury-target renderings for each new gym-tier page. Attach in chat; I'll file under `tgp-agent-context/design-targets/gym/`.

**Exit criteria:** Every page from 4A + 4B ships at the same bar as the existing Roman/MWB screens. No page that "works" but doesn't reach the bar is allowed to merge — known design debt must be tracked and closed before 4D begins.

---

### 4D. Full web app buildout (every user type, every page)

**Goal:** Web parity across **every** user role. Mobile remains primary; web is full-feature, not a stripped admin portal.

**User types getting web parity:**
- Coach
- Client (coached)
- Gym member (general / no-coach)
- Gym owner
- Manager
- Trainer (sub-coach inside a gym)
- Front desk (will be locked-down kiosk view in 4E)

**Design rules:**
- Website design doctrine governs every page where it has rules for that surface type (landing, marketing, signup, public profile, marketplace, etc.)
- Mobile design doctrine's general luxury rules layer in for every internal app page (dashboards, rosters, billing, etc.)
- Page-by-page audit applies — every web page goes through the same as-is/luxury workflow as 4C
- Persona-fit rule is non-negotiable: front desk web view ≠ owner web view ≠ trainer web view

**Acceptance gates for 4D:**
- Every TGP feature accessible on mobile is accessible on web with equal or better ergonomics on desktop input.
- Public-facing pages (marketplace, coach profile, gym profile, signup) follow the website design doctrine to the letter.

---

### 4E. Kiosk + barcode + class management

**Why last in stage 4:** This is the most operationally complex piece — front-desk-grade UX, hardware integration, class booking flows that have to survive real walk-in pressure. It only makes sense to build once the underlying gym data and roles exist (4A+4B) and the web app surface is built and audited (4C+4D).

#### Scope

**Front desk kiosk web app:**
- Sub-10-second member check-in (per `research-gym-owner-frontdesk-needs.md` Part 2 §1)
- One-screen member view (Part 2 §2)
- Walk-in / day pass handling (Part 2 §3)
- POS for retail + session packs (Part 2 §4, includes drinks, shirts, supplements, day passes)
- Schedule visibility (Part 2 §5)
- Alert/exception handling without stress (Part 2 §6)
- Speed-under-pressure design rules (Part 2 §7)
- Sub-30-minute new-hire training (Part 2 §8)

**Barcode scanner integration:**
- Retail SKU catalog (drinks, supplements, apparel, accessories, day passes, PT session packs)
- Inventory tracking with low-stock alerts
- Barcode scan at POS for retail
- Optional: ID/QR scan at door (links to access control)

**Class management at gym level:**
- Full booking flow (members book from app — read-only stub from 4A is replaced)
- Capacity + waitlist + auto-promote on cancel
- Recurring class templates
- Drag-and-drop schedule edits
- Coach substitution without cancel/recreate
- Late-cancel windows + fees
- Facility/equipment booking (squat racks, courts, lanes)

**Access control (hardware):**
- QR check-in from member app
- BLE/NFC ping for door hardware (Kisi, Salto, BLE beacons)
- Tier-gated access enforcement
- Full check-in log → attendance heatmap → AI class demand forecasting

**Acceptance gates for 4E:**
- A new front-desk hire is productive in under 30 minutes using only the in-app training (per the research bar in `gym-owner-frontdesk-needs.md` Part 2 §8).
- A walk-in can be signed up, charged via Stripe Terminal, and checked in within 90 seconds.
- A retail sale (drink + shirt) is rung up in under 20 seconds via barcode scan.

---

## Cross-cutting things this plan codifies

1. **Three new user types** introduced in stage 4: `general_member` (4A), `gym_owner` (4B), and the staff roles `manager` / `front_desk` (4B). Trainer/coach exists today.
2. **Selling gym products** (drinks, memberships, shirts, day passes, supplements) is built in 4E POS + barcode work. 4A handles memberships only.
3. **Web app for ALL users** is 4D — not bolted on, but treated as a first-class buildout with the same luxury bar.
4. **App Store launch** is the firm gate between stage 3 and stage 4 — no gym work begins on top of an unlaunched PT product.
5. **Page-by-page luxury audit** is a stage of its own (4C) — features aren't considered done just because they work.

---

## Source documents (all filed under `tgp-agent-context/roadmap/`)

| File | Role |
|---|---|
| `TGP-MASTER-EXPANSION-PLAN.md` | **This file — single source of truth for sequencing** |
| `TGP-Feature-Roadmap-v1.md` | Detailed feature specs for stage 3 + the original gym mode draft |
| `research-gym-owner-frontdesk-needs.md` | 3,300+ verified reviews — what owners & front desk want (binding for 4A/4B/4E) |
| `research-gym-saas-deep.md` | 15-competitor dominate-vs-copy matrix + top-10 features to dominate (binding for 4B/4D/4E) |
| `doctrine-website-design.docx` | Website design doctrine — binding for 4D and all web pages |

---

## Open items pending operator input

- **Luxury-target renderings** for stage 1 (mobile page refactor) — needed before refactor PRs can be planned
- **Luxury-target renderings** for stage 4C (gym pages) — needed before 4D begins
- **Migration legal review** for stage 4A — Stripe customer/PaymentMethod import requires Stripe-to-Stripe transfer (no raw PAN handling). Plan documents this requirement; legal counsel should confirm before live import goes to a real gym.
- **App Store gate criteria** — confirm the launch checklist matches operator's pre-launch standards.
