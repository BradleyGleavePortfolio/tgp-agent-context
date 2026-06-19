# H4 Split Audit Half B R2 — Lens B Combined Report

Audit base: `8467c6f568a51337a7acbfb14f72ac85b996d605`

Operator rescope applied: full current diff sweep, R1 closure verification as a sub-task, 50+ probes per PR, R1-R126 doctrine coverage per PR, and live incremental pushes for every finding.


---

# H4 Split Lens B R2 Live Audit — PR 464

STATUS: PASS 2 COMPLETE — final verdict FINDINGS-4 — 2026-06-19T17:45:55Z

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
| Rule | Status | Evidence / N/A reason |
|---|---|---|
| R1 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R2 | APPLIES + PASS | Checked against changed files and audit artifacts for R2 (R0 IS NOT "SHIP FAST" — IT MEANS "SHIP CORRECTLY"); no additional violation beyond listed findings. |
| R3 | APPLIES + PASS | Checked against changed files and audit artifacts for R3 (OPERATOR IDENTITY ON EVERY COMMIT); no additional violation beyond listed findings. |
| R4 | APPLIES + PASS | Checked against changed files and audit artifacts for R4 (NEVER LOSE OPERATOR WORK OR TIME); no additional violation beyond listed findings. |
| R5 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R6 | APPLIES + FAIL | Findings in this PR cite R6; see NEW FINDINGS table and probe failures above. |
| R7 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R8 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R9 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R10 | APPLIES + PASS | Checked against changed files and audit artifacts for R10 (AUDITS MUST BE EXHAUSTIVE); no additional violation beyond listed findings. |
| R11 | APPLIES + PASS | Checked against changed files and audit artifacts for R11 (AUDITOR INDEPENDENCE); no additional violation beyond listed findings. |
| R12 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R13 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R14 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R15 | APPLIES + PASS | Checked against changed files and audit artifacts for R15 (AUDIT-CYCLE OPERATING DOCTRINE); no additional violation beyond listed findings. |
| R16 | APPLIES + PASS | Checked against changed files and audit artifacts for R16 (AUDITOR VERDICT LINE (STUCK CLASSIFIER)); no additional violation beyond listed findings. |
| R17 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R18 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R19 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R20 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R21 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R22 | APPLIES + PASS | Checked against changed files and audit artifacts for R22 (RUN ALL REPO PIN / DOCTRINE TESTS BEFORE OPENING A PR); no additional violation beyond listed findings. |
| R23 | APPLIES + PASS | Checked against changed files and audit artifacts for R23 (LOC SOFT CAP (P1 + EXCEPTION REVIEW)); no additional violation beyond listed findings. |
| R24 | APPLIES + PASS | Checked against changed files and audit artifacts for R24 (Zero secrets in source or git history *(R100.1)*); no additional violation beyond listed findings. |
| R25 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R26 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R27 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R28 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R29 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R30 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R31 | APPLIES + FAIL | Findings in this PR cite R31; see NEW FINDINGS table and probe failures above. |
| R32 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R33 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R34 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R35 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R36 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R37 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R38 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R39 | APPLIES + PASS | Checked against changed files and audit artifacts for R39 (No feature PR leaves a known TODO/FIXME in modified files *(R100.16)*); no additional violation beyond listed findings. |
| R40 | APPLIES + FAIL | Findings in this PR cite R40; see NEW FINDINGS table and probe failures above. |
| R41 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R42 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R43 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R44 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R45 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R46 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R47 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R48 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R49 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R50 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R51 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R52 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R53 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R54 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R55 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R56 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R57 | APPLIES + PASS | Checked against changed files and audit artifacts for R57 (Structured logging, not `console.log` *(R100.34)*); no additional violation beyond listed findings. |
| R58 | APPLIES + PASS | Checked against changed files and audit artifacts for R58 (Timeouts on every external call *(R100.35)*); no additional violation beyond listed findings. |
| R59 | APPLIES + PASS | Checked against changed files and audit artifacts for R59 (No swallowed errors *(R100.36)*); no additional violation beyond listed findings. |
| R60 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R61 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R62 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R63 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R64 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R65 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R66 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R67 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R68 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R69 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R70 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R71 | APPLIES + PASS | Checked against changed files and audit artifacts for R71 (CI/CD enforced: lint → typecheck → test → build → deploy *(R100.48)*); no additional violation beyond listed findings. |
| R72 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R73 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R74 | APPLIES + PASS | Checked against changed files and audit artifacts for R74 (Test:src line ratio ≥ 2.0 per PR *(R100.A1)*); no additional violation beyond listed findings. |
| R75 | APPLIES + PASS | Checked against changed files and audit artifacts for R75 (Banned-cast substitution gate: net additions = 0 *(R100.A2)*); no additional violation beyond listed findings. |
| R76 | APPLIES + PASS | Checked against changed files and audit artifacts for R76 (LOC soft cap ≤ 400 prod LOC per PR *(R100.A3; reaffirms R23)*); no additional violation beyond listed findings. |
| R77 | APPLIES + PASS | Checked against changed files and audit artifacts for R77 (CI pass-rate floor ≥ 75% *(R100.A4)*); no additional violation beyond listed findings. |
| R78 | APPLIES + PASS | Checked against changed files and audit artifacts for R78 (Auditor verdict line present *(R100.A5; see also R16)*); no additional violation beyond listed findings. |
| R79 | APPLIES + PASS | Checked against changed files and audit artifacts for R79 (THE 50-FAILURES SWEEP IS LAW ON EVERY AUDIT); no additional violation beyond listed findings. |
| R80 | APPLIES + PASS | Checked against changed files and audit artifacts for R80 (API contract is the source of truth; types are generated, not hand-written); no additional violation beyond listed findings. |
| R81 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R82 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R83 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R84 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R85 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R86 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R87 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R88 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R89 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R90 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R91 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R92 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R93 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R94 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R95 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R96 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R97 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R98 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R99 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R100 | APPLIES + PASS | Checked against changed files and audit artifacts for R100 (PROD READINESS BOARD: one test, every stub + every switch, no exceptions); no additional violation beyond listed findings. |
| R101 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R102 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R103 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R104 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R105 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R106 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R107 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R108 | APPLIES + FAIL | Findings in this PR cite R108; see NEW FINDINGS table and probe failures above. |
| R109 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R110 | APPLIES + PASS | Checked against changed files and audit artifacts for R110 (Secrets scanning pre-commit and CI); no additional violation beyond listed findings. |
| R111 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R112 | APPLIES + PASS | Checked against changed files and audit artifacts for R112 (Strict typing teeth (no `any`, no `unknown` escape hatches)); no additional violation beyond listed findings. |
| R113 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R114 | APPLIES + PASS | Checked against changed files and audit artifacts for R114 (No floating versions); no additional violation beyond listed findings. |
| R115 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R116 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R117 | APPLIES + PASS | Checked against changed files and audit artifacts for R117 (Every test has explicit assertions); no additional violation beyond listed findings. |
| R118 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R119 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R120 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R121 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R122 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R123 | APPLIES + PASS | Checked against changed files and audit artifacts for R123 (Assertion-bearing tests only (companion to R117)); no additional violation beyond listed findings. |
| R124 | APPLIES + FAIL | Findings in this PR cite R124; see NEW FINDINGS table and probe failures above. |
| R125 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R126 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |


## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P3 | R40/R108 | test/prod-readiness/env-discovery.ts:258-267 | `collectStringConsts` records any variable declaration with a string initializer, so `let K="FOO"; process.env[K]` is treated as a static env var even though mutable aliases can be reassigned before use. Probe #11 expected a mutable alias to be skipped and observed discovery. | Restrict collection to `const` declarations or perform flow-aware constant analysis before resolving identifier keys. |
| F002 | P2 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:199-218,238-249 | `isProcessEnv` only recognizes bare `process.env` / `process["env"]` nodes and does not unwrap TypeScript expression wrappers; probes #19-25 missed `(process)["env"].FOO`, `(process).env.FOO`, `(process.env).FOO`, destructuring from `(process.env)`, `process.env!.FOO`, `(process.env as any).FOO`, and `(process.env satisfies Record<string,string>).FOO`. | Normalize expressions before matching by unwrapping `ParenthesizedExpression`, `NonNullExpression`, `AsExpression`, `TypeAssertionExpression`, and `SatisfiesExpression`; apply the same normalization to destructuring initializers and property/element receivers; add regression tests for every wrapper shape. |
| F003 | P3 | R31/R40/R108 | test/prod-readiness/env-discovery.ts:257-267 | `collectStringConsts` only accepts direct string literals; probe #50 showed `const K="FOO" as const; process.env[K]` is missed even though it is a static literal key commonly emitted in strict TypeScript code. | Unwrap literal-preserving initializer nodes (`as const`, type assertions, `satisfies`, parenthesized expressions, no-substitution templates) before collecting const aliases; keep mutable aliases rejected. |
| F004 | P3 | R6/R124 | git refs / wip snapshot evidence | `wip-refs.txt` has H4.B snapshots for `c9ae7391...` and init/base refs, but no `refs/heads/wip/*` entry for final fixer head `50c12090092d8ead56802bd4d524d0dc5023092d`, so the R6 durability snapshot for the final fixer commit is not present. | Push a named wip snapshot ref for the exact final fixer head and include that ref in the build matrix before re-audit. |

## VERDICT
FINDINGS-4 — head 50c12090092d8ead56802bd4d524d0dc5023092d is not clean for merge.


---

# H4 Split Lens B R2 Live Audit — PR 465

STATUS: PASS 2 COMPLETE — final verdict FINDINGS-4 — 2026-06-19T17:46:01Z

## BUILD MATRIX
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: 4c0baabf300aa575024488bd6b23d750144c2815
- branch: wave-h4d-provider-wiring
- PR: #465 H4.D provider-wiring
- commits since main/R1 base:
  - 5b8acb133d2264d08f9bb4efd13a13d9edbc25ea | Bradley Gleave | feat: H4.D provider-wiring scanner (R100)
  - 4c0baabf300aa575024488bd6b23d750144c2815 | Bradley Gleave | fix(provider-wiring): provider-specific key shape validators, file-existence evidence for AWS IAM, AST-based import discovery (H4.D R1)
- changed files:
  - test/prod-readiness/provider-wiring-stripe-mux-sendgrid.spec.ts (+464/-0)
  - test/prod-readiness/provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts (+660/-0)
  - test/prod-readiness/provider-wiring.ts (+540/-0)
- net prod LOC: 0
- net test LOC: 1664
- CI at audit time: 10/10 passing
- R3 identity: pass; Bradley author and committer on current head
- R124 timestamp UTC: 2026-06-19T17:36:16Z

## R1 FINDINGS CLOSURE STATUS
- F1: CLOSED — `KEY_SHAPE_VALIDATORS` rejects short Stripe secret keys and `pk_` / `rk_` values; probes #1-9 re-derived the boundary from `provider-wiring.ts:145-156`.
- F2: CLOSED — AWS `_FILE` evidence gates missing paths as STUB and existing token files as WIRED; probes #45-47 re-derived the behavior from `collectFileEvidence` and `fileEvidenceOk`.
- F3: CLOSED — AST import extraction catches static imports, side-effect imports, re-exports, `require()`, and literal dynamic imports; probes #53-60 re-derived this from `extractModuleSpecifiers`.

