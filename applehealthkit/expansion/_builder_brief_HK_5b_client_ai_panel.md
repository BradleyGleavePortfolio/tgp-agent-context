# HK-5b Builder Brief — Client AI Insight Panel

**Phase:** 2b (mobile)
**PR target:** `hk/PR-HK-5b-client-ai-panel` (already created locally at `/tmp/wt-hk5b`, base = `b83616a4...` post-HK-5a merge)
**Model:** Opus 4.8 (Sonnet 4.6 FORBIDDEN)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`.

## Bradley R0 LAW (verbatim)

- NO "Coming soon" string anywhere in the diff — production, comments, **test titles**, **test regex assertions**, docblocks. Includes negation patterns like `expect(...).not.toMatch(/coming soon/i)`. If you find yourself wanting to write a hygiene guard, **just don't**; positive assertions are sufficient.
- NO `@ts-ignore` / `@ts-nocheck` / `as any` / `as unknown as` / `.catch(()=>undefined)` / `catch(e){}` / spinner-only empty states.
- `@ts-expect-error` with a justification IS allowed (R0-permitted escape).

## Two training docs to abide AT ALL TIMES

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`

R55 — pin any reference SHA to its full 40-char form.
R65 — run the full 50-Failures sweep before reporting READY_FOR_AUDIT.

---

## Backend contract (ground truth — DO NOT INVENT)

Source: `/tmp/gpb-clone/src/wearables/insights/insight-output.schema.ts` (already pinned in `src/api/wearableInsightsApi.ts` on HK-5a).

**ClientInsight schema (`.strict()`):**
```ts
{
  observation: z.string().min(1).max(280),
  norm_comparison: z.string().min(1).max(280),
  intervention: z.string().min(1).max(280),
  optional_cta: z.object({ label: z.string().min(1).max(40), deep_link: z.string().regex(/^tgp:\/\//) }).nullable(),
  confidence_level: ConfidenceLevelSchema,        // i_think | fairly_sure | confident | certain | verified
  source_metrics: z.array(SourceMetricSchema).min(1),
}
```

**EmptyInsight:**
```ts
{ observation: 'Not enough data yet — keep syncing.', confidence_level: 'i_think', source_metrics: [], is_empty: true }
```

**Endpoint** (already in `wearableInsightsApi.ts`):
```
GET /v1/wearables/insights/client?bucket=HEALTH_FITNESS|SLEEP_RECOVERY
```

**No approval endpoint on the client side.** The client surface does NOT call `POST /v1/wearables/insights/approve` — that is coach-only (HK-6). Clients have NO message editor, NO approve/dismiss controls.

## Infra HK-5a already provides (DO NOT RE-IMPORT FROM ELSEWHERE)

In `src/api/wearableInsightsApi.ts`:
- `ClientInsight`, `EmptyInsight`, `ClientInsightResponse`, `isEmptyInsight`
- `CONFIDENCE_LEVELS`, `CONFIDENCE_LABEL`, `CONFIDENCE_PCT`
- `insightQueryKeys.client(bucket)` (already `'v1'`-versioned)
- `fetchClientInsight(...)`

In `src/hooks/useWearableInsight.ts`:
- `useClientInsight({ bucket })` — returns `{ data, isLoading, isError, error, refetch, isRefetching }`

