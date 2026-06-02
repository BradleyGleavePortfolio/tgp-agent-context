# HK-3b Mobile R1 Code Audit — GPT-5.5

## Scope / Pin

- Repo: `BradleyGleavePortfolio/growth-project-mobile`
- PR: #223 — `hk/PR-HK-3b-recovery-bucket`
- Pinned HEAD SHA: `8676a64103c9c2f015dffd3cf996f82beb315625`
- Base SHA: `985349d2e23dab1ad13b67d97dbc2584b8982ffa`
- GitHub PR metadata: saved in `/home/user/workspace/hk3b_pr223_metadata.json`; metadata confirms PR head/base match the required SHAs.
- Audit worktree: `/tmp/wt-hk3b-audit` at detached pinned HEAD.

## HK-3a Integration Verification

| Check | Result | Evidence / Notes |
|---|---:|---|
| Base contains HK-3a and PR is rebased on it | PASS | `git merge-base HEAD 985349d2e23dab1ad13b67d97dbc2584b8982ffa` returned the base SHA. |
| Sleep enum keys resolve (`SLEEP_DURATION_MIN`, `SLEEP_ONSET_ISO`, `SLEEP_WAKE_ISO`) | PASS | Keys exist in `src/api/wearablesSamplesApi.ts:79,86,87`; HK-3b uses them in `src/screens/client/wearables/recoveryData.ts:133,201,202`. No TS errors cite missing enum keys. |
| HealthFitness tab regression | PASS with note | `WearablesShell` still imports/mounts `HealthFitnessScreen` at `src/screens/client/wearables/WearablesShell.tsx:52,139-142`; coach tab still mounts `HealthFitnessTab` at `src/screens/coach/ClientDetailScreen.tsx:493-495`. No HK-3b gate failure points at HealthFitness files. |
| WearablesShell / client navigation to Recovery | FAIL | `WearablesShell` does **not** import/mount `SleepRecoveryScreen`; Recovery renders the old `RecoveryConnectSurface` placeholder at `src/screens/client/wearables/WearablesShell.tsx:139-144`. Client users cannot reach the HK-3b recovery UI, Phantom banner, cards, empty/error states, or More section. |
| Coach navigation to Recovery | PASS with P3 ordering note | `TabKey` includes `sleepRecovery` at `src/screens/coach/client-detail/types.ts:45-55`; `ClientDetailScreen` renders `SleepRecoveryTab` at `src/screens/coach/ClientDetailScreen.tsx:547-549`. However the tab array comment says it sits after Fitness, but actual order places it after Weekly (`src/screens/coach/ClientDetailScreen.tsx:270-280`). |
| `useWearableSamples` use | PASS | Client screen calls bucket `SLEEP_RECOVERY`, 7d window, day granularity, preferredOnly at `src/screens/client/wearables/SleepRecoveryScreen.tsx:94-100`; coach tab includes `clientId` at `src/screens/coach/client-detail/SleepRecoveryTab.tsx:68-75`. |
| `useWearablePreference` use | N/A for HK-3b | No HK-3b changed file uses `useWearablePreference`; existing provider preference UI remains in `ProviderOverlapChips`. |
| Mobile Design Intel alignment | PARTIAL | Uses 4/8/12/16-ish spacing and 44pt-plus CTAs in empty/error states; Phantom/CALM copy aligns with the anxiety-audit/CALM guidance in `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md:90-107`. Contrast/touch-target cannot be fully verified statically; one P1 wiring issue prevents users from seeing the client design at all. |

## Findings

### P1 — CI is red: 41 TypeScript errors at pinned HEAD

- Files / lines:
  - `src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx:99,100,118,133`
  - `src/screens/client/wearables/__tests__/recoveryData.test.ts:40,41,48,60,69,70,71,72,86,87,101,111,112,113,114,123,136,137,148,168,175,199,211` plus duplicate same-line sample-array positions: total 29 in this file
  - `src/screens/client/wearables/cards/HrvTrendCard.tsx:71,75`
  - `src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx:107,114`
- Evidence: `/home/user/workspace/hk3b_tsc_output.txt`; counted 41 `error TS` lines.
- Fix pointer: type test fixture helpers to return `WearableSamplesResponse['series'][number]['samples'][number]` or `SampleDatum` with `provider: 'OURA'` preserved as the provider union; do not use `as any`. For `HrvTrendCard`, map `TrendPoint` to `GlowChartPoint` including required `label`, and type `formatValue` as `(v: number) => string`.

### P1 — Client Recovery bucket is not wired into `WearablesShell`

- File / lines: `src/screens/client/wearables/WearablesShell.tsx:52,139-144`.
- Issue: Recovery bucket still renders `RecoveryConnectSurface`; `SleepRecoveryScreen` is never imported or mounted, so the primary HK-3b client feature is unreachable.
- Fix pointer: import `SleepRecoveryScreen` and mount it for `bucket === 'SLEEP_RECOVERY'`, passing/deriving the route bucket param as needed; keep the connect/empty surface inside `SleepRecoveryScreen`.

### P1 — Jest gate fails because `FreshnessChip` requires a QueryClient in SleepRecoveryScreen tests

- File / lines: `src/screens/client/wearables/components/FreshnessChip.tsx:214-221`, `src/screens/client/wearables/SleepRecoveryScreen.tsx:181-185`, test failures at `src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx:108,126,141`.
- Evidence: `/home/user/workspace/hk3b_jest_output.txt`; 1 suite failed, 3 tests failed, all with `No QueryClient set, use QueryClientProvider to set one`.
- Fix pointer: either wrap affected tests in a `QueryClientProvider`/mock `useWearableConnections`, or split `FreshnessChip` into a pure injected component and hook-backed wrapper. Note: the current optional `connections` prop does not prevent the hook call because `useWearableConnections()` is always invoked.

