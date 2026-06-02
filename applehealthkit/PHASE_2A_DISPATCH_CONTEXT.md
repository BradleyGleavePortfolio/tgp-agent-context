# PHASE 2A DISPATCH CONTEXT — HK-3a + HK-3b (UI Bucket Screens)

**Dispatched:** 2026-06-01 ~18:30 PDT
**Status at write-time:** Both Opus 4.8 builders in flight (background subagents).
**Predecessor:** All 9 Wave-2 PRs merged (see `SESSION_LOG_2026-06-01_WAVE2_COMPLETE_PHASE2A_KICKOFF.md`).
**Successor:** Phase 2b (HK-5a/5b AI panels) — gated on 3a+3b CLEAN merges.

---

## What was dispatched

| PR | Subagent ID | Brief file (workspace) | Owns |
|---|---|---|---|
| **PR-HK-3a** | `build_pr_hk_3a_h_f_bucket_samples_api_mpvyj9q3` | `_builder_brief_HK_3a.md` (266 lines) | Backend `/v1/wearables/samples` + preferences API. Mobile `WearablesShell` + `HealthFitnessScreen` + shared `MetricDetailScreen` + `wearablesSamplesApi` + hooks + `ThreeRingHero` + 4 H&F cards + `RevolutGlowChart` (warm) + `FreshnessChip` + `ProviderOverlapChips` + coach H&F tab. |
| **PR-HK-3b** | `build_pr_hk_3b_s_r_bucket_calm_treatment_mpvyjkcg` | `_builder_brief_HK_3b.md` (191 lines) | Mobile only. `SleepRecoveryScreen` + single `RecoveryRingHero` + plain-language `SleepStagesCard` + HRV/Respiration/Consistency cards + `CalmSlowReveal` wrapper + `PhantomCalmBanner` (reassurance-first) + coach Recovery tab (anomaly band + cohort comparison, coach-only). |

Both builders are Opus 4.8 (Bradley LAW: Sonnet 4.6 forbidden).

---

## Schedule + parallel-safety contract (per UNIFIED_BUILD_PLAN.md §6 / §7)

HK-3a lands first by schedule because it owns all shared infrastructure:

```
HK-3a creates:                              HK-3b imports (never edits):
  wearablesSamplesApi.ts                  →   wearablesSamplesApi.ts
  useWearableSamples.ts                   →   useWearableSamples.ts
  useWearablePreference.ts                →   useWearablePreference.ts
  WearablesShell.tsx                      →   (forbidden to touch — mounts both children)
  MetricDetailScreen.tsx                  →   (imports for sleep/recovery metric routes)
  charts/RevolutGlowChart.tsx             →   (imports with tone='cool')
  components/FreshnessChip.tsx            →   (imports)
  components/ProviderOverlapChips.tsx     →   (imports)
  ClientNavigator.tsx (Stack.Screen Health) →  (forbidden to touch)
```

HK-3b builds against **local gitignored stubs** matching the locked contracts to get green gates. When HK-3a lands, parent agent rebases HK-3b which deletes its stubs and uses the real files.

Shared edit points (one-line additive merge expected):
- `ClientDetailScreen.tsx` tabs array: 3a adds `'healthFitness'`, 3b adds `'sleepRecovery'`.
- `client-detail/types.ts` `TabKey` union: same additive pattern.

---

## HTTP contract locked by HK-3a (auditor will gate)

```
GET /v1/wearables/samples
  Auth: JwtAuthGuard + CoachGuard (only if clientId present)
  Query (Zod, reject extras):
    bucket: HEALTH_FITNESS | SLEEP_RECOVERY                   (required)
    metric?: WearableMetricType                                (optional)
    from: ISO8601                                              (required)
    to:   ISO8601                                              (required, to-from <= 90d)
    clientId?: UUID                                            (coach-only)
    granularity?: raw | hour | day                             (default raw)
    preferredOnly?: boolean                                    (default true)
  Throttle: 60/min/user
  Response: { version, user_id, bucket, window, series[], freshness{providers[]} }
  Errors: 400 WEARABLE_SAMPLES_QUERY_INVALID; 403 WEARABLE_SAMPLES_FORBIDDEN; 503 WEARABLE_SAMPLES_DEGRADED

POST /v1/wearables/preferences         Body: { metric, preferred_provider }
DELETE /v1/wearables/preferences/:metric
```

