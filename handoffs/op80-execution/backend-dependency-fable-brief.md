## BUILD MATRIX

- backend HEAD / PR524 head: `238f0f1f152ebbb1b4691f555e98c888473d8ee7`
- backend candidate tree: `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`
- PR524 base / backend origin/main: `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`
- ctxrepo HEAD: `ad2259c0649e4e53a663a2600343da1a08ac8b35`
- importer HEAD: `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81`
- importer frozen staged tree, not audit target: `3db01451c6c4e1aa46c6637db80d852e2273bcf6`
- importer origin/main: `0111be661922234d670bbf23e23d270eec1b4a4e`
- mobile HEAD: `a5933fd6de5616493de75f0db907098b149b955c`
- timestamp (ISO 8601 UTC): 2026-09-17T22:14:42.629Z

## Independent audit assignment

Lens B: tests, contracts, full-diff coverage, maintainability, doctrine and process controls. Both lenses independently read the FULL diff, including the full package-lock delta, and relevant unchanged consumers, tests, build and runtime configuration. Focus is not an exclusion. This is the first independent audit of backend dependency PR524, not an audit of diagnostics or R110 and not release authorization.

Your backend source-only clone: `/tmp/tgp-op80-backend-audit-fable`.
Immutable canonical context input: `/tmp/tgp-op80-cycle2-inputs/context`.
Other read-only matrix inputs: importer `/tmp/tgp-op80-cycle2-inputs/importer`; mobile `/home/user/workspace/operator80/repos/mobile`. Importer working/index tree is 3db, HEAD fc7; use explicit Git objects for any predecessor content. No changes to any of these inputs are authorized.

Read COMPLETE canonical `AGENT_RULES.md` in the immutable context clone and its R100/50-failure references. The evolving publisher context checkout is NOT an audit input: do not read its working files or use its HEAD as the canonical pin. This brief's exact bytes/hash and the supplied frozen canonical context are your authority. Parent will publish reports/briefs from a different checkout without changing your pinned inputs.

R10 verbatim: "AUDITS MUST BE EXHAUSTIVE - FIND AS MANY PROBLEMS AS POSSIBLE - THERE IS NO \"ENOUGH TO REPORT\""

R18 clause, verbatim: Inside OWNS: anything goes. Outside OWNS, only three allowed patterns: (1) mechanical adaptation (touch ONLY the line consuming a renamed symbol); (2) repair when an origin/main intersection breaks YOUR tests (touch ONLY files your branch added/substantially modified — a pre-existing break on main is not your lane); (3) explicit operator-authorized scope expansion in plain text.

No time budget, pre-filled verdict or pressure to minimize findings. Derive findings independently; do not read the other auditor, builder conclusions or prior unrelated audit reports. Source first, then inspect primary command/results evidence to evaluate verification claims. Do not hide inherited defects; attribute inheritance vs regression using the pinned base.

## Preconditions and evidence, not conclusions

The parent verified [PR524](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/524) is draft at the stated head/base. Applicable executed checks completed successfully; `deploy-readiness-gate` was skipped by its event condition and is NOT a passed deployment. Independently inspect relevance and required-control coverage; all control gaps remain findings, not waived.

GitHub CI and CodeQL checked synthetic merge `0786a9f087d8dcec7dfb8d1271c78aeba5baabb3`, whose tree is exactly b2bb and parents are c23b/238f. It is CI-only, not a product landing or an R3-compliant publication commit. [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/35279915048) records 531 suites / 7,857 tests / six snapshots passed, 12 skipped suites /159 skipped tests/five todos. [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/35279915067) actually uploaded analysis; analysis1796271510 reports 201 rules, zero results and empty error at the synthetic SHA. Success does not prove required branch protection or remedy fail-open workflow logic.

Raw local evidence, read-only:
- `/home/user/workspace/operator80/execution/backend-dependency-fix/command-ledger.jsonl`
- `corrected-full-suite-results.json`, `corrected-full-suite.log`, `corrected-full-before.json`
- `frozen-audit.log`, `focused-babel-results.json`, `focused-babel-coverage/coverage-final.json`
- `corrected-freeze.json`, `FINAL_IDENTITY.json`, `FINAL_GATES.json`
- `/home/user/workspace/operator80/execution/backend-publication/runs/product-commit/` native hooks and separate metadata
- `/home/user/workspace/operator80/execution/backend-publication/prepared.json`
- Parent remote evidence packet `/home/user/workspace/operator80/execution/backend-remote-verification/` when present; absence is not evidence of success.

Derive size, source/test density, banned-token deltas, version compatibility, dependency resolution and semantics yourself. Do not adopt reported counts as your own measurements. Read current repo workflow semantics rather than infer strictness from green labels.

## Resource and safety allocation

You own only `/home/user/workspace/operator80/execution/backend-audit-fable/` for external scripts, evidence and full report. Your backend clone's tracked tree stays read-only. No commits, ref changes, pushes, PR comments, settings, permission changes, package installs, database, real-account calls, credentials inspection or subdelegation.

