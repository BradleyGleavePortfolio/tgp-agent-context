VERDICT: PASS_WITH_FINDINGS — NOT R81-CLEAN (P0: 0 · P1: 0 · P2: 5 · P3: 3)

# Post-Merge PR #400 Audit — R81 Re-Audit — 2026-06-15

**Target merge:** `0d13bfb285b52e40ae94c67a3a65c1c37df93ec0`  
**Repo:** `BradleyGleavePortfolio/growth-project-backend`  
**Current main audited:** `fea925a8032f42176fb38a46607f2abe5b8b110e`  
**Original audit input:** `PR400_AUDIT_2026-06-14.md`  
**Method:** Full target diff re-read (`1fb04fbf46297993571179414cae27d0dfd70a07..0d13bfb285b52e40ae94c67a3a65c1c37df93ec0`, 6 files, +610/−0) plus current `origin/main` comparison. The current main delta after PR #400 only changes unrelated `prisma/schema.prisma` comments for PR #402; no PR #400 production/test surface was cleaned.

## 1. Verdict

**PASS_WITH_FINDINGS — NOT R81-CLEAN.** The merged code still has the original three P2 and two P3 findings from the 2026-06-14 audit. Two additional post-merge process/doctrine findings are present: the dirty findings were not converted into a GitHub tracking issue under R82, and the squash merge metadata violates the active R74 operator-identity rule.

The feature remains default-OFF and the controller/service still avoid a P0/P1 auth or cross-coach leak: the handler passes only `req.user.id`, every Prisma read is scoped by `coach_id`, and the flag-OFF path returns zeroes without touching Prisma. That limits blast radius, but R81 requires **clean of P0-P3 before merge**; this merge is not clean.

## 2. Scope

### In-scope target merge files

- `src/app.module.ts` — registers `CoachHomeModule` after `CoachBriefModule`.
- `src/coach/home/coach-home.controller.ts` — adds `GET /coach/home/daily-rings`, class-level `@UseGuards(CoachGuard)` and `@Roles('coach')`, and passes `req.user.id` into the service.
- `src/coach/home/coach-home.module.ts` — wires controller/service with `PrismaService` and `AuthModule`.
- `src/coach/home/coach-home.service.ts` — implements flag gate, 30s in-memory cache, check-in/brief/review count aggregation, and `DailyRingsResponse` TypeScript interface.
- `src/coach/home/three-arc-counts.feature.ts` — implements `FEATURE_ROMAN_THREE_ARC_COUNTS` default-OFF flag parsing.
- `test/coach-home-daily-rings.controller.spec.ts` — pins roles metadata, flag-OFF no-read behavior, flag parsing, coach scoping, cache hit/TTL/UTC-day behavior, zero-row behavior, null-client filtering, and `CoachGuard` behavior.

### Current-main sweep

- Current `origin/main` is `fea925a8032f42176fb38a46607f2abe5b8b110e`.
- Commits after the target merge are `05af67e6` and `fea925a8`; neither changes `src/coach/home/*`, `test/coach-home-daily-rings.controller.spec.ts`, `src/throttler/throttler.config.ts`, telemetry registration/emission, or daily-rings controller metadata.
- The only current-main diff in the PR #400-adjacent file set is unrelated schema-comment clarification for `CoachFirstPaymentNotification` from PR #402.

## 3. Original finding status table

| Original ID | Sev | Status on current main | Evidence |
|---|---:|---:|---|
| F1 — missing explicit throttle | **P2** | **OPEN** | `CoachHomeController.dailyRings` still has only `@Get('daily-rings')` and `@ApiOperation`; there is no `@Throttle` import/decorator and no daily-rings throttle metadata pin. |
| F2 — no Zod `.strict()` response envelope | **P2** | **OPEN** | `DailyRingsResponse` remains a TypeScript interface only; there is no `zod` import, no `.strict()` schema, and no `parse()` before return/cache. |
| F3 — missing `(coach_id, coach_reviewed_at)` composite index | **P2** | **OPEN** | `ConversationReview` still has `@@unique([coach_id, client_id])`, `@@index([coach_id])`, and `@@index([client_id])` only; no composite index migration exists. |
| F4 — cache map never pruned | **P3** | **OPEN** | The service still owns `private readonly cache = new Map<string, CacheEntry>()`; `getDailyRings` only looks up and sets the current key and never deletes stale prior-day entries. |
| F5 — no telemetry register/emit | **P3** | **OPEN** | No `AnalyticsService` injection, no `capture()` call, no `coach.daily_rings_fetched` constant, and no pinned telemetry test update exist for this surface. |

## 4. New post-merge findings

| ID | Sev | Area | Finding |
|---|---:|---|---|
| F6 | **P2** | R82 tracking | No GitHub tracking issue exists for the still-open PR #400 follow-up work, despite R82 requiring durable tracking for deferred/out-of-lane/follow-up work. |
| F7 | **P3** | R74 identity | The squash merge commit author is `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`, not `Bradley Gleave <bradley@bradleytgpcoaching.com>`. |
| F8 | **P3** | Migration rollback evidence | The missing composite-index fix has no migration at all; the existing `ConversationReview` migration has only a rollback header comment/static test, not an executable down/roundtrip for the index gap. |

