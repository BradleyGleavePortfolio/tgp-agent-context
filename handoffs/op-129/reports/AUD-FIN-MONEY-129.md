# AUD-FIN-MONEY-129 — finish of FW-MONEY-128 (agent 129, read-only auditor)

Status: DONE 16:30 PDT 10-07 (60-minute box, cut short by the owner's 16:24 credit note). Read-only: no commits, no pushes, no PRs, no
comments, no production reads or writes.
Code read: backend main c3324d4a, mobile main a1be6fb2 (both re-fetched from GitHub at 16:06; unchanged).
Evidence: throwaway jest render test in my own worktree /home/user/workspace/wt/AUD-FIN-MONEY-129-mobile (local branch
agent129/aud-fin-money-129, file untracked, never committed or pushed). Copy of the test and its output:
/home/user/workspace/ops/reports/AUD-FIN-MONEY-129-evidence/ (zzAudFinMoney129.throwaway.test.tsx, jest_main_a1be6fb2.txt: 3/3 pass).
The test feeds the exact backend notification rows (fields copied from backend main) through the real mobile normalizer, the real
push/in-app router and the real NotificationCenter and Deliverables screens.

## Scope traced (FW-MONEY-128 "Not checked" list, STOPPED_HALFWAY.md section A)
1. m#501 Deliverables and PurchaseUnpack (merged 14:47): checked. B-1; PurchaseUnpack is C.
2. UpdateCard internals: copy states traced in code only (dispute, paused, in dunning, not in dunning, "Save card and pay $X", bank
   step, End my plan, Message coach). No finding. Not render-tested.
3. One-time payment-intent path end to end: traced POST /v1/checkout/payment-intent (checkout.controller.ts:125 ->
   checkout.service.ts:482 createPaymentIntentForClient, reservation :646-664, PaymentIntent :747-756) -> PaymentSheet
   (usePackagePurchase.ts:820-892 buyOneTime) -> Stripe webhook POST /v1/webhooks/stripe (stripe-webhook.controller.ts:44,52) ->
   payment_intent.succeeded (checkout-webhook-handler.service.ts:2154) -> paid + entitlement + fanout -> app polls entitlement
   (usePackagePurchase.ts:769-784). No B; two Cs.
4. Stripe webhook entitlement flips: traced payment_intent.succeeded (grant, recovery after a failed attempt), checkout.session.completed
   (hosted, :1279), customer.subscription.deleted (revoke + cancel pending drops, :2040-2135). No B. Not traced: refund/dispute
   handler internals, invoice.paid renewal internals.
5. Push copy for money events: dunning v2 client push and in-app blocker (B-2, U-1, U-3), trial ending (FW-NOTIF-128 U5, now
   reproduced), content unlocked (B-1), coach payout notice (has a destination; fine).

## B list (each proven B is also in its evidence table below)
B-1 (REPRODUCED) Paid content looks missing. Story: a client who bought a coach's package taps "New content unlocked: Week 2 program" in
Notifications and is told "No content listed. No content is listed for this purchase.", so what they paid for looks gone.
Why: the content row carries client_purchase_id in payload (drip-dispatcher.cron.ts:493-499, row :511-518), but the mobile normalizer
drops it: inboxScreenForKind gives 'Deliverables' with no params (notificationsApi.ts:305, :334), the router forwards no purchaseId
(pushTapRouter.ts:73), and Deliverables with no purchaseId shows an empty list (DeliverablesScreen.tsx:246, :255-257, copy :186-188).
The push tap goes to the Notification center first (notifications.service.ts:1089-1095), then the same row. The content is reachable
only via More > Membership > View coaching plans > View what's included. (Operator may downgrade to U: content exists, the path is
wrong.) Smallest fix: normalizeNotification passes actionParams { purchaseId: payload.client_purchase_id } for drip_released.

