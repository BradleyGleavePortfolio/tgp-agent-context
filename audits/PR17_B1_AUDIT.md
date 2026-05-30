# AUDIT — PR-17 B1: ScheduledDrop.push_seq re-send engine (PR #328)

VERDICT: CLEAN

Audited SHA: `7307778` (branch `pr17/b1-push-seq-engine`, base merge-base `3f7ab76`).
Verdict is SHA-bound — if the branch moves, re-audit.
Worktree: `/home/user/workspace/audit-pr17-b1` (detached at `7307778`).

Typecheck: **pass** — `npx tsc --noEmit -p tsconfig.json` → exit 0, 0 errors.
Lint: **pass** — `npx eslint src/packages/drip-dispatcher.cron.ts` → exit 0, 0 errors/0 warnings.
Schema: **valid** — `prisma generate` (in `npm install` postinstall) succeeded; `npx prisma validate`
with dummy `DATABASE_URL`/`DIRECT_URL` → "The schema at prisma/schema.prisma is valid". (Bare
`prisma validate` only fails on the pre-existing missing-env-var `DIRECT_URL` — unrelated to this PR.)
Tests: **pass** —
- `npx jest test/drip-dispatcher.cron.spec.ts` → **28 passed / 28** (1 suite). Includes the 5 new
  B1 tests (push_seq===0 keeps pair; push_seq>0 omits pair; pre-stamped → silent; NULL → alert+stamp;
  forward-dated re-send waits).
- Regression: `jest` over the 4 resolver specs + `purchase-fanout.service` + `purchase-fanout-rollback-retry`
  + `drip-trigger.service` + `packages.service` → **93 passed / 93** (8 suites).
- Total across both runs: **121 passed / 121**.

Changed files (vs merge-base `3f7ab76`): exactly four —
`prisma/migrations/20261209000000_pr17_scheduled_drop_push_seq/migration.sql` (new),
`prisma/schema.prisma`, `src/packages/drip-dispatcher.cron.ts`, `test/drip-dispatcher.cron.spec.ts`.
No B2-owned file touched (`package-push.service.ts`, `package-contents.dto.ts`,
`package-contents.controller.ts`, `packages.module.ts` — all absent from the diff). No `ai*` file touched.

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking)
- **[migration.sql:33-34]** The new unique index is created without `IF NOT EXISTS`. Not a defect —
  Prisma migrations are forward-only and run once — but if this migration is ever hand-replayed against
  a DB that already has the index (e.g. manual rollback experimentation) the `CREATE UNIQUE INDEX` will
  error where the `DROP INDEX IF EXISTS` above it would not. Cosmetic only; leave as-is to match the
  Prisma-generated form (so `migrate diff` stays drift-free).
- **[drip-dispatcher.cron.ts:415]** The suppression guard reads `drop.alert_dispatched_at` from the
  row as fetched by `findDue` (claim-time snapshot), not a fresh re-read. This is correct for every
  documented path (normal drop = NULL at seed; B2 pre-stamp = set at seed; reclaim of an
  already-alerted row = correctly suppressed). Noting only that the guard's correctness depends on
  `findDue` selecting the full row (it uses `findMany` with no `select`, so the column is present) —
  if a future change adds a narrowing `select`, the guard would silently read `undefined` and stop
  suppressing. No action now; a comment pinning that dependency would harden it.

## Verification of PR claims

1. **"Migration is fully additive — ADD COLUMN push_seq INTEGER NOT NULL DEFAULT 0"** →
   **verified true.** `migration.sql:31` `ALTER TABLE "ScheduledDrop" ADD COLUMN "push_seq" INTEGER
   NOT NULL DEFAULT 0;` — metadata-only ALTER, DEFAULT applies to all existing rows, no backfill
   script, no type change. `schema.prisma:4738` `push_seq Int @default(0)` matches.

2. **"DROP INDEX matches the REAL Prisma-generated unique index name"** → **verified true.** The
   dropped name `ScheduledDrop_client_purchase_id_content_id_key` is the exact name created in the
   foundation migration `20261202000000_pr3_drip_schema_foundation/migration.sql:121`
   (`CREATE UNIQUE INDEX "ScheduledDrop_client_purchase_id_content_id_key" ON "ScheduledDrop"(...)`).
   The new name `ScheduledDrop_client_purchase_id_content_id_push_seq_key` follows Prisma's
   `<Model>_<col>_<col>_<col>_key` convention for `@@unique([client_purchase_id, content_id, push_seq])`.

3. **"No migrate-diff drift"** → **verified true (structurally).** `prisma generate` and
   `prisma validate` (with env supplied) both pass; the schema's `@@unique` now lists three columns
   matching the migration's three-column index, and the index name matches Prisma's generator output.
   (Could not run `prisma migrate diff` against a live shadow DB — no database in this sandbox — but
   schema↔migration name/column parity is confirmed by inspection and a clean `prisma generate`.)

