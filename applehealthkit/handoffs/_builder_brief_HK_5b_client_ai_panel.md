# HK-5b — Client AI Panel (Mobile) — Builder Brief

**PR target:** `BradleyGleavePortfolio/growth-project-mobile` — new PR
**Branch:** `hk/PR-HK-5b-client-ai-panel`
**Base:** `main` (current head; soft-depends on HK-5a being merged for shared API client)
**Model:** Opus 4.8 (builder)
**Round:** R1
**Depends-on:** HK-3a (merged), HK-3b (pending merge), HK-4 (merged backend), HK-5a (creates shared `wearableInsightsApi.ts` + `useWearableInsights.ts`)
**Parallel-with:** HK-5a (file-disjoint except the shared API import)
**Effort:** M

## Bradley R0 LAW (decacorn)
- NO "Coming soon", silent failures, `as any`, `@ts-ignore`, `catch(e){}`, `.catch(()=>undefined)`, spinner-only empty states.
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only.

## Scope

Client-side AI insight panel on:
- `src/screens/client/wearables/HealthFitnessScreen.tsx` (HK-3a)
- `src/screens/client/wearables/SleepRecoveryScreen.tsx` (HK-3b)
- Metric Detail screen (if it exists post HK-3a — verify path)

Progressive disclosure. Observation → norm comparison → concrete intervention + optional CTA.

**CALM treatment for S&R variant** (Mobile Design Intel + Agent 1 UX):
- Reassurance copy BEFORE deficit number ("You're close — about 45 min under your sleep need")
- Forward-hook closure renders after CTA completion ("We'll check your REM tomorrow morning")
- Phantom CALM banner if data is incomplete

## Write-set (owned exclusively)

1. **`src/screens/client/wearables/ClientInsightPanel.tsx`** (new — the panel)
2. **`src/screens/client/wearables/__tests__/ClientInsightPanel.test.tsx`** (new)
3. **`src/screens/client/wearables/HealthFitnessScreen.tsx`** (one-line add: `<ClientInsightPanel bucket="HEALTH_FITNESS" />`)
4. **`src/screens/client/wearables/SleepRecoveryScreen.tsx`** (one-line add: `<ClientInsightPanel bucket="SLEEP_RECOVERY" />`)

**IMPORTS (read-only) from HK-5a:**
- `src/api/wearableInsightsApi.ts`
- `src/hooks/useWearableInsights.ts`

**DO NOT modify HK-5a files. DO NOT touch backend code. DO NOT touch navigator files.**

## API contract (use the client-side response shape from HK-5a's `WearableInsightResponse`)

Client request: `GET /api/wearables/insights?side=client&bucket=...&window_days=14`

**Client response (validated server-side — coach-only fields absent):**
```ts
{
  status: 'ok' | 'insufficient_data' | 'error',
  cached: boolean,
  generated_at: string,
  confidence_level: 'i_think' | 'fairly_sure' | 'confident' | 'certain' | 'verified',
  confidence_pct: number,
  bucket: 'HEALTH_FITNESS' | 'SLEEP_RECOVERY',
  observation: string,
  norm_comparison: string,        // "Your 7-day avg is 8% below typical for your age group" (client-friendly)
  intervention: string,           // concrete, action-oriented ("Try a 20-min walk after lunch tomorrow")
  cta: {
    label: string,                // "Add 20-min walk to today's plan"
    action: 'deep_link' | 'log_intent' | 'dismiss',
    deep_link?: string,           // route name when action === 'deep_link'
    intent_payload?: Record<string, unknown>
  } | null,
}
```

Defensive runtime guard: if response contains coach-only fields (`hypothesis`, `suggested_action`, `draft_message`), this is a backend bug — render the panel WITHOUT those fields (DO NOT include them in UI). Log a `console.warn` (or `logger.warn` if available); do NOT throw. Test that this case renders cleanly.

## Panel component (`ClientInsightPanel.tsx`)

**Props:**
```ts
type ClientInsightPanelProps = {
  bucket: 'HEALTH_FITNESS' | 'SLEEP_RECOVERY';
};
```

