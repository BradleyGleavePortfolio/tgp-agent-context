# S-SCHED — operator agent 110

## 2026-10-01 initial checkpoint

- Read common brief and lane objective; fresh isolated worktrees created from current main.
- Backend worktree: `/home/user/workspace/wt/s-sched-110-backend`, branch `agent110/s-sched-backend`.
- Mobile worktree: `/home/user/workspace/wt/s-sched-110-mobile`, branch `agent110/s-sched-mobile`.
- Dependency installs were not yet READY at first observation; code reading first. Disk 59%.
- Initial classification: T2 for native screens on existing scheduling contracts and bounded C04 seed/reminder feature-switch work.
- Promotion discovered in recovered agent 108 backend WIP: it changes booking concurrency/state authority and introduces persistent/schema and mobile API contracts. Those portions are T3 (and any changed ownership enforcement is T4), not eligible for blind recovery as T2. Pausing higher-tier portions while evaluating a sound T2 subset; operator should retain higher-tier architecture ownership/reroute remaining contract work if required. No WIP CI-gate changes will be reused.
- Neither WIP was tested/audited; no inherited approval is claimed.

### Higher-tier prerequisite for operator routing

Recovered WIP backend introduces `/scheduling/my-coaches`, `scope=past`, `session_type_id` slot computation, `SessionType.is_welcome`, default meeting links, advisory booking locks and assigned-coach read enforcement. Main already supports open slots by `duration_minutes`, profile coach identity, availability overrides and editable active appointment types. I am building the sound native T2 client on those existing contracts, plus a bounded dry-run C04 seed and explicit reminder switch. The following remain day-1 backend blockers for a higher-tier builder, not silently cut functionality: authoritative appointment-type/availability validation on request/reschedule (main currently accepts arbitrary times/durations and archived types), consistent pending-provider conflict exclusion and approval/cancel race proof; type-specific open slots, renamed welcome marker and historical sessions require the recovered new contracts. Recommend operator delegate the WIP backend architecture as T3/T4, independently of these T2 PRs.

Mobile requires the approved new dependency `expo-calendar ~56.0.8`. I will update only package/lock metadata with the lane-approved `npm install --package-lock-only`; operator must add it to shared mobile deps. No worktree dependency install.

## 2026-10-01 validation checkpoint

- Shared deps now READY; linked both worktrees, generated private backend Prisma client successfully.
- Backend targeted seed/reminder tests: **20/20 passed**, two suites. Log: `ops/reports/S-SCHED-110-backend-checks.log`.
- Backend full `npx tsc --noEmit -p tsconfig.json` reached the imposed 2560 MB heap limit and exited 134; it did not produce a typecheck result. Sandbox remains healthy (7.5 GB available; disk 68%). No repeat full typecheck locally; defer to CI rather than raising memory in the shared sandbox.
- Mobile depot is missing `expo-calendar`; metadata is approved by the lane. Please add `expo-calendar ~56.0.8` to shared mobile deps. Official package has already been fetched read-only to `/home/user/workspace/s-sched-110-expo-calendar/package` for API validation.
- Native phone-calendar export uses the OS event editor without full-calendar reads/account linking, reports Android's inability to prove Save honestly, and discloses that copies do not auto-sync. The recovered WIP's global unscoped event map, silent delete failures, duplicate creation on any update failure, and overclaimed auto-sync were not sound and are not being reused.

## Backend PR published

- Fresh PR onto main: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/632
- Branch `agent110/s-sched-backend`, head `b978cbce` (full SHA to be recorded at final checkpoint).
- T2, explicit switch + dry-run C04 seed only; backend WIP lifecycle/schema/API changes not included.
- Exact-head CI and Schema parity pending; independent audit not yet run. No deployment, merge or feature/environment change performed.
- Approved package-lock-only mobile metadata update completed; no worktree node_modules writes. Shared mobile dependency addition remains required.

### Backend CI round 1 / 2

- At `b978cbcebe94ecc2643f91fd5d1715dbd0f2dd44`, build-and-test, RLS/live/MWB, npm audit, CodeQL and **Schema parity all passed**. Banned-cast gate caught new test-only bottom-type casts; fixed using the repository-sanctioned documented partial-mock assignments, not a gate change.
- New backend head `4accdbc34d55b69ba197ccb2babd46f3c85b43e8`. Targeted tests 20/20 and ESLint passed again; local `node scripts/check-r75.js --mode=range --base=origin/main --head=HEAD` passed (net token increase zero). Exact-head CI, including Schema parity, rerunning.
- Shellcheck SC2015 is the known pre-existing non-required failure, not changed here.

