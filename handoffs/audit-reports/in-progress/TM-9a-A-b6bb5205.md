# TM-9a audit — Lens A — SHA b6bb5205

## Verdict: IN PROGRESS

## Findings (draft)

### P2-1 (candidate) — sample-URL cap is inconsistent across layers
**Files:** `job-hunter.dto.ts:57`, `portfolio-showcase.ts:6,51`, `job-hunter.service.ts:23,114`
**Issue:** Three different caps for `sample_program_urls`:
- DTO `@ArrayMaxSize(PORTFOLIO_MAX_SAMPLE_PROGRAMS)` = 10
- `checkSampleProgramUrls` rejects > `PORTFOLIO_MAX_SAMPLE_PROGRAMS` (10) with `too_many`
- service `MAX_SAMPLE_PROGRAM_URLS` = 1 → throws `too_many_sample_urls` for >1

Net effect: the prior P2-1 fix (reject >1, code `too_many_sample_urls`) DOES fire
(service check runs first, at length 2..10), so the headline behavior is correct.
But the DTO allows 10 and `checkSampleProgramUrls`'s `too_many` branch (>10) is now
DEAD — the service's `>1` guard always trips first for 2..10, and the DTO
`ArrayMaxSize(10)` rejects 11+ before the service runs. Confirming severity.

## Checks (in progress)
- Schema fields: VERIFIED — Application.applicant_user_id, cover_note,
  @@index([applicant_user_id, created_at, id]); Applicant.user_id @unique, bio,
  headline, specialties, sample_program_url all exist.
- RLS/owner-scope: queries scoped to req.user.id (applicant_user_id / user_id).
- Identity: IDENTITY_OK
- LOC: 393 prod (under 400).
