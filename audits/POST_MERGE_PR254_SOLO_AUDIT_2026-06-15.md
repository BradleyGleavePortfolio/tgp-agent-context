FOLLOW_UP_REQUIRED
# Post-Merge PR #254 Solo Re-Audit — Current `main` — 2026-06-15

## 1. Verdict

**FOLLOW_UP_REQUIRED**

Solo hostile re-audit finds the paired auditor was too lenient. Current `main` still contains the two prior P3 findings, and the deeper pass found **two missed P2 flag-flip blockers** in the ED.2 router integration. Counts on current `main` (`64e2de4dd4625e20fa6b41b7678d999be53ba4fc`): **P0: 0 · P1: 0 · P2: 2 · P3: 2 · NEW: 2**.

The feature remains default-OFF, so this is not a P0 or immediate production revert. It is not clean for R81: if `EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER` is flipped without more fixes, one arc can navigate to an unregistered route and API failures/contract errors are rendered as real zero-count progress instead of a degraded/error state.

## 2. Scope and evidence basis

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#254`.
- Original merge commit audited: `8166486bfd386e6b3ac3c48d4b6bd660376eae8d`.
- Original diff base: `bad38fc0424ce1705de4043e74d84fecf316ca36`.
- Current `main` audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- Required GitHub file inventory command was run: `gh api repos/BradleyGleavePortfolio/growth-project-mobile/commits/8166486b --jq '.files'`.
- Original PR #254 diff inventory: 8 files, +824/−0:
  - `src/api/coachDailyRingsApi.ts`
  - `src/components/coach/CoachThreeArcRouter.tsx`
  - `src/components/coach/__tests__/CoachThreeArcRouter.test.tsx`
  - `src/config/featureFlags.ts`
  - `src/hooks/useCoachThreeArcCounts.ts`
  - `src/lib/roman/copy.ts`
  - `src/screens/coach/CoachHomeScreen.tsx`
  - `src/screens/coach/__tests__/coachHomeThreeArcFlagOff.test.tsx`
- Every touched file above was read in full on current `main`. Surrounding callers and route registration were swept with `grep` for `CoachThreeArcRouter`, `useCoachThreeArcCounts`, `coachDailyRingsApi`, `coachThreeArcCountsKeys`, and `romanDailyRings`.
- Evidence saved: `/home/user/workspace/audit-work/outputs/POST_MERGE_PR254_SOLO_EVIDENCE_2026-06-15.txt`.

## 3. Prior-finding verification

| Prior finding | Severity | Current-main status | Solo verification |
|---|---:|---:|---|
| F1 — Hook docstring says “Polled on Coach Home focus” with no focus-refresh mechanism | P3 | **STILL_PRESENT** | `src/hooks/useCoachThreeArcCounts.ts:4-6` still claims focus polling; the hook still only passes `queryKey`, `enabled`, `queryFn`, and `staleTime` to `useQuery` at `src/hooks/useCoachThreeArcCounts.ts:39-44`. Global query defaults still set `refetchOnWindowFocus: false` in `src/services/queryClient.ts:46-48`. |
| F2 — `CoachThreeArcRouter` hardcodes `accessibilityState={{ busy: false }}` | P3 | **STILL_PRESENT** | `src/components/coach/CoachThreeArcRouter.tsx:59-65` still has no `isLoading` prop, `src/components/coach/CoachThreeArcRouter.tsx:203-207` still hardcodes `busy: false`, and `src/screens/coach/CoachHomeScreen.tsx:296-303` still passes only `rings={dailyRingsQuery.data}`. |

## 4. New findings

| ID | Sev | Area | Finding |
|----|-----|------|---------|
| S1 | **P2** | Route / flag coherence | The BRIEF arc is exposed by `romanThreeArcRouter`, but its target route `SettingsStack > CoachBrief` is registered only when the independent `featureFlags.coachBrief` is true. Flipping ED.2 alone produces a broken tap target. |
| S2 | **P2** | Data/error state | `dailyRingsQuery.error` and `isError` are ignored; network, forbidden, timeout, and contract failures all flow into `rings={undefined}`, which the component renders as valid zero-count rings. |

