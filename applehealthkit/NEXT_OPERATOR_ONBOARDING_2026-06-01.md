# NEXT-OPERATOR ONBOARDING — HealthKit / Wearables (Post Wave-2, Mid Phase 2a)

**For:** the next Opus-class operator who picks up this thread (could be you on a new session, could be a teammate).
**Authored:** 2026-06-01 ~18:35 PDT, while HK-3a + HK-3b Opus 4.8 builders are running in background.
**Read these in order — don't skip §1.** Everything else exists to keep you from re-deriving context I already paid the cost to build.

---

## 0. Two-minute mental model

Growth Project is a $2-8K/mo coaching platform. The HealthKit/Wearables initiative gives coaches a per-client view of fitness + sleep/recovery data from every notable device, plus an AI panel (coach + client side) that turns the data into action, and an approval workflow that funnels every AI message through the coach before send. Visually: **two buckets** — Health & Fitness (warm tone, three-ring Apple-Watch hero, Revolut glow-drag charts) and Sleep & Recovery (cool tone, single recovery ring, Phantom CALM treatment, plain-language stage labels).

**Quality bar = decacorn.** No "Coming soon", no silent failures, no spinners as empty states. Every PR is held to Bradley LAW + the 50-Failures sweep (R65).

**Status:**
- ✅ Wave 1 (foundation): HK-0, HK-CFG, HK-1 backend, HK-1 mobile, HK-4 AI insights — all merged.
- ✅ Wave 2 (connectors): Apple Health, Samsung Health, Health Connect, Polar, Withings, Wahoo, Garmin, Fitbit — all 9 PRs merged today. Strava + Oura + WHOOP were merged pre-session. **11 of 15 providers live in prod.**
- 🟡 Phase 2a (UI buckets): HK-3a + HK-3b Opus 4.8 builders DISPATCHED, in flight at handoff time.
- ⏸️ Phase 2b (AI panels): HK-5a + HK-5b — queued, gated on 3a/3b CLEAN.
- ⏸️ Phase 2c (approval workflow): HK-6 — queued, gated on 5a/5b CLEAN.
- ⏸️ Phase 2d (v2 connectors): Peloton, Eight Sleep, MyFitnessPal — queued, parallel-safe with 5/6.

---

## 1. GitHub read-list (READ FIRST — strict priority order)

If you only have 30 minutes, read just the ones marked **★**. The full list is what you read before touching code.

### 1.1 Context repo (`BradleyGleavePortfolio/tgp-agent-context`)

