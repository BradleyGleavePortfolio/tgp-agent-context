**Tier:** T1 (presentation and honest numbers)
**Why:** Owner 17:10 "start the mobile redesigns that were unfinished" and 17:07 "nice rounded corners, luxurious, not rectangles". REDO-PROGRESS-133, PR C of 3 (frame, Body numbers, inline Log weight). Follows m#610 (weight trend, merged) and PR B m#615 (today's food, BMI, weigh-ins, sheet). **Stacked on m#615** (base `agent133/redo-progress-133-b`; the merge loop retargets it to main after m#615 merges). Reference `design-targets/mobile/progress-details/luxury.jpg` ("The full picture"). With this PR the screen matches the reference end to end. Revived by REVIVE-134 (agent 134): B's head merged in twice (it carries main 0015393c); one `src/components/README.md` conflict, resolved keeping main's DaySelector row and C's progress/ row.
**Bug IDs:** B16 (rectangles), B29 (dashboard look); WEIGH-KB-128 U12 (Start and Change read the period's first entry, so switching 7D/30D moved the starting point); DESIGN-QA-128 row 17 and REDO-AUDIT-133 APPLY: floating forest FAB (a second filled button over the content), paddingTop 60 under the native back header, Title Case "Goal Progress", cream stat and goal cards with radius 4, uppercase 10 pt labels, header icon buttons. New in this round (REVIVE-134, from the code): the run line said "1 days in a row with a weigh-in" after a single day (main `ProgressScreen.tsx:494` shows it for any run above 0).
**T4 trigger scan:** none. No auth, tenancy, PII write, money, credentials or destructive data.
**T3 trigger scan:** none. One more read of the existing GET /weight/history?days=3650 (sequential after the period read; "All" reuses its own); no new endpoint, payload or route.
**Bounded T1:** `src/screens/client/ProgressScreen.tsx`, new `src/components/progress/{BodyNumbers.tsx,progressFormat.ts}`, two test files, `src/screens/client/README.md` Progress row, `src/components/README.md` progress/ row.
**Canonical builder:** REDO-PROGRESS-133 (agent 133); finished by REVIVE-134 (agent 134).
**Parent owner:** operator agent 134.
**Acceptance evidence:** CI at the head. New `ProgressScreen.fullPicture.test.tsx` (11; two added by REVIVE-134 for the run line: one day names no run, two days do), updated `ProgressScreen.trend.test.tsx`. Local, one file at a time through heavy.sh at this head (main 0015393c merged in): fullPicture 11/11, trend 8/8, measures 8/8, weighIn 9/9, chart 8/8, quietLuxuryDoctrine 34/34 (its run cases 2 / 3 / 60+ pass the new rule), romanP3HostWiring 35/35, romanP3FlagOff 11/11.
**Promotion triggers:** none.

## What changes for clients (More > Progress)
- Frame: the shared `Screen` (`edges={[]}`: it sits under MoreStack's native back header, `ClientNavigator.tsx:506` `backOnlyHeader()`, so no extra top padding; insets from react-native-safe-area-context) with the RefreshControl; the Modal stays outside the scroll.
- Hero: Headline h1 "The full picture" and a "Since 13 June" overline from the first weigh-in ever (`formatSince`; the year only when it is not this year).
- The run line "4 days in a row with a weigh-in" (only from two days in a row) with a text "Share" link from three days (same ShareCard milestone payload and analytics), replacing the header share icon.
- Body: one hairline section with four numbers between vertical hairlines (`components/progress/BodyNumbers`: overline label, serif 30/38 lining tabular figure, muted "lb"), Weight / Start / Goal / Change with a true minus; "—" while the first read runs or after it fails. The goal as one `QuietBar` ("From 196.2 to 175 lb", "60% of the way"). BMI and daily energy rows move in here. A new client sees "No weigh-ins yet. The first one sets the starting point." and no period tabs.
- Log weight is the one filled forest `PrimaryButton`, inline at the end of Body (testID `progress-log-weight`, label unchanged). The FAB is gone.
- U12: Weight, Start, Change, the goal bar, Since and the run read every weigh-in. The sentence under the chart still reads only the period.
- "View progress report" moves from a header icon to a quiet foot row (`QuietRow` with chevron), as "Export this report" sits in the reference.

## Routes/actions before -> after
| Label | Before (main 2acc228c / m#615) | After |
|---|---|---|
| Log weight | floating FAB, opens the sheet | inline forest `PrimaryButton`, opens the same sheet |
| View progress report | header icon -> `Report` | foot `QuietRow` -> `Report` |
| Share N days in a row with a weigh-in | header icon from 3 days -> `ShareCard` | text "Share" beside the run line from 3 days -> same `ShareCard` payload |
| 7D / 30D / 90D / All, chart retry, pull to refresh | kept | kept (period tabs hidden only when there are no weigh-ins at all) |
| Sheet fields, Save, Close, Done bar | kept | kept |
| Roman streak block (flag-gated) | kept | kept verbatim |

## R1 (checked on main 2acc228c, `ProgressScreen.tsx`)
`paddingTop: 60` :851; FAB :721 / style :1102; "Goal Progress" card :586-608; Start from the period's first entry `weightLogs[0]` :373 (U12); run line for any run above 0 :494; report and share as header icons :465-491. All still on main.

## Parity
| Prototype screen / reference | Today's file | What matches | What differs and why |
|---|---|---|---|
| no prototype (Progress is not in onboarding 00-86); design-targets/mobile/progress-details/luxury.jpg | src/screens/client/ProgressScreen.tsx, src/components/progress/BodyNumbers.tsx, progressFormat.ts | Serif editorial title; "Since" overline; Body block of four large serif numbers between hairlines with small overline labels and units; hairline sections in order; one quiet text action at the foot | Body shows weight, start, goal and change (the reference shows body fat and lean mass, which this app does not record). Log weight is a filled forest button inside Body because logging is this screen's one action (one filled forest button per screen); the reference has no input. Photos, workout volume and the PR table are not this screen's data; the weight trend takes the chart slot. |

## Not seen on a device
Not opened on an iPhone or Android build. Agent 133 rendered it through react-native-web at 360x800 and 390x844 with the real fonts and theme tokens, including the empty state and the sheet (operator workspace `ops/reports/REDO-PROGRESS-133-render/prC-full-{360,390}.png`, `prC-empty-390.png`, `prC-sheet-390.png`); the native back header and the bottom tab bar are drawn by the navigator and were not in the render. Serif line heights >= 1.2 x size (asserted).

## WHY / WHEN / WHO
- Root cause: the FAB, the 60 pt header padding, the stat cards and the Goal Progress card came with the initial commit f861d39b (2026-03-15), when Progress had no native header; it now sits under MoreStack's native back header and kept the padding. Start and Change read `weightLogs[0]`, the period's first entry, since 30451e9d (2026-03-30). The run line's `loggingStreak > 0` condition came with the weigh-in run copy in 56bb5dd3 (2026-10-07, "replace invented client copy", PR #470).
- Why it was not on main yet: finished and pushed at 18:55 but stopped by the stop-and-drain order before a PR was opened; REVIVE-134 brought main in and opened it.

## README
`src/screens/client/README.md` ProgressScreen row; `src/components/README.md` progress/ row extended with BodyNumbers and the formatters.

agent 134
