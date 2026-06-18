# TM-7a audit — Lens A (correctness / security / RLS) — SHA 409a4bfa

## Verdict: FINDINGS (no P0/P1; P2 + P3 only)

PR #452 (`feat/tm-7a-admin-listings`) — owner-only admin listing moderation,
split from #448. Headline P1-3 idempotency fix and P3-5 NaN guard both VERIFIED.
No security/RLS bypass, no banned tokens, identity clean. Findings are minor
correctness/DX (P2) and the LOC cap (P3).

## Findings

### P2-1 — Unvalidated `status` query param can 500 the queue
**File:** `src/talent-marketplace/admin-moderation.service.ts:54-55` (dto `src/talent-marketplace/admin-moderation.dto.ts:33-36`)
**Issue:** `ReviewQueueQueryDto.status` is validated only as `@IsString @MaxLength(40)`,
then cast onto the enum column: `where.status = query.status as Prisma.JobListingWhereInput['status']`.
A caller sending `?status=bogus` passes validation, and Prisma 6.19.3 throws a
`PrismaClientValidationError` for an unknown enum value in a `where` equality →
unhandled → HTTP 500. The sibling `public-listing.service.ts` never accepts a
client status (it hardcodes `'published'`), so TM-7a is the first to forward a
raw status string onto the enum. Owner-only surface, so impact is low (an admin
hand-crafting a bad query gets a 500 instead of an empty page / 400), but it is
a reachable unhandled-error path.
**Recommended fix:** Constrain `status` with `@IsIn(['draft','published','closed'])`
(or `@IsEnum(JobListingStatus)`) in the DTO so a bad value is a clean 400 at the
validation boundary. Keeps the comment's promise ("canonical DB enum members").

### P2-2 — Mutation and ledger write are not atomic (inherited pattern)
**File:** `src/talent-marketplace/admin-moderation.service.ts:170-183` (the shared `review` wrapper)
**Issue:** `apply()` (the `jobListing.updateMany` that advances the row) and
`idempotency.markCompleted` run in separate transactions. If `markCompleted`
*throws* (DB error, not the handled `conflict` return) after `apply()` already
advanced the listing, the `catch` calls `releaseClaim` + rethrows — leaving the
listing **published/closed** but with **no completed ledger row**. A same-key
retry then re-enters, claims, runs `updateMany WHERE status=draft` → count 0 →
`alreadyDecided` → 409, even though the decision actually applied. The caller
sees a 409 for a decision that succeeded.
This is the **established repo pattern** (`apply.service.ts` claim→mutate→
markCompleted is likewise non-transactional; its `$transaction` is for a
different multi-write), so it is NOT a TM-7a regression — flagging as
informational. Impact is bounded to the rare markCompleted-throws window.
**Recommended fix:** None required for this PR. If hardened later, wrap
`claim → mutation → markCompleted` in a single `$transaction` so the ledger and
the row advance commit together. Defer to a cross-lane idempotency hardening.

