# PR #377 Fixer Result — R1-P2 Findings (v1-6 Coach Admin)

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #377 · Branch `feature/community-v1-6-coach-backend`
**Base SHA (audited):** `880881f7`
**New head SHA:** `6a041f7c` (pushed in place; PR updated)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Worktree used:** `/home/user/workspace/tgp/backend-v1-6-coach` (the branch was already checked out there; the scratch `backend-377-fixer` worktree could not check out the branch because it was in use).

> Note: the PR branch is `feature/community-v1-6-coach-backend` (the brief said `-coach-admin`; the actual PR head ref is `-coach-backend`). Verified via `gh pr view 377`.

## Commits added (title-only, on top of 880881f7)

```
ebdde05c fix(community-v1-6): write coach_replied_at on inbox-surface coach posts
d37f83d8 fix(community-v1-6): case-insensitive email lookup in assign-by-email
6a041f7c test(community-v1-6): feature flag default-off coverage
```

---

## Fix 1 — P2-001: Coach inbox "unanswered" was permanently stale (FUNCTIONAL)

**Root cause:** `community-coach-inbox.repository.ts` defines the message arm of "unanswered" as `coach_replied_at IS NULL` for client messages, but **nothing in the repo ever wrote `coach_replied_at`** — so every client cohort message stayed unanswered forever. (The post arm was already correct: it detects coach-authored comments.)

**Fix:** Added a producer. When a coach/owner sends a cohort message, every prior open client message in that cohort is stamped `coach_replied_at = <message created_at>`, dropping them out of the inbox. Bounded to the **write result's** `cohort_id` (never request params) and to client (non coach/owner) senders.

### Before — `community-messages.service.ts` (`send`)
```ts
const created = await this.repo.createCohortMessage({ ... });
// v1-4 post-write tail: best-effort realtime ping (IDs only). ...
void this.realtime.broadcastCommunityEvent(...);
```

### After
```ts
const created = await this.repo.createCohortMessage({ ... });
// v1-6 coach-inbox producer: a coach/owner message into the cohort answers
// the cohort's outstanding client messages, so stamp coach_replied_at on them
// (the inbox message arm keys "unanswered" off that column). Bounded to the
// write result's cohort_id (never request params) and to client senders.
if (user.role === 'coach' || user.role === 'owner') {
  await this.repo.markCohortClientMessagesReplied({
    cohortId: created.cohort_id ?? cohort.id,
    repliedAt: created.created_at,
  });
}
void this.realtime.broadcastCommunityEvent(...);
```

### New repository method — `community-messages.repository.ts`
```ts
async markCohortClientMessagesReplied(params: {
  cohortId: string;
  repliedAt: Date;
}): Promise<number> {
  const { count } = await this.prisma.communityMessage.updateMany({
    where: {
      cohort_id: params.cohortId,
      scope: 'cohort',
      deleted_at: null,
      plan_context_type: null,           // exclude post-comments
      coach_replied_at: null,            // only still-open rows
      sender: { role: { notIn: ['coach', 'owner'] } }, // client messages only
    },
    data: { coach_replied_at: params.repliedAt },
  });
  return count;
}
```

The `updateMany` `where` clause mirrors the inbox `unansweredMessages` predicate exactly, so the producer and the reader stay in lockstep.

**Test:** `test/community/messages/community-messages-coach-reply.service.spec.ts` (4 cases, pure mock, no DB):
- coach reply → `markCohortClientMessagesReplied` called once with the right cohort + `repliedAt`
- owner reply → also stamps (owner moderates as coach)
- client message → does **not** stamp (stays unanswered)
- producer follows the persisted row's `cohort_id`, not the (spoofable) request param

(The inbox-service spec already asserts the reader honors the `coach_replied_at: null` predicate, so producer-stamps + reader-filters together prove the state transition.)

---

## Fix 2 — P2-002: Assign-by-email case-fold mismatch (FUNCTIONAL EDGE)

**Root cause:** `AssignMemberDto` lowercases the lookup, but `User.email` is a plain unique `String` (not normalized at write; auth compares with `.toLowerCase()` on both sides). An exact-match `findUnique` missed a real user whose email was stored mixed-case → spurious `404 user_not_found`.

