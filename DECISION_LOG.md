# DECISION LOG

Operator-signed decisions that changed doctrine, architecture, or process. Every AGENT_RULES.md change requires a corresponding entry here (per the AGENT_RULES.md footer).

Newest first.

---

## 2026-07-15 — Importer product-mission correction (site-agnostic/browser-agnostic; TrueCoach = first proof, not the product)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Product-mission correction (R5) + documentation reconciliation
**Files touched:** `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` (new canonical mission doc), `roadmap/M-IMPORTER-EXTENSION_v1.md` (demoted to first-vertical-slice build-plan), `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md` (§0-MISSION preamble), `handoffs/importer-wave/current-state.json` (`product_mission_correction_2026_07_15` block), `DECISION_LOG.md`, `roadmap/OPERATOR_DECISIONS_LOG.md`. **No product code changed.**

**Operator quote (verbatim, 2026-07-15 — do not paraphrase; preserved per R5):**
> "WRONG - your building a site agnsotics, ultra easy to use, browser agnostic tool that can seamlessly and autonymously pull ALL data from any comeptitors site - send to TGP Database, and be reconstructed to our set values instantly with a luxury UI while doing so!"

**Summary.** The operator corrected the importer mission: the product is **site-agnostic, browser-agnostic, autonomously-learning acquisition of ALL user-authorized data → TGP database → deterministic reconstruction into TGP's set values → luxury UI, with honest completeness accounting.** Prior canonical wording (chiefly `M-IMPORTER-EXTENSION_v1.md`) mistook **TrueCoach v0.3** — one proving adapter — for the whole product, and implied Chrome-only + a per-competitor mapped-extractor treadmill. TrueCoach on Chrome is now recorded explicitly as the **first proving adapter / vertical slice only.**

**Decision (R138 gate recorded in `M-IMPORTER-PRODUCT-MISSION_v1.md` §4; three options weighed in §5).** Selected **Option C** — split the mission (new canonical doc, verbatim quote at top) from the build-plan (`M-IMPORTER-EXTENSION_v1.md`, demoted to the first vertical slice), reconcile the state + handoff wording, and add a six-workstream PR graph (extension core, browser portability, autonomous learning, canonical mapping/reconstruction, backend orchestration/progress, luxury UI) that carries the wave from the proof to v1.0. Rejected Option A (leave stale wording — fails the correction + R5) and Option B (rip out TrueCoach/Chrome and build full generality before shipping — discards the audited, merge-ready v0.3 proof; violates R4 + "automate last").

**What is preserved.** The live v0.3 implementation (EXT-C1b PR #6 @`55f24d5` merge-ready; Mobile M2 PR #285 @`10414c4` dual-lens r2 in progress) is unchanged and authoritative — it is the first end-to-end proof. The engine (#5) is already `chrome.*`-free and host-injected, so the mission architecture is already partly built.

**Legal/security invariants clarified (mission doc §2, hard constraints R136):** no source-credential storage on TGP servers; user-authorized access only; no bypass of source access controls; fail closed on ambiguous mappings; never claim inaccessible data was imported.

**Five distinctions made explicit (mission doc §3):** MISSION ≠ FIRST PROOF ≠ CURRENT STATE ≠ v0.3 COMPLETION (current launch bar) ≠ v1.0 ACCEPTANCE (mission made testable).

**Audit exemption.** Pure context/documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

**Companion doctrine.** Subject to R131 — revisitable. Re-verification date: 2026-10-15.

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

---

## 2026-07-13 — Adopt Autonomous CEO/CPO/CTO Operating Constitution

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Constitutional doctrine
**Canonical file:** `AGENT_RULES.md` — Operator Constitution Addendum

### Decision record

**DECISION:** Preserve the operator's constitution verbatim inside the single canonical `AGENT_RULES.md`; apply it proportionally to every importer decision and require concise decision records without exposing raw chain-of-thought.

**REAL GOAL:** Keep autonomous execution fast while making consequential choices evidence-based, reversible, root-cause-oriented, and operable at hyperscaler quality.

**ROOT CAUSE:** Prior doctrine contained the component principles, but the decision sequence, option-selection discipline, extreme tests, good-without-bad synthesis, and standard record were fragmented.

**FIVE-STEP RESULT:**
- **Questioned:** A second canonical rules file was rejected because `AGENT_RULES.md` is the sole source of truth.
- **Deleted:** No duplicate constitution file or approval ceremony was added.
- **Simplified:** One verbatim addendum and one standard decision-record shape.
- **Accelerated:** The recurring importer watchdog now loads the same canonical doctrine each run.
- **Automated last:** Automation only enforces the already-simplified decision record and execution loop.

**IDIOT-INDEX RESULT:** Added no new service, dependency, state machine, or approval handoff; one source of truth governs all roles.

**EXTREME TEST:** At 100× work volume or after agent/session failure, the canonical rules plus live state and pushed commits remain sufficient to resume safely.

**HYPERSCALER LENS:** Small reversible PRs, exact-head audits, CI gates, canonical state, bounded failure, rollback, and observable evidence remain mandatory.

**GOOD WITHOUT BAD:** Preserve autonomous velocity and broad executive ownership while retaining independent audits, security boundaries, irreversible-action gates, and project doctrine precedence.

**EVIDENCE REQUIRED:** Exact constitution text in `AGENT_RULES.md`; watchdog references that canonical section; dual-lens CLEAN and CI remain merge gates; live state updated after audit/fix/merge.

**ROLLBACK / STOP:** Constitutional changes require an explicit operator instruction and signed doctrine commit. Product execution stops only at proven v0.3 E2E completion or a genuine external blocker.

**NEXT ACTION:** Build the narrowest end-to-end autonomous crawl unit: Start Import CTA → site-agnostic discovery/replay → bounded ingest/progress, then independently audit it.
