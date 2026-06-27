# M1.α Builder Brief — ImportSession substrate + SHA256 idempotency

**Codified:** 2026-06-26 by operator (Bradley Gleave), Op 50.5 staging.
**Lane:** T4.A2 / M-slice 1.α (substrate).
**Planner authority:** [`audit_briefs/A2_MIGRATION_PLANNER_BRIEF.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/audit_briefs/A2_MIGRATION_PLANNER_BRIEF.md).
**Spec authority:** [`roadmap/specs/A02-import-tooling.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/specs/A02-import-tooling.md).

## ⚠️ DISPATCH GATE — DO NOT START UNTIL H6-α IS MERGED

Per Op 50.5 Q3 operator ruling (verbatim): *"Strict — M1.α waits for H6-α to merge"*.

H6-α ships `withAuditLog`, `AuditLogService`, audit_log table — all consumed by M1.α `ImportSession` writes. **Verify before STEP 0:**

```bash
# H6-α merge proof
cd /tmp/gpb-recon
git fetch origin main
git log origin/main --oneline | head -5
# Must include the H6-α merge commit. If absent, ABORT and report BLOCKED-WAITING-H6-ALPHA.
```

If H6-α is not merged → write report `M1_ALPHA_REPORT.md` with VERDICT `BUILDER-BLOCKED` (reason: H6-α not merged), do not begin work.

## Repo + branch

- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Branch: `wave-a2-m1-alpha-import-session` (base: `main` post H6-α merge)
- PR title: `[A2-M1.α] feat(import): ImportSession substrate + SHA256 idempotency`
- Open as `[WIP]` on first push (R52).

## Bradley R0 LAW (re-stated)

Operator directive (verbatim, 2026-06-13): *"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"*

- Author EVERY commit with inline `-c` flags:
  ```bash
  git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "..."
  ```
