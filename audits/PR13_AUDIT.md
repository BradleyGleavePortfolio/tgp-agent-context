# AUDIT — PR-13: Buyer-facing Deliverables timeline (mobile drip engine consumer surface) (PR #210)

**Audited commit:** `96c835e` (single commit on branch `pr13/mobile-deliverables`)
**Base:** `main`
**Files changed:** 6 (+1651 / -0). Mobile only — no backend files touched. ✓ scope guardrail honored.
**Auditor posture:** I did not write this code. Did not modify any code. Audit only.

---

## Run results (executed locally, not trusted from build report)

| Check                          | Result                                                       |
|--------------------------------|--------------------------------------------------------------|
| `npm run typecheck` (tsc)      | **PASS** — 0 errors                                          |
| `npm run lint`                 | **PASS** — 0 errors, 72 pre-existing warnings (baseline unchanged) |
| `npx jest`                     | **PASS** — 137 / 137 suites, **1473 / 1473** tests, 4 snapshots |

The PR description's `1473/1473 (+36 assertions across 2 new test files)` claim — **verified true**.

---

## Verdict-level question (raised explicitly by the brief)

> "Is shipping a screen whose data source doesn't exist yet acceptable, or a P2 (dead feature until backend lands)?"

The endpoint `GET /v1/checkout/purchases/:purchaseId/drops` does **not exist on the backend today** (the PR header in `src/api/clientPaymentsApi.ts:644-665` explicitly admits this, and I separately confirmed by inspecting `growth-project-backend/src/checkout/checkout.controller.ts@main` — only `purchases`, `entitlement`, `payment-method`, `sessions/:id/confirm`, `sessions`, `billing-portal` exist; no drops/deliverables route).

**Effect on a paying user today:** the "View what's included" CTA is rendered on `ClientPackagesScreen` whenever `status.data.purchase_id` is truthy (every active/past_due/canceled buyer). Tapping it mounts `DeliverablesScreen` → `getPurchaseDrops` 404s → wrap maps 404 to `{ ok: false, reason: 'error', message: err.message }` → screen renders the error state with `<Text>{result.message}</Text>` (`DeliverablesScreen.tsx:304`). The message comes straight from axios — `"Request failed with status code 404"` (or similar) — shown verbatim to the buyer.

This is a real UX defect today, on the day this PR merges, for every paying client. It is not a crash, it is not a security issue, and the screen does **not** fabricate fake data (the screen is honest about failure). But it is "dead-feature behind a visible, prominently styled CTA labeled 'View what's included' that shows a scary 404 message" — and the build report itself calls out (PR-13 BUILD REPORT §f) that scary server internals must not reach the buyer (Rule 9 / Rule 17). I classify this as **P2**: misleading UX state shipped to paying users, not blocked by a feature flag, and the CTA is the sole entry point so it cannot be discovered "by accident".

Acceptable fixes (any one of): (a) gate the CTA behind a feature flag that's off in prod until the backend route lands; (b) hide the CTA when the first call returns `error` (probe-then-show); (c) ship the matching backend route before this PR merges so the CTA actually works. Rendering a calm "Coming soon — your coach is preparing your deliverables" copy instead of `err.message` would help but does not fix the dead-CTA problem.

---

## P0 findings
*(broken behaviour, money/security/crash, fabricated routes/fields)*

**None.**

I specifically hunted for the PR-1 sin (fabricated routes/fields on `ClientPurchase` or the new types) and did **not** find it. The `ClientPurchase` type (`clientPaymentsApi.ts:120-138`) lists only columns that exist on the backend Prisma `ClientPurchase` model. The new `ScheduledDropView` type (`clientPaymentsApi.ts:219-234`) maps to master-plan §3 `ScheduledDrop` columns — each field is documented and matches the spec. The new `purchase_id` field on `ClientPaymentStatus` is sourced from a real `ClientPurchase.id` and gracefully nulled when state is `'none'` or from `confirmCheckoutSession` (which returns no row id; `clientPaymentsApi.ts:722`).

---

## P1 findings
*(significant correctness/robustness gap)*

**None.**

`useFocusEffect` + `useEffect(load)` both kick `load()` — duplicate-load is benign (read-only GET; no idempotency concern). Pull-to-refresh wires through `RefreshControl.onRefresh`. Per-asset_type viewer routing matches existing registered screens (`WorkoutAssignmentDetail`, `ClientDailyMealPlan`, `Messages` via `Home` parent stack — all confirmed in `ClientNavigator.tsx`). Failed/canceled/skipped statuses are filtered out by `buyerStatusOf` (`DeliverablesScreen.tsx:95-99`) — defense-in-depth even when the backend filter eventually lands.

