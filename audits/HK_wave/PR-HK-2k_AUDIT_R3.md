# PR-HK-2.k Oura Connector — R3 Re-Audit Verdict

- **Repo:** `growth-project-backend`
- **PR:** #346
- **Audited head SHA:** `824916089020adabb1daf8c217e21c1c5784801d`
- **Previous R1 head:** `e9ef29695dfa3164bff54e264d2982e42a86b58f`
- **Base SHA:** `9c67444c`
- **R2 build report append:** docs commit `057e377f`
- **Auditor:** R3 re-auditor
- **Verdict:** **CLEAN for the three R1 findings and all requested gates**

## Executive summary

All three R1 findings are fixed at `824916089020adabb1daf8c217e21c1c5784801d`.
The R3 audit verified the code, the targeted tests, the write-set boundary, commit authorship, and the required gate commands in an isolated worktree pinned to the target SHA.

No new release-blocking findings were found in the R3 scope.

## Evidence captured

Gate logs from this R3 run are saved under:

- `audits/HK_wave/intermediate_PR-HK-2k_R3/prisma_validate.log`
- `audits/HK_wave/intermediate_PR-HK-2k_R3/prisma_generate.log`
- `audits/HK_wave/intermediate_PR-HK-2k_R3/tsc.log`
- `audits/HK_wave/intermediate_PR-HK-2k_R3/eslint_oura.log`
- `audits/HK_wave/intermediate_PR-HK-2k_R3/jest_wearables.log`
- `audits/HK_wave/intermediate_PR-HK-2k_R3/jest_oura_subset_v2.log`

The first attempted Oura-only Jest invocation without `--roots` produced no matches and is also saved as `jest_oura_subset.log`; it was corrected with `npx jest --roots src/wearables/connectors/oura --runInBand`.

## Gates

