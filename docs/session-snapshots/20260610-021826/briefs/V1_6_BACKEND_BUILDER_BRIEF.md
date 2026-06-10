# BUILDER BRIEF — v1-6 Backend: Community Coach Admin Endpoints

**Cycle:** Community Tier 1 — Priority Lane (unblocks v1-6 mobile)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Base:** `origin/main` @ `6c4f618c` (MWB-1 just merged)
**Branch:** `feature/community-v1-6-coach-backend` (already created)
**Worktree:** `/home/user/workspace/tgp/backend-v1-6-coach`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Commit style:** title-only commits
**Model:** Opus 4.8 (R31: Sonnet 4.6 FORBIDDEN as runtime)

---

## 0. Why this PR exists

The v1-6 mobile builder STOPPED because 5 of 10 required endpoints don't exist. The Prisma models DO exist (`CommunityCohort`, `CommunityMembership`) — only the controllers/services/repos are missing. This PR adds those endpoints so v1-6 mobile can ship the full 6-screen scope.

**NO Prisma schema changes.** All required models already exist. This is pure controller/service/repo work.

---

## 1. Scope — endpoints to add

### 1.1 Cohort write operations
**File:** `src/community/cohorts/community-cohort-write.controller.ts` (NEW)
**File:** `src/community/cohorts/community-cohort-write.service.ts` (NEW)
**File:** `src/community/cohorts/community-cohort-write.repository.ts` (NEW)

Routes (all under `@Controller('community')`, gated by existing `CommunityFeatureFlagGuard`):
- `POST /community/workspaces/:workspaceId/cohorts` — create cohort
  - Body: `{ name: string(2-120), description?: string, capacity?: int, starts_at?: ISO8601, ends_at?: ISO8601 }`
  - Auth: caller must be a coach with `OWNER` or `coach` role in the workspace
  - Returns: full `CommunityCohort`
- `PATCH /community/cohorts/:cohortId` — update cohort
  - Body: subset of above fields + `status?`
  - Auth: coach-owner of workspace
- `DELETE /community/cohorts/:cohortId` — archive cohort (soft delete via `archived_at`)
  - Auth: coach-owner of workspace
  - Cascade behavior: existing memberships set to `status='archived'`; no message deletion (messages remain readable)

### 1.2 Cohort membership operations
**File:** `src/community/cohorts/community-cohort-members.controller.ts` (NEW)
**File:** `src/community/cohorts/community-cohort-members.service.ts` (NEW)
**File:** `src/community/cohorts/community-cohort-members.repository.ts` (NEW)

Routes:
- `GET /community/cohorts/:cohortId/members?cursor=&limit=&role=` — paginated member list
  - Auth: coach in this cohort's workspace, OR any active membership of this cohort
  - Coach sees full member rows with role/status/joined_at; client sees only roster of fellow members (filter sensitive fields)
  - Returns: `{ members: CohortMember[], next_cursor: string | null }`
- `POST /community/cohorts/:cohortId/members` — invite/assign
  - Body: `{ user_id?: uuid, email?: string, role: 'student'|'co_coach' }` (exactly one of user_id/email)
  - When email + no user: create pending invite row (or reuse existing `invite-codes` module pattern — INSPECT FIRST)
  - When user_id: direct assign (idempotent — re-assign returns 200 with current row)
  - Auth: coach-owner of workspace
- `DELETE /community/cohorts/:cohortId/members/:userId` — remove member (sets `status='left'`, preserves history)
  - Auth: coach-owner of workspace
  - 403 if attempting to remove a coach role from the OWNER

**Pre-existing `invite-codes` module:** READ-ONLY inspect `src/invite-codes/` first. If it has a generic "invite a user to X" pattern, reuse it. Otherwise create cohort-specific invite logic. Document choice in PR body.

### 1.3 Coach inbox aggregator
**File:** `src/community/inbox/community-coach-inbox.controller.ts` (NEW)
**File:** `src/community/inbox/community-coach-inbox.service.ts` (NEW)
**File:** `src/community/inbox/community-coach-inbox.repository.ts` (NEW)

