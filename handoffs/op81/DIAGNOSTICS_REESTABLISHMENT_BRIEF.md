## BUILD MATRIX

- backend HEAD / source checkpoint: `8e7d6d11702ef896bb0896773e5c06163e23c3fa`
- source checkpoint tree: `084edafa75ee290addfc4b78757e3d2ffc9c1e9f`
- dependency input / PR524 head: `238f0f1f152ebbb1b4691f555e98c888473d8ee7`
- dependency tree: `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`
- backend main / PR524 base: `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`
- ctxrepo stationary HEAD: `2ead9b05e967713201c03619b564a3db4cadea35`
- recovered original complete candidate tree: `a8908132a9c4882dbe80f9fbc1052532c7e68c3b`
- product PR for this new diagnostics lane: not yet opened; source checkpoint only
- timestamp (ISO 8601 UTC): `2026-09-18T04:50:00Z`

## Goal and evidence boundary

Prepare the next small diagnostics slices without waiting on an unrelated source-review phase. Prevent ORM query/customer payloads from entering logs, Sentry or public error messages while preserving legitimate client errors and request correlation. This is source preparation, not independent review, a release decision or permission to merge.

The four recovered files were replayed from the exactly recovered original tree onto PR524 in a private worktree. They are now durably preserved at backend branch `wip/op81-diagnostics-recovery`, source checkpoint above. The later predecessor D1/D2 trees and added tests were not recovered. Your additions are NEW Op81 re-establishment work, never purported copies of missing historical cases.

Read the COMPLETE `AGENT_RULES.md`, Appendix A, R100 preamble and 50-failure reference in `/home/user/workspace/tgp-study/op81-audit-context`. Read this full brief and the source before edits. Also read the preserved `NEXT_DIAGNOSTICS_SLICE.md` and `cycle3-diagnostics-builder-brief.md` under `/home/user/workspace/tgp-study/op80-evidence/handoffs/op80-execution/` as behavioral evidence, not current resource authority. Current pins and this scope supersede historical runtime arrangements.

## Exclusive ownership

Only writable product clone: `/home/user/workspace/tgp-study/op81-diagnostics`.

Only writable product paths:

- `src/filters/http-exception.filter.ts`
- `src/observability/orm-diagnostics.ts`
- `src/observability/sentry-config.ts`
- `test/scout/scout-diagnostics.integrity.spec.ts`
- `test/scout/scout-diagnostics-public.spec.ts` (new, if useful)
- `test/scout/scout-diagnostics-boundary.spec.ts` (new, if useful)

Only writable evidence directory: `/home/user/workspace/tgp-study/op81-execution/diagnostics/`.

Inside OWNS: anything goes. Outside OWNS, only three allowed patterns: (1) mechanical adaptation (touch ONLY the line consuming a renamed symbol); (2) repair when an origin/main intersection breaks YOUR tests (touch ONLY files your branch added/substantially modified — a pre-existing break on main is not your lane); (3) explicit operator-authorized scope expansion in plain text.

The narrower phase restriction below remains binding. All dependency paths and unrelated source are immutable. No package installation, database, external service, credentials, remote mutation, source login, contract/schema/flag changes, subdelegation or shared writable dependencies. Do not read either active PR524 auditor's conclusions or the operator prediction ledger.

The original 85-line integrity test must retain every assertion and behavior. Its baseline SHA256 is `6995cf7ae39c90dd42a3077004ae06f2e1dd2de803d1412a6817610f938b490e`. Prefer new adjacent files rather than rewriting that evidence. Do not delete or weaken meaningful tests to meet a cap.

## Source-only phase

First prepare regression tests, not a production fix. The static concern is an HTTP exception wrapping an ORM cause: the recovered filter sanitizes its logging diagnostic but reads the original HTTP response for the public envelope. Construct real Nest HTTP exceptions and real Prisma error causes, including string/object/array messages and synthetic markers in message/error/code. Include ordinary non-ORM 4xx string/array/machine-code controls.

