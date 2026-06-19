## BUILD MATRIX
- main HEAD: e207cc02c8d58348783a6e3a0794377cc16b8251
- PR: #456 "ci: H2 — CI workflows, branch protection, and PR hygiene tooling (R102 R106 R107) [LOC-EXEMPT: 7 CI workflows + dangerfile + branch-protection script — infrastructure bootstrapping; gate/protection/danger bulk cannot be split without shipping broken CI; sbom + release-please are bundled here for atomic infra-rollout convenience] [TEST-EXEMPT: net src is dangerfile.js Danger config — not unit-testable in isolation; validated by infra-lint workflow]"
- PR base.sha (in): e207cc02c8d58348783a6e3a0794377cc16b8251
- PR head.sha (out): c9511b7c06f2ac6fe962c60e979c4a38f8220840
- Auditor lens: B=GPT-5.5
- Audit timestamp UTC: 2026-06-19T10:13:15Z
- Snapshot branches present:
  - refs/heads/wip/h2-fix-audit-findings-snapshot @ 9fda01889ea03048973fb2be96d42330bd7b9050
  - refs/heads/wip/h2-fixer-snapshot @ c795c1123270eec4f28fea89832b975026ab76fb
  - refs/heads/wip/h2-migration-grandfather-snapshot @ 3d1300e71a86e5f271f3470ec9656ce963608abb

