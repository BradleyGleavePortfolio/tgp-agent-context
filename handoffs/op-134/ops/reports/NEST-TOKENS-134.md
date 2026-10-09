# NEST-TOKENS-134 report (agent 134, claude_opus_5_5, T4)
Worktree /home/user/workspace/wt/NEST-TOKENS-134-backend, branch agent134/nest-tokens-134 off origin/main e261ce5e.

## Status
- 19:4x PDT: started. deps/backend not READY; read code.
- 20:0x: sandbox stalled ~20 min (shared load). Deps linked 20:1x.
- 20:2x: wiring spec 8/8 local; failing-first on main's two service files 7/8 fail (throttler proof passes, as expected).
- 20:2x: b#893 opened (head 9ab15fff = merge of main). Danger failed: latest commit subject was the merge commit, not
  Conventional Commits (danger reads the title, else the latest subject; "[134]" titles never match). My mistake: an
  unneeded main merge as the head. Fixed with a no-file-change commit bc476b48 ("ci: ..."), pushed fast-forward.
  Lesson for other builders: a [134] PR's HEAD commit subject must be conventional (feat:/fix:/ci: ...).
- 20:3x: b#895 opened (PR 2, head 7d0a1555), onboarding.service.spec 84/84 local, eslint clean.
- 20:4x: both CI fully green, CLEAN. mwb-3-live-tests ran the two Roman live specs: 11/11 PASS (seen in CI log).
  READY posted: b#893 @ bc476b48e2be6044993c33df6e7a6c65520d2c24 (issuecomment-6073778061);
  b#895 @ 7d0a1555f8ad4fd4ad6ac4b6f9c7e8a293c2cd3d (issuecomment-6073778300). Waiting for verdicts (poll 180 s, up to 90 min).

