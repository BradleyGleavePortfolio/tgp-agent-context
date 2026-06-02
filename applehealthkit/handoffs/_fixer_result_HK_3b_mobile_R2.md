# HK-3b Mobile — R2 Fixer Result

**PR:** BradleyGleavePortfolio/growth-project-mobile #223
**Branch:** `hk/PR-HK-3b-recovery-bucket`
**Pin from SHA (R55):** `8676a64103c9c2f015dffd3cf996f82beb315625`
**New head SHA:** `d666219dd64c8483f5b3f9c074ceb4248678ad6f`
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By
**Commit title:** `PR-HK-3b: wire shell + fix fixtures + chart label + midnight wrap + R65 polish`

**STATUS: CLEAN** — zero P0/P1/P2 from the brief remaining; all gates pass.

---

## Findings fixed (7/7)

### P1 #1 — 41 TypeScript errors → 0
- **Test fixtures (provider union widening):** Typed each test file's local sample-builder return as `SampleDatum` (imported from `wearablesSamplesApi`) with `provider: SampleDatum['provider'] = 'OURA'`, so the `provider` literal resolves to the `WearableProvider` union instead of widening to `string`. No `as any`, no `as const`.
  - `__tests__/recoveryData.test.ts` — `sample(value, day, provider?)`
  - `__tests__/SleepRecoveryScreen.test.tsx` — `s(value, provider?)`
  - `coach/.../__tests__/SleepRecoveryTab.test.tsx` — `s(value, day, provider?)`
- **HrvTrendCard (`cards/HrvTrendCard.tsx`):** The chart mapping now produces `GlowChartPoint` (`{ value, label }`), mirroring the canonical `FitnessTrendCard` convention (`label` = ISO timestamp = `p.at`). Removed invalid props the chart never accepted (`color`, `formatValue`, `testID`) and added the **required** `reduceMotion` (via the shared `useReduceMotion()` hook) plus an `accessibilityLabel`. The implicit-`any` `formatValue` callback was deleted (chart formats its own readout). NOTE: the brief's suggested snippet used an `at` field — the actual `GlowChartPoint` type has no `at`; mirrored the real type exactly.

### P1 #2 — Wire SleepRecoveryScreen into WearablesShell
- `WearablesShell.tsx`: imported `SleepRecoveryScreen`; the `SLEEP_RECOVERY` branch now renders `<SleepRecoveryScreen />` (mirrors `<HealthFitnessScreen />`). Removed the `RecoveryConnectSurface` placeholder entirely — the connect/empty/error states live INSIDE SleepRecoveryScreen (its `SleepRecoveryEmptyState`). Cleaned up now-unused imports (`Ionicons`, `Pressable`, `Text`, `radius`, `typography`) and the dead `recovery*` styles.
- Updated `__tests__/WearablesShell.test.tsx` (mocks `SleepRecoveryScreen`, asserts `RECOVERY_OVERVIEW` mounts on switch + deep-link, still asserts no "coming soon"). This test was not in the brief's file list but had to change because the placeholder it asserted on was removed by the required wiring.

### P1 #3 — Jest FreshnessChip QueryClient issue (Option B — refactor, preferred)
- `components/FreshnessChip.tsx` split into:
  - `FreshnessChipPure(props)` — pure presentational, takes a resolved `connections` list, calls **no hook**.
  - `FreshnessChipConnected(props)` — calls `useWearableConnections()`, delegates to pure.
  - `FreshnessChip(props)` — wrapper that **short-circuits the hook entirely** when a `connections` prop is supplied (pure path), else uses the connected variant. Removes the hidden state-coupling.
- `__tests__/SleepRecoveryScreen.test.tsx`: added a `useWearableConnections` mock (`{ data: [] }`) so the full-overview render path (which mounts the chip) works without a QueryClientProvider. The 3 previously-failing tests (deficit banner, hero score, malformed-param) now pass.

### P2 #4 — Sleep consistency midnight wrap
- `recoveryData.ts`: replaced linear `spread()` with `circularSpread(values, period = 1440)` computing the smallest-arc spread on a 24h clock (`period - largestGap`, including the wrap gap). `sleepConsistency()` now uses it for bedtime + wake spread.
- New unit tests in `recoveryData.test.ts`:
  - 23:50 + 00:10 → **20** (not ~1420)
  - 22:00 / 00:00 / 01:00 → **180**
  - single night → **0**; no onset series → **null**
- Existing expectations preserved (bedtime [1380,1410,1350] → 60; wake [405,420,450] → 45).