### P3-1 — Prod LOC (436) exceeds the 400 hard cap
**File:** whole-PR diff vs `origin/main`
**Issue:** Prod LOC excluding tests/migrations = **436** (controller 63 + dto 76 +
service 237 + cursor 52 + module +8), over the 400 cap that this PR exists to
satisfy (split out of #448's 476). The overage is structural: 7a carries the
shared cursor (52) + dto (76) so 7b can import them. There is **no CI gate** for
LOC (confirmed `.github/workflows/ci.yml` has no line-count step) — the cap is a
review convention.
**Recommended fix:** Accept-with-justification (each PR is independently
reviewable; net new *logic* in 7a is controller+service+module = 308 < 400) or,
if the cap is hard, trim the service's ~49 comment/blank lines — but those
document the P1-3 invariant and are worth keeping. Defer to release owner.

## Checks passed

- **RLS posture:** `JobListing` has FORCE RLS (migration
  `20261220000000_talent_marketplace_rls`): SELECT/UPDATE permit `app.is_owner()`.
  The admin queries (`findMany`/`updateMany`, unscoped by hirer) are correct for
  an owner surface — they read/write all rows precisely because RLS grants owners
  full access. `app.is_owner()` derives from the `app.current_user_role` GUC set
  by the global `RlsContextInterceptor` after `JwtAuthGuard`. TM-7a uses the same
  `this.prisma` access pattern as every sibling service — no `bypassRls`, no
  unjustified raw SQL, no cross-tenant leak. (The interceptor's transaction-scoped
  `set_config(...,true)` reliability is a pre-existing, repo-wide concern, NOT a
  TM-7a issue; OwnerGuard is the primary gate with RLS as defense-in-depth.)
- **Authorization:** Both routes (`GET listings`, `POST listings/:id/review`) are
  class-gated by `@Roles('owner')` + `@UseGuards(JwtAuthGuard, OwnerGuard)`.
  `OwnerGuard` throws 403 for non-owner / unauthenticated. `RolesGuard` is also a
  global `APP_GUARD`. No anonymous route. `:id` is `ParseUUIDPipe`-validated →
  non-UUID is a 400 before any DB hit. Owner-only VERIFIED.
- **Cross-lane envelope:** Every thrown exception uses `{ error, message, code }`
  (`review_in_flight`, `listing_not_found`, `listing_already_decided`,
  `review_replay_corrupt`). No `{ kind }`. The global `HttpExceptionFilter`
  preserves the `code` field. VERIFIED.
- **Idempotency fix (P1-3): VERIFIED.**
  - Default idem-key is `review:${targetId}` — decision OMITTED (service:157).
  - Decision write is status-guarded: `updateMany WHERE { id, status: 'draft' }`
    (service:92-95); `count === 0` → `alreadyDecided` 409 (service:96).
  - Approve→reject, same default key: second call hits the `completed` ledger row
    → `replay` → `fromLedger` returns the FIRST (`approved`) decision; reject
    `apply()` never runs. First decision wins, no silent overwrite.
  - Approve→reject with a DISTINCT explicit key: second `apply()` runs but
    `updateMany WHERE status=draft` matches 0 (row already published) →
    `alreadyDecided` 409. Still no overwrite. Both paths sound.
  - Directly covered by service spec tests (P1-3 default-key + replay-first +
    already-decided-conflict).
- **NaN guard (P3-5): VERIFIED.** `clampReviewLimit(undefined | NaN)` returns
  `ADMIN_REVIEW_DEFAULT_LIMIT` (cursor:50). Covered by cursor spec.
- **Input validation:** Global `ValidationPipe { whitelist, forbidNonWhitelisted,
  transform }` (main.ts:117). `ReviewDecisionDto.decision` is `@IsIn(['approved',
  'rejected'])`; `note`/`idempotency_key` bounded `@MaxLength`. `limit`
  `@IsInt @Min(1) @Max(50)` with `@Type(()=>Number)`. Only gap is `status`
  (see P2-1).
- **Banned tokens:** CLEAN. grep of `@ts-ignore | as any | as unknown as |
  as never | .catch(()=>undefined) | Coming soon` across the 4 prod files + 3
  specs returns no matches. Prior audit's test `as never` request stubs were
  replaced with the sanctioned `Pick<User,'id'> as User` narrow cast
  (controller spec:19). The two enum/Prisma casts in the service
  (`as Prisma.*WhereInput['status']`) are narrow concrete casts (allowed), not
  blanket `as any`.
- **R74 identity:** PASS. `git log origin/main..HEAD` author/committer/body free
  of AI/Claude/Computer/Co-Authored/Agent tokens. Single commit `409a4bfa`,
  author + committer `bradley <bradley@bradleytgpcoaching.com>`.
- **LOC:** 436 prod LOC — over the 400 review cap (see P3-1). No CI enforcement.
- **Shared helper exports:** `keysetWhere`, `page`, `review`, `notFound`,
  `alreadyDecided`, `toLedgerJson`, `fromLedger`, `LISTING_ROUTE_KEY` all
  exported. `keysetWhere`/`page`/`fromLedger`/`toLedgerJson` are pure; `review`
  takes the idempotency service as a param (no hidden state). RLS-safe — none
  issue raw SQL or bypass scoping. 7b importing these is sound.
- **Build:** NOT RUN LOCALLY — sandbox toolchain is stubbed/incomplete. `npx tsc`
  resolves to a placeholder binary ("This is not the tsc command you are looking
  for"); `node_modules/typescript/lib/tsc.js` is absent and the fallback
  `_tsc.js` is a truncated file that fails to parse (SyntaxError at line 5970);
  `node_modules/.bin/` is missing entirely. Type-correctness was therefore
  verified by manual reading: the two service casts are narrow
  `as Prisma.*WhereInput['status']`, all DTO imports are `import type`, the
  `review` wrapper's generics line up with `ReviewDecisionResult`, and no `any`
  leaks. CI is the authoritative gate (already green per brief). Informational.
- **Tests:** NOT RUN LOCALLY — same sandbox limitation. `node jest/bin/jest.js`
  fails with `Cannot find module 'yargs'` out of `jest-cli/build/index.js` (the
  hoisted dependency tree is incomplete; no nested or resolvable `yargs`). Spec
  *coverage* was instead verified by reading the three spec files: the P1-3
  default-key/replay-first/already-decided cases, the owner-only controller
  security pins, and the P3-5 clamp case are all present and assert the behaviors
  this audit verified by code-trace. CI is the authoritative gate. Informational.
