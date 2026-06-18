# TM-14 FINISHER BRIEF V2 — Stripe Connect account.updated Webhook (post-sandbox-loss re-dispatch)

## CRITICAL — READ THIS FIRST: PUSH-EARLY-WIP IS AN ENFORCED RULE

The previous TM-14 finisher crashed with "no workspace" (sandbox loss) ~55 minutes in WITHOUT EVER PUSHING. All in-progress work was lost. To prevent recurrence, the following is now a HARD RULE:

### THE 5-MINUTE FIRST-PUSH RULE (binding)

1. **Within your FIRST 5 minutes**, you MUST make at least one commit + push to `origin/feat/tm-14-connect-account-updated-webhook`. Even a tiny change (a comment, a docstring) is fine — push it. This proves your sandbox + credentials work AND opens the PR.

2. **As part of that first push**, open the PR:
   ```bash
   gh pr create --base main --head feat/tm-14-connect-account-updated-webhook \
     --title "TM-14: Stripe Connect account.updated webhook" \
     --body "Implements idempotent webhook persistence + adapter state sync. Migration 20261220000030_marketplace_connect_event."
   ```

3. **After that, push every ~5 minutes or per logical chunk.** Never accumulate more than ~10 minutes of unpushed work.

4. **If any command fails with "no workspace" / sandbox error, your work is gone unless pushed.** Push first, then proceed.

This rule supersedes any contradicting cadence in older doctrine docs.

---

## ROLE & MODEL
You are the **Builder** for TM-14 under R64. Auditors run AFTER you push.

**Identity (R74 - mandatory):**
- `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."`
- NO `Co-Authored-By`, NO "Generated with Claude", NO AI attribution
- Use `api_credentials=["github"]` for ALL git/gh commands

## WORKTREE (R56–R61, EXCLUSIVE)
- **Your worktree:** `/home/user/workspace/tgp/backend-tm-14-finish`
- **Branch:** `feat/tm-14-connect-account-updated-webhook`
- **Starting HEAD:** `d6d5672d67c19eb0ef4f1b85e888eae4b098ac1f` (already checked out)
- **First action:** `cd /home/user/workspace/tgp/backend-tm-14-finish && git status && git log --oneline -3`
- **DO NOT** `cd` to `/tmp/gpb`, `backend-main`, or any sibling worktree. READ-ONLY.

## SCOPE & FILE OWNERSHIP (R71 — EXCLUSIVE)

