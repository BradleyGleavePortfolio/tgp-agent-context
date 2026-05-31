# H2 ADMIN BUILD REPORT — admin controller hygiene (#6 / #2 / #8)

Builder: Dynasia G (Opus 4.8). Unit: H2 (admin). Repo: `growth-project-backend`.
Branch: `hygiene/admin-controller` (off backend main `19e51b0`).
PR title: `hygiene(H2): admin pagination + validated query params + ApiOperation`.

## Scope (write-set — disjoint, verified)
Exactly four files changed vs `origin/main`:
- `src/admin/admin.controller.ts`
- `src/admin/admin.dto.ts`
- `src/admin/admin.service.ts`
- `test/admin-controller-hygiene.spec.ts` (focused new spec)

No other module touched. `test/roles-enforced.spec.ts` NOT modified (admin guard posture
unchanged, so its allowlist stays valid).

## What changed

### #6 — raw `parseInt` removed, replaced with validated query DTOs
All six raw `parseInt(...)` query-param parses in the controller
(previously at `admin.controller.ts:59,84,123,147,168,202`) are gone. Each
endpoint now binds a `@Query() dto: SomeQueryDto` class from `admin.dto.ts`.
Numeric params use `@Type(() => Number)` + `@IsInt()` + `@Min`/`@Max`, so the
global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` in
`main.ts` coerces valid strings to ints and returns a clean **400** on
`NaN`/garbage instead of silently falling through to a default. New DTOs:
`AdminMetricsQueryDto`, `ListCoachesQueryDto`, `ListUsersQueryDto`,
`AuditLogQueryDto`, `StripeEventsQueryDto`, `FederationSearchQueryDto`,
`GdprScrubQueryDto`, `CoachEffectivenessQueryDto`, `CoachOnboardingQueryDto`,
`CoachAlertsQueryDto`, `BuildWeekEnrollmentsQueryDto`. Date cursors use
`@IsISO8601()`. The `dry_run` flag is kept as a validated string so the
existing truthiness parsing (`true`/`1`/`yes`) is preserved exactly.

### #2 — bounded pagination on `listCoaches` / `listUsers`
Both previously had NO pagination. Now both are cursor-paginated:
- `listUsers`: keyset on `created_at` DESC — cursor → `where.created_at < cursor`;
  bound pushed into the DB query via `take` (default 50, hard max 100).
  Returns `{ users, next_cursor }` (next_cursor only when a full page is returned).
- `listCoaches`: keyset on `created_at` ASC — cursor → `where.created_at > cursor`;
  `take` default 50 / hard max 100. Returns `{ coaches, next_cursor }`.

The bound is enforced in the Prisma query (`take` + `where`), **not** by slicing
in memory. Shape mirrors the repo's existing keyset idiom
(`listStripeProcessedEvents` → `next_before`; PTM risk-board → `next_cursor`).

> Note: this changes the response envelope of `GET /admin/coaches` and
> `GET /admin/users` from a bare array to `{ coaches|users, next_cursor }`.
> No backend caller depends on the old shape (the only other
> `.listUsers(` in the tree is the unrelated Supabase `client.auth.admin.listUsers`).

### #8 — `@ApiOperation` on every handler
All **27** route handlers now carry a concise `@ApiOperation({ summary })`
(previously 0). Behavior-neutral. Follows the repo's existing swagger idiom
(`admin-ptm.controller.ts`).

## Guards / roles
Unchanged. Class-level `@UseGuards(JwtAuthGuard, ServiceTokenGuard, RolesGuard)`
+ `@Roles('owner')` preserved exactly; no per-route guard added, removed, or
weakened. `roles-enforced.spec.ts` still passes.

## Verification (real tooling, deps installed + prisma generate)
- **Typecheck**: `npx tsc --noEmit -p tsconfig.json` → **PASS** (0 errors).
- **Lint**: `npx eslint` on all 4 changed files → **PASS** (0 problems).
- **Tests (new)**: `test/admin-controller-hygiene.spec.ts` → **52 passed / 52**.
  Covers: #6 invalid/NaN query param → 400 + valid coercion to int + cap
  enforcement + forbidNonWhitelisted; #2 controller forwards bounded limit +
  parsed Date cursor, service caps `take` at 100, pushes cursor into `where`
  (keyset, not in-memory), `next_cursor` advances only on a full page; #8 all
  27 handlers assert non-empty `@ApiOperation` summary metadata.
- **Tests (regression)**: `admin-audit`, `admin-console.service`,
  `admin-build-week.controller`, `pr14-guest-recurring-lp-attribution`,
  `roles-enforced` → **26 passed / 26**.

## Commits (Dynasia G, no trailers)
- `738b554` hygiene(H2): validated admin query DTOs + cursor pagination + ApiOperation (#6/#2/#8)
- `4bb77d2` hygiene(H2): type-safe mock-call access in admin hygiene spec

## FIX PASS — P2 response-envelope caller (post GPT-5.5 audit NOT-CLEAN)
Audit `audits/PR18_wave/H2_AUDIT.md` flagged one P2: the new
`{ users, next_cursor }` / `{ coaches, next_cursor }` envelopes from
`src/admin/admin.service.ts` broke the checked-in caller
`scripts/admin-federation-smoke.ts`, which still asserted bare arrays
(`body not array`) for `GET /admin/users` and `GET /admin/coaches`.

**Fix (kept the pagination win):** migrated the smoke script's two checks to
consume the envelope — assert `body.users` / `body.coaches` is an array and
`next_cursor` is `string | null`. Updated the script header comments and the
deploy runbook probes (`docs/deploy-runbook.md:418-419`) from "JSON array" to
the envelope shape. A whole-tree grep confirmed the smoke script was the ONLY
programmatic caller depending on the bare-array shape (all other matches are
route docs/specs or unrelated header parsing); no other callers needed changes,
so the envelope is retained as the better long-term API. Guards/owner role
untouched; `test/roles-enforced.spec.ts` not modified.

### Verification (real tooling, completed green runs)
- **Typecheck**: `NODE_OPTIONS=--max-old-space-size=2048 npx tsc --noEmit -p tsconfig.json --pretty false` → **PASS** (exit 0, 0 errors).
- **Lint**: `npx eslint scripts/admin-federation-smoke.ts` → **PASS** (0 problems).
- **Tests**: `test/admin-controller-hygiene.spec.ts` → **52/52**; `test/roles-enforced.spec.ts` → **2/2**; `test/admin-federation-smoke.helpers.spec.ts` (smoke surface regression) → **6/6**. All run individually with bounded memory (combined runs SIGKILL in this env).

### Fix commit (Dynasia G, no trailers) — branch hygiene/admin-controller
- `c98cd12` hygiene(H2): migrate admin-federation-smoke to { users/coaches, next_cursor } envelope (P2)
