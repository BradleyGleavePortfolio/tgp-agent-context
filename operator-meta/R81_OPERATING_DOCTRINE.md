# R81 OPERATING DOCTRINE

**Status:** ACTIVE. Operationalizes R0 + R81 (the two top-priority rules).
**Codified:** 2026-06-16 by operator (Bradley Gleave) after the R81 Wave 1.5 mid-session credit failure that lost workspace-only artifacts (A3 builder brief, scope resolution, audit reports).
**Purpose:** Single canonical operator playbook. Composes the existing R-rules into a mechanical, follow-it-don't-improvise workflow so no future agent has to reconstruct doctrine from a dying session log.

**Precedence:** This document operationalizes R0 + R81. If anything in this doctrine contradicts R0 or R81, R0/R81 win. If anything in this doctrine contradicts another R-rule, the R-rule wins. This doc adds *nothing new*; it composes and clarifies.

**Read this first. Then read the audit cycle in R81. Then read your task.**

---

## §1 — The audit cycle (verbatim from R81, plus Wave 1.5 intensification)

This is the law. Every PR, no shortcuts.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          THE R81 AUDIT CYCLE                             │
│                                                                          │
│  Builder (Opus 4.8)  ─────►  opens PR against integration branch        │
│                                  │                                       │
│                                  ▼                                       │
│  Pre-merge gates pass            │                                       │
│  • CI green (all checks SUCCESS) │                                       │
│  • R74 identity on every commit  │                                       │
│  • R77 lane discipline upheld    │                                       │
│  • R79 pin-sweep done            │                                       │
│                                  ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  WAVE 1.5 DUAL-AUDITOR INTENSIFICATION (mandatory)                │   │
│  │                                                                   │   │
│  │  Dispatch TWO independent GPT-5.5 auditor subagents in PARALLEL:  │   │
│  │                                                                   │   │
│  │  Auditor A: correctness + security                                │   │
│  │  Auditor B: tests + contracts + PR hygiene                        │   │
│  │                                                                   │   │
│  │  Both audit against:                                              │   │
│  │  (a) code correctness vs the diff                                 │   │
│  │  (b) the plan doc / builder brief that authorized the PR          │   │
│  │  (c) hyperscaler standard (R0 banned patterns + R65 50-failures + │   │
│  │      R72 exhaustiveness — no sampling, no "enough to report")     │   │
│  │                                                                   │   │
│  │  Both write `audits/PR<N>_AUDIT_<DATE>_<FOCUS>.md` to ctx repo    │   │
│  │  Both must return CLEAN_NO_FINDINGS independently.                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│                       ┌─────────────────────┐                            │
│                       │ Both auditors CLEAN? │                            │
│                       └─────────────────────┘                            │
│                          │                │                              │
│                       YES│                │NO (any P0/P1/P2/P3)          │
│                          │                │                              │
│                          ▼                ▼                              │
│                 ┌────────────────┐    Fixer (Opus 4.8)                   │
│                 │ gh pr merge    │    Closes EVERY finding               │
│                 │   --squash     │    (P0-P3, R81 strict)                │
│                 │   --delete-    │    Commits R74-clean                  │
│                 │   branch       │    Pushes within 2 min (R52/R64)      │
│                 └────────────────┘         │                              │
│                          │                  ▼                            │
│                          │             ◄──── (loop back to dual audit) ──┤
│                          ▼                                                │
│                  Spawn next-in-chain PR                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**CI green is necessary, NOT sufficient.** CI catches regressions; auditors catch design defects, RLS leaks, contract drift, missing tests, security flaws, banned patterns, and the long tail of 50_FAILURES.

**The fixer loop runs until BOTH auditors return CLEAN_NO_FINDINGS in the same round.** No "good enough." No "P3s can ship." Per R81 verbatim: "CLEAR OF ANY P0-P3S IN ANY REGARD."

**No PR merges to `main` directly without operator approval** — only to integration branches (see §5 autonomy contract).

---

## §2 — The hyperscaler mandate

**Before any architectural choice, research what a hyperscaler would do.**

Mandatory hyperscaler reference list (by domain):

