# PR #405 Follow-up Opus Fixer — re-audit findings N1–N4 CLOSED

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** [#405](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/405) — extended in place (NO new PR opened)
**Branch:** `fix/pr399-r81-cleanup` (same branch; commits added on top, no rebase/branch-off)
**Audited head (before):** `fa992a72e8b0d6bdbe8197c617b3599bdffe7c89`
**New head (after push):** `b36799cfe7cf1e2aa2dbb091610097879abb79fd`
**Working tree:** `/tmp/fix-pr399` (the existing worktree already had `fix/pr399-r81-cleanup` checked out at the exact required head `fa992a72`; `/home/user/workspace/audit-work/worktrees/backend` could not check out the same branch because the branch was already attached to `/tmp/fix-pr399`).
**Inputs read in full:** `audit-work/outputs/PR405_REAUDIT_2026-06-14.md`, `PR399_AUDIT_2026-06-14.md`, `briefs/CANONICAL_AUDIT_BRIEF.md`, rules R72/R74/R77/R79/R81/R82, and `PR403_FOLLOWUP_FIX_SUMMARY_2026-06-15.md` (throttle/test-style reference).

All four re-audit findings are closed. Each behavior change ships a test (R79). Lane stayed inside the four finding surfaces (R77). All commits authored + committed inline as `Bradley Gleave <bradley@bradleytgpcoaching.com>` with no AI/co-author trailers (R74).

---

## Per-finding closure narrative

### N1 (P1) — UUID migration silently destroyed non-empty data — CLOSED
The `20261219000000_community_wearable_prompts_uuid_id/migration.sql` re-key documented that a non-empty environment must take the #404 backfill path, then unconditionally ran `DROP TABLE IF EXISTS` on both tables with no executable guard — any environment holding old cuid rows would lose data silently.

- Added an executable `DO $$ … RAISE EXCEPTION … END $$;` preflight **inside the same `BEGIN; … COMMIT;` transaction, ahead of either DROP**. It uses `to_regclass('public.<table>') IS NOT NULL AND EXISTS (SELECT 1 FROM "<table>" LIMIT 1)` so it is safe (no error) when a table is absent on a fresh environment, but RAISEs and aborts the whole transaction if either table is non-empty, with the message `… is non-empty; stop and follow GitHub issue #404 backfill path before applying 20261219000000`.
- Updated the migration header comment to explicitly name issue **#404** and its URL (`https://github.com/BradleyGleavePortfolio/growth-project-backend/issues/404`).
- Pinned all three properties with `fs.readFileSync` static assertions in `wearable-prompts.schema.spec.ts`: (1) the preflight `DO $$ … RAISE EXCEPTION` block exists and guards both tables with the #404 redirect, (2) the header carries `#404` + the issue URL, (3) both DROP statements appear AFTER the preflight (`indexOf` ordering).

### N2 (P2) — `Fixes #404` would auto-close the deferred tracker — CLOSED
The PR body's Tracking section said `Fixes #404`, which would auto-close the conditional/deferred backfill tracking issue on merge (R82 violation).

- Changed the PR body line from `Fixes #404` to `Refs #404` (non-closing keyword), preserving all other PR body content, and added an explanatory clause noting why it is intentionally non-closing and that the **migration header is now the canonical cross-reference** (it names #404 + URL, and the preflight RAISEs into the #404 path).
- Applied via the GitHub REST API (`gh api -X PATCH …/pulls/405 -F body=@…`) because `gh pr edit 405 --body-file` failed with a `Projects (classic) deprecated` GraphQL error (the deprecation broke `gh pr edit`'s project-card read path). The REST PATCH returned the updated body confirming `Refs #404`.
- Verified issue **#404 is still OPEN** after the change.

### N3 (P2) — Service clock not injected / timer-mocked — CLOSED
`WearablePromptsService` constructed wall-clock time inline (`new Date()`) for the 24h cooldown gate and the dismiss/act-on stamps, so the shipped cooldown contract was only pinned at the repository helper, never at the service seam with timer mocking.

- Added an injectable clock seam: `export const CLOCK = Symbol('WearablePromptsClock')`, `export type Clock = () => Date`, `export const defaultClock: Clock = () => new Date()`. Injected it as the **last** constructor param via `@Inject(CLOCK) private readonly clock: Clock = defaultClock` (defaulting so existing positional spec construction is unaffected). Replaced the inline `new Date()` in `generate`, `dismiss`, and `actOn` with `this.clock()`.
- Registered `{ provide: CLOCK, useValue: defaultClock }` in `CommunityWearablePromptsModule`.
- New `wearable-prompts.clock.spec.ts` uses `jest.useFakeTimers().setSystemTime(...)`: (1) at T, `generate` persists and the service hands `now=T` into `repo.isWithinCooldown`; (2) at T+23h the cooldown still blocks (no second persist); (3) at T+24h+1ms the cooldown clears and a new prompt persists. A faithful in-memory repo applies the real `generatedAt >= now − 24h` predicate so the boundary is exercised end-to-end through the production clock seam (not stubbed as a boolean).

### N4 (P3) — Response Zod schemas accepted any string for UUID ids — CLOSED
The F1 public contract changed prompt ids to UUIDs, but `PromptViewSchema` / `PromptSourceViewSchema` still typed ids as generic `z.string()`, so response validation would not catch a regression that emitted a cuid id.

- Tightened `PromptViewSchema.id`, `.workspaceId`, `.coachId`, `.clientId` and `PromptSourceViewSchema.sampleId` from `z.string()` to `z.guid({ message })`. **Implementation note:** the brief suggested `z.string().uuid()` "for broad compatibility," but this codebase is on **Zod 4.4.3**, where `z.string().uuid()` is deprecated and the slice already uses `z.guid({ message })` for `GeneratePromptsBodySchema.clientId`. `z.guid()` was chosen to match the established in-repo convention and the installed Zod version; it enforces the identical UUID contract. (Flagged here per the operator's "halt on scope ambiguity" rule — this is a convention match, not a product decision, so it was not blocking.)
- Added response-parse assertions in `wearable-prompts.schema.spec.ts`: `GenerateResponseSchema.parse` THROWS on a cuid id (`'clabc123'`) and on a non-UUID `sampleId`, PASSES on a valid UUID, and `PromptListResponseSchema.parse` THROWS on a cuid id.

---

## Files changed

| Finding | File | Change |
|---|---|---|
| N1 | `prisma/migrations/20261219000000_community_wearable_prompts_uuid_id/migration.sql` | preflight `DO $$ … RAISE EXCEPTION` guard before DROPs; header names #404 + URL |
| N1 | `src/community/wearable-prompts/__tests__/wearable-prompts.schema.spec.ts` | +3 static migration-content assertions (guard / header / DROP-after-guard) |
| N3 | `src/community/wearable-prompts/wearable-prompts.service.ts` | CLOCK symbol + Clock type + defaultClock; injected clock; `this.clock()` in generate/dismiss/actOn |
| N3 | `src/community/wearable-prompts/wearable-prompts.module.ts` | register `{ provide: CLOCK, useValue: defaultClock }` |
| N3 | `src/community/wearable-prompts/__tests__/wearable-prompts.clock.spec.ts` | NEW timer-mocked service spec (T / T+23h / T+24h+1ms boundary) |
| N4 | `src/community/wearable-prompts/wearable-prompts.dto.ts` | `z.string()` → `z.guid()` for the 5 id fields |
| N4 | `src/community/wearable-prompts/__tests__/wearable-prompts.schema.spec.ts` | +4 response-parse assertions (cuid rejected, UUID accepted) |

No file outside the four finding surfaces was touched (R77). The two untracked leftovers in the worktree (`pr_body.md`, `r82_issue_body.md`) from a prior session were deliberately **not** committed.

---

## Commit SHAs (3 logical commits; N2 was a PR-body edit, not a file commit)

| SHA | Finding | Subject |
|---|---|---|
| `51efba5c4a564141ff05fce4da3ed0dd622b441f` | N1 | `fix(pr405): N1 add non-empty-env preflight guard to UUID re-key migration` |
| `9bf84b9b127cbdbfbaa3f262ac39c7468812f6e0` | N3 | `fix(pr405): N3 inject clock into WearablePromptsService + timer-mocked spec` |
| `b36799cfe7cf1e2aa2dbb091610097879abb79fd` | N4 | `fix(pr405): N4 pin UUID id contract on wearable-prompt response schemas` |

All three: author + committer `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Trailer sweep `fa992a72..HEAD` for `co-author|claude|opus|sonnet|assistant|generated-by|gemini|gpt|copilot` → **CLEAN**. R0 banned-pattern grep on the production-source diff (service/dto/module) → **CLEAN**.

---

## Test results (local, before push)

Targeted run (`npx jest --runInBand --testPathPatterns 'wearable-prompts|community-v3-4'`) on the committed tree:

```
PASS src/community/wearable-prompts/__tests__/wearable-prompts.schema.spec.ts
PASS src/community/wearable-prompts/__tests__/wearable-prompts.clock.spec.ts
PASS test/community/community-v3-4-throttle-metadata.spec.ts
PASS src/community/wearable-prompts/__tests__/wearable-prompts.service.spec.ts
PASS src/community/wearable-prompts/__tests__/prompt-generator.spec.ts
PASS src/community/wearable-prompts/__tests__/wearable-prompts.cooldown.spec.ts
PASS src/community/wearable-prompts/__tests__/wearable-prompts.repository.spec.ts
PASS src/community/wearable-prompts/__tests__/degraded-connector-fallback.spec.ts
Test Suites: 8 passed, 8 total
Tests:       54 passed, 54 total
```

Module-wiring guard specs (compile the full AppModule tree; would catch a broken CLOCK provider):

```
PASS test/module-graph.spec.ts
PASS test/roles-enforced.spec.ts
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
```

Full project `tsc` was intentionally NOT run (OOMs at 8GB per the brief). Jest was already installed (v30.4.1); `npm ci` was not needed.

---

## New head after push

`b36799cfe7cf1e2aa2dbb091610097879abb79fd` — pushed to `origin/fix/pr399-r81-cleanup` (`fa992a72..b36799cf`). PR #405 head now reflects this SHA. PR remains single (#405); no new PR was created.

---

## CI status snapshot (best effort)

New head triggered CI run [27533807044](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/27533807044). Snapshot at end of fixer turn:

| Check | Status |
|---|---|
| `rls-floor-guard` | **pass** (26s) |
| `rls-live-tests` | **pass** (1m50s) |
| `mwb-3-live-tests` | **pass** (2m44s) |
| `build-and-test` | **pending / in-progress** (the heavy full-suite job, ~7min historically) |

`build-and-test` was still running when the turn ended; the four touched-surface suites plus the AppModule-compile guards all pass locally, so no failure is expected. PR is `mergeable: true`, `mergeable_state: unstable` (CI not yet fully green). Issue #404 confirmed **OPEN**.

---

## Halted / escalation items

**None blocking.** One non-blocking note recorded inline above (N4): the brief suggested `z.string().uuid()` but the repo is on Zod 4.4.3 where that is deprecated and the slice already uses `z.guid()`; `z.guid()` was chosen to match the in-repo convention and enforces the identical UUID contract. This was a convention/version match, not a product decision, so it did not require halting. Recommend the parent re-run CI to completion and re-audit to `CLEAN_NO_FINDINGS` per R81.
