# FW-COACH-128 — first week: the client side of the coach relationship (auditor, agent 128, read-only)
Status: DONE 14:46 PDT 10-07. Model: Claude Opus 5.5 lens of FW-AUD-128. No code, no PRs, no comments.
Traced on mobile main d0875d26 (RO worktree), re-checked on mobile origin/main 4185b9b2 (m#491 messaging redo merged
during the audit) and backend origin/main c7caffff (RO worktree 0d179edb). File:line refs are mobile 4185b9b2 / backend
0d179edb unless marked.

## Scope traced
Joining a coach after sign-up (CoachCodeSheet, PendingInviteBanner, Day-1 CoachPairingScreen, AcceptInviteScreen),
the coach-sharing sentence on every join (B-SHARE-127) and the backend grant (invite-codes.service.ts:1023,
consent/coach-sharing-notice.ts), Settings > Privacy > Coach sharing (CoachSharingScreen, coachSharingApi, consent
service), every coach-side read that the four toggles are supposed to control, coach profile (ContactView, Home
CoachIntroductionBanner), Messages with / without a coach (v2 is ON in production: FEATURE_MESSAGING_CORE_V2=true),
Calendar booking, session screen and booking reminders (BOOKING_REMINDERS_ENABLED=on), Habits & daily check-in,
Coach Guidelines, leaving / switching a coach. Memory on/off does not change any surface in this area.

Open PRs judged at their heads (not re-reported): m#502 DES-AW (AcceptInvite false "You've been linked" copy fixed at
0bc90070), m#497 DES-AG (CalendarBook + ClientUpcomingSessions), m#508 DES-AX (CoachPairingScreen), m#491 merged
(online dot and "Pull to retry" removed), Home banner "Your coach will assign your first workout" already fixed on
main 4185b9b2. No open PR touches the files in the fix jobs below.

## (1) B list
None that meets SoT A2 item 1 through the shipped app. The two candidates were downgraded after tracing:
- Coach Home weight alert ignoring "Weigh-ins: Not shared" lives in legacy CoachHomeScreen, route "Dashboard",
  which nothing navigates to (mobile src/navigation/CoachNavigator.tsx:390); reachable only by calling the API -> U2.
- ProgramTemplatesScreen tells the coach "<client> can see ... in their guidelines tab" while the client gets 403;
  that screen is replaced by the Programs stack when featureFlags.mwbPrograms is on (true in eas.json production and
  clinic; CoachNavigator.tsx:739), so no production coach reaches it -> folded into U1.

## (2) U list
U1 (dead button + raw error, both states) Coach Guidelines can never load for a client. Story: a client taps the
   clipboard icon on Workouts and always sees "Could not load guidelines / Request failed with status code 403".
   Cause: GET /coach/my-guidelines sits in CoachController under CoachGuard (backend src/coach/coach.controller.ts:15,
   :189; coach.guard.ts:12). Mobile shows the Axios text (src/screens/client/CoachGuidelinesScreen.tsx:39-44). Nothing
   in the production coach app writes guidelines (only ProgramTemplatesScreen, hidden by mwbPrograms).
   Smallest fix: remove the clipboard entry (src/screens/client/WorkoutScreen.tsx:670-679, rule 2) and replace the
   raw error with fixed copy; keep the screen file for later. Alternative (needs owner): move the route to a student
   controller and give coaches a writer.
U2 (T4 privacy, coach-side, needs Opus) The four Coach sharing toggles do not gate every coach read. Gated: client
   detail/timeline/summary/roster (coach.service.ts:87-107, :437, :590) and the brief. Not gated:
   - GET /coach/clients/:id/check-ins returns full rows (mood, energy, sleep, notes) after "Check-ins and habits" is
     off (src/check-ins/check-ins.service.ts:312-339; no consent call).
   - GET /coach/dashboard alert "<name> weight has increased 3+ consecutive days" and /coach/dashboard/summary
     weight_flag / off_macros / missed_workout (coach.service.ts:663-785, :804-970).
   - Engagement metadata: command-center streaks / at-risk (src/coach/command-center/command-center.service.ts:286-320),
     coach-home counts (src/coach/home/coach-home.service.ts:190-195), v1 roster last check-in / workout dates
     (src/v1/v1-coach.service.ts:144-155).
   Smallest fix: one helper (reuse coach.service.ts rosterFitnessConsents / ConsentService.coachCanAccess) applied to
   the check-ins read and both dashboard builders; metadata surfaces in the same PR if it stays under 400 lines.
