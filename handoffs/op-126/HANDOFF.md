# Operator 126 to agent 127 handoff

Status: drain completed and continuity package prepared at 19:53 PDT. Latest owner-reported credits remain 37.5k/45k; the owner has not yet reported the 43k handoff threshold. GitHub main, exact-head checks and verdicts win over every SHA or result written here. This is not an instruction to launch agent 127 or a new fleet before the owner does so.

## Night lane after 22:53 (read first)

Owner 22:53: "38k/45k credits - scale to one agent, keep working until credit exhaustion". Operator builds fixes; exactly one lens agent at a time (Sol and Opus in sequence). GitHub wins over every SHA here.

- Mobile #452 MERGED 23:35 (Sol + Opus APPROVE at e287d4b6, via merge_if_dual) -> mobile main `8ba3ec30`. Fixes: assigned-workout Start opens the live workout (one getParent), coach contact card from Home, client Settings opens full Notification settings with Mute all, Support copy says it is separate from Roman.
- (superseded below) New owner APK building from `8ba3ec30`: throwaway branch `ci/APK-126-2` (workflow-only, never merge), run 37582331122. Verify the arm64 artifact sha256 and proof log, then share as "TGP Android test build — October 07" (owner installs, then sends one Roman message).
- Backend #813 head `69518cdd`: Opus APPROVE at that head (after B-813-4 fix). Sol r2 re-grade running.
- Backend #809 (AI workout edit) head `2197e94a`: B-809-1 progression injury screen, B-809-2 weekly cap 24 / beginner 16 across the program week (week-limits.ts), B-809-3 clause-level positive override, plus the apostrophe fix. Opus APPROVE at that head; Sol r2 re-grade running.
- Backend #815 (selective Apply, stacked on #809) head `3ccc08aa`: Sol APPROVE at that head (delta). B-815-1 fixed: partial Apply re-checked against per-workout, per-week and 14-exercise ceilings, 422 SELECTION_OVER_LIMITS. After #809 merges: merge main into #815, CI, READY, both lenses, merge.
- Then backend deploy (fly-deploy.yml only; exact-main CI, CodeQL, SBOM first). AI builder flags stay OFF until #809/#815/#813 are deployed AND the standalone-plan revision-0 fix lands (createPlan writes no WorkoutPlanRevision, workout-builder.service.ts:362-375; production has 0 workout plans today, so only createPlan needs it), then an owner-visible manifest PR.
- Revision-0 finding (operator trace 23:59, not built): a NEW standalone workout is saved by createPlan + setExercises (mobile CoachWorkoutBuilderScreen: autosave only when editing an existing planId; explicit Save always PUTs setExercises). Neither writes a WorkoutPlanRevision, so head_revision_id stays null (AI propose 409, autosave 409). Writing an empty revision 0 in createPlan alone is NOT enough: the next setExercises leaves the head empty while rows exist, and an AI apply would then rebuild from the empty head. The fix must keep the head equal to the rows: createPlan writes revision 0 and setExercises writes a new revision (cause 'manual_edit') in its existing transaction, in the same exercises_json shape autosave writes (client_ref etc.). T4 data; both lenses. Required before the AI builder flags go on.
- Arm64 APK from 8ba3ec30 delivered 23:58 as "TGP Android test build — October 07" (sha256 deb9c2a6f974ca637232bb1ae9eb9a29c689df2a790ae1a15645aa589a3f87b9, versionCode 5, same debug cert as 10-06, installs over it). Universal variant still building in the same run.
- Opus C on m#452: ContactView "Mute Conversation" switch saves nothing (ContactView.tsx:53), now reachable by clients. Smallest fix: hide the row. Not built.
- Digest: first real send 23:00 PDT, NotificationDigestLog 2 rows sent, no errors. Links in it are dead (APP_URL / CONSOLE_URL defaults, digest.service.ts:47-49; no /settings/notifications page). Owner decision pending: turn digests off via manifest until fixed (recommended) or keep sending.
- Still open for launch: Help pages say a paid plan is required; guest share-link purchase reads the saved Stripe status; U-4 coachless copy (owner decision). #820 / mobile #451 held (sharing policy).
- Worktrees: wt/OP-813, wt/OP-809, wt/OP-815 (backend), /tmp/apk2 (mobile ci/APK-126-2). Lens outputs: ops/aud-126/LN-SOL-126, LN-OPUS-126.

