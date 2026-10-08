Tier: T1
Why: Bounded Home display, request timing and navigation corrections using existing settings, verified-day state and access context.
T4 trigger scan: none; no entitlement policy, payment, identity, storage or backend changes.
T3 trigger scan: none; no new architecture, routes, dependencies or contracts.
Bounded T1: YES; the assigned states, existing destination and deterministic display rules are tested.
Canonical builder: GPT-6 Luna; GPT-6.1 Sol assigned by the HOME-FOOD-UI-131 brief.
Parent owner: operator agent 131.
Acceptance evidence: the new suite reproduced 11 failures before the fix; 111 targeted tests across eight files passed, each run separately through heavy.sh.
Promotion triggers: changing access policy, payment behavior, identity boundaries, persisted data or backend contracts.

## What changes for coaches/clients

- Home waits for today's verified food/water data instead of showing default zero intake or yesterday's meal count; verified same-day figures remain during refresh. [Home day-state implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/HomeScreen.tsx#L171-L183)
- Water follows Settings: approximate whole milliliters for kilograms, ounces rounded to one decimal otherwise, and no guessed unit before settings load. [Home water formatting](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/HomeScreen.tsx#L246-L249)
- Inactive access offers **View access** to the existing ungated Membership screen, not a locked food/workout screen or an unrelated connection error; an unavailable check is described separately. [Access note and action](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/HomeScreen.tsx#L430-L485)
- Paid day/workout reads wait for confirmed access; pull-to-refresh rechecks access when needed without changing the entitlement provider or guards. [Home request timing](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/HomeScreen.tsx#L309-L339)

## B/U list

- **B1 — seen in a test:** default intake was displayed before today's read completed. An ordinary client opening Home could see a false zero intake summary. [Regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/__tests__/HomeScreen.foodUi131.test.tsx#L77-L107)
- **U1 — seen in a test:** kilogram users saw ounces and a metric quick-add exposed a long decimal in Home's water cell. [Water display tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/__tests__/HomeScreen.foodUi131.test.tsx)
- **U2 — seen in a test:** known inactive access showed a connection error and offered a primary action into the access gate instead of a useful Home destination. [Inactive-access and router tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/navigation/__tests__/homeWorkoutEntry130.test.tsx)

## Routes/actions before -> after

| Label/action | Before | After |
|---|---|---|
| Start named workout | MoreTab → WorkoutAssignmentDetail, assignment ID, initial:false | Same when access is confirmed |
| Resume workout | WorkoutTab → ActiveWorkout, saved name/exercises/assignment, resume:true, initial:false | Same when access is confirmed |
| Open Train | WorkoutTab | Same when access is confirmed |
| Log a meal primary | Log, including when it would be locked | Log with confirmed access; View access → MoreTab/Membership, initial:false otherwise |
| Macro prompts | Log | Same with confirmed access; View access to log food → Membership otherwise |
| Water cell | Read-only | Read-only; corrected units/precision |
| Message coach / messages | Messages | Same |
| Roman, when enabled | MoreTab → RomanChat, initial:false | Same |
| Notification bell | NotificationCenter | Same |
| Finish profile | MoreTab → EditProfile | Same |
| Pull to refresh | Today's day data and profile; workout focus reload | Same when access is confirmed; recheck access first otherwise |
| Day-data Try again | Same refresh handler | Same for actual day-read failures |
| Dunning section | Native Update card; message coach | Same child and handlers |
| Coachless section | Code sheet, use/enter code, dismiss, package recovery, messages | Same child and handlers |
| Pending invite | Claim/dismiss existing invite | Same child and handlers |
| Push permission section | Enable permissions / dismiss | Same child and handlers |
| Coach introduction / full-macro intro | Dismiss their existing sections | Same child and handlers |
| Tutorial slot | Resume tutorial / Messages | Same child and handlers |
| Holistic insights | Read-only Home tile | Same |

The real navigator test proves inactive Home → Membership → Back returns to the You menu, while the predecessor's Start/Resume/Train paths remain covered; existing Home tests retain header actions, profile, macro prompts, refresh and supporting-section order. [Router parity tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/navigation/__tests__/homeWorkoutEntry130.test.tsx) [Home parity tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/__tests__/HomeScreen.honestCopy127.test.tsx)

## Truthful sweep

| State | Truthful result |
|---|---|
| User not restored | Existing screen skeleton |
| Initial / other-day food read | Unknown intake, no unverified meal-count claim, targets remain visible |
| Initial day-read failure | Specific day-read error and retry, intake remains unknown |
| Verified empty today | Actual zero intake may display |
| Verified same-day refresh | Previously verified numbers remain |
| Settings restoring | Water unit is not guessed |
| kg / lbs | Approximate whole ml / at most one decimal oz |
| First access check | Wait without paid Home reads |
| Inactive access | Neutral access explanation and View access |
| Unavailable first check | Check failure, never an invented inactive-plan claim |
| Confirmed-active recheck | Existing access-confirmation semantics and verified values remain |
| Assigned / saved / complete workout | Existing truthful workout labels and actual destinations remain |
| Profile / supporting sections | Existing state-driven copy and conditional sections remain |

These state variants are covered by the new regression suite and existing Home parity/target/macro-mode tests. [Home food UI tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/__tests__/HomeScreen.foodUi131.test.tsx) [Home target tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/534908a1154b3a3e531c39d7595dc2abca5d1cce/src/screens/client/__tests__/HomeScreen.todayTargets.test.tsx)

## Verification

- Failing first on the predecessor main: new Home food UI suite **11 failed, 3 passed**, before implementation.
- Passing local targeted files, one at a time through `/home/user/workspace/ops/heavy.sh`:
  - HomeScreen.foodUi131: 17
  - HomeScreen.honestCopy127: 17
  - HomeScreen.macroMode: 5
  - HomeScreen.todayTargets: 3
  - homeWorkoutEntry130: 4
  - assignedWorkoutEntry127: 15
  - quietLuxuryDoctrine: 30
  - truthfulCopy.guard: 20
- `git diff --check`: clean.
- PR diff against main: **360 changed lines** (91 source, 267 tests, 2 documentation).
- Matching client README updated; no dependencies, lockfiles, migrations, flags or backend changes.
- Mobile #524 was already merged; current main was brought into this branch with a normal merge, never a rebase.
- No production activity or PR merge performed. CI must be green at the exact head before READY.

agent 131
