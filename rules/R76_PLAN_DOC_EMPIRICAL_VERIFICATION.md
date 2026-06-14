# R76 — Plan docs MUST be empirically verified before lane dispatch

**Codified:** 2026-06-14 by operator (Bradley Gleave), after L1 zod-4 lane discovered `BUMP_PLAN_ZOD_4.md` mis-judged `.uuid()` as backward-compatible when it is in fact a hard breaking change.

## Rule

Before dispatching a builder/fixer lane that depends on a plan doc (`plans/*.md`, `BUMP_PLAN_*.md`, etc.), the operator MUST empirically verify the plan's claims against the actual library/upgrade target — NOT against memory, intuition, or the library's marketing copy.

### Required empirical checks per plan doc

For ANY dependency-bump or migration plan:

1. **Pin the exact target version** in the plan (e.g. `zod@4.4.3`, not `zod@4`)
2. **Read the official migration guide** end-to-end for that exact version
3. **Run a dry-run install** in a scratch clone: `npm install zod@4.4.3 --no-save` then `npx tsc --noEmit` and `npm test` — record the actual error counts and surface in the plan
4. **List every breaking change** the dry-run surfaced, NOT just the ones you remembered or expected
5. **For each breaking change, classify:**
   - "in scope for this lane" (single owner, mechanical fix)
   - "out of scope but mechanical" (operator scope-expansion decision required)
   - "out of scope and requires lane fan-out" (multi-lane orchestration required)
6. **The plan doc MUST contain the dry-run error/test counts** as evidence. Plans that say "should be backward-compat" without dry-run evidence are non-canon and lanes MUST not dispatch from them.

## Anti-pattern (what L1 caught)

`BUMP_PLAN_ZOD_4.md` stated:
> `z.string().uuid()` — Still works in v4 but `z.uuid()` is preferred... LEAVE AS-IS in this PR. v4 keeps backward-compat.

This was wrong. zod 4 made `.uuid()` RFC 9562-strict (variant nibble `[89abAB]`), rejecting placeholder fixtures like `33333333-3333-3333-3333-333333333333`. Result: 108 tests / 18 suites failed in 7 modules — a hard breaking change the plan missed because no dry-run was performed.

The lane stalled on a legitimate scope decision the plan should have surfaced upfront.

## Operator workflow change

Add to every dependency-bump lane dispatch checklist:

```bash
# Step 1: dry-run install + record actual breakage
mkdir -p /tmp/dryrun-{lane}
cd /tmp/dryrun-{lane}
git clone https://git-agent-proxy.perplexity.ai/{org}/{repo}.git .
npm install {package}@{exact-version} --no-save
npx tsc --noEmit 2>&1 | tee /tmp/dryrun-{lane}/tsc.log
npm test 2>&1 | tee /tmp/dryrun-{lane}/test.log
grep -c "error TS" /tmp/dryrun-{lane}/tsc.log
grep -cE "FAIL|✗" /tmp/dryrun-{lane}/test.log

# Step 2: paste real counts into plan doc
# Step 3: classify each breakage as in-scope / mechanical-OOS / fan-out-OOS
# Step 4: ONLY THEN dispatch the lane
```

## Status

- Canon for all future bump/migration lanes
- `BUMP_PLAN_ZOD_4.md` needs an addendum recording the actual breakage discovered (operator follow-up commit)
- Operator must reject any plan doc that doesn't include dry-run evidence
