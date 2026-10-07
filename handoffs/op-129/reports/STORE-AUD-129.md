# STORE-AUD-129 — App Store listing, screenshot plan and privacy labels vs the real app (agent 129)

Status: DONE at 16:32 PDT 10-07 (all file:line references re-checked on the two mains just before). Auditor only: no code changes, no PRs,
no submissions, no production writes, no sign-in.
Basis: mobile main a1be6fb2, backend main c3324d4a (both checked on GitHub at 16:06 PDT), production backend deploy 26 87f4489b,
production flags = backend .github/fly-env-desired-state.json on main (FEATURE_ROMAN_TOOLS and FEATURE_ROMAN_MEMORY "true",
FEATURE_MWB_AI_LIVE_CREATE "true", FEATURE_COMMUNITY_VOICE_NOTES / _DM unset).
Evidence files (GET bodies): /home/user/workspace/ops/reports/STORE-AUD-129-evidence/

## Proven B (top)

**B-1 (CODE-ONLY, App Store failure): there are no App Store privacy-label (App Privacy) answers anywhere for this app.**
One sentence: when the owner submits the iOS build tonight, App Store Connect will not let the build go to review until the App Privacy
section is answered, and answering it from memory would leave out what the app really sends (Apple Health data, card details entered in
Stripe's sheet, support chats in Crisp, analytics and crash reports linked to the account), which makes the label false.
- Searched both repos and all of tgp-agent-context: the only App Store text is tgp-agent-context/handoffs/op-126/STORE_TEXT_10-07.md, whose
  section 5 item 4 says "do not paste the old declaration worksheet as if it described this build"; no worksheet for this build exists
  (Play's Data safety form was filed by the owner; nothing records Apple's App Privacy answers).
- Exact fix: paste the answers in section "Exact App Privacy answers" below (every row traced to code). If the owner already filled App
  Privacy in App Store Connect, compare it with that table and correct any row that differs.

No other B proven. The two places most likely to cause an App Review problem tonight are listed as owner decision D1 (purchases of
coaching) and Us U-1 to U-5 (all text-only fixes).

## REPRODUCED findings (read-only unauthenticated GETs, 16:13-16:18 PDT)

| ID | Kind | What the GET showed | Store impact / exact fix |
|---|---|---|---|
| R-1 | U-6 (listing package) | `GET https://app.trygrowthproject.com/support` 404, `/` 404, `https://trygrowthproject.com` and `www.` 522 (site down); `/help` 200 and shows the contact email; `/privacy` 200; `/consumer-health-privacy` 200; `/terms` 200; `/help/delete-account` 200. STORE_TEXT_10-07 names no Support URL. | App Store Connect needs a Support URL that reaches a contact (Guideline 1.5). Fix: Support URL `https://app.trygrowthproject.com/help`; Privacy Policy URL `https://app.trygrowthproject.com/privacy`; leave Marketing URL empty (do not use trygrowthproject.com while it returns 522). |
| R-2 | pass | `GET /api/auth/signup-policy` 200: `providers` = email, google, apple (`google_signin_enabled` and `apple_signin_enabled` true). | Guideline 4.8 sign-in parity holds: wherever Google shows, the native Apple button shows on iOS (LoginScreen.tsx:576-580, CreateAccountScreen.tsx:1453; AppleSignInButton renders only on iOS). No name or email question was found after the Apple sheet (CreateAccount, consultation, onboarding). No fix. |
| R-3 | pass + U-1 evidence | `/privacy` (last reviewed 2026-10-07) names Supabase, Fly.io, Stripe, Anthropic, Perplexity, PostHog (session recording off), Sentry, Crisp, Resend, Mux, Expo push, Apple/Google sign-in, USDA/Open Food Facts; says Apple Health is read and "does not write data back to Apple Health"; says no tracking, no ads, no selling, health data never used for advertising; describes in-app deletion with a 14-day grace period and Sign in with Apple unlinking. | Policy matches the SDKs in the binary (package.json: @sentry/react-native, posthog-react-native, crisp-sdk-react-native, @stripe/stripe-react-native, @supabase/supabase-js, react-native-health). It contradicts the app's own HealthKit write string (U-1). |
| R-4 | C | `itunes.apple.com/lookup?id=6765847915` returns 0 results; `apps.apple.com/us/app/the-growth-project/id6765847915` 404. | The app is not live yet, so app.json `extra.storeListings.appStoreUrl` 404s until release. C (expected before first release). Also: "What's New" text is not shown for a first 1.0 release (C). |
| R-5 | U-3 evidence | `/help/delete-account`: client path "profile tab (the person icon in the bottom bar), Settings, Account, Delete account"; coach path "Settings tab, Privacy & Data, Delete my account". | Client path matches code (ClientNavigator.tsx:763-764 tab "You"; SettingsScreen.tsx:196 Account, :261-267 Delete account). See U-3 for the review notes, which still say "More". |

## CODE-ONLY findings (file:line on mobile a1be6fb2 / backend c3324d4a)

| ID | Kind | Finding (file:line, handler, API path) | Exact fix |
|---|---|---|---|
| B-1 | B | No App Privacy answers exist (see top). Collection traced: Sentry src/services/sentry.ts:91 (tracesSampleRate 0.2), :108-109 (sendDefaultPii false, no screenshots), :205 (setUser id); PostHog src/lib/analytics.ts:84 (capture), :99-104 (identify), called with the account id at LoginScreen.tsx:279, 337, 397; workout_logged ActiveWorkoutScreen.tsx:917; package_checkout_started PackageCheckoutScreen.tsx:161; Crisp src/services/support/crisp.service.ts:144-168 (email :160, nickname :163, role :168) for every signed-in user from RootNavigator.tsx:716, 839; Stripe PaymentSheet src/hooks/usePackagePurchase.ts:401-405; HealthKit read set src/services/health/healthkit/healthKitClient.ts:279-295, write [] at :318; pregnancy question src/lib/consultation/definitions.ts:46; optional phone field CreateAccountScreen.tsx:1380. | Paste the "Exact App Privacy answers" table below. |
| U-1 | U (copy contradicts app; Guideline 5.1.1 purpose strings) | app.json ios.infoPlist `NSHealthUpdateUsageDescription` (app.json:30) and the react-native-health plugin `healthUpdatePermission` (app.json:196) say "may write workouts you log to Apple Health", but HealthKitClient requests `write: []` (src/services/health/healthkit/healthKitClient.ts:317-320) and nothing calls a HealthKit save; the live policy and STORE_TEXT review notes say the app does not write. | Set both strings to: "The Growth Project does not write data to Apple Health." (two lines in app.json; native change, so it must be in the 23:00 binary). |
| U-2 | U (purpose string incomplete) | `NSHealthShareUsageDescription` (app.json:29) and plugin `healthSharePermission` (app.json:195) name only the coach, but with the AI permission Roman also reads daily Apple Health summaries (policy "Roman and AI"; backend b#843 read_history covers device health). Consent itself is fine: box 2 is optional, unticked and names Anthropic (src/lib/consultation/copy.ts:42-46); the gateway refuses client data without it (backend src/ai/gateway/ai-gateway.service.ts:131, 252-253; workout-builder-ai.service.ts:2). | Both strings: "The Growth Project reads the Apple Health data you choose (such as sleep, heart rate and workouts) so you, your coach and, if you allow it, Roman can personalise your training, recovery and check-ins." |
| U-3 | U (review notes would send App Review to screens that do not exist) | STORE_TEXT_10-07 section 3 says "More > Membership", "More > Settings > Privacy > Roman and AI", "More > Connected devices", a "Log" tab and coach "Messages". Current tabs: client Home, Train, Food (a11y "Log food"), Calendar, You (a11y "Profile and more"), Community (ClientNavigator.tsx:715-780); coach Overview, Clients, Programs, Team (if any), Community, Settings (CoachNavigator.tsx:717-797). Roman and AI sits in Settings > Roman (SettingsScreen.tsx:436-453), not under Privacy; Delete account in Settings > Account (SettingsScreen.tsx:196, 261). | Replace the paths in the review notes: "You > Membership > View coaching plans > View what's included"; "You > Settings > Roman > Roman and AI"; "You > Connected devices" (Apple Health); "You > Settings > Account > Delete account" (client) and "Settings > Privacy & Data > Delete my account" (coach; src/screens/coach/settings/DangerZone.tsx:36, 94-101, same as the live /help/delete-account page); "You > Settings > Support" (support chat); client tabs "Home, Train, Food, Calendar, You, Community"; coach "Overview, Clients, Programs, Community, Settings". |
| U-4 | U (listing accuracy, 2.3) | The description presents workouts, food logging, Calendar and Community as plain features, but every one is gated on an active coaching plan (ClientNavigator.tsx:159-184 withProtectedScreen); on iOS an unentitled client sees "Your coach manages your access" (ProtectedScreen.tsx:50-80) and a coachless client "Join a coach to start logging" (PaywallSheet.tsx:45-47). | Add to the description: "Training, food logging, Calendar and Community come with an active coaching plan from your coach." |
| U-5 | U (screenshot plan) | The plan (branch ci/SHOTS-127-2, .github/workflows/shots-127.yml, capture.sh) captures 18 flows per size (6.9-inch 1320x2868 and 6.5-inch 1284x2778) at APP_SHA a1762860 (old main). App Store takes at most 10 per size, and 01-welcome, 02-sign-in and 03-role-choice are sign-in/title screens (Guideline 2.3.3). Selectors used by every flow were checked and still exist on main a1be6fb2 (testIDs and labels grep, 16:22). | Re-run on the 23:00 main (already planned for SHOTS-129) and upload, in this order, 10 per size: 10-client-home, 13-client-food-macros, 11-client-train, 12-client-live-workout, 14-client-progress, 15-client-coach-messages, 17-client-calendar, 18-client-community, 20-coach-clients, 22-coach-workout-builder. Never upload 01-03. The review client must have an ACTIVE package or 13/11/12/17/18 fail (paid-only screens). |
| P-1 | pass | Account deletion (5.1.1(v)) in-app for both roles: client You > Settings > Account > Delete account (ClientNavigator.tsx:506, SettingsScreen.tsx:261), coach Settings > Privacy & Data > Delete my account (CoachNavigator.tsx:548, src/screens/coach/settings/DangerZone.tsx:36, 94-101); DeleteAccountScreen.tsx calls GET /me/delete-account/status and POST /me/delete-account (backend src/account-deletion/account-deletion.controller.ts:113, 204); Sign in with Apple tokens revoked via POST https://appleid.apple.com/auth/revoke (backend src/account-deletion/apple-token-revocation.service.ts:39). | None in code. Operator check: Fly must hold APPLE_TEAM_ID, APPLE_SIGNIN_KEY_ID, APPLE_SIGNIN_PRIVATE_KEY (apple-token-revocation.service.ts:69-71); they are not in fly-env-desired-state.json, so confirm they exist (names only, read-only). |
| P-2 | pass | iOS purchases (3.1.1): coach AI-credit packs, coach billing and any non-1:1 product are hidden on iOS, fail-closed on the native build number (purchaseSurfaces.ts:57-95; eas.json production env EXPO_PUBLIC_FF_IOS_HIDE_NON_P2P_PURCHASES "true", inherited by clinic); feature gates never sell on iOS (ProtectedScreen.tsx:50-80, PaywallSheet.tsx:15-24, 75); the only iOS checkout is ClientPackages / PackageCheckout labelled "1:1 coaching with <coach>" (purchaseSurfaces.ts:109-112, PackageCheckoutScreen.tsx:193, ClientPackagesScreen.tsx:353). | See owner decision D1 for the remaining App Review risk. |
| P-3 | pass | HealthKit: read-only, 15 types (healthKitClient.ts:279-295); Apple Health named in UI (You > Connected devices, MoreScreen.tsx:258); data not used for ads (policy); explicit, optional, named-provider AI consent before any health data reaches Anthropic (copy.ts:42-46; gateway consent gate above). | Only U-1 and U-2. |

## Exact App Privacy answers (fix for B-1)

"Do you or your third-party partners collect data from this app?" Yes. Every collected type below is "Linked to the user's identity"
and "Not used for tracking". "Data Used to Track You": none (no IDFA, no ad SDK, no data broker; do not add an ATT prompt).

| Category / data type | Collect? | Purposes to tick | Why (code) |
|---|---|---|---|
| Contact Info: Name | Yes | App Functionality | profile name; Crisp nickname (crisp.service.ts:160-164) |
| Contact Info: Email Address | Yes | App Functionality | Supabase account; Crisp setUserEmail (crisp.service.ts:160); Resend emails |
| Contact Info: Phone Number | Yes | App Functionality | optional phone field on Create account |
| Contact Info: Physical Address, Other | No | | card country/ZIP are part of Payment Info |
| Health & Fitness: Health | Yes | App Functionality, Product Personalization | Apple Health reads (src/services/health/healthkit/healthKitClient.ts:279-295), consultation readiness answers, weight/body, food logs, bloodwork files, Roman notes |
| Health & Fitness: Fitness | Yes | App Functionality, Analytics, Product Personalization | workouts, steps; PostHog workout_logged duration/sets linked to account id (ActiveWorkoutScreen.tsx:917-921) |
| Financial Info: Payment Info | Yes | App Functionality | card entered in Stripe PaymentSheet inside the app; backend keeps brand, last four, expiry month |
| Financial Info: Other Financial Info | Yes | App Functionality | coach payout status/amounts, payout bank name and last four, AI-credit balances |
| Financial Info: Credit Info | No | | |
| Location: Precise / Coarse | No | | the app reads no location. If PostHog's project keeps GeoIP on, tick Coarse Location for Analytics instead (or turn on "Discard client IP data" in PostHog) |
| Sensitive Info | Yes | App Functionality | pregnancy readiness question (src/lib/consultation/definitions.ts:46) |
| Contacts | No | | |
| User Content: Emails or Text Messages | Yes | App Functionality, Product Personalization | coach messages, Roman chats (Roman memory personalises replies) |
| User Content: Photos or Videos | Yes | App Functionality | coach-uploaded videos (Mux), photos sent in support chat (Crisp; app.json:32-33), uploaded files |
| User Content: Audio Data | No today | | the only recorder is the Community voice-note composer (src/screens/community/CommunityVoiceComposerScreen.tsx:93), off while FEATURE_COMMUNITY_VOICE_NOTES is unset; change to Yes before that flag is turned on |
| User Content: Customer Support | Yes | App Functionality | Crisp chat, support emails |
| User Content: Other User Content | Yes | App Functionality | community posts/comments/reactions, check-in notes, consultation free text |
| Browsing History | No | | |
| Search History | Yes | App Functionality | food search words (policy "Food searches") |
| Identifiers: User ID | Yes | App Functionality, Analytics | account id to PostHog identify (LoginScreen.tsx:279), Sentry user id, Crisp session |
| Identifiers: Device ID | Yes | App Functionality, Analytics | push token; PostHog install id |
| Purchases: Purchase History | Yes | App Functionality, Analytics | packages bought; PostHog package_checkout_started (PackageCheckoutScreen.tsx:161-164) |
| Usage Data: Product Interaction | Yes | Analytics | PostHog events (src/lib/analytics.ts:84) |
| Usage Data: Advertising Data, Other | No | | |
| Diagnostics: Crash Data | Yes | App Functionality | Sentry (src/services/sentry.ts:91, 205) |
| Diagnostics: Performance Data | Yes | App Functionality | Sentry tracesSampleRate 0.2 (sentry.ts:91), session tracking |
| Diagnostics: Other Diagnostic Data | Yes | App Functionality | server request/security logs (IP, device type, app version) per policy |
| Surroundings, Body, Other Data | No | | |

## Owner decision (needs the owner; recommended default given)

D1. iOS checkout of coaching packages through Stripe (Guidelines 3.1.1 vs 3.1.3(d)). The iOS app sells only "1:1 coaching with <named
coach>", but a package also unlocks app features (food log, workouts, Roman, Community) and may carry PDFs/videos
(CoachPackage + CoachPackageContent, backend prisma/schema.prisma:3874, 6326); nothing marks a package as including live sessions.
App Review accepts 3.1.3(d) for real-time 1:1 training, and may refuse it if the reviewer sees mainly digital content.
Default (keeps the owner's 10-01 13:37 "no Apple in-app purchase" ruling): submit as is, with the STORE_TEXT 3.1.3(d) review note, and
do NOT point the reviewer at the purchased PDF/video screen as a selling point (keep that path only as an access instruction). If App
Review rejects under 3.1.1, the smallest change is to hide ClientPackages checkout on iOS and send the client to the coach's web checkout
link (allowed as a link-out on the United States storefront since May 2025), which is a mobile PR, not a backend change.

## C (one line each)
- C: NSMotionUsageDescription (app.json:31) has no CoreMotion reader in the app; harmless.
- C: purchaseSurfaces.ts:44 comment says expo-updates is not configured, but app.json enables updates; the gate is still fail-closed on native build >= 6, so behaviour is right.
- C: the App Store "What's New" text in STORE_TEXT is not shown for a first 1.0 release.
- C: /privacy header link "/" 404s (cosmetic).
- C (edge, deferred to 10k clients): none.

## PRs
None (auditor; no code changed, nothing pushed).

## Not fixed (needs operator)
1. B-1: paste the App Privacy table above in App Store Connect before submitting (owner, App Store Connect).
2. U-1 + U-2: app.json ios.infoPlist NSHealthUpdateUsageDescription / NSHealthShareUsageDescription and the react-native-health plugin strings (app.json:29-30 and :195-196); two-string T1 mobile PR before 23:00, because Info.plist only changes with a new binary.
3. U-3 / U-4: edit the STORE_TEXT review notes and description text before pasting (no code).
4. R-1: Support URL `https://app.trygrowthproject.com/help`; leave Marketing URL empty.
5. U-5: SHOTS-129 uploads the 10 listed shots per size from the 23:00 main; the review client needs an ACTIVE package.
6. P-1: confirm (names only) that Fly holds APPLE_TEAM_ID, APPLE_SIGNIN_KEY_ID, APPLE_SIGNIN_PRIVATE_KEY for Apple token revocation.
7. Age rating: the policy says users must be 16 or older; pick 16+ in the App Store age-rating answers so the store and the policy agree.
8. Not verified (no access): if the Resend sending domain is not registered in Apple Developer > Sign in with Apple for Email Communication, emails to clients who chose Hide My Email will bounce. Owner check, 2 minutes.
9. Not verified (no sign-in allowed): the review client must hold an ACTIVE package and the review coach must have the seeded client, or App Review sees only "Your coach manages your access" (Guideline 2.1).

## HANDOFF
- Done 16:32 PDT 10-07, agent 129. Report: /home/user/workspace/ops/reports/STORE-AUD-129.md; GET bodies in STORE-AUD-129-evidence/.
- Verdict: B=1 (App Privacy answers missing; exact answers above), U=6 (U-1/U-2 Health strings, U-3 stale review-note paths, U-4 plan-gated features not said in the description, U-5 screenshot selection, U-6 Support URL), owner decision D1 (Stripe 1:1 checkout on iOS; default keep, as ruled 10-01).
- Passes: sign-in parity (live signup-policy GET), account deletion both roles, HealthKit read-only and consent-gated AI, iOS purchase gates, privacy policy names every SDK in the binary.
- No worktree created, no jest run, no PRs, nothing pushed, no production writes, no submissions.
- Next owner/operator actions are the 9 items in "Not fixed (needs operator)"; items 1-5 are text or config only, item 2 needs the 23:00 binary.
