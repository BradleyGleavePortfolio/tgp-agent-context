# PR #268 FIXER RESULT — RLS Helper Lockdown + HIBP

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #268 — PR-RLS-01: Helper function search_path lockdown + HIBP enable
**PR branch:** `feat/rls-01-helper-searchpath-hibp`
**New head SHA:** `1a15dbf7331fb1b10c077b14b88ae0daef7c0a1d`
**Base:** `6c4f618c` (current `main`) — PR reports **mergeable: true**
**Author of all fix commits:** `Dynasia G <dynasia@trygrowthproject.com>`
**Fixer model:** Opus 4.8
**Status:** All 4 P1 + 1 P2 fixed. Ready for R2.

---

## Rebase notes (anti-rebase trap)

PR #268's branch and `main` have **completely unrelated git histories** (different root commits, no merge base). A plain `git rebase origin/main` tried to replay 267 commits including an "Initial commit" with add/add conflicts across the entire `src/` tree — not viable.

**Resolution:** cherry-picked only the PR's own 10 commits (`4e183312..c9d6c140`, the RLS spec/helpers/tests/ci/docs) onto a fresh branch off current `main`. The cherry-pick was clean — the only file existing on both sides, `.github/workflows/ci.yml`, auto-merged (kept both the PR's CI additions and main's env-var block from #267/#374/#375/#376). The 5 net-new files are byte-identical to the original PR. Then the 5 fix commits were applied on top.

No unexpected conflicts. No file outside the allowed surface was touched.

---

## Findings fixed

### R1-P1-001 (P1) — pg_temp missing from all 5 hardened helpers — FIXED
`prisma/migrations/20260704000000_rls01_helper_searchpath_hibp/migration.sql` lines 58/87/116/146/200 (now shifted by the header-comment edit).

| Helper | Before | After |
|---|---|---|
| `app.current_user_id()` | `SET search_path = pg_catalog, public, app` | `SET search_path = pg_catalog, public, app, pg_temp` |
| `app.current_user_role()` | `… pg_catalog, public, app` | `… pg_catalog, public, app, pg_temp` |
| `app.is_owner()` | `… pg_catalog, public, app` | `… pg_catalog, public, app, pg_temp` |
| `app.is_current_coach_of(text)` | `… pg_catalog, public, app` | `… pg_catalog, public, app, pg_temp` |
| `public.enforce_subcoach_head_cap()` | `… pg_catalog, public, app` | `… pg_catalog, public, app, pg_temp` |

`pg_temp` is pinned **last** on every helper. The migration header comment and `docs/SPEC_pr_rls_01_helper_searchpath_hibp.md` now document the rationale (pg_temp is searched implicitly-first if unnamed; naming it last forces `public`/`app` to win, protecting the unqualified `"TeamSubCoachAssignment"` reference in the trigger body). The rollback block at the bottom of the migration is intentionally left without `SET search_path` — it restores the pre-PR (un-hardened) state.

### R1-P1-002 (P1) — live RLS suite skipped in CI — FIXED
New `rls-live-tests` job in `.github/workflows/ci.yml`:
- Postgres 15 service container with healthcheck.
- `scripts/ci/supabase-shim.sql` — creates `anon`/`authenticated`/`service_role` roles + `auth` schema with `auth.uid()`/`auth.role()`/`auth.jwt()` (cited Supabase roles + RLS docs). CI-only.
- `scripts/ci/rls01-live-bootstrap.sql` — materializes `User`, `TeamSubCoachAssignment`, and the `app.is_user_coached_by` dependency helper.
- Applies **this PR's migration verbatim** (so the suite asserts real migration output), then binds the head-cap trigger.
- `TEST_DATABASE_URL` exported; suite **hard-fails** if DB unreachable (no silent skip).
- Targets the exact spec path `test/rls/helper-functions.spec.ts` (`jest test/rls` is a regex that would also pull in the `test/rls-tier*.spec.ts` policy suites, which need the full schema).
- `build-and-test` and `rls-floor-guard` jobs unchanged.

**Why not `prisma migrate deploy` over the full chain (discovered blocker):** the full migration history is **not deployable from empty** on this repo — a pre-existing, out-of-scope defect: `20250724120000_subcoach_invite_token_hash` hard-ALTERs `SubCoachInvite`, but the table is only CREATEd in `20260604000000_add_team_profile_and_sub_coach_invite` (a later timestamp). `prisma db push` from empty also fails (unrelated FK type mismatch in `community_workspaces`). Fixing global migration history is outside PR-RLS-01's scope and allowed file surface, so the job uses the scoped bootstrap above. This is documented inline in the workflow and in `rls01-live-bootstrap.sql`.

