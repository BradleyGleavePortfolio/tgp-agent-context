AUDIT Claude Opus 5.5 (LN-OPUS-M-131) — growth-project-mobile#568 @ 5109af023669ae4c5da258de51669ba1a5fde378 — VERDICT: APPROVE

Full review (T4 money). 491 changed lines, 13 files. CI 4/4 green at this head. Mergeable clean; main a5f9d5b5 is merged in, and `--remerge-diff` shows no manual edits. The head is the one named in READY, re-checked on GitHub right before posting. The whole diff and all three test files were read. Everything below is from the code; no tests were run locally.

B: none.

U: none.

Checked (from the code):
- Android switch. src/config/purchaseSurfaces.ts:135 returns 'external' only for Android with `androidCreditPackLink` (literal env read, default off, featureFlags.ts:532-544). eas.json:31 sets it only in `preview` (internal APK; there is no submit profile for preview). production and clinic do not set it, and clinic extends production. The test at androidCreditPackLink.test.tsx:118-178 runs every profile through the real flag reader: Android preview is external; Android production, clinic and no profile are hidden; iOS clinic is external; iOS production, preview and no profile are hidden.
- Nothing else is sold. `digitalPurchasesHidden` is unchanged (still true on an Android release), so seat upgrades, subscriptions and paywalls stay hidden. The UpgradeGate test is at :186-194.
- `purchasePolicyHeader` (:152-155). The reordered branches give the same value as main for every iOS build and for Android builds without the switch ('all'). Only an Android link build changes: it now sends 'p2p-and-ai-credits'.
- Backend (main f545c7c1 = production deploy 39). The pack checkout only needs Roles and a throttle (coach-ai.controller.ts:64-96) and has no platform check. `IsUrl` accepts the inline tgp:// links (credit-pack-checkout.dto.ts:44-50). The headers only change wording (client-purchase-policy.ts:48-54), so a coach on that build is told to add a pack where packs are sold. No backend PR is needed.
- Return path. The Android path is the existing iOS link path. The scheme is in app.json, and the RootNavigator URL guard ignores checkout links. The screen listens for the return link and refetches when the app is active again (CreditPackCheckoutScreen.tsx:299-319). The webhook credits the pack in any case, so the money is never lost if the redirect fails.
- Preselect (:228-238). It runs once per mount (ref) and only for an amount in `pack_options_cents`. 'custom' focuses the field (:403), and anything else shows the list. The gate HOC forwards `route` (withNonP2PPurchaseGate.tsx:17-18). The coach has already seen the price, who is paid and the non-refundable line on the card they tapped (AIBudgetHardPauseModal.tsx:88-106).
- Non-refundable line. PackOptionsRow.tsx:73-75 covers the checkout list, the guide's last card and the hard pause. It is also on the browser wait state (CreditPackCheckoutScreen.tsx:456-458). It is hidden wherever packs are hidden (androidCreditPackLink.test.tsx:236-250). No other surface shows pack prices (grep for `pack_options_cents` and PackOptionsRow).
- Lock file. scripts/purchase-policy.sha256 equals sha256(purchaseSurfaces.ts) at this head (476c9470…).
- Copy and theme. The new copy has no first person, no exclamation marks and no emoji. It uses theme `textSecondary` at 13 pt, adds no hex, and adds no `as any`, `as unknown as` or `as never`. The READMEs are updated.

C:
- Chrome on Android may not follow the tgp:// redirect without a fresh tap. The coach then comes back by hand, the balance refetches, and the screen stays on "Finish paying in your browser" until Done. Stripe's mobile guide points to universal/App Links for Checkout returns, and this applies to the iOS link too. The builder's own C.
- C (edge, deferred to 10k clients): a new preselect sent to an already-mounted checkout screen (left in the wait state through the tab bar) keeps the earlier phase.
- The guide's card 3 still says "no fine print" (AIBudgetTutorialModal.tsx:129, unchanged), one card before the non-refundable line.
- The backend comment client-purchase-policy.ts:41 names only iOS. The builder's own C.

Owner decision (unchanged default): keep the Android switch off for any Google Play build.

agent 131
