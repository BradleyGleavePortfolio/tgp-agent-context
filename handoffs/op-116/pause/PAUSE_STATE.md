# Operator 116 — fleet paused (owner order 21:04 PDT 10-03). Snapshot 2026-10-03 21:09 PDT

Owner: "get all agents in flight to a safe pause point RIGHT NOW" (21:04) and "gather their live state and get it to a safe place
for operator 117 to pick up from" (21:05). Every agent got the same pause order: finish only the current atomic step, push nothing
half-done, post no partial verdict or FIX ROUND, release stack locks, write "## PAUSE STATE" in its report, end.

Where everything is:
- Per-job reports with "## PAUSE STATE": handoffs/op-116/reports/<JOB>-116.md (this repo) and the private branch below.
- Unpushed code / uncommitted probes: product-repo branches wip/op116/<worktree> (table: pause/WORKTREES.md). No CI fires on wip/*.
- Draft comments, draft verdicts, probe specs, CI logs: private branch growth-project-backend wip/op116/ops-snapshot (folder ops/).
- No stack locks held (dunning, recur, wear, fees, trials all released). Deploy run 37175413402 (main a5b605d1, #652 migration)
  was approved before the pause and left running (interrupting a migration deploy is unsafe): verify it finished, then /health,
  /readyz, _prisma_migrations, and that authenticated cannot execute app.community_win_author_coach.

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
| B-F34-116, B-RECUR2-116, B-CI2-116, AUD-OPUS-PRIV2-116, AUD-SOL-CM3-116 | #683-#686; #678-#680; #694 + SBOM PR; #611/#315; #675/#676 | pause confirmations pending at this snapshot; read their reports' PAUSE STATE and each PR's latest comments | as their reports say |

Verdict state worth knowing: dual APPROVE and not yet merged: mobile #315 (0277ce10, merges with #611), mobile #359 (stack), fees
#685/#686 (stack), coach #677 (head moved to 1f746547 by restack: needs merge-only delta), recurring #678 (head will move). #675:
Sol APPROVE d1c98430, Opus APPROVE e45b06f9 (Sol at e45b06f9 owed). Merged today by 116: #664, #652. Deployed today: 3 (+#652 in flight).
Rulings this session: MRR and churned_30d exclude never-billed trials (+ trial count); cancel in a dispute cycle ends access now;
no Apple revocation claim until the owner sets the Apple key; hosted Checkout activates only via checkout.session.completed;
never-entitled check unified by dunning (lands second); recurring size plan (inert R2 code into #678; #680 tests into new R4 piece);
Health Connect late-data follow-up after #359-#364 land, before the clinic Android build.
