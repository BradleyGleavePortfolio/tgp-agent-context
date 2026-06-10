# R1 AUDIT REPORT — PR #377 (v1-6 Coach Admin: cohort write, members, coach inbox)

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #377 — `feat(community): v1-6 coach admin endpoints`
**Audited SHA:** `880881f729f54d905bdd02facf02049a1ab351fb`
**Branch:** `feature/community-v1-6-coach-admin` (head commit `880881f7`)
**Auditor:** GPT-5.5 R1 (model: claude-opus)
**Mode:** READ-ONLY (no code changes, no push, no merge)

---

## VERDICT: **DIRTY-MINOR**

Two bounded functional-accuracy issues (P2) and one lane test-coverage gap (P2), plus three P3 notes. **No P0, no P1.** All gates pass; the 71-test claim is verified exactly; schema/forbidden-file additivity holds; auth is JWT-derived throughout with no body-supplied identity; RLS defence-in-depth coverage is asserted both statically and via 20 live-gated cross-tenant tests. The P2s are real but operationally low-impact (inbox staleness and an email-casing edge); none block a coach from administering cohorts or leak cross-tenant data.

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 3 |
| P3 | 3 |

---

## Gate verification (re-run at audited SHA)

Run against the builder's worktree (`tgp/backend-v1-6-coach`, byte-identical at `880881f7`; the audit worktree had no `node_modules` and `npm ci` is forbidden per brief §"disk-cautious").

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src/community/cohorts/** src/community/inbox/**` | ✅ exit 0 |
| `npx jest test/community/cohorts test/community/inbox test/rls/community-coach-rls.spec.ts` | ✅ **4 suites, 71 total — 51 passed + 20 skipped (live-gated)**, 0 failed |

**Builder test-count claims — VERIFIED EXACTLY:**
- Cohort write: **14** (`it` count = 14) ✅
- Cohort members: **17** ✅
- Coach inbox: **10** ✅
- RLS: **30** = 10 static (always-run) + 20 live-gated (`describe.skip` when `COMMUNITY_TEST_DATABASE_URL` unset) ✅
- **Total 71** (41 unit + 30 RLS) ✅. No `it.skip` / `.todo` / `fit` / `xit` anywhere in the new suites.

Live RLS suite skips cleanly with a `console.warn` when no test DB is configured — static coverage still runs. ✅

---

## Schema / forbidden-file additivity (brief §2.5)

All EMPTY vs `main` (`6c4f618c`):
- `git diff -- prisma/schema.prisma` → empty ✅
- `git diff -- package.json package-lock.json` → empty ✅
- `git diff -- src/app.module.ts` → empty ✅
- `git diff -- src/roman/ src/workout-programs/ src/ai/ src/payouts/ src/contracts/` → empty ✅
- No new migration directory; PR #268 helpers untouched ✅

Diff is **17 files, +2726 / -0** — purely additive (new `src/community/cohorts/**`, `src/community/inbox/**`, tests, and 19 lines into `community.module.ts`).

---

## Endpoint correctness (brief §2.1) — PASS

All 7 endpoints present, correctly decorated, registered in `community.module.ts` (3 controller/service/repo trios, no duplicate providers, no circular dep):

1. `POST /community/workspaces/:workspaceId/cohorts` ✅
2. `PATCH /community/cohorts/:cohortId` ✅
3. `DELETE /community/cohorts/:cohortId` (soft archive: `status='archived'` + `archived_at`, cascades memberships to `removed` in a single `$transaction`; idempotent on re-archive) ✅
4. `GET /community/cohorts/:cohortId/members` (keyset paginated, dual-mode view) ✅
5. `POST /community/cohorts/:cohortId/members` (idempotent upsert keyed on `(cohort_id,user_id)`; XOR user_id/email) ✅
6. `DELETE /community/cohorts/:cohortId/members/:userId` (soft: `status='removed'` + `removed_at`; idempotent) ✅
7. `GET /community/me/coach-inbox` (FIFO aggregated, keyset paginated) ✅

- DTO validation on every POST/PATCH body via class-validator (`CreateCohortDto`, `UpdateCohortDto`, `AssignMemberDto`); param/query schemas validated via zod. ✅
- Pagination on member list AND inbox: keyset cursor `base64url("<iso>|<id>")`, `limit` clamped to `[1,100]` default 50, garbage cursor → null (ignored). ✅
- Member remove and cohort archive are soft (no row drop). ✅

## Auth & RLS — HECTACORN (brief §2.2) — PASS

- `JwtAuthGuard → RolesGuard → CommunityFeatureFlagGuard` on every route. ✅
- Authorization reuses `CommunityAccessService` (`isWorkspaceCoach`, `findCohort`, `findWorkspace`, `membershipInCohort`) — **no rolled-own auth primitives.** ✅
- **No endpoint trusts a body/URL identity for auth.** Workspace ownership is resolved from the persisted cohort row's `workspace_id` (never the URL/body) before every write — cross-workspace AND cross-cohort attacks both 403. The `:userId` path param in member-remove is the *target*, not the actor; the actor is `req.user` from the JWT. ✅
- Owner bypass (`user.role === 'owner'`) tested in unit suites and live RLS (4 positive paths). ✅
- Roster read is dual-mode: coach → full rows (status/email/joined_at); non-coach active member → sanitized (those fields nulled); non-member → 404 (non-leak). ✅
- Removing the owning `coach` membership row → 403 `cannot_remove_owner_coach`. ✅

**Note on brief's `SubCoachScopeService.canAccessClient`:** that primitive belongs to the MWB-1 workout lane (PR #376). The community lane's canonical tenancy primitive is `CommunityAccessService.isWorkspaceCoach` (workspace `coach_id` ownership), used consistently here. There is **no** direct `User.coach_id` equality check in this PR — the "coach" relationship is workspace ownership, not the user→coach FK. No finding.

RLS static assertions verify the v1-1 policies that back every path (`community_cohorts_coach_all` FOR ALL with USING+WITH CHECK, `community_memberships_coach_all`, `community_memberships_self_or_shared_cohort_select`, `community_cohorts_member_select`, message/post SELECT policies), ENABLE+FORCE RLS, removed-membership exclusion in helpers, and a guardrail asserting no v1-6 migration replaces a PR #268 helper. Live suite: 8 cross-workspace + 4 cross-cohort + 4 member-not-coach + 4 OWNER-positive = 20. ✅

---

## FINDINGS

### R1-P2-001 — Inbox message "unanswered" predicate keys on a field nothing ever writes
**File:** `src/community/inbox/community-coach-inbox.repository.ts:77` (`coach_replied_at: null`)
**Severity rationale (P2, functional but bounded):** The message arm of the aggregator defines "unanswered" as `coach_replied_at IS NULL`. A repo-wide grep confirms **`coach_replied_at` is never assigned by any code path** (only read here; only other references are doc comments). Therefore a coach replying to a cohort message never clears the flag, and every non-deleted, non-comment client message remains "unanswered" in the inbox **forever**. The post arm is correct (it detects coach-authored comments, a signal that *is* produced via `COMMENT_CONTEXT_TYPE`), so the queue is not entirely broken — but the message half is a stale-by-design triage list rather than a true unanswered queue. Not a security issue and not cross-tenant; impact is product accuracy / coach UX. Recommend either (a) wiring a producer that sets `coach_replied_at` when a coach posts the next message in a cohort thread, or (b) redefining the message predicate to "no coach message in this cohort after this message's `created_at`," and documenting the chosen semantic. The PR body's "unanswered" definition (§Behavior notes) should match whatever is implemented.

### R1-P2-002 — Assign-by-email lowercases the lookup but `User.email` is not normalized
**Files:** `src/community/cohorts/community-cohort-members.dto.ts:12-13,29-30` (`trimLower` transform); `src/community/cohorts/community-cohort-members.repository.ts:81-88` (`findUserByEmail` → `findUnique({where:{email}})`); `prisma/schema.prisma:157` (`email String @unique`, plain text, not citext).
**Severity rationale (P2, functional edge):** `AssignMemberDto.email` is force-lowercased before the exact-match `findUnique`. But `User.email` is a plain unique `String` with no DB-level case-folding, and `src/auth/auth.service.ts:1226,1278` compare emails with `.toLowerCase()` on *both* sides — evidence that stored emails are **not** guaranteed lowercase. So assigning a member by an email that was stored mixed-case (e.g. `Jane@Example.com`) will miss and return `404 user_not_found` for a real user. Bounded: the `user_id` path is unaffected and a coach can fall back to it; no data corruption, no security impact. Recommend a case-insensitive lookup (citext, `mode:'insensitive'`, or normalizing stored emails) consistent with the auth-layer comparison.

### R1-P2-003 — No default-off / feature-flag (503) test in the v1-6 lane suites
**Files:** `test/community/cohorts/**`, `test/community/inbox/**` (service-only unit tests).
**Severity rationale (P2, test-coverage gap; brief §2.2 explicitly requires default-off behavior tested):** The 7 routes declare `CommunityFeatureFlagGuard` (returns 503 when the master flag is off), but no v1-6 test exercises the disabled path or the guard composition on these specific controllers. The guard itself is unchanged from earlier community PRs and its 503-when-off behavior is covered by existing `test/community/*.e2e.spec.ts`, so the *behavior* is not unverified globally — but this lane added no assertion that its own routes are gated and default-off. Low risk (guard is reused, not reimplemented). Recommend one controller/e2e test asserting 503 when `FEATURE_COMMUNITY_API` is unset.

### R1-P3-004 — No v1-6-specific feature flag; reuses the master community switch
**File:** `src/community/community-feature-flag.guard.ts:24-29` (`FEATURE_COMMUNITY_API` / `FEATURE_COMMUNITY_API_ALLOWLIST`).
**Severity rationale (P3, design choice, documented):** The brief named `FEATURE_COMMUNITY_V1_6_COACH_ADMIN` as the expected gate. The PR instead reuses the single master community kill-switch (default-off: requires `=== 'true'`). This is defensible — the entire community surface ships behind one flag — and is documented in the PR body ("master switch; cohort admin intentionally NOT behind the per-feature write kill-switches"). Flagging only as a deviation from the brief's literal expectation, not a defect. If per-lane rollout control is desired, add a v1-6 sub-flag.

### R1-P3-005 — `unansweredPosts` "answered" sub-query omits the `plan_context_type` discriminator
**File:** `src/community/inbox/community-coach-inbox.repository.ts:133-140`.
**Severity rationale (P3, theoretical robustness):** The query that marks a post "answered" matches coach/owner-authored messages by `plan_context_id IN (candidate post ids)` + sender role, but does **not** also require `plan_context_type = COMMENT_CONTEXT_TYPE`. Since `plan_context_id` is reused by other features (v2-1 plan tags per the schema index), a non-comment coach message whose `plan_context_id` coincidentally equals a candidate post UUID would falsely mark the post answered. UUID collision across feature domains is effectively impossible, so this is theoretical only. Recommend adding `plan_context_type: COMMENT_CONTEXT_TYPE` to the predicate for symmetry with `listComments` (which does include it).

### R1-P3-006 — Platform-student co-coaches are blocked from the coach inbox by RolesGuard
**Files:** `src/community/inbox/community-coach-inbox.controller.ts:27` (`@Roles('coach','owner')`); `src/community/inbox/community-coach-inbox.repository.ts:40-47` (`coachedCohortIds` includes active `assistant`/`co_coach` memberships).
**Severity rationale (P3, product/auth consistency note):** `coachedCohortIds` deliberately includes cohorts where the caller holds an active `assistant` (co-coach) membership, so the aggregator is designed to serve co-coaches. But the controller's `@Roles('coach','owner')` matches the **platform** `User.role`, and assigning a member as `co_coach` only sets the *membership* role (`assistant`) — it does not elevate `User.role`. A user whose platform role is `student` but who is a cohort co-coach will get 403 at RolesGuard and never reach the inbox. Likely a non-issue if co-coaches are always platform-`coach`s, but the two role models are inconsistent for this endpoint. Worth confirming the intended co-coach persona.

---

## Spot-checks (brief §3)

1. **Tier/entitlement guard on cohort-create (parity with PR #376):** No entitlement guard on cohort writes. The brief says flag P2 only if intent is unclear — operator intent is unstated for community cohort creation, and the PR body documents cohort admin as gated solely by the master community flag. Treated as out-of-scope, **not** flagged (no evidence cohort-create is paywalled). 
2. **Inbox does not count the coach's own messages as unanswered:** ✅ message arm filters `sender.role NOT IN (coach, owner)`; post arm requires a client author and treats any coach/owner comment as the answer. The coach's own content is correctly excluded (modulo P2-001's staleness).
3. **OWNER protection in member-remove:** ✅ `membership.role === 'coach'` → 403 before any write; the owning coach's row cannot be stripped. (Note: protection is by membership *role*, which is the correct invariant here.)
4. **Lab deferred:** ✅ documented in PR body §Scope/OUT with rationale (undefined semantics; mobile ships "Coming soon").

## Invite-codes reuse decision (brief §2.7) — PASS
PR body documents the deliberate **non-reuse** of `invite-codes` (coach-roster onboarding vs. placing an existing user into a cohort) and the email-for-nonexistent-user → 404 contract. Justified and clear.

---

## Conclusion

Merge-ready after addressing the inbox message-staleness (P2-001) and email-casing (P2-002) issues, ideally with the default-off lane test (P2-003). Security posture is sound: JWT-derived auth, no body-trusted identity, consistent `CommunityAccessService` tenancy, and HECTACORN RLS coverage (static + 20 live cross-tenant). **DIRTY-MINOR.**
