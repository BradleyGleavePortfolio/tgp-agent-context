**[133] B31, B32 — Roman knows the client.** T4: health data and AI. Plan points: not mapped yet, because the combined plan has not landed.

## What the owner saw
The owner's Roman turn at 2026-10-08 21:48:14Z came from a coachless student on surface `client`. Roman said it could not see the client's details. The production ledger (`AiRequestAudit`, capability `roman.chat`) has one row for that turn: `context_unavailable=true` and `prompt_token_estimate=2837`, with no `client_data` block. It is the only Roman turn ever recorded in production.

## WHY / WHEN / WHO
**Root cause.** `RomanService` never receives its context builder in the running app.

```ts
@Optional()
private readonly clientContext: RomanClientContextService | null = null,
```

- The parameter has no `@Inject` token. With `strictNullChecks`, tsc writes a `T | null` parameter as `Object` in `design:paramtypes`.
- I checked this in a tsc build of `tsconfig.build.json`. `dist/roman/roman.service.js` has `design:paramtypes = [PrismaService, AiEgressService, Object, Object, Object, Object, Object, Object]`.
- Nest therefore looks up a provider named `Object` and finds none. Because the parameter is `@Optional`, it falls back to its `null` default.
- `loadTurnBundle` then returns null (it logs `roman.context_builder_missing`). Every grounded client turn, coached or coachless, runs in the explicit degraded mode.
- The unit tests build `RomanService` by hand, so they never went through DI. The `audit` parameter (content-free crisis-route audit rows) has the same defect.

**When / who.** Introduced in fabc2268 (2026-10-03, "wire grounding and guardrails into live Roman turns (split C1 of #651)"), merged in #668.

**The operator's prime suspect (NULL `UserProfile.preferred_snacks`) does not reproduce.** Seen in a test:
- On a real Postgres 18, and again through pgbouncer in transaction mode with `?pgbouncer=true`, Prisma 6.19.3 decodes a NULL `TEXT[]` as `[]` and the bundle builds.
- I checked the production row for the 21:48 client by SELECT, shape only: `preferred_snacks` NULL, `food_preferences` NULL, everything else ordinary.
- Column names and types for the 22 tables Roman reads are hash-identical to `schema.prisma`. So are all 317 enum labels.
- Postgres logged no error at 21:48.

## Changes (from the code and seen in tests)
1. **`roman.service.ts`.** Added explicit `@Inject(RomanClientContextService)` and `@Inject(AuditService)`. `AuditService.write` never throws, so crisis replies are unaffected.
2. **Coachless plan side (`roman-coach-scope.ts`, `planSide`).**
   - A coachless student's plan and targets are read from their own tenant: `assigned_by_coach_id` / `MacroTarget.coach_id` = the client id. This is the tenant CONSULT-ALL-BE-133 writes the house-program clone into.
   - A coachless `MacroTarget` is labelled `onboarding_calculated`, never `coach_set`.
   - Coached reads are unchanged: coach side only, never the client's own tenant.
   - Coach-only facts (thread, guidelines, bookings, meal plan) still need a live coach.
   - The timeline reader (Roman tools) uses the same plan side.
   - Production has 0 such rows today (SELECT), so this part does nothing until CONSULT-ALL-BE-133 merges.
3. **No migration.** NULL lists are proven safe to read. Both writers that can leave NULL (`profile.service.ts:234` create, `onboarding.service.ts:924` upsert) are only read through Prisma (NULL becomes `[]`) or with `?? []`. No raw SQL reads the column.

## Tests
- **`test/roman/roman-context-wiring-b31.spec.ts`** (default suite).
  - Builds `RomanService` through Nest DI and checks the builder and audit are injected and a grounded turn loads its bundle.
  - Adds a guard over every `RomanModule` provider: an optional parameter that DI would silently drop fails the test. The three known pool gaps are named (see below).
  - Adds plan-side unit cases.
  - **Fails 3 of 7 on main** (clientContext is `null`) and passes with the fix.
- **`test/roman/roman-context-null-lists.live.spec.ts`** (real Postgres, gated on `MWB3_TEST_DATABASE_URL`, run locally: 5 of 5 pass). The cases:
  - A coachless student with NULL `preferred_snacks`, `dietary_restrictions` and `equipment_access` gets client_data with name, targets, food log and check-ins.
  - A DI-built `RomanService` turn gets the bundle.
  - Own-tenant plan and targets reach Roman.
  - A coached client never reads own-tenant rows.
- **Existing specs re-run, all passing:** r11-timeline-reader (17), roman-client-context (20), roman-context-core (14), roman-context-a2-fixes (14), roman-context-round2 (5), roman.service (51), r11-seams (22), roman-coachless-post-check-132 (7), roman-launch-hardening (60), roman-client-context-injection (4).
- **Checks:** `tsc --noEmit` is clean. eslint shows no new findings.

## Not in this PR (needs operator)
1. **B31-D1, the coach AI credit pool (B-668-1), is not wired in production either.** The affected params are `RomanService` param 5, `RomanBackgroundSpendService` param 1 and `RomanCoachMethodAugmenter` param 1, all `CoachAIBudgetService | null` with no token.
   - Wiring them starts refusing coached turns when a coach pool is empty.
   - It also turns on the coach-method playbook block, which needs the pool to resolve the head coach.
   - That needs an operator decision. Default: wire it in a separate PR after checking pool balances.
2. **The same no-token pattern exists outside lane 133:**
   - `src/messaging/messaging.service.ts:146` (`MessagesSafetyService | null`) and `:158` (`VoiceUploadProvider | null`)
   - `src/ai/gateway/ai-approval.service.ts:105` (`CapabilityMaterializerRegistry | null`)
   - `src/throttler/login-throttle-reset.service.ts:90` (`ThrottlerStorage | undefined`)

   These need a check by their owners.
3. **NEED `.github/workflows/ci.yml`:** add `test/roman/roman-context-null-lists.live.spec.ts` to the mwb-3-live-tests job, so the live proof runs in CI. That file is not in lane 133.

## B32 (from the code, not seen on a device)
The prototype 68 sheet ("Before Roman answers") does not exist in mobile: the string appears nowhere in `src`.

Today a client without consent who sends a message gets a 403 `ai_consent_required` before the turn is stored, so nothing is sent to Anthropic. The chat then shows an inline refusal row whose action leads to the settings consent screen. The sheet itself belongs to ROMAN-ROOM-133 (prototype 67-74, `src/screens/roman/**`, `src/components/roman/**`), and I have asked it in my report. This PR does not touch mobile.

npm audit: if the handlebars advisory job is still red, it is not caused by this PR.

agent 133
