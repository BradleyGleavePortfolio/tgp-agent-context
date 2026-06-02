# HK-5b R1 Code Audit — GPT-5.5

**Head SHA verified:** 8c7509eef16f569c197bd64414f7fa9b984c17be
**Worktree:** /tmp/wt-hk5b-audit-r1-code
**Verdict:** NEEDS_R2

## R0 ban scan

Command run from `/tmp/wt-hk5b-audit-r1-code` against added lines only, using the required updated pattern including both `as\s+never\s+as` and `\bas\s+never\b`:

```text

```

No added-line hits. Spinner-only branch scan: `ClientWearableInsightPanel.tsx` has no `ActivityIndicator` import/use; loading renders a labelled skeleton (`accessibilityRole="progressbar"`, `accessibilityLabel="Loading AI insight, ..."`) at lines 173-190.

## P0 findings (blockers)

none

## P1 findings (must-fix before merge)

1. **Client panel drops required provenance: `source_metrics` is never rendered.** The backend/client contract requires non-empty `source_metrics` for a full client insight (`/tmp/gpb-clone/src/wearables/insights/insight-output.schema.ts:84-85`; mobile mirror `src/api/wearableInsightsApi.ts:123-125`), and the audit brief requires at least one source metric be rendered when present. `LoadedPanel` renders only `observation`, `norm_comparison`, `intervention`, and optional CTA (`src/screens/client/wearables/ClientWearableInsightPanel.tsx:306-330`); grep finds `source_metrics` only in tests/fixtures, not in the panel render path. This loses the evidence/provenance that supports the AI insight.

## P2 findings (should-fix)

1. **Confidence badge accessibility omits the calibrated percentage.** The visible chip renders `CONFIDENCE_LABEL[level] · CONFIDENCE_PCT[level]%` (`ClientWearableInsightPanel.tsx:383-385`), but the explicit screen-reader label is only `${CONFIDENCE_LABEL[level]} confidence` (`ClientWearableInsightPanel.tsx:379-381`). Because the label can override child text for assistive tech, VoiceOver/TalkBack users may not hear the 50/70/85/95/100% calibration.

2. **CTA production navigation is not directly tested.** The required CTA test should mock/assert `Linking.openURL(deep_link)`, but the current test exercises a test-only `onCtaPress` prop instead (`ClientWearableInsightPanel.test.tsx:149-168`). That proves the wrapper callback receives a deep link, but it does not prove the production branch calls `Linking.openURL` with the exact URL or handles its promise path.

3. **CTA stays disabled forever after a successful open.** `onCta` sets `ctaOpening` to true before opening (`ClientWearableInsightPanel.tsx:152`), resets it only in the `.catch` path (`ClientWearableInsightPanel.tsx:160-168`), and intentionally latches disabled for the lifetime of the card per comment (`ClientWearableInsightPanel.tsx:129-130`). If the app remains mounted or the user returns after a successful deep-link open, the CTA is permanently disabled.

4. **Targeted Jest gate passes but is not clean.** The mandated `npx jest --testPathPattern='src/screens/client/wearables' --no-coverage` run exits 0 with 17/17 suites and 124/124 tests passing, but it emits React `act(...)` / Reanimated Worklets warnings and `Jest did not exit one second after the test run has completed.` This is likely test-harness debt in the broader wearable path, but it should be cleaned so the HK-5b gate remains deterministic and warning-free.

## P3 findings (nits)

1. **Existing `as never` cast remains in a touched file.** The added-line R0 scan is clean, but `src/screens/client/wearables/WearablesShell.tsx:72` still contains `navigation.setParams({ bucket: paramForBucket(next) } as never);` from the base file. Since HK-5b touches the same file, R2 may consider replacing this with a typed navigation param helper, but it is not an added-line blocker for this PR.

2. **Unsupported-bucket slot absence is effectively untested because the current bucket union has only two values.** `WEARABLE_METRIC_BUCKETS` is only `HEALTH_FITNESS | SLEEP_RECOVERY`, and the shell renders the panel for both. The brief asked for a “slot absent when bucket is not supported” test; this is N/A today, but adding a third bucket later will need an explicit guard/test.

