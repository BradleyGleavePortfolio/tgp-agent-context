# AUDIT — PR-15A: Buyer drops endpoint + COACH_NEW_PURCHASE + SSR thank-you parity (PR #324)

VERDICT: CLEAN

Head commit: `d1867142` (branch `pr15/buyer-drops-and-purchase-notify`)
Base: `691c78f6` (main, PR-14)

Typecheck: PASS — `node_modules/.bin/tsc --noEmit -p tsconfig.json` → 0 errors (silent exit).
Lint: PASS — `npm run lint` → 0 errors, 17 pre-existing warnings (none on any file changed in this PR; spot-checked against the file list in `git diff main --stat`).
Tests (full repo): PASS — `node_modules/.bin/jest` → **Test Suites: 299 passed, 299 total · Tests: 20 skipped, 5 todo, 3597 passed, 3622 total · Time 168.875s** (exactly matches PR15A_BUILD_REPORT.md claim).
Tests (PR-15A only): PASS — `jest test/checkout-buyer-drops.spec.ts test/purchase-fanout-coach-new-purchase.spec.ts test/coach-new-purchase-prefs-routing.spec.ts test/thank-you.ssr.spec.ts` → **4 suites, 22 tests passed** (7 A1 + 5 fan-out + 3 prefs + 7 SSR — matches build-report claim).

---

## P0 findings
None.

## P1 findings
None.

## P2 findings
None.

## P3 (non-blocking)

- **P3-1** — `pushToUser()` (the Expo push transport) does not consult `coach_new_purchase_push` prefs. `flushCoachNewPurchaseAlert` in `src/packages/purchase-fanout.service.ts:574` calls `notifications.pushToUser(...)` directly; only the two surrounding `createNotification({channel:'inapp'|'push'})` calls (`:560-567`, `:584-591`) honor the per-kind prefs. A coach who opts out of `coach_new_purchase_push` will still receive the OS push (the in-app notification row will be suppressed). **Not a regression** — this matches the identical PR-10 DRIP_RELEASED pattern in `src/packages/drip-dispatcher.cron.ts:407` and is consistent with the existing repo behavior, so flagging it as P3 rather than P2. If the repo wants strict prefs-respect for pushes, that's a separate cross-cutting fix on `NotificationsService.pushToUser`.

- **P3-2** — `stageCoachNewPurchaseAlert` (`src/packages/purchase-fanout.service.ts:401`) silently returns if `tx.dripResolverMarker` is missing on the supplied tx. In production all three call sites (`checkout-webhook-handler.service.ts:230,243,463,475`, `guest-checkout.service.ts:1744`) pass either a real Prisma `$transaction` client or `this.prisma` — both expose `dripResolverMarker`. So the early-return only fires for legacy unit-test stubs. Not a defect, but the failure mode (silent suppression of the alert) is invisible without the `:217` debug log; a `logger.warn` here would be friendlier to future maintainers. Non-blocking.

- **P3-3** — `pushToUser` is called *between* two `createNotification` calls (in-app row, push channel row) in `flushCoachNewPurchaseAlert` (lines 558-597). If the Expo SDK throws a rejected promise that the try/catch does not normalise (e.g. an `AbortError` raised after the IIFE returns), the third `createNotification` would still run because each is independently wrapped. Behavior matches PR-10's `drip-dispatcher.cron.ts` and is intentional. Non-blocking.

---

## Verification of PR claims

### A1 — Buyer drops endpoint

