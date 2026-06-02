# HK-5b R1 Code Audit Brief — Client AI Insight Panel

**Auditor model:** GPT-5.5
**Auditor identity:** Independent code auditor. You did NOT build this PR. R31/R32 apply: auditor ≠ builder.
**Builder model was:** Opus 4.8.
**Repo:** `growth-project-mobile`
**PR:** #226
**Head SHA (full 40-char, R55):** `8c7509eef16f569c197bd64414f7fa9b984c17be`
**Base:** `origin/main` (HK-5a squash `b83616a419c6c28c4e15d23b35fe4de2bd110625`)
**Worktree to audit in:** `/tmp/wt-hk5b-audit-r1-code` (set up FRESH — do not reuse builder worktree)
**Round:** R1 (first audit pass post-build)

## What this PR does

Adds a read-only **client-facing** AI insight panel for the wearables tab, mirroring HK-5a's coach panel but with the client schema (`observation` / `norm_comparison` / `intervention` + optional `optional_cta` deep-link) and **no approve/edit/reject affordances** (read-only — the coach approves; the client only sees the materialised result).

**Files in diff (4):**
1. `src/screens/client/wearables/ClientWearableInsightPanel.tsx` — new panel component
2. `src/screens/client/wearables/__tests__/ClientWearableInsightPanel.test.tsx` — unit tests
3. `src/screens/client/wearables/WearablesShell.tsx` — wires `aiPanelSlot` into client shell
4. `src/screens/client/wearables/__tests__/WearablesShell.test.tsx` — shell integration tests

Builder claim: 30/30 tests pass, all gates green, 837 insertions.

## Worktree setup (FRESH — R31/R32)

```bash
cd /tmp
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-mobile.git wt-hk5b-audit-r1-code 2>/dev/null || \
  (cd /tmp/mobile-clone && git fetch origin && git worktree add /tmp/wt-hk5b-audit-r1-code 8c7509eef16f569c197bd64414f7fa9b984c17be)
cd /tmp/wt-hk5b-audit-r1-code
git checkout 8c7509eef16f569c197bd64414f7fa9b984c17be
# Reuse node_modules to avoid 5min install
ln -sfn /tmp/mobile-clone/node_modules ./node_modules
git rev-parse HEAD  # MUST equal 8c7509eef16f569c197bd64414f7fa9b984c17be
```

If the SHA does not match exactly, ABORT and report.

## Mandatory training docs (read both before auditing)

1. `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — run the 50-Failures sweep (R65)
2. `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — UX/RN-specific failure modes

## R0 ban scan (DO THIS FIRST — non-negotiable)

Scan **added lines only** in the diff. Updated grep pattern (includes the new `as\s+never\s+as` finding from HK-6a):

