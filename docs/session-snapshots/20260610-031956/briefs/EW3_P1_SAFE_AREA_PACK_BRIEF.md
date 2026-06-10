# EW3 — Android Parity P1 Safe-Area Pack (Builder Brief)

**Role:** Opus 4.8 Builder
**Target:** `growth-project-mobile`
**Worktree:** `/home/user/workspace/tgp/mobile-ew3-safe-area`
**Branch:** `feature/ew3-android-safe-area-p1` (already created off `5adba07` = main)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Commit policy:** Title-only commits. Force-push prefer `--force-with-lease`.
**gh CLI:** `api_credentials=["github"]` for all PR ops.

---

## Why

Per EW3 triage (PR #11 @ `41c6186`), Expo SDK 56 enables Android edge-to-edge by default. Two
P1 surfaces still use pre-SDK-56 patterns that break the bone (`#F5EFE4`) status-bar band and the
foreground push banner on tall/notched Android devices.

A third P1 (EW3-002 App Links `assetlinks.json`) is **ops/config, NOT code** — out of scope for
this code pack. Document only in this PR's body (operator decides hosting/SHA-256 separately).

Source of truth: `/home/user/workspace/tgp/agentctx-ew3-triage/docs/EW3_ANDROID_PARITY_TRIAGE.md`

---

## Scope (in this PR)

### Fix 1 — EW3-001: Status-bar background under SDK 56 edge-to-edge
- **File:** `App.tsx:10-11`
- **Problem:** `RNStatusBar.setBackgroundColor('#F5EFE4', false)` is deprecated/no-op under
  edge-to-edge. The intended bone band behind the Android status bar is not painted.
- **Fix:** Remove the deprecated call. Adopt the edge-to-edge model:
  - Keep `expo-status-bar` `style="dark"` for icon contrast.
  - Paint the bone band via a top inset color: render a `View` with
    `height={useSafeAreaInsets().top}` and `backgroundColor='#F5EFE4'` at the very top of the
    root layout, BEFORE the SafeAreaView/SafeAreaProvider children.
  - Verify the existing `SafeAreaProvider` is at the top of the tree (it should be —
    `react-native-safe-area-context` is already a dep).
  - Remove any `import { StatusBar as RNStatusBar }` if no longer used.

### Fix 2 — EW3-003: Foreground push banner top inset
- **File:** `src/components/ForegroundNotificationBanner.tsx:182`
- **Problem:** `paddingTop: Platform.OS === 'ios' ? 44 : 12` — `12` is a magic number that does
  not account for the Android status-bar height under edge-to-edge.
- **Fix:** Use `useSafeAreaInsets().top` for the Android branch (and ideally both branches, since
  `44` is also a magic number — replace with `Math.max(useSafeAreaInsets().top, 12)` to keep a
  minimum padding floor).
- Hook usage: import `useSafeAreaInsets` from `react-native-safe-area-context` if not already
  imported in the file.

### Out of scope (documented in PR body, deferred)
- EW3-002 (assetlinks.json hosting) — ops/config, separate ticket. PR body must note: "This pack
  fixes the 2 code-level P1 surfaces (EW3-001, EW3-003). EW3-002 (`https://app.trygrowthproject.com/.well-known/assetlinks.json`)
  is an ops/config gap and tracked separately."

---

## Process

1. From worktree `/home/user/workspace/tgp/mobile-ew3-safe-area`:
   - Confirm clean tree, branch `feature/ew3-android-safe-area-p1`, base `5adba07`.
2. Read existing `App.tsx` and `src/components/ForegroundNotificationBanner.tsx` end-to-end before
   editing. Note whether `SafeAreaProvider` is already in the tree and at the correct level.
3. Apply the 2 fixes above with the smallest viable diff. Do NOT refactor unrelated code. Do NOT
   "improve" other safe-area surfaces (`OfflineBanner.tsx`, `PlanScreen.tsx`) — those are P2
   triage items, separate tickets.
4. Update or add tests:
   - Add an `App.test.tsx` smoke test confirming the top-inset paint view renders (snapshot ok).
   - Add a render test for `ForegroundNotificationBanner` verifying `paddingTop` uses the inset
     (mock `useSafeAreaInsets` to return `top: 47`, assert style includes `paddingTop: 47`).
5. Run:
   - `npm run lint` → must pass
   - `npm run typecheck` → must pass (TS strict mode)
   - `npm test -- --testPathPattern='(App|ForegroundNotificationBanner)'` → all green
6. Commit title-only: `feat(android): EW3 P1 safe-area pack — edge-to-edge status bar + push banner inset`
7. Push: `git push -u origin feature/ew3-android-safe-area-p1`
8. Open PR via `gh pr create --base main --head feature/ew3-android-safe-area-p1 \
     --title "feat(android): EW3 P1 safe-area pack — edge-to-edge status bar + push banner inset" \
     --body-file PR_BODY.md`
9. PR body must include:
   - Triage reference: PR #11 @ `41c6186`, items EW3-001 + EW3-003.
   - What changed (file + line + before/after for both).
   - Out-of-scope note for EW3-002.
   - Test plan: `npm run lint`, `npm run typecheck`, jest tests added, manual device-test plan
     ("Pending: Android API 30/33/34 device capture of welcome screen showing bone status-bar
     band, and a triggered foreground push banner on a notched device").
   - Risk: cosmetic-only on iOS (no behavior change — `top` inset on iPhone covers the notch the
     same way the previous `44` magic number did, with a `Math.max(... , 12)` floor).
   - Rollback: revert single commit.

---

## Gates (must pass before opening PR)

- Lint: `npm run lint` → 0 errors
- Typecheck: `npm run typecheck` → 0 errors
- Tests: `npm test -- --testPathPattern='(App|ForegroundNotificationBanner)'` → all pass
- Bundle: confirm no new dependencies added (`useSafeAreaInsets` from existing
  `react-native-safe-area-context`, `expo-status-bar` already a dep).
- Manual: this is mobile UI — no device capture required for this PR; flag for QA in the PR body.

---

## Constraints

- **Sonnet 4.6 FORBIDDEN as runtime** — you are Opus 4.8. R31 does not apply (this is product code,
  not runtime classifier code).
- **Title-only commits.** Author `Dynasia G <dynasia@trygrowthproject.com>`.
- Force-push, if needed, with `--force-with-lease=feature/ew3-android-safe-area-p1:<remote-sha>`.
- Do NOT bump `package.json`. Do NOT touch unrelated files. Do NOT auto-fix EW3-002 (assetlinks);
  that's not code work.
- If you find a P0/P1 issue beyond the scoped 2 fixes during the work, STOP and report — do not
  silently expand scope.

## Out of scope (do NOT do)
- EW3-002 assetlinks.json hosting
- EW3-004..EW3-011 (all P2/P3, separate tickets)
- Any refactor of `OfflineBanner.tsx`, `PlanScreen.tsx` — they're P2 in the triage
- Touching iOS-only files unless strictly required by the 2 fixes
- Bumping Expo SDK or other dependencies

## Output expectations
- 1 PR opened against `trygrowthproject/growth-project-mobile`
- 2 files changed (`App.tsx`, `src/components/ForegroundNotificationBanner.tsx`) + tests
- PR_BODY.md committed alongside the change so the audit can reproduce gate output

## Result file
Write a final summary to `/home/user/workspace/EW3_P1_SAFE_AREA_PACK_RESULT.md` including:
- PR URL
- Files changed (with line counts)
- Gate results (lint/typecheck/tests)
- Risk + rollback note
