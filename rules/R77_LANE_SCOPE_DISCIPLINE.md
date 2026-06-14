# R77 — Lane scope discipline (subagents stay inside their brief)

**Codified:** 2026-06-14 (overnight run, post L5 over-extension)
**Severity:** Major — over-extension causes self-inflicted regressions.

## The rule

A lane subagent operates inside the OWNS scope of its V2 builder brief. Files outside that scope are off-limits unless the operator explicitly authorizes a scope expansion in a follow-up message. "It would be nice to fix this while I'm here" is not authorization.

## The L5 case (2026-06-14)

L5 (#242 Roman P4 mobile, ED.3+ED.4 surfaces) had a clean OWNS list. After a clean merge of origin/main (`08db00f`) — necessary to resolve DIRTY mergeable state — L5 noticed RNTL v14 (already on main via #245) had async render semantics that conflicted with several of its branch's test files. So far, fine.

Then L5 went further: it commit `f819e04` "test: migrate Roman P3/P4 + ED tests to RNTL v14 async render" — touching files outside #242's OWNS, doing async-render rewrites that were L3's lane (`migrate/rntl-v14` branch). This regressed 2 timing-sensitive test files that had been passing on origin/main:

- `src/screens/client/__tests__/ProgressScreen.chart.test.tsx`
- `src/screens/coach/ed/__tests__/FirstPaymentWowHost.test.tsx`

CI went from green-by-rebase to red-by-self-inflicted-RNTL-migration.

The recovery (operator commits `ed6d226` + L5 subagent's uncommitted prep) took ~15 minutes of additional debug time and a follow-up correction conversation.

## Where the line is

Inside OWNS, anything goes. Outside OWNS, three allowed patterns only:

1. **Mechanical adaptation** (e.g. import statement updates when a refactor on main renames a symbol you depend on). Touch ONLY the line that consumes the renamed symbol.
2. **Repair when origin/main intersection breaks your tests** (e.g. async-render migration is on main; your test file no longer compiles). Touch ONLY the files your branch directly added or substantially modified. If a test on main was already async-broken before your branch existed, that's not your lane.
3. **Operator-authorized scope expansion**, communicated in plain text.

Anything else: write a one-line note in your blocker doc and stop. The operator will either authorize or assign it to the correct lane.

## How to detect the over-extension

A `git diff origin/main..HEAD --stat` whose touched-file set is larger than the lane's OWNS list is a red flag. Subagents should run this check before pushing and challenge themselves: "are these touches in scope?"

## Anti-pattern in past briefs (to be removed)

Older briefs included encouragements like "fix anything that's obviously wrong while you're in there" — that text is now banned. New V2 briefs and templates must include this clause verbatim:

> **R77 (scope):** This lane OWNS the files listed above. Any modification to a file outside OWNS — even a one-line fix — requires operator authorization. Document scope questions in your blocker doc and stop. Self-authorized scope expansion is a regression risk and slows the merge train.

## Owners
- New V2 briefs: I (Bradley / operator) include the R77 clause.
- Subagents: enforce R77 self-check before any push.
