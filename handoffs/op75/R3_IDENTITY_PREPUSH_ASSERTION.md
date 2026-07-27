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

Three properties the runbook's inline assert lacks: it runs as **one command**, it returns a
**machine-observable verdict via a distinct exit code** rather than being skippable prose, and it
**emits a record**.

**The three exit codes are the interface.** The landing procedure keys off the exit code, never off
"non-zero":

| Exit | Verdict | Landing procedure |
|---|---|---|
| **0** | `PASS` | push permitted |
| **1** | `HARD FAIL` | **STOP. Never push. No override exists for any exit-1 condition.** |
| **3** | `OVERRIDE_REQUIRED` | push permitted **only** with the §2.1 override record already appended to the PR body; otherwise **stop** |

> **Why three states and not two (R5/R132 — supersedes the round-2 wording of this section, which is
> preserved in the git history of this file).** The round-2 gate collapsed *"a real co-author trailer"*
> and *"prose that quotes the word `agent`"* into one non-zero exit, then handled the difference in
> prose. That made the gate self-contradictory: its own preamble said non-zero ⇒ never push, while its
> inline note told the operator to push anyway after recording an override. Two commits on this very
> branch (`2e5cd2dd`, `7331a0cf`) hit that state, so the contradiction was load-bearing, not
> hypothetical. Splitting the scan into **2a shape-matched attribution** (unoverridable) and **2b
> vocabulary** (overridable only with an empty forbidden-trailer proof) makes the distinction
> executable. **Nothing is weakened:** 2b is the round-2 pattern character-for-character, and 2a is
> strictly *additional* hard failure that the round-2 gate did not have.

> **CANONICAL SOURCE: [`r3-identity-gate.sh`](r3-identity-gate.sh)** (`handoffs/op75/`, mode `100755`).
> The block below is a **NON-CANONICAL MIRROR** for reading. If the two ever differ, **the script
> wins** — it is the artifact that actually executes. They are asserted byte-identical by §9 of
> [`PRE_BUILD_REVIEW_OP75.md`](PRE_BUILD_REVIEW_OP75.md):
> ```
> diff <(awk '/^#!\/usr\/bin\/env bash$/{f=1} f&&/^```$/{exit} f' \
>   R3_IDENTITY_PREPUSH_ASSERTION.md) r3-identity-gate.sh
> ```
> (verified empty at this SHA)

```bash
#!/usr/bin/env bash
# r3-identity-gate.sh — run IMMEDIATELY before `git push origin <sha>:main`, and again after.
# Never rewrites history; never pushes; never forces.
#
# EXIT CODES (machine-observable; the landing procedure keys off these, not off "non-zero"):
#   0 = R3-IDENTITY-GATE: PASS                 -> push permitted
#   1 = R3-IDENTITY-GATE: HARD FAIL            -> STOP. Never push. No override exists.
#   3 = R3-IDENTITY-GATE: OVERRIDE_REQUIRED    -> push permitted ONLY with an append-only
#                                                 PR-body override record (see §2.1).
set -uo pipefail

R3_IDENT='Bradley Gleave <bradley@bradleytgpcoaching.com>'
SHA="${1:?usage: r3-identity-gate.sh <full-40-char-sha> [repo-full-name]}"
REPO="${2:-}"
MSG="$(git show -s --format='%B' "$SHA")"

# --- 1. Envelope identity: author AND committer, both exact. No override, ever. ---
A="$(git show -s --format='%an <%ae>' "$SHA")"
C="$(git show -s --format='%cn <%ce>' "$SHA")"
[ "$A" = "$R3_IDENT" ] || { echo "R3-IDENTITY-GATE: HARD FAIL author:    $A"    >&2; exit 1; }
[ "$C" = "$R3_IDENT" ] || { echo "R3-IDENTITY-GATE: HARD FAIL committer: $C"    >&2; exit 1; }

# --- 2a. HARD attribution scan: trailer-shaped or footer-shaped credit. No override, ever. ---
# These patterns match ATTRIBUTION POSITIONS, not vocabulary: a trailer key at line start, or a
# recognised footer opener. Any hit is a real co-author/attribution claim.
HARD_RE='^[[:space:]]*(co-authored-by|signed-off-by|assisted-by|generated-by|authored-by|reviewed-by|helped-by|on-behalf-of)[[:space:]]*:|^[[:space:]]*(.{0,4}[[:space:]]*)?generated with[[:space:]]|^[[:space:]]*(.{0,4}[[:space:]]*)?(created|written|produced) (with|by) (claude|anthropic|an? (AI|assistant|agent))'
if HARD_HITS="$(printf '%s\n' "$MSG" | grep -Ein "$HARD_RE")"; then
  echo "R3-IDENTITY-GATE: HARD FAIL - attribution in an attribution position:" >&2
  printf '%s\n' "$HARD_HITS" >&2
  exit 1
fi

