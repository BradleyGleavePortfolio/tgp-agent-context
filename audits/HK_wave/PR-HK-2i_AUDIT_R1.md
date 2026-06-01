# PR-HK-2.i — Withings connector — R1 audit

**Verdict:** FAIL — webhook authentication is not compatible with documented Withings notify callbacks, and one webhook failure path persists/logs raw error messages.

**Repo:** `growth-project-backend`  
**PR:** #352  
**Audited head SHA:** `037d4eb244c2a20e2a5259012fbf3f889baa93e5`  
**Base:** `main` @ `8cfb44f6`  
**Build report reviewed:** `HK_PR-HK-2i-withings_BUILD.md` @ `e4b7f94`  
**Auditor:** R1

## Scope / write-set verification

PASS. The audited backend diff is exactly 9 files, all under `src/wearables/connectors/withings/`:

```text
src/wearables/connectors/withings/index.ts
src/wearables/connectors/withings/withings-webhook.controller.spec.ts
src/wearables/connectors/withings/withings-webhook.controller.ts
src/wearables/connectors/withings/withings.connector.spec.ts
src/wearables/connectors/withings/withings.connector.ts
src/wearables/connectors/withings/withings.module.ts
src/wearables/connectors/withings/withings.normalizer.spec.ts
src/wearables/connectors/withings/withings.normalizer.ts
src/wearables/connectors/withings/withings.types.ts
```

No module/registry/schema/ingestion edits were present in the backend diff. The build report lives in the allowed docs write-set.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/withings/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 324 tests |
| Build | `npx nest build` | PASS, exit 0 |

Logs were written under `audits/HK_wave/logs/PR-HK-2i_R1_*.log`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `WithingsConnector implements WearableConnector`; `provider = WITHINGS`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Auth URL, token URL, client env, redirect URI, state, and `user.metrics,user.activity` scopes are implemented and tested. |
| Refresh-token handling | PASS | Refresh uses transient decrypted token input and returns the rotated/fallback refresh token for PR-HK-1 to KMS-wrap. |
| KMS token handling | PASS | Connector returns `TokenSet` only; no plaintext DB writes in this PR. |
| HTTP discipline / backoff | PASS | Provider calls use `ProviderHttpClient`; backfill and fetch paths are paged. |
| Backfill pagination / TOS window | PASS | Backfill clamps to 90 days and pages `measure` + `sleep` via `more/offset`. |
| Webhook raw body + throttling | PASS | Controller requires `rawBody`, is `@Public`, and uses `@Throttle`. |
| Webhook fail-closed config | PASS | Missing `WITHINGS_WEBHOOK_SECRET` returns 503 before DB work. |
| Webhook authenticity validation | **FAIL** | See Finding 1: the code requires synthetic `x-withings-signature`/body HMAC values that are not documented for Withings Health Data notify callbacks. |
| Zod webhook payload validation | PASS | `WithingsNotifySchema` is `.strict()` and rejects missing, non-numeric, and unknown keys. |
| Webhook idempotency ordering | PASS with caveat | Existing processed events no-op; dedup row is written after successful fetch/ingest; P2002 concurrent commit is absorbed. |
| Durable enqueue / ingestion before 200 | PASS | First delivery fetches changed records, normalizes, ingests, then records completion before returning 200. |
| PII in logs | PASS with edge-path fail | No raw `userid` is logged on normal paths; see Finding 2 for raw error-message persistence/logging on webhook failures. |
| OAuth error log redaction | PASS | Connector-level outage marking uses `redactErrorMessage`; tests assert token/client-secret redaction. |
| Normalizer: `measure` type 1 → `BODY_WEIGHT_KG` | PASS | Real provider-shaped test asserts 70.5 kg. |
| Normalizer: `measure` type 6 → `BODY_FAT_PCT` | PASS | Real provider-shaped test asserts 18.25%. |
| Normalizer: `measure` type 9/10 → `BLOOD_PRESSURE_DIA/SYS` | PASS | Test emits both BP metrics with mmHg values. |
| Normalizer: `sleep` → `SLEEP_TOTAL/REM/DEEP/LIGHT/AWAKE_MIN` | PASS | Test asserts all stage values in minutes. |
| Normalizer: `sleep` → `SLEEP_EFFICIENCY_PCT` | PASS | Test asserts 0.89 ratio becomes 89%. |
| Normalizer: `sleep` → `RESPIRATORY_RATE_BRPM` | PASS | Test asserts 14 br/min. |
| Test floor | PASS with coverage gap | 52 Withings tests are present, but webhook auth tests only prove a synthetic HMAC path rather than a real Withings callback shape. |
| File hygiene | PASS | Backend write-set is connector-only. |
| Commit author/body hygiene | **FAIL** | Author is correct, but the commit body is non-empty despite the R1 brief requiring empty bodies. |

## Findings

### 1. HIGH — Webhook authentication requires a signature Withings Health Data notify callbacks do not provide

**Code:** `src/wearables/connectors/withings/withings.connector.ts:316-351` and `src/wearables/connectors/withings/withings-webhook.controller.ts:124-132`

```ts
const headerSig = this.header(req.headers, 'x-withings-signature');
...
const expected = createHmac('sha256', secret)
  .update(signedMessage)
  .digest('hex')
  .toUpperCase();

return this.constantTimeEquals(expected, signature.toUpperCase());
```

