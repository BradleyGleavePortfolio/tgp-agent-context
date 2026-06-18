# TM-5 FINISHER BRIEF V2 — Apply + Pre-Coach Account (post-sandbox-loss re-dispatch)

## CRITICAL — READ THIS FIRST: PUSH-EARLY-WIP IS AN ENFORCED RULE

The previous TM-5 finisher crashed with "no workspace" (sandbox loss) WITHOUT EVER PUSHING. ~57 minutes of work evaporated. To prevent recurrence, the following is now a HARD RULE for you:

### THE 5-MINUTE FIRST-PUSH RULE (binding)

1. **Within your FIRST 5 minutes**, you MUST make at least one commit + push to `origin/feat/tm-5-apply-precoach`. The first commit can be tiny — even a doc/comment line or a single small refactor — but it MUST land on the remote. This proves your sandbox + credentials work AND opens the PR.

2. **As part of that first push**, open the PR (no PR exists yet):
   ```bash
   gh pr create --base main --head feat/tm-5-apply-precoach \
     --title "TM-5: apply + pre-coach account (WIP)" \
     --body $'WIP. Carries PII handling — DO NOT auto-merge.\nOperator sign-off gate: PII review required before merge.\n\nLane file ownership: apply.*, apply-fit.ts, application-cursor.ts, module wiring, + new __tests__/apply.* specs.\n\ndo-not-merge: pii-review'
   ```

3. **After that, push every ~5 minutes or per logical chunk** — whichever comes first. Never accumulate more than ~10 minutes of uncommitted/unpushed work.

4. **If any command fails with "no workspace" / sandbox error, that is a sandbox-loss event** — your work is gone if you haven't pushed. PUSH FIRST, then proceed.

This rule supersedes any contradicting cadence in older doctrine docs.

---

## ROLE & MODEL
You are the **Builder** for TM-5 under R64 (builder → dual GPT-5.5 audit → fixer → re-audit). Auditors run AFTER you push.

**Identity (R74 - mandatory):**
- `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."`
- NO `Co-Authored-By`, NO "Generated with Claude", NO AI attribution anywhere
- Use `api_credentials=["github"]` for ALL git/gh commands

## WORKTREE (R56–R61, EXCLUSIVE)
- **Your worktree:** `/home/user/workspace/tgp/backend-tm-5-finish`
- **Branch:** `feat/tm-5-apply-precoach`
- **Starting HEAD:** `af118f6679f3a7c5a86953a52daeb0fc44b9eb14` (already checked out)
- **First action:** `cd /home/user/workspace/tgp/backend-tm-5-finish && git status && git log --oneline -3`
- **DO NOT** `cd` to `/tmp/gpb`, `backend-main`, or any sibling worktree. READ-ONLY to you.

## OPERATOR GATE — READ THIS FIRST
**TM-5 carries PII risk.** Even on dual-CLEAN audit, **TM-5 will NOT auto-merge** — operator Bradley Gleave must sign off on PII handling before merge. Build to the same bar as the auto-merge lanes anyway. PR body MUST contain `do-not-merge: pii-review` (already in the first-push command above).

## SCOPE & FILE OWNERSHIP (R71 — EXCLUSIVE)

You own exclusively:
1. `src/talent-marketplace/apply.controller.ts`
2. `src/talent-marketplace/apply.service.ts`
3. `src/talent-marketplace/apply.dto.ts`
4. `src/talent-marketplace/apply-fit.ts`
5. `src/talent-marketplace/application-cursor.ts`
6. `src/talent-marketplace/talent-marketplace.module.ts` (minimal wiring)
7. **NEW specs you must add:** `src/talent-marketplace/__tests__/apply.*.spec.ts` — fall under your lane, auditors will accept them.

**Do NOT touch any other file.** No `common/`, no `auth/`, no migrations, no schema changes.

## LOC CAP
**≤ 390 prod LOC** delta against `origin/main` (excluding spec files). Current snapshot ~839 insertions total. If close to cap, drop optional features — never safety checks.

## SUGGESTED ORDER OF WORK (push-friendly)

1. **First push (≤ 5 min):** Open the PR via the command above. Make ONE small visible change first — e.g. add a brief module-level comment explaining the PII guardrails, OR fix a trivial typo/lint issue in one of the owned files. Commit + push. Verify PR is open.

