# COACH-ROW-SCRUB-130 (Claude Opus 5.5, T4 privacy, backend) — agent 130

Status (18:40 PDT): fix built, tested and pushed to agent130/coach-row-scrub-130 @ 1d4cff1cb8fdebe42a3ab4ee8ae1a2f7b8ff01a6.
No PR yet: the entry says "after SHARE-GATE-FIN-130 merges" (JOBS130 recon row). Waiting per _COMMON_130 item 11.

## Scope traced
- Source: AUD-FIN-FOOD-129 B1 (reports/AUD-FIN-FOOD-129.md). Entry: FIX_PLANS_130_131.md "6. COACH-ROW-SCRUB-130".
- Worktree /home/user/workspace/wt/COACH-ROW-SCRUB-130-backend, branch agent130/coach-row-scrub-130, based on backend main d6065661.
- Backend path: coach.controller.ts:120-152 (archive/unarchive return the service result) and :158-180 (timeline) ->
  coach.service.ts archiveClient / unarchiveClient / getClientTimeline: `prisma.user.findFirst` and `user.update` with no select, whole row
  returned (`return client` / `return updated` / `client,`).
- Mobile (main 9b37c5df) reads none of the client fields: coachFoodReviewApi.ts:33-61 reads meals + consent; useClientDetailData.ts:137
  and :240 read meals/workouts/weights/checkIns; ClientDetailScreen.tsx:305-322 only awaits archive/unarchive. No mobile change needed.
- Not affected: roster GET /coach/clients already strips the three columns (withRosterActivity, UX-COACHLOOKUP-124); getClientSummary
  sends client_name + consent-gated profile only; src/v1/v1-coach.service.ts selects explicitly.

## B list
- B1 (seen in a test; FIXED on the branch): a coach who opens a client's Food log review / Timeline / Weekly tab, or taps Archive or
  Unarchive, receives the client's whole User row, including the phone push token, the deletion-token hash and the sign-in id, so the
  coach (or anyone they share it with) can send that client app-looking notifications.
  - Smallest fix (done): coach.service.ts `COACH_CLIENT_ROW` = { id, name, archived_at } (`as const satisfies Prisma.UserSelect`) +
    `coachClientRow()` copy; the timeline selects it and returns `client: coachClientRow(client)`; archive/unarchive select it (+ coach_id
    for the audit tenant) and return the copied row on the write and the idempotent paths.

## U list
- none

## C one-liners
- C (edge, deferred to 10k clients): the roster still sends supabase_id, phone, email, signup_ref and default_payout_method_id per row
  (only the three credential columns are stripped). See Proposed.

## Evidence (reports/COACH-ROW-SCRUB-130-evidence/)
- jest_failfirst_main_d6065661.txt: new spec 5/5 FAIL on main (whole row incl. expo_push_token returned).
- jest_failfirst_predecessor_dc75b0e5.txt: 5/5 FAIL on agent129/cf-share-gate-128 dc75b0e5 (export of that tree + this spec).
- jest_fix_on_main_d6065661.txt: 5/5 PASS with the fix.
- jest_merged_pred_plus_fix.txt / jest_merged_sharing_reads.txt: on the merge of dc75b0e5 + 1d4cff1c (git merge-tree clean, tree
  bb0800fb): this spec 5/5 PASS, the predecessor's coach-sharing-coach-reads.spec.ts 10/10 PASS.
- neighbour_specs_on_fix.txt: coach-archive-audit 5, coach-timeline 4, coach-consent-gating 3, coach.service 8,
  coach.service.sub-coach-scope 5, audit-phase10 34, coach-roster-activity 4, client-guidelines-read 5, auth-signup-role-choice 71: all pass.
- Targeted strict tsc (spec + coach.service.ts + coach.controller.ts, 1,231 files loaded): clean. eslint on both TS files: clean.
  R75 banned tokens: none added (`as const` only).
- PR_BODY_DRAFT.md: full PR body (tier header, what changes, B/U, changes, sequencing).

## PRs
- none yet. Branch head 1d4cff1c: 159 changed lines (README 4/3, coach.service.ts 22/5, new spec 125/0).

## Proposed (needs operator)
1. Rule 3 token-file step: the platform's action safety classifier BLOCKED writing $GH_ENTERPRISE_TOKEN to ops/.ghtoken (it refuses to
   persist the token to a shared file). Not retried. GitHub calls here use only the injected credential. Default: the operator refreshes the
   board token from its own session.
2. Roster minimisation (C, not in this entry): GET /coach/clients (coach.service.ts getClients + withRosterActivity) still returns
   supabase_id, signup_ref, default_payout_method_id and the deletion_* timestamps. None is a credential. Default: defer; if wanted, a later
   job switches the roster to an explicit select.
3. Sequencing: this branch merges cleanly with SHARE-GATE-FIN-130's branch in either order (different functions). Default: keep waiting
   for its merge as the entry says; the operator may release this PR early.

## HANDOFF
- (in progress) Next: when SHARE-GATE-FIN-130's PR merges -> `git merge origin/main` in the worktree, rerun the new spec + coach-archive-audit
  + coach-timeline via heavy.sh, push, open the PR with PR_BODY_DRAFT.md (fill b#<n>), wait for CI green, post READY, notify, end.
