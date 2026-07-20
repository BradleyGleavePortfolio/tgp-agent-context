# R-RULE-AUTHORITY-1 — The context-repo `AGENT_RULES.md` is the single canonical rule authority for every leaf repo

- **Ruling ID:** R-RULE-AUTHORITY-1
- **Date:** 2026-07-20
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 65, executing under the standing R138 autonomy grant ("research what a hyperscaler would do, then execute autonomously; never ask for routine approval").
- **Status:** ACTIVE
- **Scope:** Rule-text authority and cross-repo rule resolution for all TGP leaf repos (`growth-project-backend`, `growth-project-mobile`, `tgp-importer-extension`, and any future repo).
- **Does NOT amend:** any rule body in `AGENT_RULES.md`. This ruling adds no new rule and changes no existing rule; it only fixes *where the canonical text lives* and *how a leaf repo resolves a rule it cites but does not define locally*.
- **Supersedes:** none.
- **Related:** [[IMPORTER-I_BUILD_BRIEF]] pre-build governance gate; the pre-build review governance defect ("backend `AGENT_RULES.md` stops at R73 while automation cites later rules not defined in that repository").

## Background

The pre-build review for IMPORTER-I flagged a real governance defect: automation and audit tooling in leaf repos cite rules (e.g. R74–R127) that are **not defined in the leaf repo's local rules file**, which in at least one repo stops earlier than the canonical enumeration. Left unresolved, an agent could either (a) invent rule text, or (b) duplicate the full ~167 KB constitution into every leaf repo — both of which violate the constitution's own "single source of truth" doctrine and create drift.

The canonical `AGENT_RULES.md` already answers this in its own header:

> "Every operator and agent reads this file as law. **There is no other rules file.**" (line 5)

> "This document is the **single canonical constitution** for every TGP operator, builder, fixer, auditor, architect, and scheduler." (line 9)

R15 (AUDIT-CYCLE OPERATING DOCTRINE) further fixes that **GitHub is the only source of truth** — "GitHub is the only place that lives forever." R4's path convention (AGENT_RULES.md line 363) requires that "every brief, audit, fixer report, and **scope-resolution doc** lives in the context repo."

## The ruling

1. **Single canonical authority.** The `AGENT_RULES.md` at the head of the **context repo** (`BradleyGleavePortfolio/tgp-agent-context`, `main`) is the sole canonical rule text for every TGP repo. Its enumeration (currently R1→R107 plus R109–R138) governs everywhere, including any leaf repo whose local rules file is absent, shorter, or stale.

2. **Cite-by-reference, never duplicate.** When a leaf repo's code, CI, audit tooling, or docs reference a rule number (e.g. R74, R80, R124), that reference **resolves to the canonical `AGENT_RULES.md` in the context repo** at the live `main` SHA. Leaf repos MUST NOT copy the full constitution locally. The smallest rule-compliant reference is a pointer — repo + path + `main` — not a fork of the text.

3. **A local rules file is a redirect, not an authority.** If a leaf repo keeps a local `AGENT_RULES.md` (or `rules/` / `operator-meta/R*.md`) for convenience, it is a non-authoritative mirror. Where the mirror is shorter than, silent on, or in conflict with the canonical file, **the canonical context-repo file wins**. A mirror that stops at R73 does not cap the rules in force for that repo; R74–R138 still bind by reference.

4. **No invented text; stop on genuine gaps.** No agent may fabricate rule text to fill a local gap. If a cited rule number does not exist in the canonical file, that is a genuine STOP condition to raise, not a license to invent.

5. **Amendment path unchanged.** Rule changes still require a signed operator commit to the canonical `AGENT_RULES.md` plus a `DECISION_LOG.md` entry (per the file's own header). This ruling does not create an alternate amendment channel.

## Hyperscaler lens

This is the standard "single control-plane source of truth, distributed by reference" pattern: AWS Organizations / GCP Organization Policy define policy once at the org root and every account/project **inherits by reference** rather than each carrying an editable copy; a stale local copy never overrides the org policy. Applying it here keeps one authoritative constitution and eliminates the drift that per-repo duplication guarantees.

## What this changes / does not change

- **Changes:** it makes explicit that a leaf repo citing R74–R127 (or any rule beyond its local file) is bound by the canonical context-repo text, resolved by reference — closing the pre-build governance defect for IMPORTER-I and every future leaf-repo build.
- **Does not change:** any rule body; the amendment process; the R3 identity discipline; the R3_MERGE_RUNBOOK mechanics; the site-agnostic mission.

## Filing metadata

- **Filed under:** `roadmap/rulings/` (context repo), per R4 path convention (scope-resolution docs live in the context repo).
- **Author:** Bradley Gleave (R3).
- **Doctrine effect:** clarifies R15 (source of truth) and the `AGENT_RULES.md` header (lines 5, 9) for cross-repo rule resolution; adds no rule.
- **Cross-refs:** `AGENT_RULES.md` header (lines 5, 9), R4 (line 363), R15; [[IMPORTER-I_BUILD_BRIEF]]; [[R-SITE-AGNOSTIC-1_2026-07-20]].