---

## P2 findings
*(meaningful quality issue — these block merge under the audit's stated bar)*

### P2-1. CTA is wired today but the endpoint does not exist → every paying user who taps "View what's included" sees an error.
- **File:** `src/screens/client/ClientPackagesScreen.tsx:307-333` (the CTA, not flag-gated)
- **File:** `src/api/clientPaymentsApi.ts:690-706` (the typed-client method against a route the backend does not register today)
- **File:** `src/screens/client/DeliverablesScreen.tsx:291-316` (renders raw `err.message` verbatim)
- **Evidence:** Backend `growth-project-backend/src/checkout/checkout.controller.ts@main` does not register `/v1/checkout/purchases/:id/drops`. The PR header in `clientPaymentsApi.ts:644-665` explicitly documents the gap. The CTA in `ClientPackagesScreen.tsx:307` is rendered whenever `status.data.purchase_id` is non-null — no flag, no probe.
- **Fix:** gate the CTA on a feature flag (e.g. `featureFlags.deliverables`) and ship the flag OFF in prod; OR detect the 404 on first load and hide the CTA from the upstream screen; OR sequence the merge so the backend route lands first. Also: when state surfaces `reason: 'error'`, render a humanised body (not the raw axios message — `result.message` is something like "Request failed with status code 404", which is exactly the "scary server-internals" the build report (§f) and `clientPaymentsApi.ts:352-355` say must never reach the buyer).

### P2-2. `meal_plan` delivered taps navigate to `ClientDailyMealPlan` with `{ date: materialised_ref }` but the target screen **ignores the `date` param entirely**.
- **File:** `src/screens/client/DeliverablesScreen.tsx:540-549` (passes `{ date: drop.materialised_ref }`)
- **File:** `src/screens/client/ClientDailyMealPlanScreen.tsx:35-49` (no `useRoute`, no `route.params` read; always calls `useMealPlanToday()`)
- **Evidence:** `grep useRoute src/screens/client/ClientDailyMealPlanScreen.tsx` → zero hits. The screen renders **today's** meal plan unconditionally; the `date` argument is silently dropped. A buyer tapping a delivered meal_plan drop from (e.g.) 2026-05-01 today is shown the meal plan for **today**, not the historical one the drop is supposed to materialise.
- **Why P2 not P3:** the screen's typed contract claims `{ date?: string } | undefined` (`ClientNavigator.tsx:217`) and the build report (§d) explicitly claims `meal_plan → ClientDailyMealPlan { date }` is the routing target. The user-facing behaviour does not match the claim. The unit test asserts that `mockNavigate` was called with the right shape (`deliverablesScreen.test.tsx:453`) — a classic self-fulfilling-mock: the test verifies the navigation **call**, not that the destination screen does the right thing with the param. (`ClientDailyMealPlan` has no test that exercises a `date` param either — there is nothing to exercise.)
- **Fix:** either (a) make `ClientDailyMealPlanScreen` read `route.params.date` and fetch the assigned plan that covers that date (the build report claims "the meal-plan viewer is keyed by date" — that is the intended contract, but it's unimplemented), or (b) accept that the meal-plan viewer is today-only, drop the `date` param from the typed nav, and update the routing to not pass one. The status quo silently fabricates routing success — exactly the "Rule 18" anti-pattern this PR claims to honour.

---

## P3 (non-blocking)

- **P3-1.** `DeliverablesScreen.tsx:29` claims the date helpers use `src/utils/date.ts`, but the screen imports nothing from there and uses raw `Intl.RelativeTimeFormat` + `new Date()` directly (`DeliverablesScreen.tsx:110-153`). The arithmetic is fine (timezone-safe enough — uses `Date.parse` of ISO timestamps and millisecond math) but the docstring drifts from the code. Either import the app's date util or amend the comment.
- **P3-2.** `useFocusEffect` is **no-oped** in `deliverablesScreen.test.tsx:260` (the mock comments concede this: "refetch-on-focus belongs to a navigation integration test"). The build report (§e) lists "Refresh on focus" under states handled, but the behaviour is not directly tested. Pure `useEffect(load)` is tested instead. Acceptable, but the test gap is worth flagging.
- **P3-3.** `clientPaymentsApi.ts:362-371` `wrap()` surfaces `err.message` verbatim from axios for the `'error'` branch. Same pattern PR-1 established for every other route in this file — not new in this PR — so the doctrine drift is repo-wide, not PR-specific. Cleaning it up would help here (P2-1) and elsewhere.
- **P3-4.** `DeliverablesScreen.tsx:471` sets `accessibilityRole={variant === 'upcoming' ? 'text' : 'summary'}` — `'summary'` is not a documented React Native accessibility role; `'text'` would be correct for both. Cosmetic.
- **P3-5.** The 7-day boundary in `formatUnlockAt` (`DeliverablesScreen.tsx:134`) means at `t = 7d + ε` the copy flips from "Unlocks in 7 days" to "Unlocks May 31" — a minor cliff. Fine.

---

## Verification of PR-claims (from the PR description / build report)

| Claim | Verified |
|---|---|
| "1473 / 1473 passing across 137 suites" | **True** (re-ran `npx jest` here) |
| "`tsc --noEmit` 0 errors" | **True** (re-ran `npm run typecheck`) |
| "0 lint errors, 72 pre-existing warnings" | **True** (re-ran `npm run lint`) |
| "501 → not_configured, 404 → error" (PR-1 posture preserved) | **True** — `clientPaymentsApi.ts:357-360` checks `status === 501` only; 404 falls to the `'error'` branch. Test at `deliverablesApi.test.ts:105-118` covers this. |
| "ClientPurchase + ScheduledDropView fields exist on backend models" | **True** — every field is on the master-plan §3 `ScheduledDrop` shape or on the `ClientPurchase` Prisma model |
| "Failed / canceled / skipped hidden from buyer" | **True** — `buyerStatusOf` returns `null` for those three (`DeliverablesScreen.tsx:95-99`); test at `deliverablesScreen.test.tsx:74-78` is the regression guard |
| "Workout drops route to existing `WorkoutAssignmentDetail`" | **True** — route registered on MoreStack (`ClientNavigator.tsx:443`), accepts `{ assignmentId }` (`WorkoutAssignmentDetailScreen.tsx:39`). Tap-routing test at `deliverablesScreen.test.tsx:426` |
| "Meal-plan drops route to existing `ClientDailyMealPlan { date }`" | **PARTIALLY FALSE** — route exists, but the destination screen ignores the `date` param (see P2-2 above). The build report (§d) overstates the wiring. |
| "Auto-message drops route to `Messages` via parent Home stack" | **True** — `MessagesScreen` exists on `HomeStack` (`ClientNavigator.tsx:328`), parent-navigator hop pattern matches the existing `ClientPackagesScreen.handleMessageCoach` precedent. |
| "PDF / video non-tappable today (PR-12 OOS)" | **True** — `isTappableDelivered` returns false for both; row renders as plain `<View>`. |
| "`purchase_id` derived from `ClientPurchase.id` (real column)" | **True** — `clientPaymentsApi.ts:580`. Tested at `deliverablesApi.test.ts:120-163`. |
| "ClientPackagesScreen exposes a 'View what's included' CTA" | **True** — `ClientPackagesScreen.tsx:307-333`. **But:** the CTA is not flag-gated and the endpoint it leads to does not exist on the backend (see P2-1). |
| "No backend files touched" | **True** — diff confined to 6 mobile files (`src/api/`, `src/navigation/`, `src/screens/client/`, `src/__tests__/`). |

---

## Summary

PR-13 is a **disciplined, well-typed mobile build** that honours the scope guardrails (no backend changes, no new viewers built, no parallel design language) and avoids the PR-1 fabricated-field sin. The buyer-visibility filter, state handling, pull-to-refresh, and accessibility labels are all in place. Tests are real (RTL mount + helper unit + source guards + API contract) and pass cleanly.

Two issues block a CLEAN verdict under the audit's stated bar (P0/P1/P2 must be zero):

1. The CTA is wired today, but the backend endpoint it depends on is not yet registered — every paying user who taps "View what's included" will see a raw-axios error message until the backend ships its half. The screen should either be flag-gated, probe-then-show, or merge sequenced behind the backend route. (P2-1)

2. `meal_plan` drops route with a `date` param to a screen that does not consume it, so the destination silently renders today's meal plan instead of the materialised date. Either fix the consumer or drop the param from the contract. (P2-2)

Both are correctable in <50 lines; neither requires re-architecture.

VERDICT: NOT CLEAN
