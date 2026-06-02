# HK-3b Mobile R2 Audit — code GPT-5.5

**Head SHA:** d666219dd64c8483f5b3f9c074ceb4248678ad6f
**Verdict:** NEEDS_FIX

## Gate results
- tsc: 0 errors
- lint: clean (brief command exit 0; also re-ran against actual changed `*.ts`/`*.tsx` files, exit 0)
- jest: 188/188 suites, 2053 tests pass; Jest emitted its existing open-handle warning after the pass summary
- prebuild: verified via fixer log only
- R0 ban scan: violations listed below (`Coming soon` / `coming soon` remains in added comments/test code)
- Commit metadata: Author=Dynasia G correct; no Co-Authored-By or Generated-By found in PR commit messages

## Findings

### P2 — R0 banned “Coming soon” wording remains in the HK-3b diff
- File: `src/screens/client/wearables/WearablesShell.tsx:15`; `src/screens/client/wearables/__tests__/WearablesShell.test.tsx:8`; `src/screens/client/wearables/__tests__/WearablesShell.test.tsx:109`
- Issue: Bradley R0 bans “Coming soon” strings in code, comments, and tests, but the R2 diff still adds the banned phrase in a production comment, a test comment, and a case-insensitive test regex.
- Evidence: `grep -ni 'coming soon'` over the PR diff reports `+ *     "connect a sleep source" prompt — NOT a "Coming soon" placeholder`, `+ *     placeholder surface (NEVER "Coming soon"),`, and `expect(screen.queryByText(/coming soon/i)).toBeNull();`.
- Fix: Remove the banned phrase entirely from comments and tests; assert shell wiring via `RECOVERY_OVERVIEW`, route-param sync, and absence of the old placeholder surface without spelling the banned phrase.

### P3 — New tests use `as unknown as` type escapes
- File: `src/screens/client/wearables/__tests__/CalmSlowReveal.test.tsx:21,37,53`; `src/screens/client/wearables/__tests__/SleepRecoveryScreen.test.tsx:64,158`; `src/screens/client/wearables/__tests__/cards.test.tsx:31`; `src/screens/coach/client-detail/__tests__/SleepRecoveryTab.test.tsx:51,79`
- Issue: The code-audit brief asks strictness checks to include `as unknown as`; R2 adds several double-casts in tests, mostly for mocked `AccessibilityInfo.addEventListener` returns and one malformed-param case.
- Evidence: The diff scan reports `.mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>)`, `bucketParam={'__evil__' as unknown as string}`, and `error: { status: 403, message: 'forbidden' } as unknown as Error`.
- Fix: Replace double-casts with typed test helpers/fixtures (for example, a typed subscription helper, a plain malformed string prop, and an `Object.assign(new Error('forbidden'), { status: 403 })` transport error fixture).

## 50-Failures sweep (R65)
Actively checked all 50 categories against `git diff origin/main..HEAD -- '*.ts' '*.tsx'`:

