# H4 Split Lens B R3 Live Audit - PR 465

STATUS: PASS 2 COMPLETE

## BUILD MATRIX (R124)
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: becbe6880350753e144210320d8f0ce3ddaa6e67
- branch: wave-h4d-provider-wiring
- commits since main: 3, all Bradley Gleave <bradley@bradleytgpcoaching.com>
- net prod LOC: 0
- net test LOC: 2036
- test:src ratio: n/a, test-only scanner surface
- snapshots: refs/heads/wip/h4d-provider-wiring-fixer-r2-final-20260619 -> becbe6880350753e144210320d8f0ce3ddaa6e67
- CI at audit time: 10/10 success
- R3 identity: pending branch-history sweep
- timestamp UTC: 2026-06-19T18:33:45Z

## R2 FINDINGS CLOSURE STATUS
| ID | Status | Evidence |
|---|---|---|
| F001 | Pending | To be re-derived from source. |
| F002 | Pending | To be re-derived from source. |
| F003 | Pending | To be re-derived from source. |
| F004 | Pending | To be re-derived from source. |

## R3 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| F001 | P2 | R30/R31/R40 | test/prod-readiness/provider-wiring.ts:183-202,205-218 | The service-role key validator accepts any decoded token payload with a non-empty `iss` or `ref`, even when `role` is absent or not `service_role`. Independent probes built valid three-segment tokens with only `iss` or only `ref`; both were classified WIRED in the service-role slot, so an anon or otherwise non-service token can false-clean readiness. | Require `role === "service_role"` for this slot, or require a stronger offline claim set that cannot be satisfied by anon/user tokens; add regression tests for `anon`, `authenticated`, `iss`-only, and `ref`-only payloads. |
| F002 | P2 | R31/R59/R73 | test/prod-readiness/provider-wiring.ts:411-445 | Credential file evidence uses `lstatSync` and rejects every symlink before checking the target. Independent probe created a symlink to a readable regular token file and observed `AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS=false` with AWS classified STUB, which breaks common projected-token deployments that expose credential files through symlinked paths. | Use `statSync` after an optional `lstatSync` guard, accept symlinks whose resolved target is a readable regular file, and keep directories/FIFOs/devices rejected; add symlink-to-file and symlink-to-directory regression tests. |
| 1 | validator/service token | JWT payload has only `iss` | service-role slot should not wire without service role evidence | classified WIRED | FAIL |
| 2 | validator/service token | JWT payload has only `ref` | service-role slot should not wire without service role evidence | classified WIRED | FAIL |
| 3 | file evidence | token path is symlink to readable file | evidence true and provider WIRED | evidence false, provider STUB | FAIL |
| F001 | P2 | R30/R31/R40 | test/prod-readiness/provider-wiring.ts:183-202,205-218 | The service-role key validator accepts any decoded token payload with a non-empty `iss` or `ref`, even when `role` is absent or not `service_role`. Independent probes built valid three-segment tokens with only `iss` or only `ref`; both were classified WIRED in the service-role slot, so an anon or otherwise non-service token can false-clean readiness. | Require `role === "service_role"` for this slot, or require a stronger offline claim set that cannot be satisfied by anon/user tokens; add regression tests for `anon`, `authenticated`, `iss`-only, and `ref`-only payloads. |
| F002 | P2 | R31/R59/R73 | test/prod-readiness/provider-wiring.ts:411-445 | Credential file evidence uses `lstatSync` and rejects every symlink before checking the target. Independent probe created a symlink to a readable regular token file and observed `AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS=false` with AWS classified STUB, which breaks common projected-token deployments that expose credential files through symlinked paths. | Use `statSync` after an optional `lstatSync` guard, accept symlinks whose resolved target is a readable regular file, and keep directories/FIFOs/devices rejected; add symlink-to-file and symlink-to-directory regression tests. |
| 1 | validator/service token | JWT payload has only `iss` | service-role slot should not wire without service role evidence | classified WIRED | FAIL |
| 2 | validator/service token | JWT payload has only `ref` | service-role slot should not wire without service role evidence | classified WIRED | FAIL |
| 3 | file evidence | token path is symlink to readable file | evidence true and provider WIRED | evidence false, provider STUB | FAIL |
| F003 | P3 | R40/R80/R117 | test/prod-readiness/provider-wiring.ts:498-509 | `extractModuleSpecifiers` records `ImportDeclaration` and `ExportDeclaration` module specifiers without checking `importClause.isTypeOnly` or `isTypeOnly` on type-only re-exports. Independent probes for `import type { Stripe } from "stripe"` and `export type { Stripe } from "stripe"` both returned `stripe`, so erased type references can be treated as runtime provider wiring. | Skip type-only imports and re-exports in the runtime package scanner, or split type evidence from runtime evidence; add tests for `import type`, `export type`, side-effect imports, and runtime re-exports. |
| 4 | import scanner | type-only import | `import type { Stripe } from "stripe"` | runtime package set empty | returned `stripe` | FAIL |
| 5 | import scanner | type-only re-export | `export type { Stripe } from "stripe"` | runtime package set empty | returned `stripe` | FAIL |

## DOCTRINE RULE COVERAGE (R1-R126)
Pending full table after both passes.

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F003 | P3 | R40/R80/R117 | test/prod-readiness/provider-wiring.ts:498-509 | `extractModuleSpecifiers` records `ImportDeclaration` and `ExportDeclaration` module specifiers without checking `importClause.isTypeOnly` or `isTypeOnly` on type-only re-exports. Independent probes for `import type { Stripe } from "stripe"` and `export type { Stripe } from "stripe"` both returned `stripe`, so erased type references can be treated as runtime provider wiring. | Skip type-only imports and re-exports in the runtime package scanner, or split type evidence from runtime evidence; add tests for `import type`, `export type`, side-effect imports, and runtime re-exports. |

## VERDICT
Pending.