| Priority | Path | Why |
|---|---|---|
| ★ | `applehealthkit/UNIFIED_BUILD_PLAN.md` | THE plan. §2 UX↔Code Contract, §3 Schema, §5 Audit briefs, §6 Navigation Mounting, §7 Parallelization Safety. Everything Phase 2a+ derives from this. |
| ★ | `applehealthkit/HANDOFF_FOR_NEXT_OPERATOR.md` | Original Bradley directives verbatim (in-his-words scope: 2 buckets, every notable device, dual-role AI, approval workflow). |
| ★ | `applehealthkit/PHASE_2A_DISPATCH_CONTEXT.md` | Just dropped. Subagent IDs + locked HTTP contracts + UX gates + audit kickoff plan for when 3a/3b builders return. |
| ★ | `SESSION_LOG_2026-06-01_WAVE2_COMPLETE_PHASE2A_KICKOFF.md` | Today's full arc. Workflow Bradley held me to + 4 canonical anti-patterns caught + quality bar contract. |
| ★ | `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` | The 50 named AI-code failure modes. Auditor and fixer briefs reference this by number (#5 IDOR, #28 races, #36 silent failures, etc.). |
| ★ | `quality-references/FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md` | The template used for every fixer dispatch. Reuse verbatim. |
| ★ | `rules/R65_50_FAILURES_SWEEP.md` | The binding sweep rule — every audit + every fix must complete this against the 50-Failures doc. |
| ★ | `rules/R0_DECACORN_QUALITY.md` | The umbrella rule for Bradley LAW. |
| ★ | `rules/R64_NEVER_LOSE_ANYTHING.md` | Why every brief/audit/fix dispatch gets committed back to this repo. |
| H | `applehealthkit/AGENT_1_UX_PLAN.md` | The UX-bible-derived plan (Phantom CALM, Revolut tactility, Apple cognitive de-load). Source for §1.4 motion + §3.2/§3.3a cards spec. |
| H | `applehealthkit/AGENT_2_CODING_PLAN.md` | The original code-side plan that fed UNIFIED. Reference for any §7 PR-HK-NN checklist gaps. |
| H | `applehealthkit/WAVE2_DISPATCH_CONTEXT.md` | The predecessor to PHASE_2A_DISPATCH_CONTEXT.md. Read for the audit-loop pattern. |
| M | `handoffs/CPO_BRIEFING.md` | North Star (3-of-10 activation, 800-user TestFlight target, ICP $2-8K/mo). Aligns "why does this PR matter" |
| M | `handoffs/CPO_MASTER_HANDOFF_PART_2.md` | Judgment layer doctrine. Useful when scope-judgment calls come up. |
| M | `design/Mobile-App-Design-Intelligence.md` | Mobile design doctrine. Cross-check any UX decision against this before shipping. |
| M | `audits/HK_wave/` | Wave-2 audit verdicts (R1–R8 across 9 PRs). Templates for your R1 audit briefs. |
| L | `audits/PR1*_AUDIT*.md` | Older audit examples for severity scale calibration (P0/P1/P2/P3). |

### 1.2 Backend repo (`BradleyGleavePortfolio/growth-project-backend`)

| Priority | Path | Why |
|---|---|---|
| ★ | `AGENT_RULES.md` | R1–R6X canon for the backend. R15 (GitHub is source of truth), naming, commit author. |
| ★ | `ENGINEERING_RULES.md` | Engineering quality bar — Zod validation, NestJS module patterns, Prisma conventions. |
| ★ | `prisma/schema.prisma` (lines ~4990–5210) | Wearable models: `WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, `WearableUserMetricPreference`. The taxonomy enums `WearableMetricBucket`, `WearableMetricType`, `WearableProvider` live above the models. |
| ★ | `src/wearables/ingestion/ingestion.service.ts` | `resolveBest(userId, metric, startAt, endAt)` — the read-precedence algorithm HK-3a's samples controller wraps. |
| ★ | `src/wearables/connector-registry.ts` + `connectors/connector.interface.ts` | The connector contract every provider implements. |
| ★ | `src/wearables/insights/wearable-insights.controller.ts` | The template HK-3a's `wearable-samples.controller.ts` mirrors (Zod query parse, IDOR check, throttle, locked response schema). |
| H | `src/wearables/connections/connections.controller.ts` + `connections.service.ts` | The OAuth start/callback + list endpoints HK-1 added. |
| H | `src/wearables/connectors/{oura,whoop,strava,polar,fitbit,garmin,wahoo,withings}/` | 8 reference connectors. Pattern: `index.ts`, `<provider>.connector.ts`, `<provider>-webhook.controller.ts`, `<provider>.module.ts`, `<provider>.normalizer.ts`, `<provider>.types.ts`. Wave-2 v2 connectors (Peloton, Eight Sleep, MyFitnessPal) clone this skeleton. |
| H | `src/insights/holistic-insights.controller.ts` | Earlier insight controller — another good reference for the dual-role projection pattern. |
| M | `src/auth/auth.guard.ts` + `coach.guard.ts` + `common/decorators/roles.decorator.ts` | The auth primitives HK-3a backend wires. `@Roles('coach','owner') + JwtAuthGuard + CoachGuard`. |
| M | `src/throttler/throttler.config.ts` | `THROTTLER_NAMES` constants. HK-3a uses `DEFAULT` or `COACH_AI_GENERATION`. |
| M | `CHANGELOG.md` | Look for entries since Wave-2 to confirm what shipped. |
| L | `BACKLOG.md` | Cross-reference open TODOs (esp. the cron prune for `WearableProcessedEvent` rows ≥14d). |

### 1.3 Mobile repo (`BradleyGleavePortfolio/growth-project-mobile`)

| Priority | Path | Why |
|---|---|---|
| ★ | `AGENT_RULES.md` | R1–R34 canon for mobile. R34 = GitHub is source of truth. R23+ for theme tokens. |
| ★ | `ENGINEERING_RULES.md` | Mobile engineering bar — full jest suite, both expo prebuilds, no `console.log` shipped, no unused deps. |
| ★ | `src/navigation/ClientNavigator.tsx` | The ONE file HK-3a edits for the `<Stack.Screen name="Health">` mount. HK-1's `Connections` mount lives here too. |
| ★ | `src/api/wearablesConnectionsApi.ts` + `src/hooks/useWearableConnections.ts` | The pattern HK-3a's `wearablesSamplesApi.ts` + `useWearableSamples.ts` mirrors exactly. |
| ★ | `src/api/holisticInsightsApi.ts` + `src/hooks/useHolisticInsights.ts` | Better template — full Zod-typed envelope with version, status, freshness. HK-3a samples client should mirror the envelope discipline. |
| ★ | `src/screens/client/wearables/ConnectionsScreen.tsx` + `ConnectProviderSheet.tsx` | HK-1's screens. They are the visual reference for "decacorn quality" wearable surfaces. Read them BEFORE designing any new wearable screen. |
| ★ | `src/services/health/onDeviceConnect.ts` | The HealthKit / Health Connect / Samsung permission orchestration. HK-3a's empty-state CTA flow into this. |
| ★ | `src/screens/coach/ClientDetailScreen.tsx` + `src/screens/coach/client-detail/` | The coach tabbed view HK-3a + HK-3b each add one tab to. `client-detail/types.ts` holds the `TabKey` union — additive merge point. |
| H | `src/theme/tokens.ts` | Color palette + tone tokens (warm/cool/clay/bone/stone). HK-3a/3b cards must use only these — no raw hex. |
| H | `src/components/` (whichever has the segmented control + animated rings utils) | If any reusable primitives exist for rings or segmented controls, use them — don't rebuild. |
| H | `jest.setup.js` | HK-1 added wearable connection mocks here. New tests reuse. |
| H | `src/services/health/healthConnect/` | Android Health Connect client — the model for any future on-device connector. |
| M | `src/screens/client/wearables/__tests__/` | Test patterns for screen-level integration. |
| M | `audit-worklets-jest.md` | If you hit Reanimated worklet test issues, this is the runbook. |
| L | `SETUP.md` + `PLAY_STORE_READINESS.md` | Only if you need to run the app locally or worry about Play Store. |

### 1.4 PRs to skim (chronological order tells the story)

Open these in tabs (`BradleyGleavePortfolio/{repo}/pull/NNN`):

- Backend: **#351 Polar**, **#352 Withings**, **#353 Fitbit** (the gnarly one — 8 rounds), **#354 Wahoo**, **#355 Garmin**. Each PR's "Files changed" tab shows the canonical OAuth connector shape.
- Mobile: **#218 PR-HK-CFG** (Expo native config), **#219 PR-HK-1-mobile** (Connections Hub), **#220 PR-HK-2.b Health Connect**, **#221 PR-HK-2.a Apple HealthKit**, **#222 PR-HK-2.c Samsung Health**.

Skim each PR's **R-final audit verdict** in the comments — that's where the codified fix patterns live (the 4 canonical anti-patterns from §2 of today's session log were caught here).

---

## 2. Technical brief — the system as it stands today

### 2.1 Data flow (top-down)

```
                ┌────────────────────────────────────────────────┐
                │           PROVIDER (Oura, WHOOP, etc.)         │
                └──────────────────────┬─────────────────────────┘
                                       │ OAuth or on-device
                       ┌───────────────┴────────────────┐
                       │                                │
              ┌────────▼────────┐              ┌────────▼────────┐
              │ Server-side     │              │ On-device       │
              │ OAuth connector │              │ HealthKit /     │
              │ (8 of them)     │              │ Health Connect /│
              └────────┬────────┘              │ Samsung Health  │
                       │                       └────────┬────────┘
                       │ webhook + poll                 │ permission flow
                       │                                │ + uploadIngest
                       ▼                                ▼
              ┌─────────────────────────────────────────────────┐
              │       IngestionService (validates + dedup)       │
              │       writes:                                    │
              │         WearableSample (per metric)              │
              │         WearableProcessedEvent (idempotency)     │
              │         updates WearableConnection.last_synced_at│
              └────────────────────┬────────────────────────────┘
                                   │
                                   │ on read:
                                   ▼
              ┌─────────────────────────────────────────────────┐
              │   IngestionService.resolveBest()                 │
              │     1) check WearableUserMetricPreference         │
              │     2) else most-recently-recorded provider      │
              │   returns WearableSample[] in window              │
              └────────────────────┬────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                  ▼
       ┌──────────────────┐              ┌──────────────────┐
       │ HK-3a samples    │              │ HK-4 insights    │
       │ controller       │              │ controller       │
       │ (NEW THIS PHASE) │              │ (already merged) │
       └────────┬─────────┘              └────────┬─────────┘
                │                                  │
                ▼                                  ▼
       ┌──────────────────┐              ┌──────────────────┐
       │ HK-3a/3b UI      │              │ HK-5a/5b AI      │
       │ (in flight)      │              │ panels (queued)  │
       └──────────────────┘              └──────────────────┘
                                                   │
                                                   ▼ coach approves
                                         ┌──────────────────┐
                                         │ HK-6 approval +  │
                                         │ MessagesModule   │
                                         │ materialize      │
                                         │ (queued)         │
                                         └──────────────────┘
