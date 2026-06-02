# PR-HK-2.g — Polar AccessLink connector — R5 audit

**Verdict:** CLEAN

**Repo:** `growth-project-backend`  
**PR:** #351  
**Audited head SHA:** `5a8424871467078be25de923663debdad9eb47ec`  
**Base:** `main` merge-base @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761` (`origin/main` observed @ `0a221893b2e0ce1808450afbe9776b5df8d80dc6`)  
**Build report reviewed:** `HK_PR-HK-2g-polar_BUILD.md` @ docs main copy; stale vs R5 head for test count/R3 fix details, supplemented by R4 fixer summary.  
**Auditor:** R5

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

No schema, shared registry, shared module, ingestion-service, connector-interface, or sibling connector edits were present in the backend diff. Full diff and R5 logs are saved under `audits/HK_wave/logs/PR-HK-2g_R5_*`.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma schema | `npx prisma validate` | PASS, exit 0 (`PR-HK-2g_R5_prisma_validate.log`) |
| Types | `node --max-old-space-size=3072 ./node_modules/typescript/bin/tsc --noEmit` | PASS, exit 0 (`PR-HK-2g_R5_tsc_noEmit.log`) |
| Lint | `npx eslint src/wearables/connectors/polar/` | PASS, exit 0 (`PR-HK-2g_R5_eslint_polar.log`) |
| Wearables regression | `NODE_OPTIONS=--max-old-space-size=1536 npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 328 tests (`PR-HK-2g_R5_jest_wearables.log`) |
| Build | `NODE_OPTIONS=--max-old-space-size=3072 npx nest build` | PASS, exit 0 (`PR-HK-2g_R5_nest_build.log`) |

Note: the isolated worktree initially hit sandbox resource contention/ENOSPC during dependency install and early uncapped gates. After excluding the partial dependency artifact from the project tree and using the complete shared dependency installation, all five required gates completed successfully at the pinned SHA; the failed setup attempt is preserved in `PR-HK-2g_R5_npm_ci.log` and is not counted as a product-code gate failure.

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Pinned SHA / R55 | PASS | Detached isolated worktree verified at `5a8424871467078be25de923663debdad9eb47ec`. |
| Write-set mutex | PASS | Only the 9 allowed Polar connector files changed. |
| Implements `WearableConnector` | PASS | `PolarConnector implements WearableConnector`; `provider = POLAR`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Uses Polar OAuth authorize/token endpoints, `accesslink.read_all`, env-provided client id/secret/redirect URI, and HTTP Basic token exchange. |
| Token storage/KMS contract | PASS | Connector returns token material to the shared OAuth lane and does not persist raw tokens itself; token-like strings are redacted before logs/`last_error`. |
| Refresh-token semantics | PASS | Models Polar's long-lived token posture by re-presenting the stored durable credential. |
| Webhook raw-body HMAC | PASS | Verifies `Polar-Webhook-Signature` over raw body with constant-time compare and fails closed on missing secret/signature/bad digest. |
| Webhook idempotency ordering | PASS | Uses reservation-first `createMany({ skipDuplicates: true })` before fetch/normalize/ingest, stamps `handler_completed_at` after success, and deletes the unfinished reservation on processing failure for redelivery. |
| Durable webhook event before 200 | PASS | Non-PING events reserve the processed-event row before downstream work and only return success after completion stamp / no-op duplicate path. |
| Zod strict payload validation | PASS | Webhook schema uses `z.enum(POLAR_WEBHOOK_EVENTS)`, `.strict()`, and `superRefine` for non-PING `user_id` + subject requirements. |
| PING handling | PASS | PING is acknowledged only after signature and strict payload validation, with no reservation/fetch/ingest. |
| Fail-closed webhook validation | PASS | Missing raw body, invalid HMAC, malformed JSON, strict-schema failure, unknown fields/events, and missing non-PING subject data reject before provider/ingest side effects. |
| PII/log redaction | PASS | Webhook logs use hashed `user_id_hash` and do not echo raw payloads; connector errors redact token-like values. |
| OAuth/provider error log redaction | PASS | `redactErrorMessage()` strips token/client-secret/auth-header patterns before persistence or logging. |
| HTTP discipline / 429 handling | PASS | All provider calls route through `ProviderHttpClient`; no raw `fetch`/axios path in the Polar connector. |
| Backfill date clamp / provider limits | PASS | Backfill clamps to 28 days and uses date-keyed sleep/recharge resources. |
| Backfill outage error handling / R3 fix | PASS | R5 verified `markConnectionError()` no longer uses `.catch(() => undefined)`: the status write is inside explicit `try/catch`, status-write failure emits structured redacted `wearables.polar.connection_error_persist_failed`, and the outer `refresh()` / `backfill()` catch rethrows the original provider error. |
| `exercises` → `WORKOUT_DURATION_MIN` | PASS | Normalizer maps ISO-8601 exercise duration to minutes. |
| `exercises` → `WORKOUT_DISTANCE_M` | PASS | Normalizer maps exercise distance in metres. |
| `exercises` → `HEART_RATE_BPM` | PASS | Normalizer maps average heart rate when present. |
| `sleep` → `SLEEP_TOTAL_MIN` | PASS | Normalizer derives total sleep minutes from Polar sleep stages. |
| `sleep` → `SLEEP_REM_MIN` / `SLEEP_DEEP_MIN` / `SLEEP_LIGHT_MIN` / `SLEEP_AWAKE_MIN` | PASS | Normalizer maps all required sleep-stage minute metrics. |
| `sleep` extra metrics | PASS | No unapproved `SLEEP_EFFICIENCY_PCT` sample is emitted. |
| `nightly-recharge` → `RECOVERY_SCORE` / `HRV_MS` | PASS | Normalizer maps nightly recharge status and HRV milliseconds. |
| Bradley Law: prohibited shipped literals | PASS | No `Coming soon`, `TODO`, `XXX`, or shipped-code `stub` literal in Polar implementation files; one test comment says `stubbed`, non-shipped. |
| Bradley Law: swallowed exceptions | PASS | No `.catch(() => undefined)`, `.catch(() => null)`, empty catch, or console.log-only catch in the Polar diff. |
| Bradley Law: type-system bypasses | PASS | No `@ts-ignore` and no `as any` in the Polar connector folder. |
| Bradley Law: fail-closed validation | PASS | Signature/config/schema validation rejects before side effects; normalizer drops unparseable records rather than emitting invalid samples. |
| R65 #1 hardcoded secrets | PASS | No production secrets in source; test literals are synthetic and redaction tests assert secret removal. |
| R65 #5 IDOR | PASS | Webhook resolves server-side connection by provider + HMAC-verified Polar `user_id` mapped to `external_account_id`, scoped to non-disconnected connections; no client-supplied internal connection id is trusted. |
| R65 #8 input validation | PASS | Strict Zod runtime schema on webhook payloads; no TypeScript-only validation at the webhook boundary. |
| R65 #12 secret exposure in errors | PASS | Error strings are redacted before `last_error` and logs; API-facing validation errors do not echo raw payload values. |
| R65 #17 fake test coverage | PASS | R5 suite passes 328 real-value tests; the R4-added persist-failure test asserts original error rethrow, update attempt, structured log, and redaction. |
| R65 #28/#29 race/idempotency | PASS | Reservation-first durable event row removes check-then-act race and prevents duplicate downstream processing. |
| R65 #34 logging/observability | PASS | Error paths use structured Nest logger context rather than console output. |
| R65 #35 API timeout handling | PASS | Provider HTTP calls use `ProviderHttpClient`, inheriting timeout/backoff behavior. |
| R65 #36 silent failures | PASS | R3 silent `.catch(() => undefined)` is removed; no matching swallowed-error pattern remains in the Polar diff. |
| R65 #44 transactions / multi-step writes | PASS | Connector-side writes are single-row reservation/status operations; ingestion batching remains delegated to the shared ingestion lane. |
| R65 #50 graceful degradation | PASS | Provider/backfill failures mark connection `status='error'`, persist redacted `last_error` when possible, log failures, and rethrow for caller/redelivery. |
| Commit author hygiene | PARTIAL / P3 note | Latest R4 fix commit has correct author, empty body, and no trailers. The older original backend commit still has a non-empty body, as already noted in R3; per R5 instructions this remains a P3 process note only and does not block. |