| Domain | Reference systems |
|---|---|
| AuthN/AuthZ | AWS IAM, GCP IAM, Okta, Auth0 |
| Row-level isolation | Supabase RLS, PostgreSQL native RLS, AWS RLS patterns, Snowflake row access policies |
| Feature flags | LaunchDarkly, Statsig, Unleash, Flagsmith |
| Payments | Stripe, Adyen, Braintree |
| Rate limiting / throttling | Cloudflare, AWS API Gateway, Stripe rate limits |
| Observability | Datadog, New Relic, Honeycomb, OpenTelemetry |
| Job queues | Sidekiq, AWS SQS, GCP Pub/Sub, BullMQ |
| Multi-tenancy | Salesforce, Shopify, Slack, Notion |
| Event sourcing | Kafka, AWS EventBridge, Stripe Events |
| Caching | Redis patterns, Cloudflare, Varnish |

**Operational meaning:** When the auditor or builder is making a non-trivial architectural choice (new policy shape, new GUC namespace, new event contract, new role model, new caching layer, new rate-limit boundary), they MUST cite at least one hyperscaler reference in their brief or audit. "I designed it this way" is not acceptable. "LaunchDarkly does eager multi-dimensional slicing here; we adopt their model" is acceptable.

R65 already mandates the 50-failures sweep on every audit, which encodes hyperscaler-grade defensive patterns. R0 already bans the most common AI failure modes (`@ts-ignore`, `as any`, swallowed `.catch`, "Coming soon" UI text). These are non-negotiable. This §2 extends them: when there's a real choice to be made, name the hyperscaler reference.

---

## §3 — Operator-choice format (LOCKED — use verbatim)

Every operator decision presented to the user MUST use this exact structure. No exceptions, no shortcuts, no "abbreviated for time."

```
🏛️ Hyperscaler research
What [AWS IAM / GCP IAM / LaunchDarkly / Statsig / Stripe / Cloudflare / Datadog / etc.] actually do in this situation. With the underlying principle and one citation/anchor.

Options
(a) [Name] — what it is, blast radius, tradeoff, LOC estimate, dependency impact on chain.
(b) [Name] — what it is, blast radius, tradeoff, LOC estimate, dependency impact on chain.
(c) [Name] — what it is, blast radius, tradeoff, LOC estimate, dependency impact on chain.

🏋️ Coach/client metaphor
The whole decision re-told as a coaching situation, in 2-4 sentences.
(e.g. "Option (a) is keeping the client's proven program and just renaming the spreadsheet; Option (b) is rewriting their entire training block mid-season.")

📐 Forward-compat check
What in Wave 1.5 / Phase 2 / future waves expects which option?
(e.g. "B1b GymMembership join table assumes option (a)'s gym_id GUC contract — option (b) would force a rewrite of B1b.")

My recommendation
Pick + one-line why, framed right-not-fast.
```

**Why each field is mandatory:**

- 🏛️ **Hyperscaler research** — forces grounding in proven patterns; prevents agent improvisation
- **Options (a)/(b)/(c)** — operator wants explicit alternatives, not a single recommendation framed as "the way"
- 🏋️ **Coach/client metaphor** — keeps decisions oriented to the actual product domain (fitness coaching, not abstract code)
- 📐 **Forward-compat check** — surfaces hidden chain dependencies BEFORE the choice locks in technical debt
- **My recommendation** — operator wants an opinion, not a neutral menu

**This format is a structural commitment.** If a decision is small enough that this feels heavy, the decision is probably autonomous (see §5) and shouldn't be presented at all.

---

## §4 — The autonomy contract

The line between "agent decides alone" and "agent presents operator choice."

### 4.1 Agent CAN do autonomously (no confirmation needed)

- Spawn builders, auditors, fixers per the audit cycle
- Squash-merge to **integration branches** (`wave-1-5-planning`, `phase-2-cleanup`, etc.) when both auditors return CLEAN_NO_FINDINGS
- Spawn next-in-chain PRs per the build order (RESCOPED_BUILD_ORDER, HYPERSCALER_BUILD_ORDER, etc.)
- Cancel + re-spawn a stalled subagent (must first capture worktree state to a file under `audit-work/` and commit it to `tgp-agent-context`)
- Push handoff, doctrine, audit, brief, fixer-report, and scope-resolution docs to `tgp-agent-context`
- Halt and write a `<TASK>_SCOPE_MISMATCH.md` per R71 when the brief doesn't match repo reality
- Run a re-audit when CI status changes
- Refine wording of operator rules ONLY in summaries — never edit the verbatim quote files
- Update `BACKFILL_LEDGER` after each Phase 2 PR completes

### 4.2 Agent MUST present operator choice (use §3 format; DO NOT proceed without operator approval)

