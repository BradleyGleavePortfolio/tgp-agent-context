# BUILD REPORT — PR-HK-2.a Apple HealthKit on-device connector (#221)

**Unit:** HK-2.a (Apple HealthKit on-device provider — mobile native)
**Branch:** `hk/PR-HK-2.a-healthkit` (off mobile main `90c033d`)
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**PR:** [#221](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/221)
**Final SHA:** `e36fd8c37066688f995d2fda35fcb621f98572a6`
**Author:** Dynasia G <dynasia@trygrowthproject.com> (R0/R64 strict, no trailers)
**Type:** 🟢 feature (wearables ingestion — on-device native provider)

## Scope
On-device Apple HealthKit connector for the wearables ingestion lane. This is
an **on-device** provider (UNIFIED lock "On-device native modules", Agent 2
§3): no OAuth, no server token. The device grants native HealthKit read
permissions; the app reads samples, normalizes them to the canonical
`NormalizedSample[]` contract device-side, and POSTs pre-normalized samples to
the backend ingest endpoint. Builds on PR-HK-CFG (#218, merged `90c033d`) which
wired `react-native-health@1.19.0` + Info.plist usage strings + the Expo plugin
in `app.json`.

## Write-set (binding — `src/services/health/healthkit/` + one allowed hook)
- **`healthKitClient.ts`** (369 lines) — typed wrapper around
  `react-native-health`'s `AppleHealthKit` default export. The ONLY file that
  touches the native bridge. `requestAuth(types = HEALTHKIT_READ_PERMISSIONS)`
  and `readSamples(window)` per metric; the package's callback-style API is
  promisified once here so consumers get typed `async/await`. Exports
  `HealthKitUnsupportedError`, the `HealthKitReadPermission` union,
  `HealthKitQueryWindow`, sample shapes, `HEALTHKIT_READ_PERMISSIONS`, the
  `HealthKitClient` class, and a `healthKitClient` singleton.
  **Platform guard:** every public method calls `assertIos()` and throws
  `HealthKitUnsupportedError` on non-iOS (Android/web). Per-metric reads run
  concurrently via `Promise.all` with a `settle()` wrapper so a single metric's
  permission denial / read failure is surfaced as an omitted field rather than
  aborting the whole pass.
- **`healthKitNormalizer.ts`** (478 lines) — maps a `HealthKitReadResult` to
  canonical `NormalizedSample[]`. Implements ALL HealthKit-source metrics:
  STEPS, ACTIVE_ENERGY_KCAL, RESTING_HEART_RATE_BPM, HEART_RATE_BPM, VO2_MAX,
  WORKOUT_DURATION_MIN (sec→min) / WORKOUT_DISTANCE_M, BODY_WEIGHT_KG,
  BODY_FAT_PCT, BLOOD_PRESSURE_SYS/DIA (one record split into two samples),
  SLEEP_REM/DEEP/LIGHT/AWAKE_MIN + SLEEP_TOTAL_MIN (stage-label bucketing with
  coarse ASLEEP rollup), HRV_MS (SDNN s→ms), SPO2_PCT (fraction→%),
  RESPIRATORY_RATE_BRPM, BODY_TEMP_DEVIATION_C (absolute °C → deviation from a
  documented 37.0 °C baseline). The canonical metric/bucket/provider enums are
  duplicated as string-literal unions (the mobile app has no `@prisma/client`)
  and verified byte-for-byte against `growth-project-backend/prisma/schema.prisma`.
  **Drop policy:** metrics Apple cannot source — RECOVERY_SCORE, READINESS_SCORE,
  STRAIN_SCORE, BODY_BATTERY, TRAINING_LOAD, SLEEP_EFFICIENCY_PCT — are never
  produced (dropped silently). Non-finite values are skipped.
- **`healthKitSyncService.ts`** (185 lines) — orchestrates
  `requestAuth → readSamples(since=lastSyncAt, until=now) → normalize → POST`.
  `lastSyncAt` is persisted in `secureStorage` keyed per provider
  (`healthkit_last_sync_at`) and advanced to the window's `until` boundary
  **only after a successful POST**. First-ever sync (no cursor) backfills a
  bounded 30-day window. The bearer JWT is attached automatically by the shared
  axios request interceptor (`../../api`), so the service just calls `api.post`.
- **`index.ts`** (48 lines) — connector re-exports (client, normalizer, sync
  service, types, errors).
- **`src/hooks/useHealthKitSync.ts`** (51 lines, ALLOWED additive edit) —
  `@tanstack/react-query` `useMutation` hook wrapping the sync service for the
  Connections Hub. Exposes `isSupported` (so the UI can disable the control
  off-iOS), `sync(...)` (= `mutateAsync`), and the raw mutation state.
- **`__tests__/healthKitClient.test.ts`**, **`__tests__/healthKitNormalizer.test.ts`**,
  **`__tests__/healthKitSyncService.test.ts`**, **`src/hooks/__tests__/useHealthKitSync.test.tsx`** —
  `react-native-health` is mocked via `jest.mock`.

## Backend ingest contract (stub)
No ingest route exists on `growth-project-backend@main`. The wearables
`connections.controller.ts` implements only `oauth/start`, `oauth/callback`, and
the GET connection list, and its header comment references a future
`POST /v1/wearables/ingest`. Per the HK-1 decision, this connector targets the
documented client-side contract **`POST /v1/wearables/samples/ingest`** with
body `NormalizedSample[]` (bearer-JWT authenticated). The backend handler is
marked as a **stub TODO** for the integration PR — see the `HEALTHKIT_INGEST_PATH`
doc comment in `healthKitSyncService.ts`.

## Key design / correctness points
- **Fail-explicit cursor (UNIFIED lock):** auth, read, and POST failures all
  propagate to the caller and leave `lastSyncAt` untouched, so the next run
  safely re-pulls the same window. The empty-result case also does not advance
  the cursor (avoids skipping samples that land late in HealthKit).
- **Test floor met:** platform guard tested both directions (iOS ok; Android &
  web throw `HealthKitUnsupportedError`). Real value assertions per metric
  mapping, including all unit conversions. Sync test stubs auth/read/POST and
  asserts the POST payload shape (path + `NormalizedSample[]` with canonical
  fields), that `lastSyncAt` is persisted on success, and that the error path
  (POST rejects) does NOT advance the cursor.
- **`jest.mock` hoisting (TDZ):** jest hoists `jest.mock(...)` above top-level
  `const`s, so mock factories build their doubles internally (the native module
  object inside the `react-native-health` factory; the in-memory Map inside the
  `secureStorage` factory) and tests grab live handles via `jest.requireMock`,
  rather than closing over uninitialized variables.

## Gates (all PASS)
| Gate | Command | Result |
|------|---------|--------|
| 1 | `npx tsc --noEmit` | **PASS** (exit 0, whole project) |
| 2 | `npx eslint src/services/health/healthkit/ src/hooks/useHealthKitSync.ts` | **PASS** (exit 0, clean) |
| 3 | `npx jest src/services/health/healthkit/ src/hooks/useHealthKitSync.test` | **PASS** — 4 suites, **55 tests** |
| 4 | `git diff --stat origin/main..HEAD` | **PASS** — 9 files, all in write-set |

### Boundary (`git diff --stat origin/main..HEAD`)
```
 src/hooks/__tests__/useHealthKitSync.test.tsx                          |  95 ++
 src/hooks/useHealthKitSync.ts                                          |  51 +
 src/services/health/healthkit/__tests__/healthKitClient.test.ts        | 237 ++
 src/services/health/healthkit/__tests__/healthKitNormalizer.test.ts    | 254 ++
 src/services/health/healthkit/__tests__/healthKitSyncService.test.ts   | 216 ++
 src/services/health/healthkit/healthKitClient.ts                       | 369 ++
 src/services/health/healthkit/healthKitNormalizer.ts                   | 478 ++
 src/services/health/healthkit/healthKitSyncService.ts                  | 185 ++
 src/services/health/healthkit/index.ts                                 |  48 +
 9 files changed, 1933 insertions(+)
```
No edits to `app.json`, `package.json`, any screen, navigation, or any other
`src/services/` file — write-set boundary respected.

## Commits (author Dynasia G, no trailers)
- `13ce206` feat(health): HealthKit on-device connector client, normalizer, sync service, hook
- `2c48dd5` test(health): HealthKit connector + hook test suites (55 tests)
- `e36fd8c` test(health): type readSamples/requestAuth mocks for tsc strict mode

## Follow-ups
- **Backend integration PR:** implement `POST /v1/wearables/samples/ingest`
  (bearer-JWT) accepting `NormalizedSample[]` and feeding the shared
  `IngestionService`; reconcile the path with the controller's referenced
  `POST /v1/wearables/ingest`.
- Wire `useHealthKitSync` into the Connections Hub screen (out of this PR's
  write-set; screens are DO-NOT-EDIT here).
