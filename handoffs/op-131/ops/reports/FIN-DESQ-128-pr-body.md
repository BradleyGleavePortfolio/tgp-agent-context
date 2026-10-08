Tier: T1
Why: Bounded presentation-only makeover of the coach client's Workouts view and its existing in-page tab header.
T4 trigger scan: No auth, tenancy, PII access, money, credentials, destructive-data or server changes.
T3 trigger scan: No dependency, API, persistence, business-rule or external-service changes.
Bounded T1: Existing routes and callbacks remain unchanged; summaries and strength points use already-supplied workout data.
Canonical builder: GPT-6.1 Sol, DES-Q-127 / FIN-DESQ-128.
Parent owner: operator agent 128.
Acceptance evidence: Corrected tests-only head f0aa8fb0d562e153d02688f61190553a64220ee0 had four expected presentation failures; all 676 other suites and header/refresh parity passed: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37671457417. Round-2 local test-first proof for Sol B1: three expected failures for unqualified weekly/empty copy, three parity tests pass; then all six pass after the fix and main refresh. All required CI checks are green at 9d21672cd4c45fcdbfdc13f1f108157d0b33ae51, GitHub MERGEABLE: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37686987150. No audit approval claimed at the current head.
Promotion triggers: Any new data fetch, permission boundary or mutation changes leave this scope.

## What changes for coaches/clients
The client's existing tabs become text with an active underline and >=44pt hit targets. Workout history uses quiet hairline rows, legible dates and recorded details. A weekly sentence counts only shared logged workouts, never claims the client's private total or an invented assignment target. Build-with-AI and Adjust-for-client remain available with their existing destinations. All changed colors use semantic theme tokens, and the coach module README describes the view.

## B/U list
- Open B: none after the B1 copy fix below.
- U1: A coach checking a client's workouts had to scan pill tabs and boxed metadata instead of a calm weekly summary and clearly ordered rows.
- U2: The inherited implementation lacked the required matching coach README; it now ships alongside the code.
- U3: Narrow tabs and fixed-palette changed styles are replaced with >=44pt targets and semantic tokens.
- B1 (Sol round 1): When a client turns workout sharing off, the coach's empty result was incorrectly called “0 workouts this week” even though the client may have trained. Now both the count and empty state explicitly refer only to shared workout sessions; no backend or access-boundary changes.

## Routes/actions before -> after
Scope is the existing ClientDetail tab header and Workouts view; sibling-tab internals are not modified.

| Surface / label | Before destination or effect | After destination or effect |
|---|---|---|
| Header back | navigation.goBack() | Same |
| Header message icon | ClientMessages with clientId/clientName | Same |
| Archive / Unarchive client | Existing coachApi archive/unarchive handler | Same |
| Pull to refresh | loadData, dispute-card reload key, refreshing state | Same |
| Summary | activeTab=summary | Same |
| Logs | activeTab=logs | Same |
| Plan | activeTab=mealplan; loadServerMealPlans | Same |
| Progress | activeTab=progress | Same |
| Fitness | activeTab=healthFitness | Same |
| Recovery | activeTab=sleepRecovery | Same |
| Workouts | activeTab=workouts | Same |
| Timeline | activeTab=timeline; loadTimeline(selectedDays) | Same |
| Weekly | activeTab=weekly; loadWeeklySummaries(selectedDays) | Same |
| Build a program for first name with AI | Summary tab with aiProgramRequest=true | Same |
| Adjust a saved workout for first name | Existing capability-gated saved-workout picker | Same |
| Adjust picker: Close / native back | Close picker | Same |
| Adjust picker: saved workout row | Copy by value; CoachWorkoutBuilder with planId/openAi/clientId/clientName | Same |

No tappable action or recorded detail is removed; status glyphs are not fake buttons.

## Truthful sweep
- Existing workout titles, dates, durations, set/exercise/volume counts and notes use supplied data; none is replaced by fictional observations.
- `WorkoutsTab.tsx`, weekly summary: only completed sessions shared with the coach this week are counted. No assigned denominator exists in this input, so it uses `<x> shared workouts this week`; empty says “No shared workout sessions to show”. A private workout cannot be inferred from an empty response.
- Recorded completion is labelled Done; unfinished history remains In progress. No missed/upcoming schedule or “On track” verdict is inferred.
- Duration and RPE appear only when supplied; a zero-duration placeholder is not introduced.
- The chart is explicitly top recorded load, not estimated 1RM, and requires >=2 same-exercise points.
- Existing AI entry labels describe real callbacks and preserve their destinations.

## Reference match and intentional divergence
Matches `design-targets/mobile/clientfile-workouts/luxury.jpg`: underline text tabs, serif weekly summary, restrained hairline rows and a real-data strength trajectory.

Diverges from fictional reference content: all nine current tabs remain; no invented coach observation, assigned-total, missed/upcoming schedule, RPE, program phase or “On track” verdict. Existing set counts, exercise counts, volume, weights/reps and both note levels remain visible without additional taps.

RPE is displayed only when supplied in exercise JSON. The existing out-of-scope `workoutLogging.ts` mapper currently drops that field; this PR does not claim end-to-end RPE plumbing.
