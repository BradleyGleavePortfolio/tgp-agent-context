# EXPLORE-SUBCOACH-129: the sub-coach persona, followed to every break point (agent 129)

Status: DONE 16:30 PDT (operator 16:24: credits short, finish fast). Auditor only: no code changes, no PRs, no production writes,
no sign-ins. Code: backend main c3324d4a, mobile main a1be6fb2 (re-fetched 16:13 PDT, unchanged). Map: reports/EXPLORE-SUBCOACH-129-map.md.
Throwaway tests (never pushed): /home/user/workspace/wt/EXPLORE-SUBCOACH-129-mobile/src/__explore129__/ (2 files, 8 tests, all PASS).

## B list (launch): none proven

No sub-coach exists in production and no app path can create one, so no ordinary user can hit any sub-coach defect on launch day.
Owner 10-06 14:21 "hide them for launch" (m#420) holds. Five defects would be B the day teams are un-hidden; they are marked
**LATENT-B** below and must be fixed before that. Known C re-graded: "assigned sub-coach has no sharing grant, sees no client logs"
(coach.service.ts:437) stays C for launch (unreachable) and becomes LATENT-B K3 for un-hiding.

## U list (reachable today by every coach: Settings > Business > "Team / Gym profile")
- R1: no signal shows "Network Error Tap to retry." (raw axios text).
- R2: a business name over 120 characters fails with only "Bad Request".

## Reachability (REPRODUCED by read-only SELECT, FITNESS TGP, 16:17 PDT, counts only)
TeamSubCoachAssignment 0 | SubCoachAssignment 0 | SubCoachInvite 0 | TeamAuditEvent 0 | users with role sub_coach 0 | coaches 2 |
students 1 | TeamProfile 1 | CoachSubscription with a Stripe price 0 | CoachProfile plan_tier flat_300 x1.
- Invite lives only in the Team tab, which mounts only when the roster already has a sub-coach (CoachNavigator.tsx:683-684, 765-772;
  useCoachRoleType.ts:70-71). No sub-coach, no tab, no Invite.
- Nothing in mobile calls POST /sub-coaches/invites/accept (sub-coaches.controller.ts:155-158) or GET /sub-coaches/invites/by-token/:token.
- POST /team/sub-coaches is 403 team_mode_locked without a Pro/Enterprise CoachSubscription price (tier-resolver.service.ts:37-59).

## REPRODUCED findings (throwaway jest test in my worktree, or read-only GET/SELECT)

| # | Grade | One-sentence user story | Steps | Evidence |
|---|---|---|---|---|
| R1 | U | A coach who opens Team / Gym profile with no signal reads "Network Error Tap to retry." | Wifi off > Settings > Team / Gym profile | teamScreens.explore.test.tsx "wifi off on open" PASS, children ["Network Error"," Tap to retry."]. coachTeamApi.ts wrap() passes err.message raw; CoachTeamProfileScreen.tsx:51-54 load, :89 prints it. errorMessage() (types/common.ts:55-57) already has the right sentence. |
| R2 | U | A coach who pastes a long gym name taps Create and sees only "Bad Request". | Team / Gym profile > Set up team > 121+ chars > Create | Same file, "very long business name" PASS. team.dto.ts:10 MaxLength(120); Nest sends message as an array, so errorMessage() falls back to error "Bad Request" (types/common.ts:58-63). TextInput has no maxLength (CoachTeamProfileScreen.tsx:122-128); handleCreateTeam :60. Control: wifi off during Create gives the good connection sentence (PASS). |
| R3 | LATENT-B (false claim + dead end) | A head coach invites a sub-coach, the app says the link "was emailed", nothing is emailed, and the shared link opens nothing. | Team tab > Invite > Send invite; invitee taps the link | "claims the link was emailed" PASS (SubCoachInviteModal.tsx:200, 206; handleInvite :101). No mailer: sub-coach-invite.service.ts:38-40, SubCoachesModule imports (sub-coaches.module.ts:1-22). Link = PUBLIC_INVITE_BASE_URL + /sub-coach/<token> (sub-coach-invite.service.ts:730-735) = https://app.trygrowthproject.com/join/sub-coach/<token>. subcoachInviteLink.explore.test.ts PASS: universal and tgp:// forms resolve to NO screen (RootNavigator.tsx:192-205 has only join/:invite_code? and invite/accept/:token). Unauthenticated GET 16:19 PDT of that URL with a fake token: HTTP 404 JSON "Cannot GET /join/sub-coach/..." (only join/:code exists, invite-landing.controller.ts:30). AASA (GET 16:19) lists /join/*, so iOS opens the app on its default screen. |
| R4 | C (latent) | A signed-in user who taps a sub-coach link gets "sub-coach" stored as a client invite code. | Signed in > tap link | extractJoinPathCode() = "sub-coach" PASS (pendingInviteCode.ts:72-75; RootNavigator.tsx:469-472, 537-550). Banner is client Home only, so a coach never sees it. |

## CODE-ONLY findings (traced: file:line, handler, API path)

| # | Grade | One-sentence user story | Handler and API path | Evidence |
|---|---|---|---|---|
| K1 | LATENT-B (privacy, clients given away) | A coach with their own paying clients joins a team, and when the head coach removes them every one of their own clients is silently moved to the head coach. | SubCoachDetailScreen handleRevoke (:116) > POST /sub-coaches/:id/revoke > SubCoachInviteService.revoke (:595) | Takes every student with coach_id = sub-coach (sub-coach-invite.service.ts:674) and sets coach_id = head (:686). No team scoping, no notice to clients. |
| K2 | LATENT-B (privacy) | A head coach opens a sub-coach and sees the names and emails of that coach's private clients, and can move any of them to themselves. | GET /sub-coaches/:id (SubCoachesService.detail :115); ClientReassignModal > POST /sub-coaches/:id/reassign-client | detail lists all students with coach_id = sub-coach (sub-coaches.service.ts:137). reassignClient allows any client of head or any sub-coach (teamCoachIds :368, check :239) and moves coach_id (:277). |
| K3 | LATENT-B (core dead end: coach sees client logs) | After a head coach hands a client to a sub-coach, the sub-coach sees the client but none of their food, workouts or weights, and the client disappears from the head coach's list. | POST /sub-coaches/:id/reassign-client; sub-coach client detail > coach timeline | Consent is per (client, coach): consent.service.ts:328-336. No grant is written for the sub-coach anywhere (accept, reassign). coach.service.ts:437 loadFitnessConsents -> empty slices. Head coach scope is coach_id = head (coach.service.ts:117-147). |
| K4 | LATENT-B (two team models disagree) | A coach who accepts an invite is still treated as an independent coach by the client-scope service, so team access rules depend on which endpoint ran. | POST /sub-coaches/invites/accept vs SubCoachScopeService | Scope needs User.coach_id = head AND a membership row (sub-coach-scope.service.ts membershipHeadCoachIdFor). accept (sub-coach-invite.service.ts:227-484) never sets coach_id; reassign moves the client's coach_id instead of writing the overlay row the scope service reads. Duplicate controllers on the same paths: app.module.ts:375 (sub-coaches) and :398 (sub-coach); first wins. |
| K5 | LATENT-U (false claim) | A head coach whose Team tab appears is told "Scale plan required ... Upgrade", although teams are free and no Scale plan exists. | TeamManagementScreen load > GET /auth/me plan_tier | TeamManagementScreen.tsx:34 SCALE_TIERS, :40-62 default flat_300, gate at the isGated branch; production plan_tier flat_300. |
| K6 | LATENT-U (dead end) | A head coach with one sub-coach cannot take a client back: the reassign list says "No other coaches available." | ClientReassignModal list > GET /sub-coaches | ClientReassignModal.tsx:42-53 lists sub-coaches minus the current one, never the head coach (:118), though the API accepts the head coach's id (subCoachApi.ts:104-117). |
| K7 | LATENT-U (false error) | With wifi off a reassign fails with "The destination coach may be at capacity." | ClientReassignModal handleConfirm (:55) | One catch-all message (:64-67); the /sub-coaches reassign path has no capacity check. |
| K8 | LATENT-U (false copy) | The revoke alert says "This cannot be undone." but the coach can be re-invited and the seat re-activates. | SubCoachDetailScreen handleRevoke | Copy :125; accept re-activates the archived seat (sub-coach-invite.service.ts:426). |

C one-liners (edge, deferred to 10k clients): same-tick double tap on Send invite (state guard; server 409 invite_already_outstanding);
double tap or back gesture mid-reassign (second POST is a logged no-op; pop(2) twice harmless); seat ceiling above 10,000 gives
"Bad Request" (sub-coaches.dto.ts:25-29); POST /sub-coaches/:id/assign-client can only target a coach whose coach_id is the caller
(sub-coach-reassign.service.ts:103-115), API-only.

## FORGOTTEN features (no audit, redo or merged PR touched them on 2026-10-07)
No 10-07 commit in either repo touches src/sub-coaches, src/sub-coach, src/team, src/team-mode or the mobile team files (git log
--since 10-07, local). Only today's explorer maps and one AUD-FIN-DESIGN-129 test mention them.
1. Settings > "Team / Gym profile" (CoachTeamProfileScreen): shown to every coach; the business name is read nowhere else
   (only team.service.ts reads TeamProfile), so it is a self-contained page for a hidden feature.
2. Team tab: TeamManagementScreen, SubCoachInviteModal, SubCoachDetailScreen, ClientReassignModal (hidden until a sub-coach exists).
3. TeamMembersScreen.tsx (393 lines): registered in no navigator (orphan).
4. Sub-coach invite link, by-token preview and accept: backend only, no app or web landing.
5. Coach Brief head-coach items deep_link strings tgp://team/sub-coaches and tgp://command-center/team: no linking entry (the
   in-app tap uses the tab, so only the strings are dead).
