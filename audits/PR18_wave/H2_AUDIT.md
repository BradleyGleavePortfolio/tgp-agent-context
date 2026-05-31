# AUDIT — hygiene(H2): admin pagination + validated query params + ApiOperation (PR #341)
VERDICT: NOT CLEAN
Typecheck: fail — `npx tsc --noEmit` was run twice (also with `-p tsconfig.json --pretty false` / bounded NODE_OPTIONS) and was killed by SIGKILL before diagnostics.
Lint: pass — `npx eslint src/admin/admin.controller.ts src/admin/admin.dto.ts src/admin/admin.service.ts test/admin-controller-hygiene.spec.ts`.
Tests: pass — `npx jest test/admin-controller-hygiene.spec.ts --runInBand` (52/52), `test/roles-enforced.spec.ts` (2/2), `test/admin-audit.spec.ts` (3/3), `test/admin-console.service.spec.ts` (8/8), `test/admin-build-week.controller.spec.ts` (2/2), `test/pr14-guest-recurring-lp-attribution.spec.ts` (11/11). A combined multi-spec Jest run was killed by SIGKILL, then each relevant spec passed individually.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [scripts/admin-federation-smoke.ts:166-181] The PR changes `GET /admin/users` and `GET /admin/coaches` from bare arrays to `{ users, next_cursor }` / `{ coaches, next_cursor }` in `src/admin/admin.service.ts:236-242` and `src/admin/admin.service.ts:351-357`, but the checked-in admin federation smoke script still fails unless both endpoints return arrays (`body not array`). This is a breaking caller for the response-envelope change explicitly called out in the brief; the deploy runbook still documents both probes as “JSON array” at `docs/deploy-runbook.md:418-419`. Fix by updating the smoke script/runbook to accept the new envelopes, or preserve a backwards-compatible array surface until callers are migrated.

## P3 (non-blocking)
- [src/admin/README.md:31-33] Endpoint documentation is stale after the new envelope and `/admin/users` hard cap: it still describes the old list behavior and says max 200 while the DTO now caps list users/coaches at 100. Update docs once the envelope break above is resolved.

## Verification of PR claims
- Pinned HEAD verified: worktree HEAD is `4bb77d2985fcfb086fc412039f1f617c20b6730c`.
- Write-set respected: diff vs merge-base `19e51b0674dfeaecadb1e51f97f7fd8860091989` contains only `src/admin/admin.controller.ts`, `src/admin/admin.dto.ts`, `src/admin/admin.service.ts`, and `test/admin-controller-hygiene.spec.ts`; `test/roles-enforced.spec.ts` is unchanged.
- Guards/roles preserved: class-level `@UseGuards(JwtAuthGuard, ServiceTokenGuard, RolesGuard)` and `@Roles('owner')` are unchanged at `src/admin/admin.controller.ts:48-49`.
- #6 validated DTO query params: verified. Controller query parsing now binds DTOs such as `AdminMetricsQueryDto`, `ListCoachesQueryDto`, and `ListUsersQueryDto`; numeric DTO fields use `@Type(() => Number)`, `@IsInt()`, `@Min()`, and `@Max()` in `src/admin/admin.dto.ts:65-115`; global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` is enabled in `src/main.ts:116-120`. Grep found no controller `parseInt` occurrences, and focused tests confirm garbage numeric params return `BadRequestException`.
- #2 bounded cursor pagination: verified in implementation. `listCoaches` applies `where.created_at = { gt: cursor }`, `orderBy: { created_at: 'asc' }`, and `take: limit` in `src/admin/admin.service.ts:198-205`; `listUsers` applies `where.created_at = { lt: cursor }`, `orderBy: { created_at: 'desc' }`, and `take: limit` in `src/admin/admin.service.ts:327-340`. No in-memory `.slice()` pagination was found in the changed admin files.
- #8 `@ApiOperation` coverage: verified. `grep` counted 27 `@ApiOperation` decorators and 27 route-handler decorators in `src/admin/admin.controller.ts`; focused tests assert non-empty metadata for all 27 handlers.

VERDICT: NOT-CLEAN
