# V11_TEAMS_PLAN_132: Teams v1.1, complete sub-coach logistics and options for running a team
# (V11-TEAMS-PLAN-132, Claude Opus 5.5, read-only planner for operator agent 132, 2026-10-08 13:43-14:4x PDT;
# ADDENDUM 13:47 applied: pathway placement, design doctrine, rivals, post-AI proposition, PART A / PART B)

Basis: backend main cd0f90ed823d43dc8a9f0937554dc59fce7b6b94 (wt/RO-backend, fetched 13:47, unchanged), mobile main
a3a1c18e (fetched 13:47; includes m#572 CLINIC-APK and m#574 TEAMPROFILE; read with `git show origin/main:`). Every status is
"from the code" at those heads unless marked. Production switch state from backend .github/fly-env-desired-state.json. Read-only:
no branches, PRs, comments, GitHub writes or production reads (the 10-07 23:4x production counts in the op-131 HANDOFF are cited, not
re-run: 0 TeamSubCoachAssignment, 0 SubCoachAssignment, 0 SubCoachInvite rows).

## 0. One screen (plain words)

**What exists.** The backend has most of the team machinery: invites with a token and email match, a public invite preview, accept,
reassign, revoke, a "sub-coach sees only assigned clients" scope (fixed in archive/timeline/summary by b#878; console threads by
b#883, dual-approved, waiting on the npm audit fix), a team audit log, a head-coach 5 percent split setting, team AI-credit pooling,
and a business profile (renamed and fixed by m#574 today). Mobile has a Team tab (head coach roster, sub-coach detail, reassign,
invite sheet).

**Why nobody can use it.** It is broken end to end: the Team tab appears only after a sub-coach already
exists (m#420, AUDIT-16-125), and then always says "Scale plan required" although teams are free; the invite says "was emailed"
but nothing is sent and the link opens nothing; two backend controllers answer the same paths and disagree on the team model, so
reassign always fails; accepting an invite does not make the person a sub-coach for client reads; removing a sub-coach silently moves
that coach's own clients to the head coach; a sub-coach sees no food, workouts or weights of assigned clients because sharing is
keyed to one coach (the owner's team sharing rule, D10b, is not built); routing new clients (take turns, set shares, client picks a
coach) is a stub; the team performance view is one opaque 0-100 score.

**PART A (the owner's idea as stated): 19 PRs in 7 waves**, all behind three new switches that stay off until both lenses and the
owner say yes: FEATURE_TEAMS, FEATURE_TEAM_ROUTING, FEATURE_TEAM_DIGEST. Waves 1-3 make the core work correctly and privately
(switch and free teams, phantom fix, one team model, removal and scope, the team sharing rule, Team screens). Wave 4 opens the invite
link (web page, email through the existing service, accept screen) and starts the owner's options; waves 4-6 add routing (take
turns, set shares, client picks a coach by availability), team performance with 7/30/90-day numbers and the 48-hour unanswered
check-in flag, the weekly team digest and sub-coach AI workout drafts. Wave 7 adds sub-coach refund/pause/cancel buttons after the
owner's yes and COACH-PAY-FLIP. 14 of 19 are T4 (Claude Opus 5.5 builder + both lenses), 2 are T3, 3 are T2.

**PART B (additional ideas, optional, pitched separately): 7 ideas**, led by Cover mode (dated holiday cover with an honest client
notice), Roman handoff briefs when a client moves, team roles (a Lead coach between head coach and coach) and AI best-fit routing.

**Owner decisions: 12**, each with a default (section A8). The two that matter first: D1 one team model = overlay (the client stays
the head coach's client; the sub-coach is assigned), D3 the exact client-facing sentence for the team sharing rule.

---

# PART A. The owner's idea, exactly as stated, built to outstanding quality

## A1. The owner's words and what "done" means

- 13:36 (verbatim): "Coaches can have complete, amazing Sub-Coach logistics and TONS of optionality in running teams". "the best
  product for coaches and small teams of independent fitness leaders in the US market".
- 10-06 14:21 (SoT C1, A7.5 Stage 2): "he can now see his teams performance, handle how to route clients to coaches (round-table,
  set allotment, schedule based sign-up) - we can become the growth ladder for independent operations."
- 10-06 14:25: "make it free ... When they scale, our take-rate grows with them." (teams FREE; TGP earns the take rate, no seat fee)
- 10-07 20:54 item 10 / D10b (TEAM SHARING RULE): "giving permissions to a head coach or coach on a team gives default permissions for
  cross coach sharing when applicable" = a client's sharing grant to a head coach or to a coach on that team counts by default for
  the team's coaches who work with that client.
- 10-07 20:54 item 5 / D5 and decision 4: sub-coaches get refund/pause/cancel buttons (default: own clients only, same warning,
  head coach notified; before COACH-PAY-FLIP).
- 10-06 18:36: sub-coach Ask AI launch support moves to v1.1 (hidden for sub-coaches at launch, b#817 / 6e8616f5).
- A4 spec (roadmap/specs/A04-team-qa.md, "head coach and managerial stuff to be elite/world-class, mark this as important"):
  per-sub-coach metrics (check-in response time, programs updated in 7 days, a client signal, churn-risk count) in 7/30/90-day
  windows; 48-hour unanswered check-in flag; head coach read access to any team client's program; Monday 9 am weekly digest.
- AGENT_132_START_PROMPT.md:174: C4 team PRs TEAM-ROUTES-MODEL, TEAM-REVOKE-SCOPE, TEAM-UI, TEAM-INVITE-BE, TEAM-INVITE-M,
  TEAM-PHANTOM, with the sharing rule folded in; SUBCOACH-SCOPE-V1-132 (b#883) goes first.

"Done" = a head coach can, from the app alone: invite a coach (link or email), see them accept, assign and move clients, choose how
new clients are routed, see each coach's honest numbers, get a weekly summary, and remove a coach, with every client's data visible
only to the coaches who work with that client and only as far as the client shares; a sub-coach can accept from a link, see and
coach exactly their clients (logs included), use AI drafts and (after the owner's yes) money buttons; a client always knows who
coaches them and what that coach sees.

## A2. Inventory (from the code at cd0f90ed / a3a1c18e)

Production switches: no team switch exists (`rg -i '"[A-Z_]*(TEAM|SUB_COACH)' .github/fly-env-desired-state.json` = none).
Related: FEATURE_MWB_TEMPLATES "true" (:39), FEATURE_ROMAN_PLAYBOOK "true" (:53, head coach pool), FEATURE_COMMUNITY_CHALLENGES
"unset" (:28), LEADERBOARD_ENABLED ledger "not in clinic scope" (:183), FEATURE_COACH_PAYMENT_ACTIONS not set (header Q7).

| # | Piece | Status | Where (backend unless "m:") |
|---|---|---|---|
| 1 | Invite create (email, name, max clients) | built, API live, no app entry for a coach without a team | src/sub-coaches/sub-coaches.controller.ts:127; sub-coach-invite.service.ts:42-150; m: src/screens/coach/SubCoachInviteModal.tsx (Team tab only) |
| 2 | Invite email | not built; the app claims it | sub-coach-invite.service.ts:38-40 ("delegated to whatever mailer is wired in"; none); m: SubCoachInviteModal.tsx:206 "An invite link was emailed to"; src/email/email.service.ts exists (unused here) |
| 3 | Invite link landing (web and app) | not built | link = PUBLIC_INVITE_BASE_URL/sub-coach/<token> (sub-coach-invite.service.ts:730-735 per EXPLORE-SUBCOACH-129); src/invite-landing/invite-landing.controller.ts:30,44 only join/:code and invite/:code; m: src/navigation/RootNavigator.tsx:194,204 only join/:invite_code? and invite/accept/:token; src/lib/pendingInviteCode.ts stores "sub-coach" as a client code (EXPLORE R4) |
| 4 | Invite preview + accept API | built, no caller | sub-coach-invites-public.controller.ts:35 (GET by-token); sub-coaches.controller.ts:155 (POST accept) |
| 5 | Accept writes membership | partly: seat row yes, sub-coach's coach_id no | sub-coach-invite.service.ts:227-450 (seat :424-445); scope needs coach_id = head (src/sub-coach/sub-coach-scope.service.ts:59-86) |
| 6 | One team model, one handler per path | not: two controllers on /sub-coaches; the legacy one wins | src/sub-coach/sub-coach.controller.ts:45 (registered first via src/coach/coach.module.ts:25,72) and src/sub-coaches/sub-coaches.controller.ts:43; overlay model in src/sub-coach/*, "move coach_id" model in sub-coaches.service.ts:195-300 (:277) |
| 7 | Reassign a client | broken (always 400) | m: src/api/subCoachApi.ts:117 posts {clientId, reason}; legacy ReassignClientDto needs targetSubCoachId + idempotency_key (src/sub-coach/dto/sub-coach.dto.ts:35-52), whitelist pipe (AUD-ORG-129 P2) |
| 8 | Remove a sub-coach | built, wrong | sub-coach-invite.service.ts:668-700 moves every student with coach_id = sub-coach (their own clients too) to the head coach; open SubCoachAssignment rows are never closed |
| 9 | Sub-coach sees only assigned clients | built (scope); fixes merged/in flight | SubCoachScopeService; b#878 (0a672712, coach.service.ts); b#883 (v1-coach.service.ts:390,467,548,604) dual APPROVE, CI waits on AUDIT-FIX-132 |
| 10 | Sub-coach keeps their own clients in view | not built | v1-coach.service.ts:66-71 scope for a sub-coach = assigned ids only |
| 11 | Team sharing rule (D10b) | not built; readers disagree | Command Center reads the head coach's grant (src/coach/command-center/command-center.service.ts:225-235); briefs, Coach AI, churn read the caller's (src/consent/coach-sharing-gate.ts:14-24; src/coach/brief/coach-brief.service.ts:922, :2050; src/ai/coach/coach-ai.service.ts:126, :453; churn-intervention.service.ts:206, :346, :422); roster (src/coach/coach.service.ts:327); grant key (client, coach, scope): src/consent/consent.service.ts:316-381 |
| 12 | Team entitlement (free) | not built | m: TeamManagementScreen.tsx:35-63, :154 "Scale plan required" (plan_tier never in /auth/me: AUD-ORG-129 R3-A; list shape crash R3-C) |
| 13 | Team tab placement | built, gated on an existing sub-coach | m: src/navigation/CoachNavigator.tsx:683-684, :766-768; src/hooks/useCoachRoleType.ts (hasSubCoaches) |
| 14 | Paid Team Mode seats (Stripe line on Pro) | built but off (no Pro/Enterprise price), contradicts "teams free"; seats a coach without their consent | src/team-mode/team-mode.controller.ts:61-101; team-mode.service.ts:70-200; tier-resolver.service.ts:37-64 |
| 15 | Phantom sub-coach (promotion keeps coach_id) | open | src/admin/admin.service.ts setRole (:184 area); src/auth/auth.service.ts becomeCoach (AUD-ORG-129 C2) |
| 16 | RLS helper app.is_subcoach_on_coach_team | bare rule (no membership) | prisma/migrations/20261215000000_mwb_1_data_model:197-213; src/sub-coach/README.md "documented follow-up" |
| 17 | Team performance | partly: opaque 0-100 engagement score, two analytics services | src/sub-coach/sub-coach-analytics.service.ts (formula in src/sub-coach/README.md), src/sub-coaches/sub-coach-analytics.service.ts; A4 metrics, windows and 48 h flag not built |
| 18 | Client routing (take turns, set shares, client picks) | not built (stub) | src/gym/gym-distribution.service.ts:1-25 (comments only); attach writer attachUserToCoachByCode (src/invite-codes/invite-codes.service.ts) |
| 19 | Capacity per coach | partly: plan-tier caps (meaningless with free teams) vs the invite's max_clients | src/sub-coach/sub-coach-capacity.service.ts:11, :139-141 (flat_300, 50); sub-coaches.dto.ts:25-29 |
| 20 | Team audit log | built, no app surface | prisma/schema.prisma:3361 TeamAuditEvent; GET /team/audit-events (team-mode.controller.ts:101) |
| 21 | Business profile | built and on | m: CoachTeamProfileScreen.tsx, settings/BillingSection.tsx (m#574 merged 13:4x) |
| 22 | Head coach 5 percent split per sub-coach | built, UI unreachable | src/team/team.controller.ts:92,114; team.service.ts:219-324; m: src/screens/coach/TeamMembersScreen.tsx (in no navigator) |
| 23 | Sub-coach AI workout drafts | built, hidden for sub-coaches | 6e8616f5: src/ai/gateway/ai-gateway.service.ts, src/ai/gateway/workout-builder/workout-builder-sub-coach.gate.ts, workout-builder-status.controller.ts |
| 24 | Sub-coach money buttons (D5) | not built | FEATURE_COACH_PAYMENT_ACTIONS off; feature-flags.service.ts:79 coach_payment_actions |
| 25 | Team AI pool, fee split, brief modes | built and consistent | AUD-ORG-129 "checked": coach-ai-budget.service.ts:98-127, fee-policy.service.ts:86-96, coach-brief.service.ts:791-802 |
| 26 | Client sees who coaches them | partly: always the head coach | v1-coach.service.ts:79-84 (threads in the head coach's namespace); m: ProfileScreen.tsx:91-154 reads /v1/clients/me/coach + /consent/me |
| 27 | Hire coaches from TGP (talent marketplace) | backend built, no coach app surface | src/talent-marketplace/*; m: only screens/applicant/ApplicationStatusScreen.tsx (PART B) |

## A3. Pathway placement (before and after; taps from the coach home = Clients tab, client home = Today)

Rule 6 (_COMMON_131.md:301-303): no pathway or function cut; every PR body carries "Routes/actions before -> after" and a parity test.

| Who | Piece | Before (a3a1c18e) | After | Taps | Replaces |
|---|---|---|---|---|---|
| Head coach, no team | Start a team | none (Team tab absent; invite only inside it) | Settings tab > Business profile > "Team" row > TeamManagement empty state, one forest action "Invite a coach" (TEAMS-UI) | 3 | nothing removed; Business profile keeps every m#574 row (name, invite link, Money, Invite codes, Get paid) |
| Head coach, team | Team home | Team tab (only with a sub-coach; shows the plan gate) | Team tab when FEATURE_TEAMS on and the coach is not a sub-coach and has a seat or a pending invite; roster rows + "Invite a coach" + "Routing" text action | 1 | the "Scale plan required" gate (rule 1: false claim) |
| Head coach | Invite | Team tab > Invite sheet, says "was emailed" | same sheet; "Share link" (share sheet) always; "Email invite" only when the server reports the email sent | 2 | the false "was emailed" line |
| Invitee | Accept | link opens nothing (web 404, app default screen) | web /join/sub-coach/<token> page (who invited, Open in the app, store buttons, QR on desktop) > app AcceptTeamInvite > "Join team" | link + 1 | the 404 |
| Head coach | Coach detail | Team tab > row > SubCoachDetail (0-100 score, all of that coach's clients) | same route; honest numbers (7/30/90), only clients the head coach assigned, "Move" per client, muted "Remove from team" | 2 | the opaque score; the sub-coach's private clients list (K2) |
| Head coach | Move a client | SubCoachDetail > client > ClientReassign (always 400; head coach missing) | same route; "Back to you" first, then team coaches with capacity in words | 3 | "No other coaches available" dead end; the capacity catch-all error |
| Head coach | Routing | none | Team tab > "Routing" > TeamRouting (Manual / Take turns / Set shares / Client picks; per-coach share, pause, max clients) | 2 | gym-distribution stub |
| Head coach | Team clients | Clients tab lists every client, no coach shown | Clients tab rows carry the assigned coach as a muted overline; filter "Coach: Everyone / name" (head coach with a team only) | 0-1 | nothing |
| Head coach | Weekly digest | none | top of the Team tab: "This week" one-paragraph summary (Monday) + "See last week" | 1 | nothing |
| Sub-coach | Their clients | Clients tab (assigned only; own clients vanish once on a team) | Clients tab: own clients + "Team clients" section (hairline + overline) | 0 | nothing |
| Sub-coach | Leave a team | none | Settings tab > Business profile > "You coach on <name>'s team" > "Leave team" (muted) | 3 | nothing |
| Sub-coach | AI workout draft | entry hidden for sub-coaches | same entry as head coaches (Client detail > AI draft) for assigned clients | as head coach | the hide |
| Client | Who coaches them, what that coach sees | More > Profile sentence names the head coach only | More > Profile and More > Settings > Trust Center name the coach who works with them and the sharing rule | 2 / 3 | the head-coach-only sentence |
| New client of a team | Pick a coach | none | join code / link > "Choose your coach" step (first name, one-line focus, next open time) > continue (only when the head coach picked "Client picks") | +1 in the join flow | nothing |
| Buyer (web) | Pick a coach on checkout | none | follows the FUNNEL plan's landing > info > account > checkout flow; the coach step plugs in after "account" (owner decision D8) | +1 | nothing |

Coach Brief head-coach items keep deep_link strings tgp://team/sub-coaches and tgp://command-center/team (EXPLORE item 5): TEAMS-UI
adds the linking entries so they resolve to the Team tab (no dead strings).

## A4. Design rules every PR follows (owner 13:45: luxurious, simple, mentally deloading and calm)

Sources: mobile docs/QUIET_LUXURY_DOCTRINE.md (QLD 1-9), src/theme/README.md, docs/HAPTICS.md, docs/SKELETON_LOADERS.md,
docs/dark-mode.md, docs/charting.md, docs/share-card.md, ENGINEERING_RULES.md (ER 1-11), _COMMON_131 mobile redo rules 1-8.

- Every mobile PR: QLD 1 (tokens.ts type: Cormorant Garamond <= 500 for the title and one hero, Inter for everything tapped),
  QLD 2 (no placeholder, "coming soon" or fake numbers: an empty team says what is true and offers "Invite a coach"), QLD 3-4 (no
  celebration on accept, no exclamation marks, no emoji, no hype; plain sentences), QLD 5 (radius 4, bone page, forest single accent,
  shadows <= lg, motion from motion.duration), QLD 6 (no FAB or banner: "Invite a coach" is the one forest primary action), QLD 8
  (screen README row, navigation README when a route changes), QLD 9 checklist pasted in the PR body; redo rules 1 (state-driven
  honest copy, each variant tested), 2 (no dead buttons), 3 (hairline rows, small-caps overlines, tabular numerals, 44 pt targets),
  5 (one primary action per screen), 6 (before -> after table + parity test), 7 (useTheme semantic tokens only, docs/dark-mode.md).
- Loading: SkeletonClientCard rows for the roster and coach detail (SKELETON_LOADERS.md), QuietLoading/QuietError with "Try again"
  (QLD 8 table), errors through errorMessage() preferring response.data.message (ER 3).
- Haptics: HapticPressable on "Invite a coach", "Join team", "Save" (routing), "Move"; respects the haptics preference (HAPTICS.md).
- Numbers: monochrome TgpSparkline for the 7/30/90 trend, theme colours only, no red for "behind": say it in words (charting.md
  theming rules; redo rule 3). No share card in PART A (share-card.md is for client milestones).
- Backend: ER 1 (explicit tenant WHERE in every service method, dedicated guard files, HeadCoachOnlyGuard / NoActiveSubCoachGuard on
  team structure, billing, packages, revenue sharing; 404 for foreign ids), ER 2 (RLS enabled and forced in the same migration,
  owner bypass + tenant SELECT; append-only migrations), ER 3 (402/403/404/409/410 semantics), ER 6 (new env vars in env-validation),
  ER 9 (money writes idempotent and transactional), ER 10 checklist in the PR body.
- Web pages (invite landing): same doctrine: bone page, one Cormorant line, one forest button, no photos, no exclamation marks.

## A5. Rivals and how TGP becomes superior (not a prettier copy)

| Rival | What it does well | Where it falls short | TGP's superior answer (PR) |
|---|---|---|---|
| ABC Trainerize | Five staff roles with set permissions ([Trainerize permissions](https://help.trainerize.com/hc/en-us/articles/360000695586-Trainer-Manager-and-Staff-Permissions)); prompts the owner to reassign a removed trainer's clients ([managing trainers](https://help.trainerize.com/hc/en-us/articles/208689076-How-To-Manage-Trainers-On-Your-Account)) | One trainer per client; several coaches on one client only through a group chat ([multiple trainers](https://help.trainerize.com/hc/en-us/articles/23332207757332-Can-I-Assign-a-Client-to-Multiple-Trainers)); multi-trainer accounts sit on the paid Studio plan, billed per active client (per [Dupple's Trainerize review](https://dupple.com/reviews/trainerize)); the help pages describe no automatic routing of new clients | Overlay model: the head coach always keeps the client and the assigned coach works it, so coaching two-deep needs no group chat (ROUTES-MODEL); routing built in (ROUTING); free (SWITCH) |
| Everfit | Admin and Trainer roles ([Everfit team basics](https://help.everfit.io/en/articles/3013102-team-basics)); per-client extra teammates ([sub-coach permission](https://help.everfit.io/en/articles/6809708-permission-settings-add-a-sub-coach-to-manage-your-client)); teammate access to payment packages ([payment packages](https://help.everfit.io/en/articles/5716600-teammate-access-for-payment-packages)); multi-coach booking for owners and admins ([multi-coach booking](https://help.everfit.io/en/articles/15930159-owners-admins-manage-multi-coach-booking)) | A transfer can cut the previous coach off from the client's data ([client transfer](https://help.everfit.io/en/articles/3753878-transfer-a-client-within-a-workspace)); the transfer article describes coach-side steps only, nothing the client is told | The client's own sharing switches govern every team coach, and the client is told in plain words who coaches them and what that coach sees (SHARE-RULE, SHARE-COPY-M); moves never lose history (overlay) |
| TrueCoach | Unlimited coaches on a team account at no extra cost; admin privileges toggle; coaches message only assigned clients ([TrueCoach team accounts](https://help.truecoach.co/en/articles/2403964-team-accounts)) | The subscription is billed on the team's total client count, and the article describes no routing of new clients or per-coach performance view (same page) | Free teams with TGP paid by take rate only (owner 10-06 14:25); honest per-coach numbers with 7/30/90 windows and a 48-hour unanswered flag (PERF, PERF-M); routing (ROUTING) |
| TrainHeroic | Coach and team programming | Charges per assistant coach (9.99 USD per month, per [Coachbox's comparison](https://coachbox.app/en/compare/truecoach-vs-trainheroic)) | No seat fee at any size (SWITCH retires the paid Team Mode path) |
| Calendly (outside fitness) | Round robin by availability, equal distribution or priority; routing forms send people to the right host ([Calendly team scheduling](https://calendly.com/blog/team-scheduling-options), [routing forms](https://calendly.com/blog/routing-forms)) | Routes a meeting, not a client relationship; round robin and routing forms are Teams-plan features ([Calendly community](https://community.calendly.com/how-do-i-40/one-link-for-all-team-members-3085)) | Routing assigns the coaching relationship itself, respects each coach's capacity and pause, and the "Client picks" mode shows real open times from TGP scheduling (ROUTING, PICK-COACH) |

Post-AI proposition (SoT A7.5: "AI-native, not AI-added ... AI drafts give one coach the leverage of a team, then a team the
leverage of a gym"): in PART A the AI pieces are the weekly team digest (DIGEST, head coach pool, cheap model, template fallback)
and sub-coach AI workout drafts (SUB-AI). PART B carries the larger AI-native pitches (handoff briefs, method consistency, best-fit
routing), kept out of PART A as the addendum requires.

## A6. The PR plan

Tier per SoT A3 (TGP_SOURCE_OF_TRUTH.md:343, :722): T4 = Claude Opus 5.5 builder + both lenses; T3 = Opus builder, both lenses;
T2 = GPT-6.1 Sol builder. Sizes include tests; each under 800 changed lines. "Switch" = the off-by-default switch it rides.

| # | ID | Repo | Tier | Goal (plain words) | Switch | Size | Depends on |
|---|---|---|---|---|---|---:|---|
| 1 | TEAMS-SWITCH-132 | b | T4 config + money path | Declares the three team switches (off); teams are free for every coach who is not a sub-coach; the paid Team Mode seat routes stop (no Stripe call); invite routes answer 404 teams_disabled while off | declares FEATURE_TEAMS, FEATURE_TEAM_ROUTING, FEATURE_TEAM_DIGEST | ~350 | FLAG-TOOL-132 (b#884) and ROMAN-GATES-132 merged (same 4 config files) |
| 2 | TEAMS-PHANTOM-132 | b | T4 auth | A client promoted to coach no longer keeps a hidden link to their old coach | none | ~120 | none |
| 3 | TEAMS-ROUTES-MODEL-132 | b | T4 tenancy | One handler per team path; one model (overlay: the client stays the head coach's, the sub-coach is assigned); accepting an invite makes the person a team coach; a sub-coach keeps their own clients in view | FEATURE_TEAMS (guard from #1) | ~600 | b#883 merged; #1 merged |
| 4 | TEAMS-REVOKE-SCOPE-132 | b | T4 tenancy/PII | Removing (or leaving) keeps a coach's own clients with them, returns assigned clients to the head coach and ends access at once; the head coach sees only the clients they assigned; the database helper uses the membership rule; a full scope table across messages, broadcasts, plans, food, workouts, bookings, packages, codes, AI drafts | FEATURE_TEAMS | ~650 | #3 |
| 5 | TEAMS-SHARE-RULE-132 | b | T4 PII/health | The owner's team rule: what a client shares with the head coach also reaches the team coach assigned to them (and the head coach for clients they assigned), read at the moment of each read, so turning a switch off turns it off for the whole team; one helper for every coach-side reader (ends the Command Center vs briefs/Coach AI mismatch); join notice v2 names the team | FEATURE_TEAMS (rule applies only to real team links, none exist while off) | ~600 | #3; b#886 CHURN-LABELS merged (command-center.service.ts) |
| 6 | TEAMS-UI-132 | m | T2 | Team screens work: Team row in Business profile, Team tab rule (switch on, not a sub-coach, seat or pending invite), no plan gate, list parsed, reassign with "Back to you", honest errors and removal copy, honest invite copy, brief deep links resolve | reads `teams` from /me/feature-flags | ~600 | #1, #3 merged; m#573 merged (src/screens/coach/README.md) |
| 7 | TEAMS-INVITE-M-132 | m | T4 auth | The invite link opens an accept screen; sign in or create the coach account first, then come back; never stored as a client code; email mismatch says what to do | server-driven (404 teams_disabled = "This invite is not active.") | ~550 | #3; #6 merged (src/navigation/README.md) |
| 8 | TEAMS-INVITE-BE-132 | b | T3 | The web page for the invite link (who invited you, open the app, store buttons, QR on desktop); the invite email goes out through the existing email service when it is configured | FEATURE_TEAMS | ~350 | #4 merged (sub-coach-invite.service.ts) |
| 9 | TEAMS-ROUTING-132 | b | T4 tenancy + migration | New clients of a head coach are routed by the head coach's rule: Manual, Take turns, Set shares (furthest below target), skipping paused or full coaches, falling back to the head coach; every routing written to the team audit log | FEATURE_TEAM_ROUTING | ~750 | #4; not in flight with ROMAN-ACTIONS-132 / ROMAN-OUTREACH-132 (schema, manifest) or a FUNNEL PR on invite-codes.service.ts |
| 10 | TEAMS-PERF-132 | b | T4 PII/health (aggregates) | One analytics service: per coach, 7/30/90 days: median check-in reply time, clients with a program change in 7 days, clients who logged this week (shared logs only), churn-risk count from the churn engine, check-ins unanswered over 48 h; roster rows carry the assigned coach | FEATURE_TEAMS | ~550 | #4, #5 |
| 11 | TEAMS-SHARE-COPY-M-132 | m | T4 consent copy | Client Profile and Trust Center say who coaches them on the team and that this coach sees what they share with the head coach; switches unchanged | none (copy follows /v1/clients/me/coach) | ~300 | #5 |
| 12 | TEAMS-SUB-AI-132 | b | T4 egress/tenancy | Sub-coaches get AI workout drafts for their assigned clients, drafts they can decide, billed to the head coach's pool | FEATURE_TEAMS | ~400 | #4, #5 (coach-ai.service.ts) |
| 13 | TEAMS-PERF-M-132 | m | T2 | Team tab rows and coach detail show the honest numbers (7/30/90 toggle, sparkline, words not colours), the 48 h unanswered list opens the client; Clients tab shows the assigned coach and a coach filter | none | ~550 | #6, #10 |
| 14 | TEAMS-PICK-COACH-132 | b | T4 tenancy | "Client picks": a public list of the team's coaches (first name, one-line focus, next open time from TGP scheduling) for a join code, and the join accepts the chosen coach after server checks | FEATURE_TEAM_ROUTING | ~450 | #9 |
| 15 | TEAMS-DIGEST-132 | b | T4 egress/spend | Monday 9 am local: a short team summary for the head coach from the PERF numbers, cheap model, head coach pool inside the existing background ceiling, retry-safe, template fallback, no client logs beyond counts | FEATURE_TEAM_DIGEST | ~650 | #10; not in flight with Roman schema PRs |
| 16 | TEAMS-ROUTING-M-132 | m | T2 | Team > Routing screen: choose the rule, set shares, pause a coach, max clients, one Save | none (shows only when /me/feature-flags says team_routing) | ~500 | #9, #13 |
| 17 | TEAMS-PICK-COACH-M-132 | m | T3 | "Choose your coach" step inside the existing join-code screen when the team uses Client picks | none (server-driven) | ~450 | #14, #7 |
| 18 | TEAMS-MONEY-132 | b | T4 money | Sub-coach refund/pause/cancel for their assigned clients, same full-refund warning, head coach notified on every action | FEATURE_COACH_PAYMENT_ACTIONS (existing) | ~500 | owner yes on D9; COACH-PAY-FLIP; #4 |
| 19 | TEAMS-MONEY-M-132 | m | T4 money | The same buttons on the sub-coach's client payments screen with the same copy | coach_payment_actions (existing key) | ~400 | #18 |

Failing-first tests (each PR's first commit, failing on main): #1 test/teams-switch-132.spec.ts (readers off for unset/''/'1', on
for 'true'; POST /team/sub-coaches answers 410 without a Stripe call; invite routes 404 while off; desired state "unset");
#2 admin/auth specs (promotion clears coach_id); #3 test/sub-coach-routes-132.spec.ts (one handler per path, GET /sub-coaches
returns an array, mobile reassign body accepted) + test/sub-coach-model-132.spec.ts (accept -> scope.isSubCoach true; reassign
leaves client.coach_id = head and opens one delegation; a sub-coach still lists own clients); #4 test/sub-coach-revoke-132.spec.ts
(own clients stay, delegations close, removed coach reads and messages nothing; detail hides private clients) + RLS migration spec;
#5 test/team-sharing-rule-132.spec.ts (assigned sub-coach reads a log the client shares with the head coach; off with the head coach
= off for the sub-coach in every reader: roster, Command Center, brief, Coach AI insight, churn; unassigned team coach reads
nothing; owner bypass unchanged); #6/#13/#16 render tests per state + parity tests; #7 linking test (join/sub-coach/<token> opens
AcceptTeamInvite, pendingInviteCode never stores it); #8 page + email tests; #9 routing spec (sequence for take turns; shares
converge; paused/full skipped; fallback; idempotent on retry); #10 metrics fixtures per window; #11 copy variants; #12 gate spec
(sub-coach draft allowed for assigned, 404 for others); #14 public list hides everything but first name, focus line, next time;
#15 digest idempotency + fallback; #17 join step test; #18/#19 money specs (own assigned clients only, head coach notified).

### Waves (no two PRs in flight share a file)

| Wave | Starts when | PRs | Files (exclusive inside the wave) |
|---|---|---|---|
| 0 | now | (prerequisites, not this plan) | b#887 AUDIT-FIX, b#883 SUBCOACH-SCOPE-V1, b#884 FLAG-TOOL, b#886 CHURN-LABELS, ROMAN-GATES-132 merge |
| 1 | b#884 + ROMAN-GATES-132 merged (#1); now (#2) | 1, 2 | 1: src/common/env-validation.ts, .github/fly-env-desired-state.json, docs/runbooks/launch-flags.md, .env.example, NEW src/sub-coaches/teams.feature.ts, NEW src/sub-coaches/teams-enabled.guard.ts, src/feature-flags/feature-flags.service.ts + feature-flags.dto.ts, src/team-mode/team-mode.controller.ts, team-mode.service.ts, team-mode.module.ts, src/team-mode/README.md, NEW test/teams-switch-132.spec.ts. 2: src/admin/admin.service.ts, src/auth/auth.service.ts (becomeCoach only), their two specs |
| 2 | 1 merged, b#883 merged | 3 | src/sub-coach/sub-coach.controller.ts (retired), sub-coach.module.ts, dto/sub-coach.dto.ts, sub-coach-scope.service.ts, sub-coach-reassign.service.ts, sub-coach-capacity.service.ts, src/sub-coach/README.md, src/sub-coaches/sub-coaches.controller.ts, sub-coach-invites-public.controller.ts, sub-coaches.service.ts (list, reassignClient), sub-coach-invite.service.ts (accept), src/v1/v1-coach.service.ts (clientScope :59-72 only), 2 NEW specs |
| 3 | 3 merged (5 also after b#886; 6 also after m#573) | 4, 5, 6 | 4: sub-coach-invite.service.ts (revoke), sub-coaches.service.ts (detail), sub-coaches.controller.ts (POST /sub-coaches/me/leave), NEW prisma/migrations/<ts>_team_membership_rls/migration.sql, 2 NEW specs. 5: src/consent/consent.service.ts, coach-sharing-gate.ts, coach-sharing-notice.ts (v2 text), NEW src/consent/team-sharing.ts, src/consent/README.md, src/coach/coach.service.ts (:315-340), src/coach/brief/coach-brief.service.ts (:2046-2056), src/ai/coach/coach-ai.service.ts (:445-457), src/coach/command-center/command-center.service.ts (:225-242), NEW spec. 6 (m): TeamManagementScreen.tsx, SubCoachDetailScreen.tsx, ClientReassignModal.tsx, SubCoachInviteModal.tsx, CoachTeamProfileScreen.tsx, src/hooks/useCoachRoleType.ts, src/navigation/CoachNavigator.tsx, src/api/subCoachApi.ts, src/api/featureFlagsApi.ts, src/screens/coach/README.md, src/navigation/README.md, tests |
| 4 | 4 merged (8, 9, 10, 12); 5 merged (10, 11, 12); 6 merged (7) | 7, 8, 9, 10, 11, 12 | 7 (m): NEW src/screens/auth/AcceptTeamInviteScreen.tsx, src/navigation/RootNavigator.tsx, src/navigation/README.md, src/lib/pendingInviteCode.ts, NEW src/api/teamInviteApi.ts, src/screens/auth/README.md, tests. 8: src/invite-landing/invite-landing.controller.ts, NEW src/invite-landing/team-invite-page.html.ts, src/invite-landing/README.md, sub-coach-invite.service.ts (invite() email), src/email/templates (one NEW template), tests. 9: prisma/schema.prisma (+2 models), NEW migration with RLS, NEW src/team-routing/* (service, controller GET/PUT /coach/team/routing, module), src/app.module.ts, src/invite-codes/invite-codes.service.ts (one call in attachUserToCoachByCode), src/account-deletion/account-deletion.manifest.ts, src/gym/gym-distribution.service.ts (deleted), tests. 10: src/sub-coaches/sub-coach-analytics.service.ts, src/sub-coach/sub-coach-analytics.service.ts (deleted), sub-coaches.service.ts (list/detail metrics), sub-coaches.controller.ts (analytics ?window=), src/coach/coach.service.ts (roster assigned_coach), tests. 11 (m): src/screens/client/ProfileScreen.tsx (:85-160), src/screens/trustCenterSharing.ts, src/screens/client/README.md, tests. 12: src/ai/gateway/ai-gateway.service.ts, src/ai/gateway/workout-builder/workout-builder-sub-coach.gate.ts, workout-builder-status.controller.ts, src/ai/coach/coach-ai.service.ts (draft decide for the assigned coach), tests |
| 5 | 10 merged (13, 15); 9 merged (14) | 13, 14, 15 | 13 (m): TeamManagementScreen.tsx, SubCoachDetailScreen.tsx, src/api/subCoachApi.ts, src/screens/coach/ClientsListScreen.tsx (overline + filter), src/screens/coach/README.md, tests. 14: src/team-routing/* , NEW src/team-routing/team-routing-public.controller.ts, src/invite-codes/invite-codes.service.ts (chosen coach), tests. 15: prisma/schema.prisma (+TeamWeeklyDigest), NEW migration with RLS, NEW src/team-digest/*, src/app.module.ts, account-deletion manifest, data-export (head coach's own digests), tests |
| 6 | 9 + 13 merged (16); 14 + 7 merged (17) | 16, 17 | 16 (m): NEW src/screens/coach/TeamRoutingScreen.tsx, CoachNavigator.tsx (TeamStack route), TeamManagementScreen.tsx (Routing row), NEW src/api/teamRoutingApi.ts, coach + navigation READMEs, tests. 17 (m): the join-code screen in src/screens/auth (builder confirms which: RoleSelectionScreen.tsx or CreateAccountScreen.tsx), src/screens/auth/README.md, tests |
| 7 | owner yes on D9 + COACH-PAY-FLIP merged | 18, then 19 | 18: coach client payments service (src/checkout/coach-client-payments.service.ts) + guard + notification to the head coach, tests. 19 (m): ClientPaymentsScreen + clientPaymentsCopy, coach README, tests |

PRs 14 and 15 share no file (14: team-routing + invite-codes; 15: schema + team-digest + app.module); PRs 9 and 15 are in
different waves because both edit prisma/schema.prisma, the manifest and app.module.ts.

Overlap check (board 13:41 + V11_PLAN_132.md waves): b#883 (v1-coach.service.ts) must merge before #3 (which edits clientScope);
b#886 (command-center.service.ts, churn-intervention.service.ts) before #5; b#884 and ROMAN-GATES-132 (env-validation.ts,
desired state, launch-flags.md, .env.example) before #1; m#573 (src/screens/coach/README.md) before #6; Roman ROMAN-ACTIONS-132 and
ROMAN-OUTREACH-132 (prisma/schema.prisma, account-deletion manifest, data-export, app.module/roman.module) never in flight with #9
or #15. Cross-plan overlaps (the other V11 plans in /home/user/workspace/ops, read 14:09): one PR per shared file in flight; the first READY
merges first and the other runs `git merge origin/main` before opening.
- Config (env-validation.ts, desired state, launch-flags.md, .env.example): TEAMS-SWITCH-132 with ROMAN-GATES-132, FUNNEL-GATES-132,
  CHURN-STATE-132, REFERRAL-SCHEMA-132.
- prisma/schema.prisma, account-deletion manifest, data-export, app.module.ts: TEAMS-ROUTING-132 and TEAMS-DIGEST-132 with
  ROMAN-ACTIONS-132, CHURN-STATE-132, REFERRAL-SCHEMA-132, CLIENT-REFERRAL-132, REFERRAL-CLAIM-132, REFERRAL-OPS-132.
- src/invite-codes/invite-codes.service.ts: TEAMS-ROUTING-132 and TEAMS-PICK-COACH-132 with CLIENT-REFERRAL-132 (and any FUNNEL
  attach change).
- command-center.service.ts, coach.service.ts: TEAMS-SHARE-RULE-132 and TEAMS-PERF-132 with CHURN-ALERTS-132, CHURN-LISTS-132,
  CHURN-NEEDSYOU-132. Default: TEAMS-SHARE-RULE-132 first (privacy fix, small edit at command-center.service.ts:225-242).
- Mobile CoachNavigator.tsx: TEAMS-UI-132 and TEAMS-ROUTING-M-132 with CHURN-M-RETIRE-132, FUNNEL-EDITOR-M-132,
  REFERRAL-SCREEN-M-132, CHALLENGE-COACH-M-132, ROMAN-SAW-M-132 and the IMPORTER plan's mobile PR.
- Mobile ClientsListScreen.tsx: TEAMS-PERF-M-132 with CHALLENGE-COACH-M-132, ROMAN-SAW-M-132 and the CHURN plan's list change.
- Mobile RootNavigator.tsx and src/lib/pendingInviteCode.ts: TEAMS-INVITE-M-132 with REFERRAL-LINK-M-132, CLIENT-REFERRAL-132 and
  the FUNNEL plan's linking change. Default: REFERRAL-LINK-M-132 and TEAMS-INVITE-M-132 never in flight together.

## A7. Ready-to-paste JOBS132 entries

```
## TEAMS-SWITCH-132 (builder T1, Claude Opus 5.5, backend, T4 config + money path; one PR; time box 75 minutes)
Worktree /home/user/workspace/wt/TEAMS-SWITCH-132-backend, branch agent132/teams-switch-132 (off backend main). LEFTHOOK=0.
Waits for FLAG-TOOL-132 (b#884) and ROMAN-GATES-132 to merge (same config files): build now, `git merge origin/main`, then open.
PR 1 of /home/user/workspace/ops/V11_TEAMS_PLAN_132.md (section A6). Readers in NEW src/sub-coaches/teams.feature.ts, same shape as
src/roman/tools/roman-tools.feature.ts (only 'true' is on): isTeamsEnabled (FEATURE_TEAMS), isTeamRoutingEnabled
(FEATURE_TEAM_ROUTING), isTeamDigestEnabled (FEATURE_TEAM_DIGEST). NEW src/sub-coaches/teams-enabled.guard.ts (404
{kind:'teams_disabled'} while off), not applied yet (TEAMS-ROUTES-MODEL-132 applies it). ENV rules in src/common/env-validation.ts,
"unset" rows + notes in .github/fly-env-desired-state.json ("off until both lenses and the owner say yes; emergency kill: unset"),
docs/runbooks/launch-flags.md, .env.example. GET /me/feature-flags gains `teams` and `team_routing` (coach and owner only;
src/feature-flags/feature-flags.service.ts:73-79 pattern + dto key list). Teams are free (owner 10-06 14:25): POST and DELETE
/team/sub-coaches answer 410 {kind:'team_mode_retired'} before any Stripe call (src/team-mode/team-mode.controller.ts:61-100);
GET /team/audit-events stays. Failing-first: NEW test/teams-switch-132.spec.ts; test/ci/fly-env-manifest.spec.ts passes. Under 400
lines. Title "feat(teams): team switches (all off) and free teams: retire the paid seat path (T4)". READY. End.

## TEAMS-PHANTOM-132 (builder T2, Claude Opus 5.5, backend, T4 auth; one PR; time box 45 minutes)
Worktree /home/user/workspace/wt/TEAMS-PHANTOM-132-backend, branch agent132/teams-phantom-132 (off backend main). LEFTHOOK=0. Start now.
A client promoted to coach keeps coach_id (AUD-ORG-129 C2): clear coach_id on promotion in src/admin/admin.service.ts setRole and in
src/auth/auth.service.ts becomeCoach (gated off today; same rule). Check the board for open auth.service.ts PRs first. Failing-first:
the two existing specs gain "promotion clears coach_id". Under 150 lines. Title "fix(teams): a promoted coach keeps no link to their
old coach (T4)". READY. End.

## TEAMS-ROUTES-MODEL-132 (builder T3, Claude Opus 5.5, backend, T4 tenancy; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/TEAMS-ROUTES-MODEL-132-backend, branch agent132/teams-routes-model-132. LEFTHOOK=0.
Waits for b#883 (SUBCOACH-SCOPE-V1-132) and TEAMS-SWITCH-132 to merge: trace and write the failing tests now.
Owner D1 default (overlay): User.coach_id of a client always = head coach; delegation = open SubCoachAssignment. (1) One handler per
/sub-coaches path: retire src/sub-coach/sub-coach.controller.ts (registered first through src/coach/coach.module.ts:72, so it
shadows src/sub-coaches/sub-coaches.controller.ts:43); move POST :id/assign-client into SubCoachesController; keep the src/sub-coach
services. (2) reassignClient (src/sub-coaches/sub-coaches.service.ts:195-300) goes through SubCoachReassignService (overlay,
idempotent, capacity = the invite's max_clients, not plan tier: sub-coach-capacity.service.ts:139-141); accepts the mobile body
{clientId, reason} (src/api/subCoachApi.ts:117) and "back to the head coach" (close the delegation). (3) accept
(sub-coach-invite.service.ts:227-450) sets the sub-coach's User.coach_id = head inside the same transaction as the seat. (4) A
sub-coach's scope = own clients (coach_id = self) plus open delegations (sub-coach-scope.service.ts getAuthorizedClientIds;
v1-coach.service.ts:59-72 clientScope keeps the b#883 AND shape). (5) Apply TeamsEnabledGuard to invite create, accept and by-token. (6) GET /sub-coaches also returns the head coach's pending invites
{id, email, sent_at, expires_at} (the Team tab mounts on a seat or a pending invite; Reissue uses POST invites/:id/reissue).
Failing-first: NEW test/sub-coach-routes-132.spec.ts and test/sub-coach-model-132.spec.ts (fail on main). Under 650 lines. PR body:
route table before -> after. Title "fix(teams): one team model and one handler per path (T4)". READY. End.

## TEAMS-REVOKE-SCOPE-132 (builder T4, Claude Opus 5.5, backend, T4 tenancy/PII; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/TEAMS-REVOKE-SCOPE-132-backend, branch agent132/teams-revoke-scope-132. LEFTHOOK=0.
Waits for TEAMS-ROUTES-MODEL-132 to merge. Owner D2 default: revoke (sub-coach-invite.service.ts:595-726) never moves the coach's
own clients (:668-700 today moves every student with coach_id = sub-coach); it closes every open delegation from that head (the
clients return to the head coach), archives the seat, clears the coach's coach_id and writes TeamAuditEvent rows. NEW POST
/sub-coaches/me/leave (same effects, NoActiveSubCoachGuard inverse: sub-coach only). detail (sub-coaches.service.ts:115-140) lists
only delegated clients (never the sub-coach's own: AUD K2). NEW append-only migration: app.is_subcoach_on_coach_team uses the
membership rule (seat or open delegation), RLS unchanged elsewhere. Scope table in the PR body for messages, broadcasts, plans,
food, workouts, bookings, packages, codes, AI drafts, Roman playbook: "already scoped (test name)" or "fixed here"; any hole outside
these files goes to the operator as a new T4 job, not into this PR. Failing-first: NEW test/sub-coach-revoke-132.spec.ts, a
migration spec. Under 700 lines. Title "fix(teams): removal keeps a coach's own clients and ends team access at once (T4)". READY. End.

## TEAMS-SHARE-RULE-132 (builder T5, Claude Opus 5.5, backend, T4 PII/health; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/TEAMS-SHARE-RULE-132-backend, branch agent132/teams-share-rule-132. LEFTHOOK=0.
Waits for TEAMS-ROUTES-MODEL-132 and CHURN-LABELS-132 (b#886) to merge. Owner D10b, read at read time (no copied grants): NEW
src/consent/team-sharing.ts grantHolderIds(callerId, clientId): {caller} plus the client's head coach when the caller holds an open
delegation for that client, plus the delegated coach when the caller is that client's head coach and the client joined that coach
directly (never otherwise). ConsentService.coachCanAccess and grantedScopesByClient (consent.service.ts:337-381) use it; route the
direct readers through them: coach.service.ts:327 (rosterFitnessConsents), coach-brief.service.ts:2050 (lastSharingWithdrawal),
coach-ai.service.ts:453 (shareSafe), command-center.service.ts:225-235 (sharedWith: caller, not ownerCoachId). Owner bypass
unchanged. coach-sharing-notice.ts: version coach_sharing_join_v2 with the D3 sentence only when the coach has a team. Failing-first:
NEW test/team-sharing-rule-132.spec.ts (fails on main for the brief, Coach AI and churn readers). Under 650 lines. Title
"feat(privacy): the team sharing rule, one helper for every coach-side reader (T4)". READY. End.

## TEAMS-UI-132 (builder T6, GPT-6.1 Sol, mobile, T2; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-UI-132-mobile, branch agent132/teams-ui-132 (off mobile main). Waits for TEAMS-SWITCH-132 and
TEAMS-ROUTES-MODEL-132 to merge and m#573 to merge (coach README). Files and states per V11_TEAMS_PLAN_132 A3 rows 1-6: Business
profile "Team" row (CoachTeamProfileScreen.tsx); Team tab mounts when /me/feature-flags `teams` is on, the coach is not a sub-coach
and has a seat or pending invite (useCoachRoleType.ts, CoachNavigator.tsx:683-684); drop the plan gate (TeamManagementScreen.tsx:
35-63, :154); parse the array list; ClientReassignModal "Back to you" first, errors from errorMessage(), capacity in words;
SubCoachDetailScreen removal copy (D2 sentence, no "cannot be undone"); SubCoachInviteModal.tsx:206 "Share link" first, "emailed"
only when the response says sent; linking entries for tgp://team/sub-coaches and tgp://command-center/team. Doctrine: QLD 1-9 and
redo rules 1-7 (A4 of the plan); before -> after table + parity test. Under 650 lines. Title "fix(teams): Team screens tell the truth
and every action works". READY. End.

## TEAMS-INVITE-M-132 (builder T7, Claude Opus 5.5, mobile, T4 auth; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-INVITE-M-132-mobile, branch agent132/teams-invite-m-132. Waits for TEAMS-UI-132 (navigation
README). NEW src/screens/auth/AcceptTeamInviteScreen.tsx: GET /sub-coaches/invites/by-token/:token preview; signed out -> sign in or
create a coach account, then return with the token (the existing accept-invite replay pattern, RootNavigator.tsx:397-472); signed in
-> "Join team" -> POST /sub-coaches/invites/accept; 404 teams_disabled -> "This invite is not active."; invite_email_mismatch ->
the server's sentence + "Ask <name> to send it to this email". RootNavigator linking 'join/sub-coach/:token' before
'join/:invite_code?' (:194); src/lib/pendingInviteCode.ts never stores "sub-coach". NEW src/api/teamInviteApi.ts. Failing-first:
linking + pending-code tests fail on main. Under 600 lines. Title "feat(teams): the team invite link opens an accept screen (T4)".
READY. End.

## TEAMS-INVITE-BE-132 (builder T8, Claude Opus 5.5, backend, T3; one PR; time box 90 minutes)
Worktree /home/user/workspace/wt/TEAMS-INVITE-BE-132-backend, branch agent132/teams-invite-be-132. LEFTHOOK=0. Waits for
TEAMS-REVOKE-SCOPE-132. GET /join/sub-coach/:token (invite-landing.controller.ts next to :30): bone page, the head coach's first name
and business name only, "Open in the app", App Store and Google Play buttons, a QR code of the same URL for desktop (server-rendered
SVG, no new dependency if one exists in package.json; else plain link), 404 page for an unknown/expired token; nothing else from the
invite. invite() sends the invite email through src/email/email.service.ts only when the email provider env is set (owner D6), and
the response says {email_sent: true|false}. Failing-first: page + email tests. Under 400 lines. Title "feat(teams): web page and
email for team invites". READY. End.

## TEAMS-ROUTING-132 (builder T9, Claude Opus 5.5, backend, T4 tenancy + migration; one PR; time box 3 h)
Worktree /home/user/workspace/wt/TEAMS-ROUTING-132-backend, branch agent132/teams-routing-132. LEFTHOOK=0. Waits for
TEAMS-REVOKE-SCOPE-132; the operator keeps it out of flight with ROMAN-ACTIONS-132 / ROMAN-OUTREACH-132 and any FUNNEL PR on
invite-codes.service.ts. prisma: TeamRoutingRule (head_coach_id unique, mode MANUAL|TAKE_TURNS|SET_SHARES|CLIENT_PICKS, cursor,
updated_by) and TeamRoutingMember (head_coach_id, coach_id, share_bps, paused, max_clients), RLS enabled + forced in the same
migration (owner bypass, head coach SELECT/WRITE). NEW src/team-routing/ (service: routeNewClient(headId, clientId) inside the
attach transaction: TAKE_TURNS cursor, SET_SHARES furthest-below-target (the stub's comment), skip paused/full, fallback head coach,
TeamAuditEvent 'client_routed', idempotent per client; GET/PUT /coach/team/routing with HeadCoachOnlyGuard; shares must sum to 10000).
One call in attachUserToCoachByCode (src/invite-codes/invite-codes.service.ts) when FEATURE_TEAM_ROUTING is on. Delete
src/gym/gym-distribution.service.ts. Manifest rows for head coach deletion. Failing-first: NEW test/team-routing-132.spec.ts. Under
780 lines. Title "feat(teams): route new clients by the head coach's rule (T4)". READY. End.

## TEAMS-PERF-132 (builder T10, Claude Opus 5.5, backend, T4 PII/health aggregates; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/TEAMS-PERF-132-backend, branch agent132/teams-perf-132. LEFTHOOK=0. Waits for
TEAMS-REVOKE-SCOPE-132 and TEAMS-SHARE-RULE-132. One service (src/sub-coaches/sub-coach-analytics.service.ts; delete
src/sub-coach/sub-coach-analytics.service.ts and the 0-100 score): per coach and window 7|30|90: median check-in reply time, clients
with a program change in the last 7 days, clients who logged this week (only logs they share, via the D10b helper), churn-risk count
(read the churn engine's existing output; no new heuristic), check-ins unanswered over 48 h (ids for the coach's own view only).
GET /sub-coaches and :id/analytics?window=; GET /coach/clients rows gain assigned_coach {id, first_name} for a head coach with a team.
Every number has its definition in the README. Failing-first: NEW test/team-perf-132.spec.ts. Under 600 lines. Title "feat(teams):
honest per-coach numbers for 7, 30 and 90 days (T4)". READY. End.

## TEAMS-SHARE-COPY-M-132 (builder T11, Claude Opus 5.5, mobile, T4 consent copy; one PR; time box 75 minutes)
Worktree /home/user/workspace/wt/TEAMS-SHARE-COPY-M-132-mobile, branch agent132/teams-share-copy-m-132. Waits for
TEAMS-SHARE-RULE-132. ProfileScreen.tsx:85-160 and src/screens/trustCenterSharing.ts: when /v1/clients/me/coach reports an
assigned team coach, the D3 sentences (owner-approved text only); otherwise unchanged; never claim exclusive access. Each variant
tested. Under 350 lines. Title "fix(privacy): clients see which team coach works with them and what they see (T4)". READY. End.

## TEAMS-SUB-AI-132 (builder T12, Claude Opus 5.5, backend, T4 egress/tenancy; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-SUB-AI-132-backend, branch agent132/teams-sub-ai-132. LEFTHOOK=0. Waits for
TEAMS-REVOKE-SCOPE-132 and TEAMS-SHARE-RULE-132. Undo the sub-coach hide of 6e8616f5 only for assigned clients when FEATURE_TEAMS is
on: src/ai/gateway/workout-builder/workout-builder-sub-coach.gate.ts allows draft.create/edit_workout_plan for a client in the caller's scope (404 otherwise);
drafts stamped with the head coach's tenant can be decided by the assigned coach; usage stays on the head coach's pool. Failing-
first: extend test/aibsub-workout-builder-sub-coach.spec.ts with a NEW file test/teams-sub-ai-132.spec.ts. Under 450 lines.
Title "feat(teams): AI workout drafts for a sub-coach's assigned clients (T4)". READY. End.

## TEAMS-PERF-M-132 (builder T13, GPT-6.1 Sol, mobile, T2; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-PERF-M-132-mobile, branch agent132/teams-perf-m-132. Waits for TEAMS-UI-132 and
TEAMS-PERF-132. Team rows: name, clients, unanswered over 48 h in words; SubCoachDetail: 7/30/90 toggle, TgpSparkline monochrome,
the unanswered list opens the client; ClientsListScreen overline with the assigned coach and "Coach: Everyone / name" filter (head
coach with a team only). Skeletons, QuietError, haptics on the toggle. Before -> after table + parity test. Under 600 lines. Title
"feat(teams): the team performance view". READY. End.

## TEAMS-PICK-COACH-132 (builder T14, Claude Opus 5.5, backend, T4 tenancy; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-PICK-COACH-132-backend, branch agent132/teams-pick-coach-132. LEFTHOOK=0. Waits for
TEAMS-ROUTING-132. NEW src/team-routing/team-routing-public.controller.ts GET /invite-codes/:code/team-coaches (public, throttled):
for a CLIENT_PICKS team only: coach first name, one-line focus from the coach profile, next open time from TGP scheduling (no
calendar details); join accepts chosen_coach_id, re-checked in the attach transaction (on the team, not paused, has room; else
routed by fallback). Failing-first: NEW spec. Under 500 lines. Title "feat(teams): clients can pick a team coach by availability (T4)".
READY. End.

## TEAMS-DIGEST-132 (builder T15, Claude Opus 5.5, backend, T4 egress/spend; one PR; time box 2.5 h)
Worktree /home/user/workspace/wt/TEAMS-DIGEST-132-backend, branch agent132/teams-digest-132. LEFTHOOK=0. Waits for TEAMS-PERF-132;
the operator keeps it out of flight with Roman schema PRs. TeamWeeklyDigest (head_coach_id, week_start, body, source 'model' |
'template'), RLS in the same migration, manifest + export rows. Scheduler: Monday 09:00 in the head coach's time zone, one row per
week (unique key = retry-safe); input = TEAMS-PERF numbers only (no client names, no logs); cheap model through the AI gateway on the
head coach's pool inside the existing background ceiling; template fallback; GET /coach/team/digest/latest. Failing-first: NEW spec.
Under 700 lines. Title "feat(teams): Monday team summary for the head coach (T4)". READY. End.

## TEAMS-ROUTING-M-132 (builder T16, GPT-6.1 Sol, mobile, T2; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-ROUTING-M-132-mobile, branch agent132/teams-routing-m-132. Waits for TEAMS-ROUTING-132 and
TEAMS-PERF-M-132. NEW TeamRoutingScreen in TeamStack (CoachNavigator.tsx), "Routing" text row on TeamManagementScreen when
/me/feature-flags `team_routing` is on; four choices as hairline rows with one sentence each, shares as whole percents summing to
100 (validated in words), pause and max clients per coach, one forest Save; NEW src/api/teamRoutingApi.ts. Before -> after table +
parity test. Under 550 lines. Title "feat(teams): routing settings for head coaches". READY. End.

## TEAMS-PICK-COACH-M-132 (builder T17, Claude Opus 5.5, mobile, T3; one PR; time box 2 h)
Worktree /home/user/workspace/wt/TEAMS-PICK-COACH-M-132-mobile, branch agent132/teams-pick-coach-m-132. Waits for
TEAMS-PICK-COACH-132 and TEAMS-INVITE-M-132. Inside the existing join-code screen (builder confirms the file in src/screens/auth;
no new route): when GET /invite-codes/:code/team-coaches returns coaches, a "Choose your coach" step with hairline rows and one forest
Continue; nothing when it returns none. Failing-first join test. Under 500 lines. Title "feat(teams): choose your coach when joining
a team". READY. End.

## TEAMS-MONEY-132 and TEAMS-MONEY-M-132 (builders T18/T19, Claude Opus 5.5, backend then mobile, T4 money; one PR each)
Start only after the owner's yes on D9 and COACH-PAY-FLIP merges. Worktrees /home/user/workspace/wt/TEAMS-MONEY-132-backend and
/home/user/workspace/wt/TEAMS-MONEY-M-132-mobile, branches agent132/teams-money-132 and agent132/teams-money-m-132. Sub-coach
refund/pause/cancel for assigned clients only, same full-refund warning, a head coach notification on every sub-coach money action,
idempotent and transactional (ER 9); mobile shows the same buttons with the same copy. Each under 550 lines. READY. End.
```

## A8. Owner decisions (recommended defaults)

| # | Decision | Default |
|---|---|---|
| D1 | Team model | Overlay: the client stays the head coach's client; the head coach assigns a team coach (FP C4 default) |
| D2 | A coach's own clients when they join, leave or are removed | Stay with that coach; only clients the head coach assigned go back (AUD-ORG-129 default) |
| D3 | Client-facing text for the team sharing rule (consent; Washington My Health My Data Act) | Profile: "Sam Lee on Alex's team coaches you and sees what you share with Alex in Coach sharing." Join notice v2 adds "and the coach on Alex's team who works with you". No push |
| D4 | Who can start a team | Any coach who is not a sub-coach, free, from Business profile; the Team tab appears once someone is invited |
| D5 | The paid Team Mode seat path (Pro/Enterprise Stripe line) | Retire it (teams are free; no Stripe change: those prices are unset) |
| D6 | Invite email | Share link always; email through the existing email service only if it is configured; no new vendor |
| D7 | Default routing rule | Manual until the head coach picks one; fallback to the head coach when no coach has room |
| D8 | "Client picks" on the web checkout | Mobile join first; the web step only after the FUNNEL plan's checkout ships, as a later PR |
| D9 | Sub-coach money buttons (decision 4) | Assigned clients only, same warning, head coach notified; after COACH-PAY-FLIP |
| D10 | Head coach 5 percent split toggle (TeamMembersScreen, orphan) | Keep hidden in v1.1 (money; no request from the owner); revisit with PART B idea 6 |
| D11 | Weekly digest spend | Head coach's AI pool, cheapest model, inside the existing background ceiling; template when the pool is empty |
| D12 | Team size and per-coach caps | No team cap; the head coach sets an optional max clients per coach |

Store rules: nothing in PART A sells anything on the phone (teams are free); D9 follows the existing coach-payment rules (coaching sold
1:1 is a person-to-person service). Health data: every team coach read goes through the client's own switches (D10b + D3).

---

# PART B. Additional ideas (optional additions; nothing here is in PART A)

| # | Idea (plain words) | Why it makes TGP superior | Rival gap it exploits | Size | Cost | Depends on |
|---|---|---|---|---|---|---|
| B1 | **Cover mode**: "Sam covers Alex's clients from Friday to Monday." Clients get one calm line in their coach thread, Roman knows who is covering, access ends by itself on the end date | Holidays and sick days stop being a manual reassign-and-undo | Trainerize covers through staff role permissions ([permissions](https://help.trainerize.com/hc/en-us/articles/360000695586-Trainer-Manager-and-Staff-Permissions)); Everfit adds teammates per client by hand ([sub-coach permission](https://help.everfit.io/en/articles/6809708-permission-settings-add-a-sub-coach-to-manage-your-client)); neither ends cover by date or tells the client | 3 PRs (b T4 dated delegation + share rule; m T2 screen; m T2 client line) | none | PART A #3-#6 |
| B2 | **Roman handoff brief**: when a client moves coach, the receiving coach gets a one-screen AI summary of the last 90 days from what the client shares (goals, what worked, open questions), read-only, with the source of each line | A move keeps the coaching, not just the data | Everfit warns a transfer can lose data access ([transfer](https://help.everfit.io/en/articles/3753878-transfer-a-client-within-a-workspace)); none of the rival pages cited here describes a handoff summary | 2 PRs (b T4 egress, m T2) | AI usage on the head coach's pool (no cash) | #5, #10; Roman playbook (on) |
| B3 | **Team roles**: a "Lead coach" who sees the whole team's clients and can assign, between head coach and coach; head coach keeps money and settings | Lets a growing team delegate management without handing over the business | Trainerize offers a fixed set of five roles ([permissions](https://help.trainerize.com/hc/en-us/articles/360000695586-Trainer-Manager-and-Staff-Permissions)); TrueCoach has one admin toggle ([team accounts](https://help.truecoach.co/en/articles/2403964-team-accounts)) | 3 PRs (b T4 role + guards, b T4 scope, m T2) | none | #4 |
| B4 | **Best-fit routing**: Roman suggests the best coach for a new client from the join answers that are not health data (goal, schedule, coach focus, room), the head coach confirms in one tap or lets it auto-route | Turns routing from a rota into matchmaking | Calendly routes by form rules and availability only ([routing forms](https://calendly.com/blog/routing-forms)); the fitness rivals' team pages cited here describe manual assignment | 2 PRs (b T4, m T2) | small AI usage (no cash) | #9, #14 |
| B5 | **Method consistency**: each week Roman compares team coaches' new programs with the head coach's playbook and lists drifts in plain words ("3 programs skip the deload week your method uses") | Quality control at team scale, the head coach's method stays the product | The rivals' team pages cover roles and access, not whether team coaches follow the owner's method ([Everfit team basics](https://help.everfit.io/en/articles/3013102-team-basics), [TrueCoach team accounts](https://help.truecoach.co/en/articles/2403964-team-accounts)) | 2 PRs (b T4, m T2) | AI usage (no cash) | #15; FEATURE_ROMAN_PLAYBOOK (on) |
| B6 | **Pay the team inside TGP**: each client payment splits between the head coach and the coach who works with that client (Stripe Connect transfers), with a clear monthly statement | Removes payroll spreadsheets for small teams | Everfit's page covers teammate access to payment packages, not paying teammates ([payment packages](https://help.everfit.io/en/articles/5716600-teammate-access-for-payment-packages)); TrueCoach bills the owner on total clients ([team accounts](https://help.truecoach.co/en/articles/2403964-team-accounts)) | 3-4 PRs (all T4 money) | OWNER DECISION: Stripe Connect payout fees per connected account (cash) | D9, COACH-PAY-FLIP, D10 |
| B7 | **Hire from TGP**: a head coach posts a role, browses applicants from the existing talent marketplace and invites one as a team coach in one tap | The growth ladder (SoT A7.5 :1679, creator -> team -> gym): hiring and onboarding in one place | None of the rival team pages cited here offers hiring | 3 PRs (m T2 x2, b T4 invite link-up) | none (no paid vendor) | #7, #8; marketplace moderation state (unverified) |

Also possible, smaller: team-wide client challenges and leaderboards across a head coach's whole team (the head coach's roster
already includes assigned clients); depends on FEATURE_COMMUNITY_CHALLENGES and the Roman plan's D9 rule (V11_PLAN_132.md:274), so
it belongs with that switch decision, not here.

## Proposed (needs operator)

1. Launch order: wave 1 (#2 now, #1 after b#884 + ROMAN-GATES-132), then one wave at a time. Default: yes.
2. Cross-plan overlaps are listed in A6 (CHURN, FUNNEL, IMPORTER, REFERRAL, ROMAN plans as of 14:09); those plans may still change,
   so the operator re-checks at each launch. Default: schema and config PRs from all plans run one at a time.
3. TEAMS-REVOKE-SCOPE-132's scope table may find holes outside its files (bookings, packages, broadcasts): each becomes its own T4
   job. Default: yes.
4. PART B: ask the owner which (if any) to add after PART A wave 3. Default: B1 Cover mode and B2 handoff brief first (no cash).
5. Owner decisions D1-D12 (A8) go to the owner with the defaults shown; wave 2 needs D1 and D2, wave 3 needs D3. Default: send now.
