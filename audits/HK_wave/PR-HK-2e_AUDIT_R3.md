# PR-HK-2.e — Fitbit connector — R3 audit

**Verdict:** NOT CLEAN — the R2 fixes resolved the strict webhook envelope, `HEART_RATE_BPM` mapping, webhook error redaction, and Jest gate, but Bradley Law still fails on swallowed exception paths.

**Repo:** `growth-project-backend`  
**PR:** #353  
**Audited head SHA:** `5ce58bf695c1c1026b20a1f28715d9105d835da7`  
**Base:** `main` @ `0a221893b2e0ce1808450afbe9776b5df8d80dc6`  
**R2 fixer report reviewed:** `/home/user/workspace/fitbit_pr353_R2_fix_summary.json`  
**Auditor:** R3

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/fitbit/`:

```text
src/wearables/connectors/fitbit/fitbit-webhook.controller.spec.ts
src/wearables/connectors/fitbit/fitbit-webhook.controller.ts
src/wearables/connectors/fitbit/fitbit.connector.spec.ts
src/wearables/connectors/fitbit/fitbit.connector.ts
src/wearables/connectors/fitbit/fitbit.module.ts
src/wearables/connectors/fitbit/fitbit.normalizer.spec.ts
src/wearables/connectors/fitbit/fitbit.normalizer.ts
src/wearables/connectors/fitbit/fitbit.types.ts
src/wearables/connectors/fitbit/index.ts
```

No module/registry/schema/interface edits were present in the backend diff. The audit worktree was pinned to `5ce58bf695c1c1026b20a1f28715d9105d835da7` before inspection and gate execution.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/fitbit/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 339 tests |
| Build | `npx nest build` | PASS, exit 0 |

Gate logs were captured under `audits/HK_wave/logs/PR-HK-2e_R3_*.log`. Because the workspace filesystem had no room for a second full `node_modules`, gate execution used a second detached git worktree on temporary storage pinned to the same SHA for the memory/disk-heavy commands; logs include the CWD and audited HEAD.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `FitbitConnector implements WearableConnector`; provider is `FITBIT`, auth model is `oauth2`. |
| OAuth URL/scopes/token URL | PASS | Fitbit OAuth, token exchange, refresh, and PKCE helpers remain implemented and tested. |
| Refresh-token rotation | PASS | `refresh()` returns Fitbit's rotated refresh token and falls back only if omitted. |
| Backfill window | PASS | Backfill remains clamped to the configured Fitbit window and uses `ProviderHttpClient`. |
| Rate-limit handling | PASS by shared client | Provider calls route through the shared timeout/backoff lane. |
| GET verification handshake | PASS | Missing or mismatched `FITBIT_VERIFICATION_CODE` returns 404; exact match returns 204. |
| POST HMAC validation | PASS | Missing secret/signature/raw body and invalid HMAC reject before processing. |
| POST throttling | PASS | `@Throttle` is present on GET and POST routes. |
| POST dedup / idempotency | PASS with doctrine note | The controller checks for an existing processed event, performs fetch/normalize/ingest, then commits the processed row after success. |
| Durable event record before 204 | PASS | Successful notifications create `WearableProcessedEvent` before returning 204. |
| Webhook validation | PASS | R2 fixed this: schema is array-only, `.strict()`, and constrains `collectionType` / `ownerType`. |
| No PII in logs | PASS | Webhook logs use `user_hash` rather than raw owner IDs. |
| OAuth/provider error redaction | PASS | R2 fixed this edge path: webhook ingest failures use `redactErrorMessage()` before `last_error` and logs. |
| KMS token posture | PASS | Connector returns token sets and consumes decrypted token fields; no plaintext persistence in this write-set. |
| Normalizer mapping — `activities/steps` → `STEPS` | PASS | Provider-shaped tests assert concrete sample values. |
| Normalizer mapping — `activities/heart` → `RESTING_HEART_RATE_BPM` / `HEART_RATE_BPM` | PASS | R2 added `HEART_RATE_BPM` via minutes-weighted heart-rate-zone midpoint average and tests. |
| Normalizer mapping — `sleep` → `SLEEP_*_MIN` / `SLEEP_EFFICIENCY_PCT` | PASS | Modern and classic sleep paths remain covered. |
| Normalizer mapping — `body/weight` → `BODY_WEIGHT_KG` | PASS | Weight mapping remains covered. |
| Normalizer mapping — `br` → `RESPIRATORY_RATE_BRPM` | PASS | Breathing-rate mapping remains covered. |
| Normalizer mapping — `spo2` → `SPO2_PCT` | PASS | SpO2 mapping remains covered. |
| Tests / gate discipline | PASS | Exact wearables Jest command completed: 20 suites, 339 tests. |
| Bradley Law — no swallowed exception | **FAIL** | See Finding 1: DB update failures are explicitly swallowed with `.catch(() => undefined)`. |
| Bradley Law — no `@ts-ignore` / `as any` bypass | PASS | No `@ts-ignore` or `as any` bypass was found in the Fitbit connector. |
| Bradley Law — fail-closed validation | PASS | Invalid webhook payloads fail closed with 400 before side effects. |
| File hygiene | PASS | All commits are authored by Dynasia G with empty bodies and no trailers. |

## R1 finding verification

| R1 finding | R3 status | Evidence |
| --- | --- | --- |
| P1 Strict Zod envelope | RESOLVED | `parseAndValidate()` now uses `z.array(z.object(...).strict())`, `z.enum(FITBIT_NOTIFICATION_COLLECTION_TYPES)`, and `z.literal('user')`; tests cover singleton object, unknown field, bad collection type, and bad owner type. |
| P2 `HEART_RATE_BPM` mapping | RESOLVED | `normalizeHeart()` emits `HEART_RATE_BPM` using minutes-weighted heart-rate-zone midpoints, drops absent/no-minute data, and tests assert exact values. |
| P2 `last_error` redaction | RESOLVED | Webhook catch path computes `safeMessage = redactErrorMessage(err)` before both `last_error` persistence and logger output; regression tests assert Bearer/client_secret/refresh_token redaction. |
| P2 Jest gate | RESOLVED | Exact `npx jest --roots src/wearables --runInBand --no-cache` passed with 20 suites / 339 tests. |

## Findings

### 1. HIGH — Error-status DB update failures are swallowed instead of surfaced or logged

**Code:** `src/wearables/connectors/fitbit/fitbit-webhook.controller.ts:203-212`

```ts
const safeMessage = redactErrorMessage(err);
await this.prisma.wearableConnection
  .update({
    where: { id: connection.id },
    data: {
      status: 'error',
      last_error: safeMessage,
    },
  })
  .catch(() => undefined);
