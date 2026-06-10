# BUILDER BRIEF — v1-6 Mobile: Coach Community Admin Inbox + Moderation

**Cycle:** Community Tier 1 — Priority Lane
**Repo:** `BradleyGleavePortfolio/growth-project-mobile`
**Base:** `origin/main` @ `5adba07` (v1-5 just merged)
**Branch:** `feature/community-v1-6-coach-admin` (already created)
**Worktree:** `/home/user/workspace/tgp/mobile-community-v1-6`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Commit style:** title-only commits
**Model:** Opus 4.8 (R31: Sonnet 4.6 FORBIDDEN as runtime)

---

## 0. Standing operator instruction (verbatim, highest priority)

> "We need to finish the community expansion -> You are 1 in a chain of 100 agents building this - deep work, done right. No rushing to get it all done, just do V1-4 RIGHT, then move to v1-5 in due time"

> "I need v1-4, v1-5, v-16 and V2 PR's done top priority"

This is the v1-6 mobile build. Priority lane. Deep work, done right.

---

## 1. Scope — MOBILE ONLY

The v1-6 spec in `COMMUNITY_EXECUTION_PLAN.md` lists both backend coach endpoints AND mobile coach screens. **Backend coach endpoints already exist in main** (verified: `src/community/community.controller.ts` has `cohorts`, `messages/community-messages.controller.ts` has `cohorts/:cohortId/messages`, `moderation/community-moderation.controller.ts` has reports/queue/items). **This PR is therefore mobile-only — consuming the existing backend surface.**

Anti-rebase rationale: backend `prisma/schema.prisma` is currently touched by PR #376 (MWB-1) and will be touched by Roman Phase 1. Adding ANY backend changes here = guaranteed rebase. v1-6 mobile is fully implementable against the existing backend.

