# v1.1 specs: UI

Owner-selected screen designs for v1.1. Each section is a spec for one screen, written from a design study (agent 135, 2026-10-09). Each section carries the selected mockup images and the exact HTML/CSS reference in planning/v1_1_ui/<section>/; build to match them exactly (owner, 2026-10-09: "put the mockup image inside the plans as well as an exact thing to copy"). Sample data in the mockups is fictional. Copy rules apply to every section: sentence case, no first person except Roman's own lines, no exclamation marks, no emojis, no clinic or partner names.

| Section | Screen | Status |
|---|---|---|
| UI-1 | Client Home: Rings and tiles | Selected by the owner 2026-10-09 |
| UI-2 | Coach Home | Mockups in progress (3 concepts) |
| UI-3 | Client food logging | Mockups in progress (3 concepts) |
| UI-4 | Coach client lookup | Mockups in progress (3 concepts) |

---

## UI-1 Client Home: Rings and tiles

Owner, 2026-10-09 PDT (verbatim): "Of the screen mockups, the rings and tiles one looks amazing - add this to v1.1 specs under a new UI section please"

Source study: DESIGN-HOME-135 (three concepts: Day timeline, Rings and tiles, Coach letter and one next step).

### The mockup to copy

| Coached, first screen | Coachless, first screen |
|---|---|
| ![Rings and tiles, coached client, first screen](v1_1_ui/ui-1-client-home/coached.png) | ![Rings and tiles, coachless client, first screen](v1_1_ui/ui-1-client-home/coachless.png) |

| Coached, full scroll | Coachless, full scroll |
|---|---|
| ![Rings and tiles, coached client, full scroll](v1_1_ui/ui-1-client-home/coached-full.png) | ![Rings and tiles, coachless client, full scroll](v1_1_ui/ui-1-client-home/coachless-full.png) |

Exact reference: [coached.html](v1_1_ui/ui-1-client-home/coached.html) and [coachless.html](v1_1_ui/ui-1-client-home/coachless.html) (390 x 844 pt frame; open in a browser). Every size, color, radius and spacing in them comes from the app's theme tokens (src/theme), so a builder copies these values one to one:

- Colors: bone #F5EFE4 (background), surface #FFFDF8 (cards and tiles), cream #F1E8D5, ink #1A1A18, muted #6B675F, border #DCD5CC, forest #2C4A36 (primary, ring fill, the one filled button), on-forest #FBF7F0, gold #C9A961.
- Type: Cormorant Garamond for numbers and headings (h1 32/40, h2 24/30, h3 500 20/25; dial number 25/30; tile value 26/32; Roman's line italic 19/26); Inter for text (body 16/26, small 14/22, sub-lines 13/18, eyebrow 500 11/13 with 1.98 letter spacing, uppercase).
- Layout: side gutter 24; cards and tiles radius 16 with a 0.5 hairline border; tile grid two columns, gap 12, tile minimum height 118, padding 14; the filled forest button is 54 high, radius 12.
- Dials: three across, each 92 x 92, ring radius 40, stroke 7, track #DCD5CC, fill forest with round caps, starting at 12 o'clock; label 10 below the ring, sub-line 4 below the label.
- Tab bar: 83 high, labels 11/14; "Community" must fit at 360 pt.

Parity rule: every PR that builds this screen carries a parity table against these images and HTML, row by row.

### Inspiration
- Whoop: three dials at the top, tap a dial to go deeper ([WHOOP](https://www.whoop.com/us/en/thelocker/the-all-new-whoop-home-screen/)).
- Oura: score shortcuts first on Today ([Oura blog](https://ouraring.com/blog/new-oura-app-experience/)).
- Apple Health: the user picks the pinned categories ([Apple Support](https://support.apple.com/en-us/104997)).
- MacroFactor: dashboard tiles can be turned on or off and reordered ([MacroFactor](https://macrofactor.com/dashboard-customization/)).
- Gentler Streak: plain-language reading of your own numbers ([Gentler Streak docs](https://docs.gentler.app/understanding-your-activity-path/interpret-the-activity-path)).
- The app's own Health rings (ThreeRingHero, RecoveryRingHero).

### Layout, top to bottom
1. Header: coached shows "Message <coach first name>" with the unread count and the bell; coachless shows Roman locked ("Opens with a coach") and the bell.
2. Date line.
3. Three dials, each its own number, never a combined score:
   - Food: kcal left of the daily target, with eaten of target under it.
   - Train: workouts done of planned this week (coached: this week's coach assignments; coachless: the client's own "days per week" answer from the profile).
   - Sleep: percent recovered and hours asleep when Health is connected; otherwise the check-in's hours slept; with neither, an empty ring and a Connect prompt (never "coming soon").
4. Coachless only: the "Join a coach" banner right under the dials (same banner and session rule as m#654).
5. Roman's one-line read of the day (coached). Coachless: the Roman locked line ("Roman works with a coach ... Your own logging stays open.").
6. The day's one filled forest button (for example "Start Full Body A").
7. A two-column grid of tiles; each tile opens the screen that already exists for it: protein (with carbs and fat), water (with +8 oz), weight (30-day trend), fasting (last fast and when the window closes), habits, steps (Health), check-in, logging streak, and the next Calendar session (coached; coachless shows the logging streak instead).
8. "Edit tiles" at the foot: turn tiles on or off and reorder; the order is saved on the device.
9. One notice slot that shows a single notice at a time instead of a stack, in this order: dunning, pending invite, finish your profile, push permission, then the rest.

### Data
- Available today: food targets and totals, protein and macros, water, weight trend, fasting, habits, check-in, logging streak, Calendar sessions, steps and recovery (Health connected only).
- Needs new data: Roman's daily line on Home (default for v1.1: reuse the existing holistic insight sentence, no new AI call per Home view; owner decision open), and the saved tile order (device storage).

### What it takes to build
- A dial row that reuses the existing ring components.
- A tile grid component; each tile routes to its existing screen.
- An "Edit tiles" sheet and device-stored order.
- The Sleep dial fallback rule above.
- Re-point the tutorial spotlights (the daily targets beat moves to the Food dial).
- Rough size: medium, about 2 weeks; a few days more if Roman's line becomes a real AI call.

### Acceptance
- Coached and coachless variants both render at 360 pt wide without clipping, at default and large text.
- Every dial and tile opens a real screen; no dead tiles.
- Coachless: Join a coach banner present every session, Roman shown locked, basic logging tiles all work.
- Parity table against the selected mockup in each PR body; no device claim without a device.

---

## UI-2 Coach Home

Mockups in progress (agent 135 design study). Section to be filled once the owner picks a concept.

## UI-3 Client food logging

Mockups in progress (agent 135 design study). Section to be filled once the owner picks a concept.

## UI-4 Coach client lookup

Mockups in progress (agent 135 design study). Section to be filled once the owner picks a concept.
