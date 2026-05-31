# Build Report — PR-HK-2.l — WHOOP connector (OAuth + webhook + normalizer)

- **PR:** [#350](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/350)
- **Repo:** `BradleyGleavePortfolio/growth-project-backend`
- **Base:** `main` @ `9c67444c` (PR-HK-0 foundation)
- **Branch / head:** `hk/PR-HK-2l-whoop-connector` @ `35f66dd0f87270d5e187cd6732e20a4705b3a0e5`
- **Author:** Dynasia G <dynasia@trygrowthproject.com> (no trailers, no co-authors)
- **Builder:** Agent HK (builder ≠ auditor, R31/R32)

## Scope

WHOOP API v2 cloud connector following the Oura (PR-HK-2.k) pattern, adapted to
WHOOP v2: UUID record ids, OAuth2 `offline` scope (rotating refresh token), v2
webhooks (UUID event ids, revoke stops delivery). Spec source:
`AGENT_2_CODING_PLAN.md` §3 PROVIDER_MATRIX (WHOOP row, line 394) + §3.1
normalizer mapping (line 409). WHOOP v2 field shapes verified against
[developer.whoop.com/api](https://developer.whoop.com/api/) (recovery
`score.recovery_score`/`hrv_rmssd_milli`/`resting_heart_rate`, cycle
`score.strain`, sleep `score.stage_summary.*_milli` + `sleep_efficiency_percentage`,
workout `start`/`end`/`score.distance_meter`, pagination `next_token`).

## Write-set (file-disjoint mutex — all under `src/wearables/connectors/whoop/`)

| File | Purpose |
| --- | --- |
| `whoop.types.ts` | WhoopRecovery/Cycle/Workout/Sleep/Profile/BodyMeasurement (UUID ids), paginated envelope, v2 webhook payload + signature header names |
| `whoop.normalizer.ts` (+ `.spec.ts`) | WHOOP v2 → NormalizedSample per §3.1; ms→min conversion; `whoopDedupKey` (`sha256(whoop:user_id:metric:start_at:value)`) |
| `whoop.connector.ts` (+ `.spec.ts`) | `WearableConnector` impl: provider=WHOOP, authModel=oauth2, buildAuthUrl, exchangeCode, refresh/refreshAccessToken (rotation), backfill (paged ≤30d via next_token through ProviderHttpClient), verifyWebhook (HMAC SHA256, constant-time), parseWebhook |
| `whoop-webhook.controller.ts` (+ `.spec.ts`) | `POST /v1/wearables/webhooks/whoop` — raw-body HMAC verify FIRST → 401; dedup via WearableProcessedEvent (provider=WHOOP, event UUID); throttled; revocation → status='disconnected' |
| `whoop.module.ts` | Self-contained Nest module (imports WearablesModule, mounts controller, provides connector) |
| `index.ts` | Barrel export |

**No edits** to `wearables.module.ts` or any connector registry (same isolation
pattern as Oura — integration PR wires it with a one-line shared edit).

## Implementation conformance to interface

The PR-HK-0 foundation interface is `WearableConnector` (not `ConnectorDefinition`)
with `authModel` (not `authType`). The connector implements it exactly:
`provider`, `authModel='oauth2'`, `buildAuthUrl`, `exchangeCode`, `refresh`,
`backfill`, `normalize`, `verifyWebhook`, `parseWebhook`. Task-spec method names
`verifyWebhookSignature` / `refreshAccessToken` are satisfied by
`verifyWebhook(RawWebhookRequest)` (interface) + a public `refreshAccessToken(token)`
helper (used by `refresh(conn)`).

## Normalizer mapping (per AGENT_2_CODING_PLAN §3.1)

- `recovery.score.recovery_score` → RECOVERY_SCORE (score, SLEEP_RECOVERY)
- `recovery.score.hrv_rmssd_milli` → HRV_MS (ms, S&R)
- `recovery.score.resting_heart_rate` → RESTING_HEART_RATE_BPM (bpm, S&R)
- `cycle.score.strain` → STRAIN_SCORE (score, S&R — bucket per PR-HK-0 seed)
- `sleep.score.stage_summary.total_in_bed_time_milli` → SLEEP_TOTAL_MIN (min)
- `...total_rem_sleep_time_milli` → SLEEP_REM_MIN (min)
- `...total_slow_wave_sleep_time_milli` → SLEEP_DEEP_MIN (min)
- `...total_light_sleep_time_milli` → SLEEP_LIGHT_MIN (min)
- `...total_awake_time_milli` → SLEEP_AWAKE_MIN (min)
- `sleep.score.sleep_efficiency_percentage` → SLEEP_EFFICIENCY_PCT (%)
- `workout` → WORKOUT_DURATION_MIN (from window) + WORKOUT_DISTANCE_M (HEALTH_FITNESS)

Milliseconds → minutes (`/60000`). All timestamps treated as UTC; `sourceTz='UTC'`.
PENDING_SCORE/UNSCORABLE records and naps are dropped (no speculative ingestion, #42).

## Dedup keys (samples)

- **Connector key** (`whoopDedupKey`, `sha256(whoop:user_id:metric:start_at:value)`),
  for recovery RECOVERY_SCORE user_id=99 start=2026-05-20T08:00:00.000Z value=66:
  `70f1e2d7c5cc1a70f587e981f5198824444cf3f665124f5f3860764e9878a2ec`
- **Foundation row dedup_key** (`computeDedupKey`, `sha256(user|provider|metric|start_iso|end_iso)`)
  for the same sample (userId=user-uuid-1):
  `d42b5482bbf1e75315749f89794e9bf5162aebed411584ae47d071aab8637cde`

## Webhook security

`verifyWebhook` computes `base64(HMAC-SHA256(timestamp + rawBody, clientSecret))`
keyed by `WHOOP_WEBHOOK_SECRET` (falls back to `WHOOP_CLIENT_SECRET`), compares
against `X-WHOOP-Signature` with `timingSafeEqual` (constant-time), and rejects
stale signatures (>300s via `X-WHOOP-Signature-Timestamp`). The controller verifies
BEFORE any JSON parse, dedups on the event UUID via `WearableProcessedEvent`
(replay = 200 `duplicate:true`), and on `user.deauthorized` soft-disconnects the
matching connection (`status='disconnected'`, `disconnected_at`).

## Gates (all pass)

| Gate | Result |
| --- | --- |
| `tsc --noEmit` (full project) | clean (0 errors) |
| `eslint src/**/*.ts` | 0 errors (15 pre-existing warnings, unrelated) |
| `jest` (WHOOP suites) | **34 passed / 3 suites** (normalizer 13, connector 16, webhook 5*) |
| `nest build` | success (exit 0) |
| Full `jest` regression | 3945 passed; the only 3 failing suites (`module-graph`, `openapi-spec`, `roles-enforced`) **fail identically on clean `origin/main`** — pre-existing baseline, NOT introduced by this PR |

\*Test count by file: `whoop.normalizer.spec.ts`, `whoop.connector.spec.ts`,
`whoop-webhook.controller.spec.ts` — 34 total. Coverage: real-value normalizer
mappings → exact expected outputs, bad-signature/wrong-secret/stale → reject (401
path), missing headers → reject, replay no-op (duplicate), revocation disconnect,
OAuth token rotation, paged backfill following `next_token`.

## Deviations from task brief

1. **Interface naming.** Task said `ConnectorDefinition` / `authType`; the actual
   PR-HK-0 foundation interface is `WearableConnector` / `authModel`. Implemented
   against the real interface (verified in `connector.interface.ts`).
2. **Spec-file discovery.** Repo jest config has `roots: ['<rootDir>/test']`, so
   co-located `src/**/*.spec.ts` (including PR-HK-0's own foundation specs) are not
   auto-discovered by the default `jest` run. Per the write-set / Oura pattern, the
   WHOOP specs are kept under `src/wearables/connectors/whoop/` and verified green
   via `jest --roots '<rootDir>/src/wearables/connectors/whoop'`. Wiring them into
   the default run (or `test/`) is an integration-PR concern, same as Oura.
3. **Prettier** is not a project dependency (formatting is enforced via ESLint,
   which passes); no separate prettier gate was run.
4. **STRAIN_SCORE bucket** is `SLEEP_RECOVERY` per the PR-HK-0 `WearableMetricDef`
   seed (matches the "(S&R)" annotation in §3.1), not HEALTH_FITNESS.
5. **WORKOUT_DURATION_MIN** is derived from the workout window (`end - start`) since
   WHOOP v2 has no native duration field; distance comes from `score.distance_meter`.

## Build artifacts

- Worktree: `/home/user/workspace/wk-hk-2l` (removed at end per cleanup step).
- Commits (4, empty body, author Dynasia G):
  1. `8869535` feat(wearables): PR-HK-2.l — WHOOP types + normalizer
  2. `ab69fc0` feat(wearables): PR-HK-2.l — WHOOP connector (OAuth + backfill + refresh)
  3. `ab87be0` feat(wearables): PR-HK-2.l — WHOOP webhook controller
  4. `35f66dd` feat(wearables): PR-HK-2.l — WHOOP module + connector definition export
