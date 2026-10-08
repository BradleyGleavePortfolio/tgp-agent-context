# FW-FOOD-128 (FW-AUD-128 instance, auditor, read-only) — food logging beyond the main log

Started 14:31 PDT 10-07, report written 14:45 PDT (final under operator credit emergency 14:46). Read-only: no code, no PRs, no comments.
Code read: mobile main d0875d26 (RO worktree), re-checked against mobile origin/main 4185b9b2: none of the food files changed
(only `src/screens/client/MoreScreen.tsx` regrouped and the fasting push copy in `src/utils/notifications.ts:104-105` became
"Fasting window ended"). Backend main 0d179edb (RO worktree); backend origin/main c7caffff touches none of `src/log`, `src/food`,
`src/water`, `src/fasting`.

## Scope traced
New client, first 7 days, with a coach and without (coachless), memory on/off irrelevant to this area (Roman reads food logs either way,
`src/log/log.service.ts:59` busts the AI cache).
- Food tab `src/screens/client/LogScreen.tsx` (wrapped by `withProtectedScreen`, `src/navigation/ClientNavigator.tsx:167,734`), day
  navigation `src/components/DaySelector.tsx`, day summary `src/components/log/DailySummaryBar.tsx`, meal sections
  `src/components/log/MealSectionCard.tsx`, store `src/store/clientStore.ts`.
- Add Food sheet: search `src/components/log/FoodSearchView.tsx` + backend `src/food/food.service.ts:265` (USDA + OpenFoodFacts + local,
  custom foods private per viewer), recents/frequent + repeat meal `src/hooks/useFoodBrowse.ts`, portion picker
  `src/components/log/QuantityPickerModal.tsx` + math `src/utils/log/macros.ts`, manual entry (= custom food + quick add)
  `src/components/log/ManualFoodEntryForm.tsx` + `src/utils/log/logSubmit.ts`, edit/move/delete entry (LogScreen edit modal,
  `src/utils/log/editPortion.ts`, backend `src/log/log.service.ts:121-145`), offline queue `src/services/foodLogQueue.ts` /
  `foodLogSync.ts`.
- Water `src/components/WaterTracker.tsx`, store `logWater` (`clientStore.ts:197`), backend `src/water/*`.
- Fasting `src/screens/client/FastingScreen.tsx` (More > Fasting, route `Fast`), Widgets/Shortcuts "Start fast"
  `src/screens/client/WidgetsScreen.tsx`, backend `src/fasting/*`, local alert `src/utils/notifications.ts:97`.
- Meal reminders / fasting alerts / water goal settings `src/screens/client/SettingsScreen.tsx` (main: rows at :290, :322) +
  `src/hooks/useSettings.ts`, backend `src/notifications/notifications.service.ts`.
- Not present in the app at all: barcode scan (backend `GET /foods/barcode/:upc` exists, `src/food/food.controller.ts:33`; mobile has
  no camera library, stubs removed per `WidgetsScreen.tsx:20-23`), favourites, copy a whole day, calories-only quick add.

Verified correct (no finding): per-100g vs per-serving math end to end (mobile multiplier, backend totals `log.service.ts:91-97`, coach
and Roman read the same rows); custom foods private to their creator (search, getById, log resolve, `food.service.ts:135-139,669-685`);
the search cache holds shared results only; edit/delete check ownership (`log.service.ts:122,139`); the offline queue is per user and
idempotent by `client_uuid`; coach reads of food logs are consent-gated per scope (`src/coach/coach.service.ts:437,590`); repeat meal
only offered while the slot is empty; failure states for search, save, edit, delete and water say what happened and keep the input.

Open PRs touching these files: none (mobile 31 open, backend 38 open; checked with `gh pr list --json files` at 14:33). Nearby:
m#490 (meal plans, `ClientDailyMealPlanScreen.tsx`), m#507 (notification preference screens, not the client SettingsScreen),
b#593 (meal-plan tenancy). Twelve open mobile PRs edit `src/screens/client/README.md`, so fix jobs below avoid it.

## (1) B list
None. Every path a normal client takes in this area saves, shows and protects data correctly. Nothing reached the A2 item-1 bar.

