# R-SCOUT-READINESS-1 — Register the three existing importer flags as default-OFF in production readiness (no runtime change)

- **Ruling ID:** R-SCOUT-READINESS-1
- **Date:** 2026-07-22
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 71, encoding a decision the primary operator personally made at the R138 pre-build review. The agent is **encoding**, not deciding, this slice.
- **Status:** ACTIVE — authorizes the next backend slice; does **not** build it.
- **Owner of the authorized work:** `growth-project-backend` (a future backend PR + its own R14 dual-lens cycle + git-native `R3_MERGE_RUNBOOK.md` landing).
- **Bottom line:** **BUILD SMALLER.** Register `FEATURE_SCOUT_INGEST`, `FEATURE_SCOUT_RECONSTRUCT`, and `FEATURE_EXTENSION_PAIRING` as **default-OFF** rows in the production-readiness registry, add the one missing `.env.example` declaration, and add one exact readiness assertion. **0 production LOC. No runtime behavior change. No flag activation.**
- **Does NOT amend:** `AGENT_RULES.md` (no rule added or changed); the D2 identity model; the `R3_MERGE_RUNBOOK.md` mechanics; the billing exclusion; the site-agnostic mission; any landed PR's code or history (preserved per R5/R132). This authorizes a configuration/test-only slice within the already-decided importer wave — it is not a new directional decision, so it re-runs no directional pivot. The primary operator's own R138 pre-build review (recorded below) is the governing gate.
- **Supersedes:** none.
- **Related:** [[OPERATOR_HANDOFF]], [[R-RULE-AUTHORITY-1_2026-07-20]], [[R-SITE-AGNOSTIC-1_2026-07-20]], [[R-V5-PR3-1_2026-07-21]]; `AGENT_RULES.md` R108 (prod-switches registry), R41/R100.18 (exhaustive `.env.example`), R83 (default-off flags / kill-switch), R14, R3, R74/R75/R76/R80, R100, R124.

## Background — verified live facts (Op 71, cross-checked against GitHub)

**Baseline reconciled.** Backend `growth-project-backend` `main` is **`ccb7e4008c32f3776542d7368d2058ead47ff812`** (parent **`d476fd6d5bdcfdfd3088723cbf625d3c28deced1`** = the V5 PR-3 tip). This is **PR #517**, the formatter-baseline, landed through the **git-native path** (PR #517 **CLOSED**, `mergeCommit` null — NOT server-merged). Independently verified via `gh`:

- author == committer == **Bradley Gleave <bradley@bradleytgpcoaching.com>** — **R3-CLEAN**; commit message AI/co-author-token clean.
- Content: `.prettierignore` gains a path-specific ignore for `prod-switches.yml` (+3/−0); `test/deploy-readiness.spec.ts` is formatting-only (+181/−39, Prettier 3.9.6 line-wrap/trailing-comma reflow, no logic edits). **0 production LOC.**
- Audited head `c8e3aca9931be3830baa9dc7b723b9764a117d42` tree `e25c5ca0dbca73eadacab89755657fd3feee67e4` == landed `main` tree — **byte-identical**.
- CI on `ccb7e400`: **six product checks GREEN** (`build-and-test`, `CodeQL JS/TS`, `Deploy app`, `rls-live-tests`, `rls-floor-guard`, `mwb-3-live-tests`); the only reds are `build-sbom` + `release-please`, **PRE-EXISTING** and diff-independent (both already RED on base `d476fd6d`) and **quarantined in their separate infra lane** — NOT product regressions, NOT in scope here.

**Registry / env state at `ccb7e400` (verified, not assumed).**
- `prod-switches.yml` exists (R108 single source of truth). Its row schema is exactly: `name`, `tier` (`hard | prod | feature | optional`), `prod_default` (`MUST_SET | ON | OFF | STUB_ALLOWED`), `auto_flip_on_in_prod` (bool), `owner`, `description`. It currently carries **NO rows** for `FEATURE_SCOUT_INGEST`, `FEATURE_SCOUT_RECONSTRUCT`, or `FEATURE_EXTENSION_PAIRING`.
- `.env.example` declares `FEATURE_SCOUT_INGEST=false` and `FEATURE_SCOUT_RECONSTRUCT=false` (each documented as a DEFAULT-OFF route gate) but does **NOT** declare `FEATURE_EXTENSION_PAIRING` — confirming the one env gap.
- `test/deploy-readiness.spec.ts` (1462 lines) already cross-references `prod-switches.yml` against `ENV_RULES` + `.env.example` + `process.env.*` and asserts `prod_default` expectations, and emits a `[GAP] … referenced in src/ but absent from prod-switches.yml` line for unregistered vars.

