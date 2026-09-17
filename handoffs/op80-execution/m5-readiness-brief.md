## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: 9b4f55d34b78dfe051b3ab5ca1366cc2bab078ab
- importer input HEAD: 093b6b01c29123361b043ddd0f36cd4c578cffe2
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- mobile PR #289 head: 22354984d9e3af0deb2d32271ce9ab5e5accb92a
- mobile PR #290 head: ed0342e976bfd2992755d85afb1678bd135c327a
- mobile PR #291 head: d2f0d31c6898f8642153df7a53644c1f38f26114
- mobile PR #292 head: 340886776e3af0c22b97aae666b1b0f331820f5f
- timestamp (ISO 8601 UTC): 2026-09-17T18:39:05.847Z

## Bounded read-only readiness task

User asks safe parallelization of the next three activation PRs (C1, M5, extension consumer), with no agents overwriting one another. C1 builder is active; M5 IMPLEMENTATION IS BLOCKED until C1 has landed and frozen, per the binding ruling's final clause. This task is preparatory reconciliation, not the beginning of M5 implementation and not an R14 release audit.

Inspect only the existing mobile PR289–292 dependency stack and the actual importer/onboarding entry points. Determine minimal prerequisite landing order, file/function overlaps, old contract assumptions, test/tool dependencies, and a concrete future OWNS/acceptance matrix for M5. Produce an actionable short report, not a speculative architecture rewrite.

Read-only clone `/tmp/tgp-op80-m5-readiness` must remain at main SHA above. Read older/head objects with `git show` and exact base/head diffs; never checkout another ref or mutate any repo. Parent already verified GitHub heads and draft state. Stack is main -> PR289 -> PR290 -> PR291 -> PR292. No remote/GitHub calls by this lane.

Pinned context `/tmp/tgp-op80-cycle-inputs/context` and importer `/tmp/tgp-op80-cycle-inputs/importer` are read-only. Read canonical rules, R100 and 50-failures reference before analysis; inspect the binding onboarding ruling and Roman journey. Backend current-main clone `/home/user/workspace/operator80/repos/backend` remains read-only; do not read live C1 working changes as a frozen API.

## Questions to answer

1. Exact per-PR changed files and ancestry; which contracts and files overlap? Which may be reviewed read-only in parallel but cannot be implemented or landed independently?
2. Which actual coach wizard route is live? Reconcile the ruling's Payments/Ready labels and role names with actual server-provisioned roles and RootNavigator. Do not implement a new role or use deprecated generic onboarding.
3. What existing PR289–292 changes should be preserved rather than rebuilt? Which are required for honest, user-scoped pairing persistence, unknown status, kill switch, copy/a11y?
4. Where do current UI and tests incorrectly equate paired with started/running or roster changes with intent-specific results? Identify exact seams to repair in M5 without implementing now.
5. Future file ownership, API freeze input, no-token-leak boundaries, skip/resume/user-switch/feature-dark tests, desktop continuation, real result limitations. Separate minimum authorized M5 from later native-result/activation features.
6. Identify install/test/lockfile/generator resource demands from config only. No npm install, tests, simulator, browser, DB, port, app server, generated output, source edits or new dependencies.

OWNS: only `/home/user/workspace/operator80/execution/m5-readiness/READINESS_REPORT.md` and machine-readable conflict inventory in the same evidence directory. No context-repo writes, commits, push, issues or subdelegation. Parent publishes and dispatches future coding.

Deliver exact BUILD MATRIX, concise findings and dependency table, future test cases/OWNS, inspection limitations, and final verdict FINDINGS if blockers remain. Do not call this a clean release audit. Stop when the six bounded questions are answered; do not broaden into all mobile PRs.


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
