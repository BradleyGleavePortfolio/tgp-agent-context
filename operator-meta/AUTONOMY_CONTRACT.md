> **Note:** Content is also reflected in /AGENT_RULES.md. This file remains active for backward compatibility with running crons.

# AUTONOMY CONTRACT — one-page extract

**This is the §4 of `R81_OPERATING_DOCTRINE.md`, extracted for fast reference.**
**Codified:** 2026-06-16. Read the full doctrine for context.

---

## ✅ Agent CAN do autonomously

- Spawn builders, auditors, fixers per the R81 audit cycle
- Squash-merge to **integration branches** (`wave-1-5-planning`, `phase-2-cleanup`, etc.) when **both** auditors return CLEAN_NO_FINDINGS
- Spawn next-in-chain PRs per the build order (RESCOPED_BUILD_ORDER, HYPERSCALER_BUILD_ORDER)
- Cancel + re-spawn a stalled subagent (must first capture worktree state to a file under `audit-work/` and commit it to `tgp-agent-context`)
- Push handoff, doctrine, audit, brief, fixer-report, and scope-resolution docs to `tgp-agent-context`
- Halt and write a `<TASK>_SCOPE_MISMATCH.md` per R71 when the brief doesn't match repo reality
- Run a re-audit when CI status changes
- Refine wording of operator rules ONLY in summaries — never edit the verbatim quote files
- Update `BACKFILL_LEDGER` after each Phase 2 PR completes

---

## ⚠️ Agent MUST present operator choice

Use the **§3 operator-choice format** from `R81_OPERATING_DOCTRINE.md`:
🏛️ Hyperscaler research → Options (a)/(b)/(c) → 🏋️ Coach/client metaphor → 📐 Forward-compat check → My recommendation

DO NOT proceed without operator approval on:

- **(a) Architectural pivots not in the build order** — including scope re-interpretations (e.g. W1.5-A3 "User/Gym/GymMembership" → "RLS spine convergence"). Even when the architect's brief is strong: ASK.
- **(b) Merging to `main` (production)** — integration branches OK alone; prod merges require operator approval per the build order's "final merge sequence + staging soak + prod flag flip"
- **(c) Adding/removing R-rules or editing existing R-rule verbatim quotes** — R64 explicitly reserves this to the operator
- **(d) Changing the audit cycle, the auditor models, or the dual-auditor split** — doctrine-level changes, not implementation choices
- **(e) Cancelling a subagent that has produced uncommitted work** — must capture worktree first; if work is salvageable, ASK whether to resume from current state or restart
- **(f) Any change to user data, PII handling, RLS policy semantics, billing/Stripe wiring, or auth/JWT** — even if "obviously safe"
- **(g) Going past the LOC cap** — >400 hard, >200 ideal. Even by 1 line.
- **(h) Changing the build order or merging out of sequence** — the order is a dependency graph, not a suggestion
- **(i) Touching a different repo than the one the brief authorized** — cross-repo scope creep is forbidden without explicit operator authorization
- **(j) Spending the equivalent of a "high-cost" subagent run on speculative work** — exploration is fine; speculative builders on un-briefed work are not

---

## 🤔 If in doubt: ASK

The cost of a 30-second operator confirmation is one message.
The cost of an autonomous architectural pivot the operator didn't approve is a multi-hour rollback.
**Default to asking.**