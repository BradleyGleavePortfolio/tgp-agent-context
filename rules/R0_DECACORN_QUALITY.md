# R0 — DECACORN QUALITY (Apple / Notion / Google Test)

**Status:** ACTIVE. Sacred rule. Equal weight to R64 (never lose anything).
**Codified:** 2026-05-30 by operator (Bradley / Dynasia) during PR-18 finishing session.
**Precedence:** R0 governs *decision quality*. R64 governs *durability of decisions*. Both supersede everything else.

---

## The rule, verbatim from the operator

> **"R0 — UPHOLD DECACORN QUALITY AT ALL TIMES. WHEN MAKING DECISIONS, ALWAYS ASK 'WHAT WOULD APPLE, NOTION, OR GOOGLE CHOOSE TO DO?' AND GO WITH THAT COURSE OF ACTION. NEVER, EVER BREAK R0 OR R64."**

Quote this verbatim when citing R0. Do not paraphrase.

---

## What R0 actually means

R0 is not "make it look pretty." R0 is a **decision-quality filter** applied at every choice point — architectural, UX, copy, animation, error handling, defaults, naming, ordering, throttle values, audit verdicts, EVERYTHING.

Before locking any decision, the operator/agent must ask, **literally**:

1. **What would Apple do here?** — for visceral polish, cognitive de-load, smart defaults, invisible UX, animation physics, haptic timing, error recovery, accessibility, peak-end emotional arc.
2. **What would Notion do here?** — for information architecture, progressive disclosure, keyboard shortcuts, document/object hierarchy, content modeling, empty states, command surfaces, power-user affordances behind clean novice surfaces.
3. **What would Google do here?** — for data-density at scale, search/predict/autocomplete, performance budgets, observability, A/B-tested copy, accessibility ramps, internationalization, error-rate engineering, ML-driven personalization.

If your in-flight decision **would not survive a design crit at any of those three companies**, it does not ship. Iterate until it would.

---

## The three-company reference frame, operationalized

### What Apple chooses
- **Simplicity as invisibility of complexity** (not absence of features). Picasso's bull — 11 iterations to the essential line. *Real sophistication is knowing what to remove.* (Ken Segall, "The Simple Stick.")
- **One decision per screen** at peak cognitive load (onboarding, high-stakes confirmations). iPhone setup: one permission per screen, sequenced at the moment of relevance.
- **Miller's Law hard caps:** ≤5 tabs in primary nav. ≤5 actionable elements visible without scrolling.
- **Hick's Law smart defaults:** pre-set the right answer for the 80%; advanced users override.
- **Peak-End Rule:** invest disproportionately in the most intense moment + the closure moment of every flow.
- **Spring physics, haptics, easing curves** are calibrated, not improvised. Every micro-interaction is competence engineering.
- **Anticipatory UX:** Siri Suggestions, Focus Modes, predictive keyboard. Product surfaces likely next action before the user navigates.
- **Errors prevented, not reported.** Make wrong action harder than right action.
- **HIG consistency dividend:** learn once, apply everywhere.

### What Notion chooses
- **Progressive disclosure done right:** simple novice surface, full depth available via `/` command, keyboard shortcut, or drill-in. Never strip the depth; defer it.
- **One canonical primitive (the block) that composes infinitely.** Object model over screen model.
- **Empty states are onboarding moments**, not voids — show the shape of value before asking for input.
- **Slash menu / command palette** as the power-user accelerator behind the clean default surface.
- **Calm, content-first typography.** Hierarchy through weight + size, not chrome.
- **Documents look like the polished output even while being edited.** WYSIWYG without modal "preview" toggle.
- **Templates as the answer to the blank page.** Default to a shape, not nothing.

### What Google chooses
- **Search-first navigation when the catalog is large.** Spotlight model.
- **Autocomplete / predict / rank by behavior**, not by alphabetical or chronological order.
- **Materialized data integrity** — count what is actually true, paginated, indexed; never `take: 1000` and reduce in memory.
- **Performance budgets:** p50/p95 targets per endpoint. Slow query = bug.
- **A/B test copy** at scale; don't ship a "neutral default" when one variant outperforms.
- **Accessibility AA minimum, AAA where stakes are real.** Color contrast, focus rings, screen-reader labels.
- **Internationalization-ready from day one** even when only English ships.
- **Telemetry on every flow** — you cannot improve what you do not instrument.

---

## How R0 interacts with the rest of the rulebook

