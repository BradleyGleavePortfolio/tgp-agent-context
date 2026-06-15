FOLLOW_UP_REQUIRED

# Post-Merge PR #326 Audit — push-to-existing endpoint — 2026-06-15

## 1. Verdict

**FOLLOW_UP_REQUIRED**

Current `main` at `fea925a8032f42176fb38a46607f2abe5b8b110e` still contains PR #326's merge commit `05af67e65d460ad9bf7c098afa79b78ccf44e403` with no changes to the four PR #326-touched files after the merge. The original R81 audit findings were not silently fixed on `main`: F1, F2, F3, and F4 are all still present in the current code. P0: 0 · P1: 1 · P2: 2 · P3: 1.

Recommendation: **file a follow-up cleanup PR immediately** to close all four findings, then run the full R81 audit cycle to `CLEAN_NO_FINDINGS` before merging that cleanup. If the cleanup PR is not opened immediately, file an R82 tracking issue; current GitHub issue search found no PR #326 / push-to-existing / R81-backfill tracking issue.

## 2. Scope and method

- Repo / PR: `BradleyGleavePortfolio/growth-project-backend#326`.
- Merge commit audited: `05af67e65d460ad9bf7c098afa79b78ccf44e403`.
- Current `main` audited: `fea925a8032f42176fb38a46607f2abe5b8b110e`.
- Merge-touched files enumerated with `gh api repos/BradleyGleavePortfolio/growth-project-backend/commits/05af67e6 --jq '.files[] | .filename'`:
  - `src/packages/package-contents.controller.ts`
  - `src/packages/package-contents.dto.ts`
  - `src/packages/package-contents.service.ts`
  - `test/package-contents-push-to-existing.spec.ts`
- Current worktree was fast-forwarded to `origin/main`; `git diff 05af67e65d460ad9bf7c098afa79b78ccf44e403..main -- <four files>` is empty, so current `main` has the same PR #326 code in these files as the merge commit.
- Merge diff swept: `05af67e65d460ad9bf7c098afa79b78ccf44e403^..05af67e65d460ad9bf7c098afa79b78ccf44e403` — 4 files, +1124/−0.
- Targeted tests attempted: `npm test -- --runInBand test/package-contents-push-to-existing.spec.ts test/roles-enforced.spec.ts`; this workspace lacks installed dependencies (`jest: not found`), so no local Jest verdict was available. GitHub CI for the PR #326 merge commit reported `success` for workflow `CI` at run `27522209707`; deploy workflow failure is unrelated to these unit-level findings.

## 3. Per-original-finding status table

| Original ID | Current status | Severity | Current evidence | Notes |
|---|---:|---:|---|---|
| F1 — dispatcher-claim race: update WHERE lacks `status:'pending'` | **STILL_PRESENT** | **P1** | `src/packages/package-contents.service.ts:647-668` still calls `tx.scheduledDrop.update({ where: { id: drop.id }, ... })` while the comment says to re-assert `status='pending'`. | Not silently fixed; diff from merge to current main is empty for this file. |
| F2 — missing explicit `@Throttle` on bulk-write endpoint | **STILL_PRESENT** | **P2** | `src/packages/package-contents.controller.ts:126-129` has `@Roles`, `@Post`, `@HttpCode`, but no `@Throttle`; grep for `@Throttle` around the endpoint is empty. | Not silently fixed. |
| F3 — no Zod `.strict()` response schema / parse fence | **STILL_PRESENT** | **P2** | `src/packages/package-contents.service.ts:471-475` returns an inline TypeScript shape; `src/packages/package-contents.dto.ts:283-295` defines only `PushToExistingSchema`, not a `PushToExistingResponseSchema`. | Not silently fixed. |
| F4 — no durable `AuditService` entry for the bulk push | **STILL_PRESENT** | P3 | `src/packages/package-contents.service.ts:678-680` writes only `this.logger.log(...)`; `PackageContentsService` constructor has no `AuditService` dependency. | Not silently fixed. |
| New post-merge code findings | **NONE** | — | The PR #326-touched files are byte-equivalent between the merge commit and current `main`; no merge-conflict/rebase/sibling-change regression was found in those files. | Rule/process failures are noted separately below. |

## 4. Findings requiring follow-up

### F1 (P1) — dispatcher-claim race: per-drop update is not check-and-set

**Status on current `main`: STILL_PRESENT**

**File:** `src/packages/package-contents.service.ts:647-668`

```ts
await tx.scheduledDrop.update({
  // Re-assert status='pending' in the WHERE so a sibling
  // dispatcher claim mid-tx can never flip a row we believed
  // was pending. ... Use updateMany so the
  // composite filter is honored; count===1 indicates success,
  // count===0 means the row was claimed under us and we
  // must roll the tx back so the partial push doesn't leak.
  where: { id: drop.id },
  data: {
    display_title: liveContent.display_title,
    display_caption: liveContent.display_caption,
    asset_revision_id: liveContent.asset_revision_id,
    asset_type: liveContent.asset_type,
    cadence_kind: liveContent.cadence_kind,
    cadence_payload: liveContent.cadence_payload as Prisma.InputJsonValue,
    fire_at: newFireAt,
  },
});
dropsUpdated += 1;
```

