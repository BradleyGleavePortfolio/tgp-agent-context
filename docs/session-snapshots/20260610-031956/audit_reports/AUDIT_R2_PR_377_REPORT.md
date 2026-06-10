# R2 AUDIT REPORT — PR #377 (v1-6 Coach Admin, post-fixer)

**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #377 — `feat(community): v1-6 coach admin endpoints — cohort write, members, coach inbox`
**Audited head SHA:** `6a041f7c7a126970341e89ab9247ed0c62cbe291`
**Base:** `main` @ `6c4f618c`
**Branch:** `feature/community-v1-6-coach-backend`
**Auditor:** GPT-5.5 R2 (model: claude-opus) — fresh audit (prior R2 dispatch died of infra failure; no partial work merged)
**Mode:** READ-ONLY (no code changes, no push, no merge)
**Worktree:** `/home/user/workspace/tgp/backend-v1-6-coach` @ `6a041f7c` (had `node_modules`; gates run here)

---

## VERDICT: **CLEAN**

All three R1-P2 findings are genuinely closed (not merely touched). Schema additivity holds (the column-alignment drift is uncommitted working-tree churn only — **not** in the PR). Forbidden files untouched. All 3 fixer commits are title-only by `Dynasia G`. The deferred P3 list was respected. Local gates pass exactly as the fixer claimed: **tsc 0, eslint 0 (v1-6 lane + new tests), 64 passed + 20 live-gated skips + 0 failed**, +13 net new tests, all non-vacuous. The only CI red is a **pre-existing, repo-wide OOM** (`npm test` exits 134 / SIGABRT) that fails identically on `main` and every recent merged commit — not a regression introduced by this PR.

| Severity | Count |
|---|---|
| R2-P0 | 0 |
| R2-P1 | 0 |
| R2-P2 | 0 |
| R2-P3 | 2 (both informational; neither blocks) |

---

## R1-P2 fixes — verified closed

### R1-P2-001 — coach_replied_at writer (commit `ebdde05c`) — ✅ CLOSED

**Producer exists:** `src/community/messages/community-messages.repository.ts:52-68`
`markCohortClientMessagesReplied({ cohortId, repliedAt })` issues an `updateMany` stamping `coach_replied_at`.

**Called from the coach/owner send path:** `src/community/messages/community-messages.service.ts:99-104`
After `createCohortMessage`, gated `if (user.role === 'coach' || user.role === 'owner')`, then stamps.

**`where` clause mirrors the inbox reader EXACTLY.** Reader `unansweredMessages` (`src/community/inbox/community-coach-inbox.repository.ts:72-78`):
`{ cohort_id (IN), scope:'cohort', deleted_at:null, plan_context_type:null, coach_replied_at:null, sender:{ role:{ notIn:['coach','owner'] } } }`.
Producer (`community-messages.repository.ts:57-63`): identical, single `cohort_id` instead of `IN` (correct — one cohort per send). Reader and producer stay in lockstep — same client-sender filter, same comment exclusion (`plan_context_type:null`), same still-open filter.

**Bounded to client senders only** — `sender.role notIn ['coach','owner']`, so coach/system messages are never stamped (no over-stamping). The newly-created coach message is itself excluded (it's a coach sender, and `coach_replied_at:null` doesn't match because the predicate also excludes coach senders).

**Uses the persisted write result's `cohort_id`** (`created.cohort_id ?? cohort.id`), never the spoofable request param — same IDOR-safe pattern as the v1-4 realtime tail directly below it.

**Column exists in schema:** `CommunityMessage.coach_replied_at DateTime?` (`prisma/schema.prisma:5689`), `sender` relation (`:5696`) — predicate is type-valid (tsc passes).

**Existing v1-4 send/list/edit/delete logic untouched** — the fixer diff (`880881f7..6a041f7c`) on both `messages.service.ts` and `messages.repository.ts` is a pure additive insertion (no lines removed/modified).

**Test non-vacuous:** `test/community/messages/community-messages-coach-reply.service.spec.ts` (4 cases, pure mock):
- COACH reply → `markCohortClientMessagesReplied` called once with the right cohort + `repliedAt` ✅
- OWNER reply → also stamps ✅
- CLIENT message → **does NOT** stamp (would fail if the role guard were removed) ✅
- producer follows persisted `cohort_id`, not the (spoofed) request param ✅
The reader's `coach_replied_at:null` predicate is asserted in the existing inbox-service spec; producer-stamps + reader-filters together prove the state transition (unanswered → coach posts → no longer unanswered).

