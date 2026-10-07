# DES jobs, ready to paste into JOBS127.md (from DESIGN-AUD-127.md (d)2 + (d)4)

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

# TRANCHE 3 (DESIGN-AUD-127, owner 11:44: 30 client entries; starting plan for operator agent 128)

Verified on mobile main 8591058 at 11:47 PDT. Every entry is file-disjoint from open mobile PRs #456 #463 #464 #465 #469-#479, from
DES-T/V/F/W/L/A/K/R/H/P/X/M/S/O/Q/Z/J, and from each other. Where an entry imports a file another job owns, it names the order.
MoreScreen.tsx (DES-N, cancelled 11:26) and MoodEnergyPicker.tsx (DES-A, merged #467) are free again.
Up to about 8 can run in parallel; any order respecting the Start column works. Each entry lists the exact files it owns.

## LAUNCH ORDER (client impact, most-used first)

| # | Job | Screen | Model, tier | Start |
|---|---|---|---|---|
| 1 | DES-AA-127 | Client messages thread | Sol T2 | now |
| 2 | DES-AB-127 | Meal plan (plan targets) | Sol T1 | now |
| 3 | DES-AD-127 | Habits + mood check-in | Sol T2 | now |
| 4 | DES-AE-127 | Assigned workout viewer + history edit | Sol T1 | now |
| 5 | DES-AK-127 | Community tab + Today | Sol T1 | now |
| 6 | DES-AM-127 | Notification center + list | Sol T1 | now |
| 7 | DES-AJ-127 | More menu (six tabs kept) | Sol T1 | now |
| 8 | DES-AF-127 | Calendar home + session | Sol T2 | now |
| 9 | DES-AC-127 | Macro targets | Sol T1 | after #471 (DES-F) |
| 10 | DES-AG-127 | Booking + upcoming sessions | Sol T2 | after DES-AF |
| 11 | DES-AH-127 | Exercise library + detail | Sol T1 | now |
| 12 | DES-AI-127 | Routine builder | Sol T1 | now |
| 13 | DES-AL-127 | Community space/thread/composer | Sol T1 | now |
| 14 | DES-AN-127 | Recipes | Sol T1 | now |
| 15 | DES-AO-127 | Grocery/shopping/prep | Sol T1 | now |
| 16 | DES-AP-127 | Edit profile | Sol T1 | after #470 (DES-V) |
| 17 | DES-AQ-127 | Community DMs + Find | Sol T1 | after DES-AA (same thread grammar) |
| 18 | DES-AS-127 | Packages/checkout (visual, money frozen) | Sol T1 | now |
| 19 | DES-AT-127 | Deliverables | Sol T2 | now |
| 20 | DES-AR-127 | Challenges + leaderboard | Sol T2 | now |
| 21 | DES-AU-127 | Welcome/sign in/reset | Sol T1 | now |
| 22 | DES-AV-127 | Create account (consent frozen) | Sol T1 | now |
| 23 | DES-AW-127 | Role choice/invite/verified | Sol T1 | now |
| 24 | DES-AX-127 | Day-1 onboarding (visual) | Sol T1 | after #470 |
| 25 | DES-AY-127 | Consultation look (consent frozen) | Sol T1 | after #463 and #464 |
| 26 | DES-AZ-127 | Devices + metric detail | Sol T2 | after DES-H |
| 27 | DES-BA-127 | Notification/app preferences | Sol T1 | now |
| 28 | DES-BB-127 | Trust Center/export/delete/blocked | Opus T2 | now |
| 29 | DES-BC-127 | Roman conversations + AI guide | Sol T1 | now |
| 30 | DES-BD-127 | Education/timeline/path/guidelines | Sol T1 | now |

## DES-AA-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 120 min, TRANCHE 3 BATCH 1 #1, start now) — client messages thread (coach chat).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the client's daily line to the coach. One PR under 450 lines.
Files you own (exact): src/screens/client/MessagesScreen.tsx, src/components/messaging/ThreadV2Parts.tsx,
src/components/messaging/MessageBubble.tsx (+ their tests). New presentational files only under src/components/messaging/thread/.
Do: one calm thread: date dividers as small-caps overlines between hairlines; coach messages left in Inter 16 pt on bone with no bubble
fill, client messages right with a thin forest hairline or tint from tokens; timestamps 13 pt muted, shown per group, not per message;
composer on a hairline with a square forest send button; attachment/voice affordances as outline icons with labels for screen readers.
Every action stays: send, attach, long-press menu (copy, report, block via MessageActionSheet / ReportMessageSheet, unchanged), contact
view, retry on failed send, read/delivered states, empty and error states. The coach thread (src/screens/coach/ClientMessagesScreen.tsx)
renders the same shared parts: run its tests and add a parity test for it; do not edit that file (the coach-thread job in tranche 4 owns it).
Frozen: message sending, moderation, report/block behaviour (App Review 1.2). Report ops/reports/DES-AA-127.md.

## DES-AB-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 120 min, TRANCHE 3 BATCH 1 #2, start now) — meal plan, the "plan" look.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the food plan clients follow every day. Targets: design-targets/mobile/plan/luxury.jpg and plan-fullweek/luxury.jpg (look,
not content; "This weeks plan" in the catalog is a typo, write "This week's plan"). One PR under 450 lines.
Files you own (exact): src/screens/client/PlanScreen.tsx, src/screens/client/ClientDailyMealPlanScreen.tsx (+ tests). New presentational
files only under src/components/plan/.
Do: overline "THIS WEEK" + serif title; day rows between hairlines with the meal names and real kcal/protein only where the plan has
them; today's day carries the single forest primary action that exists today (e.g. log or open the day); full-week view as a quiet list,
not cards. Every route stays (recipes, grocery list, shopping list, prep guide, daily plan, any swap or regenerate action). Plan names,
coach names and numbers come from data; with no plan, the existing empty state, honest and neutral.
Report ops/reports/DES-AB-127.md.