**Repro:** Seed a pending `ScheduledDrop` for the content. Let `pushToExisting()` enter the interactive transaction and complete the inner `findMany({ status: 'pending' })` at `src/packages/package-contents.service.ts:596-607`. Before the loop reaches `tx.scheduledDrop.update`, let `DripDispatcherCron.claim()` commit its normal atomic claim, which uses `updateMany({ where: { id, status: priorStatus, materialised_ref: null, ... }, data: { status: 'dispatching', locked_at: now } })` at `src/packages/drip-dispatcher.cron.ts:241-270`. The push then executes `update({ where: { id: drop.id } })`; because the WHERE no longer checks `status:'pending'`, it succeeds on the now-`dispatching` row and overwrites cadence/fire_at/display snapshot fields that the dispatcher has already claimed for delivery. `dropsUpdated` is incremented unconditionally.

**Why this is a finding:** The endpoint's core safety invariant is “touch only pending drops.” The initial `findMany` is not a durable check under the default transaction behavior because the dispatcher does not take the package advisory lock. The comment already describes the correct contract; the implementation does not meet it. This is a real correctness defect and remains P1.

**Fix prescription:** Replace the per-row `update` with `updateMany({ where: { id: drop.id, status: 'pending' }, data })`, then check `updated.count === 1`. If `count === 0`, throw a conflict-style exception so the whole transaction rolls back and the caller retries from a clean snapshot. Add a regression test that simulates a dispatcher claim between the inner `findMany` and update, asserting rollback/no dispatching-row mutation/no overcount.

### F2 (P2) — bulk write endpoint has no explicit throttle bucket

**Status on current `main`: STILL_PRESENT**

**File:** `src/packages/package-contents.controller.ts:126-129`

```ts
@Roles('coach', 'owner')
@Post(':contentId/push-to-existing')
@HttpCode(HttpStatus.OK)
async pushToExistingDrops(
```

**Repro:** Reflect metadata on `CoachPackageContentsController.prototype.pushToExistingDrops` and inspect throttler metadata; there is no route-level `@Throttle` decorator. Static grep confirms no `@Throttle` import or decorator in `src/packages/package-contents.controller.ts`.

**Why this is a finding:** This route is a coach-triggered bulk mutation that can execute up to 10,000 per-row updates inside a transaction and advisory lock. Without an explicit bucket, it falls through to the broad global default rather than a mutation-specific ceiling. The repo's current community and other high-cost write controllers use explicit `@Throttle` decorators for this reason.

**Fix prescription:** Import `Throttle` from `@nestjs/throttler` and add a route-level bucket, e.g. `@Throttle({ default: { ttl: 60_000, limit: 10 } })` or a named constant in `THROTTLER_ROUTE_LIMITS`. Add a metadata test that pins the exact limit/ttl for `pushToExistingDrops`.

### F3 (P2) — response contract is TypeScript-only; no Zod parse fence

**Status on current `main`: STILL_PRESENT**

**Files:** `src/packages/package-contents.service.ts:471-475`, `src/packages/package-contents.dto.ts:283-295`

```ts
): Promise<{
  drops_updated: number;
  buyers_affected: number;
  skipped_delivered: number;
}> {
```

`package-contents.dto.ts` currently defines `PushToExistingSchema` for the request body but no strict response schema:

```ts
export const PushToExistingSchema = z
  .object({
    push: z.literal(true).optional(),
    fields: z.array(z.enum([...PUSH_FIELDS] as [PushField, ...PushField[]])).nonempty().optional(),
  })
  .strict()
  .refine(...);
export type PushToExistingInput = z.infer<typeof PushToExistingSchema>;
```

**Repro:** Search for `PushToExistingResponse` or `PushToExistingResponseSchema`; no hits exist. The service returns a plain object assembled at `src/packages/package-contents.service.ts:682-686` without `.parse()`.

**Why this is a finding:** The request side is strict, but the response side has no runtime fence. A future edit could accidentally include internals in the return object without Zod rejecting the shape. This remains a P2 response-contract gap under the repo's R81/Zod response doctrine cited by the original audit.

**Fix prescription:** Add:

```ts
export const PushToExistingResponseSchema = z.object({
  drops_updated: z.number().int().nonnegative(),
  buyers_affected: z.number().int().nonnegative(),
  skipped_delivered: z.number().int().nonnegative(),
}).strict();
export type PushToExistingResponse = z.infer<typeof PushToExistingResponseSchema>;
```

Use `Promise<PushToExistingResponse>` and return `PushToExistingResponseSchema.parse({ ... })`. Add a unit test that extra response keys are rejected or that the service calls the parse fence.

### F4 (P3) — bulk push produces only a transient logger line, not a durable audit entry

**Status on current `main`: STILL_PRESENT**

**File:** `src/packages/package-contents.service.ts:678-680`

