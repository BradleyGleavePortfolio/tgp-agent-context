# PR-HK-2.b — Android Health Connect on-device connector — R1 audit

**Verdict:** NOT CLEAN — one P1 (broken iOS graceful no-op under the project's enabled new architecture). Everything else passes; all four mobile gates are green and the write-set/commit hygiene are clean.

**Repo:** `growth-project-mobile`
**PR:** [#220](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/220)
**Audited head SHA:** `d6f5bdea5d44feb18c1c29c797921ec30a017c4b` (`d6f5bde`)
**Branch:** `hk/PR-HK-2.b-healthconnect`
**Base:** `main` @ `90c033df` (PR-HK-CFG, #218)
**Build report reviewed:** `HK_PR-HK-2b-healthconnect_BUILD.md` @ `e4b7f94`
**Auditor:** R1 (auditor ≠ builder; R55 SHA-pinned, no rebase/pull)

---

## Scope / write-set verification

PASS. `git diff origin/main...d6f5bde --name-only` is exactly **13 files / +2071 / −0**, all confined to the documented write-set (`src/services/health/healthConnect/` + the one allowed additive hook):

```text
src/hooks/useHealthConnectSync.ts
src/hooks/useHealthConnectSync.test.tsx
src/services/health/healthConnect/healthConnectClient.ts
src/services/health/healthConnect/healthConnectNormalizer.ts
src/services/health/healthConnect/healthConnectSyncService.ts
src/services/health/healthConnect/healthConnectIngestApi.ts
src/services/health/healthConnect/types.ts
src/services/health/healthConnect/errors.ts
src/services/health/healthConnect/index.ts
src/services/health/healthConnect/__tests__/healthConnectClient.test.ts
src/services/health/healthConnect/__tests__/healthConnectNormalizer.test.ts
src/services/health/healthConnect/__tests__/healthConnectSyncService.test.ts
src/services/health/healthConnect/__tests__/healthConnectIngestApi.test.ts
```

No mutex violations: `App.tsx`, `RootNavigator.tsx`, theme tokens, `app.json`, `package.json`, and other connectors' folders are **untouched**. The Health Connect `android.permission.health.READ_*` strings live in `app.json` and were landed by PR-HK-CFG (#218, the base) — correctly **out of this PR's write-set**. The build report's stat (13 files / +2068) matches within a 3-line rounding difference (actual +2071); not material.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| 1 — Types | `npx tsc --noEmit` | **PASS, exit 0** (`PR-HK-2b_R1_tsc.log`) |
| 2 — Lint | `npx eslint src/services/health/healthConnect/ src/hooks/useHealthConnectSync.ts src/hooks/useHealthConnectSync.test.tsx` | **PASS, exit 0**, zero warnings (`PR-HK-2b_R1_eslint.log`) |
| 3 — Tests (full suite, regression) | `npx jest --runInBand --ci` | **1 failed / 154 passed suites; 1739/1740 tests pass.** The single failure is **out-of-scope and pre-existing** (see note). **All 5 HK-2.b suites PASS (51 HC tests).** (`PR-HK-2b_R1_jest.log`) |
| 4 — Native prebuild (Android) | `npx expo prebuild --clean --no-install --platform android` | **PASS, exit 0** — `android/` generated; AndroidManifest emits all 17 `android.permission.health.READ_*` permissions (`PR-HK-2b_R1_prebuild_android.log`) |

**Gate 3 note (prior-auditor ENOENT refuted):** The earlier auditor reported the HK-2.b test files missing (ENOENT). At the pinned SHA `d6f5bde` **all five test files exist and pass** — `healthConnectClient.test.ts`, `healthConnectNormalizer.test.ts`, `healthConnectSyncService.test.ts`, `healthConnectIngestApi.test.ts`, `useHealthConnectSync.test.tsx`. The prior ENOENT was a wrong-checkout artifact (a shared clone was checked out to a different SHA when that gate ran), not a real defect. This auditor ran from an isolated git worktree pinned to `d6f5bde` to avoid the same race.

**Gate 3 out-of-scope failure:** `src/__tests__/quietLuxuryDoctrine.test.ts` fails because a `TODO(M4)` comment exists in `src/screens/coach/payments/contents/ContentAttachForm.tsx`. That file is **not in this PR's write-set**, the TODO is **present on base `main`** (verified via `git show origin/main:...`), and `git diff origin/main...HEAD` shows zero changes to it. This is a pre-existing repo-wide doctrine-lint failure unrelated to PR #220 — flagged here for the repo owner but **not attributable to this PR** and **not** counted against this verdict.

## Checklist assessment (mobile-specific + 5 never-rules)

| Area | Status | Notes |
| --- | --- | --- |
| Write-set mutex | PASS | 13 files, all in the documented connector folder + allowed hook. |
| Permissions UX — contextual (R28) | PASS | `requestPermission()` is called **only inside `syncHealthConnect()`**, which runs only on an explicit `sync()` mutation. The hook has **no `useEffect`/auto-trigger** — the prompt cannot fire on app launch or tab entry. |
| Permission strings (AndroidManifest) | PASS | All 17 `health.READ_*` strings are user-meaningful and per-record-type (declared in base PR-HK-CFG; verified emitted into the generated manifest). No generic placeholder strings. |
| Token storage / secrets on device | PASS (N/A) | On-device connector holds **no OAuth token** (correct per Agent 2 §3.2). The only persisted value is a non-secret `lastSyncAt` watermark in `secureStorage` (expo-secure-store). No `AsyncStorage` for secrets, no plaintext. |
| PII in logs | PASS | `logger` is suppressed in production and logs **counts only** (`normalizedCount`, `inserted`, `skipped`, `grantedRecordTypes.length`). No `console.log`, no user_id/email/token/raw-response logging. |
| Mascot ban | PASS | The connector + hook contain **no UI copy at all** — no mascot, cartoon, emoji, or playful strings. |
| Medicalization ban | PASS | No "apnea/arrhythmia/insomnia/depression/disorder/diagnosis" anywhere; no user-facing health phrasing in the diff. |
| Motion specs (amber/indigo, 280/480ms) | N/A | No UI/animation in this PR (data layer only). |
| Confidence ladder | N/A | No AI-derived numbers rendered in this PR. |
| Auto-send AI ban | PASS (N/A) | No AI text generated/sent. |
| Tab cap (4) | PASS | No navigator/tab changes. |
| iOS graceful no-op (Android-only connector) | **FAIL (P1)** | See Finding 1: under the project's enabled new architecture (`newArchEnabled=true`), a static import of the connector from any iOS-reachable module throws at module-evaluation time. Not a launch crash **today** (connector is unwired), so latent. |
| On-device push semantics (no server token) | PASS | Device reads via native SDK → normalizes device-side → POSTs `NormalizedSample[]` to `/v1/wearables/samples/ingest` via the shared axios instance. No second http client (#40/#41). No token. Idempotent via backend `dedup_key` with a 5-min overlap re-read. |
| Normalizer mapping (15 record types, units, buckets) | PASS | All 15 types map to canonical metrics with correct unit + bucket; defensive parsing drops malformed records (no speculative ingestion, #42); body-temp converted to deviation-from-36.5°C per §3.1. |
| a11y labels | N/A | No UI in this PR. |
| Theme tokens (no hard-coded hex) | PASS | No colors/styles in this PR; grep for `#hex` returns none. |
| Tests / coverage | PASS | 51 HC tests with concrete value assertions: platform guards (3 platforms), init success/fail, permission read/request, readRecords time-range wiring, per-type read-failure isolation, one test per record type, sleep-stage + efficiency math, drop-on-missing, fan-out, windowing math (first-sync vs incremental overlap), normalize→POST→persist, **no-persist-on-POST-failure**, partial-grant, hook supported/iOS-reject. |
| Commit hygiene | PASS | 3 commits, all `Dynasia G <dynasia@trygrowthproject.com>` (author and committer), all bodies empty, no trailers/co-authors. |
| **Never-rule 1 — no medicalization** | PASS | (above) |
| **Never-rule 2 — no auto-send AI** | PASS (N/A) | No AI in this PR. |
| **Never-rule 3 — coach approves every draft** | PASS (N/A) | No drafts in this PR. |
| **Never-rule 4 — no mascot** | PASS | (above) |
| **Never-rule 5 — RLS forced** | PASS (N/A) | RLS is a backend concern (PR-HK-0); on-device POST authenticates as the client and the backend ingestion lane enforces it. No DB access in this mobile PR. |

## Findings

### 1. HIGH (P1) — Health Connect connector does not gracefully no-op on iOS under the project's enabled new architecture (broken Android-only degradation; latent crash)

**Code:** `src/services/health/healthConnect/healthConnectClient.ts:18-24`

```ts
import { Platform } from 'react-native';
import {
  initialize as hcInitialize,
  getGrantedPermissions as hcGetGrantedPermissions,
  requestPermission as hcRequestPermission,
  readRecords as hcReadRecords,
} from 'react-native-health-connect';
```

The connector's own platform guards (`assertSupported()` → `HealthConnectUnsupportedError`) are correct and run inside every public function. **But they run too late** for the iOS-degradation guarantee, because the native-module resolution happens at the library's **module-evaluation time**, before any connector guard executes. `react-native-health-connect@3.5.3` resolves the native module like this (`node_modules/react-native-health-connect/lib/commonjs/index.js:75-85`):

```js
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const HealthConnectModule = Platform.select({
  android: isTurboModuleEnabled ? require('./NativeHealthConnect').default : NativeModules.HealthConnect,
  ios: moduleProxy(PLATFORM_NOT_SUPPORTED_ERROR),
  default: moduleProxy(PLATFORM_NOT_SUPPORTED_ERROR),
});
```

JavaScript evaluates **all** object-literal values before `Platform.select` picks one, so the `android` value — `require('./NativeHealthConnect').default`, which calls `TurboModuleRegistry.getEnforcing('HealthConnect')` — is evaluated on **every** platform when `isTurboModuleEnabled` is true. `getEnforcing` **throws** on iOS (native module absent).

The project ships the **new architecture**: the prebuilt `android/gradle.properties:38` has `newArchEnabled=true`, and the stack is Expo SDK ~56 / react-native 0.85.3 (new arch is the default), so `global.__turboModuleProxy` is present at runtime. I reproduced the behavior in a Node harness simulating both architectures:
- **New arch (project's config):** importing `react-native-health-connect` on iOS **throws** `getEnforcing('HealthConnect')` at import time.
- **Old arch:** importing is safe; the proxy only throws lazily when a method is *called* (which the connector's `Platform.OS === 'android'` guard already prevents).

**Impact:** The doctrine requires Health Connect to gracefully no-op on iOS. Under the project's actual (new-arch) configuration, the connector does **not** degrade gracefully: the moment any iOS-reachable module statically imports the connector barrel or the `useHealthConnectSync` hook, the iOS JS bundle throws at module-evaluation time — a hard crash that the connector's in-function guards cannot prevent. **This is currently latent**, not a launch crash at this SHA, because the connector/hook are **not yet imported by any screen or navigator** (verified: no non-test source imports `health/healthConnect` or `useHealthConnectSync`). It becomes a real iOS crash as soon as a Wearables connection screen wires the hook in (the next integration PR), even if that screen correctly gates the affordance on `supported`.

**Context (not exoneration):** the sibling Apple HealthKit connector (PR-HK-2.a) uses the same static-import + in-function-guard pattern with `react-native-health`; that library does not eagerly `getEnforcing` the same way, so HealthKit's iOS/Android symmetry happens to survive. The pattern is wave-wide, but the `react-native-health-connect` library's eager `Platform.select` evaluation makes it unsafe specifically for the Android-only connector on iOS under new arch.

**Expected fix:** Defer the native-library binding behind the platform guard so the iOS bundle never evaluates `getEnforcing`. Either (a) lazily `const lib = require('react-native-health-connect')` *inside* each function after `assertSupported()`/`Platform.OS === 'android'`, or (b) guard the whole client behind a `Platform.OS === 'android'` dynamic import and export inert no-ops on iOS. Add a regression test that imports the connector with `Platform.OS = 'ios'` and `global.__turboModuleProxy` set, asserting the import does not throw and `isHealthConnectSupported()` is `false`.

## Positive observations

- **Clean single native seam.** `healthConnectClient.ts` is the only module importing `react-native-health-connect`; every other module depends on it, so the native surface is mockable in one place (#15/#40). The fix for Finding 1 is therefore localized to one file.
- **Defensive, non-speculative normalizer.** All 15 record types are mapped with null-guarded nested accessors (`energy.inKilocalories`, `weight.inKilograms`, `percentage.value`, `temperature.inCelsius`); any missing/NaN field yields **no sample** rather than a 0 or guess (#42). Body temperature is correctly converted to a deviation from the 36.5 °C baseline per Agent 2 §3.1. Sleep efficiency math is exact and unit-tested (`90.909%` from a real stage vector).
- **Correct watermark semantics.** `lastSyncAt` is persisted **only after a successful POST**, with a 5-minute overlap re-read on the next run; a failed POST retries the same window — no silent data gap (#36). Tests assert both the persist-on-success and non-persist-on-failure branches.
- **No-token / no-second-http-client discipline.** POST flows through the shared axios instance (`services/api.ts`); empty batch is a no-op; the wire shape is camelCase `NormalizedSample[]` with ISO time strings, matching the documented contract stub. The `/v1/wearables/samples/ingest` path is consistent with the sibling HealthKit connector's documented HK-1 deviation from the plan's `/v1/wearables/ingest` (disclosed in both build reports) — not a defect.
- **Strong test suite.** 51 HC tests with concrete value assertions (not `toBeDefined`), covering platform guards across three platforms, partial-grant, per-type read-failure isolation, windowing math, and the persistence-only-on-success invariant.
- **Contextual permission honored.** No permission prompt on launch/tab entry — the prompt is reachable only via an explicit `sync()` (R28 / bible §5.5 AP1).

## Final verdict

**NOT CLEAN.** The data layer is decacorn-quality: gates are green (tsc/eslint/jest-HC-suites/Android prebuild all pass), the write-set is perfectly disjoint, commit hygiene is clean, and the normalizer/sync/ingest logic is defensible and well-tested. The prior auditor's ENOENT was a wrong-checkout artifact — the test files exist and pass at the pinned SHA. The single blocker is **Finding 1 (P1):** under the project's enabled new architecture, the connector's static native-library import breaks the required iOS graceful-no-op guarantee (latent iOS crash on first wiring). One localized fix (lazy/guarded `require`) plus a regression test clears it.

**Counts:** P0 = 0 · P1 = 1 · P2 = 0 · P3 = 0.

## Commit hygiene check output

```text
$ git log origin/main..d6f5bde --format='%h | %an <%ae> | committer: %cn <%ce> | body:[%b]'
d6f5bde | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
a43343e | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
a88febe | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
```

All three commits authored and committed by `Dynasia G <dynasia@trygrowthproject.com>`, all bodies empty, no trailers, no co-authors. PASS.

---

### Sources
- Build report: `tgp-agent-context/build-reports/HK_PR-HK-2b-healthconnect_BUILD.md` @ `e4b7f94`
- Doctrine: `tgp-agent-context/applehealthkit/AGENT_2_CODING_PLAN.md` (§2.1/§2.2/§3.1/§3.2/§4 PR-HK-2.b), `AGENT_1_UX_PLAN.md` (contextual permission §A.3/AP1; mascot ban §7.3; medicalization §6.4), `HANDOFF_FOR_NEXT_OPERATOR.md` (5 never-rules)
- R1 template: `tgp-agent-context/audits/HK_wave/PR-HK-2f_AUDIT_R1.md`
- Library behavior: `react-native-health-connect@3.5.3` `lib/commonjs/index.js:75-85`, `lib/commonjs/NativeHealthConnect.js`; project new-arch flag `android/gradle.properties:38` (`newArchEnabled=true`)
- Gate logs: `tgp-agent-context/audits/HK_wave/logs/PR-HK-2b_R1_{tsc,eslint,jest,prebuild_android,npmci}.log`