- **(a) Architectural pivots not in the build order** — including scope re-interpretations like W1.5-A3's "User/Gym/GymMembership" → "RLS spine convergence." Even if the architect's brief is strong, ASK.
- **(b) Merging to `main` (production)** — integration branches OK alone; prod merges require operator approval per the build order's "final merge sequence + staging soak + prod flag flip"
- **(c) Adding/removing R-rules or editing existing R-rule verbatim quotes** — only the operator can codify a new R-rule (R64 explicitly says so)
- **(d) Changing the audit cycle, the auditor models, or the dual-auditor split** — these are doctrine-level changes, not implementation choices
- **(e) Cancelling a subagent that has produced uncommitted work** — must capture worktree first; if work is salvageable, ASK whether to resume from current state or restart
- **(f) Any change to user data, PII handling, RLS policy semantics, billing/Stripe wiring, or auth/JWT** — even if "obviously safe"
- **(g) Going past the LOC cap** — >400 hard, >200 ideal. Even by 1 line.
- **(h) Changing the build order or merging out of sequence** — the order is a dependency graph, not a suggestion
- **(i) Touching a different repo than the one the brief authorized** — cross-repo scope creep is forbidden without explicit operator authorization
- **(j) Spending the equivalent of a "high-cost" subagent run on speculative work** — exploration is fine; speculative builders on un-briefed work are not

### 4.3 If in doubt, ASK

The cost of a 30-second operator confirmation is one message. The cost of an autonomous architectural pivot the operator didn't approve is a multi-hour rollback. Default to asking.

---

## §5 — Plan-doc precedence (general rule)

**Newer addendum / rescope / architect-resolution doc supersedes the underlying plan doc on the specific point it addresses. The underlying plan doc remains canonical for everything else.**

**Empirical examples in this codebase:**
- `wave-1-5/RESCOPED_BUILD_ORDER.md` supersedes `wave-1-5/HYPERSCALER_BUILD_ORDER.md` for the PR count and chain ordering
- `wave-1-5/MULTI_GYM_MEMBERSHIP_REDUNDANCY_ADDENDUM.md` supersedes `wave-1-5/APPROVED_DECISIONS.md` D3/D4/D7 for the join-table model
- `wave-1-5/PLAN_C_EVALUATOR_AND_SLICING.md` §0 explicitly supersedes APPROVED_DECISIONS
- `audits/W1_5_A3_SCOPE_RESOLUTION.md` supersedes the literal A3 line in HYPERSCALER_BUILD_ORDER

**Operational meaning:** When two docs conflict on the same point, the newer one wins on that point. Cite the supersession explicitly in any brief that depends on it.

**Exception:** R-rules in `rules/` are atomic and never supersede each other unless the operator says so explicitly. R-rules supersede plan docs always.

---

## §6 — Path convention (where artifacts MUST live)

**Forbidden:** workspace-only artifacts that an auditor, fixer, or next-operator might need to read.

**Required:** every brief, audit, fixer report, and scope-resolution doc lives in `tgp-agent-context`, committed within **2 minutes of creation** (R52/R64 cadence).

```
tgp-agent-context/
├── rules/R<N>_<NAME>.md                          # Operator R-rules (verbatim-quote source-of-truth)
├── audits/PR<N>_AUDIT_<DATE>.md                  # Pre-merge audits per R81
├── audits/PR<N>_AUDIT_<DATE>_<FOCUS>.md          # Dual-auditor split: focus = "correctness_security" or "tests_contracts"
├── audits/POST_MERGE_PR<N>_AUDIT_<DATE>.md       # R81 backfill audits for pre-R81 merges
├── audits/PR<N>_<NAME>_BUILDER_BRIEF.md          # Builder briefs
├── audits/PR<N>_<NAME>_FIXER_BRIEF.md            # Fixer briefs (must contain inline P-prescriptions)
├── audits/PR<N>_<NAME>_FIXER_REPORT.md           # Fixer self-reports
├── audits/<WAVE>_<TASK>_SCOPE_RESOLUTION.md      # Architect scope-resolution docs (e.g. W1_5_A3_SCOPE_RESOLUTION.md)
├── audits/<WAVE>_<TASK>_SCOPE_MISMATCH.md        # R71 halt-reports
├── audits/BACKFILL_LEDGER_<DATE>.md              # R81 backfill schedule
├── handoffs/HANDOFF_<NAME>_<DATE>.md             # Cross-operator handoffs
├── operator-meta/R81_OPERATING_DOCTRINE.md       # This file
├── operator-meta/AUTONOMY_CONTRACT.md            # 1-pager extract of §4
├── plans/PHASE_<N>_*.md                          # Multi-PR build plans
├── plans/<WAVE>_*.md                             # Wave-level plan docs (also in backend wave-<N>/)
├── specs/<NAME>_SPEC.md                          # Large feature specs
```

