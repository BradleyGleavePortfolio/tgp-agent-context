# BUILD BRIEF — PR-17 B2: package push service + endpoints + DTO

Repo: growth-project-backend. Branch: `pr17/b2-push-endpoint` (ALREADY CREATED at your worktree). Depends on B1 (MERGED to main — `push_seq` column, cron resolver-key bypass, `dispatchBuyerAlert` notify-suppression are all present on main).

## Your worktree (isolated; main repo is READ-ONLY)
`/home/user/workspace/wt-pr17-b2` — branch `pr17/b2-push-endpoint` off fresh `origin/main` (HEAD `e0317d9`, contains B1+AI-gateway). Do all work here.

## Authoritative spec
Read these FULLY before coding (they contain the FROZEN contracts + the algorithm + the correctness rules):
- `/home/user/workspace/repos/tgp-agent-context/specs/PR17_EXPANSION_PLAN.md` — **§2 (Backend work breakdown)** is your contract: §2.1 endpoints+DTO, §2.2 service algorithm (9 steps), §2.3 G4 shipped-set, §2.4 resolver-key conditional, §2.6 audience scoping, §2.7 trigger wiring, §2.8 tests. Also §1.3/§1.4 (the #5 hard problem + idempotency layering) and §6 (risks/watchpoints).
- `/home/user/workspace/repos/tgp-agent-context/specs/PR17_B1_BUILD_REPORT.md` — what B1 delivered (so you know exactly what cron/schema behavior you build on).
- `UI_BIBLE.txt` is mobile-only; you can skip it.

## Scope — EXACTLY B2 (do NOT do B1's work again, do NOT do any mobile)
Files you OWN (and ONLY these):
- `src/packages/package-push.service.ts` (NEW) — `PackagePushService.pushContentToExistingBuyers(...)` per §2.2.
- `src/packages/package-contents.dto.ts` — APPEND the push zod schemas (PushRequest, PushPreviewQuery) per §2.1.
- `src/packages/package-contents.controller.ts` — APPEND the two endpoint methods (reuse existing guards/IDOR), per §2.1. (A thin separate `package-push.controller.ts` is acceptable per §5 if cleaner, but you then own it alone.)
- `src/packages/packages.module.ts` — register `PackagePushService` in providers/exports.
- `test/package-push.service.spec.ts` (NEW) — per §2.8, mirror `test/package-contents.service.spec.ts` stub style.
- Optionally EXTEND `test/drip-dispatcher.cron.spec.ts` ONLY if you need to add a push-path assertion not already covered by B1's tests — but B1 already added the `push_seq>0` key-bypass + `alert_dispatched_at` skip cron tests, so prefer NOT to touch the cron file or its spec. If you do touch them, keep it purely additive.

FORBIDDEN: do NOT edit `prisma/schema.prisma`, any migration, `drip-dispatcher.cron.ts` (B1 owns it — it's already correct), any `src/billing/*`, `src/connect/*`, `ai*`, or any mobile file. Do NOT add a feature flag (#11 full production). Do NOT refactor the fan-out engine (reuse `computeFireAt` — do not rewrite).

## The two endpoints (§2.1 — FROZEN, the mobile M1 client already targets these)
1. `POST v1/coach/packages/:id/contents/:contentId/push` — body zod:
   `{ audience: 'all'|'active'|'cohort', cohort_purchase_ids?: string[] (required iff cohort), fire_at: ISO8601 (today-or-later, server re-validates), mode: 'push_existing'|'resend', notify: boolean (default true) }`; reads `Idempotency-Key` header (UUID, dedup #8). Returns `{ scheduled: N, skipped: M, fire_at, audience, notify }`.
2. `GET v1/coach/packages/:id/contents/:contentId/push/preview?audience=…&mode=…` — pure read, same guards. Returns `{ count: N, audience, already_delivered: K }`.
Both inherit `@Controller('v1/coach/packages/:id/contents')` + `@UseGuards(JwtAuthGuard, CoachOrOwnerGuard, SubscriptionGuard)` + `@Roles('coach','owner')`. IDOR via `resolveEffectiveCoachId` + `requireOwnedPackage` (mirror `package-contents.controller.ts:53,65`).

## The CRITICAL correctness rules (do not get these wrong)
- **#5 resolver-key bypass (§1.3/§2.4):** the cron already handles `push_seq>0 → scheduledDropId-only`. Your INLINE materialise (step 7, due-now pushes) MUST apply the SAME conditional: pass the `(clientPurchaseId, contentId)` pair IFF `push_seq===0`; for `push_seq>0` pass `scheduledDropId` ONLY so resolvers produce a FRESH delivery, not a cached no-op. This is the single most fragile point — test it.
- **G4 shipped-set (§2.3):** treat `status IN ('fired','delivered')` as shipped. Centralize as a constant. `push_existing` skips buyers who already have ANY drop for the pair; `resend` only targets buyers whose latest drop for the pair is shipped, inserting at `push_seq = max+1`.
- **#7 atomicity + NO Stripe:** all seeds in ONE `$transaction`, chunked ~500 via `createMany({ skipDuplicates: true })`. The push path NEVER calls Stripe (verify no transitive Stripe via a resolver). Document the invariant in the service header.
- **#2/#6 coach-chosen date:** the drop's `fire_at` is the coach's chosen `fireAt` directly (do NOT double-normalize through cadence-derived timing). Reject `fireAt < startOfToday` with a 400 (defense-in-depth). Snapshot cadence fields for buyer display, but schedule on the coach date.
- **#9 notify:** when `notify===false`, stamp `alert_dispatched_at = now` at seed time so both inline + cron `dispatchBuyerAlert` skip the buyer push (B1's gate already honors a pre-set `alert_dispatched_at`).
- **#8 idempotency:** compute `push_seq` deterministically per (purchase, content) inside the tx so a replayed identical request lands on the same seq and `createMany skipDuplicates` makes it a true no-op.
- **IDOR for cohort:** re-filter `cohort_purchase_ids` by `package_id` so a coach can't push to another package's purchases by id-guessing. Test cross-tenant rejection.

## Tests (real, §2.8)
`test/package-push.service.spec.ts` (hand-rolled prisma stubs, mirror `test/package-contents.service.spec.ts`): audience scoping (all/active/cohort), chunking, push_seq computation, resend-vs-unique, past-date 400, idempotent replay no-op, notify-suppression stamps `alert_dispatched_at`, NO Stripe, cohort cross-tenant rejection, the `push_seq>0` inline-materialise key-bypass (assert resolver called WITHOUT the pair). Run REAL `npx tsc --noEmit`, lint, and `npx jest packages` (or the repo's command). `npm ci` if node_modules absent. Report actual counts.

## Process
1. `cd /home/user/workspace/wt-pr17-b2`. Pull latest main first (`git fetch && git rebase origin/main` if needed — should already be current).
2. Build per §2. Commit as `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'` — NO Co-Authored-By / Generated trailers. Push every ~2 min (R61).
3. Open a PR vs `main` titled `PR-17 B2: package push service + endpoints + DTO (per-content push/backfill + re-send)`.
4. Write `/home/user/workspace/repos/tgp-agent-context/specs/PR17_B2_BUILD_REPORT.md`: file:line per piece, the resolver-key-bypass proof, the chunked-tx + no-Stripe invariant, idempotency proof, any deviations, actual tsc/lint/test counts, final HEAD SHA + PR number.
5. Report the PR number and final HEAD SHA in your return message so a fresh independent audit can be SHA-pinned.