1. Hardcoded secrets/API keys — checked; no real secrets added (fixture token-expiry field is null only).
2. Missing Supabase RLS — checked; no database/schema changes in diff.
3. SQL injection — checked; no raw SQL or dynamic SQL construction added.
4. XSS/unescaped output — checked; no `dangerouslySetInnerHTML`, DOM insertion, or WebView HTML added.
5. IDOR/BOLA — checked; coach tab preserves 403 fallback tests for client access denial.
6. Rate limiting — checked; no auth/payment/API endpoint changes in diff.
7. Weak JWT/auth — checked; no auth token generation/validation changes.
8. Missing runtime validation — checked; recovery bucket param is parsed via Zod fallback.
9. Privilege escalation — checked; no role/permission changes beyond graceful 403 handling.
10. Unverified dependencies — checked; no package or lockfile changes.
11. CORS — checked; no backend/server config changes.
12. Secrets in error messages — checked; new query error logs include context/message, not sample values or secrets.
13. HTTPS enforcement — checked; no network endpoint/config changes.
14. Monolith/layering — checked; selectors remain pure in `recoveryData.ts`, UI stays in card/screen components.
15. Hyper-specific non-reusable code — checked; no blocking issue; some HK-3b-specific cards are expected for feature scope.
16. Avoidance of refactors/dead structure — checked; no mass unrelated refactor; shell placeholder removed after wiring.
17. Fake test coverage — checked; recovery-data tests assert exact values; shell test now asserts real screen mount/deep-link, not only deletion.
18. Environment parity — checked; no localhost/path/env assumptions added.
19. API versioning — checked; no API route changes.
20. Circular dependencies — checked imports in touched diff; no obvious new import cycle found.
21. N+1 queries — checked; no DB loops or per-item query calls added.
22. Missing DB indexes — checked; no migrations/schema queries added.
23. No pagination — checked; no list endpoint changes.
24. Blocking sync operations — checked; no sync filesystem or CPU-heavy request code added.
25. Caching strategy — checked; no cacheable backend query changes; React Query usage preserved.
26. Image/media handling — checked; no image upload/media pipeline changes.
27. Polling instead of realtime — checked; no polling interval added.
28. Race conditions — checked; retry refetch promise now has rejection logging.
29. Payment idempotency — checked; no payment changes.
30. Optimistic UI rollback — checked; no optimistic mutation added.
31. Stale closures — checked; callback/effect dependency arrays in touched recovery code are complete enough for changed logic.
32. Unmount cleanup — checked; animation/listener components have cleanup patterns; no new blocking issue found.
33. Error boundaries — checked; no global boundary work in scope; recovery error states are user-visible.
34. Logging/observability — checked; retry/error paths log context without health sample values.
35. API timeouts — checked; no direct external API calls added.
36. Silent/swallowed failures — checked; R1 refetch float fixed with `.catch(logger.warn)`; no added `silent` wording, empty catch, or `.catch(()=>undefined)` found.
37. Health checks — checked; no backend service changes.
38. Comments everywhere/outdated comments — checked; one R0-banned wording comment is a finding above.
39. Textbook-pattern overengineering — checked; FreshnessChip split is justified by hook/provider boundary.
40. Repeated bugs — checked; midnight-wrap bug fixed in one shared selector and covered by tests.
41. Reimplementing library behavior — checked; circular spread is small domain logic with unit tests; no blocker.
42. Phantom edge-case overengineering — checked; no blocking overengineering found.
43. Dead code/orphaned modules — checked; removed placeholder surface; lint has no unused-import errors.
44. Missing DB transactions — checked; no multi-table writes added.
45. Missing soft deletes — checked; no destructive delete paths added.
46. Missing DB-layer validation — checked; no schema/migration changes.
47. Backup/recovery — checked; no infrastructure/storage changes.
48. CI/CD pipeline — checked via required local gates; no CI config changes.
49. Environment-specific code in production — checked; test fixtures/mocks stay in tests; no demo adapter added to production.
50. Graceful degradation — checked; recovery error/empty/cached-data stale surfaces are visible and non-spinner-only.

R1 verification notes: the seven R1 functional fixes were verified as resolved (0 TypeScript errors; shell mounts `SleepRecoveryScreen`; FreshnessChip hook split prevents the QueryClient test crash; circular midnight spread is implemented and tested; refetch promises log rejections; `silent` is absent from added diff text; coach Recovery tab follows Fitness). The fixer-flagged HRV chart deviation is correct: `HrvTrendCard` maps to `{ value, label }` and passes `reduceMotion`, matching the real `GlowChartPoint` API and sibling `FitnessTrendCard`. `WearablesShell.test.tsx` still meaningfully covers shell behavior by asserting default Fitness mount, Recovery switch mount, route-param sync, freshness chip rendering, and direct recovery deep-link.

## Mobile Design Intel sweep (visual only)
N/A — code audit.