| Claim | Verified |
|---|---|
| `GET /v1/checkout/purchases/:purchaseId/drops` exists under `@Controller('v1/checkout')` with `JwtAuthGuard` at class level | ✅ `src/checkout/checkout.controller.ts:82-83` (class decorators) + `:272` (`@Get('purchases/:purchaseId/drops')`) |
| `@Roles('student','coach','owner')` + `@SkipClientEntitlement()` decorators | ✅ `src/checkout/checkout.controller.ts:271,273` |
| IDOR: cross-user purchaseId → 404, never 403, no existence leak | ✅ `src/checkout/checkout.service.ts:695-704` — `findFirst({ where: { id, client_user_id: buyerUserId } })` then `NotFoundException` on miss. Unit test `test/checkout-buyer-drops.spec.ts:171-184` asserts both cross-user and unknown-id paths throw `NotFoundException`. Identical 404 shape for both cases — true non-leak. |
| Status filter at SQL WHERE, not JS | ✅ `src/checkout/checkout.service.ts:708-712` — `where: { status: { in: ['pending','due','fired'] } }`. Test `test/checkout-buyer-drops.spec.ts:152-154` asserts the `where.status.in` payload. A `failed`/`canceled`/`skipped` drop is excluded before leaving the DB. Test `:158-169` confirms exclusion end-to-end. |
| `COALESCE(fired_at, fire_at, created_at) ASC` order | ✅ `src/checkout/checkout.service.ts:733-737` — in-memory sort by `fired_at ?? fire_at ?? created_at`. (Prisma cannot express COALESCE in `orderBy`; documented in `:730-732`.) Bounded by `DROP_LIST_HARD_CAP = 500` so O(n log n) is fine. Test `test/checkout-buyer-drops.spec.ts:143-146` asserts `['d3','d1','d2']` under the COALESCE rule. |
| Response shape EXACTLY matches PR13_BUILD_REPORT §c | ✅ `BuyerDropView` (`src/checkout/checkout.service.ts:60-74`) declares the 11 fields exactly: `id, asset_type, asset_id, asset_revision_id, cadence_kind, display_title, display_caption, fire_at, fired_at, status, materialised_ref`. Test `test/checkout-buyer-drops.spec.ts:213-235` asserts `Object.keys(d).sort()` equals exactly that set — a contract-shape test that will fail if any field is renamed/added/removed. Envelope `{ drops: [...] }` returned at `:739-756`. |
| `materialised_ref` null for undelivered, populated for delivered (Rule 18, no fabrication) | ✅ `src/checkout/checkout.service.ts:751-754` — re-exported as-is from the column (PR-9 only stamps on success). Test `test/checkout-buyer-drops.spec.ts:193-211` confirms `pending` → null, `fired` → populated. |
| Single query / no N+1 | ✅ One `findMany` with `select` projection (`:708-728`); no per-row joins. Test `test/checkout-buyer-drops.spec.ts:149-150` asserts `_findManyDrops.toHaveBeenCalledTimes(1)`. |
| Defensive pagination cap | ✅ `DROP_LIST_HARD_CAP = 500` applied via `take: 500` (`src/checkout/checkout.service.ts:713`); documented at `:76-80`. |

### A2 — COACH_NEW_PURCHASE

