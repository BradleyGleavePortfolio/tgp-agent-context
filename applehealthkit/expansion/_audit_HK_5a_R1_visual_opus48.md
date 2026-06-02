# HK-5a R1 Audit — visual Opus 4.8

**Head SHA:** 8b3f60a6c8e40043e7a38fdb9c909085db5f43f7
**PR:** #225 — `hk/PR-HK-5a-coach-ai-panel` (growth-project-mobile)
**Worktree:** `/tmp/wt-hk5a-audit-r1-visual`
**Base for diff:** `origin/main` (00f8e95)
**Verdict:** NEEDS_FIX

Auditor role: R31/R32 independent VISUAL/DESIGN auditor. Code-only and contract
concerns are GPT-5.5's lane; the R0 "Coming soon" hygiene-test finding is also
flagged here because the audit brief (lines 27, 12) instructs **every** audit to
flag it.

---

## Gate results

| Gate | Result | Exit |
|---|---|---|
| `tsc --noEmit` | 0 errors | 0 |
| `jest WearableInsightPanel` | 11/11 pass (loading skeleton, empty, error+retry, expanded 4 fields, sheet open/edit/dismiss/approve/ok-forward-hook/not_implemented/thrown-error, R0 hygiene) | 0 |
| Diff scope | 10 files, +1720/-0; no production file touched beyond the two sanctioned one-line tab mounts | tight |
| R0 ban scan (added lines) | 2 hits — both the "Coming soon" literal inside the hygiene test (title + regex) | VIOLATION (see P1) |
| Bucket tone tokens (`wearablesTheme.ts`) | NOT in diff — reused from HK-3a (985349d). Correct per brief. | reused |

Diff files: `wearableInsightsApi.ts`, `useWearableInsight.ts`, `WearableInsightPanel.tsx`
(+3 test files), `HealthFitnessTab.tsx`/`SleepRecoveryTab.tsx` (one-line mounts),
and the two pre-existing tab test files (insight-hook mock only).

---

## What passed the visual sweep (evidence)

- **Collapsed = one-line observation + confidence chip.** `observation` is
  `numberOfLines={expanded ? undefined : 1}`; `<ConfidenceChip>` sits in the header row (WearableInsightPanel.tsx:255–263).
