# DS-PRIMITIVES-133 (agent 133 lane, builder claude_opus_5_5) — B13, B15, B16, B19, B28, B39 + QA-THEME-128 / QA-PRIM-128 (operator mail 16:58)
Worktree /home/user/workspace/wt/DS-PRIMITIVES-133-mobile. Status (19:02, SAFE STOP): m#577 and m#587 merged; m#582, m#590 and m#607 open (details in HANDOFF).

## PRs (each < 800 lines)
| PR | Branch -> base | Lines | Contents | State |
|---|---|---|---|---|
| m#577 | ds-primitives-133 -> main | +768 / -25 | Screen, PrimaryButton, TextLink, Headline, semantic radius, layout + wheel tokens, serif line heights, doctrine | MERGED 01:00Z |
| m#578 | ds-wheel-rows-133 -> ds-primitives-133 | +245 / -5 | WheelBand, QuietRow, QuietSection title | MERGED 01:03Z, but into the PR 1 branch, so NOT on main |
| m#587 | ds-wheel-rows-133 -> main | +245 / -5 | re-land of m#578 (same commit ccfd9016 plus a merge of origin/main) | READY @ ea77f61b |
| m#582 | ds-insets-133 -> main (retargeted) | +90 / -50 | 8 lane files off SafeAreaView from 'react-native', radius tokens, guard test | READY @ cb675bbe |
| m#590 | ds-theme-133 -> main | +160 / -78 | every Radius/radius rounds except `radius.sm` (commented exception), one grey hairline, Haptics switch (U1), timing release, consultationQuietLook:29, Finish press haptic light | READY @ a06da58d (2nd push fixed a real double success haptic) |
| m#607 | ds-radius-sm-133 -> ds-theme-133 (stacked) | +9 / -14 | `radius.sm` 0 -> 12 (removes the exception), nativeCardUpdate.test.tsx:423 -> `radius.button` (operator 18:40 OK; 133 holds 132's files) | READY @ 534bad21; after m#590 merges: `gh pr edit 607 --base main`, merge origin/main, new READY |

