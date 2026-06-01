# PR-HK-2.i — Withings connector — R3 audit

**Verdict:** NOT CLEAN — the R2 functional fixes are present, but Bradley Law still fails on explicit `stub` literals and swallowed `.catch(() => undefined)` exceptions.

**Repo:** `growth-project-backend`  
**PR:** #352  
**Audited head SHA:** `976eac363c3f6d0a41915c380b302053aa1c758a`  
**Base:** pre-Strava `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2i-withings_BUILD.md` @ `e4b7f94bb06427e24e7cfc21f2b65729c143c79e`  
**Auditor:** R3

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

No module/registry/schema/ingestion edits were present in the backend diff. The merge-base is still `8cfb44f6`, confirming the R2 force-push preserved the pre-Strava base instead of rebasing onto current `main`.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/withings/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 330 tests |
| Build | `npx nest build` | PASS, exit 0 |

Logs were written under `audits/HK_wave/logs/PR-HK-2i_R3_*.log`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `WithingsConnector implements WearableConnector`; `provider = WITHINGS`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Auth URL, token URL, client env, redirect URI, state, and `user.metrics,user.activity` scopes remain implemented and tested. |
| Refresh-token handling | PASS | Refresh uses transient decrypted token input and returns the rotated/fallback refresh token for PR-HK-1 to KMS-wrap. |
| KMS token handling | PASS | Connector returns `TokenSet` only; no plaintext DB writes in this PR. |
| HTTP discipline / backoff | PASS | Provider calls use `ProviderHttpClient`; backfill and fetch paths are paged. |
| Backfill pagination / TOS window | PASS | Backfill clamps to 90 days and pages `measure` + `sleep` via `more/offset`. |
| Webhook raw body + throttling | PASS | Controller requires `rawBody`, is `@Public`, and uses `@Throttle`. |
| Webhook fail-closed config | PASS | Missing `WITHINGS_WEBHOOK_SECRET` returns 503 before DB work. |
| Webhook authenticity validation | PASS | R2 removed the synthetic `x-withings-signature`/body-HMAC requirement and now authenticates a real form-encoded Withings callback by a secret callback URL/query/header token; Withings documents notify callbacks as `application/x-www-form-urlencoded` POSTs to the callback URL with fields such as `userid`, `appli`, `startdate`, and `enddate`, and does not document a callback HMAC header on that page ([Withings notification content](https://developer.withings.com/developer-guide/v3/data-api/notifications/notification-content/)). Withings also documents subscription with an access token and `callbackurl`, without documenting signature/nonce requirements on the subscribe page ([Withings notification subscribe](https://developer.withings.com/developer-guide/v3/data-api/notifications/notification-subscribe/)). |
| Callback URL posture | PASS | The callback URL is the partner URL used by Withings for notification POSTs and must be HTTPS, valid URL-encoded, ≤255 chars, not IP/localhost, and only ports 80/443 ([Withings glossary](https://developer.withings.com/developer-guide/v3/glossary/glossary-page/)). The connector's secret URL token is compatible with this model. |
| Zod webhook payload validation | PASS | `WithingsNotifySchema` is `.strict()` and rejects missing, non-numeric, and unknown keys. |
| Webhook idempotency ordering | PASS with caveat | Existing processed events no-op; dedup row is created after successful fetch/ingest, and P2002 concurrent commit is absorbed. This preserves retryability after fetch/ingest failure but is still a check/process/commit pattern, not the Wave-2 brief's ideal upsert-first wording. |
| Durable enqueue / ingestion before 200 | PASS | First delivery fetches changed records, normalizes, ingests, then records completion before returning 200. |
| PII in logs | PASS | No raw `userid` is logged on normal paths; R2 redacts webhook failure `last_error` and `error_message`. |
| OAuth/provider error log redaction | PASS | Connector-level and webhook-level failure marking use `redactErrorMessage`; tests assert bearer/access/client-secret redaction. |
| R1 Finding 1 — Withings webhook auth spec | RESOLVED | The code no longer requires a synthetic HMAC; tests assert a Withings-shaped callback with no `x-withings-signature` succeeds when the callback secret matches. |
| R1 Finding 2 — raw webhook failure error persistence/logging | RESOLVED | The webhook catch path calls `redactErrorMessage(err)` before persisting `last_error` and before logging `error_message`; the regression test injects bearer/access/client-secret material and checks it is absent from persistence/logs. |
| R1 Finding 3 — commit body | RESOLVED | `git log 8cfb44f6..HEAD --format='%an <%ae>%n%b'` shows author `Dynasia G <dynasia@trygrowthproject.com>` and an empty body. |
| Normalizer: `measure` type 1 → `BODY_WEIGHT_KG` | PASS | Real provider-shaped test asserts 70.5 kg. |
| Normalizer: `measure` type 6 → `BODY_FAT_PCT` | PASS | Real provider-shaped test asserts 18.25%. |
| Normalizer: `measure` type 9/10 → `BLOOD_PRESSURE_DIA/SYS` | PASS | Test emits both BP metrics with mmHg values. |
| Normalizer: `sleep` → `SLEEP_TOTAL/REM/DEEP/LIGHT/AWAKE_MIN` | PASS | Test asserts all stage values in minutes. |
| Normalizer: `sleep` → `SLEEP_EFFICIENCY_PCT` | PASS | Test asserts 0.89 ratio becomes 89%. |
| Normalizer: `sleep` → `RESPIRATORY_RATE_BRPM` | PASS | Test asserts 14 br/min. |
| Bradley Law: no `Coming soon`/`TODO`/`XXX`/`stub` literals | **FAIL** | See Finding 1: four `stub`/`stubbed` literals remain in connector test comments. |
| Bradley Law: no swallowed exceptions | **FAIL** | See Finding 2: two best-effort DB update failures are swallowed via `.catch(() => undefined)`. |
| Bradley Law: no `@ts-ignore` or `as any` bypass | PASS | Grep found no `@ts-ignore` and no `as any` in the Withings write-set. |
| Bradley Law: fail-closed webhook validation | PASS | Missing raw body → 400, missing secret → 503, absent/wrong secret → 401, malformed strict schema → 400, and no DB side effects before auth failure. |
| File hygiene | PASS | Backend write-set is connector-only. |
| Commit author/body hygiene | PASS | Single commit by `Dynasia G <dynasia@trygrowthproject.com>`, empty body, no trailers/co-authors. |

## Findings

### 1. HIGH — Bradley Law violation: `stub` literals remain in the Withings write-set

**Code:** `src/wearables/connectors/withings/withings.connector.spec.ts:14-22` and `src/wearables/connectors/withings/withings-webhook.controller.spec.ts:31-37,297-299`

```ts
// withings.connector.spec.ts
* `ProviderHttpClient` is stubbed so no real network is touched: `request`
...
/** Minimal Prisma stub exposing only the connection.update path. */

// withings-webhook.controller.spec.ts
* the authentication gate without stubbing the connector verifier.
...
// is exercised, not a stub.
```

**Impact:** The R3 Bradley Law explicitly says any `Coming soon`, `TODO`, `XXX`, or `stub` literal is a P1 violation. These are comments/test helper descriptions rather than production stubs, but the law is literal and non-discretionary for this audit.

**Expected fix:** Replace the four literal occurrences with neutral terms such as `mocked`, `fake`, or `test double`, then re-run `grep -RInE "Coming soon|TODO|XXX|stub|@ts-ignore|as any" src/wearables/connectors/withings` and verify it returns no matches.

### 2. HIGH — Bradley Law violation: best-effort error updates swallow exceptions

**Code:** `src/wearables/connectors/withings/withings-webhook.controller.ts:205-214` and `src/wearables/connectors/withings/withings.connector.ts:644-658`

```ts
await this.prisma.wearableConnection
  .update({
    where: { id: connection.id },
    data: {
      status: 'error',
      last_error: safeError,
    },
  })
  .catch(() => undefined);
```

```ts
await this.prisma.wearableConnection
  .update({
    where: { id: conn.id },
    data: { status: 'error', last_error: message },
  })
  .catch(() => undefined);
```

**Impact:** The original provider error is still rethrown, so these paths do not mask the webhook/fetch failure. However, the audit instruction says any swallowed exception is P1; these `.catch(() => undefined)` handlers suppress DB update failures with no log or returned signal, so the status/`last_error` durability failure disappears.

**Expected fix:** Replace the swallowed catches with explicit handling that preserves the original error while logging the redacted persistence failure, or restructure with nested `try/catch` that logs a safe structured warning and then rethrows the original provider error. Add tests asserting the original provider failure still propagates and the failed error-status persistence attempt is observable without leaking secrets.

## Positive observations

- All five gates pass at the audited SHA.
- R2 correctly aligned Withings webhook auth with the documented form-encoded callback model and removed the synthetic HMAC requirement.
- R2 correctly redacts webhook failure `last_error` and `error_message` before persistence/logging.
- R2 commit hygiene is clean: author is correct and the commit body is empty.
- The normalizer maps every required §3.1 Withings metric with real-value assertions.

## Final verdict

NOT CLEAN. The R1 functional/security findings are resolved and the validation gates pass, but R3 cannot be clean under the explicit Bradley Law rules while `stub` literals and swallowed `.catch(() => undefined)` handlers remain in the Withings write-set.

## Audit commit hygiene check

```text
AUTHOR_CHECK_FORMATTED:
Dynasia G <dynasia@trygrowthproject.com>
---COMMIT-END---
```
