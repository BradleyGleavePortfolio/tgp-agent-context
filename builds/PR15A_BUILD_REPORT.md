# PR-15A BUILD REPORT — Buyer drops endpoint + COACH_NEW_PURCHASE + SSR thank-you parity

**Branch:** `pr15/buyer-drops-and-purchase-notify` · **PR:** #324
**Author:** Dynasia G `<dynasia@trygrowthproject.com>` · **Repo:** growth-project-backend
**Base:** main @ 691c78f6 (PR-14)

---

## (a) Files changed

| File | Lines (added) | Purpose |
|---|---|---|
| `src/checkout/checkout.controller.ts` | +35 | A1: `GET /v1/checkout/purchases/:purchaseId/drops` route |
| `src/checkout/checkout.service.ts` | +112 | A1: `listDropsForBuyer()` + `BuyerDropView` type + `DROP_LIST_HARD_CAP` |
| `src/packages/purchase-fanout.service.ts` | +194 | A2: staging block, marker idempotency claim, flush method, helper refactor |
| `src/notifications/notification-kind.ts` | +7 | A2: `COACH_NEW_PURCHASE` kind |
| `src/notifications/notifications.service.ts` | +14 | A2: prefs defaults + dedicated prefix routing branch |
| `src/notifications/notifications.dto.ts` | +14 | A2: `coach_new_purchase_*` DTO fields |
| `src/storefront/thank-you.service.ts` | +123 (new) | A3: view-model composer + listDropsForBuyer reuse |
| `src/storefront/thank-you.html.ts` | +170 (new) | A3: SSR HTML renderer |
| `src/storefront/storefront-public.controller.ts` | +28 | A3: `GET /v1/packages/public/thank-you` route |
| `src/storefront/storefront.module.ts` | +3 | A3: wire `ThankYouService` |
| `prisma/schema.prisma` | +8 | `coach_new_purchase_email/_push/_inapp` columns |
| `prisma/migrations/20261208000000_pr15_coach_new_purchase_prefs/migration.sql` | +28 (new) | Additive ALTERs |
| `test/checkout-buyer-drops.spec.ts` | +210 (new) | A1 tests (7) |
| `test/purchase-fanout-coach-new-purchase.spec.ts` | +295 (new) | A2 tests (5) |
| `test/coach-new-purchase-prefs-routing.spec.ts` | +85 (new) | Prefs prefix routing tests (3) |
| `test/thank-you.ssr.spec.ts` | +215 (new) | A3 tests (7) |
| `test/storefront-public.controller.spec.ts` | +6 (mod) | Add `ThankYouService` ctor arg to existing test helpers |

---

## (b) A1 — Buyer drops endpoint

### Route + auth wiring

`src/checkout/checkout.controller.ts:251-273` — new method `listPurchaseDrops`:
- `@Get('purchases/:purchaseId/drops')` under `@Controller('v1/checkout')`
- `@UseGuards(JwtAuthGuard)` (class-level)
- `@Roles('student', 'coach', 'owner')`
- `@SkipClientEntitlement()` — a buyer still owns the historical purchase even if entitlement has expired/canceled.

### Service implementation

`src/checkout/checkout.service.ts:64-90` — `BuyerDropView` type + `DROP_LIST_HARD_CAP = 500`.
`src/checkout/checkout.service.ts:679-770` — `listDropsForBuyer()`:
1. `findFirst({ where: { id: purchaseId, client_user_id: buyerUserId } })` → 404 on miss (IDOR collapse).
2. `scheduledDrop.findMany({ where: { client_purchase_id, status: { in: ['pending','due','fired'] } }, take: 500, select: {…} })` — single query, SQL WHERE filter.
3. In-memory sort by `COALESCE(fired_at, fire_at, created_at) ASC`.
4. Return `{ drops: BuyerDropView[] }` (envelope), `materialised_ref` re-exported as-is (null for pending/due — Rule 18).

### EXACT response shape shipped

This is what the mobile builder must reconcile against:

```json
{
  "drops": [
    {
      "id": "uuid",
      "asset_type": "workout_program | workout_plan | meal_plan | pdf | video | auto_message",
      "asset_id": "uuid",
      "asset_revision_id": "uuid | null",
      "cadence_kind": "immediate | relative_to_purchase | fixed_calendar | on_completion | on_milestone",
      "display_title": "string | null",
      "display_caption": "string | null",
      "fire_at": "ISO 8601 string | null",
      "fired_at": "ISO 8601 string | null",
      "status": "pending | due | fired",
      "materialised_ref": "string | null"
    }
  ]
}
```

Field-name match against PR13_BUILD_REPORT.md §c verified by the dedicated contract-shape test (`test/checkout-buyer-drops.spec.ts:197-219`).

