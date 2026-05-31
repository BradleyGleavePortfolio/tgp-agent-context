# AUDIT — Hygiene H4 storefront join-token throttle R4 (PR #338)
VERDICT: CLEAN
Pinned backend SHA: `5a0aa376d48e45cf547ecdbb5a22f560edb90a68`
Auditor: independent R4 re-audit (SHA-pinned)

Typecheck: pass — ran `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit --pretty false` at `5a0aa376d48e45cf547ecdbb5a22f560edb90a68`; exit 0.
Lint: pass — ran `npx eslint src/storefront/storefront-public.controller.ts src/throttler/throttler.config.ts test/storefront-public.controller.spec.ts test/rate-limit.spec.ts`; exit 0.
Tests: pass — after installing the worktree dependencies with `yarn install --frozen-lockfile`, ran the requested focused command `NODE_OPTIONS=--max-old-space-size=1536 yarn jest test/storefront-public.controller.spec.ts test/rate-limit.spec.ts --runInBand --verbose`; result: 2 suites passed, 77/77 tests passed. Note: before dependencies were installed in the fresh worktree, the same `yarn jest ...` command failed with `Command "jest" not found`; the passing command above is the requested `yarn jest` command after dependency installation.

Finding counts: P0=0, P1=0, P2=0, P3=0.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- None.

## P3 (non-blocking)
- None.

## R4 scope / write-set verification
- Pinned SHA verified: worktree was added at `5a0aa376d48e45cf547ecdbb5a22f560edb90a68`.
- Author/trailers: verified all three commits in `origin/main..5a0aa376` are authored by `Dynasia G <dynasia@trygrowthproject.com>` and `%(trailers)` is empty for each (`aca6368`, `33a1453`, `5a0aa37`).
- Required two-dot write set is now clean. `git diff origin/main..5a0aa376 --name-only` returned exactly:
  - `src/storefront/storefront-public.controller.ts`
  - `src/throttler/throttler.config.ts`
  - `test/storefront-public.controller.spec.ts`
- `git diff origin/main..5a0aa376 --stat` shows only those 3 files, with 890 insertions and 4 deletions. The R3 P2 write-set/base-mismatch finding is closed.
- Rebase-only preservation verified: the three H4 files are byte-identical between the R3-audited SHA `580ac6cfb172232e2a77750012dbd0f21e6af38b` and R4 SHA `5a0aa376d48e45cf547ecdbb5a22f560edb90a68` (`git diff --exit-code 580ac6cf 5a0aa376 -- <file>` returned no diff for each H4 file).

## Verification of R2 functional fixes
- P1 throttler isolation remains fixed. `src/storefront/storefront-public.controller.ts:96-109` derives `STOREFRONT_JOIN_SKIP_THROTTLERS` from every `THROTTLER_NAMES` value except `default` and `storefront-join-ip`; `src/storefront/storefront-public.controller.ts:245-255` applies `@SkipThrottle(STOREFRONT_JOIN_SKIP_THROTTLERS)` plus exactly the two intended route-level throttle layers.
- Real-guard throttle isolation is covered and passed. `test/storefront-public.controller.spec.ts:929-1038` drives a real `ThrottlerGuard` with the full `THROTTLER_LIMITS` table and actual route metadata; the passing assertions prove same-token+same-IP allows 20 and rejects the 21st, while distinct-token+same-IP rejects at the 121st (`THROTTLER_ROUTE_LIMITS.STOREFRONT_JOIN_IP_PER_MIN + 1`) and not the 4th.
- Composite tracker remains shared and unchanged. `src/throttler/user-throttler.guard.ts:115-144` returns `storefront-join:<token>:<ip>` for storefront join paths and falls back to normal IP buckets for unrelated public routes.
- Redis-down fail-open remains fixed. `src/throttler/throttler.config.ts:303-355` wraps storage increments, catches backend errors, logs `throttler.storage_unavailable.fail_open`, emits `throttler_storage_failures_total{throttler=<name>}`, increments a process-local counter, and returns `{ totalHits: 0, isBlocked: false }`; `src/throttler/throttler.config.ts:424-433` wires the wrapper around Redis storage.
- Redis-down behavior is covered and passed. `test/storefront-public.controller.spec.ts:1047-1121` verifies a thrown backend increment returns an allow/non-blocking record, emits one warning, emits the low-cardinality metric, passes healthy storage records through unchanged, and still never throws if the metric sink itself throws.

## Test evidence
- `NODE_OPTIONS=--max-old-space-size=1536 yarn jest test/storefront-public.controller.spec.ts test/rate-limit.spec.ts --runInBand --verbose` passed with:
  - Test Suites: 2 passed, 2 total
  - Tests: 77 passed, 77 total
  - Snapshots: 0 total
- Relevant passing test names include:
  - `SAME token + SAME IP: allows 20, rejects the 21st (NOT the 4th)`
  - `DISTINCT tokens + SAME IP: rejects at the 121st (IP-wide layer), NOT the 4th`
  - `returns a non-blocking record (allow) when the backend increment throws`
  - `never throws even if the metric sink itself throws (fail-open is absolute)`

## 50-failures checklist — security #1-13 and infra #48-50
| Item | Result | Notes |
|---|---|---|
| #1 | Pass | No new hardcoded secrets or credentials. The diff adds throttle names, comments, route limits, and tests only; Redis URL remains env-driven and no raw Redis URL is introduced. |
| #2 | N/A / no regression | No database schema, RLS, tenant-scope, or query authorization change. |
| #3 | Pass | No raw SQL or query construction added. |
| #4 | Pass | No HTML rendering, template interpolation, or XSS-relevant output added. |
| #5 | N/A / no regression | No object lookup or authorization-scope change; storefront token service lookup behavior is unchanged. |
| #6 | Pass | Token format validation remains through `ShareTokenPipe`; the added tracker defensively handles missing/array-valued proxy headers and falls back to `unknown` rather than throwing. |
| #7 | Pass | No sensitive data exposure added; fail-open logging omits raw throttle keys and only includes throttler name plus error message. |
| #8 | Pass | `:token` validation still runs before service access; new throttle tracker tolerates malformed/missing request header shapes without bypass-by-throw. |
| #9 | N/A / no regression | Route remains intentionally `@Public()`; no role/guard weakening beyond the existing public storefront design. |
| #10 | N/A / no regression | Dependency/secret-scan CI posture unchanged by these three H4 files. |
| #11 | N/A / no regression | Headers/CORS/security middleware unchanged. |
| #12 | Pass | No unsafe deserialization, file handling, shell execution, or external fetch path added. |
| #13 | N/A / no regression | No CORS/CSP/public-host policy change. |
| #48 | Pass | Branch/diff hygiene now passes: `git diff origin/main..5a0aa376 --name-only` shows only the three parent-authorized H4 files. |
| #49 | Pass | Redis-down infrastructure degradation fails open with warning/metric/counter instead of propagating 5xx. |
| #50 | Pass | Focused typecheck, targeted lint, and focused Jest gate pass at the pinned SHA. |

## Verdict
R4 is CLEAN. The R3-only P2 write-set boundary issue is closed by the rebase-only update, the R2 functional fixes are preserved byte-for-byte in the three H4 files, the real-guard throttle isolation and Redis-down fail-open tests pass, and no P0/P1/P2/P3 findings remain.
