# AUD-SOL-MONEY — agent 115

Lens: GPT-6.1 Sol. Scope: backend money queue, T4.

## Intake

- Read common brief, lane-115 overrides, audit contract, AUD-SOL-3, LANES lenses, governance and 72-hour decisions.
- Historical `ops/lanes111/AUD-SOL.md` is absent; the active lane-115 audit contract governs.
- Initial queue has no new auditable head. Existing Sol REQUEST CHANGES heads await builder rounds.
- GitHub CI lanes instruction received; probes will use audit branches and safe `ci.yml` dispatches, not candidate branches.

## Verdicts

### #661 — REQUEST CHANGES

Head `f4679fd8e287e5bcd6c0dc8da69c208786f79802`; **A/B/C 0/1/0**. Sol B-661-1/2 and Opus B-661-1 close at their reported boundaries; new B-661-3 is the unsafe outside-hunk delayed-decline regression in the newly supported successful-retry lifecycle. Independent probe: one acceptance failure / 93 controls pass. All 11 required checks green and current-head READY present; own worktree removed after posting. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5972103999) [Exact-head READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5972088040)

### #656 — REQUEST CHANGES

Head `b9939d02c38810bfe21fe9cea19e1eac35849f14`; **A/B/C 0/4/1**. B-656-1/2/4 close; B-656-3/5 remain narrowly open for pagination/read-authority, new B-656-6/7 cover billed-alert suppression and arbitrary Error.name, C-656-1 remains composed-candidate carry. Independent probe: four acceptance failures / 28 controls pass; all 11 required checks green and current-head READY present. Own worktree removed after posting. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/656#issuecomment-5972091723) [Exact-head READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/656#issuecomment-5972079398)

### #627 — REQUEST CHANGES

Head `3a5338d72c277238486452f7f256da2d8e22c7c8`; **A/B/C 0/1/0**. B-627-9 closes at its reported paused-claim boundary; new B-627-10 emits arbitrary Error.name when parking the claim fails. Independent probe: one acceptance failure / 55 controls pass. All 11 required checks are green and current-head READY is present; own worktree removed after posting. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5972047312) [Exact-head READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5972027900)

### #628 — REQUEST CHANGES

Head `9b48d91edadfff3a473bf71c848124ca34c5ebbb`; **A/B/C 0/1/0**. B-628-11 remains narrowly open: current 401/403 cannot prove an earlier unrecorded pay collected nothing; all four foreground/background acceptance assertions fail while 58 candidate controls pass. C-628-12 closes; all 11 exact-head required checks are green and READY names this SHA. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5971971999) [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401077)

### #642 — APPROVE

Head `4fee3c0236eaa793f847a89e9393160b9f12a41c`; **A/B/C 0/0/0**. B-642-1 closes by operator's #608 deployment-order ruling; pure inherited merge and own dependency pin reviewed, all 11 required checks green. Device check remains operator acceptance; strict updated-main delta still owed before merge. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5971940347)

## In progress — #641 round 5

