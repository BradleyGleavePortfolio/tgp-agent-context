# PR-HK-2.g — Polar AccessLink connector — R3 audit

**Verdict:** FAIL — one Bradley Law P1 remains: `markConnectionError()` still swallows a Prisma status-update failure on provider error paths.

**Repo:** `growth-project-backend`  
**PR:** #351  
**Audited head SHA:** `a4e4e4ef00b11bc39d78cd0d3f9a03593f331e42`  
**Base:** `main` merge-base @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761` (`origin/main` observed @ `0a221893b2e0ce1808450afbe9776b5df8d80dc6`)  
**Build report reviewed:** `HK_PR-HK-2g-polar_BUILD.md` @ `e4b7f94` (stale vs R3 head; still names the R1 SHA and old sleep-efficiency/idempotency behavior)  
**Auditor:** R3

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/polar/`:

```text
src/wearables/connectors/polar/index.ts
src/wearables/connectors/polar/polar-webhook.controller.spec.ts
src/wearables/connectors/polar/polar-webhook.controller.ts
src/wearables/connectors/polar/polar.connector.spec.ts
src/wearables/connectors/polar/polar.connector.ts
src/wearables/connectors/polar/polar.module.ts
src/wearables/connectors/polar/polar.normalizer.spec.ts
src/wearables/connectors/polar/polar.normalizer.ts
src/wearables/connectors/polar/polar.types.ts
```

No schema, shared registry, shared module, or sibling connector edits were present in the backend diff. Full diff and gate logs are saved under `audits/HK_wave/logs/PR-HK-2g_R3_*`.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma schema | `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | PASS, exit 0 (`PR-HK-2g_R3_prisma_validate.log`) |
| Types | `DATABASE_URL=... DIRECT_URL=... npx tsc --noEmit` | PASS, exit 0 (`PR-HK-2g_R3_tsc_noEmit.log`) |
| Lint | `npx eslint src/wearables/connectors/polar/` | PASS, exit 0 (`PR-HK-2g_R3_eslint_polar.log`) |
| Wearables regression | `NODE_OPTIONS=--max-old-space-size=1536 DATABASE_URL=... DIRECT_URL=... npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 327 tests (`PR-HK-2g_R3_jest_wearables_heapcap.log`) |
| Build | `NODE_OPTIONS=--max-old-space-size=1536 DATABASE_URL=... DIRECT_URL=... npx nest build` | PASS, exit 0 (`PR-HK-2g_R3_nest_build_heapcap.log`) |

