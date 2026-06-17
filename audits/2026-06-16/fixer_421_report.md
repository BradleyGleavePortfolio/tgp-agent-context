# Fixer Report — PR #421 (W1.5-A4: reusable RLS live-DB test harness)

**Branch:** `feat/w1.5-a4-rls-live-db-harness`
**Base:** `wave-1-5-planning`
**Audit in:** 0 P0 / 0 P1 / 2 P2 / 4 P3
**Scope:** test-only. Zero prod-LOC impact. `ci.yml` untouched.

## Per-finding disposition

### P2-1 — `expectCanSeeOwnTenant` failability proof — FIXED
Added an `it` to the failability `describe` in `rls-harness.spec.ts` that proves the
POSITIVE assertion is not a tautology. With RLS on, it calls
`expectCanSeeOwnTenant` against a tenant whose gym scope is `tenants[0]`'s but whose
`rowId` is `tenants[1]`'s (own-gym authorization, other tenant's row). That row is
hidden by the policy, so the count is 0 and the assertion rejects with
`/should see own row/`. Symmetric to the existing negative proof.

### P2-2 — policy lifecycle as single source of truth — FIXED
`rls-harness.ts` now exports:
- `HARNESS_POLICY` — the policy name (was re-derived as `p_${HARNESS_TABLE.toLowerCase()}_select` in 3 spec sites).
- `enableHarnessRls(prisma)` — ENABLE + FORCE RLS + (DROP IF EXISTS) CREATE POLICY. The harness's definition of "RLS on". Idempotent.
- `disableHarnessRls(prisma)` — DROP POLICY + NO FORCE + DISABLE RLS. The "broken/missing policy" state.

`bootstrapSchema` now calls `enableHarnessRls` instead of inlining the ENABLE/FORCE/CREATE sequence, so the harness and its self-tests share one definition.
The spec's failability `afterAll` and both RLS-toggle tests now call `enableHarnessRls`/`disableHarnessRls` — all duplicated policy SQL removed from the spec. The failability test therefore exercises the REAL policy lifecycle SQL the harness owns.

### P3-2 — acting-identity selector — FIXED
Added exported `ActingIdentity { as?: 'coach' | 'student'; role?: string }`.
`expectCanSeeOwnTenant`/`expectCannotSeeOtherTenant` accept an optional `acting`
arg, threaded into the `asUser` call: `as` selects coach (default) vs student;
`role` is passed as `{ role }` only when defined (so `makeAsUser`'s `?? 'student'`
default is preserved). The two-line happy path is byte-for-byte unchanged.
This unblocks A7's role-scoped RLS. Added a self-test exercising `{ as: 'student', role: 'gym_owner' }`.

### P3-1 — `studentId` dead fixture state — FIXED (made live)
With P3-2, `studentId` is now reachable: `expectCan*Tenant(..., { as: 'student' })`
acts as the provisioned student. Exercised by the new role-selector self-test.

### P3-3 — misleading owner-seed comment — FIXED
Corrected the `provisionTenants` JSDoc and the inline seed comment: the owner INSERT
is unconstrained because the base connection is `postgres` (superuser ⇒ BYPASSRLS),
NOT because "the policy is SELECT-only." Noted that a non-bypass owner would need an
INSERT policy or a temporary NO FORCE to seed.

### P3-4 — `randomSuffix()` comment — FIXED (cosmetic)
Downgraded "Short collision-resistant suffix … (avoids crypto import churn)" to
"Short unique-enough suffix for per-run fixture ids."

## Doctrine
No banned patterns (`@ts-ignore`, `as any`, `as unknown as`, `.catch(()=>undefined)`,
"Coming soon"). Verified by grep. Commit authored as Bradley Gleave, no co-author trailer.

## CI
4 lanes. Changes are test-only; `rls-live-tests` runs `rls-harness.spec.ts` against a
real Postgres (self-bootstrapping) — the refactored policy-lifecycle exports and the
new failability test execute there. `build-and-test` runs `tsc --noEmit` + lint over
`src/**` (unaffected) and `npm test` with no DB (RLS suite skips cleanly).

## SHAs
- Base head (audited): `7c3b42a5375384bec566e73aa1ef2e85a3446104`
- New head: `d4d4d22097d46cbc62bb73516aff65f9da92ef14`
- Local verification: `tsc --noEmit` clean on both target files; `eslint` clean on both; no banned patterns.
- CI status: **all 4 lanes GREEN** (run 27654998153):
  - `build-and-test` pass (7m10s) — tsc/lint/build/test
  - `rls-live-tests` pass (2m48s) — runs `rls-harness.spec.ts` against real Postgres; refactored policy-lifecycle exports + new failability test executed and passed
  - `mwb-3-live-tests` pass (2m47s)
  - `rls-floor-guard` pass (20s)

DO NOT MERGE (per brief).
