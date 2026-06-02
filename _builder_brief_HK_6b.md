# HK-6b Builder Brief — Combined PR: Mobile 404 fallback removal + Backend preferences coach-on-behalf plumbing

**Role:** Builder (Opus 4.8, `general_purpose` subagent type)
**Scope:** TWO repos in ONE coordinated branch pair — both PRs land together.
  - **Backend:** `BradleyGleavePortfolio/growth-project-backend` @ `650cea4c461f8f5249c201bb8a0955e9c24b4cdf` (current `main`, post HK-6a merge)
  - **Mobile:** `BradleyGleavePortfolio/growth-project-mobile` @ `main` (use latest `origin/main` at clone time)

You may execute the two repo changes in either order. Recommend backend first because mobile's 404-fallback removal is contingent on HK-6a being live (it is — `650cea4`), but the mobile change has no dependency on the backend preferences plumbing.

**Branch names:**
- Backend: `dynasia/pr-hk-6b-preferences-coach-on-behalf`
- Mobile: `dynasia/pr-hk-6b-remove-404-fallback`

Open **two separate PRs** (one per repo), each titled `HK-6b: <repo-specific summary>`.

---

## Bradley R0 LAW (re-stated — at all times)
- NO "Coming soon" strings in production, comments, test titles, regex assertions, or docblocks. MUST NOT appear in the diff in ANY form including negation references like `/coming soon/i`.
- NO `@ts-ignore`, `@ts-nocheck`, `as any`, `as unknown as`, `as never as X`, `as never`. NO `.catch(()=>undefined)`. NO `catch(e){}`. NO spinner-only empty/error states.
- `@ts-expect-error` with a one-line justification IS allowed.
- **Author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By` trailers (body OK).
- **R0 grep on additions-only diff** (each repo separately) must return empty:
  ```bash
  git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
  ```

## Training docs you MUST abide
- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`

---

# Part A — Backend: Preferences coach-on-behalf-of plumbing

## Context

HK-FIX-3 (commit `f2ff1dd`, merged in `119e042`) decorated the preferences controller with `@Roles('student', 'coach')` and left two TODOs that say the **service-layer plumbing for coach-on-behalf** would land in HK-6b. That decoration alone is **incomplete** without the on-behalf-of plumbing because right now `coach` callers can hit the endpoint but the service silently writes to the **coach's own** preference row (which is not what coach-on-behalf means).

**TODOs to discharge** (file `src/wearables/preferences/preferences.controller.ts`):
- Lines 51–55: above `upsert`.
- Lines 101–102: above `remove`.

Both say: "the service currently writes to the caller's own (req.user.id) preference only. Coach-on-behalf-of an assigned client (Bradley option (ii)) requires the service/DTO to accept and validate a target clientId against the coach assignment relation."

**Bradley option (ii)** = explicit `target_user_id` in the request body (POST) or query param (DELETE), authorized via the existing **coach→client assignment** (the `user.coach_id` direct FK precedent used by `WearableInsightsService.assertCoachOwnsClient` at `src/wearables/insights/wearable-insights.service.ts:81–99`).

## Required implementation

### 1. DTO (file: `src/wearables/preferences/dto/upsert-preference.dto.ts`)

- Add an OPTIONAL `target_user_id` field to `UpsertPreferenceSchema`:
  ```ts
  export const UpsertPreferenceSchema = z
    .object({
      metric: z.nativeEnum(WearableMetricType),
      preferred_provider: z.nativeEnum(WearableProvider),
      target_user_id: z.string().uuid({ message: 'target_user_id must be a UUID' }).optional(),
    })
    .strict();
  ```
- Same for `DeletePreferenceParamSchema` — but path param `:metric` must remain typed as the enum; add a SEPARATE optional QUERY parameter `target_user_id` rather than mixing it into the path. Add `DeletePreferenceQuerySchema = z.object({ target_user_id: z.string().uuid().optional() }).strict()`.
- Re-export the new types.

### 2. Service (file: `src/wearables/preferences/preferences.service.ts`)