## Owner orders

- Agent 126 owns both app repos and all merges, pushes and deployments. Builders never merge or deploy.
- Owner 18:55: 32k/45k used; stop-and-drain to 6. Owner 18:56: “DO NOT CANCEL AGENTS” and “LET THEM FINISH AND THEN DO NOT START NEW WORK”. No agents were cancelled under this order. No replacement workers were launched. Finish existing PRs and review queues, then stop; do not replenish the fleet.
- Latest reported credits: 37.5k/45k at 19:21 PDT. Hand off at 43k, retaining the final allowance for continuity. Do not estimate credits; ask for the screen's usage number when needed.
- Owner 18:36 approved moving sub-coach Ask AI support to v1.1. Launch hides it only for sub-coaches; head/solo coaches retain the visible entry.
- Owner 19:19 approved the explicit sharing wording, then 19:20 questioned why another permission prompt is needed when a coach relationship implies normal log sharing. No revised notice-only flow has been built or approved. Keep the privacy pair held until the policy is aligned and its technical blocker is fixed.
- Owner 19:23: “yes please remove any coach subscription teirs for now. We have the white label service, thats the only thing thats even implied to use the gate right?” There is no coach software subscription product. Generic coach-tier restrictions should be disabled; client recurring packages, charges, dunning and payouts are separate and must remain unchanged. White-label service may have its own paid entitlement.
- Earlier owner commitments remain: mobile AI-builder PRs merged by 00:30, then a new APK; 10-07 device pass/build; no accounts created/reset; the owner sends the real Roman message from the installed APK. No production customer-data writes without asking first.

## Verified release state

- Current production deploy 18: backend `b59ccb3e539376f67e98a5399df1dfadf257f92f`, [successful run 37563690500](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37563690500). The release verifier proves the sole machine runs that exact SHA/image digest `f45c269e6e71643fc6ab60bd0a04c327c81e75703e1b2a704785cd3363dbe70a`. `/health` ok and `/readyz` db up rechecked at 19:53.
- Previous deploy 17: backend `111b0ad6c6290209ce50390643326ad67d1c8b11`, [successful run 37561522514](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37561522514).
- `/health` returned ok and `/readyz` returned ok/db up at 19:25. Endpoints: https://api.trygrowthproject.com/health and https://api.trygrowthproject.com/readyz.
- No prisma schema or migration delta from deploy 16; migrations acknowledgement left empty. No operator-initiated production customer-data writes were performed.
- Release contains #808 status/manifest, #810 scheduler registration fix, #812 Day-1 backend fix, #811 memory-consent capability, #816 guest payment/account and welcome-email fix, #817 sub-coach AI 404, #818 workout list ordering.
- Final drain backend main and current production `b59ccb3e539376f67e98a5399df1dfadf257f92f` include #821 Stripe readiness refresh, #814 assignment push preference fix, #822 coach billing observe-only configuration and #819 email sender unification. Exact-main CI, CodeQL/analysis and SBOM passed the release gate. Deploy 18 is complete; no prisma delta from release 17 and no customer-data write or sender rotation was performed.
- Mobile main `357663d5c6ade2e0c8fba3b6e177840bd7bf2e8d` includes #439 Ask AI, #443 entry points/history, #450 fun layer, #440 copy, #441 Day-1 round 2, #442 check-ins, #444/#448 workout logging, #445 booking, #446 memory consent and #447/#449 food logging.
- New owner arm64 APK was verified and delivered at 19:42 from that exact mobile main: [successful arm64 job 112600202794](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37561702685/job/112600202794). Artifact `tgp-357663d-clinic-arm64-apk` (ID 11456679547); SHA-256 check passed; proof confirms production API/Supabase endpoints, target SDK 36, no screenshot/dummy-host/service-role/server-key markers. Shared asset title: TGP Android test build — October 06. The universal variant in [run 37561702685](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37561702685) is still building. Workflow-only throwaway branch `ci/APK-126-1`, commit `6d7ba5d0`; never merge it. It does NOT contain the still-unfixed assigned-workout Start navigation fix or held privacy PR, and Ask AI is visible but paused pending backend safety fixes.
- Final live recount at 19:53: backend 64 + mobile 57 = 121 PRs into app-repo main today, 8 successful Fly Deploy runs today. Configuration restarts and merges to non-main branches are not counted. Launch path remains 5/7 pending owner device pass and store build/review. Owner update at 19:42 requested the current credit number to honour the 43k threshold; latest known remains 37.5k, not an estimate of current consumption.

