# A2 Migration / Import Tooling — Planner Brief

**Codified:** 2026-06-26 by operator (Bradley Gleave), Op 50.5 staging.
**Lane:** T4.A2 (first Tier 4 lane post-H).
**Spec stub:** [`roadmap/specs/A02-import-tooling.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/specs/A02-import-tooling.md).
**Authority:** [`plans/POST_H_LADDER.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/POST_H_LADDER.md) §5.1; v2 source §1.A A2.
**Status:** PLANNER — slices M1.α, M1.β, M2, M3, M4, M5–M10, M11 enumerated below. M1.α is gated on H6-α merge per Op 50.5 Q3 ruling ("Strict — M1.α waits for H6-α to merge").

## Why this planner exists

A2 is the largest single Tier-4 lane (6–8 PRs minimum; operator-flagged App Store launch-gate prerequisite). The lane decomposes into a substrate layer (M1) and a series of CSV-adapter slices (M2/M3/M4) that can run parallel once M1.α lands the shared `ImportSession` substrate. Subsequent M5–M11 cover billing migration, invite emails, and program-format conversion.

## Scope of the lane (from A02 spec)

- Trainerize CSV/JSON importer with field mapping to TGP schema
- Spreadsheet importer (name, email, start date, program columns)
- Branded invite emails — "Your coach [Name] has moved to TGP" (open-rate ≥40% target)
- Program-format conversion: Trainerize program export → TGP `WorkoutProgram` + `WorkoutPlan`
- Billing migration: detect imported clients with active subs → prompt coach to set up equivalent Stripe Connect plans

**Acceptance criteria locked by A02 spec:**
1. Trainerize CSV importer handles 2026 export format; field-mapping UI confirmed
2. Spreadsheet importer accepts arbitrary column orders via mapping UI
3. Branded invite emails A/B-tested for open rate ≥40%
4. Program format conversion preserves set/rep/RPE structure
5. Billing migration creates Stripe Connect plans at parity with imported sub structure
6. **Idempotency: re-uploading same file produces no duplicates** (critical, per spec)
7. All PRs dual-CLEAN

## Doctrine flags (from spec)

- **RLS Tier:** standard (imports scoped to importing coach via `coach_user_id`)
- **Idempotency:** critical — re-importing same file = no-op (drives M1.α substrate design)
- **Audit events:** every imported client = `AuditEvent` row (consumes H6-α `withAuditLog` wrapper)
- **Voice/UI:** Maya voice on import status messaging

## Slice decomposition (M-series)

### M1.α — `ImportSession` substrate + idempotency keying

**Gate:** H6-α MUST be merged (provides `withAuditLog`, `AuditLogService`, audit_log table).
**Ships:**
- `ImportSession` Prisma model — `id`, `coach_user_id`, `source_type` (`trainerize_csv` | `spreadsheet` | `trainerize_json` | future), `file_sha256`, `column_mapping` (jsonb), `status` (`pending` | `parsing` | `dry_run` | `committed` | `failed`), `row_count`, `error_count`, `created_at`, `committed_at`, `dry_run_payload` (jsonb)
- Unique index `(coach_user_id, source_type, file_sha256)` — drives idempotency: re-uploading same file by same coach is a no-op (returns existing session)
- `ImportSessionService` with `createOrFetch(coachId, sourceType, fileBuffer)` → SHA256-based dedup
- RLS Tier-2: coach sees own sessions; admin sees all
- 2 named tests (anti-padding doctrine carried from H6):
  - `import-session.idempotency.spec.ts` — re-upload same file → same session ID, no duplicate rows
  - `import-session.rls.spec.ts` — cross-coach access denied
- LOC target: ~280 prod / ~180 test / ratio 0.64 (under R74 — explicit R86 exception per anti-padding doctrine if doctrine extends; default ratio holds)

**Expected PR count:** 1
**Branch:** `wave-a2-m1-alpha-import-session`
**Title:** `[A2-M1.α] feat(import): ImportSession substrate + SHA256 idempotency`

### M1.β — Field-mapping UI primitive (backend half)

**Gate:** M1.α merged.
**Ships:**
- `FieldMapping` schema definition for known TGP entities (`User`, `WorkoutProgram`, `Subscription`)
- `/api/import/preview` endpoint — accepts ImportSession + column_mapping → returns dry-run row sample with normalized values, errors, warnings
- `/api/import/commit` endpoint — transactional commit of full mapped set, emits AuditEvents per imported row
- 2 named tests:
  - `field-mapping.normalization.spec.ts` — date formats, email lowercasing, name splitting
  - `import-commit.transactional.spec.ts` — partial-failure rollback semantics (all or nothing)
- LOC target: ~320 prod / ~250 test / ratio 0.78

**Expected PR count:** 1
**Branch:** `wave-a2-m1-beta-field-mapping`
**Title:** `[A2-M1.β] feat(import): field-mapping primitive + preview/commit API`

### M2 — Trainerize CSV adapter

