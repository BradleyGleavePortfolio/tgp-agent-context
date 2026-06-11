# v1-6 Mobile Coach Community UI — Code Audit Report

**Verdict:** DIRTY
**Audit SHA:** c6a3711b23b8feb9cd18a1ace042487d80a1e628
**Auditor model:** gpt_5_5 (code lane)
**Audit timestamp:** 2026-06-11T00:58:00Z

## Gate results
G1 — Feature flag wired correctly: FAIL — `featureFlags.coachCommunity` defaults OFF in code, but `.env.example` does not declare `EXPO_PUBLIC_FF_COACH_COMMUNITY`, so the required env config/default-off example is missing.
G2 — All 6 screens exist and typed: FAIL — six routes exist, but they are not the required six surfaces: the typed route list has no post-detail route and replaces cohort-write/compose with a local-only Lab screen.
G3 — API client typed: FAIL — `coachCommunityApi.ts` has typed API surfaces but does not model the required empty-state payload `{ text, avatar_crop, surface_key, voice_variant }`, and it has no endpoint/client path that consumes that backend payload.
G4 — Empty-state contract (face+voice): FAIL — every empty state uses hardcoded `COACH_EMPTY_COPY` constants instead of backend payload text/avatar_crop; this is a P0 operator-locked face+voice violation.
G5 — Loading + error states: PASS — data-fetching screens have loading branches and non-stack-trace error fallback UI, with typed API errors from `CoachCommunityApiError`.
G6 — File ownership / §7C: FAIL — the PR adds `src/hooks/useCoachCommunity.ts`, which is outside the brief's allowed file-ownership list, and moves core coach-community behavior into that unlisted lane.
G7 — Commit hygiene: PASS — the single PR commit is authored by `Dynasia G <dynasia@trygrowthproject.com>`, the title has no body/trailers/emoji/exclamation, and the required forbidden-model grep was empty.
G8 — Build/lint/tsc: FAIL — `npm ci` passed, `npm run lint` passed with 0 errors, and `npm run typecheck` passed, but the required `npm run tsc` command fails because no `tsc` script exists in `package.json`.
G9 — Test coverage: FAIL — tests pass, but they assert hardcoded `COACH_EMPTY_COPY` constants rather than backend payload-driven `avatar_crop` + `text`, and the API tests do not cover empty-state payload parsing/error handling.
G10 — Decacorn quality (R0): FAIL — there are no grep hits for TODO/console/any/lorem/Coming soon, but the Lab is explicitly local-only/no-backend and the approve moderation mutation is a no-network stub.
G11 — Design-doctrine code gates: FAIL — completion flows rely on haptic pressables/optimistic state but do not implement a designed post-success confirmation path, and equivalent list rows are implemented inline rather than via a shared list-item primitive.
G12 — Accessibility: PASS — changed interactive controls inspected have accessibility roles/labels or labels, small tap targets are implemented as >=44pt controls, and changed TS/TSX files have no hardcoded hex colors.
G13 — Performance: PASS — long lists use `FlatList` with `keyExtractor`, no unkeyed changed-file `.map()` list rendering was found, and key row callbacks/memoization are used where needed.

## Test counts (verbatim from jest)
- CoachCommunity / coachCommunity specs: 56/56

