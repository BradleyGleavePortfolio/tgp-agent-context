# HK-5a — Coach AI Panel (Mobile) — Builder Brief

**PR target:** `BradleyGleavePortfolio/growth-project-mobile` — new PR
**Branch:** `hk/PR-HK-5a-coach-ai-panel`
**Base:** `main` (current head, post-HK-3a merge, will further advance post-HK-3b merge)
**Model:** Opus 4.8 (builder)
**Round:** R1 (builder)
**Depends-on:** HK-3a (merged), HK-3b (pending merge), HK-4 (merged in backend #348)
**Parallel-with:** HK-5b
**Effort:** M

## Bradley R0 LAW (decacorn) — must honor
- NO "Coming soon", silent failures, `as any`, `@ts-ignore`, `catch(e){}`, `.catch(()=>undefined)`, spinner-only empty states. Bans apply to test titles too.
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By.

## Scope

Coach-side AI insight panel inside `HealthFitnessTab.tsx` (HK-3a) + `SleepRecoveryTab.tsx` (HK-3b). Small, progressively-disclosed: one-line observation collapsed by default; expand shows hypothesis + suggested action + draft message + approve/edit CTA.

## Write-set (owned exclusively by this PR)

1. **`src/api/wearableInsightsApi.ts`** (new — shared insight HTTP client; HK-5b imports this)
2. **`src/hooks/useWearableInsights.ts`** (new — React Query wrapper)
3. **`src/screens/coach/client-detail/WearableInsightPanel.tsx`** (new — the panel component)
4. **`src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx`** (new)
5. **`src/screens/coach/client-detail/HealthFitnessTab.tsx`** (one-line add: `<WearableInsightPanel side="coach" bucket="HEALTH_FITNESS" clientId={clientId} />`)
6. **`src/screens/coach/client-detail/SleepRecoveryTab.tsx`** (one-line add: same panel with `bucket="SLEEP_RECOVERY"`)

DO NOT touch: HK-3a/3b's Screen files, navigator files, any backend code, any sibling tab files.

## Backend contract (already shipped in HK-4 backend #348)

Endpoints (verify against `src/wearables/insights/` in backend at current main HEAD; if any field differs, mirror the actual backend types verbatim — backend is source of truth):

- `GET /api/wearables/insights?side=coach&bucket=HEALTH_FITNESS&client_id=<uuid>&window_days=14`
  - 200 → `WearableInsightResponse` (Zod parse)
- `GET /api/wearables/insights?side=client&bucket=SLEEP_RECOVERY&window_days=14` (used by HK-5b — implement compatible types here)
- `POST /api/wearables/insights/refresh` (force-refresh; bypasses 6h cache)

**Response envelope (coach side — verify shape against backend `insight-output.schema.ts`):**
```ts
{
  status: 'ok' | 'insufficient_data' | 'error',
  cached: boolean,
  generated_at: string,            // ISO
  confidence_level: 'i_think' | 'fairly_sure' | 'confident' | 'certain' | 'verified',
  confidence_pct: number,          // 50-99
  bucket: 'HEALTH_FITNESS' | 'SLEEP_RECOVERY',
  observation: string,             // one-liner, plain language
  hypothesis: string,              // coach-only — explains WHY
  suggested_action: string,        // coach-only — concrete intervention
  draft_message: {
    id: string,                    // AiActionDraft uuid
    body: string,
    materialised_at: string | null
  } | null,                        // coach-only
  // NOTE: client requests MUST NOT return hypothesis/suggested_action/draft_message
  //       — that's enforced server-side via response shape. We trust the wire.
}
```

If `status === 'insufficient_data'`: render a content+CTA empty state (NOT spinner-only); copy: "Not enough data yet. Connect more sources or wait a day or two."

If `status === 'error'`: error state with retry CTA (NOT spinner-only).

## API client (`wearableInsightsApi.ts`)

- Use the existing axios instance from `src/services/api.ts` (DO NOT create a new HTTP client).
- Export typed functions:
  - `fetchWearableInsight(params: { side: 'coach'|'client'; bucket: WearableMetricBucket; client_id?: string; window_days?: number }): Promise<WearableInsightResponse>`
  - `refreshWearableInsight(params): Promise<WearableInsightResponse>`
  - `approveInsightDraft(draftId: string, opts?: { editedBody?: string }): Promise<{ id: string; materialised_at: string }>`  → posts to `POST /api/wearables/insights/approve` (HK-6 will land approval controller; for HK-5a, stub the call so it returns a 501 from backend cleanly — see "HK-6 coordination" below).
- All requests Zod-validated on response. Reject on unknown fields with `passthrough` strategy matching `wearablesSamplesApi.ts` (which uses `.strip()`).

## Hook (`useWearableInsights.ts`)

- Two query hooks: `useWearableInsight(coach|client, bucket, clientId?)` (6h staleTime; refetchInterval undefined; cache key versioned).
- One mutation hook: `useApproveInsightDraft()` — optimistic update with rollback (R65 #30). DO NOT silently swallow errors. Surface via `isError` + `error` on bound return (mirror HK-3a's R4 fix to `useWearablePreference`).
- Cache key: `['wearable-insight', side, bucket, clientId ?? 'self', windowDays]`.

## Panel component (`WearableInsightPanel.tsx`)

**Props:**
```ts
type WearableInsightPanelProps = {
  side: 'coach' | 'client';   // coach for this PR; 'client' shape supported but rendered by HK-5b
  bucket: 'HEALTH_FITNESS' | 'SLEEP_RECOVERY';
  clientId?: string;          // required when side === 'coach'
};
```

**Layout (per Agent 1 UX bible + Mobile Design Intel):**
- Collapsed by default — one-line observation + confidence chip + expand affordance
- Expanded: hypothesis (coach-only block, labeled "Why I think this"), suggested action, draft message preview, "Approve & send" CTA, "Edit & send" CTA, "Dismiss" tertiary
- Confidence chip: neutral (NOT green-for-good), `Fairly sure · 70%` style
- Bucket-tinted at low saturation; NO mascot/badge/playful motion
- 44pt touch targets, contrast ≥ 4.5:1
- TestIDs: `wearable-insight-panel-{bucket}`, `wearable-insight-expand-toggle`, `wearable-insight-approve`, `wearable-insight-edit`, `wearable-insight-confidence-{level}`

**States:**
- Loading: skeleton + "Reading the last 14 days…" (not spinner-only — a single skeleton line + text)
- `insufficient_data`: content + CTA empty state ("Connect another source" → deep-link to ConnectionsScreen)
- `error`: error message + Retry CTA
- `ok`: panel as above

**A11y:**
- `accessibilityRole="summary"` on collapsed; `"region"` on expanded
- VoiceOver label includes confidence level
- "Approve & send" announces the draft body length / first line in the a11y hint

**ErrorBoundary:** Wrap the panel in `ErrorBoundary` (use the existing repo one — search `src/components/ErrorBoundary.tsx` or similar; if none, the panel must handle its own error UI cleanly without throwing).

## Approve / edit / send flow (sequenced)

For this PR:
1. "Approve & send" → calls `approveInsightDraft(draft.id)` mutation. On success: panel shows "Sent · just now" inline status; query is invalidated to refresh `draft_message.materialised_at`.
2. "Edit & send" → opens an inline TextInput with the draft body pre-filled; submits via `approveInsightDraft(draft.id, { editedBody })`.
3. Optimistic UI: mark draft as "sending..." on tap; rollback on error.

**HK-6 coordination:** The backend `POST /api/wearables/insights/approve` endpoint may not exist yet (HK-6 owns it). For this PR:
- Implement the client call exactly as it will work when HK-6 lands.
- If the backend returns 501 (Not Implemented) or 404, render an error state with copy "Approval flow not yet available" — DO NOT crash.
- Do NOT add `"Coming soon"` copy; the error state is a real backend response, not a feature stub.
- Once HK-6 merges, this PR's UI works end-to-end without any code change.

## R65 50-Failures Sweep (must pass before push)

- silent failures: 0 (errors visible, no swallow)
- `as any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error`: 0
- `.catch(()=>undefined)`, `catch(e){}`: 0
- spinner-only empty/loading/error states: 0
- "Coming soon" / "TODO: implement": 0
- test titles: 0 banned phrases
- optimistic mutation rollback on error: present
- ErrorBoundary or equivalent error UI: present
- AbortController / unmount cleanup: any async work cancelled on unmount
- Coach-only fields NEVER rendered when `side="client"` — defensive guard in addition to backend enforcement
- Confidence chip color: neutral, NEVER green-for-good
- No coach/client data crossover: types make this impossible at compile time (use a discriminated union on `side`)

## Tests (`WearableInsightPanel.test.tsx`)

Cover at minimum:
1. Collapsed state renders observation + confidence chip
2. Expand reveals hypothesis + suggested action + draft message (coach side)
3. `insufficient_data` renders empty state with CTA (not spinner)
4. `error` renders error state with Retry (not spinner)
5. Approve CTA fires mutation; optimistic UI shows "Sending…"; success transitions to "Sent · just now"
6. Approve failure rolls back optimistic UI and surfaces `isError`
7. Client-side panel does NOT render `hypothesis` / `suggested_action` / `draft_message` even if backend somehow returned them (defensive)
8. A11y: confidence chip label includes percent + level text

Test titles: descriptive plain English, NO banned phrases. Use existing test conventions (`describe('WearableInsightPanel', () => {...})`).

## Gates (all must pass)

```
npx tsc --noEmit
npm run lint (or npx eslint .)
npx jest --runInBand
npx expo prebuild --platform ios --clean
npx expo prebuild --platform android --clean
rm -rf ios android
git checkout package.json
```

CI must remain green.

## Constraints

- Touch only the 6 files in write-set. Mounting in HF/SR tabs is a single line each.
- DO NOT touch backend code.
- DO NOT modify HK-3a/3b screens, navigators, samples API, samples hook.
- Title-only commit: `PR-HK-5a: coach AI panel + shared insights API client`
- Push with `--force-with-lease`.

## Deliverable

Write `/home/user/workspace/_builder_result_HK_5a.md`:
- New head SHA (40-char) on `hk/PR-HK-5a-coach-ai-panel`
- PR URL (opened via `gh pr create --base main --head hk/PR-HK-5a-coach-ai-panel --title "..." --body "..."`)
- Files changed + line counts
- Gate results (all green)
- R65 sweep
- Any deviations or contract gaps surfaced during build
