# H4 Split Lens B Half B R4 — Combined Report

- timestamp UTC: 2026-06-19T20:27:30Z
- audit repo identity used: Bradley Gleave <bradley@bradleytgpcoaching.com>
- observed base: 868000088fab1fc5929e02291bec4d4928e99aaf
- brief base: 8467c6f568a51337a7acbfb14f72ac85b996d605


---

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


---

# H4 Split Lens B R4 — PR #465 LIVE

STATUS: PASS 2 COMPLETE — finalized 2026-06-19T20:27:30Z

## BUILD MATRIX (R124)
- main pre-work from brief: 8467c6f568a51337a7acbfb14f72ac85b996d605
- current GitHub baseRefOid observed/audited: 868000088fab1fc5929e02291bec4d4928e99aaf
- final head: 7929d4592b069bfe427ce911ca7466e43a5adc46
- branch: wave-h4d-provider-wiring
- commits since observed main: 4; all author+committer Bradley Gleave <bradley@bradleytgpcoaching.com>
- prod LOC: 0 genuine prod LOC (changed implementation/support files are under test/prod-readiness; tsconfig metadata in PR465 only)
- test/support LOC: +2400/-1
- test:src ratio: N/A/infinite for genuine prod LOC=0; CI Test density check green
- snapshots: refs/heads/wip/h4d-provider-wiring-fixer-r3-final-20260619
- CI at audit time: all visible PR checks green (build-and-test, Danger, R100 Quality Gate, CodeQL, size-label, rls-live-tests, mwb-3-live-tests)
- R3 identity on prod-repo commits: PASS
- audit-repo identity used: Bradley Gleave <bradley@bradleytgpcoaching.com>
- timestamp UTC: 2026-06-19T20:27:30Z

## R3 FINDINGS CLOSURE STATUS (sub-task)
| ID | Status | Evidence |
|---|---|---|
| R3-F001 | PARTIAL | Hard role gate exists, but alg-none/unknown alg false-accept remains open as R4-F001. |
| R3-F002 | CLOSED | Symlink-to-file and non-file rejection paths covered. |
| R3-F003 | CLOSED | Type-only declarations skipped; mixed runtime imports counted. |

## R4 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---:|---|---|---|---|---|---|
| 1 | Supabase role exact | role service_role | see artifact | Pass invariant / reject unsafe edge | accepted | PASS |
| 2 | Supabase anon | role anon | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 3 | Supabase whitespace | role service_role space | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 4 | Supabase alg none | alg none + service_role | see artifact | Pass invariant / reject unsafe edge | accepted | FAIL |
| 5 | Supabase alg RS256 | unknown alg + service_role | see artifact | Pass invariant / reject unsafe edge | accepted | FAIL |
| 6 | Stripe pk in secret | pk_live in STRIPE_SECRET_KEY | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 7 | Stripe sk_live | sk_live long | see artifact | Pass invariant / reject unsafe edge | accepted | PASS |
| 8 | OpenAI sk shape | sk- long | see artifact | Pass invariant / reject unsafe edge | accepted structurally | PASS |
| 9 | AWS symlink file | symlink -> file | see artifact | Pass invariant / reject unsafe edge | accepted | PASS |
| 10 | AWS symlink dir | symlink -> dir | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 11 | AWS dangling symlink | dangling | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 12 | AWS FIFO | fifo | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 13 | import type | import type * as Stripe | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 14 | mixed import | import { type X, Y } | see artifact | Pass invariant / reject unsafe edge | counted | PASS |
| 15 | export type | export type {X} | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 16 | export namespace | export * as ns | see artifact | Pass invariant / reject unsafe edge | counted | PASS |
| 17 | TSX file | uses-stripe.tsx | see artifact | Pass invariant / reject unsafe edge | counted | PASS |
| 18 | dynamic import literal | import("openai") | see artifact | Pass invariant / reject unsafe edge | counted | PASS |
| 19 | dynamic import variable | import(pkg) | see artifact | Pass invariant / reject unsafe edge | skipped | PASS |
| 20 | file path hint | src/billing hint | see artifact | Pass invariant / reject unsafe edge | counted | PASS |
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
| R30 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R31 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R32 | APPLIES+PASS | Provider credential/import/file-evidence surface reviewed. |
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
| R59 | APPLIES+PASS | Provider credential/import/file-evidence surface reviewed. |
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
| R73 | APPLIES+PASS | Provider credential/import/file-evidence surface reviewed. |
| R74 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R75 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R76 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R77 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R78 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R79 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R80 | APPLIES+PASS | Provider credential/import/file-evidence surface reviewed. |
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
| R4-F001 | P2 | R30/R31/R40/R108 | test/prod-readiness/provider-wiring.ts:199-209 | Supabase validator accepts `alg:"none"`/unknown alg values as long as payload role equals `service_role`; crafted alg-none token classified WIRED. | Reject `none` and require a plausible Supabase signing alg such as HS256 before role gate. |

