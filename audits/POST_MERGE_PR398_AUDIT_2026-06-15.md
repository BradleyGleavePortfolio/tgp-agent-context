PASS_WITH_FINDINGS

# Post-Merge PR #398 Audit — R81 Re-Audit — 2026-06-15

## 1. Verdict

**PASS_WITH_FINDINGS — NOT R81-CLEAN**

PR #398 is still dirty on current `main`. The original five findings remain open in the current main state: F1/F2/F3 are still P2, and F4/F5 are still P3. No P0/P1 was found in the PR #398 code surface, and the feature remains default-OFF, but R81 requires the cycle to continue until the PR398 surface has zero P0-P3 findings.

Counts: **P0: 0 · P1: 0 · P2: 3 original open · P3: 2 original open**. Additional process note: the merge commit metadata is not R74-clean (`BradleyGleavePortfolio <bradleyapple1031@gmail.com>` / GitHub committer), although the only co-author trailer is the human Bradley trailer.

## 2. Scope and evidence base

- Repo: `BradleyGleavePortfolio/growth-project-backend`.
- Target merge: `1fb04fbf46297993571179414cae27d0dfd70a07`.
- Parent: `03ac6773e81627f8274d84d24750ae0230cbe40e`.
- Current main audited: `origin/main` / `fea925a8032f42176fb38a46607f2abe5b8b110e`.
- PR metadata: #398, `Roman ED.6 — coach-reviewed competence pill (backend)`, merged `2026-06-14T20:35:20Z`, merge commit `1fb04fbf46297993571179414cae27d0dfd70a07`.
- Merge diff swept: `03ac6773..1fb04fbf` — 12 files, +748/−1.
- Current-main recheck: PR398-owned files are unchanged after the merge except unrelated `prisma/schema.prisma` comments from PR #402; no PR398 finding has been fixed on current `main`.

## 3. Original finding status table

| Original finding | Status on current main | Evidence | Result |
|---|---:|---|---|
| F1 — missing explicit throttle on `POST /coach/clients/:client_id/check-ins/:check_in_id/reviewed` | **OPEN** | `src/check-ins/coach-check-ins.controller.ts:45-51` still has `@Post` + `@HttpCode(200)` and no `@Throttle`; there is no metadata pin for this handler in `test/`. | P2 remains. |
| F2 — raw Prisma `CheckIn` response / no Zod `.strict()` envelope | **OPEN** | `src/check-ins/check-ins.service.ts:363-373` still calls `prisma.checkIn.update` without `select`, returns `updated`, and `grep` finds no Zod import or `.strict()` response schema in the check-ins surface. | P2 remains; foundational F2 template is **FAIL**. |
| F3 — non-atomic find-then-update / ownership not reasserted in write | **OPEN** | `src/check-ins/check-ins.service.ts:363-384` still does `assertCheckInOfCoach()` via `findFirst({ id, coach_id })`, then `update({ where: { id } })`; there is no `P2025` collapse and no atomic `where: { id, coach_id, ... }` write. | P2 remains; foundational F3 template is **FAIL**. |
| F4 — no sub-coach attribution test for the `ConversationReview` marker | **OPEN** | `test/messaging.service.spec.ts:335-399` covers head-coach marker, flag off/unset, re-stamp, readback, and marker-failure isolation; sub-coach tests at `test/messaging.service.spec.ts:434-480` cover unread counts, not `markReadByCoach` marker attribution under the head coach id. | P3 remains. |
| F5 — no telemetry register+emit for coach-reviewed surface | **OPEN** | `src/messaging/messaging.service.ts:620-691` stamps and reads markers without analytics calls; `src/check-ins/check-ins.service.ts:363-373` marks check-ins without analytics calls; grep found no `coach.check_in_reviewed`, `coach.thread_review_stamped`, or `client.competence_pill_read` in `src/` or `test/`. | P3 remains. |

## 4. Foundational template validation

### F2 template — Zod `.strict()` response envelope

**FAIL.** The required response-contract pattern is not present. `markReviewedByCoach` returns the full Prisma `CheckIn` row:

```ts
async markReviewedByCoach(coachId: string, checkInId: string) {
  await this.assertCheckInOfCoach(coachId, checkInId);
  const flagOn = isCoachReviewedAtEnabled();
  const updated = await this.prisma.checkIn.update({
    where: { id: checkInId },
    data: {
      reviewed_by_coach: true,
      ...(flagOn ? { coach_reviewed_at: new Date() } : {}),
    },
  });
  return updated;
}
```

