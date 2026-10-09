**Tier:** T1 (presentation and honest copy)
**Why:** Owner 17:10 "start the mobile redesigns that were unfinished" and 17:07 "nice rounded corners, luxurious, not rectangles". REDO-PROGRESS-133, PR B of 3 (today's food, BMI, weigh-ins, sheet). Follows m#610 (weight trend, merged). Reference `design-targets/mobile/progress-details/luxury.jpg` ("The full picture"). PR C (frame, Body numbers, inline Log weight) is stacked on this branch. Each PR stays under 800 lines; the whole redesign is about 1,900. Revived by REVIVE-134 (agent 134): main brought in with `git merge origin/main` (2acc228c clean; 0015393c with one `src/components/README.md` conflict, resolved keeping main's DaySelector row and adding the progress/ row; no commit on main touched `ProgressScreen.tsx`, `src/components/progress/**`, `src/ui/**` or `src/theme/**` since m#610).
**Bug IDs:** B16 (rectangles), B29 (dashboard look, invented numbers); WEIGH-KB-128 U2 (empty "Body Stats" heading; BMI not from height_cm; BMI coloured as a verdict), U3 (invented "/ 2000 kcal"; zeros shown before the read lands or after it fails); REDO-AUDIT-133 APPLY rows: cream boxes, Title Case "Body Stats" / "Recent Entries", sub-13 pt labels, colour per macro, hardcoded radii on the sheet.
**T4 trigger scan:** none. No auth, tenancy, PII write, money, credentials or destructive data. Weight logging sends the same request.
**T3 trigger scan:** none. Same endpoints (GET /weight/history, GET daily log, POST weight), same query shape; `height_cm` is read from the existing history response.
**Bounded T1:** `src/screens/client/ProgressScreen.tsx`, new `src/components/progress/{TodayFood,WeighInRows}.tsx`, two test files, `src/screens/client/README.md` Progress row, `src/components/README.md` progress/ row.
**Canonical builder:** REDO-PROGRESS-133 (agent 133); finished by REVIVE-134 (agent 134).
**Parent owner:** operator agent 134.
**Acceptance evidence:** CI at the head. New `ProgressScreen.measures.test.tsx` (8), updated `ProgressScreen.weighIn.test.tsx`. Local, one file at a time through heavy.sh at this head (main 0015393c merged in): measures 8/8, weighIn 9/9; trend, chart, quietLuxuryDoctrine and romanP3HostWiring/FlagOff also pass at the stacked C head (m#616), which contains this code.
**Promotion triggers:** none.

## What changes for clients (More > Progress)
- Today's food: the calorie ring and three coloured macro bars become four hairline `QuietRow`s (`components/progress/TodayFood`). "1,240 of 2,100 kcal" only when a real target exists, "1,240 kcal" when none (no invented 2,000). "—" until the read lands; "Today's food did not load. Pull down to try again." when it fails (logged through `logger.error`); "Nothing logged yet today." when nothing is logged and there are no targets.
- BMI (U2): from `height_cm` on the GET /weight/history response first, then the cached inches. The value and category are monochrome words. The section renders only when BMI or daily energy exists, so no empty heading.
- Recent weigh-ins: hairline rows (`components/progress/WeighInRows`), day and note left, weight in serif lining tabular figures with a muted "lb" right.
- Log weight sheet: `radius.sheet` top corners, `radius.input` fields, `sc.overlay` scrim, `sc.bgSurface` sheet, Headline h2 title, shared `PrimaryButton` for Save (spinner while saving, disabled while empty). The visible label stays "Save weight log entry" because the doctrine test presses that label and `PrimaryButton` still has no separate accessibilityLabel prop on main (NEED logged for the design-system owner).
- Removed: the CalorieRing (svg) use on this screen, macroData, bmiColor, SCREEN_WIDTH, the card styles.

## Routes/actions before -> after
| Label | Before (main 2acc228c) | After |
|---|---|---|
| Log weight (FAB) | opens the sheet | unchanged here (moves inline in PR C) |
| Enter weight in pounds / Enter optional notes | sheet fields | same, rounded |
| Save weight log entry | POST weight, double-tap latch, reload | same handler via `PrimaryButton` |
| Close log weight modal, iOS Done bar, KeyboardAvoidingView | kept | kept |
| View progress report, Share run, 7D/30D/90D/All, pull to refresh, chart retry | kept | kept (untouched) |

Nothing removed; formatLogDate "Wed 7 Oct" kept.

## R1 (checked on main 2acc228c, `ProgressScreen.tsx`)
`target={macroTargets?.calories || 2000}` :528 (U3); `bmiColor` warning/success/error :385-392 (U2); "Body Stats" :668-671 and "Recent Entries" :695 in Title Case. All still on main; this PR removes them.

## Parity
| Prototype screen / reference | Today's file | What matches | What differs and why |
|---|---|---|---|
| no prototype (Progress is not in onboarding 00-86); design-targets/mobile/progress-details/luxury.jpg (Body block, Recent check-ins) | src/screens/client/ProgressScreen.tsx (today's food, BMI, recent weigh-ins, sheet), src/components/progress/TodayFood.tsx, WeighInRows.tsx | Overline sections with one hairline, no boxes; rows separated by hairlines; numbers in tabular figures, serif for weights; muted secondary text; sentence-case labels | The reference has no food or BMI block; they stay because they are this screen's data and are drawn as the same quiet rows. Photos and the PR table are not this screen's data. The top of the screen (title, stats, goal card, FAB) is still the old layout until PR C. |

## Not seen on a device
Not opened on an iPhone or Android build. Agent 133 rendered it through react-native-web at 360x800 and 390x844 with the real fonts and theme tokens (operator workspace `ops/reports/REDO-PROGRESS-133-render/prB-full-{360,390}.png`, `prB-sheet-390.png`); those renders predate the main merge (no change to these files since). Insets come from react-native-safe-area-context; no `SafeAreaView` from 'react-native'.

## WHY / WHEN / WHO
- Root cause: the screen was built as a dashboard in the initial commit f861d39b (2026-03-15): Body Stats card with verdict colours (bmiColor), Recent Entries with "lbs", cream cards with radius 4. The "/ 2000 kcal" default (`macroTargets?.calories || 2000`) and the BMI read from cached inches only came with 30451e9d (2026-03-30). The today's-food catch only console-logged and left zeros on screen.
- Why it was not on main yet: finished and pushed at 18:55 but stopped by the stop-and-drain order before a PR was opened; REVIVE-134 brought main in and opened it.

## README
`src/screens/client/README.md` ProgressScreen row; `src/components/README.md` new `progress/` row (doctrine section 8: new components get a row; m#610's PeriodTabs and WeightTrendChart are listed with them).

agent 134
