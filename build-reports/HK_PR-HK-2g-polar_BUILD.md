# PR-HK-2.g — Polar AccessLink Connector — BUILD REPORT

## Brief
Polar AccessLink API v3 connector for `BradleyGleavePortfolio/growth-project-backend`,
implementing the PR-HK-0 `WearableConnector` contract. OAuth2 cloud provider with
webhook notifications (`Polar-Webhook-Signature` HMAC-SHA256) and transactional
backfill. Strictly file-disjoint: no edits to `wearables.module.ts`,
`connector-registry.ts`, `prisma/schema.prisma`, `connector.interface.ts`,
`ingestion.service.ts`, or any sibling connector folder. Registry wiring is
contributed via the `WEARABLE_CONNECTORS` multi-injection token (activation
deferred to the integration PR), mirroring the Oura template.

- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/351
- **Branch:** `hk/PR-HK-2.g-polar`
- **Final SHA:** `ef79c47ffe1a9a716fdd94a9960280321eab9d55`
- **Author:** Dynasia G <dynasia@trygrowthproject.com>

## Interface note
The dispatch named `authModel: 'oauth2_code'`, but the binding
`connector.interface.ts` only permits `WearableAuthModel = 'oauth2' | 'sdk-native'
| 'on-device'`. The connector uses **`'oauth2'`** (the documented OAuth2 server
flow) as required by the real interface.

## Write-set (9 files, `src/wearables/connectors/polar/` only)
- `polar.connector.ts` (+ `polar.connector.spec.ts`)
- `polar.normalizer.ts` (+ `polar.normalizer.spec.ts`)
- `polar-webhook.controller.ts` (+ `polar-webhook.controller.spec.ts`)
- `polar.types.ts`
- `polar.module.ts`
- `index.ts`

## Schema reference (§2 enums used — NONE added)
All enums already exist in `prisma/schema.prisma` (owned by PR-HK-0); this PR adds
nothing to the schema.
- `WearableProvider.POLAR`
- `WearableMetricType`: WORKOUT_DURATION_MIN, WORKOUT_DISTANCE_M, HEART_RATE_BPM,
  SLEEP_TOTAL_MIN, SLEEP_REM_MIN, SLEEP_DEEP_MIN, SLEEP_LIGHT_MIN, SLEEP_AWAKE_MIN,
  SLEEP_EFFICIENCY_PCT, RECOVERY_SCORE, HRV_MS
- `WearableMetricBucket`: HEALTH_FITNESS, SLEEP_RECOVERY
- `WearableProcessedEvent` (composite PK `[provider, provider_event_id]`,
  `handler_completed_at`) — read/write via existing model only.

## Per-metric normalization table (AGENT_2_CODING_PLAN §3.1)
| Source resource | Provider field | Canonical metric | Unit | Bucket | Conversion |
|---|---|---|---|---|---|
| `exercises` | `duration` (ISO-8601, e.g. `PT2H44M45S`) | WORKOUT_DURATION_MIN | min | HEALTH_FITNESS | parse ISO-8601 duration → round to minutes |
| `exercises` | `distance` | WORKOUT_DISTANCE_M | m | HEALTH_FITNESS | passthrough (metres) |
| `exercises` | `heart-rate.average` | HEART_RATE_BPM | bpm | HEALTH_FITNESS | passthrough |
| `sleep` | `light_sleep`+`deep_sleep`+`rem_sleep` (sec) | SLEEP_TOTAL_MIN | min | SLEEP_RECOVERY | sum seconds → minutes |
| `sleep` | `rem_sleep` (sec) | SLEEP_REM_MIN | min | SLEEP_RECOVERY | seconds → minutes |
| `sleep` | `deep_sleep` (sec) | SLEEP_DEEP_MIN | min | SLEEP_RECOVERY | seconds → minutes |
| `sleep` | `light_sleep` (sec) | SLEEP_LIGHT_MIN | min | SLEEP_RECOVERY | seconds → minutes |
| `sleep` | `total_interruption_duration` (sec) | SLEEP_AWAKE_MIN | min | SLEEP_RECOVERY | seconds → minutes |
| `sleep` | *derived* | SLEEP_EFFICIENCY_PCT | % | SLEEP_RECOVERY | asleep / (asleep + interruptions) × 100, 1 dp |
| `nightly-recharge` | `nightly_recharge_status` (1–6) | RECOVERY_SCORE | score | SLEEP_RECOVERY | passthrough |
| `nightly-recharge` | `heart_rate_variability_avg` (ms) | HRV_MS | ms | SLEEP_RECOVERY | passthrough |

**Derivation note (efficiency):** the Polar AccessLink sleep resource exposes no
`efficiency` field. SLEEP_EFFICIENCY_PCT is derived from the asleep fraction of the
asleep+awake window — matching the "% of window not awake" semantics other providers
report directly. Dropped (no sample) when no stage data is present (#42 — no
speculative ingestion).

