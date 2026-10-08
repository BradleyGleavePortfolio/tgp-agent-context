# RECON133 — operator agent 133, client journey to spec (recon 16:10-16:35 PDT, 8 October 2026; read-only, nothing launched)

Every finding is labelled "seen in a test" (the owner's Android test, screenshots S0-S9), "from the code", or "from production" (Supabase
SELECT, counts only). GitHub wins over this file: re-verify before acting.

## 0. Owner ruling 16:20 (binding, given to agent 133; posted to COORDINATION.md 16:21, commit 9d570f5)
Verbatim: "its not about the exact screen layout - its about the consultative onbaording flow - forget exact screen laypout - we want 90%
the same without changing our layouts basics like button count - the flow prototype knew only of our onbaording not our entire app specs".
Meaning for lane 133:
- The prototype governs the ONBOARDING FLOW (auth entry 00-02, consultation 03-45, reveals 37-40, tour 46-66, Roman consent 68) at about
  90% fidelity: order, questions, reasons, chapters, progress, states, voice, the one-filled-button rule.
- The app keeps its own layout basics: the 6 client tabs (Home, Train, Food, Calendar, You, Community) stay; button counts stay; no tab cut.
- The tour is adapted to today's tabs. B26 becomes label fit only (Community wraps), not "4 tabs". Prototype 63-67 (Home, More) are
  reference, not a layout order.

## 1. What I read
- Owner attachments in this session: TGP Clinic Flow Prototype (PDF, 103 pages = the 87 screens, 16 pages are second captures of the
  same screen), TGP Onboarding Pathways and Prototype Review (rating 7.5/10; Part A 12 refinements, Part B 10 ideas), the bug register
  B01-B41, the agent 133 start prompt, the agent 132 start prompts (both versions), Mobile App Design Intelligence (docx, ~17.8k words;
  headings and the implementation rules), the 11 owner screenshots.
- tgp-agent-context @ 384e413 (then 9d570f5 after my line): handoffs/op-132/AGENT_133_START_PROMPT.md (repo copy, newer than the
  attachment: owner 15:29 answers, "no build 8 until PERFECTION"), OPERATORS_COMMON_132.md, COORDINATION.md, rescue/BRIEF.md (full),
  ops/FLEET132.md, ops/HOLD.txt, ops/lanes132/_COMMON_132.md (Q1-Q11), LAUNCH132.md, JOBS132.md tail; SoT A7.1 launch path;
  handoffs/op-131/ops/reports/AUD-FIN-ONB-129.md; handoffs/op-590e4a5b/NEXT_OPERATOR_PROMPT_v3.md:290-295.
- Not yet in the repo (checked 16:25): rescue/reports/R01-R15 and rescue/ORCHESTRATOR_PLAN_132.md. JOBS133 below is pre-written from the
  register and this recon; it is re-ordered to the combined plan's point numbers when the plan lands.
- The prototype zip is not in this session. The owner's PDF is the capture: rendered to /home/user/workspace/specs133/shots/NN.png
  (00-86, the phone frame at 150 dpi), index /home/user/workspace/specs133/shots/index.json (screen -> PDF pages), and OCR of every page's
  phone text and notes panel in /home/user/workspace/specs133/PROTOTYPE_NOTES_OCR.md (OCR: check against the image).

## 2. Verified on GitHub and production (16:12-16:30)
- Mobile main df7b8ae9 (m#575 14:21). Backend main 051583ad (b#884 14:24). Production deploy 42 at 477a2c8a (b#884 after it, config
  only). Context repo 384e413 at start.
