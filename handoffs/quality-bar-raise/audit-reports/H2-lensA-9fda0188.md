# H2 Audit — Lens A (Opus 4.8)

## BUILD MATRIX
- main HEAD: `e207cc02c8d58348783a6e3a0794377cc16b8251`
- PR: #456 "ci: H2 — CI workflows, branch protection, and PR hygiene tooling (R102 R106 R107) [LOC-EXEMPT: 7 CI workflows + dangerfile + branch-protection script — infrastructure bootstrapping; cannot split further without shipping broken CI] [TEST-EXEMPT: net src is dangerfile.js Danger config — not unit-testable in isolation; validated by infra-lint workflow]"
- PR base.sha (in): `e207cc02c8d58348783a6e3a0794377cc16b8251` (== main HEAD; fresh)
- PR head.sha (out): `9fda01889ea03048973fb2be96d42330bd7b9050`
- Auditor lens: A = Opus 4.8
- Audit timestamp UTC: 2026-06-19T09:39:06Z
- Snapshot branches present: `wip/h2-fixer-snapshot` (c795c11), `wip/h2-migration-grandfather-snapshot` (3d1300e)

PR base.sha == main HEAD → PR is FRESH, not stale.

---

## 1. Identity check (R3) — PASS
- All 16 commits in `e207cc02..9fda0188` authored by `Bradley Gleave <bradley@bradleytgpcoaching.com>` (verified via `git log --pretty='%an <%ae>' | sort | uniq -c` → single author, count 16).
- Banned-token grep over full commit log (`claude|anthropic|openai|gpt-|computer agent|perplexity|co-authored|generated with|🤖|ai assist`): **no hits**.
- HEAD commit confirmed `9fda01889e... Bradley Gleave <bradley@bradleytgpcoaching.com>`.

**R3: CLEAN.**

---

## 2. Diff manifest (18 files) — categorized
| File | +adds | -dels | Category |
|---|---|---|---|
| .github/CODEOWNERS | 22 | 0 | config |
| .github/workflows/danger.yml | 38 | 0 | CI workflow |
| .github/workflows/infra-lint.yml | 97 | 0 | CI workflow |
| .github/workflows/migration-dry-run.yml | 294 | 0 | CI workflow |
| .github/workflows/pr-checks-watcher.yml | 100 | 0 | CI workflow |
| .github/workflows/r100-quality-gate.yml | 198 | 0 | CI workflow |
| .github/workflows/release-please.yml | 29 | 0 | CI workflow |
| .github/workflows/sbom.yml | 63 | 0 | CI workflow |
| .gitignore | 4 | 0 | config |
| .release-please-config.json | 27 | 0 | config |
| .release-please-manifest.json | 3 | 0 | config |
| dangerfile.js | 137 | 0 | dangerfile config |
| package-lock.json | 994 | 6 | lockfile (EXCLUDED per R23) |
| package.json | 1 | 0 | manifest |
| scripts/ci/check-relrowsecurity.sh | 1 | 1 | shell (shellcheck fix) |
| scripts/preflight.sh | 1 | 1 | shell (shellcheck fix) |
| scripts/release.sh | 1 | 0 | shell (shellcheck disable comment) |
| scripts/setup-branch-protection.sh | 140 | 0 | shell (branch-protection) |

7 NEW CI workflow files added (danger, infra-lint, migration-dry-run, pr-checks-watcher, r100-quality-gate, release-please, sbom) — matches title claim of "7 CI workflows." The other 5 workflows (ci, fly-*) pre-exist and are untouched.

---

## 3. LOC tally (re-derived)
Counting infra as prod per R23 (LOC-EXEMPT invoked), excluding `package-lock.json`:
- CI workflows: 38+97+294+100+198+29+63 = **819**
- dangerfile.js: **137**
- setup-branch-protection.sh: **140**
- CODEOWNERS + release-please config/manifest + .gitignore + package.json: 22+27+3+4+1 = **57**
- shellcheck fixes (3 files): **3**
- **Net prod LOC ≈ 1156** (well over the 400 cap → exemption required and present)

