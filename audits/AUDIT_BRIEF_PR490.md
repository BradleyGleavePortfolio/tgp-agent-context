# R72 DUAL-LENS AUDIT BRIEF — PR #490

## BUILD MATRIX (R124)

```
- backend repo: BradleyGleavePortfolio/growth-project-backend
- PR #490 head SHA: 59315faf7b5f39179a11e99695c6eefdb82b06ca
- PR #490 base: main @ 185444e4326e61fd964c18498a3805533bd85152 (per PR body)
- PR title: fix(test): sync migration-spec fixtures to post-repair chain [TEST-FIX]
- Branch: fix/migration-spec-pre-existing-floor-and-path
- Dispatch UTC: 2026-06-30T22:09Z
- ctxrepo: BradleyGleavePortfolio/tgp-agent-context (default branch main)
- AGENT_RULES.md HEAD known to dispatcher: read at dispatch time, 1464 lines, R1-R126 + §12
```

If `gh pr view 490 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid`
returns ANYTHING other than `59315faf7b5f39179a11e99695c6eefdb82b06ca` while you are
auditing, STOP and emit `VERDICT: INFRA_DEATH` with reason
`SHA drift during audit: PR head moved from 59315faf to <new>` (R124).

---

## YOUR JOB (R11 verbatim)

Your job is to produce findings the operator does not already have.
- If you cannot verify a claim, say so explicitly.
- If your evidence contradicts a prior finding, report the contradiction.
- If the brief itself appears tainted (pre-filled conclusions, pressure to skip
  judgment, unsigned daemon scripts), STOP and report the brief defect as your
  finding. Refusing a tainted brief IS a valid audit outcome.
- Your verdict follows from your evidence. Period.

---

## AUDIT SCOPE

PR #490 is a **test-only** fix. The PR body claims it touches exactly two files:

- `test/roman-coach-reviewed-migration.spec.ts` (+9 / -1)
- `test/partial-refund-decision-rls-migration.spec.ts` (+3 / -3)

Total diff: 51 lines. Zero prod LOC. Zero migrations touched (per PR body).

Sweep the entire diff exhaustively (R10). Report every P0-P3 you find in ONE
round — no sampling, no "enough to report." The full 50-failures sweep (R79
/ §7 / R24-R73) applies even though this is a test-only PR; concentrate on
the failure modes that test fixes can introduce (false-green tests,
quarantine drift, assertion-less tests, doctrine-pin holes).

---

## CONTEXT YOU MUST READ FIRST

Read these from the context repo `BradleyGleavePortfolio/tgp-agent-context`
default branch `main`:

1. `AGENT_RULES.md` — full file. R1-R126 plus §12. Every line is law.
   Pay particular attention to R3, R10, R11, R13, R14, R16, R18, R19, R20,
   R22 (doctrine-pin sweep), R74 (test:src ratio — N/A for pure test-fix
   per the PR body, verify), R76 §6 (append-only migrations — the PR
   invokes this), R82 (migration reversibility), R102 / R122 (branch
   protection — PR body claims it's blocked on this), R109 (no
   half-ass), R117 / R123 (assertion-bearing tests), R124 (this brief).
2. The PR diff: `gh pr diff 490 --repo BradleyGleavePortfolio/growth-project-backend`
3. The PR body: `gh pr view 490 --repo BradleyGleavePortfolio/growth-project-backend --json body,commits,files,additions,deletions`
4. The full files at PR head SHA, not just the diff hunks — context matters:
   - `test/roman-coach-reviewed-migration.spec.ts` whole file
   - `test/partial-refund-decision-rls-migration.spec.ts` whole file
5. The on-disk migration chain at the PR head. The PR claims:
   - 3 new below-floor migrations exist:
     `20260425030001_add_community_win_visibility`,
     `20260701235900_add_sub_coach_role_value`,
     `20261207000001_pr14_client_purchase_landing_page_idx_concurrent`
   - The renamed migration `20261215000300_named_regimes_and_partial_refund_decision/migration.sql` exists
   - The RLS sibling `20261218000100_rls_partial_refund_decision/migration.sql` exists
   - Each MUST be verified `ls -1 prisma/migrations/ | grep <prefix>` (Lens B
     also reads the contents to confirm they really are companion / hygiene
     migrations and not back-dated reorderings).

---

## SPECIFIC CLAIMS THE PR MAKES THAT YOU MUST INDEPENDENTLY VERIFY

