Tier: T1 — bounded mobile presentation and truthful-copy correction.
Why: Buyers should see what is available, what is still locked, and only the timing actually supplied by their purchase.
T4 trigger scan: None. No payment, grant, authorization, tenancy, credential, account, backend or destructive-data changes; purchased-media behavior is frozen.
T3 trigger scan: None. No new dependency, schema, API, navigator, route parameter or backend contract.
Bounded T1: Only DeliverablesScreen, its shared DropRow, the matching screen README row and targeted tests; under 300 changed lines.
Canonical builder: DES-AT-127, agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: Failing-first state/copy/style assertions; 46 deliverables tests, 35 shared-row PurchaseUnpack regression tests and 30 doctrine guards pass locally, one file at a time via ops/heavy.sh. CI supplies full-project typecheck/lint/test.
Promotion triggers: Any change to purchased-media grants, payment/access state or routing contracts must leave this presentation-only lane.

## What changes for coaches/clients

Unlocked content appears first as unfilled hairline rows with an outline open icon. Upcoming content remains muted and keeps its real unlock date or trigger; unknown timing says “Not unlocked yet.” Complete coach titles and captions remain visible without extra taps. The screen has a Cormorant heading, Inter details, semantic theme colours and a visible 44-point Back action in every state. Retry is the only filled forest primary action, only on a loading failure. Platform back behavior is preserved.

## B / U list

- B1: A buyer opening a purchase with an upcoming item that has no date or trigger sees “Unlocks soon,” falsely promising timing. Fixed with “Not unlocked yet.”
- B2: A buyer seeing no visible rows or an unavailable content endpoint is told the coach has not added anything, which the response does not establish. Fixed with distinct neutral empty/unavailable copy.
- B3: A buyer sees “Tap to open” on a delivered item lacking its required viewer reference. Fixed by showing “Delivered” and inviting taps only when the existing tappability helper confirms a real action.
- U1: Filled rounded boxes, dashed locked outlines and small text become unfilled hairlines with readable typography.
- U2: The route hides its native header and lacked a visible Back control. A non-animated haptic Back control now calls the existing navigator's goBack; top safe-area handling prevents overlap.

## Truthful sweep (baseline file:line)

| File:line | Before | What the data establishes | After |
| --- | --- | --- | --- |
| `deliverables/dropRow.tsx:151` | “Unlocks soon” | No date or trigger-backed cadence | “Not unlocked yet.” |
| `DeliverablesScreen.tsx:134-137` | “No deliverables yet. Your coach hasn't added anything … Check back soon.” | Endpoint not configured, not the coach's activity | “Content list unavailable. This purchase's content list is not available here.” |
| `DeliverablesScreen.tsx:187-190` | Same empty claim | No buyer-visible rows; failed/canceled/skipped items are filtered | “No content listed. No content is listed for this purchase.” |
| `deliverables/dropRow.tsx:277` | “Tap to open” | A fired item can lack its viewer reference | Keep “Tap to open” only when tappable; otherwise “Delivered.” |
| `DeliverablesScreen.tsx:208-209` | Always instructs the buyer to tap a delivered item | There may be no tappable delivered item | Instruction appears only when at least one delivered item can open. |

Other truthful copy is unchanged word for word: package name, asset labels, delivered dates, real unlock dates, cadence-backed triggers, coach-authored captions, Retry and loading-failure guidance. There are no invented counts, praise, goals, sharing promises or timing.

## Routes/actions before -> after

| Label/action | Before destination/effect | After |
| --- | --- | --- |
| Delivered workout program | `WorkoutAssignmentDetail`, `{ assignmentId }` | Unchanged, render/press test |
| Delivered workout plan | Same assignment destination | Unchanged, render/press test |
| Delivered meal plan, assignment reference | `ClientDailyMealPlan`, `{ assignmentId }` | Unchanged, render/press test |
| Delivered meal plan, legacy date reference | `ClientDailyMealPlan`, `{ date }` | Unchanged, existing render/press test |
| Delivered message | Parent `Home`, `{ screen: 'Messages' }`; standalone `Messages` fallback | Unchanged, existing render/press test and frozen routing helper |
| Delivered PDF | `openPurchasedMedia(asset_id)`, existing grant-scoped signed URL and system viewer/download handling | Unchanged, render/press test; media module untouched |
| Delivered video | Same signed URL viewer/stream handling | Unchanged, render/press test; media module untouched |
| Retry | `getPurchaseDrops(purchaseId)` | Unchanged, test presses Retry and verifies another fetch |
| Pull-to-refresh | Reload this purchase's drops | Unchanged, existing handler test |
| Back | Platform back / stack gesture | Preserved; additional visible Back calls `goBack`, tested in light/dark |
| Upcoming / delivered without required reference | Not tappable | Unchanged; no dead tap affordance |
| PurchaseUnpack shared rows | Same row and routing helper | Same presentation improvements, all 35 existing regression tests pass |

No action or navigation path is removed. Unknown timing and non-tappable instructions are corrected under acceptance rule 1; no functional removal is necessary.

## Verification

- Failing-first deliverables assertions exposed the old false timing/empty claims, non-tappable invitation, boxed/undersized styles and truncated captions before the implementation changed.
- Back/light/dark assertions failed twice before the screen-owned control was added.
- `ops/heavy.sh npx jest src/__tests__/deliverablesScreen.test.tsx --runInBand --silent`: 46 passed.
- `ops/heavy.sh npx jest src/__tests__/purchaseUnpackScreen.test.tsx --runInBand --silent`: 35 passed.
- `ops/heavy.sh npx jest src/__tests__/quietLuxuryDoctrine.test.ts --runInBand --silent`: 30 passed.
- Colours are semantic/theme tokens; no added hex literals, dependencies, lockfiles, photos, gradients, banners, springs or exclamation marks. Existing media and routing behavior is unchanged.
- No device screenshot is claimed; evidence is rendered component/state/action testing.
