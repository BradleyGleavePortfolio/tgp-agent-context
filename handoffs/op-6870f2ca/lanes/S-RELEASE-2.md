# Lane S-RELEASE-2 (agent 112, round 2 after stop) — Claude Opus 5.5 builder, mobile PRs #333 then #330 only

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Commit identity: git -c user.name="TGP Agent 112" -c user.email="agent@tgp.invalid".
gh/git need bash api_credentials=["github"]. Owner: wall clock is the #1 resource, quality non-negotiable. Expo Free: never start an EAS build.

PRs (BradleyGleavePortfolio/growth-project-mobile), both Opus APPROVE and GPT-6.1 Sol REQUEST CHANGES at their heads:
1. #333 feat(release): pre-build release-env check per EAS profile, branch agent/release/release-env-check, head abfc5d12;
   Sol 0/2/1 (comment https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333#issuecomment-5961127779).
2. #330 feat(sentry): native crash capture before JS loads, no PII, branch agent/release/sentry-native-init, head 4c61d915;
   Sol 0/2/2 (comment https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330#issuecomment-5961220272).
Sol's evidence/probes may be under /home/user/workspace/ops/aud-sol3-112/. Operator rulings: a live Stripe publishable key is REQUIRED
on clinic and production builds (#333 must fail those profiles without pk_live, never preview); keep the Sentry plugin until Expo
supports Sentry SDK 8; Sentry gets the account id only, never the email (OR-112-15).
Task: close every B on both PRs (and Cs that are one-liners in files you touch) with failing-before tests. Do #333 first, push, then #330.
Process per PR: worktree /home/user/workspace/wt/s-release-2-<n>; `bash /home/user/workspace/ops/link_deps.sh mobile`; merge origin/main
(f34b5b99) into the branch; targeted jest via /home/user/workspace/ops/heavy.sh only (never wrap it in a short timeout); eslint; the
guards CI runs (package.json scripts). Push; wait for the 3 required checks green (max 30 min). Update the PR body fix-round table,
post one fix-round comment. Unlink node_modules and remove the worktree after each PR.
Report: /home/user/workspace/ops/reports/S-RELEASE-2-112.md ending with "## HANDOFF FOR AGENT 113". Never merge, never dispatch
workflows or EAS builds, never touch production or EAS env values.
Final answer (<250 words): per PR head, CI, findings closed with test names, anything deferred.
