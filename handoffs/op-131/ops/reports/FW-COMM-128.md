# FW-COMM-128 — first-week community audit (agent 128, auditor, read-only)

Status: DONE (14:31-14:45 PDT 10-07). No code, no PRs, no comments.
Traced on: mobile origin/main 4185b9b2 (includes m#482 DES-AK Today, merged 13:49, and m#498 DES-AL space/thread/composer,
merged 14:32 — newer than the RO-mobile worktree d0875d26, so findings were re-checked on 4185b9b2) and backend main 0d179edb.

## Scope traced (what a week-one client actually meets)
Store builds (eas.json `production` and `clinic`): Community tab ON, Hall ON, Cohorts ON, DMs OFF (clinic sets
EXPO_PUBLIC_FF_COMMUNITY_DM=false), Challenges / Search / Events / Classroom / Voice OFF (code default false). Backend
(fly-env-desired-state.json): FEATURE_COMMUNITY_API/POSTS/MESSAGES/PUSH/REALTIME true; DM, CHALLENGES, SEARCH, EVENTS, ACKS unset
(= off). So "challenges join/leave" and "direct messages" are NOT reachable in week one; not audited beyond confirming they are hidden.
Surfaces audited:
- Community tab (CommunityNavigator behind CommunityTermsGate): sub-tabs Today / Hall / Cohorts; header links Leaderboard (has coach
  only) and Community safety.
- Hall/Cohort feed (CommunitySpaceScreen), thread (CommunityThreadScreen), composer (CommunityComposerScreen), ReactionBar,
  SafetyMenu (report / block / delete), Community safety (guidelines, contact, blocked list, unblock, notices).
