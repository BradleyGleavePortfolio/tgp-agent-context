Tier: T2
Why: bounded client booking/upcoming layout and state-driven copy, with unchanged scheduling API contracts and navigation.
T4 trigger scan: none; no auth, tenancy, credentials, money, destructive-data or permission boundary changed.
T3 trigger scan: none; no shared architecture, lifecycle or ownership decision.
Bounded T1: NO; booking copy and rendered action labels vary by current session state.
Canonical builder: GPT-6.1 Sol (DES-AG-127, agent 128)
Parent owner: operator agent 128
Acceptance evidence: failing-first render/state proofs; targeted calendar, upcoming parity, server-lockout and doctrine tests; CI at the PR head.
Promotion triggers: any required backend/permission/PII/money or scheduling lifecycle change goes back to the operator for re-grade.

## What changes for coaches/clients

Clients choose from a quiet grid of real open times. The selected slot is forest and the only primary booking action names that time. Confirmation keeps the actual date, time range, status and phone-calendar guidance without promising coach confirmation or a future call link.

Upcoming sessions use hairlines instead of cream boxes. The earliest session with a real video link carries the single forest Join action; every other Join, move and cancel remains immediately available as a quieter action. Loading, refresh and cancellation failure explain the current state.

## B / U list

- B: A client booking a session without a call link is promised the coach will add one before the session even though only the missing-link state is known.
- B: A client with an unconfirmed request is promised coach confirmation even though the coach may decline it.
- B: A client viewing a server-locked session is told a four-hour cancellation cutoff applies even though the current production backend locks started sessions.
- U: The booking action now names the selected time; slots remain at least 44 points tall.
- U: Cancellation failure is visible through the existing actionable scheduling error helper.
- U: Failed Join no longer assumes an emailed call link exists; all action colors are semantic and cancel is secondary.

## Routes/actions before -> after

| Screen / label before | Label after | Destination or effect before -> after | Render/parity evidence |
| --- | --- | --- | --- |
| Booking: day/time slots | Same date groups and slots | Select real server slot -> same | Selected forest, 44-point target, selected range/coach clock |
| Booking: Book / Request this time | Book / Request `<time>` | `useRequestSession` -> same payload and status | Auto-approve and request render tests |
| Booking: Move to this time | Move to `<time>` | `useRescheduleSession` -> same session/time payload | Existing move render test |
| Booking: Show later/earlier times | Same | Next/previous 14-day open-slot page -> same | Existing paging render tests |
| Booking: Refresh open times | Same | Refetch open slots, clear selection -> same | Auto-approve test exercises refresh |
| Booking: Message your coach | Same | Home stack Messages -> same | Existing fallback render test |
| Booking: See Calendar | Same | `CalendarHome` -> same | Existing fallback and welcome-request render tests |
| Booking: alternate appointment type | Same | Select available type -> same | Existing welcome-fallback render tests |
| Booking: Open the session | Same | `CalendarSession` with actual ID -> same | Existing booked-welcome render test |
| Booking: Add to my calendar | Add to phone calendar | OS calendar copy -> same | Auto-approve test exercises handler |
| Booking: Done | Same | `CalendarSession` with result ID -> same | Auto-approve test now asserts route/ID |
| Booking: Check Calendar before booking again | Same | `CalendarHome` -> same | Existing uncertain-outcome render state |
| Upcoming: Join session (provider) | Same | `Linking.openURL` for validated real video URL -> same | New render test opens link and exercises failure |
| Upcoming: Reschedule | Same | `RescheduleSheet` with session -> same | New render test opens sheet, verifies ID and closes |
| Upcoming: Cancel / Keep it / Cancel session | Same | Existing confirm alert -> same cancellation mutation | New render test asserts exact alert and mutation |
| Upcoming: Retry | Same | Refetch upcoming sessions -> same | New error-state render test |
| Both: native back | Same | Parent native-stack back -> unchanged; no navigator/header changes | No back handler or route removed |

No action or route removed. All existing facts remain visible without extra taps. All statuses, lockout flags, hook behavior, cancellation notification and API requests remain unchanged.

## Truthful sweep

| Original file:line (base) | Unsupported line / truth | Replacement |
| --- | --- | --- |
| CalendarBookScreen.tsx:69 | “Check Calendar to see when `<coach>` confirms.” A requested session may instead be declined. | “Check Calendar for `<coach>`'s response.” |
| CalendarBookScreen.tsx:73 | “`<coach>` will add the call link before it starts.” Only `meeting_link_status === pending` is known. | “Call link not added yet.” |
| CalendarBookScreen.tsx:306 | “`<coach>` will confirm it.” Existing welcome session is still requested. | “Waiting for `<coach>` to confirm.” |
| ClientUpcomingSessionsScreen.tsx:179 | “Copy the link from your email…” An emailed call link is not guaranteed. | Neutral Calendar/message instruction. |
| ClientUpcomingSessionsScreen.tsx:219-225,252 | Four-hour lockout label/hint/message is not what the current server flag means. | Neutral disabled-session copy; same server-authoritative flag. |
| ClientUpcomingSessionsScreen.tsx:75 | “Your coach will be notified.” Verified by cancellation lifecycle `emitCancelled` and notification emitter. | Stays word for word. |

Every remaining user-facing line was reviewed: actual titles, selected ranges, type durations/auto-approval settings, coach identity, welcome markers and requested/scheduled/pending-provider states are backed by the data; instructions and errors are neutral. The confirmed-session sentence uses the actual filtered list length.

Cancellation evidence: https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/0d179edb/src/scheduling/scheduling-session-lifecycle.service.ts#L613-L623 and https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/0d179edb/src/notifications/emitters/booking.emitter.ts#L310-L336 .

## Design / documentation / scope

Bone semantic canvas, hairlines, day overlines, Cormorant heading and real count sentence, Inter read/tap text at least 13 points, tabular time/date numerals, minimum 44-point actions, no added motion/photos/cards/chrome. Calendar uses the existing `calendarUi` primitives; that file belongs to DES-AF and is not edited here.

The assigned exact file list is only these two screens and tests. Their existing module headers are updated in place as matching module documentation (Quiet Luxury Doctrine section 8: README/module documentation). No shared README or other lane's screen is changed.

No new dependency, lockfile, API, navigator, flag, production or backend change.

## Tests

- Failing-first on unchanged owned screens: 3 upcoming parity/state failures and 4 booking truth/time-label/forest-selection failures.
- `calendarScreens.test.tsx`: 57 passed after DES-AF/main refresh; both lanes' coverage preserved.
- `ClientUpcomingSessionsScreen.parity.test.tsx`: 3 passed.
- `ClientUpcomingSessionsScreen.test.ts`: 6 passed.
- `quietLuxuryDoctrine.test.ts`: 30 passed after main refresh.
- Each targeted file ran individually through `/home/user/workspace/ops/heavy.sh`; no full local suite/typecheck/lint.
