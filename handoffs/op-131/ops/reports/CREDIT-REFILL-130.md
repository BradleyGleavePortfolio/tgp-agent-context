# CREDIT-REFILL-130 (agent 130) — Credit pool refills and multiplier

Status: READY posted 18:56 PDT (started 18:17 PDT). CI green 16/16 at the head. Branch agent130/credit-refill-130, worktree /home/user/workspace/wt/CREDIT-REFILL-130-backend.
PR: growth-project-backend#870 @ 5f89fb1d2366f8ad04b923dd9b4400e62160b586 (fix fc29a4a0 + merge of origin/main 4c3df677). No mobile PR.
Mains read: backend origin/main d6065661 -> 4c3df677 (b#861 only touched src/roman/guardrails); mobile origin/main 9b37c5df.
Production: Supabase rpyfdsgxxltzutgqeouk, aggregate read-only SELECTs only (18:2x PDT), no rows printed.

Owner, verbatim: "make sure that coaches can ACTUALLY pay TGP for credit pool refills - and that the multiplier between the displayed value
of purchased credits and hard cost amount for TGP is correctly quoted and delivered!"

Short answer: the backend pay path is wired end to end and the multiplier is quoted and booked correctly. But no shipped build lets a coach
open it (B3), the monthly rollover handed spent packs back for free (B1, fixed in b#870), and each AI call is rounded up to a whole hard-cost
cent on four of five paths, so small calls are charged above 3.125 (B2, needs a migration, proposed).

## B list (proven Bs at the top)

- **B1 — spent packs and free grants came back every month (money wrong; seen in a test; FIXED in b#870).**
  `src/ai-credits/coach-ai-budget.service.ts:496-523` (main): `rolloverDueBudgets` reset `actual_used_cents` to 0 and left
  `total_pack_actual_cents` / `pack_displayed_cents` alone, so a pack the coach had used up was restored in full on the 1st of every month.
  Smallest fix (built): subtract the part of the pack the closing period spent (base spent first), with decrements; `pack_paid_cents`
  untouched. Coach: a coach who buys a $25 pack and uses it up finds $25.00 of credit back on the 1st, and TGP pays $8.00 more provider cost
  every month after.
  Failing-first: `test/ai-credits-rollover-pack-carry.spec.ts` on main d6065661: 3 of 5 fail (spent $25 pack: total_pack_actual 800, expected
  0; partly spent: 800, expected 500; spent $10 grant: 320, expected 0). Output saved: ops/reports/CREDIT-REFILL-130.failing-first.txt.
  After the fix: 5/5; `test/ai-credits-stream1.spec.ts` 30 passed, 4 skipped (pre-existing `it.skip` rigs), T5 (unused pack kept) passing.

- **B2 — AI calls are rounded up to a whole hard-cost cent on four of the five debit paths, so small calls are debited above 3.125x
  (money wrong, against the coach; seen in a test; NOT fixed here: needs a migration, see Proposed 2).**
  `src/ai/ai.service.ts:185-190` (`aiGuideCostCents`, Math.ceil), `src/ai/gateway/ai-gateway.service.ts:714-715` (Math.ceil, minimum 1),
  `src/roman/roman.service.ts:1658` (Math.ceil), `src/roman/background/roman-background-spend.ts:212` (Math.ceil); coach meal plans round to
  the nearest cent instead (`src/ai/adapters/anthropic.adapter.ts:236-240`). `CoachAIBudget` stores
  only whole cents (`prisma/schema.prisma:6195-6247`), so there is no place to keep the fraction. Reproduced by running the exported
  `aiGuideCostCents` (ts-node, 18:51): a 1,500 in / 200 out call costs TGP 0.5 cents and debits 1 actual cent = 3.125 displayed cents (6.25x);
  6,000 / 400 costs 1.6 cents, debits 2 (3.91x); 20,000 / 1,500 costs 5.5 cents, debits 6 (3.41x). Smallest correct fix: keep a sub-cent
  usage total and round once per period, not once per call. Coach: a coach whose AI drafts cost half a cent each sees the $125.00 pool
  run out after $20.00 of real provider cost instead of $40.00.

- **B3 — no shipped build lets a coach pay for a refill (a refill that cannot be paid; from the code; needs operator, store decision,
  see Proposed 1).**
  Mobile main 9b37c5df: `src/config/purchaseSurfaces.ts:55` (`IOS_P2P_ONLY_MIN_NATIVE_BUILD = 6`; `app.json:25` buildNumber "7"), `:63-74`
  (iOS hides non-P2P purchases), `:87-95` (`digitalPurchasesHidden`: every Android release build hides them); `src/navigation/CoachNavigator.tsx:607-608`
  registers `CreditPackCheckout` only as `GatedCreditPackCheckoutScreen` (`src/components/purchases/withNonP2PPurchaseGate.tsx:11-18`), which
  renders "Managed on the web" / "This is not available in this app." (`purchaseSurfaces.ts:104-106`). The pack row returns null and the
  hard-pause modal shows renew-date copy (`AIBudgetHardPauseModal.tsx:77-98`). The PWA was dropped (SoT 4773-4784, 8136), so there is no web
  checkout either. Meanwhile the backend tells the coach to buy: `src/roman/roman.constants.ts:221` and `src/ai/ai.service.ts:181` ("Add a
  credit pack to keep using ..."), `src/ai/gateway/ai-gateway.service.ts:288` ("top up to continue"); the backend never reads the
  `X-Client-Purchase-Policy` header the app sends (`src/services/api.ts:159`). Smallest compliant fix: Proposed 1. Coach: a coach whose pool runs
  out is told to add a credit pack and has nowhere in the app or on the web to do it, so AI stays off until the 1st.

## Scope traced

### 1. Refill reachable and payable (app -> controller -> Stripe Checkout on the PLATFORM account -> webhook -> credit grant)

Backend (from the code unless marked):
- App entry (dev builds only, see B3): `CoachHomeScreen.tsx:249` AIBudgetMount -> navigate('SettingsStack', {screen: 'CreditPackCheckout'})
  -> `CoachNavigator.tsx:513, 607-608, 794-795` (route resolves inside SettingsStack) -> `CreditPackCheckoutScreen.tsx` mints, then opens the
  Stripe URL in a WebView.
- Controller: `src/ai-credits/coach-ai.controller.ts:28-29` (`@Controller('coach/ai')`, JwtAuthGuard + CoachGuard), `:38` Roles coach/owner,
  `:65-71` throttle + `@Post('credit-packs/checkout')`, `:84` -> service.
- DTO: `src/ai-credits/credit-pack-checkout.dto.ts:22` tier in small/medium/large/custom, `:33-35` custom integer 1000-50000 cents.
- Service: `src/ai-credits/coach-ai-credit-pack.service.ts:63` createCheckoutSession, `:76` resolveTier, `:90-102` pending
  CoachCreditPackPurchase (paid = displayed = tier cents, actual = bankersRoundPaidToActual(paid, multiplier)), `:106-111` success/cancel URLs,
  `:117-131` Stripe call (metadata `tgp_kind: 'coach_ai_credit_pack'`, purchase id, coach id; idempotency key `coach_ai_pack_<id>`), `:155`
  stores the session id. Tiers `:354-378`: small 1000 "TGP AI Credits — Small ($10)", medium 2500 "— Medium ($25)", large 9900 "— Large ($99)",
  custom "— Custom ($X.XX)".
- Stripe: `src/billing/stripe-api.service.ts:271` createCreditPackCheckoutSession, `:284` mode payment, `:290` unit_amount = the cents above,
  `:304` automatic_tax disabled, `:310` metadata copied to the payment intent; `post()` `:490-510` sends `Authorization: Bearer
  STRIPE_SECRET_KEY` and no `Stripe-Account` header, so the session is on the TGP platform account (no connected account, no application fee).
- Webhook: `src/billing/stripe-webhook.controller.ts:44-105` (POST /api/v1/webhooks/stripe, signature checked) -> `billing.service.ts:166`
  handleEvent -> `:287-311` the package handler runs first and returns claimed:false for pack sessions -> `:325-329`
  `coachAiPacks.handleStripeEvent` -> `coach-ai-credit-pack.service.ts:202-208` (only completed/expired with the pack tgp_kind), `:229-239`
  expired -> failed, `:289-300` applyCreditPack with the stored paid cents.
- Grant: `coach-ai-budget.service.ts:297-368` applyCreditPack, idempotent on the session id; `:342-349` pack_paid += paid, pack_displayed +=
  paid, total_pack_actual += bankersRoundPaidToActual(paid).
- Every tier and custom: same code path; only the cents and product name differ (`:354-378`). Seen in a test: `test/ai-credits-stream1.spec.ts`
  (30 passing at the b#870 head, including the pack apply and webhook cases).
- Gap (U1): `docs/stripe-setup.md:73-85` (main) said "select exactly" a list without `checkout.session.completed` / `.expired`; the pack is
  granted only from `checkout.session.completed`. b#870 adds both to the runbook.

### 2. Multiplier quoted and delivered (production values: multiplier 3.125, base 4000 actual = 12500 displayed)

Constants: `src/ai-credits/ai-credits.constants.ts:22` (3.125), `:24` (12500 = $125), `:28` tiers, `:31-32` custom bounds, `:92`
resolveValueMultiplier; `bankers-round.util.ts:32, 62`. Production budget row stamped 3.125 / 4000 / 12500 (SELECT below), matching the env
the app boots with (`src/common/env-validation.ts:2901-2910` makes both vars required in production).

| Step | $10 small | $25 medium | $99 large | custom X ($10-$500) |
| --- | ---: | ---: | ---: | --- |
| Shown before paying (`CreditPackCheckoutScreen.tsx:261-263`, "You pay face value. $10.00 of credit = $10.00 of AI usage — no multiplier math.") | $10.00 | $25.00 | $99.00 | X |
| Stripe Checkout line (`coach-ai-credit-pack.service.ts:354-378`, `stripe-api.service.ts:290`) | $10.00 | $25.00 | $99.00 | X |
| Pool credit, displayed (`coach-ai-budget.service.ts:342-349`) | +$10.00 | +$25.00 | +$99.00 | +X |
| Pool credit, TGP hard cost (bankersRoundPaidToActual) | 320 = $3.20 | 800 = $8.00 | 3168 = $31.68 | round(X / 3.125) |
| Displayed / hard cost | 3.125 | 3.125 | 3.125 | 3.125 (within half a hard-cost cent) |

- Pool and ceiling: displayed total = 12500 + pack_displayed; used displayed = round(actual_used x 3.125) (`coach-ai-budget.service.ts:245-272`);
  the hard stop is base_actual 4000 + total_pack_actual (`:177-186` canCharge, `:200-240` recordUsage). Quote, checkout line and pool credit
  agree (from the code; seen in a test for the pack apply in stream1).
- Per-call debit: actual provider cents x 3.125 on every path (gateway `ai-gateway.service.ts:381-388`, Guide `ai.service.ts:186-190`,
  coach meal plans `coach-ai.service.ts:114-150, 618`, Roman `roman.service.ts:1651-1688`, background `roman-background-spend.ts:210-237`;
  list price $2 / $10 per MTok, `src/ai/coach/coach-ai.constants.ts:18-20`, Roman `roman.constants.ts:130`). The multiplier is applied
  correctly, but the hard cost is rounded up per call: B2.
- Rollover: B1 (fixed).

### 3. Production (read-only, aggregate counts only, 18:2x PDT)

- CoachCreditPackPurchase: 0 rows of any status (no purchase has ever been made); pending older than 1 hour: 0; pending without a session: 0.
- CoachAIBudget: 1 row; parameters 3.125 / 4000 / 12500 (1 row); rows with pack credit: 0; rollover overdue: 0; rolled at least once: 0.
- StripeProcessedEvent: 0 rows in total (no Stripe event of any type has been processed). ConnectAccount 0, GuestCheckout 0, ClientPurchase 1,
  CoachSubscription 1, coach/owner users 2. So whether the live endpoint receives `checkout.session.completed` cannot be read from data (U1).
- No stuck pending purchase. b#870 changes no live balance (no pack credit exists).

### 4. Store rules (App Store Review Guidelines, last updated June 8, 2026: https://developer.apple.com/app-store/review/guidelines/)

- 3.1.1: "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, ...) you must
  use in-app purchase." AI credits a coach spends inside the app fall here; they are not person-to-person (3.1.3(d) covers "real-time
  person-to-person services between two individuals"), so the 09-30 decision to hide packs on iOS (SoT 8171) is consistent with 3.1.1.
- 3.1.1(a): link-out entitlements "are not required for developers to include buttons, external links, or other calls to action in their
  United States storefront apps." In other storefronts, apps "may not include buttons, external links, or other calls to action that direct
  customers to purchasing mechanisms other than in-app purchase" (unless they hold the StoreKit External Purchase Link Entitlement).
- 3.1.3: "Developers can send communications outside of the app to their user base about purchasing methods other than in-app purchase."
  3.1.3(b) lets web-bought items be used in the app "provided those items are also available as in-app purchases within the app"; 3.1.3(c)
  (enterprise) covers only apps "sold directly by you to organizations", and 3.1.3(f) only apps with "no purchasing inside the app, or calls
  to action for purchase outside of the app".
- 3.1.1 also says IAP credits "may not expire", which the carry-over in b#870 already satisfies if IAP is ever used.
- Android: Google Play US external payment links need enrollment in Google's program and a Play service fee from October 1, 2026
  ([Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/16470497?hl=en)); Google "will not prohibit a
  developer from communicating with users about the availability or pricing of an app outside the Google Play Store"
  ([Google Play policy update](https://support.google.com/googleplay/android-developer/answer/15582165?hl=en)).
- Result: hiding packs is compliant but leaves refills unpayable (B3). Smallest compliant fix and default: Proposed 1.

## U list

- **U1 — the live Stripe webhook endpoint may not send `checkout.session.completed` / `.expired` (from the code).** `docs/stripe-setup.md:73-85`
  (main) said "select exactly" a list without them; `.env.example:259-273` lists them; production has 0 processed events, so it cannot be
  confirmed. Smallest fix: operator checks the endpoint in the Stripe Dashboard (b#870 corrects the runbook). Coach: once refills are visible,
  a coach could pay and never receive the credit.
- **U2 — the return page after paying (from the code).** `coach-ai-credit-pack.service.ts:106-111` falls back to
  `https://app.trygrowthproject.com/billing/success` when `COACH_AI_PACK_SUCCESS_URL` and `STRIPE_CHECKOUT_SUCCESS_URL` are unset, and the
  app's WebView recognises success only on its own deep link (`CreditPackCheckoutScreen.tsx:82, 211-238`, scheme `com.growthproject.app`).
  Smallest fix: operator confirms the production value and points it at the app's return link. Coach: after paying, the coach could land on
  a page that does not exist (the credit still arrives through the webhook).
- **U3 — flat 5-cent hard-cost debit when the provider returns no token counts (from the code).** `ai-gateway.service.ts:705-710`. Whether any
  metered path returns no counts was not traced. Coach: a short call could cost 15.6 displayed cents.

## C (one line each)

- Custom amounts that are not a multiple of 25 cents lose up to 1.56 displayed cents to rounding (`bankers-round.util.ts:62`), from the code.
- Stale comment "$3 / $15 per million" in `src/ai/ai.service.ts:759`; the code uses the $2 / $10 constants, from the code.
- `refundPack` on a spent pack can push pack columns below zero and take it from the next base (`coach-ai-budget.service.ts:442-463`); owner tooling only, from the code.
- Dev builds only: the checkout screen ignores the `preselect` param and shows raw error text (`CreditPackCheckoutScreen.tsx:145, 333`), from the code.
- "Receipt sent to your inbox" (`CreditPackCheckoutScreen.tsx:458, 497`) relies on the Stripe account's receipt-email setting; the backend sets no receipt email, from the code.
- The app's 95% push (`src/notifications/ai-budget-push.ts:33-39`) is never sent by the backend (no `AI_BUDGET_95_WARNING` in backend src), from the code.
- `docs/stripe-setup.md` also omits `account.updated` and `payment_intent.payment_failed` that `.env.example` lists (not refill related), from the code.

## PRs

- growth-project-backend#870 `fix(ai-credits): monthly rollover carries only unused pack credit (CREDIT-REFILL-130, T4)`, 3 files, +283 / -7:
  `src/ai-credits/coach-ai-budget.service.ts` (rollover + private helper `packSpentAtClose`), `test/ai-credits-rollover-pack-carry.spec.ts`
  (new, 5 tests), `docs/stripe-setup.md` (two webhook events). Local: jest new spec 5/5, stream1 30 passed / 4 skipped, eslint clean,
  bounded tsc of the two changed files clean. PR body: ops/reports/CREDIT-REFILL-130-pr-body.md.
- No mobile PR (B3 is a store decision; AIBudgetTutorialModal.tsx untouched, m#513 not merged).

## Proposed (needs operator)

1. **Refill pay path (B3).** Default: on the US storefront, show the three packs and the custom amount on iOS and open the Stripe Checkout URL
   that `POST /coach/ai/credit-packs/checkout` already mints in the system browser, not the in-app WebView (3.1.1(a) US storefront; also the
   owner's recorded fallback, SoT 8171). Storefronts outside the US keep packs hidden. Android stays hidden until the owner decides on Google
   Play's US external payments program (enrollment and a fee). Make the backend's pool-empty copy (`roman.constants.ts:221`,
   `ai.service.ts:181`, `ai-gateway.service.ts:288`) say "Add a credit pack" only when `X-Client-Purchase-Policy` is `all`, and give the renew
   date otherwise. Alternative with no app build: email the coach a payment link at 80% and 100% use (3.1.3 out-of-app communications); less
   certain for storefronts outside the US because of 3.1.3(b).
2. **Per-call rounding (B2).** Default: additive migration `CoachAIBudget.actual_used_micro_cents BigInt DEFAULT 0`; every debit path passes the
   exact cost; `actual_used_cents` becomes the ceiling of the period total, so the round-up happens once a month (under 1 hard-cost cent per
   coach) instead of on every call. T4 lane with a migration.
3. **Stripe Dashboard (U1).** Default: operator confirms the production endpoint includes `checkout.session.completed` and
   `checkout.session.expired`, and adds them if missing (no code change).
4. **Return URL (U2).** Default: operator sets `COACH_AI_PACK_SUCCESS_URL` / `COACH_AI_PACK_CANCEL_URL` to the app's return links (or, with
   Proposed 1, to a page that sends the coach back to the app).
5. **Pack expiry policy.** Default: keep carry-over of the unused remainder (b#870). The other option is that packs expire at month end, as the
   design doc says (`docs/audits/ai_credit_marketplace_2026-05-27.md:177-181`); IAP credits could not expire (3.1.1).

## HANDOFF

- 18:56 PDT: READY posted on growth-project-backend#870 @ 5f89fb1d2366f8ad04b923dd9b4400e62160b586
  (https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/870#issuecomment-6050585861). Head re-checked on GitHub right
  before posting: build-and-test SUCCESS, 16/16 checks complete with none failed, MERGEABLE. Builder ends here; verdicts go to the audit lanes.
- If main moves: `git merge origin/main` in /home/user/workspace/wt/CREDIT-REFILL-130-backend (no rebase), rerun
  `test/ai-credits-rollover-pack-carry.spec.ts` and `test/ai-credits-stream1.spec.ts` via heavy.sh, push, and post
  `FIX ROUND 2 (CREDIT-REFILL-130, agent 130, <ID>) — growth-project-backend#870 @ <sha> — READY FOR AUDIT`.
- Open for the operator (5): Proposed 1 (B3 refill pay path, store decision), Proposed 2 (B2 sub-cent metering, migration lane),
  Proposed 3 (U1 Stripe Dashboard events), Proposed 4 (U2 return URLs), Proposed 5 (pack expiry policy; default keeps b#870 carry-over).
- Files: this report; PR body ops/reports/CREDIT-REFILL-130-pr-body.md; READY text ops/reports/CREDIT-REFILL-130-ready.md; failing-first
  output ops/reports/CREDIT-REFILL-130.failing-first.txt; notify ops/lanes130/notify/CREDIT-REFILL-130.txt.
- Not touched: mobile repo (no mobile PR), AIBudgetTutorialModal.tsx (m#513 not merged), flags, Stripe, production data.
