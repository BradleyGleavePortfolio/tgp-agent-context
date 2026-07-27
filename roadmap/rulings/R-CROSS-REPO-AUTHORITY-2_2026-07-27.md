# R-CROSS-REPO-AUTHORITY-2 — Explicit by-reference authority pointer for the extension repository

- **Ruling ID:** R-CROSS-REPO-AUTHORITY-2
- **Date:** 2026-07-27
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 74, executing under the standing R138 autonomy grant. Four-question gate recorded in [`PRE_BUILD_REVIEW_OP74.md`](../../handoffs/op74/PRE_BUILD_REVIEW_OP74.md) Part 5.
- **Status:** ACTIVE
- **Scope:** rule-authority resolution for `BradleyGleavePortfolio/tgp-importer-extension`.
- **Baseline:** [`BASELINE_HEADS_OP74.json`](../../handoffs/op74/BASELINE_HEADS_OP74.json) — extension pinned at `95be0222df3d47d787566743c8781005d8fbec69`.
- **Does NOT amend:** any rule body in `AGENT_RULES.md`; any operator verbatim quote; [[R-RULE-AUTHORITY-1_2026-07-20]], which stays ACTIVE and unmodified in substance.
- **Extends:** [`R-RULE-AUTHORITY-1_2026-07-20`](R-RULE-AUTHORITY-1_2026-07-20.md) — same doctrine, made explicit for the extension repo.
- **Supersedes:** none.

---

## Background

[[R-RULE-AUTHORITY-1_2026-07-20]] established that the context-repo `AGENT_RULES.md` is the single canonical rule authority for every leaf repo, resolved **by reference** (repo + path + `main`), with no invented text and no duplication. Its scope line already names `tgp-importer-extension` among the covered repos.

The **operational** pointers, however, were written around the backend and mobile repos: the Op-65 decision entry that installed the doctrine discusses leaf repos citing R74–R127 in the backend context, and downstream cross-repo prose enumerates backend and mobile explicitly while the extension appears only in state-tracking SHA fields. The extension is therefore covered **in principle** but has no **clearly stated, quotable authority pointer** an agent working in that repo can land on.

That is a live hazard, not a cosmetic gap, for three reasons:

1. The extension is where **host-injected acquisition** runs — the surface most exposed to consent, credential, and access-control boundaries under [[R-IMPORTER-AUTONOMY-1_2026-07-27]].
2. The extension had a genuine R3 identity incident (**R3-INC-1**, PR #5) that remains **OPEN_ACCEPTED_NOT_FIXED**, so identity doctrine must resolve unambiguously there.
3. R-RULE-AUTHORITY-1 §4 makes a cited-but-nonexistent rule a **STOP condition**. An agent in a repo without a clear pointer is exactly the agent most likely to invent text instead of stopping — the failure mode the original ruling exists to prevent.

## The ruling

1. **Explicit pointer.** For `BradleyGleavePortfolio/tgp-importer-extension`, the canonical rule authority is:

   > **`BradleyGleavePortfolio/tgp-agent-context` → `AGENT_RULES.md` @ `main`.**
   > `https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/AGENT_RULES.md`

   Every rule cited anywhere in the extension repo — code comments, CI, audit tooling, briefs, PR bodies, docs — resolves there, at the live `main` SHA.

2. **Parity, not exception.** The extension is governed **identically** to `growth-project-backend` and `growth-project-mobile`. It receives no relaxation and no additional burden. Naming it explicitly closes a documentation gap; it creates no new regime.

3. **No local authority, no duplication.** The extension MUST NOT vendor a copy of the constitution. Any local rules file it keeps is a **non-authoritative mirror**; where the mirror is shorter than, silent on, or in conflict with the canonical file, **the canonical context-repo file wins** (R-RULE-AUTHORITY-1 §3).

4. **No invented text; STOP on a genuine gap.** If a rule number cited in the extension does not exist in the canonical file, that is a **STOP condition to raise**, never a licence to invent (R-RULE-AUTHORITY-1 §4). Agents must consult the canonical enumeration corrected at Op 74 — see the **rule-range note** below — before concluding a rule is missing.

5. **Rule range, stated correctly.** The canonical enumeration in force is **R1 → R126 and R130 → R138**. **R127, R128, and R129 do not exist and never have.** That gap is real, permanent, and **must not be renumbered or fake-filled** (R5 lost-forever discipline). Any citation of a number outside this set — for example the phantom **R161** reconciled at Op 74 — is a miscitation and a STOP condition, not a rule.

6. **Identity doctrine resolves here too.** R3 binds the extension without qualification: author **and** committer must be `Bradley Gleave <bradley@bradleytgpcoaching.com>`. The open **R3-INC-1** landmine (PR #5, commit `5eabeec`, GitHub-synthesized identity) remains **recorded and NOT rewritten**; the prospective fix is the identity-safe manual squash in `handoffs/importer-wave/R3_MERGE_RUNBOOK.md`. Extension landing `95be0222` (V5 PR-2b) was the **first R3-clean extension landing** and is the pattern to repeat.

7. **Amendment path unchanged.** Rule changes still require a signed operator commit to the canonical `AGENT_RULES.md` plus a `DECISION_LOG.md` entry. This ruling creates no alternate amendment channel and amends nothing.

## Hyperscaler lens

Identical to the pattern R-RULE-AUTHORITY-1 adopted: **single control-plane source of truth, distributed by reference** (AWS Organizations / GCP Organization Policy). Policy is defined once at the org root; every account inherits by reference; a stale local copy never overrides the root. Op 74 simply ensures the extension account is **explicitly enrolled** rather than implicitly assumed — because in a policy-inheritance system, an unenrolled principal is precisely where drift begins.

## What this changes / does not change

- **Changes:** installs an explicit, quotable by-reference authority pointer for the extension repo; states the correct canonical rule range including the permanent R127–R129 gap; confirms R3 resolution and the open R3-INC-1 landmine.
- **Does not change:** R-RULE-AUTHORITY-1 (ACTIVE, unmodified); any rule body; any operator verbatim quote; any extension code; the R3-INC-1 record, which stays open and unrewritten.

## Filing metadata

- **Filed under:** `roadmap/rulings/` (context repo), per the R4 path convention.
- **Author:** Bradley Gleave (R3).
- **Doctrine effect:** extends R-RULE-AUTHORITY-1 to name the extension repo explicitly; adds no rule; amends no rule.
- **Cross-refs:** [[R-RULE-AUTHORITY-1_2026-07-20]] · [[R-IMPORTER-AUTONOMY-1_2026-07-27]] · [[R-SITE-AGNOSTIC-1_2026-07-20]] · `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` · [`BASELINE_HEADS_OP74.json`](../../handoffs/op74/BASELINE_HEADS_OP74.json) · `DECISION_LOG.md` (Op 74).
