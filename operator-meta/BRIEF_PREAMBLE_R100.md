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
