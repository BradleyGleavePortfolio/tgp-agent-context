# BRIEF PREAMBLE — R85 v3 checkpoint pushes

Embed verbatim in every builder/fixer/auditor brief.

---

## R85 v3 — CHECKPOINT-DRIVEN PUSHES (BINDING)

Push your work-in-progress at named checkpoints, foreground only. **No daemon.**
**No timer loop.** **No auto-push of unreviewed content.**

### Required checkpoints (AUDITORS)
1. After clone + setup → push empty stub
2. After banned-token sweep → push partial
3. After reading diff + measuring LOC → push partial with findings draft
4. BEFORE any tsc / jest / doctrine-sweep / npm-install → push pre-build snapshot
5. After build/test → push results
6. Final report → push to `handoffs/audit-reports/TM-<N>-<X>-<SHA8>.md`

### Required checkpoints (BUILDERS/FIXERS)
1. After scaffold → push WIP + open PR
2. After each file changed (or every 5 min)
3. BEFORE any long command
4. Before marking ready-for-audit

### Push command (foreground)
```bash
cd /tmp/ctxrepo  # or your worktree
git add <files>
git -c user.email=bradley@bradleytgpcoaching.com -c user.name=bradley \
    commit -m "wip: <lane> @ <checkpoint-name>"
git push origin main  # auditors → ctxrepo main
# or
git push --force-with-lease origin HEAD:wip/<lane>-snapshot  # builders/fixers
```

### Identity (R74)
Every commit: `bradley@bradleytgpcoaching.com`. No AI/Claude/Computer/Agent/
Co-Authored tokens anywhere.

### What you DO NOT do
- DO NOT launch `tools/r85_background_pusher.sh` — DEPRECATED.
- DO NOT run any timed push loop in the background.
- DO NOT push files you have not just inspected (`cat` your report before push).
