# migration_chain_fixer — VERDICT: BLOCKED (gate cannot go green without forbidden edits)

Date: 2026-06-24
Repo: BradleyGleavePortfolio/growth-project-backend
Branch: `chore/migration-chain-repair` (created locally; **NOT pushed, no PR opened** — see Decision)
Base: `main` @ `be1cdb751c54a7882a59c96918e886dca19ac634`
Work dir: /home/user/workspace/gpb-fixer-work (all artifacts preserved here)
Local Postgres: PostgreSQL 18.3 on port 54399. Docker is NOT available in this
sandbox, so I could not run the exact `postgres:15.18` image. The defects found
below are **DDL-type / transaction / ordering errors that are version-independent**
(the prior diagnostic audit reached the same conclusion and the same failure points
on PG 18.3); none of them depend on the PG 15 vs 18 difference.

## OUTCOME
The user-authorized Option 1 (bootstrap Supabase env in CI + renumber misdated
migrations + fix Role enum ordering) is **necessary but NOT sufficient** to make the
`Forward migration applies cleanly` gate pass. After implementing the two clean,
fully-authorized fixes (Supabase bootstrap + renumbering the 2 misdated migrations)
and verifying them locally, the full-chain replay surfaced **three further blockers**,
each of which independently keeps the gate red and **each of which can only be fixed by
editing `prisma/schema.prisma` or by editing committed migration CONTENT — both
explicitly forbidden by the task**. The decisive one is the deferred uuid/text mismatch.

Per the task's CRITICAL FAILURE MODES ("If you discover the uuid/text mismatch breaks
the chain … STOP and surface", "Do NOT open the PR if local `migrate deploy` doesn't
succeed end-to-end", R109 No Half-Ass, "do not flail"), I stopped, did not open the PR,
and am surfacing a complete, verified defect inventory for an operator decision.

