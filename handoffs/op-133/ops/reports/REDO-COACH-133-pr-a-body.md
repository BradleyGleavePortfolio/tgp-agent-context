[133] REDO-COACH-133 PR (a) of 3. QA-COACH-128 (never run; REDO-AUDIT-133 section 4): coach tab bar, Clients, Workout builder, Programs. Owner 17:10 "start the mobile redesigns that were unfinished", ruling 17:07 (Q10b) rounded corners. Builds on DS-PRIMITIVES-133 (#577).

- **Tier:** T2, mobile presentation only.
- **Why:** the coach tab bar, Clients, Workout builder and Programs still had filled glyphs, 10/600 labels, 13 pt overlines, square or hand-set corners, a fixed 60 pt top and controls with no pressed state.
- **T4 trigger scan:** none. No auth, RLS/tenancy, PII, money, credentials or destructive data path changes. No API call, payload or query key changes.
- **T3 trigger scan:** none. No route, param, tab, tab order, navigator or flag changes. No new dependency, no lockfile edit.
- **Bounded T1:** styles, icons, labels' type, a shared header, pressed states.
- **Canonical builder:** REDO-COACH-133 (agent 133 lane). **Parent owner:** agent 133 (coach files claimed for agent 134 until it starts).
- **Acceptance evidence:** tests listed below at this head; renders at 360x800 and 390x844 through the test renderer. Not seen on a device.
- **Promotion triggers:** none found.

## What changes for coaches
- **Tab bar:** bone bar with a hairline top instead of a cream bar with a 1 pt border; outline icons; 11 pt Inter labels (500 when focused, 400 at rest) instead of 10/600; a forest unread badge; a light selection haptic on every tab press. Team uses `briefcase-outline` so it no longer looks like Community. Same tabs, same order, same routes, same badge counts.
- **Clients:** the date and the "Clients" title are 11 pt overlines, the date sits over a hairline as in the coach-home reference; the serif hero count gets a 1.25 line height (64/80, was 64/68) so Android never clips it; the invite button has 12 pt corners (`radius.button`, was 4); the top padding follows the real status-bar inset (`insets.top + 12 + 12`) instead of a fixed 60 pt.
- **Workout builder:** back chevron at the top (`ScreenTopBar`, `navigation.goBack`) under the real inset; field labels and the Exercises header are 11 pt overlines; name and notes are rounded hairline fields (`radius.input`, 52 pt); workout-type chips are pills with a forest outline when selected (no fill); each exercise is a rounded hairline card (`radius.card`); the step and order controls have 12 pt corners; Save is the shared `PrimaryButton` (Create plan / Save changes, spinner while saving) and is the one filled forest button. Every control keeps its handler; plain Pressables became `HapticPressable` (undo uses the medium intent, and the explicit undo/history haptics were removed so a press gives one haptic, not two). Ask AI and the prompt bar keep `Pressable` with a pressed veil because `openAi` fires its own haptic. The scroll view now keeps taps while the keyboard is up (`keyboardShouldPersistTaps="handled"`) so the first tap on a control below a field works.
- **Programs:** serif title (`typography.h1`), rounded hairline cards and search (`radius.card` / `radius.input`, no cream fill), serif card titles (`h3`), tags as plain overline text instead of tinted chips, 24 pt gutters under the status-bar gap.

## B/U list
- U QA-COACH-128.1 tab icons, label 10/600 at CoachNavigator.tsx:705-708, bar fill, no haptic: fixed.
- U QA-COACH-128.2 ClientsList 13 pt overlines (:417, :439), invite radius 4 (:455), fixed paddingTop 60 (:523): fixed.
- U QA-COACH-128.3 builder: 14 plain Pressables with no pressed state, 13 pt uppercase label, radius 4: fixed.
- U QA-COACH-128.4 ProgramsLibrary hardcoded radius 12/14/8 (:410/:415/:425), plain Pressables: fixed.
- R1 drops: none in this PR (every item was still true on main df7b8ae9 at 17:15). DES-O-127's ban on invented "need you / are steady / $" copy on Clients is respected: the reference's narrative line is not added.

## WHY / WHEN / WHO
- Tab bar 10/600, filled icons, cream bar, ClientsList fixed 60 pt top: from f861d39b "Initial commit" (2026-03-15), never revisited; DESIGN-QA-128 item 4 queued it as QA-COACH-128, which never ran.
- Programs radii 12/14/8: b364b9ea (programs library, split G3 of #328, merged through the #356 chain), before the radius tokens existed.
- Builder 13 pt uppercase caption label and plain Pressables: fb4b556c "style(coach): simplify workout builder without losing actions" (#480, agent127/des-z-127) kept actions but did not add pressed states.

## Parity table
| Reference folder | File | What matches | What differs and why |
|---|---|---|---|
| coach-home-solo | CoachNavigator.tsx | bone bar, outline icons, quiet hairline | Reference shows 4 icons with no labels; we keep 5 labelled tabs (no tab, order or route change allowed, and labels help first-time coaches). |
| coach-home-solo | ClientsListScreen.tsx | date overline over a hairline, serif hero number, generous gutters | No revenue hero, three-up or "three need you" line: those numbers are not on this screen and DES-O-127 forbids invented copy. |
| coach-workout-builder | CoachWorkoutBuilderScreen.tsx | back chevron, small-caps labels, rounded fields, pill type chips, rounded exercise cards, one filled "Create plan" | Undo, history, Ask AI and per-exercise controls stay (button count kept, R3); corners follow the owner's tokens. |
| drafts-queue | programs/ProgramsLibraryScreen.tsx | serif title, overline tags, hairline rows, quiet search | No italic summary sentence or filter tabs: Programs has no such data today. |

## Routes/actions before -> after
| Screen | Before | After |
|---|---|---|
| Coach tabs | 5 tabs, same routes, tabPress: no haptic | same 5 tabs and routes, tabPress: selection haptic |
| Clients | invite -> InviteCodes, risk board -> RiskBoard, search, status filters, sort, retry, row -> ClientDetail | same, unchanged handlers |
| Workout builder | back by gesture or system only; save, undo, history, Ask AI, prompt bar, type chips, exercise add/remove/order/steppers | same actions plus a visible back chevron (`goBack`, the same as the gesture) |
| Programs | New program -> ProgramForm, New workout -> CoachWorkoutBuilder, Ask AI -> builder `{ openAi: true }`, Programs/Saved tabs, Active/Archived, goal tags, search, workout card -> builder `{ planId }`, program card -> ProgramEditor | same |

## Truthful sweep
No new copy claims; no counts invented; no colours outside the theme; sentence case; no exclamation marks; motion unchanged (no new animation). Hairlines use `StyleSheet.hairlineWidth`. Every radius in the touched styles comes from `radius.*`.

## Evidence (tests run locally at this head, one file at a time through heavy.sh)
tabBarPolish125 2/2; coachRedesign133 + ClientsListLookup124 (with new 360x800 inset 24 and 390x844 insets 47/34 renders) 31/31; ClientsListRiskPill 5/5; PushPrimer 3/3; coachWorkoutBuilderAutosave 13/13; coachWorkoutBuilderUndo 25/25; RowIdAdoption + aiBuilder 24/24; programsScreens + coachNavigation 14/14; quietLuxuryDoctrine passes. `tsc --noEmit` clean for touched files; eslint 0 errors. Not seen on a device or simulator.

README: `src/navigation/README.md` (CoachNavigator row) and `src/screens/coach/README.md` (REDO-COACH-133 paragraph), doctrine section 8.

agent 133
