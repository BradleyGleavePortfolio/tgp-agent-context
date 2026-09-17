## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: d480cd3a9082a40229f1170c675d97e862baa0cc
- importer main: 0111be661922234d670bbf23e23d270eec1b4a4e
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- timestamp (ISO 8601 UTC): 2026-09-17T17:52:07.708Z

## Authority and boundaries
Read the COMPLETE canonical /home/user/workspace/operator80/repos/context/AGENT_RULES.md, plus its R100/50-failure references needed for the checklist. Canonical numbering supersedes older preamble numbers; never invent a waiver from a stale R-number. Do not change any rule.
No remote mutations, pushes, PRs, comments, merges, GitHub settings, or commits under a human identity are authorized in this dispatch. A prior publication action was blocked; do not bypass it. Work locally only. No production DB, customer data, live source account, token inspection, flag activation, new dependency versions, or security weakening. Local durability checkpoints are required; report their publication block honestly rather than claiming R4/R20 remote compliance.
R18 clause, verbatim: Inside OWNS: anything goes. Outside OWNS, only three allowed patterns: (1) mechanical adaptation (touch ONLY the line consuming a renamed symbol); (2) repair when an origin/main intersection breaks YOUR tests (touch ONLY files your branch added/substantially modified — a pre-existing break on main is not your lane); (3) explicit operator-authorized scope expansion in plain text.
Read-only GitHub access, if needed, follows connector discovery then gh/git via bash api_credentials=["github"]. Do not inspect tokens or auth status.
No sub-delegation. Do not ask the user routine questions; report decisions and material blockers to the parent. Use apply_patch for manual edits.


## Task and input
Prepare a current-main backend repair candidate without losing newer main behavior.
Repair input HEAD: 6b263c2f342a561ca8a64e5efa077e6c90601a4a
Repair input tree: f675f132ba41f000eb35bd2f5101a66cc951267a
Repair merge-base: 5076a07a1e54b14e3db84d3aa128fb0bb44542d7
PR #522 head: e045cfc5e70124061b13e5dc4f4f4efb6132cceb
PR #522 base (origin/main when PR was created): 5076a07a1e54b14e3db84d3aa128fb0bb44542d7
Current actual origin/main: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
Scratch path: /tmp/tgp-op80-backend-build
Start at current main. Apply only the delta 5076a07..6b263c2 to it; never restore the repair's entire older tree. Preserve current main's dunning-lockout guard and two regression-test files byte-for-byte. No commit/push, use working-tree diff plus git write-tree to pin final content. Preserve all recovered branch history.
OWNS: Only the exact file set produced by git diff --name-only 5076a07..6b263c2, plus local evidence outside the repository in /home/user/workspace/operator80/execution/backend. No other writer owns backend code. Parent owns C1 contract analysis in context only, no backend files.
Read recovered docs/decisions/2026-09-16-scout-ingest-integrity.md from repair, source/migrations/tests in the delta, and current build/test/gate config. TGP repair adds platform/family to tenant-scoped ingest/ledger idempotency, validation, PII-safe ORM diagnostics, and guarded migration/rollback proof. This is repair recovery, not C1 or new product scope.
First apply the recovered delta mechanically, then establish compile/focused regression baseline. Fix integration defects in OWNS with failing regression tests before production edits, smallest coherent root-cause fix. Do not remove tests, minify LOC, rewrite gates, silently grant exception, or relabel staging as native completion. Investigate authoritative LOC calculation and safe split options, report actual measured constraint. An old R86 exception citation is not authority; canonical R86 numbering governs.
Install locked deps with lifecycle scripts disabled, inspect and run prisma generate explicitly for the candidate. Avoid production environment; no migrations unless parent confirms an isolated disposable local DB. Run build, focused scout+diagnostics+dunning tests serially; coordinate full suite with parent to avoid 2CPU/8GB overload. Do not read other audit lanes or audit your own output.
Deliver code as complete working-tree diff and patch, exact candidate tree, preserved dunning hashes, commands/results, full R100 self-check and honest remaining gates. Checkpoint /home/user/workspace/operator80/execution/backend/BUILD_REPORT.md after major phases and send parent progress. Do not claim independently audited, merged, deployed or live-verified.
Decision gate: question need to rebuild discarded work; delete redundant reimplementation, preserve recovered fixes; simplify by applying only ancestor-relative delta. Use isolated validation/blast-radius containment as in https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/. GOOD is repair continuity, BAD is dropping current-main regressions; byte-for-byte preservation plus tests keeps them separate. Root cause is divergent ancestry, not dunning itself. Rollback is discard local candidate; no deployed/schema state is changed.


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
