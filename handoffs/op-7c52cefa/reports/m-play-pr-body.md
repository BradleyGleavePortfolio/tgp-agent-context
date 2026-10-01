## Tier header

- **Tier:** T2 (M-PLAY assigned tier).
- **Why:** Build-time Android capability removal and truthful runtime availability inside the existing mobile wearables seams.
- **T4 trigger scan:** none in this slice: no new permission grants; no changes to enabled native consent/permission sets, health-data processing/storage/ingest, account isolation, auth, credentials, tenancy, destructive operations or trusted CI gates. OFF disables an unavailable capability; it does not relax a privacy or authorization boundary.
- **T3 trigger scan:** none: no architecture, new dependency, backend contract or foundational primitive; `extra.healthConnectEnabled` is the prescribed build metadata.
- **Bounded T1:** NO — meaningful multi-entry-point product/build behavior, rather than an isolated implementation task.
- **Builder-owner:** M-PLAY for operator 109; assigned Sol builder lane. Builder acceptance checks only, not an independent audit.
- **Acceptance evidence:** OFF/ON Expo introspection, config transform tests, missing-native-module runtime tests, Android sheet/hook tests, preserved ON and iOS tests, tsc, changed-file ESLint, Prettier and app-config validator.
- **Promotion triggers:** changing enabled native permission evaluation, consent/identity or health-data contracts; introducing shared architecture/backend changes; modifying trusted gates. One independent T2 adversarial audit is still required.

Base `c4963f87159d36dc50ecc90a8461262220956f75`; head `d8edf8e167a8a706b2b97618d184f66a7d355a73`.

## Change

- Add `app.config.js` reading `app.json`, default OFF. Only `TGP_ANDROID_HEALTH_CONNECT=1` opts in.
- OFF removes all `android.permission.health.*` and Samsung additional-health-data permissions from requests, blocks those names against manifest merger, removes the HC plugin, and publishes `extra.healthConnectEnabled=false`.
- `preview` and `production` explicitly set `TGP_ANDROID_HEALTH_CONNECT=0`; `clinic` inherits production.
- Android HC/Samsung sheets show “Health Connect is coming to Android in an update. You can still log your training and meals in the app.” They offer Close, not a permission CTA.
- Native connect, read, permission and sync seams fail closed before evaluating HC when metadata is absent/false. Typed failure code: `health_connect_build_disabled`; the connect flow returns `disabled`. An eager HC import was replaced with a guarded lazy require.
- iOS settings/HealthKit plugin, Android package `com.growthproject.app` and versionCode `4` are unchanged. No package/lockfile edits, prebuild, EAS build, merge, production change or workflow dispatch.

## Compatibility

