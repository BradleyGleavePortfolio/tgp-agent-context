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
