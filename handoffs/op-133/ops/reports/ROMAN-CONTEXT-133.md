# ROMAN-CONTEXT-133 report (agent 133, lane 133) — B31, B32
Status 17:5x PDT: DONE. b#891 READY at 2d48f99c, CI green.
Worktree /home/user/workspace/wt/ROMAN-CONTEXT-133-backend, branch agent133/roman-context-133 off origin/main 051583ad.

## B31 findings
1. Prime suspect (NULL UserProfile.preferred_snacks) does NOT reproduce. Real Postgres 18 (local) and through pgbouncer
   transaction mode + ?pgbouncer=true: Prisma 6.19.3 decodes a NULL TEXT[] as []; the bundle builds. Production row for the
   21:48:14Z client checked by SELECT (shape only): snacks NULL, food_preferences NULL, everything else ordinary; schema columns
   (22 tables Roman reads) and all 317 enum labels hash-identical to schema.prisma. Postgres logged no error at 21:48.
2. REAL CAUSE: RomanService never receives RomanClientContextService in production. `@Optional() clientContext:
   RomanClientContextService | null = null` has no @Inject token; with strictNullChecks tsc emits `T | null` as `Object` in
   design:paramtypes (verified in a tsc build of tsconfig.build.json: dist/roman/roman.service.js paramtypes =
   [PrismaService, AiEgressService, Object x6]). Nest looks up `Object`, finds nothing, the optional param falls back to
   null, loadTurnBundle logs roman.context_builder_missing and EVERY grounded client turn (coached or coachless) runs in
   degraded mode. Only one Roman turn exists in production (the owner's), so nobody saw it before. Unit tests build
   RomanService by hand, so they never saw it either. Same defect: `audit` (crisis-route audit rows never written).
   Failing-first: test/roman/roman-context-wiring-b31.spec.ts fails 3/7 on main (clientContext null), passes with the fix.
3. Fix: explicit @Inject(RomanClientContextService) and @Inject(AuditService). Plus coachless plan side: a coachless
   student's plan/targets come from their own tenant (assigned_by_coach_id / MacroTarget.coach_id = client id, the tenant
   CONSULT-ALL-BE-133 writes the house clone into); coached reads unchanged. Timeline reader (tools) uses the same side.

## PR
growth-project-backend#891 — first head 7e4a898a failed only R75 (3 `as unknown as` casts in my tests); fixed with Reflect.get in a second push, head 2d48f99cebb18680ac45864fe910afcc5fa002b5 (~449+/13-, 6 files). CI green; READY posted (issuecomment-6072018441).

## Writers / readers of NULL lists (entry item 2)
Writers that can leave preferred_snacks NULL: src/profile/profile.service.ts:234 (create, `preferred_snacks: data.preferred_snacks`
undefined when absent) and src/onboarding/onboarding.service.ts:924 (upsert without the field). Readers: all via Prisma (NULL -> [])
or `?? []` (ai/context/client-context.service.ts:153, ai/client-ai-context.service.ts:289, ai/gateway/private-context.service.ts:97,
ai/ai.service.ts:362). No raw SQL reader. No fix needed; no migration (justified in the PR). Production: 1 profile, snacks NULL.