### IDOR proof

- Cross-user purchase id → `NotFoundException({ error: 'PURCHASE_NOT_FOUND', ... })` — 404, never 403, never reveals existence (test: `test/checkout-buyer-drops.spec.ts:165-172`).
- Unknown purchase id → same 404 path (test: `test/checkout-buyer-drops.spec.ts:174-179`).
- Service-level guard: `findFirst({ where: { id: purchaseId, client_user_id: buyerUserId } })` — a foreign purchase fails the WHERE and returns `null` → 404. Matches the `requireOwned` pattern in `coach-media.service.ts:623-638`.

### N+1 proof

Single `scheduledDrop.findMany` call with `select` (only the columns we ship). No per-row joins. Test (`test/checkout-buyer-drops.spec.ts:144-156`) asserts `prisma._findManyDrops.toHaveBeenCalledTimes(1)`.

---

## (c) A2 — COACH_NEW_PURCHASE notification

### NotificationKind + prefs

- `src/notifications/notification-kind.ts:71-79` — `COACH_NEW_PURCHASE: 'coach_new_purchase'`.
- `prisma/schema.prisma:910-915` + migration `20261208000000_pr15_coach_new_purchase_prefs/migration.sql` — adds `coach_new_purchase_email/_push/_inapp` (`BOOLEAN NOT NULL DEFAULT false/true/true`). Additive metadata-only ALTERs; no backfill.
- `src/notifications/notifications.service.ts:124-128` — defaults block.
- `src/notifications/notifications.service.ts:696-704` — `_kindToPrefsPrefix` adds an explicit `coach_new_purchase` branch BEFORE the `digest` safe-default fallthrough. This is the mirror of the PR-10 R1 P2 fix the brief calls out.

### Staging + flush

