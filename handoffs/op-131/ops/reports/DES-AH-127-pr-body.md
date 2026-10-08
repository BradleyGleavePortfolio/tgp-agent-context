Tier: T1 mobile presentation and truthful state copy.
Why: Exercise lookup should be calm and readable without losing filters, metadata, instructions or media controls.
T4 trigger scan: None; no auth, tenancy, PII, money, credentials or destructive data changes.
T3 trigger scan: None; no new service, navigation contract, dependency or backend change.
Bounded T1: Two assigned screens, their render/contract tests and their own README entries; under 400 changed lines.
Canonical builder: DES-AH-127, GPT-6.1 Sol, agent 128.
Parent owner: Operator agent 128; owner six acceptance rules and 13:51 README placement ruling.
Acceptance evidence: Failing-first actual-equipment and media-copy tests on unchanged source; five targeted files pass locally, run individually through heavy.sh. CI supplies project-wide lint/typecheck/tests.
Promotion triggers: Any needed auth, ownership, money, credential or navigation-contract change goes back to the operator.

## What changes for coaches/clients
- Exercise library uses a serif title, hairline search and rows, readable text filters with selected underlines, and at least 44-point search/filter/retry targets.
- Rows preserve name, primary muscle, category and difficulty and now show actual equipment.
- Detail uses the exercise's actual name, MUSCLES / EQUIPMENT / HOW TO overlines and hairline sections. Actual video and legacy GIF behavior are retained.
- Media absence is neutral. A failed demonstration refers to instructions only when they exist.
- No invented exercise history, records, results, promises, or added logging/navigation steps.

## B / U list
- B1: When a normal client opens an exercise whose demonstration fails and whose instructions are empty, the old copy tells them to follow nonexistent instructions below; failure copy now checks the instruction array.
- U1: “Video not yet available” implied future availability; replaced by current-state copy.
- U2: Boxed search/filled chips and small retry targets become hairlines, underlined text filters and 44-point targets.
- U3: Equipment was missing from library rows; actual equipment is now visible while all existing metadata stays.

## Routes/actions before -> after
| Screen / label | Before -> after destination or effect | Proof |
| --- | --- | --- |
| Library / Search exercises | Keyboard submit trims query and fetches first page -> unchanged | Render test submits query and asserts API params |
| Library / Category: push, pull, legs, cardio, mobility, core | Tap selects; tap again clears -> unchanged | Every value toggled on/off and API params asserted |
| Library / Muscle: pectorals, lats, quads, hamstrings, front delts, biceps, triceps, glutes | Tap selects; tap again clears -> unchanged | Every value toggled on/off and API params asserted |
| Library / Equipment: barbell, dumbbell, body weight, machine, cable | Tap selects; tap again clears -> unchanged | Every value toggled on/off and API params asserted |
| Library / Filter horizontal scroll | All three horizontal groups remain scrollable -> unchanged | Existing ScrollViews retained; all facets render |
| Library / Open exercise | `ExerciseDetail({ idOrSlug: item.id })` -> unchanged | Real navigator renders detail and asserts requested id |
| Library / Infinite scroll | Fetch next cursor and append -> unchanged | End-reached test verifies next cursor and second row |
| Library / Retry | Refetch first page -> unchanged | Failed load then successful retry rendered |
| Detail / Retry | Reload same id -> unchanged | Failed detail then successful retry rendered |
| Detail / Play, pause, scrub, fullscreen, PiP | Native VideoView controls -> unchanged | VideoView remains; fullscreen and PiP props asserted; no autoplay change |
| Detail / GIF demonstration | Legacy animation fallback, error -> unchanged | GIF renders; error transitions to truthful caption |
| Both / Native back | Navigator-owned back -> untouched | No navigator/route changes |
| Both / Add to routine, add to workout, history | Not present before -> not fabricated | Existing screens have no such action or history read |

No route, handler, media control or content field is removed. Secondary muscle information moves under MUSCLES, on the same screen without another tap.

## Truthful sweep before styling
| Original file:line | Existing line / claim | Truth and replacement |
| --- | --- | --- |
| ExerciseDetailScreen.tsx:142 | “The demonstration did not load. Follow the instructions below.” | The failure is real, but instructions may be empty. Keep word-for-word when instructions exist; otherwise “The demonstration did not load.” Tests cover GIF failures with/without instructions and native video failure without instructions. |
| ExerciseDetailScreen.tsx:142 | “Video not yet available.” | Only present media absence is known. “No demonstration available for this exercise.” |
| ExerciseLibraryScreen.tsx:195 / Detail:113-117 | Name, muscle, category, difficulty | All are response fields; retained. Library also shows real equipment. |
| Detail:149-173 | Equipment, secondary muscles, instructions, step numbers | All are response fields or array indices; retained and grouped. Empty fields/arrays hide their sections. |
| Library:110, 212, 239, 254 / Detail:63, 99-102 | Search / filter labels, specific fetch failures, Retry, “No exercises match.”, “Exercise not found.” | Neutral instruction or state-backed facts; unchanged word-for-word. Section labels change only presentation/wording to requested overlines; title becomes sentence case. |

## Design / documentation
Matches CATALOG universal restraint and DESIGN-AUD-127 (e): theme-backed bone, negative space, no cream-filled cards, hairlines, Cormorant titles, Inter body/UI, monochrome filter text. Intentionally keeps all three filter groups and all original metadata rather than hiding useful information. Existing exercise media is retained, not a new decorative photo.

Uses existing HapticPressable with animation disabled (no spring), existing SkeletonScreen, semantic theme colours only; media radius uses radius.lg (4). No new dependency/lockfile, navigator/tab, feature-flag, production or backend changes. Own README entries added alphabetically inside Logging and planning, not appended to the shared file.

## Tests / evidence
- `ExerciseLibraryRedo128.test.tsx`: 8 passing (all facet toggles, search, metadata, actual navigator destination, pagination, both retries, video props, GIF/native media-failure state copy, empty data).
- `ExerciseLibraryPolish125.test.tsx`: 3 passing (selected underlines/contrast in light and dark, specific error foreground).
- `exerciseCatalog.test.tsx`: 11 passing (existing API/media contract tests retained).
- `quietLuxuryDoctrine.test.ts`: 30 passing.
- `copyVoice.guard.test.ts`: 8 passing.
- Failing-first run on unchanged source: absent equipment, no-instructions failure copy and missing-media copy fail; parity cases that already worked pass. Logs saved in operator report directory.
- No full suite, full-project typecheck or lint run locally; required CI does those. No device screenshot claimed.

## Quiet-luxury checklist
- [x] No new heavy display weights, hype/first-person/emoji/exclamation copy, fixed colours, placeholders, shadows, large radii, floating UI or spring motion.
- [x] All current actions and important data retained.
- [x] Module README updated only for owned screens.
- [x] Theme colours support later dark palette readiness; dark-mode launch visibility unchanged.