## Findings

No P0/P1/P2 findings.

### 1. LOW — Original backend commit body hygiene is still not fully clean

**Code:** branch commit history (`git log origin/main..HEAD --format='%H%n%an <%ae>%n%s%n%b%n---END---'`)

```text
ef79c47ffe1a9a716fdd94a9960280321eab9d55
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.g: Polar AccessLink connector (OAuth2 + webhook + backfill)
Add the file-disjoint Polar connector under src/wearables/connectors/polar/
implementing the PR-HK-0 WearableConnector contract.
...
---END---
```

The latest R4 fixer commit (`5a8424871467078be25de923663debdad9eb47ec`) has correct author, empty body, and no trailers, but the full branch range still includes the original backend commit with a non-empty body. This is a process-hygiene mismatch only and, per the R5 instruction, is noted as a non-blocking P3 because the latest fixer commit satisfies this round's commit-hygiene requirement.

**Impact:** No runtime impact; minor process hygiene only.

**Expected fix:** If parent later authorizes history rewrite, squash/amend the original branch commit body empty; otherwise keep this documented exception.

## R3/R4 re-audit summary

- R3 P1 `markConnectionError()` swallowed status-update persistence failure: RESOLVED. The `.catch(() => undefined)` is gone; the write now uses explicit `try/catch`, logs `wearables.polar.connection_error_persist_failed` with redacted metadata on persistence failure, and the outer provider error path still rethrows.
- R3 P3 original commit-body hygiene: NOT REWRITTEN, but non-blocking for R5 because the latest R4 fix commit has correct author, empty body, and no trailers.
- R65 sweep: CLEAN for the prioritized categories #1, #5, #8, #12, #17, #28/#29, #34, #35, #36, #44, and #50.

## Positive observations

- The R4 fix added a direct regression test for the prior P1 path: failed `wearableConnection.update()` during a provider outage logs a redacted structured persistence-failure event while the original provider error still propagates.
- Webhook delivery semantics are now robust: reserve first, process once, stamp completion after success, and release unfinished reservations on failure for safe redelivery.
- Strict webhook schema validation and explicit event enum constraints provide the required fail-closed boundary.
- Polar normalization matches the §3.1 binding exactly, including removal of unapproved sleep efficiency output.
- All five gates pass at the pinned R5 SHA.

## Commit hygiene check

```text
5a8424871467078be25de923663debdad9eb47ec
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.g: log redacted persist-failure on connection error-status write instead of swallowing it

---END---
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

CLEAN. At pinned head `5a8424871467078be25de923663debdad9eb47ec`, the R3 P1 is resolved, the R65/50-Failures sweep found no blocking patterns, all five gates pass, and there are zero P0/P1/P2 findings. One older-commit body hygiene item remains documented as a non-blocking P3 process note.