The in-repo `r100-quality-gate.yml` LOC job measures the same scope and would report ~1150+; it correctly honors `[LOC-EXEMPT:]`.

---

## 4. LOC-EXEMPT validity (R23/R76) — split-feasibility — **FINDING (overbroad justification)**
Title claim: *"7 CI workflows + dangerfile + branch-protection script — infrastructure bootstrapping; cannot split further without shipping broken CI."*

The file count and per-file claims are accurate. Much of the PR is genuinely coupled: the branch-protection script's `REQUIRED_CHECKS` array references check-run names emitted by `migration-dry-run.yml` and `r100-quality-gate.yml`; `infra-lint.yml` lints the workflows/scripts/dangerfile this PR adds; the Danger soft-check and dangerfile.js are a unit. For those, "cannot split without breaking CI" holds.

**However**, the justification asserts the PR *as a whole* cannot be split further, and that is not strictly true. At least two sub-units are cleanly separable and would ship independently with **zero** CI breakage:

1. **`sbom.yml`** (63 LOC) — triggers on `push:main` / `tags`, produces an artifact only, is not a merge-gating check, is not referenced by the branch-protection required-checks list, and depends on nothing else in this PR. It could be its own PR.
2. **`release-please.yml` + `.release-please-config.json` + `.release-please-manifest.json`** (~59 LOC) — `push:main` versioning automation, not a PR gate, not referenced by branch protection, independent of every other file here. It could be its own PR.

Per the task's R23 split test ("≥2 cleanly-separable sub-PRs that could each ship independently without breaking CI → exemption abused"), SBOM and release-please meet that bar: two independent, non-gate, separable PRs. The exemption's blanket "cannot split further" wording is therefore **overbroad** — these two units demonstrably could have shipped separately.

Severity note: This is a justification-accuracy defect, not a quality or security defect. The work itself is high quality, and the *bulk* of the PR (gates + branch-protection + danger + infra-lint, ~1030 LOC) is legitimately coupled and not reasonably splittable. But doctrine, as written for this audit, treats the presence of ≥2 separable sub-PRs as exemption abuse → **FINDINGS**. Remedy: either split SBOM and release-please into their own PRs, or amend the LOC-EXEMPT reason to acknowledge those two are bundled for convenience rather than necessity (operator sign-off).

---

## 5. TEST-EXEMPT validity (R74) — VALID
Title claim: *"net src is dangerfile.js Danger config — not unit-testable in isolation; validated by infra-lint workflow."*

- Source files added: `dangerfile.js` (137 LOC) and `scripts/setup-branch-protection.sh` (140 LOC). The 3 other shell touches are 1-line shellcheck fixes. No `.ts` source added.
- The `r100-quality-gate.yml` test-density job counts only `src/**/*.ts(x)`, `scripts/**/*.ts`, and `dangerfile.js` on the src side. Since the only matching net-new src is `dangerfile.js`, the gate's measured "src" for this PR == dangerfile.js — exactly matching the title claim.
- `dangerfile.js` is driven entirely by the injected Danger DSL (`danger.git.*`, `warn/fail/message/schedule`) and is meaningful only inside a Danger runtime; it exports no pure functions. The lone arguably-pure piece is the inline `CONVENTIONAL_RE` regex — not an exported module, not worth isolating. Not reasonably unit-testable in isolation. **Claim holds.**
- `setup-branch-protection.sh` is a side-effect-only script (issues a `curl PUT` to the GitHub API); not unit-testable, validated by shellcheck.
- **The cited `infra-lint workflow` exists and is real** (`.github/workflows/infra-lint.yml`): runs `shellcheck` over `scripts/*.sh`, `actionlint` (pinned 1.7.7) over workflows (which also shellchecks embedded run-scripts), and `npx danger ci --dangerfile dangerfile.js --text-only --failOnErrors` — a Danger dry-run that fails CI on any dangerfile syntax/runtime error. This is genuine automated validation, not a rubber-stamp.

No non-trivial pure-function module was shipped without tests. **TEST-EXEMPT: VALID / not abused.**

