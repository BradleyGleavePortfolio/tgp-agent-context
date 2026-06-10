# PR #378 Roman Phase 1 — Fixer RESUME BRIEF

## ⚠️ RESUME WORK — DO NOT RESTART

The previous fixer dispatch died from a Claude Code infra failure (exited with no output, 1h51m of work lost). Their **in-progress work was preserved as a snapshot**:

- **Snapshot branch (origin):** `wip/pr378-roman-fixer-429-sse-abort-20260610-021746` @ `062d48d2`
- **Their progress:** modified `src/roman/roman.controller.ts` (+1/-1), `src/roman/roman.service.ts` (+35/-13), `test/roman/roman-streaming.spec.ts` (+58/-1), `test/roman/roman.service.spec.ts` (+14/-4)

**Your job:** Inspect the snapshot, validate whether the in-progress fix is correct and complete, finish anything missing, then push to the real PR branch `feat/roman-phase-1-chat`.

## PR Target

- **Repo:** `BradleyGleavePortfolio/growth-project-backend`
- **PR:** #378 — Roman Phase 1 chat MVP
- **Real branch:** `feat/roman-phase-1-chat` (current head `1aaf6d44`)
- **Base main:** `6c4f618c`

## Recommended Pickup Procedure

```bash
git fetch origin
git checkout feat/roman-phase-1-chat   # PR branch, currently 1aaf6d44
# Inspect the dead agent's work-in-progress:
git diff feat/roman-phase-1-chat..origin/wip/pr378-roman-fixer-429-sse-abort-20260610-021746 -- src/roman test/roman

# If the diff looks correct, cherry-pick or merge the snapshot tip:
git checkout origin/wip/pr378-roman-fixer-429-sse-abort-20260610-021746 -- src/roman test/roman
# Then evaluate whether the changes complete BOTH P2 fixes (see below).
```

## R1 Findings to Close (from `PR378_R1_AUDIT_RESULT.md`)

### R1-P2-1 — Rate limit returns HTTP 403, should be 429

**Location:** `src/roman/roman.service.ts` rate-limit guard
**Spec:** RFC 6585 §4 — `Too Many Requests`
**Required change:**
- When daily quota is hit, throw `HttpException('rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS)` (i.e. **429**, not 403).
- Include a `Retry-After` header (seconds until next UTC day rollover) — set via response header, or via `setHeader` on the SSE response.
- Update affected unit test (`roman.service.spec.ts`) to assert 429 instead of 403.

### R1-P2-2 — SSE disconnect doesn't forward `AbortSignal` to Anthropic SDK (leaks credits)

**Location:** `src/roman/roman.service.ts` SSE streaming method
**Problem:** When the HTTP request is aborted client-side, the upstream Anthropic streaming call continues until the model finishes — wastes credits.
**Required change:**
- Plumb `request.signal` (or `response.req.signal`) into the Anthropic SDK call: `client.messages.stream({ ..., signal })`.
- On signal abort, ensure the assistant message **partial token write-back** still flushes whatever was streamed before disconnect (no data loss; cancel the upstream completion but keep what was already written).
- Add streaming spec coverage that:
  1. Aborts the SSE response mid-stream.
  2. Asserts the upstream SDK call received the abort.
  3. Asserts the partial message row is persisted with `status='aborted'` or equivalent.

## Files allowed to touch

- `src/roman/roman.controller.ts`
- `src/roman/roman.service.ts`
- `test/roman/roman.service.spec.ts`
- `test/roman/roman-streaming.spec.ts`
- `test/roman/roman.controller.spec.ts` (only if needed for 429 plumbing)

## Files FORBIDDEN to touch (anti-rebase R7C)

- `prisma/schema.prisma` (Roman migrations already shipped; do not modify)
- `prisma/migrations/**`
- Any file outside `src/roman/**` or `test/roman/**`
- `app.module.ts` (already mounted, do not re-touch)
- `package.json` / `pnpm-lock.yaml`

## Gates (MUST PASS before push)

```bash
# 1. Type-check
pnpm tsc --noEmit

# 2. Lint Roman surfaces only
pnpm eslint src/roman test/roman

# 3. Roman suites
pnpm jest --runInBand --testPathPattern='test/roman' 

# 4. Module-graph hygiene
pnpm jest --runInBand --testPathPattern='module-graph'

# 5. e2e app-boot smoke
pnpm jest --runInBand --testPathPattern='app-boot'
```

All must be **green** before push.

## Push & Comment

```bash
git -c user.email=dynasia@trygrowthproject.com -c user.name="Dynasia G" commit -m "fix(roman): rate-limit returns 429 with Retry-After; SSE abort forwarded to Anthropic SDK"
git push origin feat/roman-phase-1-chat
gh api repos/BradleyGleavePortfolio/growth-project-backend/issues/378/comments \
  -X POST -f body="R1 P2 fixes shipped. Resumed from wip snapshot \`062d48d2\` (prior agent died from infra failure). Both R1-P2-1 (429+Retry-After) and R1-P2-2 (SSE abort plumbed) closed. Gates: tsc/eslint/roman-suites/module-graph/app-boot all PASS. Ready for R2."
```

## Result file

Write `/home/user/workspace/PR378_FIXER_RESULT.md` with:
- final `HEAD` SHA on `feat/roman-phase-1-chat`
- whether the wip snapshot was usable as-is or required additional changes (and what)
- gate output (last 20 lines of each pass)
- file-surface overlap check vs in-flight work
- one-line PR comment URL

## Commit author / discipline

- Author: `Dynasia G <dynasia@trygrowthproject.com>`
- Title-only commits (no body)
- Force-push only with `--force-with-lease=feat/roman-phase-1-chat:$(git ls-remote origin feat/roman-phase-1-chat | awk '{print $1}')` if needed
