# PR-HK-2.h — Wahoo Connector — BUILD REPORT

**Branch:** `hk/PR-HK-2.h-wahoo`
**Final SHA:** `80ae203eef5af86f6b711db4d18c9345e0fc3408`
**PR:** [#354](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/354)
**Author (every commit):** Dynasia G \<dynasia@trygrowthproject.com\>

---

## 1. Brief

Build the Wahoo Cloud API connector (`PR-HK-2.h`) implementing the PR-HK-0
`WearableConnector` contract: OAuth2 authorization-code flow, paged backfill,
refresh-token rotation, a HMAC-verified workout webhook, and a §3.1 normalizer.
Wahoo is a **HEALTH & FITNESS**-only provider. The connector is strictly
file-disjoint inside `src/wearables/connectors/wahoo/` and contributes itself to
the connector registry via DI multi-injection without editing any shared file.

Provider research source: Wahoo Cloud API docs (https://cloud-api.wahooligan.com).

---

## 2. Write-set (files created — all under `src/wearables/connectors/wahoo/`)

| File | Purpose |
|---|---|
| `wahoo.types.ts` | Provider-native shapes: `WahooWorkout`, `WahooWorkoutSummary` (numeric fields are STRINGS), `WahooTokenResponse`, `WahooWebhookEvent`, `WAHOO_SCOPES`. |
| `wahoo.normalizer.ts` | Pure `normalizeWahoo` / `normalizeWahooWorkout` — §3.1 mapping → canonical samples. |
| `wahoo.normalizer.spec.ts` | 10 normalizer tests. |
| `wahoo.connector.ts` | `WahooConnector` (`@Injectable`), `createWahooConnector` factory, `redactErrorMessage`, `computeWahooDedupKey`, `hashForLog`. |
| `wahoo.connector.spec.ts` | 24 connector tests. |
| `wahoo-webhook.controller.ts` | `POST /v1/wearables/webhooks/wahoo` receiver. |
| `wahoo-webhook.controller.spec.ts` | 7 controller tests. |
| `wahoo.module.ts` | Self-contained `WahooModule` + `WEARABLE_CONNECTORS` multi-inject contribution. |
| `index.ts` | Public surface + `wahooConnectorDef` registry contribution. |

**Did NOT edit** (binding do-not-touch list): `wearables.module.ts`,
`connector-registry.ts`, `prisma/schema.prisma`, `connector.interface.ts`,
`ingestion.service.ts`, any other connector folder. No file outside the
write-set required changing.

---

## 3. Schema reference (§2 enums used — nothing added)

- `WearableProvider.WAHOO` — already present in `prisma/schema.prisma`.
- `WearableMetricType`: `WORKOUT_DURATION_MIN`, `WORKOUT_DISTANCE_M`, `HEART_RATE_BPM` — all pre-existing.
- `WearableMetricBucket.HEALTH_FITNESS` — pre-existing.
- `WearableProcessedEvent` — composite PK `(provider, provider_event_id)`; `findUnique` keyed via `provider_provider_event_id`. Used unchanged for webhook idempotency.
- `WearableConnection` — `status` / `last_error` set on provider outage via `update`.

No migration, no schema edit.

---

## 4. Per-metric normalization (§3.1)

| Wahoo source field | Type on wire | Canonical metric | Unit | Bucket |
|---|---|---|---|---|
| `workout.minutes` | JSON number | `WORKOUT_DURATION_MIN` | `min` | `HEALTH_FITNESS` |
| `workout_summary.distance_accum` | string e.g. `"24909.71"` (meters) → `parseFloat` | `WORKOUT_DISTANCE_M` | `m` | `HEALTH_FITNESS` |
| `workout_summary.heart_rate_avg` | string e.g. `"124.23"` (bpm) → `parseFloat` | `HEART_RATE_BPM` | `bpm` | `HEALTH_FITNESS` |

Rules:
- A metric is emitted ONLY when its source field is present AND parses to a finite number. Absent/empty/non-numeric → dropped, never a fabricated `0` (#42).
- Window: `starts` is the UTC ISO start; `endAt = startAt + minutes * 60_000` (instantaneous, `endAt == startAt`, when `minutes` absent/zero). `workout_summary.time_zone` (IANA) → `sourceTz`.
- `sourceRecordId` = Wahoo workout `id` as a string (backfill reconciliation).
- Unparseable `starts` → the whole workout is skipped (#8 fail-safe at the boundary).

---

## 5. Webhook idempotency mechanism

`POST /v1/wearables/webhooks/wahoo`, `@Public`, throttled `{ttl:60_000, limit:500}`.

Ordering (audit pattern #1 — check → process → commit):
1. Require `req.rawBody` Buffer → `400` if absent (raw-body middleware not wired).
2. `connector.verifyWebhook()` — HMAC-SHA256 over `x-wahoo-timestamp + rawBody` keyed by `WAHOO_WEBHOOK_SECRET` (falls back to `WAHOO_CLIENT_SECRET`) compared constant-time against `x-wahoo-signature` (hex), AND the documented `webhook_token` field. Any failure → single `401`. Fails CLOSED if the secret is unset (audit pattern #5).
3. Strict Zod parse (`.strict()` top-level; nested summary/user `.passthrough()`) → `400` on malformed/unknown top-level keys, reporting field PATHS only (no payload echo, audit pattern #4).
4. Idempotency: `wearableProcessedEvent.findUnique({ provider_provider_event_id: { provider: WAHOO, provider_event_id } })`. A present row proves a prior FULL completion → `200` no-op.
5. Resolve connection by Wahoo `user.id` (`external_account_id`, `disconnected_at: null`), extract the embedded changed workout from `workout_summary.workout`, normalize, batch-ingest (no N+1, #21).
6. **COMMIT only after** successful normalize+ingest: `wearableProcessedEvent.create({ ..., handler_completed_at: now })`. A concurrent `P2002` on the composite PK is absorbed as a benign `200` no-op (sample `dedup_key` UNIQUE already prevents double-counting).

`providerEventId` = `event_type:workout_summary.id:workout.id:updated_at` — stable across redeliveries of the same change.

On ingest failure the connection is marked `status='error'` (redacted `last_error`), a hashed-user-id log line is emitted, and the error is rethrown so Wahoo retries; no processed-event row is written, so the retry reprocesses.

---

## 6. Token storage (KMS)

Per the PR-HK-0 contract, the connector NEVER persists tokens itself — it
returns a `TokenSet` from `exchangeCode()` / `refresh()` and the PR-HK-1
connection layer KMS-wraps it (`KmsService`) before storage (audit pattern #2:
decrypt → use → discard; encrypt → persist; never plaintext to DB/logs). The
connector reads the transient decrypted access/refresh token off the
`WearableConnection` (narrow cast `decryptedAccessToken` / `decryptedRefreshToken`
or `refresh_token`) supplied by the token lane and never logs it.

**Refresh rotation:** Wahoo rotates the refresh token (the prior access+refresh
pair is revoked once the new access token is used, like Strava). `refresh()`
returns the new `refreshToken` in the `TokenSet`; it falls back to the prior
token only if the provider omits a new one, and `toTokenSet` throws if neither
is present (fail-loud, never persists an empty refresh token, #1/#12).

---

## 7. Test inventory (41 Wahoo tests; full `src/wearables` suite 313 tests / 20 suites — all pass)

**`wahoo.normalizer.spec.ts` (10):** duration mapping (value/unit/bucket/window/sourceTz/sourceRecordId); distance string→float; heart-rate string→float; exact 3-metric set; absent fields skipped (no zeros); non-finite strings dropped; instantaneous window when minutes absent; unparseable start → `[]`; batch skips malformed payloads; empty batch.

**`wahoo.connector.spec.ts` (24):** metadata (WAHOO + `oauth2`); `buildAuthUrl` round-trip (all params + scope + state) + fail-loud on missing env; `exchangeCode` happy (token/expiry/account/scopes) + error (redacted); `refresh` rotation (returns NEW token) + fallback + 401→`status='error'` + missing-token throw; `backfill` single short page + multi-page pagination (bearer auth, `page=2`) + outage→`status='error'` + no-access-token throw; `verifyWebhook` valid HMAC+token / tampered body / wrong token / fail-closed no-secret / missing header; `parseWebhook`/`eventId` stable id; `extractWorkoutRecords` happy + empty; `redactErrorMessage`; `computeWahooDedupKey` determinism; `hashForLog`.

**`wahoo-webhook.controller.spec.ts` (7):** invalid signature → `401` (no ingest/no commit); missing raw body → `400`; malformed strict-Zod → `400`; valid first delivery → normalize→ingest→commit (commit after ingest, correct PK); duplicate event → `200` no-op; concurrent `P2002` → benign `200`; no-connection path still commits.

Real-value assertions throughout (no bare `.toBeDefined()`).

---

## 8. Five gate results (ALL PASS)

| Gate | Command | Result |
|---|---|---|
| 1 | `npx prisma validate` | PASS — "The schema is valid" (with DB env present). |
| 2 | `npx tsc --noEmit` | PASS — exit 0, 0 errors. |
| 3 | `npx eslint src/wearables/connectors/wahoo/` | PASS — exit 0, 0 errors. |
| 4 | `npx jest --roots src/wearables --runInBand` | PASS — 20 suites / 313 tests pass (41 new Wahoo). |
| 5 | `npx nest build` | PASS — exit 0. |

---

## 9. Deviations (documented)

1. **`authModel`:** The dispatch brief quoted `authModel: 'oauth2_code'`, but the
   actual un-editable `connector.interface.ts` only defines
   `WearableAuthModel = 'oauth2' | 'sdk-native' | 'on-device'`. To compile
   against the real interface (and to match Strava/Oura/Whoop) the connector
   declares `authModel: 'oauth2'`.
2. **Webhook auth control:** Wahoo's public docs use a shared `webhook_token`
   field ("any request that doesn't include this token should be ignored"),
   NOT an HMAC header. The binding brief mandates "HMAC-SHA256 signature." The
   connector therefore verifies BOTH — a constant-time HMAC-SHA256 over
   `x-wahoo-timestamp + rawBody` (keyed by `WAHOO_WEBHOOK_SECRET`, fallback
   `WAHOO_CLIENT_SECRET`) matching `x-wahoo-signature`, AND the documented
   `webhook_token` (enforced when `WAHOO_WEBHOOK_TOKEN` is configured) — and
   fails closed if no secret is set.

---

## 10. Final SHA + PR

- **Final SHA:** `80ae203eef5af86f6b711db4d18c9345e0fc3408`
- **PR:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/354
- **Branch:** `hk/PR-HK-2.h-wahoo`
