# DECISION LOG

Operator-signed decisions that changed doctrine, architecture, or process. Every AGENT_RULES.md change requires a corresponding entry here (per the AGENT_RULES.md footer).

Newest first.

---

## 2026-06-30 — Add R130–R137 (First-Principles Doctrine)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Doctrine addition
**File touched:** `AGENT_RULES.md` (new §13, +6.3 KB)

**Summary.** Added eight new rules encoding Elon Musk's "Algorithm" (question → delete → simplify → accelerate → automate) plus two supporting rules:
- **R130** — Idiot Index (actual vs. theoretical-minimum cost, flag ≥ 3× ratios).
- **R131** — Question every requirement (including these rules; last-verified date required if > 6 months).
- **R132** — Delete before optimizing (if you don't add back ≥ 10%, you didn't delete enough).
- **R133** — Simplify only after R131 + R132.
- **R134** — Accelerate cycle time only after R131–R133.
- **R135** — Automate last.
- **R136** — Constraint audit: separate hard constraints (physics, TOS, regulation) from self-imposed policy (self-imposed → subject to R131).
- **R137** — Cycle-time ledger: per-wave dispatch/round/merge log; > 3-round PRs get a root-cause; > 1 lens-disagreement PRs get a doctrine-gap note.

**Motivating evidence (this wave, W1.5).** Two lens-disagreements produced audit-round waste that R131 + R137 would have prevented:
1. **R82 IRREVERSIBLE misread.** Round-1 fixer marked the `pg_stat_statements` migration IRREVERSIBLE with a comment; Lens A accepted it, Lens B correctly rejected it in round 2 ("every migration has a `down`"). R131 would have forced re-verification of "IRREVERSIBLE" as a doctrine escape hatch.
2. **R75 misread as src-only.** Lens A originally missed 27 banned-cast hits in `test/observability/*` because the auditor read R75 as applying to `src/` alone. The rule verbatim covers `src/` AND `test/`. R131 (question the reading) + R137 (log the disagreement) would have caught this in round 1.

**R136 immediate application — extension redesign.** The concurrent importer-extension design work anchors on R136: the only hard constraints for the browser extension are Chrome MV3 sandboxing, per-site TOS rate limits, and the locked `_interface.js` contract. Everything else (TGP-initiated-only flow, absence of in-popup auth) is self-imposed and is being challenged in the redesign.

**Scope confirmation.** Operator (via ask_user_question 2026-06-30 17:03 PDT) selected "All eight (R130–R137)" and "Push now" (do not wait for wave close).

**Companion doctrine.** R131 obliges this rules addition itself to be revisitable. Re-verification date: 2026-12-30.
