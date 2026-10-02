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

---
## backend#607 @ 9ae4c22a1eae85b4e4354a6688fc71955def3acb — APPROVE (A0 B0 C1) — posted 2026-10-02 09:39 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/607#issuecomment-5956875415

AUDIT Claude Opus 5.5 — growth-project-backend#607 @ 9ae4c22a1eae85b4e4354a6688fc71955def3acb — VERDICT: APPROVE

T4 delta audit from my APPROVE at `245da2e7` ([comment 5936908717](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/607#issuecomment-5936908717)) to this head. **A0 / B0 / C1.** The C is optional and numbered after Sol's IDs.

I read every AUDIT comment on the thread, including Sol's RC at `b74384fb` ([5956402585](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/607#issuecomment-5956402585)).

### Integration commits
- **`f1eec9a0` (main `e5a6044a`) and `7556aa95` (main `e5d10bd8`) are pure.** Each tree equals `git merge-tree --write-tree` of its parents.
- **`dfacefb0` (main `b9ee8e0a`, #629) is pure.** Its tree `81fae5bd` equals the merge-tree of `b74384fb` and `b9ee8e0a`.
- **`fd526188` (main `4bcfb444`) has 5 resolved conflicts, all reviewed.**
  - `ci.yml`, `README.md`, `macros.service.ts` and `test/macros-current-self.spec.ts` keep the PR's additions.
  - `invite-codes.service.ts` takes main's #599 coded conditional attach.
  - My **C607-2 is CLOSED** at that seam. `15021bb5` proves that code entry by an already-attached client is refused with 409 `already_attached_to_different_coach` before any write. A stale `SubCoachAssignment` grants nothing, because rule (c) requires the membership head to equal the client's current head.
- **`d6ac47e8` renames the migration** to `20270212000000`, which sorts after main's latest (`20270205000000`).

### Prior findings
- **Sol A-607-4 (completion uses a retired membership to write the removed head's tenant): CLOSED.**
  - The code decides the tenant inside the completion transaction: `onboarding.service.ts:762-767` and `sub-coach-scope.service.ts:101` (`lockMembershipHeadCoachIdInTx`).
  - It works from the coach `User` row, already locked `FOR SHARE`, and locks the proving seat (or, failing that, the open delegation) `FOR SHARE`. Under READ COMMITTED that means:
    - a seat archival or a close of the last delegation that committed first is re-checked and drops out;
    - one that starts later waits for this commit.
  - Any difference from the pre-read rolls back through `TenancyChangedError` and re-runs. The rule is identical to main's `membershipHeadCoachIdFor` (role coach, `coach_id`, open seat, else open delegation), so the retry cannot loop on a definitional mismatch.
  - Tests:
    - 5 unit cases (seat archived, last delegation closed, membership added after a null read, and 2 controls);
    - 3 real-Postgres cases in `test/onboarding-tenancy-fence.live.spec.ts`, which PASS in [mwb-3-live-tests](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37034462722/job/110929102791) (60/60).
  - **Independent check:** I re-ran Sol's own reproduction (`ops/evidence/AUD-SOL-111/607-membership-race.spec.ts`) at this head.
    - Unchanged, its double rejects the new `FOR SHARE` statements ("unexpected raw SQL").
    - After I added only the double's handlers for those two statements, copied from the candidate spec, the AUD-SOL case **PASSES**: 1 passed, 57 skipped.
- **Sol C-607-3 (lock conflict surfaced as a 500): CLOSED.** `isLockConflict` treats P2034, and P2010 with 40P01 / 40001 / 55P03, as a retry. When retries are exhausted it returns 409 `completion_in_progress`, which has a next step. Covered by 3 tests.
- **Sol C-607-4: CLOSED.** The copy now reads "was flagged for extra care".
- **INT-607-1 (`e8feb0d2`).** The SQL helper `app.sub_coach_membership_head` mirrors main's membership rule. It is SECURITY DEFINER with a pinned search_path and EXECUTE granted to service_role only. The live RLS parity test runs in green rls-live-tests.
- **consult-consent-v3 (`b74384fb`).** I recomputed both digests from the source text: I transpiled #607's `consult-consent-copy.ts` and mobile #310 @ `f85ffd36` `copy.ts` and hashed the result.
  - The screen text is `79ceeb6b…31c9` (1,613 bytes), byte-identical on both sides.
  - The AI slice is `fbf82140…34f4`, which also equals #635 @ `e7f67576` `CLIENT_AI_CONSENT_*`.
  - `onFileConsentVersion` is used consistently by the save gate, GET `consent_recorded` and complete.

### C (optional)
- **C-607-5: an unprovable stored v3 record keeps its old acceptance time when a provable v3 is re-sent.**
  - Evidence: `onboarding.service.ts:502-506`. The re-stamp keeps `existing.disclaimer_accepted_at` whenever `disclaimer_version` already equals the new version.
  - So when a stored v3 P0 had a missing or foreign `text_sha256` and the client re-sends a provable v3 P0 alone, the server-stamped acceptance time stays the old, unproven one. The spec at `test/onboarding.service.spec.ts:1839` asserts only the version.
  - Only a hand-edited row can reach this, because saves reject a non-current P0.
  - Minimal fix: re-stamp when `onFileConsentVersion(existing) === null`, and assert the time in that spec.

### Executed evidence and checks
- **Local**, via `heavy.sh` with `prisma generate` and `CI=false npx jest --runInBand --forceExit`: `onboarding-consent-copy`, `onboarding.service`, `onboarding-consultation-answers`, `onboarding-audit-regressions`, `prod-readiness/env-registration` and `macros-current-self` gave **6 suites / 140 passed**.
- **CI at this exact head:** 10 of 10 required checks are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity. Forward and reversible migrations are SUCCESS. shellcheck fails only on the existing SC2015 (#639).

### Release
- #607 and mobile #310 ship together.
- #635 (client-ai-v4) must deploy before #310 ships.
- Production fixture seeding is still unauthorized.

No push, merge, dispatch or production action by this auditor.

---
## mobile#310 @ f85ffd360af137c5db668d8e5506d154e54f0898 — REQUEST CHANGES (A0 B1 C3) — posted 2026-10-02 09:39 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310#issuecomment-5956875944

AUDIT Claude Opus 5.5 — growth-project-mobile#310 @ f85ffd360af137c5db668d8e5506d154e54f0898 — VERDICT: REQUEST CHANGES

T4 delta audit from `e1dbe7f9`, which was my RC ([5946350633](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310#issuecomment-5946350633)) and Sol's RC ([5946400703](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310#issuecomment-5946400703)). The delta is merge `229beb3` (main `e3986e89`, #313) plus fix `f85ffd3`. **A0 / B1 / C3.** The B concurs with Sol's B-310-8. My two new Cs are numbered after Sol's IDs.

I read every AUDIT comment on the thread, including Sol's RC at this head ([5956403041](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310#issuecomment-5956403041)).

### Prior findings
- **B-310-6 (Opus and Sol; 180-day retention copy): CLOSED.**
  - Paragraph 4 now ends "…private from your coach and are kept until you delete them or delete your account.", with `client-ai-v4` and `consult-consent-v3`.
  - I recomputed the digests from the source text. `consentCopyText()` is 1,613 bytes with sha256 `79ceeb6b…31c9`, byte-identical to backend #607's screen text at `b74384fb` and `9ae4c22a`.
  - The AI slice is `fbf82140…34f4`, equal to #607's slice and to #635 @ `e7f67576` `CLIENT_AI_CONSENT_PARAGRAPH + "\n\n" + BOX_LABEL`.
  - `QuestionScreen` renders the same constants (`CONSENT_PARAGRAPHS`, both labels, `AI_CONSENT_PARAGRAPH`, `CONSENT_FOOTER`) and sends `text_sha256: CONSENT_COPY_SHA256` (`:481`).
- **Sol B-310-7 (a queued Settings write runs under the next account): CLOSED.**
  - `grantAiChoiceAs` and `withdrawAiChoiceAs` both go through `runAiLedgerWriteAs`, which checks identity at the write's turn. Allow checks again after its awaited marker clear.
  - The identity source is `readUserCacheSync()`, and `clearUserCache()` empties it on sign-out (`authActions.ts:372`).
  - Settings shows "You were signed out before this choice was saved, so nothing changed. Sign in and choose again."
- **C-310-10 (purge the draft on deletion): holds through the merge.** `229beb3` takes #313's flow (Trust Center navigates to the shared DeleteAccount screen) and re-adds `purgeConsultationDraft(currentUser.id)` only after `requestDeletion` succeeds.
- **C-310-11 (marker written twice): CLOSED for a single "no"**, through `markAiPendingOnce`. Its shared promise is what B-310-8 below exploits.

### B
**B-310-8 (concur with Sol): a superseded "yes" clears the newest "no"'s durable withdrawal marker.**
- Evidence: `ConsultationFlow.tsx:782-810`.
  1. A "no" starts the marker write (promise P).
  2. A "yes" nulls the stamp and schedules `P.then(() => clearAiWithdrawalPending(userId))` (`:804`).
  3. A newer "no" reuses the same unresolved P.
  4. When P resolves, it installs the stamp for the newest "no", and then the older "yes" deletes the marker.
- **Independent reproduction:** I ran Sol's rendered-flow test (`ops/evidence/AUD-SOL-111/310-marker-race.test.tsx`) unmodified at this head through `heavy.sh`. It **FAILS**: 1 failed, 17 skipped, durable marker `Received: null`.
- Finish purges the draft and the post-onboarding drain reads only the marker, so the newest "no" can be lost for good.
- **Minimal fix:**
  - Give each explicit choice a generation number.
  - The "yes" clear runs only while its generation is still the latest (check after P settles and right before `removeItem`).
  - A newer "no" either starts its own write after a pending clear or re-writes the marker once that clear lands.
  - Add delayed set/remove tests for no→yes→no, yes→no and finish-after-race, asserting the marker is non-null.

### C (optional)
- **C-310-12: the merge silently reverted this PR's own menu-name fix.**
  - `git show --remerge-diff 229beb3 -- src/screens/TrustCenterScreen.tsx` hunk `@@ -201` changes the auto-merged "Open Privacy in Settings" (from `00cfb6c`) back to "Open **Data & Privacy** in Settings" (`TrustCenterScreen.tsx:198`). This is outside the conflict hunks.
  - Client Settings no longer has a "Data & Privacy" section. It is now "Privacy", with the row "Trust & Privacy" (`SettingsScreen.tsx:423, 436`), so the export alert's next step names a menu that does not exist.
  - Fix: restore "Open Privacy in Settings".
- **C-310-13: the rendered P0 title and the hashed title are separate literals.** The screen renders `definitions.ts:103` `question: 'Before we start'`, while the digest uses `copy.ts:21` `CONSENT_TITLE`. Both read 'Before we start' today, but no test ties them together. Fix: `question: CONSENT_TITLE`.
- **Sol C-310-9: carried, unchanged.** This is the 3-second unknown-state fallback.

### Executed evidence and checks
- **Local**, via `heavy.sh` with `CI=true npx jest --runInBand`: `src/lib/consultation`, `src/screens/consultation` and `RomanAiConsentScreen` gave **9 suites / 221 passed**.
- **CI at this exact head:** Typecheck/lint/test, Analyze (js-ts) and Analyze (actions) are SUCCESS. The head tree `48f2ea67` equals `git merge-tree --write-tree` with main `e3986e89`, so the PR is up to date.

### Release (unchanged)
- Ships with backend #607 (consult-consent-v3).
- Backend #635 (client-ai-v4) must deploy first, because main's ledger is still `client-ai-v3` and a v4 grant would get 409 CONSENT_VERSION_MISMATCH.
- #608 must be deployed for "or delete your account" to be true.

No push, merge, dispatch or production action by this auditor.

---
## backend#608 DELTA @ 4e926b357c7c735f93edfebb7362a87b4b7babec — APPROVE (A0 B0 C5 carried) — posted 2026-10-02 09:41 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5956902466

AUDIT Claude Opus 5.5 — growth-project-backend#608 @ 4e926b357c7c735f93edfebb7362a87b4b7babec — VERDICT: APPROVE

T4 delta attestation from my APPROVE at `2759e1a0` ([comment 5946324411](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5946324411)). The delta is one commit, merge `4e926b35` of main `e5a6044a` (#624 S-ENVTRUTH). **A0 / B0 / C5, all carried and optional:** C-608-2, C-608-7, C-608-8, C-608-9, C-608-10.

### The merge, and what it adds beyond the automatic merge
- `git merge-tree --write-tree 2759e1a0 e5a6044a` gives `4883d731`, which merges cleanly with no conflicts. The head tree is `955a8adf`.
- `git show --remerge-diff 4e926b35` shows the only difference: **4 ENV_RULES entries plus a test fixture** (`src/common/env-validation.ts` +30, `test/env-validation.spec.ts` +4). The commit message declares this; it is what #624's registration invariant requires for #608's reads.
- I checked each registration against the code:
  - **`APPLE_SIGNIN_KEY_ID`, `APPLE_SIGNIN_PRIVATE_KEY`**, both `feature`: read at `apple-token-revocation.service.ts:70-71`. When unset, the result is `not_configured` and deletion never blocks. Feature tier only warns at boot (`env-validation.ts:2802`).
  - **`APPLE_SIGNIN_CLIENT_ID`**, `optional`: read at `:72`, falling back to `DEFAULT_APPLE_SIGNIN_CLIENT_ID = 'com.growthproject.app'` (`:42`), which is the registered default.
  - **`SUPABASE_BLOODWORK_BUCKET`**, `optional`: read at `bloodwork-storage-ref.ts:15`, falling back to `DEFAULT_BLOODWORK_BUCKET = 'bloodwork'` (`:11`), which is the registered default.
- **No other change:** no code, schema or migration change, and no PR-owned file is touched except these registrations.
- Main's delta now brings in #631's single support address, which Sol's B-636-2 needs on the stacked #636.

### Required checks at this exact head
- 10 of 10 required checks are SUCCESS: build-and-test (which includes #624's `env-registration` invariant over every `src/` read), rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity.
- Forward and reversible migrations are SUCCESS.
- shellcheck fails only on the existing SC2015, which #639 fixes.

### Against current main
- The PR is BEHIND by #604 (`e5d10bd8`) and #629 (`b9ee8e0a`).
- `git merge-tree --write-tree 4e926b35 b9ee8e0a` is clean (tree `02bc78fb`). `schema.prisma`, `auth.service.ts` and `env-validation.ts` are touched on both sides and auto-merge.
- Any update merge needs only a delta attestation.

### Release note (unchanged)
- Sol's B-608-12 (export archives on local `/tmp`) is still graded as a B-EXPORT release gate, closed by #636 once it is merged into this branch. My disposition from `2759e1a0` stands.
- #636 is being audited separately at `7883337f`.

No push, merge, dispatch or production action by this auditor.

---
## backend#636 @ 7883337f5cd7164f50cfc22bbb64c59d573efe12 — REQUEST CHANGES (A0 B1 C6) — posted 2026-10-02 09:56 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/636#issuecomment-5957192057

AUDIT Claude Opus 5.5 — growth-project-backend#636 @ 7883337f5cd7164f50cfc22bbb64c59d573efe12 — VERDICT: REQUEST CHANGES

This is my first T4 audit of #636. It covers the full stacked delta against #608's head `4e926b35` (21 files, +4124/−471), Sol's RC at `9b7a6a34` ([5946919448](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/636#issuecomment-5946919448)) and Sol's re-audit at this head ([5956985993](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/636#issuecomment-5956985993)). **A0 / B1 / C6.**
- The B concurs with Sol's B-636-6.
- I grade Sol's B-636-5 as C here, but it should be fixed in the same round.
- I concur with Sol's C-636-2.
- My new Cs are numbered C-636-3 to C-636-6.

I found these independently. This is one combined round, with no new IDs held back.

**Merge scope after the fix:** merging into #608's branch. The four main-only checks (CodeQL JS/TS, Banned cast tokens, build-sbom, danger) do not run for this base. They must be green at #608's combined head, which gets its own delta attestation.

### Integration commit
- **Merge `fb46142e` (9b7a6a34 + #608 `4e926b35`) is pure.** Its tree `cbdfa987` equals `git merge-tree --write-tree`.
- The base branch head equals #608's PR head `4e926b35`.

### Sol's findings, each checked in code and by test
- **A-636-1 (fail-open privacy verifier): CLOSED.**
  - **The fence.** The migration now creates a RESTRICTIVE `data_exports_api_roles_fence` `ON storage.objects FOR ALL TO PUBLIC USING / WITH CHECK (bucket_id IS DISTINCT FROM 'data-exports')` (`migration.sql:64-70`). Postgres ANDs it with every permissive policy, so `… OR true`, PUBLIC and custom-role policies can no longer expose the bucket to any role that is subject to RLS. service_role (BYPASSRLS) and the table owner are unaffected. Other buckets are unaffected because the predicate is true for them.
  - **The verifier.** `verify.sql` now proves catalog state instead of reading policy text. It raises unless all of these hold:
    - `public = false`, explicit;
    - `relrowsecurity` is on;
    - exactly one fence with permissive=false, cmd `*`, roles `{0}` and the canonical qual/with_check;
    - anon/authenticated are not superuser, not BYPASSRLS and not members of such a role or of the table owner;
    - no anon/auth-selectable view over `storage.objects` runs as an RLS-escaping owner unless it is `security_invoker`;
    - service_role bypasses RLS.
  - **The live test.** It runs in the required job: [rls-live-tests](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37031556806/job/110919366227), step "Run data-exports bucket fence + verifier live suite", gives `PASS test/rls/data-export-storage-bucket-rls.spec.ts`, **15/15**, on postgres:15. It refuses to skip under CI=true.
  - **Coverage.** The cases include Sol's two false-green states (an `OR true` policy and RLS disabled), a public bucket, BYPASSRLS roles, owner membership, a definer view (passes once `security_invoker`), service_role without BYPASSRLS, and down.sql refusing while archives exist.
  - The `ci.yml` change is one additive step in an existing job, disclosed as T4. `release-required-verifiers.txt` adds this verifier.
- **B-636-1 (a missing READY file traps the user behind the 24 h limit): CLOSED.**
  - `_storageFailure` → `_retireLostArchive` (`data-export.service.ts:765-797`) runs only on a confirmed `STORAGE_NOT_FOUND`. It marks exactly that READY row FAILED with no file, conditional on `status = READY AND file_url = <same>`.
  - `createDownloadLink` checks `stat()` first, so the app sees 410 `DATA_EXPORT_FILE_MISSING` and status reports `download_available: false`. A replacement request is then accepted because FAILED is not in the active set.
  - Transient failures answer 503 `DATA_EXPORT_STORAGE_UNAVAILABLE` and change nothing.
- **B-636-2 (deprecated support address): CLOSED.** `SUPPORT_EMAIL` is `Bradleyapple1031@gmail.com` (`trust-pages.html.ts:31`, via #608's main merge). The page test and `support-email.guard.spec.ts` pass.
- **B-636-3 (stale snapshot reported as FAILED): CLOSED.** After the conditional reap, `getLatestStatus` re-reads the row (`:359-372`), so a lost CAS reports READY and an erased row gives a coded 404. `requestExport` re-evaluates a READY row when its reap lost (`:277-284`).
- **B-636-4 (unconfirmed size accepted): CLOSED.**
  - `confirmedSize` requires `Number.isSafeInteger(size) && size >= 0` (`archive.store.ts:140-144`), and `put` requires it to equal `body.length`.
  - The bucket must answer `public === false` explicitly (`:305-329`).
  - `info()` in the pinned `@supabase/storage-js` 2.108.1 returns `Camelize<FileObjectV2>`, whose `size` is top-level, so the real client satisfies the check.
- **C-636-1 (no deadline, stream not cancelled): CLOSED.** `withDeadline` aborts the attempt's signal with retryable `STORAGE_TIMEOUT` and drops late results without an unhandled rejection. The read iterator's `finally` aborts the upstream fetch and cancels the reader when the download ends early.

### B (blocking)
- **B-636-6 (concur with Sol): the new download-link route (and request/status) refuses the `sub_coach` role.**
  - Evidence: `data-export.controller.ts:65, 88, 104` all use `@Roles('student', 'coach', 'owner')`.
  - `roleSatisfies` (`roles.guard.ts:66-75`) gives `sub_coach` no inheritance, and `Role` includes `sub_coach` (`schema.prisma:30-35`). An authenticated account with that role gets 403 on its own archive.
  - This contradicts this PR's contract ("`download-link` (JWT, any role)"). It also contradicts #608's B-608-7 ruling for deletion (`account-deletion.controller.ts:108-110`: every authenticated account may act on itself).
  - **Minimal fix:** add `'sub_coach'` to the three `@Roles` lists. That keeps the `roles-enforced` invariant and does not widen the global role hierarchy. Add a guard/metadata test for all four roles plus the existing foreign-user denial.

### Sol's newer findings, graded
- **Sol B-636-5 (a swallowed retirement write still answers "request a new export"): real; I grade it C.**
  - Evidence: `_retireLostArchive:792-797` logs and swallows the DB error, then `_storageFailure` returns 410 FILE_MISSING.
  - Recovery takes a double fault to block it. The follow-up refusal names its next step ("Download it from the Request my data screen"), and the next Download tap runs `stat()`, which retries the same conditional retirement. So the user is not stuck for 24 h, but the copy is wrong for one round trip.
  - Fix as Sol says: when retirement fails, return the coded, retryable 503 `DATA_EXPORT_STORAGE_UNAVAILABLE` with its try-again next step, not the replacement advice.
- **Sol C-636-2 (archive inventory versus the "complete copy" wording): concur, C.** It lands together with #635's Roman tables.

### New C (optional)
- **C-636-3: `Content-Length` is copied from the upstream header.**
  - Evidence: `archive.store.ts:418` and `data-export.service.ts:472`. Node's fetch sends `accept-encoding` and decodes transparently, but `headers.get('content-length')` reports the encoded length.
  - If Storage or its CDN ever answers compressed with a length header, the browser is told the wrong size.
  - Fix: send `ready.file_size_bytes` (already proven equal to the stored size at `put`), or omit the header when `content-encoding` is present.
- **C-636-4: the new Sentry `tags` and `extra` are dropped.** `sentry-config.ts:100-108` keeps only allowlisted tags and no extras, so the `code`, `stage` and `export_id` passed at `:807`, `:815` and so on never arrive; the event carries only the message and `request_id`. The logs have the detail, so this is diagnostic only. Fix: allowlist `code` and `stage` (both non-PII).
- **C-636-5: the download token can reach Sentry in trace spans.**
  - With `tracesSampleRate` 0.1, `@sentry/node` 10.60 incoming spans carry `http.url` and `http.target` with the query string (`server-subscription.js:196-198`).
  - `sentry-config.ts:98` states that beforeSend is not a span sanitizer, so about 10% of `GET /download?token=` transactions ship a live 5-minute bearer token. The existing `?token=` routes (contract PDF, legacy deletion confirm) share this.
  - Fix: add a `beforeSendTransaction` that strips query strings from those attributes, or sample the route at 0.
- **C-636-6: the production pre-check does not prove the deploy role can create the fence.** If hosted Supabase refuses `CREATE POLICY` on `storage.objects` for the `DIRECT_URL` role, `migrate deploy` records a failed migration and blocks every later release until `prisma migrate resolve`. Fix: add `BEGIN; <the DO block>; ROLLBACK;` to "Exact production step" 3.

### Also checked, no finding
- **Token handling.** HS256 with its own audience and type, required `sub/exp/iat/jti`, and lifetime ≤ 900 s. Unknown and foreign exports get the same 401, so there is no existence oracle.
- **Download checks.** A deleted owner is refused. The link is minted only for the caller's latest export.
- **Response hardening.** The success response sets `attachment`, `no-store`, `nosniff`, `no-referrer` and `noindex`. The HTML error page has no script (`default-src 'none'`), escapes all text, and always carries a reference, because the request-id middleware always sets it.
- **Account deletion.** It now collects `<id>.json` for every export, both the recorded and the planned key, and refuses foreign URLs. A purge failure rolls back the finalization (B-608-11).
- **Cleanup authority.** Drain, expiry and the orphan sweep all key off the bucket authority, so any machine can drain them.
- **Legacy route.** `POST /users/me/data-export` maps P2002 to 409 `DATA_EXPORT_IN_PROGRESS` with a next step.
- **ENV_RULES.** Registrations for `DATA_EXPORT_STORAGE`, `DATA_EXPORT_DOWNLOAD_LINK_TTL_SECONDS` and `DATA_EXPORT_STALE_RUN_MINUTES` match the code.

### Executed evidence and checks
- **Local**, via `heavy.sh` with `prisma generate` and `CI=false npx jest --runInBand --forceExit`: data-export-storage, data-export.service, data-export-archive-cleanup, data-export-bucket-verifier-wiring, account-deletion/optional-tables-export-fence, support-email.guard, prod-readiness/env-registration and env-validation gave **8 suites / 194 passed**.
- **CI at this exact head, SUCCESS:** build-and-test, rls-floor-guard, rls-live-tests (including the new step), mwb-3-live-tests, npm audit (high+critical, whole graph), Schema parity, Forward migrations, Reversible migrations.
- **Not run for this base:** CodeQL JS/TS, Banned cast tokens, build-sbom, danger. They are required at #608's composed head.

### Release
- After the B-636-6 fix (plus B-636-5), a delta re-audit at the new head.
- Then merge into #608's branch, then do the #608 combined-head delta with all 10 checks.
- Mobile #327 is the paired client.
- Sol's B-608-12 closes on #608 once this is merged in.

No push, merge, dispatch or production action by this auditor.

---
## backend#639 DELTA @ 2210c760a7892ceeccc232e6f867d1b387272c78 — APPROVE (A0 B0 C0) — posted 2026-10-02 09:58 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/639#issuecomment-5957233744

AUDIT Claude Opus 5.5 — growth-project-backend#639 @ 2210c760a7892ceeccc232e6f867d1b387272c78 — VERDICT: APPROVE

DELTA attestation from my APPROVE at `54a7aec8` ([comment 5956721262](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/639#issuecomment-5956721262)). The delta is one commit, update-branch merge `2210c760` (parents `54a7aec8` and main `97467678`, #632). **A0 / B0 / C0.**

### Purity proof
- **The merge is pure.** `git merge-tree --write-tree 54a7aec8 97467678` gives `4b729b89`, which equals `2210c760^{tree}`. There are no conflicts and no hand edits.
- **The PR's own patch is byte-identical.** `git diff e5d10bd8 54a7aec8 | git patch-id --stable` (old base) and `git diff 97467678 2210c760 | git patch-id --stable` (new base) are both `e07b7517…d008`. It is the same 3 files: `scripts/s10-core-diff-gate.sh` (+8/−3), the pre-SC2015 fixture and `test/ci/s10-core-diff-gate-sc2015.spec.ts`.

### The seam with main
- Main's delta since the old base is #629 and #632. Within `scripts/`, `test/ci/` and `.github/` it adds only `scripts/seed-coach-session-types.ts`.
- That file is TypeScript, so it does not touch the shellcheck glob (`scripts/*.sh`). Neither main commit changes the gate script, its spec or any workflow.
- **shellcheck (scripts/*.sh) is SUCCESS at this head.** SC2015 is closed on the composed tree.

### Required checks at this exact head
- **10 of 10 required checks are SUCCESS:** build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity.
- **Also SUCCESS:** shellcheck (scripts/*.sh), actionlint, danger dry-run and test-deploy-readiness.
- deploy-readiness-gate is skipped (it is not a PR gate).

No push, merge, dispatch or production action by this auditor.

---
## mobile#327 @ 7e643f9beb2fc1f8e8b279f7ee6c34c4dfeb6231 — APPROVE (A0 B0 C2) — posted 2026-10-02 10:02 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5957319224

AUDIT Claude Opus 5.5 — growth-project-mobile#327 @ 7e643f9beb2fc1f8e8b279f7ee6c34c4dfeb6231 — VERDICT: APPROVE

This is my first T4 audit of #327, covering all 9 files (+2124/−273). I read every AUDIT comment: Sol's RC at `227c5ad9` ([5947039516](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5947039516)) and Sol's re-audit at this head ([5956986730](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/327#issuecomment-5956986730)). **A0 / B0 / C2.**
- I grade Sol's remaining B-327-2 as C, for the reasons below. It should still go in the same fix round as backend #636's B-636-6.
- I have one new C, numbered after Sol's IDs.

### Sol's findings, each checked in code
- **B-327-1 (support address): CLOSED.** There is a single constant, `SUPPORT_EMAIL = "Bradleyapple1031@gmail.com"` (`src/constants/support.ts:12`). Tests pin both the FAILED and the unknown-error copy.
- **B-327-3 (2xx body validation): CLOSED.** `parseDownloadLink` (`dataExportApi.ts:168-210`) requires all of:
  - a non-empty `token`;
  - a path that starts with the relative download route, with a charset-limited remainder that decodes exactly to `token` (no extra parts);
  - a future `expires_at`.
  `parseDataExportRecord` refuses unknown or null statuses. `openInBrowser` re-checks the route prefix before `Linking.openURL(env.API_URL + path)`. The axios base has no `/v1`, so there is no double prefix.
- **B-327-4, B-327-5, B-327-6, C-327-1: CLOSED,** as Sol reports.
  - **B-327-4:** the reference shown is the server `request_id`, else the outbound X-Request-Id, else a fresh id.
  - **B-327-5:** the poll chain is single-flight and generation-fenced.
  - **B-327-6:** `safeReport` never forwards the raw Linking rejection.
  - **C-327-1:** a deadline timer is added.
- **Sol B-327-2 (identity change under a mounted screen): the remainder is real; I grade it C.**
  - Evidence: `DataExportScreen.tsx:355-362` only bumps the epoch, so a fenced `handleDownload` returns with `downloading: true` still set.
  - **Why C:** no in-app path reaches this state today.
    - `authEvents.emit('login')` is never called in `src/`.
    - The login screens' unnamed `emit()` fires from the unauthenticated tree.
    - Every sign-out emits `logout`, which this screen handles by resetting to loading (`:323-326`), and RootNavigator then unmounts the authenticated tree.
  - Fix it anyway in the same round, as Sol suggests: on an id change, reset to `{ phase: "loading" }` and call `reload.current?.()` under the new epoch. Test it on the same mounted screen.

### New C (optional)
- **C-327-2: the app-wide Sentry scrub rewrites the app's own objects in place.**
  - Evidence: `sentryScrub.ts:44-55` assigns `value[i] = …` and `record[key] = …` while it walks, and `sentry.ts:78` runs it from `beforeBreadcrumb`.
  - Console breadcrumbs in `@sentry/react-native` 7.11 (console capture is on by default) carry the live console arguments by reference (`@sentry/browser` `_getConsoleBreadcrumbHandler`: `data: { arguments: handlerData.args }`).
  - So any `console.*(…, obj)` has the JWT-shaped strings and `token=` / `code=` values inside `obj` replaced in the app's memory.
  - **Executed probe** (`auditOpus111ScrubInPlace.test.ts`, through `heavy.sh`): after `scrubEvent` of a console-shaped breadcrumb, the caller's `{ session: { access_token: <jwt> }, shareUrl: '…/join?code=ABC123' }` reads back as `access_token: "[redacted]"` and `…?code=[redacted]`.
  - **Impact today:** none of the 78 console calls in `src/` passes a live credential object; they pass errors or strings. But `console.log(session)`, or a logged invite link, would silently break the running app. The walk also has no breadth bound, for example an RN XHR on an axios error.
  - Minimal fix: scrub a copy. Rebuild arrays and objects while walking, and return the copy from `beforeBreadcrumb` and `beforeSend`. Add a test that the logged object is unchanged.

### Note, carried from Sol's backend C-636-2
`DataExportScreen.tsx:646-648` says the export is "a complete copy of all the personal data". The backend inventory does not yet include Roman chats. Align the copy when #635 lands.

### Executed evidence and checks
- **Local**, via `heavy.sh` with `CI=true npx jest --runInBand`: `DataExportScreen.test.tsx`, `dataExportApi.test.ts` and `sentryScrub.test.ts` gave **3 suites / 71 passed**. The scrub probe above is 1/1, demonstrating the in-place write.
- **CI at this exact head:** Typecheck/lint/test, Analyze (javascript-typescript) and Analyze (actions) are SUCCESS.
- The head tree `61829c1c` equals `git merge-tree --write-tree` with mobile main `e3986e89`, so the PR is up to date and strict protection is satisfied.

### Release
- Ships only after backend #608 with #636 is deployed (the `download-link` route, the bucket and the codes).
- Against today's main backend the link route is missing (route 404), and status returns `download_token: null` because archives are on the local disk (`origin/main` `data-export.service.ts:200-206`). There is no working download until then.

No push, merge, dispatch or production action by this auditor.

---
## backend#610 @ c710b0dc993f15d5129eb57d11296f397a045216 — REQUEST CHANGES (A0 B4 C0) — posted 2026-10-02 10:08 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5957432795

AUDIT Claude Opus 5.5 — growth-project-backend#610 @ c710b0dc993f15d5129eb57d11296f397a045216 — VERDICT: REQUEST CHANGES

Re-audit of round 2 (T4, paired with mobile #314) after my BLOCK at `9e4b3795` ([5946416979](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5946416979)).

**A0 / B4 / C0.**
- The A is closed, and so are four of my Bs.
- Three earlier Bs are only partly closed, and the relaxed message CHECK adds one new B.
- I concur with Sol's re-audit at this head ([5957253617](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5957253617)) on all four open items. I grade the wins item B, as I did before, not A.

### Closed, each checked in code
- **A-610-1 (voice key traversal): CLOSED.**
  - `voice-storage-key.ts`: `SIGNABLE_RE` allows `owner/[A-Za-z0-9-]{1,120}.<ext>` only, so there is no `.`, `/` or `%` in the name.
  - Owner binding uses `normalizesToItself` (the SDK URL normalization must round-trip), and minted keys carry an HMAC over `v1|owner|ts|nonce|ext`.
  - My `9e4b3795` dot-segment payload no longer matches the signable shape.
- **B-610-1, B-610-2, B-610-3: CLOSED,** as Sol reports.
  - B-610-1: membership-free safety.
  - B-610-2: the durable ban row, plus the bootstrap no longer re-admitting banned members.
  - B-610-3: removed-author delete.
- **C-610-4: CLOSED,** by a real executed PostgreSQL job (community suites 9/91, no skips).
- **Ordinary deletion now erases recordings** (the success path of my B-610-5). This covers author delete, hide/ban and account deletion: rows first, then the exact keys plus the owner folder.

### B — must fix
- **B-610-6 (Sol A-610-2): partly closed. I grade it B, same issue, one count.**
  - Evidence:
    - `migration.sql:145`: INSERT WITH CHECK binds `user_id` but not `coach_id`.
    - `:170-175`: the INSERT branch of the trigger checks only `hidden_at`.
    - `:189`: hide/unhide authority includes `OLD.coach_id = app.current_user_id()`.
  - So an author can insert with `coach_id = self` and later undo a real coach's hide. A forged foreign `coach_id` also lands the win in that coach's circle (`community_win_teammate_visible:106-129` checks only the viewer's coach).
  - Why B, as before: `app.current_user_id()` is set only by the backend, and the backend connects with BYPASSRLS, so no non-service caller reaches these policies today. The invariant at the data layer is still wrong.
  - Fix: in the INSERT WITH CHECK, require `coach_id IS NOT DISTINCT FROM (SELECT coach_id FROM "User" WHERE id = user_id)`, with owner and coach paths stated explicitly. Drop the `OLD.coach_id = current_user_id()` moderator arm, or bind it the same way. Add live negatives: self-as-coach INSERT, then a coach hide, then an author unhide; and a foreign-coach INSERT.
- **B-610-4: partly closed.**
  - Evidence:
    - `community-moderation.service.ts:378-393`: a later action on an already-resolved item re-resolves it and sets `stored = true`.
    - `community-moderation-notices.ts:65-72`: notices are de-duplicated by `moderationNoticeKey(moderationActionId)`, which is the item id, so Warn followed by Ban returns early.
  - The member keeps only the warning, while the coach is told "Member removed. They can read why in Community safety" (mobile reads `memberNotice.stored`).
  - Fix: key the notice by item plus action, or refuse a different action on a resolved item with a coded 409. Report `stored` truthfully. Test Warn then Ban.
- **B-610-5 (mine): partly closed. Failed erasure is never retried.**
  - Evidence: `community-voice.service.ts:628-630`, `community-moderation.service.ts:398-408` and `account-deletion.service.ts:886` only log the failure. Account finalization then excludes the user from later runs, so the recordings outlive the account.
  - This is the same durability bar #608 met for export archives.
  - Fix: before acknowledging, record retryable cleanup work for exact keys and owner folders, and retry it until removal is verified. Alternatively, return a coded incomplete result with a working retry. Test an outage followed by recovery.
- **B-610-7 (Sol, new): concur.**
  - Evidence: `migration.sql:221-234`. When `plan_context_type IS NULL`, `cohort_id IS NULL` and `plan_context_id IS NOT NULL`, the comment arm evaluates to UNKNOWN, and a CHECK accepts UNKNOWN.
  - This reopens the cohort-less plain row that the previous constraint refused. It was introduced by this PR.
  - Fix (one line): add `AND "plan_context_type" IS NOT NULL`, or wrap the arm in `( … ) IS TRUE`. Add a live negative for that shape.

### Merge, CI and release
- Both merges of main are pure: `87aeff89` and `8e0db445` have trees `3d8dec7f` and `bacaa6f7`, each equal to `git merge-tree --write-tree` of its parents. The head also merges cleanly with current main `97467678` (tree `a8e00b8b`).
- All 10 required checks are SUCCESS at this exact head. shellcheck SC2015 is pre-existing and fixed by #639.
- Migration `20270211000000` is unreleased (production last applied `20270205000000`), so editing it in place is acceptable.
- Voice launch remains gated on a native binary and real-device acceptance (mobile #314).

No push, merge, dispatch or production action by this auditor.

---
## mobile#314 @ 4192ba9dbff1dfc93b5ac43bc3de4b9f52747b38 — REQUEST CHANGES (A0 B2 C0) — posted 2026-10-02 10:10 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5957461031

AUDIT Claude Opus 5.5 — growth-project-mobile#314 @ 4192ba9dbff1dfc93b5ac43bc3de4b9f52747b38 — VERDICT: REQUEST CHANGES

Re-audit of the community safety fix round (T4, paired with backend #610). This verdict also covers the findings I drafted at `41d829d7` but did not post.

**A0 / B2 / C0.**
- Every earlier Opus finding is closed.
- Two new resource-ownership gaps in the native audio wiring remain. I concur with Sol's B-314-7 and B-314-8 from the re-audit at this head ([5957254228](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5957254228)).
- I reproduced B-314-8 with my own executed test.

### Earlier findings: all closed, checked in code
- **B-314-2 (no recorder or player): CLOSED.** `src/services/voiceAudio.ts` adds:
  - a real expo-audio recorder port and playback port;
  - lazy `require('expo-audio')` with a Sentry-reported fallback for binaries without the module.
  - `expo-audio ~56.0.12` is in package.json (installed 56.0.13), and the `app.json` plugin has the microphone string, with background recording and background playback off.
- **B-314-3 (rejected mailto): CLOSED.** `CommunitySafetyScreen.tsx:120-127`: a failed `openURL` moves to the `failed` state, which shows a copy-address recovery.
- **B-314-4 (Safety reachable only in the flag-gated tab): CLOSED.** `ClientNavigator.tsx:229,421` registers `CommunitySafety` in the More stack.
- **B-314-5 (stale signed URL): CLOSED.** `VoiceNotePlayer.tsx:74-97,117-120`: the loaded clip is keyed by its URL and released when the URL changes.
- **B-314-6 ("Warning sent."): CLOSED.**
  - `CoachCommunityModerationScreen.tsx:118-134`: the copy depends on `memberNotice.stored` and never claims delivery.
  - Its accuracy now depends on backend B-610-4 (Warn then Ban reports `stored: true`).
- **C-314-4 (retired `community.dm.blocked`): CLOSED.** The mapping is removed, and a contract test pins the removal.

### B — must fix
- **B-314-8 (Sol): concur, reproduced.**
  - Evidence: in `VoiceNotePlayer.tsx:112-140`, two `start()` calls during loading both see `loadedRef === null` with the same generation. Both load and both adopt; the second overwrites `loadedRef` without unloading the first.
  - The control stays enabled while loading (`:207-213`; `busy` is accessibility-only).
  - **My executed test** (`auditOpus111DoubleTap.test.tsx`, via `heavy.sh`, real component, injected port with held loads) gave `{"loads":2,"plays":[1,1],"unloads":[0,1]}`. Both clips play, and after unmount handle 0 is never released.
  - Minimal fix: keep a synchronous in-flight ref, so a second press while loading is ignored or joins the first load. On adoption, unload any handle that is not adopted. Test two taps before either load resolves, plus unmount while loading.
- **B-314-7 (Sol): concur.** The recorder start has no ownership fence and no failure recovery. There are three gaps:
  1. **No fence across unmount.**
     - `useVoiceRecorder.ts:116-125`: unmount cancels only if `startedAtRef` is set, but it is set after the awaited `recorder.start()` (`:175-179`).
     - So an unmount during start leaks a running ticker until the 5-minute cap.
     - expo-audio's `useAudioRecorder` releases the native object on unmount (`useReleasingSharedObject`, `expo-audio/build/ExpoAudio.js:225-229`), so the microphone itself is probably released. The JavaScript side is not.
  2. **Unhandled permission failure.** At `:162-166` both permission awaits are outside the try. A rejection escapes `void rec.start()`, the state stays idle, and the member is shown no message.
  3. **Recording audio mode not restored on failure.**
     - `voiceAudio.ts:202-205` switches to recording mode before `prepareToRecordAsync()` with no catch or finally.
     - `stop()` at `:217-218` skips `restorePlaybackMode()` if `recorder.stop()` throws.
     - On iOS, later voice notes then play from the earpiece.
  - Minimal fix:
    - Hold a mounted or generation ref across permission, mode and prepare, and cancel a late-finishing start.
    - Wrap the permission reads in the same try, ending in a coded error state with recovery copy.
    - Restore playback mode in a `finally` in both `start` and `stop`.
    - Tests: unmount during start, a rejected permission read, and a rejected prepare or stop restoring the mode.

### Executed evidence and checks
- **Local**, via `heavy.sh` with `CI=true npx jest --runInBand`: `VoiceNotePlayer`, `voiceAudio`, `CommunitySafetyScreen` and `communityErrorsContract` gave **29 passed**. The B-314-8 test fails as shown above (1 failed, by design).
- **CI at this exact head:** Typecheck/lint/test, Analyze (javascript-typescript) and Analyze (actions) are SUCCESS.
- The head contains mobile main `e3986e89`, and its tree `a746641c` equals the merge-tree with main.

### Release
- Shipping this needs a new native EAS binary, because expo-audio is a native module.
- The voice flag needs real iOS and Android acceptance before it is turned on: record, play, failure paths, and report or block.
- Backend #610's open B items (B-610-4/5/6/7) gate the pair.

No push, merge, dispatch or production action by this auditor.

---
## backend#628 @ 739e9a541df7401276ae769080e99547edf8bd8d — APPROVE (A0 B0 C0) — posted 2026-10-02 10:16 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5957537166

AUDIT Claude Opus 5.5 — growth-project-backend#628 @ 739e9a541df7401276ae769080e99547edf8bd8d — VERDICT: APPROVE

Re-audit of S-DUNNING fix round 3 (T4, money), paired with mobile #322 @ `0b4813dc`. I read my RC at `ba1d9480` ([5946454011](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5946454011)), Sol's RC at `ba1d9480` ([5946585040](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5946585040)) and the R3 fix table.

**A0 / B0 / C0.** Items under operator ruling OR-111-2 are not raised: the `charge.dispute.closed` subscription, lost disputes settled by support, the replayed confirm and the already-paid $0 line.

### My findings, each closed with code and a test
- **B-628-1 (2A ended a just-paid period): CLOSED.**
  - `runDunningCancel` (`client-billing.service.ts:1200-1267`) re-reads the open invoices under the lease. With none open and no intent, it calls `latestPeriodState` (`:1274-1301`: the subscription plus its latest invoice) before any void or `DELETE`.
  - A `paid` result goes to `keepPaidPeriod` (cancel at period end, nothing voided). A paid-meanwhile void refusal `continue`s, and the period is checked again before the cancel.
  - The reconciler resumes recorded intents through the same path (`:1517-1524`).
  - Tests: "paid before the list (Opus probe)", "paid between the list and the void" and the reconciler variant (`dunning-r3-money-truth-e2e.spec.ts:410-480`).
- **B-628-2 (partial success reported as "nothing was charged"): CLOSED.**
  - `payPlan` (`:509-672`) never throws for a Stripe outcome. Each invoice's integer-cent result is journaled.
  - An unexpected error after a pay attempt reports `uncertain` / `PAYMENT_RESULT_UNKNOWN`, never "nothing".
  - `paid_totals` and `due_totals` are kept per currency. Test: "two plans, the second list fails".
- **C-628-1: CLOSED.** `payOne` (`:731-800`) re-reads the invoice first on every error branch, so a paid invoice reports `paid` or `already_paid` before `requires_action`.
- **C-628-2: CLOSED.** `requirePublishableKey` (`:1898-1915`) returns 503 `PAYMENTS_NOT_CONFIGURED` before any Stripe call when the publishable key is missing or its mode differs from the secret key's.
- **C-628-3: CLOSED.**
  - Coded `INVALID_BILLING_REQUEST` (names the field) and `INVALID_PLAN_ID` (`client-billing.controller.ts:95-133,212`).
  - The handler bodies are typed as interfaces, so the global ValidationPipe passes them through and the route pipe with the coded factory validates them.
- **C-628-4: CLOSED.** `checkout-webhook-handler.service.ts:1155-1168` ignores live `customer.subscription.updated` events while a cancel intent or `client_canceled_at` is open. Test: "B-628-5: durable cancel intent, live updates ignored meanwhile".

### Sol's B-628-3 to B-628-10: spot-checked in code; each has a named test in the R3 specs
- **B-628-3:** the quote plus `approved_invoices`; `due > approved` or a currency mismatch gives `approval_required`, with nothing charged.
- **B-628-4:** `limit=100` with `has_more` paging, throwing on an incomplete list.
- **B-628-5:** a `ClientBillingOperation` intent is written before the first void.
- **B-628-6:** a `DunningNoticeDelivery` outbox in the step-claim transaction, with per-cycle keys and backoff.
- **B-628-7:** a shared `dunning-effective-access`.
- **B-628-8:** dispute cycles lock on schedule and are not settled by a card update.
- **B-628-9:** a `ClientBillingLease` CAS token is renewed before every Stripe call, and money writes run in a fenced transaction. A stale holder fails `renewLease` before calling Stripe, and Stripe's invoice state (paid once, void not payable) bounds the remaining window.
- **B-628-10:** stable phase codes are kept by the production filter.

### Seam, migration and CI
- **The merge of main is pure.** `7638f650` has tree `f32f78a9`, equal to `git merge-tree --write-tree ba1d9480 e5a6044a`. The fix commit `739e9a54` touches only the 20 dunning and checkout files.
- The head also merges cleanly with current main `97467678` (tree `2cd9a3ef`).
- **Migration `20270215000000` (unreleased):**
  - It adds three tables, each with ENABLE and FORCE RLS, a service-role policy, an anon deny and anon REVOKE.
  - The FKs cascade from `ClientPurchase` / `DunningState`.
  - `down.sql` drops them in reverse order. The Forward and Reversible migration checks are SUCCESS.
- **Local**, via `heavy.sh`: `prisma generate`, then `CI=true npx jest --runInBand` on the dunning-r2 e2e, dunning-r2 surfaces, dunning-r3 http-codes, dunning-r3 money-truth e2e, v2 service, lockout allow-list route table and checkout-webhook-handler suites gave **7 suites / 146 passed**.
- **All 10 required checks are SUCCESS at this exact head:** build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity.

### Release
- The flag stays OFF until the owner's Stripe checklist items are done, including subscribing the webhook to `charge.dispute.closed`.
- Mobile #322 must ship in the same window.

No push, merge, dispatch or production action by this auditor.

---
## mobile#322 @ 0b4813dcfc37fbbeebd16283b1a326e9b8caa734 — APPROVE (A0 B0 C1) — posted 2026-10-02 10:16 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322#issuecomment-5957546858

AUDIT Claude Opus 5.5 — growth-project-mobile#322 @ 0b4813dcfc37fbbeebd16283b1a326e9b8caa734 — VERDICT: APPROVE

Re-audit of S-DUNNING fix round 3 on the device (T4, money), paired with backend #628 @ `739e9a54` (APPROVE, [5957537166](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/628#issuecomment-5957537166)). I read my RC at `8991ddf3` ([5946462409](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322#issuecomment-5946462409)), Sol's RC ([5946584922](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/322#issuecomment-5946584922)) and the R3 table.

**A0 / B0 / C1.**

### My findings, each closed with code and a test
- **B-322-1 (partial payment copy): CLOSED.**
  - `cardUpdateOutcomeCopy` (`dunningErrorCopy.ts:420-500`) is built from `paid_totals` / `due_totals`. The `declined`, `failed`, `requires_action`, `approval_required` and `payment_uncertain` outcomes all lead with "{paid} went through" when something was paid.
  - The titles become "Part of your payment went through".
  - "nothing was charged" appears only when `paid` is empty.
- **B-322-2 (lost confirm answer): CLOSED.**
  - `dunningErrorCopy.ts:195-204`: a missing response at `confirm_card` or `cancel_plan` maps to `RESULT_NOT_CONFIRMED`: "we cannot tell yet whether the payment went through… Trying again never charges you twice."
  - "nothing was charged" is kept only for `update_card` (before confirm, `:206-213`).
  - The 503 and timeout mappings depend on the phase (`:365-371`, `:383-395`).
- **C-322-1: CLOSED.** `endPlanAlertBody` (`UpdateCardScreen.tsx:95-100,256`) says "access ends now" only while a payment is overdue, and covers a payment landing in the meantime.

### Sol's B-322-3 to B-322-6: spot-checked in code; each covered in `nativeCardUpdate.test.tsx`
- **B-322-3 and B-322-4:** native SDK calls run through `guarded()` (`updateCard.ts:187,279`) and report to Sentry with the reference (`:103-106,242-245,285`). The bank-confirmation recovery is kept.
- **B-322-5:** malformed successes throw shape errors instead of clearing the lockout.
- **B-322-6:** the pay button is built from the backend quote, and the confirm sends `approved_invoices`.

### C (optional)
- **C-322-2: the `processing` copy leaves out money already collected.**
  - Evidence: `dunningErrorCopy.ts:444-445` says only "your payment of {due} is processing".
  - Backend `composeCardResult` ranks `processing` above `paid` (`client-billing.service.ts:903`), so plan 1 paid plus plan 2 processing shows no "{paid} went through" and no access line. The copy is not false, just incomplete.
  - Fix: prefix `${paid ? ` ${paid} went through.` : ''}` as the other branches do, and add one copy test.

### Seam, checks and evidence
- **The merge of main `c6b0fe3` has a conflict resolution in `src/services/api.ts` only** (`git show --remerge-diff`). It keeps both sides' imports:
  - `extractRequestId` and `dunningLockoutStore` from this branch;
  - `Alert` from main #313.
  No other hand edit was made. The head contains mobile main `e3986e89`, and its tree `99e1efe9` equals the merge-tree.
- **CI at this exact head:** Typecheck/lint/test, Analyze (javascript-typescript) and Analyze (actions) are SUCCESS.
- **Local**, via `heavy.sh` with `CI=true npx jest --runInBand src/entitlements/dunning`: **2 suites / 64 passed**.
- **Device acceptance is still required:**
  - PaymentSheet with the backend's ephemeral key;
  - 3DS on a real card;
  - the `billing/update-card` universal link on iOS and Android.

No push, merge, dispatch or production action by this auditor.

---
## backend#637 @ e473428cc9e20ee36341ea4a8f483726edf76752 — APPROVE (A0 B0 C1) — posted 2026-10-02 10:22 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5957652425

AUDIT Claude Opus 5.5 — growth-project-backend#637 @ e473428cc9e20ee36341ea4a8f483726edf76752 — VERDICT: APPROVE

Fix round 1 (T4, CI gate) after my APPROVE at `6879d164` ([5956720331](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5956720331)) and Sol's RC ([5956710521](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5956710521)). I read the fix-round comment ([5957508827](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5957508827)).

**A0 / B0 / C1.** Sol's B-637-1 and B-637-2 are closed with code and tests. Sol's own two regressions pass unmodified at this head; one precondition is noted below. The operator accepted C-637-11 and C-637-12 as not required, so they are not counted. There is one new optional C.

### Merge-of-main purity
- `7d0b73dc` has tree `4101d004`, which equals `git merge-tree --write-tree 6879d164 97467678`, so there is no hand edit.
- Main's delta is #629 and #632, with no overlap with #637's files.
- The fix commit `e473428c` touches only #637's own 8 files: the workflow, runbook, manifest script and `.d.ts`, `env-validation.ts` (descriptive `unsetIs` only, never read at runtime) and three test files.

### Sol's findings, each checked
- **B-637-1 (apply-now completion failed open): CLOSED.**
  - In `fly-env-sync.yml`, a deploy runs when this run staged a change, when a name is pending, or when the pre-check was unproven. A name that is absent from the listing, or present but unchecked, goes into `unproven.txt` in the planner (`fly-env-manifest.js` plan).
  - The no-op path skips the deploy only after the fleet proves the manifest.
  - `fly_fleet_check` lists every machine, projects id and state through jq only, and runs the in-machine check on every started machine with `--machine <id>`.
  - `verify deployed` exits 0 when proven, 3 to retry, or 1 with reasons and a fix. The retry is bounded (6 × 20 s, clamped). "Verified … machine(s)" is printed only on proof.
  - **Sol's verbatim regressions**, appended to this head's harness (`ops/aud-opus-111/evidence_637_sol_verbatim.spec.ts`):
    - Regression 1 passes as written.
    - In regression 2 the precondition `machine === 'true'` no longer holds, because the fix now deploys the staged unset. Recorded instead of asserted, it shows `ok: false`, `secrets deploy` called, 6 fleet attempts and no "Verified" or "machine matches". That is fail-closed.
- **B-637-2 (universal unset kill): CLOSED.**
  - Every managed flag declares `unsetIs`. Exactly `SIGNUP_ROLE_CHOICE_ENABLED` and `FEATURE_COMMUNITY_SCHEMA` are `on`, and their kill is `set …=false (never unset)`.
  - The runbook table is generated by `kill-switches`, and `fly-env-manifest.spec.ts:100-185` fails on drift or on a missing or contradictory `unsetIs`.
  - I checked `unsetIs` against the runtime readers, not only the registry text:
    - `community-schema.feature.ts` is true unless `'false'`;
    - voice and entitlement are `=== 'true'` (`community-voice-flag.guard.ts:40-48`);
    - wearables ingest is `lower === 'true'`;
    - booking reminders are `on` only.

### C (optional)
- C-637-11 and C-637-12: the operator accepted both as not required. They are not counted.
- **C-637-13 (new): the kill table lists a restriction switch as a "kill".**
  - Evidence: `docs/runbooks/launch-flags.md:109`. Unsetting `FEATURE_COMMUNITY_VOICE_NOTES_REQUIRE_ENTITLEMENT` lifts the entitlement gate (`env-validation.ts:1960-1964`), so it widens access rather than containing an incident.
  - The containing kill for voice is `FEATURE_COMMUNITY_VOICE_NOTES`.
  - Minimal fix: mark that row "restriction: unsetting removes the gate; to stop voice, use FEATURE_COMMUNITY_VOICE_NOTES", or leave it out of the emergency table.

### Executed evidence and checks
- **Local**, via `heavy.sh`: `prisma generate`, then `npx jest --runInBand` on `fly-env-manifest`, `fly-env-sync-behavior`, `fly-env-workflows` and the Sol-regression copy. This gave **191 passed** across the three real suites and 1 verbatim-precondition failure, explained above. The re-run with the precondition recorded gave 2/2 passed.
- **All 10 required checks are SUCCESS at this exact head.** shellcheck SC2015 is pre-existing and fixed by #639. deploy-readiness-gate is skipped.
- Merging changes nothing in production: mutation runs only on `workflow_dispatch`.
- #638, which is stacked, needs a fresh delta against this head.

No push, merge, dispatch or production action by this auditor.

---
## backend#638 @ 9a4fa72167a5772d2fd7e0c7fe555ee6e4adfcbf — APPROVE (A0 B0 C0) — posted 2026-10-02 10:25 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/638#issuecomment-5957702041

AUDIT Claude Opus 5.5 — growth-project-backend#638 @ 9a4fa72167a5772d2fd7e0c7fe555ee6e4adfcbf — VERDICT: APPROVE

Re-audit after the restack onto #637's fix round. It follows my APPROVE at `c375b2ac` ([5956720778](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/638#issuecomment-5956720778)). **A0 / B0 / C0.**

### The restack is pure
- The PR is the single commit `9a4fa721`, with parent `e473428c`, the head of #637's fix round.
- The diff is one line in `.github/fly-env-desired-state.json`: `"FEATURE_AI_CONSENT_LEDGER_ENABLED": "unset"` becomes `"true"` (OR-110-4, the same window as #626).
- The patch-id is equal before and after:
  - `git diff 6879d164 c375b2ac | git patch-id --stable` = `fc7edcdb…`
  - `git diff e473428c 9a4fa721 | git patch-id --stable` = `fc7edcdb…`
- #637's branch has since moved to `1c28fb20` (the main merge, #639 only). `git merge-tree --write-tree` of `9a4fa721` with `1c28fb20`, and with main `e867fe62`, both give tree `9fd11bbf`: that branch plus exactly this one line, with no conflicts.

### The flip under #637's new fail-closed path
I simulated it with the module at `e473428c` (`scripts/fly-env/fly-env-manifest.js`) and this head's manifest, against today's production listing (the three Google OAuth names `present`, everything else absent) with a working in-machine check:
- `planChanges` sets exactly `FEATURE_AI_CONSENT_LEDGER_ENABLED=true`, with 52 kept, 0 unset, 0 pending, 0 unproven and 0 errors.
- `verifyState(deployed, final)` passes only when the started machine reports `match`. With the machine still `absent` it fails: "The running state is not proven … does not match the manifest for: FEATURE_AI_CONSENT_LEDGER_ENABLED (absent). Fix: …".
- A re-plan after the deploy has 0 changes (idempotent).
- The kill for this flag is `unsetIs: 'off'`, so it is `fly secrets unset … FEATURE_AI_CONSENT_LEDGER_ENABLED` with manifest line `"unset"`. That is correct for a flag read as `=== 'true'`.
- The flag's runtime reader and the #626 consent-ledger dependency are unchanged since my `c375b2ac` audit.

### Checks
- At this exact head, these are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph) and Schema parity.
- CodeQL JS/TS, Banned cast tokens, build-sbom and danger run only for PRs based on main, so they did not run on this stacked base.
- After #637 merges and this PR is retargeted to main, those 4 must be green at the final head before merge. A one-line manifest change does not touch what they scan.

### Release
- Merging changes nothing in production.
- The flip takes effect only through the `fly-env-sync` apply with `deploy_staged=true` in the #626 window. With #637's fix, that apply now passes only on fleet proof.

No push, merge, dispatch or production action by this auditor.

---
## backend#637 DELTA @ 1c28fb205c3e370ab787263e1f97c23a8ab2ac94 — APPROVE (A0 B0 C1 carried) — posted 2026-10-02 10:32 PDT
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5957805546

AUDIT Claude Opus 5.5 — growth-project-backend#637 @ 1c28fb205c3e370ab787263e1f97c23a8ab2ac94 — VERDICT: APPROVE

DELTA attestation after the operator's update-branch. It follows my APPROVE of fix round 1 at `e473428c` ([5957652425](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/637#issuecomment-5957652425)). **A0 / B0 / C1:** C-637-13 is carried, optional.

### The merge is pure
- `1c28fb20` is a merge of parents `e473428c` and main `e867fe62`.
- Its tree `d37c2a2d` equals `git merge-tree --write-tree e473428c e867fe62`, so there is no hand edit and no conflict resolution.
- #637's own patch-id is unchanged:
  - `git diff 97467678 e473428c | git patch-id --stable` = `567c8f49…`
  - `git diff e867fe62 1c28fb20 | git patch-id --stable` = `567c8f49…`
- Main's delta is #639 only: `scripts/s10-core-diff-gate.sh` plus its fixture and spec. None of #637's 10 files are touched.

### The seam
- #639 rewrites one gate script with identical decisions; I approved it at `2210c760`.
- #637 changes no file that script reads.
- shellcheck (scripts/*.sh) is now SUCCESS at this head, so the SC2015 failure is gone.

### Checks
At this exact head, all 10 required checks are SUCCESS: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical, whole graph), CodeQL JS/TS, Banned cast tokens, build-sbom, danger and Schema parity. actionlint and shellcheck are also green. deploy-readiness-gate is skipped, as designed.

No push, merge, dispatch or production action by this auditor.
