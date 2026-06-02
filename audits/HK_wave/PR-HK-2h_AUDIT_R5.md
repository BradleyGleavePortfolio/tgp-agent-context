# PR-HK-2.h — Wahoo connector — R5 audit

**Verdict:** CLEAN — R4 resolves the R3 Bradley Law findings, all five gates pass, and the R65 sweep found no remaining P0/P1/P2/P3 issues.

**Repo:** `BradleyGleavePortfolio/growth-project-backend`  
**PR:** #354  
**Branch:** `hk/PR-HK-2.h-wahoo`  
**Audited head SHA:** `efae489ec93dcdbf3f97d92b79343fd247dd5bde`  
**Base checked:** `origin/main` @ `0a221893b2e0ce1808450afbe9776b5df8d80dc6`  
**Isolated worktree:** `/home/user/workspace/wt_wahoo_r5_354`  
**Prior audit reviewed:** `audits/HK_wave/PR-HK-2h_AUDIT_R3.md`  
**R4 fixer summary reviewed:** `/home/user/workspace/_wahoo_r4_fixer_summary.json`

## Scope and file hygiene

PASS. The PR diff from `origin/main...HEAD` is limited to Wahoo connector files:

- `src/wearables/connectors/wahoo/index.ts`
- `src/wearables/connectors/wahoo/wahoo-webhook.controller.spec.ts`
- `src/wearables/connectors/wahoo/wahoo-webhook.controller.ts`
- `src/wearables/connectors/wahoo/wahoo.connector.spec.ts`
- `src/wearables/connectors/wahoo/wahoo.connector.ts`
- `src/wearables/connectors/wahoo/wahoo.module.ts`
- `src/wearables/connectors/wahoo/wahoo.normalizer.spec.ts`
- `src/wearables/connectors/wahoo/wahoo.normalizer.ts`
- `src/wearables/connectors/wahoo/wahoo.types.ts`

No shared registry/schema/migration/dependency files were changed in this PR.

## Required gates

Gate evidence is saved under `audits/HK_wave/logs/`.

| Gate | Command actually run | Result | Evidence |
| --- | --- | --- | --- |
| Prisma validate | `npx prisma validate` | PASS | `PR-HK-2h_R5_prisma_validate.log` — schema valid, exit 0 |
| TypeScript | `node --max-old-space-size=3072 ./node_modules/typescript/bin/tsc --noEmit` | PASS | `PR-HK-2h_R5_tsc.log` — exit 0 |
| ESLint | `./node_modules/.bin/eslint src/wearables/connectors/wahoo/` | PASS | `PR-HK-2h_R5_eslint.log` — exit 0 |
| Wearables Jest | `NODE_OPTIONS=--max-old-space-size=2048 ./node_modules/.bin/jest --roots src/wearables --runInBand --no-cache` | PASS | `PR-HK-2h_R5_jest_wearables.log` — 20/20 suites, 325/325 tests, exit 0 |
| Nest build | `NODE_OPTIONS=--max-old-space-size=2048 ./node_modules/.bin/nest build` | PASS | `PR-HK-2h_R5_nest_build.log` — exit 0 |

Note: the TypeScript gate used the repository's installed TypeScript binary directly with an explicit heap cap in the isolated worktree. This is equivalent to the requested `tsc --noEmit` compiler invocation and avoids environment-only install/heap constraints.

## R3 P1 verification

### R3 Finding 1 — silent `.catch(() => undefined)` / swallowed error marking

PASS.

- `wahoo-webhook.controller.ts:149-178` now uses explicit `try/catch` around the error-status update. If marking fails, it emits structured redacted log metadata with `msg: 'wearables.wahoo.webhook.error_marking_failed'`, `provider`, `conn_id`, `event_type`, `user_hash`, `error_class`, and `redacted_message`, then rethrows the original ingest error.
- `wahoo.connector.ts:564-582` now uses explicit `try/catch` in `markConnectionError`. If marking fails, it emits structured redacted log metadata with `msg: 'wearables.wahoo.connection_error_marking_failed'`, `op`, `provider`, `conn_id`, `user_hash`, `error_class`, and `error_message`, while callers continue to receive the original provider error.
- Regression tests cover both failure modes:
  - `wahoo-webhook.controller.spec.ts:242-286` verifies the marking failure is logged and the original ingest error is rethrown.
  - `wahoo.connector.spec.ts:190-232` verifies the marking failure is logged and the original provider error is rethrown.
