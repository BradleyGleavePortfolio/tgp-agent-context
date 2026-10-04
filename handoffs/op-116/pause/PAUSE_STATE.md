# Operator 116 — fleet paused (owner order 21:04 PDT 10-03). Snapshot 2026-10-03 21:09 PDT

Owner: "get all agents in flight to a safe pause point RIGHT NOW" (21:04) and "gather their live state and get it to a safe place
for operator 117 to pick up from" (21:05). Every agent got the same pause order: finish only the current atomic step, push nothing
half-done, post no partial verdict or FIX ROUND, release stack locks, write "## PAUSE STATE" in its report, end.

Where everything is:
- Per-job reports with "## PAUSE STATE": handoffs/op-116/reports/<JOB>-116.md (this repo) and the private branch below.
- Unpushed code / uncommitted probes: product-repo branches wip/op116/<worktree> (table: pause/WORKTREES.md). No CI fires on wip/*.
- Draft comments, draft verdicts, probe specs, CI logs: private branch growth-project-backend wip/op116/ops-snapshot (folder ops/).
- No stack locks held (dunning, recur, wear, fees, trials all released). Deploy run 37175413402 (main a5b605d1, #652 migration) finished SUCCESS after the pause
  (/health ok, /readyz 200). Still to verify: _prisma_migrations row finished and authenticated cannot execute app.community_win_author_coach.

| job | PRs | state at pause | resume step |
|---|---|---|---|
| B-D12-116 | backend #687, #688 | #688 6718d211 FIX ROUND posted, READY. #687 f8e47bf4 pushed, rerun 37174418115 was running, comment draft (ops/reports/B-D12-116-comments/) | when #687 green post draft; merge D1 into D2-D5 under dunning lock |
| B-D34-116 | backend #689, #690, #691 | #689 6cead7ec READY posted. #690 0681babd pushed, draft ops/reports/drafts/B-D34-116-690-fix-round-1.md. #691 0f24a8fa restack pushed, comment unwritten | post #690 draft when green; write #691 restack comment |
| B-CM1-116 | backend #674, #676, #677 | heads pushed: #674 d9327546, #676 cf5ef18b, #677 1f746547; drafts ops/scratch-B-CM1-116/fix67{4,6,7}.md | check checks, post drafts, update PR bodies |
| B-T12-116 | backend #671, #672, #673 | #671 1efac91e (rerun 37174785558 running), #672 4fa2fe4a green, #673 9719cb88 restack; drafts ops/b-t12-116/comment-67{1,2,3}.md; ci/B-T12-116-* branches remain | post drafts when green; delete ci branches |
| B-661-R4-116 | backend #661 | pushed 6fdc35de (B-661-3, B-661-5, C-661-6/7); drafts ops/b661-116/r4-*.md | when 11/11 green post FIX ROUND 4 |
| B-611-R9-116 | backend #611 | pushed b09f2061 (Apple unlink path, B-611-17 + Opus B-611-12); draft ops/aud-116/B-611-R9-116/fixround9_comment_draft.md | when 11/11 green post FIX ROUND 9 |
| B-R3-116 | backend #680 (+ new R4 tests piece) | nothing pushed; local WIP 09e139b1 (untested) saved to wip/op116/B-R3-116-1 | finish B-680-2, tests, restack, R4 split |
| B-W2-116 | mobile #360 (+ restack #361-#364) | fix done locally (b-w2-360 fde1875e) saved to wip/op116/B-W2-116-360; CI-lane after-run 37175851194 green | push to #360, FIX ROUND, restack #361-#364 |
| AUD-OPUS-CM3-116 | backend #675, #676 | #675 APPROVE 0/0/1 posted @ e45b06f9. #676 no verdict; draft notes (possible B-676-3 tax CSV double-counts refund with head-coach split) | fresh Opus lens on #676 after B-CM1 posts |
| AUD-OPUS-F12R-116 | backend #681, #682 | no verdicts; drafts APPROVE 0/0/1 and 0/0/2 pending probes (ops/aud-116/AUD-OPUS-F12R-116/draft-findings.md; probes saved to wip/op116/AUD-OPUS-F12R-116-*) | run probes, post verdicts |
| B-F34-116 | backend #683-#686 | pushed (fast-forward): #683 35a18539, #684 e9ee033d, #685 7425bb93, #686 6f1b94a9 (merge-only restacks); failing-before run 37173415148; draft ops/b-f34-116/DRAFT-fix-round-683-684.md | post drafts when checks green |
| B-RECUR2-116 | backend #678, #679 (+ restack #680) | pushed: #678 ebbd170e, #679 f83dbdd2, #680 929f3968 (merge-only); failing-before run 37175437392 (18 failed); 4 #680 tests rely on the old 23-hour cutoff (B-R3 owns); comments not written; ci/B-RECUR2-116-679-before branch remains | write FIX ROUND 4 on #678/#679 when green; B-R3 resumes #680 on top of 929f3968 |
| B-CI2-116 | backend #694, new #695 (SBOM gate) | pushed: #694 61d42f09 (round 2), #695 3624ab5f; drafts ops/bci2116/DRAFT-fix-round-2-694.md | post when 11/11 green; launch lens pair for #694 + #695 |
| AUD-OPUS-PRIV2-116 | backend #611, mobile #315 | posted: #611 @ acf9ff0f RC 0/1/1 (B-611-12 = Sol B-611-17, now fixed in b09f2061; C-611-17 emails in logs, outside PR); #315 @ 0277ce10 APPROVE (dual). Drafted: #611 @ b09f2061 APPROVE 0/0/1 (ops/aud-116/AUD-OPUS-PRIV2-116/DRAFT_verdict_611_b09f2061.md, branch wip/op116/ops-snapshot) | after FIX ROUND 9 READY posts at a green b09f2061: post the draft (or fresh Opus lens), fresh Sol lens; then merge #611 + #315 together |
| AUD-SOL-CM3-116 | backend #675, #676 | #675 @ e45b06f9 provisional APPROVE 0/0/0, evidence run 37175814691, draft ops/aud-116/AUD-SOL-CM3-116/675-verdict-DRAFT.md (not posted); #676 not started | post or re-verify #675 at its current head, then merge-only delta; #676 lens after B-CM1 posts |

Verdict state worth knowing: dual APPROVE and not yet merged: mobile #315 (0277ce10, merges with #611), mobile #359 (stack), fees
#685/#686 (stack), coach #677 (head moved to 1f746547 by restack: needs merge-only delta), recurring #678 (head will move). #675:
Sol APPROVE d1c98430, Opus APPROVE e45b06f9 (Sol at e45b06f9 owed). Merged today by 116: #664, #652. Deployed today: 3 (+#652 in flight).
Rulings this session: MRR and churned_30d exclude never-billed trials (+ trial count); cancel in a dispute cycle ends access now;
no Apple revocation claim until the owner sets the Apple key; hosted Checkout activates only via checkout.session.completed;
never-entitled check unified by dunning (lands second); recurring size plan (inert R2 code into #678; #680 tests into new R4 piece);
Health Connect late-data follow-up after #359-#364 land, before the clinic Android build.