`src/packages/purchase-fanout.service.ts`:
- `:160-178` — `CoachNewPurchaseAlertDescriptor` interface + `pendingCoachNewPurchaseAlerts` bucket.
- `:191-196` — constructor extended with `@Optional() notifications?: NotificationsService` and `@Optional() prisma?: PrismaService`.
- `:266-273` — `stageCoachNewPurchaseAlert` invoked even on the empty-contents early-return path (paywall-only packages still notify the coach).
- `:340-344` — `stageCoachNewPurchaseAlert` invoked on the normal fan-out path.
- `:354-441` — `stageCoachNewPurchaseAlert` helper: in-tx `dripResolverMarker.create({ data: { purpose: 'coach_new_purchase', purchase_id, content_id: '-' } })` claim; swallows ONLY P2002 unique violations; reads coach + package context inside the same tx; appends to the bucket.
- `:478-503` — `flushAlerts` now ALSO calls `flushCoachNewPurchaseAlert(purchaseId)` so the existing post-commit hook lights up both buyer (`DRIP_RELEASED`, PR-10) and coach (`COACH_NEW_PURCHASE`, PR-15A) sides without a new wiring site.
- `:519-543` — `discardPendingAlerts` wipes the new bucket together with the drip-released bucket so a rolled-back+retried Stripe event cannot double-alert.
- `:551-617` — `flushCoachNewPurchaseAlert`: three writes via `NotificationsService` — `createNotification(channel:'inapp')`, `pushToUser`, `createNotification(channel:'push')`. Each call is independently try/wrapped so a hostile provider can never escalate into an entitlement rollback (decision #9 boundary).

### Idempotency proof

The unique key `(purpose='coach_new_purchase', purchase_id, content_id='-')` on `DripResolverMarker` (PR-9 R1 audit-fix model, `prisma/schema.prisma:4770-4781`) provides per-purchase exactly-once delivery semantics across Stripe webhook replay:

1. **First commit:** `dripResolverMarker.create` succeeds → `claimedFirst=true` → bucket populated → post-commit flush sends.
2. **Stripe webhook replay (same purchase id):** `dripResolverMarker.create` throws P2002 → caught (debug-logged) → `claimedFirst` stays `false` → bucket NOT populated → flush is a no-op.
3. **Tx rollback (e.g. resolver failure inside the entitlement tx):** the marker INSERT rolled back together with the rest of the tx; `discardPendingAlerts` wipes the in-memory bucket; the retry's marker INSERT claims afresh (correct — the first attempt never actually committed).

Verified end-to-end in `test/purchase-fanout-coach-new-purchase.spec.ts`:
- `"coach gets exactly one COACH_NEW_PURCHASE on entitlement"` — 1 push + 2 in-app rows (inapp channel + push channel row).
- `"replay does not double-notify the coach"` — second `onPurchaseEntitled` call observes the marker, `state.markers.length === 1`, push count unchanged.
- `"rollback fires none — discardPendingAlerts wipes the bucket"` — explicit `discardPendingAlerts` → `pushToUser` never called.

### Prefs OFF + guest-converted paths

- Coach with `coach_new_purchase_inapp=false`: `NotificationsService.createNotification` returns `null` → the in-app row write is suppressed and the test does not throw (`test/coach-new-purchase-prefs-routing.spec.ts:50-65`). Routing branch confirmed to land on `coach_new_purchase` prefix, NOT `digest` (test `:11-46`).
- Guest-just-converted buyer (empty name, email-only): body fallback is `email` rather than "A new client" (test `test/purchase-fanout-coach-new-purchase.spec.ts:230-248`).

---

## (d) A3 — SSR thank-you parity

### Route + render

- `src/storefront/storefront-public.controller.ts:376-401` — `GET /v1/packages/public/thank-you?session_id=…`:
  - `@Public()` (anonymous storefront surface)
  - `@Throttle({ default: { ttl: 60_000, limit: 60 } })`
  - `@Header('Content-Type', 'text/html; charset=utf-8')`
  - `@Header('Cache-Control', 'private, no-store')`
- `src/storefront/thank-you.service.ts:43-105` — `buildViewModel(sessionId)`:
  - 404 on missing session id, foreign session id, or `!purchase.entitlement_active` (buyer arrived before the webhook landed).
  - **Reuses `CheckoutService.listDropsForBuyer(purchase.client_user_id, purchase.id)`** — same path the A1 endpoint uses. Buyer-scoped to the just-converted purchase.
  - Splits drops by `status === 'fired'` into `unlocked[]` vs `upcoming[]`.
  - Computes `amountFormatted` via `Intl.NumberFormat` (currency-correct); `isRecurring` from `billing_type === 'recurring'`; `nextChargeAt = current_period_end` when recurring.
- `src/storefront/thank-you.html.ts` — pure-function renderer; `noindex,nofollow`; HTML-escape on every coach/buyer-supplied string (test asserts `<script>` and `"><img onerror=…>` are escaped).

### Scope guard observed

The brief said: "extend the existing success/return template only — do NOT rebuild the storefront." There was no pre-existing SSR thank-you template (verified via `grep -rn "thank|success" src/storefront/storefront-public.controller.ts` — zero hits before this PR). The route is a new addition under the same `/v1/packages/public/*` namespace, two files totalling ~290 LoC, no other storefront surfaces touched.

---

## (e) Migration

`prisma/migrations/20261208000000_pr15_coach_new_purchase_prefs/migration.sql` — three ALTERs:
```sql
ALTER TABLE "NotificationPreferences"
  ADD COLUMN "coach_new_purchase_email" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationPreferences"
  ADD COLUMN "coach_new_purchase_push"  BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificationPreferences"
  ADD COLUMN "coach_new_purchase_inapp" BOOLEAN NOT NULL DEFAULT true;
```
Static default → metadata-only ALTER + per-row default-fill on existing rows; no backfill script required. Pattern matches the PR-10 R1 audit-fix block in `20261205000000_pr10_scheduled_drop_retry_lock/migration.sql:55-61`.

---

## (f) Verification — ACTUAL counts

| Step | Command | Result |
|---|---|---|
| TypeScript | `node_modules/.bin/tsc --noEmit -p tsconfig.json` | **0 errors** |
| Lint | `npm run lint` | **0 errors** (17 pre-existing warnings on other files; **0 on any new/modified file in this PR**) |
| Tests (full repo) | `node_modules/.bin/jest` | **299 suites passed**, **3597 tests passed**, 20 skipped, 5 todo, 6 snapshots — `Time: 168.91s` |
| Tests (new, PR-15A) | `jest test/checkout-buyer-drops.spec.ts test/purchase-fanout-coach-new-purchase.spec.ts test/coach-new-purchase-prefs-routing.spec.ts test/thank-you.ssr.spec.ts` | **22 tests passed** (7 A1 + 5 A2 + 3 prefs + 7 A3) |

---

## (g) Scope-guard audit

Per the brief's scope guardrail ("Do NOT change the fan-out engine logic, the cron, or media internals beyond reading their outputs"):

- ✅ No changes to `DripDispatcherCron` (other than no-op).
- ✅ No changes to asset resolvers.
- ✅ No changes to `CoachMediaService` or storage providers.
- ✅ `PurchaseFanoutService.onPurchaseEntitled` only adds an additive staging block; the fan-out body (drop seed + immediate-inline resolver loop) is unchanged.
- ✅ `flushAlerts` / `discardPendingAlerts` keep their existing semantics; we extended them additively to also flush/discard the new bucket.

— end PR-15A BUILD REPORT —
