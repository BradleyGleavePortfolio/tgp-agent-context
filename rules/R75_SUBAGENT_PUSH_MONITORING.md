# R75 — Subagents are unreliable on R52; operator must monitor + push for them

**Codified:** 2026-06-14 by operator (Bradley Gleave), after empirical evidence on the 6-lane parallel dispatch night (L1-L6).

## Rule

The operator MUST NOT assume a dispatched subagent will adhere to R52 ("push every 2 min"). Subagents reliably commit locally but inconsistently push to origin, even when R52 is restated verbatim in the brief.

Operator-side mitigations (mandatory for every multi-lane parallel dispatch):

1. **Probe each lane workspace at least every 15 min** via `/tmp/{repo}-L{N}/` git log + `git status --short` + `git log @{u}..HEAD` (unpushed commits)
2. **If unpushed commits exist:** push them ON BEHALF of the subagent using `api_credentials=["github"]`. Verify author is `Bradley Gleave <bradley@bradleytgpcoaching.com>` before pushing.
3. **If working tree has uncommitted changes after 15+ min:** send a targeted R52 ping naming the modified files
4. **If branch HEAD has not moved in 30+ min:** treat as stalled. Either:
   - Send a sharper status-request ping naming the suspected blocker
   - Cancel + redispatch with a v3 brief that adds the failure mode as an explicit anti-pattern
   - OR take the work synchronously (faster than re-dispatch for small lanes)

## Evidence (2026-06-14 dispatch)

| Lane | Pinged at | Behavior |
|---|---|---|
| L1 zod 4 | T+35min | Had local commit, pushed after ping (good response) |
| L2 async-storage | T+35min | Uncommitted changes, committed + pushed after ping (good response) |
| L3 RNTL v14 | T+35min | HEAD never moved past starting commit `9662f7f` — ping ignored, lane stalled |
| L4 Roman backend | T+35min | Started research, committed + pushed within 5min of ping (good response) |
| L5 Roman mobile | T+35min | Had 4 unpushed commits — ignored R52 ping, operator pushed for them |
| L6 drip-fire-at | T+10min | Pushed proactively (best response — shortest brief, mechanical work) |

**Pattern:** Builder lanes with broad scope (L3, L5) batch commits and skip pushes. Mechanical lanes (L6) push proactively. Fixer lanes (L1, L2) respond well to pings.

## Operator-side health probe template

```bash
# Run every 15 min for active lanes
for d in /tmp/gpb-L1 /tmp/gpm-L2 /tmp/gpm-L3 /tmp/gpb-L4 /tmp/gpm-L5 /tmp/gpb-L6; do
  cd "$d" 2>/dev/null || continue
  echo "=== $d ==="
  echo "Branch: $(git branch --show-current)"
  echo "HEAD: $(git log -1 --format='%h %ar %s')"
  echo "Unpushed: $(git log --format='%h %s' @{u}..HEAD 2>/dev/null | wc -l) commits"
  echo "Modified: $(git status --short | wc -l) files"
done
```

If `Unpushed > 0` or `Modified > 0` for ≥ 5 min → action required.

## Anti-pattern to add to all future BUILDER_BRIEF_TEMPLATE_V2 dispatches

Add this verbatim under "Workflow" section:

> **R75 push discipline — non-negotiable.** After EVERY single commit, the IMMEDIATE next action MUST be `git push origin <branch>` using `api_credentials=["github"]`. Do not chain commits. Do not "save the push for after the test passes." If you write the commit, push it before moving to the next file. The operator monitors push frequency as the primary health signal — silence = stalled = cancelled.

## Status

- This rule is canon for all future multi-lane dispatches
- BUILDER_BRIEF_TEMPLATE_V2 will be updated with the R75 anti-pattern block in a follow-up commit
