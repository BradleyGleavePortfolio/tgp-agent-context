# R82 — Tracking-Issue Discipline

**Status:** Active. Tied with R74/R77 for operator-side rules. Codified 2026-06-15 during R81 backfill audit→fix cycle.

## Rule

Any agent (operator, fixer, auditor, subagent) that surfaces work which is out-of-lane, deferred, or a follow-up MUST file a GitHub tracking issue in the appropriate repo BEFORE finishing its turn — never leave it as a code comment, never leave it as a chat-only mention, never leave it only in a workspace file.

## Required body sections

Every tracking issue MUST include all six sections, in this order:

1. **Why this matters** — concrete failure mode if not done; reference the audit / PR / decision that surfaced it
2. **What's required** — bulleted checklist, broken down by surface (mobile / backend / data / etc.)
3. **Already resolved** — bulleted checklist of items the originating PR's fix cycle closed, so the next operator can see what remains
4. **References** — at minimum: the audit file path, the originating PR number, the operator decision identifier (e.g. "Decision 5B per overnight wrap 2026-06-15")
5. **Owner** — named owner; default `Bradley Gleave` until reassigned in writing
6. **Labels (in issue metadata, not body):** `R81-backfill` + `tracking` + topical labels (`community`, `billing`, `mobile`, `backend`, `pre-flag-flip`, etc.)

## When this rule fires

- Fixer descopes a finding because it's out of lane (e.g. "Decision 6B requires wiring two components into screens that aren't in the PR's surface") → file tracking issue
- Auditor surfaces a P3 that is correct-as-shipped but should be tracked (e.g. dead-code or telemetry gap left to a follow-up) → file tracking issue
- Operator decision creates dependent work in another lane / repo (e.g. PR #251's server-side filter creates dependent doors in mobile) → file tracking issue
- Re-audit cycle uncovers a defect that pre-dates the current PR → file tracking issue against the originating PR rather than blocking the current one
- ANY mention of "should be tracked", "follow-up needed", "next operator", "post-flag-flip", "TODO" in audit text → MUST become a tracking issue

## Anti-patterns (banned)

- `// TODO:` or `// FIXME:` comments without a GitHub issue link
- "We'll handle that in a follow-up" in PR descriptions without an issue number
- Chat-only mentions ("oh by the way, we should also...")
- Workspace-file-only notes that aren't mirrored to GitHub
- Filing an issue without all six required sections
- Filing without an owner (defaulting to "TBD" is banned — use `Bradley Gleave` until reassigned)
- Filing with body shorter than ~400 words on substantive work (thin issues vanish from the team's attention)

## Rationale

Tracking issues are the seam between in-lane fixer work and follow-up product work. Without them, descoped items vanish into chat history, audit files become tombstones, and the next operator has no inventory of "what still needs to be built before flag-flip." R77 (read-only worktrees / lane scope) and R81 (auditor gate) are only enforceable if descoped work has a durable home outside the PR being audited.

## Examples

**Good:** `growth-project-mobile#XXX` "Track: community surfaces required before flipping `communitySearch` ON" — full six-section body, four labels, owner named, references the audit file and the decision.

**Bad:** Audit file says "this should be tracked as a P2 follow-up before flag-flip" with no GitHub issue filed. The audit becomes the only record; nobody monitors audit files for follow-up work; the item is lost.

## Enforcement

- Operator at end-of-turn MUST grep their own work for the anti-patterns above and file any missing issues before declaring the turn complete
- Re-auditor MUST flag any descoped finding that lacks a tracking issue as a NEW finding (severity: P2)
- Handoff documents MUST cross-reference every open tracking issue surfaced during the session