| Gate | Command | Result |
| --- | --- | --- |
| ① Prisma validate | `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | **PASS** — schema valid |
| ② Prisma generate | `DATABASE_URL=... DIRECT_URL=... npx prisma generate` | **PASS** — Prisma Client generated with v6.19.3 |
| ③ TypeScript | `npx tsc --noEmit -p tsconfig.json` | **PASS** — no compiler output |
| ④ ESLint | `npx eslint src/wearables/connectors/oura/` | **PASS** — no lint output |
| ⑤ Jest | `npx jest --roots src/wearables --runInBand` | **PASS** — 6 suites / 107 tests / 107 passed |

Oura-only subset: `npx jest --roots src/wearables/connectors/oura --runInBand` passed with 3 suites / 55 tests / 55 passed.

## Regression checks

| Check | Result | Evidence |
| --- | --- | --- |
| Test count | **PASS** | Full wearable suite is 107/107; Oura subset is 55/55. Static Oura test declaration count is 14 webhook + 25 connector + 16 normalizer = 55. |
| Author metadata | **PASS** | New commits after R1 are all by Dynasia G `<dynasia@trygrowthproject.com>`: `8d7a744`, `973edf7`, `8249160`. |
| Write-set boundary | **PASS** | `git diff --name-status 9c67444c..8249160` contains exactly the same 9 Oura connector files; no non-Oura files. |
| R2 write-set delta | **PASS** | The R2 fix commits modify 7 of the 9 Oura connector files. |
| Forbidden files | **PASS** | No edits to `src/wearables/wearables.module.ts` or `src/wearables/connector-registry.ts`. |

## Per-finding verification

### R1 #1 Critical — webhook idempotency ordering

**Status: FIXED.**

Verified `src/wearables/connectors/oura/oura-webhook.controller.ts:117-219`.

The current flow is:

1. Compute `providerEventId`.
2. `wearableProcessedEvent.findUnique` checks `(provider='OURA', provider_event_id)`.
3. If an existing row is found, return `{ ok: true }` without fetch or ingest.
4. If this is not a delete event, resolve the connection, then call `connector.fetchChangedRecord`, `connector.normalize`, and `ingestion.ingest`.
5. Only after successful fetch/normalize/ingest, call `wearableProcessedEvent.create` with `handler_completed_at: new Date()`.
6. A concurrent post-ingest `P2002` unique violation is treated as a benign no-op.

Failure behavior is correct: if fetch or ingest throws, control goes through the catch block at `oura-webhook.controller.ts:164-184`, marks the connection error best-effort, logs, rethrows, and never reaches the `wearableProcessedEvent.create` at `oura-webhook.controller.ts:200-208`.
Therefore no processed-event row is written on fetch/ingest failure, and Oura redelivery will reprocess the event.

Targeted test coverage exists in `src/wearables/connectors/oura/oura-webhook.controller.spec.ts:190-214`.
The test simulates a transient fetch failure, asserts `processedEvent.create` was not called, then retries the same event and asserts fetch, ingest, and processed-event create all occur.
Additional ordering assertions at `oura-webhook.controller.spec.ts:148-165` verify ingest precedes the processed-event create.

### R1 #2 High — sleep stages / HRV wired

**Status: FIXED.**

Verified `src/wearables/connectors/oura/oura.normalizer.ts:142-279,372-384` and `src/wearables/connectors/oura/oura.types.ts:73-121`.

`normalizeSleep()` now exists for Oura v2 long-form `sleep` records and is routed by `case 'sleep'` in `normalizeOuraRecord`.
The mapping is correct:

| Oura field | Canonical metric | Conversion |
| --- | --- | --- |
| `total_sleep_duration` | `SLEEP_TOTAL_MIN` | seconds → rounded minutes |
| `rem_sleep_duration` | `SLEEP_REM_MIN` | seconds → rounded minutes |
| `deep_sleep_duration` | `SLEEP_DEEP_MIN` | seconds → rounded minutes |
| `light_sleep_duration` | `SLEEP_LIGHT_MIN` | seconds → rounded minutes |
| `awake_time` | `SLEEP_AWAKE_MIN` | seconds → rounded minutes |
| `efficiency` | `SLEEP_EFFICIENCY_PCT` | percent passthrough |
| `average_hrv` | `HRV_MS` | ms passthrough |
| `hrv.items` | `HRV_MS` | finite-item mean, rounded, used when `average_hrv` is absent |

The types file defines `OuraSleepTimeSeries` and `OuraSleep`, including `average_hrv`, `hrv.items`, stage durations, efficiency, and bedtime window fields.

Targeted test coverage exists in `src/wearables/connectors/oura/oura.normalizer.spec.ts:265-363`.
The golden vector for the 420-minute sleep period asserts exactly 7 emitted samples:

| metric | value | unit | bucket | startAt | endAt |
| --- | ---: | --- | --- | --- | --- |
| `SLEEP_TOTAL_MIN` | 420 | `min` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |
| `SLEEP_REM_MIN` | 100 | `min` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |
| `SLEEP_DEEP_MIN` | 70 | `min` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |
| `SLEEP_LIGHT_MIN` | 250 | `min` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |
| `SLEEP_AWAKE_MIN` | 15 | `min` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |
| `SLEEP_EFFICIENCY_PCT` | 89 | `%` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |
| `HRV_MS` | 58 | `ms` | `SLEEP_RECOVERY` | `2026-05-30T23:10:00.000Z` | `2026-05-31T06:55:00.000Z` |

The spec also verifies `average_hrv` precedence, `hrv.items` fallback mean, no HRV emission when neither source is usable, and dedup-key derivation.

### R1 #3 Medium/High — outage marking

**Status: FIXED.**

Verified `src/wearables/connectors/oura/oura.connector.ts:63-113,140-151,193-204,242-251,540-559,572-576`.

`PrismaService` is constructor-injected as an optional second argument (`private readonly prisma?: PrismaService`) and `createOuraConnector` forwards an optional `prisma` argument.
The `backfill()` and `refresh()` public methods are wrapped in try/catch; on failure they call `markConnectionError(conn, err, op)` and then rethrow the original error.
`markConnectionError()` updates `WearableConnection` to `status: 'error'` and `last_error: <redacted message>` when Prisma and `conn.id` are present, and the update is best-effort so it does not mask the original failure.

`redactErrorMessage()` strips the required token/secret/code/Bearer patterns and caps persisted/logged text at 500 characters:

- `access_token=...`
- `refresh_token=...`
- `client_secret=...`
- `client_id=...`
- `token=...`
- `code=...`
- `Authorization: Bearer ...`
- `Authorization: Basic ...`
- bare `Bearer ...`
- bare `Basic ...`
- generic `authorization=...` values

Targeted tests exist in `src/wearables/connectors/oura/oura.connector.spec.ts:342-446`.
The outage tests cover backfill failure marking, refresh failure marking, and no-Prisma construction still rethrowing without crashing.
The redaction unit tests cover secret key/value patterns, Bearer/Authorization patterns, non-Error/empty inputs, and the 500-character cap.

## Additional observations

- The R3 requested write-set boundary remains intact: the PR still avoids `wearables.module.ts` and `connector-registry.ts`.
- The earlier R1 note that `dataTypeToCollection()` omits `heartrate` webhook events remains true at `oura.connector.ts:495-508`, but it was not one of the three R1 findings in this R3 verification scope and is not treated as a new R3 release blocker.

## Final verdict

**CLEAN** at `824916089020adabb1daf8c217e21c1c5784801d` for the three requested R1 findings.
All five gates pass, all three findings are **FIXED**, and no new release-blocking findings were identified in the R3 scope.
