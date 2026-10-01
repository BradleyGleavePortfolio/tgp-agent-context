## Merge-train conflict resolution — #595 onto main `53b625d2`

Builder: B-TRAIN (Claude Opus 5.5). Method: `git merge origin/main` into `clinic/c01-comp-access` (merge commit, no rebase, no force push).

- Previous approved head: `e1dd4c390fc195c4ec7f2ae5b0dafb0aa483acc0` (Sol APPROVE + Opus APPROVE, incremental `7b496aca..e1dd4c39`)
- Merge commit: `db7785dd` (pure conflict resolution, no extra edits)
- Follow-up commit: `f2eecae5` (migration rename plus a placement test, see below)
- New head: `f2eecae54020854297210cd490971bf619385e12`

### What main changed under this branch

- Main now carries #606, #625, #597 (`bab05f44`), #622 and #599 (`53b625d2`). #599's squash tree is identical to its approved head `8ae0fea5`.
- This branch already contained #599 up to `7b496aca`. Beyond `7b496aca`, the only main-side change to the conflicted files is the #599 merge-train commit `8ae0fea5`. That commit made one `coach_cannot_redeem` constant and one body, and restored the non-student warn log.
- **Proof the merge commit is a pure resolution:**
  - `git diff 53b625d2 db7785dd` and `git diff 7b496aca e1dd4c39` (the audited #595 delta) have the same `git patch-id --stable` (`1b0df9a0…`).
  - The tree of `db7785dd` (`bf3b1300`) equals `git merge-tree --write-tree --merge-base=7b496aca 53b625d2 e1dd4c39`.
  - So `main..db7785dd` adds exactly the code both auditors approved.
- `src/invite-grant/**`, `checkout.service.ts`, `packages.*`, `consent.service.ts`, `refund-dispute-handler.service.ts`, `coach-connect`, `connect/fees` and `audit.service.ts` are byte-identical to `e1dd4c39`. That includes the `revoke` and `activateRow` predicates (Opus final-head check).

### Per-hunk resolution

| # | File and hunk | main side | branch side (#595) | Kept | Why |
|---|---|---|---|---|---|
| 1 | `src/auth/auth.service.ts` imports | nothing | `type AttachGrant` | #595 | Additive. Main's `INVITE_ATTACH_ERROR` / `inviteAttachErrorCode` imports are shared context and stay. |
| 2 | `auth.service.ts` `tryAttachInviteCode` signature and body | returns `{ invite_attached, invite_attach_error? }` | adds `invite_grant?` from `res.grant` | #595 | Same single attach helper and the same `INVITE_ATTACH_ERROR` failure mapping; the success result now also carries the grant outcome. |
| 3–5 | `auth.service.ts` googleAuth: `let invite_grant`, `invite_grant = attach.invite_grant`, response spread | nothing | grant threading | #595 | Additive. The coach-like skip (`coach_cannot_redeem`) and `invite_attach_error` from #599 are shared context and unchanged. |
| 6–8 | `auth.service.ts` appleAuth: same three hunks | nothing | grant threading | #595 | Same as hunks 3–5. |
| 9 | `auth.service.ts` selectRole return | `{ role, coach_id }` | adds `invite_grant` from `attached.grant` | #595 | Select-role still delegates to the canonical `attachUserToCoachByCode`. |
| 10–12 | `auth.service.ts` signupWithCode: same three hunks | nothing | grant threading | #595 | Additive. |
| 13 | `src/invite-codes/invite-codes.service.ts`, comment above `INVITE_ATTACH_COACH_CANNOT_REDEEM` | "folded" comment (#599 `8ae0fea5`) | old "#599 folds this on rebase" text | main | #595 never edited this line; the branch side is just pre-fold #599 text. |
| 14 | `invite-codes.service.ts` `INVITE_ATTACH_ERROR.COACH_CANNOT_REDEEM` | `= INVITE_ATTACH_COACH_CANNOT_REDEEM` | `'coach_cannot_redeem'` literal | main | One constant (no duplicated helpers). The wire value is identical. |
| 15 | `invite-codes.service.ts` `assertRedeemerIsStudent` coach branch | `ForbiddenException(coachCannotRedeemBody())` | inline `{ code, message }` | main | One body, the same one select-role returns, with an actionable next step. |
| 16 | `invite-codes.service.ts` after `AttachRaceSameCoach` / `invalidInviteCode` | nothing | `AttachGrant` and `AttachResult` types | #595 | Additive. |
| 17 | `invite-codes.service.ts` `attachUserToCoachByCode` return type | inline type | `Promise<AttachResult>` | #595 | Superset type: `grant?` is optional. |
| 18 | `invite-codes.service.ts` before `assertRedeemerIsStudent(me)` | non-student `warn` log (#599 `8ae0fea5`) | nothing | main | #595 never touched this; it is the #599 fold. |
| 19 | `invite-codes.service.ts` same-coach replay return | `already_attached: true` | `grantAfterAttach(..., 'replay')` then return with `grant` | #595 | SOL-C03-B1 idempotent replay is unchanged (no write, no seat, no event); the grant on replay is authorised separately (C01). |
| 20 | `invite-codes.service.ts` `AttachRaceSameCoach` catch | `already_attached: true` | `grantAfterAttach(..., 'replay')` then return with `grant` | #595 | One race class (`AttachRaceSameCoach`) is kept, and its no-op result now carries the grant. |
| 21 | `invite-codes.service.ts` after the transaction | nothing | `grantAfterAttach(..., 'new')` | #595 | Runs post-commit and only after a successful attach. It never throws, so the grant can never undo the attach. |
| 22 | `invite-codes.service.ts` `INVITE_REDEEMED` tail and `grantAfterAttach` helper | `return result` | `grant_status` in the event, return with `grant`, the helper | #595 | Additive. `grant_mode === 'none'` gives no grant. |
| 23 | `test/invite-attach-reliability.spec.ts` imports (add/add) | adds `INVITE_ATTACH_COACH_CANNOT_REDEEM`, `coachCannotRedeemBody` | pre-fold imports | main | #595 has not edited this file since `7b496aca`. |
| 24 | `test/invite-attach-reliability.spec.ts` coach refusal assertions (add/add) | adds the body and constant pins | nothing | main | Same as hunk 23. |

The auto-merged files `prisma/schema.prisma` (#622 ledger models plus #595 bindings), `src/app.module.ts` (`InviteGrantModule` plus `AiConsentModule`) and the rest equal the reference tree above. `prisma validate` and `prisma generate` pass on the merged schema.

### Follow-up commit `f2eecae5`: migration ordering (operator instruction, Opus final-head check)

- `20270125000000_invite_grant_bindings` shared its timestamp with #625's `20270125000000_restore_schema_declared_objects`. It sorted before that migration ("i" < "r") and before #622's `20270203000000_ai_processing_consent_ledger`. Prisma applies migrations in directory-name order.
- **Renamed to `20270205000000_invite_grant_bindings`.**
  - `20270204000000` is taken by open #630, and `20270202`/`20270203` by #607, #609 and #622.
  - `migration.sql` is byte-identical (a pure `git mv`, 100% similarity). `down.sql` changes only its first comment line, which now names the new directory.
- New `test/invite-grant-bindings-migration.spec.ts` (4 tests):
  - there is a single directory and the old name is gone;
  - it sorts after the #625 and #622 migrations;
  - its timestamp prefix is unique;
  - `down.sql` is present and names the new directory.
- No `schema.prisma`, SQL or baseline change. The schema-parity gate (#625, now blocking) runs on this head in CI. At `e1dd4c39` that job was still the deferred placeholder, so this is the first real parity run for C01.
- #604 (stacked on #595) carries the old directory name and will pick up the rename when it is merged forward.

Range for auditors: `db7785dd..f2eecae5` (`f2eecae5` only). `git diff bf3b1300 db7785dd` should print nothing.

### Prior findings: none reopened

- B-595-1 (pending revoke): `invite-grant.service.ts` is byte-identical to `e1dd4c39`.
- C01 A/B closures carry over.
- The #599 guarantees are intact, as hunks 13–24 show: single attach path, `INVITE_ATTACH_ERROR` codes, same-coach idempotent, different-coach 409, coach and owner never demoted.
- C-595-1 (README SQL fallback), C-595-2 (two consent ledgers, flag OFF) and C-595-3 (#607 double assignment) are unchanged and remain optional or chain items.

### Tests run (sandbox, `heavy.sh`)

- `prisma validate` and `prisma generate` on the merged schema: valid, client generated.
- `npx tsc --noEmit -p tsconfig.json` exited 0. It ran with `NODE_OPTIONS=--max-old-space-size=3584`, because the first attempt at the default 2.5 GB heap cap ran out of memory on the larger merged Prisma client. Nothing else was running under the heavy lock.
- `npx eslint --max-warnings 0` on `src/auth/auth.service.ts src/invite-codes/invite-codes.service.ts test/invite-attach-reliability.spec.ts test/invite-grant-bindings-migration.spec.ts` exited 0. The new spec is prettier-clean. The merge commit introduces no prettier changes, since its files equal the audited `e1dd4c39` and main versions.
- `node scripts/check-r75.js --mode=range --base=53b625d2 --head=f2eecae5`: net 0 for every class, OK.
- `env CI=false npx jest --runInBand --forceExit --runTestsByPath` on 44 suites gave **44/44 suites passed, 732/732 tests passed, 0 skipped**. The suites:
  - invite-codes: service, controller, redeemers, attach-reliability, attach-idempotent-replay, team-mode attribution, bulk invite, bulk email.
  - invite-grant: grant, grant-authorization, bindings-migration.
  - entitlements: service, guards-mounted, workout-program entitlement.
  - packages: service, archive-guard, package-contents, purchase-fanout service, hooks, real-body.
  - checkout: service, webhook-handler, refund-dispute-handler, cancel-pending-on-refund, admin-analytics, coach-connect, reconciliation.
  - consent: service.
  - auth attach: signup-role-choice, select-role-canonical-attach, c03-select-role-reparent, auth.service, auth.controller, auth-apple, apple mobile contract, extension-auth, c13-fix-round, e2e-saas-smoke.
  - migrations and route tables: restore-schema-declared-objects-migration, ci/schema-parity-gate, ai-consent-wiring, dunning-v2-lockout-allowlist-route-table, openapi-spec, route-doc-drift.
- These ran at `ab46ad20`. That commit was then amended locally before the push, to prettier-format one assertion line in the new spec, giving `f2eecae5`. That spec was re-run at `f2eecae5`: 4/4.
- Schema-parity gate and the forward and reversibility migration jobs need the CI database; they run on this push. Live-DB suites (rls, mwb) also run only in CI.

CI at `f2eecae5`:
- All 9 required checks are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger.
- **Schema parity (migrations match schema.prisma) is SUCCESS**. This is the first real parity run for C01.
- **Forward migrations apply cleanly** and **New migrations are reversible** are both SUCCESS.
- deploy-readiness-gate was skipped (PR).
- This is T4, so both auditors need to re-attest `f2eecae5` (range `e1dd4c39..f2eecae5`) before merge.
