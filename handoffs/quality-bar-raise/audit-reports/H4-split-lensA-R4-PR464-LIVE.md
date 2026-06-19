# H4 Split Audit — PR #464 (H4.B env-discovery) — Lens A (Opus 4.8) — R4 LIVE

STATUS: IN PROGRESS — sweep started 2026-06-19T20:30:00Z

## BUILD MATRIX (R124)
- main pre-work base: `8467c6f568a51337a7acbfb14f72ac85b996d605`
- final head: `9129693549facba58c39ecd02117a9dee9c453ed`
- branch: `wave-h4b-env-discovery`
- commits since main: 4 — all authored & committed `Bradley Gleave <bradley@bradleytgpcoaching.com>` (R3 PASS on prod repo)
- net prod LOC: +586 (env-discovery.ts) ; deletes 5 prior prod modules (learning-ledger 233, operator-keys-generator 289, reporter 291, stub-scanner 254 = −1067 prod) → net prod LOC negative
- net test LOC: +1296 (env-discovery.spec.ts) ; deletes 4 prior spec files (−2143)
- test:src ratio (added lines): 1296/586 = 2.21 (R74 ≥2.0 PASS)
- snapshots (wip/*): `refs/heads/wip/h4b-env-discovery-fixer-r3-final-20260619` @ `9129693549` (present)
- CI at audit time: ALL GREEN (banned-cast, CodeQL, LOC budget, test density, build-and-test, danger, mwb-3-live-tests, rls-floor-guard, rls-live-tests, size-label)
- R3 identity on prod-repo commits: PASS (Bradley, zero AI tokens)
- audit-repo identity used: **Claude Auditor <auditor@bradleytgpcoaching.com>** (FALLBACK — sandbox safety classifier blocked the Bradley identity as impersonation; operator-approved fallback for tgp-agent-context ONLY per EXHAUSTIVE_AUDIT_DOCTRINE.md R6 clause)
- timestamp UTC: 2026-06-19T20:30:00Z

## R3 FINDINGS CLOSURE STATUS (sub-task)
| ID | Status | Evidence |
|---|---|---|
| F002 fail-closed on multi-bound name | PARTIAL | `collectStringConsts` counts only `VariableDeclaration` bindings; `let`/`var`/for-const/block-const shadows ARE counted (fail-closed verified). BUT function-parameter and catch-clause shadows are NOT counted → see Finding L464-001 |
| Computed-destructure resolution | CLOSED | `{ [K]: x } = process.env`, `{ ["FOO"]: x }`, `as const`+computed, paren+computed all resolve correctly (re-derived via live AST probe) |
| as-const / wrapper unwrap | CLOSED | `unwrapExpression` fixed-point handles paren/non-null/as/angle-cast/satisfies; nested `((process.env as any)!).X` resolves |

## R4 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| 1 | AST | property access | `process.env.FOO` | [FOO] | [FOO] | PASS |
| 2 | AST | string element | `process.env['FOO']` | [FOO] | [FOO] | PASS |
| 3 | AST | const-keyed element | `const K='FOO';process.env[K]` | [FOO] | [FOO] | PASS |
| 4 | AST | destructure | `const {FOO}=process.env` | [FOO] | (covered by suite) | PASS |
| 5 | AST | computed-destr literal | `const {["FOO"]:x}=process.env` | [FOO] | [FOO] | PASS |
| 6 | AST | computed-destr const | `const K='FOO';const {[K]:x}=process.env` | [FOO] | [FOO] | PASS |
| 7 | AST | as-const + computed | `const K='FOO' as const;{[K]:x}` | [FOO] | [FOO] | PASS |
| 8 | AST | paren + computed | `const K=('FOO');{[K]:x}` | [FOO] | [FOO] | PASS |
| 9 | AST | process['env'] + computed | `(process['env'])` destr | [FOO] | [FOO] | PASS |
| 10 | AST | nested wrappers | `((process.env as any)!).DEEP` | [DEEP] | [DEEP] | PASS |
| 11 | AST | satisfies wrapper | `(process.env satisfies R).SAT` | [SAT] | [SAT] | PASS |
| 12 | AST | dynamic template key | `process.env[\`PRE${x}\`]` | [] | [] | PASS |
| 13 | AST | no-subst template const | `const K=\`FOO\`;process.env[K]` | [FOO] | [FOO] | PASS |
| 14 | AST | import.meta.env (Vite) | `import.meta.env.VITE_X` | [] | [] | PASS |
| 15 | AST | lowercase name | `process.env.foo` | [] | [] | PASS |
| 16 | AST | digit-start name | `process.env['1FOO']` | [] | [] | PASS |
| 17 | F002 | for-loop const shadow | `for(const K of a){} const K='FOO';env[K]` | [] (ambiguous skip) | [] | PASS |
| 18 | F002 | var-shadow-const | `var K='FOO';const K='BAR';env[K]` | [] (ambiguous skip) | [] | PASS |
| 19 | F002 | block-const shadow | `const K='FOO';{const K='FOO';}env[K]` | [] (ambiguous skip) | [] | PASS |
| 20 | F002 | **function-param shadow** | `function f(K){env[K]}const K='FOO'` | [] (param is dynamic) | **[FOO]** | **FAIL → L464-001** |
| 21 | F002 | **catch-clause shadow** | `try{}catch(K){env[K]}const K='QUX'` | [] (catch var dynamic) | **[QUX-via-FOO class]** | **FAIL → L464-001** |
| 22 | F002 | catch param, no const | `try{}catch(K){env[K]}` | [] | [] | PASS |
| 23 | F002 | arrow-param shadow | `const g=(K)=>env[K];const K='BAR'` | [] | **[BAR]** | **FAIL → L464-001** |
| 24 | isTestOnly | prefix anchor | TEST_X,_TEST_X | true,true | true,true | PASS |
| 25 | isTestOnly | infix not test | MY_TEST_VAR, AB_TEST_BUCKET, FEATURE_TEST_MODE | false×3 | false×3 | PASS |
| 26 | FS | binary skip (NUL) | NUL in first 1KiB | skip file | readUtf8OrNull returns null | PASS (code-read) |
| 27 | FS | symlink cycle | cyclic dir symlink | no infinite loop | walkTs tracks realpath in visited | PASS (code-read) |
| 28 | regex | .env.example parse | `NAME=val` | NAME | `/^([A-Z][A-Z0-9_]*)\s*=/` | PASS |
| 29 | error | registry load failure | bad yaml | wrapped RegistryParseError | re-throws wrapped (no swallow) | PASS |
| 30 | typing | banned casts in src | grep diff | 0 net | tsc compiles clean; CI banned-cast green | PASS |

## DOCTRINE RULE COVERAGE (R1–R126)
(populated after sweep — see final report)

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| L464-001 | P2 | R59 (fail-closed intent) / R109 / R65 | test/prod-readiness/env-discovery.ts:329-336 (collectStringConsts.countBindings) | The F002 fail-closed binding-count walk counts ONLY `ts.isVariableDeclaration` nodes. Function parameters (`ParameterDeclaration`) and catch-clause variables (`CatchClause.variableDeclaration` identifier) are NOT counted. So `function f(K){ return process.env[K]; } const K='FOO';` resolves the *dynamic* param read inside `f` to the file-scope const → fabricates env var `FOO` (false positive). Live AST probe confirmed: param-shadow→[FOO], arrow-param→[BAR], catch-shadow→ resolves file const. The doc comment claims fail-closed on "inner block/function const that shadows an outer one" and "let/var shadow of a const" — but parameter/catch shadows slip the guard. Effect: a dynamic `process.env[param]` read is mis-attributed to a same-named string const, producing a spurious UNDECLARED/TRACKED classification (false ship-block or mis-track), not a false negative. | In `countBindings`, also count `ts.isParameter(node)` (when `node.name` is an identifier) and `CatchClause` variable identifiers toward `bindingCounts`, so any identifier whose name is also bound as a param/catch var anywhere in the file is treated as ambiguous and dropped from the resolvable const map (fail-closed). Alternatively, scope-track resolution so a const only resolves reads in scopes where it is not shadowed. Add spec cases for param-shadow and catch-shadow asserting empty resolution. |

## VERDICT
(pending passes)
