Tier: T1
Why: Bounded, reversible water-goal copy and unit presentation in one existing component.
T4 trigger scan: none; no auth, tenancy, permission, credential, destructive-data or payment change.
T3 trigger scan: none; no shared architecture, backend contract, dependency or schema change.
Bounded T1: YES; one component, its tests and corresponding module documentation.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 129
Acceptance evidence: failing-first starter/metric tests; 9 goal/unit/theme/parity tests and 6 existing food-logging makeover tests passed locally, one targeted file at a time through the shared heavy runner.
Promotion triggers: changes to persistence, authentication, sharing, hydration recommendations or the backend API would require re-grading.

## What changes for coaches/clients

Clients see the unchanged default water reference labelled “Starter goal”, rather than an unexplained personal target; changed Settings values and explicit targets keep their values. [WaterTracker implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/tree/agent129/cf-food-water-128/src/components/WaterTracker.tsx)

Metric (`kg`) preferences now show ml totals, ml accessibility progress, the equivalent glass size and 250/350/500 ml quick-add buttons; imperial 8/12/16 oz actions remain unchanged. [WaterTracker implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/tree/agent129/cf-food-water-128/src/components/WaterTracker.tsx)

Metric buttons still call the existing ounce callback, converted so the unchanged store writes exactly the selected ml; displayed converted totals are marked approximate because the existing day read rounds to ounces. [WaterTracker implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/tree/agent129/cf-food-water-128/src/components/WaterTracker.tsx)

## B / U list

- B: none in this bounded assignment.
- U5: identify the default 100 oz reference as a starter goal.
- U7: honour metric units throughout WaterTracker and preserve working quick-add handlers.
- Profile goal restoration: assigned separately to CF-FAST-CALM-128; `useSettings.ts` is not edited here.
- Undo: outside this row; no dependency on an undeployed backend route.

## Scope and overlap

Based on main, with `origin/main` merged at `e634d19e2869e775cc80367732718caba8b371ba` before the opening push.

Before editing, inspected file lists using `git diff --name-only origin/main...origin/<branch>` for every open mobile branch on the operator board. No open branch touched WaterTracker or its goal test. m#523 touches `src/components/README.md`; the README rule requires that file, so this PR changes only its WaterTracker entries. The diff is deliberately minimal and based on main, not on another open PR.

No changes to the Food Log screen, Settings hook, store, navigators, API, backend, lockfile or dependencies.

Changed lines: **156** = source **52**, tests **98**, docs **6** (133 additions / 23 deletions).

## Routes/actions before -> after

Every row is exercised by the WaterTracker goal test; the existing makeover test retains the imperial amount/readout checks.

| Label / surface before | After | Destination or effect |
|---|---|---|
| `+8oz` / Add 8 ounces | Same in imperial | `onAdd(8)` |
| `+12oz` / Add 12 ounces | Same in imperial | `onAdd(12)` |
| `+16oz` / Add 16 ounces | Same in imperial | `onAdd(16)` |
| Metric preference still had oz buttons | `+250 ml`, `+350 ml`, `+500 ml` | Same `onAdd` handler with `ml / 29.5735`; inverse storage conversion yields exactly 250/350/500 ml |
| Water total / goal / progress | Same data; unit-aware display and accessibility value | No write or navigation |
| Glass count with 8 oz reference | Same count; about 237 ml reference in metric | No write or navigation |
| Navigation | None before or after | All parent Food Log pathways untouched |

## Truthful sweep

- Default reference: labelled “Starter goal”; no claim that a coach prescribed it.
- Changed Settings target and explicit `targetOz`: preserved, including an explicit target matching the default.
- Converted ml daily total: `≈` visually and “About” in the progress accessibility text; no false precision from the ounce-rounded read.
- Glass count: existing complete 8 oz equivalents retained, with the metric equivalent labelled “about”.
- Three quick-add buttons: each label describes its actual logged volume.
- Theme: all colours come from active semantic tokens, including light/dark test coverage.
- Quiet presentation: hairlines and Inter remain; numbers are tabular and tap targets remain at least 44 pt.
- No first-person customer copy, emojis, exclamation marks, new claims, navigation removal or dead controls.

## Tests

Failing-first proof: with production WaterTracker still identical to main `a1be6fb25538b02e961fd379a0d86d71d610ad7a`, the updated goal test produced **4 failed / 3 passed**. Failures were the starter label, metric starter display, metric changed-goal display and metric quick-add cases.

```text
/home/user/workspace/ops/heavy.sh npx jest src/components/__tests__/WaterTracker.goal.test.tsx --runInBand --no-watchman
PASS — 9 tests

/home/user/workspace/ops/heavy.sh npx jest src/components/log/__tests__/FoodLogging.makeover.test.tsx --runInBand --no-watchman
PASS — 6 tests

git diff --check origin/main...HEAD
PASS
```

Full typecheck/lint/suite belongs to PR CI; none was run locally. No merge, deployment, flag change, production sign-in or production data write.

agent 129
