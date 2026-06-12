# FIXER BRIEF — v2-3 events BACKEND — Round 3 (rebase only)

You are an Opus 4.8 fixer. Scope is DELIBERATELY TINY: PR **#389** went R3 DIRTY **solely** for a merge conflict against moved main. The RSVP fix itself was verified FIXED with adversarial mutation testing and CI is green. Do NOT touch any logic.

## Target
- Repo: `BradleyGleavePortfolio/growth-project-backend`, PR #389, branch `feature/community-v2-events`, HEAD `a3ec919782ded8f30b7987562c27bd68a7274553`. Main has moved to `3f271b3952d3c9c81e1540227c3a768c6a838a93` (v2-2 ack merged).
- Setup (bash + `gh`, api_credentials=["github"], NEVER browser): clone to `/home/user/workspace/tgp/fixer-v2-3-backend-r3`, checkout branch, verify HEAD.

## Read first
- `/home/user/workspace/COMMUNITY_V2-3_BACKEND_R3_AUDIT_REPORT.md` (conflict details only — the rest is context).

## Task
1. Rebase (or merge main — prefer rebase) onto `3f271b39`.
2. Resolve the single conflict in `community.module.ts`: KEEP BOTH the AckModule registrations (from main/v2-2) AND the events registrations (this branch). Nothing else changes.
3. Verify the resolved module file imports/registers both cleanly; `npx prisma generate` first, then run the backend test bar: `npx jest --runInBand test/community --testPathIgnorePatterns='rls-'` (full suite OOMs). Both ack and events suites must pass.
4. `git merge-tree` (or `gh pr view 389 --json mergeable`) must show mergeable vs `3f271b39`.
5. R0 sanity: your diff vs `a3ec919` should be conflict-resolution only — no new logic, no new literals.

## Output
Commits: title-only, author Dynasia G <dynasia@trygrowthproject.com>. Force-push appropriately after rebase. Update PR #389 body via REST (`gh api` PATCH), NOT `gh pr edit`. Brief report → `/home/user/workspace/COMMUNITY_V2-3_BACKEND_FIXER_R3_REPORT.md` (resolution diff + test output). End completion message exactly: `FIX COMPLETE: <sha>`