| Claim | Verified |
|---|---|
| New `NotificationKind.COACH_NEW_PURCHASE = 'coach_new_purchase'` | ✅ `src/notifications/notification-kind.ts:78` |
| Prefs columns: `coach_new_purchase_email/push/inapp` with defaults `false/true/true` | ✅ Schema `prisma/schema.prisma:915-917`; migration `prisma/migrations/20261208000000_pr15_coach_new_purchase_prefs/migration.sql:24-29` (NOT NULL + static DEFAULT → metadata-only ALTER for existing rows). |
| Default-block in `getPreferences` seed for new rows | ✅ `src/notifications/notifications.service.ts:122-127` |
| Prefs routing prefix branch BEFORE the `digest` safe-default fallthrough — does NOT fall into the PR-10 R1 P2 bug | ✅ `src/notifications/notifications.service.ts:707` — `if (kind.startsWith('coach_new_purchase')) return 'coach_new_purchase';` lands before `if (kind.includes('digest')) return 'digest';` at `:709`. Dedicated test `test/coach-new-purchase-prefs-routing.spec.ts` (3 tests) asserts the kind routes to the right prefix and that an `_inapp=false` pref returns `null` from `createNotification`. |
| Alert STAGED inside the entitlement tx via `DripResolverMarker(purpose='coach_new_purchase', purchase_id, content_id='-')` claim; bucket flushed POST-commit | ✅ Staging at `src/packages/purchase-fanout.service.ts:401-422` uses `tx.dripResolverMarker.create(...)` inside the outer tx. Bucket is in-memory `pendingCoachNewPurchaseAlerts` (`:185-188`). Flush at `:475-502` (`flushAlerts` → `flushCoachNewPurchaseAlert`) is called post-commit by `BillingService` `src/billing/billing.service.ts:553-565` and `GuestCheckoutService` `src/storefront/guest-checkout.service.ts:1781-1789`. |
| Rollback discards the staged alert via `discardPendingAlerts` | ✅ `src/packages/purchase-fanout.service.ts:509-517` clears both the drip-released bucket AND the new coach-new-purchase bucket. Called from `BillingService:533-543` and `GuestCheckoutService:1767-1773` on tx failure. Marker INSERT rides the same tx so it rolls back too. |
| Idempotent across Stripe webhook replay — exactly one COACH_NEW_PURCHASE per purchase | ✅ Marker `@@unique([purpose, purchase_id, content_id])` (`prisma/schema.prisma:4787`). On replay, the second `create` throws P2002 (swallowed at `:413-422`), `claimedFirst` stays false, bucket never populated, flush is a no-op (`:534`). Test `test/purchase-fanout-coach-new-purchase.spec.ts:"replay does not double-notify the coach"` asserts `state.markers.length === 1` and the push count unchanged after a second `onPurchaseEntitled` call. |
| Stages from the empty-contents early-return path AND the main fan-out path | ✅ Empty-contents path at `:250`; main path at `:373`. A paywall-only purchase still notifies the coach. |
| Coach who has prefs OFF suppresses the in-app row | ✅ `createNotification` checks per-kind prefs at `src/notifications/notifications.service.ts:286-290` and returns `null`. Test `test/coach-new-purchase-prefs-routing.spec.ts:50-65` confirms the suppression. **Caveat:** `pushToUser` (the Expo transport) does NOT consult prefs — see P3-1. |
| Fires once across ALL 3 entitlement paths | ✅ All 3 paths (`in_app_hosted` `:230`, `in_app_ps` `:463`, `storefront_guest` `:1744`) call the same `onPurchaseEntitled`, which calls `stageCoachNewPurchaseAlert` whose marker-claim is keyed only on `purchase_id` (not `entrypoint`) → at most one alert per purchase even if two different paths fire for the same purchase. |
| Guest-converted purchase still notifies | ✅ The guest path goes through `convertGuestToUser` → `fanout.onPurchaseEntitled(...)` `:1744` → staging → post-tx `flushAlerts(purchaseId)` `:1783`. Test `test/purchase-fanout-coach-new-purchase.spec.ts:230-248` asserts the body builds correctly for a guest-just-converted user with empty `name` (falls back to email). |
| Notification delivery failures NEVER roll back entitlement | ✅ The full `flushCoachNewPurchaseAlert` body (`:558-597`) runs inside a `void (async () => { ... })()` IIFE outside the tx, each call independently try-wrapped — matches the decision-#9 boundary. |

### A3 — SSR thank-you parity