## (2) U list
U1. "Meal Reminders" switch does nothing. It defaults ON (`src/hooks/useSettings.ts:25`), syncs `eat_enabled`
   (`SettingsScreen.tsx:153`), but nothing in the backend or the app reads `eat_enabled` or sends a meal or logging reminder (searched
   every `@Cron`, nudges and `src/utils/notifications.ts`). A new client sees reminders switched on and never gets one. Dead control
   plus implied false claim (operator may treat it as B under "false customer-facing claim"). Smallest fix: remove the row until a
   sender exists (redo rule 2), or owner NEW "meal reminders" (see polish 6).
U2. "Fasting Alerts" switch is not honoured. Default OFF (`useSettings.ts:26`), backend `fasting_enabled` is never read, and
   `FastingScreen.tsx:200` schedules the local "Fasting window ended" alert for every started fast regardless. A client who leaves
   it off still gets the alert; one who switches it on sees no change. Smallest fix: read `settings.fastingAlerts` before
   `scheduleFastingAlert`, and set the default to true (matches today's behaviour and the backend default `fasting_enabled: true`,
   `notifications.service.ts:160`).
U3. No loading state on the Food Log. `isLoading` is only used for the retry button (`LogScreen.tsx:552`). On first open the screen says
   "No foods logged. Use Add Food below." four times and "0 Calories eaten" until the day arrives. Smallest fix: SkeletonScreen (or
   nothing) for the meal list while the first load for the selected date is in flight.
U4. Changing day leaves the previous day's foods on screen. `handleDateChange` (`LogScreen.tsx:149-155`) updates the date label at once
   but `foodLogs`/`dailyTotals` stay until the new day loads; when that load fails (offline, tap "Previous day") the error banner shows
   above yesterday's label with today's foods and totals under it (`clientStore.ts:152-158` keeps old data). Smallest fix: clear
   `foodLogs`/`dailyTotals`/`waterOz` when the date changes (store `setSelectedDate`), so a failed load shows the error and no numbers.
U5. Water goal is invented and not kept. "x / 100 oz" shows a 100 fl oz goal nobody set (`useSettings.ts:22`, `WaterTracker.tsx:24,37`);
   the goal edited in Settings is written to the profile (`water_goal_oz`) but never read back, so a reinstall or second phone shows 100
   again. Smallest fix: label the default "Starter goal" (redo rule 8 pattern) until set, and seed the setting from the profile when present.
U6. Water cannot be corrected. A mistaken "+16oz" tap stays forever: no undo in `WaterTracker.tsx`, no DELETE route in
   `src/water/water.controller.ts`. Smallest fix: backend `DELETE /nutrition/water/:id` (own row only) + "Undo" on the last add.
U7. Water ignores the units setting. Always fl oz (`WaterTracker.tsx:15,37,62`) even when Settings units = kg. Smallest fix: show ml
   (250/350/500 ml chips) when `settings.unit === 'kg'`; storage is already ml.
U8. Fasting screen has no visible way back. It sits in MoreStack with `headerShown: false` (`ClientNavigator.tsx:483-496`) and draws
   only a title (`FastingScreen.tsx:334-339`); iOS swipe and Android back work, nothing is tappable. Smallest fix:
   `options={backOnlyHeader('Fasting')}` on the `Fast` route (one line, the pattern used for Progress at :499) or an in-screen back.
U9. Fasting screen is outside the calm look: SVG ring (`FastingScreen.tsx:364-389`), red "End Fast" button for a non-destructive action
   (`:617` `colors.error`), red/green history icons (`:496-500`), cream card fills (`:567,640`), seconds ticking every second,
   Title Case ("Start Fast", "Recent Fasts", "Avg Hours"), "Day 3" header for a run of completed fasts (`:337`) that reads like a
   program day. Smallest fix: the DES redo listed as tranche-4 candidate "FastingScreen" (DES-JOBS-PASTE NOT YET COVERED).
U10. Fasting history cannot be fixed: no delete and no edit of a start time (forgot to tap Start, or started by mistake), backend has no
   such route (`src/fasting/fasting.controller.ts`). A mistaken 2-minute fast stays in history and lowers "Avg Hours". Smallest fix:
   "Remove this fast" on a history row + backend `DELETE /fasting/:id` (own row). Start-time edit is NEW.
U11. Fasting stats mix sets: "Completed" counts fasts that reached 90 percent, "Avg Hours" and "Longest" use every ended fast including
   early ends (`FastingScreen.tsx:113-121`). Smallest fix: label "Avg hours (all fasts)" or compute over completed only.
