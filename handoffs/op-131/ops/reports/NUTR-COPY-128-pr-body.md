Tier: T1
Why: Small, reversible meal-plan copy and destination alignment; no backend or consequential boundary changes.
T4 trigger scan: None — no auth, tenancy/RLS, PII, money, credentials or destructive-data changes.
T3 trigger scan: None — no new API/feature, cross-system contract, migration or data workflow.
Bounded T1: Existing navigation parameter gains the existing mealplan tab; the screen honors that parameter rather than overwriting it with Summary.
Canonical builder: NUTR-COPY-128, GPT-6.1 Sol lane, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: Failing-first targeted tests reproduced incorrect directions, missing approval tab and the Summary reset; all four targeted files now pass (61 tests).
Promotion triggers: Any needed auth, private data, payment, server materialization or destructive-data change goes back to the operator; none needed here.

## What changes for coaches/clients
- Coaches receive accurate directions: clients see assigned plans under **Meal plan**, not a nonexistent Plan tab.
- After approving an AI meal plan, coaches land on their client's Plan tab, including when returning to an existing ClientDetail screen.
- Clients retain the current main's neutral **View meal plans** menu description. It makes no weekly-plan or coach-existence claim, so it remains true for clients without a coach or assigned plan.

## B/U list
- B: none.
- U7 fixed: incorrect client tab directions.
- U8 fixed: approval omits the target tab; the mount/reset effect previously overwrote even a supplied initialTab.
- U9 already fixed by merged More redesign on main: retain and verify “View meal plans,” rather than replacing it with copy that assumes a coach/plan.

## Routes/actions before -> after
| Surface / label | Before destination or effect | After |
| --- | --- | --- |
| Coach Plan / New plan | Existing plan form / assignment | Unchanged; callback tested |
| Coach Plan / Edit | Existing plan edit form | Unchanged; callback tested |
| Coach Plan / Archive | Existing archive confirmation / request | Unchanged; callback tested |
| Coach Plan / Retry | Reload meal plans | Unchanged; callback tested |
| AI draft / Back | navigation.goBack | Unchanged |
| AI draft / Try again | Reload route draft | Unchanged |
| AI draft / title, slots, servings, macros, notes | Edit draft payload and dirty state | Unchanged; existing edit/save tests retained |
| AI draft / Save edits | POST existing draft edit endpoint | Unchanged; tested |
| AI draft / Approve and assign | POST existing approve endpoint | Unchanged; tested |
| AI draft / dirty approval Cancel / Discard / Save and approve | Cancel / approve stored draft / save then approve | Unchanged |
| AI draft / Approved / OK | ClientDetail, default Summary | ClientDetail with initialTab: mealplan; real navigator tested |
| AI draft / Reject, reason, submit, cancel | Existing modal / reject endpoint / goBack | Unchanged |
| ClientDetail / Summary, Logs, Plan, Progress, Fitness, Workouts, Recovery, Timeline, Weekly | Existing nine tabs and data loaders | All retained; tab parity test passes |
| ClientDetail / back, messages, archive, unarchive, refresh, build AI, adjust/copy AI | Existing handlers and routes | All retained; surrounding parity tests pass |
| More / Meal plan | Plan in MoreStack | Unchanged; tested without coach assumptions |
| More / all other existing destinations | Existing stack/cross-tab targets | Unchanged; 20-test platform/flags/parity matrix passes |

## Truthful sweep
- Removed “the client will see it on their Plan tab” and named the real Meal plan entry.
- No invented schedule, weekly scope, assigned-plan existence, coach pairing, counts or praise.
- More's existing neutral description is retained for coached, coachless and empty states; no new identity read is required.
- No new buttons, removed information, cut pathways, first-person copy, exclamation marks, emojis, colors or animation.

## Tests
Local tests ran only through `/home/user/workspace/ops/heavy.sh`, one targeted file at a time:
- `src/__tests__/aiMealPlanDraftReview125.test.tsx`: 4 passed; before fix, 2 failed for missing initialTab and incorrect copy.
- `src/__tests__/coachClientWorkoutsMakeover127.test.tsx`: 7 passed; before fix, requested Plan was overwritten by Summary.
- `src/screens/client/__tests__/MoreScreen.reach.test.tsx`: 20 passed, including neutral copy and all menu actions.
- `src/__tests__/quietLuxuryDoctrine.test.ts`: 30 passed.
- No full local suite, full typecheck or full lint; those run in PR CI.

## Documentation / compatibility
Updated root, navigation, coach and client READMEs. No route removals, backend changes, endpoint changes, dependencies, lockfile edits or production changes. Existing production backend remains compatible.
