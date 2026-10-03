# AUD-SOL-MOB — agent 115

## Scope

Independent GPT-6.1 Sol mobile lens. Operational audit record; candidate source is read-only. Queue is drained until the operator's end marker or budget handoff.

## Latest published verdicts

| PR | Exact head | Verdict | A/B/C | Comment |
|---|---|---|---|---|
| #325 | `7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8` | APPROVE | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5971606908) |
| #338 | `9cf6614647aff5cd6a2fa3be4c7dab954ae4ce90` | APPROVE | 0/0/1 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/338#issuecomment-5971625871) |
| #326 | `7c5626ed732b2287dd7437a69794de8d11b7d08f` | APPROVE (now merged) | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5971729471) |
| #315 | `8fff3f8f3829aab4079973b38428e2d266bc3f3b` | APPROVE | 0/0/0 | [Sol merge-only verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5972016148) |
| #312 | `f8375ca66bf11b2cbb721619c90ab10ff885090e` | APPROVE | 0/0/1 | [Sol merge-only verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5971998176) |
| #305 | `178f640155b464905e07bb0ea53f5688ba90afce` | APPROVE | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5972016378) |
| #317 | `d0407b625e1d2bc63ebe9d063296bc85461842ed` | REQUEST CHANGES | 0/1/0 | [Sol merge verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5972176395) |
| #335 | `641fe8914853cca6a2dab76ac90230bbcd525504` | APPROVE | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/335#issuecomment-5972055988) |
| #331 | `5b58a1218acb1f5ba15cada8b8eaf8b78c75a058` | BLOCK | 1/0/0 | [Sol round-3 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331#issuecomment-5972195886) |
| #339 | `8165ca9560d2bcd35f92b1cd8468e6c998aa552a` | REQUEST CHANGES | 0/1/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/339#issuecomment-5972066633) |
| #341 | `7c791bb39979eb16481ce71a85de652b41368a3a` | REQUEST CHANGES | 0/2/2 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/341#issuecomment-5972146496) |

All publications re-read the exact head immediately before posting. Full explanations are in the cited comments and saved `verdict*.md` files; older sections below preserve intermediate evidence, not current verdict state.

### New must-fix evidence

- **A-331-7 remains open:** pause an old A request's 401, let B's access write finish while B's refresh-token write is held, release the old 401, then complete B's sign-in. The refresh starts under current generation rather than the original request's generation and leaves a contaminated access/B-refresh pair. Exact candidate probe has **1 failed / 9 passing controls**. Only test source was added; native storage, Axios and the fence are real over synthetic/no-network doubles. ([Executed one-job probe](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37142864604/job/111260727647))
- **B-339-1:** newly definitive no-write/no-account copy in unknown 500/catch-all branches. Actual three mapper probes fail with the candidate strings; production mapper source is unchanged at readiness head. Fix uncertainty wording, retain voice/actions/ref, and require authoritative evidence for definite no-write claims. ([Executed one-job probe](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37142289043))

### New #341

Claimed `7c791bb39979eb16481ce71a85de652b41368a3a`, READY and green. Stacked on already-reviewed #312 `f8375ca6`; all 14 own files read. Published REQUEST CHANGES 0/2/2: B-341-1 unordered accepted saves publish an older full-row snapshot over a later successful switch; B-341-2 generic/definitive failure copy lacks known-session classification and unknown-error support. Actual mounted-screen one-job probe executes 3 expected failures / 17 inherited passing controls; candidate full CI is 447 suites / 6,201 pass. C-341-3 unchanged mute description falsely promises email continues; C-341-4 bounded-list absence falsely implies cancellation. ([Published verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/341#issuecomment-5972146496), [executed probe](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37143660900/job/111263109665))

### Tool recovery

GitHub jobs-list API intermittently returns 403 rate limit, while GraphQL PR reads remain available. Do not repeatedly retry jobs-list. Public run summary supplies the exact job ID; authenticated `gh api .../actions/jobs/<id>/logs --allow-escape-sequences` retrieves its log directly. This recovered #331 probe, #317 before/after and #335 before/after logs without local heavy work. ([Recovered probe job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37142864604/job/111260727647))

## #325 — APPROVE

Head: `7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8`. Verdict: APPROVE. A/B/C: 0/0/0. B-325-4 closed; earlier mandatory closures retained. ([Exact candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8))

