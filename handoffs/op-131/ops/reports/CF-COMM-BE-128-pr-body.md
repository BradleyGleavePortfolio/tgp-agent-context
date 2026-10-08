**Tier:** T3 (privacy: what other members see on community posts and replies).
**Why:** every post and reply view now also shows the author's first name and the reactions the viewer may see; read-only and additive. First names already reach the same audience on wins, cohort members and the leaderboard.
**T4 trigger scan:** auth: none (no route or guard change). RLS/tenancy: none (names and reactions are read only for rows the caller is already allowed to read, after the same workspace and block checks). PII: first name only (memberFirstName, the same rule as wins), shown to members of the same community, per the owner default of 10-07 ("author FIRST names on posts and replies"); no full name, email or new id leaves the API. Money, credentials, destructive data, migrations, flags: none.
**T3 trigger scan:** member-visible privacy surface (author first name); reaction counts follow the same two-way block rule as the reaction endpoints.
**Bounded T1:** NO (privacy surface).
**Canonical builder:** CF-COMM-BE-128 (agent 129 wave, Claude Opus 5.5).
**Parent owner:** operator agent 129.
**Acceptance evidence:** failing-first: the new `test/community/posts/community-post-author-reactions.spec.ts` fails 4/4 on main c3324d4a (`author_name` and `reactions` are `undefined`), passes 4/4 here. `test/community/safety/community-block-two-way.spec.ts` 75/75 (includes the read-path regression guard), `test/community/safety/community-safety-flow.spec.ts` 14/14, all run locally through heavy.sh. Targeted tsc and eslint on the changed files are clean. Live-DB case 9 in `test/community/community-posts.e2e.spec.ts` runs in CI (community-live-tests).
**Promotion triggers:** anything that shows a full name, an email or a name to people outside the community; any write-path change.

## What changes for coaches/clients
- Clients: each post and reply in the Hall and in a thread now comes with the author's first name, so a client can tell the coach's post from another client's. Each post and reply also comes with its reactions (emoji, count, and whether this person reacted). Once the app reads this (mobile CF-COMM-THREAD-128), a reaction tap shows on screen and can be undone. Today it does nothing visible and can never be removed. The current app ignores the new fields, so nothing breaks before the mobile change ships.
- Coaches: the same. The coach also sees first names on posts, as on wins.

## API contract (additive, read-only)
- Every post object (POST/GET/PATCH/DELETE `/community/posts...`, `GET /community/workspaces/:id/posts`) gains `author_name: string` (first name only, "Member" when no name is stored) and `reactions: [{ emoji, count, reacted_by_me }]`. This is the same shape and the same block rule as the `reactions` in the POST/DELETE `/community/posts/:postId/reactions` response.
- Every reply object (POST/GET `/community/posts/:postId/comments`) gains the same two fields (`reactions` = reactions on that reply).
- Mobile works against this and against today's production: `src/api/communityApi.ts` post and comment schemas are `.passthrough()`.

## B/U list
- B: none.
- U1 (FW-COMM-128): reactions were write-only (no reaction data on the post). Fixed on the backend here; the mobile half is CF-COMM-THREAD-128.
- U2 (FW-COMM-128): posts and replies had no author. Fixed on the backend here (first name only); the mobile half is CF-COMM-THREAD-128 / CF-COMM-SPACE-128.
- C (edge, deferred to 10k clients): two reactions with the same `created_at` could list their emoji in a different order in the tap response and in the GET. The counts are the same.

## Open PRs on these files
None. I checked every backend board branch at 16:29 (b#855, b#857, b#858, b#859, b#860, b#861) with `git diff --name-only origin/main...origin/<branch>`, and none touches a file here. This PR is based on main c3324d4a and keeps the diff minimal.

## Diff (10 files, +442/-25 = 467 lines, of which 297 are tests)
- `src/community/dto/community-post.dto.ts`: `author_name` and `reactions` on the strict post and comment schemas.
- `src/community/dto/community-reaction.dto.ts`: `summariseReactions`, the one summary rule. It moved from `CommunityReactionsService.summarise` with the same behaviour.
- `src/community/reactions/community-reactions.service.ts`: uses `summariseReactions`.
- `src/community/reactions/community-reactions.repository.ts`: `listForTargets`, one batched read per page.
- `src/community/posts/community-posts.repository.ts`: `namesByUserId`, one batched read per page (id and name only).
- `src/community/posts/community-posts.service.ts`: injects `CommunityReactionsRepository`. Every post and reply view (create, list, getOne, edit, remove, addComment, listComments) carries `author_name` and `reactions`. Reactions by anyone in a block relation with the viewer are left out, as in `visibleReactions`. Every read keeps its block filter (the regression guard passes).
- Tests: the new spec, the new constructor argument in the two in-memory safety specs, and the provider plus case 9 in the live e2e.

Builder: agent 129 wave (CF-COMM-BE-128).
