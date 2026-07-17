# R3-CLEAN MERGE RUNBOOK — git-native squash + plain fast-forward to protected `main`

> **Doc kind:** Durable operational runbook / process convention (audit-exempt per R14 scope — no product code).
> **Author identity:** Bradley Gleave <bradley@bradleytgpcoaching.com> (R3 — author AND committer on every commit; no AI/agent/co-author tokens).
> **Status:** CANONICAL. This is the ONLY permitted mechanism to land an importer-wave PR on any production `main` (extension, backend, mobile).
> **Refines (does not edit):** `merge_procedure_change_2026_07_14` in `current-state.json`. Where that entry said "lease-safe fast-forward … (`--force-with-lease` pinned to the known base)", **this runbook supersedes the mechanism**: on `main` we use a **plain fast-forward push with NO `--force-with-lease` and NO force of any kind**. `--force-with-lease` is used **nowhere on `main`** (it remains permitted only for `wip/*` snapshot branches per R6/R161).
> **Does NOT change:** AGENT_RULES.md (untouched — R3/R14/R15/R102 unchanged and unrelaxed), the immutable build order, D2 (OPEN/PROTECTED), or the billing exclusion.
> **Empirical proof this path works:** backend **PR #508** landed commit `95e2c6378e0b1b734328a7fdf6b9a6e33465a663` on backend `main` with **author AND committer both `Bradley Gleave <bradley@bradleytgpcoaching.com>`** via a git-native squash-and-push — one commit *before* the R3-INC-2 defect. The R3-compliant path is not theoretical; it was the established norm and is reproduced verbatim below.

---

## 0. Why this exists (R3-INC-1 / R3-INC-2)

GitHub's **server-side squash merge** (the green UI button and `gh pr merge --squash`) **cannot** produce an R3-compliant commit. It forces:
- **committer = `GitHub <noreply@github.com>`** (so GitHub can GPG-sign it), and
- **author = the account identity/email** (here `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`) — the two fields cannot be set to `Bradley Gleave <bradley@bradleytgpcoaching.com>` separately.

