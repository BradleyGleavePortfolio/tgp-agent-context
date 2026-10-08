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
