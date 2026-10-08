Tier: T2
Why: client-facing redo of one screen (Fasting) plus the Shortcuts start path, one shared hook default path (useSettings water-goal seed) and one navigator option; local notifications only, no backend change.
T4 trigger scan: none. No auth/session, tenancy/RLS, sharing, payment, credential or destructive-data change. "Remove this fast" (m#536) is kept exactly as it was (same endpoint, same confirm). The only server call added is a read of the client's own `GET /profile` (existing endpoint) for `water_goal_oz`.
T3 trigger scan: none. No backend contract, schema, migration, dependency or lockfile change; no new route or navigator.
Bounded T1: no (a shared hook and two screens), hence T2.
Canonical builder: Claude Opus 5.5
Parent owner: operator agent 131
Acceptance evidence: failing-first run (this PR's tests against main + m#537 source: 17 tests fail in 6 files, listed below); after the change every targeted file passes locally, one file at a time through the shared heavy runner; targeted eslint clean; PR CI.
Promotion triggers: any change to sign-in, sharing, payments, backend writes or per-user storage of settings would need re-grading.

## What changes for coaches/clients

Clients:
- The Fasting screen is calmer: one large time in hours and minutes (no ticking seconds, no ring), a thin progress bar while a fast runs, and one forest "Start fast" / "End fast" button (End fast is no longer red). History rows say "Completed" or "Ended early" in words instead of green and red icons.
- The numbers say what they cover: the stats appear once a fast has ended ("Completed", "Average, all fasts", "Longest", and "A fast counts as completed at 90 percent of its target."). With no ended fast the stats are hidden instead of showing zeros, and the empty history says "Each fast you end is saved here."
- "Day 1" is gone: a run line shows only for two or more days in a row ("3 days in a row with a completed fast").
- The Fasting screen now has a Back button in its header.
- Shortcuts > "Start fast" now sets the same end-of-fast alert as the Fasting screen, so ending that fast also cancels it. Both start paths go through the one Settings > Fasting alerts check that m#537 added (no alert while it is off).
- A phone with no water goal saved on it (new install, second phone) shows the goal saved to the profile instead of the 100 oz starter goal.

Coaches: nothing changes.

## B / U list

- B: none.
- U2 (Fasting alerts honoured, default on): landed with m#537 (gate in `scheduleFastingAlert`, default `fastingAlerts: true`); this PR keeps both start paths on that one gate and tests it through the real gate.
- U5 (seed part): water goal from the profile when the phone has none (`useSettings.ts`).
- U8: back-only header on `Fast` (`ClientNavigator.tsx`).
- U9: calm Fasting look (`FastingScreen.tsx`).
- U11: honest stat labels and run line (`FastingScreen.tsx`).
- U12: Shortcuts "Start fast" schedules the same end alert (`WidgetsScreen.tsx`, `utils/fastingAlert.ts`).

## Routes/actions before -> after

FastingScreen (route `Fast`, opened from More > Fasting and from Shortcuts > Start fast):

| Label before | After | Destination or effect | Test |
|---|---|---|---|
| (no header) | Back (back-only header) | goes back | reachabilityGates "MoreStackNav Fast" |
| 12:12 / 16:8 / 18:6 / 20:4 / 24h | same five, hairline, selected state announced | sets the target | HabitsFasting "starting 12:12 ..." / "restores the selected ..." |
| Start Fast | Start fast (forest) | `POST /fasting/start`, end alert while Fasting alerts is on, reload | HabitsFasting "starting a fast schedules ..." (on and off) |
| End Fast (red) | End fast (forest) | early-end confirm (Keep going / End anyway) under 90 percent, `POST /fasting/end`, cancels the alert, reload | HabitsFasting "ending early ..." / "ending a fast cancels ..." |
| Remove this fast (running fast and each history row) | same, 44 pt muted text | confirm (Cancel / Remove), `DELETE /fasting/:id`, cancels the running fast's alert only | FastingScreen.remove (5 tests) |
| Retry (load failure) | Try again | reloads | HabitsFasting "keeps every action ..." |
| Pull to refresh | same | reloads | HabitsFasting "keeps every action ..." |

Shortcuts (route `Widgets`, More > Shortcuts):

| Label before | After | Destination or effect | Test |
|---|---|---|---|
| Back (unlabelled, 40 pt) | Back (labelled, 44 pt) | goes back | WidgetsScreen "Back goes back ..." |
| Quick log | same | opens the Food log (`Log`) | WidgetsScreen "Back goes back and Quick log ..." |
| Start fast | same confirm (Cancel / Start) | starts 16:8, now also sets the end alert while Fasting alerts is on, opens `Fast` | WidgetsScreen "Start fast starts 16:8 ..." / "schedules nothing when ... off" |
| (failed start) | same alert "Could not start fast" | no alert scheduled, no navigation | WidgetsScreen "a failed start ..." |

No route, tab or action is removed.

## Truthful sweep (Fasting screen)

- "Fasting" title; overline "16-hour fast" (the running fast's own target) or "Fasting window" (nothing running).
- Hero: elapsed time of the running fast from its server start time, or the selected target; "Xh YYm remaining" or "Target reached".
- "Started" / "Target" rows and the progress bar: the running fast's server data.
- Stats only after at least one ended fast: Completed = ended fasts that reached 90 percent of their target (said on screen), Average and Longest cover every ended fast (labelled "Average, all fasts").
- Run line only for two or more local days in a row with a completed fast; one day says nothing (it is already in Recent fasts).
- History rows: date, "Nh target · Completed" or "· Ended early", duration.
- Empty: "Each fast you end is saved here." Error: "Fasting history did not load." with Try again.
- No first person, no exclamation marks, no emojis; colours from the semantic theme only; Inter for read and tapped text, serif only for the title and the hero number; tap targets 44 pt.

## Overlap

Based on main: `origin/main` 2bed5deb02940be33d0f703c5de4d197b01a18ad (m#537 and m#546 in) merged into the branch before the opening push; 0 behind.

Changed lines: 747 = source 477, tests 261, docs 9 (480 additions / 267 deletions), 15 files.

- m#537 (SETTINGS-FIN-130) merged first: both changed `useSettings.ts` and both added `src/utils/fastingAlert.ts`. Resolution: m#537's file is the base; `scheduleFastEndAlert(userId, targetHours)` is folded in without its own on/off argument, so the Fasting screen and Shortcuts no longer read `useSettings` and rely on the gate in `scheduleFastingAlert`.
- m#536 (Remove this fast) is kept in full inside the redo; its test changes in one place (empty history copy and hidden stats).
- `src/screens/client/README.md`: m#544's Grocery row and this PR's Fasting/Widgets rows merged.

## Tests

Failing-first: this PR's tests run against main + m#537 source (only the five source files reverted): WidgetsScreen 2 failed, HabitsFasting.launch 10 failed, reachabilityGates 1 failed (`Fast` back header), useSettings 1 failed (profile water goal), FastingScreen.p0 2 failed, FastingScreen.remove 1 failed; 17 in all.

After the change (heavy runner, one file at a time): HabitsFasting.launch 24/24, WidgetsScreen 4/4, FastingScreen.p0 8/8, FastingScreen.remove 5/5, FastingScreen.streak 3/3, useSettings 3/3, utils/fastingAlert 4/4, utils/notifications 4/4, SettingsScreen.parity 8/8, SettingsScreen.checkInTime 10/10, MoreScreen.reach 21/21, reachabilityGates 20/20, quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, wave11Doctrine 8/8, wave11Screens 26/26, imessageDmRoutes 2/2, followUpDeadRows126 7/7, WaterTracker.goal 11/11, FoodLogging.makeover 6/6, coachSettingsMoneyRow 9/9 (after m#546). Targeted eslint clean; `git diff --check` clean. Full type check, lint and suite: PR CI.

README: `src/screens/client/README.md` (Fasting, Widgets rows), `src/hooks/README.md` (useSettings), `src/utils/README.md` (fastingAlert), `docs/QUIET_LUXURY_DOCTRINE.md` section 8 (Fasting row).

No merge, deployment, flag change, production sign-in or production data write.

agent 131
