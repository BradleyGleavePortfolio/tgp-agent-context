# PR-HK-2.d — Garmin connector — R3 audit

**Verdict:** FAIL — all five gates pass after a clean install and the R2 redaction/commit-hygiene fixes are present, but the ingest-failure catch still swallows a Prisma update exception via `.catch(() => undefined)`, which is a Bradley Law P1 violation.

**Repo:** `growth-project-backend`  
**PR:** #355  
**Audited head SHA:** `25dd6791d3b1d2159f713fc2dcd29ef8a43d3393`  
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2d-garmin_BUILD.md` @ `e4b7f94`  
**R2 fixer summary reviewed:** `_fixer_R2_PR355_garmin_SUMMARY.json`  
**Auditor:** R3

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

No module/registry/schema/interface/sibling-connector edits were present in the diff.

The audited worktree was pinned to `25dd6791d3b1d2159f713fc2dcd29ef8a43d3393`. The clean install was first attempted in the workspace worktree after `rm -rf node_modules`, but the shared filesystem hit `ENOSPC`; the successful validation run used a second isolated git worktree on temporary storage pinned to the same SHA, then ran `rm -rf node_modules` and `npm ci` successfully before gates. The initial workspace `ENOSPC` and the successful temporary-storage clean install are both captured in `audits/HK_wave/logs/PR-HK-2d_R3_npm_ci_clean.log`.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `npx prisma validate` | PASS, exit 0 |
| Types | `npx tsc --noEmit` | PASS, exit 0 |
| Lint | `npx eslint src/wearables/connectors/garmin/` | PASS, exit 0 |
| Wearables regression | `npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 320 tests |
| Build | `npx nest build` | PASS, exit 0 |

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| R2 P2 gate claim after clean install | PASS | After a successful clean `npm ci` in an isolated worktree, `tsc` and `nest build` both exit 0. R1 gate failures were not reproduced once dependency state was clean. |
| R2 P2 redaction helper wired | PASS | `redactGarminError(err, summary.userId)` is called in the ingest-failure catch; `last_error` and the error log use the redacted message plus structured `error_code` / `error_class`. |
| R2 P2 redaction regression test | PASS | `garmin-webhook.controller.spec.ts` now forces a leaky ingest error and asserts the Garmin user id, bearer/JWT fragment, and `userAccessToken` are absent from `last_error` and log output. |
| R2 P2 commit hygiene | PASS | The branch is a single commit by `Dynasia G <dynasia@trygrowthproject.com>` with subject only and an empty body; no trailers/co-authors/generated-by text observed. |
| Implements `WearableConnector` | PASS | `GarminConnector implements WearableConnector`; `provider = GARMIN`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Uses Garmin auth/token endpoints and requests `activities`, `dailies`, `sleeps`, `hrv`, and `bodyComps`. |
| KMS-wrapped tokens | PASS | `exchangeCode()` and `refresh()` KMS-wrap returned access/refresh tokens; `refresh()` unwraps stored refresh tokens before provider calls. |
| Backfill pagination | PASS | Clamps to 90 days and pages each summary collection by ≤24h windows with a hard window cap. |
| Webhook token verify first / fail-closed | PASS | `handle()` and `deregister()` verify the configured push token before parsing; missing token config rejects. |
| Webhook idempotency ordering | PASS | Per-record `findUnique` happens before work; `WearableProcessedEvent` is written only after normalize/ingest succeeds. |
| Durable handling before 200 | PASS | Garmin pushes carry the full summary payload, so the controller inline-normalizes/ingests before returning 200 and commits a completed processed-event row. |
| Zod `.strict()` on webhook payloads | PASS | The top-level push envelope and deregistration envelope are `.strict()`; unknown top-level collections are rejected. |
| PII/log redaction | PASS | R2 redacts the ingest-failure `last_error` and log path; accepted/no-connection logs continue to use `user_hash`. |
| OAuth error log redaction | PASS | The connector does not log OAuth request bodies or token endpoint error bodies; `ProviderHttpClient` logs provider labels/status only. |
| Deregistration / soft-disconnect | PASS | Token-verified deregistration updates matching Garmin connections to `status='disconnected'` with `disconnected_at`. |
| §3.1 dailies mapping | PASS | Tests assert `steps` → STEPS and `activeKilocalories` → ACTIVE_ENERGY_KCAL with real values/units/bucket. |
| §3.1 sleeps mapping | PASS | Tests assert SLEEP_* stage minutes, derived total/efficiency, and BODY_BATTERY fallback behavior. |
| §3.1 HRV mapping | PASS | Tests assert `lastNightAvg` → HRV_MS with ms unit and source offset handling. |
| §3.1 activities mapping | PASS | Tests assert duration, distance, and training-load mappings. |
| §3.1 bodyComps mapping | PASS | Tests assert grams→kg body weight and body-fat percent mappings. |
| Bradley Law: no `Coming soon`, `TODO`, `XXX`, stub literal | PASS | Targeted scan of the Garmin connector found no matches. |
| Bradley Law: no `@ts-ignore` / `as any` bypass | PASS | Targeted scan of the Garmin connector found no `@ts-ignore` and no `as any`. |
| Bradley Law: no swallowed exception | **FAIL** | See Finding 1: the ingest-failure catch swallows any failure from the connection status/`last_error` update with `.catch(() => undefined)`. |

## Findings

### 1. HIGH — Ingest-failure recovery swallows a Prisma update exception

**Code:** `src/wearables/connectors/garmin/garmin-webhook.controller.ts:190-198`

```ts
await this.prisma.wearableConnection
  .update({
    where: { id: connection.id },
    data: {
      status: 'error',
      last_error: redacted.redacted_message,
    },
  })
  .catch(() => undefined);
```

The R2 fix correctly redacts the original normalize/ingest error, but the follow-on Prisma update failure is explicitly swallowed. The current R3 Bradley Law says any swallowed exception is P1. This catch discards the update exception without logging, surfacing, counting, or otherwise making the failed status/`last_error` write observable.

**Impact:** If marking the connection `status='error'` fails, the original webhook error is rethrown but the failed state write disappears. Operators can lose the durable connection-status signal while the code path still appears to have attempted the update.

**Expected fix:** Do not swallow the update exception. Either allow the update failure to propagate as part of the failure path, or log a redacted structured secondary failure before rethrowing the original error in a way that preserves observability and complies with the no-swallow rule.

## Positive observations

- The R2 redaction helper is present, exported, and wired into the exact ingest-failure path flagged in R1.
- The new regression test proves raw Garmin user ids, bearer/JWT fragments, and `userAccessToken` values do not leak to `last_error` or the emitted error log.
- A clean `npm ci` in an isolated pinned worktree followed by the five required gates reproduced PASS for Prisma, TypeScript, ESLint, Jest, and Nest build.
- The branch now satisfies the single-commit, empty-body commit hygiene requirement.
- The Garmin write-set remains properly isolated to the provider folder.

## Final verdict

FAIL. R2 resolved the prior P2 gate, redaction, and commit-hygiene findings, but the audited SHA is not CLEAN because the Garmin ingest-failure recovery path still contains a swallowed exception, which is a Bradley Law P1 violation under the R3 instructions.

## Audit commit hygiene check

```text
25dd6791d3b1d2159f713fc2dcd29ef8a43d3393
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.d: Garmin connector

---END---
```