Refactor `upsert` and `remove` to take an **effectiveUserId** (the row owner) decoupled from the **callerId** (audit identity), and add `get` analogously. The service should NOT do authorization checks — that belongs in the controller (consistent with how `WearableInsightsService` factors it; the service is a pure persistence + structured-log layer).

```ts
async upsert(
  effectiveUserId: string,   // whose preference row to write (caller OR client)
  callerId: string,          // who initiated the write (for log)
  dto: UpsertPreferenceDto,
): Promise<PreferenceResponse>
```

The Prisma `upsert` uses `effectiveUserId` for `user_id`. The `logger.log` event includes BOTH `subject_user_id` (= effectiveUserId) and `actor_user_id` (= callerId) — when they differ, that's a coach-on-behalf write and the log explicitly captures it (50-Failures #34 + auditable trail).

Same shape for `remove`: take both ids, write the row on `effectiveUserId`, log both.

`get` does NOT need callerId — it's used internally by the precedence policy and doesn't write or audit. But if you do plumb a callerId into get for consistency, that's fine.

### 3. Controller (file: `src/wearables/preferences/preferences.controller.ts`)

Replace both TODOs with the actual implementation:

**Authorization rule** (mirror `WearableInsightsService.assertCoachOwnsClient`):
- If `target_user_id` is absent OR equals `req.user.id` → caller writes to their own row (existing behavior, no change).
- If `target_user_id` is present and DIFFERS from `req.user.id`:
  - If `req.user.role === 'student'` → **403 Forbidden** (`WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN`). Students can never write to another user's row.
  - If `req.user.role === 'owner'` → allow (platform admin bypass, consistent with the insights service).
  - If `req.user.role === 'coach'` → assert the coach owns the client via the existing pattern. Either:
    - **Inject `WearableInsightsService`** and call its existing `assertCoachOwnsClient(req.user.id, target_user_id, req.user.role)` directly (cleanest; service already exported and the comment at line 78 says "without editing it"), OR
    - **Extract `assertCoachOwnsClient` into a small shared helper** in `src/wearables/common/` and have both services consume it. Your call — pick whichever introduces less circular-dependency risk in `wearables/`. Inspect the module graph before deciding.
  - On success, the effective row id = `target_user_id`.

**Throw shape** for the 403: use `ForbiddenException` with `{ error: 'WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN', target_user_id }` (NEVER include the caller's id in the error body — 50-Failures #12 PII).

**Apply to both `@Post()` and `@Delete(:metric)`.** The DELETE path adds `@Query() rawQuery: unknown` and parses through `DeletePreferenceQuerySchema`.

**Throttle keying:** verify `@Throttle` still works correctly when the effective subject differs from the caller — the existing `@Throttle({ DEFAULT: { ttl: 60_000, limit: 60 } })` keys on caller IP/userId by default. A coach repeatedly hitting one client's row should NOT be able to use that to amplify per-client write rates beyond the global limit. If the throttler is per-caller, leave it; if it's per-effective-user, switch the key to caller. **Verify, don't assume — read `src/throttler/throttler.config.ts` and add a brief comment in the controller about which key is used.**

### 4. Tests

#### Service tests (`src/wearables/preferences/preferences.service.spec.ts` — create if missing, extend if present)

- `upsert` with `effectiveUserId === callerId` → writes to caller row, log contains `actor_user_id === subject_user_id`.
- `upsert` with `effectiveUserId !== callerId` → writes to target row, log contains both ids distinctly.
- `remove` parallel cases.
- `remove` for an absent override on the target row → still 204, log `existed:false` with both ids.

#### Controller tests (`src/wearables/preferences/preferences.controller.spec.ts` — create if missing)

Use the same factored-mock pattern from `wearable-insights.controller.test-helpers.ts` (so `PreferencesService` AND the coach-ownership check are mocked):

- `student` caller, no `target_user_id` → 200, service called with caller id for both.
- `student` caller, `target_user_id` = self id → 200, service called with caller id for both (canonicalised).
- `student` caller, `target_user_id` = some other UUID → **403 with `WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN`**, service NOT called.
- `coach` caller, `target_user_id` = assigned client → 200, service called with (target, caller).
- `coach` caller, `target_user_id` = UNassigned client → 403 from `assertCoachOwnsClient`, service NOT called.
- `owner` caller, any `target_user_id` → 200 (platform-admin bypass).
- DTO with unknown body key → 400 `WEARABLE_PREFERENCE_PAYLOAD_INVALID`.
- DTO with invalid UUID `target_user_id` → 400 `WEARABLE_PREFERENCE_PAYLOAD_INVALID`.
- DELETE: equivalent matrix using the `?target_user_id=…` query param.

#### E2E test (if there's a `*.e2e-spec.ts` for preferences)

Add at minimum one happy-path test for coach-on-behalf upsert hitting the real DB and verifying the row was written under the target client's `user_id` (not the coach's).