> Minor test-precision note (not a defect): in case 4 the `findCohort` mock returns the same `COHORT` id regardless of the param, and `created.cohort_id` is also `COHORT`, so `created.cohort_id ?? cohort.id` cannot distinguish the two sources in this mock; the assertion still proves the producer does not use the raw request param. See R2-P3-002.

### R1-P2-002 — case-insensitive email lookup (commit `d37f83d8`) — ✅ CLOSED

`src/community/cohorts/community-cohort-members.repository.ts:90-97`
```ts
async findUserByEmail(email) {
  return this.prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, name: true, email: true },
  });
}
```
Matches the brief's prescribed fix exactly (`findFirst` + `mode:'insensitive'`, because an insensitive predicate is not a unique key).

**No regression on case-matched emails** — an insensitive equals still matches an exact-case row.

**Empty/null input handled gracefully (cannot throw):** the caller path (`community-cohort-members.service.ts:234-238`) enforces XOR (`hasUserId === hasEmail → 400`), and the DTO (`community-cohort-members.dto.ts:28-32`) applies `@IsEmail` + `trimLower`, so a malformed/empty email is rejected at validation and never reaches `findUserByEmail`.

**Test non-vacuous:** `test/community/cohorts/community-cohort-members.repository.spec.ts` (2 cases, mocked Prisma):
- asserts the exact `{ equals, mode:'insensitive' }` predicate (would fail if reverted to `findUnique`/exact) ✅
- mixed-case stored email (`John.Doe@example.com`) found by lowercase lookup (`john.doe@example.com`); the mock returns **null** unless `mode==='insensitive'`, so the test genuinely exercises the fix ✅

### R1-P2-003 — default-off feature-flag coverage (commit `6a041f7c`) — ✅ CLOSED

`test/community/community-v1-6-feature-flag.e2e.spec.ts` (202 lines, 7 cases). Boots all **three** v1-6 controllers (cohort write, members, coach inbox) over real HTTP with the **real** `RolesGuard` + `CommunityFeatureFlagGuard` (only `JwtAuthGuard` stubbed to attach a coach; services mocked; **no DB** → runs in the always-on lane).

| Controller | flag UNSET | flag `'false'` | flag `'true'` |
|---|---|---|---|
| `POST /api/community/workspaces/:id/cohorts` | 503, service untouched | 503, untouched | 201, service hit |
| `GET /api/community/cohorts/:id/members` | 503, untouched | — | 200, service hit |
| `GET /api/community/me/coach-inbox` | 503, untouched | — | 200, service hit |

**503 is the correct lane convention** (not 404): verified against the real guard (`src/community/community-feature-flag.guard.ts:49-52` throws `HttpException(COMMUNITY_DISABLED_BODY, SERVICE_UNAVAILABLE)`); the test asserts `status 503`, `body.disabled === true`, `body.error === 'community.disabled'`. Default-off is real — the flag requires `=== 'true'` (`:24`).

**Non-vacuous:** `not.toHaveBeenCalled()` proves the guard short-circuits before the handler; `toHaveBeenCalledTimes(1)` proves the route works when enabled. Would fail if the guard were missing or returned 404.

All 3 controllers declare `@UseGuards(JwtAuthGuard, RolesGuard, CommunityFeatureFlagGuard)` (verified on every route). The guard file is **unchanged** vs main (0 diff lines).

---

## Cross-checks

| Check | Result |
|---|---|
| Committed schema diff `main(6c4f618c)..6a041f7c -- prisma/schema.prisma` | **EMPTY** ✅ |
| Committed schema diff `880881f7..6a041f7c -- prisma/schema.prisma` (fixer) | **EMPTY** ✅ |
| Uncommitted working-tree schema churn in shared worktree | 65±/65∓ pure `@relation` column-alignment whitespace (prisma-format churn) — **NOT committed, NOT in the PR**. Confirms the brief's "drift snapshot was NOT applied." Benign leftover in the shared builder/fixer worktree. |
| Forbidden files `app.module.ts`, `package.json`, `package-lock.json` (main..head) | 0 diff lines each ✅ |
| Full PR diff (main..head) | +3141 / -0 — purely additive, 22 files, all in `src/community/{cohorts,inbox,messages}`, `community.module.ts`, and tests ✅ |
| 3 fixer commits title-only, author `Dynasia G <dynasia@trygrowthproject.com>` | ✅ (empty bodies; committer == author) |
| Fixer files touched | only v1-6 lane (`community-cohort-members.repository.ts`, `community-messages.{service,repository}.ts`, 3 test files) ✅ |
| RLS spec (`test/rls/community-coach-rls.spec.ts`) untouched by fixer | 0 diff lines `880881f7..6a041f7c` ✅; 10 static run + 20 live-gated skip (`itLive = liveDbUrl() ? describe : describe.skip`, `:129`) — same correct pattern as R1 |
| Sub-coach scope primitive (`CommunityAccessService.isWorkspaceCoach`) | unchanged; producer & email fix don't alter any tenancy primitive ✅ |
| P3-004 (master flag), P3-006 (RolesGuard) files | 0 diff lines vs main ✅ — deferrals respected |
| P3-005 (`unansweredPosts` `plan_context_type` omission) | inbox repo untouched by fixer (0 diff `880881f7..6a041f7c`) ✅ — correctly left deferred |
| Forbidden test modifiers (`.only/.skip/.todo/fit/xit`) in new suites | NONE ✅ |

