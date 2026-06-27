# H6A PR #493 — Adjudication (Lens A Opus + Lens B GPT-5.5)

**Adjudicator:** Parent agent (Op 50.5 lane controller)
**PR:** BradleyGleavePortfolio/growth-project-backend#493
**HEAD SHA:** 5a37ce8b12a1c67e918b38ead8a9326320895fd8
**Base SHA:** 185444e4326e61fd964c18498a3805533bd85152
**Date:** 2026-06-27
**Inputs:**
- Lens A: `audits/2026-06-27-H6A-PR493-lens-A-opus.md` (commit `f0998443`)
- Lens B: `audits/2026-06-27-H6A-PR493-lens-B-gpt5_5.md` (commit `1e39b665`)

---

## Verdict

`VERDICT: FINDINGS — BUILDER-BLOCKED (6 BLOCKERs)`

Both lenses converge on the core 4 BLOCKERs. After adjudication, 2 additional findings escalate to BLOCKER, and 1 disputed BLOCKER de-escalates to INFRA-TICKET (not a PR defect). Final tally: **6 BLOCKERs, 9 MAJORs, 5 MINOR/NIT, 1 INFRA-TICKET**.

---

## Consensus BLOCKERs (both lenses agreed)

### B1 — D-H6-1 schema contract break
- **Lens A F1 / Lens B F1**
- **Both:** 5 renames (`actor_user_id`→`actor_id`, `actor_role`→`actor_type`, `entity_type`→`resource_type`, `entity_id`→`resource_id`, `ip_inet`→`ip_address`), `tenant_id` added, `user_agent` dropped, `request_id` type drift (uuid → text).
- **Locked decision violated:** D-H6-1.
- **Required fix:** Restore the LOCKED D-H6-1 column shape exactly. The H6C canonical wrap (`actorUserId`, `entityType`) cannot compile against the shipped types. NO silent contract amendment — fix the migration + schema + types + tests to match D-H6-1, OR obtain an explicit operator amendment in `OPERATOR_DECISIONS_LOG.md` and update H6A/H6B/H6C briefs to match before any downstream slice dispatches.
- **Files:** `prisma/migrations/20261226000000_create_audit_log/migration.sql:43-58`, `prisma/schema.prisma:6737-6756`, `src/audit-log/audit-log.types.ts:34-58`, `test/audit-log/audit-log.migration.spec.ts:34-48`

### B2 — GDPR erasure path architecturally blocked by REVOKE
- **Lens A F2 / Lens B F3**
- **Both:** `redactPii()` issues UPDATEs through the ordinary Prisma client (`app_runtime` principal), but the migration `REVOKE UPDATE, DELETE ON audit_log FROM app_runtime`. Right-to-erasure throws `permission denied` against a correctly-migrated DB. The only "passing" test mocks the DB away.
- **Locked decision violated:** D-H6-1 (REVOKE) + D-H6-4 (GDPR Art. 17 must actually work).
- **Required fix:** Route `redactPii` through an explicitly privileged client (service_role or dedicated erasure role retaining UPDATE), and add a live-DB role-switched test proving (a) `app_runtime` UPDATE is denied and (b) the privileged erasure path succeeds.
- **Files:** `src/audit-log/audit-log.service.ts:78-94`, `prisma/migrations/.../migration.sql:106-107`

### B3 — R75 banned-cast CI red (`@ts-expect-error` missing `#NNNN`)
- **Lens A F10 / Lens B F5**
- **Both:** PR adds `@ts-expect-error` at `test/audit-log/prisma-test-double.ts:23` without an issue ref. The gate regex `EXEMPT_RE='@ts-expect-error.*#[0-9]{4,}'` rejects it. Net banned tokens +1 → FAIL.
- **Required fix:** Prefer eliminating the suppression by giving the test double a properly-typed partial signature (`Pick<PrismaService, ...>` of the delegates used) so no `@ts-expect-error` is needed. Fallback: append `// @ts-expect-error #NNNN <reason>` with a tracking issue.
- **Files:** `test/audit-log/prisma-test-double.ts:21-24`; CI job 83799312861

### B4 — build-and-test CI red (PR-caused migration-count snapshot)
- **Lens A F11 / Lens B F8**
- **Both:** `roman-coach-reviewed-migration.spec.ts:223` expects 146 below-floor migrations, sees 149 (PR-caused; the new `20261226000000_create_audit_log` directory contributes). Separately, `partial-refund-decision-rls-migration.spec.ts:39` hits ENOENT on a missing base migration file — **NOT this PR's fault** (pre-existing base breakage, BL-MIGRATION-REBASELINE territory).
- **Required fix:** Update `KNOWN_BELOW_FLOOR_COUNT` (or the floor logic) to account for the new migration per the append-only contract. Flag the partial-refund ENOENT separately to the operator as a base-branch breakage outside H6A scope — DO NOT paper over it inside this PR.
- **Files:** `test/roman-coach-reviewed-migration.spec.ts:223`, `test/partial-refund-decision-rls-migration.spec.ts:39`