Note: the uncapped Jest/build invocations were killed by the sandbox before normal output; rerunning the same gates with a capped Node heap completed successfully and is the recorded gate result.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `PolarConnector implements WearableConnector`; `provider = POLAR`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Uses Polar OAuth authorize/token endpoints, Basic auth token exchange, and env-provided client id/secret/redirect URI. |
| Token storage/KMS contract | PASS | Connector returns token material to the shared OAuth lane and does not persist raw tokens itself. |
| Refresh-token semantics | PASS | Models Polar's long-lived token posture by re-presenting the stored durable credential. |
| Webhook raw-body HMAC | PASS | Verifies `Polar-Webhook-Signature` over the raw body and fails closed on missing secret/signature/bad digest. |
| Webhook idempotency ordering | PASS | R2 fixed the R1 check-then-act issue: controller now `createMany({ skipDuplicates: true })` reserves before fetch/normalize/ingest, stamps completion after success, and releases its reservation on processing failure. |
| Durable webhook event before 200 | PASS | Non-PING events create the processed-event reservation before downstream work and only complete it after successful handling. |
| Zod strict payload validation | PASS | R2 replaced `.passthrough()` with `.strict()` and constrains `event` to `PING` / `EXERCISE` / `SLEEP` / `NIGHTLY_RECHARGE`; tests cover unknown fields and unknown events. |
| PING handling | PASS | PING is acknowledged after signature and payload validation without reservation/fetch/ingest. |
| Fail-closed webhook validation | PASS | Missing raw body, invalid HMAC, malformed JSON, strict-schema failure, missing required non-PING fields, and unknown events all reject before DB side effects. |
| PII/log redaction | PASS | Webhook logs use `user_id_hash`; connector error logs redact token-like strings. |
| OAuth error log redaction | PASS | OAuth/provider errors are passed through `redactErrorMessage()` before persistence/logging. |
| HTTP discipline / 429 handling | PASS | Provider calls use `ProviderHttpClient`, inheriting timeout/backoff/retry handling. |
| Backfill date clamp / provider limits | PASS | Backfill clamps to 28 days and walks date-keyed sleep/recharge resources. |
| Backfill outage error handling | **FAIL** | See Finding 1: provider errors rethrow, but failure to persist the connection error status is silently swallowed via `.catch(() => undefined)`. |
| `exercises` → `WORKOUT_DURATION_MIN` | PASS | Normalizer maps ISO-8601 exercise duration to minutes. |
| `exercises` → `WORKOUT_DISTANCE_M` | PASS | Normalizer maps exercise distance in meters. |
| `exercises` → `HEART_RATE_BPM` | PASS | Normalizer maps average heart rate when present. |
| `sleep` → `SLEEP_TOTAL_MIN` | PASS | Normalizer derives total sleep minutes from sleep stages. |
| `sleep` → `SLEEP_REM_MIN` / `SLEEP_DEEP_MIN` / `SLEEP_LIGHT_MIN` / `SLEEP_AWAKE_MIN` | PASS | Normalizer maps all required sleep-stage minute metrics. |
| `sleep` extra metrics | PASS | R2 removed the unapproved `SLEEP_EFFICIENCY_PCT` emitted sample; specs assert it is absent. |
| `nightly-recharge` → `RECOVERY_SCORE` / `HRV_MS` | PASS | Normalizer maps nightly recharge status and HRV milliseconds. |
| Bradley Law: prohibited shipped literals | PASS | No `Coming soon`, `TODO`, `XXX`, or shipped-code `stub` literal in Polar implementation files. A test-file comment says `stubbed`, but tests are not shipped code. |
| Bradley Law: type-system bypasses | PASS | No `@ts-ignore` and no `as any` in the Polar connector folder. |
| Bradley Law: swallowed exceptions | **FAIL** | See Finding 1: `.catch(() => undefined)` remains on an error-status update path. |
| Tests | PASS | Wearables regression suite passes with 327 tests; R2 added strict-schema, unknown-event, and concurrency coverage. |
| File hygiene / commit author hygiene | PARTIAL | Authors are `Dynasia G <dynasia@trygrowthproject.com>` and the R2 fix commit has an empty body; the original R1 backend commit still has a non-empty body. |

## Findings

### 1. HIGH — Provider error-status update still swallows failures with `.catch(() => undefined)`

**Code:** `src/wearables/connectors/polar/polar.connector.ts:584-611`

```ts
/**
 * Mark a connection `status='error'` with a redacted error message on a
 * provider-side failure, best-effort (never masks the original error). No-op
 * when `prisma` was not injected or the connection has no id. Logs only
 * redacted, PII-free metadata (audit patterns 3 + 7).
 */
private async markConnectionError(
  conn: WearableConnection,
  err: unknown,
  op: string,
): Promise<void> {
  const message = redactErrorMessage(err);
  this.logger.error({
    msg: 'wearables.polar.connection_error',
    op,
    provider: 'POLAR',
    user_id_hash: conn?.user_id ? userHash(conn.user_id) : undefined,
    error_class: err instanceof Error ? err.name : 'unknown',
    // Already redacted — safe to log.
    error_message: message,
  });
  if (!this.prisma || !conn?.id) return;
  await this.prisma.wearableConnection
    .update({
      where: { id: conn.id },
      data: { status: 'error', last_error: message },
    })
    .catch(() => undefined);
}
```

R2 removed the swallowed `.catch()` from the webhook controller path, but the connector-level provider-error path still contains the exact Bradley Law anti-pattern. This method is called by both `refresh()` and `backfill()` catch blocks before rethrowing the provider error, so a Prisma failure while writing `status='error'` / `last_error` is silently discarded.

**Impact:** A provider outage can still fail without reliably surfacing the connection's `error` status/`last_error` trust indicator. Operators and users can see a stale/connected-looking integration even though the required fail-explicit status write failed, and the status-write failure itself is invisible.