The controller rejects every POST unless `verifyWebhook()` finds either `x-withings-signature` or a body `signature` containing an HMAC over the request bytes. The Withings API reference describes Health Data notify subscription as bearer-token authenticated and says not to use `signature`/`nonce` query parameters for Health Data API subscription calls; it does not document callback POSTs carrying an `x-withings-signature` header or dynamic body HMAC ([Withings API reference](https://developer.withings.com/api-reference/)).

**Impact:** Legitimate Withings notify callbacks will be rejected with 401 unless an undocumented intermediary computes and injects this synthetic HMAC. That makes the webhook path non-functional: changed measure/sleep windows are never fetched, normalized, ingested, or recorded durably.

**Expected fix:** Implement a provider-supported callback authentication strategy, e.g. a documented callback URL secret/query/path plus strict validation and/or Withings notify IP allow-list, or documented provider signature verification if available. Add a regression test using the exact Withings form-encoded callback shape without synthetic headers, and keep fail-closed behavior under missing/mismatched callback secret.

### 2. MEDIUM — Webhook failure path persists and logs raw error messages instead of using the connector redactor

**Code:** `src/wearables/connectors/withings/withings-webhook.controller.ts:180-198`

```ts
await this.prisma.wearableConnection
  .update({
    where: { id: connection.id },
    data: {
      status: 'error',
      last_error: (err as Error)?.message?.slice(0, 500) ?? 'unknown',
    },
  })
...
this.logger.error({
  msg: 'wearables.withings.webhook.ingest_failure',
  provider: 'WITHINGS',
  appli: event.appli,
  error_message: (err as Error)?.message ?? String(err),
});
```

The connector has a tested `redactErrorMessage()` helper, but the webhook controller bypasses it on fetch/normalize/ingest failure and writes/logs the raw exception message.

**Impact:** If a lower-level error includes an access token, authorization header, request URL, response body, or provider identifier, this edge path can persist or emit sensitive data. The PR-HK-2 checklist requires no raw error response bodies/tokens in logs and redacted OAuth/provider errors.

**Expected fix:** Reuse `redactErrorMessage()` (or a shared redactor) before writing `last_error` and before logging `error_message`; log only structured fields such as provider, appli, error class/code, and redacted message. Add a regression test with `Authorization: Bearer SECRET` and `client_secret=SECRET` in the thrown error to prove neither DB update nor logger output contains secrets.

### 3. MEDIUM — Commit body hygiene does not satisfy the R1 brief

**Code:** commit `037d4eb244c2a20e2a5259012fbf3f889baa93e5`

```text
Dynasia G <dynasia@trygrowthproject.com>
Add Withings wearable connector (OAuth2, measure + sleep) with
form-encoded webhook handling, fail-closed subscription validation,
...
- 3 spec files (52 tests).
```

The author identity is correct and there are no trailers, but the R1 brief requires `git log main..<HEAD_SHA> --format='%an <%ae>%n%b'` to show empty bodies for every commit. This commit has a multi-line body.

**Impact:** The commit fails the audit hygiene rule even though the author is correct.

**Expected fix:** Amend the commit to remove the body while preserving author `Dynasia G <dynasia@trygrowthproject.com>` and no trailers, then re-run the hygiene check at the new SHA.

## Positive observations

- The backend write-set mutex is clean: only the Withings connector folder changed.
- All five required gates pass at the pinned SHA.
- The normalizer maps every required §3.1 Withings metric with real-value tests for weight, body fat, blood pressure, sleep stages, sleep efficiency, and respiratory rate.
- Backfill is paged and TOS-clamped, and connector-level refresh/backfill failure marking redacts token-like strings.
- The webhook controller correctly avoids marking failed fetch/ingest attempts as processed, so provider redelivery can retry.

## Final verdict

FAIL. The connector is strong on normalizer coverage, backfill paging, gate cleanliness, and most fail-closed mechanics, but the webhook cannot be accepted until authentication matches a real Withings notify callback shape and the webhook failure path redacts persisted/logged errors. The commit body hygiene issue must also be fixed before a clean R1 verdict.

## Audit commit hygiene check

```text
AUTHOR_CHECK_FORMATTED:
Dynasia G <dynasia@trygrowthproject.com>
Add Withings wearable connector (OAuth2, measure + sleep) with
form-encoded webhook handling, fail-closed subscription validation,
KMS-wrapped token storage, PII/secret log redaction, Zod-validated
notifications, and idempotent process->commit ingestion.

Files (src/wearables/connectors/withings/):
- withings.types.ts: native envelope/token/measure/sleep shapes, scopes,
  appli constants, strict Zod notify schema.
- withings.normalizer.ts: measure decode (type1/6/9/10) and sleep summary
  to NormalizedSample, per spec 3.1.
- withings.connector.ts: OAuth authorize/token/refresh, backfill (<=90d),
  webhook verify (fail-closed), event mapping, secret redaction.
- withings-webhook.controller.ts: GET verify handshake, POST notify with
  idempotency, fail-closed 503, Zod 400, durable dedup row.
- withings.module.ts, index.ts: DI wiring + connector definition.
- 3 spec files (52 tests).
---COMMIT-END---
```
