# AUDIT — PR-7 AssignableAssetResolver registry + per-type resolvers (PR #316, round 2)

VERDICT: CLEAN

Branch: `pr7/assignable-asset-resolver`
Head: `ed596758001dcae50b999884af62120664f47923`
Repo: `BradleyGleavePortfolio/growth-project-backend`

Typecheck (nest build): PASS (`npx nest build`, exit=0)
Lint (eslint, PR files): PASS (`npx eslint src/packages/asset-resolvers/**/*.ts test/assignable-asset-resolver-*.spec.ts`, exit=0)
Prisma: PASS (`npx prisma validate` → "The schema at prisma/schema.prisma is valid"; `npx prisma generate` → "Generated Prisma Client (v6.19.3)")
Tests:
- Resolver suites: 5 suites passed, 38 tests passed (`npx jest --testPathPatterns='assignable-asset-resolver'`)
- Messaging suites (sendAsCoach is the downstream of P2a): 3 suites passed, 39 tests passed
- Meal-plan / AI-execution adjacent suites: 3 suites passed, 63 tests passed
- Net: zero regressions touching code in this PR or in its downstream `sendAsCoach` / `DailyMealPlanAssignment` write paths.

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking)
- `meal-plan.resolver.ts:165-166`: when P2002 fires but the post-P2002 re-read returns NULL (DELETE races INSERT), the resolver logs `error` and then falls through to `throw err` (the original P2002). Behaviour is fine — the throw is what makes the executor mark the drop failed — but a wrapped typed error would surface the "vanishingly unlikely" path more clearly in ops. Non-blocking.
- `auto-message.resolver.ts:84-88`: when `sendAsCoach` returns a row without `id`, the resolver throws a bare `new Error(...)`. The other resolvers throw typed error subclasses; aligning here would help downstream `failure_reason` mapping. Non-blocking — `sendAsCoach` always returns an id in the current Prisma signature.
- `assignable-asset-resolver.registry.ts:51-55`: the dedup warning compares `r.assetType` only, but `WorkoutAssetResolver.canHandle` covers two strings (`workout_plan` and `workout_program`) and `MediaAssetResolver.canHandle` covers two (`pdf` and `video`). A second resolver claiming `workout_program` would not trip the warning. Not exploitable now; worth tightening if/when external plugins land. Non-blocking.

## Verification of PR claims

### Claim 1 — P1 (meal_plan TOCTOU): additive migration adds `drip_drop_id` + `@unique` to `DailyMealPlanAssignment`, race recovery mirrors media resolver, concurrency test asserts exactly-one row.

**Verified true.**

- Migration file `prisma/migrations/20261203000000_pr7_meal_plan_drip_drop_unique/migration.sql:21-25` contains exactly two statements: `ALTER TABLE "DailyMealPlanAssignment" ADD COLUMN "drip_drop_id" TEXT;` followed by `CREATE UNIQUE INDEX "DailyMealPlanAssignment_drip_drop_id_key" ON "DailyMealPlanAssignment"("drip_drop_id");`. **Additive-only** — no DROP, no RENAME, no type change, no DEFAULT.
- **Safety of the UNIQUE on an existing table with NULL-only rows:** confirmed. The new column is added nullable with no DEFAULT (so all existing rows get NULL on the metadata-only ALTER). Postgres treats NULLs as DISTINCT in a `UNIQUE` index by default — the constraint is defined `ON "DailyMealPlanAssignment"("drip_drop_id")` (single column, no `NULLS NOT DISTINCT`), so any number of existing NULL rows coexist without violation. No backfill required.
- Schema mirror (`prisma/schema.prisma:2190-2197`): `drip_drop_id String? @unique` — single-column, nullable, matches the SQL.
- `prisma validate` passes; `prisma generate` succeeds.
- Race fix in `src/packages/asset-resolvers/meal-plan.resolver.ts:138-169`: optimistic `create()` with `drip_drop_id`, `catch` filters on `Prisma.PrismaClientKnownRequestError` with code `P2002`, then `findUnique({ where: { drip_drop_id: dropId }})` returns the winner's id. Pattern is identical in shape to `MediaAssetResolver` at `media-asset.resolver.ts:82-114` and the existing `AssignWorkoutMaterializer` P2002 recovery cited in the comment.
- **UNIQUE is on the right column** — `drip_drop_id` only. Two concurrent same-drop calls insert with the same `drip_drop_id` value, the second collides on the unique index, and is re-read by drop id. Re-read returns the winner's row (the one whose INSERT committed).
- **`tx` is honoured throughout.** `meal-plan.resolver.ts:69` sets `db = input.tx ?? this.prisma`. Every read + write in both `insertDripAssignment` and `assertPlanOwnedByTenant` uses `db`. The test at `test/assignable-asset-resolver-meal-plan.spec.ts:237-262` explicitly asserts that when `tx` is provided, **no** `findFirst` / `findUnique` / `create` call hits the prisma stub — only the tx stub. Verified.
- **Concurrency test genuinely exercises two parallel calls:** `test/assignable-asset-resolver-meal-plan.spec.ts:165-218` runs `Promise.all([materialise, materialise])` against a shared "DB" stub that grants exactly one `inserted` slot. The loser's `create()` throws P2002; both calls return the SAME `materialisedRef = winnerId`. The assertion `expect(both[0].materialisedRef).toBe(winnerId); expect(both[1].materialisedRef).toBe(winnerId)` is precisely the property the audit asked to prove.