```bash
cd /tmp/wt-hk5b-audit-r1-code
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

ANY hit (production, tests, comments, docblocks, test titles, regex assertions like `/coming soon/i`) is **P0 BLOCKER**. `@ts-expect-error <justification>` is allowed.

Also scan for spinner-only empty states: search the panel for branches that return only `<ActivityIndicator>` with no informative content — empty/loading/error states must carry a label or message.

## Code-quality checks (after R0 passes)

### 1. Schema fidelity (`ClientInsight` per backend contract)
Cross-reference against `/tmp/gpb-clone/src/wearables/insights/insight-output.schema.ts`:
- `observation` / `norm_comparison` / `intervention` — each rendered, each ≤280 char tolerated
- `optional_cta` — handled as `{label≤40, deep_link:/^tgp:\/\//} | null`. Null path renders no CTA; non-null path renders a pressable that calls `Linking.openURL(deep_link)` (or router equivalent).
- `confidence_level` — i_think / fairly_sure / confident / certain / verified. Verify the panel maps each to the correct user-visible string and percentage. Check **all five** are handled (not just a subset).
- `source_metrics` — at least one rendered when present; `is_empty=true` path renders the empty-state copy `Not enough data yet — keep syncing.` (or close paraphrase).
- `.strict()` schema — verify no extra fields are passed through that would fail a strict parse on the client.

### 2. Deep-link safety
- The CTA href is validated against `/^tgp:\/\//` BEFORE being passed to `Linking.openURL` (or equivalent). Unvalidated deep links are a P1 finding — adversary-controlled AI output could otherwise yield `javascript:` or `http(s)://attacker` URIs even though the schema regex blocks it server-side. Defense in depth.
- If the panel trusts the server regex without re-validating, that's a P2 — schema is `.strict()` so it's controlled, but log it.

### 3. Read-only invariant
The PR explicitly states "no approve/edit/reject" on the client side. Verify:
- No `onApprove` / `onEdit` / `onReject` handlers exist in `ClientWearableInsightPanel.tsx`
- No imports of `useApproveInsight` / `ReviewSheet` / `MaterialiseModal` etc. from the coach side
- No mutation hooks at all — only query hooks (`useClientInsight` or equivalent)

### 4. WearablesShell wiring
- `aiPanelSlot` prop on `WearablesShell` is the integration seam — verify the client shell renders `<ClientWearableInsightPanel/>` into this slot for buckets H&F / S&R / Recovery, and NOT for buckets that don't have insights.
- `WearablesShell.test.tsx` must cover at minimum: slot renders when bucket is supported, slot is null/absent when bucket is not.

### 5. Test coverage
- Loading state (skeleton or accessible label, NOT spinner-only)
- Empty state (`is_empty=true`)
- Error state (network / fetch error — informative label, NOT spinner-only)
- Each of the 5 confidence levels rendered correctly (at least 2 sampled is acceptable but flag if <2)
- CTA present + absent cases
- CTA tap fires `Linking.openURL` with the exact deep_link (mock & assert)
- `useClientInsight` mocking pattern matches HK-5a (per builder claim)

### 6. RN/TS specifics
- `accessibilityRole="summary"` — builder said they had to swap from `"region"` because RN doesn't type it. Verify the swap is consistent and **commented** at the call site (otherwise a future eng will "fix" it).
- Confirm no `any` / unsafe casts crept in (R0 grep already catches the common patterns; spot-check the prop types).
- Hooks rules — no conditional hook calls.
- StyleSheet — no inline objects in render hot paths if avoidable (P3 nit only).

### 7. 50-Failures sweep (R65)
Walk every category in `50_FAILURES_OF_AI_GENERATED_CODE.md`. For each, mark `N/A | PASS | FAIL` with one-line evidence. Pay extra attention to:
- #7 silent error swallowing
- #12 fake/placeholder data hardcoded
- #19 stub implementations marked done
- #22 missing edge case handling
- #31 type assertions hiding bugs
- #44 test-mocked away behavior that doesn't exist

### 8. Mobile Design Intelligence sweep
Walk every category in `MOBILE_APP_DESIGN_INTELLIGENCE.md`. Focus:
- Touch target ≥44pt for CTA
- Loading/empty/error states are informative
- Text never truncated under realistic content lengths (observation can be 280 char — does it wrap or get cut?)
- Color contrast for confidence-level badges
- Screen reader: `accessibilityLabel` set on the CTA, on the panel container, and on the confidence badge

## Gates to run

```bash
cd /tmp/wt-hk5b-audit-r1-code
npx tsc --noEmit 2>&1 | tail -30
npx eslint 'src/screens/client/wearables/**/*.{ts,tsx}' 2>&1 | tail -30
npx jest --testPathPattern='src/screens/client/wearables' --no-coverage 2>&1 | tail -50
```

All three must be green. Tests must show 30/30 (or whatever the actual count) pass with no skipped/todo cases.

## Deliverable

Write to `/home/user/workspace/_audit_HK_5b_R1_code_GPT55.md` with this exact structure:

```
# HK-5b R1 Code Audit — GPT-5.5

**Head SHA verified:** <40-char>
**Worktree:** /tmp/wt-hk5b-audit-r1-code
**Verdict:** CLEAN | NEEDS_R2 | BLOCKED

## R0 ban scan
<output of grep — must be empty or list every hit>

## P0 findings (blockers)
<list or "none">

## P1 findings (must-fix before merge)
<list or "none">

## P2 findings (should-fix)
<list>

## P3 findings (nits)
<list>

## 50-Failures sweep
<table or list>

## Mobile Design Intel sweep
<table or list>

## Gate results
- tsc: PASS/FAIL <evidence>
- eslint: PASS/FAIL <evidence>
- jest: PASS/FAIL <X/Y passing>

## Recommended R2 fixer instructions
<if NEEDS_R2 — concrete, file-and-line-level fixes>
```

Do NOT commit fixes. Audit only.
