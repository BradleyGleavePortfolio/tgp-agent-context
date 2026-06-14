# Lost Forever — Stranded Rules Archive

**Status:** OPERATOR-DECLARED LOST 2026-06-13 by Bradley Gleave during the cycle-40 resumption session.

> **"Lost rules are truly forever lost"** — operator, 2026-06-13

---

## What this file is

The original `rules/RULES.md` (R1–R6X canonical enumeration), `R36_TO_R45_OPERATOR_RULES.md`, `AUDIT_MANDATE.md`, `HOUSE_RULES.md`, `50_FAILURES.md`, and ~15 other docs were lost when a prior operator's sandbox died. They were on the "STRANDED DOC RESCUE BACKLOG" in the parent `README.md`.

The operator has formally declared them **unrecoverable**. The rescue backlog for those specific rule files is closed.

---

## What this means operationally

1. **Do not search for them.** They will not be found.
2. **Do not attempt to reconstruct them from memory or inference.** Hallucinated canonical rules are worse than missing canonical rules.
3. **Do not cite them by R-number unless the rule has been re-codified** in `tgp-agent-context/rules/` or in a product repo's `AGENT_RULES.md` / `ENGINEERING_RULES.md`.

When a journal entry or audit brief from the prior operator references `R31`, `R32`, `R34`, `R36–R45`, `R52`, `R53`, `R54`, `R55`, `R62`, `R63` — treat that reference as **operationally meaningful from context** but **canonically unverifiable**. If the rule's intent is clear from how the prior operator used it, the new operator may follow that intent. If unclear, ask Bradley to re-codify.

---

## Re-codified successors (these have canonical homes)

| Lost R-number | New canonical home | Restated intent |
|---|---|---|
| R31 (builder ≠ auditor) | covered by backend `AGENT_RULES.md` Standing Rule 2 + R73's "Planner ≠ Builder ≠ Auditor ≠ Fixer" | role separation per PR |
| R34 (mobile GitHub-only-truth) | covered by backend `AGENT_RULES.md` R15 + agent-context `README.md` | GitHub or it doesn't exist |
| R52 (anti-rebase, push cadence, 24/7) | `rules/R52_NEVER_LOSE_OPERATOR_WORK.md` (this commit) | operator work + time are sacred |
| R55 (rebase invalidates audit) | referenced in R52 + R73; needs full restatement when next encountered | every rebase → fresh audit |
| R64 | `rules/R64_NEVER_LOSE_ANYTHING.md` | upload to GitHub the moment new info arrives |
| R65 | `rules/R65_50_FAILURES_SWEEP.md` | 50-failures checklist on every PR |
| R71 | backend `AGENT_RULES.md` | parallel-PR file ownership |
| R72 | `rules/R72_EXHAUSTIVE_AUDITS.md` | sweep entire diff, rank all P0–P3 |
| R73 | backend `AGENT_RULES.md` | mobile planner gate |
| R74 (this session) | `rules/R74_OPERATOR_IDENTITY.md` | Bradley Gleave author on every commit |

---

## What is NOT re-codified (still operator-restate-on-demand)

- The full R1–R14 numbering scheme — survives in backend `AGENT_RULES.md`
- Mobile R15–R33 — survives in mobile `AGENT_RULES.md`
- Backend R56–R73 — survives in backend `AGENT_RULES.md`
- Mobile R36–R45 (operator rules block) — **lost**
- Mobile R46–R55 (gap range) — **lost**
- R62, R63 — **lost**

If an audit brief cites a lost R-number and the intent is ambiguous, the auditor flags it as a P2 doctrine ambiguity in the report and asks the operator to either re-codify or declare the citation void.

---

## README.md backlog update

The parent `README.md` "STRANDED DOC RESCUE BACKLOG" must drop the following entries (they will not be rescued):

- ~~`rules/RULES.md`~~ — declared lost forever 2026-06-13
- ~~`rules/R36_TO_R45_OPERATOR_RULES.md`~~ — declared lost forever 2026-06-13
- ~~`rules/AUDIT_MANDATE.md`~~ — superseded by R65 + R72
- ~~`rules/HOUSE_RULES.md`~~ — superseded by backend `AGENT_RULES.md` standing rules
- ~~`rules/50_FAILURES.md`~~ — superseded by `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` + R65

The other rescue items (handoffs, strategy docs, design docs) remain on the backlog unless the operator separately declares them lost.

---

— Codified per operator directive, 2026-06-13 21:33 PT
