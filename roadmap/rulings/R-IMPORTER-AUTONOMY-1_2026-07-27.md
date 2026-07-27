# R-IMPORTER-AUTONOMY-1 — Autonomous, site-agnostic, browser-agnostic importing is the core product bar; the one-site v0.3 ceiling is superseded

- **Ruling ID:** R-IMPORTER-AUTONOMY-1
- **Date:** 2026-07-27
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 74, executing under the standing R138 autonomy grant. The R138 four-question gate for this ruling is recorded in [`PRE_BUILD_REVIEW_OP74.md`](../../handoffs/op74/PRE_BUILD_REVIEW_OP74.md) Part 5.
- **Status:** ACTIVE
- **Scope:** the product bar for the importer wave — what "done" means for importing, and what every current and future importer doc, brief, spec, contract, and release plan must treat as the target.
- **Baseline:** [`BASELINE_HEADS_OP74.json`](../../handoffs/op74/BASELINE_HEADS_OP74.json) (context `9c25a06`, backend `5076a07a`, mobile `a5933fd`, extension `95be0222`).
- **Does NOT amend:** any rule body in `AGENT_RULES.md`; any operator verbatim quote; the shipped code of any landed PR; the historical record of any prior Op.
- **Supersedes:** the reading of **v0.3 (one site, one browser) as a product ceiling**. It does not supersede v0.3 as a *completed validation milestone*.
- **Reinforces:** [`R-SITE-AGNOSTIC-1_2026-07-20`](R-SITE-AGNOSTIC-1_2026-07-20.md) · [`R-RULE-AUTHORITY-1_2026-07-20`](R-RULE-AUTHORITY-1_2026-07-20.md) · [`R-CROSS-REPO-AUTHORITY-2_2026-07-27`](R-CROSS-REPO-AUTHORITY-2_2026-07-27.md)

---

## Background

The canonical mission has been site-agnostic and browser-agnostic since the Op-54 correction, and [[R-SITE-AGNOSTIC-1_2026-07-20]] removed any privilege that could be read into TrueCoach as the "first proving adapter." V5 (Op 70) then *certified* the generic kernel: a deterministic two-adapter end-to-end proof through the **same unchanged reconstruct core**, with **core-diff-zero** for adapter #2 and byte-identical contract `importer-openapi 1.4.0` (R80).

Despite that, the operating docs still read as though **v0.3 — one site (TrueCoach), one browser (Chrome) — were the product ceiling**, with multi-site and multi-browser parked behind a "v1.0 acceptance MENU." That framing is an artifact of validation sequencing, not a product decision, and it has three concrete costs:

1. It inverts the mission: the *validation adapter* becomes the *product definition*, exactly what R-SITE-AGNOSTIC-1 §1 forbids.
2. It makes autonomy look like a future feature to be scheduled, when the kernel that must deliver it is already built and certified.
3. It lets a **one-adapter** result be read as product completeness — the same assert-don't-derive failure that let A03 read "MOSTLY built" for five weeks (see the Op-74 Idiot Index).

This ruling fixes the product bar. It does not schedule work, and it does not claim work is done.

## The ruling

1. **The core product bar is autonomous, site-agnostic, browser-agnostic importing.** The product is *not* "imports from TrueCoach in Chrome." It is: a coach points TGP at a source they are authorized to access, and TGP **autonomously** acquires and deterministically reconstructs their data into canonical TGP entities — **regardless of which site** the data lives on and **regardless of which browser host** the acquisition runs in. Every importer doc, brief, spec, and release plan reads this as the target.

2. **The v0.3 one-site ceiling is superseded as a ceiling.** v0.3 remains valid and unrewritten as **what it actually was**: the first end-to-end validation of the generic pipeline through one interchangeable adapter on one host. It is a **milestone achieved**, never a statement of what the product may do. No doc may cite v0.3 to argue that multi-site or multi-browser support is out of scope, deferred by definition, or a "v1.0 nice-to-have."

