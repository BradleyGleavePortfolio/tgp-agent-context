PASS_WITH_FINDINGS
# Post-Merge PR #250 Audit — R81 Re-Audit — 2026-06-15

## 1. Verdict

**PASS_WITH_FINDINGS — NOT R81-CLEAN**

PR #250 remains safe behind `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL` default-OFF, but the post-merge re-audit found the prior non-clean findings still present on current `origin/main` (`64e2de4dd4625e20fa6b41b7678d999be53ba4fc`). P0: 0 · P1: 0 · P2: 2 · P3: 2.

R81 status: the merge is already in `main`, but this PR was not clean at merge and is still not clean. The required next action is a follow-up fixer PR that clears every P2/P3 below, then a fresh R81 re-audit to `CLEAN_NO_FINDINGS`.

## 2. Scope

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#250`.
- Merge commit audited: `18764542f55c0b39747bbbd78928af6caadc3d45`.
- Current main audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- Merge diff swept: `bdc6d96b7fcbabe568032ac0ddce5510d334e8a8..18764542f55c0b39747bbbd78928af6caadc3d45` — 7 files, +433/−2.
- Current-main status swept for every prior finding plus touch targets, telemetry, flag-off pins, accessibility, backend-contract consumption, and post-merge file history.

## 3. Charge-by-charge verification table

| Charge | Result | Evidence |
|---|---:|---|
| Flag default OFF | **PASS** | `src/config/featureFlags.ts:342` still uses `romanCompetencePill: readFlag('EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL', false)`. |
| Flag-off static pins | **FAIL — STILL_PRESENT P2** | Current-main grep found no test reference to `romanCompetencePill`; only production references in `featureFlags`, `HabitsScreen`, and `MessagesScreen` remain. |
| `HabitsScreen` raw row extraction | **FAIL — STILL_PRESENT P2** | `HabitsScreen.tsx:90-107` still casts `todayCheckInQ.data` to an anonymous row shape and consumes `row.coach_reviewed_at ?? null` without a runtime string guard. |
| Relative-time dead branch | **FAIL — STILL_PRESENT P3** | `copy.ts:569-599` still documents and returns the unreachable `earlier today` bucket. |
| Copy-unit tests for `romanCoachReview*` | **FAIL — STILL_PRESENT P3** | `src/lib/roman/__tests__/copy.test.ts` still has zero references to `romanCoachReview` or `romanCoachReviewRelative`. |
| Touch targets | **PASS / N/A** | `CompetencePill` is informational only; no `Pressable`, `Touchable`, or `HapticPressable` is introduced. |
| Accessibility | **PASS** | `CompetencePill` still exposes `accessibilityRole="text"` and `accessibilityLabel={label}`; decorative `RomanAvatar` is hidden from AT. |
| Telemetry | **PASS / no dead telemetry** | The merge diff adds no telemetry registry entry or event emit site, so there is no dead-telemetry name to reconcile. |
| R0 banned patterns | **PASS** | Added production lines in the merge diff contain no `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, or `as any`. |
| Commit trailers | **PASS for assistant-attribution** | Merge commit body contains only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`; no assistant/model trailer was present. |

## 4. Findings

| ID | Sev | Status | Area | Finding |
|---|---|---:|---|---|
| F1 | **P2** | STILL_PRESENT | Test / Flag-gate | No dedicated flag-off static pin test covers `romanCompetencePill`, the two screen render gates, or the `MessagesScreen` network-call early return. |
| F2 | **P2** | STILL_PRESENT | Type safety / Backend contract | `HabitsScreen` still reads `coach_reviewed_at` through an anonymous `as`-cast from `useQuery<unknown>` and null-coalesces it without runtime type validation. |
| F3 | **P3** | STILL_PRESENT | Dead code | `romanCoachReviewRelative` still contains the unreachable `earlier today` branch and matching misleading bucket comment. |
| F4 | **P3** | STILL_PRESENT | Test coverage | `src/lib/roman/__tests__/copy.test.ts` still has no direct coverage of `romanCoachReview` / `romanCoachReviewRelative`. |

## 5. Per-finding detail

### F1 (P2) — `romanCompetencePill` flag-off pin still missing

**Files:** `src/screens/client/HabitsScreen.tsx:377`, `src/screens/client/MessagesScreen.tsx:133,464`, `src/config/featureFlags.ts:342`

Current main still has the correct production gates:

```ts
romanCompetencePill: readFlag('EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL', false),

if (!featureFlags.romanCompetencePill) return;

{featureFlags.romanCompetencePill && checkInSaved ? (
  <CompetencePill ... />
) : null}

{featureFlags.romanCompetencePill && !noCoach ? (
  <CompetencePill ... />
) : null}
```

The missing piece is still the R79/static doctrine pin. A current-main grep for `romanCompetencePill` in test files returned no actual test coverage; the only hits are production code and component comments. A future refactor could remove the `MessagesScreen` network early return or change the default fallback away from literal `false` without a repo-global pin tripping.

**Recommended fix:** Add `romanCompetencePillFlagOff.test.ts` (or extend the relevant Roman flag-off suite) to assert: default fallback is literal `false`; `HabitsScreen` gates `CompetencePill`; `MessagesScreen` gates both the fetch and the render; and `messagesApi.coachReview` is not called with the flag forced OFF.

### F2 (P2) — `HabitsScreen` raw `coach_reviewed_at` extraction remains unguarded

