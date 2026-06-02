# HK-3b Mobile — R2 Fixer Brief

**PR:** BradleyGleavePortfolio/growth-project-mobile #223
**Branch:** `hk/PR-HK-3b-recovery-bucket`
**Pin from SHA (R55):** `8676a64103c9c2f015dffd3cf996f82beb315625` (rebased on main post-HK-3a merge)
**Base SHA:** `985349d2e23dab1ad13b67d97dbc2584b8982ffa` (current main)
**Model:** Opus 4.8 (R-policy)
**Round:** R2 (R1 audit returned NEEDS_FIX with 41 TS errors + 1 wiring P1 + 1 jest gate P1 + 2 P2s + 2 P3s)

## Bradley R0 LAW (decacorn) — must honor
- NO "Coming soon", NO silent failures, NO `@ts-ignore`/`@ts-nocheck`/`as any`, NO `.catch(()=>undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- Bans apply to test titles too.
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By.
- R65 50-Failures sweep mandatory.

## Findings to fix

### P1 #1 — 41 TypeScript errors (test fixtures + HrvTrendCard)

**Files with errors:**
- `src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx:99,100,118,133`
- `src/screens/client/wearables/__tests__/recoveryData.test.ts:40,41,48,60,69,70,71,72,86,87,101,111,112,113,114,123,136,137,148,168,175,199,211` (~29 errors)
- `src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx:107,114`
- `src/screens/client/wearables/cards/HrvTrendCard.tsx:71,75`

**Test fixtures (provider type widening):** Currently fixtures construct sample objects with `provider: 'OURA'` typed as `string`. The target type requires `WearableProvider` union.

**Fix pattern:**
- Create a typed test helper at top of each affected test file (or shared in `src/screens/client/wearables/__tests__/__fixtures__/sample.ts`):
  ```ts
  import type { WearableSamplesResponse } from '../../../../api/wearablesSamplesApi';
  type SampleDatum = WearableSamplesResponse['series'][number]['samples'][number];
  function sample(start_at: string, end_at: string, value: number, provider: SampleDatum['provider'] = 'OURA'): SampleDatum {
    return { start_at, end_at, value, provider };
  }
  ```
- Replace all inline `{ start_at: '…', end_at: '…', value: N, provider: 'OURA' }` literals with `sample('…', '…', N)` or `sample('…', '…', N, 'WHOOP')` if a specific provider is needed.
- Do NOT use `as any`, `as const` is acceptable on the provider literal but the typed helper is cleaner.

**HrvTrendCard (`src/screens/client/wearables/cards/HrvTrendCard.tsx:71-75`):**
- The TrendPoint→GlowChartPoint mapping is missing the required `label` field; also the `formatValue` callback `v` is implicit `any`.
- Fix:
  ```ts
  const points: GlowChartPoint[] = trend.map((p) => ({
    at: p.at,
    value: p.value,
    label: formatLabel(p.at),  // existing label helper (look up convention used by other Glow charts in the repo)
  }));
  const formatValue = (v: number): string => `${Math.round(v)} ms`;
  ```
- Confirm the GlowChartPoint type signature in `src/charts/GlowChart.tsx` (or similar) and mirror its `label` field exactly.

### P1 #2 — Wire SleepRecoveryScreen into WearablesShell

**File:** `src/screens/client/wearables/WearablesShell.tsx:52,139-144`

Currently bucket `SLEEP_RECOVERY` renders `RecoveryConnectSurface` (placeholder). The actual HK-3b screen is unreachable.

**Fix:**
- Import `SleepRecoveryScreen` alongside `HealthFitnessScreen`
- In the bucket switch, render `<SleepRecoveryScreen .../>` for `bucket === 'SLEEP_RECOVERY'`
- Pass the same navigation/route props used by HealthFitnessScreen (mirror the import structure)
- Keep the connect-state surface logic INSIDE SleepRecoveryScreen (its EmptyState already handles the empty case)

### P1 #3 — Jest QueryClientProvider missing in SleepRecoveryScreen tests

**File:** `src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx:108,126,141`
**Root cause:** `FreshnessChip` (`src/screens/client/wearables/components/FreshnessChip.tsx:214-221`) calls `useWearableConnections()` unconditionally — even when an optional `connections` prop is passed.

**Choose one — prefer Option B (cleaner separation):**

Option A: Wrap affected tests in a `QueryClientProvider`. Add a shared `renderWithQueryClient` helper to the test file (or import from existing test util if one exists in the repo).

Option B: Refactor `FreshnessChip` into a pure presentational component + hook-backed wrapper:
- `FreshnessChipPure(props: { connections: WearableConnection[] | undefined; ... })` — does NOT call any hook.
- `FreshnessChip(props)` — calls `useWearableConnections()` (or accepts an optional `connections` prop and skips the hook if provided), then delegates to `FreshnessChipPure`.

Option B is preferred because it removes hidden state-coupling from a chip that's used in many places. If you go with B, also ensure the existing optional `connections` prop short-circuits the hook entirely.

### P2 #4 — Sleep consistency midnight wrap bug

**File:** `src/screens/client/wearables/recoveryData.ts:200-218`

`spread()` uses linear `max - min` on minutes-of-day. Bedtimes at 23:50 and 00:10 compute as ~1420 instead of ~20 minutes.

**Fix:**
```ts
function circularSpread(values: number[] | undefined, period = 1440): number | null {
  if (!values || values.length < 2) return values && values.length === 1 ? 0 : null;
  const sorted = [...values].sort((a, b) => a - b);
  let largestGap = sorted[0] + (period - sorted[sorted.length - 1]); // wrap gap
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > largestGap) largestGap = gap;
  }
  return period - largestGap;
}
```

Replace existing `spread()` calls in `sleepConsistency()` with `circularSpread()`. Add a unit test in `recoveryData.test.ts` covering midnight wrap:
- input `[23 * 60 + 50, 0 * 60 + 10]` → expected ~20 (not 1420)
- input `[22 * 60, 0 * 60, 1 * 60]` → expected ~180 minutes (10pm to 1am)
- single value → 0
- empty/null → null

Test title plain English; no banned phrases.

### P2 #5 — Floated refetch promises

**Files:**
- `src/screens/client/wearables/SleepRecoveryScreen.tsx:106-111`
- `src/screens/coach/client-detail/SleepRecoveryTab.tsx:77-80`

**Fix:** Wrap each `void query.refetch()` to log on rejection:
```ts
void query.refetch().catch((error: unknown) => {
  logger.warn('SleepRecovery refetch rejected', { error });
});
```
Use the existing `logger` import pattern used elsewhere in these files (or `console.warn` ONLY if no logger is available — match repo convention).

Do NOT use `.catch(() => undefined)` or `.catch(() => {})`.

### P3 #6 — Remove "silent" from test title and component comments

**Files:**
- `src/screens/client/wearables/__tests__/CalmSlowReveal.test.tsx:47`
- `src/screens/client/wearables/components/CalmSlowReveal.tsx:54-57` (comment)
- `src/screens/client/wearables/empty/SleepRecoveryErrorState.tsx:3` (comment)

**Fix:** Replace any test title or comment containing the word "silent" with neutral wording. Suggested test name:
```ts
it('falls back to the instant reveal path when the reduced-motion query rejects with content visible', ...)
```
Comments: describe the fallback behavior without the word "silent".

### P3 #7 — Coach tab ordering mismatch

**File:** `src/screens/coach/ClientDetailScreen.tsx:270-280`

Move `{ key: 'sleepRecovery', ... }` entry directly after `{ key: 'healthFitness', ... }`. Tab order should be: Summary, Logs, Mealplan, Progress, Health & Fitness, Sleep & Recovery, Workouts, Timeline, Weekly. Update comment to match if it's off.

## Gates (must all pass)

```
npx tsc --noEmit                                  # 0 errors required
npx eslint . (or `npm run lint`)                  # warnings OK if pre-existing only
npx jest --runInBand                              # all suites green
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean
rm -rf ios android
git checkout package.json   # prebuild rewrites name; restore
```

## R65 sweep (mandatory)
- silent failures / catch(e){} / `.catch(()=>undefined)`: 0
- `as any` / `@ts-ignore`: 0 in src AND tests
- "Coming soon" / "TODO: implement": 0
- spinner-only empty states: 0
- enum mirror parity vs backend: verified clean post-HK-3a
- date-time edge cases: midnight wrap fixed
- query invalidation / refetch error path: documented + logged
- a11y labels / testIDs stable
- test titles: free of banned phrases (including "silent")

## Constraints
- Touch only the files listed above.
- Do NOT add `Co-Authored-By` or `Generated-By`. Title-only commit:
  `PR-HK-3b: wire shell + fix fixtures + chart label + midnight wrap + R65 polish`
- Push with `--force-with-lease`.

## Deliverable
Write `/home/user/workspace/_fixer_result_HK_3b_mobile_R2.md`:
- New head SHA (40-char)
- Files changed + line counts
- Gate results (tsc 0 errors; jest passing; prebuild OK)
- R65 sweep
- Test additions (midnight wrap, others)
- Any deviations

## STATUS expected
CLEAN at PR level (zero P0+P1+P2 from this brief). R2 audit will verify.
