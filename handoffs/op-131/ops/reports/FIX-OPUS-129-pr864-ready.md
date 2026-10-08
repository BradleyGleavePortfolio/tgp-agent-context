FIX ROUND 1 (OPENING) (CF-NOTIF-DIGEST-128, agent 129, FIX-OPUS-129) — growth-project-backend#864 @ fbf4d1a9a2e45787c35fff98e93e444f7900b8e2 — READY FOR AUDIT

The builder was stopped before CI finished. I took over the red build-and-test at 7f9409d7 (job 113070275807) and fixed it in one push: 3 files, +11/−3. The PR is now +453/−91 = 544 lines, and main fd190078 is already in the branch.

Fixed:
- CI-1 (tsc, the only error in the job log): `src/notifications/digest.service.ts:151` raised TS18048, "'data.weekStats' is possibly 'undefined'". The daily and weekly digest data form one union in which the daily shape types `weekStats` as undefined, so the `'weekStats' in data` check did not narrow it. Line 152 now reads `data.weekStats?.consistencyPct ?? 0`, the same expression as main. Behaviour does not change: the weekly subject still states the 7-day consistency, and the daily subject never used it.
- CI-2 (tests that never ran in CI, because tsc failed first): this PR sends the client daily digest only when `EMAIL_DIGEST_CLIENT_DAILY_ENABLED=on`. Three privacy cases call `sendClientDailyDigests` without that setting, so they sent nothing and failed:
  - `test/privacy/no-pii-in-logs.spec.ts` "log transport: the line names the user id and template only"
  - `test/privacy/no-pii-in-logs.spec.ts` "provider error that echoes the address: neither the log nor the stored failure holds it"
  - `test/privacy/no-pii-probe-replays.spec.ts` "DigestService provider failure with a display name and free text"

  Failing first: with the PR's code from 7f9409d7, 2 of 11 and 1 of 13 fail. The specs now turn the setting on (`no-pii-in-logs.spec.ts:158`, `no-pii-probe-replays.spec.ts:191-197`), so they still check the privacy property on the real send path. No assertion changed.

Local targeted runs at fbf4d1a9 (heavy.sh, one file each):

| Spec | Result |
|---|---|
| cf-notif-digest-128 | 9/9 |
| digest.cron | 20/20 |
| b-digest-127-digest-links | 16/16 |
| b-emailfrom-126-sender | 10/10 |
| privacy/no-pii-in-logs | 11/11 |
| privacy/no-pii-probe-replays | 13/13 |
| community/realtime/posthog-event-names | 3/3 |
| env-validation | 50/50 |
| ci/fly-env-manifest | 69/69 |
| engagement/engagement-flags | 16/16 |
| deploy-readiness | 35/35, 1 skipped |

CI at this head: green, 15 of 16 checks passed (build-and-test included); the remaining one, deploy-readiness-gate, is skipped as it is on every PR.

The PR's own scope is unchanged (see the PR body): U6 digest numbers, units and the client inbox row; U8 first-day copy; and the owner default that turns the client daily digest off. After merge and deploy, client daily digest emails stop unless `EMAIL_DIGEST_CLIENT_DAILY_ENABLED=on` is set. The Sunday weekly summary and the coach digests keep sending.

agent 129
