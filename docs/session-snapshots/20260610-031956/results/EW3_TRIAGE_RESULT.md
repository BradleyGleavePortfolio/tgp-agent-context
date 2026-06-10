# EW3 Android Parity Triage — RESULT

**Status:** ✅ Complete
**Track:** EW3 (TGP TODO item #20)
**Planner:** Opus 4.8
**Date:** 2026-06-09

## Deliverables
- **PR:** [#11 on `BradleyGleavePortfolio/tgp-agent-context`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/pull/11) — `plan: EW3 Android parity triage`
- **Branch:** `plan/ew3-android-parity-triage` (off `origin/main`)
- **Worktree:** `/home/user/workspace/tgp/agentctx-ew3-triage`
- **Doc:** `docs/EW3_ANDROID_PARITY_TRIAGE.md` (commit `41c6186`, title-only, author `Dynasia G <dynasia@trygrowthproject.com>`)
- **Journal:** appended to `/tmp/tgp-agent-context/handoffs/dispatch.json` (event `plan-complete`)

## Scope notes
- **Mobile repo inspected READ-ONLY:** `BradleyGleavePortfolio/growth-project-mobile` — reviewed `main @ 5adba07` (the merge commit of PR #229 "v1-5 mobile community", merged 2026-06-09T23:01:42Z). Inspection ran against the local `mobile-community-v1-5` worktree (`feature/community-v1-mobile-client`, HEAD `0672fb2`), which carries the PR #229 code that landed on main.
- The mobile app is an **Expo managed/CNG** project — no committed `ios/`/`android/` dirs; native projects generate from `app.json` + config plugins at build time.
- No mobile-repo modifications. No `npm install` anywhere.

## Gap count by severity
| Severity | Count |
|---|---|
| **P0** | **0** |
| **P1** | **3** |
| **P2** | **5** |
| **P3** | **3** |
| **Total** | **11** |

5 of the gaps are flagged `UNCONFIRMED — needs device test` and were downgraded one notch per the brief (EW3-005, EW3-006, EW3-007, plus device-verification of 001/003/008).

## Top 3 P0 gaps
**None.** No core-flow-breaking (login / payment / push / content-view) Android gaps were found. Every native-capability surface (push channels, HealthKit↔Health Connect↔Samsung Health, biometrics, share sheet, Google/Apple auth, deep-link parser, FCM via PR #228) already has an intentional, working Android branch.

### Top 3 P1 gaps (highest live severity)
1. **EW3-001 — Status-bar background no-op under edge-to-edge** (`App.tsx:10-11`): SDK 56 forces Android edge-to-edge; `RNStatusBar.setBackgroundColor()` is deprecated/no-op, so the bone status-bar band is not painted.
2. **EW3-002 — Android App Links not auto-verifiable** (`app.json` `autoVerify:true`; `PLAY_STORE_READINESS.md §6`): `https://app.trygrowthproject.com/.well-known/assetlinks.json` not yet hosted with the Play App Signing SHA-256, so universal links open a chooser instead of the app. (Ops/config, not code.)
3. **EW3-003 — Foreground push banner top inset** (`ForegroundNotificationBanner.tsx:182`): fixed `paddingTop:12` on Android is not safe-area-aware; banner can render under the status bar / punch-hole on tall devices.

## Suggested dispatch order
- **P0:** none.
- **P1 (one PR):** "Android system-bars & edge-to-edge" — EW3-001, EW3-003 + the same-root-cause safe-area siblings EW3-005/006/007. EW3-002 goes on the Play release checklist (config, not code).
- **P2 (one PR):** "Android input & biometric polish" — EW3-004 (KeyboardAvoidingView), EW3-008 (biometric copy).
- **P3 (one small PR):** EW3-009 (chart font), EW3-010 (delete vestigial Google shim), EW3-011 (EAS remote versionCode).
- **Pre-flight:** P1/P2 only manifest on a real Android build under edge-to-edge — allocate device test time (Pixel punch-hole + budget device + API-28 biometric device).
