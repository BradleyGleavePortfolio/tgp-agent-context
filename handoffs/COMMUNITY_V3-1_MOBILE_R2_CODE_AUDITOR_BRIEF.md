# COMMUNITY v3-1 MOBILE R2 CODE AUDITOR BRIEF

You are a FRESH R2 code auditor (not the builder, fixer, or R1 auditors) for **BradleyGleavePortfolio/growth-project-mobile PR #235**.

Expected HEAD: `c4f657a6b0bc6bc03db046382edc9aa720e78fa4` (R1 fixer head; verify via `gh pr view 235` and `git rev-parse HEAD`). Mobile main has MOVED to `79c0a9be` (v2-2 merged).

**STAKES: v3-1 backend PR #390 is R4 CLEAN and HELD for this audit pair.** If this code audit AND the parallel UX audit both return CLEAN, the entire v3-1 slice merges immediately (#390 first, then #235). Hold R0 to its highest standard — adversarial, evidence-based, no benefit of the doubt. A wrong CLEAN ships defects; a wrong DIRTY burns a cycle.

## Required reading (NO SKIMMING)
1. `/home/user/workspace/COMMUNITY_V3-1_MOBILE_R1_CODE_AUDIT_REPORT.md` — the findings you are verifying (incl. the FABRICATION finding).
2. `/home/user/workspace/COMMUNITY_V3-1_MOBILE_FIXER_R1_BRIEF.md` and `/home/user/workspace/COMMUNITY_V3-1_MOBILE_FIXER_R1_REPORT.md` — what the fixer claims (fabrication excised, 37 tests).
3. Doctrine: `/home/user/workspace/doctrine/FIFTY_FAILURES_PLAINTEXT.md` and `/home/user/workspace/doctrine/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md`.

## Setup
- Worktree: `/home/user/workspace/tgp/audit-v3-1-mobile-code-r2`. All `gh`/`git` via bash with `api_credentials=["github"]`. NEVER browser tools.
- Backend contract: `growth-project-backend` PR #390 @ `6d97f46a` — its DTOs are binding for drift tests.

## Verify
1. Every R1 finding fixed at the new HEAD — per-finding table with file:line evidence. For the fabrication finding: confirm the fabricated material is fully excised (grep the diff, not just the fixer's claims).
2. Tests are REAL (#17): would each new assertion fail if the code regressed? Spot-check by reasoning through the logic; the 37 claimed tests must visibly execute in CI.
3. CI: `gh pr checks 235` green at exactly `c4f657a`; inspect `gh run view` to confirm new suites executed there (test names visible, not just a green check).
4. **Mergeability vs moved main `79c0a9be`** (`git merge-tree` or `gh pr view 235 --json mergeable`). Two sibling PRs already hit conflicts vs moved mains — if this PR conflicts, that alone is DIRTY with the conflict detailed.
5. Full R0 grep battery on added lines INCLUDING comments: `as unknown as`, `as any`, `@ts-ignore`, TODO/FIXME/placeholder, "Coming soon", empty catch, `.catch(() => undefined)`, sonnet, raw hex outside tests, pictograph emoji (comment-literal failures recurred 3×).
6. Re-run the full R1 gate table at new HEAD: flag-off invariance, contract cross-check, FACE+VOICE (Roman strings render with face), additive-only, a11y, `npx tsc --noEmit` (pre-existing expo-notifications TS1010 allowed).

## Verdict
Report to `/home/user/workspace/COMMUNITY_V3-1_MOBILE_R2_CODE_AUDIT_REPORT.md` with file:line evidence for every claim. End your final message with exactly `VERDICT: CLEAN` or `VERDICT: DIRTY` (findings with P0/P1/P2 + fix sketches if DIRTY).