**Layout:**
- Collapsed by default: one-line observation + confidence chip + expand
- Expanded: norm comparison + intervention + CTA button + dismiss tertiary
- **S&R variant CALM treatment:** reorder content blocks — reassurance copy + intervention BEFORE any deficit number. Use the existing `PhantomCalmBanner` component from HK-3b if data is partial.
- 44pt touch targets; contrast ≥ 4.5:1; bucket-tinted low-saturation
- TestIDs: `client-insight-panel-{bucket}`, `client-insight-cta`, `client-insight-expand-toggle`, `client-insight-dismiss`

**CTA fulfillment (≤3 taps from panel per Fogg ability):**
- `action: 'deep_link'` → `navigation.navigate(deep_link)` to the indicated route (must be a typed route in the existing navigator — verify on build; if route doesn't exist yet, hide the CTA gracefully WITHOUT showing "Coming soon")
- `action: 'log_intent'` → POST to `/api/wearables/insights/intent` (HK-5a may or may not implement; if 404/501, fall back to dismiss + local note "Logged for review"). Surface errors via toast/inline, not spinner.
- `action: 'dismiss'` → close panel; cache dismissal locally so the same observation doesn't re-prompt for 24h (use MMKV `dismissed_insights` with `(bucket, observation_hash, dismissed_at)`)

**States:**
- Loading: skeleton + "Looking at your last 14 days…" (NOT spinner-only)
- `insufficient_data`: gentle content empty state + CTA to connect more sources (deep-link to ConnectionsScreen)
- `error`: small inline error + Retry; NOT spinner

**S&R CALM rules (from Agent 1 + Mobile Design Intel):**
- NEVER red-color low values; use slate desaturation
- Reassurance copy precedes any deficit number
- Phantom CALM banner if incomplete sleep stages

**A11y:**
- VoiceOver order: reassurance copy first, deficit/data second (S&R), action last
- Confidence chip label includes level + percent
- ErrorBoundary or equivalent

## R65 50-Failures Sweep
- silent failures: 0
- `as any` / `@ts-ignore`: 0
- `.catch(()=>undefined)` / `catch(e){}`: 0
- spinner-only empty/loading/error: 0
- "Coming soon" / "TODO: implement": 0
- test titles: 0 banned phrases (specifically NO "silent")
- coach-only field leak: defensive guard with test
- AbortController on async work
- MMKV dismissal write: encrypted-at-rest (MMKV default); no PII stored
- Optimistic mutation rollback for log_intent if used

## Tests (`ClientInsightPanel.test.tsx`)

1. Collapsed renders observation + confidence
2. Expanded shows norm + intervention + CTA
3. `insufficient_data` → content empty state with connect CTA (not spinner)
4. `error` → inline retry (not spinner)
5. S&R variant orders reassurance BEFORE deficit
6. CTA `deep_link` triggers navigation with correct route
7. CTA `dismiss` writes to MMKV and hides panel
8. Coach-only fields silently absent if backend leaks them (defensive)
9. A11y: confidence chip label includes percent + level
10. Re-mount within 24h after dismissal: panel does not re-render same observation

Test titles plain English. No banned phrases.

## Gates

```
npx tsc --noEmit
npm run lint
npx jest --runInBand
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean
rm -rf ios android; git checkout package.json
```

## Constraints

- Touch only 4 files in write-set.
- Imports from HK-5a's API client + hook ONLY. No edits to those files.
- DO NOT touch backend.
- Title-only commit: `PR-HK-5b: client AI panel with CALM treatment for S&R`
- Push with `--force-with-lease`.

## Coordination with HK-5a

If HK-5a is still open when this builder runs:
- Check if HK-5a head is merged or available on a feature branch.
- If HK-5a is NOT yet merged to main: rebase this branch on top of `hk/PR-HK-5a-coach-ai-panel` instead of main. Document this in the result. When HK-5a merges, re-rebase on main.
- If HK-5a IS merged to main: rebase on origin/main as usual.

## Deliverable

Write `/home/user/workspace/_builder_result_HK_5b.md`:
- New head SHA (40-char) on `hk/PR-HK-5b-client-ai-panel`
- PR URL
- Base branch (main OR hk/PR-HK-5a-coach-ai-panel if HK-5a still open)
- Files changed
- Gate results
- R65 sweep
- Deviations / API contract gaps surfaced
