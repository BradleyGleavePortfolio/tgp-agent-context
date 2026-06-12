# COMMUNITY v2-3 BACKEND R3 AUDIT REPORT

Auditor: fresh R3 auditor  
Repo: `BradleyGleavePortfolio/growth-project-backend`  
PR: #389 `feature/community-v2-events`  
Audited worktree: `/home/user/workspace/tgp/audit-v2-3-backend-r3`  
Expected/audited HEAD: `a3ec919782ded8f30b7987562c27bd68a7274553`  
Current `origin/main`: `3f271b3952d3c9c81e1540227c3a768c6a838a93`  
Verdict: **DIRTY** due to a merge conflict against moved `main`.

## Required reading

Read in full before auditing:
- `/home/user/workspace/COMMUNITY_V2-3_BACKEND_R2_AUDIT_REPORT.md`
- `/home/user/workspace/COMMUNITY_V2-3_BACKEND_FIXER_R2_BRIEF.md`
- `/home/user/workspace/COMMUNITY_V2-3_BACKEND_FIXER_R2_REPORT.md`
- `/home/user/workspace/doctrine/FIFTY_FAILURES_PLAINTEXT.md`

## Head, CI, and mergeability

- PR branch and local worktree are exactly `a3ec919782ded8f30b7987562c27bd68a7274553`; `origin/main` is `3f271b3952d3c9c81e1540227c3a768c6a838a93`, with merge-base `25dbc790ce4562ed8a863a36a26bb5bf8e02c0f9` (`/home/user/workspace/v2_3_backend_r3_repo_pr_ci_numbered.txt:3-11`).
- GitHub status checks in `gh pr view`/`gh pr checks` are green for `build-and-test`, `mwb-3-live-tests`, `rls-floor-guard`, and `rls-live-tests` at the PR head (`/home/user/workspace/v2_3_backend_r3_repo_pr_ci.txt`, statusCheckRollup and `gh pr checks` section).
- **Blocking mergeability failure:** a dry merge of moved `origin/main` into the feature branch conflicts in `src/community/community.module.ts` (`/home/user/workspace/v2_3_backend_r3_mergeability_actual_numbered.txt:1-4`, `:19-27`). The conflict is the new v2-3 event module imports at PR HEAD (`src/community/community.module.ts:46-51`) colliding with the v2-2 `AckModule` import now on main (`origin/main:src/community/community.module.ts:46-49`), shown in the conflict hunk (`/home/user/workspace/v2_3_backend_r3_mergeability_actual_numbered.txt:33-49`).

## R2 F1 RSVP membership-role fix

Result: **FIXED on the feature branch**.

- `rsvp()` resolves the event first through `readableEvent` before any RSVP-specific eligibility write decision (`src/community/events/community-events.service.ts:519`), preserving the existing 404 non-leak boundary for unreadable events (`src/community/events/community-events.service.ts:170-183`).
- `assertRsvpEligible` still rejects global `owner`/`coach` and workspace coach callers (`src/community/events/community-events.service.ts:585-589`, `:597-602`).
- The fix resolves membership against the event's actual scope: `membershipInCohort(event.cohort_id, user.id)` for cohort-scoped events and `membershipInWorkspace(event.workspace_id, user.id)` for workspace-wide events (`src/community/events/community-events.service.ts:590-592`).
- The upsert is gated on `membership !== null`, `membership.status === 'active'`, and `membership.role === 'student'` before `events.upsertRsvp` can run (`src/community/events/community-events.service.ts:593-602`, upsert at `:551-556`).
- The access helpers support that logic: cohort lookup returns the exact cohort membership row, including inactive rows (`src/community/community-access.service.ts:38-45`), while workspace lookup returns an active workspace membership row (`src/community/community-access.service.ts:48-55`). The explicit status check in `assertRsvpEligible` covers inactive/ended cohort rows (`src/community/events/community-events.service.ts:593-596`).
- The thrown 403 body is byte-identical for the coach/owner/assistant/no-student cases because all ineligible paths use the same single `ForbiddenException({ error: 'forbidden', code: 'community.event.rsvp_not_eligible' })` block (`src/community/events/community-events.service.ts:597-602`).

### Adversarial probes

- Extra R3 probe confirmed an inactive/removed cohort membership rejects before upsert with `community.event.rsvp_not_eligible`, a cohort-A student cannot use that row to RSVP to a cohort-B event, and an assistant in cohort A plus student in cohort B is rejected/allowed according to the actual event cohort (`/home/user/workspace/v2_3_backend_r3_adversarial_probe_jest_numbered.txt:1-11`). Probe source saved to `/home/user/workspace/v2_3_backend_r3_adversarial_rsvp_probe.spec.ts`.
- A mutation test temporarily removed `|| !activeStudentMember`; the two assistant/co_coach rejection tests failed because the RSVP promise resolved, proving those tests exercise the real service path and would catch removal of the membership-role check (`/home/user/workspace/v2_3_backend_r3_mutation_role_check_numbered.txt:6-15`, `:52-84`).
- The three new fixer tests are real service calls through `service.rsvp(...)`: workspace-wide assistant rejection at `test/community/events/community-events.service.spec.ts:461-475`, cohort-scoped assistant rejection with resolver assertion at `:477-493`, and cohort-scoped active student happy path at `:495-502`.

