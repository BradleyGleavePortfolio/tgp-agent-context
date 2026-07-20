# R-SITE-AGNOSTIC-1 — TrueCoach is one interchangeable validation adapter, not a privileged first phase

- **Ruling ID:** R-SITE-AGNOSTIC-1
- **Date:** 2026-07-20
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 65, executing under the standing R138 autonomy grant.
- **Status:** ACTIVE
- **Scope:** Product-mission framing for the importer wave — how every current and future doc, brief, decision record, contract, and release plan must read the role of TrueCoach.
- **Does NOT amend:** `AGENT_RULES.md` (no rule added/changed); the shipped code of any landed PR; the historical record of any prior Op. Prior decision-record wording is preserved intact per R5/R132 add-back discipline — this ruling binds *interpretation going forward*, it does not rewrite history.
- **Supersedes:** none. Reinforces the Op-54 canonical mission correction.
- **Related:** `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` (canonical mission), `roadmap/M-IMPORTER-EXTENSION_v1.md` (subordinate first-slice build-plan), [[IMPORTER-I_BUILD_BRIEF]], [[R-RULE-AUTHORITY-1_2026-07-20]].

## Background

The Op-54 correction already established that the product is **site-agnostic, browser-agnostic, autonomously-learning acquisition + deterministic TGP reconstruction + luxury UI**, and demoted `M-IMPORTER-EXTENSION_v1.md` to a first-vertical-slice build-plan. That correction used the phrase "**first proving adapter**." Read literally, "first" can leak an ordering privilege — as if TrueCoach were an MVP, a mandatory first phase, an architecture driver, or a release-sequencing assumption. It is none of those. The engine that runs TrueCoach is already the generic, host-injected, site-agnostic kernel; TrueCoach is merely the concrete target chosen to *validate* that kernel.

## The ruling

1. **Canonical framing.** TrueCoach is **one interchangeable validation adapter** — a concrete target used to prove the generic pipeline end-to-end. It is expressly **NOT**: an MVP; a privileged or mandatory first phase; an architecture driver; or a release-sequencing assumption. The product is **site-agnostic and browser-agnostic from inception**.

2. **No privilege may be inferred from "first."** Where existing canonical docs say "first proving adapter" / "first vertical slice" / "FIRST PROOF," that wording denotes **validation-order convenience only** and confers **no product privilege**. It never constrains the mission, the contract, the schema, or the build order beyond that one validation slice. Any adapter could have been chosen; TrueCoach was chosen to validate, not to define.

3. **No adapter-specific core.** No canonical contract, schema, entity family, cursor, or endpoint may encode TrueCoach (or any single site's) semantics. Adapter details live only behind mappings/blueprints. Contracts should be validated against ≥2 structurally different adapter shapes (or a synthetic second shape) so no single-site assumption leaks into the core. (This binds [[IMPORTER-I_BUILD_BRIEF]] and every future V-PR.)

4. **History is preserved, not rewritten.** Prior decision records, handoff provenance, and landed-PR descriptions that used "first proving adapter" are **left intact** (R5/R132). This ruling is the forward-binding interpretation; it does not edit unrelated history. Only the live north-star doctrine surface (the canonical mission doc) carries a pointer to this ruling.

## Hyperscaler lens

This mirrors how platform providers treat a first-supported integration as a **conformance/validation target**, not a privileged partner: the API contract is defined generically and the first integration merely exercises it, so no downstream consumer inherits first-partner-specific assumptions. Contract-first, provider-neutral (cf. the source-of-truth-contract discipline in R80 and Google AIP contract guidance).

## What this changes / does not change

- **Changes:** fixes the canonical *reading* of "first proving adapter" as validation-order-only, with no privilege; binds every current/future importer doc and V-PR to a site-agnostic, adapter-neutral core; adds a one-line doctrine pointer at the canonical mission doc.
- **Does not change:** the shipped slice, the landed build order, any rule, or any historical record. TrueCoach work already done remains valid as validation work.

## Filing metadata

- **Filed under:** `roadmap/rulings/` (context repo), per R4 path convention.
- **Author:** Bradley Gleave (R3).
- **Doctrine effect:** reinforces the Op-54 mission correction; adds no rule.
- **Cross-refs:** `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` §0/§3.2/§7; `roadmap/M-IMPORTER-EXTENSION_v1.md` mission-framing header; [[IMPORTER-I_BUILD_BRIEF]]; [[R-RULE-AUTHORITY-1_2026-07-20]].
