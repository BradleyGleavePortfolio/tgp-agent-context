# Community v1-5 Mobile Client Tab — Builder Brief

**You are Opus 4.8. R31: builder. No auditor work, no fixer work, no `sonnet` references.**

## Mission

Build the **mobile client Community tab** end-to-end. v1-4 backend (now merged `5f6bedf`) provides realtime/push/telemetry; v1-5 is the **client mobile surface** that consumes it. Coach surfaces come in v1-6. Scope per `COMMUNITY_EXECUTION_PLAN.md` §"PR v1-5".

## Worktree & branch

- Worktree: `/home/user/workspace/tgp/mobile-community-v1-5`
- Branch: `feature/community-v1-mobile-client` (already created off `origin/main` at `2883b22`)
- Repo: `BradleyGleavePortfolio/growth-project-mobile`
- Author: `Dynasia G <dynasia@trygrowthproject.com>`
- Commits: title-only, no body, no emoji, no trailers
- Use `api_credentials=["github"]` for `gh` CLI

## Ground truth (read FIRST, in order)

1. `tgp-agent-context/COMMUNITY_EXECUTION_PLAN.md` §"PR v1-5" — canonical scope
2. `tgp-agent-context/COMMUNITY_PRODUCT_PLAN.md` §§1-6 — product principles (Spaces, timeline, Lab, ack signals, time-locked content, today object)
3. `tgp-agent-context/ROMAN_VOICE_POLICY.md` (PR #9) — Phase 1 is chat-MVP only; Phase 2 is in-app surfaces (so v1-5 community tab gets Roman copy in empty states + onboarding only, NOT push/email — those wait for Phase 3)
4. Backend v1-4 community APIs already merged. Inspect `src/community/**` on `growth-project-backend@5f6bedf` for the exact endpoint shapes you'll consume.

## Scope (per execution plan)

### Files to create (mobile)

```
src/screens/community/
  CommunityTabScreen.tsx           ← container with sub-tab routing
  CommunityTodayScreen.tsx         ← "today" object — universal home for what's happening for me
  CommunitySpaceScreen.tsx         ← a Space view (one of: Hall / Cohorts / DMs / Lab)
  CommunityThreadScreen.tsx        ← single thread / post detail
  CommunityDmListScreen.tsx        ← DM inbox
  CommunityDmThreadScreen.tsx      ← single DM conversation
  CommunityComposerScreen.tsx      ← compose post / message / reaction
src/components/community/
  **                               ← shared components (PostCard, ThreadHeader, ReactionBar,
                                      UnreadBadge, EmptyState, SpaceTabBar, DmRow, MessageBubble,
                                      ComposerInput, TimelineMarker, AckSignalChip, etc.)
src/api/communityApi.ts            ← typed client for all v1-4 backend endpoints
src/navigation/ClientNavigator.tsx ← add Community tab + deep links
src/config/featureFlags.ts         ← add 4 Expo public flags below
```

### Feature flags (default OFF)

- `EXPO_PUBLIC_FF_COMMUNITY_TAB` — master tab on/off
- `EXPO_PUBLIC_FF_COMMUNITY_HALL` — Hall space type
- `EXPO_PUBLIC_FF_COMMUNITY_COHORTS` — Cohort spaces
- `EXPO_PUBLIC_FF_COMMUNITY_DM` — direct messages

When `EXPO_PUBLIC_FF_COMMUNITY_TAB=false`, the tab MUST NOT appear in `ClientNavigator` and its deep-link route MUST NOT register. v1-5 is otherwise dead code at build time.

### Spaces (per product plan §2.1)

Three fixed space types — NOT infinite Slack-style channels:
- **Hall** — coach-wide announcements + cohort posts
- **Cohorts** — coach-defined groups (training blocks, programs)
- **DMs** — coach↔client and client↔client (per §2.10 gates)

### API hooks required (from v1-4 backend)

- `GET /community/me` — my spaces, unread counts, today object
- `GET /community/spaces/:spaceId/posts?cursor=...` — paginated posts (keyset)
- `GET /community/posts/:postId/thread` — comments + reactions
- `POST /community/posts` — new post (idempotency key required)
- `POST /community/posts/:postId/reactions` — react / unreact
- `GET /community/dms` — DM inbox
- `GET /community/dms/:threadId/messages?cursor=...` — DM thread
- `POST /community/dms/:threadId/messages` — send DM (idempotency key required)
- WebSocket subscription on the realtime channel for live updates (already wired by v1-4 — read its types from backend `src/community/realtime/community-realtime.types.ts`)
- PostHog telemetry events: surface them via existing analytics wrapper

### UX requirements (HARD, per audit gate)

1. **No spinner-only empty states.** Every empty state has friendly copy + a primary action ("Be the first to post" / "Join your first cohort" / "Send your coach a message").
2. **No placeholder launch text.** No "Coming soon" anywhere.
3. **Accessible touch targets.** ≥44pt iOS / 48dp Android. Use design-system tokens.
4. **Standardize on `semanticColors`/`tokens.ts`** — do NOT use legacy `ThemeColors`.
5. **Unread badge updates** live via the WebSocket subscription, not polling.
6. **The UI must say "client" where it refers to the calling user's role** — never "user", never "member" alone where ambiguous.
7. **Optimistic updates** on post/reaction/send-DM with rollback on failure.

### Roman voice (Option 3, Phase 1 scope)

- Empty states + onboarding inside the Community tab: **Roman voice, dry-joke rate 0.125** (use the Roman voice helpers from `ROMAN_VOICE_POLICY.md` §3 stems)
- Push and email copy: **DEFER** to Phase 3 — not v1-5 scope
- Roman avatar usage: monogram in compact rows, smile for success/milestone moments (per voice policy §4 avatar matrix)
- If the Roman voice helpers don't exist as code yet, hard-code the policy-compliant strings inline with a `// ROMAN_VOICE: <stem-ref>` comment so a Phase 1 mobile builder can centralize later

### Tests (HARD gate, R66)

You MUST land:
1. Screen render tests for all 7 new screens (Jest + RN Testing Library)
2. API contract tests — for each endpoint hook: success, 401, 403, 5xx, retry, optimistic-update + rollback
3. **Feature-flag-off route absence** — assert `EXPO_PUBLIC_FF_COMMUNITY_TAB=false` → tab does NOT appear in navigator and deep link is unregistered
4. Empty-state tests — each empty state has copy + primary action (not spinner-only)
5. Unread-badge-updates test — simulate WebSocket message, assert badge increments without polling

## Hard gates (R66 — full-suite-before-PR)

1. **Zero schema mutation** — N/A (mobile only)
2. **Entitlement-guard pin equivalent on mobile** — none, but DO NOT touch any auth/routing guard outside the Community tab files
3. **No new permissions** (mic, location, etc.). Only push permission, which is already requested by FCM wire (#228 merged)
4. **No new heavyweight deps.** You may add at most: one WebSocket client wrapper if backend uses a non-Expo provider (else use built-in). Justify in PR body if added.
5. **All 4 flags default OFF.** Grep prove in PR body.
6. **No `sonnet` references** anywhere in your additions.
7. **Bundle size** — note the delta in PR body. If >2% growth, justify.
8. **All tests pass:** `npx jest` full lane.
9. **TS strict:** `npx tsc --noEmit` clean.
10. **Lint clean:** existing `eslint` config.

## Workflow

1. Read ground-truth docs (above).
2. Inspect backend v1-4 endpoints + types — confirm the exact API surface.
3. Build in this order (push at each milestone — R64):
   a. `featureFlags.ts` additions + flag-off route gating in `ClientNavigator.tsx`
   b. `communityApi.ts` — typed hooks for all endpoints (start with read-only)
   c. `CommunityTabScreen.tsx` + sub-tab routing skeleton
   d. `CommunityTodayScreen.tsx` (entry point)
   e. `CommunitySpaceScreen.tsx` + `CommunityThreadScreen.tsx`
   f. `CommunityDmListScreen.tsx` + `CommunityDmThreadScreen.tsx`
   g. `CommunityComposerScreen.tsx`
   h. `src/components/community/**` — extracted shared components
   i. Optimistic update wiring + WebSocket subscription
   j. Empty states with Roman voice + accessibility audit
   k. Tests (each screen + API contract + flag-off + empty state + badge update)
4. Run full test lane. Iterate until green.
5. Open PR via `gh pr create` (use `api_credentials=["github"]`). Title: `community: v1-5 mobile client tab`. Body: scope summary, file list, flag-off proof, test counts, bundle delta, Roman voice surfaces enumerated.
6. **R67:** Update `/tmp/tgp-agent-context/handoffs/dispatch.json` with dispatch + completion entries. Commit + push.
7. Return JSON summary.

## Anti-scope (do NOT do)

- Do NOT build coach-side UI — that's v1-6.
- Do NOT add moderation UI — also v1-6 / later.
- Do NOT touch backend code.
- Do NOT enable any of the 4 flags by default.
- Do NOT wire Roman push/email copy — that's Phase 3.
- Do NOT add real-time multi-cursor / presence — explicit non-goal in MWB §6.5 (and v1-5 doesn't need it).
- Do NOT touch existing wins-feed or other client tabs except the one nav file.

## Deliverables (final message — exact JSON shape)

```json
{
  "pr_url": "...",
  "head_sha": "...",
  "files_added": 0,
  "files_modified": 0,
  "tests_added": 0,
  "loc_delta": 0,
  "flag_defaults_off": ["EXPO_PUBLIC_FF_COMMUNITY_TAB", "EXPO_PUBLIC_FF_COMMUNITY_HALL", "EXPO_PUBLIC_FF_COMMUNITY_COHORTS", "EXPO_PUBLIC_FF_COMMUNITY_DM"],
  "roman_voice_surfaces": ["empty state X", "onboarding Y", ...],
  "bundle_size_delta_pct": 0.0,
  "tsc": "pass",
  "jest_full": "pass",
  "eslint": "pass"
}
```

I (orchestrator) then dispatch a fresh GPT-5.5 R1 auditor.