## PR body corrections

Result: **PASS**.

- The live PR body says all seven path params are piped, not eight (`/home/user/workspace/v2_3_backend_r3_pr_body_grep_numbered.txt:1`), matching the controller's seven `ParseUUIDPipe({ version: '4' })` uses (`src/community/events/community-events.controller.ts:62-63`, `:74-75`, `:86`, `:107`, `:129`, `:151`, `:173`).
- The live PR body now states that only an active student community member for the event scope may RSVP and explicitly excludes assistant/co_coach memberships (`/home/user/workspace/v2_3_backend_r3_pr_body_grep_numbered.txt:2-5`), matching `assertRsvpEligible` (`src/community/events/community-events.service.ts:590-602`).

## Regression scan `c6799955...a3ec919`

Result: **PASS** for the R2 fix diff itself.

- Diff is exactly two files, `src/community/events/community-events.service.ts` and `test/community/events/community-events.service.spec.ts`, with `72 insertions(+), 1 deletion(-)` (`/home/user/workspace/v2_3_backend_r3_r0_r69_gate_scans_numbered.txt:12-15`).
- `git diff --check c6799955...a3ec919` produced no whitespace/error output after the stat (`/home/user/workspace/v2_3_backend_r3_r0_r69_gate_scans_numbered.txt:12-16`).
- R69 remains clean: no Prisma diff vs `origin/main...HEAD` and no working-tree Prisma diff (`/home/user/workspace/v2_3_backend_r3_r0_r69_gate_scans_numbered.txt:16-19`).
- R0 forbidden added-line scan was clean: no hits after the `=== R0 forbidden added lines scan ===` marker (`/home/user/workspace/v2_3_backend_r3_r0_r69_gate_scans_numbered.txt:20-21`).

## Full R0/R69 gate re-run at new HEAD

- Cohort scoping remains bounded: member list scope is workspace-wide plus accessible cohorts in the repository (`src/community/events/community-events.repository.ts:58-67`, `:82-91`), and active cohort IDs are status-filtered (`src/community/events/community-events.repository.ts:106-122`).
- Direct read/RSVP non-leak remains 404-bounded through `readableEvent` (`src/community/events/community-events.service.ts:170-183`, RSVP entry at `:519`).
- UUID runtime validation remains present on all seven route params (`src/community/events/community-events.controller.ts:62-63`, `:74-75`, `:86`, `:107`, `:129`, `:151`, `:173`).
- Write throttles remain on create/update/RSVP/replay/reflect (`src/community/events/community-events.controller.ts:54-59`, `:99-104`, `:121-126`, `:143-148`, `:165-170`).
- Scheduler race controls remain: CAS `updateMany` guards state and `canceled_at` (`src/community/events/community-events.repository.ts:143-157`), service emits only on `changed === 1` (`src/community/events/community-events.service.ts:711-727`, `:743-754`), and reminders are atomically claimed with one `UPDATE ... reminded_at IS NULL ... RETURNING` query (`src/community/events/community-events.repository.ts:203-220`).
- RSVP concurrency/count behavior remains through Prisma upsert on `(event_id,user_id)` (`src/community/events/community-events.repository.ts:170-188`) and grouped counts (`src/community/events/community-events.repository.ts:223-243`).

## Tests run

- `npx jest --runInBand test/community/events src/community/events` passed: 4 suites passed, 1 skipped; 64 tests passed, 22 skipped (`/home/user/workspace/v2_3_backend_r3_jest_events_numbered.txt:1-10`).
- `npx jest --runInBand test/community --testPathIgnorePatterns='rls-'` passed: 20 suites passed, 9 skipped; 239 tests passed, 101 skipped (`/home/user/workspace/v2_3_backend_r3_jest_community_no_rls_numbered.txt:11-35`). No full suite was run.

## Finding

### P1 — PR #389 does not cleanly merge after `main` moved to `3f271b39`

**Evidence:** `origin/main` is `3f271b3952d3c9c81e1540227c3a768c6a838a93` while PR HEAD is `a3ec919782ded8f30b7987562c27bd68a7274553` (`/home/user/workspace/v2_3_backend_r3_repo_pr_ci_numbered.txt:3-11`). A dry merge reports `CONFLICT (content): Merge conflict in src/community/community.module.ts` and leaves `UU src/community/community.module.ts` (`/home/user/workspace/v2_3_backend_r3_mergeability_actual_numbered.txt:1-4`, `:19-27`). The conflict hunk shows the PR's event module imports colliding with main's new `AckModule` import (`/home/user/workspace/v2_3_backend_r3_mergeability_actual_numbered.txt:33-49`), corresponding to PR HEAD `src/community/community.module.ts:46-51` and moved-main `origin/main:src/community/community.module.ts:46-49`.

**Impact:** The RSVP fix itself is sound and CI is green at the PR head, but the PR is not mergeable into current `main` without resolving `CommunityModule` registration. This blocks a clean merge and is a release-gate failure.

**Fix sketch:** Rebase/merge current `main` and combine both module additions: keep `AckModule` in `imports` and retain the events controller/providers/guard registrations, then rerun the same two Jest bars and CI at the new head.

VERDICT: DIRTY