This produced **R3-INC-1** (extension #5, `5eabeec`) and again **R3-INC-2** (backend D1 PR #509, `1718293`). Both are grandfathered and NOT rewritten (a rewrite would require a destructive force-push over shared `main` — forbidden by R4/R102 and reserved to the operator). The forward fix is to **never use the server-side path for `main` again** and land every future `main` commit through the git-native path here.

**References (behavior is documented, not a bug):**
- GitHub docs — About pull request merges: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges
- GitHub changelog 2022-09-15 (git commit author shown when squash merging): https://github.blog/changelog/2022-09-15-git-commit-author-shown-when-squash-merging-a-pull-request/

---

## 1. Hard rules (non-negotiable)

1. **FORBIDDEN for production `main` on any TGP repo:** the GitHub squash UI button, `gh pr merge` (any `--merge`/`--squash`/`--rebase`), the REST/GraphQL merge endpoints, and GitHub web "Edit file"/"Commit" flows. All of these re-author the commit and violate R3.
2. **REQUIRED:** the git-native squash + plain fast-forward path in §3, run **only after** fresh dual-lens **exact-head** CLEAN (R72) + required CI green (R14) + R124 both-ways SHA verification, under R138 standing autonomy (or explicit operator auth).
3. **`--force-with-lease` is used NOWHERE on `main`.** No `--force`, no `-f`, no `+refspec`, no admin bypass, no temporary unprotect. The only push to `main` is a **plain fast-forward** (`git push origin <sha>:main`), which git **rejects automatically** if `main` has advanced past the pinned base — that rejection is the drift guard, and the correct response is **STOP and re-audit at the new base**, never force.
4. **Preflight identity check (before push) and post-push identity check (after push) are both MANDATORY.** A landing without both recorded is a P1 finding.
5. **If branch protection rejects the push, STOP.** Do not unprotect, do not admin-bypass, do not retry with force. Record the rejection and escalate. (R102 override is an operator-gated `R102-override` issue, not an agent action.)
6. **Never land a drifting SHA.** The commit's parent is pinned to the exact audited base; if remote `main` ≠ that base, the push cannot fast-forward and must not be forced.

---

## 2. Preconditions (all must be true before §3)

- [ ] PR is at an **exact audited head** with **fresh Lens A CLEAN + Lens B CLEAN** on that head (R72), zero P0–P3.
- [ ] Required status checks green on that exact head: `ci`, `r100-quality-gate`, `test:deploy-readiness`, `codeql` (R102).
- [ ] **R124 both-ways:** `gh api` PR `head.sha` == local `git rev-parse <AUDITED_HEAD>`.
- [ ] The intended base equals the **current** remote `main` tip (no drift). If not, re-audit at the new base — do not proceed.
- [ ] Change is within lane scope; no billing/auth/PII/RLS/flag surprises; flags default-off.
- [ ] R138 standing autonomy applies (or explicit operator authorization for this landing).

---

## 3. The bounded, fail-safe command sequence

Pin the two SHAs as **full 40-char** values first. Every step aborts on mismatch. This sequence **cannot force-push and cannot land a drifting SHA** because (a) it never passes a force flag, and (b) the new commit's only parent is the pinned base, so a plain push is a fast-forward **iff** remote `main` still equals that base.

```bash
set -euo pipefail

# ---- 0. Pin exact SHAs (fill in from the audit; must be full 40-char) ----
REPO="BradleyGleavePortfolio/growth-project-backend"   # or -extension / -mobile
AUDITED_HEAD="<40-char audited PR head SHA>"            # dual-lens CLEAN head
BASE="<40-char base SHA>"                               # == current remote main tip
MSG="<squash commit subject/body>"                      # PR title + concise body

# ---- 1. Fetch and verify exact head + base (no mutation) ----
git fetch --no-tags origin "$AUDITED_HEAD" "$BASE" main
# R124 both-ways: GitHub's PR head must equal the audited head.
test "$(gh api "repos/$REPO/pulls/<PR#>" --jq .head.sha)" = "$AUDITED_HEAD"
# Drift guard: the pinned base MUST still be the live remote main tip.
test "$(git rev-parse origin/main)" = "$BASE"
# Sanity: audited head resolves and base is its ancestor (squash is well-defined).
git cat-file -e "${AUDITED_HEAD}^{commit}"
git merge-base --is-ancestor "$BASE" "$AUDITED_HEAD"

# ---- 2. Build the R3-identity squash commit locally (no branch move yet) ----
# Tree = exactly the audited head's tree; single parent = pinned base => true squash.
# BOTH author and committer are forced to the R3 identity via env (belt) + -c (braces).
NEW=$(
  GIT_AUTHOR_NAME='Bradley Gleave'  GIT_AUTHOR_EMAIL='bradley@bradleytgpcoaching.com' \
  GIT_COMMITTER_NAME='Bradley Gleave' GIT_COMMITTER_EMAIL='bradley@bradleytgpcoaching.com' \
  git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
      commit-tree "${AUDITED_HEAD}^{tree}" -p "$BASE" -m "$MSG"
)
# If branch protection requires signed commits (R102), add -S with Bradley's key ABOVE
# and confirm the key maps to bradley@bradleytgpcoaching.com. (Empirically #508/95e2c63
# landed unsigned, so signing may not currently be enforced on these mains — verify, do
# not assume; if the push is later rejected for an unsigned commit, STOP per §1.5.)

# ---- 3. PREFLIGHT IDENTITY CHECK (MANDATORY — before any push) ----
git show -s --format='author=%an <%ae>%ncommitter=%cn <%ce>' "$NEW"
test "$(git show -s --format='%an <%ae>' "$NEW")" = 'Bradley Gleave <bradley@bradleytgpcoaching.com>'
test "$(git show -s --format='%cn <%ce>' "$NEW")" = 'Bradley Gleave <bradley@bradleytgpcoaching.com>'
# Tree must be byte-identical to the audited head's tree (no accidental content change).
test "$(git rev-parse "${NEW}^{tree}")" = "$(git rev-parse "${AUDITED_HEAD}^{tree}")"
# Parent must be exactly the pinned base (single parent => linear/fast-forwardable).
test "$(git rev-parse "${NEW}^")" = "$BASE"

# ---- 4. PLAIN fast-forward push to protected main (NO force, NO lease, NO bypass) ----
# git rejects this automatically if origin/main != BASE (drift) — that rejection is
# the safety. On rejection: STOP, re-audit at the new base. NEVER add --force/-f/--force-with-lease.
git push origin "${NEW}:main"

# ---- 5. POST-PUSH VERIFICATION (MANDATORY) ----
git fetch --no-tags origin main
test "$(git rev-parse origin/main)" = "$NEW"                       # remote tip is our commit
test "$(gh api "repos/$REPO/commits/$NEW" --jq '.commit.author.email')"    = 'bradley@bradleytgpcoaching.com'
test "$(gh api "repos/$REPO/commits/$NEW" --jq '.commit.committer.email')" = 'bradley@bradleytgpcoaching.com'
gh api "repos/$REPO/commits/$NEW/check-runs" --jq '.check_runs[] | "\(.name) \(.conclusion)"'  # confirm green
# Close the PR referencing the landed commit $NEW (comment with the SHA); do NOT click merge.
```

**What makes this safe by construction:**
- No command in the sequence contains `--force`, `-f`, `--force-with-lease`, or a leading-`+` refspec. A stray force is therefore impossible without editing the runbook.
- The commit's single parent is the pinned `BASE`. If `main` drifted, `git push origin $NEW:main` is a non-fast-forward and git rejects it — you physically cannot overwrite someone else's commit.
- Author and committer are set on **both** the env vars and `-c` config, and are re-asserted in §3.3 before the push and again against GitHub in §3.5 after — so a non-Bradley identity cannot slip through the way it did in R3-INC-1/2.

---

## 4. Failure / STOP conditions

| Symptom | Meaning | Action |
|---|---|---|
| `origin/main != BASE` at step 1 or push rejected as non-fast-forward | `main` drifted since audit | **STOP.** Re-fetch, re-audit at the new base, rebuild `$NEW`. Never force. |
| Preflight identity assert fails (§3.3) | Local git identity misconfigured | **STOP.** Fix env/`-c` flags; rebuild the commit. Do not push. |
| Push rejected by branch protection (signed-commit / status / reviewer rule) | R102 protection working as intended | **STOP.** Record the exact rejection; escalate. No unprotect, no admin bypass. |
| Post-push identity check (§3.5) shows non-Bradley author/committer | The wrong path was used (server-side) | **STOP.** This is a new R3 incident — record it honestly; do NOT rewrite/force-push shared `main`. |

---

## 5. Status of R3-INC-2 after this runbook

> **STATUS UPDATE (2026-07-17, Op 60).** The two workflow-status bullets below (written at Op 58, "D2 OPEN/PROTECTED … IMPORTER-F BLOCKED on D2") are **SUPERSEDED and retained only for provenance**. Current truth: **D2 is DECIDED** (Op 59, `c634003`; hardened Option 1) and **IMPORTER-F is LANDED** — backend PR #510 landed **R3-CLEAN** as backend `main` `1e6b3bf434cb58fbe65cea92a480755f0e414fb6` **using exactly the git-native path in §3** (author == committer == `Bradley Gleave`, tree byte-identical to the audited head, PLAIN fast-forward, no force/lease/bypass; PR closed with a landed-SHA comment, `merged=false`). This is the first R3-CLEAN backend-`main` product landing and empirically confirms §3 works for product PRs, not just PR #508. **The merge doctrine and mechanics in §1–§4 are UNCHANGED and remain mandatory.** Operational note: backend `main` is not in fact branch-protected (`branches/main/protection` → 404); the drift guard held via git's own non-fast-forward rejection — operator to reconcile intent (enable protection or update the "protected `main`" wording).

- **Remediation path: PROVEN FORWARD, and now EXERCISED for product code.** The git-native path above is empirically validated by backend **PR #508 / `95e2c63`** and again by **IMPORTER-F PR #510 / `1e6b3bf`** (full R3 author+committer via git-native squash-and-push) and is the sole mandated mechanism for `main`.
- **Incident: CONTAINED.** The forward gap that caused R3-INC-2 (server-side squash reachable for `main`) is closed by §1.1's prohibition + this runbook.
- **Historical commit `1718293`: GRANDFATHERED, NOT rewritten, NOT claimed R3-clean.** It retains its GitHub-synthesized identity on backend `main`; the canonical copy of the work with R3 identity survives on `refs/pull/509/head` (`81f0b70`). No destructive force-push is performed.
- **Reversible importer work has REOPENED and progressed under this path.** ~~**D2 remains OPEN/PROTECTED** (operator decision, not decided here) and **IMPORTER-F remains BLOCKED on D2**.~~ *(Op-58 wording, superseded — see the STATUS UPDATE above: D2 DECIDED at Op 59, IMPORTER-F LANDED at Op 60.)* Backend/mobile product code is untouched by this runbook itself.