## ASK ROMAN-ROOM-133 (B32, prototype 68)
From the code (RO-mobile df7b8ae9): no "Before Roman answers" string anywhere in mobile src. A client without consent who sends
gets 403 ai_consent_required BEFORE the turn is stored (nothing sent: matches "Nothing is sent to Anthropic until Allow"), then the
inline refusal row (RomanChatScreen.tsx:190-211, aiRefusalCopy) with an action to settings/RomanAiConsentScreen (toggle screen, not
the prototype sheet). Prototype 68 wants a sheet BEFORE the first answer: title "Before Roman answers", the bulleted list of what is
sent, Allow + Not now (same size), Privacy Policy tappable, consent_version roman-ai-v1. That is in ROMAN-ROOM-133's 67-74 scope
(src/screens/roman/**, src/components/roman/**). Suggested: show it on RomanChatScreen when consent status (api.getStatus, as
RomanAiConsentScreen.tsx:245 uses) says not granted, before the composer sends. I did not touch mobile.

## Proposed (needs operator)
- B31-D1 coach AI credit pool never wired in production (RomanService param 5, RomanBackgroundSpendService param 1,
  RomanCoachMethodAugmenter param 1: `CoachAIBudgetService | null`, no token -> null). Wiring starts refusing coached turns on an
  empty pool and turns on the coach-method playbook block. Default: separate PR after checking pool balances.
- Same pattern outside lane 133 (owners must check): src/messaging/messaging.service.ts:146 (MessagesSafetyService | null),
  :158 (VoiceUploadProvider | null); src/ai/gateway/ai-approval.service.ts:105 (CapabilityMaterializerRegistry | null);
  src/throttler/login-throttle-reset.service.ts:90 (ThrottlerStorage | undefined).
- NEED .github/workflows/ci.yml — add test/roman/roman-context-null-lists.live.spec.ts to the mwb-3-live-tests job — ROMAN-CONTEXT-133.

## Local evidence
- Postgres 18 installed in the sandbox (apt), DB rc133, `prisma db push`; pgbouncer 1.25 transaction mode on 127.0.0.1:6433.
- Live spec: `MWB3_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rc133 npx jest test/roman/roman-context-null-lists.live.spec.ts --runInBand` -> 5/5 (also 2/2 earlier via pgbouncer).
- Failing-first output on main: /tmp/rc133/failing-first.txt (3 failed, 4 passed; clientContext Received: null).
- tsc build metadata proof: /tmp/rc133/dist/roman/roman.service.js:1059 (design:paramtypes PrismaService, AiEgressService, Object x6).

## HANDOFF
- PR: growth-project-backend#891 @ 2d48f99cebb18680ac45864fe910afcc5fa002b5, READY posted, CI green, mergeable. T4 (health data + AI):
  lens T4 scan should cover planSide tenancy (roman-coach-scope.ts, roman-client-context.service.ts, roman-timeline.reader.ts).
- B31: root cause = missing Nest DI token (not the NULL list). Fixed. After merge + deploy, the first grounded turn's ledger row
  should show context_unavailable=false and a context_hash (SELECT on AiRequestAudit, capability roman.chat).
- B32: not fixed here (mobile, ROMAN-ROOM-133 scope); ASK written above. Operator: relay to ROMAN-ROOM-133.
- Needs operator (4): B31-D1 pool wiring decision; same no-token pattern in messaging/ai-approval/throttler (other owners);
  NEED ci.yml live-spec step; B32 relay to ROMAN-ROOM-133.
- Side observation: Postgres logged `relation "Package" does not exist` at 21:46:35Z (one query, not Roman); unexplained, not traced.

## B31-D1 (owner decision 133-13, 17:58: wire the coach AI credit pool) — growth-project-backend#892
- Branch agent133/roman-pool-133 stacked on b#891 head 2d48f99c, base main, "depends on b#891". Own change: commit 1519f9f1913b51d3b9c0c540e72fe99097915cd2,
  5 files +189/-12 (diff vs main incl. b#891: 9 files +628/-15).
- Change: explicit @Inject(CoachAIBudgetService) on RomanService (budget), RomanBackgroundSpendService (budget), RomanCoachMethodAugmenter (budget).
  Nothing else: pool rules, copy, amounts and playbook block exactly as the code defines them.
- Never-initialised pool: NOT refused. Existing CoachAIBudgetService.getOrCreateCurrentPeriod creates the documented default period
  (base_actual_cents = resolveMaxActualCents() = COACH_AI_MAX_ACTUAL_CENTS_DEFAULT 4000, displayed 12500; packs 0; used 0). No new grant, no Stripe.
- Production SELECT (rpyfdsgxxltzutgqeouk, 18:0x PDT): 1 coach with active clients (1 client), 0 open sub-coach assignments; its pool row exists
  (period 2026-10-01..2026-11-01, base 4000, packs 0, used 0). Other 2 live coaches: no row -> default on first turn. Exhausted 0; stale periods 0.
  => 0 coaches would be refused today.
- WHY/WHEN/WHO (git log -S): RomanService budget dabed738 (2026-10-05, B-ROMAN-BFIX-121 r1); background spend 3e0954aa (2026-10-06, R11-00);
  augmenter 085e9cb2 (2026-10-07, R11-P4).
- Tests: wiring spec KNOWN_UNWIRED now empty + DI case for all three; fails 2/8 without the src change (/tmp/rc133/pool-failing-first.txt), 8/8 with it.
  Live test/roman/roman-coach-pool-b31d1.live.spec.ts 6/6 on local Postgres. Re-run green: roman-c2-pool 4, r11-coach-method 11, r11-seams 22,
  roman.controller 17, roman.service 51, ai-credits-exact-metering 15, r11-playbook-builder 16, roman-notes.writer 8, roman-launch-hardening 60. tsc clean.
- NEED .github/workflows/ci.yml — add both live specs to mwb-3-live-tests — ROMAN-CONTEXT-133.
- b#892 READY posted at 1519f9f1 (issuecomment-6072303800); CI green, merge state CLEAN. b#891 is now MERGED (seen 18:1x), so b#892 diff = own 5 files.

## HANDOFF (updated after decision 133-13)
- b#891 MERGED @ 2d48f99c (B31 context wiring + coachless plan side).
- b#892 READY @ 1519f9f1913b51d3b9c0c540e72fe99097915cd2 (B31-D1 pool wiring), CI green, CLEAN. 0 coaches refused today (production SELECT).
  After deploy: a coached client's Roman turn should create/debit CoachAIBudget (actual_used_micro_cents rises) and ledger context_unavailable=false.
- Needs operator (3): out-of-lane same no-token pattern (messaging safety/voice, ai-approval materialisers, throttler storage);
  NEED ci.yml for both live specs; B32 relay to ROMAN-ROOM-133 (prototype 68 sheet, mobile).
- Not seen on a device. Mobile untouched.

## HANDOFF (final, stop-and-drain 18:53)
- b#891 MERGED @ 2d48f99cebb18680ac45864fe910afcc5fa002b5 (B31: Roman client context wiring + coachless plan side).
- b#892 MERGED @ 1519f9f1913b51d3b9c0c540e72fe99097915cd2 (B31-D1: coach AI credit pool wiring). Lenses at that head: Sol (LN-SOL-B-133) APPROVE B: none U: none;
  Opus (LN-OPUS-A-133) APPROVE. No open PRs from this job. No new work started.
- Needs operator (3, carried): same no-token DI pattern out of lane (src/messaging/messaging.service.ts:146,:158; src/ai/gateway/ai-approval.service.ts:105;
  src/throttler/login-throttle-reset.service.ts:90); NEED .github/workflows/ci.yml to run both live specs in mwb-3-live-tests; B32 (prototype 68 sheet,
  mobile) relay to ROMAN-ROOM-133.
- After deploy, check (SELECT): AiRequestAudit roman.chat rows show context_unavailable=false; CoachAIBudget actual_used_micro_cents rises for a coached turn.
- Not seen on a device. Mobile untouched.

## HANDOFF (safe stop 18:57)
- PRs: b#891 MERGED @ 2d48f99cebb18680ac45864fe910afcc5fa002b5; b#892 MERGED @ 1519f9f1913b51d3b9c0c540e72fe99097915cd2. No open PRs, no claims held, nothing unpushed.
- Unfinished: none in this job. Carried items (not started, need owners): out-of-lane no-token DI pattern (messaging safety/voice, ai-approval
  materialisers, throttler storage); ci.yml step for both live specs; B32 prototype-68 sheet (ROMAN-ROOM-133, mobile).
- Next agent first: after the next backend deploy, SELECT AiRequestAudit (capability roman.chat) for context_unavailable=false and CoachAIBudget
  actual_used_micro_cents rising on a coached turn; then take the messaging.service.ts:146 MessagesSafetyService wiring (highest risk).
