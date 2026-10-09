**Tier:** T1 (presentation only)
**Why:** Owner 17:10, "start the mobile redesigns that were unfinished": APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128, REDO-AUDIT-133 row #489). Habits had a double top gap, 4 pt filled buttons, a spinner and a home-made retry.
**T4 trigger scan:** none. No auth, tenancy, PII, money, credentials or destructive data. `src/entitlements/**` and `ProtectedScreen` are not touched; the check-in access gate behaves as before.
**T3 trigger scan:** none. No API, query key, payload or route changes. `habitsApi` / `checkInsApi` calls are the same.
**Bounded T1:** `src/screens/client/HabitsScreen.tsx`, `src/screens/client/habits/styles.ts`, two test files, two README rows.
**Canonical builder:** REDO-HABITS-CAL-COMM-133 (agent 133).
**Parent owner:** operator agent 133.
**Acceptance evidence:** `HabitsFasting.launch.test.tsx` 31/31 (2 new: the day as one sentence; no fixed top gap, serif headline, exactly one rounded forest button and only on check-in). `HabitsCheckInGate.test.tsx` 13/13. `habits/__tests__/MoodEnergyPicker.test.tsx` 1/1. Guards `quietLuxuryDoctrine` 34/34, `copyVoice` 8/8, `truthfulCopy` 20/20. Targeted tsc and eslint on the touched files are clean. CI below.
**Promotion triggers:** none.

PR 1 of 2 for Habits (split to stay under 800 lines). PR 2 (habit rows, the Add habit sheet and the check-in controls: HabitCard, AddHabitSheet, MoodEnergyPicker) opens after this one merges, based on main.

## What changes for coaches/clients
Clients only. Habits & check-in now opens straight under the back header (no extra 60 pt gap). The date sits as a small overline above a serif "Habits & check-in". The two tabs are underlined text tabs. The habits tab says the day in one sentence ("Two of three done today.", "Done for today."), then "This week" and the habits. "Add habit" is a forest text action. Loading is the shared skeleton; a failed read says "Habits did not load. Check your connection, then try again." with a "Try again" text action. On the check-in tab, Save / Update check-in is the one rounded forest button (12 pt corners). The saved line reads "Saved for today. Change anything and update." Nothing was removed: every tab, habit tick, hold-to-delete, Add habit, mood, energy, sleep, notes, save/update, retry, pull-to-refresh, the inactive-access line and the access gate are kept.

## B / U
- B1 Double top gap: `habits/styles.ts:8` `paddingTop: 60` under the Home stack's native back header. Now `Screen edges={[]}` (the header owns the top inset, the tab bar the bottom).
- B2 4 pt filled Save button (`saveBtn` radius 4) and 4 pt tab boxes. Now the shared `PrimaryButton` (`radius.button` 12) and text tabs (no box).
- B3 ActivityIndicator plus a home-made "Retry habits" / "Retry check-in" (`HabitsScreen.tsx:322/:329/:385`). Now `QuietLoading` / `QuietError` from `src/ui/states`.
- U1 10 pt text at `habits/styles.ts:91` (`progressLabel`, the old ring). Removed with the ring styles.
- U2 "0 of 1 today" counter copy. Now one sentence.
- U3 6 of the 13 TouchableOpacity were in HabitsScreen; they are gone (HapticPressable tabs, TextLink, PrimaryButton). The other 7 (HabitCard, AddHabitSheet, MoodEnergyPicker) go in PR 2.

## WHY / WHEN / WHO
- The 60 pt top padding came with the original custom header (f861d39b, initial commit). Habits later moved under `backOnlyHeader` in the Home stack, and DES-AD (#489, 2bc01cc2 "calm habits and daily check-in", 10-07) restyled the screen but kept the padding, so the header and the padding both took the top.
- The 4 pt radius was the rule at the time (radius.lg 4, "squared" quiet luxury) applied by DES-AD #489. Owner 17:07 replaced it (rounded: buttons 12, cards 16, sheets 24); DS-PRIMITIVES-133 (#577) added the tokens and shared parts this PR uses.
- The spinner and "Retry habits" came from AUDIT-15 (#419, f1468834, 10-06), before the shared QuietStates existed.

## R1 (rows checked on main a279e1f6 before building)
All APPLY rows for this file set were still true on main: `paddingTop: 60` (styles.ts:8), 10 pt text (:91), TouchableOpacity in HabitsScreen, ActivityIndicator + "Retry habits", 20 literal radii. None were already fixed. Literal radii left in `habits/styles.ts` belong to the child components and are replaced in PR 2.

## Parity
| Prototype screen | File | Matches | Differs and why |
|---|---|---|---|
| no prototype; Q5 + doctrine (style reference: design-targets/mobile/clientfile-workouts, plan-fullweek) | HabitsScreen.tsx | Overline date + serif headline, narrative sentence, "This week" overline, hairline sections, one forest action | No prototype exists for Habits. The reference's coach-journal italics are not used: habits have no coach notes. |

## Not seen on a device
Nobody has run this on a phone. Rendered through the jest renderer (style assertions, not pixels). The screen owns no device inset (native header on top, tab bar below), so 360x800 and 390x844 insets do not change it; the test asserts the root has no top padding.

## README
`src/screens/client/README.md` HabitsScreen row and `docs/QUIET_LUXURY_DOCTRINE.md` section 8 (new "Habits & check-in" row).

agent 133