**Cadence:** push every artifact within 2 minutes of creation. Bundle related artifacts in one commit when they're authored together (e.g. builder brief + scope resolution from the same architect run = one commit). Otherwise commit individually.

**Cross-repo durability:** wave-level plan docs may live in BOTH `growth-project-backend/wave-N/` (close to the code) AND `tgp-agent-context/plans/` (close to other operator artifacts). Keep both in sync; if they drift, the backend repo wins because that's where builders read from.

---

## §7 — Standing answers (don't re-ask these)

- **Default quality bar:** hectacorn / decacorn (R0). Apple / Notion / Google test. Always.
- **Hyperscaler pattern vs ≤400 LOC cap:** split into chained PRs. Always. The cap is hard. The build order is already factored for this.
- **Plan doc vs newer addendum:** newer wins on the specific point (§5).
- **Sonnet for fixers?** Never. Opus 4.8 only.
- **Auditor model:** GPT-5.5 only (dual, parallel).
- **Co-author trailers in commits?** Never (R0 banned).
- **`browser_task` on GitHub?** Never (R72). `gh` CLI only via `bash` with `api_credentials=["github"]`.
- **Workspace-only files for anything the next operator needs?** Forbidden (R52/R64).
- **Commit identity:** `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m '<msg>'` (R74). Every commit. No exceptions.
- **Push cadence:** within 2 minutes of every commit (R52). Subagent push reliability is bad — operator must monitor (R75).

---

## §8 — Models (matrix)

| Role | Model | Why |
|---|---|---|
| Builder | Opus 4.8 | Architectural code, complex business logic, novel patterns |
| Fixer | Opus 4.8 | R81 strict closure of P0-P3; requires deep code understanding |
| Architect (scope resolution) | Opus 4.8 | Reads multiple plan docs + repo; produces inline-prescription briefs |
| Auditor (dual, parallel) | GPT-5.5 | Adversarial fresh-eyes review; R72 exhaustiveness |
| Documentation synthesis | GPT-5.5 or general-purpose default | Synthesis-only tasks, no novel intent |
| Heartbeat / status / glue | default | Lightweight |

**Never use Sonnet for fixers or builders.** Operator directive, codified across multiple R-rules.

---

## §9 — Subagent reliability playbook (R75 + experience)

**Subagents are unreliable on R52 (push cadence). Operator must monitor.**

When a subagent runs out of credits:
- **General-purpose subagent:** credits restore, then `message_subagent` to continue. Do NOT spawn a new one (loses worktree state and conversation context).
- **Browser task:** spawn a fresh `browser_task` to continue.
- **Coding subagent (specialty type):** can NOT receive follow-up while "running" status; if stalled, must cancel and re-spawn from current commit (worktree state survives in `/home/user/workspace/`).

When a subagent stalls (no new commits for >60 min on an active branch):
1. Inspect the worktree: `git log --oneline -5`, `git status --short`, file modification times.
2. Check the PR state on GitHub: CI status, PR body, latest comments.
3. If worktree is clean and CI is green: subagent may be done but failed to write final report. Capture state and reassess scope.
4. If worktree has uncommitted changes: the subagent was probably mid-edit. Try `message_subagent` first.
5. If `message_subagent` returns "running" but subagent doesn't respond within 15 min: cancel + re-spawn with a "resume from `<sha>`" brief.

**Always capture worktree state to `audit-work/<TASK>_WORKTREE_SNAPSHOT.md` and commit to `tgp-agent-context` before cancelling.**

---

## §10 — Scope-mismatch protocol (R71 + experience)

When a builder or fixer discovers the brief doesn't match repo reality:

1. **HALT immediately.** Do not guess. Do not widen scope.
2. **Write `audits/<TASK>_SCOPE_MISMATCH.md` to `tgp-agent-context`** with:
   - What the brief said
   - What the repo actually shows (with file:line evidence)
   - 2-3 candidate resolutions
   - Recommended next step (usually: spawn an architect subagent)
