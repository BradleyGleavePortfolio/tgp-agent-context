REDO-PROGRESS-133, PR B of 3 (today's food, BMI, weigh-ins, sheet). Follows #610 (weight trend). Reference `design-targets/mobile/progress-details/luxury.jpg` ("The full picture"). PR C (frame, Body numbers, inline Log weight) follows. Each PR stays under 800 lines; the whole redesign is about 1,900.

Bug IDs: WEIGH-KB-128 U2 (empty "Body Stats" heading; BMI not from height_cm; BMI coloured as a verdict), U3 (invented "/ 2000 kcal"; zeros shown before the read lands or after it fails); REDO-AUDIT-133 APPLY rows: cream boxes, Title Case "Body Stats" / "Recent Entries", sub-13 pt labels, colour per macro, hardcoded radii on the sheet.

## What changes
- Today's food: the calorie ring and three coloured macro bars become four hairline `QuietRow`s (`components/progress/TodayFood`). "1,240 of 2,100 kcal" only when a real target exists, "1,240 kcal" when none (no invented 2,000). "—" until the read lands; "Today's food did not load. Pull down to try again." when it fails (logged through `logger.error`); "Nothing logged yet today." when nothing is logged and there are no targets.
- BMI (U2): from `height_cm` on the GET /weight/history response first, then the cached inches. The value and category are monochrome. The section only renders when BMI or daily energy exists, so no empty heading.
- Recent weigh-ins: hairline rows (`components/progress/WeighInRows`), day and note left, weight in serif lining tabular figures with a muted "lb" right.
- Log weight sheet: `radius.sheet` top corners, `radius.input` fields, `sc.overlay` scrim, `sc.bgSurface` sheet, Headline h2 title, shared `PrimaryButton` for Save (spinner while saving, disabled while empty). Visible label stays "Save weight log entry" because the doctrine test presses that label and PrimaryButton has no separate accessibilityLabel prop yet (NEED logged for DS-PRIMITIVES-133).
- Removed: CalorieRing (svg), macroData, bmiColor, SCREEN_WIDTH, the card styles.
- Kept: every handler and label (Log weight FAB still here until PR C, 'Enter weight in pounds', 'Enter optional notes', 'Save weight log entry', 'Close log weight modal', the iOS Done bar, KeyboardAvoidingView, the double-tap latch), formatLogDate "Wed 7 Oct".

## Parity (Q5 / R5)
| Reference folder | Today's file | What matches | What differs and why |
|---|---|---|---|
| progress-details/ (luxury.jpg: Body block, Recent check-ins) | src/screens/client/ProgressScreen.tsx (today's food, BMI, recent weigh-ins, sheet), src/components/progress/TodayFood.tsx, WeighInRows.tsx | Overline sections with one hairline, no boxes; rows separated by hairlines; numbers in tabular figures, serif for weights; muted secondary text; sentence-case labels | The reference has no food or BMI block; they stay because they are this screen's data and are drawn as the same quiet rows. Photos and the PR table are not this screen's data. The top of the screen (title, stats, goal card, FAB) is still the old layout until PR C. |

Not seen on a device: not opened on an iPhone or Android build. Rendered through react-native-web at 360x800 and 390x844 with the real fonts and theme tokens (ops/reports/REDO-PROGRESS-133-render/prB-full-390.png, prB-full-360.png, prB-sheet-390.png in the operator workspace).

## WHY / WHEN / WHO
- Root cause: the screen was built as a dashboard in the initial commit f861d39b (2026-03-15, Bradley Gleave): Body Stats card with verdict colours (bmiColor), Recent Entries with "lbs", cream cards with radius 4. The "/ 2000 kcal" default (`macroTargets?.calories || 2000`) and the BMI read from cached inches only came with 30451e9d (2026-03-30). The today's-food catch only console-logged and left zeros on screen.

## Tests
- New `src/screens/client/__tests__/ProgressScreen.measures.test.tsx` (8): BMI from height_cm in monochrome; no BMI row or heading without a height; no invented target; "of" against real targets; "—" while the read runs; the failed-read line; weigh-ins newest first with the note; sheet, field and Save on the radius tokens.
- `ProgressScreen.weighIn.test.tsx`: the saving check reads the label PrimaryButton keeps for screen readers (`getByLabelText('Saving')`).
- Local, one file at a time: measures 8/8, trend 8/8, weighIn 9/9, chart 8/8, quietLuxuryDoctrine 34/34, romanP3HostWiring 35/35, romanP3FlagOff 11/11; tsc clean; eslint clean.

agent 133
