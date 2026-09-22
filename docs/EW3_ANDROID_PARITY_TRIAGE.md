# EW3 — Android Parity Triage

**Date:** 2026-06-09
**Reviewed mobile branch:** `main @ 5adba07` (post PR #229 "v1-5 mobile community" merge; mergeCommit `5adba0798ffa07c81682976de478902506f6866e`, merged 2026-06-09T23:01:42Z). Inspection performed against the worktree `feature/community-v1-mobile-client` (local HEAD `0672fb2`), which contains the PR #229 community code that landed on `main`.
**Repo inspected:** `BradleyGleavePortfolio/growth-project-mobile` (Expo **managed/CNG** workflow — no committed `ios/` or `android/` native directories; native projects are generated at `eas build` time from `app.json` + config plugins).
**Total gaps identified:** 11
**Severity breakdown:** P0: 0, P1: 3, P2: 5, P3: 3

> **Headline:** The app is in materially better Android shape than a typical iOS-first RN codebase. Every native-capability surface inspected (push channels, HealthKit↔Health Connect, biometrics, share sheet, Google/Apple auth, deep-link parser) already has an explicit, intentional Android branch. **No P0 (core-flow-breaking) Android gaps were found.** The remaining gaps are concentrated in the Android **system-bars / edge-to-edge / safe-area** layer (a direct consequence of the Expo SDK 56 edge-to-edge default) plus a handful of polish inconsistencies. Several gaps cannot be fully confirmed without an on-device Android run and are flagged `UNCONFIRMED — needs device test` with severity downgraded one notch per the brief.

---

## Severity definitions
- **P0:** Feature broken or missing on Android, blocks a core flow (login, payment, push, content view).
- **P1:** Feature works but visibly worse on Android (jank, wrong layout, missing affordance).
- **P2:** Feature works but has a subtle parity gap (haptic intensity, animation timing, magic-number layout).
- **P3:** Polish / consistency.

---

## Gaps table

| ID | Severity | Area | File:line | iOS behaviour | Android behaviour | Recommended fix | Est. effort |
|---|---|---|---|---|---|---|---|
| EW3-001 | **P1** | Status-bar background under edge-to-edge | `App.tsx:10-11` | Status-bar background derives from view hierarchy; bone tint renders correctly | SDK 56 forces edge-to-edge; `RNStatusBar.setBackgroundColor()` is deprecated/no-op, so the intended bone (`#F5EFE4`) band behind the status bar is not painted | Drive the system-bar appearance via the SDK 56 edge-to-edge model (`expo-status-bar` `style` + a safe-area top inset painted by the app, or `react-native-edge-to-edge`/`SystemBars`); stop relying on `setBackgroundColor` | M |
| EW3-002 | **P1** | Android App Links not yet auto-verifiable | `app.json:android.intentFilters` (`autoVerify:true`), `PLAY_STORE_READINESS.md §6` | Universal Links require `apple-app-site-association` (template only, not hosted) | `autoVerify:true` is declared for `app.trygrowthproject.com`, but `https://app.trygrowthproject.com/.well-known/assetlinks.json` is not yet hosted with the Play App Signing SHA-256, so `https://` links open the browser/chooser instead of the app | Host `assetlinks.json` (Play App Signing SHA-256) before first production release; `tgp://` custom-scheme links already work | S (config/ops, not code) |
| EW3-003 | **P1** | Foreground push banner top inset | `src/components/ForegroundNotificationBanner.tsx:182` | `paddingTop: 44` clears the iOS status bar/notch | `paddingTop: 12` is a fixed magic number; under edge-to-edge the banner can render under the Android status bar on tall/notched devices | Replace fixed paddings with `useSafeAreaInsets().top` so the in-app push banner clears the status bar on every Android device | S |
| EW3-004 | **P2** | KeyboardAvoidingView behavior inconsistency on Android | `src/screens/auth/LoginScreen.tsx:193`, `src/screens/auth/CreateAccountScreen.tsx:346`, `src/components/ExerciseLogModal.tsx:207` | `behavior="padding"` | These 3 surfaces use `behavior="height"` on Android while ~23 other screens use `undefined`; `"height"` is the most fragile Android mode (jumpy/clipped layout, known RN bug) | Standardize Android on `undefined` (or `"height"` everywhere) — the login/create-account screens are the highest-traffic and should match the majority pattern | S |
| EW3-005 | **P2** | OfflineBanner relies on `StatusBar.currentHeight` | `src/components/OfflineBanner.tsx:35` | iOS top inset handled by root SafeAreaView | `paddingTop: (StatusBar.currentHeight||0)+6` — under edge-to-edge `StatusBar.currentHeight` can return `0`/stale, so the offline banner can sit under the status bar. `UNCONFIRMED — needs device test` (downgraded from P1) | Use `useSafeAreaInsets().top` instead of `StatusBar.currentHeight` | S |
| EW3-006 | **P2** | Hardcoded Android header top padding | `src/screens/client/PlanScreen.tsx:522` | `paddingTop: 20` | `paddingTop: 50` is a fixed magic number that approximates the status bar; will be wrong on punch-hole / large-notch / small Android devices. `UNCONFIRMED — needs device test` (downgraded from P1) | Replace the `Platform.OS==='android' ? 50 : 20` magic numbers with safe-area-inset-driven padding | S |
| EW3-007 | **P2** | No Android navigation-bar theming | `app.json` (no `androidNavigationBar`), `App.tsx` | n/a (no Android nav bar) | The bottom system navigation bar is left at OS default; with edge-to-edge enabled and a bone (`#F5EFE4`) app background, contrast/scrim of the 3-button or gesture bar is unmanaged. `UNCONFIRMED — needs device test` (downgraded from P1) | Add `expo-navigation-bar` (or `androidNavigationBar` config) to set nav-bar style/contrast to match the bone theme | S–M |
| EW3-008 | **P2** | Biometric prompt copy/behavior is iOS-tuned | `app.json` (`NSFaceIDUsageDescription` only), `src/security/biometric-lock.service.ts:196-198`, `src/hooks/useBiometricGate.ts:64-68` | FaceID usage string + native FaceID/TouchID prompt | `disableDeviceFallback:false` correctly enables Android device-credential fallback, but there is no Android-specific subtitle/`fallbackLabel`, and the on-screen copy ("Confirm your identity"/"Unlock The Growth Project") is the only Android affordance. BiometricPrompt UX (subtitle, negative-button) differs from iOS | Provide Android `cancelLabel`/`fallbackLabel` and confirm BiometricPrompt subtitle copy; verify on an API-28+ device with enrolled fingerprint/face | S |
| EW3-009 | **P3** | Chart label font fallback | `src/ui/charts/TgpLineChart.tsx:282`, `TgpBarChart.tsx:217`, `TgpAreaChart.tsx:257` | `fontFamily:'System'` (San Francisco) | `fontFamily: undefined` → falls back to Roboto rather than the loaded Inter family used elsewhere; chart tick/tooltip labels are visually off-brand vs the rest of the app on Android | Set the Android branch to the loaded `Inter_400Regular` family (or a shared token) instead of `undefined` | S |
| EW3-010 | **P3** | Vestigial Google Sign-In native shim | `src/types/shims/google-signin.d.ts`, `package.json` (no `@react-native-google-signin/google-signin` dep) | Web-based Supabase OAuth (`src/utils/googleAuth.ts`) — works on both platforms | A TypeScript shim for a native Google Sign-In SDK exists but the package is not installed and is unused (auth goes through `expo-auth-session` + `WebBrowser`). Harmless but misleading; no Android Play Services dependency exists | Delete the unused shim, or add a code comment that it is intentionally vestigial (already partly documented in `PLAY_STORE_READINESS.md §7`) | XS |
| EW3-011 | **P3** | Android `versionCode` is manual/local | `app.json:android.versionCode` (4), `eas.json`, `PLAY_STORE_READINESS.md §1` | iOS `buildNumber` also manual | `appVersionSource` is `local`, so the Android `versionCode` must be bumped by hand each release; a missed bump silently blocks the Play upload (Sentry release id in `src/services/sentry.ts:25-31` also derives from it) | Switch EAS to `appVersionSource:"remote"` for Android (and iOS), or add a release-checklist gate; low risk, ops-level | XS |

---

## Per-area deep dive

### EW3-001: Status-bar background under edge-to-edge (P1)
- **Reproduction:** Cold-start the app on an Android device/emulator (API 30+). The intended bone (`#F5EFE4`) band behind the status bar is expected; instead the status bar background is transparent/OS-default because edge-to-edge is on.
- **Root cause:** `App.tsx:10-11` sets the Android status-bar background imperatively: `RNStatusBar.setBackgroundColor('#F5EFE4', false)`. On Expo SDK 56 / RN 0.85, edge-to-edge display is the default on Android (the transitive dep `react-native-is-edge-to-edge@1.3.1` is present in `package-lock.json`), and under edge-to-edge `Window.setStatusBarColor` / RN's `StatusBar.setBackgroundColor` is deprecated and effectively a no-op. The code comment in `App.tsx` itself acknowledges SDK 56 dropped the typed `backgroundColor` prop on `expo-status-bar`.
- **Fix sketch:** Adopt the edge-to-edge model: keep `expo-status-bar` `style="dark"` for icon contrast, and paint the bone band yourself via a top `SafeAreaView`/inset-colored view, or use `react-native-edge-to-edge`'s `SystemBars`. Remove the `setBackgroundColor` call.
- **Test plan:** Capture the welcome + home screens on a notched Android device; confirm the status-bar region renders bone and icons are dark. Compare to iOS.
- **Refs:** [Android Developers — Display content edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge); [Expo — Edge-to-Edge display, now streamlined for Android](https://expo.dev/blog/edge-to-edge-display-now-streamlined-for-android); [React Native — StatusBar](https://reactnative.dev/docs/statusbar).

### EW3-002: Android App Links not yet auto-verifiable (P1)
- **Reproduction:** On a fresh Android install, open `https://app.trygrowthproject.com/join/TESTCODE`. Expected: app opens directly to CreateAccount with the invite prefilled. Actual (until `assetlinks.json` is hosted): the system shows a disambiguation chooser / opens the browser, because the host cannot be verified.
- **Root cause:** `app.json` declares `autoVerify:true` for the `https` intent filters on `app.trygrowthproject.com`, but `https://app.trygrowthproject.com/.well-known/assetlinks.json` (containing the Play App Signing SHA-256 cert fingerprint) is not yet hosted. Android's auto-verification queries that file at install time; with no valid file, the link is not auto-handled. `PLAY_STORE_READINESS.md §6` and §11 document this as an outstanding pre-submission ops item. The `tgp://` custom-scheme links are unaffected and already work.
- **Fix sketch:** No app code change. Host `assetlinks.json` (template at `docs/well-known/`) with the Play App Signing SHA-256 obtained after the first AAB upload; re-install to force re-verification. This is an ops/config gap, not a code gap.
- **Test plan:** `adb shell pm get-app-links com.growthproject.app` → host shows `verified`; tap an `https://app.trygrowthproject.com/join/...` link and confirm it opens the app.
- **Refs:** [Android Developers — Verify Android App Links](https://developer.android.com/training/app-links/verify-applinks).

### EW3-003: Foreground push banner top inset (P1)
- **Reproduction:** With the app foregrounded on a notched Android device, receive a push (coach message). The in-app banner (`ForegroundNotificationBanner`) slides down from the top.
- **Root cause:** `src/components/ForegroundNotificationBanner.tsx:182` uses `paddingTop: Platform.OS === 'ios' ? 44 : 12`. The `12` is a fixed value that does not account for the Android status-bar height under edge-to-edge, so on tall/notched devices the banner content can render partially under the status bar. (The component already correctly branches shadow vs `elevation` via `Platform.select` at lines 115-124, so visual depth is fine — only the top inset is wrong.)
- **Fix sketch:** Replace the fixed paddings with `useSafeAreaInsets().top` (the component is rendered inside the SafeAreaProvider tree).
- **Test plan:** Trigger a foreground push on a Pixel-class device with a centered punch-hole; confirm the banner title clears the camera cutout.
- **Refs:** [react-native-safe-area-context](https://reactnative.dev/docs/safeareaview); [Android Developers — edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge).

### EW3-004: KeyboardAvoidingView behavior inconsistency on Android (P2)
- **Reproduction:** Focus the email/password fields on Login or Create Account on Android with a tall soft keyboard; observe layout shift vs the other ~23 keyboard-aware screens.
- **Root cause:** `LoginScreen.tsx:193`, `CreateAccountScreen.tsx:346`, and `ExerciseLogModal.tsx:207` set `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`, while every other `KeyboardAvoidingView` in the codebase uses `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. On Android, `behavior="height"` is the most fragile mode and is associated with jumpy/extra-padding layout (RN tracks active bugs against it). The inconsistency is the smell; the two auth screens are the highest-traffic surfaces.
- **Fix sketch:** Standardize the Android branch to `undefined` across these three files to match the majority pattern (or, if `height` is intentional, document why and apply it consistently).
- **Test plan:** Keyboard-open layout on Login/CreateAccount on a short and a tall Android device; verify the CTA stays visible and the form does not double-pad.
- **Refs:** [React Native — KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview); [RN issue #52596 — KeyboardAvoidingView extra bottom padding](https://github.com/facebook/react-native/issues/52596).

### EW3-005: OfflineBanner relies on `StatusBar.currentHeight` (P2 — UNCONFIRMED, needs device test)
- **Reproduction:** Toggle airplane mode on an edge-to-edge Android device; the offline banner appears at the top.
- **Root cause:** `src/components/OfflineBanner.tsx:35` computes `paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 6 : 6`. Under edge-to-edge, `StatusBar.currentHeight` can be `0` or unreliable, so the banner may render under the status bar. Cannot be confirmed without a device run → downgraded from P1 to **P2**.
- **Fix sketch:** Use `useSafeAreaInsets().top` instead of `StatusBar.currentHeight` (same fix family as EW3-003).
- **Test plan:** Trigger offline state on Android API 30/33/34 devices; confirm banner clears the status bar.
- **Refs:** [React Native — StatusBar.currentHeight](https://reactnative.dev/docs/statusbar#currentheight); [Android Developers — edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge).

### EW3-006: Hardcoded Android header top padding on PlanScreen (P2 — UNCONFIRMED, needs device test)
- **Reproduction:** Open the Plan screen on Android devices of differing notch geometry.
- **Root cause:** `src/screens/client/PlanScreen.tsx:522` uses `paddingTop: Platform.OS === 'android' ? 50 : 20`. The `50` is a magic number approximating one status-bar height; it will over/under-pad on punch-hole and small/large Android devices. Cannot confirm exact misalignment without a device → downgraded from P1 to **P2**.
- **Fix sketch:** Drive the header top padding from `useSafeAreaInsets().top` plus a fixed design gap, removing the platform magic numbers.
- **Test plan:** Render PlanScreen on a Pixel (punch-hole) and a budget device (small notch); confirm the header title baseline is consistent.
- **Refs:** [react-native-safe-area-context](https://reactnative.dev/docs/safeareaview).

### EW3-007: No Android navigation-bar theming (P2 — UNCONFIRMED, needs device test)
- **Reproduction:** Observe the bottom system navigation bar (gesture pill or 3-button) against the bone app background on Android.
- **Root cause:** There is no `androidNavigationBar` block in `app.json` and no `expo-navigation-bar` usage anywhere in `src/`. With edge-to-edge on and a light bone (`#F5EFE4`) background, the nav-bar scrim/contrast is left to the OS default, which can produce a mismatched dark strip or low-contrast gesture pill. Cannot confirm severity without a device → downgraded from P1 to **P2**.
- **Fix sketch:** Add `expo-navigation-bar` to set the nav-bar background/button style to match the bone theme (and enforce contrast), wired in `App.tsx` alongside the status-bar setup.
- **Test plan:** Capture any tabbed screen on a gesture-nav and a 3-button Android device; confirm the nav bar matches the bone theme.
- **Refs:** [Expo — Edge-to-Edge display (Android)](https://expo.dev/blog/edge-to-edge-display-now-streamlined-for-android); [Android Developers — edge-to-edge (system bar protections)](https://developer.android.com/develop/ui/views/layout/edge-to-edge).

### EW3-008: Biometric prompt copy/behavior is iOS-tuned (P2)
- **Reproduction:** Enable biometric unlock, background → foreground the app on an Android device with an enrolled fingerprint/face.
- **Root cause:** `app.json` declares only `NSFaceIDUsageDescription` (iOS); on Android the prompt is driven by `expo-local-authentication` with `disableDeviceFallback:false` (correctly enabling device-credential fallback — see `useBiometricGate.ts:64-68` and `biometric-lock.service.ts:196-198`). However, the Android BiometricPrompt UX (subtitle, negative button) is unspecified beyond `promptMessage`/`cancelLabel`, so the Android prompt is functional but copy-thin relative to the iOS FaceID experience. Module-throw and web paths fail open safely.
- **Fix sketch:** Add Android-appropriate `cancelLabel`/`fallbackLabel` and confirm BiometricPrompt subtitle; keep `disableDeviceFallback:false`.
- **Test plan:** API 28+ device with enrolled biometric: confirm prompt copy, cancel behavior, and that 5 failed attempts trigger the lockout/logout path (`onLockout`).
- **Refs:** [Android Developers — BiometricPrompt / authentication](https://developer.android.com/training/sign-in/biometric-auth); [Expo — LocalAuthentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/).

### EW3-009: Chart label font fallback (P3)
- **Reproduction:** View any progress chart (line/bar/area) on Android; inspect tick/tooltip label typeface.
- **Root cause:** `TgpLineChart.tsx:282`, `TgpBarChart.tsx:217`, `TgpAreaChart.tsx:257` set `fontFamily: Platform.OS === 'ios' ? 'System' : undefined`. On Android, `undefined` resolves to Roboto, not the loaded Inter family used across the rest of the UI, so chart labels are subtly off-brand.
- **Fix sketch:** Use the loaded `Inter_400Regular` (or a typography token) for the Android branch.
- **Test plan:** Visually compare chart labels to surrounding body text on Android.
- **Refs:** [Expo — Fonts](https://docs.expo.dev/develop/user-interface/fonts/); [React Native — Text style (fontFamily)](https://reactnative.dev/docs/text-style-props#fontfamily).

### EW3-010: Vestigial Google Sign-In native shim (P3)
- **Reproduction:** Static inspection only.
- **Root cause:** `src/types/shims/google-signin.d.ts` declares the `@react-native-google-signin/google-signin` module, but the package is absent from `package.json` and unreferenced in runtime code — auth is brokered through Supabase OAuth via `expo-auth-session` + `WebBrowser` (`src/utils/googleAuth.ts`), which is platform-neutral and works on Android. The shim is dead weight and can mislead future builders into thinking a native Play-Services Google SDK is wired.
- **Fix sketch:** Delete the shim or annotate it as intentionally vestigial (the web-OAuth decision is already explained in `PLAY_STORE_READINESS.md §7`).
- **Test plan:** `npm run typecheck` still passes after removal; Google sign-in still completes on Android.
- **Refs:** [Expo — AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/); [Supabase — Native mobile auth](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).

### EW3-011: Android `versionCode` is manual/local (P3)
- **Reproduction:** Ops/release-process inspection.
- **Root cause:** `app.json` carries `android.versionCode: 4` and `eas.json` uses local version source, so the `versionCode` must be hand-bumped per release; a missed bump silently blocks the Play upload. The Sentry release id (`src/services/sentry.ts:25-31`) also derives from `versionCode`, so a stale value muddies crash attribution.
- **Fix sketch:** Set EAS `appVersionSource:"remote"` (or add a release-checklist gate), per `PLAY_STORE_READINESS.md §1`.
- **Test plan:** Confirm an EAS build auto-increments `versionCode`; confirm Sentry release tag matches the build.
- **Refs:** [Expo — App versions / EAS](https://docs.expo.dev/build-reference/app-versions/).

---

## Out of scope (defer)
- **In-app purchases (StoreKit vs Play Billing)** — defer/N/A. TGP monetizes via **Stripe** (`@stripe/stripe-react-native`, Stripe Checkout WebView in `BrandedCheckoutWebViewScreen.tsx`); there is no StoreKit/Play-Billing surface. The brief's hypothesis (§1.6) is confirmed N/A. *Caveat for product/legal, not EW3:* Google Play policy treats some digital content as requiring Play Billing — that is a policy decision, not an Android parity bug.
- **Apple Pay inline payment sheet** (`BrandedCheckoutWebViewScreen.tsx:459`, iOS-only WebView props) — defer. Apple Pay is an iOS-only payment method inside Stripe Checkout; Stripe surfaces card/Link/Google Pay equivalents on Android automatically. No Android code gap; revisit only if a dedicated Google Pay button is desired (product, not parity).
- **HealthKit-only metrics** — N/A as a gap. `react-native-health` (iOS HealthKit) and `react-native-health-connect` / Samsung Health (Android) are already paired with explicit platform guards and renderable "unsupported on this platform" states (`onDeviceConnect.ts:144-160`, `healthConnectClient.ts:120-185`, `healthKitClient.ts:270-273`). This is correct platform-divergent design, not a parity gap.
- **`MessageActionSheet` iOS-only `return null`** (`src/components/messaging/MessageActionSheet.tsx:82`) — N/A. iOS uses native `ActionSheetIOS`; Android renders an equivalent themed `Modal` with identical actions. Intentional parity, not a gap.
- **Push categories vs channels** (`src/notifications/push-channels.ts`) — N/A. Android notification channels and iOS notification categories are both implemented with a matched four-tier taxonomy; FCM relay landed in PR #228. Correct parity.
- **Roman avatar / community realtime / haptics service** — verified parity. `RomanAvatar.tsx` has no platform branches; `HapticService` (`src/ui/haptics/haptics.service.ts`) wraps `expo-haptics` (cross-platform) with a safe no-op wrapper; Supabase realtime is JS-level and platform-neutral. No gaps.

---

## Suggested dispatch order
1. **P0:** none — no blocking dispatch required.
2. **P1 batch — "Android system-bars & edge-to-edge" (one PR):** EW3-001 (status bar), EW3-003 (foreground-banner inset), and fold in the safe-area-inset siblings EW3-005, EW3-006, EW3-007 since they share the same root cause (edge-to-edge + safe-area insets) and the same fix family. EW3-002 (App Links / `assetlinks.json`) is **ops/config, not code** — track it on the Play release checklist, not in the code PR.
3. **P2 batch — "Android input & biometric polish" (one PR):** EW3-004 (KeyboardAvoidingView standardization) + EW3-008 (biometric prompt copy). (EW3-005/006/007 already pulled forward into the P1 edge-to-edge PR above.)
4. **P3 polish sprint (one small PR):** EW3-009 (chart font), EW3-010 (delete vestigial shim), EW3-011 (EAS remote versionCode).

> **Pre-flight for the EW3 builder:** Most P1/P2 work is invisible in CI and the Expo Go/web harness — it only manifests on a real Android build under edge-to-edge. Allocate device-test time (Pixel-class punch-hole + one budget device + an API-28 biometric device). The five `UNCONFIRMED — needs device test` items (EW3-005/006/007, plus device-verification of 001/003/008) should be confirmed on-device before the fix PR is merged.

---

## Sources
- **Mobile codebase inspection** — `BradleyGleavePortfolio/growth-project-mobile` @ `main 5adba07` (post PR #229). Files inspected (read-only): `app.json`, `package.json`, `package-lock.json`, `eas.json`, `google-services.json`, `App.tsx`, `PLAY_STORE_READINESS.md`, and ~25 `src/**` files including `src/notifications/push-channels.ts`, `src/services/pushNotifications.ts`, `src/components/messaging/MessageActionSheet.tsx`, `src/ui/haptics/haptics.service.ts`, `src/security/biometric-lock.service.ts`, `src/hooks/useBiometricGate.ts`, `src/screens/share/ShareCardScreen.tsx`, `src/utils/googleAuth.ts`, `src/components/AppleSignInButton.tsx`, `src/services/health/{onDeviceConnect.ts, healthConnect/healthConnectClient.ts, healthkit/healthKitClient.ts}`, `src/navigation/RootNavigator.tsx`, `src/components/ForegroundNotificationBanner.tsx`, `src/components/OfflineBanner.tsx`, `src/screens/client/PlanScreen.tsx`, `src/screens/coach/payments/contents/PushConfirmModal.tsx`, `src/ui/charts/{TgpLineChart,TgpBarChart,TgpAreaChart}.tsx`, `src/types/shims/google-signin.d.ts`, `src/services/sentry.ts`. **~30+ files inspected.**
- **PR metadata** — PR #228 ([FCM google-services.json](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/228)) and PR #229 ([v1-5 mobile community](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/229), mergeCommit `5adba07`).
- **Expo docs** — [Edge-to-Edge display, now streamlined for Android](https://expo.dev/blog/edge-to-edge-display-now-streamlined-for-android); [LocalAuthentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/); [AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/); [Fonts](https://docs.expo.dev/develop/user-interface/fonts/); [App versions / EAS](https://docs.expo.dev/build-reference/app-versions/).
- **React Native docs** — [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview); [StatusBar](https://reactnative.dev/docs/statusbar); [Text style props (fontFamily)](https://reactnative.dev/docs/text-style-props#fontfamily); [RN issue #52596](https://github.com/facebook/react-native/issues/52596).
- **Android dev docs** — [Verify Android App Links](https://developer.android.com/training/app-links/verify-applinks); [Display content edge-to-edge in views](https://developer.android.com/develop/ui/views/layout/edge-to-edge); [Biometric authentication](https://developer.android.com/training/sign-in/biometric-auth).
- **Supabase docs** — [Native mobile deep linking / auth](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