**File:** `src/screens/client/HabitsScreen.tsx:90-107`

```ts
const row = todayCheckInQ.data as
  | {
      mood?: number;
      energy?: number;
      sleep_hours?: number;
      sleep_quality?: number;
      stress?: number;
      notes?: string;
      date?: string;
      coach_reviewed_at?: string | null;
    }
  | null
  | undefined;
...
setCoachReviewedAt(row.coach_reviewed_at ?? null);
```

This is still the same silent-contract gap from the prior audit. If the backend field is absent, renamed, or serialized as a non-string, the pill silently hides rather than surfacing a contract failure. The `MessagesScreen` path remains better because it consumes a typed `{ coachReviewedAt: string | null }` response from `messagesApi.coachReview`.

**Recommended fix:** Guard the field before consuming it:

```ts
const rawCoachReviewedAt = row.coach_reviewed_at;
setCoachReviewedAt(typeof rawCoachReviewedAt === 'string' ? rawCoachReviewedAt : null);
```

A stronger fix is to type `useTodayCheckIn` with a response interface that includes `coach_reviewed_at?: string | null`.

### F3 (P3) — `earlier today` branch remains unreachable

**File:** `src/lib/roman/copy.ts:569-599`

```ts
// Buckets:
//   - < 24 hours        → "{N} hour" / "{N} hours ago"
//   - same calendar day → "earlier today"
...
if (diffMs < 24 * MS_PER_HOUR && dayDiff === 0) {
  const hours = Math.floor(diffMs / MS_PER_HOUR);
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
}

if (dayDiff === 0) return 'earlier today';
```

`dayDiff === 0` means the timestamps are on the same local calendar day; any same-day interval is necessarily below 24 hours, so the prior branch consumes the reachable same-day case. The later `earlier today` return remains dead code and the comment still advertises an impossible bucket.

**Recommended fix:** Remove the `dayDiff === 0` branch and update the bucket comment to match the actual reachable behavior.

### F4 (P3) — `copy.test.ts` still does not cover the new review-copy helpers

**File:** `src/lib/roman/__tests__/copy.test.ts`

Current main still has no references to `romanCoachReview` or `romanCoachReviewRelative` in the copy-unit test suite. The component tests indirectly exercise the copy, but the exported helper and edge buckets remain unpinned at the unit level.

**Recommended fix:** Add direct tests for sub-hour, singular/plural hour, yesterday, 2–7 days, older month format, future timestamp collapse, both `surface` variants, and Roman voice doctrine.

## 6. What's correctly implemented — do not regress

- `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL` remains default-OFF with literal `false`.
- `MessagesScreen` still prevents the `/messages/coach-review` request when the flag is OFF.
- `GET /messages/coach-review` consumption still matches `{ coachReviewedAt: string | null }` and fails open to `null` on fetch errors.
- `CompetencePill` still renders `null` when `reviewedAt == null` and remains non-interactive, so there is no touch-target issue.
- Accessibility remains sound: informational text role, explicit label, decorative Roman mark hidden from AT.
- No new telemetry registry entries or emit names were added, so there is no dead telemetry table mismatch.

## 7. R0/R72/R74/R77/R79/R81/R82 summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned patterns | **PASS** | Added production lines in the merge diff are clean. |
| R72 exhaustive | **PASS** | Merge diff, current main, post-merge file history, prior findings, and relevant callsites were swept. |
| R74 / assistant attribution | **PASS for assistant-attribution** | No assistant/model co-author trailer; only Bradley human co-author trailer. |
| R77 read-only | **PASS** | Repository inspection was read-only; only audit output/evidence files were written. |
| R79 pins | **FAIL** | Missing `romanCompetencePill` flag-off pin is F1. |
| R81 gate | **FAIL / post-merge debt** | The PR merged with P2/P3 findings and remains non-clean. |
| R82 tracking | **OPEN RISK** | GitHub issue search for the unresolved `romanCompetencePill` follow-ups returned no tracking issue; if the fixer cannot close all items immediately, a tracking issue is required. |

## 8. Hectacorn bar

Would Apple/Notion/Google ship the current post-merge state? Not with the safety net as-is. The surface itself is calm, accessible, flag-off safe, and narrowly scoped, but the missing flag-off pin and raw check-in-row contract leave the rollout path below the R0/R81 bar.

## 9. Required follow-up

1. **P2 — F1:** Add the `romanCompetencePill` flag-off pin covering flag default, `HabitsScreen`, `MessagesScreen` render, and `MessagesScreen` fetch suppression.
2. **P2 — F2:** Add a runtime string guard or typed hook return for `coach_reviewed_at`.
3. **P3 — F3:** Remove the unreachable `earlier today` branch and update the bucket comment.
4. **P3 — F4:** Add direct copy-unit coverage for `romanCoachReview` and `romanCoachReviewRelative`.
5. Run the R79 doctrine sweep and a fresh R81 audit to `CLEAN_NO_FINDINGS` before any flag flip.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/250`.
- Merge commit: `18764542f55c0b39747bbbd78928af6caadc3d45`.
- Current main: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
- Evidence saved:
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_PR252_git_evidence_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_PR252_diff_inventory_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_status_checks_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_PR252_compliance_sweeps_2026-06-15.txt`
  - `/home/user/workspace/audit-work/outputs/POST_MERGE_PR250_merge_diff_2026-06-15.diff`