What I'd have liked to see: a tiny unit test extracting and asserting `CONVENTIONAL_RE` behavior — but this is optional and not material.

---

## 6. R75 banned-token grep (added lines) — CLEAN
Grepped the 2150 added content lines (`^+` minus `^+++`) for `@ts-ignore | @ts-expect-error | as any | as unknown as | as never | Coming soon | lorem ipsum | foo@bar | John Doe` and empty-catch swallows.

- All matches (`r100-quality-gate.yml` lines 60-68; `dangerfile.js` lines 116/122) are **the scanner's own token-definition list and the TODO-density regex** — i.e., the enforcement machinery enumerating what it searches for, restricted in execution to `src/**` TS/JS only so it cannot self-match. Not violations.
- No empty-catch swallows in added lines.

**R75: CLEAN.**

---

## 7. Snapshot branches (R6) — PRESENT
`git ls-remote --heads origin 'wip/h2-*'`:
- `wip/h2-fixer-snapshot` → c795c11
- `wip/h2-migration-grandfather-snapshot` → 3d1300e

Both expected snapshots present.

---

## 8. Migration grandfather-clause review — CORRECT (does NOT mask real regressions)
`migration-dry-run.yml` latest-commit logic verified line-by-line:
- **(a) base SHA correct:** the diff-detection step (`detect_migration_changes`, lines 86-111) uses `${{ github.event.pull_request.base.sha }}` (PR base), NOT main — correct. Records `pr_touches_migrations` true/false from `git diff --diff-filter=AMRC base...head -- prisma/migrations/**`.
- The `Apply all migrations forward` step (line 113-119) is `continue-on-error: true` so the outcome can be read.
- **(b) decision conditional correct** (lines 121-139): apply success → pass; apply failure AND `pr_touches_migrations==true` → `exit 1` (hard fail, "this PR is responsible"); apply failure AND PR touches no migrations → `::warning::` + `exit 0`.
- **(c) real regressions still hard-fail:** any PR that adds/modifies/renames a `prisma/migrations/**` file and breaks forward-deploy hits the `exit 1` branch. The grandfather clause only relaxes failures on PRs that touch **zero** migrations. It does NOT mask broken migrations in migration-touching PRs.
- The schema-vs-prisma diff step (line 141-146) is gated on `steps.apply.outcome == 'success'`, avoiding noise on partial DBs.
- `reversibility-check` job (lines 148-294) performs a real forward→down→forward `pg_dump -s` byte-parity check on each NEW migration dir, and reads `NEW_DIRS` via `env:` + `<<<` (script-injection-safe), with `timeout-minutes: 10`. Grandfather scope is correct (only PR-added dirs enter the loop).

**Grandfather clause: works as claimed AND does not silently allow broken migrations to merge. CLEAN.**

---

## 9. Branch-protection script (R102) — mostly correct, ONE GAP
`scripts/setup-branch-protection.sh` PUT payload:
- `enforce_admins: true` ✓ (line 94)
- `required_pull_request_reviews`: `required_approving_review_count: 1` ✓, plus `require_code_owner_reviews`, `require_last_push_approval`, `dismiss_stale_reviews` ✓
- No admin-bypass flag; `restrictions: null` ✓
- Idempotent: full PUT replaces config → re-running yields the same state (well-documented destructive-but-idempotent note) ✓
- Backs up prior config before the PUT ✓; validates `GH_REPO` format ✓
- Required status checks present: `build-and-test` ✓, `rls-floor-guard` ✓, `rls-live-tests` ✓, `CodeQL` ✓, the two migration checks ✓, `Banned cast tokens (R75 / R100.A2)` ✓, `LOC budget (R100.A3)` ✓, `Test density (R100.A1)` ✓.