[Signup #306](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306) is untouched: read-only `git merge-tree --write-tree` against its observed head `33eec6bcaa4951bd672b651faae61b80bb5f3153` exits 0 with no conflicts. No checkout, branch or PR was merged.

[Wearables #317](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317) is untouched and is still a prerequisite to enabling HC. ON preserves its app.json additions; tests inject its `READ_RESTING_HEART_RATE` and delegate plugin in string/tuple-capable config. OFF also removes `./plugins/withHealthConnectPermissionDelegate`. When reconciling overlapping wearables files, retain the runtime guards and lazy require alongside #317's existing consent, isolation and history-import fixes. The current base's enabled path is not being claimed as ready for release.

Later activation requires an approved Play declaration and a **new Android binary**, with the desired EAS profile explicitly set to `1`; never enable HC via an ON OTA update to an OFF binary.

## Expo introspection evidence

Both commands ran through `/home/user/workspace/ops/heavy.sh`, exit 0:

```sh
TGP_ANDROID_HEALTH_CONNECT=0 EXPO_NO_DOTENV=1 npx expo config --type introspect --json
TGP_ANDROID_HEALTH_CONNECT=1 EXPO_NO_DOTENV=1 npx expo config --type introspect --json
```

| Result | OFF | ON |
|---|---|---|
| `extra.healthConnectEnabled` | false | true |
| Active `android.permission.health.*` declarations | 0 | 17 |
| Active Samsung additional-health-data declaration | 0 | 1 |
| HC/Samsung manifest `tools:node="remove"` entries | 18 | 0 |
| `react-native-health-connect` plugin | absent | present |
| package / versionCode | `com.growthproject.app` / `4` | same |

ON active / OFF blocked Android health suffixes:

```text
READ_STEPS
READ_HEART_RATE
READ_SLEEP
READ_ACTIVE_CALORIES_BURNED
READ_TOTAL_CALORIES_BURNED
READ_DISTANCE
READ_EXERCISE
READ_OXYGEN_SATURATION
READ_RESPIRATORY_RATE
READ_HEART_RATE_VARIABILITY
READ_BODY_TEMPERATURE
READ_WEIGHT
READ_BODY_FAT
READ_VO2_MAX
READ_BASAL_BODY_TEMPERATURE
READ_BLOOD_PRESSURE
READ_HEALTH_DATA_IN_BACKGROUND
```

Also ON active / OFF blocked:
`com.samsung.android.hardware.sensormanager.permission.READ_ADDITIONAL_HEALTH_DATA`.

The brief estimates 18 Android health permissions, but this main base has **17**; #317 adds the 18th (`READ_RESTING_HEART_RATE`), which the transform also removes/blocks in OFF mode.

OFF retains unrelated internet, overlay, vibration, storage, biometrics and activity-recognition declarations. Both iOS config and every introspected iOS mod result are deep-equal OFF vs ON.

Raw output SHA-256:
- OFF: `0b869a36c6f0e060b2fd0aa6a48697ded7062c83192d14651ab9dfa5531fff6b`
- ON: `ec78d5282d6717c12d07c15ad9b6439a308715563a16d60d6e7aabf8235380e8`

Evidence is config-plugin introspection, **not** a built AAB or installed-device test.

## Tests

All heavy commands serialized through `ops/heavy.sh` with linked shared mobile deps; no install.

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
```

- tsc: exit 0.
- targeted Jest: **11 suites, 109 tests passed**, no skips. `--forceExit` is disclosed because the initial completed run retained async handles; no whole local suite was run.
- changed-file ESLint, including `app.config.js`: exit 0, no warnings.
- Prettier: run on changed files; existing source formatting outside functional edits was retained to minimize wearables merge conflicts.
- `git diff --check`: pass.
- `node scripts/validate-app-config.js`: exit 0; existing pending Play listing URL and signing fingerprint warnings remain.
- CI at `d8edf8e167a8a706b2b97618d184f66a7d355a73`: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/36940319102/job/110630042531), [Analyze (javascript-typescript)](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/36940319174/job/110630042824) and [Analyze (actions)](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/36940319174/job/110630043170) all SUCCESS. Independent audit is pending; GitHub reports MERGEABLE but BEHIND main, so reconcile the current base and refresh exact-head evidence before merge.

## Fix round

No independent findings yet; initial acceptance round:

| Finding/acceptance ID | What changed | Commit | Proof |
|---|---|---|---|
| M-PLAY-CFG | Default-OFF transform, blocked permissions, explicit EAS env | `d8edf8e` | config tests; OFF/ON introspection |
| M-PLAY-RUNTIME | Capability guard, specific message, lazy native import, no dead CTA | `d8edf8e` | throwing-native-module, sheet and hook tests |
| M-PLAY-COMPAT | Preserve ON/iOS; future #317 config; no signup file overlap | `d8edf8e` | preserved-path tests; iOS mod equality; conflict-free #306 merge-tree |
| M-PLAY-LOCAL | Corrected fixture paths/mock assertions and CJS ESLint annotation after initial local failures | `d8edf8e` | final 109 passing tests and clean ESLint |
