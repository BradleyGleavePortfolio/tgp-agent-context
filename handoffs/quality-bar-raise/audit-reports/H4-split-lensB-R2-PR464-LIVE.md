# H4 Split Lens B R2 Live Audit — PR 464

STATUS: IN PROGRESS — sweep started 2026-06-19T17:35:06Z

## BUILD MATRIX
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: 50c12090092d8ead56802bd4d524d0dc5023092d
- branch: wave-h4b-env-discovery
- PR: #464 H4.B env-discovery
- commits since main/R1 base:
  - c9ae7391e9ee3853da47cc0a98046b50806781fd | Bradley Gleave | feat: H4.B env-discovery scanner (R100)
  - 50c12090092d8ead56802bd4d524d0dc5023092d | Bradley Gleave | fix(env-discovery): anchor TEST_ exclusion, support bracket env access, document Vite scope (H4.B R1)
- changed files:
  - test/prod-readiness/env-discovery.spec.ts (+1041/-0)
  - test/prod-readiness/env-discovery.ts (+489/-0)
- net prod LOC: 0
- net test LOC: 1530
- CI at audit time: 10/10 passing
- R3 identity: pass; Bradley author and committer on current head
- R124 timestamp UTC: 2026-06-19T17:35:06Z

## R1 FINDINGS CLOSURE STATUS
Pending exhaustive re-verification.

## R2 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| 1 | AST/env discovery | test-prefix infix include | `MY_TEST_VAR` | isTestOnly false | True | PASS |
| 2 | AST/env discovery | test-prefix TEST_ONLY exclude | `TEST_ONLY` | isTestOnly true | True | PASS |
| 3 | AST/env discovery | test-prefix _TEST_X exclude | `_TEST_X` | isTestOnly true | True | PASS |
| 4 | AST/env discovery | dot property | `process.env.FOO` | FOO | True | PASS |
| 5 | AST/env discovery | bracket property double | `process["env"].FOO` | FOO | True | PASS |
| 6 | AST/env discovery | bracket property single | `process['env'].FOO` | FOO | True | PASS |
| 7 | AST/env discovery | bracket key double | `process.env["FOO"]` | FOO | True | PASS |
| 8 | AST/env discovery | bracket env bracket key | `process["env"]["FOO"]` | FOO | True | PASS |
| 9 | AST/env discovery | const key | `const K="FOO"; process.env[K]` | FOO | True | PASS |
| 10 | AST/env discovery | late const key | `process.env[K]; const K="FOO"` | FOO | True | PASS |
| 11 | AST/env discovery | nonconst let key skipped | `let K="FOO"; process.env[K]` | skip mutable alias | False | FAIL |
| 12 | AST/env discovery | destructure | `const { FOO }=process.env` | FOO | True | PASS |
| 13 | AST/env discovery | destructure alias | `const { FOO: local }=process.env` | FOO | True | PASS |
| 14 | AST/env discovery | destructure default | `const { FOO="x" }=process.env` | FOO | True | PASS |
| 15 | AST/env discovery | destructure rest skip | `const { FOO,...rest}=process.env` | FOO only | True | PASS |
| 16 | AST/env discovery | import.meta skip | `import.meta.env.FOO` | skip | True | PASS |
| 17 | AST/env discovery | import.meta bracket skip | `import.meta.env["FOO"]` | skip | True | PASS |
| 18 | AST/env discovery | comment between env key | `process["env" /*c*/].FOO` | FOO | True | PASS |
| 19 | AST/env discovery | parenthesized process bracket | `(process)["env"].FOO` | FOO | False | FAIL |
| 20 | AST/env discovery | parenthesized process dot | `(process).env.FOO` | FOO | False | FAIL |
| 21 | AST/env discovery | parenthesized env namespace | `(process.env).FOO` | FOO | False | FAIL |
| 22 | AST/env discovery | parenthesized destructure | `const {FOO}=(process.env)` | FOO | False | FAIL |
| 23 | AST/env discovery | non-null env | `process.env!.FOO` | FOO | False | FAIL |
| 24 | AST/env discovery | as assertion env | `(process.env as any).FOO` | FOO | False | FAIL |
| 25 | AST/env discovery | satisfies env | `(process.env satisfies Record<string,string>).FOO` | FOO | False | FAIL |
| 26 | AST/env discovery | optional bracket env property | `process["env"]?.FOO` | FOO | True | PASS |
| 27 | AST/env discovery | optional dot env property | `process.env?.FOO` | FOO | True | PASS |
| 28 | AST/env discovery | optional bracket key | `process.env?.["FOO"]` | FOO | True | PASS |
| 29 | AST/env discovery | optional bracket env bracket key | `process["env"]?.["FOO"]` | FOO | True | PASS |
| 30 | AST/env discovery | template dynamic key skipped | `process.env[`FOO_${x}`]` | skip | True | PASS |
| 31 | AST/env discovery | template static key | `process.env[`FOO`]` | FOO | True | PASS |
| 32 | AST/env discovery | numeric key skip | `process.env[0]` | skip | True | PASS |
| 33 | AST/env discovery | lowercase skip | `process.env.lower` | skip | True | PASS |
| 34 | AST/env discovery | bad leading digit skip | `process.env["2FA"]` | skip | True | PASS |
| 35 | AST/env discovery | underscore leading skip | `process.env._FOO` | skip | True | PASS |
| 36 | AST/env discovery | valid digits | `process.env.OAUTH2_CLIENT_ID` | OAUTH2_CLIENT_ID | True | PASS |
| 37 | AST/env discovery | nested object DB URL | `process["env"].DB["URL"]` | DB only | True | PASS |
| 38 | AST/env discovery | assignment counted | `process.env.FOO="x"` | FOO | True | PASS |
| 39 | AST/env discovery | delete counted | `delete process.env.FOO` | FOO | True | PASS |
| 40 | AST/env discovery | other.env skipped | `other.env.FOO` | skip | True | PASS |
| 41 | AST/env discovery | process notenv skipped | `process.notenv.FOO` | skip | True | PASS |
| 42 | AST/env discovery | process env typo skipped | `process["ENV"].FOO` | skip | True | PASS |
| 43 | AST/env discovery | require-ish variable skipped | `const process={env:{FOO:1}}; process.env.FOO` | FOO despite shadowing | True | PASS |
| 44 | AST/env discovery | function param shadowing | `function f(process:any){return process.env.FOO}` | FOO despite shadowing | True | PASS |
| 45 | AST/env discovery | jsx expression TSX | `<X y={process.env.FOO}/>` | FOO | True | PASS |
| 46 | AST/env discovery | decorator expression | `@dec(process.env.FOO) class X{}` | FOO | True | PASS |
| 47 | AST/env discovery | top-level await | `await f(process.env.FOO)` | FOO | True | PASS |
| 48 | AST/env discovery | dynamic import sibling | `await import(process.env.FOO)` | FOO | True | PASS |
| 49 | AST/env discovery | no-substitution template const | `const K=`FOO`; process.env[K]` | FOO | True | PASS |
| 50 | AST/env discovery | const key as const | `const K="FOO" as const; process.env[K]` | FOO | False | FAIL |
| 51 | AST/env discovery | computed env const | `const E="env"; process[E].FOO` | skip or discover? | False | FAIL |
| 52 | AST/env discovery | unicode Cyrillic A in key | `process.env.АBC` | skip | True | PASS |
| 53 | AST/env discovery | zero width in string | `process.env["FOO‍BAR"]` | skip | True | PASS |
| 54 | AST/env discovery | BOM tolerated | `BOM + process.env.FOO` | FOO | True | PASS |
| 55 | AST/env discovery | CRLF tolerated | `CRLF process.env.FOO` | FOO | True | PASS |
| 56 | AST/env discovery | multiple refs dedupe | `FOO twice` | FOO once | True | PASS |
| 57 | AST/env discovery | multiple vars sorted | `A and B` | A,B | True | PASS |

