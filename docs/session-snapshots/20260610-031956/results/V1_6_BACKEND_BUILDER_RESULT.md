# v1-6 Backend Coach Admin Builder — RESULT: **PR OPENED** ✅

**Status:** COMPLETE — PR opened, all gates pass.
**Builder:** Opus 4.8 (R31 compliant)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Worktree:** `/home/user/workspace/tgp/backend-v1-6-coach`
**Branch:** `feature/community-v1-6-coach-backend`
**Base main:** `6c4f618c`
**HEAD SHA:** `880881f729f54d905bdd02facf02049a1ab351fb`
**PR:** [#377](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/377) — OPEN, base `main`

---

## Endpoints delivered: **7** (Lab deferred)

| # | Method | Path | Auth predicate |
|---|--------|------|----------------|
| 1 | POST   | `/community/workspaces/:workspaceId/cohorts` | `coach,owner` + owns-workspace |
| 2 | PATCH  | `/community/cohorts/:cohortId` | `coach,owner` + owns-cohort-workspace |
| 3 | DELETE | `/community/cohorts/:cohortId` (soft archive) | `coach,owner` + owns-cohort-workspace |
| 4 | GET    | `/community/cohorts/:cohortId/members` | `student,coach,owner` (dual-mode: coach full / member sanitized) |
| 5 | POST   | `/community/cohorts/:cohortId/members` | `coach,owner` + owns-cohort-workspace |
| 6 | DELETE | `/community/cohorts/:cohortId/members/:userId` | `coach,owner` + owns-cohort-workspace |
| 7 | GET    | `/community/me/coach-inbox` | `coach,owner` (caller's owned workspaces) |

Guard order on every route: `JwtAuthGuard → RolesGuard → CommunityFeatureFlagGuard`. Cohort admin intentionally NOT behind message/post/DM write kill-switches.

**Lab deferred** — coach-admin Lab semantics undefined in COMMUNITY_EXECUTION_PLAN; mobile ships a "Coming soon" placeholder, so no client dependency. Re-scope when Lab semantics specified.

---

## Tests: **71 new** (all passing / live-gated cleanly skip)

| Suite | File | Tests |
|---|---|---|
| Cohort write (service) | `test/community/cohorts/community-cohort-write.service.spec.ts` | 14 ✅ |
| Cohort members (service) | `test/community/cohorts/community-cohort-members.service.spec.ts` | 17 ✅ |
| Coach inbox (service) | `test/community/inbox/community-coach-inbox.service.spec.ts` | 10 ✅ |
| RLS static + live | `test/rls/community-coach-rls.spec.ts` | 30 (10 static ✅ + 20 live-gated) |

RLS live tests (20) cover 8 cross-workspace + 4 cross-cohort + 4 member-not-coach denials + 4 OWNER/coach positive paths; run when `COMMUNITY_TEST_DATABASE_URL` is set, skip cleanly otherwise.

**Lane run** (`community|module-graph|rbac|guards`): **190 passed, 90 skipped, 0 failed** — no existing test regressed.

---

## Gates §4 — ALL PASS

| Gate | Result |
|---|---|
| `./node_modules/.bin/prisma generate` | ✅ PASS |
| `npx tsc --noEmit` | ✅ PASS (exit 0) |
| `npx eslint` (new dirs) | ✅ PASS (exit 0) |
| Lane tests | ✅ PASS (190/0) |

---

## Constraint compliance

- **No Prisma schema change** — `git diff origin/main -- prisma/schema.prisma` → empty. ✅
- **`package.json` untouched** — diff empty. ✅
- **`src/app.module.ts` untouched** — diff empty; sub-modules registered inside existing `CommunityModule` (`src/community/community.module.ts`). ✅
- **No forbidden dirs touched** — `src/roman/**`, `src/workout-programs/**`, `src/ai/**`, `src/payouts/**`, `src/contracts/**` all clean. ✅
- **No new RLS migration** — existing v1-1 policies cover all paths; PR #268 helpers left untouched. ✅
- **Reused `CommunityAccessService`** — no new auth primitives. ✅
- **Title-only commits**, author `Dynasia G <dynasia@trygrowthproject.com>`. ✅
- **Pushed after every state change** (R64). ✅

**file_surface_overlap_check:** PASS (community/cohorts + community/inbox new dirs; community.module.ts only shared file; Roman/MWB-1 surfaces untouched)

---

## Unblocks

This PR provides the 5 backend functions the v1-6 **mobile** builder reported missing (see `V1_6_MOBILE_BUILDER_RESULT.md`): createCohort, inviteMember/assignClient, removeMember, and listInboxItems (aggregated unanswered inbox). Orchestrator can now resume the mobile lane.

---

## Commits on branch

- `fcd84e6c` feat(community): v1-6 coach cohort write, member admin, and coach inbox endpoints (source)
- `880881f7` test(community): v1-6 coach admin unit + RLS coverage (cohort write, members, inbox)
