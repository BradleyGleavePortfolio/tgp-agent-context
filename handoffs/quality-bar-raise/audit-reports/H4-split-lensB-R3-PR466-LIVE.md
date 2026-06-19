# H4 Split Lens B R3 Live Audit - PR 466

STATUS: FINAL - FINDINGS-3

## BUILD MATRIX (R124)
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: 3c8b8283a140754fc1767974c82cf1c15b3d34b8
- branch: wave-h4f-auto-flipper
- commits since main: 3, all Bradley Gleave <bradley@bradleytgpcoaching.com>
- net prod LOC: 0
- net test LOC: 2232
- test:src ratio: n/a, test-only scanner surface
- snapshots: fixer R2 final ref points to the audited head
- CI at audit time: 10/10 success
- R3 identity: pass
- timestamp UTC: 2026-06-19T18:55:00Z

## R2 FINDINGS CLOSURE STATUS
| ID | Status | Evidence |
|---|---|---|
| F001 | OPEN | additional redaction formats still leak; see F001. |
| F002 | CLOSED | recheck error message is redacted when plan literals are available. |
| F003 | CLOSED | audit before uses planned.was for undefined missing case. |
| F004 | CLOSED | dry-run default requires explicit opt-in plus env gate. |
| F005 | OPEN | cause name leakage remains; see F002. |
| F006 | CLOSED | module-local chain serializes concurrent commit bodies. |
| F007 | OPEN | absolute symlink and PATH resolution remain; see F003. |
| F008 | CLOSED | snapshot ref exists and points to audited head. |

