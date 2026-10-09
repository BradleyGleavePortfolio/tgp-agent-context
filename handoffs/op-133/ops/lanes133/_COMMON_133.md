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
# Q10b. OWNER 17:07 (binding, design): "I want nice rounded corners, luxurious, not rectangles". Decision 133-4 answered: rounded.
#     This OVERRIDES docs/QUIET_LUXURY_DOCTRINE.md rule 5 ("radius.lg = 4") and checklist line "No new radius ... larger than 4".
#     DS-PRIMITIVES-133 owns the change: radius tokens in src/theme/tokens.ts (defaults: buttons and inputs 12, cards 16, bottom-sheet
#     top corners 24, chips pill), doctrine rule 5 + checklist rewritten, src/__tests__/quietLuxuryDoctrine.test.ts updated. Everyone
#     else uses the tokens; never hardcode a radius, never ship a 4 pt button or card in a [133] PR. Lenses treat it as a finding.
# ----- agent 132 header and older text follow (superseded where Q1-Q10 differ) -----
# OPERATOR AGENT 132 OVERRIDES (2026-10-08 13:05 PDT). These win over everything below (the agent 131, 130 and 129 headers and
# _COMMON_128) and over JOBS128-131 and the FIX_PLANS files where they differ. Read this header fully, then ONLY your entry in
# /home/user/workspace/ops/lanes132/JOBS132.md. Read the older text below only where this header or your entry points to it.
#
# Q1. WHO. Operator is agent 132 (agent 131 retired at about 12:00; all its workers are stopped). Sign every comment "agent 132".
#     New branches: agent132/<job-id-lower>. Your worktree(s) are ALREADY MADE at the absolute paths in your entry, node_modules
#     linked (one worktree per agent per repo). Work only there. Never edit /home/user/workspace/wt/RO-*, wt/BUILD-*, deps/* or the
#     growth-project-* clones (except `git -C ... fetch`). Never `git stash`; never rebase; never force-push; bring main in with
#     `git merge origin/main`.
# Q2. OWNER 12:52 (verbatim, the parts that bind you): "Start all 10 PR's now". "Get the andriod apk with all features made asap".
#     "roman intelligence increase is largely built - finish it". "I dont need over the air updates". Speed matters; never trade a
#     rule for speed.
# Q3. BUILDERS. Do the PRs in your entry in order. Each new PR starts from a fresh branch off origin/main in your worktree
#     (`git fetch -q origin && git checkout -b agent132/<id-lower> origin/main`) unless your entry names a branch. For each PR:
#     targeted tests pass locally (heavy.sh, one file at a time), one push, CI green at your head, no conflict with main, READY
#     posted, then the next PR. Do not wait for verdicts unless your entry says "then wait for verdicts": then poll that PR every
#     180 s for up to 90 minutes and fix any B at your current head (one push, CI green, next FIX ROUND READY line naming the
#     findings fixed). After your last step: report with HANDOFF, notify line, end. A Sol builder that finds a needed T4 change
#     (auth, tenancy, money, PII/health, credentials, destructive data) does not build it: write it up for the operator.
# Q4. LENSES. Review only the PRs of the builders in your slice (your entry), at the exact current head, oldest READY first. For each:
#     check ops/HOLD.txt, re-check the head on GitHub, post your CLAIM, review, re-check the head, post the VERDICT. A push resets
#     verdicts: a new head needs a new verdict. Re-review after a fix round = only the earlier Bs and the changed lines. Time boxes:
#     delta 20 / full 30 minutes. Loop: read /home/user/workspace/ops/board/board.md every 180 s. END when every builder in your
#     slice has a notify file in ops/lanes132/notify/ AND nothing in your slice has needed your verdict for 15 minutes, or at the
#     operator's stop. Grading: SoT A3 (T4 scan first) and the A2 EDGE-CASE FREEZE + RUTHLESS SCOPE: B only for real ordinary-use
#     harm, one plain sentence each; edges are "C (edge, deferred to 10k clients)".
# Q5. FORMATS (board.py and merge_if_dual.sh parse first lines exactly; dashes are em dashes "—"):
#     READY  `FIX ROUND 1 (OPENING) (<JOB ID>, agent 132) — growth-project-<repo>#<n> @ <full 40-hex head sha> — READY FOR AUDIT`
#     Fix round on an existing PR: `FIX ROUND <k> (<original JOB ID>, agent 132, <your ID>) — growth-project-<repo>#<n> @ <sha> — READY FOR AUDIT`
#     VERDICT `AUDIT Claude Opus 5.5 (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or `— VERDICT: REQUEST CHANGES`)
#             `AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES)
#     CLAIM   `OPUS LENS CLAIM (<your ID>) @ <full sha>` / `SOL LENS CLAIM (<your ID>) @ <full sha>`
#     Verdict body: Bs first, then Us, each with file:line, the smallest fix and one plain sentence of how a client or coach hits
#     it; Cs as a one-line list. Label every finding "seen in a test" or "from the code". Sol posting rule: item 7 of the agent 131
#     header below (never quote crisis, self-harm or eating-disorder copy; describe it with file:line).
# Q6. REPORT /home/user/workspace/ops/reports/<your ID>.md (kept current; final "## HANDOFF"). NOTIFY one line in
#     /home/user/workspace/ops/lanes132/notify/<your ID>.txt: `done | PRs: <list or none> | B=<n> U=<n> | head: <sha8> | needs operator: <n>`.
#     Final answer to the operator under 150 words. Anything outside your entry: "Proposed (needs operator)" with a default.
# Q7. STATE (verified on GitHub 12:12-12:58 PDT; GitHub wins, always re-fetch): production = deploy 40 at backend main
#     cd0f90ed823d43dc8a9f0937554dc59fce7b6b94 (/health, /readyz ok 12:26). Mobile main 14faa32f8ea5076a2288b212ca1cfc1307207038.
#     iOS build 7 (from 14faa32f) is being sent to TestFlight. Open agent PR: m#569 only. Flags: FEATURE_ROMAN_MEMORY,
#     FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_PLAYBOOK true; FEATURE_COACH_PAYMENT_ACTIONS and FEATURE_ROMAN_COPY_V2 not set (off).
# Q8. BUDGET: the owner has not set agent 132's credit budget yet. Be frugal: read only what your entry needs, run only the tests you
#     add or change, poll GitHub at most once every 180 s, no essays. Never estimate credits anywhere.
# Q9. Still binding from the agent 131 header below, with 131 read as 132: items 3 (token file, optional), 4 (board first, GitHub
#     economy), 7 (Sol posting rule), 12 (waiting rule: read-only prep, then the board every 180 s; after 120 minutes blocked push WIP,
#     HANDOFF, end), 13 (stop), 14 (copy rules; never name the clinic partner; no secrets or customer records; Supabase SELECT only;
#     no money, no Stripe), 15 (commit identity `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com"
#     commit`, no AI co-author line, backend LEFTHOOK=0, under 800 lines, over 1,500 fails; never merge, deploy or touch flags),
#     16 (heavy.sh, one targeted test file at a time). _COMMON_128 sections "How you work" items 5-6 (CI economy, PR rules, tier
#     header) and the mobile screen redo rules apply to every mobile UI PR (parity table, truthful sweep, README row).
#
# Q11. RESCUE WAVE (operator 15:20 PDT). Owner 15:12: "19.7k/45k - launch the agent wave NOW - please we need the IOS submission
#     tonight to not be this ... SLOP of bugs and crashes - they wont even approve this broken ... mess". The owner tested the Android
#     app as a coach and as a coachless client: both journeys broke. iOS build 8 is cut TONIGHT from mobile main after the rescue PRs
#     merge, so speed matters; never trade a rule for speed. STATE (re-verify on GitHub): production = deploy 42 at backend 477a2c8a
#     (b#884 merged after it, config-only); backend main 051583adf983b5725e0bdace1c4d74ddd05e7f21; mobile main
#     df7b8ae9384d2c11ea86a913dba2a3696bd4d1cc. Q10 is resolved (AUDIT-FIX-132 b#887 merged, deploy 41). BUDGET (replaces Q8): set at
#     45k; owner reading 19.7k at 15:12; still be frugal. The shared bug register B01-B41 is section 1 of
#     /home/user/workspace/ops/rescue132/BRIEF.md: read sections 0-2 there, name your bug IDs in the PR title and body, and in every PR
#     body add "WHY / WHEN / WHO": the root cause, and the commit + PR that introduced it (git log -S / blame), because the owner asked.
#     Mobile UI PRs: you cannot run a device here, so the PR body names the prototype screen numbers it matches
#     (/home/user/workspace/specs132/shots/NN.png, index in BRIEF section 3) with a written parity table, and says plainly what was not
#     seen on a device. Doctrine: wt/<yours>/docs/QUIET_LUXURY_DOCTRINE.md and src/theme/README.md.
# ----- (agent 131 header follows; superseded where Q1-Q9 differ) -----

