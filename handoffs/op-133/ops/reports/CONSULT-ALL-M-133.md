# CONSULT-ALL-M-133 (agent 133, claude_opus_5_5) — B14, B18, B20, B21, B33, B40 (consultation part)

Worktree: /home/user/workspace/wt/CONSULT-ALL-M-133-mobile, branch agent133/consult-all-m-133 off origin/main df7b8ae9.
Started 16:55 PDT. Status at 17:40: DRAFT PR growth-project-mobile#580 open with commit 1 only (df4bf89e, my lane:
ConsultationFlow calm server state + tests). Commit 2 (ceeae1ed, local branch, 9 agent-132 files: RootNavigator.tsx, eas.json,
config/expected-env.json, scripts/validate-app-config.js + the tests that pin them) is NOT pushed: no "OK <file> — 133" from
agent 132 in handoffs/op-132/COORDINATION.md (checked 16:57-17:35; agent 132's last COORDINATION line 15:33, last GitHub
activity m#576 16:01). PR #579 (CONSULT-PARITY) touches ConsultationFlow/ConsultationOnboardingNavigator: no overlap, git
merge-tree clean.

## What the change does
1. Every new student goes to the consultation (RootNavigator, agent 132's file — see DIFF FOR 132). `consultationApplies()` and
   the `consultationMode` state are deleted; `authState === 'onboarding'` always mounts ConsultationOnboardingNavigator; the lean
   navigator is no longer imported (unreachable; LEAN-CUT-133 deletes the files). Routing no longer reads GET /me/onboarding, so
   `consultation_available: false` from an older server can never pick the lean flow. A lean marker
   (`onboarding_standard_path:<userId>`) left by an earlier build is cleared for a client who never finished onboarding, so the
   consultation's finish is never followed by the lean first-win step. Clients who finished lean keep their first-win step.
2. EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING and EXPO_PUBLIC_FF_CLIENT_TUTORIAL = "true" in preview and production (clinic and
   clinic-apk already inherit them); validate-app-config fails any OTA store/test profile (preview, production, clinic, clinic-apk)
   without both; expected-env.json reasons updated (agent 132's files — see DIFF FOR 132).
3. ConsultationFlow (my lane): 409 `not_attached` / `clinic_not_configured` from an older server → the calm server state
   (CompleteProblemScreen 'unknown': "I could not prepare your plan just now." / answers kept on this phone / Try again / Contact
   support / Sign out / Back to the summary; short reference shown; reported to Sentry with the code). Never the old "A coach link
   is needed" dead end. Try again re-runs completion; a ready server goes straight to the macro reveal.
   Design choice: the old-server state shows at completion (where prototype 44 sits: "Your answers are safe"), not as a wall
   before W1, because the answers save to the server as the client goes and Try again then finishes at once when the backend
   (CONSULT-ALL-BE-133 + house-set seed) is live. Nothing is shown behind a flag.
4. Tests (failing-first against main's routing): coachless on an old server (available false) → consultation, no read, no marker;
   coached → consultation; field missing / failed read / flag off → consultation; lean marker from an earlier build, not
   finished → consultation and marker cleared; returning client with onboarding_complete (profile synced or not) → app, no
   consultation, no Day-1; finished on the server only (fresh install) → app + local flag repaired; finished lean earlier →
   first-win, no second onboarding. ConsultationFlow: not_attached and clinic_not_configured → calm state, Sentry, reference,
   Try again → MACRO; Back → summary with answers intact. Guard tests: 4 new validate-app-config cases; easUpdateGuard and
   consultationTemplates now pin the flags ON in every store/test profile and RootNavigator never mounting the lean flow.

Local runs (heavy.sh, one file at a time), all PASS: rootNavigatorConsultationAvailable (12), ConsultationFlow (32),
consultationPrivacy (66), consultationTemplates (16), rootNavigatorConsultationColdBoot (7), rootNavigatorConsultationComplete (5),
rootNavigatorOnboardingField (5), rootNavigatorPersistedCacheGate, UpdateCardLink, CheckoutLink, AcceptLink,
pendingInviteMigrationAndRefresh, PackagePromptGate, LoginRoleGateFixRound5, hunt01EmailVerifiedLink, day1OnboardingRouting,
paymentsConnectPackages, AuthCallbackScreen, pendingInviteKeyContract, crisp.service, communityFlagOff; scripts: easUpdateGuard
(74), validateAppConfigUpdates (45), expectedEnv (38), releaseEnvProfile (96), clinicApkProfile (3). `tsc --noEmit` clean.
`node scripts/validate-app-config.js` OK. Size: 13 files, +186 / -108.

## WHY / WHEN / WHO
- B14 root cause (RECON133 F1): mobile c39d1fe1 (2026-10-06, m#395, S-REVENUE-124 B-REV-1) sends a client to the lean flow
  when GET /me/onboarding says `consultation_available: false`; backend 73e71cd5 (same day) sets it false unless the coach has an
  active ClinicProgramSet; production has 0 sets, so nobody ever reached the consultation in any build.
- B40 (consultation part): m#310 (2c17c241, 2026-10-02, C05 mobile) put EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING in the clinic
  profile only; preview and production never had it or the tutorial flag.
- not_attached / clinic_not_configured copy: m#310 (2c17c241) — "A coach link is needed" fits a coached-only world and is a dead
  end for a coachless client under owner decision 28.
- B18, B20, B21 are lean-flow screens: they disappear because the lean flow is no longer mounted (B20 goal weight is its own
  question B4 in the consultation; B21 chapters are the consultation's). B33: the reveals and the tour are reachable once a
  client completes (backend CONSULT-ALL-BE-133 + seed).

## Parity table (routing and states; screens are CONSULT-PARITY-133's)
| Prototype | Today's file | What matches | What differs and why |
|---|---|---|---|
| 03 W1 Welcome from Roman | RootNavigator.tsx → ConsultationOnboardingNavigator → ConsultationFlow (W1 first) | Every new client, coached or not, lands on W1 after sign-up; no lean flow, no role-based fork | P0 sits right after W1 (consultation README, kept per JOBS133 CONSULT-PARITY) |
| 41 Finish later: Home resume card | ConsultationFlow PausedScreen | "Finish later" keeps the place and offers Continue, support, sign out; no dead end | Lands on an in-flow "Your place is kept." screen, not Home with a resume card: Home is not mounted before completion. Proposed (needs operator) below |
| 42 Resume: Welcome back | ConsultationFlow load (reconcileResume / resumeScreenId) | Re-open resumes at the first unanswered step, local + server drafts reconciled | Welcome-back line copy is CONSULT-PARITY's |
| 43 Summary offline | ConsultationFlow 'network' problem | Answers kept on the phone, Try again | Banner styling is CONSULT-PARITY's (b) |
| 44 Server error (calm) | ConsultationFlow → CompleteProblemScreen 'unknown' (now also for 409 not_attached / clinic_not_configured) | No red, no error haptic, answers safe, one forest Try again, Back | Copy "I could not prepare your plan just now." vs 44 "I couldn't reach the server": the server did answer, so "reach" would be untrue; CONSULT-PARITY owns the final 44 look |
Not seen on a device: everything above (no device here). Seen in tests through the renderer only.

## DIFF FOR 132
Exact diff (all 9 agent-132-owned files, tests included): /home/user/workspace/ops/reports/consult-all-m-133/DIFF_FOR_132.patch
(412 lines; `git apply` on df7b8ae9). My lane part alone: /home/user/workspace/ops/reports/consult-all-m-133/LANE.patch.
Core hunks:
- src/navigation/RootNavigator.tsx: drop `import LeanOnboardingNavigator` and `import { consultationApi }`; delete
  `consultationApplies()` (:342-351) and `consultationMode` state (:377); in the student branch (:761-775) replace the
  consultationApplies/marker-write block with `if (standardKey) await AsyncStorage.removeItem(standardKey).catch(warn)` then
  `setAuthState('onboarding')`; render `authState === 'onboarding' ? <ConsultationOnboardingNavigator />` (no lean branch).
  The `standardPath` line (:787) is unchanged.
- eas.json: add `"EXPO_PUBLIC_FF_CONSULTATION_ONBOARDING": "true"` and `"EXPO_PUBLIC_FF_CLIENT_TUTORIAL": "true"` to
  build.preview.env and build.production.env.
- scripts/validate-app-config.js: `ALWAYS_ON_FLAGS = [CONSULTATION_ONBOARDING, CLIENT_TUTORIAL]`; inside the EXPECTED_CHANNELS
  loop, fail `eas.json: build.<profile>.env.<name> must be "true" (B40 ...)` when not "true".
- config/expected-env.json: both flags' reasons say "must be true in every store and test profile".
- Tests: src/__tests__/rootNavigatorConsultationAvailable.test.tsx (rewritten to B14), rootNavigatorOnboardingField.test.tsx
  (mock ConsultationOnboardingNavigator), src/screens/consultation/__tests__/consultationTemplates.test.tsx (flag ON everywhere;
  no lean mount), scripts/__tests__/easUpdateGuard.test.js (production flags true), validateAppConfigUpdates.test.js (+4 cases).

## Notes for other lanes
- CONSULT-PARITY-133: PROBLEM_COPY.not_attached and .clinic_not_configured in RevealScreens.tsx are now unreachable from
  ConsultationFlow (both map to 'unknown'); delete or keep them in your PR (b). I did not touch RevealScreens.tsx.
  src/screens/consultation/README.md line 9 (flag "off in every general build") is stale once the DIFF FOR 132 lands; yours.
- TOUR-133: TutorialHost.tsx:99 still gates the tour recovery read on featureFlags.consultationOnboarding; with the eas.json
  change it is on in every store/test build.
- Owner 17:07 radius ruling: this PR adds no UI, no radius.

## Proposed (needs operator)
- P1. Prototype 41 (Finish later → Home resume card with Messages and Settings) needs RootNavigator to mount ClientNavigator for a
  client mid-consultation. Default: keep the in-flow paused screen for build 8; a later job after CLIENT-HOME-133.
- P2. Clients who already finished the lean flow (the owner's coachless test account) never get the consultation. Default: the
  passive re-offer (prototype 65) in CLIENT-HOME/TOUR, not a forced redo.

## HANDOFF (17:45 PDT)
- PR: growth-project-mobile#580 (DRAFT) @ df4bf89e8533442c9fe30e306aeda9999deaea61 (commit 1, my lane only). CI at that head: Typecheck/lint/test, CodeQL,
  Analyze all pass (17:43). No READY posted: the PR does not yet do (1) and (2).
- Blocked: agent 132 has not written "OK src/navigation/RootNavigator.tsx — 133" / "OK eas.json — 133" (last 132 line 15:33).
  NEED src/navigation/RootNavigator.tsx — consultationApplies() must go so every new student gets the consultation (B14) —
  CONSULT-ALL-M-133. NEED eas.json + config/expected-env.json + scripts/validate-app-config.js — consultation and tour flags on in
  preview and production, guarded (B40) — CONSULT-ALL-M-133.
- Ready to finish in one step once OK is written (or the operator rules otherwise): in /home/user/workspace/wt/CONSULT-ALL-M-133-mobile
  the local branch already holds commit 2 ceeae1edc5a4ad0df47122560c8a63114b1c226e (all tests above green locally with both commits). Then:
  `git fetch -q origin && git merge origin/main` (if main moved), `git push origin HEAD:agent133/consult-all-m-133`,
  `gh pr ready 580`, wait for CI green, post
  `FIX ROUND 1 (OPENING) (CONSULT-ALL-M-133, agent 133) — growth-project-mobile#580 @ <full head sha> — READY FOR AUDIT`,
  then wait for verdicts. If agent 132 prefers to make the edits itself, it can `git apply`
  ops/reports/consult-all-m-133/DIFF_FOR_132.patch on main.
- Merge order note: LEAN-CUT-133 starts after this PR merges (with commit 2).
