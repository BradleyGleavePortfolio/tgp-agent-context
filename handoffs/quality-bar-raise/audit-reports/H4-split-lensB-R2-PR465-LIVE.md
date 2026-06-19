# H4 Split Lens B R2 Live Audit — PR 465

STATUS: IN PROGRESS — sweep started 2026-06-19T17:36:16Z

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
Pending full R1-R126 table.

## NEW FINDINGS
| ID | Severity | Rule | File:line | Evidence | Proposed Fix |
|---|---|---|---|---|---|
| F001 | P2 | R31/R36/R40 | test/prod-readiness/provider-wiring.ts:145-156,234-310 | The Supabase service-role validator only checks `^eyJ...\....\....$`; probes #20/#22 accepted non-JSON/non-JWT-like strings such as `eyJbad.abc.def`, and probe #26 classified Supabase as WIRED when that malformed value was supplied with a URL. | Parse the JWT segments with base64url decoding, require valid JSON header/payload, require plausible Supabase service-role claims/issuer/audience as far as offline validation permits, and classify malformed tokens as STUB with tests for malformed-but-regex-shaped inputs. |
| F002 | P2 | R31/R40/R59 | test/prod-readiness/provider-wiring.ts:348-356,217-219 | `collectFileEvidence` uses `fs.existsSync` only, so a directory or other non-regular path satisfies `AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS`; probes #48-49 passed a directory path and observed AWS S3 classified as WIRED instead of STUB. | Replace existence-only evidence with `fs.statSync`/`lstatSync` plus `isFile()` and readable-access checks, handle errors explicitly, and report a diagnostic for non-file credential paths. |
| F003 | P2 | R31/R40/R80 | test/prod-readiness/provider-wiring.ts:431-451 | `collectImports` walks only files ending in `.ts` and excludes `.tsx`; probe #67 created `src/a.tsx` importing `stripe` and observed the provider import was missed, so React/TSX integration files can report NOT_USED. | Include `.tsx` in the TypeScript source scan while still excluding `.d.ts`; add fixtures proving providers imported from TSX components are detected. |

## VERDICT
Pending.
