PASS_WITH_FINDINGS · P0:0 · P1:0 · P2:4 · P3:4
# Post-Merge PR #250 Solo Re-Audit — R81 Strict — 2026-06-15

## 1. Verdict

**PASS_WITH_FINDINGS — NOT R81-CLEAN**

PR #250 remains production-contained behind `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL` default-OFF, but current `main` is still not clean. The prior four findings are all still present, and this solo pass found four additional misses: an Android accessibility leak for the decorative Roman mark, an invalid-date path that can render `on undefined NaN`, a merge-commit R74 identity mismatch, and no tracking issue for the unresolved follow-up debt.

**Severity counts:** P0: 0 · P1: 0 · P2: 4 · P3: 4.

**Recommendation:** do not flip `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL` ON until all P2s are fixed and re-audited. The P3s should be cleared in the same fixer PR or tracked explicitly.

## 2. Scope and method

- Repo / PR: `BradleyGleavePortfolio/growth-project-mobile#250` — `Roman ED.6 — coach-reviewed competence pill (mobile)`.
- Merge commit audited: `18764542f55c0b39747bbbd78928af6caadc3d45`.
- Current main audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc` (`main...origin/main` clean after fetch).
- Full file enumeration from GitHub commit API: 7 files, +433/−2:
  - `src/components/roman/CompetencePill.tsx`
  - `src/components/roman/__tests__/CompetencePill.test.tsx`
  - `src/config/featureFlags.ts`
  - `src/lib/roman/copy.ts`
  - `src/screens/client/HabitsScreen.tsx`
  - `src/screens/client/MessagesScreen.tsx`
  - `src/services/api.ts`
- R72 posture: every touched file was read in full on current `main`; surrounding call sites, tests, feature-flag references, R0 patterns, R74 identity, R82 tracking, and prior findings were re-checked.
- CI status: GitHub reports `Typecheck, lint, test` passing for PR #250. Local focused test execution was blocked by absent local Jest binary (`sh: 1: jest: not found`), so CI is the test-execution evidence.

## 3. Prior-finding verification

| Prior ID | Sev | Status on current main | Evidence |
|---|---:|---:|---|
| F1 | P2 | **STILL_PRESENT** | `src/config/featureFlags.ts:342` still defaults false, and `HabitsScreen.tsx:377` / `MessagesScreen.tsx:133,464` remain gated, but grep found no `romanCompetencePill` test reference. |
| F2 | P2 | **STILL_PRESENT** | `HabitsScreen.tsx:90-107` still casts `todayCheckInQ.data` to an anonymous row shape and consumes `row.coach_reviewed_at ?? null` with no runtime type guard. |
| F3 | P3 | **STILL_PRESENT** | `copy.ts:569-599` still documents and returns the unreachable `earlier today` branch. |
| F4 | P3 | **STILL_PRESENT** | `src/lib/roman/__tests__/copy.test.ts` still has zero references to `romanCoachReview` / `romanCoachReviewRelative`. |

## 4. NEW findings from solo adversarial pass

| ID | Sev | Area | Finding |
|---|---:|---|---|
| N1 | **P2** | Accessibility / Android screen readers | `CompetencePill` attempts to hide the decorative `RomanAvatar`, but uses `importantForAccessibility="no"` instead of `no-hide-descendants`; the child avatar remains an accessible image on Android. |
| N2 | **P2** | Null safety / backend contract | Malformed `reviewedAt` strings flow to `romanCoachReviewRelative` with no finite-date guard and render `on undefined NaN`. |
| N3 | **P3** | R74 commit identity | The merge commit author/committer are not the canonical Bradley identity required by R74, even though the PR head commits were canonical. |
| N4 | **P3** | R82 tracking | No GitHub issue tracks the still-open P2/P3 PR #250 follow-ups. |

## 5. All findings requiring follow-up

### F1 (P2, STILL_PRESENT) — Missing flag-off static pin for `romanCompetencePill`

**Files:** `src/config/featureFlags.ts:342`, `src/screens/client/HabitsScreen.tsx:377-384`, `src/screens/client/MessagesScreen.tsx:132-140,464-471`

```ts
romanCompetencePill: readFlag('EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL', false),

