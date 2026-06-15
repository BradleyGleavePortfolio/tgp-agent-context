PASS_WITH_FINDINGS
# Post-Merge PR #252 Audit — R81 Re-Audit — 2026-06-15

## 1. Verdict

**PASS_WITH_FINDINGS — NOT R81-CLEAN**

PR #252 remains safe behind `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH` default-OFF, but the post-merge re-audit found the prior non-clean findings still present on current `origin/main` (`64e2de4dd4625e20fa6b41b7678d999be53ba4fc`). P0: 0 · P1: 0 · P2: 2 · P3: 1.

The specific D6B / ED.5 host-wiring decision was **not applied at merge** and is still not applied on current main: `StripeConnectCard` and `PermanenceMarker` remain component/test/copy-only surfaces with zero production host imports outside their own component files. This is a STILL_PRESENT P2 and must close before flag-on.

## 2. Scope

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#252`.
- Merge commit audited: `bad38fc0424ce1705de4043e74d84fecf316ca36`.
- Current main audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- Merge diff swept: `18764542f55c0b39747bbbd78928af6caadc3d45..bad38fc0424ce1705de4043e74d84fecf316ca36` — 14 files, +1334/−9.
- Current-main status swept for D6B host wiring, touch targets, telemetry, flag-off pins, accessibility, animation/reduce-motion seams, and post-merge file history.

## 3. Charge-by-charge verification table

| Charge | Result | Evidence |
|---|---:|---|
| D6B host wiring applied at merge | **FAIL — STILL_PRESENT P2** | Current main has no production import/mount of `StripeConnectCard` or `PermanenceMarker` outside component/test/copy files. |
| Stripe Connect expected host | **FAIL — STILL_PRESENT P2** | `CoachConnectScreen` still renders the old `heroCard` + `TouchableOpacity` flow; it does not import or mount `StripeConnectCard`. |
| Package/pricing expected host | **FAIL — STILL_PRESENT P2** | `PermanenceMarker`, `packageSaved`, and `priceSaved` only appear in the component, tests, and `copy.ts`; no package/pricing screen mounts them. |
| CTA touch target | **FAIL — STILL_PRESENT P2** | `StripeConnectCard` CTA style still has `paddingVertical: 14`, `fontSize: 16`, and no `minHeight` / `hitSlop`. |
| Flag default OFF | **PASS** | `romanOnboardingPolish` still reads `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH` with fallback `false`. |
| Flag-off pins | **PARTIAL PASS** | `onboardingPolishFlagOff.test.tsx` pins `StepTransitionView` hosts and disabled component behavior, but cannot pin `StripeConnectCard`/`PermanenceMarker` production hosts because none exist. |
| Accessibility | **PASS except touch target** | The card faces expose summary labels and the CTA has role/label; the remaining issue is physical target size. |
| Telemetry | **PASS / no dead telemetry** | The PR adds no telemetry event registry names or new emit sites; no registered-but-unemitted telemetry was found. |
| R0 banned patterns | **PASS** | Added production lines in the merge diff contain no `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, or `as any`. |
| Commit trailers | **PASS for assistant-attribution** | Merge commit body contains only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`; no assistant/model trailer was present. |

## 4. Findings

| ID | Sev | Status | Area | Finding |
|---|---|---:|---|---|
| F1 | **P2** | STILL_PRESENT | D6B host wiring / Completeness | `StripeConnectCard` and `PermanenceMarker` are still not mounted by any production host; the D6B decision was not applied at merge or after. |
| F2 | **P2** | STILL_PRESENT | Accessibility / Touch target | `StripeConnectCard`'s primary Connect CTA still lacks a guaranteed 48dp Android target (`minHeight` or `hitSlop`). |
| F3 | **P3** | STILL_PRESENT | Copy / Pre-existing | `romanPRDetected` still contains the pre-existing identical-branch dead conditional noted by the original audit. |

## 5. Per-finding detail

### F1 (P2) — D6B host wiring still absent for `StripeConnectCard` and `PermanenceMarker`

**Files:** `src/components/onboarding/StripeConnectCard.tsx`, `src/components/onboarding/PermanenceMarker.tsx`, expected host `src/screens/coach/payments/CoachConnectScreen.tsx`, expected package/pricing host(s)

Current-main grep results:

```text
StripeConnectCard hits:
- src/components/onboarding/StripeConnectCard.tsx
- src/components/onboarding/__tests__/StripeConnectCard.test.tsx
- src/screens/onboarding/__tests__/onboardingPolishFlagOff.test.tsx
- src/config/featureFlags.ts comment only

PermanenceMarker / packageSaved / priceSaved hits:
- src/components/onboarding/PermanenceMarker.tsx
- src/components/onboarding/__tests__/PermanenceMarker.test.tsx
- src/lib/roman/copy.ts
- src/screens/onboarding/__tests__/onboardingPolishFlagOff.test.tsx
- src/config/featureFlags.ts comment only

Exact production host import grep excluding component/test/copy files:
<no output>
```

`CoachConnectScreen` still renders its pre-existing card and button directly:

```tsx
<View style={styles.heroCard}>...</View>
...
<TouchableOpacity
  style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
  onPress={handleStartOnboarding}
  disabled={busy}
  accessibilityRole="button"
  accessibilityLabel={connected ? 'Continue Stripe onboarding' : 'Start Stripe onboarding'}
>
```

The ED.5/D6B builder brief explicitly required the Stripe Connect screen to replace its static placeholder/connected state with `StripeConnectCard` and the package-creation screen to drop `PermanenceMarker` next to package/price saved affordances. That did not happen in the merge commit and still has not happened on current main.

