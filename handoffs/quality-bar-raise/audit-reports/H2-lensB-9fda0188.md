## BUILD MATRIX
- main HEAD: e207cc02c8d58348783a6e3a0794377cc16b8251
- PR: #456 "ci: H2 — CI workflows, branch protection, and PR hygiene tooling (R102 R106 R107) [LOC-EXEMPT: 7 CI workflows + dangerfile + branch-protection script — infrastructure bootstrapping; cannot split further without shipping broken CI] [TEST-EXEMPT: net src is dangerfile.js Danger config — not unit-testable in isolation; validated by infra-lint workflow]"
- PR base.sha (in): e207cc02c8d58348783a6e3a0794377cc16b8251
- PR head.sha (out): 9fda01889ea03048973fb2be96d42330bd7b9050
- Auditor lens: B=GPT-5.5
- Audit timestamp UTC: 2026-06-19T09:36:00Z
- Snapshot branches present: wip/h2-fixer-snapshot @ c795c1123270eec4f28fea89832b975026ab76fb; wip/h2-migration-grandfather-snapshot @ 3d1300e71a86e5f271f3470ec9656ce963608abb

## Identity (R3)
Command run:

```bash
git log --pretty='%H | %an <%ae> | %s%n%b' e207cc02..9fda0188
```

Result: all PR commits are authored by `Bradley Gleave <bradley@bradleytgpcoaching.com>`.

Commit-message banned-token grep for `Claude|Anthropic|OpenAI|GPT|Computer|Agent|Perplexity|Co-Authored|Generated with|🤖|\bAI\b` returned no hits.

Added-line identity-token review did not find a newly added LLM/vendor identity token. Pre-existing base-branch comments containing banned words were not counted against this PR.

## Diff manifest

```text
 .github/CODEOWNERS                      |   22 +
 .github/workflows/danger.yml            |   38 ++
 .github/workflows/infra-lint.yml        |   97 +++
 .github/workflows/migration-dry-run.yml |  294 +++++++++
 .github/workflows/pr-checks-watcher.yml |  100 ++++
 .github/workflows/r100-quality-gate.yml |  198 ++++++
 .github/workflows/release-please.yml    |   29 +
 .github/workflows/sbom.yml              |   63 ++
 .gitignore                              |    4 +
 .release-please-config.json             |   27 +
 .release-please-manifest.json           |    3 +
 dangerfile.js                           |  137 +++++
 package-lock.json                       | 1000 ++++++++++++++++++++++++++++++-
 package.json                            |    1 +
 scripts/ci/check-relrowsecurity.sh      |    2 +-
 scripts/preflight.sh                    |    2 +-
 scripts/release.sh                      |    1 +
 scripts/setup-branch-protection.sh      |  140 +++++
 18 files changed, 2150 insertions(+), 8 deletions(-)
```

Numstat:

```text
22	0	.github/CODEOWNERS
38	0	.github/workflows/danger.yml
97	0	.github/workflows/infra-lint.yml
294	0	.github/workflows/migration-dry-run.yml
100	0	.github/workflows/pr-checks-watcher.yml
198	0	.github/workflows/r100-quality-gate.yml
29	0	.github/workflows/release-please.yml
63	0	.github/workflows/sbom.yml
4	0	.gitignore
27	0	.release-please-config.json
3	0	.release-please-manifest.json
137	0	dangerfile.js
994	6	package-lock.json
1	0	package.json
1	1	scripts/ci/check-relrowsecurity.sh
1	1	scripts/preflight.sh
1	0	scripts/release.sh
140	0	scripts/setup-branch-protection.sh
```

## LOC-EXEMPT honesty (R23/R76)
- Claimed exemption bucket: 7 CI workflows + dangerfile + branch-protection script.
- Actual bucket fit:
  - 7 CI workflows: `.github/workflows/danger.yml`, `infra-lint.yml`, `migration-dry-run.yml`, `pr-checks-watcher.yml`, `r100-quality-gate.yml`, `release-please.yml`, `sbom.yml`.
  - Danger config: `dangerfile.js`.
  - Branch protection script: `scripts/setup-branch-protection.sh`.
  - Other non-lock additions: `.github/CODEOWNERS` (+22), `.gitignore` (+4), `.release-please-config.json` (+27), `.release-please-manifest.json` (+3), `package.json` (+1), and three one-line shell lint fixes. These are infrastructure/config support files and not substantial product-code additions.
