# PR-HK-2.e — Fitbit connector — R5 audit

**Verdict:** NOT CLEAN — R4 resolved the R3 swallowed-error P1s and all five gates pass, but the webhook schema still accepts missing `date` on data-bearing Fitbit notifications and then commits a processed-event row without fetching data.

**Repo:** `growth-project-backend`
**PR:** #353
**Audited head SHA:** `00d031f4f9b4ec4ab94d8b1c25efdb0ddf91a1b4`
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`
**Build report reviewed:** `HK_PR-HK-2e-fitbit_BUILD.md` @ docs current copy
**R4 fixer report reviewed:** `/home/user/workspace/fitbit_pr353_R4_fix_summary.json`
**Auditor:** R5

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

No module/registry/schema/interface edits are present. The inspection worktree `/home/user/workspace/wt-fitbit-353-r5-00d031f` was detached at `00d031f4f9b4ec4ab94d8b1c25efdb0ddf91a1b4`; gates were run in `/home/user/workspace/wt-fitbit-353`, also pinned to the same SHA, because it already had the repository dependency symlink while the filesystem was initially full.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/fitbit/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 341 tests |
| Build | `npx nest build` | PASS, exit 0 |

Gate logs are saved under `audits/HK_wave/logs/PR-HK-2e_R5_*.log`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `FitbitConnector implements WearableConnector`; provider is `FITBIT`, auth model is `oauth2`. |
| OAuth URL/scopes/token URL | PASS | Fitbit authorize/token URLs, full scope set, Basic token auth, and optional PKCE helper are implemented and tested. |
| Refresh-token rotation | PASS | `refresh()` returns Fitbit's rotated refresh token and falls back only when omitted. |
| Backfill window | PASS | Backfill is clamped to 30 days and routes through `ProviderHttpClient`. |
| Rate-limit/timeout handling | PASS by shared client | Provider calls route through `ProviderHttpClient` with timeout/backoff behavior covered in the wearables suite. |
| GET verification handshake | PASS | Missing or mismatched `FITBIT_VERIFICATION_CODE` returns 404; exact match returns 204. |
| POST HMAC validation | PASS | Missing secret/signature/raw body and invalid HMAC reject before processing. |
| POST throttling | PASS | `@Throttle` is present on GET and POST routes. |
| POST dedup / idempotency | PASS with separate date-validation failure below | The controller checks for an existing processed event, performs fetch/normalize/ingest, then commits the processed row after success. |
| Durable event record before 204 | PASS for valid data-bearing notifications | Successful notifications create `WearableProcessedEvent` before returning 204. |
| Webhook validation | **FAIL** | The envelope is array-only and `.strict()`, but `date` is optional for every `collectionType`; see Finding 1. |
| No PII in logs | PASS | Webhook logs use `user_hash` rather than raw owner IDs. |
| OAuth/provider error redaction | PASS | `redactErrorMessage()` is applied before `last_error` persistence and structured logs. |
| KMS token posture | PASS | Connector returns token sets and consumes decrypted token fields; no plaintext persistence in this write-set. |
| Normalizer mapping — `activities/steps` → `STEPS` | PASS | Provider-shaped tests assert concrete sample values. |
| Normalizer mapping — `activities/heart` → `RESTING_HEART_RATE_BPM` / `HEART_RATE_BPM` | PASS | `HEART_RATE_BPM` is minutes-weighted from Fitbit heart-rate zones and tested. |
| Normalizer mapping — `sleep` → `SLEEP_*_MIN` / `SLEEP_EFFICIENCY_PCT` | PASS | Modern and classic sleep paths remain covered. |
| Normalizer mapping — `body/weight` → `BODY_WEIGHT_KG` | PASS | Weight mapping remains covered. |
| Normalizer mapping — `br` → `RESPIRATORY_RATE_BRPM` | PASS | Breathing-rate mapping remains covered. |
| Normalizer mapping — `spo2` → `SPO2_PCT` | PASS | SpO2 mapping remains covered. |
| Tests / gate discipline | PASS | Exact wearables Jest command completed: 20 suites, 341 tests. |
| R3 P1 — webhook ingest-failure status update swallow | RESOLVED | The `.catch(() => undefined)` path was replaced with explicit try/catch, structured `wearables.fitbit.webhook.error_marking_failed` logging, and original-error rethrow. |
| R3 P1 — connector `markConnectionError` swallow | RESOLVED | The `.catch(() => undefined)` path was replaced with explicit try/catch, structured `wearables.fitbit.error_marking_failed` logging, and caller rethrow. |
| Regression test quality (#17) | PASS | New tests fail against the old swallowing implementation; see `PR-HK-2e_R5_mutation_old_swallow_tests.log` showing both new logging assertions fail on `5ce58bf`. |
| Bradley Law — no remaining swallowed exception in write-set | PASS | No `.catch(() => undefined)`, empty catch, `console.log`-only handler, `@ts-ignore`, or `as any` bypass remains in the Fitbit write-set. |
| Bradley Law — fail-closed validation | **FAIL** | Missing `date` on data-bearing collection types is accepted and committed. |
| File hygiene | PASS | All backend commits are authored by Dynasia G with empty bodies and no trailers. |

## R3 / R4 finding verification

| Prior item | R5 status | Evidence |
| --- | --- | --- |
| R3 P1: `fitbit-webhook.controller.ts` swallowed failed error-status DB update | RESOLVED | Lines 203-234 now redact the original provider error, try the status update, log `wearables.fitbit.webhook.error_marking_failed` on a marking failure, then log/rethrow the original provider error. |
| R3 P1: `fitbit.connector.ts` `markConnectionError` swallowed failed error-status DB update | RESOLVED | Lines 591-618 now log the provider failure, try the status update, and log `wearables.fitbit.error_marking_failed` on a marking failure; callers still rethrow. |
| Test quality for the R3 P1 regression | RESOLVED | Running the new R4 tests against the old `5ce58bf` implementations produced two expected failures because neither old path logged the marking failure. |

## R65 / 50-Failures sweep notes

| Pattern | Status | Notes |
| --- | --- | --- |
| #1 Hardcoded secrets | PASS | No secrets are hardcoded; provider credentials come from env. |
| #3 SQL injection | PASS | Fitbit code uses Prisma and `ProviderHttpClient`; no raw SQL construction. |
| #5 IDOR | PASS | Webhook lookup scopes by provider + Fitbit owner ID + `disconnected_at: null` after HMAC validation. |
| #8 Runtime input validation | **FAIL** | Conditional required `date` validation is missing for data-bearing Fitbit notifications. |
| #10 New vulnerable dependencies | PASS | No new dependencies added. |
| #12 Secret exposure in errors | PASS | Token-like values are redacted before persistence/logging. |
| #17 Fake test coverage | PASS for R4 regression; gap in Finding 1 | R4's new swallow-regression tests are meaningful, but no test covers a data-bearing notification without `date`. |
| #21 N+1 | PASS | Connector returns records to a batch ingestion lane; no per-sample DB writes in the normalizer. |
| #28/#29 replay/idempotency | PASS with Finding 1 caveat | Valid notifications commit after ingest; malformed missing-date notifications can still be committed without ingest. |
| #34 Observability | PASS | Error paths use structured logs with provider, op/collection, user hash or connection id, and redacted messages. |
| #35/#50 timeout/degradation | PASS | Provider HTTP calls route through `ProviderHttpClient`; outages mark connection error and propagate. |
| #36 silent failures | PASS for R3 fix | The prior swallowed DB-update failures are no longer silent. |
| #44 transactions | N/A in connector diff | No new multi-table transactional write sequence was added in this connector diff. |

## Findings

### 1. HIGH — Webhook schema accepts data-bearing notifications without `date`, then records them processed without fetching data

**Code:** `src/wearables/connectors/fitbit/fitbit-webhook.controller.ts:304-313`

```ts
const notification = z
  .object({
    collectionType: z.enum(FITBIT_NOTIFICATION_COLLECTION_TYPES),
    // Fitbit omits `date` only for the synthetic userRevokedAccess event.
    date: z.string().min(1).optional(),
    ownerId: z.string().min(1),
    ownerType: z.literal(FITBIT_NOTIFICATION_OWNER_TYPE),
    subscriptionId: z.string().min(1),
  })
  .strict();
