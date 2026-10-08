# EXPLORE-SUBCOACH-129 map: every sub-coach and team pathway, traced from code (agent 129)

Traced at backend main c3324d4a and mobile main a1be6fb2 (both re-fetched 16:13 PDT, unchanged). Read-only. Status: DONE 16:30 PDT.
Findings and grades: reports/EXPLORE-SUBCOACH-129.md.

## 0. Reachability today (the frame for every grade below)

Production, read-only SELECT 16:17 PDT (project FITNESS TGP), counts only:

| table / filter | rows |
|---|---|
| TeamSubCoachAssignment (any / active) | 0 / 0 |
| SubCoachAssignment overlay (any / open) | 0 / 0 |
| SubCoachInvite (any / accepted) | 0 / 0 |
| TeamAuditEvent | 0 |
| TeamProfile | 1 (has a business name) |
| User role = sub_coach / coach / owner / student | 0 / 2 / 0 / 1 |
| CoachProfile plan_tier | flat_300 x1 |
| CoachSubscription with a Stripe price | 0 |

No sub-coach exists in production and no app path can create one:
- Inviting needs TeamManagementScreen, which only mounts inside the Team tab; the tab only shows for a head coach whose roster ALREADY
  holds a sub-coach (mobile src/navigation/CoachNavigator.tsx:683-684, src/hooks/useCoachRoleType.ts:70-71). A coach with none never
  sees Invite. Chicken and egg = the intended day-1 hide (owner 10-06 14:21 "hide them for launch"; m#420).
- Accepting needs POST /sub-coaches/invites/accept (backend src/sub-coaches/sub-coaches.controller.ts:146-161). No mobile file calls it
  (rg "invites/accept|by-token" in mobile src: only the unrelated client /invites/accept/:token).
- Team mode direct add POST /team/sub-coaches (src/team-mode/team-mode.controller.ts:61-73) needs a CoachSubscription price equal to
  STRIPE_PRICE_PRO/ENTERPRISE (src/team-mode/tier-resolver.service.ts:18-43); 0 such rows in production, so 403 team_mode_locked.

## 1. Navigator roots

### 1a. Head coach (a coach with >= 1 active TeamSubCoachAssignment as head)
- Coach tabs (CoachNavigator.tsx). Team tab `TeamStack` mounted only when role=head_coach AND hasSubCoaches (CoachNavigator.tsx:683-684,
  765-772). Stack: TeamManagement -> SubCoachDetail -> ClientReassign (CoachNavigator.tsx:621-636).
- Settings > Business > "Team / Gym profile" (src/screens/coach/settings/BillingSection.tsx:25-34) -> CoachTeamProfile
  (SettingsScreen.tsx:622-626). VISIBLE TO EVERY COACH (solo, head, sub).
- Coach Brief head-coach items `sub_coach_operations`, `team_performance` -> tab TeamStack (src/screens/coach/CoachBriefScreen.tsx:134-136);
  backend emits them only in head_coach mode (backend src/coach/brief/coach-brief.service.ts:699-713, 787-801), which is also when the tab
  exists. Brief `deep_link` strings tgp://team/sub-coaches and tgp://command-center/team have no linking entry (RootNavigator.tsx:164-298).
- Orphan screen: src/screens/coach/TeamMembersScreen.tsx (393 lines) is not registered in any navigator (rg TeamMembers src/navigation: none).

### 1b. Sub-coach (a role=coach user with an active TeamSubCoachAssignment as sub)
- Same CoachNavigator as any coach. useCoachTeamStatus resolves `sub_coach`, so no Team tab. Ask AI hidden for sub-coaches (#817,
  A6.9 18:36). Money row hidden once the server answered 403 sub_coach_billing_blocked (src/lib/money/headCoachRole.ts).
- Settings > "Team / Gym profile" still shown (BillingSection.tsx:25-34); its "Open Money" row is shown to a sub-coach too
  (CoachTeamProfileScreen.tsx ~196-200).

### 1c. Invitee (signed out or signed in)
- Invite URL minted by backend: `${PUBLIC_INVITE_BASE_URL}/sub-coach/<token>` (src/sub-coaches/sub-coach-invite.service.ts:730-736);
  production base is https://app.trygrowthproject.com/join (docs/deploy-runbook.md:102), so the link is
  https://app.trygrowthproject.com/join/sub-coach/<token>.
- Mobile linking: only `join/:invite_code?` (one segment) and `invite/accept/:token` (client email invites) exist
  (RootNavigator.tsx:192-205). Signed-in handler treats any /join/ URL as a client invite code and stores the FIRST segment
  (src/lib/pendingInviteCode.ts:72-75 -> "sub-coach") (RootNavigator.tsx:469-472, 537-550).
- Backend web fallback: only GET join/:code and invite/:code (src/invite-landing/invite-landing.controller.ts:30, 44).

## 2. Screens, buttons, handlers, API paths

| Screen (file) | Element | Handler | API | States present |
|---|---|---|---|---|
| CoachTeamProfileScreen | load | load() :48-51 | GET /coach/team (coachTeamApi.ts wrap) | skeleton; error "<axios message> Tap to retry."; 404 setup CTA; profile |
| CoachTeamProfileScreen | Set up team / Create | handleCreateTeam :55-73 | PUT /coach/team {business_name} (DTO MaxLength 120) | saving spinner; saveError |
| CoachTeamProfileScreen | Payouts warning | navigate('CoachSetup',{section:'get_paid'}) | - | shown when payouts_enabled false |
| CoachTeamProfileScreen | Open Money | navigate('CoachMoney') | coach-money (403 for sub-coach) | - |
| TeamManagementScreen | load | load() :174-205 | GET /auth/me (plan tier), GET /coach/team, GET /sub-coaches | spinner; tier gate; error + retry; empty |
| TeamManagementScreen | tier gate | SCALE_TIERS ['scale','enterprise'] :34, 216-222 | - | gate copy "Scale plan required ... Upgrade" / neutral on iOS |
| TeamManagementScreen | Invite | setInviteOpen(true) | - | - |
| SubCoachInviteModal | Send invite | handleInvite :101 | POST /sub-coaches/invites | validation, 404/501, 409, generic |
| SubCoachInviteModal | result | "Invite sent ... An invite link was emailed to" :200-207 | (no mailer server-side) | - |
| SubCoachInviteModal | Share link | Share.share(inviteUrl) | - | - |
| SubCoachDetailScreen | load | load() | GET /sub-coaches/:id (lists ALL students with coach_id = sub-coach) | skeleton; error + Retry |
| SubCoachDetailScreen | Revoke sub-coach access | handleRevoke :116 (Alert, copy :125) | POST /sub-coaches/:id/revoke | 404/501, 409 + reload, generic |
| SubCoachDetailScreen | client row Reassign | handleReassign -> ClientReassign | - | - |
| ClientReassignModal | list | useEffect :42 | GET /sub-coaches (head coach never listed) | spinner; "Could not load team."; empty "No other coaches available." :118 |
| ClientReassignModal | Confirm | handleConfirm :55, pop(2) :63 | POST /sub-coaches/:id/reassign-client | one catch-all "may be at capacity" :64-67 |

## 3. Backend surfaces (two parallel stacks)
- /sub-coaches (src/sub-coaches/*, registered first in app.module.ts:375) and a duplicate /sub-coaches controller in src/sub-coach/*
  (app.module.ts:398) with the same GET '', GET ':id', POST ':id/reassign-client', GET ':id/analytics' plus POST ':id/assign-client'.
  First registration wins for the shared routes.
- /team/sub-coaches (src/team-mode/*): paid-tier direct add without invitee consent (team-mode.service.ts:80-200), locked today.
- /coach/team (src/team/*): profile, members, revenue sharing.
- Public: GET /sub-coaches/invites/by-token/:token (sub-coach-invites-public.controller.ts:34-39).

## 4. Break points tried (owner 16:02 method) and what happens
| Break point | Where | Result |
|---|---|---|
| Wifi off before open | Team / Gym profile | "Network Error Tap to retry." (R1, reproduced) |
| Wifi off during save | Team / Gym profile Create | good sentence from errorMessage (control, reproduced) |
| Very long name | Team / Gym profile business name | "Bad Request" (R2, reproduced) |
| Very large number | Seat ceiling > 10,000 | 400 "Bad Request" (C) |
| Double tap | Send invite / Confirm reassign | guarded across renders; server dedupes; same-tick tap is C |
| Back gesture / close mid-save | Reassign, revoke | request completes server-side; harmless pop; TeamManagement does not refetch on focus (stale counts, C) |
| Background and return | all team screens | state kept; no focus refetch (C) |
| Email / push link signed out | sub-coach invite link | opens no screen (R3, reproduced); web 404 JSON (reproduced GET) |
| Link signed in | sub-coach invite link | "sub-coach" stored as client invite code (R4, reproduced) |
| Session expiry | accept | no accept screen exists, nothing to resume |
| Delete then re-add | revoke then re-invite | allowed; accept re-activates seat; own clients already moved to head coach (K1, K8) |
| Empty / full accounts | Team tab | tab absent with 0 sub-coaches; Scale gate for flat_300 (K5) |

## 5. Data model notes (why K1-K4 exist)
- Model A (src/sub-coaches, src/team, src/team-mode): membership = TeamSubCoachAssignment; reassign moves the CLIENT's coach_id to the
  sub-coach (sub-coaches.service.ts:277); revoke moves every coach_id = sub-coach client to the head (sub-coach-invite.service.ts:674-686).
- Model B (src/sub-coach overlay + SubCoachScopeService used by coach.service.ts:133-147): client.coach_id always the head; sub-coach
  = role coach + own coach_id = head + membership row; access via open SubCoachAssignment rows.
- Consent grants are per (client, coach) (consent.service.ts:328-336); no path writes one for a sub-coach.