## 50-Failures sweep

| # | Pattern | Result | Evidence |
|---|---|---|---|
| 1 | Hardcoded secrets/API keys | PASS | No secrets/tokens introduced in the 4-file diff. |
| 2 | Missing RLS | N/A | No database/table changes. |
| 3 | SQL injection | N/A | No SQL or query construction. |
| 4 | XSS / unescaped output | PASS | RN text rendering only; no HTML/WebView/dangerous render. |
| 5 | IDOR / object auth | PASS | Client call uses authenticated `/v1/wearables/insights/client` without clientId; no coach-only identifier exposed. |
| 6 | Missing rate limits | N/A | No backend endpoint changes. |
| 7 | Weak JWT/auth config | N/A | No auth/token config changes. |
| 8 | Missing runtime validation | PASS | Shared mobile API parses client responses with strict Zod union (`ClientInsightResponseSchema.parse`). |
| 9 | Privilege escalation paths | PASS | Client panel is read-only; no approve/edit/reject/mutation hooks in client files. |
| 10 | Unverified dependencies | PASS | No dependency additions. |
| 11 | CORS | N/A | No web/API server config changes. |
| 12 | Secrets/internal details in errors | PASS | Panel sanitizes Zod/Axios/errors before rendering (`sanitizeWearableError`). |
| 13 | HTTPS enforcement | N/A | No transport/config changes. |
| 14 | Layering/monolith | PASS | Fetching stays in hook/API layer; panel consumes query hook. |
| 15 | Over-specific non-reusable code | PASS | Some local UI duplication with coach panel is documented as deliberate scope containment. |
| 16 | Avoidance of refactors | PASS | No large cross-cutting refactor needed for this small read-only panel. |
| 17 | Fake test coverage | FAIL | CTA production `Linking.openURL` branch is not directly asserted; tests use `onCtaPress` test hook. |
| 18 | Environment parity | PASS | No environment-specific URLs/paths added. |
| 19 | Missing API versioning | PASS | Client endpoint uses `/v1/wearables/insights/client`. |
| 20 | Circular dependencies | PASS | Imports are one-way from screen to shared hooks/API/theme. |
| 21 | N+1 queries | N/A | No backend/database loops. |
| 22 | Missing DB indexes | N/A | No schema/query changes. |
| 23 | No pagination | N/A | Single insight fetch, no list endpoint. |
| 24 | Blocking sync operations | PASS | No blocking filesystem/CPU work. |
| 25 | No caching strategy | PASS | Hook uses 6h `staleTime`, matching insight cache expectations. |
| 26 | Unoptimized media | N/A | No media/image handling. |
| 27 | Polling instead of realtime | PASS | No polling interval added. |
| 28 | Race conditions | PASS | CTA double-tap guarded by `ctaOpening`; see P2 for over-latching UX. |
| 29 | Missing idempotency payments | N/A | No payment flow. |
| 30 | Optimistic UI no rollback | N/A | No optimistic mutation. |
| 31 | Stale closures / unsafe assertions | PASS | Hook dependencies are present in HK-5b component; no added unsafe casts in R0 scan. |
| 32 | No cleanup on unmount | PASS | Skeleton animation stops in effect cleanup. |
| 33 | No error boundary | PASS | Component has explicit error UI for query failure; app-level boundaries out of scope. |
| 34 | No logging/observability | PASS | Unsafe deep link and failed `openURL` paths log breadcrumbs. |
| 35 | Missing API timeout | N/A | No new external service call implementation; API client pre-existing. |
| 36 | Swallowed errors | PASS | `openURL` rejection is caught and logged; query errors render retry copy. |
| 37 | Health checks | N/A | No backend service. |
| 38 | Comments everywhere | PASS | Heavy comments are mostly rationale/audit context rather than line-by-line paraphrase. |
| 39 | Textbook over-patterning | PASS | Straightforward component/hook composition. |
| 40 | Duplicate bugs | PASS | Confidence mappings reused from shared API; no duplicate constants in panel. |
| 41 | Reimplementing libraries | PASS | Uses React Query/Zod/Linking; no custom parser/security primitive. |
| 42 | Over-engineering impossible edges | PASS | Defensive deep-link revalidation is appropriate defense-in-depth. |
| 43 | Dead code/orphan modules | PASS | ESLint passed; new panel is imported by shell and tests. |
| 44 | Missing DB transactions | N/A | No write path. |
| 45 | Missing soft deletes | N/A | No delete path. |
| 46 | Missing DB constraints | N/A | No DB schema. |
| 47 | Backup/recovery | N/A | No infra change. |
| 48 | No CI/CD | PASS | Local mandated gates run; no CI config touched. |
| 49 | Dev/mock code in prod bundle | PASS | `onCtaPress` is test-only but exported as an optional prop on production component; see P2 coverage note, not a runtime mock adapter. |
| 50 | No graceful degradation | PASS | Loading, empty, error, unsafe-link, and failed-link states all degrade with copy/logging/retry/no-op. |