In `src/screens/client/wearables/wearablesTheme.ts`:
- `toneForBucket(bucket)`, `toneTokens` — including `accent` + `accentInk` (warm = gold[800] = #6B4F1A AA-safe / cool = forest #2C4A36 AA-safe)

In both client screens (`HealthFitnessScreen.tsx`, `SleepRecoveryScreen.tsx`):
- `aiPanelSlot?: React.ReactNode` prop is already wired and rendered at the end of the scroll content. **You will pipe your new `<ClientWearableInsightPanel/>` into that slot via `WearablesShell.tsx`.**

## Linked design context (mandatory reading)

- `applehealthkit/AGENT_1_UX_PLAN.md` §4.4–4.5 (AI panel UX)
- `applehealthkit/AGENT_1_UX_PLAN.md` §6 (states matrix)
- HK-5a coach panel (`src/screens/coach/client-detail/WearableInsightPanel.tsx`) — STRUCTURE/LAYOUT TEMPLATE only; client surface is **simpler** (no review-sheet) and **read-only**.

---

## Scope — what HK-5b builds

### Files to ADD

1. `src/screens/client/wearables/ClientWearableInsightPanel.tsx` — the client-side AI panel component
2. `src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx` — full state-matrix tests

### Files to EDIT (minimal)

3. `src/screens/client/wearables/WearablesShell.tsx` — mount `<ClientWearableInsightPanel bucket={...} />` and pass to each screen's `aiPanelSlot`
4. `src/screens/client/wearables/__tests__/WearablesShell.test.tsx` — new test asserting both buckets receive a mounted panel

### Files to NOT TOUCH

- `wearableInsightsApi.ts`, `useWearableInsight.ts`, `wearablesTheme.ts` — already correct
- The coach panel (`WearableInsightPanel.tsx`) — out of scope
- ANY HK-3a/3b artefact

---

## Component contract: `ClientWearableInsightPanel`

```ts
export interface ClientWearableInsightPanelProps {
  readonly bucket: WearableMetricBucket; // 'HEALTH_FITNESS' | 'SLEEP_RECOVERY'
  /**
   * Test-only handle so the test harness can pre-seed deep-link interactions.
   * Production code should NOT pass this — the panel resolves Linking.openURL
   * itself. Use this ONLY in `__tests__/`.
   */
  readonly onCtaPress?: (deepLink: string) => void;
}
```

### State matrix (every branch must render — NO spinners, NO "Coming soon")

| State | What renders |
|---|---|
| Loading (≥150ms) | Skeleton card with skeleton lines mirroring the real layout (4–5 shimmer bars at observation/norm/intervention/cta heights). Honour `useReduceMotion` — no shimmer when reduced motion is on. |
| Empty (`is_empty: true`) | Card with literal observation copy ("Not enough data yet — keep syncing."), a secondary line ("We'll add insights here as your devices report more."), NO confidence chip, NO CTA. |
| Error | Sanitized one-liner (no raw error text) + a `Retry` button using `tone.accentInk`. Use existing `sanitizeError` (defined in `WearableInsightPanel.tsx` — duplicate the helper locally or extract to `wearablesTheme.ts` as `sanitizeWearableError(err)`; prefer local duplication if extraction would touch the coach file). |
| Loaded (full ClientInsight) | Header row: bucket icon + confidence chip (neutral pill — `tone.accent` border with `withAlpha(tone.accent, 0.1)` fill; CHIP TEXT must be `colors.charcoal`; NEVER green-for-good). Body: **Observation** label + value; **Norm comparison** label + value; **Intervention** label + value (this is the actionable line — emphasize via typography weight/size). Optional CTA: if `optional_cta` is non-null, render a primary button `tone.accentInk` fill with bone text, label from `optional_cta.label`, on press → validate deep_link starts with `tgp://` and call `Linking.openURL(...)` (or `onCtaPress(deepLink)` in tests). If validation fails (defence-in-depth even though backend already enforces), do NOT open the link — log via existing `panelLogger` if available, otherwise silently no-op. |

### Visual rules

- All sizing/spacing via `spacing`, `radius`, `typography` from `src/theme/tokens.ts`.
- All colours via `tone.*` (from `toneForBucket(bucket)`) + `colors.*`. NO raw hex literals in component source.
- Confidence chip: neutral pill — border = `withAlpha(tone.accent, 0.4)`, fill = `withAlpha(tone.accent, 0.10)`, text = `colors.charcoal`, format = `{CONFIDENCE_LABEL[confidence]} · {CONFIDENCE_PCT[confidence]}%`.
- CTA buttons (any): fill = `tone.accentInk`, text = `colors.bone`, height ≥ 44pt (Apple HIG tap target).
- Card surface = `colors.bone`, border = `colors.stone` or hairline `withAlpha(tone.accent, 0.3)`, radius = `radius.lg`.
- Expand animation (if you add one): respect `useReduceMotion()` — no fade when reduced.

### Accessibility

- The card root has `accessibilityRole="region"` and an `accessibilityLabel="AI insight, {bucket-human-label}"`.
- The confidence chip has `accessibilityLabel="{CONFIDENCE_LABEL} confidence"`.
- Each labelled section uses `accessibilityRole="text"` and the label-value pair has a visible label.
- The CTA button has `accessibilityRole="button"` + `accessibilityLabel={optional_cta.label}`.
- Retry button has `accessibilityRole="button"`, `accessibilityLabel="Retry"`.

---

## Wiring (`WearablesShell.tsx`)

```tsx
// At top of file, near other imports
import ClientWearableInsightPanel from './ClientWearableInsightPanel';

// In the render switch — replace
<HealthFitnessScreen />
// with
<HealthFitnessScreen aiPanelSlot={<ClientWearableInsightPanel bucket="HEALTH_FITNESS" />} />

// and
<SleepRecoveryScreen />
// with
<SleepRecoveryScreen bucketParam={...prior props} aiPanelSlot={<ClientWearableInsightPanel bucket="SLEEP_RECOVERY" />} />
```

(Use the exact existing `SleepRecoveryScreen` prop signature when wiring — don't drop required props.)

---

## Tests

In `__tests__/ClientWearableInsightPanel.test.tsx`, cover every state. Use the React Query `QueryClientProvider` test wrapper pattern from HK-5a's `WearableInsightPanel.test.tsx` (per-test `QueryClient`, `afterEach` `qc.clear()` + `qc.unmount()`, `mutations: { gcTime: 0 }` on `QueryClient` config — same exit-clean fix that landed in HK-5a R2).

**Required test cases (minimum):**

1. Loading state renders skeleton (not spinner). Verify no `ActivityIndicator` in tree.
2. Empty state renders the literal observation + secondary copy; NO confidence chip; NO CTA.
3. Error state renders a sanitized message + Retry button; pressing Retry calls `useClientInsight().refetch()` (or equivalent — the hook exposes it).
4. Loaded state with `optional_cta = null` renders observation/norm/intervention but NO CTA button.
5. Loaded state with `optional_cta = { label: 'Open sleep tips', deep_link: 'tgp://wearables/sleep-tips' }` renders the CTA; pressing it calls the `onCtaPress` test handle with the deep link.
6. Loaded state with an UNSAFE `optional_cta.deep_link` (e.g. `https://evil.com`) — even though backend schema rejects this, your component MUST also refuse to open it. Construct the test by passing the unsafe value via a mocked `useClientInsight` (cast through the hook mock; do NOT use `as any` — use `as ClientInsightResponse` after building a valid response object, then mutate the field via `Object.assign` which doesn't violate R0). Assert `onCtaPress` is NOT called.
7. Confidence chip text matches `{CONFIDENCE_LABEL[confidence]} · {CONFIDENCE_PCT[confidence]}%` for at least two confidence levels.
8. `accessibilityLabel` on the root + chip + CTA + Retry are all present.

In `__tests__/WearablesShell.test.tsx`, add one test asserting the panel mounts on each bucket (a `testID` on the panel root or `getByLabelText` against the accessibility label is fine). Do NOT remove or break existing assertions.

**ONE positive test that the banned phrase does not appear** — NOT in regex. Just keep the empty-state assertion `expect(getByText('Not enough data yet — keep syncing.')).toBeTruthy()` and DON'T add any `not.toMatch` guard. R0 enforcement happens via grep on the diff, not via runtime negation.

---

## Quality gates BEFORE reporting READY_FOR_AUDIT

Run each from `/tmp/wt-hk5b`. All must pass:

```bash
cd /tmp/wt-hk5b

# 1. TypeScript
npx tsc --noEmit
# exit 0 required

# 2. ESLint on touched files
TOUCHED=$(git diff --name-only origin/main..HEAD -- '*.ts' '*.tsx' | tr '\n' ' ')
npx eslint $TOUCHED
# exit 0 required

# 3. Targeted Jest pattern
npx jest --testPathPattern='(ClientWearableInsightPanel|WearablesShell|wearableInsightsApi|useWearableInsight)' --runInBand
# exit 0 required; NO "Jest did not exit one second after the test run has completed" warning

# 4. R0 added-line sweep (REQUIRED — full diff has false positives from removed lines)
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+' | grep -v '^+++' \
  | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) => undefined\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# MUST return empty (grep exit 1)

# 5. Author check
git log -1 --format='%an <%ae>%n%B'
# expect: Dynasia G <dynasia@trygrowthproject.com>, title-only, NO Co-Authored-By, NO Generated-By
```

### 50-Failures sweep (R65) — actively walk

- **#2 strict schemas:** ClientInsightSchema already `.strict()` — your component MUST handle the discriminated union via `isEmptyInsight`, not by checking for individual fields.
- **#5 IDOR / tenant boundary:** the hook & API enforce this; your component just consumes; don't pass `clientId` (the client surface has no notion of "another user's data" — the JWT is the only identity).
- **#12 error sanitization:** use a `sanitizeError` helper. NEVER render `error.message` directly.
- **#19/#25 cache hygiene:** the keys are already `v1`-versioned; don't override.
- **#28 race:** the panel reads `useClientInsight(...)` — no mutation here, so race is mostly moot, but: if you accept an `onCtaPress` callback that triggers `Linking.openURL`, guard against double-tap by disabling the button while a navigation is in flight (use a local `useState` boolean flipped in a `useCallback`, OR rely on `Pressable`'s `disabled` after first press for the lifetime of the press).
- **#32 unmount cleanup:** no timers/refs added beyond `useState` and `useCallback`, so OK.
- **#35/#50 graceful degradation:** the empty-insight branch is the explicit "we computed nothing" state. Render it calmly, no error styling.
- **#48 CI clean exit:** mirror HK-5a's `afterEach` QueryClient cleanup pattern.

### Quality bar self-check

Before declaring CLEAN, **read your own component as if you were the visual auditor**:
- Is every text/CTA on the warm bucket ≥4.5:1 contrast vs its surface? (You're reusing `tone.accentInk = gold[800]` which is verified AA — verify you didn't introduce any `tone.accent` text-on-light yourself.)
- Does the empty state read with **CALM warmth** (per MOBILE_APP_DESIGN_INTELLIGENCE §2.2), not as a failure?
- Does the loading skeleton mirror the real layout (per §4.5 progressive disclosure)?
- Is the CTA explicit about its target (per §4.7 — labels should be specific, not generic "Continue")?

---

## Commit / push protocol

- **Single commit** (rebase-merge later squashes).
- Conventional title: `feat(wearables): HK-5b — client AI insight panel with norm comparison + intervention + deep-link CTA`
- Author exactly `Dynasia G <dynasia@trygrowthproject.com>` (title-only, no trailers).

Commit pattern:
```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "<title>"
```

Push pattern (auth via `api_credentials=["github"]` — token is `$GITHUB_TOKEN`, never print, never `gh auth status`):
```bash
git push -u origin hk/PR-HK-5b-client-ai-panel
```

Open the PR:
```bash
gh pr create --repo BradleyGleavePortfolio/growth-project-mobile \
  --base main --head hk/PR-HK-5b-client-ai-panel \
  --title "PR-HK-5b: client AI insight panel" \
  --body "Builds the client-side AI insight panel reading from /v1/wearables/insights/client. Reuses HK-5a's API client/hook + AA-safe accentInk tokens. No approval surface on client side (HK-6 will own coach-only approve)."
```

## Deliverables (write to workspace + commit to context)

- Updated PR branch + open PR number (capture from `gh pr create` output).
- `/home/user/workspace/_builder_result_HK_5b_client_ai_panel.md` with:
  - new HEAD SHA (40-char)
  - PR number + URL
  - gate results (tsc/eslint/jest with counts + exit codes; jest exit-time observation)
  - R0 scan result (must be empty)
  - state-matrix coverage summary (each of the 8 tests above + which scenarios they pin)
  - any deviations (avoid them; if you must, justify under R0)
- **R64:** copy that result file to `/tmp/tgp-agent-context/applehealthkit/expansion/`, commit as Dynasia G, push (`api_credentials=["github"]`).

Begin by:
1. `cd /tmp/wt-hk5b && git status`
2. Reading `src/api/wearableInsightsApi.ts` and `src/hooks/useWearableInsight.ts` end-to-end so you don't re-invent.
3. Reading HK-5a's `src/screens/coach/client-detail/WearableInsightPanel.tsx` for layout/tone idioms (NOT for review-sheet logic — the client surface has no review).
4. Reading the existing client `HealthFitnessScreen.tsx` to confirm the `aiPanelSlot` mount point + scroll layout norms.