## 5. Per-finding detail

### S1 (P2) — ED.2 flag can expose a BRIEF button whose route is not registered

**Files:** `src/screens/coach/CoachHomeScreen.tsx:290-305`; `src/navigation/CoachNavigator.tsx:392-400`; `src/config/featureFlags.ts:47-48,344-358`

```tsx
// src/screens/coach/CoachHomeScreen.tsx
{threeArcEnabled && (
  <FadeInView>
    <CoachThreeArcRouter
      rings={dailyRingsQuery.data}
      onPressCheckIns={() => navigation.navigate('ClientsStack')}
      onPressBrief={() =>
        navigation.navigate('SettingsStack', { screen: 'CoachBrief' })
      }
      onPressReview={() => navigation.navigate('Messages')}
    />
  </FadeInView>
)}
```

```tsx
// src/navigation/CoachNavigator.tsx
{featureFlags.coachBrief && (
  <SettingsStack.Screen name="CoachBrief" component={CoachBriefScreen} />
)}
```

```ts
// src/config/featureFlags.ts
coachBrief: readFlag('EXPO_PUBLIC_FF_COACH_BRIEF', isDev),
romanThreeArcRouter: readFlag('EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER', false),
```

`coachHomeThreeArcFlagOff.test.tsx` statically asserts that `onPressBrief` navigates to `SettingsStack > CoachBrief`, but it never checks whether that route is registered under the same flag configuration. The route is not governed by `romanThreeArcRouter`; it is governed by `coachBrief`. In a production/staging build, `coachBrief` defaults false unless `EXPO_PUBLIC_FF_COACH_BRIEF` is also set, while ED.2 can be enabled independently via `EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER=true`.

That makes the flag matrix unsafe: `romanThreeArcRouter=true` + `coachBrief=false` renders the BRIEF arc and sends users to an unregistered nested screen. React Navigation will warn/no-op instead of opening the brief. This violates the PR’s own “deep-links to real routes” guarantee and leaves one third of the router broken at the exact point the ED.2 flag is flipped.

**Severity rationale:** P2. The current production default is OFF, so this is not a live P1. It is a must-fix-before-flag-flip contract gap: a valid single-flag rollout configuration creates a broken user action.

**Recommended fix:** Either gate the BRIEF arc/action on `featureFlags.coachBrief`, register `CoachBrief` whenever `romanThreeArcRouter` is enabled, or change the target to a route that is always registered. Add a static matrix test proving `romanThreeArcRouter=true && coachBrief=false` does not expose an unregistered `CoachBrief` navigation target.

### S2 (P2) — Query errors and contract drift render as valid zero rings

**Files:** `src/screens/coach/CoachHomeScreen.tsx:60-64,290-305`; `src/hooks/useCoachThreeArcCounts.ts:36-44`; `src/components/coach/CoachThreeArcRouter.tsx:59-65,162-198`

```ts
// src/hooks/useCoachThreeArcCounts.ts
return useQuery<DailyRings, DailyRingsApiError>({
  queryKey: coachThreeArcCountsKeys.all,
  enabled: opts.enabled,
  queryFn: () => coachDailyRingsApi.get(),
  staleTime: DAILY_RINGS_STALE_TIME_MS,
});
```

```tsx
// src/screens/coach/CoachHomeScreen.tsx
const dailyRingsQuery = useCoachThreeArcCounts({ enabled: threeArcEnabled });

<CoachThreeArcRouter
  rings={dailyRingsQuery.data}
  onPressCheckIns={() => navigation.navigate('ClientsStack')}
  onPressBrief={() =>
    navigation.navigate('SettingsStack', { screen: 'CoachBrief' })
  }
  onPressReview={() => navigation.navigate('Messages')}
/>
```

