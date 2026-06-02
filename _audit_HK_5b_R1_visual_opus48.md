# HK-5b R1 Visual Audit — Opus 4.8 fresh

**Head SHA verified:** `8c7509eef16f569c197bd64414f7fa9b984c17be`
**Worktree:** /tmp/wt-hk5b-audit-r1-visual
**Auditor:** Independent visual auditor, Opus 4.8 (fresh — no HK-5b build context). R31/R32 applied.
**Method:** Static reconstruction. Read `ClientWearableInsightPanel.tsx` (545 LoC), its test (`__tests__/ClientWearableInsightPanel.test.tsx`), the shared contract `api/wearableInsightsApi.ts`, design tokens `theme/tokens.ts`, bucket tones `wearablesTheme.ts`, the HK-5a coach panel `screens/coach/client-detail/WearableInsightPanel.tsx`, host screens `HealthFitnessScreen.tsx` / `SleepRecoveryScreen.tsx`, `WearablesShell.tsx` + its test, and `ThemeProvider.tsx`. No simulator available; each state reconstructed in prose and verdicted against code + the design intelligence references.

**Verdict:** NEEDS_R2

The panel is well-built and visually disciplined: every one of the eight states renders honest copy, the skeleton mirrors the real layout (not a bare spinner), the confidence chip is correctly neutral, CTA touch target ≥44pt, deep-link re-validated, and it is strongly consonant with the HK-5a coach sibling. It is **not BLOCKED** — nothing here is a release-stopper. But there are two real visual defects worth an R2 pass: (P1) **state #5 — max-content (280×3) renders fully un-clamped with no `numberOfLines` and no expand affordance**, producing a very tall card; this is the brief's #1 failure mode and must be a deliberate decision, and (P2) a **dark-mode parity gap** — the panel hardcodes light-mode palette tokens (`colors.bone`/`colors.ink`) while its own S&R host screen (`SleepRecoveryScreen`) is `useTheme()`/dark-mode-aware, so in dark mode a bright light card lands on a dark background.

---

## State walkthroughs

### 1. Loading — **PASS**
`query.isLoading` branch (lines 174–192) renders a `testID="client-insight-loading"` card containing a skeleton-of-the-real-layout: a header row with two `SkeletonBar`s (a 48%-width title bar + a 92pt chip-shaped bar), three body line bars (92% / 80% / 86%), and a full-width 44pt CTA-shaped bar. This mirrors the loaded card's header + 3 sections + CTA, exactly the progressive-disclosure skeleton the design intel prescribes (MOBILE §4.5; the panel's own header comment §4.5). **Not a bare spinner** — the test explicitly asserts zero `ActivityIndicator` in the tree (test lines 89–91), satisfying the R0 anti-spinner ban. `accessibilityRole="progressbar"` + label `Loading AI insight, <bucket>` is correct. Skeleton bars are hidden from AT (`accessibilityElementsHidden`). Reduce-motion honoured: shimmer loop suppressed to a static 0.5-opacity block when reduce-motion is on (lines 409–422). Evidence is solid.

### 2. Empty (`is_empty=true`) — **PASS**
`EmptyPanel` (lines 245–270, `testID="client-insight-empty"`). Renders a `sparkles-outline` icon in the bucket accent + the exact contract literal **"Not enough data yet — keep syncing."** plus a calm secondary line "We'll add insights here as your devices report more." **NO confidence chip, NO CTA** — verified by the test (lines 99–105) and by code (the empty branch returns before `LoadedPanel`). Reads as a forward-looking promise, not a failure — no error styling, matching the CALM treatment (MOBILE §2.2). Empty copy comes from `EMPTY_OBSERVATION` in the contract, not hardcoded in two places. Centring caveat noted under P3 — the row is left-aligned (icon + text in a flex row), not centred as the brief's ideal "centred" empty state describes; acceptable as it stays consonant with the coach empty state, but it is a minor deviation from the brief's stated ideal.

