# B-EXPORT-2 (agent 111, builder) — report

Date: 2026-10-02. Plan of record: fix #636 + #327 in one pass -> dual approval of #636 -> operator merges #636 into #608's branch -> #608 update + dual delta -> merge #608, then #327. Builder did not merge, dispatch workflows, or touch production. Pushed only to the three PR head branches.

## PRs and final heads

| PR | Repo | Branch | Base | Final head | CI at report time |
|---|---|---|---|---|---|
| #608 | backend | agent/clinic/deletion-be/7c1d2e9a | main | `4e926b357c7c735f93edfebb7362a87b4b7babec` | 19 success, 1 skipped, 1 failure: `Infra Lint / shellcheck (scripts/*.sh)` — SC2015 in `scripts/s10-core-diff-gate.sh`, a file this PR does not change (identical to main e5a6044a). Already-known main problem; separate fix branch `agent/clinic/s10-sc2015` exists. |
| #636 | backend | agent/clinic/data-export-storage-be/b110 | #608 branch (stacked) | `7883337f5cd7164f50cfc22bbb64c59d573efe12` | 13 success, 1 skipped. Stacked: ready for CI (CodeQL / banned-cast / sbom / danger only run fully against main). |
| #327 | mobile | agent/clinic/data-export-download-mob/b110 | main | `7e643f9beb2fc1f8e8b279f7ee6c34c4dfeb6231` | 1 success, 1 neutral, 2 pending. |

## #608 (merge main + #624 env registration)

- Merged main e5a6044a with a merge commit (no rebase). Registered in ENV_RULES (default + reason): `APPLE_SIGNIN_KEY_ID`, `APPLE_SIGNIN_PRIVATE_KEY`, `APPLE_SIGNIN_CLIENT_ID`, `SUPABASE_BLOODWORK_BUCKET`.
- Sol's latest #608 verdict (comment 5945932895) had only B-608-12, which #636 closes. No other #608 findings to fix.
- PR body "Fix round 5" appended; comment posted. Needs dual delta audit 2759e1a0..4e926b35.

## #636 (backend storage) — commit 7883337f (on merge fb46142e of #608's branch)

Findings A-636-1, B-636-1, B-636-2, B-636-3, B-636-4, C-636-1: all fixed, each with a test that fails before the fix (fix-round table in the PR body; copy saved at `ops/bexport2-111/636-body-r1.md`). Migration stays `20270221000000`.
- Store: 30 s per-call deadline + abort per attempt, confirmed size via `stat()`, new codes `STORAGE_BUCKET_UNCONFIRMED` / `STORAGE_SIZE_UNCONFIRMED` / `STORAGE_TIMEOUT`, stream cancelled on early end.
- Service: re-read after a lost reap, stat before minting a link, conditional `_retireLostArchive`, FAILED -> file-missing message. Controller: no Sentry for `ERR_STREAM_PREMATURE_CLOSE`.
- SQL: restrictive fence `data_exports_api_roles_fence`; `verify.sql` rewritten as catalog checks; `down.sql` drops the fence.
- B-636-2: closed by merging main (`SUPPORT_EMAIL` = Bradleyapple1031@gmail.com) plus a regression test.
- ENV_RULES: `DATA_EXPORT_STORAGE`, `DATA_EXPORT_DOWNLOAD_LINK_TTL_SECONDS`, `DATA_EXPORT_STALE_RUN_MINUTES`.
- **T4 disclosure:** `.github/workflows/ci.yml` gains an `rls-live-tests` step for `test/rls/data-export-storage-bucket-rls.spec.ts`.

Evidence:
- `heavy.sh npx jest --ci --runInBand --runTestsByPath <18 suites>` -> 18 suites, 360 passed, 1 skipped (`ops/bexport2-111/636-jest-r1.log`). Suites: data-export-storage, data-export-bucket-verifier-wiring, data-export.service, data-export-archive-cleanup, account-deletion, support-email.guard, env-registration, env-validation, deploy-readiness, ai-consent-wiring, release-evidence-gate.
- Failing before: `test/data-export-storage.spec.ts` 26 failed / 44 passed (`storage-before.log`). Live RLS suite on PGlite: 13 failed / 2 passed before (`rls-before.log`). The 15/15 pass after was seen during the session, but no log was saved for it; CI's `rls-live-tests` step is where it is confirmed.
- `tsc --noEmit` clean (needs `NODE_OPTIONS=--max-old-space-size=4096`). eslint clean. check-r75 range OK. `git diff --check` clean.

