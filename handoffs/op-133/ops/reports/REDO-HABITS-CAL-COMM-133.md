# REDO-HABITS-CAL-COMM-133 (agent 133 lane) — APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128)
Worktree /home/user/workspace/wt/REDO-HABITS-CAL-COMM-133-mobile. Status (18:59 PDT): SAFE STOP (owner 18:57). m#598 merged; m#612 READY, waiting on lenses; Habits part 2 (H2) committed locally, NOT pushed.

## PRs
| PR | Branch | Base | Lines | Contents | State |
|---|---|---|---|---|---|
| m#598 | agent133/redo-habits-cal-comm-133 | main | +240 / -368 (608) | Habits page: HabitsScreen + habits/styles (page keys), tests, README rows | MERGED (Opus + Sol APPROVE @ 27b56db0) |
| m#612 | agent133/redo-cal-comm-133 | main | +295 / -334 (629) | CalendarSessionScreen, CommunityTodayScreen, tests, README rows | READY @ 6fa49b1ed2deb02356c02f04fa2e5aa1b79c05a1, CI green, no verdict yet (Opus B claimed then released) |
| (H2, not opened) | agent133/redo-habits-rows-133 @ 39b23a2b (local only) | main | +305 / -392 (697) vs m#598 head | HabitCard, AddHabitSheet, MoodEnergyPicker, styles child keys, makeStyles(sc), tests, README | not pushed: safe stop came before m#598's merge could be brought in |

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
Habits page (m#598, merged, head 27b56db0): HabitsFasting.launch 31/31, HabitsCheckInGate 13/13, MoodEnergyPicker 1/1, quietLuxuryDoctrine 34/34,
copyVoice 8/8, truthfulCopy 20/20; targeted tsc + eslint clean.
H2 (local 39b23a2b): HabitsFasting.launch 33/33, HabitsCheckInGate 13/13, MoodEnergyPicker 1/1, guards pass; targeted tsc + eslint clean.
CC (local, with ds-wheel-rows merged): calendarScreens 59/59, CommunityTodayScreen 12/12, communityMessageCoach 5/5, communityScreens 22/22,
communityLeaderboardEntry 5/5; targeted tsc clean.

## Notes for operator
- Habits check-in tab still shows "Daily check-ins need active coaching access." + ProtectedScreen lock for inactive clients. The gate is
  src/entitlements/** (agent 132, b#888 COACHLESS-LOG). Not touched here.
- For DS-PRIMITIVES: `useScreenInsets` calls `useContext(SafeAreaInsetsContext)`; tests that mock react-native-safe-area-context without
  `SafeAreaInsetsContext` crash on any `Screen`. I added the export to my two test mocks (calendarScreens, communityMessageCoach). Other
  redo builders will hit the same thing.

PR bodies: REDO-HABITS-CAL-COMM-133-pr-habits-page-body.md, REDO-HABITS-CAL-COMM-133-pr-cal-comm-body.md (this folder).

## HANDOFF (18:59 PDT, safe stop)
- m#598 (Habits page) MERGED to main.
- m#612 (session detail + Community Today) OPEN at 6fa49b1ed2deb02356c02f04fa2e5aa1b79c05a1. CI green, READY posted. Waiting on the Opus and
  Sol lenses. Next agent: if a lens posts REQUEST CHANGES at that head, fix only its Bs in the worktree on branch agent133/redo-cal-comm-133,
  run the touched test file through heavy.sh, push once, then post FIX ROUND 2.
- H2 (Habits rows, sheet, check-in controls) is done and committed on local branch agent133/redo-habits-rows-133 @ 39b23a2b. It is NOT
  pushed and has no PR. Body ready: REDO-HABITS-CAL-COMM-133-pr-habits-rows-body.md. When work resumes (only if the owner allows new PRs):
  `git checkout agent133/redo-habits-rows-133 && git fetch -q origin && git merge origin/main` (m#598 is in main, so the diff becomes H2
  only, about 697 lines). Then run HabitsFasting.launch, HabitsCheckInGate, habits/__tests__/MoodEnergyPicker and quietLuxuryDoctrine one at a
  time, check the size, push once, and open the PR with that body. Title: "[133] APPLY-HABITS-CAL-COMM-133 feat(habits): habit rows, Add habit
  sheet and check-in controls on the shared primitives (2 of 2)".
- Until H2 lands, main has the new Habits page but the old children: 7 TouchableOpacity, a 4 pt Create habit button and literal radii in
  the child style keys of habits/styles.ts. These work and look plain next to the new page.
- Not mine, still open: the Habits check-in lock for inactive clients (entitlements, agent 132 b#888); the SafeAreaInsetsContext mock note
  for DS-PRIMITIVES (above).
