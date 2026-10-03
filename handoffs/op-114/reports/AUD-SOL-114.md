# AUD-SOL-114 — independent T4 audit report

## Scope and method

Read lane AUD-SOL-114, AGENT_BRIEF_COMMON, _AUD_COMMON, _COMMON_114, AGENT_RULES, MODEL_ROUTING and LIVE_STATE; required legacy detailed-method files `ops/lanes/AUD-SOL-3.md` / `AUD-OPUS-3.md` are absent in this sandbox, so the present common contract governs.

Audit evidence retained under `ops/evidence/AUD-SOL-114/`: exact-head metadata/comments, live required-check readbacks, executed CI logs, own-change diff and draft verdicts.

No pushes, merges, update-branch, workflow dispatches, branch-protection script execution or production actions.

## Completed verdicts

| PR | Exact head | Verdict | Open A/B/C | Published comment |
|---|---|---|---|---|
| backend #627 | `7c29d98121d931af04d68038f97aec601589e6a2` | APPROVE | 0/0/1 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5964131926) |
| mobile #314 | `47398f73e091e84a1771ed99d337e2519f35d090` | APPROVE | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5964132509) |
| backend #645 | `f50de1b03fb46269ed3e726961132660072bf0e5` | APPROVE | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/645#issuecomment-5964133149) |

#627: B-627-8 and Sol C-627-8 CLOSED; C-627-2 finance retention seam CARRIED for whichever of #627/#608 lands second. Round-7 creation uncertainties reconcile before resend/budget; inbox row and receipt commit atomically; minor-unit arithmetic and owner forward-netting contract remain. [Sol disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5964131926)

#314: B-314-11 CLOSED; canonical support-email guard and actionable mail/copy/retry recovery are intact. [Sol disposition](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5964132509)

#645: live strict/app-bound 11-context list matches exactly, and conditional-job negative control is additive; setup script never executed. [Sol disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/645#issuecomment-5964133149)

Independent merge-tree reconstruction: #627 `29666ee4` = `82865284cb557f93e48d8c76fae77fe41aee2684`; #314 `54c2535e` = `2a21378133e5c62fa52c481dece70b15f48da68f`, `47398f73` = `8b66dd269ffe40d07a7219b8de75fab43ea53c05`; #645 `71ff95d3` = `09692c3a72b13b3c950f6c780d1060f3d2add251`. [627 merge](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/29666ee483db0d9fe63e06916f77b7b195d4145b), [314 first merge](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/54c2535e316e7487e74ee373fe8fa965c4b36779), [314 second merge](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/47398f73e091e84a1771ed99d337e2519f35d090), [645 merge](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/71ff95d39a95fa092e19b39ceb46f2ae04a60927)

Exact-head CI: #627 680 suites / 11,860 tests passed; #314 430 / 5,941; #645 674 / 11,746 plus community live 10 / 100. Backend skips 23 suites / 237 tests / 5 todo separately disclosed. All 11 backend / 3 mobile required contexts verified SUCCESS immediately before posting. [627 actual job](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37082648480/job/111086303940), [314 actual job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37081200143/job/111081889499), [645 actual job](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37080520246/job/111079793667)

No local Jest rerun: shared deps had no READY marker. Used reviewed exact-head executed CI and independent source/merge reconstruction; no fabricated local proof. Device/provider/deployment acceptance remains separate.

## Initial-pass deferred queue (historical; superseded below)

- Backend #608 awaits B-EXPORT-5 FIX ROUND and green CodeQL; current head `9650ce1493a90497bf32bc3966518eca7361563e` has failing CodeQL. [candidate checks](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608/checks)
- Mobile #327 awaits B-EXPORT-5 main merge; current head remains prior-approved `395c3312eb49b9c54d6feb94b6d8cc4f5f393c47`. [candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327)
- Mobile #321 awaits operator notice of #627 merge and refreshed #321; current head remains prior-approved `4f5b058d2ec6d22c468eaef0d3db3238978d9465`. [candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321)
- Backend #654/mobile #334 await both B-RECUR-BE/B-RECUR-MOB ready-for-audit notices; #654 remains stacked on #627. [backend](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654), [mobile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334)
- Backend #611 awaits B-PRIV-6 round 6; current head remains previously requested-changes `fda3afadacf4d684b1579f7f818dab2af3a49dea`. [candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611)

## HANDOFF

### Operator re-queue: #608 / #327 / #611

| PR | Exact head | Content verdict | Open code A/B/C | Published comment |
|---|---|---|---|---|
| backend #608 | `1cbecbdc5417dfac463df28ba331d07c579d7cfb` | APPROVE | 0/0/1 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964293526) |
| mobile #327 | `06c0f1754d7e0ba19176e8b24f2e832e8be3483c` | APPROVE | 0/0/1 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5964294003) |
| backend #611 | `1af96efa0ac3bcfc67b4685d96c71b779c1df365` | APPROVE | 0/0/0 | [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964309856) |