Severity remains P2 because the feature flag is OFF and there is no production regression. It is still rollout-blocking: the named Stripe flip and permanence markers cannot be validated on-device, cannot be E2E-tested, and cannot ship because they have no production route.

**Recommended fix:** Wire `StripeConnectCard` into the Stripe Connect flow with `connected` derived from server-authoritative connect status (`ConnectStatusResponse` or equivalent) and `onConnect` invoking the existing onboarding-link flow. Wire `PermanenceMarker kind="packageSaved"` and `kind="priceSaved"` into the package/pricing saved rows. Gate every host mount with `featureFlags.romanOnboardingPolish` and add static flag-off pins for the new hosts.

### F2 (P2) — `StripeConnectCard` Connect CTA still has no guaranteed Android 48dp target

**File:** `src/components/onboarding/StripeConnectCard.tsx:109-120,281-287`

```tsx
<HapticPressable
  intent="medium"
  onPress={onConnect}
  accessibilityRole="button"
  accessibilityLabel="Connect Stripe"
  testID={testID ? `${testID}-connect` : undefined}
  style={[styles.cta, { backgroundColor: colors.accent }]}
>
  <Text style={[styles.ctaLabel, { color: colors.textOnAccent }]}>Connect Stripe</Text>
</HapticPressable>

cta: {
  marginTop: 8,
  paddingVertical: 14,
  paddingHorizontal: 28,
  borderRadius: 2,
  alignItems: 'center',
},
ctaLabel: {
  fontSize: 16,
  fontWeight: '500',
},
```

The CTA still relies on platform-dependent text line height: roughly `14 + 19/20 + 14 = 47–48dp`. There is no `minHeight: 48`, no `justifyContent: 'center'`, and no `hitSlop`, so Android 48dp compliance remains borderline/failing on line-height rounding.

**Recommended fix:** Add `minHeight: 48` and `justifyContent: 'center'` to `styles.cta`, or add equivalent `hitSlop` that guarantees a 48dp touch rectangle.

### F3 (P3) — Pre-existing `romanPRDetected` identical-branch conditional remains

**File:** `src/lib/roman/copy.ts` (pre-existing from PR #242; still present after PR #252)

The original PR #252 audit carried forward a pre-existing P3: `romanPRDetected` uses a ternary whose branches both call `String(weight)`. This is not introduced by PR #252, but it remains in current main.

**Recommended fix:** Remove the ternary and call `String(weight)` directly, or replace it with a real formatting distinction if fractional weight needs special handling.

## 6. What's correctly implemented — do not regress

- `EXPO_PUBLIC_FF_ROMAN_ONBOARDING_POLISH` remains default-OFF with literal `false`.
- `StepTransitionView` remains wired into the shared onboarding layout and the four direct onboarding hosts audited in the original PR.
- `onboardingPolishFlagOff.test.tsx` still pins StepTransitionView host gating and disabled behavior for the two dead components.
- Reanimated posture remains correct in the components: shared values, animated styles, no `runOnJS`, and reduce-motion instant swaps.
- `StripeConnectCard` itself remains stateless; no local write-only MMKV gate exists inside the component.
- `PermanenceMarker` remains presentational and owns no persistence; the host will need to supply the saved state.
- No telemetry registry names were added without emit sites.

## 7. R0/R72/R74/R77/R79/R81/R82 summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned patterns | **PASS** | Added production lines in the merge diff are clean. |
| R72 exhaustive | **PASS** | Merge diff, current main, post-merge file history, expected hosts, and prior findings were swept. |
| R74 / assistant attribution | **PASS for assistant-attribution** | No assistant/model co-author trailer; only Bradley human co-author trailer. |
| R77 read-only | **PASS** | Repository inspection was read-only; only audit output/evidence files were written. |
| R79 pins | **PARTIAL** | Existing flag-off pin covers StepTransitionView and disabled component behavior; new host pins cannot exist until host wiring exists. |
| R81 gate | **FAIL / post-merge debt** | The PR merged with P2/P3 findings and remains non-clean. |
| R82 tracking | **OPEN RISK** | GitHub issue search for `StripeConnectCard`, `PermanenceMarker`, and `R81-backfill tracking mobile` returned no tracking issue; if the wiring is not immediately fixed, a tracking issue is required. |

## 8. Hectacorn bar

Would Apple/Notion/Google ship the current post-merge state? No. The motion components themselves are strong, but two of the named deliverables are unreachable from the app, and the primary CTA still lacks a hard accessibility floor. This is a polished component library entry, not a shippable feature slice.

## 9. Required follow-up

1. **P2 — F1:** Apply the D6B host wiring: mount `StripeConnectCard` in the Stripe Connect flow and `PermanenceMarker` in package/pricing saved rows, all gated by `featureFlags.romanOnboardingPolish`.
2. **P2 — F2:** Add `minHeight: 48` / `justifyContent: 'center'` or equivalent `hitSlop` to the Connect CTA.
3. **P3 — F3:** Clean up the pre-existing identical-branch `romanPRDetected` ternary or track it against its originating PR if out of lane.
4. Add host-level flag-off pins once wiring exists, run the R79 doctrine sweep, and re-audit to `CLEAN_NO_FINDINGS` before any flag flip.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/252`.
- Merge commit: `bad38fc0424ce1705de4043e74d84fecf316ca36`.
- Current main: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- Evidence saved:
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_PR252_git_evidence_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_PR252_diff_inventory_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR252_status_checks_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR252_D6B_search_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR252_expected_hosts_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR252_CoachConnectScreen_current_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR252_StripeConnectCard_front_excerpt_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_PR252_compliance_sweeps_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR252_merge_diff_2026-06-15.diff`