- NO `Co-Authored-By`, NO `Generated-By`, NO assistant attribution
- NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as X`
- NO `.catch(()=>undefined)`, NO `.catch(()=>null)`, NO bare `catch(e){}`
- `@ts-expect-error` with one-line justification IS allowed

## Mandatory training docs

- [`50_FAILURES_OF_AI_GENERATED_CODE.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md) — sweep your diff against the 50 failure modes
- [`BUILDER_BRIEF_TEMPLATE_V2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/quality-references/BUILDER_BRIEF_TEMPLATE_V2.md) — canonical brief shape

## Technical scope (THIS slice only)

### 1. `ImportSession` Prisma model

```prisma
model ImportSession {
  id              String   @id @default(uuid())
  coachUserId     String   @map("coach_user_id")
  sourceType      String   @map("source_type") // 'trainerize_csv' | 'spreadsheet' | 'trainerize_json'
  fileSha256      String   @map("file_sha256")
  columnMapping   Json     @default("{}") @map("column_mapping")
  status          String   @default("pending") // 'pending' | 'parsing' | 'dry_run' | 'committed' | 'failed'
  rowCount        Int      @default(0) @map("row_count")
  errorCount      Int      @default(0) @map("error_count")
  dryRunPayload   Json?    @map("dry_run_payload")
  createdAt       DateTime @default(now()) @map("created_at")
  committedAt     DateTime? @map("committed_at")

  coach           User     @relation(fields: [coachUserId], references: [id])

  @@unique([coachUserId, sourceType, fileSha256], name: "import_session_idempotency_key")
  @@index([coachUserId, status])
  @@map("import_session")
}
```

### 2. Migration (R82 reversibility)

- `prisma/migrations/<TIMESTAMP>_create_import_session/migration.sql` — forward
- `prisma/migrations/<TIMESTAMP>_create_import_session/down.sql` — reverse (DROP TABLE)
- RLS policies enabled at migration time:
  ```sql
  ALTER TABLE import_session ENABLE ROW LEVEL SECURITY;

  CREATE POLICY import_session_coach_select ON import_session
    FOR SELECT USING (coach_user_id = auth.uid()::text);

  CREATE POLICY import_session_coach_insert ON import_session
    FOR INSERT WITH CHECK (coach_user_id = auth.uid()::text);

  CREATE POLICY import_session_coach_update ON import_session
    FOR UPDATE USING (coach_user_id = auth.uid()::text);

  CREATE POLICY import_session_admin_all ON import_session
    FOR ALL TO admin_role USING (true);
  ```

### 3. `ImportSessionService` (`src/import/import-session.service.ts`)

```typescript
class ImportSessionService {
  /**
   * SHA256-based idempotent session creation. Re-uploading same file by same coach
   * returns the EXISTING session, never creates a duplicate.
   */
  async createOrFetch(args: {
    coachUserId: string;
    sourceType: 'trainerize_csv' | 'spreadsheet' | 'trainerize_json';
    fileBuffer: Buffer;
  }): Promise<ImportSession>;

  async updateStatus(id: string, status: ImportSessionStatus): Promise<void>;
  async findByCoach(coachUserId: string): Promise<ImportSession[]>;
}
```

Implementation requirements:
- SHA256 computed once from `fileBuffer` (Node `crypto.createHash`)
- `prisma.importSession.upsert` on the unique key `(coachUserId, sourceType, fileSha256)`
- All writes wrapped in `withAuditLog` (from H6-α) — `action: 'import_session.created'`, entity_type `'ImportSession'`
- Status transitions emit additional audit events: `'import_session.status_changed'`

### 4. Tests (anti-padding doctrine — H6 carried)

Operator anti-padding ruling carried from H6 (2026-06-26): *"tests target real failure modes, never line-ratio targets"*. M1.α ships exactly 2 named tests targeting the highest-risk failure modes:

**Test 1: `import-session.idempotency.spec.ts` (~80 LOC)**
- Setup: coach A uploads `roster.csv` (sha256 = X)
- Re-upload same file → returns same session ID, row count unchanged, NO duplicate row in DB
- Different coach uploads same file → distinct session (coach-scoped idempotency)
- Different file by same coach → new session

**Test 2: `import-session.rls.spec.ts` (~100 LOC)**
- Coach A creates session → Coach B's authenticated query returns empty (RLS denial)
- Admin role query sees both coaches' sessions
- Cross-coach `update()` attempt → RLS denial
- Cross-coach `findOne(id)` by ID → returns null (RLS denial, not 403, because RLS hides the row)

**Conditional 3rd test (only if real failure mode justifies it):**
`import-session.audit-event.spec.ts` (~60 LOC) — only ship if H6-α `withAuditLog` integration has a non-obvious failure mode discoverable here (e.g., audit row not written when ImportSession upsert hits existing row). Default: DO NOT SHIP. Add only if you find an actual gap during integration.

## LOC math (locked targets)

| Component | Prod LOC | Test LOC |
|---|---|---|
| Prisma model + migration | ~80 | — |
| ImportSessionService | ~120 | — |
| Status enum + types | ~30 | — |
| API route stubs (no UI yet) | ~50 | — |
| **Total prod** | **~280** | — |
| Idempotency test | — | ~80 |
| RLS test | — | ~100 |
| **Total test** | — | **~180** |
| **Ratio** | | **0.64** |

Ratio < R74 1.0 → ships with R86 exception note:

> R86 Exception (H6 anti-padding doctrine carry-forward): Ratio 0.64 < R74 target 1.0. 2 named tests target the 2 real failure modes of this substrate slice (idempotency contract violation + RLS bypass). Padding to ratio 1.0 would add filler tests of constructor/getter/factory behavior with no failure-mode coverage gain. Operator anti-padding ruling 2026-06-26 explicitly forbids ratio padding.

Confirm with operator whether the H6 anti-padding doctrine extends to A2 BEFORE marking the PR ready-for-audit. Default assumption: YES, extends; ship the exception note. If operator says NO, add 1–2 more tests targeting concrete bugs (not constructor coverage).

## R76 LOC budget

280 prod LOC — UNDER R76 400-LOC cap. NO exemption marker needed in PR title.

## PR body requirements

1. Scope summary (this brief's "Technical scope" section)
2. LOC math table
3. R86 exception note (verbatim from §"LOC math" above)
4. Doctrine checklist: R0, R3, R52, R74, R78, R82, R98, R107, R125
5. **Idempotency proof block** — paste actual psql output showing re-upload of same file = same session ID
6. **RLS proof block** — paste actual psql output showing cross-coach query returns empty
7. VERDICT line at bottom: `BUILDER-COMPLETE | BUILDER-BLOCKED | INFRA_DEATH`

## §10 HARD RULE — pre-termination output

Before terminating, write `/home/user/workspace/M1_ALPHA_REPORT.md`:

- PR URL
- Branch name + final commit SHA
- LOC math (prod + test + ratio)
- Tests shipped (file paths + LOC + assertion counts)
- Conditional 3rd test decision (shipped or not + why)
- R86 exception status (sent for operator confirmation? yes/no/N-A)
- Audit event integration verified (yes/no — pasted audit_log row IDs from manual test)
- VERDICT

If sandbox dies → INFRA_DEATH. If H6-α not merged at STEP 0 → BUILDER-BLOCKED with reason `H6-α prerequisite unmet`.

## Constraints

- Fresh clone in `gpb-m1a` directory (separate from H6 clones)
- Do NOT touch PR #491, any H6-* branch, or operator's recon clone
- Do NOT enable auto-merge (operator preference Q2: auto-merge OFF everywhere; auditors' dual-CLEAN merges P0–P3 work, not the builder)
- D-A2 decisions (idempotency, RLS Tier 2, audit-event-per-import-row) are LOCKED per A02 spec
- Open operator questions (email provider, Trainerize 2026 schema) DO NOT BLOCK M1.α — they block M2 + M5

## Lineage

Replaces the original A2 single-PR dispatch shape with the substrate-first slicing required by R76 + operator parallelization preference for M2/M3/M4 CSV-adapter parallel triad.
