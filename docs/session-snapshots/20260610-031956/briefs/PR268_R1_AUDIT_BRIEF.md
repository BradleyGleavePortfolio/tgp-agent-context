# R1 AUDIT BRIEF — PR #268 RLS Helper Lockdown + HIBP

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #268 — "PR-RLS-01: Helper function search_path lockdown + HIBP enable"
**Head SHA:** `c9d6c14049794a98ef5ccea26cf4be28c5d47f31`
**Worktree:** `/home/user/workspace/tgp/backend-rls-268-audit` (detached at head)
**Auditor model:** GPT-5.5 (R31: GPT-5.5 for auditors)
**Verdict rubric:** CLEAN / DIRTY-MINOR (cosmetic only) / DIRTY (functional)

---

## 0. Operator priority

Operator standing instruction: **"I need RLS to be HECTACORN QUALITY — don't half-ass cybersecurity."**

Audit accordingly. This is security work; treat findings strictly. False positives are tolerable; false negatives are not.

---

## 1. Files in PR (6)

| Path | +/- |
|---|---|
| `.github/workflows/ci.yml` | +27 / 0 |
| `docs/SPEC_pr_rls_01_helper_searchpath_hibp.md` | +273 / 0 |
| `docs/SUPABASE_CONFIG.md` | +111 / 0 |
| `prisma/migrations/20260704000000_rls01_helper_searchpath_hibp/migration.sql` | +301 / 0 |
| `scripts/ci/check-relrowsecurity.sh` | +82 / 0 |
| `test/rls/helper-functions.spec.ts` | +740 / 0 |

Pure additions. No code paths modified.

---

## 2. Threat model (read the spec first)

PR fixes 5 `function_search_path_mutable` WARN findings and 1 `auth_leaked_password_protection` WARN from Supabase advisor:
1. `app.current_user_id()`
2. `app.current_user_role()`
3. `app.is_owner()`
4. `app.is_current_coach_of(text)`
5. `public.enforce_subcoach_head_cap()` (trigger fn — note: PUBLIC schema, not app)
6. HIBP toggle (dashboard, not SQL)

Attack vector: search_path shadowing. If a helper resolves unqualified names against caller's `search_path`, a malicious role with CREATE on a schema earlier in search_path can substitute a same-named function/table to return attacker-controlled values from RLS policies. Mitigation: pin `search_path` at function-create time + `SECURITY DEFINER`.

---

## 3. Audit checklist — STRICT

### 3.1 Migration SQL (`prisma/migrations/.../migration.sql`)
- [ ] Each of the 5 functions recreated with `SECURITY DEFINER` AND pinned `SET search_path = …, pg_temp`
- [ ] `pg_temp` is LAST in the search_path (or omitted only with documented rationale)
- [ ] All callers of these functions inside RLS policies still resolve correctly (i.e. function signatures unchanged)
- [ ] No `DROP FUNCTION` without exact recreation — verify return type, volatility (`STABLE`/`IMMUTABLE`), strictness preserved
- [ ] `GRANT EXECUTE` to `anon`, `authenticated`, `service_role` (or documented why each role is excluded)
- [ ] `REVOKE EXECUTE FROM PUBLIC` (default access removed)
- [ ] Migration is idempotent OR uses `CREATE OR REPLACE` (preferred) — if `DROP + CREATE`, document why
- [ ] `app.is_user_coached_by(text, text)` re-stated for grant parity (per spec §1)
- [ ] Comments at top of file cite Supabase advisor lint IDs (e.g. `0011_function_search_path_mutable`) + Postgres docs reference
- [ ] No `UPDATE`/`DELETE` against `pg_proc` directly — must use `CREATE OR REPLACE FUNCTION`

