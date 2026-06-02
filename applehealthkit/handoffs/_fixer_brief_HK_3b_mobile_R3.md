# HK-3b Mobile R3 Fixer Brief

**Repo:** growth-project-mobile
**PR:** #223 — `hk/PR-HK-3b-recovery-bucket`
**Current head SHA (R2 CLEAN visual / NEEDS_FIX code):** `d666219dd64c8483f5b3f9c074ceb4248678ad6f`
**Worktree:** `/tmp/wt-hk3b-rebase` (HEAD currently at 8676a64 — pull/reset to d666219d first)
**Model:** Opus 4.8
**Round:** R3 (fixer)

## Bradley R0 LAW (decacorn — every fix)
- NO "Coming soon" anywhere — not in production code, NOT in comments, NOT in test titles, NOT in test text, NOT even in negation comments like `NEVER "Coming soon"`. The string MUST NOT appear in the diff.
- NO `as any`, NO `as unknown as`, NO `@ts-ignore`, NO `@ts-nocheck`.
- NO Co-Authored-By, NO Generated-By. Title-only commits.
- Author: `Dynasia G <dynasia@trygrowthproject.com>`.

## Findings to fix

### P2 #1 — Remove all "Coming soon" / "coming soon" strings from the diff

Three current occurrences (case-insensitive):

```
src/screens/client/wearables/WearablesShell.tsx:15            (production comment)
src/screens/client/wearables/__tests__/WearablesShell.test.tsx:8    (test comment)
src/screens/client/wearables/__tests__/WearablesShell.test.tsx:109  (regex assertion: expect(screen.queryByText(/coming soon/i)).toBeNull())
```

**Fix directives:**

1. **`WearablesShell.tsx:15`** — Rewrite the comment to describe the wiring without the banned phrase. Example acceptable phrasing:
   ```
   // When the SLEEP_RECOVERY bucket is active and the user has no connections,
   // SleepRecoveryScreen renders its own connect-source prompt — no placeholder surface.
   ```

2. **`WearablesShell.test.tsx:8`** — Same: rewrite the docblock comment to drop the banned phrase. Example:
   ```
   // Verifies the recovery bucket mounts SleepRecoveryScreen directly — no placeholder surface remains.
   ```

3. **`WearablesShell.test.tsx:109`** — Delete the placeholder assertion entirely. The shell test ALREADY proves the placeholder is gone by positively asserting `RECOVERY_OVERVIEW` (or whatever testID/screen marker `SleepRecoveryScreen` renders) is mounted when bucket=SLEEP_RECOVERY. A negative assertion against a banned string is redundant. If you want belt-and-suspenders, replace with an assertion that the OLD placeholder component's testID/text is absent (use the old `RecoveryConnectSurface`'s testID/text, NOT the banned phrase).

**Verify post-fix:** `git diff origin/main..HEAD | grep -i 'coming soon'` MUST return zero lines.

### P3 #2 — Replace all `as unknown as` double-casts with typed helpers

Seven occurrences:

```
src/screens/client/wearables/__tests__/CalmSlowReveal.test.tsx:21,37,53
src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx:64,158
src/screens/client/wearables/__tests__/cards.test.tsx:31
src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx:51,79
```

**Fix directives:**

A. **`AccessibilityInfo.addEventListener` mock** (occurrences in CalmSlowReveal/SleepRecoveryScreen/cards tests):

Currently:
```ts
.mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>)
```

Replace with a typed helper at the top of EACH affected test file (or a shared fixture in `__tests__/_helpers/accessibilityMocks.ts` if 3+ files):

```ts
import { AccessibilityInfo, type EmitterSubscription } from 'react-native';

function makeAccessibilitySubscription(): EmitterSubscription {
  const sub: EmitterSubscription = {
    remove: jest.fn(),
  } as EmitterSubscription; // single, type-name-only cast — NOT `as unknown as`
  return sub;
}
```

Wait — that's still a single cast which R0 doesn't ban (only `as any`, `as unknown as`, `@ts-ignore` are banned). A single `as EmitterSubscription` is acceptable if `EmitterSubscription` has methods we don't mock. **Preferred:** construct a complete `EmitterSubscription`-shaped object with stubs for every method so NO cast is needed:

```ts
import { type EmitterSubscription } from 'react-native';

function makeAccessibilitySubscription(): EmitterSubscription {
  return {
    remove: jest.fn(),
  } satisfies Pick<EmitterSubscription, 'remove'> as EmitterSubscription;
}
```

