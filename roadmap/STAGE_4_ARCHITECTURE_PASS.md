# Stage 4 Architecture Pass — Gym/Franchise as Configuration Layer

**Status:** Scheduled. Owner ruling: "Well, let's actually schedule that passover."
**Goal:** Determine whether Stage 4 gym vertical can be built as a configuration layer over existing TGP primitives (coach/client/team) instead of a parallel app.
**Hypothesis to test:** Stage 4 could be 30-50% the cost of the original 140-220 operator estimate if architected correctly.

---

## 1. The Thesis

A gym is a coach with:
- **Location-based memberships** (not just program-based clients)
- **Scheduled classes** (not just 1:1 sessions)
- **Front-desk operations** (not just async messaging)

If this thesis holds, the gym vertical can largely be a configuration overlay on existing TGP primitives:
- `coaches` table → `tenants` table with `tenant_type: pt_coach | gym_single | gym_chain | gym_franchise`
- `clients` table → `members` (same row, different role)
- `programs` table → `class_templates` (same row, different surface)
- `team_hierarchy` (N-level from IDIOT_INDEX §2.11) → already supports gym staff hierarchy
- A13 money flow → gym-membership billing model (subscription, day pass, package)

What's actually NEW for gyms:
- Check-in surface (barcode/QR, eventually NFC/door hardware in Stage 4+)
- Class scheduling + booking + waitlist
- Front-desk web app (separate UI from coach mobile app)
- Facility utilization tracking
- Multi-location benchmarking (franchise-level)

---

## 2. The Audit — What Operator Must Investigate

### 2.1 Primitive overlap analysis
For each gym data model requirement, determine:
- **Already covered** by existing primitive — config flag flips it on.
- **Extension of existing primitive** — small additive change.
- **Genuinely new** — needs new tables and surfaces.

Cover these dimensions:
- [ ] Tenant model: can `coaches` be generalized to `tenants` with type discrimination, or are gym requirements too different?
- [ ] Membership model: is a gym membership a degenerate case of a coach-package, or fundamentally different?
- [ ] Class model: can a class be modeled as a scheduled-program-instance with N attendees, or does class need its own primitives?
- [ ] Billing model: does A13's MoneyFlowRule cover gym membership billing (subscription, freezes, family plans, corporate plans), or does gym billing require extensions?
- [ ] Team hierarchy: is the N-level hierarchy from A4 sufficient for gym org chart (owner → manager → trainer → front desk), or does it need different role types?
- [ ] Permissions model: do existing RLS tiers cover gym needs (multi-location data isolation, franchise benchmarking access, etc.)?

### 2.2 The five "must be net new" candidates
Based on initial analysis, these likely cannot be config'd over existing primitives — they're genuinely new:

1. **Check-in surface** — barcode/QR scanner, gym member self-check-in flow, attendance event capture.
2. **Class scheduling engine** — calendar UI, instructor assignment, capacity limits, waitlists, recurring class series.
3. **Front-desk web app** — sells day passes, memberships, paraphernalia (drinks, merch, class packages, protein powder, etc.). Different UX from coach mobile app.
4. **Facility utilization tracking** — `location_events` (per ZION §8.4), capacity heatmaps, equipment usage.
5. **Multi-location benchmarking dashboards** — franchise-level analytics across locations.

Operator audit confirms or refutes this list.

### 2.3 Out-of-scope for Stage 4 v1 (per earlier scoping)
Skip in the mom-and-pop / single-chain version:
- Auto-locking door hardware
- Daxko/Mindbody data imports
- Equipment vendor integrations
- Royalty billing for franchise HQ
- Multi-tenant white-label gym branding

These are Stage 4+ (full franchise finish line) features, not v1.

---

## 3. Audit Output Format

The audit produces a single document:

**`STAGE_4_ARCHITECTURE_AUDIT_FINDINGS.md`**, containing:

1. **Primitive reuse matrix:** for each gym requirement, classification as Reuse / Extend / New, with operator estimate per classification.
2. **Net-new table list:** definitive list of new tables needed beyond existing primitives.
3. **Revised operator estimate:** if thesis holds, expect 75-110 operators for mom-and-pop scope (down from earlier 75-110 estimate, possibly lower). If thesis fails, expect closer to original 140-220.
4. **Risk register:** specific places where forcing gym data into coach primitives creates schema debt or query complexity.
5. **Chapter scoping go/no-go:** recommendation on whether to proceed with chapter-by-chapter scoping (Stage 4 chapters 1-4) or restructure.

---

## 4. Sequencing — When This Audit Runs

**Trigger:** After A13a + A21 (payment fee margin layer) are in production. Reasoning:
- A13 architecture is the deepest existing primitive that gym billing will reuse or extend.
- Audit findings depend on understanding A13's final shape.
- Running the audit before A13 stabilizes risks rework when A13 finishes.

**Estimated audit cost:** 1 senior operator, 3-5 days. Output is a document, not code.

**Audit operator scope:**
- Read all of `audit_v2/CODEBASE_DUSTINESS_AUDIT.md` for current backend modules.
- Walk every gym requirement in this doc against existing primitives.
- Interview the most recent A13 operator for confirmation on payment model extensibility.
- Produce findings doc.
- Owner makes go/no-go call on Stage 4 chapter scoping based on findings.

---

## 5. Chapters Held in Stasis

Per earlier scoping, the Stage 4 chapter outline is:

1. **Chapter 1:** Single gym, general memberships (no scanner, no classes).
2. **Chapter 2:** Single gym + barcode scanner + classes.
3. **Chapter 3:** Multi-gym with scan-in and classes.
4. **Chapter 4:** Full franchise finish line.

PRs are paragraphs inside chapters. Each paragraph gets a scope description.

User-provided example for paragraph scope: "Front-desk web app needs to sell day passes, memberships, AND gym paraphernalia like drinks, merch, class packages, protein powder, etc."

**These chapters do not get scoped until the architecture audit completes.** This prevents scoping work on the wrong architectural assumption.

---

## 6. Strategic Frame

Even if the config-layer thesis only partially holds — say 30% of gym requirements are config flips, 30% are extensions, 40% are net new — the savings are enormous:

- **Original estimate (parallel app):** 140-220 operators full Stage 4, 75-110 mom-and-pop.
- **Best case (full config layer):** 50-80 operators full Stage 4, 30-50 mom-and-pop.
- **Realistic case (partial reuse):** 90-140 operators full Stage 4, 50-75 mom-and-pop.

This audit's job is to find out where on that spectrum reality sits.

**It also produces a side benefit:** documenting how generalized the existing TGP primitives really are. That documentation makes future verticals (e.g., yoga studios, martial arts schools, physical therapy clinics) easier to scope because the primitive-reuse map is already drawn.

---

## 7. Operator Dispatch (when triggered)

**Prerequisites before dispatching this audit:**
- A13a + A21 in production
- A4 N-level team hierarchy live
- ZION data capture PR1-2 landed (so `member_events` schema can be designed atop existing event scaffolding)

**Audit deliverables:**
- `STAGE_4_ARCHITECTURE_AUDIT_FINDINGS.md` (defined in §3 above)
- Updated operator estimates for Stage 4 chapters 1-4
- Go/no-go recommendation on chapter scoping

**Owner review point:** read findings, lock chapter approach, then dispatch chapter scoping operators.
