Tier: T1
Why: Correct bounded, read-only coach projections and labels using the deployed API contract.
T4 trigger scan: none; no auth, consent, tenancy, money, credential, destructive-data or production change.
T3 trigger scan: none; no shared architecture or new protocol.
Bounded T1: YES; existing fields, endpoints and theme, no dependencies or lockfile changes.
Canonical builder: GPT-6.1 Sol, COACH-WEEKLY-131 (agent 131).
Parent owner: operator agent 131.
Acceptance evidence: failing-first `coachWeekly131.test.tsx` reproduced wrong calories, zero volume, omitted day query and raw/unit labels; a separate failing-first assertion reproduced zero protein. All 9 new regressions now pass; 52 existing food-review, workout/navigation-parity and API-wrapper tests also pass.
Promotion triggers: any backend, consent/access, money, credential or destructive-data change requires operator re-grading.

## What changes for coaches/clients

- Weekly food totals include recorded portions and read the persisted `protein_g` field, keeping precision until display rounding.
- Weekly training volume reads `weight_per_set × reps_per_set`, matching the same saved session in Workouts.
- Summary uses the device's calendar day through the existing backend `date` query instead of the server's default UTC day.
- Food review shows readable recorded eat dates and meal headings; Weekly and Workouts consistently label pounds as `lb`.
- Existing routes, actions, targets, notes and sharing behaviour are unchanged.

## B/U list

B: none in this bounded assigned scope.

- U1, seen in a test: Weekly reported zero volume for a saved workout shown as 3,375 lb in Workouts. `useClientDetailData.ts:312-315` now sums the recorded arrays.
- U2, seen in a test: Weekly reported 400 rather than 366.6 kcal and zero rather than 36.66 g protein for ordinary portions. `useClientDetailData.ts:296-298` now applies each multiplier and reads `protein_g`.
- U3, seen in a test: Summary omitted the local-day query and could read the next UTC day's food on a Pacific evening. `useClientDetailData.ts:48` and `api.ts:836-837` now send the same day used to label the returned entries.
- U4, seen in a test: Food review displayed storage day keys and meal-type labels. `FoodLogReviewSection.tsx:177,193` now formats those headings without changing recorded details.
- U5, seen in a test: Weekly and Workouts mixed `lbs` and `lb`. `WeeklySummaryTab.tsx:55,81,108,115` and `WorkoutsTab.tsx:126` now use `lb`.

## Routes/actions before -> after

| Label/action | Before | After | Evidence |
|---|---|---|---|
| Weekly week row | Toggle the selected `weekStart` disclosure | Same callback and week key | New regression renders collapsed/expanded details and presses disclosure |
| Weekly period selector | Read selected 7/30/90-day timeline | Unchanged selector and loader parameter | New loader tests; existing all-tab/navigation parity |
| Workouts build with AI | Existing client-specific generator callback | Same callback and generator destination | New press assertion; existing screen parity |
| Adjust a saved workout | Existing copy-and-adjust callback to `CoachWorkoutBuilder` | Same entry, callback and destination | Existing workout/navigation parity |
| Food review Send feedback | `onOpenMessages` | Same callback | New and existing press assertions |
| Food review Meal plans | `onOpenMealPlans` | Same callback | New and existing press assertions |
| Food review Refresh | Reload meals and refetch the current target | Same handlers | New press/refetch assertions |
| Food review 7d/14d/30d | Reload the selected food-review period | Same period controls and request | New filter assertions |
| Food review Retry | Reload failed food-review request | Same callback | Existing failure/retry test |
| Client-detail tabs, back, messages, archive/unarchive and pull-to-refresh | Existing routes and handlers | Unchanged | Existing nine-tab/header/AI navigation-parity test |

No route, control or important recorded detail was removed.

## Truthful-copy sweep

| Surface | Data behind the displayed text |
|---|---|
| Weekly calories/protein | Actual persisted food nutrition multiplied by recorded portions |
| Weekly volume | Recorded load times recorded reps, not an inferred target |
| Summary today | Device calendar day passed to the existing summary query |
| Food-review day/meal | Selected eat date and supported recorded meal type |
| Pound captions | Existing pound values, without conversion or changed numeric units |

No praise, promise, new sharing claim, first-person copy, exclamation mark, emoji or new colour was introduced.

## Tests and documentation

Local runs used the shared-dependency link and `/home/user/workspace/ops/heavy.sh`, one file per invocation:

- `src/__tests__/coachWeekly131.test.tsx`: 9 passed.
- `src/__tests__/coachFoodReview124.test.tsx`: 15 passed.
- `src/__tests__/coachClientWorkoutsMakeover127.test.tsx`: 7 passed.
- `src/services/__tests__/apiClients.test.ts`: 30 passed.

Failing-first proof was run against unchanged main code before the implementation: the original 8-test regression file had 7 failures/1 pass; the added protein-only assertion failed with received 0 versus expected 36.66. No full-project typecheck or test suite ran locally; PR CI supplies those checks.

Updated `src/screens/coach/README.md` and `src/services/README.md`. No new backend endpoint, flag, dependency, lockfile, migration or production operation.

## Quiet-luxury checklist

- [x] No heavy display weights, placeholder features or TODO/FIXME copy introduced.
- [x] No emoji, exclamation mark, oversized radius, floating widget or global banner introduced.
- [x] Existing theme colours, typography and controls retained; no visual redesign outside the assigned row.
- [x] All important information and existing pathways retained.