Cover all supported ORM classes, valid and invalid Prisma codes, nested/cyclic causes, primitive/non-error inputs and useful ordinary errors. Exercise original-error and serialized-exception Sentry detection, asserting the complete permitted envelope and removal of request/query/body/header/user/context/extra/breadcrumb/frame payloads. Verify request correlation and ordinary sensitive-header handling. Do not invent impossible threats or suppress all ordinary diagnostic information to force success.

Prepare D1 public-error repair coverage and mandatory D2 boundary coverage as coherent sequential slices. Both actual repository workflow size and canonical production size/density apply. Measure them honestly after formatting. A stacked base does not erase cumulative size; D2 is not optional. Stop for a scope/split decision if meaningful coverage cannot fit.

No tests, compilers, linters, formatters, generators, scanners or installation are allocated yet. Send the parent a concise source-ready checkpoint naming prepared cases, exact changed paths, integrity checks and the bounded RED command requested. The parent owns the one heavy execution slot and will prioritize review counterexamples. Preserve current source on dependency drift; never silently rebase or treat old validation as proof.

## Later allocation

After explicit parent allocation, execute and preserve RED evidence on the recovered production baseline before changing production. Only then make the smallest justified repair, run GREEN plus existing adjacent consumers, and perform type/lint/format/doctrine checks. Full-suite proof and independent dual review apply to exact final trees later, not to this preparation checkpoint.

No private dependency environment is currently allocated to this lane. The parent will prepare one if needed; do not symlink, hardlink, move or borrow another lane's runtime.

## Durability and report

Parent is the only publication writer while this worker edits its private product clone. After each file change or at a source-ready checkpoint, send the parent the changed file list and request a foreground snapshot. Never race the parent's commit; stop edits when snapshot ownership is requested. If a future phase grants commit authority: after every commit, the immediate next action is `git push`; do not chain commits. All identities must satisfy R3.

Write `CHECKPOINT.md` promptly and a complete final `REPORT.md` in your evidence directory. Include exact input/output hashes, preserved assertions, NEW case matrix, actual/canonical size and density, commands actually executed, every 55 R100 and 18 R109–R126 row at final readiness, unresolved findings and limits. Report model selection as requested, not independently verified runtime identity. No independent CLEAN or release claim is available to this builder.

## Parent R138 decision

**Goal/root cause:** preserve recovered diagnostics and prepare missing regression evidence without recreating the obsolete shared-runtime runner. The failure boundary is unsafe ORM-derived text crossing public and diagnostic envelopes.

**Options:** wait for all dependency reviews before reading tests; rebuild the missing predecessor trees from prose and pretend identity; or preserve the exact recovered baseline and explicitly author new tests in a separate source-only lane. Choose the third.

**Five steps and idiot index:** question the source-preparation dependency; delete runtime lending and false historical reconstruction; simplify to one private worktree, narrow ownership and explicit execution allocation; accelerate independent source preparation; automate only repeatable evidence after it is understood. Three active read-only/source lanes do not create three competing heavy processes.

**Hyperscaler lens:** isolated candidates and evidence-based promotion follow the [AWS Builders' Library continuous-delivery guidance](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/). Apple preserves useful client errors, Notion favors a clear error object, and Google contains payload exposure at the boundary rather than relying on callers.

**Good without bad:** keep original work and useful parallelism without shared writable state, invented recovery claims or inherited release approval. Evidence required is RED/GREEN on owned source, complete boundary coverage, exact-tree validation and dual independent clearance.

**Stop/rollback:** stop on changed dependency pins, scope mismatch or unavailable safe execution. Rollback abandons the new scratch delta only; original recovery, PR524, main and real customers remain untouched.

## Binding verbatim preamble

The following is the exact inherited preamble. Read it with the current canonical-numbering qualification above.

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
