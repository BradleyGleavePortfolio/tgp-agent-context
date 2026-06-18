# BRIEF PREAMBLE — R85 durability snippet

Embed this verbatim at the TOP of every builder/fixer/auditor brief (after the "you are X" line, before the procedure):

---

## ⚠️ R85 DURABILITY MANDATE — APPLY FROM MINUTE 1

You MUST push your work-in-progress to a safety ref on GitHub every 2 minutes AND before every long-running command (any `npm test`, `tsc`, doctrine sweep, large `npm install`). Sandboxes have died mid-work multiple times; this protects against total work loss.

**For builders/fixers (use a WIP ref — does NOT affect PRs):**
```bash
git add -A
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley \
    commit -m "wip: <lane> snapshot" --allow-empty
git push --force-with-lease origin HEAD:wip/<your-branch>-snapshot
```
WIP ref name: `wip/<feat-branch-name>-snapshot` (e.g., `wip/tm-7a-admin-listings-snapshot`).

**For auditors (use the context repo `in-progress/` dir):**
```bash
cd /tmp/ctxrepo || git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo && cd /tmp/ctxrepo
mkdir -p handoffs/audit-reports/in-progress
cp <your-report.md> handoffs/audit-reports/in-progress/TM-<N>-<lens>-<SHA8>.md
git add handoffs/audit-reports/in-progress/ && \
  git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley commit -m "wip: TM-<N> Lens <X> audit snapshot" --allow-empty && \
  git push origin main
```

**Cadence:**
- Every 2 min during normal work
- BEFORE every long command (tsc, jest, doctrine sweep, npm install)
- AFTER any meaningful code change
- BEFORE opening a PR

**Identity:** R74 still applies to wip commits — never use AI/Claude/Computer/Agent/Co-Authored tokens. Always commit with `-c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley`.

**Verification at return:** Operator will check `gh api repos/BradleyGleavePortfolio/growth-project-backend/git/ref/heads/wip/<branch>-snapshot` exists and is fresh. Missing or stale = R85 violation.

---
