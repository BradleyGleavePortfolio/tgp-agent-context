# TM-7a audit — Lens B (tests / contracts / cycle / file ownership) — SHA 409a4bfa

## Verdict: FINDINGS (P2/P3 only — no blockers to correctness; LOC over cap)

## Findings

### P2-1 — Ledger WRITE shape (`toLedgerJson`) is never asserted by a test
**File:** src/talent-marketplace/__tests__/admin-moderation.service.spec.ts (whole file)
**Issue:** The replay test (line 179) hand-feeds a `{id,status,decision}` blob
into `claimOrReplay` and asserts `fromLedger` reconstructs it. But nothing
asserts that the *write* side — `toLedgerJson(result)` passed to
`markCompleted` (service line 173-177) — actually stores all three fields.
`toLedgerJson`/`fromLedger` are a contract pair; only the read half is pinned.
A regression dropping `decision` from `toLedgerJson` would leave every test
green yet make every real replay throw `review_replay_corrupt`. Brief Lens B
item 8 explicitly requires verifying the stored row carries the full result.
**Recommended fix:** In the "approves a draft listing" test, capture the
`markCompleted` mock and assert its 3rd arg equals `{id:'list-1',
status:'published', decision:'approved'}`.

### P2-2 — `fromLedger` corrupt-row branch (`review_replay_corrupt`) untested
**File:** src/talent-marketplace/admin-moderation.service.ts:216-237 (exported helper)
**Issue:** `fromLedger` throws a `ConflictException{code:'review_replay_corrupt'}`
for a null/array/missing-field ledger value. This is an exported helper that
TM-7b will also depend on, and it is the only guard against a corrupt ledger
row smuggling an off-shape object to the client — yet no test exercises the
throw branch (only the happy path via the replay test).
**Recommended fix:** Add a unit test importing `fromLedger` directly and assert
it throws `review_replay_corrupt` for `null`, `[]`, and `{id:1}` (wrong type).

### P3-1 — Shared helpers `keysetWhere` / `page` have no direct unit test
**File:** src/talent-marketplace/admin-moderation.service.ts:111-142 (exported helpers)
**Issue:** Both are exported for TM-7b reuse but covered only indirectly through
`listListings`. The cursor-boundary tuple predicate built by `keysetWhere`
(the `OR[created_at lt | (created_at eq, id lt)]` shape) is never asserted —
a regression in the tuple comparison would not be caught by the current
indirect tests (which pass `{}`/no cursor or only count items). R81 marks P3
as must-fix-before-merge.
**Recommended fix:** Add a direct test for `keysetWhere({cursor}, {})` asserting
the emitted `AND[0].OR` tuple shape, and a `page` test asserting it slices to
`limit` and emits a cursor only when `rows.length > limit`.

## Checks passed
- **File ownership:** all 8 changed files within `src/talent-marketplace/`; only
  `talent-marketplace.module.ts` is the cross-file wiring touch (expected,
  additive — adds AdminModerationController/Service + OwnerGuard provider). PASS.
- **Cycle:** no import cycle inside 7a. controller→{dto,service}; service→
  {cursor,dto,idempotency,prisma}; dto→class-validator/transformer; cursor is a
  pure module (zero imports). No import from 7b (admin-applications.*) anywhere.
  No out-of-boundary import for new logic (only framework/auth/common guards). PASS.
- **DTO contracts:** input DTOs (`ReviewQueueQueryDto`, `ReviewDecisionDto`) are
  classes (required for class-validator). Response DTOs (`ListingReviewCardDto`,
  `ReviewQueueResponse<T>`, `ReviewDecisionResult`) are `interface` — allow-list
  shapes, no hidden methods. `listListings` projects an explicit card (service
  62-68) — no raw entity spread; test at spec line 53-57 asserts exact key set
  and that `owner_id`/`internal_notes` do not leak. PASS.
- **Idempotency contract (P1-3 fix) — VERIFIED BY TESTS:**
  - default idem-key omits decision: spec line 168 asserts key === `review:list-1`
    and `not.toContain('approved')`. ✅
  - status-guarded write: spec line 141-144 asserts `updateMany.where ===
    {id, status:'draft'}`. ✅
  - approve→reject returns FIRST decision: spec line 179-192 (replay outcome)
    asserts `res.decision==='approved'`, `res.status==='published'`,
    `replayed===true`, and `updateMany` NOT called. ✅ This is the headline fix
    and it is correctly tested.
  - second-decision-on-decided-row conflict + claim release: spec line 194-204. ✅
- **NaN guard (P3-5 fix) — VERIFIED BY TEST:** spec admin-review-cursor line 56
  asserts `clampReviewLimit(NaN) === ADMIN_REVIEW_DEFAULT_LIMIT`. ✅
- **Cursor round-trip + tamper tests:** round-trip (line 17-26), opaque blob
  (28-35), 6 tamper cases incl. empty/no-delim/bad-date/raw-garbage all → null
  (38-49), clamp MIN/MAX/truncate/default (51-72). PASS.
- **Banned tokens (prod + tests):** clean. The two prior `as never` request
  stubs are now `ownerReq()` using `{id} as Pick<User,'id'> as User` (controller
  spec line 18-20) — sanctioned narrow concrete cast, not banned. Prod `as`
  casts (`query.status as Prisma...status`, `value as Record<string,unknown>`,
  `as const`) are all narrow/concrete. PASS.
- **R74 identity:** IDENTITY_OK — single commit, author+committer bradley, no
  AI/Claude/Computer/Co-Authored/Agent tokens in message/body.

## Pending
- LOC verdict (prod = 436, OVER 400 hard cap — see below)
- Build + targeted test run