## Mobile Design Intel sweep

| Section | Result | Evidence |
|---|---|---|
| 1.1 Real edge: felt experience | PASS | Panel uses calm copy, skeleton loading, neutral confidence, and bucket tone. |
| 1.2 Norman layers | PASS | Visceral: card/tone; behavioral: retry/CTA; reflective: insight framed as guidance. |
| 2.1 Duolingo emotional feedback | N/A | No completion/reward loop in this read-only panel. |
| 2.2 Phantom CALM high-friction design | PASS | Empty/error copy avoids blame and gives clear next action/retry. |
| 2.3 Revolut trust/polish | PASS | Uses neutral confidence and restrained visual hierarchy instead of alarming colors. |
| 3.1 PBL fallacy | N/A | No points/badges/leaderboards. |
| 3.2 Strava micro-competition | N/A | No competition mechanic. |
| 3.3 S-curve gamification overload | PASS | No extra gamification mechanics added. |
| 3.4 Streak trap | N/A | No streak mechanic. |
| 3.5 Variable rewards | N/A | No reward mechanic. |
| 3.6 Apple Watch rings | N/A | No progress-ring change in HK-5b. |
| 3.7 Competence feedback | PASS | Insight content can support competence through observation/norm/intervention; source metric omission weakens trust, see P1. |
| 4.1 Simplicity/invisible complexity | PASS | One compact read-only card; no coach review controls on client side. |
| 4.2 Cognitive load audit | PASS | Loaded state has one primary CTA max and three labelled content chunks. |
| 4.3 Miller’s Law | PASS | Actionable elements in the card are 0-1 in normal loaded state. |
| 4.4 Hick’s Law | PASS | No competing approve/edit/reject choices; optional CTA is the only action. |
| 4.5 Progressive disclosure | PASS | Loading skeleton mirrors final layout; no spinner-only state. |
| 4.6 Anticipatory UX | N/A | No predictive/personalization routing in this PR. |
| 4.7 Consistency | PASS | Reuses existing bucket tone tokens and HK-5a confidence mappings. |
| 4.8 80/20 feature principle | PASS | Client receives only observation/norm/intervention/CTA, not coach review surface. |
| 5.1 Screen design protocol | PASS | Primary path is reading the insight; CTA is secondary and optional. |
| 5.2 Onboarding flow | N/A | Not onboarding. |
| 5.3 Gamification selection | N/A | Not gamification. |
| 5.4 Domain-specific implementation | PASS | Health/trust context handled with calm copy and no green-for-good confidence. |
| 5.5 Anti-patterns | PASS | Avoids feature dump, inconsistent interactions, and spinner-only/blank states. |
| 6.1 Feeling is function | PASS | Error/empty/loading states are user-facing and reassuring. |
| 6.2 Master checklist | FAIL | Touch target is >=44pt, loading/empty/error are informative, CTA/container/badge labels exist; however badge label omits percentage (P2) and provenance/source metrics are missing (P1). |
| 7.1 Outcomes over opens | PASS | CTA deep-link can route to the next health action rather than prolonging panel engagement. |
| 7.2 Invisible interface | PASS | Query/loading/errors are absorbed into simple states. |
| 7.3 Cognitive de-load | PASS | Three labelled sections reduce interpretation burden. |
| 7.4 Fogg behavior model | PASS | Optional CTA keeps the next action one tap away. |
| 7.5 Strava principle | PASS | Intervention text aims to support off-app health behavior. |
| 7.6 Vanity metric trap | PASS | No engagement metric/gamification theater added. |
| 7.7 Invisible app architecture | PASS | Read-only card is a summary/closure layer; no required interaction. |
| 7.8 Outcome-first manifesto | PASS | Client sees concrete intervention, not a chat/review tool. |

