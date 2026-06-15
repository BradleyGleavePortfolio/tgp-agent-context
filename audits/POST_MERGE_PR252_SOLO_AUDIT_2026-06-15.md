PASS_WITH_FINDINGS — P0:0 · P1:0 · P2:4 · P3:2

# Post-merge PR #252 Solo Re-audit — Mobile

Repo: `BradleyGleavePortfolio/growth-project-mobile`  
PR: `#252` — host wiring (`StripeConnectCard` + `PermanenceMarker` per D6B)  
Merge audited: `bad38fc0424ce1705de4043e74d84fecf316ca36`  
Current `main` audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`  
Flag: `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH`, default OFF  
Audit mode: R81 strict, fresh hostile solo re-audit against current `main`

## Executive verdict

`PASS_WITH_FINDINGS`, not clean for release/flag-flip.

The paired audit missed at least two strict-mode issues: an accessibility/account-display defect inside `StripeConnectCard`, and the R82 absence of a tracking issue for unresolved D6B work. I also flag an R74 provenance violation on the merge commit. The biggest product issue remains unchanged: D6B is still not implemented on `main`; `StripeConnectCard` and `PermanenceMarker` are effectively dead production components, not host-wired UI.

## Scope performed

- Ran the required GitHub API command for merge `bad38fc0` and captured the touched-file list.
- Read every PR #252 touched file in full on current `main`.
- Re-verified every prior/original finding.
- Searched current production hosts for actual wiring of `StripeConnectCard` and `PermanenceMarker`.
- Ran targeted Stripe/security/mobile sweeps: deep-link URL validation, OAuth/state exposure, secret/query logging, refresh-token surfaces, Stripe account ID/card display safety, touch targets, accessibility tree behavior, flag-off behavior, and strict-mode rules.
- Local test attempt was blocked because `jest` was unavailable in the workspace (`npm test ...` exited `127`); this report is based on full static inspection plus repository/evidence sweeps.

## Prior-finding verification

| ID | Prior finding | Severity | Current status | Solo verification |
|---|---|---:|---|---|
| PF-1 | D6B host wiring absent for `StripeConnectCard` and `PermanenceMarker` | P2 | STILL_PRESENT | Search hits for both components remain limited to component files, tests, feature-flag comments, and copy/test material. No production host imports or mounts them. |
| PF-2 | `StripeConnectCard` CTA lacks a guaranteed Android 48dp target | P2 | STILL_PRESENT | CTA still uses `paddingVertical: 14`, `paddingHorizontal: 28`, `borderRadius: 2`, `alignItems: 'center'`; no `minHeight`, `hitSlop`, or other guaranteed 48dp affordance. |
| PF-3 | `romanPRDetected` has a dead/no-op conditional branch | P3 | STILL_PRESENT / PRE-EXISTING | `const weightLabel = Number.isInteger(weight) ? String(weight) : String(weight);` remains in `src/lib/roman/copy.ts`; evidence indicates it predates PR #252. |

## D6B compliance

D6B compliance is **FAIL**.

### `StripeConnectCard` host wiring

- Expected: card actually mounted into the Stripe Connect host screen now, under the default-OFF polish flag.
- Actual: `StripeConnectCard` has no production host hit outside its own component, its tests, and comments/tests around the flag.
- The existing Stripe host, `src/screens/coach/payments/CoachConnectScreen.tsx`, still renders its older `heroCard` and `TouchableOpacity` CTA flow and does not import or mount `StripeConnectCard`.
- Result: `StripeConnectCard` is dead production UI on current `main`.

### `PermanenceMarker` host wiring

- Expected: marker actually visible in package/pricing saved rows now, under the default-OFF polish flag.
- Actual: `PermanenceMarker` hits are limited to the component, tests, copy stems, feature-flag comments, and flag-off tests.
- No package/pricing host mounts `PermanenceMarker` with `kind="packageSaved"` or `kind="priceSaved"`.
- Result: `PermanenceMarker` is dead production UI on current `main`.

### `StepTransitionView`

- `StepTransitionView` is host-wired through `OnboardingLayout` and gated by `featureFlags.romanOnboardingPolish`.
- This does not satisfy D6B for the two explicitly locked host-wiring requirements above.

## Findings

### F1 — STILL_PRESENT — D6B host wiring remains absent for `StripeConnectCard` and `PermanenceMarker`

Severity: P2

`StripeConnectCard` and `PermanenceMarker` are present as isolated components but are not wired into production screens. This violates the locked operator decision D6=B, which required wiring into host screens now rather than deferring.

Evidence:

- `StripeConnectCard` production host hits excluding component/test/flag comments: none.
- `PermanenceMarker` production host hits excluding component/test/copy/flag comments: none.
- `CoachConnectScreen` still uses the old hero/CTA path and does not import `StripeConnectCard`.
- Package/pricing host candidates do not mount `PermanenceMarker`.

Impact:

- The PR title and feature-flag documentation imply delivered host behavior, but current `main` cannot show two of the three PR #252 UI deliverables in production.
- The flag can be flipped without exposing the intended Stripe and permanence-marker UI, making rollout validation misleading.

Recommended fix:

- Mount `StripeConnectCard` in the real Stripe Connect host, deriving `connected` from the existing Connect status and wiring `onConnect` to the existing onboarding-link flow.
- Mount `PermanenceMarker` in the real package/pricing saved rows with `kind="packageSaved"` and `kind="priceSaved"`.
- Add host-level flag-off and flag-on tests proving both components are present/absent in their actual screens, not only in isolated component tests.

### F2 — STILL_PRESENT — `StripeConnectCard` CTA still lacks a guaranteed 48dp touch target

Severity: P2

The CTA remains styled with padding only and no explicit minimum interactive height. On Android/native mobile, padding plus text height can be fragile across font scaling and platform differences; the component should guarantee at least 48dp.

Evidence:

```tsx
cta: {
  marginTop: 8,
  paddingVertical: 14,
  paddingHorizontal: 28,
  borderRadius: 2,
  alignItems: 'center',
},
```

Impact:

- The card's primary Stripe action can be under-targeted or inconsistent under accessibility/font-scaling conditions.
- This is currently shielded by dead host wiring, but it becomes user-facing immediately once F1 is fixed.

Recommended fix:

- Add `minHeight: 48`, `justifyContent: 'center'`, and/or an explicit `hitSlop`.
- Add a component test or style assertion pinning the minimum touch target.

### F3 — STILL_PRESENT / PRE-EXISTING — `romanPRDetected` has a dead identical branch

Severity: P3

The copy helper still contains a branch whose true and false arms are identical:

```ts
const weightLabel = Number.isInteger(weight) ? String(weight) : String(weight);
```

Impact:

- No immediate runtime bug, but the conditional communicates nonexistent formatting logic and increases maintenance confusion.
- Evidence indicates this predates PR #252, so it is not a PR #252-introduced defect.

Recommended fix:

- Replace with `const weightLabel = String(weight);`, or implement the intended integer/non-integer formatting split.

### F4 — NEW — Hidden `StripeConnectCard` face remains accessible and can expose unsanitized account display text

Severity: P2

`StripeConnectCard` mounts both the disconnected front face and connected back face at the same time. It visually toggles them with animation/backface styles and changes touch handling with `pointerEvents`, but it does not hide the inactive face from the accessibility tree.

Evidence:

```tsx
<View
  style={styles.faceContent}
  accessibilityRole="summary"
  accessibilityLabel="Connect your payouts with Stripe"
