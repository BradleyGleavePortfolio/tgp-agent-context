# R85 — DURABILITY MANDATE (v2: background pusher mandatory)

**Status:** BINDING. v2 supersedes manual-push-every-2-min language.

## The problem v1 didn't solve

Manual "push every 2 min" instructions fail under load. Once an agent enters a
long-running operation (`npm install`, `jest`, `tsc --noEmit`, doctrine sweep),
foreground push cadence breaks because the agent is blocked. Wave 4 audits
(2026-06-18) showed pushes stretching from the mandated 90-120s to 200-300s
once builds started.

## v2 rule — background pusher process

Every builder, fixer, and auditor MUST start the R85 background pusher in
**minute 1**, BEFORE any other work, as a detached bash background process.

The pusher runs independently of the agent's foreground work and pushes every
90 seconds regardless of what the agent is doing.

Script: `tools/r85_background_pusher.sh` in `tgp-agent-context` repo (this repo).

## Required minute-1 sequence for AUDITORS

```bash
# 1. Clone or refresh context repo
cd /tmp/ctxrepo || git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo
cd /tmp/ctxrepo && git fetch origin main && git reset --hard origin/main

# 2. Create empty report stub immediately
mkdir -p handoffs/audit-reports/in-progress
REPORT=/tmp/audit-report.md
cat > $REPORT <<MD
# TM-<N> Lens <X> audit @ <SHA8> (IN PROGRESS)
Started: $(date -u)
MD

# 3. Initial push (proves we got here)
cp $REPORT handoffs/audit-reports/in-progress/TM-<N>-<X>-<SHA8>.md
git add handoffs/audit-reports/in-progress/
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley commit -m "wip: TM-<N> Lens <X> audit started" --allow-empty
git push origin main

# 4. Start background pusher
export R85_MODE=auditor
export R85_CTXREPO=/tmp/ctxrepo
export R85_REPORT_FILE=$REPORT
export R85_DEST_NAME=TM-<N>-<X>-<SHA8>.md
export R85_INTERVAL=90
nohup bash tools/r85_background_pusher.sh > /tmp/r85-pusher.log 2>&1 &
disown
echo "R85 pusher PID: $!"

# 5. Now do the actual audit work, writing to $REPORT as you go
```

## Required minute-1 sequence for BUILDERS/FIXERS

```bash
# 1. Set up worktree
cd /home/user/workspace/tgp/<lane>
git checkout -b feat/<lane> origin/main || git checkout feat/<lane>

# 2. Initial commit (even empty) + push to wip ref
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley commit -m "wip: <lane> started" --allow-empty
git push --force-with-lease origin HEAD:wip/<lane>-snapshot

# 3. Clone ctxrepo for the pusher script
[ -d /tmp/ctxrepo ] || git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo

# 4. Start background pusher
export R85_MODE=builder
export R85_BRANCH=feat/<lane>
export R85_WIP_REF=wip/<lane>-snapshot
export R85_WORKTREE=/home/user/workspace/tgp/<lane>
export R85_INTERVAL=90
nohup bash /tmp/ctxrepo/tools/r85_background_pusher.sh > /tmp/r85-pusher.log 2>&1 &
disown
echo "R85 pusher PID: $!"

# 5. Now do the actual work
```

## Identity (R74 carries through)

The pusher script is hardcoded to use `bradley@bradleytgpcoaching.com`. Do NOT
override `GIT_AUTHOR_EMAIL` / `GIT_COMMITTER_EMAIL` anywhere.

## Verification at return

When an agent returns, operator checks:

1. `gh api repos/.../git/ref/heads/<wip-or-in-progress>` exists
2. Last commit on that ref is < 3 min old when the agent reported completion
3. At least 3 wip commits exist (proves the pusher actually ran, not just a single push)

If only 1 push exists or last push > 5 min before reported completion → R85 v2
violation, agent flagged.

## Background pusher safety features

- `R85_MAX_MIN` env var (default 60) — pusher auto-exits after that many minutes
- 3-retry push loop with rebase on non-fast-forward (handles parallel auditors)
- Empty-commit allowance so HEAD timestamp refreshes even when no diff
- Logs to `/tmp/r85-pusher.log` for post-mortem

## Why this is hyperscaler

Apple/Google/Notion don't trust their foreground work to checkpoint itself
under load. They run sidecar daemons (think Datadog agent, OTEL collector,
chaos monkey) that operate independently of the application thread. R85 v2
is the same pattern at the agent level.
