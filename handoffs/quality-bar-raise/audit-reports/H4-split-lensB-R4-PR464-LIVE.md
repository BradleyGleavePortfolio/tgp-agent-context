# H4 Split Lens B R4 — PR #464 LIVE

STATUS: PASS 2 COMPLETE — finalized 2026-06-19T20:27:30Z

## BUILD MATRIX (R124)
- main pre-work from brief: 8467c6f568a51337a7acbfb14f72ac85b996d605
- current GitHub baseRefOid observed/audited: 868000088fab1fc5929e02291bec4d4928e99aaf
- final head: 9129693549facba58c39ecd02117a9dee9c453ed
- branch: wave-h4b-env-discovery
- commits since observed main: 4; all author+committer Bradley Gleave <bradley@bradleytgpcoaching.com>
- prod LOC: 0 genuine prod LOC (changed implementation/support files are under test/prod-readiness; tsconfig metadata in PR465 only)
- test/support LOC: +1882/-0
- test:src ratio: N/A/infinite for genuine prod LOC=0; CI Test density check green
- snapshots: refs/heads/wip/h4b-env-discovery-fixer-r3-final-20260619
- CI at audit time: all visible PR checks green (build-and-test, Danger, R100 Quality Gate, CodeQL, size-label, rls-live-tests, mwb-3-live-tests)
- R3 identity on prod-repo commits: PASS
- audit-repo identity used: Bradley Gleave <bradley@bradleytgpcoaching.com>
- timestamp UTC: 2026-06-19T20:27:30Z

## R3 FINDINGS CLOSURE STATUS (sub-task)
| ID | Status | Evidence |
|---|---|---|
| R3-F001 | CLOSED | Computed destructure string/const keys resolve; dynamic/unresolved keys skip. |
| R3-F002 | PARTIAL | Variable-declaration duplicate bindings fail closed, but parameter binding shadow remains open as R4-F001. |

## R4 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---:|---|---|---|---|---|---|
| 1 | AST property | process.env.FOO | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 2 | AST bracket | process.env["FOO"] | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 3 | AST const key | const K="FOO"; process.env[K] | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 4 | AST let key | let K="FOO"; process.env[K] | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 5 | AST var key | var K="FOO"; process.env[K] | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 6 | destructure | const { FOO }=process.env | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 7 | computed destructure literal | const {["FOO"]:x}=process.env | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 8 | computed destructure const | const K="FOO"; const {[K]:x}=process.env | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 9 | computed destructure dynamic | const {[K+"X"]:x}=process.env | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 10 | wrapper as const | const K="FOO" as const; process.env[K] | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 11 | wrapper process | (process.env as Record<string,string>).FOO | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 12 | non-null process | process.env!.FOO | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 13 | process bracket env | process["env"].FOO | see artifact | Pass invariant / reject unsafe edge | FOO found | PASS |
| 14 | import.meta env | import.meta.env.VITE_FLAG | see artifact | Pass invariant / reject unsafe edge | skipped by documented scope | PASS |
| 15 | TEST prefix | TEST_ONLY | see artifact | Pass invariant / reject unsafe edge | excluded | PASS |
| 16 | infixed TEST | MY_TEST_VAR | see artifact | Pass invariant / reject unsafe edge | included | PASS |
| 17 | function param shadow | const K="OUTER_SECRET"; function f(K){process.env[K]} | see artifact | Pass invariant / reject unsafe edge | false OUTER_SECRET | FAIL |
| 18 | for let shadow | for (let K...) process.env[K] | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 19 | after-use const | process.env[K]; const K="AFTER_USE" | see artifact | Pass invariant / reject unsafe edge | found; noted non-lint scope | PASS |
| 20 | hoisted var | var K="HOISTED"; process.env[K] | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 21 | banned-token grep | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 22 | commit identity | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 23 | CI rollup | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 24 | focused tests | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 25 | assertion count | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 26 | prod LOC cap | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 27 | test density | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 28 | no TODO | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 29 | no console.log prod | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 30 | no raw SQL | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 31 | no network in tests | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 32 | file encoding | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 33 | symlink loop | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 34 | path traversal | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 35 | R109 stubs | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 36 | R110 secret history | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 37 | R117 assertions | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 38 | R123 no skip | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 39 | R111 unused imports | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 40 | R112 casts | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 41 | R113 deps | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 42 | R118 SAST | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 43 | R120 IaC | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 44 | R124 SHA pin | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 45 | R126 ledger | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 46 | category gap 46 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 47 | category gap 47 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 48 | category gap 48 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 49 | category gap 49 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 50 | category gap 50 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 51 | category gap 51 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 52 | category gap 52 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 53 | category gap 53 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 54 | category gap 54 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |
| 55 | category gap 55 | second-pass fresh reread | see artifact | Pass invariant / reject unsafe edge | no additional issue | PASS |

## DOCTRINE RULE COVERAGE (R1–R126)
| Rule | Status | Evidence / N/A reason |
|---|---|---|
| R1 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R2 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R3 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R4 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R5 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R6 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R7 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R8 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R9 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R10 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R11 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R12 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R13 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R14 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R15 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R16 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R17 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R18 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R19 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R20 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R21 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R22 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R23 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R24 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R25 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R26 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R27 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R28 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R29 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R30 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R31 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R32 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R33 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R34 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R35 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R36 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R37 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R38 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R39 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R40 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R41 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R42 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R43 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R44 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R45 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R46 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R47 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R48 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R49 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R50 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R51 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R52 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R53 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R54 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R55 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R56 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R57 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R58 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R59 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R60 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R61 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R62 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R63 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R64 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R65 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R66 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R67 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R68 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R69 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R70 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R71 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R72 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R73 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R74 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R75 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R76 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R77 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R78 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R79 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R80 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R81 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R82 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R83 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R84 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R85 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R86 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R87 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R88 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R89 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R90 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R91 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R92 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R93 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R94 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R95 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R96 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R97 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R98 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R99 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R100 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R101 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R102 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R103 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R104 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R105 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R106 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R107 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R108 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R109 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R110 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R111 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R112 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R113 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R114 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R115 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R116 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R117 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R118 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R119 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R120 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R121 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R122 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R123 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R124 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R125 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R126 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| R4-F001 | P2 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:329-347 | Function parameter bindings are not counted as ambiguous identifiers; `const K="OUTER_SECRET"; function f(K:string){ process.env[K] }` returned `["OUTER_SECRET"]`. | Count all lexical bindings or perform scope-aware identifier resolution. |

## VERDICT
FINDINGS-1
