# B-EXPORT-3 (agent 112) — account deletion #608, data export #636, mobile #327

Builder: Claude Opus 5.5 (T4). Nothing was merged or dispatched, and production was not touched. I pushed only to the three PR head branches, using merge commits (no rebase, no force). No package.json or lock changes. Evidence logs are in `/home/user/workspace/ops/bexport3-112/`.

## Heads
| PR | Branch | Base | Final head |
|---|---|---|---|
| backend #608 | agent/clinic/deletion-be/7c1d2e9a | main | `bdadfcb47aa1cabdc5d68a15592e514c1614544a` |
| backend #636 (stacked) | agent/clinic/data-export-storage-be/b110 | #608 branch | `608985cf35af131545a7d4cac03a81d1e9e669b8` |
| mobile #327 | agent/clinic/data-export-download-mob/b110 | main | `395c3312eb49b9c54d6feb94b6d8cc4f5f393c47` |

## Finding dispositions
**#608**
- The Opus #635 audit found two recipe problems: a deleted creator's recipes were left behind, and a saved bookmark blocked deletion. Both are fixed in e4e7a44d (`recipe-erasure.spec.ts`; 3 of 5 failed before).
- Operator 12:48 asked for #609's tables. They are erased through the table-existence-guarded `OPTIONAL_USER_TABLES` step, inside the finalization transaction:
  - `CoachWelcomeMessageJob` client_id and coach_id
  - `CoachWelcomeMessageSetting` coach_id (rows deleted; updated_by detached)
  - `WorkoutReminderDelivery` client_id
  - #607's `ClinicProgramSet` coach_id
  
  This works on #608 alone, and nothing has to change when #609 merges. The coverage spec passes 7/7 against the merged #608+#609 schema (bdadfcb4). `engagement-tables-erasure.spec.ts`: 4 of 5 failed before.
- google_session re-auth for deletion works on this branch. Main's DTO lacks it, so production answers 400 until #608 deploys. New test: `auth-recent-auth-google-session-deletion.spec.ts`.
- Roman erasure on deletion is kept.
- C-608-9 is disclosed in the PR.
- B-608-12 closes when #636 is composed into #608. The same composition supersedes C-608-8 and C-608-10.
- **Open:** C-608-2, admin force-delete without recent-auth. This is an operator decision; the recommended default is to defer to 1.0.1.
- **Open:** C-608-7, unkeyed receipt digest. Recommended for 1.0.1.

**#636**
- Fixed in 1cffecf9, each with a failing-before test (13 failed before): B-636-5, B-636-6, C-636-2 (recipes, live Roman chats, AI consent ledger; operator 12:33), C-636-3, C-636-4 and C-636-5.
- C-636-6: the PR body now gives a `BEGIN; <verbatim DO block>; ROLLBACK;` pre-check, run as the `DIRECT_URL` role.

**#327**
- B-327-2 remainder: an identity change on the mounted screen now resets the screen and loads the new account's status.
- C-327-2: the scrub now works on a copy and is bounded; transactions are scrubbed too.
- Inventory copy is aligned, and the "complete copy of all" claim is removed.
- All in d5add42 and 395c3312 (7 tests failed before).

## Tests (heavy.sh, --runInBand; local tsc skipped per OFFLOAD TO CI)
- #608: 6 suites, 38/38 (608-jest-r6c.log), then 4 suites, 30/30 (608-jest-r6d.log). The coverage spec with the #609 schema: 7/7.
- #636 at 608985cf: 19 suites, 228/228 (636-jest-r2-final.log).
- #327: 4 suites, 85/85 (327-after.log), then 51/51 at 395c3312 (327-after2.log).
- eslint, prettier and check-r75 are clean.

## CI at the final heads (13:41, all green)
- #327: all green (Typecheck, lint, test; CodeQL).
- #608: every check passes, including build-and-test (full tsc and suites) and the main-only checks (CodeQL, banned casts, sbom, danger). deploy-readiness-gate is skipped, as expected.
- #636: every check passes, including build-and-test. As a stacked PR, it does not run the main-only checks (CodeQL, banned casts, sbom, danger).

## Open risks
- SECURITY DEFINER functions are not catalog-checked.
- down.sql's `DELETE storage.buckets` may be refused on Supabase.
- The dead legacy `assembleExport` lacks the new keys.
- Hosted Supabase may refuse `CREATE POLICY` on storage.objects; the C-636-6 pre-check catches this.
- The mobile copy is only true once #636 is deployed.

## HANDOFF FOR AGENT 113
- **PRs and heads:** #608 `bdadfcb4`; #636 `608985cf`; mobile #327 `395c3312`. All bodies have their fix-round tables, and fix-round comments are posted (608 #issuecomment-5960985444, 636 #issuecomment-5960985711, 327 #issuecomment-5960986117).
- **CI:** green on all three heads. deploy-readiness-gate is skipped on #608 and #636, as expected.
- **Closed:** all findings listed above except C-608-2 (operator decision) and C-608-7 (1.0.1).
- **NOT STARTED:** none. Every assigned item was started and finished.
- **WIP branches:** none.
- **Next steps:**
  1. Request a dual audit of #636 at 608985cf.
  2. The operator merges #636 into #608's branch.
  3. Request a dual delta audit of #608 (4e926b35..combined head). The main-only checks must be green at that head.
  4. Merge #608.
  5. Re-audit #327 at 395c3312, then merge it after #608/#636 deploy.
  6. Before deploying, run the C-636-6 pre-check against production.
- **Worktrees:** removed (bexport3-608, bexport3-636, bexport3-327).
