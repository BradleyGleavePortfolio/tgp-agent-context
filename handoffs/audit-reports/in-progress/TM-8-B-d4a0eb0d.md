# TM-8 Audit — Lens B (tests / contracts / cycle / file ownership)

**PR:** #449 `feat/tm-8-applicant-tracking`
**Head SHA:** d4a0eb0d (d4a0eb0dd2cffdc4563e216529d4846ba7a3e4cc)
**Base:** main
**Auditor lens:** B — tests / contracts / cycle / file ownership
**Status:** IN PROGRESS

---

## Snapshot facts

- Changed files vs main: 12
- Prod files: applicant-tracking.controller.ts (88), applicant-tracking.dto.ts (67), applicant-tracking.service.ts (258), candidate-card.dto.ts (49), pipeline-stage.ts (83), saved-search.controller.ts (28), saved-search.service.ts (29), talent-marketplace.module.ts (+8)
- Test files: applicant-tracking.controller.spec.ts, applicant-tracking.service.spec.ts, pipeline-stage.spec.ts, saved-search.spec.ts
- **Total prod LOC = 610 (OVER 400 hard cap)**
- Identity: IDENTITY_OK (preliminary)
- Commits: d4a0eb0d, 9e122b56, 1a06d792, c0baa903, ba04d59c

---

## Findings (incremental)

### P3-1 — Prod LOC over the 400-line cap
Total TM-8 prod LOC = 610 (controller 88 + dto 67 + service 258 + candidate-card 49 + pipeline-stage 83 + saved-search.controller 28 + saved-search.service 29 + module +8). Over the 400 hard cap. Note: 8b deferral surfaces (saved-search.* = 57 LOC + the two stub methods in tracking) inflate this; excluding the deferred 8b scaffolding, 8a-only prod is ~553 — still over. No automated CI LOC gate exists, so this is advisory P3 (must be fixed/justified before merge per R81).

### Coverage map (every prod symbol)
- **pipeline-stage.ts** — `PIPELINE_STAGES`, `isPipelineStage`, `isTerminalStage`, `canTransition`, `stageToStatus`, `statusToStage` ALL directly tested (pipeline-stage.spec). Round-trip + `withdrawn→new` masking explicitly tested.
- **candidate-card.dto.ts** — `toCandidateCard` exercised via service.listApplicants + getApplicantDetail; explicit `Object.keys(card)` allow-list assertion present. `toLastInitial` covered (`'R.'`).
- **applicant-tracking.service.ts** — listApplicants (hirer-scope + PII + cursor), getApplicantDetail (redaction + opaque 404), moveStage (valid / invalid / terminal / replay / non-owned 404), appendNote/toggleShortlist (501). All public methods covered.
- **applicant-tracking.controller.ts** — guard-stack metadata, role metadata, subject forwarding for listApplicants/getApplicant/moveStage. **GAP:** the two 8b stub routes (`appendNote`, `toggleShortlist`) on the controller are NOT covered by controller.spec (service-level 501 IS covered). Low impact — thin passthrough to a tested 501.
- **saved-search.service.ts** — list/create 501 covered. **saved-search.controller.ts** — NOT covered (no controller spec for saved-search; passthrough to tested 501).

### Stage-machine transition coverage — CLEAN
- Legal advance path: new→screening, screening→interview, interview→offer, offer→hired all tested.
- Early-passed branch: new/screening/interview/offer → passed all tested.
- Illegal: backward (hired→new, interview→new), skip (new→offer, new→hired) rejected.
- Terminal lockout: full loop asserting no outbound from hired/passed.
- Service-level: valid advance persists status; invalid (new→hired) ConflictException; terminal (placed→new) PIPELINE_STAGE_TERMINAL.

### PII projection test — PRESENT (explicit allow-list)
service.spec asserts `Object.keys(card).sort()` equals the exact 7-field allow-list and `JSON.stringify(card)` does not contain the full surname. Detail test asserts email→domain only and stringified output excludes local-part + surname. Strong.

### Cross-hirer leak test — PRESENT (YES)
Three opaque-404 tests where the hirer-scoped `findFirst` returns null (non-owned application): getApplicantDetail → APPLICANT_NOT_FOUND + NotFoundException; moveStage → APPLICANT_NOT_FOUND. listApplicants scope asserted via `where.hirer_id`/`where.listing_id` pinning. This covers the cross-hirer access path (a non-owning hirer matches zero rows → opaque 404, no data leak).

### Cycle check — CLEAN
TM-8 intra-dir import graph is a DAG. pipeline-stage is a leaf; candidate-card→pipeline-stage; dto→{pipeline-stage,candidate-card}; service→{idempotency,application-cursor,pipeline-stage,candidate-card,dto}; controller→{service,dto,guard}; saved-search.service leaf; saved-search.controller→{service,guard}. No back-edges.

### File ownership — CLEAN
Only `talent-marketplace.module.ts` is a cross-boundary touch (+8 lines, purely additive: 2 controllers + 2 providers; `exports` unchanged). All other changed files are new TM-8 files within `src/talent-marketplace/`.

### Contracts — CLEAN
Controller returns service results directly (ApplicantQueueResponse / ApplicantDetailDto / `{application_id, stage}`). No raw Prisma entity is spread anywhere: service selects narrow column subsets and routes through `toCandidateCard` (Pick types). Detail DTO built field-by-field. Error envelopes uniformly `{ error, message, code }` (no `{ kind }`).

### Banned tokens — CLEAN
No `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, or `Coming soon` in any TM-8 spec file.

### 8b deferral — CLEAN, no leaky surface
saved-search.service + tracking appendNote/toggleShortlist throw typed `NotImplementedException` (501) with opaque codes (SAVED_SEARCH_NOT_AVAILABLE / NOTES_NOT_AVAILABLE / SHORTLIST_NOT_AVAILABLE). No faked storage, no orphan persistence code. Deferred work clearly marked with `TODO(TM-8b)` + follow-up issue refs. saved-search.spec uses `it.skip` placeholders for the TM-8b behaviour suite. Routes wired so the contract is stable but fail-closed. `phone_last4` reserved as always-null in detail DTO — documented as 8b unlock.

---

## Scope checklist

1. [ ] Test coverage of every prod symbol
2. [ ] Stage-machine transition coverage (legal + illegal)
3. [ ] PII projection allow-list test
4. [ ] Cross-hirer leak test
5. [ ] Cycle check (imports inside src/talent-marketplace/)
6. [ ] File ownership (only module.ts cross-boundary)
7. [ ] Contracts (responses match DTO, no raw entity spread)
8. [ ] Banned tokens in spec files
9. [ ] Build & test green
10. [ ] R74 identity
11. [ ] 8b deferral — no orphan code / leaky surface
