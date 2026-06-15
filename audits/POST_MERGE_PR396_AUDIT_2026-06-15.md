FOLLOW_UP_REQUIRED
# PR #396 Post-Merge Adversarial Re-Audit — R81 Strict — 2026-06-15

## 1. Verdict

**FOLLOW_UP_REQUIRED**

PR #396 was merged to `main` at `b19fee89f6a32b22bc7a5a202e8ee058a7c8679e` without closing the prior R81 findings. Current `origin/main` (`fea925a8032f42176fb38a46607f2abe5b8b110e`) still contains the same classroom implementation for the PR #396 source/test/RLS surfaces: `git diff b19fee89..origin/main -- src/community/classroom test/community/classroom test/rls/community-classroom-rls.spec.ts` is empty. Therefore the original findings are not closed on main.

P0: 0 · P1: 0 · P2: 5 · P3: 2. The code remains strong on RLS, release-lock visibility, strict Zod response envelopes, and flag-off write gating, but R81 strict mode is not clean because all six original findings remain present and the unresolved follow-up set has no GitHub tracking issue under R82.

## 2. Scope

- Repo / PR: `BradleyGleavePortfolio/growth-project-backend#396`.
- Merge commit audited: `b19fee89f6a32b22bc7a5a202e8ee058a7c8679e`.
- Merge parent / diff base: `adc066bd3f597c99c29cc4636dc206e62ef49608`.
- Current main checked: `fea925a8032f42176fb38a46607f2abe5b8b110e`.
- Detached merge worktree: `/tmp/reaudit-pr396-main`; `git rev-parse HEAD` returned the required merge SHA.
- Merge diff swept: `git show b19fee89` — 18 files, +3364/−7:
  - `prisma/migrations/20261216000200_community_classroom_posts/migration.sql`
  - `prisma/schema.prisma`
  - `src/community/classroom/community-classroom-flag.guard.ts`
  - `src/community/classroom/community-classroom-release.feature.ts`
  - `src/community/classroom/community-classroom.controller.ts`
  - `src/community/classroom/community-classroom.dto.ts`
  - `src/community/classroom/community-classroom.module.ts`
  - `src/community/classroom/community-classroom.repository.ts`
  - `src/community/classroom/community-classroom.service.ts`
  - `src/community/community-events.ts`
  - `src/community/community.module.ts`
  - `test/community/classroom/community-classroom-release.spec.ts`
  - `test/community/classroom/community-classroom.e2e.spec.ts`
  - `test/community/classroom/community-classroom.service.spec.ts`
  - `test/community/classroom/pinned-ordering.spec.ts`
  - `test/community/classroom/test-user.factory.ts`
  - `test/community/realtime/posthog-event-names.spec.ts`
  - `test/rls/community-classroom-rls.spec.ts`
- Current-main delta relevant to PR #396: later PRs changed `prisma/schema.prisma`, `src/community/community-events.ts`, `src/community/community.module.ts`, telemetry pins, and unrelated migrations; they did not modify `src/community/classroom/**`, `test/community/classroom/**`, or `test/rls/community-classroom-rls.spec.ts`.
- PR #396 CI snapshot from GitHub: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, and `mwb-3-live-tests` all completed `SUCCESS` on the PR head before merge.

## 3. Original finding status table

| Original finding | Status on current main | Evidence |
|---|---:|---|
| F1 — create-time storage key embeds throwaway post id | **STILL_PRESENT** | `create()` still calls `this.buildMediaSeeds(workspaceId, randomUUID(), input.media)` while `attachMedia()` calls `this.buildMediaSeeds(post.workspace_id, post.id, media)`. The test still asserts only the workspace prefix, not the persisted post id. |
| F2 — no array max size for media inputs | **STILL_PRESENT** | `CreateClassroomPostDto.media` and `AttachClassroomMediaDto.media` still have `@IsArray()` + `@ValidateNested()` but no `@ArrayMaxSize`. |
| F3 — classroom telemetry names registered but never emitted | **STILL_PRESENT** | `COMMUNITY_TELEMETRY_EVENTS` still declares the three `community.classroom.*` events, but the grep sweep finds no classroom `capture`/`track` emit path for those constants. Later voice/search/wearable emitters do not emit classroom events. |
| F4 — read routes missing explicit throttle | **STILL_PRESENT** | The five write handlers have `@Throttle`, but `listFeed` and `getOne` still have no `@Throttle` despite per-asset signed-download URL minting. |
| F5 — test-only `@ts-expect-error` hygiene | **STILL_PRESENT** | `test/community/classroom/community-classroom.service.spec.ts` and `test/community/classroom/pinned-ordering.spec.ts` still contain the two documented `@ts-expect-error` directives. |
| F6 — re-publish / re-schedule ordering edge | **STILL_PRESENT** | `publish()` still preserves `published_at: post.published_at ?? now`, and feed ordering still sorts by `published_at DESC`, so a republished future-scheduled lesson retains its original ordering anchor. |
| R82 tracking for unresolved work | **NEW** | Open and closed issue searches for `PR396 classroom`, `FEATURE_COMMUNITY_CLASSROOM_POSTS`, and `R81-backfill classroom` returned no tracking issue for the unresolved P2/P3 set. |

