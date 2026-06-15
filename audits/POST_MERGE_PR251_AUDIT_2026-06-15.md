**CHANGES_REQUESTED — P0: 0 · P1: 2 · P2: 4 · P3: 2**

# Post-Merge PR #251 Audit — R81 Re-Audit — 2026-06-15

## 1. Scope

- **Repo / PR:** `BradleyGleavePortfolio/growth-project-mobile#251` — `feat(community): v3-4 search + wearable prompts (mobile) — EXPO_PUBLIC_FF_COMMUNITY_SEARCH off, EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS off`.
- **Merge commit audited:** `bdc6d96b7fcbabe568032ac0ddce5510d334e8a8`.
- **Parent / diff swept:** `78811c2507f6b6bfae4863038f292b99d58ffffd..bdc6d96b7fcbabe568032ac0ddce5510d334e8a8` — 19 files, +2396/−0.
- **Current main checked:** `origin/main` currently resolves to `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`; no later mobile fix is present on main.
- **Read-only worktrees:** `/tmp/post-merge-pr251` at the merge commit and `/tmp/post-merge-mobile-main` at current main.
- **Method:** R72 full-surface re-audit plus targeted validation of the operator decisions called out for this post-merge pass: D4B `CommunityVoiceNoteDetail`, D5B γ server-evaluated flag pattern (`GET /me/feature-flags`), route registration, telemetry register+emit, flag-off pin tests, and R82 tracking issue #255.

## 2. Verdict rationale

The merge is **not clean under R81**. The original PR #251 implementation is still what current main contains: `CommunityFindScreen` routes `voice_note_transcript` results to `CommunityThread` with `result.targetId`, there is no `CommunityVoiceNoteDetail` component or route anywhere under `src/`, and the feature remains gated only by local Expo env flags rather than a server-evaluated `/me/feature-flags` γ pattern. The required post-audit decisions D4B and D5B were therefore **not actually applied to main**.

The route for the search screen itself is registered behind `featureFlags.communitySearch`, and the coach wearable-prompts route is registered behind `featureFlags.communityWearablePrompts`; those two containment points are correct. However, no `communitySearchFlagOff` / `coachCommunityWearablePromptsFlagOff` static pin tests exist, no mobile telemetry emit site exists for search submission/result taps, and the tracking issue #255 body incorrectly marks `CommunityVoiceNoteDetail`, server-side kind filtering, and flag-off static pin tests as already resolved even though current main lacks them.

## 3. Charge-by-charge verification table

| Charge | Result | Evidence |
|---|---:|---|
| D4B — `CommunityVoiceNoteDetail` actually built | **FAIL** | `find src -type f | grep -E 'CommunityVoiceNoteDetail|VoiceNoteDetail'` returned no files, and `rg -l "CommunityVoiceNoteDetail|VoiceNoteDetail" src | wc -l` returned `0`. `communityNavTypes.ts` defines only `CommunityVoiceComposer`, not a detail route (`src/screens/community/communityNavTypes.ts:43-59`). |
| Voice search route opens the detail route | **FAIL** | `CommunityFindScreen.open()` handles `voice_note_transcript` in the same branch as `post` and navigates to `CommunityThread` with `{ postId: result.targetId }` (`src/screens/community/CommunityFindScreen.tsx:80-86`). |
| D5B γ — server-evaluated flags via `GET /me/feature-flags` | **FAIL** | No mobile API/hook/screen code references `feature-flags`, `/me/feature`, or `GET /me/feature-flags`; `featureFlags.ts` still uses local Expo env parsing for `communitySearch` and `communityWearablePrompts` (`src/config/featureFlags.ts:240-258`). |
| Avoid client-header α / JWT-claims β pattern | **FAIL / absent γ** | No α or β implementation was found, but the required γ implementation is also absent; the shipped gate is local static env (`readFlag('EXPO_PUBLIC_FF_COMMUNITY_SEARCH', false)`) rather than server-evaluated per user (`src/config/featureFlags.ts:253-258`). |
| Search route registered | **PASS** | `CommunityNavigator` registers `CommunityFind` only inside `featureFlags.communitySearch ? ... : null` (`src/navigation/CommunityNavigator.tsx:96-106`). |
| Wearable prompts route registered | **PASS** | `CoachCommunityNavigator` registers `CoachCommunityWearablePrompts` only inside `featureFlags.communityWearablePrompts ? ... : null` (`src/navigation/CoachCommunityNavigator.tsx:87-93`). |
| Telemetry register+emit | **FAIL** | PR #251 files contain no `track(...)`, PostHog, `AnalyticsEvents`, `community.search`, `query_issued`, or result-tap telemetry references; `featureFlags.ts` only contains unrelated telemetry comments. |
| Flag-off pin tests | **FAIL** | `src/navigation/__tests__` contains existing `communityVoiceFlagOff.test.ts`, `communityClassroomFlagOff.test.ts`, etc., but no `communitySearchFlagOff.test.ts` or `coachCommunityWearablePromptsFlagOff.test.ts`. |
| Tracking issue #255 | **PARTIAL / MISLEADING** | Issue #255 exists and is open, but its “Already resolved” section claims `CommunityVoiceNoteDetail`, server-side kind filtering, and flag-off static pin tests are resolved even though current main lacks all three (`https://github.com/BradleyGleavePortfolio/growth-project-mobile/issues/255`). |

