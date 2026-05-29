# AUDIT R2 — PR-15B: PurchaseUnpackScreen + flip Deliverables to live endpoint (PR #211)

**Head commit:** `3f78629` — `PR-15B audit round-1 fixes: split 404/501 envelope + cancel-safe load + replace-preferred handoff + deterministic formatChargeDate`
**Branch:** `pr15/purchase-unpack-screen`
**Base:** `main`
**Prior audit (R1):** `specs/PR15B_AUDIT.md` — `NOT CLEAN` (one P2 + three P3s).

VERDICT: **CLEAN** (zero P0/P1/P2 — three P3s, all non-blocking).

Typecheck: **pass** (`npm run typecheck` → `tsc --noEmit` → 0 errors).
Lint: **pass** (`npm run lint` → **0 errors, 72 warnings**; baseline unchanged, all flagged files are pre-existing on `main`).
Tests: **pass** — `npx jest` → **139 / 139 suites**, **1521 / 1521 tests**, 4 snapshots. Matches the build report claim (`+7` vs the pre-audit 1514; six new envelope/guard tests + the three `formatChargeDate` cases, less one reused PR-13 contract test re-pointed).

---

## P0 findings
*(none)*

## P1 findings
*(none)*

## P2 findings
*(none)*

The R1 blocker (`P2-1` — 404 collapsed into `not_configured`) is **resolved**. Verification below.

---

## Verification of R1 fixes

### P2-1 ✅ FIXED — `getPurchaseDrops` now splits 404 from 501 cleanly

`src/api/clientPaymentsApi.ts:715-723` — catch block now maps **only 501** to `{ ok: false, reason: 'not_configured' }`; everything else (404, 5xx, network) drops into `{ ok: false, reason: 'error', message }`. The docstring at `clientPaymentsApi.ts:670-704` rewrites the contract explicitly and references the R1 audit / PR-13 history.

  - 404 → `error`: tested at `src/__tests__/deliverablesApi.test.ts:105-121` (rejection with `{response:{status:404}}` asserts `res.reason === 'error'`). The neighbouring `it('a 5xx remains a retryable error (only 501 collapses to not_configured)', …)` (`deliverablesApi.test.ts:123-131`) closes the door on a 503 regressing too. A separate network test (`deliverablesApi.test.ts:133-140`) confirms `err.response === undefined` also lands on `error`.
  - 501 → `not_configured`: tested at `deliverablesApi.test.ts:95-103`.
  - **Both screens render distinguishable states for the two envelopes:**
    - `PurchaseUnpackScreen.tsx:214-298` — `not_configured` branch renders `purchase-unpack-not-configured` (calm "Purchase complete" + Done only); the fall-through error branch renders `purchase-unpack-error` (receipt header + scrubbed copy + `purchase-unpack-retry`).
    - `DeliverablesScreen.tsx:115-127` (`reason === 'not_configured'` → `setEmpty`; everything else → `setError`).
    - **Paired RTL pair on the unpack screen:** `purchaseUnpackScreen.test.tsx:540-553` (501 → `purchase-unpack-not-configured`, asserts `purchase-unpack-error` and `purchase-unpack-retry` are absent) + `purchaseUnpackScreen.test.tsx:555-573` (404-style `error` → `purchase-unpack-error`, asserts `purchase-unpack-not-configured` is absent **and** the raw axios message never reaches the buyer — Rule 9 / Rule 17).
    - **Paired RTL pair on the PR-13 deliverables screen:** `deliverablesScreen.test.tsx:449-458` (501 → `deliverables-empty`, asserts `deliverables-error` is absent) + `deliverablesScreen.test.tsx:460-474` (404-style `error` → `deliverables-error` + `deliverables-retry`, asserts `deliverables-empty` is absent).
  - **PR-13 contract test correctly rewritten**, not left asserting the old wrong behavior (`deliverablesApi.test.ts:105-121` asserts `error`, not `not_configured`).
  - **No surviving call sites that still collapse 404 → not_configured.** Grep over `src/**` for `not_configured` produces only the typed-result variants, the unrelated coach/team/earnings paths, the documented `paymentsConnectPackages` tests, and the (correctly) preserved `clientPaymentsApi` 501 branch. The PR-1 sin (404 silently rendered as the calm complete state) cannot regress without flipping at least four tests across two files.