## DES-AC-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 45 min, TRANCHE 3 BATCH 1 #3, after DES-F mobile#471 merges) — macro targets screen.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the numbers behind the food log. One PR under 250 lines.
Files you own (exact): src/screens/client/ClientMacrosScreen.tsx (+ tests).
Do: calories hero in Cormorant tabular numerals; protein, carbs, fat as three QuietBar rows (monochrome forest, from DES-F) with real
target and consumed values; "set by <coach first name>" only when the target came from the coach, otherwise "Your target"; no colour
trio. Every action (edit target if it exists, back, any link to the log) stays. Report ops/reports/DES-AC-127.md.

## DES-AD-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min, TRANCHE 3 BATCH 1 #4, start now) — habits and mood check-in.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: daily habit ticks and the mood/energy check-in. (Water belongs to DES-F, weight to DES-P/DES-V.) One PR under 400 lines.
Files you own (exact): src/screens/client/HabitsScreen.tsx, src/screens/client/habits/HabitCard.tsx,
src/screens/client/habits/AddHabitSheet.tsx, src/screens/client/habits/MoodEnergyPicker.tsx, src/screens/client/habits/styles.ts (+ tests).
Do: habit rows between hairlines with a 44 pt outline check on the right, today's count as plain text ("3 of 5 today") from real
completions; the mood and energy check-in as one calm row of labelled choices, the existing words (DES-A) kept; add-habit as a text
link plus the existing sheet; streak or "days in a row" only when computed from real completions. Every action stays (add, tick,
untick, edit, delete, check-in, any history link). Report ops/reports/DES-AD-127.md.