- More > Community = member wins (src/screens/client/CommunityScreen.tsx): share, list, report/block, delete own.
- Opt-in leaderboard (LeaderboardScreen / LeaderboardSettingsScreen, backend src/leaderboard/*).
- Backend: community.service getMe/getToday/feed/wins, posts, comments, reactions, moderation report -> ReportAlertService
  (email to support, self-harm flagged first), safety block/filter, community push (reply push).
Both states: with a coach (first getMe bootstraps membership in the coach's "All members" cohort, workspace auto-created) and without
a coach (workspace_id null -> every sub-tab shows "No cohort yet / No community space yet", wins visible only to self, leaderboard hidden).
Memory on/off: not relevant to community.

What is solid (no finding): Apple 1.2 set is complete on every week-one surface — terms gate before any community route (also deep
links), objectionable-content filter on post title/body, post edit, comments and wins (422 keeps the draft), Report on every other
member's post/comment/win with 8 reasons, two-way Block (cannot block own coach), blocked list + unblock, report alert email to the
team with self-harm reports marked "Review it first", coach report queue reachable (Clients > Community reports). Tenancy: posts,
comments, wins and leaderboard are coach-scoped; other members appear by first name only; leaderboard is opt-in (default off).
Lock-screen push text is a fixed safe string.

## (1) B list
None. No ordinary-user story found where money, private/health data, safety routing, data or a core flow breaks in community
week one. (Community is not on the core-flow list; Apple 1.2 controls are present.)

## (2) U list (on mobile 4185b9b2 / backend 0d179edb; items fixed by m#482/m#498 are not repeated)
U1 Reactions are write-only. ReactionBar in the thread gets no `reactions` prop (CommunityThreadScreen.tsx:103 on main), the post
   response has no reaction data (backend community-posts.service.ts:57-72 postView) and there is no GET for post reactions
   (community-reactions.controller.ts:64-89 only POST/DELETE). A client taps a reaction, nothing changes on screen, nobody ever sees
   it, and it can never be removed (active is always false, so DELETE never fires). Smallest fix: backend adds `reactions`
   (summary with reacted_by_me) to GET /community/posts/:postId; mobile passes it to ReactionBar and invalidates
   ['community','post',postId] on settle (useCommunity.ts:257-276 invalidates only the list key).
U2 No author and no time on posts or replies. Post rows and reply rows render only title/body (CommunitySpaceScreen.tsx post row,
   CommunityThreadScreen.tsx reply row); backend views carry only author_user_id (community-posts.service.ts:57-82). A client cannot
   tell the coach's post from another client's, or yesterday's from last month's; Block reads "Block this member". Smallest fix:
   backend adds author first name (memberFirstName, same rule as wins) + mobile shows "First name · 2h ago" (formatTimeAgo exists in
   client/CommunityScreen.tsx:47). Needs owner yes on showing first names on posts (wins already do).
U3 A client cannot delete (or edit) their own post or reply. SafetyMenu returns null on own content without onDelete
   (SafetyMenu.tsx:81) and neither the feed nor the thread passes onDelete; backend DELETE /community/posts/:postId allows the author
   (community-posts.service.ts:228-244). A client who shares something too personal in the Hall has no way to take it down. Smallest
   fix: communityApi.deletePost + onDelete on the thread's post SafetyMenu (contentNoun "post"). Replies: no backend DELETE for
   comments — C (needs a new endpoint).
U4 Cohorts sub-tab duplicates the Hall. Both sub-tabs call usePosts(workspaceId) (CommunitySpaceScreen.tsx:90) and every post is
   created scope 'hall' with no cohort (community-posts.repository.ts:26), so "Cohort" shows the same posts, each labelled "Hall".
   Smallest fix: cohort view filters `scope === 'cohort'` and shows a true empty "No cohort posts yet" without a composer, or the
   Cohorts tab lists the client's cohorts from GET /community/cohorts (real names, member counts).
U5 No visible Back on the thread, composer and stand-alone space routes (headerShown false in CommunityNavigator; only swipe/hardware
   back). Thread, composer and the Space route opened from Today's "Your cohort" row have no Back control, unlike Community safety and
   Leaderboard which do. Smallest fix: the same "chevron-back Back" row CommunitySafetyScreen uses.
U6 Feed and thread have no refresh. No pull-to-refresh on the Hall list or replies, no realtime subscriber for the workspace channel
   (only the user badge channel is subscribed, useCommunity.ts:296-321), global staleTime 30 s and refetchOnWindowFocus false. A
   reply that arrives while the client is reading the thread does not appear. Smallest fix: RefreshControl wired to refetch() on both lists.
U7 Reply push opens Community Today, not the post (pushTapRouter.ts:89 `Community: () => ({ root: 'CommunityTab' })`); backend sends
   deepLink tgp://community/posts/<id> (community-posts.service.ts:279) while the app registers community/thread/:postId
   (RootNavigator.tsx linking). Cross-area: FW-NOTIF-128 owns the router; smallest fix: Community target with target_type 'post' ->
   CommunityTab > CommunityThread { postId: target_id }.
U8 Wins screen (More > Community) copy: "If your coach has not opened a community yet, only you will see it."
   (client/CommunityScreen.tsx:276) claims exclusivity (redo rule 1: platform owner and the moderation team can read); subtitle
   "Wins from your team" (:128) and More row "Connect with other members" (MoreScreen.tsx:136 on main) are false for a client with no coach
   (feed returns own wins only, community.service.ts:457-490). Two different things are both called "Community" (tab and More row).
   Fix: "If your coach has no community yet, your win is not shared with other members."; state-driven subtitle; More row label
   "Wins" / "Share a win with your coach's clients".
U9 Wins screen is untouched by the redo and outside every DES job: legacy ThemeProvider palette, yellow star (colors.warning), red
   error title (colors.error), TouchableOpacity, card fills (client/CommunityScreen.tsx:130-160, 206-256). Below the calm bar (rule 3).
U10 Leaderboard display name is free text shown to every opted-in peer with no content filter and no Report on rows
   (leaderboard.service.ts:216-231 stores it raw; LeaderboardScreen rows have no SafetyMenu). Apple 1.2 asks for filtering of UGC.
   Smallest fix: run the community content filter (CommunitySafetyService.assertAllowed / community-content-filter.ts) on
   displayName in setOptIn; 422 with the same rejected copy. T3.
U11 Report sent after "Self-harm or suicide" shows only the generic 24-hour line (SafetyMenu.tsx:93-96,
   communitySafetyApi.ts:77-78). The bystander gets no crisis line in the moment. Fix: when reason is self_harm, append
   "If someone is in immediate danger, call 911. To reach the 988 Suicide and Crisis Lifeline, call or text 988." (same wording as
   guideline 7). T3 safety copy.
U12 Today "Your cohort" meta says "{n} members" -> "1 members" for a coach's first client (CommunityTodayScreen.tsx:194 on main).
   Fix: plural helper.

## (3) Dead-button table (week-one build, main 4185b9b2)
| Screen | Control | Today | Verdict |
|---|---|---|---|
| Thread | Reaction chips (4) | POST only; no visible change; never removable | dead in effect (U1) |
| Thread | "Be the first to reply" | focuses composer (m#498) | OK |
| Feed / Thread | "..." on own post / reply | hidden (no onDelete) | missing action (U3) |
| Cohorts sub-tab | whole tab | same feed as Hall | duplicate (U4) |
| Today | "Your cohort" row | opens Space route with no Back | U5 |
| Today | "Send your coach a message" | Home > Messages | OK |
| Community tab | Leaderboard / Community safety | open their screens | OK |
| Safety | Unblock, email, Try again | real | OK |
| Wins | Share a win, Report/Block, Delete own | real | OK |
| Leaderboard | Opt in, Settings, Back | real | OK |
| Push | community reply push tap | Community Today, not the post | U7 (cross-area) |
| DmList / DmThread routes | registered unconditionally, unreachable with DM flag off (only via tgp://community/dm/... link) | C (edge, deferred to 10k clients) |

## (4) First-week polish, ranked
1. FIX — Reactions that show and toggle (U1). Highest-visibility broken interaction in the Hall.
2. NEW (owner yes; default YES, first name only like wins) — author first name + relative time on posts and replies (U2).
3. FIX — Delete own post from the thread (U3).
4. FIX — Cohorts tab shows true cohort content or the cohort list, not a Hall duplicate (U4).
5. FIX — Back control + pull-to-refresh on thread/space/composer (U5, U6).
6. FIX — Wins screen truthful copy + calm redo; More row renamed "Wins" (U8, U9).
7. FIX (T3) — crisis line on self-harm report confirmation; content filter on leaderboard display names (U10, U11).
8. NEW (owner yes; default NO for launch) — honest coachless Community: hide Hall/Cohorts for a client with no community space and
   show one line "Community opens when you join a coach." with the existing Enter-coach-code action, instead of three identical
   empty tabs.

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs; no open PR touches these files — m#473 touches only
PrivateCommunityHubScreen, b#587/#605 are stale/unrelated)
- FWC-BE-128 (Claude Opus 5.5, T3 privacy, backend, ~250 lines): add `reactions` (count + reacted_by_me) and `author_name`
  (memberFirstName) to the post view and comment view; read-only. Files: src/community/posts/community-posts.service.ts,
  src/community/posts/community-posts.repository.ts, src/community/reactions/community-reactions.repository.ts (summary read),
  src/community/dto/community-post*.dto.ts, tests under test/community/posts/. Needs the owner yes on item 2 for author_name;
  reactions part can ship alone.
- FWC-THREAD-128 (GPT-6.1 Sol, T2 mobile, ~300 lines): thread shows reactions (from post.reactions when present, else from the
  mutation response), invalidates the post key, own-post Delete via SafetyMenu onDelete, author/time when the field exists (must
  work against current prod backend: render nothing when absent), Back row, RefreshControl on replies. Files:
  src/screens/community/CommunityThreadScreen.tsx, src/api/communityApi.ts (deletePost + optional fields), src/hooks/useCommunity.ts
  (+ tests).
- FWC-SPACE-128 (GPT-6.1 Sol, T1 mobile, ~200 lines): Cohorts view honest (filter or cohort list), Back row when opened as a route,
  RefreshControl on the feed, author/time on rows when present, audience line in the composer ("Visible to your coach and everyone in
  this community."). Files: src/screens/community/CommunitySpaceScreen.tsx, src/screens/community/CommunityComposerScreen.tsx (+ tests).
  Starts after FWC-THREAD-128 merges (reads the optional fields it adds to communityApi.ts).
- FWC-WINS-128 (GPT-6.1 Sol, T1 mobile, ~350 lines): wins screen calm redo (theme tokens, hairlines, no yellow/red, forest "Share a
  win" primary) + U8 copy, More row label, Today "1 member" plural. Files: src/screens/client/CommunityScreen.tsx,
  src/screens/client/MoreScreen.tsx (row copy only), src/screens/community/CommunityTodayScreen.tsx (plural only) (+ tests).
- FWC-SAFE-128 (Claude Opus 5.5, T3 safety, mobile + backend as two PRs, ~120 lines total): mobile src/components/community/SafetyMenu.tsx +
  src/api/communitySafetyApi.ts (self-harm crisis line on Report sent); backend src/leaderboard/leaderboard.service.ts +
  src/leaderboard/leaderboard.module.ts (content filter on displayName) (+ tests).
- Push tap (U7) -> route to FW-NOTIF-128's job list (src/services/pushTapRouter.ts), not proposed here.

## C one-liners
- Cohort-chat unread badge has no client reading surface; no producer in the launch build (coach community off). C (edge, deferred to 10k clients).
- Community membership is never deactivated when a client is archived or moved to another sub-coach; old workspace stays readable.
  Cross-area FW-COACH-128. C unless the owner wants archive to end community access.
- Comment (reply) deletion has no backend endpoint. C (needs new endpoint; after U3).
- Blocked users still appear on the opt-in leaderboard (block copy does not promise it). C.
- DM routes registered with DMs off (deep link only). C (edge, deferred to 10k clients).
- Reaction chips are emoji glyphs (allowlist), against the outline-icon/no-emoji look. C (design, owner taste).

## Cross-area one-liners for the operator
- FW-NOTIF-128: community reply push lands on Community Today, not the post (pushTapRouter.ts:89; deep_link path mismatch posts/ vs thread/).
- FW-COACH-128: archived/reassigned clients keep community membership in the old coach's workspace (no membership update outside moderation).

## PRs
None (auditor, read-only).

## Not fixed (needs operator)
- Owner decision 1: show author first names on posts/replies (recommended default YES, first name only, same as wins).
- Owner decision 2: coachless Community shell (recommended default NO for launch; keep the honest empty states that m#482/m#498 shipped).
- Launch FWC-* jobs above as slots free (FWC-BE-128 and FWC-SAFE-128 are Claude Opus 5.5).

## HANDOFF
Audit complete; nothing in flight. Evidence: mobile origin/main 4185b9b2, backend main 0d179edb, flags from eas.json and
.github/fly-env-desired-state.json. A fresh agent can launch the FWC-* jobs in section (5) directly; re-check file:line on the
then-current main first (community screens changed twice today: m#482, m#498).
