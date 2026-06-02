# HK-3b Mobile — R1 Visual Audit (Opus 4.8 fresh-instance)

**PR:** BradleyGleavePortfolio/growth-project-mobile #223
**Branch:** hk/PR-HK-3b-recovery-bucket
**Pinned head SHA (R55):** `8676a64103c9c2f015dffd3cf996f82beb315625` (worktree HEAD verified == pinned SHA)
**Merge-base with main:** `985349d2e23dab1ad13b67d97dbc2584b8982ffa` (rebased post HK-3a merge)
**Auditor:** Opus 4.8 fresh-instance, VISUAL/UX layer only (R31/R32: auditor ≠ builder). Static audit — cannot run the app.
**Date:** 2026-06-02
**Reference baseline:** HK-3a R3 visual audit (CLEAN) at `_audit_HK_3a_mobile_R3_visual_opus48.md`; Bradley `MOBILE_APP_DESIGN_INTELLIGENCE.md`.

---

## VERDICT: CLEAN

No P0/P1 visual defects. R0 LAW satisfied: no spinner-only states, no "Coming soon"/placeholder copy, decacorn-quality polish present. Findings are P2/P3 polish only and do not block merge.

---

## PR DIFF SCOPE (visual files confirmed in this PR)
SleepRecoveryScreen.tsx · cards/{RecoveryRingHero,HrvTrendCard,RespirationCard,SleepConsistencyCard,SleepStagesCard,SrCard}.tsx · components/{CalmSlowReveal,PhantomCalmBanner}.tsx · empty/{SleepRecoveryEmptyState,SleepRecoveryErrorState}.tsx · recoveryTheme.ts · recoveryData.ts · coach/client-detail/SleepRecoveryTab.tsx (+ tests).
**Out of scope / NOT touched by this PR:** RevolutGlowChart.tsx, ConnectionsScreen.tsx, ConnectProviderSheet.tsx (their `ActivityIndicator` usages are pre-existing HK-3a code, already audited CLEAN — not regressions here).

---

## PER-COMPONENT VISUAL CHECK

### 1. PhantomCalmBanner (`components/PhantomCalmBanner.tsx`)
- **Decacorn, not gimmicky:** ✓ Structurally enforces reassurance-FIRST/large, deficit-below/smaller (CALM "C — Clarity"). Cannot be misused to lead with a number. `accessibilityRole="summary"` + label reads reassurance then number — same order as sighted.
- **Color/contrast:** ✓ `colors.surface` bg, `textPrimary (#1A1A18)` reassurance (~14–15:1), `textSecondary (#3D3D3A)` deficit (~10:1) — both well above 4.5:1. Accent bar uses cool indigo `#5B6CB8` (calm) or soft amber `#C99A52` (attention only); NEVER red. Hairline border via `StyleSheet.hairlineWidth`.
- **Typography:** reassurance 17/600 +0.2 tracking, deficit 13 — clean two-step hierarchy.
- **Animation timing:** delegated to CalmSlowReveal at the card layer; banner itself static. ✓
- Grid: `borderRadius:14` (off the 4/8/12/16 multiple — minor), `paddingV:14/paddingH:16`, `accentBar width:3`. P3 grid note.

### 2. CalmSlowReveal (`components/CalmSlowReveal.tsx`)
- **Timing:** ✓ 600ms cubic ease-out (`1-(1-t)^3`) — "settle, never a hard stop". opacity 0→1 + translateY 8→0. Staggerable via `delay` for a gentle cascade (CALM "A — Animation": begins before the user reads a number).
- **Performance:** ✓ `Animated.timing` with `useNativeDriver:true` (opacity/transform off main thread), no per-frame setState; animation `.stop()` on cleanup.
- **Reduce-motion:** ✓ reads `AccessibilityInfo.isReduceMotionEnabled()` + subscribes to `reduceMotionChanged`; snaps to final value when on. Query-reject fail-safe = instant (documented, NOT silent). Hides until preference resolves so it never flashes an un-animated frame.

### 3. RecoveryRingHero (`cards/RecoveryRingHero.tsx`)
- **Ring quality:** ✓ SVG track + animated progress arc, `strokeLinecap="round"`, starts at 12 o'clock (`rotate(-90)`), 800ms fill, reduce-motion snaps. Center number NEVER shown without plain-language label ("Recovered/Recovering/Run-down"). `—` placeholder glyph when null is intentional, not a defect.
- **Color tokens:** ✓ Cool indigo accent at healthy recovery; low recovery desaturates to slate `#7E879E` — NEVER red (Bradley LAW honoured). Center number `textPrimary`; state label colored to ring color.
- **STROKE/GAP grid alignment:** **P3** — `strokeWidth = Math.max(12, round(size*0.07))` yields 15 at size=220, **17 at the live size=240**, 14 at coach size=200. None land on 4/8/12/16 multiples (Mobile Design Intel grid preference). Visually fine but not grid-snapped.
- **Sub-pixel underline cleanliness:** N/A here (no underline); center label uses `marginTop:2` + letterSpacing 0.4 — clean.

