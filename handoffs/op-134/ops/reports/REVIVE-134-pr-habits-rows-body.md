**Tier:** T1 (presentation only)
**Why:** Owner 17:10, "start the mobile redesigns that were unfinished", and owner 17:07 "nice rounded corners, luxurious, not rectangles": APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128, REDO-AUDIT-133 row #489), part 2 of 2 after m#598 (merged). On main 2acc228c the habit rows, the Add habit sheet and the check-in controls still use TouchableOpacity, 0-4 pt literal radii and a 4 pt filled Create button. Revived by REVIVE-134 (agent 134) from the saved branch; main brought in with `git merge origin/main` (2acc228c, then 0015393c; both clean).
**Bug IDs:** B16 (buttons are plain rectangles), B29 (flat, generic pages); REDO-AUDIT-133 APPLY rows for Habits (13 TouchableOpacity, 20 literal radii; the 7 + child-key radii left after m#598 are this PR).
**T4 trigger scan:** none. No auth, tenancy, PII, money, credentials or destructive data. `src/entitlements/**` and `ProtectedScreen` are not touched.
**T3 trigger scan:** none. No API, query key, payload or route changes. Tick, untick, hold-to-delete, create and check-in save send the same requests.
**Bounded T1:** `src/screens/client/habits/{HabitCard,AddHabitSheet,MoodEnergyPicker}.tsx`, `habits/styles.ts`, `HabitsScreen.tsx` (child props only: `sc` instead of the bridged `colors`, plus `todayIndex`), three test files, two README rows.
**Canonical builder:** REDO-HABITS-CAL-COMM-133 (agent 133); finished by REVIVE-134 (agent 134).
**Parent owner:** operator agent 134.
**Acceptance evidence:** CI at the head. Local, one file at a time through heavy.sh at this head (main 0015393c merged in): HabitsFasting.launch 33/33, HabitsCheckInGate 13/13, MoodEnergyPicker 1/1, quietLuxuryDoctrine 34/34, copyVoice 8/8, truthfulCopy 20/20. Tests: `HabitsFasting.launch.test.tsx` (2 new: the target in words without inventing a daily cadence; serif habit names whose line height never clips, a sheet with `radius.sheet` top corners, `radius.input` fields and a `radius.button` Create), `HabitsCheckInGate.test.tsx`, `habits/__tests__/MoodEnergyPicker.test.tsx` (every mood and energy word still selects its value at 13 pt; sleep steppers move by 0.5 h); guards `quietLuxuryDoctrine`, `copyVoice`, `truthfulCopy`.
**Promotion triggers:** none.

## What changes for coaches/clients
Clients only (Home > Habits).
- Each habit is a hairline row: an outlined check circle on the left that fills with a check when done, the habit name in serif, the target in words ("3 of 8 glasses", "Once a day" for a daily single tick) and this week as seven small dots under weekday letters, today marked. Tap still ticks/unticks; hold still deletes.
- The Add habit sheet has rounded 24 pt top corners and a grabber, a serif "New habit" title, rounded 12 pt fields, and Create habit is the shared rounded forest `PrimaryButton` with its spinner while saving (still disabled for a blank name and while saving).
- Check-in: each part opens with an overline (Mood, Energy, Sleep, Notes) and a serif question ("How are you feeling?", "How is your energy?", "Hours slept last night"). Mood and energy are five quiet dots with a word under each (no emoji, no colour code); sleep is a serif number between two round 44 pt steppers; the notes field is rounded, placeholder "Anything worth noting about today".

## Routes/actions before -> after
| Label | Before (main 2acc228c) | After |
|---|---|---|
| Habit row tap / hold | `onToggle` / `onLongPress` (delete confirm) | same handlers, HapticPressable |
| Close new habit | closes the sheet | same |
| Habit name / target / unit fields | same state setters | same |
| Create habit | `onAdd`, disabled blank or saving | `PrimaryButton` `onPress={onAdd}`, same disabled rule, spinner |
| Mood 1-5, Energy 1-5 | `setMood` / `setEnergy` radios | same radios (Pressable + selection haptic) |
| Decrease / Increase sleep hours | -/+ 0.5 h, clamp 0-14 | same |
| Notes | `setNotes`, 500 max | same, now with an accessibility label |
| Save / Update check-in, retry, tabs, Add habit link | page (m#598) | unchanged |
Nothing is removed. The old "· Nd" run text never rendered: `runDays` is always 0 (`HabitsScreen.tsx:166` on main), so dropping it removes nothing a client saw.

## B / U
- B1 4 pt filled Create habit button (`habits/styles.ts:225-227` on main, `modalSaveBtn` radius 4) and 0-4 pt literal radii on the sheet, fields, rating buttons, steppers and dots (`habits/styles.ts:42-227` on main). Now the shared `PrimaryButton` (`radius.button`) and `radius.sheet` / `radius.input` / `radius.chip` tokens; no literal radius is left in the file.
- U1 The 7 remaining TouchableOpacity (HabitCard 1, AddHabitSheet 2, MoodEnergyPicker 4 on main) are gone: HapticPressable for rows and steppers, Pressable with a selection haptic for the rating radios (HapticPressable wraps its child in an Animated.View that drops `flex: 1`, which breaks the five equal columns).
- U2 Bare "times" under a once-a-day habit. Now "Once a day" (only when the habit is daily; anything else keeps its unit).
- U3 "8/8 glasses". Now "8 of 8 glasses".
- U4 Unused styles (icon grid, colour grid, emoji rating, stress dot, icon box) are removed.

## WHY / WHEN / WHO
- The literal radii and the 4 pt Create button come from the old squared rule (radius.lg 4) applied by DES-AD (#489, 2bc01cc2, 10-07); the icon/colour grid styles were left from the original sheet (8cbde425, 05-17). Owner 17:07 changed the rule to rounded corners; DS-PRIMITIVES-133 (#577) added the tokens and `PrimaryButton`.
- TouchableOpacity dates from the original screen (f861d39b, initial commit) and survived DES-AD.
- Why it was not on main yet: the branch was finished at 18:59 but stopped by the safe-stop order before m#598 merged; REVIVE-134 brought main in and opened it.

## R1 (checked on main 2acc228c before pushing)
The 7 TouchableOpacity in the three children and the literal radii in their style keys are still on main (counts above). The page rows (top gap, spinner, retry, 10 pt text) were fixed in m#598 and are not repeated here. No commit on main since m#598 touched `src/screens/client/habits/**`, `HabitsScreen.tsx`, `src/ui/**` or `src/theme/**` except #587 (WheelBand / QuietRow / QuietSection title), which this PR does not use differently.

## Parity
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| none (Habits is not in the onboarding prototype 00-86); Q5 + doctrine, style reference design-targets/mobile/clientfile-workouts | habits/HabitCard.tsx | Completion circle on the left, serif name, muted meta in tabular figures, hairline row | The reference's italic coach notes are not used: habits carry none. |
| none; style reference design-targets/mobile/plan-fullweek | habits/HabitCard.tsx week dots | Today marked with a forest dot outline, done days filled | Weekday letters instead of dates: the row has room for seven letters, not seven dates. |
| none; Q5 + doctrine (rounded tokens, one forest action) | habits/AddHabitSheet.tsx, habits/MoodEnergyPicker.tsx | Rounded sheet (24 top), 12 pt fields, overline sections, one forest action | No prototype exists for the sheet or the check-in form. |

## Not seen on a device
Nobody has run this on a phone (iOS or Android). Rendered through the jest renderer (style assertions, not pixels). Insets come from react-native-safe-area-context through `useScreenInsets` (no `SafeAreaView` from 'react-native'); the sheet's bottom padding is `footerBottomPadding(insets.bottom)` = max(inset, 16) + 8, so it clears the home indicator on 390x844 (34 pt) and the gesture bar on 360x800 (24 pt). Serif line heights come from `typography.h2/h3/h1` (>= 1.2 x size, asserted in the test).

## README
`src/screens/client/README.md` HabitsScreen row and the `docs/QUIET_LUXURY_DOCTRINE.md` section 8 "Habits & check-in" row.

agent 134
