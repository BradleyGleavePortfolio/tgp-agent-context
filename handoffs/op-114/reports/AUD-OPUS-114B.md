# AUD-OPUS-114B report (Claude Opus 5.5 lens, wave 2, operator agent 114)

## 1. backend #661 @ 91625c86b54954875329d790ecb6af8c41cb9a11 — REQUEST CHANGES (A0/B1/C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/661#issuecomment-5964409597 (body: ops/aud-opus-114b/661-verdict.md)
- Closed: C-646-1 (admin list, drill-down and dunning admin view all omit the credentials; sweep found no other route returning them) and C-646-2 Sol (redaction).
- B-661-1: the payment_intent.succeeded match (and the prefetch) is `status:'pending'` only.
  - A decline followed by an in-sheet retry on the same PaymentIntent leaves the client paid but not entitled.
  - The secret is also kept forever.
  - The PR's own "payment_failed keeps them, the client retries" premise relies on this path.
  - Probe: ops/aud-opus-114b/661-probe.spec.ts (1/1 reproduces).
  - Fix: match `{in:['pending','payment_failed']}` and add a test.
- C-661-2: the backfill of existing rows is an operator decision. Recommended: run it in the deploy window.
- C-661-3: #654 composition. There is a textual conflict in applySubscriptionDeleted, and #654's activation path must clear the secrets.
- C-661-4: the 409 copy for disputed/refunded is imprecise; the loser-poll timeout case is rare; mobile must map the two new codes.
- CI: all 11 required checks green at head; branch BEHIND main.

## 2. mobile #331 @ ec2857baf00d15d2a5bac95a94849f6a38b0ef14 — REQUEST CHANGES (A0/B1/C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331#issuecomment-5964441359
- My B-331-1, C-331-2 and C-331-3 are closed.
- Sol's A-331-4 bound-request boundary holds from this lens; Sol's B-5 and B-6 look closed.
- New B-331-7: the overtaken-refresh fence in api.ts:210-217 is check-then-write. Two probes reproduce it (ops/aud-opus-114b/331-probe.test.ts, 2/2):
  - B signs in during the check read, and A's tokens overwrite B's, so unbound traffic goes out as A.
  - A signs out during the write, and A's tokens are written back.
  - Fix: an epoch-tied critical section on an auth-storage mutex shared with the sign-in/sign-out writers.
- C-331-8: an overtaken unbound request surfaces as no-response (offline) copy.
- CI: 3/3 required checks green; branch BEHIND main.

## 4. backend #658 @ 08534e17c686602415f0836abc66db0182aeea3f — REQUEST CHANGES (A0/B1/C4), graded T4
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/658#issuecomment-5964473420 (body: ops/aud-opus-114b/658-verdict.md)
- B-658-1: A2 create writes coach_id = actor.id with no team attribution (resolveTeamAttribution, ADR-0001 Q5).
  - A sub-coach's code attaches clients to the sub-coach, not the head coach.
  - The head coach cannot see that code.
- C-658-2: InviteRedemption must join #608's erasure manifest (the coverage spec will go red after #608 merges).
- C-658-3: legacy regenerate adds archived rows that show in the legacy list.
- C-658-4: the rotate successor copies the binding without re-validation.
- C-658-5: a malformed Idempotency-Key is ignored silently; a replay can race a failed binding; an owner caller creates a CoachProfile.
- CI: all required checks green; branch BEHIND main.

## 3. mobile #335 — SOL ONLY (skipped by this lens)

## 5. backend #659 @ fa9a7cbd33c5f1c1d5108f3a3d57ea70f3177faf — REQUEST CHANGES (A0/B1/C4), T4
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/659#issuecomment-5964501283 (body: ops/aud-opus-114b/659-verdict.md)
- B-659-1: a paused broadcast that already ran is still editable.
  - The edit resets next_run_at, and resume then creates a second run with a new run_key, re-sending to the whole segment.
  - The in-flight run also reads the edited body at send time, so one run mixes two texts.
  - Fix: snapshot body/card per run, refuse edits to a one-off once a run exists, and add tests.
