# OPERATOR AGENT 133 OVERRIDES (2026-10-08 16:35 PDT). Lane 133 = CLIENT JOURNEY TO SPEC. These win over everything below (the agent
# 132 header and older text) where they differ. Read this header fully, then ONLY your entry in /home/user/workspace/ops/lanes133/JOBS133.md.
#
# Q1. WHO. Operator is agent 133 (agents 132 and 134 run at the same time in their own sessions; GitHub and tgp-agent-context are the
#     only shared ground). Sign every comment "agent 133". New branches: agent133/<job-id-lower>. PR titles start "[133]", then the bug
#     IDs (B14 ...) and the plan point numbers. Your worktree(s) are ALREADY MADE at the absolute paths in your entry, with a real
#     node_modules. Work only there. Never git stash, never rebase, never force-push; bring main in with `git merge origin/main`.
# Q2. OWNER WORDS THAT BIND LANE 133 (verbatim parts):
#     15:02 "This app is both broken for coaches and disgusting for clients". 14:57 the Roman chat should be "a luxurious AI chat room,
#     the UI and class of a premium Anthropic mixed with iMessage". 15:29: every client gets the full consultation (the lean 6-step flow is
#     retired); coachless clients "can do everything a normal coached client can, besides getting direct coaching ... it's just empty for
#     them inherently" (no lock pages anywhere); "we don't do build 8 until this is PERFECTION" (no deadline, quality over speed).
#     16:20 "its not about the exact screen layout - its about the consultative onbaording flow ... we want 90% the same without changing
#     our layouts basics like button count - the flow prototype knew only of our onbaording not our entire app specs".
#     So: the prototype governs the onboarding FLOW at about 90%; the app keeps its 6 client tabs and its button counts.
# Q3. LANE FILES (OPERATORS_COMMON_132.md). Yours: mobile src/screens/auth/**, src/screens/consultation/**, src/lib/consultation/**,
#     src/screens/client/**, src/screens/roman/**, src/components/roman/**, src/tutorial/**, src/components/tutorial/**,
#     src/navigation/AuthNavigator*, ClientNavigator*, ConsultationOnboardingNavigator*, src/theme/**, shared src/components/** (except
#     src/components/BiometricUnlockGate.tsx); backend src/onboarding/**, consultation, programs, macros, src/roman/**, seed/, scripts/seed-*.
#     NOT yours: RootNavigator.tsx, src/services/api.ts, src/entitlements/**, src/hooks/useBiometricGate.ts, eas.json, backend src/common/**,
#     entitlement guards (agent 132); src/screens/coach/**, CoachWizardNavigator.tsx, src/lib/coachSetup/**, backend src/coach/** (agent
#     134). If you need one: stop, write "NEED <file> — <why> — <your job>" in your report and tell the operator; never edit it.
# Q4. SPEC. Prototype screens: /home/user/workspace/specs133/shots/NN.png (00-86; index.json maps screen -> PDF page), the notes
#     panel text in /home/user/workspace/specs133/PROTOTYPE_NOTES_OCR.md (OCR; check the image), the full PDF at
#     /home/user/.perplexity/attachments/70661ce66b7f4911a48ca46c0e17b55c/TGP-Clinic-Flow-Prototype.pdf. Index: 00 AUTH, 01 ROLE, 02 CREATE,
#     03 W1, 04-05 G1-G2, 06-09 B1-B4, 10-11 L1-L2, 12-16 T1-T4, 17-20 S1-S3b, 21-25 N1-N5, 26-35 P0-P8, 36 C1, 37 SUM, 38 PREP, 39 MACRO,
#     40 PLAN, 41-45 states, 46-60 tour, 61-62 push, 63 LAND, 64-66 skip/re-offer/no plan, 67 Guidance, 68 AI consent, 69-73 Roman chat
#     and chips, 74 Privacy > Roman, 75-76 coach role/create, 77-86 coach track (lane 134).
#     Doctrine: docs/QUIET_LUXURY_DOCTRINE.md, src/theme/README.md, docs/reachability.md in your worktree; the owner's design training
#     (Mobile App Design Intelligence) and review (Onboarding Pathways and Prototype Review) in the attachments folder above.
# Q5. QUALITY BAR (the four lessons of 8 October). (1) Done means ON in the build the owner installs: no new screen behind a flag the
#     owner's builds keep off. (2) Every mobile UI PR body has a parity table: prototype screen number | today's file | what matches |
#     what differs and why (the 16:20 ruling allows layout differences that keep our tabs and button counts; flow, questions, copy and
#     states match). Say plainly what was not seen on a device. Render what you can (jest snapshots, the component at 360x800 and 390x844
#     through the tests' renderer) and attach the evidence the QA gate R15 asks for once it is in the combined plan. (3) Android is
#     first-class: insets come from react-native-safe-area-context, never SafeAreaView from 'react-native'; serif headlines never clip
#     descenders (lineHeight >= 1.2 x fontSize, no includeFontPadding clipping); wheel bands sit behind the selected value, never over it.
#     (4) One filled forest button per screen, serif headlines, calm motion (300 ms or less, Reduce Motion respected), breathing room
#     under the status bar. If it looks generic, it is wrong.
# Q6. FORMATS (board.py and merge_if_dual.sh parse first lines exactly; dashes are em dashes "—"):
#     READY  `FIX ROUND 1 (OPENING) (<JOB ID>, agent 133) — growth-project-<repo>#<n> @ <full 40-hex head sha> — READY FOR AUDIT`
#     Fix round: `FIX ROUND <k> (<original JOB ID>, agent 133, <your ID>) — growth-project-<repo>#<n> @ <sha> — READY FOR AUDIT`
#     VERDICT `AUDIT Claude Opus 5.5 (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES)
#             `AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES)
#     CLAIM   `OPUS LENS CLAIM (<your ID>) @ <full sha>` / `SOL LENS CLAIM (<your ID>) @ <full sha>`
#     Every PR body adds "WHY / WHEN / WHO" (root cause, the commit + PR that introduced it) and the bug IDs.
# Q7. REPORT /home/user/workspace/ops/reports/<your ID>.md (kept current; final "## HANDOFF"). NOTIFY one line in
#     /home/user/workspace/ops/lanes133/notify/<your ID>.txt: `done | PRs: <list or none> | B=<n> U=<n> | head: <sha8> | needs operator: <n>`.
#     Final answer to the operator under 150 words.
# Q8. STATE (verified 16:12-16:30; GitHub wins, re-fetch): mobile main df7b8ae9384d2c11ea86a913dba2a3696bd4d1cc; backend main
#     051583adf983b5725e0bdace1c4d74ddd05e7f21; production deploy 42 at 477a2c8a. Production counts: ClinicProgramSet 0, intakes 0.
#     Rescue PRs in flight (agent 132): b#889 SETUP-STALE, b#888 COACHLESS-LOG, m#576 COACH-EDGES, START-HANG (no PR yet).
# Q9. Still binding from the agent 132 header below, read with 133: Q3 builder steps (targeted tests, one push, CI green, READY, wait for
#     verdicts when the entry says so), Q4 lens rules and grading (T4 scan first; B only for real ordinary-use harm), Q9 items (token
#     file, board first, Sol posting rule, waiting rule, stop, copy rules, commit identity `git -c user.name="Bradley Gleave"
#     -c user.email="bradley@bradleytgpcoaching.com" commit`, no AI co-author line, backend LEFTHOOK=0, under 800 lines, over 1,500
#     fails, never merge, deploy or touch flags, heavy.sh one test file at a time). App copy: no first person (Roman excepted), no
#     exclamation marks, no emojis, no generic errors, theme colours only. Never name the clinic partner. Supabase SELECT only. No money.
# Q10. BUDGET: the owner reads credits for this session; be frugal. Never estimate credits.
# ----- agent 132 header and older text follow (superseded where Q1-Q10 differ) -----
