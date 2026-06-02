# HK-5a R2 Fixer Brief

**Target PR:** #225 — `hk/PR-HK-5a-coach-ai-panel` (growth-project-mobile)
**Base SHA (R1):** `8b3f60a6c8e40043e7a38fdb9c909085db5f43f7`
**Worktree:** `/tmp/wt-hk5a`
**Model:** Opus 4.8 (builders/fixers; Sonnet 4.6 FORBIDDEN)
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By
**Auditor verdicts:** code GPT-5.5 = NEEDS_FIX; visual Opus 4.8 = NEEDS_FIX

R0 LAW (re-state for the fixer): NO "Coming soon" literal anywhere in the diff (including test titles + regex assertions — they print to CI). NO `@ts-ignore` / `@ts-nocheck` / `as any` / `as unknown as` / empty-catch / `.catch(()=>undefined)` / spinner-only empty states. `@ts-expect-error` with justification IS allowed.

---

## Scope — fix EVERY finding below, in this order

### F1 (P1/P2) — R0 violation: "Coming soon" literal in test title + regex

- **File:** `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx`
- **Lines:** 249–260 (the `describe('R0 hygiene', ...)` block).
- **Problem:** the `it(...)` description contains the banned `"Coming soon"` string AND `queryByText(/coming soon/i)` embeds the literal phrase in regex. R0 forbids the contiguous phrase anywhere in the diff — including test source — because Jest prints `it()` titles to CI logs. Auditors flagged this; the R3 fixer for HK-3b removed the same pattern via `recoveryTestColors.ts`/`WearablesShell.test.tsx` precedent.
- **Fix:** delete this entire `describe('R0 hygiene', ...)` block. Rationale:
  1. The hygiene guard is **redundant** — every positive assertion in the rest of the file already proves the panel renders the expected non-banned copy in every state (loading/empty/error/expanded/sheet).
  2. There is no safe way to write the assertion that doesn't introduce the literal somewhere readable. Constructing it at runtime (`['Coming','soon'].join(' ')`) defeats the spirit of R0 (auditors should be able to grep the source).
  3. The HK-3b R3 precedent (committed in tgp-agent-context as `_fixer_result_HK_3b_mobile_R3.md`) deleted such guards rather than rewriting them.
- After deletion the file should still have all 11 prior tests passing; only the 1 R0 test is removed.

### F2 (P2 visual) — Warm-bucket primary CTAs fail WCAG AA (bone-on-camel = 2.70:1)

- **Files:**
  - `src/screens/coach/client-detail/WearableInsightPanel.tsx`
  - `src/screens/client/wearables/wearablesTheme.ts`
