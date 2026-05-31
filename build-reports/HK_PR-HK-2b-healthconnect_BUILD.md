# Build Report — PR-HK-2.b: Android Health Connect on-device connector

**Author:** Dynasia G <dynasia@trygrowthproject.com>
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**Branch:** `hk/PR-HK-2.b-healthconnect`
**Final SHA:** `d6f5bdea5d44feb18c1c29c797921ec30a017c4b`
**PR:** [#220](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/220)
**Base:** `main` @ `90c033df` (PR-HK-CFG, #218)

---

## Scope

On-device wearable connector for **Android Health Connect** using
`react-native-health-connect` 3.5.3 (wired in PR-HK-CFG #218: `package.json`
dep + `app.json` `android.permission.health.READ_*` permissions). No OAuth —
the connector reads device records via the native SDK, normalizes them
device-side into the canonical `NormalizedSample[]` shape, and POSTs to the
backend ingestion lane. Implements Agent 2 §2.1 (`HEALTH_CONNECT` provider),
§3.1 ("record types → all canonical metrics (both buckets) mapped
device-side"), and the §3.2 on-device ingestion flow
(request-permission → read since-lastSync → normalize → POST).

## Write-set (binding — `src/services/health/healthConnect/` + allowed hook)

| File | Purpose |
| --- | --- |
| `healthConnectClient.ts` | Platform-guarded, typed wrapper over the native lib: `initialize`, `getGrantedPermissions`, `requestPermission`, `readRecords` (per record type) + `readAllSupportedRecords`. The ONLY module importing `react-native-health-connect`. |
| `healthConnectNormalizer.ts` | Maps 15 record types → `NormalizedSample[]` with canonical `WearableMetricType`, bucket, and unit. Defensive parsing; drops malformed records (no speculative ingestion, #42). |
| `healthConnectSyncService.ts` | Orchestrates the on-device lane; persists `lastSyncAt` in `secureStorage` (written only after a successful POST). Incremental windowing with a 5-min overlap re-read (idempotent via backend dedup). |
| `healthConnectIngestApi.ts` | POSTs `NormalizedSample[]` to `POST /v1/wearables/samples/ingest` via the shared axios instance (`services/api.ts`) — no second http client (#40/#41). |
| `types.ts` | Local mirror of backend `WearableProvider` / `WearableMetricType` / `WearableMetricBucket` enums + `NormalizedSample` (mobile has no `@prisma/client`). |
| `errors.ts` | `HealthConnectUnsupportedError`, `HealthConnectUnavailableError`, `HealthConnectPermissionDeniedError`. |
| `index.ts` | Public barrel. |
| `src/hooks/useHealthConnectSync.ts` | TanStack `useMutation` wrapper exposing `supported` + `sync()`. (allowed additive) |
| `__tests__/healthConnectClient.test.ts` | Platform guard, init, permissions, readRecords time-range wiring, graceful per-type read. |
| `__tests__/healthConnectNormalizer.test.ts` | One test per record type (real shape → expected sample) + sleep-stage math + drop-on-missing + fan-out. |
| `__tests__/healthConnectSyncService.test.ts` | Platform guard, permission-denied, windowing, normalize→POST, lastSync persistence (and non-persistence on failure). |
| `__tests__/healthConnectIngestApi.test.ts` | Wire serialization (Date→ISO), no-op on empty, POST path. |
| `src/hooks/useHealthConnectSync.test.tsx` | `supported` by platform, run-sync success, reject on unsupported platform. |

**13 files, +2068 lines, 0 deletions.**

## Record-type → canonical metric mapping

| Health Connect record | Canonical metric(s) | Bucket | Unit |
| --- | --- | --- | --- |
| Steps | `STEPS` | H&F | count |
| ActiveCaloriesBurned | `ACTIVE_ENERGY_KCAL` | H&F | kcal |
| HeartRate (series) | `HEART_RATE_BPM` (per sample) | H&F | bpm |
| RestingHeartRate | `RESTING_HEART_RATE_BPM` | H&F | bpm |
| Vo2Max | `VO2_MAX` | H&F | mL/kg/min |
| ExerciseSession | `WORKOUT_DURATION_MIN` | H&F | min |
| Distance | `WORKOUT_DISTANCE_M` | H&F | m |
| Weight | `BODY_WEIGHT_KG` | H&F | kg |
| BodyFat | `BODY_FAT_PCT` | H&F | % |
| BloodPressure | `BLOOD_PRESSURE_SYS` + `_DIA` | H&F | mmHg |
| SleepSession | `SLEEP_TOTAL_MIN` + REM/DEEP/LIGHT/AWAKE + `SLEEP_EFFICIENCY_PCT` | S&R | min / % |
| HeartRateVariabilityRmssd | `HRV_MS` | S&R | ms |
| OxygenSaturation | `SPO2_PCT` | S&R | % |
| RespiratoryRate | `RESPIRATORY_RATE_BRPM` | S&R | brpm |
| BodyTemperature | `BODY_TEMP_DEVIATION_C` (vs 36.5°C baseline) | S&R | °C |

## Platform guard

`Platform.OS === 'android'` enforced at every public entry point in the client
and sync service. iOS/web throw `HealthConnectUnsupportedError` (Health
Connect's native module exists only on Android; iOS uses Apple HealthKit
PR-HK-2.a). The hook reports `supported: false` off-Android so the UI can gate
the affordance.

## Contract stub note (integration PR)

The backend `POST /v1/wearables/samples/ingest` HTTP route does **not** exist
yet. PR-HK-0 (merged `d09aa799`) ships `IngestionService.ingest(NormalizedSample[])`
and `src/wearables/connections/connections.controller.ts` documents the ingest
route as PR-HK-2.a's responsibility, but no controller binds the path today.
`healthConnectIngestApi.ts` is therefore the agreed **contract stub** for the
integration PR — identical posture to the Apple HealthKit connector
(PR-HK-2.a). The binding wire contract: camelCase `NormalizedSample[]` with
ISO-8601 `startAt`/`endAt` strings; the backend Zod schema coerces them and
upserts on the deterministic `dedup_key` (idempotent re-ingestion, Agent 2 §2.5).

## Gates — ALL PASS

| Gate | Command | Result |
| --- | --- | --- |
| 1 | `npx tsc --noEmit` | clean (EXIT 0) |
| 2 | `npx eslint src/services/health/healthConnect/ src/hooks/useHealthConnectSync.ts` | clean (EXIT 0) |
| 3 | `npx jest src/services/health/healthConnect/ src/hooks/useHealthConnectSync.test` | **5 suites, 51 tests pass** |
| 4 | `git diff --stat origin/main..HEAD` | write-set only (13 files) — no `app.json`/`package.json`/screens/nav/other services |

### Test breakdown (51 total)
- `healthConnectClient.test.ts` — platform guard (3 platforms), init success/fail, permission read/request, readRecords filter + coercion, graceful per-type read.
- `healthConnectNormalizer.test.ts` — 15 record types, each real-shape → expected sample; sleep-stage breakdown + efficiency math; drop-on-missing; `normalizeAll` fan-out; unknown-type guard.
- `healthConnectSyncService.test.ts` — lastSync round-trip + corrupt-value guard; platform guard; permission-denied throws; partial-grant proceeds; first-sync vs incremental windowing; normalize→POST→persist; no-persist-on-POST-failure; per-type read failure isolation.
- `healthConnectIngestApi.test.ts` — wire serialization, no-op on empty, canonical POST path.
- `useHealthConnectSync.test.tsx` — `supported` by platform; run-sync success; reject on unsupported platform.

## 50-Failures defenses applied
- **#15/#40/#41 reuse** — single native-lib seam (client); shared axios instance for POST (never a 2nd http client); local enum mirror kept in lock-step with backend Prisma enums.
- **#36/#50 fail-explicit / graceful degradation** — platform guard throws; permission-denied throws a typed error; per-record-type read failure logs + degrades to `[]` without aborting the whole sync; `lastSyncAt` watermark persisted only after a successful POST (failed run retries the same window — no silent data gap).
- **#42 no speculative ingestion** — a record lacking required fields yields no sample (never a 0/guess).
- **idempotent re-ingestion** — overlap re-read window is safe because the backend dedups on `dedup_key`.
- **#12 no secrets** — on-device connector holds no tokens; nothing sensitive logged.

## Sources
- Agent 2 Coding Plan: `tgp-agent-context/applehealthkit/AGENT_2_CODING_PLAN.md` (§2.1, §3.1, §3.2, §4 PR-HK-2.b, §5, §6).
- Agent 1 UX Plan: `tgp-agent-context/applehealthkit/AGENT_1_UX_PLAN.md` (Permissions — contextual permission).
- Backend `NormalizedSample`: `growth-project-backend/src/wearables/normalization/normalizer.types.ts`.
- Backend ingest reference: `growth-project-backend/src/wearables/connections/connections.controller.ts`, `src/wearables/ingestion/ingestion.service.ts` (PR-HK-0 `d09aa799`).
- PR-HK-CFG permissions: `growth-project-mobile` commit `90c033df` (#218) `app.json`.
- Health Connect API: https://matinzd.github.io/react-native-health-connect/docs/api/methods/readRecords/ , https://matinzd.github.io/react-native-health-connect/docs/api/methods/requestPermission/ ; sleep stages https://developer.android.com/health-and-fitness/health-connect/features/sleep-sessions