- C-659-2: #608 erasure-manifest coverage for the new tables.
- C-659-3: attempts are consumed by parking/deferral.
- C-659-4: the sub-coach roster re-check is tenant-level only.
- C-659-5: the direct CoachMessage write skips audit and AI-context invalidation; a push can be lost on a crash; the idempotency replay compares body only.
- CI: all required checks green.

## 6. mobile #312 @ 2b54e151150d16291098dfcb91674beb9ed7af18: APPROVE (A0/B0/C2), T4 (paired with #609)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5964585715
- Closed: B-312-1, Sol's B-312-2, C-312-2 and C-312-3. Local jest: 36/36. The main merge is pure (merge-tree ebbe5f16).
- C-312-4: after a server re-read, the notice can contradict the switch.
- C-312-5: analytics fires even when the save failed.
- Release gate: #609 merges and deploys first; it is still RC at 40616dcf.

## 7. mobile #327 @ 9c8b2b06a6dc7767f04b801582cb6ad97ee32845: APPROVE merge-only (A0/B0/C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5964589269
- Pure merge of main 1f8981dd: merge-tree b405241d equals the commit tree, with no file overlap with #314. All checks green.

## 8. backend #608 @ be6b584166565a76c4f407605ee44b6f42b1ace5: APPROVE merge-only (A0/B0/C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5964711125
- Pure merge of main 2e3094b9: merge-tree 37b9e7af, with no file overlap. All 11 required checks green.

## 9. mobile #329 @ 3a90f28af8b1df647d5816c0b0c2c84a6d56c996: BLOCK (A1/B0/C1), T4
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5964724319
- A-329-1 is open by construction: the Money page is in #332, which must be merged into the branch.
- Closed: C-329-6 / Sol's B-329-1 (durable intent plus #641's server idempotency), C-329-7 and C-329-5.
- New C-329-8: recovering from a 410 needs two taps.
- Release order: #641 deploys first, then #332 merges into #329, then #329.

## 10. backend #641 @ fb29fb9e577578a0b7cbb9051ca919541ac038d4: APPROVE (A0/B0/C2), T4
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5964726454
- Closed: B-641-5 (idempotent package create), C-641-6, and Sol's B-641-6 from this lens. Local specs 21/21.
- C-641-7: the ledger_reversed check is read-then-act across three refund paths, so a double reversal is possible. Fix: a CAS claim.
- C-641-2 carried.

## 11. mobile #332 @ c89c5f7e1ee8aee51f96920d2e280d735cddeb03: REQUEST CHANGES (A0/B1/C2), T4
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5964754628
- Closed: B-332-1 (both lenses), C-332-1..3, and Sol's B-332-2, B-332-3 and C-332-1.
- B-332-4: exportCsv uses `responseType` text with a `transformResponse` identity, so error bodies stay JSON strings. `readBody` then finds no code, and MONEY_EXPORT_TOO_LARGE and the other export codes fall to the generic fallback. Probe: ops/aud-opus-114b/332-axios-probe.js.
- C-332-5: the CSV is shared as a message string.
- C-332-6: stale Business tiles are unlabeled.
- Local jest: 55/55.

