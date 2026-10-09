# OPERATOR AGENT 134 OVERRIDES (2026-10-08 19:40 PDT). These win over everything below (the agent 133 header Q1-Q10b, the agent 132
# header and older text) where they differ. Read this header fully, then ONLY your entry in /home/user/workspace/ops/lanes134/JOBS134.md.
#
# P1. WHO. Operator is agent 134. Agents 132 and 133 are retired; agent 134 holds ALL lanes (release, client journey, coach journey).
#     Sign every comment "agent 134". New branches: agent134/<job-id-lower>. New PR titles start "[134]", then bug IDs (B03 ...) and
#     prototype screen numbers. Existing agent132/* and agent133/* PRs keep their branches: fix-round builders push to that branch.
#     Your worktree(s) are ALREADY MADE at the absolute paths in your entry. Work only there. Never edit /home/user/workspace/wt/RO-*,
#     deps/* or the repos/ clones (except `git -C ... fetch`). Never git stash, never rebase, never force-push; bring main in with
#     `git merge origin/main`. node_modules: `/home/user/workspace/ops/link_deps.sh <mobile|backend> <your worktree>` (until it prints
#     linked, read code and rely on PR CI). Heavy commands: `/home/user/workspace/ops/heavy.sh <cmd>` (one test FILE at a time).
# P2. OWNER WORDS THAT BIND EVERY AGENT (verbatim, PDT, 10-08):
#     17:58 "Wire roman up, fix the onbaording, get the real luxurious screens produced, then push all of that to a new apk build for
#     andriod and IOS with the fixed flows and UI!"  18:26 "NO DO NOT KICKOFF A HALF ASSED BUILD."  19:34 (to agent 134) decision 134-1:
#     the coach consultation (prototype 77-85) goes into build 8 and build 8 waits for it: "start builders on it in your first agent
#     wave ... lets get this shit DONE!"  15:29 coachless clients "can do everything a normal coached client can, besides getting direct
#     coaching ... it's just empty for them inherently" (no lock pages). 16:20 the prototype governs ONBOARDING at about 90%; the six
#     client tabs and today's button counts stay. 17:07 "I want nice rounded corners, luxurious, not rectangles" (tokens: buttons and
#     inputs 12, cards 16, sheet tops 24, chips pill; never hardcode a radius). 19:12 the 9 redesigned screens nothing opens: KEEP them.
#     The consultation is the ONLY onboarding experience for coaches and clients alike.
# P3. SPEC (this session's paths; the old specs133/ paths in older text below map here):
#     Prototype screens: /home/user/workspace/specs134/shots/NN-ID.png (00-86, same numbering as the prototype navigator; index.json
#     has id, title and the full behaviour-notes panel text per screen). Interactive prototype: /home/user/workspace/specs134/prototype/
#     index.html (deep link #ID; js/screens-consult.js = auth + consultation + reveals; js/screens-app.js = states, tour, Roman, coach
#     track K0-K8). Index: 00 AUTH, 01 ROLE, 02 CREATE, 03 W1, 04-05 G1-G2, 06-09 B1-B4, 10-11 L1-L2, 12-16 T1-T4, 17-20 S1-S3b, 21-25
#     N1-N5, 26-35 P0-P8, 36 C1, 37 SUM, 38 PREP, 39 MACRO, 40 PLAN, 41-45 states, 46-60 tour, 61-62 push, 63 LAND, 64-66 tour skip/
#     re-offer/pending, 67 R-MORE, 68 R-CONSENT, 69-73 Roman chat, 74 R-PRIV, 75 ROLE-C, 76 CREATE-C, 77-85 K0-K8, 86 K-LAND.
#     Owner documents: /home/user/workspace/specs134/owner/ (TGP-Bug-Register-41-problems.md, TGP-Onboarding-Pathways-and-Prototype-
#     Review.md, Mobile-App-Design-Intelligence.md (text of the .docx), the 11 phone screenshots 1000021147-1000021170.jpg = what the owner
#     saw, the house-program fixture TGP-Fitness-Four-week-master-programs-JSON-fixture.json). Luxury bar: repos/tgp-agent-context/
#     design-targets/mobile/CATALOG.md and every */luxury.jpg. Doctrine: docs/QUIET_LUXURY_DOCTRINE.md (rule 5 overridden: rounded),
#     src/theme/README.md. Shared look (merged m#577, m#587): src/theme tokens, Screen, PrimaryButton, TextLink, Headline, WheelBand,
#     QuietRow, section title. Never write local copies.
# P4. QUALITY BAR = agent 133 header Q5 + Q10b (below). Every mobile UI PR body: parity table (prototype screen | today's file | what
#     matches | what differs and why) and what was NOT seen on a device. Android first-class (react-native-safe-area-context only; serif
#     lineHeight >= 1.2 x fontSize). One filled forest button per screen. App copy: no first person (Roman excepted), no exclamation
#     marks, no emojis, no generic errors, theme colours only. Coachless copy never says "your coach" when there is no coach.
# P5. FORMATS (board.py and merge_if_dual.sh parse first lines exactly; dashes are em dashes "—"):
#     READY  `FIX ROUND 1 (OPENING) (<JOB ID>, agent 134) — growth-project-<repo>#<n> @ <full 40-hex head sha> — READY FOR AUDIT`
#     Fix round on an existing PR: `FIX ROUND <k> (<original JOB ID>, agent 134, <your ID>) — growth-project-<repo>#<n> @ <sha> — READY FOR AUDIT`
#     VERDICT `AUDIT Claude Opus 5.5 (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or `— VERDICT: REQUEST CHANGES`)
#             `AUDIT GPT-6.1 Sol (<your ID>) — growth-project-<repo>#<n> @ <full sha> — VERDICT: APPROVE` (or REQUEST CHANGES)
#     CLAIM   `OPUS LENS CLAIM (<your ID>) @ <full sha>` / `SOL LENS CLAIM (<your ID>) @ <full sha>`
#     The merge script counts only the LATEST verdict per lens at the exact head. A body-only fix at the same head needs a NEW verdict
#     line at that head (post it; it replaces the old one). Every new PR body adds "WHY / WHEN / WHO" (root cause, commit + PR that
#     introduced it) and the bug IDs.
# P6. REPORT /home/user/workspace/ops/reports/<your ID>.md (kept current; final "## HANDOFF"). NOTIFY one line in
#     /home/user/workspace/ops/lanes134/notify/<your ID>.txt: `done | PRs: <list or none> | B=<n> U=<n> | head: <sha8> | needs operator: <n>`.
#     Final answer to the operator under 150 words. Anything outside your entry: "Proposed (needs operator)" with a default.
# P7. STATE (verified on GitHub 19:28 PDT; GitHub wins, always re-fetch): mobile main 2acc228c372537119739453d065673614134fb9c; backend
#     main e261ce5e85ac9b7f0a5df5687ed81813aea96671 = production (deploy 7, 18:51, /health ok). Board: /home/user/workspace/ops/board/
#     board.md (refreshed every 3 minutes; verdicts and claims at the current head only). Merge loop: operator only (merge_if_dual.sh,
#     base main only; stacked PRs are retargeted to main by the loop after their base merges).
# P8. GITHUB: bash with api_credentials ["github"]; on every GitHub call first `umask 077 && printf %s "$GH_ENTERPRISE_TOKEN" >
#     /home/user/workspace/ops/.ghtoken` (keeps the board and merge loop alive). Poll GitHub at most once every 180 s.
# P9. STILL BINDING from the agent 133 header (Q5, Q6 formats read with 134, Q9, Q10b) and the agent 132 header (Q3 builder steps, Q4
#     lens rules and grading, Q9 items): targeted tests only, one push, CI green, READY; lenses T4 scan first, B only for real
#     ordinary-use harm (one plain sentence), edges are "C (edge, deferred to 10k clients)"; Sol posting rule (never quote crisis,
#     self-harm or eating-disorder copy). Commit identity: `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com"
#     commit`, no AI co-author line, backend LEFTHOOK=0. Under 800 lines (snapshots excluded, tests count); over 1,500 fails. Never
#     merge, deploy, build or touch flags (operator only). Never name the clinic partner (public repos). No secrets, no personal emails.
#     Supabase rpyfdsgxxltzutgqeouk SELECT only. No money, no Stripe changes. Label every finding "seen in a test" or "from the code".
# P10. FILE OWNERSHIP (agent 134 wave 1): one builder per file; your entry lists your files. If you need a file outside your entry,
#     write "NEED <file> — <why> — <your ID>" in your report and keep working on the rest; the operator answers in your report or by
#     message. Shared hot files (RootNavigator.tsx, CoachWizardNavigator.tsx, eas.json, app.json, package.json, ci.yml,
#     schema.prisma): only the job named owner in JOBS134 edits them.
# P11. BUDGET: the owner reads credits; be frugal (read only what your entry needs; no full local suites). Never estimate credits.
# P12. STOP: when the operator sends STOP, finish the current step, push nothing half-done, write the HANDOFF and end.
# ----- agent 133 header and older text follow (superseded where P1-P12 differ) -----
#
# P13. SHARED SANDBOX (added 20:12 PDT after a sandbox stall at 19:50-20:06; load average hit 27 on 2 CPUs). Every agent shares ONE
#     machine (2 CPUs, 8 GB). Every jest, tsc, eslint, expo or prisma command goes through /home/user/workspace/ops/heavy.sh (2 slots).
#     Never run npm install / npm ci (operator only; deps/ is the shared install). Lenses run no tests at all (CI is the test). Poll
#     GitHub or the board no faster than every 180 s. Background processes die when your bash call ends: run things synchronously.
#     If a tool call fails with a sandbox/transport error, wait 60 s and retry (up to 5 times) before reporting a failure.
# P14. MAIN WAS RED 19:48-?? (m#609 merge: duplicate semanticColors key, TS1117 in src/navigation/__tests__/imessageDmRoutes.test.tsx).
#     Fix = m#617 (operator, test-only). If your PR's "Typecheck, lint, test" fails ONLY on that TS1117, it is not your bug: after
#     m#617 merges, `git merge origin/main` and push (FIX ROUND line says "main merge for m#617").
# P15. FLAKY CI TEST (20:30): src/screens/client/wearables/__tests__/ConnectProviderSheet.attemptFence.test.tsx "sign-out: no prompt,
#     registration, local grant or read" fails under CI load (m#617 run 37878003308) but passes 21/21 locally (seen in a test, operator).
#     If your PR's CI fails ONLY on that test: `gh run rerun <run id> --failed -R <repo>`; no code change. Lenses: not a B.
