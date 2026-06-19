# H4 Split Lens B R3 Live Audit - PR 464

STATUS: FINAL - FINDINGS-2

## BUILD MATRIX (R124)
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: af4f8ea87730bab68721e05044315391976b1804
- branch: wave-h4b-env-discovery
- commits since main: 3, all Bradley Gleave <bradley@bradleytgpcoaching.com>
- net prod LOC: 0
- net test LOC: 1704
- test:src ratio: n/a, test-only scanner surface
- snapshots: fixer R2 final ref points to the audited head
- CI at audit time: 10/10 success
- R3 identity: pass
- timestamp UTC: 2026-06-19T18:55:00Z

## R2 FINDINGS CLOSURE STATUS
| ID | Status | Evidence |
|---|---|---|
| F001 | CLOSED | let/var alias probes skipped mutable values. |
| F002 | CLOSED | wrapper probes for parenthesized, non-null, assertion, and satisfies forms passed. |
| F003 | CLOSED | as const literal probe passed. |
| F004 | CLOSED | snapshot ref exists and points to audited head. |

## R3 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| 1 | AST/env discovery | destructured literal computed key | const destructure with string key | switch found | empty set | FAIL |
| 2 | AST/env discovery | destructured const computed key | const-backed destructure key | switch found | empty set | FAIL |
| 3 | AST/env discovery | function-local const shadowing | outer key then inner same-name key | outer and inner separated | inner value reused | FAIL |
| 4 | AST/env discovery | block-local const shadowing | block same-name key then outer use | outer and block separated | block value reused | FAIL |
| 5 | AST/env discovery | let alias mutation | let K changes before use | skip static value | skipped | PASS |
| 6 | AST/env discovery | var alias mutation | var K changes before use | skip static value | skipped | PASS |
| 7 | AST/env discovery | plain const alias | const K string then process.env[K] | found | found | PASS |
| 8 | AST/env discovery | as const alias | const K = string as const | found | found | PASS |
| 9 | AST/env discovery | parenthesized process.env | (process.env).FOO | found | found | PASS |
| 10 | AST/env discovery | non-null wrapper | process.env!.FOO | found | found | PASS |
| 11 | AST/env discovery | type assertion wrapper | (process.env as any).FOO | found | found | PASS |
| 12 | AST/env discovery | satisfies wrapper | process.env satisfies shape | found | found | PASS |
| 13 | AST/env discovery | optional bracket | process.env?.["FOO"] | found | found | PASS |
| 14 | AST/env discovery | template with expression | process.env[`FOO_${x}`] | skip | skipped | PASS |
| 15 | AST/env discovery | no-substitution template | process.env[`FOO`] | found | found | PASS |
| 16 | doctrine sweep | banned-token diff grep | current diff | no violation | no additional finding | PASS |
| 17 | doctrine sweep | branch identity check | current diff | no violation | no additional finding | PASS |
| 18 | doctrine sweep | snapshot ref check | current diff | no violation | no additional finding | PASS |
| 19 | doctrine sweep | CI status check | current diff | no violation | no additional finding | PASS |
| 20 | doctrine sweep | LOC ratio check | current diff | no violation | no additional finding | PASS |
| 21 | doctrine sweep | test assertion scan | current diff | no violation | no additional finding | PASS |
| 22 | doctrine sweep | no TODO/FIXME scan | current diff | no violation | no additional finding | PASS |
| 23 | doctrine sweep | no localhost prod src scan | current diff | no violation | no additional finding | PASS |
| 24 | doctrine sweep | no remote install script scan | current diff | no violation | no additional finding | PASS |
| 25 | doctrine sweep | no dependency diff | current diff | no violation | no additional finding | PASS |
| 26 | doctrine sweep | no migration diff | current diff | no violation | no additional finding | PASS |
| 27 | doctrine sweep | no route diff | current diff | no violation | no additional finding | PASS |
| 28 | doctrine sweep | no database query diff | current diff | no violation | no additional finding | PASS |
| 29 | doctrine sweep | no CORS diff | current diff | no violation | no additional finding | PASS |
| 30 | doctrine sweep | no RLS diff | current diff | no violation | no additional finding | PASS |
| 31 | doctrine sweep | no UI string diff | current diff | no violation | no additional finding | PASS |
| 32 | doctrine sweep | no hook diff | current diff | no violation | no additional finding | PASS |
| 33 | doctrine sweep | no payment diff | current diff | no violation | no additional finding | PASS |
| 34 | doctrine sweep | no money math diff | current diff | no violation | no additional finding | PASS |
| 35 | doctrine sweep | no crypto diff | current diff | no violation | no additional finding | PASS |
| 36 | doctrine sweep | no infra diff | current diff | no violation | no additional finding | PASS |
| 37 | doctrine sweep | no package floating-version diff | current diff | no violation | no additional finding | PASS |
| 38 | doctrine sweep | no skipped test addition | current diff | no violation | no additional finding | PASS |
| 39 | doctrine sweep | no lockfile drift in diff | current diff | no violation | no additional finding | PASS |
| 40 | doctrine sweep | no source prod LOC | current diff | no violation | no additional finding | PASS |
| 41 | doctrine sweep | no generated file issue | current diff | no violation | no additional finding | PASS |
| 42 | doctrine sweep | no fixture prod import | current diff | no violation | no additional finding | PASS |
| 43 | doctrine sweep | no eval/exec shell string | current diff | no violation | no additional finding | PASS |
| 44 | doctrine sweep | no raw SQL string concat | current diff | no violation | no additional finding | PASS |
| 45 | doctrine sweep | no rate-limit surface | current diff | no violation | no additional finding | PASS |
| 46 | doctrine sweep | no cache surface | current diff | no violation | no additional finding | PASS |
| 47 | doctrine sweep | no media surface | current diff | no violation | no additional finding | PASS |
| 48 | doctrine sweep | no polling surface | current diff | no violation | no additional finding | PASS |
| 49 | doctrine sweep | no health surface change | current diff | no violation | no additional finding | PASS |
| 50 | doctrine sweep | no soft-delete surface | current diff | no violation | no additional finding | PASS |
| 51 | doctrine sweep | no API version surface | current diff | no violation | no additional finding | PASS |
| 52 | doctrine sweep | no tenant query surface | current diff | no violation | no additional finding | PASS |
| 53 | doctrine sweep | no accessibility surface | current diff | no violation | no additional finding | PASS |
| 54 | doctrine sweep | no i18n surface | current diff | no violation | no additional finding | PASS |
| 55 | doctrine sweep | no SBOM surface | current diff | no violation | no additional finding | PASS |
| 56 | doctrine sweep | no branch protection surface | current diff | no violation | no additional finding | PASS |
| 57 | doctrine sweep | no dispatch ledger surface | current diff | no violation | no additional finding | PASS |
| 58 | doctrine sweep | second pass cross-file check | current diff | no violation | no additional finding | PASS |
| 59 | doctrine sweep | second pass edge-case check | current diff | no violation | no additional finding | PASS |
| 60 | doctrine sweep | second pass docs-to-code check | current diff | no violation | no additional finding | PASS |

