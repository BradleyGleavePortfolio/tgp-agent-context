Owner decision 10 pending: merge only after the owner's yes.

**Tier:** T4 (money: a coach pays TGP for AI credit packs).
**Why:** CREDIT-REFILL-130 B3: no shipped build lets a coach pay for a refill. When the pool runs out the app offers nothing to buy and AI stays off until the 1st. This applies the owner's recorded 09-30 fallback (SoT: "an external link to web checkout on the US storefront (3.1.1(a))"), CREDIT-REFILL-130 Proposed 1.
**T4 trigger scan:** money: yes (opens the existing Stripe Checkout that `POST /coach/ai/credit-packs/checkout` already mints; no new endpoint, no price or amount change, no Stripe change). Auth, RLS/tenancy, PII, credentials, destructive data: none.
**T3 trigger scan:** store posture: yes (iOS external purchase link, US storefront only, Guideline 3.1.1(a)). No route added or removed. No new dependency, no native module, no lockfile change.
**Bounded T1:** copy on the AI budget surfaces and the credit-pack receipt.
**Canonical builder:** CREDIT-PAY-130 (agent 130, WIP c1ead0ab), finished by CREDIT-PAY-131 (agent 131).
**Parent owner:** CREDIT-REFILL-130 (B3, Proposed 1), operator agent 131.
**Acceptance evidence:** local jest, one file at a time: `iosUsCreditPackLink` 14/14, `CreditPackCheckoutScreen.ExternalLink` 6/6, `CreditPackCheckoutScreen.SuccessReceipt` 4/4, `iosStorePackagePurchasePosture` 10/10, `iosHideNonP2PPurchases` 5/5, `iosNonP2PSurfacesMatrix` 181/181, `pushTapRouter` 33/33, `easUpdateGuard` 74/74 (purchase-policy lock bumped for the reviewed `purchaseSurfaces.ts` change), `purchaseSurfaces` 10/10, `AIBudgetTutorialModal` 6/6, `AIBudgetMount` 4/4, `AIBudgetHardPauseModal` 3/3, `CreditPackCheckoutScreen` 4/4, `quietLuxuryDoctrine` 30/30, `truthfulCopy.guard` 20/20, `copyVoice.guard` 8/8, `expectedEnv` 38/38, `releaseEnvProfile` 95/95, `romanVoice` 98/98. ESLint clean on the 18 changed source files. CI at the head.
Failing-first: `iosUsCreditPackLink` and `CreditPackCheckoutScreen.ExternalLink` cover new behaviour (on main `creditPackCheckoutMode` does not exist and every iOS store build hides packs). `CreditPackCheckoutScreen.SuccessReceipt` fails on main (main renders "Credits added", "now on your account", "Sent to your inbox").
**Promotion triggers:** none beyond T4 (both lenses at the head, and the owner's yes on decision 10).

## What changes for coaches and clients

- On an iOS App Store build made with the `clinic` profile (the build-time switch `EXPO_PUBLIC_FF_IOS_US_CREDIT_PACK_LINK` is on only there), a coach whose AI credits run low or out sees the three packs ($10, $25, $99) and Custom on the Coach Home meter, the 95% banner, the 80% guide and the pause sheet.
- A pack tap mints the same Stripe Checkout as before and opens it in Safari (`Linking.openURL`), never inside the app. The screen says the coach pays TGP the pack price through Stripe checkout in the browser, then waits with "Done" and "Open checkout again".
- Stripe returns to `tgp://checkout/success` or `tgp://checkout/cancel`. The app sends these inline, so they work with the current production server. Success shows the receipt, cancel goes back to the packs, and coming back to the app refetches the budget.
- The receipt now reads "Payment complete", says the credit is on its way and shows on Coach Home once Stripe confirms the payment, and shows "Paid to: TGP, through Stripe". Before, it said "Credits added", "now on your account" and "Receipt: Sent to your inbox", none of which the app can know.
- The guide's close action reads "Not now" (was "I'll buy later", first person).
- Builds without the switch (the `production` and `preview` profiles, and every Android release build) keep packs hidden. Their hidden checkout route now says "Not available in this app" and that packs are not sold in this version of the app, instead of "Managed on the web" (there is no web checkout).
- Seat upgrades, subscriptions and one-to-many products stay hidden on iOS. Coach 1:1 packages are unchanged. Clients see no change.
- A US-link build sends `X-Client-Purchase-Policy: p2p-and-ai-credits`. The companion backend PR (branch `agent131/credit-pay-131`) reads it only to word the "AI credits used up" message.

## Owner actions before a build with the switch ships

1. App Store Connect, Pricing and Availability: offer the app only on the United States storefront. The app cannot read the storefront without a new native module (only `expo-localization` is installed, and it gives the device region, not the storefront), so the build-time switch stands in for StoreKit's `Storefront`.
2. App Review notes: say that coaches can buy AI credit packs through an external link that opens Stripe Checkout in Safari, under Guideline 3.1.1(a) for the US storefront.
3. Stripe Dashboard (CREDIT-REFILL-130 U1): the live webhook endpoint must send `checkout.session.completed` and `checkout.session.expired`. Without them a coach pays and the credit never arrives.
4. If the owner says no to decision 10, do not merge this PR. The clinic build then keeps packs hidden, as today.

Merging this PR before the 23:00 cut puts the US link in iOS build 7, because `eas.json` turns the switch on in the `clinic` profile.

## B / U

- B3 (CREDIT-REFILL-130, from the code): fixed for US iOS builds. The companion backend PR fixes the server copy.
- U (from the code): the receipt claimed "Sent to your inbox" and "now on your account". Fixed.
- U (from the code): "I'll buy later" was first person. Fixed ("Not now").
- U (from the code, not fixed here for size): a pack tap on the pause sheet opens the pack list, not that pack's checkout (`CreditPackCheckoutScreen` ignores the `preselect` param), so the coach taps the pack again. Smallest fix: on mount, start checkout for a numeric `preselect`.
- C: Stripe recommends a universal link for `success_url`. The `tgp://` custom scheme works, but Safari first asks "Open in TGP?".
- C: Android release builds stay hidden. Google Play US external payments need enrollment and a fee from October 1, 2026 (owner decision).

## Routes/actions before -> after

| Surface | Before (main, iOS store build) | After: clinic build, switch on | After: switch off, or Android release |
|---|---|---|---|
| `CreditPackCheckout` route | "Managed on the web", no actions | Packs + Custom; checkout opens in Safari | "Not available in this app", no actions |
| Coach Home meter chip | Read-only | Button -> `CreditPackCheckout` | Read-only (unchanged) |
| 95% banner | No call to action | "Buy credits" -> `CreditPackCheckout` (preselect custom) | No call to action (unchanged) |
| 80% guide | 3 usage cards, "Done" | 4 cards, pack row + "Not now" | 3 usage cards, "Done" (unchanged) |
| Pause sheet | Renewal-date copy, no packs | Pack row + Custom + who is paid | Unchanged |
| AI budget push | Lands on Settings | Lands on `CreditPackCheckout` | Lands on Settings (unchanged) |
| Pack tap on the checkout screen | n/a (hidden) | Mint + Safari; then "Done" (back) or "Open checkout again" (reopens the URL) | n/a |
| Stripe return `tgp://checkout/success` / `cancel` | n/a | Receipt / back to the packs | n/a |
| Development builds | In-app WebView checkout | Unchanged | Unchanged |

Parity is proven in `src/__tests__/iosUsCreditPackLink.test.tsx` (chip role, banner navigate target, pause-sheet packs, guide packs + "Not now", push route), `src/screens/coach/__tests__/CreditPackCheckoutScreen.ExternalLink.test.tsx` (mint with the `tgp` links, Safari open, no WebView, success and cancel, "Done" goes back, refetch on return) and `src/__tests__/iosNonP2PSurfacesMatrix.test.tsx` (hidden matrix unchanged).

## Truthful sweep

- "You pay TGP the pack price through Stripe checkout, which opens in your browser." True: the session is on TGP's own Stripe account (no connected account; backend `stripe-api.service.ts` sends no `Stripe-Account` header), and the screen opens Safari.
- "Stripe checkout for $X is open in your browser. You pay TGP $X. The credit shows on Coach Home once Stripe confirms the payment." True: the webhook applies the credit.
- Receipt: "Payment complete" (Stripe returns to the success link only after payment), "on its way" (the webhook applies it), "Paid to: TGP, through Stripe".
- Hidden state: packs are not sold in this version of the app (true without the switch).
- No first person, no exclamation marks, no emojis, theme colours only. One primary per phase ("Done" in the browser phase; "Open checkout again" is a text button). No motion added.

README: `README.md` (iOS purchase posture), `src/components/README.md`, `src/navigation/README.md` and `src/screens/coach/README.md` are updated.

agent 131
