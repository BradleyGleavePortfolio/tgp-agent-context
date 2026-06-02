# HK-5a R1 Audit — code GPT-5.5

**Head SHA:** 8b3f60a6c8e40043e7a38fdb9c909085db5f43f7
**Verdict:** NEEDS_FIX

## Gate results

- Head/metadata: PASS — HEAD is `8b3f60a6c8e40043e7a38fdb9c909085db5f43f7`; single commit by `Dynasia G <dynasia@trygrowthproject.com>`; title-only body, no trailers.
- Worktree: PASS for tracked files — only untracked `node_modules` symlink present.
- TypeScript: PASS — `npx tsc --noEmit` exited `0`.
- ESLint: PASS — targeted touched-file lint exited `0`.
- Jest: FAIL as a gate process — the suites report `5 passed, 35 tests passed`, but the required command does not terminate cleanly; bounded rerun exited `124` after printing `Jest did not exit one second after the test run has completed`.
  - Isolated cause: `useWearableInsight` suite alone passes 4/4 but does not exit (`HOOK_EXIT 124`).
- R0 added-line ban scan: FAIL — added lines contain the banned `Coming soon` literal in a test title and regex assertion.
- Backend contract mirror: PASS for read contract — mobile schemas match backend `CoachInsightSchema`, `ClientInsightSchema`, `EmptyInsightSchema`, confidence enum, source metric enum value set, `.strict()`, min/max constraints, empty literal, and `source_metrics.length(0)` branch. Backend controller exposes only `GET /v1/wearables/insights/coach` and `GET /v1/wearables/insights/client`; no approve endpoint exists yet.
- 404 shim: PASS for non-404 masking — `approveDraft` uses `axios.isAxiosError(err) && err.response?.status === 404`, rethrows Zod drift and all non-404 errors.
- HK-3a/3b tab test mock additions: PASS — added hook mocks only; no existing assertions were weakened.

## Findings

### P2 — R0 banned “Coming soon” literal appears in added test output and regex
- File: `src/screens/coach/client-detail/__tests__/WearableInsightPanel.test.tsx:250`
- Issue: R0 bans the literal anywhere in the diff, including test titles and regex assertions that can print to CI output.
- Evidence: Added-line R0 scan reports:
  - `+  it('never renders the banned "Coming soon" string in any state', () => {`
  - `+      expect(queryByText(/coming soon/i)).toBeNull();`
- Fix: Remove the literal entirely; use a constructed string/regex that does not place the contiguous banned phrase in source or CI output.

### P2 — Review-sheet retry can send the wrong action/body after an action error
- File: `src/screens/coach/client-detail/WearableInsightPanel.tsx:477`
- Issue: The error Retry CTA does not remember the failed action; it always calls `run(edited ? 'edit' : 'approve', body)`, so a failed Dismiss retry becomes Approve/Edit, and an Approve retry after local edits can switch from original body to edited body.
- Evidence: Actions call `run('approve', original)`, `run('edit', body)`, and `run('dismiss', '')`, but the retry handler is hard-coded to `onPress={() => run(edited ? 'edit' : 'approve', body)}`.
- Fix: Track the last attempted `{ action, draftBody }` in state/ref and have Retry replay that exact payload; add tests for approve-after-edit error retry and dismiss error retry.

### P2 — Required Jest gate hangs despite passing assertions
- File: `src/hooks/__tests__/useWearableInsight.test.tsx:47`
- Issue: The required Jest command does not exit cleanly, making the CI gate unreliable even though assertions pass.
- Evidence: Bounded isolated run printed `HOOK_EXIT 124` with `Test Suites: 1 passed, 1 total` / `Tests: 4 passed, 4 total` followed by `Jest did not exit one second after the test run has completed`.
- Fix: Ensure hook tests dispose React Query resources/timers after each test (for example clear the QueryClient and unmount/cleanup explicitly) so the unforced Jest command exits `0`.

### P3 — Insight React Query keys are scoped but not versioned
- File: `src/api/wearableInsightsApi.ts:230`
- Issue: Keys include surface, clientId, and bucket, but the audit brief requires versioned keys as well to avoid stale persisted-cache bleed after contract changes.
- Evidence: `insightQueryKeys.coach` returns `['wearable-insight', 'coach', clientId, bucket]`; `insightQueryKeys.client` returns `['wearable-insight', 'client', bucket]`.
- Fix: Add an explicit version segment/root such as `['wearable-insight', 'v1', ...]` and update hook tests accordingly.

## Verified passes / non-findings

