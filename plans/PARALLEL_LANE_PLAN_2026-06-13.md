# Parallel Lane Plan — Dependabot close-out + feature continuation (2026-06-13 22:00 PDT)

**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**R52 compliance:** Plan written BEFORE any subagent dispatch to avoid mid-flight rebase loss.
**R71 compliance:** 5-lane cap; each lane has explicit OWNS + MUST-NOT-TOUCH enumeration.

## Just-merged in this session (10 PRs total this thread + 4 this session)

| Repo | PR | Title | Merge commit |
|---|---|---|---|
| backend | #308 | @nestjs/core 11.1.21→11.1.26 | `89638880` |
| backend | #303 | @nestjs/common 11.1.19→11.1.26 | `76d09b28` |
| backend | #301 | @anthropic-ai/sdk 0.96→0.104 (post-rebase) | `91d8500e` |
| backend | #304 | @nestjs/testing 11.1.23→11.1.26 (post-rebase) | `09f827f6` |
| mobile | #233 | expo group (10 updates) | `52342e1f` |

## Currently open and triaged

### Dependabot (immediate close-out — this plan's focus)

| PR | Repo | Status | Owner | Action |
|---|---|---|---|---|
| #307 | backend | zod 3→4, 18+ sites | OPUS fixer | Plan: `plans/BUMP_PLAN_ZOD_4.md` |
| #200 | mobile | async-storage 2→3, 6 sites | OPUS fixer | Plan: `plans/BUMP_PLAN_ASYNC_STORAGE_3.md` |
| #246 | mobile | dev-deps group, jest-preset upstream-blocked | OPERATOR | Plan: `plans/BUMP_PLAN_RN_JEST_PRESET_086.md` — CLOSE |

### In-flight feature work (resuming)

| PR / branch | Repo | Status | Owner | Plan |
|---|---|---|---|---|
| `migrate/rntl-v14` (no PR yet) | mobile | R3 builder dispatched cycle 40, ran out of credits | NEW Opus subagent | Continue from R3's state, then open PR (slot #232 reserved) |
| #242 | mobile | Roman P4 ED.3/ED.4 — Option C plan locked, 0 commits | NEW Opus subagent | `ROMAN_ED3_REWRITE_PLAN.md` |
| Roman P4 backend (no PR yet) | backend | CoachFirstPaymentNotification + webhook detector | NEW Opus subagent | Same plan, backend side |

### Stale / needs operator triage (NOT in scope this round)

| PR | Repo | Issue |
|---|---|---|
| #123 | mobile | phase-11 workout-builder, pre-thread, DIRTY |
| #195 | mobile | R34 governance — deferred (R34 lost-forever) |
| #201/#202/#203 | mobile | AI-credits stream — pre-thread |
| #183 | backend | phase-11 talent-marketplace — pre-thread |
| #275/#277/#295/#296/#297/#326 | backend | AI-credits + R15 + handoffs — pre-thread |

## 5-lane parallel dispatch plan (R71 cap)

All lanes run TODAY in parallel under R52 (plan-before-parallelize completed via this document + the 3 bump plans + ROMAN_ED3_REWRITE_PLAN + BUILDER_BRIEF_RNTL_V14_CONTINUE).

| Lane | Subagent | Brief | OWNS | MUST-NOT-TOUCH |
|---|---|---|---|---|
| L1 | Opus 4.8 fixer — **zod 4 backend #307** | `plans/BUMP_PLAN_ZOD_4.md` | `src/landing-pages/section-schemas.ts`, `src/wearables/samples/dto/**`, `src/wearables/connectors/strava/strava.types.ts` | All other backend files |
| L2 | Opus 4.8 fixer — **async-storage 3 mobile #200** | `plans/BUMP_PLAN_ASYNC_STORAGE_3.md` | `src/services/queryClient.ts`, `src/services/authActions.ts`, `src/storage/mmkv.ts`, `src/services/__tests__/queryClient.persister.test.ts`, `src/services/__tests__/queryClient.signout.test.ts` | All other mobile files |
| L3 | Opus 4.8 builder — **RNTL v14 continuation** | `BUILDER_BRIEF_RNTL_V14_CONTINUE.md` (workspace) | `src/**/__tests__/**`, `src/**/*.test.tsx`, `package.json` (RNTL dep) | `src/services/queryClient.ts`, `src/services/authActions.ts`, `src/storage/mmkv.ts` — all owned by L2; `src/services/__tests__/queryClient.persister.test.ts` SHARED with L2 (see below) |
| L4 | Opus 4.8 builder — **Roman P4 backend** | `ROMAN_ED3_REWRITE_PLAN.md` (backend slice) | `src/notifications/**` (additive only), `src/payments/webhook.controller.ts`, new file `src/notifications/coach-first-payment.service.ts`, `prisma/schema.prisma` (new `CoachFirstPaymentNotification` model) | Wearables, landing-pages, community |
| L5 | Opus 4.8 builder — **Roman P4 mobile #242** | `ROMAN_ED3_REWRITE_PLAN.md` (mobile slice) | `src/screens/coach/CoachHomeScreen.tsx` (Roman P4 surface), `src/components/coach/FirstPaymentWow.tsx` (new), `src/hooks/useNotifications.ts` (subscribe to FIRST_PAYMENT kind) | Anything outside Roman P4 surface |