- No single CI workflow exceeds 300 added LOC. Largest is `.github/workflows/migration-dry-run.yml` at +294; next is `r100-quality-gate.yml` at +198.
- Exemption is directionally honest as infrastructure bootstrapping, but it does not cure the enforcement defects listed below.

## TEST-EXEMPT honesty (R74)
Executable/config surfaces reviewed:
- `dangerfile.js` (+137): Danger DSL / PR metadata checks; reasonable to validate through Danger dry-run rather than unit tests.
- `scripts/setup-branch-protection.sh` (+140): one-shot GitHub branch-protection setup using HTTP API calls; shellcheck/actionlint-style validation is typical, though API-mock tests would be possible.
- `scripts/ci/check-relrowsecurity.sh`, `scripts/preflight.sh`, `scripts/release.sh`: existing shell scripts with one-line lint fixes; shellcheck coverage is appropriate.
- Workflow YAML files: actionlint/shellcheck validate syntax and embedded shell, not unit-testable in ordinary app test suite.
- `.release-please-config.json`, `.release-please-manifest.json`, `.github/CODEOWNERS`, `.gitignore`, `package.json`: config/metadata, not app logic.

TEST-EXEMPT is not abused by product-code additions. I would still prefer fixture-based tests for reusable shell logic if these scripts grow, especially branch-protection payload generation.

## LOC tally
- Total diff: +2150 / -8 = net +2142.
- Lockfile excluded by doctrine: `package-lock.json` +994 / -6 = net +988.
- Net non-lock, non-doc prod/config LOC by R23 exclusion rules: +1156 / -2 = net +1154.
- The PR therefore depends on the `[LOC-EXEMPT: ...]` title marker.

## R75 banned-token results
Required added-line grep excluding `package-lock.json`:

```text
--- @ts-ignore ---
(none)
--- @ts-expect-error ---
(none)
--- as any ---
(none)
--- as unknown as ---
(none)
--- as never ---
(none)
--- Coming soon ---
(none)
--- lorem ipsum ---
(none)
--- John Doe ---
(none)
--- TODO ---
(none)
--- FIXME ---
(none)
empty-catch: (none)
```

Actual PR diff has no R75 added-line violation.

## Snapshots (R6)
`git ls-remote --heads origin 'wip/h2-*'` returned:

```text
c795c1123270eec4f28fea89832b975026ab76fb	refs/heads/wip/h2-fixer-snapshot
3d1300e71a86e5f271f3470ec9656ce963608abb	refs/heads/wip/h2-migration-grandfather-snapshot
```

## Migration grandfather clause: dual-branch analysis (R106)
Target file: `.github/workflows/migration-dry-run.yml`.

Intended logic:
1. Lines 86-111 detect migration changes and set `pr_touches_migrations=true|false`.
2. Lines 113-119 run `npx prisma migrate deploy` with `continue-on-error: true` so a later step can inspect the result.
3. Lines 121-139 should fail if the PR touches migrations and forward apply failed, but pass with warnings if the PR does not touch migrations and the failure is pre-existing base debt.
4. Lines 141-146 should run schema-vs-prisma diff only after successful forward apply.

Actual traced behavior:

### If PR touches migrations
- Detection uses `git diff --name-only --diff-filter=AMRC "$BASE_SHA"..."$HEAD_SHA" -- 'prisma/migrations/**'` at line 103.
- Added/modified/renamed/copied migration files set `PR_TOUCHES_MIGRATIONS=true`.
- However, the apply step is defective: it runs `set -o pipefail; npx prisma migrate deploy | tee ...; echo "exit_code=${PIPESTATUS[0]}" >> "$GITHUB_OUTPUT"` without `set -e` and without `exit ${PIPESTATUS[0]}`.
- A shell reproduction showed this pattern exits 0 even when the piped command exits 1: `script_exit=0`, `exit_code=1`.
- Therefore `steps.apply.outcome` is `success` even when `prisma migrate deploy` failed, so line 127 takes the success path and exits 0. The decision step does not hard-fail based on migration scope.
- The schema diff gate at line 145 is also mis-gated: because the apply step exits 0, `if: steps.apply.outcome == 'success'` is true even on failed forward apply. It can run against stale/empty/partial DB state.

