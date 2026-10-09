# v1.1 specs: UI

Owner-selected screen designs for v1.1. Each section is a spec for one screen, written from a design study (agent 135, 2026-10-09). The mockup images live in the owner's Perplexity library, not in this public repository. Copy rules apply to every section: sentence case, no first person except Roman's own lines, no exclamation marks, no emojis, no clinic or partner names.

| Section | Screen | Status |
|---|---|---|
| UI-1 | Client Home: Rings and tiles | Selected by the owner 2026-10-09 |
| UI-2 | Coach Home | Mockups in progress (3 concepts) |
| UI-3 | Client food logging | Mockups in progress (3 concepts) |
| UI-4 | Coach client lookup | Mockups in progress (3 concepts) |

---

## UI-1 Client Home: Rings and tiles

Owner, 2026-10-09 PDT (verbatim): "Of the screen mockups, the rings and tiles one looks amazing - add this to v1.1 specs under a new UI section please"

Source study: DESIGN-HOME-135 (three concepts: Day timeline, Rings and tiles, Coach letter and one next step). Mockup images: "Client Home: today and three concepts" and "Client Home concept mockups (all images)" in the owner's library.

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