Backend wires `IngestionService.resolveBest()` (already exists per HK-0).
Coach IDOR defence: `assertCoachOwnsClient(coachId, clientId)` MUST be first line after Zod parse.
All Prisma calls wrapped with 5s `Promise.race` timeout → 503 (Failure #35 + #50).
NEVER log raw sample values (Failure #9).

---

## UX gates locked

### HK-3a (Fitness Overview — warm tone)
1. Three-ring Apple-Watch hero (animated Reanimated worklet, reduce-motion safe)
2. HeartCard / WorkoutsCard / BodyCard / FitnessTrendCard (Revolut glow-drag)
3. Freshness chip floats top-right (client-derived from `useWearableConnections()`, NOT a server field)
4. Provider-overlap chips on Metric Detail write `WearableUserMetricPreference` with optimistic update + rollback toast
5. Empty: skeleton + value-first prompt + Connect CTA. NOT a spinner. NOT "Coming soon."
6. Cap: ≤5 primary chunks above the fold. AI panel slot reserved (collapsed by default, HK-5b adds).

### HK-3b (Recovery Overview — cool tone, Phantom CALM)
1. Single recovery-ring hero (35% viewport, larger than H&F three-ring)
2. PhantomCalmBanner (`reassurance` line BEFORE `deficit` line — auditor greps for forbidden patterns)
3. SleepStagesCard with **plain-language ONLY** — `awake / light sleep / deep sleep / REM`. Auditor will `grep -rE '\b(N1|N2|N3|NREM|Stage [0-9]|Stage I|Stage II|Stage III)\b' src/screens/client/wearables/` and FAIL on any match
4. CalmSlowReveal 600ms ease-out on every S&R card (reduce-motion safe)
5. NEVER red for low scores; desaturated, soft amber only for SpO2 < 90% sustained
6. Coach Recovery tab: anomaly band + cohort comparison COACH-ONLY (client device never renders cohort data); 403 fallback is graceful, NEVER throws

---

## Quality gates each builder MUST hit before opening PR

### Backend (HK-3a only)
```
npx prisma validate    # PASS
npx tsc --noEmit       # PASS
npx eslint .           # 0 warnings
npx jest --runInBand   # PASS (incl. new controller + service + integration + DST + timeout tests)
npx nest build         # PASS
```

### Mobile (both 3a + 3b)
```
npx tsc --noEmit                              # PASS
npx eslint .                                  # 0 warnings
npx jest --runInBand                          # FULL suite (Bradley LAW: any existing test red = P0 regression)
npx expo prebuild --platform ios --clean      # PASS
npx expo prebuild --platform android --clean  # PASS
```

50-Failures sweep notes required in report-back.

---

## When builders return: audit→fix loop kickoff

1. Pin PR head SHAs (full 40-char) into isolated git worktrees.
2. Dispatch parallel R1 audits per PR:
   - **GPT-5.5 code-depth audit** — focus backend controller, service, Zod schemas, Prisma queries, race conditions, IDOR, timeout handling, test fidelity, 50-Failures sweep.
   - **Opus 4.8 visual/UX audit** — focus screen layouts, CALM treatment grep, plain-language stage grep, reduce-motion compliance, empty/error state quality, three-ring animation correctness, Revolut glow-drag responsiveness.
3. CLEAN → auto-merge per Bradley directive.
4. NOT CLEAN → spawn Opus 4.8 fixer with the R4 50-Failures-aware fixer brief template (`/home/user/workspace/_fixer_brief_R4_wave2_50FAILURES.md`).
5. Re-audit until CLEAN (zero P0 + zero P1 + zero P2). P3 OK to ship.
6. `gh pr merge --match-head-commit <40-char-SHA>` (full SHA required).
7. Commit all audits + fix dispatches to `tgp-agent-context/audits/` and `tgp-agent-context/handoffs/`.

---

## Repo SHAs at dispatch

```
growth-project-backend  main HEAD: a73b02f21dffb711f5b6634abdf2ac5f52eec310
growth-project-mobile   main HEAD: 3e447ab29683e5ef4a3124f00bc04b0fc8b66998
```

Both builders pinned to these SHAs.

---

## Phase 2b queued (gated on 3a+3b CLEAN)

- PR-HK-5a — coach AI panel (collapsed default, confidence chip neutral, no green-for-good, no mascot)
- PR-HK-5b — client AI panel (CALM treatment on S&R variant, forward-hook closure after CTA, ≤3 taps)

## Phase 2c queued (gated on 5a+5b CLEAN)

- PR-HK-6 — approval workflow (`AiActionDraft` → materialize, concurrent-approve idempotency test, IDOR-safe coach owner check, audit row on both `decided_at` + `materialised_at`, recipient name in header)

## Phase 2d queued (parallel-safe with 5/6)

- PR-HK-2.j Peloton, PR-HK-2.m Eight Sleep, PR-HK-2.n MyFitnessPal — same connector interface as Wave-2 OAuth providers.
