# Builder Result — PR-HK-5a: Coach AI Insight Panel (mobile)

**Verdict: `READY_FOR_AUDIT`**

R1 BUILDER subagent. Worktree `/tmp/wt-hk5a`, branch `hk/PR-HK-5a-coach-ai-panel`, base `00f8e95`.
Target repo: `BradleyGleavePortfolio/growth-project-mobile`.

---

## Identifiers

| Field | Value |
|---|---|
| Head SHA (full) | `8b3f60a6c8e40043e7a38fdb9c909085db5f43f7` |
| Branch | `hk/PR-HK-5a-coach-ai-panel` |
| Base | `main` (worktree base commit `00f8e95`) |
| PR number | **#225** |
| PR URL | https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/225 |
| PR state | OPEN |

---

## Commit metadata proof (title-only, correct author, NO co-author trailers)

```
SHA=8b3f60a6c8e40043e7a38fdb9c909085db5f43f7
AUTHOR=Dynasia G <dynasia@trygrowthproject.com>
COMMITTER=Dynasia G <dynasia@trygrowthproject.com>
SUBJECT=PR-HK-5a: coach AI insight panel + review-and-approve sheet
BODY=[]
```

- Body is empty → no `Co-Authored-By`, no `Generated-By`, no `🤖` trailers. PASS.
- Author AND committer both `Dynasia G <dynasia@trygrowthproject.com>`. PASS.
- Single commit. PASS.

---

## Gate results — ALL PASS

| Gate | Result | Exit |
|---|---|---|
| `tsc --noEmit` | 0 errors | `0` |
| `eslint` (10 touched files) | 0 errors / 0 warnings | `0` |
| `jest` new suites | 28/28 pass | `0` |
| `jest` adjacent sweep (`wearable\|recovery\|calm\|cards\|insight\|coach\|client-detail`) | **50 suites / 436 tests, all pass** | `0` |
| `expo prebuild --platform ios --no-install --clean` | Finished prebuild | `0` |
| `expo prebuild --platform android --no-install --clean` | Finished prebuild | `0` |
| Post-prebuild cleanup (`git checkout -- package.json && rm -rf ios android`) | clean tree | `0` |
| R0 ban scan (added lines) | clean (see proof below) | n/a |
| `git push origin` | new branch pushed | `0` |
| `gh pr create` | PR #225 created | `0` |

### Notes on gate output
- **Android prebuild** printed `userInterfaceStyle: Install expo-system-ui...` — this is a **pre-existing project-config notice**, not introduced by this PR, and prebuild still finished with exit 0.
- **Jest** printed `Jest did not exit one second after the test run` — benign open-handle warning from animation timers in CalmSlowReveal / Icon async loads (pre-existing in the suite, not from new code). All 436 tests passed.

---

## REGRESSION FIXED (the blocker)

The sanctioned one-line `<WearableInsightPanel>` mount in each tab calls `useCoachInsight`
(a React Query hook). The two pre-existing tab test suites render the tabs **without** a
`QueryClientProvider`, so post-mount they threw `No QueryClient set` — 4 failures:
- `HealthFitnessTab.test.tsx` ×3
- `SleepRecoveryTab.test.tsx` ×1

**Fix (most scope-respecting):** added a `jest.mock('../../../../hooks/useWearableInsight', ...)`
to **both existing tab test files** — identical to the pattern those files already use for
`jest.mock('../../../../hooks/useWearableSamples', ...)`. The mock holds the panel in its
**loading** state (`{ data: undefined, isLoading: true, isError: false }`), so the panel
renders a harmless skeleton with no `coach-insight-*` text that could collide with the
existing band/IDOR assertions. `useApproveDraft` is stubbed inert.

### Scope-tension acknowledgement (per user instruction to document)
The brief's write-set lists only the files I own. Editing the two existing tab **test** files
is technically outside that list, BUT:
1. The panel mount itself is **explicitly in-scope** ("one-line panel mount in each tab").
2. "No regressions in adjacent suites" is a **mandatory** gate.
3. The regression is pure **test-harness fallout** from a sanctioned production change —
   the fix touches only the test files' mock setup (no production logic, no assertion changes).
4. The alternative (wrapping each render in a real `QueryClientProvider`) would couple those
   unit tests to the network layer and is strictly worse than the codebase's established
   hook-mock convention.

This is judged the correct, minimal, convention-following call. No HK-3a/3b production
internals were touched beyond the one-line mount in each tab.

---

## R0 ban-scan proof (added lines only)

Modified-file added-line scan (`git diff HEAD | grep '^+' | grep banned-patterns`):
```
MODIFIED_SCAN_EXIT=1   # grep exit 1 = ZERO matches
```
New-file full-content scan for `@ts-ignore|@ts-nocheck|as any|as unknown as|coming soon`:
```
src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx:250:
  it('never renders the banned "Coming soon" string in any state', ...)
  256:  expect(queryByText(/coming soon/i)).toBeNull();
```
**Only** matches are inside a **hygiene guard test** that asserts the banned "Coming soon"
string is NEVER rendered (the literal lives in a test description + a `queryByText` regex
matcher). This is the desired R0 protection, not a violation.

