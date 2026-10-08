Tier: T1
Why: Bounded mobile button-state fix using an existing create mutation, with no API or navigation change.
T4 trigger scan: none; no changes to access, privacy, money, credentials or destructive operations.
T3 trigger scan: none; no shared architecture change.
Bounded T1: YES; one pending-state prop, a local create-handler guard, existing disabled styling, and regression tests.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 131
Acceptance evidence: failing-first duplicate-create reproduction, then 22 habit/fasting tests, 20 truthful-copy guard tests and 30 doctrine tests passing.
Promotion triggers: changes to backend creation semantics, authorization, data deletion, money or shared mutation architecture.

## What changes for coaches/clients

Create habit is unavailable while the existing create request is saving. The label becomes “Creating habit”, with disabled/busy accessibility state and the existing theme-based disabled styling. An immediate handler guard prevents another request before pending state renders and clears when the request settles. A failed save restores Create habit without clearing the entered values; a successful save still closes and resets the sheet.

## B/U list

- B: none within this assigned scope.
- U1 — seen in a test: a client taps Create habit again while the first request is still saving and submits two identical create requests. The regression reproduced two API calls before the fix; the [first CI run](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37724677580/job/113140030144) also proved the disabled UI needed an immediate handler guard.

## Acceptance evidence

All local runs used `ops/heavy.sh`, one targeted test file at a time.

```text
Failing-first main: e1688b51c5b21a7b8ac22d6bc74313d5e6482367
HabitsFasting.launch.test.tsx -t "ignores a second create tap"
Expected calls: 1
Received calls: 2

Post-fix:
HabitsFasting.launch.test.tsx    22 passed
truthfulCopy.guard.test.ts      20 passed
quietLuxuryDoctrine.test.ts    30 passed
git diff --check               clean
```

The [habit regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/548) cover blocked repeat creation while pending, accessible busy/disabled state, successful reset, retained inputs and another attempt after failure, blank-name validation, production DTO compatibility and existing actions.

## Routes/actions before -> after

| Label/action | Before | After |
|---|---|---|
| Habits / Daily check-in | Switch local tabs | Same |
| Pull to refresh / Retry habits | Refetch habits, logs and check-in | Same |
| Habit tap / long press | Tick or untick / delete confirmation with Cancel and Delete | Same |
| Add habit | Open new-habit sheet | Same |
| Close new habit / native dismiss | Close sheet | Same |
| Habit name / target / unit | Edit form values | Same |
| Create habit | Existing create mutation, blank-name guard | Same mutation and blank-name guard; immediate repeat-request guard and disabled while pending |
| Retry check-in | Refetch today's check-in | Same |
| Mood / energy / sleep −/+ / notes | Edit check-in values | Same |
| Save / Update check-in | Existing save mutation and pending guard | Same |

## Truthful sweep and documentation

- “Creating habit” appears only while the actual create mutation is pending; no saved claim, invented numbers, first-person copy, exclamation marks or new colours.
- Existing semantic/theme colours, layout and primary-action styling retained.
- `src/screens/client/README.md` updated with the pending, success and failure behavior.
- No dependencies, lockfiles, endpoints, feature flags or production settings changed.

agent 131