# --- 2b. BROAD token scan, deliberately UNCHANGED and UNWEAKENED from the original gate. ---
# A hit here means the vocabulary appears SOMEWHERE. It may be a real attribution 2a could not
# shape-match, or it may be prose that merely discusses the tokens. 2b never silently passes.
BROAD_RE='co-authored-by|claude|anthropic|\bAI\b|\bagent\b|generated with|assistant'
SOFT_HITS="$(printf '%s\n' "$MSG" | grep -Ein "$BROAD_RE" || true)"

# --- 3. Trailer hygiene: the forbidden-trailer set must be empty. ---
# Structural proof, independent of prose. `%(trailers)` parses only true trailer blocks.
ALL_TRAILERS="$(git show -s --format='%(trailers)' "$SHA")"
FORBIDDEN_TRAILERS="$(printf '%s\n' "$ALL_TRAILERS" \
  | grep -Ei '^[[:space:]]*(co-authored-by|assisted-by|generated-by|helped-by|on-behalf-of)[[:space:]]*:|^[[:space:]]*signed-off-by:.*(noreply|users\.noreply)' || true)"
if [ -n "$FORBIDDEN_TRAILERS" ]; then
  echo "R3-IDENTITY-GATE: HARD FAIL - forbidden trailer present:" >&2
  printf '%s\n' "$FORBIDDEN_TRAILERS" >&2
  exit 1
fi

# --- 4. Ambient config, recorded so a mismatch is visible even when the commit passes ---
CFG="$(git config user.name || true) <$(git config user.email || true)>"

# --- 5. Post-push only: GitHub's view must agree (run again AFTER the push) ---
if [ -n "$REPO" ]; then
  GA="$(gh api "repos/$REPO/commits/$SHA" --jq '.commit.author.email')"
  GC="$(gh api "repos/$REPO/commits/$SHA" --jq '.commit.committer.email')"
  [ "$GA" = 'bradley@bradleytgpcoaching.com' ] || { echo "R3-IDENTITY-GATE: HARD FAIL gh author:    $GA" >&2; exit 1; }
  [ "$GC" = 'bradley@bradleytgpcoaching.com' ] || { echo "R3-IDENTITY-GATE: HARD FAIL gh committer: $GC" >&2; exit 1; }
fi

# --- 6. Verdict + evidence block (paste into the landing record; absence of this = P1 per §1.4) ---
if [ -n "$SOFT_HITS" ]; then
  cat <<EOF
R3-IDENTITY-GATE: OVERRIDE_REQUIRED
  sha             = $SHA
  author          = $A
  committer       = $C
  ambient config  = $CFG
  hard attribution= 0 (check 2a clean)
  forbidden trailers = 0 (empty; structural proof via %(trailers))
  broad token hits:
$(printf '%s\n' "$SOFT_HITS" | sed 's/^/    /')
  github verified = ${REPO:-not-checked}
  checked_at_utc  = $(date -u +%Y-%m-%dT%H:%M:%SZ)
  DISPOSITION REQUIRED: push ONLY with an append-only PR-body override record naming this exact
  SHA, the matched lines above verbatim, the empty-forbidden-trailer proof, the reviewer
  disposition, and the reason. Rewording the commit to dodge the scan is NOT permitted.
EOF
  exit 3
fi

cat <<EOF
R3-IDENTITY-GATE: PASS
  sha             = $SHA
  author          = $A
  committer       = $C
  ambient config  = $CFG
  message tokens  = 0 forbidden (checks 2a and 2b both clean)
  forbidden trailers = 0 (empty)
  github verified = ${REPO:-not-checked}
  checked_at_utc  = $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
