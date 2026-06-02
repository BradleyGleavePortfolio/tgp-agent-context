# PR-FIX-2 Builder Brief — Pin scheduling tests to fixed clock

**Builder model:** Opus 4.8 (R0 law — Sonnet 4.6 FORBIDDEN)
**Repo:** `growth-project-backend`
**Branch from:** `origin/main` @ `e49ae5ae2e0320ffcc73f5719dde555452c1f86b` (R55 — full 40-char SHA)
**Branch name:** `dynasia/pr-fix-2-scheduling-clock-pin`
**Worktree path:** create fresh — `/tmp/wt-fix-2`
**Round:** R0 (new PR, single-file change)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`

---

## What this PR fixes

`test/scheduling.service.spec.ts` has 14 failing tests on main, all with the same error:

```
BadRequestException: Session start time must be at least 5 minutes in the future.
```

The tests hard-code `start_at: '2026-06-01T15:00:00Z'`. Today is 2026-06-02 — the dates have rotted past the production `SchedulingSessionLifecycleService.requestSession` validator (5-minute future-lead requirement at `src/scheduling/scheduling-session-lifecycle.service.ts:79-81`). The production code is correct; the test is bit-rotted on the calendar.

This is **independent** of the HK initiative — the rot would have hit any team on any day after 2026-06-01 15:05Z. It's bundled here because main is red and we're paying down hygiene before HK-6a merges.

PR-HK-FIX-1 (parallel) fixes the other 3 failures (WearablesModule). Together: 17 → 0 failing tests on main.

**Do NOT touch:**
- `src/wearables/**` — that's PR-HK-FIX-1
- `src/scheduling/**` — production code is correct
- Any other test file
- ANY HK-5b or HK-6a code

---

## Root cause (one-paragraph)

The test suite's pre-2026-06-01 author hard-coded `'2026-06-01T15:00:00Z'` for `start_at` because at write-time that was "tomorrow." There is no `useFakeTimers` setup. As the wall clock advanced past `2026-06-01T14:55:00Z`, every test that calls `requestSession` started failing with `SESSION_IN_PAST`. The fix is to pin the test clock to a moment when the hard-coded dates are still valid, matching the established `jest.useFakeTimers().setSystemTime(NOW)` pattern already used in this codebase (e.g. `test/transformation-scorecard.spec.ts:166`).

---

## The fix

Add fake-timer setup/teardown to the affected `describe` block in `test/scheduling.service.spec.ts`.

**Pin date:** `2026-05-31T12:00:00Z` — gives all hard-coded `2026-06-01T15:00:00Z` and `2026-06-02T15:00:00Z` dates a comfortable lead time (>24h), is in the production future-validation window, and matches the test author's clear original intent.

**Implementation pattern** (matches `test/transformation-scorecard.spec.ts:166` precedent):

```ts
describe('SchedulingService — request + state machine + audit', () => {
  // Pin the clock to a moment where the hard-coded 2026-06-01 / 2026-06-02
  // session start_at values are still in the future. Without this, the
  // production 5-minute future-lead validator (scheduling-session-lifecycle
  // .service.ts:79-81) correctly rejects every test fixture once the wall
  // clock crosses 2026-06-01T14:55:00Z. We pin instead of mutating the
  // fixtures because the tests are exercising the state machine + audit
  // contract, not the time-skew validator (which has its own coverage).
  const PINNED_NOW = new Date('2026-05-31T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(PINNED_NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // existing beforeEach body — DO NOT change
  });

  // existing tests — DO NOT change
});
```

Important nuances:
1. **`doNotFake: ['nextTick', 'setImmediate']`** — Prisma fakes and the `auditCtx` emitter use `process.nextTick` / `setImmediate` for async fan-out. Faking them deadlocks the tests. Verify with a dry run before relying on it; if `setImmediate` is unused, drop it.
2. **`beforeAll` / `afterAll`** scoping — NOT `beforeEach` / `afterEach`. The clock pin is a property of the whole describe, not each test. This also avoids the cost of re-pinning per test.
3. **Do NOT change any hard-coded date string.** The test data is intentional and assertion-checked downstream (e.g. `expect(rescheduled.start_at.toISOString()).toBe('2026-06-02T15:00:00.000Z')` at line 322). Touching them cascades into assertion changes — keep blast radius minimal.
4. **Do NOT add `setSystemTime` calls inside individual `it` blocks** unless one test legitimately needs a different clock (verify by reading the test; if it asserts on `now`-derived values like `updated_at`, that's the signal). On scan, no tests in this suite appear to need that.

---

## Other describe blocks in the file

`test/scheduling.service.spec.ts` is 392 lines and may have multiple `describe` blocks. **Check first:**

```bash
grep -nE "^describe\(" test/scheduling.service.spec.ts
```

If there are multiple `describe` blocks and only the `request + state machine + audit` one has hard-coded dates, scope the `beforeAll`/`afterAll` to that block only.

If other describes also use hard-coded `2026-06-0X` dates, apply the same `beforeAll`/`afterAll` pattern at each. Audit log expected: "Pinned N describe blocks: [list]."

---

## Bradley R0 LAW (re-read before commit)

- NO "Coming soon", NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as`, NO `as never`, NO `as never as X`, NO `.catch(() => undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- `@ts-expect-error <one-line justification>` IS allowed at narrow, unavoidable mock boundaries — but this PR should have **zero** TS escapes. It's a timer setup.

R0 grep (run from repo root before commit):

```bash
git diff origin/main -- test/scheduling.service.spec.ts | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# Expect: zero matches.
```

---

## Files in scope

1. `test/scheduling.service.spec.ts` — add `beforeAll`/`afterAll` clock pin to the affected describe block(s)

**Do NOT touch:**
- `src/scheduling/**` — production code is correct
- `src/wearables/**` — that's PR-HK-FIX-1
- Any other test or src file
- ANY other test fixture or hard-coded date string

---

## Verification checklist (you must run every one and paste output in result file)

### 1. Lint + typecheck
```bash
cd /tmp/wt-fix-2
npm run lint -- --max-warnings=0 test/scheduling.service.spec.ts
npx tsc --noEmit
```
Expect: zero errors.

### 2. Scheduling suite now passes

```bash
npx jest test/scheduling.service.spec.ts --runInBand 2>&1 | tail -30
```

Expect:
- `Tests:` line shows **0 failed**, all previously-failing 14 tests pass
- The string `SESSION_IN_PAST` no longer appears
- The string `Session start time must be at least 5 minutes in the future` no longer appears

### 3. No regressions in adjacent suites

```bash
npx jest test/scheduling --runInBand 2>&1 | tail -20
# Also run any test that imports scheduling-session-lifecycle
grep -rln "scheduling-session-lifecycle" test/ | head -5
# Run them
npx jest <each-file> --runInBand
```

Expect: no new failures introduced.

### 4. Confirm WearablesModule failures are still red the same way (sanity — that's PR-HK-FIX-1's job)

```bash
npx jest test/module-graph.spec.ts test/openapi-spec.spec.ts test/roles-enforced.spec.ts --runInBand 2>&1 | grep -E "Tests:|WearablesModule" | head -5
```
Expect: still red, still complaining about `WearablesModule`. This proves PR-HK-FIX-1 is needed and we have not regressed it.

### 5. Full backend suite delta (count failures before/after)

```bash
npx jest --listFailingTests 2>&1 | tail -10
# Expect total failing tests: 3 (down from 17). WearablesModule owns all 3 remaining.
```

### 6. R55 — record the SHA you branched from

In `_builder_result_FIX_2.md` paste the output of:
```bash
git log -1 --format='%H %s' origin/main
git log -1 --format='%H %s' HEAD
```

### 7. Confirm `process.nextTick`/`setImmediate` exclusion is necessary

Run with and without `doNotFake`:
```bash
# With (default in brief):
npx jest test/scheduling.service.spec.ts --runInBand --testTimeout=15000

# Quick A/B — remove doNotFake locally and re-run; if tests still pass, simplify the brief's setup
```
Document the result in the builder result file. If `doNotFake` is unnecessary, simplify the change.

---

## Commit message

```
fix(scheduling-test): pin clock with jest.useFakeTimers so hard-coded fixtures don't rot

test/scheduling.service.spec.ts hard-codes start_at: '2026-06-01T15:00:00Z'
across 14 cases. Once the wall clock crossed 2026-06-01T14:55:00Z the
production 5-minute future-lead validator
(scheduling-session-lifecycle.service.ts:79-81) correctly began rejecting
every fixture with SESSION_IN_PAST.

Pin the clock to 2026-05-31T12:00:00Z in beforeAll/afterAll using the
project's established jest.useFakeTimers + setSystemTime pattern
(precedent: test/transformation-scorecard.spec.ts:166). No fixture dates
or assertions change — only the clock the validator sees.

Brings main backend Jest from 17 failing tests to 3. PR-HK-FIX-1 (parallel)
addresses the remaining 3 (WearablesModule re-export).
```

Title: `fix(scheduling-test): pin clock with jest.useFakeTimers so hard-coded fixtures don't rot`
NO `Co-Authored-By`, NO `Generated-By`.

---

## PR description (paste into `gh pr create --body`)

```
## What

Pins the clock in `test/scheduling.service.spec.ts` to `2026-05-31T12:00:00Z`
via `jest.useFakeTimers` + `setSystemTime` so hard-coded `2026-06-01` /
`2026-06-02` session fixtures stay in the future and don't rot.

## Why

Main CI shows 14 scheduling test failures, all with:
> `BadRequestException: Session start time must be at least 5 minutes in the future.`

The production validator (`scheduling-session-lifecycle.service.ts:79-81`)
is correct. The test fixtures were written when `2026-06-01T15:00Z` was
"tomorrow." Today is 2026-06-02, so the dates rotted past validation.

This is independent of HK work — would have hit any team on any post-2026-06-01
day. Bundled with HK-FIX-1 because we're paying down main-CI hygiene before
HK-6a merges.

## Approach

Follows the project's existing pattern (precedent: `test/transformation-scorecard.spec.ts:166`):
- `beforeAll`: `jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }); jest.setSystemTime(PINNED_NOW)`
- `afterAll`: `jest.useRealTimers()`
- **Zero changes** to fixtures or assertions — only the clock the validator sees.

## Verification

- `npx jest test/scheduling.service.spec.ts` — all green (14 tests recovered)
- `npx jest --listFailingTests` — 17 → 3 (PR-HK-FIX-1 covers the remaining 3)
- `npm run lint`, `npx tsc --noEmit` clean
- R0 grep zero matches

## Risk

Minimal. Test-file-only change, no production code touched. Follows the
established `useFakeTimers` pattern already used in 5 other test files.

## Out of scope

- `src/wearables/**` — that's PR-HK-FIX-1
- Production scheduling code — already correct
- Other test files with potentially-rotting hard-coded dates — to be audited
  separately as a hygiene sweep
```

---

## Workflow

1. Create worktree fresh from main:
   ```bash
   cd /tmp/gpb-clone
   git fetch origin main
   git worktree add -b dynasia/pr-fix-2-scheduling-clock-pin /tmp/wt-fix-2 origin/main
   cd /tmp/wt-fix-2
   ls -la node_modules 2>/dev/null | head -3   # confirm node_modules symlink/install
   ```

2. Inspect file structure:
   ```bash
   grep -nE "^describe\(" test/scheduling.service.spec.ts
   ```
   Determine which describe block(s) need the clock pin.

3. Add `beforeAll` / `afterAll` clock-pin block(s).

4. Run all 7 verification gates above. Capture output.

5. Configure local git identity:
   ```bash
   git config user.name "Dynasia G"
   git config user.email "dynasia@trygrowthproject.com"
   ```

6. Commit + push:
   ```bash
   git add -A
   git commit -m "fix(scheduling-test): pin clock with jest.useFakeTimers so hard-coded fixtures don't rot" \
              -m "<full body from above>"
   git push origin dynasia/pr-fix-2-scheduling-clock-pin
   ```

7. Open PR:
   ```bash
   gh pr create --repo BradleyGleavePortfolio/growth-project-backend \
                --base main \
                --head dynasia/pr-fix-2-scheduling-clock-pin \
                --title "fix(scheduling-test): pin clock with jest.useFakeTimers so hard-coded fixtures don't rot" \
                --body-file /tmp/wt-fix-2/_pr_body.md
   ```

8. Write `_builder_result_FIX_2.md` to `/home/user/workspace/` containing:
   - PR URL
   - PR number
   - Head SHA (full 40-char)
   - All 7 verification gate outputs
   - R0 grep output (should be zero)
   - Confirmation that WearablesModule is still red the same way (sanity check)
   - List of describe blocks pinned

9. **Do NOT merge.** Audit follows (GPT-5.5, fresh instance, R31/R32).

---

## Acceptance criteria

- [ ] Diff touches **only** `test/scheduling.service.spec.ts`
- [ ] All 14 previously-failing scheduling tests pass
- [ ] No fixture dates or assertions modified
- [ ] All 7 verification gates pass
- [ ] R0 grep zero matches in diff
- [ ] PR opened, CI run started
- [ ] Result file written to `/home/user/workspace/_builder_result_FIX_2.md`