if (!featureFlags.romanCompetencePill) return;

{featureFlags.romanCompetencePill && checkInSaved ? (
  <CompetencePill reviewedAt={coachReviewedAt} ... />
) : null}
```

The implementation is currently gated correctly, but there is no static or render-level pin proving the flag stays default-OFF, that `HabitsScreen` and `MessagesScreen` keep the render gates, or that `MessagesScreen` suppresses `/messages/coach-review` while dark. This is a required R79 pin gap.

**Recommended fix:** add `romanCompetencePillFlagOff.test.ts` asserting the false fallback, both render gates, and the fetch early return / no network call under flag-off.

### F2 (P2, STILL_PRESENT) — `HabitsScreen` consumes `coach_reviewed_at` through an unguarded cast

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

The new field is asserted rather than validated. A rename, absence, or non-string runtime value silently hides the pill instead of surfacing a contract failure.

**Recommended fix:** type `useTodayCheckIn` with a response interface including `coach_reviewed_at?: string | null`, and add a runtime accessor: `setCoachReviewedAt(typeof raw === 'string' ? raw : null)`.

### F3 (P3, STILL_PRESENT) — `earlier today` branch is unreachable

**File:** `src/lib/roman/copy.ts:569-603`

```ts
if (diffMs < 24 * MS_PER_HOUR && dayDiff === 0) {
  const hours = Math.floor(diffMs / MS_PER_HOUR);
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
}

if (dayDiff === 0) return 'earlier today';
```

Same-calendar-day intervals are always under 24 hours, so the first branch consumes the only reachable `dayDiff === 0` case. The later branch and its doc-comment bucket remain dead/misleading.

**Recommended fix:** remove the `earlier today` branch and update the bucket comment/test comments.

### F4 (P3, STILL_PRESENT) — `copy.test.ts` still does not cover `romanCoachReview*`

**File:** `src/lib/roman/__tests__/copy.test.ts`

The component test indirectly exercises the helpers, but the exported copy helpers are absent from the central Roman copy test suite and absent from the all-copy voice doctrine samples.

**Recommended fix:** add direct tests for all buckets, future timestamp collapse, surface variants, malformed input behavior after N2 fix, and voice doctrine.

### N1 (P2, NEW) — Decorative Roman mark is not hidden from Android accessibility

**Files:** `src/components/roman/CompetencePill.tsx:96-106`, `src/components/roman/RomanAvatar.tsx:157-160`

```tsx
<View
  testID={testID}
  accessibilityRole="text"
  accessibilityLabel={label}
  style={[styles.row, { backgroundColor: semanticColors.bgSurface }, borderStyle]}
>
  <View accessibilityElementsHidden importantForAccessibility="no">
    <RomanAvatar crop="monogram" size={MARK_SIZE} />
  </View>
  <Text style={[styles.text, { color: semanticColors.textPrimary }]}>{label}</Text>
</View>
```

`RomanAvatar` renders an accessible child image:

```tsx
<View
  testID={testID}
  accessibilityRole="image"
  accessibilityLabel={a11y}
  ...
