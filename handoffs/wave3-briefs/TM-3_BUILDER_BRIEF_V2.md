# TM-3 FINISHER BRIEF V2 — Public Browse + SEO (post-sandbox-loss re-dispatch)

## CRITICAL — READ THIS FIRST: PUSH-EARLY-WIP IS AN ENFORCED RULE

The previous TM-3 finisher crashed with "no workspace" (sandbox loss) ~50 minutes in WITHOUT EVER PUSHING. All in-progress work was lost. To prevent recurrence, the following is now a HARD RULE for you:

### THE 5-MINUTE FIRST-PUSH RULE (binding)

1. **Within your FIRST 5 minutes of work**, you MUST make at least one commit + push to `origin/feat/tm-3-public-browse`. Even if it's just the P0 spec fix (the one-line change in `job-posting-jsonld.spec.ts:75`), push it immediately. This proves your sandbox + credentials work.

2. **After that, push every ~5 minutes or per logical chunk** — whichever comes first. Never accumulate more than ~10 minutes of uncommitted/unpushed work. If you have local edits and you're about to start any non-trivial task (running full test suite, exploring code, large refactor), commit + push first.

3. **The P0 spec fix is your FIRST commit, in isolation.** Do not bundle it with other work. After verifying the fix locally (`npx jest --testPathPatterns="job-posting-jsonld" --runInBand`), commit + push it as a standalone change, then continue.

4. **If at ANY point a command fails with "no workspace" / sandbox error, that is a sandbox-loss event** — your work is gone if you haven't pushed. Treat every multi-minute task as a potential sandbox-loss window. PUSH FIRST.

This rule supersedes any contradicting cadence in older doctrine docs. R56 PUSH-EARLY-WIP is now PUSH-FIRST-EVERY-5-MIN.

---

## ROLE & MODEL
You are the **Builder** for TM-3 under R64 (builder → dual GPT-5.5 audit → fixer → re-audit). You write/edit production code AND tests. Auditors run AFTER you push — do not audit your own work.

**Identity (R74 - mandatory):**
- Every commit MUST use:
  ```
  git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."
  ```
- NO `Co-Authored-By`, NO "Generated with Claude", NO AI attribution anywhere
- Commit messages: factual, terse, no marketing fluff
- Use `api_credentials=["github"]` for ALL `git push`, `gh`, and `git fetch` commands

## WORKTREE (R56–R61, EXCLUSIVE)
- **Your worktree:** `/home/user/workspace/tgp/backend-tm-3-finish`
- **Branch:** `feat/tm-3-public-browse`
- **Starting HEAD:** `54c84ea78427fe3d67f7703c339f50a7911c076f` (already checked out)
- **First action when you start:** `cd /home/user/workspace/tgp/backend-tm-3-finish && git status && git log --oneline -3` — confirm you're in the right place.
- **DO NOT** `cd` to `/tmp/gpb`, `backend-main`, or any sibling worktree. Those are READ-ONLY to you.

## P0 — THE CRITICAL FIX (push this within the first 5 minutes, in isolation)

**File:** `src/talent-marketplace/__tests__/job-posting-jsonld.spec.ts`
**Line 75 currently reads:**
```ts
expect(serialized).not.toContain('applicant');
```
**Problem:** The builder correctly emits `applicantLocationRequirements` (a standard schema.org JobPosting field carrying country name only — NOT PII). The over-strict `not.toContain('applicant')` substring match wrongly fails on this legitimate field.

**Required fix — replace that ONE LINE with:**
```ts
expect(serialized).not.toContain('applicantEmail');
expect(serialized).not.toContain('applicantName');
expect(serialized).not.toContain('hirerEmail');
expect(serialized).not.toContain('hirerName');
expect(serialized).not.toContain('hirer_id');
expect(serialized).not.toContain('owner_id');
```

**ALSO** replace the line `expect(serialized).not.toContain('hirer');` with the more precise `hirerEmail` / `hirerName` / `hirer_id` checks above (substring on bare `'hirer'` is over-strict for the same reason — if a future schema.org field happens to contain "hirer" as a substring, the test breaks for no real PII reason).

**KEEP** `expect(serialized).not.toContain('idempotency');` (no schema field uses that root).
**KEEP** the existing `expect('applicantLocationRequirements' in ld).toBe(false);` negative-presence check earlier in the file.

**Verify locally before pushing:**
```bash
npx jest --testPathPatterns="talent-marketplace/__tests__/job-posting-jsonld" --runInBand
```

**Commit + push the P0 fix IN ISOLATION:**
```bash
git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
    commit -am "TM-3: relax over-strict PII assertion to actual PII field names"
git push origin feat/tm-3-public-browse
```

PR #434 already exists — the push will auto-update it and re-trigger CI.

## SCOPE & FILE OWNERSHIP (R71 — EXCLUSIVE)