U12. Widgets row says "Widget setup and options" (main `MoreScreen.tsx:175-177`) but opens "Shortcuts" with two actions and no widget
   setup (`WidgetsScreen.tsx:20-46`). Copy contradicts the app. Smallest fix: label "Shortcuts", description "Quick log and start a fast".
   Also "Start fast" there does not schedule the end alert the Fasting screen schedules (`WidgetsScreen.tsx:64`).
U13. Copy polish on the Food Log: Title Case buttons ("Food Log", "Add Food", "Enter Manually", "Log Food", "Back to Search"), the
   empty line repeated under all four meals, a red warning icon on the search error (`FoodSearchView.tsx:122-125`), edit sheet radius 12
   and a 0.45 black backdrop (`LogScreen.tsx:777-793`). Smallest fix: sentence case, one empty line for an empty day, radius 4, hairline sheet.

## (3) Dead-button table
| Screen | Control | Effect | Verdict |
|---|---|---|---|
| Food Log | Previous day / Next day / date label | change day / blocked at today / jump to today | works |
| Food Log | Add Food (x4) | opens Add Food sheet for that meal | works |
| Food Log | tap entry / long-press entry | edit sheet / delete confirm | works |
| Food Log | +8oz / +12oz / +16oz | water log (reverts with message on failure) | works, no undo (U6) |
| Food Log | pull to refresh, error Retry | sync offline queue + reload | works |
| Add Food | Close, Done, Clear search, Recent / Frequent | close / close / clear / switch list | works |
| Add Food | result row, Try again, Enter Manually, Add all (repeat meal) | portion picker / re-search / manual form / log meal | works |
| Add Food | "Did you mean" rows | backend always returns `suggestions: []` (`food.service.ts:298`) | never shown (harmless, not a dead button) |
| Portion | unit chips, Log Food, Cancel | real conversions only (`unitOptionsFor`) | works |
| Manual | Back to Search, Log Food (disabled until macros entered, says why) | works | works |
| Edit sheet | unit chips, meal chips, Delete entry, Cancel, Save | works | works |
| Fasting | protocol chips, Start Fast / End Fast, Retry, pull to refresh | works | no back control (U8) |
| Shortcuts | back, Quick log, Start fast | Food tab / starts 16:8 fast | works; row label wrong (U12) |
| Settings | Meal Reminders switch | stores `eat_enabled`, nothing reads it | DEAD (U1) |
| Settings | Fasting Alerts switch | stores `fasting_enabled`, nothing reads it; local alert ignores it | DEAD (U2) |
| Settings | Water Goal stepper | local goal on this phone only | works locally, not restored (U5) |
| (absent) | barcode scan, favourites, copy day, calories-only quick add | not in the app | no dead stub shipped |

## (4) First-week polish, ranked
1. FIX: Food Log loads honestly (U3 + U4): skeleton on first load, no stale numbers under a new date. Highest daily-touch value.
2. FIX: truthful reminder switches (U1 + U2): remove Meal Reminders row; honour Fasting Alerts with default on.
3. FIX: water you can trust (U5 + U7 now; U6 after a backend deploy): Starter goal label, ml for kg users, then Undo.
4. FIX: Fasting in the calm look with a way back (U8 + U9 + U11), plus "Remove this fast" (U10) after a backend deploy.
5. FIX: copy and shape polish of the Food Log and Shortcuts (U12 + U13).
6. NEW (owner yes): meal reminders that actually fire (one local reminder per meal at times the client sets, off by default). Recommended
   default: not for launch; ship polish 2 (remove the row) now.
7. NEW (owner yes): "Copy yesterday" for a whole day and a star for favourite foods. Recommended default: yes after launch; repeat meal
   + Frequent already cover most of week one.
8. NEW (owner yes): barcode scanner (needs a camera dependency and a store build, both outside current rules) and calories-only quick add
   (needs the backend to store "macros not recorded" instead of zeros). Recommended default: after launch.

## (5) Proposed fix jobs (file-disjoint from each other and from all open PRs; each under 400 lines)
- FOOD-LOAD-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 45 min): U3 + U4 + U13 (Food Log part). Files: `src/screens/client/LogScreen.tsx`,
  `src/store/clientStore.ts`, `src/components/log/MealSectionCard.tsx`, `src/components/log/FoodSearchView.tsx` (+ tests under
  `src/screens/client/__tests__/` and `src/components/log/__tests__/`). Parity table for every Food Log action. README:
  `docs/QUIET_LUXURY_DOCTRINE.md` section 8 row only. About 200 lines.
