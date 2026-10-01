# Lane S-PWA — Android v1.0 as an installable web app (PWA): feasibility spike, then build. Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly (heavy commands only via ops/heavy.sh;
a web export is heavy: run it through heavy.sh only, never in parallel with another export, and check `df -h /` and
free memory first).

Owner 14:25 PDT (summary): iOS launches day 1 through the App Store. Android users get a separate path for v1.0: a
Progressive Web App installed from a QR code (home-screen icon, full screen, no "unknown sources" warning, silent
updates, no Google Play). Owner standard: identical feel to the native app; no half-built software.

## Phase 1 — spike (no PR merges, no production changes). Report before any build work.
Facts: mobile is Expo SDK 56 / React Native 0.85 and already has react-native-web ^0.21 + react-dom and a `web`
script; app.json web config is only a favicon. Native-only modules in use include react-native-health-connect and
react-native-health (wearables), @stripe/stripe-react-native, crisp-sdk-react-native, expo-sqlite (local db
src/db/database.ts), expo-notifications (push), expo-local-authentication (biometric lock), expo-secure-store,
@sentry/react-native, posthog-react-native. expo-updates is not installed.
1. Build the web bundle from origin/main in your own worktree (`npx expo export --platform web` via heavy.sh). Record
   every build error and every runtime crash/blank screen when served locally and driven in a mobile-sized headless
   browser through: welcome -> create account -> onboarding -> client home -> plan/workout -> food log -> messages ->
   Roman -> settings -> support -> package checkout. Coach flows too.
2. For each native-only module: what breaks on web, the web replacement (e.g. IndexedDB/wasm SQLite, Web Push with
   VAPID instead of Expo push tokens, Crisp web chat, Stripe Checkout redirect, WebAuthn or none for biometric lock,
   secure storage equivalent and its security trade-off), and what cannot exist on web (Health Connect / HealthKit:
   state which wearable paths still work through the brands' cloud accounts in our backend, if any).
3. PWA requirements: manifest (standalone, icons 192/512 + maskable, theme colors, start_url with code passthrough),
   service worker (offline shell + cached plan/workouts, update strategy so users never run stale code after a
   deploy), install prompt (beforeinstallprompt; Samsung Internet behavior), WebAPK on Chrome Android, where it is
   hosted (same origin as the API or a subdomain; CORS, cookies/tokens, CSP), and how a deploy reaches users.
4. One smart QR: /join/<code> detects the device: iPhone -> App Store (show the code to enter), Android -> the PWA with
   the code prefilled. Confirm what the backend /join page does today.
5. Backend work needed (web push subscriptions + sending, CORS, any auth differences such as Sign in with Apple/Google
   on web).
6. Report: a table per feature (works / needs web version / impossible on web), the work list with tier per item,
   and the risks. /home/user/workspace/ops/reports/S-PWA-spike.md + final answer. Do not start Phase 2 until the
   operator relays the owner's go.