## 5. Required validation results

| Validation item | Result | Notes |
|---|---:|---|
| Composite index migration ordering + rollback | **FAIL** | No composite-index migration exists, so ordering/rollback cannot pass for the requested fix. Existing migration ordering remains append-safe (`20261218000000` after `20261217000200`), but that migration does not add the needed `(coach_id, coach_reviewed_at)` index. |
| Zod `.strict()` response envelope | **FAIL** | The runtime response contract is still TypeScript-only. |
| Throttle pinning per R79 | **FAIL** | There is no explicit route throttle and no `Reflect.getMetadata('THROTTLER:*')` regression pin for `CoachHomeController.dailyRings`. |
| Cache prune logic | **FAIL** | Cache hit/TTL/day-boundary logic is pinned; stale entry pruning is still absent. |
| Flag-OFF static pin test | **PASS** | Flag OFF returns `zeroedDailyRings()` and asserts all Prisma mocks are not called; flag parsing variants pin unset/non-`true` values OFF. |
| Telemetry register + emit | **FAIL** | No event is registered and no event is emitted. |
| RLS / tenancy on counts query | **PASS with caveat** | Service-layer scoping is correct (`req.user.id` only; every query includes `coach_id: coachId`); RLS exists for `CheckIn`, `CoachBrief`, `CoachMessage`, and `ConversationReview`. The runtime comment in the `ConversationReview` migration says service-role connections bypass RLS, so the route’s primary enforcement remains service-layer scoping rather than database RLS. |

## 6. Per-finding detail

### F1 (P2) — `GET /coach/home/daily-rings` still has no explicit throttle or R79 pin

**Files:** `src/coach/home/coach-home.controller.ts:40-43`, `test/coach-home-daily-rings.controller.spec.ts`

```ts
@Get('daily-rings')
@ApiOperation({ summary: "Today's three-arc completion counts for this coach" })
async dailyRings(@Request() req: AuthedRequest): Promise<DailyRingsResponse> {
  return this.coachHome.getDailyRings(req.user.id);
}
```

The route still runs an aggregation endpoint with no explicit `@Throttle`, and current tests do not assert throttle metadata for this handler. R79 makes repo-global doctrine/pin coverage part of the merge gate; an exact metadata test is needed so this cannot regress silently.

**Required fix:** Add route-level throttle (for example `@Throttle({ default: { ttl: 60_000, limit: 60 } })`) or a named bucket, then add a focused metadata spec that asserts exact `THROTTLER:LIMITdefault` and `THROTTLER:TTLdefault` values for `CoachHomeController.prototype.dailyRings`.

### F2 (P2) — Response envelope remains TypeScript-only

**File:** `src/coach/home/coach-home.service.ts:49-53`

```ts
export interface DailyRingsResponse {
  checkIns: { reviewed: number; submitted: number };
  brief: { opened: boolean };
  review: { reviewed: number; totalConversations: number };
}
```

There is still no runtime `.strict()` response schema. Future service changes can silently widen the API response by adding fields to nested objects before return/cache.

**Required fix:** Introduce `DailyRingsSchema = z.object({...}).strict()` with nested strict objects, derive `DailyRingsResponse` from `z.infer`, and parse both the zeroed response and computed cache-miss response before returning.

### F3 (P2) — `ConversationReview` still lacks the composite range index

**Files:** `src/coach/home/coach-home.service.ts:193-196`, `prisma/schema.prisma:1248-1250`

```ts
this.prisma.conversationReview.count({
  where: { coach_id: coachId, coach_reviewed_at: window },
})
```

```prisma
@@unique([coach_id, client_id], name: "ConversationReview_coach_client_key")
@@index([coach_id])
@@index([client_id])
```

The query filters by equality on `coach_id` and range on `coach_reviewed_at`, but the schema still has no `@@index([coach_id, coach_reviewed_at])`. No additive migration was added after PR #400 to close this.

**Required fix:** Add an append-only migration with `CREATE INDEX IF NOT EXISTS "ConversationReview_coach_id_coach_reviewed_at_idx" ON "ConversationReview"("coach_id", "coach_reviewed_at");`, add the matching Prisma `@@index`, and pin the migration/schema consistency in tests. Include explicit rollback instructions or an executable down/roundtrip if that is the repo’s migration standard for this lane.

### F4 (P3) — Cache stale-entry pruning is still absent

**File:** `src/coach/home/coach-home.service.ts:77-118`

```ts
private readonly cache = new Map<string, CacheEntry>();
...
this.cache.set(cacheKey, {
  value,
  expiresAt: now.getTime() + DAILY_RINGS_CACHE_TTL_MS,
});
```

The current tests pin cache hit, TTL re-read, and UTC-day self-invalidation, but the implementation still never removes entries for prior UTC days. Long-lived processes accumulate one key per active coach per day.