U3 Attach on the pending-invite banner leaves the app stale. Story: a signed-in client opens the coach's /join link,
   taps Attach, sees "Code attached to your account." but Home still shows the coachless card and paid tabs still say
   "Choose a plan" until the app is reopened, even when the code carried a plan. CoachCodeSheet refreshes the
   entitlement (CoachCodeSheet.tsx:150-155); the banner does not (src/components/PendingInviteBanner.tsx:69-82,
   src/lib/pendingInviteCode.ts:115-131). The banner also never names the coach ("Tap to attach \"GP-...\"") and uses
   12 pt text, a filled card and a letter-spaced button (rule 3). Fix: refresh entitlement + Home queries on success,
   name the coach via the existing code preview, calm style.
U4 Daily check-in is open to a client without an active package but its save is behind ClientEntitlementGuard
   (backend src/check-ins/client-check-ins.controller.ts:24). Story: a client who joined a coach and tapped "Later" on
   the plan fills mood, energy and sleep, taps Save and gets the paywall sheet plus "Couldn't save check-in".
   Fix: on the check-in tab, when the entitlement is not active, show the same coach-managed / plan line the
   ProtectedScreen gate uses instead of the form (src/screens/client/HabitsScreen.tsx check-in tab).
U5 Coach "profile" is a contact stub: initials, name, "Coach", Block (src/screens/messaging/ContactView.tsx:139-200).
   The photo and business name the app already has (CoachCodeSheet welcome; GET /v1/clients/me/coach) are not shown.
   Block / unblock failures say "Something went wrong. Please try again..." (ContactView.tsx:93, :118: generic error).
U6 Coach sharing screen look: filled bordered card, no overline, Switch track colours only (src/screens/settings/
   CoachSharingScreen.tsx:119); below the calm rules (hairlines, no card fills). Copy is honest; the owner-account line
   is correct.
U7 Changing coach dead-ends at support: coachless copy says "To change coaches, contact support from Settings"
   (src/components/coachless/coachlessCopy.ts:19; day-one en.json:38) but no admin or coach tool can detach a client
   (only invite attach writes coach_id: invite-codes.service.ts:985-995; archiveClient only sets archived_at). Support
   can only do it by a manual database edit. Owner decision, see polish item 2.

