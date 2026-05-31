# HK PR-HK-2.d — Garmin connector — BUILD REPORT

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Branch:** `hk/PR-HK-2.d-garmin` (from `origin/main` @ `8cfb44f` "PR-HK-2.f: Strava connector")
**PR:** [#355](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/355)
**Final SHA:** `0612c224a724a4ed13c8c64ffc30718f28c40b3a`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Date:** 2026-05-31

---

## 1. Brief

Build the Garmin Health API wearable connector (PR-HK-2.d) implementing the PR-HK-0
`WearableConnector` contract, following the binding `WAVE2_DISPATCH_CONTEXT.md` brief
and `AGENT_2_CODING_PLAN.md` §3.1/§2/§4/§6, modelled on the Oura / WHOOP / Strava
reference connectors.

Garmin's provider model differs from the OAuth2 reference connectors:
- **Auth** — Garmin partner OAuth. The legacy Health API used OAuth1.0a; the modern
  Health API uses OAuth2/PKCE. The brief named `authModel: 'partner_signed'`, but the
  actual foundation `WearableAuthModel` enum only permits `'oauth2' | 'sdk-native' |
  'on-device'`. Garmin's partner-signed push is an OAuth2-family flow, so the connector
  tags **`authModel = 'oauth2'`** and enforces the partner-signed PUSH security
  (static push token + constant-time compare + fail-closed) in the webhook controller —
  not via the auth-model tag.
- **Delivery** — Garmin pushes the **actual summary payload** (not a lean reference like
  WHOOP) to a pre-registered HTTPS callback ("ping/push"), with **no per-event HMAC**.
  Verification is a partner-configured static push token on the `X-Garmin-Push-Token`
  header.

Source (verified May 2026): Garmin Health API —
https://developer.garmin.com/gc-developer-program/health-api/

---

## 2. Write-set (binding — garmin folder only)

All files under `src/wearables/connectors/garmin/`:

| File | Purpose |
|---|---|
| `garmin.types.ts` | Provider-native summary types + strict Zod push/deregistration schemas |
| `garmin.normalizer.ts` | `normalizeGarmin()` + `garminDedupKey()` + `offsetToSourceTz()` |
| `garmin.connector.ts` | OAuth2, KMS-wrapped tokens, backfill, verifyWebhook, parseWebhook |
| `garmin-webhook.controller.ts` | Partner-signed push receiver (idempotency + ingest) |
| `garmin.module.ts` | NestJS module (imports WearablesModule; provides/exports GarminConnector) |
| `index.ts` | Barrel export |
| `garmin.normalizer.spec.ts` | 12 tests |
| `garmin.connector.spec.ts` | 17 tests |
| `garmin-webhook.controller.spec.ts` | 18 tests |

**NOT edited** (per brief): `wearables.module.ts`, `connector-registry.ts`,
`prisma/schema.prisma`, `connector.interface.ts`, `ingestion.service.ts`, and all other
connector folders.

---

## 3. Schema reference

The connector relies on schema enums/models that already exist on `origin/main`
(unchanged by this PR):

- `WearableProvider.GARMIN` — present in `prisma/schema.prisma` (line ~4975).
- `WearableMetricType` — STEPS, ACTIVE_ENERGY_KCAL, SLEEP_TOTAL_MIN, SLEEP_REM_MIN,
  SLEEP_DEEP_MIN, SLEEP_LIGHT_MIN, SLEEP_AWAKE_MIN, SLEEP_EFFICIENCY_PCT, BODY_BATTERY,
  HRV_MS, WORKOUT_DURATION_MIN, WORKOUT_DISTANCE_M, TRAINING_LOAD, BODY_WEIGHT_KG,
  BODY_FAT_PCT.
- `WearableMetricBucket` — `HEALTH_FITNESS`, `SLEEP_RECOVERY`.
- `WearableConnection` — `encrypted_refresh_token`, `encrypted_access_token`,
  `access_token_expires_at`, `external_account_id`, `status`, `disconnected_at`,
  `last_error`.
- `WearableProcessedEvent` — composite PK `(provider, provider_event_id)`, plus `type`,
  `processed_at`, `handler_completed_at`.

`computeDedupKey` from `../../ingestion/dedup.util` = sha256(userId|provider|metric|
startAt|endAt). The connector-local `garminDedupKey()` additionally folds the value in,
so it deliberately differs from the foundation row key (verified by test).

---

## 4. Per-metric normalization table (AGENT_2_CODING_PLAN §3.1 — Garmin row)

| Garmin collection | Garmin field | → Metric | Bucket | Unit | Conversion |
|---|---|---|---|---|---|
| `dailies` | `steps` | STEPS | HEALTH_FITNESS | `steps` | — |
| `dailies` | `activeKilocalories` | ACTIVE_ENERGY_KCAL | HEALTH_FITNESS | `kcal` | — |
| `sleeps` | `deepSleepDurationInSeconds` | SLEEP_DEEP_MIN | SLEEP_RECOVERY | `min` | ÷60 |
| `sleeps` | `lightSleepDurationInSeconds` | SLEEP_LIGHT_MIN | SLEEP_RECOVERY | `min` | ÷60 |
| `sleeps` | `remSleepInSeconds` | SLEEP_REM_MIN | SLEEP_RECOVERY | `min` | ÷60 |
| `sleeps` | `awakeDurationInSeconds` | SLEEP_AWAKE_MIN | SLEEP_RECOVERY | `min` | ÷60 |
| `sleeps` | (sum of stages) | SLEEP_TOTAL_MIN | SLEEP_RECOVERY | `min` | Σ stages ÷60 |
| `sleeps` | derived | SLEEP_EFFICIENCY_PCT | SLEEP_RECOVERY | `%` | asleep/(asleep+awake)·100, clamp [0,100] |
| `sleeps` | `endingBodyBattery` ?? `bodyBatteryChange` | BODY_BATTERY | SLEEP_RECOVERY | `score` | prefer ending, else change |
| `hrv` | `lastNightAvg` | HRV_MS | SLEEP_RECOVERY | `ms` | — |
| `activities` | `durationInSeconds` | WORKOUT_DURATION_MIN | HEALTH_FITNESS | `min` | ÷60 |
| `activities` | `distanceInMeters` | WORKOUT_DISTANCE_M | HEALTH_FITNESS | `m` | — |
| `activities` | `activityTrainingLoad` | TRAINING_LOAD | HEALTH_FITNESS | `score` | — |
| `bodyComps` | `weightInGrams` | BODY_WEIGHT_KG | HEALTH_FITNESS | `kg` | ÷1000 |
| `bodyComps` | `bodyFatInPercent` | BODY_FAT_PCT | HEALTH_FITNESS | `%` | — |

**Time handling:** Garmin timestamps are epoch **seconds**; converted to UTC `Date`
(×1000). `startTimeOffsetInSeconds` is rendered into `sourceTz` as `UTC±HH:MM`
(`offsetToSourceTz`) so DST/travel cannot off-by-one the day bucket. A record with no
parseable window is skipped. Point-in-time records (e.g. bodyComps, duration 0) have
`startAt == endAt`.

**Sleep gating:** records are skipped unless `validation` starts with `ENHANCED`
(`ENHANCED_CONFIRMED` / `ENHANCED_TENTATIVE`); `MANUAL`/unset is dropped.

Source: Garmin Health API summary specs —
https://developer.garmin.com/gc-developer-program/health-api/

---

## 5. Webhook idempotency mechanism

`garmin-webhook.controller.ts` — `POST /v1/wearables/webhooks/garmin`:

1. **Token-verify FIRST.** `connector.verifyWebhook()` compares the
   `X-Garmin-Push-Token` header to `GARMIN_PUSH_TOKEN` with a constant-time compare.
   Missing config → **fail closed** (false → 401). Missing/mismatched header → 401. The
   body is never interpreted on failure (audit #5/#6/#36).
2. **Strict Zod parse.** `connector.parseWebhook()` validates the envelope with
   `.strict()` (only the five known collections; unknown top-level key rejected — audit
   #4). A verified-but-malformed body → `[]` → controller throws `BadRequestException`
   (400). Garmin does not retry 4xx, so this surfaces a contract violation rather than
   masking it as a 500.
3. **Per-record replay check → process → commit** ("check → process → commit"):
   - `wearableProcessedEvent.findUnique({ provider_provider_event_id })` for
     `garmin:<kind>:<summaryId>`. If a row exists → replay no-op (skip).
   - Resolve the live `WearableConnection` by `external_account_id`. No connection →
     log a redacted miss and skip (no dedup row, so a later connect + redelivery can
     still ingest).
   - Normalize + `IngestionService.ingest()` (batch upsert; ingestion computes its own
     `dedup_key`, `createMany skipDuplicates` — no N+1, audit #21).
   - **Only after ingest succeeds** write the `WearableProcessedEvent` dedup row with
     `handler_completed_at` in the same write (`createMany skipDuplicates`). A lost
     race (`count === 0`) is treated as a duplicate. A row therefore always proves
     completion (no half-processed state — audit #28/#29/#7 durable enqueue).
4. **Ingest failure** → flip connection `status='error'` + redacted `last_error`,
   log redacted, and **rethrow** (no dedup row written → Garmin redelivery reprocesses;
   fail-explicit, audit #36/#50).
5. **Deregistration** (`POST .../garmin/deregistration`) — token-verify + strict Zod,
   then `updateMany` matching connection(s) to `status='disconnected'` (soft-disconnect;
   audit survives a re-link).

**No PII in logs (audit #3):** the raw Garmin `userId` is never logged; only a salted
sha256 `user_hash` (`hashGarminUserId`, 16 hex chars) plus non-PII counts / kinds /
event ids. Verified by tests asserting the raw id never appears in captured log
payloads and that `user_hash` is present.

---

## 6. Token storage (KMS)

Symmetric with the WHOOP/PR-HK-1 contract: refresh + access tokens are stored
**KMS-wrapped** via `KmsService` (`@Global`, no module import needed).

- `exchangeCode()` / `refresh()` return a `TokenSet` whose `refreshToken` and
  `accessToken` are **encrypted** (`encryptTokenSet` → `kms.encrypt`), ready to persist
  into `encrypted_*` columns.
- `refresh()` KMS-**unwraps** the stored refresh token, rotates at Garmin's token
  endpoint, then **re-wraps** the rotated tokens (Garmin rotates refresh tokens). A 401
  surfaces as a thrown `ProviderHttpError` so the connection layer flips
  `status='expired'` — never a silent success (audit #36).
- `resolveAccessToken()` (backfill) uses a cached unexpired `encrypted_access_token`
  (decrypt) when present, else unwraps the refresh token and mints a fresh access token.
- Plaintext tokens live only on the stack; they are never logged (audit #1/#12). Env:
  `GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET`, `GARMIN_REDIRECT_URI`, `GARMIN_PUSH_TOKEN`,
  `GARMIN_WEBHOOK_SALT` — read from env, never hardcoded.

---

## 7. Test inventory

| Spec file | Tests | Coverage |
|---|---|---|
| `garmin.normalizer.spec.ts` | 12 | each metric mapping with exact values; offsetToSourceTz (+/-/0/undefined); sleep TOTAL+EFFICIENCY+BODY_BATTERY; bodyBatteryChange fallback; non-enhanced sleep skip; foreign-provider/no-ctx drop; unparseable window skip; garminDedupKey determinism/value-sensitivity vs foundation key |
| `garmin.connector.spec.ts` | 17 | identity; buildAuthUrl round-trip; exchangeCode happy+error; refresh happy/no-token/401→ProviderHttpError; backfill pagination + cached-token + 503 outage; verifyWebhook 4 paths; parseWebhook 3 paths |
| `garmin-webhook.controller.spec.ts` | 18 | valid push (verify→normalize→ingest→commit, ordering, ctx threading); invalid token 401; fail-closed 401 (unset token); missing rawBody 401; duplicate event_id idempotency no-op; lost commit race; malformed JSON 400; strict-envelope reject 400; missing summaryId 400; no-connection skip; ingest-failure error+rethrow (no dedup row); deregistration disconnect; dereg invalid token 401; dereg malformed 400; no-PII-in-logs (accept + miss); assertPushConfigured 503/pass |
| **Garmin subset total** | **47** | |
| **Full wearables suite** | **319** (20 suites) | |

All assertions use real value checks (no bare `toBeDefined`).

---

## 8. Five gate results (all PASS)

| # | Gate | Command | Result |
|---|---|---|---|
| 1 | Prisma | `npx prisma validate` | **PASS** — "The schema at prisma/schema.prisma is valid 🚀" (placeholder DB env vars supplied; schema unmodified) |
| 2 | TypeScript | `npx tsc --noEmit` | **PASS** — exit 0, 0 errors |
| 3 | Lint | `npx eslint src/wearables/connectors/garmin/` | **PASS** — exit 0, 0 errors |
| 4 | Tests | `npx jest --roots src/wearables --runInBand` | **PASS** — 20 suites / **319 tests** pass (Garmin subset **47**) |
| 5 | Build | `npx nest build` | **PASS** — exit 0; garmin compiled into `dist/wearables/connectors/garmin/` |

---

## 9. Final SHA + PR URL

- **Branch:** `hk/PR-HK-2.d-garmin`
- **Final SHA:** `0612c224a724a4ed13c8c64ffc30718f28c40b3a`
- **PR:** [#355 — PR-HK-2.d: Garmin connector](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/355)
- **Author (verified):** `Dynasia G <dynasia@trygrowthproject.com>` (no trailers)
