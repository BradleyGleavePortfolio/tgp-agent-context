**Tier:** T2 (mobile UI and copy; no auth, tenancy, money, consent or data-shape change)
**Why:** B21, B33. Owner 15:29 and 16:20: every client gets the full consultation, the prototype governs the onboarding flow at about 90%, coachless clients get everything except direct coaching, no lock pages. Prototype screens 03-36.
**T4 trigger scan:** auth no; tenancy no; money no; PII/health: the screening (P1-P7) questions, answers and validation are unchanged; only P8's headline and Roman's line change and, for coachless clients only, three P8 lines that named the coach (see table); consent: the P0 copy, version and hashes are untouched (CONSENT_COPY_SHA256 and AI_CONSENT_COPY_SHA256 tests pass unchanged); credentials no; destructive data no.
**T3 trigger scan:** no API, storage or navigation change. `ConsultationOnboardingNavigator` passes one new prop (`coachless = !user.coach_id`).
**Bounded T1:** copy data, styles, one pure helper.
**Canonical builder:** CONSULT-PARITY-133 (claude_opus_5_5). **Parent owner:** operator agent 133.
**Acceptance evidence:** `consultationParity133.test.tsx` (15 tests, renders at 360x800 and 390x844), updated `consultationQuietLook`, `ConsultationFlow` tests; guards `copyVoice`, `truthfulCopy`, `quietLuxuryDoctrine` pass.
**Promotion triggers:** any change to P0 text, a screening question, an answer key or the save payload.

## What changes for clients
- Roman speaks in the prototype's serif italic voice on every chapter line (decision C-D8, recommended yes).
- The date of birth, height, weight and goal weight wheels use the serif numerals of the prototype: the selected value large in ink, the neighbours fading, the hairline band behind the selected value.
- Imperial / Metric are quiet text tabs with a forest underline (no second filled control beside Continue), and they open on the phone's region (US, Liberia, Myanmar imperial; everywhere else metric), as the prototype notes ask. The retired lean flow had this rule; the consultation had lost it.
- Days per week (S1) and meals a day (N3) are the prototype's large two-column grid with serif numerals; every chip is a pill (owner 17:07, rounded).
- Detail labels ("Anything Bradley should know? (optional)", "Tell Bradley more (optional)") read as the prototype's small overlines.
- P8 opens "Thanks for answering honestly, Maya." with Roman: "That helps me keep you safe."
- Coached clients see their coach's name where the flow knows it: from the coach-sharing notice (share-link joins) during the questions, and from the server's completion result on the reveals ("Before Bradley builds anything for you"). A client who joined with a code still reads "your coach" during the questions: the cached user has no coach name and `ConsultationOnboardingNavigator` passes `coachName={null}` (U from LN-OPUS-B-133; needs a coach-name read, follow-up).
- Coachless clients are never told a coach will read, know or act on something: each line that names a coach has a coachless version (`COACHLESS_COPY`), for example W1 "Before anything is built for you", G2 "Your reasons help Roman keep you going", the P1-P7 note "Add a note (optional)", and P8 drops "Your coach will be told". B4's long-road soft note (a goal more than 30% from the current weight) names the coach for a coached client ("That's a long road. Bradley will set milestones with you.") and reads "That's a long road. Smaller milestones along the way will help." for a coachless one (FIX ROUND 2, B-579-SOL-B-1; helper-produced lines are now in the coachless sweep test).

## WHY / WHEN / WHO
Root cause: the consultation was built in #310 (2c17c241, 2026-10-02) from an earlier cut of the prototype (sans-serif Roman lines and wheel values, a filled unit tab, small numeral chips, `coachName={null}` in the navigator, an imperial default) and it was never reachable on any device (B33 / RECON133 F1: the `consultation_available` gate from 73e71cd5, S-REVENUE-124), so nobody compared it with the approved prototype or tried it as a coachless client.