You own exclusively these files (already modified in the snapshot — finish/audit them after the P0 fix is pushed):
1. `src/talent-marketplace/public-listing.controller.ts`
2. `src/talent-marketplace/public-listing.service.ts`
3. `src/talent-marketplace/public-listing.cursor.ts`
4. `src/talent-marketplace/public-listing.dto.ts`
5. `src/talent-marketplace/job-posting-jsonld.ts`
6. `src/talent-marketplace/__tests__/public-listing.service.spec.ts`
7. `src/talent-marketplace/__tests__/public-listing.cursor.spec.ts`
8. `src/talent-marketplace/__tests__/job-posting-jsonld.spec.ts` (already fixed in P0 push)
9. `src/talent-marketplace/talent-marketplace.module.ts` (minimal wiring only)

**Do NOT touch any other file.** No global utilities, no `common/`, no `auth/`, no migrations.

## LOC CAP
**≤ 300 prod LOC** delta against `origin/main` (excluding test files). Current snapshot is at ~890 total insertions; trim if needed but the existing skeleton is mostly correct — your job is to FINISH and FIX, not rewrite.

## REMAINING WORK (after P0 push)

The snapshot is "WIP — skeleton landed before sandbox loss". After pushing the P0 fix, audit the lane for any other incompleteness. Push every chunk:

- **Controller:** confirm `@Public()` decorator usage; cursor-paginated `GET /v1/public/listings` and `GET /v1/public/listings/:id`; rate-limit guard if codebase has one; no auth context leaks.
- **Service:** only returns allow-listed DTO fields; published-only filter; RLS-safe query.
- **Cursor:** opaque base64 of `published_at|id`, tamper detection, page-size caps.
- **DTO:** strict allow-list, no PII fields.
- **JSON-LD builder:** already correct in snapshot — verify.
- **Specs:** each meaningful, no fluff tests.
- **Module wiring:** providers/controllers added cleanly.

If a file is structurally fine, leave it alone.

## BANNED TOKENS (R0 — P0 fail anywhere in `src/` including `__tests__/`)
- `@ts-ignore`
- `as any`
- `as unknown as`
- `as never`
- `.catch(()=>undefined)` and equivalent silent-swallow patterns
- `Coming soon`

ALLOWED: `@ts-expect-error <reason>` + `as { concrete: shape }` narrow & justified.

After all edits:
```bash
grep -nE '@ts-ignore|as any|as unknown as|as never|Coming soon' src/talent-marketplace/ -r
```
Zero hits in your owned files.

## BUILD DISCIPLINE (R66 + R70)

**R70 fast-lane (cheap, run frequently):**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npx jest --testPathPatterns="talent-marketplace/(public-listing|job-posting-jsonld)" --runInBand
```

**R66 full suite — REQUIRED before your FINAL push, but optional between intermediate WIP pushes:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npx jest --runInBand
```

**Important:** Do NOT wait to run the full suite before pushing intermediate progress. Use the fast-lane between WIP pushes. Only require full-suite-green for your FINAL "I'm done" push. This is a deliberate tradeoff vs sandbox-loss risk — visible WIP beats a black-box final commit.

If any test outside your owned files fails because of your change → fix or roll back. If pre-existing on `54c84ea`, note in commit body.

## PUSH CADENCE (RESTATED — this is the rule, not a suggestion)

- **First push:** within 5 minutes of starting work. The P0 spec fix is sufficient and ideal.
- **Subsequent pushes:** every ~5 minutes OR every logical chunk (e.g. after each owned file is audited/edited).
- **Final push:** after full suite is green.
- **Force-push:** NEVER.

PR #434 updates automatically on every push.

## SUCCESS CRITERIA (what auditors will measure on your final SHA)

1. **TypeScript:** `tsc --noEmit` exit 0.
2. **Jest full suite:** all owned-area specs pass; `job-posting-jsonld.spec.ts` line 75 area now passes; no NEW failures elsewhere.
3. **Banned tokens:** zero hits in your diff.
4. **LOC cap:** ≤ 300 prod LOC delta against `origin/main`.
5. **R71 file ownership:** zero edits outside the 9 enumerated files.
6. **R74 commit identity:** `git log --format="%an <%ae>"` on your commits shows ONLY `Bradley Gleave <bradley@bradleytgpcoaching.com>`.
7. **PR #434 build-and-test:** green.
8. **PII isolation guaranteed by the DTO type, not by substring tests.**

## OUT OF SCOPE
- Mobile changes.
- Auth/RBAC system changes.
- Other lanes (TM-5, TM-14, TM-W2).
- Migrations (none in this lane).

## WHAT TO REPORT BACK
When you return, post:
- Final HEAD SHA on `feat/tm-3-public-browse`.
- Number of pushes made (should be ≥ 2: P0 fix + final).
- Final LOC delta (`git diff --shortstat origin/main...HEAD`).
- Last full-suite jest result.
- Banned-token grep = 0, R74 author check passes.
- PR #434 build-and-test status (re-check via `gh pr view 434`).

Audit cycle begins after you push your final commit.
