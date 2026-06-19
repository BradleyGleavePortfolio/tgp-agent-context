# H4 Split Lens B R3 Live Audit - PR 466

STATUS: IN PROGRESS - sweep started 2026-06-19T18:33:53Z

## BUILD MATRIX (R124)
- main pre-work: 8467c6f568a51337a7acbfb14f72ac85b996d605
- final head: 3c8b8283a140754fc1767974c82cf1c15b3d34b8
- branch: wave-h4f-auto-flipper
- commits since main: 3, all Bradley Gleave <bradley@bradleytgpcoaching.com>
- net prod LOC: 0
- net test LOC: 2232
- test:src ratio: n/a, test-only scanner surface
- snapshots: refs/heads/wip/h4f-auto-flipper-fixer-r2-final-20260619 -> 3c8b8283a140754fc1767974c82cf1c15b3d34b8
- CI at audit time: 10/10 success
- R3 identity: pending branch-history sweep
- timestamp UTC: 2026-06-19T18:33:53Z

## R2 FINDINGS CLOSURE STATUS
| ID | Status | Evidence |
|---|---|---|
| F001 | Pending | To be re-derived from source. |
| F002 | Pending | To be re-derived from source. |
| F003 | Pending | To be re-derived from source. |
| F004 | Pending | To be re-derived from source. |
| F005 | Pending | To be re-derived from source. |
| F006 | Pending | To be re-derived from source. |
| F007 | Pending | To be re-derived from source. |
| F008 | Pending | To be re-derived from source. |

## R3 EXHAUSTIVE ADVERSARIAL SWEEP
| # | Category | Probe | Input | Expected | Observed | Status |
|---|---|---|---|---|---|---|
| F001 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:151-214,471-481 | The fallback redactor still leaks secret values when the raw error sink does not pass the plan value set. Independent probes showed `redactSecretValues` and `flyErrorMessage` preserve `topsecret123` for URL-encoded `MY_SECRET%3Dtopsecret123`, escaped JSON `{\"MY_SECRET\":\"topsecret123\"}`, raw nested JSON `{"outer":{"MY_SECRET":"topsecret123"}}`, and YAML block scalar `MY_SECRET: |\n  topsecret123`. `runFlyctl` routes stderr through `flyErrorMessage` without the plan literals, so a provider error in any of those formats can leak the value. | Make `flyErrorMessage` accept and require the plan literal set at call sites, and harden pattern redaction for URL-encoded separators, escaped JSON quotes, nested JSON fields, and YAML block scalars; add regression tests for every stderr/log format. |
| 1 | redaction | URL-encoded stderr | `MY_SECRET%3Dtopsecret123` | value removed | value remained | FAIL |
| 2 | redaction | escaped JSON stderr | `{\"MY_SECRET\":\"topsecret123\"}` | value removed | value remained | FAIL |
| 3 | redaction | raw nested JSON stderr | `{"outer":{"MY_SECRET":"topsecret123"}}` | value removed | value remained | FAIL |
| 4 | redaction | YAML block scalar stderr | `MY_SECRET: |` plus indented value | value removed | value remained | FAIL |

## DOCTRINE RULE COVERAGE (R1-R126)
Pending full table after both passes.

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P1 | R24/R35/R98/R110 | test/prod-readiness/auto-flipper.ts:151-214,471-481 | The fallback redactor still leaks secret values when the raw error sink does not pass the plan value set. Independent probes showed `redactSecretValues` and `flyErrorMessage` preserve `topsecret123` for URL-encoded `MY_SECRET%3Dtopsecret123`, escaped JSON `{\"MY_SECRET\":\"topsecret123\"}`, raw nested JSON `{"outer":{"MY_SECRET":"topsecret123"}}`, and YAML block scalar `MY_SECRET: |\n  topsecret123`. `runFlyctl` routes stderr through `flyErrorMessage` without the plan literals, so a provider error in any of those formats can leak the value. | Make `flyErrorMessage` accept and require the plan literal set at call sites, and harden pattern redaction for URL-encoded separators, escaped JSON quotes, nested JSON fields, and YAML block scalars; add regression tests for every stderr/log format. |

## VERDICT
Pending.