---

## Gate re-run (worktree @ `6a041f7c`, its own node_modules)

| Gate | Result |
|---|---|
| `./node_modules/.bin/tsc --noEmit` | ✅ exit 0 |
| `eslint src/community/{cohorts,inbox,messages} test/community/{cohorts,inbox,messages} test/community/community-v1-6-feature-flag.e2e.spec.ts test/rls/community-coach-rls.spec.ts` | ✅ exit 0 (0 errors, 0 warnings) |
| `jest --runInBand --testPathPatterns='(community/cohorts\|community/inbox\|community/messages\|community-v1-6-feature-flag\|rls/community-coach-rls)'` | ✅ **7 suites, 84 total — 64 passed + 20 skipped (live-gated), 0 failed** |

Matches the fixer's claim **exactly**: 64 pass + 20 live-gated skips + 0 fail. Test-count delta 71 → 84 = +13 (4 producer + 2 email repo + 7 flag). (Brief noted `jest test/cli` flag is now `--testPathPatterns` in this Jest version.)

---

## CI

`gh pr checks 377` → `build-and-test` **fail** (`exit code 134` = SIGABRT/OOM). **This is NOT a PR #377 regression:**

- `build-and-test` fails **identically on `main` @ `6c4f618c`** (the PR base) with the same `exit code 134`.
- It also fails on every recent merged commit: `b966088f` (#375), `f123ef1d` (#374), `9322eeb3` (#373), `5f6bedff` — all already merged.
- CI runs `npm test --if-present` — the **full** Jest suite, parallel workers, no `--runInBand`, no `NODE_OPTIONS=--max-old-space-size` bump. The full suite OOMs the V8 heap → SIGABRT. This is the same OOM the fixer (and R1) flagged when running the brief's broad pattern.
- The 10 CI eslint annotations are all **warnings** in unrelated files (`lists`, `landing-pages`, `contracts`, `coach`, `build-week`, `ai`, `admin`) — pre-existing, none in the v1-6 lane.

Logged as **R2-P3-001** (infra), not R2-P1, because no CI failure surfaces a regression attributable to this PR. The PR's scoped lane is green locally.

---

## FINDINGS

### R2-P3-001 — CI `build-and-test` red is a pre-existing repo-wide OOM, not a PR regression
**Where:** `.github/workflows/ci.yml:53-54` (`npm test --if-present`, full suite, parallel, no heap bump).
**Detail:** `exit code 134` (SIGABRT) on `6a041f7c`; **identical failure on `main` `6c4f618c` and all recent merged commits.** The v1-6 lane passes locally (`--runInBand`, scoped). Out of scope for this PR to fix, but the green-CI gate cannot currently be satisfied for *any* PR until the suite is sharded or given a heap bump / `--runInBand`. Informational — does not block merge of #377 on its own merits, but the team should be aware the master-branch CI gate is currently red for everyone.

### R2-P3-002 — Producer "uses write-result cohort_id" test cannot fully distinguish the two id sources
**Where:** `test/community/messages/community-messages-coach-reply.service.spec.ts:105-116`.
**Detail:** The mock's `findCohort` returns `{ id: COHORT }` and the persisted message's `cohort_id` is also `COHORT`, so `created.cohort_id ?? cohort.id` resolves to `COHORT` from either branch; the test proves the producer ignores the raw request param but not that it specifically prefers `created.cohort_id` over `cohort.id`. The production code is correct (reads the write result first); this is a test-tightness nit only. Optional: set the persisted `cohort_id` to a value different from the mocked `cohort.id` to pin the precedence. Cosmetic.

---

## Conclusion

All three R1-P2 findings are genuinely and correctly closed with non-vacuous tests; the producer/reader predicates are in exact lockstep; schema additivity and forbidden-file additivity hold; commits are clean title-only by the expected author; P3 deferrals were respected; and local gates are green. The lone CI red is an inherited, repo-wide OOM with no PR-specific regression. **VERDICT: CLEAN.** Ship-ready on its own merits (note the cross-repo CI OOM separately).
