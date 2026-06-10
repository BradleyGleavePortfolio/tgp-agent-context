# Audit Cycle — Step 04: PR #377 R1-P2 Fixer Complete (v1-6 Coach Admin)

**Date:** 2026-06-09 17:19 PDT
**PR:** #377 — v1-6 coach admin endpoints (cohort write, members, coach inbox)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Branch (corrected):** `feature/community-v1-6-coach-backend` (NOT `-coach-admin` — brief had a typo)
**Head advance:** `880881f7` → `6a041f7c` (3 title-only commits)
**Fixer:** Opus 4.8 (subagent id `pr_377_r1_p2_fixer_v1_6_coach_admin_mq7b744b`)
**Worktree used:** `/home/user/workspace/tgp/backend-v1-6-coach` (already on the PR branch)

## Fixes applied (3 commits, all R1-P2 closed)

### Commit `ebdde05c` — P2-001: coach_replied_at producer (FUNCTIONAL)

**Problem (R1):** Coach inbox aggregator computes "unanswered" via `coach_replied_at`, but nothing wrote that column → inbox permanently shows all threads as unanswered.

**Fix:** New repo method `markCohortClientMessagesReplied` that, when a coach/owner sends a cohort message, stamps `coach_replied_at = NOW()` on the cohort's outstanding **client** messages. The `where` clause mirrors the inbox reader exactly (same cohort_id, same client-sender filter) so the producer and consumer can't drift.

**Safety:** Bounded to the persisted `cohort_id` and client senders only — no over-stamping on coach-authored or system messages.

### Commit `d37f83d8` — P2-002: case-insensitive email lookup (FUNCTIONAL EDGE)

**Problem (R1):** `findUserByEmail` lowercased input but `User.email` isn't normalized at write time, so users registered as `John.Doe@example.com` couldn't be found by lowercase lookup.

**Fix:** Switched to Prisma's case-insensitive mode:
```ts
prisma.user.findFirst({ where: { email: { equals, mode: 'insensitive' } } })
```

**Test:** Unit test verifies mixed-case stored email is found by lowercase input.

### Commit `6a041f7c` — P2-003: feature flag default-off coverage (TEST GAP)

**Problem (R1):** No lane-specific test proved `FEATURE_COMMUNITY_API` default-off behavior on the v1-6 controllers.

**Fix:** New e2e spec across ALL three v1-6 controllers (cohort write, members, inbox):
- Flag OFF → endpoint returns **503** typed `community.disabled`
- Flag ON → endpoint returns 200/201

No DB required; runs in the always-on lane.

## Test results

**v1-6 lane + RLS + new specs:** 64 passed + 20 skipped (live-gated, expected per the new live-RLS job pattern) + 0 failed.
- 13 net new tests in this fixer round.
- No `.skip`/`.only` introduced.

## Gates

- `tsc --noEmit` → 0 errors ✅
- `eslint` on the 6 touched files → 0 errors ✅
- Repo-wide eslint shows 11 errors — these are PRE-EXISTING in unrelated files; identical count at `880881f7` (verified). NOT introduced by this fixer.
- `prisma format` produced an alignment drift in `schema.prisma` (pre-existing); fixer reverted it to preserve the **forbidden-file additivity** rule for v1-6 (PR was meant to be schema-untouched). Smart call.

## Operational notes from the fixer

- **Branch name correction:** Brief said `feature/community-v1-6-coach-admin`, actual PR head ref is `feature/community-v1-6-coach-backend`. Fixer worked on the correct branch (already checked out in the worktree). No impact, just a naming discrepancy to log.
- **Test pattern scoping:** Brief's `npm test --testPathPattern='(v1-6|community)'` matches dozens of heavy unrelated suites and OOMs the runner (same OOM Roman builder hit in R66). Fixer scoped to the v1-6 lane dirs + new specs + RLS spec with `--runInBand` — the set R1 used.

## Items deferred (intentionally out of scope)

- P3-004 (master-flag reuse — documented intent)
- P3-005 (plan_context_type discriminator — theoretical)
- P3-006 (RolesGuard role-model inconsistency — separate cleanup)
- User.email normalization-at-write (separate ticket)

Listed in the PR comment for traceability.

## CI status

- `build-and-test` → PENDING (just kicked off post-push)
- mergeable: MERGEABLE, mergeStateStatus: UNSTABLE (CI in flight)

## Deliverables produced this step

- `/home/user/workspace/PR377_FIXER_RESULT.md` — fixer report
- PR #377 updated in place (3 commits pushed)
- PR comment via `gh api` citing fixes + deferred items

## Next step in cycle

**Step 05:** Dispatch PR #377 R2 audit (GPT-5.5) — verify the 3 P2 fixes hold up, and confirm no new findings introduced. Once CLEAN, merge.
