# AUD-SOL-6 / agent 112 — independent Sol audit

## Backend #646 — APPROVE posted

Head `32f7ede45e065175b04c228732e32382006057f9`, **A/B/C 0/0/2**, exact OPEN head and all ten required SUCCESS contexts guarded immediately before the single verdict. C-641-2 / OR-112-19 close on the changed coach/client-list surfaces; optional C-646-1 is the unchanged owner-only admin serializer, C-646-2 is defensive redaction of stored secret-key names. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5961990003).

Private Prisma generation passed and the six targeted candidate suites passed **171 tests**, exit 0; CI build passed **658 suites / 11,366 tests**, 20 suites / 209 tests skipped and five todo. Mobile main does not read removed purchase secrets; its existing subscribers-screen/backend reporting shape mismatch is outside this diff and not certified by the approval. [Detailed evidence and limits](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5961990003), [executed CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37066451115/job/111035311524).

## Backend #635 — audit complete, waiting for required build

At `d68c4f68ba750890bebfa61f50cf0693f7c69ea7`, B-635-4/5 closure is independently reproduced with the original probes; seven targeted suites passed **200 tests**, and both main merges reconstruct exactly with equal own patch IDs. The required build was still IN_PROGRESS at the last guard, so **no verdict has been posted** and no conditional approval is claimed. [Candidate checks](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635/checks), [prior findings](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5960268631).

Saved full metadata/comments/diffs, executed logs, original probes, merge proofs and comment drafts in `ops/evidence/AUD-SOL-6-112/`; continuing #627/#321 while the build completes. No push, merge, workflow dispatch or production action; worktrees remain preserved under the higher-priority workspace non-deletion instruction. [Completed scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5961990003), [pending paired candidates](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627), [mobile candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321).

## Backend #635 — APPROVE posted; required-build hold superseded

Head `d68c4f68ba750890bebfa61f50cf0693f7c69ea7`, **A/B/C 0/0/3**, all ten required contexts SUCCESS at the immediate pre-post guard; the one verdict is now posted. B-635-4/5 close with the original HTTP probes, other closed retention/consent/erase findings remain closed, and only existing optional C-635-4/5/6 are carried. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5962010453).

Seven local suites / 200 tests passed, exit 0; exact-head dedicated PostgreSQL Roman erase CI executed **11/11 PASS**, including the uniqueness, tenancy and silent no-DELETE-policy controls. Backend-before-v4 mobile, #331's independent holds, #608 erasure, B-EXPORT and rollout `remaining=0` qualification remain release boundaries, not overridden by this backend approval. [Live CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37068073246/job/111040728484), [scope and release limits](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5962010453).

## Mobile #321 — APPROVE posted

Head `4f5b058d2ec6d22c468eaef0d3db3238978d9465`, **A/B/C 0/0/0**, all three required contexts SUCCESS at the immediate pre-post guard; B-321-6 and C-321-7 close, and all earlier save/billing/publish/copy fixes remain closed. The body T3 UI scope was reviewed under the assignment's T4 paired-money lens without certifying backend #627. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5962087925).

Six targeted suites / 82 tests passed, exit 0; the unchanged vendor guard passed, both main merges are proven pure, and exact-head CI passed 418 suites / 5,749 tests. The initial targeted command's wrong contract-file path is retained in the evidence and explicitly superseded by the corrected complete run, not misrepresented as a product failure or pass. [Executed CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37068077944/job/111040743079), [detailed evidence and release limits](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5962087925).

## Backend #627 — REQUEST CHANGES posted

Head `c1d69c7f70533455e4f4d946e39e7809ca59e879`, **A/B/C 0/1/2**, all ten required contexts SUCCESS at the immediate pre-post guard; B-627-5/6/7 and C-627-4..7 close, but **new B-627-8 must close before merge**. C-627-2 is carried and C-627-8 is optional notification receipt resilience. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921).

