# HK-5a — Coach AI Insight Panel (Mobile) — Builder Brief

**PR target:** `BradleyGleavePortfolio/growth-project-mobile`
**Branch:** `hk/PR-HK-5a-coach-ai-panel`
**Base:** `main` (will be at HK-3b merge head when you start — pull/rebase before working)
**Model:** Opus 4.8 (builder)
**Round:** R1
**Depends-on:** HK-3a (merged), HK-3b (merged), HK-4 backend (merged in #348)
**Parallel-with:** HK-5b
**Effort:** M

## Bradley R0 LAW (decacorn) — every commit must honor

- NO "Coming soon" anywhere (production code, comments, test text, regex assertions, docblocks). The string MUST NOT appear in the diff.
- NO `as any`, NO `as unknown as`, NO `@ts-ignore`, NO `@ts-nocheck`.
- NO `.catch(()=>undefined)`, NO `catch(e){}`, NO empty catch blocks.
- NO spinner-only empty states. Every loading / empty / error state must have copy + (where applicable) a CTA.
- Commit author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By.
- Acceptable casts: single-step `as TypeName` (when source has all required fields), `satisfies T`, `@ts-expect-error <reason>`. NEVER widen through `unknown`.

## Mandatory references (read first)

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` (R65 sweep)
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (full design intel)
- `/tmp/tgp-agent-context/applehealthkit/AGENT_1_UX_PLAN.md` §4.4–4.5, §6 (AI panel + approval flow design spec)

## Scope

Small, progressively-disclosed coach AI panel placed inside:
- `HealthFitnessTab.tsx` (HK-3a) — below the anomaly band, above metric cards
- `SleepRecoveryTab.tsx` (HK-3b) — same placement; inherits cool CALM accent

**Restraint:** Small card, NOT a full chat. Collapsed = one-line observation + bucket-tinted confidence chip. Expanded = observation + hypothesis + suggested action + draft message preview + "Review message" CTA.

## Write-set (owned exclusively by this PR)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/api/wearableInsightsApi.ts` (NEW) | Shared HTTP client + Zod types. HK-5b imports this. |
| 2 | `src/api/__tests__/wearableInsightsApi.test.ts` (NEW) | Coverage |
| 3 | `src/hooks/useWearableInsight.ts` (NEW) | React Query wrapper |
| 4 | `src/hooks/__tests__/useWearableInsight.test.tsx` (NEW) | |
| 5 | `src/screens/coach/client-detail/WearableInsightPanel.tsx` (NEW) | The panel component |
| 6 | `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx` (NEW) | |
| 7 | `src/screens/coach/client-detail/HealthFitnessTab.tsx` (one-line add) | Mount `<WearableInsightPanel side="coach" bucket="HEALTH_FITNESS" clientId={clientId} />` |
| 8 | `src/screens/coach/client-detail/SleepRecoveryTab.tsx` (one-line add) | Mount `<WearableInsightPanel side="coach" bucket="SLEEP_RECOVERY" clientId={clientId} />` |

**DO NOT touch:** any HK-3a/3b screen internals beyond the one-line panel mount, navigators, backend code, any sibling tab files, client-side screens.

## Backend contract — MIRROR EXACTLY (from HK-4 backend at current `main`)

**Endpoints (verify against `growth-project-backend` `src/wearables/insights/wearable-insights.controller.ts`):**

```
GET /v1/wearables/insights/coach?clientId=<uuid>&bucket=HEALTH_FITNESS
GET /v1/wearables/insights/coach?clientId=<uuid>&bucket=SLEEP_RECOVERY
```

**Response shape (coach side — direct from backend `insight-output.schema.ts`):**

```ts
// CoachInsightResponse = union of either a full CoachInsight or an EmptyInsight
// (discriminated by `is_empty` literal on EmptyInsight)

// Full insight branch:
interface CoachInsight {
  observation: string;                  // 1–280 chars
  hypothesis: string;                   // 1–280 chars
  suggested_action: string;             // 1–280 chars
  suggested_message_draft: string;      // 1–1000 chars  (PLAIN STRING — no draft id yet; HK-6 creates the AiActionDraft row on approve)
  confidence_level: 'i_think' | 'fairly_sure' | 'confident' | 'certain' | 'verified';
  source_metrics: WearableMetricType[]; // ≥1
}

// Empty branch:
interface EmptyInsight {
  observation: 'Not enough data yet — keep syncing.';
  confidence_level: 'i_think';
  source_metrics: [];                   // length 0
  is_empty: true;
}
```

There is **NO `/approve` endpoint yet** — that's HK-6's responsibility. For HK-5a, the "Review message" CTA opens a local `MessageDraftReviewSheet` (modal) that lets the coach edit the draft text and shows the actions: **Approve & send**, **Edit then send**, **Dismiss**. The Approve/Edit handlers should call `wearableInsightsApi.approveDraft()` which posts to `POST /v1/wearables/insights/approve` — **this endpoint does not exist yet**. So:

1. Implement `approveDraft({ clientId, bucket, draftBody, action: 'approve' | 'edit' | 'dismiss' })` as a typed function that hits `POST /v1/wearables/insights/approve` with body `{ client_id, bucket, draft_body, action }`.
2. The mutation hook MUST surface real errors. Don't silently mask the 404 you'll get until HK-6 ships.
3. Wire a graceful degradation: if the backend returns 404 with a `not_implemented` error code, show a calm "Approval is rolling out — try again later." copy WITH retry CTA — NOT a silent failure, NOT a spinner. (HK-6 will replace this with the real flow within days.)

This decision is intentional: it lets HK-5a + HK-5b ship in parallel before HK-6 lands, and the user-visible degraded state is honest and recoverable.

## File 1 — `src/api/wearableInsightsApi.ts`

```ts
import { z } from 'zod';
import { api } from '../services/api';
// WearableMetricType comes from src/api/wearablesSamplesApi.ts — IMPORT it; do NOT redeclare.
import { WearableMetricType } from './wearablesSamplesApi';
// WearableMetricBucket from same source.
import { WearableMetricBucket } from './wearablesSamplesApi';

// Confidence labels — keep in sync with backend insight-output.schema.ts.
// If backend adds a new label, ts will fail-loud on the next pull.
export const CONFIDENCE_LEVELS = ['i_think', 'fairly_sure', 'confident', 'certain', 'verified'] as const;
export const ConfidenceLevelSchema = z.enum(CONFIDENCE_LEVELS);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

// Confidence label → display percentage (per UX plan §4.5)
export const CONFIDENCE_PCT: Record<ConfidenceLevel, number> = {
  i_think: 50,
  fairly_sure: 70,
  confident: 85,
  certain: 95,
  verified: 100,
};

// Confidence label → human-readable label (per UX plan §4.5)
export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  i_think: 'I think',
  fairly_sure: 'Fairly sure',
  confident: 'Confident',
  certain: 'Certain',
  verified: 'Verified',
};

const SourceMetricSchema = z.nativeEnum(WearableMetricType);

// Full coach payload — mirrors backend CoachInsightSchema EXACTLY (.strict())
export const CoachInsightSchema = z
  .object({
    observation: z.string().min(1).max(280),
    hypothesis: z.string().min(1).max(280),
    suggested_action: z.string().min(1).max(280),
    suggested_message_draft: z.string().min(1).max(1000),
    confidence_level: ConfidenceLevelSchema,
    source_metrics: z.array(SourceMetricSchema).min(1),
  })
  .strict();
export type CoachInsight = z.infer<typeof CoachInsightSchema>;

// Empty branch — mirrors backend EmptyInsightSchema
export const EMPTY_OBSERVATION = 'Not enough data yet — keep syncing.';
export const EmptyInsightSchema = z
  .object({
    observation: z.literal(EMPTY_OBSERVATION),
    confidence_level: z.literal('i_think'),
    source_metrics: z.array(SourceMetricSchema).length(0),
    is_empty: z.literal(true),
  })
  .strict();
export type EmptyInsight = z.infer<typeof EmptyInsightSchema>;

// Client payload (shipped here for HK-5b to import — HK-5b owns the consumer; HK-5a owns the type def + endpoint)
export const ClientInsightSchema = z
  .object({
    observation: z.string().min(1).max(280),
    norm_comparison: z.string().min(1).max(280),
    intervention: z.string().min(1).max(280),
    optional_cta: z
      .object({
        label: z.string().min(1).max(40),
        deep_link: z.string().regex(/^tgp:\/\//),
      })
      .nullable(),
    confidence_level: ConfidenceLevelSchema,
    source_metrics: z.array(SourceMetricSchema).min(1),
  })
  .strict();
export type ClientInsight = z.infer<typeof ClientInsightSchema>;

export const CoachInsightResponseSchema = z.union([CoachInsightSchema, EmptyInsightSchema]);
export type CoachInsightResponse = z.infer<typeof CoachInsightResponseSchema>;

export const ClientInsightResponseSchema = z.union([ClientInsightSchema, EmptyInsightSchema]);
export type ClientInsightResponse = z.infer<typeof ClientInsightResponseSchema>;

export function isEmptyInsight(
  v: CoachInsightResponse | ClientInsightResponse,
): v is EmptyInsight {
  return (v as Partial<EmptyInsight>).is_empty === true;
}

// Approve payload — speculative; HK-6 will land the real endpoint.
// Validation: server returns { draft_id, materialised_at } on success or
// { error: 'not_implemented' } pre-HK-6.
const ApproveResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), draft_id: z.string().uuid(), materialised_at: z.string() }),
  z.object({ status: z.literal('not_implemented'), message: z.string() }),
]);
export type ApproveResponse = z.infer<typeof ApproveResponseSchema>;

export async function fetchCoachInsight(params: {
  clientId: string;
  bucket: WearableMetricBucket;
}): Promise<CoachInsightResponse> {
  const res = await api.get('/v1/wearables/insights/coach', {
    params: { clientId: params.clientId, bucket: params.bucket },
  });
  return CoachInsightResponseSchema.parse(res.data);
}

export async function fetchClientInsight(params: {
  bucket: WearableMetricBucket;
}): Promise<ClientInsightResponse> {
  const res = await api.get('/v1/wearables/insights/client', { params: { bucket: params.bucket } });
  return ClientInsightResponseSchema.parse(res.data);
}

export async function approveDraft(payload: {
  clientId: string;
  bucket: WearableMetricBucket;
  draftBody: string;       // may differ from suggested_message_draft if coach edited
  action: 'approve' | 'edit' | 'dismiss';
}): Promise<ApproveResponse> {
  // Pre-HK-6 the backend returns 404 — the controller treats that as a
  // typed not_implemented response so the panel can degrade gracefully.
  // Once HK-6 lands the real controller this still validates against the
  // same schema since the success branch is also forward-compatible.
  try {
    const res = await api.post('/v1/wearables/insights/approve', {
      client_id: payload.clientId,
      bucket: payload.bucket,
      draft_body: payload.draftBody,
      action: payload.action,
    });
    return ApproveResponseSchema.parse(res.data);
  } catch (err: unknown) {
    // Coerce a 404 into a typed not_implemented response — the calling hook
    // surfaces this to the user as a calm CTA, NOT a silent failure.
    const e = err as { response?: { status?: number } };
    if (e?.response?.status === 404) {
      return { status: 'not_implemented', message: 'Approval workflow is rolling out — try again later.' };
    }
    throw err;
  }
}
```

## File 3 — `src/hooks/useWearableInsight.ts`

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCoachInsight,
  fetchClientInsight,
  approveDraft,
  CoachInsightResponse,
  ClientInsightResponse,
  ApproveResponse,
} from '../api/wearableInsightsApi';
import type { WearableMetricBucket } from '../api/wearablesSamplesApi';