Additional mobile-specific checks:
- CTA touch target: PASS — `minHeight: 44` at `ClientWearableInsightPanel.tsx:503-512`.
- Retry touch target: PASS — `minHeight: 44` at `ClientWearableInsightPanel.tsx:520-528`.
- Loading/empty/error copy: PASS — labelled skeleton, literal empty copy, sanitized error + Retry.
- Text truncation: PASS — section values do not set `numberOfLines`, so 280-char fields can wrap.
- Color contrast: PASS/Pending visual QA — confidence uses neutral charcoal text on low-alpha accent fill; no raw green success semantics.
- Screen reader: PASS/P2 — root and CTA labels exist; confidence label exists but should include percent.

## Gate results

- tsc: PASS — command `npx tsc --noEmit 2>&1 | tail -30`; re-run with status evidence:

```text
tsc_exit:0
```

- eslint: PASS — command `npx eslint 'src/screens/client/wearables/**/*.{ts,tsx}' 2>&1 | tail -30`; re-run with status evidence:

```text
eslint_exit:0
```

- jest: PASS with warnings — command `npx jest --testPathPattern='src/screens/client/wearables' --no-coverage 2>&1 | tail -50`; status evidence:

```text
PASS src/screens/client/wearables/__tests__/recoveryTheme.test.ts
PASS src/screens/client/wearables/__tests__/seriesSummary.test.ts
PASS src/screens/client/wearables/__tests__/wearablesTheme.test.ts
PASS src/screens/client/wearables/charts/__tests__/smoothPath.test.ts

Test Suites: 17 passed, 17 total
Tests:       124 passed, 124 total
Snapshots:   0 total
Time:        6.894 s, estimated 37 s
Ran all test suites matching /src\/screens\/client\/wearables/i.
Jest did not exit one second after the test run has completed.

'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
jest_exit:0
```

The retained tail also showed React `act(...)` / Reanimated Worklets warnings from existing wearable components during this targeted path.

## Recommended R2 fixer instructions

1. In `src/screens/client/wearables/ClientWearableInsightPanel.tsx`, render provenance from `insight.source_metrics` in `LoadedPanel` after the three content sections and before the CTA. Minimum acceptable implementation: show a labelled row such as `Source metrics` with the first metric (or first 2-3 metrics plus `+N more`), keep it non-actionable, wrap text, and add an accessibility label. Add tests that assert at least one source metric appears for a loaded full insight.

2. In `ConfidenceChip` (`ClientWearableInsightPanel.tsx:373-386`), change the accessibility label to include the same percentage as the visible text, e.g. `Confidence: ${CONFIDENCE_LABEL[level]}, ${CONFIDENCE_PCT[level]} percent`. Update the accessibility test to assert the full label.

3. Replace or supplement the `onCtaPress`-only CTA tests with a production-path test that mocks `Linking.openURL`, presses `client-insight-cta`, and asserts it was called once with the exact `tgp://...` deep link. Keep the unsafe-link rejection test, but assert `Linking.openURL` is not called.

4. Revisit the CTA latch. Prefer resetting `ctaOpening` in a `.finally(...)` after `Linking.openURL`, or using a short in-flight guard/ref that prevents double-taps without permanently disabling the CTA after success. Add a test for the resolved-promise path.

5. Investigate and clean the targeted Jest warnings/open handle. Start with the `CalmSlowReveal.tsx` `progress.setValue(1)` act warning shown in the gate tail, plus Reanimated Worklets cleanup warnings. The required wearable-client gate should finish without `Jest did not exit one second...`.
