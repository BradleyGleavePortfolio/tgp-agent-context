AUDIT GPT-6.1 Sol — growth-project-mobile#317 @ 58c2d53fa061071e193e5e3b5f981209425e9e0c — VERDICT: REQUEST CHANGES

Independent T4 re-audit, AUD-SOL-5 / operator 112: **A 0 · B 3 · C 2** (three new B findings; the two C findings are inherited from the [same-head Opus audit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995), not reissued).

The previous cross-account permission-prompt blocker and partial-import presentation defect are repaired, but cancellation has a pre-fence hole and Health Connect continues native reads after logout; this is not dual-approved at this head. ([Permission-prompt composition regressions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/__tests__/ConnectProviderSheet.accountSwitch.test.tsx), [Connect continuation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L244-L275), [native read loop](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectSyncService.ts#L179-L232))

### B-317-6 — High / must fix: closing or unmounting during identity capture does not cancel Connect

**Evidence:** `ConnectProviderSheet.tsx:134-152` can cancel only a fence already stored in `attemptRef`; `:250-258` first awaits `beginOnDeviceConnect()`, then unconditionally installs the returned fence and opens the permission flow, without checking mount state or whether the sheet/provider attempt changed during that await. ([Cleanup and reset](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L134-L152), [late fence installation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L244-L274))

**Reproduction:** defer the identity-cache read begun by Continue, hide the sheet or unmount it before that read resolves, then resolve the same user's identity with native access granted; the actual sheet/orchestrator/fence/storage composition still invokes the permission seam once, registers once, persists a local grant and invokes the phone-sync seam once in both cases. ([Affected continuation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L244-L274), [asynchronous fence construction](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/sessionFence.ts#L111-L118))

The independent `hide` and `unmount` assertions both failed as expected; this is unwanted collection after cancelling the attempt, **not** a claim that the repaired A→B ownership bug still reproduces. ([Cancellation-sensitive path](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L134-L152))

**Minimal fix:** create a synchronous attempt identity/cancellation epoch before the first await, invalidate it on close/unmount/provider change, and after identity capture cancel/discard a late fence unless that exact attempt is still mounted, visible and current; recheck before opening native permissions and before importing. Add composition regressions for close/unmount/provider change while identity capture is pending, expecting zero prompt, registration, grant and phone read.

### B-317-7 — High / must fix: Health Connect reads subsequent pages and types after logout

**Evidence:** `healthConnectSyncService.ts:181-200` checks the fence once before an awaited progress read, then reads each granted type without another check; `healthConnectClient.ts:281-318` follows up to 20 native pages with no cancellation/fence callback. ([Type loop](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectSyncService.ts#L179-L222), [page loop](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectClient.ts#L281-L318))

**Reproduction:** use the real service, real paged client and real session fence; grant Steps, HeartRate and Weight, and emit logout while the first native Steps read returns a continuation token; the service subsequently starts Steps page 2, HeartRate and Weight before detecting the changed session at its later request/progress boundary. ([Unchecked continuation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectClient.ts#L302-L316), [late fence boundary](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectSyncService.ts#L193-L232))

The independent assertion observed **4 native calls instead of 1**; session-change rejection and unchanged persisted progress were separately asserted, so the demonstrated gap is **additional local health collection after logout**, not a foreign-account POST or progress advance. ([Read and save boundaries](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectSyncService.ts#L193-L232))

**Minimal fix:** thread a mandatory cancellation/fence check into the native paged read and run it before every new page and type, including after asynchronous progress/permission setup; rethrow session-change/cancellation errors instead of degrading them into an ordinary per-type read failure. Do not attempt to undo a native request already started; prove that no *new* page/type starts after logout, account switch or sheet cancellation.

### B-317-8 — Medium / must fix: cloud connect still ignores failure status/code and drops the support reference

**Evidence:** `ConnectProviderSheet.tsx:341-347` discards the caught error and tells every cloud OAuth failure to check the internet and tap Continue; it neither handles an expired session nor supplies a reference/support path and reporting for unexpected server failures. ([Cloud error catch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L334-L347))

Independent actual-sheet cases with OAuth start HTTP **401** and **500** both rendered the internet advice; 401 had no login action/copy, and 500 had no reference/support copy or `reportUnexpected` call, contradicting the owner's coded-error requirement. ([Error branch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L341-L347))

**Minimal fix:** retain the error and use a cloud-specific mapper: network advice only for network errors, login recovery for 401, actionable known status/machine-code outcomes, and unexpected failures with a short request reference, working support path and safe Sentry report. Add 401, 403, 429, 5xx/unknown and genuine-network component cases.

### Prior-finding disposition and optional inherited items

- **A-317-1 narrow account-switch-through-permission-dialog case: CLOSED.** The account/generation fence is captured before the prompt; existing real-composition cases cover A→B, logout, same-account re-login and a successful control, and this lens reran them successfully; B-317-6 concerns a different pre-fence close/unmount interleaving. ([Composition suite](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/__tests__/ConnectProviderSheet.accountSwitch.test.tsx), [previous Sol audit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5939974918))
- **B-317-2 UI partial-import case: CLOSED.** Incomplete results retain the sheet with Continue import/Try again instead of full-import success; the partial/resume/all-fail cases pass. ([Outcome handling](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectProviderSheet.tsx#L194-L227), [component regressions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/__tests__/ConnectProviderSheet.test.tsx))
- **B-317-5 and C-317-4: CLOSED.** Remote-connected/no-local-grant rows offer Not syncing here/Reconnect; Disconnect has a confirmation and specific failure handling, including already-disconnected refresh and unknown-reference reporting; targeted tests pass. ([Connections implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/ConnectionsScreen.tsx#L289-L352), [Opus closure record](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995))
- The Health Connect declared/read permission-set equality regression passes; the three unused Health Connect permissions are removed, with no new manifest finding from this lens. ([Exact-set test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/__tests__/healthPlatformConfig.test.ts))
- **C-317-5 and C-317-6: inherited, optional; no duplicate finding.** Preserve Opus's remaining Samsung/activity permission observation and the operational release prerequisites: backend #608 deployed before ingest activation, wearable AI insight flag unset pending D2 enforcement, a fresh clinic binary plus device pass, and Play declaration before reviewed tracks. ([Same-head C findings](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995))

### Scope / verification

The merge of main at `54916fa` is **not pure/tree-equal** to the conflicted `merge-tree`: I reviewed its resolution seams, including preserving health-state and consultation-draft retirement, the Health Connect disabled build guard/lazy import, scoped progress, deletion of the removed hook test, and the wearable-AI default-off expected-env registration; the own-fix diff `54916fa..58c2d53` was reviewed separately. ([Independent same-head merge-seam record](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995))

Required exact-head CI is green: Typecheck/lint/test and both required Analyze checks, plus CodeQL; this does not cover the adversarial interleavings above. ([Typecheck/lint/test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37060528148/job/111015773472), [Analyze actions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37060528174/job/111015774520), [Analyze JS/TS](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37060528174/job/111015774431))

**Local targeted evidence:** **16 suites / 208 passed**; external independent assertions **5 failed as expected**, not setup failures (two cancellation cases, one paged-read logout case, two OAuth status cases); React act warnings in the cancellation harness are retained in the log, and the service/storage call observations—not rendered timing—establish those failures. ([Candidate sheet composition](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/screens/client/wearables/__tests__/ConnectProviderSheet.accountSwitch.test.tsx), [affected read loop](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/58c2d53fa061071e193e5e3b5f981209425e9e0c/src/services/health/healthConnect/healthConnectSyncService.ts#L193-L232))

Exact commands (worktree `/home/user/workspace/wt/aud-sol5-317`; all via shared heavy queue):

```text
/home/user/workspace/ops/heavy.sh npx jest --runInBand --forceExit \
 src/screens/client/wearables/__tests__/ConnectProviderSheet.accountSwitch.test.tsx \
 src/screens/client/wearables/__tests__/ConnectProviderSheet.test.tsx \
 src/screens/client/wearables/__tests__/ConnectProviderSheet.buildSwitch.test.tsx \
 src/screens/client/wearables/__tests__/ConnectionsScreen.test.tsx \
 src/screens/client/wearables/__tests__/WearablesShell.test.tsx \
 src/screens/client/wearables/__tests__/onDeviceCopy.test.ts \
 src/services/health/__tests__/onDeviceSync.test.ts \
 src/services/health/__tests__/sessionFence.test.ts \
 src/services/health/__tests__/healthPlatformConfig.test.ts \
 src/services/health/__tests__/healthConnectBuildGuard.test.ts \
 src/services/health/healthkit/__tests__/healthKitSyncService.test.ts \
 src/services/health/healthConnect/__tests__/healthConnectSyncService.test.ts \
 src/hooks/useWearableConnections.test.tsx \
 src/config/__tests__/androidHealthConnectConfig.test.js \
 src/services/__tests__/authActions.signOut.test.ts \
 src/services/__tests__/authActions.test.ts
/home/user/workspace/ops/heavy.sh npx jest \
 --config /home/user/workspace/ops/evidence/AUD-SOL-5-112/jest317.config.cjs \
 --runInBand --forceExit
```

Evidence retained under `ops/evidence/AUD-SOL-5-112/`: `317-targeted.log`, `317-independent-probes.log`, `aud-sol5-wearables-r4.test.tsx`, `jest317.config.cjs`, `mobile-317-r4-own.diff`, `317-merge-seam.txt`, `317-merge-resolution.diff`. No device/prebuild/native-binary proof, full local suite, push, merge, workflow dispatch or production action was performed.