### Mobile evidence / further prerequisite

- First native UI/helper/tutorial/router bundle: **105/105 tests passed**, seven suites.
- Main mobile `npx tsc --noEmit -p tsconfig.json` completed and reported only two missing `expo-calendar/legacy` module errors (source + test); shared deps still omit the newly approved module. Supplementary typecheck will map only that missing module to the exact official 56.0.8 declaration package, with no node_modules writes. CI still must certify the actual installed lock graph.
- **Additional day-1 notification blocker requiring higher-tier architecture owner:** current `BookingEmitter` creates Notification rows with `deep_link` + booking payload; mobile tap handler consumes `actionScreen/actionParams`. Current `createNotification` stores push-channel rows; the two actual transport methods use other payloads. A end-to-end booking notification delivery/tap proof is required rather than assuming the recovered WIP's mocked routing tests establish delivery. The T2 screen/router registration alone does not fix this shared primitive.
- Native coach agenda is being made useful on existing contracts (approve/decline, attach call link, cancel), rather than leaving call-link entry orphaned. Calendar editors now use the server's scheduling timezone, not the device clock.

## Validation round 2 checkpoint

- Backend #632 at `4accdbc34d55b69ba197ccb2babd46f3c85b43e8`: **all required CI green and exact-head Schema parity PASS**. Only the known non-required shellcheck failure remains.
- Mobile expanded round: 11 suites / 163 tests passed; one coach test suite could not parse a newly added regex. Targeted ESLint identified that same regex typo. It is fixed; no passing aggregate is claimed for that round.
- React Query test clients now explicitly clean up after tests to avoid retaining GC/polling handles in the local targeted bundle.

## Validation round 5 / publishing checkpoint

- Supplementary mobile TypeScript check now passed using official **56.0.10** declarations, the exact version selected in package-lock. It adds only a temporary missing-module mapping outside the repository; actual installed CI graph remains the merge evidence. Shared depot still lacks expo-calendar, and operator addition remains requested.
- Round 5 waited approximately 11 minutes in the global heavy queue; no competing heavy command or increased heap was used. Nine focused suites are running with a bounded timeout and open-handle detection.
- Backend final head `4accdbc34d55b69ba197ccb2babd46f3c85b43e8`: required checks all PASS, including exact-head Schema parity. Saved machine-readable rollup to `ops/reports/S-SCHED-110-backend-ci-4accdbc.json`; PR body updated with exact evidence and the R75 fix round.
- Mobile launch configuration has the Calendar flag ON for clinic/production profiles but the PR will be draft/launch-blocked pending independent audit, higher-tier backend lifecycle and notification work, and real-device QA. This does not authorize a release with unresolved blockers.

### Native final safety cases

- Nine focused suites completed **129/129 assertions** in round 5; the runner retained one Sentry SDK timer, so that process is **not** claimed as a clean pass. Three new unit boundaries now mock the reporting facade; the sanitized error-reporting test still verifies diagnostic content. Clean final runner and lint are queued together, using `timeout --kill-after=10s 180` and no force-exit.
- Added a native fallback for a malformed session notification with no params: a specific incomplete-link explanation and working See Calendar action, rather than destructuring undefined and crashing. Call-link save now invalidates the coach agenda list as well as session detail.
- Backend lifecycle repair should include pending-provider manual-link recovery: existing attach-link changes video fields without promoting pending status. Google providers remain off, but a higher-tier lifecycle review must prove the recovery path.

## Mobile PR published — draft / launch blocked

- Fresh PR onto main: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325
- Own branch `agent110/s-sched-mobile`, exact head `bc1398c29de93ec5318568716c8308ea19ce110a`.
- T2 native screens/adapters on established main contracts. Real client Calendar entry, booking/request/move/cancel/details/device copy, coach type/time-off/weekly controls and agenda call links, and tutorial final welcome-call action. No backend ownership/concurrency contract changed.
- Required installed-graph CI is running. Final local exact-head checks are queued in `S-SCHED-110-mobile-final-checks-r8.log` (changed-file ESLint, env/app-config validation, supplemental TypeScript, nine focused suites).
- Cancelled round 7 **before execution** after noticing its staged-diff file selector would be empty after checkpoint commit. Round 8 uses the immutable starting-main SHA; no duplicate heavy execution and no result claimed for round 7.
- No independent audit, merge, deployment, production seed, feature-switch/environment mutation or workflow dispatch performed.
- **Operator action now:** route the paused higher-tier backend lifecycle and notification prerequisites; add exact lock-selected expo-calendar 56.0.10 to shared mobile deps. Do not release the ON build profile with those blockers unresolved.

