# v1-5 Mobile Community Client Tab — SALVAGE & FINISH

**Agent model:** Opus 4.8
**Worktree:** `/home/user/workspace/tgp/mobile-community-v1-5`
**Branch:** `feature/community-v1-mobile-client` (already exists, off mobile `origin/main` at `2883b22`)

## Mission
A previous v1-5 builder agent was cancelled mid-flight. It produced ~4,585 LOC of work (30 new files + 3 modified files) in this worktree but NEVER committed, validated, or pushed. **Your job: finish the work, do NOT rewrite it from scratch.**

Existing work to salvage (uncommitted, present in worktree NOW):

### Modified (3 files)
- `src/config/featureFlags.ts` (+18 LOC) — community feature flags
- `src/navigation/ClientNavigator.tsx` (+49 LOC) — community tab wiring
- `src/navigation/RootNavigator.tsx` (+19 LOC) — community navigator integration

### New (30 files, ~4,499 LOC)
- API + realtime layer: `src/api/communityApi.ts`, `src/api/communityRealtime.ts`, `src/api/__tests__/communityApi.test.ts`
- 13 components: `src/components/community/{AckSignalChip,ComposerInput,DmRow,EmptyState,MessageBubble,PostCard,ReactionBar,RomanAvatar,SpaceTabBar,ThreadHeader,TimelineMarker,UnreadBadge}.tsx`, `index.ts`, `romanVoice.ts`
- Hook: `src/hooks/useCommunity.ts` + test
- Navigation: `src/navigation/CommunityNavigator.tsx` + flag-off test
- 7 screens: `src/screens/community/{CommunityComposerScreen,CommunityDmListScreen,CommunityDmThreadScreen,CommunitySpaceScreen,CommunityTabScreen,CommunityThreadScreen,CommunityTodayScreen}.tsx` + nav types + screens test

## Workflow (precise)
1. **First: assess what's there.** Read every file. Understand the design choices the previous agent made. Do NOT rewrite anything that's structurally fine. Only fix what's broken.
2. **Run TypeScript:** `npx tsc --noEmit` from worktree root. Fix any errors.
3. **Run lint:** `npx eslint src/community src/screens/community src/components/community src/hooks/useCommunity.ts src/api/communityApi.ts src/api/communityRealtime.ts src/navigation/CommunityNavigator.tsx 2>/dev/null` — fix anything actionable.
4. **Run the tests added:** `npx jest src/api/__tests__/communityApi.test.ts src/hooks/__tests__/useCommunity.test.tsx src/screens/community/__tests__/communityScreens.test.tsx src/navigation/__tests__/communityFlagOff.test.ts`. Fix until all pass.
5. **Run the full mobile Jest lane** (non-Detox): `npx jest --testPathIgnorePatterns=detox`. Must pass. Fix regressions if any.
6. **Verify Roman voice integration**: empty states use Roman copy per `ROMAN_VOICE_POLICY.md` Option 3. RomanAvatar uses one of the 5 mascot variants (roman_hero/welcome/chat_smile/chat_neutral/monogram).
7. **Verify all 4 community feature flags default OFF**: `FEATURE_COMMUNITY_CLIENT_TAB`, `FEATURE_COMMUNITY_DMS`, `FEATURE_COMMUNITY_REACTIONS`, `FEATURE_COMMUNITY_REALTIME` — flag-OFF means the tab is hidden entirely (verified by `communityFlagOff.test.ts`).
8. **Commit in title-only format**, no body/emoji/trailers. Author `Dynasia G <dynasia@trygrowthproject.com>`. Suggested commits (split sensibly — don't dump everything in one commit):
   - `feat(community): client tab feature flags + navigator integration`
   - `feat(community): API client + Supabase realtime channel`
   - `feat(community): shared UI components (13)`
   - `feat(community): useCommunity hook`
   - `feat(community): 7 client screens (today, space, thread, composer, DM list, DM thread, tab root)`
   - `test(community): API, hook, screens, flag-off coverage`
9. **Push after every commit** (R64).
10. **Open PR** titled `feat(community): v1-5 mobile client community tab (flag-OFF default)` against `BradleyGleavePortfolio/growth-project-mobile` main. Body should list the 7 screens, 13 components, all 4 flags + their defaults, and the Roman voice integration.
11. **Update `/tmp/tgp-agent-context/handoffs/dispatch.json`** with the salvage journal entry (R67).

## Hard gates (R66)
- `npx tsc --noEmit` exits 0
- All new tests pass
- Full Jest lane passes (no regressions from main)
- All 4 community flags default OFF in `featureFlags.ts`
- `RomanAvatar` component renders one of the 5 approved mascot variants
- No `console.log` left in production paths
- No `any` types added (use proper types from `communityApi.ts` or `src/types/`)
- No reliance on backend endpoints that don't exist yet — community v1-4 backend (`5f6bedf`) is the contract; if you find calls to non-existent endpoints, mock them OR gate them behind a TODO comment + flag

## Hard constraints
- **DO NOT touch any file outside `src/community/*`, `src/components/community/*`, `src/hooks/useCommunity*`, `src/api/community*`, `src/screens/community/*`, `src/navigation/CommunityNavigator.tsx`, `src/navigation/__tests__/communityFlagOff.test.ts`, `src/config/featureFlags.ts`, `src/navigation/ClientNavigator.tsx`, `src/navigation/RootNavigator.tsx`.** Anything else is anti-scope.
- **DO NOT rebuild work that already exists.** If a file is structurally correct, leave it alone.
- **Sonnet 4.6 FORBIDDEN as agent runtime.**

## Deliverables (final message)
- Branch + final commit SHA(s)
- PR URL
- Test counts
- TypeScript exit code
- Files added/modified (full list)
- Token usage
