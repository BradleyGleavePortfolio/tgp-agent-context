# PR #378 Fixer Brief — Rate Limit 429 + SSE AbortSignal Plumbing

**Role:** Opus 4.8 Fixer
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #378 · EXISTING branch `feat/roman-phase-1-chat` · Current head `1aaf6d44` · Base `main` (`6c4f618c`)
**Worktree:** `/home/user/workspace/tgp/backend-roman-phase1` (already on PR branch — REUSE)
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

## ⚠ Push strategy

Apply fixes to the EXISTING PR branch `feat/roman-phase-1-chat` so PR #378 updates in place. From the worktree:
```bash
cd /home/user/workspace/tgp/backend-roman-phase1
git fetch origin
git checkout feat/roman-phase-1-chat
git pull --ff-only origin feat/roman-phase-1-chat
# apply fixes
git push origin feat/roman-phase-1-chat
```

## R1 audit findings to fix

Read: `/home/user/workspace/AUDIT_R1_PR_378_REPORT.md` for full context.

### Fix 1 — R1-P2-1: Rate-limit response code should be 429 not 403 (FUNCTIONAL)

**File:** `src/roman/roman.service.ts:292` (and any other place rate-limit throws — grep the file)

**Issue:** Brief §3 specifies HTTP **429 Too Many Requests** for rate-limit response, but implementation throws **403**. Clients (and the SDK) distinguish 403 (forbidden, will never work) from 429 (try again later) — wrong status breaks retry semantics.

**Fix:** Replace whatever `ForbiddenException`/`HttpException(403)` is being thrown for rate limit with NestJS's standard `ThrottlerException` (extends HttpException with 429) OR a direct `HttpException(message, HttpStatus.TOO_MANY_REQUESTS)`.

Example:
```ts
// Before
throw new ForbiddenException('Roman message rate limit exceeded');
// After
throw new HttpException(
  'Roman message rate limit exceeded',
  HttpStatus.TOO_MANY_REQUESTS, // 429
);
```

Also add a `Retry-After` header if the brief specifies one (check §3 — if absent, skip).

**Update tests:** the existing rate-limit test must assert `.expect(429)` not `.expect(403)`. Find the test in `test/roman/roman.controller.spec.ts` or `roman.service.spec.ts` and update.

### Fix 2 — R1-P2-2: SSE disconnect doesn't forward AbortSignal to Anthropic SDK (FUNCTIONAL)

**File:** `src/roman/roman.service.ts:375-386` (the streaming path)

**Issue:** When the SSE client disconnects, the local async iterator/read loop exits, but the upstream `anthropic.messages.create({ stream: true, ... })` call is never aborted. The provider continues generating tokens on Anthropic's side — leaks credits and holds server resources.

**Fix:** Plumb an `AbortController` through to the Anthropic SDK call:
```ts
// In the streaming method
const controller = new AbortController();

// Pass to the SDK
const stream = await this.anthropic.messages.stream(
  { model, messages, ... },
  { signal: controller.signal }, // some SDK versions take signal as second-arg
);
// OR if the SDK only takes signal in the first arg:
const stream = await this.anthropic.messages.stream({
  model, messages, ...
}, { signal: controller.signal });

// On client disconnect (the existing teardown path):
try {
  // ... iterate stream ...
} finally {
  controller.abort(); // cancel upstream
}
```

Check the installed `@anthropic-ai/sdk` version to confirm the correct signal-passing API. If the SDK takes signal as a second options object: `messages.stream(params, { signal })`. If it takes it in the first arg: `messages.stream({ ..., signal })`.

**Update tests:** add to `test/roman/roman-streaming.spec.ts`:
- A test that simulates client disconnect mid-stream and asserts the Anthropic mock receives an abort signal (or its `controller.abort` is called).

### Out of scope (do NOT fix this round)

- R1-P2-3 (UUID validation) — moot per auditor; CUIDs not UUIDs.
- R1-P3-1, P3-2, P3-3 — cosmetic / informational; separate ticket if anything.

## Gates (must all pass before push)

- `./node_modules/.bin/prisma format` → no diff
- `./node_modules/.bin/tsc --noEmit` → 0 errors
- `./node_modules/.bin/eslint src/roman test/roman` → 0 errors
- `npm test -- --testPathPattern='roman'` → all pass; new 429 + abort tests included; no `.skip`

## Commit policy

Title-only commits. Author `Dynasia G <dynasia@trygrowthproject.com>`. Recommended:
- `fix(roman): rate limit returns 429 Too Many Requests (was 403)`
- `fix(roman): forward AbortSignal to Anthropic SDK on SSE disconnect`

## Update PR body

Edit via `gh api PATCH /repos/.../pulls/378` to add an "R1 fixes applied" section listing:
- Rate limit 429 (was 403)
- SSE AbortSignal forwarded to upstream provider

## Deliverables

1. PR #378 updated in place
2. `/home/user/workspace/PR378_FIXER_RESULT.md` — what was fixed, before/after snippets, gate output, ready for R2
3. PR comment via `gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/378/comments` summarizing fixes. USE `gh api`, NOT `gh pr comment`.

## Constraints

- `gh` with `api_credentials=["github"]`.
- Title-only commits.
- Force-push only if needed with `--force-with-lease=feat/roman-phase-1-chat:<remote-sha>`.
- Do NOT touch unrelated files. Do NOT bump deps.
