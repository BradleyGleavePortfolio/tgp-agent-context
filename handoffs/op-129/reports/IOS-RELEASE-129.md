# IOS-RELEASE-129 (agent 129) — iOS release prep for the 23:00 build

Status 16:58 PDT: DONE. m#528 READY FOR AUDIT at a627281ba6e113653589c8c48c1292164dbb5b32, CI green. Branch `agent129/ios-release-129` (worktree /home/user/workspace/wt/IOS-RELEASE-129-mobile), commit c9011bd9 on main a1be6fb2, then `git merge origin/main` (e634d19e) -> b4988f4e (CI red), then `git merge origin/main` (1d0564ff, merge 952e3988, clean) + comment-only fix a627281b (current head).

## B list (proven)
None. Every checked item passes or is a U/C below.

## Scope traced
- eas.json (no `submit` section ever existed; store builds use build profile `clinic`, which extends `production`), app.json (`ios.buildNumber` "6", already uploaded), app.config.js, scripts/validate-app-config.js, scripts/eas-profile.js, CI workflow.
- Expo docs: submit profiles can `extends` another profile; `--auto-submit` uses the submit profile with the same name as the build profile (https://docs.expo.dev/build/automate-submissions/, https://docs.expo.dev/submit/eas-json/); `ascAppId` is the App Store Connect Apple ID and skips app lookup (https://docs.expo.dev/eas/json/).
- Permissions vs real use (app.json Info.plist + config plugins, which override Info.plist at prebuild):
  - Camera / photo library: no picker or camera module; strings serve Crisp support chat attachments and the share-sheet Save Image (progress card, invite QR). PASS (pinned by src/config/__tests__/storeReviewPermissions.test.js).
  - HealthKit: read-only request (src/services/health/healthkit/healthKitClient.ts:318 `write: []`), entitlement without health records; Apple Health named in UI (You > Connected devices, src/screens/client/MoreScreen.tsx:259) with a pre-prompt disclosure (src/screens/client/wearables/ConnectProviderSheet.tsx:689). PASS. Share string names the coach only; Roman uses the same data only after the separate optional AI consent (box 2, names Anthropic) — C below.
  - Notifications: asked only on tap (src/components/home/PushPermissionCard.tsx:80, day-one Notifications screen); App.tsx:154 registers without prompting. PASS.
  - Tracking: no ATT, IDFA or ad SDK; PostHog without session replay (src/lib/analytics.ts:69). No NSUserTrackingUsageDescription needed. PASS.
  - Face ID: used only for opt-in app unlock (src/components/BiometricUnlockSetting.tsx "Require Face ID, Touch ID, or your passcode when reopening the app"); string claimed "confirm sensitive actions" — U-1, fixed.
  - Calendar (expo-calendar write-only, system editor), microphone (voice notes off in every store profile), motion (unused) — PASS / C.
- ITSAppUsesNonExemptEncryption false: correct (HTTPS via OS, Keychain via SecureStore, expo-crypto digests only, SQLite without SQLCipher). PASS.
- Account deletion: client You > Settings > Delete account (src/screens/client/SettingsScreen.tsx ~257); coach Settings > Privacy & Data > Delete my account (src/screens/coach/settings/DangerZone.tsx); src/screens/settings/DeleteAccountScreen.tsx re-auths, sends the Apple authorization code for token revocation; backend routes live, 14-day default grace (DELETION_GRACE_DAYS), nightly finalize. Apple revocation keys set on Fly 10-06 10:01 (SoT). PASS.
- Sign in with Apple wherever Google is offered: Google only on LoginScreen (~545) and CreateAccountScreen (~1428); AppleSignInButton rendered on iOS right after it on both, not gated by policy. Production GET /api/auth/signup-policy 16:15: providers email, google, apple; apple_signin_enabled true. PASS.

## U list
- U-1 (fixed in PR): the Face ID permission prompt says Face ID confirms sensitive actions, but it only unlocks the app. Fix: NSFaceIDUsageDescription and the expo-local-authentication `faceIDPermission` both read "The Growth Project uses Face ID only to unlock the app, when you turn on Biometric unlock in Settings." (pinned in storeReviewPermissions.test.js).

## C one-liners
- C: NSHealthUpdateUsageDescription describes writing workouts but the app requests no write types, so it is never shown; kept because react-native-health links the write APIs (ITMS-90683).
- C: NSMotionUsageDescription and the microphone string are never shown in this build; kept (harmless, avoids upload purpose-string warnings).
- C: HealthKit share string names only the coach; Roman reads the same data only with the separate optional AI consent that names Anthropic; owner may add Roman to the string later (needs the same change in ConnectProviderSheet copy).

## PRs
- growth-project-mobile#528 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/528 `chore(release): add App Store submit profiles and iOS build 7` @ a627281ba6e113653589c8c48c1292164dbb5b32 (16:51; merged main 1d0564ff), +107/-9 (116 lines, 8 files; adds src/config/purchaseSurfaces.ts:41 comment-only build 7 + scripts/purchase-policy.sha256 re-pin like 0897487c). Earlier head b4988f4efb3c572b99ae58e80c6a65094ffef9a0, +105/-7 (6 files: eas.json, app.json, README.md, scripts/__tests__/easSubmitProfile.test.js (new), scripts/__tests__/validateAppConfigUpdates.test.js, src/config/__tests__/storeReviewPermissions.test.js). CI at b4988f4e: Typecheck, lint, test FAILED (1 of 9272: src/config/__tests__/purchaseSurfaces.test.ts:92 wants the purchaseSurfaces.ts comment to say `ios.buildNumber is 7`), fixed in a627281b. CI at a627281b: Typecheck, lint, test success; CodeQL success; mergeable clean. READY comment 16:57 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/528#issuecomment-6049257818 (Tier T2). Verdicts: pending (Opus) / pending (Sol); no REQUEST CHANGES at this head.
- Failing-first at main a1be6fb2: easSubmitProfile 3 failed / 1 passed; storeReviewPermissions 1 failed (Face ID wording); validateAppConfigUpdates 1 failed (Expected "7", Received "6"). At head: 4/4, 11/11, 38/38 pass; validate-app-config OK (2 existing warnings).
- What it does: `submit.production.ios.ascAppId` 6765847915 (no credentials; ASC key, signing, push key stay in Expo), `submit.clinic` extends production (so `eas build -p ios --profile clinic --auto-submit` uses it); `ios.buildNumber` 6 -> 7; Face ID string (U-1).

## App Review notes draft (paste into App Store Connect > App Review Information > Notes)

The Growth Project is a 1:1 personal training app. A coach invites their own clients, writes each client's training and nutrition plan, messages them and books sessions with them. Clients follow that plan, log food and workouts, and can connect Apple Health.

Demo accounts (sign in on the Welcome screen > Sign in, email and password):
- Coach: [COACH DEMO EMAIL] / [PASSWORD] — owner to fill
- Client: [CLIENT DEMO EMAIL] / [PASSWORD] — owner to fill. This client belongs to the demo coach and already has an active 1:1 coaching package, so every client feature is open without a purchase.

Where things are
- Client tabs: Home, Train (assigned workout), Food (food logging), Calendar (book a session with the coach), You, Community. Roman, the AI coach, is under You > Roman. Apple Health is under You > Connected devices.
- Coach tabs: Overview, Clients (open the demo client to see their logs), Programs, Messages, Community, Settings.

Payments (Guideline 3.1.3(d))
- Clients pay their own coach for real-time 1:1 personal training delivered by that coach to that one client. The only purchase screen is You > Membership > View coaching plans ("1:1 coaching with" the coach's name); payment goes through the Stripe payment sheet to the coach.
- No digital content, app features or subscriptions to the app are sold in the iOS app. Screens that need coaching show "Your coach manages your access" with a Message your coach button and no price. Coach AI credit top-ups are not sold in the iOS app ("Managed on the web", no link).
- Payments are live, so a purchase is not needed to review; the demo client already has access.

Account deletion (5.1.1(v)): client You > Settings > Delete account; coach Settings > Privacy & Data > Delete my account. The screen confirms with the password (or Apple / Google) and shows the date the deletion completes.

Sign in with Apple (4.8): offered on Sign in and Create account wherever Google sign-in is offered.

Health data: Apple Health is optional and read-only (the app does not write to Apple Health). It shows the client's own progress to the client and their coach. With the client's optional AI consent, Roman also uses it to answer the client's questions. It is never used for advertising and never sold.

AI (5.1.2(i)): Roman is powered by Anthropic. During onboarding the client sees an optional, unticked box allowing Roman and the coach's AI tools to use their information, processed by Anthropic; it can be changed any time in You > Settings > Roman and AI. Nothing is sent to Anthropic for Roman without that permission.

User content (1.2): Community asks members to accept the community terms first. Every post, comment and message has a More menu with Report and Block. Coaches review reports from Messages > Community reports.

Permissions: notifications are asked only when the user taps Turn on; Face ID only when the user turns on Biometric unlock; calendar only when saving a session; camera and photos only for support chat attachments and Save Image. No tracking, no ATT prompt. iPhone only.

## Not fixed (needs operator)
- Owner: fill the two demo accounts in the review notes above (coach + client with an active package, one workout, one meal plan) in App Store Connect only, never in the repo.

## HANDOFF
- 16:58 Branch agent129/ios-release-129, PR m#528, head a627281ba6e113653589c8c48c1292164dbb5b32 (8 files, +107/-9), nothing unpushed; CI green; READY FOR AUDIT posted 16:57 (T2).
- Done: submit profiles (no credentials), build 7, Face ID string (U-1), purchase-gate comment + lock re-pin, review notes draft in this report; B=0.
- Left: lens verdicts (none yet, no REQUEST CHANGES); merge by the operator before the 23:00 build; owner fills the demo accounts in App Store Connect.