### 4. HrvTrendCard (`cards/HrvTrendCard.tsx`)
- **Chart styling:** ✓ Reuses HK-3a `RevolutGlowChart` (`tone="cool"`, indigo color, height 120, `formatValue` → "NN ms") — monotone bezier + glow + scrub, reduce-motion-aware (inherited, audited CLEAN).
- **Axis labels:** the shared chart renders its selected-day readout + value formatting; the card adds a value chip (`18/600`, tabular-nums) in the title row. Acceptable.
- **Empty state (NOT spinner-only):** ✓ when `latestMs===null`/no trend, reassurance copy ("We'll chart your HRV as your mornings sync in") renders. **P2:** the visual fallback when `chartData.length===0` (lines 78–80) is a bare `RECOVERY_PALETTE.track` rectangle (`borderRadius:12`) with no in-box label/axis/icon — the copy above carries meaning, but the box itself is an undifferentiated colored block. Not spinner, not blocking; would read more polished with a faint baseline or "no data yet" affordance inside.

### 5. Card family — RespirationCard / SleepConsistencyCard / SleepStagesCard / SrCard
- **Grid alignment:** ✓ All wrap in `SrCard` (uniform `padding:16`, `borderRadius:16`, hairline border, 12px title-row margin, 16px icon + 8 gap). Consistent chrome across the bucket.
- **Typography scale:** copy 14/lh20, statLabel 12, statValue 20–22/600 tabular-nums, footnote 11 — coherent hierarchy. **P3:** values are raw `fontSize:` literals, not `typography.*` tokens (HK-3a had "zero arbitrary fontSize"). Internally consistent within the bucket; cosmetic divergence from token discipline.
- **Contrast ≥4.5:1:** ✓ textPrimary/textSecondary on surface clear it comfortably. SleepStages uses hardcoded cool-family stage hexes (`#6E5BB8/#3F4A7A/#8E96BE/#C7CBDA`) — bar fills with a labeled legend (color is NOT the sole signal: each slice has text label + minutes + dot), so the pale `awake` slate is acceptable; never red.
- **Touch targets ≥44pt:** these cards expose no interactive controls (display only); SleepStages bar/legend are `accessibilityRole="image"` with a full spoken label. N/A.
- **CALM copy:** ✓ reassurance-first everywhere — Respiration's SpO2-attention path uses soft amber + a gentle clinician-referral suffix (no diagnosis nouns, no red); Consistency frames a wide spread as "still finding its rhythm".

### 6. SleepRecoveryEmptyState / SleepRecoveryErrorState (`empty/`)
- **MUST NOT be spinner-only:** ✓✓ Both pass strongly.
  - Empty = **skeleton of the real layout** (ring outline + moon glyph + two skeleton cards) + value-first headline ("Connect a tracker and we'll show your recovery story.") + subtitle + **actionable "Connect a tracker" CTA** → navigates to Connections.
  - Error = cloud-offline icon + calm reassuring copy ("Your data is safe — let's try again." / "Showing your last synced data from {time}.") + **"Try again" retry CTA**.
- **No placeholder/"coming soon":** ✓ confirmed by grep + by snapshot test `renders the empty state (NOT a spinner)`.
- **Touch target P3:** Empty CTA `paddingV:14` + 15px ≈ ~46pt ✓. Error CTA `paddingV:12` + 15px ≈ ~42pt, no `hitSlop` — marginally under the 44pt floor (identical borderline pattern HK-3a logged as P3 for HealthFitnessEmptyState; large full-width-ish target so practical tap reliability is fine).