### P2 — Sleep consistency has circular-time bug across midnight

- File / lines: `src/screens/client/wearables/recoveryData.ts:200-218`.
- Issue: `spread()` uses linear `max - min` on minutes-of-day. Bedtimes around midnight (e.g., 23:50 and 00:10) will appear ~1420 minutes apart instead of 20 minutes.
- Fix pointer: compute circular spread on a 1440-minute clock: sort values, find largest gap, return `1440 - largestGap` for onset/wake minutes.

### P2 — Query retry promises are intentionally floated but not documented/tested as non-throwing

- File / lines: `src/screens/client/wearables/SleepRecoveryScreen.tsx:106-111`, `src/screens/coach/client-detail/SleepRecoveryTab.tsx:77-80`.
- Issue: `void query.refetch()` relies on TanStack Query default non-throwing refetch behavior. If options change to throw, this could become an unhandled rejection.
- Fix pointer: guard with `void query.refetch().catch((error: unknown) => logger.warn(...))` or keep default and add a code comment/test asserting `throwOnError` is not enabled. Do not swallow silently.

### P3 — Banned-wording risk in test title/comment

- File / lines: `src/screens/client/wearables/__tests__/CalmSlowReveal.test.tsx:47`, `src/screens/client/wearables/components/CalmSlowReveal.tsx:54-57`, `src/screens/client/wearables/empty/SleepRecoveryErrorState.tsx:3`.
- Issue: sweep found `silent` in a test title and comments. The exact banned phrase `fails silently` is absent, but the handoff says test titles must not contain banned phrases; removing `silent` from titles reduces policy ambiguity.
- Fix pointer: rename the test to `falls back to the reduced (instant) path if the query rejects with visible content` and move failure-mode policy language out of test names.

### P3 — Coach tab ordering mismatch

- File / lines: `src/screens/coach/ClientDetailScreen.tsx:270-280`.
- Issue: comment says Recovery sits after HK-3a Fitness, but actual tab order places Recovery after Weekly.
- Fix pointer: move `{ key: 'sleepRecovery', ... }` directly after `{ key: 'healthFitness', ... }` or update the comment/spec if intentional.

## R65 50-Failures Sweep Results

| Category | Result | Notes |
|---|---:|---|
| Silent failures / empty catches | PASS with P3 wording note | No `catch(e){}` or `.catch(() => undefined)` in HK-3b changed files. CalmSlowReveal handles reduce-motion query rejection by making content visible. |
| `as any`, `@ts-ignore`, `@ts-expect-error` | PASS | No matches in HK-3b changed files. |
| Type safety / fixture drift | FAIL P1 | 41 TS errors; fixture providers widened to `string`; chart points missing `label`; implicit `any`. |
| Coming soon / TODO implement | PASS | No matches. `RecoveryConnectSurface` says not coming soon, but it is still a functional wiring failure because it hides the real HK-3b screen. |
| Spinner-only empty/loading/error states | PASS | `SleepRecoveryEmptyState` and `SleepRecoveryErrorState` are content/CTA surfaces; no `ActivityIndicator` in HK-3b changed files. Loading-with-no-data uses skeleton empty state. |
| Phantom CALM banner | PASS when rendered | `PhantomCalmBanner` structurally renders reassurance before deficit and VoiceOver label in same order (`PhantomCalmBanner.tsx:43-58`). Client shell wiring prevents users from reaching it: see P1. |
| A11y labels / touch target | PASS with static limits | CTAs have accessibility labels; FreshnessChip has label and 12pt hitSlop. Some non-button visual cards lack image labels (ring hero), but no hard blocker found. |
| TestIDs | PASS | Major states/cards have testIDs. |
| Race conditions / unhandled promise rejections | P2 | Floated refetch promises should be made robust/documented. Animations clean up with stop/cancel flags. |
| Off-by-one / date-time | P2 | Sleep consistency linear spread mishandles midnight wrap. |
| Data handling in Sr/Hrv/Respiration/SleepConsistency/SleepStages | FAIL P1/P2 | HrvTrendCard chart type is wrong; SleepConsistency has circular-time bug. Other cards handle nulls with visible copy/placeholders. |
| Coach SleepRecoveryTab | PASS with notes | 403 fallback, non-403 retry, coach-only overlays present. No explicit loading branch, but null data renders non-spinner placeholders. |

## Gate Results

| Gate | Result | Output saved |
|---|---:|---|
| `npx tsc --noEmit` | FAIL (exit 2) | `/home/user/workspace/hk3b_tsc_output.txt` |
| `npm run lint` | PASS (exit 0, 78 warnings) | `/home/user/workspace/hk3b_lint_output.txt` |
| `npx jest --runInBand` | FAIL (exit 1) | `/home/user/workspace/hk3b_jest_output.txt` |
| `npx expo prebuild --platform ios --clean` | PASS (exit 0; CocoaPods skipped on non-macOS) | `/home/user/workspace/hk3b_prebuild_ios_output.txt` |
| `npx expo prebuild --platform android --clean` | PASS (exit 0) | `/home/user/workspace/hk3b_prebuild_android_output.txt` |
| Cleanup | PASS | Removed `ios/ android/`; restored package files; worktree status only shows audit `node_modules` symlink. |

## Final Verdict

**NEEDS_R2_FIX**

Rationale: CI is not clean (`tsc` and `jest` fail), the client Recovery bucket is not wired into the shell, and at least one data-calculation edge case remains in sleep consistency.