```

### 2.2 Locked HTTP contract (HK-3a delivering)

```
GET    /v1/wearables/samples         — read-precedence samples for a window
POST   /v1/wearables/preferences     — write preferred-source override
DELETE /v1/wearables/preferences/:metric

(already live)
GET    /v1/wearables/connections     — list user's connections
POST   /v1/wearables/connections/oauth/start
GET    /v1/wearables/connections/oauth/callback
GET    /v1/wearables/insights/coach?clientId=&bucket=
GET    /v1/wearables/insights/client?bucket=
POST   /v1/wearables/webhooks/<provider>  — 8 webhook endpoints
```

Full request/response shape locked in `applehealthkit/PHASE_2A_DISPATCH_CONTEXT.md`.

### 2.3 Provider matrix (current state)

| # | Provider | Type | Status | PR |
|---|---|---|---|---|
| 1 | Apple Health | On-device (iOS) | ✅ Merged | #221 |
| 2 | Samsung Health | On-device (Android) | ✅ Merged | #222 |
| 3 | Android Health Connect | On-device (Android) | ✅ Merged | #220 |
| 4 | Strava | OAuth | ✅ Merged | (pre-session) |
| 5 | Oura | OAuth | ✅ Merged | (pre-session) |
| 6 | WHOOP | OAuth | ✅ Merged | (pre-session) |
| 7 | Polar | OAuth | ✅ Merged | #351 |
| 8 | Withings | OAuth | ✅ Merged | #352 |
| 9 | Wahoo | OAuth | ✅ Merged | #354 |
| 10 | Garmin | OAuth | ✅ Merged | #355 |
| 11 | Fitbit | OAuth | ✅ Merged | #353 |
| 12 | Peloton | OAuth | ⏸️ Phase 2d — pre-stubbed | — |
| 13 | Eight Sleep | OAuth | ⏸️ Phase 2d — pre-stubbed | — |
| 14 | MyFitnessPal | OAuth | ⏸️ Phase 2d — pre-stubbed | — |
| 15 | Beddit | (deferred — Apple acquired, no public API) | ⏸️ Decision pending | — |

### 2.4 The canonical fix patterns (memorize these — auditors check)

**#1 — Silent-failure rethrow envelope** (Failure #36, learned from 5 backend PRs in Wave-2):

```ts
} catch (err) {
  try {
    await prisma.wearableConnection.update({
      where: { id: conn_id },
      data: { lastError: redactErrorMessage(err), lastErrorAt: new Date() },
    });
  } catch (markErr) {
    this.logger.error({
      event: 'wearable_error_marking_failed',
      provider, conn_id,
      error_class: markErr?.constructor?.name,
      redacted_message: redactErrorMessage(markErr),
    });
  }
  throw err; // outer MUST rethrow
}
```

**#2 — Webhook envelope with conditional date requirement** (Failure #29 + #36, learned from Fitbit R5):

```ts
const Envelope = z.object({
  collectionType: z.enum(['activities', 'sleep', 'body', 'foods']),
  date: z.string().date().optional(),
  ownerId: z.string(),
}).superRefine((env, ctx) => {
  if (DATA_BEARING.has(env.collectionType) && !env.date) {
    ctx.addIssue({ code: 'custom', message: 'date required for data-bearing collection' });
  }
});
// If fetch returns zero records → RELEASE the WearableProcessedEvent reservation, don't stamp success.
```

**#3 — Canonical registry contribution** (Failure #50, learned from Fitbit R7):

```ts
// In every <provider>.module.ts:
{
  provide: WEARABLE_CONNECTORS,  // string token from connector-registry.ts
  useValue: <ConnectorDefinition>{ provider, connector: FitbitConnector, ... },
  multi: true,
}
```

**#4 — Decacorn empty state**:

```tsx
// NEVER:
<View><Text>Coming soon</Text></View>
// NEVER:
<View><ActivityIndicator /></View>
// ALWAYS:
<HealthFitnessSkeleton>
  <ValueFirstPrompt>
    Connect a tracker and we'll fill your rings.
    <CTAButton onPress={() => navigation.navigate('Connections')}>
      Connect Apple Health, Oura, WHOOP, or 8 more
    </CTAButton>
  </ValueFirstPrompt>
