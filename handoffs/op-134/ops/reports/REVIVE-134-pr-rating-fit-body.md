**Tier:** T1 (presentation and accessibility labels only)
**Why:** Follow-up to m#614 (Opus U1 by LN-OPUS-C-134, from the code) and the REDO-PROGRESS-133 NEED, both approved by operator agent 134 at 21:22. Two small things a client sees:
1. Habits > check-in: "Exhausted" (about 65 pt) and "Energized" (about 63 pt) at 13 pt Inter are wider than one of the five rating columns on a 360 pt Android screen (about 62 pt), so they ended in an ellipsis ("Exhaus...").
2. Progress > Log weight sheet: the forest button read "Save weight log entry" because the shared `PrimaryButton` had no separate screen-reader label and the doctrine test presses that label.
**Bug IDs:** B29 (pages not world-class: cut words, clumsy button copy), B15 family (text cut on Android).
**T4 trigger scan:** none. No auth, tenancy, PII, money, credentials or destructive data.
**T3 trigger scan:** none. No API, payload, query or route change. `PrimaryButton` gains one optional prop; every existing caller is unchanged (default = `label`).
**Bounded T1:** `src/screens/client/habits/MoodEnergyPicker.tsx` (one line), `src/ui/buttons/PrimaryButton.tsx` (optional `accessibilityLabel`), `src/screens/client/ProgressScreen.tsx` (Save label), three test files.
**Canonical builder:** REVIVE-134 (agent 134). **Parent owner:** operator agent 134.
**Acceptance evidence:** CI at the head. Local, one file at a time (heavy.sh): primitives 14/14 (new: a fuller screen-reader label never changes the visible word), ProgressScreen.measures 8/8 (Save reads "Save", label "Save weight log entry"), ProgressScreen.weighIn 9/9 ("Saving" while saving), quietLuxuryDoctrine 34/34 (still presses "Save weight log entry"), MoodEnergyPicker 1/1 (every mood and energy word shrinks to fit: `adjustsFontSizeToFit`, `minimumFontScale` 0.85). eslint clean.
**Promotion triggers:** none.

## What changes for clients
- Check-in: the five mood and energy words always show whole; a long word shrinks slightly (iOS floor 85%) instead of ending in "...". Size stays 13 pt wherever it fits.
- Log weight sheet: the one forest button reads "Save" ("Saving" with its spinner while saving); VoiceOver and TalkBack still say "Save weight log entry".

## Routes/actions before -> after
| Label | Before | After |
|---|---|---|
| Mood / Energy radios (1-5) | `setMood` / `setEnergy` | same |
| Log weight Save | `handleLogWeight`, disabled while empty, spinner | same handler; visible "Save", accessibility label unchanged |

## Parity
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| none (Habits and Progress are not in onboarding 00-86); doctrine + progress-details/luxury.jpg | MoodEnergyPicker.tsx, ProgressScreen.tsx | Whole words under each dot; one short forest action word | None. |

## Not seen on a device
Not opened on a phone. `adjustsFontSizeToFit` works on iOS and Android; `minimumFontScale` is iOS only (Android shrinks only as far as needed, a few percent for these words). Asserted through the jest renderer, not pixels.

## WHY / WHEN / WHO
- The cut words: `numberOfLines={1}` in five equal columns came with m#614 (2cf0d3b7, REDO-HABITS-CAL-COMM-133); the column width was checked on a 390 pt frame, not 360.
- The long Save label: m#615 (8113224f, REDO-PROGRESS-133) moved Save onto `PrimaryButton`, which used `label` for both the text and the screen-reader label (`src/ui/buttons/PrimaryButton.tsx`, #577), so the visible text had to match the doctrine test's label.

agent 134
