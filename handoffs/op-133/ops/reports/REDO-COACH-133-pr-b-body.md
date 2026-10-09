[133] REDO-COACH-133 PR (b) of 3. QA-SHEETS-128 coach part (REDO-AUDIT-133 section 4), read with the owner's 17:07 ruling (Q10b): rounded token corners, not 4 pt. Builds on DS-PRIMITIVES-133 (#577). Not touched: `src/entitlements/**` (agent 132), `components/ai/AiConsentSheet.tsx` (ROMAN-ROOM-133).

- **Tier:** T2, mobile presentation only.
- **Why:** the five coach AI surfaces set their own corners (20 / 16 / 12 / 10 / 8), sat on cream fills, had sans 17 pt titles, no grab handle, and a bottom padding that ignored the gesture bar.
- **T4 trigger scan:** none. No auth, tenancy, PII, money, credentials or destructive path; the AI propose / apply / discard / assign calls and their payloads are unchanged.
- **T3 trigger scan:** none. No route, flag, navigator, dependency or lockfile change.
- **Bounded T1:** sheet styles, title type, haptic wrapper, one outlined button.
- **Canonical builder:** REDO-COACH-133 (agent 133 lane). **Parent owner:** agent 133 (coach files claimed for agent 134 until it starts).
- **Acceptance evidence:** tests below at this head; RevisionHistorySheet rendered at 360x800 (insets 24/0) and 390x844 (47/34). Not seen on a device.
- **Promotion triggers:** none found.

## What changes for coaches
- Ask AI (`AiBuilderSheet`), Week AI (`WeekAiSheet`), Adjust for a client (`AdjustForClient`), History (`RevisionHistorySheet`): 24 pt top corners (`radius.sheet`, was 20), a hairline edge with no bottom border, a small grab handle, a serif title (`typography.h2`, was sans `h4`), 24 pt side gutters, and a bottom of `max(insets.bottom, 16) + 8`, so Apply / Discard clear the Android gesture bar and the iPhone home indicator.
- Inputs, buttons, change cards, chips and badges take `radius.input / button / card / chip / control`; buttons and Close have 48 / 44 pt targets. Change cards and the copy bar lose their cream fill (hairline only).
- Press feedback: buttons whose handler already fires an AI haptic (send, apply, discard, close with pending changes) keep `Pressable` and gain a pressed veil, so a press gives one haptic, not two. Close (Adjust, History), Try again, the saved-workout rows and the "Adjust a saved workout" entry become `HapticPressable` (the entry's explicit light haptic was removed; HapticPressable gives it).
- Client copy bar (in the builder while editing a client's copy): Assign is an outlined forest button (`HapticPressable intent="medium"`, its explicit medium haptic removed), so the builder keeps Save as its one filled forest action. Success and error haptics stay.

## B/U list
- U QA-SHEETS-128 coach.1 AiBuilderSheet.tsx:197-203 hardcoded radii, plain Pressables: fixed.
- U QA-SHEETS-128 coach.2 WeekAiSheet.tsx:257-260: fixed.
- U QA-SHEETS-128 coach.3 AdjustForClient.tsx:117-118: fixed.
- U QA-SHEETS-128 coach.4 RevisionHistorySheet.tsx:106-107: fixed.
- U QA-SHEETS-128 coach.5 ClientCopyBar.tsx:58-59 (radius 10, second filled forest button): fixed.
- R1: the 128 job asked for 4 pt corners; reversed by the owner's 17:07 ruling (Q10b), so tokens instead. Nothing else was already fixed on main.

## WHY / WHEN / WHO
- AiBuilderSheet: bd6031ef "Ask AI sheet, change cards and builder wiring (AIB-5)", merged in #439 (2026-10-07, agent 126).
- WeekAiSheet and RevisionHistorySheet: 607ca86b "AI entry points ... (AIB-6)", #443 (2026-10-07, agent 126).
- AdjustForClient and ClientCopyBar: 87b47889 "adjust a saved workout for a client ... (AIB-FINISH-127 job 6)", #462 (2026-10-07, agent 127).
- Root cause: all five were written before any sheet or radius token existed, so each hand-set 20 / 16 / 12 / 10 / 8 pt corners, cream fills and a fixed `spacing.lg` bottom. DS-PRIMITIVES-133 (#577) added `radius.sheet` and `footerBottomPadding`, adopted here.

## Parity table
| Reference folder | File | What matches | What differs and why |
|---|---|---|---|
| drafts-queue | AiBuilderSheet, WeekAiSheet | serif title, hairline change rows with a type badge, one filled forest Apply, quiet Discard | The AI response's existing summary (`p.summary`, AiBuilderSheet.tsx:161) stays in Inter rather than the reference's italic serif; corrected after U-599-C-1. Corners rounded per the owner. |
| drafts-queue | AdjustForClient | serif title, hairline rows naming the workout and its exercise count | Rows are rounded hairline cards (owner 17:07) rather than flat rows. |
| coach-workout-builder | ClientCopyBar, RevisionHistorySheet | one filled action per screen (builder Save), quiet secondary actions | The reference has no copy bar or history; they follow the builder's language. |

## Routes/actions before -> after
| Surface | Before | After |
|---|---|---|
| Ask AI | prompt chips, Send, Discard, Apply n, Close, Try again | same, same handlers |
| Week AI | Discard, Apply n, keep/drop per change, Close | same |
| Adjust for a client | entry, saved-workout rows -> copy and open, Close | same |
| History | rows, Try again, Close | same |
| Client copy bar | Assign to client | same, outlined |

## Truthful sweep
No copy changed. Theme colours only; no new animation (existing reduce-motion paths untouched); every radius from `radius.*`; hairlines via `StyleSheet.hairlineWidth`.

## Evidence (tests run locally at this head, one file at a time through heavy.sh)
New `coach/ai-entry/__tests__/coachSheets133.test.tsx` 12/12 (no literal radius, sheet tops, handle, serif title, safe bottom, outlined Assign, 360x800 / 390x844 renders); aiEntry + adjustForClient 16/16; aiBuilder + aiFunLayer + coachWeekly131 30/30. `tsc --noEmit` clean for touched files; eslint 0 errors. Not seen on a device or simulator.

README: `src/components/README.md` row for the coach AI sheets (doctrine section 8).

agent 133
