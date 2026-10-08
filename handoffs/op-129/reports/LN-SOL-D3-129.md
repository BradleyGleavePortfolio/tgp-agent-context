# LN-SOL-D3-129 — standing GPT-6.1 Sol review lane

## PROVEN B — mobile #521 at 0b10156da508c37cba55a18f902ad97ab6cb953e

**B-521-SOL-1:** A client writes workout notes or edits sets before ticking the first completed set, taps Leave/Back, and loses the autosaved draft because the new zero-completed-sets branch deletes it without confirmation. [Zero-completed leave branch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/screens/client/ActiveWorkoutScreen.tsx#L1084-L1162)

Proof: the autosave payload includes all `sessionExercises` and `workoutNotes`, regardless of completed status, while `askBeforeLeaving` treats `logged === 0` as empty and calls `releaseEmptySession`, which cancels persistence, clears the pending payload and removes the stored session. [Autosave payload](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/screens/client/ActiveWorkoutScreen.tsx#L418-L449) [Draft mutation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/screens/client/ActiveWorkoutScreen.tsx#L543-L550) [Deletion path](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/screens/client/ActiveWorkoutScreen.tsx#L1088-L1137)

Smallest fix for the Opus fixer: ordinary leave/back must preserve and flush the unfinished draft rather than infer emptiness from completed-set count; clear only after successful Finish. Add a mounted regression with notes/edited weights and zero completed sets: Leave and Back retain the saved session and reopening restores those exact edits.

Operator: agent 129. Lane: LN-SOL-D3-129.

## Standing status

ACTIVE/IDLE under the operator's 16:43 RESUME order. Thirteen exact-head verdicts posted so far: twelve APPROVE and one REQUEST CHANGES (historical B-521-SOL-1); latest backend #864 APPROVE at 17:35 PDT. [Latest verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/864#issuecomment-6049699153)

Evidence and payloads are retained in `/home/user/workspace/ops/review-evidence/LN-SOL-D3-129/`; all prior verdicts and exact heads are recorded below.

Selection: m#532 first, then Opus-approved heads still needing Sol in the assigned queue; m#513 held. Re-check exact head and Sol claims before both claim and verdict. Use the board while fresh; if its updated time exceeds ten minutes, direct GitHub state is permitted no more than once per three minutes. Sleep 180 seconds while idle; deadline remains 22:45 PDT.

## B list

One proven: B-521-SOL-1 above.

## Scope traced

Standing lane initialized. Read the full common brief, only the LN-SOL-128 job entry, SoT A1 and the two A2 owner overrides, all of A6, and op-128 handoff section 9. Deadline: 22:45 PDT on 2026-10-07. Work selection is restricted to the local operator board; mobile T3/T4 and B fixes take priority. Reviews remain independent of the Opus verdict.

## U list

None recorded yet.

## C one-liners

None recorded yet.

## PRs

### mobile #520 — weight-sheet B fix

- Exact head: `29d3de2a0fddbbfa014f20f68f595a62b01ce776`; 409 changed lines (361 additions, 48 deletions), three files. [PR #520](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/520)
- Claimed as LN-SOL-D3-129; agent 129. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/520#issuecomment-6048665760)
- Scope traced: modal keyboard avoidance and dismissal, unchanged authenticated weight POST, save/error/reset state, DTO bounds, goal field, date/change presentation, and nine added tests. [Exact-head implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/29d3de2a0fddbbfa014f20f68f595a62b01ce776/src/screens/client/ProgressScreen.tsx) [Regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/29d3de2a0fddbbfa014f20f68f595a62b01ce776/src/screens/client/__tests__/ProgressScreen.weighIn.test.tsx)
- CI: required Typecheck/lint/test and CodeQL checks green; no local tests run because shared dependency READY is absent; no device test claimed. [Required CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37695079622/job/113044688570)
- Independent Sol verdict posted: APPROVE after exact-head GitHub recheck. B=0, U=0. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/520#issuecomment-6048682615)

### Selection skips

- backend #861 at `cf1c41765ea4b14a843b1987331999ffc3fb5088` skipped: LN-SOL-B3-129 has a fresh exact-head claim at 17:31 PDT. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/861#issuecomment-6049653610)
- mobile #532 at `aaf917053bb383ffa50119f60c272b5df3f53a43` checked first on resume; skipped because LN-SOL-B3-129 claimed that exact head at 17:27 PDT, less than 45 minutes ago. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/532#issuecomment-6049606857)
- mobile #513 at `79e0760d90c7a3cebee3728d4c7e94113498f8d7` skipped: LN-SOL-B3-129 has a fresh claim at that exact head; no review or verdict posted by this lane. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6048663197)
- mobile #518 at `cd4a29d23c5cebbdf94f923d94595ddbcdb5b928` skipped: LN-SOL-C3-129 has a fresh claim at that exact head; no review or verdict posted by this lane. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/518#issuecomment-6048692259)
- mobile #504 at `431f65b8b239f63f63f7668a82e07d903630a731` skipped: another Sol verdict already exists at that head. [Existing Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/504#issuecomment-6048784588)
- mobile #485 at `6515839abcaa8fd359c0bcdcd2d57849200494e6` skipped: LN-SOL-A3-129 has a fresh claim at that exact head. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/485#issuecomment-6048784552)
- mobile #494 at `7109690f2ca2c8ac3f816381cdfd4ad2bbf1e102` skipped: LN-SOL-B3-129 has a fresh claim at that exact head. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494#issuecomment-6048937049)
- mobile #514 at `7691dc6096b198c5ecdfbf64af492a55823f0fcd` skipped: LN-SOL-B3-129 has a fresh claim. [Existing Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/514#issuecomment-6048977560)
- mobile #525 at `3cc08a1a0c54dc2b39c4588aee480084a03773e7` skipped: a Sol verdict already exists at the exact head. [Existing Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/525#issuecomment-6049000489)

### mobile #506 — truthful Guidance fix delta

- Exact head: `caa9106365efbe92e5adf4dd9f4e297c06e5c124`; 342 changed lines (197 additions, 145 deletions), ten files. [PR #506](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/506)
- Claimed as LN-SOL-D3-129; agent 129. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/506#issuecomment-6048695422)
- Scope traced: prior Sol B1, the no-answer service-error branch, successful degraded reply, availability banner, mounted 503 regression, unchanged reply/refusal/cap/persistence paths, and matching README delta. [Exact-head implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/caa9106365efbe92e5adf4dd9f4e297c06e5c124/src/screens/client/AIGuideScreen.tsx#L157-L269) [Regression coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/caa9106365efbe92e5adf4dd9f4e297c06e5c124/src/screens/client/__tests__/AIGuideScreen.visual.test.tsx#L70-L86)
- Previous B1 closed; no new B/U in fix delta; CI green. [Required CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37694680773/job/113043361817)
- Independent Sol APPROVE posted after exact-head GitHub recheck. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/506#issuecomment-6048704422)

### mobile #519 — real exercise-library source

- Exact head: `e84c1e4a1c9217ef3194227b877efb5e1601382f`; 225 changed lines (144 additions, 81 deletions), six files. [PR #519](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/519)
- Claimed as LN-SOL-D3-129; agent 129. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/519#issuecomment-6048707208)
- Scope traced: live-source adapter and DTO mapping, body-part/equipment intersection, cursor propagation, detail 404-only fallback, backend search/detail compatibility, retry/empty state, changed facet parity, and regression tests. [Exact-head adapter](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/e84c1e4a1c9217ef3194227b877efb5e1601382f/src/api/exerciseCatalog.ts#L53-L117) [Route/action tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/e84c1e4a1c9217ef3194227b877efb5e1601382f/src/screens/client/__tests__/ExerciseLibraryRedo128.test.tsx#L48-L104)
- B=0, U=0; disclosed existing filtered-source cap is C (edge, deferred to 10k clients); CI green. [Required CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37694541013/job/113042860279)
- Independent Sol APPROVE posted after exact-head GitHub recheck. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/519#issuecomment-6048721281)

### mobile #521 — entitlement and unfinished-workout leave paths

- Exact head: `0b10156da508c37cba55a18f902ad97ab6cb953e`; 602 changed lines (447 additions, 155 deletions), 12 files; T4. [PR #521](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/521)
- Claimed as LN-SOL-D3-129; agent 129. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/521#issuecomment-6048735114)
- Scope traced so far: confirmed-active latch, first-fetch fail-closed path, inactive/402 revocation, identity reset, automatic draft adoption, autosave payload, set edits, zero-completed deletion, leave/back/tab guarding and changed regression tests. [Exact-head provider](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/entitlements/EntitlementProvider.tsx) [Exact-head workout](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/screens/client/ActiveWorkoutScreen.tsx)
- CI green; independent Sol REQUEST CHANGES posted after exact-head GitHub recheck, for B-521-SOL-1 above. [Required CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37696307775/job/113048787054) [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/521#issuecomment-6048765704)

### mobile #502 — invite-to-login preservation fix delta

- Exact head: `a83774e0e4504b38875ad66f3d4e86750d0f84b1`; 381 changed lines (301 additions, 80 deletions), seven files; join/auth fix reviewed as T4. [PR #502](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502)
- Claimed as LN-SOL-D3-129; agent 129. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502#issuecomment-6048771550)
- Scope traced: previous Sol B1, validated-token write before Sign in/Continue, storage/token format, sign-in storage boundaries, root invite replay, Home banner reachability, explicit Attach/sharing notice, and new regression. [Exact-head sign-in handoff](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a83774e0e4504b38875ad66f3d4e86750d0f84b1/src/screens/auth/AcceptInviteScreen.tsx#L118-L139) [Handoff regression](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/a83774e0e4504b38875ad66f3d4e86750d0f84b1/src/screens/auth/__tests__/AcceptInviteKeepsInvite.test.tsx#L50-L69)
- Previous Sol B1 closed; no new B/U; CI green. [Required CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37696319591/job/113048827055)
- Independent Sol APPROVE posted after exact-head GitHub recheck. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502#issuecomment-6048789859)

### mobile #523 — Roman navigation and returning greetings

- Head `7e909c35e8192a383f4b7b8e50272ccdf7062057`; 221 changed lines (+208/-13), ten files. [PR #523](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523)
- Claim first, then traced Home `initial:false`, Back in all chat phases, bound history before session creation, first/returning greeting selection, failure fallback and unchanged send/consent/cap/deletion paths; inspected 20-test regression coverage. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523#issuecomment-6048942276)
- Sol APPROVE posted after exact-head recheck; B=0, U=0 newly identified; required CI/CodeQL green; no local/device execution claimed. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/523#issuecomment-6048953053) [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701040917/job/113064280530)

### mobile #504 — auth main-merge/import resolution

- Head `01f2dee6c09d284ad501901f7b49b704372dcbdb`; 376 changed lines (+244/-132), nine files. [PR #504](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/504)
- Claim first; traced delta from prior Sol-approved `431f65b8`, preserved main's resend import/error state/conditional action, unchanged main-parent auth/session/provider handlers, inherited resend regression and shared README resolution. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/504#issuecomment-6049001920)
- Sol APPROVE posted after exact-head recheck; B/U=0 newly identified; four CI checks green; no local/device run. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/504#issuecomment-6049010818) [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702031330/job/113067494987)

### backend #860 — client guidelines read (T4)

- Head `b896ef9aa3662aabdaff161cde16f93aca57b97a`; 255 changed lines (+228/-27), eight files. [PR #860](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/860)
- Claim first; traced `client-guidelines.controller.ts:26–36` auth/roles/entitlement, `coach.service.ts:555–570` current-coach/own-client composite query and minimal DTO, unchanged coach ownership/write, module registration, shipped mobile consumer, and five HTTP regression cases. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/860#issuecomment-6049628244)
- Sol APPROVE after fresh Sol-claim and exact-head GitHub rechecks; B/U=0 newly identified; required CI green; no local/device execution. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/860#issuecomment-6049636550) [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37702508642/job/113069056893)

### backend #858 — own water/fast deletion (T4)

- Head `14aaf3a76a01bd386e465465dabbb21d82f3bf0a`; 250 changed lines (+246/-4), five files. [PR #858](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/858)
- Claim first; traced controller authentication/roles/fasting entitlement, `water.service.ts:71–74` and `fasting.service.ts:65–72` owner-scoped deletion, indistinguishable foreign/missing 404s, fasting cache invalidation, unchanged history/start/end paths, and eight HTTP regression cases. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/858#issuecomment-6049642267)
- Sol APPROVE after fresh Sol-claim and exact-head GitHub rechecks; B/U=0 newly identified; required CI green; no local execution; app wiring is a separate delivery. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/858#issuecomment-6049647492) [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37702269735/job/113068278729)

### backend #863 — leaderboard chosen-name filter (T3)

- Head `381fdda0786c1484cadf1559cd287fc381a91d06`; 81 changed lines (+76/-5), three files. [PR #863](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/863)
- Claim first; traced `leaderboard.service.ts:235–245` filter before write, unconditional opt-out, `:383–390` legacy chosen-name suppression, existing content filter/422 envelope, unchanged roster/consent scope, and three added regressions. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/863#issuecomment-6049651868)
- Sol APPROVE after fresh Sol-claim and exact-head GitHub rechecks; B/U=0 newly identified; required CI green; no local execution. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/863#issuecomment-6049659625) [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37702776449/job/113069924019)

### backend #862 — post/reply first names and reaction reads (T3)

- Head `a340113982a504bcb8697ab1eb8dab30f8afe753`; 467 changed lines (+442/-25), ten files. [PR #862](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/862)
- Claim first; traced `community-posts.service.ts:103–155,222–269,361–367` authorization/block boundaries, batched first-name/reaction reads, shared reaction aggregation, all write responses, DI registration, mobile passthrough DTO compatibility, four service regressions and live-DB case 9. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/862#issuecomment-6049664987)
- Sol APPROVE after fresh Sol-claim and exact-head GitHub rechecks; B/U=0 newly identified; build and community-live CI green; no local execution. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/862#issuecomment-6049675838) [Build CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37702751945/job/113069841921) [Community CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37702751945/job/113069841887)

### backend #859 — own weigh-in edit/delete (T4)

- Head `b7f74c4e289d5550eabec4f077f4837474bc4103`; 258 changed lines (+253/-5), four files. [PR #859](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/859)
- Claim first; traced `weight.service.ts:45–62` owner-scoped update/delete/return, empty-edit rejection, cache invalidation, `weight.dto.ts:23–35` allowlist/bounds/note clearing, controller guard inheritance/204, unchanged create/history, and 16 regression cases. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/859#issuecomment-6049680139)
- Sol APPROVE after fresh Sol-claim and exact-head GitHub rechecks; B/U=0 newly identified; required CI green; no local execution; mobile row actions are separate. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/859#issuecomment-6049686299) [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37702412223/job/113068745399)

### backend #864 — truthful client digests/reminder copy (T2)

- Head `fbf4d1a9a2e45787c35fff98e93e444f7900b8e2`; 544 changed lines (+453/-91), 14 files. [PR #864](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/864)
- Claim first; traced `digest.service.ts:69–75,258–328` daily-only default-off switch, own-client seven-day queries, actual current/best streaks and unit-aware first-to-last weight change, `:167–170` inbox-row removal, unchanged weekly/coach/opt-out delivery, assignment-aware reminder copy, nine digest cases and modified reminder/privacy regressions. [Sol claim](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/864#issuecomment-6049690331)
- Sol APPROVE after fresh Sol-claim and exact-head GitHub rechecks; B/U=0 newly identified; required CI green; no local execution or production switch change. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/864#issuecomment-6049699153) [CI](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37704790337/job/113076456456)

## Historical finding (current disposition not rechecked)

- B-521-SOL-1 was proven at the old exact head above; no claim is made about its later disposition. Recommended default at that head: preserve the unfinished draft on ordinary leave/back and clear only after successful Finish. [Reviewed deletion path](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/0b10156da508c37cba55a18f902ad97ab6cb953e/src/screens/client/ActiveWorkoutScreen.tsx#L1088-L1137)

## HANDOFF

Branch: review-only lane; no builder branch, commits or unpushed work created.
Exact head last reviewed: backend #864 `fbf4d1a9a2e45787c35fff98e93e444f7900b8e2`; all thirteen exact heads, sizes and CI evidence are recorded above. [Last posted verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/864#issuecomment-6049699153)
Done: thirteen independent Sol verdicts, twelve APPROVE and one REQUEST CHANGES; report/evidence current; no merges, deployments, production changes or local test runs.
Left: monitor m#530 until READY at head, plus new READY heads missing Sol, respecting fresh claims; m#513 held. B-521-SOL-1 is historical, with later disposition not rechecked. [Historical verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/521#issuecomment-6048765704)
RESUMED by the later operator order; standing until 22:45 PDT or another explicit stop.
