AUDIT Claude Opus 5.5 — growth-project-mobile#315 @ d545f5b63bf65071ca3fb25d0a6921c93273099d — VERDICT: APPROVE

Lane AUD-OPUS-5 (operator 112). T3 DELTA audit from the last dual APPROVE at `d9c2e669`. I kept it to the three points the operator asked for: copy for each failure cause, no personal data sent to Sentry, and the B-CONSENT-4 Roman line. Result: A0 B0 C1.

**Delta d9c2e669..d545f5b6**
- `3260719` merges main 2c17c241. It had a real conflict in `TrustCenterScreen.tsx`. I diffed the merge-tree result against the committed tree; the resolution keeps:
  - main's `navigate('DeleteAccount')`, with no `deletionApi.requestDeletion`;
  - main's subtitle;
  - #315's "Delete account" label and policy footer.
  
  The test pins all of this.
- `de1c79a` changes the Roman line.
- `75a177f` merges main f34b5b99 (#324) and is pure: merge-tree `861db178` equals the commit tree.
- `216ec1f` adds link-failure handling for each cause.
- `d545f5b` adds the no-PII reporter.
- The head contains main f34b5b99, so the branch is up to date.

**B-CONSENT-4 line:** `TrustCenterScreen.tsx:531` reads "Not your coach — your Roman conversations, which are kept until you delete them or your account". That matches OR-110-1 and backend #635 v4. No "180 days" is left in shipped `src` copy; the only hit is a code comment in `consentVersion.ts`. The README was updated, and a test pins the line and checks that "180 days" is absent.

**Copy for each failure cause (`trustCenterLinkFailure.ts` `linkFailureMessage`).** Every message names the page.
- **Offline:** "This phone is offline, so the {page} did not open. Connect to Wi-Fi or mobile data, then tap the link again."
- **Cannot open (`canOpenURL` false or `openURL` rejected):** "...could not open the {page} in a web browser. Open any browser ... go to the address below." The exact address is shown as selectable text, with "Copy web address". If the copy fails, the screen says to press and hold the address to select it.
- **Unexpected:** the address, `SUPPORT_EMAIL`, an 8-hex reference that matches the Sentry report, "Email support", and the shared `SupportEmailFallback` (#324).

None of the copy has a generic "try again later", first person, "!" or emoji. The old alert copy is gone, and tests check this.
- A tap is not blocked by an unreachable network probe; only `isConnected === false` stops it.
- `openTrustCenterLink` never rejects, there is one open at a time, and the notice is announced on iOS and shown as a polite live region on Android.

`canOpenURL` gating for https is safe:
- Android: the Expo 56 prebuild template (`expo/template.tgz` AndroidManifest) declares the `VIEW`/`BROWSABLE`/`https` `<queries>` block.
- iOS: http(s) needs no `LSApplicationQueriesSchemes` entry on current iOS.
- The existing coach help link already uses the same pattern.

**No personal data to Sentry:** offline is not reported. Every other failure goes through `captureErrorWithoutPii` (`services/sentry.ts:106-130`), which carries:
- the link id, cause, step and reference;
- the URL without its query string;
- the error name and message after `sentrySafeText`, which strips emails and query strings and cuts to 200 characters.

A scope event processor drops `user`, `request` and `breadcrumbs`. I checked the ordering claim in the installed `@sentry/core` 10.37.0 (`prepareEvent.js`): scope processors run after client and integration processors ("Run scope event processors _after_ all other processors"), and `beforeSend` does not add a user back. The test asserts that link failures never call the plain `captureError`.

**Tests**
- At d545f5b6: `ops/heavy.sh npx jest --runInBand --ci src/screens/__tests__/trustCenterPolicyLinks.test.tsx src/services/__tests__/sentry.withoutPii.test.ts` gives 2 suites / 27 PASS.
- Fails before: the 216ec1f spec against the pre-fix `TrustCenterScreen.tsx` from 75a177f gives 9 FAIL / 15 pass (every per-cause case plus "old generic alert gone").
- CI at head: Typecheck/lint/test, Analyze (js-ts) and Analyze (actions) all pass, as does CodeQL.

**C-315-1 (optional, device pass):** on one iOS and one Android build, confirm that a forced link failure event in Sentry has no `user` block. RN sends JS events through the native transport, and the processor ordering was proven in JS only. Also confirm each policy link opens Safari or Chrome.

**Outside this diff:** the `/consumer-health-privacy` page needs backend #611 deployed, and "or your account" needs backend #608 live. Both are as already listed in the PR body.