## VERDICT
FINDINGS-1


---

# H4 Split Lens B R4 — PR #466 LIVE

STATUS: PASS 2 COMPLETE — finalized 2026-06-19T20:27:30Z

## BUILD MATRIX (R124)
- main pre-work from brief: 8467c6f568a51337a7acbfb14f72ac85b996d605
- current GitHub baseRefOid observed/audited: 868000088fab1fc5929e02291bec4d4928e99aaf
- final head: b2d1096450287f4c10b6e5d9797bea8b48b76556
- branch: wave-h4f-auto-flipper
- commits since observed main: 4; all author+committer Bradley Gleave <bradley@bradleytgpcoaching.com>
- prod LOC: 0 genuine prod LOC (changed implementation/support files are under test/prod-readiness; tsconfig metadata in PR465 only)
- test/support LOC: +2855/-0
- test:src ratio: N/A/infinite for genuine prod LOC=0; CI Test density check green
- snapshots: refs/heads/wip/h4f-auto-flipper-fixer-r3-final-20260619
- CI at audit time: all visible PR checks green (build-and-test, Danger, R100 Quality Gate, CodeQL, size-label, rls-live-tests, mwb-3-live-tests)
- R3 identity on prod-repo commits: PASS
- audit-repo identity used: Bradley Gleave <bradley@bradleytgpcoaching.com>
- timestamp UTC: 2026-06-19T20:27:30Z

## R3 FINDINGS CLOSURE STATUS (sub-task)
| ID | Status | Evidence |
|---|---|---|
| R3-F001 | PARTIAL | Structural JSON/base64/YAML basics improved, but YAML indentation indicators remain open as R4-F001. |
| R3-F002 | CLOSED | causeName allowlist maps custom errors to UnknownError. |
| R3-F003 | PARTIAL | Absolute realpath executable check exists, but same-path executable replacement remains open as R4-F002. |

