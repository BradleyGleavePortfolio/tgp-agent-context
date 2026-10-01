# S-ERRORS report (builder: Claude Opus 5.5, operator agent 109)

Status at 2026-10-01 ~16:55 PDT: the operator's 19:10 wrap-up order limited this lane to its smallest complete slice. That slice is one SUPPORT_EMAIL per repo, with guard tests, plus the inventory. Bases: backend main `53b625d2`, mobile main `56d4fc62`.

## Slice 1 delivered: one support email (owner ruling 14:19, Bradleyapple1031@gmail.com)

| Repo | PR | Head | Tier | State |
|---|---|---|---|---|
| growth-project-mobile | [#324](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/324) | `7f20255d681f6714a25fb9a97381d037dc84934f` | T2 | open against main; CI all green (Typecheck/lint/test, Analyze js-ts, Analyze actions, CodeQL); needs one independent audit |
| growth-project-backend | [#631](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/631) | `ac83aa7356cfc56845f85152ec4f0375c557409d` | T2 | open against main; every required check green (danger, npm audit, banned casts, build-sbom, rls-floor-guard, rls-live-tests, mwb-3-live-tests, CodeQL) except build-and-test, which was still running at hand-off; needs one independent audit |

PR bodies: `ops/reports/S-ERRORS-mobile-support-email.prbody.md`, `ops/reports/S-ERRORS-backend-support-email.prbody.md`.

What changed:
- Mobile: new `src/constants/support.ts` (`SUPPORT_EMAIL`, `supportMailto`). SupportInboxScreen's local `hello@thegrowthproject.app` is replaced, and so is the CreateAccount "Request access" mailto. Every "Contact support" button already routes to SupportInbox, and WelcomeScreen has had no mailto since #306. New guard: `src/constants/__tests__/supportEmail.guard.test.ts`.
- Backend: trust-pages `SUPPORT_EMAIL` changes from `Bradley@Bradleytgpcoaching.com` to the new address. public-pages drops its second constant `hello@trygrowthproject.com` and imports the single one. README and deploy-runbook references are updated. New guard: `test/support-email.guard.spec.ts`.
- Both guards fail the build in these cases:
  - any other email address in shipped source, unless it is on a reserved RFC 2606/6761 domain or in a reasoned allowlist;
  - any retired address;
  - a stale allowlist entry;
  - (backend) a rendered public-page mailto that is not SUPPORT_EMAIL;
  - (mobile) any mailto that does not target SUPPORT_EMAIL.
  
  Each guard has a negative control.

Tests run (all through heavy.sh):
- Backend: `npx jest --runInBand test/support-email.guard.spec.ts test/trust-pages.spec.ts test/help-pages.spec.ts test/public-pages.spec.ts` passed: 4 suites, 50 tests. `prisma generate && tsc --noEmit -p tsconfig.json` exit 0.
- Mobile: `npx jest --runInBand src/constants/__tests__/supportEmail.guard.test.ts src/screens/support/__tests__/SupportInboxUnavailable.test.tsx src/screens/auth/__tests__/CreateAccountScreen.test.tsx` passed: 3 suites, 82 tests. `tsc --noEmit -p tsconfig.json` exit 0.
- eslint on changed files: 0 errors. The warnings were already on main (CreateAccountScreen:441 escapes, an unused ActivityIndicator in SupportInboxScreen). Prettier was applied to new files only, because existing files are not prettier-clean at base.

Overlap and coordination:
- `git merge-tree` is clean against backend #611, #610 and #630, and against mobile #314 and #315. Mobile #313 conflicts with main already, without this PR (appleAuth.test.ts).
- #611 adds `ACCOUNT_DELETION_EMAIL = 'Bradleyapple1031@gmail.com'`. Recommended: alias it to `SUPPORT_EMAIL` on rebase. #611's privacy "Deleting your account" section uses `${SUPPORT_EMAIL}`, so it now resolves to the owner's address.
- To avoid conflicting with #611's new top-of-file import, the import in public-pages.html.ts sits where the old local constant was.
- DECISION NEEDED: backend #610 and mobile #314 name `Bradley@Bradleytgpcoaching.com` as the community safety contact. That address was owner-approved at 09:07; the "one support email" ruling came at 14:19. Both PRs will fail the new guards on rebase unless they use SUPPORT_EMAIL or add a reasoned allowlist entry. Recommended default: SUPPORT_EMAIL, one inbox.

## Inventory (step 1 of the lane)

Counter: `ops/reports/S-ERRORS-inventory.py`. Raw output: `S-ERRORS-inventory-before.json` (main), `S-ERRORS-inventory-after-support-email.json`. Counts are (occurrences, files). Mobile scans 735 non-test src files (.ts/.tsx/.json). M1, M3 and M7 also match a few code comments, so treat those counts as upper bounds.

| ID | Category | Before (main) | After slice 1 |
|---|---|---|---|
| M1 | Banned phrase in a string: "Something went wrong", "An error occurred", "Unknown error", "Unexpected error", "Oops" (ErrorBoundary, CreditPackCheckout, 5 cross-pillar helpers, BlockedUsers, ContactView, communityEventsApi, AIGatewayDisabledState, `types/common.errorMessage` default, 'Unknown error' fallbacks in CoachWorkoutBuilder/CoachMealTemplates/CoachBulkInvite) | 33 / 20 | 33 / 20 |
| M2 | `Alert.alert('Error' \| 'Oops' \| 'Failed', ...)` titles | 9 / 7 | 9 / 7 |
| M3 | "try again later" with no reason (CoachConnect, Settings help, TrustCenter x3, PackageSelectionSheet, ...) | 9 / 6 | 9 / 6 |
| M4 | `errorMessage(err, 'Please try again.')`-style generic fallbacks | 36 / 16 | 36 / 16 |
| M5 | Raw error text shown (`x instanceof Error ? x.message : ...`; axios gives "Request failed with status code 500") | 18 / 14 | 18 / 14 |
| M6 | `errorMessage()` call sites (shows the raw backend message; default fallback "Something went wrong") | 88 / 42 | 88 / 42 |
| M7 | "Please try again" / "Try again" occurrences (each needs a reason or working action next to it) | 312 / 125 | 312 / 125 |
| M8 | Support address literals other than SUPPORT_EMAIL | 2 / 2 | **0 / 0** |
| B1 | HttpException constructions in backend src | 1180 / 236 | 1180 / 236 |
| B2 | ... with an explicit machine code in the body (heuristic) | 424 | 424 |
| B3 | ... without an explicit code (filter must derive one) | 756 / 164 | 756 / 164 |
| B4 | Unknown 500 body without a code ("Internal server error", no INTERNAL_ERROR) | 1 | 1 |
| B5 | 429 body without code / request_id (ThrottlerExceptionFilter) | 1 | 1 |
| B6 | ValidationPipe instances emitting no code (global main.ts + checkout.controller) | 2 | 2 |
| B7 | Distinct backend SUPPORT_EMAIL values | 2 (`Bradley@Bradleytgpcoaching.com`, `hello@trygrowthproject.com`) | **1** (`Bradleyapple1031@gmail.com`) |

Backend error shape today (main `53b625d2`):
- HttpExceptionFilter emits `{ statusCode, code?, message (string or string[]), error (reason phrase or the handler's code), timestamp, path, request_id? }`.
- The machine code sits in `code` for some handlers and in `error` for others. Mobile reads both: `authErrorDetail.safeCode` reads code, then error; `types/common.errorCode` reads error only.
- The 429 body has its own shape. The importer OpenAPI contract (`docs/contracts/importer-openapi.json`, test/contracts/importer-contract.spec.ts) pins the ErrorEnvelope keys and describes `code` as "absent for generic validation/guard errors". Making `code` always present therefore needs a regenerated contract description.

## Remaining queue (NOT started, per the wrap-up order)

1. **Backend error envelope (T3, cross-cutting).**
   - `buildErrorEnvelope` always sets `code`: the handler's code, else the handler's `error` when it is a machine id, else a status-derived code (VALIDATION_FAILED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL_ERROR, SERVICE_UNAVAILABLE).
   - `request_id` is always present (fallback uuid). The unknown-500 message becomes a plain sentence. The 429 body gains `code: RATE_LIMITED` and `request_id`.
   - A ValidationPipe subclass emits VALIDATION_FAILED; its messages already name the field.
   - Keep `error` and the existing codes stable. Update the ErrorEnvelope and RateLimitError DTOs and regenerate the importer contract.
   - Ratchet guard: a per-file baseline of HttpException sites without an explicit code (756/164 today) that can only shrink, with a reason field.
2. **Mobile shared mapper (T3: touches authFailure).**
   - New `src/utils/appError.ts` built on `authErrorDetail`, `failureReference` and `captureError`. Code and status map to specific copy plus an action: retry, log in, reset password, update card, contact coach, or contact support with SUPPORT_EMAIL.
   - Offline and timeout get their own copy. Unknown errors show a short reference and are reported to Sentry, sanitized, once per error object (WeakMap).
   - `types/common.errorMessage` delegates to the mapper, which fixes M6 at once.
   - Output shape `{ title, message, reference, code, status }` matches #314's `describeCommunityFailure`, so #314 can adopt it by passing its BY_CODE table. Note for #314: it currently sends the raw axios error to Sentry.
3. **Mobile string replacement plus guard.** Fix M1-M5 (about 105 sites), and route `catch {}` blocks that show static text through the mapper where the error is available. Map backend #630's codes in RecipesScreen and RecipeDetailScreen: RECIPE_NOT_FOUND (404), RECIPE_SHARING_COACH_ONLY (403), RECIPE_IMAGE_URL_NOT_ALLOWED (400); RecipeDetailScreen:103 shows `Alert('Error', ...)` today. The guard is an AST test over string literals and JSX text for banned phrases and bare "Error"/"Try again", with a reasoned allowlist.
4. Also found: `SupportInboxScreen` swallows a failed `Linking.openURL(mailto)` with `.catch(() => undefined)`. On a device with no mail app the support path fails silently; it should show the address to copy.

## Worktrees
`/home/user/workspace/wt/s-errors-be` and `/home/user/workspace/wt/s-errors-mob` were removed after push. Logs: `/home/user/workspace/wt/s-errors-{be,mob}.*.log`.
