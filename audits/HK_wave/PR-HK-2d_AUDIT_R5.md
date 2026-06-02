# PR-HK-2.d — Garmin connector — R5 audit

**Verdict:** CLEAN — the R3 P1 swallowed-error path is fixed, the regression test exercises the real dual-failure mode, the R65/50-Failures sweep found no P0/P1/P2/P3 findings, and all five gates pass after a clean dependency install.

**Repo:** `growth-project-backend`  
**PR:** #355  
**Audited head SHA:** `bc73eabbf78c5f4b45e8ca7c1fc53b0467d449ab`  
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2d-garmin_BUILD.md` @ `e4b7f94bb06427e24e7cfc21f2b65729c143c79e`  
**R4 fixer summary reviewed:** `_fixer_R4_PR355_garmin_SUMMARY.json`  
**Auditor:** R5

## Scope / write-set verification

PASS. The audited worktree was pinned to `bc73eabbf78c5f4b45e8ca7c1fc53b0467d449ab`.

The audited diff is exactly 9 files, all under `src/wearables/connectors/garmin/`:

```text
src/wearables/connectors/garmin/garmin-webhook.controller.spec.ts
src/wearables/connectors/garmin/garmin-webhook.controller.ts
src/wearables/connectors/garmin/garmin.connector.spec.ts
src/wearables/connectors/garmin/garmin.connector.ts
src/wearables/connectors/garmin/garmin.module.ts
src/wearables/connectors/garmin/garmin.normalizer.spec.ts
src/wearables/connectors/garmin/garmin.normalizer.ts
src/wearables/connectors/garmin/garmin.types.ts
src/wearables/connectors/garmin/index.ts
```

No module/registry/schema/interface/sibling-connector edits were present in the diff. The R4 delta from the R3-audited head is limited to `garmin-webhook.controller.ts` and `garmin-webhook.controller.spec.ts`.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Clean install | `npm ci` | PASS, exit 0; 1011 packages installed, 0 vulnerabilities; Prisma Client generated |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/garmin/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 321 tests |
| Build | `npx nest build` | PASS, exit 0 |

Logs are saved under `audits/HK_wave/logs/PR-HK-2d_R5_*`.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| R3 P1 ingest-failure secondary write no longer swallowed | PASS | The prior `.catch(() => undefined)` is gone. The secondary `wearableConnection.update()` now has an explicit `try/catch`; if it fails, `markErr` is redacted and logged as `wearables.garmin.webhook.error_marking_failed`, then the original ingest error is rethrown. |
| R3 P1 regression test exercises real failure mode | PASS | The new test forces both `ingestion.ingest()` and `wearableConnection.update()` to reject, asserts the original `ingest exploded` error propagates, asserts a structured secondary failure log is emitted, verifies raw Garmin user id is redacted, and verifies no dedup row is committed. This would fail against the old silent `.catch(() => undefined)` path. |
| Implements `WearableConnector` | PASS | `GarminConnector implements WearableConnector`; `provider = GARMIN`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Uses Garmin auth/token endpoints and requests `activities`, `dailies`, `sleeps`, `hrv`, and `bodyComps`. |
| KMS-wrapped tokens | PASS | `exchangeCode()` and `refresh()` KMS-wrap returned access/refresh tokens; `refresh()` unwraps stored refresh tokens before provider calls. |
| Backfill pagination | PASS | Clamps to 90 days and pages each summary collection by ≤24h windows, bounded by a hard window cap, using `ProviderHttpClient`. |
| Webhook token verify first / fail-closed | PASS | Both data and deregistration handlers require raw body and verify the configured Garmin push token before parsing; missing/mismatched token rejects. |
| Webhook idempotency ordering | PASS | Per-record `findUnique` happens before work; `WearableProcessedEvent` is written only after normalize/ingest succeeds. |
| Durable handling before 200 | PASS | Garmin pushes carry full summary payloads; the controller normalizes/ingests inline before returning 200 and commits a completed processed-event row only after success. |
| Zod `.strict()` on webhook payloads | PASS | Top-level data push and deregistration envelopes are `.strict()`; unknown top-level collections are rejected. Record-level passthrough remains the R3-accepted Garmin forward-compat choice after token verification. |
| PII/log redaction | PASS | Ingest-failure and new secondary-mark-failure paths use `redactGarminError()` plus salted `user_hash`; tests assert raw Garmin user ids and token-like fragments do not reach logs/DB. |
| OAuth error log redaction | PASS | Connector token paths do not log token endpoint bodies or bearer values; provider HTTP logging is provider/status/label oriented. |
| Deregistration / soft-disconnect | PASS | Token-verified deregistration updates matching Garmin connections to `status='disconnected'` with `disconnected_at`, using redacted user hash in logs. |
| §3.1 dailies mapping | PASS | Tests assert `steps` → STEPS and `activeKilocalories` → ACTIVE_ENERGY_KCAL with exact values/units/bucket. |
| §3.1 sleeps mapping | PASS | Tests assert SLEEP_* stage minutes, derived total/efficiency, and BODY_BATTERY fallback behavior. |
| §3.1 HRV mapping | PASS | Tests assert `lastNightAvg` → HRV_MS with ms unit and source offset handling. |
| §3.1 activities mapping | PASS | Tests assert duration, distance, and training-load mappings. |
| §3.1 bodyComps mapping | PASS | Tests assert grams→kg body weight and body-fat percent mappings. |
| Bradley Law: no `Coming soon`, `TODO`, `XXX`, stub literal | PASS | Targeted Garmin scan found no matches. |
| Bradley Law: no `@ts-ignore` / unsafe `as any` bypass in source | PASS | Targeted Garmin scan found no `@ts-ignore`; production files avoid `as any`. Test-only `as unknown as` casts are used for mocks. |
| Bradley Law / R65: no swallowed exception | PASS | Production catch blocks either map malformed verified payloads to 400, emit structured redacted logs, or rethrow the original failure. No production `.catch(() => undefined)` remains. |
| R65 #1 hardcoded secrets | PASS | No committed provider secrets/API keys; env names and redaction regexes only. |
| R65 #3 SQL injection | PASS | No raw SQL in the Garmin connector; DB access uses Prisma query methods. |
| R65 #5 IDOR | PASS | Partner-verified webhook resolves connections server-side by Garmin `external_account_id`; request body ids are not accepted as app-user authorization. |
| R65 #8 input validation | PASS | Garmin webhook and deregistration boundaries use Zod schemas; malformed verified payloads reject before side effects. |
| R65 #12 secrets in error messages | PASS | Persisted and logged failure messages are redacted and capped. |
| R65 #21/N+1 and #35 timeout handling | PASS | Backfill uses provider HTTP client for timeout/backoff and returns records for batch ingestion; no per-sample DB write loop in the connector. |
| R65 #28/#29 idempotency/replay | PASS | Dedup rows are committed only after successful ingest; duplicate or lost-race deliveries are handled idempotently. |
| R65 #34 observability | PASS | The R4 change improves observability of the secondary mark-failure path with structured, redacted logging. |
| R65 #44 transaction concern | PASS | The webhook intentionally avoids a transaction across ingest and dedup commit so failures/redelivery do not mark incomplete events processed; no multi-table atomic write defect was found in this PR write-set. |
| R65 #50 graceful external-service failure | PASS | Provider calls use the shared timeout/backoff client; webhook ingest failures rethrow for Garmin redelivery rather than silently acknowledging. |

## Findings

None.

## Positive observations

- The R4 fix addresses the exact R3 P1 without weakening the original redaction or rethrow behavior.
- The new regression test is not cosmetic: it fails the old silent-swallow implementation and proves both observability and redelivery safety on the dual-failure path.
- Clean `npm ci` plus all five required gates pass at the pinned SHA.
- The Garmin write-set remains isolated to the provider folder.
- Commit hygiene remains clean: commits are by `Dynasia G <dynasia@trygrowthproject.com>` with no trailers/co-authors/generated-by text.

## Final verdict

CLEAN. PR #355 at `bc73eabbf78c5f4b45e8ca7c1fc53b0467d449ab` has zero P0, zero P1, zero P2, and zero P3 findings in this R5 re-audit. The R3 P1 swallowed-error path is resolved, the failure-mode regression test is meaningful, all required gates pass, and the R65 sweep found no Bradley Law blockers.

## Audit commit hygiene check

```text
bc73eabbf78c5f4b45e8ca7c1fc53b0467d449ab
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.d: Garmin connector

---END---
25dd6791d3b1d2159f713fc2dcd29ef8a43d3393
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.d: Garmin connector

---END---
```
