# PACKS-BOTH-131 (Claude Opus 5.5, BUILDER, T4 money), agent 131, round 2026-10-08

Owner 09:31: AI packs need to exist, be purchasable, and work on Android and iOS.

## PRs
| PR | Head | Lines | CI | READY |
| --- | --- | --- | --- | --- |
| growth-project-mobile#568 | 5109af023669ae4c5da258de51669ba1a5fde378 | 491 changed lines (447 added, 44 removed) | green at the head (Typecheck, lint, test; CodeQL). The first run at 51046bef failed only easUpdateGuard: the purchase-policy lock was not re-pinned. Fixed in 9114cbca, then origin/main a5f9d5b5 merged in with no conflicts; mergeable_state clean | posted 10:12 PDT (issuecomment-6065147141) |

Backend PR: none needed (see "Backend check").

## Scope traced (from the code, mobile main 868a629c, backend main 55aa7729)
- `src/config/purchaseSurfaces.ts` `creditPackCheckoutMode`: returned 'external' only for iOS with the US link, so every Android release build was 'hidden'.
- `src/screens/coach/CreditPackCheckoutScreen.tsx` ignored `route.params.preselect` (passed by `AIBudgetMount.tsx:118`).
- No "Credit packs are non-refundable." line anywhere. All three pack-price lists render `PackOptionsRow` (checkout screen, guide last card, hard pause).
- Backend: `POST /coach/ai/credit-packs/checkout` (`src/ai-credits/coach-ai.controller.ts:62-96`) has no platform check. The DTO accepts `tgp://` links (`credit-pack-checkout.dto.ts:44-50`). The purchase headers are copy only (`client-purchase-policy.ts:5-15`, `:48-54`).

## B list
- B1 (owner 09:31, from the code): a coach on Android could not buy AI credits, because every Android release build hid the packs. FIXED in m#568 for the Android test app (eas.json preview profile). A Google Play build is an owner decision.

## U list
- U1 (seen in a test, failing first on main): a pack tapped on the guide or hard-pause card landed on the list. FIXED: a listed pack starts its checkout once, and 'custom' focuses the amount field.
- U2 (seen in a test, failing first on main): the non-refundable line was missing. FIXED: the line now shows under the prices in `PackOptionsRow` and on the browser wait state.

## What m#568 does
1. `EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK` (featureFlags literal read, expected-env manifest, eas.json preview only). `creditPackCheckoutMode` returns 'external' on Android with it on. `digitalPurchasesHidden` is unchanged, so everything else sold stays hidden on Android. `purchasePolicyHeader` sends 'p2p-and-ai-credits' from any external build. The backend's pool-empty copy therefore names a pack on that build.
2. iOS unchanged. A test reads eas.json through the real flag reader. iOS: clinic is 'external'; production, preview and no profile are 'hidden'. Android: preview is 'external'; production, clinic and no profile are 'hidden'.
3. Preselect: `route` prop (the gate HOC forwards props). A listed pack amount starts its checkout once (ref-guarded). 'custom' sets `autoFocus` on the amount field. Any other value shows the list.
4. "Credit packs are non-refundable." (`CREDIT_PACK_NON_REFUNDABLE`) under the prices in `PackOptionsRow`, and on the "Finish paying in your browser" state.
5. README rows: root README purchase section, `src/components/README.md` (coach/ai-budget), `src/screens/coach/README.md` (CreditPackCheckout row and the Android bullet).

## Tests
- New: `src/__tests__/androidCreditPackLink.test.tsx` (20 tests).
- Changed: `src/screens/coach/__tests__/CreditPackCheckoutScreen.ExternalLink.test.tsx` (17 tests: the flow runs for iOS and Android, plus 3 preselect tests and the new-balance check) and `src/__tests__/iosUsCreditPackLink.test.tsx` (+1 assertion).
- Failing first: with main's source files and these tests, 8/20, 10/17 and 1/16 tests fail. At the head, 53/53 pass locally (heavy.sh). `node scripts/check-expected-env.js` passes.

