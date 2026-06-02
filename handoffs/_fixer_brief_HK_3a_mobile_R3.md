# HK-3a Mobile Fixer Brief — R3 (Opus 4.8)

**Source brief:** This document. Pin to commit SHA at dispatch (R55).
**Authored:** 2026-06-01 after R2 GPT-5.5 code audit + R2 Opus 4.8 visual audit returned NEEDS_FIX.
**Builder model:** Opus 4.8 (Bradley directive).
**R31/R32:** You are NOT an auditor.

---

## 1. PR

- Repo: `BradleyGleavePortfolio/growth-project-mobile`
- PR: #224
- Branch: `hk/PR-HK-3a-fitness-bucket`
- **Pinned head SHA (R55, 40-char):** `f7f003778fe5782b4497edf9e90791e470998aa2`
- Base SHA: `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`
- CI at audit: GREEN. mergeStateStatus: CLEAN. R2 audits found new issues *not* surfaced by CI.

---

## 2. R2 findings to close

All R1 fixes VERIFIED. HK-3b compat ALL ✓. The following NEW issues are blocking merge:

### P0 NEW #1 — `BucketSwitcher` segment sub-44pt (PRIMARY HEADER CONTROL)

Both code audit AND visual audit flagged independently. **This is the most-tapped control on the screen.**

- **File:** `src/screens/client/wearables/components/BucketSwitcher.tsx`
- **Lines:** Pressable around `:57`, segment style `:98-105`
- **Fix:** add `minHeight: 44` to the segment Pressable style. Also add `hitSlop={{top:8,bottom:8,left:8,right:8}}` for tap reliability at the edges.
- **Verify after:** measure or read the computed style — final tap surface ≥ 44pt × 44pt.

### P0 NEW #2 — `FreshnessChip` sub-44pt at touch surface

- **File:** `src/screens/client/wearables/components/FreshnessChip.tsx:238-245, 259-264`
- **Issue:** ~26pt visual + 16pt hitSlop = ~42pt total. Still under HIG 44pt floor.
- **Fix:** EITHER raise hitSlop to 12pt each side (→ 50pt total — preferred — no layout change), OR add `minHeight: 32` plus 8pt hitSlop. Choose the no-layout-change path unless visual harmony breaks.

### P1 NEW #1 — `useWearablePreference` bound `mutate(null)` silently fails (R65 #36)

- **File:** `src/hooks/useWearablePreference.ts:183-195`
- **Issue:** When the `{metric}` overload calls `mutate(null)` to clear the preference, the implementation bypasses the React Query mutation hook: no mutation state, no cache invalidation, no error surfacing. If the network call fails, the UI never knows — classic silent failure.
- **Fix:** Route the clear path through the same `useMutation` hook used for set. Specifically:
  ```ts
  // current bound overload mutate:
  const mutate = useCallback((provider: WearableProvider | null) => {
    if (provider === null) {
      // current: direct apiClient.delete(...) with no state mgmt
    } else {
      setPreferenceMutation.mutate({ metric, preferredProvider: provider });
    }
  }, [...]);

  // fix:
  const clearPreferenceMutation = useMutation({
    mutationFn: () => wearablesApi.clearPreference(metric),
    onSuccess: () => {
      queryClient.setQueryData(wearablePreferenceQueryKey(metric), null);
      queryClient.invalidateQueries({ queryKey: wearableSamplesQueryKeyPrefix });
    },
    onError: (e) => logger.error('clearPreference failed', { metric, error: e }),
  });
  // mutate(null) → clearPreferenceMutation.mutate()
  // expose isPending as: setPreferenceMutation.isPending || clearPreferenceMutation.isPending
  ```
- **Verify:** add a test asserting the clear path invalidates `wearableSamplesQueryKey` and exposes `isPending`.

### P1 NEW #2 — `as any` in chart test

- **File:** `src/screens/client/wearables/charts/__tests__/RevolutGlowChart.test.tsx:28-30`
- **Fix:** typed test-node narrowing. Use `unknown` + type guard, or import the proper RN test type.

### P2 NEW #1 — `MetricDetailScreen` ms-window queryKey

- **File:** `src/screens/client/wearables/MetricDetailScreen.tsx:106-122`
- **Fix:** mirror `HealthFitnessScreen` hour-rounded boundary. Build `to = roundToHour(new Date())` once per mount; the existing rolling-range computation already uses this pattern there.

### P2 NEW #2 — `BucketSwitcher` color-only active state

- **File:** `BucketSwitcher.tsx:57-73`
- **Fix:** add non-color disambiguator on the active segment. Either:
  - position-anchored underline (1.5pt bar at bottom in `colors.text.primary`)
  - small filled dot (•) before the label
  - font-weight bump (500 → 600) on active label
- Pick whichever harmonizes with the existing pill chrome; underline is most compatible with the segmented look.

### P2 NEW #3 — Off-grid spacing

- **File:** `BucketSwitcher.tsx:95` `spacing.xs / 2` (=2)
- **Fix:** use `spacing.xxs` (if 4pt-grid token exists) or `spacing.xs` (=4). Pick the closest grid value.

