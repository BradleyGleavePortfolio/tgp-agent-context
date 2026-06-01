# PR-HK-2.h — Wahoo connector — R1 audit

**Verdict:** FAIL — webhook hardening has one fail-closed configuration gap and two medium-severity validation/redaction gaps.

**Repo:** `growth-project-backend`  
**PR:** #354  
**Audited head SHA:** `80ae203eef5af86f6b711db4d18c9345e0fc3408`  
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2h-wahoo_BUILD.md` @ `e4b7f94`  
**Auditor:** R1

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/wahoo/`:

```text
src/wearables/connectors/wahoo/index.ts
src/wearables/connectors/wahoo/wahoo-webhook.controller.spec.ts
src/wearables/connectors/wahoo/wahoo-webhook.controller.ts
src/wearables/connectors/wahoo/wahoo.connector.spec.ts
src/wearables/connectors/wahoo/wahoo.connector.ts
src/wearables/connectors/wahoo/wahoo.module.ts
src/wearables/connectors/wahoo/wahoo.normalizer.spec.ts
src/wearables/connectors/wahoo/wahoo.normalizer.ts
src/wearables/connectors/wahoo/wahoo.types.ts
```

No module/registry edits were present in the diff. The build report is the only non-backend artifact reviewed for this PR.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/wahoo/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 313 tests |
| Build | `npx nest build` | PASS, exit 0 |

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `WahooConnector implements WearableConnector`; `provider = WAHOO`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Auth URL, token URL, and scopes are provider-specific and env-driven; tests assert the round-trip params. |
| Refresh-token rotation | PASS | `refresh()` returns the rotated refresh token and marks the connection error on provider failure. |
| Backfill pagination | PASS | Pages `/v1/workouts?page=N&per_page=100` with a hard 100-page cap and short-page stop. |
| Rate-limit / timeout discipline | PASS | Outbound provider calls go through `ProviderHttpClient`; 429/backoff behavior is inherited from the shared client. |
| Webhook `@Public`, raw body, throttle | PASS | Controller is public, requires `req.rawBody`, and uses `@Throttle({ ttl: 60_000, limit: 500 })`. |
| Webhook HMAC validation | PASS | Requires `x-wahoo-signature` and `x-wahoo-timestamp`, fails closed when no HMAC secret/client secret is configured. |
| Webhook shared-token validation | **FAIL** | See Finding 1: `WAHOO_WEBHOOK_TOKEN` is optional, so the documented shared-token control does not fail closed under missing config. |
| Webhook Zod validation | partial | See Finding 2: top-level `.strict()` exists, but required provider event fields are optional and malformed authenticated events can be committed. |
| Webhook idempotency ordering | PASS | Checks `WearableProcessedEvent` before processing and writes the dedup row only after normalize/ingest succeeds; duplicate and P2002 paths are covered. |
| Durable enqueue / response semantics | PASS | Webhook ingest is synchronous before 200; no async work item is claimed or dropped. |
| PII in logs | PASS with edge gap | Normal webhook logs use `user_hash`; see Finding 3 for raw ingestion-error persistence to `last_error`. |
| OAuth error log redaction | PASS | Token request failures log structured metadata rather than raw response bodies or URLs containing tokens. |
| KMS token handling | PASS | Connector returns `TokenSet` only and reads decrypted tokens supplied by the connection lane; it does not persist plaintext tokens. |
| Normalizer mapping — `WORKOUT_DURATION_MIN` | PASS | Maps `workout.minutes` to minutes with exact value tests. |
| Normalizer mapping — `WORKOUT_DISTANCE_M` | PASS | Maps `workout_summary.distance_accum` string to meters with real-value tests. |
| Normalizer mapping — `HEART_RATE_BPM` | PASS | Maps `workout_summary.heart_rate_avg` string to bpm with real-value tests. |
| Tests | partial | 41 Wahoo tests exist and the full wearables suite passes, but missing-config token, malformed missing-user/workout payloads, and ingest-error redaction are not covered. |
| File hygiene | PASS | Two commits by Dynasia G, empty bodies, no co-author/generated trailers observed. |

## Findings

### 1. HIGH — Webhook shared-token validation fails open when `WAHOO_WEBHOOK_TOKEN` is missing

**Code:** `src/wearables/connectors/wahoo/wahoo.connector.ts:338-346`

```ts
// Shared-token control: only enforced when configured. Wahoo says "any
// request that doesn't include this token should be ignored".
const expectedToken = process.env[ENV.webhookToken];
if (expectedToken) {
  const provided = this.extractWebhookToken(req.rawBody);
  if (!provided || !this.constantTimeEquals(expectedToken, provided)) {
    return false;
  }
}
```