**Required fix:** Add lazy pruning in `getDailyRings` or bound the map with an LRU/max-size policy, and add a test that creates an old-day entry then proves it is deleted on a later call.

### F5 (P3) — Daily-rings telemetry is still missing

**Files:** `src/coach/home/coach-home.service.ts`, telemetry constants/tests

No `AnalyticsService` is injected into `CoachHomeService`, no daily-rings event constant exists, and no event is emitted on flag-ON cache misses.

**Required fix:** Register a product telemetry event such as `coach.daily_rings_fetched`, update any pinned event-name table if this event family is pinned, and emit once per cache miss with non-PII numeric/boolean ring state.

### F6 (P2) — No R82 tracking issue for open post-merge work

**Evidence:** GitHub issue search for `PR400`, `PR #400`, `daily-rings`, `FEATURE_ROMAN_THREE_ARC_COUNTS`, and `three-arc` returned no matching issue.

R82 requires durable GitHub tracking for follow-up/deferred work. This matters more here because PR #400 is already merged with flag-OFF behavior; the open P2s are specifically pre-flag-flip blockers and should not live only in audit files.

**Required fix:** File a tracking issue in `growth-project-backend` with the six R82 body sections, labels including `R81-backfill`, `tracking`, `backend`, and `pre-flag-flip`, and checklist items for F1-F5.

### F7 (P3) — Merge commit violates R74 operator identity

**Commit:** `0d13bfb285b52e40ae94c67a3a65c1c37df93ec0`

The merge commit author is `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` and committer is `GitHub <noreply@github.com>`. R74 requires new commits to be authored/committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>` with no agent identity.

**Required fix:** Do not rewrite this already-merged history unless the operator explicitly orders it. For the follow-up fix PR, verify every commit and the final squash metadata before merge.

### F8 (P3) — Composite-index rollback evidence is absent because the migration is absent

**Files:** `prisma/migrations/`, `test/roman-coach-reviewed-migration.spec.ts`

The existing `20261218000000_add_coach_reviewed_at` migration includes a rollback header comment and static assertions for the original table/RLS, but there is no migration that adds the missing composite index and therefore no rollback/roundtrip evidence for the required index fix.

**Required fix:** The index-fix PR should include explicit migration ordering evidence, a rollback path for the added index, and a static pin that the migration SQL and `schema.prisma` agree.

## 7. What remains correctly implemented

- The feature flag remains default-OFF and exact-`true` only.
- The flag-OFF path returns `zeroedDailyRings()` and performs no Prisma reads.
- The controller uses class-level `@Roles('coach')` and `@UseGuards(CoachGuard)`, and it is not in the legacy guard allowlist.
- The controller takes no coach id from path/query/body; it passes `req.user.id` only.
- The service scopes every Prisma read to `coach_id: coachId` and excludes coach-authored messages from the review total.
- The cache self-invalidates on UTC-day boundary and re-reads after the 30s TTL.
- The target diff still has no production-source R0 banned-pattern hit in introduced lines.

## 8. R0/R72/R74/R77/R79/R81/R82 compliance summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned patterns | **PASS** | Diff grep over introduced production lines found no `Coming soon`, `@ts-ignore`, `.catch(()=>undefined)`, `as unknown as`, or `as any`. |
| R72 exhaustive audit | **PASS** | Target diff inventory was re-read end-to-end and current main was compared for all PR #400 files plus throttle/telemetry/schema/test seams. |
| R74 identity | **FAIL / P3** | Squash merge author email is not the required Bradley email. |
| R77 lane/read-only | **PASS** | Audit only read git data and wrote audit outputs; no repo files were modified. |
| R79 pin sweep | **FAIL / P2** | Missing throttle has no exact metadata regression pin. |
| R81 auditor gate | **FAIL POST-MERGE** | The merge remains non-clean with open P2/P3 findings. |
| R82 tracking | **FAIL / P2** | No matching GitHub tracking issue exists for the open post-merge blockers. |

## 9. Required follow-up before any flag flip

1. **P2:** Add explicit daily-rings throttle and exact metadata pin.
2. **P2:** Add Zod `.strict()` response schema and parse before return/cache.
3. **P2:** Add composite `(coach_id, coach_reviewed_at)` index migration, schema update, ordering evidence, rollback path, and static pin.
4. **P2:** File the R82 tracking issue if the code fix is not started immediately.
5. **P3:** Add stale-entry cache pruning and a prune regression test.
6. **P3:** Register and emit daily-rings telemetry on flag-ON cache misses.
7. **P3:** Enforce R74 identity on every follow-up commit and squash metadata.

## 10. Source references

- Worktree/source repo: `/home/user/workspace/audit-work/worktrees/growth-project-backend`
- Target merge: `0d13bfb285b52e40ae94c67a3a65c1c37df93ec0`
- Parent: `1fb04fbf46297993571179414cae27d0dfd70a07`
- Current main: `fea925a8032f42176fb38a46607f2abe5b8b110e`
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/400`
- Evidence snapshot: `/home/user/workspace/audit-work/outputs/POST_MERGE_PR400_AUDIT_EVIDENCE_2026-06-15.txt`
