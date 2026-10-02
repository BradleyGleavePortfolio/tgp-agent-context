# S-RELEASE-2 (agent 112, round 2 after stop): report

Builder: Claude Opus 5.5. Scope: mobile #333, then mobile #330. I merged nothing, dispatched nothing, ran no EAS command or build, and did not touch production or EAS env values.

## 1. mobile #333: pre-build release-env check. Status: pushed, CI green
- **Head:** `806467b9ccd18d7ecf27d7b2e09a51d422a41d15`.
- **Commits:**
  - `2cf13c2` merges main f34b5b9.
  - `806467b` is the fix.
- **Files:** `scripts/check-expected-env.js`, `scripts/__tests__/releaseEnvProfile.test.js` and `docs/RELEASE_ENV_CHECK.md`. No package or lock change.
- **B-333-2 closed** (bounded shape checks, no live calls):
  - **Stripe key:** `pk_(live|test)_` followed by 24-247 alphanumeric characters, and not a single repeated character. On a live profile, a test-mode key is reported first.
  - **Supabase JWT:** three non-empty base64url parts with valid lengths. The header must be a JSON object with `alg` set and not `none`. The payload must be a JSON object with role `anon`. The signature must be at least 32 bytes, and `exp` must not be in the past.
  - **Supabase publishable key:** `sb_publishable_` needs at least 20 body characters.
  - **Service-role keys** are still reported first and their text is never echoed.
- **B-333-3 closed:**
  - The `valueProblem` text is fixed. A bad URL now gives `must be an https URL`, without echoing the scheme.
  - Parity lines print only the reviewed eas.json value.
- **C-333-1 closed:** these are now rejected as hosts:
  - IPv4 ranges 172.16/12, 100.64/10, 169.254/16 and 0/8;
  - IPv6 loopback, unspecified, ULA, link-local and IPv4-mapped addresses;
  - `.internal`, `.lan` and `.home.arpa` names, single-label names, and `localhost.`.
- **Tier:** re-graded T3 -> T4 in the PR body, as Sol asked.
- **Tests:** in `releaseEnvProfile.test.js`, the new describe blocks are:
  - `B-333-2: incomplete or malformed credentials fail the release gate`
  - `B-333-3: failure text never reflects any part of a value`
  - `C-333-1: every non-public host form fails`
- **Results:**
  - Against the old checker (abfc5d1): 45 failed / 50 passed.
  - At head: 3 suites (+ `expectedEnv`, `validateAppConfig`), 164/164 passed.
  - Sol's probe: 5/5 passed (4 of them failed before).
- **CI at 806467b:** Typecheck/lint/test, Analyze (js-ts), Analyze (actions) and CodeQL all pass.
- **PR body:** the fix-round table is updated.
- **Fix-round comment:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333#issuecomment-5962139782

## 2. mobile #330: Sentry native init. Status: pushed, CI green
- **Head:** `7d640548133917fb62bf101790cf9a9078f968df`.
- **Commits:**
  - `6c8a02e` merges main f34b5b9.
  - `7d64054` is the fix.
- **Package and lock:** no change.
- **B-330-3 closed.** New `src/services/sentryPrivacy.ts`, wired into `beforeBreadcrumb`, `beforeSend` and `beforeSendTransaction`:
  - Console breadcrumbs are dropped.
  - xhr, fetch and http breadcrumbs keep the method, the status and a route-only URL. The query, fragment and credentials are removed, and any path segment that is not a word becomes `:id`.
  - Touch breadcrumbs keep component and file names only.
  - All other breadcrumbs lose their message and any free text.
  - Events keep `user.id` only. Request bodies, cookies, query strings and auth headers are dropped.
  - Transactions lose `http.query` and `http.fragment`, and URLs and span names are reduced to the route.
- **Native re-init path (part of B-330-3):**
  - iOS: the JS options set `enableNetworkBreadcrumbs: false` and `enableNetworkTracking: false`. These are forwarded to Cocoa 8.58 `initWithDict`.
  - Android: the plugin writes manifest meta-data `io.sentry.breadcrumbs.network-events=false`, which SentryAndroid 8.31 applies on every init.
- **B-330-4 closed:**
  - The registered mods always remove the owned init block and the owned import block first. They re-add them only when the options resolve.
  - With the kill switch on or the DSN removed, the file returns byte for byte to the template.
  - Imports the file already had are never touched. An unterminated block fails prebuild.
- **C-330-1 closed:** the README now shows `setSentryUser({id})`.
- **C-330-2 deferred to the operator:** this needs a device and server.
  - One EAS preview build that compiles on both platforms.
  - A forced pre-JS crash that reaches Sentry.
  - IP-storage prevention turned on for the Sentry project.
- **Tests (each closes a finding):**
  - `src/services/__tests__/sentry.payload.test.ts` (new) runs the real @sentry/react-native 7.11 SDK; only the native module is a double. It checks the decoded envelope, the scope sync to native, and the `initNativeSdk` keys.
  - `src/services/__tests__/sentryPrivacy.test.ts` (new) uses canaries.
  - `sentry.privacy.test.ts` › `wires the content policy into every send path (B-330-3)`.
  - `withSentryNativeInit.test.js` › `registered mods reconcile on every prebuild (B-330-4)` and `AndroidManifest network-events flag (B-330-3)`.
- **Results:**
  - 7 suites, 123/123 at head.
  - Against 4c61d91: 14 of 28 fail.
  - tsc on the changed TS files is clean, and eslint is clean.
- **Sol probe: 5/7 at head.** The 2 "remove DSN" cases fail because of a jest-expo harness artifact, not the plugin:
  - The probe's `afterEach` does `process.env = {...}`.
  - babel-preset-expo rewrites the static `process.env.EXPO_PUBLIC_*` writes to a captured env object.
  - With only those 2 accesses made computed, the probe passes 7/7.
- **CI at 7d64054:** Typecheck/lint/test, Analyze (js-ts), Analyze (actions) and CodeQL all pass.
- **PR body:** the fix-round table is updated and the tier is now T4.
- **Fix-round comment:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330#issuecomment-5962171511

## Open risks
- Neither PR has been built on EAS or run on a device.
  - #330 changes native entry files and AndroidManifest, so its native compile is unproven until the operator runs a preview build.
  - `enableNetworkTracking=false` on iOS also stops native HTTP spans. JS still traces fetch and XHR.
- #333 will fail every preview, production and clinic build until the EAS environment holds complete real values. Production and clinic also need `pk_live_` and a Sentry DSN.
  - A `pk_live_` key whose body is under 24 alphanumeric characters would now fail. Stripe's documented minimum is 24.
- Both PRs need a fresh independent audit at the new heads, since builders never audit their own change.

## HANDOFF FOR AGENT 113
- **#333** at `806467b9ccd18d7ecf27d7b2e09a51d422a41d15`: CI green. B-333-2, B-333-3 and C-333-1 are closed with tests.
  - Next: independent re-audit, both lenses or at least Sol.
  - Then the operator dry-runs `eas env:exec production 'npm run check:release-env -- --profile clinic'` and the matching preview command, before merging.
- **#330** at `7d640548133917fb62bf101790cf9a9078f968df`: CI green. B-330-3, B-330-4 and C-330-1 are closed with tests. C-330-2 is deferred to the operator.
  - Next: independent re-audit. The auditor should use the computed-key env access in the probe (see the comment).
  - Then one operator preview build, plus a forced pre-JS crash check.
- **Merge order** (unchanged recommendation): #333, then #330, then #305.
- **Housekeeping:** both worktrees are removed and node_modules is unlinked. Nothing was merged, dispatched, built, or sent to production.