**GAP (note, not a hard fail):** The doctrine/task expected the required-checks list to include **`mwb-3-live-tests`**, which is a live security/regression job that genuinely exists in `ci.yml` (job `mwb-3-live-tests`, line 297). It is **absent** from `REQUIRED_CHECKS`. Omitting a live RLS/MWB-3 security suite from required checks means a PR could merge with that suite red. The `danger` soft-check is also absent, but that is by design (Danger is explicitly non-gating per its own header), so its omission is acceptable. The `mwb-3-live-tests` omission is a real protection gap that should be added to the array before the script is run against the upstream repo.

R102 verification target ("PR actually contains a branch-protection script that sets enforce_admins: true") is satisfied. The missing `mwb-3-live-tests` entry is recorded as a finding (incomplete required-checks set vs. doctrine list).

---

## 10. dangerfile.js — SUBSTANTIVE (not a stub)
Genuine implementation enforcing: risk-marker warnings (migrations, auth/oauth, RLS, billing, webhooks, rule-doctrine edits, incl. deleted files), Conventional-Commits title validation with commit-subject fallback (fixes stale-payload-title bug), PR body length, BREAKING CHANGE footer, lockfile/package.json coupling, sensitive-file (`.env/.pem/.key/secrets.json`) additions, and TODO/FIXME density inside Danger's awaited `schedule()` hook (no swallowed errors). 

Per the dangerfile's own header, hard gates (LOC budget, TEST/LOC-EXEMPT justification, R75, R3) live in `r100-quality-gate.yml` + `ci.yml`, NOT in Danger — so its lack of LOC/exemption/identity enforcement is by-design separation of concerns, not a deficiency.

---

## 11. Each workflow's enforcement quality
- **r100-quality-gate.yml** — real. 3 jobs all compute and enforce: banned-casts (net token count over `src/**` TS/JS, hard-fail, no exemption), loc-budget (net LOC over full infra scope, hard-fail >400 unless live-title `[LOC-EXEMPT:]`), test-density (integer ratio ×100, hard-fail <2.0 unless live-title `[TEST-EXEMPT:]`). Reads LIVE PR title via `gh pr view` with event-payload fallback — correctly handles post-open exemption edits. **Enforces, does not rubber-stamp.**
- **infra-lint.yml** — real. shellcheck + actionlint (pinned) + danger `--failOnErrors` dry-run. Is the cited TEST-EXEMPT validator.
- **migration-dry-run.yml** — real (see §8).
- **pr-checks-watcher.yml** — sound. Concurrency group keyed on PR number + cancel-in-progress closes the TOCTOU duplicate-comment race; paginates comments (>100); accurate per-check summary. Comment-only, no gating side effects.
- **sbom.yml** — reproducible (cdxgen pinned 10.11.0), least-privilege (`contents: read`), SHA-pinned actions, 90-day artifact.
- **release-please.yml** — clean, SHA-pinned action, correct contents:write only on push:main.
- **danger.yml** — correctly non-gating soft check, danger pinned via lockfile (12.3.4), SHA-pinned.
- All 7 new workflows SHA-pin every action (verified in commit `01334ed`).

`rls-floor-guard` lives in the pre-existing `ci.yml` (job line 166) and is referenced correctly by the branch-protection required-checks list.

---

## Summary of findings
1. **R23/R76 — LOC-EXEMPT justification overbroad (FINDING):** The "cannot split further without shipping broken CI" claim is not strictly true. `sbom.yml` (push:main, artifact-only) and the `release-please` trio (push:main versioning) are each independent, non-gating, and separable into their own PRs with zero CI breakage — ≥2 cleanly-separable sub-PRs, which the audit doctrine defines as exemption abuse. Remedy: split those two out, or amend the exemption wording with operator sign-off. The remaining ~1030 LOC is legitimately coupled.
2. **R102 — branch-protection required-checks incomplete (FINDING):** `setup-branch-protection.sh` omits `mwb-3-live-tests` (a live MWB-3 security/regression suite present in `ci.yml`) from `REQUIRED_CHECKS`, so a PR could merge with that suite failing. Add it before applying protection.

No R3, R75, R6, migration-safety, or workflow-quality violations. The engineering quality of the PR is high; both findings are justification/configuration-completeness defects rather than code defects.

VERDICT: FINDINGS
