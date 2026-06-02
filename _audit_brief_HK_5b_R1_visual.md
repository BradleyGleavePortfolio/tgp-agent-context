# HK-5b R1 Visual Audit Brief — Client AI Insight Panel

**Auditor model:** Opus 4.8 (FRESH instance — must not have prior context from HK-5b build)
**Auditor identity:** Independent visual auditor. Sonnet 4.6 FORBIDDEN.
**Builder model was:** Opus 4.8.
**Repo:** `growth-project-mobile`
**PR:** #226
**Head SHA (R55):** `8c7509eef16f569c197bd64414f7fa9b984c17be`
**Worktree:** `/tmp/wt-hk5b-audit-r1-visual` (FRESH — distinct from builder's worktree and from R1 code auditor's worktree)
**Round:** R1

## What you're auditing

The new **read-only client-facing** AI insight card on the wearables tab. This is what the client sees AFTER the coach approves an AI-drafted insight. Per the contract:

- Fields: `observation` (≤280) / `norm_comparison` (≤280) / `intervention` (≤280)
- Optional CTA: `{label≤40, deep_link:tgp://...}` — renders as a pressable
- Confidence badge: one of 5 levels (i_think 50% / fairly_sure 70% / confident 85% / certain 95% / verified 100%)
- Empty state: `is_empty=true` → shows `Not enough data yet — keep syncing.`

This is a CLIENT screen, not coach. No approve/edit/reject. Read-only.

## Worktree setup

```bash
cd /tmp
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-mobile.git wt-hk5b-audit-r1-visual 2>/dev/null || \
  (cd /tmp/mobile-clone && git worktree add /tmp/wt-hk5b-audit-r1-visual 8c7509eef16f569c197bd64414f7fa9b984c17be)
cd /tmp/wt-hk5b-audit-r1-visual
git checkout 8c7509eef16f569c197bd64414f7fa9b984c17be
ln -sfn /tmp/mobile-clone/node_modules ./node_modules
git rev-parse HEAD  # MUST equal 8c7509eef16f569c197bd64414f7fa9b984c17be
```

## Mandatory training docs

1. `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` (primary)
2. `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` (UX-relevant categories)

## How to audit visually

You cannot run a simulator in this sandbox. Audit by:

1. **Read `ClientWearableInsightPanel.tsx` carefully** and reconstruct the visual hierarchy in prose.
2. **Read its test file** to see what render outputs are asserted — these are the canonical visual contract.
3. **Compare against HK-5a's coach panel** (`src/screens/coach/wearables/CoachWearableInsightPanel.tsx`) — the client panel should be visually consonant (same card chrome, same confidence badge, same typography scale) but missing the action row. Note any divergence.
4. **Read `WearablesShell.tsx` test** to see how the panel slots into the bucket layout.
5. **Mentally render** each state below and write what you would expect to see, then check the code matches.

## States to walk through

For each, describe the expected appearance, then verdict (PASS/FAIL/CONCERN) with code evidence:

1. **Loading** — what does the user see while `useClientInsight` is pending? Must NOT be spinner-only. Look for skeleton / shimmer / labeled progress indicator.
2. **Empty** (`is_empty=true`) — exact copy `Not enough data yet — keep syncing.` rendered with an appropriate empty-state visual (icon, muted color, centered).
3. **Error** — fetch failed. Must show a labeled error state with retry affordance OR a quiet inline message. NOT spinner-only. NOT silent.
4. **Normal — short content** (`observation`/`norm_comparison`/`intervention` ~50 chars each). Card should be compact, breathable, hierarchy clear.
5. **Normal — max content** (each field at exactly 280 chars). Does anything truncate, overflow, push the CTA off-screen on a 375pt-wide device (iPhone SE / mini)? This is the #1 visual failure mode for AI-drafted content panels.
6. **Confidence levels** — each of i_think / fairly_sure / confident / certain / verified rendered. Color coding semantic (red→green progression OK; flag if all same color or if "i_think" looks more confident than "verified"). Percentage shown alongside label.
7. **CTA present** — label≤40 chars rendered on a pressable; visual affordance clear (button vs link vs subtle text); touch target ≥44pt.
8. **CTA absent** (`optional_cta=null`) — no empty button slot, no orphaned spacing, no "Coming soon" or similar (R0 ban — must not appear).

## Specific things to check

### Mobile Design Intelligence categories
- **Text truncation under realistic load** — 280-char observation + 280-char norm_comparison + 280-char intervention on a small screen. Do they wrap or get `numberOfLines`-clamped? If clamped, is there an expand affordance? If unclamped, does the card become unscrollably tall?
- **Touch target ≥44pt** for CTA
- **Color contrast** — confidence badge text-on-background ratio ≥4.5:1 for normal text; ≥3:1 for large text. The `i_think` "low confidence" color is the most likely failure (often a muted gray on white).
- **Loading/empty/error states informative** — covered above
- **Screen reader** — `accessibilityRole`, `accessibilityLabel` on container, CTA, badge. The builder said they swapped `region`→`summary`; verify that's a sensible choice (summary is correct for a synthesized insight card)
- **Dark mode parity** — if the app supports dark mode, verify colors come from theme tokens not hardcoded hex
- **Safe area / notch** — panel itself doesn't need SafeAreaView (it's inside a shell) but verify nothing in the CTA tap path collides with the home indicator
- **Tap state** — CTA shows pressed/active feedback (opacity or background change)

### 50-Failures (visual subset)
- **#12 fake/placeholder data hardcoded** — no "Lorem ipsum", no "Jane Doe", no `Math.random()` seeding visible labels
- **#22 missing edge case handling** — empty strings? whitespace-only fields? these should render as empty state, not blank card

### Visual consonance with HK-5a
Compare side-by-side (mentally — same card chrome? same field order? same badge position? same typography ramp?). Divergence is acceptable only if intentional and justified.

## Deliverable

Write to `/home/user/workspace/_audit_HK_5b_R1_visual_opus48.md`:

```
# HK-5b R1 Visual Audit — Opus 4.8 fresh

**Head SHA verified:** <40-char>
**Worktree:** /tmp/wt-hk5b-audit-r1-visual
**Verdict:** CLEAN | NEEDS_R2 | BLOCKED

## State walkthroughs
1. Loading — <verdict + evidence>
2. Empty — <verdict + evidence>
3. Error — <verdict + evidence>
4. Normal short — <verdict + evidence>
5. Normal max (280 char × 3) — <verdict + evidence>
6. Confidence levels (×5) — <verdict + evidence>
7. CTA present — <verdict + evidence>
8. CTA absent — <verdict + evidence>

## Mobile Design Intel sweep
<each category, PASS/FAIL/N/A>

## Visual consonance vs HK-5a
<diff in prose>

## P0/P1/P2/P3 findings

## Recommended R2 fixer instructions (if NEEDS_R2)
```

Do not commit. Audit only.