## 4. Charge-by-charge verification table

| Charge | Result | Evidence |
|---|---:|---|
| Pull merge diff + current main state | **PASS** | The merge commit is single-parent over `adc066bd`; the merge diff is 18 files, +3364/−7. `b19fee89` is an ancestor of current `origin/main` (`fea925a8`). |
| Confirm whether current main closed PR #396 findings | **FAIL / not closed** | The current-main diff for `src/community/classroom/**`, `test/community/classroom/**`, and `test/rls/community-classroom-rls.spec.ts` is empty since the merge, so all source-local findings remain. |
| RLS on classroom posts and media tiles | **PASS** | Migration still enables and forces RLS on both `community_classroom_posts` and `community_classroom_media_assets`, defines coach `FOR ALL` policies with `USING` and `WITH CHECK`, and defines member `SELECT` policies requiring published, released, non-soft-deleted, membership-scoped rows; media visibility still inherits through an `EXISTS` join on the parent post. |
| Release-lock semantics | **PASS** | `statusForPublish()` stores future releases as `scheduled`; `isReleaseLocked()` treats `published` or `scheduled` rows with future `release_at` as locked; `isStudentVisible()` requires `status === 'published'`, no soft delete, and `release_at <= now` or null. |
| Zod strict response envelopes | **PASS** | `ClassroomMediaSchema`, `ClassroomPostSchema`, `ClassroomUploadTargetSchema`, `ClassroomPostResponseSchema`, and `ClassroomFeedResponseSchema` all end with `.strict()`. |
| Request DTO unknown-field rejection | **PASS on global posture** | The PR uses class-validator DTOs, and the existing global `ValidationPipe` posture from the prior audit remains the controlling unknown-field rejection path. The remaining DTO issue is array cardinality, not strictness. |
| Throttle pinning / signing-cost routes | **FAIL** | Write handlers are explicitly throttled, but read routes are not. No classroom throttle metadata test pins `listFeed` / `getOne` throttle values because there is no throttle metadata to pin. |
| Flag-off static pin tests | **PASS** | `resolveClassroomFlag()` returns true only for literal `'true'`; the reflection suite asserts mutating routes carry `CommunityClassroomEnabledGuard`, read routes omit it, flag-off throws the typed 503 body, and non-literal values remain off. |
| Telemetry | **FAIL** | The event-name table and pinned test contain classroom event names, but the classroom service/controller/repository do not inject analytics or call `capture`/`track` for `classroomLessonPublished`, `classroomLessonScheduled`, or `classroomMediaUploadIssued`. |
| R0 banned pattern sweep | **PASS** | Diff grep over PR #396 production classroom source for `Coming soon`, `@ts-ignore`, `.catch(()=>undefined)`, `as unknown as`, and `as any` produced no hits. |
| Commit trailer sweep | **PASS for assistant-attribution ban** | The merge message contains only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`; no assistant/Claude/GPT/Copilot/Gemini attribution trailer was found. |
| R82 tracking-issue discipline | **FAIL / NEW P2** | GitHub issue searches returned no open or closed issue tracking the unresolved PR #396 follow-up set. |

## 5. Findings

| ID | Sev | Area | Finding |
|---|---:|---|---|
| F1 | **P2** | Storage-key correctness | STILL_PRESENT: create-time media storage keys still use a throwaway `randomUUID()` as the `{postId}` path segment instead of the persisted post id. |
| F2 | **P2** | Input bounds / work amplification | STILL_PRESENT: media arrays remain unbounded on both create and attach DTOs. |
| F3 | **P2** | Telemetry | STILL_PRESENT: three classroom telemetry names remain registered and pinned without any classroom emit site. |
| F4 | **P2** | Throttle / signing-cost reads | STILL_PRESENT: classroom feed/detail reads remain unthrottled while minting signed download URLs per media asset. |
| F5 | **P3** | Test hygiene | STILL_PRESENT: two test-only `@ts-expect-error` directives remain. |
| F6 | **P3** | Ordering semantics | STILL_PRESENT: re-publish/re-schedule still keeps the original `published_at` ordering anchor. |
| F7 | **P2** | R82 tracking | NEW: the unresolved follow-up set has no GitHub tracking issue. |

## 6. Per-finding detail

### F1 (P2) — create-time storage key embeds a throwaway post id

**File:** `src/community/classroom/community-classroom.service.ts:238-255,346-363,462`

```ts
private buildMediaSeeds(
  workspaceId: string,
  postId: string,
  media: ClassroomMediaInputDto[],
): ClassroomMediaSeed[] {
  ...
  const storageKey = `community-classroom/${workspaceId}/${postId}/${m.kind}/${randomUUID()}`;
}