## 12. mobile #328 @ dd34763321c4b2c09e2f54547671f416fe050dbb: APPROVE (A0/B0/C2)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/328#issuecomment-5964769399
- Closed: B-328-5 (barrier raised before the flush), B-328-6 (expected_head_index fence, #640) and C-328-7.
- C-328-2 merge order: #640 deploys first.
- C-328-8: the retry heuristic head == expected+1 can mistake another device's save for the undo.
- Local jest: 36/36.

## 13. mobile #322 @ 23435ec2c099aa5e25c8c0737d92662b73c83855: APPROVE (A0/B0/C1), T4 (paired with #628)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322#issuecomment-5964778187
- Sol's B-322-1, B-322-5, B-322-7 and C-322-2 are closed from this lens. The contract matches #628 @1fd964f0 (`complete: true`, `in_progress`). Local jest 90/90.
- C-322-3: the #334 ClientPackagesScreen conflict must keep the native Update card.
- Release order: #628 deploys first.

## 14. mobile #334 @ 0629d50601618af7a51d0f92c4bbf828001dba7a: APPROVE (A0/B0/C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/334#issuecomment-5964822138
- B-334-1 closed: the expired attempt retries once with a fresh key and never resends a dead key; PACKAGE_ALREADY_INCLUDED has specific copy. Local jest 38/38.
- C-334-2: the #322 ClientPackagesScreen conflict.
- Release order: #654 (still RC) and #628 deploy first.

## Operator 19:42
- #608 MERGED (main ec911328).
- Do not audit #652 at fb33823f: wait for FIX ROUND 2 and read FR1 5964714320.
- #609 moved (e768d91b): audit it at its next READY head.

## Wave-1 takeover (operator 19:11): pending
- #627 @f47b0c6a: no FIX ROUND 8 yet.
  - The adapted probe ops/aud-opus-114b/627-probe-r8.spec.ts (the old probe plus a clock moved past the in-flight window, asserting the safe outcome) passes 2/2 at f47b0c6a. B is held, the result is succeeded, there is 1 transfer and 0 repay alerts, so the original B-627-9 orderings no longer reproduce.
  - The original probe now times out: A holds in flight and never sends.
  - Worktree /home/user/workspace/wt/AUD-OPUS-114B-627 is kept for the verdict.

## HANDOFF
This lens stopped at about 175 of its 200 steps, to leave room for the report. It did not stop at QUEUE EMPTY; a successor Opus lens must continue polling.

**Verdicts posted by this lens (all at exact heads):**
| PR | Verdict |
|---|---|
| #661 | RC 0/1/3 |
| m#331 | RC 0/1/1 |
| #658 | RC 0/1/4 |
| #659 | RC 0/1/4 |
| m#312 | APPROVE 0/0/2 |
| m#327 | APPROVE merge-only 0/0/1 |
| #608 | APPROVE merge-only 0/0/3 (now merged) |
| m#329 | BLOCK 1/0/1 (A-329-1 waits for #332) |
| #641 | APPROVE 0/0/2 |
| m#332 | RC 0/1/2 |
| m#328 | APPROVE 0/0/2 |
| m#322 | APPROVE 0/0/1 |
| m#334 | APPROVE 0/0/1 |

**Open for a successor:**
- **#627 (priority):** the head moved to cd332bfa and there is no FIX ROUND 8 yet. Audit the delta from the RC at 7c29d981, covering fix 05623107 plus later commits.
  - Run ops/aud-opus-114b/627-probe-r8.spec.ts (copy it to test/). At f47b0c6a it passes 2/2, so B-627-9 no longer reproduces.
  - The original probe times out by design.
  - Residual: a sender paused for more than 5 minutes is mitigated by SFEE_TRANSFER_RECOVERED plus the per-charge lock.
- **#652:** wait for FIX ROUND 2 (B-AUDIT-GATE) and do a full T4 audit. Read FR1 5964714320.
- **#609:** audit at its next READY head; e768d91b and the manifest seam are in progress. m#312 is already APPROVED.
- **m#332:** next round must close B-332-4. After dual APPROVE it merges into #329, then do the #329 delta (closes A-329-1).
- **#654 @795110b7:** delta from the RC 5964353243 (B-654-1).
- **#628 @1fd964f0:** BEHIND, no FIX ROUND 6 comment yet, CI pending. Delta from the Opus APPROVE at 739e9a54 against Sol's RC.
- **#656, #640, #647, #648:** their heads moved (c3f9c949, 176e4f0e, df4eb80b, 16294f44), but they have no FIX ROUND yet.
- **m#321:** wait until #627 merges.
- **#661, m#331, #658, #659:** re-audit when their builders post fixes.
- **Poll:** ops/aud-opus-114b/poll.sh.
- **Worktrees:** all of this lens's are removed.
