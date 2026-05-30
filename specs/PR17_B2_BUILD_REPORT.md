# PR-17 B2 — Build Report

**Unit:** B2 — package push service + endpoints + DTO (per-content push/backfill + re-send).
**Repo:** `growth-project-backend` (BradleyGleavePortfolio, private).
**Branch:** `pr17/b2-push-endpoint` (off fresh `origin/main` HEAD `e0317d9`).
**Worktree:** `/home/user/workspace/wt-pr17-b2` (isolated; main repo READ-ONLY).
**Final HEAD commit:** `ee0432e8d3666a38a08f243b27203b85877db1d6`.
**PR:** [#330](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/330) (vs `main`).

Commits on branch (oldest → newest):

| SHA | Subject |
| --- | --- |
| `62aee5d` | PR-17 B2: package push service + endpoints + DTO |
| `ee0432e` | PR-17 B2: tests for push service (audience/chunking/push_seq/resend/idempotency/notify/no-Stripe/key-bypass) |

---

## Scope (per brief)

Owned files only. Did **NOT** touch `prisma/schema.prisma`, any migration,
`drip-dispatcher.cron.ts` (B1 owns it), `src/billing/*`, `src/connect/*`,
`ai*`, or any mobile file. No feature flag. `computeFireAt` not rewritten
(the push path deliberately schedules on the coach-chosen date per #2, so it
does not call it — see Deviations).

| File | Piece |
| --- | --- |
| `src/packages/package-push.service.ts` (NEW) | `PackagePushService` — 9-step algorithm |
| `src/packages/package-contents.dto.ts` | appended push zod schemas |
| `src/packages/package-contents.controller.ts` | appended the 2 FROZEN endpoints |
| `src/packages/packages.module.ts` | registered `PackagePushService` |
| `test/package-push.service.spec.ts` (NEW) | 23 cases |

---

## File:line per piece

### DTO (`src/packages/package-contents.dto.ts`)
- `PUSH_AUDIENCES` / `PushAudience` — `:198-199`.
- `PUSH_MODES` / `PushMode` — `:204-205`.
- `PushRequestSchema` (`.strict()` + `superRefine` enforcing `cohort_purchase_ids` required iff `audience==='cohort'`, rejecting a stray cohort list otherwise; `fire_at` ISO-8601 refine; `notify` default `true`) — `:212-245`.
- `PushPreviewQuerySchema` — `:251-259`.

### Controller (`src/packages/package-contents.controller.ts`)
- `GET :contentId/push/preview` → `pushPreview()` — `:131-156`. Parses query via `PushPreviewQuerySchema` (400 on invalid), `resolveEffectiveCoachId`, returns `{ count, audience, already_delivered }`.
- `POST :contentId/push` → `pushToExisting()` — `:162-199`. Reads `Idempotency-Key` header (`@Headers('idempotency-key')`), parses body via `PushRequestSchema` (400 on invalid), returns `{ scheduled, skipped, fire_at, audience, notify }`.
- Both inherit the controller's `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard, SubscriptionGuard)` + `@Roles('coach','owner')`. IDOR via `resolveEffectiveCoachId` (controller) + `requireOwnedPackage` (inside the service, mirroring the authoring service pattern). Route ordering is safe: the two new routes are GET/POST on distinct paths and never collide with the existing `@Patch(':contentId')` / `@Delete(':contentId')`.

### Service (`src/packages/package-push.service.ts`)
- `SHIPPED_STATUSES = ['fired','delivered']` + `isShipped()` helper — `:58-63` (G4 single source of truth).
- `CHUNK_SIZE = 500` — `:68`.
- `previewPush()` — `:106-152` (pure read; IDOR + content existence; audience resolve; per-buyer count + `already_delivered`).
- `pushContentToExistingBuyers()` — `:155-362` (the 9-step algorithm).
- `resolveAudience()` — `:384` (§2.6 scoping + cohort IDOR re-filter by `package_id`).
- `buildSeedRow()` — seed shape incl. `fire_at`=coach date, `push_seq`, and the notify pre-stamp at `:430`.

### Module (`src/packages/packages.module.ts`)
- Import `:9`; registered in `providers` `:50` and `exports` `:59`.

---

## #5 resolver-key-bypass proof (the single most fragile rule)

`src/packages/package-push.service.ts:319-330`:

```ts
const isResend = drop.push_seq > 0;
const result = await this.resolvers.materialise(drop.asset_type, {
  clientId: purchase.client_user_id,
  coachId: purchase.coach_user_id,
  assetId: drop.asset_id,
  assetRevisionId: drop.asset_revision_id ?? null,
  displayTitle: drop.display_title,
  displayCaption: drop.display_caption,
  scheduledDropId: drop.id,
  clientPurchaseId: isResend ? null : purchase.id,   // pair iff push_seq===0
  contentId: isResend ? null : drop.content_id,      // omitted for push_seq>0
  tx: tx as Prisma.TransactionClient,
});
```

This is the SAME conditional B1 applied in the cron. For an original/backfill
drop (`push_seq===0`) the stable `(clientPurchaseId, contentId)` pair is passed
so the resolver markers preserve PR-9 R1 rollback-retry idempotency. For a
re-send (`push_seq>0`) ONLY `scheduledDropId` is passed and the pair is OMITTED,
so `auto-message.resolver` skips its `DripResolverMarker` and `workout.resolver`
falls back to the per-drop key → a genuinely FRESH delivery, not a cached no-op.

**Test proof** (`test/package-push.service.spec.ts`):
- "push_seq===0 backfill → resolver called WITH the pair" asserts `input.clientPurchaseId==='p1'` and `input.contentId==='content-1'`.
- "push_seq>0 resend → resolver called WITHOUT the pair (scheduledDropId only)" asserts `input.clientPurchaseId===null` AND `input.contentId===null` while `input.scheduledDropId` is set.
- "forward-dated push does NOT materialise inline" asserts `resolvers.materialise` is never called and the row stays `pending` / `materialised_ref===null` (the cron picks it up when due).

---

## Chunked-tx + NO-Stripe invariant

`src/packages/package-push.service.ts:263-345` opens exactly ONE
`this.prisma.$transaction(async (tx) => …)` and inside it loops
`for (i; i<seedRows.length; i += CHUNK_SIZE)` calling
`tx.scheduledDrop.createMany({ data: chunk, skipDuplicates: true })` per chunk
of ≤500, then re-reads the seeded rows and materialises the due-now subset
inline within the SAME tx. No second top-level tx is opened.

**NO-Stripe invariant** is documented in the service file header (`:15-31`).
The push path only touches `coachPackageContent`, `clientPurchase`,
`scheduledDrop`, and the PR-7 asset resolvers — none of which construct a
Stripe/billing client. **Test proof:** the prisma stub exposes `billing` /
`stripe` getters that flip a `touched` flag if accessed; the "never touches a
Stripe / billing client" case asserts `touched===false` after a due-now push.

---

## Idempotency proof (#8)

Two layers (§1.4):
1. **Request layer** — the mutation `Idempotency-Key` UUID header is read by the
   controller (`@Headers('idempotency-key')`) and forwarded to the service
   (logged at `:177-180`).
2. **DB layer** — `push_seq` is computed DETERMINISTICALLY per (purchase,
   content) from the current max INSIDE the seed loop (`push_existing`→`0`;
   `resend`→`maxSeq+1`, `:236`), and `createMany({ skipDuplicates: true })`
   dedups on the `(client_purchase_id, content_id, push_seq)` unique key. A
   replayed identical request re-derives the SAME `push_seq`, so the insert is a
   true no-op. `scheduled` is reported from the rows that exist at the target
   seq (`seededDropIds.length`, `:362`), not the candidate count.

**Test proof:** "a replayed identical push is a true no-op" runs the same push
twice with `idem-key-1`; asserts `_drops.length` is unchanged after the replay
and the second call returns `scheduled:0, skipped:2` (push_existing now sees the
existing seq-0 row for each buyer and skips).

---

## Other correctness rules

- **G4 (§2.3):** `SHIPPED_STATUSES=['fired','delivered']` centralized (`:58`). `push_existing` skips a buyer with ANY existing drop for the pair (`:226-231`); `resend` only targets buyers whose LATEST drop is shipped via `latestIsShipped()` and inserts at `max+1` (`:233-247`). Tested by the push_seq/resend-vs-unique cases and the resend-to-seq-2 case.
- **#2/#6 coach date + past-date 400:** `fire_at` is used DIRECTLY as the drop's `fire_at` (`:428`, no double-normalize); `fireAt < startOfToday` throws `BadRequestException` (`:181-185`). Tested.
- **#9 notify suppression:** `buildSeedRow` stamps `alert_dispatched_at = new Date()` when `notify===false` (`:430`), so B1's `dispatchBuyerAlert` gate skips the push; inline alerts are only dispatched when `notify===true` (`:351`). Tested: notify=false stamps the column and sends no inline alert; notify=true forward-dated leaves it NULL.
- **IDOR cohort:** `resolveAudience` always scopes `where.package_id = packageId` and, for cohort, adds `id IN cohortPurchaseIds` — a foreign-package purchase id is filtered out. Tested: "cohort ignores purchase ids that belong to another package" (only `p1` seeded, `p-foreign` dropped).
- **Immutable fired drop (§6.5):** re-send creates a NEW `max+1` row; the original shipped row is untouched. Tested: "resend leaves the original shipped row byte-identical".

---

## Verification (real, in the worktree after `npm ci` + `prisma generate`)

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit -p tsconfig.json` | exit 0 — clean |
| Lint | `npm run lint` | exit 0 — 0 errors, 17 pre-existing warnings (none in touched files) |
| Targeted spec | `npx jest test/package-push.service.spec.ts` | **23 passed** |
| Package+drip+fanout specs | `npx jest` (6 related suites) | **153 passed** |
| Full suite | `npx jest` | **302 suites passed; 3649 passed, 20 skipped, 5 todo; 0 failures** |

---

## Deviations from the brief

- **`computeFireAt` not invoked:** §2.2 step 4 says "reuse `computeFireAt` only for the immediate/past normalization." Per decision #2 the coach-chosen `fire_at` OVERRIDES cadence-derived timing, and the server-side past-date guard rejects `fire_at < startOfToday` outright (rather than normalizing a past date to now). The due-now decision is therefore a simple `fire_at <= now` comparison inside the tx, which makes a call to `computeFireAt` unnecessary on this path. The fan-out engine is NOT modified or rewritten — this is purely "did not call it," consistent with "do not rewrite the fan-out engine." cadence fields are still snapshotted onto each seed row for buyer-side display + consumer routing.
- **Inline alerts dispatched directly via `NotificationsService`** (mirroring the cron's `dispatchBuyerAlert` envelope) rather than through `PurchaseFanoutService`'s pending-alert bucket, because the push path has no Stripe outer tx / `flushAlerts` call site. Failure-isolated (post-commit, swallows errors) so a notification blip never reaches back into the seed tx. notify=false drops are pre-stamped and excluded.
- **Report path:** written to `/home/user/workspace/repos/tgp-agent-context/specs/PR17_B2_BUILD_REPORT.md` per the spawning message.

No other deviations. Scope held exactly; B1-owned and forbidden files untouched.

---

## For the auditor

- **PR:** #330 (vs `main`).
- **SHA-pin:** `ee0432e8d3666a38a08f243b27203b85877db1d6`.
- This report is a builder record, NOT a verdict (R1 §4). An independent
  `gpt_5_5` audit re-checks at the PR head SHA above.
