[133] DS-PRIMITIVES-133 PR 1 of 3. Bugs: B13, B15, B16, B28 (B19 and B39 follow in PR 2 and PR 4). Owner ruling 17:07 (Q10b, decision 133-4 answered: rounded corners). Absorbs QA-PRIM-128 (DESIGN-QA-128) for the button, wrapper and headline primitives. Tier: T2 (shared visual tokens), mobile presentation only.

## What
- `src/ui/layout/Screen.tsx`: `Screen` + `ScreenTopBar`. Insets come from react-native-safe-area-context, so Android edge-to-edge gets the same clearance as iOS; 12 pt breathing room under the status bar (`layout.statusBarGap`); a pinned, keyboard-aware footer at `max(insets.bottom, 16) + 8`; `edges` for tab roots and stack headers; no provider = zero insets.
- `src/ui/buttons/PrimaryButton.tsx`: `PrimaryButton` (forest fill, bone label, full width, 54 pt as measured on prototype 00/07, `radius.button` 12, pressed veil, disabled tokens without opacity, loading spinner + busy, light impact through HapticService so the Haptics switch is honoured, no spring), `TextLink` (44 pt, underlined, muted/accent/ink), `QuietTextButton`.
- `src/ui/text/Headline.tsx`: `Headline` (serif, header role), `Lede`, `AccentRule`; `src/ui/index.ts` also exports `Overline` (= the existing `QuietOverline`, not duplicated).
- `src/theme/tokens.ts`: semantic radius `button 12, input 12, card 16, sheet 24, chip 999, control 6` (owner 17:07); `layout` and `wheel` tokens; serif line heights display 44/55, h1 32/40, h2 24/30, h3 20/25 with `SERIF_MIN_LINE_RATIO` 1.25 (Cormorant's own line box is 1.211 em, so 1.2 would still compress it). Legacy `Typography` in `theme/index.ts` follows.
- Doctrine rule 5 and the checklist rewritten for rounded corners; new section 10 (build client screens from `src/ui`, no SafeAreaView from 'react-native').
- Not in this PR (to stay under 800 lines and keep CI green): PR 2 `WheelBand` + `QuietRow` + `QuietSection title`; PR 3 legacy radius keys (`radius.sm/md/lg`, `Radius.*`) moved to the rounded scale, one grey hairline, Haptics switch in HapticPressable/utils/haptics, timing release (blocked on one test line in agent 132's lane, see report); PR 4 the 8 lane-133 screens onto `Screen`.

## WHY / WHEN / WHO
- B15: `typography.display` 44/46 and `h1` 32/35 (ratio 1.05 and 1.09) are below Cormorant's 1.211 em line box, so Android compresses the line and clips letters. Introduced by df82d6eb (#52, luxury wave 2).
- B16: `radius.sm = 0` for buttons, `lg = 4` for cards, same commit df82d6eb (#52); doctrine rule 5 enforced 4. The owner ruled rounded at 17:07.
- B13/B28: client screens import `SafeAreaView` from 'react-native' (iOS only; on Android edge-to-edge it pads nothing), first in 4faec4a8 (#53) and copied since; there was no shared wrapper, so each builder wrote its own (DESIGN-QA-128).

## Parity table
| Prototype | Today's file | What matches | What differs and why |
|---|---|---|---|
| 00 AUTH | `ui/layout/Screen` + `ui/buttons/PrimaryButton` + `ui/text/Headline` (WelcomeScreen adopts them in AUTH-ENTRY-133) | 24 pt gutters, 54 pt full-width forest button with bone sentence-case label, underlined "Log in" link 8 pt below, footer just above the home indicator, eyebrow + display serif + 48 pt camel rule + lede | Corners 12 pt, not square: owner ruling 17:07 overrides the prototype. Footer sits 8 pt higher than the prototype on iPhone (42 vs 35 pt from the bottom) for Android gesture-bar clearance. |
| 03 W1 | `Screen centerContent` + `Headline` | centred serif headline, one primary | Roman line stays CONSULT-PARITY's component. |
| 07 B2, 08 B3, 09 B4 | `Screen` (footer), `PrimaryButton`, tokens `wheel` | Continue button size and position, 44 pt wheel rows | `WheelBand` (hairlines behind the selected value) ships in PR 2; CONSULT-PARITY applies it. |
| 37 SUM | `Headline level="h1"`, `PrimaryButton` | serif title, one forest action | Layout is CONSULT-PARITY's. |

## Evidence
- Rendered through the tests' renderer at 360x800 (insets 24/24) and 390x844 (47/34): status-bar gap, footer padding, gutter, button width, one forest fill per screen (`src/ui/__tests__/primitives.test.tsx`).
- `src/theme/__tests__/serifLineHeight.test.ts`: every serif role in tokens, theme/index, constants/theme and wheel >= 1.25 x size.
- `quietLuxuryDoctrine.test.ts`: radius tokens, no literal radius and no react-native SafeAreaView in `src/ui` primitives, doctrine no longer asks for 4 pt.
- Not seen on a device. No screen adopts the primitives in this PR, so nothing on screen changes except serif line heights (all headings that use the tokens get 3-9 pt taller lines).

## Tests run locally
primitives.test.tsx 13/13, serifLineHeight.test.ts 9/9, quietLuxuryDoctrine.test.ts 34/34, emptyStateLook, launchLegibility, contrastTokens pass; tsc clean; eslint 0 errors.

agent 133
