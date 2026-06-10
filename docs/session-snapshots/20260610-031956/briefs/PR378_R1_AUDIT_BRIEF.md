# PR #378 R1 Audit Brief — Roman Phase 1 Chat MVP Backend

**Role:** GPT-5.5 R1 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #378 · Branch `feat/roman-phase-1-chat` · Head SHA `1aaf6d44` · Base `6c4f618c` (MWB-1 #376)
**Worktree:** `/home/user/workspace/tgp/backend-roman-audit` (detached @ `1aaf6d44`)
**Verdict rubric:** CLEAN / DIRTY-MINOR (cosmetic only) / DIRTY (functional)

## Context

Builder shipped Roman Phase 1 chat MVP backend per `/home/user/workspace/ROMAN_PHASE1_BUILDER_BRIEF.md` and result file `/home/user/workspace/ROMAN_PHASE1_BUILDER_RESULT.md`.

**Claimed deliverables:**
- New module: `src/roman/**` (controller, service, prompts, module, feature flag guard, anthropic-client provider, DTOs, constants)
- Prisma additions: `RomanSession`, `RomanMessage` models + migration `20261216000000_add_roman_chat/migration.sql`
- 77 Roman tests: 34 unit (prompts 19 + service 15) + 19 integration (controller 13 + streaming 6) + 24 RLS
- Voice contract `ROMAN_VOICE_CONTRACT` baked verbatim from `AI_BUTLER_ROMAN_IDENTITY_SPEC.md` §0/§1/§1.4/§1.5
- Feature flag `FEATURE_ROMAN_CHAT_ENABLED=false` default; guard returns 404 when off
- RLS: owner-self + service_role bypass + RomanMessage defence-in-depth
- SSE streaming endpoint for live token feed
- All Roman suites green (77/77), fast-lane R70 (15/15), module-graph + hygiene (62/62), e2e boot (21/21). Full monorepo R66 OOM/timeout — env limitation noted.

## Audit scope

1. **Schema additivity** — `git diff 6c4f618c..1aaf6d44 -- prisma/schema.prisma` must show ADD-ONLY (no destructive change to existing models; MWB-1 snapshot models must still be present and unmodified).

2. **Migration safety** — `prisma/migrations/20261216000000_add_roman_chat/migration.sql`:
   - No DROP, ALTER COLUMN TYPE-destructive, or RENAME on existing tables.
   - All new constraints have `IF NOT EXISTS` where appropriate.
   - RLS: pinned `search_path = pg_catalog, public, app, pg_temp` on any new function (pg_temp LAST), SECURITY DEFINER, CREATE OR REPLACE.

3. **MWB-1 untouched** — `git diff 6c4f618c..1aaf6d44 -- src/workout-programs/ src/ai/coach-ai.service.ts src/ai/materializers/assign-workout.materialiser.ts` must be empty (R31 + non-collision rule).

4. **Roman voice contract** — verify `src/roman/roman.prompts.ts` contains the Alfred archetype constraints verbatim:
   - No emoji
   - Contractions only in rare quip (1-in-8 quip frequency)
   - One exclamation per session ceiling
   - Tone descriptors from §0/§1/§1.4/§1.5 of `AI_BUTLER_ROMAN_IDENTITY_SPEC.md`
   Compare against the spec file in `agentctx-roman-identity/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md`.

5. **Feature flag enforcement** — `src/roman/roman-feature.guard.ts`:
   - When `FEATURE_ROMAN_CHAT_ENABLED !== 'true'`, every Roman route returns 404 (NotFoundException), not 403.
   - Guard applied at the controller level via `@UseGuards()` (all routes covered, not just some).
   - Test coverage proves default-off behavior: `FEATURE_ROMAN_CHAT_ENABLED unset → 404` AND `=='true' → 200`.

6. **RLS HECTACORN** — `test/rls/roman-rls.spec.ts`:
   - 24 tests cover: owner-self read (positive), cross-user read (negative), service_role bypass (positive), anon denial (negative), RomanMessage defence-in-depth (message-level RLS even if session leak).
   - Tests run against live PostgreSQL (no `.skip`).
   - Policy uses `auth.uid()` not `current_user`.
   - Both USING and WITH CHECK clauses on RomanSession and RomanMessage policies.

7. **SSE streaming integrity** — `src/roman/roman.controller.ts` and `roman-streaming.spec.ts`:
   - Stream emits `data: {…}` SSE lines with proper `Content-Type: text/event-stream`.
   - Token chunks don't leak provider-internal metadata (e.g. raw Anthropic event types unfiltered).
   - Cancel/disconnect path closes the upstream provider stream (no orphan).
   - Backpressure: if client slow, no unbounded buffer.
   - Error path: provider error → SSE `event: error` then close (no infinite retry).

8. **Anthropic client provider** — `src/roman/anthropic-client.provider.ts`:
   - API key from env, NOT hardcoded.
   - No `console.log` of the key (audit for accidental log).
   - Model name pinned (not auto-bumping).

9. **DTO validation** — `src/roman/roman.dto.ts`:
   - All request DTOs use class-validator decorators.
   - Message content length bounded (no unbounded user input that could DoS the LLM).
   - Session ID is UUID-validated.

10. **Re-run gates** in the worktree:
    ```bash
    cd /home/user/workspace/tgp/backend-roman-audit
    ./node_modules/.bin/prisma format
    ./node_modules/.bin/prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma | grep -i 'drop' && echo FAIL || echo PASS
    ./node_modules/.bin/tsc --noEmit
    ./node_modules/.bin/eslint src/roman test/roman test/rls/roman-rls.spec.ts
    npm test -- --testPathPattern='roman' 2>&1 | tail -30
    ```
    Cross-check the claimed 77 test count; any `.skip` or `xit` should be flagged as P2.

## Findings format

R1-P0 (blocker, must fix) / P1 (must fix this PR) / P2 (functional minor / should fix) / P3 (cosmetic) with file:line refs.

Specifically look for:
- Voice contract drift (emoji in any prompt string, exclamation-frequency >1 in seed prompts, etc.)
- RLS policy on RomanSession with WITH CHECK missing → cross-tenant write possible
- Feature flag bypass: any route not under the guard
- Anthropic key logged anywhere
- Streaming endpoint without abort handler

## Deliverables

1. `/home/user/workspace/AUDIT_R1_PR_378_REPORT.md` — structured R1 report
2. `/home/user/workspace/PR378_R1_AUDIT_RESULT.md` — short verdict summary
3. PR comment via `gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/378/comments` — top 5 findings + verdict

## Constraints

- READ-ONLY.
- Do NOT use `gh pr comment` — use `gh api` directly.
- `gh` with `api_credentials=["github"]`.
- The brief is authoritative; no web searches needed.