## DOCTRINE RULE COVERAGE (R1-R126)
Pending full R1-R126 table.

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P3 | R40/R108 | test/prod-readiness/env-discovery.ts:258-267 | `collectStringConsts` records any variable declaration with a string initializer, so `let K="FOO"; process.env[K]` is treated as a static env var even though mutable aliases can be reassigned before use. Probe #11 expected a mutable alias to be skipped and observed discovery. | Restrict collection to `const` declarations or perform flow-aware constant analysis before resolving identifier keys. |
| F002 | P2 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:199-218,238-249 | `isProcessEnv` only recognizes bare `process.env` / `process["env"]` nodes and does not unwrap TypeScript expression wrappers; probes #19-25 missed `(process)["env"].FOO`, `(process).env.FOO`, `(process.env).FOO`, destructuring from `(process.env)`, `process.env!.FOO`, `(process.env as any).FOO`, and `(process.env satisfies Record<string,string>).FOO`. | Normalize expressions before matching by unwrapping `ParenthesizedExpression`, `NonNullExpression`, `AsExpression`, `TypeAssertionExpression`, and `SatisfiesExpression`; apply the same normalization to destructuring initializers and property/element receivers; add regression tests for every wrapper shape. |
| F003 | P3 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:257-267 | `collectStringConsts` only accepts direct string literals; probe #50 showed `const K="FOO" as const; process.env[K]` is missed even though it is a static literal key commonly emitted in strict TypeScript code. | Unwrap literal-preserving initializer nodes (`as const`, type assertions, `satisfies`, parenthesized expressions, no-substitution templates) before collecting const aliases; keep mutable aliases rejected. |

## VERDICT
Pending.
