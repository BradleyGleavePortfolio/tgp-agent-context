# PR-HK-2.b — Android Health Connect on-device connector — R3 (re-)audit

**Verdict:** **CLEAN** — zero P0 · zero P1 · zero P2 · zero P3. The single R1 blocker (P1 Finding 1 — broken iOS graceful no-op under the project's enabled new architecture) is **fully resolved** by the R2 fix (lazy, platform-guarded `require`), proven by a real regression test and corroborated against the library's actual eager-evaluation behavior. All five mobile gates are green; the write-set and commit hygiene remain clean.

**Repo:** `growth-project-mobile`
**PR:** [#220](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/220)
**Audited head SHA (R3):** `a69349598bf81520743e13e787ecabf1cc4c576e` (`a693495`)
**Previous head SHA (R1/R2):** `d6f5bdea5d44feb18c1c29c797921ec30a017c4b` (`d6f5bde`)
**Branch:** `hk/PR-HK-2.b-healthconnect`
**Base:** `main` (PR-HK-CFG, #218; current `origin/main` @ `3b394f7`, base merge-point `90c033df`)
**R2 fixer report reviewed:** `_r2_logs/PR-HK-2b_R2_SUMMARY.json` (verify, not trust)
**Auditor:** R3 (auditor ≠ builder; R55 SHA-pinned in an **isolated git worktree**, no rebase/pull). Opus 4.8.

---

## R2 → R3: what changed and was it verified

The R2 fix added **one new commit** (`a693495`) on top of the R1-audited `d6f5bde`. The delta (`git diff d6f5bde..a693495`) is **4 files / +270 / −10**, all inside this PR's existing write-set:

```text
src/services/health/healthConnect/healthConnectClient.ts            +119 / −10   (lazy require + getHealthConnectStatus)
src/services/health/healthConnect/index.ts                          +2           (export status type + fn)
src/services/health/healthConnect/__tests__/healthConnectClient.test.ts  +20      (status coverage)
src/services/health/healthConnect/__tests__/healthConnectIosNoop.test.ts +139 NEW  (iOS no-op regression)
```

### R1 Finding 1 (P1) — VERIFIED RESOLVED

**Root cause (re-confirmed).** `react-native-health-connect@3.5.3` resolves its native module in an eagerly-evaluated object literal (`node_modules/react-native-health-connect/lib/commonjs/index.js`):

```js
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const HealthConnectModule = Platform.select({
  android: isTurboModuleEnabled ? require('./NativeHealthConnect').default : NativeModules.HealthConnect,
  ios: moduleProxy(PLATFORM_NOT_SUPPORTED_ERROR),
  default: moduleProxy(PLATFORM_NOT_SUPPORTED_ERROR),
});
```

JavaScript evaluates **every** object-literal value before `Platform.select` picks one, so the `android` value — `require('./NativeHealthConnect').default` — runs on iOS too when `isTurboModuleEnabled` is true. `NativeHealthConnect.js:9` is `TurboModuleRegistry.getEnforcing('HealthConnect')`, which **throws** on iOS. I re-confirmed both files at the pinned SHA, and confirmed the project ships the new architecture: the generated `android/gradle.properties:38` is `newArchEnabled=true`, and the stack is Expo SDK `~56.0.4` / react-native `0.85.3` (new arch default-on) → `global.__turboModuleProxy` is present at runtime. So the hazard was real, not theoretical.

**The fix (verified correct).** `healthConnectClient.ts` no longer statically imports the library. The library is now reached only through `loadHealthConnectLib()`, an inline `require('react-native-health-connect')` called **after** `assertSupported()` confirms `Platform.OS === 'android'` (client `:69-75`, `:201-263`). On iOS/web the library module is therefore never evaluated, so `getEnforcing` is never triggered — the connector no-ops gracefully as the doctrine requires. Confirmed the old `d6f5bde` client had the static top-level import (`git show d6f5bde:…healthConnectClient.ts`), so this is a genuine behavioral change, not a no-op edit.

### Regression test exercises the real failure mode — VERIFIED

`__tests__/healthConnectIosNoop.test.ts` (new) models the exact iOS hazard: its `jest.mock('react-native-health-connect', () => { throw new Error(HC_EAGER_THROW); })` factory throws **the instant the module is evaluated** — precisely what the real library does on iOS under new arch. With `Platform.OS` forced to `'ios'` and `jest.isolateModules`, it asserts (1) importing the barrel and the client does **not** throw, (2) `getHealthConnectStatus()` returns the structured `platform-unsupported` shape, and (3) every public method rejects with `HealthConnectUnsupportedError` — not a silent empty result, and not the eager native throw.

I verified this test **genuinely fails against the old static-import code**: at `d6f5bde` the client imports `react-native-health-connect` at module scope, so `require('../healthConnectClient')` under this mock would throw `HC_EAGER_THROW` at evaluation — failing assertions (1)/(2)/(3). Against the fixed lazy-require code the test passes (observed PASS in the full suite). The test is real, not a tautology.

### `getHealthConnectStatus()` — VERIFIED a real, polished, user-visible state path

`getHealthConnectStatus()` (client `:164-182`) returns a structured `HealthConnectStatus { supported, platform, reason, message }` and **never touches the native library**, so it is safe to call on every platform. On iOS it returns `{ supported: false, platform: 'ios', reason: 'platform-unsupported', message: 'Health Connect is available on Android only. On this device, connect Apple Health instead.' }` — a genuine, render-ready state that points the user to the sibling Apple Health path, **not** a silent empty-data fallback. The `reason` enum (`'supported' | 'platform-unsupported'`) gives the UI a machine-readable branch; the `message` is doctrine-compliant copy (no mascot, no medicalization, no emoji, no "coming soon"). Exported from the barrel (`index.ts:16,18`) for UI consumption. Covered by both the new iOS no-op test and two added cases in `healthConnectClient.test.ts` (android-supported / ios-platform-unsupported with a `/Android only/i` assertion).

---

## Scope / write-set verification

PASS. `git diff origin/main...a693495 --name-only` is **14 files / +2331 / −0**, all confined to the documented connector folder + the one allowed additive hook (the R3 delta vs R1's 13 files is exactly the **one new regression test**):

```text
src/hooks/useHealthConnectSync.ts
src/hooks/useHealthConnectSync.test.tsx
src/services/health/healthConnect/healthConnectClient.ts
src/services/health/healthConnect/healthConnectNormalizer.ts
src/services/health/healthConnect/healthConnectSyncService.ts
src/services/health/healthConnect/healthConnectIngestApi.ts
src/services/health/healthConnect/types.ts
src/services/health/healthConnect/errors.ts
src/services/health/healthConnect/index.ts
src/services/health/healthConnect/__tests__/healthConnectClient.test.ts
src/services/health/healthConnect/__tests__/healthConnectNormalizer.test.ts
src/services/health/healthConnect/__tests__/healthConnectSyncService.test.ts
src/services/health/healthConnect/__tests__/healthConnectIngestApi.test.ts
src/services/health/healthConnect/__tests__/healthConnectIosNoop.test.ts   ← R2-added
```

No mutex violations: `App.tsx`, `RootNavigator.tsx`, theme tokens, `app.json`, `package.json`, and other connectors' folders are **untouched** in `main...HEAD`. The Health Connect `android.permission.health.READ_*` strings live in `app.json` and were landed by base PR-HK-CFG (#218) — correctly out of this PR's write-set. (Prebuild transiently rewrote `package.json`; this auditor reverted it immediately and ran from an isolated worktree, so the PR diff is unaffected.)

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| 1 — Types | `npx tsc --noEmit` | **PASS, exit 0** (`PR-HK-2b_R3_tsc.log`) |
| 2 — Lint | `npx eslint src/services/health/healthConnect/ src/hooks/useHealthConnectSync.ts src/hooks/useHealthConnectSync.test.tsx` | **PASS, exit 0**, zero warnings (`PR-HK-2b_R3_eslint.log`) |
| 3 — Tests (FULL suite, `--runInBand`, regression) | `npx jest --runInBand --ci` | **155 of 156 suites pass; 1745 of 1746 tests pass.** All **6** HC suites PASS (5 connector suites + the hook), including the new `healthConnectIosNoop.test.ts`. The single failing suite is **out-of-scope and pre-existing** (see note). (`PR-HK-2b_R3_jest.log`) |
| 4 — Native prebuild (iOS) | `npx expo prebuild --clean --no-install --platform ios` | **PASS, exit 0** — `ios/` generated cleanly; confirms the Android-only connector does not break the iOS native config (`PR-HK-2b_R3_prebuild_ios.log`) |
| 5 — Native prebuild (Android) | `npx expo prebuild --clean --no-install --platform android` | **PASS, exit 0** — `android/` generated; AndroidManifest emits all **17** `android.permission.health.READ_*` permissions; generated `android/gradle.properties:38` = `newArchEnabled=true` (`PR-HK-2b_R3_prebuild_android.log`) |

**Gate 3 out-of-scope failure (unchanged from R1/R2, NOT attributable to PR #220):** `src/__tests__/quietLuxuryDoctrine.test.ts › does not contain TODO / FIXME / XXX comments` fails because of a `TODO(M4)` comment at `src/screens/coach/payments/contents/ContentAttachForm.tsx:476`. Verified: that file is **not in this PR's write-set**, the TODO **exists on base `main`** (`git show origin/main:…ContentAttachForm.tsx` → line 476: `date string; TODO(M4): swap this for the rich date picker`), and `git diff origin/main...a693495` shows **zero** changes to it. This is a pre-existing repo-wide doctrine-lint failure flagged for the repo owner but **not counted against this verdict**. It is also **not** a Bradley-Law violation against this PR, because the TODO is outside the PR's authored surface.

## Checklist assessment (mobile-specific + 5 never-rules + Bradley Law)

| Area | Status | Notes |
| --- | --- | --- |
| Write-set mutex | PASS | 14 files, all in the connector folder + allowed hook; +2331/−0 vs base. |
| **iOS graceful no-op (Android-only connector)** | **PASS (was P1)** | Lazy `require` behind `assertSupported()`/`Platform.OS==='android'`; iOS bundle never evaluates `getEnforcing`. Proven by the throw-on-evaluation mock test. |
| **Structured platform-unsupported state** | **PASS (new)** | `getHealthConnectStatus()` returns `{supported, platform, reason, message}`; iOS copy points to Apple Health. Real, user-visible state — not silent empty data. |
| **Bradley Law — no 'Coming soon'/TODO/XXX/stub literal** | PASS | No banned literals in the PR's authored source. The two grep hits are benign: the client doc-comment that *explicitly says it is NOT a "coming soon" placeholder*, and the `CONTRACT STUB` doc-comment in `healthConnectIngestApi.ts` (a documented integration-boundary contract identical to the sibling HK-2.a connector; the code is a real working axios POST, not a stub returning fake data; accepted at R1, unchanged here). |
| **Bradley Law — no silent failure** | PASS | iOS path returns the structured `platform-unsupported` state; every public method rejects loudly with `HealthConnectUnsupportedError`. No empty-data masquerade. |
| **Bradley Law — no mascot / medicalization / emoji** | PASS | Grep across the connector + hook: no emoji, no apnea/arrhythmia/insomnia/depression/disorder/diagnosis, no cartoon/playful copy. |
| **Bradley Law — theme tokens only** | PASS (N/A) | Data layer only; no colors/styles; grep for `#hex` returns none. |
| Permissions UX — contextual (R28) | PASS | `requestPermission()` runs only inside `syncHealthConnect()` on an explicit `sync()` mutation. The hook has **no `useEffect`/auto-trigger** — the prompt cannot fire on launch or tab entry. |
| Permission strings (AndroidManifest) | PASS | 17 user-meaningful per-record-type `health.READ_*` strings emitted into the generated manifest (declared in base PR-HK-CFG). |
| Token storage / secrets on device | PASS (N/A) | No OAuth token on device; only a non-secret `lastSyncAt` watermark in `expo-secure-store`. No `AsyncStorage` for secrets, no plaintext. |
| PII in logs | PASS | No `console.*` calls anywhere in the connector or hook; logging is counts-only via the suppressed `logger`. |
| Motion specs / confidence ladder | N/A | No UI/animation/AI-numbers in this data-layer PR. |
| Auto-send AI ban | PASS (N/A) | No AI text generated/sent. |
| Tab cap (4) | PASS | No navigator/tab changes. |
| On-device push semantics (no server token) | PASS | Device reads → normalizes device-side → POSTs `NormalizedSample[]` via the shared axios instance; idempotent via backend `dedup_key` with 5-min overlap re-read. No second http client. |
| Normalizer mapping (15 record types) | PASS | All 15 types map to canonical metrics with correct unit + bucket; defensive parsing drops malformed records; body-temp converted to deviation-from-36.5 °C. (Unchanged from R1.) |
| a11y labels | N/A | No UI in this PR. |
| Tests / coverage | PASS | 57 HC tests with concrete value assertions, now including the iOS-no-op regression and `getHealthConnectStatus` coverage on both platforms. |
| Commit hygiene | PASS | 4 commits, all `Dynasia G <dynasia@trygrowthproject.com>` (author + committer), all bodies empty, no trailers/co-authors. |
| Never-rule 1 — no medicalization | PASS | (above) |
| Never-rule 2 — no auto-send AI | PASS (N/A) | No AI in this PR. |
| Never-rule 3 — coach approves every draft | PASS (N/A) | No drafts in this PR. |
| Never-rule 4 — no mascot | PASS | (above) |
| Never-rule 5 — RLS forced | PASS (N/A) | Backend concern; no DB access in this mobile PR. |

## Findings

**None.** All R1 findings are resolved and no new P0/P1/P2/P3 were introduced by the R2 fix.

(For the record, the prior R1 P1 — Finding 1, iOS graceful-no-op under new arch — is now closed; see "R2 → R3" above.)

## Positive observations

- **Surgical, well-scoped fix.** The R2 change is localized to the single native seam (`healthConnectClient.ts`) plus its barrel export and tests — exactly the minimal-blast-radius fix R1 recommended. No other module changed.
- **The regression test models the real hazard, not a proxy.** Throwing from the mock factory at module-evaluation time reproduces the library's eager `getEnforcing`, and `jest.isolateModules` resets the registry so each assertion exercises a fresh import. It fails against the old code and passes against the fix.
- **Structured, user-respecting unsupported state.** `getHealthConnectStatus()` gives the UI a real `platform-unsupported` branch with copy that routes iOS users to Apple Health — the opposite of a silent empty-data dead end. Doctrine-compliant copy (no mascot/medicalization/emoji/placeholder).
- **Latent risk fully neutralized.** No non-test source imports the connector barrel or the hook yet, so there is no live iOS crash today; with the lazy require, there is also no crash when the next integration PR wires the hook into a Wearables screen.
- **Gates green end-to-end.** tsc/eslint/full-jest (HC suites)/iOS prebuild/Android prebuild all pass; the only red is the documented pre-existing out-of-scope doctrine-lint failure on base `main`.

## Final verdict

**CLEAN.** The one R1 blocker is genuinely fixed (verified against the library's real behavior, the old code, and a regression test that fails on the old code), `getHealthConnectStatus()` adds a real user-visible platform-unsupported state, no Bradley-Law violations exist in the PR's authored surface, the write-set stays perfectly disjoint, commit hygiene is clean, and all five gates pass. The lone test failure is the same pre-existing, out-of-scope `quietLuxuryDoctrine` failure (a `TODO(M4)` on base `main`) and is not attributable to PR #220.

**Counts:** P0 = 0 · P1 = 0 · P2 = 0 · P3 = 0.

## Commit hygiene check output

```text
$ git log origin/main..a693495 --format='%h | %an <%ae> | committer: %cn <%ce> | body:[%b]'
a693495 | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
d6f5bde | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
a43343e | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
a88febe | Dynasia G <dynasia@trygrowthproject.com> | committer: Dynasia G <dynasia@trygrowthproject.com> | body:[]
```

All four commits authored and committed by `Dynasia G <dynasia@trygrowthproject.com>`, all bodies empty, no trailers, no co-authors. PASS.

---

### Sources
- R1 audit: `tgp-agent-context/audits/HK_wave/PR-HK-2b-healthconnect_AUDIT_R1.md`
- R2 fixer report: `_r2_logs/PR-HK-2b_R2_SUMMARY.json`
- Auditor brief: `_auditor_brief_R1_wave2_MOBILE.md`
- Library behavior: `react-native-health-connect@3.5.3` `lib/commonjs/index.js` (eager `Platform.select`), `lib/commonjs/NativeHealthConnect.js:9` (`TurboModuleRegistry.getEnforcing('HealthConnect')`); project new-arch flag `android/gradle.properties:38` (`newArchEnabled=true`); `expo ~56.0.4` / `react-native 0.85.3` in `package.json`
- Fixed code: `src/services/health/healthConnect/healthConnectClient.ts` (`loadHealthConnectLib` :69-75; `getHealthConnectStatus` :164-182; guarded public methods :201-288), `index.ts:16,18`, `__tests__/healthConnectIosNoop.test.ts`, `__tests__/healthConnectClient.test.ts`
- Pre-existing out-of-scope failure: `src/screens/coach/payments/contents/ContentAttachForm.tsx:476` (`TODO(M4)`), present on `origin/main`, untouched by PR #220
- Gate logs: `tgp-agent-context/audits/HK_wave/logs/PR-HK-2b_R3_{tsc,eslint,jest,prebuild_ios,prebuild_android}.log`