#608 B-608-12, C-608-8/10 and C-608-2/B-608-13 close. C-608-7's secret-keyed privacy correction is implemented; the existing C now narrows to fallback-derived key rotation/promotion portability and previous-only writing authority. Offline actual-helper probe confirms both old-derived-key lookup checks false and previous-only writes true. Safe operator default: dedicated receipt secret before the first r2 receipt, or unchanged fallback until its receipts drain; no blanket rotation-preservation claim. [full disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964293526)

#608 C-636-6 probe is runnable: read-only Step 1; transactional, rollback-only Step 2 with local 5-second lock timeout and the actual 33-line DO block. Step 2 is not read-only and can lock storage; must use the exact release role/check-out, confirm nonempty extraction, run in deploy window, and require actual success plus rollback before deployment. No live SQL was executed. [probe review](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964293526)

#327 main merge keeps both real Sentry privacy/credential passes; screen/client/scrubber are byte-identical to prior head and backend export contract unchanged. C-327-3 generic span-cap/processing-internal traversal remains carried. [full disposition](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5964294003)

Independent local exact-head targeted tests through heavy.sh: #608 7 suites / 158 tests, #327 7 / 102 (retained non-fatal Jest open-handle warning), #611 3 / 62; no skips. Commands and logs retained under `ops/evidence/AUD-SOL-114/{608-r8,327-r3,611-r6}-targeted.log`. Worktree-private Prisma generation passed for both backend heads. [608 exercised candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/tree/1cbecbdc5417dfac463df28ba331d07c579d7cfb/test), [327 exercised candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/tree/06c0f1754d7e0ba19176e8b24f2e832e8be3483c/src), [611 exercised candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/tree/1af96efa0ac3bcfc67b4685d96c71b779c1df365/test)

CI: #608 692 suites / 11,988 tests; #327 422 / 5,893; #611 675 / 11,786. Backend 10/11 required green (npm remains red; inherited braces high chain, plus moderate multer in #608 log), mobile all 3 green. No dependency-input delta versus main; content approvals do not bypass or certify merge eligibility. [608 CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37086679345/job/111098332922), [327 CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37086733670/job/111098492976), [611 CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37086781175/job/111098630514), [actual inherited audit](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37086679478/job/111098333513)

Initial-pass return check (historical, before the operator re-queue): no qualifying B-EXPORT-5 FIX ROUND/main-merge, operator #321 refresh notice, recurring pair ready notices or B-PRIV-6 round-6 comment had appeared; no duplicate or premature verdict was posted. #654 advanced during that pass to `8270234184bce27350839ad4ec0cd2253ce0b454`, still stacked and not announced ready. #608/#327/#611 were subsequently re-queued and completed above. [608](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608), [327](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327), [321](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321), [654](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/654), [334](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334), [611](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611)

All three disposable audit worktrees were removed after publication; reports, raw metadata/CI logs and comment bodies remain.

Operator decisions/actions needed: land #627 only after the second independent exact-head lens; retain C-627-2 in whichever deletion/fee composition lands second; then bring #321 current and send the specified notice; release the waiting items only when their explicit prerequisites are met. No owner decision is needed for the three audited deltas. [627 disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5964131926), [314 disposition](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5964132509), [645 disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/645#issuecomment-5964133149)

#611 B-611-5/6 CLOSED by authorized split and T4 re-grade. #662 carries the exact empty-snapshot grant→withdraw counterexample and original seq/version/hash, idempotency/collision, deleted-account, final-state and repeated/interrupted recovery requirements. It is not implemented acceptance. Public source remains unchanged and promises age-out/deletion, not a restore capability; owner/vendor/manual-adoption evidence and B-611-1 publication hold remain. Enforce no production restore until #662 is built/audited; incident prose is not current authorization. [full disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964309856), [T4 follow-up](https://github.com/BradleyGleavePortfolio/growth-project-backend/issues/662)

Re-queue worktrees were removed after publication; all reports, actual CI/local logs, merge comparisons, source-copy/offline receipt probe and comment bodies remain in the evidence directory.

Operator follow-up: remediate the inherited npm gate without bypass and obtain current exact-head green checks; preserve C-627-2 on second landing; choose the documented safe receipt-key default until optional fallback-rotation hardening; run the release-role rollback probe and real account/export/device acceptance; keep #611 publication and production restore held. [608 handoff](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964293526), [327 release dependency](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5964294003), [611 holds](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964309856)

QUEUE EMPTY

Meaning: the operator re-queue (#608, #327, then #611) is complete. Other prerequisite-gated items require a further operator readiness message; none was silently approved.