>
...
<HapticPressable
  accessibilityRole="button"
  accessibilityLabel="Connect Stripe"
>
```

```tsx
<View
  style={styles.faceContent}
  accessibilityRole="summary"
  accessibilityLabel={
    hasAccount
      ? `Stripe connected. ${brand} ending ${last4}.`
      : 'Stripe connected.'
  }
>
...
{brand} ending {last4}
```

```tsx
<Animated.View style={[styles.face, frontStyle]} pointerEvents={connected ? 'none' : 'auto'}>
  <FrontFace onConnect={onConnect} colors={colors} testID={testID} />
</Animated.View>
<Animated.View
  style={[styles.face, styles.faceAbsolute, backStyle]}
  pointerEvents={connected ? 'auto' : 'none'}
>
  <BackFace brand={brand} last4={last4} colors={colors} testID={testID} />
</Animated.View>
```

There is no `accessibilityElementsHidden`, no `importantForAccessibility="no-hide-descendants"`, no inactive-face `accessible={false}`, and no equivalent hiding prop in the component. `pointerEvents` prevents touches; it does not remove content from screen-reader navigation.

The back face also accepts any non-empty `last4` string:

```ts
const hasAccount =
  brand != null && brand.trim() !== '' && last4 != null && last4.trim() !== '';
