# R85 — DURABILITY MANDATE (every 2 minutes, push WIP to safety)

**Codified:** 2026-06-18 by operator (Bradley Gleave) after losing ~3 hours of agent work to paused-sandbox infra glitches and zombie subagents whose worktrees vanished before they pushed.

**Lineage:** R52 (never lose operator work), R64 (never lose anything), R75 (subagent push monitoring). R85 makes the WIP-push cadence MANDATORY and FREQUENT.

## Rule

**Every TGP coding subagent (builder, fixer, auditor) MUST push current work-in-progress to a safety location on GitHub every 2 minutes, AND before every long-running command (any `npm test`, `tsc`, doctrine sweep, large `npm install`).**

### For builders & fixers
Push to a WIP ref on the same repo (does NOT affect PRs):
```bash
git add -A
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley \
    commit -m "wip: <lane> snapshot" --allow-empty
git push --force-with-lease origin HEAD:wip/<branch-name>-snapshot
```

WIP ref naming convention: `wip/<feat-branch-name>-snapshot`. Examples:
- TM-7 split fixer → `wip/tm-7a-admin-listings-snapshot`, `wip/tm-7b-admin-applications-snapshot`
- TM-8 fixer → `wip/tm-8-applicant-tracking-snapshot`
- TM-9 split fixer → `wip/tm-9a-job-hunter-dashboard-snapshot`, `wip/tm-9b-specialty-alerts-snapshot`

### For auditors
Write the report incrementally as you audit, AND force-push the in-progress report to the context repo every 2 minutes:
```bash
cd /tmp/ctxrepo || git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo
cd /tmp/ctxrepo
mkdir -p handoffs/audit-reports/in-progress
cp <local-report-path> handoffs/audit-reports/in-progress/TM-<N>-<lens>-<SHA8>.md
git add handoffs/audit-reports/in-progress/
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley \
    commit -m "wip: TM-<N> Lens <X> audit snapshot" --allow-empty
git push origin main
```

When audit is FINAL, move the report from `handoffs/audit-reports/in-progress/` to `handoffs/audit-reports/` and delete the in-progress copy.

## Required cadence

- **Every 2 minutes** during normal work.
- **BEFORE** every long-running command (≥30 sec of execution): tsc, jest, doctrine sweep, npm install, git clone of large repo.
- **BEFORE** opening a PR (so partial branches survive even if PR-open fails).
- **AFTER** any meaningful code change.

## Recovery on sandbox death

If a subagent's sandbox dies, the operator recovers by:
1. Reading the most recent commit on `wip/<branch-name>-snapshot` (builders/fixers) or `handoffs/audit-reports/in-progress/` (auditors).
2. Spawning a fresh subagent with a brief that includes: `"resume from wip/<branch-name>-snapshot"` or `"resume from <in-progress audit path>"`.
3. The new subagent fetches the wip ref, cherry-picks or resets onto its working branch, and continues.

## Identity preservation

R85 does NOT bypass R74. Every wip commit MUST still use:
```
-c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley
```
No AI/Claude/Computer/Agent/Co-Authored tokens, even on wip commits.

## Verification

After return, the operator MUST verify the WIP ref exists and is current:
```bash
gh api repos/BradleyGleavePortfolio/growth-project-backend/git/ref/heads/wip/<branch>-snapshot
```
If the ref is missing or stale (last push >5 min before subagent return), the subagent failed to comply — flag and re-dispatch.

## Why this rule exists

2026-06-18 lost work:
- TM-7 Lens A audit: ~50 min wall + GPT-5.5 tokens → zero output (worktree gone, no push)
- TM-7 Lens B audit: ~50 min → only verbal findings survived, no markdown file
- TM-9 Lens B audit: ~50 min → zero output
- TM-8 fixer #1: ~55 min on a 4-line fix → zero output (zombie)
- TM-8 fixer #2: died at dispatch on paused-sandbox glitch → zero output
- 3 Wave-4 builders (TM-7, TM-8, TM-9 original): all 3 zombied after pushing real code, but ~30 min of polish work lost on each

R85 prevents this. Push every 2 minutes. No exceptions.
