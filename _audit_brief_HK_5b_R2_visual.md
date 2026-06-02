# HK-5b R2 Visual Audit Brief

**Auditor model:** Opus 4.8 (FRESH instance — different from R1 visual auditor). Sonnet 4.6 FORBIDDEN.
**Repo:** `growth-project-mobile`
**PR:** #226
**Head SHA (R55):** `13a77dd7fbd2916ac6a025bb392c997ee99fb938`
**Worktree:** `/tmp/wt-hk5b-audit-r2-visual` (FRESH — distinct from builder + R1 worktrees + R2 code-audit worktree)
**Round:** R2

## What changed in R2 that needs visual verification

1. **State #5 fix (P1-visual):** observation + norm_comparison now clamp at `numberOfLines={3}` with a "Read more"/"Show less" toggle using `onTextLayout` overflow detection. Intervention stays unclamped.
2. **Dark mode (P2-visual):** panel migrated to `useTheme().semanticColors`. Verify dark-mode parity.
3. **New ProvenanceRow** (P1-code from R1, but visual surface) — renders below intervention and above CTA.
4. **CTA changes:** explicit pressed opacity, `.finally()`-reset latch.

Cross-reference: `/home/user/workspace/_audit_HK_5b_R1_visual_opus48.md` (R1 findings) and `/home/user/workspace/_fixer_result_HK_5b_R2.md` (fixer's claims).

## Worktree setup

```bash
cd /tmp
(cd /tmp/mobile-clone && git worktree add /tmp/wt-hk5b-audit-r2-visual 13a77dd7fbd2916ac6a025bb392c997ee99fb938)
cd /tmp/wt-hk5b-audit-r2-visual
ln -sfn /tmp/mobile-clone/node_modules ./node_modules
git rev-parse HEAD  # MUST equal 13a77dd7fbd2916ac6a025bb392c997ee99fb938
```

## Mandatory training docs

1. `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (primary)
2. `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` (UX-relevant categories)

## Methodology

Same as R1 visual — no simulator. Read the panel file, its tests, host screens, theme, and the HK-5a coach panel. Reconstruct each state in prose and verdict it.

Read `ClientWearableInsightPanel.tsx` (now ~600+ LoC after the fix). Pay extra attention to:
- The new `expanded` state machine + `onTextLayout` overflow detection
- The `ProvenanceRow` (placement, typography, spacing)
- The `useTheme()` integration — which tokens are consumed where

## States to verdict (regression-aware)

For each, describe the expected visual and verdict PASS/FAIL/CONCERN against R1 + R2:

1. **Loading** — still a layout skeleton; verify the skeleton now also has a bar for the new ProvenanceRow placement (or document that it doesn't and explain why that's acceptable — provenance is optional/supporting, the skeleton can omit it without misleading)
2. **Empty** — unchanged from R1; still PASS
3. **Error** — unchanged from R1; still PASS
4. **Normal short** — observation/norm/intervention/ProvenanceRow/CTA all visible. Hierarchy holds. Provenance is visually subordinate to the three content fields (smaller / muted).
5. **Normal max (280×3 + many source_metrics)** — THE CRITICAL ONE. With the clamp:
   - Observation + norm_comparison initially clamped at 3 lines each
   - "Read more" appears below the second clamped section (or wherever the design puts it)
   - Pressing reveals full content for BOTH fields together
   - Intervention always fully visible
   - Card height in the collapsed state is reasonable for a 375pt-wide device (target: <500pt collapsed)
   - In expanded state the card is the same tall card from R1 — still scrollable in host ScrollView, acceptable
   - "Read more" itself has a clear affordance (button-like or distinct text style)
   - Touch target ≥44pt
6. **Confidence levels ×5** — unchanged; verify chip still renders with percentage
7. **CTA present + ProvenanceRow** — verify ProvenanceRow doesn't crowd the CTA; spacing is correct; CTA still ≥44pt; new pressed-opacity visible
8. **CTA absent + ProvenanceRow** — ProvenanceRow still renders without CTA; no orphaned spacing where CTA would have been
9. **NEW: ProvenanceRow with empty/undefined source_metrics** — row is omitted entirely; no empty section, no "Source metrics" label without a value
10. **NEW: Dark mode (every state)** — read `ThemeProvider.tsx` and `theme/tokens.ts` (or wherever the semantic tokens live). Re-walk each state mentally with the dark variant of every token:
    - Card surface (now from semantic token) — is it a sensible dark surface?
    - Body text (now from semantic token) — clears AA on the dark surface?
    - Eyebrow / muted text — clears AA?
    - Skeleton bars — visible against the dark surface?
    - Bucket accent / accentInk on dark surface — clears AA? If the fixer didn't branch by `colorScheme`, verify the existing tones happen to clear AA on dark (compute the contrast ratios)
    - CTA bone-on-accentInk — does the CTA text token still produce AA? The fixer claims dark-mode is applied; if `colors.bone` was swapped for `theme.textOnAccent`, verify the value is sensible on both light and dark.

## Specific verifications

### Clamp/expand affordance quality (P1-visual fix)

- Does the "Read more" appear only when overflow actually occurs (via `onTextLayout`)? Short content should NOT show "Read more". Verify the test asserts this.
- Affordance style — is it a button-style, link-style, or inline-text style? Per MOBILE §4.5, progressive disclosure affordances should be unambiguously interactive. Underlined text + arrow / chevron / "Read more ›" are all acceptable.
- Toggle copy — "Read more" / "Show less" (NOT "Coming soon" or any banned phrase). Verify literally.
- Placement — visually attached to the clamped content, not floating elsewhere on the card.

### ProvenanceRow design

- Typography: should be visually subordinate to body fields. Smaller font (e.g. `bodySm` or `caption`) and muted color (`textMuted`) are appropriate.
- Format: `Source metrics` eyebrow + comma-joined values. Acceptable. Alternative formats (chip list, bullets) are equally fine; verify whatever the fixer picked reads clearly.
- Truncation: if there are 10+ source_metrics, the row uses `+N more` — does it wrap to a second line or get cut? Verify under realistic load.

### Dark mode parity

- Semantic tokens must exist in `theme/tokens.ts` — if the fixer invented tokens, that's a P0 (`tsc` would have caught it, but verify).
- For each semantic token consumed by the panel, look up its light + dark values and verify the panel reads correctly in both.
- The `S&R` host screen is dark-aware — physically open `SleepRecoveryScreen.tsx` and confirm that the panel + host now share a consistent surface tone in dark mode.

### Visual consonance vs HK-5a coach panel (post-fix)

After the clamp fix, the client panel should be MORE consonant with the coach sibling than in R1. Compare:
- Clamp pattern — does the client now mirror the coach's `numberOfLines={1}` / `DRAFT_PREVIEW_LINES=2` discipline? (Not literally those numbers; structurally equivalent.)
- "Read more" pattern — does the toggle copy/style match the coach's?
- Chip format `·` vs `()` — still cosmetically different (P3 in R1; not changed); note that.

## Deliverable

Write to `/home/user/workspace/_audit_HK_5b_R2_visual_opus48.md`:

```
# HK-5b R2 Visual Audit — Opus 4.8 fresh

**Head SHA verified:** 13a77dd7fbd2916ac6a025bb392c997ee99fb938
**Verdict:** CLEAN | NEEDS_R3 | BLOCKED

## State walkthroughs (1–10)
<each state, verdict + evidence>

## R1 fix verification
- P1-visual #5 (clamp + Read more): <evidence>
- P2-visual dark mode: <evidence + contrast spot-checks>
- ProvenanceRow design: <evidence>
- CTA pressed opacity: <evidence>

## Mobile Design Intel sweep (post-R2)
<table>

## Visual consonance vs HK-5a (post-fix)
<diff>

## New findings (if any)

## Verdict rationale
```

Do NOT commit.