## PR URL
None — not created. Local `prisma migrate deploy` does not succeed end-to-end (blocks
at migration #112 of 153 on a forbidden-to-fix defect), so opening the PR would
knowingly leave the gate red. Branch was intentionally NOT pushed (no green PR is
possible; the partial fixes are fully preserved in the work dir for the parent).

## All commit SHAs
None. Nothing was committed (working tree holds the staged renames + the workflow edit
+ the new bootstrap file, all listed below). Base HEAD unchanged: be1cdb75.

## R3 identity check
N/A — no commits were created, so there is nothing to verify or push. Git config was
never mutated.

## WHAT I IMPLEMENTED AND VERIFIED (the two clean, authorized fixes — both correct)

### Fix A — Supabase-equivalent bootstrap (Phase 2): WORKS
- New file `prisma/migrations/_supabase_bootstrap.sql` (idempotent): creates `auth`
  schema, a `auth.uid() RETURNS uuid STABLE` stub returning NULL, and the
  `service_role` (NOLOGIN BYPASSRLS), `authenticated`, `anon` roles in guarded DO blocks.
  - Audited actual usage first: only `auth.uid()` is used (no `auth.jwt()`/`auth.role()`).
    Roles used: `service_role` (29 files), `authenticated` (24), `anon` (22). The other
    `TO <x>` greps (head_count/validator/caps/bounds/accepts) are false positives —
    PL/pgSQL `INTO head_count` and comment prose, NOT roles. So only those 3 roles needed.
- Verified Prisma IGNORES the file: `prisma migrate status` still reports "153 migrations
  found" and the file is not listed (leading `_`, and it is a file not a directory).
- Edited `.github/workflows/migration-dry-run.yml` (forward-only job): added an
  "Ensure postgresql-client is available" step and a "Bootstrap Supabase-equivalent
  environment (CI only)" step BEFORE the apply step. The bootstrap step strips the
  `?schema=public` query param (`${DATABASE_URL%%\?*}`) because `psql` rejects it as a
  libpq URI parameter (I hit this exact error locally).
- Verified locally: with the bootstrap applied, the chain sailed past
  `20260508000001_rls_workout_builder` (previously failed `schema "auth" does not exist`)
  and through all ~29 role-referencing migrations without an env error.

### Fix B — Renumber the 2 misdated migrations (Phase 3): WORKS
Both confirmed misdated by reading the SQL + their dependency-providing migrations:
- `20250724120000_subcoach_invite_token_hash` ALTERs `SubCoachInvite`, which is CREATEd
  at `20260604000000_add_team_profile_and_sub_coach_invite` (line 36). Renamed via
  `git mv` → **`20260604000001_subcoach_invite_token_hash`** (slot was free; runs right
  after its dependency). History preserved (git shows `R`, 0 content lines changed).
- `20250724120001_team_audit_revenue_sharing_changed` does `ALTER TYPE
  "TeamAuditEventKind" ADD VALUE`; the enum is CREATEd at `20260510000000_add_team_mode`
  (line 43). Renamed via `git mv` → **`20260510000001_team_audit_revenue_sharing_changed`**
  (slot free; note `20260510000000` is shared by `_add_team_mode` and
  `_add_ai_gateway_audit_and_drafts`, but `…0001` was unused). History preserved.
- Verified locally: with these renames, the original reproduction
  (`relation "SubCoachInvite" does not exist` at migration #2) is GONE; the chain ran
  cleanly through migration #88 (`20260621000000_fix_workout_rls_policies`).

## THE THREE BLOCKERS (each independently keeps the gate red; verified locally)

### BLOCKER 1 — Role enum `sub_coach` is used but is NOT in schema.prisma (CANNOT fix within constraints)
- Failure (reproduced): `20260702000000_fix_workout_rls_coach_role` →
  `ERROR: invalid input value for enum "Role": "sub_coach"` (SQLSTATE 22P02). The
  migration does `u."role" IN ('coach', 'owner', 'sub_coach')`; `User.role` is the `Role`
  enum, so Postgres coerces the literal `'sub_coach'` to `Role` at parse time and fails.
- Grep findings: `Role` enum is CREATEd in baseline as `('coach','student')`; the ONLY
  `ALTER TYPE "Role" ADD VALUE` in the whole repo is `20260427000000` adding `'owner'`.
  **No migration ever adds `sub_coach` to `Role`.** All other `sub_coach` hits are
  unrelated: `sub_coach_id` columns, `TeamAuditEventKind` values like
  `'sub_coach_assigned'`, and a text CHECK `brief_mode IN ('solo_coach','head_coach','sub_coach')`.
  `20260702000000` is the single place `'sub_coach'` is compared against the `Role` enum.
- **Why I cannot fix it as the task's Phase 4 assumed:** Phase 4 said "if `sub_coach`
  exists in `Role` enum only in schema.prisma, CREATE a migration to add it." But
  `schema.prisma`'s `Role` enum is `{ coach, student, owner }` — **`sub_coach` is NOT in
  schema.prisma at all** (verified: lines 30–34). If I add `sub_coach` to the DB enum via
  a new migration, the gate's final step
  `prisma migrate diff --from-url --to-schema-datamodel prisma/schema.prisma --exit-code`
  will detect drift (DB has a `Role` value schema.prisma lacks) and FAIL. The only ways to
  resolve are: (a) add `sub_coach` to `schema.prisma`'s `Role` enum (FORBIDDEN — no
  schema.prisma edits), or (b) edit `20260702000000`'s content to not compare against the
  enum (FORBIDDEN — no migration content edits). Either is required; both are off-limits.

### BLOCKER 2 — `CREATE INDEX CONCURRENTLY` inside the `COMMIT;/BEGIN;` bookend pattern fails on Prisma 6.19 (CONTENT defect, FORBIDDEN to fix)
- Failures (reproduced, twice): `20260704000001_coach_brief_cwa_index_concurrent` and
  `20261207000000_pr14_client_purchase_landing_page_id_and_guest_subscription` →
  `ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block` (SQLSTATE 25001).
  Both wrap the concurrent build in `COMMIT; … CREATE INDEX CONCURRENTLY …; BEGIN;`.
- Root cause proven with an isolated 2-migration probe on empty DBs:
  - Test A — a BARE `CREATE INDEX CONCURRENTLY` (no COMMIT/BEGIN): **APPLIES CLEANLY.**
    Prisma 6.19's migration engine does NOT wrap a migration file in a transaction, so the
    statement runs at top level as required.
  - Test B — the repo's `COMMIT; …CONCURRENTLY…; BEGIN;` pattern: **FAILS with the exact
    25001 error.** The trailing `BEGIN;` (and the engine's session handling after the
    embedded `COMMIT`) puts the CONCURRENTLY back inside a transaction.
- So the migrations were written for an OLDER Prisma that wrapped each file in a tx; under
  Prisma 6.19 (the repo's pinned version) the bookends are not just unnecessary, they
  actively break the apply. The fix is to DELETE the `COMMIT;` and `BEGIN;` lines from
  both migration.sql files — i.e. **editing committed migration CONTENT, FORBIDDEN.**
- Secondary issue even if it applied: `20260704000001` names its index
  `ClientWorkoutAssignment_assigned_by_coach_id_approved_by_coa_idx`, which Postgres
  truncates to 63 chars (`…_approved_by_coa_id`, dropping the `x`), whereas Prisma's
  `@@index([assigned_by_coach_id, approved_by_coach_at])` (schema.prisma line 2348) expects
  the `…_idx` name — a latent `migrate diff` drift that would also need a content change.

### BLOCKER 3 — uuid → text foreign keys (the EXPLICITLY DEFERRED uuid/text mismatch) (FORBIDDEN to fix)
- Failure (reproduced): `20261212000000_community_v1_1_schema` →
  `ERROR: foreign key constraint "community_workspaces_coach_id_fkey" cannot be
  implemented … Key columns "coach_id" … and "id" … are of incompatible types: uuid and text`
  (SQLSTATE 42804).
- Verified types: baseline creates `"User"."id" TEXT` (line 33); the live DB column is
  `text`; `community_v1_1_schema` declares `community_workspaces.coach_id UUID` with an FK
  to `User(id)`. uuid → text FK is illegal DDL on every Postgres version. schema.prisma
  has `User.id String @default(uuid())` with NO `@db.Uuid` (line 155), i.e. TEXT — so the
  schema and the community migrations disagree about User.id's type.
- This is the SAME uuid/text contradiction the prior audit flagged (its Finding 2) and the
  task EXPLICITLY DEFERRED and FORBADE fixing ("NOT authorized: … fixing the uuid/text
  mismatch (separate concern, deferred)"; CRITICAL FAILURE MODE: "If you discover the
  uuid/text mismatch breaks the chain … STOP and surface. Do not 'fix' schema.prisma").
- The task hypothesized prod's `User.id` "is likely actually uuid in DB despite
  schema.prisma saying TEXT," which would explain why prod runs the chain. But the GATE
  replays the **baseline** on a fresh DB, and the baseline hard-codes `User.id TEXT`. So in
  CI `User.id` is ALWAYS text and the community uuid FKs ALWAYS fail — regardless of prod's
  real column type. Making the gate green therefore requires either changing the baseline /
  community migrations' content, or changing schema.prisma + User.id's type with a data
  migration. All forbidden. This community uuid pattern recurs across multiple migrations
  (`20261216000200`, `20261217000000`, `20261219000000`, …), not just the first one.

## DEFECT INVENTORY (every defect found, and disposition)
| # | Migration | Defect | Authorized fix? | Status |
|---|-----------|--------|-----------------|--------|
| 1 | 20250724120000 → 20260604000001 | Misdated: ALTERs SubCoachInvite before it exists | YES (renumber) | FIXED (git mv) |
| 2 | 20250724120001 → 20260510000001 | Misdated: ALTER TYPE TeamAuditEventKind before it exists | YES (renumber) | FIXED (git mv) |
| 3 | (env, ~10+29 migrations) | Bare PG lacks auth schema / auth.uid() / supabase roles | YES (CI bootstrap) | FIXED (bootstrap + workflow) |
| 4 | 20260702000000_fix_workout_rls_coach_role | `Role` enum value `sub_coach` used but never added AND not in schema.prisma | NO (needs schema.prisma OR content edit) | BLOCKED |
| 5 | 20260704000001_coach_brief_cwa_index_concurrent | CONCURRENTLY in tx via COMMIT/BEGIN bookend — fails on Prisma 6.19 | NO (needs content edit) | BLOCKED |
| 6 | 20261207000000_pr14_…guest_subscription | Same CONCURRENTLY/COMMIT/BEGIN content defect | NO (needs content edit) | BLOCKED |
| 7 | 20261212000000_community_v1_1_schema (+ later community migs) | uuid → text FK to User.id (the DEFERRED uuid/text mismatch) | NO (explicitly deferred/forbidden) | BLOCKED |

Note: I validated the chain cleanly through `20261211000001` (manually bridging blockers
4–6 with `migrate resolve` / `psql -1` purely for DISCOVERY) before hitting blocker 7.
**32 migrations at/after `20261212000000` remain UN-validated** because blocker 7 (and the
recurring community uuid FKs) cannot be passed without forbidden edits; there may be
additional defects hidden behind them.

## Local `prisma migrate deploy` — FINAL OUTPUT (the deciding evidence)
```
# Clean reproduction (no bootstrap):
Applying migration `00000000000000_baseline`
Applying migration `20250724120000_subcoach_invite_token_hash`
Error: P3018 ... 42P01 ERROR: relation "SubCoachInvite" does not exist   # (pre-fix)

# After Fix A (bootstrap) + Fix B (renames):
... reached 20260702000000_fix_workout_rls_coach_role
Error: P3018 ... 22P02 ERROR: invalid input value for enum "Role": "sub_coach"   # BLOCKER 1

# bridged enum for discovery → next:
Error: P3018 ... 25001 ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
  (20260704000001_coach_brief_cwa_index_concurrent)                       # BLOCKER 2

# bridged → next:
Error: P3018 ... 25001 ... (20261207000000_pr14_…)                        # BLOCKER 2 (again)

# bridged → next, migration #112 of 153:
Applying migration `20261212000000_community_v1_1_schema`
Error: P3018 ... 42804 ERROR: foreign key constraint "community_workspaces_coach_id_fkey"
  cannot be implemented ... incompatible types: uuid and text             # BLOCKER 3 (DEFERRED)
```
`prisma migrate deploy` does NOT succeed end-to-end → the gate cannot be green.

## `prisma migrate diff --from-url --to-schema-datamodel --exit-code` exit code
NOT RUN to a meaningful value — it only matters once `migrate deploy` succeeds end-to-end,
which it does not. (Independently, BLOCKER 1's enum fix would itself FAIL this check via
drift, and BLOCKER 2's truncated index name would too.)

## Decision: why no commit / push / PR
- The PR's whole purpose is to turn the `Forward migration applies cleanly` gate green.
  It provably cannot be green without editing `schema.prisma` and/or migration content,
  both forbidden. Shipping anyway = knowingly-red gate = R109 No Half-Ass violation and a
  direct violation of "Do NOT open the PR if local `migrate deploy` doesn't succeed
  end-to-end."
- I did NOT push a branch either: a pushed branch with no openable PR would be misleading
  dead weight on the remote. All verified work is preserved in the work dir instead
  (parent can resume from there or instruct me to push):
  - `gpb-fixer-work/prisma/migrations/_supabase_bootstrap.sql` (new, ready)
  - `gpb-fixer-work/.github/workflows/migration-dry-run.yml` (edited: psql install +
    bootstrap step, ready)
  - Staged renames (git mv, history preserved):
    - `20250724120000_subcoach_invite_token_hash` → `20260604000001_subcoach_invite_token_hash`
    - `20250724120001_team_audit_revenue_sharing_changed` → `20260510000001_team_audit_revenue_sharing_changed`
  - schema.prisma: UNTOUCHED (verified). No migration CONTENT changed (verified: renames
    show 0 insertions/0 deletions).

## Files renamed (old → new)
- prisma/migrations/20250724120000_subcoach_invite_token_hash → prisma/migrations/20260604000001_subcoach_invite_token_hash
- prisma/migrations/20250724120001_team_audit_revenue_sharing_changed → prisma/migrations/20260510000001_team_audit_revenue_sharing_changed

## New fixer migrations created
None. (Blocker 1's `sub_coach` add was deliberately NOT created as a migration because it
would cause `migrate diff` drift against schema.prisma — see Blocker 1.)

## Production runbook
NOT written. A runbook for renaming-only would be premature/misleading while the chain
still cannot apply. The renumbering's prod implication is captured here for the parent:
production's `_prisma_migrations` table has rows for the OLD names
(`20250724120000_subcoach_invite_token_hash`, `20250724120001_team_audit_revenue_sharing_changed`);
if/when these renames ship, prod needs, per each pair,
`npx prisma migrate resolve --rolled-back <old>` then `--applied <new>` (metadata-only, does
NOT re-run SQL). See https://www.prisma.io/docs/cli/migrate/resolve.

## RECOMMENDED NEXT STEPS (need an operator/policy decision — all touch forbidden surfaces)
1. **Blocker 3 (uuid/text) must be resolved first** — it is the true root and recurs across
   the community subsystem. Either (a) make `User.id` `@db.Uuid` in schema.prisma + a data
   migration to cast existing text ids to uuid, or (b) make the community `*_id @db.Uuid`
   columns text. Both edit schema.prisma and/or committed migrations. Until decided, NO
   from-baseline replay can complete, so the gate cannot pass by any means.
2. **Blocker 1 (Role.sub_coach):** decide whether `sub_coach` is a real `Role`. If yes,
   add it to schema.prisma's `Role` enum AND a new `ALTER TYPE "Role" ADD VALUE 'sub_coach'`
   migration placed before `20260702000000` (e.g. `20260701235900_add_sub_coach_role_value`,
   marked `-- IRREVERSIBLE:` since PG<17 can't DROP an enum value). If no, the comparison in
   `20260702000000` should be rewritten — but both options need an authorized schema.prisma
   or migration-content edit.
3. **Blocker 2 (CONCURRENTLY):** delete the `COMMIT;`/`BEGIN;` bookends from
   `20260704000001` and `20261207000000` (Prisma 6.19 runs migration files outside a tx, so
   a bare `CREATE INDEX CONCURRENTLY` applies cleanly — proven by my isolated probe). Also
   align `20260704000001`'s index name with schema.prisma's expected `…_idx` name. Both are
   migration-content edits.
4. Re-authorize editing schema.prisma + committed migration content (the current task
   forbids both), then re-run this exact plan; Fix A + Fix B already in the work dir will
   carry forward unchanged.

VERDICT WRITTEN TO /home/user/workspace/verdicts/migration_chain_fixer_summary.md