### 7. SleepRecoveryScreen (`SleepRecoveryScreen.tsx`)
- **Composition:** ✓ Above-the-fold cap ≤5 chunks respected (ring → conditional CALM banner → stages → HRV → consistency); Respiration + AI slot pushed into off-cap "More" disclosure (Miller's Law / 80-20).
- **Spacing:** ✓ `paddingH:16/paddingTop:16/paddingBottom:48`, uniform `section marginTop:14`, hero `marginBottom:8`. Consistent rhythm.
- **State machine:** ✓ error(no cache) → typed error state; empty → skeleton; loading(no data) → SAME empty skeleton (explicit anti-spinner, testID `sleep-recovery-loading-skeleton`); error-with-cache → stale-data notice + real overview (graceful degradation). Never a bare spinner.
- **Scroll behavior:** ✓ `ScrollView` + `RefreshControl` tinted with the cool accent; hidden scroll indicator; pull-to-refresh routes through the logged `onRetry`.
- **Reveal cascade:** ✓ staggered 60/120/180ms across stages/HRV/consistency — gentle column cascade.
- **Touch target P3:** "More detail" toggle `paddingV:10` + 13px ≈ ~38pt, no hitSlop — under 44pt (full-width centered control; low mis-tap risk). Logged P3.

### 8. Coach SleepRecoveryTab (`coach/client-detail/SleepRecoveryTab.tsx`)
- **Reuses client cards** (ring/stages/HRV/consistency) for visual consistency. ✓
- **State handling:** ✓ 403 → graceful `RecoveryUnavailable` (lock icon, calm non-accusatory copy), never an uncaught throw; other errors → centered cloud-offline + "Try again" retry. No spinner-only.
- **Coach overlays:** ✓ AnomalyBand (±1σ deviation track; out-of-band marker = soft amber, in-band = indigo, NEVER red; `accessibilityRole="image"` + label) and CohortComparison (neutral "median client at week 6", explicitly NO green-for-good coloring — confidence-calibration lock). Marker is decorative (4×16), not interactive → 44pt N/A.
- **Touch target P3:** retry CTA `paddingV:12` + 15px ≈ ~42pt, no hitSlop (same borderline pattern).
- **Contrast:** ✓ textSecondary/textMuted on surface clear 4.5:1; anomaly band fill `#C9CEE6` is a non-text track fill.

---

## MOBILE DESIGN INTEL COMPLIANCE (per dimension)
- **Visceral (Don Norman L1):** ✓ Cool indigo→slate identity, soft 600ms reveal, round-cap animated ring — "careful, skilled team" first impression. Distinct from H&F's warm amber (consistency dividend, §4.7).
- **Behavioral (L2):** ✓ reduce-motion honored everywhere, native-driver animation, pull-to-refresh, optimistic stale-notice, real retry outcomes. No 60fps risk (no per-frame setState).
- **Reflective (L3):** ✓ "recovery story" framing, plain-language stages, coach cohort narrative.
- **Phantom CALM framework (§2.2):** ✓ Clarity (reassurance-first banner structurally enforced), Animation (CalmSlowReveal before any deficit), Light feedback (warm error copy "your data is safe"), no mascot (acceptable — bucket is data-display, not a high-anxiety onboarding flow).
- **Anti-patterns:** ✓ NO spinner-only, NO "coming soon"/placeholder, NO red on low values, NO color-only signaling (stages/anomaly carry labels/icons + non-hue states).
- **Grid (4/8/12/16):** mostly ✓ (paddings 8/12/14/16/24, gaps 6/8/24, sections 14). Misses: ring strokeWidth 14–17 (P3), a few radii at 12/14/16 vs token cap. Within-bucket consistent.
- **Typography:** clean serif/sans system exists globally; bucket uses literal sizes consistently (P3 token note).
- **Contrast ≥4.5:1:** ✓ all text surfaces pass.

---

## FINDINGS

- **P0:** none
- **P1:** none
- **P2:**
  - `cards/HrvTrendCard.tsx:78-80` — empty-chart fallback is a bare `RECOVERY_PALETTE.track` rectangle with no in-box label/axis/icon. Reassurance copy above carries meaning (so NOT a spinner-only / R0 violation), but the chart slot itself reads as an undifferentiated colored block. Recommend a faint baseline grid or inline "no readings yet" affordance inside the box for decacorn polish.
- **P3 (non-blocking polish):**
  - `cards/RecoveryRingHero.tsx:37` — `strokeWidth = Math.max(12, round(size*0.07))` → 15@220 / 17@240 / 14@200; not snapped to a 4/8/12/16 grid multiple (Design Intel grid preference). Optional: quantize stroke to nearest 4.
  - Touch targets marginally under 44pt with no `hitSlop`: `SleepRecoveryScreen.tsx:258-265` More toggle (~38pt), `empty/SleepRecoveryErrorState.tsx:60-65` retry (~42pt), `coach/.../SleepRecoveryTab.tsx:235-241` retry (~42pt). All are large/centered targets; add `minHeight:44` or `hitSlop` for strict HIG compliance. (Same class HK-3a accepted as P3.)
  - Typography uses raw `fontSize:` literals across S&R cards rather than `typography.*` tokens (HK-3a achieved zero arbitrary fontSize). Internally consistent; cosmetic token-discipline divergence.
  - `components/PhantomCalmBanner.tsx:68` `borderRadius:14` + a few card radii (12/16) sit off the 4/8/12/16 grid and above the global `radius` token cap (4) — but the entire wearables bucket intentionally uses softer radii; flagged for consistency awareness only.

---

## DESIGN_INTEL_SWEEP (cross-checks)
- **No spinner-only / no placeholder copy in PR files:** ✓ (grep + snapshot tests assert it). The only `ActivityIndicator`s are in out-of-scope, untouched HK-3a connection files.
- **Never-red on low values:** ✓ recoveryTheme desaturates to slate; only escalation color is soft amber, clinical-attention only.
- **Reduce-motion honored by every new animation:** ✓ CalmSlowReveal + RecoveryRingHero both probe + subscribe + snap.
- **Color-only active/severity:** none — every severity/state pairs hue with copy/icon/label.
- **Reassurance-first copy:** ✓ enforced structurally (banner) and in every card's copy generator.

## STATUS: VISUAL_READY
