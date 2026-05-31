# PR-HK-2.k Oura Connector — R1 Audit Verdict

- **Repo:** `growth-project-backend`
- **PR:** #346
- **Audited head SHA:** `e9ef29695dfa3164bff54e264d2982e42a86b58f`
- **Base SHA:** `9c67444c`
- **Build report reviewed:** `HK_PR-HK-2k-oura_BUILD.md` at docs commit `df59edb4`
- **Auditor:** R1
- **Verdict:** **NOT CLEAN**

## Executive summary

The PR is correctly SHA-pinned, file-disjoint, compiles, lints, and its wearable test suite passes. It also implements most of the intended OAuth, HMAC, normalization, and replay scaffolding. However, I found release-blocking correctness issues in webhook idempotency and real Oura sleep ingestion, plus additional incomplete webhook/data-coverage gaps. These are not gate failures, but they violate the PR-HK-2.k functional/security checklist.

## Gates

All five requested gates were run in an isolated worktree pinned to `e9ef29695dfa3164bff54e264d2982e42a86b58f` after installing the repo-pinned dependencies (`npm ci`) so `npx prisma` used Prisma `6.19.3` rather than global Prisma `7.x`.

| Gate | Command | Result |
| --- | --- | --- |
| ① Prisma validate | `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | **PASS** — schema valid |
| ② Prisma generate | `DATABASE_URL=... DIRECT_URL=... npx prisma generate` | **PASS** — client generated |
| ③ TypeScript | `npx tsc --noEmit -p tsconfig.json` | **PASS** — no compiler output |
| ④ ESLint | `npx eslint src/wearables/connectors/oura/` | **PASS** — no lint output |
| ⑤ Jest | `npx jest --roots src/wearables --runInBand` | **PASS** — 6 suites / 95 tests / 95 passed |

Gate logs are saved under `audits/HK_wave/intermediate_PR-HK-2k_R1/`.

## Write-set and commit hygiene

**PASS.** `git diff --name-status 9c67444c..HEAD` contains exactly 9 added files, all under `src/wearables/connectors/oura/`:

1. `src/wearables/connectors/oura/index.ts`
2. `src/wearables/connectors/oura/oura-webhook.controller.spec.ts`
3. `src/wearables/connectors/oura/oura-webhook.controller.ts`
4. `src/wearables/connectors/oura/oura.connector.spec.ts`
5. `src/wearables/connectors/oura/oura.connector.ts`
6. `src/wearables/connectors/oura/oura.module.ts`
7. `src/wearables/connectors/oura/oura.normalizer.spec.ts`
8. `src/wearables/connectors/oura/oura.normalizer.ts`
9. `src/wearables/connectors/oura/oura.types.ts`

**PASS.** No edits to `src/wearables/wearables.module.ts` or `src/wearables/connector-registry.ts`.

**PASS.** There are 4 commits, all by Dynasia G `<dynasia@trygrowthproject.com>`, with empty bodies and no trailers:

| SHA | Subject |
| --- | --- |
| `fe26894b4e9ba5d6821d10ac924cb28c1566acca` | `feat(wearables): PR-HK-2.k — Oura types + normalizer` |
| `6ac1e230b753674566db5abc48006186768c9bb6` | `feat(wearables): PR-HK-2.k — Oura connector (OAuth + backfill)` |
| `c361791a498d35c37d13049569ab381b36df3553` | `feat(wearables): PR-HK-2.k — Oura webhook controller` |
| `e9ef29695dfa3164bff54e264d2982e42a86b58f` | `feat(wearables): PR-HK-2.k — Oura module + connector definition export` |

## Checklist audit

### Connector implementation

- **PASS:** `OuraConnector implements WearableConnector`; provider is `WearableProvider.OURA`; auth model is `oauth2` (`oura.connector.ts:80-83`).
- **PASS:** Auth URL is `https://cloud.ouraring.com/oauth/authorize`; token URL is `https://api.ouraring.com/oauth/token` (`oura.connector.ts:45-46`).
- **PASS:** OAuth scope is exactly `daily heartrate workout session spo2 personal` (`oura.connector.ts:50-57`, `oura.connector.spec.ts:75-77`).
- **PASS:** `buildAuthUrl` includes `state` and `redirect_uri` from `OURA_REDIRECT_URI` (`oura.connector.ts:97-107`).
- **PASS:** `exchangeCode` and `refresh` return PR-HK-0 `TokenSet` shape (`oura.connector.ts:111-125`, `oura.connector.ts:129-154`, `oura.connector.ts:384-400`).
- **PASS:** Backfill clamps requested history to the Oura ≤30-day window (`oura.connector.ts:172-181`).
- **PASS/PARTIAL:** Oura HTTP calls route through `ProviderHttpClient`, which supplies timeout/backoff defaults; however, the Oura calls do **not** pass `timeoutMs` explicitly (`oura.connector.ts:298-305`, `oura.connector.ts:339-343`, `oura.connector.ts:375-380`).