- `@ts-ignore` / `@ts-nocheck` / `as any` / `as unknown as`: **0 occurrences** in any file.
- `@ts-expect-error` in source: **0** (none needed).
- No "Coming soon" production string, no silent catches, no spinner-only state.

---

## File list (10 files — 6 new, 2 new mounts, 2 test-mock fixes)

### NEW production
1. `src/api/wearableInsightsApi.ts` (239 lines) — Zod schemas mirroring backend verbatim + HTTP client.
2. `src/hooks/useWearableInsight.ts` (79 lines) — React Query v5 hooks (`useCoachInsight`, `useClientInsight`, `useApproveDraft`).
3. `src/screens/coach/client-detail/WearableInsightPanel.tsx` (~745 lines) — panel + inline `MessageDraftReviewSheet`.

### NEW tests
4. `src/api/__tests__/wearableInsightsApi.test.ts` (234 lines).
5. `src/hooks/__tests__/useWearableInsight.test.tsx` (142 lines).
6. `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx` (~262 lines, 11 tests incl. R0 hygiene).

### MODIFIED — one-line panel mounts (in-scope)
7. `src/screens/coach/client-detail/HealthFitnessTab.tsx` — import + `<WearableInsightPanel side="coach" bucket="HEALTH_FITNESS" clientId={clientId} />`.
8. `src/screens/coach/client-detail/SleepRecoveryTab.tsx` — import + `<WearableInsightPanel side="coach" bucket="SLEEP_RECOVERY" clientId={clientId} />`.

### MODIFIED — test-mock regression fixes (documented above)
9. `src/screens/coach/client-detail/__tests__/HealthFitnessTab.test.tsx` — added insight-hook mock.
10. `src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx` — added insight-hook mock.

---

## Backend-contract deviations (documented in `wearableInsightsApi.ts` header)

The backend is source of truth; deviations are mechanical mirroring choices, not shape changes:
1. **`import api from '../services/api'`** — backend reference used a named import; mobile's
   axios instance is a **default** export. Import style only; contract unchanged.
2. **`z.enum(WEARABLE_METRIC_TYPES)`** instead of `z.nativeEnum(...)` — the mobile metric/bucket
   constants are `as const` string arrays (not TS enums), so `z.enum` is the correct Zod
   constructor for the **same** string union. Validated values identical.
3. **404 → typed `not_implemented`** on `approveDraft` — the `POST /v1/wearables/insights/approve`
   endpoint does NOT exist yet (HK-6 lands it). `approveDraft` coerces ONLY a 404 (via
   `axios.isAxiosError` + status check) into `{ status: 'not_implemented' }` with calm copy
   (`APPROVAL_PENDING_MESSAGE`). ZodError is re-thrown; all non-404 errors re-thrown (no swallow).

---

## 50-Failures sweep notes
- **#5 (IDOR):** insight calls are coach-scoped by `clientId`; 403 handled, never rendered as content. Adjacent IDOR test (SleepRecoveryTab 403 → `recovery-unavailable`) still green.
- **#36 (silent failure):** hook + client never swallow; mutation propagates real errors to `onError`/error state; only 404 is the typed `not_implemented` (intentional, calm + retry CTA).
- **Schema strict mode:** `.strict()` on all response schemas; extra-key and missing-key tests pin parse failure.
- **Sanitized errors:** `sanitizeError` maps status → calm copy; raw error text never surfaced to UI.
- **Unmount cleanup:** forward-hook timer (`FORWARD_HOOK_MS`) and reduce-motion listener cleared on unmount; panel-test mounts/unmounts in a loop with no leak.
- **No fetch-loops:** `staleTime = 6h` (matches server cache); `useCoachInsight` disabled on empty `clientId`; approve invalidates the coach key ONLY on `status === 'ok'` (not on `not_implemented`).

## Mobile Design Intelligence sweep notes
- **CALM / progressive disclosure (§4.5):** panel is collapsed by default, tap-to-expand (`coach-insight-expanded`); read-more for long observations.
- **Confidence chip (§4.7):** neutral tone, **never green**; uses `CONFIDENCE_LABEL`/`CONFIDENCE_PCT` from tokens; empty state shows NO chip.
- **Closure (§4.5 step 5 / §5.3 forward hook):** post-send "Sent to {firstName}" confirmation then forward-hook refetch after `FORWARD_HOOK_MS`.
- **Tokens only:** all color/spacing/radius from `theme/tokens` + `toneForBucket`/`toneTokens`; zero hex literals in new code.
- **Reduce-motion:** `useReduceMotion` gates the fade; honored in tests (reduce-motion ON for determinism).
- **Modal pattern:** `MessageDraftReviewSheet` mirrors `ConnectProviderSheet` (scrim Pressable + inner Pressable + `accessibilityViewIsModal`).

---

## Post-run worktree state
- Working tree clean except untracked `node_modules` **symlink** (NOT gitignored in this repo, deliberately excluded from staging — committed exactly 10 files via explicit `git add`, never `git add -A`).
- `package.json` restored; `ios/` and `android/` removed after prebuild.
- The `gh pr create` "1 uncommitted change" warning refers to that untracked node_modules symlink only — not part of the PR.
