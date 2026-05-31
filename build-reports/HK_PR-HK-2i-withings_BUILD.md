# HK PR-HK-2.i — Withings Connector — BUILD REPORT

## Brief
Build the Withings wearable connector for `BradleyGleavePortfolio/growth-project-backend`,
covering the **measure** (body) and **sleep** collections with OAuth2 authorization-code
auth, a form-encoded notification webhook, and the full set of audit/security patterns.
The connector self-registers via its own module/definition and does **not** touch any
shared wiring files.

**Branch:** `hk/PR-HK-2.i-withings` (from `origin/main` @ `8cfb44f`)
**Final SHA:** `037d4eb244c2a20e2a5259012fbf3f889baa93e5`
**PR:** #352 — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/352

## Write-set (binding — only these files)
`src/wearables/connectors/withings/`:
- `withings.types.ts` — native envelope `{status, body}`, `WITHINGS_STATUS_OK=0`, token body,
  measure/sleep native shapes, `WithingsNotifyEvent`, appli constants
  (`WITHINGS_APPLI_WEIGHT=1`, `WITHINGS_APPLI_SLEEP=44`), `WITHINGS_SCOPES=['user.metrics','user.activity']`,
  strict `WithingsNotifySchema` (Zod), `WithingsCollection='measure'|'sleep'`.
- `withings.normalizer.ts` — measure decode and sleep summary → `NormalizedSample`.
- `withings.connector.ts` — OAuth authorize/token/refresh, backfill, webhook verify, event mapping, redaction.
- `withings-webhook.controller.ts` — GET verify handshake + POST notify (idempotent).
- `withings.module.ts` — DI wiring (controller + providers + multi `WEARABLE_CONNECTORS`).
- `index.ts` — `ConnectorDefinition` (`withingsConnectorDef`) + re-exports.
- `withings.connector.spec.ts`, `withings.normalizer.spec.ts`, `withings-webhook.controller.spec.ts`.

Plus this build report.

**Not edited (confirmed):** `wearables.module.ts`, `connector-registry.ts`, `prisma/schema.prisma`,
`connector.interface.ts`, `ingestion.service.ts`, and all other connector folders.

## Auth model note
The task text specified `authModel: 'oauth2_code'`, but the real
`connector.interface.ts` only permits `'oauth2' | 'sdk-native' | 'on-device'`.
Per the confirmed instruction, the connector uses **`'oauth2'`**.

## Schema reference (§2 enums used — nothing added)
- Provider enum: `WITHINGS`.
- Metric enums (already present): `BODY_WEIGHT_KG`, `BODY_FAT_PCT`, `BLOOD_PRESSURE_DIA`,
  `BLOOD_PRESSURE_SYS`, `SLEEP_TOTAL_MIN`, `SLEEP_REM_MIN`, `SLEEP_DEEP_MIN`, `SLEEP_LIGHT_MIN`,
  `SLEEP_AWAKE_MIN`, `SLEEP_EFFICIENCY`, `RESPIRATORY_RATE_BRPM`.
- Buckets: `HEALTH_FITNESS`, `SLEEP_RECOVERY`.
- Units (per seed migration `20260531000000_wearables_foundation`): `kg`, `%`, `mmHg`, `min`, `br/min`.
- Dedup model: `WearableProcessedEvent` (composite `provider` + `provider_event_id`), with
  `handler_completed_at`. No schema changes made.

## Per-metric normalization (§3.1)
| Collection | Native source | Decode | Metric | Unit | Bucket | Window |
|---|---|---|---|---|---|---|
| measure | type 1 | `value * 10^unit` | `BODY_WEIGHT_KG` | kg | HEALTH_FITNESS | instant (start==end from epoch `date`) |
| measure | type 6 | `value * 10^unit` | `BODY_FAT_PCT` | % | HEALTH_FITNESS | instant |
| measure | type 9 | `value * 10^unit` | `BLOOD_PRESSURE_DIA` | mmHg | HEALTH_FITNESS | instant |
| measure | type 10 | `value * 10^unit` | `BLOOD_PRESSURE_SYS` | mmHg | HEALTH_FITNESS | instant |
| sleep | total sleep (s) | seconds → minutes | `SLEEP_TOTAL_MIN` | min | SLEEP_RECOVERY | [startdate, enddate] |
| sleep | rem (s) | seconds → minutes | `SLEEP_REM_MIN` | min | SLEEP_RECOVERY | [startdate, enddate] |
| sleep | deep (s) | seconds → minutes | `SLEEP_DEEP_MIN` | min | SLEEP_RECOVERY | [startdate, enddate] |
| sleep | light (s) | seconds → minutes | `SLEEP_LIGHT_MIN` | min | SLEEP_RECOVERY | [startdate, enddate] |
| sleep | wakeup (s) | seconds → minutes | `SLEEP_AWAKE_MIN` | min | SLEEP_RECOVERY | [startdate, enddate] |
| sleep | sleep_efficiency (ratio) | ratio × 100 | `SLEEP_EFFICIENCY` | % | SLEEP_RECOVERY | [startdate, enddate] |
| sleep | rr_average | passthrough | `RESPIRATORY_RATE_BRPM` | br/min | SLEEP_RECOVERY | [startdate, enddate] |

