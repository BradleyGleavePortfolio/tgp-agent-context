# START HERE — Wave H Endgame Operator Bootstrap

You are the next Perplexity Computer instance picking up the Wave H endgame for `BradleyGleavePortfolio/growth-project-backend`. Follow this file top-to-bottom before doing anything else.

## Step 1 — Read the state files (in this order)
1. `/home/user/workspace/current-state.json` — machine-readable state at last session end. If missing or older than 24h, the prior instance failed its handoff. Flag this to the operator before proceeding.
2. `/home/user/workspace/HANDOFF_NEXT_OPERATOR.md` — full state, locked decisions, operating contract, file-paths index. Read top to "What a fresh instance also needs" (skim the rest).
3. `/home/user/workspace/audit_briefs/EXHAUSTIVE_AUDIT_DOCTRINE.md` — binding audit rules (exhaustive, R1-R126, live-push agent sovereignty, Claude-identity fallback scope).

## Step 2 — Verify ground truth with 3 commands
```
date -u
gh pr view 464 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable,statusCheckRollup
gh pr view 465 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable,statusCheckRollup
gh pr view 466 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable,statusCheckRollup
```
All gh/git operations require `api_credentials=["github"]`.

## Step 3 — Reconcile state with reality
If `current-state.json` heads/CI match `gh pr view` output → proceed.
If they differ → the world moved during the gap; update state first, then proceed.

## Step 4 — Check in with the operator before dispatching
Tell them: current SHAs, CI status, next planned action, estimated credit cost. Wait for confirmation. Mechanics are yours; decisions are theirs.

## Step 5 — Follow the operating contract
- Strict Bradley identity on prod repo, ZERO AI tokens. Claude Auditor fallback ONLY on `tgp-agent-context`.
- Dual-lens audits (Lens A Opus 4.8 + Lens B GPT-5.5). Always union findings.
- Audits must emit a DOCTRINE RULE COVERAGE table (R1-R126).
- Live-push every finding to context repo.
- `[LOC-EXEMPT]` title marker for test-harness-only PRs.
- Subagent cap: 3-4 (npm ci OOMs at 6+).
- Repo uses Jest, not Vitest.

## Step 6 — Before ending the session
Write `/home/user/workspace/current-state.json` with the latest state. Push a copy of `HANDOFF_NEXT_OPERATOR.md` to `tgp-agent-context/handoffs/quality-bar-raise/` for durability. The next instance reads what you write.

## DO NOT
- Act before reading the three state files in Step 1.
- Dispatch subagents before writing a brief at `/home/user/workspace/audit_briefs/`.
- Bypass operator confirmation on architectural decisions (enum vs lookup table, migration bundling, identity fallback scope).
- Re-derive what's already in artifacts. If an artifact is wrong, fix the artifact; don't work around it.
