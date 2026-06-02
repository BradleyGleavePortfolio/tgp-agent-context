# HK-3a Mobile — R2 Code-Depth Audit (GPT-5.5)

**PR:** BradleyGleavePortfolio/growth-project-mobile #224
**Pinned SHA (R55):** `f7f003778fe5782b4497edf9e90791e470998aa2`
**Base SHA:** `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`
**Auditor model:** GPT-5.5 (general_purpose)
**Date:** 2026-06-01

---

## VERDICT: NEEDS_FIX

## R1_FINDINGS_VERIFICATION
All 5 CODE P0s and 2 CODE P1s **VERIFIED_FIXED**:
- P0 #1 chart path; P0 #2 named exports (FreshnessChip, RevolutGlowChart, WearableMetricType, WearableSamplesResponse, WearableSampleSeries, WearableSamplesError); P0 #3 FreshnessChip optional `connections`; P0 #4 useWearableSamples contract overload + providers/timezone queryKey; P0 #5 useWearablePreference `{metric}` overload; P1 #1 optimistic chip read; P1 #2 coach hour-rounded shared window.

## HK-3b Compat — ALL ✓
- chart path resolves from HK-3b imports ✓
- FreshnessChip shape ✓
- useWearableSamples shape (range/providers/timezone) ✓
- useWearablePreference shape ({metric}, mutate(p)) ✓
- all named exports present ✓
- WearableSamplesError is a real class (instanceof works) ✓

## NEW_FINDINGS
- **P0 NEW #1:** `src/screens/client/wearables/components/BucketSwitcher.tsx:57-64,98-104` Pressable ~38pt, no hitSlop/minHeight. Primary header control. **Fix:** add `minHeight: 44` and `hitSlop={{top:8,bottom:8,left:8,right:8}}`.
- **P0 NEW #2:** `src/screens/client/wearables/components/FreshnessChip.tsx:238-245,259-264` ~26pt + 16pt hitSlop = ~42pt. **Fix:** raise `minHeight: 44` or increase hitSlop to 12pt each side.
- **P1 NEW #1:** `src/hooks/useWearablePreference.ts:183-195` bound `mutate(null)` bypasses React Query mutation state/invalidation/cache clearing — silent-failure pattern (R65 #36). **Fix:** route clear through the mutation hook, clear preference cache, invalidate samples queries, surface error via callback.
- **P1 NEW #2:** `src/screens/client/wearables/charts/__tests__/RevolutGlowChart.test.tsx:28-30` `as any`. **Fix:** typed narrowing.
- **P2 NEW #1:** `src/screens/client/wearables/MetricDetailScreen.tsx:106-122` ms-specific rolling window in network query key. **Fix:** round to hour like HealthFitnessScreen.
- **P2 NEW #2:** `BucketSwitcher.tsx:57-73` active state color/background only. **Fix:** non-color indicator (filled-circle, position, or weight).
- **P2 NEW #3:** `BucketSwitcher.tsx:95` `spacing.xs / 2` (=2) off the 4pt grid. **Fix:** use a 4pt-grid token.

## R65 50-Failures Sweep
- silent catches: 3 — 2 documented platform-no-op (`RevolutGlowChart.tsx:84` haptic, `useReduceMotion.ts:30` probe), 1 actionable at `useWearablePreference.ts:192-195`
- as any / ts-ignore: 1 actual `as any` (test); 0 ts-ignore/ts-nocheck
- "Coming soon" / placeholders: 0
- sub-44pt tap targets remaining: 2 (BucketSwitcher, FreshnessChip)
- color-only active states remaining: 1 (BucketSwitcher)
- hardcoded hex outside theme: 8 test-fixture literals, 0 shipped-source literals
- off-grid spacing: 1
- queryKey collision risk: 1 ms-specific MetricDetail window

## CI Verification
- Latest CI: PASS

## STATUS: NEEDS_R3_FIX