### Exact-head CI progress

- Mobile #325 at `bc1398c29de93ec5318568716c8308ea19ce110a`: actual installed-graph TypeScript and lint **PASS**, along with Expo native-module Gradle, Hermes, vendor, env-manifest and app-config guards. Both CodeQL analyses PASS. Full test step remains in progress; no aggregate CI green claim yet.
- This removes the missing-module uncertainty for CI. The shared local depot still omits expo-calendar; local mapping remains explicitly supplemental, not a replacement for CI.

## Final acceptance checkpoint

### T2 backend — PR #632

- URL: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/632
- Exact head: `4accdbc34d55b69ba197ccb2babd46f3c85b43e8`.
- Local: 20/20 targeted tests, changed-file ESLint and private Prisma generation PASS; local full tsc incomplete (heap cap, exit 134). R75 range gate PASS.
- Required CI all PASS, plus mandatory exact-head Schema parity PASS. Known non-required shellcheck SC2015 remains. Independent audit not performed.
- CI evidence: `S-SCHED-110-backend-ci-4accdbc.json`; immutable diff: `S-SCHED-110-backend-4accdbc.diff`.

### T2 mobile — draft PR #325

- URL: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325
- Exact head: `bc1398c29de93ec5318568716c8308ea19ce110a`.
- **All required exact-head CI PASS**: installed-lock-graph TypeScript/lint/test and both CodeQL analyses. Full CI suite: **404 suites / 5442 tests passed**, 85.016 seconds.
- Local exact-head ESLint, env manifest, app config and supplementary full TypeScript PASS. Local targeted assertions **130/130 passed across nine suites**; single-process runner remained alive after assertions and bounded wrapper exited **124**. No clean local runner result claimed. Scoped mocks removed the earlier reported Sentry timer trace, but remaining local harness cleanup has not been proven. No further retry, no force-exit and no gate changes.
- Standard local tsc remains blocked solely by missing shared expo-calendar module. Official exact-lock-version declaration mapping is supplemental; installed CI graph is fully verified.
- App-config validation retains existing pending Play Store URL/signing-fingerprint metadata warnings; no release-readiness pass claimed.
- CI evidence: `S-SCHED-110-mobile-ci-bc1398c.json`, `S-SCHED-110-mobile-ci-full.log`; local log: `S-SCHED-110-mobile-final-checks-r8.log`; immutable diff: `S-SCHED-110-mobile-bc1398c.diff`.

### Operator / owner handoff

1. **Do not launch yet.** Route the paused backend lifecycle/concurrency and ownership/API work as T3/T4, plus real booking notification delivery/tap/recovery and pending-provider manual-link recovery. Current T2 PRs are not an end-to-end day-1 readiness claim.
2. Approve/implement remaining contracts for multi-coach identity if required, persistent renamed welcome marker, historical sessions/archive history and per-type default links; the T2 app is truthful about established-contract capabilities.
3. Add expo-calendar **56.0.10** to shared mobile deps for future local audit work. Package-lock-only change was authorized and actual CI installed it successfully.
4. Independent audits and actual iOS/Android calendar, push and native UI QA remain mandatory. Include local single-process test-harness cleanup in validation follow-up.
5. C04: review seed dry run, then `--apply` only after verified coach signup; set weekly availability in-app. Set `BOOKING_REMINDERS_ENABLED=on` only after transport/device QA. No owner product decision is needed for the implemented defaults.
6. Both PRs and heads pushed only on new own branches; no main push, merge, workflow dispatch, production seed or environment mutation. PR bodies include current tier headers, fix rounds and exact-head evidence.

Exact targeted commands are retained in the PR bodies and logs. Both own worktrees were removed after preserving immutable diffs, logs and exact-head CI evidence; both pushed branches and PRs remain available. Final local runner evidence is `EXIT=124` after 130 passing assertions, explicitly reflected in the PR body and this report.
