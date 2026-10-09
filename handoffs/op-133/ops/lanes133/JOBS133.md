# JOBS133 — lane 133, client journey to spec (operator agent 133, pre-written 16:35 PDT 8 October 2026)
# Pre-written from the bug register B01-B41, rescue/BRIEF.md and RECON133.md, before the combined plan landed. When
# rescue/ORCHESTRATOR_PLAN_132.md lands, the operator maps each entry to its plan point numbers, re-orders, and adds or drops entries;
# the plan wins where it differs. Every entry obeys _COMMON_133.md Q1-Q10. Owner yes is needed before launch ("execute").

## Order and dependencies (OWNER 16:42 "use subagents and start executing RIGHT AWAY", 16:36 "use all opus 5.5 coders")
EXECUTE given 16:42. Every BUILDER is claude_opus_5_5. Lenses stay one Opus + one Sol (the dual-lens merge rule).
Owner 16:42 also: "all those redo screens that got redesigned need actually applied - all the old ugly screens, and the thin skimpy
shitty onbaording flows, can jsut get thrown away and never used again" (decision 133-7 answered: delete the lean/old onboarding).
Launched together at 16:5x: CONSULT-ALL-BE-133, CONSULT-ALL-M-133, DS-PRIMITIVES-133, ROMAN-CONTEXT-133, REDO-AUDIT-133,
AUTH-ENTRY-133, CONSULT-PARITY-133, ROMAN-ROOM-133, TOUR-133, lenses LN-OPUS-A-133 and LN-SOL-A-133.
PARALLEL RULE for AUTH-ENTRY, CONSULT-PARITY, ROMAN-ROOM, TOUR: do flow, questions, copy, states and logic first; NEVER write your own
button, screen wrapper or headline component. DS-PRIMITIVES-133 posts its API (file paths, component names, props) in its report under
"## API" within its first hour and opens its PR first; the operator pings you when it merges; then `git merge origin/main` and use it.
File split (no two builders on one file): WelcomeScreen.tsx and src/screens/auth/** = AUTH-ENTRY only; src/screens/consultation/**
and src/lib/consultation/** = CONSULT-PARITY, except ConsultationFlow error/route handling = CONSULT-ALL-M; consultation wheels
(components.tsx) = CONSULT-PARITY (moved out of DS-PRIMITIVES); src/screens/roman/** + src/components/roman/** = ROMAN-ROOM (ROMAN-CONTEXT
touches mobile only for the consent sheet, after asking ROMAN-ROOM in its report); src/tutorial/** + src/components/tutorial/** = TOUR.
Wave 3: LEAN-CUT-133 (after CONSULT-ALL-M-133 merges; deletion approved by the owner 16:42), CLIENT-HOME-133 (after COACHLESS-LOG-132
merges), plus any apply jobs REDO-AUDIT-133 proposes.
Production seed of the house programs: an operator step after the merge + deploy of CONSULT-ALL-BE-133 (decision 133-2 default yes).

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
Worktree: /home/user/workspace/wt/CONSULT-ALL-M-133-mobile. Starts NOW on the consultation side. RootNavigator.tsx and eas.json
(+ config/expected-env.json, scripts/validate-app-config.js) are agent 132's: edit them only after agent 132 writes "OK <file>" in
handoffs/op-132/COORDINATION.md (tgp-agent-context; `git pull` and read the tail); until then write the exact diff in your report under
"## DIFF FOR 132" and tell the operator.
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
    spacing, pressed state, light haptic, disabled and loading states) and one quiet text link; shape per OWNER 17:07 (header Q10b): rounded and luxurious, never
    rectangles; you set the radius tokens and rewrite doctrine rule 5 and its test. (3) Serif headline text that never clips descenders on Android (lineHeight rule in src/theme/tokens.ts type scale;
    a test that asserts lineHeight >= 1.2 x fontSize for every serif role). (4) A shared wheel-band style token (hairlines or a tinted band BEHIND the selected value) that CONSULT-PARITY-133 applies to the
    consultation wheels (B19, S5); you do not edit consultation files. (5) Move the lane-133 screens off
    SafeAreaView from 'react-native': client/HomeScreen, MembershipScreen, MoreScreen, PlanScreen, Day1WinScreen,
    BloodworkEntryScreen, components/trust/TrustExplainerSheet, components/BloodworkDisclaimerModal (not the lean screens: they retire;
    not coach or entitlements files). (6) src/theme/README.md rows. Post "## API" in your report and open the PR FIRST (others wait on it). Parity table against 00, 03, 07, 08, 09 (wheels), 37.

### ROMAN-CONTEXT-133 (claude_opus_5_5, T4: health data + AI) — B31, B32
Worktree: /home/user/workspace/wt/ROMAN-CONTEXT-133-backend (and -mobile only if the consent sheet needs a fix).
WHY (operator trace 16:40, from the code + production data; NOT yet reproduced): the owner's turn at 2026-10-08 21:48:14Z was a
coachless student on surface 'client' and ran in DEGRADED mode: the reply is ROMAN_CLIENT_DATA_UNAVAILABLE_NOTICE (roman.prompts.ts:127-131,
pushed at :201 only when the bundle is null), and the whole prompt was 2,837 tokens (no client_data block). The bundle is null only when
getBundle throws (roman.service.ts loadTurnBundle :1438-1451 logs `roman.context_failed: <tag>` + Sentry). The context code itself
handles a null coach (every coach-only query is skipped). All 211 repo migrations are applied in production, enums match, and Postgres
logged NO error at 21:48, so the throw is client-side (Prisma row decoding or JS). PRIME SUSPECT: production UserProfile.preferred_snacks
is NULL for this client while prisma/schema.prisma declares `preferred_snacks String[]` (required list; the DB column is nullable; also
dietary_restrictions and equipment_access are nullable in the DB). build() selects `profile: true`, so Prisma 6.19.3 may fail decoding
the NULL list ("Inconsistent column data: List field did not return an Array"). Find and fix:
(1) Reproduce failing-first against a real Postgres (heavy.sh, or a local postgres + `prisma db push`) with a NULL preferred_snacks row.
    If it does not reproduce, find the real throw (try each Q in build() and renderClientContext) and say so plainly.
(2) Fix the read (explicit profile select, or a NOT NULL DEFAULT '{}' migration + backfill reviewed as T4; justify) AND find every
    writer that leaves NULL there (lean finalize? a raw SQL path? Supabase client writes?) and every other reader of `profile: true`
    that breaks the same way (list them; fix the ones in your lane, NEED lines for the rest).
(3) Roman knows the client's name, targets, plan, food log and check-ins for coached AND coachless clients, within the consent given.
    A test with a coachless student whose profile has NULL lists proves client_data is present.
(4) Verify on mobile that "Before Roman answers" (prototype 68) appears before the first answer for a client without consent on file;
    fix only if it does not (ask ROMAN-ROOM-133 first; it owns src/screens/roman/**). Never quote crisis or eating-disorder copy.

### AUTH-ENTRY-133 (claude_opus_5_5) — B11, B12, B13, B17; prototype 00, 01, 02 (75-76 for the coach role row only)
Worktree: /home/user/workspace/wt/AUTH-ENTRY-133-mobile. After DS-PRIMITIVES-133 merges.
(1) TGP wordmark, never "GP" (WelcomeScreen.tsx:30). (2) Welcome (00): eyebrow "PERSONAL TRAINING, IN YOUR POCKET", serif title, hairline,
"A plan, daily targets, and a coach who knows you.", "Get started" filled + "Log in" link (same two actions as today). (3) Role (01):
"How will you use The Growth Project?" with two quiet rows and radios, one Continue, "I have an invite code" link; the coachless line
"You can join a coach any time from Settings." when no coach is chosen. (4) Create account (02): "Continue with Apple" first, Google when
the signup policy advertises it (LoginScreen.tsx:119-125 rule), email form below, eyebrow "Joining <coach first name>" when a code or
link is known, show-password, required/optional marks. (5) Safe areas and breathing room via DS-PRIMITIVES. Do not touch
ResendVerificationLink.tsx (COACH-EDGES-132 owns it until m#576 merges). Parity table 00-02. A T4 auth change (session handling, token
storage) needs the T4 scan in the PR body.

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

### TOUR-133 (claude_opus_5_5) — B33; prototype 46-66, adapted to today's 6 tabs (owner 16:20)
Worktree: /home/user/workspace/wt/TOUR-133-mobile. After DS-PRIMITIVES-133 and CONSULT-ALL-M-133. src/tutorial/**,
src/components/tutorial/**: the prototype's beats (welcome, your plan card on Train, first exercise, Food log and add control, daily
targets card, message your coach, completion) on our tabs; step count per decision 133-5 (default the prototype's 7, Calendar, Community
and wearables folded into the completion line); "Show me around" opt-in, skip with confirm (64), passive re-offer (65), no-plan variant
(66), push priming after value with a single Continue (61-62), landing Home (63). Coachless clients: the "message your coach" beat becomes
the Roman beat. Parity table 46-66.

### CLIENT-HOME-133 (claude_opus_5_5) — B25, B26 (label fit), B28, B29, B34
Worktree: /home/user/workspace/wt/CLIENT-HOME-133-mobile. After COACHLESS-LOG-132 merges (it owns the locks). Home header never says
"Message your coach" without a coach (Roman or "Join a coach" instead); the date line reads naturally (B34, "Thursday, 8 October" style
per the doctrine); real targets instead of dashes once the consultation has run, a calm line before; breathing room on every client tab
root; the Community tab label fits on one line at 360 pt and at large text (no tab removed). Parity reference 63 (layout stays ours).

### LEAN-CUT-133 (claude_opus_5_5) — decision 27 cleanup, decision 133-7
Worktree: /home/user/workspace/wt/LEAN-CUT-133-mobile. Owner 16:42 approved deleting the old and thin onboarding outright. Starts after
CONSULT-ALL-M-133 merges.
Delete LeanOnboardingNavigator.tsx, src/screens/onboarding/Lean*, finalizeLeanOnboarding.ts and the unreachable OnboardingStep1-10 /
OnboardingResults files if nothing routes to them; list every route before and after; keep data migrations for users who finished the
lean flow (onboarding_complete stays honoured).

### REDO-AUDIT-133 (claude_opus_5_5, read-only first) — owner 16:36/16:42 "did all of that go to waste" / "need actually applied"
No worktree for phase 1: read /home/user/workspace/wt/RO-mobile (main df7b8ae9) and GitHub. FACTS (operator, 16:45): the 48 DES-*-127/128
redo PRs (mobile #465-#516 and #552, agent127/des-* and agent128/des-*) ALL merged on 10-07 and ARE in the owner's APK (a3a1c18e
contains #465, #509, #516, #552). Agent 132's R01 FORENSICS covers the history; you cover APPLICATION in lane 133.
Phase 1 (report within ~45 min, then notify): a table, one row per redo PR: PR | screen(s) | what it changed (copy, states, layout,
components) | reachable in the owner's build for a coachless client and a coached client (route + flag) | does it meet the prototype
and Q5 (look, not just copy) | verdict: KEEP / REDO TO PROTOTYPE (name the lane-133 job that absorbs it) / UNREACHABLE (why) / DELETE.
Also list every OLD screen or flow in lane 133 that the consultation makes dead (lean flow, OnboardingStep1-10, OnboardingResults,
Day1Win paths, old welcome variants) with the route that still reaches it. Name coach-side items for agent 134 (do not edit them).
Phase 2: only on the operator's go, open the lane-133 apply PRs the table proposes that no other job covers.

---

### LN-OPUS-133 (claude_opus_5_5) and LN-SOL-133 (gpt_6_1_sol) — instance A each; B instances only if the queue passes 4 READY PRs
Review every [133] PR at its exact head, oldest READY first (Q4 of the 132 header + Q5 here). For every mobile UI PR: open the named
prototype screens in /home/user/workspace/specs133/shots/ and check the parity table claim by claim; a missing parity table or an
unsupported "matches" is a B. T4 scan first on CONSULT-ALL-BE-133 and ROMAN-CONTEXT-133 (tenancy, health data, consent). End when every
builder in the lane has a notify file and nothing needed you for 15 minutes, or at the operator's stop.

---

## REDESIGN WAVE (OWNER 17:10: "start the mobile redesigns that were unfinished - start with that")
These finish the 10-07 redesign program that stopped at the credit stop. Briefs (read the named section in
/home/user/workspace/repos/tgp-agent-context/handoffs/; `git -C /home/user/workspace/repos/tgp-agent-context pull -q` first):
DESIGN-QA-128 = op-131/ops/reports/DESIGN-QA-128.md (table "Fix jobs", the row named in your entry, plus "To DES-P-128");
AUD-FIN-DESIGN-129 = op-131/ops/reports/AUD-FIN-DESIGN-129.md; DES-P-128 = op-128/ops/JOBS128.md:167; DES-AQ-127 and DES-AZ-127 =
op-127/ops/DES-JOBS-PASTE.md:914 and :1174.
RULES FOR EVERY REDESIGN JOB (they win over the old briefs):
R1. The briefs are two days old: verify every file:line row against main first; drop what is already fixed, say so in the PR body.
R2. OWNER 17:07 (header Q10b): rounded, luxurious corners. EVERY old brief line that says "radius ... to 4" or "radius 0 to 4" is
    REVERSED: use the radius tokens DS-PRIMITIVES-133 publishes (defaults: buttons/inputs 12, cards 16, sheet tops 24, chips pill).
R3. The old row list is the floor, not the ceiling. The bar is design-targets/mobile/CATALOG.md and its luxury.jpg images in the
    context repo (progress-details, plan, plan-fullweek, ai-guide, clientfile-workouts and the rest): "would a person looking at this
    screen next to the reference believe both came from the same studio?" Serif titles, overlines, hairline sections, generous
    margins, tabular numbers, one filled forest action per screen, calm load/empty/error states. Keep every route, handler,
    action and tab (owner 16:20: button counts and the 6 tabs stay).
R4. Use the shared parts from DS-PRIMITIVES-133 (src/ui/: PrimaryButton, QuietRow, Overline, QuietSection, radius tokens,
    HapticPressable with the haptics switch). Never write your own. Start now with R1 verification, structure, copy (sentence
    case, truthful states) and layout; read "## API" in /home/user/workspace/ops/reports/DS-PRIMITIVES-133.md as soon as it is
    posted. You MAY `git merge origin/agent133/ds-primitives-133` into your branch to build against it, but open your PR only
    after DS-PRIMITIVES merges to main (check `git -C <worktree> fetch -q origin && git log origin/main --oneline -30` every 10
    minutes), then `git merge origin/main`. Never edit src/theme/**, src/ui/** primitives or src/__tests__/quietLuxuryDoctrine.test.ts
    (DS-PRIMITIVES owns them); add new test files instead.
R5. PR body: the parity table against the CATALOG reference you matched (folder name) and what differs and why; what was not
    seen on a device. Under 800 lines; split into two PRs when the brief is two jobs.

Each entry below points at its "### APPLY-..." section in /home/user/workspace/ops/reports/REDO-AUDIT-133.md (re-checked against main
df7b8ae9 at 17:05-17:20; its "Still wrong" list is your starting checklist; R1-R5 above still apply, and R3 means go past the list).
Lanes (operator 17:15): src/screens/settings/**, src/screens/notifications/**, src/screens/community/**, src/screens/TrustCenterScreen.tsx,
src/screens/day-one/** and src/screens/onboarding/** are lane 133. Parked: DES-AQ-127 (Community DMs and Find are behind flags that are
off; nobody can reach them).

### REDO-FOOD-133 (claude_opus_5_5) — APPLY-FOOD-133 (QA-FOOD-128). Food tab, the most used client screen. First.
Worktree /home/user/workspace/wt/REDO-FOOD-133-mobile. Keep #525/#526 load, water and stale-day behaviour exactly; no change to logging,
offline queue, portions or totals. Reference: design-targets/mobile/plan/ and plan-fullweek/.

### REDO-LIVE-133 (claude_opus_5_5) — APPLY-LIVE-133 (QA-LIVE-128). Live workout.
Worktree /home/user/workspace/wt/REDO-LIVE-133-mobile. Set logging, the rest alert (#474) and finish logic stay frozen. The finish button
becomes the shared PrimaryButton (rounded). Reference: clientfile-workouts/.

### REDO-PROGRESS-133 (claude_opus_5_5) — APPLY-PROGRESS-133 (DES-P-128, never started). Progress, "the full picture".
Worktree /home/user/workspace/wt/REDO-PROGRESS-133-mobile. Split body/chart into two PRs if over 800 lines. The FAB becomes an inline
action; keep every action listed. Reference: progress-details/luxury.jpg (the bar for this screen).

### REDO-SETTINGS-133 (claude_opus_5_5) — APPLY-SETTINGS-133, then APPLY-PROFILE-133 (two PRs)
Worktree /home/user/workspace/wt/REDO-SETTINGS-133-mobile. Settings, NotificationCenter, TrustCenter, BlockedUsers, DataExport,
DeleteAccount; then ProfileScreen (U2: the stone text fails AA). Delete-account, export and block logic frozen. These screens also open
from coach Settings: say so in the PR body. ClientTutorialSetting is TOUR-133's.

### REDO-HABITS-CAL-COMM-133 (claude_opus_5_5) — APPLY-HABITS-CAL-COMM-133 (QA-HABITS-CAL-COMM-128)
Worktree /home/user/workspace/wt/REDO-HABITS-CAL-COMM-133-mobile. Habits, CalendarSessionScreen, CommunityTodayScreen. Not ClientNavigator.

### REDO-INSETS-133 (claude_opus_5_5) — APPLY-INSETS-133, MINUS MoreScreen, PlanScreen, MembershipScreen (DS-PRIMITIVES-133 owns those)
Worktree /home/user/workspace/wt/REDO-INSETS-133-mobile. The DS screen wrapper on WorkoutScreen (:1008 top60), EditProfile, Education,
GroceryList, PrepGuide, Recipes, RecipeDetail, Report, RoutineBuilder, Widgets, ClientPackages, PackageCheckout, PurchaseUnpack,
CoachGuidelines, Messages, Leaderboard, Timeline; components/messaging/MessageBubble.tsx and ThreadV2Parts.tsx (shared with coaches:
say so). Every hardcoded radius in these files to the DS tokens. Starts after DS-PRIMITIVES-133 posts the wrapper in "## API". Two PRs
if over 800 lines.

### REDO-DEVICES-133 (claude_opus_5_5) — APPLY-DEVICES-133 (DES-AZ-127, never started). Last in priority.
Worktree /home/user/workspace/wt/REDO-DEVICES-133-mobile. Connections, WearablesShell, MetricDetailScreen. Health data stays T2: no
change to what is read or shared; consent copy untouched.

### REDO-COACH-133 (claude_opus_5_5) — coach redesign items from REDO-AUDIT-133 section 4 (QA-COACH-128, QA-SHEETS-128 coach part,
QA-COACH-SET-129). Agent 134 has not started; agent 133 claims these files in COORDINATION.md until it does.
Worktree /home/user/workspace/wt/REDO-COACH-133-mobile. Three PRs: (a) CoachNavigator.tsx presentation only (outline icons, 11 pt labels
instead of 10/600 at :707, bone bar + hairline, selection haptic; no tab, order or route change), ClientsListScreen, CoachWorkoutBuilderScreen
(pressed states), programs/ProgramsLibraryScreen; (b) coach AI sheets (AiBuilderSheet, WeekAiSheet, AdjustForClient, RevisionHistorySheet,
ClientCopyBar) radius tokens + HapticPressable — NOT src/entitlements/** (agent 132), NOT components/ai/AiConsentSheet.tsx (ROMAN-ROOM-133);
(c) coach SettingsScreen (QA-COACH-SET-129 in op-131/ops/reports/AUD-FIN-DESIGN-129.md). Never touch CoachWizardNavigator.tsx,
src/components/coach/setup/**, src/lib/coachSetup/** (m#576, then the coach onboarding flow). Reference: coach-home-solo/,
coach-workout-builder/, drafts-queue/.
