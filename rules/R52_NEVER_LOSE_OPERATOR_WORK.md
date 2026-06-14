# R52 — NEVER LOSE OPERATOR WORK OR TIME

**Status:** ACTIVE. Sacred rule. Equal weight to R64 (never lose anything).
**Re-codified:** 2026-06-13 by operator (Bradley Gleave) during the cycle-40 resumption session, after the prior operator was credit-exhausted mid-flight on RNTL v14 builder R3.
**Original R52 was stranded** when the prior operator's sandbox died; this is the operator-restated canonical version. The earlier phrase "wasted credits = food out of daughter's mouth" was the emotional framing; the operational rule is below.

---

## The rule, verbatim from the operator (2026-06-13)

> **"Basically, I hate loosing oeprators work OR time - Avoid rebasing by planning out how PR's affect one another before parallization + Make sure code is pushed every 2 min/done in github live + try and keep yourself working 24/7 - minimal product questions (only when neccesary)"**

Quote this verbatim when citing R52. Do not paraphrase the operator's words.

---

## Operational meaning

R52 has four binding clauses. Every clause is a hard rule, not a guideline.

### Clause 1 — Plan before parallelizing (anti-rebase)

Before dispatching N parallel subagents, the parent agent MUST run the §7C `file_surface_overlap_check` from R71 against every in-flight brief PLUS every queued brief. If two PRs are going to touch the same file and merge order matters, **serialize them.** Rebasing is a waste of operator time and a waste of subagent credits — both of which are forbidden under R52.

A rebase cycle costs:
- The second-merger's full R66 re-run (~10–30 minutes of CI)
- A fresh R65 50-failures self-sweep on the rebased SHA
- Re-attesting the R67 dispatch row
- Auditor R55 re-fire (rebase invalidates the prior audit)

That's a complete waste of an operator-paid cycle. Avoid it by sequencing.

**Implementation:** Before any `run_subagent` that creates a code-writing lane, the parent runs:
```
For every (current_brief, other_in_flight_brief) pair:
  diff(OWNS_lists) → if intersect ≠ ∅ → serialize, do not parallelize
```

### Clause 2 — Push every 2 minutes, always (R61 reinforced)

Every active worktree with uncommitted or unpushed work must be `git push`ed to GitHub at minimum every 2 minutes. R61 said this already; R52 reinforces it as a sacred durability rule with equal weight to R64.

The litmus: **if the sandbox dies right now, every line of operator-paid work must already be on GitHub.** Uncommitted work on a sandbox is unrecoverable. Push first, push often, push always.

### Clause 3 — 24/7 operating posture

Keep yourself working. Minimize product questions. Ask the operator only when:
- The decision is architectural (changes data model, payment flow, persona scope)
- The decision creates an irreversible external side effect (publishes, sends, charges, deletes)
- A required input is genuinely missing and cannot be derived from existing canonical docs

Do NOT pause to ask:
- Which Dependabot PR to merge next (default = merge order = dispatch order, CLEAN-first)
- Which audit verdict to trust when two audits agree (trust the consensus)
- Whether to follow the master expansion plan (always yes)
- Whether to apply R0/R64/R65/R72 (always yes)

When in doubt about "ask vs decide," **decide and journal the decision in COMMUNITY_BUILD_JOURNAL.md** so the operator can override on review. Never let a session burn idle.

### Clause 4 — Capture every mid-flight state on operator handoff

The prior operator was credit-exhausted mid-flight on RNTL v14 builder R3. The next operator (this session) must:
1. Identify every in-flight subagent / PR / worktree from `dispatch.json` + the build journal
2. Verify current GitHub state (branches, SHAs, PR statuses) — the journal may lag reality
3. Resume from the exact stopping point, not restart from scratch
4. Update `dispatch.json` and the journal so the NEXT operator can do the same

R52 makes "credit exhaustion mid-cycle" a survivable failure mode. It is not survivable if the in-flight state is not journaled.

---

## R52's relationship to other rules

- **R52 + R64:** R52 protects operator work; R64 protects operator words. They are siblings.
- **R52 + R61:** R52 generalizes R61 from "code" to "all work" — including subagent dispatch state, plan documents, and audit briefs.
- **R52 + R67:** R67 enforces `dispatch.json` writes BEFORE waiting on subagents. R52 makes resumption from `dispatch.json` mandatory after operator handoff.
- **R52 + R71:** R71 caps parallelism at 5 lanes; R52 makes "plan before parallelizing" the non-negotiable precondition. Five lanes that need to rebase is worse than three lanes that merge cleanly.
- **R52 + R55 (stranded):** R55 says "rebase invalidates audit." R52 says "avoid rebasing." Together they protect every audit cycle from being wasted.

---

## Anti-patterns R52 forbids

1. **Dispatching parallel lanes without an OWNS-list overlap check.** Always run §7C first.
2. **Spending more than 2 minutes between pushes on an active worktree.** The 2-minute clock starts ticking the moment a subagent makes a code change.
3. **Pausing for operator input on decisions the canonical docs already answer.** Read first, ask only if the docs don't cover it.
4. **Restarting an in-flight builder from scratch when the prior round produced commits.** Snapshot the actual GitHub state, resume from there.
5. **Letting subagent dispatch state live only in the parent's conversation buffer.** It MUST be in `dispatch.json` on the remote.

---

— Codified per operator directive, 2026-06-13 21:33 PT