B-2 (CODE-ONLY) Payment-failure pushes claim retries that never happen. Story: a client whose renewal is declined as lost/stolen card,
wrong number or "authentication required" (3-D Secure) gets "your payment did not go through. I will try again tomorrow. You need do
nothing for now.", then "I attempted it again today without success" and "Three attempts have not cleared", but Stripe makes no
further charge until a new card is added, so the client waits on retries that never run and is locked out on Day 10.
Why: copy dunning-v2.copy.ts:51-56 (Day 0), :59-64 (Day 1), :74-79 (Day 3) is chosen by day only
(dunning-escalation.classifier.ts:47-85); handler DunningV2Dispatcher.sendClientPush (dunning-v2.dispatcher.ts:196-227), fired from
the Stripe webhook POST /v1/webhooks/stripe invoice.payment_failed (checkout-webhook-handler.service.ts:666-667, :2777) and the hourly
sweep (dunning-v2.cadence.ts:65). The code itself notes that for hard declines "Stripe schedules the retry but does not execute it
until a new payment method exists" (dunning-v2.cadence.ts:57-63, hard-decline note at :62). Stripe: for incorrect_number, lost_card, pickup_card, stolen_card,
revocation_of_authorization, authentication_required and others, retries only execute after a new payment method and "Unexecuted
retries don't create a new Charge" ([Stripe Smart Retries docs](https://docs.stripe.com/billing/revenue-recovery/smart-retries.md)).
The pushes also speak as an unnamed "I" under the title "Payment". (Operator may downgrade to U: from Day 1 the copy also says
"Updating your card will settle it".) Smallest fix: Day 0/1/3 push lines that are true for every decline, e.g. Day 0 "Your payment of
{amount} did not go through. Update your card in the app to settle it now; another attempt is also scheduled." Needs an owner/operator
yes: the file marks this copy as locked spec (dunning-v2.copy.ts:4-8).

## U list
U-1 (REPRODUCED) The Day-3/Day-7 dunning "in-app blocker" never appears. The backend writes a dunning_blocker row with headline "You are
going to lose access." and action "Update Payment", deep link tgp://billing/update (dunning-v2.dispatcher.ts:298-311; it expects "the
mobile client renders the modal from it"). No mobile code reads dunning_blocker: the row shows in the center titled "Update", the
headline and "Update Payment" never render, and tapping it only marks it read (no actionScreen; notificationsApi.ts:299-307).
Fix: dunning_blocker opens UpdateCard and uses payload.headline as its title (plus an UpdateCard entry in CLIENT_PUSH_ROUTES).
U-2 (REPRODUCED) Every money and purchase inbox row is titled "Update": trial_ending, drip_released and dunning_blocker rows carry no
payload.title, so defaultTitleFor returns "Update" (notificationsApi.ts:274-279). Fix: kind titles ("Your free trial", "New content",
"Payment").
U-3 (CODE-ONLY) The dunning "Payment" push opens nothing. dunning-v2.dispatcher.ts:220 calls pushToUser(client, 'Payment', body) with no
data (notifications.service.ts:837 sends data {}); the app's tap handler finds no actionScreen or kind (pushNotifications.ts:169-170)
and the router returns at pushTapRouter.ts:237, so the app opens wherever it was; Days 0 and 1 leave no inbox row. The copy says
"Updating your card will settle it". Fix: pass { kind: 'dunning_payment', actionScreen: 'UpdateCard' } and add the router entry.
Already reported, now REPRODUCED here (not counted): FW-NOTIF-128 U5, the trial-ending row ("... Cancel anytime before.") lands on the
Notification center itself (trial-notice.service.ts:113, :434-450; pushTapRouter.ts:254-258). Its fix sits with CF-NOTIF-FG-128.

## Evidence table A: REPRODUCED (throwaway jest render test, mobile main a1be6fb2; never pushed)
| finding | what the test shows |
|---|---|
| B-1 | drip_released row normalizes to actionScreen Deliverables, actionParams undefined; tapping it in NotificationCenter calls navigate('MoreTab', { screen: 'Deliverables', params: undefined }); DeliverablesScreen with those params renders "No content listed" / "No content is listed for this purchase." and never calls getPurchaseDrops |
| U-1 | dunning_blocker row renders titled "Update"; "You are going to lose access." and "Update Payment" are absent; tapping it makes no navigate call |
| U-2 | all three rows (drip_released, trial_ending, dunning_blocker) render the title "Update" |
| FW-NOTIF U5 | trial_ending row tap calls navigate('Home', { screen: 'NotificationCenter', params: undefined }) |

