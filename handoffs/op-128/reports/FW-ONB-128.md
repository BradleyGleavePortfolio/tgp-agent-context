# FW-ONB-128 (FW-AUD-128 instance, agent 128) — first open to first Home
Auditor: Claude Opus 5.5, read-only. Started 14:31 PDT 10-07, report written 14:46 PDT (cut short by the operator's 14:46 credit emergency).
Code read at mobile main f240af37 (newer than the brief's d0875d26) and backend main 675242fd, through my own detached read
worktrees /home/user/workspace/wt/FW-ONB-128-mobile and /home/user/workspace/wt/FW-ONB-128-backend (nothing built or run).
No code, no PRs, no comments, no Supabase queries.

## Scope traced
Both entry states, as a new client meets them in the clinic build (eas.json "clinic": EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING=true,
EXPO_PUBLIC_FF_CLIENT_TUTORIAL=true; backend SIGNUP_ROLE_CHOICE_ENABLED unset = on; NUDGE_ENABLED unset = on; FEATURE_ROMAN_MEMORY unset = off).

- Without an invite: Welcome -> CreateAccount (optional code) -> "Check your inbox" verify step -> "I verified my email" (login) ->
  RoleSelection "Pair with your coach" (code optional) -> GET /me/onboarding says consultation_available=false (no coach) ->
  lean flow Q1-Q6 -> finalizeLeanOnboarding PUT /profile {onboarding_completed:true,...} -> Day1Win -> (package sheet if the
  coach has packages; not for coachless) -> Home (coachless slot, push primer, "Finish your profile").
- With an invite (code at sign-up or /join link): signup-with-code attaches the coach; RoleSelection auto-skips (cached coach_id);
  coach WITH an active clinic program set -> consultation (W1, P0 two boxes incl. Roman box 2, 8 chapters, reveals, Roman tour)
  -> Home; coach WITHOUT a clinic set (any coach today unless the owner seeded one) -> same lean path as above.
- Memory off (today): P0 box 2 shows client-ai-v4 copy. Memory on: box 2 shows the server memory_copy (client-ai-v5), same box,
  unticked. Both states are coded; no finding in my area.
- First push/email: Supabase confirmation email; Home push primer (PushPermissionCard, copy truthful for coach/coachless);
  onboarding_abandoned nudge (push + email, 48-96 h after sign-up while onboardingCompleted=false); coach welcome DM 13 min after
  consultation completion only when the coach's welcome setting is enabled (default off). client-onboarding-welcome.hbs is never sent.
- Open PRs touching my files, judged at their heads (fetched 14:50): m#502 (des-aw @33c493c2: AcceptInvite/EmailVerified/RoleSelection),
  m#503 (des-av @12717384: CreateAccount), m#504 (des-au @fc01a3c9: Welcome/Login/Forgot/Reset), m#508 (des-ax @0833283c: Day-1 screens),
  m#509 (des-ay @2fdab252: consultation look). Their fixes are not re-reported. No open PR touches src/tutorial, Lean Q1-Q6,
  Day1WinScreen, finalizeLeanOnboarding, RootNavigator or services/api.ts.

## (1) B list
B1 — No way to get a new confirmation link (sign-up dead-ends on a lost or expired email).
- Story: a new client whose confirmation email went to spam, was deleted, or expired before they opened it taps "I verified my email"
  or signs in, is told "Open the link in that email", and no screen offers a new link; EmailVerified (link_problem) says
  "contact support for a new link", so finishing sign-up needs a human.
- Evidence: mobile `src/screens/auth/CreateAccountScreen.tsx:111` ("There is no resend endpoint, so no resend button"), verify step
  :896-975 (only "I verified my email" / "Use a different email"); `src/screens/auth/EmailVerifiedScreen.tsx:47`;
  `src/utils/authFailure.ts:186`. Re-registering the same address is refused before Supabase is called
  (backend `src/auth/auth.service.ts:549` "Email already registered"). Backend HAS `POST /auth/resend-verification`
  (`src/auth/auth.controller.ts:359-368`, commit f64275e4, already in production deploy 23 f73c6521; README says it is advertised as
  `email_confirmation_resend: true` in signup-policy). Mobile never calls it.
- Smallest fix: `authApi.resendVerification(email)` in `src/services/api.ts`; a "Send a new link" secondary action on the verify step
  and on EmailVerified link_problem (and on the Login email_unconfirmed error), shown when signup-policy has
  `email_confirmation_resend: true`; neutral result copy ("If an account is waiting for confirmation, a new link is on its way."),
  60 s cooldown. Works against the current production backend.

B2 — Roman's tour states things that are not true for most new clients.
- Story: a client who did not go through the consultation (every coachless client and every client of a coach without a clinic
  program set, i.e. the normal launch path) taps Settings > "Take the tour again" and Roman says "I work with your coach", ends with
  "Your plan is set, your numbers are set, and your coach has your message", while they have no coach, no plan or no targets and
  sent nothing; the same closing line is shown to a consultation client who skipped the message step.
- Evidence: `src/tutorial/tutorialSteps.ts:157` (Welcome), :229-247 (coach_messages, no requirement), :327-345 (first_message),
  :377 (Complete line is unconditional, ignores the step outcomes 'pending'/'unavailable'); coach name falls back to "your coach"
  (`src/tutorial/tutorialStore.ts:104`); the Settings row is shown to every client (`src/screens/client/settings/ClientTutorialSetting.tsx:15-17`)
  and says "again" to a client who never took it. Home hides the coach target when no coach is linked
  (`src/components/tutorial/TutorialHomeSlot.tsx:45`), so the tour points at nothing (Skip exists, so not a dead end).
- Smallest fix: add a 'coach' requirement (coach linked) to coach_messages, first_message and welcome_call; build the Complete line
  from outcomes (only say "your plan is set" when program was shown, "your numbers are set" when macros were shown, "<coach> has your
  message" when first_message completed); Welcome line without "I work with <coach>" when no coach; Settings label "Take the tour"
  until a tour has completed once.

## (2) U list
U1 Lean onboarding never asks sex, so no lean client gets daily targets at onboarding: `tryComputeMacros` needs sex
   (`src/lib/finalizeLeanOnboarding.ts` ~106-112) and no Lean screen collects it (rg "sex" in LeanQ*.tsx: none). First Home shows
   "—" macro cells and "Add sex ... to set daily targets", while Q4 says "These guide your targets" (`LeanQ4MetricsScreen.tsx:147`).
   Direct hit on the owner's food-logging priority for week one. Fix: one Female/Male choice on Q4 (optional, same skip).
U2 Lean Q5 saves an invented birth date: the wheel preselects current year - 30 and "Save and continue" writes `YYYY-01-01` even
   if the client never touched it (`LeanQ5Screen.tsx:205-208, 277`); later targets use that age and Edit Profile shows it.
   Fix: no preselected value saved unless the wheel moved (or make the year an explicit pick).
U3 Lean Q3 "Your home screen is set up to make it instant." (`LeanQ3IntentScreen.tsx:106`) is false: Home does not read the intent
   (lean_intent only goes to the profile). Remove (rule 1).
U4 Lean copy and look below the redo rules: first person "Skip — I'll set this later" / "I'll add later" (Q1-Q6), uppercase
   "SAVE AND CONTINUE"/"CONTINUE", "← Back" glyphs, step dots that read 4 of 4 on Q4 then grow to 5 and 6 (Q1:103, Q4:143, Q5:316,
   Q6:187). No DES job covers Lean Q1-Q6.
U5 The Day-1 flow is effectively unreachable on the normal path: lean's finalize patches the cached profile with
   `onboarding_completed: true` (`finalizeLeanOnboarding.ts:161, 226`), and RootNavigator skips Day-1 when that "legacy" flag is set
   (`RootNavigator.tsx:807-812`). Only a client whose profile PUT failed (offline) gets six more screens. m#508 polishes screens almost
   nobody sees. Needs a decision (D1).
U6 When Day-1 does show: CoachPairing asks an already-attached client for a code again (no coach_id check; `CoachPairingScreen.tsx`),
   Goals offers Business/Relationships/Mental Health that are stored only on the device and used nowhere (`day-one/api.ts:135-143`),
   and CheckInTime saves a time that schedules nothing (device-only; only Settings displays it) (`day-one/api.ts:171-186`).
U7 A coachless client is asked for a coach code up to three times before Home (CreateAccount field, RoleSelection "One more step. Pair
   with your coach", Day-1 CoachPairing when shown), then again by the Home coachless slot. Mentally loading (rule 5).
U8 RoleSelection "Coach access is managed by the platform team. If you should be a coach, contact your administrator."
   (`RoleSelectionScreen.tsx:501`, still at m#502 head) contradicts open coach sign-up (role choice is on) and names an
   "administrator" a consumer does not have. Fold into m#502's next fix round.
U9 m#504 head fc01a3c9 makes "Sign in" the forest primary on Welcome and "Create account" secondary. On first open most people are new;
   recommended: Create account primary, Sign in secondary. Lens/FIX-PR item for m#504, not a new job.
U10 Day1Win "One action. Your programme starts here." (`Day1WinScreen.tsx:261`) claims a programme the client may not have (and UK
   spelling); uppercase "CONTINUE" (:238), "Continue anyway — try again later" (:321). "Log your starting weight" opens Progress, not a
   weight entry (RootNavigator.tsx ~916), one extra tap.
U11 onboarding_abandoned nudge copy invents facts: push "Under three minutes, whenever it fits." (backend
   `src/notifications/nudges/copy.ts:50-55`), email "we held it for you", "Most people finish in under three minutes"
   (`src/email/templates/nudge-onboarding-abandoned.hbs`). The consultation is eight chapters; the counts are made up; first person.
U12 Lean Q1 skip alert says "finish your profile from Settings"; the profile editor is under Profile > Edit profile.

## C one-liners
- C (edge, deferred to 10k clients): offline at first boot keeps the consultation for a coachless client (fail-open read); Sign out is the way out.
- C (edge, deferred to 10k clients): Day1Win records the win on the server before the action is done; analytics only.
- C (edge, deferred to 10k clients): Day1Win's 50 ms post-mount navigate is dropped if the navigator is not ready (lands on Home).
- C: client-onboarding-welcome.hbs is never sent (dead template with first-person and coach-only lines); delete or leave.
- C: invite preview/accept accept only role 'coach' (invite-codes.service.ts:827, 1428, 1480), so an owner-role account's own code is
  refused; matters only if the owner account hands out its own code.

## (3) Dead-button table (first open to first Home)
| Screen | Control | Effect | Verdict |
|---|---|---|---|
| Welcome | Get Started / Log In | CreateAccount / Login | real (m#504 swaps emphasis, see U9) |
| CreateAccount verify | I verified my email | login, route | real |
| CreateAccount verify | Use a different email | back to form | real |
| CreateAccount verify | (Send a new link) | missing | B1 |
| EmailVerified | Continue / Sign in / Contact support | back / Login / Crisp | real; link_problem has no self-serve link (B1) |
| AcceptInvite | Continue (signed in) | navigates to Welcome, code not carried | known, m#502 B2 (escalated there) |
| AcceptInvite | Create account / Back to welcome | CreateAccount with code / Welcome | real |
| RoleSelection | Paste / Continue / Keep my current coach / Continue without a coach / Contact support | real handlers | real |
| Lean Q1-Q6 | options, Save and continue, Skip, Back, unit chips | save + navigate / finalize | real |
| Consultation | every control in m#509 parity table | real | real |
| Day-1 Goals | category chips | stored on device, used nowhere | no effect (U6) |
| Day-1 CheckInTime | Save check-in time | device-only, no reminder | no effect beyond a Settings label (U6) |
| Day-1 others | Get started / Pair / Continue without a code / Turn on / Not now / Open Home | real | real |
| Day1Win | win cards / Skip / Continue anyway / Continue | record + navigate | real (U10 copy) |
| Home (first) | primary CTA, number cells, push primer, profile nudge | real | real (child cards owned by DES-K2) |
| Settings > Tutorial | Take the tour again | starts the tour | real, label and content untrue for coachless (B2) |

## (4) First-week polish, ranked
1. FIX — B1 resend link on verify / EmailVerified / Login. Removes the only sign-up dead end.
2. FIX — B2 truthful tour (coach requirement, outcome-built closing line, "Take the tour").
3. FIX — U1+U2: lean asks sex (optional) and stops saving an untouched birth year, so the first Home and first food logs show real
   calorie and protein targets from day one (owner priority: food logging).
4. FIX — U3+U4+U12: Lean Q1-Q6 honest copy, sentence case, no first person, one "Step n of 6" line.
5. NEW (owner yes) — D1: one onboarding, not two. Recommended default: the lean flow (or consultation) is the whole onboarding; never
   show Day-1 after lean (make the offline case match the online case); keep Day-1 code only for the deep-link prefill path or retire it.
6. NEW (owner yes) — D2: coachless clients are asked for a code once (CreateAccount), RoleSelection auto-continues for a client with no
   code (no "Pair with your coach" screen), Home's coachless slot stays the place to add one later. Recommended default: yes.
7. FIX — U10 Day1Win honest headline ("One action to start." / no "programme" unless a plan exists), sentence case.
8. FIX — U11 nudge copy: "A few steps are left to finish setting up." with no invented duration and no first person.

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs; each under 400 lines)
| Job | Files (exact) | Tier | Model | Notes |
|---|---|---|---|---|
| ONB-RESEND-128 (B1) | src/services/api.ts (authApi.resendVerification), new src/screens/auth/ResendVerificationLink.tsx, src/screens/auth/CreateAccountScreen.tsx (verify step only), src/screens/auth/EmailVerifiedScreen.tsx (link_problem only), new src/screens/auth/__tests__/ResendVerificationLink.test.tsx, src/screens/auth/README.md | T3 (auth surface, public endpoint, enumeration-safe copy) | Claude Opus 5.5 | SEQUENCE: launch after m#503 and m#502 merge (they own CreateAccount/EmailVerified/auth README). Login variant after m#504 merges, or add LoginScreen then. ~200 lines. Backend already live. |
| ONB-TOUR-128 (B2) | src/tutorial/tutorialSteps.ts, src/tutorial/tutorialMachine.ts, src/tutorial/tutorialStore.ts (coachLinked in env), src/tutorial/types.ts if needed, src/screens/client/settings/ClientTutorialSetting.tsx, src/tutorial/__tests__/tutorialTruth.test.ts (new), src/tutorial/README.md | T2 (Roman copy, no data/consent) | GPT-6.1 Sol (Opus if the operator treats Roman copy as Roman PR) | ~250 lines. Launch now. Do not touch src/components/tutorial/TutorialHomeSlot.tsx (DES-K2 area). |
| ONB-LEAN-128 (U1-U4, U12) | src/screens/onboarding/LeanQ1GoalScreen.tsx, LeanQ2ExperienceScreen.tsx, LeanQ3IntentScreen.tsx, LeanQ4MetricsScreen.tsx, LeanQ5Screen.tsx, LeanQ6Screen.tsx, src/screens/onboarding/__tests__/leanHonest.test.tsx (new), src/screens/onboarding/README.md | T2 (adds an input feeding existing macro calc; copy) | GPT-6.1 Sol | ~350 lines. Copy/data first; full A23 restyle of these six screens is a later DES job after this merges (same files). Launch now. |
| ONB-WIN-128 (U10) | src/screens/client/Day1WinScreen.tsx, its existing test, src/screens/client/README.md row | T1 | GPT-6.1 Sol | ~120 lines. Launch now. |
| ONB-NUDGE-128 (U11) | backend src/notifications/nudges/copy.ts (onboarding_abandoned case), src/email/templates/nudge-onboarding-abandoned.hbs, matching spec | T1 backend copy | GPT-6.1 Sol | ~60 lines. Check with FW-NOTIF-128 first (may also report nudge copy). LEFTHOOK=0. |
| ONB-GATE-128 (D1, only if owner says yes) | src/navigation/RootNavigator.tsx (Day-1 gate ~797-823), src/__tests__/rootNavigatorConsultationAvailable.test.tsx (fix the fixture to the real post-lean profile) | T3 (routing gate) | Claude Opus 5.5 | ~80 lines. Hold until decision. |
U8 -> m#502 next fix round; U9 -> m#504 next fix round (FIX-PR lane, same branches).

## Cross-area (one line each, for the operator)
- FW-COACH: AcceptInvite signed-in "Continue" drops the code (m#502 B2, `AcceptInviteScreen.tsx:126-131`), escalated in that PR body, no fix job yet.
- FW-NOTIF: onboarding_abandoned push deep link is `tgp://onboarding` (copy.ts:53); confirm it lands somewhere useful (pushTapRouter handles kind 'onboarding').
- FW-MONEY: RootNavigator re-shows the full-screen package prompt on any boot more than 24 h after a dismissal (`RootNavigator.tsx:848-869`); check it is not a nag loop.
- FW-ROMAN: lean-path clients never see P0 box 2; Roman consent is first asked at the first Roman chat; verify that path there.

## Not fixed (needs operator)
- D1 (Day-1 flow): recommended default = never show Day-1 after lean; retire Day-1 screens later; consider holding m#508 effort. File: RootNavigator.tsx:797-823.
- D2 (ask for a coach code once): recommended default = yes; RoleSelection auto-continues when no code was entered (RoleSelectionScreen.tsx:365-505, after m#502 merges).
- D3 (daily check-in time): recommended default = remove the step (or wire a real daily reminder later as NEW).
- Sequencing: ONB-RESEND-128 after m#502 and m#503 merge.

## HANDOFF
Audit complete for FW-ONB-128. B=2 (B1 resend link, B2 tour truth), U=12, 3 decisions. Nothing built. Read worktrees
wt/FW-ONB-128-mobile (main f240af37) and wt/FW-ONB-128-backend (main 675242fd) are detached and may be removed by the operator.
A fresh agent continuing this: launch the jobs in section (5) in the stated order; re-check line numbers on the then-current main.

## Not checked (stopped at the 14:46 credit emergency)
- Google / Apple sign-up paths for clients; the Supabase confirmation email text (lives in Supabase, not in the repos).
- The consultation chapters one by one (only the routing, P0 consent and finish were traced; m#509 covers how it looks).
- Whether production has any coach with an active clinic program set (no Supabase query was run), so it is not known whether any client reaches the consultation today.
- Where Home's coachless slot and the coach-code sheet go after a code is entered (FW-COACH area).