The correct foundational template for this endpoint is a narrow response envelope parsed through a Zod `.strict()` schema, or an equivalent explicit `select` plus strict post-processing. The current implementation has neither, so future `CheckIn` columns silently expand the HTTP response.

### F3 template — atomic scoped update + 404 collapse

**FAIL.** The required race-safe write pattern is not present. The current code authorizes in a separate read and then updates by `id` only:

```ts
await this.assertCheckInOfCoach(coachId, checkInId);
...
await this.prisma.checkIn.update({
  where: { id: checkInId },
  data: { reviewed_by_coach: true, ... },
});
```

The correct foundational template is a single atomic write whose `where` includes the row id, the coach ownership predicate, and any relevant state predicate, with zero-match collapsed to the same 404 response as a missing row. If implemented with `update`, catch Prisma `P2025` and throw `NotFoundException('Check-in not found')`; if implemented with `updateMany`, check `count === 0` and throw the same 404. Current main has neither pattern.

## 5. Required control validation

| Control | Status | Evidence |
|---|---:|---|
| RLS — new `ConversationReview` table | **PASS** | Migration `20261218000000_add_coach_reviewed_at` has `ALTER TABLE "ConversationReview" ENABLE ROW LEVEL SECURITY;` and `FORCE ROW LEVEL SECURITY;`, plus owner and participant policies with `USING` and `WITH CHECK` (`migration.sql:71-103`). |
| RLS — existing `CheckIn` new column coverage | **PASS** | `CheckIn` already has FORCE RLS and owner/client/coach policies in `20260607000000_rls_remaining_gaps` (`migration.sql:83-391`); the new nullable column is covered by the row-level policies. |
| Throttle pinning | **FAIL** | The new write route has no explicit `@Throttle`, and grep found no test pin asserting throttle metadata for `CoachCheckInsController.markReviewed`. |
| Telemetry register+emit | **FAIL** | No event names or emit sites exist for the coach-reviewed check-in write, thread marker write, or client pill read. |
| Flag-off pin tests | **PASS** | `test/roman-coach-reviewed-feature.spec.ts:20-49` pins default-OFF and exact `'true'`; `test/check-ins.service.spec.ts:333-346` pins no `coach_reviewed_at` while flag OFF/unset; `test/messaging.service.spec.ts:349-360` pins no `ConversationReview` marker while flag OFF/unset. |
| Roles / auth reachability | **PASS** | `CoachCheckInsController` carries `@UseGuards(JwtAuthGuard, CoachGuard)` and class-level `@Roles('coach')`; `test/roles-enforced.spec.ts:73-79` documents removal from the legacy allowlist. `ClientMessagingController` carries `JwtAuthGuard`, `RolesGuard`, and class-level `@Roles('student')`. |
| R0 banned-pattern diff sweep | **PASS** | Grep over introduced `src/` diff lines for `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, and `as any` produced no hits. |
| R74 identity | **FAIL / process** | Merge commit author is `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` and committer is `GitHub <noreply@github.com>`, not the canonical `Bradley Gleave <bradley@bradleytgpcoaching.com>`. The co-author trailer itself is human and non-AI. |

## 6. Current finding details

### F1 (P2) — write route still lacks explicit throttle and metadata pin

**File:** `src/check-ins/coach-check-ins.controller.ts:45-51`

```ts
@Post('clients/:client_id/check-ins/:check_in_id/reviewed')
@HttpCode(200)
async markReviewed(
  @Request() req: AuthedRequest,
  @Param('check_in_id') checkInId: string,
) {
  return this.checkIns.markReviewedByCoach(req.user.id, checkInId);
}
```

This remains a write endpoint protected only by the global authenticated default bucket. The canonical backend rule requires explicit throttle on write routes, and R79/R81 expect a pin when the route-level limit is important.

**Required fix:** Add route-level `@Throttle({ default: { ttl: 60_000, limit: 60 } })` or a named bucket, then add a metadata test that reads `THROTTLER:TTLdefault` / `THROTTLER:LIMITdefault` from `CoachCheckInsController.prototype.markReviewed`.

### F2 (P2) — response still over-returns raw Prisma `CheckIn`

**File:** `src/check-ins/check-ins.service.ts:363-373`

The endpoint still returns the raw `CheckIn` update result with no `select` and no Zod `.strict()` envelope. This fails the foundational F2 response-contract template.

**Required fix:** Add a strict response schema, e.g. `{ id, reviewedByCoach, coachReviewedAt }`, and parse it through Zod `.strict()` before returning. Prefer external API casing (`reviewedByCoach`, `coachReviewedAt`) and ISO string timestamps.

### F3 (P2) — ownership is still not reasserted in the write operation

**File:** `src/check-ins/check-ins.service.ts:363-384`

The service still performs a separate `findFirst({ id, coach_id })` and then `update({ where: { id } })`. The write itself does not include `coach_id`, does not include a state predicate, and does not collapse `P2025`/zero-match to the same 404 response.

**Required fix:** Replace the two-step pattern with an atomic scoped write. Acceptable patterns:

```ts
try {
  const updated = await this.prisma.checkIn.update({
    where: { id: checkInId, coach_id: coachId },
    data: { reviewed_by_coach: true, ...(flagOn ? { coach_reviewed_at: new Date() } : {}) },
    select: { id: true, reviewed_by_coach: true, coach_reviewed_at: true },
  });
  return CoachReviewAckSchema.parse({
    id: updated.id,
    reviewedByCoach: updated.reviewed_by_coach,
    coachReviewedAt: updated.coach_reviewed_at?.toISOString() ?? null,
  });
} catch (err) {
  if ((err as { code?: string })?.code === 'P2025') {
    throw new NotFoundException('Check-in not found');
  }
  throw err;
}
```

or `updateMany({ where: { id: checkInId, coach_id: coachId, ... }, data })` followed by `if (count === 0) throw new NotFoundException('Check-in not found')` plus a separate bounded read only if the response needs current values.

### F4 (P3) — sub-coach marker attribution test still missing

**File:** `test/messaging.service.spec.ts:335-399`

The marker suite validates the head-coach path but still does not construct a sub-coach caller and assert that `ConversationReview.coach_id` is the head coach / thread owner id. The unread-count sub-coach tests later in the file do not cover `markReadByCoach` marker attribution.

**Required fix:** Add a sub-coach test that seeds a sub-coach relationship, calls `markReadByCoach(subCoachId, clientId)`, and asserts that the marker row is keyed as `{ coach_id: headCoachId, client_id: clientId }`.

### F5 (P3) — telemetry still absent

**Files:** `src/check-ins/check-ins.service.ts`, `src/messaging/messaging.service.ts`, telemetry registry/tests

The ED.6 coach-reviewed surface still has no registered event names and no `AnalyticsService.capture` calls. Product cannot measure coach review actions, thread marker writes, or whether clients are seeing non-null competence-pill data.

**Required fix:** Register and pin the event names, then emit them at real call sites. Minimum useful set:

- `coach.check_in_reviewed` on successful `markReviewedByCoach` when the feature flag is ON.
- `coach.thread_review_stamped` on successful `stampConversationReview` when the feature flag is ON.
- `client.competence_pill_read` on `coachReviewForClient` only when the marker exists.

Payloads should use ids/timestamps only; no notes, message bodies, names, emails, or PHI.

## 7. Correctly implemented controls that should not regress

- Feature flag resolution is still default-OFF, exact-`true`, case-insensitive, and read per call from `process.env`.
- Flag-OFF behavior is pinned for both check-in timestamps and conversation markers.
- `ConversationReview` is a thin marker table with composite uniqueness on `(coach_id, client_id)` and indexes for both sides.
- `ConversationReview` migration enables and forces RLS in the same migration and defines owner + participant policies.
- `markReadByCoach` isolates marker upsert failure with a structured warning and still returns `{ updated: result.count }`.
- `coachReviewForClient` returns a bounded `{ coachReviewedAt: string | null }` shape.
- `CoachCheckInsController` is now class-level `@Roles('coach')` and removed from the roles-enforced legacy allowlist.
- `ClientMessagingController` inherits `JwtAuthGuard + RolesGuard + @Roles('student')` for `GET /messages/coach-review`.

## 8. R81 conclusion

PR #398 should not be considered R81-clean. The follow-up must close all five original findings, with special care that F2 and F3 become correct reusable templates: strict response envelope and atomic scoped write with same-404 collapse. After fixes land, re-run this audit against the new head and require `CLEAN_NO_FINDINGS` before any flag flip.

## 9. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-backend`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/398`.
- Merge diff: `git diff 03ac6773e81627f8274d84d24750ae0230cbe40e..1fb04fbf46297993571179414cae27d0dfd70a07`.
- Current main checked: `fea925a8032f42176fb38a46607f2abe5b8b110e`.
