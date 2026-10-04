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

## B-661-R5-117 (builder, Claude Opus 5.5) — #661 round 5 (PaymentSheet credentials)
#661 @ 6fdc35de61a26a0c9e8b3741044a3ec223dc9ab4: Opus APPROVE 0/0/5 (issuecomment-5976687000), Sol REQUEST CHANGES 0/2/0
(issuecomment-5976655927). Close Sol's B-661-3 (equal-timestamp settlement evidence permits a stale decline revocation; completed
hosted purchases must recover after a successful retry) and B-661-8 (the successful retry's id-only write can overwrite an intervening
terminal refund/cancel/dispute state: fence the write on state, compare-and-set). Sol's probes: ops/aud-117/AUD-SOL-661-117/ (spec +
patch). Opus argues B-661-3's hosted sequence cannot occur through the product: if you agree, prove it with a test that pins the
invariant (not prose), and close B-661-8 regardless. Also C-661-9 (write-side completion fence test) and C-661-8 (only Stripe 404/400
are permanent; 401/403 retryable) since they are small and in the same file. Refresh the PR body to round 5 (C-661-3). First bring the
branch up to main 0b0f5b82 (merge-only) and keep the fix commits separate. Failing-before evidence required. Post FIX ROUND 5 (+ READY
when 11/11 green). Report: ops/reports/B-661-R5-117.md.

## AUD-OPUS-CM2-117 (Claude Opus 5.5) — #677 (coach M4 tests)
#677 @ 1f74654744536bbea6bb53ff489157f617fbee6e (or its current head). Sol APPROVE 0/0/1 (C-677-2 optional). Operator SIZE ASSESSMENT
KEEP posted. Audit independently; note that #674/#676 are getting a builder round (Sol RC), so if #677's head moves while you work,
audit the head current when you post. Report: ops/reports/AUD-OPUS-CM2-117.md.

## B-DUN-117 (builder, Claude Opus 5.5) — dunning stack restack D1 -> D5 (#687-#691), bottom-up until every piece is READY
Heads at 21:56: #687 D1 f8e47bf4 (base main, FIX ROUND 1 + READY posted by operator 117), #688 D2 6718d211 (FIX ROUND 1 READY),
#689 D3 6cead7ec (FIX ROUND 1 READY), #690 D4 0681babd (FIX ROUND 1 READY posted 21:42), #691 D5 0f24a8fa (restack note, no READY).
D1's fix commit f8e47bf4 is NOT yet merged into D2-D5. Take lock `dunning`; bring #687 up to main (merge-only, main is now
643817b3 or later) only if it conflicts or the next merge needs it (otherwise leave D1 alone); merge D1 into D2, D2 into D3, D3 into
D4, D4 into D5 (merge-only, no content edits unless a conflict forces one; if a conflict forces a content edit, that piece needs a
FIX ROUND with failing-before evidence). Verify every piece's own files are byte-identical to its last FIX ROUND head (patch-id), run
CI per piece, post a restack FIX ROUND (+ READY at green heads) on each moved piece, release the lock. Open B findings from 116's
lenses (B-687-1, B-689-1/2, Sol D3 0/4/0, D4 0/5/1) were answered in FIX ROUND 1 by B-D12-116 / B-D34-116: read
ops/reports/B-D12-116.md and B-D34-116.md and confirm each B has a closing commit + test; if any B is unanswered, fix it with
failing-before evidence. Report: ops/reports/B-DUN-117.md.

## B-FEES-117 (builder, Claude Opus 5.5) — fees stack round 13, bottom-up F1 -> F6 (#681-#686), then notify recurring
Verdicts at 21:58 (read every verdict comment at the current heads first; GitHub wins):
- #681 F1 9de3135c: Sol RC 0/1/0 (B-681-2: account-dependent keys permit duplicate legacy rows across reconnection snapshots;
  probe ops/aud-117/AUD-SOL-F12-117/). Opus F12 verdict: read it on the PR (AUD-OPUS-F12-117 report).
- #682 F2 a5d6a434: Sol APPROVE 0/0/0; Opus: read it on the PR.
- #683 F3 35a18539: Opus APPROVE 0/0/1; Sol RC 0/2/1 (settlement-debit currency misrepresented in customer-refund notices; incomplete
  refund pages accepted as complete).
