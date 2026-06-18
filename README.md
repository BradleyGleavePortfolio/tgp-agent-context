# tgp-agent-context

**Single source of truth for all TGP agent canonical context.**

> **⚠ ALL RULES LIVE IN `/AGENT_RULES.md` (the TGP Master Doctrine — R1–R99).** The `rules/` and `operator-meta/R*.md` files are deprecated redirect stubs. A small set of `operator-meta/` files (`ZOMBIE_AGENT_PROTOCOL.md`, `AUTONOMY_CONTRACT.md`, `R100_AUDIT_CHECKLIST_TEMPLATE.md`, `BRIEF_PREAMBLE_R100.md`, `AGENT_47_HANDOFF.md`, `OPERATOR_STATE.md`) remain in place for backward compatibility with running overnight crons. Read `AGENT_RULES.md` first — there is no other rules file. Changes to it require a signed operator commit and a DECISION_LOG entry.

This repo is the home for everything that crosses repo boundaries: rules, handoffs, audits, briefings, strategy docs, and design bibles. If a doc is referenced in more than one product repo — or by multiple agents — it belongs here, not in a product repo.

Created in response to **R15** (`growth-project-backend/AGENT_RULES.md` rule 15 / `growth-project-mobile` rule 34): GitHub is the only source of truth, and canonical agent context must never live in a sandbox.

## Layout

```
tgp-agent-context/
├── README.md                    ← you are here
├── rules/
│   ├── RULES.md                 ← canonical R1–R6X (the R-canon)
│   ├── HOUSE_RULES.md
│   ├── AUDIT_MANDATE.md
│   └── 50_FAILURES.md
├── handoffs/
│   ├── CPO_MASTER_HANDOFF.md            ← Part 1: R1, doctrine, 166 TODOs
│   ├── CPO_MASTER_HANDOFF_PART_2.md     ← Part 2: judgment layer
│   ├── CPO_BRIEFING.md                  ← operator synthesis
│   ├── BRADLEY_BRIEFING.md
│   └── operator-handoffs/
│       ├── OPERATOR_HANDOFF_2026-05-26.md
│       ├── NEXT_OPERATOR_MEGA_PROMPT.md
│       └── ...
├── strategy/
│   ├── FEATURE_ROADMAP_CANONICAL.md
│   ├── SUPABASE_RLS_CRISIS.md
│   ├── CYCLE_B_RLS_PLAN.md
│   ├── COMPETITIVE_INTEL.md
│   └── TGP_PRODUCT_VISION.md
├── design/
│   ├── simplicity-ideology.md
│   ├── LANDING_PAGE_DESIGN_DOCTRINE.md
│   ├── Mobile-App-Design-Intelligence.md
│   └── Website-Landing-Page-Design-Intelligence.md
├── audits/
│   ├── PR_272_AUDIT.md
│   ├── WORKOUT_BUILDER_AUDIT.md
│   ├── LP_V2_AUDIT.md
│   └── ...
├── operator-meta/
│   ├── BACKLOG_DEDUP_<date>.md
│   ├── SECURITY_SPRINT_<n>.md
│   └── REFERENCE_DOCS.md
└── scripts/
    └── autopush.sh              ← if/when restored
```

## Status: STRANDED DOC RESCUE BACKLOG

Updated 2026-06-13 by operator (Bradley Gleave) — see `rules/LOST_FOREVER_2026-06-13.md`. The canonical rule files below were declared **lost forever** by the operator and are no longer on the rescue backlog. Their operational intent has been re-codified under `rules/` where possible (see the successors table in `LOST_FOREVER_2026-06-13.md`).

