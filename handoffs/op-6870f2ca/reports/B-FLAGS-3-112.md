# B-FLAGS-3 (agent 112): two launch-manifest flips, backend

Base: main 3bd6215b (= production). Builder: Claude Opus 5.5 T4. Not merged, nothing dispatched, production not touched
(the only production contact was one public read: GET /api/auth/signup-policy).

## PR #642: GOOGLE_CLIENT_IDS -> github-secret
- Branch agent/clinic/flip-google-client-ids, head 859509843e787afab1d7aa172381478b93f3ad94. Ready for review, not a draft.
- Diff: one line, `"GOOGLE_CLIENT_IDS": "unset"` -> `"github-secret"`. The gates text is still true, so it is unchanged.
- Evidence:
  - The repo secret GOOGLE_CLIENT_IDS was updated 2026-10-01T17:38:44Z.
  - The live signup-policy at 19:28 UTC returned providers ["email","apple"] and google_signin_enabled:false. Apple being on proves Supabase is configured.
  - Backend: the button turns on via google-verifier.service.ts:48-62 and auth.service.ts:936/943/957. /auth/google uses Supabase getUser and does not depend on the audience.
  - Mobile: signupPolicy.ts:93-100 uses providers.includes('google'). LoginScreen.tsx:545 and CreateAccountScreen.tsx:1380 render the button when it is on.
  - After apply, installed builds show "Continue with Google" on Login and Create Account the next time either screen mounts. No app update is needed.
- Risk to flag: Google-only users cannot delete their account in the app until #608 deploys. Mobile sends provider 'google_session' (DeleteAccountScreen.tsx:290), but main's DTO accepts only google/apple (auth.dto.ts:501-505), so the call returns 400. Recommendation: deploy #608 before App Review.
- Tests (heavy.sh, --runInBand):
  - fly-env-manifest.spec.ts: 67/67.
  - The 3 fly-env specs: 136/136.
  - 6 auth/env specs: 196/196.
  - Validate prints sha256 51b2bd80...

## PR #643: BOOKING_REMINDERS_ENABLED -> on
- Branch agent/clinic/flip-booking-reminders, head f21b3c632a80037c852f91e5d41e33d31d99ef9e. Ready for review, not a draft.
- Diff: one line, `"BOOKING_REMINDERS_ENABLED": "unset"` -> `"on"` (the literal; the code checks === 'on' at reminder.job.ts:59/84).
- Safe with zero bookings: each tick is one findMany, the loop does not run and nothing is logged (reminder.job.ts:118-163).
- Idempotent: each recipient is claimed in NotificationDeliveryLog before the emit, unique on (session_id, user_id, kind) (schema.prisma:2104).
- No retry storm: delivery is at most once. Emit errors are only warned (reminder.job.ts:148-155; booking.emitter.ts:231-237), and cron errors are caught by @nestjs/schedule 6.1.3.
- No FCM or APNs call exists in this path at all: createNotification only inserts rows (notifications.service.ts:297-354).
- Open risks (pre-existing; turning reminders on makes users see them):
  - (1) Reminders are never pushed to a device. The 'push' channel row is not sent.
  - (2) Each reminder appears twice in the inbox and the unread count, because the list and count do not filter on channel (notifications.service.ts:360-393).
  - (3) The body shows the time as "HH:MM UTC".
  - Recommendation: apply as ruled under OR-110-5, plus a follow-up notification lane. Hold the apply only if the owner bar rejects (2) or (3).
- Tests (heavy.sh, --runInBand):
  - 3 fly-env specs + booking-reminder.job + env-registration: 181/181 (fly-env-manifest 67/67).
  - Validate prints sha256 e62824ed...

## CI (checked 2026-10-02 ~12:52 PDT)
- #642 @ 85950984: all 10 required checks pass, including build-and-test (7m14s) and Schema parity. mergeStateStatus CLEAN.
- #643 @ f21b3c63: all 10 required checks pass, including build-and-test (7m28s) and Schema parity. mergeStateStatus CLEAN.
- The only check that did not pass on either PR is the non-required deploy-readiness-gate, which was skipped.
- Status: STOPPED. Both PRs need independent audits, then the operator merges and runs Fly Env Sync plan -> apply.
- PR bodies: ops/reports/bflags3-pr-google-body.md, ops/reports/bflags3-pr-reminders-body.md. Jest logs: ops/reports/bflags3-jest-*.log.
- Worktrees wt/bflags3-google and wt/bflags3-reminders were removed after the push. The branches stay on origin.

---

## Phase 2: #643 notification follow-up (operator mail 12:48, Sol scope mail 13:21)

Read first: Opus #643 comment 5960179586 (B-643-1, C-643-2) and Sol comment 5960175016 (B-643-1 no device delivery, B-643-2 double inbox, C-643-1 UTC copy). #642: no change from me (it closes by ordering after #608).

### PR #647: `fix(notifications): booking times in the recipient's zone, one inbox row per event (B-643-1)`
- Branch `fix/notif-reminder-local-time-once`, head **3a93fbde**, base main 3bd6215b.
- Times are shown in the recipient's zone. The zone comes from the stored preference, then the recipient's own coach profile, then the booking coach. The zone is always named, and UTC is never shown. With no zone known, the copy names no clock time.
- One `inapp` row per recipient per event. The dedupe key is NotificationDeliveryLog (session, user, kind). Reschedule clears the claims so reminders re-arm once.
- Failing before: `booking-reminder-local-time.spec.ts` fails 5/5 on main's emitter (the "exactly once" case gives `[client-1, 2, 2]`; main's copy reads "... at 00:30 UTC"). booking-emitter fails 4 and scheduling reschedule fails 1 on main. Logs: `ops/bflags3/jest-prA-before.log`, `jest-prA-before2.log`.
- After: 5 suites, 50/50 (`ops/bflags3/jest-prA-1.log`). r75 OK.