### If PR does NOT touch migrations
- Detection sets `PR_TOUCHES_MIGRATIONS=false` only when AMRC files under `prisma/migrations/**` are absent.
- The same apply-step bug makes `APPLY_OUTCOME=success` even on forward-apply failure, so the warning path at lines 136-139 is not the real controlling behavior.
- The schema diff step still runs because the step outcome is success; this can fail unrelated PRs or generate noise, contrary to the stated grandfather clause.

### Additional anti-bypass problem: migration deletions
- The detection filter is `--diff-filter=AMRC`, which excludes deletions.
- A PR that only deletes `prisma/migrations/**` files is treated as `pr_touches_migrations=false` even though deletion is a migration touch and a high-risk regression.
- Reversibility only checks added `migration.sql` files (`--diff-filter=A` at line 204), and Danger only warns on migration deletions. No hard gate covers deleted migrations.

### Finding M1 — migration apply result is not enforced
`migration-dry-run.yml` lines 113-119 do not propagate the `prisma migrate deploy` exit code. This makes the decision step's `APPLY_OUTCOME` branch unreliable and makes the schema-vs-prisma gate run after failed forward apply. Rule impact: R106 and the task's explicit anti-bypass requirement. Fix: add `set -euo pipefail` and/or `exit "${PIPESTATUS[0]}"` after writing the output; use `steps.apply.outcome` or the explicit `exit_code` consistently.

### Finding M2 — migration deletion bypass
`migration-dry-run.yml` line 103 excludes deleted migration files from `pr_touches_migrations`. A PR that deletes a migration can be classified as not touching migrations and avoid hard failure. Rule impact: R106 migration integrity. Fix: include deletions in the touch detector, e.g. `--diff-filter=AMRCD` or no restrictive diff-filter, and add a hard-fail deletion policy unless explicitly operator-approved.

## Branch-protection script enforcement (R102)
Target file: `scripts/setup-branch-protection.sh`.

Positive checks:
- `enforce_admins: true` is set in the JSON payload at line 94.
- Required PR review settings include stale-review dismissal, code owner reviews, one approval, and last-push approval at lines 95-100.
- It validates `GH_REPO` before API URL interpolation at lines 61-66.
- It uses `GH_TOKEN` from environment and does not hardcode a token.
- It has no `--admin-bypass` flag.
- It is idempotent in the narrow sense that repeated runs apply the same full PUT payload; the script explicitly warns that the PUT is destructive/replacing.

### Finding B1 — required checks list does not match the actual CI matrix
The current PR has 13 successful check runs:

```text
New migrations are reversible (or explicitly marked IRREVERSIBLE)
shellcheck (scripts/*.sh)
build-and-test
danger
Banned cast tokens (R75 / R100.A2)
rls-floor-guard
rls-live-tests
Forward migration applies cleanly
LOC budget (R100.A3)
actionlint (.github/workflows/*.yml)
danger dry-run (dangerfile.js)
Test density (R100.A1)
mwb-3-live-tests
```

The branch-protection script requires only these checks at lines 70-83:

```text
build-and-test
rls-floor-guard
rls-live-tests
CodeQL
Forward migration applies cleanly
New migrations are reversible (or explicitly marked IRREVERSIBLE)
Banned cast tokens (R75 / R100.A2)
LOC budget (R100.A3)
Test density (R100.A1)
```

Problems:
- It omits current successful check `mwb-3-live-tests`.
- It omits the new H2 enforcement checks `danger`, `shellcheck (scripts/*.sh)`, `actionlint (.github/workflows/*.yml)`, and `danger dry-run (dangerfile.js)`.
- It requires `CodeQL`, but the current PR check list did not include a `CodeQL` check run. If no external/default CodeQL check exists with exactly that context, branch protection will block every PR.
- It requires migration jobs even though `.github/workflows/migration-dry-run.yml` only triggers for `prisma/migrations/**` or the workflow file itself. Required checks from path-skipped workflows can remain absent/pending, so non-migration PRs may be blocked by missing required migration checks. This directly undercuts the stated goal that zero-migration PRs pass through the grandfather clause.

