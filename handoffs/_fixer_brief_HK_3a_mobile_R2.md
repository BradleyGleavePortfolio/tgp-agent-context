# HK-3a Mobile Fixer Brief — R2 (Opus 4.8)

**Source brief:** This document. Pin to commit SHA at time of dispatch (R55).
**Authored:** 2026-06-01 by current operator after R64 rescue of prior-session audit findings.
**Builder model:** Opus 4.8 (Bradley directive: builders/fixers are Opus 4.8 always).
**You are NOT an auditor.** R31/R32: auditor ≠ builder. R1 auditors were GPT-5.5 (code-depth) + Opus 4.8 fresh-instance (visual). You are a fresh Opus 4.8 fixer instance.

---

## 1. PR under fix

- **Repo:** `BradleyGleavePortfolio/growth-project-mobile`
- **PR:** #224 — https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/224
- **Branch:** `hk/PR-HK-3a-fitness-bucket`
- **Title:** `PR-HK-3a: H&F bucket UI + samples API + WearablesShell`
- **Label:** `hk-phase-2a`
- **Pinned head SHA (R55, 40-char):** `bf465d9e316bcbe30ad02976abb12e6c3548f081`
- **Base SHA:** `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`
- **CI state at audit:** GREEN, but two independent R1 audits returned NEEDS_FIX.
- **Critical:** The 5 P0 code findings ALL break HK-3b PR #223. Fixing this PR is the gating dependency for HK-3b rebase.

---

## 2. ABSOLUTE RULES (read before touching code)

### Commit author — EVERY commit
```
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-3a: R1 fixes — HK-3b compat exports + chart gradient/bezier + Pressable retries + polish"
```
Title-only. **NO** `Co-Authored-By`, **NO** `Generated-By`, **NO** body.

### Bradley LAW (R0 Decacorn) — verbatim
> "ABSOLUTELY NOTHING SHOULD BE COMING SOON OR A SILENT FAILURE — ALL OF THIS IS BUILT TO LAUNCH QUALITY, DECACORN QUALITY, POLISHED AND COMPLETE"

**Banned in any code, comment, test title, or string literal:**
- "Coming soon" / "TODO: implement" / "Not yet implemented"
- `@ts-ignore`, `@ts-nocheck`, `as any`
- `.catch(() => undefined)`, `catch (e) {}` — **R65 / 50-Failures #36, P1**
- Spinner-only empty states (must have explicit empty, loading, error branches)
- Test `describe`/`it` titles containing "Coming soon" — Bradley LAW applies to test output too

**Required pattern for "best-effort secondary call":** log with structured context (no PII) and rethrow.

### R0 decision filter — what would Apple / Notion / Google do?

For this mobile PR, the relevant doctrine is the **Mobile App Design Intelligence** doc (committed in `tgp-agent-context/quality-references/`). Highlights you MUST honor:

- **Don Norman's three layers** — visceral (first 50–200ms), behavioral (during use), reflective (after session). Every component must work at all three.
- **Apple competence engineering** — spring physics, haptic timing, animation curves are calibrated, not improvised. 60fps minimum, target 120fps on ProMotion.
- **Hit targets ≥44pt** (Apple HIG) for ANY tappable element. Sub-44pt = P0.
- **Empty / loading / error states are first-class** — never spinner-only.
- **Peak-end rule** — invest disproportionately in the most intense moment AND the closure moment. The chart visual (P0 visual #1 below) is the peak.
- **Information density via progressive disclosure** (Notion) — collapsed-by-default for anything beyond the primary glance.
- **Color is decorative, not informational** — accessibility ramp. Active states need a non-color disambiguator (checkmark, weight, position).

### Auth & environment
- GitHub: `bash` with `api_credentials=["github"]`. Token is `$GITHUB_TOKEN`. Use `gh` CLI. **Never** print the token. **Never** run `gh auth status`.
- **Disk at ~93%** — do NOT `npm ci` from scratch. `node_modules` exists (possibly as a symlink) in `/tmp/wt-hk3a-mobile`. If you need to install, use `npm ci --cache /tmp/npm-cache-fixer-mob`.
- **`node_modules` must NOT be staged.** Verify before `git add -A` via `git status --short`.
- **After `expo prebuild`:** `rm -rf ios android && git checkout package.json` (expo rewrites scripts — unrelated diff sneaks in otherwise).

### Landmines (must respect)
- `.git/info/exclude` silently ignores files. Before `git add -A`:
  ```bash
  git ls-files --others --exclude-standard
  # for any new file:
  git check-ignore -v src/path/to/new-file.tsx || echo "not ignored, ok"
  # use git add -f if needed
  ```
  (HK-3a almost shipped without 8 files this way; do not repeat.)
- Reanimated worklet tests fail in jest by default — see `growth-project-mobile/audit-worklets-jest.md` if you hit it.
- `gh pr merge --match-head-commit` requires full 40-char SHA — you won't merge, but capture the new SHA cleanly.

### R55 pinning
You start at SHA `bf465d9e316bcbe30ad02976abb12e6c3548f081`. If `git rev-parse HEAD` shows anything else, STOP and report `BLOCKED+wrong_starting_sha`.

---

## 3. R65 — 50-Failures sweep (run BEFORE you push)

Scan your diff for:

| # | Pattern | Severity |
|---|---|---|
| #4 | `dangerouslySetInnerHTML` with unsanitized input (React Native web views) | 🔴 P0 |
| #6 | Missing input validation (no zod / yup on form inputs that hit network) | 🔴 P0 |
| #7 | Unhandled async / missing `await` | 🟠 P1 |
| #36 | Silent failures / swallowed errors (`.catch(()=>undefined)`, `catch(e){}`, `catch(e){console.log(e)}`) | 🟠 P1 |
| — | `as any` / `@ts-ignore` / `@ts-nocheck` | 🟠 P1 |
| — | Hardcoded color hex literals (must come from theme tokens) | 🟡 P2 |
| — | Off-grid spacing (must be multiples of 4 unless explicitly opt-out) | 🟡 P2 |
| — | Sub-44pt tap targets | 🔴 P0 (Apple HIG, Mobile Design Intel doc) |
| — | Color-only active state (no non-color disambiguator) | 🟡 P2 |
| — | Test title containing "Coming soon" | 🔴 P0 (Bradley LAW) |

---

## 4. FINDINGS TO FIX (verbatim from R1 audits)

> **NOTE on shipping order:** The 5 P0 CODE findings unblock HK-3b. Fix them FIRST in this order: P0 #2 (named exports) → P0 #1 (chart path) → P0 #3 (FreshnessChip props) → P0 #4 (useWearableSamples sig) → P0 #5 (useWearablePreference sig). Then P0 visual #1 + #2. Then P1s. Then P2s.

### CODE-DEPTH AUDIT (GPT-5.5)

#### P0 #1 — Chart path mismatch

Snapshot HK-3b's actual imports first:
```bash
gh pr diff 223 --repo BradleyGleavePortfolio/growth-project-mobile > /tmp/pr223.diff
grep -nE "from ['\"].*(RevolutGlowChart|FreshnessChip|wearablesSamplesApi|useWearableSamples|useWearablePreference)" /tmp/pr223.diff > /tmp/hk3b-imports.log
cat /tmp/hk3b-imports.log
```

**Then:**
- If HK-3b imports from `'../charts/RevolutGlowChart'` (relative from inside `src/screens/client/wearables/*`): resolves correctly today; no shim needed. Document in deliverable as `chart path: aligned`.
- If HK-3b imports from `'src/charts/RevolutGlowChart'` or any other root-level path: **add a re-export shim** at `src/charts/RevolutGlowChart.tsx`:
  ```ts
  export { default } from '../screens/client/wearables/charts/RevolutGlowChart';
  export * from '../screens/client/wearables/charts/RevolutGlowChart';
  ```

#### P0 #2 — Missing named exports HK-3b imports

HK-3b imports these names:
- `{ FreshnessChip }` (named)
- `{ RevolutGlowChart }` (named)
- `{ WearableSamplesResponse, WearableSampleSeries, WearableMetricType, WearableSamplesError, useWearableSamples }`

PR #224 currently exports:
- `FreshnessChip` — default only
- `RevolutGlowChart` — default only
- API types — `SamplesResponse`, `SampleSeries` (no `Wearable` prefix)
- No `WearableSamplesError`

**Fixes:**
1. `src/screens/client/wearables/components/FreshnessChip.tsx`:
   ```ts
   export { default as FreshnessChip } from './FreshnessChip';   // ← in a barrel
   // OR change the component file to: export const FreshnessChip = ...; export default FreshnessChip;
   ```
2. `src/screens/client/wearables/charts/RevolutGlowChart.tsx`: same pattern.
3. `src/api/wearablesSamplesApi.ts`:
   ```ts
   export type WearableSamplesResponse = SamplesResponse;
   export type WearableSampleSeries = SampleSeries;
   export type WearableMetricType = /* the existing metric union */;
   export class WearableSamplesError extends Error {
     constructor(public code: string, message: string, public cause?: unknown) {
       super(message);
       this.name = 'WearableSamplesError';
     }
   }
   ```
   The error class is a real type (NOT `as any`); HK-3b will branch on `err instanceof WearableSamplesError && err.code === '…'`.

#### P0 #3 — `FreshnessChip` prop surface incompatible

Current required props: `{ connections, bucket, onPress }`.
HK-3b usage: `<FreshnessChip bucket="SLEEP_RECOVERY" tone="cool" onPress={goToConnections} />` (no `connections`).

**Fix:**
- Make `FreshnessChip` internally call `useWearableConnections()` so callers only need `{ bucket, tone?, onPress? }` (per builder brief).
- Accept optional `tone?: 'cool' | 'warm'` and thread to theme tokens (cool → S&R palette, warm → H&F palette).
- Keep `connections?` as an optional override prop so existing call sites and tests don't break. If `connections` is passed, use it; otherwise fall back to the internal hook.
- Extract the freshness-tier reducer as a pure function (`computeFreshnessTier({connections, bucket}) → 'current' | 'stale' | 'needs_attention'`) so it stays unit-testable independent of the hook.

#### P0 #4 — `useWearableSamples` signature mismatch

Current: `useWearableSamples({ bucket, from, to, metric?, clientId?, granularity?, preferredOnly? })`
Contract (HK-3b): `useWearableSamples({ bucket, metric, range, granularity, providers, timezone })`

**Fix — add an overload that accepts the contract shape:**
```ts
type LegacyArgs = { bucket; from; to; metric?; clientId?; granularity?; preferredOnly? };
type ContractArgs = { bucket; metric; range; granularity; providers; timezone };

export function useWearableSamples(args: LegacyArgs): UseSamplesResult;
export function useWearableSamples(args: ContractArgs): UseSamplesResult;
export function useWearableSamples(args: LegacyArgs | ContractArgs): UseSamplesResult {
  const normalized = normalizeSampleArgs(args);  // convert ContractArgs → LegacyArgs shape
  // ...
}
```

**Critical:** include `providers` AND `timezone` in the React Query `queryKey` so cache doesn't collide between filter variants. The current `queryKey` likely keys only on `{bucket, metric, from, to, clientId}` — extend it.

If the backend doesn't accept `providers`/`timezone` as query params today: pass them through as query params anyway (backend fixer is running in parallel on PR #356 and can add validation). Document in deliverable under `BACKEND_COORDINATION_REQUIRED`.

#### P0 #5 — `useWearablePreference` signature mismatch

Current: zero-arg; mutations take `{ metric, preferredProvider }`.
Contract (HK-3b): `useWearablePreference({ metric })` returns `{ data, mutate, isPending }`.

**Fix — overload:**
```ts
export function useWearablePreference(): /* legacy return */;
export function useWearablePreference(args: { metric: WearableMetricType }): {
  data: WearableUserMetricPreference | null;
  mutate: (preferredProvider: WearableProvider | null) => void;
  isPending: boolean;
};
export function useWearablePreference(args?: { metric }): any {
  // when metric is bound, mutate(preferredProvider) becomes the simpler API
}
```
Preserve both call sites.

#### P1 #1 — Optimistic preference not read by chip UI

`ProviderOverlapChips` derives `active` only from prop, never subscribes to the `wearablePreferenceQueryKey(metric)` cache that `useWearablePreference` optimistically writes.

**Fix:** read the preference cache inside `ProviderOverlapChips`:
```ts
const { data: optimisticPref } = useWearablePreference({ metric });
const displayedActiveProvider = optimisticPref?.preferredProvider ?? activeProvider;
```
This gives the chip the optimistic update before the network confirms.

#### P1 #2 — Coach tab duplicates sample reads

`HealthFitnessTab` calls `useWearableSamples` for the anomaly band, then `<HealthFitnessScreen clientId={clientId} />` calls it again with a millisecond-different window → two query keys, two requests.

**Fix:** round the window to a stable boundary in the parent and pass it down. Or share via context.
```ts
// in HealthFitnessTab:
const now = new Date();
const to = roundToHour(now);            // <-- stable boundary
const from = subDays(to, 30);
// pass {from, to} into both useWearableSamples and into HealthFitnessScreen as a prop
```

#### P2 #1 — Rolling-window keys are ms-specific
`new Date().toISOString()` per mount → unstable cache keys. Fix at the boundary computation (aligns with P1 #2). Round to **hour** boundary (any coarser causes 1h staleness on H&F).

---

### VISUAL AUDIT (Opus 4.8 fresh-instance)

#### P0 visual #1 — `RevolutGlowChart` has no gradient fill + no bezier (THE PEAK MOMENT)

This is the visual peak per Mobile Design Intel doc — invest disproportionately here.

**File:** `src/screens/client/wearables/charts/RevolutGlowChart.tsx:245-255`

Currently a `<Polyline>` with `strokeLinejoin="round"` (rounds vertex joins only, not the line itself). This is NOT Revolut quality.

**Fix:**
1. Replace `<Polyline>` with `<Path d={…}/>` built from a smoothing function. Implement `smoothPath(points: {x,y}[]): string` returning an SVG path string with cubic Bezier `C` commands.
   - **Prefer monotone-cubic interpolation** — it avoids overshoot on sparkline-style health data (heart rate, steps, sleep score). Catmull-Rom is acceptable if monotone-cubic is too heavy to implement in the time window.
   - Helper goes in a new file `src/screens/client/wearables/charts/smoothPath.ts` (so it's pure-testable).
2. Add gradient `<Defs>`:
   ```tsx
   <Defs>
     <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
       <Stop offset="0" stopColor={toneTk.accent} stopOpacity={0.18} />
       <Stop offset="1" stopColor={toneTk.accent} stopOpacity={0} />
     </LinearGradient>
   </Defs>
   ```
3. Add a closed area `<Path>` UNDERNEATH the line:
   ```tsx
   const areaPath = `${smoothLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
   <Path d={areaPath} fill="url(#chartFill)" />
   <Path d={smoothLinePath} stroke={toneTk.accent} strokeWidth={2} vectorEffect="non-scaling-stroke" fill="none" />
   ```
4. Keep `vectorEffect="non-scaling-stroke"` on the line.
5. **PRESERVE** the existing glow thumb, drag interaction, reduce-motion handling, and haptics — the audit explicitly called those out as decacorn quality.

**Test (new file `__tests__/charts/RevolutGlowChart.test.tsx`):**
- Snapshot the rendered SVG and assert it contains `<LinearGradient id="chartFill"`.
- Assert the line path's `d` attribute starts with `M` and contains at least one `C` command.
- Assert reduce-motion path is taken when `AccessibilityInfo.isReduceMotionEnabled` returns true.

#### P0 visual #2 — Recovery affordances are `<Text onPress>` with sub-44pt targets

**4 sites:**
- `src/screens/client/wearables/HealthFitnessScreen.tsx:210-216` ("Try again")
- `src/screens/client/wearables/MetricDetailScreen.tsx:197-204` ("Try again")
- `src/screens/client/wearables/MetricDetailScreen.tsx:233-239` ("Connect a source")
- `src/screens/client/wearables/MetricDetailScreen.tsx:257-263` ("Dismiss")

**Fix at each:**
```tsx
<Pressable
  onPress={…}
  accessibilityRole="button"
  hitSlop={{top:12,bottom:12,left:12,right:12}}
  style={({pressed}) => [
    styles.recoveryCta,                  // minHeight:44, paddingHorizontal:spacing.md, justifyContent:'center'
    pressed && {opacity: 0.7},
  ]}
>
  <Text style={styles.recoveryCtaLabel}>Try again</Text>
</Pressable>
```
**Reference:** `HealthFitnessEmptyState.tsx:62-74` — the visual audit praised that CTA pattern explicitly; mirror it.

#### P1 visual #1 — Primary chips <44pt
- `FreshnessChip.tsx:146-150` and `BucketSwitcher.tsx:102`
- **Cheapest fix:** add `hitSlop={{top:8,bottom:8,left:8,right:8}}` — no layout change, restores tap reliability.

#### P1 visual #2 — Coach anomaly band swallows error state (CLINICIAN-FACING)
- `HealthFitnessTab.tsx:50-51, 95, 110-117`
- `computeAnomalies(query.data)` returns `[]` for BOTH loading AND error → green "all clear" on a failed query. **A coach reading this on a real client is being lied to.**
- **Fix:** branch on `query.isError` / `query.isLoading`:
  - Loading → skeleton (existing token-driven style)
  - Error → neutral copy: "Couldn't load insights — pull to refresh." Distinct from genuine "no shifts." No green. No "All clear" framing.
  - Success + empty → existing "no shifts in range" copy.
- Use token-driven styles only (NO inline `borderRadius: 4` etc — fix P1 visual #4 in the same edit).

#### P1 visual #3 — Freshness chip grading binary
- Add a "stale" tier between `current` and `attention`: `last_synced > N hours` but not errored.
- **Pick N=6** unless the backend exposes a per-metric freshness window via the connection record.
- Visual: soft amber tone (use existing `colors.warning.muted` or equivalent — DO NOT introduce a new hex).
- Coordinate with backend fixer: the backend P1 #3 fix is updating freshness to consider `status`. If backend returns a per-provider freshness tier including `stale`, consume that; otherwise compute client-side from `last_synced_at`.

#### P1 visual #4 — Coach anomaly band inline hardcoded values + palette seam
- `HealthFitnessTab.tsx:100-108, 111, 122-129, 136`
- Inline `{borderRadius: 4, padding: 16, gap: 8, paddingVertical: 6}` (last is off the 4pt grid).
- Uses coach `ThemeProvider` colors while embedded `HealthFitnessScreen` uses wearables `bone/cream` → visible material seam.
- **Fix:** wrap band in `WearableCard` (or use the same wearables tokens). All values from theme; no inline hex; all spacing on the 4pt grid.

#### P2 visual #1 — Off-grid spacing
- `ThreeRingHero.tsx:224` `gap: 5` → `4` or `8`
- `HealthFitnessTab.tsx:128` `paddingVertical: 6` → `4` or `8` (addressed by P1 visual #4 if you adopt `WearableCard`)

#### P2 visual #2 — `WorkoutsCard` number formatting
- Chip renders `${...}m`, headline `${...} min`. Unify to one style (recommend the more readable `12 min`).

#### P2 visual #3 — `ProviderOverlapChips` active state color-dominant
- Add a leading checkmark (small filled circle or `✓` icon at 12pt) on the active chip for non-color disambiguation (accessibility ramp per Mobile Design Intel doc).

#### P2 visual #4 — Icon sizing drift below 16
- `WearableCard.tsx:54, 60` are 16 (fine).
- `FreshnessChip.tsx:132, 136` are 14/12 — bump to **16** for tappable glyphs (HIG minimum for icon-only meaning).

#### P3 — `BucketSwitcher.tsx:88` `withAlpha(colors.bone, 1)` indirection
- Replace with `colors.bone`. Cheap, do it.

---

## 5. Workflow

```bash
cd /tmp/wt-hk3a-mobile
git status --short
git rev-parse HEAD   # MUST be bf465d9e316bcbe30ad02976abb12e6c3548f081

# 1. Snapshot HK-3b imports (informs P0 code #1)
gh pr diff 223 --repo BradleyGleavePortfolio/growth-project-mobile > /tmp/pr223.diff
grep -nE "from ['\"].*(RevolutGlowChart|FreshnessChip|wearablesSamplesApi|useWearableSamples|useWearablePreference)" /tmp/pr223.diff > /tmp/hk3b-imports.log
cat /tmp/hk3b-imports.log

# 2. Apply fixes in this order:
#    P0 code #2 (named exports)  ← smallest, unblocks everything
#    P0 code #1 (chart path)     ← informed by hk3b-imports.log
#    P0 code #3 (FreshnessChip props)
#    P0 code #4 (useWearableSamples overload)
#    P0 code #5 (useWearablePreference overload)
#    P0 visual #1 (chart gradient + bezier) ← biggest UX win, the peak
#    P0 visual #2 (Pressable retries, 4 sites)
#    P1 code #1 + #2
#    P1 visual #1 + #2 + #3 + #4
#    P2s (low-cost ones)

# 3. Tests for each change:
#    - FreshnessChip works WITHOUT `connections` prop (uses internal hook)
#    - useWearableSamples accepts BOTH old and new signatures
#    - useWearablePreference({metric}) overload returns mutate(preferredProvider)
#    - ProviderOverlapChips reflects optimistic preference
#    - RevolutGlowChart renders the gradient + smooth path (DOM presence / snapshot)
#    - Coach anomaly band renders error copy on isError (not green "all clear")

# 4. Gate sweep (REQUIRED before push):
npx tsc --noEmit
npx eslint . --max-warnings=0
npx jest --runInBand
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean
rm -rf ios android
git checkout package.json   # revert any expo script edits

# 5. R65 50-Failures sweep — grep your diff:
git diff 3e447ab29683e5ef4a3124f00bc04b0fc8b66998...HEAD | grep -nE "\.catch\(\s*\(\)\s*=>" || echo "ok no silent catches"
git diff 3e447ab29683e5ef4a3124f00bc04b0fc8b66998...HEAD | grep -nE "as any|@ts-ignore|@ts-nocheck" || echo "ok no ts escapes"
git diff 3e447ab29683e5ef4a3124f00bc04b0fc8b66998...HEAD | grep -nE "Coming soon|TODO: implement" || echo "ok no placeholders"

# 6. Verify staging
git status --short                       # node_modules + ios + android must NOT appear
git ls-files --others --exclude-standard  # any new files NOT being added?
# For any new file:
git check-ignore -v <new-file>  || echo "not ignored"

git add -A
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-3a: R1 fixes — HK-3b compat exports + chart gradient/bezier + Pressable retries + polish"

git push origin hk/PR-HK-3a-fitness-bucket
git rev-parse HEAD   # capture for NEW_SHA

gh pr view 224 --repo BradleyGleavePortfolio/growth-project-mobile \
  --json headRefOid,mergeStateStatus,statusCheckRollup
```

---

## 6. DELIVERABLE (return EXACTLY this — no preamble, no postscript)

```
FIXED_FINDINGS:
- CODE P0 #1 (chart path): <re-export shim OR contract aligned — quote hk3b-imports.log line>
- CODE P0 #2 (named exports): <files touched, names exported>
- CODE P0 #3 (FreshnessChip props): <approach — internal hook fallback>
- CODE P0 #4 (useWearableSamples sig): <overload added; queryKey includes providers+timezone>
- CODE P0 #5 (useWearablePreference sig): <overload added>
- CODE P1 #1 (optimistic chip read): <fix>
- CODE P1 #2 (coach duplicate reads): <fix — hour boundary>
- VISUAL P0 #1 (chart gradient+bezier): <smoothing fn used (monotone-cubic/catmull); gradient stops>
- VISUAL P0 #2 (Pressable retries): <4 sites converted>
- VISUAL P1 #1 (chip hitSlop): <done>
- VISUAL P1 #2 (anomaly band error state): <fix — neutral copy on isError>
- VISUAL P1 #3 (freshness stale tier): <client-side N=6h>
- VISUAL P1 #4 (anomaly band tokens): <WearableCard adoption>
- P2 #1 (off-grid): <FIXED|DEFERRED>
- P2 #2 (number formatting): <FIXED|DEFERRED>
- P2 #3 (active chip checkmark): <FIXED|DEFERRED>
- P2 #4 (icon sizes): <FIXED|DEFERRED>
- P3 (withAlpha indirection): <FIXED>

HK_3B_COMPAT_VERIFIED:
- chart path resolves from HK-3b imports: ✓/✗
- FreshnessChip prop shape matches HK-3b usage: ✓/✗
- useWearableSamples accepts HK-3b shape: ✓/✗
- useWearablePreference accepts HK-3b shape: ✓/✗
- Named exports present (FreshnessChip, RevolutGlowChart, types): ✓/✗
- WearableSamplesError exported as a real class: ✓/✗

R65_50_FAILURES_SWEEP:
- silent catches scanned: 0 found | <N> fixed
- as any / ts-ignore: 0 found | <N> fixed
- sub-44pt tap targets remaining: <count>
- color-only active states remaining: <count>
- "Coming soon" / placeholders in shipped code OR tests: 0

BACKEND_COORDINATION_REQUIRED:
- <e.g. "useWearableSamples now sends `providers` and `timezone` query params; backend must accept these (currently being added in PR #356 R1 fix)">

GATES_AFTER_FIX:
- tsc: <pass/fail>
- eslint: <pass/fail>
- jest: <N passed, M failed (must be 0 failed)>
- expo prebuild ios: <pass/fail>
- expo prebuild android: <pass/fail>

NEW_SHA: <40-char>
CI_AFTER_PUSH: <IN_PROGRESS|PASS|FAIL+reason>

STATUS: READY_FOR_R2 | BLOCKED+<reason>
```

If any P0 cannot be fixed: `STATUS: BLOCKED+<reason>` and stop.

---

## 7. Why each fix matters (R0 + Mobile Design Intel grounding)

- **CODE P0 #1–#5:** without these, HK-3b doesn't rebase. The entire Phase 2a sequence stalls. This is the gate.
- **VISUAL P0 #1 (chart):** this is the **peak moment** per Don Norman / Mobile Design Intel doc. Revolut's premium feel comes from gradient + bezier rendering. A polyline = "tutorial code." The whole H&F bucket's visceral quality lives or dies here.
- **VISUAL P0 #2 (Pressable retries):** `<Text onPress>` is a classic "almost works" pattern — it's tappable but barely. Apple HIG 44pt minimum is non-negotiable for the recovery moment after an error (peak-end rule — the closure moment of a failure flow is the most important moment to nail).
- **VISUAL P1 #2 (anomaly band error state):** This one is the most dangerous in the audit. A coach looking at a client's data sees "no shifts" (green) when the API actually failed. **R65 Failure #36 in UI form.** It's a clinician-facing data-integrity bug.
- **VISUAL P1 #3 (stale tier):** Information density via gradient (Notion / progressive disclosure) — binary `current` vs `attention` is a tutorial-grade signal. Three tiers gives the user actionable nuance.

**End of brief. Execute now.**