</HealthFitnessSkeleton>
```

---

## 3. Operating runbook

### 3.1 Subagent dispatch (the audit→fix loop)

```
1. Pin PR head SHA (40-char, from gh pr view --json headRefOid).
2. Create isolated worktrees:
     git worktree add /tmp/wt-PRNNN-backend <SHA>
     git worktree add /tmp/wt-PRNNN-mobile  <SHA>
3. npm ci --cache /tmp/npm-cache-NNN  (isolated cache!)
4. Dispatch R1 audits in parallel:
     - Opus 4.8 for visual/UX audit (uses screenshot tests + visual grep)
     - GPT-5.5 for code-depth audit (Zod, Prisma, race conditions, IDOR, tests)
5. Collect verdicts. CLEAN (zero P0+P1+P2) → merge with full 40-char SHA:
     gh pr merge <PR_NUM> --merge --match-head-commit <40-char-SHA>
6. NOT CLEAN → spawn Opus 4.8 fixer using
     quality-references/FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md as scaffold.
7. Re-audit (R2, R3, ... until CLEAN).
8. Commit ALL briefs + audits + fix dispatches to tgp-agent-context/.
```

### 3.2 Dispatching builder/fixer subagents (template)

```python
run_subagent(
  subagent_type="general_purpose",
  model="claude_opus_4_8",  # NEVER sonnet — Bradley LAW
  task_name="Build PR-HK-X ...",
  preload_skills=["personal-health/wearables-data"],
  objective="""
    READ FIRST AND EXECUTE EXACTLY: /home/user/workspace/_builder_brief_HK_X.md

    Bradley LAW: no 'Coming soon', no .catch(()=>undefined), no @ts-ignore.
    Commit author EVERY commit: Dynasia G <dynasia@trygrowthproject.com>
    Use bash with api_credentials=["github"] for all git+gh ops.
    50-Failures sweep per /home/user/workspace/_50_failures.md.
    Quality gates GREEN before opening PR.
    Report back with PR URL + 40-char SHA + per-gate pass/fail. Don't half-ship.
  """
)
```

### 3.3 Dispatching auditor subagents (template)

```python
# Code-depth auditor
run_subagent(
  subagent_type="general_purpose",
  model="gpt_5_5",
  task_name="R1 code-depth audit PR-HK-X",
  objective="""
    Pin to PR head SHA <40-char>. Isolated worktree at /tmp/wt-...
    Run all gates (backend 5 / mobile 5). Sweep diff against
    quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md.
    Severity P0 (blocks merge), P1 (blocks merge), P2 (blocks merge),
    P3 (OK to ship). Report verdict: CLEAN | NOT CLEAN with finding list.
  """
)

