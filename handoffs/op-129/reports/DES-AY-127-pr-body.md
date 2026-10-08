Tier: T1
Why: Bounded consultation presentation and non-consent truthful-copy corrections; every existing handler and data contract stays unchanged.
T4 trigger scan: none; consent words/order/checkbox behaviour, analytics exclusion and requests are frozen.
T3 trigger scan: none; no new shared architecture or cross-system ownership.
Bounded T1: YES; named files, existing semantic tokens, unchanged flow and callbacks, targeted render evidence.
Canonical builder: GPT-6 Luna (T1); assigned GPT-6.1 Sol builder for DES-AY-127.
Parent owner: operator agent 128.
Acceptance evidence: failing-first visual/copy guards, 17 consultation parity/theme cases; existing memory (12), flow (30), templates (16), doctrine (30) and privacy suites pass via heavy.sh.
Promotion triggers: any required consent, private-data, auth, money or backend contract change goes back to the operator.

## What changes for coaches/clients
Consultation choices sit on the page with hairline outlines instead of filled cards. Supporting text uses Inter; targets keep restrained serif tabular figures. A single theme-accent primary action stays on each screen, forest in launch light mode. All edits, disclosures, support and continuation actions remain where they were.

The weekday strip is explicitly suggested, not claimed as the client's actual schedule. Missing setup errors no longer promise that a coach is working or that a plan will be ready shortly. No consent copy or behaviour changes.

## B/U list
- B1: A client completing a three-day consultation hears inferred Monday/Wednesday/Friday announced as their actual week. Fixed by a visible/accessibility “Suggested training days” label; same days/data remain.
- B2: A client with a missing link or coach setup sees an unsupported promise that setup is underway or ready shortly. Fixed with prerequisite-specific copy and existing support/retry.
- U1: Active semantic palette, hairline choices, calm reading typography, tabular changing figures and 44pt unit/edit/finish-later controls.
- U2: Simple macro guidance describes displayed/set targets without inferring that logging will feel easy.

## Routes/actions before -> after
| Screen/component | Label/action before -> after | Destination or effect (unchanged) |
| --- | --- | --- |
| Frame | Back -> Back | `onBack` |
| Frame | Finish later / Pause -> same | `onFinishLater` saves/pauses via host |
| OptionRow | Every option label -> same | `onPress`, radio selected/checked state |
| Chip | Every option label -> same | `onPress`, checkbox/radio states and cap retained |
| Checkbox | Required/optional consent labels -> verbatim | `onToggle`; disabled check cannot act; no pre-tick or gating change |
| LabeledInput | Notes/other labels -> same | `onChange`, same value and length limit |
| UnitTabs | Imperial / Metric -> same | `onChange` with selected unit |
| Wheel | Increment / decrement / scroll -> same | `onChange` with settled value |
| PrimaryButton/TextLink | Host label -> same | Original callbacks; disabled primary cannot act; external links retain link role |
| Summary | Edit goals/body/week/care/eating -> same | `onEdit(1/2/3/4/6)` |
| Summary | Back / Prepare my plan -> same | `onBack` / `onPrepare`; preparing hides edits/back and disables Prepare |
| Preparing | Preparing status -> same | Unchanged host completion; no new action |
| Macro reveal | Why these numbers -> same | Expand/collapse explanation; simple/full targets unchanged |
| Macro reveal | Next: your plan -> same | `onNext` |
| Plan reveal | Back / Why this plan / Show me around -> same | `onBack` / disclosure / `onFinish` |
| Plan reveal | Training days this week -> Suggested training days | Illustrative information retained; not a tappable action |
| Paused | Continue my consultation -> same | `onResume` |
| All nine problem variants | Try again / Take me there / Review the agreement / Review my answers -> same | `onAction`; Back -> `onBack` |
| Problem/paused | Contact support -> same | Existing support-email hook/fallback |
| Problem/paused | Sign out / Cancel -> same | Existing alert confirmation; only confirm calls `onSignOut`; absent when host omits callback |

No route, button, data field or feature removed. Component/reveal parity is exercised in `consultationQuietLook.test.tsx`; scroll/wheels, full flow, consent and support-fallback behaviour retain the existing targeted suites.

## Truthful sweep (pre-style copy, before -> after)
| File:line (base main) | Unsupported line | What is known | Replacement |
| --- | --- | --- | --- |
| `RevealScreens.tsx:126` | “Your coach link is still being set up.” | `not_attached` proves a link is missing, not that anyone is setting it up | “A coach link is needed.” |
| `RevealScreens.tsx:127` | “…Please try again in a moment.” in setup context | No completion time is provided | Missing-link prerequisite + existing support/retry |
| `RevealScreens.tsx:146-147` | “Your coach is still setting things up.” / “Your plan will be ready to prepare shortly.” | `clinic_not_configured` only proves prerequisite setup is incomplete | “Your plan could not be prepared.” + incomplete setup/support/retry |
| `RevealScreens.tsx:318` | “…once logging feels easy.” | `macro_display_mode` identifies displayed targets, not ease | “Calories and protein are shown here. Carbs and fat targets are also set.” |
| `RevealScreens.tsx:383` | “Training days this week: …” | `trainingDayPattern(days_per_week)` infers weekdays from a count, not the schedule | Visible and accessibility label “Suggested training days” |

Other copy stays word for word: progress is derived from chapter state, option/input labels from host definitions, summary from answers, calorie/macro/program figures from the server, screened guidance from screening state, reference from the supplied request reference. Consent error wording and every consent paragraph/label remain frozen.

## Scope and evidence
- Only `components.tsx`, `RevealScreens.tsx`, their new targeted test, and their two existing consultation README table rows.
- Semantic-light compatibility exports retained for untouched QuestionScreen/ConsultationFlow; all touched components/reveals consume the active theme. Light and dark token variants tested; no launch appearance setting change.
- STEP_MS stays 280; reduced-motion hook, stagger, analytics markers and Roman avatar retained.
- Matched A23 restraint/hairlines/negative space/single action, with comfort-sized Inter body and 44pt controls; intentionally no photography or navigation changes.
- Local runs only through `/home/user/workspace/ops/heavy.sh`, one targeted file at a time. No full local suite/typecheck/lint, dependencies, lockfile, production writes, merge or deploy.
- [Prerequisite #463](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/463) and [prerequisite #464](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/464) merged.