- Rescue PRs (board 16:20): b#889 SETUP-STALE-132 @ 3c3eb99d, 256 lines, CI green, READY, no verdicts. b#888 COACHLESS-LOG-132 @ 9f4d3753,
  268 lines, CodeQL failing, not READY. m#576 COACH-EDGES-132 @ 22919982, 495 lines, CI green, READY, no verdicts. START-HANG-132: no PR
  yet. No agent133/* branch exists. HOLD.txt (agent 132, 13:08): no PR held.
- Backend flags (.github/fly-env-desired-state.json @ 051583ad): FEATURE_ROMAN_CHAT_ENABLED, FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_TOOLS,
  FEATURE_ROMAN_PLAYBOOK, FEATURE_ROMAN_ADJUST_ENABLED, FEATURE_AI_CONSENT_LEDGER_ENABLED, FEATURE_COACHLESS_HOME all true.
- Mobile flags (eas.json @ df7b8ae9): consultationOnboarding and clientTutorial are true only in `clinic` (and `clinic-apk`, which
  extends it); preview and production leave both off (src/config/featureFlags.ts:107, :123 default false).
- Production (SELECT, counts only, 16:2x): ClinicProgramSet 0 rows (0 active); ClientOnboardingIntake 0 rows (0 completed); clients 2
  (1 coachless); coaches/owners 3.

## 3. Findings in lane 133

F1. B14 root cause is NOT the flag (corrects BRIEF B14 and the register line "your app was a general build").
- Seen in a test + from the code: the owner's APK was profile `clinic-apk` (FLEET132 13:46, build eabf849b, versionCode 6), which
  extends `clinic`, so EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING was true. Proof on the phone: the Community and Calendar tabs in S6-S8
  exist only with clinic-profile flags merged in.
- From the code: RootNavigator.tsx:342-351 `consultationApplies()` asks GET /me/onboarding and sends the client to the lean flow when
  `consultation_available` is false (RootNavigator.tsx:765-775). Backend onboarding.service.ts:611-612 sets it from
  `clinicConfiguredFor()` (:616-634): the client needs a coach AND that coach needs an active ClinicProgramSet.
- From production: 0 ClinicProgramSet rows. So in EVERY build, for EVERY client (coached or not), the consultation has never been
  reachable. The owner's coachless test could only ever get the lean flow.
- WHEN/WHO: the gate is 73e71cd5 (2026-10-06, S-REVENUE-124, B-REV-1) "say when the consultation can finish so coachless clients are not
  stuck". AUD-FIN-ONB-129 R-3 (handoffs/op-131/ops/reports/AUD-FIN-ONB-129.md:65, :104) found "the consultation is dark for everyone"
  and the default chosen was "leave dark for launch (lean flow is the onboarding)". It was never put to the owner as a blocking decision.
- The fixture backend seed/clinic-programs.v1.json has sha256 be932a56... (matches "The fixture is approved, sha256 be932a56" in
  op-590e4a5b, 1 Oct) but its own fields still say approval_status "draft-owner-approval-required" and production_seed_authorized false.
  scripts/seed-clinic-programs.ts refuses production unless both the fixture flag and CLINIC_PROGRAMS_SEED_APPROVED=<version>:<sha> are
  set. No workflow runs it (backend .github/workflows has none); docs/clinic-onboarding.md:379-393 shows only a local run.

F2. Coachless clients cannot finish the consultation even after a seed (from the code): onboarding.service.ts:674-682 throws
`not_attached` without a coach; :717-722 throws `clinic_not_configured` without the coach's own set. This contradicts owner decision 28
(15:29). The fix is backend (my lane: consultation and programs modules) plus a house program set.

F3. The consultation itself is built and close to the prototype (from the code; never seen on a device by anyone):
src/lib/consultation/definitions.ts holds W1, P0, G1-G2, B1-B4 (goal weight is its own question, so B20 disappears once the consultation
runs), L1-L2, T1-T4, S1-S3b, N1-N5, P1-P8, C1 = prototype 03-36. One deliberate difference: P0 (agreement) sits right after W1, not in
chapter 7 (consultation README: "a single I agree box straight after it"). RevealScreens.tsx holds summary, preparing, macro and plan
reveal. B18 and B21 are lean-flow screens and disappear with it.

F4. The tour exists and already fits today's tabs (from the code): src/tutorial/tutorialSteps.ts:193-417 has 11 steps (welcome, plan,
macros, community, coach_messages, calendar, wearables, first_meal, first_message, welcome_call, complete) vs the prototype's 7. It starts
only after the consultation (TutorialHost.tsx:99), so it has also never run. B33 = F1.

F5. Design tokens already match the prototype (from the code): forest #2C4A36 on bone, Cormorant Garamond display + Inter
(src/theme/tokens.ts:20, :39, :141-220). The gaps are components and layout, not tokens:
- WelcomeScreen.tsx:30 renders the "GP" box (B11); :48 "Sign in" filled, :59 "Create account" (prototype 00: eyebrow "PERSONAL TRAINING,
  IN YOUR POCKET", serif title, hairline rule, tagline, "Get started" filled + "Log in" link: same button count).
- 29 files import SafeAreaView from 'react-native' (iOS-only top/bottom padding, B13 B28 B39). In lane 133: screens/auth/WelcomeScreen,
  client/HomeScreen, MembershipScreen, MoreScreen, PlanScreen, Day1WinScreen, BloodworkEntryScreen, components/trust/TrustExplainerSheet,
  components/BloodworkDisclaimerModal; the 6 lean screens retire. (Coach and entitlements files belong to lanes 134 and 132.)
- CreateAccountScreen.tsx has no Apple or Google button (only LoginScreen.tsx:30-33 does); prototype 02 starts with "Continue with Apple".

F6. Roman (B31) from the code: Roman says it cannot see the client when the context bundle is null: roman.service.ts:1005-1010 sets
`clientDataUnavailable`, and loadTurnBundle (:1438-1451) returns null on any getBundle error (logged as roman.context_failed). Which
error the coachless client hits is unverified (R11; no log access without the forbidden Fly Logs workflow). Consent screen exists
(MoreStack RomanAiConsent); whether it showed before the first answer (B32) is unverified.

F7. Tabs (from the code): ClientNavigator.tsx:122-191 renders Home, Train, Food, Calendar (clientCalendar), You, Community (communityTab).
Per the owner's 16:20 ruling they stay. B26 = the Community label wraps at 360 pt wide.

## 4. Sandbox
- Clones: /home/user/workspace/repos/{tgp-agent-context,growth-project-mobile,growth-project-backend} (blobless).
- ops/: scripts copied from handoffs/op-132/ops/; HOLD.txt copied; board.py branch filter widened to agent127-134 so agent133/* PRs show.
- Token file ops/.ghtoken (600) written; board_loop.sh running (nohup setsid, started from a bash call with the github credential).
- No worktrees yet (made at execute, one per builder, real node_modules). No eas-cli: builds belong to the release lane (agent 132).

## 5. NEED lines posted for files outside lane 133
- src/navigation/RootNavigator.tsx (agent 132): consultationApplies() must send every new student to the consultation.
- eas.json (release lane): consultationOnboarding and clientTutorial true in preview and production too, so no build is a "general
  build" again.
