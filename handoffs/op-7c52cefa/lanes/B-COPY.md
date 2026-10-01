# Lane B-COPY — community safety: backend #610 + mobile #314 (block both ways), then backend #611 B-611-1. Builder: Claude Opus 5.5 (T4)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.
1. Backend #610 @ b8ce8d35 (UGC safety). Approved App Review copy says "If you block someone, they can no longer see your
   posts" — code must make that true BOTH ways (blocker never sees blocked user's content and the blocked user never sees the
   blocker's) across every community read path (feeds, threads, replies, DMs, member lists, search, notifications, mentions).
   Agent 108's unfinished, untested work is on branch `wip/op590e4a5b-copy-610-20261001` @ 1f4e158 (on top of b8ce8d35, adds
   two-way filters + `community-block-two-way.spec.ts`). Review it critically, finish it, test it, push it to #610's branch.
   Report on every message/post must exist; client privacy (first names only to other members) must hold.
2. Mobile #314 @ b4b931d8: match the backend semantics and copy (block/report UI on every message and post, no dead buttons).
3. Backend #611 @ ced10667 (trust/policy pages): both lenses RC B-611-1 — published claims at `trust-pages.html.ts:190,369`
   (community-AI purpose text) are not true in production. Make the text exactly match implemented behavior (do not invent
   features; prefer accurate narrower wording). Mobile #315 (dual-approved) depends on #611; do not touch #315 unless #611's
   change forces it, and say so.
Per PR: rebase on origin/main if behind, fix-round table in the PR body, targeted tests, tsc/eslint on touched files, CI green
at final head. Report: /home/user/workspace/ops/reports/B-COPY.md (append per PR) + final answer.
