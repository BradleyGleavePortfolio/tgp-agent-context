# Op 76 — Pre-build / reconciliation review: make the state surfaces truthful after PR #28 landed

- **Op:** 76 · **Date:** 2026-07-29 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>
- **Doc kind:** Durable governance / state-reconciliation review. Pure context-repo documentation,
  **audit-exempt per R14 scope**; governed by the R138 four-question gate plus a `DECISION_LOG.md`
  entry, which are both recorded below and in the PR body.
- **Status:** **RECORDS a completed landing.** Authorises **no build, no dispatch, no flag flip, no
  landing of any other branch, and no completion claim.** **0 production LOC.**

## BUILD MATRIX
- backend HEAD: `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`
- ctxrepo HEAD: `837a7f9991123c8b22ddfe57fce2c2777663744d`
- PR #28 head (LANDED): `837a7f9991123c8b22ddfe57fce2c2777663744d`
- PR #28 base (origin/main at the time): `b76d0962de53ce494fa8f869a706ff0c15aee0b6`
- timestamp (ISO 8601 UTC): `2026-07-29T05:05:00Z`

Machine-readable pin, with the both-ways evidence for every SHA above:
[`BASELINE_HEADS_OP76.json`](BASELINE_HEADS_OP76.json).

---

## §1 — Why this document exists

Op 75 deliberately left one thing unrecordable. Its own state file says so, in
`truth_boundaries.op75_post_landing_sha_not_claimed`: *"The landed Op-75 SHA must be pinned by a
SUBSEQUENT reconcile and must never be asserted in advance."* Its ladder document says the same
about the blocker: B2 *"closes on landing of PR #28, not before"*.

PR #28 has now landed. **Op 76 is that subsequent reconcile, and nothing more.** Every surface that
Op 75 correctly refused to update in advance is updated here, from evidence, now that the evidence
exists.