## #327 (mobile) — commit 7e643f9b (base main e3986e89 already contained, no merge needed)

| Finding | Disposition | Proving test |
|---|---|---|
| B-327-1 | Fixed: the screen uses `SUPPORT_EMAIL` from `src/constants/support.ts` (byte-identical to the file in open PR #324) | FAILED/unknown address tests; updated unknown-request test |
| B-327-2 | Fixed: each async step is tied to the signed-in user and to this screen instance. Logout, login, auth change, user change and unmount all cancel it. The status-token fallback is covered too. | unmount, logout (link and legacy paths), and identity-change tests |
| B-327-3 | Fixed: every 2xx body is validated (`parseDataExportRecord`, `parseDownloadLink`), and a malformed body raises `DATA_EXPORT_BAD_RESPONSE`. A bad body can no longer produce "apiundefined". Unknown status ends the spinner with a specific message. | `dataExportApi.test.ts`; malformed link and status screen tests |
| B-327-4 | Fixed: the reference is the server id, else the `X-Request-Id` the app sent, else a fresh id. The same value is shown on screen and sent to Sentry. | sent-request-id and fresh-reference tests |
| B-327-5 | Fixed: only one status poll runs at a time, with a generation check, so late answers are dropped. A `null` status means "We could not find your export" and polling stops. | single-flight, late-answer and vanished-export tests |
| B-327-6 | Fixed: Sentry receives a cleaned `DataExportFailure`. `sentryScrub.ts` runs in `beforeSend` and `beforeBreadcrumb`. | iOS/Android native rejection tests; `sentryScrub.test.ts` |
| C-327-1 | Fixed: a deadline timer (capped at 6 h) plus a re-render when the app returns to the foreground | deadline test |

Evidence:
- `heavy.sh npx jest --ci --runInBand --runTestsByPath src/screens/settings/__tests__/DataExportScreen.test.tsx src/services/__tests__/dataExportApi.test.ts src/services/__tests__/sentryScrub.test.ts src/__tests__/quietLuxuryDoctrine.test.ts src/config/__tests__/declaredDependencies.test.ts src/utils/__tests__/authFailure.test.ts src/hooks/__tests__/useCurrentUser.composition.test.tsx` -> 7 suites, 134 passed (`327-jest-final.log`).
- Failing before: the screen and adapter tests run against the 227c5ad9 sources give 42 failed / 23 passed (`327-before.log`; this count includes failures that cascade from the first ones).
- `tsc --noEmit -p tsconfig.json` clean (`327-tsc.log`). eslint clean on the 8 changed files. Prettier applied. `git diff --check` clean. No banned tokens in the diff.
- PR body updated with a "Fix round 1" table (`327-body-r1.md`, T4 scan updated). Comment 5956760302 posted.

## Open risks

1. Storage SECURITY DEFINER functions are not checked against the catalog in `verify.sql`.
2. Supabase may refuse `DELETE` on `storage.buckets` in #636's `down.sql`.
3. `sentryScrub` applies to every Sentry event in the app. This is a broader behaviour change (T4).
4. Mobile main still has `DELETION_SUPPORT_EMAIL` = Bradley@Bradleytgpcoaching.com in `deletionErrors.ts` and hello@ in SupportInbox. This is outside the lane; #324 consolidates it.
5. `src/constants/support.ts` exists in both #327 and #324 (identical new file, so either merge order is clean).
6. The #608 shellcheck failure was already on main.

## Operator / owner decisions (recommended default)

- Dual audit of #636 delta fb46142e..7883337f, then merge #636 into #608's branch (default: yes, after two approvals).
- Approve the ci.yml `rls-live-tests` step (T4). Default: accept.
- Either land the `s10-sc2015` fix first or treat the #608 shellcheck failure as already on main. Default: land the fix first.
- Dual delta audit of #608 (2759e1a0..4e926b35), and of #327 (227c5ad9..7e643f9b) after #608.

Worktrees `wt/bexport2-608`, `wt/bexport2-636` and `wt/bexport2-327` removed at the end of the lane.