- **Expanded ordering** observation → hypothesis → suggested action → draft preview (2-line, "Read more") → "Review message" CTA matches UX §4.5 step 1 (lines 265–298).
- **Confidence chip is a neutral pill, never green-for-good.** `chip` bg = `colors.bone`, text = `colors.charcoal`, border = `withAlpha(accent,0.4)`; copy = `CONFIDENCE_LABEL[level] (CONFIDENCE_PCT[level]%)` (lines 336–355, 629–639). Matches UX §6.3.
- **Loading = skeleton, not spinner.** Three `SkeletonLine`s + an `86×20` chip-placeholder line (lines 184–199); `SkeletonLoader` is a real opacity-shimmer, not `ActivityIndicator`.
- **Empty = literal copy + secondary guidance, NO chip, NO spinner.** `EmptyPanel` renders `"Not enough data yet — keep syncing."` + `"Once we have ~3 days of data, your AI will flag patterns."`, no `<ConfidenceChip>` (lines 318–334). Verbatim match to spec.
- **Error = status-differentiated + retry.** `sanitizeError` maps 403 → "You don't have access to this client's insights.", 5xx → "The server is temporarily unavailable.", 404 → "No insight is available…", network(0) → "Check your connection…", ZodError → unexpected-shape copy; truncated to one line + Retry button (lines 85–97, 201–229). No raw error/stack leak (#12).
- **MessageDraftReviewSheet**: editable multiline `TextInput` prefilled with the draft, 1000-char cap + counter; three actions Approve & send / Edit then send (enabled only when edited) / Dismiss; **Dismiss is a ghost button (`colors.charcoal`), NOT destructive-red** (lines 452–538).
- **Sheet not_implemented (pre-HK-6)** keeps the sheet open, shows calm `pendingCopy` and disables the primary CTA — "rolling out — try again later" tone, not alarming (lines 409–416, 467–471).
- **Forward hook after approve ok**: `"Sent to <firstName|your client>"` + "We'll fold their reply into the next insight.", auto-reverts after `FORWARD_HOOK_MS = 3000` then refetches; timer cleared on unmount (lines 135–157, 163–181). Matches UX §4.5 step 5 / §5.3.
- **Accessibility**: card root `accessibilityRole="button"` + `accessibilityState={{ expanded }}` + descriptive `accessibilityLabel`; chip, retry, CTA, all sheet controls labelled; sheet `accessibilityViewIsModal`; error/pending use `accessibilityRole="alert"`; sheet title `accessibilityRole="header"` (lines 247–254, 347, 435, 445, 468, 474, 495–497).
- **Reduce motion**: expand fade gated by `useReduceMotion()` (sets fade=1 instantly when on), mirroring HK-3b (lines 105, 117–133).
- **Tokens, no hex**: every color is `colors.*` / `tone.*` / `withAlpha(...)`; zero hex literals in the new component.

---

## Findings

### P1 — R0 "Coming soon" literal present in the diff (test title + regex)
- File: `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx:250,256`
- Issue: The R0 hygiene test embeds the banned string `"Coming soon"` in both the `it(...)` description and the `queryByText(/coming soon/i)` matcher; the audit brief (line 12) states R0 bans apply to test titles and regex assertions because the title is printed to the CI log, making the test itself a violation.
- Evidence:
  ```
  250:  it('never renders the banned "Coming soon" string in any state', () => {
  256:      expect(queryByText(/coming soon/i)).toBeNull();
  ```
- Fix: Reword the guard so the literal never appears — e.g. build the forbidden token at runtime (`['Coming', 'soon'].join(' ')`) or assert against a non-banned synonym set, and retitle the test (e.g. "renders no placeholder-status string").

### P2 — Primary CTAs fail WCAG AA contrast on the Health & Fitness (warm) bucket
- File: `src/screens/coach/client-detail/WearableInsightPanel.tsx:289,295–296,488–505`
- Issue: "Review message" and "Approve & send" render `colors.bone` (#F5EFE4) text/icon on a solid `tone.accent` fill; for the warm bucket `tone.accent = colors.camel` (#B08D57), giving **2.70:1** — below the 4.5:1 AA minimum for 16px/500 (non-large) text. The cool/forest bucket passes (8.57:1).
- Evidence: computed contrast bone-on-camel = 2.70:1 (FAIL); bone-on-forest = 8.57:1 (PASS). `WARM.accent = colors.camel` in `wearablesTheme.ts:42`; `colors.camel = #B08D57` (tokens.ts:43, documented there as "hairline borders only").
- Note (scope): the established HK-3a/3b pattern uses `tone.accent` only as thin bars/icons/chart lines/selected-state color — `grep` shows this PR's `reviewCta` is the **first** bone-text-on-camel-fill in the wearables surface, so the failing combination is introduced by this PR, not inherited.
- Fix: For solid filled CTAs use an AA-safe fill on the warm bucket (e.g. `colors.forest`/`colors.ink` fill, or a darker warm token like `palette.amber[700]`/`#8A6A2A`) rather than `camel`; keep `tone.accent` for accents/borders only.

### P2 — "Read more", "Retry", and enabled "Edit then send" text fail AA on the warm bucket
- File: `src/screens/coach/client-detail/WearableInsightPanel.tsx:283,225,519–523,477–483`
- Issue: These use `tone.accent` (or `accent`) as **foreground text on a light card/sheet**. Warm = camel on cream/bone = **2.54:1** for 14–16px normal text (needs 4.5:1). Cool/forest passes (≈8:1).
- Evidence: computed camel-on-cream = 2.54:1 (FAIL); forest-on-cream = 8.06:1 (PASS). Affects `readMore` (bodySmall 14/400), error `retryText` (bodyMd 16/500), sheet `retry`, and the enabled secondary "Edit then send" label.
- Fix: Derive a darker "accent-ink" token per tone for on-surface text/links (warm → `#8A6A2A` family, which the palette already defines), and use it instead of the raw accent for any text-on-light.

### P3 — `charCount` (stone on bone) ~2.05:1; below AA even for meta text
- File: `src/screens/coach/client-detail/WearableInsightPanel.tsx:463–465,688–693`
- Issue: 10px `stone` counter on bone is ~2.05:1; tokens.ts itself documents `stone` as AA-fail for normal text (caption/meta only ≥18pt). 10px is well under that carve-out.
- Evidence: stone(#B1A89F)-on-bone = 2.05:1; tokens.ts:21 flags stone FAIL for <18pt.
- Fix: Use `colors.charcoal` for the char counter (9.5:1) — it's informational text the coach may rely on near the 1000-char cap.

### P3 — Loading skeleton shimmer does not honor reduceMotion
- File: `src/components/SkeletonLoader.tsx:6–17` (shared, used by the panel at WearableInsightPanel.tsx:192–196)
- Issue: `useShimmer` runs an infinite opacity loop with no `useReduceMotion()` gate; the panel's own expand fade is gated, but the loading state animates regardless. Pre-existing shared component (not introduced here) — flagged for completeness.
- Fix: Gate the shimmer loop on `useReduceMotion()` in `SkeletonLoader` (out-of-scope for this PR; track separately).

### P3 — Bucket-tint wording: "indigo→slate" spec vs forest-green reality (acceptable)
- File: `src/screens/client/wearables/wearablesTheme.ts:48–53` (pre-existing, reused)
- Issue: The sweep/UX text describes SLEEP_RECOVERY (CALM) as "cool indigo→slate"; the established HK-3a/3b cool tone is `colors.forest` (#2C4A36, a cool green/slate). The builder correctly reused the existing token per the brief ("reuse the bucket tokens from HK-3a/3b"), so this is a spec-wording vs implemented-palette note, not a defect. No action required for HK-5a.

---

## Builder's 3 documented deviations — verdict

1. **Test-mock additions to HK-3a/3b tab test files** — ACCEPTABLE. The mock holds the panel in `isLoading` (renders only the skeleton, no `coach-insight-*` content), mirrors the existing `useWearableSamples` mock convention, and changes no production logic or existing assertions. No behavioural change to those tabs. (Code-side confirmation is GPT-5.5's lane.)
2. **404 → typed `not_implemented`** — ACCEPTABLE visually: surfaces as calm in-sheet copy + disabled CTA + Retry, never a silent failure or spinner. Honest, recoverable degradation per UX §4.5 / R0.
3. **"Coming soon" hygiene guard (title + regex)** — **NOT acceptable → P1 above.** The deviation itself introduces an R0 violation by placing the banned literal in the diff/CI log.

---

## 50-Failures sweep (R65) — actively checked (visual-relevant subset)
- **#12 (sensitive-data / internal leak in UI):** `sanitizeError` maps status → calm copy; raw `error.message`/stack never rendered. PASS.
- **#36 (silent failure):** every loading/empty/error/not_implemented/thrown path renders copy + (where applicable) CTA; no spinner-only, no swallowed UI path. PASS.
- **#5 (IDOR surface):** 403 renders generic "no access" copy, never the client's data. PASS (visual).
- **Unmount cleanup:** forward-hook `setTimeout` cleared on unmount; expand animation `.stop()` on cleanup. PASS.
- **Loading-state quality (no bare spinner):** skeleton with chip placeholder. PASS.
- **Color-semantics misuse (destructive red):** Dismiss is ghost/charcoal, error red reserved for true errors. PASS.

## Mobile Design Intel sweep (visual) — sections actively checked
- **§1.2 Visceral / Behavioral:** restrained card, low-saturation tint, no mascot/badge/playful motion — matches "premium, careful team" target. PASS.
- **§2.2 Phantom CALM (Clarity/Animation/Light-feedback):** error/empty/not_implemented copy is sympathetic, never "Something went wrong"; CALM applied to the S&R tone. PASS.
- **§2.2 "treat error states as trust-building":** status-differentiated, actionable, sanitized error copy + Retry. PASS.
- **§4.5 Progressive Disclosure:** collapsed one-line → tap to expand four fields + CTA; whole card is the tap target; draft preview "Read more". PASS.
- **§4.7 Color semantics (confidence not endorsement):** neutral confidence chip, never green-for-good. PASS.
- **§5.1 Step 6/7 + §7.7 Layer 3 (forward hook / closure):** "Sent to <name>" + forward-looking follow-up line, auto-revert+refetch. PASS.
- **§4.3 Miller / "small part of the page":** panel is one chunk, progressively disclosed, not a full chat. PASS.
- **Accessibility (labels/roles/expanded state/reduceMotion):** verified present; reduceMotion honored on expand (P3: not on the shared skeleton shimmer).
- **WCAG AA contrast (light palette; surface has no dark mode):** PASS on cool/forest bucket; **FAIL on warm/camel CTAs and accent-text → P2 findings above.**

---

## Verdict rationale
Two P2 WCAG-AA contrast defects (warm-bucket CTAs and accent-text below 4.5:1) and
one P1 R0 "Coming soon"-in-diff violation. Per the brief, CLEAN requires zero P1/P2.
**Verdict: NEEDS_FIX.** The functional/interaction design, progressive disclosure,
state coverage, copy, tokens-only styling, and accessibility labelling are otherwise
strong and ship-ready once the contrast tokens and the hygiene-test literal are fixed.
