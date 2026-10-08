# LN-SOL-F-131 — GPT-6.1 Sol audit ledger

Operator: agent 131. Scope: read-only lens; no worktree, repository edits, merges, deployments, flag changes or production writes.

Operator wind-down instruction: at 21:50 PDT, finish the review in hand and PRs already READY, then end by about 22:10.

## Final result

Three Sol verdicts posted: mobile #546 APPROVE, backend #870 REQUEST CHANGES at the audited old head, and backend #877 APPROVE with its declared owner HOLD retained; B=1 found, U=0. ([#546 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546#issuecomment-6051891621), [#870 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052231044), [#877 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877#issuecomment-6052361908))

Stopped under the 21:50 wind-down order. No worktree or repository changes existed to push; all verdicts are persisted on GitHub.

## Proven B — audited head `5849066994da5934a6c2d25dea16c5c337afad93`

**B-870-SOL-F-131-1 — seen in an isolated test.** `src/ai-credits/coach-ai-budget.service.ts:463-478,630-641`, consumer `:245-252`: current-period consumption is omitted from the refunded pack's residual allocation and still deducted from the resulting balance. ([exact-head accounting](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5849066994da5934a6c2d25dea16c5c337afad93/src%2Fai-credits%2Fcoach-ai-budget.service.ts))

A coach uses part of an older $25 pack, buys another $25 pack and receives an owner refund for the older one before month-end; the still-paid newer pack incorrectly retains $15.62 rather than $25. ([reviewed refund path](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870))

Smallest fix: derive unspent current-period pack credit before FIFO residual allocation and remove only the refunded pack's unspent amount; add a same-period partly-spent two-pack refund regression.

## Probe evidence

- Actual immutable-head `refundPack`, `getBudgetDto` and `canCharge` reproduced 500 actual / 1562 displayed cents remaining, and refusal of a 501-actual-cent call, while the other $25 purchase remains paid; its untouched credit should be 800 / 2500. ([exact-head methods](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5849066994da5934a6c2d25dea16c5c337afad93/src%2Fai-credits%2Fcoach-ai-budget.service.ts))
- After-rollover control preserved the newer pack's 800 actual / 2500 displayed cents, closing the prior constraint-failure B without closing the current-period accounting defect. ([prior fix and regressions](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5849066994da5934a6c2d25dea16c5c337afad93/test%2Fai-credits-rollover-pack-carry.spec.ts))
- Command: `/home/user/workspace/ops/heavy.sh node /home/user/workspace/ops/review-evidence/LN-SOL-F-131/b870-in-period-refund-probe.cjs`; exit 0, with both reproducer and control completed. ([diagnostic log](/home/user/workspace/ops/reports/LN-SOL-F-131-b870-in-period-refund-probe.log))
- The diagnostic reads Git objects into memory; no worktree, database connection, Stripe call or repository edit. ([read-only diagnostic](/home/user/workspace/ops/review-evidence/LN-SOL-F-131/b870-in-period-refund-probe.cjs))

## Scope traced

- Mobile #537 was skipped before claiming: LN-SOL-E-131 held the earlier live claim and had already posted Sol APPROVE at `abb296689f21ba7a7dbecb514e404e932ad40044`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6051744906), [existing Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537#issuecomment-6051775887))
- Backend #855 was skipped before claiming: LN-SOL-B-131 held the earlier live claim at `015b8d6ca226374b2b914d2d316146cbec33b50a`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/855#issuecomment-6051758113))
- Mobile #546 was claimed at `0b1a6b43c0a302ced857285972d10ca0458cc1f9`; review covers both copy replacements, the unchanged flag-gated destination, rendered parity tests and exact-head CI. ([Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546#issuecomment-6051830899), [PR #546](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- Mobile #547 was skipped before claiming: LN-SOL-A-131 held the earlier live claim at `54b4552deb702f910b1f05c48a67c588c2d959b9`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547#issuecomment-6051914029))
- Mobile #545 round 2 was skipped before claiming: LN-SOL-G-131 held the earlier live claim at `d13041ca5577664c5e30b9481e4509d2a6b379dc`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6051980614))
- Backend #874 was skipped before claiming: LN-SOL-D-131 held the earlier live claim at `fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052019422))
- Mobile #548 was skipped before claiming: LN-SOL-C-131 held the earlier live claim at `ba855c3ef4e0115017d38a6c07051af0ef52ad9d`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/548#issuecomment-6052059535))
- Mobile #552 was skipped before claiming: LN-SOL-B-131 held the earlier live claim at `f41ea9b11a89cd3fe6c351e40bfda19967c80ca9`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/552#issuecomment-6052132714))
- Mobile #550 was skipped before claiming: LN-SOL-E-131 held the earlier live claim at `757149048e0dcc9cbf2397cef9e24f716e41c19a`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/550#issuecomment-6052138932))
- Backend #870 was claimed at `5849066994da5934a6c2d25dea16c5c337afad93`; delta review checks the prior refund B, current-period residual allocation, displayed balance and hard-stop consumers. ([Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052149018), [round 2 READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052095715))
- Mobile #551 was skipped before claiming: LN-SOL-D-131 held the earlier live claim at `ae7e2a94b4c12c08bcbf96e55c58eb313b3d987b`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052290972))
- Mobile #549 was skipped before claiming: LN-SOL-C-131 held the earlier live claim at `534908a1154b3a3e531c39d7595dc2abca5d1cce`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/549#issuecomment-6052299508))
- Backend #877 was claimed at `dc6149d74ee69ba7778585fb5602b4cdff8acb7f`; review covers the request-scoped copy interceptor, all three pool-empty consumers, two manifest return URLs, closed sets, PRECONDITIONS and owner gate. ([Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877#issuecomment-6052306066), [PR #877](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877))
- Mobile #555 was skipped before claiming: LN-SOL-B-131 held the earlier live claim at `042bb82dd9450b8a337170d7a043c313be293a41`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/555#issuecomment-6052369363))
- Mobile #554 was skipped before claiming: LN-SOL-A-131 held the earlier live claim at `da05524f07dcca64465e50634d62478e4887a1fe`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/554#issuecomment-6052365045))
- Backend #874 round 2 was skipped before claiming: LN-SOL-A-131 held the earlier live claim at `24c6c1976a54189f30030e8f6b5a1a2f219184f6`. ([earlier claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/874#issuecomment-6052409933))
- Current-head Claude Opus verdict bodies are excluded from review inputs.

