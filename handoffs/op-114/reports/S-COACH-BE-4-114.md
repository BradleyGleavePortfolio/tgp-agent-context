# S-COACH-BE-4 (agent 114) — backend #641

Status (19:23 PDT): DONE except CI. Head fb29fb9e577578a0b7cbb9051ca919541ac038d4 (fix 00c885fd + main 2e3094b9). FIX ROUND 3 comment posted (issuecomment-5964562579), PR body tier header + Fix round 3 table updated. Worktree removed.

## Verification of agent 113's ef08c3fd ("Fix round 2" comment, not in FIX ROUND format)
- B-641-5 / OR-112-16 / OR-113-6 idempotent package create: verified in code (claim + insert + result in one interactive transaction on WorkoutBuilderIdempotencyKey, route_key packages:create, caller-scoped; 422 IDEMPOTENCY_KEY_REUSED with package_id, 410 IDEMPOTENT_PACKAGE_REMOVED, 400 IDEMPOTENCY_KEY_INVALID, Idempotent-Replayed header) and 13 tests. Gap found + fixed: a P2002 from the package insert itself (not the claim) was reported as 409 IDEMPOTENCY_IN_PROGRESS; now the real error surfaces (no committed claim => not a key collision).
- B-641-6 refunds booked at success: verified for the charge.refunded path. Gap found + fixed: a pending refund completes in production through `charge.refund.updated` (Stripe does not resend charge.refunded); `onRefundUpdated` only set status, so posted_at stayed null (booked at request time by the fallback) and the ledger was never reversed. It now routes through upsertAndApplyRefund (first success time, reversal once) and sends the coach alert / partial-refund decision once.
- C-641-6 export ?currency=, B-332-2 charge cadence: verified (tests present).
- C-641-2: integration dependency (#646 merged; #627/#628), no code.

## Tests (local, heavy.sh --runInBand)
- test/coach-money-production-writes.spec.ts + test/packages-create-idempotency.spec.ts: 21/21 pass; both new tests fail with src reverted (ConflictException instead of real error; refund not booked/reversed).
- test/refund-dispute-handler.service.spec.ts + test/cancel-pending-on-refund.spec.ts: 41/41 pass.
- eslint 4 files clean; R75 range check OK.

## API notes for S-COACH-MOB-4 (mobile #329/#332)
No API shape change this round. 409 IDEMPOTENCY_IN_PROGRESS is practically unreachable (concurrent same-key retries wait and replay); keep its copy anyway.

## Overlap
#627 (S-FEE) also edits refund-dispute-handler.service.ts but does not touch onRefundUpdated; the new branch calls upsertAndApplyRefund, so it follows #627's settlement version after merge. #656 edits packages.service/controller (expect a merge conflict for whichever lands second).

## CI at fb29fb9e (19:23 PDT)
Passed: npm audit, CodeQL JS/TS, Banned cast tokens, build-sbom, rls-live-tests. Pending (runner queue ~90 deep): build-and-test, rls-floor-guard, mwb-3-live-tests, community-live-tests, danger, Schema parity. The CI workflow at 00c885fd (same code before the #663 main merge) passed in full, along with danger, Schema parity, R75 and SBOM.

## HANDOFF
- PR: backend #641, head fb29fb9e577578a0b7cbb9051ca919541ac038d4. No further pushes planned.
- Next (operator): `gh pr checks 641`. When all 11 required checks are green, dispatch the dual audit (Opus + Sol) at fb29fb9e. If build-and-test fails only on test/ci/release-evidence-gate.spec.ts:367, rerun it once.
- Findings: B-641-5 closed (round 2 verified, plus a hardening fix in round 3). B-641-6 closed (round 2 plus the `charge.refund.updated` production path in round 3). C-641-6 and B-332-2 closed (round 2, verified). C-641-2 is an integration dependency only.
- Mobile (S-COACH-MOB-4): no API change.
- Overlap: #627 also edits refund-dispute-handler.service.ts, but not onRefundUpdated. #656 edits packages.service/controller; expect a conflict for whichever merges second.
