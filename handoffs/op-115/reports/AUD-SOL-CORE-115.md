# AUD-SOL-CORE — agent 115 — GPT-6.1 Sol

Independent backend audit lens. Candidate-branch writes, merges and production actions are prohibited; subsequent binding CI-lane rulings authorize synthetic test-only audit branches and their non-deploying GitHub CI probes.

## Intake

- #664 delta review started at `3e97686116ceb64a975cc209080df2d03ce81aab`; its two parents are the previously Sol-approved `62f57edbdb6030e69749292cdadeac76c591e34d` and main `ec911328ab86c401b72f98f0561ebf732b3f8700`. `merge-tree --write-tree` equals the exact candidate tree (`a5d85d94e2438054f4c97a94e74f99ce594b18d9`) and both own patch IDs equal `42e926a38c5a888371fbd2106a529f91bdac9040`. No conflicts or extra branch edits. Awaiting all eleven exact-head required checks before verdict. [Candidate and operator update](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/664#issuecomment-5971586399).
- The initial wait command printed #664 with pending checks; the lens independently reads and enforces the actual required-check set, never treating that output as green evidence. [Actual candidate build job](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37140089778/job/111252531507).
- Existing Sol verdicts at #640/#647/#609/#652 current intake heads remain applicable until heads change. #648/#634/#651 await builder fixes; #653 awaits a conflict fix/ready head. [#640](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/640), [#647](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647), [#609](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609), [#652](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/652), [#648](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/648), [#634](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634), [#651](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/651), [#653](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/653).

## Verdicts

### backend #664 — APPROVE