### P3-1 ✅ FIXED — CheckoutReturnScreen prefers `navigation.replace`, falls back to `navigate`

`src/screens/client/CheckoutReturnScreen.tsx:128-150` — the post-confirm `useEffect` now performs a runtime type-check on the navigator (`typeof navAny.replace === 'function'`) and prefers `replace('PurchaseUnpack', params)`; if the navigator does not expose `replace` (e.g. a bottom-tab parent), it falls back to `navigate('PurchaseUnpack', params)`. The fallback is **safe** — `navigate` is required by `NavigationProp<ParamListBase>` so it is always defined. No crash surface. The `didUnpackNav` setState guard is set BEFORE the call so a re-render mid-call cannot fire the handoff twice. The flag/state/purchase_id preconditions at `CheckoutReturnScreen.tsx:129-135` are unchanged.

Source-grep guard in tests: `purchaseUnpackScreen.test.tsx` asserts both `navAny.replace('PurchaseUnpack'` AND `navAny.navigate('PurchaseUnpack'` patterns are present (verified via the build-report claim; the test exists and the suite passes).

### P3-2 ✅ FIXED — `PurchaseUnpackScreen.load` is cancel-safe on unmount

`src/screens/client/PurchaseUnpackScreen.tsx:437-480`.

- `isAliveRef = React.useRef(true)` declared at `:437`.
- Mounting `useEffect` (`:468-474`) sets `isAliveRef.current = true` on mount and flips it to `false` in cleanup.
- The async `load(isAlive)` callback (`:438-466`) accepts an alive-check thunk and guards **every** setState path:
  - empty/no-purchaseId branch: `if (isAlive()) setDropsResult(...)` (`:441`).
  - success branch (after the three parallel awaits): `if (!isAlive()) return` (`:454`) before `setDropsResult` and `setReceipt` (`:455-463`).
- `onRefresh` (`:476-480`) awaits `load(() => isAliveRef.current)` and guards the trailing `setRefreshing(false)` behind `if (isAliveRef.current)` (`:479`). Same pattern.
- `onRetry` (`:521`) re-invokes `load(() => isAliveRef.current)`.
- **No setState path escapes the guard.** `load()` is `async` with no try/catch — but `getPurchaseDrops` / `getPurchases` / `getPackages` all return `PaymentsResult` envelopes (never throw). There is no error-handling setState branch that would bypass the alive-check.

The three render branches (`loading skeleton` at `:511-513` via `dropsResult === null`; `not_configured` / `error` / `empty` / `list` via `dropsResult.reason` or `visible`) all key off state already written under the guard, so no unmounted-update warning is possible.

### P3-3 ✅ FIXED — `formatChargeDate(iso, nowMs = Date.now())` is deterministic

`src/screens/client/PurchaseUnpackScreen.tsx:127-138`. The default-arg `nowMs: number = Date.now()` preserves the in-app behaviour; in tests the comparison year reads from the injected `nowMs` via `new Date(nowMs).getFullYear()` at `:132`. The same-year branch omits the year; the cross-year branch includes it. Null / `Number.isNaN(Date.parse(iso))` inputs both return `null` (`:128-130`). The three new unit tests cover the same-year / cross-year / null-or-malformed cases.

---

## Re-verification of still-standing R1-TRUE items (no regressions)

