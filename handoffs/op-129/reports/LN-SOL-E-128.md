# LN-SOL-E-128 — independent Sol lens

## Scope traced
- Instance E; oldest current-head READY first; exact-head claims; no current-head Opus verdict read before the Sol verdict.
- Review only. No repository edits, merges, deploys, production writes, or CI reruns.

## B list
- mobile #507 B1: user turns System off but receives weekly summaries because the new copy claims email control while its mapped `weekly_summary_enabled` field is not the sender's `digest_email` gate. [UI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/f69a5d77f313c22cf65fd90061b04f429c42cf1a/src/screens/settings/NotificationPreferencesScreen.tsx#L435-L436), [delivery gate](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/0d179edb/src/notifications/digest.service.ts#L385-L411).
- mobile #507 B2: client selects Notifications Off / Metric but delivery and displays do not change; missing consumers are disclosed only in the PR body, not in the active-looking app settings. [Controls](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/f69a5d77f313c22cf65fd90061b04f429c42cf1a/src/screens/client/PreferencesScreen.tsx#L273-L325), [builder disclosure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507).

## U list
- None recorded yet.

## C one-liners
- mobile #492: optional Home child-card chrome remains outside this bounded delta; presentation-only follow-up, not a blocker. [PR scope disclosure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492).
- mobile #507: meal-reminder preference has no emitter consumer; separate disclosed follow-up. [PR disclosure](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507).

## PRs
- [mobile #492](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492): `a0b1d97ae9484db6f1eb9c8fbcb86888be5b4799`, 139 additions + 83 deletions = 222 lines; CI/CodeQL green; [Sol APPROVE, B=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492#issuecomment-6047148910), [Opus APPROVE](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/492#issuecomment-6046988230).
- [mobile #498](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/498): `ed5db331509727780dd53a81711ed21dd70c4184`, 246 additions + 108 deletions = 354 lines; CI/CodeQL green; [Sol APPROVE, B=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/498#issuecomment-6047244371), [Opus APPROVE](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/498#issuecomment-6047206968).
- [mobile #497](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/497): `2d01f74d7c9ee6798b6f28af48fe48fb75c081c6`, 171 additions + 55 deletions = 226 lines; CI/CodeQL green; [Sol APPROVE, B=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/497#issuecomment-6047338890), [Opus APPROVE](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/497#issuecomment-6047229351).
- [mobile #507](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507): `f69a5d77f313c22cf65fd90061b04f429c42cf1a`, 304 additions + 72 deletions = 376 lines; CI/CodeQL green; [Sol REQUEST CHANGES, B=2](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507#issuecomment-6047451409); [Opus APPROVE](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/507#issuecomment-6047493329), first-line observed only after posting Sol. Operator decides the disagreement; recommended bounded fixes are listed above.
- [mobile #493](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/493): `d54bcb6a1716e6e2d8df76b69e1da14f2318eedf`, 292 additions + 90 deletions = 382 lines; CI/CodeQL green; [Sol APPROVE, B=0](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/493#issuecomment-6047541800); no current-head Opus verdict at 14:49 PDT observation. Delta review verified unchanged screen/parity test from earlier Sol-approved `894492371613c74a04b08eb4f99f5932ae59e08a`, merge parents exact, README resolution preserving both entries.

## Not fixed (needs operator)
- #507 `src/screens/settings/NotificationPreferencesScreen.tsx:89,163-166,435-436`: FIX lane should map System to real `digest_email`, describe daily/weekly scope and update payload/hydration tests. [UI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/f69a5d77f313c22cf65fd90061b04f429c42cf1a/src/screens/settings/NotificationPreferencesScreen.tsx#L86-L91).
- #507 `src/screens/client/PreferencesScreen.tsx:237-238,273-325`: FIX lane should visibly disclose stored-only effects while retaining options, link real notification delivery settings, and test the notice; actual consumer wiring can remain a separately graded lane. [UI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/f69a5d77f313c22cf65fd90061b04f429c42cf1a/src/screens/client/PreferencesScreen.tsx#L273-L325).

## HANDOFF
- STOPPED 14:49 PDT under the operator's credit-emergency mail: finished the in-progress #493 delta review, posted its verdict, and claimed no further PR. Five Sol verdicts: #492/#498/#497/#493 APPROVE, #507 REQUEST CHANGES (B=2); all CI green at reviewed heads. Exact heads/line counts/evidence above.
- Operator action: decide #507 lens disagreement; recommended defaults are real `digest_email` mapping/copy and visible stored-only limitation with existing NotificationSettings route. #493 needs current-head Opus verdict or operator merge-only-tree verification. No repository edits, merges, deploys or production changes; verdict/diff evidence remains in `ops/lanes128/LN-SOL-E-128-*`.