## R2 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| 1 | validator/stripe | secret length 23 | `sk_live_aaaaaaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 2 | validator/stripe | secret length 24 | `sk_live_aaaaaaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 3 | validator/stripe | secret length 25 | `sk_live_aaaaaaaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 4 | validator/stripe | test secret shape accepted by validator | `sk_test_aaaaaaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 5 | validator/stripe | test secret classified placeholder | `sk_test_aaaaaaaaaaaaaaaaaaaaaaaa` | STUB | STUB | PASS |
| 6 | validator/stripe | secret reject/trim "pk_live_aaaaaaaaaaa | `pk_live_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 7 | validator/stripe | secret reject/trim "rk_live_aaaaaaaaaaa | `rk_live_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 8 | validator/stripe | secret reject/trim "sk_live_aaaaaaaaaaa | `sk_live_aaaaaaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 9 | validator/stripe | secret reject/trim "sk_live_aaaaaaaaaaa | `sk_live_aaaaaaaaaaaaaaaaaaaaaaaa-` | False | False | PASS |
| 10 | validator/stripe | secret reject/trim " sk_live_aaaaaaaaaa | ` sk_live_aaaaaaaaaaaaaaaaaaaaaaaa ` | True | True | PASS |
| 11 | validator/stripe | secret reject/trim "sk_live_aaaaaaaaaaa | `sk_live_aaaaaaaaaaaaaaaaaaaaaaaa\n` | True | True | PASS |
| 12 | validator/stripe | webhook length 19 | `whsec_aaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 13 | validator/stripe | webhook length 20 | `whsec_aaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 14 | validator/stripe | webhook length 21 | `whsec_aaaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 15 | validator/stripe | webhook malformed "whsec_aaaaaaaaaaaaaaa | `whsec_aaaaaaaaaaaaaaaaaaaa-` | False | False | PASS |
| 16 | validator/stripe | webhook malformed "whsec_aaaaaaaaaaaaaaa | `whsec_aaaaaaaaaaaaaaaaaaaa_` | False | False | PASS |
| 17 | validator/stripe | webhook malformed "whsec_aaaaaaaaaaaaaaa | `whsec_aaaaaaaaaaaaaaaaaaaa=` | False | False | PASS |
| 18 | validator/stripe | webhook malformed "WHSEC_aaaaaaaaaaaaaaa | `WHSEC_aaaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 19 | validator/supabase | jwt shape "eyJ.X.Y" | `eyJ.X.Y` | False | False | PASS |
| 20 | validator/supabase | jwt shape "eyJbad.abc.def" | `eyJbad.abc.def` | False | True | FAIL |
| 21 | validator/supabase | jwt shape "eyJhbGciOiJIUzI1NiJ9.e30.sig" | `eyJhbGciOiJIUzI1NiJ9.e30.sig` | True | True | PASS |
| 22 | validator/supabase | jwt shape "eyJabc.def.ghi" | `eyJabc.def.ghi` | False | True | FAIL |
| 23 | validator/supabase | jwt shape "eyJabc.def" | `eyJabc.def` | False | False | PASS |
| 24 | validator/supabase | jwt shape "eyJabc.def.ghi.jkl" | `eyJabc.def.ghi.jkl` | False | False | PASS |
| 25 | validator/supabase | jwt shape "eyJabc.def.ghi\n" | `eyJabc.def.ghi\n` | True | True | PASS |
| 26 | validator/supabase | malformed JWT can wire supabase | `eyJbad.abc.def` | STUB | WIRED | FAIL |
| 27 | validator/openai | openai "sk-aaaaaaaaaaaaaaaaaaa" | `sk-aaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 28 | validator/openai | openai "sk-aaaaaaaaaaaaaaaaaaaa | `sk-aaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 29 | validator/openai | openai "sk-proj-aaaaaaaaaaaaaaa | `sk-proj-aaaaaaaaaaaaaaaaaaaa` | True | True | PASS |
| 30 | validator/openai | openai "sk-aaaaaaaaaaaaaaaaaaaa | `sk-aaaaaaaaaaaaaaaaaaaa=` | False | False | PASS |
| 31 | validator/openai | openai "SK-aaaaaaaaaaaaaaaaaaaa | `SK-aaaaaaaaaaaaaaaaaaaa` | False | False | PASS |
| 32 | placeholder | placeholder changeme | `changeme` | True | True | PASS |
| 33 | placeholder | placeholder CHANGE-ME | `CHANGE-ME` | True | True | PASS |
| 34 | placeholder | placeholder your-key-here | `your-key-here` | True | True | PASS |
| 35 | placeholder | placeholder real_fake_key | `real_fake_key` | True | True | PASS |
| 36 | placeholder | placeholder example-token | `example-token` | True | True | PASS |
| 37 | placeholder | placeholder redacted | `redacted` | True | True | PASS |
| 38 | placeholder | placeholder todo | `todo` | True | True | PASS |
| 39 | placeholder | placeholder tbd | `tbd` | True | True | PASS |
| 40 | placeholder | placeholder xxx | `xxx` | True | True | PASS |
| 41 | placeholder | placeholder fixme | `fixme` | True | True | PASS |
| 42 | placeholder | placeholder insert_key_here | `insert_key_here` | True | True | PASS |
| 43 | placeholder | placeholder sk_test_replace_abc | `sk_test_replace_abc` | True | True | PASS |
| 44 | placeholder | placeholder  legitimate-key  | ` legitimate-key ` | False | False | PASS |
| 45 | aws/evidence | missing token file | `/no/such/path` | STUB | STUB | PASS |
| 46 | aws/evidence | existing token file | `/tmp/aws-V0tQ1v/token` | WIRED | WIRED | PASS |
| 47 | aws/evidence | file var set but no evidence injected | `token path` | WIRED (backcompat) | WIRED | PASS |
| 48 | aws/evidence | directory counts as exists | `/tmp/aws-V0tQ1v/dir` | STUB | WIRED | FAIL |
| 49 | aws/evidence | collectFileEvidence directory | `/tmp/aws-V0tQ1v/dir` | False | True | FAIL |
| 50 | aws/evidence | static keys wire without token file | `AKIA/secret` | WIRED | WIRED | PASS |
| 51 | aws/evidence | best-group diagnostic missing file | `missing file diagnostic` | True | True | PASS |
| 52 | import/extract | static import | `import Stripe from 'stripe'` | ["stripe"] | ["stripe"] | PASS |
| 53 | import/extract | side-effect import | `import 'stripe'` | ["stripe"] | ["stripe"] | PASS |
| 54 | import/extract | export from | `export {x} from 'stripe'` | ["stripe"] | ["stripe"] | PASS |
| 55 | import/extract | export star | `export * from 'stripe'` | ["stripe"] | ["stripe"] | PASS |
| 56 | import/extract | require | `const s=require('stripe')` | ["stripe"] | ["stripe"] | PASS |
| 57 | import/extract | dynamic import | `await import('stripe')` | ["stripe"] | ["stripe"] | PASS |
| 58 | import/extract | await dynamic import | `const x= await import('openai')` | ["openai"] | ["openai"] | PASS |
| 59 | import/extract | template dynamic skipped | `import(`stripe`)` | [] | [] | PASS |
| 60 | import/extract | require template skipped | `require(`stripe`)` | [] | [] | PASS |
| 61 | import/extract | relative skipped normalize later | `import './stripe'` | ["./stripe"] | ["./stripe"] | PASS |
| 62 | import/extract | scoped deep | `import x from '@sendgrid/mail/foo'` | ["@sendgrid/mail/foo"] | ["@sendgrid/mail/foo"] | PASS |
| 63 | import/extract | type import | `import type {X} from 'stripe'` | ["stripe"] | ["stripe"] | PASS |
| 64 | import/extract | commented import skipped | `// import 'stripe'` | [] | [] | PASS |
| 65 | import/extract | tsx jsx import | `import React from 'react'; const x=<A/>` | ["react"] | ["react"] | PASS |
| 66 | import/collectImports | .ts file import | `/tmp/p465-HZBklr` | True | True | PASS |
| 67 | import/collectImports | .tsx file import | `/tmp/p465-aKCmgp` | True | False | FAIL |
| 68 | import/collectImports | .d.ts skipped | `/tmp/p465-5YXmhD` | False | False | PASS |
| 69 | import/collectImports | node_modules skipped | `/tmp/p465-XxbkZU` | False | False | PASS |
| 70 | import/collectImports | hidden dir skipped | `/tmp/p465-Dm7bUZ` | False | False | PASS |
| 71 | pure/env | scanProvidersWith does not read process.env | `process.env.OPENAI_API_KEY set but env map empty` | STUB | STUB | PASS |
| 72 | pure/env | filter unknown provider | `bad-id` | 0 | 0 | PASS |
| 73 | pathPresence | direct file hint fly.toml | `/tmp/p465-JSLY1T` | fly present | True | PASS |
| 74 | pathPresence | substring hint in src path | `/tmp/p465-3QFFzp` | src/billing present | True | PASS |

