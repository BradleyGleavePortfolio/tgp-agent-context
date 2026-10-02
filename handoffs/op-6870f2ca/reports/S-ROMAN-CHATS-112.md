# S-ROMAN-CHATS (agent 112) report

**PR:** mobile #331 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331
**Branch:** agent/clinic/roman-chats-mobile (off main 2c17c24)
**Head:** a224e5bd9b2100c68ce9290a59221404f73b7838
**Tier:** T4 (personal data, destructive deletion, account boundary). Not merged, no workflows dispatched, production untouched.

## What shipped
- "Your conversations with Roman" list (GET /roman/sessions, 30 per page, keyset cursor, newest first, local date, message count, coach-tool label), read-only transcript (GET /roman/sessions/:id/messages), delete one (confirm sheet, optimistic + rollback + retry), delete all (typed DELETE, optimistic + rollback, re-read after partial/unknown failure).
- Entry points: Settings > Privacy > Roman and AI row, Roman chat header button, coach Settings > Privacy. Routes registered in client More stack and coach Settings stack without the Roman chat flag (backend list/delete are outside the switch).
- Account binding: per-request account fence, sign-out clears at once, sign-in re-reads, late answers dropped, no delete sent for a list loaded by another account. Nothing stored on device; ph-no-capture.
- Error mapping by status + code: offline, 401, 403, 404 ROMAN_SESSION_NOT_FOUND, uncoded 404, 400 ROMAN_CURSOR_INVALID, 400 ROMAN_SESSIONS_QUERY_INVALID, 503 ROMAN_ERASE_INCOMPLETE, 429, unknown -> short reference + Contact support + Sentry (status/code/request id only).
- Defect fixed: src/api/romanApi.ts validated Roman session/message/stream ids as uuid, backend ids are cuid -> every live Roman open/read/send would fail wire validation. Now z.string().min(1).max(64). Pinned by romanChatsApi.test.ts.
- READMEs: src/screens/settings/README.md, src/navigation/README.md, src/components/README.md.

## Operator mail (B-CONSENT-4 codes)
Pushed #635 head is still c2688010 (checked 13:5x PDT). I read the B-CONSENT-4 working tree (wt/bc4-635, read only): new `ROMAN_SESSIONS_QUERY_INVALID` (400, B-635-5) and unconfirmed erase reuses `ROMAN_ERASE_INCOMPLETE` 503 with a "could not confirm" message (B-635-4). Mapped both: query_invalid -> update-the-app copy + reference + Sentry; delete-one erase_incomplete copy no longer says "not changed" ("Delete it again in a moment to make sure. Deleting it twice is safe."). Uncoded 500s (current #635 head) already go to reference + support with "could not confirm" delete copy. Follow-up only if the pushed codes differ.

## Tests (via ops/heavy.sh, --runInBand)
- `npx jest --runInBand src/screens/settings/__tests__/RomanConversationsScreen.test.tsx src/screens/settings/__tests__/RomanConversationScreen.test.tsx src/components/roman/__tests__/RomanConversationsButton.test.tsx src/navigation/__tests__/romanConversationsReachable.test.ts src/api/__tests__/romanApi.test.ts src/screens/roman/__tests__/romanA11yR3.test.tsx src/screens/settings/__tests__/RomanAiConsentScreen.test.tsx src/navigation/__tests__/romanFlagOff.test.ts` -> 8 suites, 125/125 pass (before the fix-round mapping commit).
- After a224e5b: `npx jest --runInBand src/api/__tests__/romanChatsApi.test.ts src/screens/settings/__tests__/RomanConversationsScreen.test.tsx src/screens/settings/__tests__/RomanConversationScreen.test.tsx src/components/roman/__tests__/RomanConversationsButton.test.tsx src/navigation/__tests__/romanConversationsReachable.test.ts` -> 5 suites, 70/70 pass.
- `npx eslint <19 changed ts/tsx files>` -> exit 0.
- CI at a224e5b: Typecheck, lint, test PASS (3m4s); CodeQL PASS; Analyze (actions, javascript-typescript) PASS.

## Findings disposition
No audit findings yet (fresh PR). Fix round table in PR body is empty.

## Open risks
1. Ship order: backend #635 must deploy before this build; without it the list shows the "not available on our side yet" state (nothing breaks).
2. Transcript reading needs FEATURE_ROMAN_CHAT_ENABLED on the server; when off the screen says so and still offers Delete.
3. "or your account" copy depends on backend #608 (account deletion).
4. Data export does not include Roman chats yet (B-EXPORT lane).
5. #635 fix-round codes mapped from an unpushed working tree; re-verify after B-CONSENT-4 pushes.
6. Conflicts: romanApi.ts auto-merges with #326 (8f8d6424). #326 currently conflicts with main itself (consultation files, ClientNavigator, RomanAiConsentScreen add/add); once #326 is rebased on main, ClientNavigator/RomanAiConsentScreen need a trivial check. Other open PRs touching navigators: #314, #322, #325, #328, #329.

## Owner / operator decisions (recommended default)
- Coach Settings row gate: shown when `consultationOnboarding || romanChat` build flag on. Default: keep.
- Delete-all requires typing DELETE. Default: keep.
- Merge order: #635 (with B-CONSENT-4 fix round) -> #326 -> #331. Default: this order.