## CI / merge state
- Re-polled PR #456 at 2026-06-19T10:13:15Z: mergeStateStatus=CLEAN.
- Head SHA remained c9511b7c06f2ac6fe962c60e979c4a38f8220840.
- 13/13 status checks were COMPLETED/SUCCESS:
  - build-and-test
  - danger
  - shellcheck (scripts/*.sh)
  - Forward migration applies cleanly
  - Banned cast tokens (R75 / R100.A2)
  - rls-floor-guard
  - actionlint (.github/workflows/*.yml)
  - New migrations are reversible (or explicitly marked IRREVERSIBLE)
  - LOC budget (R100.A3)
  - rls-live-tests
  - danger dry-run (dangerfile.js)
  - Test density (R100.A1)
  - mwb-3-live-tests
- Base is an ancestor of head: yes.

## R3 identity check
- Command basis: `git log --pretty='%H | %an <%ae> | %s' e207cc02..c9511b7c`.
- All 20 commits in the PR range are authored by `Bradley Gleave <bradley@bradleytgpcoaching.com>`.
- Commit-message/vendor-token pass: no word-token hits for `AI`, `Claude`, `Computer`, `Agent`, `Anthropic`, `Perplexity`, or `Co-Authored-by` in commit messages/bodies.
- Added-content token sweep produced no LLM-branding hits. One apparent `AI` occurrence was inside a package-lock integrity hash (`package-lock.json:10041`), categorized as non-semantic hash data, not a branding token.

## LOC / exemption note
- Net added lines from `git diff --numstat e207cc02..c9511b7c`: 2,240 total added.
- Lockfile excluded lines: 994 (`package-lock.json`).
- Net prod added before LOC exemption: 1,246.
- The PR title carries a detailed `[LOC-EXEMPT: ...]` marker for bundled CI/bootstrap work. I accept the exemption: this PR is infrastructure bootstrapping across CI workflows, Danger, and branch protection; splitting would leave partial gates/protection in a broken or unenforced state.
- The PR title carries `[TEST-EXEMPT: ...]` for Danger/config code, with validation by infra-lint/actionlint/shellcheck/Danger dry-run. I accept the exemption.

## M1 line-by-line trace — prisma exit code through tee
Target file: `.github/workflows/migration-dry-run.yml` lines 128-139.

Actual sequence:
```bash
set -euo pipefail
set +e
npx prisma migrate deploy 2>&1 | tee migrate_deploy.log
rc=${PIPESTATUS[0]}
set -e
echo "exit_code=$rc" >> "$GITHUB_OUTPUT"
exit "$rc"
```

Verification:
- `set -euo pipefail` is present before the command.
- `set +e` is present before the piped prisma command, so bash does not terminate before `PIPESTATUS` is read when prisma fails under `pipefail`.
- The command is the expected pipe form: `npx prisma migrate deploy 2>&1 | tee migrate_deploy.log`; stdout/stderr are piped into `tee`, so `PIPESTATUS[0]` corresponds to prisma and `PIPESTATUS[1]` corresponds to tee.
- `rc=${PIPESTATUS[0]}` captures prisma's exit status rather than tee's.
- `set -e` is restored after capture. `set -u` remains enabled throughout and does not introduce a nounset issue because `rc` is assigned before use.
- `exit "$rc"` is present, so the step outcome reflects prisma's exit code instead of the final echo's success.
- Local simulation of the same pipe pattern captured `prisma_exit=0 captured_rc=0`, `prisma_exit=1 captured_rc=1`, and `prisma_exit=2 captured_rc=2`.

Downstream gate:
- The decision step gates on `steps.apply.outcome`, exposed as `APPLY_OUTCOME: ${{ steps.apply.outcome }}` at lines 141-159, not solely on `steps.apply.outputs.exit_code`.
- Because `continue-on-error: true` is on the apply step, `steps.apply.outcome` will be `failure` when the apply step exits nonzero while the job continues to the decision step.
- Schema-vs-prisma diff remains gated on `if: steps.apply.outcome == 'success'` at lines 161-166, so it only runs after a successful forward apply.

M1 verdict: cleared.

## M2 deletion-detection trace and edge cases
Target file: `.github/workflows/migration-dry-run.yml` lines 87-126.

Actual detection sequence:
```bash
CHANGED=$(git diff --name-only --diff-filter=AMRCD "$BASE_SHA"..."$HEAD_SHA" -- 'prisma/migrations/**' 2>/dev/null || true)
DELETED=$(git diff --name-only --diff-filter=D "$BASE_SHA"..."$HEAD_SHA" -- 'prisma/migrations/**' 2>/dev/null || true)
...
if [ -n "$DELETED" ]; then
  echo "migration_deletion=true" >> "$GITHUB_OUTPUT"
  echo "::error::Migration deletion detected in this PR..."
  printf '%s\n' "$DELETED" | sed 's/^/  /'
  exit 1
fi
```

Verification:
- `--diff-filter=AMRCD` includes deletions in the PR-touches-migrations classification.
- A separate `DELETED=$(... --diff-filter=D ...)` isolates migration deletions.
- The step hard-fails with `exit 1` when `DELETED` is non-empty.
- The detect step is before `Apply all migrations forward`; a deletion-only PR cannot reach the grandfather pass/fail logic.
- Pathspec is limited to `prisma/migrations/**`, so same-prefix non-migration paths outside that tree are not counted.

Edge cases:
- Renamed migrations are included via `R`; deletions are isolated via `D` and do not double-count pure renames.
- PRs that both rename and delete migrations are caught by `AMRCD`, and only the actual deletions appear in `DELETED`.
- Deletion-only migration PRs now fail before the apply step instead of being treated as `pr_touches_migrations=false`.

M2 verdict: cleared.

## B1 path-filter verification / REQUIRED_CHECKS
### Workflow trigger audit
- `.github/workflows/ci.yml` lines 3-7: `pull_request:` has no `paths:` filter; always emits PR check runs for jobs `build-and-test`, `rls-floor-guard`, `rls-live-tests`, and `mwb-3-live-tests`.
- `.github/workflows/danger.yml` lines 6-9: `pull_request: branches: [main]` with no `paths:` filter; always emits `danger`.
- `.github/workflows/r100-quality-gate.yml` lines 27-30: `pull_request: branches: [main]` with no `paths:` filter; always emits `Banned cast tokens (R75 / R100.A2)`, `LOC budget (R100.A3)`, and `Test density (R100.A1)`.
- `.github/workflows/migration-dry-run.yml` lines 36-41: `pull_request` has `paths:` limited to `prisma/migrations/**` and `.github/workflows/migration-dry-run.yml`; exclude from required checks.
- `.github/workflows/infra-lint.yml` lines 12-19: `pull_request` has `paths:` limited to `.github/workflows/**`, `scripts/**`, and `dangerfile.js`; exclude from required checks.
- `.github/workflows/pr-checks-watcher.yml` lines 13-15 is `check_suite`, not a PR check to require.
- `.github/workflows/release-please.yml` and `.github/workflows/sbom.yml` are push/tag/manual workflows, not PR-required checks.
- No CodeQL workflow file exists in `.github/workflows` on this branch; CodeQL is correctly excluded.

### Was the migration path filter newly added by the fix?
- No. The migration workflow had the same `pull_request.paths` filter in its first PR commit (`49761bfe...`) and immediately before the M1/M2 fix commit (`4d4eb564...^`). Round 2 did not introduce a new path-filter scope change.
- Infra-lint was introduced in commit `c5e6cd58...` with its `pull_request.paths` filter already present.

### REQUIRED_CHECKS final list
`scripts/setup-branch-protection.sh` lines 839-851 now requires exactly the always-run PR checks:
1. `build-and-test`
2. `rls-floor-guard`
3. `rls-live-tests`
4. `mwb-3-live-tests`
5. `danger`
6. `Banned cast tokens (R75 / R100.A2)`
7. `LOC budget (R100.A3)`
8. `Test density (R100.A1)`

This matches the actually-always-run PR set. Path-filtered migration and infra-lint checks are intentionally not required. CodeQL is intentionally not required because it does not exist.

B1 verdict: cleared.

## Q1 r100-quality-gate banned-casts verification
Target file: `.github/workflows/r100-quality-gate.yml`, `banned-casts` job lines 41-135.

Token/scope verification:
- Token list includes `@ts-ignore`, `@ts-expect-error`, `as any`, `as unknown as`, `as never`, `Coming soon`, `lorem ipsum`, `foo@bar`, and `John Doe`.
- Literal empty-catch tokens include `.catch(()=>undefined)`, `.catch(()=>null)`, and `.catch(()=>{})`.
- Parametrized empty-catch regex is present: `EMPTY_CATCH_RE='\.catch\(\s*[^)]*\s*=>\s*(undefined|null|\{\s*\})\s*\)'`, which catches variants such as `.catch(_=>{})`, `.catch(err => undefined)`, `.catch(e => null)`, and whitespace variants.
- Scope includes `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.js`, `src/**/*.jsx`, `scripts/**/*.ts`, `scripts/**/*.js`, `scripts/**/*.sh`, and `dangerfile.js`.
- Scope excludes `.github/**`, preventing the workflow's own token list from self-matching when the gate file changes.
- `@ts-expect-error` exemption regex is exactly scoped to documented issue references: `EXEMPT_RE='@ts-expect-error.*#[0-9]{4,}'`, equivalent to the required `@ts-expect-error.*#\d{4,}` policy.

Self-match / H2 diff test:
- Corrected full added-line grep finds only token literals inside `.github/workflows/r100-quality-gate.yml` lines defining the gate itself:
  - `@ts-ignore`, `@ts-expect-error`, `as any`, `as unknown as`, `as never`, `Coming soon`, `lorem ipsum`, `foo@bar`, `John Doe`, and the exemption regex.
- The gate-scoped diff (same pathspec as the workflow, including `:(exclude).github/**`) has zero banned-token hits.
- `dangerfile.js` contains TODO/FIXME density regex/warnings only; `TODO`/`FIXME` are not hard-gated tokens in the r100 banned-casts list, and no placeholder literals/casts were found there.
- `scripts/setup-branch-protection.sh` has no banned-token hits.

Q1 verdict: cleared.

## R75 added-line grep categorization
Corrected full added-line grep over `e207cc02..c9511b7c` found hits only in `.github/workflows/r100-quality-gate.yml`, categorized as data literals defining the gate's own banned-token list and exemption regex. These are excluded by the gate's `.github/**` pathspec exclusion and are not real product-code violations.

The gate-scoped added-line grep returned no hits.

## New-regression check
- `--diff-filter=AMRCD` does not break prior behavior; it adds deletion awareness while preserving added/modified/renamed/copied detection.
- The M1 `set +e` / `set -e` toggle does not interact badly with `set -u`; `PIPESTATUS` is a bash array populated immediately after the pipeline, and `rc` is assigned before use.
- Excluding `.github/**` from the r100 banned-casts scan is intentional self-match prevention. Current `.github/**` additions contain only gate data literals, not real violations. Future workflow violations containing these strings would not be caught by this specific gate, but workflows are separately covered by actionlint/infra-lint and the requested Q1 scope explicitly required `.github/**` exclusion.
- The REQUIRED_CHECKS list did not drop any always-run PR check. The dropped checks are path-filtered (`migration-dry-run.yml`, `infra-lint.yml`) or nonexistent (`CodeQL`).
- Branch protection script still sets `enforce_admins: true` in payload.

## Round 1 findings status
- M1 prisma exit propagation through `tee`: cleared.
- M2 deletion-only PR bypass: cleared.
- B1 REQUIRED_CHECKS mismatch: cleared.
- Q1 r100 banned-casts patterns/scope: cleared.

VERDICT: CLEAN