Notes: measure rows with `category === 2` (objectives) are skipped; null/invalid values and
invalid time windows are dropped; epoch seconds are converted to `Date`.

## Webhook idempotency mechanism
Withings POSTs `application/x-www-form-urlencoded` notifications. The controller flow:
1. No raw body → **400**.
2. `WITHINGS_WEBHOOK_SECRET` unset → **503** (fail-closed; never processes unverified events).
3. `verifyWebhook` false → **401**. Verification supports two modes — header
   `x-withings-signature` = HMAC over the full raw body, **or** a body `signature=` param =
   HMAC over the canonical (body minus the `signature` field); constant-time uppercase-hex compare.
4. Strict Zod validation of all non-`signature` form keys → **400** on failure (rejects unknown keys
   and non-numeric appli/ids).
5. `findUnique` on the composite processed-event key — existing → **200** no-op (replay-safe).
6. `findFirst` connection → fetch changed record → normalize → ingest. On ingest/fetch error the
   connection is marked `status='error'` and the error is rethrown (**no dedup row written**, so a
   retry reprocesses).
7. Dedup row created **last** with `handler_completed_at`; a `P2002` unique violation is absorbed → **200**.

Event id: `userid:appli:startdate:enddate`.

## Token storage (KMS)
Tokens are persisted via the existing `KmsService` wrap path used by sibling connectors — the
connector returns a `TokenSet` (`refreshToken`, optional `accessToken`, `accessTokenExpiresAt`,
`scopes`, `externalAccountId`) and never logs raw token material. `redactErrorMessage` strips
`token=`, `code=`, `client_secret=`, `refresh_token=`, `access_token=`, `signature=`, and
`Bearer`/`Basic` credentials, and caps message length at 500 chars before any log line.

## Test inventory (52 Withings tests, 3 suites)
- `withings.normalizer.spec.ts` — real-value assertions: weight decode 70.5 kg, fat 18.25 %,
  BP sys+dia both emitted, all 7 sleep metrics, efficiency 0.89 → 89, null drops, bad-window skips,
  batch normalization, dedup-key via `computeDedupKey`.
- `withings.connector.spec.ts` — metadata, `buildAuthUrl` (comma-joined scopes), exchangeCode
  (happy / non-zero status / ProviderHttpError / missing refresh), refresh (rotate / fallback / no-token),
  `verifyWebhook` (header accept / body-canonical accept / bad / missing / secret-unset),
  backfill (≤90d clamp / pagination / no-token), `fetchChangedRecord` (appli 1 / 44 / unknown),
  outage marks REDACTED `last_error`, `redactErrorMessage` cases, eventId.
- `withings-webhook.controller.spec.ts` — fail-closed 503, 401 bad sig, 400 no raw body,
  replay 200 no-op, P2002 200 no-op, first delivery (ingest-before-create ordering),
  fetch failure → no dedup row + `status='error'`, retry reprocess, no-connection still records,
  Zod 400 (missing fields / non-numeric appli / strict unknown key), GET verification handshake.

Full wearables suite at time of build: **20 suites, 324 tests, all passing.**

## Five gate results (ALL PASS)
| # | Gate | Result |
|---|---|---|
| 1 | `npx prisma validate` | ✅ PASS (schema valid; run with `DATABASE_URL`/`DIRECT_URL` set) |
| 2 | `npx tsc --noEmit` | ✅ PASS (0 errors) |
| 3 | `npx eslint src/wearables/connectors/withings/` | ✅ PASS (0 errors) |
| 4 | `npx jest --roots src/wearables --runInBand` | ✅ PASS (20 suites / 324 tests) |
| 5 | `npx nest build` | ✅ PASS |

> Note: Gates 2 and 5 are full-project compiles; they were briefly memory-constrained by
> concurrent sandbox workloads and completed cleanly once contention eased (heap cap 3584 MB).

## Final identifiers
- **Branch:** `hk/PR-HK-2.i-withings`
- **Final SHA:** `037d4eb244c2a20e2a5259012fbf3f889baa93e5`
- **PR:** #352 — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/352
- **Author:** `Dynasia G <dynasia@trygrowthproject.com>` (no trailers)