### P2 #5 — Floated refetch promises
- `SleepRecoveryScreen.tsx` and `coach/client-detail/SleepRecoveryTab.tsx`: `void query.refetch().catch((error: unknown) => logger.warn(<context>, 'refetch rejected', { error }))` — matches the repo logger signature `(context, ...args)`. No `.catch(()=>undefined)` / `.catch(()=>{})`.
- Updated the two retry tests to mock `refetch` as `jest.fn().mockResolvedValue(undefined)` (React Query's `refetch` returns a Promise), so the `.catch` chain is valid in the mocked tree.

### P3 #6 — Remove "silent"
- `__tests__/CalmSlowReveal.test.tsx`: title → `falls back to the instant reveal path when the reduced-motion query rejects with content visible`.
- `components/CalmSlowReveal.tsx`: comment reworded (no "silent").
- `empty/SleepRecoveryErrorState.tsx`: header comment `#36 silent failures` → `#36 surfaced failures`.
- Also neutralized "silent(ly)" wording introduced/encountered in `SleepRecoveryScreen.tsx`, `SleepRecoveryTab.tsx`, and a pre-existing comment in `FreshnessChip.tsx` ("silently 'current'" → "defaulting to 'current'") so the touched files are fully free of the banned word.

### P3 #7 — Coach tab ordering
- `coach/ClientDetailScreen.tsx`: reordered to Summary, Logs, Plan, Progress, Fitness (`healthFitness`), Recovery (`sleepRecovery`), Workouts, Timeline, Weekly — `sleepRecovery` now directly after `healthFitness`. Comment updated.

---

## Files changed (14, +238 / −148)

| File | ± |
|---|---|
| src/screens/client/wearables/WearablesShell.tsx | 98 |
| src/screens/client/wearables/components/FreshnessChip.tsx | 71 |
| src/screens/client/wearables/__tests__/recoveryData.test.ts | 58 |
| src/screens/client/wearables/recoveryData.ts | 42 |
| src/screens/client/wearables/__tests__/WearablesShell.test.tsx | 26 |
| src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx | 25 |
| src/screens/client/wearables/cards/HrvTrendCard.tsx | 17 |
| src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx | 17 |
| src/screens/client/wearables/SleepRecoveryScreen.tsx | 8 |
| src/screens/client/wearables/components/CalmSlowReveal.tsx | 8 |
| src/screens/coach/ClientDetailScreen.tsx | 6 |
| src/screens/coach/client-detail/SleepRecoveryTab.tsx | 6 |
| src/screens/client/wearables/__tests__/CalmSlowReveal.test.tsx | 2 |
| src/screens/client/wearables/empty/SleepRecoveryErrorState.tsx | 2 |

`package.json` restored after prebuild (NOT in commit).

---

## Gate results — ALL PASS

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** (was 41) |
| `npx eslint` (touched files) | **clean** (exit 0) |
| `npx jest --runInBand` | **188 suites / 2053 tests passed**, 4 snapshots |
| `npx expo prebuild --platform ios --clean` | **Finished prebuild** (CocoaPods skipped — non-macOS) |
| `npx expo prebuild --platform android --clean` | **Finished prebuild** |
| `rm -rf ios android; git checkout package.json` | done; tree clean (only node_modules untracked) |

---

## R65 50-Failures sweep (touched files + diff)

- silent failures / `catch(e){}` / `.catch(()=>undefined)` / `.catch(()=>{})`: **0**
- `as any` / `@ts-ignore` / `@ts-nocheck` in src AND tests: **0** (none added; diff verified)
- "Coming soon" / "TODO: implement": **0** real (only negations: "NOT a Coming soon placeholder" + a test asserting its absence)
- "silent" in test titles / comments: **0** in touched files
- spinner-only empty states: **0** — Recovery now mounts SleepRecoveryScreen whose empty/error states are value-first (anti-spinner) and own the connect surface
- enum mirror parity vs backend: provider union sourced from `SampleDatum['provider']` (single source of truth) — clean
- date-time edge cases: midnight wrap fixed + unit-tested
- query invalidation / refetch error path: floated refetch now logs rejection (documented), never dropped
- a11y labels / testIDs: stable; HRV chart gained a descriptive `accessibilityLabel`; `hrv-copy`/`hrv-empty-chart` testIDs preserved
- title-only commit, correct author, no Co-Authored-By/Generated-By: verified

---

## Test additions
- `recoveryData.test.ts`: 3 new `sleepConsistency` cases (midnight short-arc = 20; three-night straddle = 180; single-night = 0 / no-data = null).
- `WearablesShell.test.tsx`: recovery bucket now asserts `SleepRecoveryScreen` mounts (switch + deep-link).
- `SleepRecoveryScreen.test.tsx` / `SleepRecoveryTab.test.tsx`: `refetch` mocks return a Promise to exercise the logged-rejection retry path.

## Deviations
1. **HrvTrendCard chart props:** Followed the ACTUAL `RevolutGlowChart` / `GlowChartPoint` API (`{ value, label }`, required `reduceMotion`, no `at`/`color`/`formatValue`/`testID`) rather than the brief's illustrative snippet which referenced a non-existent `at` field and props. Mirrored sibling `FitnessTrendCard` exactly.
2. **P1 #3 implementation:** Did the Option B component split AND added a `useWearableConnections` mock to `SleepRecoveryScreen.test.tsx` (a listed file). SleepRecoveryScreen itself needed no change — its `FreshnessChip` (no `connections` prop) resolves via the mocked hook through the new connected wrapper.
3. **WearablesShell.test.tsx edited** (not in the brief's touch-list) because the required shell wiring removed the placeholder surface it asserted on; updated to assert the new mount behavior. No production behavior beyond the brief.
4. Neutralized one pre-existing "silent" comment in `FreshnessChip.tsx` (a file I was already editing) to keep touched files fully banned-word-free.
