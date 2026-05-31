# AUDIT — Hygiene H4 storefront join-token throttle R3 (PR #338)
VERDICT: NOT CLEAN
Pinned backend SHA: `580ac6cfb172232e2a77750012dbd0f21e6af38b`
Auditor: independent R3 re-audit (SHA-pinned)

Typecheck: pass — ran `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit --pretty false` at `580ac6cfb172232e2a77750012dbd0f21e6af38b`; exit 0.
Lint: pass — ran `npx eslint src/storefront/storefront-public.controller.ts src/throttler/throttler.config.ts test/storefront-public.controller.spec.ts test/rate-limit.spec.ts`; exit 0.
Tests: pass — focused H4 gate passed with 2 suites and 77/77 tests using `NODE_OPTIONS=--max-old-space-size=1536 ./node_modules/.bin/jest --runTestsByPath test/storefront-public.controller.spec.ts test/rate-limit.spec.ts --runInBand --verbose`. Note: the literal `yarn jest ...` command is not available in this repo (`yarn run v1.22.22` reports `Command "jest" not found; Did you mean "test"?`); `yarn test ...`/direct Jest are the working equivalents. A non-verbose combined run was killed once; the final verbose direct-Jest run completed green.

Finding counts: P0=0, P1=0, P2=1, P3=0.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [`git diff origin/main..580ac6cf --stat`] The explicit R3 scope gate does **not** produce the claimed “only 3 H4 files” result. The exact command returned 10 files: `src/packages/drip-dispatcher.cron.ts`, `src/packages/package-contents.controller.ts`, `src/packages/package-contents.service.ts`, `src/real-meal-plans/real-meal-plans.controller.ts`, `src/storefront/storefront-public.controller.ts`, `src/throttler/throttler.config.ts`, `test/drip-dispatcher.cron.spec.ts`, `test/package-contents.service.spec.ts`, deleted `test/real-meal-plans-guards.spec.ts`, and `test/storefront-public.controller.spec.ts` (1047 insertions / 1140 deletions). The fix commit itself is correctly limited to the three parent-authorized H4 files, but the requested two-dot check against current `origin/main` fails and makes the branch-scope verification ambiguous. Fix by rebasing/refreshing the PR branch (or otherwise making `git diff origin/main..580ac6cf --stat` show only the three H4 files) before merge.

## P3 (non-blocking)
- None.

## Verification of R2 findings
- P1 #1 throttler isolation: verified closed. `src/storefront/storefront-public.controller.ts:96-109` derives `STOREFRONT_JOIN_SKIP_THROTTLERS` from all `THROTTLER_NAMES` except `default` and `storefront-join-ip`, and `src/storefront/storefront-public.controller.ts:245-255` applies `@SkipThrottle(...)` plus the two intended route-level throttlers only. Independent runtime harness using the real `UserThrottlerGuard`, real handler metadata, and full `THROTTLER_LIMITS` produced `sameTokenBlockedAt: 21` and `distinctTokenBlockedAt: 121` (`/home/user/workspace/h4_r3_runtime_verify.log`). The focused Jest suite also proves the same behavior at `test/storefront-public.controller.spec.ts:887-1038`.
- P1 #2 Redis-down fail-open: verified closed. `src/throttler/throttler.config.ts:303-355` wraps storage increments, catches backend errors, logs `throttler.storage_unavailable.fail_open`, emits `throttler_storage_failures_total{throttler=<name>}`, increments a process-local counter, and returns `{ totalHits: 0, isBlocked: false }`; `src/throttler/throttler.config.ts:424-433` wires the wrapper around Redis storage. Independent verification produced a non-blocking record, warning, metric, and counter (`/home/user/workspace/h4_r3_redis_failopen_verify.log`). The focused Jest suite covers failure, healthy passthrough, and broken metric-sink cases at `test/storefront-public.controller.spec.ts:1047-1121`.
- P2 parent-authorized wording: verified closed. `specs/HYGIENE_H4_STOREFRONT_TOKEN_BRIEF.md:12-19` now explicitly says `PARENT-AUTHORIZED`, `AUTHORIZED BY THE PARENT AGENT`, and identifies the H4 fixer directive / PR-18 wave orchestrator authorization.

