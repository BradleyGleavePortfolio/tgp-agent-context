# Lane S-DUNNING-R5 (agent 113) — Claude Opus 5.5 builder, T4 (money/access): backend #628 + mobile #322
Method (all 113 builder lanes): read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. gh/git need bash
api_credentials=["github"]. Commit identity: git -c user.name="TGP Agent 113" -c user.email="agent@tgp.invalid". Expo Free: never
start an EAS build. Owner bar (binding): hyperscaler quality, get it right the first time (no audit ping-pong), more functionality
not less, pristine Apple-level UX, no generic errors ever (every failure: what happened + a working next action; unknown -> short
reference + support path + Sentry without PII), Quiet Luxury copy (no emojis, no exclamation marks, plain warm words, no first person
"we/us" in client-facing error copy unless it is a named human).
Process: your own worktree(s) under /home/user/workspace/wt/<lane>-<n>; wait for /home/user/workspace/deps/<kind>/READY, then
link_deps.sh; backend: `/home/user/workspace/ops/heavy.sh npx prisma generate` after linking. Run ONLY targeted jest (your touched
files + new failing-before tests) and eslint/prettier on changed files, all through /home/user/workspace/ops/heavy.sh (never wrap it
in a short timeout). Push early; GitHub CI runs tsc + full suites (stacked PRs get no CI: say so in your report). Every finding you
close gets a test that fails before and passes after. Keep the PR body tier header current (Tier / Why / T4 trigger scan / T3 trigger
scan / Bounded T1 / Builder-owner / Acceptance evidence / Promotion triggers) and add a "Fix round" table (finding -> change ->
commit -> test); if the platform refuses a long PR-body edit, post it as a PR comment instead and say so. Conventional Commits PR
titles. Merging origin/main into your branch is fine (merge commit, no force-push unless your own branch after a rebase). Wait for
required checks at your final head (max ~30 min; fix real failures; rerun the known flake once). Never merge, never dispatch
workflows, never touch production, never change branch protection. Before your final answer: unlink node_modules and remove your
worktrees. Report: /home/user/workspace/ops/reports/<LANE>-113.md (append as you go; end with "## HANDOFF").
Final answer (<400 words): PR number(s), final head SHA(s), CI state at head, per-finding disposition, tests (command + result),
overlaps/conflicts with other open PRs, anything needing an operator/owner decision (with your recommended default).

PRs: backend #628 (agent/clinic/s-dunning-v2-live @ 739e9a54; migration 20270215000000) and mobile #322
(agent/clinic/s-dunning-lockout-screen @ 0b4813dc). Pair: merge together (OR-112-13). You are the only writer of both.
Start from agent 112's unpushed work: branch wip/s-dunning-r4-backend @ c8a1c95b on origin (fetch it). Prior report:
/home/user/workspace/ops/reports/S-DUNNING-R4-112.md (read the HANDOFF section first). Known remaining items: remove the banned cast
`w.v2 as unknown as` (Banned cast tokens is a required check; type it properly), eslint, targeted specs, then push the round to #628
(merge the WIP into the PR branch; merge origin/main). Then close every open A/B from both lenses on #628 and on #322
(mobile: B-322-1, B-322-5, B-322-7, C-322-2 at least; read both lenses' latest verdict comments on each PR for the full list).
Product contract: 10-day lockout, Days 0-9 banner, native card update via the themed in-app PaymentSheet (OR-110-2: no hosted portal),
1A/2A copy rules, per-cause errors, access restored the moment the retry succeeds. Coordinate: lane B-RECUR is adding native
subscription creation (recurring packages) and its renewal failures must flow into your dunning v2 path; make sure #628 keys off
invoice/subscription events regardless of how the subscription was created and works with backend #627 settlement (separate charges
and transfers; on_behalf_of). FEATURE_DUNNING_V2 stays off until the owner's Stripe retry settings are done (do not flip flags).
Report: /home/user/workspace/ops/reports/S-DUNNING-R5-113.md.