## Approved coach gate change

- [Backend #822](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/822), audited head `b4f48a76fb0e65ab26eab7c9d60a0b21e436812d`, merged through `ops/merge_if_dual.sh` with Opus and Sol approvals and green CI.
- Declares `BILLING_ENFORCEMENT: unset` in the desired-state manifest; gives it a closed value set and kill-switch metadata; removes its old write from `fly-secrets-set.yml`. Never run that legacy workflow.
- Owner authorization covers making the generic SubscriptionGuard observe-only, including coach tier/status restrictions. It does not authorize customer record changes or changing client payment behavior.
- Read-only configuration plan [37562180086](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37562180086), from main `b5b546629191fc68e7c9329317d65f116b30feef`, succeeded: 0 names to set, 1 to unset (BILLING_ENFORCEMENT), 0 pre-staged changes, 76 unchanged. The approved scope check passed.
- [Apply/verify run 37562398593](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37562398593) succeeded at 19:32. Its log proves BILLING_ENFORCEMENT was the sole staged unset, and the sole started production machine holds every declared value and none of the unset names. Generic SubscriptionGuard enforcement is now OFF/observe-only. Health and db readiness passed again at 19:33; the restart still runs release-17 source, not #814/#821.
- Apply only via reviewed manifest + `fly-env-sync.yml`, then verify absence. A flag restart does not deploy #814/#821 source.
- Presence of BILLING_ENFORCEMENT in Env Truth did NOT prove its prior value was enforce or demonstrate a live 403. Earlier wording overstated that. Current owner policy independently authorizes disabling the obsolete guard.
- CustomDomainService has its own direct Pro-tier check, independent of this flag. It remains untouched. A purpose-built white-label entitlement is a follow-up, not a reason to restore subscriptions for ordinary coaches.

## Scheduler confirmation

- [Backend #810](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/810) removed the second ScheduleModule.forRoot registration. Runtime regression proves the double registration on baseline and a single registration with the fix; static guard also added. It is deployed in release 17.
- Earlier production history verified two CoachEffectivenessScore rows/night for one subject across 30 nights. Earlier money/notification read-only queries found no duplicate customer charges or notices; the audited tables had no relevant customer transactions. Empty production data is NOT load-tested payment proof.
- First post-release read [37561902787](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37561902787) had no useful timed samples; no inference was made from silence.
- Second read [37562451242](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37562451242) contains exactly ONE NudgeScheduler row and ONE SettlementSweepCron SFEE_SWEEP_DONE row at 19:30 PDT / 02:30:00Z, on machine 860311cee0d008, Nest PID 643. This directly contrasts the pre-release doubled quarter-hour rows. Drip-dispatcher produced no sample; do not claim it was separately observed once. The runtime registration test covers all registered timers, and the two observed production jobs each ran once at this sampled tick.
- Do not roll back: root cause predated deploy 16. No customer data cleanup approved or needed.

## Blocked existing PRs

All normal-path safety findings remain blockers even when CI passes. No further builders were started after drain.

| PR | Exact latest head | Remaining finding / next action |
|---|---|---|
| [Backend #809](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/809) | `8b82ead8d3d4598ba6f416e69a13f63c1fc55b6e` | Sol REQUEST CHANGES: same-exercise progress can increase an injury-contraindicated squat; weekly program muscle-set ceiling is not enforced. Also use the positive keep-instruction predicate from AIB-3, not mere name matching. Do not merge/flip as-is. |
| [Backend #815](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/815) | `b83e035776624d4b76d3e94c9b3a43433c3b9101` | Stacked on #809. Sol REQUEST CHANGES: chosen subset bypasses aggregate safety bounds (keep add, untick removal => too many sets/exercises). Revalidate the selected subset before writes, leave unsafe drafts pending with a specific 4xx. After #809 merges, retarget to main and rerun all checks/verdicts. |
| [Backend #813](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/813) | `dee67d534ac927c2c87ab0960d50185ed9cb3b5f` | Sol REQUEST CHANGES: “Keep Barbell Back Squat out of this plan” and “Want an alternative to Barbell Back Squat” still override the injury substitution, because only the text before the name is checked. Positive keep exception must inspect the full clause and fail closed on exclusion/alternative wording. |
| [Mobile #451](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/451) | `06570f132c2a2af0ccd5d9d39382a339e762aff7` | Sol REQUEST CHANGES: absent owner_access metadata is treated as false on the current backend, so privacy controls falsely promise an owner-coached client's logs are hidden. Distinguish unknown from false and use truthful fallback. Sharing UX is also under owner discussion. |
| [Backend #820](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/820) | `e6cf93160d95ee3d023ff01333c0dbd12e83eac9` | Dual-approved GET /consent/me owner_access metadata. Kept held with #451 until sharing policy/rollout is aligned. No default grants, no consent bypass changed. |
#819 is no longer blocked/open: it merged at 19:35 after exact-head READY, dual APPROVE and green checks at `1fcd9330c76e5629db4f06cd49b49d9f397a9c53`. No new sender configuration PR was started. Existing EMAIL_FROM_ADDRESS is retained, and RESEND_FROM_EMAIL remains set; do not retire it before the new source deploys or claim a verified current wrong sender.

## Existing findings not built

- Assigned workout Start is a normal client-flow blocker: `WorkoutAssignmentDetailScreen.tsx:110` expects an extra navigator parent. Auditor recommends one `getParent()` and correcting both false navigator mocks. No new PR was started after drain. See `AUD-E2E-CLIENT-126.md`.
- Standalone new workout lacks revision zero: `workout-builder.service.ts:362-375 createPlan`. Ask AI and autosave return stale-head/409. Save initial revision before the AI flip. See `B-AIB6-126.md` and `LM-OPUS-126.md`.
- AIB-3 wiring patch `ops/reports/B-AIB3-126-AIB3b-wiring.patch` is prepared but NOT applied; integrate only after #809/#813 fixes, with exact-head dual review. Injury safety, full context and weekly limits are not finished by the mobile merges.
- Keep the AI builder flags OFF until #809/#815 safety is corrected, standalone baseline works and the full integration is reviewed. Keep the entry visible in its paused state; only sub-coaches are hidden under the owner's approved launch exception. Do not claim the owner’s “live and ON” requirement is fulfilled yet.
- Flow gaps noted in current audits: AI-assignment push paths; guest share-link purchase reads saved Stripe readiness; nightly emails' console/unsubscribe destinations; misleading help-centre paid-plan copy. These were not started after drain. Read reports and avoid reopening completed fixes.
- Client goals/check-in time now survive Day-1 finish in account-scoped device storage but are not server-synced, and there is no selected-time reminder job. Do not promise those features.

## Nightly email follow-up

- Verify NotificationDigestLog after 23:00 PDT / 2026-10-07 06:00Z for actual `sent` status. No digest has been sent as a manual test by this operator.
- Prior failures happened before the owner verified the sender domain. Env Truth confirms EMAIL_FROM_ADDRESS and RESEND_FROM_EMAIL present/non-empty, but not their exact values. No current sender-domain failure is established.
- Auditor found default digest app/console URLs and unsubscribe destinations invalid. Owner has NOT approved disabling the email jobs; no email flag change was made. Do not describe the emails as definitely delivering tonight.
- Supabase is SELECT-only unless owner approves a specific write. Never create/reset an account or inject test consent/purchase rows to verify any of this.

## White-label status

This was a read-only response, not a new build assignment.
- Coach business name/logo/accent rendering exists in web invite/landing pages: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/111b0ad6c6290209ce50390643326ad67d1c8b11/src/landing-pages/landing-pages.html.ts.
- Custom-domain claim and DNS verification exist; certificate provisioning, verification automation and SNI plumbing are explicitly deferred in that implementation: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/111b0ad6c6290209ce50390643326ad67d1c8b11/src/landing-pages/custom-domain.service.ts.
- Current mobile remains the TGP app and identifiers, not an independently branded coach app: https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/357663d5c6ade2e0c8fba3b6e177840bd7bf2e8d/app.json.
- No live customer-domain deployment or finished white-label purchase/provisioning flow was verified. Do not sell it as a finished white-label app on this evidence alone.

## Files and operating rules

- Rules: TGP_SOURCE_OF_TRUTH.md A1, A2 overrides, A3 tier/dual-review format. Agent 125 handoff and AI_MASTER_BUILDER_PLAN remain supporting references.
- Current lane briefs and operator log: `handoffs/op-126/ops/`; full original workspace reports under `/home/user/workspace/ops/reports/*126*`. All builders and lens pairs reported finished by 19:36. There are no new assignments or replacement workers. Final backend rollout is verified; only the universal APK variant remains running externally.
- A continuity snapshot was pushed on backend branch `wip/op126/ops-snapshot`, final commit `bf56e40313961550ffd998dbfdecbded75573e20`. Do not merge that branch or use its root app source for a build; it was based on b5b54662 and contains selected redacted reports/queries/patches and tools, not secret/runtime payloads. It includes the final completed worker reports and verified release-18/operator notes.
- Promotion ONLY via `ops/merge_if_dual.sh`; require both latest same-head model approvals and no failed/pending required checks. Do not self-author a reviewer verdict. A REQUEST CHANGES is not waived by another model's approval.
- `sweep.sh` holds #809/#820 and mobile #451 explicitly; #822 is already merged/applied/verified. Inspect holds and latest exact-head REQUEST CHANGES before any promotion; never run a blind sweep.
- Backend code deploy ONLY `fly-deploy.yml`, current main exact SHA and release evidence. It refuses old main heads; repeated merges delayed deploy 17. Freeze promotion long enough for current-head CI/CodeQL/SBOM to finish rather than repeatedly dispatching queued heads.
- Flag changes ONLY reviewed manifest + `fly-env-sync.yml`; NEVER fly-secrets-set. Ask before production customer-data writes. No money spending, no account creation/reset.
- Every commit is Bradley Gleave with the standing approved email, no AI co-author. Never publicize the clinic partner or private records/secrets. Times from `TZ=America/Los_Angeles date`; owner is on Windows, never give terminal commands.
- Local heavy runs through `ops/heavy.sh`, one targeted suite. No full local tsc/full test suite; an operator attempt at full tsc ran out of memory. Use CI for full checks.
- The RO-backend worktree was accidentally advanced in its index/worktree without moving HEAD during earlier operator reads. At 19:36, after reviewers finished, operator restored its tracked files/index to its actual f71bb9a4 HEAD; tracked status is clean. Use clean pinned read-only worktrees or git show `<sha>:<path>` for new reads. Exact-head PR reviewers used their own worktrees.

## Continuation

The verified coach-gate change, deploy 18, delivered arm64 APK and five held/blocked PRs are the final drain state. The universal APK variant may still finish externally; check its job and proof before delivering that variant. Agent 127 should begin only under the owner's next instruction and should not reopen completed work. The owner may still supply a new credit number or Roman/device-test result. No unverified “launch ready”, “AI on”, current wrong sender or live white-label claim is justified by this package.