### Claim 2 — P2a (sub-coach auto_message mis-attribution): pass `actingCoachId` (raw caller) to `sendAsCoach`, not `tenantCoachId`. Workout/meal still pass head coach id deliberately.

**Verified true.**

- `auto-message.resolver.ts:78-82`: `this.messaging.sendAsCoach(acting.actingCoachId, input.clientId, { body })`. `actingCoachId` is the raw caller per `sub-coach-scope.helper.ts:23-26,49-54`.
- Phase-11 split inside `messaging.service.ts:396-442`: `sendAsCoach(coachId, ...)` calls `assertClientOfCoach(coachId, ...)`. For a sub-coach caller, `assertClientOfCoach` returns `{ id, coach_id: headCoachId }` (lines 287-313). Then `threadCoachId = client.coach_id ?? coachId` (line 430) pins the thread row to the **head** coach, while `sender_id: coachId` (line 435) writes the **acting (sub-)coach** id. Net: passing `acting.actingCoachId` is exactly what the Phase-11 split expects, and `sender_id` lands on the sub-coach — matching the spec assertion.
- Workout/meal still pass `tenantCoachId` (head coach):
  - `workout.resolver.ts:76`: `this.workoutBuilder.assignPlan(acting.tenantCoachId, ...)` — `WorkoutBuilderService.assignPlan` requires strict `plan.coach_id === coachId`, so the head coach id is the correct input here.
  - `meal-plan.resolver.ts:80,109,143`: `assigned_by_coach_id` and the `assertPlanOwnedByTenant` ownership query both use `tenantCoachId`. Same reasoning — tenant column lines up with `DailyMealPlan.coach_id`.
- The asymmetric handling is documented in `auto-message.resolver.ts:23-31`.
- Test `test/assignable-asset-resolver-auto-message.spec.ts:29-52` explicitly asserts `call[0]` is `'sub-1'`, NOT `'head-1'`. Inverse test at `:54-65` confirms head-coach pass-through unchanged.

### Claim 3 — P2b (idempotency contract): interface doc amended to AT-LEAST-ONCE baseline, auto_message documented exception, PR-10 must gate retries on `ScheduledDrop.materialised_ref IS NULL`.

**Verified true.**

- Interface doc `assignable-asset-resolver.interface.ts:82-108` carries the amended idempotency contract: explicit "AT-LEAST-ONCE" baseline; per-type exactly-once guarantees enumerated for workout / meal_plan / pdf+video; `auto_message` called out as the exception; explicit PR-10 instruction to "gate retries on `ScheduledDrop.materialised_ref IS NULL`".
- Resolver-level comment in `auto-message.resolver.ts:39-44` repeats the same constraint at the call site so PR-10 author can't miss it: "PR-10's drip executor MUST gate retries on `ScheduledDrop.materialised_ref` being NULL so a successful send is never replayed."
- **Does anything in THIS PR rely on auto_message being exactly-once?** No. The resolver is the only auto_message touchpoint and its result is returned to the caller (PR-9/PR-10). There is no in-PR retry, no in-PR replay, no in-PR webhook. The at-least-once admission is a forward constraint on PR-10, not a live bug in this PR.

### Re-confirmation of round-1 positives

- **Cross-tenant IDOR gate (media)** — `media-asset.resolver.ts:60-76` still loads the asset, fails-closed if archived/missing, AND refuses on `asset.coach_id !== acting.tenantCoachId` returning the same not-found error (no existence leak). Logged at warn level for ops. Intact.
- **ClientAssetGrant P2002 race-recovery** — `media-asset.resolver.ts:82-114` still optimistic-creates and re-reads via the `client_id_media_asset_id` compound unique on P2002. Intact.
- **MediaAssetResolver `tx`-honoring** — `media-asset.resolver.ts:56`: `db = input.tx ?? this.prisma`; every read/write uses `db`. Test `test/assignable-asset-resolver-media.spec.ts` covers the tx-honor case. Intact.
- **No nested transaction** — none of the four resolvers wrap their work in `prisma.$transaction(...)`. Verified by grep across `src/packages/asset-resolvers/*.ts` — zero occurrences.
- **No DI cycle** — `AssignableAssetResolversModule` is `@Global` and imports only `MessagingModule` + `WorkoutBuilderModule` (`asset-resolvers.module.ts:45-47`); not imported via `PackagesModule`. Wired once in `src/app.module.ts:52,244`. Build succeeds (Nest cycle detector would fail at boot otherwise).

## Summary

The three round-1 findings (P1 meal_plan TOCTOU, P2a sub-coach mis-attribution, P2b idempotency-contract drift) are all addressed correctly and minimally. The migration is genuinely additive and safe against the existing NULL-filled column; the unique race guard is on the right column with proper P2002 recovery and a meaningful concurrency test; the auto_message sender id now lands on the sub-coach per the Phase-11 split; and the at-least-once contract is documented at both the interface and the auto_message resolver. No P0/P1/P2 issues introduced. Three P3 polish notes are non-blocking.

VERDICT: CLEAN