>
```

The pill intends the monogram to be decorative because the parent already exposes the full sentence via `accessibilityLabel={label}`. `accessibilityElementsHidden` covers iOS, but `importantForAccessibility="no"` only removes that wrapper from Android focus; it does not hide descendants. Android TalkBack can still reach the child image labelled `Roman`, creating duplicate/noisy focus before or inside a simple text row.

**Severity rationale:** P2 because this is an accessibility correctness defect on a flagged user-facing surface and should be fixed before flag-on.

**Recommended fix:** change the wrapper to `importantForAccessibility="no-hide-descendants"` and keep `accessibilityElementsHidden`. Add an RNTL assertion or static pin that the decorative wrapper hides descendants.

### N2 (P2, NEW) — Malformed `reviewedAt` can render `on undefined NaN`

**File:** `src/lib/roman/copy.ts:582-603`

```ts
export function romanCoachReviewRelative(reviewedAt: string, now: Date = new Date()): string {
  const then = new Date(reviewedAt);
  const diffMs = now.getTime() - then.getTime();
  ...
  return `on ${MONTHS[then.getMonth()]} ${then.getDate()}`;
}
```

There is no `Number.isFinite(then.getTime())` guard. JavaScript invalid-date semantics drive every comparison false and fall through to the final return. A direct reproduction of this function shape returns:

```txt
romanCoachReviewRelative("not-an-iso") = on undefined NaN
```

Both production consumers source `reviewedAt` from network data (`row.coach_reviewed_at` in `HabitsScreen`, `res.data?.coachReviewedAt` in `MessagesScreen`) without ISO parse validation. A malformed string from a backend bug would produce visibly broken Roman copy rather than hiding the pill safely.

**Severity rationale:** P2 because the surface is explicitly a trust/competence signal; showing `undefined NaN` is worse than no pill and must be impossible before rollout.

**Recommended fix:** guard immediately after parsing. Either return a safe hidden state by moving parse validation into `CompetencePill` (`if (!Number.isFinite(new Date(reviewedAt).getTime())) return null`) or make `romanCoachReviewRelative` return a safe fallback (`just now`) only if product accepts that behavior. Prefer hiding the pill and adding direct tests.

### N3 (P3, NEW) — Merge commit violates R74 canonical identity

**File/commit:** merge commit `18764542f55c0b39747bbbd78928af6caadc3d45`

```txt
author BradleyGleavePortfolio <bradleyapple1031@gmail.com>
committer GitHub <noreply@github.com>
...
Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>
```

The six PR head commits are correctly authored and committed as `Bradley Gleave <bradley@bradleytgpcoaching.com>`, but the merge commit itself is not. R74 says every commit must use the canonical Bradley identity and explicitly calls out merge operations as requiring verification after GitHub creates the merge commit.

**Severity rationale:** P3 process/compliance finding. It is not a product rollback issue and there is no assistant/model attribution trailer, but the rule was active before this merge and the merge commit failed it.

**Recommended fix:** update merge procedure so squash/merge commits land with canonical author metadata, or avoid GitHub-generated merge commits that replace the canonical author. Do not rewrite history without operator direction; file/process-track the violation.

### N4 (P3, NEW) — No R82 tracking issue for unresolved PR #250 debt

**Evidence:** GitHub issue searches for `romanCompetencePill`, `CompetencePill`, `coach_reviewed_at`, `PR250`, `PR #250`, and `Roman ED.6` returned no issues.

R82 requires explicit tracking when unresolved audit debt is carried forward. The post-merge paired audit already left PR #250 with two P2s and two P3s; this solo pass adds more debt. No issue exists to track ownership, severity, or flag-on blocking status.

**Recommended fix:** either fix all P2/P3 items immediately or create a tracking issue titled clearly as a flag-on blocker for PR #250 / Roman ED.6 competence pill, linking this report and listing each finding.

## 6. Rules check

