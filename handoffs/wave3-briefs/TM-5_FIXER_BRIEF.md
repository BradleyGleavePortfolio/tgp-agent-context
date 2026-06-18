# TM-5 FIXER BRIEF — fix CI red (roles-enforced doctrine pin), then full suite green

**Lane:** TM-5 apply + pre-coach account (`ApplyController` + apply service + fit + cursor)
**PR:** #435
**Branch:** `feat/tm-5-apply-precoach`
**Worktree:** `/home/user/workspace/tgp/backend-tm-5-fix`
**Starting head SHA:** `15c64ae8f0d52fe9854765d3ed602aefb76e2745`
**Operator:** Bradley Gleave
**Role:** FIXER (not builder, not auditor). Get CI green first, then prepare for adversarial dual-audit.

---

## CONCRETE FAILURE — root cause already identified

CI run 27738060504 (build-and-test FAILURE on head 15c64ae). The failing test is `test/roles-enforced.spec.ts`:

```
[RolesEnforced] 4 route(s) are missing role decoration:
Route is ungated: ApplyController.applyToListing — add @Roles() or @Public()
Route is ungated: ApplyController.getMyProfile — add @Roles() or @Public()
Route is ungated: ApplyController.updateMyProfile — add @Roles() or @Public()
Route is ungated: ApplyController.myApplications — add @Roles() or @Public()
Fix: add @Roles("student"|"coach"|"owner") or @Public() to each listed handler.
```

