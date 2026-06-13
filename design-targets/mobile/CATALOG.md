# Mobile Luxury Target Catalog

**Filed:** 2026-06-13 (initial batch)
**Total screens:** 10 luxury references (1 with as-is pair, 9 luxury-only so far)

> **THESE IMAGES ARE THE BAR, NOT THE BLUEPRINT.**
>
> Operator directive (2026-06-13): "The pages don't need to be EXACTLY that, but at the same par."
>
> Every refactor PR must MATCH THE QUALITY LEVEL of these references — the restraint, the typographic discipline, the decision-per-screen focus, the negative space, the single-accent color palette, the voice. The PR does NOT have to replicate the exact layout, copy, ordering, or arrangement.
>
> Planners may diverge from the reference layout when:
> - A different arrangement better fits the actual data model TGP has today
> - User-research evidence (e.g. `roadmap/research-gym-owner-frontdesk-needs.md`) points to a different information hierarchy
> - Engineering reality requires a different decomposition
>
> Planners must NEVER diverge from:
> - The universal design language section below (color, typography, layout rules, voice)
> - The decision-per-screen principle
> - The patterns table at the bottom of this file
> - The token system
>
> When in doubt, the test is: *would a person looking at this screen next to the reference believe both came from the same product team at the same studio?*

This catalog cross-references every luxury target image filed under `design-targets/mobile/<screen>/` with a per-screen analysis: which persona it serves, what single decision it isolates, and the design tokens it depends on.

Every planner brief that touches a refactor PR must cite the matching folder here AND explicitly state which elements of the reference it's matching vs. intentionally diverging from.

---

## Universal design language (shared across all 10 screens)

These tokens repeat verbatim across every luxury reference — they ARE the system.

**Color**
- Background: warm off-white (parchment / cream paper, not pure white)
- Foreground primary: near-black serif body
- Accent: a single deep sage green (≈ `#1F3A1F`) used ONLY for:
  - Active-state dots (today indicator)
  - The single primary CTA per screen (filled green button)
  - Tiny up-arrows on positive deltas
- Muted: warm grey for overlines, dates, secondary metadata
- Negative space: dominates every screen — typically > 40 percent of the canvas
- No category-coded chips. No status hue swaps. No gradients.

**Typography**
- Headlines: serif display face, low contrast, used at hero sizes (often filling 1/3 of the screen width)
- Overlines: SMALL CAPS, letter-spaced, warm grey, never competing with the headline
- Body: smaller serif (or system at smaller weights) — italic used purposefully for tertiary notes
- Numbers: tabular, serif, aligned on the decimal/comma — they ARE typography, not data chips

**Layout**
- One headline. One hero (number, image, or sentence). Everything else is supporting.
- Hairline dividers between sections — never boxed cards with shadows
- Negative space between sections is generous (1.5–2× the vertical rhythm of competitors)
- A single primary CTA at the bottom, filled sage green — never more than one per screen

**Voice**
- Sentences, not labels. "Three need you; forty-four are steady" not "3 urgent, 44 active."
- No exclamation marks. No emoji. No hype words ("amazing," "boom," "let's go").
- Personal but reserved — "Your bar speed on squats has dropped 12 percent" not "Warning: bar speed declining."
- Names are bigger than data — "Jessica Miller" is the headline of her urgency card; the data is the supporting line.

**Navigation chrome**
- Bottom tab bar uses outline glyphs ONLY, no labels, max 5 icons
- Some screens (deep flows) hide the tab bar entirely and use a small back chevron at top-left
- Settings/clipboard/utility icons are bottom-corner placed, single-glyph
- No floating action buttons, no badges, no notification dots

---

## Screen-by-screen catalog

### 1. Plan (client meal plan — single day)
- **Folder:** `plan/` (HAS as-is + luxury pair + rubric README)
- **Persona:** Client (coached)
- **Decision isolated:** "What am I eating tonight?"
- **Hero:** Single dish title + photo, three numbers (cal/protein/time)
- **Supporting:** Week strip with dots, past days struck-through
- **Key signal:** Real food photography replaces line illustrations — the steak photo carries the entire screen
- **Refactor target:** Replace current meal-plan list view in mobile

### 2. Plan — Full Week (client meal plan — week overview)
- **Folder:** `plan-fullweek/`
- **Persona:** Client (coached)
- **Decision isolated:** "What is my week's eating story at a glance?"
- **Hero:** "This weeks plan" + program phase overline
- **Supporting:** One-line dish per day, italicized supporting meals, today marked with green dot, past days struck-through
- **Key signal:** Macros collapse to ONE rule at the top ("2,150 calories average, 180 grams protein daily") instead of repeating per meal
- **Bottom action:** "Open shopping list →" as text link, no filled button
- **Notes:** Typo in headline ("This weeks plan" should be "This week's plan") — flag to operator before refactor lands

