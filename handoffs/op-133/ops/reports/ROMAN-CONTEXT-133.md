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
