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

### L2 + L3 share `src/services/__tests__/queryClient.persister.test.ts`

This is the only shared file. Sequence:
1. **L2 lands first** (smaller surface, ~6 sites, plan is more mechanical).
2. **L3 (RNTL v14)** rebases onto post-L2 main and picks up the renamed mock (`removeMany` instead of `multiRemove`) automatically.
3. L3 builder brief must include a R71 note: "If `queryClient.persister.test.ts` differs from your starting point by an `async-storage v3 mock rename`, KEEP THE NEW MOCK SHAPE and update your v14 test-harness changes on top of it."

### Operator-only lane (parallel to all 5)

The operator (or a future agent turn) executes the #246 close action directly — it's not subagent work.

## Per-lane dispatch checklist (must complete BEFORE clicking "go" on any subagent)

For each Lane 1-5:

- [ ] Plan doc exists and is committed to `BradleyGleavePortfolio/tgp-agent-context`
- [ ] Branch is rebased onto latest main (or `@dependabot rebase` for Dependabot branches)
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
- Lane 3 (RNTL v14) is the only lane with a rebase dependency on another lane (L2). If L2 fails, L3 still proceeds and resolves the persister test conflict at its own audit cycle.