**Operator-asserted preconditions the build agent MUST re-verify (VALIDATE-FIRST, not taken on faith).** All three flags already exist as route gates in backend code and the two Scout flags are already in `.env.example`; the readiness registry is the launch-readiness blind spot because the three importer flags are not yet enumerated there with an explicit default-OFF state. *(Note: GitHub code-search returned 0 hits for the flag names under `src/` — treated as a private-repo indexing artifact, NOT as evidence of absence, given the `.env.example` route-gate documentation and the landed IMPORTER-F/G/H/I surfaces. The build agent MUST confirm the actual `src/` references at build head before landing.)*

## The ruling — authorized OWNS for the future backend slice

The backend slice is **configuration/test-only** and MUST touch **only** the three files below, following the **exact existing schema/style** of each. It is a "lazy senior developer" reuse of primitives that already exist — no new abstraction, no new surface.

1. **`prod-switches.yml`** — add three rows, one per flag, in the file's existing alphabetical/style ordering:
   - `FEATURE_SCOUT_INGEST`, `FEATURE_SCOUT_RECONSTRUCT`, `FEATURE_EXTENSION_PAIRING`.
   - each: `tier: feature`, `prod_default: OFF`, `auto_flip_on_in_prod: false`, an `owner` matching the importer domain, and a one-line `description` matching neighboring rows' style.
2. **`.env.example`** — add `FEATURE_EXTENSION_PAIRING=false` **beside the existing Scout flags** (the `FEATURE_SCOUT_INGEST` / `FEATURE_SCOUT_RECONSTRUCT` block), with a short DEFAULT-OFF comment matching the neighbors. (The two Scout flags are already present — do not duplicate them.)
3. **`test/deploy-readiness.spec.ts`** — add **one** exact Scout/importer-specific assertion proving all three flags are **registered** in `prod-switches.yml` **and** carry `prod_default: OFF` (i.e. default-off). The test MUST reproduce the counts/expectations from the registry itself, not trust any handoff prose.

**Invariant:** `prod_default: OFF` + `auto_flip_on_in_prod: false` for all three — **default-OFF must remain the invariant.** No flag is activated. No route goes live. No `src/**` changes.

## Forbidden in this slice (any one ⇒ STOP)

`src/**` (any production code); any runtime behavior change or flag **activation**; `.github/**` / any CI workflow; new secrets, SDKs, hosted flag services, runtime flag evaluators, targeting, variants, or percentage rollout; `package.json` / lockfiles; OpenAPI / contracts (`importer-openapi*`); DB / schema / migrations; `BL-MIGRATION-REBASELINE`; any mobile or extension file. The hyperscaler feature-flag *lifecycle/registered-state* pattern is adopted; hosted **targeting/variants/rollout** is deliberately **not**.

## Required gates (the build PR owes all of these)

- Targeted prod-switch **registry + readiness** tests green (the new assertion + the existing `deploy-readiness` cross-reference), and the **doctrine fail-fast** (R108/R22 sweep) green.
- Full relevant suite green; **lint / typecheck / prettier / hooks with NO bypass** (no `--no-verify`, no `-c commit.gpgsign=false`).
- **R74** (test:src ≥ 2.0 — trivially satisfied at 0 prod LOC), **R75** (banned-cast net = 0), **R76** (≤ 400 prod LOC — this slice is 0), **R80** (OpenAPI byte-pinned drift green — no contract touched, so trivially green), **R100** (§7 hyperscaler quality), **R124** (BUILD MATRIX both-ways SHA pin).
- **Exact-head dual-lens R14 audits** to `VERDICT: CLEAN` (config/test change is product-repo code, so it is NOT R14-exempt — only *context-repo docs* are), then **git-native landing** per `R3_MERGE_RUNBOOK.md` (git-native squash or plain non-force fast-forward; NO server-side merge; NO force / `--force-with-lease` / admin bypass; author == committer == Bradley Gleave).

### Required BUILD MATRIX (R124)

```
## BUILD MATRIX
- backend HEAD: <PR head sha>
- backend base (origin/main): ccb7e4008c32f3776542d7368d2058ead47ff812
- ctxrepo HEAD: <sha>            # this ruling / the Op-71 reconcile
- PR #<n> head: <sha>
- files: prod-switches.yml, .env.example, test/deploy-readiness.spec.ts   # exactly these three
- production LOC: 0
- contract: importer-openapi 1.4.0 (untouched, byte-identical)
- timestamp (ISO 8601 UTC): <ts>
```
Any live SHA change mid-audit ⇒ `VERDICT: INFRA_DEATH` per R124.

## STOP conditions