const INSIGHT_STALE_MS = 6 * 60 * 60 * 1_000; // 6h — matches backend cache

export function useCoachInsight(args: { clientId: string; bucket: WearableMetricBucket; enabled?: boolean }) {
  return useQuery<CoachInsightResponse, Error>({
    queryKey: ['wearable-insight', 'coach', args.clientId, args.bucket],
    queryFn: () => fetchCoachInsight({ clientId: args.clientId, bucket: args.bucket }),
    enabled: args.enabled ?? true,
    staleTime: INSIGHT_STALE_MS,
  });
}

export function useClientInsight(args: { bucket: WearableMetricBucket; enabled?: boolean }) {
  return useQuery<ClientInsightResponse, Error>({
    queryKey: ['wearable-insight', 'client', args.bucket],
    queryFn: () => fetchClientInsight({ bucket: args.bucket }),
    enabled: args.enabled ?? true,
    staleTime: INSIGHT_STALE_MS,
  });
}

export function useApproveDraft() {
  const qc = useQueryClient();
  return useMutation<ApproveResponse, Error, Parameters<typeof approveDraft>[0]>({
    mutationFn: approveDraft,
    onSuccess: (res, vars) => {
      // Invalidate the coach insight so the next view reflects the materialised draft (post-HK-6)
      if (res.status === 'ok') {
        qc.invalidateQueries({ queryKey: ['wearable-insight', 'coach', vars.clientId, vars.bucket] });
      }
    },
    // NO onError that silently swallows. Errors propagate to caller.
  });
}
```

## File 5 — `src/screens/coach/client-detail/WearableInsightPanel.tsx`

**Design requirements (from UX plan §4.4–4.5):**
- Small card; bucket-tinted accent at low saturation (cool indigo→slate for SLEEP_RECOVERY, warmer for HEALTH_FITNESS — reuse the bucket tokens from HK-3a/3b).
- Collapsed: one-line observation + confidence chip on the right. Tap area = entire card.
- Expanded (`accessibilityRole='button'`, `accessibilityState={{ expanded }}`): observation → hypothesis → suggested action → draft message preview (truncated to 2 lines with "Read more") → "Review message" CTA button.
- Confidence chip: neutral pill (no green-for-good) — text = `CONFIDENCE_LABEL[level]` + " (" + `CONFIDENCE_PCT[level]` + "%)".
- States:
  - Loading: skeleton (NOT spinner-only) — three lines of subtle shimmer + chip placeholder.
  - Empty (`is_empty`): copy = the literal observation string (`"Not enough data yet — keep syncing."`) + secondary line: `"Once we have ~3 days of data, your AI will flag patterns."` NO chip.
  - Error: copy = `"We couldn't load this insight."` + secondary line with `error.message` truncated to 1 line + Retry button. NO error-message regurgitation that could leak internals — show a sanitized line if the underlying error has a status code (e.g. 403 → "You don't have access to this client's insights"; 5xx → "The server is temporarily unavailable").
- "Review message" CTA opens `MessageDraftReviewSheet` (modal — implement inline in this file or as a sub-component).

**`MessageDraftReviewSheet`:**
- Bottom sheet (existing `BottomSheetModal` if the app has one — verify via `grep -r 'BottomSheet' src/ | head`; if not, a full-screen Modal with translucent backdrop is fine).
- Editable `TextInput` (multiline) pre-filled with `suggested_message_draft`. 1000 char max.
- Three actions:
  - **Approve & send** (primary) → calls `approveDraft({ ..., draftBody: <original>, action: 'approve' })`
  - **Edit then send** (secondary, enabled only when the text has been edited) → calls with `action: 'edit'` and the edited body
  - **Dismiss** (tertiary, ghost) → calls with `action: 'dismiss'` (no body)
- On `approveDraft.status === 'ok'`: dismiss the sheet, show inline confirmation **on the panel** (not a toast that disappears too fast): "Sent to <client first name>" — copy is honest and forward-looking per UX §5.3. Replace the panel content with the forward hook for ~3s, then refetch the insight.
- On `approveDraft.status === 'not_implemented'`: keep the sheet open, show inline calm copy beneath the textarea: `"Approval is rolling out — try again later."` Disable primary CTA temporarily.
- On thrown error: show error inline beneath the textarea + Retry button. NO silent swallow.

**Accessibility:**
- `accessibilityLabel` on card root: `"Coach AI insight, ${confidenceLabel}, ${observation}, tap to expand"`
- `accessibilityRole='button'`
- Modal: `accessibilityViewIsModal` on iOS
- Honor `useReduceMotion()` for expand/collapse animation (mirror HK-3b `HrvTrendCard`)

**Token usage:** Use design tokens from `src/theme/*` or wherever the app stores them — find via `grep -rn 'theme.colors\|tokens\.' src/screens/wearables | head`. Reuse the bucket-tint tokens that HK-3a/3b already use; do NOT introduce hex literals.

## Tests

### `wearableInsightsApi.test.ts`
- Coach fetch: happy path (CoachInsight), empty path (EmptyInsight), 403, 500.
- Approve: 200 ok, 404 → typed `not_implemented`, 500 throws.
- Zod rejects: response missing required field; response with extra unknown field (`.strict()` enforcement).

### `useWearableInsight.test.tsx`
- Uses `QueryClientProvider` wrapper (mirror existing test infra in `__tests__/setup.ts` or wherever).
- Coach query: loading → success.
- Approve mutation: success path invalidates coach insight key; not_implemented path does NOT invalidate.

### `WearableInsightPanel.test.tsx`
- Renders loading skeleton initially.
- Expanded state renders all four fields.
- Empty state renders the literal copy + secondary line.
- Error state renders sanitized copy + Retry.
- Review message sheet: open / close / edit detection / dismiss.
- Confidence chip uses `CONFIDENCE_LABEL[level]` and percentage.
- Approve calls mutation; on 'ok' replaces panel with forward hook.
- Approve on 'not_implemented' keeps sheet open with calm message.
- No banned strings ("Coming soon", "silent", etc.).

## Gates (must all pass before commit)

```bash
cd /tmp/wt-hk5a   # create via: git worktree add /tmp/wt-hk5a -b hk/PR-HK-5a-coach-ai-panel origin/main
ln -sf /tmp/wt-hk3a-mobile-r4/node_modules /tmp/wt-hk5a/node_modules

npx tsc --noEmit 2>&1 | tee /tmp/5a_tsc.log; echo "EXIT $?"      # must be 0
npx eslint --no-error-on-unmatched-pattern 'src/api/wearableInsightsApi.ts' 'src/hooks/useWearableInsight.ts' 'src/screens/coach/client-detail/WearableInsightPanel.tsx' 'src/screens/coach/client-detail/__tests__/**' 'src/api/__tests__/wearableInsightsApi.test.ts' 'src/hooks/__tests__/useWearableInsight.test.tsx' 2>&1 | tee /tmp/5a_lint.log; echo "EXIT $?"
npx jest --ci --testPathPattern='(wearableInsightsApi|useWearableInsight|WearableInsightPanel)' 2>&1 | tail -60
npx expo prebuild --platform ios --no-install --clean 2>&1 | tail -5
npx expo prebuild --platform android --no-install --clean 2>&1 | tail -5
git checkout -- package.json && rm -rf ios android
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) ?=> ?undefined\)|catch ?\(.\) ?\{\s*\}|catch ?\(\) ?\{\s*\}' && echo "R0 VIOLATIONS — STOP" || echo "R0 BANS: CLEAN"
```

## Commit + push

```bash
git add -A
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -m "PR-HK-5a: coach AI insight panel + review-and-approve sheet"
git push origin hk/PR-HK-5a-coach-ai-panel
gh pr create --repo BradleyGleavePortfolio/growth-project-mobile \
  --base main --head hk/PR-HK-5a-coach-ai-panel \
  --title "PR-HK-5a: coach AI insight panel + review-and-approve sheet" \
  --body "$(cat <<EOF
Adds the small, progressively-disclosed coach AI insight panel to the
client-detail Fitness and Recovery tabs, with a Review/Edit/Approve
message-draft sheet.

Backend contract: GET /v1/wearables/insights/coach (HK-4, shipped).
Approval endpoint POST /v1/wearables/insights/approve is added by HK-6;
this PR degrades gracefully to a typed 'not_implemented' response with
calm copy + retry until HK-6 lands.

R0 / decacorn: no Coming-soon, no silent failures, no banned casts.
50-Failures: schema strict-mode, sanitized error messages, optimistic
rollback on approve, unmount cleanup, no fetch-loops.

CI must be green before merge.
EOF
)"
```

## Output

Write a result report to `/home/user/workspace/_builder_result_HK_5a_coach_ai_panel.md`:
- Head SHA (full 40-char)
- PR number
- Gate exit codes
- File list with line counts
- 50-Failures sweep notes (which categories you actively defended)
- Mobile Design Intel notes (which sections you mapped to which token/component)
- Commit metadata proof (author, no Co-Authored-By/Generated-By)
- R0 ban grep proof

Verdict: `READY_FOR_AUDIT` or `BLOCKED` (with reason).

## Important constraints

- This PR ships its API client (`wearableInsightsApi.ts`) FIRST — HK-5b will import from it. Make sure types are exported and the file compiles cleanly so HK-5b can land in parallel without merge conflict.
- DO NOT modify `wearablesSamplesApi.ts` — only import from it.
- DO NOT touch HK-3a/3b's tab internals beyond the one-line panel mount.
- If a token / theme path doesn't exist as I described, grep the codebase and adapt — document the deviation in the result file.