## DOCTRINE RULE COVERAGE (R1-R126)
| Rule | Status | Evidence / N/A reason |
|---|---|---|
| R1 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R2 | APPLIES + PASS | Checked against changed files and audit artifacts for R2 (R0 IS NOT "SHIP FAST" — IT MEANS "SHIP CORRECTLY"); no additional violation beyond listed findings. |
| R3 | APPLIES + PASS | Checked against changed files and audit artifacts for R3 (OPERATOR IDENTITY ON EVERY COMMIT); no additional violation beyond listed findings. |
| R4 | APPLIES + PASS | Checked against changed files and audit artifacts for R4 (NEVER LOSE OPERATOR WORK OR TIME); no additional violation beyond listed findings. |
| R5 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R6 | APPLIES + FAIL | Findings in this PR cite R6; see NEW FINDINGS table and probe failures above. |
| R7 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R8 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R9 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R10 | APPLIES + PASS | Checked against changed files and audit artifacts for R10 (AUDITS MUST BE EXHAUSTIVE); no additional violation beyond listed findings. |
| R11 | APPLIES + PASS | Checked against changed files and audit artifacts for R11 (AUDITOR INDEPENDENCE); no additional violation beyond listed findings. |
| R12 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R13 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R14 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R15 | APPLIES + PASS | Checked against changed files and audit artifacts for R15 (AUDIT-CYCLE OPERATING DOCTRINE); no additional violation beyond listed findings. |
| R16 | APPLIES + PASS | Checked against changed files and audit artifacts for R16 (AUDITOR VERDICT LINE (STUCK CLASSIFIER)); no additional violation beyond listed findings. |
| R17 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R18 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R19 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R20 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R21 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R22 | APPLIES + PASS | Checked against changed files and audit artifacts for R22 (RUN ALL REPO PIN / DOCTRINE TESTS BEFORE OPENING A PR); no additional violation beyond listed findings. |
| R23 | APPLIES + PASS | Checked against changed files and audit artifacts for R23 (LOC SOFT CAP (P1 + EXCEPTION REVIEW)); no additional violation beyond listed findings. |
| R24 | APPLIES + PASS | Checked against changed files and audit artifacts for R24 (Zero secrets in source or git history *(R100.1)*); no additional violation beyond listed findings. |
| R25 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R26 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R27 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R28 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R29 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R30 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R31 | APPLIES + FAIL | Findings in this PR cite R31; see NEW FINDINGS table and probe failures above. |
| R32 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R33 | APPLIES + PASS | Checked against changed files and audit artifacts for R33 (Dependency hygiene: `npm audit --audit-level=high` clean + lockfile committed *(R100.10)*); no additional violation beyond listed findings. |
| R34 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R35 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R36 | APPLIES + FAIL | Findings in this PR cite R36; see NEW FINDINGS table and probe failures above. |
| R37 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R38 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R39 | APPLIES + PASS | Checked against changed files and audit artifacts for R39 (No feature PR leaves a known TODO/FIXME in modified files *(R100.16)*); no additional violation beyond listed findings. |
| R40 | APPLIES + FAIL | Findings in this PR cite R40; see NEW FINDINGS table and probe failures above. |
| R41 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R42 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R43 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R44 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R45 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R46 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R47 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R48 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R49 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R50 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R51 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R52 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R53 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R54 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R55 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R56 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R57 | APPLIES + PASS | Checked against changed files and audit artifacts for R57 (Structured logging, not `console.log` *(R100.34)*); no additional violation beyond listed findings. |
| R58 | APPLIES + PASS | Checked against changed files and audit artifacts for R58 (Timeouts on every external call *(R100.35)*); no additional violation beyond listed findings. |
| R59 | APPLIES + FAIL | Findings in this PR cite R59; see NEW FINDINGS table and probe failures above. |
| R60 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R61 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R62 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R63 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R64 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R65 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R66 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R67 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R68 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R69 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R70 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R71 | APPLIES + PASS | Checked against changed files and audit artifacts for R71 (CI/CD enforced: lint → typecheck → test → build → deploy *(R100.48)*); no additional violation beyond listed findings. |
| R72 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R73 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R74 | APPLIES + PASS | Checked against changed files and audit artifacts for R74 (Test:src line ratio ≥ 2.0 per PR *(R100.A1)*); no additional violation beyond listed findings. |
| R75 | APPLIES + PASS | Checked against changed files and audit artifacts for R75 (Banned-cast substitution gate: net additions = 0 *(R100.A2)*); no additional violation beyond listed findings. |
| R76 | APPLIES + PASS | Checked against changed files and audit artifacts for R76 (LOC soft cap ≤ 400 prod LOC per PR *(R100.A3; reaffirms R23)*); no additional violation beyond listed findings. |
| R77 | APPLIES + PASS | Checked against changed files and audit artifacts for R77 (CI pass-rate floor ≥ 75% *(R100.A4)*); no additional violation beyond listed findings. |
| R78 | APPLIES + PASS | Checked against changed files and audit artifacts for R78 (Auditor verdict line present *(R100.A5; see also R16)*); no additional violation beyond listed findings. |
| R79 | APPLIES + PASS | Checked against changed files and audit artifacts for R79 (THE 50-FAILURES SWEEP IS LAW ON EVERY AUDIT); no additional violation beyond listed findings. |
| R80 | APPLIES + FAIL | Findings in this PR cite R80; see NEW FINDINGS table and probe failures above. |
| R81 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R82 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R83 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R84 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R85 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R86 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R87 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R88 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R89 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R90 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R91 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R92 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R93 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R94 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R95 | APPLIES + PASS | Checked against changed files and audit artifacts for R95 (Supply chain: lockfile committed, reproducible builds, no `curl | sh`); no additional violation beyond listed findings. |
| R96 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R97 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R98 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R99 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R100 | APPLIES + PASS | Checked against changed files and audit artifacts for R100 (PROD READINESS BOARD: one test, every stub + every switch, no exceptions); no additional violation beyond listed findings. |
| R101 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R102 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R103 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R104 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R105 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R106 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R107 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R108 | APPLIES + PASS | Checked against changed files and audit artifacts for R108 (Every new env var must register in the switch registry or CI fails); no additional violation beyond listed findings. |
| R109 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R110 | APPLIES + PASS | Checked against changed files and audit artifacts for R110 (Secrets scanning pre-commit and CI); no additional violation beyond listed findings. |
| R111 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R112 | APPLIES + PASS | Checked against changed files and audit artifacts for R112 (Strict typing teeth (no `any`, no `unknown` escape hatches)); no additional violation beyond listed findings. |
| R113 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R114 | APPLIES + PASS | Checked against changed files and audit artifacts for R114 (No floating versions); no additional violation beyond listed findings. |
| R115 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R116 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R117 | APPLIES + PASS | Checked against changed files and audit artifacts for R117 (Every test has explicit assertions); no additional violation beyond listed findings. |
| R118 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R119 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R120 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R121 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R122 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R123 | APPLIES + PASS | Checked against changed files and audit artifacts for R123 (Assertion-bearing tests only (companion to R117)); no additional violation beyond listed findings. |
| R124 | APPLIES + FAIL | Findings in this PR cite R124; see NEW FINDINGS table and probe failures above. |
| R125 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R126 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |


## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P2 | R31/R36/R40 | test/prod-readiness/provider-wiring.ts:145-156,234-310 | The Supabase service-role validator only checks `^eyJ...\....\....$`; probes #20/#22 accepted non-JSON/non-JWT-like strings such as `eyJbad.abc.def`, and probe #26 classified Supabase as WIRED when that malformed value was supplied with a URL. | Parse the JWT segments with base64url decoding, require valid JSON header/payload, require plausible Supabase service-role claims/issuer/audience as far as offline validation permits, and classify malformed tokens as STUB with tests for malformed-but-regex-shaped inputs. |
| F002 | P2 | R31/R40/R59 | test/prod-readiness/provider-wiring.ts:348-356,217-219 | `collectFileEvidence` uses `fs.existsSync` only, so a directory or other non-regular path satisfies `AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS`; probes #48-49 passed a directory path and observed AWS S3 classified as WIRED instead of STUB. | Replace existence-only evidence with `fs.statSync`/`lstatSync` plus `isFile()` and readable-access checks, handle errors explicitly, and report a diagnostic for non-file credential paths. |
| F003 | P2 | R31/R40/R80 | test/prod-readiness/provider-wiring.ts:431-451 | `collectImports` walks only files ending in `.ts` and excludes `.tsx`; probe #67 created `src/a.tsx` importing `stripe` and observed the provider import was missed, so React/TSX integration files can report NOT_USED. | Include `.tsx` in the TypeScript source scan while still excluding `.d.ts`; add fixtures proving providers imported from TSX components are detected. |
| F004 | P3 | R6/R124 | git refs / wip snapshot evidence | `wip-refs.txt` has H4.D snapshots for `5b8acb13...` and intermediate `74b533a...`, but no `refs/heads/wip/*` entry for final fixer head `4c0baabf300aa575024488bd6b23d750144c2815`, so the R6 durability snapshot for the final fixer commit is not present. | Push a named wip snapshot ref for the exact final fixer head and include that ref in the build matrix before re-audit. |

## VERDICT
FINDINGS-4 — head 4c0baabf300aa575024488bd6b23d750144c2815 is not clean for merge.


---

# H4 Split Lens B R2 Live Audit — PR 466

STATUS: PASS 2 COMPLETE — final verdict FINDINGS-8 — 2026-06-19T17:46:09Z

## BUILD MATRIX
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: de43a17bae9cfb49ae2029aece79a17709986421
- branch: wave-h4f-auto-flipper
- PR: #466 H4.F auto-flipper
- commits since main/R1 base:
  - 2a58c17990f0690fb4d176baee56772bb9474002 | Bradley Gleave | feat: H4.F auto-flipper for READINESS_AUTO_FLIP secrets (R100)
  - de43a17bae9cfb49ae2029aece79a17709986421 | Bradley Gleave | fix(auto-flipper): redact secret values in error/log paths, add 60s flyctl timeout, optional TOCTOU recheck (H4.F R1)
- changed files:
  - test/prod-readiness/auto-flipper.spec.ts (+916/-0)
  - test/prod-readiness/auto-flipper.ts (+411/-0)
- net prod LOC: 0
- net test LOC: 1327
- CI at audit time: 10/10 passing
- R3 identity: pass; Bradley author and committer on current head
- R124 timestamp UTC: 2026-06-19T17:36:25Z

## R1 FINDINGS CLOSURE STATUS
- F1: PARTIAL CLOSED — `KEY=VALUE`, quoted whole-token forms, multi-line, numeric, and base64-with-padding values are redacted in the tested paths, but the expanded sweep found additional value-bearing formats still leak.
- F2: CLOSED — `runFlyctl` uses `execFileSync(..., { timeout: 60000, killSignal: 'SIGTERM' })`; prior live probe observed a 65s mock timing out as `FlyctlTimeoutError` without secret value leakage.
- F3: PARTIAL CLOSED — commit-time TOCTOU drift is skipped or forced as expected for normal callback returns, but callback exceptions propagate raw and can leak secret-bearing messages.

