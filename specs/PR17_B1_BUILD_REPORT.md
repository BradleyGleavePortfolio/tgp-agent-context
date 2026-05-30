# PR-17 B1 — Build Report

**Unit:** B1 — `ScheduledDrop.push_seq` re-send engine (additive unique-key + cron resolver-key bypass).
**Repo:** `growth-project-backend` (BradleyGleavePortfolio, private).
**Branch:** `pr17/b1-push-seq-engine` (based on `origin/main`).
**Worktree:** `/home/user/workspace/wt-pr17-b1` (isolated).
**Head commit:** `7307778dd93686b46f7eec19619683f9c70b1562`.
**PR:** [#328](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/328) (vs `main`).

Commits on branch (oldest → newest):

| SHA | Subject |
| --- | --- |
| `241fb6e` | PR-17 B1: add ScheduledDrop.push_seq + widen unique key (additive migration) |
| `b4c5490` | PR-17 B1: cron resolver-key bypass for push_seq>0 re-sends + notify-suppression guard |
| `7307778` | PR-17 B1: tests for push_seq resolver-key bypass + notify suppression |

---

## Scope (per brief)

Three changes only. Did **NOT** touch `package-push.service.ts`, `package-contents.*`, or
`packages.module.ts` (those are owned by B2). No push service / endpoint built.

---

## Change 1 — Schema: additive `push_seq` + widened unique key

**File:** `prisma/schema.prisma`, `model ScheduledDrop` (column added before `created_at`;
`@@unique` widened).

```prisma
+  push_seq           Int            @default(0)
   created_at         DateTime       @default(now())
   updated_at         DateTime       @updatedAt

-  @@unique([client_purchase_id, content_id])
+  @@unique([client_purchase_id, content_id, push_seq])
```

Original fan-out + first-delivery pushes use the default `0`; a coach "re-send updated
version" of an already-FIRED drop (decision #5) inserts a NEW row at `push_seq = prior max + 1`,
so the immutable fired row is never mutated. The old uniqueness is preserved exactly as the
`(pair, 0)` subset, so the fan-out `createMany({ skipDuplicates: true })` still dedups originals.

## Change 1b — Migration

**Dir:** `prisma/migrations/20261209000000_pr17_scheduled_drop_push_seq/migration.sql`
(next sequential timestamp after `20261208000000`; verified).

```sql
ALTER TABLE "ScheduledDrop" ADD COLUMN "push_seq" INTEGER NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS "ScheduledDrop_client_purchase_id_content_id_key";

CREATE UNIQUE INDEX "ScheduledDrop_client_purchase_id_content_id_push_seq_key"
  ON "ScheduledDrop"("client_purchase_id", "content_id", "push_seq");
```

- Dropped index name `ScheduledDrop_client_purchase_id_content_id_key` is Prisma's generated
  name for the original `@@unique([client_purchase_id, content_id])`, created in
  `20261202000000_pr3_drip_schema_foundation/migration.sql:121` (confirmed by reading that file).
- New index name `ScheduledDrop_client_purchase_id_content_id_push_seq_key` matches Prisma's
  generated name for the widened `@@unique`, so a subsequent `prisma migrate diff` shows no drift.
- Fully additive: metadata-only ALTER + per-row DEFAULT fill. No backfill script, no type change,
  no RENAME. Every existing row keeps `push_seq = 0` → byte-compatible behaviour.

## Change 2 — Cron resolver-key bypass for re-sends

**File:** `src/packages/drip-dispatcher.cron.ts`, in `dispatch()` (~line 344–360).

```ts
const isResend = drop.push_seq > 0;
const result = await this.resolvers!.materialise(drop.asset_type, {
  clientId: purchase.client_user_id,
  coachId: purchase.coach_user_id,
  assetId: drop.asset_id,
  assetRevisionId: drop.asset_revision_id ?? null,
  displayTitle: drop.display_title,
  displayCaption: drop.display_caption,
  scheduledDropId: drop.id,
  clientPurchaseId: isResend ? null : purchase.id,
  contentId: isResend ? null : drop.content_id,
});
```

**Why:** the resolver idempotency keys ride the STABLE `(clientPurchaseId, contentId)` pair —
`auto-message.resolver` claims a `DripResolverMarker(purpose, purchase_id, content_id)` and
returns the cached `CoachMessage` on repeat; `workout.resolver` keys
`WorkoutBuilderIdempotencyKey` on `drip:workout:p={p}:c={c}` and collapses to the cached
assignment. For an **original** drop (`push_seq === 0`) that is exactly right — it preserves PR-9
R1 rollback-retry idempotency so an inline/cron race can never double-deliver. For a **re-send**
(`push_seq > 0`) we pass ONLY the per-drop `scheduledDropId` and omit the pair, so both resolvers
fall back to a per-drop key (auto-message: marker skipped; workout:
`drip:workout:{client}:{asset}:{scheduledDropId}`) and produce a genuinely fresh delivery.
`meal_plan` rides `DailyMealPlanAssignment.drip_drop_id @unique` (already fresh per row); `media`
rides `ClientAssetGrant @@unique[client,media]` (a re-send of identical media collapses to the
existing grant — expected/acceptable; the re-send's value is the new fire_at / notification).

## Change 3 — Notify-suppression guard

**File:** `src/packages/drip-dispatcher.cron.ts`, top of `dispatchBuyerAlert()` (~line 415–420).

```ts
if (drop.alert_dispatched_at != null) {
  this.logger.debug(
    `drip-dispatcher alert suppressed for drop=${drop.id} client=${clientUserId}: alert_dispatched_at already set (notify off or already alerted)`,
  );
  return;
}
```

**Why (decision #9, B2 prep):** B2's push service will pre-stamp `alert_dispatched_at` at SEED
time when the coach toggles "notify" OFF, so a forward-dated push the coach asked NOT to announce
delivers silently — the cron materialises the content but this guard short-circuits the
DRIP_RELEASED push + in-app. The guard returns BEFORE the re-stamp, so a pre-set timestamp is
preserved untouched. A normal drip drop is never pre-stamped at seed (fan-out + PR-10 leave it
NULL until after the first dispatch), so its behaviour is unchanged.

---

## Tests

**File:** `test/drip-dispatcher.cron.spec.ts` — +5 cases (163 insertions):

1. `push_seq === 0` (original) → materialised WITH the `(clientPurchaseId, contentId)` pair.
2. `push_seq > 0` (re-send) → materialised WITHOUT the pair (both `null`), only `scheduledDropId`,
   asserting a fresh delivery (`materialised_ref` set, status `delivered`).
3. Notify suppression: drop pre-stamped with `alert_dispatched_at` → delivered silently
   (no `createNotification`, no `pushToUser`); original timestamp preserved (no re-stamp).
4. Notify suppression: normal drop (`alert_dispatched_at` NULL) → sends alert (1 push + 2
   channel rows) and stamps the column.
5. Forward-dated re-send (`push_seq = 2`, future `fire_at`) → NOT picked up until due (dedup
   gating unchanged by the widened key).

---

## Verification (real, in the worktree after `npm install` + `prisma generate`)

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit -p tsconfig.json` | exit 0 — clean |
| Lint | `npm run lint` | exit 0 — 0 errors, 17 pre-existing warnings (none in touched files) |
| Targeted spec | `npx jest test/drip-dispatcher.cron.spec.ts` | **28 passed** (was 23; +5 B1) |
| Full suite | `npx jest` | **300 suites passed; 3614 passed, 20 skipped, 5 todo; 0 failures** |

---

## Deviations from the brief

- **Report path:** the brief (`PR17_B1_BRIEF.md:42`) names `/home/user/workspace/specs/...`; per
  the spawning message this report is written to
  `/home/user/workspace/repos/tgp-agent-context/specs/PR17_B1_BUILD_REPORT.md` (message takes
  precedence).
- **No `typecheck` npm script** exists; used `npx tsc --noEmit -p tsconfig.json` directly (plus the
  full `npm run lint` + `npx jest`).
- No other deviations. Scope held exactly; B2-owned files untouched.
