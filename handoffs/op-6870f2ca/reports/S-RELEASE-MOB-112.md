# S-RELEASE-MOB (agent 112) — report

## DEP CHANGE (flagged at once)
- mobile #305 changes package.json + package-lock.json: adds `expo-updates ~56.0.28` (native module) and the
  `update:publish` script. This change is carried from the prior #305 builder (not new in this lane); I re-applied it
  on top of main. Lock delta = 7 new package entries only (expo-updates, expo-eas-client, expo-json-utils,
  expo-manifests, expo-structured-headers, expo-updates-interface, nested arg); every dependency range checked
  against main's lock with semver (all satisfied). Shared deps (/home/user/workspace/deps/mobile) do NOT contain
  expo-updates; no JS imports it, so no jest mock is needed; CI's `npm ci` installs it. I did not install anything.

## 1. mobile #305 (OTA) — status: pushed, retargeted to main
(details appended below)
- PR #305 `feat(release): expo-updates OTA (fingerprint runtime; clinic, production and preview channels)`. Base was `clinic/m2...`; it is now **main**. Head **92c25ec**.
- **Merge.** `147614f` merges main 2c17c24. #304 was squash-merged, so main's version wins everywhere and #305's own delta is re-applied on top. `purchase-policy.sha256` is re-pinned (493550ba…).
- **`17b5a70`, clinic channel and guard:**
  - eas.json `clinic` gets `channel: "clinic"` and `environment: "production"`, and inherits `extends: production`.
  - New `scripts/eas-profile.js` resolves `extends` and merges env.
  - `eas-update-guard.js` reads its channels from eas.json, and `--environment` must equal the profile's environment.
  - Build parity: the publish child gets the profile env, with local EXPO_PUBLIC_* stripped.
  - `eas env:list` checks the values. A value that differs, is masked or duplicated, or a list call that fails, all refuse the publish.
  - The required names from expected-env must be present.
  - Validator rules:
    - the three profiles each have a channel and an environment
    - one profile per channel
    - the hide flag is checked after `extends`
    - `updates.enabled` must be true and `checkAutomatically` must be `ON_LOAD` (C4)
