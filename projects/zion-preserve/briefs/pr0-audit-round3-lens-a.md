# PR #0 · Lens A Audit Brief · Round 3

You are the GPT-5.5 Lens A auditor (correctness + security) for PR #1 on `BradleyGleavePortfolio/zion-preserve`. This is **round 3** — round 2 fixer has landed.

## R11 independence (MANDATORY)

You must NOT read:
- Any builder/fixer report (round 1, 1B, or 2)
- The Lens B brief or report (any round)
- Any other auditor's prior report

You MAY read: doctrine (`AGENT_RULES.md`), the PR itself, your own prior Lens A briefs and reports (round 1 + round 2), and the fixer briefs (scope-of-fix, not model output).

## BUILD MATRIX (start-of-audit)

Verify with `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'`. Expected `d8822c774fa1e042be722c8c3833003a09a0a06b`. If drift, halt with `VERDICT: INFRA_DEATH` per R124.

```
- zion-preserve pr0/constitutional-layer HEAD (expected): d8822c774fa1e042be722c8c3833003a09a0a06b
- zion-preserve main HEAD:                                1c450ddae58b75ad86f003622824557833f4f672
- PR #:                                                   1
- PR URL:                                                 https://github.com/BradleyGleavePortfolio/zion-preserve/pull/1
- doctrine file:                                          /home/user/workspace/zion-context/AGENT_RULES.md
- prior round 2 head:                                     bd95096d05ad58510f2cb339572b6a9d5f3134f2
- prior round 2 verdict (this lens):                      FINDINGS (one P0 finding)
```

## What changed since round 2

Range: `git diff bd95096..d8822c7`. Files touched:
- `scripts/deploy-readiness.py` — regex split for `os.environ["X"]` vs `os.environ.get("X"[, default])`; `--self-test` expanded to 10 env-var forms
- `AGENT_RULES_ZION_MAPPING.md` — R74 row references issue #12; ZION-4 row references issue #13; R101 mapping trimmed/aligned
- `.github/PULL_REQUEST_TEMPLATE.md` — new R101 source-PR checks (bytecode delta, Solidity 0.8.35 pin, Hyperliquid surface, testnet-first)
- `handoffs/wave-0/dispatch-ledger.jsonl` — row #1 normalized; rows appended for Lens A r2, Lens B r2, fixer r2
- PR body — regenerated with current SHA, updated LOC, correct R13 delivery text
- GitHub issues #12 (R74 r100-test-density) and #13 (ZION-4 gas-budget) opened

## Your round-2 FINDINGS to verify

**P0 — R108 `deploy-readiness.py` false negative for `os.environ.get(...)`**

Verify:
1. Read `scripts/deploy-readiness.py`. The regex should now split `os.environ[...]` and `os.environ.get(...)` into distinct branches. Both must extract the var name.
2. Run `python scripts/deploy-readiness.py --self-test` — must exit 0.
3. Create a synthetic file with each of these lines and run `--check` from a repo scratch clone:
   - `os.environ["ZION_SYNTH_A"]`
   - `os.environ.get("ZION_SYNTH_B")`
   - `os.environ.get("ZION_SYNTH_C", "default")`
   - `os.getenv("ZION_SYNTH_D")`
   - `os.getenv("ZION_SYNTH_E", "default")`
   - `getenv("ZION_SYNTH_F")`
   - `process.env.ZION_SYNTH_G`
   - `process.env["ZION_SYNTH_H"]`
   - `import.meta.env.ZION_SYNTH_I`
   - `vm.envAddress("ZION_SYNTH_J")`
   
   Every one of these must be discovered by `--check` and cause exit 1. If any is missed, this finding is NOT resolved.
4. Confirm `--check` against the real repo (with fixture-guard active) exits 0 — no false-positive drift.

## Round-3-only new checks

- **Regression sweep of round-1 findings**: spot-check the 10 P0/P1 items you cleared in round 2 to confirm they're still resolved. Do not re-derive the full round-1 finding list; use your prior round-2 resolution table.
- **PR body integrity**: verify BUILD MATRIX in PR body matches `d8822c7`. Verify R23 EXCEPTION block has updated prod LOC (should be 303 or the current post-round-2 number). Verify R13 delivery text is correct.
- **Ledger integrity**: verify all 8 rows conform to R126 schema (`dispatch_id`, `wave`, `subagent_type`, `dispatched_at_utc`, `completed_at_utc`, `head_sha`, `expected_verdict`, `actual_verdict`, `notes`). Row #1 must be the normalized brief-upload row.
- **Issues #12 and #13**: verify they exist with expected labels and non-empty bodies.
- **CI stability**: `gh pr checks 1` — all 11 must still be green. No regressions.

## R79 50-failures sweep

Re-run the same rule sweep from round 2. Mark any regressions.

## R124 SHA-drift check (end-of-audit)

Re-run `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'` before writing your verdict. If not `d8822c774fa1e042be722c8c3833003a09a0a06b`, return `VERDICT: INFRA_DEATH`.

## Return format (R13/R16/R78)

Full report in your response message. No `gh pr review`, no commits, no pushes.

Structure:
1. BUILD MATRIX (start + end)
2. Executive summary
3. Round-2 R108 finding resolution — YES/NO with evidence (regex read + self-test result + 10-form synthetic test)
4. Round-1 regression sweep
5. New findings (P0/P1/P2/P3), if any
6. R79 50-failures sweep
7. Out-of-lens observations
8. Final line: exactly one of:
   - `VERDICT: CLEAN` — R108 finding resolved AND no round-1 regressions AND no new findings
   - `VERDICT: FINDINGS`
   - `VERDICT: REFUSAL`
   - `VERDICT: INFRA_DEATH`

**A `VERDICT: CLEAN` requires the R108 finding to be fully resolved AND zero new findings AND no round-1 regressions.**
