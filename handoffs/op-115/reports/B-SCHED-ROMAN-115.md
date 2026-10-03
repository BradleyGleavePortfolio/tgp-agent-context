# B-SCHED-ROMAN (agent 115) report

Paused at 11:25 PDT per the operator PAUSE. #634 is finished. The #651 split stopped at a clean point: A and B are draft PRs, and C is a pushed branch with tests only. Nothing else was started (#603 carry-over PR and #653 untouched).

## backend #634: FINISHED (round 5, B-634-10)
- My round-5 head was `3d989702208fc9ee407196ac7c3046f92f6b8cc5`, with 11/11 required checks green. FIX ROUND 5 comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5971822865, ending with READY FOR AUDIT. The PR body's Fix round table has row 7.
- Fix: `src/observability/orm-diagnostics.ts` `safeLogDiagnostic` is now a closed enum:
  - error class only from `LOG_ERROR_CLASSES`, else `OtherError`;
  - error code only from the `LOG_ERROR_CODES` catalog, read along a bounded cause chain;
  - Prisma P-codes only through the ORM branch;
  - HttpException adds its numeric status.
- Commits: `95171c38` (tests only), then `3d989702` (fix). No change to scheduling status, codes or shapes, so mobile #325 is unaffected.
- Failing-before proof:
  - CI run https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37140668115 is red (TS2305: the closed-enum API is missing).
  - Local: 19 failed before; after the fix, 182/182 pass across 5 suites.
- Current state: the operator update-branched the PR to `e18e8055454b04856d2c5ab5568d0a7127b74939` and reports dual APPROVE. My last poll showed opus=APPROVE, sol not yet re-posted at e18e8055, and checks pass=10 with fail=1: `build-and-test` failed in run 37143570940. I could not read its log because the GitHub API was rate-limiting. It may be the known `release-evidence-gate.spec.ts:367` flake; the operator owns merge-only deltas.
- Next step (operator): check that run and rerun it once if it is the flake. #634 merges together with mobile #325 (OR-112-13).

## backend #651: SPLIT IN PROGRESS, paused (operator ruling 11:08; #651 stays OPEN, not closed)
#651 head `a8fa651c` is unchanged (Opus RC, Sol RC). Split status comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/651#issuecomment-5972178473

### Split plan (A/B/C seams)
- **A: client context.** Base main. Contains `src/roman/context/*`, `src/ai/client-ai-context.service.ts` (invalidation hook), `docs/roman-client-context.md`, `test/roman/fixtures/roman-personas.ts`, and `test/roman/roman-client-context.spec.ts` without the RomanService injection block. Inert: nothing registers its providers or controller.
- **B: guardrails.** Base A. Contains `src/roman/guardrails/*`, `docs/roman-safety-copy.md`, the pure router/post-check part of `test/roman/roman-guardrails.spec.ts`, and `src/audit/audit.service.ts` for OR-115-1. Inert: nothing calls it.
- **C: live turns.** Base B. Contains:
  - `roman.service`, `controller`, `module`, `prompts`, `constants` and `anthropic-client.provider`;
  - the env-validation and `.env.example` hunks;
  - the dunning route-table spec line;
  - the eval harness and golden set;
  - the launch-hardening, streaming, SSE, controller and service specs;
  - the split-off `test/roman/roman-client-context-injection.spec.ts` and `test/roman/roman-guardrails-wiring.spec.ts`.
  - C is the first piece that changes a live route or turn.
- Each piece has three commits: (1) the #651 @ a8fa651c files carried verbatim, (2) tests only, failing before, (3) the fix. At C1 the roman source tree equals a8fa651c plus the A3/B3 fixes, which I checked with `git diff a8fa651c` over src/roman.

### Finding -> piece
| Piece | Findings |
|---|---|
| A | B-651-10, C-651-4, C-651-7 |
| B | B-651-2, B-651-3, B-651-6, B-651-7, B-651-8, B-651-9 (post-check: zero marks), C-651-5 / OR-115-1 (neutral `roman.safety_route`, `ROMAN_SAFETY_ROUTE_REASON`, restricted-read `AuditService.list`), OR-115-2 keep |
| C | B-651-1, B-651-4 (was C-651-6), B-651-5; turn-path application of OR-115-1 (audit write, ledger and logs carry no router class or guardrail names) and of B-651-9 (prompt and session allowance removed); OR-115-2 end-to-end test |

The full table is in the #665 and #666 bodies.

### State per piece
- **A = backend #665 (DRAFT).** Head `9d54333a5af0060c9ce4fb3457c8310ea89367a1`. Commits: `020b965d` carry, `400808da` tests, `9d54333a` fix. Before-run is red: https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143655733. At my last poll the PR checks were pass=10 with 1 pending. r75 is clean. Size: 4,113 changed lines, 2,212 of them non-test source plus docs; this needs an operator SIZE ASSESSMENT under OR-115-6.
- **B = backend #666 (DRAFT).** Base is A's branch. Head `07429136a8640a1ce8f5c44a62023bd32901b2c3`. Commits: `326aa226` carry, `7b89caa9` tests, `07429136` fix. Before-run is red: https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37143908349. Checks were pending. CodeQL, danger and banned-casts run only once the PR is retargeted to main. r75 is clean. Size: 1,735 changed lines, 1,022 of them source plus docs.
- **C = branch `agent115/roman-split-c-live`, no PR.** Head `b866db3a` (`fd25a31d` carry, `b866db3a` tests). The C3 fix commit is not written yet.
- I have not appended #665, #666 or C to the q/AUD-* queues, because of the PAUSE.