- **Launch behaviour.** `checkAutomatically: ON_LOAD` with `fallbackToCacheTimeout: 0`, so launch never waits on the network. Offline, the app runs the embedded or cached bundle; expo-updates handles fetch errors natively, with no JS call. The procedure is documented in `docs/OTA_UPDATES.md` and the PR body (operator-run).
- **`92c25ec`, CI fix.** Main's `androidHealthConnectConfig.test.js` pinned versionCode 4; #305 bumps it to 5. The test now asserts the switch leaves app.json's value unchanged, and pins 5.
- **Tests.** Before the CI fix: 5 suites 139/139 and fingerprint 2/2. After the fix, `src/config/__tests__`: 104/104. `validate-app-config` OK.
- **CI.** The run at 17b5a70 failed on the versionCode test only (1 suite failed, 414 passed). The re-run at 92c25ec is pending at the time of writing; see the final section.
- **Prior findings.** B1 closed (#304 on main). C1: #307 is on main. C2: device checks remain a hard gate. C3: documented. C4: fixed.

## 2. Sentry native init — PR #330 (new), head **4c61d91**
- `feat(sentry): native crash capture before JS loads (iOS/Android), no PII`, branch `agent/release/sentry-native-init`. **No dependency change.**
- **Why a custom plugin.** Expo SDK 56 pins @sentry/react-native ~7.11.0, but `useNativeInit` needs SDK 8. So the config plugin `plugins/withSentryNativeInit.js` starts the native SDKs that 7.11 already bundles:
  - iOS: `SentrySDK.start` is the first statement in didFinishLaunching.
  - Android: `SentryAndroid.init` runs right after `super.onCreate()`, before `loadReactNative`.
- **Config.** The DSN comes from EXPO_PUBLIC_SENTRY_DSN, else `extra.sentryDsn`; with neither, nothing is added. Release and environment match the JS `buildReleaseId`. An invalid DSN or a missing anchor fails prebuild. Kill switch: `TGP_SENTRY_NATIVE_INIT=0`.
- **No PII.** sendDefaultPii, screenshots, view hierarchy, network breadcrumbs, failed-request capture and native tracing are all off, in both native and JS. `setSentryUser` now sends the id only, so the email is dropped.
- **Tests.** 23/23: plugin 18 against the real SDK 56 templates, privacy 2, useCurrentUser 3. expectedEnv and validateAppConfig: 69/69. eslint clean.
- **CI.** Round 0 had all checks green except CodeQL (2 high, js/incomplete-sanitization: hand-escaped RegExp). Round 1 (`4c61d91`) fixes it with a literal line comparison. Re-run pending.

## 3. Pre-build release-env check — PR #333 (new), head **abfc5d1**
- `feat(release): pre-build release-env check per EAS profile (clinic, production, preview)`, branch `agent/release/release-env-check`.
- **package.json change: scripts only.** Adds `eas-build-pre-install` and `check:release-env`. No dependency change and no lock change.
- **What it runs.** `check-expected-env.js --release-env --profile <p>`, or `--eas-hook`, which takes the profile from EAS_BUILD_PROFILE. Hook behaviour:
  - It runs before npm install and needs Node built-ins only.
  - `development` is skipped.
  - An unset profile fails closed.
- **Clinic values it checks.** No value is ever printed.
  - Must be set and not placeholders: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_), EXPO_PUBLIC_SENTRY_DSN.
  - Must reach the build unchanged from eas.json clinic env:
    - EXPO_PUBLIC_FF_CLIENT_TUTORIAL / COACH_BRIEF / COMMUNITY_COHORTS / COMMUNITY_DM / COMMUNITY_HALL / COMMUNITY_TAB / CONSULTATION_ONBOARDING / IOS_HIDE_NON_P2P_PURCHASES
    - EXPO_PUBLIC_NOTIFICATIONS_MOCK, EXPO_PUBLIC_USE_MOCK_COMMAND_CENTER, TGP_ANDROID_HEALTH_CONNECT
  - URLs must be https on a real host. The Supabase key must be an anon JWT or sb_publishable_; service_role and sb_secret_ fail.
- **Profiles.** `production` uses the same set. `preview` checks the 4 required names and allows a Stripe test key.
- **Tests.** releaseEnvProfile + expectedEnv + validateAppConfig: 99/99. **CI: all green.**

## Open risks
- None of the three PRs has been through an EAS build or a device run (not allowed in this lane). Needed:
  - #305 and #330 need one operator preview build. For #330 this is the proof that `import Sentry` compiles in the app target, and it should also force a pre-JS crash.
- #330 and #305 both change the native fingerprint, so a new binary is needed. Binaries already built (including APK 14a58449, which must never ship) cannot receive these by OTA.
- #333 makes every preview, production and clinic build fail until the EAS env has real values. Production must also have a Sentry DSN and a pk_live_ key.
- Builders never audit their own work, so all three need an independent audit.

## Operator decisions (recommended default)
1. **#333, Stripe live on clinic and production.** Default: **keep pk_live_ required**. Before merging, run `eas env:exec production 'npm run check:release-env -- --profile clinic'`.
2. **Merge order.** Default: **#333, then #330, then #305**. Any order is conflict-free, since `scripts/eas-profile.js` is byte-identical in #305 and #333. Build after all three land, so the clinic binary has OTA and native Sentry, and the gate checks it.
3. **#330 interim plugin.** Default: **keep it** until an Expo SDK that supports @sentry/react-native 8 lands, then switch to `useNativeInit`.

## Final CI (2026-10-02, all required checks)
- #305 @92c25ec: Typecheck/lint/test pass, Analyze (js-ts) pass, Analyze (actions) pass, CodeQL pass.
- #330 @4c61d91: all four pass.
- #333 @abfc5d1: all four pass.
- Nothing merged, built, dispatched or sent to production. Worktrees removed.
