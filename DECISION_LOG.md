# DECISION LOG

Operator-signed decisions that changed doctrine, architecture, or process. Every AGENT_RULES.md change requires a corresponding entry here (per the AGENT_RULES.md footer).

Newest first.

---

## 2026-07-29 (Op 76) — PR #28 LANDED AND RECONCILED: context `main` advanced `b76d0962` → `837a7f99` by plain fast-forward; **B2 CLOSED** and rung **`I1` PERMITTED (not dispatched)** against a condition written down before the event; **B1 open by design**; the empty PR ledger replaced with the twelve genuinely open PRs; PR #26's accurate facts preserved and three of its claims recorded as superseded; **R14 CLEAN for backend `5076a07a` still not met and not claimed** (governance/state reconciliation only; 0 production LOC; no build, no dispatch, no flag flip, no completion claim)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Documentation/state reconciliation of a **completed context-repo landing** (PR #28). No product code; no `AGENT_RULES.md` edit; no new rule; no new ruling. Audit-exempt per R14 scope (context-repo docs). **This Op RECORDS a completed landing** — it is NOT a new directional decision, authorizes NO runtime work, dispatches NO rung, and does NOT claim the product or the audit complete.
**Governing decision:** Op 75 deliberately left its own landed SHA unrecordable — its state file says so at `truth_boundaries.op75_post_landing_sha_not_claimed` (*"The landed Op-75 SHA must be pinned by a SUBSEQUENT reconcile and must never be asserted in advance"*), and its ladder document says B2 *"closes on landing of PR #28, not before"*. **Op 76 is that subsequent reconcile and nothing more.** The **`R138 Decision Gate`** for this Op is answered in full, in prose, at §2a of [`handoffs/op76/PRE_BUILD_REVIEW_OP76.md`](handoffs/op76/PRE_BUILD_REVIEW_OP76.md), and canonically machine-readably at `handoffs/importer-wave/current-state.json` → `decision_record_op76_pr28_landing_reconcile_2026_07_29.r138_decision_gate`. It asks R138's four canonical questions — Musk's 5 first principles, *"What would hyperscalers do?"*, *"How can I get the GOOD without the BAD?"*, *"Am I attacking the root cause?"* — plus the decision and its rollback/blast-radius note that the same rule's recording clause requires.
**Files touched (context repo):** `handoffs/op76/PRE_BUILD_REVIEW_OP76.md` (**NEW**), `handoffs/op76/BASELINE_HEADS_OP76.json` (**NEW**), `handoffs/op76/OWNERSHIP_AND_LADDER_OP76.md` (**NEW**), `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `roadmap/specs/A03-reengagement-dunning.md`, `operator-meta/OPERATOR_STATE.md`, `operator-meta/ZOMBIE_AGENT_PROTOCOL.md`, `handoffs/op75/verify-citations.sh` (**scope arrays only** — logic, thresholds, exit codes and ledger unchanged). **Documentation/state only; 0 production LOC.**

**What landed (context repo, reconciled here).** **PR #28** — the Op-75 `P0-AUDIT` evidence — landed on `tgp-agent-context` `main` as **`837a7f9991123c8b22ddfe57fce2c2777663744d`**, the **exact audited head, unchanged**, at `2026-07-29T03:08:46Z`. Base **`b76d0962de53ce494fa8f869a706ff0c15aee0b6`**; **tree `2820a7719e9ab5756b4c8b94220a114ff2d69d9d`**; **single parent `e744d428aafa872af96056d4b9cc4ce089f39d3e`** (the branch's own predecessor, **not** the base — the branch carried fourteen commits); **author == committer == Bradley Gleave <bradley@bradleytgpcoaching.com>**; 15 files, +4640/−26, composition `json md sh tsv` only. **Plain non-force fast-forward:** `mergeCommit.oid` **equals** `headRefOid`, so **no commit object was minted server-side**; GitHub compare reports `ahead_by 14`, `behind_by 0`. `merged=true` is GitHub's reachability match on the PR head, **not** evidence of a server-side merge — the field is read and its cause recorded rather than glossed. `gh pr merge` was never invoked in any variant, the UI button was never clicked, no REST/GraphQL merge endpoint was called, and no history was rewritten. The sole PR-#28 comment is the integrator landing record, id **`5112353783`**, posted `2026-07-29T03:11:11Z`, 17592 bytes; that comment itself flags the missing `DECISION_LOG.md` half of the landing record as **outstanding** rather than assumed done — **this entry discharges it.**

**Verified against GitHub (Op 76).** Every SHA recorded in this Op was obtained **both ways** — from the GitHub API **and** from `git ls-remote` — and no value that failed either was written. Live context `main` == `837a7f99`; backend `main` == `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` (**unchanged**); mobile and extension **unchanged**. The full both-ways evidence, the landed-commit envelope, the fast-forward proof and the state transitions are pinned in [`handoffs/op76/BASELINE_HEADS_OP76.json`](handoffs/op76/BASELINE_HEADS_OP76.json). **A shallow-clone caveat is recorded rather than hidden:** this worktree is shallow and grafted, so a local `git merge-base --is-ancestor` exits 1 and would read as "not an ancestor"; ancestry therefore rests on the GitHub compare endpoint, and the caveat is written down so a reader running the local command is not misled. The `growth-project-extension` 404 encountered while pinning heads was a **name error, not an outage** — the repository is `tgp-importer-extension`.

**Canonical state updated.** `repos.context.main_head` **`b76d0962` → `837a7f99`** (+ short / as_of / tree / tip_msg / note, with `prior_tip_before_op76` recorded); **B2 `OPEN` → `CLOSED`** and rung **`I1` `BLOCKED` → `PERMITTED`** in `truth_boundaries` and `repos.backend.audit_trail_op75.status`, **additively**, every prior wording preserved byte-identically in a sibling key; `open_prs` **`[]` → the twelve genuinely open PRs** with `open_prs_note` refreshed; `op_label` / `headline_status.current_op` / `verdict` / `successor_label` / `as_of_utc` / `as_of_local` advanced to **Op 76** with the Op-75 wording retained for provenance; `decision_record_op76_pr28_landing_reconcile_2026_07_29` and `reconciliation_op76_pr26_supersession_2026_07_29` appended; the ancestry-check follow-up added to `next_actions_ordered`. `decision_record_op75_p0_audit_discharge_2026_07_27` is **deliberately not renamed** — its label is annotated by an existing sibling correction key, and renaming it would erase that record.

**B2 closes by derivation, not by assertion.** Op-75's ladder document published the closing condition as a table **before** the landing: PR #28 *"landed on context `main`, R3-clean, plain fast-forward"* ⇒ B2 **CLOSED**, `I1` permitted. All three conjuncts are verified independently above and in §3 of the pre-build review, each from a source outside this repository. Asserting a status without evidence is a P0 under [`R-DUNNING-BAR-1`](roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2 — and so is **leaving a true status unclaimed**, which is the failure this Op exists to correct: the surfaces went on asserting an open B2 and a blocked `I1` after both stopped being true. **`I1` is PERMITTED, not dispatched; this Op opens the gate and sends nobody through it.**

**PR #26 superseded; its accurate facts preserved (R5/R132).** #26 is `CONFLICTING` on a two-Op-stale base. Its surviving substance is **re-derived at Op-76 time rather than copied** and carried onto `main` here: the backend tree-preserving fast-forward `07ff974` → `5076a07`; `DunningLockoutGuard` mounted globally as the final `APP_GUARD` after `JwtAuthGuard`; the 403 wire contract being `code` plus `message` with `lockout_copy` dropped by the shared error envelope; unit and e2e specs present with CI green at the audited head; `FEATURE_DUNNING_V2` **default-OFF** with the guard a hard no-op while OFF; and **A3 P0-1 (guard-not-mounted) FIXED/LANDED** with A3 overall still **PARTIAL / default-OFF**. **Three of its claims did not survive re-derivation and are named, not silently dropped:** (1) *"Dunning-v2 PR #520 landed"* — it did not; #520 is `CLOSED` with `merged` false, its head never became an ancestor of `main`, and the corollary that the landed tree matches an *audited* head `dcb58126` fails with it, because that head was never audited; (2) *"advance the context head per the one-lag convention"* — **no such convention applies**; the head is advanced here because the API and `ls-remote` both return it; (3) *"`/ai/*` stays LOCKED and `/roman/*` is the sole AI-adjacent carve-out"* — superseded by Op-75 Lens A **P1-1**, which shows the allow-list also matches on the **second** path segment, making two scheduling OAuth routes unintentionally reachable while locked out. **Disposition: #26 is recorded SUPERSEDED and closed as obsolete only AFTER this replacement PR exists, never before.** Closing is not deleting — branch, head, diff and body all persist and reopening is one command — and #26's substance now lives on `main` rather than only on an abandoned branch, which is strictly more preservation than leaving it open.

**Next frontier.** **NO new build is authorized by this Op.** Rung **`I1`** is unblocked and **unassigned**; a future Op must dispatch it explicitly. The twelve Op-75 findings are **untouched** — combined dual-lens counts stand at **0 P0 / 3 P1 / 5 P2 / 4 P3** against an R14 CLEAN bar of zero across P0–P3. The named root-cause follow-up is a check that fails when the pinned context head is not an ancestor of live `main`; it is **deliberately not built here**, because building it inside a reconciliation PR is the scope creep R133 forbids, and it is recorded in `next_actions_ordered` instead. The second recorded follow-up is bringing `OPERATOR_STATE.md`, `ZOMBIE_AGENT_PROTOCOL.md`, `A03-reengagement-dunning.md` and `OPERATOR_HANDOFF.md` inside the citation verifier's pinned scope; their pre-existing unpinned citations are a larger job than this reconciliation, so the Op-76 edits to those four files carry **no line-number citations at all** and add nothing to that backlog.

**Rollback / stop.** Forward-only. `git revert` of the single Op-76 commit restores the Op-75 post-landing snapshot exactly: the pinned context head returns to `b76d0962`, B2 returns to OPEN, `I1` returns to BLOCKED, the PR ledger returns to empty. **Reverting is a downgrade to a known-stale state, not a repair** — prefer a corrective follow-up unless the recorded evidence itself is wrong. If any recorded SHA later differs from GitHub live state, treat as **INFRA_DEATH** per R124: stop, re-verify, remediate forward. **NO history rewrite, NO force-push, NO amend on shared history — ever, including to repair a bad landing.** **This PR is not to be merged by any server-side mechanism**; `gh pr merge` is FORBIDDEN on production `main` in every flag combination, and the only permitted path is the git-native plain non-force fast-forward in `handoffs/importer-wave/R3_MERGE_RUNBOOK.md`.

**Invariants preserved.** `AGENT_RULES.md` not edited (no rule added, changed or renumbered; the permanent `R127`–`R129` gap **B6** untouched); `R3_MERGE_RUNBOOK.md` mechanics unchanged; the Op-74 canonical ownership lists, PR ladder and blocker table unchanged; Op-74 and Op-75 records **not edited**, the single pre-declared exception being the citation verifier's artifact **scope arrays**, extended so the control can see the artifacts of the PR shipping it — a control that cannot see them is not a control, and a forked copy would be the duplication R132 forbids. **B1 remains `OPEN_ACCEPTED_NOT_FIXED` by design** (R3-INC-4 is an unasserted-local-identity incident on the backend commit; fixing it would require rewriting published shared history, forbidden by R5 and the R3-INC-1 precedent). B3–B6 unchanged. **`FEATURE_DUNNING_V2` remains default-OFF and unregistered**; all importer flags default-OFF; production flags dark; billing exclusion preserved; **mission remains site-agnostic** (R-SITE-AGNOSTIC-1). **PR #29 is re-pinned only — not touched, not imported, not closed.** Context reconcile lands R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR #28: https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/28 · Landed head `837a7f99`: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/837a7f9991123c8b22ddfe57fce2c2777663744d · Base `b76d0962`: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/b76d0962de53ce494fa8f869a706ff0c15aee0b6 · Integrator landing comment: https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/28#issuecomment-5112353783 · Superseded PR #26: https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/26 · Re-pinned, untouched PR #29: https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/29 · Backend audited subject `5076a07a`: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/5076a07a1e54b14e3db84d3aa128fb0bb44542d7

### Amendment — Op-76 second pass (2026-07-29): the reconciliation Op committed the defect it was written against

**Everything above this heading is the first pass's own account and is NOT rewritten (R5/R132).** This amendment records what review found wrong with it and what a **new commit on the same published branch** changed. No amend, no rebase, no force-push; the first-pass commit `5426304289495ce99054f62e5ed8147269ea4263` stays in the branch history exactly as pushed.

**The shape of the failure.** The first pass was written against one defect — **asserting a status instead of deriving it** — and then committed three instances of it. It re-verified the *hard* facts, the SHAs, both ways, and got them right. It **asserted** the easy ones and got three wrong. Difficulty is not what predicted the error; **whether the value was read or assumed** is.

**Six findings, all corrected.**

1. **The open-PR ledger was not derived live.** It listed **#26 as open** after #26 had been closed, and **omitted PR #30** — this Op's own reconciliation PR — which was open. The total came out at twelve both times **only because the two errors cancelled**, which is worse than a wrong total: a number that matches looks checked. Membership is now read from the GitHub API and written verbatim. The live twelve are `30, 29, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2`. The first-pass array and note are retained byte-identically at `open_prs_prior_op76_first_pass` and `open_prs_note_prior_op76_first_pass`.
2. **Three narrative surfaces mirrored the wrong membership** — the importer-wave operator handoff, `OPERATOR_STATE.md`, and the `ZOMBIE_AGENT_PROTOCOL.md` sweep. All three corrected additively; the stale sentences are struck through and retained in place, not deleted.
3. **Forward-dated timestamps.** `2026-07-29T05:05:00Z` and its local twin appeared on six surfaces and were **later than every observation behind them** — the R3 gate emitted `2026-07-29T04:01:33Z` on preflight and `2026-07-29T04:01:47Z` after the push, GitHub recorded PR #30 created at `2026-07-29T04:03:11Z` and PR #26 closed at `2026-07-29T04:04:00Z`. A verification timestamp that postdates its own verification is an assertion wearing an observation's clothes. Replaced with the emissions of real commands, each recorded with its window: PR membership `2026-07-29T14:47:33Z`–`2026-07-29T14:47:35Z`; both-ways head sweep `2026-07-29T14:49:00Z`–`2026-07-29T14:49:39Z`. **All four heads re-read identical**, so no SHA changed.
4. **An overbroad reading of R5.** *"R5 forbids losing things, not closing them"* paraphrased a **SACRED** durability rule into a general anti-loss maxim and then used the paraphrase as the **authority** for closing a pull request. Narrowed to a four-part derivation: closing removes nothing from GitHub; carrying #26's substance onto `main` first **increased** durability measured against R5's own test; **R138's directional grant is the authority and R5 is a constraint the action satisfies** — the first pass had those two roles confused; and the derivation is about *this* PR, **not** a general licence to close PRs.
5. **PR titles were hand-written, not API-derived.** Two of twelve had already drifted after a single pass (#29 and #10), and the ten legacy PRs were described in the zombie sweep by **branch slug**, which is not a title. Every title is now the API value with its source recorded per entry. One consequence surfaced immediately: **#7's branch is `spec/ew3-android-parity` but its title begins `audit:`** — a slug-based inventory would have mis-filed it.
6. **The already-published comment on PR #26 carries the same overbroad R5 reading.** An **additive** correction comment is appended to that thread. The original is **not** edited — editing a published record to make a past self look correct is exactly the rewrite R5 and R132 prevent.

**What did not change.** No blocker moves: **B2 stays CLOSED**, **B1 stays OPEN by design**, B3–B6 unchanged. **`I1` stays PERMITTED and still not dispatched.** None of the twelve Op-75 findings is remediated — combined **0 P0 / 3 P1 / 5 P2 / 4 P3** against a bar of zero across P0–P3, so **R14 CLEAN for backend `5076a07a` is still not met and not claimed**. **PR #29 still not touched.** **PR #26 stays closed** — the supersession finding is unaffected by the R5 *wording* defect, and reopening would re-create the competing authority the close removed. `FEATURE_DUNNING_V2` stays default-OFF. **0 production LOC.**

**Standing rule adopted from this.** Live-surface status is **re-read at write time** from the authoritative source, including the values that feel too obvious to check: the membership of a list you just changed, the title of a PR you just opened, and the current time. A ledger that is patched rather than re-read will eventually disagree with the API.

---

## 2026-07-27 (Op 75) — P0-AUDIT EVIDENCE PRODUCED: retroactive adversarial dual-lens R14 audit of backend `5076a07a`; **B2 closes on landing of PR #28, not before**; **B1 open by design and reclassified** (R3-INC-4 is an *unasserted-identity* incident, not a forbidden-mechanism one); twelve findings recorded and routed; one finding blocked on an ownership decision; no history rewritten (governance/audit evidence only; 0 production LOC; no build, no landing, no flag flip, no completion claim)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Execution of ladder rung **`P0-AUDIT`** — the prerequisite rung published at [`handoffs/op74/OWNERSHIP_AND_PR_LADDER.md`](handoffs/op74/OWNERSHIP_AND_PR_LADDER.md) §3, which blocks **all** backend work. Governance / audit evidence only; **0 production LOC**. Audit-exempt per R14 scope (context-repo docs).
**Governing decision:** rung `P0-AUDIT` mandates a *"Retroactive adversarial R14 audit of baseline `5076a07a` (Day-10 lockout guard); record **R3-INC-4**; file findings as their own PR if any"*, with the standing constraint *"**Do not force-push** (R3-INC-1 precedent)."* Both honoured. The **`R138 Decision Gate`** for this Op is answered in full, in prose, at [`handoffs/op75/PRE_BUILD_REVIEW_OP75.md` §2a](handoffs/op75/PRE_BUILD_REVIEW_OP75.md), duplicated from the **canonical** machine-readable location `handoffs/importer-wave/current-state.json` → `decision_record_op75_p0_audit_discharge_2026_07_27.r138_decision_gate`. It asks R138's **four canonical questions** — Musk's 5 first principles → *"What would hyperscalers do?"* → *"How can I get the GOOD without the BAD?"* → *"Am I attacking the root cause?"* ([`AGENT_RULES.md`](AGENT_RULES.md) §14 R138, lines 1593–1602) — plus the decision and its rollback/blast-radius note that the same rule's recording clause requires. *(R5/R132, superseded pointers named not deleted: the first wording pointed at `PRE_BUILD_REVIEW_OP75.md` before that file carried the answers and named the JSON object without a gate key; the second wording used the key `r138_four_question_gate`, whose four questions were **not** R138's — see the third-pass correction below. The prior key and its contents are preserved at `…r138_four_question_gate_stale_op75_first_pass`.)*

> **CORRECTED at the replacement-owner review pass (2026-07-27).** This entry previously headlined *"blocker **B2 CLOSED**"*, carried a *"### Blocker B2 — CLOSED"* section, stated the ladder was *"unblocked from `I1`"*, cited *"14 unit cases"*, routed Lens A P3-2 to **`DUN-9`**, listed only **three** touched files, and reported *"eight findings"*. **Every one of those was an overclaim or an error:** B2 cannot close until this branch is reachable from `main` (asserting otherwise is itself a P0 under [`R-DUNNING-BAR-1`](roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2, *status is derived, never asserted*); the true unit count is **37** (+10 e2e = **47**); `DUN-9` is a **mobile** rung and cannot change a backend error envelope; nine files are touched; the combined finding count is **twelve**. The stale wording is recorded here rather than erased (R5/R132) and the accurate account follows.

> **CORRECTED AGAIN at the second remediation pass (2026-07-27).** A second independent review of this branch found that the first remediation pass, while it fixed what it named, introduced or left standing eight defects of its own. All are corrected above and named here rather than erased (R5/R132):
>
> 1. **Lens A P2-2 was mis-transcribed in every routing index.** Every index printed *"no durable record of a lockout transition → `DUN-4`"*. That is **Lens B** P2-2. Lens A P2-2 is the free-text `status` lockout-read defect, a **state-machine** finding that `DUN-4` structurally cannot execute — so the real finding appeared in **zero** indexes and the phantom one was routed to a rung that could not act. Corrected to **`DUN-1`** in this log, [`OWNERSHIP_AND_LADDER_OP75.md`](handoffs/op75/OWNERSHIP_AND_LADDER_OP75.md), [`BASELINE_HEADS_OP75.json`](handoffs/op75/BASELINE_HEADS_OP75.json) and [`current-state.json`](handoffs/importer-wave/current-state.json).
> 2. **A retraction was invented.** The log claimed the R107 citation was withdrawn from *"Lens A P2-2 / Lens B P2-2"*. `R107` occurs **zero** times in Lens A. Narrowed to Lens B P2-2 only.
> 3. **"Four routes reachable while locked out" overstated the P1 twofold.** Only **two** are unintended (`/api/scheduling/auth/google/initiate`, `/api/scheduling/auth/google/callback`). `coach/billing/status` and `coach/billing/portal-session` are reachable **by design** via the intended `billing` recovery prefix; the asymmetry with the LOCKED `v1/coach/me/billing` is **Lens A P2-1**, a P2. Corrected in all six surfaces that carried the claim.
> 4. **Stale changed-file counts.** [`PRE_BUILD_REVIEW_OP75.md`](handoffs/op75/PRE_BUILD_REVIEW_OP75.md) still said **eight** paths in §8 and §9 after the ninth was added. ~~Now nine.~~ **SUPERSEDED (R5/R132, fifth pass 2026-07-27): "Now nine." was true only at the second pass; a tenth path was added at the third pass. This wording is preserved as the historical record of that pass and must not be read as present-tense truth. The live count is derived, never asserted here — see the exhaustive *"Files touched (context repo)"* table below and `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .changed_files`.**
> 5. **False reproducibility rows.** Several rows asserted `match: true` while quoting live-API output (`git rev-parse HEAD` → `5c2f0057`, `git rev-parse HEAD^` → the base) that stopped being true the moment the branch advanced. A reviewer re-running them would see a mismatch and read it as R124 drift. Every such row is now scoped **"at capture"** with an explicit note that re-running is *expected* to differ, and the **self-reference constraint** is stated rather than pretending an artifact can pin itself.
> 6. **Two competing canonical R124 matrices.** Both the audit reports and `BASELINE_HEADS_OP75.json` claimed canonicity. Resolved: **the two audit reports are the sole canonical family** (verbatim identical six-line block); every other surface is an explicitly labelled **non-canonical mirror** with a forward pointer and no independent value.
> 7. **A dangling R138 pointer.** This log pointed at `PRE_BUILD_REVIEW_OP75.md` for the four-question gate before that file carried it. The answers are now duplicated in prose at **§2a** of that file, with the canonical machine-readable location named.
> 8. **Smaller record errors.** PR #520's real title is *"…by mounting guard in global chain"* (the log had transcribed the **landing commit's** subject); the preventive identity gate's token regex claimed to cover `agent` but omitted it; [`BASELINE_HEADS_OP74.json`](handoffs/op74/BASELINE_HEADS_OP74.json) `read_this_first` called five statements corrections when two are additions; B3's `P1`-as-blocker versus `P3`-as-finding severities needed an explicit reconciling note; and the verdict lines here and in `PRE_BUILD_REVIEW_OP75.md` used tokens outside R16's closed set (`CLEAN` / `FINDINGS` / `REFUSAL` / `INFRA_DEATH`) and are now `FINDINGS`.
>
> **One review finding is REJECTED, with evidence.** The review claimed the "Node-scoped" sentence in `test/prod-readiness/env-discovery.ts` sits at **`:195`**, making the `:196` citation off by one. Re-read from the backend at the audited SHA: `grep -n` returns `196: * Node-scoped: only \`process.env.*\` and \`process['env'].*\` are recognised.` **The existing `:196` citation is correct and was not changed.** Accepting a plausible correction without re-deriving it is exactly how the errors above entered.

> **CORRECTED A THIRD TIME at the third remediation pass (2026-07-27).** A third independent review at exact head `7331a0cf` re-derived every backend `file:line`, every SHA, every external API fact, the 56 prod LOC / 339 test LOC / 6.05:1 / R75-net-0 budgets and the 37+10=47 test count, and confirmed all of them — and confirmed the `:196` rejection above was right. It found **no P0**, and **three defects in the metadata/citation layer**, two of them introduced by the second pass. All three are corrected above and named here rather than erased (R5/R132):
>
> 1. **The pass that fixed the Lens A P2-2 transcription broke every pointer *to* it.** The second pass grew Lens A's BUILD MATRIX block by **+31 lines** (355 → 386) and never re-derived its own outbound line citations. Seven occurrences of three pointers — `P0-AUDIT-A-5076a07a.md:102` / `:152` / `:183` — were correct at the prior tip `6871b5bf` and stale afterwards. The `:183` pointer was the worst case: it exists **specifically** to disambiguate Lens A P2-2 from Lens B P2-2, the headline defect the second pass was created to repair, and it had come to land on the **P2-1** heading — so a reviewer following the disambiguating pointer was sent to a third, different finding. This log compounded it by asserting *"The actual heading at `P0-AUDIT-A-5076a07a.md:183` is …"* and then quoting the P2-2 title, a directly falsifiable claim at the cited line. **Root cause, and the reason this is the pass's own discipline failure:** the second pass correctly refused an unverified line-number correction (the `:196` rejection) on the grounds that *"accepting a plausible correction without re-deriving it is precisely how the eight defects above entered"* — and then did not apply that same rule to its own outbound pointers. All citations are now **re-derived from the final files** at this pass, and line-citation re-derivation is added to the [§9 validation checklist](handoffs/op75/PRE_BUILD_REVIEW_OP75.md) so a future edit above a finding cannot silently re-break them.
> 2. **The R138 gate answered four questions that are not R138's four questions.** Every Op-75 surface — this log's pointer, `PRE_BUILD_REVIEW_OP75.md` §2a, the canonical `current-state.json` object, **and Lens B's reconstructed gate for the backend commit** — asked *smallest change / what could this break / is it reversible / what evidence proves it works*. R138 defines the gate as *"the operator's four questions, verbatim in intent"*: **Musk's 5 first principles**, ***"What would hyperscalers do?"*** with a concrete cited practice, ***"How can I get the GOOD without the BAD?"***, and ***"Am I attacking the root cause?"***. The words *Musk*, *hyperscaler* and *GOOD-without-BAD* appeared in **no** Op-75 gate surface. **This was not inherited convention drift:** `decision_record_op59_reconcile_2026_07_16.r138_gate` uses `musk_5`/`hyperscalers`/`good_without_bad`/`root_cause`, Op-63 uses `q1_first_principles_musk_algorithm`/`q2_hyperscaler_lens_evidence`/`q3_good_without_bad`/`q4_root_cause`, and this log restates the canonical four verbatim in its own Op-63 entry. The deviation was **Op-75-local and nowhere disclosed** — no supersession note, no R5/R132 record. **Why it mattered most in Lens B:** that reconstructed gate is the R138 half of **B2's closure evidence**, so a gate answering the wrong questions was incomplete evidence for the blocker it is offered to close (`AGENT_RULES.md` line 874 grades a governed change with an absent Decision Record a **P1**; line 1592 confirms docs-only changes are **not** exempt from the gate). **No answer was discarded.** The prior four were a blast-radius / reversibility / verification note, which R138's *"How to record the gate"* clause **also** requires — so they are retained, remapped to a `Decision, and its rollback / blast-radius note` block and a `Verification evidence` paragraph, which is where they belong, and preserved key-for-key at `…r138_four_question_gate_stale_op75_first_pass`. Headings are renamed to the **`R138 Decision Gate`** form line 1601 requires.
> 3. **The commit that documented the identity-gate check-2 false-positive class was itself an unrecorded instance of it.** `7331a0cf` was written to explain why the token scan fires on prose, and its own message body contains the line `free-form "Generated with ..." footer the rule exists to catch. Instead the` — so it trips the very check it documents. The second-pass PR body recorded an override for `2e5cd2dd` only and stated the class *"trips it on exactly one line"*, true of `2e5cd2dd` but silent that the head did the same. **Root cause: the gate had no machine-observable state for "prose, not attribution",** so the distinction lived in prose and the document contradicted itself — its preamble said non-zero means never push while its own note prescribed pushing after recording an override. Fixed at the source: the gate is now the executable [`handoffs/op75/r3-identity-gate.sh`](handoffs/op75/r3-identity-gate.sh) returning **0** `PASS` / **1** `HARD FAIL` / **3** `OVERRIDE_REQUIRED`, with the override schema and both live override records at §2.1 and §2.2 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md). **No check was weakened and no commit was reworded**, stated precisely: the broad **2b** token pattern is retained **character-for-character** and is the backstop for anything 2a cannot shape-match; the new *attribution-position* scan **2a** hard-fails **canonical attribution positions** (a trailer key at line start, or a footer opener with at most a 4-character decoration) and is strictly additional hard failure the earlier gate did not have; and **other vocabulary forms return exit 3, not exit 1** — measured, a mid-line `Co-authored-by:` inside prose and a `Generated with` footer with a longer prefix both land on 3. Exit 3 is **never a silent pass**: it is reachable only when checks 1, 2a and 3 have all passed, and it still blocks the push until an exact-SHA override record quoting the matched lines exists. This is deliberately **not** a claim that every vocabulary form hard-fails. **(R5/R132 — SUPERSEDED at the fifth pass: the "character-for-character" retention of 2b named in this historical record was itself the defect. See fifth-pass correction item 1 above; 2b is now a superset of 2a's key set.)**
>
> **One review finding is REJECTED, with evidence.** The review's P3-1 second bullet claimed that `BASELINE_HEADS_OP75.json` reconciles B3's `P1`-as-blocker versus `P3`-as-finding severities *"but does not use that framing"* of them being different axes. Re-read at this SHA, `open_blockers_ref.B3.sev_note` contains the literal string *"The two severities are on different axes and do not contradict"*. **The framing is present verbatim and nothing was changed.** The review's P3-1 first bullet — that the PR body quoted OP75-C4/C5 as `"nothing; ADDITIVE"` when the actual values are `"nothing; ADDITIVE clarification"` and `"nothing; ADDITIVE verification"` — is **accepted** and corrected in the PR body.

> **CORRECTED A FOURTH TIME at the fourth remediation pass (2026-07-27).** A fourth independent review
> at exact head `f21b5412` **executed** the gate rather than reading it — every branch commit, seven
> synthetic hard-fail shapes, wrong-author / wrong-committer envelopes, unresolvable-SHA and
> missing-argument fail-closed paths — and confirmed the documented exit codes, the byte-identical
> mirror, all seven re-derived citations, the four canonical R138 questions, 3/3 JSON parses and
> 160/160 links. It found **no P0 and no P1**, and **four defects, two of them in this repository's
> files and two confined to the mutable PR body**. Named here, not erased (R5/R132):
>
> 1. **Active rollback prose asserted a count the same document had already outgrown.** The
>    *"Rollback / stop"* section said a revert *"removes all nine paths"* while the *"Files touched"*
>    table eight lines above said **ten** and live PR metadata reported `changed_files=10`. Unlike the
>    *"eight"* / *"nine"* strings preserved above under R5/R132, that sentence was **active prose**, so
>    it was a fresh internal contradiction introduced by the third pass — which added
>    `r3-identity-gate.sh` and updated the table but not the paragraph. **Root cause: the number was
>    duplicated into prose at all.** Fixed structurally rather than incrementally — the sentence now
>    points at the exhaustive table and at `gh api …/pulls/28 --jq .changed_files` and carries **no
>    independent count**, and a [§9 row](handoffs/op75/PRE_BUILD_REVIEW_OP75.md) forbids active prose
>    from restating an artifact count. The same scan found `R3_IDENTITY_PREPUSH_ASSERTION.md` §4
>    asserting *"all four commits on this branch"* when there were five; that too now names the
>    command instead of the number.
> 2. **"Nothing was weakened" claimed more than the code proves.** True of check **2b** — retained
>    character-for-character — but check **2a** matches attribution *positions*, not vocabulary, so two
>    constructions reach **exit 3** rather than exit 1: a mid-line `Co-authored-by:` embedded in prose,
>    and a `Generated with` footer carrying a prefix longer than the pattern's 4-character allowance.
>    The review **measured** both. Nothing in the gate changed — the finding is that the *description*
>    over-claimed, and an over-claimed control is the precise failure mode `5076a07a` already
>    demonstrated: a check believed stronger than it is does not get run. Every active statement now
>    scopes 2b, 2a and exit 3 separately and asserts only the invariant that holds — **no such string
>    ever passes silently**, because exit 3 blocks the push until an exact-SHA override record quoting
>    the matched lines exists. `handoffs/op75/r3-identity-gate.sh` is **unchanged** by this pass; its
>    own inline comment already said 2b may catch *"a real attribution 2a could not shape-match"*, so
>    the code was right and the prose around it was not.
>    **SUPERSEDED (R5/R132, fifth pass 2026-07-27): the last two sentences were wrong. The code was
>    *not* right — leaving the gate unchanged is why the replacement invariant (*"no such string ever
>    passes silently"*) was also false: 2a listed eight trailer keys and the frozen 2b carried one, so
>    the other seven exited **0** off line start, measured. Retained as the historical record of this
>    pass; see fifth-pass correction item 1 below for the fix at the source.**
> 3. **PR-body md5 for the canonical R124 block was unreproducible** — `35670f2a…` was quoted for the
>    six-line block; the actual digest of the committed bytes is `0afb8191a6f59807bc9fc1aef39d68a2`
>    (`sed -n '3,8p' <report> | md5sum`, identical for both lenses). The **underlying claim was true**
>    and independently re-verified — `diff <(sed -n '3,8p' A) <(sed -n '3,8p' B)` is empty — so this was
>    a citation defect, and a self-inflicted one: a digest with no stated derivation is not checkable,
>    which is the same category as the stale line numbers defect 1 of the third pass repaired. Body
>    corrected to the measured digest **with its extraction command stated**. The bad digest appears in
>    **no evidence artifact**, so no file needed changing. ~~(`grep -rn 35670f2a` → 0 hits)~~
>    **CORRECTED (R5/R132, fifth pass 2026-07-27): that command returns 2 hits, not 0 — both inside
>    this correction record itself (`DECISION_LOG.md` line 70 and this line). Writing the finding down
>    created the hits, so the stated zero could never reproduce. Scoped claim, verified: `grep -rln
>    35670f2a` → `DECISION_LOG.md` only; 0 hits in any evidence artifact (`handoffs/audit-reports/`,
>    `handoffs/op75/`, `handoffs/op74/`, `handoffs/importer-wave/`). The substantive conclusion is
>    unchanged. This is the same self-reference constraint already stated for SHAs in the note below,
>    which was not applied to digests.**
> 4. **PR-body JSON pointer did not resolve** — the body cited `repos.backend.open_blockers_ref.B3.sev_note`;
>    `open_blockers_ref` is a **top-level** key of `BASELINE_HEADS_OP75.json`, so the quoted
>    path returns `null`. The quoted sentence is verbatim present at the correct path, so the
>    finding-rejection built on it stands — but the defect sat **inside the very paragraph arguing that
>    pointers must be re-derived rather than trusted**, which is why it is recorded rather than quietly
>    fixed. Verified structurally, not by line number:
>    each bullet below is a **complete command**, then an arrow, then **its output** — the file
>    argument is part of the command and was missing when this bullet was first written, so none of
>    the three was runnable as printed *(labelling corrected at the eighth pass; the conclusions were
>    and remain correct)*:
>    - `jq -e 'has("open_blockers_ref")' handoffs/op75/BASELINE_HEADS_OP75.json` → prints `true`, exit `0`
>    - `jq -e '.repos.backend.open_blockers_ref.B3.sev_note' handoffs/op75/BASELINE_HEADS_OP75.json` → prints `null`, exit `1`. **This is the body's error.**
>    - `jq -e '.open_blockers_ref.B3.sev_note' handoffs/op75/BASELINE_HEADS_OP75.json` → prints the quoted sentence, exit `0`
>
>    The erroneous pointer string is also absent from every committed file.
>
>    *(**Line citations withdrawn at the seventh pass — a repeat of a class this log has already
>    corrected more than once, which is why the fix this time is mechanical rather than another
>    re-derivation.** This bullet previously located those two keys at `:292` and `:296`. Correct
>    when written; wrong by one at `ec4b1a10`, because the sixth pass's own rename hunk inserted a
>    line above them. The dangerous half is that `:296` did not become invalid — it moved **inside
>    blocker `B2`**, so it still resolved, to the wrong record. A number that is merely stale looks
>    broken to a reader; a number that lands on a neighbouring record looks fine. That asymmetry is
>    the whole argument for the `jq` paths above: a property path either resolves or it does not, and
>    it survives every reflow. The old numbers are recorded here, struck, rather than deleted —
>    R5/R132 — and `handoffs/op75/verify-citations.sh` now **rejects** JSON line citations outright so
>    this class cannot return.)*
>
> **Nothing was rejected from this review.** All four findings reproduced exactly as described on first
> attempt. Two of the four were body-only, so the committed diff for this pass is confined to the two
> repository defects plus the two new §9 checks that make each class detectable next time.

> **CORRECTED A FIFTH TIME at the fifth remediation pass (2026-07-27).** A fifth independent review at
> exact head `f9dad595` re-derived the head/parent/tree/base, the identity of all six branch commits,
> the canonical R124 digest, the corrected JSON pointer, the doc-mirror byte-identity and the 162
> relative links, and confirmed every one — including that the fourth pass's redundant `--no-gpg-sign`
> disclosure created **no compliance issue and left no residue** at this SHA. It found **no P0 and no
> P1**, and **four blocking defects plus two minor ones, every one of them introduced by the third or
> fourth pass in the surfaces those passes wrote**. All are corrected above and named here rather than
> erased (R5/R132):
>
> 1. **The invariant the fourth pass retreated to was itself false, and this time the executable gate
>    was the defect — not the prose.** Check **2a** lists **eight** trailer keys but anchors them at
>    line start; the round-2 `BROAD_RE` that the fourth pass froze **character-for-character** carried
>    only **one** of the eight (`co-authored-by`). The other seven — `assisted-by`, `helped-by`,
>    `on-behalf-of`, `reviewed-by`, `authored-by`, `generated-by`, `signed-off-by` — appeared in
>    **neither** check once off line start and returned **exit 0, silently**: no evidence block, no
>    override record, no operator judgement captured. Measured on synthetic commits carrying the
>    correct envelope identity, all seven passed. So *"no such string ever passes silently"* — written
>    twice, in [`R3_IDENTITY_PREPUSH_ASSERTION.md`](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md) §2
>    and §4 — was falsifiable by running the control it described, which is precisely what the fourth
>    pass's own new §9 row forbids. **Fixed at the source this time:** 2b is now a **superset of 2a's
>    key set**, all eight keys matched case-insensitively **anywhere** in the message, with the round-2
>    vocabulary retained verbatim so nothing previously caught is now missed. All eight mid-sentence
>    keys return **3**; all eight at line start still return **1**; the byte-freeze claim is superseded
>    in place because the freeze was the reason the invariant could not hold. Regression proof:
>    strengthening 2b changed **no** exit code on this branch, and both §2.2 override records still
>    match on the same lines they quote. The full measured matrix is now a committed artifact at
>    **§2.3** of that document, so the next reviewer re-runs it instead of trusting it. **Two
>    consecutive passes over-claimed this control; the lesson recorded is that a control described more
>    strongly than it behaves does not get run, which is the `5076a07a` failure mode itself.**
> 2. **A "0 AI / agent / `Co-Authored-By` tokens ✅" row sat two rows above the record of two commits
>    that trip the token scan.** [`PRE_BUILD_REVIEW_OP75.md`](handoffs/op75/PRE_BUILD_REVIEW_OP75.md)
>    §9 asserted the clause unqualified, while the same table recorded `2e5cd2dd` and `7331a0cf` at
>    exit **3 OVERRIDE_REQUIRED** and §2.2 quotes both matched lines verbatim. A reviewer trusting the
>    identity row would conclude the branch-wide token scan is clean — the exact state the override
>    records exist to deny. Split: envelope identity is unconditional across all commits; the token
>    result is now stated **head vs branch** separately and points at the override records. **Current
>    head PASS is never again conflated with ancestor history.**
> 3. **The "every commit on this branch" row enumerated five of six.** It hardcoded
>    `5c2f0057 · 6871b5bf · 2e5cd2dd · 7331a0cf · "this pass's head"`, and the fourth pass edited that
>    very table without refreshing it. This is the identical class the fourth pass fixed in §4 of the
>    assertion document by replacing *"all four commits"* with a `git rev-list` command — the remedy was
>    applied to one surface and not to the row that most depends on it. Replaced with the mechanically
>    derived `git rev-list --reverse <base>..HEAD` loop plus the invariant (**every commit returns 0 or
>    3; every 3 carries a §2.2 override record**) and no count. The adjacent self-reference note's SHA
>    inventory, which omitted three commits, is corrected the same way.
> 4. **The count-drift control the fourth pass added to prevent silent drift was itself silent.** Its
>    verify command was `grep -rniE '\b(eight\|nine\|ten)\b…'` — with `-E`, `\|` is an *escaped literal
>    pipe*, so the pattern searched for the literal text `eight|nine|ten` and returned **zero hits**,
>    exiting 1. The neighbouring row is correct because it is BRE; the escaping was carried into an ERE.
>    Fixed to real alternation, **re-run, and the hits adjudicated in place** rather than treating any
>    hit as failure.
> 5. **A stated command whose stated output could not reproduce.** Defect 3 of the fourth pass above
>    asserted `grep -rn 35670f2a` → 0 hits; writing the finding down created 2 self-referential hits.
>    Corrected and scoped in place at that bullet.
> 6. **`"Now nine."` read as present tense in a document whose count is ten.** The fourth pass named
>    and superseded the *"nine paths"* rollback string but left this one unmarked. Marked superseded
>    in place at item 4 of the second-pass block above.
>
> **Nothing was rejected from this review.** All six findings reproduced exactly as described on first
> attempt, and reproducing defect 1 surfaced no additional silent-pass key beyond the seven named.
> **`Codex` returned CLEAN on the same head; that verdict is not treated as evidence** — six defects
> were measurable, so a clean second opinion only shows the class is hard to see by reading. This pass
> is the first of the five to change the **executable** gate rather than the prose describing it.

> **CORRECTED A SIXTH TIME at the sixth remediation pass (2026-07-28).** A sixth independent review at
> exact head `e9887fc8` re-derived the whole evidence surface and confirmed it: all eight 2a keys at
> line start → `1` and mid-line → `3`, neutral → `0`, wrong identity → `1`, 2a/2b coupling complete,
> the branch-wide loop `0`-or-`3` with exactly the two recorded overrides, the canonical R124 digest
> `0afb8191a6f59807bc9fc1aef39d68a2`, one `VERDICT:` line per report on its true final line, the
> relative-link sweep with zero broken, and head/tree/parent/base/date/identity matching GitHub and
> local git. It found **no P0 and no P1**, and **one P3 plus three defects this pass volunteers as the
> same class**. Named here, not erased (R5/R132):
>
> 1. **The fifth pass wrote a hand-maintained commit count into the very record created to abolish
>    hand-maintained commit counts.** §2.3 table E and the `current-state.json` mirror both ended
>    *"and the **four** exit-0 commits still return 0"* — true only while the branch had six commits,
>    and false the moment the fifth pass's own commit landed. Both now state a command plus an
>    invariant that **carries no branch count**: every SHA returned by
>    `git rev-list --reverse b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD` exits `0` or `3` and never
>    `1`; the exit-3 set **is** `{2e5cd2dd…, 7331a0cf…}` — stated as membership with its own
>    derivation command, not as a tally — each member carrying a §2.2 override record quoting its
>    matched line verbatim; every other SHA the command returns exited `0`
>    at capture — a set defined **by subtraction**, so it cannot go stale as the branch grows.
>    *(**Wording corrected again at the seventh pass.** This bullet, and the §2.3 table E it describes,
>    both said the invariant carried "no cardinality on **either** side" and then said "**exactly
>    two** SHAs exit 3" in the next breath. The evidence was always sound — both SHAs are named, so
>    that side is an enumeration, and the staleness-prone exit-0 side really is count-free — but the
>    word "either" over-claimed, inside the very record written to abolish over-claimed counts. Now
>    scoped to the side it holds for.)*
> 2. **P3 as filed — the PR body's synthetic-case total double-counted `Signed-off-by`.** The body
>    reported **23** cases with **5** footer/decoration forms. §2.3 table C has **four** rows; the
>    phantom fifth was `Signed-off-by: X <x@users.noreply.github.com>`, already counted among table B's
>    eight line-start keys. It exercises check 3's forbidden-trailer arm as well, but **exercising two
>    checks does not make it two cases**. Corrected to **22 cases / 4 footer forms** in the body, and
>    §2.3 now carries the total *with the instruction to re-derive it* rather than the bare digits.
> 3. **A control was standing in for a guarantee it never made.** The §9 row titled *"No active prose
>    carries an independent artifact count"* was read — including by the passes that wrote it — as a
>    general count-drift control. Measured, its ERE matches one shape only: the spelled words
>    `eight`/`nine`/`ten` near the literal token `path`. It returns **zero hits** for
>    `four exit-0 commits`, `23 synthetic gate cases`, `10 paths changed` and `seven commits`. So it
>    could not have caught defects 1 or 2, and the row's title said otherwise. Renamed to
>    **"Path-label wording scan"** with its measured blind spots stated, and a **separate general rule**
>    added beside it (below) to cover what no grep can enumerate. **A control's title must describe
>    what it reads, because the title is what reviewers trust.**
> 4. **`pr_28_head` named a capture-time tip as if it were the current head.** The key predates this
>    remediation and read as *the* PR head while actually holding `5c2f0057…`, the head that was
>    reviewed as **input**, several remediation commits back
>    (`git rev-list --count 5c2f0057cd0ba4f5cba3b2dd2e6e718927549650..HEAD`, which is where that number
>    belongs — the prose said "**five**" until the seventh pass removed it rather than re-increment it).
>    Renamed to **`pr_28_reviewed_input_head`** in
>    both labelled mirrors, each carrying a note recording the rename, that no consumer breaks
>    (verified by `grep -rn pr_28_head`, which now returns only the notes), and that the **canonical
>    R124 six-line block is deliberately unchanged** because its labels are md5-pinned. The old name is
>    **not** retained as a data key: retaining a misleading name is the defect, so R5/R132 is satisfied
>    by preserving it in prose inside the rename note instead.
>
> **Rule adopted this pass — active cardinality claims are command-derived at review time.** No grep
> can enumerate the counts in a prose corpus, so this is stated as a rule rather than a pattern, and it
> deliberately **introduces no number of its own**: active prose may state a count only when the command
> that returns it sits beside it, so a reviewer re-derives instead of trusting digits. A count with no
> adjacent command is a defect **even while it is still correct**, because correctness is the transient
> state. Where the count is not load-bearing, prefer a command plus a cardinality-free invariant. This
> applies to every noun, spelled or in digits — paths, commits, cases, controls, findings, rules.
> Numbers preserved as superseded history are exempt, being quoted and labelled as such. The "eight
> keys" figure is now itself derived from the script by a committed command in §2.3, and the 2a/2b
> coupling rule is likewise **executable** — a `comm -23` that must return the empty set.
>
> **Nothing was rejected from this review.** The single filed P3 reproduced exactly as described. The
> other three were found by turning the reviewer's own method — *re-derive, do not re-read* — on the
> fifth pass's corrections, which is how three of the six passes have found their worst defects.
> **The recurring class is now explicit: every pass so far has introduced at least one defect inside the
> artifact it wrote to fix the previous pass's defect.** Defects 1 and 3 of this pass are that class in
> its purest form — a stale count inside the anti-stale-count record, and a mis-titled control inside
> the control-titling review.

> **CORRECTED A SEVENTH TIME at the seventh remediation pass (2026-07-28).** A seventh independent
> review, and the class held for the seventh time: **the sixth pass broke a citation with the very hunk
> that fixed the sixth review's naming defect.** Named here, not erased (R5/R132):
>
> 1. **A pointer drifted into a *different record*, which is worse than drifting into nothing.** The
>    sixth pass's rename hunk added one line near the top of
>    [`BASELINE_HEADS_OP75.json`](handoffs/op75/BASELINE_HEADS_OP75.json) and shifted everything below
>    it by one. Two citations in this log located `open_blockers_ref` and `B3.sev_note` at `:292` and
>    `:296`; they became `:293`/`:297`, and `:296` **still resolved — inside blocker `B2`**. A citation
>    that lands on a neighbouring record reads as correct to anyone who does not open the file, so it
>    is strictly more dangerous than one that dangles. **Both line citations are withdrawn** in favour
>    of `jq` property paths, which resolve or do not and survive every reflow. The substantive claims
>    were never affected: the command
>    `jq -e '.open_blockers_ref.B3.sev_note' handoffs/op75/BASELINE_HEADS_OP75.json` prints the quoted
>    sentence verbatim and exits `0`.
> 2. **The §9 control that existed to catch exactly this over-stated its own coverage.** Its title
>    claimed *"every internal `file:line` citation re-derived"*; the command beside it greped only the
>    Lens A finding headings, so no citation into a JSON file was ever within reach. Fixed by
>    **replacing the prose control with an executable one** — [`verify-citations.sh`](handoffs/op75/verify-citations.sh),
>    the eleventh path in the table below. It resolves every anchored in-repo `path:line` and asserts
>    the line is in range, **rejects** line citations into JSON outright (a JSON line number is
>    verifiable for existence but never for correctness — precisely how `:296` survived), reports
>    backend targets without failing them, and reports unanchored `` `:N` `` refs for
>    ACTIVE-vs-HISTORICAL classification. It uses the gate's own three-state idiom: **0 PASS / 1 FAIL /
>    3 CLASSIFY_REQUIRED**. This is the second pass in a row to replace a control that was believed to
>    run with one that does. **A control's coverage must be executable, not asserted** — the sixth pass
>    fixed a control's *title*; this one fixes the fact that it was prose at all.
> 3. **A self-contradiction inside the record written to abolish counts.** §2.3 table E said the
>    invariant carried *"no cardinality on **either** side"* and then, one bullet later, *"**exactly
>    two** SHAs return 3"*. The evidence was always sound — both SHAs are named, so that side is an
>    enumeration, and the exit-0 side genuinely is count-free — but the word *"either"* claimed more
>    than what sat beneath it. Now scoped to the side it holds for, with the exit-3 side restated as
>    **set membership plus its own derivation command**.
> 4. **Two more hand-maintained totals, both already stale or heading there.** The rename note said
>    *"five remediation commits have landed since"* (now `git rev-list --count`), and the
>    `current-state.json` mirror said *"the first of the **five** passes"* — an ordinal that goes stale
>    on every subsequent pass. Both removed rather than re-incremented. The same note claimed a
>    `grep -rn pr_28_head` sweep *"returns only this note"*, singular, while several notes record the
>    rename; this log already had it right in the plural. The claim is now **structural**:
>    run the command
>    `for m in handoffs/op75/BASELINE_HEADS_OP75.json handoffs/op74/BASELINE_HEADS_OP74.json handoffs/importer-wave/current-state.json; do jq --arg k pr_28_head '[paths|.[-1]|strings|select(.==$k)]|length' "$m"; done`
>    → it prints `0` for each mirror, which is the property that actually matters and cannot be
>    miscounted. *(Eighth pass: previously printed without its `--arg` ordering, its loop or its file
>    arguments, so it read as a command but could not be run as one.)*
> 5. **The `Signed-off-by` synthetic case is now marked in the table itself.** It overlaps three
>    classes — line-start key, footer/identity form, `users.noreply` address — and a reader
>    re-deriving the total from the tables could reasonably place it in table C and reach 23. The row
>    now says, in the table, that it is **counted once, in `2K`**, and table C says why it is
>    deliberately absent from there. `K=8 C=4 D=2 total=22` re-derives unchanged.
>
> **One defect this pass was self-inflicted and caught by running the rule.** The first draft of
> correction 1 above opened with *"the fifth time a pointer in this log has drifted"* — a
> hand-maintained count, written into the correction that removes hand-maintained counts, in the same
> edit session that removed two others. It was replaced before commit. That is the class in its purest
> form yet, and it is recorded rather than quietly dropped because **the pattern is now predictive: the
> most likely place for the next defect is inside this block.**

> **CORRECTED AN EIGHTH TIME at the eighth remediation pass (2026-07-28).** An eighth independent review
> at exact head `22d5914b` re-derived the head/parent/tree/base, the branch ancestry and SHA-role table,
> the R124 digest, the `jq` pointers, `changed_files`, the relative links and the R138 canonical
> questions, and found no contradiction in any of them. It found three defects, and **the prediction in
> the block immediately above held: two of the three were inside the artifacts the seventh pass wrote to
> fix the seventh review.** Fixed forward; nothing rewritten.
>
> 1. **The newest-wins mirror's active membership list contradicted its own note.** `current-state.json`
>    → `…files_touched` still published the ten-path set while `…files_touched_note` directly beneath it
>    named `handoffs/op75/verify-citations.sh` as an additional path and GitHub reported the higher
>    `changed_files`. This is not preserved history: the array is the **active machine-readable
>    membership list**, so a consumer reading it received the wrong artifact set while the prose beside
>    it was right. The array is now the verbatim output of
>    `git diff --name-only b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD`, the superseded array is kept
>    at `…files_touched_prior_ten_path_set_stale_op75_third_through_seventh_pass` and the superseded note
>    at `…files_touched_note_stale_op75_seventh_pass` (R5/R132), and the new note **states no number at
>    all**. The lesson generalises past this record: **a correction that updates the prose and leaves the
>    machine-readable field behind has not been made** — the field is what consumers read.
> 2. **The citation control shipped at the seventh pass could not detect the defect it was written for,
>    and did not read two of the files it was written about.** Both halves are the same mistake made
>    twice at different scales.
>    - **Coverage.** Its `ARTIFACTS` list held six markdown files. `handoffs/importer-wave/current-state.json`
>      and `handoffs/op75/BASELINE_HEADS_OP75.json` both changed on this branch and both carry live
>      in-repo `path:line` citations — and neither was read. The control was therefore blind to citation
>      drift in a JSON mirror, **which is precisely the drift that produced the seventh review's
>      finding.** Both are now in scope, and both are read through `jq` rather than `grep`. **Scoped to
>      what was measured:** a JSON string may spell a citation using `\uXXXX` escapes for its leading
>      characters, and raw `grep` over the file bytes then matches the escape text instead of the
>      filename — on a synthetic input, `grep` returns the unresolvable token `u0030-AUDIT-…`, which the
>      script would silently downgrade to an unresolvable cross-repo reference and never check, while
>      `jq` decodes the string first and returns the real filename. **Neither mirror contains an escaped
>      citation at this head** — checked, and the check returned nothing — so this is a robustness
>      property demonstrated on a constructed case, **not** a defect observed in the tree, and it is
>      recorded that way rather than as a discovery.
>    - **Strength, and this is the more important half.** The script asserted that a cited line number
>      fell **within the target file's line count**. Insert one line above a cited finding and every
>      pointer below it shifts by one while every one of them remains comfortably in range: **a range
>      check returns PASS on exactly the mutation that motivated it.** A control that cannot fail on its
>      own motivating case is worse than no control, because a reviewer trusts it. Replaced with
>      **content pinning**: each anchored in-repo citation is pinned by the SHA-1 of the text at that
>      span in [`CITATION_LEDGER.tsv`](handoffs/op75/CITATION_LEDGER.tsv), re-digested on every run, so
>      drift changes the content and therefore fails. An **unpinned** citation now fails too — otherwise
>      "unverifiable" quietly reads as "fine". **Proven by mutation, side by side, not by argument.**
>      One line was inserted above the first Lens A finding
>      (`sed -i '133i …' handoffs/audit-reports/P0-AUDIT-A-5076a07a.md`) and both scripts were run
>      against that identical tree: the seventh-pass script exited **3** reporting
>      `anchored_in_repo_broken = 0` and all eight citations verified — it called the mutated tree
>      clean — while the eighth-pass script exited **1** reporting `anchored_content_drift = 8`. Note
>      the eighth-pass run **also** reported `anchored_broken = 0`: the range check passes on this
>      mutation even inside the new script, which is the measurement that shows the range check was
>      never the thing doing the work. The insertion was then reverted and the clean run reproduced
>      exactly. **A control must be demonstrated failing on its own motivating case before it is
>      believed** — that demonstration is what the seventh pass omitted, and stating the intent of a
>      control is not evidence that it has that effect.
> 3. **Prose defects that restated cardinalities their own framing rejected, or printed output as if it
>    were a command.** §9's branch-gate row declared its invariant *"not a list and not a count"* and
>    then said *"Exactly two commits return 3"* one sentence later; the evidence was correct but the
>    sentence contradicted the row and would go stale on the next override. It now names the **set**
>    `{2e5cd2dd…, 7331a0cf…}` beside the loop that re-derives it, with no cardinality word. Separately,
>    three `jq` snippets in this log were printed **without their file argument**, so they read as
>    commands but could not be run as written; each is now a complete command with its output labelled
>    as output. The conclusions drawn from them were and remain correct — the defect was in the
>    labelling, which is what a reviewer re-runs.
>
> **The adjudication of the citation control's exit 3 is now recorded rather than implied, because the
> PR body and §9 had drifted apart on it** — the body said classification was outstanding while §9 said
> it was done. Both now say the same thing, and the ledger is the evidence: every unanchored `` `:N` ``
> reference is classified `BACKEND_EXCERPT` (quoting a backend file at the audited SHA `5076a07a`, not
> resolvable in this repo by construction) or `FROZEN_CORRECTION` (R5/R132 prose quoting a number an
> earlier pass saw, where renumbering would rewrite the record the rule preserves). **None is a live
> claim about this tree.** Exit 3 is terminal and accepted **only** on that evidence: the script emits a
> distinct accepting text when its own unclassified tally is zero, and `DO NOT ACCEPT THIS EXIT`
> otherwise. Because each `ADJ` record is keyed on a digest of the citing text, editing that text voids
> the classification and reopens it as a failure — a judgement that can go stale is one that must be
> able to expire.

> **CORRECTED A NINTH TIME at the ninth remediation pass (2026-07-28).** A ninth independent review at
> exact head `382e0a17` re-ran every control in this branch and reproduced every figure in the PR body,
> including the side-by-side mutation proof that the eighth pass rests on. It found no defect in the
> citation machinery. **It found the defect one layer above it: two of the §9 control rows were
> invisible on github.com.** Fixed forward; nothing rewritten.
>
> 1. **Two control rows were silently truncated by the Markdown renderer, at the exact point where they
>    hand the reader the command to re-derive their claim.** In GitHub-Flavored Markdown a pipe
>    character delimits a table cell **even inside a code span**, and any cell beyond the header's
>    column count is **discarded** — no warning, no ellipsis, no diff. Two §9 rows carried shell
>    pipelines with bare pipes, so the renderer cut one mid-command and cut the other after nine
>    characters of its verify command, destroying its entire body: the measured-scope paragraph, all
>    three permitted classification classes, and an R5/R132 correction record. **A reviewer on
>    github.com saw a green tick with its evidence invisible.** That is this branch's own defining
>    failure — *a control a reader trusts* — reappearing in the **presentation** of the controls rather
>    than in the controls themselves, and **eight passes of running the commands could not detect it,
>    because the bytes were correct and only the rendering was not.** Remedy: every executable command
>    in §9 is lifted out of the table into a named fenced block (`V1`–`V7`), which has no cell
>    semantics, and each row now references its anchor. The shell text is copy-pasteable **and** the
>    prose is visible; neither correctness is traded for the other.
> 2. **The defect class is now an executable control, not a resolution.**
>    [`verify-rendering.sh`](handoffs/op75/verify-rendering.sh) enforces the structural rule that
>    decides the whole class — *a table row may not produce more cells than its header defines* —
>    offline and deterministically over every markdown file this branch changes, and with `--render`
>    confirms the conclusion against **GitHub's own `/markdown` API** by asserting that the tail of
>    every table row survives into the rendered output. Tails are **derived from each row**, never
>    hand-listed, so the probe cannot go stale the way an enumerated list would. If `--render` is
>    requested and cannot be performed the script **fails**, because an unavailable check is not a
>    passing check. Its first useful act was to reject **the row announcing itself**: the first draft of
>    that row spelled two pipes literally while describing the pipe defect, and the gate discarded it.
>    Recorded because a control that catches its own author on its first run is the only kind of
>    evidence this branch accepts.
> 3. **The rule-numbering row published a command that could not run, and the correction record beside
>    it blamed the wrong layer.** The fourth pass had unescaped its pipes to fix a regex bug; the eighth
>    pass re-escaped them; under `-E` a backslash-escaped pipe is a **literal pipe**, so the token scan
>    matched nothing and the subtraction pipeline died with `grep` reporting `No such file or directory`
>    for a pipe it had been handed as a filename. The two conventions cannot both be right, because the
>    dialects disagree: in ERE the escape is a literal, in BRE it **is** the alternation, and in a table
>    cell the unescaped form is destroyed by the renderer. **This is why the fenced block is the fix and
>    the escaping debate is not** — but fencing alone is not sufficient either, and this pass proved
>    that on itself. Two of the blocks written **during this pass**, `V5` and `V6`, were lifted out of
>    their cells with the escape correctly dropped and **`-E` not added**. In BRE an unescaped pipe is a
>    literal, so each searched for its own pattern as a one-line string and matched exactly one line:
>    **the block quoting itself.** `V5` published `9, 0, 0` where the true per-surface totals are
>    `12, 21, 3`, and `V6` claimed 16 hits where the command returned 1. Both were caught by **running
>    them at this head**, not by reading them — a pass that had only proofread its own remedy would
>    have shipped two fresh broken commands inside the fix for broken commands. The rule that survives
>    is narrower than "use a fenced block": **pick one dialect, state it, and put it where the renderer
>    cannot rewrite it.** Both commands now carry `-E` and their published outputs are the measured
>    ones. Both commands now sit in `V2` with valid unescaped ERE alternation
>    and real shell pipes, executed at this head: the token scan returns **106** lines and the
>    subtraction leaves a residue of **7**, every line of which is classified in the block. The residue
>    was **not** driven to zero by widening the exclusion list, because that would make the control pass
>    by making it blinder. The row-315 correction record is amended to name **Markdown cell escaping**
>    as the reason rather than leaving the escape blanket-condemned.
> 4. **The R161 phantom inventory undercounted itself inside a STOP-condition block, and contradicted
>    the rule file it defers to.** Standing Op-74 wording said the phantom is *"cited once, in
>    `DECISION_LOG.md`"*; this branch had added statements naming a *different* singular site,
>    `R3_MERGE_RUNBOOK.md` line 6, with no supersession note. **Both singular claims are false.** The
>    citation is carried as an authority at three live sites — the Op-58 merge-runbook entry in this
>    log, the `R3_MERGE_RUNBOOK.md` header, and the `supersession_note` scalar in `current-state.json`
>    — and the third had never been annotated at all, in a file this branch edits heavily. Every live
>    site is now **annotated in place**, original wording retained verbatim (R5/R132); both "cited once"
>    claims are named as superseded **by re-derivation** rather than deleted; and no surface restates
>    the set, because a hand-maintained inventory inside a governance file is precisely what went stale.
>    All of them point at `git grep -n 'per R6/R161'` instead, with the caveat that the same command
>    also returns diagnostic quotations and the annotations themselves, so its hits must be **read**,
>    not tallied. **Nothing about R161 itself changes: it still does not exist, its substance is still
>    carried by R6 alone, every citation is still read as R6, and no R161 rule text is invented
>    anywhere.**
> 5. **`AGENT_RULES.md` edit scope, stated per the footer rule that requires this entry.** Exactly
>    **one** line is added to that file by Op 75: a single additive bullet in the **§13** header block,
>    immediately beneath the existing R161 phantom bullet, which is **retained verbatim and not
>    rewritten**. It supersedes only the navigational claim *"cited once, in `DECISION_LOG.md`"* and
>    points at the re-derivation command. **No rule body, no rule number, no operator quote and no
>    enumeration is altered; no rule is added, removed or renumbered; R127–R129 remain permanently
>    absent (B6).** Verify the scope rather than trusting this paragraph:
>    `git diff --stat b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD -- AGENT_RULES.md`. *(The file
>    carries mixed line endings — several hundred CRLF lines among its total — so it must be edited in
>    byte mode; a text-mode write normalises them and produces a whole-file diff that buries the one
>    real change. That happened once during this pass and was reverted before committing.)*
> 6. **Three defects inside the eighth pass's own citation script.** All are corrected, and the one with
>    a measurable symptom is now guarded by a mutation test the script runs on itself.
>    - **The ledger format header disagreed with the parser it documents.** The header printed the `ADJ`
>      fields in a different order from the order on disk, while the reader keys on field 2 and takes
>      its value from field 3. The data and the parser always agreed; the **documentation** of them did
>      not, which is how a future editor writes a record the reader silently misreads. The header now
>      states the on-disk order for both record kinds.
>    - **`json_line_citations` was double-counted for citations targeting a `.json` file from inside a
>      JSON artifact** — charged once by the anchored check and again by the caller re-scanning the same
>      scalar. Injecting **one** citation reported **two**. The verdict was unaffected, but a control
>      whose entire purpose is that its numbers can be trusted must not inflate them. Fixed with an
>      explicit consumed-flag, and locked in by a new **`--self-test`** mode that injects one citation
>      at byte level, asserts the tally is exactly one, restores the file and **refuses to run at all**
>      if the target already has uncommitted changes. Proven side by side on one mutated tree: the
>      committed eighth-pass script reported `json_line_citations = 2`; this one reports `1`.
>    - **The escaped-citation comment demonstrated the opposite of its claim.** Its "with escapes"
>      example printed the **decoded** form, so it could not show the thing it existed to show, and it
>      asserted a property against a condition that does not arise here. Rewritten to the measured
>      facts: neither mirror contains a single `\uXXXX` escape at this head, the check that establishes
>      that is printed, and it is noted that the check **exits 1 while reporting zero** — which is
>      `grep` saying "no match", not an error. Stated because a zero from a command that also signals
>      failure is exactly the sort of result an earlier pass wrote down without running. The `jq`
>      reading is then framed as what it is: a **structural** guarantee that holds whether or not
>      escapes are present, not a defect discovered in the tree.
>
> **What the ninth pass changes about how this branch verifies itself.** Every previous pass verified
> its artifacts by **executing what they contained**. That is necessary and it is not sufficient: it
> reads the bytes, and a reader reads the rendering. Nine passes, nine times a defect landed inside the
> artifact written to fix the previous pass — and this time it landed in a layer no previous control
> could see. The remedy is not vigilance but a **gate**, which is why this pass ships one rather than a
> promise to check. **A control is not verified until the form a reader receives it in has been
> verified.**

**Files touched (context repo) — exhaustive, and this is the one place the membership list is
authoritative rather than restated.** The heading no longer spells a number at all *(eighth pass: it
read "Eleven paths at the seventh pass", which is a hand-maintained cardinality embedded in a
heading — correct when written, stale on the next pass that adds a path, and preserved here as the
superseded wording per R5/R132)*. Per the general rule adopted above, the count is taken from the
command rather than from prose:
`git diff --name-only b76d0962de53ce494fa8f869a706ff0c15aee0b6..HEAD` (add `| wc -l` for the count;
live equivalent `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .changed_files`).
**If the command and this table disagree, the command wins and the table is the defect.** The table
below is the authoritative membership list; every other surface points here rather than recounting.

| Path | Change | Kind |
|---|---|---|
| [`handoffs/audit-reports/P0-AUDIT-A-5076a07a.md`](handoffs/audit-reports/P0-AUDIT-A-5076a07a.md) | rewritten at this pass | Lens A deliverable |
| [`handoffs/audit-reports/P0-AUDIT-B-5076a07a.md`](handoffs/audit-reports/P0-AUDIT-B-5076a07a.md) | rewritten at this pass | Lens B deliverable |
| [`handoffs/op75/PRE_BUILD_REVIEW_OP75.md`](handoffs/op75/PRE_BUILD_REVIEW_OP75.md) | **NEW** | per-Op reconciliation review (third record surface) |
| [`handoffs/op75/BASELINE_HEADS_OP75.json`](handoffs/op75/BASELINE_HEADS_OP75.json) | **NEW** | four audited head pins, both-ways verified |
| [`handoffs/op75/OWNERSHIP_AND_LADDER_OP75.md`](handoffs/op75/OWNERSHIP_AND_LADDER_OP75.md) | **NEW** | ownership/ladder **pointer + delta** (no canonical text copied) |
| [`handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md`](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md) | **NEW** | preventive R3 identity gate — doctrine, exit-code contract, override schema (§2.1), live override records (§2.2) |
| [`handoffs/op75/r3-identity-gate.sh`](handoffs/op75/r3-identity-gate.sh) | **NEW at the third pass** — the tenth path | the gate as an **executable** script (mode `100755`), operator-invoked; **not** a git hook, **not** a CI check, outside `src/`, 0 production LOC. Canonical over the fenced mirror in the `.md`. |
| [`handoffs/op74/BASELINE_HEADS_OP74.json`](handoffs/op74/BASELINE_HEADS_OP74.json) | **additive correction only** — `superseded_in_part_by` + `repos.backend.op75_corrections`; the false B2 string preserved **verbatim** | Op-74 pin, newest-wins |
| [`handoffs/importer-wave/current-state.json`](handoffs/importer-wave/current-state.json) | Op-75 mirror; all prior wording preserved under `*_stale_op74` / `*_prior_op74` keys | machine-readable state |
| [`handoffs/op75/verify-citations.sh`](handoffs/op75/verify-citations.sh) | **NEW at the seventh pass, rewritten at the eighth** | the citation control as an **executable** script (mode `100755`). The seventh-pass version replaced a §9 prose row that claimed a coverage its command did not have, but it only **range-checked** line numbers — which cannot detect a line inserted above a citation, the exact drift it was written for. It now **content-pins** every anchored in-repo citation, reads both changed JSON mirrors through `jq` (escaped citations included), rejects JSON line citations, and adjudicates unanchored refs against the ledger. Three exit states, `r3-identity-gate.sh` idiom: **0** PASS · **1** FAIL (drift, unpinned, out-of-range, JSON line citation, stale ledger) · **3** CLASSIFY_REQUIRED. **3 is the terminal state at this head, and the script prints a distinct text saying so only when nothing is unclassified.** |
| [`handoffs/op75/CITATION_LEDGER.tsv`](handoffs/op75/CITATION_LEDGER.tsv) | **NEW at the eighth pass** | inert data read by the script above: a `PIN` record per anchored in-repo citation holding the SHA-1 of the text at that span, and an `ADJ` record per unanchored `` `:N` `` reference holding its class keyed on a digest of the citing text — so editing the text voids the adjudication instead of silently carrying it forward. |
| [`handoffs/op75/verify-rendering.sh`](handoffs/op75/verify-rendering.sh) | **NEW at the ninth pass** | the rendering control as an **executable** script (mode `100755`). Check **A** is the gate: offline and deterministic, it rejects any table row that produces more cells than its header defines, which is the whole defect class and is decidable from the bytes alone. Check **B**, under `--render`, confirms that conclusion against GitHub's own `/markdown` API by asserting the tail of every row survives — tails derived per row, never hand-listed. `--render` requested and unavailable is a **failure**, not a skip. Two exit states: **0** PASS · **1** FAIL. |
| [`AGENT_RULES.md`](AGENT_RULES.md) | **additive correction only, one line** — a single §13 bullet beneath the R161 phantom bullet, which is retained verbatim | rule file. **No rule body, number, quote or enumeration altered.** Scope stated in the ninth-pass block above and verifiable with `git diff --stat b76d0962…..HEAD -- AGENT_RULES.md`. |
| [`handoffs/importer-wave/R3_MERGE_RUNBOOK.md`](handoffs/importer-wave/R3_MERGE_RUNBOOK.md) | **additive correction only, one line** — the third live `R6/R161` site annotated in place at the ninth pass; line 6 retained verbatim | merge runbook; doctrine and mechanics unchanged |
| `DECISION_LOG.md` | this entry | narrative log |

**No product repo touched. No history rewritten — no force-push, no rebase, no amend, no branch deletion. No flag flipped. 0 production LOC.**

### Baseline verified both ways (R124)

**Non-canonical mirror.** The single canonical R124 BUILD MATRIX is the six-line block reproduced verbatim identically at the top of [Lens A](handoffs/audit-reports/P0-AUDIT-A-5076a07a.md) and [Lens B](handoffs/audit-reports/P0-AUDIT-B-5076a07a.md); the machine-readable pin file [`handoffs/op75/BASELINE_HEADS_OP75.json`](handoffs/op75/BASELINE_HEADS_OP75.json) is likewise a labelled mirror. If any surface disagrees with the two reports, **the reports win**. *(Prior wording called the JSON pin file "canonical", which created two competing canonical surfaces — R5/R132.)* Each head below was fetched from the GitHub API **and** resolved locally; both agreed at capture (`2026-07-27T21:30:00Z`).

**Self-reference constraint.** No row below, and no committed Op-75 artifact, names the current tip of `docs/op75-p0-audit-5076a07a`: an immutable file cannot contain the SHA of the commit that contains it. `5c2f0057` is the **prior review input** (audit-execution SHA), `6871b5bf` the **remediated content input** (first-remediation tip), `b76d0962` the **stable PR #28 base**. The exact live head, parent and tree are attested in the **PR #28 body** — mutable metadata that does not alter any git SHA — and verifiable with `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq '.head.sha'` against `git rev-parse HEAD`.

| Repo | Head | Tree | Parent | Drift off the Op-74 pin |
|---|---|---|---|---|
| `growth-project-backend` | `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` | `ba056fff8e760f3e1a12ed628c808c104ec5be0d` | `07ff974079eb1da02f1de4f5ecd18c1f223afeae` (single) | **none** |
| `tgp-agent-context` | `b76d0962de53ce494fa8f869a706ff0c15aee0b6` | `2847e9cf26ed7ff3d400ed491e89d0c3d1170bed` | `9c25a06736867d613622e19beca4f71fb42c62db` | expected — the Op-74 landing itself |
| `growth-project-mobile` | `a5933fd6de5616493de75f0db907098b149b955c` | `fc34a95ec33d582ccf9cc9f976c079d776513ff9` | `e3a824f335ef75934fe860165ffc9c41a7b7956b` | **none** |
| `tgp-importer-extension` | `95be0222df3d47d787566743c8781005d8fbec69` | `3725abcba7aad497f28b85322557663cb152bb80` | `4f116836ddb5449524dd51e995a7e4c012f79493` | **none** |

**No INFRA_DEATH.** Reviewed branch head is `5c2f0057cd0ba4f5cba3b2dd2e6e718927549650`, parent `b76d0962…` = live `main` = PR #28 `base.sha`. **The post-landing context SHA is deliberately not claimed anywhere** — an artifact cannot record the SHA of the commit that lands it (Op-73/Op-74 precedent).

**Backend CI at `5076a07a`:** `build-and-test`, `CodeQL JS/TS`, `Deploy app`, `mwb-3-live-tests`, `rls-floor-guard`, `rls-live-tests`, `comment` **GREEN**; `build-sbom` + `release-please` **RED but pre-existing and diff-independent** (blocker **B4**, quarantined, never folded into a product PR).

### Verdicts and the R14 bar

- **Lens A** (correctness / security / RLS) — `FINDINGS — 0 P0 · 1 P1 · 3 P2 · 2 P3`
- **Lens B** (process / contract / ops / governance) — `FINDINGS — 0 P0 · 2 P1 · 2 P2 · 2 P3`
- **Combined — 0 P0 · 3 P1 · 5 P2 · 4 P3.**

**R14 CLEAN is 0 P0–P3. That bar is NOT met and is NOT claimed.** Two of the three P1s *are* blockers **B1** and **B2** — the audit's own subject matter, not new defects.

**0 P0.** The three most dangerous properties of a globally-mounted guard hold, and were verified by execution rather than assumed: **flag-OFF hard no-op** (`dunning-lockout.guard.ts:80`), **unauthenticated passthrough** (`:93-94`), **fail-open on lookup error** (`:99-105`). No path can mass-lock on a TGP-side fault. `FEATURE_DUNNING_V2` is default-OFF, so **no finding is live**.

### Measured budgets — the "not measurable" claim is superseded

An earlier pass deferred these as unmeasurable. They are now measured at this exact head from the commit's own patch (4 files, +395/−48):

| Budget | Rule | Measured | Verdict |
|---|---|---|---|
| Production LOC | R23 / R76 (≤400) | **56** (`src/app.module.ts` +29, guard +27) | PASS |
| test:src ratio | R74 (≥2.0) | **6.05:1** (339 test LOC ÷ 56) | PASS |
| Banned-cast net additions | R75, counted across **`src/` + `test/`** | **net 0** | PASS |
| Test evidence | R14 Q4 | **37 unit + 10 e2e = 47** | recorded |

R131 names *"R75 misread as src-only"* as this wave's failure mode; the count above is the full `src/` **plus** `test/` count, stated so it cannot be re-narrowed.

### Findings and dispositions — twelve, none fixed here

Every code finding lives in `src/checkout/**` or `DunningState` — **W-DUN territory**, on the W-IMP MUST-NOT-TOUCH list. Repairing them inside `P0-AUDIT` would breach Op-74 §1 and stop-condition §5.2. `P0-AUDIT` **records and routes**:

| Finding | Sev | Disposition | Executable now? |
|---|---|---|---|
| A P1-1 — **two** unintended routes reachable while locked out — `/api/scheduling/auth/google/initiate` and `/api/scheduling/auth/google/callback` (`isAllowedWhileLocked` second-segment clause, `dunning-lockout.guard.ts:163`) | P1 | **DUN-1** | yes |
| A P2-1 — the `billing` carve-out does not cover `v1/coach/me/billing` (LOCKED) while it does cover `coach/billing/status` + `coach/billing/portal-session` (REACHABLE **by design**) | P2 | **DUN-1** | yes |
| A P2-2 — `status: 'active'` narrows the lockout read: `findFirst({ where: { …, status: 'active' } })` (`dunning-lockout.guard.ts:127-140`) against `status String @default("active")` with no enum or CHECK (`prisma/schema.prisma:3785`), so **any other string silently un-locks a client whose `locked_out_at` is still populated** — a billing/entitlement **state-machine** defect | P2 | **DUN-1** | yes |
| A P2-3 — `locked_out_at` unindexed on a per-request hot path (`prisma/schema.prisma:3815`, indexes `:3824-3826`) | P2 | **DUN-1** (index) / **DUN-4** (SLO) | yes |
| A P3-1 — two dead recovery allow-list prefixes (no controller) | P3 | **DUN-3** | yes |
| A P3-2 — `lockout_copy` (`:112-119`) discarded by the shared envelope at `src/filters/not-found-envelope.ts:12-38` | P3 | **BLOCKED — ownership decision first** (see below) | **no** |
| B P1-1 — **R3-INC-4** identity (blocker **B1**) | P1 | record only + [preventive gate](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md) | N/A |
| B P1-2 — missing R14/R138 evidence (blocker **B2**) | P1 | **discharged on landing of PR #28**; the table-driven test-shape requirement → **DUN-1** | yes |
| B P2-1 — `FEATURE_DUNNING_V2` in **no** registry | P2 | **DUN-1** (register the flag); the fleet-wide blind-spot audit needs its **own R138 gate** | yes / no |
| B P2-2 — no declared p99, no error budget, no transition record for a universal-path guard | P2 | **DUN-4** | yes |
| B P3-1 — budgets now measured, superseding the "not measurable" claim | P3 | **no rung — measurement *is* the remedy** | N/A |
| B P3-2 — backend branch protection absent (`branches/main/protection` → 404, blocker **B3**) | P3 | ops track | no |

**No finding blocks the W-IMP ladder.** All are preconditions of **Gate B**, not of `I1`.

**Three corrections to earlier routing, all material:**

1. **Lens A P3-2 was routed to `DUN-9`, which is a *mobile* rung** ([Op-74 §3](handoffs/op74/OWNERSHIP_AND_PR_LADDER.md): *"Re-engagement UX + Roman-voiced surfaces"*). A mobile rung cannot change a backend error envelope, so the routing was **unexecutable, not merely suboptimal**. Root cause: **`src/filters/**` appears on neither workstream's OWNS list nor either MUST-NOT-TOUCH list** — it is an **unowned cross-cutting backend surface**. Required order: (i) assign `src/filters/**` in Op-74 §1, or declare it a shared surface with a named serialization point as §2 does for `app.module.ts`; (ii) route the fix to an **authorized backend rung** (candidate `DUN-4`, else a fresh R138-gated rung); (iii) `DUN-9` **consumes** the envelope, never produces it. Until (i) lands the finding is **recorded and blocked**, and Op 75 says so rather than inventing an owner.
2. **The row previously printed as "A P2-2 — no durable record of a lockout transition → DUN-4" described a finding that does not exist in Lens A.** The actual heading at [`P0-AUDIT-A-5076a07a.md:214`](handoffs/audit-reports/P0-AUDIT-A-5076a07a.md) is *"`status: 'active'` narrows the lockout read; a free-text status silently un-locks"*. *(**Line re-derived at the third pass** from the final 386-line file. This sentence previously cited `:183`, correct only at tip `6871b5bf` when Lens A was 355 lines; after the second pass added +31 lines above the finding, `:183` landed on the **P2-1** heading — making this a directly falsifiable claim at the very pointer whose job is to disambiguate Lens A P2-2 from Lens B P2-2. Verify: `grep -n '^### P[0-9]-[0-9]' handoffs/audit-reports/P0-AUDIT-A-5076a07a.md`.)* The durable-transition/observability finding is **Lens B P2-2**, and it is listed separately in the table above. The consequence was not cosmetic: the real Lens A P2-2 is a **state-machine defect** requiring a change to a Prisma `where` predicate and a schema constraint, which **`DUN-4` cannot make** — `DUN-4` is *"declared p99 + error budget, `AuditEvent` per transition, funnel metrics"* ([Op-74 §3](handoffs/op74/OWNERSHIP_AND_PR_LADDER.md)). Mis-transcribing the finding produced a second **unexecutable routing** of exactly the kind correction 1 above repairs for `DUN-9`. Correct owner: **`DUN-1`** (billing/entitlement state machine). Every routing index — this log, [`OWNERSHIP_AND_LADDER_OP75.md`](handoffs/op75/OWNERSHIP_AND_LADDER_OP75.md), [`BASELINE_HEADS_OP75.json`](handoffs/op75/BASELINE_HEADS_OP75.json), [`current-state.json`](handoffs/importer-wave/current-state.json) — carried the phantom row, so the real finding appeared in **zero** of them.
3. **The R107 citation attached to Lens B P2-2 is withdrawn.** *(Prior wording said "Lens A P2-2 / Lens B P2-2". `R107` occurs **zero** times in `P0-AUDIT-A-5076a07a.md` and **eight** times in `P0-AUDIT-B-5076a07a.md`; nothing was ever withdrawn from Lens A, and claiming otherwise invented a retraction. Verify: `grep -c R107` on both reports.)* R107 governs an `audit_log` row for PII-touching **mutations**, and `model AuditLog` already exists at `prisma/schema.prisma:1499`. A read-only 403 decision is neither a mutation nor PII-touching. The correct citations are **R86** (declared p99 before merge), **R99** (budget burn freezes the path), **R126** (telemetry as contract) and `R-DUNNING-BAR-1` **P5** / **DUN-E5**. Citing a rule that does not reach the facts weakens every other citation beside it.

**Lens B P2-1 is worth naming twice.** `FEATURE_DUNNING_V2` is absent from `prod-switches.yml` (226 switches), `.env.example` (892 lines) **and** `ENV_RULES`. R108's discovery scanner (`test/prod-readiness/env-discovery.ts:196`) is node-scoped to `process.env.*` / `process['env'].*`, but the flag is read as `env[…]` on a **function parameter** (`dunning-v2.feature.ts:34-36`) — so discovery never sees it, the registry is never exceeded, and CI stays green. The importer flags are registered with this exact read style spelled out; the master switch of a billing state machine has no row at all. No live risk (absent ⇒ OFF), but at **Gate B** the operator has no entry to flip.

### R3-INC-4 (blocker B1) — RECLASSIFIED; disposition unchanged

`5076a07a` is authored **and** committed as `BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>` — both wrong, not a committer-only slip, on the envelope of a money-path change already published on shared `main`.

**The reclassification is the substance of this finding.** R3-INC-1 (extension #5 `5eabeec`), R3-INC-2 (backend #509 `1718293`) and R3-INC-3 were **server-side merges**, where GitHub synthesizes the committer as `GitHub <noreply@github.com>` and the operator cannot set it. `5076a07a` is **not** that:

| Evidence | Implication |
|---|---|
| **Single parent** `07ff974079eb1da02f1de4f5ecd18c1f223afeae`, equal to PR #520 `baseRefOid` | a true **local squash** — no GitHub-synthesized merge commit |
| PR #520 `merged=false`, GraphQL `mergeCommit=null`; the REST `merge_commit_sha` `57b6d791c17296421cc31bfd3a1f4b75ed12cf45` is a GitHub **test-merge** that `compare/main...` reports as **diverged** (ahead 3, behind 1) | nothing GitHub produced is reachable from `main` |
| Committer is the operator's **own** GitHub noreply address, **not** `GitHub <noreply@github.com>` | the **forbidden server-side path was not used** |

So **the mechanism was right and the identity was wrong** — a different incident class with a different cause. Consequence: **the R3-INC-1/2/3 remedy (ban the merge button) was already in force here and was obeyed, so it cannot prevent a recurrence.** [`R3_MERGE_RUNBOOK.md`](handoffs/importer-wave/R3_MERGE_RUNBOOK.md) §1.4 already calls both identity checks MANDATORY and §3.3 already contains the exact asserts that would have caught this; `5076a07a` is proof they were not run. The runbook is **insufficient as written** — not incorrect, insufficient — because the assert is buried in a copy-paste block, produces **no artifact**, depends on **ambient identity**, and has **no server-side backstop** (**B3**). Remedy filed forward as [`handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md`](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md) plus the executable [`handoffs/op75/r3-identity-gate.sh`](handoffs/op75/r3-identity-gate.sh): a one-command gate that emits a pasteable evidence block and returns one of **three** machine-observable exit codes — **0** `PASS` (push permitted), **1** `HARD FAIL` (stop; no override exists), **3** `OVERRIDE_REQUIRED` (push only with the §2.1 append-only PR-body override record). The three-state design is deliberate: the round-2 single non-zero exit conflated a real co-author trailer with prose that merely quotes the banned vocabulary, which made the gate self-contradictory — its preamble said never push while its own note prescribed an override. Two commits on PR #28 hit that state, so both are now recorded under §2.2. **No check was weakened**, precisely: the new *attribution-position* scan **2a** adds hard failure the round-2 gate did not have for **canonical attribution positions**, and the same vocabulary outside those positions returns **exit 3** — an exact-SHA override requirement, never a silent pass. It is not claimed that every vocabulary form hard-fails; see §2 and the measured matrix at §2.3 of [`R3_IDENTITY_PREPUSH_ASSERTION.md`](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md). *(R5/R132 — superseded clause named, not deleted: this sentence previously read "the broad **2b** pattern is retained character-for-character as the backstop". At the fifth pass that byte-freeze was found to be the reason the "never a silent pass" claim was false — 2a listed eight trailer keys, the frozen 2b carried one, and the other seven exited **0** off line start, measured. 2b is now a **superset of 2a's key set** matched anywhere, case-insensitively, with the round-2 vocabulary retained verbatim; strengthening it changed no exit code on this branch. See fifth-pass correction item 1 above.)*

The doctrinal sentence to carry forward: **using the mandated git-native path proves the *mechanism* was compliant and proves nothing about *identity*; a landing is R3-clean only when both are separately asserted and separately recorded.**

**Disposition unchanged: `OPEN_ACCEPTED_NOT_FIXED`.** Rewriting published shared `main` is a larger integrity loss than the defect it repairs (R3-INC-1 precedent, R5). `origin/main` remains `5076a07a`, untouched. The commit *message* is clean — 0 AI / agent / Claude / Anthropic / `Co-Authored-By` tokens. **B1 stays open by design as a permanent historical marker, not a work item.**

### Blocker B2 — evidence corrected; **closes on landing, not before**

> **CORRECTED (newest-wins, R5/R132).** Op 74 recorded that *"no associated pull request found via the GitHub commits/pulls API, so no R14 dual-lens audit trail and no R138 Decision Record are discoverable for this landing."* That string is **preserved verbatim** at `handoffs/op74/BASELINE_HEADS_OP74.json` → `repos.backend.open_blockers[1]` and is corrected additively there, not deleted.

The endpoint statement was **literally true** — `commits/5076a07a…/pulls` does return an empty array — but the **inference was wrong**. That endpoint lists only PRs whose **head** is the commit, and `5076a07a` was never a PR head. **PR #520 exists**: `feat(dunning-v2): enforce Day-10 lockout by mounting guard in global chain` (head `dcb5812668a8e3d8f659e60931a4c51502be7b53`, base `07ff974079eb1da02f1de4f5ecd18c1f223afeae`) — *prior wording mis-transcribed this title as "…via global guard mount", which is the **landing commit's** subject, not the PR's; the two differ and were conflated (R5/R132)* — state: **CLOSED**, `merged=false`, `mergeCommit=null`, **zero reviews**, closed **36 seconds after** the landing commit. The audit trail was not absent because no PR existed; it was absent because **the git-native landing bypassed the PR, which was then closed unreviewed**. Inferring absence from one endpoint's silence is the error, and it is corrected rather than restated.

**B2's substance — missing R14 dual-lens evidence and a missing R138 Decision Record for a money-path change with product-wide blast radius — remains OPEN until this branch is reachable from `main`:**

| PR #28 state | B2 | `I1` |
|---|---|---|
| open / this branch unlanded | **OPEN** | **BLOCKED** |
| landed on context `main`, R3-clean, plain fast-forward | **CLOSED** | permitted |

Drafting the audit is not discharging it: until the landing commit is reachable from `main`, the evidence is not discoverable by anyone reading the repo, which is precisely what B2 asserts. **Reporting B2 closed, or the ladder open at `I1`, while this PR is unlanded is a status assertion without evidence and is itself a P0 finding** ([`R-DUNNING-BAR-1`](roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md) §2: *status is derived, never asserted*).

The retroactive [`R138 Decision Gate`](handoffs/audit-reports/P0-AUDIT-B-5076a07a.md) reconstruction also surfaced the **root cause** of Lens A P1-1: its verification evidence is **37 unit + 10 e2e = 47** cases, but every one asserts the allow-list against **hand-picked example paths**, never against the **mounted controller table**. A route that accidentally matches was therefore unobservable to review. *A table-driven test enumerating every mounted controller against the allow-list is a requirement on `DUN-1`.*

### Evidence URLs

- PR #28 (this branch) — https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/28
- PR #520 (the bypassed backend PR) — https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/520
- Audited backend commit — https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/5076a07a1e54b14e3db84d3aa128fb0bb44542d7
- Context `main` base — https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/b76d0962de53ce494fa8f869a706ff0c15aee0b6

### Required landing mechanism for PR #28 (non-negotiable)

1. **Git-native manual squash + plain fast-forward only** — [`R3_MERGE_RUNBOOK.md`](handoffs/importer-wave/R3_MERGE_RUNBOOK.md) §3. The only push is `git push origin <sha>:main`.
2. **`gh pr merge` is FORBIDDEN** in every variant (`--merge`, `--squash`, `--rebase`), as are the green UI button, the REST/GraphQL merge endpoints, and GitHub web edit/commit flows. They re-author the commit and violate R3.
3. **No `--force`, no `-f`, no `--force-with-lease`, no `+refspec`, no admin bypass, no temporary unprotect** — anywhere on `main`.
4. **Pre-push identity assertion is mandatory and must produce a recorded artifact** — [`R3_IDENTITY_PREPUSH_ASSERTION.md`](handoffs/op75/R3_IDENTITY_PREPUSH_ASSERTION.md). Author **and** committer exactly `Bradley Gleave <bradley@bradleytgpcoaching.com>`; 0 AI / agent / `Co-Authored-By` tokens.
5. **Post-push verification is mandatory and must be recorded** — remote tip equals the pushed SHA; `gh api …/commits/<sha>` author **and** committer emails both `bradley@bradleytgpcoaching.com`.
6. **Base pinned to `b76d0962de53ce494fa8f869a706ff0c15aee0b6`.** If live `main` has moved the plain push is a non-fast-forward and git rejects it — **that rejection is the drift guard**. Correct response: **STOP and re-audit at the new base.** Never force.
7. **Close PR #28 with a comment naming the landed SHA.** Do not click merge; `merged=false` is the expected end state, as with PR #510 / `1e6b3bf`.

### Rollback / stop

Additive governance documentation only — a forward-only `git revert` of the single landing commit removes **every path in the exhaustive "Files touched" table above**, whatever its current length. That sentence deliberately carries **no independent count**: the stale *"nine paths"* it replaces was written before `r3-identity-gate.sh` was added and became a fresh internal contradiction against the table in the same document (R5/R132 — the superseded number is named here, not silently dropped). The authoritative count is `gh api repos/BradleyGleavePortfolio/tgp-agent-context/pulls/28 --jq .changed_files`. **No product surface, no schema, no migration, no workflow, no flag, no runtime change to roll back.** `FEATURE_DUNNING_V2` is untouched and default-OFF: not flipped, not registered, not defaulted anywhere by this Op. **No history rewrite / force-push over shared `main`, in this Op or as a remedy for B1.** Reverting Op 75 does not reopen a repaired defect — it removes evidence: **B2 would revert to OPEN** and `I1` would re-block. That is the correct consequence, not a bug.

**Stop conditions in force:** drift off any [`BASELINE_HEADS_OP75.json`](handoffs/op75/BASELINE_HEADS_OP75.json) pin → INFRA_DEATH (R124) · a cited rule number outside `R1–R126` / `R130–R138` → STOP, never invent (`R127`–`R129` **do not exist**, **B6**, permanent; `R161` is a phantom and must be read as **R6** alone; it is carried at **more than one site**, so re-derive with `git grep -n 'per R6/R161'` rather than trusting a single location — R5/R132, superseding this clause's prior singular wording "cited at `R3_MERGE_RUNBOOK.md` line 6", which is named rather than deleted) · a finding routed to a rung that cannot execute it → re-route, do not improvise (triggered once, by Lens A P3-2) · a status asserted without evidence at a named SHA → P0 · no credentials, secrets or live DB access were needed or used · the two cross-cutting items (`src/filters/**` ownership, the injectable-env registry audit) each need their **own R138 gate** before anyone acts on them.

### Unresolved blockers carried forward

**B1** R3-INC-4 (P1, **open by design**, record-only, **reclassified** as *unasserted-identity*, preventive gate filed, no force-push) · **B2** missing R14/R138 evidence for `5076a07a` (P1, **remedy drafted; CLOSES ON LANDING of PR #28, not before**; blocks `I1` until then) · **B3** backend branch protection absent (404) + production secrets unwired (P1, blocks both activation gates; it is why nothing outside the operator's own terminal can reject a non-R3 identity) · **B4** `build-sbom` / `release-please` RED (P2, pre-existing, quarantined, confirmed not folded into the product commit) · **B5** email/transactional credentials unprovisioned (P2, blocks P4 / Gate B) · **B6** permanent `R127`–`R129` numbering gap (P3, documented, never renumbered).

### Effect on the ladder

**None yet.** `P0-AUDIT` evidence is produced but not landed, so **B2 remains OPEN and `I1` remains BLOCKED**. Op 75 adds no rung, removes none, renumbers none, reorders none, and dispatches none. It takes no backend write token (S3) and does not touch `app.module.ts` (S2). **All flags remain default-OFF. Nothing in this Op authorizes a build, a merge, a flag flip, a lane dispatch, or a completion claim.**

**VERDICT: FINDINGS — evidence produced, rung NOT discharged; 0 P0 · 3 P1 · 5 P2 · 4 P3 combined; R14 CLEAN not met and not claimed; B2 closes on landing of PR #28, not before; B1 open by design and reclassified; 0 production LOC; no history rewritten.**

---

## 2026-07-27 (Op 74) — PRODUCT-BAR RAISE + GOVERNANCE RECONCILIATION: autonomous site-agnostic/browser-agnostic importing supersedes the one-site v0.3 ceiling; hyperscaler-quality dunning becomes the product bar with ten platform obligations; four audited baseline HEADs pinned; six governance defects reconciled without rewriting history (docs/doctrine only; 0 product LOC; no build, no landing, no flag flip)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** (a) **Product-bar raise** via two new rulings (importer autonomy; dunning quality); (b) **governance reconciliation** of six defects; (c) **baseline pinning** of four audited HEADs; (d) **cross-repo doctrine** extension pointer. Documentation/doctrine only — **0 production LOC**. Audit-exempt per R14 scope (context-repo docs). **This Op RAISES THE BAR and RECONCILES; it does NOT build, land, flip a flag, dispatch a lane, or claim any product complete.**
**Governing decision:** executed under the standing **R138** autonomy grant. The mandatory five-part pre-build review (Idiot Index → explicit assumptions → lazy-senior simplification with no capability cuts → hyperscaler-quality scan → bottom-line decision) and the **R138 four-question decision gate** are recorded in full at `handoffs/op74/PRE_BUILD_REVIEW_OP74.md`. **Verdict: PROCEED — RAISE THE BAR, BUILD NOTHING YET.**

**Files touched (context repo):** `handoffs/op74/PRE_BUILD_REVIEW_OP74.md` (**NEW**), `handoffs/op74/OWNERSHIP_AND_PR_LADDER.md` (**NEW**), `handoffs/op74/BASELINE_HEADS_OP74.json` (**NEW**), `roadmap/rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md` (**NEW**), `roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md` (**NEW**), `roadmap/rulings/R-CROSS-REPO-AUTHORITY-2_2026-07-27.md` (**NEW**), `roadmap/rulings/R-RULE-AUTHORITY-1_2026-07-20.md` (additive forward pointer), `roadmap/specs/A02-import-tooling.md`, `roadmap/specs/A03-reengagement-dunning.md`, `AGENT_RULES.md` (**navigation metadata + two review-driven merge-doctrine corrections in R3 and R14** — see "AGENT_RULES.md edit scope" below), `handoffs/importer-wave/current-state.json`, `DECISION_LOG.md`. **Documentation/doctrine/state only; 0 production LOC.**

### Exact heads pinned (independently verified against GitHub at Op 74)

Canonical machine-readable pin: `handoffs/op74/BASELINE_HEADS_OP74.json`. Each SHA was fetched from the GitHub REST API at Op-74 time and compared to its repository's live default branch; **all four match live `main`.** Op 74 deliberately records these **once**, in one file, and links rather than re-transcribing (see the Idiot Index).

- **context** (`tgp-agent-context`): `9c25a06736867d613622e19beca4f71fb42c62db` (parent `ed5729af…`; R3-CLEAN). *Note: Op 73 recorded context head `ed5729a`, which was its own **parent** — a landing Op cannot record its own SHA. Op 74 pins the actual Op-73 tip.*
- **backend** (`growth-project-backend`): `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` (parent `07ff974…` = the Op-73 recorded head). **Advances ONE commit past Op 73.** Subject: `feat(dunning-v2): enforce Day-10 lockout via global guard mount, scoped to /roman/*`; +395/−48 across 4 files. **R3 VIOLATION — see R3-INC-4 below.**
- **extension** (`tgp-importer-extension`): `95be0222df3d47d787566743c8781005d8fbec69` (unchanged since Op 70; R3-CLEAN).
- **mobile** (`growth-project-mobile`): `a5933fd6de5616493de75f0db907098b149b955c` (unchanged since Op 67; R3-CLEAN).

**Backend CI at `5076a07a`:** `build-and-test`, `CodeQL JS/TS`, `Deploy app`, `mwb-3-live-tests`, `rls-floor-guard`, `rls-live-tests` **GREEN**. `build-sbom` + `release-please` **RED but PRE-EXISTING and diff-independent** (already RED on prior bases at Op 71/72), quarantined in their separate infra lane — **NOT product regressions**, and never to be folded into a product PR.

### DECISION 1 — Importer: autonomous, site-agnostic, browser-agnostic is the core product bar
Ruling `roadmap/rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md` (**NEW**). The **one-site v0.3 ceiling is superseded as a ceiling**; v0.3 remains valid and unrewritten as **the milestone it actually was** (first end-to-end validation of the generic pipeline through one interchangeable adapter on one host) and may never be cited to argue multi-site/multi-browser is out of scope. **Autonomy means a new site is onboarded as data/blueprint, never as core code** — the V5 **core-diff-zero** certification is promoted from one-time proof to a **permanent acceptance gate**. The no-adapter-specific-core prohibition (R-SITE-AGNOSTIC-1 §3) is **extended to browser hosts**. Acceptance evidence E1–E9 defined; **E9 (real-account live proof) is its own gate and remains DEFERRED** — E1–E8 do not discharge it. **All gates preserved unchanged and unweakened:** consent (user-authorized only, no access-control bypass), security (no source-credential storage on TGP servers, server-minted non-forgeable identifiers), **billing-capture exclusion (reaffirmed, widened with the site surface)**, honesty (fail closed on ambiguity; never claim inaccessible data was imported), audit (no `Deleted`/tombstone; erasure proven by cascade + fail-closed RLS), flags (default-OFF), rollback (forward-only, no history rewrite), evidence (R14/R74/R75/R76/R79/R80/R124/R3).

### DECISION 2 — Dunning: hyperscaler quality is the product bar; ten obligations assigned to the platform
Ruling `roadmap/rulings/R-DUNNING-BAR-1_2026-07-27.md` (**NEW**). Dunning is a **money-correctness surface** held to R1 at full strength. Ten obligations are assigned to the **platform** so no feature re-implements or silently omits them: **P1** deterministic billing/entitlement state (entitlement is a derived projection, never hand-set) · **P2** idempotent, ordered events (at-least-once, out-of-order safe; replay is a no-op; a late event never resurrects a settled state) · **P3** recovery (server-minted, single-use, expiring tokens with a real route) · **P4** communications (suppression, cadence caps, dedupe; settled state stops sends) · **P5** observability (declared p99 + error budget **before merge** per R86; `AuditEvent` per transition per R107; budget burn freezes the path per R99) · **P6** replay/backfill (provably side-effect-free dry-run before any live run) · **P7** operator tooling (inspect state/reason/history; audited time-boxed exceptions) · **P8** safe degradation (never mass-lock on a TGP-side fault; lockout requires **positive** evidence of delinquency) · **P9** security (webhook signatures, RLS isolation, no client-forgeable entitlement, no committed secret values) · **P10** audited rollout (flag-gated, R14 CLEAN, R138 Decision Record, cohort canary, auto-rollback). Each grounds in an existing rule; **no new rule is created.** **Status is derived from evidence, never asserted — asserting readiness without evidence at a named SHA is a P0 finding**, the standing remedy for the ~5 weeks A03 read "MOSTLY built" while its wiring was broken. **Gap ledger: 1 of 6 closed** (lockout guard mounted at `5076a07a`); five remain OPEN. **A3 remains PARTIAL; all dunning flags remain default-OFF.**

### DECISION 3 — Cross-repo doctrine: explicit by-reference authority pointer for the extension repo
Ruling `roadmap/rulings/R-CROSS-REPO-AUTHORITY-2_2026-07-27.md` (**NEW**), extending [`R-RULE-AUTHORITY-1`](roadmap/rulings/R-RULE-AUTHORITY-1_2026-07-20.md) (which remains **ACTIVE and unmodified in substance**; an additive forward pointer was appended). `tgp-importer-extension` was always in scope but had no quotable operational pointer of its own. The canonical authority is now stated explicitly: **`BradleyGleavePortfolio/tgp-agent-context` → `AGENT_RULES.md` @ `main`**, resolved by reference, no local duplication, **no invented text — a nonexistent cited rule is a STOP condition**. Parity with backend and mobile: no exception, no added burden. R3 binds the extension without qualification; the open **R3-INC-1** landmine remains recorded and **NOT rewritten**, and `95be0222` (first R3-clean extension landing) is the pattern to repeat.

### DECISION 4 — Ownership, serialization, ladder, gates
`handoffs/op74/OWNERSHIP_AND_PR_LADDER.md` (**NEW**) publishes, per **R4 clause 1**, collision-free OWNS lists for **W-IMP** (importer) and **W-DUN** (dunning). Overlap check finds **2 code collisions + 2 process collisions** (backend `app.module.ts`; backend linear history; shared CI budgets; context single-writer state) — everything else runs parallel. **Shared-backend serialization S1–S7**: one backend PR in flight at a time, `app.module.ts` as a serialization point, an explicit backend write token, per-PR (never pooled) CI budgets, owner-respecting contract freeze, serialized context reconciles, fully-parallel mobile/extension. **PR ladder** is dependency-ordered with **P0-AUDIT as a hard prerequisite to all backend work**, then W-IMP rungs I1–I7 (I1/I3 are the Op-73 BUILD-SMALLER slices carried forward unchanged) and W-DUN rungs **`DUN-1`–`DUN-11`** (namespaced; bare `D1`/`D2` remain the historical importer decisions). **Stop conditions** (universal + per-workstream), **acceptance evidence**, and **two independent activation gates** (Gate A importer, Gate B dunning — neither rides nor blocks the other) are published. **No rung is dispatched by this Op.**

### RECONCILIATIONS (newest-wins; history retained, never silently rewritten)

| # | Item | Finding | Resolution |
|---|---|---|---|
| 1 | **Op 74** | Did not exist; Op 73 was the highest | **This entry establishes Op 74.** |
| 2 | **Missing Op 70** | A complete `decision_record_op70_v5_complete_2026_07_21` exists in `current-state.json`, but **`DECISION_LOG.md` has no Op-70 entry** — the log jumps Op 71 → Op 69. A decision recorded in state but not in the log is half-lost (R5). | **Backfilled below in true newest-first date order** (between Op 71 and Op 69), clearly labelled as a **reconstruction from the surviving JSON record**, never presented as an original contemporaneous entry. |
| 3 | **Stale importer billing language** | `A02-import-tooling.md` still lists *"Billing migration: detect imported clients with active subs → prompt coach to set up equivalent Stripe Connect plans"* and a matching acceptance criterion. These **directly contradict** the R5-protected operator-verbatim billing-capture exclusion binding on both v0.3 and v1.0. | **Struck from scope** via an Op-74 newest-wins block quoting the operator verbatim. The bullets remain **visible as historical record, not deleted** — they are simply **not buildable**, and any brief citing them is defective. Explicitly **not** in tension with Decision 2: dunning governs TGP's **own** billing state, never source-site billing data. |
| 4 | **R138 vs the newest autonomy mandate** | Risk that Op-73's **BUILD SMALLER** verdict could be read as capping the product bar. | **Both stand.** R138's authorized slices (C1 → M5 → extension → gated pilot) survive **intact and unmodified** and are carried into the ladder as I1/I3/I2. **R138 governs how large a slice may be; R-IMPORTER-AUTONOMY-1 governs what the finished product must do.** A BUILD-SMALLER verdict may **never** be cited as evidence that the product bar is smaller. |
| 5 | **R161 miscitation** | **R161 does not exist and never has.** Cited once, in the 2026-07-16 Op-58 merge-runbook entry, as *"permitted only for `wip/*` snapshot branches per R6/R161"*. | The substance is fully carried by **R6** alone. **Annotated in place** at that entry and in the `AGENT_RULES.md` §13 header; the historical paragraph is **retained verbatim, not rewritten** (R5/R132). Per R-RULE-AUTHORITY-1 §4 a nonexistent cited rule is a **STOP condition, never a licence to invent**. *(R5/R132 — superseded wording named, not deleted, Op-75 ninth pass 2026-07-28: **"Cited once, in the 2026-07-16 Op-58 merge-runbook entry"** is superseded by re-derivation. The phantom is carried at **more than one site**; that entry is one of them, and this cell is not the inventory. The set is not restated here — a hand-maintained inventory is what went stale in the first place — so re-derive it with `git grep -n 'per R6/R161'` and read each hit as either a live citation or a diagnostic quotation of one. Every previously unannotated live site is now annotated in place. **R161 still does not exist, its substance is still R6 alone, and no R161 text is invented anywhere.**)* |
| 6 | **R86 overload** | "R86" carries **three** meanings: the canonical **SLO** rule; the legacy **LOC soft-cap** label (that file became **R23**; the `R86 EXCEPTION REQUESTED` string and `r86-exception-requested` tag survive only as historical names of the R23/R76 escape hatch); and a **typo** — one occurrence in the R118 rationale reads "R86 (PII)" when **PII is R98**. | **Disambiguation block added at R86's definition.** Cite **R23/R76** for the LOC cap, **R98** for PII, **R86** only for SLOs. No rule body edited. |
| 7 | **Rules header / range inconsistency** | Header claimed *"one continuous, gap-free enumeration (R1 → R107) … you will never hit a missing number."* Reality: rules extend to **R138**, and the enumeration is **not** gap-free — **R127, R128, R129 do not exist.** R-RULE-AUTHORITY-1 §1's "R1→R107 plus R109–R138" is also wrong (R108 exists). | Header **enumeration correction** added: the range in force is **R1 → R126 and R130 → R138**; the R127–R129 gap is **documented, never renumbered or fake-filled** (R5 lost-forever discipline). §13 carries a matching numbering note; the **§11 heading**, which read *"(R100–R107)"* while the section actually defines **R100 → R126**, is corrected with its original wording recorded rather than erased; R-RULE-AUTHORITY-1 §1 carries an additive correction with its original wording retained. |

### R3-INC-4 — NEW R3 IDENTITY VIOLATION (recorded openly, NOT silently fixed)
Backend `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` is authored **and** committed as `BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>` — **not** `Bradley Gleave <bradley@bradleytgpcoaching.com>`. This is a **hard R3 violation** on the commit envelope of a **money-path** change already published on shared `main`. **Status: OPEN_ACCEPTED_NOT_FIXED.** Following the **R3-INC-1 precedent**, a metadata rewrite is **deliberately declined**: force-pushing over already-published shared `main` is a destructive, provenance-altering operation. `origin/main` remains `5076a07a`, unchanged. **This is recorded, not hidden and not silently fixed.** Prospective fix: the identity-safe manual squash path in `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` for all future landings. Additionally, **no associated PR is discoverable** via the GitHub commits/pulls API, so **no R14 dual-lens audit trail and no R138 Decision Record can be found** for this landing — recorded as blocker **B2**, remediated by ladder rung **P0-AUDIT** (retroactive adversarial audit per R14's own failure-mode clause) before any further backend dunning work.

### AGENT_RULES.md edit scope (minimal, and now stated in full)

> **CORRECTED at the third review pass (2026-07-27).** This subsection previously read *"four **navigation-metadata** blocks only"* and asserted that *"no … How-to-comply … was added, removed, or altered."* **That was true when first written and became FALSE at the second review pass**, which required the merge-doctrine ambiguity to be closed inside R3 and R14 themselves. Both reviewers flagged the resulting self-contradiction against the disclosure further below. The stale wording is recorded here rather than erased (R5/R132); the accurate scope follows.

`AGENT_RULES.md` **was** edited this Op, in **two** categories.

**(a) Four navigation-metadata blocks** — the header enumeration correction, the R86 disambiguation, the §13 numbering/R161 note, and the §11 heading range correction (`R100–R107` → `R100–R126`, original wording recorded in place).

**(b) Two review-driven merge-doctrine corrections** — added at the second review pass because `AGENT_RULES.md` is the single rule authority, so an ambiguity that authorized the identity-unsafe landing path could only be closed at its source:

| Site | Change | Original wording |
|---|---|---|
| R3 *How to comply*, `AGENT_RULES.md:113` | The `gh pr merge` author-trailer bullet is **struck in place** and marked **SUPERSEDED as to production `main`**; `gh pr merge` is declared FORBIDDEN on `main`, with the trailer check retained for the scoped integration-branch case | Retained visible inline under `~~…~~` |
| R14 step 8, `AGENT_RULES.md:358` | `Only then: gh pr merge --squash --delete-branch` is **struck in place** and marked **SUPERSEDED as to production `main`**; step 8 now reads `Only then: land.` | Retained visible inline under `~~…~~` |
| R14, new block at `AGENT_RULES.md:360–369` | **LANDING-MECHANISM NOTE** added — six operative clauses (approval ≠ audit ≠ mechanism; git-native manual squash + plain fast-forward on `main`; no server-side squash / no `gh pr merge` on `main` in any flag combination; integration-branch exception explicitly scoped so it confers no authority over `main`; no force-push ever; repo-wide override of the historical `gh pr merge` instructions left in older handoffs and journals) | n/a — additive |

**What was NOT touched (mechanically verified at this head).** No rule was renumbered, added, or removed. No rule **headline** was altered. No **Failure mode** clause was altered. **No operator verbatim quote was added, removed, or altered** — R9(c)/R5 reserve that to the operator, and **every baseline line inside an `**Operator quote (verbatim…)**` section — including the R3 identity quote and the R14 auditor-gate quotes — is still present in the file, byte-identical to baseline `9c25a06`.**

> **No line count is asserted here, deliberately** *(third-pass review fix)*. An earlier draft of this paragraph claimed "all **25** operator-quote lines". That number was not wrong so much as **method-dependent and therefore brittle**: it counted blockquote lines beneath `**Operator quote` headers (25 at baseline **and** 25 now), whereas a reviewer counting quoted lines reasonably arrived at **24**, and a count of *all* blockquote lines in the file gives **52** at baseline and **102** now — the increase being the Op-74 correction blocks, which are annotations and not quotes. Three defensible methods, three different numbers, none of them load-bearing. The claim that matters is set-based, not cardinal, and is stated above and proven below.

**The proof is by exhaustion, not by counting.** Diffing this head against baseline `9c25a06` line by line, exactly **five** baseline lines were replaced across the entire Op:

1. `one continuous, gap-free enumeration (R1 → R107). Navigate R1 to R107 in order; you will`
2. `never hit a missing number.`
3. `- For `gh pr merge`, verify the resulting commit's author trailer is Bradley Gleave before the push completes.`
4. ``8. Only then: `gh pr merge --squash --delete-branch`.``
5. `## §11 — DEPLOY READINESS & ENFORCEMENT INFRA (R100–R107)`

Every other baseline line is carried through untouched. **None of those five is an operator quote, a `**Headline:**`, a `**Failure mode**` clause, or a `### R<n>` rule header** — which is what actually discharges the claims in this paragraph, under any counting convention. All five originals are retained visible in place (struck inline, or quoted inside a correction block); none was deleted. Every superseded string is retained visibly under R5/R132; nothing was deleted. Per the file's own footer, an `AGENT_RULES.md` change requires a corresponding DECISION_LOG entry — **this entry, together with the second-pass disclosure below, discharges that requirement.**

### Invariants preserved
`R3_MERGE_RUNBOOK.md` mechanics unchanged and unweakened; D2 (Op 59) unchanged; **importer billing-capture exclusion preserved and reaffirmed**; **all flags remain default-OFF**; **no live-data or completion claim**; mission remains site-agnostic/browser-agnostic (R-SITE-AGNOSTIC-1 reinforced, not replaced); `truth_boundaries.no_e2e_proof_yet` and the deferred real-account proof still hold; Op-73 R138 BUILD-SMALLER slices intact; historical prose **retained, not rewritten** (R5/R132); no product-repo code touched; no lane dispatched.

### Rollback / stop
Docs/doctrine/state only — forward-only `git revert` of this commit restores the Op-73 snapshot (no product surface, no flags, no runtime change). If any pinned SHA (context `9c25a06`; backend `5076a07a`, parent `07ff974`; extension `95be0222`; mobile `a5933fd`) later differs from GitHub live state, treat as **INFRA_DEATH** per R124 and re-verify before acting. **NO history rewrite / force-push over shared main.** This entry sets **BAR and SCOPE only**; every rung in the ladder requires its own exact-head dual-lens audit + CI before any landing, and live enablement is separately gated.

### Unresolved blockers carried forward
**B1** R3-INC-4 (P1, record-only, no force-push) · **B2** no discoverable R14 audit/R138 record for `5076a07a` (P1, blocks backend rungs until P0-AUDIT) · **B3** backend branch protection absent (404) + production secrets unwired (P1, blocks both activation gates) · **B4** `build-sbom`/`release-please` RED (P2, quarantined) · **B5** email/transactional credentials unprovisioned (P2, blocks P4/Gate B) · **B6** permanent R127–R129 numbering gap (P3, documented, never renumbered).

### Dual-review pass on PR #27 — six findings, all resolved in-branch (2026-07-27)

The Op-74 governance PR was itself adversarially reviewed before landing. **Verdict `CHANGES_REQUIRED`; all six findings are fixed on the same branch, forward-only, with history retained.** Recorded here because an audit that finds nothing is not evidence of quality (R10/§3).

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | Billing migration declared **STRUCK** in the supersede block, but the `What to build` and `Acceptance criteria` lists still presented both items as ordinary active scope — a live path for a future builder to treat source-site billing capture as buildable | **blocking** | **FIXED.** Both lines are now struck through **in place** and labelled **"STRUCK (Op 74) — HISTORICAL RECORD ONLY, NOT BUILDABLE"**, each pointing at the R5-protected exclusion. Text remains **visible, not deleted** (R5). |
| 2 | `current-state.json` still advertised `merge_policy: agent_may_squash_merge_after_dual_lens_clean_AND_CI_green` and an `R138_autonomy` field saying "Agent may squash-merge…", contradicting the Op-58 runbook and re-opening the exact ambiguity that produced R3-INC-1/2/3 | **blocking** | **FIXED.** Both fields now state the runbook-safe mechanism explicitly: **git-native manual squash + PLAIN fast-forward only; NO server-side squash; NO `gh pr merge` on `main`.** Each carries a `_note` recording the prior wording and why it was dangerous. Historical incident text in `r3_process_incidents`, `merge_procedure_change_2026_07_14`, and `op58_remediation` is **untouched**. R138 delegates the **approval**, never the **audit** and never the **mechanism**. |
| 3 | `repos.context` still pinned `ed5729a` while the Op-74 baseline is `9c25a06`; no `prior_tip_before_op74`; top-level `verdict` still Op-73-led | — | **FIXED.** `main_head` → `9c25a06`, `main_as_of` → its verified committer timestamp `2026-07-23T01:26:37Z`, `prior_tip_before_op74` added, and `ed5729a` retained as `prior_tip_before_op73_reconcile` with an explanation that Op 73 recorded its own **parent** (an entry cannot record the SHA of the commit carrying it). `verdict` is now **Op-74-led with the full prior verdict appended after `\|\| PRIOR:`**. `reconciliation_op73_2026_07_22` is **not edited**. |
| 4 | The backfilled Op-70 entry claimed to be "placed in date order" but sat **above** Op 73 | — | **FIXED.** Moved to true newest-first position (between **Op 71** and **Op 69**); the placement sentence now states the actual position and explicitly supersedes its own earlier claim. |
| 5 | `D1`–`D10` was used for **both** dunning ladder rungs and dunning acceptance evidence — and collided with the long-standing importer decision IDs `D1`/`D2` | — | **FIXED.** Rungs → **`DUN-1`–`DUN-11`**; evidence → **`DUN-E1`–`DUN-E10`**. Every cross-reference, dependency edge, blocker row, and **Gate B** condition updated. Both documents carry an ID-namespace note. **Bare `D1`/`D2` still mean only the historical importer decisions (Op 57 / Op 59) and were not renamed** (R5). |
| 6 | §11 heading read **"(R100–R107)"** while the section defines through **R126** | — | **FIXED.** Heading → **"(R100–R126)"**, with the original wording recorded in a correction block rather than erased, and a pointer to the R127–R129 gap. |

**What the review confirmed independently:** the four pinned baseline SHAs match live `main`; `5076a07a` is the current backend `main` head with **no associated PR** via the commits/pulls API; the modified JSON parses; internal Markdown links resolve. **Neither finding disputed any substantive claim** — both blockers were contradictory *operational instructions* left behind in high-signal artifacts, which is precisely the failure class R5 reconciliation exists to catch.

### Second dual-review pass on PR #27 — two blockers, both resolved in-branch (2026-07-27)

The revised head was re-reviewed. **Verdict `CHANGES_REQUIRED`; both findings fixed on the same branch, forward-only — no history rewritten, no force-push, 0 product LOC.**

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | The `DUN-*` de-collision was **incomplete**: `OWNERSHIP_AND_PR_LADDER.md` §4 still read `D1–DUN-10 → DUN-11` and DECISION 4 above still read "W-DUN rungs `D1–D11`" — reintroducing bare importer `D1` into the dunning ladder on two canonical summary surfaces | blocking | **FIXED.** → `DUN-1–DUN-10 → DUN-11` and → **`DUN-1`–`DUN-11`**. A repo-wide scan of Op-74 and canonical surfaces confirms the only bare D-IDs that remain are the **historical importer decisions `D1`/`D2`** (Op 57 / Op 59, deliberately unrenamed per R5) and the **explicitly-quoted superseded forms** inside the ID-namespace explanatory notes, where quoting the old ID is the point. |
| 2 | **This file's own authority** still authorized the forbidden path: `AGENT_RULES.md` R3 *How to comply* referenced `gh pr merge`, and R14 step 8 read `Only then: gh pr merge --squash --delete-branch`. Since `AGENT_RULES.md` is the single rule authority, the unsafe merge-path ambiguity was still live at the **highest-precedence** source | blocking | **FIXED at the source.** Both lines struck in place as **SUPERSEDED as to production `main`** with the original wording retained visible (R5/R132), plus a new **LANDING-MECHANISM NOTE** in §3 that is the operative statement of the merge path: autonomous approval never bypasses the dual audit (R138 delegates approval only — never the audit, never the mechanism); `main` lands via git-native manual squash + **plain fast-forward** per `R3_MERGE_RUNBOOK.md`; **no server-side squash and no `gh pr merge` on `main` in any flag combination**; the squash mechanism survives **only** on non-production **integration** branches and **confers no authority over `main`**; no force-push ever. `current-state.json` `merge_policy_note` / `R138_autonomy_note` updated to point at the note and to concede that **the note governs** on conflict. **These are the edits itemized in category (b) of "AGENT_RULES.md edit scope" above — that subsection is the authoritative statement of scope; this row records why they were made.** |

### Third dual-review pass on PR #27 — one blocker, resolved in-branch (2026-07-27)

Both independent reviewers returned the **same single finding**, and it was against this log rather than the doctrine.

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | The Op-74 audit trail **misstated its own `AGENT_RULES.md` change scope.** The file list said "navigation metadata only" and the edit-scope subsection said "four navigation-metadata blocks only … no How-to-comply … was altered" — accurate when written, but **falsified by the second pass**, which changed R3 *How to comply* (`AGENT_RULES.md:113`) and added an operative rule to R14 (`AGENT_RULES.md:358-369`). The second-pass disclosure above then contradicted it, so the log no longer truthfully preserved the scope of a change to the **authoritative rule file** | blocking | **FIXED.** File list → "navigation metadata **+ two review-driven merge-doctrine corrections in R3 and R14**". Edit-scope subsection rewritten into categories **(a)** and **(b)** with a per-site table, prefaced by a correction block that records the stale wording verbatim rather than erasing it (R5/R132), and cross-linked with the second-pass row above so the two are complementary, not duplicative. Only the **mechanically verifiable** narrower assertions are retained: no rule renumbered/added/removed, no headline altered, no Failure-mode clause altered, **no operator verbatim quote altered** (every baseline line inside an `Operator quote (verbatim…)` section is still present byte-identical to baseline `9c25a06`; proven by exhaustion — exactly five baseline lines were replaced across the whole Op and none is a quote, headline, Failure-mode clause, or rule header), all superseded wording retained visible. |

### Fourth dual-review pass on PR #27 — one blocker, resolved in-branch (2026-07-27)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | The third-pass self-correction introduced a **brittle hard-coded count**: both canonical surfaces claimed "all **25** operator-quote lines" are byte-identical. The number was method-dependent — 25 counts blockquote lines beneath `**Operator quote` headers, a reviewer counting quoted lines got **24**, and counting all blockquote lines gives 52 at baseline / 102 now. The substantive claim was correct; the count was not defensible as stated | blocking | **FIXED — count removed, not restated.** Both surfaces now make the **count-free, set-based** claim that *every baseline line inside an `Operator quote (verbatim…)` section is still present byte-identical to baseline `9c25a06`*, discharged by an **exhaustive five-line diff** that is enumerated in full in the edit-scope subsection above. The superseded "25" wording and the three conflicting counting methods are recorded rather than erased (R5/R132), so neither the 24-line nor the 38/52/102-blockquote observation can conflict with the wording. |

### Evidence URLs
Review: `handoffs/op74/PRE_BUILD_REVIEW_OP74.md` · Ladder: `handoffs/op74/OWNERSHIP_AND_PR_LADDER.md` · Baselines: `handoffs/op74/BASELINE_HEADS_OP74.json` · Context `9c25a06`: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/9c25a06736867d613622e19beca4f71fb42c62db · Backend `5076a07a`: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/5076a07a1e54b14e3db84d3aa128fb0bb44542d7 · Extension `95be0222`: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/commit/95be0222df3d47d787566743c8781005d8fbec69 · Mobile `a5933fd`: https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c

---


## 2026-07-22 (Op 73) — NEWEST-WINS RECONCILIATION + R138 BUILD-SMALLER PRE-BUILD REVIEW for coach/PT role-gated importer onboarding (docs/state only; 0 product LOC; authorizes two separately-reviewable slices C1+M5, no flag flip, no landing)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** (a) Documentation/state **newest-wins reconciliation** — latest evidence supersedes stale statuses across A1/A2/A3/A6 and the importer canonical state, **retaining historical prose (no silent rewrite)**; (b) an **R138 four-question pre-build review** of the new owner direction for role-gated onboarding, ruled **BUILD SMALLER**, authorizing two narrow, separately-reviewable slices. No product code changed in this Op; no `AGENT_RULES.md` edit. Audit-exempt per R14 scope (context-repo docs). **This Op RECONCILES + AUTHORIZES SCOPE; it does NOT build, land, flip a flag, or claim any product complete.**
**Governing decision:** the new owner direction — *"During onboarding, when a user self-selects as a PT/coach rather than a client, onboarding must lead through importer steps immediately before opening the app at large."* Encoded as a new ruling `roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md` (this Op).
**Files touched (context repo):** `roadmap/specs/A01-roman-p4-closeout.md`, `roadmap/specs/A02-import-tooling.md`, `roadmap/specs/A03-reengagement-dunning.md`, `roadmap/specs/A06-wearables.md`, `roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md` (**NEW**), `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`. **Documentation/state only; 0 production LOC.**

### Exact heads recorded (this reconciliation)
- **context** (`tgp-agent-context`): `ed5729af3ec117d1e671302d5d3ce5120c8ec1e2` (drift-verified live == local at reconcile time).
- **backend** (`growth-project-backend`): `07ff974079eb1da02f1de4f5ecd18c1f223afeae` **after H-Jobs PR #521 landed** (parent `4cb05eff` = the PR #519 tip; chain `9c1bcbd` @ Op 72 → `4cb05eff` @ #519 → `07ff974` @ #521). Backend `main_as_of` is an Op-73 observed-at refresh timestamp (`2026-07-23T01:14:04Z`), not the backend commit committer time (not independently fetched in this docs-only reconcile).
- **extension**: `95be0222df3d47d787566743c8781005d8fbec69` (unchanged).
- **mobile**: `a5933fd6de5616493de75f0db907098b149b955c` (unchanged).

### H-Jobs (PR #519, PR #521) engineering corrections — recorded, not re-litigated
The H-Jobs #519 landing carries an engineering correction: **`test-deploy-readiness` is the only PR-eligible required-check candidate**; the **strict release gate (`deploy-readiness-gate`) must NEVER be a PR-required status context** (it is skipped in PR mode by design). Because **branch protection is not applied** on backend `main` (`branches/main/protection` → 404) and **production secrets are not wired**, operational enforcement remains **operator/admin/secret-dependent** — the check exists in code but is not mechanically enforced at the gate. No claim that enforcement is live.

**PR #521 (operator-key generator / artifact repair) — recorded (refresh):** H-Jobs #521 landed backend `main` `4cb05eff → 07ff974`, a **deterministic operator-key generator / artifact repair**: **truthful runtime env names** (including `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`), valid **`readiness:keys` scripts + drift tests**, **empty-env generation**. **No secret values committed; no settings / branch-protection / credentials applied.** Operational enforcement remains **admin/secret-dependent** — this repairs the generator/artifact and env-name truthfulness only; it does NOT wire secrets or apply protection, and makes no claim that enforcement is live.

### AUTHORITATIVE SUPERSESSION MAP (newest-wins; historical prose retained)
| Item | STALE status (superseded) | NEWEST truth (this Op) | What remains |
|---|---|---|---|
| **A1** Roman P4 | "IN FLIGHT; N1 `recentPushes` + F1 MMKV gate OPEN" | **Structurally complete, default-OFF**; N1/F1 **CLOSED as coding tasks** | Live Postgres uniqueness+RLS spec (real DB); flag ownership/runbook/env registration; Stripe credential ops; payment-funnel analytics; authorized flag flip + live proof (operator-gated) |
| **A2** Import tooling | "NOT STARTED (ZERO)" | **Substrate built** across backend/extension/mobile; **V5 fixture proof complete**; fully **dark/default-OFF** | Real-account TrueCoach full-loop (UNPROVEN, fixture-only); multi-site autonomy LOW; operator-gated flag enablement + live proof |
| **A3** Re-engagement/Dunning | "MOSTLY built" | **PARTIAL — broken/absent wiring**, default-OFF | Mount lockout guard; wire V2 dispatcher/classifier caller; mint recovery tokens + route; bind mobile dunning API (currently hard-null); build re-engagement UX; provision email creds |
| **A6** Wearables | "3 of 6 adapters PROD; 3 outstanding" | **8 backend cloud OAuth adapters built but dark behind `FEATURE_WEARABLES_CLOUD_CONNECTORS`**; **3 mobile on-device modules built** | Backend on-device provisioning/normalizers; wire orphaned mobile nav/sync invocation; 4 providers formally DEFERRED; do NOT conflate with importer adapters |
| **A23 / A14 / Wallet** | (A14 collision earlier reconciled at PR #24) | A23 **Luxury Doctrine mobile overhaul landed planning-only** at context main `ed5729a`; **A14 remains AI Program Generation**; Wallet "Borrow Cash" doc exists byte-identically | Wallet remains **legal/licensing/counsel-gated**; A23 remains planning-only/audit-first |

### R138 FOUR-QUESTION DECISION GATE — owner direction (role-gated importer onboarding)
- **Q1 (Musk 5 — question/delete/simplify/accelerate/automate):** Question — do we need a *new* role concept? **No.** Delete — no client self-promotion path, no new role table; **reuse existing server-provisioned coach roles** (`coach`/`sub_coach`/`gym_owner`). Simplify — insert ONE importer step into the existing onboarding sequence for coach roles only; reuse existing importer UX. Accelerate — ship the smallest reviewable contract+mobile slices, not a monolith. Automate — last; no automation added here.
- **Q2 (hyperscaler practice):** Server-minted, durable, isolated session/intent identifiers (AWS-style opaque server-issued IDs; no client-forgeable role/intent). Onboarding is resumable and every step is skippable ("do later"), matching guided-setup patterns.
- **Q3 (GOOD without BAD):** GOOD = coaches are led through import before the app shell opens. BAD to avoid = client friction (clients **bypass**), permission-front/feature-dump anti-patterns (Luxury Doctrine P0), unescapable steps (every importer step supports Skip/Do-later + resume), live-data exposure (flags **default-OFF**, no flip), and privilege escalation (**no client self-promotion**).
- **Q4 (root cause):** Root need is *coach data migration at activation time*, not a UI tweak — so the durable fix is a **server contract** for paired-import intent, consumed by mobile onboarding, not a mobile-only shortcut that would re-derive trust client-side.

**VERDICT: BUILD SMALLER.** Authorize only the following separately-reviewable slices, in dependency order. **No flag flip; no landing authorized by this Op.**

1. **C1 — backend control-plane contract (FIRST).** Server-minted `intent_id` at pairing; a durable paired import session; secure echo/retrieval **compatible with existing token isolation**. Exact **extension compatibility must be addressed in the contract** (extension currently mints/carries its own intent). **No flag flip.** Separately reviewable.
2. **M5 — mobile onboarding (AFTER C1 contract frozen).** Insert the importer step **between Payments and Ready**, for **coach roles only**; **reuse existing importer UX**; **Skip/Do-later + resume**; safe **unavailable-state** handling (feature dark → graceful skip, no dead-end); **suppress the orphan review CTA**; **clients bypass**; **no role self-promotion**.
3. **Extension slice (AFTER C1 frozen, its OWN small slice).** Any extension change to consume the **server-minted** `intent_id` (instead of self-minting) is explicit and separate.
4. **Live-account pilot + flag enablement** remain **separately gated / operator-authorized** — NOT authorized here.

### Invariants preserved
`AGENT_RULES.md` not edited; `R3_MERGE_RUNBOOK.md` mechanics unchanged; D2 unchanged; billing exclusion preserved; **all flags remain default-OFF**; **no live-data completion claim**; mission remains **site-agnostic** (TrueCoach is one interchangeable validation adapter, R-SITE-AGNOSTIC-1); historical logs **retained, not rewritten**.

### Rollback / stop
This Op is docs/state only — forward-only `git revert` of the reconcile commit restores the Op-72 snapshot (no product surface, no flags, no runtime change). If any recorded SHA (context `ed5729a`; backend `07ff974` after #521, parent `4cb05eff`; extension `95be0222`; mobile `a5933fd`) later differs from GitHub live state, treat as **INFRA_DEATH** per R124 and re-verify before acting. **NO history rewrite / force-push over shared main.** This entry authorizes SCOPE only; C1/M5/extension builds each require their own exact-head dual-lens audit + CI before any landing, and live enablement is separately operator-gated.

### Evidence URLs
Ruling: `roadmap/rulings/R-ONBOARDING-ROLE-GATE-1_2026-07-22.md` · Context main `ed5729a`: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/ed5729af3ec117d1e671302d5d3ce5120c8ec1e2 · Backend H-Jobs PR #519: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/519 · Backend H-Jobs PR #521 (operator-key generator/artifact repair): https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/521

---

## 2026-07-22 (Op 72) — SCOUT READINESS LANDED: backend PR #518 registered three existing importer flags as default-OFF in production readiness (config/test-only, +48/−0, 0 prod LOC, no runtime change); narrow docs/state reconcile of a completed landing

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Documentation/state reconciliation of a completed backend landing (PR #518, realizing ruling `R-SCOUT-READINESS-1`). No product code changed in this Op; no `AGENT_RULES.md` edit; no new ruling. Audit-exempt per R14 scope (context-repo docs). **This Op RECORDS a completed leg** — it is NOT a new directional decision, authorizes NO runtime work, and does NOT claim the product complete.
**Governing decision:** ruling `roadmap/rulings/R-SCOUT-READINESS-1_2026-07-22.md` (filed Op 71, itself encoding the primary operator's R138 BUILD SMALLER pre-build review). This Op records the realized slice; it re-runs no directional gate and adds/changes no rule. **The ruling is now REALIZED/CONSUMED.**
**Files touched (context repo):** `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`. **Documentation/state only; 0 production LOC.**

**What landed (backend, reconciled here).** **PR #518** — the **Scout-readiness config/test slice** — landed on backend `growth-project-backend` `main` as **`9c1bcbd34ee0f8621d6e6a1838ac2fa6e5f76f90`** (base/parent **`ccb7e4008c32f3776542d7368d2058ead47ff812`** = the PR #517 formatter-baseline tip). **Config/test only, +48/−0 across exactly three files, 0 PRODUCTION LOC:** `prod-switches.yml` +24 (three new rows `FEATURE_SCOUT_INGEST`, `FEATURE_SCOUT_RECONSTRUCT`, `FEATURE_EXTENSION_PAIRING`, each `tier: feature`, `prod_default: OFF`, `auto_flip_on_in_prod: false`, `owner: importer`, one-line `description`; registry **223 → 226**) + `.env.example` +6 (`FEATURE_EXTENSION_PAIRING=false` added beside the already-present Scout flags; the two Scout flags NOT duplicated) + `test/deploy-readiness.spec.ts` +18 (ONE additive assertion loading the LIVE registry via `loadRegistry` and proving all three registered + `prod_default: OFF` + `auto_flip false`; no existing check weakened; no `.skip/.only/.todo`/snapshot). **NO `src/**`, NO `.github/**`, NO `package.json`/lockfile, NO OpenAPI/DTO/contract (`importer-openapi` 1.4.0 byte-identical, R80), NO DB/schema/migration, NO mobile/extension.** The three flags were **ALREADY live route gates in `src/`** at the pinned base (`feature-flag-not-found.middleware.ts`: `/api/scout`→`FEATURE_SCOUT_INGEST`, `/api/scout/reconstruct`→`FEATURE_SCOUT_RECONSTRUCT`, `/api/extension/pair`→`FEATURE_EXTENSION_PAIRING`; dynamic `process.env[route.envVar] !== 'true'` read) — this PR **REGISTERS** them only, activates nothing, and no route goes live (**R83 default-OFF invariant held**).

**Verified against GitHub (Op 72).** Both independent exact-head audits **CLEAN with no drift**. Live backend `main` == landed head == `9c1bcbd`; **single parent** `ccb7e400`; **tree `d2ade5bc776dcfbb759c377707a5b5eaae345291`**; **author == committer == Bradley Gleave <bradley@bradleytgpcoaching.com>**; subject `chore(prod-readiness): register Scout/importer flags default-OFF (R-SCOUT-READINESS-1)`; commit message **AI/co-author-token clean**; PR #518 **CLOSED** (`merged=false` — git-native commit-tree fast-forward, **NOT server-merged**). Audited branch head **`dfa3e8b945b5fab23a899638b1483f81ad5f4b5e`**. CI at the audited head: **13 product check-runs GREEN** (build-and-test, test-deploy-readiness, CodeQL JS/TS, danger, rls-live-tests, rls-floor-guard, mwb-3-live-tests, Banned cast tokens, LOC budget, Test density, comment-deploy-readiness, size-label, CodeQL) + **`deploy-readiness-gate` skipped** (expected in PR mode); **0 reds**. The only known reds remain the PRE-EXISTING diff-independent infra jobs (`build-sbom` + `release-please`) quarantined in their separate lane — NOT product regressions.

**Canonical state updated.** `repos.backend.main_head` **`ccb7e400` → `9c1bcbd`** (+ short/as_of/tip_msg/r3_note; `rollback_commit` → `ccb7e400`; `prior_tip_before_pr518` recorded); `decision_record_op72_scout_readiness_landed_2026_07_22` recorded (newest-first); `op_label` / `headline_status.current_op` / `verdict` advanced to **Op 72** (Op-71 headers retained verbatim for provenance); `successor_label` → **Agent 72**; `as_of_utc/local` → 2026-07-22. `repos.extension` (`95be0222`) and `repos.mobile` (`a5933fd`) **UNCHANGED**.

**Next frontier.** The Scout-readiness config/test slice is now **BUILT + LANDED + reconciled**; ruling `R-SCOUT-READINESS-1` is **REALIZED/CONSUMED**. **NO new build is authorized by this Op.** The broader v1.0 acceptance MENU (≥2nd browser host + ≥3 sites + luxury-UI polish; cross-run resume PR-C-RESUME; autonomous blueprint induction WS3; Op-63-deferred messaging) remains **pre-build-review-gated** exactly as at Op 70/Op 71 — the primary operator must run the next R138 four-question pre-build review to pick/scope the next lane. **Do NOT invent work; do NOT claim the product complete.**

**Rollback / stop.** Forward-only `git revert` of this reconcile commit restores the Op-71 snapshot (docs/state only; no product surface, no flags, no runtime change). If any recorded SHA (backend `9c1bcbd`/parent `ccb7e400`, audited head `dfa3e8b9`, tree `d2ade5bc`; extension `95be0222`; mobile `a5933fd`) later differs from GitHub live state, treat as **INFRA_DEATH** per R124 and re-verify before acting. **NO history rewrite / force-push over shared main.**

**Invariants preserved.** `AGENT_RULES.md` not edited (no rule added or changed); `R3_MERGE_RUNBOOK.md` mechanics unchanged; D2 decision unchanged; billing exclusion preserved; **all importer flags remain default-OFF**; production flags dark; **mission remains site-agnostic** — TrueCoach is only one interchangeable validation adapter (R-SITE-AGNOSTIC-1). Context reconcile lands R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** Backend PR #518: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/518 · Backend landed head `9c1bcbd`: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/9c1bcbd34ee0f8621d6e6a1838ac2fa6e5f76f90 · Backend base/parent `ccb7e400`: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/ccb7e4008c32f3776542d7368d2058ead47ff812 · Ruling: `roadmap/rulings/R-SCOUT-READINESS-1_2026-07-22.md`

---

## 2026-07-22 (Op 71) — SCOUT READINESS AUTHORIZED + PR #517 FORMATTER-BASELINE RECONCILE: register three existing importer flags as default-OFF in production readiness (config/test-only, 0 prod LOC, no runtime change); docs/state reconcile + one new ruling

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Documentation/state reconciliation of a completed backend landing (PR #517 formatter-baseline) + one new dated ruling authorizing a future config/test-only backend slice. No product code changed in this Op; no `AGENT_RULES.md` edit. Audit-exempt per R14 scope (context-repo docs). **This Op ENCODES, not decides** — it records the primary operator's own R138 pre-build review.
**Governing decision:** the primary operator's **R138 pre-build review** (ruled **BUILD SMALLER**), recorded verbatim in the new ruling `roadmap/rulings/R-SCOUT-READINESS-1_2026-07-22.md` (Idiot Index; Assumptions; Lazy senior developer; Hyperscaler scan = **AWS AppConfig** + **LaunchDarkly** flag-lifecycle governance, adopting *registered state* + lifecycle ownership, **declining** hosted targeting/variants/rollout; Top changes) + the R138 four-question gate. **Not a new directional pivot** — it authorizes a configuration/test-only slice within the already-decided importer wave, so no directional gate is re-run.
**Files touched (context repo):** `roadmap/rulings/R-SCOUT-READINESS-1_2026-07-22.md` (**NEW** — the authorizing ruling), `handoffs/importer-wave/current-state.json`, `DECISION_LOG.md`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **Documentation/state only; 0 production LOC.**

**What landed (backend, reconciled here).** **PR #517** — the **formatter-baseline** — landed on backend `growth-project-backend` `main` as **`ccb7e4008c32f3776542d7368d2058ead47ff812`** (base/parent **`d476fd6d5bdcfdfd3088723cbf625d3c28deced1`** = the V5 PR-3 #516 tip). It is **0 PRODUCTION LOC**: `.prettierignore` gains a path-specific ignore for `prod-switches.yml` (+3/−0, next to the existing importer-contract precedent; its semantic/schema validity stays enforced by the prod-readiness parser tests' js-yaml round-trip), and `test/deploy-readiness.spec.ts` is **Prettier 3.9.6 formatting-only** (+181/−39, line-wrap/trailing-comma reflow, **no logic edits**).

**Verified against GitHub (Op 71).** Live backend `main` == landed head == `ccb7e400`; **single parent** `d476fd6d`; **tree `e25c5ca0` byte-identical** to audited head `c8e3aca9931be3830baa9dc7b723b9764a117d42`; **author == committer == Bradley Gleave <bradley@bradleytgpcoaching.com>**; commit message **AI/co-author-token clean**; PR #517 **CLOSED** (`mergeCommit` null — git-native path, **NOT server-merged**). CI on `ccb7e400`: **build-and-test / CodeQL JS-TS / Deploy app / rls-live-tests / rls-floor-guard / mwb-3-live-tests GREEN**; `build-sbom` + `release-please` RED but **PRE-EXISTING and diff-independent** (both already RED on base `d476fd6d`) and quarantined in their separate infra lane — **NOT product regressions**, NOT folded into any product PR.

**What is authorized (future backend slice — NOT built this Op).** Ruling `R-SCOUT-READINESS-1` canonically authorizes **one** future PR owned by `growth-project-backend`, **config/test-only, 0 prod LOC, no runtime behavior change, no flag activation**, touching **exactly three files** in their existing schema/style: **(1)** `prod-switches.yml` — add three rows `FEATURE_SCOUT_INGEST`, `FEATURE_SCOUT_RECONSTRUCT`, `FEATURE_EXTENSION_PAIRING`, each `tier: feature`, `prod_default: OFF`, `auto_flip_on_in_prod: false`, importer-domain `owner`, one-line `description`; **(2)** `.env.example` — add `FEATURE_EXTENSION_PAIRING=false` beside the already-present `FEATURE_SCOUT_INGEST` / `FEATURE_SCOUT_RECONSTRUCT` block (do NOT duplicate the two present); **(3)** `test/deploy-readiness.spec.ts` — add **one** exact assertion proving all three flags are registered AND carry `prod_default: OFF`, reproducing counts from the registry itself. **INVARIANT:** `prod_default: OFF` + `auto_flip_on_in_prod: false` for all three; **default-OFF stays the invariant; no flag activated; no route goes live.**

**Forbidden in that slice (any one ⇒ STOP).** `src/**` / any production code; runtime behavior change or flag activation; `.github/**` / CI workflow; new secrets/SDKs/hosted flag services/runtime evaluators/targeting/variants/rollout; `package.json` / lockfiles; OpenAPI/contracts (`importer-openapi*`); DB/schema/migrations; `BL-MIGRATION-REBASELINE`; any mobile or extension file.

**VALIDATE-FIRST (build-agent obligation).** Re-verify the actual `src/` flag references + the exact `prod-switches.yml` row schema at build head before landing. (GitHub code-search returned 0 hits for the flag names under `src/`, treated as a **private-repo indexing artifact — NOT evidence of absence** — given the `.env.example` route-gate documentation and the landed IMPORTER-F/G/H/I surfaces.) The slice owes its own **exact-head dual-lens R14 audits to VERDICT: CLEAN** (config/test change is product-repo code, so **NOT R14-exempt**) + gates (R74/R75/R76/R80/R100/R124) + git-native R3 landing (author == committer == Bradley Gleave). **NOT dispatched this Op.**

**Canonical state updated.** `repos.backend.main_head` **`d476fd6d` → `ccb7e400`** (+ short/as_of/tip_msg/r3_note; `rollback_commit` → `d476fd6d`; `prior_tip_before_pr517` recorded); `decision_record_op71_scout_readiness_2026_07_22` recorded (newest-first); `op_label` / `headline_status.current_op` / `verdict` advanced to **Op 71** (Op-70 headers retained verbatim below for provenance); `successor_label` → **Agent 71**; `as_of_utc/local` → 2026-07-22. `repos.extension` (`95be0222`) and `repos.mobile` (`a5933fd`) **UNCHANGED**.

**Next frontier.** The **AUTHORIZED Scout-readiness config/test slice** above (owner `growth-project-backend`) — still **NOT built**. The broader v1.0 acceptance MENU (≥2nd browser host + ≥3 sites + luxury-UI polish; cross-run resume PR-C-RESUME; autonomous blueprint induction WS3; Op-63-deferred messaging) remains **pre-build-review-gated** exactly as at Op 70 — do NOT invent work beyond the authorized slice.

**Rollback / stop.** Forward-only `git revert` of this reconcile commit restores the Op-70 snapshot (docs/state only; no product surface, no flags, no runtime change). STOP conditions for the authorized build slice: any live SHA drift off `ccb7e400`; any registry schema mismatch wider than three rows / one env line / one assertion; any runtime or contract change creeping in; any need for credentials or DB/live access; any non-pre-existing CI regression (the two known infra reds do NOT count). **NO history rewrite / force-push over shared main.**

**Invariants preserved.** `AGENT_RULES.md` not edited (no rule added or changed); `R3_MERGE_RUNBOOK.md` mechanics unchanged; D2 decision unchanged; billing exclusion preserved; **all importer flags remain default-OFF**; production flags dark; **mission remains site-agnostic** — TrueCoach is only one interchangeable validation adapter (R-SITE-AGNOSTIC-1). Context reconcile lands R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** Backend PR #517: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/517 · Backend landed head `ccb7e400`: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/ccb7e4008c32f3776542d7368d2058ead47ff812 · Backend base/parent `d476fd6d`: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/d476fd6d5bdcfdfd3088723cbf625d3c28deced1 · Ruling: `roadmap/rulings/R-SCOUT-READINESS-1_2026-07-22.md`

---

## 2026-07-21 (Op 70) — V5 COMPLETE: the multi-adapter end-to-end proof finished (PR-2a #515 + PR-2b #8 + context ruling PR #20 + PR-3 #516)

> **⚠️ BACKFILLED ENTRY — reconstructed at Op 74 (2026-07-27), NOT an original contemporaneous record.**
> This Op-70 entry was **missing** from `DECISION_LOG.md`: the log jumped from Op 71 straight to Op 69. The decision itself was never lost — a complete record survived in `handoffs/importer-wave/current-state.json` as `decision_record_op70_v5_complete_2026_07_21`. Op 74 backfills it here **solely from that surviving JSON record**, so the log is gap-free and the decision is not half-lost (R5). **No new facts were invented, no claim was upgraded, and nothing was inferred beyond the JSON record.** Where the JSON is silent, this entry is silent. It is placed in **true newest-first date order** — between Op 71 (2026-07-22) above and Op 69 (2026-07-21) below — and clearly labelled rather than being passed off as an original entry (R5/R132: retain and annotate, never silently rewrite). *(Placement corrected at Op 74 review: the entry was first inserted above Op 73, which was NOT date order; the original claim to the contrary is superseded by this sentence.)* The authoritative source remains the JSON record.

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** PR-4 context docs/state reconcile of a **completed cross-repo stack**. R14-exempt (context docs), R3-clean plain non-force fast-forward. **Not a new directional decision.**
**Governing decision:** the Op-63 "Defer messaging" R138 gate + the Op-68 V5 stack lock + ruling `R-V5-PR3-1_2026-07-21`. **None re-run** — this records completed legs of an already-locked stack.

**Verified facts (as recorded in the JSON at Op 70).** PR-2a backend **#515 MERGED**, backend `main` `15ae9b25e7c1a778f579ce1823f3a24569484eef` (parent `8a860561`). PR-2b extension **#8 MERGED**, extension `main` `95be0222df3d47d787566743c8781005d8fbec69` (parent `4f116836`), **R3-CLEAN** author == committer == Bradley Gleave — **the first R3-clean extension landing**. Context ruling `R-V5-PR3-1` **PR #20** landed context `main` `f91cf34b861cb5a280ea139443d77a538e8dbf09`. PR-3 backend **#516 CLOSED** (git-native, **NOT server-merged**), landed backend `main` `d476fd6d5bdcfdfd3088723cbf625d3c28deced1` by **plain fast-forward** `15ae9b25..d476fd6d`, single parent `15ae9b25`, tree `f3717cc9f957674a016e70c17b7b95670620ffb3` **byte-identical** to audited head `ba4738d89d86d58f9b94279a7e40e6a7f44e91ae`, author == committer == Bradley Gleave, message AI/co-author-token clean. Mobile **UNCHANGED** at `a5933fd6de5616493de75f0db907098b149b955c` (PR-M4 #288).

**Audits.** Both PR-3 exact-head audits **CLEAN, P0=P1=P2=P3=0** (as reported by the backend build/audit lane); context ruling PR #20 was itself dual-lens CLEAN before landing. The PR-4 reconcile is docs/state and R14-exempt, but was self-swept for factual contradictions and R79-style failure categories.

**Certification.** **core-diff-zero PASS** — backend core `git diff` for adapter #2 == 0 except the single `source_platform → mapper` registry line; grep of core for `conformance_alpha` == 0; both conformance suites green. **V5 two-adapter deterministic cross-repo e2e PASS** through the **same unchanged reconstruct core** across TrueCoach + `conformance_alpha`. Byte-pinned extension fixture `test/fixtures/conformance/conformance-alpha.json.raw` sha256 `144c3c9f56cad1ae9cc875fe0c42862fef0d28603272693da7d20770d174cf4c` (git blob `c3b8af8`, 4280 bytes); spec `test/scout/reconstruct/conformance-alpha.e2e.spec.ts`; contract `importer-openapi 1.4.0` byte-identical (R80).

**HONEST BOUNDARY (recorded verbatim in the JSON, preserved here).** This certifies the **DETERMINISTIC-fixture path only**; a certified **REAL-ACCOUNT live full-loop run remains DEFERRED and is NOT claimed.**

**CI.** Backend post-merge on `d476fd6d`: `build-and-test`, `CodeQL JS/TS`, `Deploy app`, `rls-live-tests`, `rls-floor-guard`, `mwb-3-live-tests` all **success**; `build-sbom` **failure** (pre-existing, diff-independent infra lane).

**Why this matters to Op 74.** Op 70 is the certification that makes the Op-74 importer bar reachable: it proved the kernel is genuinely generic across two structurally different adapters with **core diff == 0**. [`R-IMPORTER-AUTONOMY-1`](roadmap/rulings/R-IMPORTER-AUTONOMY-1_2026-07-27.md) promotes that one-time certification into a **permanent acceptance gate**.

---
## 2026-07-21 (Op 69) — V5 PR-1 LANDED: the thin `source_platform → mapper` registry seam (frozen `SourceMapper`) landed on backend `main`, freezing the mapper interface and unblocking adapter #2; docs/state reconcile of a completed backend landing

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Documentation/state reconciliation of a completed backend landing (V5 PR-1). No product code changed in this Op; no `AGENT_RULES.md` edit. Audit-exempt per R14 scope — PR-1 itself was fully R14-audited at its own head.
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**) + the Op-68 V5 stack lock (`decision_record_op68_v5_stack_lock_2026_07_20`). **NEITHER re-run** — this records a completed leg of the already-locked stack, not a new directional decision. Executed under the standing R138 autonomy grant.
**Files touched (context repo):** `handoffs/importer-wave/current-state.json`, `DECISION_LOG.md`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `handoffs/importer-wave/V5_MULTI_ADAPTER_BUILD_BRIEF.md` (status advanced to PR-1 LANDED). **Documentation/state only.**

**What landed.** **V5 PR-1** — the thin `source_platform → mapper` registry seam — landed on backend `growth-project-backend` `main` as **`8a860561d5b7f8273e761dc9353d938cd02061a2`** (PR **#514**, base/parent **`f92a689838a0ae948e53f4cf4fad50991d17ec00`**), the **FIRST** PR of the Op-68-locked V5 multi-adapter stack and the **ONLY** prerequisite that unblocks adapter #2. It replaced the hard-wired `families.ts` dispatch with a **frozen `SourceMapper` seam** (interface `sourcePlatform` + `mapClient` + `mapEntity`, registry keyed by `source_platform`). **TrueCoach is the SOLE current registration and is NOT architecturally privileged.** **BEHAVIOR-IDENTICAL:** no behavior/family/flag/contract/DTO/schema/migration/OpenAPI/UI change; contract stays **1.4.0 byte-identical (R80)**.

**Landing (R3-clean, plain fast-forward).** Landed by a **PLAIN non-force fast-forward** (`f92a689..8a860561 → main`; **NO** force, **NO** `--force-with-lease`, **NO** admin bypass, **NO** server-side merge button, **NO** rebase). **INDEPENDENTLY VERIFIED against GitHub:** live backend `main` == audited head == PR #514 `mergeCommit` == `8a860561`; **single parent** `f92a689`; **author == committer == Bradley Gleave <bradley@bradleytgpcoaching.com>**; commit message **AI/co-author-token clean**; PR #514 **MERGED** (`mergedAt 2026-07-21T00:52:16Z`); source branch `feat/scout-source-mapper-registry` **safe-deleted** (verified gone). This is the **SIXTH** R3-CLEAN backend-main git-native landing (after #508, IMPORTER-F #510, IMPORTER-G #511, IMPORTER-H #512, IMPORTER-I #513).

**Audits + CI.** **Dual exact-head audits CLEAN, P0=P1=P2=P3=0.** **Production CI + Deploy succeeded.** The two PRE-EXISTING, diff-independent infrastructure failures (`build-sbom` + `release-please`) **REMAIN in their SEPARATE lane per Rule 14 / R68** — NOT folded into this or any product PR.

**Next allowed work (parallel ONLY after this reconcile lands).** **V5 PR-2a (backend)** — `conformance_alpha` mapper + **exactly one** `source_platform → mapper` registration + deterministic golden fixtures/tests — **∥ PARALLEL WITH V5 PR-2b (extension)** — data-only `conformance_alpha` blueprint + recorded CDP fixtures + conformance tests. Engine untouched. **Core-diff-zero gate now ARMED.** Each owes its own R14 dual-lens + git-native R3 landing. **Not started this Op.**

**Op-68 constraints preserved.** No engine/DTO/schema/migration/OpenAPI/contract/UI changes for adapter #2; **cross-run resume and autonomous blueprint induction remain DEFERRED** (separate pre-build-reviewed slices, not claimed by V5); **mobile is a NO-OP** unless the PR-3 end-to-end proof reveals a contract mismatch.

**Truth-boundary movement.** The hard-wired-dispatch half of `truth_boundaries.no_truecoach_mapper` is now **CLOSED** (mapping is `source_platform`-dispatched via the frozen `SourceMapper` registry). The only remaining boundary is `truth_boundaries.no_multi_adapter_proof_yet` — **no ≥2-adapter end-to-end proof yet**; do NOT claim the core is proven site-agnostic until adapter #2 lands at ZERO core diff AND PR-3 passes.

**Canonical state updated.** `repos.backend.main_head` **`f92a689` → `8a860561`** (+ short/as_of/tip_msg/r3_note/rollback); `repos.context.main_head` **`6f59a71` → `c50a5ef`** (Op-68 tip; this Op advances context main by one plain fast-forward); `decision_record_op69_pr1_landed_2026_07_21` recorded; op label / headline / phase advanced to **Op 69**; `successor_label` → **Agent 69**; `as_of_utc/local` → 2026-07-21; `next_pr_order` (rule + `progress.V5-PR-1` added + `progress.V5` updated) + vertical-proof `v_pr_stack` V5 entry + `blockers.TrueCoach-vertical-proof.precondition` note PR-1 landed / PR-2a∥PR-2b unblocked.

**Rollback / stop.** Reverts by reverting the Op-69 commit (docs/state only). Downstream hard stops unchanged: adapter #2 (`conformance_alpha`) MUST land with **ZERO core changes** (core-diff-zero gate); never a TrueCoach clone/config-variant; never an adapter-specific core contract, second progress system, or `Deleted` erasure state; billing never captured; cross-run resume is a separate slice, not claimed by V5. **NO history rewrite / force-push over shared main.**

**Invariants preserved.** `AGENT_RULES.md` not edited; `R3_MERGE_RUNBOOK.md` mechanics unchanged; D2 decision unchanged; billing exclusion preserved; messaging deferred; production flags default-off; **mission remains site-agnostic — TrueCoach is only one interchangeable validation adapter, not privileged by being first** (R-SITE-AGNOSTIC-1); context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** Backend PR-1 landed: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/8a860561d5b7f8273e761dc9353d938cd02061a2 · PR #514: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/514 · Backend base/parent: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f92a689838a0ae948e53f4cf4fad50991d17ec00 · Context main pre-Op-69 base: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/c50a5efe3a46f5ca8d98e005bdce51ece01c2636

---

## 2026-07-20 (Op 68) — V5 STACK LOCK + `no_truecoach_mapper` CORRECTION: the last leg of the site-agnostic TrueCoach vertical proof is defined into a smallest-canonical, dependency-ordered PR stack with a core-diff-zero pass gate; the stale truth boundary is corrected under R5

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Pre-build governance slice (V5 stack definition + build brief) + documentation/state reconciliation + truth-boundary correction (`no_truecoach_mapper` stale/false → corrected)
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`), which already planned **V5 as the last leg** of the vertical proof. Op 68 tightens the *definition* of that leg and records verified product-repo facts; it is **NOT a new directional decision — no fresh R138 gate is re-run.** (A fresh R138 gate **is** required before any new migration/table/flag/queue/workflow *inside* the V5 build.) Executed under the standing R138 autonomy grant (full CEO/CPO/CTO authority; no routine-approval round-trip).
**Files touched (context repo):** `handoffs/importer-wave/V5_MULTI_ADAPTER_BUILD_BRIEF.md` (**NEW** — canonical V5 spec), `handoffs/importer-wave/current-state.json`, `DECISION_LOG.md`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed; no `AGENT_RULES.md` edit. Documentation/state + build-brief only — audit-exempt per R14 scope. Each V5 product PR (PR-1..PR-3) is fully subject to R14 dual-lens audit + the landing path.**

**Verified product-repo facts (recorded 2026-07-20).** **BACKEND `growth-project-backend` main `f92a689`:** engine / ingest / RLS are source-neutral, **but `families.ts` hard-wires `mapTrueCoachClient` / `mapTrueCoachEntity`** — TrueCoach mappers **DO exist**. The real remaining gap is not "no mapper" but "mapper is hard-wired, not dispatched by `source_platform`" — a thin registry seam, not a rewrite. **EXTENSION `tgp-importer-extension` main `4f11683`:** `runReplay` is IO-injected and source-neutral (no `chrome.*`); blueprints are data-only; `capture.js` is passive (Network.enable only, Fetch NOT enabled) while the replay engine is the bounded navigator; deep discovery is blueprint-authored, not automatic (auto-induction = PR-C2, deferred); a TrueCoach blueprint exists; the boundary supports REST, GET/HEAD, `page|cursor`, single `itemsPath`/`idField`, JWT/cookie; **no cross-run resume** (in-memory idempotency only). **MOBILE `growth-project-mobile` main `a5933fd`:** PR-M4 renders source-neutral counts/reasons from contract 1.4.0 — expected **NO-OP** for V5 unless the end-to-end proof exposes a contract mismatch.

**`no_truecoach_mapper` CORRECTION (R5-preserving).** The canonical `truth_boundaries.no_truecoach_mapper` assertion ("backend has no TrueCoach mapper; 'truecoach' is only a pairing slug; mobile 'paired' is a dead-end") is **STALE / FALSE as of this Op** and is superseded on the live surface only: backend TrueCoach mappers exist (`families.ts`); mobile `paired` is no longer a dead-end (PR-M3 CTA + PR-M4 counts/reasons landed). The remaining true boundary is **narrower** and is recorded as `truth_boundaries.no_multi_adapter_proof_yet`: no multi-adapter end-to-end proof yet, and mapping is hard-wired rather than `source_platform`-dispatched. **Historical assertion preserved verbatim in git history + prior decision records (R5/R132)** — not rewritten; only the live truth surface is corrected with a dated note.

**V5 stack LOCKED (do not reorder).** **PR-1 (backend)** — thin `source_platform → mapper` registry, **TrueCoach-only, BEHAVIOR-IDENTICAL** (replace the hard-wired `families.ts` dispatch with a registry keyed by `source_platform`; register only `truecoach` wrapping the existing `mapTrueCoachClient` / `mapTrueCoachEntity` unchanged; **NO** behavior/family/flag/contract/DTO/schema/migration change; contract stays **1.4.0 byte-identical (R80)**). This freezes the mapper interface and is the **ONLY** prerequisite that unblocks adapter #2. → **PR-2a (backend)** `conformance_alpha` mapper + deterministic golden fixture + conformance/core-diff-zero test **∥ PARALLEL WITH PR-2b (extension)** data-only `conformance_alpha` blueprint + recorded CDP fixture + specs (engine untouched; parallel-safe because they share only the frozen `source_platform` token + fixture descriptor). → **PR-3 (cross-repo)** deterministic end-to-end proof driving **BOTH** adapters through the same unchanged core (extension replay → ingest → reconstruct → contract 1.4.0 read → mobile render). → **PR-4 (context)** reconcile recording PASS/FAIL of the two-adapter/no-core-change gate. **MOBILE = NO-OP** unless PR-3 exposes a real source-neutral contract gap.

**Adapter #2 specification (the pass-gate proof).** Shared `source_platform` token (exact, both repos) = **`conformance_alpha`** — explicitly **non-production** (NOT coach-selectable, MUST NOT appear in any production platform list, exercised only by deterministic fixtures in test/staging; **NOT** a renamed TrueCoach fixture). Structurally independent of TrueCoach across **endpoint topology** (nested `result.records` vs flat `data`), **identifier format** (prefixed string at `uid`, e.g. `ca_cl_000001`, vs numeric/string `id`), **field nesting** (`record.attributes.*` vs flat), **pagination** (`cursor` via `result.page.next` vs page-number), **optional/missing fields** (some rows omit email; null client_history notes), and **poison-row behavior** (one deliberately malformed row per family — missing `uid` / wrong-typed → **counted `failed` with reason, never silently dropped**, R59/R109) — but stays **inside the existing extension boundary** (REST, GET/HEAD, `page|cursor`, single key, JWT/cookie) so **no engine change is required**. A single versioned `conformance_alpha.fixture.json` (`fixture_schema_version 1.0.0`; `families` / `records` / `expect_records`) is the source of truth for **both** surfaces so backend + extension **cannot diverge**. Families = same three (`clients`, `workouts`, `client_history`); NO new family.

**Core-diff-zero gate (enforced AFTER PR-1).** Adapter #2 (PR-2a + PR-2b) may add **ONLY**: the `conformance_alpha` mapper, the data-only blueprint, config, fixtures, tests, and **exactly one** `source_platform → mapper` registry registration line. **FORBIDDEN (any one = V5 NOT passed → STOP, redesign into adapter-local mapping):** any change to `runReplay`, any DTO, the OpenAPI schema/contract (must stay 1.4.0 byte-identical, R80), any migration, any RLS/storage change, any mobile UI change, any new flag/table/queue/workflow, any `if source == …` branch in the core. **Proof of PASS:** (a) `git diff` over the core path-set is **empty** except the single registry line; (b) `grep` of the core (excluding the registry file + adapter-local dirs) for `conformance_alpha` returns **0**; (c) both adapters' conformance suites green on recorded fixtures.

**Cross-run resume — KNOWN DEFERRED.** The extension engine has **in-memory idempotency only; no cross-run/process-restart checkpoint.** V5 does **NOT** prove crash-safe cross-run resume; its idempotency claim is limited to (a) within-run replay convergence and (b) backend `external_ref` dedupe on re-ingest. Evidence trigger: only if a fault-injection drill requires resuming after a process kill/restart. If wanted, it is a **separate pre-build-reviewed slice** (candidate PR-C-RESUME) with its own R14 cycle. Do **NOT** claim V5 proves it until that slice lands.

**Per-PR gates (each PR, at its exact head).** R14 dual-lens CLEAN, 0 P0–P3; R74 test:src ≥ 2.0; R75 banned-cast net ≤ 0; R76 ≤ 400 prod LOC (R86/R100 operator waiver only, never an R109 split); R79 50-failures sweep; R80 OpenAPI byte-pinned (a forced bump = core-contract change = STOP); R100 readiness board; R124 both-ways SHA + BUILD MATRIX (drift = INFRA_DEATH); R3 author == committer == Bradley Gleave, zero AI/co-author tokens, git-native plain fast-forward. **Acceptance matrix** (per adapter × per family): `staged = reconstructed + skipped + failed` with reasons (billing accounted `excluded`); poison rows honestly `failed`; RLS coach-A cannot read coach-B; erased entities absent via cascade/RLS (NO `Deleted`/tombstone); within-run idempotent replay; cursor stable + bound to coach+family+intent; no-oracle 404; flags-off uniform 404; contract 1.4.0 byte-identical; **adapter #2 core diff == 0.**

**STOP conditions.** Single-adapter dogfood is NOT V5; landing adapter #2 requires any core change; any second progress system / totals-percentage-ETA surface / `Deleted`-tombstone erasure / adapter-specific core contract / billing capture; a new migration/table/flag/queue/workflow without a fresh R138 gate; adapter #2 is a TrueCoach clone/config-variant/output-round-trip (tautological); drift or any P0–P3 at an audited head; source-specific copy in the UI. Do **NOT** fold in the separate backend `build-sbom` / `release-please` infra failures (they remain in their own lane per Rule 14 / R68).

**Backend PR-1 UNBLOCKED.** PR-1 (backend thin `source_platform → mapper` registry) is **UNBLOCKED** at live backend main `f92a689` (verify against GitHub before mutation). Its only prerequisite is the frozen registry interface, which PR-1 itself creates; it needs no adapter #2 artifact. PR-1 owes its own full R14 dual-lens cycle + git-native `R3_MERGE_RUNBOOK` landing. PR-2a ∥ PR-2b follow after the interface is frozen.

**Canonical state updated.** `handoffs/importer-wave/V5_MULTI_ADAPTER_BUILD_BRIEF.md` created; `truth_boundaries.no_truecoach_mapper` **CORRECTED** + `no_multi_adapter_proof_yet` **ADDED**; `decision_record_op68_v5_stack_lock_2026_07_20` recorded; op label / headline / phase advanced to **Op 68**; `successor_label` → **Agent 68**; `as_of_utc/local` → 2026-07-20; `repos.context.main_head` **`c68ae3a` → `6f59a71`** (Op-67 tip; this Op advances context main by one plain fast-forward); `next_pr_order` (rule + `progress.V5`) + vertical-proof `v_pr_stack` V5 entry + `blockers.TrueCoach-vertical-proof.precondition` reference the locked stack + PR-1 unblocked.

**Rollback / stop.** This context Op reverts by reverting the Op-68 commit (docs/state + brief only). Downstream hard stops: V5 must be a **two-adapter, core-diff-zero** proof; adapter #2 = `conformance_alpha` and **NOT** a TrueCoach clone/config-variant; never an adapter-specific core contract; never a second progress system or `Deleted` erasure state; billing never captured/staged/reconstructed; cross-run resume is a separate slice, not claimed by V5. **NO history rewrite / force-push over shared main** (forbidden by runbook / R4 / R102).

**Invariants preserved.** `AGENT_RULES.md` not edited; `R3_MERGE_RUNBOOK.md` mechanics unchanged; D2 decision (Op 59) unchanged; billing exclusion preserved; messaging deferred (not dropped); production flags default-off; historical decision records + the stale `no_truecoach_mapper` text preserved verbatim in git history (R5/R132 — only the live surface corrected); **mission remains site-agnostic/browser-agnostic — TrueCoach is only one interchangeable validation adapter, no TrueCoach-first framing** (R-SITE-AGNOSTIC-1); context-repo AGENT_RULES.md remains the single canonical rule authority resolved by reference (R-RULE-AUTHORITY-1); context reconcile landed R3-clean by plain fast-forward (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/co-author tokens), audit-exempt per R14 scope.

**Evidence URLs.** Backend main (PR-1 base, verify before mutation): https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f92a689838a0ae948e53f4cf4fad50991d17ec00 · Extension main: https://github.com/BradleyGleavePortfolio/tgp-importer-extension/commit/4f116836ddb5449524dd51e995a7e4c012f79493 · Mobile main: https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c · Context main pre-Op-68 base: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/6f59a711a5c5db141842bf36e8456c0c3db51140

---

## 2026-07-20 (Op 67) — PR-M4 LANDED: minimal source-neutral per-family reconstructed counts/reasons inside the existing paired panel, on mobile `main` via a PLAIN fast-forward push (third V-PR of the vertical proof; executes the Op-63 "Defer messaging" scope); next frontier V5 reframed as a MULTI-ADAPTER end-to-end proof

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, PR-M4 — mobile reconstructed-entity counts/reasons UX) + documentation/state reconciliation + next-frontier reframing (V5 = multi-adapter proof)
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`). PR-M4 is the **third V-PR within that already-gated scope**; this Op is a **reconcile of a completed landing that executes that decision**, NOT a new directional decision — no fresh R138 gate is re-run. The V5 reframing tightens the *definition* of an already-planned stack leg (it does not add scope or a new gate). Executed under the standing R138 autonomy grant (full CEO/CPO/CTO authority; no routine-approval round-trip).
**Files touched (context repo):** `handoffs/importer-wave/current-state.json`, `DECISION_LOG.md`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed in the context repo; no `AGENT_RULES.md` edit. Documentation/state only — audit-exempt per R14 scope. The PR-M4 *product* PR #288 was fully subject to R14 dual-lens audit (CLEAN) + the plain fast-forward landing path.**

**Landing facts (independently verified against GitHub).** Mobile PR #288 — audited head **== landed main == mergeCommit `a5933fd6de5616493de75f0db907098b149b955c`**, base/parent **`e3a824f335ef75934fe860165ffc9c41a7b7956b`** (PR-M3 tip). Landed via a **PLAIN fast-forward push** (`git push origin a5933fd:main`; `e3a824f..a5933fd -> main`; **NO force, NO `--force-with-lease`, NO admin bypass, NO server-side merge button, NO merge commit, NO rebase**). Main was unprotected (`branches/main/protection` → 404), so direct fast-forward is permitted; the non-force push self-rejects on drift. Pre-push drift guard: local head == remote branch head == PR head == `a5933fd`; PR `baseRefOid` == remote `main` == `e3a824f` — no drift. **R3-CLEAN:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; tree `fc34a95ec33d582ccf9cc9f976c079d776513ff9` **byte-identical** to the dual exact-head CLEAN audits; commit message AI/co-author-token clean (no `Co-Authored-By` / "Generated with" / Claude / Anthropic / noreply). **FIRST R3-CLEAN mobile-main landing** — unlike the prior PR-M3 #287 landing `e3a824f`, an operator-authorized one-time bypass recorded honestly as **R3-INC-3** (whose disposition is unchanged: grandfathered, not rewritten, not normalized; PR-M4 does not inherit or extend it). PR #288 **MERGED** (mergeCommit `a5933fd`, mergedAt 2026-07-20T23:11:52Z, closed); source branch `feat/import-reconstruct-counts-pr-m4` **safe-deleted** (branch head == merged main SHA before deletion; verified gone, 404; remote lists only `refs/heads/main` at `a5933fd`) — not a zombie.

**Scope (what landed).** A minimal **SOURCE-NEUTRAL** per-family reconstructed counts/reasons section rendered **INSIDE the existing paired panel** (no new screen/route/tab), a **strict consumer** of the IMPORTER-I backend contract **1.4.0** over families **workouts + client_history**. **NO percentages, NO totals, NO ETA, NO completion claim, NO "imported" language, NO source-specific copy** (source-neutral per R-SITE-AGNOSTIC-1). Behind the existing `EXPO_PUBLIC_FF_EXTENSION_IMPORT` flag (default-off; **no new flag**). Billing EXCLUDED; messaging DEFERRED. The IMPORTER-I read surface now has a **real consumer (not dead API)**. The hard-constraint DELETE list held (no new table/migration/flag/queue/workflow/totals-scan/cross-family-join/source-DTO/claim-credential/messaging/second-progress/Deleted-state).

**Gates / audit / CI.** Dual independent exact-head audits **CLEAN, zero P0–P3** at `a5933fd`. Test density **raw 2.13 / code 2.20** (≥ 2.0, passes natively); prod code **377 net LOC < 400** ceiling — **R23/R76 native pass, NO LOC exemption needed** (unlike IMPORTER-G/H/I, which needed operator waivers); tree byte-identical to the audited head; R124 both-ways verified; drift guard held. Post-merge production CI on `main a5933fd` **TERMINAL GREEN** (Typecheck, lint, test; Analyze actions; Analyze javascript-typescript; CodeQL).

**Backend automation-failure lane (unchanged).** The two pre-existing **backend** automation failures — **`build-sbom`** (lefthook devDependency omitted under `npm ci --omit=dev` → `prepare` exit 127) and **`release-please`** (Actions lacks create/approve-PR permission), documented in the Op 66 entry — **remain in their existing SEPARATE infrastructure lane** per Rule 14 / R68 + delete-first. They are backend-repo issues, diff-independent of PR-M4 (a mobile PR), and are **NOT folded into V5 or any product PR**; each is resolved in its own dedicated backend change + audit.

**Next frontier — V5 REFRAMED as a MULTI-ADAPTER end-to-end proof (NOT a TrueCoach-first dogfood).** V5's purpose is to **prove the reconstruct core is genuinely site-agnostic** by driving it end-to-end (capture/ingest → multi-family reconstruct → read contract 1.4.0 → mobile counts/reasons UX) through **AT LEAST TWO structurally independent adapters** (distinct source schema/shape, not a config variant of one). **HARD GATE: NO core changes are permitted to land the SECOND adapter** — if adapter #2 forces edits to the shared reconstruct core (services/DTOs/contract/RLS/storage), the core is not yet site-agnostic and **V5 has NOT passed**; the fix is to push the difference into adapter-local source→canonical mapping, never the core. Each adapter contributes only its own mapper; no adapter-specific branches in the core. Deterministic golden fixtures per adapter first; real-account validation + replay/partial-failure drills exercised in V5 (flags flipped in staging only), but the **two-adapter / no-core-change condition is the pass gate**, not any single real account. **STOP conditions:** single-adapter dogfood is NOT V5; STOP if landing adapter #2 requires any core change; STOP on any second progress system / totals-percentage-ETA surface / Deleted-tombstone erasure state / adapter-specific core contract / billing capture (hard-constraint DELETE list holds); gate under R138 before any new migration/table/flag/queue/workflow; do NOT fold in the separate backend build-sbom/release-please infra failures. TrueCoach is **one of the required adapters, privileged in no way by being first** (R-SITE-AGNOSTIC-1).

**Canonical state updated.** `repos.mobile.main_head` **`e3a824f` → `a5933fd`** (+ R3-CLEAN r3_note / rollback_commit / `prior_tip_before_pr288`); `repos.context.main_head` **`15e3026` → `c68ae3a`** (Op-66 tip; this Op advances context main by one plain fast-forward); op label / headline / phase advanced to Op 67; **`progress.PR-M4` ADDED as LANDED**; vertical-proof `v_pr_stack` + `IMPORT-VERT` + `next_pr_order` + blockers **next active leg advanced to V5, reframed as the multi-adapter proof**; `decision_record_op67_pr_m4_landed_2026_07_20` records the full execution facts + the V5 frontier/stop conditions.

**Rollback / stop.** This context reconcile reverts by reverting the Op-67 commit (docs/state only). Mobile rollback (if ever needed) is forward-only, non-destructive: `git revert a5933fd` via a normal reviewed PR, or `EXPO_PUBLIC_FF_EXTENSION_IMPORT=false` to dark the UI; **NO history rewrite / force-push over shared main** (forbidden by runbook / R4 / R102). Downstream hard stops: V5 must be a two-adapter, no-core-change proof; never an adapter-specific core contract; never a second progress system or `Deleted` erasure state; billing never captured/staged/reconstructed.

**Invariants preserved.** `AGENT_RULES.md` not edited; `R3_MERGE_RUNBOOK.md` mechanics unchanged; D2 decision (Op 59) unchanged and preserved; billing exclusion preserved; messaging deferred (not dropped); production flags default-off (none enabled); historical decision records and handoff provenance preserved verbatim (R5/R132); **mission remains site-agnostic/browser-agnostic — TrueCoach is only one interchangeable validation adapter, no TrueCoach-first framing** (R-SITE-AGNOSTIC-1); `truth_boundaries.no_e2e_proof_yet` and `no_truecoach_mapper` still hold (no multi-adapter end-to-end proof yet — that is exactly V5's job); R3-INC-1/2/3 dispositions unchanged; context reconcile landed R3-clean by plain fast-forward (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/co-author tokens), audit-exempt per R14 scope.

**Evidence URLs.** Mobile PR-M4 landed commit: https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/a5933fd6de5616493de75f0db907098b149b955c · PR #288: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/288 · Context main pre-Op-67 base: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/c68ae3afa0bfce5804e2663496de650d5a6610fe

---

## 2026-07-20 (Op 66) — IMPORTER-I LANDED: coach-scoped, family-parameterized, cursor-paginated reconstructed-entity review READ on backend `main` via a PLAIN fast-forward push (second V-PR of the TrueCoach vertical proof; executes the Op-63 "Defer messaging" scope)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-I — backend reconstructed-entity review READ) + documentation/state reconciliation
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`). The build spec / pre-build gate is **Op 65** (`decision_record_op65_importer_i_prebuild_2026_07_20` + `handoffs/importer-wave/IMPORTER-I_BUILD_BRIEF.md`). This Op is a **reconcile of a completed landing that executes that decision**, NOT a new directional decision — no fresh R138 gate is re-run. Executed under the standing R138 autonomy grant (full CEO/CPO/CTO authority; no routine-approval round-trip).
**Files touched (context repo):** `handoffs/importer-wave/current-state.json`, `DECISION_LOG.md`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed in the context repo; no `AGENT_RULES.md` edit. Documentation/state only — audit-exempt per R14 scope. The IMPORTER-I *product* PR #513 was fully subject to R14 dual-lens audit (CLEAN) + the git-native landing path.**

**Landing facts (independently verified against GitHub).** Backend PR #513 — audited head **== landed main `f92a689838a0ae948e53f4cf4fad50991d17ec00`**, base/parent **`f9b81cf73289bfe74087dfe6327e52e460fb44f6`** (IMPORTER-H tip). Landed via a **PLAIN fast-forward push** (`git push origin f92a689:refs/heads/main`; `f9b81cf..f92a689 -> main`; **NO force, NO `--force-with-lease`, NO admin bypass, NO server-side merge button, NO merge commit, NO rebase**). Pre-push drift guard: remote `main` was `f9b81cf` == head's parent, so a non-force push is a fast-forward that self-rejects on drift — it did not drift. **R3-CLEAN:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; landed-main tree **byte-identical** to the audited-head tree (`51dfc2e8dea98f128f512a38cfdec2655e89db30`); commit message AI/co-author-token clean. **Fifth** R3-CLEAN git-native backend-main landing (after #508, IMPORTER-F #510, IMPORTER-G #511, IMPORTER-H #512). PR #513 **MERGED** (mergeCommit `f92a689`, mergedAt 2026-07-20T20:57:13Z, closed); source branch `feat/importer-i-reconstruct-entities-read` **safe-deleted** (branch == merged main SHA; verified gone, 404) — not a zombie.

**Scope (what landed).** `GET /api/scout/reconstruct/entities?family=&cursor=&limit=` — a coach-scoped, family-parameterized, cursor-paginated READ over the **write-only-until-now reconstructed workouts + client_history** (clients continue to be served by the IMPORTER-G roster) that IMPORTER-H materialized, returning canonical rows + honest page metadata (`page_count` + opaque `next_cursor`). **NOT a second progress system** (the POST reconstruction `staged=reconstructed+skipped+failed` accounting stays separate/authoritative). DTO renamed **`ReconstructedEntityDto`** to resolve an OpenAPI schema collision with the ingest `ScoutEntityDto`; PII-minimal row shape (no email/billing/coach_id/payload); `@Roles('coach')`, `coach_id` from the trusted token (never a cursor/request id); no existence oracle on 404; contract **frozen at `CONTRACT_VERSION 1.4.0`** (importer-openapi.json = 11 paths / 27 schemas). **Erased entities proven absent by the D2 cascade + fail-closed RLS — NO `Deleted`/tombstone/soft-delete state** (live-RLS + erasure spec gated on `liveDbUrl()`). Reused the IMPORTER-G roster read path + `RECONSTRUCT_ENTITY_TYPES` allowlist + both existing dark flags (`FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT`, both default-off; **no new flag; no migration**). Billing EXCLUDED; messaging DEFERRED. The hard-constraint DELETE list held (no new table/migration/flag/queue/workflow/totals-scan/cross-family-join/source-DTO/claim-credential/messaging/second-progress).

**Gates / audit / CI.** Dual independent exact-head audits **CLEAN, zero P0–P3** at `f92a689`. R74 test density **2.66** (≥ 2.0, passes natively); R75 banned-cast net **≤ 0**; R76 **[LOC-EXEMPT]** operator-signed waiver (R100 escape hatch — canonical read bridge + mandatory coach-scope/no-oracle/erasure + live-RLS security suite exceed 400 net prod LOC while density passes natively; not a bypass, not an R109 split); R80 OpenAPI byte-pinned drift/contract test **green**; R124 both-ways verified; drift guard held. Post-merge core CI **GREEN incl. production Deploy app** (build-and-test, Banned cast tokens, Test density, LOC budget, rls-live-tests, rls-floor-guard, mwb-3-live-tests, CodeQL +JS/TS, danger, danger dry-run, test-/comment-deploy-readiness, actionlint, shellcheck, size-label); deploy-readiness-gate skipped.

**Automation-failure disposition (DECIDED).** The only two red post-merge jobs — **`build-sbom`** (npm `prepare` runs `lefthook install` under `npm ci --omit=dev` with lefthook a devDependency → `sh: 1: lefthook: not found`, exit 127) and **`release-please`** (`GitHub Actions is not permitted to create or approve pull requests` — a repo/org Actions permission setting) — **DO NOT block PR-M4 and become a SEPARATE prioritized infrastructure slice.** Rationale (Rule 14 audit-scope + **R68** dedicated-scope discipline + delete-first): both were **already red on prior main `f9b81cf`** (non-regressions), IMPORTER-I touched **no** `package.json`/`lefthook`/`prisma`/`package-lock`/`.github/workflows`/SBOM/release-config file, and the production `Deploy app` job succeeded. Each fix belongs in its **own dedicated PR + audit**; folding either into a product PR (or into PR-M4) is forbidden. PR-M4 is a mobile UX PR consuming the frozen backend contract (1.4.0) and depends on neither job.

**Canonical state updated.** `repos.backend.main_head` **`f9b81cf` → `f92a689`** (+ r3_note/rollback_commit/prior_tip); `repos.context.main_head` **`d275b14` → `15e3026`** (Op-65 tip; this Op advances context main by one plain fast-forward); op label / headline / phase advanced to Op 66; `progress.IMPORTER-I` **BRIEFED → LANDED**; vertical-proof `v_pr_stack` + `IMPORT-VERT` + blockers **next active leg advanced to PR-M4**; `decision_record_op66_importer_i_landed_2026_07_20` records the full execution facts + disposition.

**Rollback / stop.** This context reconcile reverts by reverting the Op-66 commit (docs/state only). Backend rollback (if ever needed) is forward-only, non-destructive: `git revert f92a689` via a normal reviewed PR, or `FEATURE_SCOUT_RECONSTRUCT=false` to dark the route; **NO history rewrite / force-push over shared main** (forbidden by runbook / R4 / R102). Downstream hard stops unchanged: any new migration/table/flag/infra requires a fresh pre-build gate; never an adapter-specific core contract; never a `Deleted` state for erasure; billing never captured/staged/reconstructed.

**Invariants preserved.** `AGENT_RULES.md` not edited; `R3_MERGE_RUNBOOK.md` mechanics unchanged (IMPORTER-I is a fifth empirical R3-CLEAN proof of the git-native path); D2 decision (Op 59) unchanged and preserved; billing exclusion preserved; messaging deferred (not dropped); production flags default-off (none enabled); historical decision records and handoff provenance preserved verbatim (R5/R132); **mission remains site-agnostic/browser-agnostic — TrueCoach is only one interchangeable validation adapter, no TrueCoach-first framing** (R-SITE-AGNOSTIC-1); `truth_boundaries.no_e2e_proof_yet` and `no_truecoach_mapper` still hold (real-account validation remains deferred to V5); context reconcile landed R3-clean by plain fast-forward (author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/co-author tokens), audit-exempt per R14 scope.

**Evidence URLs.** Backend IMPORTER-I landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f92a689838a0ae948e53f4cf4fad50991d17ec00 · PR #513: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/513 · Context main pre-Op-66 base: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/15e3026f6f87b1306f44c5f938a1e284d3622f4e

---

## 2026-07-20 (Op 65) — IMPORTER-I PRE-BUILD GOVERNANCE SLICE: canonical build brief + rule-authority ruling + site-agnostic doctrine ruling; two stale repo heads reconciled (docs/state + doctrine only, R14-exempt, R3-clean fast-forward)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Pre-build governance + documentation/doctrine reconciliation (no product code)
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`). IMPORTER-I is the **second V-PR within that already-gated scope**; this Op **briefs and pre-build-gates** it — it is not a new directional decision, so no fresh R138 gate is re-run. Executed under the standing R138 autonomy grant (full CEO/CPO/CTO authority; no routine-approval round-trip).
**Files touched (context repo):** `handoffs/importer-wave/IMPORTER-I_BUILD_BRIEF.md` (NEW), `roadmap/rulings/R-RULE-AUTHORITY-1_2026-07-20.md` (NEW), `roadmap/rulings/R-SITE-AGNOSTIC-1_2026-07-20.md` (NEW), `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` (surgical pointer), `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`. **No product code changed; no AGENT_RULES.md edit. Documentation/state + doctrine only — audit-exempt per R14 scope; the IMPORTER-I *build* PR remains fully subject to R14 dual-lens audit + the git-native `R3_MERGE_RUNBOOK` path.**

**Decision — VALIDATE FIRST, then BUILD SMALLER.** Per the pre-build review (`/home/user/workspace/importer-i-pre-build-review.pplx.md`), the useful IMPORTER-I slice is a thin, adapter-neutral READ over canonical reconstructed entities; the repository already holds nearly every primitive, so new storage/flags/joins/totals/queues are waste. The only pre-code blockers were governance defects (no canonical brief; unresolved rule authority for R74–R127 in leaf repos). This Op resolves both.

**Deliverables.**
1. **IMPORTER-I build brief** — `handoffs/importer-wave/IMPORTER-I_BUILD_BRIEF.md`. A coach-scoped, family-parameterized reconstructed-entity review READ: `GET /api/scout/reconstruct/entities?family=<allowed>&cursor=<opaque>&limit=<bounded>`, returning canonical rows + honest page metadata (`page_count` + opaque `next_cursor`). Scope is canonical rows + honest page metadata, **NOT a second progress system** (the POST reconstruction `staged=reconstructed+skipped+failed` accounting stays separate/authoritative). **No new table, migration, flag, queue, workflow engine, totals scan, cross-family join, source DTO, credential/claim flow, billing, or messaging.** REUSE the roster read path + `RECONSTRUCT_ENTITY_TYPES` allowlist + existing dark flags + live-RLS harness; BUILD only generic entity materialization + a thin opaque non-authorizing cursor + OpenAPI/contract/behavioral/RLS/erasure tests.
2. **Site-agnostic doctrine reconciliation** — `roadmap/rulings/R-SITE-AGNOSTIC-1_2026-07-20.md` + a surgical forward-binding pointer in the canonical mission doc. TrueCoach is **one interchangeable validation adapter**, never an MVP, privileged first phase, architecture driver, or release-sequencing assumption; the product is site-agnostic **from inception**; "first" confers no privilege; no adapter-specific core contract. Prior decision records and handoff provenance are **preserved verbatim** (R5/R132) — only the live north-star mission surface carries the pointer; no unrelated history rewritten.
3. **Rule authority resolved** — `roadmap/rulings/R-RULE-AUTHORITY-1_2026-07-20.md`. The context-repo `AGENT_RULES.md` is the **single canonical rule authority** for every leaf repo; a leaf repo citing rules it does not define locally (e.g. R74–R127) is bound by the canonical text, **resolved by reference** (repo + path + `main`) — **no invented text, no ~167 KB duplication**. Basis: `AGENT_RULES.md` line 5 ("There is no other rules file"), line 9 ("single canonical constitution"), R15 ("GitHub is the only source of truth"), R4 line 363 (scope-resolution docs live in the context repo). A leaf local rules file is a non-authoritative mirror; where shorter/silent/conflicting, the canonical file wins.
4. **Consumer + semantics pinned** — IMPORTER-I enables source-neutral mobile/web review of write-only reconstructed **workouts + client_history** (and clients) through canonical family rows; named consumer = **PR-M4** (fixture-level consumer test required); the existing POST progress remains separate; **erased entities must be proven absent by cascade + fail-closed RLS behavior of the D2 model, NOT by adding a `Deleted` state.**
5. **Canonical state updated** — `current-state.json` op label/headline advanced to Op 65; `progress.IMPORTER-I` + the vertical-proof `v_pr_stack` now point at the brief; `decision_record_op65_importer_i_prebuild_2026_07_20` records the Idiot-Index/DELETE decisions and next dependency.
6. **Two stale repo heads reconciled (independently RE-VERIFIED against GitHub at Op 65):** `repos.backend.main_head` **`77bb4a0` → `f9b81cf`** (IMPORTER-H PR #512; author==committer==`Bradley Gleave`, single parent `77bb4a0`, committer date 2026-07-19T06:08:05Z — the rest of the doc already narrated IMPORTER-H LANDED, only this pinned field lagged) and `repos.context.main_head` **`bcbe409` → `d275b14`** (the Op-64 reconcile tip; the field was never advanced through Op-62/Op-64). No content drift in either repo — only pinned-head bookkeeping was stale.

**Backend-unblocked verdict.** IMPORTER-I backend implementation is now **LEGALLY UNBLOCKED to dispatch**: the pre-build STOP blockers (missing canonical brief; unresolved leaf-repo rule authority) are resolved. Remaining gates are the ordinary build/audit gates in the brief §5, cleared during the IMPORTER-I build PR's own R14 cycle — not pre-build blockers. **NOT dispatched this Op.**

**Rollback / stop.** Docs/state + doctrine only — reversible by reverting the Op-65 commit; no runtime/flag/data impact. Downstream hard stops for the IMPORTER-I build unchanged: any need for a new migration/table/flag/infra requires a fresh pre-build gate; never an adapter-specific core contract; never a `Deleted` state for erasure; billing never captured/staged/reconstructed.

**Invariants preserved.** `AGENT_RULES.md` not edited (the rulings clarify/reinforce, they do not amend); `R3_MERGE_RUNBOOK.md` mechanics unchanged and not weakened; D2 decision (Op 59) unchanged; billing exclusion preserved; messaging deferred (not dropped); production flags default-off (none enabled); no product-repo code touched, no mobile dispatch; historical decision records and handoff provenance preserved verbatim (R5/R132); mission remains site-agnostic/browser-agnostic (TrueCoach only a validation adapter); `truth_boundaries.no_e2e_proof_yet` and `no_truecoach_mapper` still hold; context reconcile landed R3-clean by plain fast-forward (author==committer==`Bradley Gleave <bradley@bradleytgpcoaching.com>`, no AI/co-author tokens), audit-exempt per R14 scope.

**Evidence URLs.** Backend IMPORTER-H landed commit (re-verified this Op): https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f9b81cf73289bfe74087dfe6327e52e460fb44f6 · Context main pre-Op-65 base: https://github.com/BradleyGleavePortfolio/tgp-agent-context/commit/d275b142fc155d3838ef164673a93684f0073ff6

---

## 2026-07-19 (Op 64) — IMPORTER-H LANDED: site-agnostic MULTI-FAMILY reconstruction (clients + workouts + client history) on backend `main` via the git-native `R3_MERGE_RUNBOOK` path (first V-PR of the TrueCoach vertical proof; executes the Op-63 "Defer messaging" scope)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-H — backend multi-family reconstruct) + documentation reconciliation
**Governing decision:** the Op-63 R138 four-question directional gate (**"Defer messaging"**; see the Op 63 entry below + `decision_record_op63_v0_defer_messaging_2026_07_19`). This Op is a **reconcile of a completed landing that executes that decision**, NOT a new directional decision — so no fresh R138 gate is re-run; the Op-63 gate is the delegated-approval artifact for this lane.
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed here; no AGENT_RULES.md edit. `R3_MERGE_RUNBOOK.md` is UNCHANGED — its git-native doctrine/mechanics remain true and were followed verbatim; nothing there is stale to reconcile. Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Backend PR #512 (audited head `43c226366fd9e248f3a8d4a8ed26bdfd54b64805`, base `77bb4a04f6e087886e6f27c5129d17dc5162f356`) parametrizes the hardcoded clients-only `RECONSTRUCT_ENTITY_TYPE='clients'` reconstruct/roster path into site-agnostic **MULTI-FAMILY** reconstruction — **clients + workouts + client history** — into canonical TGP entities under the D2 identity model, with honest per-family `staged = reconstructed + skipped + failed`. **Billing EXCLUDED; messaging DEFERRED** (per Op 63). It landed via the git-native `R3_MERGE_RUNBOOK.md` path — git `commit-tree` squash + PLAIN fast-forward push, **no `--force`, no `--force-with-lease`, no admin bypass, no server-side merge** — as backend `main` **`f9b81cf73289bfe74087dfe6327e52e460fb44f6`**.

**Verified evidence (as reported by the backend lane / re-checkable via `gh`):**
- **Identity:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens. **R3-CLEAN** — the fourth R3-CLEAN backend-`main` landing via the git-native path (after #508/`95e2c63`, IMPORTER-F #510/`1e6b3bf`, IMPORTER-G #511/`77bb4a0`).
- **Tree integrity:** landed tree byte-identical to the audited head (`43c2263`) tree.
- **Parent:** single parent `77bb4a0…` (IMPORTER-G tip) → linear/fast-forwardable; drift guard held (base == prior tip, no drift); R124 both-ways verified (live PR head == audited head).
- **PR state:** #512 **closed**, NOT server-merged (expected for the git-native path; matches the #508/#510/#511 precedent); closed with a landed-SHA comment. Feature branch **DELETED** (not a zombie).
- **Audit:** two dual independent exact-head audits at `43c2263` CLEAN, **zero P0–P3**. The sole P3 (a dead field) surfaced at an earlier head `a1f7606` and was fixed **DELETE-FIRST** at `43c2263`, then re-audited **FRESH dual CLEAN**. All exact-head PR checks green.
- **Quality gates:** **R76 [LOC-EXEMPT]** operator waiver (R100 escape hatch; an operator waiver, NOT a bypass and NOT an R109 metric-gaming split); **R74** test:src ratio **2.12** (≥ 2.0); **R75** banned-cast net **ZERO**.
- **Safety:** feature dark behind `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off; **no new flag**); the path is dark unless both are `"true"`. Billing remains an explicit excluded family; messaging deferred (not built as a v1 entity).

**Operational findings (recorded, non-blocking):**
1. **Post-merge `build-sbom` and `release-please` FAILED — PRE-EXISTING automation debt, NOT IMPORTER-H regressions.** `build-sbom`: npm `prepare` runs `lefthook install` under a production-only install where the lefthook devDependency is absent → exit 127. `release-please`: GitHub Actions lacks permission to create/approve PRs. Both were already red on prior main `77bb4a0`; IMPORTER-H changed no package/workflow/SBOM/release-config file. Inherited debt to fix separately; not gating.
2. **Post-merge CI on `f9b81cf` is now TERMINAL and VERIFIED** (supersedes the Op-64 "still running" tracked state). **Core CI GREEN** — build-and-test, rls-live-tests, mwb-3-live-tests, rls-floor-guard, CodeQL JS/TS, Deploy app. The only red is the two pre-existing non-regression automation jobs in finding 1 (`build-sbom`, `release-please`), both already red on prior main `77bb4a0`. Per-job run URLs (success + both failures with prior-main comparison) live in `current-state.json` `decision_record_op64_importer_h_landed_2026_07_19.postmerge_ci_evidence` — not duplicated here.
3. **Backend `main` remains NOT branch-protected** (as recorded since Op 60). The drift guard is git's own non-fast-forward rejection (verified: no drift), not server-side protection. Operator to reconcile intent. Unchanged this Op.

**Order / next.** IMPORTER-H is the first V-PR of the TrueCoach end-to-end vertical proof and is now LANDED. **NEXT dependency = IMPORTER-I** (backend coach-scoped mobile-readable per-family review/progress read contract; OpenAPI bump + R80 byte-pinned drift). Existing order **preserved: IMPORTER-I → PR-M4 → V5.** IMPORTER-I **NOT dispatched this Op** — awaits its own R14 dual-lens cycle on its build PR.

**Rollback / stop.** Forward-only, non-destructive: `git revert f9b81cf` via a normal reviewed PR. NO history rewrite / force-push over shared `main` (forbidden by runbook §5 / R4 / R102; reserved to the operator). This context reconcile is docs/state only and reverts by reverting the Op 64 commit.

**Invariants preserved.** AGENT_RULES.md not edited; R3_MERGE_RUNBOOK git-native mechanics unchanged and not weakened; D2 decision (Op 59) unchanged; billing exclusion preserved; messaging deferred within v1 (not dropped from the product); production flags default-off (none enabled); no mobile dispatch/modification; mission remains site-agnostic/browser-agnostic (TrueCoach is only the first proving adapter, not product scope); `truth_boundaries.no_e2e_proof_yet` still holds (no end-to-end completion claimed); context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/512 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f9b81cf73289bfe74087dfe6327e52e460fb44f6

---

## 2026-07-19 (Op 63) — V0 SCOPE DECISION: **DEFER MESSAGING** — the TrueCoach end-to-end vertical proof v1 covers **clients + workouts + client history**; messaging becomes a later specialized lane, not a generic v1 entity (R138-governed directional decision)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** R138-governed directional/scope decision for the next lane (TrueCoach end-to-end vertical proof) — **docs/state only**
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed. `AGENT_RULES.md` UNCHANGED — an R138 directional decision needs only the four-question gate + this entry, not a protected-rule change. `R3_MERGE_RUNBOOK.md` UNCHANGED — sole default merge doctrine; NO permanent R3 change. Documentation/state only — audit-exempt per R14 scope (R138 explicitly keeps doctrine/directional docs audit-exempt).**

**DECISION.** Per the operator's explicit ruling (**verbatim: "Defer messaging"**), the v1 TrueCoach end-to-end vertical proof (IMPORT-VERT) covers three data families — **CLIENTS, WORKOUTS, and CLIENT HISTORY**, all already captured and staged today. **Messaging is DEFERRED to a later specialized lane** (its own extractor + reconstruction contract) rather than being built as a generic entity family in v1. Consequent operator-directed resolutions:
1. **Next step is BACKEND-FIRST = IMPORTER-H** — backend multi-family reconstruct: parametrize the hardcoded `RECONSTRUCT_ENTITY_TYPE='clients'` path to also reconstruct workouts + client history into canonical TGP entities under the D2 identity model. No extension messaging lane precedes v1, because these families need no new capture.
2. **Deterministic golden fixtures** gate build/audit; **real-account end-to-end validation is deferred to V5** (staging full-loop dogfood).
3. **Mobile review UX** for the proof is the **minimal honest per-family counts/reasons screen** (`staged = reconstructed + skipped + failed` with reasons; no invented completion/percentage) — **not** the full diff/suggested-fixes luxury surface (deferred enhancement).
4. **Blueprint induction / autonomous site learning** is a **separate follow-on lane**, not part of v1.
5. **Branch controls unchanged** — the git-native non-fast-forward drift guard remains the control on product mains; enabling server-side protection stays a separate operator-reconcile item.
6. **No permanent R3 change** — R3 and the runbook remain the sole default doctrine; every V-PR lands git-native; the standing executor-identity tension (R3-INC-3) is resolved separately before the first V-PR land.

The v1 stack is therefore a BACKEND-FIRST dependency-ordered V-PR chain: **IMPORTER-H → IMPORTER-I** (mobile-readable per-family review read contract) **→ PR-M4** (mobile minimal honest counts/reasons) **→ V5** (staging dogfood + real-account validation).

**R138 FOUR-QUESTION DECISION GATE (the delegated-approval artifact).**
1. **First principles (Musk algorithm).** *Question* the requirement that the proof must exercise every mission family at once — its real job is to de-risk the pipeline, which three already-captured families do. *Delete* the biggest part: greenfield messaging (and any generic-messaging-entity build), plus blueprint induction and luxury review UX, from v1 — removing the longest pole. *Simplify* what survives: reuse the existing clients-only reconstruct/roster path, parametrized for workouts + history (one path, not per-family engines). *Accelerate*: deterministic golden fixtures give fast, repeatable build/audit. *Automate last*: no new automation/flags. Musk's warning applied — don't optimize a generic messaging entity that should not exist in v1.
2. **Hyperscaler lens (evidence).** Ship the thinnest vertical slice that exercises the whole pipeline, behind flags, on deterministic fixtures before real data — the AWS/GCP progressive-delivery + canary pattern (small blast radius first, widen later). Deferring real-account validation to a staging dogfood (V5) mirrors canary/one-box rollout before production; keeping every family behind the existing default-off scout flags is blast-radius containment by feature gating, not added human latency ([AWS Builders' Library — continuous delivery](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/); [Google Cloud — safe rollouts](https://docs.cloud.google.com/kubernetes-engine/config-sync/docs/tutorials/safe-rollouts-with-config-sync)). Multi-family reconstruct as one parametrized path over a single contract is the platform pattern of one generalized pipeline over per-type forks.
3. **GOOD without the BAD (customer value + risks/mitigations).** **Customer value:** a faster, lower-risk end-to-end proof on data that already exists — proving capture → stage → reconstruct → honest review for the families a migrating coach cares about first (their clients, workouts, and history), which is the actual go-to-market trust surface. **BAD gated out:** (a) messaging looking "done" when deferred → recorded as an explicit deferred specialized lane; `truth_boundaries.no_e2e_proof_yet` still holds. (b) a clients-only shortcut masquerading as multi-family → IMPORTER-H must genuinely reconstruct workouts + history with per-family accounting (R109 "No Half-Ass"), verified by dual-lens audit. (c) fixture-only proof mistaken for real-world validation → real-account validation explicitly deferred to V5; no e2e completion claimed. Structure keeping GOOD while gating BAD: default-off flags + deterministic fixtures + honest per-family accounting + R14 dual-lens audit per V-PR + git-native R3 land.
4. **Root cause.** Attacks the real blocker: the lane was stalled on an undecided scope (greenfield messaging forced extension-first and a longer path). Deciding scope — defer messaging, go backend-first with families that exist — removes the actual blocker, not a symptom, and papers over no quality gate (R14 audit, R3 identity, D2 model, billing exclusion, default-off posture all preserved).

**REJECTED ALTERNATIVES.**
- **Include messaging in v1** (extension-first EXT-MSG capture then downstream) — greenfield across all three repos, longest pole, delays proving the pipeline on data that already exists. Operator ruled defer.
- **Build messaging as a generic v1 entity family** — messaging's threaded/participant-scoped capture + reconstruction shape warrants its own specialized lane, not the generic clients/workouts path.
- **Full luxury review UX in v1** (diff-by-family + suggested fixes + single commit) — minimal honest counts/reasons proves the review leg; luxury surface is a later enhancement.
- **Bundle blueprint induction into this lane** — separate follow-on; bundling blows lane scope and LOC caps.
- **Real-account validation as an IMPORTER-H build/audit gate** — deterministic fixtures gate build/audit; real-account validation batched to V5.
- **Amend R3 / the runbook to ease the first V-PR land** — no permanent R3 change; git-native path stays mandatory; identity tension resolved separately.

**EVIDENCE REQUIRED (downstream, not this docs decision).** IMPORTER-H: deterministic byte-pinned golden fixtures for workouts + client history; acceptance tests extending IMPORTER-F 1–8 per family; honest `staged = reconstructed + skipped + failed` accounting; R74 test:src ≥ 2.0; R75 banned-cast net +0; R23/R76 ≤400 prod LOC (R86 escape hatch if cohesive); byte-pinned OpenAPI drift; dual-lens R14 CLEAN at exact head; R124 both-ways; git-native R3 land.

**ROLLBACK / STOP.** Docs/state only — reversible by reverting the Op 63 commit; no runtime/flag/data impact. Downstream STOP conditions (unchanged): any P0–P3 open; any HEAD/base drift; a fixture contradiction; any design that mints a credential before verified ownership or uses email as a canonical/linking key (D2 hard stop); billing data appearing in any capture/stage/reconstruct path.

**NEXT ACTION.** Dispatch **IMPORTER-H** (backend multi-family reconstruct) as the first V-PR, on deterministic golden fixtures, default-off, landed via the git-native `R3_MERGE_RUNBOOK.md` path — but only after the R138 four-question gate is carried in its PR body and its R14 dual-lens cycle is CLEAN. **NOT dispatched this Op.** Resolve the R3 executor-identity question before the first product-main land.

**Invariants preserved.** `AGENT_RULES.md` not edited (R138 directional decision); `R3_MERGE_RUNBOOK.md` not edited (no permanent R3 change; git-native path mandatory); D2 model, billing exclusion, and the fully-LANDED immutable build order unchanged; mission remains site-agnostic/browser-agnostic (messaging deferred within v1, not dropped from the product); branch controls unchanged; all importer flags default-off (none enabled); no product code changed; `truth_boundaries.no_e2e_proof_yet` still holds; context decision landed R3-clean by the normal context-repo commit convention, audit-exempt per R14 scope.

---

## 2026-07-19 (Op 62) — PR-M3 LANDED via an OPERATOR-AUTHORIZED ONE-TIME BYPASS of the R3 merge doctrine (recorded honestly as R3-INC-3 — NOT R3-clean, NOT rewritten, NOT normalized)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, mobile PR-M3 — honest roster-derived review CTA) + **deliberate one-time R3/runbook exception** + documentation reconciliation
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed here. `AGENT_RULES.md` is UNCHANGED — the operator authorized a one-time bypass, NOT a permanent doctrine rewrite. `R3_MERGE_RUNBOOK.md` is UNCHANGED — it remains the sole default merge doctrine; this landing is an explicitly-recorded exception TO it, not a relaxation OF it. Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Mobile PR #287 (audited head `95c9aea1b2905440a37cb9762e4486e45747165c`, base `b8165beaa3804fe8a145214b772f97a3ae9eab65`) delivers the honest roster-derived review CTA on the paired panel (`useRosterReviewDelta`, typed CTA, analytics slug, flag default-off; Rule 18 baseline guard anchoring only on a successful load). It landed as mobile `main` **`e3a824f335ef75934fe860165ffc9c41a7b7956b`**.

**THE BYPASS (honest, deliberate, authorized).** The merge executors **refused** to author-AND-committer-force `Bradley Gleave <bradley@bradleytgpcoaching.com>` as the git-native `R3_MERGE_RUNBOOK` requires — they declined the forced-identity `commit-tree` as **provenance impersonation** of a human. Rather than block PR-M3 indefinitely, the operator authorized a one-time bypass (**verbatim: "just merge it under whatever name - a one time bypass"**) and it landed via the **FORBIDDEN** server-side path `gh pr merge 287 --repo BradleyGleavePortfolio/growth-project-mobile --squash --delete-branch`. This is the **FIRST DELIBERATE** R3/runbook deviation — distinct from the ACCIDENTAL R3-INC-1 (extension #5/`5eabeec`) and R3-INC-2 (backend #509/`1718293`). It is recorded as **R3-INC-3**, is **NOT R3-clean**, is **NOT rewritten/force-pushed**, and is **NOT to be normalized**.

**Verified evidence (independently re-checked via `gh` this session):**
- **Identity (NON-R3-CLEAN, honest):** git author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`; git committer `GitHub <noreply@github.com>` (login `web-flow`); squash body carries a `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` trailer. These are the standard `gh pr merge --squash` records — **not** forced to Bradley-as-committer, and nothing hidden or rewritten. Not claimed R3-clean anywhere.
- **Tree integrity:** landed tree `91799bbc22aee2ee5608a925e16df2b61c6a84be`, **byte-identical** to the audited head (`95c9aea`) tree.
- **Parent:** single parent `b8165be…` (clean single-parent squash onto the exact expected base; no drift).
- **PR state:** #287 **MERGED** (mergedBy `BradleyGleavePortfolio`, mergedAt `2026-07-19T02:04:36Z`, mergeCommit `e3a824f`) — contrast the git-native path where PRs close `merged=false`. Head branch `feat/import-roster-review-pr-m3` **deleted** by `--delete-branch` (`gh api` → 404; not a zombie).
- **Pre-merge gate (re-resolved immediately before mutation, clean/no drift):** live `main` == expected base `b8165be`; PR head == audited `95c9aea`; `mergeable` MERGEABLE, `mergeStateStatus` CLEAN; head checks green (Analyze actions/js-ts, CodeQL, Typecheck+lint+test).
- **Audit (as reported by the landing executor):** dual-lens exact-head CLEAN at `95c9aea`; behavioral tests added for the Rule 18 guard; suite 296 files / 3577 tests green (delta 3→5=2 / 3→3). R124 both-ways verified (live `gh` PR head.sha == audited `95c9aea`). Figures recorded faithfully; the mobile suite was not re-run by this context reconcile.
- **CI:** post-merge CI GREEN on `e3a824f` (Analyze actions, Analyze javascript-typescript, Typecheck+lint+test); CodeQL green on the audited head pre-merge.
- **Safety:** review CTA behind a default-off flag; no flag enabled; no migration; mobile-only presentation reading the already-authorized coach-scoped reconstructed roster. Billing remains an explicit excluded family.

**Operational findings (recorded, non-blocking):**
1. **R3-INC-3 is the first DELIBERATE R3/runbook deviation** (R3-INC-1/2 were accidental). It is authorized, transparent, and honestly non-R3-clean — explicitly NOT normalized into doctrine.
2. **Standing tension:** the executors' refusal to author+committer-force Bradley conflicts with the runbook's git-native identity requirement. Prospective fix (NOT decided here, operator to weigh): (a) provision an execution environment/signing identity that legitimately maps to `bradley@bradleytgpcoaching.com` so the git-native path is honest, or (b) operator formally amends R3/the runbook. Until then the runbook is the mandatory default and any further deviation requires fresh explicit operator authorization.
3. **Server-side landing specifics:** unlike the backend git-native landings (#508/#510/#511), #287 shows state MERGED and the source branch auto-deleted — expected for the authorized platform path.

**Order / next.** Immutable build order (PR-C1c → D1 → D2 → IMPORTER-F → IMPORTER-G → PR-M3) is now **fully LANDED**. Next lane: **TrueCoach end-to-end vertical proof** — prove one real coach's data (workout, client history, messaging) flows extension-crawl → backend reconstruct → mobile review, end-to-end. **TrueCoach is only the first proving adapter; the core stays site-agnostic/browser-agnostic.** Billing remains excluded. NOT dispatched this Op.

**Rollback / stop.** Forward-only, non-destructive: `git revert e3a824f` via a normal reviewed PR on mobile. **NEVER** history-rewrite / force-push over shared mobile `main` to "fix" the identity (forbidden by R4/R102/runbook §5; reserved to the operator). `e3a824f` is grandfathered exactly like R3-INC-1/2 — the non-R3-clean identity stands on the record, honestly. This context reconcile is docs/state only and reverts by reverting the Op 62 commit.

**Invariants preserved.** AGENT_RULES.md not edited (one-time bypass, not doctrine rewrite); R3_MERGE_RUNBOOK.md not edited (remains the sole default doctrine); R3-INC-1/2 dispositions unchanged (grandfathered, not rewritten), R3-INC-3 added honestly alongside; billing exclusion preserved; importer/review flags default-off (none enabled); mission remains site-agnostic/browser-agnostic; `e3a824f` not claimed R3-clean anywhere; context reconcile itself landed R3-clean by the normal context-repo commit convention, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/287 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/e3a824f335ef75934fe860165ffc9c41a7b7956b

---

## 2026-07-18 (Op 61) — IMPORTER-G LANDED: coach-scoped reconstructed invite-pending roster READ on backend `main` via the git-native `R3_MERGE_RUNBOOK` path (backend bridge realizing the PR-M3 precondition)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-G — backend bridge read) + documentation reconciliation
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed here; no AGENT_RULES.md edit. `R3_MERGE_RUNBOOK.md` is UNCHANGED this Op — its git-native doctrine/mechanics and §5 status remain true; nothing there is stale to reconcile (unlike Op 60, which had genuine Op-58 stale wording). Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Backend PR #511 (audited head `aaf15b824251cd20968b3265cb9c7ef59f7e04eb`, base `1e6b3bf434cb58fbe65cea92a480755f0e414fb6`) adds a coach-scoped, tenant-isolated read (`GET /api/scout/reconstruct/roster`) over the invite-pending `Person`/roster rows materialized by IMPORTER-F — the backend bridge that lets mobile PR-M3 consume an authoritative reconstructed roster. It landed via the git-native `R3_MERGE_RUNBOOK.md` path — git `commit-tree` + PLAIN fast-forward push, **no `--force`, no `--force-with-lease`, no admin bypass, no server-side merge** — as backend `main` **`77bb4a04f6e087886e6f27c5129d17dc5162f356`**.

**Verified evidence (independently re-checked via `gh` this session):**
- **Identity:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens. **R3-CLEAN** — the third R3-CLEAN backend-`main` landing via the git-native path (after #508/`95e2c63` and IMPORTER-F #510/`1e6b3bf`).
- **Tree integrity:** landed tree `b6f548f9cdbd1cd70e5aafc091b28b1ab627d030`, byte-identical to the audited head (`aaf15b8`) tree.
- **Parent:** single parent `1e6b3bf…` (IMPORTER-F tip) → linear/fast-forwardable; drift guard held (base == prior tip, no drift).
- **PR state:** #511 **closed**, `merged=false` (expected for the git-native path; matches the #508/#510 precedent); closed with a landed-SHA comment recording tree byte-identity, single-parent fast-forward, R3 identity, and the operator R100 waiver — not a UI merge and not an approval review. Head branch `feat/importer-g-reconstructed-roster-read` retained (git-native landing performs no canonical branch delete; not a zombie).
- **Audit:** dual exact-head audits at `aaf15b8` CLEAN (body records two non-blocking P3 test-depth notes only); R124 both-ways verified (live `gh` PR head == audited head).
- **R100 A1/A3:** 489 src / 783 test / 1.60 density; cohesive `service` (221) + `dto` (163) each exceed the ~133 src/PR ceiling a 2:1 split would impose. Resolved via operator-signed title-marker exemptions (`[LOC-EXEMPT:]` + `[TEST-EXEMPT:]`) per the R100 escape hatch — an operator waiver recorded in the PR title and close comment, NOT a gate bypass and NOT an R109 metric-gaming split.
- **CI:** post-merge core CI GREEN on `77bb4a0` (build-and-test, Deploy app, rls-live-tests, mwb-3-live-tests, CodeQL JS/TS, rls-floor-guard, actionlint, shellcheck). `build-sbom` + `release-please` remain **pre-existing** red on BOTH base `1e6b3bf` and new main `77bb4a0` (`lefthook: not found` automation debt; NOT an importer regression). `danger dry-run` skipped.
- **Safety:** read-only endpoint; no migration; no new flag — inherits `FEATURE_SCOUT_INGEST` + `FEATURE_SCOUT_RECONSTRUCT` (both default-off); the route is dark unless both are `"true"`. Contract 1.3.0, R80 drift green (42 specs). Billing remains an explicit excluded family.

**Operational findings (recorded, non-blocking):**
1. **Backend `main` remains NOT branch-protected** (`branches/main/protection` → 404), as first recorded at Op 60. The drift guard is git's own non-fast-forward rejection (verified: no drift), not server-side protection. Operator to reconcile intent (enable protection or update the runbook wording). Unchanged this Op.
2. **Pre-existing main-only automation debt persists** (`build-sbom`, `release-please` red on base and new main); worth a separate fix, not introduced here.
3. **IMPORTER-G was not in the originally documented immutable build order** (PR-C1c → D1 → D2 → IMPORTER-F → PR-M3). It is a legitimate dependency-safe backend bridge between IMPORTER-F (roster materialization) and PR-M3 (mobile review handoff): PR-M3 needs an authoritative coach-scoped roster read to consume. Recorded so canonical state no longer marks PR-M3 "next" while omitting IMPORTER-G.

**Order / next.** Immutable build-order semantics unchanged; IMPORTER-G is the read-bridge realizing the PR-M3 precondition. **PR-M3 (mobile honest review handoff) remains the next eligible ordered lane** — NOT dispatched this Op; mobile untouched. Before building PR-M3, verify reconstructed clients materialize in the exact roster read mobile will consume (`/api/scout/reconstruct/roster` and/or `/v1/coach/me/clients`).

**Rollback / stop.** Forward-only, non-destructive: `git revert 77bb4a0` via a normal reviewed PR. NO history rewrite / force-push over shared `main` (forbidden by runbook §5 / R4 / R102; reserved to the operator). This context reconcile is docs/state only and reverts by reverting the Op 61 commit.

**Invariants preserved.** AGENT_RULES.md not edited; D2 decision (Op 59) unchanged; R3_MERGE_RUNBOOK git-native mechanics unchanged and not weakened; billing exclusion preserved; production flags default-off (none enabled); no mobile dispatch/modification; mission remains site-agnostic/browser-agnostic (TrueCoach is only the first proving adapter, not product scope); context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/511 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/77bb4a04f6e087886e6f27c5129d17dc5162f356 · Close comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/511#issuecomment-5013052025

---

## 2026-07-17 (Op 60) — IMPORTER-F LANDED: invite-pending roster reconstruction on backend `main` via the git-native `R3_MERGE_RUNBOOK` path (first R3-CLEAN backend product landing)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Milestone landing (importer product code, IMPORTER-F) + documentation reconciliation
**Files touched (context repo):** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` (§5 stale-wording reconcile only — doctrine/mechanics unchanged). **No product code changed here; no AGENT_RULES.md edit. Documentation/state only — audit-exempt per R14 scope.**

**LANDING.** Backend PR #510 (audited head `c5f86c858a83bec1f46cfe71a52ef3fbb70a5acb`, base `171829326c50778af25c38aa10ff09665e58b512`) reconstructs settled crawl clients into invite-pending, non-login tenant-owned canonical `Person`/roster records per the DECIDED D2 model (Op 59). It landed via the git-native `R3_MERGE_RUNBOOK.md` path — git `commit-tree` + PLAIN fast-forward push, **no `--force`, no `--force-with-lease`, no admin bypass, no server-side merge** — as backend `main` **`1e6b3bf434cb58fbe65cea92a480755f0e414fb6`**.

**Verified evidence (independently re-checked via `gh` this session):**
- **Identity:** author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no AI/co-author tokens. **R3-CLEAN** — the first R3-CLEAN backend-`main` product landing of the wave.
- **Tree integrity:** landed tree `98589b74a354f7292e95386548523e3c796819d9`, byte-identical to the audited head tree.
- **Parent:** single parent `1718293…` (prior tip) → linear/fast-forwardable; parent D1 commit `1718293` REMAINS NOT R3-compliant (R3-INC-2, grandfathered) — neither rewritten nor claimed clean.
- **PR state:** #510 **closed**, `merged=false` (expected for the git-native path; matches the PR #508 precedent); closed with a landed-SHA comment — not a UI merge and not an approval review.
- **Separation of duties:** landed by an independent R3 merge operator (not builder, not auditor); no approval review submitted.
- **Audit/fixes:** both exact-head dual-lens audits CLEAN, **0 open P0–P3 after all five P3 fixes**; R124 both-ways verified; drift guard PASS (base == prior tip, no drift).
- **CI:** post-merge core CI GREEN (build-and-test, Deploy app, rls-live-tests, mwb-3-live-tests, CodeQL JS/TS, rls-floor-guard, actionlint, shellcheck). `build-sbom` + `release-please` remain **pre-existing** red on BOTH base `1718293` and new main `1e6b3bf` (`lefthook: not found` automation debt; NOT an importer regression).
- **Safety:** feature is dark — the route returns a uniform 404 unless BOTH `FEATURE_SCOUT_INGEST` and `FEATURE_SCOUT_RECONSTRUCT` == `"true"`; both default-off, no flag enabled by this landing. Billing remains an explicit excluded family.

**Operational findings (recorded, non-blocking):**
1. **Backend `main` is NOT branch-protected** (`branches/main/protection` → 404) despite the runbook's "protected `main`" / R102 framing. Not a STOP trigger — the drift guard is git's own non-fast-forward rejection (verified no drift), not server-side protection. Operator should reconcile intent: enable protection or update the runbook wording. Mechanics unchanged either way.
2. **Pre-existing main-only automation debt persists** (`build-sbom`, `release-please`); worth a separate fix, not introduced here.
3. **Stale wording reconciled:** `R3_MERGE_RUNBOOK.md` §5 said "D2 remains OPEN/PROTECTED … IMPORTER-F remains BLOCKED on D2" (Op-58 wording), now superseded by Op 59 (D2 DECIDED) and Op 60 (IMPORTER-F LANDED). Updated in this Op **without weakening** the runbook's git-native merge doctrine or mechanics.

**Order / next.** Immutable build order unchanged (PR-C1c → D1 → D2 → IMPORTER-F → PR-M3). Authoritative roster materialization is now LANDED, so **PR-M3 (mobile honest review handoff) is the next eligible ordered lane** — NOT dispatched this Op; mobile untouched. Before building PR-M3, verify reconstructed clients materialize in the exact roster read by `/v1/coach/me/clients`.

**Rollback / stop.** Forward-only, non-destructive: `git revert 1e6b3bf` via a normal reviewed PR. NO history rewrite / force-push over shared `main` (forbidden by runbook §5 / R4 / R102; reserved to the operator). This context reconcile is docs/state only and reverts by reverting the Op 60 commit.

**Invariants preserved.** AGENT_RULES.md not edited; D2 decision (Op 59) unchanged; R3_MERGE_RUNBOOK git-native mechanics unchanged and not weakened; billing exclusion preserved; production flags default-off (none enabled); no mobile dispatch/modification; context reconcile landed R3-clean by plain fast-forward, audit-exempt per R14 scope.

**Evidence URLs.** PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/510 · Landed commit: https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/1e6b3bf434cb58fbe65cea92a480755f0e414fb6 · Close comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/510#issuecomment-4997666736

---

## 2026-07-16 (Op 59) — D2 DECIDED: imported clients are invite-pending, non-login tenant-owned canonical `Person`/roster records (hardened Option 1); IMPORTER-F unblocked

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Architecture decision (importer canonical client target, D2) + documentation reconciliation
**Files touched:** `DECISION_LOG.md`, `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`. **No product code changed; no AGENT_RULES.md edit. Documentation/state only — audit-exempt per R14 scope.**

**Operator directive (this session).** Research cybersecurity and RLS, select the top D2 option, and go with it. This is an explicit operator authorization to close the previously OPEN/PROTECTED D2 node.

**DECISION.** Imported clients live as **invite-pending, non-login `Person`/roster records owned by the coach/tenant** (hardened Option 1). **No `AuthPrincipal` or credential is created during import.** A `Person` is linked to an `AuthPrincipal` only after an explicit, **credential-verified claim** and **verified ownership**, through a **unique `AccountLink`**. Email is **unverified imported data** — never a canonical id and never an automatic linking key. Canonical model: opaque server-issued `person_id`; tenant-scoped `external_ref {source_platform, source_person_id}` as the idempotency/dedup key; states `InvitePending → Invited → Claimed → Suspended → Deleted`. Claim tokens are single-use, single-tenant, short-lived (≤5 min), unguessable; claim is atomic (create `AuthPrincipal` + `AccountLink` + flip `status→Claimed` in one transaction, or roll back all three). Rollback and erasure cascade imported data and links. Billing/payment credentials/methods/cards/vault tokens/profiles/subscription instruments remain **explicitly excluded** (see `billing_scope_exclusion`).

**REAL GOAL.** Immediate, deterministic, coach-visible import continuity with **zero premature credentials** and **one canonical source of truth**, while keeping tenant isolation, consent, deletion, and auditability intact.

**ROOT CAUSE (why D2 blocked IMPORTER-F).** The placement choice fixes the authorization key (tenant vs subject uid), the dedup/idempotency key, the linking gate, and the deletion cascade. None of those can be designed until the record's relationship to a credential is fixed — so `ScoutIngestEntity`→canonical reconstruction cannot begin without D2.

**OPTIONS WEIGHED.**
- **Option 1 — invite-pending non-login roster shell (SELECTED, hardened).** One tenant-owned `Person` record, no credential; deterministic credential-verified link on claim.
- **Option 2 — create a full auth `User` at import (REJECTED).** Manufactures phantom credentialed accounts keyed on unverified imported email — the account-takeover / auto-email-linking pattern vendors warn against; email-uniqueness collisions; unverified recovery paths; high blast radius (a bug can create/claim real logins across tenants).
- **Option 3 — separate staging identity as source of truth (REJECTED).** Two live PII stores duplicate truth, invite drift, and multiply tenant-isolation and deletion-failure surface with no offsetting benefit at TGP scale.

**FIVE-STEP RESULT (Musk Algorithm).** (1) *Questioned the requirement* — import needs a person *record*, not a *login*; the "login at import" requirement is false (Entra/SCIM prove records exist without credentials). (2) *Deleted* — premature credentials, temp passwords, and any second identity store. (3) *Simplified* — one `Person` entity + a `status` flag (SCIM `active` pattern). (4) *Accelerated* — deterministic import completes instantly; coach sees the roster immediately; verification deferred to claim. (5) *Automated last* — automate claim/link/verification only after the manual invite→claim path is proven; automatic email-linking is explicitly **not** automated.

**IDIOT-INDEX RESULT.** Option 1's cost ≈ the intrinsic cost of storing one person row. Options 2 and 3 pay full auth-principal / second-store overhead for the same contact — a high idiot index for no functional gain.

**EXTREME TEST.** 10× (10k clients, one import): O(1) per row via opaque id + `external_ref` upsert; Option 2 would provision 10k credential-less logins (Cognito's "confirmed but no verified recovery" liability at scale). 100× (same human across coaches): correctly two independent tenant-scoped `Person` rows (NIST: identifiers bound to a single subscriber; no cross-association); Option 2's email-keyed logins collide (`AliasExistsException`) and can leak across tenants. Worst case (hostile competitor export): no credentials minted, so a poisoned import can at most create quarantined non-login roster rows inside one tenant, contained by fail-closed RLS and reversible via rollback/erasure.

**HYPERSCALER LENS.** *Copy (evidence-backed):* credential-less pending record (Microsoft Entra External ID), prestaged profile linked before first sign-in (AWS Cognito `AdminLinkProviderForUser`), stable opaque `id` + `externalId` dedup + `active` status + write-only password (SCIM RFC 7643/7644), record-then-bind + no-email-identifiers + single-use short-lived link tokens (NIST SP 800-63C-4), fail-closed RLS + no exposed service key (Supabase), deny-by-default + opaque ids + every-request object checks (OWASP). *Do NOT copy:* full IdP/federation stack, pairwise PPIs / FAL2 machinery, SCIM bulk protocol, temp-password issuance, enterprise directory ops.

**RLS INTENT (vendor-neutral).** Deny-by-default / fail-closed; RLS enabled on every exposed table with nothing granted until a policy allows it. Pre-claim roster rows are **tenant/coach-scoped** (no end-user `auth.uid()` exists yet — a subject-uid predicate would silently fail). Post-claim rows are **subject-uid + tenant scoped**. The importer runs a server-only controlled path; RLS-bypassing service/`bypassrls` credentials are never exposed to the browser or customers. Every request gets an object-level tenant check; ids are opaque and non-guessable.

**GOOD WITHOUT BAD.** Keep deterministic import, roster continuity, no premature credential, single source of truth, credentialed explicit claim + deterministic link, tenant isolation + fail-closed authz, idempotent replay, rollback, audit, deletion. Exclude duplicate staging truth, automatic email-only linking, phantom logins, cross-tenant leakage, billing ingestion, and heavy enterprise identity infra.

**EVIDENCE REQUIRED (met).** Primary-source research report (fetched this session, every claim inline-cited): `/home/user/workspace/D2_universal_importer_identity_decision_report.md`. Primary sources: [Microsoft Entra External ID — B2B guest properties](https://learn.microsoft.com/en-us/entra/external-id/user-properties); [AWS Cognito — federated linking / prestaging](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation-consolidate-users.html); [AWS Cognito — email alias uniqueness](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html); [AWS Cognito — sign-up/admin states](https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html); [SCIM RFC 7643](https://www.rfc-editor.org/rfc/rfc7643); [SCIM RFC 7644](https://www.rfc-editor.org/rfc/pdfrfc/rfc7644.txt.pdf); [NIST SP 800-63-4](https://csrc.nist.gov/pubs/sp/800/63/4/final); [NIST SP 800-63C-4 federation](https://pages.nist.gov/800-63-4/sp800-63c.html); [Auth0 — account linking concept](https://auth0.com/docs/manage-users/user-accounts/user-account-linking); [Auth0 — link user accounts](https://auth0.com/docs/manage-users/user-accounts/user-account-linking/link-user-accounts); [Firebase — account linking](https://firebase.google.com/docs/auth/web/account-linking); [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security); [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [GDPR Art. 5](https://gdpr-info.eu/art-5-gdpr/); [GDPR Art. 17](https://gdpr-info.eu/art-17-gdpr/).

**ROLLBACK / STOP.** If claim volume or fraud shows the manual invite→claim path cannot scale, revisit *automation of claim* (step 5) — never revert to auto-creating logins. **Stop condition:** any design that mints a credential before verified ownership, or that uses email as a canonical/linking key. Reversible by reverting this commit (docs/state only; no runtime/flag/data impact).

**NEXT ACTION.** IMPORTER-F is now **unblocked** (D1 COMPLETE; the R3 merge-path is remediated/proven-forward per `R3_MERGE_RUNBOOK.md`; D2 DECIDED here). Build the default-off client-only reconstruction pass with the §4 canonical model — `Person` (opaque id, `tenant_id`, `external_ref`, `status`, unverified emails), `AuthPrincipal`, `AccountLink`, single-use `ClaimToken`; fail-closed tenant RLS; idempotent `external_ref` upsert; cascade delete/rollback — and land it via the git-native `R3_MERGE_RUNBOOK.md` path only (never a server-side merge). PR-M3 stays blocked until authoritative roster materialization.

### R138 four-question decision gate
1. **Musk's 5 principles.** Applied above (FIVE-STEP RESULT): questioned the "login at import" requirement (false requirement), deleted premature credentials and any second store, simplified to one `Person` + status, accelerated with instant deterministic import, automated claim last. "Don't optimize a thing that should not exist" — a phantom credentialed account should not exist.
2. **What would hyperscalers do.** Entra, Cognito, SCIM, NIST 800-63C, Auth0, Firebase, Supabase, OWASP all structurally separate a record/profile from an authentication principal and gate linking on verified ownership + credential proof — copied above; heavy federation machinery deliberately not copied.
3. **GOOD without the BAD.** Roster continuity and instant import (GOOD) without phantom logins, auto-email-linking, cross-tenant leakage, or a duplicate store (BAD) — gated by credential-verified atomic claim, opaque ids, and fail-closed tenant RLS.
4. **Root cause.** Attacks the root cause: the record↔credential relationship is fixed (record exists credential-free; credential bound only on verified claim), which unblocks the authorization key, dedup key, linking gate, and deletion cascade that IMPORTER-F needs.

**Invariants preserved.** AGENT_RULES.md untouched; R3/R14/R15/R102 unchanged and unrelaxed. Immutable build order preserved: PR-C1c COMPLETE → D1 COMPLETE → **D2 DECIDED** → IMPORTER-F (unblocked; land via `R3_MERGE_RUNBOOK.md`) → PR-M3 (blocked until authoritative roster). Billing remains an explicit `excluded` family; auth/PII/RLS/flags doctrine unchanged; all importer flags default-off; no production flag enablement and no deploy; backend/mobile/extension product code untouched.

**Audit exemption.** Pure context/state documentation — exempt from the product audit cycle (R14 scope). The IMPORTER-F *implementation* PR that consumes this decision remains fully subject to R14 dual-lens audit + the R3 merge runbook.

**Companion doctrine.** Subject to R131 — revisitable. Re-verification date: 2026-10-16.

---

## 2026-07-16 (Op 58) — R3 merge-path remediation: git-native squash + PLAIN fast-forward runbook adopted; server-side merges forbidden for production `main`

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Operational/process remediation (R3 / R5 / R102) + documentation reconciliation
**Files touched:** `handoffs/importer-wave/R3_MERGE_RUNBOOK.md` (new), `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`. **No product code changed; no AGENT_RULES.md verbatim edit. Documentation/state only — audit-exempt per R14 scope.**

**Summary.** Codified the fix for the R3-INC-1 / R3-INC-2 recurrence (GitHub server-side squash stamping a non-Bradley author/committer). A new canonical runbook, `handoffs/importer-wave/R3_MERGE_RUNBOOK.md`, makes the **git-native squash + PLAIN fast-forward push** the SOLE mandated mechanism for landing any importer-wave PR on any production `main`. Server-side merges are **FORBIDDEN for `main`**: the GitHub squash UI button, `gh pr merge` (any mode), the REST/GraphQL merge endpoints, and GitHub web edit/commit flows — each re-authors the commit and violates R3.

**Root cause (from the read-only investigation).** GitHub's server-side squash **cannot** set author AND committer to `Bradley Gleave <bradley@bradleytgpcoaching.com>` — it forces committer=`GitHub` (to sign) and author=account identity. The defect is **avoidable, not inherent**: backend **PR #508** landed `95e2c6378e0b1b734328a7fdf6b9a6e33465a663` on backend `main` with full R3 author AND committer via a git-native squash-and-push one commit before the defect. That is the empirical proof the R3-clean path exists.

**Mandated path (fail-safe by construction).** (1) verify exact audited head + base with R124 both-ways and confirm base == live remote `main` tip (drift guard); (2) `git commit-tree` with tree == audited-head tree, single parent == pinned base, BOTH author AND committer forced to Bradley Gleave via env + `-c`; (3) **mandatory preflight identity check** (author, committer, tree, parent) before any push; (4) **PLAIN fast-forward push** (`git push origin <sha>:main`) with **NO `--force`, NO `--force-with-lease` ANYWHERE on `main`, NO admin bypass** — git's own non-fast-forward rejection is the drift guard, and on rejection the response is STOP and re-audit, never force; (5) **mandatory post-push verification** of remote identity + tree + required checks; STOP if branch protection rejects (no unprotect, no bypass). The sequence contains no force flag and pins the commit's single parent to the audited base, so it **cannot force-push and cannot land a drifting SHA**.

**Supersession (no AGENT_RULES edit).** This runbook **refines** `merge_procedure_change_2026_07_14`: where that entry said "lease-safe fast-forward (`--force-with-lease` pinned to the known base)", on `main` we now use a **PLAIN fast-forward** and `--force-with-lease` is used **nowhere on `main`** (it remains permitted only for `wip/*` snapshot branches per R6/R161). AGENT_RULES.md is untouched; R3/R14/R15/R102 are unchanged and unrelaxed. (Per the footer rule, no AGENT_RULES change means no rule-change entry is owed; this is a process/runbook decision.)

> **[Op-74 annotation, 2026-07-27 — miscitation flagged in place; the paragraph above is RETAINED VERBATIM and NOT rewritten (R5/R132).]** The citation "**per R6/R161**" above is a **miscitation: R161 does not exist and never has.** The canonical enumeration is R1 → R126 and R130 → R138. The substance of the citation — `--force-with-lease` permitted only for `wip/*` snapshot branches — is fully and correctly carried by **R6** alone (checkpoint-driven foreground pushes, which mandates `git push --force-with-lease origin HEAD:wip/<lane>-snapshot` for builder/fixer snapshots). **Read the citation as R6.** No decision recorded in that entry changes; only the phantom rule number is corrected, and it is corrected by annotation rather than by editing the historical record. Per R-RULE-AUTHORITY-1 §4, a cited-but-nonexistent rule number is a **STOP condition to raise, never a licence to invent rule text**. See the Op-74 entry at the top of this log.

**R3-INC-2 disposition.** Remediation **PROVEN FORWARD**; incident **CONTAINED**. The historical GitHub-synthesized merge commit `171829326c50778af25c38aa10ff09665e58b512` is **GRANDFATHERED — NOT rewritten, NOT force-pushed, and NOT claimed R3-clean** (the canonical-identity copy of the D1 work survives on `refs/pull/509/head` = `81f0b70`). Residual (non-blocking): close the cause investigation of why #509 used the GitHub squash path; optional operator-gated R3/R102 verbatim tightening to name the runbook.

**Scope preserved.** Reversible importer work **REOPENS** under the runbook. **D2 remains OPEN/PROTECTED — NOT decided here.** IMPORTER-F is now blocked **ONLY on D2** (the R3 merge-path gate is cleared; D1 is complete). PR-M3 remains blocked until authoritative roster materialization. Immutable build order, billing exclusion (`excluded` family), auth/PII/RLS/flags doctrine, and backend/mobile product code are all unchanged; no flag enablement or deploy.

**Audit exemption.** Pure context/state documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

---

## 2026-07-16 — Backend D1 COMPLETE (golden TrueCoach fixture, PR #509) + R3-INC-2 merge-identity incident recorded

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Canonical state reconciliation (docs/state only) + operational/process finding (R3 / R5)
**Files touched:** `handoffs/importer-wave/current-state.json`, `handoffs/importer-wave/OPERATOR_HANDOFF.md`, `DECISION_LOG.md`, `handoffs/process-findings/2026-07-16-backend-pr509-r3-merge-identity.md` (new). **No product code changed; documentation/state only — audit-exempt per R14 scope.**

### Part 1 — Backend D1 marked COMPLETE

**Summary.** The golden real TrueCoach client-payload fixture produced by extension PR-C1c (#7) has been committed to the backend at `test/fixtures/truecoach/clients.golden.json` via **backend PR #509** and squash-merged to backend main. D1 (the golden-fixture prerequisite for IMPORTER-F) is now **COMPLETE**.

**Verified facts.**
- PR #509: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/509
- Base `95e2c6378e0b1b734328a7fdf6b9a6e33465a663`; audited PR head `81f0b70a54a512a454289dade7755b34902e3564`.
- Fresh **Lens A CLEAN** and **Lens B CLEAN** after the PR-body fixer update; no drift.
- Squash-merged `2026-07-16T00:44:49Z`; backend main now `171829326c50778af25c38aa10ff09665e58b512`.
- Fixture/spec: `test/fixtures/truecoach/clients.golden.json` + `test/truecoach-golden-fixture.spec.ts`; source extension path `test/fixtures/cdp-traces/truecoach-clients.json` @ `4f116836ddb5449524dd51e995a7e4c012f79493`.
- Provenance byte-pin: blob sha1 `826fc5124a1cb6d45c9fbb87b5d3437974b8c3c2`, 2668 bytes, sha256 `af0387fea53dac5a9622c7de6d142c53986b6f4995784eccd6c51f204557e71f`.
- Merged-main verification: jest fixture spec **5/5 pass**; strict `tsc` exit 0; **15 pre-merge CI checks green**; **zero production LOC**; **billing excluded**; no auth/PII/RLS/flags/mobile changes.

**Build-order effect.** Immutable order preserved: PR-C1c COMPLETE → **D1 COMPLETE** → **D2 OPEN/PROTECTED (NOT decided here)** → IMPORTER-F (blocked until D2 **and** R3 merge-path remediation) → PR-M3 (blocked until authoritative roster). D2, auth/PII/RLS/billing doctrine, and build order are unchanged by this reconcile.

### Part 2 — R3-INC-2 (merge-identity incident) recorded honestly

**Summary.** The source PR head `81f0b70` was **R3-clean** (author AND committer both Bradley Gleave <bradley@bradleytgpcoaching.com>). However, PR #509 was landed via a **GitHub server-created squash merge**, and the resulting merge commit `171829326c50778af25c38aa10ff09665e58b512` is **author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, committer `GitHub <noreply@github.com>` — NOT R3-compliant.** This is a **repeat of R3-INC-1** (same GitHub-squash identity failure) despite `merge_procedure_change_2026_07_14`, which mandated identity-safe manual squash + lease-safe fast-forward for future TGP merges.

**Decision.**
- Record R3-INC-2 as an **OPEN operational/process finding** with the exact SHA, cause **under investigation**, and **bounded blast radius (identity metadata only; code/test content verified)**.
- **Do NOT rewrite or force-push shared backend main** (destructive provenance alteration; declined consistent with R3-INC-1). backend main remains `1718293`.
- **Do NOT mislabel the merge commit as R3-compliant** anywhere in canonical state.
- **HARD GATE:** no further production-main merges on ANY TGP repo (extension, backend, mobile) until a **non-destructive R3-compliant merge path is proven**. IMPORTER-F is additionally blocked on this gate.

**Prospective fix.** Prove and adopt the identity-safe manual squash + lease-safe fast-forward path on a real TGP merge before any further production-main merge; investigate why #509 bypassed it and close the gap so GitHub-generated squash cannot be used for TGP production merges.

**Audit exemption.** Pure context/state documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

---

## 2026-07-15 — Importer product-mission correction (site-agnostic/browser-agnostic; TrueCoach = first proof, not the product)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Product-mission correction (R5) + documentation reconciliation
**Files touched:** `roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md` (new canonical mission doc), `roadmap/M-IMPORTER-EXTENSION_v1.md` (demoted to first-vertical-slice build-plan), `handoffs/importer-wave/AGENT_HANDOFF_V03_2026-07-14.md` (§0-MISSION preamble), `handoffs/importer-wave/current-state.json` (`product_mission_correction_2026_07_15` block), `DECISION_LOG.md`, `roadmap/OPERATOR_DECISIONS_LOG.md`. **No product code changed.**

**Operator quote (verbatim, 2026-07-15 — do not paraphrase; preserved per R5):**
> "WRONG - your building a site agnsotics, ultra easy to use, browser agnostic tool that can seamlessly and autonymously pull ALL data from any comeptitors site - send to TGP Database, and be reconstructed to our set values instantly with a luxury UI while doing so!"

**Summary.** The operator corrected the importer mission: the product is **site-agnostic, browser-agnostic, autonomously-learning acquisition of ALL user-authorized data → TGP database → deterministic reconstruction into TGP's set values → luxury UI, with honest completeness accounting.** Prior canonical wording (chiefly `M-IMPORTER-EXTENSION_v1.md`) mistook **TrueCoach v0.3** — one proving adapter — for the whole product, and implied Chrome-only + a per-competitor mapped-extractor treadmill. TrueCoach on Chrome is now recorded explicitly as the **first proving adapter / vertical slice only.**

**Decision (R138 gate recorded in `M-IMPORTER-PRODUCT-MISSION_v1.md` §4; three options weighed in §5).** Selected **Option C** — split the mission (new canonical doc, verbatim quote at top) from the build-plan (`M-IMPORTER-EXTENSION_v1.md`, demoted to the first vertical slice), reconcile the state + handoff wording, and add a six-workstream PR graph (extension core, browser portability, autonomous learning, canonical mapping/reconstruction, backend orchestration/progress, luxury UI) that carries the wave from the proof to v1.0. Rejected Option A (leave stale wording — fails the correction + R5) and Option B (rip out TrueCoach/Chrome and build full generality before shipping — discards the audited, merge-ready v0.3 proof; violates R4 + "automate last").

**What is preserved.** The live v0.3 implementation (EXT-C1b PR #6 @`55f24d5` merge-ready; Mobile M2 PR #285 @`10414c4` dual-lens r2 in progress) is unchanged and authoritative — it is the first end-to-end proof. The engine (#5) is already `chrome.*`-free and host-injected, so the mission architecture is already partly built.

**Legal/security invariants clarified (mission doc §2, hard constraints R136):** no source-credential storage on TGP servers; user-authorized access only; no bypass of source access controls; fail closed on ambiguous mappings; never claim inaccessible data was imported.

**Five distinctions made explicit (mission doc §3):** MISSION ≠ FIRST PROOF ≠ CURRENT STATE ≠ v0.3 COMPLETION (current launch bar) ≠ v1.0 ACCEPTANCE (mission made testable).

**Audit exemption.** Pure context/documentation reconciliation — exempt from the product audit cycle (R14 scope). Reversible by reverting the commit; no runtime/flag/data impact.

**Companion doctrine.** Subject to R131 — revisitable. Re-verification date: 2026-10-15.

---

## 2026-07-13 — Add R138 (Operator Autonomy Grant + Four-Question Decision Gate + 24/7 Layered Wake)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Doctrine addition + governance supersession
**Files touched:** `AGENT_RULES.md` (new §14 / R138; supersession notes on R9 and R15; audit-lens line in Appendix A), `DECISION_LOG.md`.

**Summary.** The operator, acting as CEO/CPO/CTO, delegated full executive authority to the acting agent for Bradley Gleave's TGP project: no operator approval is required for any decision — merging, squash-merging, or directional choices — provided the agent FIRST runs and records a mandatory four-question decision gate. Added as **R138** (new §14), with the operator's words preserved verbatim (both the CEO/CPO/CTO grant and the "stay awake forever / wake up anytime something finishes" durability addendum) per R5.

**What R138 delegates.** The R9 "Agent MUST present an operator choice" boundaries (a)–(j) and R15's "No PR merges to production `main` without operator approval" are SUPERSEDED **for this operator/project only** — replaced by the four-question gate. Both rules remain canonical for any other operator/project and were not deleted (prior doctrine preserved per R5/R132).

**What R138 does NOT waive (GOOD without the BAD).** The R14 audit cycle stays mandatory for product code (delegated *approval*, never the *audit*); R1 (decacorn) and R3 (identity) are SACRED and untouched; irreversible external side effects still require flag + expand-contract migration + idempotency + monitoring + rollback (hyperscaler pattern), not a bypass. Precedence: R138 is subordinate to R1/R3/R14.

**The four-question gate (operator's questions, each with a researched standard).** (1) Musk's 5-step Algorithm in order — question → delete → simplify → accelerate → automate (§13 R130–R137; [Inc./Isaacson](https://www.inc.com/jeff-haden/elon-musks-algorithm-a-5-step-process-to-dramatically-improve-nearly-everything-is-both-simple-brilliant.html)); (2) What would hyperscalers do — canary/one-box rollouts, automated rollback, blast-radius containment, pipeline gates instead of per-change human approval ([AWS Builders' Library](https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/), [Google Cloud approach-to-change](https://docs.cloud.google.com/docs/cloud-approach-to-change), [Google safe rollouts](https://docs.cloud.google.com/kubernetes-engine/config-sync/docs/tutorials/safe-rollouts-with-config-sync)), plus [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests) for retry-safe decisions; (3) GOOD without BAD — keep velocity, gate risk with flag+canary+rollback+audit; (4) root-cause check (composes with R131/R19). The gate is recorded as an `R138 Decision Gate` block in the PR body (+ a DECISION_LOG entry for doctrine/architecture decisions); a governed merge/pivot without the record is a P1 finding.

**24/7 layered wake / durability (reconciled with R6 no-daemon).** Layered: (1) survive death first — push ≤2 min + checkpoints (R4/R6); (2) event-driven wake on completion (primary); (3) foreground heartbeat/scheduled wake for external state only (NOT a background daemon — R6's deprecated auto-push daemon stays banned); (4) watch coverage must match failure states, not just success; (5) zombie sweep on every pickup + session end (R8); (6) subagent liveness probes ≥ every 15 min (R7).

**R125 enforcement.** (1) rule text — this PR; (2) gate/enforcement — the mandatory R138 Decision Record + this DECISION_LOG entry (the machine-checkable delegated-approval artifact); propagation into product-repo PR templates (R101) + a heading-presence CI check tracked as R125/R20 follow-up; (3) audit-lens — added to Appendix A. Enforcers (1) and (3) land in this PR; enforcer (2) lands as the Decision-Record convention with the CI-check propagation tracked as follow-up.

**Audit exemption.** Pure context/doctrine docs are exempt from the product audit cycle (R14 scope); this change required only the four-question gate + this DECISION_LOG entry, and was merged under the R138 grant once applicable checks were green.

**Companion doctrine.** Subject to R131 — R138 is revisitable. Re-verification date: 2027-01-13.

---

## 2026-06-30 — Add R130–R137 (First-Principles Doctrine)

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Doctrine addition
**File touched:** `AGENT_RULES.md` (new §13, +6.3 KB)

**Summary.** Added eight new rules encoding Elon Musk's "Algorithm" (question → delete → simplify → accelerate → automate) plus two supporting rules:
- **R130** — Idiot Index (actual vs. theoretical-minimum cost, flag ≥ 3× ratios).
- **R131** — Question every requirement (including these rules; last-verified date required if > 6 months).
- **R132** — Delete before optimizing (if you don't add back ≥ 10%, you didn't delete enough).
- **R133** — Simplify only after R131 + R132.
- **R134** — Accelerate cycle time only after R131–R133.
- **R135** — Automate last.
- **R136** — Constraint audit: separate hard constraints (physics, TOS, regulation) from self-imposed policy (self-imposed → subject to R131).
- **R137** — Cycle-time ledger: per-wave dispatch/round/merge log; > 3-round PRs get a root-cause; > 1 lens-disagreement PRs get a doctrine-gap note.

**Motivating evidence (this wave, W1.5).** Two lens-disagreements produced audit-round waste that R131 + R137 would have prevented:
1. **R82 IRREVERSIBLE misread.** Round-1 fixer marked the `pg_stat_statements` migration IRREVERSIBLE with a comment; Lens A accepted it, Lens B correctly rejected it in round 2 ("every migration has a `down`"). R131 would have forced re-verification of "IRREVERSIBLE" as a doctrine escape hatch.
2. **R75 misread as src-only.** Lens A originally missed 27 banned-cast hits in `test/observability/*` because the auditor read R75 as applying to `src/` alone. The rule verbatim covers `src/` AND `test/`. R131 (question the reading) + R137 (log the disagreement) would have caught this in round 1.

**R136 immediate application — extension redesign.** The concurrent importer-extension design work anchors on R136: the only hard constraints for the browser extension are Chrome MV3 sandboxing, per-site TOS rate limits, and the locked `_interface.js` contract. Everything else (TGP-initiated-only flow, absence of in-popup auth) is self-imposed and is being challenged in the redesign.

**Scope confirmation.** Operator (via ask_user_question 2026-06-30 17:03 PDT) selected "All eight (R130–R137)" and "Push now" (do not wait for wave close).

**Companion doctrine.** R131 obliges this rules addition itself to be revisitable. Re-verification date: 2026-12-30.

---

## 2026-07-13 — Adopt Autonomous CEO/CPO/CTO Operating Constitution

**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Category:** Constitutional doctrine
**Canonical file:** `AGENT_RULES.md` — Operator Constitution Addendum

### Decision record

**DECISION:** Preserve the operator's constitution verbatim inside the single canonical `AGENT_RULES.md`; apply it proportionally to every importer decision and require concise decision records without exposing raw chain-of-thought.

**REAL GOAL:** Keep autonomous execution fast while making consequential choices evidence-based, reversible, root-cause-oriented, and operable at hyperscaler quality.

**ROOT CAUSE:** Prior doctrine contained the component principles, but the decision sequence, option-selection discipline, extreme tests, good-without-bad synthesis, and standard record were fragmented.

**FIVE-STEP RESULT:**
- **Questioned:** A second canonical rules file was rejected because `AGENT_RULES.md` is the sole source of truth.
- **Deleted:** No duplicate constitution file or approval ceremony was added.
- **Simplified:** One verbatim addendum and one standard decision-record shape.
- **Accelerated:** The recurring importer watchdog now loads the same canonical doctrine each run.
- **Automated last:** Automation only enforces the already-simplified decision record and execution loop.

**IDIOT-INDEX RESULT:** Added no new service, dependency, state machine, or approval handoff; one source of truth governs all roles.

**EXTREME TEST:** At 100× work volume or after agent/session failure, the canonical rules plus live state and pushed commits remain sufficient to resume safely.

**HYPERSCALER LENS:** Small reversible PRs, exact-head audits, CI gates, canonical state, bounded failure, rollback, and observable evidence remain mandatory.

**GOOD WITHOUT BAD:** Preserve autonomous velocity and broad executive ownership while retaining independent audits, security boundaries, irreversible-action gates, and project doctrine precedence.

**EVIDENCE REQUIRED:** Exact constitution text in `AGENT_RULES.md`; watchdog references that canonical section; dual-lens CLEAN and CI remain merge gates; live state updated after audit/fix/merge.

**ROLLBACK / STOP:** Constitutional changes require an explicit operator instruction and signed doctrine commit. Product execution stops only at proven v0.3 E2E completion or a genuine external blocker.

**NEXT ACTION:** Build the narrowest end-to-end autonomous crawl unit: Start Import CTA → site-agnostic discovery/replay → bounded ingest/progress, then independently audit it.
