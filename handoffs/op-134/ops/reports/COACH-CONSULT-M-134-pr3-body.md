**Tier:** T3 (K3 and K4 screens, 86 K-LAND no-clients state, and routing: the coach gate now opens the coach consultation for every new coach)
**Why:** B03 (the questions about the coach are super thin) and B02 (routing: every new coach goes to the consultation; money steps only after, optional). Prototype 80 K3 Clients today, 81 K4 Coaching touch, 86 K-LAND (Clients, U-621-1).
**T4 trigger scan:** auth no; tenancy no; money no; PII: practice size and coaching touch (the coach's own answers), kept on the phone until completion (m#620); credentials no; destructive data no.
**T3 trigger scan:** navigation: `CoachWizardNavigator`'s default export (mounted by `RootNavigator` while `GET /coach/onboarding` reads incomplete) renders `CoachConsultationFlow` instead of the five-step setup. No RootNavigator, flag, backend or dependency change; no flag gates it (every new coach, every build).
**Bounded T1:** 2 new step files + 1 hook + 2 registry lines; `CoachWizardNavigator.tsx` (+52/-1: new default export, old wizard renamed `CoachSetupWizard`); `src/ui/empty-states/EmptyStateNoClients.tsx` (86 K-LAND) + its look test + empty-states README row; 2 new test files; 3 tests updated (K2 Continue now opens K3; two legacy-wizard tests import `CoachSetupWizard`); coach and navigation README rows. 516 changed lines (diff against main).
**Canonical builder:** COACH-CONSULT-M-134 (claude_opus_5_5), agent 134.
**Parent owner:** operator agent 134.
**Acceptance evidence:** jest (locally one file at a time and in CI): `coachConsultRouting.test.tsx` (4: the gate opens K0 not practice basics or Get paid; completion on today's backend walks the wizard record to step 6 + complete and opens the coach app, with no package, Connect or invite call; Sign out from the paused screen is confirmed first; no route reaches the earlier wizard: only `RootNavigator` imports the navigator, nothing imports `CoachSetupWizard` or navigates to `CoachWizardStep*`), `coachConsultK3K4.test.tsx` (4), `CoachConsultationFlow.test.tsx` (11), `emptyStateLook.test.tsx` (8: 86 K-LAND Roman neutral face, h2 "No clients yet.", one forest "Share my link" radius 12 and 44 pt, quiet Copy with the code, a plain line when the share sheet does not open), `ClientsListLookup124` (18, real empty-roster Share and Copy), `EmptyState` (17), `InviteCtaWiring` (6), `romanCanonicalAssets` (10); unchanged and passing: `coachSetupRound2` (20), `CoachWizardEdges132` (19), `coachSetup` (17), `coachDay1Hunt05` (6), `coachNavigation` (5), guards `quietLuxuryDoctrine`, `reachabilityGates`, `truthfulCopy.guard`, `copyVoice.guard`. Typecheck (scoped) and eslint clean.
**Promotion triggers:** none.

PR 3 of 3 (m#620 and m#621 merged). m#576 merged first; this branch then merged origin/main and made the navigator edit (b046012e); after that it merged m#621's fix round 2, added 86 K-LAND (76c7f536) merged origin/main after m#621 merged (6c26ab65). Merged at 6c26ab65; U-622-B2-1 (Share my link without a link) is fixed in the follow-up m#636. Base: main; the diff is the 15 files listed under Bounded T1.

## What changes for coaches/clients
- **K3 Clients today**: "How many clients do you coach today?" with five pill choices (None yet, 1 to 10, 11 to 25, 26 to 50, More than 50). Required, no Skip; a tap moves on by itself after 280 ms so the choice is seen. Back during that moment cancels it.
- **K4 Coaching touch**: "How hands-on do you like to be?" with three hairline radio rows (Close guidance, Frequent check-ins; Balanced, A weekly check-in; Light touch, Clients mostly self-direct). Optional with Skip; a tap moves on by itself.
- Until K5-K8 (COACH-CONSULT-M2-134) land, K4 completes the consultation.
- **Routing (B02)**: every new coach (sign-up as a coach, or a coach whose setup is not complete) now opens on K0 Welcome. Get paid, first package and invite are never asked before; after the consultation the coach lands on Clients and finds them as optional next steps on the Overview checklist. A coach who started the old setup also gets the consultation, prefilled with their name.
- **Finish later** opens the paused screen with Sign out (confirmed first); signing back in opens the same step.
- **86 K-LAND (Clients, no clients yet)**: Roman's neutral face, "No clients yet.", "Share your link and your first client lands here." and one forest "Share my link" (the share sheet with the invite code and link). With no code yet the button is "Open invite codes". A quiet "Copy code <code>" stays. The same state shows on Messages when there are no clients. Replaces "Your first client is one link away." with the code box.

## Bugs
- B03: practice size and coaching touch are asked (today neither is).
- B02: the coach gate opens the consultation; no money step before it, for every coach, in every build (no flag).

## WHY / WHEN / WHO
- Root cause: the coach setup wizard asked only a name and six chips about the practice, then went to Get paid, First package and Invite (`src/navigation/CoachWizardNavigator.tsx`).
- Introduced: commit `ea2c72d1` (agent 115, 2026-10-03, split W3 of #329), merged in m#347 (2026-10-05).
- Who: agent 115 lane.

## Routes and actions, before → after
| Route / action | Before | After (this PR) |
| --- | --- | --- |
| K2 Continue / Skip | (m#621) completes | opens K3 |
| K3 choice | none | saves `clients_today`, moves to K4 |
| K4 choice / Skip | none | saves or clears `coaching_touch`, then the next built step (today: completion) |
| Coach gate (`RootNavigator` → `CoachWizardNavigator` default) | five-step setup: practice basics → Get paid → first package → invite → ready | coach consultation K0 → K4 (→ K8 with M2) → complete → coach app on Clients |
| Get paid / first package / invite | wizard steps 2-4, before the coach app | Overview checklist only (CoachSetupChecklist → Settings > Coach setup / Packages), after the consultation, optional |
| Sign out during onboarding | not offered in the wizard | paused screen, confirmed, `signOut(user.id)` |
| Clients / Messages with no clients | "Your first client is one link away.", code box, "Share your code", "Copy code" | Roman neutral, "No clients yet.", "Share my link" (Share sheet), "Copy code <code>"; "Open invite codes" when there is no code |

**Every coach entry reaches the consultation (LN-SOL-C2-134 advisory):** the only mount of `CoachWizardNavigator` is `RootNavigator.tsx` (the coach gate while `GET /coach/onboarding` reads incomplete), and its default export is the consultation. The earlier wizard (`CoachSetupWizard`, steps `CoachWizardStep1-5`) is imported by no app file and no app file navigates to its steps (pushTapRouter only names them in a comment; no deep link maps to them). The post-onboarding `CoachSetup` screen (Settings, reached from Money, Team profile and the Overview cards) shows the Get paid panel and the invite card, not the wizard. So `advanceWizardTo`'s prior-step edit path (`src/api/coachSetupApi.ts:301-325`) is reached only by the consultation's fallback completion, which always walks forward to step 6. Checked by the route-list test above.

## Parity (prototype)
| Prototype screen | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| 80 K3 Clients today | `steps/K3ClientsToday.tsx` | "Your practice · 3 of 5", headline verbatim, five single-select pill chips with a check, required, auto-advance, no footer | wire value `none` for "None yet" (backend vocabulary; prototype `0`) |
| 81 K4 Coaching touch | `steps/K4CoachingTouch.tsx` | "Your practice · 4 of 5", bar half of chapter 4, headline verbatim, three radio rows with supporting lines, Skip, auto-advance | none |
| 77 K0 entry | `CoachWizardNavigator.tsx` default | a new coach's first screen after sign-up is K0 Welcome | none |
| 86 K-LAND | `ClientsListScreen` (initial tab `ClientsStack`) + `src/ui/empty-states/EmptyStateNoClients.tsx` | after completion the coach app opens on Clients; Roman neutral 64, serif h2 "No clients yet.", the body line verbatim, one forest "Share my link" | the screen keeps today's roster header (date overline, "Clients", count, Invite pill (already quiet on an empty roster, so the one forest button is Share my link), push card, privacy line, search) instead of the shot's "Your roster" overline and serif "Clients" (REDO-COACH-133's header, not changed here; Proposed, needs operator, default keep); the button sits under the copy, not pinned to the bottom, because the roster list scrolls; a quiet "Copy code <code>" is added so the code is still visible; Finish later goes to a paused screen, not K-LAND, because the coach app opens only after completion (Proposed, needs operator) |

## Not seen on a device
Not run on Android or iOS. Not seen: chip wrapping of "More than 50" at large font scale on a 360 dp Android screen; the 86 empty state's spacing under today's roster header; radio row press feedback; the hand-off from the last step to the coach app (RootNavigator re-check after `authEvents.emit()`), seen in a test only up to the emit.

## README
`src/screens/coach/README.md` Key files row lists K3 and K4; `src/navigation/README.md` `CoachWizardNavigator.tsx` row describes the consultation default and the unrouted `CoachSetupWizard`; `src/ui/empty-states/README.md` `EmptyStateNoClients` look row describes 86.

agent 134