C one-liners
- C (edge, deferred to 10k clients): AcceptInvite "Sign in" path drops the token for an existing account; emails use
  /join/<code>, not /invite/accept, so normal users do not reach it (m#502 file).
- C (edge, deferred to 10k clients): Day-1 pairing failure for "already paired to a different coach" stashes the code,
  so the Home banner later offers an attach that will 409 (CoachPairingScreen.tsx:98-100).
- C: Calendar "not matched with a coach" state is behind the paywall gate for coachless clients, so it is unreachable.
- C: sub-coaches have no sharing grant of their own, so an assigned sub-coach sees no logs (coach.service.ts:437);
  sub-coach launch scope belongs to the coach-side lanes.

## (3) Dead-button table
| Screen | Element | Today | Verdict |
|---|---|---|---|
| Workouts header | Clipboard "Coach guidelines" | Opens a screen that always fails with 403 | Dead (U1): remove |
| Coach Guidelines | Retry | Repeats the same 403 | Dead (U1) |
| Home pending-invite banner | Attach | Attaches, but Home / gate stay stale | Works, incomplete (U3) |
| Habits > Daily check-in | Save check-in | 402 for clients without a package | Dead for that state (U4) |
| Messages header | Coach name -> ContactView | Opens stub with Block only | Works (U5 polish) |
| Messages no-coach | Enter a coach code / Contact support | Open code sheet / Support inbox | OK |
| CoachCodeSheet welcome | Choose a plan / Message / Done / Later | Real targets | OK |
| Settings > Privacy | Coach sharing toggles | Save per scope, roll back on failure | OK (U2 is server side) |
| Calendar | Book, Reschedule, Cancel, Add to my calendar, Join, Message your coach | Real handlers | OK |
| ContactView | Block / Unblock | Real, generic failure copy | OK (U5 copy) |

## (4) First-week polish (ranked)
1. FIX: close the sharing promise on the coach side (U2). Highest value: the join sentence and Settings both say the
   client chooses what the coach sees.
2. NEW (owner yes): "Change or leave coach". Recommended default: an owner-only admin detach (clears coach_id,
   revokes the four grants, leaves purchases and dunning untouched, audit row) so the support promise in U7 is real;
   client self-serve after launch.
3. FIX: remove the Coach Guidelines entry and its raw error (U1).
4. FIX: pending-invite banner names the coach, refreshes access and Home, calm style (U3).
5. FIX: coach card on ContactView with photo and business name, specific block errors (U5).
6. FIX: check-in tab honest for clients without a package (U4).
7. FIX: Coach sharing screen in the calm look (U6).
8. NEW (owner yes): coach-set weekly check-in questions and coach-assigned habits. Neither exists (Habit has no
   coach_id: prisma/schema.prisma:1178; no check-in form model). Recommended default: after launch.

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs, each under 400 lines)
| Job | Tier / model | Files | Content |
|---|---|---|---|
| FWC-SHARE-GATE-128 | T4 privacy, Claude Opus 5.5, backend | src/check-ins/check-ins.service.ts, src/check-ins/check-ins.module.ts, src/coach/coach.service.ts (getDashboard, getDashboardSummary only), src/coach/command-center/command-center.service.ts, test/coach-sharing-coach-reads.spec.ts | U2: gate each read by the matching fitness scope (owner bypass kept); failing-first tests per surface |
| FWC-GUIDE-128 | T1, GPT-6.1 Sol, mobile | src/screens/client/WorkoutScreen.tsx (header entry only), src/screens/client/CoachGuidelinesScreen.tsx, src/screens/client/__tests__/CoachGuidelinesEntry.test.tsx, src/screens/client/README.md | U1: remove entry (parity table cites rule 2), fixed error copy |
| FWC-INVITE-128 | T1, GPT-6.1 Sol, mobile | src/components/PendingInviteBanner.tsx, src/lib/pendingInviteCode.ts, src/components/__tests__/PendingInviteBanner.test.tsx, src/components/README.md | U3 (coordinate with DES-K2-128 if it restyles Home child cards; run after it) |
| FWC-CONTACT-128 | T1, GPT-6.1 Sol, mobile | src/screens/messaging/ContactView.tsx, src/screens/messaging/__tests__/ContactView.test.tsx, src/screens/messaging/README.md (or nearest) | U5 |
| FWC-CHECKIN-128 | T1, GPT-6.1 Sol, mobile | src/screens/client/HabitsScreen.tsx, src/screens/client/__tests__/HabitsCheckInGate.test.tsx | U4 |
| FWC-SHARE-UI-128 | T1, GPT-6.1 Sol, mobile | src/screens/settings/CoachSharingScreen.tsx, src/components/coachSharing/coachSharingCopy.ts, its tests, src/screens/settings/README.md | U6 (m#507 DES-BA touches settings README: merge order) |
| FWC-DETACH-128 (owner yes first) | T4 tenancy/consent, Claude Opus 5.5, backend | src/admin/admin.controller.ts, new src/admin/client-detach.service.ts, test | polish 2 |

## Cross-area findings (one line each, for the operator)
- FW-NOTIF / digests: client digest "Current streak" is the 7-day check-in count, and "Last logged weight" is always
  lbs (backend src/notifications/digest.service.ts:244-270).
- FW-TRAIN: WorkoutScreen header owns the dead Coach Guidelines button (job FWC-GUIDE-128 touches only that entry).

## Not fixed (needs operator)
- U2 (T4): route FWC-SHARE-GATE-128 to Claude Opus 5.5 (file:line above).
- U7 / polish 2: owner decision on detach (recommended default: admin-only detach now).

## Not checked
- Booking reminder delivery end to end (relied on earlier scheduling audits); coach-side AI context vs. sharing switches (belongs to FW-ROMAN / R11 lanes).

## HANDOFF
Audit complete; nothing pending. A fresh agent can launch the jobs in section (5) as written. Re-check line numbers on
the current main first (mobile main moved from d0875d26 to 4185b9b2 during this audit; the cited findings were
re-verified on 4185b9b2 and backend c7caffff).