## DOCTRINE RULE COVERAGE (R1-R126)
| Rule | Status | Evidence / reason |
|---|---|---|
| R1 | APPLIES+FAIL - see new findings for this PR. | |
| R2 | APPLIES+FAIL - see new findings for this PR. | |
| R3 | APPLIES+PASS - branch commits and report commits use Bradley identity. | |
| R4 | APPLIES+PASS - live report checkpoints pushed. | |
| R5 | APPLIES+PASS - report artifacts mirrored. | |
| R6 | APPLIES+PASS - foreground checkpoint pushes used. | |
| R7 | N/A - no child lane monitoring in this audit. | |
| R8 | N/A - no stranded lane found in audited diff. | |
| R9 | APPLIES+PASS - no production merge or irreversible action. | |
| R10 | APPLIES+PASS - full diff plus second pass completed. | |
| R11 | APPLIES+PASS - claims re-derived from source and probes. | |
| R12 | N/A - brief was usable after rule read. | |
| R13 | N/A - user specifically required live-push protocol. | |
| R14 | APPLIES+FAIL - see new findings for this PR. | |
| R15 | APPLIES+PASS - dual-lens compatible report shape used. | |
| R16 | APPLIES+PASS - final response contains verdict line. | |
| R17 | N/A - no dependency-bump plan. | |
| R18 | APPLIES+PASS - audited changed files only. | |
| R19 | N/A - no pre-existing test failure claimed. | |
| R20 | N/A - no descoped follow-up accepted. | |
| R21 | N/A - no telemetry event changes. | |
| R22 | APPLIES+PASS - CI pin/doctrine checks green at audit time. | |
| R23 | APPLIES+PASS - prod LOC is 0. | |
| R24 | APPLIES+PASS - no source secret introduced by diff scan. | |
| R25 | N/A - no DB table or policy changes. | |
| R26 | N/A - no SQL changes. | |
| R27 | N/A - no rendering surface. | |
| R28 | N/A - no endpoint ownership path. | |
| R29 | N/A - no auth or paid endpoint. | |
| R30 | APPLIES+PASS - no app JWT issuance change. | |
| R31 | APPLIES+FAIL - see new findings for this PR. | |
| R32 | N/A - no data-layer role path. | |
| R33 | N/A - no dependency changes. | |
| R34 | N/A - no CORS config changes. | |
| R35 | APPLIES+PASS - no production client error filter change; failures listed where applicable. | |
| R36 | N/A - no transport config change. | |
| R37 | APPLIES+PASS - test helper layer only. | |
| R38 | APPLIES+PASS - no repeated production logic introduced. | |
| R39 | APPLIES+PASS - no new TODO/FIXME in diff scan. | |
| R40 | APPLIES+FAIL - see new findings for this PR. | |
| R41 | APPLIES+PASS - env registry/readiness surface reviewed. | |
| R42 | N/A - no public route. | |
| R43 | APPLIES+PASS - no src import cycle surface. | |
| R44 | N/A - no DB query loops. | |
| R45 | N/A - no migration/index change. | |
| R46 | N/A - no list endpoint. | |
| R47 | APPLIES+PASS - sync file work is test CLI scanner only. | |
| R48 | N/A - no cache path. | |
| R49 | N/A - no media path. | |
| R50 | N/A - no realtime path. | |
| R51 | APPLIES+PASS - concurrency reviewed where present. | |
| R52 | N/A - no payment side effect. | |
| R53 | N/A - no UI update. | |
| R54 | N/A - no React hook. | |
| R55 | N/A - no subscription effect. | |
| R56 | N/A - no UI/service exception boundary change. | |
| R57 | APPLIES+PASS - no production console logging added; CLI warnings reviewed. | |
| R58 | APPLIES+PASS - external call timeout reviewed where present. | |
| R59 | APPLIES+PASS - catch paths reviewed; failures listed where applicable. | |
| R60 | N/A - no health endpoint change. | |
| R61 | APPLIES+PASS - comments document invariants. | |
| R62 | APPLIES+PASS - no needless framework pattern found. | |
| R63 | APPLIES+PASS - duplicate-bug scan performed. | |
| R64 | APPLIES+PASS - hand-rolled parsers reviewed; failures listed where applicable. | |
| R65 | APPLIES+PASS - no impossible-edge bloat finding. | |
| R66 | APPLIES+PASS - no dead-code finding in changed files. | |
| R67 | N/A - no multi-table write. | |
| R68 | N/A - no delete path. | |
| R69 | N/A - no schema constraints. | |
| R70 | N/A - operator runbook outside this PR. | |
| R71 | APPLIES+PASS - required PR checks green. | |
| R72 | APPLIES+PASS - changed files are test/readiness surfaces. | |
| R73 | APPLIES+PASS - integration degradation reviewed; failures listed where applicable. | |
| R74 | APPLIES+PASS - prod LOC 0, test-only addition. | |
| R75 | APPLIES+PASS - banned-token diff grep returned empty. | |
| R76 | APPLIES+PASS - prod LOC 0. | |
| R77 | APPLIES+PASS - current PR checks green; broader 14-day metric out of scope. | |
| R78 | APPLIES+PASS - final verdict present. | |
| R79 | APPLIES+PASS - 50-failure categories swept. | |
| R80 | APPLIES+PASS - contracts reviewed; failures listed where applicable. | |
| R81 | N/A - no package/public version change. | |
| R82 | N/A - no migration. | |
| R83 | APPLIES+PASS - readiness switch behavior reviewed. | |
| R84 | N/A - no telemetry taxonomy change. | |
| R85 | N/A - no endpoint telemetry. | |
| R86 | N/A - no user-facing path. | |
| R87 | N/A - no UI surface. | |
| R88 | N/A - no user-facing strings. | |
| R89 | N/A - no frontend bundle. | |
| R90 | N/A - no mutation endpoint. | |
| R91 | N/A - no public endpoint. | |
| R92 | N/A - no tenant query. | |
| R93 | N/A - no stable API change. | |
| R94 | N/A - no dependency ownership change. | |
| R95 | APPLIES+PASS - no remote install script; binary path risk listed where applicable. | |
| R96 | APPLIES+PASS - timestamps use injected clock/ISO where relevant. | |
| R97 | N/A - no money path. | |
| R98 | APPLIES+PASS - redaction/PII reviewed; failures listed where applicable. | |
| R99 | N/A - no SLO path. | |
| R100 | APPLIES+PASS - deploy-readiness board components reviewed; failures listed where applicable. | |
| R101 | N/A - no PR template change. | |
| R102 | N/A - branch protection not changed by these PRs. | |
| R103 | APPLIES+PASS - CodeQL status green. | |
| R104 | APPLIES+PASS - banned-token and readiness discipline checked by CI. | |
| R105 | APPLIES+PASS - size label check green. | |
| R106 | N/A - no migrations. | |
| R107 | N/A - no PII mutation. | |
| R108 | APPLIES+FAIL - see new findings for this PR. | |
| R109 | APPLIES+PASS - no user-visible stub path in changed diff. | |
| R110 | APPLIES+PASS - secret leak scans performed; failures listed where applicable. | |
| R111 | APPLIES+PASS - CI build/type checks green. | |
| R112 | APPLIES+PASS - banned cast grep empty. | |
| R113 | N/A - no dependency diff. | |
| R114 | N/A - no dependency version diff. | |
| R115 | N/A - no SBOM workflow change. | |
| R116 | APPLIES+PASS - test-only diff with focused assertions. | |
| R117 | APPLIES+PASS - new tests include expects; missing coverage listed where applicable. | |
| R118 | APPLIES+PASS - CodeQL status green. | |
| R119 | N/A - no crypto primitive change. | |
| R120 | N/A - no infra-as-code change. | |
| R121 | N/A - no artifact build metadata change. | |
| R122 | N/A - branch protection not changed. | |
| R123 | APPLIES+PASS - no fresh skipped tests found in changed files. | |
| R124 | APPLIES+PASS - exact SHAs recorded. | |
| R125 | APPLIES+PASS - rule coverage table included. | |
| R126 | N/A - dispatch ledger outside audited repo diff. | |

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P2 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:265-269 | Destructuring from process.env only records identifier property names; literal and const-backed computed destructuring keys were skipped by probes. | Handle ComputedPropertyName with literal and const-backed keys; add tests. |
| F002 | P2 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:297-314 | File-wide const map lets inner same-name const bindings shadow outer uses; probes returned BAR where FOO was expected. | Track lexical scopes or skip ambiguous duplicate bindings; add function/block shadowing tests. |

## VERDICT
FINDINGS-2