3. **Exit cleanly** with the mismatch doc path in the final message.
4. **Parent agent spawns an architect** (Opus 4.8) to read all relevant docs + repo and produce a scope-resolution doc + updated builder brief.
5. **Parent presents the resolution to the operator** using the §3 format if the resolution is non-trivial (which W1.5-A3 was).
6. **Only after operator approval does the new builder spawn.**

---

## §11 — R-rule index (one-line each)

| Rule | Status | Subject |
|---|---|---|
| R0 | TOP | Decacorn quality. Apple/Notion/Google test. Banned patterns (`@ts-ignore`, `as any`, `as unknown`, swallowed `.catch`, "Coming soon"). |
| R52 | SACRED | Never lose operator work/time. Push every 2 min. Wasted credits = food out of operator's daughter's mouth. |
| R64 | SACRED | Never lose anything. Upload rules/features/insights to `tgp-agent-context` instantly. Assume agent dies in 24h. |
| R65 | LAW | 50-failures sweep on every audit. |
| R71 | LAW | Scope-mismatch protocol. HALT and write resolution doc. |
| R72 | LAW | Audits MUST be exhaustive. No "enough to report." |
| R74 | ACTIVE | Operator identity on every commit. `bradley@bradleytgpcoaching.com`, no AI names. |
| R75 | ACTIVE | Subagents unreliable on push; operator must monitor. |
| R76 | ACTIVE | Plan docs must be empirically verified before lane dispatch. |
| R77 | ACTIVE | Lane scope discipline. Subagents stay in their brief. |
| R78 | CI-GATING | Pinned telemetry table must be updated in same PR. |
| R79 | CI-GATING | Run all repo pin tests before opening PR. |
| R80 | ACTIVE | Always verify "pre-existing failure" claims. Main red = everyone's emergency. |
| R81 | TOP (tied R0) | AUDITOR GATE. No merge without CLEAN audit cycle. |
| R82 | ACTIVE | Tracking-issue discipline. Out-of-lane work → GitHub issue, never code comment. |

Full text in `tgp-agent-context/rules/`. Quote verbatim when citing.

---

## §12 — Read-before-you-work list

In this order:

1. `tgp-agent-context/operator-meta/R81_OPERATING_DOCTRINE.md` — this file
2. `tgp-agent-context/operator-meta/AUTONOMY_CONTRACT.md` — the §4 boundary, condensed
3. `tgp-agent-context/rules/R0_DECACORN_QUALITY.md`
4. `tgp-agent-context/rules/R81_AUDITOR_GATE.md`
5. `tgp-agent-context/rules/R64_NEVER_LOSE_ANYTHING.md`
6. `tgp-agent-context/rules/R52_NEVER_LOSE_OPERATOR_WORK.md`
7. `tgp-agent-context/rules/R72_EXHAUSTIVE_AUDITS.md`
8. `tgp-agent-context/rules/R74_OPERATOR_IDENTITY.md`
9. `tgp-agent-context/handoffs/HANDOFF_R81_WAVE_1_5.md` — current session's full handoff
10. `tgp-agent-context/plans/PHASE_1_RETROSPECTIVE.md` — what shipped + landmines
11. `tgp-agent-context/plans/PHASE_2_CLEANUP_PLAN.md` — current Phase 2 status + per-PR plan
12. `growth-project-backend/wave-1-5/RESCOPED_BUILD_ORDER.md` — Wave 1.5 PR-by-PR plan
13. `growth-project-backend/wave-1-5/APPROVED_DECISIONS.md` + addenda
14. `growth-project-backend/wave-1-5/PLAN_A_*.md`, `PLAN_B_*.md`, `PLAN_C_*.md`
15. `tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — R65 checklist source
16. `tgp-agent-context/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md` — brief template
17. `tgp-agent-context/quality-references/FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md`

After this you understand the system. Then read your specific task brief.

---

## §13 — How to use this document going forward

- This doc is **append-mostly**. Add §s for new doctrine; never delete or rewrite history.
- Operator may add/edit. Agents may propose edits via PR but never commit unilaterally.
- If a new R-rule is codified by the operator, add a one-line entry to §11 in the same commit that creates the R-rule file.
- When the operator says something that operationalizes existing doctrine, add it here under the appropriate § with a verbatim quote.

**This is the file the next operator reads first. Keep it tight, current, and true.**
