# B-JOURNEY-3 — agent 112 report (stopped cleanly per the owner's 13:34 PDT order)

Lane: backend #609 and mobile #312 fix round. The PUSH HOLD was lifted at 13:21 (AUD-SOL-5 posted). The clean-stop order came while the round was still in progress, so **nothing was pushed to either PR branch**. All work is on two WIP branches.

## Audits being folded in
- #609 @ 40616dcf: Opus comment 5960037347 (A0/B2/C3) and Sol AUD-SOL-5 comment 5960820683 (REQUEST CHANGES, 0/4/4). `rls-live-tests` is red at this head (run 37043051156); the other 9/10 required checks are green.
- #312 @ 90e78abe: Opus comment 5960043718 (A0/B1/C2) and Sol comment 5960816016 (REQUEST CHANGES, 0/2/2). All 3 required checks are green at this head.
- Sol's evidence: /home/user/workspace/ops/evidence/AUD-SOL-5-112/. This includes the probe spec `aud-sol5-engagement.spec.ts` and `jest609.config.cjs`.

## Mobile #312: WIP branch `wip/B-JOURNEY-3-312-fixround` @ 25b111d5
The base is merge commit 5c8a4a1, which merges mobile main 2c17c241 into the PR head 90e78abe. The merge was clean. package.json and the lockfile are unchanged, so there is **no DEP CHANGE**.

| Finding | Change | Test | State |
|---|---|---|---|
| B-312-1 | New `src/screens/settings/notificationPreferenceErrors.ts`. It chooses the message by status: no response (axios) = check the connection; 401 = signed out, sign in again (the API client's refresh-failure sign-out has already run); 429 = wait a minute; anything else (including errors that are not HTTP) = try again, plus the support address, a short reference and `reportUnexpected('PATCH /notifications/preferences', {status, code, requestId})`. The message is an inline notice (`accessibilityRole="alert"`) that names the setting. The generic Alert is removed. The pre-existing `as unknown as` analytics cast is replaced with a spread. | One test per branch, plus screen tests. All new screen tests failed before the fix (10 failed out of 27). | DONE (passing locally) |
| C-312-2 | `categoriesForRole`: the workout row is hidden when the role is known and is not `student`. | Tests for coach, owner, sub_coach, student and unknown role | DONE |
| C-312-3 | `installTimezoneResyncOnForeground` in timezoneSync.ts, wired in App.tsx. It resyncs when the AppState goes from not-active to active (de-duplicated by the stamp) and retries on the next resume. | 3 tests (failing before) | DONE |
| B-312-2 | A per-category in-flight guard (ref + disabled switch), a per-category rollback built from a `prefsRef`, and a server reconcile (`serverValueOf`) after offline or unexpected failures. | The ambiguous-failure reconcile test and the `serverValueOf` test pass. **The two deferred-request race tests (off-then-on, and cross-category rollback) time out** in the RNTL 14 harness: `fireEvent` adopts the handler's pending promise. Sol hit the same problem. | WIP: the harness needs rework |

The last full run before the B-312-2 change was 27/27 passing (`/tmp/bj3_mob1.log`). At the WIP head, 2 tests time out, and they also poison the tests that run after them. Lint and prettier were **not** run.

## Backend #609: WIP branch `wip/B-JOURNEY-3-609-fixround` @ 11fd4e10
The base is merge commit 35d6d133, which merges backend main f04289f9 (#607) into the PR head 40616dcf. The conflicts were in ci.yml, schema.prisma and app.module.ts. All were additive and kept both sides. The diff vs main is 33 files.

**Nothing on this branch has been run locally**: deps were not linked and prisma generate was not run.
- B-609-1: `sqlStateOf()` in `test/rls/clinic-engagement-rls.spec.ts`. It maps Prisma P2002 to 23505 and reads P2010 `meta.code`. It does no message parsing.
- B-609-2: both switches get ENV_RULES `values` + `unsetIs: 'on'`. Each gets a `.github/fly-env-desired-state.json` entry (value "unset" + gates text; the manifest validator CLI passed with 28 flags) and a launch-flags kill-table row. `test/ci/fly-env-manifest.spec.ts` is updated. The manifest JSON and runbook changes are T4-adjacent and need a note in the PR body.
- C-609-3: `schedule()` filters `coach_id: { not: null }`, with a starvation regression test.

## NOT STARTED
- B-609-3: a live stale lease-holder can send a second welcome. The fix needs job-id idempotency at the coach-message persistence boundary plus fencing, and a live expired-lease overlap test.
- B-609-4: the workout reminder does not recheck deletion or role at send time, and it races the erasure path.
- C-609-6: channel independence for push opt-out vs in-app.
- C-609-5 / #312 retitles. Proposed #609 title: `feat(engagement): C05 items 6-7 coach welcome message at complete +13 min, workout reminders on plan days`. Proposed #312 title: `feat(notifications): C05 item 7 workout reminders toggle in Settings > Notifications and device timezone sync`.
- PR body tier headers, the Fix round tables and the fix-round comments.
- C-609-4 (reminder tick scale) is proposed as deferred: it is fine at clinic scale.

## Release items (unchanged)
- The coach-message push is not delivered to Expo; that needs its own lane.
- #608 is adding CoachWelcomeMessageJob, CoachWelcomeMessageSetting and WorkoutReminderDelivery to the erasure manifest. Keep these names.
- Order: #607, then #609, then deploy, then mobile #312.

## HANDOFF FOR AGENT 113
- **PRs:**
  - Backend #609 head **40616dcf**. CI: `rls-live-tests` is red; that is B-609-1, which is fixed on the WIP branch but not yet on the PR.
  - Mobile #312 head **90e78abe**. CI is green at that head.
  - Neither PR was changed by this round.
- **Closed:** none on the PRs. These are done on WIP only: B-609-1, B-609-2, C-609-3 and B-312-1, C-312-2, C-312-3.
- **Open:** B-609-3, B-609-4, C-609-6 (not started) and B-312-2 (tests WIP).
- **WIP branches:**
  - `wip/B-JOURNEY-3-312-fixround` @ 25b111d5 (base 5c8a4a1).
  - `wip/B-JOURNEY-3-609-fixround` @ 11fd4e10 (base 35d6d133).
- **Next steps:**
  1. Mobile: check out the WIP branch and link deps. Rework the two B-312-2 race tests: don't `await fireEvent` on a held save; for example, drive the handler through a mock implementation that flips the second switch from inside the pending PATCH. Then run the 2 targeted specs plus eslint/prettier on the 6 files, push to `agent/clinic/engagement-mobile/5d2e8b17`, retitle, update the body and Fix round table, and post a fix-round comment.
  2. Backend: link deps, run `heavy.sh npx prisma generate`, then run `test/ci/fly-env-manifest.spec.ts`, `test/engagement/*.spec.ts` and the env hygiene specs. Implement B-609-3 and B-609-4 (and C-609-6 if cheap) using Sol's probe spec as the failing-before tests. Then push to `agent/clinic/engagement-be/3f9c21ab`, retitle, update the body, and watch for 10/10 including rls-live-tests.
- **Worktrees:** wt/bj3-609 and wt/bj3-312 are removed. deps/ was not touched. Disk was at 71%.