### Declared LOST FOREVER 2026-06-13 (do not attempt rescue)
- ❌ `rules/RULES.md` — R1–R6X canonical enumeration (intent split across product-repo `AGENT_RULES.md` + new `rules/R5*–R7*` files)
- ❌ `rules/R36_TO_R45_OPERATOR_RULES.md`
- ❌ `rules/AUDIT_MANDATE.md` (superseded by R65 + R72)
- ❌ `rules/HOUSE_RULES.md` (superseded by backend `AGENT_RULES.md` standing rules)
- ❌ `rules/50_FAILURES.md` (superseded by `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` + R65)

### Still on the rescue backlog (operator may yet provide)
- [ ] `handoffs/CPO_MASTER_HANDOFF.md` — Part 1 (R1, doctrine, 166 TODOs)
- [x] `handoffs/CPO_MASTER_HANDOFF_PART_2.md` — rescued 2026-05-26
- [x] `handoffs/CPO_BRIEFING.md` — rescued 2026-05-26
- [ ] `strategy/SUPABASE_RLS_CRISIS.md` — Cycle B work queue
- [ ] `strategy/CYCLE_B_RLS_PLAN.md`
- [ ] `strategy/COMPETITIVE_INTEL.md`
- [ ] `handoffs/operator-handoffs/NEXT_OPERATOR_MEGA_PROMPT.md`
- [ ] `handoffs/operator-handoffs/OPERATOR_HANDOFF_2026-05-26.md`
- [ ] `operator-meta/BACKLOG_DEDUP_2026-05-26.md`
- [ ] `operator-meta/SECURITY_SPRINT_A_2.md`
- [ ] `design/simplicity-ideology-2.md`
- [ ] `design/LANDING_PAGE_DESIGN_DOCTRINE.md`
- [ ] `design/Mobile-App-Design-Intelligence-Exhaustive-Agent-Training-2.md`
- [ ] `design/Website-Landing-Page-Design-Intelligence.md`
- [ ] `audits/PR_272_AUDIT.md`
- [ ] `audits/WORKOUT_BUILDER_AUDIT.md`
- [ ] `audits/LP_V2_AUDIT.md`
- [ ] `audits/UI_QUALITY_AUDIT_2026_05_26.md`
- [ ] `audits/UI_FIX_PRIORITY_2026_05_26.md`

## Workflow for restoring a stranded doc

1. Paste the doc contents into the appropriate subdirectory.
2. Commit on a branch: `agent/restore/<doc-name>/<8char-id>`.
3. Push.
4. In the corresponding `growth-project-backend` and `growth-project-mobile` `.agent-doc-allowlist`, delete the line for the now-rescued doc.
5. Commit + open PR in each product repo to remove the allowlist entry.

The allowlist shrinks over time. When it's empty of legacy entries, R15 enforcement is fully effective.

## Adding new canonical context

When a new cross-cutting doc gets created (a new audit, a new operator handoff, a new strategy doc):

1. Choose the right subdirectory.
2. Branch: `agent/<role>/<task>/<8char-id>` per `CONTRIBUTING_AGENTS.md`.
3. Commit + push within 2 minutes (R15).
4. Open PR to `main`.
5. Reference it from product repo docs using fully-qualified paths (`tgp-agent-context/strategy/SUPABASE_RLS_CRISIS.md`) so the CI verifier can resolve cross-repo references via the allowlist.

## Why this repo exists (verbatim from R15)

> GITHUB IS THE ONLY SOURCE OF TRUTH. EVERY ARTIFACT — IDEAS, RULES, DOCS, BRIEFINGS, AUDITS, PLANS, SCRIPTS, CODE, MIGRATIONS, SCHEMAS — MUST EXIST AS A COMMIT ON GITHUB. SANDBOX-ONLY FILES ARE FORBIDDEN.

Prior operator agents lost critical canonical docs when their sandboxes were destroyed. This repo + the R15 enforcement tooling (`verify-doc-refs.yml`, `verify-push-cadence.yml`, `pre-commit-stale-warn`) make that failure mode physically impossible.

---

*Owner:* Bradley Gleave
*Created:* 2026-05-26
*Visibility:* Private
