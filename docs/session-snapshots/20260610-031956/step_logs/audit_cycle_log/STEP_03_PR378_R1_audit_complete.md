# Audit Cycle — Step 03: PR #378 R1 Audit Complete (Roman Phase 1)

**Date:** 2026-06-09 17:15 PDT
**PR:** #378 — Roman Phase 1 chat MVP backend
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Branch:** `feat/roman-phase-1-chat` · Head `1aaf6d44` · Base `6c4f618c` (MWB-1)
**Auditor:** GPT-5.5 (subagent id `pr_378_r1_audit_roman_phase_1_mq7b6f7z`)
**Worktree:** `/home/user/workspace/tgp/backend-roman-audit` (detached @ `1aaf6d44`)

## Verdict: CLEAN (with 2 DIRTY-MINOR P2 conformance issues to fix)

| Severity | Count | Codes |
|---|---|---|
| R1-P0 | 0 | — |
| R1-P1 | 0 | — |
| R1-P2 | 3 | R1-P2-1 (rate limit 403 vs 429), R1-P2-2 (SSE abort not forwarded), R1-P2-3 (UUID validation moot) |
| R1-P3 | 3 | format-churn framing, subject_context_json type, RLS helper search_path stricter than brief |

## What's correct (verified)

- **Schema additivity:** whitespace-ignored diff shows ONLY Roman enums/models + 2 User back-relations. MWB-1 models untouched.
- **MWB-1 lane files:** empty diff for `src/workout-programs/`, `src/ai/coach-ai.service.ts`, `src/ai/materializers/assign-workout.materialiser.ts` (R31 + non-collision satisfied).
- **Migration safety:** 4772-line from-empty diff has **zero** DROP statements.
- **RLS verified live via `pg_catalog`:** both RomanSession and RomanMessage tables have `ENABLE` + `FORCE`; all 7 policies present; predicates use `app.current_user_id()` / `app.is_owner()`; BOTH USING + WITH CHECK clauses; RomanMessage defence-in-depth via session-join.
- **Voice contract:** baked verbatim from `AI_BUTLER_ROMAN_IDENTITY_SPEC.md` §0/§1/§1.4/§1.5; no emoji; exclamation/quip ceilings encoded in the prompt.
- **Feature flag:** guard returns **404** (not 403) at the controller scope for ALL 4 routes; default-off behavior tested; service re-checks before any Anthropic call.
- **Anthropic key:** env-only, never hardcoded, never logged; model name pinned.
- **Gates:** tsc 0 errors, eslint 0 errors; 53/53 non-RLS Roman tests pass; declared count `77 = 77`; no `.skip`/`.only`/`xit`.

## Findings to fix

### R1-P2-1 — Rate limit response code wrong (FUNCTIONAL)
- **File:** `src/roman/roman.service.ts:292`
- **Issue:** Rate limit guard throws HTTP **403** but the brief §3 specifies HTTP **429 Too Many Requests** (semantic correctness; clients distinguish between "you can't" and "you've sent too many — try again later").
- **Fix:** Throw `HttpException(..., 429)` or NestJS `ThrottlerException`-equivalent.

### R1-P2-2 — SSE disconnect doesn't forward AbortSignal to Anthropic SDK (FUNCTIONAL)
- **File:** `src/roman/roman.service.ts:375-386`
- **Issue:** When the SSE client disconnects, the local read loop aborts, but the upstream call to the Anthropic SDK is not given the `AbortSignal`. The provider stream continues running on Anthropic's side (orphan/leak — costs credits, holds server resources).
- **Fix:** Plumb an `AbortController` through to the Anthropic client call (`anthropic.messages.create({..., signal: controller.signal})`); on client disconnect, call `controller.abort()`.

### R1-P2-3 — Session :id not UUID-validated (BRIEF-CONFORMANCE, MOOT)
- **Auditor note:** brief §9 required UUID validation on `:id`, but IDs are CUID2, not UUID, so the validation would actually be wrong. **Effectively moot** — the brief was slightly off-spec but the implementation is correct. **No code change required.**

## P3 informational (accepted)

- R1-P3-1: cosmetic format-churn framing in a few prompt strings (low priority polish)
- R1-P3-2: `subject_context_json` type could be tightened (cosmetic)
- R1-P3-3: RLS helper search_path is STRICTER than brief wording (more locked down than asked — acceptable, no change)

## Caveat from the auditor (worth noting, not a regression)

24 RLS tests are well-formed and the policies are verified directly via `pg_catalog` inspection. But the suite couldn't be driven to green in the audit sandbox because `service_role` lacks TRUNCATE on the harness-recreated throwaway tables — a sandbox grant limitation, not a code defect. The new `rls-live-tests` CI job (added in PR #268) gives Roman the same harness if the migration-chain works there.

## Gates re-run

- prisma format → no diff ✅
- prisma migrate diff → additive only, no DROP ✅
- tsc --noEmit → exit 0 ✅
- eslint → 0 problems ✅
- Roman tests → 53/53 non-RLS pass ✅
- Test count claim 77 verified, no skips ✅

## Required next action

1. Fix R1-P2-1 (rate limit → 429)
2. Fix R1-P2-2 (forward AbortSignal to Anthropic SDK)
3. R1-P2-3 noted as moot (no fix)

These are small, surgical changes. Dispatch Opus 4.8 fixer.

## Deliverables produced this step

- `/home/user/workspace/AUDIT_R1_PR_378_REPORT.md` — full structured report
- `/home/user/workspace/PR378_R1_AUDIT_RESULT.md` — verdict summary
- PR comment posted: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/378#issuecomment-4665252707

## Next step in cycle

**Step 04:** Dispatch PR #378 fixer (Opus 4.8) — rate limit 429 + SSE AbortSignal plumbing — push to existing PR branch `feat/roman-phase-1-chat`.