```tsx
// src/components/coach/CoachThreeArcRouter.tsx
export interface CoachThreeArcRouterProps {
  /** Today's three-arc counts. Pass `undefined` to render three empty arcs. */
  readonly rings?: DailyRings;
  readonly onPressCheckIns: () => void;
  readonly onPressBrief: () => void;
  readonly onPressReview: () => void;
  readonly testID?: string;
}

const checkIns = rings?.checkIns ?? { reviewed: 0, submitted: 0 };
const briefOpened = rings?.brief.opened ?? false;
const review = rings?.review ?? { reviewed: 0, totalConversations: 0 };
```

`coachDailyRingsApi.get()` correctly distinguishes `forbidden`, `contract`, and `network` failures, but `CoachHomeScreen` throws away that signal. During an error state, `dailyRingsQuery.data` is `undefined`, the same value used for initial loading and zero/off fallback. `CoachThreeArcRouter` then renders `0/0`, `0/1`, `0/0` with the normal encouragement line. There is no visible error, no “unable to load” degraded state, no stale-data marker, and no component-level way to distinguish “backend flag returned real zero shape” from “the API timed out / 403ed / contract-drifted.”

This is not just an accessibility `busy` issue. The API layer was intentionally written to reject contract drift rather than silently mis-rendering, but the host re-silences the rejection by collapsing every failed query into the legitimate empty-ring view. A coach could open the enabled widget during an outage or schema mismatch and see a calm zero-work dashboard instead of being told the counts are unavailable.

**Severity rationale:** P2. The flag is currently OFF, and the screen is not a data-write path, so it is not P1/P0. Before flag flip, this is a correctness/observability blocker: the widget can display false operational status under common read failures.

**Recommended fix:** Add explicit status props to `CoachThreeArcRouter` (for example `isLoading`, `errorKind`, `isStale`) and render a distinct loading/error/degraded state. At minimum, hide the router or show “Counts unavailable” when `dailyRingsQuery.isError` is true, log/report `dailyRingsQuery.error.kind`, and add tests for network/contract/403 failures not rendering zero rings as valid data.

## 6. Exhaustive hostile scan — ruled-out P1/P2 axes

- **Auth / tenancy / IDOR:** no client-supplied resource ID is sent to the new counts endpoint; `coachDailyRingsApi.get()` calls the fixed `/coach/home/daily-rings` path and the client doc states server-side scoping to the calling coach. No mobile-side auth bypass was introduced.
- **DTO strictness / contract shape:** `DailyRingsSchema` is runtime Zod validation with `.strict()` on the root and subobjects. The missed issue is not permissive validation; it is that the host ignores the resulting `contract` error.
- **Network timeout:** the API call carries `AbortSignal.timeout(15_000)`. The missed issue is post-timeout UI handling, not a missing timeout.
- **Feature-flag default:** `romanThreeArcRouter` defaults `false` unconditionally and the mount/fetch are both gated on `threeArcEnabled`; the missed flag issue is the independent `coachBrief` target-route flag.
- **Motion / reduce motion:** the router uses static SVG arcs, no Reanimated entrance worklet, and no `useNativeDriver: false` introduced by PR #254.
- **RNTL v14:** every `render()` in the two PR #254 test files is awaited.
- **Touch targets:** each arc pressable contains a 72×72 SVG ring plus label, clearing the 44/48dp mobile target floor.
- **Theme tokens / raw colors:** the component uses `useTheme().semanticColors` plus token helpers; no raw hex was introduced in the ED.2 component.
- **Storage:** no AsyncStorage/MMKV access was introduced by the ED.2 API/hook/component/screen. The only current-main grep hit is an unrelated `featureFlags.ts` comment from a later MWB flag block, outside PR #254’s introduced lines.
- **R0 banned production patterns:** no PR #254 production-source hit for `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, `as any`, `TODO`/`FIXME`/`XXX`, `fontWeight: '700'|'800'`, or `useNativeDriver: false`. No new P0 found.
- **Telemetry registry/emit mismatch:** PR #254 introduced no telemetry event name registry entries; no registered-without-emit pair was found in this surface.
- **Backend write/race/transaction/idempotency:** not applicable to this mobile read-only widget; no local mutation or payment path was introduced.
- **Secrets / SQL / dependency supply chain:** no secrets, SQL construction, or package additions are in the PR #254 diff.

