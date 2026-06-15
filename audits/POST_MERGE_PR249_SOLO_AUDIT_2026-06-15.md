FOLLOW_UP_REQUIRED
# Post-Merge PR #249 Solo Adversarial Re-Audit — Current `main` — 2026-06-15

## 1. Verdict / severity header

**FOLLOW_UP_REQUIRED**

Current `main` was audited at `64e2de4dd4625e20fa6b41b7678d999be53ba4fc` against PR #249 merge commit `78811c2507f6b6bfae4863038f292b99d58ffffd`. The prior paired-auditor's three findings are still present, and this solo pass found **two additional missed findings**.

Severity counts on current `main`: **P0: 0 · P1: 0 · P2: 3 · P3: 2**.

Breakdown: **prior still-present: P2: 2 · P3: 1**; **new / missed by prior auditor: P2: 1 · P3: 1**.

Recommendation: **do not treat PR #249 as R81-clean**. The feature remains flag-off, but R81 requires every P0-P3 item to be cleared, and the newly found recorder lifecycle leak must be fixed before any flag-on or native-recorder wiring.

## 2. Scope and evidence basis

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#249`.
- Merge commit: `78811c2507f6b6bfae4863038f292b99d58ffffd`.
- Parent / diff base: `ce14bbe768f16136af56c39ecdd5d57df953591a`.
- Current `main` audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- GitHub merge diff inventory was pulled with `gh api repos/BradleyGleavePortfolio/growth-project-mobile/commits/78811c25 --jq '.files'`: **29 files, +3465/−2**.
- Every touched file was read in full from current `main`, not just diff hunks.
- Evidence saved:
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR249_SOLO_GITHUB_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR249_SOLO_FULL_FILES_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR249_SOLO_SWEEP_EVIDENCE_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR249_SOLO_FOCUSED_EVIDENCE_2026-06-15.txt`

## 3. Touched-file inventory from the merge diff

| Area | Files |
|---|---|
| API client + tests | `src/api/communityVoiceApi.ts`, `src/api/communityVoiceApi.test.ts` |
| Voice components | `src/components/community/VoiceNoteComposer.tsx`, `VoiceNotePlayer.tsx`, `VoiceNoteRecordButton.tsx`, `VoiceNoteWaveform.tsx`, `VoicePrivacyCopy.tsx`, `voiceFormat.ts`, `voicePlaybackPort.ts`, `index.ts` |
| Voice component tests | `src/components/community/__tests__/VoiceNoteComposer.test.tsx`, `VoiceNotePlayer.test.tsx`, `VoiceNoteRecordButton.test.tsx`, `VoiceNoteWaveform.test.tsx`, `VoicePrivacyCopy.test.tsx`, `voiceFormat.test.ts` |
| Voice hooks + tests | `src/hooks/useVoiceFeed.ts`, `useVoiceRecorder.ts`, `useVoiceUpload.ts`, `voiceQueryKeys.ts`, `voiceRecorderPort.ts`, and matching `src/hooks/__tests__/*` voice tests |
| Navigation / screen | `src/navigation/CommunityNavigator.tsx`, `src/navigation/__tests__/communityVoiceFlagOff.test.ts`, `src/screens/community/CommunityVoiceComposerScreen.tsx`, `src/screens/community/communityNavTypes.ts` |
| Incidental out-of-lane test repair | `src/screens/coach/ed/__tests__/firstPaymentGate.test.ts` |

## 4. Prior findings re-verification

| Prior finding | Severity | Current-main status | Evidence |
|---|---:|---:|---|
| F1 — `VoiceNotePlayer` play/pause control is 36 × 36 dp with no `hitSlop` | P2 | **STILL_PRESENT** | `src/components/community/VoiceNotePlayer.tsx:142-150` still renders the toggle `HapticPressable` without `hitSlop`; `styles.control` is still `width: 36, height: 36` at `src/components/community/VoiceNotePlayer.tsx:190-196`. `HapticPressable` still forwards props to `Pressable` with no default `hitSlop` at `src/components/HapticPressable.tsx:168-178`. |
| F2 — `CommunityVoiceComposerScreen` has no dedicated screen test | P2 | **STILL_PRESENT** | There is still no `src/screens/community/__tests__/CommunityVoiceComposerScreen.test.tsx` or equivalent. Existing tests cover the composer component and static navigator gate, not the screen's `useCommunityMe`, route-param derivation, flag-off render, and `goBack` integration. |
| F3 — No mobile-side telemetry on the voice publish/playback surface | P3 | **STILL_PRESENT** | Grep across all PR #249 touched files still returns no `track(`, `AnalyticsEvents`, `PostHog`, `posthog`, `telemetry`, `FEATURE_COMMUNITY_TELEMETRY`, or `COMMUNITY_TELEMETRY_EVENTS` usage. |

## 5. New findings (missed by prior auditor)

| ID | Sev | Area | Finding |
|---|---:|---|---|
| N1 | **P2** | Recorder lifecycle / privacy / race cleanup | Active recording cleanup only clears the JS timer; it never cancels the native recorder on unmount, so navigating away mid-record can leave microphone capture running outside the screen. |
| N2 | **P3** | R74 commit identity | The squash merge commit on `main` is not authored/committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`, even though all PR head commits are. |

### N1 (P2) — Recorder unmount cleanup does not cancel native capture

**Files:** `src/hooks/useVoiceRecorder.ts:99-108,145-187`; `src/components/community/VoiceNoteComposer.tsx:261-272`; tests in `src/hooks/__tests__/useVoiceRecorder.test.tsx`.

The hook explicitly exposes a `recorder.cancel()` capability and has a `cancel()` method that calls it, but the unmount cleanup registered by the hook only calls `clearTick`:

```ts
const clearTick = useCallback(() => {
  if (tickRef.current !== null) {
    clearInterval(tickRef.current);
    tickRef.current = null;
  }
  startedAtRef.current = null;
}, []);

// Always clear the interval on unmount so a backgrounded composer never leaks.
useEffect(() => clearTick, [clearTick]);
```

The active-recording path starts native capture with `await recorder.start()` and then sets `status` to `recording`, while the only place that calls `recorder.cancel()` is the manually exposed `cancel()` method:

```ts
await recorder.start();
setRecording(null);
setMustOpenSettings(false);
setStatus('recording');
beginTicker();
```

```ts
const cancel = useCallback(async () => {
  clearTick();
  try {
    await recorder.cancel();
  } finally {
    setRecording(null);
    setElapsedMs(0);
    stoppingRef.current = false;
    setStatus(recorder.isAvailable ? 'idle' : 'unavailable');
  }
}, [clearTick, recorder]);
```

The composer passes only `onStart={() => void rec.start()}` and `onStop={() => void rec.stop()}` into the button, so navigation away / route removal / parent unmount has no screen-level cancellation backstop.

Why this matters: once a real native recorder adapter is registered, a user can start recording and then swipe back, navigate away, or have the flag-gated screen unmounted. React will clear the interval, but the native recorder is not told to stop or cancel. That is a privacy/resource leak on a microphone surface and a lifecycle correctness defect before flag-on. It also creates a race foothold: there is no `startingRef` / `recordingRef` guard in `start()`, so rapid repeated starts before the first `setStatus('recording')` commits can overlap; if one start succeeds and the other errors, the UI can enter `error` while capture is still active.

Current tests do not pin the required behavior: `useVoiceRecorder.test.tsx` has a manual `cancel discards and returns to idle` test, but no `unmount while recording calls recorder.cancel()` test and no duplicate-start guard test.

**Recommended fix:** Track active capture in a ref (`activeCaptureRef` / `startingRef`) that is set before or immediately after a successful `recorder.start()`, cleared in `finalize`, `cancel`, and `reset`, and used by an unmount cleanup to call `void recorder.cancel()` when capture is active. Add hook tests for (1) unmount while recording calls `recorder.cancel()` exactly once and clears the interval, and (2) two rapid `start()` calls cannot invoke `recorder.start()` twice or leave status `error` with capture active.

### N2 (P3) — R74 merge commit identity mismatch

**File / commit:** merge commit `78811c2507f6b6bfae4863038f292b99d58ffffd`.

The PR's six head commits are correctly authored and committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`, but the actual squash commit now on `main` is not:

```text
sha=78811c2507f6b6bfae4863038f292b99d58ffffd
author=BradleyGleavePortfolio <bradleyapple1031@gmail.com>
committer=GitHub <noreply@github.com>
subject=feat(community): v3-3 voice notes (mobile) — FEATURE_COMMUNITY_VOICE_NOTES off (#249)
```

This violates the R74 requirement that every committed artifact use `Bradley Gleave <bradley@bradleytgpcoaching.com>` as author and committer, and the prior paired audit only checked assistant/co-author trailer text rather than the actual squash-commit author/committer identity.

Severity is P3 because this is not a runtime or code correctness defect and no AI author/trailer is present, but it is still a durable-history hygiene violation under the rule set and should be corrected in the merge process for future PRs.

**Recommended fix:** For future squash merges, verify the resulting commit metadata, not only PR head commits and trailers. If GitHub UI merge cannot preserve the required committer identity, use an operator-controlled local squash/merge path or repository setting that produces `Bradley Gleave <bradley@bradleytgpcoaching.com>` author/committer metadata.

## 6. Ruled-out paths / no additional missed findings found

- **Touch targets:** The player toggle remains the known failing 36 × 36 dp control. The composer permission action, re-record action, send action, and record button use `minHeight: 48` or `minHeight: 56`; no second undersized interactive element was found in PR #249 files.
- **Accessibility labels / roles / hints:** Voice record, send/re-record, permission recovery, privacy copy, and waveform hiding remain labelled or intentionally decorative. No additional screen-reader label defect was found beyond the known player touch-target issue.
- **Flag-off pins:** The navigator static pin remains present and the flag still defaults false. The missing render-level screen test is already covered by prior F2.
- **Telemetry:** No registry/emit mismatch exists because the mobile side has no voice telemetry at all; this remains prior F3, not a separate new mismatch.
- **AsyncStorage / state leaks:** No production voice file imports AsyncStorage. The only touched AsyncStorage surface is the test-only `firstPaymentGate.test.ts` default import repair.
- **Type unsafety:** No production `as any`, `as unknown as`, or `any[]` was found in the PR #249 production files. The remaining casts are typed test/mock seams or `as const` style type narrowing.
- **i18n / strings:** User-facing strings are hardcoded, but this matches the current repo pattern for these mobile screens; no separate i18n infrastructure contract was found to enforce as a PR #249-specific finding.
- **Perf:** Waveform bar rendering is fixed-count and memoized; feed reads are cursor-bounded. No additional measured perf defect was found in the touched files.
- **R72/R77 scope:** The ED `firstPaymentGate.test.ts` change is outside the voice-note lane and should have been scrutinized, but it is test-only, was explicitly disclosed in the original audit scope, and no current regression was found in that file. It is therefore recorded as a scope note, not counted as an additional P0-P3 code defect.

## 7. Rules check summary

| Rule | Status | Evidence / notes |
|---|---:|---|
| R0 banned patterns | **PASS** | No hits in touched files for `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, `as any`, `TODO`/`FIXME`/`XXX`, or banned heavy font weights. |
| R72 exhaustive audit | **PASS** | All 29 touched files from the GitHub merge diff were read in full from current `main`; new finding N1 came from reading lifecycle context outside the visible diff hunk. |
| R74 commit identity | **FAIL / N2** | PR head commits are R74-clean, but the squash merge commit on `main` is authored as `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` and committed by `GitHub <noreply@github.com>`. |
| R77 lane scope | **NOTE** | The PR included an out-of-lane ED test repair. No current defect was found there, but future voice work should not carry unrelated ED fixes without explicit operator authorization. |
| R79 regression pins | **FAIL** | Prior F2 still leaves the screen integration unpinned, and N1 shows the recorder lifecycle lacks unmount / duplicate-start regression tests. Snapshot/static pins do not cover either behavior. |
| R81 auditor gate | **FAIL** | Current `main` has non-zero P2/P3 findings: prior F1/F2/F3 plus new N1/N2. |
| R82 tracking discipline | **PASS for this audit posture** | No descoped work is being accepted as deferred here; the unresolved items are active R81 follow-up requirements. If any owner decides not to fix N1/F1/F2/F3 before flag-on, a GitHub tracking issue is required before that turn ends. |

## 8. Recommendation

**FOLLOW_UP_REQUIRED.** Fix prior F1/F2/F3 and new N1 before considering the voice-note surface ready for flag-on or native-adapter wiring. Treat N2 as a merge-process correction for subsequent PRs; do not repeat the trailer-only R74 check, because it missed the actual squash-commit identity.

