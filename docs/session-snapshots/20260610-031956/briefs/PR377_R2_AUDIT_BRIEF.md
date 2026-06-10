# PR #377 R2 Audit Brief — v1-6 Coach Admin (Post-Fixer)

**Role:** GPT-5.5 R2 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #377 · Branch `feature/community-v1-6-coach-backend` · Head SHA `6a041f7c` · Base `6c4f618c`
**Worktree:** create new `/home/user/workspace/tgp/backend-v1-6-r2-audit` (detached @ `6a041f7c`) or reuse `/home/user/workspace/tgp/backend-v1-6-coach` if clean.
**Verdict rubric:** CLEAN / DIRTY-MINOR (cosmetic only) / DIRTY (functional)

## Context

R1 audit (`/home/user/workspace/AUDIT_R1_PR_377_REPORT.md`) returned DIRTY-MINOR with:
- R1-P2-001: Coach inbox "unanswered" permanently stale — `coach_replied_at` never written
- R1-P2-002: Assign-by-email case-fold mismatch
- R1-P2-003: Missing default-off feature flag test
- 3 P3s deferred

Fixer pushed 3 commits (`ebdde05c`, `d37f83d8`, `6a041f7c`). See `/home/user/workspace/PR377_FIXER_RESULT.md` and step log `/home/user/workspace/audit_cycle_log/STEP_04_PR377_fixer_complete.md`.

## R2 audit scope

### Verify each R1-P2 fix landed correctly

**P2-001 (coach_replied_at writer):**
- New repo method `markCohortClientMessagesReplied` exists.
- Called from the coach/owner cohort-message send path (find it: search for `cohort message` send service).
- `where` clause mirrors the inbox reader exactly — same `cohort_id`, same client-sender filter.
- Bounded to client senders only (no over-stamping on coach/system messages).
- Runs in the same transaction as the send (not eventual consistency).
- Test exists that proves: thread shows unanswered → coach posts → thread no longer unanswered.

**P2-002 (case-insensitive email):**
- `findUserByEmail` now uses `findFirst({ where: { email: { equals, mode: 'insensitive' } } })`.
- Test: mixed-case stored email (`John.Doe@example.com`) found by lowercase input (`john.doe@example.com`).
- Verify no regression: still finds case-matched emails.
- Edge: empty string / null input gracefully returns null, not throws.

**P2-003 (default-off coverage):**
- New e2e spec covers ALL 3 v1-6 controllers (cohort write, members, inbox).
- Flag OFF → 503 typed `community.disabled` (not 404 — confirm this is the lane convention).
- Flag ON → 200/201.
- Runs in the always-on lane (no DB needed).

### Cross-checks (HECTACORN + scope)

- **Schema additivity:** `git diff 880881f7..6a041f7c -- prisma/schema.prisma` should be empty (fixer reverted alignment drift).
- **No forbidden-file changes:** `app.module.ts`, `package.json`, `package-lock.json` untouched.
- **RLS untouched:** the 30 RLS tests added in the original v1-6 build still pass.
- **Sub-coach scope:** any code path the fixer touched still consults `CommunityAccessService.isWorkspaceCoach` (the v1-6 lane's canonical primitive).
- **Title-only commits:** all 3 new commits are title-only, author `Dynasia G <dynasia@trygrowthproject.com>`.
- **R1 P3s NOT auto-fixed:** confirm the fixer respected the deferred-out-of-scope list (no surprise changes to master-flag, plan_context_type, RolesGuard).

### Re-run gates in the worktree

```bash
cd /home/user/workspace/tgp/backend-v1-6-coach   # or fresh worktree at 6a041f7c
git fetch origin
git checkout feature/community-v1-6-coach-backend
git pull --ff-only origin feature/community-v1-6-coach-backend
./node_modules/.bin/prisma format
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint src/community/v1-6 test/community/v1-6 test/rls
# Scope test command (not the brief's pattern that OOMs):
npm test --runInBand --testPathPattern='(community/v1-6|test/rls)' 2>&1 | tail -30
```

Cross-check the fixer's claim of 64 pass + 20 live-gated skips + 0 fail + 13 net new tests.

### CI verification

- `gh pr checks 377 --repo BradleyGleavePortfolio/growth-project-backend` → confirm `build-and-test` passes (or note any failure for the fixer to address).
- If a CI failure surfaces a regression, log it as R2-P1.

## Findings format

R2-P0/P1/P2/P3 with file:line refs. If any R1-P2 finding regressed or wasn't fully addressed, log as R2-P1.

## Verdict thresholds

- **CLEAN:** all 3 R1-P2 closed cleanly; CI green; no new functional findings.
- **DIRTY-MINOR:** cosmetic-only or test-pattern issues; ship-ready.
- **DIRTY:** functional regression, R1 finding regressed, or new P1 surface.

## Deliverables

1. `/home/user/workspace/AUDIT_R2_PR_377_REPORT.md` — structured findings
2. `/home/user/workspace/PR377_R2_AUDIT_RESULT.md` — verdict summary
3. PR comment via `gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/377/comments` — verdict + top findings. USE `gh api`, NOT `gh pr comment`.

## Constraints

- READ-ONLY.
- `gh` with `api_credentials=["github"]`.
- Do NOT use `gh pr comment` — use `gh api`.
