# PR #0 · Fixer Brief · Round 2

You are the Opus 4.8 fixer-of-record for PR #1 of `BradleyGleavePortfolio/zion-preserve`, round 2. Round-2 dual audit returned FINDINGS (both lenses); this brief consolidates them.

## BUILD MATRIX (start-of-turn)

```
- zion-preserve pr0/constitutional-layer HEAD (start): bd95096d05ad58510f2cb339572b6a9d5f3134f2
- zion-preserve main HEAD:                             1c450ddae58b75ad86f003622824557833f4f672
- tgp-agent-context HEAD:                              (verify with git ls-remote)
- PR #:                                                1
- PR URL:                                              https://github.com/BradleyGleavePortfolio/zion-preserve/pull/1
- timestamp UTC (start):                               (record when you start)
```

Verify start SHA with `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'`. If not `bd95096d05ad58510f2cb339572b6a9d5f3134f2`, halt with INFRA_DRIFT.

## Non-negotiables

- **R3**: inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m …`. Zero AI/model/vendor tokens in any commit metadata.
- **R4**: push after every 2-3 commits.
- **R6**: foreground only.
- **R15**: you are Opus. Do all edits yourself.
- **R23**: this round should add ≤50 net prod LOC (mostly bug fixes and mapping-doc edits).
- **R124**: BUILD MATRIX at start and end.
- **R126**: append one JSONL row for THIS fixer dispatch (round 2) to the ledger as part of your commits.

## Fix scope (5 items)

### H1 · R108 deploy-readiness.py regex misses `os.environ.get("VAR")` (Lens A P0)

Current regex at `scripts/deploy-readiness.py:23-27`:

```
os\.environ(?:\.get)?\[?["']([A-Z][A-Z0-9_]+)["']
```

Bug: after `.get`, the pattern requires `[?["']` which means "optional `[` then literal `[` or `'`". So `os.environ.get("X")` (uses `(`) fails to match; only `os.environ.get["X"]` (invalid Python) or `os.environ["X"]` matches.

**Fix**: split the two forms into distinct branches. Replace the first regex line with:

```python
    r"""os\.environ\[["']([A-Z][A-Z0-9_]+)["']\]"""       # os.environ["X"]
    r"""|os\.environ\.get\(["']([A-Z][A-Z0-9_]+)["']"""   # os.environ.get("X"[, default])
```

Then update the `re.compile(...)` string block accordingly. Extend the `--self-test` fixtures to include a positive case for each of:
- `os.environ["FOO_A"]`
- `os.environ.get("FOO_B")`
- `os.environ.get("FOO_C", "default")`
- `os.getenv("FOO_D")`
- `os.getenv("FOO_E", "default")`
- `getenv("FOO_F")`
- `process.env.FOO_G`
- `process.env["FOO_H"]`
- `import.meta.env.FOO_I`
- `vm.envAddress("FOO_J")`

Each fixture line must be discovered by the script. Self-test must fail (exit non-zero) if any is missed.

Commit: `[R108] deploy-readiness.py — fix os.environ.get regex + expand self-test fixtures`.

### H2 · R74 mapping promises non-existent `ratio-check` workflow (Lens B P1)

`AGENT_RULES_ZION_MAPPING.md:477` says the test:src ratio is enforced by a `ratio-check` CI job. No such workflow exists in this PR.

**Fix**: two options. Choose option (b).

- (a) add the workflow now. **Rejected** — PR #0 has no source, so the workflow would be a no-op stub. That's exactly what round-1 auditor called out as unacceptable.
- (b) correct the mapping row. Change verdict to: "APPLIES-VERBATIM · enforcement workflow lands in first source-carrying PR (issue #12); PR #0 has zero source so the ratio is trivially satisfied." Then open issue #12 for `r100-test-density` workflow implementation.

Steps:
1. Open GitHub issue #12: title `R74 r100-test-density CI workflow implementation`, labels `r20-tracking`, `wave-1`. Body describes the workflow requirement (fail below test:src 2.0 diff-based) and target PR (first source-carrying PR).
2. Edit `AGENT_RULES_ZION_MAPPING.md` R74 row to remove the `ratio-check` claim and reference issue #12 instead.

Commit: `[R74] mapping — defer r100-test-density workflow to issue #12 (first source PR)`.

### H3 · R125 ZION-4 has no gate and no tracking issue (Lens B P1)

`AGENT_RULES_ZION_MAPPING.md:857-859` defines ZION-4 (gas-budget) and names `forge test --gas-report` as the enforcer, but no Foundry/gas-budget workflow exists and no tracking issue for ZION-4 was opened in round 1.

**Fix**: open issue #13 for ZION-4 gas-budget CI, labels `r20-tracking`, `wave-1`. Body: describes ZION-4 requirement, target PR is first-contract PR. Then edit the mapping row to reference issue #13 instead of a non-existent workflow.

Commit: `[R125] mapping — link ZION-4 to tracking issue #13`.

### H4 · R126 ledger row #1 malformed (Lens B P2)

`handoffs/wave-0/dispatch-ledger.jsonl:1` is the initial builder-brief-upload row with an old schema: has `timestamp`, `subagent_id`, `brief_sha256`, `brief_path`, `pr`, `latency_ms`, `cost_units` instead of R126's `dispatch_id`, `wave`, `subagent_type`, `dispatched_at_utc`, `completed_at_utc`, `head_sha`, `expected_verdict`, `actual_verdict`, `notes`.

**Fix**: rewrite line 1 to conform to R126. Replace with:

```json
{"dispatch_id":"pr0-builder-brief-upload","wave":"wave-0","subagent_type":"brief-upload","dispatched_at_utc":"2026-07-01T04:00:00Z","completed_at_utc":"2026-07-01T04:00:00Z","head_sha":"55abad5","expected_verdict":"N/A","actual_verdict":"N/A","notes":"Initial upload of pr0-builder-brief.md to tgp-agent-context. No code dispatch. Superseded by pr0-builder-opus-48 row."}
```

Adjust `head_sha` to the actual SHA at which the brief was uploaded if you can recover it from git history; if unknown, use `55abad5` (the last Sonnet checkpoint before Opus took over) — that's what the notes reference.

Commit: `[R126] normalize ledger row #1 to schema`.

### H5 · PR body stale + internally contradictory (Lens B P2)

Round 1B appended an R23 EXCEPTION block to the PR body. However, the top of the PR body still has the OLD BUILD MATRIX with `head_sha: a71aecb...`, still says "R23 override: N/A (this PR is under cap)" or similar, still instructs PR-review-comment delivery for auditors (contradicting R13), still references R70 needing an issue (despite #2 existing), and reports prod LOC of 264 which is slightly out of date after 1B's 2 workflow lines.

**Fix**: regenerate the PR body cleanly. Structure:
1. **Summary** — one-paragraph what this PR ships.
2. **BUILD MATRIX** — current head `bd95096d05ad58510f2cb339572b6a9d5f3134f2` (or your end-of-turn SHA after H1-H4 commits).
3. **Files** — 26 files summary.
4. **Enforced-rule checklist** — mirrors the PR template.
5. **R131 challenges** — R70 → issue #2, R87 → issue #3.
6. **R20 deferrals** — issues #4-#13 (list them).
7. **R23 EXCEPTION REQUESTED (R86)** — the block from Round 1B, with updated prod LOC number.
8. **Audit delivery** — auditors return report in response message per R13. Operator (not auditor) may paste to PR after review.
9. **Merge approval** — requires operator branch protection (issue #11) + squash-merge approval.

Fetch current body first with `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.body'`. Write the new body to `/tmp/pr-body-round2.md`. Apply with `gh api -X PATCH repos/BradleyGleavePortfolio/zion-preserve/pulls/1 -f "body=$(cat /tmp/pr-body-round2.md)"` (or `gh pr edit 1 --body-file /tmp/pr-body-round2.md` if it works — round 1B noted `gh pr edit` had a Projects-classic deprecation warning; if it fails again, fall back to REST PATCH as before).

No commit (PR body is GitHub metadata).

### H6 · R101 mapping claims template fields not present (Lens B P2)

`AGENT_RULES_ZION_MAPPING.md:639` claims the PR template has fields for contract-bytecode delta, Solidity version pin, Hyperliquid API surface touched, and testnet-first flag. Only testnet-first and partial Hyperliquid cloid language exist.

**Fix**: choose one:
- (a) add the missing template fields as checkboxes/inputs
- (b) trim the mapping claim

Choose (a) — those are legitimate audit questions for later PRs. Add to `.github/PULL_REQUEST_TEMPLATE.md` under an "R101 code-specific checks (fill for source PRs)" section:

```
- [ ] **R101 · contract-bytecode delta** — if any `.sol` file changed, bytecode diff is attached (or N/A: no `.sol` changes)
- [ ] **R101 · Solidity version pin** — every `.sol` pragma matches `pragma solidity 0.8.35;` (or N/A: no `.sol` changes)
- [ ] **R101 · Hyperliquid API surface touched** — list endpoints touched, or N/A
- [ ] **R101 · testnet-first flag** — new on-chain code was exercised on Base Sepolia + Hyperliquid testnet before mainnet (or N/A: no chain code)
```

Commit: `[R101] template — add contract/Solidity/Hyperliquid/testnet-first source-PR checks`.

### H7 · R126 dispatch-ledger append (mandatory close-out)

Append rows for: Lens A round 2 (COMPLETED), Lens B round 2 (COMPLETED), fixer round 2 (this dispatch). Round 1B fixer row should also be added if missing.

## Commit sequence

1. H1 — deploy-readiness regex + self-test
2. H4 — ledger row #1 normalize (do early, alongside H1)
3. H2 — mapping R74 + open issue #12
4. H3 — mapping ZION-4 + open issue #13
5. H6 — template contract/Solidity/Hyperliquid/testnet-first
6. H5 — PR body regenerate (no commit; metadata)
7. H7 — ledger append (final commit)

Push after H1+H4, after H2+H3, and after H6+H7.

## Explicitly out of scope

- Do NOT add a `ratio-check` or `r100-test-density` workflow now. Round 1 auditor rejected no-op enforcement stubs; the deferral to issue #12 is the correct path.
- Do NOT add a Foundry/gas-budget workflow now (same reason; deferred to issue #13).
- Do NOT touch any files outside H1-H7.

## End-of-turn checklist

- [ ] `gh pr checks 1` shows all 11 checks still green
- [ ] `gh api repos/BradleyGleavePortfolio/zion-preserve/pulls/1 --jq '.head.sha'` matches your final push SHA
- [ ] `git log bd95096..HEAD --format='%an <%ae> | %cn <%ce>' | sort -u` shows only Bradley Gleave
- [ ] Issue #12 (R74 r100-test-density) exists
- [ ] Issue #13 (ZION-4 gas-budget) exists
- [ ] PR body has new BUILD MATRIX with current head SHA
- [ ] Ledger has valid R126-schema rows for round-2 auditors + this fixer
- [ ] Self-test of `deploy-readiness.py --self-test` PASSES
- [ ] `python scripts/deploy-readiness.py --check` against the repo PASSES (no drift on real code)

## Return format

1. BUILD MATRIX (start-of-turn)
2. Per-item summary (H1-H7) with commit SHA
3. Issue numbers created (#12, #13)
4. Net LOC additions this round
5. BUILD MATRIX (end-of-turn)
6. Final line: exactly `FIXER_STATUS: READY_FOR_REAUDIT` or `FIXER_STATUS: BLOCKED — <reason>`
