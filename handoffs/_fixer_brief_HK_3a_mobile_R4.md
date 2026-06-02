# HK-3a Mobile — R4 Fixer Brief

**PR:** BradleyGleavePortfolio/growth-project-mobile #224
**Branch:** `hk/PR-HK-3a-fitness-bucket`
**Pin from SHA (R55):** `8ce63aaff31ddbe83a1d2b6bdf8da6939294a42f`
**Base:** `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`
**Model:** Opus 4.8 (R-policy)
**Round:** R4

## Bradley R0 LAW (decacorn) — must honor
- NO "Coming soon" / silent failures / `@ts-ignore` / `@ts-nocheck` / `as any` / `.catch(()=>undefined)` / `catch(e){}` / spinner-only empty states.
- Bans apply to test titles too.
- Commit author MUST be `Dynasia G <dynasia@trygrowthproject.com>` — title-only, no `Co-Authored-By` / no `Generated-By`.

## Two P1s to fix

### P1 #1 — HK-3b GATING: add 3 missing sleep-bucket metric keys

**File:** `src/wearables/constants/metric-types.ts` (the `WEARABLE_METRIC_TYPES` const map + `WearableMetricType` union)
**Backend source of truth:** `growth-project-backend/src/wearables/constants/wearable-metric-type.enum.ts` at backend PR #356 SHA `14aa1454c3dc4ec21260d2ea6025d177e8564184`.

Add these three keys (mirror backend enum exactly):
```ts
SLEEP_DURATION_MIN: 'SLEEP_DURATION_MIN',
SLEEP_ONSET_ISO:    'SLEEP_ONSET_ISO',
SLEEP_WAKE_ISO:     'SLEEP_WAKE_ISO',
```

- Add to the const map AND the union type AND any test fixture mirror (search for `WEARABLE_METRIC_TYPES` and `WearableMetricType` repo-wide).
- If there's a Zod or io-ts schema mirroring the union, update it too.
- HK-3b PR #223 already imports these — verify your additions resolve those imports by attempting `npx tsc --noEmit` on `hk/PR-HK-3b-recovery-bucket` rebased onto your fix branch locally (DO NOT push HK-3b — just verify locally then discard).

### P1 #2 — `useWearablePreference` clear-pref error surface (R65 #36)

**File:** `src/wearables/hooks/useWearablePreference.ts`

**Current behavior:** Clear-pref overload's `onError` handler only logs when `opts.onError` is unset; if caller passes `onError`, error is consumed but `error` / `isError` are NOT exposed on the bound return.

**Required fix:**
1. Bound return for **both** set and clear overloads MUST include `error: mutation.error` and `isError: mutation.isError` (typed correctly).
2. Default `onError` behavior must still log the error AND leave the mutation's `error`/`isError` observable.
3. `opts.onError` remains optional/additive — calling it must NOT prevent the mutation's error state from being reflected in the return object.

**Test to add (in nearest existing spec for this hook):**
- Mock a clear-pref mutation to reject.
- Pass a caller `onError` spy.
- Assert: `onError` spy called once with the error, AND `result.current.isError === true`, AND `result.current.error` matches.
- Test title MUST NOT contain banned phrases.

## P3 polish (advisory — fix in this round if trivial, otherwise leave)
- `RingProgress` STROKE=14 → 12 or 16 (grid alignment)
- `RingProgress` GAP=6 → 4 or 8
- `LinkUnderline` height=1.5 → 1 or 2

These are Mobile Design Intel grid recommendations. If you touch the ring file for any other reason, normalize. Otherwise defer.

## Gates (must all pass)

```
npx tsc --noEmit
npx eslint .
npx jest --runInBand
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean
rm -rf ios android
git checkout package.json   # prebuild rewrites name; restore
```

CI must remain green.

## R65 50-Failures sweep (mandatory)
- silent failures: the very thing being fixed in P1 #2 — confirm no other hook eats errors without surfacing
- enum mirror drift vs backend: confirm zero drift after your add
- no `as any`, no `@ts-ignore`, no `.catch(()=>undefined)`, no `catch(e){}`
- no "Coming soon" / "TODO: implement"
- a11y labels / testIDs still stable

## Constraints
- Touch only the metric-types file, the hook file, related tests, and any mirror schema if present.
- Do NOT modify the `EmptyState`, `RingProgress`, or any backend code.
- Do NOT add `Co-Authored-By` or `Generated-By`. Title-only commits.
- Commit message:
  - For metric-types: `PR-HK-3a: add sleep-bucket metric keys to mobile enum mirror`
  - For hook: `PR-HK-3a: surface clear-pref error state in useWearablePreference`
  - (Or one combined: `PR-HK-3a: sleep metric enum + clear-pref error surface`)
- Push with `--force-with-lease`.

## Deliverable
Write `_fixer_result_HK_3a_mobile_R4.md` to `/home/user/workspace/` with:
- New head SHA (40-char)
- Files changed (paths + line counts)
- Test output summary
- Confirmation of all 5 gates
- HK-3b local TS check result (verify the 3 missing imports now resolve)
- R65 sweep results
- Any deviations

## STATUS expected
CLEAN at PR level (zero P0+P1+P2 from this brief). R4 audit will verify.
