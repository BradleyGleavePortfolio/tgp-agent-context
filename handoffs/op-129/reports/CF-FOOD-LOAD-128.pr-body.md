Tier: T1
Why: Bounded Food Log presentation and in-memory day-selection fix; backend writes, data contracts and navigation stay unchanged.
T4 trigger scan: none; no auth, tenancy, sharing, credentials, payments or destructive API change.
T3 trigger scan: none; no legal/safety/AI prompt or persisted-contract change.
Bounded T1: YES; selected-day loading/reset and scoped copy/chrome, with rendered regression and action-parity evidence.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 129; CLIENTFIX-128 / CF-FOOD-LOAD-128
Acceptance evidence: 56 passing targeted tests in 10 changed/new files; first-load/date-change tests fail against baseline main; CI required at the PR head.
Promotion triggers: changing API contracts, persisted nutrition, access/sharing, offline-write semantics or deletion authority would require re-grading.

## What changes for coaches/clients
Clients see a skeleton while their selected day's first read is pending, not zero totals or four false empty-meal messages. Choosing another date immediately drops the previous day's food, totals and water; a failed read leaves a clear retry and all four meal entry points, not old numbers under a new date.

A successfully empty day has one instruction. Food Log buttons use sentence case, search failures use a neutral hairline, and the edit sheet uses theme tokens and radius 4. Coaches' reads and every food/water write are unchanged and remain compatible with the current production backend.

## B/U closure
- B: none in the assigned FW-FOOD-128 rows.
- U3: shared `SkeletonScreen` until the selected day has been read; summary/water values are withheld while unknown.
- U4: `setSelectedDate` clears food/totals/water on an actual date change; same-day refresh retains verified data, including on refresh failure.
- U13 (Food Log): one empty-day instruction, sentence-case action labels, neutral search failure, themed hairline edit sheet.

## Scope and overlap
Based on main and merged with current `origin/main` before READY. The diff is deliberately minimal for FOOD-LOAD-128.

Before editing, fetched origin and listed changed files for every mobile branch on the operator board using `git diff --name-only origin/main...origin/<branch>`. None touched the assigned code/test files. Several open PRs touch `src/screens/client/README.md`; that file is intentionally untouched. Per the assignment, the scoped module-documentation update is only the Food Log row in `docs/QUIET_LUXURY_DOCTRINE.md` section 8.

The portion picker and manual-entry form receive only the exact button-label case changes required by U13; their math, validation, styles and handlers are unchanged. No dependencies, lockfiles, navigator or backend changes.

## Routes/actions before -> after
| Label/control before | Destination or effect after |
|---|---|
| Previous day / Next day / date caption | Same selected-day navigation and jump-to-today; next remains disabled at today. |
| Add Food (Breakfast, Lunch, Dinner, Snacks) | Add food: same sheet with the same meal slot; all four remain reachable after a failed day read. |
| Search field / clear search / Try again | Same debounced catalog search, clear and retry handlers. |
| Recent / Frequent | Same last-seven-days browse lists. |
| Result / suggestion row | Same portion picker, including parsed or last-used portion. |
| Add all on a repeat meal | Same earlier meal and original portions, saved through the existing handler. |
| Enter Manually / Back to Search | Enter manually / Back to search: same manual form and return-to-search flow. |
| Portion quantity / unit chips | Same quantity input and supported conversions. |
| Log Food (search or manual) | Log food: same API writes or per-user offline queue, with existing save/failure feedback. |
| Portion Cancel / native request-close | Same return to the current search without losing its query. |
| Close search / Done / native request-close | Same sheet-close handler. |
| Entry tap / long press | Same edit sheet / confirmed delete. |
| Edit quantity / unit / meal | Same portion and meal-edit state. |
| Cancel edit / Save edit | Same cancel without a write / existing update and day reload. |
| Delete entry / confirmation Cancel / Delete | Same confirmation, abort or existing delete and reload. |
| Water quick adds | Same three WaterTracker handlers once the day's values are known; no invented number while the initial day read is pending/failed. |
| Pull to refresh / day-error Try again | Same offline-queue sync and selected-day reload. |

Parity proof: `LogScreen.foodJourney.test.tsx` exercises the real screen, store and portions on both iOS and Android, including every navigation, sheet, save, edit/delete, repeat, manual, water and refresh path above. `FoodLogging.makeover.test.tsx` retains component-level handler/font parity and checks the neutral search error.

## Truthful sweep
| State | Customer-facing result |
|---|---|
| Initial/new-day request pending | Skeleton; no calorie/water numbers or empty-day assertion. |
| New-day request fails | Specific connection/retry message; no prior-day rows/numbers or empty-day assertion; all four Add food actions remain. |
| Successful empty day | One neutral instruction, real zero totals and four meal entry points. |
| Successful populated day | Server-returned foods, portions, totals and water. |
| Same-day refresh pending/fails | That same day's previously read data stays, with the existing explicit failure message on failure. |
| Search failure | Existing specific search message and retry/manual actions; neutral theme-derived text/hairline. |
| Edit sheet | Existing food name/portion/meal and save/delete/cancel actions; themed scrim and radius 4. |

No invented targets, counts, streaks, coach activity or sharing claims. No new first-person copy, emoji or exclamation marks. Dark remains hidden for launch; the changed page, meal and search colours use semantic theme tokens.

## Tests and failing-first evidence
All local runs were one targeted file at a time through `/home/user/workspace/ops/heavy.sh`; no full local suite, typecheck or lint.

Baseline main `a1be6fb25538b02e961fd379a0d86d71d610ad7a` was restored for a tests-first run:
- `clientStore.failureStates.test.ts`: 3 failing / 7 passing; the normal day-change test demonstrates 420 calories and 20 oz retained under the next date.
- `LogScreen.dayLoading.test.tsx`: 3 failing / 1 passing; the first-load skeleton and new-day clearing are missing, and the empty instruction appears four times.

After the fix: `clientStore.failureStates` 10, `LogScreen.dayLoading` 4, `LogScreen.foodJourney` 10, `LogScreen.foodPortions` 6, `LogScreen.foodSpeed` 6, `LogScreen.lastPortion` 2, `LogScreen.offlinePending` 5, `FoodLogging.makeover` 6, `ManualFoodEntryForm.requiredNutrition` 2, `QuantityPickerModal.portions` 5: **56 passing**.

Evidence retained in the operator workspace under `ops/reports/CF-FOOD-LOAD-128-evidence/`. CI runs the full lint, typecheck, tests and guards. No production sign-in, writes, merge, deployment or store build.

agent 129
