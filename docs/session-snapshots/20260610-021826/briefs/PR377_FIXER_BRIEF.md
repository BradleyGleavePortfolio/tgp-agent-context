# PR #377 Fixer Brief — Address R1-P2 Findings (v1-6 Coach Admin)

**Role:** Opus 4.8 Fixer
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #377 · Branch `feature/community-v1-6-coach-admin` · Current head SHA `880881f7` · Base `main` (`6c4f618c`)
**Worktree:** `/home/user/workspace/tgp/backend-377-fixer` (NEW branch `fix/v1-6-coach-r1-p2` off `6c4f618c`)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

## ⚠ Push strategy

Apply fixes to the EXISTING PR branch `feature/community-v1-6-coach-admin`, NOT a new branch. The `fix/v1-6-coach-r1-p2` worktree branch is scratch.

Steps:
```bash
cd /home/user/workspace/tgp/backend-377-fixer
git fetch origin
git checkout feature/community-v1-6-coach-admin
git pull --ff-only origin feature/community-v1-6-coach-admin   # should be up-to-date at 880881f7
# Apply fixes
# Commit each fix as its own title-only commit (or one combined if small)
git push origin feature/community-v1-6-coach-admin
```

So PR #377 updates in place.

## R1 audit findings to fix

Read: `/home/user/workspace/AUDIT_R1_PR_377_REPORT.md` and `/home/user/workspace/PR377_R1_AUDIT_RESULT.md` for full context.

**R1 verdict: DIRTY-MINOR.** Fix the 2 functional P2s + 1 missing test. The 3 P3s are cosmetic — note them in the PR comment but do NOT auto-fix in this round (separate ticket).

### Fix 1 — P2-001: Coach inbox "unanswered" is permanently stale (FUNCTIONAL)

**Problem:** The coach inbox aggregator computes a thread as "unanswered" by checking `coach_replied_at`, but **nothing in the repo ever writes that column**. Result: every thread shows as unanswered forever; the inbox is useless.

**Investigation order:**
1. Find where `coach_replied_at` is read (likely in the inbox aggregator service / query).
2. Find where coach messages are written (likely the existing thread POST endpoint added in v1-5 or earlier).
3. Confirm: is `coach_replied_at` on `Thread`, `Cohort`, `Post`, or some `Message` model? Check the prisma schema.

**Fix:** On any new coach-authored write that lands in the inbox surface (thread reply / post / message), update the parent record's `coach_replied_at = NOW()`. Likely just:
- Find the existing message-send service method.
- Within the same transaction, if the author role is coach, `UPDATE` parent.`coach_replied_at`.

**Test:** Add a unit test in the v1-6 inbox suite that:
- Creates a thread.
- Inbox aggregator returns it as unanswered.
- Coach posts a reply.
- Inbox aggregator no longer returns it as unanswered.

### Fix 2 — P2-002: Assign-by-email case-fold mismatch (FUNCTIONAL EDGE)

**Problem:** The assign-by-email endpoint force-lowercases the email lookup, but `User.email` isn't normalized at create time. A user registered as `John.Doe@example.com` cannot be found when a coach tries to assign by email.

**Fix (choose ONE):**
- **Option A (safest):** In the assign-by-email controller/service, use case-insensitive lookup: `where: { email: { equals: input.email, mode: 'insensitive' } }` (Prisma supports this for Postgres).
- **Option B:** Normalize on lookup AND optionally backfill via a one-shot migration that lowercases `User.email`. **Don't** add a normalization-on-write hook here — out of scope, separate ticket.

Pick Option A. Document in the PR body that User.email normalization-at-write is a separate follow-up.

**Test:** Add a unit test:
- Create user with email `John.Doe@example.com`.
- Coach assign-by-email with `john.doe@example.com` → finds the user.

### Fix 3 — P2-003: Missing default-off test for FEATURE_COMMUNITY_V1_6_COACH_ADMIN

**Problem:** No test in the v1-6 lane suites that proves the feature flag default-off behavior (returns 503 / 404 when unset). The guard is reused so it's covered indirectly, but a lane-specific test makes the contract explicit.

**Fix:** Add one test per v1-6 controller (cohort write, members, inbox) that:
- With `FEATURE_COMMUNITY_V1_6_COACH_ADMIN` unset OR `'false'`, the endpoint returns 503 or 404 (whatever the guard's convention is — likely 404 per the v1 community lane pattern).
- With `FEATURE_COMMUNITY_V1_6_COACH_ADMIN='true'`, the endpoint behaves normally.

## Gates (must all pass before push)

- `./node_modules/.bin/prisma format` → no diff
- `./node_modules/.bin/tsc --noEmit` → 0 errors
- `./node_modules/.bin/eslint src/ test/` → 0 errors
- `npm test -- --testPathPattern='(v1-6|community)'` → all pass; new tests included; no `.skip`
- New tests are NOT in the live-gated suite (or if they are, they must run under the live DB).

## Commit policy

Title-only commits. Group fixes logically:
- `fix(community-v1-6): write coach_replied_at on inbox-surface coach posts`
- `fix(community-v1-6): case-insensitive email lookup in assign-by-email`
- `test(community-v1-6): feature flag default-off coverage`

OR squash into one fix commit if smaller:
- `fix(community-v1-6): address R1-P2 findings (inbox stale + email case + default-off test)`

Author: `Dynasia G <dynasia@trygrowthproject.com>`

## Out of scope (do NOT do)

- P3-004 (master-flag reuse — documented intent, no fix needed)
- P3-005 (`plan_context_type` discriminator — theoretical only)
- P3-006 (co-coach/RolesGuard role-model inconsistency — separate cleanup ticket)
- User.email normalization-at-write (separate ticket)
- Any refactor outside the 3 in-scope surfaces

## Deliverables

1. PR #377 updated in place with fix commits pushed (head SHA advances)
2. `/home/user/workspace/PR377_FIXER_RESULT.md` — what was fixed, before/after snippets, gate output, ready for R2
3. Comment on PR #377 via `gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/377/comments` summarizing fixes + listing the 3 P3s deferred to separate tickets

## Constraints

- `gh` with `api_credentials=["github"]`.
- Do NOT use `gh pr comment` — use `gh api` directly.
- Title-only commits. Author `Dynasia G <dynasia@trygrowthproject.com>`.
- Force-push only if needed with `--force-with-lease=feature/community-v1-6-coach-admin:<remote-sha>`. Normal push preferred.
- Do NOT touch unrelated files. Do NOT bump deps.
