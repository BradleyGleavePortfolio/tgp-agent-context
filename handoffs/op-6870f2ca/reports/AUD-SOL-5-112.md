# AUD-SOL-5 — operator 112

## backend #642

- Head: `859509843e787afab1d7aa172381478b93f3ad94`; **REQUEST CHANGES**, A/B/C **0/1/0**. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960161965)
- B-642-1 inherited and independently confirmed: Google-only deletion must work in deployed backend #608 before the Google audience manifest is merged; whole-manifest apply can otherwise enable the broken journey. [Finding and closure](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960161965)
- All 10 required exact-head checks green; local exact-head manifest validation passed with expected SHA-256 `51b2bd80…`. [Checks and evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960161965)
- Evidence/comment payload: `ops/evidence/AUD-SOL-5-112/backend-642-verdict.md`. No production action.

## backend #643

- Head: `f21b3c632a80037c852f91e5d41e33d31d99ef9e`; **REQUEST CHANGES**, A/B/C **0/2/1**. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960175016)
- B-643-1: booking reminders never reach a device transport; B-643-2: both channel rows appear in the inbox and double unread counts; C-643-1: UTC copy could be localized. Recommendation: deliver/deploy the prerequisite before enabling, not after. [Findings and minimal fixes](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960175016)
- All 10 required exact-head checks green; local exact-head manifest validation passed with expected SHA-256 `e62824ed…`. [Checks and evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960175016)
- Evidence/comment payload: `ops/evidence/AUD-SOL-5-112/backend-643-verdict.md`. No production action.

## backend #641

- Head: `563e3f80f913dd2a2b4efa5099d5e5944dabb19d`; **REQUEST CHANGES**, A/B/C **0/4/4**, including inherited Opus 0/2/4. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960713012)
- New B-641-3: mixed/non-USD ledger cents labelled USD; new B-641-4: billing cadence/count ignored in MRR. Independent service probes reproduced both; prior findings referenced without reissuing. [Findings and minimal fixes](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960713012)
- All 10 required checks green at the audited head; worktree-private Prisma generation passed; targeted existing tests **3 suites/44 tests passed**, independent assertions **2 failed as expected**. [Verification record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960713012)
- Exact commands and evidence paths in `ops/evidence/AUD-SOL-5-112/backend-641-verdict.md`. No code pushed or production action.

## mobile #329

- Head: `4071d0ce40d2c451addf1540654c2b16e5f66395`; **BLOCK**, A/B/C **1/4/4**, including inherited Opus 1/2/4. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960771086)
- New B-329-3: step-save envelope conflicts with backend persistence/resume; new B-329-4: active Connect state hides outstanding requirements and update action. Independent probes reproduced both; inherited Money-surface blocker and original findings referenced, not duplicated. [Findings and minimal fixes](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960771086)
- All 3 required checks green; existing targeted tests **1 suite/17 tests passed**, independent assertions **2 failed as expected**. [Verification record](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960771086)
- Exact commands and evidence paths in `ops/evidence/AUD-SOL-5-112/mobile-329-verdict.md`. No code pushed or production action.

## mobile #312

- Head: `90e78abe92ed94aea5f116fe630eb96c4c5f7b5a`; **REQUEST CHANGES**, A/B/C **0/2/2**, including inherited Opus 0/1/2. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960816016)
- New B-312-2: overlapping optimistic writes can invert server/UI preferences, and a stale rollback overwrites newer changes. This is source-level concurrency analysis, not a successful runtime reproduction; the extra UI harness had query API errors/one timeout, explicitly disclosed. [Finding and verification limitation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960816016)
- All 3 required checks green; existing targeted tests **2 suites/13 tests passed**; merge conflict resolution was README-only. Release backend #609 first, and preserve backend #635/mobile #310 build gate. [Verification and release order](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960816016)
- Exact command and evidence paths in `ops/evidence/AUD-SOL-5-112/mobile-312-verdict.md`. No code pushed or production action.

## backend #609 — returned after CI skip

- Head: `40616dcfa273501f1314890fa8966144b334cbdb`; **REQUEST CHANGES**, A/B/C **0/4/4**, including inherited Opus 0/2/3. [Posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683)
- New B-609-3: overlapping stale lease holders insert duplicate welcome messages; new B-609-4: reminders lack a send-time deletion check and can recreate personal rows/send after eligible-page selection; optional C-609-6: push opt-out suppresses enabled in-app reminders. All three independent assertions failed as expected against the candidate service. [Findings and minimal fixes](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683)
- Required CI **9/10 green**, `rls-live-tests` remains red on the inherited SQLSTATE assertion; Schema parity green. Worktree-private Prisma generation passed; existing targeted tests **5 suites/96 tests passed**. [Verification record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683)
- Both carried integration merges independently equal `merge-tree` exactly; own diff isolated to 33 files. Exact commands, scope, prior closure dispositions and evidence paths in `ops/evidence/AUD-SOL-5-112/backend-609-verdict.md`. [Scope record](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683)

## Operator reconciliation / completion

- All six queue items have exactly one AUD-SOL-5 verdict comment, each naming its full audited head; no code pushes, merges, workflow dispatches, production changes, or candidate-source edits were performed.
- A/B/C counts include open inherited findings where referenced; new-only counts: #642 0/0/0 (inherited prerequisite), #643 0/2/1, #641 0/2/0, #329 0/2/0, #312 0/1/0, #609 0/2/1. [#642 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960161965), [#643 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960175016), [#641 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960713012), [#329 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960771086), [#312 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960816016), [#609 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683)
- #643's later Opus comment independently assigns B-643-1 to a different grouping (UTC + duplicate inbox) and treats no-device-push as C-643-2, whereas this lens requires device delivery and inbox correctness before activation. Preserve each comment's IDs with its lens/URL; recommended default is deploy delivery/inbox prerequisites before the flip, not waive either quality gap. [This lens, posted first](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960175016), [later Opus audit](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960179586)
- Local evidence, unsuccessful harness attempts, payloads, and detached worktrees are retained for reproducibility; no workspace cleanup was performed.

