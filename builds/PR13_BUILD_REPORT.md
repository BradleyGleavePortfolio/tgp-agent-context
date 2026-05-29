# PR-13 BUILD REPORT — Mobile "Deliverables" section (buyer-facing drip timeline)

**PR:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/210
**Branch:** `pr13/mobile-deliverables` off `main`.
**Base:** `main`
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — no Co-Authored-By / Generated trailers.
**Status:** revised after audit (PR13_AUDIT.md). All checks green; two commits on the branch (`96c835e` build, `3db2c75` audit fix).

---

## Audit response (PR13_AUDIT.md — round 1)

The independent audit raised no P0 / P1 findings. Two P2 findings + minor P3 nits, all addressed on the same branch in commit `3db2c75`:

**P2-1 — CTA pointed at a route that does not exist; buyer saw raw axios message.**

- Added `featureFlags.deliverables` (env `EXPO_PUBLIC_FF_DELIVERABLES`), default OFF in production, ON in `__DEV__`. The "View what's included" CTA on `ClientPackagesScreen` is gated behind it so paying users do not land on a dead feature today.
- `clientPaymentsApi.getPurchaseDrops` now maps HTTP 404 → `not_configured` envelope (scoped exception to PR-1's "404 ≠ not_configured" rule — the buyer-facing drops route is a publicly tracked backend prereq, not a typo). 501 keeps the same mapping. 5xx and network errors stay retryable.
- `DeliverablesScreen` error branch no longer renders `{result.message}` — the buyer sees a friendly copy ("Check your connection and try again. If this keeps happening, message your coach."). Technical message stays in `result.message` for the logger only (Rule 9 / Rule 17).

**P2-2 — meal_plan tap fabricated routing success: destination ignored the date param.**

- `ClientDailyMealPlanScreen` now reads `route.params.date` via `useRoute`, normalises to `YYYY-MM-DD` (defensive — accepts a full ISO timestamp; rejects malformed input), and passes through to `useMealPlanToday(dateParam)`. Defaults to `undefined` (today) when no param is provided — the legacy call site is unaffected.
- Header copy and empty state flip to "Meal plan" / "No plan for this day" when a date is provided so the buyer is not confused into thinking they're looking at today's plan.
- Test added (`clientDailyMealPlanRouteParam.test.tsx`, 5 assertions) that mounts the meal plan screen with various route params and asserts `useMealPlanToday` is called with the resolved date — defense against a self-fulfilling nav-mock. The destination-honors-the-param contract is also asserted via source-grep in `deliverablesScreen.test.tsx`.

**P3 nits.**

- `accessibilityRole='summary'` (not a documented RN role) replaced with `'text'` on non-tappable rows.
- Docstring drift fixed: the screen uses `Intl.RelativeTimeFormat` directly; the docstring now reflects that rather than claiming `src/utils/date.ts`.

**Audit verification after fix:**

```
$ npm run typecheck → 0 errors
$ npm run lint      → 0 errors, 72 pre-existing warnings (baseline unchanged)
$ npx jest          → 1484 / 1484 passing across 138 suites (+11 new assertions)
```

---

## (a) PR URL

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/210

## (b) Screens / sections added

1. **`src/screens/client/DeliverablesScreen.tsx`** (new) — the buyer-facing per-`ClientPurchase` Deliverables timeline. Route name `Deliverables`, params `{ purchaseId: string; packageName?: string }`. Registered on the MoreStack of `ClientNavigator.tsx`. Renders:
   - Header: `{packageName} • Deliverables` (or `Deliverables` if not provided).
   - **Delivered** section: rows of `status='fired'` drops with title, optional caption, asset-type icon, delivered date, and tappable destination per asset_type.
   - **Upcoming** section: rows of `status in ('pending','due')` drops with locked styling, lock icon, and "Unlocks {when}" copy.
   - Loading: full-screen `SkeletonScreen` (count 6).
   - Empty: cube icon + "No deliverables yet" copy (also the render for the `not_configured` 501 envelope, since that's the calm "coach hasn't enabled this" signal).
   - Error: alert icon + scrubbed error message + **Retry** button (refetches the GET).
   - Pull-to-refresh via `RefreshControl`.
2. **`src/screens/client/ClientPackagesScreen.tsx`** (modified) — the Current plan card now exposes a **"View what's included"** CTA that navigates to `Deliverables` with the active `ClientPurchase.id`. Sole entry point per Rule 21 (no orphan routes).
3. **`src/api/clientPaymentsApi.ts`** (modified) — adds:
   - `ScheduledDropAssetType` / `ScheduledDropCadenceKind` / `ScheduledDropStatus` discriminated unions matching master plan §3 / backend Prisma enums.
   - `ScheduledDropView` interface — the typed shape the buyer UI consumes.
   - `getPurchaseDrops(purchaseId)` — the typed-client method against the documented backend contract.
   - `purchase_id` on `ClientPaymentStatus` so the screen can deep-link without a second round trip.
4. **`src/navigation/ClientNavigator.tsx`** (modified) — registers `Deliverables` on `MoreStackParamList` with typed params (Rule 27); mounts the screen on the MoreStack navigator.
5. **`src/__tests__/deliverablesScreen.test.tsx`** + **`src/__tests__/deliverablesApi.test.ts`** (new) — 36 assertions across pure-helper unit tests, API contract tests, RTL mount tests, and source/nav-wiring guards.

## (c) Backend endpoint consumed OR documented gap

**Path taken: documented gap + typed client contract.** No buyer-facing drops/deliverables endpoint exists on the backend today. Verified by:

- Reading `growth-project-backend/src/checkout/checkout.controller.ts`@`main` — only `@Get('purchases')`, `@Get('entitlement')`, `@Get('payment-method')`, `@Get('sessions/:sessionId/confirm')`. No drops/deliverables route.
- Reading `growth-project-backend/src/packages/packages.controller.ts` and `package-contents.controller.ts` — package-contents is coach-only authoring (`@Controller('v1/coach/packages/:id/contents')`), not buyer-visible and not snapshot-aware.
- `grep -rn "@Get" src | grep -iE "drop|deliverable"` across the backend returns zero hits.

PR-13 is mobile-only per the brief's scope guardrail, so this PR does **not** add a backend route. Instead it ships a clean, typed client contract (see below) so wiring the UI to a real endpoint is a one-line change the moment the backend ships it.

**Backend follow-up prereq (recommended shape, documented in `clientPaymentsApi.ts` header):**

```
GET /v1/checkout/purchases/:purchaseId/drops

Auth:     JwtAuthGuard; req.user.id must own ClientPurchase.client_id
          (IDOR guard).
Response: { drops: Array<{ id, asset_type, asset_id, asset_revision_id,
                           cadence_kind, display_title, display_caption,
                           fire_at, fired_at, status, materialised_ref }> }
Source:   ScheduledDrop where client_purchase_id = :purchaseId,
          ordered by COALESCE(fired_at, fire_at, created_at) ASC.
Filter:   status IN ('pending','due','fired')  -- master plan §1 #10:
          failed/canceled/skipped go to the COACH_ALERT path, not
          the buyer.
```

**Envelope behaviour today** (mirrors PR-1's posture):

- `501 Not Implemented` → `{ ok: false, reason: 'not_configured' }` → UI shows the calm empty state.
- `404 / 5xx / network` → `{ ok: false, reason: 'error', message }` → UI shows the retry banner. **A 404 is NEVER mapped to `not_configured`** — that's the exact regression PR-1 codified.
- `200 { drops: [...] }` (envelope) or `200 [...]` (bare array) both accepted by the unwrap.

## (d) Existing viewers routed to per asset_type

No new viewers built (PR-13 brief scope guardrail). Routes to existing screens already registered on `ClientNavigator`:

| `asset_type` | Existing route | Params | Source |
|---|---|---|---|
| `workout_program` | `WorkoutAssignmentDetail` | `{ assignmentId: materialised_ref }` | `MoreStack` — already registered for PR #130 |
| `workout_plan` | `WorkoutAssignmentDetail` | `{ assignmentId: materialised_ref }` | same as above (workout-plan assignments materialise as `WorkoutAssignment` rows) |
| `meal_plan` | `ClientDailyMealPlan` | `{ date: materialised_ref }` | `MoreStack` — already registered |
| `auto_message` | `Messages` (parent Home stack) | none | routes via `navigation.getParent().navigate('Home', { screen: 'Messages' })` — same pattern `ClientPackagesScreen.handleMessageCoach` uses |
| `pdf` | (none — non-tappable) | n/a | viewer ships in PR-12 (out of scope); row renders with "Saved to your library" caption + no chevron — graceful degrade per Rule 18 |
| `video` | (none — non-tappable) | n/a | same as `pdf` |

For all delivered drops the row is **non-tappable** when:
- It targets `workout_program`/`workout_plan`/`meal_plan` but `materialised_ref` is null/empty (master plan rule 18 — never fabricate success).
- It targets `pdf` or `video` (no viewer registered yet).

A non-tappable row renders as a plain `<View>` — verified in the RTL test (`drop-row-d4` props.onPress is undefined).

## (e) States handled

| State | Handler |
|---|---|
| **Loading** | `<SkeletonScreen count={6} testID="deliverables-skeleton" />` while `result` is null |
| **Delivered + Upcoming (healthy)** | Two sectioned lists, delivered first, sorted most-recent-fired-first; upcoming sorted soonest-first (nulls last) |
| **Buyer-visibility filter** | `status in ('failed','canceled','skipped')` rows filtered out client-side (defense-in-depth even when the backend filter lands) |
| **Empty (no drops)** | "No deliverables yet" empty state — cube icon, neutral copy |
| **`not_configured` (501)** | Same empty state — coach hasn't enabled deliverables on this deployment |
| **Error (404/5xx/network)** | "We couldn't load deliverables" + scrubbed message + **Retry** button |
| **Pull-to-refresh** | `<RefreshControl>` on every `<ScrollView>` branch; refetches `getPurchaseDrops(purchaseId)` |
| **Refresh on focus** | `useFocusEffect(load)` — covers the user returning from a viewer or from checkout return |
| **Missing `materialised_ref`** | Delivered row still renders but is non-tappable + caption falls back to type-appropriate copy ("Tap to open" → never if non-tappable; pdf/video → "Saved to your library") |

## (f) Failed-drop buyer-visibility decision

**Failed / canceled / skipped drops are HIDDEN from the buyer entirely.**

Master plan §1 #10 explicitly says failure routes to `COACH_ALERT` (and a structured log) — the coach is the one with the agency to fix the failure (re-attach content, re-trigger, refund, etc.). Showing the buyer a "this drop failed" row would:

1. Surface a server-internal failure mode to a non-technical user (violates Rule 9 — no raw error codes / Rule 17 — scrub server internals).
2. Imply the buyer can do something about it when they cannot.
3. Re-litigate decisions the coach owns.

Defense-in-depth: even when the backend ships the recommended `status IN ('pending','due','fired')` server-side filter, the client also filters in `buyerStatusOf()` so a future drift cannot leak a failed row to the buyer. The unit test `HIDES failed / canceled / skipped (coach gets COACH_ALERT, not buyer)` is the regression guard.

## (g) Test results (post-audit-fix totals)

```
$ npm run typecheck
tsc --noEmit  →  0 errors

$ npm run lint
0 errors, 72 warnings (all pre-existing in unrelated files; baseline unchanged)

$ npx jest
Test Suites: 138 passed, 138 total
Tests:       1484 passed, 1484 total
Snapshots:   4 passed, 4 total
```

**New tests** (47 assertions across 3 new files after audit-round-1 fix):

- `src/__tests__/deliverablesApi.test.ts` — typed contract:
  - GET path is `/v1/checkout/purchases/:id/drops` with URL encoding.
  - Both `{drops: []}` envelope and bare array shapes unwrap correctly.
  - 501 + **404** → `not_configured` (audit fix P2-1 — calm empty state for the documented backend prereq).
  - 5xx + network failures stay retryable `error`.
  - `getPaymentStatus` now exposes `purchase_id` for the entry-point deep link.
- `src/__tests__/clientDailyMealPlanRouteParam.test.tsx` (new — audit fix P2-2): RTL mount of `ClientDailyMealPlanScreen` with various route params, asserting `useMealPlanToday` is called with the resolved date (full ISO + plain YYYY-MM-DD + malformed param + missing param). Defense against the self-fulfilling nav-mock the audit flagged.
- `src/__tests__/deliverablesScreen.test.tsx`:
  - Pure-helper tests for `buyerStatusOf` (delivered/upcoming/hidden), `isTappableDelivered` (per-asset_type rules), and `upcomingCaption` (on_completion / on_milestone / fire_at fallback).
  - Source guards: `useTheme().colors` only, no hardcoded hex, `RefreshControl` present, `SkeletonScreen` loading branch.
  - Nav wiring guards: `Deliverables` registered with typed params (Rule 27); `ClientPackagesScreen` exposes the reachable navigate() into it (Rule 21).
  - RTL mount tests for all 5 buyer-visible states:
    - Skeleton on first mount.
    - Delivered + Upcoming sections from a healthy response (with a `status='failed'` row verified hidden).
    - Empty state when no buyer-visible drops.
    - Error state with `Retry` testID present.
    - `not_configured` (501) renders the calm empty state.
  - RTL routing tests: `workout_program` → `WorkoutAssignmentDetail` with `assignmentId`; `meal_plan` → `ClientDailyMealPlan` with `date`; `auto_message` → parent navigator's `Home` → `Messages`.
  - RTL graceful-degrade test: delivered workout with no `materialised_ref` renders non-tappable; `mockNavigate` is never called.
  - RTL pull-to-refresh test: invoking the `RefreshControl.onRefresh` re-calls `getPurchaseDrops`.

**Regression posture**: every existing test (1437 prior assertions) still passes, including the PR-1 / PR-5 navigation + payments contract tests — verified by running the full suite, not just the new tests.

## Scope guardrails honored

- Mobile only. No backend changes (the brief explicitly forbade cross-repo).
- No new viewers built — reuses `WorkoutAssignmentDetail`, `ClientDailyMealPlan`, and `Messages`.
- Did not touch coach authoring (PR-8 / future coach mobile), media upload (PR-12), purchase-unpack / thank-you (PR-15), or refund UI (PR-16).
- One screen, one route, one API method, one entry-point CTA, two test files — minimal diff for the surface added.
