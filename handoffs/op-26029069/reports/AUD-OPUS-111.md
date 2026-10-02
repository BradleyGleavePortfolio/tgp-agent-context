# AUD-OPUS report (Claude Opus 5.5 lens, operator agent 111)

## backend#604 @ e159d665b20bf008b7d2fb5c8d4270504223d2ce — APPROVE (T4 delta from 12a4d423; A0 B0 C3: C-604-1 carried, C-604-2/3 new)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/604#issuecomment-5955298192
- 08658e77 is a pure merge of main e5a6044a:
  - merge-tree db964cf6 equals the head tree;
  - own patch-id is unchanged (full b744884a, zero-context 7e4625a6);
  - no test, CI or script gate file differs from main.
- B-604-1 (Sol) is closed. e159d665 adds truthful structured defaults 240/60/400/10, each verified against throttler.config.ts readIntEnv and resolveAccountFailureLimit.
- C-604-2: the legacy AUTH_LOGIN_PER_MIN/HOUR defaults were changed (5 to 20, 30 to 200) with no structured default, and the reason text omits extension login.
- C-604-3: the PR body has no fix-round row for B-604-1.
- CI: 10/10 required checks SUCCESS at the exact head. env-registration.spec passes; totals are 643 suites and 11055 tests. Merge state CLEAN.