Rule impact: R102 branch protection and R14 merge-gate integrity. Fix: align required checks to the actual always-run required matrix, remove/rename nonexistent contexts, and ensure every required workflow runs on every PR or use a stable aggregator check that always runs.

## dangerfile.js enforcement quality (R107)
Target file: `dangerfile.js`.

What it enforces with `fail()`:
- Conventional-commit PR title / latest commit subject (lines 45-72).
- Package/lockfile consistency (lines 86-94).
- Sensitive file additions (lines 96-100).

What it only warns about:
- Migration/auth/billing/RLS/webhook/rules risk markers (lines 24-43).
- Short PR body (lines 74-77).
- `BREAKING CHANGE:` body footer (lines 79-84).
- TODO/FIXME/XXX/HACK density (lines 102-123).

What it does not do:
- It does not compute LOC budget or flag LOC violators; that lives in `r100-quality-gate.yml`.
- It does not evaluate justification quality for `[LOC-EXEMPT]` or `[TEST-EXEMPT]`.
- It does not detect R3 identity violations in commits.
- It does not enforce R75 banned tokens directly; the old PR body claim that Danger warns on R75 tokens is stale.

This is not itself a separate doctrine failure if the hard gates cover the missing rules, but the hard gates do not fully cover R3 and R75 quality as noted below.

## Workflow enforcement quality

### `r100-quality-gate.yml`
This is a real workflow, not just `echo OK`; it has three jobs for banned-casts, LOC budget, and test density.

### Finding Q1 — R75 workflow is incomplete compared with doctrine
The `banned-casts` job only checks these literal tokens: `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, and `Coming soon` at lines 60-69. It omits required audit tokens/patterns including `@ts-expect-error`, `John Doe`, `lorem ipsum`, `TODO`, `FIXME`, and empty catches with parameters or whitespace such as `.catch(_=>{})` / `.catch(() => {})`. It also restricts the scan to `src/**/*.ts`, `src/**/*.tsx`, and `test/**/*.ts` at lines 75-78, missing production JS/config/script additions such as `dangerfile.js` or `scripts/**`. Rule impact: R75/R100.A2 enforcement is incomplete. Fix: make the workflow mirror the doctrine grep patterns over all added prod lines excluding lockfiles/docs/generated files.

### `loc-budget` and `test-density`
Both run real checks and fetch the live PR title via `gh pr view`. The LOC job hard-fails over 400 unless `[LOC-EXEMPT:]` is present. The test-density job computes ratio and honors `[TEST-EXEMPT:]`. Neither assesses exemption justification quality; that remains human-audit-only.

### `infra-lint.yml`
This runs real validation: shellcheck on `scripts/*.sh`, actionlint on workflow YAML, and Danger dry-run with `--failOnErrors`. Not just `echo OK`.

### `danger.yml`
Runs real Danger (`npx danger ci --dangerfile dangerfile.js`), but its hard enforcement is limited as described above.

### `rls-floor-guard.yml`, `banned-cast-tokens.yml`, `loc-budget.yml`, `test-density.yml`
These standalone workflow files are absent. RLS floor guard is an existing job inside `.github/workflows/ci.yml`; banned casts, LOC, and test density are jobs inside `r100-quality-gate.yml`.

## Verdict rationale
This PR has no direct R3 author violation and no actual R75 added-token hit in the current diff. The LOC and TEST exemptions are broadly honest for an infrastructure bootstrapping PR. However, it cannot be approved because the CI/branch-protection enforcement has material correctness defects:

1. `migration-dry-run.yml` does not propagate forward-migration failure from the apply step, so the grandfather-clause decision branch is not trustworthy and the schema diff is not actually gated on forward-apply success (Finding M1).
2. `migration-dry-run.yml` does not classify deleted migration files as migration touches, allowing a deletion-only migration PR to avoid the hard migration-touched path (Finding M2).
3. `scripts/setup-branch-protection.sh` requires an incomplete/mismatched status-check set and may require checks that are absent/path-skipped, causing either under-protection or permanent blocks (Finding B1).
4. `r100-quality-gate.yml` does not fully implement R75 patterns/scope (Finding Q1).

VERDICT: FINDINGS
