# Agent 117 job board — wave 1 (launched 21:31 PDT 10-03). One agent per job; one or two PRs per job; then END.
Re-read every head on GitHub before acting. All jobs T4 unless stated. Lenses: independent of every builder; verdict format and
evidence reuse per _COMMON_116.md section 8. Builders: _COMMON_116.md section 7. Repo = growth-project-backend unless "mobile".

## AUD-OPUS-CI-117 / AUD-SOL-CI-117 — #694 then #695 (CI health; land first)
#694 @ 61d42f09077a1786b48ab68164f9e4921a795178 (jest workers: transpile-only specs + typecheck gate guard; FIX ROUND 2 READY
issuecomment-5976567947). Prior: Sol B-694-1, C-694-2; Opus C-694-1, C-694-2 (see thread). Decide each closed or not, then audit the
round-2 delta deeply and confirm the guard really fails closed (a weakened tsc step, strict flag, or excluded spec must go red) and
that build-and-test keeps its exact name. Evidence: /home/user/workspace/ops/reports/B-CI2-116.md, AUD-*-661CI-116.md, ops/aud-694-*.
#695 (SBOM gate determinism; T4 CI gate). Head moved 21:24 PDT to e80cefad04e22fbca9f1ff147746ca6684c50f89: operator commit (test-only,
one line) escaping every regex metacharacter, closing CodeQL alert 123 js/incomplete-sanitization at
test/ci/assert-prod-sbom-determinism.spec.ts:167. Full audit of the 2-file diff (script + spec). Audit the CURRENT head when you post.
The operator posts READY on #695 when its 11 checks are green; audit code meanwhile, post the verdict only at a green head.

## AUD-OPUS-PRIV3-117 / AUD-SOL-PRIV3-117 — #611 (launch step 1) + mobile #315 link check
#611 @ b09f2061f5a643d8d163870014dd85e1bb981986 (public privacy policy; FIX ROUND 9 READY issuecomment-5976568124; 11/11 green).
Round 9 closes Sol B-611-17 = Opus B-611-12 (Sign in with Apple deletion/unlink steps). Audit acf9ff0f..b09f2061 line by line (public
legal text: every sentence must be true of the code, vendors and retention settings), then confirm the rest still holds. Owner answers
O-611-1..6 are binding (_COMMON_116 section 10). Opus only: a 116 Opus lens drafted APPROVE 0/0/1 at this head before the pause
(/home/user/workspace/ops/aud-116/AUD-OPUS-PRIV2-116/DRAFT_verdict_611_b09f2061.md) — use it as your evidence trail, but you decide and
post your own verdict. Sol: prior Sol verdicts in the thread and ops/reports/AUD-SOL-PRIV2-116.md.
Also confirm mobile #315 @ 0277ce10170ae450a469bdf3e4e59351380105c0 (dual APPROVE) links the exact policy URL(s) #611 serves; say so in
your #611 verdict (no new #315 verdict needed unless it is wrong). #611 and #315 merge together.

## B-F56-117 (builder, Claude Opus 5.5) — #685 round 5, then #686 mechanical restack (fees stack top)
#685 @ 7425bb935456a64a13a08ae5bcd462bdc2873a39 and #686 @ 6f1b94a91f6a2b9e8142ac85970521b9285fff6c were dual APPROVE before restacks.
build-and-test is red on both: 7 copy-pinned tests in test/s-fee-r5-or-111-1.spec.ts expect F2's OLD payout-notice copy; F2 #682
round 11 (B-682-3) removed first person and kept exact amounts. Update ONLY those expectations to F2's current strings (never weaken an
amount or invariant assertion; every asserted amount stays exact), plus anything else red at #685 that is not a known infra failure.
Take lock `fees`, push #685, restack #686 (merge-only), release the lock, then write one line to
/home/user/workspace/ops/lanes117/notify/fees.txt: "fees top: #686 @ <sha>". Post FIX ROUND (+ READY when green) on both. #681-#684
are under audit right now: do NOT touch them. Evidence: ops/reports/B-F34-116.md, AUD-*-F56-116.md, B-F12-116.md.

## AUD-OPUS-F12-117 / AUD-SOL-F12-117 — fees F1 #681 and F2 #682
#681 @ 9de3135c2f128289ab302dff43a04e12f32b74d1 (base main), #682 @ a5d6a434a9bd909699b158ac3791a09db25c241d (RED BY DESIGN: exactly
4 tests in purchase-split-handler.service.spec + checkout-webhook-fee-split.spec; F4 carries their updates). Fee = price - actual
Stripe fee - 2%; $19.99 floor or free; OR-111-1 refund/chargeback netting. Decide your lens's prior findings, audit the round-11
deltas deeply, rest per evidence reuse. Opus: AUD-OPUS-F12R-116 left code-read conclusions and draft verdicts pending probes
(/home/user/workspace/ops/aud-116/AUD-OPUS-F12R-116/draft-findings.md, probe specs there and on wip/op116/AUD-OPUS-F12R-116-681/-682):
run the probes in the CI lane, then decide. Sol: ops/reports/AUD-SOL-F12-116.md.

