Tier: T1
Why: Bounded Day-1 visual and truthful-copy redo; existing persistence, consent, routing and backend contracts unchanged.
T4 trigger scan: No auth, access, privacy contract, money, credential or destructive-data change. Coach-sharing notice and payload are untouched.
T3 trigger scan: No service, schema, navigator or cross-system change.
Bounded T1: Six assigned Day-1 screen/component files, their existing rendered test file, and only their existing documentation rows.
Canonical builder: DES-AX-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: Failing-first on unchanged source: 9 failures / 19 passes. Final rendered screen tests: 28/28; accepted-save tests: 8/8; quiet-luxury/truthful-copy guard: 30/30. Targeted ESLint and diff whitespace check pass. All local checks ran through ops/heavy.sh; no device/screenshot pass claimed.
Promotion triggers: Any needed change to consent, coach attachment, data persistence, auth gating or production must go back to the operator.

## What changes for coaches/clients

Day-1 now uses a thin progress hairline, a readable “Step n of 6” label, open goal choices, Inter choice labels, comfortable time controls and one sentence-case forest action per screen. Secondary retry/offline controls remain visible and are at least 44 pt tall. Long content can scroll instead of losing the bottom action. The owned screens derive their palette from semantic theme tokens, not the provider's fixed legacy palette.

The complete six-step sequence, invites, sharing notice, goals, time choices, skip, back, offline save, saved drafts and terminal completion all remain. Notifications and translation files are unchanged.

## B/U list

- B1: Before the final save succeeds, an ordinary client sees “Your setup is done” and “Onboarding complete” although completion can still fail. Remove those premature completion claims; the factual welcome and finish action remain.
- B2: A client following an invite sees “Pairing…” before submitting and “pair instantly” although the code can fail. Remove both claims; input, invitation prefill, consent sentence, errors and submitting spinner remain.
- U1: Replace boxed choice chrome, tiny time targets and uppercase actions with quiet hairlines and comfortable controls without reducing functionality.

## Truthful sweep

References are to pre-change source at c00a2a5f.

| File:line | User-facing line | What is true | Replacement |
|---|---|---|---|
| `CoachPairingScreen.tsx:123` | “Enter the invite code your coach sent you to pair instantly.” | Entering/submitting a code does not guarantee immediate pairing; errors can occur. | Remove the promise under rule 1; retained “Invite code” field, example and “Pair with coach” action explain the task. |
| `CoachPairingScreen.tsx:129` | “Pairing with the invite from your link…” | Route prefill is not a request; pairing starts only on submit. | Remove under rule 1; existing spinner shows actual submitting state. |
| `ReadyScreen.tsx:157` | Accessibility label “Onboarding complete” | Completion has not yet been posted or marked locally. | Remove the premature check badge under rule 1. |
| `ReadyScreen.tsx:165` | “Your setup is done. The work starts now.” | Final completion can still fail or require offline finish. | Remove under rule 1; keep data-backed named/fallback welcome and Open Home. |

All remaining lines were checked: cached first-name greetings have a fallback; six steps reflect the actual stack; goals are descriptions/options, not claims about the client's progress; default 9:00 AM describes the configured default, not a promised reminder; save errors describe the current retained input and provide real retry/offline handlers. These true/instructional lines stay word for word. No new strings, first-person copy, exclamation marks or invented personal data.

## Routes/actions before -> after

Every destination/effect below is unchanged.

| Screen | Label/control before -> after | Destination/effect before -> after |
|---|---|---|
| Welcome | Get started -> Get started | Write CoachPairing checkpoint; navigate CoachPairing |
| CoachPairing | Back -> Back | navigation.goBack |
| CoachPairing | Invite code edit / keyboard submit -> same | Uppercase code; clear error; keyboard submits same attachment handler |
| CoachPairing | Pair with coach -> same | pairWithCoach(code, sharingVersion); success writes invite/checkpoint and opens Goals; structured errors retained |
| CoachPairing | Continue without a code -> same | Write Goals checkpoint; open Goals; still absent for deep-link prefill |
| Goals | Back -> Back | navigation.goBack |
| Goals | Fitness / Business / Personal Growth / Relationships / Mental Health / Something else -> same six choices | Toggle each goal on/off; selected state announced |
| Goals | Continue -> Continue | Save selected goals; checkpoint; open Notifications; disabled until a choice |
| Goals | Skip for now -> same | Checkpoint; open Notifications without saving goals |
| Goals | Retry -> Retry | Retry the same save handler |
| Goals | Continue offline -> same | Keep selected draft; enqueue goals sync; open Notifications |
| CheckInTime | Back -> Back | navigation.goBack |
| CheckInTime | Hour + / -; Minute + / - -> same | Hour ±1; minute ±5; restored draft values retained |
| CheckInTime | AM / PM -> same | Change period; selected state announced |
| CheckInTime | Save check-in time -> same | Save same time/device-zone payload; checkpoint; open Ready |
| CheckInTime | Skip for now -> same | Checkpoint; open Ready |
| CheckInTime | Retry -> Retry | Retry same time save |
| CheckInTime | Continue offline -> same | Keep time/zone draft; enqueue check-in sync; open Ready |
| Ready | Open Home -> Open Home | Flush pending sync; completeDayOne; keep account answers; mark local completion; clear checkpoint when safe; authEvents.emit |
| Ready | Open Home after error -> same | Retry same finish handler |
| Ready | Continue offline -> same | Keep answers; checkpoint; enqueue completion; mark local complete; authEvents.emit |
| StepHeader | Back where supplied -> same | Same callback; Welcome/Ready still have no header back button |
| Resume | Saved Goals / CheckInTime / Ready checkpoint -> same | Existing draft restoration and terminal answer retention unchanged |

Rendered parity coverage exercises every listed screen button, all six choices, both time stepper directions, AM/PM, all three header backs, retry and offline finish, saved state, named/fallback welcome and auth completion. No tappable element removed. Removed non-action copy is explicitly justified by rule 1 above.

## Documentation and design checks

- Updated only Welcome, CoachPairing, Goals, CheckInTime and Ready rows within the existing Day-1 section of `src/navigation/README.md`; StepHeader documented in the Welcome row. No appended README section.
- Theme-only colors; bone page in the launch palette; no cream choice fills, photo, illustration, glow, gradient, spring or trophy.
- One forest primary per owned screen; Cormorant for titles/hero time values, Inter for labels/actions/body; readable overlines and tabular time figures.
- Welcome reveal 300 ms; header fill remains 280 ms; existing non-blocking Ready fade remains 400 ms; reduced-motion behavior retained.
- No navigator/tab change, dependency, lockfile, API, permission or production change.
