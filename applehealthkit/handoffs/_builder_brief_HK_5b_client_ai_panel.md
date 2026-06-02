# HK-5b — Client AI Insight Panel (Mobile) — Builder Brief

**PR target:** `BradleyGleavePortfolio/growth-project-mobile`
**Branch:** `hk/PR-HK-5b-client-ai-panel`
**Base:** `main` (post-HK-5a merge — HK-5a's `wearableInsightsApi.ts` is on main when you start)
**Model:** Opus 4.8 (builder)
**Round:** R1
**Depends-on:** HK-3a, HK-3b, HK-4 backend, **HK-5a** (must be merged before HK-5b starts — HK-5b imports from HK-5a's API client)
**Parallel-with:** HK-6 (different files)
**Effort:** M

## Bradley R0 LAW — same as HK-5a; banned phrases, no `as any`/`as unknown as`/`@ts-ignore`/`@ts-nocheck`/empty catches/silent failures. Title-only commits as `Dynasia G <dynasia@trygrowthproject.com>`.

## Mandatory references (read first)
- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`
- `/tmp/tgp-agent-context/applehealthkit/AGENT_1_UX_PLAN.md` §5, §6 (client-side AI placement + CALM)

## Scope

Client-side AI insight panel for the bucket overview screens, **owned by the client**. Placed in:
- `src/screens/client/wearables/HealthFitnessScreen.tsx` (HK-3a) — below hero rings + primary cards
- `src/screens/client/wearables/SleepRecoveryScreen.tsx` (HK-3b) — below recovery ring + cards; CALM tint

Differs from HK-5a in:
- **No** hypothesis / suggested_action / draft message / approve flow (those are coach-only).
- Shows: `observation → norm_comparison → intervention → optional_cta (deep-link)`.
- S&R variant: CALM treatment (cool low-saturation, slow reveal, copy reassures BEFORE informing).
- Optional CTA, if present, is a deep-link button (validate `tgp://` scheme — handled by HK-5a's Zod schema already).

## Write-set (owned exclusively)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/screens/client/wearables/ClientInsightPanel.tsx` (NEW) | Panel component (shared between H&F + S&R via `bucket` prop) |
| 2 | `src/screens/client/wearables/__tests__/ClientInsightPanel.test.tsx` (NEW) | |
| 3 | `src/screens/client/wearables/HealthFitnessScreen.tsx` (one-line add) | Mount `<ClientInsightPanel bucket="HEALTH_FITNESS" />` |
| 4 | `src/screens/client/wearables/SleepRecoveryScreen.tsx` (one-line add) | Mount `<ClientInsightPanel bucket="SLEEP_RECOVERY" />` |

**DO NOT touch:** `wearableInsightsApi.ts`, `useWearableInsight.ts` (HK-5a owns these — IMPORT only). Coach screens. Backend. Navigators. HK-3a/3b internals beyond the one-line mount.

## Imports from HK-5a

```ts
import { useClientInsight } from '../../../hooks/useWearableInsight';
import { isEmptyInsight, CONFIDENCE_LABEL, CONFIDENCE_PCT } from '../../../api/wearableInsightsApi';
import type { ClientInsightResponse, ClientInsight, EmptyInsight } from '../../../api/wearableInsightsApi';
```

If any of these named exports are missing from HK-5a's merged file, STOP and report. Do not redeclare them locally.

## Design requirements (UX plan §5, §6)

**Card shape:** identical chrome to HK-5a panel (consistency), with bucket-tint accent:
- HEALTH_FITNESS → bucket-active warm token
- SLEEP_RECOVERY → cool indigo→slate (CALM)

**Progressive disclosure:**
- Collapsed: single observation line + confidence chip on the right. Tap to expand.
- Expanded:
  - `observation` (one-liner, reassures first in S&R)
  - `norm_comparison` (the cohort/personal-baseline framing)
  - `intervention` (the concrete self-coaching action)
  - `optional_cta` (button — only renders if present in response)

**S&R-specific CALM behaviors:**
- Slow reveal on expand: 480ms ease (vs. 240ms for H&F).
- Copy in S&R should reassure before informing. The backend already shapes the copy this way — DO NOT add additional client-side copy mutation. Render verbatim.
- Cool accent stripe on the leading edge of the card (1.5pt) at low opacity. NEVER red, NEVER green-for-good.

**States:**
- Loading: skeleton (3 lines + chip placeholder). NOT spinner-only.
- Empty (`isEmptyInsight(data)`): show the literal observation + secondary: "Sync a sleep or fitness source to get personalized insights." NO chip.
- Error: sanitized copy + Retry CTA. NO message regurgitation. If status === 403, copy = "This insight isn't available right now." If 5xx, copy = "The server is taking a moment. Try again."

**Optional CTA:**
- Render as a small secondary button under `intervention`.
- `Linking.openURL(deep_link)` on press; the schema guarantees the link is `tgp://...`.
- Wrap in try/catch; on failure, surface "Couldn't open this just now." inline — NEVER silent.
- `accessibilityRole='link'`, `accessibilityLabel={optional_cta.label}`.

**Forward hook (UX §5.3):**
- After a CTA tap that succeeds (Linking resolved), the panel briefly shows a forward-looking line:
  - H&F: `"You're a little closer to this week's targets."` (or use the CTA label as the hook)
  - S&R: `"We'll check in on this tomorrow."`
- After 4s the panel returns to the normal expanded state.

**Accessibility:**
- `accessibilityRole='button'` on root.
- `accessibilityState={{ expanded }}`.
- Reduce motion: skip 480ms slow-reveal when `useReduceMotion()` is true.
- `accessibilityLabel` on card root: `"Personal insight, ${confidenceLabel}, ${observation}, tap to expand"`.

**Token usage:** Reuse HK-3a/3b tokens. NO hex literals.

## Tests

### `ClientInsightPanel.test.tsx`
- Renders loading skeleton initially.
- Expanded H&F: renders observation + norm_comparison + intervention; no CTA when `optional_cta === null`.
- Expanded S&R: same fields + slow-reveal timing assertion (mock animations).
- CTA path: tap calls `Linking.openURL` with the exact `deep_link`; success → forward hook shown.
- CTA path: `Linking.openURL` rejects → inline error copy, NOT silent.
- Empty: renders literal observation copy + secondary line.
- Error 403: sanitized copy "isn't available right now"; 5xx: "taking a moment".
- Confidence chip uses `CONFIDENCE_LABEL[level]` + percentage.
- Reduce motion: no 480ms anim when `useReduceMotion()` mocked to true.
- No banned strings.

## Gates

```bash
cd /tmp/wt-hk5b   # create: git worktree add /tmp/wt-hk5b -b hk/PR-HK-5b-client-ai-panel origin/main
ln -sf /tmp/wt-hk3a-mobile-r4/node_modules /tmp/wt-hk5b/node_modules

npx tsc --noEmit 2>&1 | tee /tmp/5b_tsc.log; echo "EXIT $?"
npx eslint 'src/screens/client/wearables/ClientInsightPanel.tsx' 'src/screens/client/wearables/__tests__/ClientInsightPanel.test.tsx' 2>&1 | tee /tmp/5b_lint.log; echo "EXIT $?"
npx jest --ci --testPathPattern='ClientInsightPanel' 2>&1 | tail -30
npx expo prebuild --platform ios --no-install --clean 2>&1 | tail -5
npx expo prebuild --platform android --no-install --clean 2>&1 | tail -5
git checkout -- package.json && rm -rf ios android
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) ?=> ?undefined\)|catch ?\(.\) ?\{\s*\}|catch ?\(\) ?\{\s*\}' && echo "R0 VIOLATIONS — STOP" || echo "R0 BANS: CLEAN"
```

## Commit + push + PR

```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -am "PR-HK-5b: client AI insight panel (CALM in S&R, deep-link CTA, forward hook)"
git push origin hk/PR-HK-5b-client-ai-panel
gh pr create --repo BradleyGleavePortfolio/growth-project-mobile \
  --base main --head hk/PR-HK-5b-client-ai-panel \
  --title "PR-HK-5b: client AI insight panel" \
  --body "Client-side AI insight panel on the bucket overview screens. Imports types + hooks from HK-5a. CALM treatment on S&R. Deep-link CTA opens via Linking (schema-restricted to tgp://). Forward hook after CTA success per UX §5.3."
```

## Output

Write a result report to `/home/user/workspace/_builder_result_HK_5b_client_ai_panel.md` with the same fields as HK-5a's result format. Verdict: `READY_FOR_AUDIT` or `BLOCKED`.

## Constraints

- DO NOT touch the API client or hooks (HK-5a owns).
- DO NOT touch coach screens.
- Keep the panel **small** — a chat-sized component, NOT a screen-dominating block.
- If a token name doesn't resolve, grep the theme and adapt. Document deviations.
