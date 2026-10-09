REDO-PROGRESS-133, PR C of 3 (frame, Body numbers, inline Log weight). Follows #610 (weight trend) and PR B (today's food, BMI, weigh-ins, sheet). Reference `design-targets/mobile/progress-details/luxury.jpg` ("The full picture"). With this PR the screen matches the reference end to end.

Bug IDs: WEIGH-KB-128 U12 (Start and Change read the period's first entry, so switching 7D/30D moved the starting point); DESIGN-QA-128 row 17 and REDO-AUDIT-133 APPLY: floating forest FAB (a second filled button competing with nothing, over the content), paddingTop 60 under the native back header, Title Case "Goal Progress", cream stat and goal cards with radius 4, uppercase 10 pt labels, header icon buttons.

## What changes
- Frame: the shared `Screen` (`edges={[]}`, it sits under MoreStack's native back header, so no extra top padding; insets from react-native-safe-area-context via Screen) with the RefreshControl; the Modal stays outside the scroll.
- Hero: Headline h1 "The full picture" and a "Since 13 June" overline from the first weigh-in ever (`formatSince`; the year only when it is not this year).
- The run line "4 days in a row with a weigh-in" with a text "Share" link (same ShareCard milestone payload and analytics), replacing the header share icon.
- Body: one hairline section with the four numbers between vertical hairlines (`components/progress/BodyNumbers`: overline label, serif 30/38 lining tabular figure, muted "lb"), Weight / Start / Goal / Change with a true minus; "—" while the first read runs or after it fails. The goal as one `QuietBar` ("From 196.2 to 175 lb", "60% of the way"). BMI and daily energy rows move in here. A new client sees "No weigh-ins yet. The first one sets the starting point." and no period tabs.
- Log weight is the one filled forest `PrimaryButton`, inline at the end of Body (testID `progress-log-weight`, label unchanged). The FAB is gone.
- U12: the screen reads every weigh-in once more (GET /weight/history?days=3650, sequential after the period read; "All" reuses its own) for Weight, Start, Change, the goal bar, Since and the run. The sentence under the chart still reads only the period.
- "View progress report" moves from a header icon to a quiet foot row (QuietRow with chevron), as "Export this report" sits in the reference.
- Kept: every route and handler (Report, ShareCard, period change, retry, refresh, the sheet), the Roman streak block and its flag gate verbatim, every doctrine label.

## Parity (Q5 / R5)
| Reference folder | Today's file | What matches | What differs and why |
|---|---|---|---|
| progress-details/ (luxury.jpg) | src/screens/client/ProgressScreen.tsx, src/components/progress/BodyNumbers.tsx, progressFormat.ts | Serif editorial title; "Since" overline; Body block of four large serif numbers between hairlines with small overline labels and units; hairline sections in order; one quiet text action at the foot | Body shows weight, start, goal and change (the reference shows body fat and lean mass, which this app does not record). Log weight is a filled forest button inside Body because logging is this screen's one action (Q5: one filled forest button per screen); the reference has no input. Photos, workout volume and the PR table are not this screen's data; the weight trend takes the chart slot. |

Not seen on a device: not opened on an iPhone or Android build. Rendered through react-native-web at 360x800 and 390x844 with the real fonts and theme tokens, including the empty state and the sheet (ops/reports/REDO-PROGRESS-133-render/prC-full-390.png, prC-full-360.png, prC-empty-390.png, prC-sheet-390.png in the operator workspace). The native back header and the bottom tab bar are drawn by the navigator and were not in the render.

## WHY / WHEN / WHO
- Root cause: the FAB, the 60 pt header padding, the stat cards and the Goal Progress card came with the initial commit f861d39b (2026-03-15, Bradley Gleave), when Progress had no native header; it now sits under MoreStack's native back header (ClientNavigator.tsx `backOnlyHeader()`) and kept the padding. Start and Change read `weightLogs[0]`, the period's first entry, since 30451e9d (2026-03-30).

## Tests
- New `src/screens/client/__tests__/ProgressScreen.fullPicture.test.tsx` (9): title is a header and Since reads the first weigh-in; sentence-case overlines, none of the old Title Case; Log weight inside the scroll, not absolute, on `radius.button`, opens the sheet; report link and period tabs kept; serif line height at least 1.2x; U12 Start 196 and Change "−13" from every weigh-in with both reads made; the period sentence; the new-client line; formatChange / formatSince.
- `ProgressScreen.trend.test.tsx`: the empty-period case now has an older weigh-in (a client with none at all sees the new-client line instead).
- Local, one file at a time: fullPicture 9/9, measures 8/8, trend 8/8, weighIn 9/9, chart 8/8, quietLuxuryDoctrine 34/34, romanP3HostWiring 35/35, romanP3FlagOff 11/11; tsc clean; eslint clean.

agent 133