```ts
this.logger.log(
  `pushToExisting: package=${packageId} content=${contentId} drops_updated=${result.drops_updated} buyers_affected=${result.buyers_affected} skipped_delivered=${skipped_delivered}`,
);
```

**Repro:** `PackageContentsService` constructor at `src/packages/package-contents.service.ts:60-64` injects only `PrismaService`, `PackagesService`, and `SubCoachScopeService`; there is no `AuditService`. Search results show audit writes elsewhere in the repo, but none in the package push-to-existing path.

**Why this is a finding:** This is a high-impact coach action that rewrites the scheduled snapshot for every current buyer's pending drops for a content item. A process log is not equivalent to a durable audit log that can be queried by owner/support/compliance tooling.

**Fix prescription:** Inject `AuditService` and write a durable audit entry after the transaction succeeds and before returning. Include at least `coachUserId`, `packageId`, `contentId`, `drops_updated`, `buyers_affected`, and `skipped_delivered`. Add a unit test that a successful push writes the audit entry and a rolled-back push does not record success.

## 5. New issue sweep

No additional P0/P1/P2/P3 code findings were found beyond the four original findings. The decisive fact is that the PR #326-touched files have no diff between `05af67e65d460ad9bf7c098afa79b78ccf44e403` and current `main`, so there were no merge-conflict or post-merge sibling edits in those files to introduce a different code regression.

Process/rules observations that do not add a separate code-finding ID:

- **R74 identity is non-compliant for the historical merge commit.** `git show -s` reports Author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` and Committer `GitHub <noreply@github.com>` on `05af67e65d460ad9bf7c098afa79b78ccf44e403`, plus a `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` trailer. Under current R74, commits should be authored/committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>` with no co-author trailers. Do not rewrite `main`; enforce R74 on the follow-up cleanup PR.
- **R82 tracking issue not found.** GitHub issue searches for `PR326`, `PR #326`, `push-to-existing`, `push to existing`, and open `R81-backfill tracking backend` returned no matching issues. If the cleanup PR is not immediate, file an R82 tracking issue with the six required sections and labels `R81-backfill`, `tracking`, and backend/package topical labels.

## 6. Rules check summary

| Rule | Status | Evidence |
|---|---:|---|
| R72 — exhaustive audit | **PASS** | All four merge-touched files were enumerated, current versions read, merge diff read, and surrounding dispatcher/module/roles/throttle/audit context inspected. |
| R74 — operator identity | **FAIL / historical merge commit** | PR #326 merge commit author/committer/trailer do not match current R74 requirements. Follow-up cleanup commits must be R74-clean. |
| R77 — no orchestrator / read-only lane discipline | **PASS for this audit** | Audit used the existing `main` worktree read-only for code inspection and wrote only evidence/report files under `/home/user/workspace/audit-work/outputs/`. No code edits, commits, or pushes were performed. |
| R79 — tests pin every behavior | **PARTIAL / FAIL for open findings** | The existing PR test file pins happy-path, only-pending-at-read-time, idempotency, rollback-on-update-error, sub-coach mapping, validation, counts, cron eligibility, and advisory lock. It does **not** pin the dispatcher mid-transaction claim race, the required throttle metadata, the response schema parse fence, or the audit-log write. Local Jest run could not execute because dependencies are absent in the worktree (`jest: not found`). |
| R81 — zero findings before merge | **FAIL** | The PR was merged with one P1, two P2, and one P3 still present on current `main`. R81 requires CLEAN_NO_FINDINGS before merge. |
| R82 — tracking issues for descoped/follow-up work | **FAIL if cleanup is deferred** | No matching PR #326 / push-to-existing / R81-backfill tracking issue was found. File one if these findings are not immediately addressed by a cleanup PR. |

## 7. Recommendation

**File a follow-up cleanup PR, not “tech debt OK.”** The P1 race is a correctness defect in a production bulk mutation and must be fixed before further rollout. The P2 throttle and response-contract gaps should be closed in the same PR, and the P3 audit-log gap must also be fixed because R81 requires clearing P0-P3. If the cleanup PR cannot start immediately, file an R82 tracking issue first so the unclosed post-merge work is durable.

## 8. Evidence saved

- `/home/user/workspace/audit-work/outputs/PR326_merge_files_2026-06-15.json`
- `/home/user/workspace/audit-work/outputs/PR326_postmerge_static_evidence_2026-06-15.txt`
- `/home/user/workspace/audit-work/outputs/PR326_postmerge_line_evidence_2026-06-15.txt`
- `/home/user/workspace/audit-work/outputs/PR326_postmerge_tracking_issue_search_2026-06-15.json`
- `/home/user/workspace/audit-work/outputs/PR326_postmerge_github_metadata_2026-06-15.txt`
- `/home/user/workspace/audit-work/outputs/PR326_postmerge_targeted_tests_2026-06-15.txt`

## 9. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-backend`
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/326`
- Merge commit: `https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/05af67e65d460ad9bf7c098afa79b78ccf44e403`
- Current main audited locally: `fea925a8032f42176fb38a46607f2abe5b8b110e`
- PR #326 CI run: `https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/27522209707`