# Q10. RULING OR-132-1 (operator 13:22). Since 10:52 PDT the backend CI job "npm audit (high+critical, whole graph)" fails on EVERY
#     backend PR: new critical handlebars advisories (patched in 4.7.10). It is not caused by your PR: never fix it in your PR, never
#     add an exception. AUDIT-FIX-132 fixes main. Backend builders: post READY when every OTHER check is green, with one line in the
#     READY body "npm audit: new handlebars advisory, fixed on main by AUDIT-FIX-132". Lenses: review those PRs normally. After the
#     fix merges, each open backend PR gets one `git merge origin/main` push (its builder if still running, else the operator) and a
#     delta re-review of that merge only. Lens slice A also covers AUDIT-FIX-132.
# ROUND OVERRIDES (2026-10-08 09:10 PDT). These win over everything below, including the 22:45 restart overrides.
# R6. WHO AND HOW MUCH. The owner asked for 10 agents that each do ONE round, then end. Builders ONB-TOUR-131, ALLERGY-CHOICES-131,
#     TRUST-COPY-131 (Claude Opus 5.5), SMALL-M-COPY-131, CHECKIN-GATE-131, INVITE-REFRESH-131 (GPT-6.1 Sol); lenses LN-OPUS-K-131,
#     LN-OPUS-L-131, LN-SOL-K-131, LN-SOL-L-131, launched by the operator when their PRs are READY. Sign comments "agent 131".
# R7. ONE ROUND. A builder opens ONE PR (ALLERGY-CHOICES-131 may open one per repo if both repos need the change), gets CI green at
#     its head, merges origin/main if needed, posts READY, writes the report (with HANDOFF) and the notify line, then ends. No second
#     job. A lens reviews ONLY the PRs listed in its launch message, once each, at the head named there (or the newer head if the
#     builder moved it before you start), posts the VERDICT, writes the report and ends. No queue, no idle loop.
# R8. NO FIX ROUND in this batch. A REQUEST CHANGES verdict stays open for the next round; say the smallest fix in the verdict.
# R9. STATE (verified on GitHub 09:00-09:10 PDT; GitHub wins): production = deploy 37 at backend main 652b07a8 (/health, /readyz ok
#     23:51). Mobile main 868a629c. Open: b#871 @ fa38982e (HOLD: owner decision 1). Read ops/HOLD.txt before any claim. Budget is
#     tight (owner: 34k of 45k used): read only what your entry needs, run only the tests you add or change locally (heavy.sh), poll CI
#     at most once every 3 minutes.
#
# RESTART OVERRIDES (2026-10-07 22:45 PDT). These win over everything below, including the 20:40 overrides.
# R1. WHO. The owner gave more budget at 22:35, so operator agent 131 resumed. New agents: lenses LN-OPUS-F-131, LN-OPUS-G-131,
#     LN-OPUS-H-131, LN-SOL-H-131, LN-SOL-I-131, LN-SOL-J-131; fixers FIX-OPUS-B-131, FIX-OPUS-C-131; builders BLD-SOL-1-131,
#     BLD-SOL-2-131, COACH-SETTINGS-131, PB-FAIL-LIMIT-131. Sign comments "agent 131". New branches agent131/<job-id-lower>.
# R2. STOP TIME. The operator sends a stop message at about 23:45 PDT (owner credit budget). On it: finish only the step you are on,
#     push, write the report with its HANDOFF and the notify line, then end. A builder that is not READY by then pushes its work in
#     progress to its own branch, says so in the report, and ends. Never start a new review, fix or PR after the stop message.
# R3. LENSES IDLE OUT after 15 minutes in a row with an empty queue (not 60): write the report and finish.
# R4. BUILDERS: CI green at your head, no conflict with main, READY posted, report HANDOFF and notify written, THEN end
#     (HOME-FOOD-UI-131 ended with CI pending and no READY: do not repeat that). A builder with two jobs opens the second PR from
#     a fresh branch off origin/main in the same worktree after the first READY.
# R5. STATE (verified on GitHub 22:37-22:45 PDT; GitHub wins): production = deploy 35 at backend main 21598a39 (b#874's migration
#     applied, /health and /readyz ok). Mobile main 842eb059. FEATURE_ROMAN_PLAYBOOK on since 21:18. Open PRs: b#870 @ 87f7f275,
#     b#871 @ fa38982e (HOLD: owner), b#872 @ b84193df (HOLD until both lenses approve this head), b#877 @ dc6149d7, b#878 @ 3ec27c47,
#     m#549 @ 371c555b, m#551 @ ae7e2a94, m#552 @ f41ea9b1, m#556 @ 53f10d0a. Read ops/HOLD.txt before any claim.
#
# OPERATOR AGENT 131 OVERRIDES (2026-10-07 20:40 PDT). These win over everything below (the agent 130 and 129 headers and _COMMON_128)
# and over JOBS128.md, JOBS129.md, JOBS130.md and FIX_PLANS_130_131.md where they differ. Read this whole file, then ONLY your entry.
#
# 1. WHO. Operator is agent 131 (agent 130 retired at 19:55; all its workers are stopped). Sign every comment "agent 131". New branches are
#    agent131/<id-lower> (e.g. WORKOUT-CLAMP-131 -> agent131/workout-clamp-131). Finishers keep the branch they were given (agent130/*).
#    Your worktree is ALREADY MADE: /home/user/workspace/wt/<ID>-<repo> (on your branch). Work only there. Never edit the RO worktrees
#    (/home/user/workspace/wt/RO-backend, /home/user/workspace/wt/RO-mobile), /home/user/workspace/deps/* or /home/user/workspace/growth-project-*
#    (except `git -C ... fetch` and `git -C ... worktree add` for a FIX lane worktree). One worktree per agent per repo.
# 2. NEVER `git stash` (the stash is shared across worktrees and crossed two builders' work on 10-07). To set work aside: commit it on your
#    own branch. Never rebase, never force-push. Bring in main with `git merge origin/main`.
# 3. TOKEN FILE (optional for workers). You MAY start a bash call that uses GitHub (api_credentials=["github"]) with:
#    `umask 077; printf %s "$GH_ENTERPRISE_TOKEN" > /home/user/workspace/ops/.ghtoken.$$ && mv /home/user/workspace/ops/.ghtoken.$$ /home/user/workspace/ops/.ghtoken; umask 022;`
#    It keeps the shared board alive. If your platform refuses it, skip it and never work around it. Never print, copy or commit the token.
# 4. BOARD FIRST. Find work and state on /home/user/workspace/ops/board/board.md (rewritten every 3 minutes; time at the top). Call GitHub only
#    for the PR you are working on and for your own pushes and comments, at most once every 3 minutes per PR (sleep 180). Re-check the head on
#    GitHub right before you post a claim and right before you post a verdict or READY. When idle: sleep 180, then re-read the board.
#    On a rate-limit error: `gh api rate_limit --jq .resources.core` once, sleep until reset. Never `gh run view --json jobs` (403): use
#    `gh api repos/<owner>/<repo>/actions/runs/<id>` and `.../jobs`.
# 5. FORMATS (board.py and merge_if_dual.sh parse these first lines exactly; the dashes are em dashes "—"):
#    READY:   `FIX ROUND 1 (OPENING) (<ID>, agent 131) — growth-project-<repo>#<n> @ <full 40-hex head sha> — READY FOR AUDIT`
#             (a later round on the same PR: `FIX ROUND <k> (<original JOB>, agent 131, <your ID>) — growth-project-<repo>#<n> @ <sha> — READY FOR AUDIT`)
#    VERDICT: `AUDIT Claude Opus 5.5 (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or `— VERDICT: REQUEST CHANGES`)
#             `AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES)
#    CLAIMS:  `OPUS LENS CLAIM (<your ID>) @ <full sha>`, `SOL LENS CLAIM (<your ID>) @ <full sha>`, `FIX CLAIM (<your ID>) @ <full sha>`
# 6. VERDICTS CONCISE: Bs first, then Us, each with file:line, the smallest fix and ONE plain sentence of how an ordinary client or coach hits
#    it; Cs as a one-line list. Label every finding "seen in a test" (a test reproduced it) or "from the code". No essays.
# 7. SOL POSTING RULE (two Sol reviewers were stopped by their safety check on 10-07, on crisis, self-harm and eating-disorder copy and on
#    privacy findings). Every lens: cite file:line and DESCRIBE the finding; never quote crisis, self-harm or eating-disorder copy in a
#    comment. If a GPT-6.1 Sol lens still cannot post, save the full verdict to /home/user/workspace/ops/reports/<your ID>-<repo letter b|m><n>-verdict.txt,
#    write it in your notify line and final answer, and move on; the operator routes it. A verdict counts only under the model that wrote it:
#    never post one model's verdict under the other's name, never count another model's verdict as Sol's.
# 8. BUILDERS END RIGHT AFTER READY: CI green at your head, no conflict, READY posted, report HANDOFF written, notify line written, then finish.
#    Do not wait for verdicts. Review findings and conflicts go to FIX-OPUS-131 / FIX-SOL-131.
# 9. REPORT /home/user/workspace/ops/reports/<ID>.md (kept current; final "## HANDOFF" section). NOTIFY one line in
#    /home/user/workspace/ops/lanes131/notify/<ID>.txt: `done | PRs: <list or none> | B=<n> U=<n> | head: <sha8> | needs operator: <n>`.
#    "reports/<X>.md" in any FIX_PLANS/JOBS entry means /home/user/workspace/ops/reports/<X>.md (copies of the op-129 and op-130 reports).
#    Final answer to the operator under 150 words.
# 10. STATE (verified on GitHub 20:21-20:40 PDT; GitHub wins, always re-fetch): production = backend deploy 32 at 80cebd11 (healthy, /health
#     and /readyz ok). The operator merged b#873 and m#544 at 20:44: backend main f0cd518a, mobile main
#     e1688b51 (production deploys f0cd518a next). Flags: FEATURE_ROMAN_MEMORY true, FEATURE_ROMAN_TOOLS true, FEATURE_ROMAN_PLAYBOOK unset (b#855 sets it after
#     both lenses approve), FEATURE_COACH_PAYMENT_ACTIONS and FEATURE_ROMAN_COPY_V2 unset (off).
# 11. iOS BUILD 7: cut from mobile main at 23:00 PDT (the owner may move it). Mobile PRs for it: m#546, m#537, m#542, m#545 (m#544 merged at 20:44).
#     Lenses review READY mobile PRs first. Every mobile builder: READY as early as possible; only PRs dual approved before the cut go in.
# 12. WAITING RULE (builders whose entry says "waits for X"): start right away with read-only work (trace, failing-first test against the
#     predecessor's branch, PR body draft). Then read the board every 180 s until X has merged (or deployed, where stated: the operator posts
#     merges and deploys in /home/user/workspace/ops/FLEET131.md and messages you). If still blocked after 120 minutes: push your WIP to your
#     branch, write the HANDOFF, end. The operator relaunches you.
# 13. STOP: when the operator says stop: finish the current step, push (WIP commit if needed), write report + HANDOFF + notify, end.
#     Push work in progress to your branch before any stop: work left only in the sandbox is lost if the sandbox dies.
# 14. Copy rules: no first person (Roman's own chat voice excepted), no exclamation marks, no emojis, no generic errors, theme colours only.
#     Never name the clinic partner anywhere (all repos are PUBLIC). No secrets, no customer records in any repo, comment or report.
#     Supabase production: read-only SELECTs only. Spend no money, no Stripe changes. Times only from `TZ=America/Los_Angeles date`.
# 15. Commit identity on EVERY commit: `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com" commit ...`, no AI
#     co-author trailer. Backend commits with LEFTHOOK=0. Size: under 800 changed lines target, over 1,500 = automatic fail.
#     "Never merge" means never merge a PR into main (no `gh pr merge`), never merge a `ci/*` branch, never deploy, never touch flags
#     (`fly secrets set` is forbidden for everyone). Bringing main INTO your own branch with `git merge origin/main` is required where
#     your entry or _COMMON says so (before READY when your branch conflicts or your entry names a predecessor).
# 16. SHARED DEPS: /home/user/workspace/deps/<repo>/READY appears when the install finishes (started 20:35, backend first, then mobile).
#     Until then read code and rely on PR CI. Link with `/home/user/workspace/ops/link_deps.sh <backend|mobile> <worktree>`. Local runs ONLY
#     through /home/user/workspace/ops/heavy.sh, one targeted test file at a time; if the heavy line makes you wait over 15 minutes, push and
#     let CI prove it (cite the failing-first test in the PR body). Never credit estimates in any report or comment.
# 17. No new work beyond your entry. Anything else you find: write it in your report under "Proposed (needs operator)" with a default.
#
# ----- (agent 130 header follows; superseded where items 1-17 above differ) -----

