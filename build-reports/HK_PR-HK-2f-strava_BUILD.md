# PR-HK-2.f — Strava connector (OAuth + webhook + normalizer) — BUILD REPORT

**Builder:** Dynasia G <dynasia@trygrowthproject.com>
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Base:** `main` @ `9c67444c`
**Branch:** `hk/PR-HK-2f-strava-connector`
**PR:** [#347](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/347)
**Head SHA:** `fbd0f5e84ac731e575ef482002553f3026848b53`

---

## Scope (write-set — file-disjoint mutex under `src/wearables/connectors/strava/`)

All 9 files are new and live ENTIRELY under `src/wearables/connectors/strava/`.
No edits to `wearables.module.ts` or `connector-registry.ts` (verified clean).

| File | Purpose |
| --- | --- |
| `strava.types.ts` | Strava-native types: `StravaActivity`, `StravaWebhookEvent`, `StravaWebhookVerifyQuery`, `StravaTokenResponse`, `STRAVA_SCOPES` |
| `strava.normalizer.ts` (+ `.spec.ts`) | `activities` → 5 H&F metrics; `computeStravaDedupKey` |
| `strava.connector.ts` (+ `.spec.ts`) | `WearableConnector`: OAuth2, backfill (paged + header throttle), refresh rotation |
| `strava-webhook.controller.ts` (+ `.spec.ts`) | GET subscription challenge + POST push events (+ `StravaActivityFetchQueue` facade) |
| `strava.module.ts` | `StravaConnectorModule` wiring controller + connector + fetch queue |
| `index.ts` | public barrel |

## Commits (Dynasia G, empty bodies, no trailers/co-authors)

1. `22d76eb` feat(wearables): PR-HK-2.f — Strava types + normalizer
2. `94471d6` feat(wearables): PR-HK-2.f — Strava connector (OAuth + backfill + refresh rotation)
3. `d9b13f4` feat(wearables): PR-HK-2.f — Strava webhook controller (challenge + events)
4. `fbd0f5e` feat(wearables): PR-HK-2.f — Strava module + connector definition export

> Note: the two small fixes that surfaced at the build/lint gate (a `Record<StravaMetric,string>`
> narrowing in the normalizer for `--strict` index-safety, and removing an unused import in the
> connector) were folded into commit 4 since both files are inside the same write-set. The four
> commit subjects still map to the four logical units.

## Implementation notes

### Normalizer (per AGENT_2_CODING_PLAN §3.1, H&F only)
`activities` →
- `WORKOUT_DURATION_MIN` = `moving_time / 60` (unit `min`)
- `WORKOUT_DISTANCE_M` = `distance` (unit `m`)
- `ACTIVE_ENERGY_KCAL` = `calories` (unit `kcal`, detailed-activity only → emitted only when present)
- `TRAINING_LOAD` = `suffer_score` (preferred) or `training_load` alias (unit `score`)
- `HEART_RATE_BPM` = `average_heartrate` (unit `bpm`, HR activities only)

All five → `HEALTH_FITNESS` bucket. Window = `[start_date, start_date + moving_time)` in UTC;
`timezone` threaded to `sourceTz`. Metrics with an absent source field are DROPPED (no fabricated
zeros, guard #42). Records with an unparseable/missing `start_date` are skipped.

**Dedup key (spec):** `sha256("strava:" + userId + ":" + metric + ":" + startIso + ":" + value)`,
attached to each sample's `rawRef` as provenance.

Sample dedup_key (golden vector, `user-123`, `2024-01-02T07:30:00.000Z`):
- `HEART_RATE_BPM` value `148.6` → `dfc33cc483c4ad36dac61ee4fef145d58c9cf0a36b36234c5166ec00ecc17d87`
- `WORKOUT_DURATION_MIN` value `60` → `0cea243d5b0c835fd5b960b7f27f3c695cd6b5b685d188967aae94fccc1cc480`

### Connector
- `provider='STRAVA'`, `authModel='oauth2'`.
- `buildAuthUrl`: `https://www.strava.com/oauth/authorize` with `client_id`, `response_type=code`,
  `redirect_uri`, `approval_prompt=auto`, `scope=activity:read_all,profile:read_all`, `state`.
- `exchangeCode` / `refreshAccessToken`: `POST https://www.strava.com/oauth/token`. **Refresh-token
  rotation** — the response's `refresh_token` (which Strava changes each refresh) is returned in the
  `TokenSet` for the connection layer to persist.
- `backfill`: `GET .../api/v3/athlete/activities?per_page=200&page=N&after=<unix>`, pages until a
  short page / page cap (100) / header-driven throttle. Reads `X-RateLimit-Limit` +
  `X-RateLimit-Usage` ("fifteenMin,daily") and pauses at ≥90% of either window. All I/O via
  `ProviderHttpClient` (timeout + capped jittered backoff, fail-loud).
- `normalize(raw)` (interface method) throws if called with records but no connection context — the
  sync worker calls `normalizeStravaActivities(userId, connectionId, raw)` directly (Strava raw
  records carry no subject user id). Returns `[]` for empty input.

### Webhook controller (`/v1/wearables/webhooks/strava`)
- **GET** subscription verification: echoes `{ "hub.challenge": <nonce> }` iff `hub.mode=subscribe`
  and `hub.verify_token === STRAVA_WEBHOOK_VERIFY_TOKEN`; else 403 (also 403 if token unconfigured).
- **POST** events (Strava has **NO HMAC** — three controls instead):
  1. Source-IP allow-list — defaults to documented/observed AWS us-east-1 egress IPs
     (`54.173.232.159`, `54.227.82.103`, `52.55.245.219`), overridable via
     `STRAVA_WEBHOOK_ALLOWED_IPS` (comma-separated; `*` disables for trusted-proxy mode). Uses
     leftmost `X-Forwarded-For` hop else socket address.
  2. `subscription_id` must equal `STRAVA_WEBHOOK_SUBSCRIPTION_ID`.
  3. Idempotency via `WearableProcessedEvent` (provider=`STRAVA`,
     `provider_event_id = ${object_type}:${object_id}:${event_time}`), `createMany(skipDuplicates)`
     → redelivery is a no-op (Strava retries 3×).
- First-time `activity` `create`/`update` → `StravaActivityFetchQueue.enqueueActivityFetch` (Strava
  events carry no payload). ACK is synchronous; fetch is async (repo's durable row+cron queue
  pattern). `@Public()` + `@Throttle`.

### Env vars introduced (config over hardcode, #18)
`STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`,
`STRAVA_WEBHOOK_VERIFY_TOKEN`, `STRAVA_WEBHOOK_SUBSCRIPTION_ID`, `STRAVA_WEBHOOK_ALLOWED_IPS` (opt).

## Gates

| Gate | Command | Result |
| --- | --- | --- |
| Build | `npx nest build` | ✅ exit 0 |
| Types | `npx tsc --noEmit` | ✅ 0 errors (baseline on main also 0; no new errors in `strava/`) |
| Lint | `npx eslint "src/wearables/connectors/strava/**/*.ts"` | ✅ 0 errors, 0 warnings |
| Tests (Strava) | `npx jest --roots src/wearables/connectors/strava` | ✅ **3 suites, 44/44** |
| Tests (full wearables, regression) | `npx jest --roots src/wearables` | ✅ **6 suites, 96/96** |

**Test breakdown (44):** normalizer **11**, connector **19**, webhook **14**.
Representative assertions: normalizer pins exact 64-char sha256 dedup vectors + exact value/unit per
metric + drop-on-absent + tz-invariance; connector asserts exact auth-URL params, token exchange,
**refresh-token rotation** (new ≠ old), backfill paging (full→short page, empty page, bearer header,
`after` param) and header-driven pause; webhook asserts challenge echo vs 403, IP allow-list
(block / `*` / default), foreign `subscription_id` 403, malformed 400, dedup no-op on redelivery,
and enqueue-on-first-activity (not on delete/athlete).

> Specs are co-located in `src/`; `jest.config.js` sets `roots: ['<rootDir>/test']`, so the
> canonical invocation is `npx jest --roots src/wearables/connectors/strava` (same as PR-HK-0).
> A stale jest cache transiently mis-reported a `WearableProvider` import in the webhook spec;
> `--no-cache` confirms a clean 44/44.

## Deviations

1. **Interface name.** The task says "implements `ConnectorDefinition`"; the foundation
   (PR-HK-0) ships the contract as **`WearableConnector`** in `connector.interface.ts`. Implemented
   against the real interface. Method names also follow the foundation: `buildAuthUrl`/`exchangeCode`/
   `refresh`/`backfill`/`normalize` (the task's `refreshAccessToken(refreshToken)` is provided as an
   additional public method and `refresh(conn)` delegates to it).
2. **Dedup key — two keys, both correct.** The connector-level spec key
   (`sha256(strava:user:metric:start:value)`) is implemented as `computeStravaDedupKey` and attached
   to `rawRef` for per-sample provenance. The DB-unique key the ingestion lane actually writes is the
   foundation's `computeDedupKey` (`sha256(user|provider|metric|start_iso|end_iso)`, PR-HK-0) — the
   connector does NOT override it. Documented inline.
3. **`StravaActivityFetchQueue`.** The repo ships no BullMQ; per the established `LeadSyncQueue`
   pattern the enqueue is a thin facade (durable row+cron is the transport). The actual fetch worker
   is PR-HK-3 (out of this write-set).
4. **Webhook IP allow-list.** Strava publishes no stable CIDR list; defaults are the documented/
   observed AWS us-east-1 egress IPs, overridable via env (incl. `*` for trusted-proxy deployments).
   Documented in code.
5. **Commit folding.** Two gate-driven fixes folded into commit 4 (same write-set) — see Commits note.