## Parity table (prototype /home/user/workspace/specs133/shots/NN.png)
| # | Today's file | Matches | Differs and why |
|---|---|---|---|
| 03 W1 | definitions.ts W1, QuestionScreen intro | eyebrow, greeting by clock, Roman line (now serif italic), sub, "About five minutes.", "Begin my consultation" | none |
| 04 G1, 06 B1, 10 L1, 12 T1, 19 S3, 21 N1, 24 N4 | rows | question, reason line, rows, auto-advance 280 ms, Roman chapter lines | none |
| 05 G2, 13 T2, 20 S3b, 22 N2, 25 N5 | chips | pills, cap "Up to three.", exclusive "Nothing", Skip + Continue | N2 reason stays "So your coach knows what you avoid." (README: no promise of automatic filtering); prototype "So nothing we suggest is something you avoid." |
| 07 B2 | dob wheels | serif wheels, 30 years back default, band behind | Android keeps the wheels (prototype note says calendar on Android); entry asks for wheels |
| 08 B3 | measure | quiet underlined tabs, serif paired wheels, region default | none |
| 09 B4 | goalWeight | serif wheel from current weight, soft notes, "No number, just the goal" | none |
| 11 L2, 16 T4, 18 S2 | single chips | auto-advance, Skip | none |
| 14-15 T3 | yesno + detail | Yes expands areas + note, Continue after one area | reason "Your first moves will respect it." kept (OR-115-4 voice rule: no "We'll"); prototype "We'll start you with moves that respect it." |
| 17 S1, 23 N3 | big chips | 56 pt two-column grid, serif numerals, no preselect, time-left caption | none |
| 26 P0 | consent | verbatim D2 two-box agreement | position kept after W1 (entry: keep P0 where the code has it; D2 ruling); prototype puts a one-button disclaimer in chapter 7 |
| 27-33 P1-P7 | yesno | "Question n of 7", Roman line on P1, "Pause", No auto-advances, Yes reveals the note | P7 uses commas for the two em dashes (the prototype's own copy flag recommends commas) |
| 34 P4 yes | yesno detail | 280-character note, Continue | none |
| 35 P8 | message | headline, Roman line, never blocks, Continue | body keeps the owner-ruled safety copy (general habits and a safe next step before the physician line); Roman says "me" not "us" (voice guard) |
| 36 C1 | chips | Today / Tomorrow, weekday (preselected) / two more days, Continue | none |

## Shared primitives (DS-PRIMITIVES-133, #577, merged 18:03; brought in with `git merge origin/main`, no rebase)
- `PrimaryButton`, `TextLink` (underlined "Skip", "Finish later", "Privacy Policy") and the question `Headline` are the `src/ui` primitives, re-exported from `components.tsx`; the consultation's own button and link are deleted.
- The top bar is the shared `ScreenTopBar`; the frame takes the shared Screen's insets (`insets.top + layout.statusBarGap`) and footer spacing (`footerBottomPadding`, `layout.gutter`, `layout.footerItemGap`).
- Frame keeps its own scroll body: `src/ui` Screen cannot yet put the analytics marker (`ph-no-capture`) on the scroll view or set `automaticallyAdjustKeyboardInsets` (Opus C-6). Asked DS-PRIMITIVES-133 for a `scrollProps` pass-through; then Frame becomes `<Screen>`.
- Corners from the semantic tokens only (owner 17:07): chips and radio `radius.chip`, notes field `radius.input`, checkbox cards `radius.card`, checkbox box `radius.control`. No literal radius.
- The wheel band stays the existing hairline band behind the selected value until `WheelBand` (#578) merges.

## Routes and actions before -> after
Unchanged: every Back, Finish later / Pause, Skip, Continue, option, chip, wheel, tab and note is the same control with the same handler (existing flow tests pass unchanged).

## Truthful sweep
Every coach line is now true for both coached and coachless clients (test: no filled line mentions a coach for a coachless client). No invented counts, streaks or promises added.

## Not seen on a device
Nobody has run this on a phone. Rendered through the jest renderer at 360x800 and 390x844 (style assertions, not pixels). The italic face loads at runtime from the font package App.tsx already ships (no native change); until it loads, Roman's line shows in the regular serif.

agent 133