### 3.2 Test suite (`test/rls/helper-functions.spec.ts`)
- [ ] At least 1 test PER hardened function — preferably 3+ (positive, negative, shadowing attempt)
- [ ] Shadowing test: SET search_path = 'attacker_schema, public, app'; create a same-named function in attacker_schema; call hardened helper; verify hardened version still executes
- [ ] Volatility/return-type preserved tests (function metadata pinned)
- [ ] `pg_get_functiondef` snapshot tests assert exact search_path string
- [ ] Roles tested: anon, authenticated (regular user), authenticated (owner), service_role
- [ ] Tests for `enforce_subcoach_head_cap` trigger function — that trigger still fires correctly post-hardening
- [ ] Tests run against actual Supabase instance OR a docker-postgres with schema bootstrap
- [ ] No false-positive tests (e.g. test that only asserts function exists — must assert security predicate)

### 3.3 CI guard (`scripts/ci/check-relrowsecurity.sh` + workflow)
- [ ] Script enumerates all tables under target schemas
- [ ] Asserts `relrowsecurity = true` on every targeted table (not just new ones)
- [ ] Workflow `.github/workflows/ci.yml` calls the script on a real DB (or fails open with documented rationale)
- [ ] Exit code propagation correct
- [ ] No `|| true` swallowing failures

### 3.4 HIBP enable (`docs/SUPABASE_CONFIG.md`)
- [ ] Documents EXACT dashboard path to enable Leaked-Password Protection
- [ ] Documents what error users see if they pick a breached password
- [ ] Documents the test plan (manual: try 'password123' on sign-up → expect rejection)
- [ ] Includes the spec section referencing HIBP k-anonymity API

### 3.5 Spec doc (`docs/SPEC_pr_rls_01_helper_searchpath_hibp.md`)
- [ ] Threat model section is concrete (named attack scenario, not generic)
- [ ] Each function's BEFORE/AFTER documented
- [ ] Rollback plan present
- [ ] Sources cited (Supabase docs, Postgres docs)

### 3.6 Cross-cutting
- [ ] Migration applies cleanly on a fresh DB (verify via `prisma migrate diff` against `--from-empty`)
- [ ] Migration applies cleanly on a DB at the previous migration (verify ordering)
- [ ] No `prisma/schema.prisma` modification (these are existing fns, model doesn't change)
- [ ] No other code path touched (controllers, services, etc.)

---

## 4. Look for these specific HECTACORN-QUALITY failure modes

- **`search_path = ''` or `search_path = pg_catalog`** — too narrow, helper will fail to find `public.User`. Should be `public, app, pg_temp` (or equivalent).
- **Missing `pg_temp` last** — without it, a session with `CREATE` on `pg_temp` can override.
- **`SECURITY DEFINER` without pinned search_path** — half-fix; the headline issue.
- **`SECURITY INVOKER` (default) still left** — the WARN persists.
- **Trigger function `enforce_subcoach_head_cap` redefined without preserving trigger binding** — trigger detaches silently.
- **Test asserts wrong attribute** — e.g. checks function exists instead of checking `prosecdef = true` and `proconfig @> ARRAY['search_path=...']`.
- **GRANT/REVOKE asymmetry** — granting to `authenticated` without revoking from `PUBLIC` leaves the function callable by anon role unintentionally.

---

## 5. Verdict + report

Write `AUDIT_R1_PR_268_REPORT.md` at the worktree root with:
- Verdict: CLEAN / DIRTY-MINOR / DIRTY
- Findings table: ID | severity (P0/P1/P2) | file:line | description | fix recommendation
- "What's right" section (acknowledge good work)
- Test coverage assessment (per §3.2)
- Sign-off lines: name, model, timestamp

P0 = security-functional defect (e.g. shadowing attack still works). DIRTY.
P1 = security gap not yet exploitable but real (e.g. missing test). DIRTY.
P2 = cosmetic / doc only. DIRTY-MINOR.

Save report; post the verdict + top findings as a PR comment via:
`gh pr comment 268 --repo BradleyGleavePortfolio/growth-project-backend --body-file AUDIT_R1_PR_268_REPORT.md` (with `api_credentials=["github"]`).

Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`.

Return verdict, finding count by severity, report file path.
