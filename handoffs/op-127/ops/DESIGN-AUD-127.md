# DESIGN-AUD-127: is TGP luxurious, vibrant and world class? (client side)

Auditor: DESIGN-AUD-127 (Claude Opus 5.5, read-only). Started 10:00 PDT 2026-10-07, report written 10:12-10:25 PDT (times from `TZ=America/Los_Angeles date`).
Code read: mobile main `5e3e9398e09449cbdc876ace788e9ca3df8d8087` in the read-only worktree `/home/user/workspace/wt/RO-mobile`. No PRs, no code edits, no GitHub writes.

## Visual evidence: this is a code-level review
- No app screenshots exist yet. `ops/shots/` is missing. `ops/reports/SHOTS-127.md` lists 18 planned captures, but the capture run [37654776791](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37654776791) was still `in_progress` at 10:11 PDT and two earlier runs failed before capturing anything. No PNGs are committed to the repo (only brand assets).
- Viewed: the app icon (TGP serif wordmark on bone) and the Roman portraits (`assets/icon.png`, `assets/roman/neutral@3x.png`, `assets/roman/hero.jpg`). Contact sheet: `ops/reports/DESIGN-AUD-127-assets/brand_assets.png`.
- Screens I could NOT see rendered (judged from code only): Home, Food Log, food search sheet, portion picker, edit-entry sheet, water card, Train tab, assignment detail, live workout (set rows, rest timer), finish summary, workout history, Progress, Habits and check-in, Roman chat, Day-1 onboarding (Welcome, Coach pairing, Goals, Notifications, Check-in time, Ready, Day-1 win), Health and sleep, Settings > Appearance. When SHOTS-127 publishes artifacts, re-check rows U1, U2, U4, U7 and U9 against the PNGs first.

## (a) Plain answers to the owner

