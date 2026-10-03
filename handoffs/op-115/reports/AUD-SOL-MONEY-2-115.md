# AUD-SOL-MONEY-2 / operator 115

Lens: GPT-6.1 Sol. Queue: backend #628, #641, #642. T4.

## Prior findings decided before candidate review

- **#628:** Sol's last verdict has **B-628-11 open** (a failed canonical invoice read can erase durable collected-money evidence) and **C-628-12** (push transport remains at-least-once after claim expiry); B-628-6 and B-628-8 were closed, and earlier closures must remain intact. Candidate closure is not yet determined. [Last Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5965086662)
- **#641:** Sol's last verdict has **B-641-7 open** (late webhook reversal after provider-key expiry), **B-641-8 open** (expired recovery rows starve fresh rows), and **C-641-2** (cross-PR integration); B-641-1 through B-641-6 were previously closed. Candidate closure is not yet determined. [Last Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5965207810)
- **#642:** Sol's last verdict has **B-642-1 open**, requiring deployed Google-session account deletion before enabling Google signup. Candidate closure requires checking the deployed dependency evidence and current DTO/handler/tests, not merely the flag diff. [Last Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960161965)

## Current work

Waiting for exact-head READY FOR AUDIT and required checks. No candidate verdict posted yet. Raw PR metadata and authoritative comments retained under `ops/aud-115/AUD-SOL-MONEY-2/`.

### Claim collision at intake

All three atomic claim attempts failed; the existing AUD-SOL-MONEY lane is finishing already-started heads rather than transferring them mid-review. No takeover, duplicate verdict, candidate source review, or probe was performed by this lane. [Existing lens handoff](/home/user/workspace/ops/reports/AUD-SOL-MONEY-115.md)

| PR | Current exact head | This lane's disposition |
| --- | --- | --- |
| #628 | `9b48d91edadfff3a473bf71c848124ca34c5ebbb` | SKIP: existing Sol claim |
| #641 | `4220acc74823ac50c35d1af6b8a35a93736517d2` | SKIP: existing Sol claim |
| #642 | `4fee3c0236eaa793f847a89e9393160b9f12a41c` | SKIP: existing Sol claim |

This lane remains active for subsequent unclaimed heads and appended queue items.

### Claimed #641 advancing head

This lane successfully claimed **#641 @ `1ad67022baf157b94226c4d6a73159eb4ead2ba1`**. Read the entire 1,458-line own delta from the last Sol verdict, including schema/migration, owner-only reconciliation routes, shared reversal admission, paging, logger, runbook, and fixture changes. Main merge reconstructs the exact committed tree `f8c7f7689504b10990cedb024a5e235d4e9a3690`; no manual conflict changes. Exact-head CI/READY pending; no verdict yet. [Candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/1ad67022baf157b94226c4d6a73159eb4ead2ba1)

Audit-only probes prepared for canonical reversal reuse, partial-receipt terminalization, arbitrary Error.name logging, and cross-run fairness at the bounded page seam. No probe result claimed yet.

#### Advancing-head review and preliminary executed findings

Claimed **`02cd3f88c381f7ccf24e84f821e96418bab66f37`** and read its complete additional payout-reason mapper/test delta; refund probe inputs are unchanged. The first probe run executed **4 failing acceptance assertions / 25 passing controls** at the preceding exact source. An exact-current-source rerun adds the new payout controls and is pending. [Executed first probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143301213) [Current-source probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143563992)

