## Merge-train conflict resolution — #599 onto main `10dff85c`

Builder: B-TRAIN (Claude Opus 5.5). Method: `git merge origin/main` into `clinic/c03-reliable-attach` (merge commit, no rebase, no force push).

- Previous approved head: `7b496acad3342c0f71fb99855399804f385c33c5` (Sol APPROVE + Opus APPROVE, incremental `e3167fe7..7b496aca`)
- Merge commit: `894263f5` (pure conflict resolution, no extra edits)
- Follow-up commit: `8ae0fea5` (single `coach_cannot_redeem` constant and body, see below)
- New head: `8ae0fea5341b1e832356e725fafb46ee1025ea71`

### Why the conflicts were only "#597 vs #599 on top of #597"

- #597 landed on main as squash `bab05f44`. Its tree equals #597's final head `b6b383c7`, which is `e3167fe7` plus a merge of main (#606, #625). This branch already contained #597's commits up to `e3167fe7`.
- On main, every conflicted auth, invite-codes, env-validation and spec file is byte-identical to `e3167fe7` (`git diff --stat e3167fe7 10dff85c -- src/auth src/common src/invite-codes src/throttler test/invite-*.spec.ts` lists only `.env.example` and `prod-switches.yml`, both from #622). So each conflict is #597's code on main against #599's audited rework of that same code.
- **Proof the merge commit is a pure resolution:** `git diff 10dff85c 894263f5` and `git diff e3167fe7 7b496aca` (the audited #599 delta) have the same `git patch-id --stable` (`c3c450fc…`). The tree of `894263f5` (`1f7c5d1f`) equals `git merge-tree --write-tree --merge-base=e3167fe7 10dff85c 7b496aca`. So `main..894263f5` adds exactly the code both auditors approved and nothing else.

### Per-hunk resolution

| # | File and hunk | main side (#597) | branch side (#599) | Kept | Why |
|---|---|---|---|---|---|
| 1 | `.env.example` after `SIGNUP_ROLE_CHOICE_ENABLED` | nothing | `AUTH_SIGNUP_WITH_CODE_PER_HOUR=100` block | #599 | Insertion-only conflict. #622's `.env.example` lines auto-merged and are kept. |
| 2 | `src/common/env-validation.ts`, spec list after `SIGNUP_ROLE_CHOICE_ENABLED` | nothing | `AUTH_SIGNUP_WITH_CODE_PER_HOUR` optional spec (clamp 5..500, default 100) | #599 | Insertion-only conflict. Keeps the C03-B1 burst cap registered. |
| 3 | `src/auth/auth.service.ts` imports | nothing | `inviteAttachErrorCode`, `INVITE_ATTACH_ERROR`, `InviteAttachErrorCode` | #599 | Main's `coachCannotRedeemBody` and `isCoachLikeRole` imports are shared context and stay. |
| 4 | `auth.service.ts`, helper before the C13 block | nothing | `tryAttachInviteCode(flow, userId, code)` | #599 | Signup-with-code, Google and Apple all attach through this one helper, which reports `invite_attached` and `invite_attach_error`. There is no second attach path: select-role still calls `attachUserToCoachByCode` (from #597 `aaea7200`). |
| 5 | `auth.service.ts` googleAuth, declaration | nothing | `let invite_attach_error` | #599 | Needed for the reported outcome. |
| 6 | `auth.service.ts` googleAuth, attach branch | `else if (inviteCode && !user.coach_id) { try attach }` | coach-like branch sets `invite_attach_error = coach_cannot_redeem`; `else if (inviteCode)` goes through `tryAttachInviteCode` | #599 | Main's guarantee stays: a coach or owner is never attached or demoted, and the shared `isCoachLikeRole` skip is untouched. Main's `!user.coach_id` pre-skip silently ignored a code from a different coach. #599 sends it to the canonical writer instead, which gives an idempotent success for the same coach and `409 already_attached_to_different_coach` for a different coach (never a re-parent), and reports that result. |
| 7 | `auth.service.ts` appleAuth, declaration | nothing | `let invite_attach_error` | #599 | Same as hunk 5. |
| 8 | `auth.service.ts` appleAuth, attach branch | same as hunk 6 | same as hunk 6 | #599 | Same as hunk 6. |
| 9 | `src/invite-codes/invite-codes.service.ts`, module helpers | `class SameCoachAttachRace` | `isWellFormedInviteCode`, `INVITE_ATTACH_ERROR` and `inviteAttachErrorCode`, `class AttachRaceSameCoach(coachId)`, `assertRedeemerIsStudent`, `invalidInviteCode` | #599 | **One race class:** `SameCoachAttachRace` is gone (0 references) and `AttachRaceSameCoach` is the only one. Every refusal now carries a machine code. See `8ae0fea5` below for the duplicate `coach_cannot_redeem`. |
| 10 | `invite-codes.service.ts`, `attachUserToCoachByCode` head | single function: resolve with lifecycle checks, then owner/coach-like refusal, then the SOL-C13-A1 same-coach / different-coach guard | resolve the target with no lifecycle checks (`resolveAttachTarget`), refuse non-students, same coach gives an idempotent replay (SOL-C03-B1), different coach gives 409, a new redemption gets full lifecycle checks, then a transaction with a fresh read | #599 | Every #597 guarantee maps onto #599's code. Owner gets 403 (`owner_cannot_redeem`). Coach and sub_coach get 403 `coach_cannot_redeem`, checked before and inside the transaction. Same coach is a no-op with no seat used. Different coach is 409. The write is a conditional `updateMany where {role:'student', coach_id:null}` that changes only `coach_id`, and a lost race rolls back the seat. **One attach path:** `attachUserToCoachByCode` is the only writer of `coach_id` by code (call sites: auth.controller, auth.service `tryAttachInviteCode` + selectRole, invite-codes.controller). |
| 11 | `invite-codes.service.ts`, transaction tail | inline seat bump plus `SameCoachAttachRace` catch | `resolveAttachTarget` row lookup; the seat is consumed in `consumeInviteSeat` | #599 | The capacity-conditional seat consume, the `intended_email` check (now `invite_intended_email_mismatch`) and `accepted_by_user_id` / `accepted_at` all live in `consumeInviteSeat`. Main's inline copy would have been a duplicate writer. |
| 12 | `test/invite-codes.service.spec.ts`, "attaches a STUDENT" | per-test `updateMany` mock, `toMatchObject` | default `updateMany` mock, `coach_id: null` fixture, exact `toEqual` | #599 | The assertion is stricter and still pins the conditional `where` and that `user.update` is not called. |

Auto-merged files that both sides touched (`src/auth/README.md`, `auth.controller.ts`, `throttler.config.ts`, `prod-switches.yml`, `.github/workflows/ci.yml`) were checked against the reference tree above, and they are identical.

### Follow-up commit `8ae0fea5`: one `coach_cannot_redeem` definition (lane rule: no duplicated helpers)

After the merge, the same refusal existed twice. Main (#597) had `INVITE_ATTACH_COACH_CANNOT_REDEEM` + `coachCannotRedeemBody()`, used by `/auth/select-role`, with the message "...Your role was fixed when the account was created; ask the platform owner if it needs to change." #599 had a second literal, `INVITE_ATTACH_ERROR.COACH_CANNOT_REDEEM = 'coach_cannot_redeem'`, and an inline body with no next step. #597's own comment asked #599 to fold this constant on rebase.

- `INVITE_ATTACH_ERROR.COACH_CANNOT_REDEEM` now references `INVITE_ATTACH_COACH_CANNOT_REDEEM`. The wire value is unchanged.
- `assertRedeemerIsStudent` throws `ForbiddenException(coachCannotRedeemBody())`. Attach and select-role now return the same body, using main's actionable copy (owner rule: say what happened and what to do next).
- Main's `warn` log for a non-student redeem attempt is restored. It logs only the user id and role, never the code string or an email.
- Not changed: the attach writer, race handling, seat consumption, status codes, and the owner path.
- New assertions in `test/invite-attach-reliability.spec.ts`: for coach and sub_coach, `err.getResponse()` equals `coachCannotRedeemBody()`, and the two constants are equal.

Range for auditors: `894263f5..8ae0fea5` (`8ae0fea5` only). The merge commit itself should equal the reference tree; `git diff 1f7c5d1f 894263f5` prints nothing.

### Prior findings: none reopened

- SOL-C13-A1, Opus B1 / Grok A2 (coach_cannot_redeem, never demote), SOL-C03-A1 / Opus C03-B1 (select-role uses the canonical writer), SOL-C03-B1 (idempotent same-coach replay), and C03-B1 (burst cap of 100/h, clamp 5..500): the code is unchanged from `7b496aca`. The only change is `8ae0fea5`, which changes the refusal body, not the decision.
- C-599-1 (#607 collision): not in this merge, because #607 is not on main. Still open for whichever PR lands second.
- C-599-2 (Supabase upstream per-IP limits): an operator config item. Unchanged.
- #624 env registry: #624 is not merged, so nothing to register yet.

### Tests run at `8ae0fea5` (sandbox, `heavy.sh`)

- `heavy.sh npx prisma generate` passed, then `heavy.sh npx tsc --noEmit -p tsconfig.json` exited 0.
- `heavy.sh npx eslint --max-warnings 0` on `src/auth/auth.service.ts src/common/env-validation.ts src/invite-codes/invite-codes.service.ts test/invite-codes.service.spec.ts test/invite-attach-reliability.spec.ts` exited 0.
- Prettier on the same files: the edits in `8ae0fea5` are prettier-clean. The diff between the formatted `7b496aca` file and the formatted current file shows only the intended lines. `auth.service.ts`, `env-validation.ts`, `invite-codes.service.ts` and `invite-codes.service.spec.ts` already fail `prettier --check` at the approved #599 head `7b496aca`, and the last three also fail on main `10dff85c`, so this is not new. There was no whole-file reformat, so the audit diff stays narrow.
- `node scripts/check-r75.js --mode=range --base=10dff85c --head=8ae0fea5`: `as any` net 0, `empty-catch-block` net 0, OK.
- `heavy.sh env CI=false npx jest --runInBand --forceExit --runTestsByPath` on 26 suites: test/invite-codes.service, invite-attach-reliability, invite-attach-idempotent-replay, select-role-canonical-attach, c03-select-role-reparent.regression, auth-signup-role-choice, auth.service, auth.controller, auth-apple, auth-apple-mobile-contract, auth/extension-auth, invite-codes.controller, invite-codes-redeemers, team-mode-invite-attribution, sprint-b-bulk-invite, invite-bulk-email, e2e-saas-smoke, c13-fix-round, c13-email-case-login, oauth-coach-signup-ceiling, auth-forgot-password-throttle, throttler.module, env-validation, deploy-readiness, prod-readiness/env-discovery, ai-consent/ai-consent-wiring. Result: **26/26 suites passed, 550 passed, 3 skipped, 0 failed**. The skips are env-gated or long-standing `it.skip` cases, for example the throttler.module APP_GUARD case and the deploy-readiness STRICT gate.
- Same command on `test/rate-limit.spec.ts test/redis-throttler.spec.ts`: **2/2 suites, 51/51 passed**.
- `scripts/ci/schema-parity-gate.js`: not applicable locally. `git diff 10dff85c 8ae0fea5 -- prisma` is empty, and the gate needs the CI database built by `prisma migrate deploy`. The schema-parity workflow runs in CI on this push.
- Live-DB suites (rls, mwb) run only in CI.

CI: running on `8ae0fea5` after this push (PR base is `main`). The builder reports the final state to the operator. Both T4 auditors need to re-attest this head.