# OPERATOR AGENT 130 OVERRIDES (2026-10-07 18:08 PDT). These win over everything below (the agent 129 header and _COMMON_128) and over
# JOBS128.md, JOBS129.md and FIX_PLANS_130_131.md where they differ. Read this whole file, then ONLY your entry.
#
# 1. WHO. Operator is agent 130 (agent 129 retired at 17:49; all its workers are stopped). Sign every comment "agent 130". New branches are
#    agent130/<id-lower> (e.g. SESSION-KEEP-130 -> agent130/session-keep-130). Finishers keep the branch they were given (agent129/*).
#    Your worktree is ALREADY MADE: /home/user/workspace/wt/<ID>-<repo> (on your branch). Work only there. Never edit the RO worktrees
#    (/home/user/workspace/wt/RO-backend, /home/user/workspace/wt/RO-mobile), /home/user/workspace/deps/* or /home/user/workspace/growth-project-*
#    (except `git -C ... fetch` and `git -C ... worktree add` for a FIX lane worktree).
# 2. NEVER `git stash` (the stash is shared across worktrees and crossed two builders' work on 10-07). To set work aside: commit it on your
#    own branch. Never rebase, never force-push. Bring in main with `git merge origin/main`.
# 3. TOKEN FILE. Start EVERY bash call that uses GitHub (api_credentials=["github"]) with:
#    `umask 077; printf %s "$GH_ENTERPRISE_TOKEN" > /home/user/workspace/ops/.ghtoken.$$ && mv /home/user/workspace/ops/.ghtoken.$$ /home/user/workspace/ops/.ghtoken; umask 022;`
#    It keeps the shared board alive (proxy tokens expire about every 20 minutes). Never print, copy or commit the token.
# 4. BOARD FIRST. Find work and state on /home/user/workspace/ops/board/board.md (rewritten every 3 minutes; time at the top). Call GitHub only
#    for the PR you are working on and for your own pushes and comments, at most once every 3 minutes per PR (sleep 180). Re-check the head on
#    GitHub right before you post a claim and right before you post a verdict or READY. When idle: sleep 180, then re-read the board.
#    On a rate-limit error: `gh api rate_limit --jq .resources.core` once, sleep until reset. Never `gh run view --json jobs` (403): use
#    `gh api repos/<owner>/<repo>/actions/runs/<id>` and `.../jobs`.
# 5. FORMATS (board.py and merge_if_dual.sh parse these first lines exactly; the dashes are em dashes "—"):
#    READY:   `FIX ROUND 1 (OPENING) (<ID>, agent 130) — growth-project-<repo>#<n> @ <full 40-hex head sha> — READY FOR AUDIT`
#             (a later round on the same PR: `FIX ROUND <k> (<original JOB>, agent 130, <your ID>) — growth-project-<repo>#<n> @ <sha> — READY FOR AUDIT`)
#    VERDICT: `AUDIT Claude Opus 5.5 (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or `— VERDICT: REQUEST CHANGES`)
#             `AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES)
#    CLAIMS:  `OPUS LENS CLAIM (<your ID>) @ <full sha>`, `SOL LENS CLAIM (<your ID>) @ <full sha>`, `FIX CLAIM (<your ID>) @ <full sha>`
# 6. VERDICTS CONCISE: Bs first, then Us, each with file:line, the smallest fix and ONE plain sentence of how an ordinary client or coach hits
#    it; Cs as a one-line list. Label every finding "seen in a test" (a test reproduced it) or "from the code". No essays.
# 7. BUILDERS END RIGHT AFTER READY: CI green at your head, no conflict, READY posted, report HANDOFF written, notify line written, then finish.
#    Do not wait for verdicts. Review findings and conflicts go to FIX-OPUS-130 / FIX-SOL-130.
# 8. REPORT /home/user/workspace/ops/reports/<ID>.md (kept current; final "## HANDOFF" section). NOTIFY one line in
#    /home/user/workspace/ops/lanes130/notify/<ID>.txt: `done | PRs: <list or none> | B=<n> U=<n> | head: <sha8> | needs operator: <n>`.
#    "reports/<X>.md" in any FIX_PLANS/JOBS entry means /home/user/workspace/ops/reports/<X>.md (copies of the op-128 and op-129 reports).
#    Final answer to the operator under 150 words.
# 9. STATE (verified on GitHub 18:06 PDT; GitHub wins, always re-fetch): production = backend deploy 28 at 272dc8ef (healthy). Backend main
#    272dc8ef and mobile main 028f2926 at 18:06; the operator merges b#864, b#862, b#859 and m#530 at about 18:10, then deploys backend.
#    Flags: FEATURE_ROMAN_MEMORY true (live), FEATURE_ROMAN_TOOLS true, FEATURE_ROMAN_PLAYBOOK unset (stays off until PB-GAP-130, m#513 and
#    b#855). b#858 (food undo backend) is deployed.
# 10. iOS BUILD: the owner's cut is 23:00 PDT from mobile main (owner may move it). Mobile PRs meant for it (HEALTH-STRINGS-130,
#     SESSION-KEEP-130, FOOD-GATE-RETRY-130, MONEY-INBOX-130 first) post READY as early as possible and by 21:30 at the latest.
#     Lenses: review those four first whenever they are READY.
# 11. WAITING RULE (builders whose entry says "after X"): start right away with read-only work (trace, failing-first test against the
#     predecessor's branch, PR body draft). Then read the board every 180 s until X has merged (or deployed, where stated: the operator posts
#     deploys in /home/user/workspace/ops/FLEET130.md and messages you). If still blocked after 120 minutes: push your WIP to your branch, write
#     the HANDOFF, end. The operator relaunches you.
# 12. STOP: when the operator says stop: finish the current step, push (WIP commit if needed), write report + HANDOFF + notify, end.
#     Push work in progress to your branch before any stop: work left only in the sandbox is lost if the sandbox dies.
# 13. Copy rules: no first person (Roman's own chat voice excepted), no exclamation marks, no emojis, no generic errors, theme colours only.
#     Never name the clinic partner anywhere (all repos are PUBLIC). No secrets, no customer records in any repo, comment or report.
#     Supabase production: read-only SELECTs only. Spend no money. Times only from `TZ=America/Los_Angeles date`.
# 14. Commit identity on EVERY commit: `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com" commit ...`, no AI
#     co-author trailer. Backend commits with LEFTHOOK=0. Size: under 800 changed lines target, over 1,500 = automatic fail.
# 15. No new work beyond your entry. Anything else you find: write it in your report under "Proposed (needs operator)" with a default.
#
# ----- (agent 129 header follows; superseded where item 1-15 above differ) -----

