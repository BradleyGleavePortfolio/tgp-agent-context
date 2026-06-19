# H4.A Lens B Round-4 Final Re-audit — PR #458

## BUILD MATRIX
- main HEAD: `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 `feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; CI A3 pathspec counts test/** so floor trips on the negative tests required by audit findings]`
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR head.sha (out): `8e8ffd58f87f29f3a2389fb1d488e5950962413c`
- Auditor lens: B=GPT-5.5 (adversarial engineering)
- Audit timestamp UTC: `2026-06-19T14:04:46Z`
- Snapshot branches present: `wip/h4a-init-snapshot` @ `ceaa759c103b27801a67a96601337342c3ab0e6c`; `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d746c6bff365f357161727556229a923ad`; `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861ff42c660dcbdd1181058d6b8347c7657f`; `wip/h4a-fixer-r3-snapshot-20260619T134343Z` @ `bda2bb608fecab53e5d455a071293261eb64cc53`.

=== H4.A LENS B ROUND-4 VERDICT ===
SHA: 8e8ffd58f87f29f3a2389fb1d488e5950962413c
VERDICT: CLEAN
FINDINGS_COUNT: 0
CRITICAL: 0
MAJOR: 0
MINOR: 0
PRIOR FINDINGS CLOSED: 5 / 5
STRIPPER PROBES: 31 total; BYPASSES_FOUND: 0; SAFE_OVER_REJECTIONS: 5; REAL_DATA_FALSE_POSITIVES: 0
CI: 10 / 10 SUCCESS
FOCUSED TESTS: 58 / 58 PASS

## Summary

I re-audited PR #458 independently at `8e8ffd58f87f29f3a2389fb1d488e5950962413c` and focused on the only remaining attack surface: whether `stripCommentsAndStrings()` can hide an actual YAML tag from the strict `line.includes('!')` post-strip rule. I found no bypass. Every ASCII `!` tag form that is outside a same-line single/double-quoted scalar or comment is rejected before `js-yaml` can resolve it, including the prior `!!merge`, verbatim `!<...>`, percent-encoded verbatim, custom-tag, type-tag, and lone-bang cases.

The stripper is intentionally not a full YAML lexer: multi-line quoted strings, block scalars, and escaped double quotes can be over-rejected when they contain `!`. I do not count that as a merge-blocking finding for H4.A because the over-rejections are safe (no hidden tag materializes), the real `prod-switches.yml` has zero `!` characters and loads clean, and the registry is explicitly constrained to self-contained JSON-compatible YAML for diff review.

## Doctrine / build checks

| Rule / area | Status | Evidence |
| --- | --- | --- |
| R124 pinned SHA / staleness | PASS | Local `git rev-parse HEAD` and `gh pr view 458 --json headRefOid` both returned `8e8ffd58f87f29f3a2389fb1d488e5950962413c`; `origin/main` and PR base are both `ceaa759c103b27801a67a96601337342c3ab0e6c`, and `origin/main` is an ancestor of head. Final SHA re-check also matched. |
| R3 identity | PASS | `git log --pretty='%H | %an <%ae> | %cn <%ce> | %s' BASE..HEAD` shows all 4 PR commits authored and committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Commit-message banned-token grep returned zero hits. Added-line AI/vendor-token hits are registry data rows/descriptions for real switch names, not authorship branding or co-author trailers. |
| R6 durability | PASS | The four H4.A snapshot branches listed in the build matrix exist, including the round-4 pre-fix snapshot `wip/h4a-fixer-r3-snapshot-20260619T134343Z` at `bda2bb60`. |
| CI | PASS | `gh pr checks 458` reports 10/10 pass: `build-and-test`, `danger`, `Banned cast tokens (R75 / R100.A2)`, `CodeQL JS/TS`, `size-label`, `rls-floor-guard`, `LOC budget (R100.A3)`, `rls-live-tests`, `Test density (R100.A1)`, and `mwb-3-live-tests`. |
| R23/R76 LOC | PASS | Full PR numstat: `package-lock.json` +34/-3, `package.json` +3, `prod-switches.yml` +1373, spec +560, loader +243. Strict source-code cap excludes `test/**` and lockfiles; the large YAML registry is data, not executable prod source. The `[LOC-EXEMPT]` marker is genuine for CI's broader pathspec. |
| R74 test density | PASS | Re-derived loader/spec line counts: loader 243, spec 560, ratio `560 / 243 = 2.3045`, above the 2.0 floor. |
| R75 banned casts / lazy tokens | PASS | Added-line grep found no `@ts-ignore`, invalid `@ts-expect-error`, `as any`, `as unknown as`, `as never`, empty `.catch`, placeholder UI literals, or authorship-branding tokens in changed code. Registry-data hits for `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, and `PERPLEXITY_API_KEY` are legitimate switch rows. |
| R100.A1/A2/A3 | PASS | All three R100 quality-gate checks are green at head; local line-ratio, banned-token, and LOC recomputation match the pass/exception shape. |
| R102 branch protection evidence | PASS | `scripts/setup-branch-protection.sh` exists and includes `required_status_checks`, `enforce_admins: true`, `required_pull_request_reviews`, and `require_code_owner_reviews: true`. |
| R114 PR-added deps | PASS | `package.json` pins `js-yaml` to `4.2.0` and `@types/js-yaml` to `4.0.9`; root `package-lock.json` and `node_modules/*` lock entries match those exact versions. Pre-existing floating ranges outside this PR remain out of scope. |
| Conventional commits | PASS | All PR commit subjects and the PR title use conventional/purposeful forms; the PR title starts with `feat:`. |
| Focused Jest | PASS | `node node_modules/jest/bin/jest.js test/prod-readiness/registry-loader.spec.ts --runInBand` passed 58/58 tests. |
| Strict TypeScript | PASS | `node node_modules/typescript/bin/tsc --noEmit --strict --esModuleInterop --module commonjs --target es2020 --types node,jest test/prod-readiness/registry-loader.ts test/prod-readiness/registry-loader.spec.ts` exited 0. |
| Real registry | PASS | `prod-switches.yml` loaded with 223 switches, `errorFindings(validateRegistry(real)) = 0`, and ASCII `!` count = 0. |

## Closure-of-prior-findings matrix

| Prior finding / requirement | Round-4 status | Evidence |
| --- | --- | --- |
| Lens A R1 F1 — validation errors must cite filename | CLOSED | `loadRegistry()` still wraps guard, YAML, and Zod failures in `RegistryParseError` messages prefixed with `prod-switches registry "<path>" is invalid: ...`; focused tests for bad bool, missing owner, floor, and empty file pass. |
| Lens B R1 MAJOR-1 — `js-yaml` / `@types/js-yaml` floating deps | CLOSED | PR-added dependency lines and lockfile root entries are exact: `js-yaml: 4.2.0`, `@types/js-yaml: 4.0.9`. |
| Lens B R1 MAJOR-2 — empty/truncated registry accepted | CLOSED | `MIN_SWITCHES = 200`; empty and one-row probes reject, and the 200-row boundary probe passes. |
| Lens B R2 F1 — shorthand `!!merge "<<"` bypass | CLOSED | Exact shorthand merge-tag probe throws `RegistryParseError: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`. |
| Lens B R3 F1 — verbatim `!<tag:yaml.org,2002:merge>` tag bypass | CLOSED | Verbatim and percent-encoded verbatim merge probes both throw the same pre-parse YAML-tags error at line 3; hidden `tier`/`prod_default` no longer materialize. |

## Stripper-bypass probe results table (Lens B)

Probe harness: `/home/user/workspace/h4a_round4_lensB_probe.js`; raw JSON results: `/home/user/workspace/h4a_round4_lensB_probe_results.json`.

Counts: total `31`, parse pass `13`, parse reject `18`, load pass `13`, load reject `18`, pre-parse `RegistryParseError` rejects `14`, bypasses `0`.

| Probe | Category | Expected | parseRegistry result | loadRegistry result |
| --- | --- | --- | --- | --- |
| `real_prod_switches` | real data | PASS: real file has 223 rows and zero ! chars | PASS — 223 rows, errorFindings=0 | PASS — 223 rows, errorFindings=0 |
| `r2_exact_shorthand_merge` | prior bypass | THROW: raw !!merge tag | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-2vLiJJ/r2_exact_shorthand_merge.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-... |
| `r3_verbatim_merge` | prior bypass | THROW: verbatim merge tag | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-ib0jUW/r3_verbatim_merge.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compati... |
| `r3_percent_verbatim_merge` | prior bypass | THROW: percent-encoded verbatim merge tag | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-9vikkt/r3_percent_verbatim_merge.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON... |
| `single_bang_custom_tag` | tag forms | THROW: !custom-tag value | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-AkRHJ3/single_bang_custom_tag.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-co... |
| `double_bang_str` | tag forms | THROW: !!str tag | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 2 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-jFWDf6/double_bang_str.yml" is invalid: registry uses YAML tags at line 2 — switch rows must be self-contained JSON-compatibl... |
| `lone_unquoted_bang` | tag forms | THROW: strict rule catches lone ! before Zod | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-ZkkkRk/lone_unquoted_bang.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compat... |
| `quoted_double_bang_description` | positive prior | PASS: !! in double-quoted string is stripped | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `comment_bang` | positive prior | PASS: !! after # comment is stripped | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `hash_inside_double_quote` | comment edge | PASS: # inside quotes is not comment; !! still string content | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `hash_inside_single_quote` | comment edge | PASS: # inside single quotes is not comment; !! still string content | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `single_quoted_merge_text` | quoted strings | PASS: single-quoted !!merge text | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `double_quoted_merge_text` | quoted strings | PASS: double-quoted !!merge text | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `double_quote_yaml_escape_bang` | YAML escapes | PASS: YAML 1.2 double-quoted escapes decode to literal !! string, not a tag | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `unicode_escape_bang` | YAML escapes | PASS: unicode escapes decode to literal !! string, not a tag | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `unquoted_backslash_u_bang` | YAML escapes | PASS: plain scalar keeps backslashes literally; no ! exists | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `multiline_double_quoted_bang` | multi-line quoted string | SAFE THROW/FALSE POSITIVE: !! is inside YAML string but line-by-line stripper sees it | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 8 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-2ZAQqX/multiline_double_quoted_bang.yml" is invalid: registry uses YAML tags at line 8 — switch rows must be self-contained J... |
| `multiline_double_quoted_fold_escape` | multi-line quoted string | SAFE THROW/FALSE POSITIVE: continuation content is string but stripper is stateless | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 8 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-rUVAtj/multiline_double_quoted_fold_escape.yml" is invalid: registry uses YAML tags at line 8 — switch rows must be self-cont... |
| `block_literal_bang` | block scalar | SAFE THROW/FALSE POSITIVE: block scalar content is string but stripper lacks block state | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 8 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-tNAjrY/block_literal_bang.yml" is invalid: registry uses YAML tags at line 8 — switch rows must be self-contained JSON-compat... |
| `block_folded_bang` | block scalar | SAFE THROW/FALSE POSITIVE: folded block scalar content is string but stripper lacks block state | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 8 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-NC79Ok/block_folded_bang.yml" is invalid: registry uses YAML tags at line 8 — switch rows must be self-contained JSON-compati... |
| `escaped_quote_then_bang_in_double_quote` | quoted strings | SAFE THROW/FALSE POSITIVE: escaped quote confuses stripper but does not hide a real tag | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML tags at line 7 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-4VCrpm/escaped_quote_then_bang_in_double_quote.yml" is invalid: registry uses YAML tags at line 7 — switch rows must be self-... |
| `doubled_single_quote_then_bang` | quoted strings | PASS: YAML doubled single quote keeps !! inside stripped quote state | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `fullwidth_bang_in_description` | unicode lookalike | PASS: U+FF01 is a string character, not YAML tag indicator | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |
| `fullwidth_bang_fake_tag_key` | unicode lookalike | THROW by Zod strict/missing, not guard; no hidden YAML tag materializes | THROW — ZodError, RegistryParseError=False; [ | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-FmzYag/fullwidth_bang_fake_tag_key.yml" is invalid: |
| `small_exclamation_mark_fake_tag_key` | unicode lookalike | THROW by Zod/YAML, not guard; U+FE15 not ASCII tag indicator | THROW — ZodError, RegistryParseError=False; [ | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-NV1vAO/small_exclamation_mark_fake_tag_key.yml" is invalid: |
| `raw_merge_key_regression` | prior findings | THROW: raw << merge key | THROW — RegistryParseError, RegistryParseError=True; registry uses a YAML merge key (<<:) at line 3 — switch rows must be self-contained for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-AnUzQx/raw_merge_key_regression.yml" is invalid: registry uses a YAML merge key (<<:) at line 3 — switch rows must be self-co... |
| `anchor_regression` | prior findings | THROW: anchor definition | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML anchors/aliases (&name / *name) at line 1 — switch rows must be self-contained for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-xfUy6d/anchor_regression.yml" is invalid: registry uses YAML anchors/aliases (&name / *name) at line 1 — switch rows must be ... |
| `alias_regression` | prior findings | THROW: alias reference | THROW — RegistryParseError, RegistryParseError=True; registry uses YAML anchors/aliases (&name / *name) at line 1 — switch rows must be self-contained for diff-reviewability | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-GHBF1N/alias_regression.yml" is invalid: registry uses YAML anchors/aliases (&name / *name) at line 1 — switch rows must be s... |
| `empty_switches` | prior findings | THROW: empty/truncated registry floor | THROW — ZodError, RegistryParseError=False; [ | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-oxBpVT/empty_switches.yml" is invalid: |
| `one_switch` | prior findings | THROW: one row below floor | THROW — ZodError, RegistryParseError=False; [ | THROW — RegistryParseError, RegistryParseError=True; prod-switches registry "/tmp/h4a-r4-probe-2UE1RB/one_switch.yml" is invalid: |
| `at_floor_200` | prior findings | PASS: exactly MIN_SWITCHES rows | PASS — 200 rows, errorFindings=0 | PASS — 200 rows, errorFindings=0 |

### Probe interpretation

- No malicious probe hid an ASCII `!` from the guard and then passed validation.
- Same-line quoted strings and comments remain correctly stripped: prior positives, `#` inside single/double quotes, single quotes, double quotes, and YAML double-quoted `\x21` / `\u0021` escapes all pass when the `!` is only string content.
- Multi-line double-quoted strings, block literal/folded scalars, and escaped double quotes are conservatively rejected if their string content contains `!`; these are safe over-rejections, not indirection bypasses.
- Unicode lookalikes (`U+FF01`, `U+FE15`) do not normalize to ASCII `!` in `js-yaml`; they either remain harmless string content or are rejected by strict Zod schema if used as fake keys.

## Artifacts saved

- `/home/user/workspace/h4a_round4_lensB_pr_checks.txt`
- `/home/user/workspace/h4a_round4_lensB_static_checks.txt`
- `/home/user/workspace/h4a_round4_lensB_r102_final_sha.txt`
- `/home/user/workspace/h4a_round4_lensB_probe.js`
- `/home/user/workspace/h4a_round4_lensB_probe_results.json`
- `/home/user/workspace/h4a_round4_lensB_probe_results_stdout.json`
- `/home/user/workspace/h4a_round4_lensB_jest_registry_loader.log`
- `/home/user/workspace/h4a_round4_lensB_tsc.log`
- `/home/user/workspace/h4a_round4_lensB_real_registry_bang_check.txt`

VERDICT: CLEAN
