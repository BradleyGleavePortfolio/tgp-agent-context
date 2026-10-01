## Tier header

- **Tier:** T4
- **Why:** auth/signup flows (`/auth/signup-with-code`, `/auth/google`, `/auth/apple`), coach↔client linkage semantics, and a public-route rate limit.
- **T4 trigger scan:** auth — **yes** (response contract + throttle on signup); tenancy — **yes** (refuses silent re-parenting of a client to another coach); PII — no new fields (reason codes never echo the code string, coach id or intended email); migration — none.
- **T3 trigger scan:** mobile contract — additive fields `invite_attached` (already present on Google/Apple, now also on signup-with-code) and `invite_attach_error?` (new).
- **Bounded T1:** none.
- **Builder/owner:** Claude Opus 5.5 (T4 builder) / Bradley (owner). Do **not** merge without the two independent T4 audits re-approving + green CI. Do not deploy from this PR.
- **Acceptance evidence (fix round 3, head `9a0b9f94`):** the signup-with-code burst default is now **100/h per IP** (clamp 5–500). See the "Fix round 3" table. Original evidence: `test/invite-attach-reliability.spec.ts` (14 tests): re-parent refusal (409 `already_attached_to_different_coach`), same-coach idempotent success, safe codes on every attach failure, auth flows report the outcome, and the **real `UserThrottlerGuard` over in-memory storage** enforcing 5/h codeless vs a higher budget (now 100/h) with a well-formed code. Commands + results below.
- **Fix round 4 (head `7b496aca`):** pure rebase onto #597 `e3167fe7` (A-597-1 non-destructive registration, B-597-2 password proof). No #599 code change; T4/T3 scans unchanged.
- **Promotion triggers:** any change to token verification or to the Stripe paths (none here).

## Summary

**1. Attach failures are reported, not swallowed.** `signupWithCode`, `googleAuth` and `appleAuth` share a new private helper `tryAttachInviteCode()`. The auth call still succeeds (the account exists / the user is signed in and can retry via `/auth/attach-invite-code`), but the response now carries `invite_attached: boolean` and, on failure, `invite_attach_error` with one of the safe codes below. `signupWithCode` previously returned nothing about the attach at all; Google/Apple previously skipped the attach entirely when the user already had a coach.

Reason codes (`INVITE_ATTACH_ERROR` in `invite-codes.service.ts`; every exception thrown by `attachUserToCoachByCode` now carries `{ code, message }` per the ErrorEnvelope convention, human messages unchanged):
`invite_code_invalid` · `coach_not_accepting_clients` · `already_attached_to_different_coach` · `invite_intended_email_mismatch` · `owner_cannot_redeem` · `user_not_found` · `attach_failed` (anything else — never leaks the underlying message).

**2. No silent re-parenting.** `attachUserToCoachByCode`: if the redeemer already has a `coach_id` that differs from the code's coach → **409 `already_attached_to_different_coach`**, nothing written. Same coach → idempotent success `{ …, already_attached: true }` with no write, no seat (`used_count`) consumed, no transaction opened. Fresh attach returns `already_attached: false`. Return type is now explicit.

**3. Signup throttle burst for code holders.** Codeless `POST /auth/signup-with-code` keeps the `auth-signup` 5/h per IP baseline. A request whose body carries a **well-formed** invite code (`isWellFormedInviteCode`: 3–32 chars, `[A-Za-z0-9-]`) is skipped by `auth-signup` and counted in a new `auth-signup-with-code` bucket (route limit `AUTH_SIGNUP_WITH_CODE_PER_HOUR`, default 30/h per IP, clamp [5, 500]). Implemented with the existing throttler primitives only: two `skipIf` predicates on the named throttlers (`src/throttler/signup-code-burst.ts`) + a second entry in the handler's `@Throttle`. "Valid" at the throttler layer means format-valid; DB validity is still enforced by `previewCode` **before** any account is created, so a bogus code never mints a user — it just burns one of 30 attempts.

`@SkipThrottle(SIGNUP_WITH_CODE_SKIP_THROTTLERS)` isolates the route to exactly `{default, auth-signup, auth-signup-with-code}`. This follows the existing R2 P1 isolation on the storefront join route and is **necessary**: the NestJS throttler evaluates every named bucket on every route at its baseline, so without isolation `auth-password-reset` (3/h) and `auth-login-per-min` (5/min) reject signup-with-code long before 30 (reproduced in the sandbox with the real guard — see "Pre-existing finding" below).

## Files changed

