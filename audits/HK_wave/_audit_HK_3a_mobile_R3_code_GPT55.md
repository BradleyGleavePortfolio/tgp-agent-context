# HK-3a Mobile — R3 Code-Depth Audit (GPT-5.5)

**PR:** BradleyGleavePortfolio/growth-project-mobile #224
**Pinned SHA (R55):** `8ce63aaff31ddbe83a1d2b6bdf8da6939294a42f`
**Base SHA:** `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`
**Auditor model:** GPT-5.5
**Date:** 2026-06-02
**Verdict:** NEEDS_FIX (R4)

## R2 NEEDS_FIX items
All VERIFIED_FIXED:
- P1 #1 EmptyState a11y label + truthy guard: VERIFIED_FIXED (`components/wearables/EmptyState.tsx`)
- P1 #2 `useWearablePreference` invalidation race + onError swallow: PARTIAL → see new P1 #2 below
- P1 #3 staleTime / refetchInterval consistency w/ backend SWR: VERIFIED_FIXED (`hooks/useWearableSamples.ts:42-58`)
- P2 #1 deterministic test IDs on bucket cards: VERIFIED_FIXED
- P2 #2 ring rendering uses single `react-native-svg` import path: VERIFIED_FIXED
- P3 spacing/typography on Sleep card: VERIFIED_FIXED

## NEW finding — P1 #1 (CRITICAL — HK-3b GATING)

`src/wearables/constants/metric-types.ts` (WEARABLE_METRIC_TYPES enum/const map) is **missing 3 sleep-bucket metric keys** that HK-3b PR #223 already imports:

- `SLEEP_DURATION_MIN`
- `SLEEP_ONSET_ISO`
- `SLEEP_WAKE_ISO`

HK-3b cannot rebase on main once #224 merges — TypeScript will fail with `TS2339: Property 'SLEEP_DURATION_MIN' does not exist`.

### Fix
Add the 3 keys to `WEARABLE_METRIC_TYPES` const map AND the `WearableMetricType` union AND the test fixture mirror, matching backend `wearable-metric-type.enum.ts` exactly:

```ts
SLEEP_DURATION_MIN: 'SLEEP_DURATION_MIN',
SLEEP_ONSET_ISO:    'SLEEP_ONSET_ISO',
SLEEP_WAKE_ISO:     'SLEEP_WAKE_ISO',
```

Backend already exposes them (verified at backend SHA `14aa1454…`). Mobile must mirror.

## NEW finding — P1 #2 (`useWearablePreference` clear-pref error surface)

`src/wearables/hooks/useWearablePreference.ts` — the **clear-pref** overload `onError` handler only logs when `opts.onError` is unset; otherwise it delegates fully to the caller. But the bound return shape does NOT expose `error` / `isError` from the underlying mutation in the clear-pref branch. So if a caller passes `onError`, error state is consumed but never surfaced to UI.

R65 #36 in a different shape (silent failure path — error sink with no UI surface).

### Fix
Bound return must always include `error: mutation.error` and `isError: mutation.isError`, in both set and clear overloads. `onError` opt remains optional and additive; default behavior must still log AND make state observable. Add a test asserting clear-pref failure surfaces `isError=true` even when `onError` is passed.

## R65 50-Failures Sweep
- silent failures: 1 (clear-pref onError sink — P1 #2 above)
- `as any` / `ts-ignore`: 0 in src; 2 in test (pre-existing)
- "Coming soon" / "TODO: implement": 0
- spinner-only empty states: 0
- catch(e){} / `.catch(()=>undefined)`: 0
- a11y labels: present and stable
- testIDs: deterministic
- query invalidation race: handled (R3 fix verified)
- enum mirror drift vs backend: **3 missing keys → P1 #1 above**

## P3 (advisory, non-blocking)
- `RingProgress` STROKE=14 — Mobile Design Intel prefers grid-aligned 12 or 16
- `RingProgress` GAP=6 — Intel grid prefers 4 or 8
- `LinkUnderline` height=1.5 — should be 1 or 2 (sub-pixel rounds inconsistently)

These don't gate merge but should be landed as polish in HK-3b or follow-up.

## Visual audit (separate file): CLEAN
See `_audit_HK_3a_mobile_R3_visual_opus48.md`. Only 2 P3s (EmptyState CTA ≈42pt borderline, ~1px font-weight shift on bucket card title).

## CI
PASS — no new failures.

## STATUS: NEEDS_R4_FIX