**B-627-8:** a won-dispute reinstatement executes externally but its response or DB receipt is lost; the pending transfer blindly reuses a request key after an interruption long enough for Stripe to prune it, creating a second payment with no source-charge limit. Two independently executed real-service counterexamples produce **$189.60 in external reinstatements against one $94.80 local row**; both within-key-lifetime controls produce only $94.80. Existing reversal expiry tests do not cover transfer creation, whose committed fake retains transfer-key deduplication forever. [Finding and exact code evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921), [Stripe's documented pruning/new-request contract](https://docs.stripe.com/api/idempotent_requests).

**Recommended builder default:** recover external transfer identity durably from the existing transfer row and stable provider metadata; an aged ambiguous result remains uncertain/alerted and cannot pay again until found or proven not executed. Do not reopen B-627-5, require forbidden reserves/debits, or weaken OR-111-1 to address this separate creation boundary. [Minimal fix and acceptance cases](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921).

Private Prisma generation and seven targeted candidate/original-probe suites passed **113 tests**, with only the previously excluded OR-111-2 support-routing probe filtered; the final expanded audit file executed **9/9 selected probes**, including four original closures, two aged-payment defect reproductions, two cached-retry controls and the optional inbox-receipt duplicate. Those reproduction assertions deliberately pass on the defect and are **not acceptance**. [Executed scope](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921).

CI passed **660 suites / 11,452 tests** with 20 suites / 209 tests skipped and five todo; the main merge reconstructs exactly, and corrected before/after own-change patch IDs match at `bae973e2055259fed335a209595c9d85e5cc950a`. An initial evidence command incorrectly addressed `9d6351b0^2` (that commit is not a merge); the retained proof file then records the corrected comparison against merge-base `b9ee8e0a20443d9d56ade61d60ef453611d4c3fc`, not a fabricated successful first comparison. [CI job](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37060586706/job/111015971434), [merge/evidence disposition](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921).

### Evidence map

- Posted payloads and URLs: `ops/evidence/AUD-SOL-6-112/{backend-635,backend-646,backend-627,mobile-321}-verdict.md` and `{635,646,627,321}-comment-url.txt`.
- Exact-head pre-post check snapshots: `{635,646,627,321}-finalpostguard.json`; branch-protection contexts: `backend-required-pre627.json`, `backend-required.json`, `mobile-required.json`.
- #627 final original/new probes: `627-final-original-aged-control-probes.spec.ts`, copied into `wt/aud-sol6-627/test/audit-sol6-627-original-boundaries.spec.ts`; run via `ops/heavy.sh env CI=false npx jest --runInBand --forceExit --runTestsByPath test/audit-sol6-627-original-boundaries.spec.ts --testNamePattern='^(?!.*OR-111-2).*'`.
- #627 final log: `627-final-original-aged-control-probes.log`; initial seven-suite log: `627-targeted-and-original-probes.log`; earlier defect/receipt logs retained, not deleted.
- Exact provider documentation evidence: `stripe-idempotency-search.json`, `stripe-idempotency-reference.json`.
- Other targeted/full-CI/live-CI logs, full comments/diffs/metadata and merge proofs remain in the same evidence directory.

No tracked production-code changes, push, merge, workflow dispatch, real provider call or production action were performed; audit worktrees remain preserved because the higher-priority workspace instruction forbids deletion. The #627 probes are untracked audit-only files and the backend dependency clients are worktree-private. [Audit scope and limits](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921), [mobile scope](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5962087925).

## Supplemental operator retask — backend #646 MERGE-DELTA APPROVE posted

New exact head `58c2d64a7cf504a6643a84b53e4719fdf9419dd3`, **APPROVE**, **A/B/C 0/0/2** carried, no new findings; all ten required contexts SUCCESS at the immediate pre-post guard. This supersedes the earlier #646 head for merge readiness. [Posted merge-delta verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5962226320).

Pure parents are old approved `32f7ede4` and main `32e398ea`; reconstructed/committed tree is `26fb325233285f70170e0bcbbb55b22f7cbf6a3d`. All seven #646 source/test files retain identical blobs, no incoming-file overlap exists, own patch IDs match `43fe692ac3f20ccdaf7768457cf99f0441af9b65`, and full incoming-main and head-delta diff files compare byte-identically. [Purity and seams](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5962226320).

Scope correction is explicit: main's range also includes already-approved **#607**, alongside #635/#644/#649; there is no truthful proof that only the three initially named PRs arrived. This is a clean inherited-main change, not a conflict resolution or a new #646 finding. [Merged #607 approval](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/607#issuecomment-5959946105), [delta verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5962226320).

Private Prisma regenerated and the two unchanged original secret-boundary specs passed **12/12**, exit 0; CI build passed **661 suites / 11,462 tests**, with 21 suites / 220 tests skipped and five todo. Inherited schema/env/RLS/gate/roles seams were reviewed; no gate weakening or payment-model/selector change occurred. [Executed exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37069976541/job/111046867625), [local evidence and limits](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5962226320).

Evidence is retained under `ops/evidence/AUD-SOL-6-112/646-merge-delta-*`, plus `646-incoming-main-full.diff`; no push, merge, workflow dispatch or production action. Worktrees remain preserved under the higher-priority non-deletion instruction. [Completed scoped retask](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/646#issuecomment-5962226320).

## HANDOFF FOR AGENT 113

Hold backend #627 merge for **B-627-8**; route the saved aged-transfer/lost-response/lost-receipt probes to the next fee builder, flip duplicate-presence assertions to the one-payment invariant after the repair, and independently re-audit the new exact head with all ten required gates. Mobile #321 approval is UI-only and does not clear backend #627 or the #635 deploy-before-mobile release rule. [Backend hold](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5962121921), [paired mobile approval](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5962087925).
