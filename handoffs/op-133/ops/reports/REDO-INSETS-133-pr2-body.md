[133] REDO-INSETS-133 (APPLY-INSETS-133, PR 2 of 2): ReportScreen. Bugs: B13, B28, B39 (status-bar top), owner ruling 17:07 (Q10b, rounded corners). PR 1 is growth-project-mobile#586 (file-disjoint). Builds on DS-PRIMITIVES-133 (#577).

**Tier:** T1 (mobile presentation only).
**Why:** the Weekly report hardcoded a 56 pt top, used 4 pt boxed cards the owner rejected, a first-person title ("My Report") and showed 0 kcal / 0 g while today's log was still loading or could not be read.
**T4 trigger scan:** none (read-only screen; no auth, money, PII writes or destructive paths).
**T3 trigger scan:** none (no route, API, flag or storage change).
**Bounded T1:** one screen's styles, wrapper and copy; one unknown-state for today's totals.
**Canonical builder:** REDO-INSETS-133 (claude_opus_5_5, agent 133). **Parent owner:** operator agent 133.
**Acceptance evidence:** tests below; rendered through the tests' renderer at 360x800 and 390x844. Not seen on a device.
**Promotion triggers:** none.

## What changes for clients (plain words)
- More → Report opens "Weekly report": the title sits 12 pt under the real status bar on every phone; Back stays.
- A quiet camera line ("Take a screenshot to keep this report."), a centred serif cover, then three hairline sections under small overlines (Today's macros, Weekly progress, General guidance) with serif numbers. No boxed cards, no coloured banners.
- Today's calories and macros show "--" until the day's food log is read, and stay "--" if it cannot be read, instead of a guessed 0.
- Nothing added or removed: Back and every section stay.

## B/U list
- B13 / B28 / B39 (fixed top): fixed. U (found here): today's totals showed 0 before/without a read: fixed. "My Report" first person: fixed.

## WHY / WHEN / WHO
- Fixed top 56 and the 4 pt boxed cards: the luxury wave rewrites (4faec4a8 #53, "radius cleanup") enforcing doctrine rule 5 (`radius.lg = 4`), reversed by the owner 17:07; no shared wrapper existed before #577.
- Zero totals: the initial `useState({ calories: 0, ... })` was rendered directly since the screen was written; a failed `logApi.getDaily` kept the zeros (comment "defaults to 0 if the fetch fails").

## Parity table
| Reference | Today's file | What matches | What differs and why |
|---|---|---|---|
| CATALOG progress-details ("The full picture") | `ReportScreen.tsx` | Back + small title band under the status bar, serif cover headline, muted overlines over hairline sections, serif tabular figures, generous 24 pt margins, no boxes or shadows | No photo tiles or chart (the report has no photos; the weekly weight list stays a hairline list). Weight units stay as the server sends them. |

## Truthful sweep
"My Report" → "Weekly report"; "Screenshot or screen-record to save your report" (second person, no period) → "Take a screenshot to keep this report."; title case to sentence case ("Weekly Progress Report" → "Weekly progress report", "Today's Macros" → "Today's macros", "Weekly Progress" → "Weekly progress"). Unknown totals read "--". No first person, no exclamation marks, no emoji, theme colours only.

## Evidence (tests run locally, one file at a time)
- NEW `src/__tests__/reportScreen133.test.tsx` (4, failing on main): rendered in a SafeAreaProvider at 360x800 (top 24) and 390x844 (top 47): page top = insets.top + 12, header "Weekly report", no "My Report", tip copy, Back reachable; a rejected `logApi.getDaily` shows "--" and no 0; source: no literal radius, imports `Screen` from `src/ui`, no fixed 56 top.
- Green: `ReportScreen.test.ts` (Colors import guard kept), `quietLuxuryDoctrine.test.ts`; `tsc --noEmit` clean.
- README: `src/screens/client/README.md` ReportScreen row rewritten.
- Not seen on a device: the screenshot itself on iOS and Android.

## Reviewer checklist
- [x] No `fontWeight: '700'`/`'800'`; no "Coming Soon"; no emoji; no exclamation marks.
- [x] Corners from the semantic radius tokens; no literal radius; no 0-4 pt button or card.
- [x] No `SafeAreaView` from `react-native`.
- [x] README updated.

agent 133
