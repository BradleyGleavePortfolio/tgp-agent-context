[133] DS-PRIMITIVES-133 theme PR. Bugs: B16 (rounded corners everywhere, owner 17:07 Q10b), plus DESIGN-QA-128 QA-THEME-128 rows and U1. REDO-AUDIT-133 section 5, items 1, 4 and 5. Operator 18:06 approved the consultation test line and the one exception. Tier: T2 shared tokens, mobile presentation only.

## What
- **Radius, both sets (REDO-AUDIT-133 5.1):**
  - `tokens.radius` md / lg / xl / 2xl change from 2 / 4 / 4 / 4 to 12 / 16 / 16 / 24.
  - `theme/index Radius` sm / md / lg / xl / full become 12 / 12 / 16 / 16 / 999, and `constants/theme Radius` follows.
  - Every old `Radius.*` / `radius.*` user rounds in this PR, with one exception: `tokens.radius.sm` stays 0, commented "awaits agent 132 OK, nativeCardUpdate.test.tsx:423". The card-payment sheet button (`entitlements/dunning/paymentSheetAppearance.ts:64`, agent 132's file) reads `radius.sm`, and its test asserts 0.
  - Because that file is outside my lane, the exception can only sit on the `radius.sm` key. That key has about 40 other users in 26 files (wearables, community, tutorial, coachless, Roman composer, some coach screens), and they stay square until the 2-line follow-up after agent 132 says OK: `radius.sm: 12` plus the test line.
- **One hairline (5.4):** ThemeProvider `colors.border` and `colors.divider` = `semanticColors.border` (#DCD5CC). This removes the camel border spread from `constants/colors.ts:27-28`.
- **Haptics (5.5, U1):**
  - HapticPressable and `utils/haptics` go through HapticService, so the Settings Haptics switch now works everywhere. The lookup is lazy, so partial test mocks do not crash.
  - The release spring (bounciness 3) becomes a 120 ms `Animated.timing`. Press-in keeps its zero-bounce scale, and Reduce Motion behaviour is unchanged.
- `ui/empty-states` (EmptyState, EmptyStateNoClients), `SkeletonClientCard` and `components/EmptyState` use semantic keys.
- Tests: `consultationQuietLook.test.tsx:29` asserts `radius.lg` instead of 4 (lane 133, operator 18:06). `emptyStateLook` expects HapticService. New `theme/__tests__/themeRows133.test.tsx`.
- Doctrine rule 5, theme README and components README updated.

## WHY / WHEN / WHO
- Square corners: `radius` sm 0 / md 2 / lg 4 and `Radius` came in with df82d6eb (#52, luxury wave 2). The owner ruled rounded at 17:07.
- Camel hairline: ThemeProvider spread `constants/colors` border/divider. This predates the semantic tokens and was found by DESIGN-QA-128 (drift 1).
- U1: HapticPressable called expo-haptics directly, so the Settings switch (HapticService) did not apply. Found by DESIGN-QA-128 U1.

## Parity table
| Prototype | Today's file | What matches | What differs and why |
|---|---|---|---|
| 00, 07-09, 37 (buttons, inputs, cards, sheets) | `theme/tokens.ts`, `theme/index.ts`, `constants/theme.ts` | buttons and inputs 12, cards 16, sheet top corners 24, chips pill | The prototype draws square corners; the owner's 17:07 ruling overrides. `radius.sm` users stay square until agent 132's OK (above). |
| all screens (hairlines) | `theme/ThemeProvider.tsx` | one grey #DCD5CC hairline | none |

## Evidence
Run locally:
- themeRows133 4/4
- consultationQuietLook 17/17
- nativeCardUpdate 41/41 (unchanged)
- emptyStateLook 7/7
- EmptyState 17/17
- HapticPressable 3/3, reducedMotion 2/2, accessibility125 3/3
- haptics.service 13/13
- aiEntry 7/7, aiBuilder 14/14, aiFunLayer 7/7
- InviteAndVerifiedVisual 11/11
- privacyDataLook 12/12
- LogScreen.foodPortions 6/6
- quietLuxuryDoctrine 34/34

tsc is clean. Not seen on a device.

If CONSULT-PARITY's #579 merges first, I will merge origin/main (it changes the same test line to `radius.pill`; theirs wins).

agent 133