You own exclusively:
1. `src/talent-marketplace/talent-connect-webhook.controller.ts`
2. `src/talent-marketplace/talent-connect-webhook.service.ts`
3. `src/talent-marketplace/connect-adapter.service.ts` (edits only — don't rewrite from scratch)
4. `prisma/migrations/20261220000030_marketplace_connect_event/migration.sql` (date floor `> 20261220000020` ✓)
5. `prisma/schema.prisma` (minimal additions for the new model only)
6. `src/talent-marketplace/talent-marketplace.module.ts` (minimal wiring)
7. `test/talent-connect-webhook.spec.ts`

**Do NOT touch any other file.** You may READ `src/payouts-v2/payouts-v2-webhook.controller.ts` and `src/billing/stripe-signature.ts` for convention reference but DO NOT modify them.

## LOC CAP
**≤ 170 prod LOC** delta against `origin/main` (excluding migration SQL and spec). Current snapshot ~616 insertions across 7 files; trim if overshooting on prod LOC.

## SUGGESTED ORDER OF WORK (push-friendly)

1. **First push (≤ 5 min):** Open the PR via the command above. Make one small visible change first — e.g. add a `// TM-14: Stripe Connect account.updated webhook handler` header comment to the controller, OR fix a trivial inconsistency. Commit + push. Verify PR is open.

2. **Second push (within 10 min):** Inspect the migration SQL — confirm RLS policies match the repo's neighboring-migration pattern; if missing, add them. Commit + push.

3. **Iterate:** finish each owned file + spec, pushing after each chunk.

## REMAINING WORK (after first push)

- **Controller** (`talent-connect-webhook.controller.ts`): exposed at `POST /v1/talent-marketplace/connect/webhook` (or per existing convention in `payouts-v2-webhook.controller.ts`). Public endpoint with **Stripe signature verification** using the existing `src/billing/stripe-signature.ts` helper (DO NOT duplicate signature logic). 200 on processed, 200 on duplicate (idempotent), 4xx on bad signature.
- **Service** (`talent-connect-webhook.service.ts`): parses `account.updated` event, persists to `marketplace_connect_event` table for idempotency (one row per Stripe `event.id`), updates connect account state via `connect-adapter.service.ts`. NO PII in logs beyond `event.id` + `event.type`.
- **Connect adapter edits** (`connect-adapter.service.ts`): minimal — add ONLY the upsert/state-transition method the webhook needs. Do NOT rewrite the adapter.
- **Migration** (`20261220000030_marketplace_connect_event/migration.sql`): table with at least `id`, `stripe_event_id UNIQUE NOT NULL`, `account_id`, `payload jsonb`, `received_at`, **RLS policies (service-role only — no public read, no authenticated-user read)**.
- **Schema** (`prisma/schema.prisma`): add the model mirroring the migration. Do NOT modify other models. Run `npx prisma generate` after editing.
- **Module wiring** (`talent-marketplace.module.ts`): register controller + service.
- **Spec** (`test/talent-connect-webhook.spec.ts`): MUST cover (a) valid signature + new event → persists + adapter called once, (b) valid signature + duplicate event id → 200, adapter NOT called again, (c) invalid signature → 4xx, no persistence, (d) malformed payload → 4xx with no crash.

## IDEMPOTENCY & SECURITY (mandatory — auditors will verify)

1. **Signature verification on every request** — reject before doing anything else.
2. **UNIQUE constraint on `stripe_event_id`** — DB-enforced idempotency, not just app-layer.
3. **Service-role-only RLS** on `marketplace_connect_event` — internal ledger only.
4. **No raw event payload in logs** beyond `event.id` + `event.type`.
5. **Migration reversibility-safe** per repo convention.

## BANNED TOKENS (R0 — P0)
Same list (`@ts-ignore`, `as any`, `as unknown as`, `as never`, silent-swallow, `Coming soon`).
```bash
grep -nE '@ts-ignore|as any|as unknown as|as never|Coming soon' src/talent-marketplace/ test/ -r
```
Zero hits in your diff.

## BUILD DISCIPLINE (R66 + R70)

**R70 fast-lane (use between WIP pushes):**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npx jest --testPathPatterns="talent-connect-webhook" --runInBand
```

**R66 full suite — REQUIRED before final push:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
npx jest --runInBand
```

**If schema.prisma changes**, run `npx prisma generate` BEFORE `tsc --noEmit`.

**RLS tests:** if the repo runs `rls-floor-guard` / `rls-live-tests` CI jobs, your new table needs RLS policies that pass them. Include them in the migration SQL per repo convention. Look at neighboring migrations under `prisma/migrations/` for the pattern.

## PUSH CADENCE (RESTATED)

- **First push:** within 5 minutes (small change + open PR).
- **Subsequent:** every ~5 minutes OR per logical chunk.
- **Final:** after full suite + RLS jobs would pass.
- **Force-push:** NEVER.

## SUCCESS CRITERIA (on your final SHA)

1. **TypeScript:** `tsc --noEmit` exit 0.
2. **Jest full suite + RLS jobs:** all pass; new webhook spec passes.
3. **Banned tokens:** zero hits.
4. **LOC cap:** ≤ 170 prod LOC delta.
5. **R71 file ownership:** zero edits outside the 7 enumerated files.
6. **R74 commit identity:** clean.
7. **Migration:** date `20261220000030` > floor `20261220000020` ✓.
8. **Idempotency proven by spec:** duplicate-event test passes deterministically.
9. **PR CI green:** build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests. Fly Deploy paused/ignored.

## OUT OF SCOPE
- Mobile.
- Other lanes.
- `payouts-v2/`, `billing/` modifications (read-only).
- Auth changes.

## WHAT TO REPORT BACK
- Final HEAD SHA.
- Number of pushes (≥ 3).
- LOC delta.
- Full-suite jest + RLS job statuses.
- Banned-token grep = 0, R74 author check passes.
- New PR number + all CI check statuses.

TM-14 is **AUTO-MERGE eligible** on dual-CLEAN + all CI green. Audit cycle begins after your final push.
