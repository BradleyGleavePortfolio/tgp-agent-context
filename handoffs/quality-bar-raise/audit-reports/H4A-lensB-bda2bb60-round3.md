# H4.A Lens B Round-3 Re-audit — PR #458

## BUILD MATRIX
- main HEAD: `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR: #458 `feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; CI A3 pathspec counts test/** so floor trips on the negative tests required by audit findings]`
- PR base.sha (in): `ceaa759c103b27801a67a96601337342c3ab0e6c`
- PR head.sha (out): `bda2bb608fecab53e5d455a071293261eb64cc53`
- Auditor lens: B=GPT-5.5 (adversarial engineering)
- Audit timestamp UTC: `2026-06-19T13:30:00Z`
- Snapshot branches present: `wip/h4a-init-snapshot` @ `ceaa759c103b27801a67a96601337342c3ab0e6c`; `wip/h4a-fixer-snapshot-20260619T114514Z` @ `604ae7d746c6bff365f357161727556229a923ad`; `wip/h4a-fixer-r2-snapshot-20260619T124955Z` @ `0253861ff42c660dcbdd1181058d6b8347c7657f`.

=== H4.A LENS B ROUND-3 VERDICT ===
SHA: bda2bb608fecab53e5d455a071293261eb64cc53
VERDICT: FINDINGS
FINDINGS_COUNT: 1
CRITICAL: 0
MAJOR: 0
MINOR: 1

## Summary

The narrow `!!merge "<<"` bypass from my round-2 report is now rejected with the documented `RegistryParseError` form, and the required quoted/comment/custom-tag/unicode/lone-bang probes were run. However, the new guard still does not reject YAML's verbatim tag syntax (`!<...>`). A verbatim `!<tag:yaml.org,2002:merge> "<<"` key bypasses the regex, materializes hidden `tier` and `prod_default` fields before Zod validation, and passes as a valid 200-row registry. This keeps the same diff-reviewability defect open through a different explicit tag form.

## Doctrine / build checks

| Rule / area | Status | Evidence |
| --- | --- | --- |
| R124 pinned SHA | PASS | Checked out `bda2bb608fecab53e5d455a071293261eb64cc53`; `gh pr view 458 --json headRefOid` returned the same head. `origin/main` and PR base are both `ceaa759c103b27801a67a96601337342c3ab0e6c`, so the PR is not stale. |
| R3 identity | PASS | `git log --pretty='%H \| %an <%ae> \| %cn <%ce> \| %s' origin/main..HEAD` shows all 3 PR commits authored and committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Commit-message banned-token grep for `AI|Claude|Computer|Agent|Anthropic|Perplexity|Co-Authored-by|OpenAI|GPT|Copilot` returned zero hits. Added-line AI-ish hits are registry data rows/descriptions for real switch names, not authorship/co-author trailers. |
| R6 durability | PASS | The three H4.A snapshot branches listed in the build matrix exist at the pre-work/pre-fix SHAs. |
| CI | PASS | PR status rollup at head shows 10/10 checks SUCCESS: `build-and-test`, `danger`, `Banned cast tokens (R75 / R100.A2)`, `CodeQL JS/TS`, `size-label`, `rls-floor-guard`, `LOC budget (R100.A3)`, `rls-live-tests`, `Test density (R100.A1)`, and `mwb-3-live-tests`. |
| R23/R76 LOC | PASS | Full PR numstat: `package.json` +3, `package-lock.json` +34/-3, `prod-switches.yml` +1373, loader +239, spec +512. Strict R23/R76 excludes `test/**`, lockfiles, docs/generated; treating `prod-switches.yml` as registry data leaves no material prod source LOC. The PR title carries the required `[LOC-EXEMPT: ...]` marker for the CI pathspec that counts `test/**`. Fixer R2 itself adds +19/-5 loader and +54 spec, all under `test/**`. |
| R74 test density | PASS | Conceptually treating the loader as source gives 512 spec LOC / 239 loader LOC = 2.14, above the 2.0 floor; CI A1 is green. |
| R75 banned casts / lazy tokens | PASS | Added-line grep found no `@ts-ignore`, `@ts-expect-error`, `as any`, `as unknown as`, `as never`, empty `.catch`, `Coming soon`, `TODO`, `John Doe`, `foo@bar.com`, or `lorem ipsum` findings in the changed code surface. |
| R100.A1/A2/A3 | PASS | All three quality-gate checks are green at `bda2bb60`; local recomputation for density, banned-token grep, and LOC matches the expected pass/exception shape. |
| R102 branch protection evidence | PASS | `scripts/setup-branch-protection.sh` exists and includes `enforce_admins: true`, `required_pull_request_reviews`, and `require_code_owner_reviews: true`. |
| R114 PR-added deps | PASS | `package.json` pins `js-yaml` to `4.2.0` and `@types/js-yaml` to `4.0.9`; root `package-lock.json` entries match. Pre-existing floating ranges remain out of this PR's dependency-add scope. |
| Conventional commit title | PASS | PR title starts with `feat:`. |
| Focused Jest | PASS | `node node_modules/jest/bin/jest.js test/prod-readiness/registry-loader.spec.ts --runInBand` passed 54/54 tests. |

## Closure-of-prior-findings matrix

| Prior finding / requirement | Round-3 status | Evidence |
| --- | --- | --- |
| Lens B round-2 exact `!!merge "<<"` probe | CLOSED for that exact spelling | `loadRegistry()` throws `RegistryParseError` with path prefix: `prod-switches registry "<tmp>/exact_round2_merge_tag_loadRegistry.yml" is invalid: registry uses YAML tags at line 3 — switch rows must be self-contained JSON-compatible YAML for diff-reviewability`. |
| Filename in validation errors | CLOSED | Existing F1 tests still pass; loadRegistry wraps guard/Zod/YAML errors with `prod-switches registry "<path>" is invalid: ...`. |
| `MIN_SWITCHES=200` truncation floor | CLOSED | Loader exports `MIN_SWITCHES = 200`; tests reject empty/1/199 rows and accept 200 rows. |
| `js-yaml` / `@types/js-yaml` pinned | CLOSED | PR-added dependency lines are exact: `"js-yaml": "4.2.0"`; `"@types/js-yaml": "4.0.9"`. |
| Raw `<<:` / `&anchor` / `*alias` forms | CLOSED | Probes throw `RegistryParseError` for raw merge key, anchor, and alias with line-numbered messages. |
| Real `prod-switches.yml` | PASS | `loadRegistry()` returns 223 switches and `errorFindings(validateRegistry(real))` is 0. |
| New YAML-tag guard | NOT FULLY CLOSED | It rejects `!!merge`, `!!str`, and `!custom-tag`, but misses verbatim tags `!<tag:yaml.org,2002:...>` and percent-encoded verbatim tags. See F1. |

## Adversarial probe results

| Probe | Expected | Result |
| --- | --- | --- |
| Exact round-2 `!!merge "<<"` via `loadRegistry()` | Throw exact documented YAML-tags form | PASS — `RegistryParseError`, path-enriched, line 3. |
| `description: "Some !! literal text"` | Pass | PASS — 200 rows parsed; description preserved. |
| `# !! comment with tags` | Pass | PASS — 200 rows parsed; no false positive. |
| `name: !!str FOO` value-position tag | Throw | PASS — `RegistryParseError: registry uses YAML tags at line 2 ...`. |
| `tier: !custom-tag optional` | Throw | PASS — `RegistryParseError: registry uses YAML tags at line 3 ...`. |
| Lone bang `tier: ! optional` | Either behavior; verify intent | PASSED. This matches the fixer's documented regex intent (`!`/`!!` followed by a tag-name letter), but it is another reason a simpler “reject any unquoted `!`” rule would be safer because real `prod-switches.yml` contains zero `!` characters. |
| Tag at column 0 (`!!str switches:`) | Throw | PASS — `RegistryParseError` at line 1. |
| Deeply indented tag (`inner: !!str x`) | Throw | PASS — `RegistryParseError` at line 8. |
| Quoted unicode escape `"\u0021\u0021merge literal text"` | Pass | PASS — parsed to description `!!merge literal text`; no false positive. |
| Unquoted unicode escape key `\u0021\u0021merge "<<"` | Reject by YAML parse or guard | PASS — rejected after parse by Zod as unrecognized key/missing required fields/floor; it did not materialize a merge. |
| Raw `<<:` merge key | Throw | PASS — `RegistryParseError` merge-key message at line 4. |
| Raw `&anchor` | Throw | PASS — `RegistryParseError` anchor/alias message at line 2. |
| Raw `*alias` | Throw | PASS — `RegistryParseError` anchor/alias message at line 1. |
| `!<tag:yaml.org,2002:str>` verbatim tag | Should throw if all explicit YAML tags are banned | FAIL — bypassed regex and parsed successfully when padded to 200 rows. |
| `!<tag:yaml.org,2002:merge> "<<"` verbatim merge tag | Should throw; same indirection risk as `!!merge` | FAIL — bypassed regex, materialized hidden `tier`/`prod_default`, and parsed successfully when padded to 200 rows. |
| `!<tag%3Ayaml.org%2C2002%3Astr>` / `!<tag%3Ayaml.org%2C2002%3Amerge>` | Should throw if all explicit YAML tags are banned | FAIL — both bypassed regex and parsed successfully when padded to 200 rows. |
| Real `prod-switches.yml` | Pass | PASS — 223 switches, 0 error findings. |

## Finding detail

### F1 — MINOR (P3): Verbatim YAML tags bypass the new tag rejection guard

**File/lines:** `test/prod-readiness/registry-loader.ts:90-98`, especially line 94:

```ts
const tagLine = code.findIndex((line) => /(^|\s)!{1,2}[A-Za-z]/.test(line));
```

**Evidence:** The guard only recognizes `!tag` / `!!tag` when the bang(s) are immediately followed by an ASCII letter. YAML also supports verbatim tag notation with angle brackets. This padded registry passes `parseRegistry()` and produces a valid first row even though `tier` and `prod_default` are hidden behind a YAML-level merge tag:

```yaml
switches:
  - name: VERBATIM_MERGE
    !<tag:yaml.org,2002:merge> "<<": { tier: optional, prod_default: STUB_ALLOWED }
    auto_flip_on_in_prod: false
    owner: platform
    description: "x"
  # plus 199 ordinary filler rows to satisfy MIN_SWITCHES
```

Observed result:

```json
{
  "name": "verbatim_merge_tag_padded",
  "ok": true,
  "firstRow": {
    "name": "VERBATIM_MERGE",
    "tier": "optional",
    "prod_default": "STUB_ALLOWED",
    "auto_flip_on_in_prod": false,
    "owner": "platform",
    "description": "x"
  },
  "switchCount": 200,
  "errorFindings": 0
}
```

The percent-encoded verbatim form also passes:

```yaml
!<tag%3Ayaml.org%2C2002%3Amerge> "<<": { tier: optional, prod_default: STUB_ALLOWED }
```

**Why it matters:** This is the same reviewability defect as the round-2 `!!merge "<<"` bypass. A production switch row can still inherit meaningful required fields from YAML tag resolution before Zod validation, so a line-by-line reviewer does not see a self-contained row.

**Suggested remediation:** Because the real `prod-switches.yml` has zero `!` characters, reject any unquoted/comment-stripped bang token before parsing, not just `!` followed by a letter. A stricter safe pattern would fail on `(^|[\s\[\{:,])!` after stripping comments and quoted strings, or explicitly include verbatim tags (`!<...>`) and handles. Add negative tests for `!<tag:yaml.org,2002:merge> "<<"`, `!<tag%3Ayaml.org%2C2002%3Amerge> "<<"`, and `!<tag:yaml.org,2002:str> VALUE`; keep the quoted/comment positive tests.

## Artifacts saved

- `/home/user/workspace/h4a_round3_lensB_pr_checks.txt`
- `/home/user/workspace/h4a_round3_lensB_static_checks.txt`
- `/home/user/workspace/h4a_round3_lensB_r102_checks.txt`
- `/home/user/workspace/h4a_round3_lensB_probe.ts`
- `/home/user/workspace/h4a_round3_lensB_probe_results.json`
- `/home/user/workspace/h4a_round3_lensB_probe_verbatim.ts`
- `/home/user/workspace/h4a_round3_lensB_probe_verbatim_results.json`
- `/home/user/workspace/h4a_round3_lensB_jest_registry_loader.log`

VERDICT: FINDINGS
