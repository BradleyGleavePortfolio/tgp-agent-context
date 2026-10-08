Tier: T1
Why: A bounded presentation fix explains an existing check-in requirement before entry; server access rules, billing and the save payload do not change.
T4 trigger scan: none; no auth, consent, tenancy, payment or data-storage policy changes.
T3 trigger scan: none; no navigation, shared architecture or dependency changes.
Bounded T1: YES; one screen, its existing read hook, targeted tests and matching documentation.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 131
Acceptance evidence: new gate tests fail 8/13 on main 868a629c and pass 13/13 with the fix; the updated existing habits/fasting parity file passes 29/29, all through ops/heavy.sh one file at a time.
Promotion triggers: changing server entitlement rules, checkout, consent, the save contract or global gate policy requires re-grading.

## What changes for coaches/clients

Clients with confirmed inactive access see “Daily check-ins need active coaching access.” before the form, followed by the existing plan, coach-message or coach-code recovery action. Unknown access waits; a failed access check offers Try again instead of claiming a plan is needed. [Check-in surface](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/screens/client/HabitsScreen.tsx#L366-L387)

The screen no longer requests protected check-in data while access is unconfirmed or inactive, including pull-refresh; a gated check-in refresh rechecks access instead. The existing confirmed-active recheck policy remains. [Read and refresh](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/screens/client/HabitsScreen.tsx#L70-L78) [Hook](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/hooks/useApi.ts#L376-L384)

## B/U list

- B: none.
- U4 fixed (seen in a test): a client who joined a coach but skipped a package could enter a check-in that the server refused; the check-in tab now explains access and offers recovery before entry. [Regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/screens/client/__tests__/HabitsCheckInGate.test.tsx)

## Routes/actions before -> after

| Label / action | Before | After |
|---|---|---|
| Habits / Daily check-in tabs | Switch local tab | Same tabs; only the check-in content uses the existing access gate |
| Habit tick / untick | Save completion and quantity | Unchanged, including with inactive check-in access |
| Hold habit / Cancel / Delete | Confirm and delete habit | Unchanged |
| Add habit / name / target / unit / Create / Close | Open, edit, submit or dismiss existing sheet | Unchanged |
| Mood / energy choices, sleep minus / plus, notes | Edit check-in | Unchanged with active access; refused-entry form replaced by explanation under honesty/dead-button rules 1/2 |
| Save / Update check-in | Existing POST /check-ins payload and feedback | Unchanged with active access |
| Retry habits / Retry check-in | Refetch failed read | Unchanged for accessible reads |
| Pull to refresh | Refetch habits, logs and check-in | Habits/logs unchanged; check-in only with confirmed access, otherwise check access on the check-in tab |
| Gate Try again | Not present here | Existing ProtectedScreen refreshEntitlement callback |
| Gate View Plans | Not present before entry | Existing openPlans callback, MoreTab -> ClientPackages |
| Gate Message your coach / Enter a coach code | Not present before entry | Existing messageCoach callback, Home -> Messages; coachless callback opens code entry |
| Native back / six client tabs | Existing navigator | Unchanged |

Reachability, hidden-purchase/coachless states, loading/unavailable states, saved-row hydration, accepted save payload, retry and visible save failure are covered by [HabitsCheckInGate.test.tsx](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/screens/client/__tests__/HabitsCheckInGate.test.tsx) and the updated [habits/fasting parity tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/screens/client/__tests__/HabitsFasting.launch.test.tsx).

## Truthful sweep / documentation

- Inactive-only explanation; unknown/failed checks do not claim a package is absent.
- Hidden-purchase builds keep coach-managed copy/actions; coachless clients never get an absent-coach message action.
- No new first-person copy, exclamation marks, emojis, generic errors, hex colors, dependencies or lockfile edits.
- Reuses ProtectedScreen and existing theme styles; no new global banner, route or shared gate policy.
- The [client README](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/daa2557e6c5364481026adff79baf54b713c45de/src/screens/client/README.md) describes the gate and both targeted test files.
- 401 changed lines (331 additions, 70 deletions); five files.
- Local: only the two added/modified test files, one at a time through heavy.sh. Full typecheck/lint/suite left to CI. No production access or writes, merge, deploy or flag changes.

agent 131
