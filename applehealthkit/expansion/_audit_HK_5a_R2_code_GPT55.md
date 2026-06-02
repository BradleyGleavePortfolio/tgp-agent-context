# HK-5a R2 Independent Code Audit — GPT-5.5

**Verdict: NEEDS_FIX**

R2 passes the required TS/ESLint/Jest/R0 gates and fixes the R65 retry/hook-exit concerns, but I found one blocking P2 source-level accessibility/contract issue in the warm `accentInk` fix: the selected warm ink token does **not** actually meet WCAG AA contrast on the app's real `bone`/`cream` tokens while it is used for text and CTA fills.

## Required gate results

Worktree: `/tmp/wt-hk5a-audit-r2`

- `git rev-parse HEAD` → exit **0**, SHA `aad8931848c701720a6f1ca68436d2c66501e694`.
- `git log -1 --format='%an <%ae>%n%B'` → exit **0**, author `Dynasia G <dynasia@trygrowthproject.com>`, subject-only commit message.
- Touched TS/TSX files: `src/api/__tests__/wearableInsightsApi.test.ts`, `src/api/wearableInsightsApi.ts`, `src/hooks/__tests__/useWearableInsight.test.tsx`, `src/hooks/useWearableInsight.ts`, `src/screens/client/wearables/wearablesTheme.ts`, `src/screens/coach/client-detail/HealthFitnessTab.tsx`, `src/screens/coach/client-detail/SleepRecoveryTab.tsx`, `src/screens/coach/client-detail/WearableInsightPanel.tsx`, `src/screens/coach/client-detail/__tests__/HealthFitnessTab.test.tsx`, `src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx`, `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx`.
- `npx tsc --noEmit` → exit **0**.
- `npx eslint $TOUCHED` → exit **0**.
- `npx jest --testPathPattern='(WearableInsightPanel|useWearableInsight|HealthFitnessTab|SleepRecoveryTab|wearableInsightsApi)' --runInBand` → exit **0**; 5 suites / 37 tests passed; **no** “Jest did not exit one second after the test run has completed” warning.
- `npx jest --testPathPattern='useWearableInsight' --runInBand` → exit **0**; 1 suite / 4 tests passed; **no** “did not exit” warning.
- R0 added-line sweep → exit **1** with empty output, as expected for no matches.

Full gate transcript saved at `/home/user/workspace/_audit_HK_5a_R2_gate_outputs.txt`.

## Blocking findings

### P2 — Warm `accentInk` still fails AA contrast while used for text and CTA fill

**Evidence:**

- `src/screens/client/wearables/wearablesTheme.ts:30-43` adds `ToneTokens.accentInk` and claims it is AA-safe on `bone` and `cream`.
- `src/screens/client/wearables/wearablesTheme.ts:52-55` sets `WARM.accentInk = gold[700]`.
- `src/theme/tokens.ts:32-33` defines actual surfaces: `bone = #F5EFE4`, `cream = #F1E8D5`.
- `src/theme/tokens.ts:126` defines `gold[700] = #8A6A2A`.
- Recomputed exact contrast:
  - `#8A6A2A` on `bone #F5EFE4` = **4.39:1** (fails 4.5:1).
  - `#8A6A2A` on `cream #F1E8D5` = **4.13:1** (fails 4.5:1).
  - `bone #F5EFE4` text/icon on `#8A6A2A` CTA fill = **4.39:1** (fails 4.5:1).
- The failing token is used for warm on-light text and CTA fill in `src/screens/coach/client-detail/WearableInsightPanel.tsx:286`, `:292`, `:508`, `:516`, and `:547`.

**Impact:** F2/F3 source threading exists, but the chosen warm foreground/fill token does not satisfy the claimed accessibility contract. Use a darker token such as `gold[800]` or another palette value that passes against both `bone` and `cream` and with `bone` text on the filled CTA.

## F1–F7 verification