# OPERATOR AGENT 129 OVERRIDES (2026-10-07 15:58 PDT). These win over everything below and over JOBS128.md / JOBS129.md where they differ.
# 1. Operator is agent 129 (agent 128 retired at 15:35; its workers are stopped). Sign every comment "agent 129". New branches are
#    agent129/<job-lower> (job IDs keep their names: CF-SETTINGS-128 -> agent129/cf-settings-128). READY first line, exactly:
#    `FIX ROUND 1 (OPENING) (<JOB>, agent 129) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`
#    (finishing an existing PR: `FIX ROUND <k> (<JOB>, agent 129) — ...`). Lenses and fixers: agent127/*, agent128/* and agent129/*
#    head branches are all in scope.
# 2. Verified on GitHub at 15:56 PDT: production = backend deploy 26 87f4489b, healthy. Backend main c3324d4a, mobile main a1be6fb2 (always
#    re-fetch; GitHub wins). FEATURE_ROMAN_TOOLS on since 15:05; FEATURE_ROMAN_MEMORY is being turned on by the operator; FEATURE_ROMAN_PLAYBOOK
#    stays off (b#855 waits for m#513 and PB-GAP-129). The read-only worktrees wt/RO-backend and wt/RO-mobile are at those two mains.
# 3. Deadlines (PDT): builders post READY by 21:30. Mobile main is cut for the iOS build at 23:00 (owner: "regardless"). Lenses loop until
#    22:45 (not 18:30). Standing fixers loop until 22:30. Wall clock is the main constraint, but never trade a rule for speed.
# 4. Up to about 75 workers share ONE sandbox (2 CPU, 7.9 GB) and ONE GitHub token (5,000 requests per hour for everyone; it ran out at
#    15:31 today). GitHub economy, binding:
#    a. Find work on /home/user/workspace/ops/board/board.md: every open PR with head, lines, draft, merge state, CI, the READY line, the
#       Opus and Sol verdicts AT THE HEAD, claims at the head with their age, and what it needs. The operator rewrites it every 3 minutes
#       (time at the top). Do NOT list PRs or read comments across PRs on GitHub to find work.
#    b. Call GitHub only for the PR you are working on (its diff, comments, checks) and for your own pushes and comments. Re-check the head
#       on GitHub right before you post a claim or a verdict.
#    c. Poll CI or a PR at most once every 3 minutes (sleep 180). Never loop on errors. On a rate-limit error run
#       `gh api rate_limit --jq .resources.core` once, sleep until the reset time, then continue.
#    d. Local tests only through /home/user/workspace/ops/heavy.sh, one targeted file at a time; if the heavy line makes you wait more than
#       15 minutes, push and let CI prove it (cite the failing-first test in the PR body).
# 5. Shared deps: /home/user/workspace/deps/<repo>/READY appears when the install finishes (started 15:58). Until then read code and rely on
#    PR CI. The backend's shared node_modules already holds a Prisma client generated from main's schema; run prisma generate only if your
#    PR changes prisma/schema.prisma.
# 6. The 10-07 afternoon owner decisions (13:00-15:35) are not yet in SoT A6.10: read section 9 of
#    /home/user/workspace/tgp-agent-context/handoffs/op-128/HANDOFF.md for them.
# 7. No tester accounts yet (the owner was asked). Explorers and auditors trace from code, read-only SELECTs and unauthenticated GETs; never
#    sign in to production, never create or change data.
# 8. Reports: /home/user/workspace/ops/reports/<ID>.md ("reports/" in any entry means this folder). Notify line:
#    /home/user/workspace/ops/lanes128/notify/<ID>.txt. Put any proven B at the top of your report the moment you prove it.