### 3. Error — **PASS**
`query.isError` branch (lines 195–220, `testID="client-insight-error"`). Renders a `cloud-offline-outline` icon + a **sanitized** one-liner from `sanitizeWearableError()` (status-aware: 401/403 → re-auth, 404 → none yet, 5xx → server unavailable, 0 → connection, else generic) and a **Retry** pressable that calls `query.refetch()`. Not a dead end, not silent, not spinner-only (R0; #36/#50). Raw error text never reaches the surface — the test seeds `new Error('internal db path leak')` and asserts that string is absent while the generic copy is present (test lines 108–122), satisfying 50-Failures #12. Error text carries `accessibilityRole="alert"`. Retry button `minHeight: 44` (≥44pt) and `accessibilityLabel="Retry"`. Strong.

### 4. Normal — short content — **PASS**
`LoadedPanel` (lines 273–334, `testID="client-insight-panel"`). Header row = eyebrow ("AI insight" + bucket icon) on the left, `ConfidenceChip` on the right. Then three `Section`s: Observation, Norm comparison, Intervention (the last `emphasize`d → `bodyMd` 16/500 vs `body` 16/400). With ~50-char fields the card is compact and breathable: card pad `spacing.lg` (16), `spacing.md` (12) between sections, `spacing.xs` (4) label→value. Clear hierarchy: uppercase 11pt eyebrow labels over 16pt body values, intervention weighted heavier as the actionable line. Test confirms all three labels + values render (lines 126–147). Clean.

### 5. Normal — max content (280 char × 3) — **CONCERN / FAIL (the critical one)**
This is the brief's #1 failure mode and it is **only partially handled.** Findings:

- **No truncation, no `numberOfLines`, no expand affordance anywhere in the panel** — confirmed by grep (zero `numberOfLines` / `maxHeight` / `flexShrink` in the file). So three 280-char fields wrap **in full**. Nothing is clamped and nothing overflows horizontally — text wraps within the card, the CTA stays below the content and is never pushed off-screen.
- **Vertical height is the issue.** On a 375pt-wide device (iPhone SE/mini), card content width ≈ 375 − 2×screen-pad − 2×16 card-pad ≈ ~311pt. At `body` 16px/26-line-height Inter, ~38–42 chars/line → a 280-char field wraps to ~7–8 lines ≈ ~190px each. Three fields (~570px) + labels + header + CTA + paddings → a card on the order of **~750–820px tall**. That is taller than the SE viewport.
- **Why this is not a hard FAIL / not BLOCKED:** the panel is mounted via `aiPanelSlot` **inside the host `ScrollView`** (`HealthFitnessScreen` lines 253–260 / 268–322; `SleepRecoveryScreen` line 239) and sits at the **end** of scroll content. So a tall card scrolls; it does not clip the CTA off-screen or break layout. The realistic worst case is a long-but-scrollable card, not a broken one.
- **Why it is still a CONCERN worth R2:** 280×3 fully expanded with no "Read more" is a poor reading experience and a notable consonance gap — the **coach** panel deliberately clamps its long fields (`numberOfLines={1}` collapsed observation; `DRAFT_PREVIEW_LINES=2` on the draft with a Read more/Show less toggle, coach lines 261, 274–289). The client panel has no equivalent disclosure. The builder header comment claims "progressive disclosure" but the loaded client card has none for body text. Per MOBILE §4.5 the long content should clamp with an expand affordance. Recommend a deliberate decision in R2 (see fixer instructions). The test suite uses only short fixtures (~45–55 chars), so the max-content case is **untested** — there is no render assertion guarding it (50-Failures #22, missing edge-case coverage for the realistic-load case).

**Verdict: CONCERN (lean FAIL on the design-intel checklist, not on releasability).** Must be explicitly decided in R2.

### 6. Confidence levels (×5) — **PASS (with one semantic note)**
`ConfidenceChip` (lines 366–388) renders `CONFIDENCE_LABEL[level] · CONFIDENCE_PCT[level]%`. The five levels map correctly in the contract: i_think 50 / fairly_sure 70 / confident 85 / certain 95 / verified 100 (api lines 62–77). **Percentage is shown alongside the label** as required. Test asserts "Confident · 85%" and "Verified · 100%" (lines 190–206) and the a11y label "Fairly sure confidence" (line 228).

Color semantics: the chip is **intentionally neutral** — border + 10%-alpha fill in the bucket accent (warm camel / cool forest), charcoal text — and is **identical across all five levels** (no red→green progression). The brief says "flag if all same color." Here the sameness is a **documented, deliberate design choice** (header comment §6.3 / MOBILE §4.7: "never green-for-good"; coach panel does the same). MOBILE §4.7 / §6.3 explicitly argue against engineering a green "good" confidence color for a synthesized health insight, because a high-confidence *negative* finding rendered green would mislead. So "i_think" never looks more confident than "verified" — they look identical and the **percentage text** carries the gradient. This is the right call and consonant with HK-5a; I record it as PASS, not a flag. Contrast: charcoal `#3D3D3A` chip text on the bone card `#F5EFE4` ≈ 8:1 (AA PASS for the 10px text). The 10%-alpha accent fill does not materially shift the background under the text.

### 7. CTA present — **PASS**
`cta != null` branch (lines 314–331, `testID="client-insight-cta"`). Renders a filled `Pressable` (`backgroundColor: tone.accentInk` — the AA-safe ink, warm gold[800] #6B4F1A 6.65:1 / cool forest 8.57:1, NOT raw camel) with the CTA label (`bodyMd` bone text) + a forward arrow. Clear button affordance (filled, distinct from the link-style coach "Read more"). Touch target: `minHeight: 44` + `paddingVertical: spacing.md` (12) → ≥44pt, satisfying the brief and MOBILE touch-target rule. Pressed/disabled feedback: `ctaDisabled` (opacity 0.6) latches after first press to prevent double-navigation (#28). `accessibilityRole="button"`, `accessibilityState={{disabled}}`, `accessibilityLabel={cta.label}`. Label ≤40 enforced by the contract (`max(40)`). Deep-link re-validated against `^tgp://` before `Linking.openURL` (lines 144–151) with a logged-not-thrown refusal; the unsafe-link test (test lines 170–188) confirms `https://evil.com` is refused. On-accent text contrast: bone `#F5EFE4` on gold[800] `#6B4F1A` ≈ 6.6:1 (PASS); on forest ≈ 8.6:1 (PASS). Strong.

### 8. CTA absent (`optional_cta=null`) — **PASS**
The CTA is gated entirely behind `cta != null`, so when null **nothing renders** — no empty button slot, no orphaned `marginTop` (the CTA's `marginTop` lives on the CTA element itself, which is absent). Test asserts no `client-insight-cta` when `optional_cta: null` (lines 126–147). **No "Coming soon" / placeholder** anywhere (R0 ban) — grep-clean. PASS.

---

## Mobile Design Intel sweep

- **Text truncation under realistic load** — **CONCERN/FAIL.** 280×3 wraps fully un-clamped, no expand affordance; card becomes very tall (~750–820px on a 375pt device). Scrollable (inside host ScrollView) so not broken, but no progressive disclosure and untested. See state #5 + P1.
- **Touch target ≥44pt (CTA, Retry)** — **PASS.** CTA `minHeight:44`; Retry `minHeight:44`.
- **Color contrast** — **PASS (light mode).** Chip charcoal-on-bone ≈8:1; body ink-on-bone ≈16.5:1; CTA bone-on-accentInk ≥6.6:1; the panel correctly uses `tone.accentInk` for fills/text and reserves raw `tone.accent` (camel, ~2.7:1) for borders/icons only — the exact AA discipline documented in `wearablesTheme.ts`. The "i_think low-confidence muted-gray" failure the brief warns about does **not** occur because the chip is accent-tinted, not gray, and the text is charcoal not stone.
- **Loading/empty/error states informative** — **PASS.** All three carry real copy; loading is a layout skeleton; error has a Retry.
- **Screen reader** — **PASS.** Root container uses `accessibilityRole="summary"` with label `AI insight, <bucket>`; the builder's `region→summary` swap is **correct** — RN's typed `AccessibilityRole` has no web `region` landmark and `summary` is the blessed equivalent for a self-contained synthesized content region (documented at lines 68–75). Chip, CTA, Retry all labelled; error copy is `role="alert"`; skeleton bars hidden from AT. One nit: the chip exposes both an `accessibilityLabel` ("… confidence") and visible text — fine.
- **Dark mode parity** — **FAIL (P2).** Panel hardcodes light-mode palette tokens (`colors.bone` card bg, `colors.ink`/`colors.charcoal` text, `colors.stone` skeleton) from `theme/tokens.ts` and never consumes `useTheme()`. Dark mode is fully shippable (system-resolved + user override stored in AsyncStorage, exposed to a Settings Appearance radio — `ThemeProvider.tsx`). The S&R host `SleepRecoveryScreen` **is** `useTheme()`-aware (`colors.background`/`surface`/`textSecondary`), so in dark mode this bright light card renders on a dark screen. Mitigating: identical pattern in the HK-5a coach panel (consonant), and the H&F host screen is also static-light — but the S&R host is not, which makes the divergence visible there. See P2.
- **Safe area / notch** — **N/A → PASS.** Panel is inside a shell ScrollView, no `SafeAreaView` needed; CTA tap path sits inline in scroll content, not pinned to the home-indicator region. No collision.
- **Tap state** — **PASS.** CTA latches `opacity 0.6` on press/disable; `Pressable` gives default press feedback. (No explicit `style={({pressed})=>…}` opacity, relying on RN default + the disabled latch — adequate; minor enhancement opportunity noted P3.)
- **#12 fake/placeholder data** — **PASS.** No Lorem ipsum, no "Jane Doe", no `Math.random()`. All copy is contract-driven or static UI strings.
- **#22 missing edge-case handling** — **PARTIAL.** `insight == null || isEmptyInsight(insight)` → empty panel, so a settled-no-data case never renders a blank card. However **whitespace-only / empty-string fields are NOT explicitly guarded** in the client panel — the contract's `z.string().min(1)` prevents truly empty strings at the wire boundary, but a whitespace-only ("   ") observation would pass `min(1)` and render as a near-blank Section. Low likelihood (backend-generated) but not defended client-side. Minor (P3).

---

## Visual consonance vs HK-5a

Strong consonance — the client panel is clearly the read-only sibling of the coach panel, sharing chrome, tokens, and idioms:

**Consonant (same):**
- **Card chrome:** same `radius.lg` border, `borderWidth:1`, `padding: spacing.lg`, accent-tinted border (`withAlpha(tone.accent, …)`).
- **Confidence chip:** same neutral pill, same `micro`/charcoal text, same `CONFIDENCE_LABEL`/`CONFIDENCE_PCT` source, same "never green-for-good" rationale. Minor format difference: client renders `Label · 85%` (middot); coach renders `Label (85%)` (parens). Cosmetic, both legible — flag as a tiny inconsistency (P3).
- **Header idiom:** sparkles/bucket icon + eyebrow, chip pinned right via `space-between` headerRow. Same.
- **Loading:** both use a layout skeleton, not a spinner. (Coach uses shared `SkeletonLine`; client uses a local `SkeletonBar`. See divergence note.)
- **Error:** same `cloud-offline-outline` + sanitized copy + bordered Retry (`minHeight:44`, `tone.accentInk` text). `sanitizeWearableError` is duplicated locally rather than extracted — the builder documents this is **intentional** to avoid touching the out-of-scope coach file (lines 100–104); acceptable per the brief's scope rule (mild #40 duplication, justified).
- **Empty:** same literal "Not enough data yet — keep syncing." + a calm secondary line, NO chip. (Different icon: client `sparkles-outline`, coach `hourglass-outline`; different secondary copy. Minor, acceptable.)
- **AA token discipline:** both reserve raw `tone.accent` for borders/icons and use `tone.accentInk` for fills/links.

**Intentional, justified divergence (correct):**
- **No action row.** Coach has expand/collapse, Read more, Review-message CTA, and a full edit/approve/dismiss modal sheet. Client is read-only: three static sections + an optional read-only deep-link CTA. This is the core HK-5b contract ("CLIENT screen, not coach. No approve/edit/reject") and is exactly right.
- **Field set differs by contract:** client = observation / norm_comparison / intervention; coach = observation / hypothesis / suggested_action / draft. Correct per the two schemas.
- **Card background:** client `colors.bone`; coach `colors.cream`. Both warm light surfaces; slight tonal difference is acceptable (client cards sit on the bone screen bg; coach on the client-detail surface). Not a defect.

**Unjustified / worth noting divergences:**
- **D1 (P1):** Coach clamps long text and offers expand (collapsed observation `numberOfLines={1}`; draft preview `numberOfLines={2}` + Read more). **Client clamps nothing** and offers no expand for its three ≤280-char fields. This is the core of state #5 — the client panel is *less* disciplined than its sibling on exactly the field-length axis. Should be reconciled in R2 (deliberate decision).
- **D2 (P3):** Loading skeleton uses a **local** `SkeletonBar` reimplementation while the coach reuses the shared `components/SkeletonLoader.SkeletonLine` (50-Failures #15/#41 — re-implementing an existing primitive). Justified loosely by "mirror the real layout precisely," but the local bar duplicates shimmer + reduce-motion logic the shared component already has. Low priority.
- **D3 (P3):** chip text format `·` vs `()`; cosmetic.

Overall: consonant and intentional where it diverges, **except** the truncation/disclosure axis (D1), which is the substantive gap.

---

## P0/P1/P2/P3 findings

**P0 (blocker):** None.

**P1 (should fix in R2):**
- **P1-a — State #5 max-content has no clamp/expand and is untested.** Three 280-char fields wrap fully → ~750–820px card on a 375pt device. Not broken (scrolls inside host ScrollView), but no progressive disclosure, diverging from the coach sibling and from MOBILE §4.5. No test fixture exercises max-length, so the realistic-load case is unguarded (#22). Decide explicitly: either (a) clamp non-emphasized fields with a Read more, or (b) consciously accept full wrap and add a max-length render test documenting the decision.

**P2 (recommended):**
- **P2-a — Dark-mode parity gap.** Panel hardcodes light-mode `colors.*` and ignores `useTheme()`. Dark mode is shippable and the S&R host screen is dark-aware, so the card renders as a bright light surface on a dark background in dark mode. Coach panel has the same gap (consonant) but its hosts are light; the client S&R host is not. Migrate the panel's surface/text/skeleton colors to semantic `useTheme()` tokens (`bgSurface`, `textPrimary`, `textMuted`, `border`) — or, if dark mode for the wearables surface is explicitly out of scope for HK-5b, document that decision.

**P3 (nice-to-have / polish):**
- **P3-a — Whitespace-only field not guarded client-side.** `z.string().min(1)` passes "   "; a whitespace-only field would render a near-blank Section. Add a `.trim()` guard or treat blank-after-trim as empty (#22).
- **P3-b — Empty/error rows are left-aligned, not centred.** Brief's ideal empty state is "centred." Current left-aligned icon+text row is consonant with coach; minor.
- **P3-c — Local `SkeletonBar` duplicates the shared `SkeletonLine` primitive** (#15/#41). Consider reusing the shared component or extending it.
- **P3-d — Chip text format inconsistency** with coach (`·` vs `()`).
- **P3-e — CTA has no explicit pressed-opacity** beyond the disabled latch + RN default. Consider `style={({pressed}) => [..., pressed && {opacity:0.8}]}` for clearer tap feedback (MOBILE behavioral/visceral feedback).

---

## Recommended R2 fixer instructions (NEEDS_R2)

Apply only to `src/screens/client/wearables/ClientWearableInsightPanel.tsx` and its test (do not touch the coach file — scope rule). Builder must be Opus 4.8.

1. **Resolve state #5 (P1-a).** Pick one and make it explicit:
   - **Preferred:** clamp `observation` and `norm_comparison` with `numberOfLines={3}` and add a single "Read more / Show less" toggle (mirror the coach panel's `draftPreviewExpanded` pattern, lines 274–289) that expands all clamped fields; leave the emphasized `intervention` unclamped so the action is always fully visible. This brings the client panel into consonance with the coach sibling and satisfies MOBILE §4.5.
   - **Alternative (if product wants full text always):** keep full wrap, but add a code comment documenting the decision and the host-ScrollView reliance.
   - **Either way:** add a test fixture with three exactly-280-char fields (+ a CTA) asserting the loaded card renders all three sections and the CTA, so the realistic-load case is guarded (#22).

2. **Close the dark-mode gap (P2-a).** Replace static palette references (`colors.bone`, `colors.ink`, `colors.charcoal`, `colors.stone` skeleton, `colors.bone` CTA text) with `useTheme()` semantic tokens (`bgSurface`, `textPrimary`, `textMuted`, `textOnAccent`, `border`). Keep the bucket `tone.accent`/`accentInk` as-is (they are AA-verified on light; verify they still clear AA on the dark surface, or branch them by `colorScheme`). If dark mode is out of scope, add a one-line scope note instead.

3. **Guard whitespace fields (P3-a).** Treat `value.trim().length === 0` fields as absent, or fall back to the empty panel if all three are blank after trim.

4. **Optional polish:** reuse the shared `SkeletonLine` (P3-c); align chip format with coach (P3-d); add explicit CTA pressed-opacity (P3-e).

Do not commit. Audit only.
