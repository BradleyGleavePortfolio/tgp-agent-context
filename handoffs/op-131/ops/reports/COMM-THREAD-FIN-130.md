# COMM-THREAD-FIN-130 (agent 130, group B finisher; FIX_PLANS section B row; source CF-COMM-THREAD-128 = FW-COMM-128:FWC-THREAD-128)

Status: DONE 18:51 PDT 10-07. m#540 opened, CI green, READY posted at 18:50 (comment 6050521862). Builder ends (no waiting for verdicts).
Branch agent129/cf-comm-thread-128, worktree /home/user/workspace/wt/COMM-THREAD-FIN-130-mobile. Start head d6e7900a (base mobile main a1be6fb2).
Row: "Community reactions never showed; posts have no author names or times | failing-first run, README, PR, READY; ship after backend#862 is deployed".
Recon 130: b#862 merges ~18:10 and deploys in deploy 29; open the PR and post READY when deploy 29 is live (operator messages); prepare everything before.

## Progress log (PDT)
- 18:19 merged origin/main 9b37c5df into the branch (clean; main had not touched the 5 branch files; m#529 changed SafetyMenu.tsx only,
  which still has onDelete/contentNoun/authorName). Merge commit 1d4d4ecb.
- 18:26 branch CommunityThreadScreen.test.tsx 7/7 PASS, but jest hung ~5 min on React Query's gc timer (held a heavy slot).
- 18:28 commit 2eea369c (tests only): thread test QueryClient gcTime Infinity (run now ~35 s); communityApi.test.ts +4 contract tests
  (react/unreact answer the server state, null on drift; deletePost DELETE path; 403 -> forbidden).
- 18:29 FAILING-FIRST (3 source files reverted to origin/main 9b37c5df, branch tests kept), via heavy.sh:
  CommunityThreadScreen.test.tsx 7 failed / 7 (tap does not flip the chip; post summary count missing; no community-thread-post-meta;
  no own-post menu community-thread-post-safety; no community-thread-back; no community-thread-replies list with RefreshControl).
  communityApi.test.ts 4 failed / 28 (the 4 new tests: reactToPost resolves undefined; deletePost is not a function). Logs:
  /home/user/workspace/ops/logs130/COMM-THREAD-FIN-130.failfirst-thread.log, .failfirst-api.log. Sources restored from HEAD (clean).
- 18:31-18:38 branch, heavy.sh one file at a time: CommunityThreadScreen 7/7, communityApi 28/28, communityScreens 22/22, useCommunity 7/7,
  quietLuxuryDoctrine 30/30, truthfulCopy.guard 20/20, copyVoice.guard 8/8.
- 18:38 operator mail: b#862 deployed in deploy 29 (production = backend main d6065661). Wait over.
- 18:39-18:40 targeted ESLint (6 changed ts/tsx files) clean; targeted tsc (temp config
  /home/user/workspace/ops/logs130/tsconfig.COMM-THREAD-FIN-130.json, 1,639 files incl. the changed ones) 0 errors.
