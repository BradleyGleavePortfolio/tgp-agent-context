# PR-18 / B4 — Backend drip dispatcher alert dedup

**Repo:** growth-project-backend. **Off backend main `19e51b0`.** Builder = Opus 4.8.
**Source plan:** `specs/PR18_EXPANSION_PLAN.md` §3.6, §3.7, §4(B4).

## Write-set (STRICT — touch ONLY these)
- `src/packages/drip-dispatcher.cron.ts`
- `test/drip-dispatcher.cron.spec.ts`

Do NOT touch `packages.service.ts`, `package-contents.*`, `landing-pages.*`.

## Item — Atomic duplicate-alert dedup (PR-10)
Current gap: `dispatchBuyerAlert()` skips alerts if in-memory `drop.alert_dispatched_at` was set (~`:411-420`); stamp happens AFTER notification attempts (~`:481-493`). A slow worker can send, then before stamping, a stale-reclaim worker (STALE_CLAIM_MS=5min, ~`:48-50`; reclaim ~`:183-221`) also sees null and sends → duplicate alert.
1. In `dispatchBuyerAlert()`, replace the object-only guard with an ATOMIC claim BEFORE sending:
   `updateMany({ where: { id: drop.id, alert_dispatched_at: null }, data: { alert_dispatched_at: now } })`.
2. If count `=== 0` → log and skip sends (covers notify-off pre-stamped rows + already-claimed rows).
3. If count `=== 1` → send in-app/push rows. Keep failure logging, but do NOT clear the stamp on notification-provider failure — preserves "delivery committed; alert best-effort and never duplicated" (matches current stamp-regardless policy ~`:481-483`).
4. Keep notify-off semantics: rows pre-stamped at seed still skip (claim count 0).

## Tests (`test/drip-dispatcher.cron.spec.ts`)
- Existing stale-reclaim test (~`:636-674`) still delivers ONCE.
- NEW: first worker claims alert; second worker sees `updateMany.count === 0` and sends no notifications.
- Notify-off pre-stamped row still materialises content and sends no alert.
- Deterministic unit tests around the new `updateMany count` branch. Add a TODO/test-plan note for a future DB-backed race harness (do NOT build a real Postgres harness here — out of scope).

## 50-Failures concerns
- Race/idempotency: dedup gate MUST be DB-atomic, not JS-memory-only.
- No duplicate in-app + push rows under stale reclaim.

## Doctrine
- Commit (R4 STRICT, NO trailers): `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit -m "..."`.
- Push every ~2 min to `pr18/b4-drip-alert-dedup` (R61). `api_credentials=["github"]` for all git. Bar = CLEAN P0/P1/P2.