```

**Code:** `src/wearables/connectors/fitbit/fitbit.connector.ts:419-420`

```ts
const collections = NOTIFICATION_COLLECTIONS[notification.collectionType];
if (!collections || !notification.date) return [];
```

**Code:** `src/wearables/connectors/fitbit/fitbit-webhook.controller.ts:252-260`

```ts
await this.prisma.wearableProcessedEvent.create({
  data: {
    provider: WearableProvider.FITBIT,
    provider_event_id: providerEventId,
    type: `${notification.collectionType}.updated`,
    handler_completed_at: new Date(),
  },
});
```

The controller comments correctly state that Fitbit omits `date` only for `userRevokedAccess`, but the Zod schema makes `date` optional for every collection. For a data-bearing notification such as `sleep`, `activities`, `heart`, `body`, `br`, or `spo2` with no `date`, validation passes, `fetchNotificationRecords()` returns `[]`, ingestion is skipped, and the controller still commits a `WearableProcessedEvent` row. That acknowledged event will be treated as already processed on redelivery.

**Impact:** A malformed but HMAC-valid data notification can be acknowledged and deduped without fetching or ingesting the changed Fitbit data. This is a fail-open validation/data-loss path at the webhook boundary and violates the PR-HK-2 requirement that malformed payloads fail closed before side effects.

**Expected fix:** Make the webhook schema conditional: `date` must be present and non-empty for every data-bearing `collectionType`; it may be absent only when `collectionType === 'userRevokedAccess'`. Add regression tests proving missing `date` for `sleep`/`activities` returns 400 and performs no `findUnique`, fetch, ingest, or processed-event create, while `userRevokedAccess` without `date` remains accepted.

## Positive observations

- The R3 swallowed-error P1 is fixed in both locations with structured secondary-failure logs and original-error propagation.
- The R4 regression tests are not fake coverage: both new tests fail against the old `.catch(() => undefined)` implementation.
- All five required gates pass at the audited SHA.
- The Fitbit normalizer covers the full §3.1 mapping, including the previously missing `HEART_RATE_BPM` value.
- Error redaction covers Bearer/Basic headers and token-like query/body fields before persistence or logs.

## Final verdict

NOT CLEAN. The R3 P1 is resolved and gate health is green at `00d031f4f9b4ec4ab94d8b1c25efdb0ddf91a1b4`, but the webhook still has a P1 fail-open validation path: data-bearing notifications may omit `date`, skip fetch/ingest, and still be marked processed. The PR should not merge until that branch fails closed with a regression test.

## Audit commit hygiene check

```text
00d031f4f9b4ec4ab94d8b1c25efdb0ddf91a1b4
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.e: surface error-status DB write failures (no silent .catch)

---END---
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