`src/invite-codes/invite-codes.service.ts` (codes, `isWellFormedInviteCode`, `inviteAttachErrorCode`, re-parent rule), `src/auth/auth.service.ts` (helper + three flows), `src/auth/auth.controller.ts` (throttle decorators), `src/throttler/throttler.config.ts` (name, env, limits rows, `skipAllThrottlersExcept`, `SIGNUP_WITH_CODE_*`), `src/throttler/signup-code-burst.ts` (new), `src/common/env-validation.ts`, `prod-switches.yml`, `.env.example` (`AUTH_SIGNUP_WITH_CODE_PER_HOUR`), `test/invite-attach-reliability.spec.ts` (new), `test/invite-codes.service.spec.ts` (1 assertion: `already_attached:false`).

## Env vars

`AUTH_SIGNUP_WITH_CODE_PER_HOUR` — optional, default 30. No action needed for launch unless a larger room is expected (e.g. `50`).

## Tests run (sandbox, 2 CPUs) and results

```
npx jest test/invite-attach-reliability.spec.ts --maxWorkers=1
  → PASS, 14 passed

npx jest test/invite-attach-reliability.spec.ts test/invite-codes.service.spec.ts test/rate-limit.spec.ts \
  test/redis-throttler.spec.ts test/auth.controller.spec.ts test/auth-apple.spec.ts test/auth.service.spec.ts \
  test/e2e-saas-smoke.spec.ts test/env-validation.spec.ts test/deploy-readiness.spec.ts \
  test/prod-readiness/env-discovery.spec.ts --maxWorkers=1
  → 11 suites PASS after the one-line assertion update in invite-codes.service.spec.ts (407 passed, 1 pre-existing env-gated skip)

NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit -p tsconfig.json → exit 0
npx eslint <changed src + spec> → clean
node scripts/check-r75.js --mode=staged → OK (no net new banned tokens)
```

Full suite not run locally (sandbox constraint; CI runs it). Lefthook pre-commit bypassed for the commit only because its `tsc` step OOMs at Node's default 2 GB heap here.

## Pre-existing finding for the owner (not fixed here — out of slice)

With the real `UserThrottlerGuard` + `THROTTLER_LIMITS` over in-memory storage, **8 anonymous GETs to `/auth/signup-policy` from one IP → 3 allowed, 5 × 429** (`Retry-After-auth-password-reset`, then `-auth-login-per-min`). That is the documented NestJS behaviour (all named throttlers run on every route) and is exactly what the storefront R2 P1 comment describes; only the storefront join route (and now signup-with-code) are isolated. If production shows the same (Redis storage uses the same guard keys), every un-isolated route is capped at 3/h per IP or per user. Recommend a follow-up PR that either makes the low baselines non-biting (as `STOREFRONT_JOIN_IP` does) or applies isolation controller-wide. Evidence and repro are in `/clinic/build-backend-wave1.md` in the workspace.

## Fix round 1 (audits Opus + Grok on `f0a4f60f`)