Route:
- `GET /community/me/coach-inbox?cursor=&limit=` — aggregated unanswered items across ALL cohorts the caller owns/co-owns
  - Items: posts and messages where (a) caller is coach-of-cohort AND (b) item is from a client AND (c) no coach has responded since (using `community-messages` last-response timestamps OR a simple "no reply from coach" predicate)
  - Returns: `{ items: InboxItem[], next_cursor }` where `InboxItem = { id, type: 'message'|'post', cohort_id, cohort_name, author_user_id, author_display_name, preview: string(≤200), created_at, item_url_path }`
  - Sort: oldest-first (FIFO triage queue), tie-break by `created_at` ASC then `id` ASC
  - Auth: caller is a coach (has at least one cohort where role='coach' or 'co_coach')

Discover existing aggregation patterns first. If `messages` or `posts` modules already expose "last activity" or "response state", reuse rather than re-derive.

### 1.4 Lab endpoint (defer or stub)

The brief listed `CoachCommunityLabScreen` as in scope, but Lab semantics (drafts + scheduled posts) are not defined yet anywhere in the codebase. **Defer Lab to a follow-up PR.** Document in PR body that mobile v1-6 will ship `CoachCommunityLabScreen` as a "Coming soon" placeholder.

### 1.5 Module registration
**File:** `src/community/community.module.ts` (MODIFY)

Add the 3 new controller/service/repo trios to `imports`/`controllers`/`providers`. **DO NOT add anything to `src/app.module.ts`** — `CommunityModule` is already registered there; new sub-modules register inside it.

**Anti-rebase: this is the ONLY shared file you touch.** Roman builder does NOT touch `community.module.ts`. Safe.

---

## 2. Auth & RLS — HECTACORN QUALITY

**Operator standing instruction:** "I need RLS to be HECTACORN QUALITY — don't half-ass cybersecurity."

For every new endpoint:
1. Use existing `CommunityAccessService` (already in `src/community/community-access.service.ts`) for workspace/cohort role checks — DO NOT roll new auth
2. JWT auth via existing `JwtAuthGuard` — applied at controller level
3. RLS at the DB layer — verify that every read returns rows already RLS-scoped to `app.current_user_id()`. If a query needs to bypass for OWNER, use the existing service-role pattern documented elsewhere in `src/community/`
4. **NO endpoint accepts `coachId` or `userId` from request body for auth purposes** — always derive from JWT
5. **Foreign-workspace attack:** test that a coach of workspace A cannot create a cohort in workspace B, even by URL manipulation
6. **Foreign-cohort attack:** test that a coach of cohort A cannot remove members from cohort B, even with valid cohort B IDs

### 2.1 New RLS policy migration (if needed)

If existing RLS policies on `CommunityCohort` and `CommunityMembership` don't already cover the new write paths, add a migration:
- File: `prisma/migrations/<timestamp>_v1_6_coach_admin_rls/migration.sql`
- Use `CREATE OR REPLACE` for any function updates; never `DROP FUNCTION`
- Follow the PR #268 spec's pinned-search-path pattern for any helper function added (but DO NOT modify the PR #268 helpers — that PR is in fix-cycle for missing `pg_temp`)

**If existing policies suffice, document that** in the PR body with the policy names + predicates that cover each new write path.

---

## 3. Tests — match MWB-1's density

Mirror PR #376's test approach:
- **Unit tests** for every new service method (`*.service.spec.ts`)
- **Repo tests** for every new repo method against the test DB
- **Controller integration tests** (`*.controller.spec.ts`) — auth required → 401; wrong role → 403; happy path → 2xx; idempotency for assign
- **RLS regression tests** under `test/rls/community-coach-rls.spec.ts` — minimum 20 tests covering:
  - 8 cross-workspace attempts (coach A trying to write/read cohort/member of workspace B) — all must 403
  - 4 cross-cohort attempts (coach of cohort A trying to write to cohort B in same workspace) — must 403
  - 4 member-of-cohort-but-not-coach attempts — must 403 on write, 200 on read with sanitized fields
  - OWNER bypass tests (4)
