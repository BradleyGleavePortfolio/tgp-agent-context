# HK-3a Mobile R4 Code Audit — PR #224

**Pinned mobile HEAD:** `394b45b81af2666b2a945e953ed07b0f4ac0f3ee`  
**Base SHA:** `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`  
**Backend enum SHA checked:** `92418b2aa403e9873bb8e2f1e8e2cc0bf56a72df`  
**Repo/branch:** `BradleyGleavePortfolio/growth-project-mobile` / `hk/PR-HK-3a-fitness-bucket`

## Per-item verification table

| Item | Result | Evidence |
|---|---:|---|
| R3 P1 #1 / HK-3b gating: mobile metric mirror includes `SLEEP_DURATION_MIN`, `SLEEP_ONSET_ISO`, `SLEEP_WAKE_ISO` in canonical file | PASS | `WEARABLE_METRIC_TYPES` includes all 3 sleep keys, and `metricSchema = z.enum(WEARABLE_METRIC_TYPES)` drives the Zod schema in [`src/api/wearablesSamplesApi.ts:64-127`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/api/wearablesSamplesApi.ts#L64-L127). |
| R3 P1 #2: bound `useWearablePreference({ metric })` clear path exposes `isError` and `error` | PASS | Bound return includes `isError: mutation.isError || clearMutation.isError` and `error: clearMutation.error ?? mutation.error ?? null` in [`src/hooks/useWearablePreference.ts:229-240`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.ts#L229-L240). |
| R3 P1 #2: caller `opts.onError` is additive and does not suppress mutation state | PASS | Clear mutation uses React Query and forwards `opts.onError` without swallowing the state in [`src/hooks/useWearablePreference.ts:152-174`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.ts#L152-L174) and [`src/hooks/useWearablePreference.ts:244-251`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.ts#L244-L251). |
| R3 P1 #2 test coverage | PASS | Test verifies caller `onError` fires and bound return still has `isError`/`error` in [`src/hooks/useWearablePreference.test.tsx:282-309`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.test.tsx#L282-L309). |
| HK-3b TS import/literal verification | PASS | Lightweight TS check imported `WearableSamplesResponse`, `WearableSampleSeries`, `WearableSamplesError`, and assigned all three sleep metric literals to `WearableMetricType`; `HK3B_CONTRACT_TSC_EXIT=0` saved at `/tmp/wt-hk3a-mobile-r4-audit-artifacts/current/hk3b_contract_check.log`. A direct PR #223 rebase attempt conflicts broadly before typechecking due branch ancestry/add-add conflicts, but the missing import/type surface itself resolves. |
| R2: EmptyState a11y/truthy guard intact | PASS | `EmptyState` keeps stable testIDs, header/button a11y, and guards body/CTA rendering on truthy props in [`src/ui/empty-states/EmptyState.tsx:58-96`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/ui/empty-states/EmptyState.tsx#L58-L96); tests cover CTA role/label in [`src/ui/empty-states/__tests__/EmptyState.test.tsx:120-142`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/ui/empty-states/__tests__/EmptyState.test.tsx#L120-L142). |
| R2: staleTime/refetchInterval consistency | PASS | Samples hook uses a single `WEARABLE_SAMPLES_STALE_MS = 60_000` and no refetch interval in [`src/hooks/useWearableSamples.ts:38-41`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearableSamples.ts#L38-L41) and [`src/hooks/useWearableSamples.ts:153-159`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearableSamples.ts#L153-L159); tests pin 60s/5min constants in [`src/hooks/useWearableSamples.test.tsx:240-244`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearableSamples.test.tsx#L240-L244). |
| R2: deterministic testIDs | PASS | PR changed files do not add dynamic `testID` usage; shared `EmptyState` testIDs remain fixed strings in [`src/ui/empty-states/EmptyState.tsx:62-92`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/ui/empty-states/EmptyState.tsx#L62-L92). |
| R2: ring rendering import path | PASS | Ring hero imports `Svg, { Circle }` from `react-native-svg`, creates `AnimatedCircle`, and renders real tracks/progress rings in [`src/screens/client/wearables/cards/ThreeRingHero.tsx:22-32`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/screens/client/wearables/cards/ThreeRingHero.tsx#L22-L32) and [`src/screens/client/wearables/cards/ThreeRingHero.tsx:86-158`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/screens/client/wearables/cards/ThreeRingHero.tsx#L86-L158). |
| Query invalidation race | PASS | Set-preference uses optimistic cache writes, rollback, and samples-root invalidation on settle in [`src/hooks/useWearablePreference.ts:106-139`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.ts#L106-L139); clear-preference routes through a tracked mutation and invalidates on success in [`src/hooks/useWearablePreference.ts:155-167`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.ts#L155-L167). |

## Enum parity check result

**PASS — zero drift.** Backend `WearableMetricType` at `92418b2aa403e9873bb8e2f1e8e2cc0bf56a72df` has 29 values, and mobile `WEARABLE_METRIC_TYPES` at `394b45b81af2666b2a945e953ed07b0f4ac0f3ee` has the same 29-value set. Mobile is strict equal and therefore a superset/equal set. Saved machine-readable comparison: `/tmp/wt-hk3a-mobile-r4-audit-artifacts/audit_*/enum_parity.json`.

Backend enum evidence: [`prisma/schema.prisma:5001-5033`](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/92418b2aa403e9873bb8e2f1e8e2cc0bf56a72df/prisma/schema.prisma#L5001-L5033). Mobile enum evidence: [`src/api/wearablesSamplesApi.ts:64-96`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/api/wearablesSamplesApi.ts#L64-L96).

## New findings

None. No P0/P1/P2/P3 issues were found in the PR changes that require an R5 fix.

## R65 50-failures sweep

| Sweep | Result | Notes |
|---|---:|---|
| Silent failures / `catch(e){}` / `.catch(()=>undefined)` | PASS for PR scope; repo raw has pre-existing hits | Changed PR files add no silent failure patterns. Raw repo scan still finds pre-existing `.catch(() => undefined)` in `src/screens/day-one/CoachPairingScreen.tsx:91` and `src/components/coach/ai-budget/AIBudgetTutorialModal.tsx:144,168` that are also present at base SHA. |
| `as any` / `@ts-ignore` / `@ts-nocheck` | PASS for PR scope; repo raw has pre-existing hits | Changed PR files add no executable `as any`, `@ts-ignore`, or `@ts-nocheck`. Raw repo scan still finds pre-existing casts in unrelated files such as `src/screens/share/ShareCardScreen.tsx:172`, `src/screens/coach/AIWorkoutDraftScreen.tsx:65`, and health/test files. |
| “Coming soon” / “TODO: implement” | PASS for runtime/test-title intent; raw comments mention banned phrase defensively | No rendered “Coming soon” gate or `TODO: implement` was found in PR behavior. Changed comments/tests mention “Coming soon” only to assert it is not rendered. |
| Spinner-only empty states | PASS | HK-3a changed screens use skeleton/typed/value-first states; `HealthFitnessScreen` loading/empty/error branches are in [`src/screens/client/wearables/HealthFitnessScreen.tsx:198-260`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/screens/client/wearables/HealthFitnessScreen.tsx#L198-L260). |
| A11y labels stable | PASS | Core controls use stable accessibility roles/labels, e.g. freshness chip label in [`src/screens/client/wearables/components/FreshnessChip.tsx:237-254`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/screens/client/wearables/components/FreshnessChip.tsx#L237-L254), bucket switch tabs in [`src/screens/client/wearables/components/BucketSwitcher.tsx:51-92`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/screens/client/wearables/components/BucketSwitcher.tsx#L51-L92), and provider chips in [`src/screens/client/wearables/components/ProviderOverlapChips.tsx:90-135`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/screens/client/wearables/components/ProviderOverlapChips.tsx#L90-L135). |
| Query invalidation race | PASS | See per-item table. |
| Enum mirror drift vs backend | PASS | Strict equal 29/29 set; no missing/extra values. |
| Clear-pref error path surfaces `isError` with caller `onError` | PASS | Explicit test coverage in [`src/hooks/useWearablePreference.test.tsx:282-309`](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/394b45b81af2666b2a945e953ed07b0f4ac0f3ee/src/hooks/useWearablePreference.test.tsx#L282-L309). |

## CI / local gate status

| Gate | Status | Notes |
|---|---:|---|
| `npm ci` | PASS | Dependencies installed successfully. |
| `npx tsc --noEmit` | PASS | Exit 0 after moving audit artifacts outside repo; log saved at `/tmp/wt-hk3a-mobile-r4-audit-artifacts/current/tsc.log`. |
| `npx eslint .` | FAIL (pre-existing config scope) | Exit 1 due JS CommonJS `require` errors in `metro.config.js` and scripts; allowed alternate `npm run lint` was run and passed. |
| `npm run lint` | PASS | Exit 0 with warnings only; log saved at `/tmp/wt-hk3a-mobile-r4-audit-artifacts/current/npm_run_lint.log`. |
| `npx jest --runInBand` | PASS | 181 suites / 1995 tests passed; Jest reported a post-run open-handle warning but exit 0. |
| `npx expo prebuild --platform ios --clean` | PASS | Exit 0; CocoaPods skipped because host is not macOS. |
| `npx expo prebuild --platform android --clean` | PASS | Exit 0; warning about `expo-system-ui` only. |
| Cleanup | PASS | Ran `rm -rf ios android; git checkout package.json`; final `git status --short` clean. |
| GitHub PR check rollup | PASS | PR #224 has CI check `Typecheck, lint, test` conclusion `SUCCESS` for head SHA `394b45b81af2666b2a945e953ed07b0f4ac0f3ee`. |

## Final verdict

**CLEAN**