### 5. OpenAPI / Swagger

Update `@ApiBody` for upsert to include the optional `target_user_id` field (format: uuid). Update the operation `description` to mention the on-behalf semantics. Update `@ApiResponse` to add a 403 case with the new error code. For DELETE, add `@ApiQuery({ name: 'target_user_id', required: false, type: 'string', format: 'uuid' })`.

### 6. Remove the two TODO comments

Once implemented, **delete the `TODO(HK-6b)` blocks** at lines 51–55 and 101–102 of the controller. Replace with a single short docblock above the class explaining the on-behalf rule (one paragraph). Do NOT leave dangling TODO references.

## Backend verification (mandatory, capture full output)

```bash
git fetch origin main
git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}' || echo "R0_CLEAN"
npm ci 2>&1 | tail -3
npx tsc --noEmit 2>&1 | tail -10
npx eslint src/wearables/preferences/ 2>&1 | tail -10
# Jest config uses --testPathPatterns (plural) for backend
npx jest --testPathPatterns='wearables/preferences' --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
# Full backend suite — must remain green
npx jest --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
git log origin/main..HEAD --format='AUTHOR=%an <%ae>%n--TRAILERS--%n%(trailers:only=true,unfold=true)%n--END--'
git rev-parse HEAD
```

---

# Part B — Mobile: Remove the stale 404 `not_implemented` fallback

## Context

