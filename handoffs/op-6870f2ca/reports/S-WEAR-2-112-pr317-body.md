## Tier header

- **Tier:** T4
- **Why:** Client health data path end to end (Apple Health on iOS, Health Connect on Android): permissions, native config plugin (MainActivity + manifest), history import, the ingest wire contract (no body `userId`), and what the Health and Sleep views show. Also hides an AI surface that conflicts with owner decision D2.
- **T4 trigger scan:** health data - yes; cross-account data isolation on a shared phone (local Connect authorization, session fence, sign-out sweep) - yes; identity in request body removed - yes; native config / permissions (needs a new binary) - yes; AI processing surface gated - yes; package.json / lockfile - no; new dependency - no.
- **T3 trigger scan:** new feature flag (`EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS`, default off, in no EAS profile); connect sheet copy; round 3: `eas.json` clinic profile sets `TGP_ANDROID_HEALTH_CONNECT=1` (native, needs a new Android binary); new coach route `ClientWearablePrompts` behind `featureFlags.communityWearablePrompts` + server flag; error copy for every on-device failure.
- **Bounded T1:** comments, test updates.
- **Canonical builder:** Claude Opus 5.5
- **Parent owner:** operator 590e4a5b
- **Acceptance evidence:** see Tests below; shared contract fixture `contracts/wearables-ingest-v1.fixture.json`, sha256 `3c8701f9f9f592a188115bb6eea63b0417d38eba306d238465ac02de51579cfb`, pinned here and in the backend PR.
- **Promotion triggers:** two independent audits required (Claude Opus 5.5 + GPT-6.1 Sol). Builder does not audit own change.