## NEED (operator)
- nativeCardUpdate.test.tsx:423: cleared (operator 18:40; agent 133 holds 132's files). m#607 rounds `radius.sm` and updates :423.
- consultationQuietLook.test.tsx:29: done in m#590 (operator 18:06 YES). CONSULT-PARITY's m#579 changes the same line to `radius.pill`, so whichever merges second merges origin/main and keeps theirs.
- Process: m#578 was merged into the PR 1 branch after m#577 had merged, so WheelBand/QuietRow never reached main. m#587 re-lands it. Anything that imports `src/ui/wheel` or `QuietRow` (CONSULT-PARITY m#581?) needs m#587 first.
- Scope overlap: APPLY-INSETS-133 can drop More, Plan and Membership (m#582 covers them). auth/WelcomeScreen is still on react-native SafeAreaView (AUTH-ENTRY-133).

## API
Import everything from `src/ui` (barrel `src/ui/index.ts`). Tokens from `src/theme/tokens` (also re-exported by `src/theme`).
Never write your own button, screen wrapper or headline; ask in your report if a prop is missing.

### Tokens (src/theme/tokens.ts)
- `layout` = { gutter 24, statusBarGap 12, footerTopGap 12, footerBottomMin 16, footerBottomGap 8, footerItemGap 8, buttonHeight 54,
  touchMin 44, rowMinHeight 56, sectionPadY 18, sectionGap 24 }
- `radius` semantic = { button 12, input 12, card 16, sheet 24, chip 999, control 6 (boxes under 28 pt) } (owner 17:07). Legacy sm/md/lg/xl/2xl:
  do not use; m#590 moves md/lg/xl/2xl and every `Radius.*` to the rounded scale (`radius.sm` waits on agent 132).
- `wheel` = { rowHeight 44, visibleRows 5, bandHairline 1, selected {Cormorant 28/36}, near {21/28, opacity .55}, far {18/24, opacity .3} }
- Serif roles now: display 44/55, h1 32/40, h2 24/30, h3 20/25; `SERIF_MIN_LINE_RATIO` = 1.25; `serifRoles`.

### Which token each primitive uses
| Primitive | Radius | Other tokens |
|---|---|---|
| PrimaryButton | `radius.button` 12 | `layout.buttonHeight` 54, `layout.gutter`, semantic accent / textOnAccent / disabledBg / textOnDisabled, `typography.bodyMd` |
| TextLink / QuietTextButton | none (text only) | `layout.touchMin` 44, `typography.body` / `bodySmall`, textMuted / accentText / textPrimary |
| Screen / ScreenTopBar | none | `layout.gutter`, `statusBarGap`, `footerTopGap`, `footerBottomMin`, `footerBottomGap`, `footerItemGap`, `touchMin`; bgPrimary |
| Headline / Lede / AccentRule | none | `typography.display/h1/h2/h3` (>= 1.25 x), `body` / `bodySmall`; AccentRule `colors.camel` 48 x 1 |
| QuietRow (m#587) | none (hairline row) | `layout.rowMinHeight` 56, semantic border, `typography.body` |
| QuietSection (m#587 adds `title`) | none | `layout.sectionPadY` 18 + `layout.sectionGap` 24, semantic border |
| WheelBand (m#587) | none (hairlines) | `wheel.*`, semantic border |
| Your cards / inputs / sheets / chips | `radius.card` 16 / `radius.input` 12 / `radius.sheet` 24 top corners / `radius.chip` | never a literal radius; never `radius.sm/md/lg` in new code |

### Spacing: which scale wins
`tokens.spacing` (xs 4, sm 8, md 12, lg 16, xl 24, 2xl 32, 3xl 48, 4xl 64) is canonical. The legacy `Spacing` from `src/theme` (md 16, lg 24,
xl 32) reuses the key names with different values: do not use it in new code. Page margins and screen rhythm come from `layout`.

### Serif line heights (B15)
display 44/55, h1 32/40, h2 24/30, h3 20/25 (`SERIF_MIN_LINE_RATIO` 1.25). The operator's 53/39 (1.2x) is still below Cormorant's own
1.211 em line box (hhea 924 + 287), so I used 1.25; both satisfy the >= 1.2 rule.

### `Screen` — src/ui/layout/Screen.tsx
`<Screen edges? scroll? header? footer? keyboardAware? centerContent? refreshControl? contentStyle? style? testID?>{children}</Screen>`
- Insets from react-native-safe-area-context (no provider = zero insets). Top = insets.top + layout.statusBarGap when 'top' in edges.
- `edges`: default ['top','bottom']. Tab root screens: ['top'] (tab bar owns the bottom). Under a native stack header: ['bottom'],
  or [] when also inside a tab.
- `scroll` default true (ScrollView, keyboardShouldPersistTaps handled). `scroll={false}` = fixed View (e.g. AUTH 00).
- `header`: rendered above the scroll area (use `ScreenTopBar`). `footer`: pinned under the scroll, gutter 24, items 8 apart,
  bottom = max(insets.bottom, 16) + 8; keyboard-aware (KeyboardAvoidingView, iOS padding / Android height) when `keyboardAware` (default true).
- `centerContent`: content vertically centred (AUTH 00, W1).
- testIDs: `<testID>`, `<testID>-scroll`, `<testID>-footer`.

### `ScreenTopBar` — src/ui/layout/Screen.tsx
`<ScreenTopBar onBack? backLabel?="Back" trailing? testID?>` — 44 pt chevron-back on the left, a trailing slot on the right
(e.g. `<TextLink label="Finish later" size="small" />`). Gutter 24 (chevron optically aligned).

### `PrimaryButton` — src/ui/buttons/PrimaryButton.tsx (the one filled forest button per screen)
`<PrimaryButton label onPress disabled? loading? haptic?=true accessibilityHint? testID? style? />`
- Full width, 54 pt, radius.button 12, accent fill + textOnAccent label (Inter 500 16, sentence case), pressed = deeper fill,
  disabled = disabledBg/textOnDisabled (no opacity), loading = spinner, presses ignored, accessibilityState {busy, disabled}.
- Light haptic through HapticService (honours the Settings switch).

### `TextLink` / `QuietTextButton` — src/ui/buttons/PrimaryButton.tsx
`<TextLink label onPress tone?='muted'|'accent'|'ink' size?='body'|'small' underline?=true align?='center'|'start'|'end'
 role?='button'|'link' disabled? accessibilityHint? testID? />` — 44 pt target, no fill. Prototype "Log in", "Finish later",
"I have an invite code". `QuietTextButton` = TextLink with tone 'accent', underline false, align 'start' (inline Try again).

### `Headline`, `Lede`, `Overline`, `AccentRule` — src/ui/text/Headline.tsx (+ Overline = QuietOverline)
- `<Headline level?='h1'|'display'|'h2'|'h3' align? tone?='ink'|'muted' numberOfLines? testID? style?>` serif, accessibilityRole header,
  lineHeight from the token (>= 1.25 x size, never clips descenders).
- `<Lede size?='body'|'small'>` the muted line under a headline (prototype "Energy needs change with age.").
- `Overline` = `QuietOverline` (11 pt eyebrow token, textMuted). `<AccentRule />` the short 48 pt camel hairline (prototype 00).

### `QuietRow` — src/ui/rows/QuietRow.tsx (m#587)
`<QuietRow label value? detail? onPress? chevron? accessibilityHint? testID? />` — min 56 pt, padding 16 vertical, bottom hairline
(semantic border #DCD5CC), Inter body label, tabular muted value, outline chevron when pressable, light selection haptic.

### `QuietSection` (extended in m#587, same file src/ui/sections/QuietSection.tsx)
New optional `title` prop renders the Overline; rhythm 18 + 24 now from `layout.sectionPadY` / `layout.sectionGap`. Existing API unchanged.

### `WheelBand`, `wheelValueStyle` — src/ui/wheel/WheelBand.tsx (m#587; CONSULT-PARITY-133 applies these to consultation wheels)
- `<WheelBand rowHeight? visibleRows? testID? />` — absolute, pointerEvents none, two hairlines framing the middle row, NO fill.
  Render it as the FIRST child of the wheel frame (before the ScrollView) so it sits behind the values on both platforms.
- `wheelFrameStyle(rowHeight?, visibleRows?)` -> { height, overflow hidden }.
- `wheelValueStyle(distance, semanticColors)` -> text style: 0 selected ink serif 28, 1 near muted 21 at .55, >=2 far 18 at .3.

## Decisions
- Serif line heights: 55 and 40, not the operator's 53 and 39. Cormorant's own line box is 1.211 em, so 1.2x would still compress it on Android. Both pass the 1.2 floor.
- Radius (Q10b): the semantic keys come from the operator defaults (button/input 12, card 16, sheet 24, chip pill), and I added `control` 6 for boxes under 28 pt. The prototype frames show square corners; the owner's ruling overrides them.
- Spacing: `tokens.spacing` is canonical and the legacy `Spacing` is deprecated, with no renames. The primitives use `layout`.
- Hairline: #DCD5CC (`semanticColors.border`) everywhere. In the held ds-theme-133 branch, ThemeProvider maps `colors.border` and `divider` to it.
- Haptics: HapticPressable and utils/haptics call HapticService (held branch). The press-in keeps its zero-bounce spring and the release is a 120 ms timing, so the existing reduced-motion tests stand.

## HANDOFF (SAFE STOP, owner 18:57)
| PR | Base | Exact head | State | Next |
|---|---|---|---|---|
| m#577 | main | 516d6a46 | MERGED 01:00Z | none |
| m#587 (re-land of m#578) | main | ea77f61b | MERGED | none |
| m#582 insets | main | cb675bbeb37b73b270438427bf0e5695ad159bbf | CI green. Code APPROVE from LN-OPUS-A. The 3 REQUEST CHANGES (SOL-A, SOL-B, OPUS-B) were all about the TrustExplainerSheet parity row; fixed in the PR body with no push, and FIX ROUND 2 posted 19:01 at the same head | lenses re-check the body row; then merge |
| m#590 theme | main | a0efeb00be600478db4d5fe4b86edb44d843d60f | 3 APPROVE (SOL-C, SOL-A, OPUS-B) at a06da58d. The merge-main push at 19:00 resolved an ActiveWorkoutScreen conflict by taking main's version (REDO-LIVE-133 PrimaryButton), so the PR no longer touches that file. CI green; FIX ROUND 2 READY posted 19:10 | lenses do a delta-only review (merge commit only); then merge |
| m#607 radius.sm | agent133/ds-theme-133 (stacked) | 534bad2177c3867dcdd2bbe282b778acfbeb6317 | APPROVE from SOL-A and OPUS-B, CI green | after m#590 merges: `gh pr edit 607 -R BradleyGleavePortfolio/growth-project-mobile --base main`, then on agent133/ds-radius-sm-133 `git merge origin/main`, push once, wait for green CI, post READY at the new head. The merge loop only merges base-main PRs |

Not started or unfinished: none in code. The 18:33 chevrons and 18:50 prototype-74 follow-ups were cancelled by the 18:55 drain and never begun.
First thing for the next agent: once m#590 merges, retarget m#607 as described above.
For CONSULT-PARITY-133: WheelBand is on main (m#587). The 22 pt checkbox should use `radius.control`. If m#579 merges after m#590, their consultationQuietLook line 29 (`radius.pill`) wins in the merge.
Not seen on a device: none of these PRs.
