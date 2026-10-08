# JOBS133 — lane 133, client journey to spec (operator agent 133, pre-written 16:35 PDT 8 October 2026)
# Pre-written from the bug register B01-B41, rescue/BRIEF.md and RECON133.md, before the combined plan landed. When
# rescue/ORCHESTRATOR_PLAN_132.md lands, the operator maps each entry to its plan point numbers, re-orders, and adds or drops entries;
# the plan wins where it differs. Every entry obeys _COMMON_133.md Q1-Q10. Owner yes is needed before launch ("execute").

## Order and dependencies
Wave 1 (start together): CONSULT-ALL-BE-133, DS-PRIMITIVES-133, ROMAN-CONTEXT-133, then CONSULT-ALL-M-133 once agent 132 writes
"OK src/navigation/RootNavigator.tsx" and "OK eas.json" in COORDINATION.md. Lenses LN-OPUS-A-133 and LN-SOL-A-133 start with wave 1.
Wave 2 (after DS-PRIMITIVES-133 merges): AUTH-ENTRY-133, CONSULT-PARITY-133, ROMAN-ROOM-133, TOUR-133.
Wave 3: CLIENT-HOME-133 (after COACHLESS-LOG-132 merges), LEAN-CUT-133 (after the consultation is verified on both phones; decision 133-7).
Production seed of the house programs: an operator step after decision 133-2 and the merge + deploy of CONSULT-ALL-BE-133.

---

### CONSULT-ALL-BE-133 (claude_opus_5_5, T4: tenancy + health data) — B14, B23 (consultation part), B33; owner decision 28
Worktree: /home/user/workspace/wt/CONSULT-ALL-BE-133-backend. One PR first (<800 lines); split if larger (say so in READY).
WHY (RECON133 F1, F2): GET /me/onboarding `consultation_available` (src/onboarding/onboarding.service.ts:611-612, clinicConfiguredFor
:616-634) is false unless the client has a coach with an active ClinicProgramSet; complete() refuses coachless clients (:674-682
not_attached) and coaches without a set (:717-722 clinic_not_configured). Production has 0 ClinicProgramSet rows, so nobody has ever
reached the consultation. Introduced by 73e71cd5 (2026-10-06, S-REVENUE-124).
Build:
(1) A HOUSE program set: one ClinicProgramSet marked as the platform's house set (smallest safe shape: a configured owner coach id,
    e.g. env HOUSE_PROGRAMS_COACH_ID declared in .github/fly-env-desired-state.json as "unset" until the operator sets it, or a boolean
    column if the schema route is cleaner; pick one, justify it, migrations only if needed).
(2) Set resolution for complete() and consultation_available: the client's coach's own active set, else the house set. Coachless
    clients (decision 133-1 default) finish the consultation WITHOUT being attached to any coach: the chosen master program is cloned
    into the client's own tenant (follow the INT-607-1 tenant rule in complete(); explain the tenant you choose for a coachless clone and
    prove a coach can never list it). A client of a coach with no set gets the house programs, shown under the coach's name (decision
    133-3 default).