3. **"Autonomous" has a fixed meaning here.** Autonomy = the system determines *how* to acquire and reconstruct from a newly-encountered source **without a hand-written, site-specific code path in the core**. Concretely: a new site is onboarded as **data** — blueprints, mappings, induced structure — and never as a core code change. The standing mechanical test is the V5 gate, promoted from one-time certification to a **permanent acceptance gate**: adding an adapter must produce **core diff == 0**.

4. **No adapter-specific core, restated and extended to hosts.** R-SITE-AGNOSTIC-1 §3 forbids encoding any single site's semantics in a canonical contract, schema, entity family, cursor, or endpoint. This ruling extends the identical prohibition to **browser hosts**: no browser-specific assumption may leak into the kernel, the contract, or the canonical entities. Host differences live behind one injection boundary.

5. **Multi-adapter and multi-host are acceptance evidence, not a feature backlog.** The bar is met only when demonstrated against **structurally different** shapes — never by a single adapter, however polished. Evidence requirements are in §"Acceptance evidence" below.

6. **Nothing here authorizes a build, a landing, a flag flip, or a completion claim.** This ruling sets the bar. Scope, sequencing, ownership, and gates are governed by [`OWNERSHIP_AND_PR_LADDER.md`](../../handoffs/op74/OWNERSHIP_AND_PR_LADDER.md). The `truth_boundaries.no_e2e_proof_yet` boundary **still holds**: V5 certified the **deterministic-fixture** path only; a certified real-account live full-loop run remains **DEFERRED and NOT claimed**.

7. **Relationship to R138 (newest-wins, no silent rewrite).** The Op-73 R138 **BUILD SMALLER** verdict and its authorized slices (C1 backend contract → M5 mobile onboarding → extension slice → separately-gated pilot) remain **fully intact and unmodified**. R138 governs *how large a slice may be*; this ruling governs *what the finished product must do*. A BUILD-SMALLER verdict is a sequencing instrument and may **never** be cited as evidence that the product bar is smaller. Where an older doc reads the v0.3 slice as the ceiling and this ruling reads it as a milestone, **this ruling wins on that point only** (newest-wins), and the older prose is **retained, not rewritten** (R5/R132).

## Gates preserved (non-negotiable)

Raising the bar relaxes **nothing**. Every gate below survives this ruling unchanged and unweakened. Any future work claiming this ruling as authority inherits all of them.

- **Consent.** User-authorized access only. No bypass of any source access control. A coach may only import data they are genuinely authorized to access; authorization is established per source, never inferred from a prior source.
- **Security.** **No source-credential storage on TGP servers.** No credential exfiltration. Server-minted, non-client-forgeable identifiers for session/intent (never client-minted trust). Existing token-isolation boundaries hold.
- **Billing capture exclusion — REAFFIRMED, NOT RELAXED.** The importer must never capture, stage, log, reconstruct, or claim completion for any billing data from any source, on any site, in any browser. This is an R5-protected operator-verbatim directive. **Widening the site surface widens the exclusion with it** — every new adapter accounts billing as an explicit `excluded` family with reason, never as a failure. This exclusion is entirely distinct from, and unaffected by, the platform dunning bar in [[R-DUNNING-BAR-1_2026-07-27]], which concerns TGP's **own** billing state and never source-site billing data.
- **Honesty.** Fail closed on ambiguous mappings. **Never claim inaccessible data was imported.** Honest accounting `staged = reconstructed + skipped + failed` with reasons, per family, per adapter. Poison rows are honestly `failed`.
- **Audit.** Audit events on import actions; erased entities proven absent by cascade + fail-closed RLS behavior of the D2 model — **never** by adding a `Deleted` state or tombstone.
- **Flags.** All importer flags remain **default-OFF**. This ruling flips nothing and authorizes no flip. Flags-off must yield a uniform 404.
- **Rollback.** Every landing keeps a documented forward-only rollback and a single-parent, revertible history. No history rewrite; no force-push over shared `main`.
- **Evidence.** Per-PR gates unchanged: R14 dual-lens CLEAN with 0 P0–P3 at the exact head; R74 test:src ≥ 2.0; R75 banned-cast net ≤ 0; R23/R76 ≤ 400 prod LOC; R79 sweep; R80 byte-pinned contract (a forced bump = core-contract change = **STOP**); R124 both-ways SHA; R3 identity.
- **RLS.** Coach-A can never read coach-B, on any adapter.

