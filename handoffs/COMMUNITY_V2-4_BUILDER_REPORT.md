# Community v2-4 — AI Inbox Triage Builder Report

**Builder:** Dynasia G &lt;dynasia@trygrowthproject.com&gt;
**Slice:** v2-4 (AI inbox triage) — read-only triage summary for the coach community inbox.
**Outcome:** Two PRs delivered (backend first, then mobile). Both branches rebased on `origin/main` with no drift.

| PR | Repo | Branch | Number | Head SHA | Base |
| --- | --- | --- | --- | --- | --- |
| Backend | `growth-project-backend` | `feature/community-v2-ai-triage` | **#391** | `23414c81000df683e8858dfd1727856256d0b4ab` | `origin/main` `3f271b39` |
| Mobile | `growth-project-mobile` | `feature/community-v2-ai-triage-mobile` | **#239** | `97954d253eb5517948d66421bebbc285f7c93604` | `origin/main` `79c0a9b` |

- Backend PR: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/391
- Mobile PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/239

---

## Critical constraints — disposition

| Constraint | Status | Where / how |
| --- | --- | --- |
| **R69 — ZERO Prisma diff** | ✅ | Triage derived on read from existing inbox data; cached in-process via `TriageCacheService` (Map) with freshness-key auto-invalidation (`itemCount:newestCreatedAt`). `prisma/` untouched. |
| **NO autonomous send (P0)** | ✅ | `AiTriageService` injects only gateway + repo + access + cache; capability is not `draft.`-prefixed; no send/post/materialise/approve method on any collaborator. Backend test asserts the structural absence. Mobile client only READS — no write/approve method exists; `.strict()` Zod rejects any smuggled `draft_reply`. |
| **Tenant isolation in prompt assembly (P0)** | ✅ | Prompt assembled from only the requesting coach's workspace data; backend test proves isolation. Mobile read scoped by auth. |
| **Five triage categories EXACTLY** | ✅ | `urgent`, `win_to_celebrate`, `form_check`, `general`, `no_action_needed` with source message IDs. `buckets` length is fixed at 5 on the wire; mobile Zod `.length(5)` + enum reject any sixth category. |
| **Flags default OFF + kill switch** | ✅ | `FEATURE_COMMUNITY_AI_TRIAGE` / `EXPO_PUBLIC_FF_COMMUNITY_AI_TRIAGE` both default OFF. Server kill switch returns a byte-identical 404; mobile flag-off renders the unchanged v2-2/v1-6 inbox and never touches the AI subsystem. |
| **Mobile builds on `79c0a9b` (v2-2 acks)** | ✅ | Ack surface integrated, not disturbed; flag-off test proves the v2-2 row is unaffected. |
| **Anti-fabrication** | ✅ | Mobile consumes only what backend #391 exposes; backend file:line citations in the mobile PR body and source comments. |
| **R0 forbidden literals** | ✅ | Lint over added lines (incl. comments) across all 8 mobile files + backend files: zero `as unknown as`/`as any` (outside tests), `@ts-ignore`, TODO/FIXME/placeholder, `Coming soon`, empty catch, `.catch(() => undefined)`, `sonnet`, raw hex, or pictograph emoji. |
| **AI failure mode** | ✅ | Degraded/timeout → typed `error` state; inbox untouched; no silent swallow (`retry: false`, error propagates to `isError`); no fabricated "all clear". |
| **Mobile UI doctrine** | ✅ | Semantic tokens only, font-weight ≤600, 48dp header target, reduced-motion safe (no animation), typed empty/error states, a11y labels. `urgent` framed professionally as "Needs you soon", never panicky. Card visually distinct (left accent outline) + "AI triage" eyebrow. |

---

## Backend (PR #391)

**New module** `src/community/ai-triage/`:
- `triage-output.schema.ts` — `TRIAGE_CATEGORIES` (:26-32), `TRIAGE_SOURCE_KINDS` (:40), `TriageItemSchema` (:48-55), `TriageBucketSchema` (:61-66), `TriageResponseSchema` (:85-92).
- `ai-triage.feature.ts`, `ai-triage-flag.guard.ts` — feature flag + route guard (kill switch).
- `prompts/inbox-triage.prompt.ts` — tenant-scoped prompt assembly.
- `triage-cache.service.ts` — in-process cache, `TRIAGE_CACHE_TTL_MS` (:21, 5 min), freshness-key invalidation.
- `ai-triage.service.ts` — derive-on-read service (no write path).
- `ai-triage.controller.ts` — `@Controller('community/ai-triage')` (:43), `@Get()` (:47), `getTriage` (:58), route block (:43-64).
- `ai-triage.module.ts` — module wiring.

**Modified:** `src/ai-credits/ai-credits.constants.ts` (added `'community_ai_triage'` to `COACH_AI_METERED_CAPABILITIES`); `src/community/community.module.ts` (imported `AiTriageModule` after `AckModule`).

**Tests** (`test/community/ai-triage/`): `ai-triage.service.spec.ts`, `triage-cache.service.spec.ts`, `ai-triage-flag.guard.spec.ts`, `triage-output.schema.spec.ts` — 44 tests. Full community bar (`npx jest --runInBand test/community --testPathIgnorePatterns='rls-'`): **235 passed, 0 failed**. R0 lint clean.

---

## Mobile (PR #239)

**Files (8 total):**
- `src/config/featureFlags.ts` — `communityAiTriage` flag, default OFF.
- `src/api/communityAiTriageApi.ts` — Zod mirror of the backend contract (field-for-field, cited) + `fetchInboxTriage()` (`GET /community/ai-triage`), `.parse()`-validated; `triageQueryKeys`, `TRIAGE_KEY_VERSION='v1'`.
- `src/hooks/useInboxTriage.ts` — React Query read wrapper (`staleTime` 5 min matching backend TTL, `retry: false`, never swallows).
- `src/components/community/AiTriageCard.tsx` — presentational card; typed `loading | error | empty | ready` states; AI-distinct styling + eyebrow; a11y labels; reduced-motion safe.
- `src/screens/community/CoachCommunityInboxScreen.tsx` — flag-gated `InboxTriageBanner` as `ListHeaderComponent` + empty branch.
- `src/api/__tests__/communityAiTriageApi.test.ts`
- `src/screens/community/__tests__/coachCommunityInboxAiTriageFlagOff.test.tsx`
- `src/components/community/__tests__/AiTriageCard.test.tsx`

**Tests:** `npx tsc --noEmit` clean (only the allowed baseline expo-notifications TS1010). Targeted jest across the 3 new suites: **25 passed, 25 total** (Zod drift guards, failure propagation, flag-off invariance, all render states + a11y).

**Backend file:line citations** (mobile PR body + source comments): `triage-output.schema.ts:26-32 / :40 / :48-55 / :61-66 / :85-92`, `ai-triage.controller.ts:43-64`, `triage-cache.service.ts:21`.

---

## Mechanics notes
- Worktrees: `/home/user/workspace/tgp/builder-v2-4-{backend,mobile}`. `node_modules` symlinked from sibling builder worktrees (gitignored).
- Mobile gitignore `node_modules/` (trailing slash) does NOT match the symlink — files staged **explicitly by path**, never `git add -A`. Verified exactly 8 files staged, no `node_modules`.
- All git/gh via bash `api_credentials=["github"]`; PR bodies via `gh api ... -F body=@file`. Title-only commits. Both branches rebased on `origin/main` before push (no drift).
