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

_(populating)_

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