6. Duplicate /sub-coaches controller (src/sub-coach), Team mode paid-seat path (src/team-mode).

## Proposed fix jobs (file-disjoint, each under 400 lines)
| Job | Model, tier | Files | Fixes | When |
|---|---|---|---|---|
| CF-TEAMPROFILE-COPY-129 | GPT-6.1 Sol, T1 mobile, ~60 lines | src/api/coachTeamApi.ts (wrap message = errorMessage(err)), src/screens/coach/CoachTeamProfileScreen.tsx (maxLength 120), one test | R1, R2 | Before 23:00 cut (small, safe) |
| TEAM-MODEL-BE | Claude Opus 5.5, T4 backend, ~300 | src/sub-coach/*, src/sub-coaches/sub-coach-invite.service.ts accept(), app.module.ts | K4: one model (default: overlay, client stays the head coach's), accept writes membership, retire duplicate routes | Post-launch, first |
| TEAM-SCOPE-BE | Claude Opus 5.5, T4 backend, ~350 | src/sub-coaches/sub-coaches.service.ts, revoke() in sub-coach-invite.service.ts, consent grant on assignment | K1, K2, K3 | After TEAM-MODEL-BE |
| TEAM-INVITE-LINK | Claude Opus 5.5, T3, mobile ~300 + backend ~120 | mobile: new accept screen, RootNavigator.tsx linking + guard, pendingInviteCode.ts, SubCoachInviteModal.tsx:206 copy; backend: invite-landing.controller.ts GET join/sub-coach/:token (and a mailer, or keep "share this link" copy) | R3, R4 | Post-launch |
| TEAM-SCREENS-COPY | GPT-6.1 Sol, T1 mobile, ~200 | TeamManagementScreen.tsx (drop tier gate), ClientReassignModal.tsx (head coach option, errorMessage), SubCoachDetailScreen.tsx (revoke copy) | K5-K8 | Post-launch |

Decisions for the owner (post-launch only; none block launch): 1. team model: default overlay (client stays the head coach's client,
the sub-coach is delegated). 2. sharing with an assigned sub-coach: default one visible sentence to the client at assignment, recorded
as that pair's FITNESS grant (same pattern as the 09:24 join sentence).

## HANDOFF
Done; nothing pushed; the local branch agent129/explore-subcoach-129-local in wt/EXPLORE-SUBCOACH-129-mobile holds only the two
throwaway tests. Not checked (check before un-hiding teams): the client's view after a reassign (inbox thread, coach name, and which
Stripe account recurring renewals pay once coach_id moves: possible money item), broadcasts and community scope for sub-coaches
(FW-COMM-128 noted community membership is never moved), revenue-sharing endpoints (src/team), push or email for team events, and
session expiry around accept (no accept screen exists yet). AUD-ORG-129 covers server permission boundaries in depth.