- FOOD-WATER-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 45 min): U5 + U7. Files: `src/components/WaterTracker.tsx` (+ test). Starter goal
  label when no goal was set; ml chips when units are kg. About 120 lines. (Seeding the goal from the profile lives in `useSettings.ts`,
  owned by FAST-CALM-128.)
- FAST-CALM-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 75 min): U2 + U8 + U9 + U11 + U12 (Widgets start alert). Files:
  `src/screens/client/FastingScreen.tsx`, `src/hooks/useSettings.ts` (default `fastingAlerts: true`; seed `waterGoalOz` from the
  profile `water_goal_oz` when present, U5), `src/screens/client/WidgetsScreen.tsx`,
  `src/navigation/ClientNavigator.tsx` (one line on the `Fast` route) (+ tests). Parity table. About 300 lines.
- SET-TRUTH-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 30 min): U1 + U12 (labels). Files: `src/screens/client/SettingsScreen.tsx` (remove the
  Meal Reminders row; parity table cites rule 2), `src/screens/client/MoreScreen.tsx` (Widgets row label/description) (+ tests). About 80
  lines. Check first that FW-NOTIF-128 / FW-ACCOUNT-128 did not propose a SettingsScreen job; if they did, merge the two into one job.
- FOOD-UNDO-BE-128 (Claude Opus 5.5, BUILDER, T3 backend destructive-own-data, 45 min): U6 + U10 backend. Files:
  `src/water/water.controller.ts`, `src/water/water.service.ts`, `src/fasting/fasting.controller.ts`, `src/fasting/fasting.service.ts`
  (+ specs). `DELETE /nutrition/water/:id` and `DELETE /fasting/:id`, own rows only (404 for another user's id, same pattern as
  `log.service.ts:139`), bust the AI context cache like the existing writes. No migration. About 150 lines. The mobile "Undo" and
  "Remove this fast" follow only after this is deployed (mobile must work against production).

## C one-liners
- C (edge, deferred to 10k clients): app left open overnight keeps yesterday as the selected day (`clientStore.ts:44`); label shows the date, not "Today".
- C (edge, deferred to 10k clients): an offline-queued food rejected with a 4xx (for example 429 after 30 custom foods in a minute) is dropped silently (`foodLogQueue.ts:219-229`).
- C (edge, deferred to 10k clients): a search where every provider fails caches the empty result for 24 h (`food.service.ts:310`).
- C (edge, deferred to 10k clients): water and food dates are UTC-midnight date-only on the server; fine on Fly (UTC), would shift on a non-UTC host.
- C: recents and frequent foods cover only the last 7 days (`useFoodBrowse.ts:9`); in week one that is everything.

## Cross-area (one line each, for the operator)
- FW-MONEY-128: the Food tab and Fasting are paid surfaces (`ClientEntitlementGuard` on `src/log/log.controller.ts:13`,
  `src/fasting/fasting.controller.ts`; `withProtectedScreen` on the mobile routes), so a coachless or not-yet-paid client cannot log food
  at all in week one. Consistent with the paywall design; owner should confirm that is intended (recommended default: keep, and make sure the
  gate copy says plainly that food logging comes with a package).
- FW-NOTIF-128: Daily Check-in / Weekly Summary switches on the same Settings screen should get the same "does anything read it" check as U1/U2.

## PRs
None (read-only audit).

## Not fixed (needs operator)
- Route the five jobs above. FOOD-UNDO-BE-128 is the only backend one and the only one needing Claude Opus 5.5.
- Owner decisions: polish items 6, 7, 8 (recommended defaults given), and the paid-only food logging confirmation (cross-area line 1).

## HANDOFF
Audit complete at 14:45 PDT. Not checked: Home food/water card, the paywall gate copy on the Food tab, coach-side rendering of food logs, Apple Health water. B=0, U=13, needs operator: 5 jobs + 4 owner decisions. A fresh agent continuing this area should re-run
`gh pr list -R BradleyGleavePortfolio/growth-project-mobile --state open --json number,files` before launching the jobs (file sets were
disjoint at 14:33) and re-check `git -C /home/user/workspace/growth-project-mobile show origin/main:<file>` for the job files, since
mobile main moves every few minutes (MoreScreen.tsx already changed after d0875d26).