- **Problem:** "Review message" and "Approve & send" use `colors.bone` (#F5EFE4) text on `tone.accent` fill. For the warm bucket `tone.accent = colors.camel` (#B08D57) → **2.70:1**, below the 4.5:1 AA minimum for 16px/500 text. Forest/cool passes (8.57:1). `tokens.ts` itself documents `camel` as "hairline borders only" — never as a filled CTA.
- **Fix — add a new tone token `accentInk`** (the AA-safe foreground when sitting on light surfaces, AND the AA-safe fill for CTAs that need bone text):
  - In `wearablesTheme.ts`, extend `ToneTokens`:
    ```ts
    export interface ToneTokens {
      readonly accent: string;
      readonly accentInk: string;  // AA-safe vs bone (≥4.5:1); used as CTA fill + as text-on-light
      readonly tint: string;
      readonly glow: string;
      readonly track: string;
    }
    ```
  - For WARM: `accentInk: gold[700]` (which is `#8A6A2A`) → bone on #8A6A2A ≈ 5.10:1 (AA PASS). Already exists in `tokens.ts` line 56 as `warningInk` and line 126 as `gold[700]`. Import via `import { colors, gold, withAlpha } from '../../../theme/tokens'`.
  - For COOL: `accentInk: colors.forest` (#2C4A36) → already AA-safe vs bone (8.57:1) and on cream (8.06:1).
  - Update `WearableInsightPanel.tsx` to thread `toneInk` (resolved from `tone.accentInk`) and:
    - Use `toneInk` for **filled CTA backgrounds** (`reviewCta`, `primaryBtn` enabled), keeping bone text.
    - Use `toneInk` for **on-surface text/links** that are currently `tone.accent` (see F3).
  - Reserve raw `tone.accent` (`camel` warm / `forest` cool) for hairline borders, rings, icons, chip border alpha, and chart lines — its documented use.

### F3 (P2 visual) — Warm-bucket on-light text fails WCAG AA (camel-on-cream = 2.54:1)

- **File:** `src/screens/coach/client-detail/WearableInsightPanel.tsx`
- **Affected sites (current = `tone.accent` text on light):**
  - L283 `readMore` ("Read more") — `tone.accent` on card bg
  - L225 `retryText` ("Retry" in error row) — `tone.accent`
  - L483 sheet `retry` ("Retry" inside the sheet error row) — `accent` prop
  - L519–523 sheet `secondaryBtnText` ("Edit then send" when enabled) — `accent`
  - L171 success/checkmark icon — `tone.accent` (icons can stay; iconography is exempt unless functional)
- **Fix:** swap every text/link use of the raw accent to `toneInk` (from F2). Iconography may remain `tone.accent`. Confidence chip border may remain `withAlpha(tone.accent, 0.4)`.

### F4 (P2 code) — Review-sheet retry replays wrong action/body

- **File:** `src/screens/coach/client-detail/WearableInsightPanel.tsx`
- **Lines:** 477 (`<Pressable onPress={() => run(edited ? 'edit' : 'approve', body)}>`).
- **Problem:** retry hard-codes the action by current `edited` state and the current `body`. A failed `dismiss` retry becomes `approve/edit`. A failed `approve` whose body was edited between attempts switches from original → edited body silently.
- **Fix:**
  - Track last attempted payload in a ref: `const lastAttemptRef = useRef<{ action: 'approve' | 'edit' | 'dismiss'; draftBody: string } | null>(null);`
  - In `run(...)`: `lastAttemptRef.current = { action, draftBody };` at the top of the function (before `setPending(null)`).
  - In the Retry `onPress`: `if (lastAttemptRef.current) { const { action, draftBody } = lastAttemptRef.current; run(action, draftBody); }` — fall back to current `edited ? 'edit' : 'approve'` only if the ref is empty (defensive; shouldn't happen since Retry is only visible after a failed `run`).
- **Tests to add (in `WearableInsightPanel.test.tsx`, inside the `Review sheet → action errors` describe block, or a new `Retry semantics` describe):**
  1. Approve failure → user edits body → Retry replays `approve` with the ORIGINAL body (not the edited one). Assert `mockApproveDraft` called twice; second call's `draftBody` equals the original draft and `action === 'approve'`.
  2. Dismiss failure → Retry replays `dismiss` (NOT `approve`). Assert second `mockApproveDraft` call has `action === 'dismiss'`, `draftBody === ''`.
  3. Edit failure → Retry replays `edit` with the body that was sent at failure time, not a later edit.

### F5 (P2 code) — Jest hook test process hangs (`HOOK_EXIT 124`)

- **File:** `src/hooks/__tests__/useWearableInsight.test.tsx`
- **Problem:** All 4 assertions pass but Jest doesn't exit within 1s. Cause: per-test `QueryClient` created via `makeWrapper()` is never explicitly cleared — its internal timer/cache prevents Node from exiting. The required CI gate uses no `--forceExit`, so a hang fails the gate.
- **Fix:** add cleanup. Two equivalent options — pick whichever is cleanest:
  - **Option A (preferred):** track the `QueryClient` in each test and call `qc.clear()` + `qc.unmount()` in `afterEach`, OR
  - **Option B:** convert `makeWrapper()` to push the created `qc` onto a module-scope array, then in `afterEach` do `for (const qc of created) { qc.clear(); qc.unmount(); } created.length = 0;`.
- Do NOT add `--forceExit` to the Jest config — that masks real leaks.
- Verify locally with: `npx jest --testPathPattern=useWearableInsight --runInBand`; the process must print `Ran all test suites` and exit `0` within ~3s, with no "Jest did not exit one second after the test run has completed" warning.

### F6 (P3 visual) — `charCount` stone-on-bone ~2.05:1

- **File:** `src/screens/coach/client-detail/WearableInsightPanel.tsx`
- **Lines:** 463–465, 688–693.
- **Fix:** swap `color: colors.stone` → `color: colors.charcoal` in the `charCount` style. Charcoal on bone = 8.0:1 (PASS). Keep `colors.stone` only for borders/dividers/disabled affordances (its documented role).

### F7 (P3 code) — Insight React Query keys not versioned

- **File:** `src/api/wearableInsightsApi.ts`
- **Lines:** 230–236.
- **Fix:** insert a `'v1'` segment immediately after the `'wearable-insight'` root:
  ```ts
  export const INSIGHT_KEY_VERSION = 'v1' as const;
  export const insightQueryKeys = {
    coach: (clientId: string, bucket: WearableMetricBucket) =>
      ['wearable-insight', INSIGHT_KEY_VERSION, 'coach', clientId, bucket] as const,
    client: (bucket: WearableMetricBucket) =>
      ['wearable-insight', INSIGHT_KEY_VERSION, 'client', bucket] as const,
  };
  ```
- Update `useWearableInsight.ts` callers (none should be hard-coding the array — they should reuse `insightQueryKeys.*`).
- Update the hook test's assertion (which currently uses `insightQueryKeys.coach(...)`) — no change needed if it uses the helper, just confirm.

---

## OUT OF SCOPE for this fixer (do NOT touch)

- **Shared `SkeletonLoader` reduceMotion gating** (P3, pre-existing component) — file separate ticket; leave as-is.
- The "indigo→slate" spec-wording note — acceptable per visual auditor; no change required.
- Anything outside the diff (the 17 pre-existing main jest failures, etc.).

---

## R0 + R64 + R65 enforcement (ALL apply to this fixer)

1. **R0 sweep on ADDED lines only** before commit:
   ```bash
   cd /tmp/wt-hk5a
   git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+' | grep -v '^+++' \
     | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) => undefined\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
   ```
   Must return empty.

2. **Gates that MUST pass before reporting CLEAN:**
   - `npx tsc --noEmit` → exit 0
   - `npx eslint <touched files>` → exit 0
   - `npx jest --testPathPattern='(WearableInsightPanel|useWearableInsight|HealthFitnessTab|SleepRecoveryTab|wearableInsightsApi)' --runInBand` → exit 0, no "did not exit" warning
   - R0 sweep above → empty
   - `git log -1 --format='%an <%ae>%n%B'` → author exactly `Dynasia G <dynasia@trygrowthproject.com>`, body empty/title-only, NO `Co-Authored-By`, NO `Generated-By`

3. **50-Failures sweep (R65):** before reporting CLEAN, mentally walk through #5 (IDOR — verify F4 didn't change auth boundary), #12 (error leak — verify sanitizeError still wraps), #28 (race — verify the ref-based retry doesn't replay an already-in-flight request; gate on `!busy`), #32 (unmount cleanup — verify the ref is not leaked across mount/unmount; refs are per-instance so this is fine but confirm).

4. **R64:** commit the resulting SHA + a `_fixer_result_HK_5a_R2.md` to `/tmp/tgp-agent-context` within minutes of finishing.

---

## Deliverables (write to workspace + commit)

- Updated PR head (push to `hk/PR-HK-5a-coach-ai-panel`).
- `/home/user/workspace/_fixer_result_HK_5a_R2.md` — short report with:
  - new HEAD SHA (40-char)
  - gate results (tsc/eslint/jest counts + exit codes)
  - R0 scan result (must be empty)
  - per-finding F1–F7 disposition (FIXED + 1-line evidence each)
  - any deviations (don't expect any — if you find one, justify under R0)
- Single commit. Conventional title: `fix(wearables): HK-5a R2 — drop coming-soon hygiene test, AA-safe accent on warm bucket, retry-payload memory, hook test exit, versioned query keys`.

## Worktree setup hint

```bash
cd /tmp/wt-hk5a
git status                            # expect clean
git fetch origin
git log -1 --format='%H %s'           # confirm at 8b3f60a6...
# node_modules is a symlink to /tmp/wt-hk3a-mobile-r4/node_modules — already in place
ls -la node_modules | head -1
```

Begin.
