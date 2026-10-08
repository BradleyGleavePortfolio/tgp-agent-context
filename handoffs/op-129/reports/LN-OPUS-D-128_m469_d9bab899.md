AUDIT Claude Opus 5.5 (LN-OPUS-D-128) — growth-project-mobile#469 @ d9bab8997210ef8555ae51cd52bedd42c43cb1f8 — VERDICT: APPROVE

Scope: full review (first Opus review of this PR). 399 changed lines (+247 / -152, 11 files), under the cap. Checks at head: Typecheck, lint, test / CodeQL / Analyze all SUCCESS.

**Bs: none.**

Read against the data behind each string (redo rule 1):
- Home progress line and hero CTA: "A workout is in progress." / "Resume workout" come from `loadActiveWorkoutSession(currentUser.id)` (per-user key); "{plan} is ready." / "Start {plan}" come from the first assignment with no `completed_at` in the existing `listMyAssignments` read; "Workout complete." comes from today's history. Every CTA still goes to `navigation.navigate('WorkoutTab')`, and WorkoutScreen shows the resume card through `WorkoutSyncCards`, so "Resume workout" leads somewhere real. The invented "One workout to go." / "A clean slate." lines are gone.
- Profile nudge: plan wording only when an assignment has a `workout_plan`; otherwise "to set daily targets". True in both states.
- Water: `waterOz` is the rounded oz value in the store that LogScreen's WaterTracker also shows, so the two screens now use the same unit.
- CoachIntroductionBanner: the coachless and 404 "Your coach will assign your first workout" lines are removed (both were false in those states). The linked-coach introduction and its dismiss stay.
- HolisticInsightsTile: renders only for `status === 'ok'` with insights; the unsupported empty and error copy is gone.
- PushPermissionCard: the coachless copy "reminders you set in the app" is true (fasting reminders are local notifications), and the enable/dismiss handlers are unchanged.
- romanVoice: "Everything is in order" removed; the coach greeting follows the device hour; the new first-open line is neutral. Roman's "I" is the allowed exception.
- Rules 2/4/6: the routes table matches the code; the header Message coach / bell, refresh, macro cells -> Log and profile -> EditProfile are unchanged and covered by HomeScreen.honestCopy127 parity tests. Rule 7: no new hex or legacy palette.

Cs (one line each):
- C: Home now reloads workout state on every focus and resets `workoutExists` to 'loading', so the CTA briefly shows a skeleton each time the client returns to Home; keep the last value during the refetch.
- C: With 0 meals, no workout and no plan, `progressLine` is '' and an empty Text still reserves marginBottom 56; render nothing.
- C: The tutorial "home-message-coach" target is not rendered for coachless clients. The flag is off by default, the route gate still clears through the header Message coach button, and takeMeThere exists, so there is no dead end.
- C: A stale (over 12 h) saved session still says "A workout is in progress."; WorkoutTab handles it. (edge, deferred to 10k clients)
- C: "Start {plan}" with a very long plan name in the eyebrow style may wrap; add numberOfLines={1}.
- C: The PR body's acceptance evidence still says "Final integration CI is running at 6bf76ba"; the head d9bab899 is green.
