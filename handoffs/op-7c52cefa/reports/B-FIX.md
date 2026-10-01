# B-FIX lane report

## Mobile #310 (clinic onboarding + D2 two-box consent), fix round 4

- PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310
- Branch: `agent/clinic/c05-mobile/95a5bd59`
- Start head: `c9fc931ddcbe58a20d3efe7aacf184a7bb448f23` (Sol RC, Opus RC)
- Final head: `1d7cc72058fdff5e95faa6db751299e203ea6d28`
  - `8615504`: merge of origin/main `c4963f8` (#316, #318). I tried a rebase first, but it conflicted because the branch history already contains merge-of-main commits, so I aborted it and merged instead. No force push. package.json and the lock file are unchanged against main.
  - `1d7cc72`: fix round 4.
- PR body: tier header updated (still T4), new "Fix round 4" table (finding -> change -> commit -> test), Tests run, Open risks.

### Per-finding disposition

| Finding | Disposition | Test |
|---|---|---|
| B-310-3 (Sol, Opus): a newer unticked choice loses to an in-flight grant or a slow GET | Fixed. The client's latest explicit choice (`aiWant`, kept in the encrypted draft) wins. Ledger requests are serialized, and each step decides at run time what to send. A choice is cleared only once the server has said the same on this load. | consultationPrivacy B-310-3 (4 cases), plus the rewritten late-GET and held-grant tests |
| B-310-4 (Sol): a shutdown between the server's completion and the reveal finish bypasses the tutorial | Fixed in `TutorialHost`. When the flag is on and the tour is `not_started`, it reads `GET /me/onboarding`; if that says `completed: true`, the tour starts. A paused or completed tour never restarts. | new `src/__tests__/rootNavigatorConsultationColdBoot.test.tsx` (real RootNavigator and real TutorialHost, 7 cases; 4 of them fail on c9fc931) |
| C-310-6 (Opus): no notice when a grant is abandoned | Fixed: `AI_GRANT_NOTICE`. 404 and 503 stay silent, as D2 requires. | C-310-6 (3 cases) |
| C-310-7 (Opus): box 2 can be tapped before its state is known | Fixed. Box 2 is disabled and busy until the GET settles or 3 s pass. Box 1 is never held up. | C-310-7 (3 cases) |
| Self-found: a hand-off retry could go out under another user's session | Fixed. A stop check now runs before every attempt, the retry included. | hand-off (3 cases; the other-user case failed before the fix), `aiConsentRetry.test.ts` |
| Owner rule 13:34: no generic errors | Done for the #310 screens: the consultation problem screens (unknown errors now show a reference, a support path and go to Sentry; a save that gets an HTTP status is no longer shown as a network problem), Roman and AI settings (offline, 429, 409 AI_CONSENT_CONFLICT, 5xx with a reference, ledger off) and the Privacy Policy link. TrustCenter and DeleteAccount error copy is left to #313, which owns those screens. | ConsultationFlow, RomanAiConsentScreen and correlation tests |
| PR-added `as unknown as` test casts (3) | Removed | tsc |

Earlier B-310-1/2 and C-310-1..5 were already closed. No open A or B finding is left that I know of.

### Commands (all via ops/heavy.sh, at 1d7cc72)

- `npx jest --maxWorkers=1 src/screens/consultation src/lib/consultation src/screens/settings src/api src/__tests__/rootNavigatorConsultationComplete.test.tsx src/__tests__/rootNavigatorConsultationColdBoot.test.tsx src/tutorial src/components/tutorial src/__tests__/quietLuxuryDoctrine.test.ts src/utils/__tests__`: 56 suites, 958 tests, all pass. Log: /tmp/bfix_310_jest_r4.txt
- `npx jest --maxWorkers=1 src/__tests__/rootNavigatorConsultationColdBoot.test.tsx` against the c9fc931 TutorialHost: 4 of 7 fail, as expected.
- `npx tsc --noEmit -p tsconfig.json`: exit 0
- `npx eslint` on the 21 changed .ts/.tsx files: 0 errors, 0 warnings
- `git diff --check`: clean

### CI at 1d7cc72

- Analyze (actions): pass. Analyze (javascript-typescript): pass. CodeQL: pass.
- Typecheck, lint, test: queued or pending at the time of writing (see the update below).

### Open risks

- No device or VoiceOver run.
- The B-310-4 recovery needs the network at the moment the client app mounts. If the phone is offline then, the tour starts on a later launch.
- Dunning (402/403) on `/me/ai-consent` has no specific copy yet; it falls to the server-problem copy with a reference.
- TrustCenterScreen error copy (export, deletion, help centre) is still generic. #313 touches the same file, so it is fixed there to avoid conflicts.

#### #310 CI update
All required checks pass at `1d7cc72`: Typecheck, lint, test (2m35s); Analyze (javascript-typescript); Analyze (actions); CodeQL.

## Backend #608 + mobile #313 (deletion, App Review 5.1.1(v))

- #608: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608, branch `agent/clinic/deletion-be/7c1d2e9a`
  - Start head `b0beb076`. I rebased it onto main twice: first `be667142`, then `10dff85c` after #622, #597 and #625 merged mid-round. Each time I force-pushed with lease to the PR branch only.
  - Final head `117596803ecf48e424f9d4a9cefc47b7bcc71f78`. Commits: the fix round, the CodeQL follow-up (owner-only file modes), and the #622 ledger as a manifest entry now that it is in the schema. No package or lock changes. No migration.
- #313: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/313, branch `agent/clinic/deletion-mob/7c1d2e9c`
  - Start head `1101630`. I rebased it onto main `c4963f8` and force-pushed with lease.
  - Final head `4c6028d580d537a97af917d9515a8439140d652f`. No package or lock changes.
- Both PR bodies have their tier header updated (still T4) and a new fix-round table (finding -> change -> commit -> test).

### Per-finding disposition

| Finding | Disposition |
|---|---|
| B-608-9: the #622 ledger `AiProcessingConsentEvent` was not erased | Fixed. #622 merged during the round, so it is now a manifest delete entry, which the schema-coverage and seeded specs check. Before that it was an optional raw table. The fix uses with DELETE only and no policy or trigger change (#622's service_role policy allows DELETE; UPDATE is still rejected). The older `AiProcessingConsent` name is kept. Test: a ledger with rows for A and B keeps only B's row; one DELETE statement, no UPDATE; no-op when the table is absent. |
| B-608-10 / B-313-5: after the identity is removed, the person's own token got a 401 | Fixed on both sides. Backend: the tombstone keeps `deleted-r1:<sha256>`, not the raw id, for 30 days. The guard answers 403 `ACCOUNT_DELETED` for it, and other unknown subjects get 401 `USER_NOT_FOUND`. New public, throttled `POST /account-deletion/receipt` accepts a token that expired up to 30 days ago (signature, issuer and audience still checked) and answers only `deleted` or 404. The cron drops receipts after 30 days. Mobile: when the refresh fails, the app asks for the receipt before signing out, and shows "Your account is deleted" only when the server says `deleted`. Tests: backend runs the real finalizer and `removeAuthIdentity`, then the real guard and receipt controller; mobile adds 4 api.refresh cases. |
| B-608-3 remainder: an export running at finalization could still write its archive | Fixed. Deletion removes the planned archive path of every export. The worker records READY only on a still-RUNNING row and otherwise deletes its own file, including on a failure after the write. A nightly sweep removes orphan archives older than an hour. Archives are now written 0600. Test: an upload paused across finalization leaves no file. |
| A-608-3, B-608-8 (Opus) | Already closed at b0beb076. I re-ran the suites at the head. |
| C-608-1, -3, -4, -5, -6 | Closed in round 2, unchanged. |
| C-608-2: admin force-delete without recent-auth | Still open. It needs an operator decision. |
| C-313-2, -3, -4, -6 | Fixed: coach `requested` is no longer shown as scheduled, the kept-records copy changed, the hardcoded 14-day line is gone, and an ended session is no longer shown as a wrong password. |
| C-313-5 (Apple-only on Android), C-313-1 partial | Not changed. The unknown-error copy now gives the support address. |
| Owner rule 13:34 | Done. Backend: each new error has a `code` and a message. Mobile: `screens/settings/deletionErrors.ts` gives specific copy for network, 429, an ended session, an expired identity check, and 409. Anything else gets a reference, the support address and a Sentry report. Used on the DeleteAccount, TrustCenter and coach Settings screens. |
| CodeQL (2 new high, js/insecure-temporary-file) | Fixed in dc9e6a9. |

### Commands (via ops/heavy.sh)
- Backend, at ef74b75: `npx jest --runInBand --ci test/account-deletion test/auth-recent-auth-google-session.spec.ts test/auth-recent-auth-token.spec.ts test/recent-auth.guard.spec.ts test/auth-guard-deletion-lockout.spec.ts test/drip-dispatcher.cron.spec.ts test/bloodwork.service.spec.ts test/ci/delivery-artifact.spec.ts test/roles-enforced.spec.ts test/data-export.service.spec.ts`: 17 suites, 292 tests, all pass.
- Backend, at dc9e6a9: fence, data-export and storage suites 25/25; `tsc` exit 0; `eslint` 0 problems.
- Backend, at 1175968 (after the rebase on 10dff85c): the same 17-suite command gives 293/293; `eslint` 0. Local `tsc` ran out of memory (exit 134) in the sandbox, so the type check at this head is CI build-and-test, which passed.

### CI at final heads
- #608 @ 1175968: every check passes, including build-and-test, CodeQL, Schema parity, rls-live-tests, mwb-3-live-tests and danger. The one exception is `shellcheck (scripts/*.sh)`, which also fails on main. deploy-readiness-gate was skipped.
- #313 @ 4c6028d: Typecheck, lint, test; Analyze (js-ts); Analyze (actions); CodeQL all pass.
- #320 @ 1d16c10: all 4 checks pass.
- Mobile, at 4c6028d: `npx jest --maxWorkers=1 src/screens/settings src/services/__tests__/api.refresh.test.ts src/services/__tests__/deletionApi.test.ts src/utils/__tests__/appleAuth.test.ts src/utils/__tests__/googleReauth.test.ts src/screens/coach src/screens/__tests__`: 37 suites, 383 tests, all pass. `tsc` exit 0; `eslint` (8 files) 0 problems; `git diff --check` clean.

### Open risks
- No device run. No live check of Supabase `deleteUser` followed by the guard.
- The receipt keeps a salted hash of the removed auth id for 30 days. After that, a person who opens the app sees the normal sign-in without the completion notice.
- The receipt endpoint accepts signed tokens up to 30 days past expiry, for this yes/no answer only.
- #313's notice needs #608 deployed first. Against an older backend the person is signed out without the notice.
- `shellcheck (scripts/*.sh)` fails on main too (be667142 and 8a709a68), so it is not caused by this PR.

## Operator item 14:00: onboarding flag (new mobile PR #320, T2)

- PR: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/320, branch `agent/bfix/onboarding-completed-field`, head `1d16c105d4be43d9eedbe544b8b0422df54fa586`, base main c4963f8. CI is green: all 4 checks pass.
- Verdict: it was broken.
  - Backend main `be667142` returns the profile row as stored. Both GET /auth/me (`include: { profile: true }`) and GET /profile (`findUnique`) send `onboardingCompleted`, never `onboarding_completed`.
  - PUT /profile does accept `onboarding_completed` (profile.dto.ts:281) and maps it to `onboardingCompleted` (profile.service.ts:329, #606). In production it is stored only once #625 adds the column.
  - The app read only `onboarding_completed` (LoginScreen:110, RootNavigator:666 and :691). On a fresh install or a new login, a student who had finished onboarding was sent through it again.
- Fix: `src/lib/profileOnboarding.ts` (`BACKEND_ONBOARDING_FIELD = 'onboardingCompleted'`, which also accepts the old key), used at the three read sites. Not done in #310, because #310 does not own the lean or Day-1 flow.
- Test: `src/__tests__/rootNavigatorOnboardingField.test.tsx` renders the real RootNavigator and pins the field name. The fresh-install case fails on the old code (1 failed, 3 passed) and passes after the fix. The wider suite (24 suites, 169 tests) passes; `tsc` exit 0.
- Risk: the backend has no `day_one_completed` field either. The Day-1 gate relies on the local flag or the legacy flag this PR fixes.
