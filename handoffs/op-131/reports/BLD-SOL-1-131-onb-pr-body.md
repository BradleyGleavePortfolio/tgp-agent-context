Tier: T1 — bounded consultation copy and a regression test.
Why: N2 must describe coach awareness, not promise automatic food filtering.
T4 trigger scan: no auth, tenancy, consent, data visibility/storage, credentials, payments or destructive data changes.
T3 trigger scan: no API, state machine, validation, rollout or routing changes.
Bounded T1: one `why` string, one test and the corresponding README.
Canonical builder: BLD-SOL-1-131 / ONB-N2-COPY-131, agent 131.
Parent owner: operator agent 131.
Acceptance evidence: the added N2 test failed against mobile main 842eb059 with the old promise; the targeted consultation engine file then passes all 41 tests.
Promotion triggers: any filtering implementation, consent/data-sharing change, endpoint change or consultation rollout requires a separately routed plan.

## What changes for coaches/clients

N2 now says "So your coach knows what you avoid." No food filtering is promised or implemented. Consultation rollout flags remain unchanged.

## B / U / C

- B: none on the current flag-off launch path.
- U: none.
- C, assigned scope (seen in a test): replace the unimplemented food-filtering promise before consultation rollout.

## Routes/actions before -> after

| Label/control | Before | After |
| --- | --- | --- |
| N2 avoidance chips, including exclusive Nothing | Existing options and selection rules | Unchanged |
| N2 Other / What else? | Existing detail and 140-character limit | Unchanged |
| N2 Continue | Existing validation and next consultation screen | Unchanged |
| Back / Pause | Existing consultation navigation and save handlers | Unchanged |
| N2 explanation | Food-filtering promise | Coach-awareness wording |

## Truthful sweep

Only N2's explanation changes. No invented result, claim of automatic filtering, first-person copy, exclamation mark, emoji, colour or layout change is introduced. P0 consent copy/version/hashes are untouched. The matching consultation README documents the wording.

## Checks

- Failing first: `src/lib/consultation/__tests__/consultationEngine.test.ts` — 1 failed (new N2 wording assertion), 40 passed.
- Fixed: same targeted file, through `ops/heavy.sh`, `--runInBand --watch=false` — 41 passed.
- Required CI must be green at the exact head before READY.
- Agent 131 does not merge or deploy.
