# CF-COMM-BE-128 (agent 129 wave, CLIENTFIX-128 row; source FW-COMM-128:FWC-BE-128)

Status: STOPPED by operator 16:37 (owner 16:35, credits). PR b#862 open, CI was running at 16:34, READY NOT posted. Backend main c3324d4a. Branch agent129/cf-comm-be-128 @ a340113982a504bcb8697ab1eb8dab30f8afe753.
Worktree: /home/user/workspace/wt/CF-COMM-BE-128-backend (deps linked; no schema change, no prisma generate needed).

## API CONTRACT (for CF-COMM-THREAD-128 / CF-COMM-SPACE-128 mobile; additive, read-only)
Every post object (POST/GET/PATCH/DELETE community posts, GET workspace post list) gains:
- `author_name: string` — the author's FIRST name only (memberFirstName, same rule as wins); "Member" when no name is stored.
- `reactions: Array<{ emoji: string; count: number; reacted_by_me: boolean }>` — same shape and same rule as the
  POST/DELETE /community/posts/:postId/reactions response `reactions` (reactions by anyone in a block relation with the
  viewer are left out). Empty array when nobody reacted.
Every comment (reply) object (POST/GET /community/posts/:postId/comments) gains the same two fields
(`reactions` = target_type 'comment').
Today's production backend has neither field: mobile must render nothing when absent (passthrough schemas, optional fields).

## Open PRs touching my files
None. Board 16:09 backend branches: agent128/money-mail-128 (b#857: checkout/email/templates), agent128/flip-pb-128
(b#855: fly-env-desired-state, runbook, r11-seams spec). Neither touches src/community or test/community.

## PRs
- growth-project-backend#862 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/862
  head a340113982a504bcb8697ab1eb8dab30f8afe753, 467 lines (+442/-25, 297 test), CI pending (opened 16:31), READY not yet posted.
  Body: /home/user/workspace/ops/reports/CF-COMM-BE-128-pr-body.md

## Done so far
- Failing-first: test/community/posts/community-post-author-reactions.spec.ts on main c3324d4a (16:24, heavy.sh): 4 failed / 4
  (author_name and reactions `undefined`). On the branch: 4/4 pass; community-block-two-way 75/75; community-safety-flow 14/14;
  targeted tsc (10 changed files) and eslint clean.
- Pushed agent129/cf-comm-be-128 @ a3401139, PR b#862 opened.

## Left
- Wait for CI (poll every 3 min), then post READY: `FIX ROUND 1 (OPENING) (CF-COMM-BE-128, agent 129) — growth-project-backend#862 @ <sha> — READY FOR AUDIT`.
- Notify line, HANDOFF, finish.

## Scope traced
Backend main c3324d4a: src/community/posts/* (service views: create/list/getOne/edit/remove/addComment/listComments),
src/community/reactions/* (summary rule, block filter in visibleReactions), member-display-name.ts (memberFirstName, used by
wins, leaderboard, cohort members, blocked list). Mobile main e634d19e: src/api/communityApi.ts post/comment schemas are
.passthrough() (new fields safe for the current app); CommunityThreadScreen ReactionBar has no `reactions` prop yet (mobile half).

## B list
None.

## U list
U1 (FW-COMM-128) reactions write-only: backend half fixed (post + reply views carry reactions). Mobile half: CF-COMM-THREAD-128.
U2 (FW-COMM-128) no author on posts/replies: backend half fixed (author_name, first name only). Mobile half: CF-COMM-THREAD/SPACE.

## C one-liners
- Two reactions with the same created_at may order emoji differently in the tap response vs the GET (counts equal). C (edge, deferred to 10k clients).

## Not fixed (needs operator)
None.

## HANDOFF
- Branch agent129/cf-comm-be-128, exact head a340113982a504bcb8697ab1eb8dab30f8afe753 (pushed; nothing unpushed). PR growth-project-backend#862, 467 lines.
- Done: author_name (first name only) + reactions on every post and reply view; failing-first 4/4 on main c3324d4a; local 4/4, 75/75, 14/14; targeted tsc + eslint clean.
- Left: CI at the head was running at 16:34 (build-and-test, community-live-tests). When it is green, post `FIX ROUND 1 (OPENING) (CF-COMM-BE-128, agent 129) — growth-project-backend#862 @ a340113982a504bcb8697ab1eb8dab30f8afe753 — READY FOR AUDIT`.
- Worktree /home/user/workspace/wt/CF-COMM-BE-128-backend; PR body in CF-COMM-BE-128-pr-body.md; API contract for the mobile thread/space jobs is at the top of this report.