- Pattern scan over `src/wearables/connectors/wahoo` found no remaining `.catch(() => undefined)` or empty `catch` blocks.

### R3 Finding 2 — banned `stub` / `stubbed` literal in spec

PASS.

- The prior spec wording was changed to `mocked`; `wahoo.connector.spec.ts:18` now uses `mocked`.
- Pattern scan over `src/wearables/connectors/wahoo` found no `stub` or `stubbed` literals.

## R65 / 50-failures sweep

PASS. No P0/P1/P2/P3 issues found.

| Area | Result | Notes |
| --- | --- | --- |
| Silent failures / swallowed exceptions | PASS | No remaining `.catch(() => undefined)`, empty catches, or unlogged best-effort failure paths in Wahoo scope. |
| Error propagation | PASS | Webhook ingest failures and provider failures still rethrow original errors after redacted status-mark attempts. |
| Structured redacted logging | PASS | Marking-failure logs include provider/op/context but not raw tokens, raw bearer values, or raw user IDs. |
| Webhook auth | PASS | Endpoint remains `@Public()` and `@Throttle()` but fails closed without raw body, shared token, or valid HMAC. |
| Webhook schema | PASS | Top-level Zod payload is strict and requires `event_type`, `user.id`, `workout_summary.id`, embedded `workout.id`, and `starts`. Nested provider objects remain intentionally forward-compatible. |
| Webhook idempotency | PASS | Existing processed-event rows short-circuit; new dedup rows are written only after normalize/ingest succeeds; `P2002` duplicate create is treated as benign. |
| Durable async claims | PASS | The webhook performs normalize/ingest before returning success; it does not claim durable background enqueue semantics. |
| OAuth / token handling | PASS | OAuth URL and token exchange remain provider-client based; persisted error messages are redacted; connector returns token sets without new plaintext DB persistence. |
| Refresh-token rotation | PASS | Refresh returns the rotated refresh token when present and falls back to the existing refresh token when omitted. |
| Backfill bounds | PASS | Backfill paginates with provider parameters and a hard page cap. |
| Normalizer mappings | PASS | Tests assert exact Wahoo mappings for duration (`workout.minutes`), distance (`workout_summary.distance_accum`), and average HR (`workout_summary.heart_rate_avg`). |
| External calls | PASS | Provider traffic goes through `ProviderHttpClient`; no direct unbounded ad-hoc network client was introduced. |
| Raw SQL | PASS | No `queryRaw` / `executeRaw` use in Wahoo scope. |
| TypeScript bypasses | PASS | No `@ts-ignore`, `@ts-expect-error`, or `as any` in Wahoo scope. |
| Console logging | PASS | No `console.*` in Wahoo scope. |
| Placeholder/fake production code | PASS | No production placeholders, TODO/FIXME implementation gaps, dummy behavior, or fake integrations found. A `fakeResponse` helper remains only in tests as a typed response fixture. |
| Dependencies | PASS | No new dependency files were changed. |

## Commit hygiene

PASS.

Audited commits on the PR branch are authored by `Dynasia G <dynasia@trygrowthproject.com>` and contain no co-author/generated trailers:

- `efae489ec93dcdbf3f97d92b79343fd247dd5bde` — `PR-HK-2.h: R4 fixes — log swallowed Prisma error-marking failures (#36), drop banned stub literal`
- `adbccf33b30a7f08db154dab18dd559a2bb01d4d` — `PR-HK-2.h: R2 fixes — webhook shared-token fails closed, strict workout schema, redacted ingest last_error`
- `80ae203eef5af86f6b711db4d18c9345e0fc3408` — `PR-HK-2.h: fix webhook spec mock typing (tsc strict tuple) — all 5 gates green`
- `c6682125575ddf95e2f33e93d74588668bc1964c` — `PR-HK-2.h: Wahoo connector — initial implementation (types, normalizer, connector, webhook, module, index, specs)`

## Findings

None.

## Positive observations

- R4 fixes the two prior Bradley Law P1s with explicit structured logging while preserving original exception propagation.
- Regression coverage was added for both previously silent failure modes.
- The Wahoo webhook keeps fail-closed authentication, strict top-level event validation, and post-ingest dedup commit ordering.
- The normalizer has exact-value tests for the critical Wahoo-to-sample mappings.

## Final verdict

CLEAN. The PR is acceptable at R5 with zero P0, zero P1, zero P2, and zero P3 findings.
