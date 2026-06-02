# PR-HK-FIX-3 Builder Brief — @Roles/@Public decoration on 8 ungated wearables routes

**Builder model:** Opus 4.8 (R0 law — Sonnet 4.6 FORBIDDEN)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Branch from:** `origin/main` AFTER HK-FIX-1 (#358) merges
**Branch name:** `dynasia/pr-hk-fix-3-roles-decoration`
**Worktree path:** create fresh — `/tmp/wt-hk-fix-3`
**Round:** R0 (new PR)
**Commit author EVERY commit:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO `Co-Authored-By`, NO `Generated-By`

---

## Context — why this PR is separate from HK-FIX-1

HK-FIX-1 (#358) fixed three Nest DI reflection defects (A/B/C — bare-provider re-export + two interface-typed optional params missing `@Optional()`). Once those landed, the `roles-enforced.spec.ts` AppModule-graph test got far enough to walk every registered route handler and discovered **8 wearables route handlers that ship without `@Roles()` or `@Public()` decoration** — a security policy gap.

This is a **substantively different defect class** from A/B/C:
- A/B/C were mechanically-identical Nest DI plumbing fixes that didn't change runtime behavior.
- D is a security policy decision per route ("who should be allowed to call this endpoint?"). Each route needs its own answer.

That's why this is its own PR, not bundled into HK-FIX-1.

---

## What this PR fixes

`test/roles-enforced.spec.ts` currently fails with:

```
[RolesEnforced] 8 route(s) are missing role decoration:
- ConnectionsController.startOauth
- ConnectionsController.oauthCallback
- ConnectionsController.list
- ConnectionsController.disconnect
- WearableInsightsController.getClientInsight
- WearableSamplesController.getSamples
- PreferencesController.upsert
- PreferencesController.remove
```

This PR adds the correct `@Roles(...)` decoration to each, per the role assignments locked in by Bradley on 2026-06-02.

---

## Locked-in role assignments (Bradley — 2026-06-02)

| # | Controller.handler | Roles | Stakeholder rationale |
|---|---|---|---|
| 1 | `ConnectionsController.startOauth` | `@Roles('client')` | Coaches who want their own wearable data must use a separate client account. Coach role cannot initiate a connect flow. |
| 2 | `ConnectionsController.oauthCallback` | `@Roles('client')` | Same — only a client account can complete a connect flow. |
| 3 | `ConnectionsController.list` | `@Roles('client', 'coach')` | Clients see their own list; coaches see the connection list for each of their assigned clients (service-layer scopes by `req.user.id` for clients, by assignment relation for coaches). |
| 4 | `ConnectionsController.disconnect` | `@Roles('client')` | Coaches cannot revoke a client's wearable connection. Client-only action. |
| 5 | `WearableInsightsController.getClientInsight` | `@Roles('client')` | The *client-side* snapshot AI summary surfaced in the client's app. Coaches use their **own** AI summary tooling (different controller — `getCoachInsight` is already `@Roles('coach','owner')` on this controller). **Leave any existing caching/persistence behavior as-is** — Bradley explicitly approved not changing that in this PR. |
| 6 | `WearableSamplesController.getSamples` | `@Roles('client', 'coach', 'owner')` | Clients see own data, coaches see assigned clients' data, owners see all. Per-role scoping enforced in the service layer (`SamplesService` — VERIFY before merge). |
| 7 | `PreferencesController.upsert` | `@Roles('client', 'coach')` | Clients set their own preferences; coaches set preferences **on behalf of an assigned client** (Bradley confirmed option (ii) on 2026-06-02). The service/DTO must accept and validate the target client id when called by a coach, and reject if the target is not an assigned client. |
| 8 | `PreferencesController.remove` | `@Roles('client', 'coach')` | Same model as #7. |

---

## The fix (4 files, ~10 line edits)

### File 1: `src/wearables/connections/connections.controller.ts`

Add the `@Roles(...)` import from the auth module (same import path other wearables controllers use — verify with `grep -rn "from.*roles.decorator" src/`).

Decorate each handler:
```ts
@Post('oauth/start')
@Roles('client')
@HttpCode(HttpStatus.OK)
@Throttle({ default: { ttl: 60_000, limit: 10 } })
async startOauth(...) { ... }

@Get('oauth/callback')
@Roles('client')
...
async oauthCallback(...) { ... }

@Get()
@Roles('client', 'coach')
...
async list(...) { ... }

@Delete(':provider')
@Roles('client')
...
async disconnect(...) { ... }
```

### File 2: `src/wearables/insights/wearable-insights.controller.ts`

`getCoachInsight` is already `@Roles('coach', 'owner')` — verify and do not touch.

Add to `getClientInsight`:
```ts
@Get('client/:clientId')
@Roles('client')
async getClientInsight(...) { ... }
```

**DO NOT** add caching, persistence, or remove any existing caching from this endpoint. Bradley explicitly directed: "If it's currently caching/persisting just leave it be." Decorator-only change.

### File 3: `src/wearables/samples/wearable-samples.controller.ts` (exact path — verify)

```ts
@Get()
@Roles('client', 'coach', 'owner')
async getSamples(...) { ... }
```

**Before merging:** verify the service layer (`SamplesService` or equivalent) correctly scopes results:
- `client` role → results limited to `req.user.id`
- `coach` role → results limited to clients assigned to `req.user.id` (check existing assignment relation pattern — likely `coach_id` foreign key on a `coach_client_assignments` table or similar)
- `owner` role → no scoping

If the service does NOT already enforce this scoping, **STOP** and flag — the decorator alone would let a coach hit the endpoint and pass any `clientId`, which is an IDOR vector. Service-layer scoping is mandatory. If missing, this becomes a multi-PR effort and you must surface to parent agent before proceeding.

### File 4: `src/wearables/preferences/preferences.controller.ts`

```ts
@Post()
@Roles('client', 'coach')
async upsert(...) { ... }

@Delete(':id')
@Roles('client', 'coach')
async remove(...) { ... }
```

**Coach-as-client-proxy validation:** verify the upsert/remove DTOs accept a `clientId` and that the service rejects when:
- A coach passes a `clientId` they're not assigned to → 403.
- A client passes any `clientId` other than `req.user.id` → 403 (or ignore the field and use `req.user.id` unconditionally for the client role).

If the service does NOT enforce this, surface to parent agent before merging — same IDOR concern as #6.

---

## Files in scope

1. `src/wearables/connections/connections.controller.ts` — 4 decorators
2. `src/wearables/insights/wearable-insights.controller.ts` — 1 decorator
3. `src/wearables/samples/wearable-samples.controller.ts` — 1 decorator (VERIFY service-layer scoping first)
4. `src/wearables/preferences/preferences.controller.ts` — 2 decorators (VERIFY service-layer coach-as-proxy validation first)

Plus possibly an `@Roles` import addition in each file (some may already have it; check before adding).

**Do NOT touch:**
- Any HK-5b / HK-6a code
- The scheduling test (PR-FIX-2)
- The wearables module/oauth-state/http (HK-FIX-1)
- The `@Roles` decorator definition itself
- The service layer files, EXCEPT to surface gaps (do not fix IDOR concerns in this PR — flag them)

---

## Bradley R0 LAW

- NO "Coming soon", NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as`, NO `as never`, NO `as never as X`, NO `.catch(() => undefined)`, NO `catch(e){}`, NO spinner-only empty states.
- `@ts-expect-error <one-line justification>` IS allowed.
- This PR is decorator-only; R0 grep must be zero.

```bash
git diff origin/main | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
# Expect: zero matches.
```

---

## Verification checklist

### 1. Branch from updated main
```bash
cd /tmp/gpb-clone
git fetch origin main
git worktree add -b dynasia/pr-hk-fix-3-roles-decoration /tmp/wt-hk-fix-3 origin/main
cd /tmp/wt-hk-fix-3
test -d node_modules || npm ci --prefer-offline
```

### 2. Apply the 8 decorators per the table above. For each route, verify with grep:
```bash
grep -nB2 "async startOauth\|async oauthCallback\|async list\|async disconnect\|async getClientInsight\|async getSamples\|async upsert\|async remove" \
  src/wearables/connections/connections.controller.ts \
  src/wearables/insights/wearable-insights.controller.ts \
  src/wearables/samples/wearable-samples.controller.ts \
  src/wearables/preferences/preferences.controller.ts
```
Each handler must show a `@Roles(...)` line in its decorator stack matching the table above.

### 3. Lint + typecheck
```bash
npx tsc --noEmit
npm run lint -- --max-warnings=0 src/wearables/connections/connections.controller.ts src/wearables/insights/wearable-insights.controller.ts src/wearables/samples/wearable-samples.controller.ts src/wearables/preferences/preferences.controller.ts
```

### 4. roles-enforced.spec.ts now passes
```bash
npx jest test/roles-enforced.spec.ts --runInBand
```
Expect: GREEN. No "ungated" routes reported.

### 5. Existing wearables tests don't regress
```bash
npx jest test/wearables --runInBand
```
Expect: no new failures vs `origin/main` (post-HK-FIX-1).

### 6. Full backend suite — failure count is now 0
```bash
npx jest --runInBand --silent 2>&1 | grep -E "^Tests:" | tail -1
```
Expect: `Tests: 4024 passed` (or whatever the green-main total is). **0 failed.**

### 7. R0 grep — zero matches

### 8. Service-layer scoping audit (surface, don't fix)
For `getSamples` (#6) and `upsert/remove` (#7/#8): read the service file referenced by each controller. Confirm:
- Coach role: results / mutations scoped to clients in the assignment relation.
- Client role: scoped to `req.user.id` (the JWT identity, never a body/path param).

If either gap exists, **STOP — DO NOT MERGE — write the gap to `_builder_result_HK_FIX_3.md` and surface to parent**. The decorator alone is insufficient if the service trusts a client-supplied target id.

---

## Commit message

Title: `hk-fix-3(wearables): decorate 8 ungated routes with @Roles per stakeholder policy`

Body:
```
test/roles-enforced.spec.ts walks the AppModule route registry and refuses
to certify any handler without @Roles(...) or @Public(). Once HK-FIX-1
unblocked the AppModule graph itself, this guard caught 8 wearables routes
that shipped undecorated.

Adds @Roles per the policy locked in by Bradley on 2026-06-02:
- ConnectionsController.startOauth   → @Roles('client')
- ConnectionsController.oauthCallback → @Roles('client')
- ConnectionsController.list          → @Roles('client', 'coach')
- ConnectionsController.disconnect    → @Roles('client')
- WearableInsightsController.getClientInsight → @Roles('client')
- WearableSamplesController.getSamples → @Roles('client', 'coach', 'owner')
- PreferencesController.upsert        → @Roles('client', 'coach')
- PreferencesController.remove        → @Roles('client', 'coach')

Coaches who want their own wearable data must use a separate client
account; coach role cannot initiate or complete the connect flow, cannot
disconnect, and cannot read the client-side AI snapshot summary (coaches
have their own AI summary tooling on a different controller). Coaches
can list a client's connections, see their assigned clients' raw samples,
and set/remove preferences on behalf of an assigned client. Owners have
full read access to raw samples.

Service-layer scoping verified to enforce these boundaries (see PR
description for the audit summary).
```

---

## PR description (paste into `gh pr create --body-file`)

```
## What

Adds the correct `@Roles(...)` decorator to 8 wearables route handlers that
shipped undecorated, per the per-route policy locked in by Bradley on
2026-06-02.

## Why

Once HK-FIX-1 (#358) unblocked the AppModule graph, `test/roles-enforced.spec.ts`
got far enough to walk every route and caught 8 wearables handlers
without `@Roles` or `@Public`. This is a security policy gap, not a
plumbing fix — each route needed an explicit decision on who's allowed
in, which is why it lives in its own PR.

## Per-route policy

| Route | Roles | Note |
|---|---|---|
| `POST /v1/wearables/connections/oauth/start` | `client` | Coaches must use a separate client account to connect their own wearables. |
| `GET  /v1/wearables/connections/oauth/callback` | `client` | Same. |
| `GET  /v1/wearables/connections` | `client`, `coach` | Coach sees per-assigned-client connection list. |
| `DELETE /v1/wearables/connections/:provider` | `client` | Coaches cannot revoke. |
| `GET  /v1/wearables/insights/client/:clientId` | `client` | Coaches use a separate AI tool. Snapshot-only; cache/persistence behavior preserved. |
| `GET  /v1/wearables/samples` | `client`, `coach`, `owner` | Per-role scoping in service layer. |
| `POST /v1/wearables/preferences` | `client`, `coach` | Coach can set on behalf of an assigned client. |
| `DELETE /v1/wearables/preferences/:id` | `client`, `coach` | Same model. |

## Service-layer audit (IDOR guard)

For `getSamples`, `upsert`, `remove`: verified that the service layer scopes
results/mutations by `req.user.id` for clients, by the assignment relation
for coaches, and unrestricted for owners. **Add audit notes here from the
builder result file.**

## Verification

- `npx jest test/roles-enforced.spec.ts` — GREEN, 0 ungated routes
- `npx jest test/wearables` — no regressions
- `npx tsc --noEmit` clean
- Backend failure count: 0
- R0 grep zero matches

## Out of scope

- `getClientInsight` caching/persistence behavior — preserved as-is per Bradley's directive.
- Any other route across the codebase. Repo-wide audit is the responsibility of `roles-enforced.spec.ts` going forward (now actually enforceable post-HK-FIX-1).
```

---

## Acceptance criteria

- [ ] All 8 routes decorated per the table
- [ ] No other files touched
- [ ] All 8 verification gates pass
- [ ] R0 grep zero matches
- [ ] Service-layer IDOR audit complete (results in `_builder_result_HK_FIX_3.md`)
- [ ] If service-layer gap exists, STOPPED and surfaced — not merged
- [ ] PR opened, CI run started
- [ ] Result file written to `/home/user/workspace/_builder_result_HK_FIX_3.md`
- [ ] PR description includes the service-layer audit summary
