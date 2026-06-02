# HK-5a R2 Audit — VISUAL / DESIGN (Opus 4.8, fresh independent instance)

**Head SHA (R2):** `aad8931848c701720a6f1ca68436d2c66501e694`
**PR:** #225 — `hk/PR-HK-5a-coach-ai-panel` (growth-project-mobile)
**Worktree:** `/tmp/wt-hk5a-audit-r2-visual`
**Diff base:** `origin/main` (`00f8e95`)
**Auditor role:** R31/R32 — auditor ≠ builder. Fresh instance; did NOT build or fix. Read R1 visual audit only to know what to re-verify; did not rubber-stamp.

## VERDICT: **NEEDS_FIX**

The primary R1→R2 fix (WCAG AA contrast on the warm bucket, F2/F3/F6) is **incomplete**. The fixer swapped warm `camel` (#B08D57, 2.70:1) for `gold[700]` (#8A6A2A) and asserted in the token comment that this is "≈5.10:1 on bone (AA PASS)". **That claim is wrong.** My independent computation gives **4.39:1 on bone and 4.13:1 on cream / 3.80:1 on the tinted card** — every warm-bucket text/CTA pair lands *below* the 4.5:1 AA normal-text threshold. The brief is explicit: CLEAN requires **every** warm text/CTA pair ≥4.5:1. It is not met. → **P1**.

All other R1 findings (F1 R0-hygiene literal, F4 retry payload, F5 jest exit, F6 charCount, F7 versioned keys) are genuinely resolved, all gates pass, and the R0 added-line sweep is empty.

---

## Gate results

| Gate | Result | Exit |
|---|---|---|
| `git rev-parse HEAD` | `aad8931848c701720a6f1ca68436d2c66501e694` ✓ | — |
| `git log -1` author | `Dynasia G <dynasia@trygrowthproject.com>` ✓ | — |
| commit message | `fix(wearables): HK-5a R2 — drop coming-soon hygiene test, AA-safe accent on warm bucket, …` (subject only; no body) ✓ | — |
| `npx tsc --noEmit` | 0 errors | **0** |
| `npx eslint <11 touched files>` | clean | **0** |
| `npx jest (WearableInsightPanel\|useWearableInsight) --runInBand` | **17 passed / 17** (13 panel + 4 hook); **NO "did not exit" warning** | **0** |
| hook test in isolation | 4/4, clean exit, no open-handle warning | **0** |
| R0 added-line sweep | **empty** (grep exit 1) | ✓ |
| Diff scope (`--stat`) | 11 expected files, +1862/-3; no node_modules, no unrelated refactor | tight |

Diff files: `wearableInsightsApi.ts` (+245), `useWearableInsight.ts` (+78), `WearableInsightPanel.tsx` (+773), `wearablesTheme.ts` (+19/-3, the new `accentInk` field), the two one-line tab mounts (`HealthFitnessTab.tsx`/`SleepRecoveryTab.tsx`, +3 each), and 5 test files. Matches the sanctioned scope exactly.

Note (non-blocking): the panel test emits React `act(...)` warnings originating from the shared `useReduceMotion.ts:28` async probe. This is a pre-existing shared-hook artifact (not introduced by HK-5a) and does not fail the suite or leave open handles — flagged for awareness only.

---

## WCAG AA CONTRAST — independent computation (THE main R1→R2 fix)

Formula: `contrast = (L1 + 0.05) / (L2 + 0.05)`, with relative luminance
`L = 0.2126·R + 0.7152·G + 0.0722·B` over sRGB-gamma-linearised channels
(`c/12.92` if `c ≤ 0.03928`, else `((c+0.055)/1.055)^2.4`).
Self-check vs `tokens.ts` documented values: ink/bone → 15.23 (doc ~16.5), charcoal/bone → 9.52 (doc ~8.0), forest/bone → 8.57 (doc ~7.4), stone/bone → 2.05 (doc ~2.3). Formula validated. Script: `/home/user/workspace/_contrast_hk5a_r2.py`.

Token values (`theme/tokens.ts`): `bone #F5EFE4`, `cream #F1E8D5`, `ink #1A1A18`, `charcoal #3D3D3A`, `stone #B1A89F`, `forest #2C4A36`, `camel #B08D57` (= `gold[500]`), **`gold[700] #8A6A2A`** (= `WARM.accentInk`). Warm card surface = `cream` with `withAlpha(camel,0.1)` tint → composited `#EADFC8`. Sheet/error surface = `bone`.

Type roles: `bodyMd` = 16px/500, `bodySmall` = 14px/400. Neither qualifies as WCAG "large text" (≥24px, or ≥18.66px bold), so **all require 4.5:1, not 3:1.**

### WARM bucket — `accentInk = gold[700] #8A6A2A`  → **ALL FAIL**

| Element (file:line) | Pair | Contrast | AA 4.5:1 |
|---|---|---|---|
| `reviewCta` fill, bone text (`WearableInsightPanel.tsx:292,298–299`) | bone on #8A6A2A | **4.39:1** | **FAIL** |
| `primaryBtn` enabled, bone text (`:516,528`) | bone on #8A6A2A | **4.39:1** | **FAIL** |
| `readMore` text on tinted card (`:286`) | #8A6A2A on #EADFC8 | **3.80:1** | **FAIL** |
| error `Retry` text on cream card (`:228`) | #8A6A2A on cream | **4.13:1** | **FAIL** |
| sheet `Retry` text on bone (`:508`) | #8A6A2A on bone | **4.39:1** | **FAIL** |
| `Edit then send` enabled label on bone (`:547`) | #8A6A2A on bone | **4.39:1** | **FAIL** |

### `charCount` (F6) — **PASS**

| `charCount` charcoal on bone (`:488,717`) | charcoal on bone | **9.52:1** | **PASS** |
(R1 defect was `stone` on bone = 2.05:1 — correctly replaced with `charcoal`.)

### COOL bucket — `accentInk = colors.forest #2C4A36` → **ALL PASS**

| `reviewCta`/`primaryBtn` fill, bone text | bone on forest | **8.57:1** | PASS |
| `readMore`/error-Retry on cream | forest on cream | **8.06:1** | PASS |
| sheet `Retry` / `Edit then send` on bone | forest on bone | **8.57:1** | PASS |

### Body / chrome text — PASS
`observation` ink-on-cream 14.31:1; `secondary` charcoal-on-cream 8.95:1; `chipText` charcoal-on-bone 9.52:1.

### Regression check — the R1 camel values are gone
bone-on-camel 2.70:1 and camel-on-cream 2.54:1 no longer appear in the source (camel is now borders/icons only). The fix moved in the right direction but stopped ~0.1–0.7 short of the line.

---

## Findings

### P1 — Warm-bucket `accentInk` (`gold[700] #8A6A2A`) still fails WCAG AA on every text/CTA pair
- **Files:** `src/screens/client/wearables/wearablesTheme.ts:54` (`WARM.accentInk = gold[700]`) consumed at `WearableInsightPanel.tsx:107,228,286,292,508,516,547`.
- **Issue:** The token doc-comment claims `gold[700]` is "≈5.10:1 bone (AA PASS)". Independent computation: **bone↔#8A6A2A = 4.39:1; #8A6A2A↔cream = 4.13:1; #8A6A2A↔tinted-card = 3.80:1.** All six warm text/fill pairs are 16px/500 or 14px/400 (non-large) and need 4.5:1; none reach it. This is the *exact* defect class R1 flagged (P2) — the magnitude shrank from 2.5–2.7:1 to 3.8–4.4:1 but the AA bar is not cleared. The brief's CLEAN bar ("every text/CTA pair on the warm bucket ≥4.5:1") is unmet, and the brief calls this the primary R1→R2 fix.
- **Evidence:** `/home/user/workspace/_contrast_hk5a_r2.py` (run output reproduced above); formula validated against `tokens.ts` self-documented ratios.
- **Fix:** Darken `WARM.accentInk` to a token that clears 4.5:1 against **both** bone *and* the tinted card. `gold[800] #6B4F1A` already exists in `theme/tokens.ts:127` — bone↔#6B4F1A ≈ 6.6:1, comfortably AA on bone, cream, and the tint (verify before merge). Then re-run the contrast script and confirm every warm pair ≥4.5:1. Update the misleading "≈5.10:1" doc-comment to the actual computed value to prevent the same false-PASS recurring.

---

## F1–F7 verification

| Fix | Status | Evidence |
|---|---|---|
| **F1** — delete `describe('R0 hygiene')` block, other tests still pass | ✓ RESOLVED | No `coming soon`/`hygiene` in `WearableInsightPanel.test.tsx` (grep exit 1); 13 panel tests pass. R0 sweep on diff empty. |
| **F2** — add `accentInk` to `ToneTokens` (`WARM=gold[700]`, `COOL=forest`) | ✓ field added, ✗ **value wrong** | `wearablesTheme.ts:43,54,62`; field exists & threaded via `tone.accentInk` → `toneInk`. But the warm value is sub-AA (P1). |
| **F3** — `tone.accent`→`tone.accentInk` for all on-light text/links/CTA fill; icons + chip border stay `tone.accent` | ✓ threading correct, ✗ **fails AA on warm** | `readMore:286`, error-Retry:228, sheet-Retry:508, `Edit then send`:547, `reviewCta` fill:292, `primaryBtn` fill:516 all use `toneInk`. Icons (174,260,298) + chip border (`withAlpha(accent,0.4)`:349) + retry-btn border:222 still `tone.accent`. Wiring is exactly as claimed; the **value** under it fails (P1). |
| **F4** — retry replays exact last `{action,draftBody}` via `useRef`, `!busy` guard, 3 new tests | ✓ RESOLVED | `lastAttemptRef` (`:405–408`), set in `run` (`:415`), replayed in `onRetrySend` with `if (busy) return` re-entry guard (`:443–446`). 3 tests pass: approve-after-edit replays ORIGINAL body; dismiss-error replays dismiss (not approve) w/ empty body; edit-error replays failure-time body. |
| **F5** — hook test cleans QueryClient (`qc.clear()`+`qc.unmount()` in `afterEach`), `gcTime:0` queries+mutations, no `--forceExit` | ✓ RESOLVED | `useWearableInsight.test.tsx:56,60,75–81`. No jest config touched; the only `forceExit` token in the diff is a *comment* (`api test:546`) stating the gate runs WITHOUT it. Isolated run exits clean, no "did not exit". |
| **F6** — `charCount` color = `colors.charcoal` | ✓ RESOLVED | `WearableInsightPanel.tsx:717`; charcoal-on-bone = **9.52:1** PASS. |
| **F7** — `insightQueryKeys.coach/client` include `'v1'` via `INSIGHT_KEY_VERSION` | ✓ RESOLVED | `wearableInsightsApi.ts:235,240,242` → `['wearable-insight','v1','coach'|'client',…]`. Hook (`useWearableInsight.ts:41,55,72`) uses the helper; tests pass. |

---

## Visual sweep checklist (all actively checked)

- **Confidence chip = neutral pill, never green-for-good.** `chip` bg `colors.bone`, text `colors.charcoal`, border `withAlpha(accent,0.4)` (tone.accent alpha — allowed). No status color. (`:347–356,654–664`) **PASS**
- **Loading = skeleton, not spinner.** Three `SkeletonLine`s + an 86×20 chip-placeholder; no `ActivityIndicator` in the loading branch (it appears only as the in-button busy indicator on Approve, which is correct). (`:187–201`) **PASS**
- **Empty = literal copy + secondary guidance, NO chip.** "Not enough data yet — keep syncing." + "Once we have ~3 days of data, your AI will flag patterns."; `EmptyPanel` renders no `ConfidenceChip`. (`:321–337`) **PASS**
- **Error = sanitized + Retry.** `sanitizeError` maps 403/404/5xx/0/ZodError → calm copy, truncated to 1 line, never leaks stack/message; Retry button present. (`:85–97,205–231`) **PASS** (Retry text color fails AA on warm → folded into P1.)
- **not_implemented = calm + disabled CTA.** Sheet stays open, shows `pendingCopy`, `primaryDisabled = busy || pending != null`. (`:425–426,439,492–496`) **PASS**
- **Forward hook = "Sent to <name>".** `Sent to ${firstName || 'your client'}` + "We'll fold their reply into the next insight."; auto-reverts after `FORWARD_HOOK_MS=3000` then refetches; timer cleared on unmount. (`:154–160,166–184`) **PASS**
- **Dismiss = ghost (charcoal), NOT destructive-red.** `ghostBtn` no fill/border; `ghostBtnText` `colors.charcoal`. (`:554–563,761–770`) **PASS**
- **Reduce-motion gates the expand fade.** `if (reduceMotion) { fade.setValue(1); return; }` before the timing anim. (`:125–128`) **PASS**
- **Tokens-only, no raw hex in component.** Every color is `colors.*` / `tone.*` / `withAlpha(...)`; zero hex literals in `WearableInsightPanel.tsx`. `accentInk` resolves to the `gold[700]` *constant* imported from `theme/tokens.ts` (allowed per brief), not an inline hex. **PASS**
- **WCAG AA computed on both buckets:** COOL PASS (8+:1); **WARM FAIL (3.80–4.39:1) → P1.**

Disabled-state note (non-blocking): disabled `primaryBtn`/`secondaryBtn` use `colors.stone` fill/label — WCAG 1.4.3 exempts disabled controls, so this is compliant. Decorative icons (`stone`, `tone.accent`) are exempt as non-text. Both correct.

---

## MOBILE_APP_DESIGN_INTELLIGENCE sweep

- **§1.2 Visceral / Behavioral:** restrained card, low-saturation tint, no badge/mascot theater; reads as a "careful, skilled team" surface. Behavioral competence: whole card is the tap target, one-line→expand is smooth. **PASS** (the warm-text low-contrast slightly undercuts the "polish = trust" signal — another reason to clear AA cleanly).
- **§2.2 Phantom / CALM:** error/empty/not_implemented copy is sympathetic and plain ("Not enough data yet — keep syncing", "rolling out — try again later" tone), never "Something went wrong"; error states are framed as recoverable trust-builders with Retry. **PASS**
- **§4.3 Miller's Law:** collapsed card is a single cognitive chunk; the sheet presents one primary action (Approve & send) + de-emphasized secondary/ghost — within the 4–5 element budget. **PASS**
- **§4.5 Progressive Disclosure:** collapsed one-line observation + chip → tap expands hypothesis/suggested-action/draft (2-line preview + "Read more") → "Review message" CTA → sheet. Advanced depth deferred, never absent. **PASS**
- **§4.7 Color semantics / consistency:** confidence is a neutral pill (not endorsement-green); error red reserved for true errors; dismiss is non-destructive ghost; one accent role per bucket. Consistent with the HK-3a/3b warm/cool system. **PASS** on semantics — but the *contrast* leg of "consistency = zero-cost cognitive state" needs the AA fix.
- **§5.1 Step 6/7 + §7.7 Layer 3 (closure / forward hook):** post-send "Sent to <name>" + forward-looking follow-up line is exactly the closure/forward-hook investment the doctrine asks for. **PASS**
- **Accessibility:** card `accessibilityRole="button"` + `accessibilityState={{expanded}}` + descriptive label; chip/Retry/CTA/sheet controls all labelled; sheet `accessibilityViewIsModal` + `header` title; error/pending `role="alert"`; disabled/busy states announced via `accessibilityState`. Labels/roles **PASS**; **contrast (a perceivability a11y requirement) FAILS on warm → P1.**

## 50-Failures sweep (R65) — visual-relevant subset
- **#5 IDOR:** 403 → generic "no access" copy, never the client's data; F4 retry replays the same authed mutation, no auth weakening. PASS.
- **#12 error sanitization:** `sanitizeError` wraps every path; no raw message/stack reaches the UI. PASS.
- **#19/#25 stale cache across versions:** `INSIGHT_KEY_VERSION='v1'` segment isolates this version's cache from any prior unversioned key — no cross-version bleed. PASS.
- **#28 race / re-entry:** `onRetrySend` guards `if (busy) return`; primary disabled while `busy || pending`. PASS.
- **#32 unmount cleanup:** forward-hook `setTimeout` cleared; expand anim `.stop()` on cleanup; hook-test `qc.unmount()` in `afterEach`. PASS.
- **#36 silent failure:** every loading/empty/error/not_implemented/thrown path renders copy + (where relevant) a CTA; no bare spinner. PASS.
- **#48 jest gate exits cleanly:** no "did not exit" warning, no `--forceExit`. PASS.

No P2/P3 from the 50-Failures sweep.

---

## Verdict rationale
All gates green, R0 sweep empty, F1/F4/F5/F6/F7 fully resolved, and the F2/F3 *wiring* is exactly as claimed. **However**, the substance of the primary R1→R2 fix — warm-bucket WCAG AA contrast — is **not** achieved: `gold[700] #8A6A2A` yields 4.39:1 (bone) / 4.13:1 (cream) / 3.80:1 (tinted card), all below the 4.5:1 AA normal-text minimum the brief requires for *every* warm pair, and the token's own "≈5.10:1 PASS" comment is factually incorrect. Per the brief, CLEAN requires every warm text/CTA pair ≥4.5:1.

**VERDICT: NEEDS_FIX** — single **P1** (warm `accentInk` sub-AA). One-line remedy: set `WARM.accentInk = gold[800] (#6B4F1A)` (or another token verified ≥4.5:1 on bone *and* the tinted card), re-run the contrast script, and correct the doc-comment. No other blocking findings.
