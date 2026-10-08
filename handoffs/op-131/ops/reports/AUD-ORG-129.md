# AUD-ORG-129: head coach and sub-coach (roles, invites, assignment, guards, sharing, credits, removal)

Auditor: AUD-ORG-129 (Claude Opus 5.5), operator agent 129. Method: FW-AUD-128 (JOBS128.md:298-303).
Code traced at backend c3324d4a and mobile a1be6fb2. Current mains are backend fd190078 (b#857, email only) and mobile e634d19e (m#506, m#518, m#519, m#520). None of those commits touches a team or sub-coach file, so every line reference below still holds on the current mains.
No code changed, no PRs, no comments, no sign-in, no production writes. The throwaway test lives only in my local worktree `wt/AUD-ORG-129-mobile`, branch agent129/aud-org-129, which was never committed or pushed.

## Bottom line
- **B = 0.** Every team flow is unreachable for a normal user on day 1. The owner hid teams for launch (10-06 14:21, m#420), and production holds no team state at all. A read-only SELECT (counts only) found 0 team seats, 0 client delegations, 0 sub-coach invites, 0 coaches with a parent coach, 0 priced coach subscriptions and 0 team audit events. A coach becomes a "head coach with a team" only through an invite that nobody can accept in the app, or through Team Mode, which needs a Pro price that nobody can buy. No attacker-only path reaches another coach's clients: every path I found needs either the victim's own accept call or a paid Pro tier.
- **U = 2.** Both are on Settings > Team / Gym profile, which every coach can reach.
- The team feature is broken end to end and would fail on the day it is unhidden. Five of these issues are serious enough to fix before unhiding (P1-P5 below). They are graded **C (hidden for day 1 by owner decision; must be fixed before teams are unhidden)**.
- **Needs operator/owner: 1.** What happens to a sub-coach's own clients when they join a team and when they are removed (see "Owner decision").

## (1) B list
None proven.

## (2) U list (normal coach, normal day)
| # | Kind | Finding | Where | Smallest fix |
|---|---|---|---|---|
| U1 | CODE-ONLY | On Settings > Team / Gym profile, the "Invite codes" row does not open anything. It only shows an alert telling the coach to "Open the Clients tab → Invite codes". The Clients stack already registers `InviteCodes` (CoachNavigator.tsx:379), and Settings already navigates across tabs the same way (`navigate('ClientsStack', { screen: ... })`). | mobile src/screens/coach/CoachTeamProfileScreen.tsx:206-223 | `navigation.navigate('ClientsStack', { screen: 'InviteCodes' })` |
| U2 | CODE-ONLY | The copy promises a team that does not exist for launch. The Settings row says "Team / Gym profile" (settings/BillingSection.tsx:32), and the screen header says "Team" (:87, :99), "Set up your team" (:102) and "Team profile" (:169). The owner hid teams for day 1, and the only things on the screen are a business name, the client invite link, a client count and the Money link. | CoachTeamProfileScreen.tsx:87-102, :169; BillingSection.tsx:32 | Rename to "Business profile" / "Set up your business profile" while teams are hidden. |

## (3) Dead-button table
| Screen | Control | What happens | Reach on day 1 | Fix job |
|---|---|---|---|---|
| Settings > Team / Gym profile | "Invite codes" row | Alert only, no navigation (CoachTeamProfileScreen.tsx:206-223) | Every coach | ORG-PROFILE-129 |
| Team tab > TeamManagementScreen | Whole screen | Always shows the paid "Scale plan required" gate (REPRODUCED, R3-A) | Hidden (Team tab needs an active seat) | ORG-TEAM-UI-129 |
| Team tab (if the tier ever resolved to scale) | Whole screen | Crashes with `TypeError: subCoaches.map is not a function` (REPRODUCED, R3-C) | Hidden | ORG-TEAM-UI-129 |
| SubCoachDetail > Reassign > Confirm | Confirm | Always 400: wrong body for the handler that actually serves the route (CODE-ONLY P2) | Hidden | ORG-TEAM-UI-129 + ORG-ROUTES-129 |
| SubCoachInviteModal > Share link | Link `.../sub-coach/<token>` | No app route and no web page handles it, and no accept screen exists (A7.5 already lists this) | Hidden | A7.5 accept-screen PR |

## REPRODUCED (read-only SELECT, unauthenticated GET, throwaway jest render test)
| # | What | How | Result | Grade |
|---|---|---|---|---|
| R1 | Production has no team state | Supabase read-only `SELECT count(*)` on TeamSubCoachAssignment, SubCoachAssignment, SubCoachInvite, TeamAuditEvent, FeePolicy (head_coach_split_bps), CoachSubscription (stripe_price_id), and User (role=coach AND coach_id NOT NULL). No row content read. | 0 seats, 0 delegations, 0 invites, 0 team events, 0 split overrides, 0 priced coach subscriptions, 0 coaches with a parent coach. 1 TeamProfile row exists. | Context: nothing in production is in a broken team state today |
| R2 | The team endpoints are live in production | `GET /api/sub-coaches/invites/by-token/<random 32 chars>` and `GET /api/sub-coaches` (no auth) | 404 `Invite not found.` (the public invite preview is live) and 401 | Context |
| R3-A | Team tab can never show the roster: the screen reads `plan_tier` from /auth/me, but /auth/me returns only `profile` and `subscription_tier` (backend auth.service.ts getMe ~:1438-1478). The tier always falls back to `flat_300`, so the screen always shows "Scale plan required ... Upgrade to add sub-coaches". That contradicts the owner's free-teams ruling (10-06 14:25). | Throwaway render test `zzAudOrg129Team.throwaway.test.tsx` test A, real TeamManagementScreen on mobile e634d19e | PASS: `team-gate-upgrade` with "Scale plan required" is shown and the roster is never rendered (TeamManagementScreen.tsx:40-63, :151-158, :221-238) | C (hidden), pre-unhide P4 |
| R3-B | Same on iOS (purchases hidden) | Test B | PASS: neutral gate; roster never rendered | C (hidden) |
| R3-C | With tier forced to `scale`, the real list response crashes the screen. Main serves `GET /sub-coaches` from the legacy controller, which returns `{items,nextCursor,hasMore}` (CODE-ONLY P1); the screen stores that object (:199) and calls `.map` on it (:290). | Test C. The test fails, and the failure is the reproduction. | `TypeError: subCoaches.map is not a function at TeamManagementScreen.tsx:290:36`. Output: ops/reports/AUD-ORG-129-jest-output.txt | C (hidden), pre-unhide P4 |

## CODE-ONLY (traced, file:line, handler, API path)
Pre-unhide blockers (P1-P5): graded C now because teams are hidden; each one fails the core team flow the day teams are unhidden.

| # | Finding | file:line / handler / API path | Grade |
|---|---|---|---|
| P1 | **Two controllers on `/sub-coaches`; the legacy one wins.** Legacy `SubCoachController` (src/sub-coach/sub-coach.controller.ts:45) lives in `SubCoachModule`, which `CoachModule` imports (src/coach/coach.module.ts:71) well before `SubCoachesModule` (app.module.ts:375). Nest registers routes in module insertion order (@nestjs/core 11.1.27 router/routes-resolver.js:28-34). So `GET /sub-coaches`, `GET /sub-coaches/:id`, `GET /sub-coaches/:id/analytics` and `POST /sub-coaches/:id/reassign-client` all hit the legacy handlers, while the mobile client was written for `SubCoachesController` (src/sub-coaches/sub-coaches.controller.ts:43). The legacy list uses the bare rule `coach_id = head, role = coach` (sub-coach.controller.ts:72-73) and returns an envelope (:104-108). | as stated | C, pre-unhide |
| P2 | **Reassign always returns 400.** Mobile posts `{clientId, reason}` (src/api/subCoachApi.ts:112-119), but the legacy DTO requires `targetSubCoachId` and `idempotency_key` (src/sub-coach/dto/sub-coach.dto.ts:35-52), and the global ValidationPipe uses whitelist + forbidNonWhitelisted (src/main.ts:98-102). | POST /sub-coaches/:id/reassign-client | C, pre-unhide |
| P3 | **An accepted sub-coach never becomes a sub-coach for reads, and can never be given a client.** Invite accept (src/sub-coaches/sub-coach-invite.service.ts accept ~:225-470) writes the invite and the `TeamSubCoachAssignment` but never sets the sub-coach's `User.coach_id`. The scope service requires `coach_id` = head (src/sub-coach/sub-coach-scope.service.ts:59-86), so the accepted sub-coach is treated as the head coach of their own roster. The legacy assign/reassign destination check also requires `coach_id = head` (src/sub-coach/sub-coach-reassign.service.ts:107-119), so assigning any client to them returns 404, and the legacy detail route returns 404 for them too. Meanwhile the guards, the fee split, the AI pool and the brief all use the seat row (no-active-sub-coach.guard.ts:15-18, head-coach-only.guard.ts:15-18, fee-policy.service.ts:86-96, coach-ai-budget.service.ts:98-127, coach-brief.service.ts:791-802). The result: one person is a sub-coach for money, billing and brief, but a solo coach for client reads. | POST /sub-coaches/invites/accept; POST /sub-coaches/:id/assign-client | C, pre-unhide |
| P4 | **Team tab UI cannot work** (R3-A, R3-C). Even if it rendered: no invite entry exists for a head coach with zero sub-coaches (the Team tab needs `hasSubCoaches`, CoachNavigator.tsx:683-684, :765-770, useCoachRoleType.ts:40-96), and `TeamMembersScreen.tsx` is not mounted in any navigator. | mobile files above | C, pre-unhide |
| P5 | **Removal takes the sub-coach's own clients and leaves delegations open.** `revoke` (sub-coach-invite.service.ts:595-726) moves every student with `coach_id = sub-coach` to the head coach (:672-687), including clients who joined the sub-coach directly before they joined the team. It does not ask or tell those clients. It does not move sharing grants, which are keyed per (client, coach, scope) (consent.service.ts:306-336), so the head coach sees no logs and the client is never asked to share again. It leaves the clients' paid subscriptions on the sub-coach's Connect account. It never closes open `SubCoachAssignment` rows. Under the scope rule, an open delegation alone keeps a coach whose `coach_id` = head inside the team (sub-coach-scope.service.ts:72-76), and messaging authorises on it (messaging.service.ts:348-374). So a removed sub-coach of that kind would keep reading and messaging delegated clients. | POST /sub-coaches/:id/revoke | C, pre-unhide; owner decision below |

Other C items (edge, deferred to 10k clients):
- C1 Team Mode lets a head coach seat any coach as a sub-coach without that coach's consent (src/team-mode/team-mode.service.ts:80-200). It is blocked only because Pro/Enterprise prices are unset (tier-resolver.service.ts:37-64; R1: 0 priced subscriptions). Already listed in A7.5.
- C2 "Phantom sub-coach" under the bare `coach_id` rule (legacy list/assign, RLS helper migration 20261215000000_mwb_1_data_model:197-213). Two promotion paths keep the old `coach_id`: `become-coach` (auth.service.ts:1716-1719, gated off) and owner promotion (admin.service.ts:125-128). Code attach cannot create one, because it requires a student (invite-codes.service.ts:950-990).
- C3 A sub-coach buying an AI credit pack is charged on the head coach's Stripe customer. The route is not behind NoActiveSubCoachGuard (coach-ai.controller.ts:29, :71; coach-ai-credit-pack.service.ts:75-84).
- C4 A coach on several teams draws on the oldest seat's pool and the oldest head's split (coach-ai-budget.service.ts:98-103; fee-policy.service.ts:86-96).

Checked and found consistent (no finding):
- AI credit pooling: a client of a sub-coach and the sub-coach's own coach-side use both draw on the head coach's pool (roman.service.ts:1569-1580; ai-gateway.service.ts:580-606).
- Billing block for seated sub-coaches (no-active-sub-coach.guard.ts).
- Brief modes are seat-based (coach-brief.service.ts:791-802), and team brief items only appear when the Team tab is mounted.
- Already reported in FW-COACH-128, not repeated here: the sharing-gate gaps, and the fact that sub-coaches have no sharing grant of their own.

## Owner decision (needs operator: 1)
When a coach who already has their own clients joins a team, and later leaves or is removed, do their own clients stay with them?
**Recommended default: yes.** Accepting an invite keeps their own roster in view. Removal returns only the clients the head coach delegated, closes those delegations, and never moves the sub-coach's own clients, their sharing grants or their subscriptions. This is a prerequisite for ORG-REVOKE-129.

## (4) First-week polish (ranked)
1. FIX: the "Invite codes" row opens Clients > Invite codes (ORG-PROFILE-129). Owner: yes.
2. FIX: rename "Team / Gym profile", "Team" and "Set up your team" to "Business profile" while teams are hidden (ORG-PROFILE-129). Owner: yes.
3. FIX: replace the hard-coded `'#fff'` banner text (CoachTeamProfileScreen.tsx:289) with a theme token (ORG-PROFILE-129). Owner: yes.
4. FIX (pre-unhide): removal keeps the sub-coach's own clients and closes delegations; accept follows the owner decision (ORG-REVOKE-129). Owner: yes, after the decision above.
5. FIX (pre-unhide): retire the shadowing legacy routes (ORG-ROUTES-129; matches A7.5 "retire the duplicate SubCoach controller"). Owner: yes.
6. FIX (pre-unhide): Team tab gates on the server's team entitlement (teams are free), parses `{items}`, and sends the right reassign body (ORG-TEAM-UI-129). Owner: yes.
7. FIX (pre-unhide): promotions clear `coach_id` so no phantom sub-coach can exist (ORG-PHANTOM-129). Owner: yes.

## (5) Proposed fix jobs
All jobs are file-disjoint from each other. No open PR on board.md touches these files (checked at 16:27).
| Job | When | Repo | Files (exact) | Lines | Tier | Model |
|---|---|---|---|---|---|---|
| ORG-PROFILE-129 | Day 1 | mobile | src/screens/coach/CoachTeamProfileScreen.tsx; src/screens/coach/settings/BillingSection.tsx; new src/screens/coach/__tests__/CoachTeamProfileScreen.org129.test.tsx | ~80 | T1 | GPT-6.1 Sol |
| ORG-ROUTES-129 | Before unhide | backend | src/sub-coach/sub-coach.controller.ts; src/sub-coach/sub-coach.module.ts; src/sub-coach/dto/sub-coach.dto.ts; src/sub-coaches/sub-coaches.controller.ts; new test/sub-coach-routes.spec.ts (one handler per path) | ~300 | T3 | Claude Opus 5.5 (permissions) |
| ORG-REVOKE-129 | Before unhide, after owner decision | backend | src/sub-coaches/sub-coach-invite.service.ts (accept + revoke); src/sub-coaches/sub-coach-invite.service.spec.ts | ~250 | T4 | Claude Opus 5.5 (privacy, money) |
| ORG-TEAM-UI-129 | Before unhide, after ORG-ROUTES-129 | mobile | src/screens/coach/TeamManagementScreen.tsx; src/api/subCoachApi.ts; src/screens/coach/ClientReassignModal.tsx; src/screens/coach/__tests__/TeamManagementScreen.test.ts | ~250 | T2 | GPT-6.1 Sol |
| ORG-PHANTOM-129 | Before unhide | backend | src/admin/admin.service.ts (setRole: clear coach_id on promotion); src/auth/auth.service.ts (becomeCoach only); their two spec files | ~60 | T3 | Claude Opus 5.5 (permissions). Check board for open auth.service.ts PRs first. |

## HANDOFF
- Status: done. B=0, U=2, needs operator: 1 (sub-coach own-client ownership; default: they keep them).
- Evidence: R1 counts (Supabase project "FITNESS TGP", read-only SELECT, counts only); R2 curl results; R3 jest output in ops/reports/AUD-ORG-129-jest-output.txt (test file only in the local worktree wt/AUD-ORG-129-mobile, never pushed).
- Not covered for lack of time: what codes issued by a removed sub-coach do after revoke (invite-codes.service.ts:448-461 attributes them to the head coach at issue time); the community and program-library visibility of a removed sub-coach. Both are hidden-feature only.
- The A7.5 post-launch sub-coach plan should absorb P1-P5 and ORG-ROUTES/REVOKE/TEAM-UI/PHANTOM before teams are unhidden.
