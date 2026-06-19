# AGENT_RULES Consolidation — Report

**Commit SHA:** `2369f14a8a8da9cda9db6bf1302a5e48180de3fd` (pushed to origin/main, tgp-agent-context)
**Author/Committer:** Bradley Gleave <bradley@bradleytgpcoaching.com> (R3-clean; -S signing failed — no secret key — fell back to plain commit with correct author/committer, no AI/Co-Authored tokens)
**Master file:** `/AGENT_RULES.md` — **R1–R99, gap-free, no duplicates** (verified by numbering audit)

## Reconciliations confirmed
- **R72 split:** rules/R72 (AUDITS_EXHAUSTIVE, operator verbatim "PROBL;EMS" typo preserved) → **R10**; operator-meta/R72 (AUDITOR_INDEPENDENCE) → **R11**.
- **R81 split:** rules/R81 (MERGE_GATE, operator verbatim, tied with R1) → **R14**; operator-meta/R81 (OPERATING_DOCTRINE) → **R15**.

## 20 new hyperscaler rules (R80–R99)
R80 API contract source-of-truth (types generated, not hand-written); R81 SemVer enforced; R82 migration safety (reversible + expand-contract); R83 feature-flag discipline (kill-switch + cleanup deadline); R84 structured event taxonomy; R85 telemetry coverage floor (RED metrics); R86 SLO before merge; R87 WCAG 2.2 AA accessibility; R88 i18n (no hardcoded strings); R89 performance budgets (bundle/LCP/TTI); R90 idempotency on every mutation; R91 rate limit/quota on every public endpoint; R92 multi-tenant isolation (RLS default-on); R93 backwards-compatible API changes only; R94 dependency hygiene (owned transitive, weekly SCA, CVE budget); R95 supply chain (lockfile, reproducible builds, no curl|sh); R96 time handling (store UTC); R97 money handling (integer/Decimal, never float); R98 PII handling + cascade-delete across caches/backups; R99 error-budget review (missed SLO = P0 freeze).

## Dropped/merged from the 25 candidates (5 not used as standalone)
- Expand-contract + drop-column 2-phase (candidates 3 & 21) → merged into **R82**.
- Generic idempotency + cron idempotency (11 & 25) → folded into **R90** (cron-idempotency only partially; see open question).
- GDPR/CCPA cascade delete (candidate 22) → merged into **R98**.
- Read-after-write consistency (23) and connection-pool hygiene (24) → NOT codified as standalone; judged lower-priority than the chosen 20 for this product's current surface.

## Rules merged, not dropped, from old files
- BRIEF_PREAMBLE_R85/R86/R100 → consolidated into **Appendix A** (single canonical preamble). R85/R86 preambles stubbed; R100 preamble kept in place (cron dependency).
- R100_AUDIT_CHECKLIST_TEMPLATE → **Appendix B**, kept in place.
- R16 (verdict line) and R78 (R100.A5) intentionally co-exist: R16 is the operational stuck-classifier; R78 is the R100-pack enforcement of the same line. Cross-referenced, not duplicated.

## Stubs & kept-in-place
- 21 old R*.md files (14 in rules/, 7 in operator-meta/) + BRIEF_PREAMBLE_R85/R86 replaced with 2-line `# MOVED` stubs.
- Kept in place with backward-compat note: ZOMBIE_AGENT_PROTOCOL, AUTONOMY_CONTRACT, AGENT_47_HANDOFF, OPERATOR_STATE, R100_AUDIT_CHECKLIST_TEMPLATE, BRIEF_PREAMBLE_R100.
- READMEs updated: root, rules/, operator-meta/.
- NOT touched: handoffs/overnight-2026-06-19/, DECISION_LOG.md, crons, product repos. (empty operator-meta/R100_hyperscaler/ dir left as-is.)

## Open questions for operator
1. Cron-job idempotency (candidate 25) was only partially absorbed into R90 — may warrant its own rule if scheduled jobs grow.
2. Read-after-write consistency and connection-pool hygiene were deferred; flag if either is a current pain point.
3. R5/R3 preserve operator typos verbatim ("m yemail", "loosing", "PROBL;EMS") with footnotes — confirm that's the desired treatment in the constitution.
