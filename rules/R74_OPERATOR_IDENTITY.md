# R74 — OPERATOR IDENTITY ON EVERY COMMIT

**Status:** ACTIVE. Codified 2026-06-13 by operator (Bradley Gleave) during the cycle-40 resumption session.

---

## The rule, verbatim from the operator (2026-06-13)

> **"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + m yemail"**

---

## Operational meaning

Every commit on every TGP repository — `growth-project-backend`, `growth-project-mobile`, `tgp-agent-context`, `tgp-platform-site`, `tgp-finance-app`, `top-track`, `new-website`, and any future TGP repo — MUST be authored as:

```
Author: Bradley Gleave <bradley@bradleytgpcoaching.com>
Committer: Bradley Gleave <bradley@bradleytgpcoaching.com>
```

No exceptions. No agent names. No assistant names. No "Dynasia G", no "claude-bot", no "auto-merge", no co-author trailers. Bradley is the author of every artifact in the TGP product, and the git history must reflect that.

---

## Implementation

Every `bash` call that runs `git commit` MUST include both flags inline:

```bash
git -c user.name='Bradley Gleave' \
    -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "<message>"
```

Setting these via `git config --global` is forbidden because the sandbox dies and the config is reset; the inline `-c` flags are the only safe pattern.

For amend operations, use the same flags plus `--amend --reset-author`.

For `gh pr merge` operations, the merge commit metadata inherits Bradley's identity from the PR head commit. No separate flag is needed for the squash-admin merge itself, but if the merge produces a synthesized commit message, the parent agent must verify the resulting commit's author trailer is `Bradley Gleave <bradley@bradleytgpcoaching.com>` before the push completes.

---

## R74 supersedes prior author conventions

Prior agent docs reference `Dynasia G <dynasia@trygrowthproject.com>` as the canonical R4 author header. **That convention is RETIRED as of this rule's merge.** Any commit authored under `dynasia@trygrowthproject.com` from this point forward is a R74 violation.

The prior history is grandfathered — do not rewrite it. Only new commits must use Bradley's identity.

---

## R74's relationship to other rules

- **R52 + R64:** R74 is a durability rule too. The git author trailer is the only durable record of who owned the work. Bradley owns it; the trail must say so.
- **R31 (stranded):** Builder ≠ Auditor ≠ Fixer ≠ Planner is a role-separation rule for *which subagent* writes the code. R74 is an *identity* rule for *whose name* lands on the commit. Both apply: a Builder subagent writes the code, and the commit is authored as Bradley Gleave.

---

— Codified per operator directive, 2026-06-13 21:33 PT
