# Lane S-WEAR-3 (agent 113) — Claude Opus 5.5 builder, T4 (health data): mobile #317 wearables
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

PR: mobile #317 (agent/clinic/s14-wearables-mob @ 58c2d53f) Apple Health / Health Connect connection (T4). Only writer: you.
Prior: /home/user/workspace/ops/reports/S-WEAR-2-112.md (HANDOFF) and S-WEAR-2-112-pr317-body.md. Close Sol's Bs (cancellation before
fence creation, native reads after logout, cloud error mapping) + C-317-5 (remove Samsung permissions not used) + every other open
A/B from both lenses' latest verdicts. Health data never leaves the device without consent; reads stop the instant the user logs out;
per-cause copy for every permission/error state; Apple-level connect flow (one tap, clear value, clean denied/revoked states).
Merge origin/main. Native build + device pass happen later (owner); state any device-only checks in the PR body.
Report: /home/user/workspace/ops/reports/S-WEAR-3-113.md.