Begin with read-only static review and lightweight Git/JSON measurements. No installed dependency copy, generator, product test, compiler, scanner, network request or full suite is currently allocated. This is a shared 2-CPU sandbox with a serialized heavy slot, not a limit on audit depth: send parent a concrete bounded execution plan if independent reproduction requires it, continue non-overlapping analysis while waiting, and do not declare completion merely because execution is pending. Parent owns remote queries; request exact URLs or data needed rather than duplicate queries. Do not use another lane's writable node_modules.

Requested model is Claude Fable 5; do not substitute models. Requested/inherited model is not independently verified runtime identity. Read applicable local engineering review/testing module if needed, not all skill modules.

Verify all matrix HEADs plus candidate tree at start and close, and around execution. Any matrix drift means INFRA_DEATH; do not silently re-pin. Preserve findings already demonstrated if a round becomes invalid. A rules-number conflict uses canonical AGENT_RULES, not obsolete model or numbering examples in the inherited preamble.

## Required return

Checkpoint the complete R13 report at `/home/user/workspace/operator80/execution/backend-audit-fable/BUILD_REPORT.md`. Return the FULL body in your final message, not only a pointer. Include populated BUILD MATRIX, independently derived full-diff inventory, each severity/file:line/reproduction/remedy, all 55 R100 rows, all 18 R109–R126 rows, test/evidence provenance, inherited/control findings, uncertainties, resource release and exactly one canonical verdict line. Do not claim merge approval or all-clear with any unresolved P0–P3.

> **Note:** Content is also reflected in /AGENT_RULES.md. This file remains active for backward compatibility with running crons.

# R100 Brief Preamble — paste verbatim into every builder/fixer/auditor brief

