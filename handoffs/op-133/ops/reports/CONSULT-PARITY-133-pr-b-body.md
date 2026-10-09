Stacked on #579 (questions 03-36): this PR's base is `agent133/consult-parity-133`, so the diff shows only 37-45. When #579 merges, GitHub retargets it to main.

**Tier:** T2 (mobile UI and copy; no auth, tenancy, money, consent or data-shape change)
**Why:** B21, B33. Prototype screens 37-45 at about 90% (owner 16:20); coachless clients get everything except direct coaching (owner 15:29).
**T4 trigger scan:** auth no; tenancy no; money no; PII/health: no answer, payload or storage change (the under-16 stop sends nothing, as before); consent: P0 untouched; credentials no; destructive data no.
**T3 trigger scan:** no API or navigation change. ConsultationFlow gains one piece of view state (`welcomeBackId`); its error and route handling (CONSULT-ALL-M-133) is not touched.
**Bounded T1:** copy data, styles, pure helpers.
**Canonical builder:** CONSULT-PARITY-133 (claude_opus_5_5). **Parent owner:** operator agent 133.
**Acceptance evidence:** `consultationParity133States.test.tsx` (8 tests), updated `consultationTemplates` (under-16 stop), `consultationParity133` (coachless reveal copy); `ConsultationFlow`, `consultationQuietLook`, `consultationOrdering`, `consultationPrivacy`, `consultationLostResponse`, `rootNavigatorConsultationComplete`, `copyVoice`, `truthfulCopy` pass locally one file at a time.
**Promotion triggers:** any change to the completion call, the save payload or the P0 copy.

## What changes for clients
- **43 Summary offline.** With no connection the summary's action reads "Prepare when I'm back online" (disabled) and Roman says "I'll prepare your numbers the moment you're connected. Nothing you've told me is lost." The app-wide offline banner already shows above the flow. When the phone reconnects, the plan is prepared by itself, once per visit, as Roman's line says and as the prototype's notes ask ("retries on reconnect and moves on by itself", FIX ROUND 2, B-581-1); a client who was online the whole time still taps Prepare. Before, the client could tap Prepare offline and land on the connection problem screen.
- **44 Calm error.** Every problem screen shows Roman's face above the serif sentence (no red, no error haptic, unchanged).
- **39 Macro reveal.** One success haptic when the numbers appear (through `HapticService`, so the Settings switch is honoured); the 64 pt calorie number gets an 80 pt line height (the DS 1.25 serif ratio) so it is never clipped (was 68).
- **40 Plan reveal.** Training days carry an accent dot and the first-session day from C1 is ring-highlighted (VoiceOver: "First session: Thursday"); the week line adds the session length the client chose at T4 ("3 days a week. About 30 to 45 minutes each.").
- **42 Welcome back.** After a resume (reopening the app mid-consultation, or Continue on the paused screen) Roman's line on the screen the client lands on is "Welcome back, Maya. You were telling me about your schedule."; the chapter line returns on the next screen.
- **45 Under 16.** Continue on B2 with an age under 16 opens a calm, final stop screen under the chapter eyebrow: "The Growth Project is for ages 16 and up." / "If the date was entered by mistake, go back and change it." / "Change my date of birth" (back to the wheels). Before, Continue was disabled with an inline message. Nothing is saved or sent either way.
- **Coachless.** The plan's physician line ("Start once your physician gives you the OK."), the plan and macro "message your coach" lines and the paused line have coachless versions; a coached client keeps the coach's name.

## WHY / WHEN / WHO
Root cause: the reveals and states were built in #310 (2c17c241, 2026-10-02) before the prototype's states pages (41-45) were final, and were never reachable on a device (B33, RECON133 F1: the `consultation_available` gate, 73e71cd5, S-REVENUE-124), so nobody compared them with the prototype.

## Parity table (prototype /home/user/workspace/specs133/shots/NN.png)
| # | Today's file | Matches | Differs and why |
|---|---|---|---|
| 37 SUM | RevealScreens `SummaryScreen` | eyebrow, headline, Roman line, sections with Edit, one Prepare button | "Your body" adds the age line (kept: it is the B2 answer the numbers use) |
| 38 PREP | RevealScreens preparing | summary dims to 30%, Roman "One moment. I'm working through your numbers.", shown at least 900 ms | the line under Roman is a static 120 pt forest hairline, not the prototype's moving sweep (unchanged from #310; a looping animation is left for a motion pass rather than added without a device check) |
| 39 MACRO | `MacroRevealScreen` | "Your daily targets" eyebrow, 64 pt serif calories (line height 80, the DS 1.25 ratio), protein / carbs / fat, Roman line, "Why these numbers", "Next: your plan", one success haptic | none |
| 40 PLAN A/B/C | `PlanRevealScreen` | program name, physician line when screened, week strip with first-day ring, "Your first session is ...", "Why this plan", "Show me around" | the "Message <coach>" text link under Show me around is not added (button count kept; Messages is not mounted before completion, and a coachless client has no coach); session length comes from the client's T4 answer ("About 30 to 45 minutes each.") instead of a fixed range per program; "How it progresses" is not added: the server sends no progression detail and an invented story would not be true. Program content (A Foundations, B Build, C Gentle Start) comes from the server (CONSULT-ALL-BE-133 seed) |
| 41 Home resume card | `PausedScreen` | place kept, Continue, support, sign out | CONSULT-ALL-M-133 owns 41 (Home is not mounted before completion; proposal in its report) |
| 42 Welcome back | ConsultationFlow resume + QuestionScreen `romanOverride` | Roman greets the client by name and names the chapter on the screen the resume lands on | prototype "We were talking about ..." becomes "You were telling me about ..." (voice guard OR-115-4: Roman never says "we") |
| 43 Summary offline | `SummaryScreen` + app-wide `OfflineBanner` | offline action label, Roman's line, answers kept, prepares by itself on the first reconnect (once per visit) | the banner is the existing app-wide one (RootNavigator), not a second one inside the flow |
| 44 Server error | `CompleteProblemScreen` | Roman's face, serif sentence, answers safe, one forest Try again, no red | none |
| 45 Under 16 | QuestionScreen `DobBody` stop | eyebrow, headline, line, "Change my date of birth", no form | none |

## Shared primitives
Headlines on the summary, problem, paused, plan and under-16 screens are the shared `Headline` (DS-PRIMITIVES-133, #577); the plan's week dots use `radius.chip`; buttons and links come through #579's re-export of the `src/ui` primitives.

## Routes and actions before -> after
| Screen | Before | After |
|---|---|---|
| SUM offline | Prepare -> network problem screen | Prepare disabled, labelled "Prepare when I'm back online"; on reconnect the plan prepares by itself (once) |
| B2 under 16 | Continue disabled, inline message | Continue -> stop screen -> "Change my date of birth" or Back -> wheels |
| All others | unchanged | unchanged |

## Truthful sweep
"I'll prepare your numbers the moment you're connected" is true: the first reconnect calls Prepare. "Nothing you've told me is lost" is true: answers are in the encrypted local draft and synced at chapter ends. The first-day ring uses the C1 date the client chose. The session length is the client's own answer. No coach line is shown to a coachless client.

## Not seen on a device
Nobody has run this on a phone. Rendered through the jest renderer only. The haptic and the offline switch need a device check.

agent 133