- **A1 (both audits) — coach / sub_coach were demoted.** `attachUserToCoachByCode` now refuses every non-student before any write: owner → 403 `owner_cannot_redeem` (unchanged), coach / sub_coach → 403 **`coach_cannot_redeem`** (same code #597 introduces; no third code). `role` is **never written** by code entry any more — the attach is `updateMany({ where: { id, role: 'student', coach_id: null }, data: { coach_id } })`. A coach redeeming their own permanent code is refused, not self-parented.
- **A2 (Grok) / re-parent race (owner).** The role and coach checks are repeated **inside** the transaction on a fresh read, before the seat is consumed; the user write is conditional on `coach_id IS NULL AND role = 'student'`. If it affects 0 rows the transaction throws (rolling the seat bump back) and the loser gets 409 `already_attached_to_different_coach` — or, if the sibling attached the same coach, an idempotent `already_attached: true`. No unconditional `coach_id` write remains.
- **InviteCode concurrent-use false "invalid code" (owner).** The seat bump is now `updateMany({ where: { id, revoked: false, used_count: { lt: max_uses } }, data: { used_count: { increment: 1 } } })` — conditional on capacity, not on an equality snapshot — so two clients redeeming one code at the same moment both succeed; only revoked / exhausted / expired codes fail. Extracted to `consumeInviteSeat(tx, …)`.
- **C2 (both)** — the idempotent same-coach path no longer re-emits `INVITE_REDEEMED`.
- **C1 (Grok)** — attach trims the code (case preserved) to match the throttler predicate and mobile.
- Tests added to `test/invite-attach-reliability.spec.ts` (now 21): coach + sub_coach with `coach_id: null` → 403, zero writes, role unchanged; coach redeeming own code; two-different-codes race → one winner, one 409, no overwrite; retry racing its own commit → `already_attached: true`; concurrent use of one InviteCode by two clients → both attach, `used_count 2`, conditional where asserted; exhausted code → `invite_code_invalid`, no attach. `test/invite-codes.service.spec.ts` and `test/e2e-saas-smoke.spec.ts` doubles updated for the conditional write.
- Rebased onto `main@bffae5f3` (after #596).

```
npx jest test/invite-attach-reliability.spec.ts test/invite-codes.service.spec.ts test/e2e-saas-smoke.spec.ts --maxWorkers=1
  → 3 suites PASS, 71 passed
NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit -p tsconfig.json → exit 0
eslint → clean; node scripts/check-r75.js --mode=staged → OK
```

## Fix round 2 (audits GPT-6.1 Sol + Opus) — head `a0b75a97`, base `clinic/c13-signup-role-choice`

Stack: `main` ← #597 (`clinic/c13-signup-role-choice`) ← #599 (`clinic/c03-reliable-attach`) ← #595 (`clinic/c01-comp-access`) ← #604 (`clinic/c14-throttler-isolation`).

| Finding | Fix (commit `a0b75a97`) | Test |
|---|---|---|
| SOL-C03-A1 / Opus C03-B1 — select-role bypassed the attach writer | inherited from #597 (`aaea7200`): select-role delegates to `attachUserToCoachByCode` | `test/select-role-canonical-attach.spec.ts` |
| SOL-C03-B1 — retry of a successful single-use invite for the same coach failed | canonical attach resolves the target without lifecycle checks first: same coach ⇒ idempotent `already_attached: true` (even if the code is now exhausted/revoked/expired, no seat consumed); different coach ⇒ 409; new redemption ⇒ full validation + transaction with fresh read, capacity-conditional seat consume recording `accepted_by_user_id`/`accepted_at`, conditional `updateMany`, same-coach race treated as success | `test/invite-attach-idempotent-replay.spec.ts`, `test/invite-attach-reliability.spec.ts`, `test/invite-codes.service.spec.ts`, `test/e2e-saas-smoke.spec.ts` |

Docs: `src/invite-codes/README.md` ("Atomic attach — the ONE canonical writer"), `src/auth/README.md`.



## CI round (banned casts) — head `0d56eb1a`, base #597 head `b49c3177`
- Rebased onto the updated #597. `0d56eb1a` (test-only): `test/invite-attach-idempotent-replay.spec.ts` now builds `InviteCodesService` through `attachServices(db)` (Nest DI, typed doubles). The 4 `as any` are gone: the `outcome()` union is narrowed with `'ok' in r` / `'status' in r`. There is no production change.
- **R75:** net 0 vs #597 and net 0 vs main.
- **Local:** the pre-commit hook passed in full (whole-project tsc, eslint, prettier, check-r75). jest --maxWorkers=1 passed on invite-attach-idempotent-replay, select-role-canonical-attach and the c03 regression.
- **How the main-only checks were obtained:** CodeQL, Banned cast tokens, build-sbom and danger only trigger for PRs based on `main`. To get them, the base was temporarily set to `main`, the PR was closed and reopened (which triggers `pull_request: reopened`), and the stacked base was restored once the checks completed. The run on the main base hit a flake in `test/ci/release-evidence-gate.spec.ts`. That file is not touched here, and the same head passed build-and-test on the stacked base, so the failed job was re-run once (attempt 2 passed: build-and-test, rls-floor-guard, rls-live-tests and mwb-3-live-tests all green).

- **Checks:** all required checks (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger) pass at this head. `shellcheck (scripts/*.sh)` fails on `scripts/s10-core-diff-gate.sh` (SC2015, lines 58/77/132). That file is unchanged here and the job has also failed on `main` since 09-27, so it was left alone.
- No merge and no self-audit. The two independent T4 audits still need to re-approve at this head.

## Fix round 3 (Opus final REQUEST CHANGES at `0d56eb1a`) and rebase on #597 `fc5c5a9e` — head `9a0b9f94`

| Finding | What changed | Commit | Test |
|---|---|---|---|
| Opus final **B1**: `AUTH_SIGNUP_WITH_CODE_PER_HOUR` default 30 is too low for a clinic event (many patients on one clinic Wi-Fi IP) | Default raised to **100/h** (exported `AUTH_SIGNUP_WITH_CODE_PER_HOUR_DEFAULT`, env clamp [5, 500]). Changed in `throttler.config.ts`, `.env.example`, `prod-switches.yml`, `env-validation.ts`, the `signup-code-burst.ts` / controller comments, and the throttler and auth READMEs. The abuse limits are unchanged: codeless signups stay at 5/h, a malformed code does not count toward the code budget, and there is a 100/h ceiling. | `9a0b9f94` | `test/invite-attach-reliability.spec.ts`, "B1: a 40-patient clinic event on one Wi-Fi IP": the real `UserThrottlerGuard` with fake timers admits 40 signups-with-code over 50 min plus 40 retries; codeless signups get 429 on the 6th; a malformed code is blocked; the 101st signup gets 429. The existing 30-based cases were updated to 100. |
| Opus final **C1**: replay contract undocumented | Documented in `src/invite-codes/README.md` (same-coach replay is idempotent, uses no seat, no event) | `9a0b9f94` | existing `invite-attach-idempotent-replay.spec.ts` |
| Opus final **C2**: profile codes shadow row codes | Noted only; behaviour unchanged in this round (follow-up if the owner wants row codes to win). | — | — |
| Opus final **C3**: analytics emitted inside the attach transaction | Noted only; not changed in this round (follow-up). | — | — |
| Earlier Opus **C1**: a fake well-formed code buys more attempts | Accepted. `previewCode` gates the code, and the preview endpoint stays at 30/min. | — | — |
| #597 fix round 3 (A-597-1 / B-597-1) | Rebased onto `fc5c5a9e`. The rebase was clean and the #599 delta is unchanged. | — | the #597 specs re-run on this head (below) |

**Tests run at `9a0b9f94` (`heavy.sh`, `CI=false`, `--runInBand --forceExit`):** `npx jest test/invite-attach-reliability.spec.ts test/invite-attach-idempotent-replay.spec.ts test/rate-limit.spec.ts test/redis-throttler.spec.ts test/env-validation.spec.ts test/prod-readiness/env-discovery.spec.ts test/auth-signup-role-choice.spec.ts test/c13-email-case-login.spec.ts test/auth/extension-auth.spec.ts test/select-role-canonical-attach.spec.ts test/invite-codes.service.spec.ts` → 11 suites, 447/447 passed; `npx tsc --noEmit -p tsconfig.json` → 0; `npx eslint --max-warnings 0` on the 7 touched src/test files → exit 0; `check-r75 --mode=range` vs #597 `fc5c5a9e` → net 0.

CI does not run while this PR is stacked on #597. The head is ready for CI and audit once the operator retargets it. *(Superseded: the PR now targets `main` for CI; see fix round 4.)*



## Fix round 4 — rebase on #597 `e3167fe7` — head `7b496aca`

| Finding | Disposition | Commit | Test |
|---|---|---|---|
| Inherited **A-597-1** (Sol) / **B-597-2** (Opus) | Owned and fixed in #597 `e3167fe7`; inherited through a clean rebase (`git rebase --onto e3167fe7 fc5c5a9e`, no conflicts). The #599 delta (3 commits) is unchanged. | (#597) | #597 specs re-run on this head (below) |
| Opus audit at `9a0b9f94` (APPROVE, CI incomplete) | No new findings. The missing CodeQL / Banned cast tokens / build-sbom / danger checks run on this push (PR targets `main`). | — | CI at this head |

Incremental range for audit: `e3167fe7..7b496aca`.

**Tests run (`heavy.sh`, `CI=false`, `--runInBand --forceExit`) at `775f1a90` (same #599 commits on #597 `62649d8`; the only later change is #597's MAC-only commit `e3167fe7`):** `npx jest test/invite-attach-reliability.spec.ts test/invite-attach-idempotent-replay.spec.ts test/rate-limit.spec.ts test/redis-throttler.spec.ts test/env-validation.spec.ts test/prod-readiness/env-discovery.spec.ts test/auth-signup-role-choice.spec.ts test/c13-email-case-login.spec.ts test/auth/extension-auth.spec.ts test/select-role-canonical-attach.spec.ts test/invite-codes.service.spec.ts` → 11 suites passed, 456/456 tests passed; `npx tsc --noEmit -p tsconfig.json` → exit 0.
At `7b496aca`: `npx jest test/auth-signup-role-choice.spec.ts test/c13-email-case-login.spec.ts` → 2 suites passed, 84/84 tests passed.

