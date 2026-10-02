# Lane S-ROMAN-CHATS-2 (agent 113) — Claude Opus 5.5 builder, T4: mobile #331 Roman conversations
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

PR: mobile #331 (agent/clinic/roman-chats-mobile @ a224e5bd): your conversations with Roman, list, open and delete (T4). Only writer.
Prior: /home/user/workspace/ops/reports/S-ROMAN-CHATS-112.md and B-CONSENT-4-to-S-ROMAN-CHATS.md. Sol BLOCKED with an A: a
cross-account destructive intent / transport credential race (a delete started under account A can execute with account B's
credentials after logout/login). Fix at the root (bind every destructive request to the account/session that started it; cancel or
drop in-flight work on auth change; tests that interleave logout/login), plus Opus B-331-1 and every other open A/B/C worth closing
from both lenses' latest verdicts. Chats are kept forever unless the user deletes them or the account (owner); delete must be
confirmed and undo-safe. Merge origin/main. Report: /home/user/workspace/ops/reports/S-ROMAN-CHATS-2-113.md.