**Exercise window:** Polar reports `start-time` in LOCAL time with a separate
`start-time-utc-offset` (minutes). The connector composes an offset-aware UTC instant
for `startAt` and anchors `endAt = startAt + duration`. Date-keyed resources
(sleep / nightly-recharge) anchor to the UTC calendar-day span when no explicit
window exists — deterministic and tz-stable for dedup.

## Webhook idempotency mechanism
"Check → process → commit" ordering (audit pattern 1 + 6), mirroring Oura:
1. Raw-body present check (400 if absent — `rawBody: true` is wired in `main.ts`).
2. HMAC verify FIRST via `verifyWebhook` (single 401 on any failure).
3. Zod parse/validate (400 on malformed; field paths only, never the payload).
4. `PING` liveness event → plain 200, no fetch, no dedup row.
5. Replay check: `wearableProcessedEvent.findUnique` on `(POLAR, providerEventId)`
   → present means fully processed → 200 no-op.
6. Resolve connection by `external_account_id` (Polar numeric `user_id` as string),
   `fetchChangedRecord` (single resource via the event `url`, SSRF-guarded), normalize,
   batch `ingestion.ingest` (no N+1, #21).
7. **Only after** a successful ingest: `wearableProcessedEvent.create` with
   `handler_completed_at` in the same write. A concurrent P2002 on the composite PK is
   absorbed as a benign 200 no-op; the sample `dedup_key` UNIQUE already prevents
   double-counting.

On fetch/ingest failure: no dedup row is written (event remains reprocessable on
Polar's retry), the connection is marked `status='error'` with a redacted `last_error`,
and the error rethrows (fail-explicit, no silent swallow).

`providerEventId = event:user_id:(entity_id|date):timestamp` — stable across
redeliveries of the same change.

## Token storage (KMS)
Tokens are read off the KMS-unwrapped connection object via the transient
`decryptedAccessToken` / `decryptedRefreshToken` fields (PR-HK-1 owns the KMS unwrap
on the connection lane, same contract as Oura). The connector never reads/writes
ciphertext directly and never logs tokens. `TokenSet` returned by `exchangeCode` /
`refresh` is KMS-wrapped by PR-HK-1's `KmsService` (`src/common/kms/kms.service.ts`)
before persistence — decrypt→use→discard, encrypt→persist, never plaintext to DB/logs
(audit pattern 2). Polar access tokens are long-lived and the token endpoint issues no
refresh token, so the durable access token is persisted as the refresh credential and
`refresh()` re-presents it unchanged (no rotation grant).

## Test inventory (51 tests, 3 suites — real-value assertions, no bare toBeDefined)
- `polar.connector.spec.ts` — metadata; buildAuthUrl round-trip + missing-env throw;
  exchangeCode happy (Basic auth header + TokenSet mapping) + error + missing-token;
  refresh re-present + missing-token marks error; verifyWebhook valid / uppercase-hex /
  bad / missing-header / fail-closed-no-secret; backfill clamp+wrap / no-token throw /
  outage→status=error+redacted last_error; fetchChangedRecord url-trust / SSRF-reject+
  reconstruct / PING→[]; eventId entity & date subjects; redactErrorMessage.
- `polar.normalizer.spec.ts` — ISO-8601 duration parser; exercises full mapping +
  offset-aware window + partial-drop + unanchorable-skip + dedup_key; sleep full mapping
  + derived efficiency + explicit window + day fallback + drop-when-no-stages;
  nightly-recharge mapping + dedup_keys + null-drop; batch + non-Polar-payload skip +
  unknown-resource→[].
- `polar-webhook.controller.spec.ts` — bad signature→401 (no DB) / missing rawBody→400;
  non-JSON→400; non-PING missing user_id→400 / missing entity_id&date→400; PING→200
  no-op; replay→200 no-op; concurrent P2002→200 no-op (fetch+ingest already ran); first
  delivery ordering (ingest before commit) + connection lookup; fetch failure → no
  dedup row + connection error + rethrow; no-connection→200 + records event.

Total backend wearables suite: **323 tests / 20 suites, all passing** (Polar adds 51).

## Five gate results — ALL PASS
| Gate | Command | Result |
|---|---|---|
| 1 | `npx prisma validate` | PASS (valid; requires DATABASE_URL/DIRECT_URL env present) |
| 2 | `npx tsc --noEmit` | PASS (no errors) |
| 3 | `npx eslint src/wearables/connectors/polar/` | PASS (0 errors) |
| 4 | `npx jest --roots src/wearables --runInBand` | PASS — 323/323 across 20 suites (executed in memory-bounded chunks in the sandbox; single-process run exceeded the sandbox RAM ceiling, not a test failure). Polar subset 51/51. |
| 5 | `npx nest build` | PASS (exit 0) |

## Final
- **Final SHA:** `ef79c47ffe1a9a716fdd94a9960280321eab9d55`
- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/351