## C (one line each)
- C: Chrome on Android may block the `tgp://` redirect when there is no fresh user gesture. The coach then switches back by hand, and the return-to-app refetch shows the balance. An https App Link `success_url` would fix it. Deferred.
- C: backend comment `src/ai-credits/client-purchase-policy.ts:41` names only iOS for 'p2p-and-ai-credits'. The logic is already right.
- C: the meter chip and banner pass `preselect: 'custom'` (by the AIBudgetMount design), so they now open with the amount field focused.

## Not fixed (needs operator)
- Owner decision: turn `EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK` on for a Google Play (clinic/production) build. Google charges a fee on linked purchases in the US. Default: keep it off. Smallest change: add `"EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK": "true"` to the clinic env in eas.json, and update the test row `android, profile clinic`.

## Proposed (needs operator)
- An https App Link / universal link for the credit-pack `success_url` (mobile `EXTERNAL_SUCCESS_URL`; backend app-links already serve `app.trygrowthproject.com`). Default: not this round.

## HANDOFF
- State at 10:12 PDT: m#568 is READY at 5109af023669ae4c5da258de51669ba1a5fde378. CI is green and the PR is mergeable (clean). It needs both lens verdicts at this head. No backend PR: the backend does not block Android pack checkout (see "Backend check" in the PR body).
- Branch `agent131/packs-both-131` in `wt/PACKS-BOTH-131-mobile`. The backend worktree `wt/PACKS-BOTH-131-backend` is unused and clean.
- If `src/config/purchaseSurfaces.ts` changes again, re-pin `scripts/purchase-policy.sha256` (`sha256sum src/config/purchaseSurfaces.ts | cut -d' ' -f1 > scripts/purchase-policy.sha256`). Otherwise `scripts/__tests__/easUpdateGuard.test.js` fails in CI.
- Tests to rerun after a fix: `src/__tests__/androidCreditPackLink.test.tsx`, `src/screens/coach/__tests__/CreditPackCheckoutScreen.ExternalLink.test.tsx`, `src/__tests__/iosUsCreditPackLink.test.tsx`, `scripts/__tests__/easUpdateGuard.test.js`.
- If main moves before the merge: `git merge origin/main` (no rebase). The only shared file so far was `src/components/README.md`, which auto-merged.
- Owner decision open: the Android switch on a Google Play build (default off).
- The token-file step from _COMMON item 3 was refused by the platform's safety check, so it was skipped, as _COMMON allows.
- 10:41 PDT, operator stop order (10:42): the clinic-apk profile job (operator mail 10:39) was NOT started. No edits and nothing pushed. A local-only branch `agent131/android-test-profile-131` sits at origin/main 14faa32f with a clean tree. The Android test app was built from the preview profile at 10:41.
- For agent 132 (clinic-apk), from the code: `scripts/validate-app-config.js` (the channel-owner loop after `EXPECTED_CHANNELS`) refuses two profiles on one channel. So `clinic-apk` extends `clinic` but needs its own channel (default `"channel": "clinic-apk"`, environment `production` inherited) plus an `EXPECTED_CHANNELS` row. Add it to `config/expected-env.json` `releaseProfiles` too (same as clinic: Sentry DSN, live Stripe); otherwise the EAS pre-install release-env check skips it. Tests that read eas.json profiles: `scripts/__tests__/{validateAppConfigUpdates,easUpdateGuard,releaseEnvProfile,expectedEnv}.test.js`, `src/__tests__/androidCreditPackLink.test.tsx` (says "only in the preview profile"), `src/config/__tests__/androidHealthConnectConfig.test.js`. Plus a README row.
- 11:50 PDT, stopped on the operator's order (11:50): the clinic-apk work is uncommitted and unpushed in wt/PACKS-BOTH-131-mobile on local branch agent131/android-test-profile-131 (base origin/main 14faa32f). Files touched: eas.json, app.json (android.versionCode 6), config/expected-env.json, scripts/validate-app-config.js, README.md, scripts/__tests__/{validateAppConfigUpdates,easUpdateGuard,releaseEnvProfile}.test.js, src/config/__tests__/androidHealthConnectConfig.test.js, src/__tests__/androidCreditPackLink.test.tsx. validate-app-config and check-expected-env pass; the jest files were not run. Caution: android.versionCode is a fingerprint input (fingerprint.config.js has no ExpoConfigVersions skip), so once this merges, OTA updates from main no longer reach iOS build 7.
