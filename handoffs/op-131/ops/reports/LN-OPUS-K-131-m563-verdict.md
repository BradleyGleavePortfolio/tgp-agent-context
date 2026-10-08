AUDIT Claude Opus 5.5 (LN-OPUS-K-131) — growth-project-mobile#563 @ 3c10e1165cddf4700edcd6d9f4ae3af4b1604918 — VERDICT: APPROVE

Full review (T2 copy, 141 changed lines, CI 4/4 green at this head, mergeable clean, base = main 868a629c). Head re-checked on GitHub right before posting.

B: none.

U1 (from the code; not blocking): on Shortcuts, Start fast now blames the connection when the real cause is a fast that is already running.
- Where: src/screens/client/WidgetsScreen.tsx:78-79 replaces every failure with "The fast did not start. Check the connection and try again."
- Why it is wrong: Shortcuts offers Start fast without checking for a running fast. The backend refuses with 400 "A fast is already in progress" (backend main 652b07a8, src/fasting/fasting.service.ts:20; 409 at :29).
- What it replaces: main showed that 4xx reason through `errorMessage` (src/types/common.ts:58-61), which already maps 5xx, timeouts and network errors to fixed copy (:49-57). The test that pinned the 4xx reason (WidgetsScreen.test.tsx:72-76 on main) was rewritten to a 500 at :75.
- Smallest fix: in that catch, when `response.status` is 400 or 409, show "A fast is already running. Open Fasting to see it."; keep the connection line for every other failure; restore the 400 test case.
- How a client hits it: a client with a fast already running opens Profile > Shortcuts, taps Start fast and is told to check the connection and try again, which can never work.

Checked (from the code):
- Reminders row: backend `eat_enabled` is only declared, defaulted and persisted (src/notifications/notifications.dto.ts:35, notifications.service.ts:158, :249), and no sender reads it. On the phone, `client_bot` and `gp_notif_category_prefs` are read only by NotificationPreferencesScreen.tsx. So the removed row controlled nothing. Saved values are kept, and the four remaining switches PATCH the same fields as before (BACKEND_FIELD_MAP, :86-91).
- Profile "Shortcuts" (ProfileScreen.tsx:186-190) matches the destination's own title, "Shortcuts" in WidgetsScreen.tsx, and still navigates to `Widgets`. The doctrine and Profile parity tests are updated.
- Fasting Start and End alerts (FastingScreen.tsx:204, :229): handlers, API calls, alert scheduling and reload are unchanged. Start is offered only when no fast is active (:409-429).
- No first person, exclamation marks, emoji, new colours or layout changes. READMEs are updated.

C: at FastingScreen.tsx:204 and :229, a 5xx now says "Check the connection" where main said the service is temporarily unavailable (wording only). C (edge, deferred to 10k clients): a FastingScreen Start or End refused because another device already changed the fast.

agent 131