- #684 F4 e9ee033d: Sol RC 0/2/1 (missing canonical refund identities/reporting; notice delivery ignores sweep deadlines); Opus RC
  0/1/2 (Opus B-684-3: pending refunds — a pending refund reverses the coach transfer and a later failure leaves the coach debited;
  before round 11 a pending refund that later succeeded never moved money). Sol and Opus reuse IDs for different findings: always
  cite with the lens name.
- #685 F5 b8c26b7f and #686 F6 e6893c97: FIX ROUND 12 READY (B-F56-117), no verdicts at these heads yet.
Operator rulings (defaults from the lenses, adopted): (1) fix Opus B-684-3 and Sol B-684-1 in one design: rebuild the full refund
list from Stripe (paginate to completion; an incomplete page set is never "complete"), count only succeeded refunds, apply money
(transfer reversal) only when a refund reports succeeded; a refund that fails after money was applied raises an alert and a flag
(no automatic re-credit this round; C-684-4 closes with the alert). (2) Size: F4 has ~5 lines of headroom under 3,000 and F3 ~16:
move tests out into a new tests-only piece stacked directly above F4 (title "fees F4b tests"), keep every piece under 3,000 and post a
SIZE ASSESSMENT for any piece over 1,500. (3) Every amount assertion stays exact; never weaken a test to pass.
Order: take lock `fees`; fix F1 -> merge-only restack F2 -> fix F3 -> fix F4 (+ new F4b) -> merge-only restack F5, F6. Failing-before
evidence for every fix. CI per piece; FIX ROUND (+ READY at green heads; red-by-design pieces state the exact expected failures) on
each moved piece. Release the lock, then write one line to ops/lanes117/notify/fees.txt: "fees top: #686 @ <sha>" (B-RECUR3-117 or
the next recurring builder restacks #678 onto it). Do not touch #678-#680. Report: ops/reports/B-FEES-117.md.

## B-CM-117 (builder, Claude Opus 5.5) — coach Money round, bottom-up M1 #674 -> M3 #676 -> M4 #677 (#675 is MERGED)
Heads: #674 d9327546 (base main), #676 cf5ef18b, #677 1f746547. Verdicts to close (read the comments; cite with lens name):
- #674: Sol RC 0/1/2 (Sol B-674-10: lost-dispute recovery reverses the Stripe charge/transfer twice while posting the head-coach ledger
  once; issuecomment-5976672242). Opus RC 0/1/5 (Opus B-674-5: a lost-chargeback head-coach reversal is never recorded if Stripe's
  response is lost — Stripe shows 245 cents back, local 0, only a warning; main's old webhook mirror recorded it; probe run
  37178103384; issuecomment-5976743131).
- #676: Sol RC 0/2/1 and Opus RC 0/2/0: B-676-3 one refund/chargeback on a head-coach-split sale gives two seller tax CSV rows
  (client_refunded doubles: 19.60 for a 9.80 refund); B-676-4 churned_30d still counts trials cancelled before they ever billed
  (116 ruling: MRR/churned_30d exclude never-billed trials). Probes 37178111398 and Sol's in ops/aud-117/AUD-SOL-CM1-117/.
Operator rulings (lens defaults adopted): (1) fix B-676-3 where the record is written (in #674), keyed and dated by the refund or
dispute event time, one row per money movement; (2) fix Opus B-674-5 / Sol B-674-10 with a dispute-scoped idempotency key that is
safely retryable (reverse exactly once, record exactly once, a lost Stripe response retries to the same key and records), plus a
Sentry alert on any mismatch; (3) a client still on a trial, or a trial cancelled before first bill, is never churned; (4) size: #674
has ~17 lines of headroom under 3,000: move tests into #677 (tests-only) and post SIZE ASSESSMENTs where over 1,500. Also bring #674
up to main 643817b3+ (merge-only) first since #675 merged. Failing-before evidence per fix; never weaken an amount assertion.
Take lock `coach`, fix M1 -> restack/fix M3 -> M4, CI per piece, FIX ROUND (+ READY at green heads) on each, release lock.
Report: ops/reports/B-CM-117.md.
B-FEES-117 addendum (22:00): Opus F12 verdicts: #681 APPROVE 0/0/1 (Opus C-681-7 = Sol B-681-2: legacy ledger key uses the payee's
account while the lookup uses the payee user) and #682 APPROVE 0/0/3. Ruling: fix it (cheap key fix in F1, key and lookup on the same
identity, with a reconnection-snapshot test). Also in F4: purchase-split-handler.service.ts:66 and :197 log raw error messages (G12):
log a code/class only.
