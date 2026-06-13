# Plan screen — luxury target reference

**Filed:** 2026-06-13
**Pair:** `plan_asis.jpg` (today's build) vs. `plan_luxury.jpg` (the bar)

> **THE LUXURY IMAGE SETS THE PAR, NOT THE EXACT LAYOUT.**
> Operator directive: "The pages don't need to be EXACTLY that, but at the same par."
> Match the quality bar, the restraint, the voice, and the decision-per-screen principle. Layout/copy/ordering may diverge with planner justification. See `../CATALOG.md` for the full rule.

This pair is the first concrete reference for the **mobile page refactor** (stage 1 of `../../../roadmap/TGP-MASTER-EXPANSION-PLAN.md`).

It is also the canonical example of the bar for **every** other mobile page that goes through the as-is → luxury workflow.

---

## The principle the pair demonstrates

> One screen → one decision. The plan screen exists to answer "what am I eating tonight?", not "what did my coach assign across 28 meals?"

The as-is treats the plan as a spreadsheet of macros. The luxury treats it as a single editorial card with the rest of the week glanceable on the side.

---

## Refactor rubric (apply to ANY mobile page being lifted to luxury)

A page passes the luxury bar only if every row below is YES.

### 1. Decision compression
- [ ] One primary decision per screen
- [ ] Secondary information is glanceable (timeline, struck-through history) not enumerated
- [ ] Macro/metric labels appear at most once per page — never repeated per card
- [ ] No more than 3 numbers on the hero unit

### 2. Hierarchy
- [ ] Editorial headline at the top — large serif, plain, no all-caps overlines competing
- [ ] One hero unit (image or single card) below the headline
- [ ] Supporting data is visually quieter (smaller, lighter weight) than the hero
- [ ] No "section header → section header → list-of-things" stacking; one focus per scroll

### 3. Imagery
- [ ] Real photography where the content benefits from it (food, gym spaces, equipment, people)
- [ ] Line illustrations only where photography would feel patronizing (settings, abstract concepts)
- [ ] Hero image is full-bleed within the content column, never cropped to a thumbnail when it's the subject
- [ ] No stock-photo-feel filters or color tints

### 4. Color
- [ ] Near-white or true-white background by default (not beige paper)
- [ ] Single accent color used for state-of-now (active day, current step) — sage green in the reference pair
- [ ] No category-coded chips (red protein / ochre carbs / lavender fat) unless the user needs to compare across categories on that screen
- [ ] State (done / current / future) is shown with weight + strike-through + dot fill, not with color hue swaps

### 5. Typography
- [ ] Serif display face for headlines + numbers
- [ ] Sans or same-serif at smaller weights for body
- [ ] Tabular numerals on metrics so "590" and "52G" line up vertically
- [ ] All-caps used only for overlines (the small "TONIGHT, MONDAY" pattern) — never for body or labels

### 6. Navigation chrome
- [ ] Bottom tab bar removed or reduced — only context-relevant icons at the edges
- [ ] If a tab bar must exist on this screen, justify why in the planner brief
- [ ] Settings/clipboard/back are quiet — bottom corners, single-glyph, no labels

### 7. Voice
- [ ] Copy reads like a single sentence from a person, not like a form field
- [ ] No exclamation marks
- [ ] No "Your X" possessive overlines where the page subject is obvious
- [ ] No coach-side jargon leaking into client-side surfaces ("Assigned by your coach" is a phrase the as-is uses — the luxury just shows the dish)

### 8. State of past / present / future
- [ ] Past items struck-through, dimmed, or removed
- [ ] Present item is the visual focus
- [ ] Future items are quiet text, no images, no macros
- [ ] The user always knows "where they are" without reading a date

---

## How this applies to other pages

| Screen type | Decision the luxury version isolates |
|---|---|
| Home / Today | "What is the one thing I should do right now?" |
| Workout active session | "What is the current set?" |
| Workout history | "Am I making progress on the lifts that matter?" |
| Coach inbox | "Who needs me in the next 10 minutes?" |
| Coach client card | "Is this client on track, yes or no?" |
| Gym member home | "When is my next class?" |
| Gym owner home | "What's my revenue today and who's at risk?" |
| Front desk kiosk | "Is the person in front of me allowed in?" |

For each screen, the planner brief must name the **one decision** the luxury version isolates, then justify every element on the page as either supporting that decision or visually quiet enough to not compete.

---

## Workflow when a new luxury target pair is filed

1. Operator attaches `<screen>_asis.jpg` and `<screen>_luxury.jpg`.
2. Both are filed under `design-targets/mobile/<screen>/`.
3. Planner reads this rubric + the new pair and produces a luxury refactor brief.
4. Builder (Opus) implements.
5. Auditor (GPT-5.5) verifies every rubric checkbox + the 50-failures sweep.
6. Fixer loop until CLEAN.
7. Merge + journal.

A page is **not done** until every rubric checkbox is YES and the auditor signs off — "it works" and "it looks closer" are not acceptance criteria.
