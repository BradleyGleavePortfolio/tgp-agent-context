Tier: T1
Why: Bounded client presentation and truthful-copy pass; existing workout-save payload, permissions, navigation and backend contracts are unchanged.
T4 trigger scan: No auth, tenancy, PII boundary, money, credentials or destructive-data change.
T3 trigger scan: No platform, architecture, migration or cross-service contract change.
Bounded T1: Two assigned client screens, one render/parity test file and their README; below 350 changed lines.
Canonical builder: DES-AE-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: New render/parity suite passes all 11 cases locally; the same suite against unchanged main screens fails 7 cases (including false empty copy, missing prescribed rows and old history title), while 4 behavior-parity cases pass. Existing workoutSession124 passes all 11 cases and quietLuxuryDoctrine passes locally. Both workout suites were rerun after the latest main/README refresh through heavy.sh; full typecheck/lint/test and all CodeQL checks are green at ea0c96ea423cd3ea07d964ce177cb2387001f8fd. GitHub confirms clean/no conflict.
Promotion triggers: Any needed permission, save-contract, data-loss, money or navigation-contract change returns to the operator.

## What changes for coaches/clients
Clients see real scheduled dates above serif workout names, hairline exercise rows with resolved catalog names and coach-approved prescribed set counts, and no assumed coach relationship in the empty state. Completed workouts remain readable rather than faded.

History editing keeps the same saved weights, reps, notes, save and cancel behavior, with one serif workout title, semantic-theme hairline inputs and a 44-point forest save control. No dependency or lockfile change.

## B/U list
- B1: A normal client without a coach opens the empty assignment list and is told “Your coach has not assigned a workout yet,” even though the response establishes no coach relationship. Fixed with neutral copy.
- U1: Incomplete past assignments were labelled “Upcoming.” They now appear under “To complete,” based on their actual completion state.
- U2: Cream-filled, 12-point-rounded assignment cards, faded completed rows and the sans history title conflicted with the calm hierarchy. Hairlines, readable completed rows and a serif title replace that chrome.

## Truthful sweep
| Before file:line | Claim | What is actually known | After |
| --- | --- | --- | --- |
| `ClientWorkoutViewerScreen.tsx:94` | “Your coach has not assigned a workout yet…” | Assignment response is empty; no relationship information is present. | “Assigned workouts appear here when available.” |
| `ClientWorkoutViewerScreen.tsx:105` | “Upcoming” | The group contains all incomplete assignments, including past scheduled dates. | “To complete” |
| `ClientWorkoutViewerScreen.tsx:191` | “Completed RPE” whenever `post_rpe` is non-null | Completion is established by `completed_at`. | Same exact wording, now gated by completion and a real RPE. |

All other truthful product lines remain word for word. New exercise rows show the real catalog name, or a neutral ordinal while unavailable. The backend field is labelled “reps / sec,” matching the coach builder instead of inventing its unit. Weight is explicitly prescribed, not claimed as a previous result. Coach first names and last-session values are absent from this response, so neither is fabricated.

## Routes/actions before -> after
| Screen / label | Before destination or effect | After / proof |
| --- | --- | --- |
| Viewer: Open workout `<name>` (every pending row) | `WorkoutAssignmentDetail`, same `assignmentId` | Unchanged; render test presses pending row. |
| Viewer: Open workout `<name>` (every completed row) | `WorkoutAssignmentDetail`, same `assignmentId` | Unchanged; render test presses completed row. |
| Viewer: pull to refresh, including error recovery | Assignment query `refetch()` | Unchanged; render test invokes refresh handler. |
| Edit: set weight | Updates the matching set weight | Unchanged; render test edits weight and checks saved payload. |
| Edit: set reps | Updates the matching set reps | Unchanged; render test edits reps and checks saved payload. |
| Edit: Exercise notes | Updates matching exercise notes | Unchanged; render test edits notes and checks saved payload. |
| Edit: Workout notes | Updates workout notes | Unchanged; render test edits notes and checks saved payload. |
| Edit: Cancel, unchanged draft | `goBack()` | Unchanged; render test presses Cancel. |
| Edit: Cancel, changed draft | Opens discard confirmation | Unchanged; render test asserts dialog and no premature navigation. |
| Edit: Keep editing | Dismisses cancel-style dialog | Unchanged; render test asserts the native cancel action. |
| Edit: Discard changes | `goBack()` without saving | Unchanged; render test invokes the dialog action. |
| Edit: Save changes | PUT `/workouts/:id`, invalidate `['workouts']`, `goBack()` | Unchanged; render test checks payload, invalidation and navigation, including preserved RPE/video. |
| Edit: Save changes after failure | Retains entries and retries same save | Unchanged; render test checks failed-save draft and successful retry. |

No routes or actions removed. Start/resume and detailed exercise review still live on the unchanged `WorkoutAssignmentDetail` screen reached by these same assignment rows; this PR does not edit that screen, ExerciseCard, any navigator or the six client tabs. Native stack back behavior is unchanged.

## Acceptance / scope notes
- Theme/semantic colors only in changed code; no hex literals, new dependencies, lockfile changes, images, animation, global chrome, hype or new first-person copy.
- Reuses HapticPressable and SetLogger. Existing loading/error instructions remain accurate and refreshable.
- Exercise names use the existing cached `useExerciseNames` hook and production GET `/exercises/:id`; coach-approved set counts use the existing overlay utility.
- README describes both screens and the existing API/data limits; only the own-screen entries were added, in alphabetical positions within Logging and planning.
- The existing workout-session regression test's partial theme mock now includes semantic colors; no assertion or product behavior is weakened.
- Shared SetLogger's existing fixed placeholder token is outside the assigned ownership. Changed input/notes/control styles are semantic; dark remains hidden for launch.