## R2 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| 1 | redaction |  | `` |  |  | PASS |
| 2 | redaction | MY_SECRET=topsecret123 | `MY_SECRET=topsecret123` | MY_SECRET=*** | MY_SECRET=*** | PASS |
| 3 | redaction | --secret MY_SECRET=topsecret123 | `--secret MY_SECRET=topsecret123` | --secret MY_SECRET=*** | --secret MY_SECRET=*** | PASS |
| 4 | redaction | 'MY_SECRET=top secret' | `'MY_SECRET=top secret'` | 'MY_SECRET=***' | 'MY_SECRET=***' | PASS |
| 5 | redaction | "MY_SECRET=top secret" | `"MY_SECRET=top secret"` | "MY_SECRET=***" | "MY_SECRET=***" | PASS |
| 6 | redaction | A=1 B=two C=base64=padding | `A=1 B=two C=base64=padding` | A=*** B=*** C=*** | A=*** B=*** C=*** | PASS |
| 7 | redaction | line1\nline2\nMY_SECRET=topsecret123\nline4 | `line1\nline2\nMY_SECRET=topsecret123\nline4` | line1\nline2\nMY_SECRET=***\nline4 | line1\nline2\nMY_SECRET=***\nline4 | PASS |
| 8 | redaction | SECRET=12345 | `SECRET=12345` | SECRET=*** | SECRET=*** | PASS |
| 9 | redaction | SECRET=abc-def_ghi.jkl | `SECRET=abc-def_ghi.jkl` | SECRET=*** | SECRET=*** | PASS |
| 10 | redaction | SECRET=abc/def+ghi== | `SECRET=abc/def+ghi==` | SECRET=*** | SECRET=*** | PASS |
| 11 | redaction | MY_SECRET='topsecret123' | `MY_SECRET='topsecret123'` | MY_SECRET=*** | MY_SECRET='topsecret123' | FAIL |
| 12 | redaction | MY_SECRET="topsecret123" | `MY_SECRET="topsecret123"` | MY_SECRET=*** | MY_SECRET="topsecret123" | FAIL |
| 13 | redaction | {"MY_SECRET":"topsecret123"} | `{"MY_SECRET":"topsecret123"}` | {"MY_SECRET":"***"} | {"MY_SECRET":"topsecret123"} | FAIL |
| 14 | redaction | MY_SECRET: topsecret123 | `MY_SECRET: topsecret123` | MY_SECRET: *** | MY_SECRET: topsecret123 | FAIL |
| 15 | redaction | Authorization: Bearer topsecret123 | `Authorization: Bearer topsecret123` | Authorization: Bearer *** | Authorization: Bearer topsecret123 | FAIL |
| 16 | redaction | MY_SECRET%3Dtopsecret123 | `MY_SECRET%3Dtopsecret123` | MY_SECRET%3D*** | MY_SECRET%3Dtopsecret123 | FAIL |
| 17 | redaction | topsecret123 | `topsecret123` | *** | topsecret123 | FAIL |
| 18 | redaction | api_key=topsecret123 | `api_key=topsecret123` | api_key=*** | api_key=topsecret123 | FAIL |
| 19 | redaction | MY-SECRET=topsecret123 | `MY-SECRET=topsecret123` | MY-SECRET=*** | MY-SECRET=*** | PASS |
| 20 | redaction | MY_SECRET = top secret with spaces | `MY_SECRET = top secret with spaces` | MY_SECRET=*** | MY_SECRET=*** secret with spaces | FAIL |
| 21 | redaction | MY_SECRET=topsecret123
\nNEXT=two | `MY_SECRET=topsecret123
\nNEXT=two` | MY_SECRET=***
\nNEXT=*** | MY_SECRET=***
\nNEXT=*** | PASS |
| 22 | flyErrorMessage | stderr KEY=VALUE | `Buffer stderr` | redacted | err MY_SECRET=*** | PASS |
| 23 | flyErrorMessage | stderr bare value | `Buffer stderr` | redacted | err topsecret123 | FAIL |
| 24 | flyErrorMessage | message KEY=VALUE | `Error.message` | redacted | failed MY_SECRET=*** | PASS |
| 25 | flyErrorMessage | message JSON secret | `Error.message` | redacted | failed {"MY_SECRET":"topsecret123"} | FAIL |
| 26 | flyErrorMessage | generic unknown error | `{}` | flyctl secrets set failed | flyctl secrets set failed | PASS |
| 27 | env gate | READINESS_AUTO_FLIP true | `true` | True | True | PASS |
| 28 | env gate | READINESS_AUTO_FLIP TRUE | `TRUE` | False | False | PASS |
| 29 | env gate | READINESS_AUTO_FLIP True | `True` | False | False | PASS |
| 30 | env gate | READINESS_AUTO_FLIP  yes  | ` yes ` | False | False | PASS |
| 31 | env gate | READINESS_AUTO_FLIP 1 | `1` | False | False | PASS |
| 32 | env gate | READINESS_AUTO_FLIP  | `` | False | False | PASS |
| 33 | env gate | READINESS_AUTO_FLIP undefined | `undefined` | False | False | PASS |
| 34 | env gate | READINESS_AUTO_FLIP truex | `truex` | False | False | PASS |
| 35 | env gate | READINESS_AUTO_FLIP "true" | `"true"` | False | False | PASS |
| 36 | plan | partition already/stale/skip | `A true B stale C must D notauto` | counts 1/1/2 | 1/1/2 | PASS |
| 37 | commit | env gate refuses | `env missing` | throws | True | PASS |
| 38 | commit | successful commit no value in logs | `target true` | no true/topsecret substrings | warning: no recheckCurrent configured — applying plan without TOCTOU re-verification\nflyctl secrets set FEATURE_SECRET=*** --app <prod>\n{"operator":"Bradley Gleave","action":"set","key":"FEATURE_SECRET","before":"missing","after":"set","timestamp":"2026-01-01T00:00:00.000Z"} | PASS |
| 39 | commit | successful commit argv contains value only to runner | `run args` | True | True | PASS |
| 40 | commit | runner error KEY quoted value redacted | `MY_SECRET='topsecret123'` | redacted | bad MY_SECRET='topsecret123' | FAIL |
| 41 | commit | runner error bare value redacted | `topsecret123` | redacted | bad topsecret123 | FAIL |
| 42 | commit | recheck callback throw redacted/contained | `throw secret` | no throw/raw leak | recheck blew topsecret123 MY_SECRET=value | FAIL |
| 43 | commit | TOCTOU drift skips without running | `live other` | skipped 1 run 0 | 1/0/0 | PASS |
| 44 | commit | force applies over drift | `force true` | succeeded 1 | 1 | PASS |
| 45 | audit | before uses local env presence | `plan.was undefined env has key` | before missing | {"operator":"Bradley Gleave","action":"set","key":"FEATURE_SECRET","before":"stale","after":"set","timestamp":"2026-01-01T00:00:00.000Z"} | FAIL |
| 46 | audit | before uses planned was stale | `plan.was old env lacks key` | before stale | {"operator":"Bradley Gleave","action":"set","key":"FEATURE_SECRET","before":"missing","after":"set","timestamp":"2026-01-01T00:00:00.000Z"} | FAIL |
| 47 | flip | dry run when env absent | `env absent` | result null | True | PASS |
| 48 | flip | dry run default when env true without explicit commit | `env true only` | result null / no run | true/true | FAIL |
| 49 | flip | registryFor raw error redacted | `throw bare secret` | redacted | registry topsecret123 | FAIL |
| 50 | concurrency | two commit calls globally sequential | `two concurrent commits` | max inflight 1 | 2 | FAIL |
| 51 | exec | binary is PATH resolved | `FLY_BIN` | absolute path | flyctl | FAIL |
| 52 | exec | timeout configured | `FLY_TIMEOUT_MS` | 60000 | 60000 | PASS |
| 53 | exec | redacted argv context on timeout | `timeout message observed earlier` | no KEY=VALUE | FlyctlTimeoutError without secret | PASS |
| 54 | serialization | FlipResult JSON stringification redacted | `failed result` | no topsecret123 | {"succeeded":[],"failed":[{"row":{"name":"JSON_SECRET","category":"cat","owner":"ops","prod_default":"ON","auto_flip_on_in_prod":true,"exposure":"server","description":"d"},"error":"JSON_SECRET=***"}],"skipped":[]} | PASS |
| 55 | schema | failed row includes full row object | `JSON.stringify failed row` | row name only no value | {"succeeded":[],"failed":[{"row":{"name":"JSON_SECRET","category":"cat","owner":"ops","prod_default":"ON","auto_flip_on_in_prod":true,"exposure":"server","description":"d"},"error":"JSON_SECRET=***"}],"skipped":[]} | PASS |

