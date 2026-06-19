# H4.A Lens B Re-audit — Round 2

=== H4.A LENS B ROUND-2 AUDIT VERDICT ===
SHA: 0253861ff42c660dcbdd1181058d6b8347c7657f
VERDICT: FINDINGS
FINDINGS_COUNT: 1
CRITICAL: 0
MAJOR: 0
MINOR: 1

## BUILD MATRIX
- main HEAD: ceaa759c103b27801a67a96601337342c3ab0e6c
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100) [LOC-EXEMPT: all net lines are test-utility + spec under test/** which R76 excludes from the prod cap; genuine prod LOC = 0; CI A3 pathspec counts test/** so floor trips on the negative tests required by audit findings]"
- PR base.sha (in): ceaa759c103b27801a67a96601337342c3ab0e6c
- PR head.sha (out): 0253861ff42c660dcbdd1181058d6b8347c7657f
- Auditor lens: B=GPT-5.5 (adversarial-engineering)
- Audit timestamp UTC: 2026-06-19T13:04:00Z
- Snapshot branches present: wip/h4a-init-snapshot @ ceaa759c103b27801a67a96601337342c3ab0e6c; wip/h4a-fixer-snapshot-20260619T114514Z @ 604ae7d746c6bff365f357161727556229a923ad. Additional unrelated wip/* branches also exist.

## Round-2 result summary

The fixer closed the dependency-pinning, minimum-registry-size, and filename-enriched-error findings, but the YAML-indirection fix is bypassable with an explicit YAML merge tag. A row can inherit required fields through `!!merge "<<"` without a raw `<<:` line, anchor, or alias token, so the row is still not self-contained for diff review.

## Doctrine / build checks

| Rule / area | Status | Evidence |
| --- | --- | --- |
| R124 pinned SHA | PASS | Checked out `0253861ff42c660dcbdd1181058d6b8347c7657f`; `gh pr view 458 --json headRefOid` returned the same head. |
| Base freshness | PASS | `origin/main` is `ceaa759c103b27801a67a96601337342c3ab0e6c`; PR base is the same SHA. |
| R3 identity | PASS | Both PR commits are authored and committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Commit-message grep for `AI|Claude|Computer|Agent|Anthropic|Perplexity|Co-Authored-by` returned no hits. Added-file grep is noisy because `prod-switches.yml` is a registry of real env/integration names and comments; I did not find an authorship/co-author/LLM-vendor branding token in commit identity or messages. |
| R6 snapshots | PASS | `wip/h4a-init-snapshot` and `wip/h4a-fixer-snapshot-20260619T114514Z` exist at the expected pre-work/pre-fix SHAs. |
| CI | PASS | PR status rollup at head shows success for build-and-test, danger, Test density, Banned cast tokens, LOC budget, CodeQL JS/TS, size-label, rls-floor-guard, rls-live-tests, and mwb-3-live-tests. |
| R23/R76 LOC | PASS | Diff numstat: `package.json` +3, `package-lock.json` +34/-3, `prod-switches.yml` +1373, loader +225, spec +458. Excluding tests/lockfile and treating the seeded registry as H4 data leaves at most +3 manifest prod LOC, well under 400. The PR title includes the required `[LOC-EXEMPT: ...]` marker for the CI pathspec that counts `test/**`. |
| R74 test density | PASS | Conceptual ratio treating the loader as source is 458 spec LOC / 225 loader LOC = 2.04, above 2.0; CI A1 is green. |
| R75 banned-cast tokens | PASS | Added-line grep found no `@ts-ignore`, `@ts-expect-error`, `as any`, `as unknown as`, `as never`, empty `.catch`, `Coming soon`, `TODO`, `John Doe`, `foo@bar`, or `lorem ipsum` findings in the changed code surface. |
| R114 dependency pinning | PASS for PR-added deps | `js-yaml` is `4.2.0` and `@types/js-yaml` is `4.0.9` in `package.json`; root lockfile entries match. Other floating ranges such as `zod: ^4.4.3` are pre-existing and not introduced or modified by this PR. |
| Local focused tests | PASS with note | `npm ci --ignore-scripts` timed out before a clean-install completion, but the local `node_modules` contained the required packages. Running `node node_modules/jest/bin/jest.js registry-loader --runInBand` passed 48/48 tests. Focused TypeScript compile of the loader and spec exited 0. |

## Round-1 finding closure matrix with adversarial probes

### MAJOR-1 (R114): floating `js-yaml` / `@types/js-yaml`

Status: CLOSED.

Probes attempted:
- Checked `package.json`: `js-yaml` is exact `4.2.0`; `@types/js-yaml` is exact `4.0.9`.
- Checked `package-lock.json` root package and `node_modules/js-yaml`: resolved `js-yaml` is `4.2.0`; `@types/js-yaml` is `4.0.9`.
- Checked whether this PR introduced any other floating dependency: diff from base adds only the script plus these two deps; no other dependency line was added by this PR.
- Checked whole-package floating ranges adversarially: many pre-existing direct deps still float (including `zod: ^4.4.3`), but they are not PR-introduced or changed in this PR.

Result: no R114 re-open for the PR-added dependencies.

### MAJOR-2: empty/truncated `switches` array accepted

Status: CLOSED.

Observed `MIN_SWITCHES`: 200.

Probes attempted against `RegistrySchema.parse`:
- `switches: []` → rejected with `too_small`, minimum 200, message includes `empty or truncated registry is a guardrail bypass`.
- `switches: [1 row]` → rejected with the same guardrail-bypass message.
- `switches: [199 rows]` → rejected with the same guardrail-bypass message.
- `switches: [200 rows]` → accepted.
- Real `prod-switches.yml` → 223 rows, 0 error-severity validation findings.

Result: no bypass found. The 200-row floor is reasonable for a seeded 223-row registry because it catches empty/truncated files while allowing moderate legitimate shrinkage.

### MINOR-1: YAML anchors / aliases / merge keys accepted

Status: NOT FULLY CLOSED — see Finding F1.

Probes attempted:
- Anchor-like token inside quoted string (`"&fake"`, `"*fake"`) → passed, as desired; no false positive.
- Merge key with leading spaces (`    <<: *base`) → rejected with a `RegistryParseError` naming merge key and line number.
- Merge key with tab indentation (`\t<<: *base`) → rejected by the same merge-key guard.
- Alias/anchor tokens inside a `#` comment → passed, as desired; no false positive.
- Anchor with hyphen/digit (`&base-1`) → rejected by the anchor/alias guard.
- Benign YAML tag (`name: !!str TAG_STR`) → passed; no issue by itself.
- YAML tag forcing wrong type (`auto_flip_on_in_prod: !!str false`) → rejected by Zod as `expected boolean, received string`.
- Unicode escape for `&` inside a quoted string (`"\\u0026fake"`) → passed as a string; no false positive.
- Unicode escape for `&` used as an unquoted token in the TS probe string → became a literal `&base` before parsing and was rejected by the anchor guard.
- **Explicit YAML merge tag (`!!merge "<<": { tier: optional, prod_default: STUB_ALLOWED }`)** → **passed and materialized inherited fields into the row before Zod validation**. This bypasses the raw `^\s*<<\s*:` merge-key scan and uses no `&` or `*` token.

Result: original YAML-indirection finding remains open through a YAML-tag merge bypass.

### Lens A F1: `loadRegistry()` errors do not attach filename

Status: CLOSED.

Probes attempted:
- Zod field-type failure in `loadRegistry(path)` → threw `RegistryParseError` containing the filename, `switches.0.auto_flip_on_in_prod`, `expected boolean`, and `received string`.
- Required-field failure → filename and field name included.
- Truncated-registry floor failure → filename and guardrail-bypass message included.
- Empty-registry failure → filename and empty-registry message included.
- YAML parse failure before Zod → filename included along with js-yaml location text.
- YAML anchor guard failure before parsing → filename included along with the line-numbered guard message.

Result: no F1 bypass found.

### Regression check: new `RegistryParseError` export and utility code

Status: PASS except YAML-tag bypass.

- `RegistryParseError` is a stable `Error` subclass with `.name = 'RegistryParseError'` and is used consistently for `loadRegistry()` wrapping.
- `parseRegistry(raw)` remains file-system-free and pure.
- Helpers still do not mutate the registry.
- The new guard code is line-oriented and pre-parse, but it is incomplete because it only recognizes raw `<<:` merge keys, anchors, and aliases after stripping comments/quoted strings; js-yaml also honors explicit merge tags.

## Finding detail

### F1 — MINOR (P3): YAML merge-tag bypass keeps registry rows non-self-contained

**Rule:** Lens B YAML parser quirk / diff-reviewability; original MINOR-1 not fully closed.

**File/lines:** `test/prod-readiness/registry-loader.ts:67-86`, especially the raw merge-key regex at line 72 and anchor/alias regex at lines 78-80.

**Evidence:** The guard rejects only raw merge-key syntax matching `^\s*<<\s*:` plus raw anchor/alias tokens. This document passes `parseRegistry()` and produces a valid first row even though `tier` and `prod_default` are inherited rather than written as row-local fields:

```yaml
switches:
  - name: TAG_MERGE
    !!merge "<<": { tier: optional, prod_default: STUB_ALLOWED }
    auto_flip_on_in_prod: false
    owner: platform
    description: "x"
  # plus 199 ordinary filler rows to satisfy MIN_SWITCHES
```

Probe result: `yaml_tag_merge_key_no_alias.ok = true`; the first parsed row had `tier: "optional"` and `prod_default: "STUB_ALLOWED"` even though those fields were not explicit row-local keys.

**Why it matters:** This is the same reviewability defect as Round 1 MINOR-1. A production switch row can still hide meaningful defaults behind YAML-level indirection and pass Zod after js-yaml materializes the object.

**Suggested remediation:** Reject YAML tags for this registry entirely before parsing (e.g. fail on `(^|\s)![A-Za-z!][^\s]*` outside comments/strings), or parse with a JSON-compatible schema/configuration that does not support merge tags, then add a negative test for `!!merge "<<"`. The registry does not need YAML tags; a boring explicit subset is the safer contract.

## Artifacts saved

- `/home/user/workspace/h4a_round2_static_checks.txt`
- `/home/user/workspace/h4a_round2_r3_checks.txt`
- `/home/user/workspace/h4a_round2_probe.ts`
- `/home/user/workspace/h4a_round2_probe_results.json`
- `/home/user/workspace/h4a_round2_jest_registry_loader.log`
- `/home/user/workspace/h4a_round2_tsc_registry_loader.log`

VERDICT: FINDINGS
