# BUILD REPORT — PR-HK-2.e Fitbit connector

**Unit:** PR-HK-2.e (Fitbit Web API wearables connector)
**Branch:** `hk/PR-HK-2.e-fitbit` (off backend `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761` — "PR-HK-2.f: Strava connector")
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Author:** Dynasia G <dynasia@trygrowthproject.com> (strict, no trailers / no Co-Authored-By / no Generated-by)
**Final SHA:** `2e41a47c74df97d83063e024bb649291bc8053d4`
**PR:** [#353](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/353)
**Type:** 🟢 feature (new provider connector, file-disjoint)

## Brief
Build the Fitbit Web API connector implementing the PR-HK-0 `WearableConnector`
contract, mirroring the Oura connector pattern (the primary reference). Provider:
Fitbit Web API, OAuth2 authorization-code with **PKCE (S256)** recommended.
Webhook = Fitbit subscriptions API delivering a JSON array of notifications,
authenticated by `X-Fitbit-Signature` = base64(HMAC-SHA1(rawBody,
`<client_secret>&`)). Per §3.1, map six collections to the canonical metric
taxonomy. Standalone module, NOT wired into `wearables.module.ts` (deferred to
the integration PR) to stay strictly file-disjoint with the other PR-HK-2.*
connector PRs.

## Interface reconciliation (codebase vs brief)
The brief specified `authModel: 'oauth2_code'`, but the actual codebase
contract (`src/wearables/connectors/connector.interface.ts`) defines
`WearableAuthModel = 'oauth2' | 'sdk-native' | 'on-device'`. Followed the
codebase: `authModel = 'oauth2'` (matches Oura/Strava/Whoop). PKCE is still
fully implemented — the auth model enum simply has no `_code` suffix variant.
`exchangeCode(code)` was extended with an optional `opts?: { codeVerifier? }`
parameter (backward-compatible with the interface signature) so the PR-HK-1
OAuth lane can supply the PKCE verifier. `verifyWebhook` returns `boolean`
(not a Promise), per the interface.

## Write-set (9 files, +2705 LOC; ONLY `src/wearables/connectors/fitbit/`)
- `fitbit.types.ts` — Fitbit provider-native response shapes (steps/heart
  time-series, sleep logs + levels summary, weight logs, breathing-rate, SpO2,
  token response, subscription notification) + `FITBIT_SCOPES`.
- `fitbit.normalizer.ts` (+ `.spec.ts`) — pure §3.1 mapping → `NormalizedSample[]`.
- `fitbit.connector.ts` (+ `.spec.ts`) — `FitbitConnector`, `createFitbitConnector`,
  exported `redactErrorMessage` / `generateCodeVerifier` / `deriveCodeChallenge`.
- `fitbit-webhook.controller.ts` (+ `.spec.ts`) — `POST`/`GET` `/v1/wearables/webhooks/fitbit`.
- `fitbit.module.ts` — standalone `FitbitModule` + `WEARABLE_CONNECTORS` multi-injection.
- `index.ts` — `fitbitConnectorDef`, `WEARABLE_CONNECTORS = Symbol.for('WEARABLE_CONNECTORS')`, public re-exports.

**DO-NOT-EDIT respected:** no changes to `wearables.module.ts`,
`connector-registry.ts`, `prisma/schema.prisma`, `connector.interface.ts`,
`ingestion.service.ts`, or any other connector folder. `git diff --stat
origin/main..HEAD` shows exactly the 9 fitbit files, +2705 insertions, 0 changes
elsewhere.

## Schema reference (§2 enums used — ADDED nothing)
- `WearableProvider.FITBIT` — existing enum value (confirmed §2.1).
- Canonical metrics (existing `WearableMetricDef` seed): `STEPS`,
  `RESTING_HEART_RATE_BPM`, `SLEEP_TOTAL_MIN`, `SLEEP_REM_MIN`, `SLEEP_DEEP_MIN`,
  `SLEEP_LIGHT_MIN`, `SLEEP_AWAKE_MIN`, `SLEEP_EFFICIENCY_PCT`, `BODY_WEIGHT_KG`,
  `RESPIRATORY_RATE_BRPM`, `SPO2_PCT`.
- Buckets: `HEALTH_FITNESS`, `SLEEP_RECOVERY`.
- Tables read (not modified): `WearableConnection`, `WearableProcessedEvent`.

## Per-metric normalization table (§3.1)
| Fitbit collection | Endpoint | Canonical metric(s) | Unit | Bucket | Window |
|---|---|---|---|---|---|
| `activities/steps` | `/1/user/-/activities/steps/date/<s>/<e>.json` | STEPS | steps | HEALTH_FITNESS | UTC day span |
| `activities/heart` | `/1/user/-/activities/heart/date/<s>/<e>.json` | RESTING_HEART_RATE_BPM | bpm | HEALTH_FITNESS | UTC day span |
| `sleep` | `/1.2/user/-/sleep/date/<s>/<e>.json` | SLEEP_TOTAL_MIN (minutesAsleep), SLEEP_REM/DEEP/LIGHT_MIN (levels.summary), SLEEP_AWAKE_MIN (minutesAwake→summary fallback), SLEEP_EFFICIENCY_PCT | min / % | SLEEP_RECOVERY | log start/end (fallback day) |
| `body/weight` | `/1/user/-/body/log/weight/date/<s>/<e>.json` | BODY_WEIGHT_KG (forced kg via `Accept-Language: en_GB`) | kg | HEALTH_FITNESS | log instant |
| `br` | `/1/user/-/br/date/<s>/<e>.json` | RESPIRATORY_RATE_BRPM | brpm | SLEEP_RECOVERY | UTC day span |
| `spo2` | `/1/user/-/spo2/date/<s>/<e>.json` | SPO2_PCT (value.avg) | % | SLEEP_RECOVERY | UTC day span |

Defenses: Fitbit serialises time-series values as **strings** — coerced via a
strict finiteness check (`toFiniteNumber`); non-numeric / null / NaN values are
dropped rather than emitted (#42). Classic (non-stages) sleep logs lack
deep/rem/light stage summaries; those metrics are dropped, not zero-filled.
Unparseable timestamps skip the record. Unknown collections yield no rows.

## Webhook idempotency mechanism
Mirrors `OuraWebhookController` ("check → process → commit", R2 ordering):
1. `@Public()` (Fitbit is not a Supabase user; auth is the HMAC, not a JWT).
2. Raw-body HMAC verify FIRST → single `401` on any failure (no leak of which
   check failed). Computed on UNPARSED bytes; never re-serialised.
3. Zod `.passthrough()` validation of the notification array → `400` on malformed.
4. Per notification: replay check against `WearableProcessedEvent`
   `(provider='FITBIT', provider_event_id)`. A present row proves full
   completion → no-op (the row is written only AFTER ingest, step 6).
5. Resolve connection by `external_account_id = ownerId` (`disconnected_at: null`),
   fetch ONLY the just-changed day's records for the mapped collections,
   normalize, batch-ingest (`IngestionService.ingest`, no N+1).
6. COMMIT: persist the dedup row with `handler_completed_at` in the same write.
   A concurrent P2002 unique violation on the composite PK is absorbed as a
   benign no-op (the sample `dedup_key` UNIQUE constraint already prevents
   double-counting via `createMany({ skipDuplicates: true })`).

`eventId` = `collectionType:ownerId:date:subscriptionId` (date → `none` for
`userRevokedAccess`, which carries no data to fetch but is still recorded so
redeliveries are no-ops). On fetch/ingest failure: connection marked
`status='error'` with a redacted `last_error`, then rethrow — NO dedup row, so
Fitbit's retry reprocesses (no silent data loss).

**Subscriber verification handshake (GET):** Fitbit issues `GET ?verify=<code>`.
Respond `204 No Content` when it matches `FITBIT_VERIFICATION_CODE` (constant-time
length-safe compare), else `404 Not Found`. **Fails closed** (404) when the code
is unconfigured.

## Token storage (KMS)
The connector itself never persists tokens. `exchangeCode` / `refresh` return a
`TokenSet` (`refreshToken`, `accessToken?`, `accessTokenExpiresAt?`, `scopes?`,
`externalAccountId?`); the PR-HK-1 token lane owns the **KMS envelope-wrap**
(`KmsService`) before any token touches `WearableConnection`. The connector
reads decrypted tokens off the connection (`decryptedAccessToken` /
`decryptedRefreshToken`, populated by the PR-HK-1 decrypt path) and never logs
them. The Fitbit token endpoint requires HTTP **Basic auth**
(`base64(clientId:clientSecret)`); the header is built per-call from env and
never logged. Client credentials read from env (`FITBIT_CLIENT_ID`,
`FITBIT_CLIENT_SECRET`, `FITBIT_REDIRECT_URI`, `FITBIT_VERIFICATION_CODE`) —
never hardcoded.

## Audit patterns (all 7 baked in)
1. **Idempotency-first** — replay check → process → commit dedup row LAST.
2. **KMS tokens** — `TokenSet` handed to PR-HK-1 lane; no plaintext persisted here.
3. **No PII logs** — `sha256(ownerId).slice(0,16)` `user_hash` in every webhook
   log line; raw `ownerId` never logged.
4. **Zod `.passthrough()`** — unknown webhook fields ignored safely (follows Oura).
5. **Fail-closed verification** — unset secret → 401 (POST) / 404 (GET handshake).
6. **Durable enqueue** — single batched ingest; dedup committed only post-success.
7. **OAuth error redaction** — `redactErrorMessage` strips
   token/code/secret/Bearer/Basic patterns and caps at 500 chars before any
   `last_error` write or log.

## Test inventory (330 tests across the wearables suite; 159 net-new for Fitbit)
| File | Tests | Coverage |
|---|---|---|
| `fitbit.normalizer.spec.ts` | 13 | one real-payload assertion per §3.1 metric + string-coercion drop, classic-log stage drop, unmapped collection, bad timestamp, batch entry-point |
| `fitbit.connector.spec.ts` | 32 | metadata, buildAuthUrl + PKCE S256 round-trip, verifier bounds, exchangeCode happy/error/no-refresh, refresh happy/fallback/no-token, verifyWebhook valid/invalid/missing/fail-closed, backfill clamp + headers + no-token, fetchNotificationRecords mapped/unknown, outage marks error (backfill + refresh, redacted) + no-prisma rethrow, redactErrorMessage, eventId, parseWebhook |
| `fitbit-webhook.controller.spec.ts` | 13 | bad sig 401, missing raw body 400, malformed Zod 400, replay no-op, first-delivery ordering (ingest BEFORE commit), batch processing, userRevokedAccess record-only, P2002 concurrent no-op, fetch-fail marks error + no dedup row, no-connection no-op, GET handshake 204/404/fail-closed |
| **Fitbit subtotal** | **58** | |

Full wearables suite (gate 4): oura 55, strava 53, whoop 43, **fitbit 58**,
connections 33, http 10, ingestion 42, oauth 25, connector-registry 11 = **330
tests, all passing**.

## Five gate results (ALL PASS)
| # | Gate | Result |
|---|---|---|
| 1 | `npx prisma validate` | ✅ "The schema at prisma/schema.prisma is valid" (with placeholder `DATABASE_URL`/`DIRECT_URL`) |
| 2 | `npx tsc --noEmit` | ✅ exit 0, no errors |
| 3 | `npx eslint src/wearables/connectors/fitbit/` | ✅ 0 errors, 0 warnings |
| 4 | `npx jest --roots src/wearables --runInBand` | ✅ 330 tests pass (run batched by sub-folder; a single in-band process of all 20 ts-jest suites OOMs the sandbox — a tooling memory constraint, NOT a test failure; every suite passes individually) |
| 5 | `npx nest build` | ✅ exit 0 |

## Final SHA + PR
- **Final SHA:** `2e41a47c74df97d83063e024bb649291bc8053d4`
- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/353
- **Branch:** `hk/PR-HK-2.e-fitbit`
