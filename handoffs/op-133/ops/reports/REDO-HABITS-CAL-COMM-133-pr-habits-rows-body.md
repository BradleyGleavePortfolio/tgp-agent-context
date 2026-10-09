**Tier:** T1 (presentation only)
**Why:** Owner 17:10, "start the mobile redesigns that were unfinished": APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128, REDO-AUDIT-133 row #489), part 2 of 2 after m#598. The habit rows, the Add habit sheet and the check-in controls still used TouchableOpacity, 0-4 pt literal radii and a 4 pt filled Create button.
**T4 trigger scan:** none. No auth, tenancy, PII, money, credentials or destructive data. `src/entitlements/**` and `ProtectedScreen` are not touched.
**T3 trigger scan:** none. No API, query key, payload or route changes. Tick, untick, hold-to-delete, create and check-in save send the same requests.
**Bounded T1:** `src/screens/client/habits/{HabitCard,AddHabitSheet,MoodEnergyPicker,styles}.tsx/ts`, `HabitsScreen.tsx` (child props only: `sc` instead of the bridged `colors`, `todayIndex`), three test files, two README rows.
**Canonical builder:** REDO-HABITS-CAL-COMM-133 (agent 133).
**Parent owner:** operator agent 133.
**Acceptance evidence:** `HabitsFasting.launch.test.tsx` 33/33 (2 new: the target in words without inventing a daily cadence; serif habit names whose line height never clips, a sheet with `radius.sheet` top corners, `radius.input` fields and a `radius.button` Create). `HabitsCheckInGate.test.tsx` 13/13. `habits/__tests__/MoodEnergyPicker.test.tsx` 1/1 (every mood and energy word still selects its value at 13 pt; sleep steppers move by 0.5 h). Guards `quietLuxuryDoctrine` 34/34, `copyVoice` 8/8, `truthfulCopy` 20/20. Targeted tsc and eslint on the touched files are clean. CI below.
**Promotion triggers:** none.

## What changes for coaches/clients
Clients only.
- Each habit is a hairline row: an outlined check circle on the left that fills with a check when done, the habit name in serif, the target in words ("3 of 8 glasses", "Once a day" for a daily single tick) and this week as seven small dots with today marked. Tap still ticks/unticks; hold still deletes.
- The Add habit sheet has rounded 24 pt top corners and a grabber, a serif "New habit" title, rounded fields (12 pt), and Create habit is the shared rounded forest button with its spinner while saving (still disabled for a blank name and while saving).
- Check-in: each part opens with a small overline (Mood, Energy, Sleep, Notes) and a serif question ("How are you feeling?", "How is your energy?"). Mood and energy are five quiet dots with a word under each (no emoji, no colour code); sleep is a serif number between two round 44 pt steppers; the notes field is rounded, placeholder "Anything worth noting about today".
Nothing was removed: every habit action, the five mood and energy choices, sleep steps, notes, save/update, retry and the sheet's name/target/unit fields are kept.

## B / U
- B1 4 pt filled Create habit button (`modalSaveBtn` radius 4) and 0-4 pt literal radii on the sheet, fields, rating buttons, steppers and dots (`habits/styles.ts`). Now the shared `PrimaryButton` (`radius.button`) and `radius.sheet` / `radius.input` / `radius.chip` tokens; no literal radius is left in the file.
- U1 The 7 remaining TouchableOpacity (HabitCard 1, AddHabitSheet 2, MoodEnergyPicker 4) are gone: HapticPressable for rows and steppers, Pressable with a selection haptic for the rating radios (HapticPressable wraps its child in an Animated.View that drops `flex: 1`, which breaks the five equal columns).
- U2 Bare "times" under a once-a-day habit. Now "Once a day" (only when the habit is daily; anything else keeps its unit).
- U3 "8/8 glasses". Now "8 of 8 glasses".
- U4 Unused styles (icon grid, colour grid, emoji rating, stress dot, icon box) are removed.

## WHY / WHEN / WHO
- The literal radii and the 4 pt Create button are from the old squared rule (radius.lg 4) applied by DES-AD (#489, 2bc01cc2, 10-07); the icon/colour grid styles were left from the original sheet (8cbde425, 05-17). Owner 17:07 changed the rule to rounded corners; DS-PRIMITIVES-133 (#577) added the tokens and `PrimaryButton`.
- TouchableOpacity dates from the original screen (f861d39b) and survived DES-AD.

## R1 (rows checked on main before building)
On main (after m#598): the 7 TouchableOpacity in the three children and the literal radii in their style keys were still there. The page rows (top gap, spinner, retry, 10 pt text) were fixed in m#598 and are not repeated here.

## Parity
| Prototype screen | File | Matches | Differs and why |
|---|---|---|---|
| no prototype; Q5 + doctrine (style reference: design-targets/mobile/clientfile-workouts) | habits/HabitCard.tsx | Completion circle on the left, serif name, muted meta in tabular figures, hairline row | The reference's italic coach notes are not used: habits carry none. |
| no prototype; Q5 + doctrine (style reference: design-targets/mobile/plan-fullweek) | habits/HabitCard.tsx week dots | Today marked with a forest dot outline, done days filled | Weekday letters instead of dates: the row has room for seven letters, not seven dates. |
| no prototype; Q5 + doctrine | habits/AddHabitSheet.tsx, habits/MoodEnergyPicker.tsx | Rounded sheet, overline sections, one forest action | No prototype for the sheet or the check-in form. |

## Not seen on a device
Nobody has run this on a phone. Rendered through the jest renderer (style assertions, not pixels). The sheet's footer padding comes from `useScreenInsets().bottom` (`footerBottomPadding`), so it clears the home indicator on 390x844 (34 pt) and the gesture bar on 360x800 (24 pt).

## README
`src/screens/client/README.md` HabitsScreen row and the `docs/QUIET_LUXURY_DOCTRINE.md` section 8 "Habits & check-in" row.

agent 133
