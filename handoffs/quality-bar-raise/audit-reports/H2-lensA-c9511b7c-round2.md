# H2 Re-Audit — LENS A (Opus 4.8) — ROUND 2

## BUILD MATRIX
- main HEAD: `e207cc02c8d58348783a6e3a0794377cc16b8251`
- PR: #456 "ci: H2 — CI workflows, branch protection, and PR hygiene tooling (R102 R106 R107) [LOC-EXEMPT: ...] [TEST-EXEMPT: ...]"
- PR base.sha (in): `e207cc02c8d58348783a6e3a0794377cc16b8251`
- PR head.sha (out): `c9511b7c06f2ac6fe962c60e979c4a38f8220840`
- Auditor lens: A = Opus 4.8
- Audit timestamp UTC: 2026-06-19T10:11:33Z
- Snapshot branches present (wip/h2-*):
  - `wip/h2-fix-audit-findings-snapshot` @ `9fda01889ea03048973fb2be96d42330bd7b9050` ✓ (expected)
  - `wip/h2-fixer-snapshot` @ `c795c1123270eec4f28fea89832b975026ab76fb`
  - `wip/h2-migration-grandfather-snapshot` @ `3d1300e71a86e5f271f3470ec9656ce963608abb`

Head SHA verified equal to task target. Base SHA equals main HEAD — PR is NOT stale.

---

