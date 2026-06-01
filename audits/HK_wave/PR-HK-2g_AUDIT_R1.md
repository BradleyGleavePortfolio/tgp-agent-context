# PR-HK-2.g — Polar AccessLink connector — R1 audit

**Verdict:** FAIL — webhook validation/idempotency and required gates do not meet the PR-HK-2.g checklist.

**Repo:** `growth-project-backend`  
**PR:** #351  
**Audited head SHA:** `ef79c47ffe1a9a716fdd94a9960280321eab9d55`  
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2g-polar_BUILD.md` @ `e4b7f94`  
**Auditor:** R1

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/polar/`:

```text
src/wearables/connectors/polar/index.ts
src/wearables/connectors/polar/polar-webhook.controller.spec.ts
src/wearables/connectors/polar/polar-webhook.controller.ts
src/wearables/connectors/polar/polar.connector.spec.ts
src/wearables/connectors/polar/polar.connector.ts
src/wearables/connectors/polar/polar.module.ts
src/wearables/connectors/polar/polar.normalizer.spec.ts
src/wearables/connectors/polar/polar.normalizer.ts
src/wearables/connectors/polar/polar.types.ts
```

No schema, shared registry, shared module, or sibling connector edits were present in the backend diff. The build report was reviewed from the context repository.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma schema | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | **FAIL**, process was killed by the sandbox before normal exit |
| Lint | `npx eslint src/wearables/connectors/polar/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 323 tests |
| Build | `npx nest build` | **FAIL**, process was killed by the sandbox before normal exit |

Logs are saved under `audits/HK_wave/logs/PR-HK-2g_R1_*.log`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `PolarConnector implements WearableConnector`; `provider = POLAR`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Uses Polar AccessLink OAuth endpoints, Basic-auth token exchange, and configured client id/secret. |
| Token storage/KMS contract | PASS | Connector returns token material to the shared OAuth lane; it does not persist or log raw token values itself. |
| Refresh-token semantics | PASS | Models Polar as long-lived/non-rotating AccessLink token behavior rather than unsupported refresh rotation. |
| Webhook raw-body HMAC | PASS | Verifies `Polar-Webhook-Signature` with HMAC-SHA256 over the raw body and fails closed when secret/signature is missing. |
| Webhook idempotency ordering | **FAIL** | See Finding 2: the controller checks for a row, performs fetch/normalize/ingest, then creates the processed-event row instead of reserving/upserting first. |
| Durable webhook event before 200 | **FAIL** | See Finding 2: a durable row is written before the final 200 only after all work succeeds; there is no atomic pre-work reservation. |
| Zod strict payload validation | **FAIL** | See Finding 1: the Zod schema uses `.passthrough()` and accepts any non-empty event string. |
| PING handling | PASS | PING is acknowledged without downstream processing after signature and payload parsing. |
| PII/log redaction | PASS | Logs avoid raw payload values/tokens and use redacted error handling for provider failures. |
| OAuth error log redaction | PASS | OAuth exchange paths do not log raw credentials or token bodies. |
| HTTP discipline / 429 handling | PASS | Provider requests use `ProviderHttpClient`, inheriting timeout/backoff/retry behavior. |
| Backfill date clamp / provider limits | PASS | Backfill clamps to the 28-day AccessLink window and iterates per-date resources. |
| Backfill outage error handling | PASS | Provider failures are surfaced through the connector error path and tested redaction behavior. |
| `exercises` → `WORKOUT_DURATION_MIN` | PASS | Normalizer maps ISO-8601 exercise duration to minutes. |
| `exercises` → `WORKOUT_DISTANCE_M` | PASS | Normalizer maps exercise distance in meters. |
| `exercises` → `HEART_RATE_BPM` | PASS | Normalizer maps average heart rate when present. |
| `sleep` → `SLEEP_TOTAL_MIN` | PASS | Normalizer derives total sleep minutes from sleep stages. |
| `sleep` → `SLEEP_REM_MIN` / `SLEEP_DEEP_MIN` / `SLEEP_LIGHT_MIN` / `SLEEP_AWAKE_MIN` | PASS | Normalizer maps all required sleep-stage minute metrics. |
| `sleep` extra metrics | **FAIL** | See Finding 3: Polar sleep additionally emits `SLEEP_EFFICIENCY_PCT`, which is not in the §3.1 Polar binding. |
| `nightly-recharge` → `RECOVERY_SCORE` / `HRV_MS` | PASS | Normalizer maps nightly recharge recovery score and HRV milliseconds. |
| Tests | PASS with coverage gaps | Polar-specific tests plus the wearables regression suite pass, but they do not catch the strict-schema, unknown-event, or upsert-first idempotency defects. |
| File hygiene / commit author hygiene | **FAIL** | Backend write-set mutex passes and the commit author is `Dynasia G <dynasia@trygrowthproject.com>`, but the audited backend commit body is non-empty despite the brief requiring empty bodies/no trailers. |

## Findings

### 1. HIGH — Webhook schema is not strict and accepts arbitrary event values

**Code:** `src/wearables/connectors/polar/polar-webhook.controller.ts:225-254` and `src/wearables/connectors/polar/polar.connector.ts:379-390`

```ts
const schema = z
  .object({
    event: z.string().min(1),
    timestamp: z.string().min(1),
    user_id: z.number().int().optional(),
    entity_id: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    url: z.string().url().optional(),
  })
  .passthrough()
  .superRefine((val, ctx) => {
```

The prior-audit checklist requires strict webhook payload validation. This schema explicitly permits unknown top-level fields via `.passthrough()` and accepts any non-empty `event` string instead of an enum of supported Polar event types. A signed payload with an unknown event can pass parsing, reach connection resolution, and then map to `null` in `eventToResource()` without being rejected as provider drift.

**Impact:** Malformed or drifted webhook payloads can be accepted and acknowledged instead of failing closed. That weakens the webhook hardening guarantee and makes unsupported provider behavior easy to miss in production.

**Expected fix:** Replace `.passthrough()` with `.strict()`, constrain `event` to the supported Polar event enum (`PING`, `EXERCISE`, `SLEEP`, `NIGHTLY_RECHARGE`, or the documented supported set), and add regression tests for extra top-level keys and unknown event values.

### 2. HIGH — Processed-event idempotency is check-then-act instead of an upsert/reservation before work

**Code:** `src/wearables/connectors/polar/polar-webhook.controller.ts:96-122` and `:175-199`

```ts
const existing = await this.prisma.wearableProcessedEvent.findUnique({
  where: {
    provider_provider_event_id: {
      provider: WearableProvider.POLAR,
      provider_event_id: providerEventId,
    },
  },
});
if (existing) {
  return { ok: true };
}
```

```ts
await this.prisma.wearableProcessedEvent.create({
  data: {
    provider: WearableProvider.POLAR,
    provider_event_id: providerEventId,
    type: event.event,
    handler_completed_at: new Date(),
  },
});
```

The brief requires webhook idempotency ordering of upsert/create first, then processing, with durable `WearableProcessedEvent` state before returning 200. This implementation performs a `findUnique()` replay check, does external fetch/normalize/ingest work, and only then creates the processed-event row. Concurrent redeliveries that both miss `findUnique()` can both execute the expensive and side-effecting work; the losing delivery only receives `P2002` after the work has already run.

**Impact:** Duplicate concurrent webhook deliveries can double-fetch provider resources, double-call ingestion, and consume provider rate limits. Sample `dedup_key` uniqueness may protect final sample rows, but it does not satisfy the required atomic webhook idempotency barrier or protect non-sample side effects.

**Expected fix:** Reserve the event atomically before work with `createMany({ skipDuplicates: true })`, `upsert()`, or an equivalent pattern that returns whether this handler owns processing. Mark `handler_completed_at` only after successful processing, and define retry handling for stale/incomplete reservations. Add a concurrency regression test that proves only one delivery performs fetch/ingest.

### 3. MEDIUM — Polar sleep emits an extra derived metric outside the §3.1 binding

**Code:** `src/wearables/connectors/polar/polar.normalizer.ts:264-318`

```ts
const efficiency = deriveEfficiencyPct(
  asleepSeconds,
  rec.total_interruption_duration ?? null,
);
...
{
  metric: 'SLEEP_EFFICIENCY_PCT',
  bucket: 'SLEEP_RECOVERY',
  value: efficiency,
  unit: UNIT.PCT,
  ...window,
},
```

AGENT_2 §3.1 says connector normalizers must implement exactly the listed mappings and drop anything not listed. The Polar row lists `exercises` → `WORKOUT_*` / `HEART_RATE_BPM`, `sleep` → `SLEEP_*_MIN`, and `nightly-recharge` → `RECOVERY_SCORE` / `HRV_MS`; it does not include `SLEEP_EFFICIENCY_PCT` for Polar sleep.

**Impact:** Polar can ingest a derived sleep-efficiency sample that was not approved by the provider binding. Downstream analytics may treat this as canonical provider data even though the wave plan limited Polar sleep to minute-based sleep metrics.

**Expected fix:** Remove the Polar `SLEEP_EFFICIENCY_PCT` sample unless the wave plan is explicitly updated to include it. If the metric is approved, document the mapping change and add tests that distinguish approved native/derived metrics from speculative ones.

## Positive observations

- The connector is file-disjoint and keeps all implementation/test files under `src/wearables/connectors/polar/`.
- The HMAC verifier fails closed when the webhook secret or signature is missing and uses constant-time comparison for digest matching.
- Backfill is conservatively clamped to the Polar 28-day AccessLink window and uses the shared HTTP client rather than raw fetch calls.
- The normalizer covers the required exercise, sleep-stage, and nightly-recharge metrics with real-value assertions.

## Commit hygiene check

```text
ef79c47ffe1a9a716fdd94a9960280321eab9d55
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.g: Polar AccessLink connector (OAuth2 + webhook + backfill)

Add the file-disjoint Polar connector under src/wearables/connectors/polar/
implementing the PR-HK-0 WearableConnector contract.

- polar.connector.ts: OAuth2 (HTTP Basic token exchange, non-rotating
  long-lived tokens), backfill (exercises list + per-date sleep /
  nightly-recharge, clamped to 28d), Polar-Webhook-Signature HMAC-SHA256
  raw-body verify (fail-closed), fetchChangedRecord with SSRF host guard,
  redacted error logging.
- polar.normalizer.ts: AGENT_2_CODING_PLAN 3.1 mapping — exercises ->
  WORKOUT_DURATION_MIN/WORKOUT_DISTANCE_M/HEART_RATE_BPM; sleep ->
  SLEEP_TOTAL/REM/DEEP/LIGHT/AWAKE_MIN + derived SLEEP_EFFICIENCY_PCT;
  nightly-recharge -> RECOVERY_SCORE/HRV_MS. ISO-8601 duration parsing.
- polar-webhook.controller.ts: Public HMAC-gated receiver, Zod validation,
  PING ack, check-process-commit idempotency ordering, PII-free logs.
- polar.types.ts, polar.module.ts, index.ts (registry contribution).
- 51 connector/normalizer/webhook tests, real-value assertions.
---END---
```

Author hygiene passes, but commit-body hygiene fails because the audited backend commit has a non-empty body.

## Final verdict

FAIL. The backend diff respects the provider write-set and passes Prisma, lint, and wearables tests, but the connector cannot be accepted until webhook payload validation is strict, processed-event idempotency uses an atomic pre-work reservation/upsert pattern, the Polar normalizer stops emitting unapproved derived metrics or updates the binding, and the required type/build gates complete successfully.
