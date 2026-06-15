FOLLOW_UP_REQUIRED
# Post-Merge PR #254 Audit — Current `main` Re-Audit — 2026-06-15

## 1. Verdict

**FOLLOW_UP_REQUIRED**

PR #254 is still not R81-clean on current `main` (`64e2de4dd4625e20fa6b41b7678d999be53ba4fc`). Both original P3 findings remain present in the current file state. No additional P0/P1/P2/P3 findings were identified during the requested mobile-specific re-validation pass. Counts on current `main`: **P0: 0 · P1: 0 · P2: 0 · P3: 2 · NEW: 0**.

The feature remains flag-off by default, mount-gated, and fetch-gated. This is not a revert-required state, but R81 requires even P3 findings to be cleared before the merge debt can close.

## 2. Scope and evidence basis

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#254`.
- Original merge commit audited: `8166486bfd386e6b3ac3c48d4b6bd660376eae8d`.
- Original diff base: `bad38fc0424ce1705de4043e74d84fecf316ca36`.
- Current `main` audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc` (`feat(mwb): EW2 undo button + command stack (mobile) — EXPO_PUBLIC_FF_MWB_UNDO off (#253)`).
- Original PR #254 diff inventory: 8 files, +824/−0.
- Later commits touching the PR #254 changed-file set: only `64e2de4` from PR #253, touching `src/config/featureFlags.ts` and `src/lib/roman/copy.ts`; neither original finding was fixed.
- Evidence saved:
  - `/home/user/workspace/audit-work/outputs/post_merge_mobile_249_254_evidence_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/post_merge_mobile_touch_a11y_evidence_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/post_merge_mobile_r0_evidence_2026-06-15.txt`

## 3. Original-finding status table

| Original finding | Severity | Current-main status | Evidence |
|---|---:|---:|---|
| F1 — Hook docstring says “Polled on Coach Home focus” with no focus-refresh mechanism | P3 | **STILL_PRESENT** | `src/hooks/useCoachThreeArcCounts.ts` still says “Polled on Coach Home focus”; the hook still only calls `useQuery` with `enabled`, `queryFn`, and `staleTime`, with no `useFocusEffect`, `useIsFocused`, `refetchInterval`, or invalidation. |
| F2 — `CoachThreeArcRouter` hardcodes `accessibilityState={{ busy: false }}` | P3 | **STILL_PRESENT** | `src/components/coach/CoachThreeArcRouter.tsx` still has no `isLoading` prop and still sets `accessibilityState={{ busy: false }}` on the summary container while the host passes only `rings={dailyRingsQuery.data}`. |
| New findings | — | **NEW: none** | The requested re-validation did not identify additional current-main findings beyond the original two. |

## 4. Per-finding re-validation

### F1 (P3) — STILL_PRESENT — Stale focus-polling docstring remains

**Current file:** `src/hooks/useCoachThreeArcCounts.ts:1-45`

```ts
/**
 * useCoachThreeArcCounts — TanStack Query hook for the ED.2 three-arc router.
 *
 * Reads GET /coach/home/daily-rings (the calling coach's three completion arcs
 * for today). Polled on Coach Home focus; the backend memoises for 30s, so the
 * client mirrors that with a 30s staleTime to avoid hammering the endpoint.
 */
```

```ts
return useQuery<DailyRings, DailyRingsApiError>({
  queryKey: coachThreeArcCountsKeys.all,
  enabled: opts.enabled,
  queryFn: () => coachDailyRingsApi.get(),
  staleTime: DAILY_RINGS_STALE_TIME_MS,
});
```

The comment is still stronger than the implementation. The hook has no focus listener, no `useIsFocused`, no `useFocusEffect`, no interval, and no explicit invalidate-on-return path. The actual behavior remains stale-time-based fetch/refetch, not focus polling.

**Recommended fix:** Reword the docstring to “Fetches when enabled; data is considered stale after 30s and refetches on the next eligible mount/query activation,” or implement real focus invalidation if that behavior is desired.

### F2 (P3) — STILL_PRESENT — `busy: false` remains hardcoded during loading

**Current files:** `src/components/coach/CoachThreeArcRouter.tsx:59-66,202-208`; `src/screens/coach/CoachHomeScreen.tsx:294-303`

```ts
export interface CoachThreeArcRouterProps {
  /** Today's three-arc counts. Pass `undefined` to render three empty arcs. */
  readonly rings?: DailyRings;
  readonly onPressCheckIns: () => void;
  readonly onPressBrief: () => void;
  readonly onPressReview: () => void;
  readonly testID?: string;
}
```

```tsx
<View
  style={styles.wrap}
  testID={testID}
  accessibilityRole="summary"
  accessibilityState={{ busy: false }}
>
```

```tsx
<CoachThreeArcRouter
  rings={dailyRingsQuery.data}
  onPressCheckIns={() => navigation.navigate('ClientsStack')}
  onPressBrief={() =>
    navigation.navigate('SettingsStack', { screen: 'CoachBrief' })
  }
  onPressReview={() => navigation.navigate('Messages')}
/>
```

The component still cannot reflect `dailyRingsQuery.isPending` because it has no loading prop. During an initial enabled fetch, `rings` can be undefined while the summary container tells assistive technology `busy: false`.

**Recommended fix:** Add `isLoading?: boolean` to `CoachThreeArcRouterProps`, pass `isLoading={dailyRingsQuery.isPending}` from `CoachHomeScreen`, and set `accessibilityState={{ busy: isLoading ?? false }}`; or remove the summary-level `accessibilityState` if the child labels/live region are the intended a11y contract.

## 5. Requested mobile validation checklist

| Check | Result | Notes |
|---|---:|---|
| 44dp iOS / 48dp Android touch targets | **PASS** | Each arc pressable contains a 72 × 72 SVG ring plus label, so the interactive surface exceeds both thresholds. |
| RN/Expo flag-off static pin tests | **PASS** | `coachHomeThreeArcFlagOff.test.tsx` still pins false default, `threeArcEnabled` derivation, query `enabled` wiring, guarded mount, real routes, and mount ordering. |
| Feature flag default-off | **PASS** | `featureFlags.romanThreeArcRouter` still reads `EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER` with explicit `false` default. |
| Telemetry register + emit | **PASS / N/A** | PR #254 introduced no ED.2 telemetry event registry entries; no dead registered-without-emit mobile telemetry pair was found in the target files. |
| Accessibility labels | **PASS** | Each arc has `accessibilityRole="button"` and a label containing label, fraction, and percent. |
| Screen-reader hints | **PASS with F2 exception for busy state** | Each arc has an explicit `accessibilityHint`, and the Roman voice line uses `accessibilityLiveRegion="polite"`; the remaining a11y issue is the summary `busy: false` state, tracked as F2. |
| No synchronous storage in render | **PASS** | No storage get/set API is used in the PR #254 production files. |
| AsyncStorage scoping | **PASS** | The only AsyncStorage/MMKV strings in the changed production set are unrelated comments in the shared feature-flag file; the ED.2 hook/component/screen do not import or call AsyncStorage. |
| R0 banned-pattern sweep | **PASS** | Current PR #254 production files have no hits for `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, `as any`, `TODO`/`FIXME`/`XXX`, or `fontWeight: '700'|'800'`. |
| R74 trailer sweep | **PASS** | The merge commit contains only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`, which is permitted in the original audit posture. |

## 6. R81/R72/R74/R77/R79/R82 compliance notes

- **R81:** FOLLOW_UP_REQUIRED because P3 findings remain; R81 requires P0-P3 clean.
- **R72:** Re-audit was not limited to the two rows; current main file state, later touching commits, flag pins, telemetry, touch targets, accessibility, storage, R0, and trailers were re-checked.
- **R74:** No new code commit was created. Output file only.
- **R77:** Read-only audit posture observed; repository state was inspected, not modified.
- **R79:** Static pin tests were source-validated. They were not executed locally because the checkout has no `node_modules`; source contracts remain pinned.
- **R82:** No deferred/out-of-lane new work was discovered. The existing findings should be fixed in the R81 follow-up cycle rather than tracked as permanent deferrals.

## 7. Hectacorn bar

The ED.2 router is still close but not clean. The touch targets, static SVG posture, flag gating, and labels/hints are strong; the remaining gap is polish/accuracy: documentation promises focus polling that does not exist, and assistive technology is told the summary is not busy even during the initial data load.

## 8. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/254`
- Current main head audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`
- Merge commit: `8166486bfd386e6b3ac3c48d4b6bd660376eae8d`
- Original audit input: `/home/user/workspace/audit-work/outputs/PR254_AUDIT_2026-06-14.md`
