# Build Report — PR-HK-2.c: Samsung Health on-device connector (Android)

**Author:** Dynasia G <dynasia@trygrowthproject.com>
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**Branch:** `hk/PR-HK-2.c-samsung-health`
**Final SHA:** `dcb9f8cae5f1625c444baa0b429a3b54c1dc2cb9`
**PR:** [#222](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/222)
**Base:** `main` @ `90c033df` (PR-HK-CFG, #218)

---

## Scope

On-device wearable connector for **Samsung Health** on Android. Samsung Health
has no stable JS↔RN bridge on mainstream npm; on Android it writes its samples
into the **Health Connect** store, tagging every record with a `dataOrigin` of
`com.sec.android.app.shealth`. This connector reads through the
`react-native-health-connect` bridge (wired in PR-HK-CFG #218) and **FILTERS to
Samsung-origin records only**, then ingests them as `provider: SAMSUNG_HEALTH`.

That Samsung-origin filter is the provider-distinct differentiator vs
**PR-HK-2.b** (Health Connect), which reports every record as
`HEALTH_CONNECT`. The two connectors share the bridge but are **file-disjoint**
(`src/services/health/samsungHealth/` vs `src/services/health/healthConnect/`)
and report distinct providers / filter to distinct data origins. Implements
Agent 2 §2.1 (`SAMSUNG_HEALTH` provider), §3.1 (Samsung row: "all canonical
metrics, both buckets, mapped device-side"), and the §3.2 on-device flow
(permission check → read since-lastSync → normalize → POST).

No OAuth — reads are local; the only network call is the batched ingest POST.

## Write-set (binding — `src/services/health/samsungHealth/` + allowed hook)

| File | Purpose |
| --- | --- |
| `samsungHealthClient.ts` | Read seam over the Health Connect bridge. Same `readRecords` API; FILTERS records to `metadata.dataOrigin.packageName === 'com.sec.android.app.shealth'`. Android platform guard, permission-denied + graceful-degrade paths. Lazy `require('react-native-health-connect')` (package declared but not installable in non-Android/test envs) + `__setBridgeForTests` injection seam. The ONLY module touching the native bridge. |
| `samsungHealthNormalizer.ts` | Maps 15 Health Connect record types → `NormalizedSample[]` with canonical `WearableMetricType`, bucket, unit — same mapping as Health Connect — but every sample is tagged `provider: SAMSUNG_HEALTH`. `normalizeRecords` re-asserts Samsung origin (defence in depth). Drops malformed / unrecognised records (no speculative ingestion, #42). |
| `samsungHealthSyncService.ts` | Orchestrates the on-device lane: platform guard → init (graceful no-op if Health Connect unavailable) → read granted types since `lastSyncAt` (30-day first-run backfill) → normalize → single batched `POST /v1/wearables/samples/ingest`. Persists `lastSyncAt` under `wearable:samsung-health:lastSyncAt` in AsyncStorage **only** after a successful ingest. |
| `types.ts` | Local mirror of backend `WearableProvider` / `WearableMetricType` / `WearableMetricBucket` enums + `NormalizedSample`; `SAMSUNG_HEALTH_PACKAGE_NAME`, `extractPackageName` (object-or-bare-string `dataOrigin`), `isSamsungHealthRecord`. (mobile has no `@prisma/client`). |
| `errors.ts` | `SamsungHealthError` base + `SamsungHealthUnsupportedError`, `SamsungHealthUnavailableError`, `SamsungHealthPermissionDeniedError`. |
| `index.ts` | Public barrel. |
| `src/hooks/useSamsungHealthSync.ts` | TanStack `useMutation` (sync) + `useQuery` lastSync freshness read; invalidates lastSync on success. (allowed additive) |
| `__tests__/samsungHealthClient.test.ts` | Platform guard (ios/web throw), Samsung-origin filter keep/drop (object + bare-string `dataOrigin`), mixed-batch subset, recordType stamping, permission-denied, graceful-degrade on bridge failure, init success/false/throw, granted-types filtering. |
| `__tests__/samsungHealthNormalizer.test.ts` | One test per record type (real shape → expected value/bucket/unit), provider-tag assertion (`SAMSUNG_HEALTH`, never `HEALTH_CONNECT`), sleep-stage math, drop-on-missing, Samsung-origin invariant in `normalizeRecords`. |
| `__tests__/samsungHealthSyncService.test.ts` | lastSync round-trip / invalid-value / clear, platform guard, graceful degrade (no-op + no-persist), permission-denied (+ no-persist), full sync (single batched POST, 30-day backfill window, read-from-lastSync, persist-on-success, persist-on-empty), failed-ingest does-not-advance-lastSync. |
| `src/hooks/useSamsungHealthSync.test.tsx` | Stable query/mutation keys, lastSync query reads `getLastSyncAt`, mutation calls `sync()` + surfaces result, invalidates lastSync on success, surfaces sync error (not swallowed). |

**11 files, +2156 lines, 0 deletions.**

## Record-type → canonical metric mapping

(Identical mapping to PR-HK-2.b; only the emitted `provider` differs.)

| Health Connect record | Canonical metric(s) | Bucket | Unit |
| --- | --- | --- | --- |
| Steps | `STEPS` | H&F | count |
| ActiveCaloriesBurned | `ACTIVE_ENERGY_KCAL` | H&F | kcal |
| HeartRate (series) | `HEART_RATE_BPM` (per sample) | H&F | bpm |
| RestingHeartRate | `RESTING_HEART_RATE_BPM` | S&R | bpm |
| Vo2Max | `VO2_MAX` | H&F | ml/kg/min |
| ExerciseSession | `WORKOUT_DURATION_MIN` | H&F | min |
| Distance | `WORKOUT_DISTANCE_M` | H&F | m |
| Weight | `BODY_WEIGHT_KG` | H&F | kg |
| BodyFat | `BODY_FAT_PCT` | H&F | % |
| BloodPressure | `BLOOD_PRESSURE_SYS` + `_DIA` | H&F | mmHg |
| SleepSession | `SLEEP_TOTAL_MIN` + REM/DEEP/LIGHT/AWAKE | S&R | min |
| HeartRateVariabilityRmssd | `HRV_MS` | S&R | ms |
| OxygenSaturation | `SPO2_PCT` | S&R | % |
| RespiratoryRate | `RESPIRATORY_RATE_BRPM` | S&R | brpm |
| BodyTemperature | `BODY_TEMP_DEVIATION_C` | S&R | C |

## Platform / degradation behaviour

- `Platform.OS === 'android'` required at every entry point; other platforms
  throw `SamsungHealthUnsupportedError` (names the offending platform).
- A missing/failed Health Connect install surfaces as
  `SamsungHealthUnavailableError`; the sync service catches it and returns a
  no-op result (does not crash, does not advance `lastSyncAt`).
- Zero granted record types throws `SamsungHealthPermissionDeniedError` (the
  permission-denied path); `lastSyncAt` is not advanced.
- A failed ingest POST rethrows and leaves `lastSyncAt` unchanged, so the same
  window is re-read next run (idempotent via backend dedup).

## Backend contract

- Ingest target: `POST /v1/wearables/samples/ingest` (resolves to
  `/api/v1/wearables/samples/ingest` via the axios base URL's `/api` prefix).
- Body: `{ provider: 'SAMSUNG_HEALTH', samples: NormalizedSample[] }` — one
  batched request, never one POST per sample (#21).
- `NormalizedSample` (mobile mirror, camelCase): `provider`, `metric`,
  `bucket`, `value`, `unit`, `startAt` (ISO), `endAt` (ISO), `sourceTz?`,
  `sourceRecordId?`. Server-computed fields (`dedupKey`, `recordedAt`) omitted.

## Gates

| Gate | Command | Result |
| --- | --- | --- |
| 1 | `npx tsc --noEmit` (full project) | **PASS** (exit 0, no errors) |
| 2 | `npx eslint src/services/health/samsungHealth/ src/hooks/useSamsungHealthSync.ts` | **PASS** (exit 0) |
| 3 | `npx jest src/services/health/samsungHealth/ src/hooks/useSamsungHealthSync.test` | **PASS** — 4 suites, **65 tests** |
| 4 | `git diff --stat origin/main..HEAD` | **PASS** — 11 files, all within write-set |

## Notes / decisions

- **Lazy `require` (not static `import`)** for `react-native-health-connect`:
  the package is declared in `package.json` (#218) but is an Android-native
  module not resolvable in this build/test environment. A static import would
  fail tsc/jest at module-load; `require` behind `getBridge()` keeps the module
  importable everywhere and is mocked in tests via the `__setBridgeForTests`
  seam. A future native Samsung SDK module can replace `getBridge()` with zero
  change to the public `readRecords` / `initialize` / `getGrantedRecordTypes`
  contract.
- **`dataOrigin` shape tolerance:** the task contract is binding on
  `metadata.dataOrigin.packageName`, but some `react-native-health-connect`
  builds surface `dataOrigin` as a bare package-name string.
  `extractPackageName` handles both shapes so the Samsung filter never silently
  passes the wrong origin. Both shapes are covered by tests.
- **No edits** to `app.json`, `package.json`, existing screens, navigation, or
  `src/services/health/healthConnect/` (PR-HK-2.b's folder). The Samsung
  Health Android permission was already added in PR-HK-CFG (#218).