# ----- (_COMMON_128 follows; superseded where the agent 130 overrides or the agent 129 header differ) -----
# OWNER 14:08 OVERRIDE (wins over item 7 and over any "then wait for verdicts" / "second job" text below or in JOBS128.md):
# BUILDERS: after your READY comment is posted (CI green, no conflict), write your report's HANDOFF + the notify line and FINISH. Do not wait
# for verdicts and do not start a second job; the operator spawns a fresh agent for every next screen. Review findings and merge conflicts
# are fixed by the FIX lane (FIX-*-128 in JOBS128.md). The PR stays open and safe: nothing merges without both lenses at the exact head.

# OPERATOR 14:16: backend commits MUST be made with LEFTHOOK=0 (e.g. `LEFTHOOK=0 git -c user.name=... commit ...`): the backend pre-commit
# hook runs a full-project type check that exhausts the shared sandbox's memory and can kill other agents' processes. CI runs the same check.

# _COMMON_128 — common brief for every agent 128 worker (read fully, then ONLY your entry in /home/user/workspace/ops/lanes128/JOBS128.md)

Operator: agent 128, 2026-10-07 from 12:50 PDT. Agent 127 and all earlier operators are retired; their workers are stopped. You are one of up
to 25 concurrent workers sharing ONE sandbox (2 CPU, 7.9 GB) and ONE GitHub Actions runner pool. Be frugal with both.
Owner 13:02 10-07 (verbatim): "scale to 25 agents - I want all the PR's agent 127 left half done finished, and then all 30 screens on the next
to-do done and made LUXURIOUS, SIMPLE, MENTALLY DELOADING, AND CALM! execute".
Standing owner priorities: ordinary food/workout logging first ("TOP PRIOTY for the food and workout logging to be kick ass, and for the flow
of money to be BULLETPROOF"); the luxurious screen redo with honest copy; Roman's intelligence (memory ON by default); the AI workout builder.

Rules: /home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md (main). Read ONLY A1, the two OWNER OVERRIDES at the top of A2
(EDGE-CASE FREEZE items 1-6, RUTHLESS SCOPE items 7-11) and A6 (A6.10 = all owner decisions of 10-07), unless your entry names more.
GitHub wins over every SHA in this file.

## The product and the state (verified 13:05 PDT 10-07)
- TGP: a 1:1 personal-training platform. Coaches sell packages (recurring packages are the most critical item), schedule sessions, message
  clients, build programs and meal plans, get paid through Stripe Connect. Clients train, log food and workouts, log health data (Apple
  Health, Health Connect), chat with Roman (the AI coach persona), join the community and pay. Backend: NestJS + Prisma + Postgres (Supabase)
  on Fly. Mobile: React Native / Expo, iOS and Android; store builds use eas.json profile "clinic".
- Production = backend deploy 23 f73c6521 (11:22). Backend main 0d179edb (adds b#833 #834 #838 #835 #831 #840 #841 #839 #837 #842; deploy 24
  follows main CI). Mobile main d0875d26 (redo merged today: m#465 #466 #467 #468 #471 #472 #475 #476 #477 #478 #480; also #454 #455 #456).
- Production flags = backend .github/fly-env-desired-state.json on main ("unset" = name absent, code default applies). AI workout builder ON
  since 10:44 (FEATURE_MWB_AI_LIVE_CREATE, AI_GATEWAY_*). FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_PLAYBOOK are unset (off).
- Production data: very few users; 0 real payments; synthetic store-review accounts exist (a review coach and a review client). Never print
  their emails or any secret anywhere. Owner = Bradley Gleave (featured coach). Never name the clinic partner anywhere: all repos are PUBLIC.
  Spend no money.

## What counts (binding: SoT A2 overrides 1-11)
- B (fix before launch): a normal user, on a normal day, hits: money wrong/lost/given away; private, health or payment data shown to the
  wrong person; safety/crisis routing miss; data loss; a reachable security hole; App Store / Play / legal failure; a false customer-facing
  claim; a core flow (sign up, sign in, pay, book, message, train, log food, coach payouts, coach sees client logs) that breaks or dead-ends.
  Every B has ONE plain sentence: how an ordinary user hits it and what goes wrong.
- U (fix if small and safe): happy-path defects below Apple level: dead/mislabelled button, missing loading/empty/error state, generic error,
  wrong number, endless spinner, copy that contradicts the app, broken navigation. Product copy: no first person (Roman's own "I" in his
  chat voice is the one exception), no emojis, no exclamation marks, no generic errors.
- C: everything else. Edge cases (time zones, DST, races, retries, out-of-order webhooks, crash-mid-write, extreme volume, odd inputs, old
  builds, extra defence on guarded paths) get ZERO time. If noticed: one line "C (edge, deferred to 10k clients)".

## How you work
1. gh and git need bash with api_credentials=["github"]. Always pass --repo / -R BradleyGleavePortfolio/<repo>. Prefer REST
   (`gh api repos/BradleyGleavePortfolio/...`). For CI: `gh pr view N -R ... --json statusCheckRollup` or
   `gh api repos/<o>/<r>/actions/runs/<id>/jobs`. Poll CI no faster than every 120 s (sleep 120 between polls). On 401 "Bad credentials"
   do not loop: keep work committed locally, write it in your report, tell the operator.
2. Read current code in the READ-ONLY worktrees /home/user/workspace/wt/RO-backend (main 0d179edb) and /home/user/workspace/wt/RO-mobile
   (main d0875d26). Never edit, check out, build or run anything in them, in /home/user/workspace/deps/*, or in
   /home/user/workspace/growth-project-* (except `git -C ... fetch` and `git -C ... worktree add`). For a newer main use
   `git -C /home/user/workspace/growth-project-<repo> fetch -q origin main` and `git -C ... show origin/main:<path>`.
3. Your own worktree, ABSOLUTE path:
   - New PR: `git -C /home/user/workspace/growth-project-<repo> fetch -q origin && git -C /home/user/workspace/growth-project-<repo> worktree add -b agent128/<job-lower> /home/user/workspace/wt/<JOB>-<repo> origin/main`
   - Finishing an existing PR: `git -C /home/user/workspace/growth-project-<repo> fetch -q origin <headRefName> && git -C /home/user/workspace/growth-project-<repo> worktree add -b <headRefName> /home/user/workspace/wt/<JOB>-<repo> origin/<headRefName>`
     then push to that same branch. Never force-push. To bring in main: `git merge origin/main` (no rebase).
   Commit identity on EVERY commit: `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com" commit ...`, no AI
   co-author trailer. Verify with `git log -1 --format='%an <%ae> / %cn <%ce>'`.
4. Shared deps: /home/user/workspace/deps/{backend,mobile}/node_modules; a READY file appears in /home/user/workspace/deps/<repo>/ when the
   install finishes (until then read code and rely on PR CI). Link with `/home/user/workspace/ops/link_deps.sh <backend|mobile> <worktree>`;
   backend then `/home/user/workspace/ops/heavy.sh npx prisma generate` inside your worktree. Local runs ONLY through
   /home/user/workspace/ops/heavy.sh (one global lock), ONE targeted jest file at a time, e.g.
   `cd <worktree> && /home/user/workspace/ops/heavy.sh npx jest src/screens/client/__tests__/X.test.tsx`. NEVER a full suite, NEVER
   full-project tsc or eslint locally (CI does those).
5. CI ECONOMY (25 agents share the runners): push only when your change is complete and its targeted tests pass locally; batch every fix
   into one push; never push WIP just to "see CI"; never re-run green jobs. A failing-first proof may be ONE tests-only push (or a local
   run on main recorded in your report). Backend: if a job sits on "Install postgresql-client" for more than 10 minutes, it is hung: you may
   `gh run cancel <run> -R ...`, wait until it is completed, then `gh run rerun <run> --failed -R ...` (your own PR's run only).
6. PRs: based on main, each UNDER 800 changed lines (hard fail above 1,500: additions + deletions, tests count; lockfiles/generated/snapshots
   excluded). Check size before every push. Conventional Commits title. No new `as any` / `as unknown as` / `as never`, no empty
   `.catch(() => undefined)`. Failing-first tests where behaviour changes. No lockfile edits, no new dependencies. Migrations only if truly
   required: additive, newer than every existing one. Mobile changes must work against the CURRENT production backend.
   PR body starts with the tier header (SoT A3 section 8.1): Tier, Why, T4 trigger scan, T3 trigger scan, Bounded T1, Canonical builder,
   Parent owner, Acceptance evidence, Promotion triggers. Then "What changes for coaches/clients" in plain words, then the B/U list.
   Mobile UI PRs also carry the parity table and the truthful sweep (see the redo rules below) and update the matching README
   (mobile docs/QUIET_LUXURY_DOCTRINE.md section 8).
7. When CI is green at your head, post ONE comment whose first line is exactly
   `FIX ROUND 1 (OPENING) (<JOB>, agent 128) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`
   (finishing an agent 127 PR: `FIX ROUND <k> (<JOB>, agent 128) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`, k =
   previous round + 1). Then STAY: poll the PR every 5 minutes (sleep 300) for up to 75 minutes for the two lens verdicts at that exact head
   ("AUDIT Claude Opus 5.5 (...)" and "AUDIT GPT-6.1 Sol (...)"). On a REQUEST CHANGES at your head: fix only its Bs (and a U if one line),
   push once, CI green, post `FIX ROUND <k+1> (<JOB>, agent 128) — ... @ <new sha> — READY FOR AUDIT` naming the findings fixed, and keep
   waiting. Done = both lenses APPROVE at your current head (the operator merges), or 75 minutes with no verdict (say so in your report).
8. Promotion (SoT A3 section 9): a GPT worker that finds a needed T4 change (auth, RLS/tenancy, PII, money, credentials, destructive data)
   does NOT build it: write it with file:line + smallest fix for the operator to route to Claude Opus 5.5.
9. Never: merge; deploy; run fly-deploy.yml, fly-secrets-set.yml or fly-env-sync; change branch protection, settings, environments or
   production flags; write to production, Fly, Supabase, Stripe, Expo or EAS; start a store build; spend money; close PRs; push to a branch
   you were not assigned; comment on PRs you were not assigned (lenses post verdicts and claims only); use a time you did not get from
   `TZ=America/Los_Angeles date`.
10. Report: /home/user/workspace/ops/reports/<JOB>.md, kept current. Sections: Scope traced, B list, U list, C one-liners, PRs (number,
    head, lines, CI, verdicts), "Not fixed (needs operator)" with file:line + smallest fix, and a final "## HANDOFF" so a fresh agent can
    continue. When done write one line to /home/user/workspace/ops/lanes128/notify/<JOB>.txt:
    `done | PRs: <list or none> | B=<n> U=<n> | verdicts: <opus>/<sol> @ <sha8> | needs operator: <n>`.
11. Final answer to the operator, under 200 words: PR(s) + exact heads + line counts + CI state + verdicts, top findings one line each, and
    anything that needs an operator or owner decision (each with a recommended default).

## Mobile screen redo rules (owner 10:35 + 13:02 10-07; binding on every DES job and every mobile PR)
Owner 10:35 (verbatim): "HONEST COPY, NO DEAD BUTTONS, LUXURIOUS SIMPLE FEELING, ALL IMPORTANT INFO PRESENT, MENTALLY DELOADING, WIHTOUT
CUTTING MOBILE PATHWAYS OR LOOSING FUNCTIONALITY!" Owner 13:02: "LUXURIOUS, SIMPLE, MENTALLY DELOADING, AND CALM!"
1. Honest copy: every line states something true from the user's real data at that moment, or is neutral/instructional. Nothing invented
   (counts, streaks, goals, schedules, praise, promises, a coach/plan/history/permission/feature the user may not have). State-driven variants,
   each tested. Nothing true to say = show nothing. Never claim exclusivity of access ("only you") — the platform owner account can read
   client logs; describe the client-coach sharing state instead.
2. No dead buttons: every tappable element does something real; anything that cannot work is wired or removed (removal cites rule 1 or 2).
3. Luxurious, simple, calm: "A23 layout + comfort rules" inside the existing brand (DESIGN-AUD-127 section (e) picks table):
   bone page #F5EFE4 with no cream card fills; hairline separators instead of boxes and shadows; one headline, one hero (number or sentence),
   ONE forest primary action per screen; small-caps letter-spaced overlines in muted grey; Cormorant Garamond (weight <= 500) only for titles,
   hero numbers and one-line summaries; Inter for everything read or tapped; text >= 13 pt (11 pt only for overlines and tab labels);
   tabular numerals for numbers that change; sentence case; outline icons; tap targets >= 44 pt; generous negative space; monochrome data
   (no category-coded chips, no red for "over" — say it in words); motion <= 300 ms for anything the user waits on, 400 ms only for passive
   fades; no particles, confetti, springs, trophies, gradients, glows, FABs or global banners (mobile docs/QUIET_LUXURY_DOCTRINE.md); no
   photos or illustrations; card/sheet radius 4. Reuse src/ui primitives (QuietBar src/ui/progress/QuietBar.tsx, FadeInView, HapticPressable,
   SkeletonScreen, CoachErrorState) before adding new ones.
4. All important info present: nothing a client or coach needs is removed or pushed behind extra taps.
5. Mentally deloading: one primary action per screen, calm hierarchy, fewer competing elements, secondary detail by progressive disclosure.
6. No pathway or function cut: list every route/button/action on the screens you touch before and after in the PR body (table
   "Routes/actions before -> after": label, destination or effect) and prove parity in a test (navigation targets and handlers reachable).
   Where rules 4/6 clash with rule 5, rules 4 and 6 win.
7. Dark-mode readiness: colours only from the theme (useTheme / semantic tokens), never the legacy fixed palette or new hex literals. Dark
   stays hidden for launch.
8. Owner decisions 11:26: six client tabs with labels stay (no tab or navigator change); forest green for every primary button (merged
   m#475); any Health goal shown uses the Starter goal constants (5,000 steps, 20 exercise minutes, 250 move kcal) labelled "Starter goal"
   when nobody set a target.
Design sources (read the parts your entry names): /home/user/workspace/tgp-agent-context/handoffs/op-127/ops/DESIGN-AUD-127.md (sections (c),
(d)A, (d)0, (d)1, (e)); /home/user/workspace/tgp-agent-context/design-targets/mobile/CATALOG.md and the folder images named in your entry
(view them with the read tool; they are the bar, not the blueprint; names and figures in them are fictional); the guide
/home/user/workspace/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md (sections 4.2-4.8, 5.1 step 6, 5.5, Part VII
Layer 2); mobile docs/QUIET_LUXURY_DOCTRINE.md and src/__tests__/quietLuxuryDoctrine.test.ts, truthfulCopy guard tests.

## Translating agent 127 entries (DES-JOBS-PASTE.md / JOBS127.md) for agent 128
Entries written for agent 127 apply as written, except: "ops/reports/DESIGN-AUD-127.md" = the tgp-agent-context path above;
"_COMMON_127" = this file; your branch is agent128/<job-lower>; you sign "agent 128"; reports go to /home/user/workspace/ops/reports/;
file:line references were checked on an older mobile main (8591058 / f71b425e) — re-check them on current main before editing.