`src/api/wearableInsightsApi.ts:199–228` (`approveDraft`) coerces a 404 from `/v1/wearables/insights/approve` into a typed `{ status: 'not_implemented', message }` response, with a comment explicitly stating "HK-6 lands the real controller." HK-6a merged on backend at `650cea4`, so the endpoint is now live. The 404 branch is dead code — keeping it pretends a real implementation bug (deploy issue, route registration regression, etc.) is the expected "not yet live" path, exactly the silent-failure pattern (50-Failures #36) the comment originally guarded against.

## Required implementation

### 1. API layer (`src/api/wearableInsightsApi.ts`)

- **Remove** the entire 404-coercion branch (lines ~211–224, the `if (axios.isAxiosError(err) && err.response?.status === 404)` block).
- **Remove** the `not_implemented` member of `ApproveResponseSchema` (the discriminated union member at lines 161–164).
- **Remove** `APPROVAL_PENDING_MESSAGE`.
- **Update** the file-level docblock and the `ApproveResponseSchema` comment to reflect the new state (HK-6a live → `ApproveResponse` is always `{ status: 'ok', draft_id, materialised_at }`).
- **Simplify** `approveDraft`'s catch to just `if (err instanceof z.ZodError) throw err; throw err;` (or just `throw err` since ZodError already extends Error). The function should propagate all axios errors.

### 2. Hook (`src/hooks/useWearableInsight.ts`)

- The `useApproveDraft` `onSuccess` currently checks `if (res.status === 'ok')` before invalidating. Since `'ok'` is now the only success variant, this check is redundant — but keep it for forward-compat if you prefer. Either: (a) remove the conditional and always invalidate on success, or (b) keep it as a defensive check. Either is acceptable; prefer (a) for honesty (the hook no longer has a branching shape to defend).
- Update the file-level docblock to remove the "404 coerced to not_implemented" language. The docblock should now say: errors propagate to the caller's `onError`; no silent swallowing.

### 3. Coach panel (`src/screens/coach/client-detail/WearableInsightPanel.tsx`)

This is where the user-facing fallback lives. Affected lines (approximate, may have shifted):
- The "pre-HK-6 not_implemented" docblock at lines 21, 373, 398, 425.
- The branch that renders calm copy + keeps the sheet open when `result.status === 'not_implemented'`.

**Required changes:**
- Remove the `not_implemented` branch entirely.
- Update the `approveDraft` mutation's `onSuccess` to handle ONLY the `'ok'` case — close the sheet, show a success toast, or whatever the original `'ok'` path does.
- Errors from `approveDraft` now go through `onError` and render the panel's existing error state (the same one that handles other approve failures). Verify the existing error state has user-friendly copy — if it currently relies on the calm "rolling out" message, replace with a generic recoverable copy like "Couldn't send right now. Try again." (NEVER include raw error internals).
- Remove the `not_implemented` docblock references at the file head and in any inline comments.

### 4. Tests

- `src/hooks/__tests__/useWearableInsight.test.tsx` — remove the `not_implemented` test cases (e.g. "does NOT invalidate on not_implemented"). Add (if not present) a test that asserts a 404 from `approveDraft` now PROPAGATES as an error (not coerced to `not_implemented`), and that `onError` fires.
- `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx` — remove "on not_implemented result, keeps the sheet open" test (lines 213+). Replace with a test asserting that a 404 (or any axios error) from approve surfaces the panel's error state and offers a retry CTA.

### 5. Banned-string sweep

After your changes, grep the diff for any residual `not_implemented`, `APPROVAL_PENDING_MESSAGE`, `not yet live`, `pre-HK-6`, "rolling out" — these should all be gone from the changed files (they may still appear in unrelated files; only your diff should be clean).

## Mobile verification (mandatory)

```bash
git fetch origin main
git diff origin/main..HEAD | grep -E "^\+" | grep -v "^+++" | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}' || echo "R0_CLEAN"
# Mobile Jest uses --testPathPattern (singular)
npm ci 2>&1 | tail -3
npx tsc --noEmit 2>&1 | tail -10
npx eslint src/api/wearableInsightsApi.ts src/hooks/useWearableInsight.ts src/screens/coach/client-detail/WearableInsightPanel.tsx 2>&1 | tail -10
npx jest --testPathPattern='wearableInsight|WearableInsightPanel|useWearableInsight' --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
# Wearables-related dir runs to confirm no regression
npx jest --testPathPattern='src/screens/coach/client-detail' --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
npx jest --testPathPattern='src/api' --silent 2>&1 | grep -E '^Tests:|^Test Suites:'
git log origin/main..HEAD --format='AUTHOR=%an <%ae>%n--TRAILERS--%n%(trailers:only=true,unfold=true)%n--END--'
git rev-parse HEAD
```

---

## Commit splits (suggested, both repos)

**Backend** — 1–2 commits acceptable:
- `feat(wearables): HK-6b — preferences coach-on-behalf-of plumbing (target_user_id + assertCoachOwnsClient)`
- (optional second commit for tests if it makes review cleaner)

**Mobile** — 1 commit:
- `chore(wearables): HK-6b — remove stale 404 not_implemented approve fallback (HK-6a live)`

Both authors: `Dynasia G <dynasia@trygrowthproject.com>`, no banned trailers.

---

## Report back format

Two separate sections, one per repo:
- **Backend:** final head SHA, PR url (or "ready to open"), R0 grep result, tsc/eslint/jest counters (preferences dir + full suite), commit titles, brief description of authorization wiring (injected `WearableInsightsService` vs. extracted shared helper), how you logged actor-vs-subject distinction.
- **Mobile:** final head SHA, PR url, R0 grep result, tsc/eslint/jest counters, commit titles, confirmation `not_implemented` is gone from source AND tests, what user-facing error copy you settled on for the panel's error state.

If either repo's full test suite has unrelated pre-existing failures (the backend "Fly Deploy" infrastructure issue is preexisting and unrelated to code), surface them explicitly so the auditor can distinguish your work from baseline noise.

## R55 / R64 reminders
- **R55:** any reference to a SHA in commit bodies must be the full 40-char SHA.
- **R64:** this brief is already committed to `tgp-agent-context`; capture your final SHAs back into the closeout doc when you report.
