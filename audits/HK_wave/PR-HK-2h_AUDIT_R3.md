# PR-HK-2.h — Wahoo connector — R3 audit

**Verdict:** FAIL — R2 fixed the R1 webhook token/schema/redaction findings and all five gates pass, but Bradley Law still fails on swallowed exceptions and a banned `stub` literal.

**Repo:** `growth-project-backend`  
**PR:** #354  
**Audited head SHA:** `adbccf33b30a7f08db154dab18dd559a2bb01d4d`  
**Base:** `main` @ `8cfb44f6f8a8faed00c527c21481beb80e0ec761`  
**Build report reviewed:** `HK_PR-HK-2h-wahoo_BUILD.md` @ `e4b7f94`  
**R2 fixer summary reviewed:** `_wahoo_r2_fixer_summary.json` (`new_head_sha_full=adbccf33b30a7f08db154dab18dd559a2bb01d4d`)  
**Auditor:** R3

## Scope / write-set verification

PASS. The audited diff is exactly 9 files, all under `src/wearables/connectors/wahoo/`:

```text
src/wearables/connectors/wahoo/index.ts
src/wearables/connectors/wahoo/wahoo-webhook.controller.spec.ts
src/wearables/connectors/wahoo/wahoo-webhook.controller.ts
src/wearables/connectors/wahoo/wahoo.connector.spec.ts
src/wearables/connectors/wahoo/wahoo.connector.ts
src/wearables/connectors/wahoo/wahoo.module.ts
src/wearables/connectors/wahoo/wahoo.normalizer.spec.ts
src/wearables/connectors/wahoo/wahoo.normalizer.ts
src/wearables/connectors/wahoo/wahoo.types.ts
```

No module/registry edits were present in the diff. R3 was pinned to `adbccf33b30a7f08db154dab18dd559a2bb01d4d` in isolated worktrees; the primary inspection worktree and the dependency-bearing Wahoo worktree both verified the same HEAD SHA.

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| Prisma | `DATABASE_URL=postgresql://audit:audit@localhost:5432/audit DIRECT_URL=postgresql://audit:audit@localhost:5432/audit npx prisma validate` | PASS, exit 0 (`PR-HK-2h_R3_prisma_validate.log`) |
| Types | `NODE_OPTIONS=--max-old-space-size=2048 npx tsc --noEmit` | PASS, exit 0 (`PR-HK-2h_R3_tsc.log`) |
| Lint | `npx eslint src/wearables/connectors/wahoo/` | PASS, exit 0 (`PR-HK-2h_R3_eslint.log`) |
| Wearables regression | `NODE_OPTIONS=--max-old-space-size=2048 npx jest --roots src/wearables --runInBand --no-cache` | PASS, 20 suites / 323 tests (`PR-HK-2h_R3_jest_wearables.log`) |
| Build | `NODE_OPTIONS=--max-old-space-size=2048 npx nest build` | PASS, exit 0 (`PR-HK-2h_R3_nest_build.log`) |

## Checklist assessment

| Area | Status | Notes |
| --- | --- | --- |
| Implements `WearableConnector` | PASS | `WahooConnector implements WearableConnector`; `provider = WAHOO`, `authModel = oauth2`. |
| OAuth URL/scopes/token URL | PASS | Auth URL, token URL, scopes, and state round-trip are asserted with real values. |
| Refresh-token rotation | PASS | `refresh()` returns the rotated refresh token and marks the connection error on provider failure. |
| Backfill pagination | PASS | Pages `/v1/workouts?page=N&per_page=100` with a 100-page cap and short-page stop. |
| Rate-limit / timeout discipline | PASS | Outbound provider calls go through `ProviderHttpClient`; 429/backoff behavior is inherited from the shared client. |
| Webhook `@Public`, raw body, throttle | PASS | Controller is public, requires `req.rawBody`, and uses `@Throttle({ ttl: 60_000, limit: 500 })`. |
| Webhook HMAC validation | PASS | Requires signature/timestamp and fails closed when no HMAC secret/client secret is configured. |
| R1 Finding 1 — shared-token missing-config fail-closed | PASS | `WAHOO_WEBHOOK_TOKEN` is now required; unset/empty config returns false before payload parse/dedup/ingest and regression tests cover unset/empty/body-missing token cases. |
| R1 Finding 2 — strict Zod schema | PASS | `event_type` is constrained to `workout_summary`; `user.id`, `workout_summary.id`, embedded `workout.id`, and `workout.starts` are required before dedup lookup or commit. |
| R1 Finding 3 — `last_error` redaction | PASS | Webhook ingest-failure persistence now uses `redactErrorMessage(err)` and the regression test proves bearer/token-like strings are not stored. |
| Webhook idempotency ordering | PASS | Checks `WearableProcessedEvent` before processing and writes the dedup row only after normalize/ingest succeeds; duplicate and P2002 paths are covered. |
| Durable enqueue / response semantics | PASS | Webhook ingest is synchronous before 200; no async work item is claimed or dropped. |
| PII in logs | PASS | Normal webhook logs use `user_hash`; ingest failure logs `error_class` only. |
| OAuth error log redaction | PASS | Token request failures log structured metadata rather than raw response bodies or URLs containing tokens. |
| KMS token handling | PASS | Connector returns `TokenSet` only and reads decrypted tokens supplied by the connection lane; it does not persist plaintext tokens. |
| Normalizer mapping — `WORKOUT_DURATION_MIN` | PASS | Maps `workout.minutes` to minutes with exact value tests. |
| Normalizer mapping — `WORKOUT_DISTANCE_M` | PASS | Maps `workout_summary.distance_accum` string to meters with real-value tests. |
| Normalizer mapping — `HEART_RATE_BPM` | PASS | Maps `workout_summary.heart_rate_avg` string to bpm with real-value tests. |
| Bradley Law — no swallowed exceptions | **FAIL** | See Finding 1: two Prisma update failures are explicitly swallowed with `.catch(() => undefined)`. |
| Bradley Law — no banned placeholder/stub literals | **FAIL** | See Finding 2: `stubbed` appears in a Wahoo spec comment. |
| Bradley Law — no `@ts-ignore` / `as any` bypass | PASS | Pattern scan found no `@ts-ignore` and no `as any` in the Wahoo write-set. |
| File hygiene | PASS | Three backend commits by `Dynasia G <dynasia@trygrowthproject.com>`; commit bodies contain no co-author/generated trailers. |

