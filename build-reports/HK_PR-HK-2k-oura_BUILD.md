# Build Report — PR-HK-2.k — Oura connector (OAuth + webhook + normalizer)

- **PR:** #346 — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/346
- **Branch:** `hk/PR-HK-2k-oura-connector`
- **Base:** `main` @ `9c67444c` (PR-HK-0 foundation)
- **Head SHA:** `e9ef29695dfa3164bff54e264d2982e42a86b58f`
- **Author:** Dynasia G <dynasia@trygrowthproject.com> (all 4 commits, empty bodies, no trailers/co-authors)
- **Builder:** Agent (BUILDER role; auditor is a separate agent per R31/R32)

## Summary

Oura Cloud API v2 connector implementing the PR-HK-0 `WearableConnector`
contract: OAuth2 (authorize URL + code exchange + refresh), `x-oura-signature`
HMAC webhook with raw-body constant-time verification, ≤30-day backfill through
the hardened `ProviderHttpClient`, and a normalizer mapping Oura payloads to the
canonical metric taxonomy per `AGENT_2_CODING_PLAN.md` §3.1. Strictly
file-disjoint: every change is under `src/wearables/connectors/oura/`.

## Write-set (exactly 9 files, all under `src/wearables/connectors/oura/`)

1. `oura.types.ts` — provider-native v2 response shapes + webhook payload/headers
2. `oura.normalizer.ts` + `oura.normalizer.spec.ts`
3. `oura.connector.ts` + `oura.connector.spec.ts`
4. `oura-webhook.controller.ts` + `oura-webhook.controller.spec.ts`
5. `oura.module.ts`
6. `index.ts` (ConnectorDefinition const + registry-contribution token + wiring docs)

`git diff --name-only origin/main` = exactly these 9 files (Gate ⑤ ✅).

## Commits (4, Dynasia G, empty body)

| SHA | Subject |
| --- | --- |
| `fe26894` | feat(wearables): PR-HK-2.k — Oura types + normalizer |
| `6ac1e23` | feat(wearables): PR-HK-2.k — Oura connector (OAuth + backfill) |
| `c361791` | feat(wearables): PR-HK-2.k — Oura webhook controller |
| `e9ef296` | feat(wearables): PR-HK-2.k — Oura module + connector definition export |

(The minor lint cleanup of the webhook spec — removing an unused `Mocks`
interface — was folded into commit 4 since the webhook commit was already
pushed and R55 forbids rebase/amend of pushed history.)

## Gates — all green

| Gate | Command | Result |
| --- | --- | --- |
| ① prisma validate | `DATABASE_URL=… DIRECT_URL=… npx prisma validate` | ✅ schema valid |
| ② generate + tsc | `npx prisma generate` then `npx tsc --noEmit -p tsconfig.json` | ✅ 0 errors |
| ③ eslint | `npx eslint src/wearables/connectors/oura/` | ✅ 0 errors, 0 warnings |
| ④ jest | `npx jest --roots src/wearables --runInBand` | ✅ 6 suites, **95 tests** pass |
| ⑤ diff | `git diff --name-only origin/main` | ✅ exactly the 9 oura files |

**Test count:** 95 total (52 pre-existing PR-HK-0 + **43 new Oura**: 12
normalizer + 18 connector + 13 webhook controller). No `toBeDefined`
placeholders — every assertion checks real values (units, buckets, windows,
SHA-256 dedup keys, status codes, call counts).

## §3.1 normalizer mapping implemented

- `daily_sleep` → SLEEP_TOTAL_MIN / REM / DEEP / LIGHT / AWAKE (seconds→minutes),
  SLEEP_EFFICIENCY_PCT, and `average_hrv` → HRV_MS (S&R, `min`/`%`/`ms`).
- `daily_readiness.score` → READINESS_SCORE; `.temperature_deviation` →
  BODY_TEMP_DEVIATION_C (S&R, `score`/`°C`).
- `daily_activity.steps` → STEPS (H&F, `steps`).
- `heartrate.bpm` → HEART_RATE_BPM (H&F, `bpm`, instantaneous start==end).
- `daily_spo2.spo2_percentage(.average)` → SPO2_PCT (S&R, `%`).