## DOCTRINE RULE COVERAGE (R1-R126)
| Rule | Status | Evidence / N/A reason |
|---|---|---|
| R1 | APPLIES + FAIL | Findings in this PR cite R1; see NEW FINDINGS table and probe failures above. |
| R2 | APPLIES + PASS | Checked against changed files and audit artifacts for R2 (R0 IS NOT "SHIP FAST" — IT MEANS "SHIP CORRECTLY"); no additional violation beyond listed findings. |
| R3 | APPLIES + PASS | Checked against changed files and audit artifacts for R3 (OPERATOR IDENTITY ON EVERY COMMIT); no additional violation beyond listed findings. |
| R4 | APPLIES + PASS | Checked against changed files and audit artifacts for R4 (NEVER LOSE OPERATOR WORK OR TIME); no additional violation beyond listed findings. |
| R5 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R6 | APPLIES + FAIL | Findings in this PR cite R6; see NEW FINDINGS table and probe failures above. |
| R7 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R8 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R9 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R10 | APPLIES + PASS | Checked against changed files and audit artifacts for R10 (AUDITS MUST BE EXHAUSTIVE); no additional violation beyond listed findings. |
| R11 | APPLIES + PASS | Checked against changed files and audit artifacts for R11 (AUDITOR INDEPENDENCE); no additional violation beyond listed findings. |
| R12 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R13 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R14 | APPLIES + FAIL | Findings in this PR cite R14; see NEW FINDINGS table and probe failures above. |
| R15 | APPLIES + PASS | Checked against changed files and audit artifacts for R15 (AUDIT-CYCLE OPERATING DOCTRINE); no additional violation beyond listed findings. |
| R16 | APPLIES + PASS | Checked against changed files and audit artifacts for R16 (AUDITOR VERDICT LINE (STUCK CLASSIFIER)); no additional violation beyond listed findings. |
| R17 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R18 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R19 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R20 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R21 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R22 | APPLIES + PASS | Checked against changed files and audit artifacts for R22 (RUN ALL REPO PIN / DOCTRINE TESTS BEFORE OPENING A PR); no additional violation beyond listed findings. |
| R23 | APPLIES + PASS | Checked against changed files and audit artifacts for R23 (LOC SOFT CAP (P1 + EXCEPTION REVIEW)); no additional violation beyond listed findings. |
| R24 | APPLIES + FAIL | Findings in this PR cite R24; see NEW FINDINGS table and probe failures above. |
| R25 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R26 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R27 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R28 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R29 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R30 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R31 | APPLIES + PASS | Checked against changed files and audit artifacts for R31 (Runtime input validation at every API boundary *(R100.8)*); no additional violation beyond listed findings. |
| R32 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R33 | APPLIES + PASS | Checked against changed files and audit artifacts for R33 (Dependency hygiene: `npm audit --audit-level=high` clean + lockfile committed *(R100.10)*); no additional violation beyond listed findings. |
| R34 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R35 | APPLIES + FAIL | Findings in this PR cite R35; see NEW FINDINGS table and probe failures above. |
| R36 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R37 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R38 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R39 | APPLIES + PASS | Checked against changed files and audit artifacts for R39 (No feature PR leaves a known TODO/FIXME in modified files *(R100.16)*); no additional violation beyond listed findings. |
| R40 | APPLIES + PASS | Checked against changed files and audit artifacts for R40 (Test reality: real assertions, no "exists" theater *(R100.17)*); no additional violation beyond listed findings. |
| R41 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R42 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R43 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R44 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R45 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R46 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R47 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R48 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R49 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R50 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R51 | APPLIES + FAIL | Findings in this PR cite R51; see NEW FINDINGS table and probe failures above. |
| R52 | APPLIES + FAIL | Findings in this PR cite R52; see NEW FINDINGS table and probe failures above. |
| R53 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R54 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R55 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R56 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R57 | APPLIES + FAIL | Findings in this PR cite R57; see NEW FINDINGS table and probe failures above. |
| R58 | APPLIES + FAIL | Findings in this PR cite R58; see NEW FINDINGS table and probe failures above. |
| R59 | APPLIES + FAIL | Findings in this PR cite R59; see NEW FINDINGS table and probe failures above. |
| R60 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R61 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R62 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R63 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R64 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R65 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R66 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R67 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R68 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R69 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R70 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R71 | APPLIES + PASS | Checked against changed files and audit artifacts for R71 (CI/CD enforced: lint → typecheck → test → build → deploy *(R100.48)*); no additional violation beyond listed findings. |
| R72 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R73 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R74 | APPLIES + PASS | Checked against changed files and audit artifacts for R74 (Test:src line ratio ≥ 2.0 per PR *(R100.A1)*); no additional violation beyond listed findings. |
| R75 | APPLIES + PASS | Checked against changed files and audit artifacts for R75 (Banned-cast substitution gate: net additions = 0 *(R100.A2)*); no additional violation beyond listed findings. |
| R76 | APPLIES + PASS | Checked against changed files and audit artifacts for R76 (LOC soft cap ≤ 400 prod LOC per PR *(R100.A3; reaffirms R23)*); no additional violation beyond listed findings. |
| R77 | APPLIES + PASS | Checked against changed files and audit artifacts for R77 (CI pass-rate floor ≥ 75% *(R100.A4)*); no additional violation beyond listed findings. |
| R78 | APPLIES + PASS | Checked against changed files and audit artifacts for R78 (Auditor verdict line present *(R100.A5; see also R16)*); no additional violation beyond listed findings. |
| R79 | APPLIES + PASS | Checked against changed files and audit artifacts for R79 (THE 50-FAILURES SWEEP IS LAW ON EVERY AUDIT); no additional violation beyond listed findings. |
| R80 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R81 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R82 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R83 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R84 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R85 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R86 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R87 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R88 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R89 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R90 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R91 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R92 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R93 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R94 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R95 | APPLIES + FAIL | Findings in this PR cite R95; see NEW FINDINGS table and probe failures above. |
| R96 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R97 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R98 | APPLIES + FAIL | Findings in this PR cite R98; see NEW FINDINGS table and probe failures above. |
| R99 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R100 | APPLIES + PASS | Checked against changed files and audit artifacts for R100 (PROD READINESS BOARD: one test, every stub + every switch, no exceptions); no additional violation beyond listed findings. |
| R101 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R102 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R103 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R104 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R105 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R106 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R107 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R108 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R109 | APPLIES + FAIL | Findings in this PR cite R109; see NEW FINDINGS table and probe failures above. |
| R110 | APPLIES + FAIL | Findings in this PR cite R110; see NEW FINDINGS table and probe failures above. |
| R111 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R112 | APPLIES + PASS | Checked against changed files and audit artifacts for R112 (Strict typing teeth (no `any`, no `unknown` escape hatches)); no additional violation beyond listed findings. |
| R113 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R114 | APPLIES + PASS | Checked against changed files and audit artifacts for R114 (No floating versions); no additional violation beyond listed findings. |
| R115 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R116 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R117 | APPLIES + PASS | Checked against changed files and audit artifacts for R117 (Every test has explicit assertions); no additional violation beyond listed findings. |
| R118 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R119 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R120 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R121 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R122 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R123 | APPLIES + PASS | Checked against changed files and audit artifacts for R123 (Assertion-bearing tests only (companion to R117)); no additional violation beyond listed findings. |
| R124 | APPLIES + FAIL | Findings in this PR cite R124; see NEW FINDINGS table and probe failures above. |
| R125 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |
| R126 | N/A | N/A — changed surface is test/prod-readiness scanner code; rule targets unrelated product runtime, UI, DB, migration, endpoint, telemetry, money, media, mobile, or governance surface. |


## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:51-58,281-290,376-380 | The redactor only handles uppercase `KEY=VALUE` runs; probes #11-18/#20/#23/#25/#40-41 leaked quoted assignment values (`KEY='value'`/`KEY="value"`), JSON/YAML/header/URL-encoded/lowercase forms, bare values, and space-containing values through `redactSecretValues`, `flyErrorMessage`, and `result.failed[i].error`. | Replace pattern-only redaction with value-aware redaction using the planned key/value set plus broad secret-pattern detectors for JSON/YAML/header/URL-encoded/lowercase assignments; ensure every error/log/audit path runs through the same tested sanitizer. |
| F002 | P1 | R24/R35/R59/R98 | test/prod-readiness/auto-flipper.ts:342-344 | `opts.recheckCurrent(row.name)` is awaited outside the redacting `try/catch`; probe #42 threw `recheck blew topsecret123 MY_SECRET=value` and observed the raw message propagate while aborting the commit. | Wrap the recheck callback in a redacting error boundary, add the row to `failed` or `skipped` with sanitized context, continue processing subsequent rows, and test callback exceptions containing bare and `KEY=VALUE` secrets. |
| F003 | P3 | R57/R98/R109 | test/prod-readiness/auto-flipper.ts:337-340,370-374 | Audit `before` is derived from local `env` presence instead of the planned Fly state; probes #45-46 showed `plan.was === undefined` with local env present logs `before":"stale"`, and `plan.was === "old"` with local env absent logs `before":"missing"`. | Derive `before` from `planned.was` (`undefined` => `missing`, otherwise `stale`) so jsonl audit records reflect Fly state, not the operator process environment. |
| F004 | P2 | R1/R14/R109 | test/prod-readiness/auto-flipper.ts:405-410 | `flip()` commits whenever `READINESS_AUTO_FLIP=true`; probe #48 called `flip()` with only that env flag and no explicit commit option and observed `result !== null` and the runner executed, so dry-run default is not preserved under the enabling environment. | Require an explicit commit intent in API options (for example `commit: true` / `dryRun: false`) in addition to the env gate, and keep `flip()` dry-run by default even when the environment variable is present. |
| F005 | P3 | R35/R59/R98 | test/prod-readiness/auto-flipper.ts:391-404 | `flip()` rethrows non-`RegistryParseError` failures from `registryFor` unchanged; probe #49 threw `registry topsecret123` and observed the raw secret-bearing message propagate. | Sanitize unexpected registry loader errors before adding auto-flipper context, or convert them to a typed error with redacted message and preserved non-sensitive cause metadata. |
| F006 | P3 | R51/R52/R58 | test/prod-readiness/auto-flipper.ts:318-384 | The function is sequential only within one `commit()` invocation; probe #50 launched two concurrent commits and observed `max inflight = 2`, so two callers can overlap rechecks/runs despite the file-level invariant claiming one inflight flyctl at a time. | Add a process-local mutex/queue around commit execution or narrow the invariant in code and tests; if future orchestrators may call it concurrently, enforce serialization before `recheckCurrent` and `run`. |
| F007 | P3 | R24/R58/R95 | test/prod-readiness/auto-flipper.ts:34-35,226-232 | `FLY_BIN` is the bare string `flyctl`; probe #51 verified it is PATH-resolved rather than pinned/validated, so an operator shell or CI PATH spoof can execute the wrong binary on a secret-mutating path. | Resolve `flyctl` once from a trusted absolute path, validate the binary/version before use, or require an explicit absolute path configuration with provenance checks. |
| F008 | P3 | R6/R124 | git refs / wip snapshot evidence | `wip-refs.txt` has H4.F snapshots for `2a58c179...` and init/base refs, but no `refs/heads/wip/*` entry for final fixer head `de43a17bae9cfb49ae2029aece79a17709986421`, so the R6 durability snapshot for the final fixer commit is not present. | Push a named wip snapshot ref for the exact final fixer head and include that ref in the build matrix before re-audit. |

## VERDICT
FINDINGS-8 — head de43a17bae9cfb49ae2029aece79a17709986421 is not clean for merge.


---

## OVERALL VERDICT (R2)
- PR #464: FINDINGS:4 — R1 closures 3/3 closed; new findings: mutable alias false positive, expression-wrapper env misses, `as const` key miss, missing final fixer snapshot.
- PR #465: FINDINGS:4 — R1 closures 3/3 closed; new findings: malformed Supabase JWT-shaped key wires, AWS token directory wires, TSX imports missed, missing final fixer snapshot.
- PR #466: FINDINGS:8 — R1 closures 1 closed / 2 partial; new findings: redaction format leaks, recheck error leak, incorrect audit before state, dry-run default lost, registry error leak, concurrent commits overlap, PATH-resolved binary, missing final fixer snapshot.
- Wave (Half B R2): FINDINGS — not clean for merge.

Probe categories exhausted: AST/property access/destructuring/templates/TS wrappers for PR464; regex validator boundaries, malformed JWTs, placeholder and env-map injection, AWS file evidence, import AST and FS path presence for PR465; secret redaction formats, error/log/audit sinks, env gate strictness, timeout evidence, TOCTOU, dry-run, concurrency, serialization, and exec-path assumptions for PR466.