# Visual/UX auditor (run in parallel)
run_subagent(
  subagent_type="general_purpose",
  model="claude_opus_4_8",
  task_name="R1 UX audit PR-HK-X",
  objective="""
    Pin same SHA. Verify every UX gate in the audit checklist
    (UNIFIED_BUILD_PLAN.md §5 PR-HK-X/Y entry). Include screenshot
    tests where possible. Visual greps required:
      - 'Coming soon' literal
      - N1|N2|N3|NREM|Stage X (for S&R screens)
      - .catch(()=>undefined)
      - @ts-ignore | as any
    Report CLEAN | NOT CLEAN.
  """
)
```

### 3.4 Merge mechanics (Wave-2 gotchas re-codified)

- `gh pr merge --match-head-commit` requires the **full 40-char SHA**. Short SHA returns `GitObjectID coerce` error.
- After merge, `git fetch origin && git checkout main && git pull` BOTH product repos before dispatching next-PR builders, so they pin to the new main HEAD.
- If a PR has been force-pushed by a fixer subagent, the parent's pinned SHA is stale — call `gh pr view --json headRefOid` to refresh BEFORE merging.

### 3.5 Commit authorship discipline

Every commit on every branch (builder, fixer, context):

```bash
GIT_AUTHOR_NAME="Dynasia G" \
GIT_AUTHOR_EMAIL="dynasia@trygrowthproject.com" \
GIT_COMMITTER_NAME="Dynasia G" \
GIT_COMMITTER_EMAIL="dynasia@trygrowthproject.com" \
git commit -m "<message>"
```

NO `Co-authored-by` trailers. Empty commit body. Subject only.

---

## 4. Quality bar — the 10-point contract

This is the contract every subagent objective must embed. Copy verbatim into objectives.

1. **Model:** Opus 4.8 for builders/fixers, Opus 4.8 + GPT-5.5 for audits. Sonnet 4.6 forbidden.
2. **Pin base SHA:** isolated git worktree at the exact base SHA, isolated npm cache dir.
3. **Read** `/home/user/workspace/_50_failures.md` + `quality-references/FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md` before writing code.
4. **Read** `/home/user/workspace/_uiux_paper.md` before any visual work — Revolut glow-drag, Phantom CALM, three-ring Apple-Watch hero, plain-language only.
5. **Commit author always** `Dynasia G <dynasia@trygrowthproject.com>` — no co-author trailers, empty body.
6. **Quality gates green BEFORE PR open** — backend 5-gate, mobile 5-gate including FULL jest suite + both expo prebuilds.
7. **Bradley LAW** as P0 audit gates — no "Coming soon", no silent failures, no spinners as empty states, no `@ts-ignore`, no `as any`, no `.catch(()=>undefined)`.
8. **Report-back contract:** explicit pass/fail per gate, final 40-char SHA, 50-Failures sweep notes, blocking issues. NEVER half-ship.
9. **Auto-merge on CLEAN** — parent merges without prompting once audit verdicts are clean (Bradley directive: "yes, auto merge yourself").
10. **R64 always:** every brief, audit, fix dispatch, and session log committed back to `tgp-agent-context/`.

---

## 5. What's actually in flight (resume here)

**Background subagents (both Opus 4.8) running at handoff time:**

| Subagent ID | What it's doing | Where it writes |
|---|---|---|
| `build_pr_hk_3a_h_f_bucket_samples_api_mpvyj9q3` | HK-3a backend `/v1/wearables/samples` + mobile WearablesShell + HealthFitnessScreen + shared API/hook + RevolutGlowChart + 4 cards + coach H&F tab | PR on `BradleyGleavePortfolio/growth-project-backend` AND `BradleyGleavePortfolio/growth-project-mobile`, branch `hk/PR-HK-3a-fitness-bucket` |
| `build_pr_hk_3b_s_r_bucket_calm_treatment_mpvyjkcg` | HK-3b mobile-only SleepRecoveryScreen + RecoveryRingHero + plain-language SleepStagesCard + CalmSlowReveal + PhantomCalmBanner + coach S&R tab | PR on `BradleyGleavePortfolio/growth-project-mobile`, branch `hk/PR-HK-3b-recovery-bucket` |

**When they report back:**
1. Collect PR URLs + 40-char head SHAs.
2. Dispatch R1 audits (one Opus visual, one GPT-5.5 code-depth) per PR — 3 parallel auditor subagents (2 for HK-3a's two PRs + 1 for HK-3b's one PR — actually 4 if you audit backend+mobile separately for HK-3a).
3. Audit→fix loop until CLEAN.
4. Merge in order: HK-3a backend first, then HK-3a mobile, then HK-3b mobile (HK-3b depends on HK-3a's shared mobile primitives).
5. Commit all audits + fix dispatches to `tgp-agent-context/audits/HK_wave/` + `tgp-agent-context/handoffs/`.
6. Dispatch Phase 2b (HK-5a + HK-5b) using the same dispatch context pattern — write `_builder_brief_HK_5a.md` + `_builder_brief_HK_5b.md` first.

**If subagents are dead by the time you arrive** (sandbox timed out, credits, etc.):
- Re-read the briefs at `/home/user/workspace/_builder_brief_HK_3a.md` + `_HK_3b.md`.
- Check PR state with `gh pr list --state open --label hk-phase-2a` — they may have already opened PRs even if the subagent process died.
- Re-dispatch with the same brief, same model, same SHA pins.

---

## 6. Runbook gaps + known landmines

Things I noticed today that aren't yet in the rules but should bite you if you ignore them:

| Landmine | Symptom | Mitigation |
|---|---|---|
| Parallel auditors share git HEAD | Auditor X's worktree pulls in Auditor Y's branch | Always `git worktree add /tmp/wt-N <SHA>` — never `git checkout` on a shared clone |
| Parallel agents corrupt shared `node_modules` | Random ENOENT / EBUSY mid-`jest` | `npm ci --cache /tmp/npm-cache-N` — isolated cache per worktree |
| Short SHA in `gh pr merge --match-head-commit` | `GitObjectID coerce` error | Always full 40-char from `gh pr view --json headRefOid` |
| Fixer subagent force-pushes after parent pinned SHA | Parent re-audits stale code | Refresh SHA via `gh pr view --json headRefOid` before EVERY audit dispatch |
| Mobile jest passes for new files but fails full suite | "Bradley LAW: any existing test red = P0" | Always run FULL `jest --runInBand`, never `jest <pattern>` |
| Expo prebuild fails only on one platform | iOS PASS, Android FAIL silently if you only check iOS | Always run BOTH `expo prebuild --platform ios --clean` AND `--platform android --clean` |
| Reanimated worklet tests fail in jest | Worklet hoisting issue | See `growth-project-mobile/audit-worklets-jest.md` |
| `WearableProcessedEvent` table grows unbounded | DB bloat over time | Cron prune for rows ≥14d (longest provider redelivery window) — still TODO post Wave-2 |
| Apple Health `Beddit` provider | Beddit acquired by Apple, no public API | Decision pending — formal defer or v3 stub |
| Cross-repo doc references break CI | Backend's CI doc-allowlist doesn't know about `tgp-agent-context/` paths | Add bare filename to backend `.agent-doc-allowlist` |

---

## 7. Things I would do differently (lessons from today)

1. **Pre-write the fixer brief with the canonical anti-patterns** before R1 dispatches. We re-derived the silent-failure rethrow pattern 5 times across 5 backend PRs in Wave-2 before codifying it. The `FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md` now front-loads it.
2. **Add the visual-grep gates to the auditor brief, not just the PR description**. Saved time on R2 of Fitbit when an earlier R1 missed the registry-contribution shape mismatch.
3. **Pin auditor subagents to the SAME SHA as builder report-back**, not to "latest origin/branch". A fixer subagent force-pushing mid-audit silently rebases the auditor's worktree.
4. **Open the PR description with the full quality-gate matrix** the builder ran. Auditors then know what's been claimed-passing vs. what they need to re-verify.
5. **Schedule HK-3a-then-HK-3b strictly, not "parallel with stubs"** when HK-3b is small. The stub-then-rebase dance costs more than just waiting 30 min. (I dispatched in parallel anyway today because Bradley wants velocity — but next operator, judgment call.)

---

## 8. Quick-start: "I just got handed this thread, what do I do in the next hour?"

1. **Minute 0–5:** Read this file (you're doing it).
2. **Minute 5–15:** Open the 5 ★ context-repo docs + `prisma/schema.prisma` lines 4990–5210 + `wearable-insights.controller.ts` + `wearablesConnectionsApi.ts`.
3. **Minute 15–20:** Check subagent status. If they've reported back, collect PR URLs + 40-char SHAs. If still running, call `wait_for_subagents` with their IDs.
4. **Minute 20–35:** When PRs are open, dispatch R1 audits (1 Opus visual + 1 GPT-5.5 code-depth per PR — write the audit briefs first, save to `/home/user/workspace/_auditor_brief_R1_phase2a_*.md`).
5. **Minute 35–60:** Wait. When auditors return, classify verdicts. CLEAN → merge. NOT CLEAN → spawn Opus 4.8 fixer with the 50-Failures-aware brief.
6. **Hour 1+:** Iterate audit→fix until CLEAN, merge, commit audits + briefs to `tgp-agent-context/`. Then write Phase 2b builder briefs (HK-5a + HK-5b) and dispatch.

---

## 9. Bradley-voice reminders (paste into your head before every dispatch)

> "audits need done by gpt5.5/opus 4.8's, depending on whether the task is more code depth or visual checks"
>
> "builder/fixers are opus 4.8 always"
>
> "yes, auto merge yourself"
>
> "ABSOLUTELY NOTHING SHPOULD BE COMING SOON OR A SILENT FAILURE -> ALL OF THIS IS BUILT TO LUANCH QUALITY, DECACORN QUALITY, POLISHED AND COMPLETE"
>
> "use this as guidance on how to prevent shitty AI code as well!" — re: the 50-Failures doc

If a PR's audit verdict isn't grounded in those directives, you've drifted. Re-anchor.

---

**End of onboarding. Go build.**
