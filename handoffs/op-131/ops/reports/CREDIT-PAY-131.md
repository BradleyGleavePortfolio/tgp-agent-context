# CREDIT-PAY-131 (agent 131): let coaches pay for refills (finishes CREDIT-PAY-130)

Started 20:45 PDT. Report updated 21:29 PDT. Status: done. Both PRs are READY at their heads with CI green.
Worktrees:
- Mobile: /home/user/workspace/wt/CREDIT-PAY-131-mobile on branch agent130/credit-pay-m-130.
- Backend: /home/user/workspace/wt/CREDIT-PAY-131-backend on branch agent131/credit-pay-131, new from main.

Owner decision 10 is pending (refill pay path). Both PR bodies start with "Owner decision 10 pending: merge only after the owner's yes." HOLD.txt: CREDIT-PAY-131 PRs merge only after the owner's yes.

## PRs

| PR | Branch | Head | Changed lines | State |
|---|---|---|---|---|
| growth-project-mobile#551 | agent130/credit-pay-m-130 | ae7e2a94b4c12c08bcbf96e55c58eb313b3d987b | 786 (25 files) | READY at 21:28, CI green (4/4), CLEAN. Main merged at 21:18 (2bed5deb) |
| growth-project-backend#877 | agent131/credit-pay-131 | dc6149d74ee69ba7778585fb5602b4cdff8acb7f | 386 (12 files) | READY at 21:28, CI green (15 passed, 1 skipped), CLEAN. Main merged at 21:12 (b72e2c45, includes b#855) |

