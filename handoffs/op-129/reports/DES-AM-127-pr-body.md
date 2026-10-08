Tier: T1
Why: Scoped notification-list presentation, neutral copy and recoverable loading feedback; existing APIs and destination routing remain unchanged.
T4 trigger scan: No auth, tenancy, credentials, privacy policy, money or destructive-data changes.
T3 trigger scan: No cross-repository contract, foundational primitive, navigator or persistent-state changes.
Bounded T1: YES; two screens, their tests and matching module READMEs; no dependencies or lockfile changes.
Canonical builder: GPT-6.1 Sol
Parent owner: agent 128 / DES-AM-127
Acceptance evidence: Rendered baseline: 2 center + 4 Home assertions fail; local center 33/33, Home 5/5 and doctrine/truthful-copy 30/30 pass. Final-head CI (typecheck/lint/full tests + both CodeQL analyses + CodeQL) is green at c26d932d7d7a9d767ff0266218c463d26b8c52ee; GitHub MERGEABLE.
Promotion triggers: Any change to backend notification contracts, role authorization, navigator structure or persisted notification ownership.

## What changes for coaches/clients
Notification rows sit between theme hairlines, not cream cards. Full titles and bodies remain visible; Inter titles are 15 pt, bodies and relative times 13 pt. Unread uses a small forest dot and medium weight. Mark-all stays a text link, with 44 pt targets. The center now has a real preferences link to the existing screen. Empty, loading and failed requests use factual copy. A failed next page stops loading and retains the existing rows.

## B/U list
- B1: A client whose Home nudge request fails sees “No notifications yet” rather than the failure, falsely reporting an empty inbox; now the error is explicit.
- B2: A coachless client or a Home-feed reader sees promises of coach notifications/reminders not supported by that screen's data; neutral refresh guidance replaces those claims.
- U1: Boxed unread rows, 11 pt timestamps and truncated notification text are replaced with unfilled readable full-content rows.
- U2: The preferences link documented for the center was missing; it now reaches the existing role-stack route.
- U3: Read informational rows were tappable with no effect; they remain visible as non-button text (rule 2: dead controls), while unread mark-read and all real target actions stay.
- U4: A failed next-page request left the footer spinning indefinitely; loading now ends with a notification-specific refresh instruction.

## Routes/actions before -> after
| Screen / label | Before | After |
| --- | --- | --- |
| Center / Go back | `navigation.goBack()` | Same; explicit 44 pt target |
| Center / coach, milestone, check-in, message, build-week, system, reminder, tip row | Unread: `markNotificationRead(id)`; if `actionScreen` exists, role-aware `routeInAppNotification(screen, params)` or original direct fallback | Same call and params, tested for all eight kinds |
| Center / read row with target | Routes without read mutation | Same; tested with role-aware router authoritative |
| Center / already-read row without target | No effect | Same content, non-button (rule 2) |
| Center / Mark all read | `markAllNotificationsRead()`; optimistic unread zero | Same; visible only for positive unread count |
| Center / Pull down | First-page refresh plus unread count | Same |
| Center / Scroll next page | `fetchNotifications(cursor, 25)` | Same; failed request now ends spinner |
| Center / Notification preferences | Existing destination but documented control absent | Text link → existing `NotificationPreferences` route |
| Home notifications / unread nudge | `useMarkNudgeRead().mutate(id)`; no destination in `ApiNudge` | Same |
| Home notifications / read nudge | No effect | Same full content, non-button (rule 2) |
| Home notifications / Mark all read | Mutation for each unread nudge | Same; hidden when none are unread |
| Home notifications / Pull down | `refetch()` | Same |

## Truthful sweep (before styling; references at base main)
| File:line | Original line | What is actually known | Replacement |
| --- | --- | --- | --- |
| `NotificationCenterScreen.tsx:255` | “You're all caught up.” | The returned list is empty; no completion/praise is needed | “No notifications.” |
| `NotificationCenterScreen.tsx:259` | “Notifications from your coach and the platform appear here.” | Relationship is not loaded by this screen | “Pull down to refresh.” |
| `NotificationsScreen.tsx:160` | “Loading…” / “No notifications yet” even on error | Query distinguishes loading, failed request and successful empty | “Loading notifications…” / specific failed-load instruction / “No notifications.” |
| `NotificationsScreen.tsx:163` | “Nudges from your coach and reminders will show up here.” | This screen reads coach nudges, not the global reminders endpoint | “Pull down to refresh.” |

Actual notification title/body, “From your coach” (coach-nudge API fallback), relative-time strings, unread singular/plural and “Mark all read” stay word for word. No new first-person copy, emojis, exclamation marks or generic errors.

## Documentation / design acceptance
- Both affected module READMEs updated.
- Theme-only colors; bone page remains; no cream row fills, shadows, photos, new motion or global banners.
- Cormorant title; Inter read/tap text; dot/weight unread; tabular times/counts.
- No tabs, navigators, production flags or backend changes.
- No manual device/render screenshot is claimed; tests verify rendered hierarchy, routes and handlers.

## Tests
- Source-only neutral-copy/full-content/hairline checks under the shared heavy lock: 5 failures on base main, 0 failures on the prepared patch (6 checks). This is not claimed as rendered behavioral evidence.
- Tests-first CI run `37681230119`: lint passed; typecheck rejected RNTL 14's removed `UNSAFE_getByType` API before tests could run. Replaced with actual `fireEvent` calls on list/refresh controls and scoped test IDs.
- Once dependencies became READY, rendered baseline at `49658628` failed 2 center empty/unfilled-row assertions and 4 Home readable/loading/empty/failure assertions, as expected.
- Local final targeted tests: center 33 passed; Home 5 passed; latest main's doctrine/truthful-copy/parity guard 30 passed. Targeted ESLint clean. One Jest file at a time, all through `ops/heavy.sh`.
- Interim full CI at `5013531e`: typecheck/lint passed; 680 suites / 8,955 tests passed, with only the two new refresh tests failing because the RN preset drops RefreshControl props. The tests now use a forwarding native-control stub; both files pass locally.
- Main incorporated without conflict for the overlapping client README; no upstream screen code was changed by this job.
- Final CI is green at `c26d932d7d7a9d767ff0266218c463d26b8c52ee`: [typecheck/lint/full tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685605870/job/113012502021), [actions analysis](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685605877/job/113012501845), [JavaScript/TypeScript analysis](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685605877/job/113012502116), and [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113014208085).
- Rendered tests cover all eight kinds' mark-read/destinations, role-aware routing priority, center back/preferences/mark-all/refresh/pagination, Home read/mark-all/refresh, full rows, neutral loading/empty/failure, and failed-page spinner recovery.
