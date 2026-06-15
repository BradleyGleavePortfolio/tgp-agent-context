**CHANGES_REQUESTED — P0: 0 · P1: 2 · P2: 6 · P3: 2 — NEW since paired audit: P0: 0 · P1: 0 · P2: 2 · P3: 0**

# Post-Merge PR #251 Solo Re-Audit — R81 Strict Mode — 2026-06-15

## 1. Scope and method

- **Repo / PR:** `BradleyGleavePortfolio/growth-project-mobile#251` — `feat(community): v3-4 search + wearable prompts (mobile) — EXPO_PUBLIC_FF_COMMUNITY_SEARCH off, EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS off`.
- **Merge commit:** `bdc6d96b7fcbabe568032ac0ddce5510d334e8a8`.
- **Current main audited:** `64e2de4dd4625e20fa6b41b7678d999be53ba4fc` (`feat(mwb): EW2 undo button + command stack (mobile) — EXPO_PUBLIC_FF_MWB_UNDO off (#253)`).
- **Diff inventory source:** `gh api repos/BradleyGleavePortfolio/growth-project-mobile/commits/bdc6d96b7fcbabe568032ac0ddce5510d334e8a8 --jq '.files'` returned 19 touched files, +2396/−0.
- **R72 posture:** no sampling. Every touched file was read in full on current `main`; full numbered contents were saved to `POST_MERGE_PR251_SOLO_main_file_full_read_2026-06-15.txt`.
- **Later-main delta:** of the 19 PR #251 touched files, only `src/config/featureFlags.ts` differs between `bdc6d96b` and current main, and that later diff is unrelated MWB flag work. No later PR251/D4B/D5B fix is present.
- **Evidence files saved:**
  - `POST_MERGE_PR251_SOLO_github_metadata_2026-06-15.txt`
  - `POST_MERGE_PR251_SOLO_git_evidence_2026-06-15.txt`
  - `POST_MERGE_PR251_SOLO_static_sweeps_2026-06-15.txt`
  - `POST_MERGE_PR251_SOLO_key_excerpts_2026-06-15.txt`
  - `POST_MERGE_PR251_SOLO_new_findings_evidence_2026-06-15.txt`
  - `POST_MERGE_PR251_SOLO_backend_wearable_prompts_focus_2026-06-15.txt`

## 2. Verdict rationale

The paired auditor's **CHANGES_REQUESTED** verdict is confirmed, and current `main` is worse than the prior report captured because two wearable-prompts defects were missed. The two P1s remain the blockers: D4B was not implemented (`CommunityVoiceNoteDetail` is absent and `voice_note_transcript` still routes to `CommunityThread` with a voice-note ID), and D5B γ was not implemented (no `/me/feature-flags` mobile API/hook; the shipped gates are local Expo env flags).

Two additional **new P2** findings were found in the wearable prompts surface. First, `CommunityWearablePromptsScreen` starts its data hooks before flag, role, and `clientId` guards; because `useWearablePrompts` enables on `workspaceId` alone and the API omits an absent `clientId`, a malformed/deep-linked route can request coach-only wearable prompt data before rendering the neutral unavailable state. Second, dismiss / mark-acted-on mutation errors are caught by `absorbRejection` but never rendered, despite the comment claiming the error state still renders.

## 3. Prior-finding verification

| Prior ID | Prior severity | Solo result on current `main` | Evidence | Solo severity |
|---|---:|---|---|---:|
| F1 — `CommunityVoiceNoteDetail` absent / wrong voice route | P1 | **STILL_PRESENT** | `rg` finds no `CommunityVoiceNoteDetail` / `VoiceNoteDetail`; `CommunityFindScreen.open()` sends both `post` and `voice_note_transcript` to `CommunityThread` with `{ postId: result.targetId }` (`CommunityFindScreen.tsx:80-86`). | P1 |
| F2 — D5B γ server-evaluated flags absent | P1 | **STILL_PRESENT** | `featureFlags.ts` still reads `EXPO_PUBLIC_FF_COMMUNITY_SEARCH` and `EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS`; repo search finds no `/me/feature-flags` / `feature-flags` client path in the mobile implementation. | P1 |
| F3 — missing flag-off static pins | P2 | **STILL_PRESENT** | `src/navigation/__tests__` has existing community flag-off pins, but no `communitySearchFlagOff.test.ts` or `coachCommunityWearablePromptsFlagOff.test.ts`. | P2 |
| F4 — missing mobile telemetry emit sites | P2 | **STILL_PRESENT** | PR #251 production files contain no `track(...)`, PostHog, `AnalyticsEvents`, search submit/result-tap, generate/dismiss/act-on telemetry. | P2 |
| F5 — issue #255 misleading tracker | P2 | **STILL_PRESENT** | Issue #255 exists and is open, but its “Already resolved” section still marks `CommunityVoiceNoteDetail`, server-side kind filtering, and flag-off static pin tests as complete while current `main` lacks those artifacts. | P2 |
| F6 — missing screen-level tests | P2 | **STILL_PRESENT** | `src/screens/community/__tests__` has no `CommunityFindScreen.test.tsx` or `CommunityWearablePromptsScreen.test.tsx`. | P2 |
| F7 — SearchBar clear target too small | P3 | **STILL_PRESENT** | `SearchBar.tsx:49-61` still wraps an 18dp icon with `hitSlop={8}` and no explicit `minWidth` / `minHeight`. | P3 |
| F8 — dependent route flags ignored | P3 | **STILL_PRESENT** | `CommunityFindScreen.tsx:87-96` still navigates to `CommunityLessonDetail` / `CommunityEventDetail` without checking `communityClassroom` / `communityEvents`. | P3 |