## PR 1 findings (from the code; production SELECT counts)
Root cause (same as B31, b#891): `@Optional() x: T | null = null` with no @Inject token is emitted as `Object` in
design:paramtypes under strictNullChecks; Nest resolves nothing and the default (null) is used in production.
Whole-src scan (every constructor param with @Optional, comments stripped): 143 optional params; union-typed without a token:
1. src/messaging/messaging.service.ts:146 MessagesSafetyService | null — REAL. MessagesSafetyService is the Apple 1.2 BLOCK
   service (not content screening). In production every block check was skipped: a blocked user could still send (no 403
   BLOCKED), the blocker still saw the blocked party's messages, unread badges and push fanout ignored blocks.
   Introduced 58c4588b (#263, 2026-05-23). Production: UserBlock rows = 0 (nobody affected yet).
2. src/messaging/messaging.service.ts:158 VoiceUploadProvider | null — real but harmless: the service lazily built an identical
   provider from SupabaseService. Introduced 592fc39e (#397). Fixed for consistency.
3. src/ai/gateway/ai-approval.service.ts:105 CapabilityMaterializerRegistry | null — REAL. Approving an AI draft
   (draft.coach_message, coach_wearable_message, assign_workout, assign_meal_plan, send_notification, create/edit_workout_plan)
   flipped status to 'approved' and never ran the materialiser (PRODUCT-1 recreated: the message was never sent, the plan
   never assigned). Introduced dec5916c (#293, 2026-05-27). Production: AiActionDraft rows = 0.
4. src/throttler/login-throttle-reset.service.ts:90 ThrottlerStorage | undefined — NOT a bug: @InjectThrottlerStorage() is an
   explicit token (Inject(getStorageToken())). Proven by a DI test (passes on main) and already by
   test/login-account-lock.spec.ts:362.
Interface-typed @Optional seams (emit Object by design, documented fallbacks, no provider exists): OauthStateService store,
StravaWebhookController env, ProviderHttpClient deps, PurchaseFanoutService alertHook (no DripAlertDispatchHook provider exists
anywhere). Not changed.

## PR 2 (b#895, decision 133-11)
Coachless flagged completion -> one in-app coach_alert Notification to the house set's coach_id (the house account), body
"A client without a coach finished their consultation and was flagged for extra care.", payload adds coachless: true.
Coached paths unchanged (coach-on-house-set still alerts the coach only). House account still cannot read the intake
(canCoachRead needs a coach on the client). In-app only; no Notification trigger exists; mobile coach_alert has no actionScreen.
Production: ClinicProgramSet = 0, so nothing changes until the house seed runs.

## PR 1 contents
- src: @Inject(MessagesSafetyService), @Inject(VoiceUploadProvider), @Inject(CapabilityMaterializerRegistry).
- test/nest-tokens-134-wiring.spec.ts: DI-built MessagingService (block enforced, client unread 0 when coach blocked),
  DI-built AiApprovalService (registry injected), LoginThrottleResetService storage, whole AppModule compile (both services get
  their deps), src-wide static scan (fails on main with exactly the 3 offenders above; passes here).
- .github/workflows/ci.yml mwb-3-live-tests: new step running test/roman/roman-context-null-lists.live.spec.ts and
  test/roman/roman-coach-pool-b31d1.live.spec.ts.

## Verdicts (seen on GitHub, 20:5x PDT)
- b#893 @ bc476b48e2be6044993c33df6e7a6c65520d2c24: Sol LN-SOL-C2-134 APPROVE (B none, U none); Opus LN-OPUS-C-134 APPROVE
  (no B, no U; C: a coach-message draft to a client who blocked the coach now fails as 500 "materialisation failed", draft
  left pending, instead of a clear blocked message — edge, deferred). Board: DUAL APPROVED.
- b#895 @ 7d0a1555f8ad4fd4ad6ac4b6f9c7e8a293c2cd3d: Sol LN-SOL-C2-134 APPROVE (B none, U none); Opus LN-OPUS-C-134 APPROVE
  (no B, no U; C: the house account sees a client_id it cannot open — the Proposed item below). Board: DUAL APPROVED.

## HANDOFF
- PRs: growth-project-backend#893 (B31 pattern: MessagingService block service + AiApprovalService registry tokens, VoiceUploadProvider
  token, wiring spec, Roman live specs in mwb-3-live-tests) @ bc476b48e2be6044993c33df6e7a6c65520d2c24; growth-project-backend#895
  (decision 133-11: coachless flagged screening -> in-app alert to the house account) @ 7d0a1555f8ad4fd4ad6ac4b6f9c7e8a293c2cd3d.
  Both CI fully green, CLEAN, dual APPROVE at these heads. B=0 U=0. No files shared; they can merge in any order.
- Needs operator (2):
  1. Merge both and deploy backend (no migrations, no flags). After deploy: blocks are enforced (UserBlock = 0 today) and AI
     draft approvals materialise (AiActionDraft = 0 today); the coachless alert only fires once the house set is seeded.
  2. Proposed (needs operator): owner read access to a coachless client's flagged intake. Default: keep closed (T4 tenancy change,
     needs its own decision). Today the house alert says only that a flag exists.
- Cs carried (edge, deferred to 10k clients): blocked-client coach-message draft returns 500 not a clear BLOCKED message (Opus, b#893).
- Not fixed on purpose: interface-typed @Optional test seams (OauthStateService, StravaWebhookController, ProviderHttpClient,
  PurchaseFanoutService alertHook, which has no provider anywhere); LoginThrottleResetService (already wired, proven).
- Process note: the first b#893 head was a merge commit and Danger failed (a "[134]" title is never Conventional Commits, so the
  latest commit subject must be). Builders: keep a conventional commit as the PR head.
- Worktree /home/user/workspace/wt/NEST-TOKENS-134-backend on agent134/coachless-alert-134, clean. Nothing unpushed. No claims held.
- Not seen on a device. Mobile untouched. Local evidence: /tmp/nt134/wiring.txt, /tmp/nt134/failing-first.txt, /tmp/nt134/onb.txt.