## backend#635 @ 0a32b4fe99ffaed0b9aee3e82c69aef40012f021 — NOT POSTED (operator 11:16 EDT: skip, re-queue after the builder's new head)
- Draft verdict (REQUEST CHANGES, A0 B2 C3) saved at ops/aud-opus-111/635_0a32b4fe_verdict.md for the re-audit.
- B-635-1 (the same gap as Sol's): there is no route to list or delete past-day Roman sessions, so "kept until you delete them" holds only for today's chat.
- B-635-2: deleting today's session breaks Roman on that surface until UTC midnight.
  - Cause: the full unique index (user_id, surface, day_key) covers tombstones (migration 20261216000000:99). The reopen hits P2002 and the error is rethrown, giving an uncoded 500.
  - The spec "a fresh session opens" passes only because the fake does not enforce the index.
  - Probe confirms: test/roman/audit-probe-635-reopen.spec.ts (local only).
- Consent half verified: v4 digests are recomputed and match mobile #310; v3 now reads as needs_reconsent; a v3 POST gets 409.
- Local run: 8 suites, 152 passed (log ops/aud-opus-111/jest_635_0a32.log).

## backend#629 @ d134f012738f8f204ffef42a2bf78b201dd1d0e1 — APPROVE (T4 fix round 4; A0 B0 C2 new)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/629#issuecomment-5955565209
- 62d3f678 is a pure merge of main 7a6cfd82: merge-tree 5a33034d equals its tree, and patch-ids are equal (full dc9e30bb, zero-context 10279637).
- Prior findings closed:
  - B-629-3: the backfill now counts only real purchases. Its populated SQLite fixture runs the real SQL and then publish.
  - B-629-4: fields are merged by `key in data`, and switching to one-time clears the interval.
  - C-629-2: currency is optional, and DTO errors come back as PACKAGE_INVALID.
- Probe with mobile #321 @ 4295fc79 bodies: every create and edit body (one-time, monthly, quarterly, yearly, free, recurring to free) is accepted.
- New optional findings:
  - C-629-3: publish() ignores is_active. A package with is_active false publishes, but checkout then refuses it.
  - C-629-4: PACKAGE_INVALID messages are developer text that names API fields.
- Local: 8 suites / 202 tests passed (log ops/aud-opus-111/jest_629_d134.log). CI: 10/10 required checks plus both migration checks are green.
- Operator: main has strict up-to-date on, and the PR is BEHIND e5d10bd8. The merge-tree is clean and the PR adds no env reads; it needs a delta attestation after update-branch.

## mobile#321 @ 4295fc793fc23bfd684a63a2bdc8bd93efdc9b7e — REQUEST CHANGES (T3 fix round 4, single lens; A0 B2 C4)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/321#issuecomment-5955720485
- Closed with code and tests:
  - B-321-2: currency is always sent, and the backend probe returned 201 for every create.
  - B-321-3: billing edits are sent, and the backend probe returned 200.
  - C-321-2.
  - The publish blocker: publish/unpublish UI, drafts read from published_at.
- New:
  - B-321-4: trial days and features are never sent, yet the app says "Changes saved". The backend has no such columns. This is old code I missed at a9b1f49d.
  - B-321-5: Publish ignores unsaved edits. Probe: $50 typed, the $19.99 saved row went on sale, and the alert said "Clients can now buy this package".
  - C-321-3 to C-321-6: PACKAGE_INVALID developer text, save titles on publish failures, weekly packages read as monthly, false restore copy in the archived banner.
- Local: 5 suites / 60 tests passed, plus the 2/2 screen probe (logs ops/aud-opus-111/jest_m321_*.log). CI: all required checks green. BEHIND main e3986e89; merge-tree clean.

---
## backend#634 @ dbc10b7b68436dad567e87057d240fbc5f51a4a8 — REQUEST CHANGES (A0 B4 C5) — posted 2026-10-02 ~09:08 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5956298627

AUDIT Claude Opus 5.5 — growth-project-backend#634 @ dbc10b7b68436dad567e87057d240fbc5f51a4a8 — VERDICT: REQUEST CHANGES

Independent T4 first audit (S-SCHED-2 booking lifecycle, migration `20270222000000_scheduling_lifecycle_integrity`), paired with mobile #325 @ `b0c02156dd86f00e0bfef80a7b517c46ddfb8f2d`. **My count: A0 / B4 / C5.** Sol's verdict (comment 5955780870) landed while I was auditing. I reproduced the overlapping findings myself and cite Sol's IDs rather than adding duplicates. My new findings continue the numbering.

### B (must fix)

**B-634-1 (concur with Sol): approve, decline and cancel are not fenced against a same-status time move.** I reproduced this independently.
- Evidence: `src/scheduling/scheduling-session-lifecycle.service.ts:758-761`. `compareAndSet` filters `{ id, status }` only. A client reschedule keeps `requested` while changing the time (`:416-432`), and reschedule's own CAS already fences `start_at` (`:422`).
- Probe (`test/audit-probe-634.spec.ts`, fake DB + real services): I held approve's CAS, moved the request from Tue 10:00 to 11:00 PDT, then released approve.
  - The row ended `scheduled` at `2026-10-06T18:00Z` (11:00).
  - The client's push said "Coach Kim confirmed your Quick Q/A Call on Tue, Oct 6, 10:00 AM PDT." It came from `existing.start_at` at `:301-307`.
- Minimal fix:
  - Add `start_at` and `end_at` from `existing` to the CAS `where` clause, so a moved row returns 409 `SESSION_STATE_CHANGED`.
  - Build the notification from the updated row.
  - Optionally accept `expected_start_at` from the inbox for stale cards.
  - Add a test for the interleaving above.

**B-634-2 (concur with Sol): a failed reminder delivery consumes the claim and still counts as dispatched.**
- Evidence: `src/scheduling/jobs/reminder.job.ts:185-197` claims first, then calls `emit`. `booking.emitter.ts` now returns a failure outcome instead of throwing, and the job ignores it (`dispatched += 1`). `claimDelivery` at `:217-227` treats every error as a duplicate.
- The claim-first pattern was already on main (`reminder.job.ts:144-182`). It matters now because reminders are ON at launch (OR-110-5).
- Minimal fix:
  - Check the returned outcome.
  - On failure of both channels, delete the claim so the next sweep retries.
  - Count `dispatched` only on real delivery.
  - Return false only for P2002.

**B-634-4 (concur with Sol): the past-sessions cursor drops rows that share the boundary `start_at`.** I reproduced this independently.
- Evidence: `src/scheduling/scheduling.service.ts:480-482` orders by `(start_at desc, id desc)` but pages with `start_at < before` only.
- Probe: one client had two past rows at the same 10:00 (declined, then rebooked and completed) plus one earlier row. Paging with `limit 1` returned `["tie-a","early"]`, while the full list was `["tie-a","tie-b","early"]`.
- Minimal fix: use a compound `(before, before_id)` cursor with the predicate `start_at < b OR (start_at = b AND id < bid)`. Mobile `useCalendar.ts:127-133` must send the id. Add a test where a tie spans pages.

**B-634-5 (new): restoring an archived former welcome type fails every time with a false "landed at the same time" 409.**
- Archiving leaves `is_welcome=true`. After the coach marks another type as welcome, the mobile Restore action (`CoachAppointmentTypesScreen.tsx:140-147`) sends only `{ archived: false }`.
- In `updateSessionType` (`scheduling.service.ts:293-303`), `markWelcome` is only true when `dto.is_welcome === true`. So the other active welcome is not cleared, and the update violates `SessionType_one_active_welcome_per_coach` (`migration.sql:29-31`, `WHERE is_welcome AND archived_at IS NULL`).
- `writeWelcomeAware` at `:543-548` then maps P2002 to `SESSION_STATE_CHANGED`: "Another change to your welcome call type landed at the same time". That is not true, and every retry fails. A natural flow hits this: archive the day-1 welcome, create a new welcome, then restore the old type.
- No test covers restoring a welcome type.
- Minimal fix: when restoring a row with `existing.is_welcome` while `dto.is_welcome` is undefined and another active welcome exists, set `data.is_welcome = false` (keep the current welcome). Add a test against the real index in the live spec.

### C (follow-up)

- **C-634-1 (concur with Sol):** `down.sql:13-14` drops `btree_gist` unconditionally, even when the forward migration reused an extension that already existed. Leave the extension in place, or drop it only if this migration created it.
- **B-634-3 (Sol): an unfenced provisioning update can overwrite a manual link. I grade this C.**
  - The final `coachingSession.update({ where: { id } })` at `:932-942` was already on main (`:649`).
  - Provisioning runs inline before approve and book return, with stub and manual adapters only, so the race needs a second device inside a sub-second window.
  - Fencing on `video_url` / `status` is still the right fix.
- **C-634-2:** the preflight (`migration.sql:56-73`) does not count active rows with `end_at < start_at`. `tsrange(start_at, end_at)` (`:77-80`) then aborts the deploy with a raw range error. Add a second count that RAISEs with an actionable message.
- **C-634-3 (pair):** the upcoming scope (`scheduling.service.ts:486-490`) has no cursor and no status filter, and is capped at 100. The mobile inbox and agenda filter the first 100 rows on the device, and those rows include cancelled and declined sessions. A busy coach can therefore miss a pending request, which still holds its slot. Add `status=` or exclude terminal statuses, and add a cursor.
- **C-634-4 (product):** when a client moves a confirmed approval-type session (`:416-419`), the confirmed time is released at once. If the coach declines, the client has nothing, and the decline push does not say the original time is gone. Either keep the original until the new time is approved, or disclose it (see the mobile C on #325).

### Evidence
- Head re-read: `dbc10b7b` throughout.
- All 10 required checks are SUCCESS at this head (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity). Forward and reversible migrations are also SUCCESS. Shellcheck fails as before (SC2015, ignored).
- Merge-tree with main `e5d10bd8` (#604) is clean (tree `f0ef58d3`). Main's delta and the PR share only `prod-switches.yml` and `src/common/env-validation.ts`, in disjoint hunks.
  - The seam is good: #604 throttler rows plus #634 `BOOKING_REMINDERS_ENABLED` explicit-on copy.
  - The PR adds no `@Throttle` decorators. Its only new env read is `BOOKING_REMINDERS_ENABLED === 'on'`, which is ON at launch under OR-110-5 and is not a finding.
- Locally at this head via heavy.sh: `env CI=false npx jest --runInBand --forceExit` passed 9 suites / 139 tests (lifecycle-integrity, booking-emitter, reminder-delivery, slot-computer-bookable, scheduling.service, booking-reminder.job, permissions, overrides, plus my 2-test probe).
- Checked and not a finding:
  - "participant-only" means the lead coach and client. No scheduling code writes SessionParticipant.
  - Reschedule not moving provider artifacts matches main.
  - `pending_provider` is never written now.
- No push, merge, dispatch or production action.

---
## mobile#325 @ b0c02156dd86f00e0bfef80a7b517c46ddfb8f2d — REQUEST CHANGES (A0 B2 C5) — posted 2026-10-02 ~09:09 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5956311187

AUDIT Claude Opus 5.5 — growth-project-mobile#325 @ b0c02156dd86f00e0bfef80a7b517c46ddfb8f2d — VERDICT: REQUEST CHANGES

Independent paired T4 first audit with backend #634 @ `dbc10b7b68436dad567e87057d240fbc5f51a4a8`, which is REQUEST CHANGES ([my verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5956298627)). **My count: A0 / B2 / C5.** Sol's verdict (comment 5955781501) arrived while I was auditing. I cite Sol's IDs where we overlap and continue the numbering for my new findings. The pair dependencies B-634-1 (an approve can confirm a different time than the one read; the inbox should send `expected_start_at`) and B-634-4 (the past cursor must send the id, `src/hooks/useCalendar.ts:127-133`) need matching changes here.

### B (must fix)

**B-325-1 (concur with Sol): a `tel:` call link is ready on the server but cannot be used in the app.**
- Backend `MEETING_LINK_PATTERN` (`scheduling.types.ts:98`) accepts `tel:` and reports `meeting_link_status: 'ready'`.
- Mobile `resolveVideoUrl` (`src/api/schedulingApi.ts:79-84`) returns null for any non-http(s) link. So the client gets no Join or Call button and no explanation.
- Minimal fix: resolve a bounded `tel:` link to a Call action through `Linking`. Keep rejecting every other scheme.

**B-325-2 (new): coaches get client-worded error copy that gives the wrong next step.**
- `calendarErrorMessage` maps codes through the single client-facing `SCHEDULING_CODE_MESSAGES` table (`src/calendar/schedulingErrors.ts:26-47,53-54`).
- It is also used on every coach surface:
  - `CoachBookingInboxScreen.tsx:56,68,108`
  - `CoachAppointmentTypesScreen.tsx:125,145`
  - time off and availability screens.
- Probe (`src/calendar/__tests__/auditProbe325.test.ts`) using the real server bodies:
  - **Coach confirms a request whose time has passed.** The server sends 409 `SESSION_STARTED` with "Decline it so the client can pick a new time". The app shows "This session has already started, so it can no longer be changed here. Message your coach if you need help."
  - **Coach saves a type that is no longer there.** The server sends 404 `SESSION_TYPE_UNAVAILABLE`. The app shows "This appointment type is no longer offered. Go back to Calendar and choose another type." The coach navigator has no Calendar tab.
  - **Coach restores a type and hits B-634-5.** The server sends 409 `SESSION_STATE_CHANGED`. The app shows "This session changed a moment ago. Refresh Calendar".
- This breaks the copy rule that every failure says what happened and what to do next.
- Minimal fix: add an audience parameter (`calendarErrorMessage(err, op, 'coach')`) with a coach table for at least `SESSION_STARTED`, `SESSION_TYPE_UNAVAILABLE`, `SESSION_STATE_CHANGED`, `NOT_SESSION_PARTICIPANT` and `COACH_NOT_BOOKABLE`. Alternatively, show the server's coded `message` on coach screens. Add one test per coach screen.

### C (follow-up)
- **C-325-1 and C-325-2 (concur with Sol):** the support address is hardcoded in two places, and the move-success state should repeat that phone-calendar copies need a manual update.
- **C-325-3 (pair with C-634-3):** the inbox and agenda come from `useMyUpcomingSessions(100)` and are filtered on the device (`CoachBookingInboxScreen.tsx:97,113-123`). Cancelled and declined rows count toward the 100, so a busy coach can miss a pending request. Use a server status filter or pagination.
- **C-325-4:** moving a confirmed approval-type session gives no warning that the confirmed time is released now and that a decline leaves no session.
  - The book screen shows only "{coach} confirms each request." and "Move to this time" (`CalendarBookScreen.tsx:283,330`).
  - Add one line before submit (see C-634-4).
- **C-325-5:** on Android, the `expo-calendar` plugin (`app.json:128-136`) adds `READ_CALENDAR` and `WRITE_CALENDAR`. The feature only opens the OS editor intent, which needs neither permission. Add both to `android.blockedPermissions` to keep store disclosures minimal.
- **C-325-6:** phone-calendar notes hardcode "Personal-training session with {coach}" (`src/calendar/phoneCalendar.ts:43`). Use the type name or a neutral "Coaching session".

### Evidence
- Head re-read: `b0c02156` throughout. The PR is still a Draft, and the body lists unresolved prerequisites, including device acceptance.
- All three required checks (Typecheck/lint/test, Analyze js-ts, Analyze actions) are SUCCESS at this head.
- Merge-tree with main `e3986e89` is clean (tree `f25c9112`). The PR is BEHIND, so strict protection needs update-branch before merge.
- Locally, in a worktree at this head via heavy.sh: `env CI=true npx jest --runInBand` passed 10 suites / 145 tests (calendar screens, coach scheduling settings, scheduling API, phone calendar, scheduling errors, calendar time, push tap router, notification normalizer, tutorial calendar flag, plus my probe). `expo-calendar` is mocked virtually in `jest.setup.js`, and the lock resolves 56.0.10.
- Checked and not a finding:
  - The flag is off by default and gated in the navigator, tutorial and push table.
  - Push taps route `CalendarSession` and `CoachBookingInbox` through the allow-list, and the backend emitter sends `actionScreen`/`actionParams`.
  - The iOS write-only calendar string is set, and `remindersPermission: false`.
  - Android save results are never overclaimed.
  - The deprecated `client_timezone` and `notes` are stripped before strict DTOs.
  - The legacy `ClientBookingRequest` route has no navigate callers.
- No push, merge, dispatch or production action.

---
## backend#629 DELTA @ 089e8a7e90c924df438f8952c293ff0879e9f10c — APPROVE (A0 B0 C2 carried) — posted 2026-10-02 ~09:30 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/629#issuecomment-5956445797

AUDIT Claude Opus 5.5 — growth-project-backend#629 @ 089e8a7e90c924df438f8952c293ff0879e9f10c — VERDICT: APPROVE

Delta attestation for the merge-train update. My code verdict was APPROVE at `d134f012` ([comment 5955565209](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/629#issuecomment-5955565209)). The new head `089e8a7e` is a merge of main `e5d10bd8` (#604) into `d134f012`. **A0 / B0 / C2.** I carry C-629-3 and C-629-4 unchanged; both are optional.

### The merge is pure
- `git merge-tree --write-tree d134f012 e5d10bd8` gives `6db57c2701a1f9b8b098dd2c1efa65419802d91c`. That is exactly the tree of `089e8a7e`, so there is no manual resolution and no change hidden in the merge.
- The PR's own patch is unchanged. `diff(7a6cfd82..d134f012)` and `diff(e5d10bd8..089e8a7e)` have equal `git patch-id` values: stable `14d8f37f`, unstable `a5e1b8a1`, and `-U0` stable `b3ac791a`.
- Main's delta since the old base (#624 `e5a6044a`, #604 `e5d10bd8`) touches no file the PR touches.

### The seam
- #604 isolates named throttlers to their own routes. `packages.controller` has no `@Throttle` decorators, so its routes stay on the default bucket as before.
- The PR adds no `process.env` reads, so the #624 env-registration invariant is unaffected.

### Required checks at this exact head
- All 10 required checks are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity. Forward and reversible migrations are also SUCCESS.
- build-and-test failed on attempt 1, at `test/ci/release-evidence-gate.spec.ts:207` ("newest run wins"). That spec, `scripts/ci` and `.github` are byte-identical to main, and main's build-and-test is green.
  - The PR does not touch it: it passed 43/43 locally for me at this head, and 3/3 for the operator.
  - The operator's re-run, [attempt 2 (job 110919332733)](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37026913517/job/110919332733), passed: `PASS test/ci/release-evidence-gate.spec.ts`, 645 suites / 11,085 tests passed.

### Carried C (optional)
- **C-629-3:** `publish()` ignores `is_active`, while checkout refuses an inactive package.
- **C-629-4:** `PACKAGE_INVALID` returns developer validator text.

No push, merge, dispatch or production action by this auditor. The re-run was the operator's.

---
## backend#637 @ 6879d164ebf7e8d9dc3186ee1ad69b8d85902b6b — APPROVE (A0 B0 C2) — posted 2026-10-02 09:29 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5956720331

AUDIT Claude Opus 5.5 — growth-project-backend#637 @ 6879d164ebf7e8d9dc3186ee1ad69b8d85902b6b — VERDICT: APPROVE

Full T4 audit of the launch-flag desired-state manifest and the rewritten `fly-env-sync.yml` plan / apply / verify path. **A0 / B0 / C2.** Both C findings are optional. They are numbered from 11 so they cannot collide with the parallel audit.

### Required checks at this exact head
- 10 of 10 required checks are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity. actionlint is also green.
- `shellcheck (scripts/*.sh)` fails only on the existing SC2015 in `scripts/s10-core-diff-gate.sh`, which #639 fixes.
- [build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37032060595/job/110921077631) shows PASS for `test/ci/fly-env-sync-behavior`, `fly-env-manifest`, `fly-env-workflows`, `test/prod-readiness/env-registration` and `fly-env-classifier`: 644 suites / 11,119 tests passed.
- The PR is BEHIND main by #629 only. `git merge-tree --write-tree 6879d164 b9ee8e0a` is clean (tree `ebccaeea`), and the two share no files.

### What I verified (no defects)
- **Production writes are fenced.**
  - The app input must be `backend-spring-lake-3890`.
  - Apply needs the literal `confirm=SET`, and `deploy_staged=true` in plan mode is refused.
  - The job runs under `environment: production` and shares the `fly-secrets-<app>` concurrency group with every other Fly secrets workflow (db, launch-env, recent-auth, feature-flags, secrets-set).
  - The `FLY_API_TOKEN` env is present in all four flyctl steps.
- **No value leaks.**
  - flyctl stdout goes to `/dev/null`, and stderr is only `grep -q` classified and then deleted by EXIT traps.
  - The listing passes only through the jq name+status projection, so digests never reach a variable.
  - Secret values reach flyctl only as argv, through `${!name}`.
  - The in-machine program prints one marked JSON line of match / differs / absent / present words, using `timingSafeEqual` over sha256(salt‖0‖value) with a 32-byte random salt per run.
  - The ssh command and payload are base64 only, the same pattern as `fly-env-truth.yml`.
- **The planner is minimal and fails closed.**
  - Plan errors exit 1 before any of `set-flags.txt`, `set-secrets.txt`, `unset.txt` or `pending.txt` is written, so a failed plan can never be staged.
  - The stage step re-validates every line (`NAME=[a-z0-9]+` and `NAME`), and an empty source is refused again.
  - Verify is exact for presence and absence on all 53 names.
  - After deploy, every declared value must read `match` and every unset name `absent`.
- **I simulated #638's plan against today's production state** (OAuth names present, everything else absent), using the module itself:
  - The plan sets exactly one row (`FEATURE_AI_CONSENT_LEDGER_ENABLED=true`), with 52 kept, 0 unset and 0 errors.
  - verify(staged) passes with the flag pending.
  - verify(deployed) with `match` passes with no warnings, and a re-plan gives 0 changes and 0 pending (idempotent).
- **The closed value sets match the code.**
  - `BOOKING_REMINDERS_ENABLED` is read as `(?? 'on') !== 'off'` (`reminder.job.ts:60`), so the set is `on`/`off`.
  - The ledger, dunning-v2, community API and voice-entitlement flags are read as `=== 'true'`.
- **The manifest equals the old allowlist** (26 names) plus `MWB_AUTOSAVE_LOCK_TOKEN_SECRET`.
  - No other workflow writes a managed name. I diffed the name sets of fly-secrets-set, launch-env-set, recent-auth-set, db-secrets-set and feature-flags-set.
  - `OPERATOR_KEYS_NEEDED.md` lists no managed name either.
- **Prior #633 findings** B-633-1/2 and C-633-1/2/3 are closed, each with code plus a test, as the fix-round table says.

### C (optional)
- **C-637-11: a hand-set secret declared `unset` is removed without an error.**
  - Evidence: `scripts/fly-env/fly-env-manifest.js:579-582`.
  - Probe: the real manifest, Fly listing `METRICS_AUTH_TOKEN` as Deployed, and the machine reporting it present gives `errors 0, unset ['METRICS_AUTH_TOKEN']`. The plan exits 0, so the next apply for an unrelated flip stages its removal, and `deploy_staged` restarts without it. For a secret, an `unset` declaration usually means "not adopted yet", not "must be deleted".
  - The impact is bounded: the plan prints the row, and `/metrics` fails closed (503).
  - Minimal fix: for `secrets` only, report declared-`unset`-but-listed as a plan error ("Fly holds X, which the manifest does not adopt. Fix: declare it `github-secret` or `present` in a PR, or remove it by hand"). Keep the automatic unset for `flags`.
- **C-637-12: the flyctl version floats.**
  - Evidence: `.github/workflows/fly-env-sync.yml:159`. `setup-flyctl` is SHA-pinned but has no `with: version:`, so every run installs the latest flyctl.
  - `fly_list_state` depends on the `--json` shape. It fails closed with a fix line, but a flyctl release can stop a launch-window apply. This is a repo-wide pattern.
  - Minimal fix: `with: { version: <the version the behaviour spec models> }`.

No push, merge, dispatch or production action by this auditor.

---
## backend#638 @ c375b2acf76a609b281e102a22649ed754f088ac — APPROVE (A0 B0 C1) — posted 2026-10-02 09:29 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/638#issuecomment-5956720778

AUDIT Claude Opus 5.5 — growth-project-backend#638 @ c375b2acf76a609b281e102a22649ed754f088ac — VERDICT: APPROVE

This is a draft, stacked on #637 (base `agent/clinic/flags-manifest`). The diff is one line: `FEATURE_AI_CONSENT_LEDGER_ENABLED` changes from `unset` to `"true"`. **A0 / B0 / C1.** The C is optional and numbered from 11.

### Verified
- **The flip is valid.**
  - Running `node scripts/fly-env/fly-env-manifest.js validate` on this manifest prints `Desired state OK: 26 flags (1 declared with a value) … sha256 0ed9002f…3981`, which matches the PR body.
  - `true` is in the flag's closed set, and the code turns on only for `'true'` (`src/ai-consent/ai-consent.constants.ts:80`).
  - No precondition applies.
- **The plan behaves as the body says.** I simulated it with #637's module against today's production state:
  - exactly one row sets the flag, 52 are kept and there are 0 errors;
  - after stage, the flag verifies as pending;
  - after deploy with `match`, it verifies clean;
  - a re-plan gives 0 changes.
- **CI on this head** (base is not main): build-and-test is green and shows PASS for `fly-env-manifest`, `fly-env-sync-behavior` and `fly-env-workflows` (11,119 passed). rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit and Schema parity are green.
  - CodeQL JS/TS, Banned cast tokens, build-sbom and danger run only on PRs into main.
  - **Merge gate:** after #637 merges and this PR is retargeted or rebased, all 10 required checks must be green at that head. If the head changes, I will need only a delta attestation.

### C (optional)
- **C-638-11: the gate line does not say the flip alone does not bring client AI back.**
  - Evidence: `.github/fly-env-desired-state.json:69` (gate) and `docs/runbooks/launch-flags.md:80`.
  - With the ledger ON, every client-data AI call still needs a live box-2 grant. Mobile main has no grant path today (no `client-ai-v*`, no `grantRoman`). The first build that grants (mobile #310 and #326) sends `client-ai-v4`, which needs backend #635 deployed first. Main's ledger is still `client-ai-v3` ("kept for 180 days").
  - This is not a defect at flip time, because no shipped client can record a v3 grant. Without that note, though, an operator could expect Roman to come back in this window.
  - Minimal fix: append to the gate line: "Client AI stays refused until a mobile build that grants ships; that build needs #635 (client-ai-v4) deployed first."

No push, merge, dispatch or production action by this auditor.

---
## backend#639 @ 54a7aec8480316983a61af4beab978f6d563007d — APPROVE (A0 B0 C0) — posted 2026-10-02 09:29 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/639#issuecomment-5956721262

AUDIT Claude Opus 5.5 — growth-project-backend#639 @ 54a7aec8480316983a61af4beab978f6d563007d — VERDICT: APPROVE

This is a T4 CI-gate change: SC2015 in `scripts/s10-core-diff-gate.sh`. **A0 / B0 / C0.**

### The decisions are identical
- **The diff** (`scripts/s10-core-diff-gate.sh:58, 79, 136`) rewrites exactly the three `A && B || fail …` lists as `if ! { A && B; }; then fail …; fi`.
  - `fail` exits 1 in both forms, and only when `A && B` is false.
  - `set -e` is not triggered by a condition in either form.
  - Nothing else changes.
- **The frozen pre-fix fixture is genuine.** `test/ci/fixtures/s10-core-diff-gate.pre-sc2015.sh` is byte-identical to the gate on main at `b9ee8e0a`. The gate is unchanged from `e5d10bd8` to main, so the equivalence spec compares against the real current gate.
- **shellcheck:**
  - 0.11.0 reports 0 findings on the new gate locally.
  - CI's `shellcheck (scripts/*.sh)` (0.9.0, which reported the 3 × SC2015) is now **SUCCESS** at this head.
- **Local probe.** I ran both scripts with 0 args, 3 args and an unknown 40-hex B. Both printed the same `FAIL [args]` lines.
- **CI's run of the equivalence spec:** [build-and-test](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37032807952/job/110923569392) shows `PASS test/ci/s10-core-diff-gate-sc2015.spec.ts`. That is 17 tests:
  - 2 text checks;
  - 15 real-process cases, covering both clauses of each rewrite, including an annotated tag id and 100755 / 120000 modes.

### Required checks at this exact head
- 10 of 10 required checks are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity.
- actionlint and shellcheck are also green.
- The PR is BEHIND main by #629 only. `git merge-tree --write-tree 54a7aec8 b9ee8e0a` is clean (tree `0b6631d2`), and the two share no files.

No push, merge, dispatch or production action by this auditor.

---
## backend#635 @ e7f67576fddfe77418b51a653d3492fcb43fba5f — REQUEST CHANGES (A0 B1 C2) — posted 2026-10-02 09:32 PDT (supersedes the unposted 0a32b4fe draft)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5956763748

AUDIT Claude Opus 5.5 — growth-project-backend#635 @ e7f67576fddfe77418b51a653d3492fcb43fba5f — VERDICT: REQUEST CHANGES

Re-audit after fix round 1. **A0 / B1 / C2.** Sol's B-635-1 and C-635-1 are both closed. One B stays open.

That B is mine. I found it at `0a32b4fe` but held the draft verdict when the operator re-queued this PR, so this is the first time it appears on the thread. It is numbered after Sol's IDs.

### Delta since 0a32b4fe
- **Merge `b012ae99` (main `e5d10bd8`) is pure.** Its tree `415d23e4` equals `git merge-tree --write-tree 0a32b4fe e5d10bd8`.
- **The fix commits are `dba3af5f` and `e7f67576`.** They touch only `src/roman/*`, `test/roman/*` and the mwb-3 live-spec step in `ci.yml`.
- **Merging with main `b9ee8e0a` is clean** (tree `730655fe`).

### Prior findings
- **Sol B-635-1 (a tombstone holds the same-day key, so a re-open gets P2002 and a 500): CLOSED.**
  - In the code, `eraseSessionInTx` (`roman.service.ts:212`) moves the row to `day_key = erased:<id>` inside the same compare-and-set transaction. `day_key` is `String` (text), so the 43-character key fits.
  - `openOrResumeSession` (`:120-156`) retries once after erasing an unerased holder. A second P2002 resumes the racing live row, and anything left over is a coded 503 `ROMAN_ERROR_UNAVAILABLE` with a next step.
  - The cap now sums erased shells in the database (`aggregate` restricted to the `erased:` prefix), so unerased tombstones are not counted twice.
  - Tests: the unit fake now enforces the unique key over all rows and throws a real P2002, with a negative control. The real-Postgres `test/roman/roman-session-erase.live.spec.ts` is **8/8 PASS** in [mwb-3-live-tests](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37031101104/job/110917832761).
- **Sol C-635-1 (pre-upgrade tombstones still hold transcripts): CLOSED.**
  - `RomanErasureSweep` runs 60 s after boot and at 04:00 UTC, and the open path also erases them.
  - The sweep's per-row compare-and-set (`deleted_at not null AND day_key = <old>`) is idempotent across machines, never touches a live row, and is bounded at 100 × 50 rows.
  - `roman-erasure.sweep.spec.ts` passes in build-and-test. This also covers my held C on the same point.

### B
**B-635-2: the client still cannot delete any Roman chat except today's, so the v4 copy "kept until you delete them" is false for every older conversation.**
- Sessions are one per (user, surface, UTC day) (`prisma/schema.prisma:6355`). The only routes are POST `/roman/sessions` (opens or resumes **today's** session), GET/POST `/roman/sessions/:id/messages` and DELETE `/roman/sessions/:id` (`roman.controller.ts:61, 71, 90, 171`).
- No route lists a caller's sessions or deletes them all, so a client cannot obtain the id of yesterday's chat. Mobile `romanApi.ts` calls exactly these four routes.
- Every chat older than today is therefore kept until account deletion only. That contradicts the copy this PR ships (`CLIENT_AI_CONSENT_PARAGRAPH`) and the OR-110-1 ruling that a client chat delete erases.
- **Minimal fix:**
  - Add `DELETE /roman/sessions`, which erases all of the caller's sessions on both surfaces. Loop `eraseSessionInTx` with guard `{ deleted_at: null }` over the caller's live rows, scoped by `user_id`. Return 204, including when nothing is left.
  - Optionally add `GET /roman/sessions`, listing the caller's own live sessions (`id, surface, day_key, message_count, last_activity_at`) so the app can show and delete chats one at a time.
- **Tests:**
  - a prior-day session and today's session are both erased (messages gone, subject context null, `erased:` key);
  - another user's rows are untouched;
  - the daily cap is not reset;
  - a live-spec case on Postgres.

### C (optional)
- **C-635-2: three sites throw an uncoded `NotFoundException('Roman session not found')`** (`roman.service.ts:168, 200, 389`).
  - Fix: add `{ code: 'ROMAN_SESSION_NOT_FOUND', message: 'This conversation no longer exists. Open Roman again to start a new one.' }`.
  - Consider making a repeat DELETE a 204, since the erased state the user asked for already holds.
- **C-635-3: the erase depends on BYPASSRLS.** `RomanMessage` has no DELETE policy for non-service roles, and both tables are FORCE RLS.
  - Under an RLS-enforced role, `deleteMany` would remove 0 rows silently while the route still returns 204.
  - Fix: inside `eraseSessionInTx`, assert after the delete that `tx.romanMessage.count({ where: { session_id } }) === 0`, and throw a coded error otherwise.

### Required checks at this exact head
- 10 of 10 required checks are SUCCESS: build-and-test (11,087 passed, including `test/roman/*` and `roman-erasure.sweep.spec.ts`), rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity.
- shellcheck fails only on the existing SC2015, which #639 fixes.

### Release items outside this diff (operator routing; unchanged from my held draft)
1. **No mobile UI deletes a Roman chat.** `softDeleteRomanSession` is unused on mobile main, #310 and #326. The v4 copy needs a mobile delete-chat affordance on top of the B-635-2 route.
2. **"or delete your account" needs #608.** It is true only once #608's account-erasure manifest is deployed.
3. **Ship order: #635 before mobile #310 and #326.** Those builds send `client-ai-v4`, while main's ledger is `client-ai-v3`, so they would get 409 CONSENT_VERSION_MISMATCH until #635 deploys.
4. **Data export (main) omits Roman chats**, which are now kept indefinitely. This belongs to B-EXPORT.

No push, merge, dispatch or production action by this auditor.
