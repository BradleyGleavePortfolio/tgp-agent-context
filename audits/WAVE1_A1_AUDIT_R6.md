# WAVE1 A1 Re-audit R6 — Daily AI Token Quota

Auditor: Dynasia G (independent adversarial auditor; did not write the code)

## Fixed SHA / worktree verification

- Worktree audited: `/home/user/workspace/wt-a1-quota`
- Required detached HEAD: `224f0955a8b9b14dd362d4046e85ddd07f2a88f9`
- Verified `git -C /home/user/workspace/wt-a1-quota rev-parse HEAD`:
  ```text
  224f0955a8b9b14dd362d4046e85ddd07f2a88f9
  ```

## Write-set vs backend origin/main c909c188f0938c723b77c42b1fd128d228b5257a

Command: `git -C /home/user/workspace/wt-a1-quota diff --name-only c909c188f0938c723b77c42b1fd128d228b5257a..224f0955a8b9b14dd362d4046e85ddd07f2a88f9`

```text
src/ai/ai.dto.ts
src/ai/ai.service.ts
test/ai.service.spec.ts
test/ai/ai-gateway-hardening.spec.ts
test/analytics-instrumentation.spec.ts
```

No unexpected files in the write-set.

## Fixer diff ef579dd..224f095

Confirmed wording/comment/test-title only. No constant value, threshold, branch, timing, provider option, DB mutation, or behavioral assertion changed.

Summary:

```text
src/ai/ai.service.ts    | 129 ++++++++++++++++++++++++++----------------------
test/ai.service.spec.ts |  52 ++++++++++---------
2 files changed, 98 insertions(+), 83 deletions(-)
```

Programmatic check over `git diff --unified=0 ef579dd..224f095 -- src/ai/ai.service.ts test/ai.service.spec.ts` found:

```text
NO_NON_COMMENT_OR_TEST_TITLE_LINES
```

Key wording-only changes reviewed:

```diff
-    // proven worst-case TOTAL-token upper bound before any model call.
+    // best-effort worst-case TOTAL-token estimate before any model call.

-    // A1 (P1) — enforce the per-user DAILY token quota as a HARD pre-spend
-    // total-token bound BEFORE we call any model. reserveDailyTokens enforces:
+    // A1 (P1) — apply the per-user DAILY token quota as a bounded best-effort
+    // pre-spend gate BEFORE we call any model. reserveDailyTokens enforces:

-  // enforcing the DAILY_TOKEN_QUOTA as a TRUE HARD PRE-SPEND total-token bound.
+  // applying the DAILY_TOKEN_QUOTA as a bounded best-effort PRE-SPEND gate.

-  // `cost` is the PROVEN WORST-CASE total for the call (enforced input ceiling +
-  // hard output cap), so reserving it guarantees the real provider total can
-  // never exceed what was reserved. The cap is a HARD pre-call gate in three
-  // layers:
+  // `cost` is the BEST-EFFORT worst-case estimate for the call (enforced
+  // input-char clamp + hard output cap). It is a heuristic estimate, not a
+  // provable upper bound on the real provider total (see the ACCEPTED-LIMITATION
+  // note above: CJK / emoji / base64 and the uncounted system-prompt tokens can
+  // exceed it). Reserving it up front gates the spend in three layers:

-// provider receives is provably bounded, which is what lets the worst-case
-// reservation act as a true upper bound on real input tokens.
-describe('clampPromptParts (A1 hard input ceiling)', () => {
+// provider receives is bounded in CHARACTERS, which is what the worst-case
+// reservation's best-effort token estimate (chars/APPROX_CHARS_PER_TOKEN) is
+// built from. The char clamp is hard; the token estimate derived from it is
+// best-effort, not a provable bound on real input tokens.
+describe('clampPromptParts (A1 input char ceiling)', () => {
```

## Grep verification: prior over-claim vs current result

Prior blocker class from R5 was stale wording asserting a proven/true hard pre-spend upper bound. Required grep at 224f095:

Command:

```sh
grep -rniE "proven|provable|true hard|hard (upper )?bound|cannot exceed|guaranteed upper" src/ai/ai.service.ts src/ai/ai.dto.ts test/ai.service.spec.ts
```

Result reviewed; every remaining match is a negation or accepted-limitation framing, not an affirmative pre-gate hard-bound claim:

```text
src/ai/ai.service.ts:78:// fix): the chars/APPROX_CHARS_PER_TOKEN estimate is a HEURISTIC, not a provable
src/ai/ai.service.ts:90:// ratio is a best-effort heuristic, not a conservative provable bound (see the
src/ai/ai.service.ts:99:// MAX_INPUT_TOKENS only as a BEST-EFFORT heuristic (not a provable bound); the
src/ai/ai.service.ts:119:// best-effort pre-gate, not a provable hard cap; the exact post-call reconcile
src/ai/ai.service.ts:404:    // via APPROX_CHARS_PER_TOKEN, which is a BEST-EFFORT heuristic, not a provable
src/ai/ai.service.ts:429:    // The pre-gate is BOUNDED BEST-EFFORT, not a provable hard upper bound.
src/ai/ai.service.ts:431:    //      token count, NOT a provable upper bound. Inputs such as CJK text,
src/ai/ai.service.ts:670:  // provable upper bound on the real provider total (see the ACCEPTED-LIMITATION
src/ai/ai.service.ts:782:  // pre-estimate is best-effort, not a provable bound — e.g. heavy tokenization
src/ai/ai.dto.ts:28:// provable token upper bound (CJK / emoji / base64 can exceed them) and do not
test/ai.service.spec.ts:517:  // a provable bound), the reconcile clamps at the reservation (no post-spend
test/ai.service.spec.ts:628:  // is a heuristic, not a provable token upper bound, and it omits the system
test/ai.service.spec.ts:633:  // assert the pre-gate is a hard upper bound on real tokens (it is not).
test/ai.service.spec.ts:672:// best-effort, not a provable bound on real input tokens.
test/ai.service.spec.ts:691:    // a provable bound on what a real tokenizer would charge (see the
```

I also reviewed broader `hard|provable|bound` matches. Remaining affirmative `hard` references are to the provider output cap, input character ceiling, at-cap rejection behavior, or DB guarded reservation gate on the estimate; they do not claim the pre-gate is a provable/true hard upper bound on real provider tokens.

## Runtime behavior re-verification

Reviewed implementation and tests at 224f095; the previously-clean A1 behavior is intact.

- Atomic pre-spend reservation gate: `reserveDailyTokens()` upserts the day row, rejects at/over cap or if `consumed + minRequired > DAILY_TOKEN_QUOTA`, then performs a guarded `updateMany` with `tokens_used: { lte: DAILY_TOKEN_QUOTA - cost }` before incrementing `tokens_used` and `request_count` (`src/ai/ai.service.ts:697-760`).
- Provider is not called when over quota: tests assert 429 `AI_DAILY_QUOTA_EXCEEDED` and `mockCreate` not called for at-cap and insufficient-headroom cases (`test/ai.service.spec.ts:266-287`, `test/ai.service.spec.ts:491-511`, `test/ai.service.spec.ts:577-604`).
- Reconcile is decrement-only by actual usage: `reconcileDailyTokens()` computes `effectiveActual = Math.min(actual, reserved)`, `refund = reserved - effectiveActual`, returns on zero refund, and only performs `tokens_used: { decrement: refund }` (`src/ai/ai.service.ts:792-812`).
- Refund-on-failure is underflow-guarded: refund update uses `where: { user_id, quota_date, tokens_used: { gte: refund } }` before decrement (`src/ai/ai.service.ts:807-812`), and failure/refund tests keep ledger at zero (`test/ai.service.spec.ts:409-432`).
- Day key is captured as `quotaDate`: `chat()` stores the value returned by `reserveDailyTokens()` and passes that same key into `reconcileDailyTokens()` in `finally` (`src/ai/ai.service.ts:459-463`, `src/ai/ai.service.ts:590-617`); rollover test verifies day1 is reconciled and day2 remains untouched (`test/ai.service.spec.ts:440-457`).
- Empty-text-but-usage reconciles: provider usage is captured before checking response content in the Perplexity path (`src/ai/ai.service.ts:563-579`), and the test asserts empty content with 420 total tokens leaves `tokens_used = 420` (`test/ai.service.spec.ts:541-556`).
- Anthropic uses `MAX_TOKENS_PER_CALL`: branch passes `maxTokens: MAX_TOKENS_PER_CALL` (`src/ai/ai.service.ts:492-506`), and the test asserts `opts.maxTokens` equals the constant (`test/ai.service.spec.ts:718-751`).

No new P0/P1 was found: no real double-spend, no reconcile path that can increment, no unguarded refund underflow, and no read-modify-write race in the reservation gate.

## Real gates

`npm ci`: PASS

```text
added 1011 packages, and audited 1012 packages in 29s
found 0 vulnerabilities
```

`npx tsc --noEmit`: PASS

```text
(no output; exit 0)
```

`npm run lint`: PASS with warnings only

```text
✖ 17 problems (0 errors, 17 warnings)
```

`npx jest test/ai.service.spec.ts test/ai/ai-gateway-hardening.spec.ts test/analytics-instrumentation.spec.ts`: PASS, 46 tests

```text
PASS test/ai/ai-gateway-hardening.spec.ts (33.748 s)
PASS test/analytics-instrumentation.spec.ts
PASS test/ai.service.spec.ts

Test Suites: 3 passed, 3 total
Tests:       46 passed, 46 total
Snapshots:   0 total
Time:        38.477 s
```

## Findings

- None. No P0/P1/P2 findings.

## Accepted limitation note

The chars/3 heuristic and uncounted system prompt/role-framing caveats are owner-accepted/documented P2/P3 limitations and are non-blocking for this merge. I did not re-raise them as blockers.

VERDICT: CLEAN