## 7. What is correctly implemented (do not regress)

- `romanThreeArcRouter` is default-OFF and gates both mount and fetch.
- `coachDailyRingsApi` uses a typed error class and rejects forbidden, contract, and network failures distinctly.
- `DailyRingsSchema` is strict and nonnegative/integer-validated.
- Static SVG arcs avoid motion-performance and reduce-motion pitfalls.
- The component uses accessible button roles, per-arc labels/hints, and a polite live region for the voice line.
- The zeroed-shape fallback is appropriate for the backend flag-OFF success case; it is not appropriate for query failure states.
- Existing static tests pin many useful invariants; they need additional flag-matrix and error-state cases, not deletion.

## 8. R0 / rules compliance summary

- **R0 (prod src):** no new PR #254 P0 banned-pattern hit found in production source.
- **R0 / R74 trailer sweep:** merge commit contains `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` and no assistant/Claude/GPT/Copilot attribution. Under the original audit posture this is treated as permitted human attribution; R74 now bans new co-author trailers going forward.
- **R72:** honored; no sampling. All 8 touched files were read in full on current `main`; new API callers and route registration were swept.
- **R65 / 50 failures:** walked. The relevant hits are S1 (flag/contract consistency) and S2 (error handling / observability / false status). Security, auth, data-write, transaction, rate-limit, storage, and dependency axes were ruled out above.
- **R77:** honored; no edits were made inside `/home/user/workspace/audit-work/worktrees/mobile`.
- **R79:** static pin tests were source-validated; tests were not executed because this was a read-only solo audit pass, not a builder/fixer run.
- **R81:** not clean; P2/P3 findings require a fix and fresh re-audit before the R81 debt can close.
- **R82:** no out-of-lane work is being deferred; the findings are in the PR #254 surface and should be fixed directly in the R81 follow-up cycle.

## 9. Hectacorn bar

The visual component itself is close to ship-quality, but the integration is not at Apple/Linear/Stripe bar. A premium dashboard router cannot expose a button whose route exists only under a different flag, and it cannot turn failed operational counts into calm zero-count status. Those are exactly the kind of flag-matrix and degraded-state seams that only show up under adversarial review.

## 10. Recommendation

1. **S1 (P2):** fix the ED.2/CoachBrief flag matrix so every exposed arc targets a registered route under every supported flag combination; add a pin test for `romanThreeArcRouter=true && coachBrief=false`.
2. **S2 (P2):** surface query failure states distinctly from legitimate zero backend counts; add tests for network, forbidden, timeout, and Zod contract errors.
3. **Prior F1 (P3):** correct the stale focus-polling docstring or implement real focus invalidation.
4. **Prior F2 (P3):** wire `busy` to the loading state or remove the misleading summary-level `accessibilityState`.
5. Re-run the mobile doctrine pin suite and a fresh R81 re-audit after fixes.

## 11. Source references

- Evidence: `/home/user/workspace/audit-work/outputs/POST_MERGE_PR254_SOLO_EVIDENCE_2026-06-15.txt`
- Worktree inspected: `/home/user/workspace/audit-work/worktrees/mobile` @ `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`
- Merge commit: `8166486bfd386e6b3ac3c48d4b6bd660376eae8d`
- Diff base: `bad38fc0424ce1705de4043e74d84fecf316ca36`
- Repo: https://github.com/BradleyGleavePortfolio/growth-project-mobile
- PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/254
