# R1 AUDIT BRIEF — PR #377 v1-6 Backend Coach Admin

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #377 — "feat(community): v1-6 coach admin endpoints — cohort write, members, coach inbox"
**Head SHA:** `880881f729f54d905bdd02facf02049a1ab351fb`
**Worktree:** `/home/user/workspace/tgp/backend-v1-6-audit` (detached @ 880881f7)
**Builder report:** `/home/user/workspace/V1_6_BACKEND_BUILDER_RESULT.md`
**PR body:** `/home/user/workspace/tgp/backend-v1-6-coach/PR_BODY.md`
**Auditor model:** GPT-5.5
**Verdict rubric:** CLEAN / DIRTY-MINOR / DIRTY

---

## 0. Operator priority

Standing rule: **"I need RLS to be HECTACORN QUALITY — don't half-ass cybersecurity."**

This PR is in the priority community lane (operator: "I need v1-4, v1-5, v-16 and V2 PR's done top priority"). Audit strictly but don't invent issues.

---

## 1. Endpoints under audit (7)

1. `POST /community/workspaces/:workspaceId/cohorts` — create
2. `PATCH /community/cohorts/:cohortId` — update
3. `DELETE /community/cohorts/:cohortId` — archive
4. `GET /community/cohorts/:cohortId/members` — list (paginated)
5. `POST /community/cohorts/:cohortId/members` — invite/assign (idempotent)
6. `DELETE /community/cohorts/:cohortId/members/:userId` — remove
7. `GET /community/me/coach-inbox` — aggregated unanswered

Lab is DEFERRED — verify this is documented in PR body.

---

## 2. Audit checklist — STRICT

### 2.1 Endpoint correctness
- [ ] All 7 endpoints exist, decorated correctly, registered in `community.module.ts`
- [ ] Each endpoint has the right HTTP verb + path matching brief
- [ ] DTO validation on every POST/PATCH body (class-validator decorators)
- [ ] Pagination on member list AND coach inbox (cursor-based, `limit` clamp)
- [ ] Idempotency on `POST .../members` — re-assign returns 200 with current row, no duplicate row
- [ ] Soft-delete on cohort archive (`archived_at` set, no row drop)
- [ ] Member remove sets `status='left'`, doesn't drop the membership row

### 2.2 Auth & RLS — HECTACORN
- [ ] JWT auth via existing `JwtAuthGuard` on every endpoint (no anonymous access)
- [ ] Role check via `CommunityAccessService` reused (no rolled-own auth)
- [ ] **NO endpoint accepts `coachId`/`userId` from request body for auth** — always derived from JWT
- [ ] Foreign-workspace attack: coach of W-A creating cohort in W-B → 403
- [ ] Foreign-cohort attack: coach of C-A modifying C-B → 403
- [ ] Member-of-cohort-but-not-coach: write → 403, read → 200 with sanitized fields
- [ ] OWNER bypass works (4 tests minimum)
- [ ] Cohort detail member list excludes sensitive fields when caller is non-coach member
- [ ] Removing OWNER role from a workspace OWNER → 403

### 2.3 Test density & quality (target: 50+, builder reported 71)
- [ ] Unit tests: 14 cohort-write + 17 cohort-members + 10 coach-inbox — verify exact counts
- [ ] RLS regression: 30 tests (10 static active + 20 live-gated) — verify category coverage:
  - 8 cross-workspace denial
  - 4 cross-cohort denial
  - 4 member-not-coach denial
  - 4 OWNER/coach positive
- [ ] Inbox aggregation tests: FIFO sort, multi-cohort aggregation, pagination, empty state, coach-already-responded filter
- [ ] No test that only asserts "function exists" — every test must exercise behavior
- [ ] No `it.skip` or `.todo` left in
- [ ] Live RLS tests gate cleanly when no `TEST_DATABASE_URL` (don't fail the suite)

### 2.4 Coach inbox aggregator semantics
- [ ] "Unanswered" predicate clearly defined and consistent (no coach response since last client activity, or similar precise rule)
- [ ] Multi-cohort aggregation across all cohorts where caller has `role='coach'` or `'co_coach'`
- [ ] Includes posts AND messages (per brief §1.3)
- [ ] Sort: oldest-first (FIFO), tiebreak `created_at ASC, id ASC`
- [ ] `preview` field truncated to 200 chars
- [ ] Pagination cursor stable (next_cursor decodes deterministically)

### 2.5 No schema/forbidden-file mods
- [ ] `git diff origin/main -- prisma/schema.prisma` is EMPTY
- [ ] `git diff origin/main -- package.json package-lock.json` is EMPTY
- [ ] `git diff origin/main -- src/app.module.ts` is EMPTY
- [ ] `git diff origin/main -- src/roman/ src/workout-programs/ src/ai/ src/payouts/ src/contracts/` is EMPTY
- [ ] If `prisma/migrations/<ts>_v1_6_coach_admin_rls/` exists: verify it uses `CREATE OR REPLACE` (no DROP), pinned search_path with `pg_temp` LAST (HECTACORN per PR #268 R1 finding)

### 2.6 Module graph
- [ ] `community.module.ts` adds the 3 new controller/service/repo trios
- [ ] No duplicate provider registrations
- [ ] No circular dep introduced
- [ ] `community.module.spec.ts` (if exists) still pins module graph

### 2.7 Invite-codes reuse decision
- [ ] PR body documents whether `invite-codes` module was reused or new cohort-specific logic added
- [ ] If new logic: justified
- [ ] If reuse: import path correct, no duplication

---

## 3. Spot-checks

1. Read `community-cohort-write.controller.ts` — confirm tier guard exists if cohort-create is paywall-gated (PR #376 added entitlement guard on workout writes — does community-cohort-create need parity? Check the brief / operator's intent — if unclear, flag P2 not P1)
2. Read `community-coach-inbox.service.ts` — confirm the "unanswered" predicate doesn't accidentally include the coach's own messages as "unanswered"
3. Read `community-cohort-members.service.ts` — confirm the OWNER protection (can't remove last coach / can't remove the OWNER themselves)
4. Diff against the brief §1 endpoint specs — any deviation is a finding

---

## 4. Verdict + report

Write `AUDIT_R1_PR_377_REPORT.md` at worktree root.

- CLEAN — all checks pass, merge-ready
- DIRTY-MINOR — cosmetic/doc only
- DIRTY — any functional / security gap

P0 = security defect actively exploitable. DIRTY.
P1 = security gap not yet exploitable but real, OR missing required test class. DIRTY.
P2 = cosmetic/doc only. DIRTY-MINOR.

Commit on `audit/r1-pr-377`, push, then post comment via `gh pr comment 377 --repo BradleyGleavePortfolio/growth-project-backend --body-file AUDIT_R1_PR_377_REPORT.md` (`api_credentials=["github"]`). Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`.

**DO NOT run `npm ci`** — disk-cautious. Use `npx tsc --noEmit` and targeted jest only. Read code directly for most findings.

Return: verdict, finding count by severity, report path.