If `EmitterSubscription` has other required methods (it doesn't in modern RN — only `remove`), use the `satisfies Pick<…>` pattern above. Then update each `.mockReturnValue(...)` call to:

```ts
.mockReturnValue(makeAccessibilitySubscription())
```

If a shared helper file is created, it goes at `src/screens/client/wearables/__tests__/_helpers/accessibilityMocks.ts` and is imported from each test.

B. **`bucketParam={'__evil__' as unknown as string}`** in `SleepRecoveryScreen.test.tsx`:

The whole point is to pass an invalid value. If the prop's TS type is `WearableMetricBucket | undefined` (a union), then `'__evil__'` doesn't satisfy it. Instead of casting, refactor: extract a helper that mirrors the screen's bucket-validation logic OR use the proper TS escape that R0 does NOT ban:

```ts
// @ts-expect-error — intentionally passing malformed bucket to verify Zod fallback
bucketParam="__evil__"
```

`@ts-expect-error` is NOT in R0's ban list (only `@ts-ignore` and `@ts-nocheck` are). And it's actively better than `as unknown as` because if the type ever widens to accept `'__evil__'`, the comment will fail and force a re-evaluation of the test.

C. **`error: { status: 403, message: 'forbidden' } as unknown as Error`** in `SleepRecoveryTab.test.tsx`:

Replace with:

```ts
const forbiddenError = Object.assign(new Error('forbidden'), { status: 403 });
// ... pass forbiddenError directly
```

This is a proper `Error` instance with a status field tacked on, no cast required.

**Verify post-fix:** `git diff origin/main..HEAD | grep -nE 'as unknown as'` MUST return zero lines.

## Acceptable cast policy (clarification)

These are allowed:
- Single-step `as TypeName` where the source object has all required fields of TypeName (no widening to unrelated types).
- `satisfies T` (does NOT widen).
- `@ts-expect-error` with a justification comment immediately after (NOT `@ts-ignore` / `@ts-nocheck`).

These are banned:
- `as any` / `as unknown` / `as unknown as T` / `as never` / `as never as T`.
- `@ts-ignore` / `@ts-nocheck`.
- `.catch(()=>undefined)` / `catch(e){}` / empty error swallows.

## Gates after fix

```bash
cd /tmp/wt-hk3b-rebase

# Pull latest HK-3b head
git fetch origin hk/PR-HK-3b-recovery-bucket
git reset --hard origin/hk/PR-HK-3b-recovery-bucket

# Apply fixes here, then:

# 1. tsc
npx tsc --noEmit 2>&1 | tee /tmp/r3_tsc.log
echo "EXIT $?"   # must be 0

# 2. Lint touched files
npx eslint --no-error-on-unmatched-pattern \
  'src/screens/client/wearables/**/*.{ts,tsx}' \
  'src/screens/coach/client-detail/**/*.{ts,tsx}' \
  '__tests__/recoveryData.test.ts' \
  2>&1 | tee /tmp/r3_lint.log
echo "EXIT $?"   # must be 0

# 3. Jest (relevant suites)
npx jest --ci --testPathPattern='(wearables|recoveryData|SleepRecovery|WearablesShell|CalmSlowReveal|cards|SleepRecoveryTab|HrvTrend)' 2>&1 | tail -60

# 4. R0 ban scan over DIFF (not full tree)
git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) ?=> ?undefined\)|catch ?\(.\) ?\{\s*\}|catch ?\(\) ?\{\s*\}' && echo "R0 VIOLATIONS — STOP" || echo "R0 BANS: CLEAN"

# 5. Commit author + body scan
git log origin/main..HEAD --pretty=format:'%an <%ae>%n%B%n---'
```

## Commit

Single fixer commit, title-only:

```bash
git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" \
  commit -am "PR-HK-3b: R3 fix - drop 'Coming soon' wording + replace 'as unknown as' double-casts with typed helpers"
git push --force-with-lease origin hk/PR-HK-3b-recovery-bucket
```

## Output

Write a result report to `/home/user/workspace/_fixer_result_HK_3b_mobile_R3.md` with:
- New head SHA (full 40-char)
- Each finding: file:line resolved + before/after snippet
- All gate exit codes
- Final `git log origin/main..HEAD --pretty=...` proof of clean author + no Co-Authored-By/Generated-By
- Final R0 ban grep proof (zero matches)

Verdict at top: `CLEAN` or `NEEDS_R4`.

## Auth & guardrails

- `api_credentials=["github"]` — do not print `$GITHUB_TOKEN`, do not run `gh auth status`.
- Git push via existing credential helper in `/tmp/mobile-clone` config (already wired).
- Stay strictly within the touch-list above. DO NOT mass-rewrite tests or add new tests beyond what's needed to keep coverage when removing redundant assertions.
- If a constraint blocks (e.g. `EmitterSubscription` has unexpected required methods in the RN version pinned), document the deviation in the result file and choose the next-strictest acceptable option.
