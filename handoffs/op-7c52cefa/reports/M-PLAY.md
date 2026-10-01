# M-PLAY builder handoff

## Scope and grading (2026-10-01)

- Builder: M-PLAY for operator 109; isolated branch `op109/m-play-android-no-health-connect`, base `c4963f87159d36dc50ecc90a8461262220956f75`.
- Tier: T2, as assigned. Availability-only build switch removes the Android capability for the closed test; the enabled permission sets, native consent flow, health data processing/storage, account isolation, backend contracts and CI gates remain unchanged.
- T4 trigger scan: no new permission grants or changes to consent, PII handling, auth, tenancy, credentials, destructive operations or trusted gates. Removing the Android declarations and gating an unavailable feature is the bounded owner-approved outcome, not a change to the enabled health-data contract.
- T3 trigger scan: no new architecture or cross-repository contracts; `extra.healthConnectEnabled` is the prescribed build metadata.
- Promotion triggers: changes to enabled native permission evaluation, health-data contracts, consent/identity, native delegate implementation, CI gates or shared architecture require escalation.
- Do not modify signup PR [#306](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306) or wearables PR [#317](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317).
- Compatibility plan: preserve `app.json` and all ON inputs; filter #317's Android delegate plugin only in OFF configs. Keep runtime checks at the current native seams, leaving #317's import/ingestion implementation untouched.
- No EAS build, prebuild, merge, deployment or dependency install authorized.

## Completed implementation / partial handoff

- PR: [mobile #323](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/323), against `main`, open and not merged.
- Head: `d8edf8e167a8a706b2b97618d184f66a7d355a73`; branch `op109/m-play-android-no-health-connect`.
- T2 remains the assigned grade; one independent adversarial audit is still required. Builder did not post an audit verdict.
- Config, explicit EAS OFF values, runtime native guards, specific update message and no permission CTA implemented; `app.json`, iOS, package, versionCode, package/lockfile and CI gates unchanged. See [#323 acceptance evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/323).
- OFF introspection: zero active Android health/Samsung health declarations, 18 manifest-merger removal entries, HC plugin absent. ON: 17 active `android.permission.health.*` plus Samsung's permission, plugin present. Base actually has 17 Android health names, not the brief's estimate of 18; #317 adds the 18th and the config tests cover it. Both iOS config and every introspected iOS mod are deep-equal. These are not AAB/device results. See [#323 introspection evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/323).
- Read-only `git merge-tree --write-tree` against [#306](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306) observed head `33eec6bcaa4951bd672b651faae61b80bb5f3153`: exit 0, no conflicts. No branch was merged.
- [#317](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317) remains untouched. Later overlap reconciliation must preserve the lazy require and runtime guards; OFF filters its delegate plugin and ON retains its permissions/plugins. Do not activate via OTA on an OFF binary.

### Exact commands and results

All heavy commands through `/home/user/workspace/ops/heavy.sh`, shared mobile dependencies linked using `ops/link_deps.sh`, no install.

```sh
npx tsc --noEmit -p tsconfig.json
npx jest --runInBand --forceExit \
  src/config/__tests__/androidHealthConnectConfig.test.js \
  src/services/health/__tests__/healthConnectBuildGuard.test.ts \
  src/services/health/__tests__/onDeviceConnect.test.ts \
  src/services/health/healthConnect/__tests__/healthConnectClient.test.ts \
  src/services/health/healthConnect/__tests__/healthConnectSyncService.test.ts \
  src/services/health/healthConnect/__tests__/healthConnectIosNoop.test.ts \
  src/services/health/samsungHealth/__tests__/samsungHealthClient.test.ts \
  src/services/health/samsungHealth/__tests__/samsungHealthSyncService.test.ts \
  src/hooks/useHealthConnectSync.test.tsx \
  src/screens/client/wearables/__tests__/ConnectProviderSheet.test.tsx \
  src/screens/client/wearables/__tests__/ConnectProviderSheet.buildSwitch.test.tsx
TGP_ANDROID_HEALTH_CONNECT=0 EXPO_NO_DOTENV=1 npx expo config --type introspect --json
TGP_ANDROID_HEALTH_CONNECT=1 EXPO_NO_DOTENV=1 npx expo config --type introspect --json
node scripts/validate-app-config.js
git diff --check
```

Final: tsc 0; targeted Jest 11 suites / 109 tests passed, no skips; introspections 0/0; changed-file ESLint 0 with no warnings; Prettier run on changed files (test additions range-formatted to preserve existing unrelated formatting); validator 0 with existing null Play URL/signing fingerprint warnings; diff-check pass. [#323](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/323).

The first local test run had fixture-path and mock-assertion mistakes, subsequently corrected; the first lint run needed an explicit CJS require annotation. Its completed Jest run retained asynchronous handles and the tool timed out; final target run explicitly uses `--forceExit`, as disclosed in the PR, rather than claiming a clean natural exit. No full local suite was run.

### Preserved evidence files

Directory: `/home/user/workspace/ops/reports/`.

- `m-play-introspect-off.json`, `m-play-introspect-on.json` — full raw outputs, also `.stderr.log` files (empty).
- `m-play-introspect-summary.json` — machine-readable active/removal names and iOS equality assertion.
- `m-play-jest-final.log`, `m-play-tsc-final.log`, `m-play-eslint-final.log`, `m-play-validate-config.log`.
- `m-play-format.log`, `m-play-format-r2.log`, `m-play-signup-merge-tree.log`.
- `m-play-jest.log`, `m-play-jest-r2.log`, `m-play-eslint.log`, `m-play-eslint-r2.log` — retained initial and intermediate rounds.
- `m-play-pr-body.md` — published PR description with tier scans, acceptance/fix-round table and raw-output hashes.

### Final CI at exact head (2026-10-01 16:23 PDT)

- Head remains `d8edf8e167a8a706b2b97618d184f66a7d355a73`.
- [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/36940319102/job/110630042531): SUCCESS (2m40s).
- [Analyze (javascript-typescript)](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/36940319174/job/110630042824): SUCCESS (1m13s).
- [Analyze (actions)](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/36940319174/job/110630043170): SUCCESS (35s).
- GitHub reports MERGEABLE / BEHIND main; independent audit pending. Do not treat green CI as merge/release authorization. Reconcile the current base and refresh exact-head evidence before merge. [#323](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/323).
- Additional preserved files: `m-play-ci-initial.json`, `m-play-ci-final.json`, `m-play-ci-watch.log`.

Recommended operator next step: independent T2 audit of #323, then current-main integration/CI reconciliation. Keep production/preview OFF. AAB final-manifest and installed-device checks remain release-operator work; no build was started.

Own `/home/user/workspace/wt/m-play` worktree removed after preserving the final patch; shared dependencies, other worktrees, branch/commit and all report evidence remain. Final PR body and head were read back from [#323](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/323).

Also saved `m-play-final.patch` and `m-play-pr-final.json` before completion. No merge or EAS build was started.
