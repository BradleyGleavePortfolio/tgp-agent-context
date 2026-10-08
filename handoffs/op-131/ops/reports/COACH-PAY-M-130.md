# COACH-PAY-M-130 (Claude Opus 5.5, BUILDER, T4 mobile money, agent 130) — coach payments screen per client

Status: READY FOR AUDIT 19:28 PDT (growth-project-mobile#545 @ 8eab7ee5, CI green). Builder ended. Started 18:17 PDT.
Worktree /home/user/workspace/wt/COACH-PAY-M-130-mobile, branch agent130/coach-pay-m-130 (from mobile main 9b37c5df).
Pushed head 8eab7ee5e2a44b32de02c87cdfd5d01f212df928 (c6c89e4d feature, a27e77db copy fix, merges of origin/main up to 5c354562); 13 files, +1115.

## Scope traced
- Backend contract (backend#869 @ e1d398cd, branch agent129/cf-coach-pay-be-128): GET/POST /v1/coach/clients/:clientId/payments[/:purchaseId/refund|pause|resume|cancel],
  flag FEATURE_COACH_PAYMENT_ACTIONS (404 when off), /me/feature-flags key coach_payment_actions (coach/owner only).
- Full refund rule (refund-dispute-handler.service.ts:2427 createAdminRefund -> coversCharge :724 -> revokeFullyRefunded :487): once refunds cover
  the whole payment, access to the plan ends (one-time and recurring) and recurring billing pauses until the seller coach restarts it.
- Cancel (client-billing.service.ts:1454 cancelPlan): not delinquent -> billing stops at period end, access until then; past_due/unpaid or an
  active dunning row -> ends now, unpaid invoices voided.
- Pause (stripe-connect-api.service.ts:1210 pause_collection=void): nothing charged while paused, client keeps access.

## Built
- src/api/coachClientPaymentsApi.ts: list/refund/pause/resume/cancel; strict parse (MoneyPayloadError on drift); idempotency key per confirmed tap.
- src/lib/money/clientPaymentsCopy.ts: price/state/payment lines, refund consequence, confirm and outcome copy, failure copy (server message for its 8 codes,
  unknown-outcome copy for no reply or an unreadable reply, describeError otherwise), amount parse/format per currency exponent.
- src/screens/coach/ClientPaymentsScreen.tsx (ClientsStack route ClientPayments { clientId, clientName? }): hairline section per plan, text actions
  (Pause billing, Resume billing, Restart plan, Cancel plan) only where the server allows, payments with Refund where refundable > 0, refund sheet (one
  forest button), pull to refresh.
- Entry: Summary > Actions > Payments pill, passed by ClientDetailScreen only while coach_payment_actions is on; hidden for a sub-coach (roster role or the
  session's head-coach-handles-money signal; a 403 on the screen sets that signal).
- Operator defaults 18:47 built: (1) refunding all of a payment, an earlier month included, says it ends access and pauses billing, and the button reads
  "Refund $X and end access"; (2) entry hidden for sub-coaches.
- READMEs: src/screens/coach/README.md, src/navigation/README.md, docs/QUIET_LUXURY_DOCTRINE.md section 8.

## Evidence (local, ops/heavy.sh, one file at a time)
- Seen in a test (after merging origin/main 5c354562): ClientPayments.test.tsx 12/12; useFeatureFlags.test.tsx 8/8; quietLuxuryDoctrine.test.ts 30/30;
  coachClientWorkoutsMakeover127 7/7; coachFoodConsent124 2/2; coachFoodReview124 15/15; coachNavigation 5/5; reachabilityGates 19/19; coachSaasBlockers 29/29.
- Narrow tsc over the touched files and their imports (587 src files): exit 0. ESLint on the 5 new/changed code files: exit 0.
- Failing first, from the code: on main 9b37c5df ClientPayments.test.tsx cannot import ../ClientPaymentsScreen (absent) and SummaryTab has no Payments pill.

## B list
- B-1 (owner 14:58, from the code): a coach cannot refund, pause or cancel a client's payment in the app (refunds admin-only). Fixed by this screen
  (seen in a test), live once FEATURE_COACH_PAYMENT_ACTIONS is on.

## U list
- U-1 (operator default 1, from the code): refunding all of an earlier month ends access and pauses billing (coversCharge). Said before the tap (seen in a test).
- U-2 (operator default 2, from the code): sub-coaches read coach_payment_actions true but every route answers 403. Entry hidden (seen in a test).

## PRs
- growth-project-mobile#545 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545 opened 19:21 PDT @ 8eab7ee5
  (body: /home/user/workspace/ops/reports/COACH-PAY-M-130-pr-body.md). No file overlap with open m#543, m#542, m#537, m#535, m#524.

## Proposed (needs operator)
1. Size: +1,115 lines (screen 416, tests 266, copy 195, API 179, wiring/docs 59): over the 800 target, under 1,500. Default: ship as one PR (screen, its
   copy and its tests belong together).
2. Backend copy says "Use Restart billing on this plan instead." (PLAN_PAUSED_BY_REFUND_OR_DISPUTE); the app's action is "Restart plan" (same as the
   existing dispute card). Default: backend copy follow-up changes "Restart billing" to "Restart plan".
3. A Money > charge page link ("Refund, pause or cancel") would help coaches who look in Money first. Not built (MoneyChargeScreen has no flag hook and
   its tests render without a query client). Default: small follow-up after the flag goes on.
4. The client is not told about pause or cancel (backend report item 3). Not built (operator: separate follow-up). The coach copy does not claim
   either way. Default: if that follow-up is dropped, add "Jane is not told automatically" to the pause and cancel dialogs.
5. Client copy ClientPackagesScreen.tsx:585 "Refunds are issued by The Growth Project team..." could mention the coach once the flag is on.
   Default: reword it in the flag-flip PR (already on the operator's follow-up list in FLEET130).

## HANDOFF
- PR: growth-project-mobile#545 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545, branch agent130/coach-pay-m-130,
  head 8eab7ee5e2a44b32de02c87cdfd5d01f212df928. Title: feat(coach): coaches refund, pause and cancel a client's payments (COACH-PAY-M-130, T4).
- CI at head: Typecheck, lint, test success (run 37717455741); CodeQL and both Analyze jobs success. Mergeable, merge state CLEAN at 19:27 PDT.
- READY posted 19:28 PDT: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/545#issuecomment-6050928378
  (text: /home/user/workspace/ops/reports/COACH-PAY-M-130-ready.md). PR body: /home/user/workspace/ops/reports/COACH-PAY-M-130-pr-body.md.
- Production effect on merge: none until FEATURE_COACH_PAYMENT_ACTIONS is on (no `coach_payment_actions` key -> no Payments entry). Safe for the
  23:00 PDT iOS cut either way.
- For auditors: the screen is src/screens/coach/ClientPaymentsScreen.tsx; copy and every consequence sentence in src/lib/money/clientPaymentsCopy.ts;
  strict parser in src/api/coachClientPaymentsApi.ts; entry gate in ClientDetailScreen.tsx (flag) and SummaryTab.tsx PaymentsPill (sub-coach).
  Test: src/screens/coach/__tests__/ClientPayments.test.tsx (12 tests).
- Known limits (C items in the PR body): cross-currency payments show no Refund without a reason; a head coach cannot restart a team sale's
  refund-paused plan (server rule) and the copy does not name who can; a sub-coach can see Payments once before the roster read answers.
- Needs operator: the 5 Proposed items above (defaults given).

