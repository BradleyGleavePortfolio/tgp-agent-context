=== H4.A LENS B AUDIT VERDICT ===
SHA: 604ae7d746c6bff365f357161727556229a923ad
VERDICT: FINDINGS
FINDINGS_COUNT: 3
CRITICAL: 0
MAJOR: 2
MINOR: 1

## BUILD MATRIX
- main HEAD: ceaa759c103b27801a67a96601337342c3ab0e6c
- PR: #458 "feat: H4.A registry-loader for prod-switches.yml (R100)"
- PR base.sha (in): ceaa759c103b27801a67a96601337342c3ab0e6c
- PR head.sha (out): 604ae7d746c6bff365f357161727556229a923ad
- Auditor lens: B=GPT-5.5 (adversarial-engineering)
- Audit timestamp UTC: 2026-06-19T11:17:00Z
- Snapshot branches present: wip/h4a-init-snapshot at ceaa759c103b27801a67a96601337342c3ab0e6c; additional unrelated wip/* branches observed: wip/h1-fix-audit-findings-snapshot, wip/h1-fix-codeql-snapshot, wip/h1-fix-lefthook-snapshot, wip/h1-rebase-snapshot, wip/h2-fix-audit-findings-snapshot, wip/h2-fixer-snapshot, wip/h2-migration-grandfather-snapshot, wip/h3-init-snapshot, and older TM/PR snapshots.

## BUILD MATRIX — R124 / doctrine checks
| Rule | Status | Evidence |
| ---- | ------ | -------- |
| R124 pinned SHA | PASS | `git rev-parse HEAD` returned `604ae7d746c6bff365f357161727556229a923ad`; `gh pr view 458 --json headRefOid` returned the same head SHA. |
| Base freshness | PASS | `origin/main` is `ceaa759c103b27801a67a96601337342c3ab0e6c`; `git merge-base --is-ancestor origin/main HEAD` returned yes. |
| R3 identity | PASS | `git log --pretty='%H | %an <%ae> | %cn <%ce> | %s' ceaa759c..HEAD` showed commit `604ae7d7... | Bradley Gleave <bradley@bradleytgpcoaching.com> | Bradley Gleave <bradley@bradleytgpcoaching.com> | H4.A: registry-loader for prod-switches.yml (R100)`. Commit-message/body grep for `AI|Claude|Computer|Agent|Anthropic|Perplexity|Co-Authored-by` returned no hits. |
| R6 snapshot | PASS | `git ls-remote --heads origin 'wip/*'` includes `refs/heads/wip/h4a-init-snapshot` at `ceaa759c103b27801a67a96601337342c3ab0e6c`. |
| Scope | PASS | Changed files are exactly `package-lock.json`, `package.json`, `prod-switches.yml`, `test/prod-readiness/registry-loader.spec.ts`, `test/prod-readiness/registry-loader.ts`. |
| Source transplant | PASS | `git diff --quiet pr457:prod-switches.yml HEAD:prod-switches.yml` confirmed `prod-switches.yml` matches PR #457, and `wc -l` returned 1373. |
| CI state | PASS | `gh pr view --json statusCheckRollup` returned success for build-and-test, danger, R100.A1/A2/A3, CodeQL JS/TS, rls-floor-guard, rls-live-tests, mwb-3-live-tests, and size-label. |
| R23/R76 LOC | PASS | Independent numstat: package-lock +31 excluded; prod-switches.yml +1373 data-excluded per H4 split plan; package.json +3 and loader +129 = 132 prod LOC; spec +268 test LOC. If using the live R100.A3 workflow pathspec, test/** is counted and net is 397, still ≤400. |
| R74 test density | PASS | Treating `registry-loader.ts` as source: 268 test lines / 132 prod lines = 2.03. |
| R75 banned cast tokens | PASS | Added-line grep for `@ts-ignore`, `@ts-expect-error`, `as any`, `as unknown as`, `as never`, empty `.catch`, `Coming soon`, `TODO`, `John Doe`, `foo@bar`, and `lorem ipsum` returned no hits. |
| Local focused tests | INFRA NOTE | CI is green, but local `npm ci --ignore-scripts` timed out and left `node_modules/.bin/jest` absent; `npm test -- registry-loader --runInBand` therefore exited 127 locally. I used static review plus standalone parser probes against installed `js-yaml`/`zod` behavior instead of retrying the same install. |

## Adversarial probe summary
- Type-confusion probes for numeric/list/bool/null-like field values are rejected by Zod enum/string/boolean checks in `RegistryRowSchema` (`test/prod-readiness/registry-loader.ts:21-30`).
- Duplicate YAML keys are rejected by `js-yaml` with `YAMLException: duplicated mapping key` in the standalone probe.
- `!!python/object/apply` tags are rejected by `js-yaml` with `unknown tag`, so the Python-object injection class does not execute.
- UTF-8 BOM and CRLF inputs parse successfully, which is acceptable.
- Unicode lookalike env names (Greek Alpha in `ΑBC`) are rejected by the ASCII env-name regex at `test/prod-readiness/registry-loader.ts:23`.
- There is no shared cache or module-level mutable registry state; parallel callers get separately parsed objects.

## Findings detail

### MAJOR-1 — New dependencies use floating semver ranges, violating R114 reproducibility
- **Rule:** R114 — No floating versions.
- **Files/lines:** `package.json:51`, `package.json:67`.
- **Evidence:** This PR adds `"js-yaml": "^4.1.0"` and `"@types/js-yaml": "^4.0.9"`. R114 requires every dependency and devDependency to be an exact version with no `^`, `~`, or `*`.
- **Why it matters:** H4.A is adding the parser for the production-readiness registry. A floating parser dependency makes the parser semantics non-reproducible across installs, which is specifically dangerous for the YAML quirks this loader is meant to constrain.
- **Suggested remediation:** Pin exact versions in `package.json` and refresh the lockfile, e.g. `"js-yaml": "4.2.0"` to match the resolved lockfile and `"@types/js-yaml": "4.0.9"`.

### MAJOR-2 — Empty registry (`switches: []`) is accepted and validated as OK
- **Rule:** R108 / R100 prod-readiness registry completeness; Lens B partial-load requirement.
- **Files/lines:** `test/prod-readiness/registry-loader.ts:33`, `test/prod-readiness/registry-loader.ts:72-88`, `test/prod-readiness/registry-loader.spec.ts:158-160`.
- **Evidence:** `RegistrySchema` uses `z.array(RegistryRowSchema)` with no `.min(1)`, `validateRegistry()` only iterates rows and returns `ok: true` when there are no error findings, and the spec explicitly asserts that an empty switches array is accepted.
- **Why it matters:** A truncated or accidentally regenerated `prod-switches.yml` containing only `switches: []` passes the loader contract and the CLI validation path, even though the registry is supposed to be the complete source of truth for env-var-shaped switches. The real-file test currently catches the present file being reduced below >200 rows, but the loader itself still advertises an invalid empty registry as valid to downstream H4.B/H4.F consumers.
- **Suggested remediation:** Change the schema to `switches: z.array(RegistryRowSchema).min(1)` at minimum. Better: validate a baseline expectation for this seeded registry, such as `>= 200` rows or a required canonical sentinel row (`DATABASE_URL`), while keeping future discovery tests responsible for exact completeness.

### MINOR-1 — YAML anchors/aliases/merge keys are accepted, weakening one-row-one-record reviewability
- **Rule:** Lens B YAML parser quirks / duplicate-key hardening.
- **File/line:** `test/prod-readiness/registry-loader.ts:45`.
- **Evidence:** The loader uses `parseYaml(raw)` with the default `js-yaml` schema. A standalone probe showed this accepts a row like `- <<: *base` inside the `switches` array and materializes inherited `tier`, `prod_default`, `owner`, and `description` values before Zod validation.
- **Why it matters:** Schema validation still runs, so this is not an execution bug. The problem is reviewability: a future registry edit can hide meaningful production defaults in an anchor block and make individual switch rows no longer self-contained. For a safety registry that operators audit by diff, Stripe/Linear-style configuration should be boring and explicit.
- **Suggested remediation:** Reject anchors/aliases/merge keys for this file before parsing (for example, fail on `<<:`, `&name`, or `*name` tokens outside quoted strings), or parse with a schema/configuration that disables merge-key expansion. Add negative tests for anchor, alias, and merge-key inputs.

## Non-finding notes
- Path traversal through `name` is blocked by the `^[A-Z][A-Z0-9_]*$` regex. Other fields are currently not used as paths.
- Schema strictness rejects unknown top-level fields, including a future `version` field. That is acceptable for H4.A, but if schema versioning is desired later it must be added deliberately rather than slipped into YAML.
- The CLI prints raw errors (`console.error('Registry load failed:', err)`), which is acceptable for an internal test utility but could be polished later into structured `RegistryLoadError` / `RegistryValidationError` types with row-index context.

VERDICT: FINDINGS