### C3 recipe for the next wave
The source is on branch `agent115/roman-651-r2-wip-unsplit` @ `675cf045` (the unsplit WIP from my worktree). The same diff is saved as `ops/evidence/B-SCHED-ROMAN-115/651/round2-wip-unsplit.patch`.
1. `src/roman/roman.service.ts`:
   - `boundRomanPayload` and `inputTokenUpperBound` (UTF-8 bytes plus framing; trims history oldest-first to 100k);
   - reservation after the payload is built: `reserveDailySpend(caller, inputTokenBound)` inside `$transaction` with `pg_advisory_xact_lock(0x726d7370, dayKey)` and aggregate-compare-insert; over the cap, no row and 503 ROMAN_CAPACITY_REACHED;
   - `settledUsage`: unknown usage after dispatch keeps the reserved values; known zero only for a refusal before send, or a provider HTTP status before any event;
   - a warning when the reported input exceeds the bound;
   - crisis audit `action: AuditAction.ROMAN_SAFETY_ROUTE, metadata: { route_reason }`, with the reason imported from `guardrails/safety-router` (`ROMAN_SAFETY_ROUTE_REASON`). Delete the WIP's local `ROMAN_SAFETY_ROUTE_*` constants;
   - ledger and logs: no `router_class` and no `guardrails_applied` names; keep `rewritten`, `guardrail_count` and `usage`;
   - `exclamationAllowed: false` and no `spendsExclamation`;
   - import and re-export `romanErrorTag`, `romanSanitizedError` and `ROMAN_LOGGABLE_ERROR_NAMES` from `./roman-error-tag` (added in A), deleting the local copies.
2. `src/roman/roman.prompts.ts`: "NO exclamation points. Ever." and a fixed no-exclamation line.
3. `src/roman/roman.constants.ts`: the doc update only. Drop the WIP's ROMAN_CONTEXT_* constants; they live in A's `context/roman-context.errors.ts`.
4. `.github/workflows/ci.yml` (T4 gate file; disclose it): add a step after the "Roman delete-erases live spec" step that runs `test/roman/roman-spend-admission.live.spec.ts`.
5. Then:
   - run the before-run on C2 with `ops/ci-lane/ci_lane.sh backend <wt> ci/B-SCHED-ROMAN-C-before test/roman/roman-round2.spec.ts test/roman/roman-launch-hardening.spec.ts test/roman/roman-guardrails-wiring.spec.ts test/roman/roman.prompts.spec.ts test/roman/eval/roman-golden.eval.spec.ts`;
   - push C3 and open the PR with base `agent115/roman-split-b-guardrails`;
   - after C is green: un-draft #665, #666 and C, append them to the q/AUD-OPUS-CORE and q/AUD-SOL-CORE queues, comment "Superseded by #665, #666, #C (operator split, owner PR-size doctrine)" on #651, and close #651 without deleting its branch.

Local check of the unsplit WIP (WT2), before it was split: `roman-round2.spec.ts` 59/59 passed, and `roman-launch-hardening.spec.ts` 57/58 passed. The one failure was the full-width/double-mark scrub, which I fixed afterwards in the post-check (marks are now scrubbed before emoji removal); that fix is in B3 and in the WIP branch. After the fix, launch-hardening and guardrails were never re-run locally, because the heavy queue timed out. CI on #665 and #666 covers A and B.

## #603 carry-over PR (OR-115-3) and #653: NOT STARTED (PAUSE)
- #603 carry-over: one new T4 PR from main. It caps SendMessageDto at 2,000 chars (currently 8,000) and adds the AI Guide sex-aware calorie floor (1,200 F / 1,500 M) in src/ai/*.
- backend #653 @ `17b2be25` is DIRTY. It is stacked on #634's branch `agent110/s-sched-lifecycle`. After #634 merges, it needs a retarget and a main merge, then the OR-112-5 / OR-113-9 findings: auto-expiry 48 h, 1 h before, 30-min minimum; quiet close after 24 h.

## Operator decisions needed
1. SIZE ASSESSMENT for #665 (4.1k lines) and #666 (1.7k), against the OR-115-6 guide.
2. #634 `build-and-test` failure at e18e8055 (run 37143570940): rerun if it is the known flake.
3. Who resumes C3, and the order for #603 and #653.

## Cleanup
- Deleted branches: ci/B-SCHED-ROMAN-634-before, -A-before, -B-before.
- Worktrees B-SCHED-ROMAN-1/2/3 removed (node_modules unlinked). All work is pushed: agent115/roman-split-{a-context,b-guardrails,c-live} and agent115/roman-651-r2-wip-unsplit.

## HANDOFF
- #634: finished (operator: dual APPROVE at e18e8055). One failing build-and-test check is for the operator to look at.
- #651: open and unchanged. Split drafts #665 (A, @9d54333a) and #666 (B, @07429136) are pushed. C is on branch agent115/roman-split-c-live @b866db3a (tests only). The C3 fix source is on agent115/roman-651-r2-wip-unsplit @675cf045, with the recipe above.
- #603 carry-over and #653: not started.
