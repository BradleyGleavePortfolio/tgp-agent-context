# TM-7 Lens B Audit @ 6a376a3b

**Scope:** tests, contracts, cycle awareness, LOC cap, file ownership, module wiring.
**Repo:** BradleyGleavePortfolio/growth-project-backend
**Head SHA:** `6a376a3bbf9d7d917cbdf8f3ec9d42fc6db19004`
**Base:** `origin/main`

## Verdict: FINDINGS

## Identity check: IDENTITY_OK
```
bradley <bradley@bradleytgpcoaching.com> | TM-7: admin moderation cursor, dto, service, controller + module wiring
bradley <bradley@bradleytgpcoaching.com> | TM-7: scaffold admin moderation controller (WIP)
```
Both commits in `origin/main..6a376a3b` authored by `bradley <bradley@bradleytgpcoaching.com>`. No `Co-Authored-By`, no AI/Claude/Agent attribution found.

---

## Findings (numbered)

### B-LENS-P0-1: Mandatory test suite entirely missing — zero specs added
- files: (none — no `src/talent-marketplace/__tests__/admin-*.spec.ts` exist)
- evidence:
  ```
  $ git diff --name-only origin/main..6a376a3b | grep -i spec
  NONE
  $ ls src/talent-marketplace/__tests__/ | grep -i admin
  NO ADMIN SPECS
  ```
  The brief mandates three spec files:
  - `admin-moderation.controller.spec.ts` (owner-guard 403/200)
  - `admin-moderation.service.spec.ts` (claim-or-replay idempotency, pagination invariants)
  - `admin-review-cursor.spec.ts` (round-trip encode/decode, tamper detection, cap enforcement)

  None were committed. Sibling lanes ship the analogous specs (`application-cursor.spec.ts`, `public-listing.cursor.spec.ts`, `public-listing.service.spec.ts`, `public-listing.controller.http.spec.ts`), so this is a deviation from the established lane contract, not an absent convention.
- impact: No public method has a spec. The brief's required contract tests are all absent: idempotency-replay (same idem-key returns first decision), cursor round-trip, and tamper-detection. CI required check `build-and-test` cannot exercise this lane; any regression in `claimOrReplay` wiring, cursor parsing, or guard enforcement ships unverified. This is the central deliverable of Lens B and is a hard P0 fail.
- recommended fix: Add the three specs. At minimum: (a) controller spec asserting `OwnerGuard` rejects non-owner with 403 and allows owner; (b) service spec asserting `claimOrReplay` `replay` outcome returns the first decision verbatim with `replayed:true` and does NOT re-call `apply()`, plus a `keysetWhere`/`page` pagination boundary test; (c) cursor spec asserting `buildReviewCursor`→`parseReviewCursor` round-trips, that tampered/garbage input returns `null` (degrade to page 1), and `clampReviewLimit` caps at 50 / defaults at 20 / floors at 1.

### B-LENS-P0-2: Prod LOC delta 476 > 210 cap (2.27× over)
- files: all five changed files
- evidence:
  ```
  $ git diff --numstat origin/main..6a376a3b -- 'src/' ':!src/**/__tests__/**'
  added=476 deleted=0 net=476
  ```
  Per-file: controller 78, dto 85, service 258, cursor 49, module 6.
- impact: Hard cap breach. The brief states "≤ 210 prod LOC delta … If close to cap, drop optional features — never safety checks." 476 is more than double the ceiling. The service alone (258) exceeds the whole-lane budget.
- recommended fix: Reduce to ≤210. Candidates: collapse the two near-identical `reviewListing`/`reviewApplication` methods and their `apply` closures into one table-driven path; trim header doc comments (large fraction of the count is prose comments); inline the `ListingReviewCardDto`/`ApplicationReviewCardDto` mappers. Note: comment-heavy files still count — measured delta is the binding number.

### B-LENS-P1-3: No state-guard on review transition — a decided row can be re-decided to the opposite state
- file: `src/talent-marketplace/admin-moderation.service.ts:92-140` (`reviewListing` / `reviewApplication`)
- evidence:
  ```ts
  const idempotencyKey =
    dto.idempotency_key?.trim() || `review:${targetId}:${dto.decision}`;   // service.ts:152-153
  ...
  const updated = await this.prisma.jobListing.update({
    where: { id: listingId },
    data: { status: LISTING_NEXT[dto.decision] },   // service.ts:103-106 — no current-status check
  ```
  The default idempotency key includes `dto.decision`. So `approve` then a later `reject` on the same listing produces a *different* idem key (`review:<id>:approved` vs `review:<id>:rejected`), bypasses replay, and the `update` re-runs unconditionally — flipping a `published` listing to `closed` (or a `rejected` application to `shortlisted`). There is no `where: { status: <expected> }` predicate and no "already decided" rejection.
- impact: The "atomic claim-or-replay" only dedupes *identical* decisions; it does not make the review terminal. An admin (or a replayed-but-mutated request with a fresh key) can overturn a finalized decision silently. Contract/idempotency intent ("returns the FIRST decision verbatim instead of re-applying") is only half-satisfied — replay protects same-decision double-taps but not decision reversal. There is also no idempotency-replay test to catch this (see B-LENS-P0-1).
- recommended fix: Either (a) scope the `update` to the expected source state (`where: { id, status: { in: [<reviewable states>] } }` and treat zero-rows-updated as a typed `409 already_reviewed`), or (b) key the ledger on `(target, route)` without `decision` so any second review of the same item replays the first. Add a service spec covering "second differing decision is rejected / replayed."

