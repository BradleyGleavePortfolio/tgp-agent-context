# Coach Workout Builder — Luxury Target

**Screen:** `CoachWorkoutBuilderScreen` (mobile)
**Filed:** 2026-06-13
**Persona:** Coach (or sub-coach / trainer inside a gym)
**Decision isolated:** "Build one workout plan for one client, with the minimum friction the form allows."

> Per `CATALOG.md`: this image is the **bar, not the blueprint**. The screen does not need to match this layout exactly — it must match the **quality level**.

---

## What this reference shows

A single vertical scroll, one decision per group:

1. **Plan name** — text input, italic placeholder ("e.g. Upper Body Strength")
2. **Type** — three pill buttons (strength selected = filled sage green, others outlined). Lowercase serif labels.
3. **Estimated duration (minutes, optional)** — single text input with stepper chevron
4. **Exercises** — a draggable list (left handle = grip dots) of exercises already added, each with: name, set/rep summary, edit pencil, trash icon
5. **Add exercise (search)** — search field + scroll of suggested exercises with line-illustration thumbnails (NOT photos), name + muscle/equipment tags, plus button
6. **Create plan** — single sage-green primary CTA at the bottom

---

## Universal language compliance (from CATALOG.md §Universal design language)

- ✅ Warm off-white background, near-black serif body, single sage-green accent on selected pill + CTA
- ✅ Serif display headline ("New workout plan") — italicized lowercase, hero-sized
- ✅ Small-caps overlines (`PLAN NAME`, `TYPE`, `ESTIMATED DURATION (MINUTES, OPTIONAL)`)
- ✅ Hairline dividers separating sections; no boxed cards with shadows
- ✅ ONE primary CTA at the bottom in filled sage green
- ✅ Bottom tab bar hidden (deep-flow pattern — back chevron at top-left only)
- ✅ Line-illustration thumbnails for exercises (NOT photos) — keeps the screen calm
- ✅ Sentence-case body, italic placeholders, no hype copy, no emoji

---

## Doctrine-binding observations

1. **Type selector is three pills, not a dropdown.** Hick's law applied: three is below the 5-option fan-out threshold from R0 §3 → no progressive disclosure needed.
2. **Estimated duration is OPTIONAL and labelled as such inline.** No separate "optional" badge or asterisk; the parenthetical inline label IS the affordance.
3. **Exercise list is drag-reorderable from the moment the second exercise is added.** The grip dots are persistent, not gesture-revealed.
4. **The "Add exercise (search)" section is below the existing list, not a modal.** This is a single-screen flow; modals are forbidden by the universal language.
5. **The CTA reads "Create plan", not "Save plan" or "Done".** Verb-noun construction matches the intent.

---

## How this slots into the Master Expansion Plan

- **Stage 1 (mobile page refactor)** — the existing `CoachWorkoutBuilderScreen` becomes a candidate for refactor under this luxury target.
- **MWB-4 autosave (#237, merged)** is the underlying autosave plumbing; this target governs the *visual* refactor that sits ON TOP of that plumbing.
- The screen MUST go through R73 (mobile planner gate) before any builder picks up the refactor PR. Planner brief at `_planner_brief_<PR>_coach-workout-builder.md` cites this folder.

---

— Filed per operator attachment, 2026-06-13.
