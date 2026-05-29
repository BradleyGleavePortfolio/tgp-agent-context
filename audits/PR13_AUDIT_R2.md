# AUDIT R2 — PR-13: Buyer-facing Deliverables timeline (mobile) (PR #210)

**Audited commit:** `3db2c75` on branch `pr13/mobile-deliverables` (HEAD; the audit-response commit on top of `96c835e`).
**Base:** `main`
**Diff vs base:** 9 files (+1935 / -17). Mobile only; no backend files touched. ✓ scope guardrail preserved.
**Round 2 diff vs `96c835e`:** 8 files (+324 / -57); +1 new feature-flag config, +1 new RTL test file.
**Auditor posture:** I did not write this code. Did not modify any code. Audit only.

---

## Run results (re-executed locally; not trusted from build report)

| Check                          | Result                                                       |
|--------------------------------|--------------------------------------------------------------|
| `npm run typecheck` (tsc)      | **PASS** — 0 errors                                          |
| `npm run lint`                 | **PASS** — 0 errors, 72 pre-existing warnings (baseline unchanged) |
| `npx jest`                     | **PASS** — 138 / 138 suites, **1484 / 1484** tests, 4 snapshots |

The build report's `1484 / 1484 (+11)` and `138 suites` claims — **verified true**.

---

## Round-2 verdict on the two R1 P2 findings

### P2-1 (CTA → 404 → raw axios message) — **RESOLVED**

Three independent gates now stand between a paying buyer and a scary message:

1. **Feature flag gates the CTA.**
   - `src/config/featureFlags.ts:82` defines `featureFlags.deliverables = readFlag('EXPO_PUBLIC_FF_DELIVERABLES', isDev)`.
   - `isDev` at `featureFlags.ts:19-21` is `process.env.NODE_ENV !== 'production' && !!__DEV__`. In a prod EAS bundle `NODE_ENV === 'production'`, so `isDev=false`; with the env var unset the fallback is `false`. **Default OFF in prod is correctly wired**, ON in `__DEV__` for local preview.
   - `ClientPackagesScreen.tsx:316` renders the CTA only `if (featureFlags.deliverables && status.data.purchase_id)`. With the flag off the CTA is **not rendered at all** — verified by reading the JSX; the row is `null` in the `else` branch (`ClientPackagesScreen.tsx:341`).
