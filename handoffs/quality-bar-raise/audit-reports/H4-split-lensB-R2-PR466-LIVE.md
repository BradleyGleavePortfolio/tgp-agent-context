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
