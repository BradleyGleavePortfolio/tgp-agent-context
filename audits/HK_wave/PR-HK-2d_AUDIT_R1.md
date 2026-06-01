# PR-HK-2.d — Garmin connector — R1 audit

**Verdict:** FAIL — required TypeScript/build gates fail at the pinned SHA, commit hygiene violates the empty-body rule, and the Garmin webhook ingest-failure path logs unredacted error messages.

**Repo:** `growth-project-backend`  
**PR:** #355  
**Audited head SHA:** `0612c224a724a4ed13c8c64ffc30718f28c40b3a`  
**Base:** `main` @ `8cfb44f`  
**Build report reviewed:** `HK_PR-HK-2d-garmin_BUILD.md` @ `e4b7f94`  
**Auditor:** R1

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/garmin/`:

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

No module/registry edits were present in the diff.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | **FAIL**, exit 2; full-repo typecheck fails on missing `class-validator` declarations plus existing implicit-`any` test errors |
| Lint | `npx eslint src/wearables/connectors/garmin/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 319 tests |
| Build | `npx nest build` | **FAIL**, exit 1; Nest build reports 73 TypeScript errors, primarily missing `class-validator` declarations |

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `GarminConnector implements WearableConnector`; `provider = GARMIN`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Uses Garmin auth/token endpoints and requests `activities`, `dailies`, `sleeps`, `hrv`, and `bodyComps`. |
| KMS-wrapped tokens | PASS | `exchangeCode()` and `refresh()` KMS-wrap returned access/refresh tokens; `refresh()` unwraps stored refresh tokens before provider calls. |
| Backfill pagination | PASS | Clamps to 90 days and pages each summary collection by ≤24h windows with a hard window cap. |
| Webhook token verify first / fail-closed | PASS | `handle()` and `deregister()` verify the configured push token before parsing; missing token config rejects. |
| Webhook idempotency ordering | PASS | Per-record `findUnique` happens before work; `WearableProcessedEvent` is written only after normalize/ingest succeeds. |
| Durable handling before 200 | PASS | Garmin pushes carry the full summary payload, so the controller inline-normalizes/ingests before returning 200 and commits a completed processed-event row. |
| Zod `.strict()` on webhook payloads | PASS | The top-level push envelope and deregistration envelope are `.strict()`; unknown top-level collections are rejected. |
| PII/log redaction | **FAIL** | See Finding 2: normal accepted/no-connection logs hash Garmin `userId`, but the ingest-failure catch logs raw `err.message` and has no regression proving secrets/PII in error messages are redacted. |
| OAuth error log redaction | PASS | The connector does not log OAuth request bodies or token endpoint error bodies; `ProviderHttpClient` logs provider labels/status only. |
| Deregistration / soft-disconnect | PASS | Token-verified deregistration updates matching Garmin connections to `status='disconnected'` with `disconnected_at`. |
| §3.1 dailies mapping | PASS | Tests assert `steps` → STEPS and `activeKilocalories` → ACTIVE_ENERGY_KCAL with real values/units/bucket. |
| §3.1 sleeps mapping | PASS | Tests assert SLEEP_* stage minutes, derived total/efficiency, and BODY_BATTERY fallback behavior. |
| §3.1 HRV mapping | PASS | Tests assert `lastNightAvg` → HRV_MS with ms unit and source offset handling. |
| §3.1 activities mapping | PASS | Tests assert duration, distance, and training-load mappings. |
| §3.1 bodyComps mapping | PASS | Tests assert grams→kg body weight and body-fat percent mappings. |
| Tests | PASS with one coverage gap | Garmin specs cover 47 provider tests and the wearables regression suite passes, but no test covers ingest-failure log redaction. |
| File hygiene | **FAIL** | Author identity is correct, but the audited commit body is non-empty; R1 doctrine requires empty commit bodies and no trailers. |

## Findings

### 1. MEDIUM — Required full-repo TypeScript and Nest build gates fail at the pinned SHA

**Code:** `audits/HK_wave/logs/PR-HK-2d_R1_tsc.log` and `audits/HK_wave/logs/PR-HK-2d_R1_nest_build.log`

```text
src/wearables/connections/dto/connect-provider.dto.ts(1,24): error TS7016: Could not find a declaration file for module 'class-validator'.
...
Found 73 error(s).
```

The required R1 gates are not clean: `npx tsc --noEmit` exits 2 and `npx nest build` exits 1. The failures are mostly dependency/type-resolution errors for `class-validator`, with additional existing implicit-`any` errors in tests, but the audited pinned SHA still cannot be called clean under the mandated gate run.

**Impact:** The build report's all-pass gate claim is not reproducible in the audited workspace, and the R1 verdict cannot be CLEAN while required compile/build gates fail.