### 3. Coach Home — Solo Coach
- **Folder:** `coach-home-solo/`
- **Persona:** Coach (no sub-coaches)
- **Decision isolated:** "Am I on pace, and who needs me right now?"
- **Hero:** `$14,280` June-so-far revenue at display size
- **Secondary:** 6-month MRR bar chart (single sage bar, no axes labels except months)
- **Tertiary:** Students / Retention / Next Payout three-up
- **Action layer:** "Three need you; forty-four are steady" + urgent client card (Jessica Miller, photo, "Send a message" link) + 2 recent activity rows
- **Tab bar:** 4 icons (home / calendar / clients / chart), no labels
- **Key signal:** Revenue is the headline because retention IS revenue — but the urgent client gets a portrait and a name treated like editorial copy

### 4. Coach Home — Head Coach (with team)
- **Folder:** `coach-home-headcoach/`
- **Persona:** Head coach managing sub-coaches
- **Decision isolated:** "Is my studio growing, and which of my coaches needs attention?"
- **Hero:** `$38,720` studio revenue MTD + delta vs May
- **Secondary:** "Your take $11,616 — sub-coach payouts $27,104" (the split is the second-most-important fact)
- **Section:** "Your team — 4 coaches" with italicized headline narrative ("Three are growing. One is stalled.")
- **Table:** 4 sub-coach rows with student delta + revenue; Alex Holt flagged with sage dot (the one that's stalled)
- **Bottom:** Direct students section ("One needs you. Twelve are steady.")
- **Tab bar:** 5 icons (home / calendar / clients / briefcase / chart)
- **Key signal:** The narrative sentence ("Three are growing. One is stalled.") replaces what would normally be 4 status badges

### 5. Progress Details (client transformation report)
- **Folder:** `progress-details/`
- **Persona:** Client (coached) viewing their own progress, or coach viewing a client's full file
- **Decision isolated:** "What is my full progress story since I started?"
- **Hero:** "The full picture" / "Since February 12" — editorial title
- **Sections (in order):** Body (4 metrics, large serif numbers) → Photos (3 timeline shots, line-illustration placeholders) → Workout Volume (sparkline chart + "168 sets this week, up 42% vs the 4-week average") → Personal Records table (italicized dates) → Recent Check-ins (one-line excerpts)
- **Bottom action:** "Export this report →" — single text link
- **Key signal:** This is a magazine spread, not a dashboard. The photos placeholder uses neutral line illustrations until real photos exist — never lorem-ipsum gradients

### 6. Earnings Detail (coach financial deep-dive)
- **Folder:** `earnings-detail/`
- **Persona:** Coach viewing month financial detail
- **Decision isolated:** "Where is my money coming from this month, and what is it costing me?"
- **Hero:** `$14,280` MTD with delta + pace projection
- **Chart:** Trajectory line with annotated milestones ("first 25 students Nov", "first 40 students Mar", "today Jun") — narrative annotations, not data labels
- **Composition table:** Subscriptions / one-time / nutrition consults / MINUS platform fee → NET
- **Payouts:** Next payout headline + last 3 payouts list
- **Costs:** Stripe processing / AI budget (with progress bar at 70 percent) / app subscription
- **Bottom CTA:** Filled green "Open Stripe dashboard" + secondary "Download statement"
- **Key signal:** Costs are NOT hidden — transparency is the feature. AI budget shows a literal progress bar so the coach knows when they'll hit it

### 7. Team Breakdown (head coach team detail)
- **Folder:** `team-breakdown/`
- **Persona:** Head coach managing sub-coaches
- **Decision isolated:** "Which of my coaches needs my time this week?"
- **Hero:** "Your team / 4 SUB-COACHES — JUNE 2026"
- **Top metric:** Studio Revenue MTD with split sentence
- **Ranking:** "RANKED BY MOMENTUM" — 4 sub-coach rows, each with: name, italicized narrative ("Zero churn since join", "One paused this week", "Two churned in May. Worth a check-in"), 3 numbers (revenue / your cut / retention)
- **Alex Holt flagged:** Sage dot prefix + the explicit "worth a check-in" narrative
- **Your take breakdown:** From sub-coaches / from direct students / minus platform fee → YOUR NET
- **Bottom:** Filled green "Invite a new sub-coach" + text link "Configure revenue sharing →"
- **Key signal:** Each sub-coach has a sentence about THEM — software that knows the team, not just the spreadsheet

### 8. Client File — Workouts Tab (Jenna Park, week view)
- **Folder:** `clientfile-workouts/`
- **Persona:** Coach viewing a specific client's workout history
- **Decision isolated:** "How is Jenna doing this week?"
- **Hero:** "Jenna Park / HER FULL FILE" — name as editorial headline
- **Tab bar (in-page):** Overview / Workouts / Nutrition / Messages / Notes — Workouts underlined
- **This week summary:** "Three of four workouts done, one missed." + "On track" status with circle check
- **Workouts list:** 4 numbered rows with completion circle, date/duration/RPE, italicized coach observation
- **Strength trajectory chart:** 3-line chart (Squat / Bench / Deadlift) with legend in-line
- **Current program:** Phase + week reference
- **Bottom CTA:** Filled green "Message Jenna"
- **Key signal:** Coach observations under each workout are italicized as if pulled from a journal — software that captures coach insight, not just session data

### 9. Drafts Queue (coach pending-approval inbox)
- **Folder:** `drafts-queue/`
- **Persona:** Coach with AI-drafted items waiting for review
- **Decision isolated:** "Which drafts should I review next, and which can I bulk-approve?"
- **Hero:** "Pending Drafts / 7 WAITING ON YOU"
- **Sub-headline (italic serif):** "Four workout plans, two meal adjustments, one message reply." — the queue summarized in one sentence
- **Filter row:** QUEUE / All · Workouts · Meals · Messages — All underlined
- **List:** 7 rows, each with type overline (small caps), bold subject ("For Jenna Park"), italic context ("drafted 1h ago, while her knee felt tight.")
- **First row indicator:** Tiny sage dot (most urgent / most recent)
- **Bottom CTA:** Filled green "Review them one at a time." + text link "Bulk approve everything tagged routine"
- **Key signal:** Two CTAs at the bottom acknowledge two real workflows — careful review vs trusted bulk approve

### 10. AI Guide / Guidance Chat
- **Folder:** `ai-guide/`
- **Persona:** Client or coach chatting with TGP's AI
- **Decision isolated:** "What does the AI think I should do next?"
- **Hero:** "Guidance / TRAINED ON SARAH CHEN APPROACH" — overline establishes provenance
- **Proactive message:** "NOTICED THIS MORNING" overline + serif headline-sized message ("Your bar speed on squats has dropped 12 percent.") + body explanation + 2 action links ("Draft a deload week" underlined, "Tell me more" lighter)
- **User turn:** Right-aligned, no avatar, no bubble — just the text "How was yesterday compared to last week?" with "YOU" overline above
- **Assistant response:** "GUIDANCE" overline + plain serif response, left-aligned
- **Input bar:** "Ask Guidance anything." + filled green arrow send button — no attach/mic/emoji clutter
- **Key signal:** This is iMessage's restraint applied to AI chat. No bubbles, no avatars, no streaming dots. Just typography.

---

## Patterns I'm seeing across all 10 screens

These are emergent rules from the reference set — every refactor PR must respect them.

| Pattern | What it means in code |
|---|---|
| One sentence summarizes a section | Build a `<SectionNarrative>` component: italic serif, large, one or two clauses |
| Numbers are typography, not chips | Tabular serif numerals at hero size; no rounded backgrounds |
| Italic = "coach voice" / observation / context | Reserve italic for the human layer: notes, observations, context |
| Past = struck-through, present = filled sage dot, future = plain | Codify in a `<TemporalState>` enum and apply consistently |
| Names are headline-sized | Client/coach names are h1, never h3 |
| 1 primary CTA per screen, always bottom, always filled sage | Tokenize as `<PrimaryAction>` — lint should fail if > 1 per screen |
| 1 secondary action as underlined text link | `<SecondaryAction>` — never a second filled button |
| Photographs > illustrations where the content has visual substance | Food, people, places: real photos. Settings/abstract: line illustrations |
| Filter rows use underline-on-active, no pill backgrounds | `<TextTabs>` component, no `<PillTabs>` anywhere |
| The "good ones" of any list are quiet, the urgent ones get the photo | Implement "narrative ranking" — the top card has a person, the rest are rows |

---

## Token system (proposed extraction)

Once these references are codified into design tokens, the following should exist as named primitives:

- `bg.parchment` — the warm off-white canvas
- `fg.primary` — near-black serif body
- `fg.muted` — warm grey for overlines and metadata
- `accent.sage` — `#1F3A1F` (or whatever the precise hex resolves to from the references)
- `font.display` — serif display, used for headlines and hero numbers
- `font.body` — serif/sans-secondary for paragraph copy
- `font.overline` — small caps, letter-spaced, used for section labels
- `divider.hairline` — 1px warm-grey divider
- `spacing.rhythm` — the generous vertical rhythm visible across all 10 screens
- `radius.subtle` — the small rounding on the avatar circles and the one CTA button

These names should be the same in mobile (React Native) and web (CSS variables) when stage 4D arrives.

---

## What's still needed before stage 1 can begin

Operator-attached "as-is" screenshots for the following screens — I have the luxury for each, but the as-is pair is what unblocks the planner brief:

- Plan — Full Week
- Coach Home (solo)
- Coach Home (head coach)
- Progress Details
- Earnings Detail
- Team Breakdown
- Client File — Workouts Tab
- Drafts Queue
- AI Guide

Once each pair is complete, the per-screen planner brief can be written and stage 1 can dispatch refactor PRs in priority order.