## 4. D4B / D5B / tracking issue compliance

| Requirement | Result | Evidence |
|---|---:|---|
| D4=B — `CommunityVoiceNoteDetail` must be built | **FAIL** | No `CommunityVoiceNoteDetail` / `VoiceNoteDetail` file or symbol exists under `src/`; only `CommunityVoiceComposer` is registered in `communityNavTypes.ts` / `CommunityNavigator.tsx`. |
| Voice transcript results route to voice detail | **FAIL** | `voice_note_transcript` falls through the same branch as `post` and calls `navigation.navigate('CommunityThread', { postId: result.targetId })`. |
| D5=B+γ — server-evaluated flags via `GET /me/feature-flags` | **FAIL** | No mobile code references `/me/feature-flags`; the only PR #251 gates are local `readFlag('EXPO_PUBLIC_FF_COMMUNITY_SEARCH', false)` and `readFlag('EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS', false)`. |
| Avoid α client header / β JWT claims | **PARTIAL** | No client-header or JWT-claim implementation was found, but the required γ implementation is also absent. |
| Tracking issue #255 exists and is referenced | **PARTIAL / UNSAFE** | Issue #255 exists, is open, has the expected labels, and references PR #251 / Decision 5B; however, it falsely states the D4B/D5B/pin-test work is already resolved. |

## 5. Findings

| ID | Sev | Area | Finding | Status |
|---|---:|---|---|---|
| F1 | **P1** | Voice search / D4B | `CommunityVoiceNoteDetail` is absent; `voice_note_transcript` results still navigate to `CommunityThread` with a voice-note ID. | Prior, still present |
| F2 | **P1** | Feature flags / D5B | Required γ pattern (`GET /me/feature-flags`) is absent; search/wearable prompts remain local Expo env gates. | Prior, still present |
| F3 | **P2** | Flag-off pins / R79 | Missing `communitySearchFlagOff.test.ts` and `coachCommunityWearablePromptsFlagOff.test.ts`. | Prior, still present |
| F4 | **P2** | Telemetry | No mobile telemetry emit sites for search submit/result tap or wearable generate/dismiss/act-on. | Prior, still present |
| F5 | **P2** | R82 tracking | Issue #255 exists but falsely records absent work as already resolved. | Prior, still present |
| F6 | **P2** | Screen coverage | No dedicated screen-level tests for `CommunityFindScreen` or `CommunityWearablePromptsScreen`. | Prior, still present |
| F7 | **P3** | Accessibility | Search clear button remains below 44/48dp minimum target. | Prior, still present |
| F8 | **P3** | Dependent flags | Search result routing still ignores dependent classroom/event route flags. | Prior, still present |
| N1 | **P2** | Wearable prompts / flag + role guards | `CommunityWearablePromptsScreen` starts coach-only prompt queries before flag, role, and `clientId` guards; missing `clientId` omits the query filter and fetches coach-scoped prompts anyway. | **NEW** |
| N2 | **P2** | Wearable prompts / action failure UX | Dismiss / mark-acted-on failures are caught and swallowed with no rendered error state or retry affordance. | **NEW** |

## 6. New findings detail

### N1 (P2) — Wearable prompts data hooks run before the screen proves the feature, role, and target client are allowed

**Files:** `src/screens/community/CommunityWearablePromptsScreen.tsx:64-74,141-196`; `src/hooks/useWearablePrompts.ts:49-66`; `src/api/communityWearablePromptsApi.ts:176-212`.

