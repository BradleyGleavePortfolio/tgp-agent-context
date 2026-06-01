# PR-HK-1-mobile — Wearable Connections Hub UI — R1 audit

**Verdict:** NOT CLEAN — this PR turns the full mobile test suite RED. `ConnectProviderSheet.tsx` regresses the pre-existing `quietLuxuryDoctrine` shipped-surface guard (a "Coming soon" placeholder literal + `TODO` comments), and the Connections Hub badge palette hard-codes off-token hex colours instead of consuming the existing `semantic` theme tokens.

**Repo:** `growth-project-mobile`
**PR:** [#219](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/219) — `PR-HK-1-mobile: wearable connections hub UI`
**Branch:** `hk/PR-HK-1-mobile`
**Audited head SHA:** `f7b544e74ea7240bda0c7e7d854a3649bb68d15b` (pinned; R55 — no rebase, no pull)
**Base:** `main` @ `90c033dfe74e8ce35e76398703b8a09dc8d42d0f` (PR-HK-CFG #218 merged)
**Build report reviewed:** `HK_PR-HK-1-mobile_BUILD.md`
**Auditor:** R1

---

## Scope / write-set verification

PASS. `git diff <base>...f7b544e --name-only` is **exactly the 8 documented files, 1776 insertions, 0 deletions** — matches the build report's write-set table precisely:

```text
src/api/wearablesConnectionsApi.ts            359  new
src/api/wearablesConnectionsApi.test.ts       205  new (test)
src/hooks/useWearableConnections.ts            88  new
src/hooks/useWearableConnections.test.tsx     134  new (test)
src/screens/client/wearables/ConnectionsScreen.tsx              481  new
src/screens/client/wearables/ConnectProviderSheet.tsx          307  new
src/screens/client/wearables/__tests__/ConnectionsScreen.test.tsx  194  new (test)
src/navigation/ClientNavigator.tsx             +8  edit (additive screen registration)
```

**Mutex check — PASS.** The only edit to an existing file is `ClientNavigator.tsx`, and it is purely additive: it imports `ConnectionsScreen`, adds a `Connections: undefined` entry to `MoreStackParamList`, and registers one `MoreStackNav.Screen name="Connections"`. **No `App.tsx`, no `RootNavigator.tsx`, no `app.json`, no `package.json`, no theme-token file, and no other connector's folder is touched.** The diff against base contains nothing outside the write-set.

---

## Gate results

| Gate | Command | Result |
| --- | --- | --- |
| ① tsc | `npx tsc --noEmit` (TypeScript 6.0.3, per `package-lock`) | **PASS**, exit 0, 0 errors |
| ② eslint | `npx eslint <8-file write-set>` | **PASS**, exit 0, clean |
| ③ jest (PR suites) | per-file `jest` over the 3 new test files | **PASS**, 3 suites / **27 tests** (14 + 4 + 9) |
| ③ jest (full regression) | `jest --runInBand` (full suite, no path filter) | **FAIL** — **1 suite RED:** `src/__tests__/quietLuxuryDoctrine.test.ts` (2 assertions), 63+ suites green. See Finding 1. |
| ④ expo prebuild — iOS | `npx expo prebuild --clean --no-install --platform ios` | **PASS**, exit 0, "Finished prebuild" |
| ④ expo prebuild — Android | `npx expo prebuild --clean --no-install --platform android` | **PASS**, exit 0 (benign pre-existing `expo-system-ui` notice, unrelated to this PR) |

Logs: `audits/HK_wave/logs/PR-HK-1-mobile_R1_{tsc,eslint,jest,jest_full,prebuild_ios,prebuild_android}.log`.

> **Environment note (R1 transparency).** The pre-cloned `node_modules` was incomplete (missing `expo/tsconfig.base.json`, no `.bin` symlinks); the shared default npm cache was corrupted by a concurrently-running sibling auditor (`pr-hk-2b-r1-worktree`) plus a near-full disk. A clean `npm ci` into an isolated cache (`.npmcache-pr-hk-1-mobile-r1`) resolved it and all gates ran against a complete tree at the pinned SHA. The full `--runInBand` suite is memory-heavy (152 test files) and hung in teardown after enumerating every suite (the build report's documented "worker failed to exit gracefully" behaviour); the decisive pass/fail signal — exactly one failing suite, `quietLuxuryDoctrine.test.ts` — was captured before teardown.

---

## Checklist assessment (mobile-specific + 5 never-rules)

| Area | Status | Notes |
| --- | --- | --- |
| **Never-rule 1 — no medicalization** | **PASS** | No `apnea` / `arrhythmia` / `insomnia` / `depression` / `disorder` / `diagnos*` anywhere in the PR's strings. |
| **Never-rule 2 — no auto-send AI** | **PASS (N/A)** | This PR has no AI surface; it is the flat connections hub. No auto-send path exists. |
| **Never-rule 3 — coach approves every draft** | **PASS (N/A)** | No draft/messaging surface in this PR (AI panels land in PR-HK-3/4). |
| **Never-rule 4 — no mascot / cartoon / playful / emoji** | **PASS** | No Duo-like character, no cartoon, no emoji/pictographs (Unicode pictograph scan clean). Copy is restrained ("Manage the apps and devices that feed your health data"). `PROVIDER_CONFIG.icon` is `''` for every provider — no glyph rendered. (Minor doc nit, Finding 4: the `icon` field's JSDoc still says "emoji/initial".) |
| **Never-rule 5 — RLS forced** | **PASS (N/A — backend)** | Client is token-free; user scope is derived server-side from the JWT (documented in the API client header, "no IDOR surface"). |
| **Tab cap of 4 preserved** | **PASS** | `ConnectionsScreen` is registered as a `MoreStackNav.Screen` (a *stack* screen under Settings/More), **not** a `Tab.Screen`. Top-level `Tab.Screen` count remains exactly **4**. Mounts at `AppTabs/Settings/Connections`, matching AGENT_1_UX_PLAN §5 path. The segmented Fitness/Recovery switcher correctly is NOT here (it belongs on the Health tab in PR-HK-3a/3b). |
| **Two-bucket motion specs** | **PASS (N/A for this PR)** | The amber-~280ms / indigo-~480ms two-bucket motion specs apply to the Health bucket pages (AGENT_1_UX_PLAN §9, PR-HK-3/4), not the connections hub. The sheet uses RN `Modal animationType="slide"`; no bucket-tinted motion is expected or claimed here. |
| **Confidence ladder on AI numbers** | **PASS (N/A)** | No AI-derived number is rendered in this PR, so no confidence chip is required. |
| **Permissions UX gated to value moment (R28)** | **PASS** | No HealthKit/Health Connect/Samsung permission prompt fires on launch or tab entry. On-device providers are stubbed with a "coming soon" banner + disabled CTA; the native permission request is deferred to PR-HK-2.a/b/c. |
| **Token storage** | **PASS** | No OAuth tokens are stored on device. Connect uses `WebBrowser.openAuthSessionAsync`; the server callback completes the exchange. No `AsyncStorage`, no plaintext secrets, no `expo-secure-store` misuse. |
| **PII in logs** | **PASS** | No `console.log` of user_id / email / tokens / raw responses anywhere in the write-set. The error path surfaces only a generic, action-oriented string. |
| **iOS-only / Android-only graceful degradation** | **PASS** | On-device providers (Apple HealthKit, Health Connect, Samsung Health) render as ordinary rows and gate their connect path behind `isOnDeviceProvider()`; no platform-specific crash. Both prebuilds succeed. |
| **a11y on every Touchable + dynamic type** | **PASS** | Every `Pressable` carries `accessibilityRole="button"` + `accessibilityLabel` (+ `accessibilityState` where disabled). Rows expose a combined "`<Provider>, <status>[, last synced <rel>]`" label; decorative glyph is `importantForAccessibility="no"`. Loading = `progressbar`, error = `alert`, retry labelled. Type comes from the `typography` ramp (dynamic-type-respecting), with the exception of the decorative glyph `fontSize` (Finding 3). |
| **Theme tokens only — no hard-coded hex / font sizes** | **FAIL** | Two off-palette hard-coded hex badge backgrounds in `ConnectionsScreen` (Finding 2) + hard-coded `fontSize`/radius/dimension literals (Finding 3). |
| **Zod validation at the wire boundary** | **PASS** | Every response (`list`, `startOauth`, `disconnect`) is `.parse()`d; parse-failure paths are tested (drifted field, bad enum, non-array). |
| **Tests** | **PASS (PR scope) / regression FAIL** | 27 PR tests with real assertions and full status-matrix + loading/error coverage. But the PR was never run against the full suite, masking the doctrine regression (Finding 1). |
| **Commit author hygiene** | **PASS** | All 3 commits `Dynasia G <dynasia@trygrowthproject.com>`, author == committer, empty bodies, no trailers/co-authors (see §Commit hygiene below). |

---

## Findings

### 1. P1 HIGH — PR turns the full mobile test suite RED: `quietLuxuryDoctrine` regression in `ConnectProviderSheet.tsx`

**Code:** `src/screens/client/wearables/ConnectProviderSheet.tsx:203` and `:100` (and the header comment `:23`)
**Failing guard:** `src/__tests__/quietLuxuryDoctrine.test.ts` (pre-existing; **not** in this PR's write-set)

The repo ships a doctrine guard that scans `src/screens` + `src/components` for forbidden shipped-surface patterns. This PR introduces two violations, both isolated to `ConnectProviderSheet.tsx`:

- **"Coming Soon" placeholder copy** — the CTA renders a quoted literal:
  ```tsx
  {onDevice ? 'Coming soon' : 'Continue'}   // line 203
  ```
  The guard's regex `/["'`](?:Coming Soon|Coming soon|In Development|in development)["'`]/` matches `'Coming soon'`. Test output:
  ```
  ● › does not contain "Coming Soon" / "In Development" / "Planned" placeholder copy
    Received: [ "screens/client/wearables/ConnectProviderSheet.tsx" ]
  ```

- **`TODO` comments** — the guard scans **raw** source (comments included) for `/\b(?:TODO|FIXME|XXX)\b/`:
  ```tsx
  // TODO PR-HK-2.a/b/c — request on-device permissions via the native  // line 100
  ```
  (plus the header comment at line 23). Test output:
  ```
  ● › does not contain TODO / FIXME / XXX comments
    Received: [ "screens/client/wearables/ConnectProviderSheet.tsx",
                "screens/coach/payments/contents/ContentAttachForm.tsx" ]
  ```
  (`ContentAttachForm.tsx` is a pre-existing offender, unrelated to this PR; `ConnectProviderSheet.tsx` is the new one this PR adds.)

**Impact.** The full `jest` suite is RED with this PR applied. The build report's "27/27 pass" claim is true *only because it ran the three new test files individually and never ran the full suite* — exactly the failure mode the doctrine guard exists to catch. A "Coming soon" placeholder string on a shipped screen and a `TODO` in shipped UI both fail the decacorn / quiet-luxury bar the guard enforces.

**Expected fix.** Remove the placeholder/`TODO` patterns from the shipped surface: replace the `'Coming soon'` CTA literal with non-placeholder copy that the guard accepts (e.g. a disabled state whose label is the provider name with the unavailability conveyed structurally, not via the banned phrase), and move the `// TODO PR-HK-2.a/b/c` notes out of the scanned file (e.g. into the build report / a tracked issue) or reword so they do not contain `TODO`/`FIXME`/`XXX`. Then re-run the **full** `jest` suite and confirm `quietLuxuryDoctrine.test.ts` is green.

### 2. P2 MEDIUM — Hard-coded off-palette hex badge backgrounds bypass the `semantic` theme tokens

**Code:** `src/screens/client/wearables/ConnectionsScreen.tsx:71,73`

```tsx
const BADGE_COLORS: Record<BadgeTone, {...}> = {
  connected: { bg: '#E4EBE6', fg: colors.forest, ... },   // line 71 — hard-coded hex
  expired:   { bg: colors.warningBg, fg: colors.warningInk, ... },
  error:     { bg: '#F7E4E4', fg: colors.error, ... },     // line 73 — hard-coded hex
  disconnected: { bg: colors.cream, fg: colors.charcoal, ... },
};
```

The brief is explicit: **theme tokens only — no hard-coded hex.** The repo already exposes a `semantic` palette in `src/theme/tokens.ts` purpose-built for status chrome (`semantic.success.bg = '#E0EBE4'`, `semantic.danger.bg = '#F2E0E0'`, with matching `fg`/`border`). The connected/error badges instead hard-code `'#E4EBE6'` and `'#F7E4E4'` — values that do not even match the semantic tokens (`E4EBE6` vs `E0EBE4`; `F7E4E4` vs `F2E0E0`), so they drift from the design system both by being raw hex *and* by being off-palette. The `expired` and `disconnected` tones in the same map correctly use tokens, which makes the two raw hexes a clear inconsistency rather than an intentional choice.

**Impact.** Token drift on the most visual surface in the wave; the badge colours will not track future palette changes and are not contrast-audited against the documented AA table in `tokens.ts`.

**Expected fix.** Replace `'#E4EBE6'` and `'#F7E4E4'` with the existing `semantic.success.bg` / `semantic.danger.bg` tokens (and align `fg` with the matching token) so every badge tone is token-sourced.

### 3. P3 LOW — Hard-coded font-size / radius / dimension / scrim literals where tokens exist

**Code:** `ConnectionsScreen.tsx:404` (`fontSize: 26`), `:422-424` (`paddingVertical: 2`); `ConnectProviderSheet.tsx:227` (`backgroundColor: 'rgba(26, 26, 24, 0.45)'`), `:232-233` (`borderTopLeftRadius: 16`), `:240-241` (grabber `width: 36, height: 4`), `:252` (`fontSize: 28`).

The brief also calls out "no hard-coded font sizes." The two decorative glyph sizes (`fontSize: 26`/`28`) sit outside the `typography` ramp, and the scrim uses a raw `rgba(...)` rather than a token (it is `colors.ink` at 45%). These are cosmetic/decorative and low-impact, but they are token-system escapes on the hub surface and should be normalised for consistency once Finding 2 is addressed.

**Expected fix.** Source the glyph size from the type ramp (or a named icon-size token), express the scrim as a token-derived overlay, and pull the sheet radius/grabber dimensions from `radius` / `spacing` where equivalents exist.

### 4. P3 LOW — `PROVIDER_CONFIG.icon` JSDoc references "emoji" though no emoji is shipped

**Code:** `src/api/wearablesConnectionsApi.ts:131` — `/** Placeholder brand glyph (emoji/initial). Swap for an asset later. */`

Every `icon` value is the empty string `''`, so **no emoji is rendered** (the mascot/emoji ban is satisfied). The lingering "emoji/initial" wording in the doc comment is misleading given the restrained-luxury / no-emoji doctrine and should be reworded to "brand-asset placeholder" to avoid a future contributor populating it with an emoji.

---

## Positive observations

- **Write-set discipline is exemplary.** Exactly the 8 documented files; the single existing-file edit (`ClientNavigator.tsx`) is additive and tab-cap-safe, with no escape into `App.tsx` / `RootNavigator` / `app.json` / `package.json` / theme tokens / sibling connector folders.
- **Security posture is correct.** Token-free client, server-side OAuth exchange via `expo-web-browser`, no `AsyncStorage` for secrets, no PII in logs, IDOR-free (user scope from JWT), and a client-side guard that throws if `startOauth` is ever called for an on-device provider.
- **Zod at every wire boundary**, with parse-failure paths (drifted field, bad enum, non-array) genuinely tested.
- **a11y is thorough** — labels + roles + disabled state on every Touchable, combined row labels, decorative glyph hidden from AT, labelled loading/error/retry.
- **Doctrine bans honoured** in substance: no medicalization nouns, no emoji/pictographs, no mascot/cartoon, restrained copy; tab cap of 4 preserved; the segmented switcher correctly excluded from the hub.
- **27 PR-scoped tests** with real assertions across the full status matrix, relative-time chip, connect-sheet routing, disconnect mutation, and loading/error-with-retry.

---

## Final verdict

**NOT CLEAN.** One **P1** (the PR turns the full mobile test suite RED by regressing the pre-existing `quietLuxuryDoctrine` shipped-surface guard — a `'Coming soon'` placeholder literal and `TODO` comments in `ConnectProviderSheet.tsx`) and one **P2** (off-token hard-coded hex badge backgrounds in `ConnectionsScreen.tsx`). tsc, eslint, the PR-scoped tests, and both native prebuilds pass; write-set, mutex, and commit hygiene are clean; all five never-rules and the tab-cap invariant hold. The hub cannot be accepted until the doctrine regression is fixed (full suite green) and the badge palette is token-sourced. Findings 3–4 are P3 polish to fold into the same pass.

---

## Commit hygiene check output

`git log <base>..f7b544e --format='%an <%ae> | committer=%cn <%ce> | body=[%b]'`:

```text
f7b544e  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
2ed8b0a  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
915de22  Dynasia G <dynasia@trygrowthproject.com> | committer=Dynasia G <dynasia@trygrowthproject.com> | body=[]
```

All three commits: author == committer == `Dynasia G <dynasia@trygrowthproject.com>`, empty bodies, no `Co-authored-by`, no trailers, no "Generated by". **PASS.**