- Any **live SHA drift** off `ccb7e400` before/during the build (re-verify with `gh` per [[R-RULE-AUTHORITY-1_2026-07-20]] + R124).
- Any **registry schema mismatch** that would require a change wider than the three rows / one env line / one assertion.
- **Any runtime or contract change** creeping in (that means the slice grew past config/test-only — STOP and re-gate).
- **Any need for credentials or DB/live access** to land the slice.
- **Any non-pre-existing CI regression** (the two known infra reds `build-sbom`/`release-please` are pre-existing and do NOT count; anything else does).

## Operator STOP review (personally completed at the R138 pre-build gate — recorded, not re-derived)

1. **Idiot Index — BUILD SMALLER.** Configuration/test-only: three existing registry rows + one env declaration + one exact readiness assertion; **0 prod LOC**; no dependency/infra/migration/contract/runtime change. Complexity-to-value ratio **below 1×** — it removes a launch-readiness blind spot using primitives that already exist.
2. **Assumptions.** `ccb7e400` is the current clean baseline; the existing `prod-switches.yml` schema and neighboring flag rows are reusable; all three flags already exist in code/env **except** `FEATURE_EXTENSION_PAIRING` is missing from `.env.example`; **default-OFF must remain invariant**; tests must **reproduce counts** rather than trust the handoff; **no flag activation is authorized.**
3. **Lazy senior developer.** Reuse `prod-switches.yml`, `.env.example`, and `test/deploy-readiness.spec.ts`; **no** SDK, hosted flag service, runtime evaluator, targeting, rollout, new abstraction, or product code.
4. **Hyperscaler scan.** AWS AppConfig models feature flags with explicit enabled/disabled state and metadata (<https://docs.aws.amazon.com/appconfig/latest/userguide/appconfig-creating-configuration-and-profile-feature-flags.html>); LaunchDarkly documents explicit flag-lifecycle criteria and cleanup/readiness governance (<https://launchdarkly.com/docs/home/flags/flag-lifecycle-settings>). **Applicable pattern:** explicit registered state + lifecycle ownership. **Deliberately NOT adopted:** hosted targeting / variants / rollout.
5. **Top changes.** Add three default-OFF registry rows; add `FEATURE_EXTENSION_PAIRING=false` to `.env.example`; add one exact Scout-specific green readiness assertion. **Decision: BUILD SMALLER.**

## R138 four-question decision gate (operator-run; recorded here)

1. **Musk's five principles / root cause.** *Question the requirement:* the launch blind spot is that three importer flags are not enumerated in the readiness registry with an explicit default-OFF state — attack that, nothing more. *Delete:* no SDK / hosted service / evaluator / new abstraction. *Simplify:* three rows + one env line + one assertion, reusing existing files. *Accelerate/Automate last:* the readiness test already automates the cross-check; the slice only feeds it truthful rows. Root cause (missing registered state), not a symptom.
2. **What would hyperscalers do?** Explicit registered enabled/disabled flag state + lifecycle ownership (AWS AppConfig; LaunchDarkly lifecycle governance) — adopted as *registered state*, with targeting/variants/rollout deliberately declined as over-build.
3. **GOOD without the BAD.** GOOD: the launch-readiness gate can now see all three importer flags and assert they default OFF. BAD avoided: no runtime behavior change, no activation, no contract/schema/migration surface — the flags stay dark; the change is reversible (revert the three-file PR) and test-guarded.
4. **Reversible / dark?** Yes — 0 prod LOC, no runtime surface, forward-only `git revert`; all importer flags remain default-OFF.

## What this changes / does not change

- **Changes:** canonically authorizes the next backend slice (owner `growth-project-backend`), names its exact three permitted files, the row/env/assertion shape, the forbidden list, the required gates + BUILD MATRIX, and the STOPs.
- **Does not change:** any `AGENT_RULES.md` rule; the D2 model; `R3_MERGE_RUNBOOK.md`; the billing exclusion; the site-agnostic mission; any landed PR's code or history; the runtime behavior of any importer surface (all flags stay default-OFF). `current-state.json` is reconciled by the Op-71 context PR that carries this ruling, not by the backend slice.

## Filing metadata

- **Filed under:** `roadmap/rulings/` (context repo), per R4 path convention.
- **Author:** Bradley Gleave (R3 — author AND committer; no AI/agent/co-author tokens).
- **Doctrine effect:** authorizes a configuration/test-only backend slice; adds no rule.
- **Cross-refs:** [[OPERATOR_HANDOFF]] §6 (flags default-off); `AGENT_RULES.md` R108 / R41 / R83 / R14 / R3 / R74–R76 / R80 / R100 / R124; [[R-RULE-AUTHORITY-1_2026-07-20]]; [[R-SITE-AGNOSTIC-1_2026-07-20]].