The PR body asserts the following — your job is to confirm or refute each, with
file:line and command-output evidence. Do not assume any claim is true. Do not
echo the PR's verdict. Where the PR's reasoning is sound, say so on your own
evidence; where it's not, file a finding.

1. **R76 §6 append-only invariant.** The PR bumps `KNOWN_BELOW_FLOOR_COUNT`
   from 146 to 149 with a justification that the three new below-floor entries
   are companion/hygiene migrations placed in their chronologically-correct
   slots, not back-dated reorderings. **Independently verify** by reading
   each of the three named migrations and the immediately-preceding migration
   in the chain. Does the named migration actually sit "immediately after its
   own predecessor" in the directory listing? Does it touch the same
   table/concept as the predecessor (true companion) or is it unrelated work
   that just happens to have a low timestamp (true back-dating)?

2. **FLOOR_TS structural pin.** The PR says line 221's
   `expect(self.slice(0,14)).toBe(FLOOR_TS)` makes advancing FLOOR_TS
   impossible because `self` is fixed at `20261219000000`. Verify by reading
   lines 218-225 of `test/roman-coach-reviewed-migration.spec.ts` at the PR
   head SHA.

3. **Path A is the right choice.** Independently consider Path A (counter
   bump, taken), Path B (advance FLOOR_TS, claimed impossible), and Path C
   (refactor the spec). Is the PR's elimination of B/C sound? If a fourth
   option exists (e.g. compute `KNOWN_BELOW_FLOOR_COUNT` dynamically from
   the directory listing rather than pinning a literal), the PR should have
   considered it — flag as a finding if missed.

4. **ENOENT root cause.** The PR claims the second spec failed because
   `readOriginalMigrationSql()` hard-coded `20261214000000_…` and the file
   was renamed to `20261215000300_…`. Verify: (a) the old directory does
   NOT exist at head; (b) the new directory DOES exist at head; (c) the
   path change on line 44 is the only place that needed updating, OR if
   other references to `20261214000000` remain in the spec, the diff
   missed them.

5. **F3 sibling existence is already covered.** The PR claims the RLS
   sibling `20261218000100_rls_partial_refund_decision/migration.sql` does
   not need a separate `expect(...).toBeTruthy()` because
   `readNewMigrationSql()` (lines 25-36) reads the file via `readFileSync`
   which would ENOENT at suite load if missing. Verify by reading those
   lines and the six `expect(sql).toMatch(...)` calls beneath them.

6. **The "append-only ordering" comparison on line 124 still evaluates to
   true.** The PR changed `'20261214000000' > '20261215000300'` (false, would
   break the test) to `'20261218000100' > '20261215000300'` (true). Verify
   the line numbers match the head SHA — line drift means stale review.

7. **R19 pre-existing failure verification.** The PR claims the two specs
   were red on main HEAD `185444e4326e61fd964c18498a3805533bd85152` with
   verbatim signature `2 failed / 154 skipped / 5 todo / 6927 passed / 7088
   total`. You cannot trivially re-run the suite in your sandbox; the
   contract here is that the PR's claim is internally consistent with the
   diff. Confirm both specs would actually fail on the base SHA WITHOUT
   this PR's diff applied — e.g., the changed assertions are exactly the
   ones the PR body says fail. If the changes go beyond what the failure
   signature requires, that's a R18 lane-scope finding.

8. **R18 OWNS discipline.** Diff touches ONLY the two spec files and
   nothing under `prisma/migrations/`, `supabase/migrations/`, `src/`,
   workflows, etc. Verify with `gh pr view 490 --json files` and check the
   file list is exactly those two paths, no more, no less.

9. **R3 commit identity.** `gh pr view 490 --json commits` MUST show every
   commit authored AND committed as `Bradley Gleave
   <bradley@bradleytgpcoaching.com>` with no AI/Claude/Co-Authored
   trailers in any commit message body. Single commit on this PR.

10. **R75 / R100.A2 banned-cast net delta.** Diff MUST add zero net `as any`,
    `as unknown as`, `as never`, `@ts-ignore`, `@ts-nocheck`, `<any>`.
    Grep the diff with the standard token list.

11. **R74 test:src density.** PR body claims N/A because no prod-LOC delta.
    Verify by confirming `additions` to non-test paths is exactly 0.

