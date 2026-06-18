# R85 — DURABILITY MANDATE (v3: checkpoint-driven foreground pushes)

**Status:** BINDING. v3 supersedes v2 (background daemon) which was incorrect.

## Why v2 was wrong

v2 mandated a `nohup … & disown` background daemon pushing to shared `main`
every 90s. Three independent GPT-5.5 auditors (Wave 4, 2026-06-18) refused to
launch it on principle. They were correct. Four stacked problems:

1. **Irreversible** — commits on shared `main` are pulled by every other client
2. **Shared-state collision risk** — parallel auditors rebase over each other
3. **Unattended loop** — detached, no health-check on what's pushed, runs after
   foreground crash
4. **Hardcoded identity** — every push signs as the operator without operator
   inspection

The daemon also solved the wrong problem: Wave 4 zombies died in minute 1
(sandbox-not-found before any work ran), not at the 90s push-gap interval.

## v3 rule — checkpoint pushes, foreground only

Every builder, fixer, and auditor MUST push at named checkpoints:

### AUDITORS — required checkpoints

1. **After clone + setup** (within first 3 min) — push empty stub report
2. **After banned-token sweep** — push partial with sweep results
3. **After reading PR diff + coverage map** — push partial with measured LOC
4. **BEFORE any long-running command** (`npx tsc`, `npm test`, doctrine sweep,
   `npm install`) — push pre-build snapshot
5. **After build/test completes** — push results
6. **Final report** — push to `handoffs/audit-reports/TM-<N>-<X>-<SHA8>.md`
   (NOT `in-progress/`) with conclusive verdict

Push command (foreground, intentional):
```bash
cd /tmp/ctxrepo
mkdir -p handoffs/audit-reports/in-progress
cp /tmp/audit-report.md handoffs/audit-reports/in-progress/TM-<N>-<X>-<SHA8>.md
git fetch origin main && git reset --soft origin/main 2>/dev/null
git add handoffs/audit-reports/in-progress/
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley \
    commit -m "wip: TM-<N> Lens <X> audit @ <checkpoint-name>"
# Retry on non-fast-forward (other auditors push too):
for attempt in 1 2 3; do
  git push origin main && break
  git fetch origin main && git rebase origin/main || git rebase --abort
done
```

### BUILDERS/FIXERS — required checkpoints

1. **After branch creation + initial scaffold** — push empty WIP commit + open PR
2. **After each file added/modified** (or every 5 min, whichever first)
3. **BEFORE any long-running command**
4. **Before opening the final PR or marking ready-for-audit**

Push command:
```bash
cd /home/user/workspace/tgp/<lane>
git add -A
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley \
    commit -m "wip: <lane> @ <checkpoint>" --allow-empty
git push --force-with-lease origin "HEAD:wip/<lane>-snapshot"
```

## What v3 explicitly DOES NOT do

- **No background daemon**. No `nohup`, no `disown`, no `&` push loops.
- **No timer-based pushes**. All pushes are at named checkpoints the agent
  consciously reaches.
- **No auto-push of unreviewed content**. The agent must `cat` its own report
  file at each checkpoint (mental review) before pushing.

## Identity (R74 carries through)

Every commit signed `bradley@bradleytgpcoaching.com`. No AI/Claude/Computer/
Agent/Co-Authored tokens.

## Verification at return

When an agent returns, operator checks:

1. At least 3 wip commits exist for that lane (proves checkpoints fired)
2. Each commit message names a checkpoint (e.g., "post-sweep", "pre-build",
   "post-jest")
3. Final report path matches `handoffs/audit-reports/TM-<N>-<X>-<SHA8>.md`
   (NOT in-progress/)
4. R74 identity on every commit

## Why this is hyperscaler

Apple/Google/Notion don't run unattended sidecars that sign in your name.
They run **structured checkpoints with named gates**. CI pipelines do this.
Database transactions do this. The agent equivalent is named-checkpoint
foreground pushes — bounded, reviewable, intentional.

## Tracked by

- `operator-meta/R85_DURABILITY_MANDATE.md` (this file)
- `operator-meta/BRIEF_PREAMBLE_R85.md` (canonical snippet for briefs)
- `tools/r85_background_pusher.sh` — DEPRECATED, do not invoke