- **F1 — R0 hygiene test block removed:** Verified no `describe('R0 hygiene', ...)` or `coming soon` literal remains in `WearableInsightPanel.test.tsx`; panel test file now contains 13 test cases and the full required Jest pattern passes.
- **F2 — `accentInk` field added/threaded:** Verified `ToneTokens.accentInk` exists and warm/cool values are wired in `wearablesTheme.ts:30-43`, `:52-63`; however warm value fails contrast per P2.
- **F3 — `accentInk` replaces `tone.accent` for on-light text/CTA source usage:** Verified `toneInk = tone.accentInk` at `WearableInsightPanel.tsx:104-107`; retry/read-more/review CTA/sheet retry/edit label/primary fill use `toneInk` or `accentInk` at `:228`, `:286`, `:292`, `:508`, `:516`, `:547`; icons and chip/border continue using `tone.accent` at `:174`, `:222`, `:260`, `:265`. Contrast still fails for warm per P2.
- **F4 — Retry replays exact last attempt:** Verified local `lastAttemptRef` stores `{ action, draftBody }` at `WearableInsightPanel.tsx:402-408`, is populated before mutation at `:413-419`, and retry replays `last.action`/`last.draftBody` at `:441-447`.
- **F4/R65 #28 — Retry race guard:** Verified `onRetrySend` returns early when `busy` is true at `WearableInsightPanel.tsx:441-444`; primary/edit/dismiss controls are also disabled during pending mutation at `:438-439`, `:519`, `:538`, `:557`.
- **F4 test coverage:** Verified new retry semantics tests cover approve-after-edit, dismiss-error retry, and edit-error retry at `WearableInsightPanel.test.tsx:249-327`.
- **F5 — hook test cleanup / no forced exit:** Verified `QueryClient` uses query/mutation `gcTime: 0` at `useWearableInsight.test.tsx:53-61`, afterEach calls `qc.clear()` and `qc.unmount()` at `:75-83`, and no Jest config adds `--forceExit`. Isolated hook Jest run exits cleanly.
- **F6 — `charCount` color:** Verified `charCount` uses `colors.charcoal` at `WearableInsightPanel.tsx:713-718`.
- **F7 — versioned query keys:** Verified `INSIGHT_KEY_VERSION = 'v1'` and keys include it at `wearableInsightsApi.ts:230-242`; hook invalidation uses `insightQueryKeys.coach(...)` at `useWearableInsight.ts:70-73`, and hook tests assert against the helper at `useWearableInsight.test.tsx:139-141`.

## Backend contract parity

- Mobile coach schema matches backend coach schema fields, `.strict()`, `max(280)`, draft `max(1000)`, confidence enum, and source metric validation (`wearableInsightsApi.ts:51-94`; backend `insight-output.schema.ts:19-62`).
- Mobile empty schema matches backend empty schema including literal observation, `i_think`, length-0 `source_metrics`, `is_empty: true`, and `.strict()` (`wearableInsightsApi.ts:97-106`; backend `insight-output.schema.ts:146-155`).
- Mobile client schema matches backend client schema fields, optional CTA constraints, `.strict()`, and source metric requirements (`wearableInsightsApi.ts:112-126`; backend `insight-output.schema.ts:73-87`).
- Read endpoints use `/v1/wearables/insights/coach` and `/v1/wearables/insights/client` (`wearableInsightsApi.ts:180-196`), matching backend controller route prefix and `@Get('coach')` / `@Get('client')` (`wearable-insights.controller.ts:55-95`).
- Mobile also includes a speculative pre-HK-6 `POST /v1/wearables/insights/approve` path (`wearableInsightsApi.ts:199-228`) with typed 404 degradation. I did not classify this as blocking because F4 depends on the approve mutation path and tests intentionally cover it, but it remains not present in the current backend controller.

## R0 LAW sweep

- No added `coming soon` literals, including tests/comments/test titles.
- No added `@ts-ignore` / `@ts-nocheck`.
- No added `as any` / `as unknown as`.
- No added `.catch(() => undefined)`.
- No added empty catch blocks matching the mandated sweep.
- Loading state is skeleton copy/structure, not spinner-only (`WearableInsightPanel.tsx:186-201`).

## Diff scope discipline

Diff scope is limited to the expected wearable insight API/hook/panel/theme files, two tab mounts, and their tests. No `node_modules` pollution or unrelated refactor observed in `git diff --stat origin/main..HEAD`.