```

Impact:

- When `connected=false`, assistive tech may still encounter/announce the hidden connected face, including `Stripe connected` and any provided `brand`/`last4` account detail.
- When `connected=true`, assistive tech may still encounter/announce the inactive `Connect Stripe` CTA.
- Because `last4` is not constrained to four digits, a host wiring mistake could announce or render a Stripe account identifier, longer account string, or otherwise unsafe value in a visually hidden-but-accessible node.
- This is especially risky because D6B requires the card to be wired into the Stripe host.

Recommended fix:

- Hide the inactive face from assistive tech using inverse `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"` on each face wrapper.
- Consider `accessible={false}` for inactive face content where appropriate.
- Sanitize/suppress account display values: only render/announce `last4` when it matches `^\d{4}$`; otherwise show the generic connected copy.
- Add tests proving inactive-face labels are not accessible in both connected and disconnected states, and proving malformed `last4` is not rendered or announced.

### F5 — NEW — R82 tracking issue is missing for unresolved pre-flag-flip/D6B work

Severity: P2

Strict R82 requires a tracking issue when a finding is deferred, descoped, or otherwise remains open past audit/merge. The unresolved D6B host-wiring work is still open, but a repository issue search for the relevant component/flag/R81 tracking terms returned no matching issue. The relevant labels (`pre-flag-flip`, `R81-backfill`, `tracking`) exist, but no issue is present.

Impact:

- The largest unresolved PR #252 risk can fall through the cracks before flag flip.
- R82 explicitly requires the re-auditor to flag an untracked descoped/open finding as a new P2.

Recommended fix:

- File a tracking issue before any flag flip with labels including `R81-backfill`, `tracking`, `mobile`, and `pre-flag-flip`.
- Include owner, exact scope, acceptance criteria, pre-flag-flip gate, linked PR #252/merge hash, and this audit's F1/F4/F5 references.

### F6 — NEW — R74 merge provenance is not strict-clean

Severity: P3

The merge commit is not authored/committed exactly as required by R74 strict mode and contains a co-author trailer.

Evidence from merge metadata:

```text
author=BradleyGleavePortfolio <bradleyapple1031@gmail.com>
committer=GitHub <noreply@github.com>
Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>
```

Impact:

- No direct runtime impact.
- It fails strict provenance hygiene: R74 requires the operator identity `Bradley Gleave <bradley@bradleytgpcoaching.com>` for author/committer and prohibits co-author trailers.
- Prior audit only checked for assistant/model trailers; strict R74 should have caught the broader provenance mismatch.

Recommended fix:

- Do not rewrite shared history just for this unless the operator requires it.
- For future merges/commits, enforce the exact Bradley Gleave author/committer identity and no co-author trailers before merge.

## Stripe/security/mobile hostile scan

### Deep link URL handling

No new P0/P1 was found in the existing Stripe host flow. `CoachConnectScreen` obtains an onboarding link through `connectApi`, validates the URL with `assertStripeUrl(...)`, and only then opens it with `WebBrowser.openBrowserAsync(...)`.

### URL allowlist / secret leakage

