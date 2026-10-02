AUDIT GPT-6.1 Sol — growth-project-mobile#330 @ 4c61d9151be5a50e67c3b0b33ba54995b973bb59 — VERDICT: REQUEST CHANGES

**T4 release/native privacy lens; A/B/C = 0/2/2. Hold merge.** This independently extends the other lens's 0/0/2, rather than treating its mocked init assertions as end-to-end privacy proof. [Other exact-head audit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330#issuecomment-5961012859).

### B-330-3 — Post-JS breadcrumbs are not covered by the promised privacy policy

`src/services/sentry.ts:57-84` preserves HTTP/console breadcrumbs and strips only Authorization/Cookie on `event.request`; no `beforeBreadcrumb` or integration override suppresses the installed SDK 7.11 default XHR/console capture. An independent probe executes the actual service's `Sentry.init` options and `beforeSend` with a synthetic XHR query containing a private-message canary: the returned event retains it unchanged, despite all four asserted privacy booleans being false. Those booleans do not disable breadcrumb content. [Candidate privacy implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).

The pre-JS plugin sets network-breadcrumb suppression, but its own documented JS re-initialization is significant: the installed SDK's iOS native wrapper recreates options and its native breadcrumb callback filters only the dev-server/DSN URLs; Android re-initialization has no mapping for the plugin's `setEnableNetworkEventBreadcrumbs(false)`. Therefore pre-JS flags alone are not proof that the suppression survives JS startup. No real customer event, network transmission or device leak is claimed. [Candidate plugin and declared lifecycle](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).

**Minimal fix:** enforce an explicit safe breadcrumb policy for XHR/fetch/console at the JS boundary, and preserve equivalent native suppression across the actual SDK re-init path on both platforms; do not rely on `sendDefaultPii=false` to redact application content. Add canary tests exercising resulting event payloads, including the post-JS/native path, rather than only checking init booleans. [Policy gap](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).

### B-330-4 — Removing DSN / using the native kill switch leaves the previous generated initializer active

`plugins/withSentryNativeInit.js:182-191` writes only when options are non-null; disabled configuration simply returns existing native contents. I executed the **actual registered Expo mod callbacks** against both SDK-56 entry-file fixtures, first enabled, then `TGP_SENTRY_NATIVE_INIT=0`, and separately after removing the DSN: all four disabled-state assertions fail because the old `SentrySDK.start` / `SentryAndroid.init` block and DSN remain. Enabled insertion order and repeatability both pass. This affects incremental prebuild; fresh clean generation is not alleged to fail. [Candidate mod lifecycle](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).

**Minimal fix:** always reconcile the plugin-owned marked block, removing it when options resolve null, with conservative handling of owned imports; test enabled → disabled → enabled through the registered callbacks on iOS and Android. A kill switch must not silently leave the old initializer in the next binary. [Disabled branch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).

### Optional findings carried

- **C-330-1:** update `src/services/README.md`'s email-bearing `setSentryUser` example to the new ID-only contract. [Prior finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330#issuecomment-5961012859).
- **C-330-2:** require real iOS/Android release compilation plus a synthetic pre-JS native crash reaching the intended Sentry project, and verify project-level IP-storage prevention before release; fixture/mod tests and JS privacy doubles do not establish these device/server facts. [Prior acceptance boundary](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330#issuecomment-5961012859).

### Executed evidence and limits

- Ordinary targeted command, through `ops/heavy.sh`: `env CI=true npx jest --runInBand --forceExit --runTestsByPath plugins/__tests__/withSentryNativeInit.test.js src/services/__tests__/sentry.privacy.test.ts src/hooks/__tests__/useCurrentUser.composition.test.tsx scripts/__tests__/expectedEnv.test.js scripts/__tests__/validateAppConfig.test.js` — **5 suites / 92 PASS**, exit 0. [Candidate tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).
- Independent command, through the same queue: `env CI=true npx jest --runInBand --forceExit --runTestsByPath src/services/__tests__/auditSol330.boundaries.test.js` — **5 failed / 2 positive controls passed**, exit 1; synthetic content only, registered mods executed in memory, no vendor/network calls. Preserved executable probe and both logs under `ops/aud-sol3-112/`. [Exact audited candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).
- Required exact-head typecheck/lint/test and both CodeQL Analyze contexts are SUCCESS; downloaded CI executes **414 suites / 5,680 PASS**. Dependency and lock graph unchanged; no install. [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37060428172/job/111015443220).
- Checked the bundled Cocoa **8.58.0** primary options header: the generated Swift privacy property names exist, so no unsupported-property defect is alleged; registered callback output also inserts before React Native on both templates. Full clean prebuild, native compiler/device execution and project settings were not performed. [Cocoa options](https://github.com/getsentry/sentry-cocoa/blob/8.58.0/Sources/Sentry/Public/SentryOptions.h), [candidate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).

No tracked production source edits, push, merge, workflow dispatch/rerun or production access; final live head/check guard precedes this one verdict. [Audited PR](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330).