### R1-P1-003 (P1) — narrow shadowing coverage — FIXED
`test/rls/helper-functions.spec.ts`:
- Attacker-schema (`rls01_attacker`) **same-name decoys for all 5 helpers** plus `current_setting` and `is_user_coached_by`. Each hardened helper is invoked under `SET search_path = rls01_attacker, public, app`; the hardened version still produces the correct value (decoys return attacker-controlled values / forced `true`, which must NOT leak through).
- **pg_temp relation-shadow test** for `public.enforce_subcoach_head_cap()`: plants an empty `pg_temp."TeamSubCoachAssignment"`, sets the caller path to `pg_temp, public, app`, then attempts a 3rd active assignment. The cap still fires (`sub_coach_head_cap_exceeded`), proving resolution hit `public."TeamSubCoachAssignment"`, not the temp decoy — i.e. pg_temp-last positioning matters.

### R1-P1-004 (P1) — metadata assertions too loose — FIXED
`test/rls/helper-functions.spec.ts`:
- Live metadata test: for each helper, exactly one `search_path=` entry in `proconfig`, equal verbatim to `pg_catalog, public, app, pg_temp`; `pg_temp` asserted as the **last** element and present exactly once.
- New `pg_get_functiondef()` test: normalizes Postgres's per-element quoting (`'pg_catalog', 'public', 'app', 'pg_temp'`) and asserts the ordered clause with pg_temp last, plus a negative guard that the app-terminated (no-pg_temp) form is absent, plus `SECURITY DEFINER`.
- Static test: matches the exact `SET search_path = pg_catalog, public, app, pg_temp` ×5 and asserts **zero** clauses match the app-terminated-without-pg_temp form.
- **Negative verification:** injecting the buggy (no-pg_temp) helper into the live DB made both metadata assertions fail — confirming they are not vacuous.

### R1-P2-001 (P2) — doc path typo — FIXED
`docs/SUPABASE_CONFIG.md`: migration path `20260525000000_…` → `20260704000000_…`. Also corrected the post-deploy "expected `config`" string in the same doc to `search_path=pg_catalog, public, app, pg_temp` (pg_temp last).

---

## Gate results

| Gate | Result |
|---|---|
| `prisma migrate diff --from-empty --to-schema-datamodel … --script` | additions only — no `DROP` statements |
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run lint` (`eslint src/**/*.ts`) | 0 errors (17 pre-existing warnings, none in changed files) |
| `eslint test/rls/helper-functions.spec.ts` | 0 problems |
| Static RLS tests (no DB) | 2 passed, 29 skipped (live block correctly skips without TEST_DATABASE_URL) |
| **Live RLS suite (real Postgres 15, exact CI bootstrap sequence)** | **31/31 passed** |
| ci.yml YAML validity | valid |

Live suite was run locally against a real Postgres 15 instance using the identical CI bootstrap sequence (shim → bootstrap → PR migration → trigger), confirming the new `rls-live-tests` job will be green.

---

## Commits applied (on top of the 10 cherry-picked PR commits)

```
1a15dbf7 test(rls-01): per-helper shadowing decoys + pg_temp relation-shadow + exact search_path assertions
e00f3170 ci(rls-01): provision postgres service for live RLS regression tests
5b77f4a9 docs(rls-01): correct migration path reference in SUPABASE_CONFIG
152959aa fix(rls-01): pin pg_temp last in search_path for all 5 hardened helpers
```
(The P1-003 and P1-004 test changes are bundled in one commit since they edit the same `helper-functions.spec.ts` regions.)

## Files touched by fix commits (all within allowed surface)
- `prisma/migrations/20260704000000_rls01_helper_searchpath_hibp/migration.sql`
- `docs/SPEC_pr_rls_01_helper_searchpath_hibp.md`
- `docs/SUPABASE_CONFIG.md`
- `.github/workflows/ci.yml`
- `test/rls/helper-functions.spec.ts`
- `scripts/ci/supabase-shim.sql` (new)
- `scripts/ci/rls01-live-bootstrap.sql` (new)

## PR comment
Posted via `gh api`: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/268#issuecomment-4665174594

## Deliverables
1. PR #268 updated in place (head `1a15dbf7`, rebased onto `main`, mergeable). ✅
2. This result file. ✅
3. PR comment summarizing fixes. ✅
