TIER: T2 (join-flow display; no write, no new request)
JOB: COACH-CARD-134 (WAVE 1e, decision 134-1), mobile point 3. Lenses: SLICE D (LN-OPUS-D-134 + LN-SOL-D-134).
BUG IDS: B03 (consultation answers collected but unused), 134-1.
DEPENDS ON: backend b#897 (adds `headline` / `specialties` to `GET /invite/:code/preview`). Safe before it deploys: the fields are
optional and absent today, so the screens render exactly as now.

## What
- New `src/components/invite/InviteCoachCardDetails.tsx`: under "You will be paired with {coach}." it renders the coach's
  headline (Inter 14, text primary) and one specialties sentence ("Specialises in strength, fat loss and beginners.", Inter 14,
  text muted). Each line renders only when present; nothing at all when both are absent (no blank rows). Labels come from the
  merged coach consultation vocabulary (`src/lib/coachConsultation/flow.ts` SPECIALTY_OPTIONS); unknown keys and "Something
  else" are dropped. Plain text on the page: no box, no chips, no new colour, theme tokens only, no first person, no exclamation.
- Wired in the two join-flow invite boxes: `RoleSelectionScreen` (testID `role-coach-card`) and `CreateAccountScreen`
  (testID `create-coach-card`).
- `InvitePreview` (src/services/api.ts) gains optional `headline?: string | null` and `specialties?: string[] | null`.

## Parity (prototype 78-K1 card, 79-K2 note)
| Prototype screen | Today's file | What matches | What differs and why |
|---|---|---|---|
| 78 K1 "Your card" preview card (monogram tile, business overline, serif name) | src/screens/auth/RoleSelectionScreen.tsx and CreateAccountScreen.tsx invite box ("You will be paired with ...") + src/components/invite/InviteCoachCardDetails.tsx | The coach's own card answers reach the client: headline under the coach name, as entered | No monogram tile and no separate serif card here: the invite box is a form field area with one forest Continue/Create button; a second card block would add a box (doctrine: hairlines, no cream card fills) and compete with the form. The coach name stays the only serif line (RoleSelection) as before |
| 79 K2 notes "Optional, up to five. Shown later on the invite preview." | same files | Specialties shown on the invite preview, at most five, K2 labels from the merged vocabulary, only when the coach chose any | One plain sentence ("Specialises in strength, fat loss and beginners.") instead of chips: doctrine has no category chips on read-only text; "Something else" is dropped (meaningless to a client) |

## Not seen on a device
- Nothing in this PR was seen on a device or simulator (iOS or Android). Evidence is jest renders only (tests below) and CI.
- To check on a device: RoleSelection and CreateAccount with a valid code whose coach has a 120-character headline and five
  specialties, at 360 pt width (Android) and on a small iPhone; the lines should wrap under the paired line with no clipping, and
  a coach without the fields should look exactly as today.

## Ownership check (entry point 3)
`gh pr diff --name-only` on m#579 m#581 m#621 m#622 m#623: none touches RoleSelectionScreen.tsx, CreateAccountScreen.tsx,
src/services/api.ts or src/components/invite/.

## Tests (local, heavy.sh)
- src/components/invite/__tests__/InviteCoachCardDetails.test.tsx (new) 4/4: both lines; only the present line; nothing for
  null / [] / missing fields; unknown keys and "other" dropped, "and" join.
- src/screens/auth/__tests__/CreateAccountScreen.test.tsx 82/82 (2 new: card lines after paste; no rows when the preview has none).
- src/screens/auth/__tests__/RoleSelectionRetry.test.tsx 20/20 (1 new: card lines; no rows for a coach without them).
- Re-run after `git merge origin/main`: 102/102. Targeted tsc on the changed files and specs: clean. eslint: 0 errors
  (pre-existing warnings only).

## WHY / WHEN / WHO
- WHY: the join-flow line "You will be paired with ..." (e2eb724a, 2026-04-26, "platform: invite-gated signup, Google attach,
  structured-context AI (#56)") shows the coach's name only; the consultation's card answers (b#894, 2026-10-08) had no client
  surface, so the coach typed them for nothing.
- WHO: agent 134 (COACH-CARD-134).

agent 134
