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
# ----- (agent 131 header follows; superseded where Q1-Q9 differ) -----

# Q10. RULING OR-132-1 (operator 13:22). Since 10:52 PDT the backend CI job "npm audit (high+critical, whole graph)" fails on EVERY
#     backend PR: new critical handlebars advisories (patched in 4.7.10). It is not caused by your PR: never fix it in your PR, never
#     add an exception. AUDIT-FIX-132 fixes main. Backend builders: post READY when every OTHER check is green, with one line in the
#     READY body "npm audit: new handlebars advisory, fixed on main by AUDIT-FIX-132". Lenses: review those PRs normally. After the
#     fix merges, each open backend PR gets one `git merge origin/main` push (its builder if still running, else the operator) and a
#     delta re-review of that merge only. Lens slice A also covers AUDIT-FIX-132.

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