## 4. Findings

| ID | Sev | Area | Finding |
|---|---:|---|---|
| F1 | **P1** | Voice search / D4B | `CommunityVoiceNoteDetail` was not built or registered; voice transcript results still navigate to `CommunityThread` with a voice-note `targetId`. |
| F2 | **P1** | Server-evaluated flags / D5B | The required γ pattern (`GET /me/feature-flags`) is absent; search/wearable gating remains local Expo env only. |
| F3 | **P2** | Flag-off pins / R79 | No static flag-off pin test exists for `communitySearch` or `communityWearablePrompts` route registration. |
| F4 | **P2** | Telemetry / R78-style discipline | Mobile search submission/result-tap and wearable-prompt actions have no telemetry emit sites. |
| F5 | **P2** | R82 tracking accuracy | Issue #255 exists but records absent work as “already resolved,” making the tracker unsafe as an operational source of truth. |
| F6 | **P2** | Screen coverage | `CommunityFindScreen` and `CommunityWearablePromptsScreen` still have no dedicated screen-level tests. |
| F7 | **P3** | Accessibility | `SearchBar` clear button remains below the 44/48dp touch-target bar (`18dp` icon + `hitSlop={8}`). |
| F8 | **P3** | Dependent route flags | `CommunityFindScreen.open()` still navigates to classroom/event detail routes without checking whether `communityClassroom` / `communityEvents` are also registered. |

## 5. Per-finding detail

### F1 (P1) — `CommunityVoiceNoteDetail` is absent and voice search still opens the wrong route

**Files:** absent `src/screens/community/CommunityVoiceNoteDetail*`; `src/screens/community/CommunityFindScreen.tsx:80-86`; `src/screens/community/communityNavTypes.ts:43-59`; `src/navigation/CommunityNavigator.tsx:90-106`.

```ts
case 'post':
case 'voice_note_transcript':
  navigation.navigate('CommunityThread', { postId: result.targetId });
  break;
```

The current main tree has no file or symbol named `CommunityVoiceNoteDetail` / `VoiceNoteDetail`. The only voice route in the typed community stack is `CommunityVoiceComposer`, and the navigator registers only the composer route behind `communityVoiceNotes`; it does not import or register a voice-note detail screen. A `voice_note_transcript` search result therefore still opens `CommunityThread` with `result.targetId`, even though voice-note search targets are voice-note IDs, not community post IDs.

**Recommended fix:** Add `CommunityVoiceNoteDetailScreen` per D4B, add `CommunityVoiceNoteDetail: { voiceNoteId: string }` to `CommunityStackParamList`, register the route inside the correct voice/search flag containment, and change the `voice_note_transcript` branch to navigate to that detail route with `voiceNoteId: result.targetId`.

