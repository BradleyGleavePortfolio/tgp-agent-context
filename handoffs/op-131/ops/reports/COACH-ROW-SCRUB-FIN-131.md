# COACH-ROW-SCRUB-FIN-131 (Claude Opus 5.5, FINISHER, T4 backend privacy) — agent 131

Status (21:53 PDT): DONE. b#878 @ 3ec27c47, CI green (16/16 checks), no conflict with main 21598a39, READY posted 21:52.

## Scope traced
- Branch agent130/coach-row-scrub-130, worktree /home/user/workspace/wt/COACH-ROW-SCRUB-FIN-131-backend. Was 1d4cff1c (builder,
  agent 130). Merged origin/main f0cd518a (no conflict) -> 05c407a7, pushed to the branch 20:50 (no PR yet, so no CI run).
- Entry: FIX_PLANS_130_131.md C1 #6; builder report reports/COACH-ROW-SCRUB-130.md (its evidence folder and PR body draft were not in
  the workspace any more; re-made below).
- Fix re-read at 05c407a7: coach.service.ts `COACH_CLIENT_ROW` = { id, name, archived_at } + `coachClientRow()`; getClientTimeline
  selects it and returns `client: coachClientRow(client)`; archiveClient / unarchiveClient select it (+ coach_id for the audit tenant)
  and return the copied row on the write and idempotent paths. Controller (coach.controller.ts:120-171) returns the service result as is.
- Mobile re-traced on mobile main e1688b51: services/api.ts:831-834 and :899-907, api/coachFoodReviewApi.ts:33-61,
  client-detail/useClientDetailData.ts:137 and :240, ClientDetailScreen.tsx:305-322 read none of the dropped client columns.
- b#865 (agent129/cf-share-gate-128 @ 51a1766c) touches other functions of coach.service.ts (new sharedClientIds/riskBoardClientIds
  above archiveClient, dashboard/alerts/summary). `git merge-tree` with this branch: clean (tree 7dcd9345).

## B list
- B1 (seen in a test; FIXED on the branch, builder agent 130): a coach who opens a client's Food log review / Timeline / Weekly tab, or
  taps Archive or Unarchive, receives the client's whole User row with the phone push token, deletion-token hash and sign-in id.

## U list
- none in scope.

## C one-liners
- C (edge, deferred to 10k clients): roster GET /coach/clients still sends non-credential columns (supabase_id, signup_ref,
  default_payout_method_id) per row.

## Evidence (reports/COACH-ROW-SCRUB-FIN-131-evidence/)
- jest_failfirst_main_f0cd518a.txt: new spec 5/5 FAIL on main f0cd518a (export of main + this spec; whole row incl. push token).
- jest_failfirst_b865_51a1766c.txt: 5/5 FAIL on b#865's head 51a1766c (export + this spec): the predecessor does not fix it.
- jest_fix_on_merge_05c407a7.txt: 5/5 PASS on this branch after merging main.
- jest_merged_7dcd9345_redaction.txt / jest_merged_7dcd9345_sharing_reads.txt: on the merge of 05c407a7 + 51a1766c: this spec 5/5,
  b#865's coach-sharing-coach-reads.spec.ts 13/13 PASS.
- neighbour_specs_on_05c407a7.txt: coach-archive-audit 5, coach-timeline 4, coach-consent-gating 3, coach.service 8,
  coach.service.sub-coach-scope 5, coach-roster-activity 4, audit-phase10 34, roles-enforced 2, coach-ptm-risk-board 11: all pass.
- jest_merged_b865_98101232_eeb83cc3.txt (21:20): on the merge of 05c407a7 + b#865's new head 98101232 (clean merge-tree, tree
  eeb83cc3): this spec 5/5, coach-sharing-coach-reads 15/15, coach-archive-audit 5/5, coach-timeline 4/4 PASS.
- Main b72e2c45 (21:05, b#855 etc.) also merges cleanly with this branch (tree 9ebe2a89; docs + one roman spec only).
- PR_BODY_DRAFT.md: full PR body (tier header, what changes, B/U, changes, sequencing).

## PRs
- b#878 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/878 @ 3ec27c47de4e838c93de63e3ba3c7d99aa1b8092,
  159 changed lines (README 4/3, coach.service.ts 22/5, new spec 125/0). CI: green at this head (16 checks, build-and-test run
  37728019900). READY posted 21:52 PDT (issuecomment-6052543930). Verdicts: none yet (builders do not wait).
  Main moved to 21598a39 (b#874, ai-credits only) after the CI run: `git merge-tree` with this head is clean, so not re-merged.
- jest_after_b865_merge_3ec27c47.txt: on 3ec27c47 (main 46523a56 merged in): this spec 5/5, coach-sharing-coach-reads 15/15,
  coach-archive-audit 5/5, coach-timeline 4/4, coach-consent-gating 3/3, coach.service 8/8, coach.service.sub-coach-scope 5/5.

## Proposed (needs operator)
1. Token-file step (_COMMON_131 item 3, optional): skipped (the builder reported the platform refuses persisting the token to a shared
   file). Default: the operator refreshes the board token from its own session.
2. U (from the code, outside this entry): Client detail archive button shows the wrong state for an archived client.
   useClientDetailData.ts:36 starts isArchived=false and :53 sets it only from `data.client` of GET /coach/clients/:id/summary, which
   sends no `client` (coach.service.ts getClientSummary returns client_name + profile). A coach opening an archived client sees
   "Archive client"; tapping it reports "has been archived" and changes nothing; the next tap unarchives. Smallest fix: summary adds
   `client: { archived_at }` (or mobile reads archived_at from the roster row / the archive response). Default: route to a later
   small U job (CLIENT-ARCHIVE-COPY-131 is a candidate); not in this PR.
3. Roster minimisation (C above). Default: defer.

## HANDOFF
- Done (21:53 PDT). b#878 open at 3ec27c47de4e838c93de63e3ba3c7d99aa1b8092, CI green, READY posted, worktree clean, branch pushed.
- Next (not this lane): Opus and Sol lenses review b#878 at 3ec27c47; findings go to FIX-OPUS-131 / FIX-SOL-131 (agent 132 next).
  If main must be brought in before merge: `git merge origin/main` in /home/user/workspace/wt/COACH-ROW-SCRUB-FIN-131-backend
  (no conflict with 21598a39 as of 21:52), rerun test/coach-client-row-redaction.spec.ts via heavy.sh, push, new FIX ROUND READY.
- Proposed items 2 (archive button state, U) and 3 (roster minimisation, C) above need operator routing; defaults given.