Units/buckets verified verbatim against the seeded `WearableMetricDef` rows in
migration `20260531000000_wearables_foundation`. SPO2_PCT and
RESPIRATORY_RATE_BRPM both exist in the PR-HK-0 schema (SPO2_PCT mapped here;
RESPIRATORY_RATE_BRPM is not emitted by the §3.1 Oura row so it is not produced —
no speculative ingestion, #42).

## Sample dedup_key (sanity check)

Dedup key is computed by the PR-HK-0 ingestion lane via the shared
`computeDedupKey` util as `sha256(user_id|provider|metric|start_iso|end_iso)`.
For input `daily_activity { day: "2026-05-29", steps: 8421 }`,
user `11111111-1111-1111-1111-111111111111`, OURA, STEPS, window
`2026-05-29T00:00:00.000Z`..`2026-05-29T23:59:59.999Z`:

```
dedup_key(STEPS) = 038cf054a56f4a5f95c62e189b82384ffe709e7d808311192d850f29b49f8451
```

Asserted in `oura.normalizer.spec.ts`. Other anchored vectors:
- SLEEP_TOTAL_MIN (2026-05-31 day): `3e618059b58827742ba930be0f8b024b56b8c029b5600e854021a84f4303f4a4`
- HRV_MS (2026-05-31 day): `32b4328a4d1846dcfaf9486c27d3ca9ba6bdca7af62c3216caebb0bf86d14eeb`
- HEART_RATE_BPM (2026-05-31T07:30:00Z instant): `119d81fa07bd2626c9b2d06606094d5dd025fd03704ba836738986e5629dcedb`

## Registry / module wiring (DEFERRED — read carefully)

Per the task and `AGENT_2_CODING_PLAN.md` §5, connectors do **not** edit
`connector-registry.ts` (owned by PR-HK-1) and do **not** edit
`wearables.module.ts` (coordinated mutex across all PR-HK-2.* connectors).

- `oura.module.ts` is a **standalone** module. It contributes its connector into
  a `WEARABLE_CONNECTORS` multi-provider collection via
  `{ provide: WEARABLE_CONNECTORS, useExisting: OuraConnector, multi: true }`.
- `index.ts` exports `ouraConnectorDef` (a `ConnectorDefinition` const the
  registry can consume by value) and a local `WEARABLE_CONNECTORS` symbol token.
- **Wiring is deferred to a final integration PR** (PR-HK-1-wire) which adds ONE
  line to `src/wearables/wearables.module.ts`:
  `import { OuraModule } from './connectors/oura/oura.module';` and lists it in
  `imports`. The integration PR also aliases the local `WEARABLE_CONNECTORS`
  symbol to PR-HK-1's canonical registry token if they differ.

## Interface reconciliation (important — task spec vs shipped PR-HK-0)

The task brief named methods that differ from the **actually shipped** PR-HK-0
`connector.interface.ts`. I implemented against the real shipped interface
(decacorn quality requires compiling against the landed contract, not the
brief's paraphrase). Mapping of brief → shipped:

| Brief term | Shipped (`connector.interface.ts`) | Note |
| --- | --- | --- |
| `authType: 'oauth2'` | `authModel: 'oauth2'` | property renamed |
| `buildAuthorizationUrl(redirectUri, state)` | `buildAuthUrl(userId, state)` | redirect_uri sourced from `OURA_REDIRECT_URI` env |
| `exchangeCode(): {accessToken, refreshToken, expiresIn, scopes}` | `exchangeCode(): Promise<TokenSet>` | TokenSet = `{refreshToken, accessToken?, accessTokenExpiresAt?, scopes?, externalAccountId?}` |
| `refreshAccessToken(refreshToken)` | `refresh(conn): Promise<TokenSet>` | token read from connection (KMS-unwrapped by PR-HK-1) |
| `backfill(connection, sinceDays=30)` | `backfill(conn, since: Date)` | clamped to ≤30d TOS window internally |
| `verifyWebhookSignature(rawBody, headers)` | `verifyWebhook(req: RawWebhookRequest)` | RawWebhookRequest = `{rawBody, headers}` |
| `connector.fetch(connection, sinceTimestamp)` | `fetchChangedRecord(conn, event)` | added public method to pull just the changed object (no full backfill) |

The shipped `NormalizedSample` type has **no `dedup_key` field** — the ingestion
lane computes it. The brief's "each NormalizedSample includes dedup_key" is
satisfied by the ingestion service computing it from the normalizer's
metric/start/end (verified in tests via the shared util). The brief's dedup
recipe `provider:user_id:metric:start_at:value` differs from the shipped recipe
`user_id|provider|metric|start_iso|end_iso`; **I used the shipped recipe** (it is
the canonical, schema-documented contract; `value` is deliberately excluded so a
corrected provider value updates rather than duplicates a row).

## Webhook signature deviation (intentional, follows real Oura spec)

The brief said `x-oura-signature: sha256=<hex>` keyed by client_secret over the
raw body. Live Oura v2 (verified at https://cloud.ouraring.com/v2/docs, May 2026)
signs **`x-oura-timestamp` + rawBody** and the header is **UPPERCASE hex with no
`sha256=` prefix**. I implemented the real Oura format (HMAC-SHA256 of
`timestamp + rawBody`, uppercase hex, `crypto.timingSafeEqual` constant-time
compare, fail-closed on missing secret). This is the correct, audit-passing
behaviour; documented here as a deliberate deviation from the brief's literal
string.

## Defenses (50-Failures mapping)

- #1/#12 secrets: client id/secret from env, never logged; raw webhook payload
  never logged (only redacted metadata).
- #5/#6 webhook: `@Public` + HMAC verify FIRST + `@Throttle`; fail-closed on
  unconfigured secret.
- #8 validation: Zod schema (`.passthrough()` ignores unknown fields) on the
  webhook payload; 400 on malformed/invalid.
- #21 no N+1: backfill pages internally and returns one array; webhook fetches
  only the changed record; ingestion batch-upserts once.
- #28/#29 replay: `WearableProcessedEvent` composite (provider, event_id) —
  duplicate → 200 no-op; concurrent P2002 collapses to no-op.
- #35/#50 resilience: every HTTP call routes through `ProviderHttpClient`
  (timeout + capped jittered backoff); provider error → connection
  `status='error'` + `last_error` + structured log, then rethrow (no silent
  swallow, #36).
- #42 no speculative ingestion: unmapped collections (`sleep` long-form,
  `workout`, `session`) fetched but produce zero canonical rows; null fields
  dropped.

## Open follow-ups for downstream PRs

1. **Integration wire PR** must import `OuraModule` into `wearables.module.ts`
   and reconcile `WEARABLE_CONNECTORS` with PR-HK-1's registry token.
2. **main.ts** must wire raw-body capture for `/v1/wearables/webhooks/oura`
   (same `rawBody: true` middleware Stripe/MUX use) so `req.rawBody` is a Buffer.
3. **Env**: `OURA_CLIENT_ID`, `OURA_CLIENT_SECRET`, `OURA_REDIRECT_URI`,
   `OURA_VERIFICATION_TOKEN` must be provisioned.
4. **PR-HK-1** owns KMS-unwrapping refresh/access tokens onto the connection
   object before calling `refresh`/`backfill`/`fetchChangedRecord`; the connector
   reads `decryptedRefreshToken`/`decryptedAccessToken` via a narrow cast and
   should be reconciled to PR-HK-1's final field names at integration time.

## Source

- Oura Cloud API v2 docs (OAuth URLs, endpoints, webhook signature, field names):
  https://cloud.ouraring.com/v2/docs
- AGENT_2_CODING_PLAN.md §3.1 (Oura normalizer mapping) + PR-HK-2 section.
- PR-HK-0 foundation: `src/wearables/connectors/connector.interface.ts`,
  `src/wearables/normalization/normalizer.types.ts`,
  `src/wearables/http/provider-http-client.ts`,
  `prisma/migrations/20260531000000_wearables_foundation/migration.sql`.

## R2 Fix Pass

R2 fixer addressing the three R1 audit findings (`audits/HK_wave/PR-HK-2k_AUDIT_R1.md`,
verdict NOT CLEAN at `e9ef296`). Author: Dynasia G. Branch
`hk/PR-HK-2k-oura-connector`. New head: `824916089020adabb1daf8c217e21c1c5784801d`.
Write-set unchanged — all edits remain within `src/wearables/connectors/oura/`
(7 of the 9 files touched; no new files, no edits to `wearables.module.ts` or
`connector-registry.ts`).

### Commits

| SHA | Subject |
| --- | --- |
| `8d7a7449c38e3cee85e2d5abdd6dff36f3d38f2f` | `fix(wearables): PR-HK-2.k — webhook idempotency ordering (dedup after ingest)` |
| `973edf70853cbf388aa8b64b3d0dbd83062c9ea9` | `fix(wearables): PR-HK-2.k — wire Oura sleep resource normalization (stages + HRV)` |
| `824916089020adabb1daf8c217e21c1c5784801d` | `fix(wearables): PR-HK-2.k — mark connection error on backfill/refresh failure (redacted)` |

### Finding 1 (Critical) — webhook idempotency ordering

**Bug:** `WearableProcessedEvent` was inserted BEFORE fetch/ingest. A transient
fetch/ingest failure left the dedup row in place, so Oura's redelivery hit the
`findUnique` and 200-no-op'd — permanently dropping the event.

**Fix** (`oura-webhook.controller.ts`): reordered to **check → process →
commit**. `handle()` now (1) `findUnique` replay check, (2) resolve connection +
`fetchChangedRecord` + `normalize` + `ingest`, and only (3) AFTER a successful
ingest does it `create` the `WearableProcessedEvent` row (with
`handler_completed_at` set in the same write). On fetch/ingest failure the
method marks the connection `error` and rethrows WITHOUT writing the dedup row,
so the retry reprocesses. The separate post-hoc `update(handler_completed_at)`
is removed. Concurrency: two simultaneous deliveries of the same `event_id` may
both fetch+ingest, but the PR-HK-0 sample `dedup_key` UNIQUE constraint —
enforced via `IngestionService.createMany({ skipDuplicates: true })` (verified in
`ingestion.service.spec.ts`) — guarantees no double-counted samples; the loser's
processed-event `create` raises P2002 on the composite PK and is absorbed as a
benign no-op (ON CONFLICT DO NOTHING semantics).
- `oura-webhook.controller.ts:117-219` (replay check, ordered process, post-ingest commit, P2002 absorb).

**Tests** (`oura-webhook.controller.spec.ts`): updated first-delivery test to
assert the dedup row is created (with `handler_completed_at`) AFTER ingest
(`invocationCallOrder`), and that no separate `update` runs. Updated the P2002
test to assert fetch+ingest ran before the post-ingest commit. Added the
required loss-scenario test: transient fetch failure → assert NO
`processedEvent.create` occurred → retry with same event → assert fetch+ingest
ran and the dedup row was finally written. Also asserted no dedup row is written
on the connection-error path.

### Finding 2 (High) — live Oura `sleep` stage/HRV ingestion not wired

**Bug:** the connector fetched the long-form `sleep` records during backfill but
the normalizer mapped `sleep` → `[]`; only synthetic `daily_sleep` records (which
already carried stage fields in tests) produced sleep samples. Live backfill
produced no `SLEEP_*`/`HRV_MS` samples.

**Fix:** verified the Oura v2 `GET /v2/usercollection/sleep` shape against
https://cloud.ouraring.com/v2/docs — the long-form sleep document carries
`total_sleep_duration`, `rem/deep/light_sleep_duration`, `awake_time`,
`efficiency`, `average_hrv` (all seconds for durations, ms for HRV) plus a
5-minute `hrv.items` time series.
- `oura.types.ts:73-121`: added `OuraSleep` + `OuraSleepTimeSeries` interfaces for the long-form document.
- `oura.normalizer.ts`: extracted shared `sleepSeeds()` (used by both `daily_sleep` and `sleep`); added `normalizeSleep()` mapping stage durations (÷60 → minutes), `efficiency` → `SLEEP_EFFICIENCY_PCT`, and HRV → `HRV_MS` preferring `average_hrv` else the mean of `hrv.items` (off-wrist `null` entries skipped) via `averageSeries()`; routed `case 'sleep'` to `normalizeSleep` in `normalizeOuraRecord` (`oura.normalizer.ts:142-279, 372-384`).

**Tests** (`oura.normalizer.spec.ts:265-363`): realistic live `sleep` payload →
exact 7-sample output (golden vector below); `average_hrv` precedence; HRV
derived from `hrv.items` mean when `average_hrv` absent; no HRV sample when
neither present; canonical dedup_key re-derived via the shared `computeDedupKey`.

Golden vector — `normalizeOuraRecord(collection='sleep')` for a 420-min night
(`total=25200s, rem=6000s, deep=4200s, light=15000s, awake=900s, efficiency=89,
average_hrv=58`, window = bedtime span):

| metric | value | unit | bucket | startAt | endAt |
| --- | --- | --- | --- | --- | --- |
| SLEEP_TOTAL_MIN | 420 | min | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |
| SLEEP_REM_MIN | 100 | min | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |
| SLEEP_DEEP_MIN | 70 | min | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |
| SLEEP_LIGHT_MIN | 250 | min | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |
| SLEEP_AWAKE_MIN | 15 | min | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |
| SLEEP_EFFICIENCY_PCT | 89 | % | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |
| HRV_MS | 58 | ms | SLEEP_RECOVERY | 2026-05-30T23:10:00.000Z | 2026-05-31T06:55:00.000Z |

(`sourceRecordId='sleep_period_abc123'` on every row.)

### Finding 3 (Medium/High) — outage marking on backfill/refresh

**Bug:** backfill/refresh provider failures only threw; the connection was never
marked `error` outside webhook processing.

**Fix** (`oura.connector.ts`): added an optional `PrismaService` constructor
dependency (kept optional so the pure OAuth/normalize/verify unit tests still
construct with just the HTTP client). `backfill()` and `refresh()` now delegate
to private `backfillInner`/`refreshInner` and wrap them in try/catch; on failure
`markConnectionError()` updates `WearableConnection` to
`{ status: 'error', last_error: <redacted> }` (best-effort, never masks the
original error) and rethrows (fail-loud). Added module-scoped
`redactErrorMessage(err)` that strips `access_token=/refresh_token=/client_secret=/
client_id=/token=/code=` values, `Authorization: <scheme> <token>` headers, and
bare `Bearer`/`Basic` tokens, then caps at 500 chars. `createOuraConnector` now
forwards an optional `prisma` arg.
- `oura.connector.ts:63-113` (`redactErrorMessage`), `96-99` (ctor), `141-152` + `190-200` (refresh/backfill wrappers), `483-508` (`markConnectionError`), `559-565` (factory).

**Tests** (`oura.connector.spec.ts:342-446`): backfill failure → asserts
`wearableConnection.update` called with `status:'error'` and a `last_error` that
contains `Bearer [REDACTED]` + `client_secret=[REDACTED]` and NOT the raw token/
secret; refresh failure marks error with `refresh_token=[REDACTED]`; no-prisma
construction still rethrows without crashing; dedicated `redactErrorMessage`
unit tests for each secret pattern, bearer headers, non-Error inputs, and the
500-char cap.

### Gates (re-run at new head `8249160`, Prisma 6.19.3 via repo node_modules)

| Gate | Result |
| --- | --- |
| `prisma validate` | PASS — schema valid |
| `prisma generate` | PASS — client generated (v6.19.3) |
| `tsc --noEmit -p tsconfig.json` | PASS — no compiler output |
| `eslint src/wearables/connectors/oura/` | PASS — no lint output |
| `jest --roots src/wearables --runInBand` | PASS — 6 suites / 107 tests (was 95; +12 new) |

Oura connector suite alone: 3 suites / 55 tests (was 43; +12). New tests:
+1 webhook (loss/retry), +4 normalizer (sleep mapping, HRV-from-series,
no-HRV, dedup_key), +7 connector (backfill/refresh outage marking ×3 + 4
redaction units).
