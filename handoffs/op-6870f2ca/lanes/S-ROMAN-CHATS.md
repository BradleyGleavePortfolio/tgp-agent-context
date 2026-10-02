# Lane S-ROMAN-CHATS (agent 112) — Claude Opus 5.5 builder: mobile Roman chat list + delete (new mobile PR; T4 personal data)

Launch blocker (Opus #635 audit): the consent copy shipped in #310 says Roman chats are "kept until you delete them or your
account", but mobile main has no screen to list or delete Roman chats. Owner 10-01 20:32 keep AI chats forever; OR-110-1 client
delete erases them; Roman chats are never visible to coaches.
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; backend #635 (c2688010; docs/roman-chat-deletion*.md, controllers for
GET /roman/sessions and DELETE /roman/sessions[/:id], error codes); mobile main 2c17c241 Settings > Privacy > Roman and AI (from
#310) and the Roman chat UI; mobile design doc rules in the repo.
Parallel lane: B-CONSENT-4 is fixing mobile #326 (AI-consent errors, same Settings > Privacy > Roman and AI area) at the same
time — keep your change additive (new screen + one nav entry), read #326 on GitHub, and avoid editing its files where possible.
Build (new branch agent/clinic/roman-chats-mobile off mobile main; Conventional Commits title; tier header T4):
- A "Your conversations with Roman" screen reachable from Settings > Privacy > Roman and AI (and from the Roman chat header menu):
  list every chat (any day, newest first, paginated per the backend contract), open one, delete one (confirm sheet with plain
  copy saying it is permanent), delete all (typed or double confirm), optimistic UI rolled back on failure.
- Every backend code mapped to specific copy (no generic errors; unknown -> reference ID + support path; Sentry without content).
- Bound to the signed-in user (a sign-out/sign-in as another user must never show or delete the first user's chats); retry safe
  (repeat delete is quiet success per #635 C-635-2).
- Accessibility labels, empty state, loading state, offline state.
- Tests (jest + RNTL) for list, delete one, delete all, failure rollback, account switch, every mapped code.
Release note for the PR body: needs backend #635 deployed (operator handles ship order). Tests via heavy.sh (targeted jest
--runInBand; tsc once). Never merge, dispatch workflows or touch production. Report:
/home/user/workspace/ops/reports/S-ROMAN-CHATS-112.md. Final answer (<400 words).
