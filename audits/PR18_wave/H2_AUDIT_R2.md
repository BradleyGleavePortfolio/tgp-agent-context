# AUDIT — hygiene(H2): admin pagination + validated query params + ApiOperation (PR #341) — R2
VERDICT: NOT CLEAN
Typecheck: pass — `NODE_OPTIONS=--max-old-space-size=2048 npx tsc --noEmit -p tsconfig.json --pretty false` at pinned SHA `c98cd12275156822ebfc9cdd9a6e85244eb97e3e`.
Lint: pass — `npx eslint src/admin/admin.controller.ts src/admin/admin.dto.ts src/admin/admin.service.ts test/admin-controller-hygiene.spec.ts scripts/admin-federation-smoke.ts`.
Tests: pass — `npx jest test/admin-controller-hygiene.spec.ts test/admin-federation-smoke.helpers.spec.ts test/roles-enforced.spec.ts --runInBand` (60/60). Smoke script also passed against a local mock admin API: `ADMIN_SMOKE_EXIT=0` (9/9 checks). Real staging/prod smoke was not run because no live `BACKEND_URL`/OWNER JWT/fixture IDs were available in the sandbox.

## P0 findings
- None.

## P1 findings
- None.

## P2 findings
- [src/admin/admin.service.ts:201-205, src/admin/admin.service.ts:238-241, src/admin/admin.service.ts:330-340, src/admin/admin.service.ts:353-356] Cursor pagination is not stable enough to ship: both lists order only by `created_at`, filter the next page only by `created_at` (`gt` for coaches, `lt` for users), and encode only that timestamp in `next_cursor`. If more than `limit` rows share the same `created_at` value, rows after the page boundary are skipped forever because the next query excludes every row at the boundary timestamp. The tests even construct 50 users with the identical timestamp and assert a timestamp-only cursor, but they never fetch the next page to catch the loss at `test/admin-controller-hygiene.spec.ts:304-311`. Fix by using a deterministic tie-breaker (`created_at` + `id`), encoding both values in the cursor, and querying `(created_at, id)` with the matching ASC/DESC comparator.
- [src/admin/admin.service.ts:238-241, src/admin/admin.service.ts:353-356] `next_cursor` is inferred from `rows.length === limit` instead of a `limit + 1` probe, so an exact final page advertises a next page that can only return empty results. This is the exact anti-pattern the checkout controller comments call out as fixed by using service-level `hasMore` from a `limit+1` probe at `src/checkout/checkout.controller.ts:154-160`. Fix by fetching `limit + 1`, trimming to `limit`, and returning `next_cursor` only when an extra row proves more data exists.
- [docs/deploy-runbook.md:418-419, src/packages/drip-dispatcher.cron.ts:383-420, src/packages/package-contents.controller.ts:77-78, src/packages/package-contents.service.ts:75-91, src/real-meal-plans/real-meal-plans.controller.ts:36-114] The mandatory write-set gate fails versus `9a8e210b`: `git diff --name-status 9a8e210b..HEAD` reports 13 files, including out-of-H2 package/drip/meal-plan files and deleted/modified tests (`test/drip-dispatcher.cron.spec.ts`, `test/package-contents.service.spec.ts`, `test/real-meal-plans-guards.spec.ts`). The H2 brief allowed only `src/admin/admin.controller.ts`, `src/admin/admin.dto.ts`, `src/admin/admin.service.ts`, focused admin tests, and the R2 smoke-script migration; this tree is not clean against the required base. Fix by rebasing/cherry-picking the H2 commits onto `9a8e210b` (or the current accepted base) and ensuring the resulting diff contains only the allowed H2 files plus the smoke script; if the deploy-runbook edit is desired, amend the brief explicitly.

## P3 (non-blocking)
- [src/admin/README.md:31-33] Admin README is stale after the envelope/cap change: it still says `/admin/coaches` returns “Every coach” and `/admin/users` is max 200, while the implementation returns `{ coaches, next_cursor }` / `{ users, next_cursor }` and caps both at 100. Update docs before handoff.

## Verification of fix claims
- Pinned SHA verified in an isolated audit worktree: `c98cd12275156822ebfc9cdd9a6e85244eb97e3e`.
- R2 P2 smoke-script migration: verified closed. `scripts/admin-federation-smoke.ts:166-184` now requires an object body with `body.users` as an array and `next_cursor` as `string | null | undefined`; `scripts/admin-federation-smoke.ts:187-204` does the same for `body.coaches`. A local mock run of the real script returned `ADMIN_SMOKE_EXIT=0` and 9/9 passed.
- Other callers of the changed endpoints: no missed programmatic backend callers found. Repo grep found the smoke script as the only checked-in programmatic consumer asserting the `/api/admin/users` and `/api/admin/coaches` response bodies; other matches are docs/specs, unrelated Supabase `client.auth.admin.listUsers`, or federation client code for different `/admin/federation/*` endpoints.
- Validated query params: verified. DTO numeric fields use `@Type(() => Number)`, `@IsInt()`, `@Min()`, and `@Max()` at `src/admin/admin.dto.ts:65-177` and `src/admin/admin.dto.ts:181-261`; controller handlers bind DTOs instead of raw `parseInt` at `src/admin/admin.controller.ts:75-175`, `src/admin/admin.controller.ts:191-229`, `src/admin/admin.controller.ts:328-416`. A validation probe rejected `12abc`, `12.5`, negative, zero, over-max, empty string, and invalid cursor with 400, and accepted a valid value.
- Pagination bounds: partially verified. Defaults/hard caps are present (`50` default, `100` cap) and DB-level `take` is used at `src/admin/admin.service.ts:198-205` and `src/admin/admin.service.ts:327-340`; however pagination is NOT clean because it lacks a deterministic tie-breaker and uses `rows.length === limit` as a misleading has-more signal.
- `@ApiOperation` / Swagger: verified. Grep counted 27 `@ApiOperation` decorators and 27 route decorators in `src/admin/admin.controller.ts`; focused tests assert non-empty operation metadata for all 27 handlers.
- Guards/roles: unchanged on the admin controller. Class-level `@UseGuards(JwtAuthGuard, ServiceTokenGuard, RolesGuard)` and `@Roles('owner')` remain at `src/admin/admin.controller.ts:48-49`, and `test/roles-enforced.spec.ts` passed.
- Gates: typecheck pass, focused lint pass, focused Jest pass (60/60), local smoke pass (9/9). Full-suite Jest was not run because the task requested focused H2 verification and prior reports note combined runs can be killed in this sandbox.

## R0 (Decacorn) review
- R0 requires: “R0 — UPHOLD DECACORN QUALITY AT ALL TIMES. WHEN MAKING DECISIONS, ALWAYS ASK 'WHAT WOULD APPLE, NOTION, OR GOOGLE CHOOSE TO DO?' AND GO WITH THAT COURSE OF ACTION. NEVER, EVER BREAK R0 OR R64.”
- Google would not ship timestamp-only keyset pagination for an admin surface because it can silently skip records at the page boundary. Admin users need a complete, deterministic roster, not a cursor that loses rows created in the same instant.
- Google would also not ship a next-page affordance derived from `rows.length === limit` after this repo already documents a `limit+1`/`hasMore` correction in checkout. The UX is not honest about whether more results exist when the final page size equals the limit.
- The cap/default UX is otherwise acceptable: Swagger summaries disclose default 50 / max 100, the DTO rejects over-max values with 400, and the smoke/runbook now describe the envelope shape. The remaining R0 blocker is correctness/honesty of pagination under ties and exact-final-page cases.

VERDICT: NOT CLEAN