### PR #648: `feat(notifications): deliver inbox notifications to devices via Expo push (C-643-2)`
- Branch `feat/notif-device-push`, head **81c52a12**. It is stacked on #647 (it contains 3a93fbde), so merge #647 first.
- Verified on main first: push rows are stored and never sent. Eight emitters were affected. Coach-alert sent its alert text to the lock screen. Welcome is #609, which is not on main.
- Added `PushDeliveryService` (Expo, at most once, never throws), rate limits (1 per kind per minute, 8 per 10 min per user), deferred receipts cron, and token clearing for DeviceNotRegistered (matching token only). For InvalidCredentials (Android with no FCM key), one `PUSH_PROVIDER_NOT_CONFIGURED` alert per hour, and the token is kept. Added `sendPush` with preference gates and quiet lock-screen copy. The emitters now write one `inapp` row plus a push. The inbox and unread count hide stored push twins of 17 kinds; push-only kinds stay visible.
- Tests use a mocked Expo client. Run 1 over 16 targeted specs: 155 passed in 13 suites, but the new push spec hit a mock typing compile error. After the fix, run 2 (push spec + booking-emitter): 26/26. Logs: `ops/bflags3/jest-prB-1.log`, `jest-prB-2.log`. r75 OK. Full tsc and suites are in CI.
- Open items (in the PR body): pushToUser and pushToCoach still use the old receipt and token handling. The first-payment twin is hidden but not pushed. workout and meal-plan kinds are suppressed by the digest preference default. Receipts are kept in memory only. Android stays dark until the FCM V1 key is uploaded.

PR bodies: `ops/reports/bflags3-pr-A-localtime-body.md`, `ops/reports/bflags3-pr-B-push-body.md`.

### CI (13:4x PDT)
- #647 head 3a93fbde38e04abacf0c556f1de64675507b8220: 14 pass, 1 skipping (deploy-readiness-gate, expected). All 10 required checks are green.
- #648 head 81c52a1292a620df7dc4389849372983005e4098: 14 pass, 1 skipping. All 10 required checks are green.
- Fix-round comment posted on #643: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5961042822

## HANDOFF FOR AGENT 113

**PRs (all open, none merged by me; I never dispatched or touched production):**

| PR | Title | Branch | Exact head | CI | State / next step |
|---|---|---|---|---|---|
| #642 | chore(flags): GOOGLE_CLIENT_IDS -> github-secret | agent/clinic/flip-google-client-ids | 859509843e787afab1d7aa172381478b93f3ad94 | 10/10 required green | Opus B-642-1 closes by ordering. Operator merges it after #608 (google_session re-auth) is live. No builder work left. |
| #643 | chore(flags): BOOKING_REMINDERS_ENABLED -> on | agent/clinic/flip-booking-reminders | f21b3c632a80037c852f91e5d41e33d31d99ef9e | 10/10 green | REQUEST CHANGES from Opus and Sol. Its findings are fixed by #647 and #648. Next: merge #647, then #648, deploy, re-audit, then merge and apply this flip. |
| #647 | fix(notifications): booking times in the recipient's zone, one inbox row per event (B-643-1) | fix/notif-reminder-local-time-once | 3a93fbde38e04abacf0c556f1de64675507b8220 | 14 pass / 1 skip | Needs an independent audit (T4). Merge first. |
| #648 | feat(notifications): deliver inbox notifications to devices via Expo push (C-643-2) | feat/notif-device-push | 81c52a1292a620df7dc4389849372983005e4098 | 14 pass / 1 skip | Stacked on #647 (it contains 3a93fbde). Needs an independent T4 audit. Merge after #647. Its diff then reduces to commit 81c52a12. |

**Findings:**
- Closed by code, pending audit: Opus B-643-1 and Sol C-643-1 (UTC times), fixed in #647. Sol B-643-2 (double inbox and unread), fixed in #647 and #648. Opus C-643-2 and Sol B-643-1 (no device push), fixed in #648.
- Open (documented in the #648 body; not started, each needs its own assignment):
  1. Move `pushToUser` and `pushToCoach` onto PushDeliveryService. They still poll receipts immediately, clear tokens without matching them, and log at error level per ticket.
  2. The first-payment push twin is hidden but not pushed. It is sent inside a transaction, so pushing it needs an after-commit hook.
  3. workout_assigned and meal_plan_assigned fall to the `digest` preference prefix, whose push default is false, so they are suppressed by default (pre-existing).
  4. Receipt queue is in memory only; persisting it would need a migration (next free prefix 20270224000000, ask the operator).
  5. Android needs the owner's FCM V1 key in Expo (`eas credentials`). Until then, look for the `PUSH_PROVIDER_NOT_CONFIGURED` log line, at most once an hour.
  6. The welcome message (#609, not on main) should call `NotificationsService.sendPush` when it lands.
  7. Mobile `client_timezone` is ignored by the backend; storing it needs a migration.

**NOT STARTED:** items 1 to 7 above. Nothing else was assigned to me.

**WIP branches:** none. All work is committed and pushed to the PR branches above.

**Worktrees:** `wt/bflags3-notif` was removed (its node_modules symlinks were unlinked first; deps were left untouched). No worktrees of mine remain.

**Evidence files:** `ops/bflags3/jest-prA-1.log`, `jest-prA-before.log`, `jest-prA-before2.log`, `jest-prB-1.log`, `jest-prB-2.log`. PR bodies: `ops/reports/bflags3-pr-A-localtime-body.md`, `bflags3-pr-B-push-body.md`, `bflags3-643-fixround-comment.md`.