**Expected fix:** Restore deterministic dependency/type state so `npx tsc --noEmit` and `npx nest build` pass at the pinned SHA, then rerun the five gates and update the build evidence.

### 2. MEDIUM — Garmin ingest-failure logging records raw error messages despite the redaction requirement

**Code:** `src/wearables/connectors/garmin/garmin-webhook.controller.ts:583-602`

```ts
} catch (err) {
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
    msg: 'wearables.garmin.webhook.ingest_failure',
    provider: 'GARMIN',
    type: event.type,
    user_hash: hashGarminUserId(summary.userId),
    error_message: (err as Error)?.message ?? String(err),
  });
  throw err;
}
```

The controller comment says the path logs redacted errors, and the build report claims the ingest-failure path writes a redacted `last_error` and log. The implementation stores/logs the raw thrown message. Existing tests assert no raw Garmin user id on accepted and no-connection paths, but no test injects an ingest failure containing a Garmin `userId`, `userAccessToken`, bearer token, or provider payload fragment and proves that it is absent from logs/`last_error`.

**Impact:** An upstream ingestion/Prisma/normalization error that includes provider payload, user identifiers, or token-like fragments can be copied into application logs and connection state. This is an edge-path log-redaction gap under the prior-audit PII/logging checklist.

**Expected fix:** Add a connector-local redaction helper or shared redaction utility, persist/log only a redacted message (or `{ error_code, error_class }`), and add a regression test that forces an ingest error containing Garmin PII/token-like text and asserts the raw values are absent.

### 3. MEDIUM — Commit body is non-empty despite the R1 hygiene rule

**Code:** commit metadata for `0612c224a724a4ed13c8c64ffc30718f28c40b3a`

```text
Dynasia G <dynasia@trygrowthproject.com>
Add the Garmin Health API wearable connector under
src/wearables/connectors/garmin/ implementing the PR-HK-0
WearableConnector contract:
...
- Specs: normalizer (12), connector (17), webhook controller (18) = 47 tests.
```

The commit author is correct, and no co-author or generated-by trailer is present, but the brief requires every commit body to be empty. This audited commit has a multi-line body.

**Impact:** The PR fails the required commit hygiene check even though the author identity itself is correct.

**Expected fix:** Amend/recreate the commit so the author remains `Dynasia G <dynasia@trygrowthproject.com>` and the commit body is empty with no trailers.

## Positive observations

- The Garmin write-set is properly isolated: no shared registry, schema, or module files were edited.
- Webhook token verification happens before parsing, and missing `GARMIN_PUSH_TOKEN` fails closed.
- KMS wrapping/unwrap behavior is covered by explicit exchange/refresh tests.
- The normalizer has real-value coverage for every Garmin metric required by AGENT_2_CODING_PLAN §3.1, including unit conversions and source timezone offsets.
- The wearables Jest regression suite passed with 20 suites and 319 tests.

## Final verdict

FAIL. The connector is strong on write-set isolation, Garmin metric coverage, KMS token handling, token-verify-first webhook handling, and idempotency ordering, but it cannot be accepted as CLEAN while required TypeScript/build gates fail, an ingest-failure log edge path records raw error messages, and the audited commit violates the empty-body hygiene rule.

## Audit commit hygiene check

```text
Dynasia G <dynasia@trygrowthproject.com>
Add the Garmin Health API wearable connector under
src/wearables/connectors/garmin/ implementing the PR-HK-0
WearableConnector contract:

- garmin.types.ts: provider-native summary types (dailies/sleeps/hrv/
  activities/bodyComps), strict Zod push envelope + deregistration schema.
- garmin.normalizer.ts: maps the five summary collections to the canonical
  metrics (STEPS, ACTIVE_ENERGY_KCAL, SLEEP_*/EFFICIENCY, BODY_BATTERY,
  HRV_MS, WORKOUT_DURATION_MIN/DISTANCE_M, TRAINING_LOAD, BODY_WEIGHT_KG,
  BODY_FAT_PCT) with unit/bucket handling and offset->sourceTz.
- garmin.connector.ts: OAuth2 buildAuthUrl/exchangeCode/refresh, KMS-wrapped
  tokens, windowed 90-day backfill, constant-time push-token verifyWebhook
  (fail-closed), parseWebhook (strict Zod) -> namespaced provider events.
- garmin-webhook.controller.ts: partner-signed push receiver with
  token-verify-first, per-record idempotency (check->process->commit),
  inline normalize+ingest, deregistration soft-disconnect, no PII in logs.
- garmin.module.ts + index.ts barrel.
- Specs: normalizer (12), connector (17), webhook controller (18) = 47 tests.
---END---
```