## AUD-OPUS-F34-117 / AUD-SOL-F34-117 — fees F3 #683 and F4 #684
#683 @ 35a18539c8a911524c3eab5b074b33e247f80ac2 (RED BY DESIGN: exactly 3 suites / 9 tests — checkout-webhook-fee-split 2,
purchase-split-handler 2, reconciliation.service 5; verify), #684 @ e9ee033d425a61bb48efe2ac2387a23e5347acb0 (first piece changing live
money paths). FIX ROUND 11 READY: #683 issuecomment-5976572416, #684 issuecomment-5976572584. Round 11 closes Sol B-683-1/2/3,
B-684-1/2, Opus C-683-1/2/3, B-684-1, C-684-2 (tables in the comments). Evidence: ops/reports/B-F34-116.md, AUD-*-F34-116.md.

## B-RECUR3-117 (builder, Claude Opus 5.5) — #680 round + new R4 tests-only piece (recurring; MOST CRITICAL)
Stack: fees F6 #686 <- #678 (ebbd170e) <- #679 (f83dbdd2) <- #680 (929f39684951027aca14d9a3ab0127061e9aa808). B-RECUR2-116 pushed round 4
on #678/#679 (comments not written; ops/reports/B-RECUR2-116.md). B-R3-116 left untested WIP 09e139b1 (parent = OLD #680 head
2b10687c) on wip/op116/B-R3-116-1 (ops/reports/B-R3-116.md: B-680-1/3/4, C-680-4/5/6/7 done in WIP; B-680-2 handler side NOT done).
Do: (1) bring the WIP onto 929f3968, finish B-680-2 and every open #680 A/B (+ cheap C) with failing-before tests (CI lane); (2) the 4
#680 tests that assume the old 23-hour cutoff: fix to the current rule; (3) per 116's size ruling, #680's service tests move into a NEW
tests-only R4 PR stacked on #680 (keep every piece under 3,000 changed lines; #680 is near it). (4) When B-F56-117 writes
notify/fees.txt (new #686 head), take lock `recur` and restack #678 -> #679 -> #680 -> R4 merge-only. (5) Post FIX ROUND 4 on #678
and #679 from B-RECUR2-116's report (finding -> commit -> test table; failing-before run 37175437392), FIX ROUND on #680, READY on R4;
READY only at green heads (s-fee-r5 copy failures inherited from #685 vanish after the restack). Never one-time-only.

## AUD-OPUS-661-117 / AUD-SOL-661-117 — #661 round 4 (PaymentSheet credentials)
#661 @ 6fdc35de61a26a0c9e8b3741044a3ec223dc9ab4 (base main). Round 4 closes B-661-3, B-661-5, C-661-6/7 (draft comment:
/home/user/workspace/ops/b661-116/r4-comment-draft.md; the operator posts it with READY once the OOM rerun is green). Audit the round-4
delta deeply (late decline vs paid retry, credential clearing, read fence). Evidence: ops/reports/B-661-R4-116.md, AUD-*-661CI-116.md.

## AUD-OPUS-CM1-117 / AUD-SOL-CM1-117 — coach Money M1 #674 and M3 #676
#674 @ d93275469b0979c23431c94837043d379a6e9fe5 (base main; READY issuecomment-5976568620), #676 @
cf5ef18b6d6f892ce6d7b975539f4ea31730286e (READY issuecomment-5976568778). FIX ROUND 1 closes AUD-OPUS-CM1-116 (RC 0/4/5 on #674,
0/2/1 on #676) and the MRR ruling (MRR and churned_30d exclude never-billed trials; separate trial count). Opus pause note to verify:
possible B-676-3 — the tax CSV may double-count a refund with the head-coach split. Owner-only authz on admin endpoints, reversal
idempotency, coach-visible money equal to the ledger to the cent. Evidence: ops/reports/B-CM1-116.md, AUD-*-CM*-116.md.

## AUD-SOL-CM2-117 (GPT-6.1 Sol) — #675 and #677
#675 @ e45b06f9c797e2b1fc4bded653c826e9b78bda98 (idempotent package create; base main; Opus APPROVE posted at this head; earlier Sol
APPROVE d1c98430). 116 Sol drafted APPROVE 0/0/0 here but did not finish (ops/aud-116/AUD-SOL-CM3-116/675-verdict-DRAFT.md, probes
there): finish and post your own verdict. #677 @ 1f74654744536bbea6bb53ff489157f617fbee6e (tests only; restack + M3 tests moved from #676
for size; READY issuecomment-5976568923): full audit of the moved tests, merge-only delta for the rest.

## QUEUED (operator launches as slots free)
AUD-OPUS-CM2-117 (#677); AUD pair F56 (#685/#686 after B-F56-117); AUD pairs R12/R34 (after B-RECUR3-117); dunning builder (restack
D1 f8e47bf4 up D2-D5, #690 READY) then D pairs; trials pairs (after recurring lands); B-W2 (#360 from wip/op116/B-W2-116-360, restack
#361-#364) then W pairs; remainder (#642, #312, #335, Programs #355-#358).
