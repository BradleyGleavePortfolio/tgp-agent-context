# EW3 — Full Android Parity Audit (iOS-only delta vs Android)

**Type:** Audit (enumeration + prioritization). **Not** a spec — no fixes are designed here.
**Date:** 2026-06-09
**Auditor scope:** `BradleyGleavePortfolio/growth-project-mobile` (mobile app) + `growth-project-backend` (push transport only).
**Goal:** Produce the delta list of iOS-only features/behaviors so the operator knows what catch-up work Android needs before a sale-ready Play build.

---

## Section 1 — Audit methodology

### 1.1 What I had access to

| Repo | Path | Accessed? | Notes |
| --- | --- | --- | --- |
| Mobile app | `growth-project-mobile` → cloned to `/tmp/mobile-app` | **Yes** | Full source. This is the real audit surface. The earlier assumption that the mobile repo might be inaccessible did **not** hold — it cloned cleanly via `gh repo clone`. |
| Backend | `growth-project-backend` → `/tmp/backend-main` | Yes (push transport only) | Used solely to confirm how push is delivered (Expo Push API), which determines the Android FCM dependency. |

This means the audit is **code-grounded, not checklist-only**. Confidence is correspondingly higher than a recipe-only deliverable would have been.

### 1.2 What I scanned (exact greps live in Section 5)

- **Platform branches:** every `Platform.OS === 'ios'` (42 hits) and `Platform.OS === 'android'` (13 hits), `Platform.select`, plus `.ios.*` / `.android.*` file pairs.
- **iOS-only / dual-platform Expo modules:** `expo-apple-authentication`, `expo-local-authentication`, `expo-haptics`, `react-native-health` (HealthKit) vs `react-native-health-connect`, `@stripe/stripe-react-native`, `expo-speech` / `expo-av` / `expo-audio`.
- **Push:** `expo-notifications` wiring, Android notification channels, iOS categories, FCM config (`google-services.json`, `googleServicesFile`), backend push transport.
- **UI conventions:** `presentation: 'modal'`, `BackHandler`, `StatusBar`, `SafeAreaView` / `useSafeAreaInsets`, `DateTimePicker` display modes, Toast/Snackbar.
- **Perf/storage:** MMKV vs AsyncStorage, image caching, background fetch / WorkManager.
- **Named Dynasia features:** Coach Brief, first-payment wow, voice logging "Hey Roman", community push, biometric auth.

### 1.3 Confidence level

| Area | Confidence | Why |
| --- | --- | --- |
| Push / FCM gap | **High** | Directly grep-verified: no `google-services.json`, no `googleServicesFile` in `app.json`, and backend delivers via Expo Push (`expo-server-sdk`) which needs FCM credentials for Android relay. |
| Apple/Google sign-in parity | **High** | Both `expo-apple-authentication` and Supabase-brokered Google OAuth present; Apple button correctly returns `null` on Android. |
| Health Connect parity | **High** | `react-native-health-connect` present, Android health permissions fully declared in `app.json`. |
| Biometric / storage / haptics | **High** | All use cross-platform Expo modules with graceful Android fallbacks confirmed in source. |
| Payments policy risk | **Medium** | Code is Stripe-WebView (cross-platform); but Play Store **digital-goods billing policy** implications are a business/legal call I cannot fully resolve from code. |
| UI polish (modals, pickers, edge-to-edge) | **Medium** | Behaviors inferred from React Navigation / Expo defaults; not confirmed on a physical Android device. No device run was performed. |
| Voice logging "Hey Roman" | **Medium** | No `expo-speech`/audio capture code exists in this repo at all — feature is not implemented client-side here. Cannot confirm whether Android tap-to-talk parity is met because neither platform's voice path lives in this codebase. |

**Single biggest limitation:** no audit was run on a physical Android device or emulator. All runtime-behavior findings (modal look, edge-to-edge insets, picker style, hardware back) are *static-analysis inferences* and should be confirmed with one smoke session on a real Android handset before sign-off.

---

## Section 2 — Severity-classified delta list