- Exact head: `3e97686116ceb64a975cc209080df2d03ce81aab`; A/B/C **0/0/1**, C-664-1 remains optional. All eleven exact-head required checks were independently verified before posting. [Published Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/664#issuecomment-5971888028).
- Pure #608 main merge reconstructed exactly; own patch ID unchanged. No new upload path or dependency seam defect. [Published merge evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/664#issuecomment-5971888028).

### backend #634 — APPROVE

- Exact head: `3d989702208fc9ee407196ac7c3046f92f6b8cc5`; A/B/C **0/0/0**, B-634-10 closed. All eleven required checks pass. [Published Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5971921481).
- Independent same behavioral probe fails **2/3** against the old helper and passes **3/3** against the candidate; combined candidate regression execution passes **137 tests / 4 suites** in the one-job lane. [Before execution](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141925593), [after execution](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141935780).
- #325/backend sequencing, migration preflights and real device qualification remain operator gates; no rollout claim. [Verdict boundaries](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5971921481).

### backend #652 — APPROVE

- Exact head: `1d43c9d9b95ad14b1f70bd43f95248ce92ea63ff`; A/B/C **0/0/0**, all eleven exact-head required checks pass. [Published Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/652#issuecomment-5971993506).
- Pure #640 main merge reconstructed exactly; own patch ID unchanged; previously closed #610 findings remain closed. [Published merge/seam evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/652#issuecomment-5971993506).

### backend #609 — APPROVE

- Exact head: `41ea038a310ede34781eac0d210cd370862e4606`; A/B/C **0/0/0**, all eleven exact-head required checks pass. [Published Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5971993895).
- Pure #640 main merge reconstructed exactly; own patch ID unchanged; welcome atomic-lease/erasure/live-test integration survives unchanged. [Published merge/seam evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5971993895).

### backend #647 — APPROVE

- Exact head: `3c3bdd12c9ee34d22db1059a757bf9b224164518`; A/B/C **0/0/2**, optional C-647-3/C-647-4 carried. All eleven exact-head required checks pass after the single OOM failed-job rerun. [Published Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5972022069).
- Pure #640 main merge reconstructed exactly; own patch ID unchanged; provenance and generation-qualified reminder claim contract survives unchanged. [Published merge/seam evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5972022069).

## Queue orchestration / CI note

`wait_audit.sh` extracts `checks=pass=10,pending=1` using `cut -d= -f2`, leaving only `pass`; therefore it can print a head with pending/failing required checks when `pass` is the first bucket. Recommend the operator change this extraction to `cut -d= -f2-`; the lens independently checks all eleven required jobs before posting. The first #664 build failed at the unchanged provider-wiring symlink test `test/prod-readiness/provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts:1150` (expected WIRED, received STUB); a rerun is already pending, and no green verdict has been published prematurely. [Failed build evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37140089778/job/111252531507).

## Active evidence

- #647 `3c3bdd12c9ee34d22db1059a757bf9b224164518` and #652 `1d43c9d9b95ad14b1f70bd43f95248ce92ea63ff`: conflict-free automatic merge trees and unchanged own patch IDs proven; drafts prepared, waiting for exact-head required jobs. [#647 operator update](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5971749993), [#652 operator update](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/652#issuecomment-5971751033).
- #634 `3d989702208fc9ee407196ac7c3046f92f6b8cc5`: round-5 closed enum/code catalog and all four changed files reviewed; independent actual-emitter, forged P-code/cyclic-cause and real wrapped-Prisma probes dispatched to GitHub on both prior and candidate source. Waiting for those runs and builder READY metadata. [Before proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141468872), [after proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141460481).
- #648 `ab607b3480d1d1909aa191170ad8febea10493dc`: round-3 new lease-token/handoff, send-time preference/quiet-hour checks and tap routing read. An independent boundary-crossing send-preparation probe is queued in GitHub; this is an unverified counterexample candidate, not a posted finding or verdict. [Probe run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141641887).

### CI-lane v2 results

The superseded full #634 proof runs were canceled while their build jobs were still queued; one-job replacement proof is now complete: old source **2 failed / 1 passed**, candidate source plus three relevant regression files **4 suites / 137 passed**. Unlike the builder's API-export/typecheck-only before proof, this independent before run reaches the actual BookingEmitter logger and demonstrates the unknown private name/code leak. [Behavioral before proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141925593), [candidate after proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141935780).

#648's previously dispatched full CI probe finished with **one actual quiet-hour counterexample and a passing daytime control**, while all four other CI jobs passed; its worker captures 20:59 before awaited database preparation, then sends at 21:00:10 despite a valid 120-second lease and the recipient's proven New York zone. Candidate required CI/READY is still awaited before posting the narrowed B-648-10 disposition. [Executed independent probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141641887).

#647's new-head build failed only because a Jest worker ran out of memory in the unrelated `community-message-shape.live` suite; 12,186 other tests passed. One failed-job rerun was requested after confirming attempt 1 was completed/failed; exact-head approval remains withheld until it passes. [Failed-job evidence and rerun](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141324689).

## Operator directive carried forward

Operator 115 instructed at 11:08 PDT: do not audit #651 again. B-SCHED-ROMAN will replace it with three individually T4 stacked pieces (context, guardrails, live turns/evaluation); apply the finding-to-piece table in each new body and decide this lens's existing B-651-1 through B-651-10 / C-651-4/5/7 against their mapped pieces. The old-head JSON and all prior finding text are retained locally for that handoff.

## Additional queued preparation

#653 still has its old unready/conflicting head `17b2be255b0087196b9c1c81cc38397330c56c75`; full expiry source/migration/read/write paths have been read in preparation, not approved. A one-job actual-service probe is queued for stale worker notice redelivery after lease takeover and identifier-shaped audit-error-name logging; its ordinary repeat-sweep control is included. No findings are published until execution and the final ready head are verified. [Targeted probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143170600), [candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/653).

### backend #648 — REQUEST CHANGES

- Exact head: `ab607b3480d1d1909aa191170ad8febea10493dc`; A/B/C **0/1/0**. B-648-8/9 and backend C-648-3 close; B-648-10 remains partially open because within-lease preparatory I/O can cross 21:00 while policy/rendering retain the entry clock. All eleven required candidate checks pass; the verdict explicitly identifies the missing round-3 READY record rather than inventing readiness. [Published Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/648#issuecomment-5972046897).
- Independent actual-worker execution sends at 21:00:10 after beginning at 20:59 New York and waiting 70 seconds in the user/token read; its ordinary daytime control passes. The provider must not be called for this nonurgent boundary case, and deferral must not consume a provider attempt. [Executed counterexample](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141641887).

### backend #653 — confirmed preparation evidence, verdict pending

The exact old candidate plus test-only probe executes **two failures / one passing control**: delayed worker A resumes after worker B legitimately takes both four-minute notice leases, creating four inbox rows instead of two; lazy-expiry audit failure logs the arbitrary synthetic `Error.name` canary. This is production-service behavior in controlled synthetic replicas, not a live-user allegation. The ordinary repeat-sweep control passes; preserve both cases across the final composed/ready head. [Executed one-job proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143170600).

Evidence is retained in `ops/aud-115/AUD-SOL-CORE/653-independent-probe.spec.ts`, `653-run-logs.zip` and `653-run-logs/0_targeted.txt`; the log archive was obtained through the distinct run-logs endpoint after the jobs-detail endpoint returned an IP rate-limit error. No repeated failed API action or local heavy test was used. [Public run evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143170600).

Detailed proposed B-653-1/2 file:line findings, concrete replica/logger counterexamples and minimal fix rules are saved in `ops/aud-115/AUD-SOL-CORE/653-confirmed-findings.md`; the unready old head has no required check set, so its two must-fix candidates are not misrepresented as a completed green-head verdict. [Candidate readiness boundary](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/653).

### backend #634 — new merge-only head under review

Claimed `e18e8055454b04856d2c5ab5568d0a7127b74939` and reconstructed its conflict-free merge of the prior approved head plus main `0d33c4d4adfb1819f0007a5efbc101c3d8362414` exactly: tree `9ae8c98a71a2b221bb6632d0389c144da69333ee`, unchanged own patch ID `d03a28d50ceb699e3306f02ca9deabeb724b8a2f`. Schema/notification/CI/erasure seams are reviewed; draft `634-e18-verdict.md` is withheld pending all eleven exact-head required jobs. [Operator merge-only record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5972077899).

### backend #647 — new merge-only head under review

Claimed `ec1811b6acf40dd97ead498ec1aea790012aabb0`; both parents and conflict-free automatic tree match `fa99a1bf686081a404ecc35713326bd591105fcb`. Complete shared schema/DTO/service delta preserves valid timezone provenance and both reminder preference families. Main's formatting changes the stable patch ID, so the draft correctly relies on exact automatic-tree equality rather than claiming equal IDs. Draft `647-ec-verdict.md` is withheld while its required build is pending. [Operator update](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5972079212).

## Expanded queue / inherited Sol findings

Operator transferred #611, #656 and #661 to this lane; all three current bodies and relevant prior Sol verdicts are read and retained in `pr611-live.json`, `pr656-live.json`, `pr661-live.json`. #611 remains approved at its unchanged old head pending the privacy-text round. [Existing #611 Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964309856).

For #656, inherit **0/4/1** at `b9939d02c38810bfe21fe9cea19e1eac35849f14`: B-656-3 notice paging starvation, B-656-5 unknown card authority falsely becoming absent, B-656-6 failure-alert receipt suppressing the billed-conflict alert, B-656-7 arbitrary diagnostic names; C-656-1 composed #654 acceptance remains. Decide each with the existing four-failure behavioral probe plus new builder before/after evidence at the next head. [Inherited exact-head verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/656#issuecomment-5972091723), [four executed failures / 28 controls](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143069058).

For #661, inherit **0/1/0** at `f4679fd8e287e5bcd6c0dc8da69c208786f79802`: B-661-3 delayed earlier decline regresses a successfully retried paid/entitled purchase to failed/unentitled with erased credentials; B-661-1/2 remain closed. Existing actual-handler probe executes this specific order with 93 passing controls, not a generic hypothetical ordering risk. [Inherited exact-head verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5972103999), [executed ordering failure / controls](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143378240).

### backend #647 — APPROVE at the new merge-only head

Exact head `ec1811b6acf40dd97ead498ec1aea790012aabb0`; A/B/C **0/0/2**. All eleven required checks pass and the head was re-read immediately before posting; the composed timezone/reminder seams remain safe within the approved scope. [Published final Sol delta verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5972175773).

## HANDOFF

Owner PAUSE received; `LENSES_MAY_END` exists. No new full audit begins. The latest in-progress short #647 delta is posted; #634's fully reviewed automatic merge is not falsely approved while its required build rerun remains queued. Its ready-to-finalize draft is `ops/aud-115/AUD-SOL-CORE/634-e18-verdict.md`: after all eleven checks succeed, re-read head/duplicate verdicts, correct the draft's explicitly unverified CI paragraph and post it once at `e18e8055454b04856d2c5ab5568d0a7127b74939`. The archived-log endpoint returned an empty archive because the superseding attempt was queued; the alternate run-state read confirms this is a rerun in progress, not a newly diagnosed code failure. [Operator merge-only head](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5972077899), [required rerun](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143570940).

### Queue state at pause

- #640 `176e4f0ed59d5d047a1958044036ffcfd1c26d2c`: already merged; no new delta verdict owed. [PR #640](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/640).
- #647 `ec1811b6acf40dd97ead498ec1aea790012aabb0`: final Sol **APPROVE 0/0/2**, eleven green. [Final verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5972175773).
- #609 `41ea038a310ede34781eac0d210cd370862e4606`: merged, Sol **APPROVE 0/0/0**. [Verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5971993895).
- #652 `1d43c9d9b95ad14b1f70bd43f95248ce92ea63ff`: Sol **APPROVE 0/0/0**, now behind main; next mechanical update requires a short new-head delta. [Verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/652#issuecomment-5971993506).
- #648 advanced to `ef0ad6fcaecca46d9cb4e11e381c2a3c3d47ccc1`: **UNAUDITED**, no new full audit under PAUSE; decide narrowed B-648-10 with the same actual-worker boundary probe. Last posted Sol **REQUEST CHANGES 0/1/0** at `ab607b3480d1d1909aa191170ad8febea10493dc`. [Last verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/648#issuecomment-5972046897), [preserved independent probe](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37141641887).
- #664 `3e97686116ceb64a975cc209080df2d03ce81aab`: Sol **APPROVE 0/0/1**, behind main; next mechanical update requires a short new-head delta. [Verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/664#issuecomment-5971888028).
- #634 `e18e8055454b04856d2c5ab5568d0a7127b74939`: merge review complete, **UNPOSTED APPROVE draft 0/0/0**, required build rerun queued. Last published approval is `3d989702208fc9ee407196ac7c3046f92f6b8cc5`. [Last published verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5971921481), [current required run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143570940).
- #651 `a8fa651c8f131b7d7f61076143671be350af9ce5`, still open at pause: no re-audit per operator; inherit mapped findings into the three future individually T4 split pieces, not a blanket approval of the old stack. [Old candidate and mapping destination](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/651).
- #653 `17b2be255b0087196b9c1c81cc38397330c56c75`: old conflicting/unready head, **no published verdict**; two confirmed behavioral must-fix candidates and passing control are fully saved in `653-confirmed-findings.md` and `653-independent-probe.spec.ts`. Re-run after final composition, retaining both recipient notices and privacy-safe diagnostics. [Executed proof](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143170600).
- #611 advanced to `5eac8f21bb70460da7dea7be5ce9f84f40870afb`: **UNAUDITED** privacy-text round; retain prior public-truth/publication hold and T4 restore split boundaries. [Prior Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964309856), [current PR](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611).
- #656 `b9939d02c38810bfe21fe9cea19e1eac35849f14`: inherited Sol **REQUEST CHANGES 0/4/1**, no new head at pause. Preserve four specific behavioral fixes and composition carry. [Inherited verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/656#issuecomment-5972091723).
- #661 `f4679fd8e287e5bcd6c0dc8da69c208786f79802`: inherited Sol **REQUEST CHANGES 0/1/0**, no new head at pause. Preserve monotonic successful-payment state and actual-handler ordering proof. [Inherited verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5972103999).

Exact queue snapshot is `pause-queue-state.jsonl`; all evidence, probe specs, drafts and logs remain in `ops/aud-115/AUD-SOL-CORE/`. Atomic claim directories are retained. No production, provider, deploy, merge or PR-branch push was performed by this lens; only synthetic test-only branches and authorized GitHub CI probes were used. [Published scope/evidence record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5972175773), [independent CI evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143170600).

Final check snapshot shows #634 **10 passed / 1 pending**, not green; no duplicate verdict was posted at its new head. All six own remote `audit/AUD-SOL-CORE/*` test branches were deleted at lane end as required; public run evidence and local probe/log files remain. The unfinished #653 worktree is retained solely as preparation evidence under the workspace-preservation rule; no active local heavy work or own probe run remains. The drain wait was stopped after the owner PAUSE/sentinel, and no new full audit was started. [Pending required run](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143570940), [retained #653 execution](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143170600).
