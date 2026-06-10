# v1-6 Mobile Coach Admin Builder — RESULT: **STOP / REPORT** (no PR opened)

**Status:** STOPPED per brief §5 STOP rule — *"Any backend endpoint you need doesn't exist (report — orchestrator decides)"* and §1.3 *"If an endpoint you need doesn't exist — STOP and report. DO NOT add backend code."*

**Builder:** Opus 4.8 (R31 compliant)
**Worktree:** `/home/user/workspace/tgp/mobile-community-v1-6` on `feature/community-v1-6-coach-admin`
**HEAD:** `5adba0798ffa07c81682976de478902506f6866e` (confirmed = base `5adba07`, clean tree — no changes committed)
**PR:** none opened
**File-surface overlap check:** PASS (mobile-only, backend untouched — and backend remains untouched because I stopped before writing any client code that would imply backend changes)

---

## Why I stopped

The brief asserts (§0, §1) that "Backend coach endpoints already exist in main" and lists 10 minimum API client functions in §1.3. I performed an **exhaustive READ-ONLY enumeration** of every HTTP route in the backend worktree at `/home/user/workspace/tgp/backend-mwb-1`. The result: **5 of the 10 required functions, plus a core screen feature set (cohort member management, aggregated inbox, the Lab), have NO backend endpoint anywhere in the repo** — not in `src/community/` and not in any sibling module.

Building these screens would require either (a) inventing client calls to routes that return 404 — shipping dead/broken UI — or (b) adding backend code, which is explicitly forbidden (mobile-only PR; anti-rebase rule; "DO NOT touch backend repo"). Both violate the brief. Per the STOP contract, the orchestrator decides scope.

---

## Verified backend endpoint inventory (exhaustive)

Searched: every `@Get/@Post/@Patch/@Delete/@Put` under `backend-mwb-1/src/community/**` **and** a whole-repo grep for `cohort`, `invite`, `member`, `assign`, `inbox`, `unanswered`.

### EXISTS — implementable today (5 of 10 brief functions)

| Brief function (§1.3) | Backend route | Source |
|---|---|---|
| `listCohorts()` | `GET /community/cohorts` | `community.controller.ts:72` |
| `getCohort(cohortId)` | `GET /community/cohorts/:cohortId` | `community.controller.ts:80` |
| `listModerationQueue(workspaceId)` | `GET /community/workspaces/:workspaceId/moderation/queue` | `moderation/community-moderation.controller.ts:61` |
| `reportContent(payload)` | `POST /community/moderation/reports` | `moderation/community-moderation.controller.ts:42` |
| `applyModerationAction(itemId, action)` | `PATCH /community/moderation/items/:itemId` | `moderation/community-moderation.controller.ts:73` |

Adjacent existing routes the coach surface could also read: `GET /community/me`, `GET /community/today`, `GET /community/workspaces/:workspaceId`, `GET /community/cohorts/:cohortId/messages`, `GET /community/workspaces/:workspaceId/posts`.

Payload contracts confirmed:
- Moderation report body: `{ target_type: 'message'|'post'|'comment', target_id: uuid, reason: string(≤80), notes?: string(≤2000) }` (`dto/community-moderation.dto.ts:16`).
- Moderation action body: `{ action: 'hide'|'warn'|'ban'|'dismiss', notes?: string(≤2000) }` (`dto/community-moderation.dto.ts:41`). Note brief names `escalate` — backend has NO `escalate`; the enum is `hide|warn|ban|dismiss`. Closest to "escalate" does not exist.
- Moderation item view: `{ id, workspace_id, target_type, target_id, reported_by_user_id, actor_user_id, status: 'open'|'reviewed'|'actioned'|'dismissed', reason, notes, action, created_at, resolved_at }` (`dto/community-moderation.dto.ts:54`).
- Queue list response: `{ items: ModerationItem[] }` (`dto/community-moderation.dto.ts:82`).
- Cohort list: `{ feature_flag_state, cohorts: [{ id, workspace_id, name, is_default, member_count, my_role }] }` (`dto/community-cohort.dto.ts:26`).
- Cohort detail: `{ feature_flag_state, id, workspace_id, name, is_default, member_count, created_at, my_membership: {...}|null }` (`dto/community-cohort.dto.ts:37`). **member_count only — no member rows are exposed.**

