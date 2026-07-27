# R3 pre-push identity assertion — preventive gate (Op 75)

> **Doc kind:** Durable operational gate / process convention. No product code; audit-exempt per
> R14 scope.
> **Author identity:** Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3 — author AND committer
> on every commit; no AI/agent/co-author tokens).
> **Status:** CANONICAL for the identity half of any `main` landing.
> **Refines (does not edit, does not relax):**
> [`handoffs/importer-wave/R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md).
> The runbook's §1–§4 doctrine and mechanics remain **mandatory and unchanged**. This document adds
> the missing **enforcement and evidence** layer around §1.4 / §3.3 / §3.5.
> **Origin:** Lens B **P1-1** of the Op-75 `P0-AUDIT` rung
> ([`P0-AUDIT-B-5076a07a.md`](../audit-reports/P0-AUDIT-B-5076a07a.md)).

---

## §1 — Why the runbook alone was not enough

R3-INC-4 (backend `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`) landed with

```
author    = BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>
committer = BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>
```

**while fully complying with the runbook's merge doctrine.** The evidence:

| Observation | Implication |
|---|---|
| Single parent `07ff974079eb1da02f1de4f5ecd18c1f223afeae`, equal to PR #520 `baseRefOid` | a true local squash — no GitHub-synthesized merge |
| PR #520 `merged=false`, GraphQL `mergeCommit=null`; REST `merge_commit_sha` `57b6d791…` is a test-merge that `compare/main...` reports as **diverged** | nothing GitHub produced is reachable from `main` |
| Committer is the operator's **own** GitHub noreply address, **not** `GitHub <noreply@github.com>` | the **forbidden server-side path was not used** |

So the mechanism was right and the identity was wrong. This makes R3-INC-4 a **different incident
class** from R3-INC-1 (extension #5 `5eabeec`), R3-INC-2 (backend #509 `1718293`) and R3-INC-3, all
of which were server-side merges whose committer GitHub synthesizes and which the operator cannot
set. **The R3-INC-1/2/3 remedy — ban the merge button — was already in force here and was obeyed.
It therefore cannot prevent a recurrence of R3-INC-4.**

[`R3_MERGE_RUNBOOK.md` §1.4](../importer-wave/R3_MERGE_RUNBOOK.md) already calls both identity
checks **MANDATORY**, and §3.3 already contains the exact asserts that would have caught this:

```bash
test "$(git show -s --format='%an <%ae>' "$NEW")" = 'Bradley Gleave <bradley@bradleytgpcoaching.com>'
test "$(git show -s --format='%cn <%ce>' "$NEW")" = 'Bradley Gleave <bradley@bradleytgpcoaching.com>'
```

`5076a07a` is proof they were not run. The runbook is **insufficient as written** — not incorrect,
insufficient — for four reasons:

1. **The assert is inside a copy-paste block.** Skipping it is silent and leaves no trace. A gate
   you can omit by editing your own clipboard is a suggestion.
2. **It produces no artifact.** §1.4's *"a landing without both recorded is a P1 finding"* is
   unenforceable after the fact: absence of a record is indistinguishable from absence of a check.
3. **It depends on ambient identity.** The §3.2 `-c` / `GIT_AUTHOR_*` / `GIT_COMMITTER_*`
   belt-and-braces only binds if that exact invocation is used. Nothing detects a bare
   `git commit`, a shell that dropped the env, or a repo-local `user.email` override.
4. **There is no server-side backstop.** Backend branch protection is absent
   (`branches/main/protection` → 404, blocker **B3**), so nothing outside the operator's own
   terminal can reject a non-R3 identity.

**No backend history is rewritten by this document.** `5076a07a` keeps its identity on `main`; R5
and the R3-INC-1 precedent forbid the alternative. This is a forward gate only.

---

## §2 — The gate

Three properties the runbook's inline assert lacks: it runs as **one command**, it **exits non-zero**
rather than being skippable prose, and it **emits a record**.

```bash
#!/usr/bin/env bash
# r3-identity-gate.sh — run IMMEDIATELY before `git push origin <sha>:main`, and again after.
# Exits non-zero on any violation. Prints the evidence block that MUST be pasted into the
# landing record. Never rewrites history; never pushes; never forces.
set -euo pipefail

R3_IDENT='Bradley Gleave <bradley@bradleytgpcoaching.com>'
SHA="${1:?usage: r3-identity-gate.sh <full-40-char-sha> [repo-full-name]}"
REPO="${2:-}"

# --- 1. Envelope identity: author AND committer, both exact ---
A="$(git show -s --format='%an <%ae>' "$SHA")"
C="$(git show -s --format='%cn <%ce>' "$SHA")"
[ "$A" = "$R3_IDENT" ] || { echo "R3 FAIL author:    $A"    >&2; exit 1; }
[ "$C" = "$R3_IDENT" ] || { echo "R3 FAIL committer: $C"    >&2; exit 1; }

# --- 2. Message hygiene: zero AI / agent / co-author tokens ---
if git show -s --format='%B' "$SHA" \
   | grep -Eiq 'co-authored-by|claude|anthropic|\bAI\b|\bagent\b|generated with|assistant'; then
  echo "R3 FAIL: forbidden token in commit message" >&2; exit 1
fi

# --- 3. Trailer hygiene: no signature trailers smuggling a second identity ---
if git show -s --format='%B' "$SHA" | grep -Eiq '^Signed-off-by:.*(noreply|users\.noreply)'; then
  echo "R3 FAIL: noreply identity in a trailer" >&2; exit 1
fi

# --- 4. Ambient config, recorded so a mismatch is visible even when the commit passes ---
CFG="$(git config user.name || true) <$(git config user.email || true)>"

# --- 5. Post-push only: GitHub's view must agree (run again AFTER the push) ---
if [ -n "$REPO" ]; then
  GA="$(gh api "repos/$REPO/commits/$SHA" --jq '.commit.author.email')"
  GC="$(gh api "repos/$REPO/commits/$SHA" --jq '.commit.committer.email')"
  [ "$GA" = 'bradley@bradleytgpcoaching.com' ] || { echo "R3 FAIL gh author:    $GA" >&2; exit 1; }
  [ "$GC" = 'bradley@bradleytgpcoaching.com' ] || { echo "R3 FAIL gh committer: $GC" >&2; exit 1; }
fi

# --- 6. Evidence block (paste into the landing record; absence of this = P1 per §1.4) ---
cat <<EOF
R3-IDENTITY-GATE: PASS
  sha            = $SHA
  author         = $A
  committer      = $C
  ambient config = $CFG
  message tokens = 0 forbidden
  github verified= ${REPO:-not-checked}
  checked_at_utc = $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
```

### Where it sits in the runbook sequence

| Runbook step | Gate |
|---|---|
| [§3.2](../importer-wave/R3_MERGE_RUNBOOK.md) build `$NEW` via `commit-tree` | unchanged |
| **§3.3 preflight** | **replace the inline `test` lines with `r3-identity-gate.sh "$NEW"`.** Non-zero ⇒ do not push. |
| §3.4 `git push origin "${NEW}:main"` | unchanged — **plain**, no force, no lease, no bypass |
| **§3.5 post-push** | **run `r3-identity-gate.sh "$NEW" "$REPO"` again**, with the repo argument, so GitHub's own view is asserted |
| §3.5 close the PR with a landed-SHA comment | unchanged; **paste both evidence blocks into the comment** |

---

## §3 — Runbook clarification: mechanism compliance ≠ identity compliance

The doctrinal sentence to carry forward, and the whole lesson of R3-INC-4:

> **Using the mandated git-native path proves only that the *mechanism* was compliant. It proves
> nothing about *identity*.** The two are independent failure modes with independent causes and
> independent remedies. A landing is R3-clean only when **both** are separately asserted **and
> separately recorded**.

Consequences:

1. **Do not group R3 incidents by outcome.** "Wrong committer on `main`" describes both R3-INC-1/2/3
   and R3-INC-4, and the same remedy fixes only the first three. Classify by **cause**:
   *forbidden-mechanism* vs *unasserted-identity*.
2. **A future incident must be typed before it is remedied.** Record the mechanism evidence — parent
   count, whether the parent equals the then-`main` tip, PR `merged`, `mergeCommit`, and whether the
   committer is `GitHub <noreply@github.com>` or an operator address — *before* proposing a fix.
3. **§1.4's "recorded" means an artifact.** Both evidence blocks from §2 go into the landing record
   (the PR close comment and the Op's `DECISION_LOG.md` entry). A landing whose record lacks them is
   a **P1 finding**, exactly as §1.4 already says — this document just makes the requirement
   checkable.
4. **This is a local gate and cannot bind a push that skips it.** It narrows the window; it does not
   close it. Closing it requires **B3** — branch protection with a push-identity rule. Until then R3
   compliance rests on operator discipline **plus** this gate, and that limitation is recorded
   honestly rather than papered over.

---

## §4 — Scope and non-goals

**In scope:** the identity and message-hygiene half of any landing on any TGP production `main`
(backend, mobile, extension, context).

**Explicitly not in scope / not done:**

- **No history rewrite.** `5076a07a` is not amended, rebased or force-pushed. Neither is any other
  historical commit. R3-INC-1 precedent, R5.
- **No relaxation.** Nothing in [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md) §1–§4
  is weakened; `gh pr merge` and every server-side merge path remain **FORBIDDEN** for production
  `main`.
- **No new rule number.** This document invents no rule. It enforces existing **R3** and existing
  runbook §1.4. The canonical enumeration is `R1–R126` and `R130–R138`; `R127`–`R129` **do not
  exist** (blocker **B6**, permanent, never renumbered) and are cited nowhere here.
  *(Note: `R161`, cited at [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md) line 6, is
  outside the enumeration and must be read as **R6** alone.)*
- **No CI/workflow change, no hook installed, no production code.** 0 production LOC. Wiring this
  as a `pre-push` hook or a required check is a **separate, R138-gated** decision, and would touch
  CI — which [Op-74 §5](../op74/OWNERSHIP_AND_PR_LADDER.md) stop condition 2 requires a fresh gate
  for.

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Process gate only; 0 production
LOC. No history rewritten.*