## DES-AE-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 60 min, TRANCHE 3 BATCH 1 #5, start now) — assigned workout viewer and history edit.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: where a client reads today's workout before starting. One PR under 350 lines.
Files you own (exact): src/screens/client/ClientWorkoutViewerScreen.tsx, src/screens/client/WorkoutHistoryEditScreen.tsx (+ tests).
(WorkoutAssignmentDetailScreen belongs to mobile#456; ExerciseCard to DES-X.)
Do: serif workout title, small-caps overline with the real date or "ASSIGNED BY <coach first name>" only when assigned; exercise rows
between hairlines (name, sets x reps, last time's numbers when they exist); the existing start action as the one forest primary button;
history edit as hairline inputs with the same save/cancel behaviour. Every route stays (start, exercise detail, back, edit, save).
Report ops/reports/DES-AE-127.md.

## DES-AF-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, TRANCHE 3 BATCH 1 #6, start now) — sessions with the coach: calendar home and session.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: booked calls with the coach. One PR under 350 lines.
Files you own (exact): src/screens/client/calendar/CalendarHomeScreen.tsx, src/screens/client/calendar/CalendarSessionScreen.tsx,
src/screens/client/calendar/calendarUi.tsx (+ tests).
Truthful fixes: CalendarHomeScreen.tsx:132 "Your coach will add the call link before it starts." and CalendarSessionScreen.tsx:81
"<coach> will add the call link before the session. You do not need to do anything." promise an action nobody has taken; replace with
"Call link not added yet." (plus the real "Join" action once the link exists). CalendarSessionScreen.tsx:138 "<coach> will be told."
stays only if the cancel call notifies the coach (check the API); otherwise "Cancel this session?" alone.
Do: next session as the hero (serif date and time in the client's time zone, coach name, length); later sessions as hairline rows;
one primary action per state (book, join, or nothing). Every action stays (book, join, reschedule, cancel, add to calendar if present).
Report ops/reports/DES-AF-127.md.

## DES-AG-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, TRANCHE 3 BATCH 1 #7, start now) — booking a session and upcoming sessions.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the booking flow and the sessions list. One PR under 350 lines.
Files you own (exact): src/screens/client/calendar/CalendarBookScreen.tsx, src/screens/client/ClientUpcomingSessionsScreen.tsx (+ tests).
(calendarUi.tsx belongs to DES-AF; import it, do not edit it. If both PRs need a shared style, DES-AF merges first.)
Truthful fixes: CalendarBookScreen.tsx:73 " <coach> will add the call link before it starts." -> " Call link not added yet.";
ClientUpcomingSessionsScreen.tsx:75 "Your coach will be notified." stays only if the cancel call notifies the coach (check the API).
Do: available times as a quiet grid of text slots with >=44 pt targets, the chosen slot in forest, one "Book <time>" primary; the
confirmation line keeps its real facts. Every action stays (pick day, pick slot, book, move, cancel, back).
Report ops/reports/DES-AG-127.md.

## DES-AH-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 3 BATCH 1 #8, start now) — exercise library and exercise detail.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: looking up how to do a lift, mid-workout and in planning. One PR under 400 lines.
Files you own (exact): src/screens/client/ExerciseLibraryScreen.tsx, src/screens/client/ExerciseDetailScreen.tsx (+ tests).
Do: search on a hairline at the top, filters as text chips with an underline when active, exercise rows (name, muscle group, equipment)
between hairlines; detail screen with serif name, small-caps MUSCLES / EQUIPMENT / HOW TO overlines, the existing media unchanged in
behaviour, history numbers only when the client has logged it. Every action stays (search, filter, open detail, add to routine or
workout if present, video playback). Report ops/reports/DES-AH-127.md.

## DES-AI-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 3 BATCH 1 #9, start now) — routine builder.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: clients building their own routines (My Routines). One PR under 400 lines.
Files you own (exact): src/screens/client/RoutineBuilderScreen.tsx (+ tests).
Do: routine name in a hairline serif input, exercises as hairline rows with drag grip and outline edit/remove icons (>=44 pt, labelled),
"Add exercise" as a text link, Save as the one forest primary; validation messages specific ("Add at least one exercise."). Every action
stays (add, reorder, edit sets, remove, save, cancel, delete routine if present). Report ops/reports/DES-AI-127.md.

## DES-AJ-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 60 min, TRANCHE 3 BATCH 1 #10, start now) — More menu.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the sixth tab and the door to every secondary screen. Six tabs stay (owner 11:26); this job only restyles the menu. One PR
under 300 lines.
Files you own (exact): src/screens/client/MoreScreen.tsx (+ tests). Not ClientNavigator.tsx.
Do: rows grouped under small-caps overlines between hairlines (for example YOUR PLAN, COACH AND COMMUNITY, ACCOUNT, HELP), outline icons
with labels, a chevron on rows that navigate, sentence-case labels; the order inside groups follows today's order. Every row and route
stays, including feature-flagged rows (test with flags on and off); nothing moves to another screen. Report ops/reports/DES-AJ-127.md.

## DES-AK-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #11) — Community tab shell and Today.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the Community tab clients open from the tab bar. One PR under 400 lines.
Files you own (exact): src/screens/community/CommunityTabScreen.tsx, src/screens/community/CommunityTodayScreen.tsx (+ tests).
Not src/components/community/romanVoice.ts (mobile#478 owns it; import it unchanged).
Do: Today as one calm column: serif date title, small-caps section overlines (TODAY, YOUR SPACES, EVENTS) between hairlines, posts as
text-first rows (author, time, two lines, counts only when real), no card fills; the existing compose action as the one forest
primary; segment/tab switch inside the screen as underlined text. Every route stays (spaces, threads, composer, find, DMs, challenges,
events, classroom, leaderboard, safety). Report ops/reports/DES-AK-127.md.

## DES-AL-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #12) — Community space, thread and composer.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: reading and writing posts. One PR under 400 lines.
Files you own (exact): src/screens/community/CommunitySpaceScreen.tsx, src/screens/community/CommunityThreadScreen.tsx,
src/screens/community/CommunityComposerScreen.tsx (+ tests).
Do: space header with serif name and a one-line real description; thread with the post in Inter 17 pt, replies between hairlines;
composer on bone with a hairline input, character count only if a limit exists, Post as the one forest primary. Every action stays
(post, reply, react, report, block, attach, voice note entry, delete own post, moderation states). Moderation and report behaviour frozen.
Report ops/reports/DES-AL-127.md.

## DES-AM-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 60 min, TRANCHE 3 #13) — notification center and the Home notifications list.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: every push lands here. One PR under 350 lines.
Files you own (exact): src/screens/notifications/NotificationCenterScreen.tsx, src/screens/client/NotificationsScreen.tsx (+ tests).
Do: rows between hairlines (title Inter 15 pt, body 13 pt muted, relative time), unread marked by a small forest dot and weight, not a
fill; "Mark all read" as a text link only if it exists today; empty state neutral ("No notifications."). Every action stays (open the
target screen of each notification type, mark read, preferences link). Test one tap per notification type -> same destination.
Report ops/reports/DES-AM-127.md.

## DES-AN-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 3 #14) — recipes and recipe detail.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: what to cook from the plan. One PR under 400 lines.
Files you own (exact): src/screens/client/RecipesScreen.tsx, src/screens/client/RecipeDetailScreen.tsx (+ tests).
Do: recipe list as hairline rows (name, kcal and protein per serving only when stored, time if stored), search and filters as text;
detail with serif title, small-caps INGREDIENTS / METHOD / PER SERVING overlines, numbered steps in Inter 16 pt, existing images kept
only where the recipe has one (no stock photos added). Every action stays (open, favourite, add to plan or log, add to grocery list, share
if present). Report ops/reports/DES-AN-127.md.

## DES-AO-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 3 #15) — grocery list, shopping list and prep guide.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: weekly food prep. One PR under 400 lines.
Files you own (exact): src/screens/client/GroceryListScreen.tsx, src/screens/client/ShoppingListScreen.tsx,
src/screens/client/PrepGuideScreen.tsx (+ tests).
Do: aisle or category overlines, items as hairline rows with a 44 pt outline check, quantities in tabular numerals; prep guide as
numbered steps with day overlines. Every action stays (check, uncheck, add, remove, clear, share/export if present, open recipe).
Report ops/reports/DES-AO-127.md.

## DES-AP-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #16, after DES-V mobile#470 merges) — edit profile.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: name, photo, body stats and goal edits. One PR under 400 lines.
Files you own (exact): src/screens/client/EditProfileScreen.tsx (+ tests). (ProfileScreen.tsx belongs to DES-V #470.)
Do: fields as hairline inputs under small-caps overlines (ABOUT YOU, BODY, GOAL), units beside values, Save as the one forest primary,
specific validation copy ("Enter a height between 120 and 230 cm."). Every field and action stays (photo, name, units, height, weight,
goal, save, cancel). Report ops/reports/DES-AP-127.md.

## DES-AQ-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 3 #17) — Community direct messages and Find.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: member-to-member messages and search. One PR under 400 lines.
Files you own (exact): src/screens/community/CommunityDmListScreen.tsx, src/screens/community/CommunityDmThreadScreen.tsx,
src/screens/community/CommunityFindScreen.tsx, src/components/community/MessageBubble.tsx (+ tests).
Do: same thread grammar as DES-AA (no bubble fills, hairlines, grouped timestamps), Find with a hairline search and result rows. Every
action stays (open DM, send, report, block, search, open profile/space). Report and block behaviour frozen. Report ops/reports/DES-AQ-127.md.

## DES-AR-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 120 min, TRANCHE 3 #18) — challenges and leaderboard.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: group challenges and rankings. One PR under 500 lines (styles and layout only; CommunityChallengeDetailScreen is 1,001 lines).
Files you own (exact): src/screens/community/CommunityChallengesScreen.tsx, src/screens/community/CommunityChallengeDetailScreen.tsx,
src/screens/client/LeaderboardScreen.tsx, src/screens/client/LeaderboardSettingsScreen.tsx (+ tests).
Do: challenge rows with real dates and participant counts; the client's own rank and value as the hero only when computed; ranks in
tabular numerals between hairlines; join/leave as the one primary. Leaderboard opt-out and privacy settings unchanged in behaviour.
Every action stays. Report ops/reports/DES-AR-127.md.

## DES-AS-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #19) — packages, package detail and checkout (visual only, money logic frozen).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: buying coaching. One PR under 400 lines. Money logic, prices, currency formatting, Stripe/RevenueCat calls, legal lines and
the checkout sequence are frozen: change layout and type only.
Files you own (exact): src/screens/client/ClientPackagesScreen.tsx, src/screens/client/packageDetail/PackageDetailSurface.tsx,
src/screens/client/PackageCheckoutScreen.tsx, src/components/PackageSelectionSheet.tsx (+ tests). (CheckoutReturnScreen,
PurchaseUnpackScreen and MembershipScreen belong to DES-V #473.) scopedTokenGate.test.ts already covers some of these files: keep it green.
Do: package rows with serif name, real price in tabular numerals, one-line real inclusions; detail with small-caps WHAT'S INCLUDED / HOW
IT WORKS overlines; one forest Buy/Continue primary. Every action stays. Report ops/reports/DES-AS-127.md.

## DES-AT-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 60 min, TRANCHE 3 #20) — purchased content (deliverables).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: what a client unlocks after buying. One PR under 300 lines.
Files you own (exact): src/screens/client/DeliverablesScreen.tsx, src/screens/client/deliverables/dropRow.tsx,
src/screens/client/deliverables/openPurchasedMedia.ts (only if styling requires; behaviour frozen) (+ tests).
Truthful fix: dropRow.tsx:151 "Unlocks soon" (fallback with no date and no trigger) promises timing nobody set; replace with "Not
unlocked yet." Coach-authored captions and real dates stay.
Do: unlocked items first as hairline rows with an outline open icon; upcoming items muted with their real unlock line. Every action stays
(open, download/stream, back). Report ops/reports/DES-AT-127.md.

## DES-AU-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #21) — welcome, sign in, forgot and reset password.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the first screens every user sees (App Store screenshots 01-03). One PR under 400 lines.
Files you own (exact): src/screens/auth/WelcomeScreen.tsx, src/screens/auth/LoginScreen.tsx, src/screens/auth/ForgotPasswordScreen.tsx,
src/screens/auth/ResetPasswordScreen.tsx (+ tests). Auth logic, Apple/Google buttons (Apple HIG sizes) and error mapping are frozen.
Do: brand mark and one serif line on bone, hairline inputs with small-caps labels, Sign in as the one forest primary, secondary links as
text. Every action stays (sign in, Apple, Google, create account, forgot password, reset, support link). Report ops/reports/DES-AU-127.md.

## DES-AV-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 120 min, TRANCHE 3 #22) — create account (visual only, consent wording frozen).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: every new client and coach. One PR under 450 lines (CreateAccountScreen is 1,599 lines: styles and layout only).
Files you own (exact): src/screens/auth/CreateAccountScreen.tsx (+ tests).
Frozen: the terms/privacy sentence (~:1387) and its links, role-choice logic (C13), error copy decided by the owner (#306 r5), every
validation rule. Do: one field group per view with small-caps labels, hairline inputs, Create account as the one forest primary.
Every action stays. Report ops/reports/DES-AV-127.md.

## DES-AW-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min, TRANCHE 3 #23) — role choice, accept invite and email verified.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: joining a coach. One PR under 400 lines.
Files you own (exact): src/screens/auth/RoleSelectionScreen.tsx, src/screens/auth/AcceptInviteScreen.tsx,
src/screens/auth/EmailVerifiedScreen.tsx (+ tests). Attach/pairing logic frozen.
Do: the coach's real name in serif when known ("You will be paired with <coach>" stays only when the invite resolved), choices as
hairline rows with a forest selection mark, one primary. Every action stays (choose role, finish sign-up, connect to my coach, keep my
current coach, retry). Report ops/reports/DES-AW-127.md.

## DES-AX-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #24, after DES-V mobile#470 merges) — Day-1 onboarding screens (visual).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the first day for every client. One PR under 400 lines.
Files you own (exact): src/screens/day-one/WelcomeScreen.tsx, src/screens/day-one/CoachPairingScreen.tsx, src/screens/day-one/GoalsScreen.tsx,
src/screens/day-one/CheckInTimeScreen.tsx, src/screens/day-one/ReadyScreen.tsx, src/screens/day-one/StepHeader.tsx (+ tests).
Not NotificationsScreen.tsx or i18n/en.json (DES-V #470 owns them; copy changes go there, not here).
Do: StepHeader as a thin progress hairline with "Step n of m"; one question per view in serif, choices as hairline rows, one forest
primary. Every step, back and resume path stays. Report ops/reports/DES-AX-127.md.

## DES-AY-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #25, after mobile#463 and #464 merge) — consultation look (visual only, consent frozen).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: the clinic onboarding consultation. One PR under 400 lines.
Files you own (exact): src/screens/consultation/components.tsx, src/screens/consultation/RevealScreens.tsx (+ tests).
Not ConsultationFlow.tsx, QuestionScreen.tsx, src/lib/consultation/* or consent sheets (#463/#464 and R11 lanes own them).
Frozen: all consent wording, consent order, checkbox behaviour, analytics exclusion, STEP_MS timing. Do: move the local `palette` in
components.tsx to semantic tokens (rule 7), hairline OptionRow/Chip, forest PrimaryButton, calm reveal type. Every action stays.
Report ops/reports/DES-AY-127.md.

## DES-AZ-127 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min, TRANCHE 3 #26, after DES-H merges) — connected devices and metric detail.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: Apple Health / Health Connect status and each metric's history. One PR under 400 lines.
Files you own (exact): src/screens/client/wearables/ConnectionsScreen.tsx, src/screens/client/wearables/WearablesShell.tsx,
src/screens/client/wearables/MetricDetailScreen.tsx (+ tests). Not HealthFitnessScreen.tsx, cards/ or onDeviceCopy.ts (DES-H/DES-V).
Do: connection rows with real status and last-sync time; metric detail with dated values and, where a goal is shown, DES-H's Starter goal
constants labelled "Starter goal" unless a coach- or client-set target exists. Every action stays (connect, disconnect, permissions,
open metric, period switch). Report ops/reports/DES-AZ-127.md.

## DES-BA-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #27) — notification and app preferences.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: quiet hours and what pings the client. One PR under 400 lines.
Files you own (exact): src/screens/settings/NotificationPreferencesScreen.tsx, src/screens/notifications/NotificationPreferencesScreen.tsx,
src/screens/client/PreferencesScreen.tsx (+ tests). Not client SettingsScreen.tsx (DES-S #477).
Do: switches as hairline rows with a one-line real description each, grouped under small-caps overlines; every switch and option stays,
including category preferences. Report ops/reports/DES-BA-127.md.

## DES-BB-127 (Claude Opus 5.5, BUILDER, T2 mobile, 120 min, TRANCHE 3 #28) — privacy and data: Trust Center, export, delete, blocked users.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: privacy and account deletion (App Review 5.1.1(v)). One PR under 500 lines, styles and layout only. Opus because the delete
and export flows are risky to touch. Files you own (exact): src/screens/TrustCenterScreen.tsx, src/screens/settings/DataExportScreen.tsx,
src/screens/settings/DeleteAccountScreen.tsx, src/screens/settings/BlockedUsersScreen.tsx (+ tests).
Frozen: deletion and export requests, confirmations, legal wording. Every action stays. Report ops/reports/DES-BB-127.md.

## DES-BC-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #29) — Roman conversations and the AI guide (visual).
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: past Roman chats and the guide. Target: design-targets/mobile/ai-guide/luxury.jpg (look). One PR under 400 lines.
Files you own (exact): src/screens/settings/RomanConversationsScreen.tsx, src/screens/settings/RomanConversationScreen.tsx,
src/screens/client/AIGuideScreen.tsx (+ tests). Not romanChatsCopy.ts, useRomanChats.ts, RomanAiConsentScreen.tsx or anything R11 owns.
Do: conversation rows with real dates and first lines, the transcript in the DES-M grammar (ROMAN / YOU labels, no bubbles). Every action
stays (open, delete, export if present, start new). Report ops/reports/DES-BC-127.md.

## DES-BD-127 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min, TRANCHE 3 #30) — learning and milestones: education, timeline, path, coach guidelines.
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
OWNER DECISIONS 11:26 + _COMMON rule 7: six client tabs with labels stay (no tab or navigator change); dark mode stays hidden and every
colour you add or change comes from the theme / semantic tokens, never the legacy fixed palette; forest is the colour of every primary
button (DES-J, mobile#475); any Health goal shown uses DES-H's Starter goal constants and says "Starter goal" when nobody set it.
TRUTHFUL SWEEP (rule 1): before styling, list every user-facing line in your files that states something not backed by the data on screen
(file:line, what it says, what is true, replacement) in the PR body, and fix it state-driven; lines that are true stay word for word.
LOOK: DESIGN-AUD-127.md (c) comfort rules + (e) picks: bone background, no cream card fills, hairline separators instead of boxes,
small-caps overlines, Cormorant only for titles and hero numbers, Inter for everything read or tapped, >=13 pt, >=44 pt targets,
outline icons, motion <=300 ms, no photos, no particles. Reuse src/ui primitives (QuietBar, FadeInView, HapticPressable, SkeletonScreen,
CoachErrorState); new presentational files only under the directory named in the entry.
Impact: secondary reading screens. One PR under 400 lines.
Files you own (exact): src/screens/client/EducationScreen.tsx, src/screens/client/TimelineScreen.tsx,
src/screens/client/ClientPathCopilotScreen.tsx, src/screens/client/CoachGuidelinesScreen.tsx (+ tests).
Do: article rows and timeline entries between hairlines with real dates; milestones only when reached in data. Every action stays.
Report ops/reports/DES-BD-127.md.

## NOT YET COVERED (tranche 4 candidates for agent 128, one line each)
- Client: Community classroom + lesson detail, event detail, safety, voice composer + voice note, wearable prompts; Bloodwork entry;
  share card; support inbox; contact view; widgets; legacy CommunityScreen (More > Community); FastingScreen (after DES-V);
  WorkoutAssignmentDetailScreen (after #456); UpdateCardScreen and BrandedCheckoutWebView chrome (money frozen); CoachSharingScreen
  (consent wording frozen); lean onboarding LeanQ2-Q6 + results (not LeanQ1, #464).
- Coach: ClientMessagesScreen (after DES-AA), messages inbox (MessagesScreen, CoachInboxV2, command-center/InboxScreen), broadcasts,
  pending AI drafts (drafts-queue target), money (earnings-detail target), team (team-breakdown target), booking inbox/options/
  availability, UniversalClientSearch, programs library, coach community screens.
