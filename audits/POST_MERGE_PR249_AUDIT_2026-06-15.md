FOLLOW_UP_REQUIRED
# Post-Merge PR #249 Audit — Current `main` Re-Audit — 2026-06-15

## 1. Verdict

**FOLLOW_UP_REQUIRED**

PR #249 is still not R81-clean on current `main` (`64e2de4dd4625e20fa6b41b7678d999be53ba4fc`). All three original findings remain present in the current file state. No additional P0/P1/P2/P3 findings were identified during the requested mobile-specific re-validation pass. Counts on current `main`: **P0: 0 · P1: 0 · P2: 2 · P3: 1 · NEW: 0**.

R81 is not satisfied because P2/P3 findings must be cleared before the feature can be considered clean. The feature remains flag-off by default and route-gated, so this is follow-up-required before flag-on / cleanup, not revert-required.

## 2. Scope and evidence basis

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#249`.
- Original merge commit audited: `78811c2507f6b6bfae4863038f292b99d58ffffd`.
- Original diff base: `ce14bbe768f16136af56c39ecdd5d57df953591a`.
- Current `main` audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc` (`feat(mwb): EW2 undo button + command stack (mobile) — EXPO_PUBLIC_FF_MWB_UNDO off (#253)`).
- Original PR #249 diff inventory: 29 files, +3465/−2.
- Later commits touching the PR #249 changed-file set: only `bdc6d96` from PR #251, and only `src/navigation/CommunityNavigator.tsx` plus `src/screens/community/communityNavTypes.ts`; none of the three finding files/surfaces were fixed.
- Evidence saved:
  - `/home/user/workspace/audit-work/outputs/post_merge_mobile_249_254_evidence_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/post_merge_mobile_touch_a11y_evidence_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/post_merge_mobile_r0_evidence_2026-06-15.txt`

## 3. Original-finding status table

| Original finding | Severity | Current-main status | Evidence |
|---|---:|---:|---|
| F1 — `VoiceNotePlayer` play/pause control is 36 × 36 dp with no `hitSlop` | P2 | **STILL_PRESENT** | `src/components/community/VoiceNotePlayer.tsx` still renders the toggle `HapticPressable` with `style={[styles.control, ...]}` and no `hitSlop`; `styles.control` is still `width: 36, height: 36`. `HapticPressable` still forwards `...rest` to `Pressable` and does not add a default hit area. |
| F2 — `CommunityVoiceComposerScreen` has no dedicated screen test | P2 | **STILL_PRESENT** | Current `main` still has no `src/screens/community/__tests__/CommunityVoiceComposerScreen.test.tsx` or equivalent voice-composer screen test. |
| F3 — No mobile-side telemetry on the voice publish/playback surface | P3 | **STILL_PRESENT** | Grep across the current PR #249 voice API/components/hooks/navigation/screen files found no `track(`, `AnalyticsEvents`, `PostHog`, `posthog`, `telemetry`, `FEATURE_COMMUNITY_TELEMETRY`, or `COMMUNITY_TELEMETRY_EVENTS` references. |
| New findings | — | **NEW: none** | The requested re-validation did not identify additional current-main findings beyond the original three. |

## 4. Per-finding re-validation

### F1 (P2) — STILL_PRESENT — Player touch target remains below 44dp iOS / 48dp Android

**Current file:** `src/components/community/VoiceNotePlayer.tsx:142-150,190-196`  
**Reference file:** `src/components/HapticPressable.tsx:168-178`

```tsx
<HapticPressable
  intent="light"
  onPress={onPress}
  disabled={disabled}
  accessibilityRole="button"
  accessibilityLabel={controlLabel}
  accessibilityState={{ disabled, busy: state === 'loading' }}
  testID="voice-player-toggle"
  style={[styles.control, { backgroundColor: controlBg }]}
>
```

```ts
control: {
  width: 36,
  height: 36,
  borderRadius: radius.pill,
  alignItems: 'center',
  justifyContent: 'center',
},
```

```tsx
<Pressable
  onPress={handlePress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  style={resolvedStyle}
  {...rest}
>
```

The touch target is still 36 × 36 dp. No `hitSlop` is passed at the call site, and `HapticPressable` still adds no default `hitSlop`. This remains below the iOS 44 × 44 and Android 48 × 48 minimums.

Other voice controls remain correctly sized: `VoiceNoteRecordButton` uses `minHeight: 56`, and the composer `secondaryAction` / `primaryAction` buttons use `minHeight: 48`. The unresolved defect is isolated to the player toggle.

**Recommended fix:** Increase the player toggle layout to at least `minWidth: 48, minHeight: 48` for cross-platform compliance, or add sufficient `hitSlop` while preserving the visual 36dp circle.

### F2 (P2) — STILL_PRESENT — Screen-specific test coverage still absent

**Current directory:** `src/screens/community/__tests__/`

Current `main` still has no dedicated test file for `CommunityVoiceComposerScreen`. The screen still owns the untested integration seams: `useCommunityMe` workspace prerequisite, defense-in-depth flag-off render, hall/cohort/DM audience derivation, `cohortId` / `conversationId` forwarding, and `onPublished={() => navigation.goBack()}`.

The static navigator flag-off test remains present and useful, but it does not render this screen or exercise the screen-specific branches.

**Recommended fix:** Add `CommunityVoiceComposerScreen.test.tsx` covering loaded workspace, pending/null workspace, flag-off render, all three audience target branches, ID forwarding, and publish → `goBack`.

### F3 (P3) — STILL_PRESENT — Mobile voice telemetry still absent

**Current files:** PR #249 voice API/components/hooks/navigation/screen set

No mobile-side telemetry emit site exists in the current voice-note surface. The current source has no `track(...)`, PostHog, analytics-event, or telemetry-gate usage in the voice PR files.

This remains P3 because the feature is still default-off and the backend publish path was separately covered in the original audit context, but under R81 it still needs to be cleared rather than deferred without tracking.

**Recommended fix:** Add mobile events behind the repo telemetry gate for composer opened, record started, record completed, publish attempted, publish succeeded, publish failed, and playback started; pin both event registration and emit sites in tests.

## 5. Requested mobile validation checklist

| Check | Result | Notes |
|---|---:|---|
| 44dp iOS / 48dp Android touch targets | **FAIL** | `VoiceNotePlayer` toggle remains 36 × 36 dp with no `hitSlop`. Other PR #249 composer/record controls meet 48dp+. |
| RN/Expo flag-off static pin tests | **PASS** | `communityVoiceFlagOff.test.ts` still statically pins route registration behind `featureFlags.communityVoiceNotes`, one ternary / one screen registration, module-scope import, ordering, and explicit false default. |
| Feature flag default-off | **PASS** | `featureFlags.communityVoiceNotes` still reads `EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES` with explicit `false` default. |
| Telemetry register + emit | **FAIL / STILL_PRESENT** | No mobile-side voice telemetry registration/emit usage exists in the PR #249 mobile files. |
| Accessibility labels | **PASS with F1 exception unrelated to label text** | Player, recorder, composer send/re-record, permission action, privacy copy, and waveform decorative hiding all have labels/roles consistent with their purpose. |
| Screen-reader hints | **PASS for non-obvious primary controls** | Record button has explicit contextual hints; privacy/waveform treatment avoids noisy AT output. No new hint-specific finding was identified beyond the original player touch-target gap. |
| No synchronous storage in render | **PASS** | No storage API use exists in the PR #249 voice production files. |
| AsyncStorage scoping | **PASS** | The only AsyncStorage reference in the PR #249 changed-file set is the test-only `firstPaymentGate.test.ts` import/clear setup; no production voice file imports or calls AsyncStorage. |
| R0 banned-pattern sweep | **PASS** | Current PR #249 production files have no hits for `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, `as any`, `TODO`/`FIXME`/`XXX`, or `fontWeight: '700'|'800'`. |
| R74 trailer sweep | **PASS** | The merge commit contains only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`, which is permitted in the original audit posture. |

## 6. R81/R72/R74/R77/R79/R82 compliance notes

- **R81:** FOLLOW_UP_REQUIRED because P2/P3 findings remain; R81 requires P0-P3 clean.
- **R72:** Re-audit was not limited to the three rows; current main file state, later touching commits, flag pins, telemetry, touch targets, accessibility, storage, R0, and trailers were re-checked.
- **R74:** No new code commit was created. Output file only.
- **R77:** Read-only audit posture observed; repository state was inspected, not modified.
- **R79:** Static pin tests were source-validated. They were not executed locally because the checkout has no `node_modules`; source contracts remain pinned.
- **R82:** No deferred/out-of-lane new work was discovered. The existing findings should be fixed in the R81 follow-up cycle rather than tracked as permanent deferrals.

## 7. Hectacorn bar

The voice-note surface is still not at the Apple/Google mobile accessibility bar because a core playback control remains under the platform touch-target floor. The feature-flag containment is solid, but R81 requires the undersized control, missing screen test, and absent mobile telemetry to be cleared before the surface can be considered clean.

## 8. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/249`
- Current main head audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`
- Merge commit: `78811c2507f6b6bfae4863038f292b99d58ffffd`
- Original audit input: `/home/user/workspace/audit-work/outputs/PR249_AUDIT_2026-06-14.md`