## 50-failures sweep checklist

1. Hardcoded secrets/API keys — No new secrets in changed TS/TSX.
2. Missing RLS — No DB/schema changes in diff.
3. SQL injection — No SQL/raw query construction in diff.
4. XSS — No HTML injection / `dangerouslySetInnerHTML` in diff.
5. IDOR — Coach read remains backend-guarded by coach ownership; mobile approve path sends `client_id` but backend is absent/pre-HK-6, so no weakened shipped backend auth observed.
6. Rate limiting — Backend read endpoints already throttled; no backend mutation added here.
7. Weak JWT — No auth token handling changed.
8. Missing runtime validation — Zod `.parse()` schemas guard mobile responses.
9. Privilege escalation — No role checks moved client-side.
10. Unverified dependencies — No package additions observed.
11. CORS — Not applicable to mobile diff.
12. Secrets in errors — Panel sanitizes displayed errors; approve 404 logging omits client ID.
13. HTTPS enforcement — Not applicable to mobile diff.
14. Monolith boundaries — API/hook/panel separation maintained.
15. Over-specific code — Panel is feature-specific but bounded; no blocking duplication found.
16. Avoidance of refactors — No unrelated refactor; scope appropriate.
17. Fake coverage — Tests assert exact payloads, schema failures, retry semantics, and hook invalidation.
18. Environment parity — No hardcoded localhost or file paths introduced.
19. API versioning — API routes and query-key cache namespace are versioned (`/v1`, key segment `v1`).
20. Circular dependencies — No circular import signs in touched files.
21. N+1 queries — No DB query loops in mobile diff.
22. Missing DB indexes — No DB schema/query change.
23. No pagination — No list endpoint introduced.
24. Event-loop blocking — No sync filesystem/CPU-heavy request code.
25. No caching strategy — React Query stale time and versioned keys present; no stale cross-version bleed found.
26. Image/media handling — Not applicable.
27. Polling instead of realtime — No polling interval added.
28. Race conditions — Retry has `busy` guard; buttons disabled during mutation.
29. Payment idempotency — Not applicable.
30. Optimistic UI without rollback — No optimistic server-state mutation; success/pending/error handled through mutation callbacks.
31. Stale closures — Hook dependencies acceptable; one intentional query-object dependency suppression is timer-scoped.
32. Unmount cleanup — `lastAttemptRef` is per component instance; forward-hook timer cleanup exists; hook tests clear/unmount QueryClients.
33. Error boundaries — No new app-level boundary, but panel has local load/error/empty fallbacks.
34. Observability — Approve 404 logs structural context only; no sensitive IDs logged.
35. API timeout handling — Uses existing `api` service; no new timeout config in this diff.
36. Silent failures — Non-404 approve errors rethrow; hook does not swallow mutation errors.
37. Health checks — Not applicable.
38. Comments everywhere — Comments are somewhat dense but mostly rationale/contract notes; no blocking issue.
39. Textbook over-patterning — No unnecessary abstraction introduced.
40. Repeated bugs / duplication — Shared API contracts and query keys reduce duplication.
41. Reimplementing library behavior — Uses Zod/React Query rather than hand-rolled validation/cache.
42. Over-engineering impossible edge cases — Retry fallback is defensive but acceptable.
43. Dead code/orphan modules — ESLint passes on touched files.
44. Missing transactions — No multi-step DB write added.
45. Missing soft deletes — No delete/destructive backend operation added.
46. Missing DB validation — No DB schema change.
47. Backup/recovery — Not applicable.
48. CI/CD pipeline — Required gates pass, including isolated hook Jest without hang warning.
49. Env-specific code in production — No screenshot/mock/demo mode added to production source.
50. Graceful degradation — Empty states and approve 404 typed degradation exist; contrast issue remains separate P2.

## Non-blocking observations

- The full Jest pattern emits React `act(...)` console warnings from `useReduceMotion` / vector icon async updates, but it exits 0 and does not emit the forbidden Jest hang warning. Consider cleaning this test noise later so CI output remains high-signal.
