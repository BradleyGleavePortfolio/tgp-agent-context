Tier: T1
Why: A bounded store-only correction keeps Home bound to its selected day and removes an unreadable converted-ounce decimal.
T4 trigger scan: none; no auth, tenancy, permissions, secrets, persistence or backend write contract changes.
T3 trigger scan: none; no new architecture, endpoint, dependency, schema or navigation.
Bounded T1: YES; one store, two date checks, display-only rounding, existing test file and module README.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 131
Acceptance evidence: targeted store suite failed first in exactly the three new regressions (10 existing tests passed), then passed 13/13 after the fix; `git diff --check` clean.
Promotion triggers: changes to auth/tenancy/reset semantics, persistence, API contracts or shared request architecture require re-grading and operator routing.

## What changes for coaches/clients

- Home keeps today's meals, totals and water when a previously selected Food Log day finishes loading later.
- An earlier day's failed read no longer stops the selected day's loading indicator or adds an unrelated failure notice.
- A failed metric water add shows a rounded whole-ounce amount; the request remains in millilitres and rollback uses the original amount.

## B/U list

- B1 — seen in a test, fixed: a client selects an earlier Food Log day and then returns to Home while its read is pending; the earlier result replaced today's date, meals, totals and water. Smallest fix: check the requested date still matches the selected date before applying success or failure.
- U1 — seen in a test, fixed: a client's failed 250 ml quick-add displayed the full converted ounce decimal. Smallest fix: `Math.round(amountOz)` only in the failure notice.

## Routes/actions before -> after

No screen, route, button, store action signature or endpoint is added or removed.

| Label/action | Before | After |
| --- | --- | --- |
| Home focus / pull to refresh | `loadDayData(userId, today)` | Same call; a read for another day cannot replace it |
| Food Log day selection | `setSelectedDate(date)` then `loadDayData(userId, date)` | Same selected-day path and immediate clearing |
| Food add / reload | `logFood` then `loadDayData` | Unchanged |
| Water quick-add | `logWater` sends rounded ml; failure rolls back original ounces | Same request and rollback; only failure copy rounded |
| Food / water removal | `removeFoodLogLocally` / `removeWaterEntry` | Unchanged |
| Same-day refresh / retry | Retain verified data on failure; clear notice after success | Unchanged; existing regressions pass |

Parity evidence: direct store tests still reach day selection, day loads, water-add success/failure and reset; new regression checks confirm the metric add sends exactly 250 ml and rolls back to the prior total.

## Truthful sweep

- Day-specific meals, totals, water entries, loading state and error notices stay bound to the selected date.
- No new praise, coach/plan claims, privacy claims, first-person copy, exclamation marks, emojis or generic errors.
- No visual or colour change; Home unit presentation remains outside this store-only lane.

## Tests

Executed only through `/home/user/workspace/ops/heavy.sh`, one targeted file:

```text
./node_modules/.bin/jest src/store/__tests__/clientStore.failureStates.test.ts --runInBand --watch=false
Before fix: 3 failed, 10 passed.
After fix: 13 passed.
git diff --check: clean.
```

No full local suite, typecheck or lint run; PR CI provides those checks.

## Documentation and backend compatibility

- Updated `src/store/README.md` with selected-date completion rules, display-only rounding and the direct regression command.
- No backend dependency change; existing daily log and water endpoints are unchanged.
- No lockfile, dependency, flag, production or deployment changes.

agent 131