Base: rebased on main `53447a3` (Crisp #316). Round 2 head `c7e35d8`. Round 3: merged main `2c17c241` (merge commit `54916fa`, resolution only, no rebase) fix round `0b733fb`, and fix round 4b `58c2d53` (head).

Backend counterpart: BradleyGleavePortfolio/growth-project-backend#623 (branch `agent/clinic/s14-wearables-be`). Merge and deploy the backend first.

## What was broken (S14 trace at main `090bbf9`)

1. Both normalizers put `userId` in every sample; the backend strict schema rejects it (400).
2. The app never obtained a `connectionId`: no on-device registration existed, and `useHealthKitSync` / `useHealthConnectSync` were never called by any screen. Connect only asked for permission; no history import ran, and Connections stayed "Not connected".
3. Android: react-native-health-connect 3.5.3's plugin does not register `HealthConnectPermissionDelegate.setPermissionDelegate(this)` in MainActivity, so `requestPermission()` throws on every device and the sheet said access was not granted. The Android 14 `VIEW_PERMISSION_USAGE` alias was also missing.
4. `android.permission.health.READ_RESTING_HEART_RATE` was not declared although the sync reads RestingHeartRate.
5. The Connect permission sets (8 HK types, 7 HC types) differed from what the sync reads (15 each), so the first sync would prompt again.
6. Apple Health steps used `getStepCount`, which returns one day's total and ignores the import window. Hourly statistics buckets were anchored to an unfloored start, so bucket edges (and the dedup key) moved every sync. No overlap for late Watch data.
7. Health Connect: no `pageToken` pagination (one page, about 1000 records); `requestPermission` on every sync; 7-day backfill vs 30 on iOS.
8. Whole window posted in one request; the backend's default JSON limit is 100 KB (about 300 samples), so a history import would 413.
9. Sleep card returned nothing for sources that send only `SLEEP_TOTAL_MIN` (no stages).
10. `ClientWearableInsightPanel` (AI drafted, no consent check) rendered on both views, which conflicts with D2.
11. Found by the new contract test: Health Connect stamped `RESTING_HEART_RATE_BPM` with bucket HEALTH_FITNESS, but its canonical server bucket is SLEEP_RECOVERY (the backend now rejects a mismatched bucket). The Health view's Heart card also read resting heart rate from the HEALTH_FITNESS response, which never contains it, so the card was always empty; its detail link used a bucket the server rejects.

Operator APK finding (09-30 Android APK, EAS 14a58449): MainActivity.onCreate calls only `SplashScreenManager.registerOnActivity` + `super.onCreate`, never `HealthConnectPermissionDelegate.setPermissionDelegate(this)`; `requestPermission` then fails (lateinit) on Connect. Fixed by `plugins/withHealthConnectPermissionDelegate.js`; `healthPlatformConfig.test.ts` runs the plugin's real prebuild mod against that exact MainActivity.kt and asserts the import and the call right after `super.onCreate(null)`. react-native-health-connect 3.5.3's own plugin has no option for this.

## Changes

- `src/services/health/ingestBatching.ts` (new): one wire contract for both platforms. `toIngestWire` builds samples from an allow-list (no `userId` can leak). `chunkForIngest` caps each request at 250 samples and 90,000 serialized bytes. `postIngestBatches` posts sequentially, waits for Retry-After on 429 (max 60 s, 3 attempts), and rejects on anything else so the cursor is not advanced.
- Normalizers / types (`healthkit/healthKitNormalizer.ts`, `healthConnect/types.ts`, `healthConnect/healthConnectNormalizer.ts`): `userId` removed.
- `healthkit/healthKitClient.ts`: steps via `getDailyStepCountSamples` (hourly, whole window); steps and active energy `period: 60`; still-open hourly buckets (end after `until`) dropped.
- `healthkit/healthKitSyncService.ts`: no `userId`; window start = cursor minus 60 min, floored to the local hour (first run: 30 days, floored); batched post; cursor written only after every batch succeeds.
- `healthConnect/healthConnectClient.ts`: bounded `pageToken` pagination (20 pages). `healthConnectSyncService.ts`: signature `syncHealthConnect(connectionId, deps)`; checks granted permissions first and asks only when none is granted; 30-day backfill. `healthConnectIngestApi.ts`: uses the shared batcher.
- `src/api/wearablesConnectionsApi.ts`: `registerOnDevice(provider)` -> `POST /v1/wearables/connections/on-device`.
- `src/services/health/onDeviceSync.ts` (new): register -> platform sync -> batched ingest; maps Samsung Health to Health Connect; recognises the typed 503 `wearables_ingest_disabled`.
- `ConnectProviderSheet.tsx`: after the grant, runs the 30-day import with a "Bringing in your last 30 days of health data. This can take a minute." note; closes on success; plain copy for lane off and for a failed import.
- `WearablesShell.tsx`: refreshes once on open when this phone's health store is connected, then refetches. AI panel only when `featureFlags.wearableAiInsights` (default off).
- `useInvalidateWearableConnections` also invalidates the samples cache so the views refetch after a connect.
- `healthConnectNormalizer.ts`: resting heart rate bucket SLEEP_RECOVERY. `HealthFitnessScreen.tsx`: reads resting heart rate by metric from SLEEP_RECOVERY for the Heart card and opens its detail in that bucket (coach client view uses the same screen).
- `recoveryData.ts`: sleep falls back to `SLEEP_TOTAL_MIN` when there are no stages.
- `onDeviceConnect.ts`: Connect asks for the same read sets the sync reads (HK through the client's `requestAuth`, HC via `buildReadPermissions()`).
- `app.json`: `READ_RESTING_HEART_RATE`; registers `./plugins/withHealthConnectPermissionDelegate` (new, idempotent: MainActivity delegate after `super.onCreate`, Android 14 `ViewPermissionUsageActivity` alias). iOS unchanged: `react-native-health` plugin already adds the HealthKit entitlement and both usage strings.
- `src/config/featureFlags.ts`: `wearableAiInsights` (`EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS`, default false).
- `contracts/wearables-ingest-v1.fixture.json` (new): shared contract fixture.

## Round 2 changes (Sol audit A-317-1, B-317-1..4, C-317-1, C-317-2)

- **Local Connect authorization (A-317-1).** New `src/services/health/onDeviceState.ts`: AsyncStorage records under `wearables_on_device:`. `auth:<source>:<userId>` holds `{ userId, source, connectionId, grantedAt }`, written only by `connectOnDevice` after the person taps Connect on this phone and registration returns a connection. `refreshOnDevice` (Health screen open) reads the phone only when that record exists for the signed-in user AND the server still lists the SAME connection id as connected. A remote connected row alone returns `not_authorized` and reads nothing. Account B on account A's phone gets nothing until B taps Connect.
- **Session fence (A-317-1).** New `src/services/health/sessionFence.ts`: a generation counter bumped on every auth event plus a fresh read of the signed-in user id. Checked after registration, before every ingest request (`postIngestBatches` `beforeEachRequest`) and before progress is saved; a change throws `OnDeviceSessionChangedError`, so nothing read for A is sent or saved after sign-out or an account switch.
- **Retire on sign-out, deletion and disconnect.** `authActions.ts` sweeps the `wearables_on_device:` prefix (every account) on sign-out, which is also the end of account deletion; it also removes the legacy provider-global cursors (`healthkit_last_sync_at`, `health_connect_last_sync_at`, dormant `wearable:samsung-health:lastSyncAt`). Disconnecting Apple Health or Health Connect retires that source's local state.
- **Scoped progress (B-317-1).** `progress:<source>:<userId>:<connectionId>` holds per-metric (Apple Health) or per-record-type (Health Connect) `completedThrough` plus Health Connect resume tokens. The legacy global cursors are never read, so a new account or a recreated connection gets its own 30-day import.
- **Complete imports only (B-317-2).** Health Connect `readRecordsPaged` returns `nextPageToken` when it stops at 20 pages; the type stays incomplete and resumes over the same window next run (a failed resume drops the token and keeps the old progress). A native read failure keeps that type's progress while others advance. Apple Health reports failed metrics the same way. Results carry `complete`; Connect runs up to 3 passes and never reports an incomplete import as complete.
- **Sleep sessions (B-317-3).** Apple Health sleep is grouped into sessions (gap over 2 h starts a new one), overlapping sources are resolved once per minute (deep > REM > light > awake > coarse asleep), and each session emits its own stage and total records with the session's start and end, so the dedup key is stable across a full-window and an incremental read. Sessions that may be cut by the read window are deferred; the read starts 36 h before the window.
- **Kilograms (B-317-4).** `getWeightSamples` is called with `unit: 'kg'` (the native module defaults to pounds). The contract fixture now carries an Apple Health weight sample.
- **UTF-8 batching (C-317-1).** Batches are bounded by UTF-8 bytes (`utf8ByteLength`, no TextEncoder dependency); a single sample over the limit is reported and never sent.
- **Disclosure before Continue (C-317-2).** The Apple Health / Health Connect sheet shows, before Continue: "When you continue, <provider> asks for permission on this phone. We then bring in your last 30 days of <provider> data, and new data each time you open Health, so your coach can personalize your training, recovery, and check-ins." This is collection for coaching (consent box 1), not the optional AI box. It matches the existing `NSHealthShareUsageDescription` and makes no new claims.
- Removed the unused `useHealthKitSync` / `useHealthConnectSync` hooks (they bypassed the authorization and fence; no screen used them).

## Round 3 changes (Sol A-317-1 narrow + B-317-2 sheet, Opus B-317-5, lane S-WEAR-2)

- **Merge of main `2c17c241` (`54916fa`).** Kept #323's Health Connect build switch (`config/healthConnect.ts` guards, lazy native require, `disabled` outcome) together with S14 in `onDeviceConnect.ts`, `authActions.ts` (both on-device and legacy-draft sweeps), `healthConnectSyncService.ts` (`assertAndroidHealthConnectEnabled`), `ConnectProviderSheet.tsx` (`disabled` case). Registered `EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS` in `config/expected-env.json` (#624 manifest check).
- **Bind before the permission prompt (A-317-1).** `beginSessionFence` captures the auth generation synchronously, then reads the signed-in user; the sheet calls `beginOnDeviceConnect()` at the Continue tap, BEFORE `connectOnDeviceProvider` opens the native prompt, and passes that fence to `connectOnDevice(source, fence)`. The fence is checked before registration, after it, and before the local grant is recorded; any auth event (A to B, sign-out, even the same account signing in again) or closing/unmounting the sheet (`fence.cancel()`) ends the run with nothing registered, recorded, read or sent. `healthKitSyncService.sync` and `syncHealthConnect` now REQUIRE a fence, check `fence.userId === scope.userId`, and assert it before reading the phone store (after the permission screen), before every request and before saving progress.
- **Dormant Samsung uploader removed.** `samsungHealthSyncService` + `useSamsungHealthSync` (no screen used them; they posted to the ingest path with no fence or per-account binding). Samsung Health data reaches the app only through Health Connect.
- **Truthful partial imports in the sheet (B-317-2).** Only a complete import closes the sheet. Partial: "<name> is connected. We brought in part of your last 30 days. Tap Continue import to bring in the rest..." with a Continue import button running `resumeOnDeviceImport(source, connectionId, fence)` (same person, same connection, local grant required). All reads failing: "...we couldn't read your history yet. Check that <name> access is turned on..., then tap Try again." The Health screen refresh no longer discards an incomplete or failed run: it shows what happened with Try again.
- **Reconnect when not syncing here (B-317-5).** `useLocalOnDeviceAuthorization(source)` reads app storage only (never the health store). A connected server row without this phone's Connect for the signed-in person shows the badge "Not syncing here", the note "<name> is not syncing on this phone. Tap Reconnect to continue." and a Reconnect action that opens the Connect sheet; the Health screen shows the same note with Reconnect (to Connections).
- **Error copy.** `onDeviceCopy.ts` maps every failure: account changed, signed out, Health Connect permission denied / not ready, no network (register vs import), 401, 403 `wearables_connection_forbidden`, other 403, 429, 503 lane off. Anything else shows "Reference <8 chars>" (server request id, else a fresh one) and hello@thegrowthproject.app, and is reported via `reportUnexpected` (status, code, reference only; no health values).
- **Health Connect returns in the clinic build.** `eas.json` `clinic.env.TGP_ANDROID_HEALTH_CONNECT = "1"`; `preview` and `production` stay `"0"`. Needs a new Android binary (never an OTA) and the Play Console Health apps declaration before a reviewed Play track.
- **Coach wearable prompts reachable.** `CommunityWearablePromptsScreen` was registered only inside the Community navigator and nothing navigated to it. ClientsStack now registers `ClientWearablePrompts` behind `featureFlags.communityWearablePrompts`; the client Health tab shows "Wearable coaching prompts" only when that build flag AND the server flag `coach_community_wearable_prompts` are on, and the screen has a Back control (the stack header is hidden there).

## Tests

- `src/services/health/__tests__/ingestContract.test.ts` (new): builds the request bodies from the real HK + HC normalizers, the wire serializer and the batcher; byte-equal to the committed fixture; sha256 pinned (same pin in backend `test/wearables/ingest-contract.spec.ts`); no `userId`, allow-listed keys only; covers both providers and the metrics the views read. Stable across TZ=UTC, Asia/Tokyo, America/New_York.
- New: `ingestBatching.test.ts`, `onDeviceSync.test.ts`, `healthPlatformConfig.test.ts` (every HC record type has its READ_* permission; plugin order; delegate insertion idempotent; alias; HK plugin strings).
- New: `HealthFitnessScreen.rhr.test.tsx`.
- Updated: HK client / sync / normalizer, HC ingest / sync / normalizer, both sync hooks, ConnectProviderSheet (import, lane off, failure, Samsung), WearablesShell (flag off hides AI panel; refresh on open), recoveryData.

Round 2 tests: new `onDeviceState.test.ts`, `sessionFence.test.ts`; rewritten `onDeviceSync.test.ts` (connect records authorization; refresh refuses without local Connect, for another account, for a different connection id, for a non-connected row, after sign-out; session change during registration; bounded passes), `healthKitSyncService.test.ts` and `healthConnectSyncService.test.ts` (per-account and per-connection windows, legacy cursor ignored, truncated read resumes, failed read keeps progress, fence stops upload); `healthConnectClient.test.ts` (`readRecordsPaged` token, resume, failure); `healthKitClient.test.ts` (kg request with a pound-default native mock through the normalizer, failed metrics, sleep lookback); `healthKitNormalizer.test.ts` (one record set per night, overlap counted once, full-window vs incremental identical, deferred edges); `ingestBatching.test.ts` (UTF-8 bytes, oversized); `ingestContract.test.ts` (both providers carry weight in kg); `authActions.test.ts` (sign-out sweeps the on-device keys); `ConnectProviderSheet.test.tsx` (disclosure before Continue); `WearablesShell.test.tsx` (`not_authorized` does not refetch).

Commands (through ops/heavy.sh):
```
npx jest --runInBand src/services/health src/screens/client/wearables src/services/__tests__/authActions.test.ts src/services/__tests__/authActions.signOut.test.ts
npx jest --runInBand --forceExit src/hooks/useWearableConnections.test.tsx
npx tsc --noEmit -p tsconfig.json
```
Results at `c7e35d8`: jest 38 suites / 427 tests passed, plus useWearableConnections 1 suite / 4 tests passed (WearablesShell re-run after the last edit: 8 passed); tsc exit 0; eslint (changed files) exit 0.

Round 3 tests (failing before on `54916fa` code where the behaviour is new: the A-317-1 composition, B-317-5 and B-317-2 refresh tests fail on the old sheet/orchestrator/shell, 8 failures):
- New `ConnectProviderSheet.accountSwitch.test.tsx`: REAL sheet + orchestrator + fence + auth events + local-authorization storage, deferred native prompt. A to B, sign-out, same-account re-login while the prompt is open: zero registration, zero local grant for A or B, zero phone read/POST. Control: the tapping person is registered, authorized and imported.
- `ConnectProviderSheet.test.tsx`: fence taken before the prompt, cancelled on close (no import after); partial import keeps the sheet open and Continue import resumes with the same fence; every read failing shows Try again; resume still incomplete (pass bound) stays truthful; register network failure vs unexpected import failure copy.
- `onDeviceSync.test.ts`: `it.each` A to B / sign-out / re-login between Continue and register; auth event during registration stops before the local grant; cancelled run; `OnDeviceStepError` steps; refresh auth event during user read; `resumeOnDeviceImport`; `isConnectedButNotSyncingHere`.
- `sessionFence.test.ts` (`beginSessionFence`, `cancel`), `healthKitSyncService.test.ts` / `healthConnectSyncService.test.ts` (fence of another person reads nothing; session change during the permission screen reads nothing).
- `ConnectionsScreen.test.tsx` (Not syncing here + Reconnect opens the sheet; nothing opened before the tap), `WearablesShell.test.tsx` (not-syncing note + Reconnect, partial refresh + Try again re-runs, unexpected failure shows reference + support and reports), new `onDeviceCopy.test.ts`.
- Coach prompts: new `navigation/__tests__/clientWearablePromptsRoute.test.ts`, `HealthFitnessTab.test.tsx` (entry only with handler; tap opens), `CommunityWearablePromptsScreen.test.tsx` (Back).
- `androidHealthConnectConfig.test.js` (clinic opts in), `ConnectProviderSheet.buildSwitch.test.tsx`, `healthConnectBuildGuard.test.ts`.

Round 3 local at `0b733fb` (heavy.sh, `--runInBand`, targeted per operator OFFLOAD TO CI): 18 touched suites, 208 tests passed; authActions suites unchanged in round 3; eslint on changed files clean; `node scripts/check-expected-env.js` OK. Local tsc skipped per operator; CI runs tsc and the full suites.

## Production flags and settings to flip (owner; not flipped here)

| Where | Name | Value | Notes |
|---|---|---|---|
| Backend launch-flag manifest / Fly secret | `FEATURE_WEARABLES_INGEST_POST` | `true` | Only after backend #623 is deployed (merged) AND backend #608 (account-deletion fan-out covering wearable tables) is deployed (C-317-3), and after the device pass. Off = the app shows the "not switched on yet" copy and registers nothing. |
| Backend launch-flag manifest | `FEATURE_COMMUNITY_WEARABLE_PROMPTS` | `true` | Server flag `coach_community_wearable_prompts` (coach role only) for the coach prompts screen. |
| EAS `clinic` profile | `EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS` | `true` | Build flag that registers the coach route + Health tab entry. Not set by this PR (owner adds it with the manifest flip). |
| EAS `clinic` profile | `TGP_ANDROID_HEALTH_CONNECT` | `1` | Set by this PR. New Android binary required; never an OTA. Play declaration first for reviewed tracks. |
| EAS `clinic` profile | `EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS` | leave unset | Keep the AI panel off until `wearable_insight.*` honours the box-2 consent (R2b). |
| New binaries | iOS + Android clinic builds | `eas build --profile clinic` | Native changes (Android plugin, permissions, alias, HC switch). |
| Play Console | Health apps declaration + Data safety | 15 READ_* types (round 4b removed 3 unused) | Material kept in the lane report. |

## Device test script

**Before:** backend PR deployed; flag still unset for step 1, then set.

**iOS (TestFlight, clinic build, iPhone with Apple Health data, ideally an Apple Watch):**
1. Sign in as a test client. More > Connections > Apple Health > Continue. With the flag unset you should see "Health data import isn't switched on yet. Your coach will let you know when it is ready." Close.
2. Owner sets `FEATURE_WEARABLES_INGEST_POST=true`. Repeat Connect. The Apple Health sheet lists Steps, Active Energy, Resting Heart Rate, Heart Rate, HRV, Sleep, Workouts, Weight, Body Fat, Blood Pressure, VO2 Max, Oxygen Saturation, Respiratory Rate, Body Temperature. Turn all on, Allow.
3. The sheet shows "Bringing in your last 30 days of health data..." then closes. Connections shows Apple Health connected with a recent last synced time.
4. More > Health: steps and active energy for the last 7 days match Apple Health within normal rounding; resting heart rate shows. No AI insight card appears.
5. Switch to Recovery: last night's sleep with stages (Watch) or total only (iPhone-only); HRV trend if a Watch is worn.
6. Walk about 200 steps, wait one full clock hour, reopen Health: the finished hour appears and earlier days do not double.
7. Disconnect Apple Health in Connections, then reconnect: no duplicate days.
8. Settings > Health > Data Access > The Growth Project: turn one type off; the app keeps working for the others.

**Android (internal testing, clinic build, Android 14 preferred plus one Android 13 or lower device with the Health Connect app):**
1. Phone has a screen lock and Health Connect available (Android 14 built in; Android 13 or lower: install Health Connect from Play). Have data from Google Fit, Samsung Health or a watch app writing into Health Connect.
2. Flag unset: More > Connections > Health Connect > Continue shows the "not switched on yet" copy.
3. Flag set: Continue opens the Health Connect permission screen listing the 15 read types (Resting heart rate included). Allow all. The sheet shows the import note, then closes; Connections shows connected.
4. In the permission screen (or Settings > Health Connect > App permissions > The Growth Project) tap the privacy / "read privacy policy" link: the app opens (Android 14 via the permission usage alias; Android 13 via the rationale filter).
5. More > Health and Recovery show the last 7 days as in step 4 and 5 for iOS. No AI insight card.
6. Samsung Health row: Connect routes through Health Connect and imports the same data, no second permission screen if already granted.
7. Reopen Health after an hour: new data appears, no doubled days. Revoke all permissions in Health Connect, reopen Connect: the permission screen appears again.

**Round 2 checks (both platforms):**
1. Before Continue, the sheet shows the 30-day and coaching sentence.
2. Sign out, sign in as a second test client on the same phone, open More > Health without tapping Connect: no import runs (backend: no new `WearableSample` rows for the second client). Tap Connect: a fresh 30-day import runs for the second client only.
3. Sign back in as the first client: Health does not import until Connect is tapped again (sign-out cleared this phone's authorization).
4. Apple Health weight shows in kg matching the Health app (for example 180 lb shows about 81.6 kg).
5. Two nights of Watch sleep show as two separate nights on Recovery, not one long night.

Report failures with the device model, OS version, and the time of the attempt.

## Fix round

| Finding ID | Change | Commit | Test |
|---|---|---|---|
| A-317-1 r3 (Sol) permission prompt awaited before user captured | `beginSessionFence` at Continue, before the prompt; fence carried through register, local grant, import; sheet cancels on close/unmount; HK/HC sync require a fence and check scope user + current before reading | 0b733fb | ConnectProviderSheet.accountSwitch (A to B, sign-out, re-login), ConnectProviderSheet, onDeviceSync, sessionFence, HK/HC sync |
| A-317-1 r3 dormant Samsung uploader (no fence) | removed `samsungHealthSyncService` + `useSamsungHealthSync` | 0b733fb | healthConnectBuildGuard (no Samsung path) |
| B-317-2 (Sol, sheet + refresh) | only complete import closes; Continue import / Try again via `resumeOnDeviceImport`; refresh shows partial/failed with Try again | 0b733fb | ConnectProviderSheet (partial, all fail, pass bound), WearablesShell, onDeviceSync |
| B-317-5 (Opus) silent not_authorized after sign-out | Not syncing here badge + note + Reconnect (Connections), note + Reconnect (Health) | 0b733fb | ConnectionsScreen, WearablesShell, onDeviceSync (`isConnectedButNotSyncingHere`) |
| C-317-3 (Opus) release ordering | documented in flags table: no ingest flip before #608 deploys; AI flag stays off | 0b733fb (body) | n/a |
| C-317-4 (Opus) disconnect without confirm | done in fix round 4b (see below) | 58c2d53 | ConnectionsScreen |
| Lane: generic errors | `onDeviceCopy.ts` status / code mapping, reference + support + Sentry | 0b733fb | onDeviceCopy, ConnectProviderSheet, WearablesShell |
| Lane: Health Connect returns | clinic `TGP_ANDROID_HEALTH_CONNECT=1` | 0b733fb | androidHealthConnectConfig, buildSwitch |
| Lane: orphaned coach prompts | `ClientWearablePrompts` route + Health tab entry + Back | 0b733fb | clientWearablePromptsRoute, HealthFitnessTab, CommunityWearablePromptsScreen |
| Merge main 2c17c241 | resolution only | 54916fa | targeted suites + CI |
| A-317-1 remote connected row read the phone | local Connect authorization keyed by user + source, bound to connection id; session fence before each request and save; sign-out / disconnect retire | c7e35d8 | onDeviceSync, onDeviceState, sessionFence, HK/HC sync, authActions, WearablesShell |
| B-317-1 provider-global progress | progress keyed by account + connection + provider; legacy cursors never read, removed at sign-out | c7e35d8 | healthKitSyncService, healthConnectSyncService, onDeviceState, authActions |
| B-317-2 truncated / failed reads marked complete | HC resume token; failed types keep progress; `complete` flag; bounded passes | c7e35d8 | healthConnectClient, healthConnectSyncService, healthKitSyncService, healthKitClient, onDeviceSync |
| B-317-3 multi-night sleep total | per-session records, overlap resolved once, edge sessions deferred | c7e35d8 | healthKitNormalizer, ingestContract |
| B-317-4 pounds stored as kg | `unit: 'kg'` on getWeightSamples; fixture weight sample (new sha256 in both repos) | c7e35d8 | healthKitClient, ingestContract |
| C-317-1 string length vs UTF-8 bytes | UTF-8 byte counter; oversized samples never sent | c7e35d8 | ingestBatching |
| C-317-2 30-day scope shown too late | disclosure on the sheet before Continue | c7e35d8 | ConnectProviderSheet |
| S14-1 body userId | removed from normalizers; allow-list wire builder | f63da34 | ingestContract, ingestBatching, HK/HC sync + normalizer tests |
| S14-2 no connectionId / no import | registerOnDevice + onDeviceSync; sheet runs import; shell refresh on open | f63da34 | onDeviceSync, ConnectProviderSheet, WearablesShell |
| S14-4 HC permission delegate + Android 14 alias | local config plugin | f63da34 | healthPlatformConfig |
| S14-5 READ_RESTING_HEART_RATE | app.json | f63da34 | healthPlatformConfig |
| S14-6 permission sets differ | Connect uses the sync read sets | f63da34 | onDeviceConnect |
| S14-7 HK steps / bucket edges / overlap | hourly samples, floor, drop open bucket, 60 min overlap | f63da34 | healthKitClient, healthKitSyncService |
| S14-8 HC pagination | bounded pageToken loop | f63da34 | healthConnectClient |
| S14-9 HC re-prompt each sync | granted first | f63da34 | healthConnectSyncService |
| S14-10 one large request | byte and count bounded batches, 429 retry | f63da34 | ingestBatching, healthKitSyncService |
| S14-12 sleep total only | SLEEP_TOTAL_MIN fallback | f63da34 | recoveryData |
| S14-11 RHR bucket / empty Heart card | HC bucket SLEEP_RECOVERY; screen reads RHR from its bucket | f63da34 | ingestContract, healthConnectNormalizer, HealthFitnessScreen.rhr |
| S14-13 AI panel vs D2 | `wearableAiInsights` default off | f63da34 | WearablesShell |

## Fix round 4b (operator rulings 2026-10-02)

| Finding ID | Change | Commit | Test |
|---|---|---|---|
| Least privilege (ruling 2) | `app.json` no longer declares `READ_TOTAL_CALORIES_BURNED`, `READ_BASAL_BODY_TEMPERATURE`, `READ_HEALTH_DATA_IN_BACKGROUND` (never read; no background sync). The manifest declares exactly the 15 read permissions the sync reads. Docs table updated (also lists `READ_RESTING_HEART_RATE`). | 58c2d53 | `healthPlatformConfig.test.ts` "declares exactly the Health Connect read permissions the sync reads" (fails on 0b733fb) |
| C-317-4 (Opus; ruling 5) disconnect without confirm | `DisconnectConfirmDialog`: "Disconnect <name>?" + "The Growth Project stops receiving new <name> data (Apple Health / Health Connect: bringing in new data from this phone), and your coach stops seeing new <name> data. Data already shared stays with your coach. You can connect <name> again at any time." Cancel is the default (first, primary style; back button and tapping outside cancel). `disconnectCopy.ts` failure copy keeps the dialog open: no network, 429 (retry); 401, 403 (no retry button); 404 closes and refreshes ("already disconnected"); anything else shows "Reference <8>" + hello@thegrowthproject.app and reports `wearables.disconnect` to Sentry (status, code, reference only). | 58c2d53 | `ConnectionsScreen.test.tsx` confirm suite: asks first, Cancel keeps connected, Cancel first, confirm + success closes, Apple Health copy names this phone, network/429/401/403, 404, unexpected (11 fail on 0b733fb) |

Round 4b local (heavy.sh, `--runInBand`): `ConnectionsScreen.test.tsx`, `healthPlatformConfig.test.ts`, `androidHealthConnectConfig.test.js`: 3 suites, 55 tests passed; failing-before at 0b733fb code: 12 failures. eslint (`--max-warnings=0`) on changed files clean. CI at 58c2d53: Typecheck, lint, test (run 37060528148, tsc + full suites) pass; Analyze (javascript-typescript) pass; Analyze (actions) pass; CodeQL pass.

## Open risks

- The session fence is checked before each request, not atomically with it: a sign-out in the few milliseconds between the check and the request could still send one batch for the account that was signed in when the read started. It cannot land in another account: every sample names the old user's connection id, and the backend rejects a connection id the JWT user does not own (403).
- A sleep session that ends within 2 h of the read window end waits for the next open (a Watch that syncs very late can delay a night by one open).
- Apple Health reads one window per pass (no paging in react-native-health); a very large first import relies on the library returning everything.
- Round 3: if the session changes while the register request is in flight, the server may hold an empty connected row for the new account (no local grant, nothing read); that row shows Not syncing here + Reconnect.
- Round 3: closing the sheet mid-import stops the import (cancelled fence); it continues the next time Health opens.
- Round 3: on Android, if every Health Connect permission was revoked, the Health-open refresh asks for permission again (existing behaviour).
- No device run in this round; the owner's pass below is the proof.

- Native changes are covered by unit tests of the plugin functions only; no `expo prebuild` ran here. The owner's Android pass (step 3) is the real proof of the delegate.
- Android 13 rationale opens the app home, not a dedicated privacy policy screen. Play review may ask for one (owner decision).
- Sleep onset / wake card stays empty for on-device sources (they do not send `SLEEP_ONSET_ISO` / `SLEEP_WAKE_ISO`).
- No background sync: data refreshes when the client opens Health (owner tutorial covers this).

 
## Auditor handoff addendum — not a replacement PR body

The independent AUD-SOL-5 exact-head verdict at `58c2d53fa061071e193e5e3b5f981209425e9e0c` is **REQUEST CHANGES, A/B/C 0/3/2**, comment **5961170156**; pending-attempt cancellation, post-logout native page/type reads, and cloud coded errors remain must-fix, despite closure of the earlier account-switch/partial-import findings. [Sol audit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)

## HANDOFF FOR AGENT 113

mobile #317 — `58c2d53fa061071e193e5e3b5f981209425e9e0c` — **REQUEST CHANGES 0/3/2** — comment **5961170156**; **NOT AUDITED: none** in this re-audit. [Durable verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156)

Detailed independent evidence and operational prerequisites are appended to `ops/reports/S-WEAR-2-112.md`; this local addendum was not used to edit the GitHub PR body.
