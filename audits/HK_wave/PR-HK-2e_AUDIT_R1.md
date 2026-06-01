# PR-HK-2.e — Fitbit connector — R1 audit

**Verdict:** FAIL — webhook validation is not strict, a required §3.1 heart-rate metric is missing, webhook error redaction has an unsafe edge path, and the required wearables Jest gate did not complete.

**Repo:** `growth-project-backend`  
**PR:** #353  
**Audited head SHA:** `2e41a47c74df97d83063e024bb649291bc8053d4`  
**Base:** `main` @ `8cfb44f6`  
**Build report reviewed:** `HK_PR-HK-2e-fitbit_BUILD.md` @ `e4b7f94`  
**Auditor:** R1

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

No module/registry/schema/interface edits were present in the backend diff. The build report is the only non-backend artifact reviewed for this unit.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/fitbit/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | **FAIL** — required exact command was killed before Jest printed a final summary |
| Build | `npx nest build` | PASS, exit 0 |

Gate logs were captured under `audits/HK_wave/logs/PR-HK-2e_R1_*.log` from an isolated worktree pinned to `2e41a47c74df97d83063e024bb649291bc8053d4`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `FitbitConnector implements WearableConnector`; provider is `FITBIT`, auth model follows the current codebase enum as `oauth2`. |
| OAuth URL/scopes/token URL | PASS with note | Auth/token endpoints and scopes match Fitbit, and PKCE helper exists. The interface method `buildAuthUrl(userId, state)` omits PKCE params unless callers use the Fitbit-specific `buildAuthUrlPkce()` helper. |
| Refresh-token rotation | PASS | `refresh()` returns a rotated refresh token and falls back to the existing one if Fitbit omits it. |
| Backfill window | PASS | Backfill clamps to the configured 30-day window and uses `ProviderHttpClient` for every provider call. |
| Rate-limit handling | PASS by shared client | Provider calls route through `ProviderHttpClient`; no Fitbit-specific 429 header handling is implemented, but the shared timeout/backoff lane is used. |
| GET verification handshake | PASS | Returns 204 only when `FITBIT_VERIFICATION_CODE` matches; missing/mismatched config returns 404. |
| POST HMAC validation | PASS | `verifyWebhook()` rejects missing secret, missing signature, bad signature, and missing raw body before processing. |
| POST throttling | PASS | `@Throttle` is present on GET and POST routes. |
| POST dedup / idempotency | PASS with doctrine note | Replay check occurs before processing; dedup row is written only after fetch/normalize/ingest succeeds. This follows the R2 no-data-loss invariant even though one brief line says “upsert FIRST” while also saying never mark processed before processing succeeds. |
| Durable event record before 204 | PASS | For successful notifications, `WearableProcessedEvent.create()` is awaited before the controller returns 204. |
| Webhook validation | **FAIL** | See Finding 1: schema uses `.passthrough()`, accepts a singleton object, and does not constrain collection/owner enums. |
| No PII in logs | PASS | Webhook logs use `sha256(ownerId).slice(0,16)` and do not log raw payloads. |
| OAuth/provider error redaction | **FAIL** | See Finding 3: connector-level backfill/refresh redaction exists, but the webhook controller catch path persists/logs raw `err.message`. |
| KMS token posture | PASS | Connector returns token sets and reads decrypted token fields; it does not persist plaintext tokens in this write-set. |
| Normalizer mapping — `activities/steps` → `STEPS` | PASS | Real provider-shaped test asserts exact metric/unit/bucket/window/value. |
| Normalizer mapping — `activities/heart` → `RESTING_HEART_RATE_BPM` / `HEART_RATE_BPM` | **FAIL** | See Finding 2: resting HR is emitted, but `HEART_RATE_BPM` is not emitted or tested. |
| Normalizer mapping — `sleep` → `SLEEP_*_MIN` / `SLEEP_EFFICIENCY_PCT` | PASS | Modern and classic sleep tests assert explicit sample shapes. |
| Normalizer mapping — `body/weight` → `BODY_WEIGHT_KG` | PASS | Weight test asserts kg metric, bucket, unit, instant, and source record id. |
| Normalizer mapping — `br` → `RESPIRATORY_RATE_BRPM` | PASS | Breathing-rate test asserts metric/unit/bucket/value/window. |
| Normalizer mapping — `spo2` → `SPO2_PCT` | PASS | SpO2 array and singleton forms are tested. |
| Tests / gate discipline | **FAIL** | See Finding 4: the exact required full wearables Jest command did not complete. |
| File hygiene | PASS | Two commits by Dynasia G; no co-author/generated-by/trailer lines observed. |