Severity legend: **P0** breaks the app on Android · **P1** core feature missing/broken on Android · **P2** works but sub-par · **P3** polish gap.
Effort: **S** ≤0.5d · **M** ~1–2d · **L** ~3–5d · **XL** >1wk or blocked on external account setup.

| # | Surface | iOS state | Android state | Sev | Effort | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Push delivery (FCM credentials)** | APNs relayed via Expo Push; tokens issue & deliver | No `google-services.json`, no `googleServicesFile` in `app.json`. Backend sends via `expo-server-sdk` which **requires FCM credentials on the Expo project** to relay to Android. Without it, `getExpoPushTokenAsync()` fails or tokens never deliver. | **P1** | **XL** | The single highest-impact gap. Blocked on a Firebase project + FCM V1 service-account JSON uploaded to EAS, plus `android.googleServicesFile` wired in `app.json`. Until done, **all** Android push is dead. |
| 2 | **Android hardware back button** | iOS swipe-back handled natively by `native-stack` | **Zero `BackHandler` usage** in the codebase. React Navigation handles default stack-pop, but custom full-screen `<Modal>` overlays (e.g. `MessageActionSheet`, `QuantityPickerModal`, branded checkout) rely on `onRequestClose` — needs device verification that back doesn't dismiss the app or strand the user mid-checkout. | **P0** (potential) | **M** | Checkout screens set `gestureEnabled: false` but there is no explicit hardware-back interception. Verify on device; if a back press during `BrandedCheckoutWebView` exits the app or skips the return handler, it is a P0 crash/UX break. |
| 3 | **Android 15 edge-to-edge** | iOS notch handled via `useSafeAreaInsets` | No `edgeToEdge` / `androidNavigationBar` config in `app.json`. Expo SDK 56 / Android 15 (`targetSdk 35`) **enforces edge-to-edge**; without explicit handling, content can render under the system bars on Android 15 devices. | **P1** | **M** | Status bar background is set imperatively in `App.tsx` for Android, but nav-bar / gesture-inset handling for edge-to-edge is not declared. Verify on an Android 15 device. |
| 4 | **App Store / Play store-listing URL** | `appStoreUrl` set | `playStoreUrl: null` in `app.json → expo.extra.storeListings`; `validate:release` hard-fails on null. | **P1** | S | Cannot ship a release build until the Play listing is published and the URL is filled. Blocked on a Play Console listing existing. |
| 5 | **versionCode hygiene** | `buildNumber` managed | `app.json` shows `versionCode: 4`, but `PLAY_INTERNAL_TESTING_PACKAGE.md` says baseline should be `2`. `appVersionSource: "local"` means manual bumps — drift risk. | **P2** | S | Reconcile the documented baseline vs actual before first upload to avoid "number already used" rejections. |
| 6 | **App Links verification (`assetlinks.json`)** | iOS AASA path documented | Android `autoVerify: true` intent filters declared, but `assetlinks.json` with the Play App Signing SHA-256 is not yet hosted (templates only, in `docs/well-known/`). | **P2** | M | Deep links open a chooser instead of the app silently until hosted. Blocked on first AAB upload (to get the signing fingerprint). |
| 7 | **Modal presentation style** | `presentation: 'modal'` → iOS card sheet | Same flag → Android renders full-screen (no material bottom-sheet). 4 screens affected (`ExerciseDetail`, `PackageCheckout`, `BrandedCheckoutWebView`, coach content modal). | **P2** | M | Functional, visually non-native on Android. Material bottom-sheet would be the parity target. |
| 8 | **Date/time picker mode** | `display="inline"` (iOS wheel/inline calendar) | `@react-native-community/datetimepicker` ignores `inline` on Android and shows the stock calendar/clock dialog. Used in `PushConfirmModal`, `PushPromptSheet`. | **P3** | S | Works; just visually divergent. Confirm the Android dialog returns the same value shape. |
| 9 | **Haptic feedback fidelity** | iOS `NotificationFeedbackType.Success/Warning/Error` + impact styles fire richly | `expo-haptics` maps these to coarser Android vibration; `haptics.service.ts` safely no-ops on failure. | **P3** | S | Tune Android vibration patterns per channel if polish budget allows. No functional break. |
| 10 | **Sign In with Apple** | `expo-apple-authentication` native button | `AppleSignInButton` returns `null` on Android (correct). Google sign-in (Supabase-brokered) is the Android primary path. | **OK / P3** | — | Parity is effectively met. Confirm the Google button is visually prominent on Android login/create-account where the Apple button is hidden. |
| 11 | **HealthKit vs Health Connect** | `react-native-health` (HealthKit) | `react-native-health-connect` present; full Android health read-permission set declared in `app.json`; on-device connect routes per-platform (`onDeviceConnect.ts`). Samsung Health client also present. | **OK** | — | Strong parity. Verify Health Connect availability prompt on devices without the Health Connect app installed (older Android). |
| 12 | **Biometric auth (Face ID / BiometricPrompt)** | Face ID via `expo-local-authentication` | Same module → Android BiometricPrompt; `USE_BIOMETRIC` / `USE_FINGERPRINT` perms declared; PIN fallback exists in `biometric-lock.service.ts`. | **OK** | — | Cross-platform by construction. |
| 13 | **MMKV vs AsyncStorage** | MMKV when dev-client available | `react-native-mmkv` is **not** in `package.json`; `storage/mmkv.ts` runtime-detects and falls back to an AsyncStorage shim everywhere today. Same behavior both platforms. | **P3** | S | No Android-specific break; but the "MMKV" naming is misleading since MMKV never loads. Performance parity is fine (both on AsyncStorage). |
| 14 | **In-app payments rails** | Stripe Checkout via WebView; no StoreKit/IAP | Identical Stripe-WebView path; no Google Play Billing. `@stripe/stripe-react-native` is a dep but checkout is WebView-based. | **P1 (policy)** | L | Code parity is fine. **Risk:** Google Play (like Apple) restricts selling digital goods/coaching subscriptions outside its billing system. Screen docstrings cite an "Apple B2B exemption" — the Play equivalent must be confirmed or the listing may be rejected. Business/legal, not code. |
| 15 | **Background fetch / sync** | No `expo-background-fetch` / `TaskManager` found | None on Android either. Sync appears foreground/React-Query driven. | **OK** | — | No iOS-only background framework to port; no WorkManager gap because neither platform uses background tasks. |
| 16 | **Image caching** | RN `Image` defaults | No `expo-image` / `FastImage`; both platforms use RN default caching. | **P3** | S | Symmetric. Consider `expo-image` later for both, not an Android-specific delta. |
| 17 | **Foreground notification banner inset** | `paddingTop: 44` (notch) | `paddingTop: 12` branch present in `ForegroundNotificationBanner.tsx`; `OfflineBanner` uses `StatusBar.currentHeight`. | **OK / P3** | S | Android inset handled, but verify against edge-to-edge (#3). |
| 18 | **Message long-press action sheet** | iOS path returns `null` (native action sheet used elsewhere) | Android has a **dedicated** custom `<Modal>` action sheet in `MessageActionSheet.tsx`. | **OK** | — | This is a case where Android has its own implementation — parity achieved, opposite of the usual gap. |
| 19 | **Coach Brief notifications (R28 gate)** | Push permission gate fires; `CoachBriefScreen` + backend scheduler present | Same client screen; backend `coach-brief.scheduler.ts` writes `last_push_date`. **But** delivery depends on FCM (#1). | **P1 (depends on #1)** | — | Brief logic is platform-neutral; the push won't fire on Android until FCM is wired. Inherits #1. |
| 20 | **Community v1-x push (APNs + FCM)** | Delivered via Expo Push (relays to APNs) | Same backend path; relies on FCM relay (#1). Community surfaces (`PrivateCommunityHubScreen`, `CommunityScreen`) render fine on Android. | **P1 (depends on #1)** | — | UI parity OK; push parity blocked on #1. |
| 21 | **Voice logging "Hey Roman" (CC32)** | Per operator: iOS may have richer voice path | **No `expo-speech` / audio-capture code exists in this repo on either platform.** Community voice notes are explicitly feature-flagged OFF (`communityVoiceNotes`). | **P2 (unknown)** | L | Cannot confirm Android = tap-to-talk parity because the client voice path is not in this codebase. Flag as open question — likely lives in a native module or a different branch/repo. |

---

## Section 3 — Top 5 catch-up PRs (rank-ordered)

### PR 1 — Wire FCM so Android push works at all
- **Scope:** Create a Firebase project, generate FCM V1 service-account JSON, upload to the Expo project (EAS credentials), add `android.googleServicesFile` + `google-services.json` to the build, re-verify `getExpoPushTokenAsync()` issues a token and the backend Expo Push round-trip delivers to an Android device.
- **Effort:** XL (mostly external setup + one device verification).
- **Prerequisite:** Firebase/Google Cloud project owner access; EAS account access. **Unblocks #19 (Coach Brief) and #20 (Community push) automatically.**

### PR 2 — Android 15 edge-to-edge + system-bar insets
- **Scope:** Declare edge-to-edge handling in `app.json` (and `androidNavigationBar`), audit every full-screen surface for `useSafeAreaInsets` coverage of the bottom nav bar, confirm the `ForegroundNotificationBanner` / `OfflineBanner` insets survive edge-to-edge.
- **Effort:** M.
- **Prerequisite:** An Android 15 device or emulator for verification.

### PR 3 — Hardware-back hardening for modal/checkout flows
- **Scope:** Add explicit `BackHandler` handling (or confirm `onRequestClose` coverage) for custom `<Modal>` overlays and the `gestureEnabled: false` checkout screens, so a back press never exits the app mid-checkout or strands the user.
- **Effort:** M.
- **Prerequisite:** Device smoke session; depends on the checkout return-handler being well understood.

### PR 4 — Play listing + release-gate unblock
- **Scope:** Publish the Play Console listing, fill `playStoreUrl` in `app.json`, reconcile `versionCode` baseline (4 vs documented 2), upload first AAB to get the Play App Signing SHA-256, then host `assetlinks.json` for App Links verification.
- **Effort:** L (sequential, gated on first upload).
- **Prerequisite:** Google Play developer account; first production AAB build; marketing site able to host `.well-known/assetlinks.json`.

### PR 5 — Android payments policy confirmation (Stripe vs Play Billing)
- **Scope:** Confirm whether the Stripe-WebView coaching/credit-pack purchases qualify for a Play "physical goods / out-of-app" exemption (analogous to the cited Apple B2B exemption), or whether Google Play Billing must be integrated for digital purchases. Document the decision; only then size any billing-integration work.
- **Effort:** L (decision-first; integration is a follow-on if required).
- **Prerequisite:** Legal/business ruling on Play digital-goods policy for the coaching SKU.

---

## Section 4 — Open questions for the operator

- **Where does "Hey Roman" voice logging live?** No `expo-speech` / audio-capture code exists in this mobile repo on either platform. Is the voice path in a native module, a different branch, or a separate repo? Without it I can't confirm the operator-stated "Android = tap-to-talk only, no wake-word" parity.
- **FCM project ownership:** Who owns the Firebase/Google Cloud project, and is there an existing FCM sender or must one be created from scratch?
- **Play digital-goods policy:** Does the Stripe-WebView coaching purchase flow have a confirmed Play Store exemption, or is Google Play Billing required? This is the difference between PR 5 being a 1-day doc task and a multi-week integration.
- **Android 15 target:** Is the production target `targetSdk 35`? If so, edge-to-edge (#3) is mandatory, not optional.
- **versionCode source of truth:** `app.json` says `4`; `PLAY_INTERNAL_TESTING_PACKAGE.md` says baseline `2`. Which is correct for the first real upload?
- **Device matrix:** Which Android OEMs/versions must pass smoke (Samsung One UI, Pixel, low-end)? Several findings (#2, #3, #7, #11) need on-device confirmation and the OEM set changes the risk profile (e.g. Samsung Health, MMKV OEM edge cases).
- **Health Connect fallback:** What is the desired UX on Android devices without the Health Connect app installed (older Android 13–)?

---

## Section 5 — Tools used + reproducibility

**Environment:** GitHub access via `gh` with `api_credentials=["github"]`. Model: Opus 4.8.

```bash
# 1. Confirm the mobile repo exists and clone it
gh repo list BradleyGleavePortfolio --limit 30
gh repo clone BradleyGleavePortfolio/growth-project-mobile /tmp/mobile-app
cd /tmp/mobile-app

# 2. Dependencies + platform config
python3 -c "import json;print('\n'.join(sorted(json.load(open('package.json'))['dependencies'])))"
sed -n '1,250p' app.json          # ios/android blocks, plugins, permissions, storeListings
cat eas.json

# 3. iOS-only / dual-platform code paths
find src -name "*.ios.ts" -o -name "*.ios.tsx"        # platform-split files (none found)
find src -name "*.android.ts" -o -name "*.android.tsx"
grep -rn "Platform.OS === 'ios'" src --include=*.ts --include=*.tsx      # 42 hits
grep -rn "Platform.OS === 'android'" src --include=*.ts --include=*.tsx  # 13 hits
grep -rn "Platform.select" src --include=*.ts --include=*.tsx

# 4. iOS-only / dual-platform modules
grep -rln "expo-apple-authentication\|AppleAuthentication" src
grep -rln "expo-local-authentication\|LocalAuthentication\|authenticateAsync" src
grep -rn  "expo-haptics\|Haptics\." src --include=*.ts --include=*.tsx
grep -rln "react-native-health\|react-native-health-connect" src package.json
grep -rn  "StoreKit\|react-native-iap\|ApplePay\|GooglePay\|@stripe/stripe-react-native\|PaymentSheet" src
grep -rn  "expo-speech\|expo-av\|expo-audio\|SpeechRecognition\|wake.?word" src

# 5. Push / FCM
grep -rn "googleServicesFile\|google-services\|getDevicePushTokenAsync\|FCM" . --include=*.json --include=*.ts --include=*.tsx | grep -v node_modules   # EMPTY = no FCM
cat src/notifications/push-channels.ts
cat src/services/pushNotifications.ts
# Backend push transport (confirms Expo Push relay → needs FCM for Android):
grep -n "Expo\|expo_push_token\|sendPushNotificationsAsync" /tmp/backend-main/src/notifications/notifications.service.ts

# 6. UI conventions
grep -rln "BackHandler" src                 # EMPTY = hardware back not explicitly handled
grep -rn  "presentation:" src --include=*.tsx
grep -rn  "StatusBar" src --include=*.tsx
grep -rln "SafeAreaView\|useSafeAreaInsets" src
grep -rn  "edgeToEdge\|androidNavigationBar" . --include=*.json --include=*.md | grep -v node_modules
grep -rln "DateTimePicker" src ; grep -n "display=" src/screens/coach/payments/contents/PushConfirmModal.tsx

# 7. Storage / perf
cat src/storage/mmkv.ts ; grep -i mmkv package.json    # mmkv NOT in deps → AsyncStorage shim
grep -rn "expo-image\|FastImage\|cachePolicy" src
grep -rn "expo-background\|BackgroundFetch\|TaskManager\|WorkManager" src docs

# 8. Named features
grep -rln "CoachBrief\|first.?payment\|wow\|communityVoiceNotes" src
ls docs/   # PLAY_STORE_READINESS.md, PLAY_INTERNAL_TESTING_PACKAGE.md, push-taxonomy.md, well-known/
```

**Re-run note:** This audit is reproducible from a clean clone in ~10 minutes. The only finding requiring the backend repo is the FCM-dependency confirmation (Section 2, #1); everything else is derivable from `growth-project-mobile` alone. No device run was performed — re-run the on-device items (#2, #3, #7, #11) before sign-off.

---

### Sources / repositories referenced

- Mobile app: `https://github.com/BradleyGleavePortfolio/growth-project-mobile` (cloned `/tmp/mobile-app`)
- Backend: `https://github.com/BradleyGleavePortfolio/growth-project-backend` (`/tmp/backend-main`, push transport only)
- In-repo references: `app.json`, `eas.json`, `docs/PLAY_STORE_READINESS.md`, `docs/PLAY_INTERNAL_TESTING_PACKAGE.md`, `docs/push-taxonomy.md`, `src/notifications/push-channels.ts`, `src/services/pushNotifications.ts`, `src/storage/mmkv.ts`, `src/security/biometric-lock.service.ts`.