---

## Adjudicator escalations (MAJOR → BLOCKER)

### B5 — `withAuditLog` API contract violation (own-tx vs caller-tx)
- **Lens A F4 (MAJOR) / Lens B F2 (BLOCKER)** → **ADJUDICATED BLOCKER** (Lens B correct)
- **Both:** Brief specs `withAuditLog<T>(tx: Prisma.TransactionClient, args, op): Promise<T>` (caller owns transaction). Implementation is `withAuditLog<T>(ctx, fn)` opening its OWN `this.prisma.$transaction(...)`. A caller already inside an outer transaction (the common case) will nest a second transaction, defeating the single-transaction double-entry guarantee D-H6-5 exists to provide.
- **Why I escalate to BLOCKER:** This kills the H6C canonical wrap pattern (`prisma.$transaction(async (tx) => withAuditLog(tx, args, () => tx.user.update(...)))`) before H6C even dispatches. It is the same severity class as B1 — it breaks the contract H6B/H6C compose against.
- **Locked decision violated:** D-H6-5.
- **Required fix:** Change signature to `withAuditLog<T>(tx: Prisma.TransactionClient, args: AuditLogArgs, op: () => Promise<T>): Promise<T>`. Remove internal `$transaction` call. Update tests to assert caller-provided `tx` is used (assert via the `tx` reference equality, not Prisma double).
- **Files:** `src/audit-log/audit-log.service.ts:54-72`, `src/audit-log/audit-log.types.ts:52-62`

### B6 — R74 density CI red (wrong exemption marker in title)
- **Lens A F12 (MAJOR) / Lens B F6 (BLOCKER)** → **ADJUDICATED BLOCKER**
- **Both:** Ratio is 1.75 (352 src / 619 test), below 2.0 floor. Title has `[LOC-EXEMPT: substrate-migration]` (recognized by R100.A3) but the density gate (R100.A1) looks specifically for `[TEST-EXEMPT: <reason>]` — which is missing. Body says only "R86 Exception Request to follow."
- **Why I escalate to BLOCKER:** CI red is a merge gate. The 5-test footprint is honest (not padding) and the ratio is fine for an anti-padding slice — the marker is simply wrong. This is a 30-second fix that the builder skipped.
- **Required fix:** Add `[TEST-EXEMPT: anti-padding-H6-real-failure-modes]` to PR title. Paste the R86 R74 exception block from H6A brief (lines 189-210) into the body. Do NOT add filler tests.
- **Files:** PR #493 title + body

---

## Adjudicator de-escalation (BLOCKER → INFRA-TICKET)

### I1 — R82 reversibility CI red is a harness URI bug, not a PR defect
- **Lens A F13 (MINOR/INFRA) / Lens B F7 (BLOCKER)** → **ADJUDICATED INFRA-TICKET**
- **Lens A correct.** The reversibility gate dies with `psql: error: invalid URI query parameter: "schema"` (exit 2) BEFORE it evaluates `down.sql`. The workflow passes a Prisma-style `DATABASE_URL=...?schema=public` to bare `psql`, and libpq rejects the `schema` query param. The H6A brief itself (line 183) references this as the known `BL-CI-REVERSIBILITY-PSQL` infra bug.
- **Verification:** Lens A inspected `down.sql` independently and confirmed it reverses migration.sql operation-for-operation correctly (drops all 5 policies, all 3 indexes including the partial `audit_log_actor_idx`, and the table).
- **Required fix:** **NOT in this PR.** Open/escalate `BL-CI-REVERSIBILITY-PSQL` as a separate infra ticket. Workflow needs to strip `?schema=public` before feeding `psql`, or use `PGDATABASE`/`-d` form. Re-run gate after harness fix.
- **Status:** down.sql verified correct by independent inspection. Gate is broken, not the migration.

---

## Adjudicated MAJORs (9)