## Findings

### 1. HIGH — Fitbit webhook Zod validation is not strict and accepts non-Fitbit envelope shapes

**Code:** `src/wearables/connectors/fitbit/fitbit-webhook.controller.ts:268-279`

```ts
const notification = z
  .object({
    collectionType: z.string().min(1),
    date: z.string().min(1).optional(),
    ownerId: z.string().min(1),
    ownerType: z.string().min(1),
    subscriptionId: z.string().min(1),
  })
  .passthrough();

// Fitbit always sends an array; tolerate a single object defensively.
const schema = z.union([z.array(notification), notification]);
```

The Wave 2 audit doctrine requires strict webhook schemas: `.strict()` with invalid payloads returning 400 and no raw-payload echo. This controller instead uses `.passthrough()`, accepts arbitrary unknown fields, accepts a single object even though Fitbit subscription POSTs are documented as arrays, and only checks `collectionType` / `ownerType` as non-empty strings rather than constraining the expected Fitbit values.

**Impact:** Malformed-but-signed webhook bodies can be processed, logged as handled, and recorded into `WearableProcessedEvent`. Unknown or misspelled collection types are acknowledged and deduped even though no data is fetched, which weakens the fail-closed validation gate on a public webhook endpoint.

**Expected fix:** Change the notification schema to `.strict()`, accept only `z.array(notification)`, constrain `collectionType` to the supported Fitbit notification types and `ownerType` to the expected value, and add regression tests for unknown fields, singleton object bodies, invalid collection types, and invalid owner types returning 400 before dedup/fetch/ingest.

### 2. MEDIUM — Required `HEART_RATE_BPM` mapping from §3.1 is missing

**Code:** `src/wearables/connectors/fitbit/fitbit.normalizer.ts:159-178`

```ts
function normalizeHeart(ctx: FitbitRawPayload): NormalizedSample[] {
  const rec = ctx.record as FitbitHeartTimeSeries;
  const series = rec['activities-heart'];
  if (!Array.isArray(series)) return [];
  const out: NormalizedSample[] = [];
  for (const entry of series) {
    if (!entry?.dateTime) continue;
    const window = dayWindow(entry.dateTime);
    if (!window) continue;
    const rhr = toFiniteNumber(entry.value?.restingHeartRate);
    const sample = build(ctx, null, {
      metric: 'RESTING_HEART_RATE_BPM',
      bucket: 'HEALTH_FITNESS',
      value: rhr,
      unit: UNIT.BPM,
      ...window,
    });
    if (sample) out.push(sample);
  }
  return out;
}
```

AGENT_2_CODING_PLAN §3.1 binds Fitbit `activities/heart` to both `RESTING_HEART_RATE_BPM` and `HEART_RATE_BPM`. The implementation emits only `RESTING_HEART_RATE_BPM`; there is no `HEART_RATE_BPM` branch, provider shape, or test assertion for daily/intraday heart-rate samples.

**Impact:** Fitbit users will not contribute the canonical `HEART_RATE_BPM` metric even though the connector claims the Fitbit row is covered. Downstream Health & Fitness views and AI context that expect cross-provider `HEART_RATE_BPM` will see a provider-specific gap.

**Expected fix:** Fetch/parse the Fitbit heart-rate payload needed to compute the documented `HEART_RATE_BPM` value, emit a canonical sample with `metric='HEART_RATE_BPM'`, `bucket='HEALTH_FITNESS'`, `unit='bpm'`, deterministic window/source id, and add a real provider-shaped normalizer test asserting the exact `NormalizedSample` fields.

### 3. MEDIUM — Webhook ingest failure path persists and logs raw `err.message` instead of the connector redactor

**Code:** `src/wearables/connectors/fitbit/fitbit-webhook.controller.ts:186-205`

