**[133] B31-D1 — wire Roman to the coach AI credit pool.** Owner decision 133-13 (17:58): "definetely fix the roman AI credit pool issue, thats a huge one! Wire roman up".

**Depends on b#891.** This branch is stacked on the b#891 head (2d48f99c) with base main, so the diff against main includes b#891's 6 files. This PR's own change is 5 files, +189/-12 (commit 1519f9f1). Merge b#891 first.

## WHY / WHEN / WHO
- **Root cause.** It is the same defect as B31 (see b#891). Three Roman classes take `@Optional() budget: CoachAIBudgetService | null = null` with no `@Inject` token:
  - `src/roman/roman.service.ts`
  - `src/roman/background/roman-background-spend.ts`
  - `src/roman/playbook/roman-coach-method.augmenter.ts`

  With strictNullChecks the parameter metadata is `Object`, so Nest injected nothing.
- **Effect in production (from the code):**
  - No Roman turn was ever checked against, or debited from, the coach's monthly pool (B-668-1).
  - Background Roman spend never used the pool.
  - The coach-method playbook block (R11-P4, FEATURE_ROMAN_PLAYBOOK on) could never resolve a head coach, so it never appeared.
- **When / who (from `git log -S`).** The pattern is the same in all three.
  - RomanService `budget`: dabed738 (2026-10-05, B-ROMAN-BFIX-121 round 1).
  - RomanBackgroundSpendService: 3e0954aa (2026-10-06, R11-00 seams).
  - RomanCoachMethodAugmenter: 085e9cb2 (2026-10-07, R11-P4).

## Change
- Explicit `@Inject(CoachAIBudgetService)` on all three parameters. Nothing else changes: the pool rules, copy, amounts and the playbook block are exactly as the code already defines them.
- **No new money, no Stripe change, no new grant amount.** A coach whose pool was never initialised is not refused. `CoachAIBudgetService.getOrCreateCurrentPeriod` (the existing grant logic) creates the documented default period on the first read: `base_actual_cents = resolveMaxActualCents()`, which is `COACH_AI_MAX_ACTUAL_CENTS_DEFAULT = 4000` in `ai-credits.constants.ts` (displayed 12500), with packs 0 and used 0. A coach who spent the pool gets the existing 402 `COACH_AI_BUDGET_EXHAUSTED` with the existing copy.

## Production pool check (SELECT only, Supabase rpyfdsgxxltzutgqeouk, 18:0x PDT)
**0 coaches would be refused today.**

| Item | Count |
| --- | --- |
| Coaches with active (non-deleted) student clients | 1 (1 client) |
| Open sub-coach assignments | 0, so that coach is its own pool |
| That coach's pool | CoachAIBudget row exists; period 2026-10-01 to 2026-11-01; base_actual_cents 4000; packs 0; actual_used_cents 0 |
| Other live coaches (3 total) | no pool row; they get the default period above on their first Roman turn |
| Exhausted pools | 0 |
| Pools with a stale period | 0 |

A turn needs a whole worst-case turn (times the tool rounds) of headroom, which is a few cents against a 4000-cent pool. Coachless students and owners have no pool and are never refused by it.

## Tests
- **`test/roman/roman-context-wiring-b31.spec.ts`** (default suite).
  - The DI guard now allows NO silently dropped optional parameter in RomanModule (`KNOWN_UNWIRED` is empty).
  - A new case checks that all three classes receive CoachAIBudgetService through Nest DI.
  - **Fails 2 of 8 without this PR's source change; passes with it** (seen in a test).
- **`test/roman/roman-coach-pool-b31d1.live.spec.ts`** (real Postgres, gated on `MWB3_TEST_DATABASE_URL`; run locally 6 of 6). The cases:
  - A never-initialised pool gets the documented default period and the turn is admitted.
  - A coach uses the same pool.
  - A turn is debited.
  - A spent pool gets 402 `COACH_AI_BUDGET_EXHAUSTED` for the client.
  - A coachless student is never refused.
  - The augmenter resolves the head coach.
- **Existing specs re-run, all passing:** roman-c2-pool (4), r11-coach-method (11), r11-seams (22), roman.controller (17), roman.service (51), ai-credits-exact-metering (15), r11-playbook-builder (16), roman-notes.writer (8), roman-launch-hardening (60).
- **Checks:** `tsc --noEmit` is clean. eslint shows no new findings.

## Not seen
Not run on a device or against production traffic. NEED `.github/workflows/ci.yml` (not lane 133): add both live specs (`roman-context-null-lists.live.spec.ts`, `roman-coach-pool-b31d1.live.spec.ts`) to the mwb-3-live-tests job.

agent 133
