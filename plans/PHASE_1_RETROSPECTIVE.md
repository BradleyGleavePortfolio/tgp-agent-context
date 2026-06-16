# Phase 1 Retrospective — TGP Platform Audit History

**Synthesized from:** PR1–PR17 audit files (all rounds) + Wave audits (WAVE0, WAVE1_A1, WAVE1_CCSC, WAVE1_EFF, WAVE1_LTV)  
**Synthesis date:** 2026-06-16  
**Synthesized by:** Documentation synthesis subagent  
**Method:** Read-only synthesis of existing audit documents — no new intent introduced.

---

## Table of Contents

1. [Overview and Scope](#1-overview-and-scope)
2. [PR-by-PR Narrative](#2-pr-by-pr-narrative)
   - [PR1 — Checkout Status + Entitlement Endpoint (PR #208)](#pr1--checkout-status--entitlement-endpoint-pr-208)
   - [PR2 — Transfer Failed Webhook (PR #313)](#pr2--transfer-failed-webhook-pr-313)
   - [PR3 — Drip-Feed Schema (PR #314)](#pr3--drip-feed-schema-pr-314)
   - [PR4 — PurchaseFanout Seam (PR #315)](#pr4--purchasefanout-seam-pr-315)
   - [PR5 — CoachPackagesScreen Delete + Earnings Rehome (PR #209)](#pr5--coachpackagesscreen-delete--earnings-rehome-pr-209)
   - [PR6 — published_at Backfill + Pricing Guards (PR #317)](#pr6--published_at-backfill--pricing-guards-pr-317)
   - [PR7 — Meal Plan TOCTOU + Auto-Message Attribution (PR #316)](#pr7--meal-plan-toctou--auto-message-attribution-pr-316)
   - [PR8 — Content Reorder Advisory Lock (PR #318)](#pr8--content-reorder-advisory-lock-pr-318)
   - [PR9 — Outer-TX Rollback + Drip Resolver (PR #319)](#pr9--outer-tx-rollback--drip-resolver-pr-319)
   - [PR10 — Stuck-Dispatching Dead Code + Prefs Routing (PR #320)](#pr10--stuck-dispatching-dead-code--prefs-routing-pr-320)
   - [PR11 — DripTriggerService (PR #321)](#pr11--driptriggerservice-pr-321)
   - [PR12 — Mux Webhook Dedup + Media Security (PR #322)](#pr12--mux-webhook-dedup--media-security-pr-322)
   - [PR13 — CTA Wiring + Meal Plan Route Param (PR #210)](#pr13--cta-wiring--meal-plan-route-param-pr-210)
   - [PR14 — Guest Recurring Checkout (PR #323)](#pr14--guest-recurring-checkout-pr-323)
   - [PR15A — GET Drops Endpoint + DripResolverMarker (PR #324)](#pr15a--get-drops-endpoint--dripresolvemarker-pr-324)
   - [PR15B — 404 / not_configured Collapse (PR #211)](#pr15b--404--not_configured-collapse-pr-211)
   - [PR16 — cancelPendingForPurchase (PR #325)](#pr16--cancelpendingforpurchase-pr-325)
   - [PR17_B1 — push_seq Widened Unique (PR #328)](#pr17_b1--push_seq-widened-unique-pr-328)
   - [PR17_B2 — Resend Idempotency + Audience Cap (PR #330)](#pr17_b2--resend-idempotency--audience-cap-pr-330)
   - [PR17_M1 — packageContentsApi Contract (PR #212)](#pr17_m1--packagecontentsapi-contract-pr-212)
   - [PR17_M2 — ContentAttachForm Stale State (PR #213)](#pr17_m2--contentattachform-stale-state-pr-213)
   - [PR17_M3 — PushPromptSheet (PR #215)](#pr17_m3--pushpromptsheet-pr-215)
   - [PR17_M4 — ScheduledPushConfirmSheet Date Validation (PR #214)](#pr17_m4--scheduledpushconfirmsheet-date-validation-pr-214)
   - [PR17_M5 — Push Confirm Double-Tap Race (PR #216)](#pr17_m5--push-confirm-double-tap-race-pr-216)
3. [Wave Audits Narrative](#3-wave-audits-narrative)
   - [WAVE0 — Schema (PR #331)](#wave0--schema-pr-331)
   - [WAVE1_EFF — N+1 Batch Fix + Sub-Coach Scoping (PR #334)](#wave1_eff--n1-batch-fix--sub-coach-scoping-pr-334)
   - [WAVE1_A1 — AI Token Quota (PR #333)](#wave1_a1--ai-token-quota-pr-333)
   - [WAVE1_CCSC — Sub-Coach Scoping + LTV Guard (PR #335)](#wave1_ccsc--sub-coach-scoping--ltv-guard-pr-335)
   - [WAVE1_LTV — LTV Peak Atomic Writes (PR #332)](#wave1_ltv--ltv-peak-atomic-writes-pr-332)
4. [Cross-Cutting Themes](#4-cross-cutting-themes)
   - [Theme 1: Phantom Routes and Fabricated Fields](#theme-1-phantom-routes-and-fabricated-fields)
   - [Theme 2: Transaction Escape on Emit and Fanout](#theme-2-transaction-escape-on-emit-and-fanout)
   - [Theme 3: TOCTOU Races on Read-then-Write](#theme-3-toctou-races-on-read-then-write)
   - [Theme 4: Dedup Row Outside Transaction](#theme-4-dedup-row-outside-transaction)
   - [Theme 5: Stale-Claim Recovery Dead Code](#theme-5-stale-claim-recovery-dead-code)
   - [Theme 6: Notification Kind Prefs Routing Gaps](#theme-6-notification-kind-prefs-routing-gaps)
   - [Theme 7: Guest Checkout Webhook Routing](#theme-7-guest-checkout-webhook-routing)
   - [Theme 8: 404 vs not_configured Collapse](#theme-8-404-vs-not_configured-collapse)
   - [Theme 9: Idempotency Key Lifecycle](#theme-9-idempotency-key-lifecycle)
   - [Theme 10: Sub-Coach Scoping and Financial Surface Guards](#theme-10-sub-coach-scoping-and-financial-surface-guards)
   - [Theme 11: Quota Reservation and Accepted-Limitation Documentation](#theme-11-quota-reservation-and-accepted-limitation-documentation)
   - [Theme 12: Atomic DB Operations for Concurrent Writes](#theme-12-atomic-db-operations-for-concurrent-writes)
   - [Theme 13: Stale Form State in Modals](#theme-13-stale-form-state-in-modals)
   - [Theme 14: Date Validation for Scheduled Actions](#theme-14-date-validation-for-scheduled-actions)
5. [Round-Count Distribution](#5-round-count-distribution)
6. [Phase 1 CLEAN Status Summary](#6-phase-1-clean-status-summary)
7. [Discrepancies Noted](#7-discrepancies-noted)

---

## 1. Overview and Scope

Phase 1 covers seventeen Pull Request audit sequences (PR1–PR17, with PR17 split into Backend, B-series, and Mobile, M-series sub-sequences) plus four Wave-1 audits. The Phase 1 work represents the core backend drip-feed platform, notification infrastructure, mobile package-management surfaces, and Wave-1 AI/LTV/efficiency additions.

**Source repositories involved:**
- `BradleyGleavePortfolio/growth-project-backend` — backend NestJS/Prisma API
- `BradleyGleavePortfolio/growth-project-mobile` — React Native (Expo) mobile client

**Audit standard applied throughout Phase 1:** R72 exhaustive (no sampling, every touched file read in full), R77 read-only worktrees, R74 commit identity checks.

**Total audit rounds across Phase 1 and Wave audits:**

| PR | Rounds to CLEAN |
|----|-------------:|
| PR1 | 3 |
| PR2 | 1 |
| PR3 | 1 |
| PR4 | 1 |
| PR5 | 1 |
| PR6 | 1 |
| PR7 | 2 |
| PR8 | 3 |
| PR9 | 2 |
| PR10 | 2 |
| PR11 | 1 |
| PR12 | 2 |
| PR13 | 2 |
| PR14 | 2 |
| PR15A | 1 |
| PR15B | 2 |
| PR16 | 1 |
| PR17_B1 | 1 |
| PR17_B2 | 2 |
| PR17_M1 | 1 |
| PR17_M2 | 2 |
| PR17_M3 | 1 |
| PR17_M4 | 4 |
| PR17_M5 | 3 |
| WAVE0 | 1 |
| WAVE1_EFF | 1 |
| WAVE1_A1 | 6 |
| WAVE1_CCSC | 2 |
| WAVE1_LTV | 7 |

---

## 2. PR-by-PR Narrative

---

### PR1 — Checkout Status + Entitlement Endpoint (PR #208)

**Verdict path:** R1 NOT CLEAN → R2 NOT CLEAN → R3 CLEAN  
**Rounds to clean:** 3

#### R1 Findings

The first audit identified two findings at the P0/P1 level:

**P0 — Phantom route:** `GET /v1/checkout/status` was called by the mobile client but the endpoint did not exist on the backend. The mobile side was constructing a request to a route that had never been implemented, meaning any code path leading to this call would have received a 404 with no fallback handling.

**P1 — Dead entitlement route:** `/v1/clients/me/coach/entitlement` was referenced in the mobile client but was also absent from the backend. Both phantom routes represented a category of defect where mobile development outpaced backend delivery and the mobile codebase was wired to non-existent surfaces.

#### R2 Findings

After the first fix attempt, R2 identified remaining issues:

**P1 — Null package_name and non-existent is_current field:** The fix introduced references to `package_name` (which could be null in the data model) and to an `is_current` field that does not exist on the `CoachPackage` model. The corrected implementation needed to re-derive status from real purchases joined against packages, rather than referencing a synthetic computed field.

#### R3 CLEAN

The third round found the implementation clean. The status endpoint was re-derived from real purchases plus packages join, eliminating dependence on phantom fields. Dunning state was correctly left null with a tracked TODO for future implementation rather than being fabricated.

**Significance:** PR1 established the phantom-route pattern as one of the foundational defect classes in Phase 1. The lesson — mobile must wire only to proven backend routes — influenced subsequent PR reviews throughout the phase.

---

### PR2 — Transfer Failed Webhook (PR #313)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The transfer-failure webhook handler was found clean on first audit. Key correctness elements verified:
- **Idempotency via StripeProcessedEvent:** The handler used the `StripeProcessedEvent` table to deduplicate incoming Stripe events, preventing double-processing under Stripe's at-least-once delivery guarantee.
- **Status guard on retryable records:** A `WHERE status != 'failed'` guard ensured the handler only operated on records that had not already reached terminal failure state, preventing incorrect state transitions on already-failed records.

PR2 served as a reference for correct Stripe webhook idempotency patterns subsequently cited when other PRs (PR9, PR12) missed the same requirement.

---

### PR3 — Drip-Feed Schema (PR #314)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The drip-feed schema migration was entirely additive and was found clean. New models introduced:
- `CoachPackageContent`
- `ScheduledDrop`
- `PurchaseFanout`
- `CoachMediaAsset`
- `ClientAssetGrant`

Because the migration was purely additive (no existing table mutations), the risk profile was low. The audit confirmed schema correctness and that no existing query paths were broken. The `PurchaseFanout` model established the seam that would carry forward into PR4's fanout no-op stub and PR9's transaction fix.

---

### PR4 — PurchaseFanout Seam (PR #315)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `PurchaseFanout` integration point was a deliberate no-op stub — the hook was wired at the seam but not yet producing side effects. The audit confirmed this was intentional and correctly implemented.

**P3 note preserved:** The audit flagged that hook points #1 and #2 were not inside a `$transaction` block. The audit document explicitly called out that these must be transaction-wrapped when PR9 implements the full fanout behavior. This forward-looking annotation was authored in the audit; PR9 subsequently addressed exactly this requirement.

---

### PR5 — CoachPackagesScreen Delete + Earnings Rehome (PR #209)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

A 739-line screen deletion combined with the rehoming of six earnings methods was found clean on first audit. The removal of `CoachPackagesScreen` eliminated dead UI code, and the earnings methods were correctly moved to their new home without behavioral change. The audit confirmed no call sites were broken and no earnings logic was duplicated or dropped.

---

### PR6 — published_at Backfill + Pricing Guards (PR #317)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `published_at` backfill migration and purchasability gating were found clean. Key elements verified:
- The `published_at` backfill applied only to rows where the field was null.
- Purchasability was gated at five call sites to ensure consistency.
- `assertValidPricing` enforced valid pricing combinations, preventing invalid price configurations from being persisted.

---

### PR7 — Meal Plan TOCTOU + Auto-Message Attribution (PR #316)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

Two distinct correctness defects were found:

**P1 — Meal plan TOCTOU race:** `DailyMealPlanAssignment` had no `@@unique` constraint on the combination of client, date, and coach. This meant concurrent assignment requests could create duplicate rows for the same logical assignment slot — a classic time-of-check-to-time-of-use race where no database-level uniqueness enforcement prevented two concurrent writers from both succeeding.

**P1 — Auto-message sub-coach mis-attribution:** Automated messages sent on behalf of a coaching action were using `tenantCoachId` (the sub-coach performing the action) instead of `actingCoachId` (the coach whose identity the message should carry). This would have caused incorrectly attributed messages in multi-coach tenant scenarios.

#### R2 CLEAN

Both issues were resolved: the `@@unique` constraint was added to `DailyMealPlanAssignment`, and message attribution was corrected to use the proper acting coach identifier.

---

### PR8 — Content Reorder Advisory Lock (PR #318)

**Verdict path:** R1 NOT CLEAN → R2 NOT CLEAN → R3 CLEAN  
**Rounds to clean:** 3

#### R1 Findings

**P1 — nextDisplayOrder TOCTOU:** The logic for computing the next display order value for inserted content items used a read-then-write pattern without any locking. Under concurrent inserts, two requests could read the same maximum order value and both assign the same order number, producing duplicate order values.

**P1 — Reorder TOCTOU:** Similarly, the reorder operation that adjusts multiple rows' order values was subject to interleaved writes from concurrent reorder requests.

#### R2 Findings (after first fix attempt)

**P2c — patch() missed lock:** The R1 fix applied `pg_advisory_xact_lock` to the insert and full reorder paths, but the incremental `patch()` method was missed. Calling `patch()` for a partial update could still interleave with a concurrent reorder, bypassing the advisory lock protection.

#### R3 CLEAN

The R3 fix added the advisory lock to the `patch()` path, achieving consistent locking across all write paths that modify display order. The advisory lock approach — using a deterministic integer derived from the coach + package ID — was confirmed as the correct mechanism for serializing concurrent writers without requiring an explicit transaction-level row lock on a counter table.

---

### PR9 — Outer-TX Rollback + Drip Resolver (PR #319)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

PR9 addressed the most complex transaction-safety scenario in Phase 1:

**P1 — Outer-tx rollback + Stripe retry double-fires:** The drip resolution path emitted side effects (workout scheduling, auto-messages) outside the enclosing Stripe webhook transaction. When the outer transaction rolled back (due to a downstream failure) and Stripe redelivered the event, the side effects would fire again. This could produce duplicate workouts or duplicate auto-messages for clients.

**P1 — Resolver-internal commit-then-fail:** Inside the drip resolver, a commit could succeed for one step and then the subsequent step could fail, leaving partial state that would be replayed incorrectly on Stripe's retry.

#### R2 CLEAN

The fix introduced two key mechanisms:
- **Stable drip key:** A deterministic idempotency key derived from the purchase ID and content ID ensured that the same drip resolution attempt would produce the same key across rollback/retry cycles.
- **DripResolverMarker claim-then-stamp:** A claim-before-execution pattern where the resolver marks a row as "in-flight" before executing, then stamps it as "done" after success. This provided exactly-once semantics even under concurrent workers or rollback/retry scenarios.

**Significance:** PR9's resolution established the claim-then-stamp idiom as the standard for idempotent side-effect execution within transactional contexts, a pattern that would be referenced in subsequent PRs.

---

### PR10 — Stuck-Dispatching Dead Code + Prefs Routing (PR #320)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P1 — Stuck-dispatching dead code:** The `findDue` query in the drip dispatcher only selected rows with `status='pending'`. However, rows in the `status='dispatching'` state (rows that had been claimed by the dispatcher but not yet completed) were never re-queried after a crash or timeout. This meant any row that entered the `dispatching` state and was never completed would remain stuck permanently — the `findDue` function would never pick it up for recovery.

**P1 — DRIP_RELEASED notification prefs missing:** The new `DRIP_RELEASED` notification kind had no entry in the notification preferences routing table. New notification kinds that are not explicitly registered fall through to digest defaults, which in this system default to `false` (suppressed). Clients who should receive drip-release notifications would silently receive nothing.

#### R2 CLEAN

The fix addressed both issues: an `OR` clause was added to `findDue` to also select `status='dispatching'` rows beyond a staleness threshold, enabling stuck-dispatching recovery. A migration added the `DRIP_RELEASED` preference columns to the notification prefs table.

---

### PR11 — DripTriggerService (PR #321)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `DripTriggerService` implementation of `onContentCompleted` and `onMilestone` hooks was found clean on first audit. Key elements verified:
- **Cross-buyer isolation:** Triggers correctly scoped their effect to the specific buyer who completed content or reached the milestone, not all buyers of the package.
- **Idempotency via fire_at re-assertion:** The trigger used a `fire_at: null` re-assertion pattern to avoid double-scheduling drips for events that could fire multiple times.

---

### PR12 — Mux Webhook Dedup + Media Security (PR #322)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P1 — MuxProcessedEvent dedup outside transaction:** The Mux video webhook handler inserted the `MuxProcessedEvent` deduplication row outside the enclosing database transaction. This was the same class of defect seen in PR2's correct implementation — dedup rows must be inside the same transaction as the work they guard, otherwise a rollback leaves the dedup row committed while the work is undone, permanently suppressing redelivery.

**P1 — Raw-body HMAC verification absent:** The Mux webhook endpoint was not verifying the HMAC signature of the incoming request body before processing it. This left the webhook endpoint open to spoofed events.

**P2 — Signed-URL existence leak:** Signed URL generation for media assets revealed whether a given asset ID existed, even to callers who were not entitled to access the asset. A failed signature request should return the same response regardless of asset existence.

**P2 — Mux public playback policy:** A media asset was being created with Mux's public playback policy, which would allow unauthenticated access to video streams. The correct policy was signed/authenticated.

**P2 — Soft-delete grant race:** The grant-revocation path (soft-deleting a `ClientAssetGrant`) had a race condition where concurrent revocations could both succeed, leading to inconsistent grant state.

#### R2 CLEAN

All issues were resolved: dedup moved inside the transaction, HMAC verification added, existence leak closed, public playback policy changed to signed, and the soft-delete grant path made idempotent.

---

### PR13 — CTA Wiring + Meal Plan Route Param (PR #210)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P1 — CTA wired but endpoint does not exist:** The mobile client's call-to-action for a new feature was wired to an endpoint that had not yet been implemented on the backend. This was the same phantom-route class established in PR1.

**P1 — meal_plan route param ignored:** The meal plan screen was reading a date parameter from navigation route params, but the actual navigation call site was not passing `route.params.date`. The screen would have received `undefined` for the date parameter and rendered incorrectly.

#### R2 CLEAN

The fix introduced a feature flag to gate the CTA (so it could be shown without the endpoint being live), a `404 → not_configured` mapping that correctly maps the absence of an endpoint to a non-configured state per the PR-1 rule, and corrected the navigation call to pass `route.params.date`.

**Note:** The `404 → not_configured` mapping established here was relevant to the PR15B finding — see Theme 8.

---

### PR14 — Guest Recurring Checkout (PR #323)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P0 — Guest recurring checkout: Stripe takes money but never fulfills:** The most severe Phase 1 finding. Guest checkout for recurring subscriptions accepted payment from Stripe but did not complete fulfillment. The root cause was that `GUEST_CHECKOUT_METADATA_KEY` — the metadata key that identifies a checkout session as guest-originated — was not being propagated into the child `PaymentIntent` metadata created by Stripe's subscription setup. Stripe's webhook handler checked this key on the `PaymentIntent` to route the event to the guest checkout fulfillment path. Without the key, the event was silently dropped, leaving the buyer charged but their subscription in an unfulfilled state.

**P1 — Combo fee over-collection:** A related issue caused combination-product purchases to over-collect the platform fee, charging the buyer more than the displayed price.

#### R2 CLEAN

The fix correctly propagated `GUEST_CHECKOUT_METADATA_KEY` into child PaymentIntent metadata and fixed the combo fee calculation.

**Significance:** PR14's P0 represented the most commercially damaging defect class in Phase 1 — a silent payment-without-fulfillment scenario. The audit's detection and blocking of this before it reached production was cited as a prime example of the value of adversarial audit.

---

### PR15A — GET Drops Endpoint + DripResolverMarker (PR #324)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The GET endpoint for scheduled drops and the `DripResolverMarker` idempotency mechanism were found clean. The `DripResolverMarker` correctly extended the claim-then-stamp pattern from PR9 to additional resolver paths. The `COACH_NEW_PURCHASE` notification kind was correctly registered.

---

### PR15B — 404 / not_configured Collapse (PR #211)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P1 — 404 → not_configured collapse violates PR-1 rule:** PR13 (R2) had established a rule: only `501 Not Implemented` maps to the `not_configured` state in the mobile client. A `404 Not Found` means the route is genuinely absent and should surface as an error, not be silently swallowed as "not configured." PR15B's mobile implementation collapsed `404` responses to `not_configured`, which could mask real absent-route defects.

#### R2 CLEAN

The fix restored the PR-1 rule: only `501` responses map to `not_configured`; `404` surfaces as a genuine error.

---

### PR16 — cancelPendingForPurchase (PR #325)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `cancelPendingForPurchase` implementation was found clean. Key correctness elements:
- A single `updateMany` with `WHERE status IN ('pending', 'due')` correctly cancelled all eligible scheduled drops in one atomic operation.
- The cancellation was wired at four distinct handler sites to ensure consistent cancellation across all purchase-termination paths.
- The same transaction (`tx`) that revoked entitlement also executed the cancellation, ensuring atomic entitlement revoke + drop cancellation.

---

### PR17_B1 — push_seq Widened Unique (PR #328)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `push_seq` integer field was added to the push notification schema to support ordered delivery. The `@@unique` constraint was widened to include `push_seq`, allowing multiple push notifications for the same logical target to coexist as long as their sequence numbers differ. The resolver-key bypass for `push_seq > 0` (re-sends) was verified as correct — re-sends should be allowed to bypass the normal once-per-target resolver uniqueness check.

---

### PR17_B2 — Resend Idempotency + Audience Cap (PR #330)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P1 — Resend not idempotent:** The resend path computed the next sequence number as `max(push_seq) + 1` without persisting a stable key for the resend operation. If the resend request was retried (network error, server restart), each retry would recompute `max(push_seq) + 1` and potentially insert a duplicate row with the same content and a different sequence number.

**P1 — Unbounded audience:** The resend path had no cap on the number of recipients. A single malformed or accidental resend operation against a large audience could trigger unbounded push notification delivery.

#### R2 CLEAN

The fix used the `claimAndRun` pattern (stable idempotency key claimed before execution) and added `MAX_PUSH_AUDIENCE = 2000` as an audience cap enforced before dispatch.

---

### PR17_M1 — packageContentsApi Contract (PR #212)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `packageContentsApi.ts` module's seven methods were verified against the frozen API contract. All method signatures, parameter types, response shapes, and error handling matched the documented contract. No phantom methods or missing methods were found.

---

### PR17_M2 — ContentAttachForm Stale State (PR #213)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P1 — ContentAttachForm stale edit state:** The form for attaching content to a scheduled drop used `useState` to initialize the form fields from the current content item. However, when the user navigated from one content item to another without unmounting the component (modal re-use pattern), the `useState` initializers did not re-run — they only run on component mount. The form would display stale data from the previous content item, and any submission would send the previous item's values.

**P1 — fixed_calendar / on_milestone cadence options send empty payloads:** Two cadence kind options (`fixed_calendar` and `on_milestone`) sent an empty `{}` payload when selected. The backend validation for these cadence kinds required non-empty payloads with specific fields. This would produce guaranteed backend validation errors for any submission using these cadence options.

#### R2 CLEAN

The fix added a `useEffect` that re-seeded all form state on `[content?.id, content?.updated_at, visible]` dependency changes, ensuring the form always reflects the current content item. A `buildCadencePayload` helper was added to construct the correct payload for each cadence kind.

---

### PR17_M3 — PushPromptSheet (PR #215)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The `PushPromptSheet` component was found clean on first audit. A P3-only note was recorded: scrim dismissal (tapping outside the sheet to dismiss) was not covered by tests. This was noted as a polish-level gap and did not block the clean verdict.

---

### PR17_M4 — ScheduledPushConfirmSheet Date Validation (PR #214)

**Verdict path:** R1 NOT CLEAN → R2 NOT CLEAN → R3 NOT CLEAN → R4 CLEAN  
**Rounds to clean:** 4

PR17_M4 required the most audit rounds of any PR17 M-series item, demonstrating the difficulty of getting date validation and test coverage simultaneously correct.

#### R1 Findings

**P1 — Past fireAt prop enables Confirm button:** The `canConfirm` guard checked only that `fireAt != null` — it did not check whether the `fireAt` value was in the future. A user (or a programmatic caller passing stale data) could pass a past date and the Confirm button would remain enabled, allowing scheduling of a notification for a time that had already passed.

#### R2 Findings

**P1 — minimumDate computed once via useMemo([]):** The R1 fix computed `minimumDate` using `useMemo` with an empty dependency array, meaning the minimum date was computed once at component mount. If the component was mounted near midnight and remained open past midnight, the `minimumDate` would refer to the wrong day. The minimum date must be re-derived on every render to always reflect "now."

#### R3 Findings

**P2 — Fake-timer test presses only after rerender:** The R2 test for the call-time guard (the guard that prevents confirming a past date at the moment of button press, not just at render time) only pressed the Confirm button after advancing fake timers and re-rendering. This meant the test did not independently prove the call-time guard — if the guard was only in the render path and absent from the press handler, the test would still pass.

#### R4 CLEAN

A separate test was added that pressed the Confirm button before any rerender following the time advance, proving the call-time guard operated independently of the render cycle. This is the stricter form: the guard must hold at the instant of press, not merely after the next render.

---

### PR17_M5 — Push Confirm Double-Tap Race (PR #216)

**Verdict path:** R1 NOT CLEAN → R2 NOT CLEAN → R3 CLEAN  
**Rounds to clean:** 3

#### R1 Findings

**P0 — Fast double-tap on Confirm:** A fast double-tap on the Confirm button could submit two push notification requests. The React state guard (`pushSubmitting` boolean in state) was not synchronous — React does not guarantee state updates are applied before the next event handler fires. Two rapid taps could both read `pushSubmitting === false` before either tap's state update was applied.

#### R2 Findings

**P0 — Double prompt tap starts two previews; late preview resolution corrupts state:** The R1 fix for double-tap introduced a preview flow, but the preview itself was asynchronous. Two rapid taps on a preview button could start two concurrent preview fetches. If the second preview resolved after the first push was already in-flight, the late preview resolution would reset `submitInFlightRef` and replace `pushIdemKeyRef` while the first push was executing, corrupting the idempotency key mid-flight.

#### R3 CLEAN

The fix introduced two ref-based guards:
- `previewInFlightRef` — prevents a second preview from starting while one is in flight.
- `intentTokenRef` — a token pattern where each "confirm intent" creates a token; stale previews check their token against the current intent token before mutating any keys or modal state. If the token has changed (because the user reset the flow), the stale preview returns without side effects.

**Significance:** PR17_M5's pattern for handling concurrent async UI operations using stable ref-based intent tokens was noted as the correct model for any async confirm flow in the mobile codebase.

---

## 3. Wave Audits Narrative

---

### WAVE0 — Schema (PR #331)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The Wave-0 schema migration was entirely additive, introducing two new tables:
- `UserAIQuota` — tracks per-user AI token quota consumption.
- `CoachLtvPeak` — stores computed LTV peak metrics per coach.

Both additions were clean: no existing tables were modified, foreign key constraints were correctly specified, indexes were appropriate, and Row-Level Security policies were present. The additive-only nature and clean RLS implementation meant no Phase 1-style TOCTOU or race issues applied.

---

### WAVE1_EFF — N+1 Batch Fix + Sub-Coach Scoping (PR #334)

**Verdict path:** CLEAN (first pass)  
**Rounds to clean:** 1

The efficiency-focused Wave 1 PR addressed two backend performance and correctness issues:

**N+1 batch fix:** A query that had been executing one database query per item in a list was refactored to use a batched query, eliminating the N+1 pattern. The fix maintained correctness while reducing database round-trips by an order of magnitude for typical list sizes.

**Sub-coach roster scoping via SubCoachScopeService:** The sub-coach roster was previously accessible to any coach with the right role. The fix introduced `SubCoachScopeService` to ensure sub-coaches could only access client records within their explicit scope assignment. This eliminated an Insecure Direct Object Reference (IDOR) vulnerability where a sub-coach could query client data for clients assigned to other sub-coaches or to the head coach directly.

---

### WAVE1_A1 — AI Token Quota (PR #333)

**Verdict path:** R1 NOT CLEAN → R2 NOT CLEAN → R3 NOT CLEAN → R4 NOT CLEAN → R5 NOT CLEAN → R6 CLEAN  
**Rounds to clean:** 6

WAVE1_A1 was the most difficult Wave audit, requiring six rounds to reach CLEAN. The challenge was establishing a provably correct token quota reservation and reconciliation system, given that the underlying token count is inherently an approximation.

#### R1 Findings

**P1 — Reservation only MAX_TOKENS_PER_CALL (600); actual reconcile uses total_tokens:** The quota reservation step reserved a fixed 600 tokens per AI call, but the actual reconciliation step used `total_tokens` from the model response (which could be higher). This meant that under a high-token response, the pre-call check might pass (sufficient quota available to reserve 600) but the post-call reconcile would actually consume more than was reserved, potentially allowing quota overcap without detection.

**P1 — No refund on failure:** If the AI call failed after quota was reserved, the reserved tokens were never returned to the user's quota. A series of failed calls would drain quota without delivering any actual AI output.

#### R2 Findings

**P1 — Still not a hard cap:** The R1 fix improved but did not fully resolve the overcap scenario. The reservation was not guaranteed to prevent total consumption from exceeding quota because the reservation amount was still not a provable upper bound on actual consumption.

**P2 — Day-boundary reconcile recomputes quotaDate:** If a call spanned midnight, the reconciliation step would recompute the current date, potentially attributing the consumption to the wrong day's quota bucket. The R2 fix captured `quotaDate` at reservation time and passed it through to reconciliation.

#### R3 Findings

**P1 — chars/3 not a provable tokenizer upper bound:** The pre-call token estimation used `characters / 3` as an estimate. This constant was asserted as a conservative upper bound, but the audit identified that different tokenizers (especially for non-Latin character sets) can produce token counts higher than `chars / 3`. This meant the reservation could still underestimate actual consumption.

**P1 — clampPromptParts doesn't clamp system prompt or role framing:** The clamping function that truncated prompt input to fit within the quota was only applied to the user-visible parts of the prompt. The system prompt and role framing tokens (which are injected by the application, not the user) were not included in the clamp budget, meaning the effective total could exceed the clamped amount.

#### R4 Findings

**P1 — Same chars/3 issue continues:**  The chars/3 ratio remained unresolved as a provably correct bound.

**P1 — Math.min(actual, reserved) masks overspend:** The reconciliation used `Math.min(actual_tokens, reserved_tokens)` when recording consumption, which means actual overspend (actual > reserved) was silently truncated and never recorded. This made it impossible to detect or audit genuine quota violations after the fact.

#### R5 Findings

**P2 — Stale "proven worst-case" comments:** After the previous rounds' accepted-limitation decisions, the code still contained comments asserting the bound was "proven worst-case." These comments were factually incorrect given the accepted limitations and would mislead future maintainers about the system's actual guarantees.

#### R6 CLEAN

All hard-bound claims were removed from comments and documentation. The system was re-documented consistently as "bounded best-effort pre-gate + authoritative reconcile" — acknowledging that the pre-call reservation is a best-effort safety gate, not a cryptographic guarantee, and that the authoritative consumption record comes from the model's actual token response. The reconciliation correctly recorded actual consumption.

**Significance:** WAVE1_A1 is notable for requiring the most rounds of any Phase 1 audit, and for demonstrating that documentation accuracy (removing false "proven" claims) is a required correctness property, not merely polish.

---

### WAVE1_CCSC — Sub-Coach Scoping + LTV Guard (PR #335)

**Verdict path:** R1 NOT CLEAN → R2 CLEAN  
**Rounds to clean:** 2

#### R1 Findings

**P0 — Active sub-coaches can reach LTV financial route:** `LtvMetricsController` was missing the `NoActiveSubCoachGuard` decorator. This meant authenticated sub-coaches with active roles could access the LTV financial summary endpoint. LTV metrics contain aggregated financial data that is appropriate only for head coaches (owners), not for sub-coaches who operate within a limited scope.

**P1 — getAtRisk() over-restricted for sub-coaches:** The at-risk client query was filtering more aggressively than intended for sub-coach callers, excluding clients who should have been visible to the sub-coach within their assigned scope.

**P1 — dismissAlert() uses subCoachId not ownerCoachId:** Alert dismissal was recording the sub-coach's ID as the dismissing entity rather than the owning coach's ID. This corrupted the dismissal record and would cause alerts to re-appear for the owning coach even after the sub-coach had dismissed them.

**P1 — Inbox unread/turn semantics wrong for sub-coach-sent messages:** The unread message count and "turn" logic (whose turn it is to respond) used incorrect ID comparisons when the last message sender was a sub-coach, producing incorrect unread counts and turn indicators.

#### R2 CLEAN

All issues were resolved:
- `NoActiveSubCoachGuard` was added to `LtvMetricsController`.
- `getAtRisk()` was corrected to pass `clientIds` (the sub-coach's scoped client list) rather than over-filtering.
- `dismissAlert()` was corrected to use `acknowledgeForScope` with the owning coach's ID.
- Inbox unread/turn was corrected to use `sender_id: { in: clientIds }` for sub-coach-sent message scenarios.

---

### WAVE1_LTV — LTV Peak Atomic Writes (PR #332)

**Verdict path:** R1 NOT CLEAN → R2 NOT CLEAN → R3 NOT CLEAN → R4 NOT CLEAN → R5 NOT CLEAN → R6 NOT CLEAN → R7 CLEAN  
**Rounds to clean:** 7

WAVE1_LTV required seven rounds — the highest of any audit in Phase 1 — because concurrent-write correctness for a monotonic peak metric is genuinely difficult and the audit's adversarial posture found a new failure mode in each proposed fix.

#### R1 Findings

**P1 — Read-then-upsert lost-update on all_time_peak_rpcm + zero_churn_streak:** The initial implementation read the current peak value, computed the new peak in application code, then upserted. Under concurrent writers (two Stripe webhooks processed simultaneously), both readers could read the same current peak, both compute new peaks, and one writer's update would silently overwrite the other's, potentially regressing the peak to a lower value.

#### R2 Findings

**P1 — GREATEST resolved for rpcm but not streak:** The R1 fix applied `GREATEST(old_peak, new_peak)` in the SQL upsert for `all_time_peak_rpcm`, correctly making the peak write idempotent. However, applying `GREATEST` to `zero_churn_streak` was semantically wrong: the streak is a count of consecutive non-churning periods and can legitimately reset to zero when churn occurs. Using `GREATEST` would prevent legitimate streak resets.

#### R3 Findings

**P2 — Stale-source streak race:** A snapshot of purchases was taken at the start of the handler, and the streak was computed from that snapshot. If another concurrent write had already recorded a churn event (resetting the streak to zero) between the snapshot and the streak write, the stale snapshot would write a non-zero streak over the already-committed zero value.

#### R4 Findings

At this point, the live streak was computed directly from the purchases table rather than from a snapshot, eliminating the snapshot staleness issue. `GREATEST` was removed from the streak path. However:

**P2 — is_new_rpcm_record uses stale pre-write findUnique snapshot:** The flag that determines whether to emit a "new LTV record" notification was computed from a `findUnique` call that read the old peak before the upsert. If two concurrent writes both saw the old peak and both computed new records, both would emit the notification — producing duplicate first-record notifications.

#### R5 Findings

**P0 — prev CTE in INSERT...ON CONFLICT reads snapshot before conflict wait:** The SQL CTE pattern (`WITH prev AS (SELECT ... FOR UPDATE) INSERT ... ON CONFLICT ...`) reads the current row in the CTE before the `INSERT` has acquired its conflict-resolution lock. If two concurrent inserts both enter the CTE read before either commits, both see the same old peak and both return `is_new_record = true`, even though only one actually wins the conflict.

#### R6 Findings

**P1 — First-run concurrent insert race:** When the `CoachLtvPeak` row does not yet exist for a coach (first payment), a `SELECT ... FOR UPDATE` has no row to lock. Two concurrent first-payment handlers both find no row, both proceed to insert, and one will hit a unique constraint violation. Without a retry or explicit row-ensurance step, the losing writer will fail rather than gracefully updating.

#### R7 CLEAN

The final implementation used a two-step pattern within a single transaction:
1. `INSERT INTO CoachLtvPeak ... ON CONFLICT (coach_id) DO NOTHING` — ensures the row exists (creates it on first run, no-ops if it already exists).
2. `SELECT ... FOR UPDATE` — now always finds a row (guaranteed by step 1) and acquires the exclusive lock before any read or write.

This single path handles both first-run and existing-row scenarios, eliminates the pre-conflict CTE read race, and correctly serializes concurrent writers on the advisory lock.

---

## 4. Cross-Cutting Themes

The following themes were identified across multiple Phase 1 PRs. These represent systemic patterns, not one-off mistakes.

---

### Theme 1: Phantom Routes and Fabricated Fields

**PRs affected:** PR1, PR13

Both PR1 and PR13 exhibited the pattern of mobile code calling backend routes or reading fields that did not exist. In PR1, both `GET /v1/checkout/status` and `/v1/clients/me/coach/entitlement` were phantom routes. In PR13, the CTA was wired to an endpoint that had not been implemented.

The consistent fix was: gate the mobile call behind a feature flag, implement the backend route, and verify the contract end-to-end before enabling the flag.

**Root cause pattern:** Mobile and backend developed in parallel without a shared contract-first approach. Mobile integrated against a planned-but-unbuilt API surface.

---

### Theme 2: Transaction Escape on Emit and Fanout

**PRs affected:** PR4 (noted forward), PR9

Side effects — including drip resolution, notification emission, and fanout hooks — consistently escaped the enclosing `$transaction` boundaries. The danger is that if the outer transaction rolls back (due to a downstream error or Stripe retry), the side effects have already committed and become permanent, but the triggering purchase or event row has been rolled back. On retry, the side effects may fire again, producing duplicates.

The correct pattern established: pass `tx` through every layer that writes to the database or emits a side effect. The `DripResolverMarker` claim-then-stamp pattern (PR9) provided the idempotency guarantee for the final drip resolution step.

---

### Theme 3: TOCTOU Races on Read-then-Write

**PRs affected:** PR7, PR8, PR9

Three distinct read-then-write races appeared across Phase 1:
- PR7: meal plan assignment uniqueness enforced only at application layer, not database layer.
- PR8: display order computed by reading max, then writing — concurrent inserts could produce duplicate order values.
- PR9: drip claims vulnerable to concurrent claim-and-dispatch by multiple workers.

Solutions applied:
- PR7: `@@unique` constraint at database layer.
- PR8: `pg_advisory_xact_lock` to serialize writers.
- PR9: `DripResolverMarker` claim-before-execute with transactional commit.

**Pattern:** For any read-then-write that must be atomic, the database must enforce the invariant — application-layer checks are insufficient under concurrent load.

---

### Theme 4: Dedup Row Outside Transaction

**PRs affected:** PR2 (correct reference), PR12 (violation)

PR2 established the correct pattern: idempotency/dedup rows must be inserted within the same database transaction as the work they guard. PR12 violated this: the `MuxProcessedEvent` dedup row was inserted outside the transaction. If the transaction rolled back, the dedup row would remain committed, permanently suppressing redelivery of the Mux event.

**Pattern:** Any dedup table (StripeProcessedEvent, MuxProcessedEvent, DripResolverMarker) must be written inside the same `$transaction` block as the work it protects.

---

### Theme 5: Stale-Claim Recovery Dead Code

**PRs affected:** PR10

The drip dispatcher's `findDue` query selected only `status='pending'` rows. Rows in `status='dispatching'` (claimed but not completed) were permanently excluded from recovery. A server crash or timeout after a claim would leave rows stuck in `dispatching` state indefinitely.

**Fix pattern:** The `findDue` query must include an `OR` clause for `status='dispatching'` rows whose `locked_at` timestamp is older than a staleness threshold, enabling automatic recovery of stuck rows.

---

### Theme 6: Notification Kind Prefs Routing Gaps

**PRs affected:** PR10, PR15A

New notification kinds must have explicit entries in the notification preferences routing table. Without an explicit entry, new kinds fall through to digest defaults, which in this system default to `false` (suppressed). PR10's `DRIP_RELEASED` kind was missing its preference entry; PR15A's `COACH_NEW_PURCHASE` kind was correctly registered.

**Pattern:** Every new notification kind must have a corresponding migration that adds preference columns with explicit defaults, not falling through to a generic default.

---

### Theme 7: Guest Checkout Webhook Routing

**PRs affected:** PR14

Guest recurring checkout failed silently because `GUEST_CHECKOUT_METADATA_KEY` was not propagated from the checkout session to the child `PaymentIntent` objects created by Stripe's subscription machinery. Stripe's webhook handler used this key to route events to the guest checkout fulfillment path.

**Pattern:** Any metadata required by Stripe webhook handlers must be explicitly propagated through every Stripe object in the payment flow, not just the top-level session object. Child objects (PaymentIntents, SetupIntents, Subscriptions) do not inherit parent metadata.

---

### Theme 8: 404 vs not_configured Collapse

**PRs affected:** PR1 (rule established), PR13 (correct application), PR15B (violation)

The PR-1 rule states: only `501 Not Implemented` maps to the `not_configured` state in the mobile client. A `404 Not Found` indicates the route is genuinely absent and should surface as an error. PR13 correctly implemented this rule; PR15B violated it by collapsing `404` to `not_configured`, which would mask real absent-route defects.

**Pattern:** Mobile error handling must distinguish between "this feature is not configured/available" (501, use not_configured state) and "this route does not exist" (404, surface as an error).

---

### Theme 9: Idempotency Key Lifecycle

**PRs affected:** PR9, PR17_B2, PR17_M5

Idempotency keys must be stable across rollback/retry cycles and must not be mutated while an in-flight operation is executing. Three distinct violations:
- PR9: drip keys were not stable across outer transaction rollback.
- PR17_B2: resend sequence number was computed dynamically (`max + 1`) rather than from a persisted stable key.
- PR17_M5: preview resolution could reset `pushIdemKeyRef` while a push was in-flight.

**Pattern:** Idempotency keys must be generated once and persisted (or stored in a stable ref) before the operation begins. They must not be computed from dynamic state at execution time, and stale async resolutions must check an intent token before mutating key state.

---

### Theme 10: Sub-Coach Scoping and Financial Surface Guards

**PRs affected:** WAVE1_CCSC, WAVE1_EFF

Sub-coach access control required consistent attention across the Wave audits. Two failure modes:
- WAVE1_EFF: IDOR where sub-coaches could access client data outside their scope.
- WAVE1_CCSC: P0 missing `NoActiveSubCoachGuard` on LTV financial route; P1 dismissal used wrong coach ID; P1 inbox semantics used wrong ID comparisons.

**Pattern:** Every new controller route must explicitly consider whether sub-coaches should be permitted. Financial and aggregated-data routes must have `NoActiveSubCoachGuard`. ID comparisons in scoped queries must distinguish between `subCoachId` (acting coach) and `ownerCoachId` (account owner).

---

### Theme 11: Quota Reservation and Accepted-Limitation Documentation

**PRs affected:** WAVE1_A1

When a system cannot make a provable guarantee (e.g., exact token count before an AI call), the code and documentation must be consistent in describing the actual guarantee. WAVE1_A1 required six rounds largely because early rounds maintained false "proven worst-case" claims in comments while the actual implementation was best-effort.

**Pattern:** When a hard guarantee cannot be made, documentation must say "bounded best-effort" rather than claiming a proof that does not exist. False precision in comments is a correctness defect, not merely a style issue.

---

### Theme 12: Atomic DB Operations for Concurrent Writes

**PRs affected:** WAVE1_LTV (7 rounds)

The LTV peak write required seven rounds to correctly implement because each proposed fix introduced a new concurrent-write failure mode. The final solution combined:
- `INSERT ... ON CONFLICT (coach_id) DO NOTHING` to ensure-row in one step.
- `SELECT ... FOR UPDATE` to acquire an exclusive lock before any read.
- Both steps in a single transaction.

**Pattern:** For any aggregate or peak metric that must be monotonically non-decreasing, the correct write pattern is ensure-row (via ON CONFLICT DO NOTHING) then lock-and-update in a single transaction. Application-layer GREATEST comparisons and CTEs that read before the conflict lock are insufficient under concurrent load.

---

### Theme 13: Stale Form State in Modals

**PRs affected:** PR17_M2

Modal components that are reused across navigation without unmounting do not automatically re-seed `useState` initializers. Any form state initialized from props at mount time will become stale when the parent navigates to a different underlying item.

**Pattern:** Forms in reused modals must use `useEffect` with appropriate dependencies (item ID, item updated_at, modal visibility) to re-seed all form state whenever the underlying content changes.

---

### Theme 14: Date Validation for Scheduled Actions

**PRs affected:** PR17_M4

Date validation for scheduled actions must operate at two levels:
1. **Render time:** `minimumDate` must be re-derived on every render, not memoized with an empty dependency array, to stay current past midnight.
2. **Call time:** The guard that checks whether a date is in the past must operate at the moment the Confirm button is pressed, not only when the component renders or re-renders.

These two levels are independently necessary and must be independently verified by tests that press the Confirm button before any rerender following a time advance.

---

## 5. Round-Count Distribution

| Rounds to CLEAN | PRs |
|----------------:|-----|
| 1 | PR2, PR3, PR4, PR5, PR6, PR11, PR15A, PR16, PR17_B1, PR17_M1, PR17_M3, WAVE0, WAVE1_EFF |
| 2 | PR7, PR9, PR10, PR12, PR13, PR14, PR15B, PR17_B2, PR17_M2, WAVE1_CCSC |
| 3 | PR1, PR8, PR17_M5 |
| 4 | PR17_M4 |
| 6 | WAVE1_A1 |
| 7 | WAVE1_LTV |

PRs that required only 1 round tended to be either purely additive schema migrations, straightforward clean implementations, or mobile screen deletions with no logic change. PRs requiring 3+ rounds were concentrated in areas involving: concurrent-write correctness (PR8, WAVE1_LTV), multi-layer asynchronous flows (PR17_M4, PR17_M5), and emergent documentation-accuracy requirements (WAVE1_A1).

---

## 6. Phase 1 CLEAN Status Summary

All Phase 1 and Wave audit sequences reached CLEAN status before merge authorization.

| Audit | Final Verdict | Rounds |
|-------|:--------------|-------:|
| PR1 (PR #208) | CLEAN | 3 |
| PR2 (PR #313) | CLEAN | 1 |
| PR3 (PR #314) | CLEAN | 1 |
| PR4 (PR #315) | CLEAN | 1 |
| PR5 (PR #209) | CLEAN | 1 |
| PR6 (PR #317) | CLEAN | 1 |
| PR7 (PR #316) | CLEAN | 2 |
| PR8 (PR #318) | CLEAN | 3 |
| PR9 (PR #319) | CLEAN | 2 |
| PR10 (PR #320) | CLEAN | 2 |
| PR11 (PR #321) | CLEAN | 1 |
| PR12 (PR #322) | CLEAN | 2 |
| PR13 (PR #210) | CLEAN | 2 |
| PR14 (PR #323) | CLEAN | 2 |
| PR15A (PR #324) | CLEAN | 1 |
| PR15B (PR #211) | CLEAN | 2 |
| PR16 (PR #325) | CLEAN | 1 |
| PR17_B1 (PR #328) | CLEAN | 1 |
| PR17_B2 (PR #330) | CLEAN | 2 |
| PR17_M1 (PR #212) | CLEAN | 1 |
| PR17_M2 (PR #213) | CLEAN | 2 |
| PR17_M3 (PR #215) | CLEAN | 1 |
| PR17_M4 (PR #214) | CLEAN | 4 |
| PR17_M5 (PR #216) | CLEAN | 3 |
| WAVE0 (PR #331) | CLEAN | 1 |
| WAVE1_EFF (PR #334) | CLEAN | 1 |
| WAVE1_A1 (PR #333) | CLEAN | 6 |
| WAVE1_CCSC (PR #335) | CLEAN | 2 |
| WAVE1_LTV (PR #332) | CLEAN | 7 |

---

## 7. Discrepancies Noted

No discrepancies between multiple audit files for the same Phase 1 or Wave PR were identified. Each Phase 1 and Wave PR had a single audit chain (R1, R2, ..., Rn) rather than separate paired/solo audit tracks. The paired/solo dual-audit structure was introduced in the Phase 2 POST_MERGE batch; discrepancies in that structure are recorded in the Phase 2 cleanup plan.