The Stripe URL validator allows HTTPS URLs for Stripe-owned hosts and subdomains of those hosts, and rejects non-HTTPS/lookalike patterns in tests. The rejection path logs a parsed host/context rather than the full URL/query, which avoids obvious token/query leakage from validator logs.

### OAuth state validation

No PR #252 code implements a custom OAuth callback or `state` parameter flow. The current host path uses Stripe-hosted onboarding/browser close refresh behavior, so there is no newly introduced OAuth `state` validator to audit in the touched PR #252 files. This is not a pass for future OAuth work; it is a scope observation for this merge.

### Refresh-token rotation

No refresh-token handling or rotation logic is present in the PR #252 touched files. No PR #252 refresh-token bug was found.

### Stripe account ID / account display safety

The existing `CoachConnectScreen` does not display `stripe_account_id`. However, `StripeConnectCard` accepts arbitrary `brand` and `last4` props and displays/announces them without validating `last4`; see F4.

## Rules check

| Rule | Status | Notes |
|---|---|---|
| R0 | PASS for introduced code patterns reviewed | Added PR #252 lines did not introduce the banned `logger.*`, raw `setTimeout`, `console.*`, etc. patterns in the diff sweep. Existing unrelated patterns found in nearby screens were verified pre-existing. |
| R65 | PASS_WITH_FINDINGS | No new auth/IDOR/transaction/database failure found in PR #252; Stripe UI/account-display safety produced F4. |
| R72 | PASS | All 14 touched files were read in full on current `main`; host sweeps were performed rather than sampling. |
| R74 | FAIL | Merge provenance is not strict-clean; see F6. |
| R77 | PASS | Audit remained read-only against the repository; only workspace evidence/report files were written. |
| R79 | PASS_WITH_FINDINGS | Existing pins cover isolated component/flag-off behavior; host-level pins are missing because D6B host wiring is missing. |
| R81 | FAIL / NOT CLEAN | Strict auditor gate cannot be clean with P2 findings still present and new P2 findings found. |
| R82 | FAIL | No tracking issue found for unresolved D6B/pre-flag-flip work; see F5. |

## Recommendation

Do not treat PR #252 as R81-clean. Keep `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH` OFF until F1, F4, and F5 are fixed or explicitly tracked/accepted by the operator.

Minimum pre-flag-flip gate:

1. Wire `StripeConnectCard` into the real Stripe Connect host screen.
2. Wire `PermanenceMarker` into the real package/pricing saved states.
3. Fix inactive-face accessibility hiding and `last4` sanitization in `StripeConnectCard`.
4. Guarantee the `StripeConnectCard` CTA 48dp target.
5. Add host-level tests for flag-off and flag-on behavior.
6. File the required R82 tracking issue for any remaining deferred work.
7. Ensure future commit/merge provenance is R74-clean.

## Evidence saved

- `pr252_files.json` — required GitHub API touched-file output.
- `POST_MERGE_PR252_SOLO_full_touched_files_2026-06-15.txt` — all touched files read in full on current `main`.
- `POST_MERGE_PR252_SOLO_D6B_search_2026-06-15.txt` — component and host wiring searches.
- `POST_MERGE_PR252_SOLO_expected_hosts_2026-06-15.txt` — expected host excerpts/sweeps.
- `POST_MERGE_PR252_SOLO_stripe_security_context_2026-06-15.txt` — Stripe host/API/validator context.
- `POST_MERGE_PR252_SOLO_stripe_secret_state_sweep_2026-06-15.txt` — Stripe secret/state/token/account sweeps.
- `POST_MERGE_PR252_SOLO_new_finding_accessibility_stripe_2026-06-15.txt` — F4 supporting code excerpts.
- `POST_MERGE_PR252_SOLO_tracking_issue_search_2026-06-15.txt` — F5 tracking issue/label evidence.
- `POST_MERGE_PR252_SOLO_git_metadata_2026-06-15.txt` — F6 provenance evidence.
- `POST_MERGE_PR252_SOLO_test_run_2026-06-15.txt` — local test runner failure evidence.