**Gate:** M1.α merged (parallel-with M1.β allowed if M1.β doesn't change `ImportSession` shape).
**Ships:**
- `TrainerizeAdapter` implementing `ImportAdapter` interface (`parse(fileBuffer) → ParsedRows; suggestMapping(headers) → ColumnMapping`)
- Trainerize 2026 export schema fixture (acquired from real export or operator-provided spec — **OPEN OPERATOR QUESTION**, see spec)
- 2 named tests: schema-detection + row-level normalization
- LOC target: ~250 prod / ~200 test

**Expected PR count:** 1
**Branch:** `wave-a2-m2-trainerize-csv-adapter`
**Title:** `[A2-M2] feat(import): Trainerize CSV adapter + schema detection`

### M3 — Generic spreadsheet adapter

**Gate:** M1.α merged. Parallel with M2/M4.
**Ships:**
- `SpreadsheetAdapter` accepting CSV/XLSX with arbitrary column orders
- Header-heuristic mapping (e.g., `"e-mail"` → `email`, `"Start Date"` → `start_date`)
- 2 named tests: arbitrary-column-order parse + heuristic-mapping accuracy
- LOC target: ~220 prod / ~180 test

**Expected PR count:** 1
**Branch:** `wave-a2-m3-spreadsheet-adapter`
**Title:** `[A2-M3] feat(import): generic spreadsheet adapter + header heuristics`

### M4 — Trainerize JSON adapter

**Gate:** M1.α merged. Parallel with M2/M3.
**Ships:**
- `TrainerizeJsonAdapter` for Trainerize program export (JSON format, contains nested program structure)
- Implements `ImportAdapter` + `ProgramConverter` interface (sets up M11 program-format conversion)
- 2 named tests: nested-structure parse + program-shape validation
- LOC target: ~280 prod / ~220 test

**Expected PR count:** 1
**Branch:** `wave-a2-m4-trainerize-json-adapter`
**Title:** `[A2-M4] feat(import): Trainerize JSON adapter + program-shape validator`

### M5–M10 — Branded invite emails + program conversion + billing migration

Slice into 6 PRs, each ~200–350 LOC:
- **M5:** Branded invite email template + Resend/SendGrid wiring (provider choice = **OPEN OPERATOR QUESTION** per spec)
- **M6:** Invite-email delivery + A/B variant scaffolding
- **M7:** Open-rate telemetry + analytics dashboard tile
- **M8:** `WorkoutProgram` schema converter (Trainerize → TGP, set/rep/RPE preservation)
- **M9:** `WorkoutPlan` schema converter (multi-week program structure)
- **M10:** Billing migration — detect active subs → prompt coach via Stripe Connect plan-creation flow

### M11 — End-to-end import wizard UI integration

**Gate:** M1–M10 merged.
**Ships:** Maya-voiced wizard (upload → preview → confirm → commit → success), full mobile + web parity, completion celebration popup.

## Sequencing diagram

```
H6-α merge ──> M1.α (substrate)
                  │
                  ├──> M1.β (field mapping API)
                  │      │
                  ├──> M2 (Trainerize CSV) ─┐
                  ├──> M3 (Spreadsheet)    ─┤
                  └──> M4 (Trainerize JSON)─┤
                                            │
                                            v
                                       M5–M10 (invite + convert + billing, partially parallel)
                                            │
                                            v
                                          M11 (wizard UI integration)
```

**Parallelization budget:** Up to 4 lanes in flight simultaneously (M2 + M3 + M4 + M1.β) — within R71 5-lane cap.

## Open operator questions (carried from A02 spec)

1. Branded invite email transactional provider — Resend, SendGrid, or Postmark? (Blocks M5.)
2. Trainerize 2026 export schema — operator-provided spec, or reverse-engineer from a real export? (Blocks M2.)

## Doctrine bindings (entire lane)

- R0/R3: Bradley authorship, no AI trailers
- R52: PUSH-EARLY-WIP per slice
- R71: ≤5 parallel lanes
- R72: dual-lens audit (Opus 4.8 + GPT-5.5)
- R74/R76/R86/R100: LOC ratio + anti-padding (extends from H6 doctrine — operator confirmation pending)
- R78: VERDICT lines
- R82: migrations reversible (M1.α `ImportSession` table)
- R98: PII handling (imported client emails/phones)
- R107: audit-log doctrine (every imported row → AuditEvent via H6-α `withAuditLog`)
- R125: RLS Tier 2 minimum

## State of build (from A02 spec)

ZERO. No Trainerize/Everfit importer, no spreadsheet upload, no program-format converter. Greenfield lane.

## Next planner actions

1. Operator-resolve the 2 open questions (Q1: email provider, Q2: Trainerize schema)
2. After H6-α merges → dispatch M1.α builder (brief: `M1_ALPHA_BUILDER_BRIEF.md`)
3. After M1.α merges → dispatch M2, M3, M4 in parallel (briefs to be drafted post-M1.α)
4. M5–M11 briefs drafted after the parallel CSV-adapter wave settles

## Lineage

This planner replaces the prior single-PR A2 dispatch shape with the M-slice decomposition required by R76 (per-PR LOC budget) and operator parallelization preferences. The CSV-adapter parallel triad (M2/M3/M4) is the chief reason for the slicing.