| # | Source | Finding |
|---|---|---|
| M1 | Lens A F3 | `redactPii` non-atomic + N+1 (no `$transaction`, partial-erasure GDPR hazard) |
| M2 | Lens A F5 | INSERT path likely blocked by FORCE RLS unless app principal == service_role; tenant policy reads `app.tenant_id` GUC never set; no live-RLS test |
| M3 | Lens A F6 | Migration comment authorizes DELETE (contradicts D-H6-4 archive-never-delete) |
| M4 | Lens A F7 | Erasure token 64-bit truncation + determinism = stable cross-row pseudonym after "erasure" (weakens Art. 17 claim) |
| M5 | Lens A F8 | Two divergent redaction primitives (write-path sentinel vs on-demand token) that don't compose |
| M6 | Lens A F9 | `isPiiKey` over-matches via substring `.includes` (destroys `token_count`, `email_verified`, `password_changed_at`, `card_brand` audit facts) |
| M7 | Lens A F15 / Lens B F9 | Retention script `$queryRawUnsafe` with interpolation (violates own Gate-3) |
| M8 | Lens A F16 / Lens B F9 | Retention "never-delete" guard is theater (only scans one hardcoded SQL string; second cursor SQL not in scanned set) |
| M9 | Lens A F20 / Lens B F10 | PR body incomplete (missing R86 R76 + R74 blocks, R82 statement, REVOKE citation, erasure-token threat model, D-H6-1/D-H6-5 refs) |

## Adjudicated MINORs/NITs (5)

| # | Source | Finding |
|---|---|---|
| N1 | Lens A F14 | Prisma model omits partial `audit_log_actor_idx` (schema drift; deferred to BL-MIGRATION-REBASELINE) |
| N2 | Lens A F17 | S3 Object Lock GOVERNANCE mode is bypassable; should default COMPLIANCE for 7y regulatory archive |
| N3 | Lens A F18 / Lens B F9 | Retention script promises Glue catalog registration but never implements it; revise docs OR implement |
| N4 | Lens A F19 / Lens B F11 | R86 LOC exemption table stale (script 167 brief vs 203 shipped; erasure-token 139 brief vs 179 shipped; service 61 brief vs 95 shipped). Recompute per actual `git diff --numstat`. |
| N5 | Lens B F12 | Migration spec asserts the WRONG schema as "LOCKED" (false oracle) — rewrite from operator-locked D-H6-1 table |

---

## Disputed disagreements

### D1 — Write-path PII primitive: sentinel vs deterministic token
- **Lens A F8 (MAJOR — "divergent primitives don't compose"):** Two-primitive design is inconsistent. Make `tokenizePiiState` a no-op on the static sentinel.
- **Lens B F4 (BLOCKER — "use deterministic token"):** Write-path should ALSO tokenize so erasure rows remain correlatable.
- **Adjudicator ruling:** **Lens A is right that the two paths must reconcile;** I am NOT going to force write-path to tokenize without operator decision because that re-enables cross-row PII linkability (the exact thing Lens A F7 flagged as weakening Art. 17). Treat as MAJOR M5 (reconcile primitives), with a separate operator question: "do we WANT cross-row correlation of erased rows, accepting the linkability tradeoff, or do we want true unlinkability with sentinel-only?" Flag in OPERATOR_DECISIONS_LOG as open D-H6-6.

### D2 — Retention script scope
- Both lenses agreed it IS in scope (Lens A F21 NIT, Lens B F9 MAJOR). Quality defects (M7, M8, N3) remain. Closed.

---

## Required builder fix checklist (for fixer subagent)

**BLOCKERs (must close all 6 before audit-clear):**
1. [B1] Restore D-H6-1 column shape exactly: `id, created_at, actor_user_id, actor_role, action, entity_type, entity_id, before_state, after_state, request_id (uuid), ip_inet, user_agent, reason`. Update migration.sql, schema.prisma, audit-log.types.ts, audit-log.migration.spec.ts.
2. [B2] Privileged erasure client OR redesign. Add role-switched live-DB test proving REVOKE works under `app_runtime` AND erasure succeeds under privileged role.
3. [B3] Eliminate `@ts-expect-error` in prisma-test-double.ts via typed partial. (Fallback: `#NNNN` issue ref.)
4. [B4] Update `KNOWN_BELOW_FLOOR_COUNT` in roman-coach-reviewed-migration.spec.ts. Surface ENOENT in `partial-refund-decision-rls-migration.spec.ts` as separate non-H6A issue.
5. [B5] Change `withAuditLog` to `(tx, args, op)` caller-provided-tx signature. Remove internal `$transaction`. Add test asserting caller `tx` reference equality.
6. [B6] Add `[TEST-EXEMPT: anti-padding-H6-real-failure-modes]` to PR title. Paste R86 R74 + R76 blocks into PR body.

**MAJORs to close (M1-M9 above):** Same PR, post-BLOCKER.

**INFRA-TICKET (separate):** Open `BL-CI-REVERSIBILITY-PSQL` to fix workflow `?schema=` URI handling.

**Open operator question (D-H6-6):** Write-path PII — sentinel-only (unlinkable) OR deterministic token (linkable but correlatable)?

---

VERDICT: FINDINGS — BUILDER-BLOCKED (6 BLOCKERs)
