# WAVE-1 EFF — Build Report (EFF-1 / EFF-2 / EFF-3)

**Builder:** Dynasia G `<dynasia@trygrowthproject.com>` (Opus). Auditor: GPT-5.5 re-checks at the final SHA below.
**Repo:** `growth-project-backend` · base `origin/main` @ `9c191be` · branch `issues/coach-effectiveness-fixes`.
**PR:** #334 — "Wave1 EFF: sub-coach roster scoping + batch predictions (N+1) + /coach/my-effectiveness" → `main`.
**Final branch SHA:** `84918e8d2a002541faea4d8e3a1fc8b1979c072e`.

---

## Scope confirmation
- **PRIMARY edited:** `src/coach/coach-effectiveness.service.ts`.
- **Also edited (owned):** `src/coach/coach.module.ts` (wiring), **new** `src/coach/coach-effectiveness.controller.ts` (EFF-2 route), tests `test/coach-effectiveness.service.spec.ts` + **new** `test/coach-my-effectiveness.controller.spec.ts`.
- **NOT edited (confirmed):** `command-center/*` (command-center.* / ltv-metrics.*), `src/admin/admin.controller.ts`, `src/sub-coach/sub-coach-scope.service.ts` (imported/called only), `prisma/schema.prisma` (no schema/migration changes).

---

## EFF-3 — sub-coach roster scoping (scope-service wiring)
The naive `coach_id = coachId` roster filter (`coach-effectiveness.service.ts` ~:207–218) is replaced by the authorized-roster resolution:

```ts
const clientIds = await this.subCoachScope.getAuthorizedClientIds(coachId);
```

- **Head coach** → full owned roster (identical to prior behaviour).
- **Sub-coach** → only their assigned clients (open `SubCoachAssignment` rows), so sub-coaches now score against THEIR roster instead of always returning `empty_roster`/0/"developing".

Every roster-derived query was rescoped to the resolved client-id set (not just the top-level roster read):
- Roster `user.findMany` → `where: { id: { in: clientIds }, role:'student', deleted_at:null }`.
- `completionComponent(clientIds, now)` → enrolled `user.count({ id: { in } })`; completed `clientOutcome.count({ user_id: { in } })`.
- `engagementComponent(clientIds, now)` → `coachMessage.groupBy({ where:{ client_id:{ in } } })`. **Rationale:** `CoachMessage.coach_id` holds the HEAD coach id even for messages a sub-coach sent (`sender_id` captures the actual sender), so filtering on `coach_id` would mis-attribute a sub-coach's engagement; filtering on the resolved client roster scopes correctly for both head and sub.

**Wiring:** `SubCoachScopeService` injected into `CoachEffectivenessService` constructor; `SubCoachModule` imported explicitly in `CoachModule` (the module the builder owns). `SubCoachModule` is `@Global`, so the provider is reachable; the explicit import documents the dependency at the owned module. `sub-coach-scope.service.ts` itself was not touched.

## EFF-1 — batch predictions (N+1, 50-Failures #21) + equivalence proof
The old `riskDeltaComponent` (~:307–326) ran **2 sequential `ptmPrediction.findFirst` per eligible client** (2N round-trips inside a loop). Refactored to **one `findMany`** over all eligible client ids:

```ts
const predictions = await this.prisma.ptmPrediction.findMany({
  where: { user_id: { in: eligibleIds }, computed_at: { gte: earliestCreatedAt } },
  select: { user_id: true, risk_score: true, computed_at: true },
  orderBy: { computed_at: 'asc' },
});
```

Rows grouped per user in memory; per-client selection reproduced exactly:
- `earliest` = first row with `computed_at >= client.created_at` (ascending lower-bound only) — matches old `orderBy asc` findFirst.
- `latestInWindow` = last row within `[client.created_at, client.created_at + 60d]` — matches old `orderBy desc` findFirst (ascending scan keeps the last in-window row).

**Query count:** `2N → 1` (for the A-fixture: 10 → 1).

**Equivalence proof (test):** `batched result reproduces the prior per-client findFirst choice exactly` recomputes the expected per-client deltas by calling the OLD `findFirst` semantics directly on the same fixture data (A/B/C), then asserts the batched path's recorded `risk_delta.observed` (to 6 dp) and `sample_size` match. A second test asserts `ptmPrediction.findMany` called exactly once and `findFirst` not called by the service path.

## EFF-2 — GET /coach/my-effectiveness (route + guard)
New controller `src/coach/coach-effectiveness.controller.ts` (coach-effectiveness-owned; NOT admin/command-center/ltv-metrics):

```ts
@Controller('coach')
@UseGuards(CoachGuard)
@Roles('coach')
class CoachEffectivenessController {
  @Get('my-effectiveness')
  myEffectiveness(@Request() req) {
    return getLatest(req.user.id) ?? score(req.user.id); // scoped to caller
  }
}
```

- **Scoped to `req.user.id`** — no path param or query lets a caller name another coach → **no cross-coach leak**.
- **Role-guarded:** `@Roles('coach')` (coach or owner) + `CoachGuard`. `JwtAuthGuard` + `RolesGuard` are global `APP_GUARD`s; this satisfies the repo-wide `roles-enforced.spec.ts` meta-test.
- **Reuses** existing `CoachEffectivenessService.getLatest` / `score` — no algorithm duplicated. Computes a fresh score on demand when none is persisted yet (e.g. freshly-promoted coach before the nightly scheduler runs).

## Tests
- **EFF-3:** sub-coach scores against assigned roster (`risk_delta.sample_size` = 2 for a 2-client assignment, no `empty_roster`); head vs sub on same team produce different rosters (sample_size 5 vs 1); sub with no assignments → score 0.
- **EFF-1:** exactly 1 `findMany` + 0 `findFirst` in service path; batched observed/sample_size equal the prior findFirst result across A/B/C fixtures.
- **EFF-2:** returns caller's score; fresh-computes when absent; role guard rejects `student` (403) and allows `coach`/`owner`; never queries a peer's id.
- Existing effectiveness + scheduler tests kept green.

## Verify (actual counts)
- `npm ci` → exit 0 (184 packages, 0 vulnerabilities).
- `npx tsc --noEmit` → **0 errors**.
- `npm run lint` (eslint on touched files) → **0 errors** (no new errors).
- `npx jest` (full suite) → **306 suites passed / 306 total**; **3687 passed, 20 skipped, 5 todo, 0 failed**, 6 snapshots passed.
- Effectiveness-spec subset (`coach-effectiveness*` + `coach-my-effectiveness*`) → 18 passed (service+scheduler+controller); with `roles-enforced` → 20 passed.

## Source citations
- Issue brief: `specs/WAVE1_EFF_BRIEF.md` (this repo).
- PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/334

## Confirmation
I did **NOT** edit `command-center/*` (command-center.* / ltv-metrics.*), `admin.controller.ts`, `sub-coach-scope.service.ts`, or `prisma/schema.prisma`. SubCoachScopeService was imported/called only.

**Final SHA:** `84918e8d2a002541faea4d8e3a1fc8b1979c072e` · **PR #334**.