### F2 (P1) — D5B γ server-evaluated feature flags are absent

**Files:** `src/config/featureFlags.ts:240-258`; absent mobile API/hook for `/me/feature-flags`.

```ts
communitySearch: readFlag('EXPO_PUBLIC_FF_COMMUNITY_SEARCH', false),
communityWearablePrompts: readFlag(
  'EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS',
  false,
),
```

The implementation remains local Expo env gating. The required D5B γ pattern was to use server-evaluated flags via `GET /me/feature-flags`, not client headers (α) or JWT claims (β). Current main has no route, client, hook, cache key, or screen integration for `/me/feature-flags`, so the mobile client cannot know the server-evaluated set of result kinds it is allowed to render/open.

**Recommended fix:** Add a typed `meFeatureFlagsApi` client for `GET /me/feature-flags`, use it to drive the community search/wearable surfaces, and ensure the backend filters search result kinds using the same server-side evaluation so the client never receives a result kind without a registered destination.

### F3 (P2) — Missing flag-off static pin tests for the two new routes

**Files absent:** `src/navigation/__tests__/communitySearchFlagOff.test.ts`, `src/navigation/__tests__/coachCommunityWearablePromptsFlagOff.test.ts`.

Existing flag-off tests cover prior community lanes (`communityVoiceFlagOff`, `communityClassroomFlagOff`, `communityChallengesFlagOff`), but no equivalent static test pins the new `CommunityFind` or `CoachCommunityWearablePrompts` route gates. This leaves the two highest-risk new routes vulnerable to a future accidental move outside their ternaries with no targeted failure.

**Recommended fix:** Add static source tests that assert each flag defaults `false`, the navigator ternary appears before the screen registration, and the route name appears exactly once.

### F4 (P2) — No mobile telemetry emit sites for the new search/wearable flows

**Files:** `src/screens/community/CommunityFindScreen.tsx`, `src/hooks/useCommunitySearch.ts`, `src/api/communitySearchApi.ts`, `src/screens/community/CommunityWearablePromptsScreen.tsx`.

The PR adds user-visible surfaces but no mobile-side telemetry for search submitted, search result tapped by kind, wearable prompts generated, prompt dismissed, or prompt acted-on. R0 explicitly treats telemetry on every flow as a Google-quality bar item, and the backend companion work registered/emitted backend events; the mobile half remains blind.

**Recommended fix:** Add mobile telemetry events for submit/tap/generate/dismiss/act-on and pin the event names in a doctrine/telemetry test in the same PR.

### F5 (P2) — Tracking issue #255 exists but falsely marks unresolved items as resolved

**Issue:** `https://github.com/BradleyGleavePortfolio/growth-project-mobile/issues/255`.

Issue #255 is open and has the required R82-style sections, but its “Already resolved in PR #251 fix cycle” section checks off `CommunityVoiceNoteDetail`, server-side kind filtering, and flag-off static pin tests. Current main has none of those artifacts. This is worse than a missing tracker because it tells the next operator that the riskiest doors are closed when they are not.

**Recommended fix:** Edit issue #255 immediately: move the three false “already resolved” items back into the required checklist, add this post-merge audit path as a reference, and keep the issue open until a clean re-audit verifies the artifacts on main.

### F6 (P2) — No dedicated screen tests for the two new screens

**Files absent:** `src/screens/community/__tests__/CommunityFindScreen.test.tsx`, `src/screens/community/__tests__/CommunityWearablePromptsScreen.test.tsx`.

The hook/component unit tests do not exercise screen integration: prerequisite loading/error states, flag-off runtime guards, result routing by kind, a11y announcements, role gating, mutation busy states, and all wearable-prompt screen branches remain unpinned.

**Recommended fix:** Add dedicated RNTL v14 screen tests for both screens. `CommunityFindScreen` must include a voice result routing case that would have caught F1.