| Claim | Verified |
|---|---|
| Reuses the A1 buyer-scoped drop query | ✅ `src/storefront/thank-you.service.ts:80-83` calls `this.checkout.listDropsForBuyer(purchase.client_user_id, purchase.id)` — same path, same IDOR rule, same SQL WHERE filter, same COALESCE order. No divergent / duplicated query. |
| Buyer-scoped to the just-converted purchase only | ✅ `src/storefront/thank-you.service.ts:59-77` resolves `ClientPurchase` by `stripe_checkout_session_id` (Stripe-issued opaque token, not enumerable), 404s if not entitled, and passes the resolved `client_user_id` into `listDropsForBuyer` — which enforces ownership at the SQL WHERE. No way for a session_id holder to see another buyer's drops. |
| Pre-entitlement → 404 (does not show an empty "your stuff" page misleadingly) | ✅ `src/storefront/thank-you.service.ts:72-77` |
| Renders delivered + upcoming + receipt + next-charge (recurring) | ✅ Delivered split at `:98-100`; receipt amount via `Intl.NumberFormat` (`:120-129`); recurring `nextChargeAt = current_period_end` `:107`; HTML render at `src/storefront/thank-you.html.ts:28-53`. SSR test `test/thank-you.ssr.spec.ts` (7 tests) verifies all of these including the recurring branch and the "future-only drops" upcoming-schedule case. |
| SSR — no client-JS dependency | ✅ `src/storefront/thank-you.html.ts:136-175` is a pure-function string; no `<script>` tags emitted; XSS-safe via `escapeHtml` on every dynamic value. Test `test/thank-you.ssr.spec.ts` asserts `<script>` and `"><img onerror=...>` payloads are HTML-escaped. |
| Scope-guard: extends existing storefront, doesn't rebuild | ✅ Two new files (`thank-you.service.ts` + `thank-you.html.ts`), one route added on the existing `StorefrontPublicController` (`src/storefront/storefront-public.controller.ts:390-400`) under the same `/v1/packages/public/*` namespace, ThankYouService wired in the existing `StorefrontModule` (`src/storefront/storefront.module.ts:21,87`). No other storefront surfaces touched. |
| `noindex,nofollow` + `private,no-store` (the session URL must not be cached or indexed) | ✅ `src/storefront/storefront-public.controller.ts:393-394` (`Cache-Control: private, no-store`) + `src/storefront/thank-you.html.ts:141` (`noindex,nofollow`). |

### Scope-guard (A is additive only)

| Claim | Verified |
|---|---|
| No changes to `DripDispatcherCron` | ✅ Confirmed via `git diff main --stat` — `drip-dispatcher.cron.ts` not in the changed-files list. |
| No changes to asset resolvers / media internals | ✅ Confirmed via diff — no `src/packages/asset-resolvers/*` and no `coach-media*` files touched. |
| `PurchaseFanoutService.onPurchaseEntitled` only adds an additive staging block; original fan-out body unchanged | ✅ The new staging call `stageCoachNewPurchaseAlert` is invoked at the empty-contents early-return (`:250`) and at the end of the normal path (`:373`); the drop seeding / immediate-inline resolver loop in between (`:255-370`) is the PR-9 / PR-10 body unchanged in this PR (verified by reading the surrounding code). |

### Migration

| Claim | Verified |
|---|---|
| 3 ALTERs, NOT NULL with static defaults → metadata-only ALTER, no backfill needed | ✅ `prisma/migrations/20261208000000_pr15_coach_new_purchase_prefs/migration.sql:24-29` |

### Mobile contract alignment

| Claim | Verified |
|---|---|
| Field names match PR13_BUILD_REPORT §c lines 76-115 EXACTLY | ✅ Compared the 11-field list in `BuyerDropView` (`src/checkout/checkout.service.ts:60-74`) against PR13_BUILD_REPORT.md §c lines 86-93. Identical: `id`, `asset_type`, `asset_id`, `asset_revision_id`, `cadence_kind`, `display_title`, `display_caption`, `fire_at`, `fired_at`, `status`, `materialised_ref`. |
| Envelope `{ drops: [...] }` (PR-13 mobile unwrap accepts both, server ships the envelope) | ✅ Returned at `src/checkout/checkout.service.ts:739`. |
| `pending`/`due`/`fired` returned as-is (not collapsed server-side) | ✅ `BuyerDropView.status` re-exported untouched at `:750`. |

---

VERDICT (restated): **CLEAN**. Zero P0/P1/P2 findings. Three non-blocking P3 notes recorded. The PR matches the brief, the mobile contract, and its own build report's claims; typecheck/lint/full-test-suite all pass with the exact counts the builder advertised (299 suites / 3597 tests, 22 new).
