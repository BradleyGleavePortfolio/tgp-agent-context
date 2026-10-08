# FW-MONEY-128 — first-week client money audit (agent 128, read-only)

Status: DONE (cut short by the operator's 14:46 credit-emergency stop; parts not checked are marked). 14:31-14:48 PDT 10-07.
Code read: mobile main f240af37 (no money file changed since d0875d26), backend main 675242fd (no money file changed since 0d179edb).
Open PRs judged at their heads: m#473 @3a4024b5 (DES-V, dual APPROVE), m#499 @e90a54e8 (DES-AS, dual APPROVE), m#501 @63768bb8
(DES-AT Deliverables, no verdicts yet). None of the findings below is fixed by them.
No code, no PRs, no comments. No Supabase reads.

## Scope traced
More > Membership (MembershipScreen) > View coaching plans (ClientPackagesScreen: Current plan card, YourPlansPanel, buy buttons,
PlanTermsBlock, PurchaseFeedback, fineprint); coach share link (PackageCheckoutScreen); Day-1 / 24 h PackageSelectionSheet; paywall
gates (ProtectedScreen, PaywallSheet, EntitlementProvider, 402 interceptor); dunning (DunningBanner, UpdateCard, DunningLockoutScreen);
legacy hosted-checkout return. Backend: subscription-intent (decide/trial), listPlans, entitlement (hasActiveEntitlement,
ClientEntitlementGuard), invite grants, refunds (admin only), account-deletion billing stop, dunning v2 client email, email sender.
States: coach + paid plan / comp invite grant / no plan; coachless; iOS (non-P2P hidden = true in eas.json) and Android.
Not checked: m#501 Deliverables and PurchaseUnpack content, UpdateCard internals, one-time payment-intent path end to end, Stripe
webhook entitlement flips, push copy for money events.

## (1) B list
B-1 Refund path is false. ClientPackagesScreen.tsx:588 (m#499 head :586): "refunds are handled by your coach". Coaches have no refund
action anywhere: charges are made on the platform account with on_behalf_of (checkout.service.ts:370, subscription-checkout.service.ts:110),
so the coach's Express dashboard cannot refund, and the only refund route is admin-only (payment-ops.controller.ts:552). Terms say
"email the address below" (trust-pages.html.ts:579). On iOS the Membership "Contact support" link is hidden (MembershipScreen.tsx:217).
Story: a client who wants their money back in week one messages the coach as told, and the coach has no way to refund, so it dead-ends.
Smallest fix: fineprint -> "To ask for a refund, email support." plus the existing useSupportEmail action (as in YourPlansPanel).

B-2 Payment emails say "reply to this email" but replies go to a noreply address with no mailbox. dunning-v2-client.hbs:15,
dunning-v2-coach.hbs:6 (live: FEATURE_DUNNING_V2=true); v1 payment-reminder*.hbs, payment-failed.hbs, dunning-final.hbs,
payment-final-notice.hbs say the same. Sender = noreply@growthprojectapp.com, "no mailbox needed" (SoT line 2653); the dispatcher sets no
replyTo (dunning-v2.dispatcher.ts:260-271). Story: a client whose card fails replies with a question and nobody ever reads it.
Smallest fix: email.service.ts:247 `replyTo: input.replyTo ?? SUPPORT_EMAIL` (trust-pages.html.ts:31), which makes every "reply" line true.

B-3 Membership says "Status: Active" from the coach link alone. MembershipScreen.tsx:83 `accessGranted = Boolean(currentUser?.coach_id)`,
shown at :131-139. More labels the row "Your plan, payments and access" (MoreScreen.tsx:104) and about ten money messages send clients to
"Membership" to check their plan (packagePayment.ts:462, 464, 505, 507, 527, 532, 593, 604, 606; planTerms.ts:227 "Cancel anytime in
Membership"; m#473 CheckoutReturn "Check Membership for the current plan status"), but Membership shows no plan, next charge or End my
plan. Those sit one tap deeper, behind a small secondary "VIEW COACHING PLANS" link.
Story: a client whose plan ended or failed opens Membership and reads "Active", while Log and Workout show "Choose a plan".
Smallest fix: status from useEntitlement plus clientPaymentsApi.getPaymentStatus + currentPlanLine (plan name, renews/ends line). Make
"Your plans" the one forest primary action into ClientPackages. (Operator may downgrade this to U if "Status" is read as account status.)

## (2) U list
U-1 Android "View Plans" opens two plan surfaces at once. EntitlementProvider.tsx:104-107 openPlans sets the PaywallSheet visible AND
navigates to ClientPackages, so the modal covers the screen just opened. Its package rows ignore which package was tapped
(handleSubscribe `_packageId`, :156-162). Fix: navigate only.
U-2 Paywall copy is in title case and the button radius is wrong: "Choose a Plan" / "View Plans" (ProtectedScreen.tsx:92,114;
PaywallSheet.tsx:316), radius 8 (ProtectedScreen.tsx:142).
U-3 The plan list shows a free trial the client no longer gets. Mobile never reads the backend's per-client trial_offer
(packages.controller.ts list; no `trial_offer` in mobile src). A client who already used their trial with this coach still sees
"7-day free trial ... not charged today". The server silently drops the trial (subscription-checkout.service.ts:577-593), and only the
terms-review step (usePackagePurchase.ts:1050-1082) catches it after the tap. No wrong charge, but the copy is false until then.
Fix: purchasableFromCoachPackage uses trial_offer.available.
U-4 Membership tells the user "Pull to refresh" but the screen has no RefreshControl (MembershipScreen.tsx:192). The primary button is
ink, not forest (:322-323).
U-5 ClientPackages error banner shows the raw axios text ("Request failed with status code 500 Tap to retry.")
(clientPaymentsApi.ts:386-387 wrap()).
U-6 The Current plan card disappears for a comp or one-time plan whose package is unpublished or archived. Invite grants do not
require publish (invite-grant.service.ts:298), but the name is joined only against the published list (clientPaymentsApi.ts
getPaymentStatus; listPublicForCoach packages.service.ts:813). Fix: return the package name on GET /v1/checkout/purchases
(client-purchases.select.ts).
U-7 One renewing plan is shown three times on ClientPackages: the Your plans card, the Current plan card and the "Current" pill on the
package card (ClientPackagesScreen.tsx:378-430).
U-8 For a client with no plan, a paywall sheet pops on Home at launch: HomeScreen.tsx:195 workoutApi.getAll gets a 402, which triggers
EntitlementProvider.tsx:143-150. This is on top of the 24 h package prompt.

## (3) Dead-button table
| Screen | Control | Result |
|---|---|---|
| Membership | View coaching plans | works (ClientPackages) |
| Membership | Message your coach | works (Home > Messages) |
| Membership | Contact support | Android only; hidden on iOS (no money support path on iOS) |
| Membership | "Pull to refresh" text | dead instruction (U-4) |
| ClientPackages | legacy DunningBanner Update | never renders (status.dunning always null): dead code, C |
| ClientPackages | Smart dunning Update card, End/Keep my plan, Email support, Retry, View what's included, buy, pull-to-refresh | work |
| ProtectedScreen (Android) | View Plans | works but stacks sheet over list (U-1) |
| PaywallSheet | package rows | mislabelled: any row opens the general list (U-1) |
| Lockout | Update card, Message coach, End my plan, data export, delete, Email support, Sign out, pull-to-refresh | work |

## (4) First-week polish (ranked)
1. FIX: the refund line and the support path are true on every money screen (B-1).
2. FIX: replies to payment emails reach a person (B-2).
3. FIX: Membership shows the real plan with one forest "Your plans" action (B-3, U-4).
4. FIX: one plan, one place on ClientPackages: merge Current plan + Your plans into one block, keeping every action (U-7).
5. FIX: the Android paywall opens one surface, in sentence case; trial terms are per client (U-1, U-2, U-3).
6. NEW: the iOS gate ("Your coach manages your access") adds a secondary "See 1:1 coaching plans" link to ClientPackages, which is
   already sold on iOS under 3.1.3(d). Recommended default: yes.
7. NEW: in-app payment history with Stripe receipt links (needs a backend invoice read). Recommended default: after launch; Stripe already
   emails receipts.
8. NEW: "your plan ends in 3 days" reminder for one-time plans. Recommended default: after launch.

## (5) Proposed fix jobs (file-disjoint, each under 400 lines)
- MONEY-MAIL-128: Claude Opus 5.5, T3, backend. Files: src/email/email.service.ts (default replyTo), new test/email-reply-to.spec.ts. About 40 lines. Fixes B-2.
- MONEY-PLANS-128: Claude Opus 5.5, T3 money copy, mobile. Launch AFTER m#499 merges. Files: src/screens/client/ClientPackagesScreen.tsx
  (refund line + support action, U-7 merge), src/api/clientPaymentsApi.ts (U-5 plain error), src/lib/planTerms.ts (U-3 trial_offer) and
  their tests. About 250 lines. Fixes B-1, U-3, U-5, U-7.
- MONEY-MEMBER-128: Claude Opus 5.5, T3, mobile. Launch AFTER m#473 merges. Files: src/screens/client/MembershipScreen.tsx + a new test
  (and the matching README). About 200 lines. Fixes B-3, U-4.
- MONEY-GATE-128: Claude Opus 5.5 (access gate), T2, mobile. Files: src/entitlements/EntitlementProvider.tsx, ProtectedScreen.tsx,
  PaywallSheet.tsx and tests. About 150 lines. Fixes U-1, U-2, U-8 (show the sheet once per session); add polish 6 if the owner says yes.
- MONEY-NAME-128 (lower priority): Claude Opus 5.5, T3. Backend src/checkout/client-purchases.select.ts adds the package name, plus a
  one-line mobile read in getPaymentStatus. Conflicts with MONEY-PLANS (clientPaymentsApi.ts), so run it after that job. Fixes U-6.

## C one-liners
- hasActiveEntitlement (checkout.service.ts:1092) ignores status, while ClientEntitlementGuard requires paid/active/trialing: C (edge, deferred to 10k clients).
- Legacy hosted checkout (BrandedCheckoutWebView/CheckoutReturn) is reachable only by deep link: C.
- A share link opened by a coachless buyer is refused with honest copy (PACKAGE_COACH_NOT_CONNECTED): known gap, growth item.
- Promo codes: none exist and no copy claims them. Restore purchases: not applicable (no IAP; entitlement is server-side).
- Account deletion keeps billing during the 14-day grace; disclosed honestly (DeleteAccountScreen.tsx:85): C.

## Cross-area (for the operator)
- Coach side (no FW row): coaches have no refund tool or guidance. Coach archive (coach.service.ts:325) leaves the client's renewing plan charging with no warning.
- FW-FOOD/FW-ONB: coachless clients get "Join a coach to start logging" on Log (ProtectedScreen); confirm this is intended.
- FW-NOTIF: the B-2 replyTo fix also makes coach-onboarding-welcome.hbs "reply" true.

## Not fixed (needs operator)
B-1, B-2, B-3: route MONEY-PLANS-128, MONEY-MAIL-128 and MONEY-MEMBER-128 (Opus). Owner decision: polish 6 (default yes), 7 and 8 (default after launch).

## HANDOFF
Report complete within the emergency cut. A fresh agent can continue with the "Not checked" list above. No worktree, branch or PR was created.
