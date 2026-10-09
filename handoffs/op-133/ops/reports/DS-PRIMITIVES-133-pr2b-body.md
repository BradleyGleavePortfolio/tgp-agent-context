[133] DS-PRIMITIVES-133 PR 2 of 4. Bug: B19. Re-opened against main. #578 (identical content) was merged at 01:03Z into the PR 1 branch `agent133/ds-primitives-133` after #577 had already merged, so it never reached main. This PR carries the same commit ccfd9016 plus a merge of origin/main. No code change from #578. Tier: T1 mobile presentation.

## What
- `src/ui/wheel/WheelBand.tsx`: `WheelBand` (two 1 pt hairlines framing the middle row, transparent, pointerEvents none, meant as the FIRST child of the wheel frame so it sits behind the values on both platforms), `wheelFrameStyle`, `wheelBandStyle`, `wheelValueStyle(distance, colors)` (selected ink serif 28/36; neighbours muted 21/28 at 0.55; farther 18/24 at 0.3).
- `src/ui/rows/QuietRow.tsx`: one quiet list row (QA-PRIM-128): 56 pt, hairline bottom in the semantic grey, Inter label, muted tabular value, outline chevron when it navigates, selection haptic through HapticService.
- `src/ui/sections/QuietSection.tsx` extended (not duplicated): optional `title` renders the overline as a header; rhythm 18 + 24 from `layout.sectionPadY` / `layout.sectionGap` (AUD-FIN-DESIGN-129 default).
- CONSULT-PARITY-133 applies `WheelBand` to `screens/consultation/components.tsx`; this PR does not edit consultation files.

## WHY / WHEN / WHO
- B19: the S5 birth-year wheel draws its selection band over the scroller and hides the year (owner report). The lean LeanQ5 wheel and the consultation `Wheel` each style their own band (`consultation/components.tsx:711-721`); there was no shared band style, so each builder chose its own. Consultation wheel from the consultation build (screens/consultation, agent 128-129 era); shared band missing since the design system's first wave df82d6eb (#52).

## Parity table
| Prototype | Today's file | What matches | What differs and why |
|---|---|---|---|
| 07 B2 Date of birth | `ui/wheel/WheelBand` (applied by CONSULT-PARITY) | 44 pt rows, five visible, two hairlines framing the selected row, selected value larger in ink serif, neighbours fade | Android shows the same wheel (prototype note says Android may use a calendar; the app keeps the wheel for one flow). |
| 08 B3 Height and weight | same | 44 pt rows, adjustable a11y stays in the consultation Wheel | none |
| 09 B4 Goal weight | same | same band | none |

## Evidence
`src/ui/__tests__/wheelRows.test.tsx` 5/5 (band geometry, transparent fill, pointerEvents none, value scale, frame height, row hairline/role/label, section rhythm). Not seen on a device.

agent 133