Head under review: `183ed462fb21fdd53dba5ebc8b3f3dc14ae26d12`; required checks and READY comment pending at intake. [PR #641](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641)

Read complete 13-file delta and prior AUDIT/FIX history; B-641-7/8's intended admission/fairness fixes are present, with new operator reconciliation scope requiring additional adversarial coverage. [PR #641](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641)

Independent test-only branch `audit/AUD-SOL-MONEY/641-reconciliation` at `8e230fcc` probes three new boundaries: one unattributed reversal reused across distinct refunds; an undersized reversal closing an obligation; arbitrary Error.name logged as a machine code. CI dispatched, results not yet claimed. [Probe CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141175382)

Evidence: `ops/aud-115/AUD-SOL-MONEY/641-r5.diff`, `641-history.txt`, `641-reconciliation-probe.spec.ts`.

## In progress — #628 round 7

Read complete five-file delta at `9b48d91edadfff3a473bf71c848124ca34c5ebbb` and all prior AUDIT/FIX history; read-failure retention and explicit at-least-once push documentation address the reported boundaries, subject to exact-head green CI. [PR #628](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628)

Additional replay-authority probe tests whether current 401/403 failures incorrectly prove that an earlier unrecorded pay did not collect; the new `replayPay` classifies both as definitive. Test-only branch `audit/AUD-SOL-MONEY/628-replay-auth` at `5ca4d17f`, CI pending; no execution result claimed. [Probe CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141505410)

## In progress — #642

Read entire own two-file diff at `4fee3c0236eaa793f847a89e9393160b9f12a41c`, both prior verdicts and the new deletion dependency pin; inherited-main merge `350616c0` reproduces automatic tree `32143c4461046cfd8ec38378841f9e94729ff2e9`. [PR #642](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642)

The original Google-session DTO rejection is fixed by inherited #608; deployment is operator-attested in the lane brief, but prior verdict requires a Google-only in-app production deletion and the new pin exercises DTO acceptance plus suite existence, not that real-device completion. Await builder's explicit evidence/disposition and green exact-head READY. [Prior closure requirement](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960151535)

Disposition correction: the binding operator train ruling explicitly closes B-642-1 by #608 deployment ordering, with device acceptance remaining operator-owned; this is not a new production-device merge blocker. Under that ruling the code/dependency finding closes, subject to current-head READY and required CI. [Recorded ordering ruling](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/LAST_OPERATOR_STATE.md#L484-L486)

## Audit claims / queue split

At operator's queue split, #628, #641 and #642 were already under substantive review; this lane will finish those heads. Atomic Sol claim directories were created for backend-628-9b48d91e, backend-641-183ed462, backend-642-4fee3c02 and backend-654-317301b5. Subsequent heads require a fresh claim.

## In progress — #654 round 2

Read full own delta and prior Sol findings at `317301b55fcd27adba6a1fd6d15a7ac891744520`; webhook lookup retryability, durable reservation/body pinning, no-sheet first invoices and immutable money terms are implemented, with provider-authority edge cases under probe. [PR #654](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654)

Test-only probe branch will exercise an uncertain create retried after provider receipt expiry and terms-change retirement after unavailable cancellation; no local heavy work or candidate-branch mutation. [Candidate source](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/317301b55fcd27adba6a1fd6d15a7ac891744520/src/checkout/subscription-checkout.service.ts)

One-job targeted probe dispatched under CI lane v2. [#654 probe CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141914027)

#628's superseded queued five-job probe run was canceled; the replacement is the one-job targeted lane. [#628 replacement probe CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141914218)

## In progress — #627 round 9

Claimed and read full eight-file delta `cd332bfa..6910d7476a35fe4d86d2526bc71c41ffdcbf7ede`, plus prior audit/fix history. The intended paused-sender closure now re-proves lease and marker identity after claim, checks a synchronous 30-second admission budget at the HTTP boundary, and adopts unresolved budget-exhausted attempts under their original key instead of issuing an elapsed-time repay instruction. [PR #627](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627)

Independent canary probes the newly added arbitrary Error.name logger boundary; existing paused-sender and HTTP-boundary controls will execute alongside it in one-job CI. Exact-head required CI and READY pending; no verdict yet. [Candidate boundary](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/6910d7476a35fe4d86d2526bc71c41ffdcbf7ede/src/connect/fees/transfer-orchestrator.service.ts#L599-L620)

## Probe results / advancing heads

#641 independent probe executed three acceptance failures: one provider reversal closes two obligations (external 122 vs local 244), a 10-cent partial receipt closes a 122-cent obligation, and free-text Error.name reaches the logger. Candidate's separate old cursor regression also failed, not counted as an independent finding. Builder advanced to `4220acc74823ac50c35d1af6b8a35a93736517d2` with a reviewed 94-line keyset-page correction; probe cases are unchanged and will rerun there. [Executed #641 probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141175382)

#628's first targeted run did not execute assertions: the audit fixture needed two typed JSON-array reads. Corrected only the probe, then rerun; no money defect claimed from compilation failure. [Fixture-only failed run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141914218)

#627 advanced through pure main merge `37e8d015` (automatic tree equals committed `6c6abd22e32f6b31f1b97cbc08e7ce7c6b0261ca`) and monotonic-clock follow-up to `3a5338d72c277238486452f7f256da2d8e22c7c8`; both own hunks fully read. Claims created for each advancing head, and superseded queued probe canceled before rerun. [Current #627](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/3a5338d72c277238486452f7f256da2d8e22c7c8)

Current-head targeted runs: [#627](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401175), [#641](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401636).

#628 corrected probe executed **4 failures / 58 controls passing**: current 401/403 on a replay terminalizes a prior unrecorded 15000-cent collection as already_paid, in foreground and background. [Executed replay-authority probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401077)

#654 probe executed **2 failures / 25 controls passing**: an uncertain create after cache pruning creates a second subscription, and failed cancellation still marks a payable attempt expired. No source edits; waiting exact-head required CI and READY before verdict. [Executed checkout-authority probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141914027)

## In progress — #656

Claimed `b9939d02c38810bfe21fe9cea19e1eac35849f14`, read all prior audit/fix comments and full 2653-line own new delta plus two follow-ups; main merge `cd08a69e` independently reconstructs automatic committed tree `1d512899a5dc82ac06f1cb8dcc32b4a992b30e54`. [PR #656](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/656)

New durable cancellation, notice leases, activation/reconciler hooks, preference reads and separate card/access facts substantially address B1–5. Independent probes target due-notice pagination, unknown customer-default truth, failing-alert→billed-alert distinction, and new arbitrary Error.name logging; execution pending. [Current source](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/b9939d02c38810bfe21fe9cea19e1eac35849f14)

## Ready-gated findings awaiting verdict

#627 at `3a5338d72c277238486452f7f256da2d8e22c7c8`: B-627-9's reported paused-sender boundary closes, but new **B-627-10** logs arbitrary `parkErr.name` in the newly added claim-reproof failure branch. Independent acceptance assertion fails; 55 controls pass. Provisional **0/1/0**, pending current-head required CI and READY. [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401175)

#654 at `317301b55fcd27adba6a1fd6d15a7ac891744520`: B-654-5 remains narrowly open for replay after expired provider idempotency receipt; new **B-654-8** marks an attempt expired after unavailable cancellation, leaving the old provider subscription payable. Independent assertions fail twice; 25 controls pass. B-654-1/6/7's reported boundaries close. Provisional **0/2/0**, pending current-head emitted CI, READY and explicit stacked-main composition gate. [Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141914027)

#641 at `4220acc74823ac50c35d1af6b8a35a93736517d2`: B-641-7/8's reported boundaries close; new **B-641-9/10/11** cover cross-refund reuse of one provider receipt, partial receipts terminalizing a larger obligation, and arbitrary Error.name logging. All three acceptance assertions fail; eight candidate controls pass. C-641-2 composition carry remains. Provisional **0/3/1**, pending repaired candidate CI and current-head READY. [Executed current-head probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401636)

#656's first probe run did not execute assertions: one audit fixture called a Jest mock method on a plain function. The fixture-only change now uses `jest.spyOn`; a corrected one-job run will determine the four acceptance results, not the compilation failure. [Fixture-only failed run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142750310)

## Follow-up gate and diagnostic review

#654 advanced to `02c48de710f9f69bfc985336eb14249663bbb638`, claimed atomically and its complete 102-line delta read. Money logic is unchanged; the new `errorLabel` hardening still accepts arbitrary Error.name and regex-shaped code/type, so **B-654-9** is under an additional two-canary probe. Existing two money acceptance cases rerun at this exact source head; pending provisional **0/3/0**, not a posted verdict. [Builder round](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654#issuecomment-5971989117) [Current-head probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143128666)

#641's candidate build fails TS7022 at keyset/rows/last in `refund-dispute-handler.service.ts:697/707/735`; there is no current-head READY yet. This is a posting gate, not an additional independently probed money finding. Draft with full finding/fix rules is saved to `ops/aud-115/AUD-SOL-MONEY/641-verdict-draft.md`. [Candidate type-check failure](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142057571/job/111258371194)

#627 ready-gated full draft saved to `ops/aud-115/AUD-SOL-MONEY/627-verdict-draft.md`; one required build remains in progress, so it is not posted. [Candidate required build](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142186694/job/111258749065)

#656 corrected one-job probe is running; initial fixture compilation is excluded from acceptance results. [Corrected probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143069058)

## Current execution / claim transitions

#656 corrected probe executes **four acceptance failures / 28 controls passing**: first-100 already-noticed trials starve 20 missing notices; an unavailable default-card read emits a no-charge guarantee; an earlier cancel-failing alert suppresses the distinct billed-conflict alert; arbitrary Error.name reaches the new worker logger. Ready-gated draft `656-verdict-draft.md` gives **0/4/1** with B-656-3/5 narrowed, new B-656-6/7 and C-656-1 carry. All 11 required checks are now green; current-head READY still awaited before posting. [Executed corrected probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143069058) [Candidate build](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142298257/job/111259079693)

#654 current-head probe executes **four acceptance failures / 25 controls passing**: two existing money boundaries persist and both Error.name/code canaries reach the new errorLabel logger. Ready-gated draft will give **0/3/0** for B-654-5 narrowed plus new B-654-8/9; this is not yet posted. [Executed current-head probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143128666)

#641 advanced to `1ad67022baf157b94226c4d6a73159eb4ead2ba1`; atomic claim failed because another Sol lens owns that head, so this lane skips it. The three proved findings at `4220acc7` and complete ready-gated draft remain available for the new claimant; do not mistake the unposted old-head draft for a current verdict. [Latest candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/1ad67022baf157b94226c4d6a73159eb4ead2ba1) [Old-head executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401636)

#661 claimed `f4679fd8e287e5bcd6c0dc8da69c208786f79802`; complete prior AUDIT history and 598-line own round-2 delta read. Pure main merge `7a4ffaab` equals automatic tree `38f67ebceb9bbf910df38ae3aceb7f9ea6084b65`. Prior Sol replay classifier findings are repaired at the reported boundaries; independent event-order probe plus four supporting suites dispatched, no outcome claimed yet. [Current candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/f4679fd8e287e5bcd6c0dc8da69c208786f79802) [Independent CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143378240)

#661 event-order run executes **one acceptance failure / 93 controls passing**: repaired failed→success handling gives paid access, but a distinct earlier decline delivered late overwrites it to payment_failed / unentitled with erased credentials. This unsafe residual is outside the edited failure hunk and explicitly disclosed by the builder; proposed new B-661-3 is reproduced, not inferred from a generic ordering risk. All 11 required checks are green and current-head READY now present. [Executed ordering probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143378240) [Builder residual/READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5972088040)

#654 required build is now red solely on the recorded full-suite heap exhaustion (`test/scout/induction/contract.spec.ts` Jest worker); 720 suites / 12430 tests passed, but this is not a green gate and not a fourth money finding. Its three independently proved ready-gated findings remain in `654-verdict-draft.md`; no verdict posted at the red head. [Candidate failed build](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142946943/job/111260966288)

## HANDOFF

Budget is nearly spent; this is the original task's budget-protection exception, not cancellation or descoping of builder work. FINISH MODE was re-read; no candidate, builder run or scope item is cancelled by this handoff. The drain flag is still absent.

**Five posted verdicts:** #642 APPROVE 0/0/0; #628 REQUEST CHANGES 0/1/0; #627 REQUEST CHANGES 0/1/0; #656 REQUEST CHANGES 0/4/1; #661 REQUEST CHANGES 0/1/0. Exact heads and comment URLs are recorded above. [#642](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5971940347) [#628](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5971971999) [#627](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5972047312) [#656](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/656#issuecomment-5972091723) [#661](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5972103999)

**#654 unfinished, claimed by this lane:** `02c48de710f9f69bfc985336eb14249663bbb638`, provisional REQUEST CHANGES **0/3/0**, **not posted** because the current required build is red and READY is absent. All findings/fix rules are complete in `ops/aud-115/AUD-SOL-MONEY/654-verdict-draft.md`; independent exact-source run executes four acceptance failures / 25 controls passing. The next lens must read any advancing delta, require exact-head green emitted CI/READY, preserve the explicit stacked-main gate, and re-read the live head before posting. Operator must release/reassign `ops/lanes115/claims/backend-654-02c48de7-sol` for another Sol lens to own it; do not leave the claim silently blocking intake. [Current candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/02c48de710f9f69bfc985336eb14249663bbb638) [Executed three-finding proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143128666) [Red full build](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142946943/job/111260966288)

**#641 transferred by atomic claim:** this lane's old source `4220acc74823ac50c35d1af6b8a35a93736517d2` has three proved B findings and a C carry, but no verdict was posted before it advanced. AUD-SOL-MONEY-2 owns the advancing heads and has independently reproduced receipt reuse/partial receipt/diagnostics, plus a further bounded-page fairness seam; its current report controls the new head. The old complete draft/probe remain in this lane's evidence directory, not an approval or current-head certification. [Old executed probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37142401636) [Advancing source](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/02cd3f88c381f7ccf24e84f821e96418bab66f37)

**Next builder rounds:** #627, #656 and #661 must address the posted B findings and get fresh atomic Sol claims/current-head verdicts; no later head is certified by the verdicts above. #628 and #642 remain with AUD-SOL-MONEY-2 after the queue split. The helper `wait-4.log` is an intake log, not evidence of approval.

All own probe specs, full diffs, prior histories, CI log archives, exact-head gates and verdict bodies are preserved under `ops/aud-115/AUD-SOL-MONEY/`. Only own temporary worktrees and completed throwaway audit branches are cleaned up; claims and evidence remain for the operator.