## Additional assigned queue — coach Money and health-data re-audit

- Mobile **#329** at `83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa`: **BLOCK, A/B/C 1/1/1**, comment **5960983148**; A-329-1 awaits #332 integration and exact-head delta, B-329-1 remains vulnerable to delayed duplicate creates because the backend does not implement the sent idempotency identity, and optional C-329-5 concerns T4 metadata. [Re-audit verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148)
- #329 targeted tests **2 suites / 33 passed**, all required exact-head checks green, merge of main proved pure; prior B-329-2..4 and C-329-1..4 closed. [Verification and dispositions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148)
- Mobile **#332** at `61eea1159aa68835ef2269a4cb9e9d46cd2533f6`: **REQUEST CHANGES, A/B/C 0/3/1**, comment **5961043528**; B-332-1 cached wrong-period money after failed range switch, B-332-2 recurring charges falsely labelled Monthly, B-332-3 invalid summary values fabricated as USD zero; optional C-332-1 concerns invisible cached refresh failures on Home. [Money verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- #332 targeted tests **8 suites / 153 passed**, independent assertions **3 failed as expected**, pure #329 integration; one Typecheck/lint/test exact-head check green but the stacked PR lacks the two required Analyze checks, so it is not main-base CI-ready for merge. [Verification and integration gate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- Mobile **#317** at `58c2d53fa061071e193e5e3b5f981209425e9e0c`: **REQUEST CHANGES, A/B/C 0/3/2**, comment **5961170156**; new B-317-6 pending identity capture revives a closed/unmounted Connect attempt, B-317-7 native HC pages/types continue after logout, B-317-8 cloud OAuth errors drop status/code and reference/support/reporting; the two C findings are inherited from same-head Opus rather than duplicated. [Wearables verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- #317 prior A-317-1 narrow permission-dialog account-switch reproduction, B-317-2 partial-import UI, B-317-5 reconnect affordance and C-317-4 disconnect confirm are closed; the manifest exact-read-set test passes, and the main merge is explicitly **not pure** with reviewed resolution seams. [Disposition and scope](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- #317 targeted tests **16 suites / 208 passed**, independent assertions **5 failed as expected**, all three required exact-head checks green; no device or new native binary proof was attempted. [Verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- Supplementary operator reports: `ops/reports/S-COACH-MOB-2-112.md`, `ops/reports/S-WEAR-2-112.md`, and `ops/reports/S-WEAR-2-112-pr317-body.md`; comment payloads, exact commands and probes are retained in `ops/evidence/AUD-SOL-5-112/`.

## HANDOFF FOR AGENT 113

Latest completed **assigned audit heads**, not a claim that later builder heads are approved:

| PR | Audited full head | Verdict | A/B/C | Comment id and URL |
|---|---|---|---|---|
| backend #642 | `859509843e787afab1d7aa172381478b93f3ad94` | REQUEST CHANGES | 0/1/0 | [5960161965](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960161965) |
| backend #643 | `f21b3c632a80037c852f91e5d41e33d31d99ef9e` | REQUEST CHANGES | 0/2/1 | [5960175016](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960175016) |
| backend #641 | `563e3f80f913dd2a2b4efa5099d5e5944dabb19d` | REQUEST CHANGES | 0/4/4 | [5960713012](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960713012) |
| mobile #329, re-audit | `83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa` | BLOCK | 1/1/1 | [5960983148](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148) |
| mobile #312 | `90e78abe92ed94aea5f116fe630eb96c4c5f7b5a` | REQUEST CHANGES | 0/2/2 | [5960816016](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960816016) |
| backend #609 | `40616dcfa273501f1314890fa8966144b334cbdb` | REQUEST CHANGES | 0/4/4 | [5960820683](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683) |
| mobile #332 | `61eea1159aa68835ef2269a4cb9e9d46cd2533f6` | REQUEST CHANGES | 0/3/1 | [5961043528](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528) |
| mobile #317 | `58c2d53fa061071e193e5e3b5f981209425e9e0c` | REQUEST CHANGES | 0/3/2 | [5961170156](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156) |

- **NOT AUDITED: none of the already-assigned items.** Every audit round has one durable exact-head verdict; the earlier #329 head/comment remains historical and is not overwritten. [Earlier #329 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960771086)
- Merge gates remain unsatisfied: #609 has the reported inherited red live-RLS check; #332 needs integrated main-base required checks; no listed verdict is APPROVE. [#609 gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960820683), [#332 gate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528)
- Coordinate #641 summary currency/cadence changes with #332's strict decoding, fix package-create idempotency, and only then integrate Money into #329 for the delta closing A-329-1. [Money contract](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961043528), [setup blocker](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960983148)
- Accepting no new items under the clean-stop order. No pushes, merges, dispatches, production actions or candidate-source edits were made.
- Worktree removal was **not performed** because the higher-priority workspace instruction prohibits deleting or cleaning up workspace files. Retained auditor worktrees: `wt/aud-sol5-641`, `wt/aud-sol5-609`, `wt/aud-sol5-312`, `wt/aud-sol5-329`, `wt/aud-sol5-332`, `wt/aud-sol5-317`; only shared dependency links are untracked, and the handoff keeps evidence/probes intact. Operator 113 can arrange authorized cleanup separately.
