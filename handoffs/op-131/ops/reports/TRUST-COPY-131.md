# TRUST-COPY-131 (Claude Opus 5.5, builder, T3 privacy copy), round 2026-10-08 09:10 PDT, agent 131

## Scope traced
Job row: JOBS131.md "ROUND 2026-10-08 09:10", TRUST-COPY-131. This covers FW-ACCOUNT-128 FWA-TRUST-128 (:101), items U2, U3, U4, the Trust Center part of U5 and U10, plus the FW-COACH note (:109).
Files: `src/screens/TrustCenterScreen.tsx` and `src/screens/trustCenterLinks.ts`, plus the new copy helper `src/screens/trustCenterSharing.ts`, their tests and the client README.
Backend facts were checked on backend main 652b07a8, which is production (from the code):
- `onboarding.service.ts:282-304` `canCoachRead`: the coach reads consultation answers on the coach link alone, outside the switches.
- `coachSharingCopy.ts` devicesNote: connected-device data is outside the switches.
- `consent.controller.ts:28-61`: `@Roles('student')`, and 400 when there is no coach.
- `consent.service.ts:377-392`: `owner_access` is reported on production.
- Check-ins are gated by `fitness.habits_progress`.
- `roman-chats.controller.ts`: Roman sessions are the caller's own, so "Not your coach" stays true.

## B list
None.

## U list (all fixed in m#564)
- U2 / FW-COACH (from the code, seen in a test): the coach line was fixed text at `TrustCenterScreen.tsx:532`, and the info row at `:475` said logs are always shared. Clients with no coach, coaches, and clients with sharing off were told their coach sees their logs. The line is now state-driven from `GET /consent/me`, and the info row is removed.
- U3 (seen in a test): "Last security update" came from a hard-coded date, the "Audit policy Version v1.0" row was shown, and canned offline values filled in when the read failed. All are removed, along with the trust-meta read; the Encryption row stays.
- U4 (seen in a test): there was no Terms of Service link after sign-up. A Terms link now uses `TERMS_URL` (which returns 200).
- U5, Trust part (seen in a test): the alert said "Open Privacy in Settings". It now says "Open My data in Settings", which matches both the client and coach Settings rows.
- U10, Trust part: already fixed on main by DES-BB-127 (865c1584). No change here; the PR body lists it.

## C one-liners
- C: if the account cache is empty, the coach line stays hidden. This needs an edge case: signed in with no cached user.

## PRs
- growth-project-mobile#564 (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/564), branch agent131/trust-copy-131, head 9a9f7bc7a225d252e2555f4bb5824dac58100b4f, 494 lines (+377/-117, 7 files).
  - CI is green at the head: "Typecheck, lint, test", CodeQL, Analyze (actions) and Analyze (javascript-typescript). The PR is mergeable with main 868a629c; no merge was needed.
  - READY was posted at 09:38 PDT (issuecomment-6064574393).
  - Verdicts: none yet. The operator launches the lenses.
- Failing-first: `trustCenterTruth.test.tsx` failed 19 of 19 on main 868a629c (log: `ops/reports/TRUST-COPY-131-failing-first-868a629c.log`). On the head it passes 19 of 19; `trustCenterPolicyLinks` passes 28 of 28 and `privacyDataLook` 12 of 12. Eslint on the changed files is clean.

## Proposed (needs operator)
- P1 (U, from the code): coach accounts see the community line "If you opt in to a leaderboard, other clients of your coach can also see your display name and participation score" (`TrustCenterScreen.tsx`, the Members bullet), but a coach has no coach. This was out of scope. Default: a later copy job gives coach accounts their own community line, using the same `coachView.kind` state.
- P2 (enhancement, from the code): a "Coach sharing" row in "What you can do" that opens the switches. It would need a re-read on focus. This was not done because it is new work beyond the entry. Default: no, for launch.

## HANDOFF
- State: m#564 is open at 9a9f7bc7a225d252e2555f4bb5824dac58100b4f. CI is green and READY is posted. Nothing is merged or deployed, and no flags were touched. The builder ended after READY (_COMMON R7); no second job.
- Next: lenses LN-OPUS-K/L-131 and LN-SOL-K/L-131 review this head. JOBS131 :181 says to read the whole diff and tests. Any REQUEST CHANGES stays open for the next round (R8, no fix round in this batch).
- What a fixer needs: all state-driven copy lives in `src/screens/trustCenterSharing.ts` (`trustCoachLine` and `trustRomanLine` over `TrustCoachView`: checking, no_coach, read, unread). The screen reads it in one effect (`TrustCenterScreen.tsx`, after `trust_center_opened`):
  - a coach-like role sets no_coach and makes no `/consent` read;
  - for a client, `readCoachSharing()` gives ok → read, 400 → no_coach, and an error → unread when the cached user has `coach_id`, otherwise no_coach.
- Tests: `src/screens/__tests__/trustCenterTruth.test.tsx` holds the variant table and renders. `trustCenterPolicyLinks.test.tsx` and `privacyDataLook.test.tsx` mock `useCurrentUser`; the second needs that mock because its partial Sentry mock has no `setSentryUser`.
- Facts to re-check if the backend changes: consultation answers and device data are visible to the coach without the switches (`onboarding.service.ts` canCoachRead, wearables assertCoachOwnsClient). `owner_access` comes from `consent.service.ts` myConsentView.
- Proposed (needs operator): P1 the coach-account leaderboard sentence, P2 a Coach sharing row in Trust & Privacy. Both are listed above with defaults.