### F7 (P3) — Search clear button touch target remains too small

**File:** `src/components/community/SearchBar.tsx:48-61`.

The clear `Pressable` wraps an 18dp icon with `hitSlop={8}` and no explicit `minWidth`/`minHeight`, yielding an effective target below the iOS 44dp / Android 48dp bar.

**Recommended fix:** Give the `Pressable` `minWidth: 44`, `minHeight: 44`, centered content, and keep or adjust hitSlop only if layout needs it.

### F8 (P3) — Search result routing still ignores dependent route flags

**File:** `src/screens/community/CommunityFindScreen.tsx:87-96`.

`classroom_lesson` and `event` results navigate directly to `CommunityLessonDetail` and `CommunityEventDetail`; those routes are only registered when `communityClassroom` / `communityEvents` are on. If search is on while either dependent flag is off, tapping the result can no-op or warn instead of showing a deliberate unavailable state.

**Recommended fix:** Either server-filter dependent kinds according to server-evaluated flags (preferred with F2) or guard each navigation branch against the local route-registration flag as defense in depth.

## 6. Correctly implemented / do not regress

- `CommunityFind` route containment is currently correct: the screen registers only behind `featureFlags.communitySearch`.
- `CoachCommunityWearablePrompts` route containment is currently correct: the screen registers only behind `featureFlags.communityWearablePrompts`.
- Both flags default `false` locally, so the flawed surfaces are dark by default.
- Search reads are cursor-paginated and bounded; `useCommunitySearch` disables network calls until both workspace ID and a non-empty trimmed term exist.
- The Zod schemas in `communitySearchApi.ts` are strict and match the camelCase wire shape described in the prior audit.

## 7. R0/R72/R74/R77/R79/R81/R82 compliance summary

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned production patterns | **PASS on inspected PR files** | No new P0 banned-pattern hit was found in the re-audit pass. |
| R72 exhaustive audit | **PASS** | Full PR diff inventory and current-main target seams were swept; this pass did not stop at the first blocking item. |
| R74 identity/trailers | **NO AI TRAILER FOUND** | Merge commit contains only Bradley human co-author text, consistent with the earlier audit’s R0 trailer sweep; no assistant/AI trailer was found. |
| R77 read-only | **PASS** | Audit used detached read-only worktrees; no repo edits/commits/pushes were performed. |
| R79 pins | **FAIL** | The required flag-off pins for the new community search and wearable-prompt routes are absent. |
| R81 gate | **FAIL** | P1/P2/P3 findings remain; the PR is not clean. |
| R82 tracking | **FAIL** | Issue #255 exists but misstates unresolved work as complete. |

## 8. Hectacorn bar

Apple/Notion/Google would not ship this surface with the search route able to return a voice-note transcript result that has no detail destination, no server-evaluated result-kind filtering, and no telemetry. The feature is dark by default, which prevents immediate production exposure, but R81 audits the merged surface in any regard; D4B and D5B must land and re-audit clean before any flag-on.

## 9. Required follow-up before flag-on / R81 closure

1. **P1:** Build and register `CommunityVoiceNoteDetail`; route `voice_note_transcript` results there.
2. **P1:** Implement D5B γ server-evaluated flags (`GET /me/feature-flags`) and use the same server evaluation to filter result kinds.
3. **P2:** Add `communitySearchFlagOff.test.ts` and `coachCommunityWearablePromptsFlagOff.test.ts`.
4. **P2:** Add mobile telemetry emit sites and event-name pins.
5. **P2:** Correct issue #255 so it no longer claims absent artifacts are resolved.
6. **P2:** Add screen-level tests for `CommunityFindScreen` and `CommunityWearablePromptsScreen`.
7. **P3:** Fix the search clear button touch target.
8. **P3:** Guard dependent classroom/event navigation until server filtering makes those kinds impossible when their routes are absent.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/251`.
- Tracking issue: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/issues/255`.
- Prior audit input: `/home/user/workspace/audit-work/outputs/PR251_AUDIT_2026-06-14.md`.