| Rule / area | Status | Notes |
|---|---:|---|
| R0 banned production patterns | **PASS** | No `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, or `as any` in PR-touched production files. |
| R0 assistant attribution | **PASS** | No assistant/model co-author trailer. Human `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>` only. |
| R72 exhaustive | **PASS** | GitHub file enumeration completed; every touched file read in full on current main. |
| R74 identity | **FAIL / N3** | PR head commits canonical; merge commit author/committer not canonical. |
| R77 read-only | **PASS** | No repository files modified; only evidence/report files written outside repo. |
| R79 pins | **FAIL / F1** | Missing flag-off pin for this flag and its fetch/render gates. |
| R81 gate | **FAIL clean gate** | P2/P3 findings remain; verdict stays `PASS_WITH_FINDINGS`, not clean. |
| R82 tracking | **FAIL / N4** | No tracking issue found for unresolved audit debt. |
| Accessibility | **FAIL / N1** | Android descendant hiding is incomplete for decorative avatar. |
| Touch targets | **PASS / N/A** | PR adds no interactive node inside `CompetencePill`; existing touchables are pre-existing. |
| Dynamic type | **PASS with caution** | Text scaling is not disabled. Fixed line heights are common in surrounding code; no PR-specific blocker beyond N1. |
| Telemetry register/emit symmetry | **PASS / N/A** | No telemetry registry entry or emit site added. |
| AsyncStorage / MMKV scoping | **PASS / N/A** | PR adds no new storage access; existing message cache is pre-existing and user-scoped. |
| Race / useEffect | **PASS with caution** | New `loadCoachReview` is gated and fails open; no P1/P2 race found beyond stale/fails-open behavior. |
| Hardcoded strings | **PASS** | Roman copy centralized in `copy.ts`; screen comments only. |
| Perf / re-render | **PASS** | New pill is pure/presentational; no layout loop or unbounded fetch introduced. |

## 7. Correctly implemented — do not regress

- `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL` remains default-OFF with literal `false`.
- `MessagesScreen` has an early return that prevents `/messages/coach-review` when the flag is OFF.
- `CompetencePill` returns `null` for `reviewedAt == null` and is non-interactive.
- Roman copy is centralized in `src/lib/roman/copy.ts` rather than screen-inlined.
- `CompetencePill.test.tsx` uses RNTL v14 `await render(...)` and covers normal time buckets through the component.
- No new animations, haptics, AsyncStorage/MMKV direct access, raw hex colors, or telemetry events are introduced.
- `messagesApi.coachReview` is a narrow `GET /messages/coach-review` client call and fails open to hidden pill on request failure.

## 8. Recommendation

1. **P2 / F1:** Add flag-off static/render pins for `romanCompetencePill` default, both render gates, and `MessagesScreen` fetch suppression.
2. **P2 / F2:** Type/guard `HabitsScreen` `coach_reviewed_at` extraction.
3. **P2 / N1:** Hide the decorative `RomanAvatar` descendants on Android with `importantForAccessibility="no-hide-descendants"`.
4. **P2 / N2:** Add invalid-date parse guard so malformed `reviewedAt` hides the pill or otherwise never renders `undefined NaN`.
5. **P3 / F3:** Remove unreachable `earlier today` branch and fix comments.
6. **P3 / F4:** Add direct `copy.ts` tests for `romanCoachReview*`.
7. **P3 / N3:** Fix/track merge-commit identity process for R74 compliance.
8. **P3 / N4:** Create a tracking issue if the fixer PR does not immediately close all findings.

## 9. Evidence saved

- `/home/user/workspace/pr250_commit_files.json` — GitHub commit API file enumeration.
- `/home/user/workspace/pr250_solo_current_main_touched_files.txt` — numbered full current-main contents of every touched file.
- `/home/user/workspace/pr250_solo_diff_and_r0.txt` — merge diff, stats, R0 sweep, trailer sweep.
- `/home/user/workspace/pr250_solo_related_grep.txt` — call-site and feature-flag references.
- `/home/user/workspace/pr250_solo_tests_sweep.txt` — test/flag coverage grep.
- `/home/user/workspace/pr250_solo_edge_evidence.txt` — N1/N2 focused evidence and invalid-date reproduction.
- `/home/user/workspace/pr250_solo_r74_identity.txt` — merge/head commit identity evidence.
- `/home/user/workspace/pr250_solo_tracking_issues.json` — R82 issue search evidence.
- `/home/user/workspace/pr250_solo_status_checks.txt` — GitHub PR check status.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/250`
- Merge commit: `18764542f55c0b39747bbbd78928af6caadc3d45`
- Current main: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`
