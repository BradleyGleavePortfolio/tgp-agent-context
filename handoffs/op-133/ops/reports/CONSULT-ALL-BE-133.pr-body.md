Bug IDs: B14, B23 (consultation part), B33. Owner decision 28; decisions 133-1 and 133-3 at their defaults. Plan points: pending (JOBS133 was written before the combined plan; the operator maps them).

**Tier:** T4 (tenancy + health data).
**Why:** Production has 0 `ClinicProgramSet` rows, and the consultation could only finish for a client whose coach had their own set. So `consultation_available` was false for every client in every build, and nobody has ever reached the consultation (RECON133 F1, F2). Owner decision 28 (15:29): every client gets the full consultation; coachless clients can do everything a coached client can except direct coaching.
**T4 trigger scan:**
- Tenancy: YES. A coachless clone is a new tenant shape. Its `coach_id`, `owner_user_id`, `client_id`, the `assigned_by_coach_id` on its assignments and the `MacroTarget.coach_id` are all the client's own id. House masters are cloned into the tenant of the coach (INT-607-1 rule, unchanged) or the coachless client's own tenant.
- Health data: YES. Screening flags: a coachless client's flag is recorded (`screening_flagged_at`) and alerts nobody. A coached-without-set client's flag alerts only the client's own coach, never the house account. No new read path.
- Consent: unchanged. `consent_missing` is still enforced (tested for coachless).
- Auth: unchanged (`@Roles('student')`).
- Money, credentials: none.
- Destructive data: none. The migration is additive with `down.sql`.
**T3 trigger scan:** a schema migration (one additive column, constant default, catalog-only on PG 11+). Nothing else at T3.
**Bounded T1:** none.
**Canonical builder:** CONSULT-ALL-BE-133 (agent 133, claude_opus_5_5).
**Parent owner:** operator agent 133.
**Acceptance evidence:** 14 failing-first unit tests (shown failing on main's service, passing here). `test/onboarding.service.spec.ts` 83/83 and `test/seed-clinic-programs.spec.ts` 11/11 pass. `test/onboarding-audit-regressions.spec.ts` 18/18 passes unchanged. A targeted `tsc` over the four touched TS files against a Prisma client generated from this schema shows 0 errors. Eslint on the service is clean. CI below.
**Promotion triggers:** any change to who can read a coachless clone, any community join for house completions, or any alert routing for a coachless screening flag goes back to T4 review.

## What changes for coaches and clients
- **Coachless client:** sees the full consultation as soon as the house set is seeded. Gets their macros and a 4-week program cloned from the house programs into their own account. The result has `coach: null` and `spaces: []`. Their numbers show on Home, Food and Log through the usual `MacroTarget` read.
- **Client of a coach who has no set:** gets the house programs shown under their coach's name (decision 133-3). The clone sits in the coach's tenant like any other client copy, and any screening alert goes to that coach. The client joins no community space, because the house spaces belong to the house account.
- **Client of a coach with their own set:** nothing changes.
- **Coaches:** no coach can list a coachless client's clone. Coach program reads are keyed on the coach's tenant (`program-library.service.ts` `coach_id: actor.tenantId`, where tenantId is the head or the coach's own id). A student's id is never a coach tenant.
- **Older apps:** `consultation_available` is kept. Until the house set is seeded it stays false for coachless clients and coaches without a set, so today's builds still run the standard onboarding and never wait on a 409.

## Design choice: a column, not an env var
`ClinicProgramSet.is_house` (migration `20270406000000_clinic_program_set_house`). The env route (`HOUSE_PROGRAMS_COACH_ID`) needs a new ENV_RULES entry in `src/common/env-validation.ts` (agent 132's file, outside lane 133), because `.github/fly-env-desired-state.json` is validated against ENV_RULES. It also needs a Fly secret, and touching flags is forbidden. The column keeps the choice with the seeded data, so one audited seed run turns it on. Resolution reads the newest active `is_house` set whose owner is a live coach or owner account. `seed-clinic-programs --house` keeps one house set at a time.

## Seed path
`seed/clinic-programs.v1.json` is unchanged; its approval fields wait for decision 133-2 in a separate operator PR. No workflow is added: the runtime image ships only `dist/` (Dockerfile:88; no `scripts/*.ts`, no `seed/`), so a `workflow_dispatch` cannot run `scripts/seed-clinic-programs.ts` on the Fly machine. The exact operator steps are in the report (`ops/reports/CONSULT-ALL-BE-133.md`) and in `docs/clinic-onboarding.md`.

## Tests (failing first)
New in `test/onboarding.service.spec.ts` ("CONSULT-ALL-BE-133"):
- A coachless client completes, with the clone in their own tenant, no coach, no spaces and no alert.
- No cross-tenant read: neither the clone nor the target sits in any coach's tenant.
- Coached with their own set: unchanged when a house set exists.
- Coached without a set: falls back to the house programs under the coach, and the alert goes to the coach.
- Idempotent replay is unchanged.
- `consent_missing` is still enforced.
- A coachless screening yes gives the extra-care program and alerts nobody.
- Locks: client row only, FOR SHARE.
- A client attached mid-completion is re-run under the coach.
- A house owner that is deleted or not a coach is ignored.
- A house master that is not the house account's own template is refused.
- `consultation_available` is true for coachless clients and for coaches without a set.

Updated:
- A coachless client with no house set now gets `clinic_not_configured` (was `not_attached`).
- A client detached mid-completion is re-run as coachless.

`test/seed-clinic-programs.spec.ts`:
- `--house` marks the set and clears any other house flag.
- `--house` on an already seeded set only marks it, and a dry run writes nothing.
- The production guard still applies.

## WHY / WHEN / WHO
- Root cause: completion was coach-only by design, and no set was ever seeded in production.
- `complete()` refusing coachless clients (`not_attached`) and coaches without a set (`clinic_not_configured`) was introduced by f04289f9 (2026-10-02, #607, C05/C07 consultation intake).
- The `consultation_available` gate that hid the consultation from everyone while no set existed was introduced by 73e71cd5 (2026-10-06, #767, S-REVENUE-124 B-REV-1).
- AUD-FIN-ONB-129 R-3 chose "leave dark for launch". That choice was never put to the owner.

## Not in this PR (in the report as "Proposed (needs operator)")
- Roman context reads only coach-side rows: `roman-coach-scope.ts:64` gives `coachSide = []` for a coachless client, so Roman does not read the coachless clone's assignments or MacroTarget. Owner: ROMAN-CONTEXT-133.
- Mobile copy for coachless results: "Message {coach}" and "{Coach} has been told" in RevealScreens. Owner: CONSULT-ALL-M-133 / CONSULT-PARITY-133.
- `program-library.service.ts:385-408` `assignedCounts` has no tenant filter. A head coach's master count includes clones in other tenants, so the house account's master cards would count clients it cannot list. This is a count only, with no identities.

agent 133
