# REDO-HABITS-CAL-COMM-133 (agent 133 lane) — APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128)
Worktree /home/user/workspace/wt/REDO-HABITS-CAL-COMM-133-mobile. Status (18:25 PDT): building/opening. Three PRs, each under 800 lines.

## PRs
| PR | Branch | Base | Lines | Contents | State |
|---|---|---|---|---|---|
| m#598 | agent133/redo-habits-cal-comm-133 | main | +240 / -368 (608) | Habits page: HabitsScreen + habits/styles (page keys), tests, README rows | opened 18:23, CI pending |
| (H2) | agent133/redo-habits-rows-133 (local, commit on top of m#598) | main after m#598 merges | ~+295 / -392 (687) | HabitCard, AddHabitSheet, MoodEnergyPicker, styles child keys, makeStyles(sc), tests | waits for m#598 to merge (it edits the same two files) |
| (CC) | agent133/redo-cal-comm-133 | main after m#587 merges | ~+295 / -334 (629) | CalendarSessionScreen, CommunityTodayScreen, tests, README rows | waits for m#587 (QuietRow, QuietSection title; m#578 was merged into the PR 1 branch, not main) |

Operator mail 18:03 said "rebase onto origin/main"; Q1 forbids rebase, so main was brought in with `git merge origin/main` (same result for the PR diff).
Why split Habits: the whole Habits family was 1,247 changed lines (styles.ts alone 438). H1 = page, H2 = rows/sheet/check-in controls. H2 is not stacked (m#578 showed a stacked PR can merge into the parent branch and miss main); it opens on main after m#598 merges.

## R1 verification against main df7b8ae9 / a279e1f6 (all "from the code")
| Row (REDO-AUDIT-133 APPLY) | On main | Action | PR |
|---|---|---|---|
| habits/styles.ts:8 paddingTop 60 under native back header | still true | DS Screen edges [] (header owns top) | m#598 |
| 10 pt text habits/styles.ts:91 (progressLabel) | still true (style unused) | removed | m#598 |
| 13 TouchableOpacity (Habits 6, AddHabitSheet 2, HabitCard 1, MoodEnergyPicker 4) | still true | HapticPressable / DS buttons | 6 in m#598, 7 in H2 |
| ActivityIndicator + "Retry habits" HabitsScreen.tsx:322/:329 | still true (also "Retry check-in" :385) | QuietLoading + QuietError | m#598 |
| "See Calendar" CalendarSessionScreen.tsx:108 | still true | "Open calendar" via DS PrimaryButton | CC |
| Home-made retry CommunityTodayScreen.tsx:129-134 (filled 4 pt) | still true | QuietError | CC |
| 20 hardcoded radii habits/styles.ts | still true | radius tokens | page keys m#598, child keys H2 |
Extra (R3): CalendarSession primary used calendarUi PrimaryButton at radius 4 and a SafeAreaView bottom edge inside a tab; Community "New post" /
empty action were 4 pt filled buttons; double overlines ("Your spaces" + "Your cohort"); "1 members".

## B list
B1 double top gap on Habits (m#598). B2 4 pt filled buttons on Habits (m#598, H2), session detail and Community Today (CC). B3 spinner +
home-made retries on Habits (m#598) and Today (CC). B4 session primary could scroll away; now pinned footer (CC).
## U list
U1 10 pt text (m#598). U2 "0 of 1 today" counter -> one sentence (m#598). U3 "See Calendar" Title Case (CC). U4 double overlines (CC).
U5 "1 members" (CC). U6 TouchableOpacity in the habit children (H2).

## Tests run (one file at a time via heavy.sh)
Habits page (m#598 head 27b56db0): HabitsFasting.launch 31/31, HabitsCheckInGate 13/13, MoodEnergyPicker 1/1, quietLuxuryDoctrine 34/34,
copyVoice 8/8, truthfulCopy 20/20; targeted tsc + eslint clean.
H2 (local): HabitsFasting.launch 32/32, HabitsCheckInGate 13/13, MoodEnergyPicker 1/1, guards pass; targeted tsc + eslint clean.
CC (local, with ds-wheel-rows merged): calendarScreens 59/59, CommunityTodayScreen 12/12, communityMessageCoach 5/5, communityScreens 22/22,
communityLeaderboardEntry 5/5; targeted tsc clean.

## Notes for operator
- Habits check-in tab still shows "Daily check-ins need active coaching access." + ProtectedScreen lock for inactive clients. The gate is
  src/entitlements/** (agent 132, b#888 COACHLESS-LOG). Not touched here.
- For DS-PRIMITIVES: `useScreenInsets` calls `useContext(SafeAreaInsetsContext)`; tests that mock react-native-safe-area-context without
  `SafeAreaInsetsContext` crash on any `Screen`. I added the export to my two test mocks (calendarScreens, communityMessageCoach). Other
  redo builders will hit the same thing.

PR bodies: REDO-HABITS-CAL-COMM-133-pr-habits-page-body.md, REDO-HABITS-CAL-COMM-133-pr-cal-comm-body.md (this folder).