const seeds =
  input.media && input.media.length > 0
    ? this.buildMediaSeeds(workspaceId, randomUUID(), input.media)
    : [];

const seeds = this.buildMediaSeeds(post.workspace_id, post.id, media);
```

The create path still stores object keys under `community-classroom/{workspaceId}/{throwawayUuid}/...`; the real post id is generated later by Prisma in `createPostWithMedia()`. The attach path correctly uses `post.id`, so the two write paths still produce different key shapes. This is not an IDOR because the key remains workspace-prefixed and random, but it violates the code's own workspace+lesson grouping invariant and makes storage auditing by post id unreliable.

**Recommended fix:** Generate the post id before building create-path media seeds and pass that id into both Prisma create data and `buildMediaSeeds`, or refactor repository creation so the persisted id is known before media keys are built. Add a regression test asserting create-path keys include the persisted post id, not just the workspace prefix.

### F2 (P2) — media arrays remain unbounded

**File:** `src/community/classroom/community-classroom.dto.ts:166-170,207-211`

```ts
@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => ClassroomMediaInputDto)
media?: ClassroomMediaInputDto[];

@IsArray()
@ValidateNested({ each: true })
@Type(() => ClassroomMediaInputDto)
media!: ClassroomMediaInputDto[];
```

The per-asset byte caps remain intact, but request cardinality remains unbounded. A coach can still send a very large media array, forcing large `createMany` calls and sequential signed-upload URL generation inside a single request.

**Recommended fix:** Add an explicit `CLASSROOM_MEDIA_MAX_ITEMS` constant and `@ArrayMaxSize(CLASSROOM_MEDIA_MAX_ITEMS)` to both DTO properties, then add rejection tests for create and attach.

### F3 (P2) — classroom telemetry remains name-only

**File:** `src/community/community-events.ts:79-84`; missing emit site under `src/community/classroom/**`

```ts
classroomLessonPublished: 'community.classroom.lesson_published',
classroomLessonScheduled: 'community.classroom.lesson_scheduled',
classroomMediaUploadIssued: 'community.classroom.media_upload_issued',
```

The current main grep still finds the classroom event names only in the constant table and pin. Other community slices now emit voice/search/wearable telemetry, but the classroom service has no analytics dependency and no emit call on publish, schedule, or media-upload issuance.

**Recommended fix:** Inject the repo's analytics service into `CommunityClassroomService` and emit the three events behind `FEATURE_COMMUNITY_TELEMETRY === 'true'` with bounded id/timestamp/enum payloads only. Add service tests asserting emit and no-emit paths.

### F4 (P2) — signed-URL-bearing read routes remain unthrottled

**File:** `src/community/classroom/community-classroom.controller.ts:50-167`

```ts
@Post('workspaces/:workspaceId/classroom')
@Throttle({ default: { ttl: 60_000, limit: THROTTLER_ROUTE_LIMITS.COMMUNITY_POSTS_PER_MIN } })
...
@Get('workspaces/:workspaceId/classroom')
@UseGuards(JwtAuthGuard, RolesGuard, CommunityFeatureFlagGuard)
@Roles('student', 'coach', 'owner')
async listFeed(...)

@Get('classroom/:postId')
@UseGuards(JwtAuthGuard, RolesGuard, CommunityFeatureFlagGuard)
@Roles('student', 'coach', 'owner')
async getOne(...)
```

The reads still call `postView()`/`mediaView()` and mint one signed download URL per media asset. Without an explicit route throttle, a hot loop against feed/detail can amplify signing/storage API cost.

**Recommended fix:** Add explicit `@Throttle` decorators to `listFeed` and `getOne` using an appropriate read bucket, and add a metadata regression spec that fails if those decorators are removed or their values drift.

### F5 (P3) — test-only `@ts-expect-error` directives remain

**File:** `test/community/classroom/community-classroom.service.spec.ts:157-158`; `test/community/classroom/pinned-ordering.spec.ts:65`

The two test-only directives remain documented and are not R0 production-source violations, but R81 strict mode requires all P0-P3 items to be closed before declaring the surface clean.

**Recommended fix:** Replace partial structural mocks with typed helper factories or narrower interfaces so the directives are unnecessary.

### F6 (P3) — re-publish/re-schedule keeps original ordering anchor

**File:** `src/community/classroom/community-classroom.service.ts:406-432`; `src/community/classroom/community-classroom.repository.ts:259-267`

```ts
// Stamp published_at once so ordering is stable across re-publishes.
published_at: post.published_at ?? now,
...
orderBy: [
  { pinned: 'desc' },
  { pinned_order: { sort: 'asc', nulls: 'last' } },
  { published_at: { sort: 'desc', nulls: 'last' } },
  { created_at: 'desc' },
  { id: 'desc' },
]
```

Visibility is still correct because release-lock checks `release_at`, not `published_at`. The remaining issue is ordering semantics: if a coach publishes now, later moves `release_at` into the future, and republishes, feed ordering still reflects the first publish time rather than the new schedule moment.

**Recommended fix:** Either document and test the current stable-ordering contract explicitly, or update the ordering/publish semantics to use a separate schedule/order timestamp for future releases.

### F7 (P2) — unresolved PR396 work has no R82 tracking issue

**File:** GitHub issue tracker for `BradleyGleavePortfolio/growth-project-backend`

Open/all issue searches for `PR396 classroom`, `FEATURE_COMMUNITY_CLASSROOM_POSTS`, and `R81-backfill classroom` returned no tracking issue. Under R82, any deferred/follow-up work surfaced by an audit must have a durable GitHub issue with the required sections and labels.

**Recommended fix:** File a tracking issue covering F1-F6 with labels `R81-backfill`, `tracking`, `community`, `backend`, and `pre-flag-flip`, or close the findings in a follow-up PR that goes through the full R81 cycle.

## 7. What's correctly implemented (do not regress)

- RLS remains strong: both classroom tables use `ENABLE` + `FORCE ROW LEVEL SECURITY`; coaches get `FOR ALL` with `USING` + `WITH CHECK`; members get `SELECT` only for published, released, non-soft-deleted, membership-scoped content; media assets inherit the parent post predicate.
- Release-lock remains a single tested predicate family in `community-classroom-release.feature.ts`; student visibility still requires published + released + not soft-deleted.
- Cross-tenant reads still resolve through membership/visibility paths that return 404, not existence-leaking 403.
- Response envelopes remain Zod `.strict()`.
- Write routes remain behind `JwtAuthGuard`, `RolesGuard`, `CommunityFeatureFlagGuard`, and `CommunityClassroomEnabledGuard`, with explicit `@Roles` and write throttles.
- The classroom feature flag still defaults off and is read per request; static reflection tests pin write-route guard coverage and flag-off behavior.
- Repository feed reads remain bounded and N+1-free via `include`, `take: limit + 1`, and a defensive 1..50 clamp.
- Multi-row create/attach paths remain transactional.
- PR #396 production classroom source remains clean of the R0 banned patterns swept here.

## 8. R0/R52/R74/R77/R78/R79/R80/R81/R82 compliance summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned patterns | **PASS** | PR #396 production classroom diff grep produced no hits for `Coming soon`, `@ts-ignore`, `.catch(()=>undefined)`, `as unknown as`, or `as any`. |
| R52 continuity | **PASS on audited evidence** | `b19fee89` is an ancestor of current `origin/main`; no rebase/branch-loss issue surfaced in this re-audit. |
| R74 identity / trailers | **PASS for assistant-attribution sweep** | Commit-message sweep found only the human `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` trailer. |
| R77 read-only / lane scope | **PASS** | Audit used read-only inspection; no writes were made inside the audit worktree. |
| R78 telemetry pin table | **PARTIAL** | The pinned event-name test includes the classroom events, but the events remain name-only with no classroom emit sites. |
| R79 pin sweep | **PARTIAL** | The flag-off static pin exists and covers mutating route guard topology; throttle pinning is absent for reads because the read throttle decorators are absent. |
| R80 pre-existing claim discipline | **PASS** | Findings are scoped to PR #396-introduced classroom code or the current tracker state; unrelated later slice changes were not laundered into this audit. |
| R81 auditor gate | **FAIL** | PR #396 was merged without cycling to `CLEAN_NO_FINDINGS`; all original P2/P3 findings remain present on main. |
| R82 tracking issue discipline | **FAIL** | No GitHub issue was found for the unresolved follow-up set. |

## 9. CI snapshot

- PR #396 head: `2c749efcd8ca23a36413643f9337cfe5cea6aa62`.
- Merge commit: `b19fee89f6a32b22bc7a5a202e8ee058a7c8679e`.
- PR #396 checks reported by GitHub: `build-and-test` = `SUCCESS`, `rls-floor-guard` = `SUCCESS`, `rls-live-tests` = `SUCCESS`, `mwb-3-live-tests` = `SUCCESS`.
- No current-main CI rerun was required to establish finding status because the relevant classroom source/test/RLS files are unchanged since merge.

## 10. Hectacorn bar

**Would Stripe/Linear/Apple ship this as clean? No.** The core auth/RLS/release-lock architecture is solid, but a strict post-merge gate cannot call the surface clean while known P2/P3 findings remain in production main, telemetry claims remain unfulfilled, signing-cost reads lack explicit throttles, and the unresolved work lacks a durable R82 tracking issue.

## 11. Required follow-up before `FEATURE_COMMUNITY_CLASSROOM_POSTS` can be flipped on

1. **P2 / F1:** Fix create-path storage keys to include the real persisted post id and pin it with a regression test.
2. **P2 / F2:** Add media array max-size limits to create and attach DTOs, with rejection tests.
3. **P2 / F3:** Wire classroom telemetry emits or remove/correct the name-only contract; add tests either way.
4. **P2 / F4:** Add explicit throttles to classroom feed/detail reads and add throttle metadata tests.
5. **P3 / F5:** Remove or replace the remaining test-only `@ts-expect-error` directives.
6. **P3 / F6:** Document/test or correct the republish/reschedule ordering contract.
7. **P2 / F7:** File the required R82 tracking issue if any item is not fixed immediately in the follow-up PR.
8. Run the full R81 cycle on the follow-up PR until `CLEAN_NO_FINDINGS` before any further merge or flag-on decision.

## 12. Source references

- Worktree: `/tmp/reaudit-pr396-main` @ `b19fee89f6a32b22bc7a5a202e8ee058a7c8679e`.
- Current main checkout: `/home/user/workspace/audit-work/worktrees/growth-project-backend` @ `fea925a8032f42176fb38a46607f2abe5b8b110e`.
- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-backend`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/396`.
- Evidence files saved for this post-merge re-audit:
  - `/home/user/workspace/audit-work/outputs/PR396_POST_MERGE_git_evidence.txt`
  - `/home/user/workspace/audit-work/outputs/PR396_POST_MERGE_main_delta.txt`
  - `/home/user/workspace/audit-work/outputs/PR396_POST_MERGE_targeted_evidence.txt`
  - `/home/user/workspace/audit-work/outputs/PR396_POST_MERGE_compact_evidence.txt`
  - `/home/user/workspace/audit-work/outputs/PR396_POST_MERGE_issues_search.txt`