```ts
} catch (err) {
  // Fail-explicit: mark the connection in error, log redacted, and
  // rethrow so the delivery is retried (no silent swallow, #36/#50).
  // No processed-event row was written, so the retry reprocesses.
  await this.prisma.wearableConnection
    .update({
      where: { id: connection.id },
      data: {
        status: 'error',
        last_error: (err as Error)?.message?.slice(0, 500) ?? 'unknown',
      },
    })
    .catch(() => undefined);
  this.logger.error({
    msg: 'wearables.fitbit.webhook.ingest_failure',
    provider: 'FITBIT',
    collection_type: notification.collectionType,
    user_hash: userHash,
    error_message: (err as Error)?.message ?? String(err),
  });
  throw err;
}
```

The connector defines and tests `redactErrorMessage()` for token/client-secret/Bearer/Basic redaction, and `markConnectionError()` uses it for backfill/refresh failures. The webhook controller does not use that redactor in its catch path, despite the comment saying the log is redacted.

**Impact:** A provider/HTTP/client error that includes an authorization header, OAuth code, token, client secret, or raw response detail can be written to `WearableConnection.last_error` and emitted to logs during webhook-triggered fetch/ingest failures. This repeats the prior-audit “OAuth error log redaction” class on an edge path.

**Expected fix:** Use the same redaction helper before both the `last_error` write and `logger.error()` call, or centralize this path through `FitbitConnector.markConnectionError()`. Add a webhook controller regression test with an error message containing `Authorization: Bearer ...`, `client_secret=...`, and `refresh_token=...`, asserting none of those raw values reach DB writes or logs.

### 4. MEDIUM — Required full wearables Jest gate did not complete under the exact audit command

**Code:** `audits/HK_wave/logs/PR-HK-2e_R1_jest.log`

```text
# Command: npx jest --roots src/wearables --runInBand --no-cache
# CWD: /home/user/workspace/repos/growth-project-backend-pr353-fitbit-r1
# HEAD: 2e41a47c74df97d83063e024bb649291bc8053d4
...
# Audit note: command was killed by the sandbox before Jest printed a final summary. Treating gate as FAIL because the required exact command did not complete.
# Exit code: killed
```

The build report claims the equivalent gate passed by batching sub-folders because the exact single-process in-band command OOMs the sandbox. The R1 brief requires the exact command above, with full stdout/stderr captured. That command did not reach a Jest summary or exit 0 in this audit run.

**Impact:** The required regression gate is not independently green at the audited SHA. Even if the individual suites are likely healthy, the audit cannot certify the full wearables test command as passing.

**Expected fix:** Make the required command complete reliably in the audit environment, or update the shared gate doctrine to an explicitly supported sharded command set and rerun it with complete logs. Until then, this gate must remain FAIL.

## Positive observations

- The connector stays inside the required file-disjoint Fitbit folder and leaves shared registry/module/schema/interface files untouched.
- HMAC verification is raw-body based, fails closed when the client secret or signature is missing, and uses a length-safe constant-time comparison.
- The webhook replay/no-data-loss ordering is careful: fetch/normalize/ingest happens before the processed-event commit, and P2002 concurrent commits are treated as benign.
- Most required Fitbit metrics have real provider-shaped normalizer tests with concrete value/unit/bucket/window assertions.
- Connector-level backfill and refresh outage paths use the shared `ProviderHttpClient`, mark connection status explicitly, and redact token-like secrets in those paths.

## Final verdict

FAIL. The Fitbit connector is close on file hygiene, OAuth basics, HMAC verification, and most normalization coverage, but it cannot be accepted at R1 because the public webhook validation is not strict/fail-closed, a binding §3.1 `HEART_RATE_BPM` output is missing, webhook-triggered errors bypass the tested redaction helper, and the required full wearables Jest gate did not complete under the exact audit command.

## Audit commit hygiene check

```text
2e41a47c74df97d83063e024bb649291bc8053d4
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.e: lint cleanup (hoist crypto import, drop unused NotFoundException)

---END---
b558e675f76bda0fa62e69ee72375a0dd5f1b730
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.e: Fitbit connector (types, normalizer, connector, webhook, module + specs)

---END---
```