This is exactly the doctrine-pin trip pattern documented in **R79** (repo-global doctrine pins trip CI when slice tests don't include them).

### Required fix

File: `src/talent-marketplace/apply.controller.ts`

Decide per route — DO NOT GUESS, read the route handler bodies + existing test expectations to determine the right role:

- `applyToListing` (POST): student submits an application → `@Roles('student')`
- `getMyProfile` (GET): student fetches their own pre-coach profile → `@Roles('student')`
- `updateMyProfile` (PATCH): student updates their pre-coach profile → `@Roles('student')`
- `myApplications` (GET): student lists their applications → `@Roles('student')`

(Verify by reading the handler implementations and checking what `req.user.sub` is used for — if it pulls a student record, the role is student.)

Import the `@Roles` decorator from the canonical location — grep `src` for `@Roles(` in another controller (e.g. `src/talent-marketplace/talent-marketplace.controller.ts` if it exists, or any controller that uses roles).

---

## Beyond CI green — prepare for adversarial dual audit

Per **R81** + operator directive ("we dont merge until we are clear of P0-P3's entirely"), after CI is green you will be re-audited by dual GPT-5.5 (Lens A correctness/security/RLS + Lens B tests/contracts) and the bar is CLEAN_NO_FINDINGS.

This is the FIRST audit of TM-5 (no prior findings list exists), so during your fixer pass you must also self-sweep against the **operator invariants** the auditors will check:

### Self-audit checklist (apply to your final diff)

1. **R71 file ownership**: `git diff --name-only origin/main..HEAD` must return ONLY:
   - `src/talent-marketplace/__tests__/application-cursor.spec.ts`
   - `src/talent-marketplace/__tests__/apply-fit.spec.ts`
   - `src/talent-marketplace/__tests__/apply.controller.spec.ts`
   - `src/talent-marketplace/__tests__/apply.service.spec.ts`
   - `src/talent-marketplace/application-cursor.ts`
   - `src/talent-marketplace/apply-fit.ts`
   - `src/talent-marketplace/apply.controller.ts`
   - `src/talent-marketplace/apply.dto.ts`
   - `src/talent-marketplace/apply.service.ts`
   - `src/talent-marketplace/talent-marketplace.module.ts`

2. **R74 commit identity**: EVERY commit author = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Verify:
   ```bash
   git log origin/main..HEAD --format='%h %an <%ae>' | grep -v '^[a-f0-9]* Bradley Gleave <bradley@bradleytgpcoaching.com>$' && echo "VIOLATION" || echo "R74 PASS"
   ```

3. **Banned tokens** (P0 fail): grep your diff for `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`. Allowed: `@ts-expect-error <reason>` + narrow concrete casts.
   ```bash
   git diff origin/main..HEAD -- 'src/**' '__tests__/**' | grep -E '@ts-ignore|as any|as unknown as|as never|\.catch\(\(\)=>undefined\)|Coming soon'
   ```

4. **PII safety on apply payloads**: Re-read `apply.service.ts` and `apply.dto.ts` — the "Apply" payload to the hirer MUST be PII-allow-listed (no student email, phone, full address, etc., unless the operator's PII policy explicitly allows). Verify via Object.keys assertion in `apply.service.spec.ts`. If the audit finds PII leakage this lane DIES on operator PII sign-off regardless of CI.

5. **Idempotency**: If the apply endpoint has idempotency (e.g. via `Idempotency-Key` header or natural key), verify the test asserts a duplicate call returns the original result without double-insert.

6. **RLS / owner-scope**: `myApplications` MUST scope to `req.user.sub` (the calling student's ID). Verify via test that a different `sub` cannot read another student's applications.

7. **Throttle**: Apply endpoint should have a per-user throttle to prevent spam — verify `@Throttle({default:{ttl:..., limit:...}})` is present and tested (similar to TM-3's controller pattern).

8. **Doctrine pin sweep (R79)**:
   ```bash
   npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
   ```

9. **Full suite (R66)** before final push:
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand
   ```

10. **Streamline self-check**: scan for dead code, unused imports, one-method wrapper classes, premature abstraction. Remove without breaking tests.

---

## Hard rules — quote these in your final summary

**R0 — DECACORN QUALITY**: A student-facing apply endpoint is high-stakes peak-moment surface. Apple/Notion/Google would scrutinize error handling, latency, accessibility of error messages, and idempotency. Apply R0 to error copy especially.

**R52 — push every 2 min** (operator verbatim 2026-06-13): "Make sure code is pushed every 2 min/done in github live". After EVERY commit, immediately `git push origin feat/tm-5-apply-precoach` using `api_credentials=["github"]`.

**R64 — never lose anything**: If you discover any new operator-relevant rule/idea/landmine, upload to `tgp-agent-context` IN THE SAME TURN, R74-clean.

**R65 — 50-failures sweep**: Run the diff against `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`. Failure #36 (Silent Failures / Swallowed Errors) is P1.

**R66 — full suite pre-push**: Mandatory before final push.

**R72 — exhaustive audit awareness**: The next audit will sweep exhaustively. Pre-empt findings by self-applying the checklist above.

**R74 — operator identity** (operator verbatim): "every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + m yemail". EVERY commit:
```bash
git -c user.name='Bradley Gleave' \
    -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "TM-5: <subject>"
```

**R75 — push discipline NON-NEGOTIABLE**: After EVERY single commit, the IMMEDIATE next action MUST be `git push origin feat/tm-5-apply-precoach`. Operator monitors push frequency. Silence = stalled = cancelled.

**R77 — lane scope discipline**: 10 owned files listed above. Anything outside requires operator authorization. Document blockers in `BLOCKERS.md` and stop.

**R79 — doctrine-pin sweep**: The root cause of the current CI red IS a doctrine-pin trip. After fixing the immediate issue, run the full doctrine sweep to catch any other pins.

**R81 — auditor gate**: Dual GPT-5.5 re-audit at new head SHA. Bar = CLEAN_NO_FINDINGS BOTH lenses. P3s block under R81.

**PII gate (TM-5 specific)**: Even on dual-CLEAN, this PR will NOT auto-merge — operator owes a manual PII sign-off. Make the PII story easy to verify (exact key-set Object.keys assertions in the spec) so the operator can approve quickly.

**BANNED TOKENS:** `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`. (Allowed: `@ts-expect-error <reason>` + narrow `as { concrete: shape }`.)

---

## Workflow

1. `cd /home/user/workspace/tgp/backend-tm-5-fix`
2. `npm ci` if node_modules missing
3. **First commit** — add `@Roles('student')` to the 4 ApplyController routes (the CI-red root cause). Push immediately.
4. Run `npm test -- --testPathPatterns='roles-enforced' --runInBand` — must pass.
5. Run the full doctrine sweep (R79) — fix any other pins that trip.
6. Self-apply the 10-point audit checklist above; commit + push each remediation individually.
7. Run full suite (R66) — fix any remaining failures.
8. Final push, then return with summary.

## Return contract

Your final summary MUST include:
1. **Final pushed head SHA** of `feat/tm-5-apply-precoach`
2. **CI status** of the final SHA (all 4 required checks: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests` must be SUCCESS)
3. **Per-fix commit table**: what was fixed → commit SHA → file
4. **Self-audit checklist results** (all 10 points)
5. **Push timeline**: every commit + push timestamp
6. **PII story summary** for operator sign-off (1 paragraph + the exact `Object.keys` assertion location)
7. **Any blockers** → write to `BLOCKERS.md` rather than self-authorize

**Model**: Opus 4.8 (`claude_opus_4_8`). Subagent type: `codebase`.
**Estimated effort**: 3-7 commits, the @Roles fix is ~4 lines + import; rest is test hardening + PII assertions. Push after each.
