# Rebaseline Builder — VERDICT: BLOCKED (Path A not viable)

Date: 2026-06-24
Repo: BradleyGleavePortfolio/growth-project-backend
Branch: `chore/rebaseline-migration-history` (created locally; **NOT pushed** — see below)
Base: `main` @ `be1cdb751c54a7882a59c96918e886dca19ac634`
Work dir: /home/user/workspace/gpb-rebaseline-work
Full diagnostic detail: /home/user/workspace/verdicts/rebaseline_context_audit.md

## OUTCOME
**No PR opened. No commit. No push.** The user-selected Path A
("regenerate the baseline from current schema.prisma via
`prisma migrate diff --from-empty --to-schema-datamodel`") is **provably
impossible** to make the `Forward migration applies cleanly` gate pass, and
shipping it would knowingly leave the gate red (R109 No Half-Ass). I stopped and
am surfacing the blocker per the task's explicit instruction
("If local deploy keeps failing… STOP, write the verdict… Do not flail.").

## PR URL
None — not created (see rationale).

## New baseline line count
`prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
--script` → **5205 lines** (contains SubCoachInvite, token_hash,
revenue_sharing_changed, 168 CreateTable). **But it does not apply.**

## Local `prisma migrate deploy` smoke test — FINAL OUTPUT (the deciding evidence)

### (a) Full-schema baseline alone fails on the FIRST migration (the baseline itself):
```
Applying migration `00000000000000_baseline`
Error: P3018
Migration name: 00000000000000_baseline
Database error code: 42804
Database error:
ERROR: foreign key constraint "community_voice_notes_author_id_fkey" cannot be implemented
DETAIL: Key columns "author_id" of the referencing table and "id" of the referenced
        table are of incompatible types: uuid and text.
```
Applying the generated baseline standalone (psql, ON_ERROR_STOP=0) → **14
uuid→text FK errors**, all in the `community_*` subsystem. Cause: schema.prisma
declares community FK columns as `@db.Uuid` but `User.id` is `String` without
`@db.Uuid` (i.e. `TEXT`). Illegal uuid→text FK on any Postgres version.

### (b) Original (current) baseline reproduces the reported gate failure:
```
Applying migration `00000000000000_baseline`
Applying migration `20250724120000_subcoach_invite_token_hash`
Error: P3018 ... 42P01 ERROR: relation "SubCoachInvite" does not exist
```
`SubCoachInvite` is created in `20260604000000` but ALTERed by `20250724120000`
(misdated ~10 months too early). Ordering bug, not just a baseline gap.

### (c) Even ignoring the baseline, the chain needs a Supabase env the CI never provides:
With original baseline + the 2 misdated migrations neutralized:
```
Applying migration `20260508000001_rls_workout_builder`
Error: P3018 ... 3F000 ERROR: schema "auth" does not exist
```
10 migrations need `auth`/`auth.uid()`; 29 need `service_role`/`authenticated`/
`anon` roles; **nothing in the repo creates them.** The CI `forward-only` job runs
bare `postgres:15.18` with no bootstrap (confirmed from PR #427 job log).

### (d) With a minimal Supabase bootstrap, a further content defect surfaces (~migration #90):
```
Applying migration `20260702000000_fix_workout_rls_coach_role`
Error: P3018 ... 22P02 ERROR: invalid input value for enum "Role": "sub_coach"
```

## R3 identity check
N/A — no commits were created (nothing to push, nothing to verify). Git config was
never mutated. Working tree confirmed clean (all diagnostic edits reverted; baseline
back to 378 lines; both early migrations restored).

## All commit SHAs
None. (Base HEAD: be1cdb751c54a7882a59c96918e886dca19ac634.)

## WHY PATH A CANNOT WORK (summary)
The `Forward migration applies cleanly` gate requires the ENTIRE chain (baseline +
155 migrations) to apply on a vanilla Postgres and then match schema.prisma. The
chain has **four independent blockers**, only the FIRST of which a baseline rewrite
touches:
1. **schema.prisma is internally inconsistent** → a from-empty baseline is invalid
   DDL (14 uuid→text community FKs). So `migrate diff --from-empty` output won't
   even apply. Fixing requires editing schema.prisma (FORBIDDEN by task) and/or the
   committed community migrations (FORBIDDEN).
2. **Two misdated early migrations** (`20250724120000`, `20250724120001`) run before
   the tables/enums they touch exist. A full-schema baseline would instead collide
   with them (re-adding token_hash / enum value). Fixing requires reordering/editing
   committed migrations (FORBIDDEN).
3. **Supabase environment dependency** (auth schema, service_role/authenticated/anon
   roles) absent in the CI gate. Fixing requires editing the workflow to bootstrap
   Supabase, or editing ~39 committed migrations.
4. **Role-enum ordering defect** (`sub_coach` used before added) and likely more
   past migration #90.

A baseline rewrite addresses none of #2–#4 and actively breaks on #1.

## RECOMMENDED NEXT STEPS (for parent / operator decision)
The real problem is a **broken, environment-coupled migration chain**, not just a
stale baseline. Viable directions, all of which exceed "rewrite the baseline" and
need an explicit policy decision:

- **Option B — Fix the CI gate environment + minimal ordering fixes.** Add a
  Supabase-bootstrap step to `migration-dry-run.yml` (create `auth` schema, stub
  `auth.uid()`, create service_role/authenticated/anon roles before
  `migrate deploy`). Then fix the genuine ordering/content defects: move the two
  misdated `20250724*` migrations to a correct post-dependency timestamp (or convert
  them to idempotent IF NOT EXISTS guards), and fix the `Role`-enum ordering. This
  keeps the chain replayable and is the most honest fix, but it edits committed
  migrations + the workflow (needs operator sign-off; the gate also forbids deleting
  migrations).

- **Option C — True Prisma squash re-baseline.** Squash ALL current migrations into
  ONE new baseline generated from a **known-good live/staging DB** (not from the
  inconsistent schema.prisma — `migrate diff --from-url <staging> --script` would
  capture the real uuid/text reality if prod's `User.id` is actually uuid), then
  retire the 155 old migration directories and `migrate resolve --applied` the new
  baseline in every environment. This is the canonical "squash" workflow, but the
  gate's R106 forbids deleting committed migrations without explicit operator
  approval, and it requires access to a clean reference DB.

- **Resolve the schema.prisma uuid/text contradiction first.** Whichever path is
  taken, the community subsystem's `@db.Uuid` FKs to a `TEXT` `User.id` must be
  reconciled (either `User.id` becomes `@db.Uuid` with a data migration, or the
  community columns become text). Until then NO from-scratch generation can apply.

All three need a human decision because they touch protected/forbidden surfaces
(schema.prisma, committed migrations, the CI workflow).

VERDICT WRITTEN TO /home/user/workspace/verdicts/rebaseline_builder_summary.md