## Evidence table B: CODE-ONLY (file:line, handler, API path)
| finding | handler | API path / trigger | lines |
|---|---|---|---|
| B-2 | DunningV2Dispatcher.sendClientPush; DunningEscalationClassifier.resolve | POST /v1/webhooks/stripe (invoice.payment_failed) and the hourly v2 sweep | dunning-v2.copy.ts:51-79; dunning-escalation.classifier.ts:47-85; dunning-v2.cadence.ts:57-65; checkout-webhook-handler.service.ts:666-667 |
| U-3 | DunningV2Dispatcher.sendClientPush -> NotificationsService.pushToUser; mobile dispatchResponse -> routePushTap | Expo push, no data | dunning-v2.dispatcher.ts:220; notifications.service.ts:803-837; pushNotifications.ts:162-173; pushTapRouter.ts:237 |
| C-1 | CheckoutWebhookHandlerService.applyPaymentIntentSucceeded | POST /v1/checkout/payment-intent, then POST /v1/webhooks/stripe payment_intent.succeeded | checkout-webhook-handler.service.ts:2218-2229 (no access_expires_at) vs :1337/:1367 (hosted applies computeAccessExpiry :3105) |
| C-2 | CheckoutReturnScreen -> PurchaseUnpack | legacy hosted-checkout return (deep link only) | CheckoutReturnScreen.tsx:164, :262 |
| C-3 | usePackagePurchase waitForEntitlement | GET entitlement after the sheet | usePackagePurchase.ts:769-784 |

## C one-liners
- C-1: in-app one-time purchases never get access_expires_at, while hosted checkout applies duration_periods. No mobile editor sets
  duration_periods (no match in mobile src), so every package is lifetime access today and nothing differs. Latent if any other path
  sets it.
- C-2: PurchaseUnpack ("what you just got") opens only after the legacy hosted checkout; in-app buyers end on the success sheet.
  Nothing false shown.
- C-3 (edge, deferred to 10k clients): the one-time success poll accepts any active entitlement, not this package's; the sheet has
  already confirmed the payment.
- C: dunning push quips ("dryRoman") use contractions and jokes on a money-failure surface by spec; out of scope here.

## Proposed fix jobs (file-disjoint from each other and from CLIENTFIX-128 claims, each under 400 lines)
- MONEY-INBOX-129: Claude Opus 5.5 (money surface), T2 mobile, about 80 lines. Files: src/services/notificationsApi.ts
  (normalizeNotification: drip_released -> actionParams.purchaseId from payload.client_purchase_id; kind titles; dunning_blocker ->
  actionScreen 'UpdateCard', title payload.headline) and a new test src/__tests__/moneyInboxRows.test.tsx (start from my throwaway test).
  The one-line CLIENT_PUSH_ROUTES entry `UpdateCard: () => ({ root: 'MoreTab', screen: 'UpdateCard', initial: false })` belongs to
  pushTapRouter.ts, which CF-NOTIF-FG-128 owns: fold that line into CF-NOTIF-FG-128, or launch this job after it merges. Fixes B-1,
  U-1, U-2 (and the mobile half of U-3).
- MONEY-DUNNING-COPY-129: Claude Opus 5.5, T3 money copy, backend, about 80 lines. Files: src/checkout/dunning-v2/dunning-v2.copy.ts
  (Day 0/1/3 push lines, straight and dry variants, true for every decline, no unnamed "I"; keep or update ROMAN_STEMS and the specs
  that pin these strings), dunning-v2.dispatcher.ts:220 (push data { kind, actionScreen: 'UpdateCard' }). b#857 (MONEY-MAIL, open)
  edits a dunning-v2 dispatcher call site: launch after b#857 merges. Commit with LEFTHOOK=0. Needs the owner/operator yes on the locked
  copy. Fixes B-2, U-3.

## PRs
None (auditor). Open PRs on my files judged: b#857 @daf0ad19 (MONEY-MAIL: email Reply-To only, fixes none of these). m#501 and m#499
are merged and were judged on main.

## Not fixed (needs operator)
1. B-1, U-1, U-2: launch MONEY-INBOX-129 (Opus), and ask CF-NOTIF-FG-128 to add the UpdateCard route line (default: fold it in).
2. B-2, U-3: owner/operator yes to replace the locked Day 0/1/3 push copy (recommended default: yes, true copy for every decline),
   then launch MONEY-DUNNING-COPY-129 after b#857 merges.
Also for the operator: FEATURE_DUNNING_V2 assumes the owner set Stripe live retries to 1/2/4 days with "leave past due"
(fly-env-desired-state.json gates note). Not verifiable read-only here.

## HANDOFF
Done within the cut. Nothing pushed; my worktree holds one untracked throwaway test (leave it; never commit it). A fresh agent can
continue with what was not reached: render-test UpdateCardScreen states; trace refund-dispute-handler.service.ts (refund revokes access
and cancels drops; partial refunds) and applyInvoicePaid for renewals; confirm B-2's hard-decline path against a Stripe test-mode
invoice if the owner allows (never live).