- **Inbox aggregation tests** — minimum 8 tests covering: empty inbox, unanswered items only (not coach-answered), multi-cohort aggregation, pagination, sort order, FIFO tiebreak

**Minimum test count:** 50+ new tests across the suite. MWB-1 was 61. Match that density.

---

## 4. Gates (must all pass before opening PR)

- [ ] `./node_modules/.bin/prisma generate` clean (no schema changes, but client regenerates fine)
- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint .` clean
- [ ] All new tests pass + existing module-graph/RBAC/community lane tests still pass
- [ ] Lane test: `npx jest --testPathPattern="community|module-graph|rbac|guards" --runInBand` all green
- [ ] No existing test file modified except `community.module.spec.ts` if it exists (module-graph pin)
- [ ] No `prisma/schema.prisma` modification (verify with `git diff origin/main -- prisma/schema.prisma` returns empty)
- [ ] No `package.json` modification
- [ ] No `src/app.module.ts` modification
- [ ] No file in `src/roman/**`, `src/workout-programs/**`, `src/ai/**`, `src/payouts/**`, `src/contracts/**` touched (these are other open-PR surfaces or just-merged surfaces)

---

## 5. PR body requirements

- Scope IN / OUT (explicit defer of Lab + reason)
- Endpoint inventory: method + path + auth predicate + Prisma model touched
- Auth/RLS table: every endpoint × predicate × tested coverage
- Reused vs new auth machinery (`CommunityAccessService` reuse)
- Test inventory by suite with pass count
- "No schema change" assertion + diff command output
- 4+ sources: NestJS controller patterns, Postgres RLS, Supabase docs, existing community module
- Cross-references: COMMUNITY_EXECUTION_PLAN.md §v1-6, this brief, mobile v1-6 builder report (`/home/user/workspace/V1_6_MOBILE_BUILDER_RESULT.md`)

---

## 6. Workflow

1. `cd /home/user/workspace/tgp/backend-v1-6-coach`
2. Confirm `git rev-parse HEAD` = `6c4f618c…`
3. `npm install --no-audit --no-fund` (verify deps unchanged from main)
4. Inspect existing community module structure exhaustively before writing
5. Implement §1.1, §1.2, §1.3 in logical commits (title-only)
6. Run all gates §4
7. `git push -u origin feature/community-v1-6-coach-backend`
8. `gh pr create --repo BradleyGleavePortfolio/growth-project-backend --base main --title "feat(community): v1-6 coach admin endpoints — cohort write, members, coach inbox" --body-file PR_BODY.md`
9. Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json` with `file_surface_overlap_check: PASS (community/coach + community/inbox new dirs; community.module.ts only shared file; Roman/Mwb-1 surfaces untouched)`
10. Save result to `/home/user/workspace/V1_6_BACKEND_BUILDER_RESULT.md`

**STOP if:**
- Any required Prisma model is missing (you'd need schema changes — escalate)
- Any existing test breaks
- Any non-listed shared file would need modification

Return: PR #, head SHA, endpoint count, test count by suite, gate status.

---

## 7. Anti-rebase awareness

**In flight on backend repo right now:**
- Roman Phase 1 builder — will add `src/roman/**` + new Prisma models. **DOES NOT TOUCH** community/cohorts/inbox/community.module.ts. Safe.
- PR #268 RLS fixer (pending dispatch) — will modify the helper function migration. **DOES NOT TOUCH** community module. Safe.

**Your work touches:**
- `src/community/cohorts/**` (NEW dir)
- `src/community/inbox/**` (NEW dir)
- `src/community/community.module.ts` (MODIFY — register 3 new sub-modules)
- `test/rls/community-coach-rls.spec.ts` (NEW)
- Possibly `prisma/migrations/<timestamp>_v1_6_coach_admin_rls/migration.sql` (NEW — only if existing policies insufficient)

**File-surface overlap check before fan-out:** `community.module.ts` is currently NOT touched by any other open PR. PASS.
