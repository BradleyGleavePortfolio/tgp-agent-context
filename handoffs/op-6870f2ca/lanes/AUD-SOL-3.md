# Lane AUD-SOL-3 (agent 112) — GPT-6.1 Sol audit lens (independent; never push code)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first (audit contract, AGENT 112 FACTS, owner decisions), then
/home/user/workspace/repos/tgp-agent-context/MODEL_ROUTING.md (T2/T3/T4 rules) and /home/user/workspace/ops/lanes111/AUD-SOL.md
(same contract). Your earlier lens runs (agents 110/111) posted AUDIT comments on GitHub; the evidence folders are gone, the
comments are authoritative. Prior lens reports: /home/user/workspace/ops/reports/AUD-SOL*-11*.md.
For each PR: re-read the live head (`gh pr view <n> --json headRefOid`), the PR body (tier header, fix-round table), EVERY prior
AUDIT comment, and the required checks at that exact head (backend 10 incl. Schema parity; mobile 3). Verify each prior finding
is truly closed with code + a test, then hunt new defects. One verdict comment per PR at the exact head (first-line format in the
brief). If the head moves during your audit, audit the new head. Merge-of-main deltas: prove purity with merge-tree + patch-ids,
then review the seam (conflict resolutions, env registry #624, migrations order).
Queue (in order; append each verdict to /home/user/workspace/ops/reports/AUD-SOL-3-112.md as you post it):
1. backend #607 @ b4750d05 — T4 DELTA from your APPROVE at f6fa244b: operator update-branch merged main 3bd6215b (#637 manifest,
   #638 ledger flag, #626 etc.). Wait for required checks green at the head (poll gently, every 2-3 min) — decisive and fast:
   this gates the merge.
2. backend #628 @ 739e9a54 + mobile #322 @ 0b4813dc — T4 (dunning v2 live path + lockout screen; owner 1A/2A; 10-day lockout).
   Opus APPROVED both at these heads; your verdict at these heads is missing. Audit as a pair.
3. backend #635 @ c2688010 — T4 re-audit after both lenses' RC at e7f67576 (client-ai-v4 retention copy, C-635-1 erasure sweep,
   B-635-1 same-day fresh session after delete). B-CONSENT-3 pushed c2688010 and died before writing a fix-round comment: read
   the diff e7f67576..c2688010 yourself.
4. backend #627 @ 9d6351b0 + mobile #321 @ 7322bbff — T4 money (S-FEE coach net, OR-111-1 forward netting of refunds/disputes,
   $19.99 minimum editor). Opus requested changes at these heads; your lens first so one fix round closes both lenses.
5. backend #640 @ 2ac6395f + mobile #328 @ dbd5ceb9 — T4/T3 (Programs: week x day grid, saved workouts, bulk assign, program in
   packages; migration 20270223000000). Opus BLOCK/RC at these heads; your lens first, same reason.
6. backend #609 @ 40616dcf + mobile #312 @ 90e78abe — T4 (welcome message +13 min runtime text never in repo; reminders from the
   first-session day at the preferred time). B-JOURNEY pushed these and died; read the diffs from your last verdict.
The operator may message you to insert/reorder items. No pushes, merges, workflow dispatches or production actions.
Final answer (<400 words): each PR, head, verdict, A/B/C counts, comment URL.
