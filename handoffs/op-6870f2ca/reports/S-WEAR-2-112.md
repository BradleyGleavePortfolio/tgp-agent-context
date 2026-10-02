# S-WEAR-2 report (agent 112, Claude Opus 5.5, T4 builder)

## PRs and heads
- Mobile #317 `agent/clinic/s14-wearables-mob`: c7e35d84 -> **54916fa** (merge of mobile main 2c17c241, merge commit, resolution only) -> **0b733fb** (fix round, final head).
- No backend PR: nothing on the server was needed (on-device register + ingest 403 `wearables_connection_forbidden` + 503 `wearables_ingest_disabled` already on backend main via #623). No migration, no new env names on the backend.
- Nothing merged, no workflow dispatched, production untouched, launch manifest not edited.

## Finding dispositions
| ID | Disposition | Commit | Failing-before test |
|---|---|---|---|
| A-317-1 r3 (Sol, narrow) permission prompt awaited before user/fence captured | Fixed. `beginSessionFence` captures auth generation then user at the Continue tap, BEFORE `connectOnDeviceProvider`; fence carried through register, local grant, import; sheet cancels it on close/unmount/provider change; HK and HC sync require a fence, check `fence.userId === scope.userId` and assert current before reading the store (after the permission screen), before each request and before saving. | 0b733fb | `ConnectProviderSheet.accountSwitch.test.tsx` (real sheet + orchestrator + fence + storage, deferred prompt): A to B, sign-out, same-account re-login -> zero register, zero local grant (A and B), zero read/POST. 3 of 4 fail on 54916fa code. Plus onDeviceSync / sessionFence / HK / HC unit tests. |
| A-317-1 (lane: every read/upload path bound) dormant Samsung uploader | Removed `samsungHealthSyncService` + `useSamsungHealthSync` (unused, posted with no fence). The only ingest posters left are the fenced HK/HC services. | 0b733fb | healthConnectBuildGuard updated |
| B-317-2 (Sol, sheet part) | Fixed. Only a complete import closes; partial -> Continue import (`resumeOnDeviceImport`, same fence, local grant required); all reads failing -> Try again; refresh on Health open shows partial/failed with Try again. | 0b733fb | ConnectProviderSheet (partial + resume, all fail, pass bound still incomplete), WearablesShell (partial refresh). Refresh tests fail on 54916fa. |
| B-317-5 (Opus) | Fixed. Connections: "Not syncing here" badge, note "<name> is not syncing on this phone. Tap Reconnect to continue.", Reconnect opens the Connect sheet. Health screen: same note + Reconnect. Local check reads app storage only. | 0b733fb | ConnectionsScreen (2 fail on 54916fa), WearablesShell |
| C-317-3 (Opus) release ordering | Documented: do not flip `FEATURE_WEARABLES_INGEST_POST` until backend #608 (account-deletion fan-out, still OPEN) is deployed; keep `EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS` unset. | body | n/a |
| C-317-4 (Opus) | Fixed in round 4b: confirm dialog naming the source and what stops, data already shared stays with the coach, Cancel default, coded failure copy + Sentry. | 58c2d53 | ConnectionsScreen confirm suite (11 fail on 0b733fb) |
| Lane: no generic errors | `onDeviceCopy.ts`: account changed, signed out, HC permission denied / not ready, network (register vs import), 401, 403 `wearables_connection_forbidden`, other 403, 429, 503 lane off; unknown -> "Reference <8>" (server id or fresh id) + hello@thegrowthproject.app + `reportUnexpected`. | 0b733fb | onDeviceCopy.test.ts, WearablesShell |
| Lane: Health Connect returns | `eas.json` clinic `TGP_ANDROID_HEALTH_CONNECT="1"`; preview/production stay "0". | 0b733fb | androidHealthConnectConfig.test.js |
| Lane: orphaned coach prompts | `ClientWearablePrompts` in ClientsStack behind `featureFlags.communityWearablePrompts`; client Health tab "Wearable coaching prompts" entry only when build flag AND server flag `coach_community_wearable_prompts`; Back control on the screen. | 0b733fb | clientWearablePromptsRoute, HealthFitnessTab, CommunityWearablePromptsScreen |

## Tests run (local, heavy.sh, --runInBand, targeted only)
- Final at 0b733fb: 18 suites, 208 tests passed (ConnectProviderSheet, .accountSwitch, .buildSwitch, ConnectionsScreen, WearablesShell, onDeviceCopy, onDeviceSync, sessionFence, healthConnectBuildGuard, healthKitSyncService, healthConnectSyncService, useWearableConnections, clientWearablePromptsRoute, coachCommunityWearablePromptsFlagOff, HealthFitnessTab, CommunityWearablePromptsScreen, androidHealthConnectConfig, skeleton).
- Failing-before: same new tests against 54916fa sheet/orchestrator/fence/sync/shell/connections code: 8 failures (accountSwitch x3, ConnectionsScreen x2, WearablesShell x3).
- eslint on changed files: clean. `node scripts/check-expected-env.js`: OK. Local tsc skipped (operator OFFLOAD TO CI); CI runs it.
- package.json / lockfile unchanged.

## CI at head 0b733fb
All green at 0b733fb: Typecheck, lint, test (run 37059013294, includes tsc and full suites) pass; Analyze (javascript-typescript) pass; Analyze (actions) pass; CodeQL pass.

## Play Console health declaration (owner action, nothing filed)
1. Health apps declaration form (Play Console > App content > Health apps / Health Connect): app purpose = personal training and coaching (fitness, recovery); declare each Health Connect read permission with its use:
   READ_STEPS, READ_ACTIVE_CALORIES_BURNED, READ_HEART_RATE, READ_RESTING_HEART_RATE, READ_VO2_MAX, READ_EXERCISE, READ_DISTANCE, READ_WEIGHT, READ_BODY_FAT, READ_BLOOD_PRESSURE, READ_SLEEP, READ_HEART_RATE_VARIABILITY, READ_OXYGEN_SATURATION, READ_RESPIRATORY_RATE, READ_BODY_TEMPERATURE (these 15 are read by the sync).
2. Round 4b removed READ_BASAL_BODY_TEMPERATURE, READ_TOTAL_CALORIES_BURNED and READ_HEALTH_DATA_IN_BACKGROUND (never read). The manifest now declares exactly the 15 above (pinned by healthPlatformConfig test). Samsung `READ_ADDITIONAL_HEALTH_DATA` and `ACTIVITY_RECOGNITION` remain declared; neither is Health Connect, but reviewers may ask about them.
3. Privacy policy URL that covers health data: what is read, that it is shared with the client's coach for personal training, retention, deletion (account deletion; backend #608), no sale, no ads use.
4. Data safety form: Health and fitness data collected + shared with the coach (service provider), encrypted in transit, deletion on request.
5. Permission rationale: Android 14 `VIEW_PERMISSION_USAGE` alias exists but opens the app home, not a dedicated privacy screen; Play review may ask for a dedicated screen (owner decision).
6. Requires a new Android clinic binary (`eas build --profile clinic`); never via OTA. Internal testing works before approval; reviewed tracks need the approved declaration.

## Launch-flag manifest entries needed (not edited)
- Backend: `FEATURE_WEARABLES_INGEST_POST=true` - only after backend #608 deploys (C-317-3) and after the owner device pass.
- Backend: `FEATURE_COMMUNITY_WEARABLE_PROMPTS=true` (server flag `coach_community_wearable_prompts`, coach role only).
- Mobile EAS clinic: `EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS=true` (not set by this PR); `TGP_ANDROID_HEALTH_CONNECT=1` (set by this PR); do NOT set `EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS` (no box-2 consent check; coach-side WearableInsightPanel AI is a separate surface not changed here).

## Open risks
- Check-then-send: the fence is checked before each request, not atomically; a sign-out in that millisecond window can send one batch for the account that started the read. It cannot land in another account (connection id ownership, backend 403).
- If the session changes while the register request is in flight, the server can hold an empty connected row for the new account (no local grant, nothing read); it shows Not syncing here + Reconnect.
- Closing the sheet mid-import stops it; it continues the next time Health opens.
- Android: if every HC permission was revoked, the Health-open refresh asks again (existing behaviour).
- No device run; no `expo prebuild`. Owner device pass is the proof.

## Decisions needed (owner)
1. Approve Health Connect in the clinic binary (`TGP_ANDROID_HEALTH_CONNECT=1`) and file the Play health declaration.
2. Remove the 3 unused HC permissions before filing, or keep and justify.
3. Ingest flip order: after #608 deploy.
4. Whether to add a disconnect confirm (C-317-4).

Worktree removed after the run; disk check below.
- Worktree removed; df -h /: 73% used.

## Fix round 4b (operator rulings 2026-10-02 13:16)
- Rulings: (1) Health Connect ON in clinic: approved; Play items stay in this report. (2) remove 3 unused HC permissions: done. (5) disconnect confirm: done. (3)/(4) accepted.
- Head **58c2d53** on #317 (from 0b733fb).
- Tests (heavy.sh, --runInBand): ConnectionsScreen, healthPlatformConfig, androidHealthConnectConfig: 3 suites / 55 passed; failing-before at 0b733fb: 12 failures. eslint --max-warnings=0 clean on changed files.
- CI at 58c2d53: Typecheck, lint, test (run 37060528148, tsc + full suites) pass; Analyze (javascript-typescript) pass; Analyze (actions) pass; CodeQL pass.
- PR body: "Fix round 4b" table appended; flags table and open risks updated.

## Independent GPT-6.1 Sol re-audit — AUD-SOL-5

- Exact audited head **`58c2d53fa061071e193e5e3b5f981209425e9e0c`**, **REQUEST CHANGES**, **A/B/C 0/3/2**, comment **5961170156**; the optional C findings are inherited from same-head Opus, not duplicated. [Durable verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- Prior narrow A-317-1 account-switch-through-prompt and B-317-2 incomplete-import UI defects are closed; B-317-5 reconnect, C-317-4 confirmation/failure handling and exact Health Connect permission-set equality are verified. [Dispositions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- **B-317-6:** while the initial identity-cache read is pending, closing or unmounting finds no fence to cancel; the late continuation creates and installs one, still prompting/registering/granting/syncing for the original user. Both independent composition assertions failed; minimal fix is a synchronous attempt epoch invalidated on close/unmount/provider change before the first await. [Cancellation finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- **B-317-7:** logout during native Steps page one still permits page two plus HeartRate and Weight; independent real-service/client/fence probe observed four native calls rather than one, while confirming later session rejection and unchanged progress. Thread mandatory cancellation into each page/type and do not swallow session-stop exceptions as ordinary per-type failures. [Sign-out stop finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- **B-317-8:** OAuth start 401 and 500 both become internet advice, without login recovery or an unknown-error reference/support/reporting path; both independent component assertions failed. Keep status/code and map actionable known failures plus safe unknown reporting. [Coded-error finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- Existing targeted run **16 suites / 208 passed**; independent run **5 expected failing assertions**, not setup failures; all three required checks green at the posted head; the carried main merge is not pure and its resolution seams were reviewed. [Verification and exact commands](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- Evidence: `ops/evidence/AUD-SOL-5-112/mobile-317-r4-verdict.md`, `317-targeted.log`, `317-independent-probes.log`, `aud-sol5-wearables-r4.test.tsx`, `jest317.config.cjs`, `317-posted-head-ci.json`, `317-merge-seam.txt`, `317-merge-resolution.diff`, `mobile-317-r4-own.diff`.

## HANDOFF FOR AGENT 113

- **mobile #317** — head `58c2d53fa061071e193e5e3b5f981209425e9e0c`; **REQUEST CHANGES 0/3/2**; comment **5961170156**. [Exact-head verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)
- **NOT AUDITED: none in this assigned wearables re-audit.** This head is not dual-approved despite same-head Opus approval because the three demonstrated Sol B findings remain open. [Sol verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156), [Opus approval](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995)
- Preserve backend #608-before-ingest, D2 wearable-AI-off, fresh clinic binary/device pass and Play declaration release gates; remaining Samsung/activity permissions are Opus C-317-5, release ordering C-317-6. [Inherited gates](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995)
- No candidate-source edits, push, merge, dispatch or production action. Worktree `wt/aud-sol5-317` retained, not removed: higher-priority workspace preservation instruction prohibits cleanup; this is separate from the builder's earlier cleanup above.
