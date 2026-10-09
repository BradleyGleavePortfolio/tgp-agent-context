TIER: T2 (display only; no write, no new request)
JOB: COACH-CARD-134 follow-up (operator 21:4x: proposal 1 = YES). Lenses: SLICE D (LN-OPUS-D-134 + LN-SOL-D-134).
BUG IDS: B03.
DEPENDS ON: backend b#898 (adds `headline` / `specialties` to the coachless coach card). Safe before it deploys: both fields are
optional in the schema, and when they are absent the sheet looks exactly as it does today (tested).

## What
- `src/components/coachless/CoachCodeSheet.tsx` (the coach-code sheet from Settings "Add a coach code", Home and Messages; the
  one m#631 unified): under "Coach: {name}" the valid check now renders `InviteCoachCardDetails` (from m#630) with the coach's
  headline and specialties sentence. Each line renders only when present; nothing when both are absent.
- `src/api/coachlessApi.ts` `CoachCardSchema` gains `headline` (string, nullable, optional) and `specialties` (string[],
  nullable, optional). Without them zod would strip the new fields.

## Parity
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 78 K1 "Your card" (monogram tile, business overline, serif name) and the 79 K2 note "Shown later on the invite preview" | src/components/coachless/CoachCodeSheet.tsx (valid check, under "Coach: {name}") | The coach's card line and specialties reach the client at the code check, as on the join-flow invite box (m#630): same component, same rules | The prototype has no screen for this sheet, which is the app's own (m#631). No monogram tile or second card: the sheet keeps one input, one forest Join button and hairline rows. Specialties are one sentence, not chips, and "Something else" is dropped, as in m#630 |

## Not seen on a device
- Nothing here was seen on a device or simulator (iOS or Android). The evidence is jest renders and CI.
- Device check: open the coach-code sheet from Settings > Add a coach code with a valid code whose coach has a long card line
  (up to 280 characters through the bio fallback) and five specialties, at 360 pt (Android) and on a small iPhone. The lines
  should wrap under "Coach: {name}" with Join still reachable above the keyboard. A coach without the fields should look as today.

## Ownership check
`gh pr list --state open` file lists (mobile): no open PR touches CoachCodeSheet.tsx, coachlessApi.ts or src/components/invite/.

## Tests (local, heavy.sh)
- src/components/coachless/__tests__/CoachCodeSheet.coachCard.test.tsx (new) 3/3: both lines; no rows for null / []; an older
  backend without the fields still validates and shows only the name.
- CoachCodeSheet.coachSharing 2/2, AddCoachCodeScreen 9/9, CoachlessEntitlement 1/1. Targeted tsc and eslint clean.

## WHY / WHEN / WHO
- WHY: the sheet's valid line shows "Coach: {name}" only, and `CoachCardSchema` has no card fields. The consultation's K1/K2
  answers (b#894) reached the invite-box join door in m#630 but not this second join door.
- WHO: agent 134 (COACH-CARD-134).

agent 134