### P3 (optional)

ThreeRingHero literal `12/16` instead of `spacing.md/lg`; HealthFitnessTab skeleton `borderRadius:4` literal vs `radius.lg` token. Cosmetic — fix if cheap.

---

## 3. ABSOLUTE RULES

- Commit author EVERY commit: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO trailers.
- Bradley LAW + R0 Decacorn unchanged from R2.
- R65 sweep on full diff before push.
- R55: start at `f7f003778fe5782b4497edf9e90791e470998aa2`. If differs, BLOCK.
- `node_modules` NOT staged. After `expo prebuild`: `rm -rf ios android && git checkout package.json`.
- `.git/info/exclude` landmine: check before staging.
- Disk at ~93%: do NOT `npm ci` from scratch.
- GitHub auth: `bash` + `api_credentials=["github"]`. Never print token. Never run `gh auth status`.

---

## 4. R65 sweep grep set

```bash
git diff 3e447ab29683e5ef4a3124f00bc04b0fc8b66998...HEAD | grep -nE "\.catch\(\s*\(\)\s*=>" || echo "ok"
git diff 3e447ab29683e5ef4a3124f00bc04b0fc8b66998...HEAD | grep -nE "as any|@ts-ignore|@ts-nocheck" || echo "ok"
git diff 3e447ab29683e5ef4a3124f00bc04b0fc8b66998...HEAD | grep -nE "Coming soon|TODO: implement" || echo "ok"
```

Specifically scan for sub-44pt tap targets — grep for `Pressable` and check each one has either `minHeight: 44`+ or `hitSlop` totaling ≥ 12pt each side.

---

## 5. Workflow

```bash
cd /tmp/wt-hk3a-mobile 2>/dev/null || {
  git clone --filter=blob:none https://x-access-token:$GITHUB_TOKEN@github.com/BradleyGleavePortfolio/growth-project-mobile.git /tmp/gpm-clone
  cd /tmp/gpm-clone && git fetch origin hk/PR-HK-3a-fitness-bucket
  git worktree add /tmp/wt-hk3a-mobile f7f003778fe5782b4497edf9e90791e470998aa2
  cd /tmp/wt-hk3a-mobile
}
git rev-parse HEAD   # MUST equal f7f003778fe5782b4497edf9e90791e470998aa2

# Order:
#  1. P0 NEW #1 BucketSwitcher 44pt + hitSlop
#  2. P0 NEW #2 FreshnessChip hitSlop to 12pt
#  3. P1 NEW #1 useWearablePreference clear via mutation (+ test)
#  4. P1 NEW #2 RevolutGlowChart.test as any
#  5. P2 NEW #1 MetricDetailScreen hour boundary
#  6. P2 NEW #2 BucketSwitcher non-color active indicator
#  7. P2 NEW #3 off-grid spacing
#  8. P3 (optional)

# Tests + gates:
npx tsc --noEmit
npx eslint . --max-warnings=0
npx jest --runInBand
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean
rm -rf ios android
git checkout package.json

# R65 grep set + tap-target audit (above)
git ls-files --others --exclude-standard
git status --short                  # node_modules + ios/android NOT present

git add -A
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-3a: R2 fixes — BucketSwitcher 44pt + FreshnessChip hitSlop + clear-pref mutation + MetricDetail hour key"

git push origin hk/PR-HK-3a-fitness-bucket
NEW_SHA=$(git rev-parse HEAD); echo "$NEW_SHA"
gh pr view 224 --repo BradleyGleavePortfolio/growth-project-mobile \
  --json headRefOid,mergeStateStatus,statusCheckRollup
```

---

## 6. Deliverable (return EXACTLY this block)

```
FIXED_FINDINGS:
- P0 NEW #1 (BucketSwitcher 44pt): <minHeight + hitSlop values>
- P0 NEW #2 (FreshnessChip hitSlop): <new hitSlop>
- P1 NEW #1 (useWearablePreference clear via mutation): <approach + new test added>
- P1 NEW #2 (chart test as any): <typed approach>
- P2 NEW #1 (MetricDetail hour boundary): <fix>
- P2 NEW #2 (BucketSwitcher non-color active): <indicator chosen>
- P2 NEW #3 (off-grid spacing): <token used>
- P3 (literals): <FIXED|DEFERRED>

R65_50_FAILURES_SWEEP:
- silent catches in src: 0 (only documented platform no-ops remain)
- as any / ts-ignore: 0 (test fixed)
- sub-44pt tap targets remaining: 0
- color-only active states remaining: 0
- off-grid spacing remaining: 0
- "Coming soon" / placeholders: 0

GATES_AFTER_FIX:
- tsc / eslint / jest / expo prebuild ios + android: <pass/pass/pass/pass/pass>

NEW_SHA: <40-char>
CI_AFTER_PUSH: <state>
STATUS: READY_FOR_R3_AUDIT | BLOCKED+<reason>
```

Execute now.
