# Merge dependency guide (for operator agent 116 and later)

Written by operator agent 115 on 2026-10-03 at the owner's request: "Note the dependency issues causing retroactive work on the
completed work - make a simple guide for agent 116". Read this before planning a wave. Each rule comes from work that had to be
redone on 2026-10-03.

## Why approved work had to be redone

The backend and mobile repos require every PR branch to be up to date with main, and a new head needs new verdicts from both
reviewers. So each merge makes every other approved PR "behind". Each of those then needs a branch update, a full CI run (shared
20-job limit, often queued), and two new short verdicts before it can merge. Only one PR per repo can merge per CI cycle.

What that cost on 2026-10-03:
1. Approved PRs went stale while they waited their turn. Mobile #328 was refreshed twice. Backend #652, #664 and #642 and mobile
   #335 and #328 ended the day approved but behind.
2. A "pure" refresh still broke things. Backend #634 conflicted with main after #647 merged. Mobile #317's refresh failed two tests
   because #305 changed shared Health Connect values.
3. Stacked PRs only partly passed. #654 sits on #627's branch, so 4 required checks (CodeQL, danger, banned casts, SBOM) never ran;
   its approval stays provisional until it is retargeted to main. The same applies to #332 on #329 and #666 on #665.
4. Backend and mobile pairs waited on deploys. Mobile #325 waits for #634 to merge AND deploy, #312 waited for #609, #328 for #640.
   They were approved early and went stale while waiting.
5. Shared files collided: app.json (#305 vs #325), the OTA doc line (OR-115-5), ci.yml, sentry config, and migration timestamps
   older than production's latest (20270213 landed after 20270224).
6. Findings landed on other PRs: C-609-6 moved to #647; C-654-9 was fixed in #334; #642 needed #608 in production first.
7. Nobody was left to finish. Builders and reviewers ended before their approved PRs merged, so the conflict fix or the last short
   verdict had no owner.

## The rules (simple)

1. Draw the graph before building. List every PR with its parents: the backend PR it needs deployed, the PR it is stacked on,
   and the shared files it touches. Fix the merge order up front and write it in the wave plan.
2. Build in merge order. Do not start the final audit of a dependent PR until its parent is merged (and deployed, for mobile pairs).
   Audit verdicts on a PR that will go stale are wasted credits.
3. Merge immediately, refresh one at a time. Merge an approved PR the moment it is green. Update only the next PR in line, right
   before its turn. Never update every approved PR at once: the next merge makes them all stale again.
4. Base PRs on main. Stack only when unavoidable, at most 2 deep, and retarget to main the moment the parent merges. Treat an
   approval on a stacked PR as provisional until the main-only checks pass.
5. Make mobile work with the old backend. A mobile PR should handle the current production backend (capability check or flag) so it
   can merge in any order. If that is impossible, put it up for final audit only after its backend is deployed.
6. One owner per shared file per wave: app.json, package.json and lockfile, ci.yml, sentry config, schema.prisma and migrations,
   release docs. PRs that touch the same shared file merge one after another, and the plan names which one adapts.
7. Migrations: additive only. Before merge, rename the timestamp to be newer than production's latest. Check any backfill against
   production row counts (read-only) before deploy.
8. Keep a small merge crew alive. Until the train is empty, keep one builder (conflicts, stale tests) and one Opus and one Sol
   reviewer (short merge-only verdicts) running. All other agents end when their PR is approved. This costs far less than leaving
   approved work stranded.
9. A finding about another PR's code goes to that PR's owner and into the plan. It never blocks the PR being reviewed.
10. Respect the size rules: 1,500 changed lines triggers a keep-or-split assessment, and over 3,000 is an automatic fail
    (MODEL_ROUTING.md section 8.2). Smaller PRs refresh faster and conflict less.

## The structural fix (owner decision, after launch)

GitHub's merge queue removes most of this: it tests the combined result once, so approved PRs never need a branch update. It is
only available to organization-owned repos (moving the repos to a free organization needs the owner's exact words: secrets, the Fly
deploy workflow and environments move with them). The other option, dropping the up-to-date requirement, trades safety for speed
and also needs the owner's exact words.
