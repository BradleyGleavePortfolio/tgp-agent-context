Tier: T1
Why: Bounded routine-builder presentation and local interaction changes; existing persistence and payload rules stay unchanged.
T4 trigger scan: None. No auth, tenancy, PII handling, money, credentials, destructive backend logic or production changes.
T3 trigger scan: None. No workout prescription, safety routing, schema, dependency, endpoint or navigation change.
Bounded T1: One assigned screen, its parity test and its existing module documentation section; under 400 changed lines.
Canonical builder: GPT-6.1 Sol, DES-AI-127, agent 128.
Parent owner: Operator agent 128; owner-approved six screen-redo acceptance rules.
Acceptance evidence: Failing-first unchanged screen: 6/6 initial tests fail on missing labels/actions. After merging current main: targeted parity 7/7, doctrine/truthful-copy guard 30/30, targeted ESLint pass. 382 changed lines across 3 files. Logs retained in ops/reports/DES-AI-127-*.log.
Promotion triggers: Escalate any required auth, tenancy, health-sharing, payment or destructive-persistence change rather than expanding this UI patch.

## What changes for coaches/clients
Clients build routines on a quieter bone page: serif name input, hairline exercise rows, readable inline sets/reps/rest, labelled 44-point controls, real drag reordering plus existing up/down controls, and one forest Save action. Add exercise is a text link. Search and muscle filters stay available, with factual loading/error/retry/empty states. Existing routines keep confirmed deletion; Save returns only after success.

## B/U list
- B: None found in normal-use paths.
- U1: Label and enlarge existing icon controls; increase field labels and exercise metadata to at least 13 pt.
- U2: Remove competing cream boxes/filled filter chips; keep fields inline and every existing action reachable.
- U3: Make save/delete fallback recovery specific; expose exercise-picker load/error/empty feedback and factual saving state.

## Routes/actions before -> after
| Label before -> after | Destination or effect before -> after |
| --- | --- |
| Back -> Cancel routine | `navigation.goBack()` unchanged |
| Routine name | Edit the same name, same neutral example placeholder |
| Add Exercise -> Add exercise | Open the existing exercise picker |
| Close picker | Dismiss picker; Android back now also dismisses it |
| Search exercises | Same name/muscle search and existing two-character threshold |
| All/chest/back/shoulders/legs/biceps/triceps/core/full body/cardio | Same muscle filter handlers; active choice underlined instead of filled |
| Select an exercise | Append same exercise with 3 sets, 10 reps, 60 seconds rest; close picker |
| Move up / Move down | Same reorder handlers, same disabled first/last boundary controls |
| New drag grip | Native PanResponder reorders on release; up/down remain available |
| Sets / Reps / Rest (s) | Same inline numeric editors and payload conversion; new pencil focuses Sets |
| Remove exercise | Same row removal handler |
| Save Routine / Update Routine -> Save routine | Same create/update mutations and server payload; same success/back and failure/stay |
| Delete routine | Same confirmation, Cancel, Delete mutation and success/back; failure stays |
| New Try again | Reload exercise catalog after a load failure |

Parity test renders new and existing modes, exercises search/filter/select and every field, verifies reorder arrows and drag, remove, create/update payloads and success navigation, delete confirmation/cancel structure and success, back, validation/error recovery, picker retry, and saving state.

## Truthful sweep before styling
No invented counts, streaks, goals, praise, coach/permission/access claims or schedules in the assigned screen. Name/example, actual exercise names, muscle/equipment metadata and inline values remain backed by input or catalog/routine data.

| Before file:line | What it says | What is true | Replacement |
| --- | --- | --- | --- |
| RoutineBuilderScreen.tsx:160 | fallback “Please try again.” | Save failed; builder keeps its draft | “Check your connection and save the routine again.” |
| RoutineBuilderScreen.tsx:184 | fallback “Please try again.” | Delete failed; routine remains | “Check your connection and delete the routine again.” |
| RoutineBuilderScreen.tsx:151 / :155 | Missing Name / No Exercises | Name or exercise is required | Sentence-case specific title; existing instructional body unchanged |

New picker messages depend only on loading, rejected catalog load or empty filtered data. “Saving routine…” is shown only while create/update is pending. No existing true data-bearing line was removed.

## Design and documentation
Matches the coach-workout-builder reference's hierarchy, hairlines, overlines, grip/edit/remove vocabulary and single primary. Intentionally retains the existing picker modal and inline sets/reps/rest instead of hiding any control; no reference-only workout type/duration or illustrations were added. Colours come only from useTheme; typography from tokens. HapticPressable is reused with animation disabled (no spring). Picker transition is immediate.

README: one RoutineBuilderScreen row inserted inside the existing Logging and planning section, per operator's in-place/alphabetical-entry instruction; no shared append.

No merge, deployment, production flag/data write, new dependency or lockfile change.