## B list

One: B-870-SOL-F-131-1, detailed above; mobile #546 has no B findings. ([backend accounting](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5849066994da5934a6c2d25dea16c5c337afad93/src%2Fai-credits%2Fcoach-ai-budget.service.ts), [mobile reviewed row](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b1a6b43c0a302ced857285972d10ca0458cc1f9/src%2Fscreens%2Fcoach%2FSettingsScreen.tsx))

## U list

None in the reviewed #546, #870 and #877 slices. ([mobile reviewed row](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b1a6b43c0a302ced857285972d10ca0458cc1f9/src%2Fscreens%2Fcoach%2FSettingsScreen.tsx), [backend accounting](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/5849066994da5934a6c2d25dea16c5c337afad93/src%2Fai-credits%2Fcoach-ai-budget.service.ts), [caller policy](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/src%2Fai-credits%2Fclient-purchase-policy.ts))

## C one-liners

- C (from the code): #877 retains owner-decision-10 HOLD; default is no merge or flag application until the owner's yes. ([declared gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/.github%2Ffly-env-desired-state.json))

## PRs

| PR | Exact audited/checked head | Changed lines | CI at that head | Disposition |
|---|---|---:|---|---|
| [mobile #537](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/537) | `abb296689f21ba7a7dbecb514e404e932ad40044` | 641 | Builder reports green | Skipped: earlier Sol claim/verdict |
| [backend #855](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/855) | `015b8d6ca226374b2b914d2d316146cbec33b50a` | 10 | Builder reports green | Skipped: earlier Sol claim |
| [mobile #546](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546) | `0b1a6b43c0a302ced857285972d10ca0458cc1f9` | 38 | All four checks successful | [Sol APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546#issuecomment-6051891621); B=0, U=0 |
| [mobile #547](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/547) | `54b4552deb702f910b1f05c48a67c588c2d959b9` | 88 | Builder reports green | Skipped: earlier Sol claim |
| [backend #870](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870) | `5849066994da5934a6c2d25dea16c5c337afad93` | 444 | 15 success, 1 skipped | [Sol REQUEST CHANGES posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052231044); B=1, U=0 |
| [backend #877](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877) | `dc6149d74ee69ba7778585fb5602b4cdff8acb7f` | 386 | 15 success, 1 skipped | [Sol APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877#issuecomment-6052361908); owner HOLD retained |

### Post-cut #870 handoff — not a verdict

At the final GitHub check (21:54:25 PDT), backend #870 was open at `87f7f27543963ab6d3cfdaf1def1e643ba37e2f4`, 479 changed lines, CI 15 success/1 skip, and **mergeable=false / dirty**. ([PR status](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870), [captured GitHub head check](/home/user/workspace/ops/reports/LN-SOL-F-131-b870-wind-down-head.json), [captured exact-head CI](/home/user/workspace/ops/reports/LN-SOL-F-131-b870-wind-down-checks.json))

The builder's round-3 READY was posted at **21:50:37 PDT**, after the 21:50 cut, and reports the current-period fix plus a 10/10 targeted regression run; this lane did not issue a verdict at that new head or wait for additional READY lines. ([round-3 READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052519536))

Recommended next step for agent 132: refresh main to resolve the conflict, verify the same-period two-pack case and prior rollover cases, then obtain both verdicts at the resulting exact head. The old `58490669` REQUEST CHANGES is historical, not a verdict at `87f7f275`.

### Mobile #546 evidence

- From the code: `src/screens/coach/SettingsScreen.tsx:664,671` now describes general programming, nutrition and practice topics without claiming client-data access; only these two source strings changed. ([reviewed row](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b1a6b43c0a302ced857285972d10ca0458cc1f9/src%2Fscreens%2Fcoach%2FSettingsScreen.tsx), [PR diff](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546))
- Tests inspected, not locally rerun: `src/navigation/__tests__/coachSettingsMoneyRow.test.tsx:152-178` checks exact copy, the existing `RomanChat` press action, avatar and flag-off absence. ([parity tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b1a6b43c0a302ced857285972d10ca0458cc1f9/src%2Fnavigation%2F__tests__%2FcoachSettingsMoneyRow.test.tsx))
- Exact-head CI: Typecheck/lint/test, CodeQL and both Analyze checks completed successfully; no independent local execution is claimed. ([test CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37719199472/job/113122685337), [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113122801161), [actions Analyze](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37719199581/job/113122685450), [TypeScript Analyze](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37719199581/job/113122685139))

### Backend #877 evidence

- From the code: request-scoped purchase headers only select copy; the source diff leaves authorization, consent/egress, price and ledger behavior unchanged. ([caller policy](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/src%2Fai-credits%2Fclient-purchase-policy.ts), [reviewed diff](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877))
- From the code: success/cancel manifest values match their registered closed sets and mobile's existing scheme; PRECONDITIONS add no requirement for these two URL keys, and gate text retains the owner HOLD plus unset fallback. ([closed sets](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/src%2Fcommon%2Fenv-validation.ts), [manifest and gate text](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/.github%2Ffly-env-desired-state.json), [reviewed scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877))
- Tests inspected, not locally rerun: caller variants, awaited real HTTP handlers, awaited 402 copy, Guide and gateway refusals are covered; exact-head CI has 15 successes and the expected deployment-gate skip. ([caller/HTTP tests](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/test%2Fai-credits-caller-purchase-policy.spec.ts), [build and test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37726737441/job/113146510154), [deployment-gate skip](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37726737500/job/113146511266))

## Not fixed (needs operator)

B-870-SOL-F-131-1: the verdict applies to audited head `58490669`; the later `87f7f275` fix round arrived after the cut and is now conflicted, so agent 132 must refresh and re-audit before this lane's finding can be closed. Recommended default is to keep #870 unmerged until both lenses approve the refreshed head. ([posted finding](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052231044), [late fix READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052519536), [final GitHub status](/home/user/workspace/ops/reports/LN-SOL-F-131-b870-wind-down-head.json))

Owner decision 10: recommended default is to retain #877's release HOLD until explicit approval; technical Sol approval does not authorize rollout or flag application. ([owner gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/dc6149d74ee69ba7778585fb5602b4cdff8acb7f/.github%2Ffly-env-desired-state.json))

## Proposed (needs operator)

None.

## HANDOFF

**Done under operator wind-down.** No active review remains. Notify: `/home/user/workspace/ops/lanes131/notify/LN-SOL-F-131.txt`.

- Mobile #546: Sol APPROVE at `0b1a6b43c0a302ced857285972d10ca0458cc1f9`, 38 lines, all four CI checks successful, B=0/U=0. ([posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/546#issuecomment-6051891621))
- Backend #870: Sol REQUEST CHANGES at `5849066994da5934a6c2d25dea16c5c337afad93`, 444 lines, CI green, B-870-SOL-F-131-1 reproduced; the after-rollover control passed. ([posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052231044))
- Backend #877: Sol APPROVE at `dc6149d74ee69ba7778585fb5602b4cdff8acb7f`, 386 lines, CI green, B=0/U=0; declared owner-decision-10 HOLD retained. ([posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877#issuecomment-6052361908))
- For agent 132: #870's late READY at `87f7f27543963ab6d3cfdaf1def1e643ba37e2f4` is unreviewed by this lane and GitHub now reports a conflict; refresh main, preserve the residual fix and metering changes, and re-run the exact-head audit. ([late READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6052519536), [final head check](/home/user/workspace/ops/reports/LN-SOL-F-131-b870-wind-down-head.json))

Outstanding operator actions: #870 refresh/re-audit; #877 declared owner gate. No other-model verdict was posted or counted as this lane's own.

Raw GitHub metadata, comments excluding Claude Opus verdict bodies, file diffs, checks and posted responses are saved as `LN-SOL-F-131-<repo letter><PR>-*`. Only the focused in-memory accounting diagnostic ran through `heavy.sh`; no merge, deploy or production change was performed.

No repository work existed to push. No claims or verdicts were posted on heads covered by another earlier live Sol claim. No waits for post-cut READY lines.
