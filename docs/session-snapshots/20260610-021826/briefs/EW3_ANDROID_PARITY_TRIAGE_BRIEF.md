# PLANNING-DOC BRIEF — EW3 Android Parity Triage

**Track:** EW3 (item #20 on TODO)
**Output:** `docs/EW3_ANDROID_PARITY_TRIAGE.md` in `BradleyGleavePortfolio/tgp-agent-context`
**Branch:** `plan/ew3-android-parity-triage` (NEW)
**Worktree to create:** `/home/user/workspace/tgp/agentctx-ew3-triage` off `origin/main`
**Mobile repo to inspect (read-only):** `/home/user/workspace/tgp/mobile-community-v1-5` (now at v1-5)
**Model:** Opus 4.8 (builder/planner)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

---

## 0. Goal

Produce a severity-ranked gap list of **iOS-only or iOS-better features** in the TGP mobile app that need Android parity. Output is a planning doc, not code. This unblocks future EW3 builder dispatch and gives the operator a clear pre-flight.

---

## 1. Sources to grep

In the mobile worktree (READ-ONLY — do not modify):
- `package.json` — every dep with `ios` in name or known iOS-only impl
- `app.config.ts` / `app.config.js` / `expo.json` — `ios` vs `android` config blocks
- `src/**/*.{ts,tsx}` — grep for `Platform.OS === 'ios'`, `Platform.select`, `Platform.OS === 'android'`
- `src/**/*.{ts,tsx}` — grep for `requireOptionalNativeModule`, `NativeModules.`
- `ios/` dir — any custom native module without an `android/` counterpart
- `android/` dir — last-modified dates vs `ios/` to flag staleness
- Any `*.ios.ts` or `*.ios.tsx` files without a matching `*.android.ts` or platform-neutral fallback

Plus check these known-iOS-bias areas:
1. Haptics (`expo-haptics` works on Android too — but iOS impact styles differ)
2. Share sheets (`expo-sharing` vs native intents)
3. Deep links / Universal Links (iOS) vs App Links (Android)
4. Push entitlements (APNs vs FCM — note FCM just landed in PR #228)
5. Biometric prompts (FaceID vs BiometricPrompt API levels)
6. In-app purchases (StoreKit vs Play Billing) — but TGP uses Stripe, so likely N/A; verify
7. Background tasks (BackgroundTasks framework vs WorkManager)
8. Camera/photo picker (PHPicker vs Photo Picker on Android 13+)
9. Permissions (location/photos/camera/notifications — different runtime flows)
10. Safe-area insets on notched/punch-hole Android devices
11. Keyboard handling (KeyboardAvoidingView behaves differently on Android)
12. Status-bar color / theme
13. Splash screen (`expo-splash-screen` vs native)
14. App icons + adaptive icons (Android requires foreground/background layers)
15. Font loading (`expo-font` — usually parity, but Dynamic Type on iOS only)
16. Audio session (iOS-only concept; Android has AudioFocus)
17. Roman avatar rendering — check `RomanAvatar.tsx` for any platform branches
18. Community realtime — check that Supabase realtime works on Android (it should)

---

## 2. Output format

Produce `docs/EW3_ANDROID_PARITY_TRIAGE.md` with this structure:

```
# EW3 — Android Parity Triage

**Date:** 2026-06-09
**Reviewed mobile branch:** main @ <sha-after-PR-229-merge>
**Total gaps identified:** <N>
**Severity breakdown:** P0: <n>, P1: <n>, P2: <n>, P3: <n>

## Severity definitions
- P0: Feature broken or missing on Android, blocks core flow (login, payment, push, content view)
- P1: Feature works but visibly worse on Android (jank, wrong layout, missing affordance)
- P2: Feature works but has subtle parity gap (haptic intensity, animation timing)
- P3: Polish / consistency

## Gaps table
| ID | Severity | Area | File:line | iOS behaviour | Android behaviour | Recommended fix | Estimated effort |
|---|---|---|---|---|---|---|---|

## Per-area deep dive
### EW3-001: <name> (P<n>)
- Reproduction: …
- Root cause: …
- Fix sketch: …
- Test plan: …

(repeat per gap)

## Out of scope (defer)
- <gap> — defer to <reason>

## Suggested dispatch order
1. Fix all P0 first (single PR or grouped)
2. P1 batched by area (e.g. one PR for "Android push polish", one for "Android keyboard handling")
3. P2/P3 batched as polish sprint

## Sources
- Mobile codebase inspection: <files inspected count>
- Expo docs (cite specific pages with URLs)
- React Native docs (cite specific pages with URLs)
- Android dev docs (cite specific pages with URLs)
```

---

## 3. Strict rules

- DO NOT modify the mobile repo. Read-only inspection only.
- DO NOT install anything in the mobile worktree (disk-cautious).
- Cite specific files and line numbers for every gap found.
- If a gap cannot be confirmed without running the app, mark it `UNCONFIRMED — needs device test` and downgrade severity by one notch.
- Use the gh CLI `api_credentials=["github"]` for any PR ops.
- Title-only commits.

---

## 4. Workflow

1. `cd /home/user/workspace/tgp/agentctx-build-order && git fetch origin && git worktree add /home/user/workspace/tgp/agentctx-ew3-triage -b plan/ew3-android-parity-triage origin/main`
2. Inspect mobile repo per §1.
3. Write `/home/user/workspace/tgp/agentctx-ew3-triage/docs/EW3_ANDROID_PARITY_TRIAGE.md`.
4. Commit (title-only).
5. Push: `git push -u origin plan/ew3-android-parity-triage`
6. Open PR: `gh pr create --repo BradleyGleavePortfolio/tgp-agent-context --base main --title "plan: EW3 Android parity triage" --body "Severity-ranked Android parity gaps. Unblocks EW3 builder dispatch."`
7. Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`.
8. Save result to `/home/user/workspace/EW3_TRIAGE_RESULT.md`.

Return: PR number, branch, gap count by severity, top 3 P0 gaps.
