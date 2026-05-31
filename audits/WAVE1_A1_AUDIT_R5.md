# WAVE1 A1 Re-audit R5 — Daily AI Token Quota

Auditor: independent adversarial reviewer (R31; did not write the code)

## Scope / SHA

- Worktree: `/home/user/workspace/wt-a1-quota`
- Verified HEAD: `ef579dd8eb69729f8c9289cfeff6461031fdbf5b`
- Required fixed SHA: `ef579dd8eb69729f8c9289cfeff6461031fdbf5b`
- Backend origin/main comparison base: `c909c188f0938c723b77c42b1fd128d228b5257a`

## Write-set vs `c909c188..ef579dd`

Command:

```bash
git -C /home/user/workspace/wt-a1-quota diff --name-only c909c188f0938c723b77c42b1fd128d228b5257a..ef579dd8eb69729f8c9289cfeff6461031fdbf5b
```

Observed files exactly match expected write-set:

```text
src/ai/ai.dto.ts
src/ai/ai.service.ts
test/ai.service.spec.ts
test/ai/ai-gateway-hardening.spec.ts
test/analytics-instrumentation.spec.ts
```

Unexpected files: none.

## `3a6f9fd..ef579dd` documentation-only diff check

Command:

```bash
git -C /home/user/workspace/wt-a1-quota diff --unified=8 3a6f9fd..ef579dd
```

Confirmed no runtime behavior change in the latest R5 patch. The only non-comment code delta is the constant rename/alias with the same value and same downstream usage:

```diff
-export const CONSERVATIVE_CHARS_PER_TOKEN = 3;
+export const APPROX_CHARS_PER_TOKEN = 3;
+export const CONSERVATIVE_CHARS_PER_TOKEN = APPROX_CHARS_PER_TOKEN;
 export const MAX_INPUT_TOKENS = DAILY_TOKEN_QUOTA / 2; // 6000
 export const MAX_INPUT_CHARS = MAX_INPUT_TOKENS * CONSERVATIVE_CHARS_PER_TOKEN; // 18000
```

Confirmed DTO documentation note was added:

```diff
+// ACCEPTED-LIMITATION (A1, owner-accepted): these character caps and the
+// service-side reservation estimate (chars/APPROX_CHARS_PER_TOKEN) bound the
+// pre-spend gate only on a BEST-EFFORT basis ...
```

Confirmed the top quota docs were reworded from a claimed hard upper bound to bounded best-effort + exact post-reconcile:

```diff
-// A1 (P1) — the daily cap must be a TRUE HARD PRE-SPEND bound ...
-// by making the up-front reservation a PROVEN WORST-CASE UPPER BOUND ...
+// A1 — the daily cap bounds provider TOTAL tokens ...
+// enforced as a two-part mechanism: a BOUNDED BEST-EFFORT pre-spend reservation
+// gate, trued up by an EXACT post-call reconcile.
```

Confirmed a new test was added to assert reconcile-authoritative behavior rather than asserting a hard pre-spend upper bound:

```diff
+  it('reconcile is authoritative: daily total equals ACTUAL usage even when the pre-estimate mis-counts', async () => {
+    ... usage: { total_tokens: 42 } ... expect(overRow.tokens_used).toBe(42)
+    ... usage: { total_tokens: 5200 } ... expect(underRow.tokens_used).toBe(5200)
+  });
```

## Functional behavior re-check

Reviewed `src/ai/ai.service.ts` and targeted tests. The previously-clean runtime behavior still holds at this SHA:

- Atomic reservation gate rejects with HTTP 429 before provider spend when the cap or remaining headroom check fails (`reserveDailyTokens`, `src/ai/ai.service.ts:689-752`; tests at `test/ai.service.spec.ts:266-288`, `485-510`, `571-603`).
- Provider mock is not invoked on pre-spend over-quota rejection (`test/ai.service.spec.ts:287`, `508`, `600`).
- Reconcile/refund path is decrement-only in implementation: `effectiveActual = Math.min(actual, reserved)`, `refund = reserved - effectiveActual`, and DB decrement is guarded by `tokens_used >= refund` (`src/ai/ai.service.ts:784-803`).
- Refund-on-failure is underflow-guarded and non-fatal (`src/ai/ai.service.ts:797-808`; tests at `test/ai.service.spec.ts:403-432`).
- Day key is captured at reservation and passed to reconcile, preventing a mid-call day rollover from targeting the wrong row (`src/ai/ai.service.ts:454-458`, `650-654`, `752`, `784-788`; test at `test/ai.service.spec.ts:434-457`).
- Empty-text usage is charged when provider reports usage, and fully refunded only when no usage is reported (`src/ai/ai.service.ts:558-574`, `605-609`; tests at `test/ai.service.spec.ts:535-569`).
- Anthropic branch uses `MAX_TOKENS_PER_CALL` for output cap (`src/ai/ai.service.ts:494-498`; test at `test/ai.service.spec.ts:702-746`).

## Accepted limitation status

The product owner accepted the bounded best-effort pre-gate: `chars/APPROX_CHARS_PER_TOKEN` is a heuristic, not a provable hard token upper bound, and the pre-gate does not count system-prompt/role-framing tokens. I am not raising that accepted limitation itself as a P0/P1/P2 blocker.

However, the documentation is not yet internally consistent: new accepted-limitation text was added, but several stale comments/tests still claim the opposite hard-bound guarantee. That is the only blocker found.

## Findings

### P2 — Documentation still overstates the accepted pre-gate guarantee

The latest patch adds accurate accepted-limitation wording in several places, but leaves multiple stale comments claiming a "proven" / "true hard pre-spend" upper-bound guarantee. This directly contradicts the owner-accepted Option C model and the new docs added in the same file.

Specific stale lines:

```text
src/ai/ai.service.ts:396  // proven worst-case TOTAL-token upper bound before any model call.
src/ai/ai.service.ts:405  // input tokens are provably <= MAX_INPUT_TOKENS.
src/ai/ai.service.ts:587  // Because the reservation is a PROVEN UPPER bound ...
src/ai/ai.service.ts:657-682  // enforcing ... TRUE HARD PRE-SPEND ... PROVEN WORST-CASE ...
src/ai/ai.service.ts:755-778  // reserved is a proven UPPER bound ... cap is a hard pre-spend bound ...
test/ai.service.spec.ts:512-517  // reservation is a PROVEN UPPER bound ...
test/ai.service.spec.ts:666-668  // reservation act as a true upper bound on real input tokens.
```

Impact: readers/tests still encode the rejected guarantee that `chars/3` + character clamp is a provable token upper bound. This is a documentation/clarity defect, not a runtime P0/P1, but it violates the R5 requirement to honestly document best-effort pre-gate + authoritative reconcile without overstating a hard upper bound.

Required fix: reword or remove the stale hard-bound comments/test descriptions so all A1 docs consistently say: bounded best-effort pre-gate; output hard-capped; actual usage reconciliation authoritative; accepted caveats for char heuristic and system/role framing.

## Gates run

### `npm ci`

Result: PASS.

Snippet:

```text
added 1011 packages, and audited 1012 packages in 33s
found 0 vulnerabilities
```

Notes: npm emitted dependency deprecation warnings only; no ENOSPC.

### `npx tsc --noEmit`

Result: PASS.

Snippet:

```text
exit=0
```

### `npm run lint`

Result: PASS with warnings only.

Snippet:

```text
exit=0
✖ 17 problems (0 errors, 17 warnings)
```

### Targeted Jest

Command:

```bash
npx jest test/ai.service.spec.ts test/ai/ai-gateway-hardening.spec.ts test/analytics-instrumentation.spec.ts
```

Result: PASS.

Snippet:

```text
Test Suites: 3 passed, 3 total
Tests:       46 passed, 46 total
Snapshots:   0 total
```

A later machine-readable re-run also reported:

```text
exit=0
success= True
numTotalTestSuites= 3 numPassedTestSuites= 3
numTotalTests= 46 numPassedTests= 46
```

## Verdict

No new runtime P0/P1 was found. The R5 patch is runtime documentation/clarity-only. The owner-accepted chars/3 and system-prompt caveats are non-blocking in principle, but the current SHA still contains P2 stale documentation that overstates the guarantee as a provable/true hard pre-spend upper bound.

VERDICT: NOT-CLEAN
