REDO-PROGRESS-133, PR A of 3 (chart). Redraws the weight trend on More > Progress to `design-targets/mobile/progress-details/luxury.jpg` ("The full picture": the Workout volume chart). The rest of the screen (Body numbers, inline Log weight in place of the floating button, today's food, BMI, entries, the sheet) follows in PR B and PR C. The whole redesign is about 1,800 changed lines (the old ProgressScreen.tsx is 1,325 lines), so it is split to keep each PR under 800.

Bug IDs: REDO-AUDIT-133 APPLY (REDO-PROGRESS-133) rows: cream boxes, Title Case "Weight Trend", sub-13 pt labels, hardcoded 4 pt radii (chart part). New: "All" asked for 365 days only.

## What changes
- The chart sits in a hairline `QuietSection` with a "Weight trend" overline (`src/ui`), instead of a cream box with radius 4 and a Title Case serif title.
- 7D / 30D / 90D / All are text tabs with a 1 pt underline on the active one (`components/progress/PeriodTabs`, HapticPressable, 44 pt targets, `accessibilityState.selected`), instead of filled forest blocks. The tabs now sit with the chart they control.
- `components/progress/WeightTrendChart` replaces LegacyWeightChart for the shipped build (romanFirstPaymentBodyweightPolish is off): static line in ink, three dashed hairline guides with tabular pound labels, the first and last day under the line, the latest point in forest. It measures its own width (onLayout), so it fits 360 and 390 wide phones. The flag-on ProgressChartCard path is unchanged.
- One sentence under the line reads only the selected period: "Down 3 lb / over the last 30 days" (`progressFormat.periodSummary`); "Steady" when flat.
- "All" asks the server for every weigh-in (3,650 days; GET /weight/history has no cap) instead of the last 365.
- Empty copy is plain: "No weigh-ins in this period." / "One weigh-in in this period. The line appears after the second." The failed-load state (CoachErrorState, same copy and retry testID) is unchanged.
- Kept: every action and handler (period change, retry, pull to refresh), the doctrine labels `Show ${p} period`, testIDs `progress-weight-chart-legacy`, `progress-weight-chart`, `progress-weight-chart-error`.

## Parity (Q5 / R5)
| Reference folder | Today's file | What matches | What differs and why |
|---|---|---|---|
| progress-details/ (luxury.jpg, Workout volume block) | src/screens/client/ProgressScreen.tsx (weight trend section), src/components/progress/* | Overline section with one hairline; open chart with no box; dashed guides; muted tabular axis labels; one line, latest point marked; one serif sentence under the chart with a muted detail line | The reference charts weekly sets; this screen charts body weight, so the line is weight and the sentence is the period change. Underline tabs come from the CATALOG pattern ("underline-on-active, no pill backgrounds"), the reference has no period control. Photos, PR table and "Export this report" are not part of this screen's data; the report link stays as the existing "View progress report" (PR B). The rest of the screen is still the old layout until PR B and PR C land. |

Not seen on a device: this was not opened on an iPhone or Android build. Rendered locally through react-native-web at 360x800 and 390x844 (real fonts, real theme tokens, demo data); the screenshots are in the operator workspace (ops/reports/REDO-PROGRESS-133-render/prA-full-360.png, prA-full-390.png). Insets are unchanged in this PR (the screen frame is PR C).

## WHY / WHEN / WHO
- Root cause: the chart was built as a dashboard card (filled period buttons, cream box, radius 4, Title Case serif title) in the initial commit f861d39b (2026-03-15) and kept through 30451e9d; the flag-off LegacyWeightChart (2 pt forest stroke with a dot on every entry, no axis labels) came with f2dde9b3, PR #242 (ED.4). "All" mapped to `null || 365` since the initial commit.
- Who: Bradley Gleave (initial commit); BradleyGleavePortfolio, PR #242, for the static fallback.

## Tests
- New `src/screens/client/__tests__/ProgressScreen.trend.test.tsx` (8): overline copy, the period sentence, active tab state, All asks for 3,650 days (not 365), both empty lines, chart width inside the gutters at 360x800 and 390x844, progressFormat.
- Passing locally, one file at a time: ProgressScreen.trend 8/8, ProgressScreen.chart 8/8, ProgressScreen.weighIn 9/9, quietLuxuryDoctrine 34/34, romanP3HostWiring 35/35, romanP3FlagOff 11/11; `tsc --noEmit` clean; eslint clean on changed files.

agent 133