> **R100 Hyperscaler Quality Mandate is binding** (see `operator-meta/R100_HYPERSCALER_QUALITY_MANDATE.md`). All 50 industry failure modes + 5 local rules apply. R0 means ship correctly, not ship fast.
>
> **If you are a BUILDER or FIXER:**
> - Before push, run the R100 self-check (manual until `scripts/r100-self-check.sh` lands). For each of R100.1–R100.50 + R100.A1–A5, document PASS / FAIL / N/A with one-line evidence in your PR description under an `R100 Self-Check` heading.
> - FAIL on any P0 rule blocks your push unless you author an `R100 Exception Request` block with item-by-item justification + operator sign-off.
> - Hard caps you cannot escape silently: `R100.A1` test:src ≥ 2.0 per PR; `R100.A2` banned-cast tokens net +0; `R100.A3` ≤400 prod LOC; `R100.10` `npm audit --audit-level=high` clean.
>
> **If you are an AUDITOR (Lens A or Lens B):**
> - Every report MUST contain an `R100 Checklist` section enumerating each of the 55 rules with PASS / FAIL (file:line + evidence) / N/A (reason). Missing checklist = your report is invalid; refuse the brief per R72.
> - **Lens A focus:** R100.1–R100.13 (security), R100.21–R100.32 (perf + concurrency), R100.44–R100.50 (data + infra).
> - **Lens B focus:** R100.14–R100.20 (architecture), R100.17 + R100.A1 (test reality + density), R100.33–R100.43 (observability + quality), R100.A2 (banned-cast substitution), R100.A3 (LOC).
> - Banned-cast tokens (`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `.catch(()=>null)`, `.catch(()=>{})`, `Coming soon`) — count NET additions in PR diff. Any positive net = P0.
> - End your response with EXACTLY one verdict line per R100.A5: `VERDICT: CLEAN` | `VERDICT: FINDINGS` | `VERDICT: REFUSAL` | `VERDICT: INFRA_DEATH`. No other final line allowed.
>
> **All R85 v3, R72, R74, R86, R87, R88 rules continue to apply.** R100 supplements them; it does not replace them. Where R100 and an earlier rule overlap (e.g., R86 LOC cap ≡ R100.A3), the stricter wording governs.

>
> ---
>
> ## R109 ADDENDUM (binding 2026-06-19+) — No Half-Ass
>
> Every code path that reaches a user must produce real value or a real, actionable error. THREE banned outcomes (each = P0):
>
> 1. **Stubs visible to users** — `Coming soon`, `TBD`, `Stay tuned`, `Lorem ipsum`, `placeholder`, `mock`, `fake`, `dummy`, `sample data`, `TODO:` / `FIXME:` / `XXX:` in user-facing copy, empty list/grid/chart without typed `emptyState` prop, hardcoded `test@*` / `example.com` emails, `Math.random()` standing in for real metrics, imports from `*/mocks/*` or `*/fixtures/*` resolving in a prod bundle. **Char-concat bypass (`['C','o','m'...].join('')`) is also banned** — auditor checks AST not just diff grep.
> 2. **Silent failures** — any `.catch(()=>{})`, `.catch(()=>null)`, `.catch(()=>undefined)`, empty catch, `if (err) return null` swallow, error envelope with empty `message`, generic "Something went wrong" without recovery action.
> 3. **Removed entry points as workaround** — if a nav/route/button/link/CTA exists, it MUST reach a real working feature. Hiding by conditional, tree-shaking, commenting out, 404-ing = BANNED. The fix is to BUILD the feature (R109 SCOPE path: GPT-5.5 planner with `quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` → Opus 4.8 chunked builders ≤400 LOC src/PR).
>
> ---
>
> ## R110-R126 ADDENDUM (binding 2026-06-19+) — Hyperscaler hygiene + meta-rules
>
> Auditors MUST verify these in every report. Each finding cites file:line evidence.
>
> **Security & Supply Chain (Lens A focus):**
> - **R110** — `.gitleaks.toml` present + `secrets-scan.yml` CI workflow required + branch-protection includes it as required check. PR diff scanned for high-entropy strings.
> - **R113** — `npm audit --audit-level=high` is a required CI gate; `.audit-ignore.yml` suppressions all have non-expired `expires` field + named owner.
> - **R118** — Semgrep + CodeQL workflows exist, run on PRs, use `--severity ERROR --error`. `.semgrepignore` suppressions properly justified.
> - **R119** — `grep -ri 'createHash..md5|createHash..sha1|DES|RC4' src/` returns empty (unless `// crypto-allowed:` annotation present and justified).
> - **R120** — `iac-security.yml` runs checkov on workflows + Dockerfile + fly.toml; HIGH/CRITICAL blocks merge.
>
> **Dependency & Build Reproducibility (Lens A + B):**
> - **R114** — `grep -E '"[~^*]' package.json` returns empty; `package.json` and `package-lock.json` always change together.
> - **R115** — `sbom.yml` triggers on `pull_request:`; artifact retention ≥30 days.
> - **R121** — Vite/webpack DefinePlugin injects `GIT_SHA`; Docker LABEL `org.opencontainers.image.revision` set; `/api/version` endpoint exists.
>
> **Code Hygiene & Typing (Lens B focus):**
> - **R111** — `tsconfig.json` has `noUnusedLocals: true` + `noUnusedParameters: true`; ESLint `no-unused-vars` is `error`.
> - **R112** — ESLint rules `no-explicit-any`, `no-unsafe-*` all `error` level; custom rule active against `as any | as unknown as | as never`. (Active enforcement of R75/R104.)
>
> **Test Quality (Lens B focus):**
> - **R116** — Diff coverage ≥80% on changed files OR `[COVERAGE-EXEMPT:]` title marker + R76 Exception Request in body.
> - **R117** — Every new `it()` / `test()` block contains `expect()` or registered matcher. ESLint `jest/expect-expect` is `error`.
> - **R123** — `npm test` uses `--passWithNoTests=false`; any new `.skip()` has matching entry in `test/QUARANTINE.md` with reason + expiry + owner.
>
> **Branch Protection & Process (Lens A + B):**
> - **R122** — Live branch-protection config diffs cleanly against `branch-protection.yml`; `enforce_admins: true`; all R110/R113/R115-R120 CI gates are required checks.
>
> **Meta-Rules (every audit verifies):**
> - **R124 (REPRODUCIBILITY)** — Brief AND report contain populated BUILD MATRIX block (backend HEAD SHA, ctxrepo HEAD SHA, PR head SHA, PR base SHA, ISO timestamp). If PR head SHA changes during audit → output `VERDICT: INFRA_DEATH` with reason `SHA drift mid-audit: <old> → <new>`. Do NOT continue auditing a moved target.
> - **R125 (DEFENSE IN DEPTH)** — Any new R-rule added in this PR has all three enforcers OR a matching entry in `operator-meta/UNENFORCED_RULES.md` with owner + target date ≤30 days out. Older unenforced entries = P1.
> - **R126 (TELEMETRY AS CONTRACT)** — If the PR references a subagent dispatch chain, the matching `handoffs/<wave>/dispatch-ledger.jsonl` entries exist with both predicted_verdict and actual_verdict fields populated.
>
> **BUILD MATRIX block (required at top of every brief AND every report — R124):**
>
> ```
> ## BUILD MATRIX
> - backend HEAD: <sha>
> - ctxrepo HEAD: <sha>
> - PR #<n> head: <sha>
> - PR #<n> base (origin/main): <sha>
> - timestamp (ISO 8601 UTC): <ts>
> ```
>
> **Lens routing update (binding 2026-06-19+):**
> - **Lens A** also covers: R110 / R113 / R118 / R119 / R120 / R114 (supply chain) / R115 / R121 (build) / R122 (process). Plus R109 banned-outcome #1 (stubs visible) and #2 (silent failures) via diff grep.
> - **Lens B** also covers: R111 / R112 (typing teeth) / R116 / R117 / R123 (test quality) / R125 / R126 (meta) / R109 banned-outcome #3 (removed entry points) by inspecting routing/nav/CTA presence vs feature reality.
>
> **Output requirement (R13 + R16 + R124):** Every audit report begins with BUILD MATRIX, contains the R100 Checklist filled row-by-row, includes a new "R109-R126 Checklist" section enumerating PASS / FAIL (file:line + evidence) / N/A (reason) for each of R109/R110-R123/R124-R126, and ends with EXACTLY one verdict line. No silent omissions. Missing any of these = report INVALID = REFUSAL outcome per R10.