### Webhook security

- **PASS:** HMAC verification computes uppercase hex SHA256 over `x-oura-timestamp + rawBody`, keyed by `OURA_CLIENT_SECRET`, matching the Oura docs format for `x-oura-signature` / `x-oura-timestamp` (`oura.connector.ts:237-255`; Oura docs: https://cloud.ouraring.com/v2/docs).
- **PASS:** Uses `crypto.timingSafeEqual` through `constantTimeEquals` (`oura.connector.ts:427-437`).
- **PASS:** Raw body is obtained via `RawBodyRequest<Request>` (`oura-webhook.controller.ts:15`, `oura-webhook.controller.ts:80-93`).
- **PASS:** Bad or missing signature fails closed with 401 and does not hit DB/ingestion (`oura-webhook.controller.ts:90-97`; spec lines `97-103`).
- **PASS:** Payload validation happens only after signature verification (`oura-webhook.controller.ts:90-100`).

### Dedup / idempotency

- **PASS:** Webhook dedup key is `(provider='OURA', provider_event_id)` through `WearableProcessedEvent` (`oura-webhook.controller.ts:104-143`).
- **PASS:** Replay test asserts 200 no-op and no fetch/ingest (`oura-webhook.controller.spec.ts:114-132`).
- **PASS:** Connector returns `NormalizedSample[]` without `dedup_key`; tests re-derive canonical PR-HK-0 `sha256(user_id|provider|metric|start_iso|end_iso)` via `computeDedupKey` (`oura.normalizer.spec.ts:38-50`).
- **FAIL (critical):** The idempotency implementation records a webhook as processed **before** fetching/normalizing/ingesting. If fetch or ingest throws after the insert, the controller marks the connection `error` and rethrows, but the row already exists; the next Oura retry is treated as a replay no-op because `findUnique` does not check `handler_completed_at`. This can permanently drop an event after a transient provider/ingestion failure (`oura-webhook.controller.ts:104-121`, `oura-webhook.controller.ts:124-133`, `oura-webhook.controller.ts:160-188`, `oura-webhook.controller.ts:199-210`).

### Normalizer mapping

- **PASS:** `daily_readiness.score` maps to `READINESS_SCORE`; `temperature_deviation` maps to `BODY_TEMP_DEVIATION_C` (`oura.normalizer.ts:206-231`).
- **PASS:** `daily_activity.steps` maps to `STEPS` (`oura.normalizer.ts:234-247`).
- **PASS:** `heartrate.bpm` maps to `HEART_RATE_BPM` (`oura.normalizer.ts:249-264`).
- **PASS:** `daily_spo2.spo2_percentage.average` maps to `SPO2_PCT`, and `SPO2_PCT` exists in PR-HK-0 enum/seed (`oura.normalizer.ts:266-288`; migration enum/seed verified in `20260531000000_wearables_foundation/migration.sql`).
- **PASS:** Units and buckets match PR-HK-0 seeds for mapped fields (`min`, `bpm`, `%`, `ms`, `score`, `°C`; `HEALTH_FITNESS` / `SLEEP_RECOVERY`).
- **PASS:** Dates are UTC `Date` objects; daily windows are UTC day spans (`oura.normalizer.ts:80-90`).
- **PASS:** Unmapped/null/non-finite fields are dropped (`oura.normalizer.ts:102-125`, `oura.normalizer.ts:290-315`).
- **FAIL (high):** Real backfill does not populate the advertised sleep-stage/HRV mapping. The types file explicitly says the connector should merge stage/HRV fields from the long-form `sleep` endpoint into the logical `daily_sleep` record, but the connector only wraps `daily_sleep` and `sleep` as separate records; the normalizer maps `sleep` to `[]` and only reads stage/HRV fields if they are already present on a `daily_sleep` record (`oura.types.ts:12-20`, `oura.connector.ts:191-204`, `oura.normalizer.ts:127-203`, `oura.normalizer.ts:310-313`). Result: live Oura `sleep` records fetched during backfill produce no `SLEEP_TOTAL_MIN`, `SLEEP_REM_MIN`, `SLEEP_DEEP_MIN`, `SLEEP_LIGHT_MIN`, `SLEEP_AWAKE_MIN`, or `HRV_MS` samples.

### HTTP discipline

- **PASS:** All Oura provider calls use `ProviderHttpClient.request` rather than direct `fetch`/Axios (`oura.connector.ts:298-305`, `oura.connector.ts:339-343`, `oura.connector.ts:375-380`).
- **PASS:** 429 is covered by the shared retry/backoff policy and is exercised by the wearable HTTP tests.
- **FAIL/PARTIAL (medium):** Webhook fetch/ingest failures mark the connection `status='error'`, but backfill/refresh/token exchange provider failures only throw; the connector itself has no path to update connection status or `last_error` on backfill outages (`oura.connector.ts:165-218`, `oura.connector.ts:371-381`; `oura-webhook.controller.ts:170-188`). This only partially satisfies “provider outage sets status='error' on connection + logs.”

### Validation and logging

- **PASS:** Webhook payload has Zod validation and malformed payloads return 4xx after signature verification (`oura-webhook.controller.ts:226-253`; `oura-webhook.controller.spec.ts:192-217`).
- **PASS:** No raw payload logging found in production code; webhook logs include metadata and error messages, not raw body values (`oura-webhook.controller.ts:115-120`, `oura-webhook.controller.ts:182-187`, `oura-webhook.controller.ts:191-195`, `oura-webhook.controller.ts:212-217`).
- **NOTE:** Error messages are stored/logged verbatim up to 500 chars (`last_error`, `error_message`). This is better than raw payload logging, but it is not strong redaction if an upstream error includes secrets (`oura-webhook.controller.ts:177-187`).

### Tests

- **PASS:** 43 new Oura tests exist: 12 normalizer, 18 connector, 13 webhook.
- **PASS:** No executable `toBeDefined` assertions were found; one `toBeDefined` string appears only in a comment.
- **PASS:** Normalizer tests assert exact sample values, units, buckets, timestamps, and canonical dedup derivations.
- **PASS:** Webhook bad signature → 401; replay → 200 no-op; OAuth URL/token exchange/refresh paths are covered.
- **GAP:** Tests do not cover the critical “insert processed event then failure then retry” loss scenario.
- **GAP:** Tests do not use realistic live `sleep` endpoint records to prove sleep stage/HRV ingestion; they use synthetic `daily_sleep` records that already contain stage fields.
- **GAP:** Tests do not cover `fetchChangedRecord` for `heartrate` webhook events. The current `dataTypeToCollection` switch omits `heartrate`, so such events return no records even though backfill and normalization support `heartrate` (`oura.connector.ts:286-305`, `oura.connector.ts:403-415`).

## Top findings

1. **Critical — webhook retries can be dropped after transient failures.** `WearableProcessedEvent` is inserted before side effects, and every existing row is treated as complete, so Oura redelivery after a failed fetch/ingest becomes a 200 no-op.
2. **High — live sleep-stage/HRV ingestion is not actually wired.** The code claims a `sleep`→`daily_sleep` merge, but it never performs it; `sleep` records are fetched and then normalized to `[]`.
3. **Medium/High — provider outage handling is incomplete outside webhooks.** Webhook processing marks connection `error`, but backfill/refresh/token failures only throw and rely on non-existent/deferred caller behavior for connection status updates.

## Required fixes before CLEAN

1. Change webhook idempotency so an event is only treated as replay after successful completion, or add an explicit in-progress/completed state and retry incomplete rows. Do not no-op an existing row with `handler_completed_at = null` after a failed attempt.
2. Implement the real Oura sleep data path: either merge `sleep` endpoint stage/HRV fields into daily sleep records before normalization or normalize `sleep` records directly to the required sleep metrics.
3. Add tests for failure-after-processed-event-insert followed by retry, realistic `sleep` endpoint sample JSON, and any intended webhook data types such as `heartrate`.
4. Decide where provider outage connection-status updates belong for backfill/refresh; implement/test it in this PR or document the precise caller contract in PR-HK-1 integration.

## Final verdict

**NOT CLEAN** at `e9ef29695dfa3164bff54e264d2982e42a86b58f`.