## Acceptance evidence (how the bar is proven, not asserted)

The bar is met only on evidence. Asserting it is a P0 finding.

| # | Evidence | Bar |
|---|---|---|
| E1 | **Core-diff-zero on adapter addition** | Adding an adapter changes 0 lines of core (registry-seam line excepted, as certified at V5). Mechanically diffed, not claimed. |
| E2 | **≥3 structurally different sites** | Deterministic end-to-end reconstruct through the same unchanged core. Structural difference is demonstrated, not asserted. |
| E3 | **≥2 browser hosts** | Same kernel, same contract, different host injection. No host-specific core branch. |
| E4 | **Byte-pinned contract stability** | `importer-openapi` byte-identical across all adapters/hosts (R80). A forced bump is a STOP. |
| E5 | **Honest accounting per adapter × family** | `staged = reconstructed + skipped + failed`; billing accounted `excluded`. |
| E6 | **Autonomy, not hand-mapping** | A newly-encountered source is onboarded as data/blueprint. Any site-specific core code path fails this bar outright. |
| E7 | **Isolation + erasure per adapter** | Coach-A cannot read coach-B; erased entities absent via cascade/RLS, no tombstone. |
| E8 | **Idempotent replay** | Within-run replay is a no-op; cursors stable and bound to coach + family + intent. |
| E9 | **Real-account proof, separately** | A certified live full-loop run is its **own** gate and remains **DEFERRED**. E1–E8 passing does **not** discharge E9, and no fixture result may be reported as a live result. |

## Hyperscaler lens

This is the standard **conformance-target integration catalog** pattern: a provider defines one generic contract and treats each supported integration as a conformance target exercising it, so no integration becomes an architecture driver and integration count scales without core change. The browser-host boundary follows cross-browser WebExtensions practice — one API surface, host differences quarantined behind a single adapter layer. Both are the same principle R-RULE-AUTHORITY-1 applied to rules and AWS Organizations / GCP Organization Policy apply to policy: **define once at the core, inherit by reference at the edge.**

## What this changes / does not change

- **Changes:** the product bar, from "one site, one browser, then maybe more" to "autonomous, site-agnostic, browser-agnostic from inception, proven on evidence." Removes v0.3's standing as a ceiling. Promotes V5's core-diff-zero certification into a permanent acceptance gate. Extends the no-adapter-specific-core prohibition to browser hosts.
- **Does not change:** any rule; any operator verbatim quote; the billing-capture exclusion (reaffirmed); any landed code; any historical Op record; the default-OFF flag posture; the Op-73 R138 BUILD-SMALLER slices; `truth_boundaries.no_e2e_proof_yet`; the deferred status of real-account proof.

## Filing metadata

- **Filed under:** `roadmap/rulings/` (context repo), per the R4 path convention (scope-resolution docs live in the context repo).
- **Author:** Bradley Gleave (R3).
- **Doctrine effect:** reinforces R1, R-SITE-AGNOSTIC-1, and the Op-54 mission correction; adds no rule; amends no rule.
- **Cross-refs:** [[R-SITE-AGNOSTIC-1_2026-07-20]] · [[R-RULE-AUTHORITY-1_2026-07-20]] · [[R-DUNNING-BAR-1_2026-07-27]] · [[R-CROSS-REPO-AUTHORITY-2_2026-07-27]] · `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` · `roadmap/specs/A02-import-tooling.md` · `DECISION_LOG.md` (Op 74).
