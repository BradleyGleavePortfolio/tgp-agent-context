# Lane AUD-OPUS (agent 111) — Claude Opus 5.5 audit lens (independent; never push code)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first (audit contract, AGENT 111 FACTS, owner decisions), then
/home/user/workspace/repos/tgp-agent-context/MODEL_ROUTING.md (T2/T3/T4 rules). For each PR: re-read the live head
(`gh pr view <n> --json headRefOid`), read the PR body (tier header, fix-round table), EVERY prior AUDIT comment, and the
required checks at that exact head. Verify each prior finding is truly closed with code + a test, then hunt new defects. One
verdict comment per PR at the exact head (first line format in the brief). If the head moves during your audit, audit the new
head. Merge-of-main deltas: prove purity with merge-tree + patch-ids, then review the seam.
Queue (in order; append each verdict to /home/user/workspace/ops/reports/AUD-OPUS-111.md as you post it):
1. backend #604 @ e159d665 (T4 delta from your APPROVE at 12a4d423; Sol RC B-604-1 at 08658e77 = four ENV_RULES defaults 240/60/400/10).
2. backend #635 @ 0a32b4fe (T4 first audit: client-ai-v4 box-2 copy "kept until you delete them or your account"; DELETE
   /roman/sessions/:id now erases; v3 grants -> needs_reconsent; owner 20:32 "keep past AI chats forever", OR-110-1 user delete
   + account deletion still erase).
3. backend #629 @ d134f012 (T4 fix round 4: $19.99 minimum or exactly $0; B-629-3/4, C-629-2; your prior RC at 858eb40b).
4. backend #634 @ dbc10b7b + mobile #325 @ b0c02156 (T4 first audits: S-SCHED-2 booking lifecycle, migration 20270222000000;
   native Calendar). Audit as a pair.
5. mobile #321 @ 4295fc79 (T3, Opus is the single lens: your RC at a9b1f49d B-321-x; fix round 4 has no fix-round comment — read the commits).
6. Then backend #607 + mobile #310 (T4; consent lane is moving #607 to consult-consent-v3 to match #310 f85ffd36; the operator
   will message you the final heads — if no message yet when you reach this item, check the heads and the #607 fix-round
   comment; audit only once #607 carries consult-consent-v3).
The operator may message you to insert/reorder items. No pushes, merges, workflow dispatches or production actions.
Final answer (<400 words): each PR, head, verdict, A/B/C counts, comment URL.