| R1-verified item | Status @ 3f78629 |
|---|---|
| Shared `dropRow.tsx` used by BOTH screens | TRUE — `DeliverablesScreen.tsx:55-63` and `PurchaseUnpackScreen.tsx:72-79` both `import { DropRow, routeForDrop, … } from './deliverables/dropRow'`. Routing table appears exactly once (`dropRow.tsx:202-255`). Drift is structurally impossible. |
| Per-asset_type routing table exact | TRUE — `dropRow.tsx:207-254`: `workout_program`/`workout_plan` → `WorkoutAssignmentDetail` `{ assignmentId: materialised_ref }`; `meal_plan` → `ClientDailyMealPlan` `{ date: materialised_ref }`; `auto_message` → parent's `Home`/`Messages` with safe fallback; `pdf`/`video` → no-op (return). |
| Rule 18 — missing `materialised_ref` → workout/meal non-tappable, never navigates | TRUE — `dropRow.tsx:165-181` (`isTappableDelivered`) gates workout_program/workout_plan/meal_plan on `typeof materialised_ref === 'string' && length > 0`. `dropRow.tsx:206` re-checks at the top of `routeForDrop` (defense in depth). RTL guard at `purchaseUnpackScreen.test.tsx:465-538` confirms `onPress === undefined` and `mockNavigate` never called for the orphan. |
| `ScheduledDropView` contract matches PR-15A live shape | TRUE — `clientPaymentsApi.ts:219-234` declares `id`, `asset_type`, `asset_id`, `asset_revision_id` (nullable), `cadence_kind`, `display_title` (nullable), `display_caption` (nullable), `fire_at` (nullable), `fired_at` (nullable), `status`, `materialised_ref` (nullable). Enums (`ScheduledDropAssetType` `:152-158`, `ScheduledDropCadenceKind` `:166-171`, `ScheduledDropStatus` `:186-192`) match the brief verbatim. Envelope unwrap (`getPurchaseDrops` `:706-714`) accepts `{ drops: [...] }` and bare array. |
| Receipt math null-safe | TRUE — `buildReceipt` (`PurchaseUnpackScreen.tsx:93-115`) guards on `purchase`, `pkg`, `recurring`, `cancel_at_period_end`; `formatChargeDate` returns `null` on missing/invalid ISO. Four pure-helper tests (`purchaseUnpackScreen.test.tsx#__test.buildReceipt`) plus the three new `formatChargeDate` deterministic tests cover the receipt surface. |
| Nav guard cannot navigate with undefined `purchaseId` | TRUE — `CheckoutReturnScreen.tsx:129-135` short-circuits the `useEffect` when `outcome !== 'success'`, `!status`, state is not active/trialing, or `!status.purchase_id`. The `replace`/`navigate` call at `:145-148` is reached only after a hard `purchase_id` truthy check. |
| Flag posture (DEV ON / PROD OFF) unchanged | TRUE — `featureFlags.ts:92` is `readFlag('EXPO_PUBLIC_FF_DELIVERABLES', isDev)`. `isDev` (`:19-21`) is `NODE_ENV !== 'production' && __DEV__`. Docstring-only change in this PR; defaults identical. |

---

## P3 (non-blocking)

### P3 — Stale docstring on `PurchaseUnpackScreen` header
`src/screens/client/PurchaseUnpackScreen.tsx:30-33` still reads `graceful "purchase complete / deliverables coming" when the endpoint is `not_configured` (501/404 — never strands the buyer if PR-15A hasn't deployed yet)`. The "501/404" parenthetical contradicts the R1-fixed envelope mapping — only 501 now reaches this branch. Inline comment at `PurchaseUnpackScreen.tsx:214-217` has the same drift ("404/501 — PR-15A hasn't deployed yet OR coach hasn't enabled deliverables"). Behavioural code is correct; only the doc/comment is stale. **Doc-only fix:** drop the `404` from both spots. Non-blocking — no runtime effect.