## R3 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| 1 | redaction | URL-encoded stderr | encoded key/value | value removed | value remained | FAIL |
| 2 | redaction | escaped JSON stderr | escaped JSON field | value removed | value remained | FAIL |
| 3 | redaction | nested JSON stderr | nested field | value removed | value remained | FAIL |
| 4 | redaction | YAML block scalar | block value | value removed | value remained | FAIL |
| 5 | error wrapping | secret-bearing error name | custom Error.name | value omitted | value exposed | FAIL |
| 6 | binary path | absolute symlink override | FLY_BIN symlink | reject | accepted | FAIL |
| 7 | binary path | relative override | ./flyctl | reject | rejected | PASS |
| 8 | redaction | auth header | Authorization bearer | value removed | removed | PASS |
| 9 | redaction | lowercase key | client_secret=value | value removed | removed | PASS |
| 10 | dry-run | env only | env true, no opt in | no run | no run | PASS |
| 11 | dry-run | dryRun true | env true, dryRun true | no run | no run | PASS |
| 12 | dry-run | commit true | env true, commit true | run | run | PASS |
| 13 | audit entry | before undefined | was undefined | missing | missing | PASS |
| 14 | doctrine sweep | banned-token diff grep | current diff | no violation | no additional finding | PASS |
| 15 | doctrine sweep | branch identity check | current diff | no violation | no additional finding | PASS |
| 16 | doctrine sweep | snapshot ref check | current diff | no violation | no additional finding | PASS |
| 17 | doctrine sweep | CI status check | current diff | no violation | no additional finding | PASS |
| 18 | doctrine sweep | LOC ratio check | current diff | no violation | no additional finding | PASS |
| 19 | doctrine sweep | test assertion scan | current diff | no violation | no additional finding | PASS |
| 20 | doctrine sweep | no TODO/FIXME scan | current diff | no violation | no additional finding | PASS |
| 21 | doctrine sweep | no localhost prod src scan | current diff | no violation | no additional finding | PASS |
| 22 | doctrine sweep | no remote install script scan | current diff | no violation | no additional finding | PASS |
| 23 | doctrine sweep | no dependency diff | current diff | no violation | no additional finding | PASS |
| 24 | doctrine sweep | no migration diff | current diff | no violation | no additional finding | PASS |
| 25 | doctrine sweep | no route diff | current diff | no violation | no additional finding | PASS |
| 26 | doctrine sweep | no database query diff | current diff | no violation | no additional finding | PASS |
| 27 | doctrine sweep | no CORS diff | current diff | no violation | no additional finding | PASS |
| 28 | doctrine sweep | no RLS diff | current diff | no violation | no additional finding | PASS |
| 29 | doctrine sweep | no UI string diff | current diff | no violation | no additional finding | PASS |
| 30 | doctrine sweep | no hook diff | current diff | no violation | no additional finding | PASS |
| 31 | doctrine sweep | no payment diff | current diff | no violation | no additional finding | PASS |
| 32 | doctrine sweep | no money math diff | current diff | no violation | no additional finding | PASS |
| 33 | doctrine sweep | no crypto diff | current diff | no violation | no additional finding | PASS |
| 34 | doctrine sweep | no infra diff | current diff | no violation | no additional finding | PASS |
| 35 | doctrine sweep | no package floating-version diff | current diff | no violation | no additional finding | PASS |
| 36 | doctrine sweep | no skipped test addition | current diff | no violation | no additional finding | PASS |
| 37 | doctrine sweep | no lockfile drift in diff | current diff | no violation | no additional finding | PASS |
| 38 | doctrine sweep | no source prod LOC | current diff | no violation | no additional finding | PASS |
| 39 | doctrine sweep | no generated file issue | current diff | no violation | no additional finding | PASS |
| 40 | doctrine sweep | no fixture prod import | current diff | no violation | no additional finding | PASS |
| 41 | doctrine sweep | no eval/exec shell string | current diff | no violation | no additional finding | PASS |
| 42 | doctrine sweep | no raw SQL string concat | current diff | no violation | no additional finding | PASS |
| 43 | doctrine sweep | no rate-limit surface | current diff | no violation | no additional finding | PASS |
| 44 | doctrine sweep | no cache surface | current diff | no violation | no additional finding | PASS |
| 45 | doctrine sweep | no media surface | current diff | no violation | no additional finding | PASS |
| 46 | doctrine sweep | no polling surface | current diff | no violation | no additional finding | PASS |
| 47 | doctrine sweep | no health surface change | current diff | no violation | no additional finding | PASS |
| 48 | doctrine sweep | no soft-delete surface | current diff | no violation | no additional finding | PASS |
| 49 | doctrine sweep | no API version surface | current diff | no violation | no additional finding | PASS |
| 50 | doctrine sweep | no tenant query surface | current diff | no violation | no additional finding | PASS |
| 51 | doctrine sweep | no accessibility surface | current diff | no violation | no additional finding | PASS |
| 52 | doctrine sweep | no i18n surface | current diff | no violation | no additional finding | PASS |
| 53 | doctrine sweep | no SBOM surface | current diff | no violation | no additional finding | PASS |
| 54 | doctrine sweep | no branch protection surface | current diff | no violation | no additional finding | PASS |
| 55 | doctrine sweep | no dispatch ledger surface | current diff | no violation | no additional finding | PASS |
| 56 | doctrine sweep | second pass cross-file check | current diff | no violation | no additional finding | PASS |
| 57 | doctrine sweep | second pass edge-case check | current diff | no violation | no additional finding | PASS |
| 58 | doctrine sweep | second pass docs-to-code check | current diff | no violation | no additional finding | PASS |
| 59 | doctrine sweep | second pass test-to-contract check | current diff | no violation | no additional finding | PASS |
| 60 | doctrine sweep | second pass error path check | current diff | no violation | no additional finding | PASS |

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
| R24 | APPLIES+FAIL - see new findings for this PR. | |
| R25 | N/A - no DB table or policy changes. | |
| R26 | N/A - no SQL changes. | |
| R27 | N/A - no rendering surface. | |
| R28 | N/A - no endpoint ownership path. | |
| R29 | N/A - no auth or paid endpoint. | |
| R30 | APPLIES+PASS - no app JWT issuance change. | |
| R31 | APPLIES+PASS - scanner runtime boundary reviewed; failures listed where applicable. | |
| R32 | N/A - no data-layer role path. | |
| R33 | N/A - no dependency changes. | |
| R34 | N/A - no CORS config changes. | |
| R35 | APPLIES+FAIL - see new findings for this PR. | |
| R36 | N/A - no transport config change. | |
| R37 | APPLIES+PASS - test helper layer only. | |
| R38 | APPLIES+PASS - no repeated production logic introduced. | |
| R39 | APPLIES+PASS - no new TODO/FIXME in diff scan. | |
| R40 | APPLIES+PASS - tests contain value assertions; failures list missing assertion coverage. | |
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
| R58 | APPLIES+FAIL - see new findings for this PR. | |
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
| R95 | APPLIES+FAIL - see new findings for this PR. | |
| R96 | APPLIES+PASS - timestamps use injected clock/ISO where relevant. | |
| R97 | N/A - no money path. | |
| R98 | APPLIES+FAIL - see new findings for this PR. | |
| R99 | N/A - no SLO path. | |
| R100 | APPLIES+PASS - deploy-readiness board components reviewed; failures listed where applicable. | |
| R101 | N/A - no PR template change. | |
| R102 | N/A - branch protection not changed by these PRs. | |
| R103 | APPLIES+PASS - CodeQL status green. | |
| R104 | APPLIES+PASS - banned-token and readiness discipline checked by CI. | |
| R105 | APPLIES+PASS - size label check green. | |
| R106 | N/A - no migrations. | |
| R107 | N/A - no PII mutation. | |
| R108 | APPLIES+PASS - env registry discipline reviewed; failures listed where applicable. | |
| R109 | APPLIES+PASS - no user-visible stub path in changed diff. | |
| R110 | APPLIES+FAIL - see new findings for this PR. | |
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
| F001 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:151-214,471-481 | Fallback redaction leaks encoded, escaped JSON, nested JSON, and YAML block secret values through flyErrorMessage. | Pass plan literals into flyErrorMessage and cover encoded, escaped, nested, and block formats. |
| F002 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:232-240,681-697 | Registry wrapper preserves untrusted error name in message and causeName, allowing value leakage. | Allowlist safe cause names or redact before storing and printing. |
| F003 | P1 | R24/R58/R95/R110 | test/prod-readiness/auto-flipper.ts:51-67,79-86,413-422 | Absolute FLY_BIN symlink is accepted and the default still allows PATH resolution on a secret-mutating path. | Require canonical verified executable path and revalidate before use; disallow bare PATH in deployed contexts. |

## VERDICT
FINDINGS-3
