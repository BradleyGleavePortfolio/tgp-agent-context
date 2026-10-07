# CF-COMM-THREAD-128 (agent 129 wave, CLIENTFIX-128 row; source FW-COMM-128:FWC-THREAD-128)

Status: STOPPED by operator at 16:37 PDT 10-07 (credits). WIP pushed to own branch, NO PR opened.
Branch agent129/cf-comm-thread-128 @ d6e7900a658d1429c76452ddcc6d555b19d65374 (base mobile main a1be6fb2).  5 files changed, 461 insertions(+), 69 deletions(-)
Worktree: /home/user/workspace/wt/CF-COMM-THREAD-128-mobile (deps linked).

## Scope (FWC-THREAD-128, strictly)
Thread reactions show/toggle (post.reactions when present, else the react/unreact response), post key invalidated, own-post Delete via
SafetyMenu onDelete, author/time line (name only when sent; "You"/"Your coach" from ids; else time only), Back row, RefreshControl on replies.

## Facts traced (backend main fd190078)
- POST/DELETE /community/posts/:postId/reactions already return {target_type, target_id, reactions:[{emoji,count,reacted_by_me}]};
  mobile main discarded it (communityApi.ts reactToPost .then(() => undefined)), so taps never showed and DELETE never fired (U1).
- GET /community/posts/:postId has no reactions/author name today; CF-COMM-BE-128 adds reactions + author_name (read as optional).
- DELETE /community/posts/:postId allows the author (CommunityPostsEnabledGuard, on in prod). No comment DELETE: own replies get none (C).
- Deep link thread/:postId has no initialRouteName: Back falls back to navigate('CommunityTab').
- Open PRs touching these files: none (all 14 mobile board branches checked 16:12 via git diff).

## Done (in the pushed commit)
- communityApi.ts: optional author_name + reactions on post, author_name on comment; reactToPost/unreactToPost return the state (safeParse, null
  on drift); deletePost.
- useCommunity.ts: useReactToPost writes the state into the cached post + invalidates the post key; new useDeletePost.
- CommunityThreadScreen.tsx: Back row, author/time lines, reactions with in-flight flip, own-post Delete, replies list always mounted with
  RefreshControl (loading/error/empty copy and testIDs unchanged).
- Tests: new CommunityThreadScreen.test.tsx 7/7 PASS locally (heavy.sh, 16:37). communityScreens.test.tsx: useDeletePost added to the mock,
  reaction pressed by testID (Back is now the first button) - NOT run locally yet.

## B list
None. U fixed by this branch: FW-COMM-128 U1, U2 (mobile half), U3 (posts), U5 (thread), U6 (thread).

## Not fixed (needs operator)
- Finish and open the PR (steps in HANDOFF).

## HANDOFF
Branch agent129/cf-comm-thread-128 @ d6e7900a658d1429c76452ddcc6d555b19d65374, pushed, no PR. Done: code + new test file (7/7 pass locally).
Left: (1) run communityScreens.test.tsx, useCommunity.test.tsx, api/__tests__/communityApi.test.ts via heavy.sh; (2) failing-first: run the new test
file with the 3 source files reverted to main (expect failures: no community-thread-back, second tap calls reactToPost); (3) README
src/screens/community/README.md thread lines; (4) open PR (tier header, parity table: Back, reactions, delete, report/block, reply, retry,
empty action, refresh; say no open PR touches these files), CI green, READY line per _COMMON_128 item 1, notify.
