# PR-17 B1 BRIEF — ScheduledDrop push_seq engine (backend schema + migration + cron key-bypass)

Repo: growth-project-backend. Pillar: Packages & Drip-Feed (PR-17, unit B1). Type: FEATURE (additive). Branch: `pr17/b1-push-seq-engine`.
PR title: `PR-17 B1: ScheduledDrop.push_seq — additive unique-key + cron resolver-key bypass for re-send`

## Why
PR-17 lets a coach push package-content updates to ALREADY-PURCHASED buyers. Decision #5: already-FIRED drops are IMMUTABLE; a coach "re-send updated version" must create a FRESH delivery. Today `ScheduledDrop @@unique([client_purchase_id, content_id])` blocks a second row for the same pair, and the resolver idempotency keys ride that stable pair — so a re-send would silently collapse to the cached delivery. B1 lays the schema + engine foundation so B2 (the push service/endpoint) can build on it. Full design: `/home/user/workspace/PR17_EXPANSION_PLAN.md` §1.3, §2.4, §2.5.

## Scope — EXACTLY this (do NOT build the push service/endpoint — that is B2)
1. **Schema + migration (additive):**
   - `prisma/schema.prisma`: add `push_seq Int @default(0)` to `model ScheduledDrop`; change `@@unique([client_purchase_id, content_id])` → `@@unique([client_purchase_id, content_id, push_seq])`.
   - New migration `prisma/migrations/20261209000000_pr17_scheduled_drop_push_seq/migration.sql` (verify it is the next sequential dir after the latest existing migration — list the dir and pick the correct timestamp):
     ```sql
     ALTER TABLE "ScheduledDrop" ADD COLUMN "push_seq" INTEGER NOT NULL DEFAULT 0;
     DROP INDEX IF EXISTS "ScheduledDrop_client_purchase_id_content_id_key";
     CREATE UNIQUE INDEX "ScheduledDrop_client_purchase_id_content_id_push_seq_key"
       ON "ScheduledDrop"("client_purchase_id","content_id","push_seq");
     ```
   - Verify the existing fan-out `createMany({ skipDuplicates:true })` (`purchase-fanout.service.ts:281`) still dedups originals (all use seq 0 by default — byte-compatible, NO data backfill).
   - Confirm the actual current unique index NAME in the DB/migrations before DROP-ing it; match Prisma's generated name exactly.
2. **Cron resolver-key bypass (the #5 correctness core)** — `src/packages/drip-dispatcher.cron.ts:317-332`:
   - Currently ALWAYS passes `clientPurchaseId: purchase.id, contentId: drop.content_id` to `resolvers.materialise`.
   - Make it CONDITIONAL on `drop.push_seq`: for `push_seq === 0` keep passing the pair (preserves existing rollback-retry idempotency for original drops); for `push_seq > 0` pass `scheduledDropId: drop.id` only and OMIT the pair, so `auto-message.resolver.ts` (`:64-65` fallback) and `workout.resolver.ts` (`:131` fallback) produce a GENUINELY FRESH delivery instead of returning the cached marker/ledger result.
   - Do NOT change `findDue`, the claim/lock, or backoff logic. A backfilled/re-send pending drop with a future `fire_at` must flow through `findDue` unchanged (it waits until due).
3. **Notify suppression hook (decision #9, prep for B2)** — `src/packages/drip-dispatcher.cron.ts` `dispatchBuyerAlert` (~`:368-445`):
   - Today it always sends the `DRIP_RELEASED` buyer alert then stamps `alert_dispatched_at`.
   - Add a guard: if `alert_dispatched_at` is ALREADY set at dispatch time, SKIP the send (no double-alert; lets B2 pre-stamp `alert_dispatched_at` at seed time to suppress notify when the coach toggles notify OFF). Gate strictly on the column being pre-set; NORMAL drip drops are never pre-stamped at seed, so their behavior is unchanged.

## Out of scope (B2 owns these — do NOT touch)
- `package-push.service.ts`, `package-contents.dto.ts`, `package-contents.controller.ts`, `packages.module.ts`. The push endpoint, audience scoping, chunked tx, and the push service itself are B2. B1 is ONLY schema + migration + cron.

## Tests (real, not mocked-away) — extend `test/drip-dispatcher.cron.spec.ts`
- A `push_seq > 0` drop is dispatched to `resolvers.materialise` WITHOUT the `(clientPurchaseId, contentId)` pair (assert the args), so auto_message/workout produce a fresh delivery (assert a SECOND message/assignment is created, not the cached one).
- A `push_seq === 0` drop still passes the pair (existing idempotency preserved — existing tests must stay green).
- `dispatchBuyerAlert` SKIPS the send when `alert_dispatched_at` is pre-set; SENDS + stamps when null (normal path unchanged).
- A forward-dated pending drop (`fire_at` future, any push_seq) is NOT returned by `findDue` until due.
- Migration applies cleanly; `npx prisma migrate diff` / generate shows no drift; existing fan-out createMany dedup still works for seq-0 originals.

## Deliverables
- Branch + PR vs default. Pull latest default first.
- Push to GitHub every ~2 minutes (even mid-flight) — R61.
- `/home/user/workspace/specs/PR17_B1_BUILD_REPORT.md`: file:line of each change, the exact migration SQL + the index name you matched, the cron conditional diff, the notify-suppression guard, and actual tsc/lint/test counts.
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.