## R3 — IDENTITY (BINDING)
- All 21 commits in `e207cc02..c9511b7c` authored by `Bradley Gleave <bradley@bradleytgpcoaching.com>` — single distinct author. ✓
- Fixer commits present: `4d4eb564` (M1+M2), `b48ada51` (B1), `b631b1cc` (Q1), `c9511b7c` (M1 shellcheck quote follow-up). ✓
- Commit-message grep (claude|anthropic|openai|gpt-|computer agent|perplexity|co-authored|generated with|🤖|ai assist): **CLEAN**.
- Self-grep on new content `9fda0188..c9511b7c` added lines (claude|anthropic|openai|gpt|co-authored|🤖|ai assist): **CLEAN**.
- Full-diff broad grep `e207cc02..c9511b7c`: **CLEAN**.
- Banned-token DATA literals inside `.github/workflows/r100-quality-gate.yml` (the gate's own TOKENS array) are enforcement data, not authorship/self-attribution — not a violation (Round-1 acceptance precedent holds).

**R3: PASS.**

---

## ROUND 1 FINDINGS — STATUS

### Lens A R1F1 — LOC-EXEMPT overbroad (sbom + release-please separable) → CLEARED
New live PR title (verified via `gh pr view 456 --json title`) reads exactly the task target, including:
> "...gate/protection/danger bulk cannot be split without shipping broken CI; **sbom + release-please are bundled here for atomic infra-rollout convenience**..."

The amendment is **honest**: it explicitly distinguishes the inseparable bulk (gate/protection/danger — cannot split without broken CI) from the admittedly-optional bundling (sbom + release-please, "for convenience"). This is the operator-authorized agent-autonomy path (don't-split → amend honestly). The wording no longer claims everything is inseparable. Net infra LOC = **1187** (computed independently, lockfile excluded) — over the 400 cap but transparently exempted with a genuine, non-abused justification.
**STATUS: CLEARED.**

### Lens A R1F2 — B1: REQUIRED_CHECKS incomplete / CodeQL name mismatch → CLEARED
Verified `scripts/setup-branch-protection.sh` REQUIRED_CHECKS array (8 entries) against the live PR #456 check matrix AND each workflow's `on:` trigger (re-derived independently, not echoed). See B1 section below.
**STATUS: CLEARED.**

### Lens B M1 — prisma exit code not propagated → CLEARED
PIPESTATUS + `exit "$rc"` pattern verified present and correct (quoted for shellcheck). See M1 trace.
**STATUS: CLEARED.**

### Lens B M2 — deletion-only PR bypass → CLEARED
`--diff-filter=AMRCD` + separate `--diff-filter=D` deletion hard-fail BEFORE apply. See M2 trace.
**STATUS: CLEARED.**

### Lens B Q1 — r100-quality-gate banned-casts incomplete → CLEARED
Token list expanded, scope widened to src/scripts/dangerfile, `.github/**` excluded, `@ts-expect-error` issue-link exemption present. See Q1 section.
**STATUS: CLEARED.**

---

## M1 — PRISMA EXIT-CODE PROPAGATION (5-element checklist)
File: `.github/workflows/migration-dry-run.yml`, job `forward-only`, step `id: apply`.

| Element | Present | Evidence |
|---|---|---|
| `set -euo pipefail` at start | ✓ | first line of run block |
| `set +e` before prisma pipe | ✓ | so PIPESTATUS readable |
| `npx prisma migrate deploy 2>&1 \| tee migrate_deploy.log` | ✓ | piped to tee |
| `rc=${PIPESTATUS[0]}` | ✓ | captures prisma rc, not tee rc |
| `set -e` restored | ✓ | after capture |
| `echo "exit_code=$rc" >> "$GITHUB_OUTPUT"` | ✓ | output exported |
| **`exit "$rc"` at end** | ✓ | **quoted** (the c9511b7c follow-up commit) |
| `continue-on-error: true` on step | ✓ | workflow continues to decision step |

**Trace:** prisma fail → `rc=1` → `exit 1` → step `outcome=failure` (not cancelled because continue-on-error). Decision step reads `steps.apply.outcome`; if `failure` AND `pr_touches_migrations=true` → `exit 1` (PR responsible). If `failure` AND PR doesn't touch migrations → warning + `exit 0` (grandfathered base debt). Correct distinction restored. **M1: PASS — all elements present.**

---

## M2 — MIGRATION DELETIONS
File: same workflow, step `id: detect_migration_changes` (runs BEFORE `apply` in same job; `reversibility-check` job has `needs: forward-only`).

- `CHANGED=$(git diff --name-only --diff-filter=AMRCD ...)` — D included ✓
- `DELETED=$(git diff --name-only --diff-filter=D ...)` — computed separately ✓
- If `[ -n "$DELETED" ]`: emits `::error::` + `exit 1` — hard-fail ✓
- Deletion check executes BEFORE the apply step (step order within `forward-only`) ✓

**Trace:** deletion-only PR → `CHANGED` non-empty (AMRCD captures D) so `pr_touches_migrations=true`, AND `DELETED` non-empty → `exit 1` fires before apply step is ever reached. No silent bypass. **M2: PASS.**

---

## B1 — REQUIRED_CHECKS / PATH-FILTER VERIFICATION
Independently re-derived every workflow's `on:` trigger:

| Workflow | `on:` paths filter? | Always-run? | Checks |
|---|---|---|---|
| ci.yml | `pull_request:` (no paths) | **YES** | build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests |
| danger.yml | `branches:[main]` (no paths) | **YES** | danger |
| r100-quality-gate.yml | `branches:[main]` (no paths) | **YES** | Banned cast tokens, LOC budget, Test density |
| infra-lint.yml | `paths: .github/workflows/**, scripts/**, dangerfile.js` | **NO (path-filtered)** | shellcheck, actionlint, danger dry-run |
| migration-dry-run.yml | `paths: prisma/migrations/**, .github/workflows/migration-dry-run.yml` | **NO (path-filtered)** | Forward migration applies cleanly, New migrations are reversible |
| (CodeQL) | — | — | **No CodeQL workflow exists on this branch** |

**Fixer claims verified by direct file reads:**
- migration-dry-run.yml IS path-filtered → correctly EXCLUDED ✓
- infra-lint.yml IS path-filtered → shellcheck/actionlint/danger-dry-run correctly EXCLUDED ✓
- No CodeQL workflow present → correctly EXCLUDED ✓

**Why excluded checks are right to exclude:** under `strict: true`, a required check from a path-filtered workflow stays PENDING (never reports) on any PR that doesn't touch its paths, permanently blocking merge. On THIS PR they ran (PR touches `.github/workflows/migration-dry-run.yml` and `.github/workflows/**`/`scripts/**`/`dangerfile.js`), which is why 13 checks appear green — but a normal `src/**`-only feature PR would NOT trigger them.

**Final REQUIRED_CHECKS (8) — verified equal to the always-run subset:**
`build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`, `danger`, `Banned cast tokens (R75 / R100.A2)`, `LOC budget (R100.A3)`, `Test density (R100.A1)`. Names match observed check_run names on PR #456 exactly. **B1: PASS — 8 is the correct set.**

**R102:** Script sets `enforce_admins: true`, `required_linear_history: true`, `allow_force_pushes:false`, `allow_deletions:false`, `require_code_owner_reviews:true`, `dismiss_stale_reviews:true`, `required_conversation_resolution:true`. ✓ (H2 is the PR that enables protection; not blocking that it isn't yet active.)

---

## Q1 — r100-quality-gate banned-casts (token list + scope)
File: `.github/workflows/r100-quality-gate.yml`, job `banned-casts`.

- **Tokens:** `@ts-ignore`, `@ts-expect-error`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, `Coming soon`, `lorem ipsum`, `foo@bar`, `John Doe` + parametrized empty-catch regex `\.catch\(\s*[^)]*\s*=>\s*(undefined|null|\{\s*\})\s*\)`. ✓
- **Scope (PATHSPEC):** `src/**` (.ts/.tsx/.js/.jsx), `scripts/**` (.ts/.js/.sh), `dangerfile.js`, `test/**`; excludes `*.d.ts`, node_modules, `*.test.*`, `*.spec.*`, and **`.github/**`**. ✓ (no longer src-only)
- **`.github/**` excluded** → prevents the gate self-matching its own TOKENS literals. ✓
- **`@ts-expect-error` exemption:** `EXEMPT_RE='@ts-expect-error.*#[0-9]{4,}'` — lines with a 4+ digit issue ref are stripped before counting. ✓
- **Self-match test:** ran the gate's exact scoped grep against the H2 diff → **CLEAN** (no self-match, no real violation). The only token literals in the diff live in `.github/workflows/r100-quality-gate.yml` (lines 687–698), which the `:(exclude).github/**` pathspec removes.

**Q1: PASS.**

---

## R75 — BANNED-TOKEN GREP ON ADDED LINES (e207cc02..c9511b7c)
- Doctrine-scope grep on real prod code (gate's own scope, `.github/**` excluded): **CLEAN**.
- Raw full-diff token hits exist ONLY as the data literals defining the gate inside `.github/workflows/r100-quality-gate.yml` — these are enforcement data, not violations, and are excluded from the gate's own scan. **R75: PASS.**

## LOC / TEST EXEMPTION JUDGEMENT (R23/R74)
- Net infra LOC (independently computed, lockfile excluded): **1187** added / 2 removed. Over 400; `[LOC-EXEMPT]` present and **genuine/non-abused** (see R1F1). Largest items: migration-dry-run.yml 313, r100-quality-gate.yml 238, setup-branch-protection.sh 171, dangerfile.js 137 — all true bootstrapping infra.
- `[TEST-EXEMPT]`: net testable src = dangerfile.js (137) — Danger config, validated by infra-lint's `danger dry-run` job (not unit-testable in isolation). Genuine. Would-have-liked: a small node harness asserting dangerfile schedule/warn behavior, but infra-lint validation is an acceptable substitute. Not abused.

## CI (independent re-poll)
- 13/13 checks **SUCCESS**.
- `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`, `headRefOid` = `c9511b7c...` (matches). ✓
- Note (R11): green CI alone is not trusted; all doctrine checks above were re-derived manually.

---

## SUMMARY
All five Round-1 findings (Lens A R1F1, R1F2; Lens B M1, M2, Q1) are **CLEARED**. No new regressions introduced by fixer commits `4d4eb564`/`b48ada51`/`b631b1cc`/`c9511b7c`. R3 identity clean across all 21 commits and all added content. R6 snapshot `wip/h2-fix-audit-findings-snapshot @ 9fda0188` present. LOC/TEST exemptions genuine. R102 branch-protection script correct (`enforce_admins:true`, 8-check always-run REQUIRED_CHECKS).

VERDICT: CLEAN