The failure this Op is written against is the inverse of the usual one. The usual failure is
claiming a status too early. The failure available *here* is leaving a true status unclaimed: the
state surfaces still say B2 is open and `I1` is blocked, which stopped being true at
`2026-07-29T03:08:46Z`. A stale surface is not a safe surface — it is a surface that will be read
and acted on. Both directions are the same defect, and
[`R-DUNNING-BAR-1`](../../roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2 grades both: **status is
derived, never asserted.** Op 76 derives.

---

## §2 — What Op 76 does

| # | Change | Surface |
|---|---|---|
| 1 | Adds the missing Op-76 landing record, with the exact landed SHA, envelope, and the sole PR-#28 comment as evidence | `DECISION_LOG.md` |
| 2 | Advances the pinned context head `b76d0962` → `837a7f99`, prior tip preserved | `current-state.json` |
| 3 | Closes **B2** and unblocks rung **`I1`**, each against a pre-committed written condition | `current-state.json`, this document |
| 4 | Replaces the empty PR ledger with the twelve genuinely open PRs | `current-state.json` |
| 5 | Advances the Op labels, verdict and timestamps to Op 76, prior wording preserved byte-identically | `current-state.json` |
| 6 | Preserves the accurate facts from conflicting PR #26 and names the three claims of its that did **not** survive | `current-state.json`, `A03-reengagement-dunning.md`, `OPERATOR_HANDOFF.md` |
| 7 | Records a dated live zombie sweep and marks the June snapshots as historical | `ZOMBIE_AGENT_PROTOCOL.md` |
| 8 | Records a dated operator sweep and marks the Wave-4 lane board as a frozen snapshot | `OPERATOR_STATE.md` |
| 9 | Brings the Op-76 artifacts inside the citation verifier's scope | `verify-citations.sh` |

**What Op 76 explicitly does NOT do:** it does not remediate a single one of the twelve Op-75
findings; it does not claim R14 CLEAN for backend `5076a07a`; it does not close **B1**; it does not
dispatch `I1`; it does not touch backend, mobile or extension; it does not edit the frozen Op-74 and
Op-75 records; it does not flip a flag; and it does not merge itself.

---

## §2a — R138 Decision Gate

The decision being gated: **reconcile the state surfaces in one narrow PR now, and close conflicting
PR #26 as obsolete once that PR exists.**

| # | Question | Answer |
|---|---|---|
| 1 | **"How can I improve my choices with Elon Musk's 5 key first principles?"** | **Question the requirement (R131).** The requirement "update the state surfaces" comes from `live_state_update_rule` in `current-state.json`, which is the operator's own rule and is still true — verified, not assumed. **Delete before optimising (R132).** The strongest candidate for deletion was this whole Op: could the surfaces simply be left to be corrected by whichever Op comes next? No — the surfaces do not merely lag, they actively assert `open_prs` is empty and `I1` is blocked, and a reader acting on that would decline to dispatch a rung that is now permitted. A wrong assertion is not a deletable step. The second candidate was deleting duplicated gate scripts by copying them into `handoffs/op76/`; deleted instead — the Op-75 scripts are reused in place, and the one line of new scope is added to the existing verifier rather than to a fork of it. **Simplify (R133).** Scope held to reconciliation; no doctrine authored, no rule renumbered, no new R-rule. |
| 2 | **"What would hyperscalers do?"** | Treat the state file as a **control plane reconciling toward observed reality**, the Kubernetes controller pattern: read live state from the authoritative API, diff it against the recorded spec, and converge — never write a desired value the API has not confirmed. That is exactly the both-ways verification in `BASELINE_HEADS_OP76.json`: every SHA came from the GitHub API **and** from `git ls-remote`, and no value is written that failed both. The AWS practice of a **change record per production change** is the second reference, and is why the landing gets a `DECISION_LOG` entry at all rather than only a JSON key. |
| 3 | **"How can I get the GOOD without the BAD?"** | **GOOD:** the surfaces stop lying; the landed SHA is finally pinned; a reader can discover the R14/R138 evidence for the money path from `main`; the conflicting PR stops competing for authority. **BAD to avoid:** importing PR #26's two wrong inferences along with its right facts, and letting "reconcile" quietly become "declare progress". **The structure that separates them:** each preserved fact is re-derived from live evidence at Op-76 time rather than copied from #26, and the three #26 claims that failed re-derivation are recorded by name as superseded instead of dropped silently. The blast radius is bounded by construction — docs only, forward-revertible in one commit, and B1 plus all twelve findings stay open. |
| 4 | **"Am I attacking the root cause?"** | Partly, and the part that is not is named rather than hidden. The **proximate** cause is that Op 75 could not record its own landed SHA — a structural constraint, not a mistake, and Op 76 is its designed remedy. The **root** cause is that closing that loop depends on a human or agent remembering to run the next reconcile; nothing enforces it. The honest root-cause fix is a check that fails when the pinned context head is not an ancestor of live `main`. That is **not** built here, because building it inside a reconciliation PR is exactly the scope creep R133 forbids; it is recorded as a follow-up in `next_actions_ordered` per R20/R125. Calling this Op a full root-cause fix would be the same asserted-status defect it exists to correct. |

### Decision, and its rollback / blast-radius note

**Decision.** Land one narrow reconciliation PR containing the changes in §2. After it is open,
comment on PR #26 with the superseding link and close #26 as obsolete. Do not touch PR #29 beyond
re-pinning its status in the ledger.

**Why closing #26 is permitted rather than an R5 violation.** R5 forbids *losing* things, not
*closing* them. Closing a GitHub PR deletes nothing: the branch
`docs/op74-newest-wins-dunning-pr520-2026-07-23`, the head `dffd7529`, the diff, and the body all
remain, and a closed PR reopens with one command. Beyond that, #26's surviving substance is
carried forward into this PR's own artifacts before #26 is closed, so the content lives on `main`
and not only on an abandoned branch — which is strictly *more* preservation than leaving it open.
Leaving it open is the worse option: it is `CONFLICTING` against a base two Ops stale and asserts a
newest-wins inference that Op 75 disproved, so a reader could take it as current. The authority to
make this call is R138's directional grant, exercised through this gate.

**Blast radius.** Documentation and state only, in one repository. No product code, no schema, no
flag, no credential, no CI, no branch protection.

**Rollback.** See [§6](#6--rollback).

---

## §3 — B2 closes, and why that is derivation rather than assertion

The condition was written down **before** the landing, in Op-75's own ladder document, as a table:
PR #28 *"landed on context `main`, R3-clean, plain fast-forward"* ⇒ B2 **CLOSED**, `I1` permitted.
Three conjuncts. Each is verified independently below, and each was verified from a source outside
this repository.

| Conjunct | Evidence | Result |
|---|---|---|
| landed on context `main` | `mergedAt` = `2026-07-29T03:08:46Z`; live `main` is `837a7f99` from both the GitHub API and `git ls-remote` | **holds** |
| R3-clean | server-side commit envelope shows author **and** committer `Bradley Gleave <bradley@bradleytgpcoaching.com>` | **holds** |
| plain fast-forward | `mergeCommit.oid` **equals** `headRefOid`, so no new commit object was minted; GitHub compare reports `ahead_by 14`, `behind_by 0` | **holds** |

All three hold, so **B2 is CLOSED** and **`I1` is PERMITTED**. Permitted is not dispatched: Op 76
opens the gate and dispatches nobody through it.

**What B2 closing does not mean.** It means the R14/R138 evidence for backend `5076a07a` is now
discoverable by anyone reading `main` — which is the entirety of what B2 asserted. It does **not**
mean the findings are fixed. Combined dual-lens counts are still **0 P0 / 3 P1 / 5 P2 / 4 P3**
against an R14 CLEAN bar of zero across P0–P3. **R14 CLEAN for `5076a07a` is not met and is not
claimed.**

**B1 is unchanged and stays open by design.** R3-INC-4 is an unasserted-local-identity incident on
the backend commit itself. Fixing it would require rewriting published shared history, which is
forbidden (R3-INC-1 precedent, R5). Landing PR #28 could not close it and did not.

---

## §4 — PR #26: what survives, and the three claims that do not

PR #26 is `CONFLICTING`, based on `9c25a06` — two Ops stale — and has been open since
`2026-07-23T01:34:10Z`. Its facts were re-derived at Op-76 time rather than copied.

**Survives, and is carried forward:**

- Backend `main` advanced `07ff974` → `5076a07` by a git-native tree-preserving plain non-force
  fast-forward; the parent `07ff974` is the PR #521 tip.
- `DunningLockoutGuard` is mounted globally as the final `APP_GUARD`, after `JwtAuthGuard`. The
  persisted `DunningState` lockout is therefore consumed on the request path.
- The 403 wire contract is `code` plus `message`; `lockout_copy` is computed but dropped by the
  shared error envelope, so it never reaches the client.
- Unit and e2e specs exist and CI was green at the audited head.
- `FEATURE_DUNNING_V2` remains **default-OFF** and the guard is a **hard no-op** while OFF. Not
  flipped. No dispatcher wiring, no messages sent, no credentials, no migrations, no mobile/API
  recovery mixing.
- **A3 P0-1 (guard-not-mounted) is FIXED / LANDED**, with the remaining gaps preserved:
  `lockout_copy` envelope, Day-10 sweep and dispatcher, recovery links, real-DB test, mobile dunning
  API, re-engagement UX, flip runbook. **A3 overall stays PARTIAL / default-OFF.**

**Does not survive. Recorded by name, not silently dropped:**

1. **"Dunning-v2 PR #520 landed."** It did not. Op 75 established that PR #520 **exists** but the
   landing **bypassed** it: the PR is `CLOSED` with `merged` false, GraphQL `mergeCommit` is null,
   the REST `merge_commit_sha` `57b6d791` is a GitHub-computed test-merge that compares as
   *diverged* and is unreachable from `main`, its head `dcb58126` never became an ancestor of
   `main`, and it carries **zero** reviews. The corollary claim that the landed tree is
   byte-identical to an *audited* head `dcb58126` fails with it — that head was never audited.
2. **"Advance `repos.context.main_head` to `9c25a06` per the one-lag convention."** There is no such
   convention to apply. Op 75 verified live context `main` was `b76d0962` both ways. Inferring a
   head from a lag rule instead of reading it is precisely the asserted-status defect of
   `R-DUNNING-BAR-1` §2. Op 76 advances the head to `837a7f99` **because the API and `ls-remote`
   both return it**, not because a convention predicts it.
3. **"`/ai/*` stays LOCKED and `/roman/*` is the sole AI-adjacent carve-out."** This was true as
   written intent and false as behaviour, and it is superseded by newer landed evidence rather than
   by #26 being careless. Op-75 Lens A finding **P1-1** shows the allow-list also matches on the
   **second** path segment, so any route whose second segment is one of the eight
   `ALLOWED_PREFIXES` tokens is reachable while locked out — two real scheduling OAuth routes are,
   unintentionally. "Sole carve-out" is therefore not a claim Op 76 will repeat. Routed to `DUN-1`,
   already open.

**Disposition.** #26 is recorded **SUPERSEDED by this PR**. Per the R138 gate above it is closed as
obsolete **only after** this replacement PR exists, never before.

**PR #29 is re-pinned, not touched.** It is an open **draft**, head `11da3905`, branch
`docs/ipo-product-decision-filter`, `MERGEABLE`/clean, but based on `b76d0962` — **now stale**, since
`main` advanced to `837a7f99`. Its single file and its doctrine content are **not** imported here,
in either direction. Op 76 records its status and stops.

---

## §5 — Branch ownership and serialisation

| | |
|---|---|
| Branch | `docs/op76-reconcile-pr28-landing` |
| Owner | Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3 — author **and** committer) |
| Base | `837a7f9991123c8b22ddfe57fce2c2777663744d`, the live `main` at branch-cut time |
| Repos written | `tgp-agent-context` **only** |
| Backend write token (S3) | **not taken** — Op 76 writes no backend code |
| `app.module.ts` (S2) | **not touched** |
| Overlap with PR #29 | **none.** #29 owns `product-doctrine/IPO_PRODUCT_DECISION_FILTER.md`, which this branch does not create, read into, or reference for content |
| Overlap with PR #26 | **by design.** #26 targets three of the same files. It is `CONFLICTING` against a two-Op-stale base and is superseded here, so the overlap is resolved by supersession, not by a merge |
| Frozen artifacts | `handoffs/op74/**` and `handoffs/op75/**` records are **not edited**, with one exception recorded in §7 |

Canonical ownership lists, the PR ladder and the blocker table remain in
[Op-74 `OWNERSHIP_AND_PR_LADDER.md`](../op74/OWNERSHIP_AND_PR_LADDER.md) and are **unchanged**. The
Op-76 delta is in [`OWNERSHIP_AND_LADDER_OP76.md`](OWNERSHIP_AND_LADDER_OP76.md).

---

## §6 — Rollback

Forward-only. `git revert` of the single Op-76 commit restores the Op-75 post-landing snapshot
exactly: `repos.context.main_head` returns to `b76d0962`, B2 returns to OPEN, `I1` returns to
BLOCKED, and the PR ledger returns to empty. Nothing else in the repository is affected, because
nothing else is touched.

**No history rewrite. No force-push. No amend on shared history.** If a recorded SHA is ever found
to differ from GitHub live state, that is **INFRA_DEATH** per R124 — stop, re-verify, and remediate
forward.

Reverting is a **downgrade to a known-stale state**, not a repair: the surfaces would resume
asserting a B2 that is closed and an `I1` that is permitted. Prefer a corrective follow-up over a
revert unless the recorded evidence itself is wrong.

---

## §7 — Stop conditions in force

1. **No merge of this PR by any server-side mechanism.** `gh pr merge` is **FORBIDDEN** on
   production `main` in every flag combination (R3 §How-to-comply, R14 landing-mechanism note). The
   only permitted path is the git-native plain non-force fast-forward in
   [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md).
2. **No force-push, no rebase, no amend** on any published branch, ever, including to repair a bad
   landing.
3. **No completion claim.** R14 CLEAN for backend `5076a07a` is not met. A3 stays PARTIAL /
   default-OFF. V5 and the importer wave are unaffected by this Op.
4. **No flag flip.** `FEATURE_DUNNING_V2` stays default-OFF and unregistered; the registry blind
   spot recorded at Op 75 is unchanged.
5. **No status may be asserted without evidence** (`R-DUNNING-BAR-1` §2). Every status changed in
   this Op is derived in §3 from a condition written down before the event.
6. **PR #29 is not to be touched or closed by this Op.**
7. **Op-74 and Op-75 records are not edited.** The one exception is
   `handoffs/op75/verify-citations.sh`, whose artifact **scope arrays** are extended so the control
   can see this Op's new files. Its logic, thresholds, exit codes and ledger are unchanged. A
   control that cannot see the artifacts of the PR shipping it is not a control, and a forked copy
   would be the duplication R132 forbids.

---

## §8 — Gates run

| Gate | Invocation | Expected |
|---|---|---|
| R3 identity, pre-push | `handoffs/op75/r3-identity-gate.sh <sha>` | exit 0 — author and committer both the R3 identity, zero forbidden tokens |
| R3 identity, post-push | same, with the repo argument, so GitHub's own view is checked | exit 0 |
| Citations | `handoffs/op75/verify-citations.sh` | exit 3 on its **accepting** text — zero unclassified, zero bad class, zero stale, zero drift, zero broken, zero unpinned, zero JSON line citations |
| Citation control self-test | `handoffs/op75/verify-citations.sh --self-test` | `SELF-TEST: PASS` — the control demonstrated failing on an injected defect and the tree restored clean |
| Rendering, structural | `handoffs/op75/verify-rendering.sh` | exit 0 — no table row emits more cells than its header defines |
| Rendering, against GitHub | `handoffs/op75/verify-rendering.sh --render` | exit 0 — every table row's tail survives GitHub's own renderer |
| JSON parses | every tracked JSON file loaded with a real parser | no failure |
| Byte-fidelity of the state file | re-serialise `current-state.json` and compare to the bytes on disk | identical, so the edit introduced no reformatting noise |

**On the two Op-75 scripts being reused rather than reissued.** `verify-rendering.sh` pins
`BASE=b76d0962…`, the Op-75 base. On this branch that base is an ancestor of the Op-76 tip, so the
file list it derives is a **superset** of the files Op 76 changed — it re-checks the fifteen Op-75
files as well as this Op's. Over-coverage is sound; under-coverage would not be. This is stated
because a reader who notices the stale-looking constant deserves the reason rather than a surprise.

**Scope limit, stated rather than skipped.** `verify-citations.sh` now covers the Op-76 artifacts.
It does **not** cover `OPERATOR_STATE.md`, `ZOMBIE_AGENT_PROTOCOL.md`,
`A03-reengagement-dunning.md` or `OPERATOR_HANDOFF.md`, which this Op also edits. Those four carry
pre-existing unpinned citations accumulated over many months; pulling them into a pinned control is
a real and worthwhile job, and it is a **larger** job than this reconciliation, so folding it in
would break the single-intent scope. Recorded as a follow-up in `next_actions_ordered`. The Op-76
edits to those four files are written with **no** line-number citations at all, so they add nothing
to that backlog.

---

**On the verdict token below.** R16 and R78 fix a **closed** set of four: `CLEAN`, `FINDINGS`,
`REFUSAL`, `INFRA_DEATH`. "RECONCILED" is not a member and is not invented here — coining a fifth
token would defeat the stuck-classifier that reads this line. **`FINDINGS` is the honest member**:
the twelve dual-lens findings against backend `5076a07a` are all still open, and this Op remediates
none of them. Reconciliation is described in the line, not asserted as a verdict class.

VERDICT: FINDINGS — PR #28's landing recorded from evidence; **B2 CLOSED**, `I1` **PERMITTED, not dispatched**; **B1 open by design**; twelve Op-75 findings all still open and **R14 CLEAN for backend `5076a07a` not met and not claimed**; PR #26 superseded, PR #29 re-pinned and untouched; 0 production LOC; no history rewritten.
