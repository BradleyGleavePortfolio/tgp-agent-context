# H4 Split Lens B R2 Live Audit — PR 466

STATUS: IN PROGRESS — sweep started 2026-06-19T17:36:25Z

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
Pending full R1-R126 table.

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:51-58,281-290,376-380 | The redactor only handles uppercase `KEY=VALUE` runs; probes #11-18/#20/#23/#25/#40-41 leaked quoted assignment values (`KEY='value'`/`KEY="value"`), JSON/YAML/header/URL-encoded/lowercase forms, bare values, and space-containing values through `redactSecretValues`, `flyErrorMessage`, and `result.failed[i].error`. | Replace pattern-only redaction with value-aware redaction using the planned key/value set plus broad secret-pattern detectors for JSON/YAML/header/URL-encoded/lowercase assignments; ensure every error/log/audit path runs through the same tested sanitizer. |
| F002 | P1 | R24/R35/R59/R98 | test/prod-readiness/auto-flipper.ts:342-344 | `opts.recheckCurrent(row.name)` is awaited outside the redacting `try/catch`; probe #42 threw `recheck blew topsecret123 MY_SECRET=value` and observed the raw message propagate while aborting the commit. | Wrap the recheck callback in a redacting error boundary, add the row to `failed` or `skipped` with sanitized context, continue processing subsequent rows, and test callback exceptions containing bare and `KEY=VALUE` secrets. |
| F003 | P3 | R57/R98/R109 | test/prod-readiness/auto-flipper.ts:337-340,370-374 | Audit `before` is derived from local `env` presence instead of the planned Fly state; probes #45-46 showed `plan.was === undefined` with local env present logs `before":"stale"`, and `plan.was === "old"` with local env absent logs `before":"missing"`. | Derive `before` from `planned.was` (`undefined` => `missing`, otherwise `stale`) so jsonl audit records reflect Fly state, not the operator process environment. |
| F004 | P2 | R1/R14/R109 | test/prod-readiness/auto-flipper.ts:405-410 | `flip()` commits whenever `READINESS_AUTO_FLIP=true`; probe #48 called `flip()` with only that env flag and no explicit commit option and observed `result !== null` and the runner executed, so dry-run default is not preserved under the enabling environment. | Require an explicit commit intent in API options (for example `commit: true` / `dryRun: false`) in addition to the env gate, and keep `flip()` dry-run by default even when the environment variable is present. |

## VERDICT
Pending.
