**Tier:** T3 (new client calls to the coach consultation routes, with a fallback to today's production routes; no UI, no navigation, not reachable yet)
**Why:** B02 (packages come before the coach has set up their practice, for every coach) and B03 (the questions about the coach are super thin: today a name and six chips). Prototype 77-85 (K0-K8) and decision D13 (land on Clients).
**T4 trigger scan:** auth no; tenancy no (the routes are JwtAuthGuard + CoachGuard on the coach's own row, COACH-CONSULT-BE-134); money no (no Stripe, package or invite call); PII: the coach's own card answers (name, business name, one-line bio, specialties, practice size) are kept on this phone under `coach_consult_v1:<userId>` until completion, then removed; credentials no; destructive data no.
**T3 trigger scan:** API: `GET` / `PUT /coach/consultation`, `POST /coach/consultation/complete` (COACH-CONSULT-BE-134 "## API"). On 404/405 (today's production backend) the draft stays on the phone and completion uses the existing wizard routes (`POST /coach/onboarding/steps/1..6` with the answers on step 6, then `POST /coach/onboarding/complete`), so mobile works with the current backend (A5 rule 5). New AsyncStorage key. No schema, flag or dependency change.
**Bounded T1:** 4 new files under `src/lib/coachConsultation/` + 2 test files. No existing file changes.
**Canonical builder:** COACH-CONSULT-M-134 (claude_opus_5_5), agent 134.
**Parent owner:** operator agent 134.
**Acceptance evidence:** jest (run locally one file at a time and in CI): `src/lib/coachConsultation/__tests__/coachConsultFlow.test.ts` (9), `coachConsultApi.test.ts` (4). Typecheck and eslint of the new files clean locally.
**Promotion triggers:** none.

PR 1 of 3 (stacked): this engine, then m#621 (flow, frame, K0-K2 on `agent134/coach-consult-m-134`), then K3-K4 and the routing (`CoachWizardNavigator.tsx`, after m#576). Split in three to stay under 800 lines each.

## What changes for coaches/clients
Nothing visible yet. This adds the rules of the coach consultation that the next PRs show:
- Order K0 Welcome, K1 Your card, K2 Specialties, K3 Clients today, K4 Coaching touch, K5 Programming, K6 Your link, K7 Bring clients over (only with the importer flag on and clients today), K8 Ready. A step without a screen in the build is skipped, so the flow never dead-ends.
- Five chapters on the bar, K4 and K5 sharing chapter 4 (prototype bar: half then full).
- Specialties capped at five; card name 1-80 characters; business name and bio optional.
- Completion needs a name and the practice size; anything else may be skipped.
- Resume: the newer of the phone draft and the server draft wins.
- No money question anywhere in the consultation (B02). Get paid, first package and invite stay on the Overview checklist as optional next steps.

## Bugs
- B02 (engine part): the consultation order has no money step.
- B03 (engine part): practice answers grow from name + six chips to name, business name, one-line pitch, up to five of ten specialties, practice size, coaching touch, programming style.

## WHY / WHEN / WHO
- Root cause: the coach setup wizard was written as practice basics, then Get paid, then First package, then Invite, then Ready (`src/navigation/CoachWizardNavigator.tsx` header), with practice basics only a name and six chips.
- Introduced: commit `ea2c72d1` (agent 115, 2026-10-03, "coach wizard navigator ... split W3 of #329"), merged to main in m#347 (2026-10-05).
- Who: agent 115 lane; carried unchanged since.

## Routes and actions, before → after
| Route / action | Before | After (this PR) |
| --- | --- | --- |
| Coach onboarding screens | `CoachWizardNavigator` 5 steps | unchanged (routing moves in PR 3) |
| `GET/PUT /coach/consultation` | not called | callable from `coachConsultApi` (no caller yet) |
| `POST /coach/consultation/complete` | not called | callable; 404/405 → existing wizard step 6 + complete |

## Parity (prototype)
| Prototype screen | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| 77-85 K0-K8 order | `src/lib/coachConsultation/flow.ts` (new) | step order, K7 condition (importer on and clients today not "none"), five chapters, K4/K5 halves | none in logic; screens arrive in PR 2 and 3 |
| 79 K2 | `flow.ts` `SPECIALTY_OPTIONS` | ten options, cap five | option keys follow the backend contract |
| 80 K3 | `flow.ts` `CLIENTS_TODAY_OPTIONS` | five bands, "None yet" | wire value `none` (backend vocabulary) |

## Not seen on a device
Nothing in this PR renders. No device run.

## README
`src/lib/coachConsultation` is documented in `src/screens/coach/README.md` (Key files and Backend dependencies rows) in PR 2, where the first screen lands.

agent 134