2. **API maps 404 → `not_configured`** (scoped, documented exception to PR-1's rule).
   - `clientPaymentsApi.ts:718-733` `getPurchaseDrops` catches the axios error, reads `err.response.status`, and returns `{ ok: false, reason: 'not_configured' }` on `404 || 501`. 5xx and network errors keep the retryable `error` envelope. Mapping verified by the new test at `deliverablesApi.test.ts:105-122` (404) and `deliverablesApi.test.ts:123-129` (5xx stays retryable). The scoped-exception reasoning is documented inline (`clientPaymentsApi.ts:693-707`) and is defensible — this endpoint is a publicly tracked backend prereq, not a typo.
3. **Error branch renders only friendly copy.**
   - `DeliverablesScreen.tsx:294-329` is the `reason === 'error'` branch. JSX renders the title "We couldn't load deliverables" and body "Check your connection and try again. If this keeps happening, message your coach." plus a Retry button. **No `{result.message}` anywhere** — `grep -n "result\.message" DeliverablesScreen.tsx` returns only the comment at line 299 explaining that the technical message stays on the result object for the logger, never the UI. ✓
   - Regression guard: `deliverablesScreen.test.tsx:415-433` asserts `queryByText('Request failed with status code 502')` is **null** while the friendly copy IS rendered. This test would fail on a revert that re-introduces raw-message rendering.

**Net trace today:** flag OFF in prod → CTA not rendered → screen unreachable → no scary path. If a dev build flips the flag → 404 → `not_configured` → calm empty state. If the user is on flag-on and a real transient (5xx/network) hits → friendly retry banner, no raw axios text. **No scary path remains.** ✓

### P2-2 (`meal_plan` date param silently ignored) — **RESOLVED**

- `ClientDailyMealPlanScreen.tsx:65-69`: `const route = useRoute<...>()` reads `route.params?.date`, normalises via `normaliseDateParam` (`ClientDailyMealPlanScreen.tsx:52-59`), and passes the result to `useMealPlanToday(dateParam)`.
- `normaliseDateParam` accepts a full ISO timestamp (matches `^(\d{4}-\d{2}-\d{2})`) and returns the YYYY-MM-DD prefix; rejects anything that doesn't start with that shape (returns `undefined`, falling back to today). **The malformed path can NOT propagate an `Invalid Date` to the hook** — the function returns either a valid YYYY-MM-DD or `undefined`. ✓
- The hook honours the param end-to-end: `useMealPlanToday(dateIso)` keys the React Query cache on `['meal-plan', 'today', dateIso ?? null]` and calls `mealTemplatesApi.todayForClient(dateIso)` (`useMealTemplates.ts:157-163`), which appends `?date=<iso>` to `/me/meal-plan/today` (`mealTemplatesApi.ts:179-184`). Legacy call sites with no param still resolve to today.
- The new test `clientDailyMealPlanRouteParam.test.tsx` is **not self-fulfilling**:
  - It mocks `useMealPlanToday` to record the actual argument the screen passed in (`mockUseMealPlanToday(dateIso)` — `:30`).
  - 5 assertions: (a) `{date:'2026-05-01'}` → hook called with `'2026-05-01'`; (b) no params → `undefined`; (c) full ISO → normalised to `'2026-05-01'`; (d) malformed → `undefined` (defensive); (e) renders "Meal plan" + "No plan for this day" header copy.
  - If the screen reverted to ignoring `route.params`, **every assertion in (a), (c), and (e) would fail** — the hook would always be called with `undefined`. Genuine regression guard.
- The companion test in `deliverablesScreen.test.tsx:468-504` adds a **destination-honors-the-param source guard**: it greps the meal-plan screen source for `useRoute`, `route\.params\?\.date`, and `useMealPlanToday(\s*dateParam\s*)`. The combination of the RTL mount test + the source-grep blocks the self-fulfilling-mock failure mode the R1 audit flagged.

---

## P0 findings
*(broken behaviour, money/security/crash, fabricated routes/fields)*

**None.**

I re-hunted the PR-1 sin (fabricated routes/fields). The new typed shapes (`ScheduledDropView`, `ScheduledDropAssetType`, `ScheduledDropStatus`, `ScheduledDropCadenceKind`) match master-plan §3 / the backend Prisma enums. `ClientPurchase.id` is the only field on `ClientPurchase` used for the `purchase_id` deep-link source (`clientPaymentsApi.ts:580`). No fabricated columns surfaced.

---

## P1 findings
*(significant correctness/robustness gap)*

**None.**

`useFocusEffect(load)` + the initial-mount `useEffect(load)` both fire `load()` — read-only GET, no idempotency concern. Pull-to-refresh wired through `RefreshControl.onRefresh` on every branch (`DeliverablesScreen.tsx:279, 307, 339, 361, 601`). Per-asset_type viewer routing matches existing registered screens (`WorkoutAssignmentDetail`, `ClientDailyMealPlan`, `Messages` via parent Home stack). Buyer-visibility filter `buyerStatusOf` (`DeliverablesScreen.tsx:98-102`) returns `null` for `failed/canceled/skipped` — defense-in-depth.

---

## P2 findings
*(meaningful quality issue — these block merge under the audit's stated bar)*

**None.**

Both R1 P2 items are resolved (see above); no new P2s introduced.

---

## P3 (non-blocking)

- **P3-1.** `accessibilityRole='summary'` → `'text'` — fixed at `DeliverablesScreen.tsx:484`. ✓
- **P3-2.** Docstring drift — fixed. The screen's header docstring now reads "Date formatting uses the platform's `Intl.RelativeTimeFormat`" (`DeliverablesScreen.tsx:27`) and matches the code's actual usage (`DeliverablesScreen.tsx:124-126`). The R1-claimed `src/utils/date.ts` reference is removed.
- **P3-3.** The repo-wide `wrap()` doctrine (PR-1's "404 stays as a real error") is *carved out* only for `getPurchaseDrops`; every other route in `clientPaymentsApi.ts` still surfaces 404 as a retryable error. The scope of the carve-out is documented (`clientPaymentsApi.ts:693-707`). Stylistically clean; informational only.
- **P3-4.** The error branch keeps `result.message` on the result object for "logger / observability wiring" but no logger is actually wired today (the screen doesn't import any logger, and there's no `console.error(result.message)` either). Not a defect — just an unused field today. Future PR can add the wiring.

---

## R1 correct-items regression check

| R1 item | R2 status |
|---|---|
| Buyer-visibility filter (`buyerStatusOf` hides failed/canceled/skipped) | **Preserved** (`DeliverablesScreen.tsx:98-102`); tested at `deliverablesScreen.test.tsx` filter tests |
| 6 states (loading / delivered+upcoming / empty / not_configured / error / pull-to-refresh) | **Preserved** — all branches still wired; new copy on error branch only |
| Pull-to-refresh on every branch | **Preserved** (`DeliverablesScreen.tsx:279, 307, 339, 361, 601`) |
| `useFocusEffect(load)` refetch on focus | **Preserved** (`DeliverablesScreen.tsx:522-524`) |
| `workout_program` / `workout_plan` → `WorkoutAssignmentDetail` | **Preserved** (`DeliverablesScreen.tsx:541-552`) |
| `auto_message` → `Messages` via parent Home stack | **Preserved** (`DeliverablesScreen.tsx:564-579`) |
| `pdf` / `video` non-tappable today | **Preserved** (`DeliverablesScreen.tsx:580-585`) |
| Scope discipline (mobile only, no backend files) | **Preserved** — diff confined to `src/api/`, `src/config/`, `src/navigation/`, `src/screens/client/`, `src/__tests__/` |
| No fabricated `ClientPurchase` fields | **Preserved** — only `ClientPurchase.id` used (`clientPaymentsApi.ts:580`) |

No regressions.

---

## Verification of round-2 PR claims (from PR13_BUILD_REPORT.md "Audit response")

| Claim | Verified |
|---|---|
| `featureFlags.deliverables` defaults OFF in prod, ON in `__DEV__` (env `EXPO_PUBLIC_FF_DELIVERABLES`) | **True** — `featureFlags.ts:82`, `isDev` defined at `:19-21`. |
| CTA gated by `featureFlags.deliverables && status.data.purchase_id` | **True** — `ClientPackagesScreen.tsx:316`. |
| `getPurchaseDrops` maps 404 → `not_configured`; 501 unchanged; 5xx + network still retryable | **True** — `clientPaymentsApi.ts:718-733`; tested at `deliverablesApi.test.ts:95-129`. |
| `DeliverablesScreen` error branch renders friendly copy only (no `result.message`) | **True** — `DeliverablesScreen.tsx:294-329`; only-occurrence of `result.message` is in a comment (`:299`). Tested at `deliverablesScreen.test.tsx:415-433`. |
| `ClientDailyMealPlanScreen` reads `route.params.date` via `useRoute`, normalises to YYYY-MM-DD, rejects malformed, passes to `useMealPlanToday(dateParam)`; legacy `today` call site unaffected | **True** — `ClientDailyMealPlanScreen.tsx:33,52-69`; verified end-to-end through `useMealPlanToday → mealTemplatesApi.todayForClient → /me/meal-plan/today?date=...`. |
| Header / empty-state copy flips ("Meal plan" / "No plan for this day") when a date param is provided | **True** — `ClientDailyMealPlanScreen.tsx:108, 182-189`. |
| New `clientDailyMealPlanRouteParam.test.tsx` mounts the screen with 4 param shapes + asserts the HOOK is called with the resolved date | **True** — 5 `it()` blocks (the build report's "5 assertions") at `clientDailyMealPlanRouteParam.test.tsx:62-92`. Not self-fulfilling — the hook is a real jest mock recording the actual argument the screen passed in. |
| `accessibilityRole='summary'` → `'text'` | **True** — `DeliverablesScreen.tsx:484`. |
| Docstring drift fixed | **True** — `DeliverablesScreen.tsx:27` references `Intl.RelativeTimeFormat`, not `src/utils/date.ts`. |
| `1484 / 1484 passing` across `138 suites` | **True** (re-ran `npx jest`). |
| `tsc --noEmit` 0 errors | **True** (re-ran `npm run typecheck`). |
| `npm run lint` 0 errors, 72 pre-existing warnings | **True** (re-ran `npm run lint`). |
| No backend files touched | **True** — diff confined to mobile files. |

All round-2 claims verified true.

---

## Summary

PR-13 R2 cleanly addresses both R1 P2 findings with **three independent defenses** for P2-1 (flag-gated CTA + 404-mapped envelope + friendly error copy) and a **real, end-to-end fix** for P2-2 (screen consumes `route.params.date`, hook + API forward it to the backend, malformed input is rejected defensively). The new tests are not self-fulfilling — they would fail on a revert. Both P3 nits are also fixed. No new defects introduced; all R1 correct items preserved. `tsc`, `lint`, and `jest` all green at `1484/1484`.

VERDICT: CLEAN