- **B-641-8, remaining fairness seam:** each run restarts its keyset at null and stops after 20 pages. Persistent eligible failures occupying those pages are retried again next run, leaving the fresh recoverable row beyond the boundary untouched; two real sweeps show zero external/local recovery for it. The test scales `limit` to 1; the default equivalent is 1,000 prior pending rows. Preserve bounded work with durable fair continuation, cooldown, or last-attempt ordering rather than restarting on the same failures. [Sweep lines 690–736](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/02cd3f88c381f7ccf24e84f821e96418bab66f37/src/checkout/refund-dispute-handler.service.ts#L690-L736) [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143301213)
- **B-641-9:** an unattributed canonical reversal can be assigned to two distinct refunds: external **122**, local **244**, both obligations marked done. Bind canonical reversal identity uniquely and atomically to its refund; metadata-only attribution is insufficient for manual legacy reversals. [Reconciliation lines 834–885](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/02cd3f88c381f7ccf24e84f821e96418bab66f37/src/checkout/refund-dispute-handler.service.ts#L834-L885) [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143301213)
- **B-641-10:** a canonical **10-cent** reversal terminalizes the **122-cent** refund-share obligation; the residual **112 cents** disappears. Persist canonical receipt/residual arithmetic and mark done only at full verified settlement, or refuse an undersized receipt without terminalizing it. [Reconciliation lines 869–886](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/02cd3f88c381f7ccf24e84f821e96418bab66f37/src/checkout/refund-dispute-handler.service.ts#L869-L886) [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143301213)
- **B-641-11:** arbitrary Error.name reaches the logger as a supposed machine code. Use a closed error-class/code catalog with an unknown fallback and a canary for arbitrary names/provider codes. [Classifier and sink](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/02cd3f88c381f7ccf24e84f821e96418bab66f37/src/checkout/refund-dispute-handler.service.ts#L54-L60) [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143301213)

These are preliminary findings, not a posted exact-head verdict. B-641-7's reported late-webhook/expired-key subcase is addressed by the shared first-attempt admission and its failing-before tests; B-641-8's expired-row subcase is addressed but the above cross-run subcase remains. [Failing-before admission/fairness proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37140882622)

### Claimed #628 advancing head

Claimed **#628 @ `33e0696a8e3de0f0d33066282f44ba1c502773bb`**, read the full two-file R8 own delta, and verified its main merge exactly reproduces tree `b4f1dcd54335b1b681acfb201317d135cec5c1e8`. The specific prior 401/403 failure is addressed with unknown-state retention and later authorized recovery tests; additional non-authoritative 400 validation classification is being tested, not yet claimed as an executed defect. [Candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/33e0696a8e3de0f0d33066282f44ba1c502773bb) [Probe CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143497313)

## Posted verdicts — this lane

| PR | Exact head | Verdict | A/B/C | Comment |
| --- | --- | --- | --- | --- |
| #628 | `33e0696a8e3de0f0d33066282f44ba1c502773bb` | REQUEST CHANGES | 0/1/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5972111414) |
| #641 | `02cd3f88c381f7ccf24e84f821e96418bab66f37` | REQUEST CHANGES | 0/4/1 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5972111823) |

- **#628 B-628-11:** specific 401/403/404 cases close with **six failing-before cases / 64 passing after controls**, but the new generic 400-invalid-request classifier still admits non-authoritative validation refusals. Exact-source CI executes **2 failing foreground/background assertions / 122 passing controls**; durable external collection remains 15,000 cents while the journal terminalizes as `already_paid`. The full comment qualifies synthetic provider ordering and cites the actual Stripe contract. [Before proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143230783) [Executed current probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143497313) [Posted finding](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5972111414)
- **#641:** B-641-7's reported shared-admission defect closes; B-641-8 remains narrowed to cross-run fairness, with new B-641-9 canonical-receipt reuse, B-641-10 undersized-receipt terminalization, and B-641-11 free-text Error.name logging. Exact-current-source CI executes **4 failing assertions / 28 passing controls**; C-641-2 composition remains carried. [Executed current probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143563992) [Posted findings](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5972111823)

Both blocking verdicts were posted after re-reading the live full head and checking for an existing same-head Sol verdict. Required build-and-test was still pending; neither verdict claims green merge eligibility. No heavy local work, candidate-branch push, production, provider, deploy, or flag action occurred.

### Shared-lens verdict already delivered

**#642 @ `4fee3c0236eaa793f847a89e9393160b9f12a41c`: APPROVE, A/B/C 0/0/0**, posted by the existing AUD-SOL-MONEY lane; this lane did not issue a second verdict. Strict current-main update and exact-head CI remain necessary before merge. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5971940347)

**#628 @ `9b48d91edadfff3a473bf71c848124ca34c5ebbb`: REQUEST CHANGES, A/B/C 0/1/0**, posted by the existing AUD-SOL-MONEY lane. This becomes the prior Sol finding for the next unclaimed head: B-628-11 remains open because current 401/403 failures do not establish an earlier payment's outcome; failed-read retention and C-628-12 were closed. [Sol verdict and four executed counterexamples](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5971971999)

### #642 prior-finding disposition correction

The binding operator train ruling closes B-642-1 by **#608 deployment ordering**, with Google-only in-app device acceptance still operator-owned; it does not require this lens to introduce a new device merge blocker. Source/test verification belongs to whichever lens successfully claims the next candidate. [Recorded operator ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/LAST_OPERATOR_STATE.md#L484-L486)

## FINAL PAUSE HANDOFF — 2026-10-03 18:26:55 UTC

**ENDED under the operator's binding 11:25 PDT PAUSE instruction.** `LENSES_MAY_END` exists. The final wait-loop invocation returned `NOTHING AUDITABLE after 0s`; the live five-item snapshot contains no advancing merge-only head. No new full audit was started after PAUSE.

### Queue state at shutdown

| PR | Current full head | Current Sol state | A/B/C | Comment / next step |
| --- | --- | --- | --- | --- |
| #628 | `33e0696a8e3de0f0d33066282f44ba1c502773bb` | REQUEST CHANGES, posted | 0/1/0 | [Current Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5972111414). Both lenses request changes; builder owns the fix. All 17 returned check entries succeed, but the branch is BEHIND main. |
| #641 | `02cd3f88c381f7ccf24e84f821e96418bab66f37` | REQUEST CHANGES, posted | 0/4/1 | [Current Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5972111823). Both lenses request changes; builder owns the fix. All 17 returned check entries succeed, but the branch is BEHIND main. |
| #642 | `4fee3c0236eaa793f847a89e9393160b9f12a41c` | APPROVE, inherited same-lens verdict | 0/0/0 | [Current Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5971940347). Dual approval retained; 17 returned check entries succeed. BEHIND main: update plus short exact-head merge-delta audit remains operator-owned. |
| #627 | `6c7706e17d8708913344e4f12b3ff0d4086645ab` | No verdict at this head | Not assigned | Previous Sol RC **0/1/0** at `3a5338d72c277238486452f7f256da2d8e22c7c8`: [B-627-10 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5972047312). Current head is DIRTY/CONFLICTING, reports no checks and has no exact-head READY. |
| #654 | `02c48de710f9f69bfc985336eb14249663bbb638` | REQUEST CHANGES draft only; NOT POSTED | Provisional 0/3/0 | [Exact-head builder round](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5971989117). Build-and-test rerun is IN_PROGRESS; 12 successes, 1 skip, 1 pending and no exact-head READY. Previous published Sol verdict is RC **0/4/0** at `795110b717b1554045d13bf596eeacb0c38f19c6`: [Previous published verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5965039762). |

The queue-state evidence is saved as `ops/aud-115/AUD-SOL-MONEY-2/pause-{628,641,642,627,654}.json`; the wait output is `pause-final-wait.log`. The pending #654 result is not represented as green, and the unposted draft is not represented as a delivered verdict. [Pending exact-head build](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142946943/job/111263273650)

### Transferred #627 — prior finding decided before delta review

The transferred prior is **B-627-10**, arbitrary Error.name logged when parking a lost send claim fails; B-627-9 and earlier reported boundaries remain closed, not reopened. Claimed the current head and read the complete two-file delta from the prior verdict. [Prior Sol disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5972047312)

The current source replaces name/code interpolation with a closed `ParkFailureKind` vocabulary derived from concrete Prisma classes, with `unknown` fallback; two added actual lost-fence/failed-park cases cover arbitrary name/message/code and a real Prisma known-request error without changing the original exception or admitting a Stripe send. The source appears to address B-627-10, but **closure is not certified** without the round's failing-before evidence, exact-head current CI/READY and conflict-resolution delta review. No APPROVE or new B count was posted. Reviewed delta: `627-own.diff`; worktree: `/home/user/workspace/wt/AUD-SOL-MONEY-2-627`.

### Transferred #654 — completed in-flight source review, posting gate unmet

The existing same-lens draft and exact-source probe were reused under the explicit handoff. Read the entire 2,053-line round-2 delta and complete 102-line diagnostic follow-up, including migrations/rollback, schema, webhook redelivery, request pinning, replay/retirement authority, plan read, error details, fixtures and tests. The current own changes comprise 12 files; the inherited #627 stack is not silently approved. [Prior Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5965039762) [Exact-head round](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5971989117)

Prior **B-654-1/6/7** close at their reported lookup, paid/no-sheet and relabeled-terms boundaries; **B-654-5** remains narrowed to blindly replaying an uncertain create after provider idempotency retention may expire. The draft adds **B-654-8** (unknown cancellation still expires a payable attempt) and **B-654-9** (arbitrary Error.name or regex-shaped code reaches diagnostics). Re-read the shared actual-service probes and execution logs: **four acceptance failures / 25 passing candidate controls**, including two diagnostic canaries. No new probe was dispatched after PAUSE. [Exact-source executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143128666)

The ready-gated **0/3/0** draft is preserved in `ops/aud-115/AUD-SOL-MONEY-2/654-held-verdict-draft.md` and the reused probe in `654-inherited-probe.spec.ts`; original execution evidence remains in `ops/aud-115/AUD-SOL-MONEY/654-current-probe-ci.log` and `.zip`. **Next operator/lens step:** require emitted exact-head green CI plus READY, check for a newer head, release/reassign the Sol claim, and post once. If changed, read its own delta and re-verify all three findings. The stack still requires main retarget/composed qualification rather than claiming absent strict main contexts passed. [Current stacked dependency contract](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654)

### Cleanup / retained evidence

- Saved this lane's #628 and #641 probes under `ops/aud-115/AUD-SOL-MONEY-2/628-probe.spec.ts` and `641-probe.spec.ts`; CI logs, metadata and exact-head comment payloads remain alongside them.
- Deleted only this lane's two remote throwaway branches, `audit/AUD-SOL-MONEY-2/628-validation` and `audit/AUD-SOL-MONEY-2/641-recovery`, after preserving evidence. Both owned probe runs had finished; no builder/candidate run was cancelled.
- Worktrees and local evidence are retained. **Operator must release/reassign unposted claims** `backend-627-6c7706e1-sol` and `backend-654-02c48de7-sol` before another Sol lens resumes them; these directories were not silently deleted.
- No candidate branch push, merge, production/provider action, local heavy build/test, or new scope item occurred. The four unrelated merge-only heads listed in the PAUSE mail are not in this lane's queue and were not claimed.