## Findings (if DIRTY or BLOCKED)
### P0
- `src/components/community/coach/coachVoice.ts:23` — Empty-state copy and avatar crops are hardcoded in `COACH_EMPTY_COPY`, violating the operator-locked rule that empty-state `{ text, avatar_crop, surface_key, voice_variant }` must be consumed from the backend payload.
- `src/screens/community/CoachCommunityHomeScreen.tsx:59` — Home empty state passes `COACH_EMPTY_COPY.home.crop/copy` instead of backend payload `avatar_crop` and `text`.
- `src/screens/community/CoachCommunityInboxScreen.tsx:104` — Inbox empty state passes `COACH_EMPTY_COPY.inbox.crop/copy` instead of backend payload `avatar_crop` and `text`.
- `src/screens/community/CoachCommunityLabScreen.tsx:117` — Lab empty state passes `COACH_EMPTY_COPY.lab.crop/copy` instead of backend payload `avatar_crop` and `text`.
- `src/screens/community/CoachCommunityCohortsScreen.tsx:124` — Cohorts empty state passes `COACH_EMPTY_COPY.cohorts.crop/copy` instead of backend payload `avatar_crop` and `text`.
- `src/screens/community/CoachCommunityCohortDetailScreen.tsx:179` — Cohort-members empty state passes `COACH_EMPTY_COPY.cohortMembers.crop/copy` instead of backend payload `avatar_crop` and `text`.
- `src/screens/community/CoachCommunityModerationScreen.tsx:150` — Moderation empty state passes `COACH_EMPTY_COPY.moderation.crop/copy` instead of backend payload `avatar_crop` and `text`.
- `src/api/coachCommunityApi.ts:55` — The typed API response schema section starts with dashboard/inbox/cohort schemas and contains no `text`, `avatar_crop`, `surface_key`, or `voice_variant` schema/type, so the API client cannot consume the required Roman empty-state payload.

### P1
- `src/screens/community/coachCommunityNavTypes.ts:13` — The six registered routes are Home, Inbox, Lab, Cohorts, CohortDetail, and Moderation; the required post-detail screen is missing, and the required cohort write/compose surface is not implemented as a backend-backed compose/broadcast screen.
- `src/screens/community/CoachCommunityLabScreen.tsx:2` — The supposed compose/write surface is explicitly a private AsyncStorage scratchpad with “NO backend endpoint,” so it does not exercise the shipped `cohort-write` broadcast/compose contract.
- `src/hooks/useCoachCommunity.ts:304` — The approve moderation action documents that no approve endpoint exists and implements a client-only dismissal stub, which is not decacorn-quality production behavior for a visible coach action.
- `src/hooks/useCoachCommunity.ts:311` — `useApproveFlagged` returns `undefined` from `mutationFn` without a network mutation, so “Approve” can appear successful while no durable backend decision is made.
- `src/screens/community/CoachCommunityCohortsScreen.tsx:57` — The create-cohort completion path only clears input/closes the modal; it does not invoke a designed post-success confirmation/micro-interaction beyond press haptics/optimistic row state.
- `src/screens/community/CoachCommunityCohortDetailScreen.tsx:82` — The invite completion path only clears input/closes the modal; it does not invoke a designed post-success confirmation/micro-interaction beyond press haptics/refetch state.

### P2
- `.env.example:1` — The required `EXPO_PUBLIC_FF_COACH_COMMUNITY=false` default-off example is absent from the env example file.
- `package.json:5` — The required audit command `npm run tsc` fails because scripts expose `typecheck` but not `tsc`; `npm run typecheck` was clean, but G8 requires the named script.
- `src/screens/community/__tests__/coachCommunityScreens.test.tsx:243` — The FACE + VOICE tests assert `COACH_EMPTY_COPY` constants rather than a backend payload driving `avatar_crop` and `text`, so the P0 contract can regress while tests stay green.
- `src/api/coachCommunityApi.test.ts:214` — API error/contract tests cover dashboard drift but do not test typed empty-state payload parsing or error handling.

### P3
- `src/hooks/useCoachCommunity.ts:1` — New hook file is outside the brief's explicit allowed file-ownership lanes; either document/approve this lane or relocate the logic under an allowed coach-community API/component/test/navigation lane.
- `src/screens/community/CoachCommunityInboxScreen.tsx:134` — Inbox rows are implemented inline as `InboxRow`, while cohort and moderation rows each define separate inline row/card primitives; equivalent list items are not centralized into a shared primitive for consistency.

## Final recommendation
FIX — Do not merge PR #231. The branch is runnable enough for tests/lint/typecheck, but it fails core contractual gates: backend-driven Roman empty-state payloads are not consumed, the required post-detail and backend-backed compose/write surfaces are missing, one visible moderation action is a client-only stub, and the required `npm run tsc` audit command is not available. Rework the API contract and screens around backend payloads/endpoints, add the missing route(s), replace stubs with durable backend behavior or remove the action, update env/script wiring, and rewrite tests to assert payload-driven behavior before re-audit.