- 18:41 README commit 81b56cf8 pushed (branch head 81b56cf811e42ebcce9116df10c81cc107aaa5e4). Mobile main still 9b37c5df (no new merge needed).
  Overlap check: none of the 9 open mobile board branches (m#513, m#524, m#533..m#539) touch these files.
- 18:43 opened growth-project-mobile#540 (body /home/user/workspace/ops/reports/COMM-THREAD-FIN-130-pr-body.md). CI running.
- 18:50 CI green at 81b56cf8 (Typecheck, lint, test; CodeQL x3), mergeStateStatus CLEAN. Head re-checked on GitHub, READY posted
  (comment 6050521862, text in COMM-THREAD-FIN-130-ready-comment.md).

## Scope traced
- Backend main d6065661 (b#862 merged 18:16 as c85d53db): every post and reply view carries author_name (first name; "Member" when
  none stored, member-display-name.ts) and reactions [{emoji,count,reacted_by_me}] (block-filtered). POST/DELETE
  /community/posts/:postId/reactions answer {target_type,target_id,reactions} (also on production deploy 28). DELETE
  /community/posts/:postId: author or workspace coach/owner (community-posts.service.ts remove), guarded by FEATURE_COMMUNITY_POSTS = true
  in fly-env-desired-state.json. No DELETE for replies (C).
- Mobile: communityApi.ts (optional author_name/reactions, react/unreact return state, deletePost), useCommunity.ts (useReactToPost writes
  state into the cached post + invalidates post and feed keys; new useDeletePost), CommunityThreadScreen.tsx (Back row, author/time
  lines, reactions with in-flight flip, own-post Delete via SafetyMenu onDelete, replies FlatList always mounted with RefreshControl).

## B list
None.

## U list (all fixed in m#540; each "seen in a test": failing-first 7/7 on main's source)
- U1 (FW-COMM-128) reactions write-only: CommunityThreadScreen.tsx ReactionBar now gets the server summary (post.reactions, else the
  tap's answer) and flips in flight; a second tap DELETEs. A client tapped a chip and nothing changed, and could never take it back.
- U2 (thread half) no author/time on post and replies: muted "You" / "Your coach" / first name + relative time. A client could not tell
  the coach's reply from another client's. (Hall list rows: FWC-SPACE-128, not this PR.)
- U3 (posts) no own-post delete: SafetyMenu onDelete on the own post -> DELETE /community/posts/:postId -> leave. A client who shared
  something too personal could not take it down. Replies: C (no endpoint).
- U5 (thread) no visible Back: Back row (goBack, else CommunityTab).
- U6 (thread) no refresh: replies FlatList always mounted with RefreshControl (post + replies refetch).

## C one-liners
- Own replies cannot be deleted: no backend endpoint for comment delete. C (needs new endpoint).
- A coach with no stored name reads "Member, your coach" (backend fallback name). C (edge, deferred to 10k clients).
- Block from a thread opened by a link with nothing beneath calls goBack (unchanged). C (edge, deferred to 10k clients).
- A failed reaction tap reverts silently (no message); same as main. C.

## PRs
- growth-project-mobile#540 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/540 (head agent129/cf-comm-thread-128 @
  81b56cf811e42ebcce9116df10c81cc107aaa5e4), 581 changed lines (+512/-69, 244 tests) in 7 files. T2. CI: green at head. READY: posted 18:50.
  Verdicts: none yet (Opus and Sol lenses review next).

## Proposed (needs operator)
- None needing a decision. Note: FWC-SPACE-128 (Hall list author/time, refresh, Cohorts honesty) was gated on this PR ("starts after
  FWC-THREAD-128 merges"; it reads the optional fields communityApi.ts gains here). Default: start it after m#540 merges.

## HANDOFF
- PR growth-project-mobile#540, branch agent129/cf-comm-thread-128, exact head 81b56cf811e42ebcce9116df10c81cc107aaa5e4 (pushed; nothing
  unpushed; worktree /home/user/workspace/wt/COMM-THREAD-FIN-130-mobile clean). Based on mobile main 9b37c5df (merged in, clean).
- Done: failing-first (7/7 thread tests and 4 API tests fail on main's source), README thread lines, PR with tier header, parity table,
  truthful sweep, overlap check; CI green; READY `FIX ROUND 1 (OPENING) (COMM-THREAD-FIN-130, agent 130) — growth-project-mobile#540 @
  81b56cf811e42ebcce9116df10c81cc107aaa5e4 — READY FOR AUDIT` posted 18:50.
- Left: both lens verdicts at this head, then the operator merges (merge_if_dual.sh). Review findings or conflicts go to FIX-OPUS-130 /
  FIX-SOL-130: next round is `FIX ROUND 2 (COMM-THREAD-FIN-130, agent 130, <fixer ID>) — growth-project-mobile#540 @ <sha> — READY FOR AUDIT`.
- Backend dependency met: b#862 live in deploy 29 (18:37). Mobile reads author_name/reactions as optional (safe on any backend).
- Logs: /home/user/workspace/ops/logs130/COMM-THREAD-FIN-130.*.log. Targeted tsc config: /home/user/workspace/ops/logs130/tsconfig.COMM-THREAD-FIN-130.json.
