[133] DS-PRIMITIVES-133 follow-up to #590. Bug: B16 (owner 17:07: rounded, not rectangles). STACKED on #590 (base `agent133/ds-theme-133`, branched from #590's head a06da58d). After #590 merges I will retarget it to main, merge origin/main in, and post a new READY. Operator 18:40: agent 133 holds agent 132's files; the OK covers `nativeCardUpdate.test.tsx`. Tier: T1, presentation only. No payment logic changes.

## What
- `tokens.radius.sm`: 0 becomes 12, which removes the one exception left in #590. All of the roughly 40 `radius.sm` sites in 26 files round, including the card-payment sheet's primary button (`entitlements/dunning/paymentSheetAppearance.ts:64`, which reads `radius.sm`; that file is unchanged).
- `entitlements/dunning/__tests__/nativeCardUpdate.test.tsx:423`: asserts `radius.button` instead of 0 (title "rounded primary button").
- `themeRows133.test.tsx`: every set's `sm` equals `radius.button`.
- Doctrine rule 5, the theme README and the dunning README wording updated.

## WHY / WHEN / WHO
- `radius.sm = 0` came from df82d6eb (#52, luxury wave 2). #590 kept it at 0 only because agent 132's test asserted a square Stripe button. With the OK at 18:40, it now rounds.

## Parity table
| Prototype | Today's file | What matches | What differs and why |
|---|---|---|---|
| 00, 07 (primary button) | `theme/tokens.ts` `radius.sm`, `paymentSheetAppearance.ts` (unchanged, reads the token) | 12 pt corners like every other primary button | The prototype draws square corners; the owner ruling overrides. The Stripe sheet itself is drawn by the SDK. |

## Evidence
- Locally: nativeCardUpdate 41/41, themeRows133 4/4, quietLuxuryDoctrine 34/34, ConnectionsScreen 37/37, ConnectProviderSheet 31/31, TutorialOverlay 9/9; tsc clean.
- `coachClientWorkoutsMakeover127` sets its tab corner with a literal, so it is unaffected (it passed with `sm` 12).
- Not seen on a device, including the Stripe sheet.

agent 133
