**Tier:** T2 (new coach consultation screens and flow; not reachable until PR 3 routes new coaches to it)
**Why:** B02 (packages come before the coach has set up their practice, for every coach) and B03 (the questions about the coach are super thin). Prototype 77 K0 Welcome, 78 K1 Your card, 79 K2 Specialties; 75 ROLE-C, 76 CREATE-C and 86 K-LAND checked (no delta, below).
**T4 trigger scan:** auth no (Sign out on the paused screen calls the existing `onSignOut` passed in by PR 3); tenancy no; money no (no Stripe, package or invite UI); PII: the coach's own card answers, kept on the phone until completion (engine, m#620); credentials no; destructive data no.
**T3 trigger scan:** none beyond m#620 (the flow calls `coachConsultApi` only). No navigation, flag, schema or dependency change.
**Bounded T1:** 8 new files under `src/screens/coach/consultation/` (flow, frame, registry, step contract, K0-K2, 1 test file) + `src/screens/coach/README.md` (2 rows) + `src/lib/coachConsultation/draft.ts` (`synced` flag, fix round 2). 791 changed lines.

**Fix round 2 (f6cab246):** B-621-B2-1 (Sol): resume no longer compares the server's arrival time with the phone's edit time. The phone draft records `synced` (true only when the server stored exactly these answers); an unsynced phone draft always wins, the server draft wins only over a synced one (another phone), and a winning phone draft is used as is (no refill of cleared answers from the server). Draft saves are sent one at a time with the latest last, so an older snapshot can never land after a newer one. B-621-1 (Opus): Android back goes to the previous step, returns from the paused and problem screens to the step, is held while saving, and on K0 is left to the system. U-621-1 (86 K-LAND) is delivered in m#622.
**Canonical builder:** COACH-CONSULT-M-134 (claude_opus_5_5), agent 134.
**Parent owner:** operator agent 134.
**Acceptance evidence:** jest (locally one file at a time and in CI): `src/screens/coach/consultation/__tests__/CoachConsultationFlow.test.tsx` (11: K0 greeting and one forest button; K1 prefill, live card, name required, input radius 12; K2 cap of five, pill chips, nothing sent without the required answers; completion with all answers and draft removed; specific problem copy with Try again; Finish later pause and return; server draft resumes when the phone draft was already synced; typing during an in-flight save leaves the phone draft unsynced; an unsynced phone draft wins over a later-arriving older server snapshot; draft saves go one at a time, latest last, then synced; Android back steps back, returns from paused, and leaves K0 to the system). Guards run locally: `quietLuxuryDoctrine`, `truthfulCopy.guard`, `copyVoice.guard`, `reachabilityGates`, `romanCanonicalAssets`, `declaredDependencies` all pass. Typecheck and eslint of the new files clean.
**Promotion triggers:** none.

PR 2 of 3, stacked on m#620 (base `agent134/coach-consult-m-134-engine`; diff here is this PR only). PR 3: K3-K4 and routing. COACH-CONSULT-M2-134 builds K5-K8 against `CoachStepProps` (`types.ts`) and the registry in this PR.

## What changes for coaches/clients
Not visible until PR 3. Once routed, a new coach sees:
- **K0 Welcome**: "Welcome, Jordan." in serif, Roman's face and line ("I'm Roman. Let's set up your practice so your first client has somewhere good to land. About two minutes."), one forest button "Set up my practice".
- **K1 Your card**: a live preview of the card clients see (monogram, business name, name), then Your name (prefilled from sign-up, required), Business name (optional), "In a sentence or two, how do you help people?" (optional). Continue stays off until there is a name.
- **K2 Specialties**: "What do you specialise in?" with "Choose up to five." Ten pill chips; at five the rest mute and "Up to five." shows. Skip or Continue.
- Every step: back chevron, "Finish later", the five-segment bar and "Your practice · N of 5".
- **Finish later**: "Your place is kept." with Roman's line, "Continue setting up" and a quiet "Sign out" (confirmed first). Coming back opens the same step with the answers.
- A failed save says what happened in plain words (for example "You appear to be offline") with "Try again"; answers are never lost.

## Bugs
- B02: no money step inside the consultation; it is the only coach onboarding once PR 3 routes it.
- B03: the card asks name, business name and a one-line pitch with a live preview; specialties grow to ten options, up to five.

## WHY / WHEN / WHO
- Root cause: the coach setup wizard put Get paid, First package and Invite right after a thin practice step (name + six chips) in `src/navigation/CoachWizardNavigator.tsx`.
- Introduced: commit `ea2c72d1` (agent 115, 2026-10-03, split W3 of #329), merged in m#347 (2026-10-05).
- Who: agent 115 lane.

## Routes and actions, before → after
| Route / action | Before | After (this PR) |
| --- | --- | --- |
| New coach after sign-up | `CoachWizardNavigator` (practice, Get paid, package, invite, ready) | unchanged here; PR 3 renders `CoachConsultationFlow` there |
| Finish later | none | paused screen; place kept on phone and server (when deployed) |
| Android back | (wizard: native stack back) | previous step; paused/problem → the step; K0 → system |
| Sign out from onboarding | none in the wizard | paused screen, confirmed, existing sign-out (wired in PR 3) |
| Completion | wizard step 6 + complete | `POST /coach/consultation/complete`, or wizard step 6 + complete on today's backend |

## Parity (prototype)
| Prototype screen | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| 75 ROLE-C | `src/components/auth/RoleChoice.tsx` | "I coach clients" path | no delta needed |
| 76 CREATE-C | `CreateAccountScreen` ("Joining as a coach") | name, email, password; name carries into K1 | no delta needed |
| 77 K0 Welcome | `steps/K0Welcome.tsx` | "Your practice" overline, serif display "Welcome, Jordan.", Roman's line verbatim, one forest button "Set up my practice", no top bar | no staggered fade-in (calm static entry; shared `Screen`) |
| 78 K1 Your card | `steps/K1Card.tsx` | live card preview above the fields, monogram (D9), name required, optional business name and pitch | field labels are overlines (shared look) rather than the prototype's grey labels |
| 79 K2 Specialties | `steps/K2Specialties.tsx` | "Your practice · 2 of 5", "Choose up to five.", the ten options verbatim, cap of five with "Up to five." when full, Skip and Continue (off until one is chosen) | at the cap the other chips mute (prototype only shows the note) |
| 86 K-LAND (Clients) | `ClientsListScreen` + `EmptyStateNoClients` | coach lands on Clients (CoachNavigator initial tab `ClientsStack`), empty state invites the first client | not edited here (not this lane's file) |
| Frame (all) | `CoachStepFrame.tsx` | back chevron, Finish later, five segments, overline, serif question, pinned footer | segments are 2 pt hairlines in theme accent |

## Not seen on a device
Not run on Android or iOS. Not seen: keyboard over the K1 bio field on small Android screens, serif line height on K0 at large font scale, the paused screen's Sign out alert styling. Seen in a test only.

## README
`src/screens/coach/README.md`: Key files row for `consultation/` and a Backend dependencies row for the three consultation routes and their 404 fallback.

agent 134
