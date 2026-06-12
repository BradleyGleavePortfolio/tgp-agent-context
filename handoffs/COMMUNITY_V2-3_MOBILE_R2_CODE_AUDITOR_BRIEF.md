# COMMUNITY v2-3 MOBILE R2 CODE AUDITOR BRIEF

You are a FRESH R2 code auditor (not the builder, fixer, or R1 auditors) for **BradleyGleavePortfolio/growth-project-mobile PR #236** (`feature/community-v2-events-mobile`).

Expected HEAD: `1c0cb3ae2ae437f3dcc218ba70bfccf2156af2ec` (R1 fixer head; verify via `gh pr view 236` and `git rev-parse HEAD`). Mobile main has MOVED to `79c0a9be` (v2-2 merged).

R1 code verdict was DIRTY-CRITICAL with findings F1–F8 (code) and the combined fixer also addressed F9–F14 (UX, audited separately). You audit CODE: F1–F8 plus regression scan.

## Required reading (NO SKIMMING)
1. `/home/user/workspace/COMMUNITY_V2-3_MOBILE_R1_CODE_AUDIT_REPORT.md` — findings you are verifying.
2. `/home/user/workspace/COMMUNITY_V2-3_MOBILE_FIXER_R1_BRIEF.md` and `/home/user/workspace/COMMUNITY_V2-3_MOBILE_FIXER_R1_REPORT.md` — what the fixer claims (all F1–F14 fixed).
3. Doctrine: `/home/user/workspace/doctrine/FIFTY_FAILURES_PLAINTEXT.md` and `/home/user/workspace/doctrine/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md`.

## Setup
- Worktree: `/home/user/workspace/tgp/audit-v2-3-mobile-code-r2`. All `gh`/`git` via bash with `api_credentials=["github"]`. NEVER browser tools.
- Backend contract: `growth-project-backend` PR #389 (`feature/community-v2-events`) — NOTE: #389 is being rebased onto backend main `3f271b39` in parallel; the DTO content is unchanged by that rebase. Verify drift tests against the DTOs as they exist on the #389 branch when you run.

## Verify (R1 findings F1–F8)
1. **F1 flag-off containment**: event routes gated in `CommunityNavigator.tsx` + `CoachCommunityNavigator.tsx`; navigator-level flag-off tests exist and are real. Zero event UI/calls/routes when flag off.
2. **F2 Roman face removed** from client event-detail empty state (`CommunityEventDetailScreen.tsx`) → neutral empty state matching coach surface.
3. **F3 https guard** on `Linking.openURL` + hostile-URL tests (javascript:, data:, http:).
4. **F4 mutation errors surfaced + 409 classified** (refetch/reconcile + calm message) with tests.
5. **F5 STATE_META unknown-state fallback** + hostile-state test.
6. **F6 drift tests**: strict Zod parity with backend DTOs; extra-field + bad-timestamp rejection. Tests REAL (#17): would they fail if schemas loosened?
7. **F7 reduced-motion parity** on modals. **F8**: `as unknown as` removed; full R0 grep battery on added lines INCLUDING comments returns NOTHING (`as any`, `as unknown as`, `@ts-ignore`, TODO/FIXME/placeholder, "Coming soon", empty catch, `.catch(() => undefined)`, sonnet, raw hex outside tests, pictograph emoji).

## Regression scan
- **Mergeability vs moved main `79c0a9be`** (`git merge-tree` / `gh pr view 236 --json mergeable`). A conflict alone = DIRTY with details.
- CI: `gh pr checks 236` green at exactly `1c0cb3a`; inspect `gh run view` to confirm new suites visibly executed.
- `npx tsc --noEmit` zero NEW errors (pre-existing expo-notifications TS1010 allowed).
- Re-run full R1 gate table: additive-only, contract cross-check, FACE+VOICE, flag-off invariance, a11y.

## Verdict
Report to `/home/user/workspace/COMMUNITY_V2-3_MOBILE_R2_CODE_AUDIT_REPORT.md` with file:line evidence for every claim. End your final message with exactly `VERDICT: CLEAN` or `VERDICT: DIRTY` (findings with P0/P1/P2 + fix sketches if DIRTY).