### 1.1 New mobile screens (5)
1. `CoachCommunityHomeScreen.tsx` — landing for coach community surface; counts/quick links to inbox/lab/cohorts/moderation
2. `CoachCommunityInboxScreen.tsx` — aggregated unanswered items across all cohorts owned/co-owned by the coach
3. `CoachCommunityLabScreen.tsx` — coach-curated content area (drafts + scheduled — or read-only placeholder if backend doesn't have lab endpoints yet — INSPECT FIRST)
4. `CoachCommunityCohortsScreen.tsx` — list of cohorts the coach owns; create cohort action; per-cohort drill-down
5. `CoachCommunityCohortDetailScreen.tsx` — single cohort: members, invite, settings, threads, moderation
6. `CoachCommunityModerationScreen.tsx` — moderation queue + take-action UI (hide/dismiss/escalate)

### 1.2 New mobile components (under `src/components/community/coach/`)
- `CohortMemberRow.tsx`
- `CohortInviteCta.tsx`
- `ModerationQueueItem.tsx`
- `ModerationActionSheet.tsx`
- `InboxItemRow.tsx`
- `CoachCommunityHeader.tsx`
- `EmptyInbox.tsx`
- `EmptyCohorts.tsx`
- `EmptyModerationQueue.tsx`

### 1.3 New mobile API client functions (`src/api/communityCoach.ts`)
Call existing backend endpoints. Discover endpoints by reading the spec in:
- `/home/user/workspace/tgp/backend-mwb-1/src/community/community.controller.ts`
- `/home/user/workspace/tgp/backend-mwb-1/src/community/moderation/community-moderation.controller.ts`
- `/home/user/workspace/tgp/backend-mwb-1/src/community/messages/community-messages.controller.ts`
- `/home/user/workspace/tgp/backend-mwb-1/src/community/posts/community-posts.controller.ts`

Functions (minimum):
- `listCohorts()`
- `getCohort(cohortId)`
- `createCohort(payload)`
- `inviteMember(cohortId, payload)`
- `assignClient(cohortId, clientId)`
- `removeMember(cohortId, memberId)`
- `listInboxItems()` — aggregated unanswered
- `listModerationQueue(workspaceId)`
- `reportContent(payload)` — already used by client side; reuse if exists
- `applyModerationAction(itemId, action)` — hide/dismiss/escalate

If an endpoint you need doesn't exist — STOP and report. DO NOT add backend code.

### 1.4 Navigation
- Add a new `CoachCommunityStack` to `src/navigation/` (or extend existing community stack with `coach` sub-stack)
- Top-level entry: gated by `EXPO_PUBLIC_FF_COACH_COMMUNITY` (env-driven feature flag, default false)
- When flag OFF: coach community admin routes hidden, no menu entry, no deep-link landing
- When flag ON: a "Coach Community" entry appears in coach drawer / tab (use existing coach navigation pattern, mirror what v1-5 did for clients)

### 1.5 Roman voice strings
All user-facing strings must run through `romanVoice.ts` (existing module). New strings to add include (representative — write the rest in this register):

- Inbox empty: `"Your inbox is clear. Nothing requires attention."`
- Cohorts empty: `"You have no cohorts yet. Create one when you are ready."`
- Moderation queue empty: `"The queue is empty. Quiet, for now."`
- Loading: `"One moment."`
- Failure: `"That did not complete. I will try again."`
- Cohort created (milestone — exclamation eligible, but ONE per session global cap): default voice = `"Your cohort is created. Members may now be invited."`
- Member invited: `"The invitation has been sent."`
- Moderation action hidden: `"Hidden. The author has not been notified."`
- Moderation action dismissed: `"Dismissed. Closed without action."`
- Destructive confirm prompt: `"This cannot be undone. Continue?"`

Quip allowance: ZERO on moderation surfaces (operational, sensitive). Permitted sparingly on the empty-inbox state (e.g. `"Your inbox is clear. A rare and welcome thing."`). Track `quipsInSession` if you wire it.

### 1.6 RLS / authorization client-side
- All coach endpoints assume the backend enforces RLS by `coachId = app.current_user_id()` AND OWNER bypass. The mobile client MUST NOT pass an arbitrary `coachId` parameter; the backend infers from JWT.
- Foreign-cohort access attempt: client should NOT have UI affordances to enter a cohort the coach does not own (filter at list level)
- "No foreign coach access" is in the v1-6 audit checklist

### 1.7 Feature-flag pattern
- Read `EXPO_PUBLIC_FF_COACH_COMMUNITY` via existing flag-fetch hook (`useFeatureFlag('coach-community')` or equivalent — discover what v1-5 used)
- ALSO check backend `FEATURE_COMMUNITY_COACH_ADMIN` via `/me/feature-flags`
- Both must be ON to surface the screens

---

## 2. Tests

Mirror v1-5's test density. Minimum:
- **Unit tests** for every new component (snapshot + interaction)
- **Screen integration tests** for all 6 screens (render with mock data, empty/loading/error states)
- **Navigation tests** — `CoachCommunityStack` renders only with flag ON
- **API client tests** — every new function in `communityCoach.ts` (mock fetch)
- **Permission tests** — destructive moderation actions confirm before fire
- **Audit-log assertion** — every moderation action call asserts the backend receives the action with required fields

**Test files MUST live alongside source:** `__tests__/` folders.

Lane suite for sanity (match what v1-5 ran):
```bash
npx jest --testPathPattern="community" --runInBand
npx jest --testPathPattern="navigation" --runInBand
```

---

## 3. Gates (must all pass before opening PR)

- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint .` clean
- [ ] All community + navigation lane tests pass
- [ ] Existing test count UP, never down
- [ ] No backend file modified (this is mobile-only)
- [ ] No `package.json` dep added unless absolutely necessary (avoid lockfile churn while #376 is in flight)
- [ ] No existing community/* file deleted (only modified or added)
- [ ] Roman voice contract: zero emoji, zero unjustified exclamations, no "Oops"/"my bad", contractions only inside the rare quip
- [ ] Screens render with both flags OFF (return null / route guard) → no compile or runtime errors

---

## 4. PR body requirements

- Scope IN / OUT
- 6 new screens enumerated
- ~9 new components enumerated
- API client functions enumerated, mapping to existing backend endpoints (cite line numbers)
- Voice contract compliance checklist
- Flag combinations table (4 cells: both ON/OFF combinations)
- Test inventory by suite + total count
- Kill switch documented: backend `FEATURE_COMMUNITY_COACH_ADMIN=false` hides everything
- Audit assertion: "no foreign coach access" — describe how
- Sources: COMMUNITY_EXECUTION_PLAN.md §v1-6, COMMUNITY_PRODUCT_PLAN.md, AI_BUTLER_ROMAN_IDENTITY_SPEC.md

---

## 5. Workflow

1. `cd /home/user/workspace/tgp/mobile-community-v1-6`
2. Confirm `git rev-parse HEAD` = `5adba07…`
3. `npm install --no-audit --no-fund` (verify deps unchanged from v1-5)
4. Inspect backend coach endpoints (worktree at `/home/user/workspace/tgp/backend-mwb-1`) — READ-ONLY — enumerate exact paths + payloads
5. Implement scope §1 in logical commits (title-only)
6. Run all gates §3
7. `git push -u origin feature/community-v1-6-coach-admin`
8. `gh pr create --repo BradleyGleavePortfolio/growth-project-mobile --base main --title "feat(community): v1-6 mobile coach admin inbox + moderation (flag-OFF default)" --body-file PR_BODY.md`
9. Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`
10. Save result to `/home/user/workspace/V1_6_MOBILE_BUILDER_RESULT.md`

**STOP if:**
- Any backend endpoint you need doesn't exist (report — orchestrator decides)
- Any existing test breaks
- Any module import collision
- `prisma/schema.prisma` would need a change (this is a mobile PR — never)

Return: PR #, head SHA, screen count, component count, test pass count, gate status.

---

## 6. Anti-rebase awareness

While you work, these are also in flight on the SAME repo:
- (none — mobile main is currently quiet except your work)

These are in flight on the BACKEND repo (do not touch):
- PR #376 MWB-1 (touches schema.prisma, src/workout-programs, src/ai)
- Roman Phase 1 builder running (will add src/roman/**, schema.prisma additions)
- PR #268 RLS audit returned DIRTY (P1 search_path findings) — fixer coming

You are mobile-only. Your file surface is entirely under `src/screens/community/`, `src/components/community/coach/`, `src/api/communityCoach.ts`, `src/navigation/`, `__tests__/`. Zero overlap.