2. **Second push (within 10 min):** Add the first test file — `src/talent-marketplace/__tests__/apply.service.spec.ts` skeleton (just describe blocks + one passing assertion). Commit + push.

3. **Iterate from there:** finish each owned file + spec, pushing after each logical chunk.

## REMAINING WORK (after first push)

The snapshot has NO test files among the owned set — **you MUST add specs** covering:

- **Apply controller:** authenticated POST `/v1/talent-marketplace/apply`, idempotency-key handling, rate-limit awareness.
- **Apply service:** transactional insert; duplicate-application prevention; no PII leakage in error messages; RLS-safe writes (applicant_id scoped to JWT/session subject).
- **apply-fit.ts:** the pre-coach fit-screen logic — pure function over applicant profile + listing requirements. Deterministic. No third-party API calls. Returns `{ score, reasons[] }` or similar. No raw LLM hallucinations in output, no PII in `reasons`.
- **application-cursor.ts:** opaque cursor (base64 of `created_at|id`), tamper-detection, page-size caps. Mirror `public-listing.cursor.ts` pattern if similar.
- **DTO:** strict allow-list for public-facing apply payload AND read response. PII-stripped: no other applicant's identifying fields ever leak.

## PII GUARDRAILS (extra-strict for this lane — auditor A will verify each)

1. **No raw email/phone/SSN/IP in logs.** Audit every `console.*` / logger call. Use redaction or omit.
2. **No applicant-cross-read:** an applicant can only read their OWN application status; filter by `auth.uid()` / session subject.
3. **No third-party PII fan-out:** apply.service must not call external HTTP APIs with applicant fields. Fit-screen is in-house.
4. **Idempotency keys** stored in a way that doesn't expose intent across users.

These are what the operator will sign off on. If a path is ambiguous, choose the more conservative option and note it in the PR body.

## BANNED TOKENS (R0 — P0 fail anywhere in `src/` including `__tests__/`)
- `@ts-ignore`
- `as any`
- `as unknown as`
- `as never`
- `.catch(()=>undefined)` and silent-swallow equivalents
- `Coming soon`

ALLOWED: `@ts-expect-error <reason>` + `as { concrete: shape }` narrow & justified.

```bash
grep -nE '@ts-ignore|as any|as unknown as|as never|Coming soon' src/talent-marketplace/ -r
```
Zero hits in your diff.

## BUILD DISCIPLINE (R66 + R70)

**R70 fast-lane (use between WIP pushes):**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npx jest --testPathPatterns="talent-marketplace/(apply|application-cursor|apply-fit)" --runInBand
```

**R66 full suite — REQUIRED before your FINAL push, optional between intermediate WIP pushes:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npx jest --runInBand
```

Do NOT wait to run the full suite before pushing intermediate progress. Visible WIP beats a black-box final commit.

## PUSH CADENCE (RESTATED — this is the rule, not a suggestion)

- **First push:** within 5 minutes (small change + open PR).
- **Subsequent pushes:** every ~5 minutes OR per logical chunk.
- **Final push:** after full suite green.
- **Force-push:** NEVER.

## SUCCESS CRITERIA (on your final SHA)

1. **TypeScript:** `tsc --noEmit` exit 0.
2. **Jest full suite:** owned specs pass; no NEW failures in non-owned files.
3. **Banned tokens:** zero hits.
4. **LOC cap:** ≤ 390 prod LOC delta.
5. **R71 file ownership:** zero edits outside the 6 enumerated files + new `__tests__/apply.*` specs.
6. **R74 commit identity:** clean.
7. **PII guardrails (above) provably enforced.**
8. **PR opened with `do-not-merge: pii-review` body text.**

## OUT OF SCOPE
- Mobile.
- Auth/RBAC system changes.
- Other lanes.
- Schema migrations.

## WHAT TO REPORT BACK
- Final HEAD SHA.
- Number of pushes (should be ≥ 3: opening PR + iteration + final).
- LOC delta.
- Last full-suite jest result.
- Banned-token grep = 0, R74 author check passes.
- New PR number + CI status.
- One-paragraph PII-handling summary for operator review.

Audit cycle begins after your final push.
