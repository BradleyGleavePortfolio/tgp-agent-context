## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: 9b4f55d34b78dfe051b3ab5ca1366cc2bab078ab
- importer input HEAD: 093b6b01c29123361b043ddd0f36cd4c578cffe2
- importer input tree: 5a606a476b3e9010cdd277841f400aeed8d00fbf
- mobile input HEAD: a5933fd6de5616493de75f0db907098b149b955c
- candidate PR: none; local builder only
- backend recovery candidate tree, separate frozen input: a8908132a9c4882dbe80f9fbc1052532c7e68c3b
- timestamp (ISO 8601 UTC): 2026-09-17T18:39:05.838Z

## Task and authority

Implement the narrow C1 backend control-plane slice: a server-minted opaque durable import intent at pairing; secure init/status/redeem echo and authenticated owner-bound retrieval that survive the short pairing-code TTL; explicit compatibility with existing extension-minted intents. Preserve the existing token isolation and authority. Pairing is setup, never accepted Start, import progress, native reconciliation, or completion.

User explicitly requests safe parallel work and Astra top-performance builders. Model is omitted to inherit; this records requested routing, not independently verified runtime identity. You are the sole backend product writer, not an independent auditor. No subdelegation or remote calls/writes.

Scratch `/tmp/tgp-op80-c1-build` starts at clean current main, NOT the unmerged recovery candidate. Read-only context `/tmp/tgp-op80-cycle-inputs/context` is pinned at the matrix SHA; importer `/tmp/tgp-op80-cycle-inputs/importer`; mobile `/tmp/tgp-op80-m5-readiness`. Do not change any input HEAD. Read complete canonical AGENT_RULES, R100 mandate and 50-failures reference from the pinned context first; canonical numbering and “any SHA” R124 govern over stale preamble wording/model prescriptions.

OWNS: `src/extension-pair/**`; specifically pairing-related tests under `test/`; only the ExtensionPairCode section and required relation lines in `prisma/schema.prisma`; one new additive pairing-session migration directory; `scripts/importer-contract.ts`; generated `docs/contracts/importer-openapi.json`; a new `docs/decisions/2026-09-17-c1-durable-paired-intent.md`. If an additional production file is essential, ask parent for exact expansion first. Do not touch auth authority, scout ingest/reconstruct/progress, recovery files, dunning, workflows, flags, dependency versions, other schemas, mobile or extension product files.

R18 clause, verbatim: Inside OWNS: anything goes. Outside OWNS, only three allowed patterns: (1) mechanical adaptation (touch ONLY the line consuming a renamed symbol); (2) repair when an origin/main intersection breaks YOUR tests (touch ONLY files your branch added/substantially modified — a pre-existing break on main is not your lane); (3) explicit operator-authorized scope expansion in plain text.

## Narrow contract requirements

1. Inspect actual pairing service, DTOs, controller, AuthService token minting and existing RLS migration. Reuse existing persistent pairing storage if it can safely satisfy durability; do not add a second auth system or generic lifecycle service.
2. Decide and document intent issuance, ownership, code expiry versus session lifetime, used-code retrieval, duplicate/concurrent redeem, mint failure, reconnect, old rows, cleanup and compatibility. A non-secret opaque ID is correlation, not authorization. Never return tokens from mobile status/session reads or put codes/tokens in URLs/logs.
3. Preserve secure default-off behavior, single-use conditional claim, failed-attempt limits, constant-time code check, role enforcement and the established short human-readable code. A client-provided intent must not become trusted merely by echoing it. Existing old extension behavior may remain as explicitly legacy/unbound; never relabel old runs as server-bound or silently infer a successful import.
4. Add a safe mobile-readable owner-scoped retrieval boundary if existing status-by-code cannot support durable retrieval. Unknown/foreign sessions must not leak existence. Use the existing controller guards and throttling conventions, no new role or endpoint authority.
5. Test red before green: stable server ID through init/redeem/status/retrieval, code expiry vs paired session retrieval, unknown/foreign/demoted callers, mint failure, races, legacy rows and clients, no token leakage, response validation and default-off gating. Keep real assertions and relevant old tests.
6. Keep this C1 slice small. It does not implement Start, cancellation of running imports, mobile navigation, browser permissions, progress percentages, native writes or completion. Define later missing capabilities honestly. If the actual workflow's stricter all-code LOC cap cannot support one safe atomic slice, checkpoint an explicit coherent split rather than remove tests, compress code or waive gates.
7. Regenerate the authoritative importer OpenAPI with existing generator after DTO changes; prove deterministic output and no invented consumer contract. Produce a concise contract handoff for parent review. Only a later landed/audited contract is frozen for M5.

## Resource and integration discipline

The earlier backend recovery writer is closed and its 27-file candidate is frozen. Your schema/generated-contract changes overlap it at file level, so parent alone integrates the two candidates and reruns validation. Never edit or copy the recovery over your clone.

Each lane has a private dependencies copy. Use Node20 matching backend CI, a sanitized environment without application `.env` or inherited DB credentials, and explicit local Prisma generation against your schema. No DB access or provisioning is authorized to you. Request parent for specific disposable migration proof after design review. Do not run `npm ci`, full suites, large scans or generators while another lane owns the resource slot without coordination; focused one-worker tests are permitted after confirming the current slot. No modifications in node_modules except legitimate generation in your own copy.

Known inherited blockers: main's dependency audit has 14 high/1 critical vulnerabilities; lint has 21 warnings; actual workflow LOC counts tests and can exceed canonical source cap. Do not repeat the same audit just for a duplicate result, change dependencies or suppress warnings. Report their unchanged applicability and measure your own candidate honestly. No pushes on blocked gates.

## Completion

Checkpoint the design and baseline before coding, then perform the bounded implementation and focused validation. Write evidence only under `/home/user/workspace/operator80/execution/c1/`; deliver `BUILD_REPORT.md`, complete patch, exact staged tree and separate unchanged-base evidence, red/green logs, commands/exits, 55-row R100 self-check and R109–126 controls. No commits, pushes, PRs, issues, live data, flag activation or merge. Parent is the sole publisher.

R138 decision: question the need for another lifecycle platform; delete duplicate authority; simplify to one durable server correlation seam; accelerate disjoint work; automate only established checks. GOOD: secure resumable setup. BAD avoided: false import completion, speculative consumers and overwriting recovered changes. Rollback is abandoning only this isolated candidate, not changing any deployed schema or deleting prior work.


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
