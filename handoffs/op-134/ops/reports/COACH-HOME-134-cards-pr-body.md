**COACH-HOME-134 follow-up (agent 134), operator 22:2x.** Follows m#633 (merged). It does four things on the coach Home:
- the three Home cards below "Your clients today" (setup checklist, brief, Money) move to the coach-home-solo language;
- "Send a message" can now be reached by a screen reader;
- the change line gets clearer wording;
- SHOTS-134B finding f is fixed: the tab strip clipped "Actions", the date and greeting stacked at 360, and a serif "1" read as "I".

Bug: **B29** (pages not world-class: the coach Home). Lines: 182 + 49 = 231 (tests count). Presentation only. No data, endpoint, route or flag changes. Real data and the same calm states as before.

## Parity table — coach-home-solo (`design-targets/mobile/coach-home-solo/luxury.jpg`)

| Target element | Today's file | What matches | What differs and why |
|---|---|---|---|
| Rounded hairline surfaces (the MOST URGENT card) | `CoachSetupChecklist.tsx`, `BriefHomeCard.tsx`, `MoneyHomeCard.tsx` | `radius.card` (16), hairline border, 20 pt padding, surface fill, serif `typography.h3` titles ("Finish setting up", "Today's brief", "Money") | The target has no setup, brief or Money card. They stay because head coaches keep these cards (operator 21:00) and the checklist is a new coach's only way to Stripe |
| The need said in words, no red (the "Three need you" line) | `MoneyHomeCard.tsx` | "2 need attention" in forest Inter 14 next to the title; the red pill is gone | — |
| Serif money figure (hero "$14,280") | `MoneyHomeCard.tsx` | Net to you, last 30 days, now in serif `typography.h1` with lining, tabular figures | Stays a secondary figure (32 pt) under the Home hero; cents kept, as Money shows them |
| Checklist rows (target client rows) | `CoachSetupChecklist.tsx` | 56 pt rows, Inter Medium 16 labels; the status dot is now a token circle (`radius.chip`, was a literal 7) | No hairline between rows (four short rows read as one list) |
| Date + greeting on one line ("WEDNESDAY, JUNE 10 · GOOD MORNING, SARAH") | `CoachHomeSections.tsx` `HomeOverline`, `coachHomeCopy.ts` `overlinePair` | One line at 360 and 390 | At 360 the date shortens to "Fri, Oct 9". If the short date still does not fit (long names, large text), the greeting drops the name. Widths come from Inter Medium caps measured in the TTF (hmtx) |
| Serif figures (hero, stat row, rows) | `CoachHomeSections.tsx`, `MoneyHomeCard.tsx` | `fontVariant: ['lining-nums', 'tabular-nums']`. Cormorant ships `lnum`/`tnum`; its default figures are old-style, which is why a "1" read like "I" | — |
| "up $620 vs May" | `coachHomeCopy.ts` | "Up $620 on the same days in September" | The old "on this point in September" read stiffly (Opus C on m#633; SHOTS-134B note 10). Plain words, no "vs" |
| Top tabs (not in the target; kept) | `CommandCenterScreen.tsx` | All five tabs share the width gutter to gutter (`space-between`, 24 pt gutters, `minWidth: 44`, one line, `maxFontSizeMultiplier` 1.2) | The labels are 17.218 em of Inter Regular (measured from the TTF): 289 pt at 14 pt, 337 pt at 1.2x, so they fit 360. The strip still scrolls if they ever do not fit |
| "Send a message" (MOST URGENT card) | `CoachHomeSections.tsx` `ClientCard` | The card is one accessible element, so VoiceOver/TalkBack now get a "Send a message" accessibility action on it (Opus C on m#633) | — |

Opus Cs on m#633 that need more than one line, left as they are: ltv-metrics is read twice (CoachLtvDashboard fetches on its own; sharing the read means a new prop). The narrative count is the server's true at-risk count while the cards are sharing-gated ("Three need you" over fewer cards is still true). Sol C on m#633, left by design: optional reads that fail leave their sections out; their routes stay.

## Before -> after

| Screen | Before | After |
|---|---|---|
| Coach Home, Command Center tabs (`CommandCenterScreen.tsx`) | 12 pt padding per tab, 8 pt gaps, 16 pt side padding: "Actions" cut at the right edge at 360 and 390 | Five tabs spread gutter to gutter; "Actions" whole (seen in a web render at 360 and 390) |
| Coach Home overline (`CoachHomeSections.tsx`) | "FRIDAY, OCTOBER 9 / GOOD MORNING, JORDAN" on two lines at 360 | "FRI, OCT 9 … GOOD MORNING, JORDAN" on one line at 360; long date at 390 |
| Coach Home figures | Old-style Cormorant figures: the "1" in the At risk row and in "$1,840" looked like "I" | Lining figures: "1" reads as one |
| Home cards (`CoachSetupChecklist`, `BriefHomeCard`, `MoneyHomeCard`) | Square boxes with 1 pt borders, Inter 17 titles; Money: Inter 30 amount and a red "N need attention" pill | Rounded 16 pt hairline cards, serif titles; Money: serif amount and the need in forest words |

## Seen in a web render, not on a device

These were seen in a react-native-web render (headless Chromium, SHOTS-134B harness at this branch) at 360x800 and 390x844, not on a phone: the five tabs fit, the date and greeting sit on one line, lining figures show, and the brief and Money cards are rounded with serif titles. The setup checklist was not in the render (fixture setup complete); it is checked in the jest test. Not seen at all: a device, Android `fontFeatureSettings` for `lnum` on a phone, large text sizes, VoiceOver or TalkBack. Tests: `src/__tests__/coachHomeCards134.test.tsx` renders the real Command Center with the real Home cards at 360x800 (24 pt) and 390x844 (47 pt). `src/__tests__/coachHome134.test.tsx` covers the overline fit at both widths, the accessibility action, lining figures and the change line.

## WHY / WHEN / WHO

- Square boxed cards and the red pill: `MoneyHomeCard` from 35aa8163 (#332 N2, 2026-10-03), `CoachSetupChecklist` from 4522eb8e (#329 W2, 2026-10-03), `BriefHomeCard` from ab2f117b (#398, 2026-10-06). All were built before the luxury targets existed.
- The tab strip that runs off the edge: bab0c117 (#112, 2026-05-12). It became visible once m#633 put the Home under it at 14 pt labels.
- The overline stacking at 360 and the old-style figures: my own m#633 (b372ac41, COACH-HOME-134). The overline used `flexWrap` with no width rule, and the serif numbers had `tabular-nums` without `lining-nums`.
- "Send a message" not reachable by a screen reader: m#633 (b372ac41), a TextLink inside an accessible Pressable.

## Tests (each file alone, local)

`coachHomeCards134` 2/2 (new), `coachHome134` 15/15, `qaCoachHome131` 16/16, `coachHomeAudit13` 7/7, `commandCenterScreens` 28/28, `coachDay1Hunt05` 6/6, `coachCheckInReviewFu126` 9/9, `commandCenterNavigation` 11/11, `money` 82/82 (one test title now says "in words"), `coachSetup` 17/17, `coachSetupRound2` 20/20, `w2FixRound118` 13/13, `moneyNavigation` 3/3, `quietLuxuryDoctrine` 34/34, `copyVoice.guard` 8/8, `safeAreaInsets133` 17/17. `tsc --noEmit` and eslint are clean on the changed files.

agent 134
