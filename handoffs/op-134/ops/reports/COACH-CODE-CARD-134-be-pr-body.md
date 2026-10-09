TIER: T2 (coach-authored public card text added to an existing authenticated response; no write, no new query)
JOB: COACH-CARD-134 follow-up (operator 21:4x: proposal 1 = YES). Lenses: SLICE D (LN-OPUS-D-134 + LN-SOL-D-134).
BUG IDS: B03.

## What
- `CoachCodeLookupService.coachCard` (used by `POST /coachless/coach-code/check`, `/coachless/coach-code/redeem` and the coachless
  featured coach) now also returns `headline` (K1 headline, else the K1 bio, or `null`) and `specialties` (known K2 keys, max five,
  coach's order, or `[]`). Same rule as `GET /invite/:code/preview` (b#897). It is the same `user.findUnique`, with two more
  columns in the nested `coach_profile` select.
- The rule now lives once: `publicCoachCardFields()` in src/coach/consultation/coach-consultation.vocab.ts. b#897's local
  `coachCardFields` in invite-codes.service.ts is replaced by it (same behaviour; its 32 tests still pass).
- README (src/coachless) documents the two fields.

## Mobile contract (mobile PR for the coach-code sheet reads this)
`coach` in check / redeem: `{ id, name, photo_url, business_name, bio, headline: string | null, specialties: string[] }`.

## Tests (local, heavy.sh)
- test/coachless/coach-code-redemption.spec.ts 31/31 (2 new: headline + specialties with unknown key dropped and cap 5; bio
  fallback, then null / [] when nothing is set).
- test/coachless/coachless-home.spec.ts 20/20, test/invite-codes.service.spec.ts 32/32, test/e2e-saas-smoke.spec.ts 21/21.
- Targeted tsc (changed files + specs) clean; eslint clean; check-r75 staged: no positive token change.

## WHY / WHEN / WHO
- WHY: `coachCard` (src/coachless, the coachless coach-code sheet's card; 619c28a6, 2026-10-05, "COACHLESS split 2/3 - flag,
  errors, featured coach, coachless Home and Roman card") selects business_name and bio only; the consultation's
  K1/K2 card answers (b#894, 2026-10-08) reached the invite preview in b#897 but not this second join door.
- WHO: agent 134 (COACH-CARD-134).

agent 134