(3) consultation_available = true for every student once a usable set resolves; keep the field (older apps read it).
(4) Failing-first tests: coachless completes; coached-with-set unchanged; coached-without-set falls back; idempotent replay unchanged;
    no cross-tenant read (a coach cannot see a coachless client's clone); consent_missing still enforced.
(5) Seed path: change nothing in seed/clinic-programs.v1.json (its approval fields change only after decision 133-2, in a separate
    operator PR). Add a workflow_dispatch `clinic-programs-seed.yml` ONLY if it can run scripts/seed-clinic-programs.ts on the Fly
    machine without printing secrets or rows (dry-run default; apply requires an input equal to "<fixture_version>:<sha256>"); otherwise
    write the exact operator steps in your report. Never run it.
Then wait for verdicts (Q3).

### CONSULT-ALL-M-133 (claude_opus_5_5) — B14, B18, B20, B21, B33, B40 (consultation part)
Worktree: /home/user/workspace/wt/CONSULT-ALL-M-133-mobile. Starts only after agent 132's "OK src/navigation/RootNavigator.tsx" and
"OK eas.json" lines (or agent 132 makes those two edits in its lane; then this job is the consultation side only).
(1) Every new student goes to the consultation: RootNavigator.tsx consultationApplies() (:342-351) and :765-775 stop choosing the lean
    flow; a server `consultation_available: false` (old backend) shows the calm server state (prototype 44) with retry, never the lean
    flow. (2) consultationOnboarding and clientTutorial true in every eas.json store and test profile (preview, production, clinic,
    clinic-apk) and in the config/expected-env.json + validate-app-config guards; the lean navigator becomes unreachable (deletion is
    LEAN-CUT-133). (3) ConsultationFlow handles `not_attached` / `clinic_not_configured` from an old server with the prototype 44
    calm error, never a dead end. (4) Tests: routing for coachless, coached, returning client with onboarding_complete, lean marker from
    an earlier install. Parity table for 03, 41-44. Then wait for verdicts.

### DS-PRIMITIVES-133 (claude_opus_5_5) — B13, B15, B16, B19, B28, B39 (lane 133 files)
Worktree: /home/user/workspace/wt/DS-PRIMITIVES-133-mobile. The shared parts every client screen uses; replacement, not patching.
(1) A Screen wrapper (react-native-safe-area-context insets top and bottom plus the prototype's breathing room under the status bar;
    keyboard-aware footer above the gesture bar). (2) Buttons: one primary (forest fill, bone text, full width, prototype height and
    spacing, pressed state, light haptic, disabled and loading states) and one quiet text link; shape per decision 133-4 (default soft
    12-point corners). (3) Serif headline text that never clips descenders on Android (lineHeight rule in src/theme/tokens.ts type scale;
    a test that asserts lineHeight >= 1.2 x fontSize for every serif role). (4) The wheel picker band sits behind the selected value as
    two hairlines or a tinted band under the text (B19, S5; consultation components.tsx wheels). (5) Move the lane-133 screens off
    SafeAreaView from 'react-native': auth/WelcomeScreen, client/HomeScreen, MembershipScreen, MoreScreen, PlanScreen, Day1WinScreen,
    BloodworkEntryScreen, components/trust/TrustExplainerSheet, components/BloodworkDisclaimerModal (not the lean screens: they retire;
    not coach or entitlements files). (6) src/theme/README.md rows. Parity table against 00, 03, 07, 08, 09 (wheels), 37.

### ROMAN-CONTEXT-133 (claude_opus_5_5, T4: health data + AI) — B31, B32
Worktree: /home/user/workspace/wt/ROMAN-CONTEXT-133-backend (and -mobile only if the consent sheet needs a fix).
WHY (RECON133 F6): Roman says it cannot see the client when the context bundle is null (src/roman/roman.service.ts:1005-1010,
loadTurnBundle :1438-1451 returns null on any getBundle error). Find which error a coachless client hits (reproduce in a test with a
coachless student, no package, FEATURE_COACHLESS_HOME on; read src/roman/context/roman-client-context.service.ts buildFresh and
roman-coach-scope.ts). Fix it so Roman knows the client's name, targets, plan, food log and check-ins for coached AND coachless clients,
within the consent the client gave. Verify on the mobile side that "Before Roman answers" (prototype 68) appears before the first answer
for a client without consent on file; fix only if it does not. Failing-first tests. Never quote crisis or eating-disorder copy (Sol rule).

### AUTH-ENTRY-133 (gpt_6_1_sol) — B11, B12, B13, B17; prototype 00, 01, 02 (75-76 for the coach role row only)
Worktree: /home/user/workspace/wt/AUTH-ENTRY-133-mobile. After DS-PRIMITIVES-133 merges.
(1) TGP wordmark, never "GP" (WelcomeScreen.tsx:30). (2) Welcome (00): eyebrow "PERSONAL TRAINING, IN YOUR POCKET", serif title, hairline,
"A plan, daily targets, and a coach who knows you.", "Get started" filled + "Log in" link (same two actions as today). (3) Role (01):
"How will you use The Growth Project?" with two quiet rows and radios, one Continue, "I have an invite code" link; the coachless line
"You can join a coach any time from Settings." when no coach is chosen. (4) Create account (02): "Continue with Apple" first, Google when
the signup policy advertises it (LoginScreen.tsx:119-125 rule), email form below, eyebrow "Joining <coach first name>" when a code or
link is known, show-password, required/optional marks. (5) Safe areas and breathing room via DS-PRIMITIVES. Do not touch
ResendVerificationLink.tsx (COACH-EDGES-132 owns it until m#576 merges). Parity table 00-02. A T4 auth change (session handling, token
storage) is out of scope for a Sol builder: write it up.

### CONSULT-PARITY-133 (claude_opus_5_5) — B21, B33 and prototype 03-45 at 90%
Worktree: /home/user/workspace/wt/CONSULT-PARITY-133-mobile. After DS-PRIMITIVES-133; two PRs: (a) questions 03-36, (b) reveals and
states 37-45. Screen by screen against shots/NN.png and the notes OCR: chapter eyebrow "Chapter N of 8 · <name>", segmented progress,
time left, "Finish later", the reason line under every question, smart defaults and auto-advance where the notes say so, wheels (B2 date
of birth, B3 height and weight with Imperial/Metric, B4 goal weight with "No number, just the goal"), the safety chapter (PAR-Q, the
physician message P8 that never blocks, under-16 stop 45), the editable summary 37, preparing 38, macro reveal 39 ("Why these numbers"),
plan reveal 40 for programs A, B and C with the first session date, resume card 41, welcome back 42, offline 43, calm server error 44.
Keep P0 where the code has it (after W1) unless the plan says otherwise. Copy differences from the prototype are listed, not silently
made. Parity table per screen. Then wait for verdicts.

### ROMAN-ROOM-133 (claude_opus_5_5) — B27, B30; prototype 67-74
Worktree: /home/user/workspace/wt/ROMAN-ROOM-133-mobile. After DS-PRIMITIVES-133. The owner's brief: "a luxurious AI chat room, the UI
and class of a premium Anthropic mixed with iMessage". src/screens/roman/RomanChatScreen.tsx, src/components/roman/**: Roman's replies
as calm serif reading text on bone (no bubble), the client's messages as quiet right-aligned bubbles, a launch state with Roman's
portrait (never cropped, B27), a one-line introduction and four quick-start chips (Explain my targets, Today's workout, Hit my protein,
How was my week, per 69-73), a composer that floats above the keyboard and the gesture bar with the forest send button, streaming that
feels like reading, history and "Your conversations" kept. Guidance entry (67) where today's You tab has it; Privacy > Roman revocation
(74). No layout change to tabs. Parity table 67-74.

### TOUR-133 (gpt_6_1_sol) — B33; prototype 46-66, adapted to today's 6 tabs (owner 16:20)
Worktree: /home/user/workspace/wt/TOUR-133-mobile. After DS-PRIMITIVES-133 and CONSULT-ALL-M-133. src/tutorial/**,
src/components/tutorial/**: the prototype's beats (welcome, your plan card on Train, first exercise, Food log and add control, daily
targets card, message your coach, completion) on our tabs; step count per decision 133-5 (default the prototype's 7, Calendar, Community
and wearables folded into the completion line); "Show me around" opt-in, skip with confirm (64), passive re-offer (65), no-plan variant
(66), push priming after value with a single Continue (61-62), landing Home (63). Coachless clients: the "message your coach" beat becomes
the Roman beat. Parity table 46-66.

### CLIENT-HOME-133 (gpt_6_1_sol) — B25, B26 (label fit), B28, B29, B34
Worktree: /home/user/workspace/wt/CLIENT-HOME-133-mobile. After COACHLESS-LOG-132 merges (it owns the locks). Home header never says
"Message your coach" without a coach (Roman or "Join a coach" instead); the date line reads naturally (B34, "Thursday, 8 October" style
per the doctrine); real targets instead of dashes once the consultation has run, a calm line before; breathing room on every client tab
root; the Community tab label fits on one line at 360 pt and at large text (no tab removed). Parity reference 63 (layout stays ours).

### LEAN-CUT-133 (gpt_6_1_sol) — decision 27 cleanup, decision 133-7
Worktree: /home/user/workspace/wt/LEAN-CUT-133-mobile. Only after the operator confirms the consultation ran end to end on both phones.
Delete LeanOnboardingNavigator.tsx, src/screens/onboarding/Lean*, finalizeLeanOnboarding.ts and the unreachable OnboardingStep1-10 /
OnboardingResults files if nothing routes to them; list every route before and after; keep data migrations for users who finished the
lean flow (onboarding_complete stays honoured).

---

### LN-OPUS-133 (claude_opus_5_5) and LN-SOL-133 (gpt_6_1_sol) — instance A each; B instances only if the queue passes 4 READY PRs
Review every [133] PR at its exact head, oldest READY first (Q4 of the 132 header + Q5 here). For every mobile UI PR: open the named
prototype screens in /home/user/workspace/specs133/shots/ and check the parity table claim by claim; a missing parity table or an
unsupported "matches" is a B. T4 scan first on CONSULT-ALL-BE-133 and ROMAN-CONTEXT-133 (tenancy, health data, consent). End when every
builder in the lane has a notify file and nothing needed you for 15 minutes, or at the operator's stop.