**Fix (Option A):** Case-insensitive lookup via Prisma `mode: 'insensitive'`.

### Before — `community-cohort-members.repository.ts`
```ts
async findUserByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
}
```

### After
```ts
async findUserByEmail(email: string) {
  return this.prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, name: true, email: true },
  });
}
```
(`findFirst` because an insensitive predicate is not a unique key.)

**Test:** `test/community/cohorts/community-cohort-members.repository.spec.ts` (2 cases, mocked Prisma):
- asserts the query is issued with `mode: 'insensitive'`
- mixed-case stored email (`John.Doe@example.com`) + lowercase lookup (`john.doe@example.com`) → finds the user

> Deferred (separate ticket): `User.email` normalization-at-write. Not done here per brief scope.

---

## Fix 3 — P2-003: Default-off feature-flag coverage (TEST GAP)

**Fix:** `test/community/community-v1-6-feature-flag.e2e.spec.ts` — boots the three v1-6 controllers (cohort write, members, coach inbox) over real HTTP with the **real** `RolesGuard` + `CommunityFeatureFlagGuard` (JwtAuthGuard stubbed to attach a coach; services mocked; **no DB**, so it runs in the always-on lane — not live-gated). 7 cases:

| Controller | flag unset | flag `'false'` | flag `'true'` |
|---|---|---|---|
| `POST /workspaces/:id/cohorts` | 503, service untouched | 503 | 201, service hit |
| `GET /cohorts/:id/members` | 503, service untouched | — | 200, service hit |
| `GET /me/coach-inbox` | 503, service untouched | — | 200, service hit |

The guard's convention is **503** (typed `{ disabled: true, error: 'community.disabled' }`), not 404 — matched the actual guard. The gate is the master `FEATURE_COMMUNITY_API` switch (see deferred P3-004).

---

## Gate results (re-run at new head)

| Gate | Result |
|---|---|
| `./node_modules/.bin/prisma format` → no diff | ✅ schema untouched by this PR; reverted the pre-existing column-alignment drift `prisma format` introduced so forbidden-file additivity holds (schema diff vs main stays empty) |
| `./node_modules/.bin/tsc --noEmit` | ✅ exit 0 |
| `eslint` (my changed files) | ✅ 0 errors / 0 warnings on all 6 touched files |
| `eslint src/ test/` (whole repo) | ⚠️ 11 errors — **all pre-existing** in unrelated files (`meal-plans`, `v1-coach`, `locked_defaults`, `landing-pages`); identical count with my changes stashed at `880881f7`. The R1 audit ran eslint scoped to the community lane, which passes. I added **zero** new lint errors and did not touch those out-of-scope files. |
| `jest` (v1-6 lane + RLS + new tests, `--runInBand`) | ✅ **7 suites, 84 total — 64 passed + 20 skipped (live-gated RLS)**, 0 failed |

Test-count delta: prior 71 (51 passed + 20 skipped) → now 84 (64 passed + 20 skipped). +13 new passing tests (4 producer + 2 email repo + 7 flag). No `.skip` / `.only` / `.todo` / `fit` / `xit` in the new suites.

> Note on the `(v1-6|community)` jest pattern from the brief: run literally it matches dozens of heavy unrelated suites and OOMs the runner. I scoped to the v1-6 lane directories + the new specs + the RLS spec (the exact set the R1 audit used) and ran `--runInBand`.

---

## Out of scope — deferred to separate tickets (mentioned in PR comment, NOT fixed)

- **P3-004** — no v1-6-specific flag; reuses the `FEATURE_COMMUNITY_API` master switch (documented intent).
- **P3-005** — `unansweredPosts` "answered" sub-query omits the `plan_context_type` discriminator (theoretical UUID-collision only).
- **P3-006** — co-coach/`RolesGuard` role-model inconsistency (platform `User.role` vs membership role).
- `User.email` normalization-at-write (separate ticket).

## Deliverables

1. ✅ PR #377 updated in place — head `880881f7` → `6a041f7c`.
2. ✅ This file.
3. ✅ PR comment posted via `gh api repos/.../issues/377/comments`.