```

**Code:** `src/wearables/connectors/fitbit/fitbit.connector.ts:591-604`

```ts
const message = redactErrorMessage(err);
this.logger.error({
  msg: 'wearables.fitbit.connection_error',
  op,
  provider: 'FITBIT',
  error_message: message,
});
if (!this.prisma || !conn?.id) return;
await this.prisma.wearableConnection
  .update({
    where: { id: conn.id },
    data: { status: 'error', last_error: message },
  })
  .catch(() => undefined);
```

Bradley Law treats any swallowed exception as a P1 violation. Both error-handling paths intentionally hide a failed `WearableConnection` status update; the original provider error is rethrown in the controller/backfill/refresh paths, but the failure to persist the explicit error state is lost with no log, metric, or retry signal.

**Impact:** A database/RLS/connection failure can leave the wearable connection showing its previous state even though Fitbit fetch/ingest/refresh failed. Operators lose the only evidence that the fail-explicit status update itself failed, and the system can misrepresent a broken connector as healthy/stale.

**Expected fix:** Replace `.catch(() => undefined)` with an explicit logged secondary failure path, or let the status-update failure propagate after preserving the original error context. Add tests proving DB update failures are not silently swallowed.

## Positive observations

- The R2 webhook schema fix is strict and fail-closed: array-only, no unknown fields, constrained `collectionType`, and literal `ownerType='user'`.
- The `HEART_RATE_BPM` implementation is deterministic and tested with exact weighted-average values.
- The webhook redaction regression now covers `Authorization: Bearer`, `client_secret`, and `refresh_token` leakage before persistence/logging.
- The exact wearables Jest gate now completes green in this audit.

## Final verdict

NOT CLEAN. The original R1 technical defects were resolved, and all five gates are green at `5ce58bf695c1c1026b20a1f28715d9105d835da7`; however, the connector still violates Bradley Law because two error-status persistence paths swallow database update exceptions with `.catch(() => undefined)`. This is a P1 until those exceptions are surfaced or logged explicitly.

## Audit commit hygiene check

```text
5ce58bf695c1c1026b20a1f28715d9105d835da7
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.e: strict Fitbit webhook envelope, HEART_RATE_BPM mapping, webhook error redaction

---END---
2e41a47c74df97d83063e024bb649291bc8053d4
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.e: lint cleanup (hoist crypto import, drop unused NotFoundException)

---END---
b558e675f76bda0fa62e69ee72375a0dd5f1b730
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.e: Fitbit connector (types, normalizer, connector, webhook, module + specs)

---END---
```