4. **"Migration is the next sequential dir"** → **verified true.** `20261209000000_pr17_...` sorts
   after the prior latest `20261208000000_pr15_coach_new_purchase_prefs`.

5. **"Fan-out createMany({ skipDuplicates: true }) still dedups seq-0 originals"** → **verified true.**
   `purchase-fanout.service.ts:281-284` seeds rows without setting `push_seq`, so every seeded row
   takes DB DEFAULT 0. With the widened key `(client_purchase_id, content_id, push_seq)`, a webhook
   replay's duplicate `(pair, 0)` rows still collide and are skipped exactly as before — the prior
   2-column uniqueness is preserved as the `(pair, 0)` subset. Covered by the green
   `purchase-fanout.service` / `purchase-fanout-rollback-retry` suites.

6. **"push_seq===0 (original) drop materialises WITH the (clientPurchaseId, contentId) pair"** →
   **verified true.** `drip-dispatcher.cron.ts:359-360` `clientPurchaseId: isResend ? null : purchase.id`
   / `contentId: isResend ? null : drop.content_id` with `isResend = drop.push_seq > 0` (`:344`). For
   push_seq===0 both are passed, preserving PR-9 R1 rollback-retry idempotency. Asserted by the new
   "push_seq === 0 ... WITH the stable pair" test.

7. **"push_seq>0 (re-send) drop materialises WITHOUT the pair — scheduledDropId only — fresh delivery"**
   → **verified true, and the fresh-delivery claim holds end-to-end across all resolvers:**
   - **auto_message** (`auto-message.resolver.ts:106-122`): `useMarker = !!(purchaseId && contentId)`;
     with both null the marker is SKIPPED and a fresh `sendAsCoach` fires. No collapse.
   - **workout** (`workout.resolver.ts:121-133`): `buildIdempotencyKey` uses the pair key only when both
     are set; otherwise falls back to `drip:workout:{clientId}:{assetId}:{scheduledDropId}`. Each re-send
     is a distinct `scheduledDropId` → distinct ledger key → fresh assignment. No collapse.
   - **meal_plan** (`meal-plan.resolver.ts:75-145`): keyed on `drip_drop_id = scheduledDropId` (per-drop
     `@unique`), independent of the pair → fresh per re-send row. No collapse.
   - **media** (`media-asset.resolver.ts:118-134`): keyed on `@@unique([client_id, media_asset_id])`;
     a re-send of the SAME asset collapses to the existing `ClientAssetGrant`. This is NOT pair-driven,
     so the bypass does not change it. **This collapse is EXPECTED and acceptable** per
     PR17_EXPANSION_PLAN.md risk #6 (buyer already has access; the re-send's value is the new
     fire_at/notification, not a duplicate grant). The PR's comment at cron.ts:337-343 documents this
     accurately. **No silent-collapse-to-cached defect found** in the pair-driven (auto_message/workout)
     paths the bypass is meant to fix.

8. **"Notify-suppression guard skips DRIP_RELEASED ONLY when alert_dispatched_at is pre-set, and does
   NOT suppress normal drip alerts"** → **verified true.** `drip-dispatcher.cron.ts:415-420` returns
   early iff `drop.alert_dispatched_at != null`, BEFORE any send and before the re-stamp (so a pre-set
   timestamp is preserved untouched). Normal drops are NULL at seed (fan-out + PR-10 never pre-stamp),
   so they send + then stamp at `:484-488`. Both branches asserted by the two new notify-suppression
   tests (pre-stamped → 0 sends, timestamp unchanged; NULL → pushToUser×1 + createNotification×2 + stamped).

9. **"findDue / claim / backoff unchanged; forward-dated drops wait correctly"** → **verified true.**
   The diff touches only lines 314-363 (resolver-key bypass) and the `dispatchBuyerAlert` guard/JSDoc;
   `findDue` (`:183-222`, gate `fire_at: { lte: now, not: null }`, `orderBy fire_at asc`), the atomic
   claim (`:224+`), the stranded-dispatching reclaim path, and `handleDispatchFailure` backoff are
   byte-unchanged. The new "forward-dated re-send waits" test asserts `claimed=0` / resolver not called
   for a future `fire_at`.

10. **"No Stripe in any tx"** → **verified true.** No Stripe SDK call anywhere in the cron path; the
    only occurrence of "stripe" in `drip-dispatcher.cron.ts` is a prose comment (`:36`). The success
    path commits `materialised_ref` via `prisma.scheduledDrop.updateMany` and the alert via
    `NotificationsService` — no payment side-effects.

11. **"No scope bleed into B2-owned files"** → **verified true.** `git diff --name-only` over the four
    B2 paths returns nothing; the PR touches only B1-owned files.
