# Op 74 — Mandated Five-Part Pre-Build Review

- **Op:** 74
- **Date:** 2026-07-27
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Executing under:** the standing R138 autonomy grant (CEO/CPO/CTO authority; four-question gate recorded below in Part 5).
- **Scope of this document:** governance only. **0 production LOC.** This review authorizes *scope and product bar*; it builds nothing, lands nothing, flips no flag, and certifies no completion.
- **Baseline:** all statements below are true as of the four audited HEADs pinned in [`BASELINE_HEADS_OP74.json`](BASELINE_HEADS_OP74.json). Drift off any pin is INFRA_DEATH per R124.
- **Related:** [`OWNERSHIP_AND_PR_LADDER.md`](OWNERSHIP_AND_PR_LADDER.md) · [`R-IMPORTER-AUTONOMY-1`](../../roadmap/rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md) · [`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) · [`R-CROSS-REPO-AUTHORITY-2`](../../roadmap/rulings/R-CROSS-REPO-AUTHORITY-2_2026-07-27.md)

The five parts below are mandated in order: **(1) Idiot Index → (2) explicit assumptions → (3) lazy-senior simplification review with no capability cuts → (4) hyperscaler-quality scan → (5) bottom-line decision.**

---

## Part 1 — Idiot Index (R130)

R130: `actual_cost / theoretical_minimum_cost`; ratio ≥ 3× marks the workflow as a redesign candidate under R131–R134. Costs below are counted in **operator-paid Ops** (the unit the project actually spends), measured from the decision log, not estimated.

| # | Workflow | Actual | Theoretical minimum | Index | Verdict |
|---|---|---|---|---|---|
| 1 | **Importer: reach a proven end-to-end vertical** (Op 59 D2 → Op 70 V5 complete) | 12 Ops | 4 Ops (decide entity model → build reconstruct core → build one adapter → prove) | **3.0×** | ⚠️ At threshold. Driver: each V-PR needed its own docs/state reconcile Op *after* landing. |
| 2 | **Docs/state reconcile per landing** (Ops 64, 66, 67, 69, 70, 72) | 6 reconcile-only Ops | 0 (reconcile folds into the landing Op) | **∞ (pure overhead)** | 🔴 **Worst index in the program.** A whole Op class exists only to write down what already happened. |
| 3 | **Governance defect discovery** (R161 phantom, R86 overload, header range, missing Op 70) | 4 defects surviving ≥2 Ops each, found only by targeted sweep at Op 74 | 0 (caught at write time by a validator) | **🔴 unbounded** | No mechanical check exists; every defect is found by a human-equivalent read. |
| 4 | **Dunning: A03 from "MOSTLY built" claim → honest PARTIAL** | Op 73 reclassification, after the false status stood since 2026-06-19 | 0 (status is evidence-derived, never asserted) | **🔴 unbounded** | A status field was *asserted* rather than *derived*; it stayed wrong ~5 weeks. |
| 5 | **Scout flag readiness** (Op 71 authorize → Op 72 land, +48/−0) | 2 Ops for a 48-line config/test change | 1 Op | **2.0×** | ✅ Acceptable. Below threshold. |

### What the index actually says

Rows 2, 3, and 4 share one root cause, and it is **not** the importer and **not** dunning. It is that **the project's state of truth is maintained by narration instead of derivation.** Every landing costs a second Op to narrate; every governance number is hand-copied and therefore rots; every feature status is asserted by whoever wrote the line last.

Row 1 (3.0×) is the only *product* workflow at threshold, and its excess is entirely row 2's overhead pushed into it. The build work itself is efficient.

**R131–R134 application.** Question (R131): does a reconcile-only Op class need to exist? No — it exists because the landing Op cannot record its own commit SHA (visible in the Op-73 entry, which recorded its parent `ed5729a` rather than itself). Delete (R132): the reconcile-only Op class should be deleted, not optimized. Simplify (R133): a landing records forward-looking state; a *successor* Op pins the predecessor's tip — which is exactly what `BASELINE_HEADS_OP74.json` does for the first time here. Accelerate (R134) and Automate (R135) come after, not now.

**Consequence carried into Part 5:** Op 74 does not attempt to fix the reconcile-Op class (that is out of scope and would be scope creep). It does refuse to *add* a new narration surface: the four baseline pins are written **once**, in **one machine-readable file**, and every other Op-74 artifact links to that file rather than re-transcribing SHAs. This is the smallest available structural answer to the worst index in the table.

---

## Part 2 — Explicit assumptions

Stated so they can be falsified rather than silently relied upon. Each carries what breaks if it is wrong.

| # | Assumption | Confidence | If false |
|---|---|---|---|
| A1 | The four pinned HEADs are the live default branches of their repos at Op-74 time. | **Verified** — each fetched from the GitHub API and compared to live `main`. | INFRA_DEATH per R124; re-verify before any downstream action. |
| A2 | Backend `5076a07a` genuinely mounts the Dunning V2 Day-10 lockout guard, closing A03 gap 1 of 6. | **High** — the diff touches `dunning-lockout.guard.ts` + `app.module.ts` with two dedicated test files (+395/−48). | The A03 gap count in Part 5 is wrong by one; the dunning bar and PR ladder are unaffected. |
| A3 | `build-sbom` and `release-please` are pre-existing, diff-independent infra reds, not product regressions. | **High** — both recorded RED on prior bases at Op 71 and Op 72 and quarantined in a separate lane. | A red CI signal is being wrongly discounted; the backend baseline would need re-audit. |
| A4 | The importer's **billing-capture exclusion** is an R5-protected operator-verbatim directive and is *not* in tension with building platform dunning. | **Verified** — the exclusion governs what the importer may *capture from a source site*; dunning governs TGP's *own* billing state. Different subjects. | The two workstreams would need a conflict ruling before either proceeds. |
| A5 | No R-rule verbatim operator quote needs to change to accomplish Op 74. | **Verified** — every Op-74 rules edit is navigation metadata (header range, disambiguation pointers), never a quote or rule body. | Op 74 would exceed R9(c)/R5 and require the operator personally. |
| A6 | The absence of an Op-70 `DECISION_LOG.md` entry is a clerical omission, not a deliberate redaction. | **High** — a complete `decision_record_op70_v5_complete_2026_07_21` object exists in `current-state.json` with full verified facts; only the prose entry is missing. | A backfill would be rewriting a deliberate decision; Op 74 backfills as a clearly-labelled *reconstruction from the JSON record*, never as an original entry, so this stays safe either way. |
| A7 | Nobody has independently audited backend `5076a07a` under R14. | **Medium** — no associated PR is discoverable via the commits/pulls API, so no audit trail is *findable*; absence of evidence is not proof of absence. | The blocker in Part 5 dissolves; the landing is already compliant except for R3 identity. |
| A8 | "Autonomous, site-agnostic, browser-agnostic importing" as a product bar does **not** require abandoning the existing reconstruct core. | **High** — R-SITE-AGNOSTIC-1 already forbids adapter-specific core, and V5 certified core-diff-zero across two structurally different adapters. | The importer autonomy ruling would imply a rewrite rather than an extension, changing its blast radius entirely. |

**Assumption explicitly refused.** Op 74 does **not** assume the importer works against a real source account. `truth_boundaries.no_e2e_proof_yet` still holds; V5 certified the **deterministic-fixture** path only.

---

## Part 3 — Lazy-senior simplification review (no capability cuts)

The lazy-senior lens: *what would a senior engineer who resents unnecessary work delete, while shipping every capability the operator asked for?* The hard constraint on this section is **no capability cuts** — simplification must reduce mechanism, never scope.

### Cut (mechanism removed, capability retained)

| Candidate | Ruling | Capability preserved how |
|---|---|---|
| A new "autonomy engine" subsystem for site-agnostic importing | **CUT.** | The kernel is already generic and host-injected; V5 proved core-diff-zero across two adapters. Autonomy is a **bar the existing core must meet**, expressed as acceptance evidence, not a new subsystem. |
| A second progress/telemetry surface for dunning | **CUT.** | Dunning observability rides the existing `AuditEvent` + notifications substrate. A03's own doctrine flags already mandate `AuditEvent` per nudge/intervention. |
| Re-transcribing the four SHAs into every Op-74 artifact | **CUT.** | One machine-readable pin file; every other document links to it. Directly answers Idiot Index row 3. |
| A new R-rule for autonomous importing | **CUT.** | R1 (decacorn), R138 (gate), R-SITE-AGNOSTIC-1 (no adapter-specific core) already bind. Op 74 files **rulings**, which clarify without amending — the same instrument Ops 65 and 71 used. |
| A new R-rule for dunning quality | **CUT.** | R86 (SLO), R90 (idempotency), R83 (flags), R82/R106 (expand-contract), R107 (audit log), R98 (PII) already bind. The ruling *assigns* them to dunning; it invents no new obligation. |
| Renumbering rules to close the R127–R129 gap | **CUT — and forbidden.** | R5's lost-forever note is explicit: do not renumber to fake-fill a range. The gap is **documented**, not closed. |
| A separate "extension governance" doctrine document | **CUT.** | R-RULE-AUTHORITY-1 already scopes `tgp-importer-extension`. Op 74 installs a **pointer**, not a parallel doctrine. |

### Keep (irreducible)

- **Four independently-verified baseline pins.** R124 requires exact SHAs both ways; this is the floor, not overhead.
- **Honest recording of the R3 violation on backend `5076a07a`.** Precedent R3-INC-1/2/3 is unambiguous: record openly, never silently rewrite published history.
- **Separate importer and dunning ownership lists.** R4 clause 1 requires an OWNS-list overlap check before any parallel dispatch. Two workstreams touching one backend make this mandatory, not optional.
- **The Op-70 backfill.** R5 forbids losing anything; a decision that exists in state but not in the log is half-lost.

### Capability audit — did anything get cut?

Every capability named in the Op-74 objective is traced to a surviving artifact:

| Required capability | Survives in |
|---|---|
| Autonomous, site-agnostic, browser-agnostic importing as core bar | R-IMPORTER-AUTONOMY-1 §"The ruling" |
| Consent, security, audit, flags, rollback, evidence gates preserved | R-IMPORTER-AUTONOMY-1 §"Gates preserved (non-negotiable)" |
| Deterministic billing/entitlement state | R-DUNNING-BAR-1 §P1 |
| Idempotent ordered events | R-DUNNING-BAR-1 §P2 |
| Recovery | R-DUNNING-BAR-1 §P3 |
| Communications | R-DUNNING-BAR-1 §P4 |
| Observability | R-DUNNING-BAR-1 §P5 |
| Replay / backfill | R-DUNNING-BAR-1 §P6 |
| Operator tooling | R-DUNNING-BAR-1 §P7 |
| Safe degradation | R-DUNNING-BAR-1 §P8 |
| Security | R-DUNNING-BAR-1 §P9 |
| Audited rollout | R-DUNNING-BAR-1 §P10 |
| Collision-free ownership, serialization, ladder, deps, stops, evidence, activation gates | OWNERSHIP_AND_PR_LADDER.md §1–§7 |
| Extension by-reference authority pointer | R-CROSS-REPO-AUTHORITY-2 |

**Result: 0 capability cuts.** Every cut above removed mechanism, not scope.

---

## Part 4 — Hyperscaler-quality scan

Per R15's hyperscaler reference mandate and R138 Q2, each non-trivial choice cites a concrete external practice. "I designed it this way" is not acceptable.

| Decision | Hyperscaler reference | What we take |
|---|---|---|
| Autonomy as an **acceptance bar** on a generic kernel, not a new subsystem | Cloud provider integration catalogs define one generic contract and treat each integration as a conformance target | New sites must land as **data/blueprints**, with core diff == 0 — the V5 gate, promoted from one-time proof to standing rule |
| Browser-agnostic host layer | WebExtensions cross-browser API surface | Host adapters isolated behind one injection boundary; no browser-specific logic in the kernel |
| Deterministic billing/entitlement state | Stripe subscription lifecycle as an explicit state machine | Entitlement is a **derived projection** of billing state, never independently hand-set |
| Idempotent ordered events | [Stripe idempotency keys](https://docs.stripe.com/api/idempotent_requests) (already cited by R138 and R90) | Every dunning transition carries an idempotency key; replay is a no-op, not a double-charge or double-send |
| Out-of-order and duplicate webhook delivery | Stripe/AWS at-least-once delivery semantics | Consumers are commutative where possible and version-checked where not; late events never resurrect a settled state |
| Recovery flows | Stripe smart retries + hosted recovery links | Server-minted, expiring, single-use recovery tokens; no client-forgeable state |
| Communications | Transactional-email deliverability practice (auth, suppression lists, per-user rate caps) | Cadence caps, suppression, and per-recipient dedupe are platform obligations, not per-feature code |
| Observability + SLO | Google SRE error budgets (already encoded as R86/R99) | Dunning declares p99 + error budget before merge; budget burn freezes feature work on that path |
| Replay / backfill | Event-sourcing replay from an append-only log | Replay must be provably side-effect-free in dry-run before any live backfill |
| Safe degradation | Circuit breakers (already mandated in §12 INFRA-AS-DOCTRINE for Stripe/external calls) | Processor outage **fails closed on lockout** and never mass-locks users on a TGP-side fault |
| Audited rollout | AWS/GCP canary + one-box + automatic rollback (the exact references R138 already cites) | Flag-gated, cohort-canaried, auto-rollback on alarm — no big-bang enablement |
| Cross-repo rule resolution by reference | AWS Organizations / GCP Organization Policy inheritance | Already ruled in R-RULE-AUTHORITY-1; Op 74 extends the same pattern to the extension repo |

### Scan findings against the current state

1. **🔴 P1 — R3 identity violation at the backend baseline.** `5076a07a` is authored *and* committed as `BradleyGleavePortfolio <264851314+…@users.noreply.github.com>`. No hyperscaler ships an unattributable change to a money path. Recorded as **R3-INC-4**; **not** silently rewritten (R3-INC-1 precedent: force-pushing over published shared `main` was deliberately declined and remains declined).
2. **🔴 P1 — no discoverable R14 audit trail for a money-path landing.** A dunning lockout guard gates user access based on payment state. R14 is not waived by R138.
3. **🟠 P2 — asserted rather than derived status.** A03 read "MOSTLY built" for ~5 weeks while its wiring was broken. The dunning bar therefore makes **evidence** the unit of status.
4. **🟠 P2 — governance metadata rot.** Phantom R161, tri-valent R86, stale header range, missing Op-70 entry. Each is individually trivial and collectively corrosive: R-RULE-AUTHORITY-1 §4 makes a non-existent cited rule a **STOP condition**, so a phantom citation is a live hazard, not a typo.
5. **🟢 Confirmed sound.** The site-agnostic kernel with core-diff-zero certification across two structurally independent adapters is genuinely the right architecture. Op 74 promotes it rather than replacing it.

---

## Part 5 — Bottom-line decision

### R138 four-question decision gate (recorded per R138)

**Q1 — Musk 5 first principles.** *Question:* does the operator's direction need new subsystems? No — it needs a **bar** plus honest accounting. *Delete:* deleted the autonomy engine, the second dunning telemetry surface, two proposed R-rules, the SHA re-transcription, and the R127–R129 renumber. *Simplify:* one pin file, three rulings, two handoff artifacts, three surgical metadata edits. *Accelerate:* the PR ladder serializes only where the shared backend genuinely collides, so importer and dunning otherwise run in parallel. *Automate:* last — no automation added here.

**Q2 — What would hyperscalers do?** Twelve concrete references in Part 4. The governing three: conformance-target integration catalogs (autonomy as bar), Stripe idempotency + subscription state machine (dunning correctness), and AWS/GCP canary-with-auto-rollback (activation).

**Q3 — GOOD without the BAD.** *GOOD:* the product bar is raised to autonomous multi-site importing and hyperscaler-grade dunning, and the state of truth becomes honest. *BAD to avoid:* (a) a bar that reads as a completion claim — refused, Op 74 claims nothing complete and pins `no_e2e_proof_yet`; (b) scope creep into a rewrite — refused, core-diff-zero is the standing gate; (c) importer/dunning collision on the shared backend — refused, serialized in the ladder per R4 clause 1; (d) silently rewriting history to make the record look clean — refused, R3-INC-4 and the Op-70 gap are recorded openly and the Op-70 backfill is labelled as a reconstruction; (e) loosening the importer billing-capture exclusion under cover of a dunning mandate — refused, the exclusion is R5-protected and explicitly reaffirmed.

**Q4 — Root cause.** The root cause is **not** "the importer only does one site" and **not** "dunning is half-wired." Both are symptoms. The root cause is that **capability ceilings and feature statuses were asserted rather than derived from evidence** — which is how a one-adapter validation slice hardened into a perceived v0.3 ceiling, and how a broken A03 read "MOSTLY built" for five weeks. Op 74 attacks that root cause: it replaces asserted ceilings with **evidence-gated bars**, and it makes the four baseline HEADs the single derived source for every claim in this Op.

### Verdict

> **PROCEED — RAISE THE BAR, BUILD NOTHING YET.**

Op 74 is authorized to land **governance only**:

1. Record this five-part review.
2. File **R-IMPORTER-AUTONOMY-1**: supersede the one-site v0.3 ceiling with autonomous site-agnostic and browser-agnostic importing as the core product bar, preserving every consent, security, audit, flag, rollback, and evidence gate.
3. File **R-DUNNING-BAR-1**: establish hyperscaler-quality dunning as the product bar and assign the platform its ten obligations (P1–P10).
4. File **R-CROSS-REPO-AUTHORITY-2**: install the extension repository's by-reference authority pointer.
5. Publish **OWNERSHIP_AND_PR_LADDER.md**: collision-free ownership, shared-backend serialization, ladder, dependencies, stop conditions, acceptance evidence, independent activation gates.
6. Pin the four audited baselines in **BASELINE_HEADS_OP74.json**.
7. Reconcile, without silently rewriting history: this Op as **Op 74**; the **missing Op-70** log entry backfilled from its surviving JSON record and labelled as such; the **stale importer billing language** clarified (capture-exclusion stands; platform dunning is a different subject); **R138 vs the newest autonomy mandate** (R138's BUILD-SMALLER slices survive intact and are now *subordinate* to the autonomy bar, not a ceiling on it); the **R161 miscitation**; the **R86 overload**; and the **rules header/range inconsistency**.

**NOT authorized by this Op:** any product code; any flag flip; any live-account pilot; any merge to a product repo; any history rewrite or force-push; any change to an R-rule body or operator verbatim quote; any claim that the importer or dunning is complete.

### Unresolved blockers carried forward

| ID | Blocker | Severity | Owner action |
|---|---|---|---|
| **B1** | **R3-INC-4** — backend `5076a07a` author/committer is not Bradley Gleave. Published on shared `main`. | **P1** | Record openly (done). Do **not** force-push. Apply the identity-safe path in `R3_MERGE_RUNBOOK.md` to all future landings. |
| **B2** | No discoverable R14 dual-lens audit or R138 Decision Record for `5076a07a`, a money-path change. | **P1** | Retroactive adversarial audit of the commit per R14's own failure-mode clause, before any further dunning work lands. |
| **B3** | Backend branch protection absent (`branches/main/protection` → 404) and production secrets not wired. | **P1** | Pre-existing since Op 73; admin/secret-dependent; blocks any dunning activation gate. |
| **B4** | `build-sbom` + `release-please` RED across all recent heads. | **P2** | Quarantined infra lane; must not be folded into a product PR. |
| **B5** | Email/transactional credentials unprovisioned, so dunning communications cannot send. | **P2** | Blocks A03 P4; operator/ops-provisioning dependent. |
| **B6** | Rule numbering gap R127–R129 is real and permanent. | **P3** | Documented, never renumbered (R5). |

---

*Author: Bradley Gleave <bradley@bradleytgpcoaching.com> (R3). Governance only; 0 production LOC; audit-exempt per R14 scope for context-repo documentation.*