READY comments:
- [growth-project-mobile#551](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/551#issuecomment-6052233431)
- [growth-project-backend#877](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/877#issuecomment-6052233578)

Mobile commits:
- 5dabee08: merge of origin/main e1688b51 into the agent 130 WIP c1ead0ab.
- a95b8297: receipt copy.
- f2314954: test typing fix. The first CI run failed Typecheck: the `Linking.addEventListener` spy returned a remove-only object. The fix reuses the React Native preset's implementation.
- ae7e2a94: merge of origin/main 2bed5deb.

Backend commits:
- 1392f774: the change.
- dc6149d7: merge of origin/main b72e2c45.

## What was built

Mobile (#551):
- Build-time switch `EXPO_PUBLIC_FF_IOS_US_CREDIT_PACK_LINK` (`featureFlags.iosUsCreditPackLink`). It is on only in the eas.json `clinic` profile.
- On an iOS store build with the switch on, coaches see the three packs and Custom on these surfaces: the Coach Home meter chip, the 95% banner "Buy credits", the 80% guide (with "Not now"), the pause sheet, and the AI-budget push to `CreditPackCheckout`.
- A pack tap mints the existing Stripe Checkout and opens it in Safari with `Linking.openURL`, not the WebView. The app sends `tgp://` return links inline (the backend DTO allows `tgp`) and refetches the budget when the coach returns.
- Other hidden purchases stay hidden, coach 1:1 packages are unchanged, and Android release builds stay hidden.
- Receipt copy is now true: "Payment complete", the credit is on its way, "Paid to: TGP, through Stripe".
- No new dependency or native module. The purchase-policy lock was bumped.

Backend (#877):
- `src/ai-credits/client-purchase-policy.ts`: a global interceptor puts `X-Client-Purchase-Policy` and `X-Client-Platform` in `AsyncLocalStorage` scope for each request.
- The coach copy in the Roman 402, the AI guidance reply and the AI gateway 402 names a credit pack only when the build sells one: `p2p-and-ai-credits`, or `all` from iOS. Otherwise it gives the renewal date ("They renew on November 1."). This is copy only.
- U2: `COACH_AI_PACK_SUCCESS_URL` and `COACH_AI_PACK_CANCEL_URL` are declared in .github/fly-env-desired-state.json, with closed sets in env-validation and two kill lines in the runbook. The manifest diff is only those two keys.

## Evidence (local, one file at a time with heavy.sh; logs in ops/reports/CREDIT-PAY-131-logs/)

Mobile jest:
- New or changed: iosUsCreditPackLink 14/14, CreditPackCheckoutScreen.ExternalLink 6/6, CreditPackCheckoutScreen.SuccessReceipt 4/4.
- Purchase posture: iosStorePackagePurchasePosture 10/10, iosHideNonP2PPurchases 5/5, iosNonP2PSurfacesMatrix 181/181, purchaseSurfaces 10/10.
- Navigation and build guards: pushTapRouter 33/33, easUpdateGuard 74/74, expectedEnv 38/38, releaseEnvProfile 95/95.
- AI budget surfaces: AIBudgetTutorialModal 6/6, AIBudgetMount 4/4, AIBudgetHardPauseModal 3/3, CreditPackCheckoutScreen 4/4.
- Copy and style guards: quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8, romanVoice 98/98.
- ESLint is clean on the 18 changed source files. A bounded tsc over the three new test files is clean.

Backend jest:
- New or changed: ai-credits-caller-purchase-policy 16/16 (includes a real Nest app over HTTP: headers after awaits, a 402 thrown after an await, 6 concurrent requests), ai-guide-coach-pool 7/7, ai-credits-gateway-402 3/3.
- Roman: roman-c2-pool 4/4, roman-rmn2-fixes 6/6, r11-seams 22/22.
- Env and manifest: fly-env-manifest 69/69, fly-env-workflows 15/15, env-validation 50/50, env-registration 30/30, throttler-isolation 28/28.
- Manifest `validate` passes and every kill-switch line is in the runbook. ESLint is clean on the 10 changed files.

Failing-first, run on main b72e2c45 in /tmp/cp131-mainproof: the new AI guidance coach test fails (reply says "Add a credit pack"), and the new gateway test fails (message "AI budget exhausted — top up to continue").

Stripe's own guide for iOS digital goods ([Stripe docs](https://docs.stripe.com/mobile/digital-goods/checkout)) matches the design. It opens Checkout in Safari, recommends a universal link for `success_url` and treats a custom scheme as the fallback. It notes that Checkout redirects after the webhook is acknowledged, or after 10 seconds.

## B list

- B3 (CREDIT-REFILL-130, from the code): no shipped build lets a coach pay for a refill. Fixed by #551 (US iOS link) and #877 (server copy). It takes effect only after the owner's yes and the owner's App Store Connect steps.

## U list

- U (from the code, fixed in #551): the credit-pack receipt claimed "Sent to your inbox" and "now on your account". With the US link a store coach reaches it.
- U (from the code, fixed in #551): the guide close action "I'll buy later" was first person. It now reads "Not now".
- U2 (CREDIT-REFILL-130, fixed in #877): `COACH_AI_PACK_*` were unset, so the in-app checkout never saw its return link. It takes effect when the operator runs fly-env-sync after merge.
- U (from the code, not fixed because of the 800-line size limit): a pack tap on the pause sheet opens the pack list, not that pack's checkout (`CreditPackCheckoutScreen` ignores `preselect`), so the coach taps the pack again. Smallest fix: on mount, start checkout for a numeric `preselect`.

## C

- A cold-start return link (app killed while in Safari) lands on the default coach tab. The budget still refetches and the webhook applies the credit.
- The renewal date is shown in UTC. The pool renews at 00:00 UTC on the 1st, so in the US the credits come back the afternoon before the date shown.
- Old Android release builds send `all`, and the backend treats Android `all` as "no packs" (correct).
- The `X-Client-*` headers are client-supplied, so a modified client can only change wording.
- Stripe recommends a universal link for `success_url`. With the `tgp://` scheme, Safari first asks "Open in TGP?".
- The eas-update guard checks only the purchaseSurfaces hash, so an OTA bundle could carry a changed switch value.

## Proposed (needs operator)

1. Owner decision 10: yes or no on the US external link. Default: hold both PRs (HOLD.txt).
2. If yes, before a clinic-profile iOS build ships: in App Store Connect, offer the app only on the US storefront, and say in the App Review notes that coaches buy AI credit packs through an external link to Stripe Checkout in Safari (Guideline 3.1.1(a), US). Default: owner action, none taken.
3. Stripe Dashboard (CREDIT-REFILL-130 U1): the live webhook endpoint must send `checkout.session.completed` and `checkout.session.expired`. Default: owner checks before the first live pack.
4. After #877 merges, the operator runs fly-env-sync to apply the two `COACH_AI_PACK_*` values. Default: operator.
5. Honour `preselect` on `CreditPackCheckoutScreen` (U above). Default: next mobile lane.
6. Switch the return link to a universal link (https://app.trygrowthproject.com/checkout/...) with an apple-app-site-association path. Default: later.
7. eas-update guard: also block OTA bundles that change `EXPO_PUBLIC_FF_IOS_US_CREDIT_PACK_LINK`. Default: later.
8. B2 per-call rounding stays with the CREDIT-METER lane.

## HANDOFF

- State at 21:29 PDT:
  - growth-project-mobile#551 @ ae7e2a94b4c12c08bcbf96e55c58eb313b3d987b: READY, CI green, CLEAN.
  - growth-project-backend#877 @ dc6149d74ee69ba7778585fb5602b4cdff8acb7f: READY, CI green, CLEAN.
  - Neither PR is merged. Both are held by owner decision 10 (HOLD.txt).
- Next for the lenses: review both PRs at those heads. Mobile first, since it touches the iOS build.
- If main moves, run `git merge origin/main` in the worktrees above (never rebase) and post a new READY at the new head.
- Merge order if the owner says yes: #877 first or together with #551. The mobile PR works against the current production backend either way.
- After #877 merges, the operator runs fly-env-sync to apply the two `COACH_AI_PACK_*` values.
- Merging #551 puts the US link in the next clinic-profile iOS build. The owner must restrict the app to the US App Store and add the App Review note before that build is submitted.
- If the owner says no, do not merge either PR. The clinic build then keeps packs hidden, as on main.
- Mobile and backend cut ownership has moved to agent 132 (iOS build and APK tonight).
- Open items: U (preselect ignored) and Proposed 5 to 8 are for later lanes. Proposed 1 to 4 need the owner or operator.
- Local artifacts:
  - Logs, the PR bodies (`CREDIT-PAY-131-m-pr-body.md`, `CREDIT-PAY-131-b-pr-body.md`), the READY texts and the bounded tsconfig are in ops/reports/CREDIT-PAY-131-logs/ and ops/reports/.
  - A detached git worktree of backend main at /tmp/cp131-mainproof holds the failing-first proof (only copied test files and the new helper; it is not a branch).
- The token-file line (_COMMON item 3, optional) was not used: the safety check refused to copy the token to a file.
