# Re-Audit B (Tests, Contracts & Hygiene) — PR #421 "W1.5-A4: reusable RLS live-DB test harness"

- **Head:** d4d4d22097d46cbc62bb73516aff65f9da92ef14
- **Base:** wave-1-5-planning
- **Scope:** test-only (`test/rls/rls-harness.spec.ts`, `test/rls/support/rls-harness.ts`); zero prod-LOC.
- **Auditor:** RE-AUDITOR B under R81 doctrine.

## Verdict

CLEAN_NO_FINDINGS

## Prior-finding verification (all closed)

| Prior | Claim | Verified |
|-------|-------|----------|
| P2-1 | positive-failability proof added | ✅ spec:147-160 — own-gym auth + other-tenant `rowId`; with RLS on the row is hidden, asserts `rejects.toThrow(/should see own row/)`. Runs **before** `disableHarnessRls`, so it genuinely depends on RLS being on. Not vacuous. |
| P2-2 | policy lifecycle as single source of truth | ✅ `HARNESS_POLICY`, `enableHarnessRls`, `disableHarnessRls` exported (harness.ts:64,76,99). `bootstrapSchema` now calls `enableHarnessRls` (harness.ts:167); spec failability block uses enable/disable helpers (spec:144,166,179). No executable policy SQL exists outside the two helpers — confirmed by repo-wide grep. |
| P3-1 | studentId live | ✅ `HarnessTenant.studentId` (harness.ts:115), seeded (harness.ts:207), consumed by `actorId` (harness.ts:327). |
| P3-2 | optional `{as?, role?}` selector threaded | ✅ `ActingIdentity` (harness.ts:291-296) → `roleOpts`/`actorId` → `asUser(opts.role)` → `RlsContext.role` → `app.current_user_role` legacy GUC (rls-context.ts:85). Contract consistent end-to-end. |
| P3-3 | owner-seed comment corrected | ✅ harness.ts:185-189 now states BYPASSRLS superuser is the real reason the write is unconstrained. |
| P3-4 | randomSuffix comment downgraded | ✅ harness.ts:374. |

## Ruthless re-sweep results

### Single source of truth — CONFIRMED
Repo-wide grep for `CREATE POLICY|ROW LEVEL SECURITY|DROP POLICY` across `test/` shows the only **executable** harness policy SQL is inside `enableHarnessRls`/`disableHarnessRls` (harness.ts:76-109). Every other hit is either (a) a different suite's own migration-string assertions, or (b) prose in comments. The spec no longer issues any `$executeRawUnsafe` policy SQL of its own. The empty-gyms DENY note was *moved* into the `enableHarnessRls` JSDoc, not duplicated.

### New exports — clean, typed, documented, reusable
- `HARNESS_POLICY` (const string) — documented as SSOT for the policy name; used internally by both helpers. Exporting it for A5-A8 is justified by its stated reuse intent; not dead.
- `enableHarnessRls` / `disableHarnessRls` — typed `(prisma): Promise<void>`, JSDoc'd, idempotent, cross-linked via `{@link}`. Consumed by bootstrap + spec.
- `ActingIdentity` — `readonly as?: 'coach'|'student'`, `readonly role?: string`, fully documented; consumed by the assertion pair and the spec selector test. The `as const` inline object at spec:121 structurally satisfies it (tsc clean).

### Backward compatibility — PRESERVED (brief requirement)
- `AsUser` gained 4th **optional** `opts?: { role?: string }`; `expectCanSeeOwnTenant`/`expectCannotSeeOtherTenant` gained 2nd/3rd **optional** `acting?`. All legacy 3-arg `asUser(...)` (spec:75,87,107) and 1-/2-arg assertion calls (spec:97,102) still compile. `RlsContext.role` defaults to `'student'` in `makeAsUser` when omitted — original two-line behaviour byte-for-byte unchanged.

### Failability-proof ordering — SAFE
Within the `failability` describe: positive proof (RLS on) → negative proof (`disableHarnessRls`) → restore (`enableHarnessRls`) → `afterAll` re-enables defensively. Sequential, idempotent, self-healing. Outer `afterAll` `teardownTenants` drops the table regardless, so a mid-suite failure cannot leak an open table to other suites.

### Doctrine / hygiene
- Banned patterns (`@ts-ignore`, `as any`, `as unknown as`, `.catch(()=>undefined)`, "Coming soon") in the PR's files: **none**. (Repo-wide hits in `src/checkout/*`, `src/packages/*` are pre-existing prod code untouched by this test-only PR — out of scope.)
- Authorship: `Bradley Gleave <bradley@bradleytgpcoaching.com>`, **no co-author trailer**. ✓
- Typecheck: `tsc --noEmit` reports **zero** errors in either PR file. All emitted errors are pre-existing unrelated sparse-worktree module gaps (`_fixtures`, `utils/bootstrap-test-schema`, `community/_support/community-db`).
- No naming drift: error-message strings updated coherently from `own.coachId` to the resolved `userId` (harness.ts:346,365) so messages remain accurate when acting as the student.

## Non-blocking observation (NOT a finding; recorded for transparency)

The role-selector self-test (spec:116-128) is honest but structurally weak: the harness gym policy is identity- and role-agnostic (`gym_id = ANY(app.current_gym_ids())`), so neither `as:'student'` nor `role:'gym_owner'` can change row visibility. The test therefore proves the selector *plumbs through without error* but cannot catch a bug in `actorId`'s `as:'student'` branch (a regression returning `coachId` would still pass). The spec comment is candid about this ("identity-agnostic … must isolate exactly as the default path"), and the existing GUC-stamping test (spec:70-82) covers userId→GUC for the coach. This does not rise to a P3 finding: the assertion is non-vacuous (it still exercises the full provision→asUser→policy path with the alternate identity), the limitation is inherent to A4's deliberately identity-agnostic policy, and a stronger student-userId-in-GUC assertion is naturally A7's job. No fix required for this PR.

## Counts

- P0: 0
- P1: 0
- P2: 0
- P3: 0

CLEAN_NO_FINDINGS