### B-LENS-P2-4: Contract not enforced by tests — error envelope, cursor round-trip, tamper, idempotency all unverified
- files: service `:159-163, :219-225, :253-257`; cursor `:27-49`
- evidence: The service emits correct `{ error, message, code }` envelopes (`review_in_flight`, `listing_not_found`, `application_not_found`, `review_replay_corrupt`) and the cursor degrades-to-null on tamper — but there is no test asserting any of it. The brief explicitly requires: "error envelope … enforced in tests AND service; idempotency-replay tests exist; cursor round-trip tests exist; tamper-detection tests exist." Only the "service" half is present.
- impact: The envelope shape and tamper-tolerance are correct *today* but unprotected against regression. A future edit reverting to a `{ kind }` envelope or throwing on a bad cursor would pass CI. Contract is asserted by code-reading only, not by the suite.
- recommended fix: Folded into B-LENS-P0-1 — the added specs must assert the literal envelope keys (`expect(err.getResponse()).toMatchObject({ error, message, code })`) and the cursor null-on-tamper / round-trip behavior.

### B-LENS-P3-5: `clampReviewLimit` returns NaN for NaN input (defensive gap, not currently reachable via HTTP)
- file: `src/talent-marketplace/admin-review-cursor.ts:46-49`
- evidence:
  ```ts
  export function clampReviewLimit(limit: number | undefined): number {
    if (limit === undefined) return ADMIN_REVIEW_DEFAULT_LIMIT;
    return Math.min(Math.max(limit, 1), ADMIN_REVIEW_MAX_LIMIT);  // Math.max(NaN,1) === NaN
  }
  ```
  `clampReviewLimit(NaN)` → `NaN`; `take: NaN + 1` would be `NaN`. The HTTP path is protected (`ReviewQueueQueryDto.limit` is `@IsInt @Min(1) @Max(50)` so NaN is rejected at the boundary), so this is not exploitable today — but the function is exported and would be called directly by its (missing) unit spec, which is exactly where the gap should be caught.
- impact: Latent footgun if the function is ever called outside the validated DTO path. Low severity; must be fixed before merge per R81.
- recommended fix: Guard NaN explicitly: `if (limit === undefined || Number.isNaN(limit)) return ADMIN_REVIEW_DEFAULT_LIMIT;` and assert it in the cursor spec.

---

## Cycle analysis: CLEAN
- `claimOrReplay` re-entry: no deadlock. The flow is claim → `apply()` (single Prisma `findUnique` + `update`, no recursion back into the moderation service) → `markCompleted` / on-throw `releaseClaim`. No request→handler→request cycle, no nested claim on the same key, no mutex held across the `apply()` await in a way that blocks its own completion. `markCompleted`/`releaseClaim` are compare-and-set on `claim_nonce` (fencing), returning a typed `conflict` rather than blocking — a reclaimed/raced caller cannot deadlock, it returns `{...result, replayed:true}` (service.ts:174) or rethrows. No circular import among the five files (cursor ← service ← controller; module imports all; idempotency + guard are pre-existing).

## File ownership: CLEAN
All five modified files are within the brief's exclusive-ownership list. No cross-lane file touched (`git diff --name-only` lists only the four NEW TM-7 files + the module). `OwnerGuard` and `roles.decorator` are *imported* from `common/` but no `common/` file is modified — consistent with "reuse, do not redefine."

## Module wiring: CLEAN (additive)
`talent-marketplace.module.ts` diff is purely additive: appends `AdminModerationController` to `controllers`, `AdminModerationService` + `OwnerGuard` to `providers`, with three new imports. No existing registration for TM-2/3/4/5/6/14 removed or reordered. `exports` unchanged.

## Build/typecheck note
`tsc --noEmit` could NOT be executed in the audit sandbox (the installed `typescript` module was incomplete — `lib/tsc.js` missing — and network refetch failed). Type-soundness was instead verified by static read: the new code references only well-defined Prisma types (`Prisma.JobListingWhereInput`, `Prisma.InputJsonValue`, `Prisma.JsonValue`), the local DTO interfaces, and the idempotency discriminated union (`ClaimOrReplayResult` / `ClaimWriteResult`); the `claimKey` object structurally matches the private `ClaimKey` interface. No banned tokens present. I cannot positively assert a green compile — flagging that the builder/CI must confirm `build-and-test`.

---

## Summary (SHA-pinned)
At `6a376a3b`, TM-7 is **NOT mergeable** on Lens B grounds. Two P0 violations: (1) all three mandatory spec files are absent — no test coverage of owner-guard, idempotency-replay, cursor round-trip, or tamper-detection; (2) prod LOC delta is 476, 2.27× over the 210 cap. One P1: review transitions lack a state-guard, so a decided row can be flipped to the opposite state via a differing-decision request (default idem-key includes the decision). One P2 (contract unenforced by tests, subsumed by P0-1) and one P3 (`clampReviewLimit` NaN gap). Identity, file-ownership, module-wiring (additive), and cycle-safety are all CLEAN. Build could not be verified in-sandbox (broken tsc install).
