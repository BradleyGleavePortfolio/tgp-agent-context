# HK-6b Backend R2 Fixer Brief — Don't swallow non-auth errors from `assertCoachOwnsClient`

**Role:** Fixer (Opus 4.8, `general_purpose` subagent type)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #361 (OPEN) — branch `dynasia/pr-hk-6b-preferences-coach-on-behalf`
**Stack on:** PR #361 head `e39cd8f99861ce7da9973a9431010813e5167309`
**Branch:** continue pushing to the same branch `dynasia/pr-hk-6b-preferences-coach-on-behalf` (additional commit on top — DO NOT open a new PR)
**Audit verdict that triggered R2:** NEEDS_R2 from GPT-5.5 code audit. Single blocking finding, R65 #36.

## Bradley R0 LAW (re-stated)
- NO "Coming soon" strings in any form. NO `@ts-ignore`/`@ts-nocheck`/`as any`/`as unknown as`/`as never as X`/`as never`. NO `.catch(()=>undefined)`. NO `catch(e){}`. NO spinner-only states.
- `@ts-expect-error` with one-line justification allowed.
- Author EVERY commit: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By` trailers; body OK.
- R0 grep on additions-only diff must return empty.

## The single finding

**R65 #36 silent-failure regression** in `src/wearables/preferences/preferences.controller.ts` around lines 237–244.

`resolveEffectiveUserId` wraps `this.insights.assertCoachOwnsClient(callerId, targetUserId, role)` in a bare `try/catch` and ALWAYS throws `ForbiddenException({ error: 'WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN', target_user_id })`. That helper only uses `ForbiddenException` for the no-assignment case (`src/wearables/insights/wearable-insights.service.ts:86–98`); other errors (DB connection failure, programmer error, etc.) should propagate as their real type so they surface as honest 5xx — not as a misleading 403 that tells the coach they're "not allowed" when actually the DB is down.

### Required fix (controller-only)

In `resolveEffectiveUserId` (preferences.controller.ts):

```ts
try {
  await this.insights.assertCoachOwnsClient(callerId, targetUserId, role);
} catch (err) {
  if (err instanceof ForbiddenException) {
    // Authorization denied — remap to the stable HK-6b 403 contract
    // so the body is the same regardless of whether the caller is a
    // student writing to a peer or a coach without the assignment.
    throw new ForbiddenException({
      error: 'WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN',
      target_user_id: targetUserId,
    });
  }
  // Anything else (DB, programmer, etc.) propagates as its real type
  // so it surfaces as an honest 5xx, not a misleading 403 (#36).
  throw err;
}
return targetUserId;
```

Import `ForbiddenException` from `@nestjs/common` if not already imported (it is — already used).

Do NOT add a generic Error catch-all anywhere. Do NOT use `instanceof HttpException` — narrow specifically to `ForbiddenException` because that is the only authorization-denial type the helper can throw. If the helper later starts throwing `UnauthorizedException` (401) for a different reason, that should propagate verbatim (not be silently remapped to 403).

## Required tests (controller spec)

In `test/wearables/preferences.controller.spec.ts`, add tests that:

1. **POST: non-Forbidden error from `assertCoachOwnsClient` propagates as its real type and the preferences service is NOT called.**
   - Mock `insights.assertCoachOwnsClient.mockRejectedValueOnce(new Error('db down'))`.
   - Caller: a `coach` with `target_user_id` ≠ self (so the helper is invoked).
   - Expect the controller call to reject with `Error('db down')` (or `rejects.toThrow('db down')`).
   - Assert `prefs.upsert` was NOT called (the resolution failed before dispatch).

2. **DELETE: same shape.**
   - Same coach + cross-user query target.
   - Same mockRejectedValueOnce.
   - Expect propagation.
   - Assert `prefs.remove` was NOT called.

3. **(Sanity) The existing `ForbiddenException` from the helper still remaps to the stable HK-6b 403 body.**
   - The existing "coach unassigned" tests already cover this — verify they still pass and explicitly assert the response body is `{ error: 'WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN', target_user_id: <uuid> }`. If they don't already assert the body shape, tighten them to do so now.

## Mandatory verification (capture full output)

```bash
git fetch origin main
git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}' || echo "R0_CLEAN"
npm ci 2>&1 | tail -3
npx tsc --noEmit 2>&1 | tail -10
npx eslint src/wearables/preferences/ 2>&1 | tail -10
# Backend uses --testPathPatterns (plural)
npx jest --testPathPatterns='wearables/preferences' --silent 2>&1 | grep -E '^Tests:|^Test Suites:|FAIL'
npx jest --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
git log origin/main..HEAD --format='AUTHOR=%an <%ae>%n--TRAILERS--%n%(trailers:only=true,unfold=true)%n--END--'
git rev-parse HEAD
```

## Commit

One commit suffices:
```
fix(wearables): HK-6b R2 — propagate non-Forbidden errors from assertCoachOwnsClient (R65 #36)
```

Body should reference the audit finding and the controller line range, and include the full R1 head SHA `e39cd8f99861ce7da9973a9431010813e5167309` (R55).

Author: `Dynasia G <dynasia@trygrowthproject.com>`, no banned trailers.

## Report back
- Final head SHA pushed to `dynasia/pr-hk-6b-preferences-coach-on-behalf`.
- R0 grep result.
- tsc / eslint / Jest counters (preferences dir + full suite).
- Confirmation `ForbiddenException` narrow type-check is in place (not generic catch-all).
- Confirmation 2 new tests added (POST + DELETE non-Forbidden propagation) and existing 403-body assertions tightened.

## Reference
- Audit: `/home/user/workspace/_audit_HK_6b_backend_code_GPT55.md`
- Original brief: `/tmp/tgp-agent-context/_builder_brief_HK_6b.md`
- Quality refs: `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