exit 0
```

## §2.1 — The only accepted disposition for exit 3

Exit 3 is **not** a pass. It is a hold that exactly one artifact can clear: an **append-only override
record in the PR body**. The landing procedure accepts exit 3 **if and only if** that record is
present *before* the push and contains **all five** fields below. A record missing any field, or
naming a different SHA, does not clear the hold — **stop**.

| # | Required field | Why it cannot be dropped |
|---|---|---|
| 1 | **Exact 40-char commit SHA** | an override is scoped to one commit object; it never covers "this branch" or a later amend |
| 2 | **Every matched line, verbatim, with its line number**, copied from the gate's `broad token hits:` block | the reviewer must judge the actual text, not a paraphrase of it |
| 3 | **Empty-forbidden-trailer proof** — the literal `git show -s --format='%(trailers)' <sha>` invocation and its empty output | structural evidence that no second identity is attached, independent of prose |
| 4 | **Reviewer disposition** — an explicit statement that each matched line is prose *discussing* the tokens, not an attribution claim | the human judgement the gate cannot make |
| 5 | **Reason** — why the commit needs that wording | forces the alternative ("just reword it") to be considered and rejected on the record |

**Append-only.** An override record is never edited or removed once written, and a new commit that
hits exit 3 gets its **own** record. Silently reusing a prior commit's record, or rewording a commit
to dodge check 2b, is **not acceptable** — both destroy the evidence the gate exists to produce.

**Not a loophole.** Exit 3 is reachable only when check **1** (envelope identity), check **2a**
(attribution-shaped text) and check **3** (forbidden trailers) have *all* passed. Every condition
that actually indicates a second identity is exit **1**, for which **no override exists**.

## §2.2 — Live override records (append-only)

Two commits on this branch reach exit **3**. Both are recorded here in full, in the §2.1 schema, and
mirrored in the PR #28 body. Recorded in this file because both are **ancestors** of the commit that
carries it — a commit cannot contain its own SHA, so a commit that itself reaches exit 3 must be
recorded in the mutable PR body, and can only be added here by a **later** commit.

Verified for **both** records, and for every other commit on this branch:

```
author    = Bradley Gleave <bradley@bradleytgpcoaching.com>
committer = Bradley Gleave <bradley@bradleytgpcoaching.com>
```

### Override record 1

| Field | Value |
|---|---|
| **1. SHA** | `2e5cd2dddb9d0e8cf656a27e25c96f37f93008d2` |
| **2. Matched line, verbatim** | `37:6. Record fixes: PR #520 real title; `` `agent` `` added to the identity-gate token` |
| **3. Trailer proof** | `git show -s --format='%(trailers)' 2e5cd2dd` → **empty output** |
| **4. Reviewer disposition** | Prose. The line is a changelog entry stating that the string `agent` was **added to this gate's own token pattern**. It claims no authorship and names no second identity. Check 2a: clean. Check 3: clean. |
| **5. Reason** | The commit's purpose was to tighten check 2b by adding `\bagent\b`. A message describing that change cannot avoid naming the token it added. Rewording to dodge the scan would hide what the commit did. |

### Override record 2

| Field | Value |
|---|---|
| **1. SHA** | `7331a0cff14131c49c095c387c269b7a1569e63c` |
| **2. Matched line, verbatim** | `10:free-form "Generated with ..." footer the rule exists to catch. Instead the` |
| **3. Trailer proof** | `git show -s --format='%(trailers)' 7331a0cf` → **empty output** |
| **4. Reviewer disposition** | Prose. The line quotes the footer shape the gate is designed to **catch**, inside an explanation of why the pattern is not narrowed. It claims no authorship and names no second identity. Check 2a: clean. Check 3: clean. |
| **5. Reason** | The commit documents the false-positive class itself, which requires quoting the pattern's own vocabulary. It is the self-referential worst case, and it is precisely why exit 3 had to become machine-observable rather than prose. |

> **Why this section exists at all (R5/R132).** `7331a0cf` documented the false-positive class while
> being an unrecorded instance of it, and its own round-2 PR body recorded an override for
> `2e5cd2dd` only. That gap was found in external review. It is closed here rather than by loosening
> the pattern or by rewriting either commit message — both are forbidden.

### Where it sits in the runbook sequence

| Runbook step | Gate |
|---|---|
| [§3.2](../importer-wave/R3_MERGE_RUNBOOK.md) build `$NEW` via `commit-tree` | unchanged |
| **§3.3 preflight** | **replace the inline `test` lines with `r3-identity-gate.sh "$NEW"`.** Then branch on the exit code: **0** ⇒ proceed · **1** ⇒ **STOP, never push, no override exists** · **3** ⇒ proceed **only after** the §2.1 override record for this exact SHA is appended to the PR body; if it is absent, **stop**. |
| §3.4 `git push origin "${NEW}:main"` | unchanged — **plain**, no force, no lease, no bypass |
| **§3.5 post-push** | **run `r3-identity-gate.sh "$NEW" "$REPO"` again**, with the repo argument, so GitHub's own view is asserted. The exit code must be the **same** as at preflight; a change means GitHub rewrote the identity ⇒ treat as an incident. |
| §3.5 close the PR with a landed-SHA comment | unchanged; **paste both evidence blocks into the comment** — and, on exit 3, the override record too |

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
   (the PR close comment and the Op's `DECISION_LOG.md` entry), plus the §2.1 override record for any
   commit that exited **3**. A landing whose record lacks them is a **P1 finding**, exactly as §1.4
   already says — this document just makes the requirement checkable.
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
  for. [`r3-identity-gate.sh`](r3-identity-gate.sh) is committed as an **operator-invoked** script
  under `handoffs/op75/` (mode `100755`, outside `src/`, not referenced by any workflow, not
  installed into `.git/hooks/`). It ships as a file rather than a fenced block only so that the gate
  is genuinely executable and testable — which is what let its three exit codes be verified against
  all four commits on this branch instead of asserted.
- **No override for anything that indicates a second identity.** Exit **3** exists only for
  vocabulary in prose, and only when checks 1, 2a and 3 all pass. Every real attribution signal is
  exit **1**, which has no override path (§2.1).

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Process gate only; 0 production
LOC. No history rewritten.*
