Tier: T2
Why: Removes false call-link promises and gives booked sessions a calm, actionable hierarchy without cutting booking or session controls.
T4 trigger scan: none; no authentication, tenancy, consent, money, credentials or destructive data changes.
T3 trigger scan: none; no API contract, persistent data shape or dependencies changed.
Bounded T1: NO; next-session Join and empty-schedule booking use real state.
Canonical builder: GPT-6.1 Sol (DES-AF-127, agent 128)
Parent owner: TGP operator agent 128
Acceptance evidence: failing-first local baseline: 7 expected failures / 49 passes; completed calendar render/state suite: 56/56 passes; quiet-luxury doctrine: 30/30 passes after merging current main; all CI/CodeQL checks green and GitHub MERGEABLE at 9c8a52c76c26d459f62d3e61d2b28ed23062b273.
Promotion triggers: any access-control, money, backend cancellation semantics or persistent scheduling changes.

Proof sequence: one permitted tests-only opening push while shared mobile dependencies were unavailable, followed by a local failing-first baseline once dependencies became READY. Completed implementation checks were green at 0fc80353. Per operator instruction, current main was merged once more before READY; only upstream changes were added, the calendar delta remains 322 lines, and both targeted files passed again. The new Calendar README entry sits alphabetically between AI Guide and Logging; it is not appended to the shared README.

## What changes for coaches/clients

Calendar leads with the next session: local date and time, coach, length and status. Later sessions and appointment types use transparent hairline rows. A real call link offers Join/Call in the existing window; no upcoming session offers one forest booking action when the first coach has an appointment type available. Session detail keeps recap, calendar export, reschedule, cancel, rebooking and messages. All colours remain theme-driven, supporting text is Inter, hero times use tabular Cormorant, and controls remain 48 points with haptics but no animation.

## B/U list

- B: An ordinary client with a missing call link sees a promise that the coach will add it before the session, although that action has not occurred. Replace it with “Call link not added yet.”
- B: A client whose booking needs confirmation is promised that confirming supplies a call link, although manual links may still be absent. Use the same real missing-link state.
- U: A coachless empty schedule offers a coach message action that cannot open a coach conversation. Omit that state only.
- U: Booking cards compete with the next booked session. Put the next session first and give other paths quieter styling.

## Truthful sweep (baseline d0875d26)

| File:line | Original line | What is true | Replacement |
| --- | --- | --- | --- |
| CalendarHomeScreen.tsx:132 | “Your coach will add the call link before it starts.” | No usable link exists; no coach action is guaranteed. | “Call link not added yet.”, only when scheduled and no usable link exists. |
| CalendarSessionScreen.tsx:76 | “The call link appears here once \<coach\> confirms.” | Confirmation does not guarantee that a manual link exists. | Missing requested link: “Call link not added yet.”; real link: no missing-link note. |
| CalendarSessionScreen.tsx:81 | “\<coach\> will add the call link before the session. You do not need to do anything.” | No usable link exists; no coach action is guaranteed. | “Call link not added yet.” |
| CalendarSessionScreen.tsx:138 | “\<coach\> will be told.” | Current production backend cancellation calls the booking emitter for the other party, with the coach recipient for a client cancellation. | Retained word for word. Checked scheduling-session-lifecycle.service.ts:613-623 and notifications/emitters/booking.emitter.ts:310-336. |
| CalendarHomeScreen.tsx:288-289 | “Nothing booked yet. Pick an appointment type above, or message your coach.” / Message your coach | A client may have no coach; appointment options are now below. | Linked: “Nothing booked yet. Choose an appointment type below, or message your coach.”; unpaired: “No upcoming sessions.” and no dead coach-only action. |

Other factual status labels, appointment durations, approval rules, coach-time labels, welcome marker states and recaps remain unchanged. The instructional intro retains its exact linked-coach wording; unpaired clients see only “Times are shown in your time zone.” “Add to my calendar” becomes “Add to calendar” under the no-first-person copy rule.

## Routes/actions before -> after

| Screen / label | Before | After |
| --- | --- | --- |
| Home / appointment type | CalendarBook { coachId, sessionTypeId } | Same, all active types remain visible. |
| Home / Book a session | No separate primary shortcut | Adds the same CalendarBook target for the first available type of the first coach on an empty schedule. |
| Home / book welcome call | CalendarBook { coachId, welcome: true } | Same. |
| Home / booked welcome call | CalendarSession { sessionId } | Same. |
| Home / upcoming session | CalendarSession { sessionId } | Same; earliest live session is hero, every other row retained. |
| Home / Join or Call | Detail-screen call action only | Adds the same real link opener in the existing join window; detail action retained. |
| Home / past session | CalendarSession { sessionId } | Same. |
| Home / Show earlier sessions | Fetch next past-session page | Same. |
| Home / pull to refresh | Refresh coaches and upcoming sessions | Same. |
| Home / Refresh your coach | Refetch coaches | Same. |
| Home / Refresh appointment types | Refetch types | Same. |
| Home / Refresh sessions | Refetch upcoming sessions | Same. |
| Home / Refresh past sessions | Refetch past sessions | Same. |
| Home / Message your coach, no types | Home > Messages | Same. |
| Home / Message your coach, empty schedule | Home > Messages | Same when linked; removed only without a coach under rule 2 (dead). |
| Home / Contact support | Existing support email draft | Same. |
| Home / support Copy, Try again | Copy address / retry support draft | Same. |
| Session / See Calendar, incomplete route | CalendarHome | Same. |
| Session / Try again, failed read | Refetch session | Same. |
| Session / Join or Call | Open real video URL or dialer | Same link and window, with existing failure recovery. |
| Session / Add to my calendar | Device-calendar export | Same handler; label “Add to calendar”. |
| Session / Reschedule | CalendarBook { coachId, sessionTypeId, rescheduleSessionId } | Same. |
| Session / Cancel session | Confirm, then cancel mutation | Same; notification claim verified against backend. |
| Session / Keep it | Dismiss cancel confirmation | Same. |
| Session / Pick another time, expired | CalendarBook { coachId, sessionTypeId } | Same. |
| Session / Message your coach | Home > Messages | Same. |

The render tests cover both touched screens, real link opening, all existing route/handler states, welcome states, support fallback, paging, refresh recovery, cancellation, exported calendar copies, recap, expired rebooking, linked and unpaired empty schedules, and hero state-driven wording. No tab or navigator changes. Shared calendar primitives also update booking/upcoming presentation without changing their handlers. Matching client README updated.
