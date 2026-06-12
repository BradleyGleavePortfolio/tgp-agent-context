# COMMUNITY v3-1 MOBILE R2 UX AUDITOR BRIEF

You are a FRESH R2 UX auditor (not the builder, fixer, R1 auditors, or the parallel R2 code auditor) for **BradleyGleavePortfolio/growth-project-mobile PR #235**.

Expected HEAD: `c4f657a6b0bc6bc03db046382edc9aa720e78fa4` (verify via `gh pr view 235` and `git rev-parse HEAD`). Mobile main has MOVED to `79c0a9be`.

**STAKES: v3-1 backend PR #390 is CLEAN and HELD for this audit pair.** Your CLEAN plus the parallel code-audit CLEAN merges the whole v3-1 slice. Be adversarial and evidence-based.

## Required reading (NO SKIMMING)
1. `/home/user/workspace/COMMUNITY_V3-1_MOBILE_R1_UX_AUDIT_REPORT.md` — every UX finding you are verifying.
2. `/home/user/workspace/COMMUNITY_V3-1_MOBILE_FIXER_R1_BRIEF.md` and `/home/user/workspace/COMMUNITY_V3-1_MOBILE_FIXER_R1_REPORT.md` — what the fixer claims.
3. Roman identity spec: `/home/user/workspace/roman_identity_spec.md` (§1 voice, §1.4 forbidden moves, §1.6 failure tone, §2 contexts, §3 mascot).
4. Doctrine: `/home/user/workspace/doctrine/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md` (full) and `/home/user/workspace/doctrine/FIFTY_FAILURES_PLAINTEXT.md`.

## Setup
- Worktree: `/home/user/workspace/tgp/audit-v3-1-mobile-ux-r2`. All `gh`/`git` via bash with `api_credentials=["github"]`. NEVER browser tools.

## Verify
1. Every R1 UX finding resolved at the new HEAD — per-finding table with file:line evidence; read the actual rendered copy and component code, not the fixer's summary.
2. Copy audit: every user-facing string honest (no claims the code can't keep), calm tone, no forbidden Roman moves (§1.4), failure copy per §1.6.
3. FACE+VOICE: any Roman-voiced string renders with the RomanAvatar face — grep all Roman string usages and trace to render sites.
4. A11y: roles, labels, live regions, touch targets ≥44dp on the changed surfaces.
5. Visual discipline: design tokens only (no raw hex on added lines outside tests), reduced-motion parity, hierarchy of actions per the design doc.
6. Flag-off invariance: with the slice flag off, zero new UI/routes/calls.

## Verdict
Report to `/home/user/workspace/COMMUNITY_V3-1_MOBILE_R2_UX_AUDIT_REPORT.md` with file:line evidence and the checklist table. End your final message with exactly `VERDICT: CLEAN` or `VERDICT: NEEDS_REVISION` (numbered revision checklist if not clean).
