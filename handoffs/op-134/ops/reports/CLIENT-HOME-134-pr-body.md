**Tier:** T2 (client Home copy and tab-bar layout; no data, auth, money or tenancy change)
**Why:** B25, B26, B34 from the owner's 10-08 Android run as a coachless client (bug register, phone screenshots 1000021160 / 1000021162).
**T4 trigger scan:** none. No auth, RLS/tenancy, PII/health data, money, credentials or destructive data touched. Navigation targets are existing routes only (`Messages`, `MoreTab → RomanChat`, `NotificationCenter`).
**T3 trigger scan:** none (no backend, no schema, no flags, no new dependency).
**Bounded T1:** 4 source files + 1 new helper, 3 READMEs, 3 tests updated + 1 new test file.
**Canonical builder:** CLIENT-HOME-134 (claude_opus_5_5), agent 134.
**Parent owner:** operator agent 134.
**Acceptance evidence:** jest (CI): `HomeHeaderActions.test.tsx`, `clientTabLabels.test.tsx`, `HomeScreen.honestCopy127.test.tsx`, new `homeDate.test.ts`. Text width for B26 measured from the shipped Inter font file (below).
**Promotion triggers:** none.

## What changes for clients
- **B25** A client with no coach no longer sees "Message your coach" at the top of Home. While the saved account is still being read (the first moment after Home opens), that place stays empty, so a coached client never sees "Ask Roman" flash before "Message Bradley" (fix round 2, Opus U1). With Roman chat on, that place reads **Ask Roman** (Roman's face and the label, opening the same Roman chat the small avatar opened; there is no second Roman button). With Roman chat off, the place is empty and only the bell shows. Clients with a coach see exactly what they saw before ("Message Bradley", Roman avatar, bell, unread counts).
- **B26** "Community" stays on one line on a 360 pt wide Android phone. All six tabs, their names, icons, order and destinations are unchanged.
- **B34** The Home date reads "Thursday, 8 October" in UK English and "Thursday, October 8" in US English (the phone's own locale order), still in the small-caps overline like prototype 63. It no longer says "THURSDAY, THE EIGHTH."

## Bugs
| ID | What the owner saw | Fix | Test |
|---|---|---|---|
| B25 | Coachless Home said "Message your coach" | `HomeHeaderActions` renders the coach entry only when `coach_id` is set; coachless gets "Ask Roman" or nothing | `HomeHeaderActions.test.tsx` (coachless with and without Roman; coached unchanged), `HomeScreen.honestCopy127`: the coachless row has no "coach" text, and the coachless-actions case no longer presses a coach entry (it asserted the bug) |
| B26 | "Communi / ty" on two lines | `typography.tabLabel` / `tabLabelActive` tokens (Inter 11 pt, -0.2 tracking), `numberOfLines={1}` + `adjustsFontSizeToFit`, `tabBarItemStyle: { paddingHorizontal: 0 }` | `clientTabLabels.test.tsx` (tokens, one line, width budget) |
| B34 | "THURSDAY, THE EIGHTH." | `homeDateLine()` = `Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' })`; ordinal-word table removed | `homeDate.test.ts` (en-GB, en-US, fr-FR, days 1-31), `HomeScreen.honestCopy127` |

B26 width (from the code and the font file, not a device): six tabs on 360 pt = 60 pt each. react-navigation 7's tab item had 5 pt padding each side (50 pt for the label). "Community" in `Inter_500Medium.ttf` (@expo-google-fonts/inter 0.4) is 5.484 em = 60.3 pt at 11 pt, so it wrapped. Now: 58.5 pt with -0.2 tracking inside the full 60 pt. Larger system text sizes shrink the label to fit (`adjustsFontSizeToFit`, capped at 1.3x) instead of wrapping.

## WHY / WHEN / WHO
- **B25** Root cause: `messageCoachLabel()` falls back to "Message your coach" and the entry rendered for every client, coach or not. Introduced in 9c6d8bfa, m#304 "clinic/m2: Home message+bell..." (2026-09-30). The old test even asserted the fallback for `coach_id: null`.
- **B26** Root cause: tab labels were turned on at 11 pt with no line limit and the default 5 pt item padding, with six tabs. Introduced in 0b4e065f, m#467 (agent127/des-a-127, 2026-10-07) "fix(mobile): clarify launch appearance and client navigation".
- **B34** Root cause: `buildDateAsPoetry()` wrote the day as ordinal words with a trailing full stop and no month, inside an uppercase overline. Introduced in 4faec4a8, m#53 "luxury(wave3): hero screen rewrite" (2026-04-25).

## Parity table (prototype `specs134/shots`)
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 63 LAND (Home) | `src/screens/client/HomeScreen.tsx`, `src/screens/client/homeDate.ts` | Date overline: weekday, day, month in the overline token ("WEDNESDAY, 30 SEPTEMBER" shape), no ordinal words, no full stop | Order follows the phone's locale (US phones read "October 8"), as the job asks; the greeting, next-session and targets card are not in this PR's scope |
| 63 LAND (Home, "Message your coach" row) | `src/components/home/HomeHeaderActions.tsx` | Coached client: the coach entry stays and opens Messages | The prototype has only a coached sample client (Maya, coach Bradley). Coachless: owner 15:29 "everything ... besides getting direct coaching": no coach action; Roman offered instead (the only truthful alternative) |
| 63 LAND / 46-60 tab bar | `src/navigation/ClientNavigator.tsx`, `src/theme/tokens.ts` | Outline icons on a hairline bar over the bone background | The prototype has four icon-only tabs with an ink active icon; the app keeps its six labelled tabs and forest active tint (owner 16:20: tabs and button counts stay), and B26 sizes those labels by token so all six fit at 360 pt |

## Routes and actions before -> after (Home header)
| Client | Before | After |
|---|---|---|
| With coach | Message <name> -> `Messages`; Roman avatar -> `MoreTab/RomanChat` (flag); bell -> `NotificationCenter` | unchanged |
| Coachless, Roman chat on | "Message your coach" -> `Messages` (empty, no coach); Roman avatar -> `RomanChat`; bell | "Ask Roman" (avatar + label) -> `MoreTab/RomanChat`; bell. The untruthful coach entry is removed (no coach exists); Roman stays one tap away |
| Coachless, Roman chat off | "Message your coach" -> `Messages`; bell | bell only |
Messages stays registered on the Home stack and reachable from More > Membership (existing test kept).

## Overlap with open PRs
`gh pr diff --name-only` on m#603, m#604, m#605, m#606, m#612: none touches these files. m#582 (DS-PRIMITIVES-133, now on main) changed `HomeScreen.tsx` imports, the root SafeAreaView (react-native-safe-area-context) and the CTA radii; this PR changes only the date helper block and the date line, so Home's insets and button radii are m#582's (main merged in, clean). m#590 / m#607 touch `src/theme/tokens.ts` in the radius block only; the new tab tokens sit in the typography block. m#576 and m#606 touch `src/components/README.md` around lines 75-76; this PR edits line 79 only (unchanged lines between).

## Not seen on a device
Nothing here was seen on a phone. The coachless header, the tab labels at 360 pt and at larger system text sizes, and the date in a UK-locale phone were checked through jest and the font measurement only. Android `adjustsFontSizeToFit` behaviour at large font scale is from React Native's documented support, not a device run.

C (edge, deferred to 10k clients): `DunningBanner` keeps "Message coach" for billing states, which only exist for clients who bought a coach's plan.

agent 134