Read all prior AUDIT/fix comments, own content delta and pure-main integration; merge-tree equals head tree `994844b1559c7cc8fefd8039fc3391f78059b2a6`; pre/post own patch IDs match `7f0699f4b9a157e98dd79d20c93d0ba355598dfe`. Required checks 3/3 pass; no local tests while mobile READY is absent. ([Fix round](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5965763539), [exact-head execution](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37098411257/job/111132955305))

Evidence: `ops/aud-115/AUD-SOL-MOB/{pr325.json,comments325.json,verdict325.md}`. [Published verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5971606908). Audit worktree removed.

## #338 — APPROVE

Head: `9cf6614647aff5cd6a2fa3be4c7dab954ae4ce90`. Verdict: APPROVE. A/B/C: 0/0/1 (carried C-338-1 integration/deployment caveat). Read prior Sol approval and merge-only delta; merge-tree equals head tree `f5d8d1092c8fbd0a7ff95572f2b1f855456258cc`, with no conflict resolution. Own patch IDs both `3399a2f315dc3c1faa846f61b8afb642ce55807c`; no main delta in editor/API. Required 3/3 pass at the exact head. ([Merge-only instruction](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/338#issuecomment-5971586598), [exact execution](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37140092640/job/111252540362))

Local `ops/heavy.sh env CI=true npx jest --runInBand --ci --runTestsByPath src/utils/__tests__/packageTrial.test.ts src/__tests__/CoachPackageEditScreen.trialDays.test.tsx src/__tests__/CoachPackageEditScreen.lockPreview.test.tsx src/api/__tests__/paymentsApi.test.ts`: 4 suites / 50 tests PASS, exit 0 after mobile READY appeared; log `ops/aud-115/AUD-SOL-MOB/tests338.log`. No native/provider claim. ([Exact candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/9cf6614647aff5cd6a2fa3be4c7dab954ae4ce90))

Queue helper twice emitted #338 with cached pending checks; publication uses fresh required checks and exact-head query, not helper eligibility alone.

[Published #338 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/338#issuecomment-5971625871). Audit worktree and dependency link removed.

## #326 — APPROVE

Head `7c5626ed732b2287dd7437a69794de8d11b7d08f`. APPROVE, A/B/C 0/0/0. Pure merge tree `b850b946f45360de00fa3ae0709acb6fd7e23567`, old/new own patch ID `c63cbd742226fd73ed7891af3b0e0939c0df58ab`, plus one test-only seam commit. Sentry retains the generated support tag and main's credentials scrub. Full exact-head CI log read: 443 suites / 6,142 PASS, all three required checks pass. No local tests after the CI-first ruling. ([Fix round and red CI proofs](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5971714424), [exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37140328911/job/111253258197))

[Published verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5971729471). No audit worktree created.

## #315 — APPROVE

Head `a4d344df8fe1d7e763999dc30214ab7b0abdc69e`. Read all prior verdicts and new fix round; pure main merge tree `ac8c0a0da7c15e6a6bcb783baa9d9cc11aaf6fcd`, then five-line generated reference tagging plus seam/unit tests. Required checks pass. ([Fix round](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5971721325))

APPROVE, A/B/C 0/0/0. Own patch ID across merge `dad159a98eb51cb23eb6538401012982ee951a00`; prior B-315-1 remains closed. Read before run (two missing-tag failures), final CI log (437 suites / 6,040 PASS including real-SDK canary), no local tests. ([Before proof](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37140652545), [exact-head execution](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37140457075/job/111253644968))

[Published verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5971735236).

## #305 — content audit complete; latest merge waiting CI/readiness

Current head `d7f41e5b50c7eb64c1dbcf307fb7379ad0cafe47` is not yet READY and required checks are pending. Pure main merge `62eca0d814810f852283bdf19f35c7aac57e423f` reconstructs exact tree `e60c3aef3c7f7fa17c2c61479a611d296f05575a`. Read the entire own post-merge delta, real-global SDK/native canary, replacement bounded context and defensive scrub; likely closes B-305-12, subject to behavioral execution. ([Exact source](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/d7f41e5b50c7eb64c1dbcf307fb7379ad0cafe47))

Important: builder's linked before run does NOT yet prove the privacy assertion failing. It stops at Typecheck with missing `otaUpdatesContext` and `OTA_UPDATES_CONTEXT` exports; Test is SKIPPED. Do not describe it as an executed SDK-envelope failure. Log: `ops/aud-115/AUD-SOL-MOB/305-before-ci.log`. Correct negative evidence should use the canary alone on the previously reviewed source, without new helper-dependent unit tests. ([Actual before execution](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37140650937))

Dispatched a corrected historical control: one added canary spec (copied from the candidate) over the exact prior Sol-verdict source `4ac5980e`, on `audit/AUD-SOL-MOB/305-before-global-canary`, commit `51a2aba`. No candidate/production source edits. Worktree removed; remote probe branch retained until result/lane end. ([Independent historical-control CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37141414161))

That historical control executed: 436 suites, 1 failed / 435 passed; 6 privacy/context assertions failed, 6,068 tests passed. Actual synthetic fragments occur in both ordinary JS envelopes and native `setContext`, not just a missing export/typecheck. New head `178f640155b464905e07bb0ea53f5688ba90afce` adds a pure merge of `47124a4d`; independent merge-tree equals committed tree `89b075f0310c65d4d563266f15d19a0bf9d8e30a`. Claimed latest head; required checks currently queued. ([Executed historical control](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37141414161), [latest exact candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/178f640155b464905e07bb0ea53f5688ba90afce))

## #312 — merge-only inspection complete, waiting readiness

New head `f8375ca66bf11b2cbb721619c90ab10ff885090e`, current checks pending. Single README conflict; every runtime change is inherited main. Automatic tree `7d7c670c4ebed6602342f6449f06346b20d9d287` differs from the committed merge only by removing README conflict markers and keeping both sections. Runtime-only old/new own patch ID `b054674ab5f23f685bd8122e557af15893662ed4`; carried C-312-4 remains optional. ([Exact merge](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/f8375ca66bf11b2cbb721619c90ab10ff885090e), [prior Sol disposition](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5964623762))

## #317 — in progress, independent probe prepared

At `7174daa88a67c6d8028b2c741fd4d1d76d5b3c8b`, read full five-file content delta and pure merge. B-317-11 appears repaired with per-attempt completion and busy-state fences. However `WearablesShell.tsx:149-153` still logs arbitrary mutable `Error.name` rather than a closed class enum, before the stale-session return. The new test only checks error.message. An actual-shell privacy counterexample is prepared on a test-only audit branch; do not treat it as executed before CI completes. ([Exact candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/7174daa88a67c6d8028b2c741fd4d1d76d5b3c8b))

Probe dispatched at audit commit `ca3be1e` on `audit/AUD-SOL-MOB/317-error-name`; only one added spec, actual shell + inherited test doubles, one synthetic arbitrary-name invariant. Worktree removed; no candidate edits. ([Independent logger-boundary CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37141532606))

The probe executed and failed precisely at the privacy assertion: logger arguments contain `AUDIT_PRIVATE_PERSON_HEALTH_CANARY_317`; 1 failed / 6,226 passed tests, 1 failed / 439 passed suites. This is a dev-logger boundary counterexample, not evidence of production transport. Before publication the builder independently repaired that exact problem; do not post a stale mandatory finding. Latest claimed head `82137c312e957cb05eedeaebf86fcd95029f2bde` includes pure main merge `ea061062` (tree `22c50c7de3d199ddb4240a24a373191680864057`), tests-only `cdd44461`, and a closed six-value classifier with stale return before logging. Full new production/test delta read; required checks still queued. ([Executed probe](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37141532606), [latest repair](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/82137c312e957cb05eedeaebf86fcd95029f2bde))

## #339 — new full copy audit; uncertainty counterexample queued

Claimed `275d1b5075701c94d2d6301e9af61acc09014538`. Read all 87 own production-copy files and the complete 238-line AST voice guard, including consent-hash exceptions and updated copy assertions. A potential mandatory semantic regression is newly introduced: generic 500/unknown outcomes now assert that nothing changed or no account was created, even though no authoritative reconciliation establishes that. Additional catch-all progress/report text has the same definitive-failure claim. This concerns auth/state-truth copy, not an objection to the voice rewrite itself. ([Exact candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/275d1b5075701c94d2d6301e9af61acc09014538))

Test-only audit commit `3d9f272` adds three actual-mapper invariants on that exact head. One-job CI v2 run is queued; no executed-probe claim yet. Candidate required tests are queued too; wait for exact readiness before verdict. Worktree removed after push. ([Independent outcome-copy probe](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37142289043))

## HANDOFF

PAUSED at owner 11:25 PDT direction; `LENSES_MAY_END` exists. Latest verdict table above is authoritative. #312 mid-audit completed after PAY split; future PAY heads belong to AUD-SOL-MOB-PAY. #317 merge-only delta posted; exact required CI fails 2 stale Health Connect assertions in `easUpdateGuard.test.js`; test expectations need clinic actual `"1"`, no setting reduction. #331 round-3 in-flight audit completed: 10 prior/auth controls pass, two independent legacy-migration/superseding-session tests fail; builder must fence migration's legacy read/write path, test and resubmit. #339/#341 need listed mandatory repairs and fresh dual audit. All six own remote audit branches deleted during lane-end cleanup; the final in-flight probe has since completed; no own worktrees retained.

## PAUSE — exact queue state and next owner action

Snapshot from `ops/aud-115/AUD-SOL-MOB/pause-final-queue-state.txt` (11:32 PDT, `date -u` recorded 2026-10-03T18:32:02Z). Resumption is operator-controlled; do not assume the helper's cache is a newer GitHub verdict.

| PR | Exact head | State / lens status | Next step |
|---|---|---|---|
| #325 | `7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8` | OPEN, draft, DIRTY; dual APPROVE, CI 3/3 | Builder resolves merge conflict and removes draft when instructed; lenses review new head. |
| #326 | `7c5626ed732b2287dd7437a69794de8d11b7d08f` | MERGED, prior dual APPROVE | No audit action. |
| #315 | `8fff3f8f3829aab4079973b38428e2d266bc3f3b` | OPEN, BEHIND; dual APPROVE, CI 3/3 | Operator chooses update/merge later; short delta audit if head changes. |
| #305 | `178f640155b464905e07bb0ea53f5688ba90afce` | MERGED, prior dual APPROVE | No audit action. |
| #317 | `d0407b625e1d2bc63ebe9d063296bc85461842ed` | OPEN, BLOCKED; Opus APPROVE / Sol REQUEST CHANGES; 1 required CI failure | Builder makes test-only fix for [B-317-12](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5972176395), green full CI and re-audit. |
| #331 | `5b58a1218acb1f5ba15cada8b8eaf8b78c75a058` | OPEN, BEHIND; Sol BLOCK, Opus owes this head; CI 3/3, no READY comment | Builder closes [A-331-7 legacy migration bypass](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331#issuecomment-5972195886), with both executed negatives and a legacy-read case; then READY/dual T4 audit. |
| #335 | `641fe8914853cca6a2dab76ac90230bbcd525504` | OPEN, BEHIND; dual APPROVE, CI 3/3 | Operator update/merge decision later; short delta audit on new head. |
| #339 | `8165ca9560d2bcd35f92b1cd8468e6c998aa552a` | OPEN, BEHIND; Sol REQUEST CHANGES; CI 3/3 | Builder fixes [B-339-1 uncertain-outcome copy](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/339#issuecomment-5972066633); then dual audit. |
| #341 | `7c791bb39979eb16481ce71a85de652b41368a3a` | OPEN, BEHIND; both lenses REQUEST CHANGES; CI 3/3 | Builder repairs [B-341-1 unordered settings saves and B-341-2 error mapping](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/341#issuecomment-5972146496), Opus' blank-load C and copy Cs as appropriate; #312 must merge first; dual audit. |

## HANDOFF

**Complete under PAUSE.** All current PR-head verdicts in the latest table are posted; no new audit begins. #331's executed one-job proof: [2 failures / 10 passing controls](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37144136085/job/111264479284), saved test `ops/aud-115/AUD-SOL-MOB/331-round3-writers-probe.test.ts` and job log `ops/aud-115/AUD-SOL-MOB/331-round3-probe-job.log`. #317 red required job saved at `ops/aud-115/AUD-SOL-MOB/317-merge-ci-job.log`. #341 screen counterexamples saved at `ops/aud-115/AUD-SOL-MOB/341-probe-job.log`. No candidate branch, production, deploy, or merge was touched.