## Additional PR claim verification
- Pinned SHA verified: worktree was added at `580ac6cfb172232e2a77750012dbd0f21e6af38b`.
- Author/trailers: verified commit author is `Dynasia G <dynasia@trygrowthproject.com>` and the commit body contains no trailers.
- Fix-commit write set: verified `git show --stat 580ac6cf` changes exactly three files: `src/storefront/storefront-public.controller.ts`, `src/throttler/throttler.config.ts`, and `test/storefront-public.controller.spec.ts`.
- Requested PR-range two-dot write set: failed as P2 above; `git diff origin/main..580ac6cf --stat` shows 10 files rather than only the three H4 files.
- GET join route remains `@Public()` and carries the intended `@Throttle` layers at `src/storefront/storefront-public.controller.ts:245-256`; POST checkout remains on the same default `{ ttl: 60_000, limit: 20 }` composite mechanism at `src/storefront/storefront-public.controller.ts:278-280`.
- Composite tracker source remains shared in `src/throttler/user-throttler.guard.ts:115-144`, returning `storefront-join:<token>:<ip>` for storefront join paths and falling back to normal `ip:<addr>` for unrelated public routes.
- The IP-wide layer is globally registered with a non-biting 10,000/min baseline at `src/throttler/throttler.config.ts:213-221`, while the route-level override uses `STOREFRONT_JOIN_IP_PER_MIN` (default 120/min) at `src/storefront/storefront-public.controller.ts:249-253`.

## 50-failures checklist — security #1-13 and infra #48-50
| Item | Result | Notes |
|---|---|---|
| #1 | Pass | No new hardcoded secrets or credentials; Redis URL remains env-driven and not logged raw beyond host-level operator confirmation. |
| #2 | N/A / no regression | No database schema/RLS or tenant data-access change in the H4 fix commit. |
| #3 | Pass | No raw SQL or query construction added by the H4 fix. |
| #4 | Pass | No HTML rendering or XSS-relevant output added by the throttle/storage change. |
| #5 | N/A / no regression | No object lookup or authorization-scope change; storefront token lookup behavior is unchanged. |
| #6 | Pass | Token format validation remains via `ShareTokenPipe`; throttle key code normalizes missing/array headers defensively. |
| #7 | Pass | No new sensitive data exposure; fail-open logs omit raw throttle keys and PII. |
| #8 | Pass | Input validation for `:token` remains before service access; new route tracker tolerates malformed/missing headers without throwing. |
| #9 | N/A / no regression | Route remains intentionally public; no role/guard weakening beyond existing storefront-public design. |
| #10 | N/A / no regression | Dependency/secret-scan CI posture unchanged by this PR. |
| #11 | N/A / no regression | Headers/CORS/security middleware unchanged by this PR. |
| #12 | Pass | No unsafe deserialization, file handling, or external fetch path added. |
| #13 | N/A / no regression | No CORS/CSP/public-host policy change. |
| #48 | P2 scope issue | Branch/diff hygiene check fails: `git diff origin/main..580ac6cf --stat` includes 10 files rather than only three H4 files. |
| #49 | Pass | Redis-down infrastructure degradation now fails open with observable warning/metric/counter instead of propagating 5xx. |
| #50 | Pass | Focused test/typecheck/lint gates pass; no deploy/runtime config regression found in the H4 files. |

## R0 review (Google lens)
The R2 functional issues are fixed: the public join route is now governed by exactly the composite `default` layer and IP-wide `storefront-join-ip` layer, same-token traffic blocks at 21 rather than 4, distinct-token traffic blocks at 121, and Redis storage failures fail open with observability. However, I would not merge while the explicit `git diff origin/main..580ac6cf --stat` scope gate shows non-H4 package/drip/meal-plan/test files; make the branch compare cleanly to `origin/main` before treating PR #338 as clean.
