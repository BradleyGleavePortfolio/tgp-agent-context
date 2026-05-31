# PR-18 / B4 BUILD REPORT — Atomic duplicate-alert dedup in drip dispatcher

**Branch:** `pr18/b4-drip-alert-dedup` (off backend main `19e51b0`)
**Builder:** Opus 4.8 (Dynasia G)
**Worktree:** `/home/user/workspace/wt-b4-drip`
**Commit (impl):** `2a500811b781febdc194d0d4ee56a3dd7c6d240d`

## Write-set (STRICT — only these two files touched)
- `src/packages/drip-dispatcher.cron.ts`
- `test/drip-dispatcher.cron.spec.ts`

`git status --porcelain` shows exactly these two files modified. No other
files (`packages.service.ts`, `package-contents.*`, `landing-pages.*`)
were touched.

## The bug (PR-10 gap)
`dispatchBuyerAlert()` previously gated on the **in-memory**
`drop.alert_dispatched_at` snapshot and only stamped the column **AFTER**
the notification attempts (old `~:481-493`). A slow worker could send the
push + in-app, and BEFORE it stamped, a stale-claim reclaim worker
(`STALE_CLAIM_MS = 5min`; `findDue`/`claim` reclaim path) loaded its OWN
snapshot with `alert_dispatched_at` still NULL and sent the SAME alert a
second time → **duplicate buyer alert**. The JS snapshot is not a mutex.

## The fix
In `dispatchBuyerAlert()` the object-only guard is replaced with an
**atomic conditional DB claim taken BEFORE any send**:

```ts
const claim = await this.prisma.scheduledDrop.updateMany({
  where: { id: drop.id, alert_dispatched_at: null },
  data: { alert_dispatched_at: now },
});
if (claim.count === 0) { /* log + skip */ return; }
// count === 1 -> send in-app + push
```

- **count === 0 → log + skip.** One branch covers both required cases:
  (a) the notify-off **pre-stamped** row (B2 stamps `alert_dispatched_at`
  at SEED time when the coach toggles "notify" OFF — content still
  materialises, no announcement fires), and (b) an **already-claimed**
  row (a sibling stale-reclaim worker got here first).
- **count === 1 → send** in-app + push (3 calls: 2 `createNotification`
  rows on channels `inapp`/`push`, plus `pushToUser`). Each send stays
  independently try/catch-wrapped.
- The **post-send stamp was removed** — the stamp now lands up-front,
  closing the race window. The stamp is **NOT cleared on a
  notification-provider failure**: per decision #9 a failed push must not
  un-deliver content, and re-clearing would re-open the dedup window.
  Preserves the "delivery committed; alert best-effort and never
  duplicated" policy (matches the prior stamp-regardless intent, now
  ordered before the send).
- `dispatchBuyerAlert(drop, clientUserId, now = new Date())` takes the
  deterministic tick `now`, passed from `dispatch()` so the stamp uses
  the same tick time the rest of the dispatch path uses.

Notify-off pre-stamped semantics preserved: such rows still materialise
content and the claim returns count 0, so no alert is sent and the seed
timestamp is never overwritten.

## Tests (`test/drip-dispatcher.cron.spec.ts`)
Existing suite preserved (including the stale-reclaim test which still
delivers ONCE, and the notify-suppression tests). **4 new B4 tests added:**
1. First worker claims the alert (count===1) and sends; a second worker
   over the SAME drop sees count===0 and sends nothing (buyer alerted once).
2. The claim `updateMany` targets the row by id WHERE
   `alert_dispatched_at IS NULL` and stamps it to the tick `now` BEFORE
   the send (asserts the atomic-claim shape, not the JS snapshot).
3. A notify-off PRE-STAMPED drop yields claim count===0 — content
   materialises but NO alert is sent and the seed stamp is preserved.
4. A provider failure does NOT clear the stamp — the alert is never
   re-attempted as a duplicate (delivery still committed).

A **TODO note** for a future DB-backed alert-race harness was added (real
Postgres + two concurrent connections firing the claim in parallel). That
harness is intentionally **OUT OF SCOPE** for this unit per the brief — no
real Postgres harness was built.

## Verification (run in the worktree)
- **Typecheck:** `npx tsc --noEmit -p tsconfig.json` → PASS (exit 0).
- **Lint:** `npx eslint src/packages/drip-dispatcher.cron.ts test/drip-dispatcher.cron.spec.ts` → PASS (exit 0).
- **Tests:** `npx jest test/drip-dispatcher.cron.spec.ts` → **32 passed, 32 total** (1 suite passed).

## 50-Failures concerns addressed
- **#28 race conditions / idempotency:** the dedup gate is now DB-atomic
  (conditional `updateMany` on the NULL column), not JS-memory-only. No
  duplicate in-app + push rows under stale reclaim.
- A notification-provider failure does not un-deliver content and does
  not re-open the duplicate-alert window.

## Doctrine
- Commit authored as `Dynasia G <dynasia@trygrowthproject.com>` (R4
  STRICT), **no trailers** (verified — no Co-Authored-By / Signed-off-by /
  Generated-with lines).
- Pushed to origin `pr18/b4-drip-alert-dedup` (R61).
