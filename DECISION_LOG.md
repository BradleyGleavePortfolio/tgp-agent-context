# DECISION LOG

Operator-signed decisions that changed doctrine, architecture, or process. Every AGENT_RULES.md change requires a corresponding entry here (per the AGENT_RULES.md footer).

Newest first.

---

## 2026-07-13 — Add R138 (Operator Autonomy Grant + Four-Question Decision Gate + 24/7 Layered Wake)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Doctrine addition + governance supersession
**Files touched:** `AGENT_RULES.md` (new §14 / R138; supersession notes on R9 and R15; audit-lens line in Appendix A), `DECISION_LOG.md`.

**Summary.** The operator, acting as CEO/CPO/CTO, delegated full executive authority to the acting agent for Bradley Gleave's TGP project: no operator approval is required for any decision — merging, squash-merging, or directional choices — provided the agent FIRST runs and records a mandatory four-question decision gate. Added as **R138** (new §14), with the operator's words preserved verbatim (both the CEO/CPO/CTO grant and the "stay awake forever / wake up anytime something finishes" durability addendum) per R5.

**What R138 delegates.** The R9 "Agent MUST present an operator choice" boundaries (a)–(j) and R15's "No PR merges to production `main` without operator approval" are SUPERSEDED **for this operator/project only** — replaced by the four-question gate. Both rules remain canonical for any other operator/project and were not deleted (prior doctrine preserved per R5/R132).

**What R138 does NOT waive (GOOD without the BAD).** The R14 audit cycle stays mandatory for product code (delegated *approval*, never the *audit*); R1 (decacorn) and R3 (identity) are SACRED and untouched; irreversible external side effects still require flag + expand-contract migration + idempotency + monitoring + rollback (hyperscaler pattern), not a bypass. Precedence: R138 is subordinate to R1/R3/R14.

**The four-question gate (operator's questions, each with a researched standard).** (1) Musk's 5-step Algorithm in order — question → delete → simplify → accelerate → automate (§13 R130–R137; [Inc./Isaacson](https://www.inc.com/jeff-haden/elon-musks-algorithm-a-5-step-process-to-dramatically-improve-nearly-everything-is-both-simple-brilliant.html)); (2) What would hyperscalers do — canary/one-box rollouts, automated rollback, blast-radius containment, pipeline gates instead of per-change human approval ([AWS Builders' Library](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/), [Google Cloud approach-to-change](https://docs.cloud.google.com/docs/cloud-approach-to-change), [Google safe rollouts](https://docs.cloud.google.com/kubernetes-engine/config-sync/docs/tutorials/safe-rollouts-with-config-sync)), plus [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests) for retry-safe decisions; (3) GOOD without BAD — keep velocity, gate risk with flag+canary+rollback+audit; (4) root-cause check (composes with R131/R19). The gate is recorded as an `R138 Decision Gate` block in the PR body (+ a DECISION_LOG entry for doctrine/architecture decisions); a governed merge/pivot without the record is a P1 finding.

**24/7 layered wake / durability (reconciled with R6 no-daemon).** Layered: (1) survive death first — push ≤2 min + checkpoints (R4/R6); (2) event-driven wake on completion (primary); (3) foreground heartbeat/scheduled wake for external state only (NOT a background daemon — R6's deprecated auto-push daemon stays banned); (4) watch coverage must match failure states, not just success; (5) zombie sweep on every pickup + session end (R8); (6) subagent liveness probes ≥ every 15 min (R7).

**R125 enforcement.** (1) rule text — this PR; (2) gate/enforcement — the mandatory R138 Decision Record + this DECISION_LOG entry (the machine-checkable delegated-approval artifact); propagation into product-repo PR templates (R101) + a heading-presence CI check tracked as R125/R20 follow-up; (3) audit-lens — added to Appendix A. Enforcers (1) and (3) land in this PR; enforcer (2) lands as the Decision-Record convention with the CI-check propagation tracked as follow-up.

**Audit exemption.** Pure context/doctrine docs are exempt from the product audit cycle (R14 scope); this change required only the four-question gate + this DECISION_LOG entry, and was merged under the R138 grant once applicable checks were green.

**Companion doctrine.** Subject to R131 — R138 is revisitable. Re-verification date: 2027-01-13.

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