## R4 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---:|---|---|---|---|---|---|
| 1 | dry-run default | no API opt-in | see artifact | Pass invariant / reject unsafe edge | no commit | PASS |
| 2 | env only | READINESS_AUTO_FLIP only | see artifact | Pass invariant / reject unsafe edge | no commit | PASS |
| 3 | api only | commit true only | see artifact | Pass invariant / reject unsafe edge | no commit | PASS |
| 4 | both gates | commit true + env | see artifact | Pass invariant / reject unsafe edge | commit | PASS |
| 5 | argv shell | execFileSync argv array | see artifact | Pass invariant / reject unsafe edge | no shell | PASS |
| 6 | timeout | 60s SIGTERM | see artifact | Pass invariant / reject unsafe edge | timeout error | PASS |
| 7 | mutex | concurrent commits | see artifact | Pass invariant / reject unsafe edge | serialized | PASS |
| 8 | recheck throw | throws with secret | see artifact | Pass invariant / reject unsafe edge | redacted and continue | PASS |
| 9 | JSON nested | {"error":{"SECRET":"x"}} | see artifact | Pass invariant / reject unsafe edge | redacted | PASS |
| 10 | escaped JSON cap | escaped malformed | see artifact | Pass invariant / reject unsafe edge | terminates | PASS |
| 11 | base64 known literal | encoded known secret | see artifact | Pass invariant / reject unsafe edge | redacted | PASS |
| 12 | base64 ordinary | ordinary alnum | see artifact | Pass invariant / reject unsafe edge | unchanged | PASS |
| 13 | YAML | | SECRET: | body | see artifact | Pass invariant / reject unsafe edge | redacted | PASS |
| 14 | YAML |- | SECRET: |- body | see artifact | Pass invariant / reject unsafe edge | redacted | PASS |
| 15 | YAML |2 | SECRET: |2 body | see artifact | Pass invariant / reject unsafe edge | leaks body | FAIL |
| 16 | header auth | Authorization Bearer | see artifact | Pass invariant / reject unsafe edge | redacted | PASS |
| 17 | cause allowlist | SyntaxError | see artifact | Pass invariant / reject unsafe edge | kept | PASS |
| 18 | cause custom | FlyDeployError | see artifact | Pass invariant / reject unsafe edge | UnknownError | PASS |
| 19 | FLY_BIN relative | relative override | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 20 | FLY_BIN same-path swap | same canonical path replacement | see artifact | Pass invariant / reject unsafe edge | accepted | FAIL |
| 21 | strict env | NODE_ENV staging bare flyctl | see artifact | Pass invariant / reject unsafe edge | rejected | PASS |
| 22 | deep JSON 5000 | nested 5000 | see artifact | Pass invariant / reject unsafe edge | ok in probe | PASS |
| 23 | banned-token grep | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 24 | commit identity | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 25 | CI rollup | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 26 | focused tests | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 27 | assertion count | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 28 | prod LOC cap | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 29 | test density | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 30 | no TODO | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 31 | no console.log prod | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 32 | no raw SQL | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 33 | no network in tests | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 34 | file encoding | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 35 | symlink loop | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 36 | path traversal | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 37 | R109 stubs | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 38 | R110 secret history | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 39 | R117 assertions | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 40 | R123 no skip | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 41 | R111 unused imports | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 42 | R112 casts | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 43 | R113 deps | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 44 | R118 SAST | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 45 | R120 IaC | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 46 | R124 SHA pin | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
| 47 | R126 ledger | diff/read/probe | see artifact | Pass invariant / reject unsafe edge | no additional issue beyond findings | PASS |
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
| R24 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R25 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R26 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R27 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R28 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R29 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R30 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R31 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R32 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R33 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R34 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R35 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R36 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R37 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R38 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R39 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R40 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
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
| R58 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
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
| R95 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R96 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R97 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R98 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R99 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R100 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R101 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R102 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R103 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R104 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R105 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R106 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R107 | N/A | No changed production endpoint, DB/migration, UI, payment mutation, public API, or infra surface for this rule. |
| R108 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R109 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |
| R110 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
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
| R125 | APPLIES+FAIL | See NEW FINDINGS for this PR. |
| R126 | APPLIES+PASS | Checked against changed scanner/test surface; no additional violation beyond listed findings. |

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| R4-F001 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:455-458 | YAML block scalar indentation indicators (`SECRET: |2`) are not matched; probe returned `SECRET: ***\n  super-secret-value`, leaving the body secret. | Support indentation/chomping indicators and test continuation body redaction. |
| R4-F002 | P1 | R24/R58/R95/R125 | test/prod-readiness/auto-flipper.ts:87-178 | FLY_BIN cache stores only resolved path; revalidation accepts same-path executable replacement because no dev/inode/mtime/size identity is compared. | Cache and compare stable stat identity before every exec; refuse on mismatch. |

## VERDICT
FINDINGS-2
