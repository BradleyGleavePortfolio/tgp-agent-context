Tier: T2 mobile behaviour and presentation
Why: A calm daily habits/check-in surface, without hiding actions or changing production DTOs.
T4 trigger scan: No auth, tenancy, privacy grants, credentials, payments, new destructive operation or backend changes. Existing delete handler is unchanged.
T3 trigger scan: No schema, backend contract, cross-service or release flag changes.
Bounded T1: Hairline layout, semantic colours, readable Inter labels, outline controls and restrained typography.
Canonical builder: DES-AD-127, agent 128
Parent owner: Operator agent 128
Acceptance evidence: Failing-first baseline proof (7 failures / 11 passes), then 37 passing targeted tests across four independently run files, including production DTOs, action parity, states, semantic colours and doctrine/voice guards.
Promotion triggers: Any required auth/privacy/money/schema change is returned to the operator, not built here.

## What changes for coaches/clients
Habits become quiet hairline rows with an outline check and the real “completed of total today” count. Recorded weekly indicators remain visible. Mood and energy retain every existing word and selection. Sleep and close controls are at least 44 pt. Add habit is a text link opening the existing sheet. Daily check-in has one forest save/update action and explicit loading/retry states, so a failed read does not expose guessed values.

## B/U list
- B: None.
- U: Competing boxed/coloured controls and undersized labels replaced by readable, monochrome rows.
- U: Sleep/close targets reach 44 pt; energy choices expose their word and selected state.
- U: Failed/in-flight check-in reads now show loading or retry instead of an editable default form.

## Routes/actions before -> after
| Before | After | Destination/effect |
|---|---|---|
| Habits tab | Habits tab | Same local habits pane |
| Daily Check-in tab | Daily check-in tab | Same local check-in pane |
| Pull to refresh | Pull to refresh | Refetch habits, today's logs and today's check-in |
| Retry habits | Retry habits | Same three refetches |
| Tap habit | Tap habit / 44 pt outline check | Same logHabit mutation: tick target quantity, untick zero |
| Hold habit | Hold habit | Same delete confirmation, Cancel/Delete and existing delete mutation |
| Week indicators | Week indicators | Same recorded completion history, no additional tap |
| Add New Habit | Add habit text link | Same add sheet |
| Close add sheet | Close new habit | Same close handler; also Android system close |
| Name / Target / Unit inputs | Habit name / Target / Unit inputs | Same state setters and production create payload |
| Add Habit | Create habit | Same create mutation and close/reset on success |
| Five mood choices | Same five words | Same setMood values 1–5 |
| Five energy choices | Same five words | Same setEnergy values 1–5 |
| Sleep minus / plus | Sleep minus / plus, labelled 44 pt targets | Same half-hour changes and bounds |
| Notes | Notes | Same notes field and 500-character limit |
| Save/Update Check-in | Save/Update check-in | Same production check-in payload and mutation |
| No check-in read error action | Retry check-in | Refetch today's check-in |
| Edit habit / separate history link | Neither before nor after | No such action/route exists in the current screen; no endpoint invented |

The duplicate percentage/progress graphic becomes the same real completion ratio in plain text (“3 of 5 today”); no underlying metric is lost. No feature, route or handler is removed.

## Truthful sweep (before styling)
No unsupported customer-facing data claims were found in the owned files. Today's counts come from useHabitLogs; saved state comes from today's check-in; week indicators come from recorded logs. The zero-valued runDays field renders no streak copy. Date, target, quantity, names and saved messages remain backed by data; mood/energy words remain unchanged.

| Original location | Copy/state | What is true | Replacement |
|---|---|---|---|
| HabitsScreen.tsx:169,187,216,237 | “Please try again.” fallback | The named operation failed; no automatic retry occurs | Operation-specific “The habit/check-in was not updated/deleted/created/saved. Try again.” |
| HabitsScreen.tsx:377 onward | Form shown when today's query fails or is still loading | Existing saved values are not known yet | Loading or “Today's check-in could not be loaded.” + retry; no editable guesses |

No exclusivity, invented coach, goal, streak, history or permission claim added. Existing true information remains visible, without extra disclosure taps.

## Design parity
Matches the shared A23 language: bone canvas, hairlines rather than cream cards, one completion sentence, Cormorant title/hero only, Inter for choices and inputs, theme-derived forest action, no category colours, photos, particles, springs, badges or new navigation. Intentionally retains the two local panes and weekly history because action/information parity wins over minimalism. Dark stays hidden; all consumed colours in this surface are projected from semantic theme tokens.

## Evidence
- Baseline `d0875d26`, new launch tests against unchanged source: 7 failed / 11 passed (counts, action labels, new states and 44 pt controls fail as expected).
- Updated launch journey: 18/18 pass.
- Mood/energy action and wording test: 1/1 pass.
- Quiet-luxury doctrine: 10/10 pass.
- Voice guard: 8/8 pass.
- Each file ran separately through `ops/heavy.sh`; no local full suite, typecheck or lint.
- 370 changed lines, including tests and the matching README; no dependencies or lockfile change.
- Prior CI green at `2bc01cc2249efd091745e3dc3f06bdf5f26b6ae6`: typecheck/lint/test, both analyzers and CodeQL.
- Pure main merge per operator's README instruction: current head `6463961ca567759926a51a6c44e32e44e9f871f9`, owned source/tests unchanged, same 370-line diff. HabitsScreen's existing README row was edited in place; no append. GitHub MERGEABLE.
- After merge: launch 18/18 and expanded doctrine 30/30 pass locally. Fresh CI all green at `6463961ca567759926a51a6c44e32e44e9f871f9`; GitHub MERGEABLE.