### MISSING — no backend route exists (blocks 5 of 10 functions + 2–3 screens)

| Brief function / feature | Needed for | Backend status |
|---|---|---|
| `createCohort(payload)` | `CoachCommunityCohortsScreen` "create cohort" action | **MISSING.** No `POST /community/cohorts`. |
| `inviteMember(cohortId, payload)` | `CohortInviteCta`, cohort detail invite | **MISSING.** No community cohort invite route. (`invite-codes` module is coach→roster onboarding, not cohort membership.) |
| `assignClient(cohortId, clientId)` | cohort detail | **MISSING.** |
| `removeMember(cohortId, memberId)` | `CohortMemberRow` remove | **MISSING.** Cohort member rows are not even returned by any GET (only `member_count`). |
| `listInboxItems()` (aggregated unanswered) | `CoachCommunityInboxScreen`, `InboxItemRow`, `EmptyInbox` | **MISSING.** No `/inbox` / unanswered-aggregation route anywhere in repo. |
| Lab drafts/scheduled endpoints | `CoachCommunityLabScreen` | **MISSING.** Brief already anticipated this ("read-only placeholder … INSPECT FIRST"). Only `GET/POST /community/workspaces/:workspaceId/posts` exists (no draft/scheduled state). |

Whole-repo grep confirmed no cohort-create / cohort-invite / cohort-member / community-inbox endpoint exists outside `src/community` either. `invite-codes.controller.ts` and `sub-coaches.controller.ts` invites are unrelated (roster onboarding / sub-coach team invites).

---

## Recommended descoped plan (for orchestrator decision)

This PR **can** ship as a coherent mobile-only slice against the existing surface — but it would be **~3 screens, not 6**, and would drop 5 of the 10 listed API functions. Two viable paths:

**Option A — Descope to the moderation + read-only cohort slice (recommended; fully implementable now):**
- Screens (3–4): `CoachCommunityHomeScreen` (counts + links), `CoachCommunityCohortsScreen` (read-only list via `GET /cohorts`, NO create CTA), `CoachCommunityCohortDetailScreen` (read-only: name, member_count, messages via existing GET; NO invite/assign/remove), `CoachCommunityModerationScreen` (queue + report + hide/dismiss/warn/ban — full, this is the strongest existing surface).
- Components: `ModerationQueueItem`, `ModerationActionSheet`, `EmptyModerationQueue`, `EmptyCohorts`, `CoachCommunityHeader`, `CohortMemberRow` (display-only if/when member rows ship). Drop `CohortInviteCta`, `EmptyInbox`, `InboxItemRow` until inbox/invite backends land.
- API client `communityCoach.ts`: the 5 EXISTS functions only.
- Note: `applyModerationAction` must use the real enum `hide|warn|ban|dismiss` (no `escalate`). Recommend mapping the brief's "escalate" intent to `warn` or `ban`, or omitting it — orchestrator to confirm UX wording.
- Inbox + Lab + cohort create/invite/member-management: defer to a v1-6b once backend endpoints exist.

**Option B — Hold the whole v1-6 mobile PR** until backend adds: `POST /community/cohorts`, cohort member list + invite/assign/remove routes, an aggregated coach inbox endpoint, and (optionally) Lab draft/scheduled endpoints. This keeps the 6-screen scope intact but is blocked on backend work that is explicitly out of scope for this lane.

I did **not** proceed with either, because choosing scope is the orchestrator's call per the STOP contract, and guessing risks building broken UI against 404s.

---

## Gate status

Not run — no code written (stopped at inspection per contract). Tree is clean at base SHA; existing test count unchanged (no regressions possible). No `package.json` touched. No backend file touched.

## Confirmation of hard rules honored
- R31 (Opus 4.8): OK.
- Backend repo: untouched (read-only inspection only).
- `package.json`: untouched.
- No existing community/* file modified or deleted.
- prisma/schema.prisma: untouched.