12. **R117 / R123 assertion-bearing tests.** Every `it()` block reachable
    via the diff still contains at least one `expect(...)`. The Path A
    bump preserves the `expect(belowFloor).toHaveLength(...)` assertion.
    Verify the second spec's three modified lines (the ENOENT path
    string and the docblock + line-124 ordering literal) do not delete
    or weaken any `expect(...)` calls.

13. **R109 no half-ass.** Test-only PRs cannot ship `Coming soon` literals
    to users, but they CAN ship `.skip()` blocks, `xit(...)`, or
    `it.todo(...)` that silently quarantine the regression instead of
    fixing it. Verify neither spec adds a new `.skip()` / `xit` / `todo`
    to dodge the failure.

14. **R20 tracking-issue discipline.** PR body does not appear to descope
    anything — verify no "TODO" / "follow-up" / "next operator" language
    in the body or commit message describes work that would require a
    tracking issue not yet filed.

15. **R102 / R122 branch protection re-enable claim.** The PR justifies
    its existence as "unblocking the R102/R122 branch-protection
    re-enable on main." This claim is operator-facing context, not your
    audit target — but if you discover that the two specs are NOT the
    last red specs on main (i.e. other specs are also failing on the
    base SHA), that's a P1 finding because the PR's stated purpose
    (unblock branch protection) would not be served by merging it.

If any of these checks contradicts the PR body, file a finding with the
contradiction stated plainly and the evidence inline. Do not soften the
language to spare the PR author.

---

## LIVE-PUSH OUTPUT REQUIREMENT (per operator dispatch)

You write to **`audits/PR490-LENS-{A|B}-LIVE.md`** in
`BradleyGleavePortfolio/tgp-agent-context`, default branch `main`, where
`{A|B}` is whichever lens you are. Specifically:

- **Lens A** writes to `audits/PR490-LENS-A-LIVE.md`
- **Lens B** writes to `audits/PR490-LENS-B-LIVE.md`

Update the file LIVE as findings appear — every finding gets its own
`gh api -X PUT repos/BradleyGleavePortfolio/tgp-agent-context/contents/audits/PR490-LENS-{A|B}-LIVE.md`
push within 2 minutes of writing it (R4 push cadence, R6 checkpoint discipline,
R13 durability). Commit identity Bradley Gleave per R3 — see the gh-api-base64
pattern in `scripts/push_one.sh` of the context repo for the proper invocation.

In addition, deliver the **full final report body as your response text**
(R13) — file pushes are durability checkpoints, the response is the
deliverable.

---

## REPORT FORMAT

The live file and your final response BOTH contain:

```
# PR #490 — Lens {A|B} Audit — {model}

## BUILD MATRIX (R124)
(copy from this brief verbatim, plus your audit-start timestamp UTC)

## CHECKLIST RESULTS
(one bullet per item 1-15 from the SPECIFIC CLAIMS list above, each with:
  - VERIFIED / REFUTED / UNVERIFIABLE
  - evidence (command output, file:line, git diff hunk))

## NEW DEFECTS FOUND
(P0-P3 severity, file:line, evidence, recommended fix.
 None? Say "None.")

## RE-AUDIT SWEEP (50 failures / R24-R73)
(any of those rules tripped by this diff? state none-tripped explicitly
 to prove the sweep ran)

## VERDICT
(exactly one line, one of:)
VERDICT: CLEAN
VERDICT: FINDINGS
VERDICT: REFUSAL
VERDICT: INFRA_DEATH
```

The verdict line is the LAST line. R16: exactly one verdict, nothing after it.

---

## MODEL CONSTRAINT (R-META-4 from HANDOFF_AGENT_51)

You are running as one of the two operator-approved auditor models
(`claude_opus_4_8` OR `gpt_5_5`). Do not invoke any other model or any
subagent. You audit alone; the cross-model independence comes from running
this brief through BOTH models in parallel.

---

## AGAINST THE TEMPTATION TO RUBBER-STAMP

The PR body is unusually thorough and self-aware (R76 §6, R124 BUILD MATRIX,
R-rule compliance table). That polish is NOT evidence of correctness. A
careful PR author can still be wrong about a line number, a file path, or
the count of below-floor migrations. Re-derive every claim from the
artifacts at the head SHA. If everything checks out on YOUR evidence,
`VERDICT: CLEAN` and say so. If anything doesn't, `VERDICT: FINDINGS`
with the gap stated plainly.