## Findings

### 1. HIGH — Bradley Law violation: Prisma update exceptions are swallowed in error-marking paths

**Code:** `src/wearables/connectors/wahoo/wahoo-webhook.controller.ts:149-157` and `src/wearables/connectors/wahoo/wahoo.connector.ts:564-569`

```ts
await this.prisma.wearableConnection
  .update({
    where: { id: connection.id },
    data: {
      status: 'error',
      last_error: redactErrorMessage(err),
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

The R2 redaction fix correctly sanitizes `last_error`, but both error-marking paths still explicitly discard any Prisma update failure. Bradley Law for this R3 states that any swallowed exception is a P1 violation. Here, if the status/`last_error` write fails, the connector loses the operational failure marker without any structured record of the write failure.

**Impact:** A provider/backfill/ingest failure can be rethrown while the durable connection status remains stale, and the failed attempt to record that status is invisible. This undermines the fail-explicit connection-state contract and violates the no-swallowed-exceptions rule.

**Expected fix:** Do not use `.catch(() => undefined)`. If preserving the original provider error is required, catch the update failure explicitly, log sanitized structured metadata for the update failure, and then rethrow the original error; otherwise let the update failure propagate. Add a regression test proving the update-failure branch is observable and never silently discarded.

### 2. HIGH — Bradley Law violation: banned `stub` literal remains in Wahoo spec comment

**Code:** `src/wearables/connectors/wahoo/wahoo.connector.spec.ts:16-19`

```ts
/**
 * PR-HK-2.h connector tests — real-value assertions. `ProviderHttpClient` is
 * stubbed so no real network is touched. OAuth env is set in beforeEach.
 */
```

Bradley Law for this R3 states that any `stub` literal is a P1 violation. The Wahoo spec still contains the banned literal as part of `stubbed`.

**Impact:** This is a process/hygiene failure under the explicit R3 law. Even though the tests use real assertions and no production stub implementation is present, the literal is forbidden in the write-set.

**Expected fix:** Replace the banned wording with an allowed term such as `mocked`, then re-run the Bradley Law scan and gates.

## Positive observations

- R2 directly addressed all three R1 findings: missing `WAHOO_WEBHOOK_TOKEN` now fails closed, malformed workout events are rejected before dedup/commit, and ingest `last_error` persistence is redacted.
- The Wahoo normalizer remains clean and deterministic, with real-value assertions for all three binding §3.1 mappings and correct units/bucket/window behavior.
- The webhook flow preserves check → process → commit ordering and does not write a processed-event row on ingest failure.
- The full wearables regression suite increased to 323 tests and passes at the audited SHA.

## Final verdict

FAIL. The R1 Wahoo security/validation/redaction defects are resolved and every gate passes at `adbccf33b30a7f08db154dab18dd559a2bb01d4d`, but the PR is not clean under the explicit R3 Bradley Law because Wahoo still swallows Prisma update exceptions in two error-marking paths and contains a banned `stub` literal in the connector spec.

## Audit commit hygiene check

```text
adbccf33b30a7f08db154dab18dd559a2bb01d4d
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.h: R2 fixes — webhook shared-token fails closed, strict workout schema, redacted ingest last_error

---END---
80ae203eef5af86f6b711db4d18c9345e0fc3408
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.h: fix webhook spec mock typing (tsc strict tuple) — all 5 gates green

---END---
c6682125575ddf95e2f33e93d74588668bc1964c
Dynasia G <dynasia@trygrowthproject.com>
PR-HK-2.h: Wahoo connector — initial implementation (types, normalizer, connector, webhook, module, index, specs)

---END---
```