```tsx
const me = useCommunityMe();
const workspaceId = me.data?.workspace_id ?? undefined;
const role = me.data?.membership?.role;
const isCoachOrOwner = role === 'coach' || role === 'owner';

const list = useWearablePrompts({ workspaceId, clientId });
const generate = useGenerateWearablePrompts(workspaceId);
const dismiss = useDismissWearablePrompt(workspaceId);
const actOn = useActOnWearablePrompt(workspaceId);

// Defense-in-depth #2: flag off.
if (!featureFlags.communityWearablePrompts) {
  return neutralUnavailable('wearable-prompts-flag-off');
}

// Defense-in-depth #3: non-coach/owner (or missing client target) sees the
// neutral state, never coach data.
if (!isCoachOrOwner || !clientId) {
  return neutralUnavailable('wearable-prompts-not-coach');
}
```

```ts
export function useWearablePrompts(
  opts: UseWearablePromptsOptions,
): UseQueryResult<PromptListResponse, Error> {
  const enabled = Boolean(opts.workspaceId);
  return useQuery({
    queryKey: wearablePromptsKeys.list(
      opts.workspaceId ?? '∅',
      opts.clientId,
      opts.includeDismissed,
    ),
    enabled,
    queryFn: () =>
      communityWearablePromptsApi.list(opts.workspaceId as string, {
        clientId: opts.clientId,
        includeDismissed: opts.includeDismissed,
      }),
    staleTime: 30_000,
  });
}
```

```ts
function listQueryParams(opts: ListPromptsParams): Record<string, string> {
  const params: Record<string, string> = {};
  if (opts.clientId) params.clientId = opts.clientId;
  if (opts.includeDismissed) params.includeDismissed = 'true';
  const limit = opts.limit ?? WEARABLE_PROMPTS_PAGE_LIMIT;
  if (Number.isFinite(limit) && limit > 0) params.limit = String(limit);
  return params;
}
```

This violates the screen's own defense-in-depth contract. The flag-off and missing-client guards are below the hooks, while `useWearablePrompts` enables as soon as `workspaceId` exists. If this route is ever reached while the flag is off, or with a malformed route that lacks `clientId`, the list query is still eligible to fire before the screen returns the neutral unavailable state. The missing-client case is especially bad because `listQueryParams` simply omits `clientId`; backend context confirms `ListPromptsQuerySchema.clientId` is optional and `listForCoach` then returns coach-scoped active prompts without a client filter.

Severity is **P2**: the navigator flag currently makes the screen unreachable in the normal flag-off path, but this is exactly the defense-in-depth layer that should protect the health-data surface if the route gate regresses (and F3 says there is no static pin for that gate). It must be fixed before any flag-on.

**Recommended fix:** Add an explicit `enabled` option to `useWearablePrompts` and call it as `enabled: featureFlags.communityWearablePrompts && !prerequisiteLoading && !prerequisiteError && isCoachOrOwner && Boolean(workspaceId) && Boolean(clientId)`. Also make the hook itself require `clientId` for this screen path (or expose a separate intentionally named all-clients list hook), and add a screen test asserting flag-off / missing-client / non-coach states make zero wearable-prompts API calls.

### N2 (P2) — Dismiss and mark-acted-on failures are silently swallowed

**File:** `src/screens/community/CommunityWearablePromptsScreen.tsx:84-111,229-235`.

```tsx
// The mutation error is surfaced via the hook's isError flag; this handler
// absorbs the rejected promise so it does not bubble as an unhandled
// rejection (it is NOT a silent swallow — the error state still renders).
const absorbRejection = useCallback((): void => undefined, []);

const onDismiss = useCallback(
  (promptId: string) => {
    setBusyId(promptId);
    void dismiss
      .mutateAsync(promptId)
      .catch(absorbRejection)
      .finally(() => setBusyId(null));
  },
  [dismiss, absorbRejection],
);

const onActOn = useCallback(
  (promptId: string) => {
    setBusyId(promptId);
    void actOn
      .mutateAsync(promptId)
      .catch(absorbRejection)
      .finally(() => setBusyId(null));
  },
  [actOn, absorbRejection],
);
```

```tsx
{generate.isError ? (
  <Text
    style={[styles.errorNote, { color: semanticColors.accentText }]}
    testID="wearable-prompts-generate-error"
  >
    Could not generate prompts. Please try again.
  </Text>
) : null}
```