- **R0 + R64:** When R0 produces a new design decision (e.g., "the freeze-card animation should follow Apple's spring physics"), R64 fires immediately — upload the decision to `tgp-agent-context` before context dies.
- **R0 + R52 (wasted credits):** R0 is *never* a justification for speculative refactors of working code. R0 governs **the next decision**, not retroactive perfection. Don't gut-renovate a CLEAN-audited service to chase Apple polish; apply R0 at the next iteration boundary.
- **R0 + R31/R32 (auditor ≠ builder):** Auditors apply R0 to evaluate verdicts. A P2 "feels off but technically correct" finding is valid under R0 if "Apple/Notion/Google would never ship this."
- **R0 + Decacorn Mobile-Design Intelligence doc:** `design/MOBILE_APP_DESIGN_INTELLIGENCE_2026-05-30.docx/.txt` is the operational manual for R0 on the mobile surface specifically. Section references are canonical.

---

## R0 audit checklist (apply before any screen, copy, or interaction ships)

From `design/MOBILE_APP_DESIGN_INTELLIGENCE_2026-05-30.txt` Part VI master checklist:

**Emotional design**
- [ ] Emotional target explicitly defined (specific feeling, not "functional completion")
- [ ] Every confirmation has a dedicated micro-interaction
- [ ] Peak moment designed with maximum investment
- [ ] Closure state is explicit
- [ ] In high-friction surfaces (billing, push-to-existing, refund), CALM treatment applied (Clarity, Animation, Light feedback, Mascot presence)

**Behavioral gamification**
- [ ] Target behavior precisely defined (not "engagement")
- [ ] Mechanic produces that exact behavior, not a proxy
- [ ] S-curve check: ≤4 active mechanics
- [ ] Streaks have forgiveness architecture
- [ ] At least one mechanic signals **competence** (skill growth), not just engagement
- [ ] Competition (if any) is **local and winnable**

**Cognitive simplicity**
- [ ] Cognitive load audit: D-class elements removed
- [ ] Miller's Law: ≤5 actionable elements visible
- [ ] Hick's Law: primary path completable without secondary options
- [ ] Progressive disclosure for advanced surfaces
- [ ] Smart default for at least one decision per non-trivial flow
- [ ] Consistency with established interaction pattern library
- [ ] One-sentence description of the screen is possible
- [ ] New-user test: primary path in <3 minutes, no instruction
- [ ] Anticipatory element present

**Outcome-first**
- [ ] Outcome metric defined (the change in the user's real life), not just engagement metric
- [ ] Behavior path is the shortest path in the product
- [ ] Ability friction reduced before motivation added
- [ ] App disappears during the behavior
- [ ] Closure ≠ stats dump; closure ≠ obligation; closure = meaningful summary + forward hook

---

## Anti-patterns R0 forbids

From the design intel doc Part V §5.5, all canonical fails:
1. **Permission-front onboarding** — asking for location/notifs/contacts before value is shown.
2. **Feature-dump first screen** — tour of capabilities before need is formed.
3. **Unescapable streak architecture** — no freeze, no grace, no recovery path.
4. **Empty confirmation** — major achievement → static text. Peak moment wasted.
5. **Inconsistency tax** — same gesture/color meaning two different things in two screens.
6. **Gamification mismatch** — proxy behavior rewarded (check-ins, badges) instead of real behavior (discovery, mastery).
7. **Polish-as-afterthought** — emotional design tacked on at the end. Must be designed in parallel with function.

If a build/PR/spec **demonstrates any of these anti-patterns**, the auditor MUST flag it as a P0 (Apple/Notion/Google would block release).

---

## Self-test before ending any turn

In addition to R64's "scan for new rules / ideas / landmines" check, also scan for:

1. **Decisions made this turn without explicit Apple/Notion/Google framing.** If any, retroactively justify or revise.
2. **Copy / labels / error messages that read mechanical or institutional.** Rewrite with the CALM framework.
3. **Screens that fail the Miller/Hick caps.** Flag for redesign.
4. **Features that lack a defined real-world outcome metric.** Flag for outcome definition.

R0 violations should land in `audits/r0-violations/` with a fix recommendation, even when the violation is doctrinal rather than code-level.

---

## Filing reference

- This rule lives at `tgp-agent-context/rules/R0_DECACORN_QUALITY.md`.
- The mobile-specific operational manual lives at `tgp-agent-context/design/MOBILE_APP_DESIGN_INTELLIGENCE_2026-05-30.docx` (binary) and `.txt` (text mirror for grep/agent search).
- New design-doctrine docs derived from R0 should land in `design/` with a date suffix.
- Per-screen R0 audit findings land in `audits/r0-violations/`.

---

— Codified per operator directive, 2026-05-30 20:57 PT