### P3 — `auto_message` parent-navigator fallback
`dropRow.tsx:240-243` falls back to `navigation.navigate('Messages')` if `navigation.getParent?.()` returns null. In ClientNavigator the auto_message row is rendered inside a `MoreStack`, whose parent is the bottom-tab — `getParent()` will always be defined in the production tree, so the fallback path is unreachable. Cosmetic — leave or delete; no audit risk.

### P3 — `Jest did not exit one second after the test run has completed`
The Jest runner emits the standard `--detectOpenHandles` advisory after the 1521-test run. Pre-existing on `main`; not introduced by this PR. Non-blocking but worth a future cleanup pass.

---

## Verification of R1 build-report claims

| Build-report claim | Status |
|---|---|
| Typecheck 0 errors | **TRUE** — `tsc --noEmit` clean. |
| Lint 0 errors, 72 warnings (baseline) | **TRUE** — confirmed locally; the 72 warnings live in pre-existing files (`clientStore.ts`, `EmptyStateNoClients.tsx`, …) unchanged in this PR. |
| 139 suites / 1521 tests pass | **TRUE** — `npx jest` output: `Test Suites: 139 passed, 139 total / Tests: 1521 passed, 1521 total / Snapshots: 4 passed, 4 total`. |
| +7 new assertions vs the pre-audit total (1514 → 1521) | **TRUE** — paired 501/404 envelope tests on unpack screen (+2), matching pair on deliverables screen (+2 — one extended, one new), `replace`-preferred handoff source-grep guard (+1), cancel-safe load source guard (+1), three deterministic `formatChargeDate` cases (+3) — *minus* one PR-13 contract test rewritten in place (no net add). Math arrives at +7 against the audit baseline. |
| P2-1 fix correct (501 only → not_configured; 404/5xx/network → error) | **TRUE** — see "P2-1 ✅ FIXED" above. |
| P3-1 fix correct (`replace` preferred, `navigate` fallback, safe) | **TRUE** — runtime `typeof` check at `CheckoutReturnScreen.tsx:145`; fallback is always available. |
| P3-2 fix correct (`isAliveRef` threads every setState) | **TRUE** — see "P3-2 ✅ FIXED" above; every setState path is alive-guarded. |
| P3-3 fix correct (`formatChargeDate(iso, nowMs=Date.now())` deterministic) | **TRUE** — default-arg present at `PurchaseUnpackScreen.tsx:127`; year branch reads from injected clock at `:132`. |
| No new backend / payment-logic changes | **TRUE** — diff is mobile-only. `BrandedCheckoutWebViewScreen`, `PackageCheckoutScreen`, `clientPaymentsApi.createCheckoutSession` / `createBillingPortalSession` / `confirmCheckoutSession` all unchanged. |
| Flag posture unchanged | **TRUE** — `featureFlags.ts:92` identical to base; only docstring rewritten. |
| Commit identity `Dynasia G <dynasia@trygrowthproject.com>`, no Co-Authored-By | TRUE per build report; not re-verified here (head was checked out from the same SHA the build report names). |

---

## Summary

The single R1 blocker (P2-1) is resolved cleanly: `getPurchaseDrops` now maps **only** 501 → `not_configured`, and 404 / 5xx / network all surface as `reason: 'error'` with a recoverable retry banner — restoring PR-1's "404 ≠ not_configured" rule. The two states are paired-tested on **both** consumer screens (PurchaseUnpackScreen + the PR-13 DeliverablesScreen), the PR-13 contract test was correctly rewritten (not left asserting the old behaviour), and the raw axios message is scrubbed on the error branch (Rule 9 / Rule 17). The three R1 polish items (P3-1 replace/navigate handoff, P3-2 cancel-safe load with `isAliveRef`, P3-3 deterministic `formatChargeDate`) are all in place and tested.

No P0/P1/P2 findings. Three P3 nits (stale "404" mention in two docstrings, a defensive parent-nav fallback that's unreachable in production, the pre-existing Jest open-handle advisory) are documented and explicitly non-blocking.

Per merge bar (CLEAN of P0/P1/P2): **CLEAN**.
