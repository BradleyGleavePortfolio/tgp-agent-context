# TM-7 BUILDER BRIEF — Admin Listing Moderation + Applicant Review

## CRITICAL — PUSH-EARLY-WIP IS BINDING

Within your FIRST 5 minutes, you MUST commit + push at least once to `origin/feat/tm-7-admin-moderation`, open the PR, then push every ~5 min or per logical chunk. NEVER accumulate >10 min of unpushed work. If any command fails with "no workspace" / sandbox error, that means sandbox loss — push first.

## ROLE & MODEL
You are the **Builder** for TM-7 under R64. Auditors run AFTER you push.

**Identity (R74 — mandatory):**
- `git -c user.name='bradley' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."`
- NO `Co-Authored-By`, NO "Generated with Claude", NO AI attribution anywhere
- Use `api_credentials=["github"]` for ALL git/gh commands

## WORKTREE
- **Branch:** `feat/tm-7-admin-moderation` (NEW — create from main `918191ce`)
- **Worktree:** `/home/user/workspace/tgp/tm-7-admin`
- Setup:
  ```bash
  mkdir -p /home/user/workspace/tgp
  cd /home/user/workspace/tgp
  git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git tm-7-admin
  cd tm-7-admin
  git checkout main && git pull
  git checkout -b feat/tm-7-admin-moderation
  ```

## FIRST PUSH (within 5 min)
1. Add a single-line README touch or module-level doc comment in your owned controller file.
2. Commit (R74 identity) + push.
3. Open PR:
   ```bash
   gh pr create --base main --head feat/tm-7-admin-moderation \
     --title "TM-7: admin listing moderation + applicant review (WIP)" \
     --body 'WIP. Admin-only moderation surface. Off main 918191ce. Wave 4 lane.'
   ```

## SCOPE & FILE OWNERSHIP (R71 — EXCLUSIVE)
You own:
1. `src/talent-marketplace/admin-moderation.controller.ts` (NEW)
2. `src/talent-marketplace/admin-moderation.service.ts` (NEW)
3. `src/talent-marketplace/admin-moderation.dto.ts` (NEW)
4. `src/talent-marketplace/admin-review-cursor.ts` (NEW — keyset tuple cursor)
5. `src/talent-marketplace/talent-marketplace.module.ts` (additive wiring ONLY — append to existing arrays; do NOT remove other lanes' registrations)
6. NEW specs: `src/talent-marketplace/__tests__/admin-moderation.*.spec.ts`

**DO NOT touch** any other file. No schema changes. No migrations. No `common/`, no `auth/`.

## LOC CAP
**≤ 210 prod LOC** delta against `origin/main` (excluding spec files). If close to cap, drop optional features — never safety checks.

## FUNCTIONAL SPEC

Per `plans/TM_REBUILD_CHAIN_V2.md` row TM-7:

> Demoted ex-pool path: `GET /admin/listings` + `/admin/applications` review queue with `claimOrReplay`; listing-quality approval. Owner-only.

**Endpoints:**
- `GET /v1/talent-marketplace/admin/listings` — paginated review queue (keyset cursor); filter by status (pending/approved/rejected). Owner-only.
- `POST /v1/talent-marketplace/admin/listings/:id/review` — atomic claim-or-replay; idempotency via TM-4 ledger; body `{ decision: 'approved' | 'rejected', note?: string }`.
- `GET /v1/talent-marketplace/admin/applications` — paginated review queue; same cursor pattern.
- `POST /v1/talent-marketplace/admin/applications/:id/review` — same atomic pattern.

**Guard:** Owner-only (`is_owner()` predicate from existing auth — reuse, do NOT redefine). If no `OwnerOnlyGuard` exists, use the closest existing admin/owner guard and document the choice in the PR description.

**Cursor:** Mirror `application-cursor.ts` (TM-5) or `public-listing.cursor.ts` (TM-3) pattern. Base64 of `created_at|id`, tamper detection, page-size cap (50).

**Idempotency:** review POSTs use TM-4 idempotency ledger (`IdempotencyService` / `claimOrReplay` already in `src/talent-marketplace/` from TM-4 — REUSE).

## ERROR ENVELOPE CONTRACT (binding)
All errors must return the canonical shape consumed by global `HttpExceptionFilter`:
```ts
{ error: <HTTP-reason-phrase>, message: <human>, code: <discriminator> }
```
Do NOT emit legacy `{ kind }` envelopes. See `src/filters/http-exception.filter.ts` L37-48, L67-75. TM-3 and TM-5 follow this; you MUST too.

## BANNED TOKENS (P0 fail in src/+test/)
`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`.
Allowed: `@ts-expect-error <reason>` + narrow concrete casts.

## TESTS YOU MUST ADD
- `admin-moderation.controller.spec.ts` — owner-guard enforcement, non-owner 403, valid owner 200.
- `admin-moderation.service.spec.ts` — claim-or-replay idempotency (same idem-key returns first decision), pagination cursor invariants.
- `admin-review-cursor.spec.ts` — round-trip encode/decode, tamper detection, cap enforcement.

## BUILD COMMANDS
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand --testPathPatterns='admin-moderation|admin-review-cursor'
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```

## CI EXPECTATIONS
4 required checks must pass: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`. Fly Deploy ignored.

If CI doesn't auto-trigger within 2 min of push:
```bash
gh workflow run ci.yml --repo BradleyGleavePortfolio/growth-project-backend --ref feat/tm-7-admin-moderation
```

## CONTINUOUS PUSH CHECKPOINT
Every commit: R74 identity, push immediately. Verify identity-clean:
```bash
git log --pretty='%an <%ae> | %s%n%b' origin/main..HEAD | grep -iwE 'AI|Claude|Computer|Co-Authored|Agent' && echo FAIL || echo IDENTITY_OK
```

## DELIVERABLE
Report file `handoffs/wave4-builders/TM7_REPORT.md` in context repo with: final SHA, files added, LOC count, test results, CI status.

bradley@bradleytgpcoaching.com