- Backend schema mirror is exact for full coach, client, and empty branches: strict object shapes, `observation/hypothesis/suggested_action` max 280, draft max 1000, `optional_cta.deep_link` constrained to `tgp://`, confidence levels `i_think|fairly_sure|confident|certain|verified`, non-empty full `source_metrics`, and empty `source_metrics` length 0.
- Source metric enum parity checked: mobile and backend each expose 29 values with no missing or extra values.
- Endpoint paths match backend controller for read APIs: `/v1/wearables/insights/coach` with `{ clientId, bucket }` and `/v1/wearables/insights/client` with `{ bucket }`.
- Approval shim does not use `as any`, `as unknown as`, `@ts-ignore`, or an empty catch, and non-404 failures are rethrown.
- Review-sheet actions all surface some inline error UI, but retry semantics are incorrect for the P2 case above.
- HK-3a/3b tab test changes only add deterministic hook mocks; the original IDOR/error/no-all-clear assertions remain intact.

## 50-Failures sweep (R65)

Actively checked all 50 categories, with special attention to the categories relevant to this diff:

- #1 hardcoded secrets/API keys — no new secrets in changed files.
- #2 RLS — no database/schema changes in this mobile PR.
- #3 SQL injection — no SQL introduced.
- #4 XSS/unescaped output — React Native text rendering only; no HTML sinks.
- #5 IDOR — coach read remains clientId-scoped and backend-gated; adjacent 403 tests remain green.
- #6 rate limiting — backend read endpoints are throttled; no new backend endpoint shipped.
- #7 JWT/auth config — no auth config changed.
- #8 runtime validation — Zod parse at API boundary, `.strict()` enforced by tests.
- #9 privilege escalation — no frontend role override added; coach/client surfaces remain separate.
- #10 dependency risk — no package/lockfile changes.
- #11 CORS — no server CORS changes.
- #12 secrets/error exposure — UI sanitizes fetch errors and does not render raw Axios/Zod internals.
- #13 HTTPS — no transport config changes.
- #14 layer boundaries — API client, hooks, and UI kept separate.
- #15 hyper-specific code — panel is feature-specific but shared API/hook surfaces are reusable for HK-5b.
- #16 avoidance of refactors — no unrelated production refactor observed.
- #17 fake coverage — tests assert specific URL/body/schema/error behavior; found missing retry-action coverage.
- #18 environment parity — no hardcoded localhost or local file assumptions.
- #19 API versioning — endpoint paths are `/v1`; query keys lack explicit version (P3).
- #20 circular dependencies — no obvious import cycle in changed files.
- #21 N+1 queries — no database loop code.
- #22 indexes — no database queries/schema changed.
- #23 pagination — no list endpoint introduced.
- #24 blocking sync operations — no sync file/CPU work introduced.
- #25 caching strategy — 6h staleTime matches stated insight cache; key versioning gap noted.
- #26 media handling — no media uploads.
- #27 polling — no polling/interval fetch loops.
- #28 race conditions — mutation callbacks reviewed; retry payload state bug found.
- #29 payment idempotency — no payment flow.
- #30 optimistic UI rollback — no optimistic success before server ok; forward hook only after ok.
- #31 stale closures — reviewed effects/callbacks; one intentional eslint-disable around timer noted.
- #32 unmount cleanup — forward-hook timer cleanup present; Jest hook suite still leaves process open.
- #33 error boundaries — component has local error/empty/loading states; no global boundary changes.
- #34 observability — 404 shim logs structural event without client ID.
- #35 API timeout — no timeout config changed in shared axios client.
- #36 silent failures — no empty catches; non-404 errors propagate; retry-action bug prevents correct recovery for one path.
- #37 health checks — no backend service changes.
- #38 comments everywhere — comments are heavy but mostly explain audit/security rationale.
- #39 over-patterning — no excessive abstractions added beyond API/hook/component split.
- #40 repeated bugs — confidence and query-key constants centralized.
- #41 library reimplementation — uses Zod, React Query, Axios helpers rather than custom validators/status detection.
- #42 over-engineering — no blocking over-engineered edge-case machinery found.
- #43 dead code — lint passes; no unused imports reported.
- #44 DB transactions — no DB writes in this PR.
- #45 soft deletes — no delete endpoint or destructive DB operation.
- #46 DB validation — no database layer changes.
- #47 backup/recovery — not applicable to mobile diff.
- #48 CI/CD — gate hang found in Jest command.
- #49 environment-specific code — no dev-only fixtures added to production bundle.
- #50 graceful degradation — read errors/empty/loading degrade gracefully; approve 404 degrades gracefully, but action-error retry semantics need fixing.
