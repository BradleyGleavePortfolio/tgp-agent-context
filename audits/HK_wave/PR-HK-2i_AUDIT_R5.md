# PR-HK-2.i — Withings connector — R5 audit

**Verdict:** CLEAN

**Repo:** `growth-project-backend`  
**PR:** #352  
**Audited head SHA:** `ede670e498f692c78a2614792c4f5df2133404a8`  
**Base:** pre-Strava `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2i-withings_BUILD.md` @ `e4b7f94bb06427e24e7cfc21f2b65729c143c79e`  
**Auditor:** R5

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

No module/registry/schema/ingestion edits are present in the backend diff. The merge-base is `8cfb44f6`, preserving the pre-Strava base and satisfying R55 for this pinned re-audit.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | PASS, exit 0 |
| Types | `NODE_OPTIONS='--max-old-space-size=1536' npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/withings/` | PASS, exit 0 |
| Wearables regression | `NODE_OPTIONS='--max-old-space-size=1536' npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 331 tests |
| Build | `NODE_OPTIONS='--max-old-space-size=1536' npx nest build` | PASS, exit 0 |

Logs were written under `audits/HK_wave/logs/PR-HK-2i_R5_*.log`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `WithingsConnector implements WearableConnector`; `provider = WITHINGS`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Auth URL, token URL, client env, redirect URI, state, and `user.metrics,user.activity` scopes are implemented and tested. |
| Refresh-token handling | PASS | Refresh uses transient decrypted token input and returns the rotated/fallback refresh token for PR-HK-1 to KMS-wrap. |
| KMS token handling | PASS | Connector returns `TokenSet` only; no plaintext token DB writes are introduced in this PR. |
| HTTP discipline / backoff | PASS | Provider calls use `ProviderHttpClient`; backfill and fetch paths are paged. |
| Backfill pagination / TOS window | PASS | Backfill clamps to 90 days and pages `measure` + `sleep` via `more/offset`. |
| Webhook raw body + throttling | PASS | Controller requires `rawBody`, is `@Public`, and uses `@Throttle`. |
| Webhook fail-closed config | PASS | Missing `WITHINGS_WEBHOOK_SECRET` returns 503 before DB work. |
| Webhook authenticity validation | PASS | The R3-approved secret callback URL model remains implemented: Withings documents form-encoded callback notifications with fields such as `userid`, `appli`, `startdate`, and `enddate`, and that page does not document an inbound HMAC/signature header ([Withings notification content](https://developer.withings.com/developer-guide/v3/data-api/notifications/notification-content/)). Withings also documents notification subscription by access token and `callbackurl`, without documenting inbound callback HMAC requirements ([Withings notification subscribe](https://developer.withings.com/developer-guide/v3/data-api/notifications/notification-subscribe/)). |
| Callback URL posture | PASS | The callback URL constraints are compatible with a secret HTTPS callback URL: Withings requires HTTPS, URL-encoded valid URLs, max 255 chars, no IP/localhost, and ports 80/443 only ([Withings glossary](https://developer.withings.com/developer-guide/v3/glossary/glossary-page/)). |
| Zod webhook payload validation | PASS | `WithingsNotifySchema` is `.strict()` and rejects missing, non-numeric, and unknown keys. |
| Webhook idempotency ordering | PASS with caveat | Existing processed events no-op; the dedup row is created only after successful fetch/ingest and P2002 concurrent commit is absorbed. This preserves retryability after fetch/ingest failure while retaining the previously noted check/process/commit caveat. |
| Durable enqueue / ingestion before 200 | PASS | First delivery fetches changed records, normalizes, ingests, then records completion before returning 200. |
| PII in logs | PASS | No raw `userid` is logged; failure paths log only provider, appli, error class/message, and connection id. |
| OAuth/provider error log redaction | PASS | Connector-level and webhook-level failure marking use `redactErrorMessage`; tests assert bearer/access/client-secret redaction. |
| R3 Finding 1 — `stub` literals | RESOLVED | `grep -RInE "Coming soon|TODO|XXX|stub|@ts-ignore|as any" src/wearables/connectors/withings` returns no matches. |
| R3 Finding 2 — swallowed `.catch(() => undefined)` | RESOLVED | Both prior sites now use explicit nested `try/catch`, structured redacted logging, and rethrow of the original provider/webhook failure. |
| Normalizer: `measure` type 1 → `BODY_WEIGHT_KG` | PASS | Real provider-shaped test asserts 70.5 kg. |
| Normalizer: `measure` type 6 → `BODY_FAT_PCT` | PASS | Real provider-shaped test asserts 18.25%. |
| Normalizer: `measure` type 9/10 → `BLOOD_PRESSURE_DIA/SYS` | PASS | Test emits both BP metrics with mmHg values. |
| Normalizer: `sleep` → `SLEEP_TOTAL/REM/DEEP/LIGHT/AWAKE_MIN` | PASS | Test asserts all stage values in minutes. |
| Normalizer: `sleep` → `SLEEP_EFFICIENCY_PCT` | PASS | Test asserts 0.89 ratio becomes 89%. |
| Normalizer: `sleep` → `RESPIRATORY_RATE_BRPM` | PASS | Test asserts 14 br/min. |
| Bradley Law: no `Coming soon`/`TODO`/`XXX`/`stub` literals | PASS | No matches in the Withings write-set. |
| Bradley Law: no swallowed exceptions | PASS | No `.catch(() => undefined)`, empty catch, or console logging patterns remain in the Withings write-set. |
| Bradley Law: no `@ts-ignore` or `as any` bypass | PASS | Grep found no `@ts-ignore` and no `as any` in the Withings write-set. |
| R65 / 50-Failures sweep | PASS | No hardcoded runtime secrets, raw SQL, direct fetch/axios bypass, fake coverage, unbounded list endpoint, or unlogged swallowed-error pattern was found in the PR diff. |
| File hygiene | PASS | Backend write-set is connector-only. |
| Commit author/body hygiene | PASS | Both backend commits are by `Dynasia G <dynasia@trygrowthproject.com>` with empty bodies and no trailers/co-authors. |

## Findings

None.

## Positive observations

- The R4 changes directly address the two R3 P1s: all literal `stub`/`stubbed` comments were rewritten, and both prior swallowed `.catch(() => undefined)` paths now log structured redacted context before the original failure propagates.
- The new connector regression test asserts the original provider error still propagates when error-status persistence fails, and asserts the marking failure is observable via a structured log.
- All five gates pass at the pinned R5 SHA.
- The normalizer still maps every required §3.1 Withings metric with real-value assertions.

## Final verdict

CLEAN. The audited SHA has zero P0, zero P1, and zero P2 findings; the prior R3 P1 findings are resolved, all five validation gates pass, and the R65 / 50-Failures sweep did not identify a blocking issue.

## Audit commit hygiene check

```text
AUTHOR_CHECK_FORMATTED:
COMMIT ede670e498f692c78a2614792c4f5df2133404a8
AUTHOR Dynasia G <dynasia@trygrowthproject.com>
BODY

---COMMIT-END---
COMMIT 976eac363c3f6d0a41915c380b302053aa1c758a
AUTHOR Dynasia G <dynasia@trygrowthproject.com>
BODY

---COMMIT-END---
```