The connector only enforces Wahoo's documented `webhook_token` when the environment variable is configured. If `WAHOO_WEBHOOK_TOKEN` is absent or empty, any request with a valid HMAC signature is accepted even if it has no shared token. The code comments and build report describe the webhook as requiring both HMAC and `webhook_token`, but the implementation makes one of the two controls optional.

**Impact:** The webhook does not fail closed under missing shared-token configuration. This weakens the provider's documented authenticity control and repeats the prior-audit class of fail-open webhook configuration branches.

**Expected fix:** Require `WAHOO_WEBHOOK_TOKEN` for webhook verification, return false/401 when it is unset, and add a regression test proving a missing token config rejects before payload parsing, dedup, or ingest.

### 2. MEDIUM — Webhook Zod schema accepts malformed workout events and still commits them as processed

**Code:** `src/wearables/connectors/wahoo/wahoo-webhook.controller.ts:217-227` and `:162-181`

```ts
const schema = z
  .object({
    event_type: z.string().min(1),
    webhook_token: z.string().min(1).optional(),
    user: z
      .object({ id: z.union([z.number(), z.string()]).optional() })
      .passthrough()
      .nullish(),
    workout_summary: z.object({}).passthrough().nullish(),
  })
  .strict();
```

```ts
} else {
  this.logger.warn({
    msg: 'wearables.wahoo.webhook.no_user',
    provider: 'WAHOO',
    event_type: event.event_type,
  });
}

// ... still creates WearableProcessedEvent ...
await this.prisma.wearableProcessedEvent.create({
```

The schema is top-level strict, but it permits missing `user.id`, missing `workout_summary`, and an unconstrained `event_type`. The handler then records such authenticated-but-malformed deliveries as processed, which prevents a later corrected redelivery with the same computed event id from being handled.

**Impact:** Malformed workout webhook payloads can be acknowledged and durably marked processed without resolving a connection or ingesting the changed workout. That undermines the strict webhook validation requirement and can hide provider delivery/schema problems.

**Expected fix:** Tighten the schema for workout events: constrain `event_type` to the supported Wahoo workout event(s), require `user.id`, require `workout_summary` with stable summary/workout identifiers and the embedded `workout.starts` field when the event is supposed to ingest a workout, and reject malformed deliveries before any dedup lookup or commit. Add tests for missing user, missing summary, missing embedded workout id/start, and invalid event type.

### 3. MEDIUM — Ingest-failure path persists an unredacted error message to `WearableConnection.last_error`

**Code:** `src/wearables/connectors/wahoo/wahoo-webhook.controller.ts:136-142`

```ts
await this.prisma.wearableConnection
  .update({
    where: { id: connection.id },
    data: {
      status: 'error',
      last_error: (err as Error)?.message?.slice(0, 500) ?? 'unknown',
    },
  })
```

Unlike the connector's `markConnectionError()` path, the webhook ingest-failure path writes `err.message` directly into `last_error`. If the thrown error ever includes a provider URL, token-like value, raw payload fragment, or other sensitive context, it is persisted without the PR's redaction helper.

**Impact:** This edge path can leak sensitive operational details into durable connection state and contradicts the build report's claim that webhook ingest failures store a redacted `last_error`.

**Expected fix:** Reuse the connector redaction helper or store only `{ error_class, error_code }`-style sanitized metadata in `last_error`, and add a regression test with a token-like error string proving the persisted value is redacted.

## Positive observations

- The normalizer cleanly implements all three binding §3.1 Wahoo mappings with real-value assertions and correct units/bucket/window behavior.
- OAuth and refresh paths use `ProviderHttpClient`, avoid direct token persistence, and return rotated refresh tokens in the `TokenSet`.
- Webhook idempotency uses check → process → commit ordering and handles concurrent `P2002` as a benign duplicate after ingestion.
- The diff respects the write-set mutex: no shared module, registry, schema, ingestion, or sibling-connector files were edited.

## Final verdict

FAIL. The connector passes the five gates and is strong on OAuth, pagination, normalization, and idempotency, but it is not clean under the R1 rubric until the webhook shared-token check fails closed when misconfigured, the webhook schema rejects malformed provider events before committing them processed, and the webhook ingest-failure path redacts persisted error text.

## Audit commit hygiene check

```text
80ae203eef5af86f6b711db4d18c9345e0fc3408
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.h: fix webhook spec mock typing (tsc strict tuple) — all 5 gates green

---END---
c6682125575ddf95e2f33e93d74588668bc1964c
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.h: Wahoo connector — initial implementation (types, normalizer, connector, webhook, module, index, specs)

---END---
```