**Expected fix:** Remove `.catch(() => undefined)`. If preserving the original provider exception is required, use an explicit `try/catch` that logs the status-write failure with redacted metadata and rethrows or otherwise surfaces a typed compound error; do not silently discard the failed persistence operation.

### 2. LOW — Original backend commit body hygiene is still not fully clean

**Code:** branch commit history (`git log origin/main..HEAD --format='%H%n%an <%ae>%n%B%n---END---'`)

```text
ef79c47ffe1a9a716fdd94a9960280321eab9d55
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.g: Polar AccessLink connector (OAuth2 + webhook + backfill)

Add the file-disjoint Polar connector under src/wearables/connectors/polar/
implementing the PR-HK-0 WearableConnector contract.
...
---END---
```

The R2 fix commit itself has an empty body, but the full branch range still includes the original R1 commit with a non-empty body. Author identity is correct and no trailers/co-authors were found.

**Impact:** This does not change runtime behavior, but it remains a process-hygiene mismatch with the shared audit brief's empty-body requirement.

**Expected fix:** If the branch is allowed to be history-rewritten, amend/squash so every backend commit body in the PR range is empty; otherwise document an explicit exception from the parent.

## R1/R2 re-audit summary

- R1 P1 strict webhook validation: RESOLVED. The schema is strict and event enum constrained, with regressions for unknown field and unknown event.
- R1 P1 reservation-first idempotency: RESOLVED. The controller reserves first, no-ops duplicates, stamps completion after success, and releases the reservation on fetch/ingest failure.
- R1 P2 `SLEEP_EFFICIENCY_PCT`: RESOLVED. The normalizer no longer emits it; tests assert absence.
- R1 tsc/nest build failures: RESOLVED in this audit environment. `tsc --noEmit` and `nest build` pass.
- New/remaining R3 blocker: NOT RESOLVED. A connector-level `.catch(() => undefined)` still silently swallows an error-status persistence failure.

## Positive observations

- The R2 webhook fix materially improves correctness: all expensive downstream work is behind an atomic reservation barrier.
- Strict webhook validation now fails closed before DB I/O for unknown fields and unknown event types.
- Polar sleep output now matches the §3.1 binding exactly, with no unapproved derived efficiency metric.
- Required gates pass at the pinned R3 head once the sandbox Node heap is capped.

## Commit hygiene check

```text
a4e4e4ef00b11bc39d78cd0d3f9a03593f331e42
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.g: strict webhook schema, reservation-first idempotency, drop unapproved sleep efficiency metric

---END---
ef79c47ffe1a9a716fdd94a9960280321eab9d55
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.g: Polar AccessLink connector (OAuth2 + webhook + backfill)

Add the file-disjoint Polar connector under src/wearables/connectors/polar/
implementing the PR-HK-0 WearableConnector contract.

- polar.connector.ts: OAuth2 (HTTP Basic token exchange, non-rotating
  long-lived tokens), backfill (exercises list + per-date sleep /
  nightly-recharge, clamped to 28d), Polar-Webhook-Signature HMAC-SHA256
  raw-body verify (fail-closed), fetchChangedRecord with SSRF host guard,
  redacted error logging.
- polar.normalizer.ts: AGENT_2_CODING_PLAN 3.1 mapping — exercises ->
  WORKOUT_DURATION_MIN/WORKOUT_DISTANCE_M/HEART_RATE_BPM; sleep ->
  SLEEP_TOTAL/REM/DEEP/LIGHT/AWAKE_MIN + derived SLEEP_EFFICIENCY_PCT;
  nightly-recharge -> RECOVERY_SCORE/HRV_MS. ISO-8601 duration parsing.
- polar-webhook.controller.ts: Public HMAC-gated receiver, Zod validation,
  PING ack, check-process-commit idempotency ordering, PII-free logs.
- polar.types.ts, polar.module.ts, index.ts (registry contribution).
- 51 connector/normalizer/webhook tests, real-value assertions.

---END---
```

## Final verdict

FAIL / NOT CLEAN. The R1 functional blockers called out for R2 are fixed and all five gates pass at the pinned R3 head, but the connector still violates Bradley Law by swallowing a status-update failure on provider error paths with `.catch(() => undefined)`. Because that is a P1, the PR is not clean.
