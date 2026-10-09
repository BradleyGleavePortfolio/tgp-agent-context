**Tier:** T1 (presentation only)
**Why:** Owner 17:10, "start the mobile redesigns that were unfinished": APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128, REDO-AUDIT-133 rows #488 and #482). The session detail and Community Today still had 4 pt filled buttons, "See Calendar" in Title Case and a home-made retry.
**T4 trigger scan:** none. No auth, tenancy, PII, money, credentials or destructive data. Cancel still goes through the same `useCancelSession` mutation with the same confirm dialog.
**T3 trigger scan:** none. No API, query key, payload, flag or route changes; every navigate call and flag fallback is the same.
**Bounded T1:** `src/screens/client/calendar/CalendarSessionScreen.tsx`, `src/screens/community/CommunityTodayScreen.tsx`, three test files, three README rows.
**Canonical builder:** REDO-HABITS-CAL-COMM-133 (agent 133).
**Parent owner:** operator agent 133.
**Acceptance evidence:** `calendarScreens.test.tsx` 59/59 (2 new: one rounded forest Join pinned in the footer, every other action a hairline row, serif title line height, no top padding; a failed read shows a text retry and no filled button). `CommunityTodayScreen.test.tsx` 12/12 (2 new: one rounded forest New post in the footer, serif date line height, "1 member"; a failed load shows a text retry and no filled button). `communityMessageCoach` 5/5, `communityScreens` 22/22, `communityLeaderboardEntry` 5/5. Guards `quietLuxuryDoctrine`, `copyVoice`, `truthfulCopy` pass. Targeted tsc on the touched files is clean. CI below.
**Promotion triggers:** none.

Uses `QuietRow` and `QuietSection title` from DS-PRIMITIVES-133 PR 2 (on main via m#587).

## What changes for coaches/clients
Clients only.
- Calendar > a session: a small "With <coach>" overline, the session title in serif, a status dot with the status in words, then a "When" section with the date and time, the recap from the coach when there is one, and a "This session" section of hairline rows: Add to calendar, Reschedule, Pick another time, Message your coach, Cancel session. Join or Call is the one rounded forest button (12 pt corners), pinned at the bottom, and only inside the existing join window. An incomplete link now says "This link is incomplete" and offers "Open calendar" (was "See Calendar"). A failed read uses the shared calm error with "Try again".
- Community > Today: a "TODAY" overline over the serif date, one hairline section per item (overline, serif title, the member count / event time / end date, a chevron), and "New post" as the one rounded forest button pinned at the bottom. The cohort count reads "1 member" for one person. Loading is the shared skeleton; a failed load is the shared error with "Try again" (no 4 pt filled retry). The empty state keeps its single destination (Visit the Hall, Messages, or Send your coach a message).
Nothing was removed: Join/Call, add to phone calendar, reschedule, rebook, message, cancel, recap, every Today item, New post, empty-state actions and all flag fallbacks are kept.

## B / U
- B1 4 pt filled buttons: calendarUi `PrimaryButton` (radius.lg 4) for Join/Call and Open calendar; Community "New post", the empty action and the retry. All are now the shared `PrimaryButton` (`radius.button` 12).
- B2 Home-made retry at `CommunityTodayScreen.tsx:129-134`. Now `QuietError` (inline, text "Try again").
- B3 The session's primary action could scroll off with the actions list. Join/Call now sits in the pinned footer.
- U1 "See Calendar" (`CalendarSessionScreen.tsx:108`), Title Case. Now "Open calendar".
- U2 Today stacked two overlines ("Your spaces" over "Your cohort", "Today" over "Pinned post"). One overline per item now.
- U3 "1 members". Now "1 member".
- U4 The session screen had a SafeAreaView bottom edge inside a tab with a native header. `Screen edges={[]}`: the header owns the top, the tab bar the bottom.

## WHY / WHEN / WHO
- The 4 pt buttons were the rule at the time (radius.lg 4, "squared" quiet luxury). The session screen got them in K3 (#367, 6418e759, 10-03) and kept them through DES-AF (#488); Community Today got its own filled buttons and retry in DES-AK (#482, 01ffe914, 10-07). Owner 17:07 changed the rule to rounded corners; DS-PRIMITIVES-133 (#577, #587) added the tokens and shared parts used here.
- "See Calendar" came with K3 (#367, 6418e759).

## R1 (rows checked on main before building)
"See Calendar" (:108) and the home-made retry (:129-134) were still on main; nothing in this file set had been fixed already.

## Parity
| Prototype screen | File | Matches | Differs and why |
|---|---|---|---|
| no prototype; Q5 + doctrine (style reference: design-targets/mobile/plan-fullweek) | calendar/CalendarSessionScreen.tsx | Overline, serif title, tabular serif date and time, hairline rows, one forest action, status dot | No prototype for the session detail. |
| no prototype; Q5 + doctrine (style reference: design-targets/mobile/plan-fullweek, clientfile-workouts) | community/CommunityTodayScreen.tsx | Overline date, serif titles, hairline sections with chevrons, one forest action | No prototype for Community Today. No author names, post bodies or counts are invented: the server sends none. |

## Not seen on a device
Nobody has run this on a phone. Rendered through the jest renderer (style assertions, not pixels). Both screens own no device inset (native header or the Community shell on top, tab bar below), so 360x800 and 390x844 insets do not change them; the tests assert the session root has no top padding.

## README
`src/screens/client/README.md` (CalendarSessionScreen), `src/screens/community/README.md` (Today) and `docs/QUIET_LUXURY_DOCTRINE.md` section 8 (new "Client session detail and Community Today" row).

agent 133
