# PR-HK-1-mobile — Wearable Connections Hub UI — R3 (re-audit)

**Verdict:** **CLEAN** — All R1 findings are resolved and the R2 write-set expansion is real, ship-quality, and fully tested. The full mobile test suite is GREEN (155 suites / 1732 tests), every shipped on-device code path renders an explicit, polished, user-visible result (granted / denied / unavailable / unsupported), the badge palette is fully token-sourced, and no Bradley-Law violation remains. tsc, eslint, the full `jest --runInBand` suite, and both native prebuilds all PASS. Zero P0 / P1 / P2 / P3.

**Repo:** `growth-project-mobile`
**PR:** [#219](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/219) — `PR-HK-1-mobile: wearable connections hub UI`
**Branch:** `hk/PR-HK-1-mobile`
**Audited head SHA (R3):** `d7be0725a57aa6aeee0b5b37578db9e2f88ed2eb` (pinned in an isolated detached worktree; R55 — no rebase, no pull)
**Prior audited head (R1):** `f7b544e74ea7240bda0c7e7d854a3649bb68d15b`
**Base:** `main` @ `90c033dfe74e8ce35e76398703b8a09dc8d42d0f` (PR-HK-CFG #218 merged)
**R2 fixer report reviewed:** `PR-HK-1-mobile_R2_FIX_SUMMARY.json` (verified, not trusted)
**Auditor:** R3 (Dynasia G) — independent; auditor ≠ builder

---

## R1 findings — resolution status

| # | R1 severity | Finding | R3 status |
| --- | --- | --- | --- |
| 1 | **P1** | Full suite RED: `'Coming soon'` literal + `TODO` comments in `ConnectProviderSheet.tsx` regressed `quietLuxuryDoctrine.test.ts` | **RESOLVED** — `'Coming soon'` literal removed; CTA is now `Continue` driving a real native permission request; the `// TODO PR-HK-2.a/b/c` comments are gone. The pre-existing `TODO(M4)` in `ContentAttachForm.tsx` was reworded (comment-only). Full `jest --runInBand` is GREEN; `quietLuxuryDoctrine.test.ts` PASS. |
| 2 | **P2** | Off-token hard-coded hex badges (`'#E4EBE6'`, `'#F7E4E4'`) in `ConnectionsScreen.tsx` | **RESOLVED** — `BADGE_COLORS` is now fully token-sourced: `semantic.success` / `semantic.warning` / `semantic.danger` + `colors.cream/charcoal`. No raw hex anywhere in `ConnectionsScreen.tsx`. |
| 3 | **P3** | Hard-coded font-size / radius / dimension / scrim literals | **RESOLVED** — scrim now uses the new `withAlpha(colors.ink, 0.45)` token-derived helper; sheet top radius is `radius.lg`; grabber dimensions are `spacing` tokens; the decorative glyph uses `typography.h1`. |
| 4 | **P3** | `PROVIDER_CONFIG.icon` JSDoc said "emoji/initial" | **RESOLVED** — reworded to "Brand-asset placeholder. Swap for a vector brand asset later." No emoji is rendered (`icon` is `''`). |

---

## Scope / write-set verification

**PASS (expansion authorized + verified).** `git diff <base>...d7be072 --name-only` is **14 files, 2368 insertions, 3 deletions**. The R2 fixer expanded the write-set under the explicit Bradley directive to wire the *real* on-device flow rather than ship a placeholder. The expansion is real-flow implementation + its tests + supporting mocks/utilities, plus one comment-only edit to make the full doctrine suite green:

```text
# Original 8 (R1 write-set), all still present:
src/api/wearablesConnectionsApi.ts                                 (badge-doc reword)
src/api/wearablesConnectionsApi.test.ts
src/hooks/useWearableConnections.ts
src/hooks/useWearableConnections.test.tsx
src/screens/client/wearables/ConnectionsScreen.tsx                 (token-sourced badges)
src/screens/client/wearables/ConnectProviderSheet.tsx              (real on-device flow)
src/screens/client/wearables/__tests__/ConnectionsScreen.test.tsx
src/navigation/ClientNavigator.tsx                                 (additive nav reg.)

# R2 expansion (6 files):
src/services/health/onDeviceConnect.ts                  NEW  — single native seam (real permission request)
src/services/health/__tests__/onDeviceConnect.test.ts   NEW  — 10 tests, all outcomes × both platforms
src/screens/client/wearables/__tests__/ConnectProviderSheet.test.tsx  NEW — 6 tests (OAuth + 4 on-device states)
src/theme/tokens.ts                                     EDIT — additive withAlpha() helper; existing tokens untouched
jest.setup.js                                           EDIT — additive default mocks for the two native modules
src/screens/coach/payments/contents/ContentAttachForm.tsx  EDIT — comment-only reword of pre-existing TODO(M4)
```

**Mutex check — PASS.** No `App.tsx`, no `RootNavigator.tsx`, no `app.json` / `app.config.*`, no `package.json` / `package-lock.json`, and no sibling connector's folder is touched. `tokens.ts` and `jest.setup.js` edits are strictly additive. `ClientNavigator.tsx` edit remains additive. The `ContentAttachForm.tsx` edit is a single comment-only diff (no logic change). The two native deps (`react-native-health@1.19.0`, `react-native-health-connect@3.5.3`) were installed on base via PR-HK-CFG #218 — confirmed present in the installed tree and matching `package.json`; this PR did not add them.

---

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| ① tsc | `npx tsc --noEmit` (TypeScript 6.0.3) | **PASS**, exit 0, 0 errors |
| ② eslint | `npx eslint <14-file write-set>` | **PASS**, exit 0, 0 errors (1 benign warning: `jest.setup.js` matches an eslint ignore pattern) |
| ③ jest — **FULL** `--runInBand` | `npx jest --runInBand` (no path filter) | **PASS** — **155 suites passed / 155 total, 1732 tests passed / 1732 total, 4 snapshots**, exit 0. `quietLuxuryDoctrine.test.ts` **GREEN**. The post-run "Jest did not exit one second after…" notice is the documented benign teardown handle, not a failure (exit 0, zero `FAIL` lines). |
| ④ expo prebuild — iOS | `npx expo prebuild --clean --no-install --platform ios` | **PASS**, exit 0, "Finished prebuild" |
| ④ expo prebuild — Android | `npx expo prebuild --clean --no-install --platform android` | **PASS**, exit 0, "Finished prebuild" (benign pre-existing `expo-system-ui` `userInterfaceStyle` notice, unrelated to this PR) |

Logs: `audits/HK_wave/logs/PR-HK-1-mobile_R3_{tsc,eslint,jest_full,prebuild_ios,prebuild_android}.log`.

> **Environment note (R3 transparency).** Audit ran in an **isolated detached `git worktree`** pinned to `d7be072` (`/home/user/workspace/wt-pr219-r3`), so concurrent sibling agents could not move my HEAD. Installed deps were reused from the complete shared tree via a `node_modules` symlink (versions verified against `package.json`). The sandbox was under heavy concurrent load from sibling agents; gates were run deprioritized (`nice -19`, detached `setsid`) with capped Node heaps and polled to completion — this only affects scheduling, not the pass/fail signal. The full suite ran end-to-end (166 s) and reported all 155 suites with no path filter.

---

## Checklist assessment (mobile-specific + 5 never-rules + Bradley Law)

| Area | Status | Notes |
| --- | --- | --- |
| **Bradley Law — no 'Coming soon' / TODO / FIXME / XXX / stub literal in shipped surfaces** | **PASS** | No `'Coming soon'` / `'In Development'` string literal in any shipped CTA. No `TODO`/`FIXME`/`XXX` token in any `.ts/.tsx` under `src/screens` or `src/components` (the doctrine guard scans raw source — comments included — for TODO/FIXME/XXX, and it is GREEN). The word "placeholder" appears only in legitimate RN `TextInput` props and design-intent JSDoc; "stub" only in jest test-mock comments — neither is a shipped UI literal. |
| **Bradley Law — no silent failure; every path is user-visible** | **PASS** | `connectOnDeviceProvider()` returns an exhaustive typed union `granted \| denied \| unavailable \| unsupported`; the seam's `catch` maps native errors to `denied` (a **user-visible** state, not swallowed/empty data) and never throws. `ConnectProviderSheet` renders a distinct, action-oriented message for every outcome (denied → "allow access, then try again"; unavailable → opens Health Connect settings + "finish setup there"; unsupported → "can't be connected on this device"). The sheet-level `catch` sets a polished, action-oriented error string ("We couldn't start the connection. Please try again.") with no secret material. |
| **Bradley Law — theme tokens only, no off-token hex** | **PASS** | `BADGE_COLORS` fully token-sourced; scrim via `withAlpha(colors.ink, …)`; radius/spacing/typography from the scales. No raw hex in the wearables surface. |
| **Bradley Law — no mascot / emoji** | **PASS** | No cartoon/mascot; pictograph-emoji scan clean across the wearables + health surfaces; `config.icon` is `''` (no glyph rendered). |
| **Bradley Law — no medicalization** | **PASS** | No `apnea` / `arrhythmia` / `insomnia` / `depression` / `disorder` / `diagnos*` in the PR's strings. |
| **Never-rule 1 — no medicalization** | **PASS** | As above. |
| **Never-rule 2 — no auto-send AI** | **PASS (N/A)** | No AI surface in this PR. |
| **Never-rule 3 — coach approves every draft** | **PASS (N/A)** | No draft/messaging surface here. |
| **Never-rule 4 — no mascot / cartoon / playful / emoji** | **PASS** | Restrained copy; no emoji/mascot. |
| **Never-rule 5 — RLS forced** | **PASS (N/A — backend)** | Token-free client; on-device path involves no server token; cloud path completes the exchange server-side from the JWT. |
| **Real native permission flow wired (HealthKit / Health Connect / Samsung)** | **PASS** | iOS → `AppleHealthKit.initHealthKit(...)` with a real read-permission set (Steps, HeartRate, RestingHeartRate, HRV, ActiveEnergy, Sleep, Workout). Android → `getSdkStatus()` gate → `initialize()` → `requestPermission(...)`; Samsung Health correctly rides the Health Connect branch. Off-platform calls short-circuit to `unsupported` (no crash). |
| **Permissions UX gated to value moment (R28)** | **PASS** | The native permission request fires only from the Connect sheet's `Continue` — never on launch or tab entry. |
| **Token storage** | **PASS** | On-device path stores no tokens. Cloud path uses `WebBrowser.openAuthSessionAsync`; no `AsyncStorage`, no plaintext, no `expo-secure-store` misuse. |
| **PII in logs** | **PASS** | No `console.log` of user_id/email/tokens/raw responses in the write-set. |
| **iOS-only / Android-only graceful degradation** | **PASS** | Platform-guarded seam; `unsupported` for the wrong platform. Both prebuilds succeed. |
| **Tab cap of 4 preserved** | **PASS** | `ConnectionsScreen` is a `MoreStackNav.Screen` (stack), not a `Tab.Screen`. |
| **a11y** | **PASS** | Roles + labels + `accessibilityState` (disabled/busy) on every Pressable; error is `accessibilityRole="alert"`; decorative glyph/grabber hidden from AT; type from the ramp. |
| **Zod at the wire boundary** | **PASS** | Unchanged from R1; every response `.parse()`d, parse-failure paths tested. |
| **Write-set expansion is real / ship-quality (not stubs)** | **PASS** | `onDeviceConnect.ts` is a complete, documented, exhaustive implementation; the two new test files carry 16 real-assertion tests across all outcomes and both platforms; `withAlpha` is robust (3/6-digit hex, alpha clamp, graceful non-hex fallback); the jest mocks accurately model the native module APIs the seam consumes. |
| **Commit author hygiene** | **PASS** | All 4 commits `Dynasia G <dynasia@trygrowthproject.com>`, author == committer, empty bodies, no trailers/co-authors. |

---

## Findings

**None.** Zero P0, zero P1, zero P2, zero P3. All R1 findings (one P1, one P2, two P3) are resolved; no new findings were introduced by the R2 expansion.

---

## Positive observations

- **The R1 P1 is decisively closed the right way.** Rather than hiding the on-device CTA behind a flag or swapping one placeholder for another, the fixer shipped the *real* native permission flow through a single, well-isolated `services/health/onDeviceConnect` seam — exactly the Bradley directive's intent. The full doctrine suite is green because the surface is genuinely complete, not because a guard was appeased.
- **No-silent-failure discipline is exemplary.** Every branch — including the catch — resolves to an explicit, user-visible, action-oriented state; the `unavailable` path even routes the user into Health Connect settings so it is never a dead end.
- **Token discipline restored end-to-end.** Badges are 100% semantic-token sourced; the new `withAlpha` helper makes overlays token-derived instead of raw `rgba()`.
- **Test depth on the new seam is real:** 10 `onDeviceConnect` tests (granted/denied/unavailable/unsupported × iOS/Android + never-throws + cloud-provider guard) and 6 `ConnectProviderSheet` tests (OAuth happy path, OAuth failure, and all four on-device outcomes), all passing inside the full `--runInBand` run.
- **Write-set discipline held even while expanding:** the expansion is confined to the on-device flow + its tests + additive utilities/mocks + one comment-only edit; no escape into `App.tsx` / `RootNavigator` / `app.json` / `package.json` / theme-structure / sibling connectors.

---

## Final verdict

**CLEAN.** Zero P0 / P1 / P2 / P3. tsc, eslint, the **full** `jest --runInBand` suite (155 suites / 1732 tests, `quietLuxuryDoctrine.test.ts` green), and both native prebuilds all PASS. The R1 P1 doctrine regression and P2 token-drift are fully resolved; the R2 write-set expansion is real, polished, and tested; every on-device code path yields a user-visible result; no Bradley-Law violation remains. The Connections Hub is shippable at `d7be072`.

---

## Commit hygiene check output

`git log <base>..d7be072 --format='%h | author=%an <%ae> | committer=%cn <%ce> | body=[%b]'`:

```text
d7be072  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
f7b544e  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
2ed8b0a  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
915de22  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
```

All four commits: author == committer == `Dynasia G <dynasia@trygrowthproject.com>`, empty bodies, no `Co-authored-by`, no trailers, no "Generated by". **PASS.**