## Lane conflict resolution

### L2 + L3 — VERIFIED ZERO OVERLAP (2026-06-13 22:30 PDT)

Initial concern about `src/services/__tests__/queryClient.persister.test.ts` was a false alarm. The actual cycle-40 codemod commit `9662f7f` does NOT touch any of L2's 5 owned files (`queryClient.ts`, `authActions.ts`, `mmkv.ts`, `queryClient.persister.test.ts`, `queryClient.signout.test.ts`). Confirmed via direct GitHub API diff inspection of all 116 files in `9662f7f`.

The partial Commit-2 work that DID touch `queryClient.persister.test.ts` died with the cycle-40 sandbox (never pushed). New L3 builder starts from the dangling commit AND must respect L2 as MUST-NOT-TOUCH.

### L3 — DANGLING COMMIT RECOVERED

Cycle-40 commit `9662f7f` (codemod Commit 1) was a dangling commit — no branch ref pointed to it. **Recovered 2026-06-13 22:30 PDT** by creating `refs/heads/migrate/rntl-v14` pointing to `9662f7f`. The commit is now permanently safe. The lost-forever portion is the 22-file working tree the prior R3 builder had in flight when its sandbox died — that work is gone and the new L3 builder restarts Commit 2 from the codemod baseline.

### L3 ↔ L5 — VERIFIED ZERO OVERLAP

L5 (Roman #242 mobile) has 9 test files. None of them appear in the cycle-40 codemod's 116-file changeset. Many of L5's files (the FirstPaymentWow* tests) did not exist when the codemod was applied. Subsequent L3 Commit 2 work targets a known 5-suite list (CoachPackageContentsScreen, TimelineScreen, useAutosave, ClientMessagesScreen.integration, useMacroTargets) — none overlap L5.

### Operator-only lane (parallel to all 5)

The operator (or a future agent turn) executes the #246 close action directly — it's not subagent work.

## Per-lane dispatch checklist (must complete BEFORE clicking "go" on any subagent)

For each Lane 1-5:

- [x] Plan doc exists and is committed to `BradleyGleavePortfolio/tgp-agent-context`
- [ ] Branch is rebased onto latest main (or `@dependabot rebase` for Dependabot branches)
  - L1 #307: needs `@dependabot rebase` (was based on pre-#301/#304 main)
  - L2 #200: needs `@dependabot rebase` (was based on pre-merges main)
  - L3 `migrate/rntl-v14`: branch just recreated at `9662f7f` (parent `7f4e35f4` is post-#244 main; needs rebase onto post-#301/#304 main but the codemod was test-only so conflicts unlikely)
  - L4 NEW backend branch: created fresh from main
  - L5 #242: needs Roman P4 plan refactor; branch already in flight
- [ ] R31 fresh — Builder, Auditor, Fixer are SEPARATE model instances
- [ ] R61 push-every-2-min explicitly in the brief
- [ ] R65 50-failures sweep included in auditor brief
- [ ] R72 exhaustive sweep included in auditor brief
- [ ] R73 mobile-screen-only gate confirmed for any mobile lane
- [ ] OWNS / MUST-NOT-TOUCH enumeration copied into the brief
- [ ] Author = `Bradley Gleave <bradley@bradleytgpcoaching.com>` (R74) — inline `-c` flags, not global config

## Operator confirmation gate

Per the directive **"wait before deploying subagents,"** no subagent goes live until operator explicitly approves THIS plan.

The operator approving this document = approval for all 5 lanes simultaneously, since each lane has its own committed plan and R71-clean file ownership.

## Rollback / safety

- Each lane has its own branch — a bad lane kills only its own branch.
- Each lane's PR runs CI independently — no shared CI failure cascade.
- **Zero rebase dependencies between lanes** — verified via direct GitHub diff inspection of all file changesets on 2026-06-13 22:30 PDT.

## Verified overlap matrix (2026-06-13 22:30 PDT)

| Pair | Files in common | Verdict |
|---|---|---|
| L1 ↔ L2 | 0 (different repos) | SAFE |
| L1 ↔ L3 | 0 (different repos) | SAFE |
| L1 ↔ L4 | 0 (`src/wearables`,`src/landing-pages` vs `src/notifications`,`src/payments`) | SAFE |
| L1 ↔ L5 | 0 (different repos) | SAFE |
| L2 ↔ L3 | 0 (codemod did NOT touch queryClient/authActions/mmkv — verified all 116 files) | SAFE |
| L2 ↔ L4 | 0 (different repos) | SAFE |
| L2 ↔ L5 | 0 (`src/services`,`src/storage` vs `src/screens/coach/ed`,`src/screens/client/progress`) | SAFE |
| L3 ↔ L4 | 0 (different repos) | SAFE |
| L3 ↔ L5 | 0 (codemod 116 files vs Roman #242 22 files — no intersection) | SAFE |
| L4 ↔ L5 | DB + notification protocol (intentional contract) | SAFE — no code-file overlap |