The comment says the caught mutation errors still render, but only `generate.isError` is rendered. Static grep of the screen finds no `dismiss.isError`, `actOn.isError`, `wearable-prompts-dismiss-error`, `wearable-prompts-act-error`, or equivalent per-card error path. A coach can tap “Dismiss” or “Mark acted on,” lose the busy state after `.finally`, and receive no feedback that the server rejected the mutation or the network failed.

Severity is **P2**: this is a correctness and trust defect in the coach workflow, not polish. The screen mutates coaching prompt state; failed actions must be visible and retryable before the feature flag can flip on.

**Recommended fix:** Track per-action error state keyed by prompt ID and action (`dismiss` / `actOn`), render an inline error under the affected card (or a live-region status) with a retry affordance, and add screen tests for rejected dismiss/act-on mutations. If relying on React Query mutation `isError`, wire `dismiss.isError` and `actOn.isError` into rendered UI and reset them deliberately on the next attempt.

## 7. Rules check

| Rule | Status | Evidence |
|---|---:|---|
| R0 banned production patterns | **PASS on PR #251 production files** | Static grep over changed production files found no `Coming soon`, `@ts-ignore`, `.catch(() => undefined)`, `as unknown as`, or `as any`. N2 uses `.catch(absorbRejection)`, not the exact R0 banned text, but it is still a P2 functional swallow. |
| R0 assistant-attribution trailer ban | **PASS** | Merge commit trailer grep found only `Co-authored-by: Bradley Gleave <bradley@bradleytgpcoaching.com>`, not an AI / assistant trailer. |
| R72 exhaustive audit | **PASS** | All 19 touched files were read in full on current main; surrounding navigator, feature flag, tracking issue, and backend wearable-prompt semantics were inspected. |
| R74 identity | **NOTE** | No AI names or assistant trailers were found. The historical GitHub squash merge metadata is not rewritten by this audit. |
| R77 read-only | **PASS** | Audit worktrees were used read-only; no repo source edits, commits, or pushes were performed. |
| R79 pin discipline | **FAIL** | The new `communitySearch` and `communityWearablePrompts` route gates still lack dedicated static flag-off pin tests. |
| R81 gate | **FAIL** | P1/P2/P3 findings remain on current main; the PR is not clean. |
| R82 tracking | **FAIL** | Issue #255 exists, but its resolved checklist is materially false and would mislead a fixer/flag-flip operator. |

## 8. Correctly implemented / do not regress

- `CommunityFind` remains registered only inside the `featureFlags.communitySearch` ternary.
- `CoachCommunityWearablePrompts` remains registered only inside the `featureFlags.communityWearablePrompts` ternary.
- Both local Expo flags still default `false`.
- Search requests are cursor-paginated and gated on a non-empty trimmed term.
- Zod schemas in the two API clients remain `.strict()` at the network boundary.
- No raw hex, `fontWeight: '700'|'800'`, `TODO`/`FIXME`/`XXX`, AsyncStorage production import, or animation/useNativeDriver issue was found in the changed production files.
- RNTL v14 `renderHook` usage in the changed tests is awaited.

## 9. Recommendation

Keep PR #251 in **CHANGES_REQUESTED** status for post-merge R81 accounting. Before any flag-on or R81 closure, fix all prior findings plus the two new P2s in this report, then run a fresh adversarial re-audit to CLEAN. Highest order:

1. **P1:** Build and register `CommunityVoiceNoteDetail`; route `voice_note_transcript` results with `voiceNoteId`, not `postId`.
2. **P1:** Implement D5B γ server-evaluated flags via `GET /me/feature-flags` and server-filter search result kinds accordingly.
3. **P2:** Add the missing flag-off pin tests.
4. **P2:** Fix wearable-prompts hook enablement so flag-off, non-coach, and missing-client states make zero prompt API calls.
5. **P2:** Render dismiss / act-on mutation failures with retryable feedback.
6. **P2:** Add mobile telemetry emit sites and pins.
7. **P2:** Correct issue #255's false “Already resolved” checklist.
8. **P2:** Add screen-level tests for both new screens.
9. **P3:** Fix the `SearchBar` clear-button touch target.
10. **P3:** Guard classroom/event result routing against dependent route flags until server filtering makes those kinds impossible when disabled.

## 10. Source references

- Repo: `https://github.com/BradleyGleavePortfolio/growth-project-mobile`.
- PR: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/251`.
- Tracking issue: `https://github.com/BradleyGleavePortfolio/growth-project-mobile/issues/255`.
- Merge commit: `bdc6d96b7fcbabe568032ac0ddce5510d334e8a8`.
- Current main audited: `64e2de4dd4625e20fa6b41b7678d999be53ba4fc`.