**1. Is client food logging and workout logging simple, beautiful, luxurious and world class? Food 5/10, workout 6/10.**
Both are simple and they work. Under the surface they are honest and carefully built, but they are not yet beautiful, and they are not luxurious next to Home.
- Food logging has the right mechanics: recent and frequent foods, last portion pre-filled, repeat a past meal, edit or move an entry, offline queue, and a success haptic. Logging a recent food takes about four taps, which is close to the leaders. The [MacroFactor speed index](https://macrofactor.com/fastest-food-logger-2025/) scores search plus portion at 10 actions for two foods (MyFitnessPal: 15).
- What lets food logging down is how it looks and what is missing:
  - The Food Log uses the phone's system font instead of the brand fonts.
  - Labels are 10 pt in a stone grey that measures 1.9:1 on the cream cards.
  - Protein is shown in the app's error red, and carbs in a gold that is nearly invisible (2.0:1).
  - The day summary is five tiny columns with no progress visual.
  - There is no barcode scanner and no quick-add calories. [Cronometer gives the scanner free](https://fortune.com/article/cronometer-review/) and [MyFitnessPal sells it with Meal Scan](https://www.myfitnesspal.com/premium).
- Workout logging also has the right mechanics: an automatic rest timer with +30s and Skip, last-time performance, swap, reorder, coach notes during sets, resume after a crash, and haptics.
- It falls short of [Strong](https://www.strong.app/love) and Hevy in three ways:
  - Every exercise card shows seven tool buttons at once.
  - "Last time" appears as an extra row under every set instead of a ghost value in the cells.
  - The rest timer is silent when the phone is locked. [Hevy notifies at zero and shows a Live Activity](https://www.hevyapp.com/features/live-activity/).
- Finishing a workout has no celebration or summary moment. The confetti component exists, but only on the coach's first-payment screen.

**2. Is the app overall luxurious and vibrant, and does it speak "health and mental clarity"? Overall 6/10: luxurious 7, vibrant 4, clarity 6.**
- Where the new design system is used, the app is genuinely luxurious. Home, Roman, the assigned-workout page and Day-1 use the bone and ink palette, Cormorant Garamond headlines at weight 400, generous whitespace and calm motion. "Wednesday, the seventh." over "A clean slate." does speak clarity, and the TGP wordmark is premium.
- It is not vibrant. The palette is deliberately muted (forest, stone, camel; "no saturated colors"), and Home shows numbers as plain text below a 96 px gap.
- The feeling breaks as soon as a client leaves Home, because two design systems coexist:
  - About 190 files use the new theme-aware tokens.
  - About 190 use the old fixed palette, including Food Log, Train, Progress and Settings.
- The result is two accent colours (forest and oxblood), two spacing scales and two text greys. A Dark setting turns only half the app dark.
- Six icon-only tabs, plus Roman, Progress and Habits buried in a 22-item "More" list, work against clarity. [Oura cut its tabs from five to three](https://ouraring.com/blog/cs/new-oura-app-experience/), [Headspace uses three](https://blakecrosley.com/guides/design/headspace), and [WHOOP opens on three numbers: "No graphs, no charts, no noise. Just the answer."](https://www.925studios.co/blog/whoop-design-breakdown)
- The brand is right. Consistency, legibility and a few moments of colour and celebration are what is missing.

## (b) Top 10 improvements, ranked by visible impact per hour

All ten are T1 or T2 and need no new dependency or backend change. All work against the current production backend. "Today" means it fits a PR under 400 lines and is safe to ship in today's APK.

| # | Screen | What a client sees today (file:line) | World class | Concrete change | Est. lines | Tier | Today |
|---|---|---|---|---|---|---|---|
| 1 | Every legacy screen (Food Log, search, Train, live workout, Settings) | Secondary text uses stone `#B1A89F` (`src/constants/colors.ts:23`, and the default `Typography.body` colour at `src/theme/index.ts:119`): 2.05:1 on bone and 1.92:1 on cream. That is about 700 call sites. | [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/typography): text must stay legible. WCAG AA needs 4.5:1. | Set `Colors.textMuted` to `#6B675F`, the value already AA-verified in `lightTokens.textMuted` (4.6-4.9:1). Keep stone only for hairlines. Update the 12 test files that assert `#B1A89F`. | ~1 source + ~30 test | T1 | Yes |
| 2 | Settings > Appearance; whole app | Picking "Dark" (`src/screens/client/SettingsScreen.tsx:288-311`) turns Home, the tab bar and the assigned-workout page dark. Food Log, Train, live workout, Progress, Roman chat and Settings itself stay bone, because `useTheme().colors` is never mode-aware (`src/theme/ThemeProvider.tsx:59-64,113`). "System" is always light because `app.json:21` sets `userInterfaceStyle: "light"`. | One coherent appearance | For launch, remove the Appearance row and pin `colorScheme` to light in `ThemeProvider`. Bring Dark back once the legacy screens move to semantic tokens. | ~25 | T1 | Yes |
| 3 | Habits and check-in (mood) | Each mood button shows a 22 pt lowercase word in the old emoji slot over a 10 pt label: "low/Awful", "off/Bad", "flat/Okay", "good/Good", "strong/Great" (`src/screens/client/habits/constants.ts:5`, `MoodEnergyPicker.tsx:43`) | One clear scale, one label | Replace the word with a 5-step graduated dot (filled forest circles 1-5 or Ionicons `ellipse`). Keep "Awful … Great" at 12 pt. | ~20 | T1 | Yes |
| 4 | Food Log day summary + portion picker | Five equal columns, 16 pt values, 10 pt stone labels; protein in error red `#B91C1C` via `Colors.orange`, carbs gold 2:1, fat lavender (`src/components/log/DailySummaryBar.tsx:37-79,103`; same in `QuantityPickerModal.tsx` preview). Macro colours differ from the macro tokens (`src/constants/colors.ts:52-56`). | MacroFactor and Cronometer: one hero number (calories remaining) plus three thin progress bars against target | Hero "1,240 kcal left" in Cormorant 32. Below it, three bars: Protein forest `#2C4A36`, Carbs `#457B9D`, Fat `#8A6A2A`, each "112 / 160 g" in Inter 13 with tabular figures. Bars animate on change, honouring reduce-motion. Use the same colours in the portion-picker preview. Simple mode shows calories and protein only. | ~160 | T1 | Yes |
| 5 | Home hero | "One workout to go." shows every day, even with nothing assigned (`src/screens/client/HomeScreen.tsx:96-104`). The CTA just says "CONTINUE" (`:428`). "Explore the app →" opens the Food Log (`:431-439`). The macro grid sits below a 96 px gap (`:444`). | [Headspace](https://blakecrosley.com/guides/design/headspace): one recommended action with a clear Start. WHOOP: the answer first. | Build the progress line from the pending assignment the Train tab already loads: "Upper Body A is ready." or "No workout planned today." CTA "Start Upper Body A"; with no workout, "Log a meal". Rename the soft link "Open the food log". Cut the gap to 40 px and reuse the bars from #4 in the grid. | ~90 | T1/T2 | Yes |
| 6 | Train tab | A new client sees, in order: a 0/0/0 stat row, an empty volume chart, an empty muscle chart, then "Quick Workout" (`src/screens/client/WorkoutScreen.tsx:727-795`). The empty routines slot says "Your coach hasn't assigned a workout yet" (`:806`, `src/ui/empty-states/EmptyStateNoWorkouts.tsx:24-25`), even when the coach card above shows an assigned workout. | Strong and Hevy: Start first, history second, charts when data exists | Order: assigned-workout card, Quick Workout, My Routines, Recent, then charts only when `weeklyVolume` has data. Routines empty copy: "No routines yet. Build one with the plus button, or start a quick workout." | ~70 | T1 | Yes |
| 7 | Tab bar | Six icon-only tabs in the clinic build (`src/navigation/ClientNavigator.tsx:671`; Calendar and Community on in `eas.json` clinic), outline icons in both states, "Profile" before Community | [HIG tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars): "Include labels … Use single words whenever possible"; prefer filled icons; fewer tabs | Show labels: Home, Train, Food, Calendar, You, Community. Use the filled Ionicon for the active tab. Move You last. Going from 6 to 5 tabs is an owner decision (see "needs operator"). | ~40 | T1 | Yes |
| 8 | Health and sleep (wearables overview) | Concentric "Move / Exercise / Stand" rings; "Stand" actually shows steps (`src/screens/client/wearables/HealthFitnessScreen.tsx:190-200,226-228`; `cards/ThreeRingHero.tsx:2-9`) | [HIG Activity rings](https://developer.apple.com/design/human-interface-guidelines/activity-rings): "Never show Move, Exercise, and Stand progress in another ring-like element" | Rename to "Active energy / Workout minutes / Steps". Render three labelled horizontal bars, or separated arcs, using the same component as #4. Protects the store submission. | ~70 | T1 | Yes |
| 9 | Food Log, food search, portion picker, Train, live workout | No `fontFamily` in `MealSectionCard`, `DailySummaryBar`, `FoodSearchView`, `QuantityPickerModal`, `WaterTracker`, `DaySelector`, `WorkoutScreen` or `active-workout/styles.ts` (counted per file), and there is no global Text default. These render in SF Pro/Roboto, while Home and Roman use Inter and Cormorant. 63 font sizes of 8-11 pt (for example `WorkoutScreen.tsx:935,950`); timers lack tabular figures. Card hairlines are camel `#B08D57`. | HIG: legible minimum sizes; one type system | Spread `typography.*` tokens: h1 for screen titles, h4 for meal and exercise names, bodySmall for food rows, caption (min 12 pt) for meta. Add `fontVariant: ['tabular-nums']` to the workout timer, rest countdown, kcal and set cells. Swap camel hairlines for `lightTokens.border` `#DCD5CC`. Split into two PRs: food and workout. | ~300 (2 PRs of ~150) | T1 | Yes (two PRs) |
| 10 | Live workout set rows | Inputs show placeholder "0". Last performance is a separate "Last time: 135 lb × 8 reps · Use" row under every set, so one set takes two taps and two rows (`src/screens/client/active-workout/SetLogger.tsx:83,150-167`) | [Hevy](https://www.hevyapp.com/features/track-workouts/) and Strong: a PREVIOUS column and ghost values; one tap on the check logs a repeat | Use last weight and reps as the placeholder. Tapping the check on blank cells adopts the previous values, and haptic plus rest timer fire as today. Drop the extra row but keep its accessibility label on the row. Needs a failing-first test. | ~90 | T2 | Yes |

Next five, after the top ten:
- 11 Rest timer at zero while the phone is locked: schedule an `expo-notifications` local notification when rest starts (already a dependency) and cancel it on Skip or Finish. Turn the bar into a filling progress bar. `ActiveWorkoutScreen.tsx:493-518,1316-1342`. About 110 lines, T2, fits today.
- 12 Exercise card declutter: fold ↑, ↓, Swap, the 60/90/120 rest chips and the trash can into one "More" action sheet, and show the current rest as one chip. `active-workout/ExerciseCard.tsx:57-98`. About 120 lines, T2.
- 13 Workout finish moment: a short summary sheet (duration, sets, volume, "Recent best") with the existing `ParticleBurst` and a Share card. Copy: "Workout saved. 18 sets, 9,450 lb." `WorkoutFinishSummary.tsx`. About 150 lines, T2.
- 14 Roman reach: an avatar button in the Home header for every client (today Roman sits in the 22-item More list, `MoreScreen.tsx:196`), plus three starter chips on the empty chat ("How did this week go?", "What should dinner be?", "Adjust today's workout") that fill the composer. About 80 lines, T2.
- 15 Food multi-add: keep the search sheet open after a successful add, with a toast "Greek yogurt added to Breakfast", and close it on Done. This matches [MacroFactor's speed mode](https://macrofactor.com/fastest-food-logger-2025/). `LogScreen.tsx:309-319`. About 40 lines, T2.

## (c) Brand feel direction: health and mental clarity, same brand
- **Palette.** Keep bone `#F5EFE4`, ink `#1A1A18` and forest `#2C4A36`.
  - Make forest the one accent for action and progress everywhere.
  - Keep oxblood `#4A0404` for money and earnings, as `constants/colors.ts` already intends. Today `lightTokens.accent` is oxblood and leaks into about 266 client health surfaces.
  - Get vibrancy from progress fills, not new hues: forest bars on a `#E0EBE4` track, the existing data trio (protein forest, carbs `#457B9D`, fat `#8A6A2A`), and gold `#F8F0DC` washes only for achievement moments.
  - Secondary text: `#6B675F`. Hairlines: `#DCD5CC`.
- **Type.** Use one Cormorant headline per screen (date, meal name on its own sheet, workout name, the "kcal left" hero). Everything else is Inter. Minimum 12 pt, meta at 13 pt, and tabular figures for every number that changes. Use sentence case for buttons and labels ("Add food", "Log food", "Add exercise", "Energy level"), not Title Case.
- **Motion and haptics.** Use two speeds:
  - Velvet (the existing 400-800 ms decel) for reveals, sheets and celebrations. Headspace uses 400-600 ms transitions.
  - Crisp (150-200 ms) for logging feedback: set checked, food added, water added. Each pairs with the existing haptic.
  - Progress bars fill on change. Celebration appears once, at workout finish, and honours reduce-motion.
- **Voice.** Short, calm, factual: "A clean slate.", "Upper Body A is ready.", "Rest day.", "Workout saved." No first person, no exclamation marks, no emojis.

## Scope traced
- Theme: `src/theme/tokens.ts`, `src/theme/index.ts`, `src/theme/ThemeProvider.tsx`, `src/constants/colors.ts`, `app.json`, `eas.json` (clinic flags).
- Shell: `src/navigation/ClientNavigator.tsx` (tabs), `src/screens/client/MoreScreen.tsx`.
- Food: `LogScreen.tsx`, `components/log/{DailySummaryBar,MealSectionCard,FoodSearchModal,FoodSearchView,QuantityPickerModal}.tsx`, `components/{WaterTracker,DaySelector}.tsx`, `utils/log/types.ts`.
- Workout: `WorkoutScreen.tsx`, `WorkoutAssignmentDetailScreen.tsx`, `ActiveWorkoutScreen.tsx`, `active-workout/{ExerciseCard,SetLogger,WorkoutFinishSummary,styles}.ts(x)`, `ui/empty-states/*`.
- Other client screens: `HomeScreen.tsx`, `components/home/*`, `screens/roman/RomanChatScreen.tsx`, `components/roman/{RomanGreeting,RomanWorkoutCompleteCard}.tsx`, `habits/{MoodEnergyPicker,constants}.ts(x)`, `ProgressScreen.tsx`, `day-one/*`, `Day1WinScreen.tsx`, `wearables/HealthFitnessScreen.tsx`, `SettingsScreen.tsx`.
- Checks: contrast ratios computed with the WCAG 2.1 formula. Haptics present on tab press, food logged, set done and rest end. Reduce-motion is handled in 45 files. No `allowFontScaling={false}`, so Dynamic Type is not blocked.
- Benchmarks: [MacroFactor](https://macrofactor.com/fastest-food-logger-2025/), [Cronometer](https://fortune.com/article/cronometer-review/), [MyFitnessPal Premium](https://www.myfitnesspal.com/premium), [Strong](https://www.strong.app/love), [Hevy](https://www.hevyapp.com/features/track-workouts/), [Hevy Live Activity](https://www.hevyapp.com/features/live-activity/), [Apple HIG tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Apple HIG Activity rings](https://developer.apple.com/design/human-interface-guidelines/activity-rings), [Oura redesign](https://ouraring.com/blog/cs/new-oura-app-experience/), [WHOOP design breakdown](https://www.925studios.co/blog/whoop-design-breakdown), [Headspace design guide](https://blakecrosley.com/guides/design/headspace). Raw results: `ops/reports/DESIGN-AUD-127-assets/benchmark_*.json`.

## B list
- None. No design finding meets SoT A2 item 1. Nothing here moves money, exposes data, misses safety routing, loses data or dead-ends a core flow. App Store risk items are listed under "Not fixed".

## U list
- U1 Low-contrast secondary text (stone `#B1A89F`, 1.9-2.1:1) across about 700 call sites: `src/constants/colors.ts:23`, `src/theme/index.ts:119`. Top-10 #1.
- U2 Dark appearance applies to half the app, and "System" is always light: `SettingsScreen.tsx:288-311`, `ThemeProvider.tsx:59-64,113`, `app.json:21`. Top-10 #2.
- U3 Mood check-in shows two different words per button: `habits/constants.ts:5`, `MoodEnergyPicker.tsx:43`. Top-10 #3.
- U4 Day summary: protein in error red, carbs at 2:1, 10 pt labels, macro colours inconsistent with the macro tokens: `DailySummaryBar.tsx:52,62,70,103`. Top-10 #4.
- U5 Home claims "One workout to go." on days with no workout; "Explore the app" opens the Food Log: `HomeScreen.tsx:103,431-439`. Top-10 #5.
- U6 The routines empty state blames the coach even when the coach has assigned a workout: `EmptyStateNoWorkouts.tsx:24-25` via `WorkoutScreen.tsx:806`. Top-10 #6.
- U7 Six unlabelled tabs: `ClientNavigator.tsx:671`. Top-10 #7.
- U8 Activity-ring lookalike with "Stand" showing steps: `HealthFitnessScreen.tsx:190-200`. Top-10 #8.
- U9 System font and sub-11 pt text on the core logging screens: see top-10 #9.
- U10 First person in product copy, "That chart did not load. I will try again.": `ProgressScreen.tsx:659`. Fix: "That chart did not load. Pull down to try again." (2 lines, T1.)
- U11 Water units disagree: Home shows litres (`HomeScreen.tsx:216`), the Food Log shows ounces (`WaterTracker.tsx:34`). Fix: show "oz" on Home to match the log and the 100 oz goal (2 lines, T1).
- U12 Rest timer is silent when the phone is locked: `ActiveWorkoutScreen.tsx:493-502`. Next-five #11.
- U13 No workout finish moment: `WorkoutFinishSummary.tsx`. Next-five #13.
- U14 The food sheet closes after every add and waits on save plus a full day reload: `LogScreen.tsx:309-319`. Next-five #15.
- U15 Roman is buried for coached clients and the chat has no starter prompts: `MoreScreen.tsx:196`, `RomanGreeting.tsx`. Next-five #14.
- U16 Home header icon sizes differ, chat 18 pt next to bell 24 pt: `components/home/HomeHeaderActions.tsx:105,119`. Fix: both 22 (2 lines).
- U17 Title Case buttons ("Add Food", "Log Food", "Retry Search", "Add Exercise", "Energy Level") against sentence case elsewhere, and "Retry Search" is a 999-radius pill against the radius rule: `MealSectionCard.tsx`, `QuantityPickerModal.tsx`, `FoodSearchView.tsx` empty state, `ActiveWorkoutScreen.tsx:1206`. Fix in the #9 type pass.

## C one-liners
- Barcode scanner, photo logging and quick-add calories need `expo-camera`, a new dependency that is barred today. Recommend making them the first v1.1 food item.
- Live Activity or lock-screen rest timer needs native widget work; defer.
- Weights are lbs only; the unit toggle was removed from Settings. Fine for launch.
- Two design systems (legacy `Colors`/`Spacing` with lg=24 against tokens `spacing` with lg=16) are tech debt behind U1, U2 and U9; migrate screen by screen after launch.
- Grocery List and Shopping List are both in More, and Community is both a tab and a More row: tidy the More list later.
- "Your programme starts here." uses UK spelling in an otherwise US app: `Day1WinScreen.tsx:243`.

## PRs opened
- None (read-only audit by mandate).

## Not fixed (needs operator)
1. **WITHDRAWN 10:25 PDT (owner: the Roman art is original design and stays as is).** ~~Roman portrait likeness (owner decision, before App Store screenshots).~~ The painted Roman avatar and hero (`assets/roman/neutral*.png`, `hero.jpg`, `portrait.jpg`, `welcome.jpg`) closely resemble a well-known living film actor. [App Review 5.2.1](https://developer.apple.com/app-store/review/guidelines/) bars protected third-party material and misleading or copycat representations, and right-of-publicity law can apply. Recommended default: have the owner confirm the art is original and commissioned. If there is any doubt, regenerate a clearly original face before SHOTS-127 captures Roman (screenshot 16).
2. **Six tabs to five (owner decision).** Recommended default: ship labels now with six tabs (top-10 #7). After launch, fold Calendar into Home ("Next session" card) and Train.
3. **Dark mode for launch (operator).** Recommended default: hide it (top-10 #2). The full fix migrates about 190 legacy-palette files.
4. **Health rings HIG (operator, before submission).** Recommended default: ship top-10 #8 in today's APK, because a HealthKit app gets closer review.
5. **Barcode scanner (owner decision on a new dependency).** Recommended default: v1.1, the first food-logging item.
6. **Suggested PR grouping for today's APK, each under 400 lines, T1 unless noted:**
   - PR-A: #1 + #2 + #3 + U10 + U11 + U16 (legibility, appearance and copy; ~110 lines).
   - PR-B: #4 + #8 (progress bars component used by the Food Log, portion picker and Health; ~230).
   - PR-C: #5 + #6 (Home and Train hierarchy and copy; ~160).
   - PR-D: #7 (tab labels; ~40).
   - PR-E1/E2: #9 (type pass, food and workout; ~150 each).
   - PR-F: #10 + #11 (set ghost values and rest notification; T2; ~200).

## HANDOFF
- State: audit complete; this file is final for 10-07 morning. No branches, worktrees or PRs were created. A contact sheet and the benchmark JSON are in `ops/reports/DESIGN-AUD-127-assets/`.
- When SHOTS-127 artifacts land (`tgp-appstore-6.9-*`, `tgp-appstore-6.5-*`), view 10-client-home, 12-client-live-workout, 13-client-food-macros and 16-client-roman. Confirm U1 (grey meta text), U4 (red protein), U9 (system font) and the Roman likeness question against real pixels, and update the scores if they differ.
- A fresh builder can take any PR-A … PR-F row directly. Every file:line above is against mobile main `5e3e9398`, so re-check the lines if main has moved. PR-A also needs 12 test files updated where they assert `#B1A89F` (list: `rg -l "B1A89F" src --glob '**/__tests__/**'`).

---

# Part 2 (owner follow-up 10:20, 10:22 and 10:25 PDT, 10-07)

Started 10:20 PDT; written 10:37–10:55 PDT (times from `TZ=America/Los_Angeles date`). Read-only. Mobile main moved from `5e3e9398` to **`f71b425e`** (m#455 food-log polish merged), and every file:line below was re-checked on `f71b425e`. Context repo main `cee820eb`.

**Evidence used**
- The A23 future job: `roadmap/specs/A23-mobile-luxury-overhaul.md`, the backlog entry in `roadmap/NEW_A_ITEMS_BACKLOG.md`, and `plans/POST_H_LADDER.md` §6 (Stillwater T5.A–T5.D).
- `design-targets/mobile/CATALOG.md`, `plan/README.md` and `coach-workout-builder/README.md`.
- **All 13 images, each viewed:** plan as-is, plan luxury, plan full week, progress details, AI guide, drafts queue, coach workout builder, coach home (head coach), coach home (solo), client file workouts, team breakdown, earnings detail, earnings detail v2.
- `quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` Parts IV–V in full, and the plaintext full version: §4.3 table, §4.5 table, §5.4 domain matrix, Part VII.
  - This guide is a psychology, cognitive-load and habit manual. It has **no dedicated typography, colour or spacing chapters**. Its usable rules are §4.2 (cognitive-load audit), §4.3 (max 5 tabs, 3–5 form fields per screen), §4.4 (≤3 visible actions ideal, smart defaults), §4.5 (progressive disclosure, empty-state education), §4.6 (pre-fill previous data), §4.7 (consistency library), §5.1 step 6 (300 ms completion confirmation), §5.5 (anti-patterns) and Part VII Layer 2 ("during the core behaviour the app disappears").
  - `design/MOBILE_APP_DESIGN_INTELLIGENCE_2026-05-30.txt` and `quality-references/MOBILE_DESIGN_DOC_UPLOADED_2026-06-16.txt` are byte-identical (`diff -q`).
- Mobile `docs/QUIET_LUXURY_DOCTRINE.md` and `src/__tests__/quietLuxuryDoctrine.test.ts` (shipped doctrine; it wins over targets where they clash).

**Stillwater primitives on mobile main `f71b425e`**
- `CompletionMoment`, `useHaptic`, `useSpring`, `QuietSkeleton`, `CalmError`, a `stillwater` meta export and a token-discipline lint do **not exist**. `rg` finds them only in README prose.
- Closest existing pieces:
  - `HapticPressable` and `src/ui/haptics/haptics.service`
  - `SkeletonScreen` (`src/ui/skeletons`)
  - `CoachErrorState`
  - `FadeInView`
  - `copyVoice.guard.test.ts` (first person and "!")
  - `quietLuxuryDoctrine.test.ts` (weights 700/800, "Coming Soon", TODO, confetti, flame/trophy)
  - `scopedTokenGate.test.ts` (hex ban plus AA, but only for 13 payment files)
- ESLint is permissive (`.eslintrc.js`: only `no-explicit-any` is an error).

**SHOTS-127:** no screenshots yet.
- Run 37654776791 was still `in_progress` at 10:32 PDT.
- `ops/evidence/SHOTS-127/` holds only a log of the failed run 37653158779.
- Signed-in captures wait for SEED-127 (`ops/reports/SHOTS-127.md`).
- This part is therefore a code-level review plus the target images.

**Corrections to part 1**
- **Top-10 #13 is withdrawn as written.** QUIET_LUXURY_DOCTRINE §3: "Confetti, particle bursts, scale/spring 'pop in' animations, and full-screen celebration overlays are gone. They will not return." The finish moment is now a single fade, a success haptic and a quiet summary (DES-R below).
- **Needs-operator item 1 (Roman likeness) is withdrawn.** Owner 10:25: the art is original design and stays as is.
- **My (c) "velvet 400–800 ms" motion is withdrawn.** See the conflicts table.
- **My data-trio colours for macros (blue and brown) are withdrawn.** Protein, carbs and fat go monochrome, per the catalog.

---

## (e) Verdict on the A23 targets (owner-facing, plain words)

**Honest opinion: yes, I like the A23 targets better than my section (c) direction, for layout, hierarchy and voice.** They do what the app most lacks:
- Each screen answers one question.
- Sentences replace labels.
- Thin lines replace boxed cards.
- One green action per screen.
- No coloured chips.
- Fewer numbers, and the numbers that remain are big and calm.

Put the "plan as-is" picture next to "plan luxury": today's build has red, ochre and lavender macro squares and a labelled tab bar, and the target replaces them with three serif numbers and a timeline. That is exactly the "noisy" problem I scored 6/10.

**Where my (c) is still right, and the plan keeps it:** comfort details the pictures do not show.
- Grey text dark enough to read (AA contrast).
- Labels at least 13 pt.
- Last session's numbers pre-filled in the set rows.
- Words under the tab icons.
- Big tap targets.

**The merged direction is "A23 layout + (c) comfort rules"**, inside the existing brand (no rebrand).

| Conflict | Pick | Why, in plain words |
|---|---|---|
| Accent: catalog "≈#1F3A1F deep sage" vs forest #2C4A36 | **Keep forest #2C4A36** | I measured the green in the target pictures: the buttons and bars are #24462B–#2C4331, which is the forest the app already ships, not darker. #2C4A36 reads at 8.6:1 on bone. Changing it buys nothing and touches about 700 places. Treat "accent.sage" as a name for forest. |
| Background: catalog "parchment" vs plan README "near-white, not beige paper" vs shipped bone #F5EFE4 | **Keep bone #F5EFE4 as the page; stop filling cards with cream** | The pictures measure #F4F1EA–#F8F7F2, a touch lighter than bone. Most of the "lighter" feel comes from having no cream boxes. Bone also matches the splash and icon, so changing the page colour is a brand change. Remove the boxes instead. |
| Serif display vs sans | **Cormorant for titles, hero numbers and one-line summaries; Inter for everything you read while logging (food names, inputs, set rows, labels)** | Serif makes it feel expensive. Sans makes typing and scanning numbers comfortable in a gym or kitchen. The pictures do the same: serif headlines, sans supporting lines. |
| Tab bar: catalog "outline glyphs only, no labels, max 5" | **Outline glyphs (catalog) WITH short labels, and five tabs** | Words under icons help people find things faster; Apple's tab-bar guidance recommends them. Five is the catalog's cap and the guide's (§4.3). Labels can be quiet (Inter 11 pt, muted until active). |
| Motion: A23 "≤300 ms" vs doctrine `motion.duration.base = 400` vs my 400–800 ms | **≤300 ms for anything the user waits on (taps, ticks, bar fills, sheets); keep the existing 400 ms only for non-blocking fades** | Logging should feel instant. Slow, pretty motion gets annoying by the tenth set. |
| Macro colours: my coloured bars vs catalog "no category-coded chips" | **Monochrome: all three bars forest on a hairline track, told apart by label and order** | Calmer and more luxurious. Protein never shows in error red. "Over target" is said in words ("12 g over"), not with red. |
| Builder target shows an **oxblood** "Create plan" button; every other target uses green | **Green (forest) for the one primary action everywhere** | The catalog itself says one accent. Today the newer screens use oxblood as `sc.accent` (tokens.ts:380) and the older ones use forest. Flip the token in one small PR after today's APK, once screenshots exist (owner choice below). |
| Targets show food photos and line-illustration exercise thumbnails | **Not now** | They need a licensed image source or commissioned art (owner choice below). Typography alone carries the look. |
| Celebrations: guide §5.5 "every major completion gets a celebration" vs doctrine §3 "no particle bursts, no pop-in" | **Doctrine wins: single fade ≤300 ms + success haptic + a quiet sentence of real numbers** | That is the luxury version of a celebration, and the doctrine test pins it. |

**Two catalog slips not to copy:** "This weeks plan" (missing apostrophe) on the full-week picture, and the oxblood button above. All names and figures in the pictures are fictional placeholders. Builders must show only the user's real data (see the truthful-copy rule).

---

## (d) Makeover plan

### (d)A The six acceptance rules (owner 10:35, BINDING; verbatim at the top of every DES job)

Owner 10:35 10-07, verbatim: "we need all hands on deck for the mobile screen redo - HONEST COPY, NO DEAD BUTTONS, LUXURIOUS SIMPLE FEELING, ALL IMPORTANT INFO PRESENT, MENTALLY DELOADING, WIHTOUT CUTTING MOBILE PATHWAYS OR LOOSING FUNCTIONALITY! DO YOU UNDERSTAND?"

1. **Honest copy** (real data or neutral).
2. **No dead buttons** (every tappable thing does something real; anything that cannot work is removed or wired).
3. **Luxurious, simple feeling** (A23 targets + design guide).
4. **All important info present** (nothing a client or coach needs is removed or hidden behind more taps).
5. **Mentally deloading** (fewer competing elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail).
6. **No navigation path or function is cut** (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and after and proves parity in tests).

**How I applied them to this plan**
- Where rule 4 or 6 clashes with rule 5, rules 4 and 6 win. Simplification means quieter styling, better order and grouping. It never means fewer actions, fewer facts or extra taps for things people use.
- Changes made to my earlier drafts:
  - Exercise-card actions stay one tap away (DES-X is styling only).
  - Home keeps every number cell it shows today (DES-K).
  - Train charts move lower instead of disappearing (sweep #18).
  - The Progress streak share stays, with an honest label (sweep #21).
  - Report advice is labelled "General guidance" instead of being removed (sweep #23).
  - The push card stays for coachless clients with honest copy (sweep #11).
  - The "Previous" values stay visible in a column (DES-W).
  - Six-to-five tabs needs an explicit owner yes, because it adds a tap (DES-N). Settings is grouped on one screen, with no drill-down (DES-S).
- Elements are removed only when they are false (rule 1) or dead (rule 2): the "Day 7 of 30." line, banners that promise a coach who does not exist, and "coming soon" controls that do nothing. Each removal is listed in the PR's parity table.

### (d)0 TRUTHFUL COPY rule (first-class; applies to every client and coach screen)

**Rule.** Every line of product copy either (a) states something true from this user's real data at this moment, or (b) is neutral or instructional (what this is, what tapping does).
- Never invent counts, streaks, goals, schedules, praise or promises.
- Never assume data the user may not have: an assigned workout, a coach, a plan, history, a notification permission, or a feature being switched on.
- When the truth depends on state, write a variant for each state and test each one.
- When there is nothing true to say, show nothing; do not fill the space.
- Product copy rules still apply: no first person (Roman's own "I" is the one exception, see the owner choices), no exclamation marks, no emojis, no generic errors.
- **Guard:** DES-V extends the existing doctrine tests with:
  - a case-insensitive "coming soon" check (the current regex is case-sensitive, which is why the two coach strings below slipped through);
  - a retired-lines list that fails the build if any made-up line below returns.

**Sweep: made-up lines found on main `f71b425e`** (job: T = DES-T-127, V = DES-V-127, H = DES-H-127)

| # | file:line | What it says | What is actually true | Replacement (state-driven) | Job |
|---|---|---|---|---|---|
| 1 | `screens/client/HomeScreen.tsx:103` (`buildProgressLine`) | "One workout to go." every day a workout is not logged | Home never checks whether a workout is assigned for today. A rest day, a coachless client or a new client all see it. | Pending coach assignment not done: "<plan name> is ready." In-progress session: "A workout is in progress." Done today: "Workout complete." Otherwise drop the workout clause and show only the meal clause. Reuse the pending-assignment read m#456 adds. | T |
| 2 | `HomeScreen.tsx:424-428` | CTA "CONTINUE", hint "Opens your workout tracker" | It opens Train, whatever the state | Label names the destination: "Start <plan name>", "Resume workout" or "Open Train". | T |
| 3 | `HomeScreen.tsx:435-439` | "Explore the app →" | It opens the Food Log | "Log a meal →" | T |
| 4 | `HomeScreen.tsx:377` | "Add <missing> so your plan reflects you." | Many clients have no plan | Coach plan present: keep. Otherwise "Add <missing> to set daily targets." | T |
| 5 | `HomeScreen.tsx:216` | Water "0.0L" | The Log shows oz (`components/WaterTracker.tsx`), so the two screens disagree | Same unit as the Log: "<n> oz"; "0 oz" before any log | T |
| 6 | `components/home/CoachIntroductionBanner.tsx:76` | "Your coach will assign your first workout. For now, explore the app." | Shown when the account has **no coach** (`!coachId`, :150-152) | Render nothing. `CoachlessHomeSlot` already offers the coach code. | T |
| 7 | `CoachIntroductionBanner.tsx:166` | "Your coach will assign your first workout soon." | Shown when the coach lookup returns 404 (no coach record found) | Render nothing (no claim) | T |
| 8 | `components/home/HolisticInsightsTile.tsx:159` | "Your finance pillar is not connected yet." | This client app has no finance pillar | Hide the tile unless `status === 'ok'` with ≥1 insight | T |
| 9 | `HolisticInsightsTile.tsx:160` | "Keep logging — patterns will appear here as they emerge." | A promise, plus an em-dash (doctrine §4) | Hide (as #8) | T |
| 10 | `HolisticInsightsTile.tsx:57-60` | "Insights are temporarily unavailable." | "Temporarily" is a guess | Hide on error (non-essential tile) | T |
| 11 | `components/home/PushPermissionCard.tsx:31` | "…messages and plan updates from your coach." | Shown to coachless clients too | Coach linked: keep. Coachless: keep the card and its "Turn on notifications" action (rule 6), but name only alerts this client can actually receive (builder confirms in code), e.g. "Turn on notifications for reminders and account messages." | T |
| 12 | `components/tutorial/TutorialHomeSlot.tsx:43-60` | "Message your coach" row; "C" initial when no coach | No coach may exist | Show the row only when a coach is linked: with no coach it opens a thread that cannot exist (rule 2). Messages stays reachable from its tab and More (rule 6; prove it in a test). | T |
| 13 | `components/roman/romanVoice.ts:72,74` | "Everything is in order." | No check is performed | "Welcome back, <name>. Where shall we begin?"; nameless: "Good day. Where shall we begin?" | T |
| 14 | `romanVoice.ts:64-66` (coach) | "Good morning, <name>." at any hour | Time of day is ignored | Device-clock variant: morning before 12:00, afternoon before 17:00, evening after | T |
| 15 | `romanVoice.ts:58` (first open) | "I will be looking after things here. Whenever you need me, I am present." | Roman answers only when asked; he does not watch the account | "Good day. My name is Roman. Ask about training, food or recovery at any time." (owner choice, identity-spec line) | T |
| 16 | `ui/empty-states/EmptyStateNoWorkouts.tsx:24-25` (used under "My Routines", `WorkoutScreen.tsx:806`) | "No workouts yet. Your coach hasn't assigned a workout yet. Check back after your next session." | Routines are the client's own (the + opens RoutineBuilder). It assumes a coach and a "next session". | Headline "No routines yet"; body "Save a set of exercises as a routine to start it in one tap."; text link "Create a routine" | V |
| 17 | `WorkoutScreen.tsx:727-740` | Stats "This Week 0 · Routines 0 · From coach 0" first on a new client's screen | "From coach" implies a coach | Hide the row until ≥1 workout exists; drop "From coach" when no coach is linked | V |
| 18 | `WorkoutScreen.tsx:743-795` | Two empty charts ("Complete workouts to see volume data") above Quick Workout | True, but the first-day screen leads with emptiness | Order: assigned workout (if any), Quick Workout, routines, history, then the two charts (moved down, not removed; each empty chart collapses to its one-line empty sentence). | V |
| 19 | `screens/client/ProfileScreen.tsx:131` | "Day 7 of 30." | **Hard-coded for every client** | Remove | V |
| 20 | `ProfileScreen.tsx:135` | "Workouts and meals stay private to you and your assigned coach." | Coachless clients have no coach. Client sharing choices (m#451/#458) may change who sees what. | Coach linked: "Workouts and meals are visible to you and <coach name>." No coach: "Workouts and meals are visible only to you." Match whatever sharing setting is on main. | V |
| 21 | `screens/client/ProgressScreen.tsx:473-475` | "Day <n>" in the header, and "Day Streak" on the share card (:487) | The count is **consecutive days with a weigh-in**, looked back at most 60 days (:~300-312). "Day <n>" does not say what is counted. The file's own comment (:510-518) calls the count non-authoritative. | Keep both the number and the share button (:479-495) (rules 4 and 6), and say what it counts: "<n> days in a row with a weigh-in"; at the 60-day look-back limit, "60+ days in a row with a weigh-in". Same wording on the share card. Test a gap day, today not yet logged, and the 60-day edge. | V |
| 22 | `ProgressScreen.tsx:659` | "That chart did not load. I will try again." | First person, and it does not retry by itself | "The weight chart did not load. Pull down to try again." | V |
| 23 | `screens/client/ReportScreen.tsx:182-185` | Canned advice per goal ("Prioritize compound movements and HIIT cardio", "Rest days are growth days — sleep 7-9 hours") inside the client's report | Generic, not from this client's data or coach, and may contradict the coach's plan | Keep it (rule 4), under a plain heading "General guidance for <goal label>" so it does not read as personal analysis. Remove the em-dash. | V |
| 24 | `ReportScreen.tsx:193` | "Consistency beats perfection. Keep showing up." | Slogan | Remove | V |
| 25 | `screens/day-one/i18n/en.json:20` | "Your coaching journey starts now. Let's set you up in under 60 seconds." | "Let's" is first person. 60 s is not measured. It assumes a coach. | "Setup takes <n> short steps." (n from `Day1OnboardingNavigator`) | V |
| 26 | `en.json:39` | "Couldn't reach our servers." | First person plural | "Couldn't connect. Check the connection and try again." | V |
| 27 | `en.json:59-60` | "Stay close to your coach" / "…session reminders and progress milestones." | The client may have skipped pairing; milestone pushes may not exist | Paired: keep the title. Not paired: "Reminders and messages". List only alert types that exist in code. | V |
| 28 | `en.json:72` | "Mornings work best for most." | Unsupported claim | Remove the sentence | V |
| 29 | `en.json:29,30,85` | "Pair with my coach", "I don't have a code yet", "Open my dashboard" | First person | "Pair with coach", "Continue without a code", "Open Home" | V |
| 30 | `screens/client/wearables/onDeviceCopy.ts:217,404` | "…isn't switched on yet. Your coach will let you know when it is ready." | Coaches do not control feature switches | "Health data import is not available in this version." / "Connecting <name> is not available in this version." | V |
| 31 | `screens/client/PurchaseUnpackScreen.tsx:321-324` | "Your coach is setting things up" / "You'll get a notification each time." | Unknown activity; push may be off | "Nothing released yet." / "Items appear here when <coach name> releases them." Mention notifications only if push permission is granted. | V |
| 32 | `screens/client/MembershipScreen.tsx:140` | "Your coach will activate access once your invite is attached." | A promise about the coach | "Access starts when a coach invite is attached to this account." | V |
| 33 | `screens/client/CheckoutReturnScreen.tsx:100,362-363,395-396` | "Backend not configured — your coach will need to confirm payment manually."; "…your coach has been notified and will be in touch shortly." | The first is a developer string. The second is a promise. | Remove the developer string from the user path. Keep "has been notified" only if backend main sends that notification (verify), and drop "will be in touch shortly". | V |
| 34 | `screens/client/PrivateCommunityHubScreen.tsx:135,158` | "Your coach will invite you to a private room…"; label "Voice notes coming soon — will be reviewed…" | Assumes a coach; placeholder (doctrine §2) | "Private rooms appear here after an invitation. No one is added without one."; remove the coming-soon label and its control | V |
| 35 | `screens/coach/payments/CoachPackageEditScreen.tsx:924,932` | "Share links are coming soon" | Placeholder (doctrine §2); escapes the case-sensitive test | Remove the row | V |
| 36 | `screens/coach/payments/CoachPackagesListScreen.tsx:51-52` | "Packages coming soon" / "…not enabled in this environment yet." | Placeholder | "Packages are not available in this version." | V |
| 37 | `components/coach/ExtensionPairingPanel.tsx:338` | "…Please check back soon." | A promise | "Data import is not enabled on this account." | V |
| 38 | `screens/client/wearables/HealthFitnessScreen.tsx:71-75,185-201` | Rings filled against **invented goals** (500 kcal, 30 min, 10,000 steps); steps labelled "Stand"; the last sample shown as "today" even when it is days old | Neither the user nor the coach set these goals; steps are not "Stand"; the sample date is ignored | Dated real values ("Steps · Tue 6 Oct · 7,412"). No goal fill unless a real target exists. True metric names. Bars, not rings. | H |
| 39 | `utils/notifications.ts:104-105` | "Fast Complete / Fasting goal reached." scheduled for the planned end time | False if the fast ended early and the alert was not cancelled | Verify that FastingScreen cancels it when a fast ends early; if not, cancel it. Copy "Fasting window ended." | V |
| 40 | `utils/notifications.ts:68-69,132-133,149-150` | "Stay on track with your water goals…", "…hit your goals.", generic motivation | No call sites on main (not shown today) | C (edge, deferred to 10k clients): rewrite before anyone wires them | — |

Food Log copy (`LogScreen.tsx`, `MealSectionCard.tsx`, `DailySummaryBar.tsx`) passed the sweep: every line there is factual or instructional. Only Title Case remains ("Missing Info" :333, "Delete Food" :473; DES-L).

### (d)1 Page-by-page plan (food and workout first)

Images refer to `design-targets/mobile/`. "Guide" means `MOBILE_APP_DESIGN_INTELLIGENCE.md`. Line counts include tests.

| Order | Page | What changes | Follows | Est. lines | Tier | Job |
|---|---|---|---|---|---|---|
| 1 | Food Log: day summary | Calories-left hero in Cormorant tabular numerals, one muted line "of 2,100 · 1,240 eaten". Three monochrome forest bars (Protein, Carbs, Fat) on a hairline track. No red, gold or lavender; "12 g over" in words. Labels Inter 13 pt. Fills animate ≤300 ms, reduce-motion honoured. | plan_luxury (3 numbers, serif figures), CATALOG "no category-coded chips", plan README rubric §4; guide §4.2 | ~170 | T1 | DES-F |
| 2 | Food Log: meals, search, portion, water, day strip | Hairline rows instead of cards; Inter everywhere (system font today); names 15 pt, meta 13 pt `sc.textMuted`. Day strip marks today with a forest dot, past plain, future muted. Portion preview monochrome (protein not error red, `QuantityPickerModal.tsx:94`). "Retry Search" becomes "Try again". Targets ≥44 pt. | plan-fullweek (day overline, today dot, hairlines), CATALOG TemporalState; guide §4.7 | ~210 | T1 | DES-F |
| 3 | Food Log: add several foods | The sheet stays open after an add, with "Added <food>. Add another or Done.". Sentence-case alerts. | guide §4.4 smart defaults, §4.6; MacroFactor speed benchmark (part 1) | ~130 | T2 | DES-L |
| 4 | Live workout: set rows | Last session's weight and reps appear as ghost values in the inputs; ticking a blank row logs them; typed values override. The separate "Last time" text line (`SetLogger.tsx:165`) becomes a compact "Previous" cell in the same row, so the value stays visible after typing (rule 4) and each row loses a line. The inline "Use" action stays, as tap-to-fill (rule 6). Tabular digits, Inter, labels ≥13 pt, tick target ≥44 pt, hairlines `sc.border` instead of camel. | plan README "What is the current set?"; guide §4.6 pre-fill, Part VII Layer 2 | ~270 | T2 | DES-W |
| 5 | Live workout: rest and finish | Rest end fires a local notification in the background, only if permission is already granted; cancelled on resume, skip or finish. Finish: one ≤300 ms fade, success haptic, at most 3 serif numbers (time, sets, volume) plus a PR sentence only when a real PR exists. No particles. | guide §5.1 step 6, §5.5 AP-4; doctrine §3 | ~300 | T2 | DES-R |
| 6 | Live workout: exercise card | Styling only: icon buttons become quiet text or outline icons in one row, with the same actions, the same tap count and the same order (rules 4 and 6; part-1 "More sheet" idea dropped). | guide §4.7 consistency; doctrine §5 | ~120 | T1 | DES-X |
| 7 | Train tab, first day | Truthful order and calm empty states (sweep #16-18) | plan README; guide §4.8 "one thing" test | in DES-V | T2 | DES-V |
| 8 | Home: truth | Sweep #1-15 | (d)0 | ~330 | T2 | DES-T |
| 9 | Home: layout | Overline date; serif headline = the truthful line; one forest primary action; **every number cell `homeCells()` returns today** (simple: calories, protein, water; full: protein, carbs, fat, water) in one hairline row of serif tabular numerals (rule 4); the 96 px gap removed (`HomeScreen.tsx:444`); cards become hairline sections; Roman as a small header avatar that opens chat (part 1 #14), not a FAB. | plan_luxury, coach-home-solo (structure only), plan README "What is the one thing I should do right now?"; guide §4.4 | ~300 | T1 | DES-K |
| 10 | Roman chat | Roman's text in Cormorant 19-20 pt; small-caps "YOU" and "ROMAN" labels instead of bubbles; suggestions as text links; hairline input with a square forest send button | ai-guide/luxury | ~300 | T1 | DES-M |
| 11 | Progress: truth | Sweep #21-22 | (d)0 | in DES-V | T2 | DES-V |
| 12 | Progress: layout | "The full picture" structure: BODY numbers in serif with hairline separators; workout volume as a sentence ("<n> sets this week") only from real data; PR table with dates; text-link actions | progress-details/luxury | ~350 | T1 | DES-P |
| 13 | Health | Sweep #38; three labelled bars (shared component from DES-F); dated values | HIG activity rings (part 1); CATALOG | ~250 | T2 | DES-H |
| 14 | Settings | Appearance shows Light/System only (DES-A). Later the 795-line screen is grouped into 5-7 titled sections on the same screen; no drill-down, because that would add taps (rule 4). | guide §4.3 "5-7 sections"; Stillwater T2.3 | ~40 now, ~500 later | T1 / T2 | DES-A / DES-S |
| 15 | Tab bar | Outline glyphs with labels (DES-A); six tabs to five only on an explicit owner yes, because it adds a tap to whichever tab moves (rules 4 and 6) (DES-N) | CATALOG tab rule + HIG; guide §4.3 | ~40 / ~120 | T1 / T2 | DES-A / DES-N |
| 16 | Coach copy | Sweep #35-37 and #14 | (d)0 | in DES-V/T | T2 | DES-V/T |
| 17 | Coach home | Sentence hero from real alert counts ("<n> need you. <m> are steady.") only when counts exist; one real metric hero; hairline client rows with one-line reasons; text links | coach-home-solo, coach-home-headcoach | ~350 | T2 | DES-O |
| 18 | Coach client file, Workouts tab | Text tabs (no pills); "<x> of <y> workouts done this week" only when y is known; tick, dash and missed glyph rows; strength chart only with ≥2 points | clientfile-workouts | ~350 | T1/T2 | DES-Q |
| 19 | Coach workout builder | Visual pass per target (hairline fields, grip, sentence-case CTA in forest, not oxblood); inline exercise search replacing the modal is behaviour | coach-workout-builder + README | ~300 | T1 (search T2) | DES-Z |
| 20 | Coach drafts queue, earnings, team | Only where the surface exists on main and shows real data | drafts-queue, earnings-detail, team-breakdown | ~250 each | T1 | later |

### (d)2 Builder jobs (mobile only), launch order, today's APK

**Launch order and today's APK (cut ~14:00 PDT)**
- **Wave 1, launch now, six in parallel, disjoint files:**
  - DES-T, DES-V (truthful copy, first)
  - DES-F, DES-L (food)
  - DES-W (workout)
  - DES-A (foundation)
- **TODAY's APK:** a wave-1 job makes it only if READY by about 12:45 and lens-passed by about 13:30.
- If they cannot all make it, take them in this order: T, V, F, W, A, L.
- **Wave 2** (after the file owner in brackets merges):
  - DES-R (start any time; Opus; behaviour) — not today's APK
  - DES-H [after F]
  - DES-K [after T and A]
  - DES-P [after V]
  - DES-X [after W]
  - DES-N [after A; owner choice]
  - DES-M
- **Wave 3:**
  - DES-S [after m#458, m#451 and DES-A]
  - DES-O, DES-Q
  - DES-Z [after m#460]

**Shared files with open PRs** (rebase, no hunk overlap expected)
- `HomeScreen.tsx`: m#456 (V1-TRAIN-ENTRY-127 edits the `workoutExists` effect at :182-215). DES-T must rebase after it merges and reuse its pending-assignment read.
- `ClientNavigator.tsx`: m#458, m#454 and m#451 add routes; DES-A edits only the tab `screenOptions` and icons (~:671-760).
- Client `SettingsScreen.tsx`: m#458 and m#451 add rows; DES-A edits only the Appearance block (:311-335).

**What changes in the three queued drafts**
- **DES-A-127: keep, revised.**
  - Drop U10 (moves to DES-V, which owns ProgressScreen) and U11 (moves to DES-T, which owns HomeScreen).
  - Tab icons stay **outline** (catalog), not filled. The active state is forest plus a medium-weight label.
  - Keep six tabs (DES-N handles five).
  - It no longer touches any file another wave-1 job owns.
- **DES-B-127: retire.** It is replaced by DES-F (food summary and portion preview) and DES-H (Health).
  - The palette changes: all three macro bars are forest, so there is **no** blue #457B9D or brown #8A6A2A data trio, per the catalog.
  - Health also removes the invented goals.
- **DES-C-127: retire.** It is replaced by:
  - DES-T (Home truth, whose rest-day line was "Rest day." / "A clean slate." in the draft; now state-driven, see sweep #1)
  - DES-V (Train first day)
  - DES-W (set rows)
  - DES-R (rest notification on Opus, because background-notification behaviour is the risky part)

Ready-to-paste entries follow, in the JOBS127 style. **FIRST TRANCHE (posted ~10:58 PDT):** DES-T, DES-V (truthful copy), DES-F, DES-L (food), DES-W (workout), DES-A (foundation), plus DES-K (Home layout, starts when DES-T merges). Wave-2 entries follow the tranche.

```
## DES-T-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — truthful copy 1: Home, its cards and Roman's greeting.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: /home/user/workspace/ops/reports/DESIGN-AUD-127.md "(d)A" and "(d)0 TRUTHFUL COPY rule", rows #1-#15. Mobile main f71b425e or
later. One PR under 400 lines.
Files you own (no other tranche-1 job edits them): src/screens/client/HomeScreen.tsx, src/components/home/CoachIntroductionBanner.tsx,
src/components/home/HolisticInsightsTile.tsx, src/components/home/PushPermissionCard.tsx, src/components/tutorial/TutorialHomeSlot.tsx,
src/components/roman/romanVoice.ts (+ their tests and the identity-spec pin test).
Do rows #1-#15 exactly as the table says. State variants, each with a failing-first test: assigned-not-done, in-progress session, done
today, no assignment, coachless, coach lookup 404, insights empty/error, nameless user, coach greeting at 09:00/14:00/20:00 device time.
Home water shows oz like the Food Log. The Home CTA keeps opening the same destination as today for each state (only its label becomes
specific); "Explore the app" becomes "Log a meal" with the same destination. Order: m#456 (V1-TRAIN-ENTRY-127) edits HomeScreen's
workoutExists effect; rebase on main after it merges and reuse its pending-assignment read for the plan name, do not re-implement it.
Row #15 follows the owner-choice default in (d)3 #12 unless the operator says otherwise; say so in the PR body. No layout change (DES-K).
Report ops/reports/DES-T-127.md.

## DES-V-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h, TRANCHE 1 / WAVE 1, TODAY'S APK) — truthful copy 2: Train first day, Progress, Profile, Day-1, payments, community, coach placeholders.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md "(d)0" rows #16-#37 and #39. Two PRs in this order, each under 400 lines: PR 1 client training/progress/day-1
(rows #16-#30, #39); PR 2 payments/community/coach (rows #31-#37) + the guard tests.
Files you own: src/screens/client/WorkoutScreen.tsx, src/ui/empty-states/EmptyStateNoWorkouts.tsx, src/screens/client/ProgressScreen.tsx,
src/screens/client/ProfileScreen.tsx, src/screens/client/ReportScreen.tsx, src/screens/day-one/i18n/en.json,
src/screens/client/wearables/onDeviceCopy.ts, src/screens/client/FastingScreen.tsx (early-end cancel only), src/utils/notifications.ts
(fasting copy only), src/screens/client/PurchaseUnpackScreen.tsx, src/screens/client/MembershipScreen.tsx,
src/screens/client/CheckoutReturnScreen.tsx, src/screens/client/PrivateCommunityHubScreen.tsx,
src/screens/coach/payments/CoachPackageEditScreen.tsx, src/screens/coach/payments/CoachPackagesListScreen.tsx,
src/components/coach/ExtensionPairingPanel.tsx, src/__tests__/quietLuxuryDoctrine.test.ts, new src/__tests__/truthfulCopy.guard.test.ts.
Do the rows exactly as written. Train for a new client: assigned workout (if any), Quick Workout, routines (with "Create a routine"
wired to RoutineBuilder), history, then the charts (moved down, not removed). Progress keeps the number and the share button with the
"days in a row with a weigh-in" wording. Row #33: check backend main (read-only) for the purchase notification before keeping "has
been notified". Removals allowed only for rows marked Remove (false or dead); list each in the parity table. Guard: doctrine "coming
soon" check case-insensitive; truthfulCopy.guard.test.ts fails on the retired lines "One workout to go", "Day 7 of 30", "Everything is in
order", "finance pillar", "Your coach will assign your first workout", "Check back after your next session", "Mornings work best",
"our servers". No restyle (DES-P does layout). Report ops/reports/DES-V-127.md.

## DES-F-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — food logging, luxurious and comfortable.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 rows 1-2 and (e); part-1 top-10 #4 and #9 (food half). Images: design-targets/mobile/plan/plan_luxury.jpg,
plan-fullweek/luxury.jpg (look, not content). One PR under 400 lines.
Files you own: src/components/log/DailySummaryBar.tsx, src/components/log/QuantityPickerModal.tsx (macro preview block only),
src/components/log/MealSectionCard.tsx, src/components/log/FoodSearchView.tsx, src/components/WaterTracker.tsx,
src/components/DaySelector.tsx, new src/ui/progress/QuietBar.tsx (+ tests).
Do: (1) QuietBar: forest fill (existing forest token) on an sc.border hairline track, 4 pt tall, label and value Inter 13 pt with
fontVariant tabular-nums, fill animates <=300 ms, no animation under reduce-motion. (2) DailySummaryBar: calories-left hero in Cormorant
(eaten when there is no target), one muted line "of <target> · <eaten> eaten", then Protein / Carbs / Fat bars, all forest (no
Colors.orange, gold or lavender), "<n> g over" in words; simple macro mode keeps showing exactly what it shows today (calories +
protein); every number shown today stays shown (rule 4). (3) Portion preview monochrome, same values. (4) Inter on every Text in these
files; nothing under 13 pt except the weekday overline (11 pt, letter-spaced); muted via sc.textMuted; hairline rows instead of cream
boxes. (5) DaySelector: today = small forest dot, past plain, future sc.textMuted; same day-tap behaviour. (6) "Retry Search" -> "Try
again". Every control keeps its action; tap targets >=44 pt. Do not touch LogScreen.tsx (DES-L). Report ops/reports/DES-F-127.md.

## DES-W-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — live set rows: ghost values, Previous column, comfortable type.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 4; part-1 #10 and #9 (workout half). One PR under 400 lines. Files you own:
src/screens/client/active-workout/SetLogger.tsx, src/screens/client/active-workout/styles.ts (+ tests).
Do: previous weight and reps show as ghost placeholder values in the inputs (sc.textMuted); ticking a row with blank inputs logs the
previous values and shows them as real text; typed values override; no previous = today's behaviour. The separate "Last time ..." line
(SetLogger.tsx:165) becomes a compact "Previous" cell in the same row (e.g. "60 × 10") that stays visible after typing (rule 4); its
"Use" action stays as tap-to-fill on that cell (rule 6). styles.ts: Inter, nothing under 13 pt, fontVariant tabular-nums on weight,
reps and timer text, sc.border hairlines instead of camel #B08D57, tick and inputs >=44 pt. Failing-first tests: blank + tick adopts
previous; typed overrides; Previous cell tap fills; no previous leaves blanks invalid as today. Do not edit ActiveWorkoutScreen.tsx
(DES-R) or ExerciseCard.tsx (DES-X). Report ops/reports/DES-W-127.md.

## DES-L-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, TRANCHE 1 / WAVE 1, TODAY'S APK if time) — add several foods in a row.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 3; part-1 #15. One PR under 250 lines. Files you own: src/screens/client/LogScreen.tsx,
src/components/log/FoodSearchModal.tsx. Do: after a successful add from search, keep the search sheet open with one line "Added <food>."
and a "Done" text action; the totals behind it update; the offline "Saved offline" path is unchanged; every action the sheet has today
stays (search, portion, manual entry, repeat meal, close). Sentence-case alerts ("Missing info", "Delete food"). Do not edit
QuantityPickerModal.tsx (DES-F); if the confirmation needs it, STOP and report. Failing-first tests: two foods added without reopening;
Done closes; a failed add keeps the sheet and the entered portion. Report ops/reports/DES-L-127.md.

## DES-A-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 1 / WAVE 1, TODAY'S APK) — legibility, appearance, mood words, tab labels (REVISED; replaces the queued draft).
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md part-1 (b) #1, #2, #3, #7, U16 and part-2 (e). One PR under 400 lines. Files you own: src/constants/colors.ts,
src/theme/index.ts, src/theme/ThemeProvider.tsx, src/screens/client/SettingsScreen.tsx (Appearance block :311-335 only),
src/screens/client/habits/constants.ts, src/screens/client/habits/MoodEnergyPicker.tsx, src/navigation/ClientNavigator.tsx (tab
screenOptions and icons only), src/components/home/HomeHeaderActions.tsx, and the ~12 tests that pin #B1A89F.
Do: #1 legacy textMuted #B1A89F -> #6B675F (colors.ts:23) and the default Typography.body colour (theme/index.ts:119); #2 Appearance
offers Light and System, System resolves to light, a stored Dark renders light, dark code kept; #3 one word per mood button, no word in
the emoji slot (constants.ts:5, MoodEnergyPicker.tsx:43), same five choices; #7 labels on all client tabs (Inter 11 pt, sentence case),
OUTLINE glyphs kept, active = forest + medium weight, inactive sc.textMuted, keep all six tabs and every tab route; U16 both Home header
icons 24 pt, same actions. Changed from the queued draft: U10 moved to DES-V, U11 moved to DES-T, icons stay outline. Rebase over
m#458/#454/#451 as they merge (different hunks). If a #B1A89F-pinning test sits next to a file another tranche-1
job owns (e.g. food or Home tests), change only that colour assertion and say so in the PR body. Report ops/reports/DES-A-127.md.

## DES-K-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 1 entry, STARTS WHEN DES-T AND DES-A MERGE (DES-A owns HomeHeaderActions.tsx), not today's APK unless both merge by 12:15) — Home layout per the A23 targets.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 9; images plan/plan_luxury.jpg and coach-home-solo/luxury.jpg (structure only); plan/README.md
rubric. One PR under 400 lines. Files: src/screens/client/HomeScreen.tsx, src/components/home/HomeHeaderActions.tsx.
Do: overline date (small caps, letter-spaced, sc.textMuted); serif headline = DES-T's truthful line; one forest primary action; every
number cell homeCells() returns today, in one hairline row of serif tabular numerals, each keeping its tap-to-Log behaviour; remove the
96 px gap (:444); below-fold cards (profile, coach, push, tutorial, insights, coachless slot, pending invite, dunning) stay, as hairline
sections in the same order; a 32 pt Roman avatar in the header opening Roman chat when featureFlags.romanChat is on (an added route, not
a replacement for the More entry). No copy change beyond layout. Report ops/reports/DES-K-127.md.

```

Wave-2 and wave-3 job entries (DES-R, H, P, X, M, N, S, O, Q, Z, J) are in section "(d)4" below.


### (d)3 Needs a new dependency or an owner choice (one line each, recommended default first)

1. **Tab labels against the catalog's "no labels":** default labels on, with outline glyphs (DES-A).
2. **Six tabs to five:** default **keep six with labels** (rules 4 and 6: any moved tab costs a tap). If the owner says five, Community moves into More (DES-N, after today's APK).
3. **Dark mode:** default hidden for launch (DES-A).
4. **Oxblood vs forest for buttons:** default forest everywhere, by flipping `lightTokens.accent` and `accentText` (tokens.ts:380,384) in one small PR after today's APK, once screenshots show the money screens.
5. **Page colour:** default keep bone #F5EFE4 and remove cream card fills; no new parchment value.
6. **Italic serif for the coach and Roman voice:** default yes, in wave 2. It needs one more weight (Cormorant Garamond 400 italic) loaded in `App.tsx` from the already-installed `@expo-google-fonts/cormorant-garamond`: no new dependency, one more font file in the bundle. Builder to confirm the export name.
7. **Food photos (plan_luxury):** default none; that needs a licensed image source or coach uploads.
8. **Exercise and progress line illustrations:** default none; that needs a commissioned art set.
9. **Barcode scanning:** default v1.1; it needs `expo-camera` (a new dependency).
10. **Live Activity for rest timers:** default later; it needs a native extension.
11. **Roman's voice:** default Roman keeps his own "I" as a character but makes no claims or promises; all other UI stays third person.
12. **Roman's first-open line (identity-spec pinned):** default replace it with "Good day. My name is Roman. Ask about training, food or recovery at any time." (DES-T #15).
13. **Health goals:** default no goal fills until a coach or client sets a target (DES-H).
14. **Progress "Day n" streak:** default hidden until the backend streak is authoritative (DES-V #21).
15. **Motion:** default ≤300 ms for anything the user waits on and the existing 400 ms for passive fades, with no token change today.
16. **Stillwater lints (token discipline, meta export):** default introduce them as non-blocking warnings after wave 2. Blocking now would fail every screen PR.
17. **A23 primitives (CompletionMoment, useHaptic, useSpring, QuietSkeleton, CalmError):** default build them after wave 2 as ≤200-line PRs (POST_H_LADDER §6.1). Wave 1 uses the existing haptics, skeleton and error components.

### (d)4 Wave-2 and wave-3 job entries (ready to paste; posted by 11:30 PDT)

Launch rules: wave 2 starts as each named predecessor merges; wave 3 waits for SHOTS-127 signed-in screenshots where noted. None of these are for today's APK.

```
## DES-R-127 (Claude Opus 5.5, BUILDER, T2 mobile behaviour, 2 h, WAVE 2 start any time, NOT today's APK) — rest alert in background + quiet finish.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 5; part-1 #11 and #13 as corrected (no particles, QUIET_LUXURY_DOCTRINE §3). One PR under 450 lines.
Files you own: src/screens/client/ActiveWorkoutScreen.tsx (rest timer ~:493-518 and ~:1316-1342 only),
src/screens/client/active-workout/WorkoutFinishSummary.tsx. Do: when the rest timer is running and the app goes to background, schedule
one local notification for the rest end with expo-notifications (already a dependency), ONLY if permission is already granted (never
prompt); cancel it on foreground, skip, adjust, finish and discard; copy "Rest over. Next: <exercise>, set <n>." Finish summary: single
fade <=300 ms, success haptic through the existing haptics service, the three headline numbers (time, sets, volume) in serif tabular
numerals, a PR sentence only for a real PR, and every action the summary has today kept in place (list each in the parity table); no
ParticleBurst, no scale or spring. Failing-first tests: schedule/cancel paths, permission denied (no schedule), parity of finish
actions. If you need styles.ts, wait for DES-W to merge. Report ops/reports/DES-R-127.md.

## DES-H-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 75 min, WAVE 2 after DES-F merges) — Health without invented goals.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)0 row #38; part-1 #8. One PR under 400 lines. Files: src/screens/client/wearables/HealthFitnessScreen.tsx,
src/screens/client/wearables/cards/ThreeRingHero.tsx (or a new bars card that replaces it). Do: replace the concentric rings with
three labelled rows using QuietBar from DES-F: "Active energy", "Exercise minutes", "Steps" (never Move / Exercise / Stand), each with
its real value and sample date ("Tue 6 Oct"); a bar fill only when a real coach or client target exists, otherwise the value alone;
remove the invented RING_GOALS defaults (:71-75). Every metric shown today stays shown; every tap into metric detail
(goToMetricDetail) and the connect CTA stay; coach-embed mode keeps its read-only behaviour. Tests: no data, stale sample, with target,
without target, coach embed, parity of taps. Report ops/reports/DES-H-127.md.

## DES-P-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 2 after DES-V merges) — Progress, "the full picture".
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 12; image design-targets/mobile/progress-details/luxury.jpg (look, not content). One PR under 400
lines. Files: src/screens/client/ProgressScreen.tsx and new presentational components under src/components/progress/. Do: title +
small-caps overline ("SINCE <first log date>" only when a first log exists); BODY section with the latest weight, change since start and
goal in serif tabular numerals between hairlines (only values that exist); weight chart, period switch (7D/30D/90D/All), goal progress,
body stats, recent entries, Log weight, report link and the weigh-in run + share all kept, in a calmer order (latest numbers, chart,
entries, secondary links); text links instead of boxed buttons where the action is secondary. No photos or illustrations. Report
ops/reports/DES-P-127.md.

## DES-X-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 60 min, WAVE 2 after DES-W merges) — exercise card, quieter but identical.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 6 (revised: styling only). One PR under 300 lines. Files:
src/screens/client/active-workout/ExerciseCard.tsx (+ styles.ts after DES-W merges). Do: exercise name in Inter 17 pt medium, sets
summary 13 pt muted, action icons as 24 pt outline glyphs in one row with >=44 pt targets and accessibility labels; same actions, same
order, same tap count, no new sheet. Parity test lists every action before and after. Report ops/reports/DES-X-127.md.

## DES-M-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 2) — Roman chat, the "Guidance" look.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 10; image design-targets/mobile/ai-guide/luxury.jpg (look, not content). One PR under 400 lines.
Files: src/screens/roman/RomanChatScreen.tsx and its presentational children under src/components/roman/ (NOT romanVoice.ts, NOT
consent or memory screens; R11 lanes own those). Do: Roman's messages in Cormorant 19-20 pt with an "ROMAN" small-caps label, the
user's messages right-aligned in Inter with a "YOU" label, no bubbles, hairline separators; any suggestion chips become text links with the
same effect; input on a hairline with a square forest send button; typing, error, retry, consent gate, rate-limit and pool-empty states
unchanged in behaviour. If the owner approves the italic weight ((d)3 #6), use it for Roman's one-line notices only. Report
ops/reports/DES-M-127.md.

## DES-N-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, WAVE 2 after DES-A merges, ONLY ON AN EXPLICIT OWNER YES) — five client tabs.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)3 #2. Default is to keep six tabs; launch this only if the owner says five. One PR under 250 lines.
Files: src/navigation/ClientNavigator.tsx, src/screens/client/MoreScreen.tsx, src/navigation/README.md (+ tutorial target ids if
affected). Do: Community moves from a tab to the first row of More in the clinic build; every Community route, deep link and
notification target keeps working (test each); tutorial steps that pointed at the tab point at the row. Report ops/reports/DES-N-127.md.

## DES-S-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h, WAVE 3 after m#458, m#451 and DES-A merge, ONLY ON AN EXPLICIT OWNER YES) — client Settings, grouped.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 14; Stillwater T2.3; guide §4.3 ("5-7 sections"). Two PRs in order, each under 400 lines. File:
src/screens/client/SettingsScreen.tsx (795 lines) + new section components under src/screens/client/settings/. Rule 4 limit: grouping
on ONE screen with small-caps section overlines and hairlines (Account, Training and food, Notifications, Privacy and data, Roman,
Support, About), NOT a drill-down that adds taps; every row, switch and destination stays on the same screen. Parity test enumerates
all rows before and after. Report ops/reports/DES-S-127.md.

## DES-O-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h, WAVE 3) — coach landing, A23 look with real counts.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 17; images coach-home-solo/luxury.jpg and coach-home-headcoach/luxury.jpg (look, not content).
First confirm on main which screen a coach lands on (CoachNavigator initialTab: ClientsStack unless mock data; CommandCenterScreen is the
other landing) and redesign that one; one PR under 400 lines. Do: overline date; one hero from real data (active clients; revenue only
if the money API returns real values for this coach); a sentence from real alert counts ("<n> need you. <m> are steady.") only when
both counts are known, otherwise the plain counts; hairline client rows with one-line real reasons; every metric, alert list, quick
action and route on the screen today stays. Report ops/reports/DES-O-127.md.

## DES-Q-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 3) — coach client file, Workouts tab.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 18; image clientfile-workouts/luxury.jpg (look, not content). One PR under 400 lines. Files:
src/screens/coach/client-detail/WorkoutsTab.tsx (+ the tab header in src/screens/coach/ClientDetailScreen.tsx only if it renders the
tabs). AIB-FINISH-127 PR 2 touches WorkoutsTab.tsx: start after it merges. Do: text tabs with an underline (no pills); "<x> of <y>
workouts done this week" only when y (assigned this week) is known, otherwise "<x> workouts this week"; rows with done / missed /
upcoming glyphs, date, duration and RPE where recorded; strength chart only with >=2 points; "Adjust for <first name>" and every other
action kept. Report ops/reports/DES-Q-127.md.

## DES-Z-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, WAVE 3 after m#460 merges) — coach workout builder, visual pass.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (d)1 row 19; image coach-workout-builder/luxury.jpg + README (look only; the README's "modals are
forbidden" is NOT in scope: the exercise picker stays as it works today). One PR under 400 lines. File:
src/screens/coach/CoachWorkoutBuilderScreen.tsx (styles and layout only). Do: small-caps field overlines, hairline inputs, drag grip and
edit/delete as outline icons with >=44 pt targets, sentence-case primary action in forest; Ask AI, save, autosave pill, reorder,
add-exercise and every other action unchanged. Report ops/reports/DES-Z-127.md.

## DES-J-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 45 min, WAVE 3 after SHOTS-127 signed-in screenshots, OWNER CHOICE (d)3 #4) — one accent.
ACCEPTANCE RULES (owner 10:35 10-07, BINDING): (1) honest copy (real data or neutral); (2) no dead buttons (every tappable thing does
something real; anything that cannot work is removed or wired); (3) luxurious, simple feeling (A23 targets + design guide); (4) all
important info present (nothing a client or coach needs is removed or hidden behind more taps); (5) mentally deloading (fewer competing
elements, one primary action per screen, calm hierarchy, progressive disclosure for secondary detail); (6) no navigation path or function
is cut (every route, button and feature reachable today stays reachable; each DES PR lists the routes/actions on its screens before and
after and proves parity in tests).
PARITY (rule 6): the PR body carries a table "Routes/actions before -> after" for every screen touched (each tappable element: label,
destination or effect); any removal must cite rule 1 (false) or rule 2 (dead) with the reason; a parity test renders each touched screen
and asserts every listed action is present and navigates/acts as before. Rules where rules 4/6 and 5 clash: 4 and 6 win.
COMMON: mobile repo only; no new dependency; no lockfile edits; no `as any`; no hex literals outside tokens; product copy has no first
person, no exclamation marks, no emojis, no generic errors; failing-first tests; PR body starts with the tier header; commit identity per
_COMMON_127.
Source: DESIGN-AUD-127.md (e) and (d)3 #4. One PR under 150 lines. Files: src/theme/tokens.ts (lightTokens.accent and accentText,
~:380 and :384) + the contrast/token tests that pin oxblood. Do: forest replaces oxblood as the light accent; textOnAccent contrast
re-verified (AA); founding-tier camel cue untouched. Before/after screenshots of five money and checkout screens in the PR body.
Report ops/reports/DES-J-127.md.

```

### Part 2 tallies
- **B=0.** No crash or data-loss defect found. Sweep #19 ("Day 7 of 30." for everyone) is the most visible false line; it is listed as U.
- **U=17 + 39 = 56.** Part-1 U1-U17, plus truthful-copy rows #1-#39. Row #40 is C.
- **PRs: none** (read-only).
- **Needs operator: 4.** Part-1 items 2-5 remain; item 1 was withdrawn 10:25. The 17 owner-choice lines above each carry a default, so none block wave 1.
- **Part 2 HANDOFF:**
  - Section (d) is complete: (d)A rules, (d)0 sweep, (d)1 page plan, (d)2 tranche 1 (T, V, F, W, L, A, K), (d)3 owner choices, (d)4 wave 2/3 (R, H, P, X, M, N, S, O, Q, Z, J).
  - The queued drafts DES-B-127 and DES-C-127 in JOBS127.md are superseded; DES-A-127 is replaced by the revised entry in (d)2.
  - Every file:line was checked on mobile main `f71b425e`.
  - When SHOTS-127 signed-in screenshots land, compare 10-client-home, 11-client-train, 12-client-live-workout, 13-client-food-macros and 14-client-progress against the sweep rows before the DES PRs are audited.

### Tranche 3 (owner 11:44, wind-down 11:49)
- 30 client DES entries (DES-AA..DES-BD) with a launch-order table, exact file lists and a not-yet-covered list: `ops/reports/DESIGN-AUD-127-jobs-paste.md` under "# TRANCHE 3". No builders launched today; they are the starting plan for operator agent 128. Checked file-disjoint against open mobile PRs and earlier DES entries on main 8591058.
