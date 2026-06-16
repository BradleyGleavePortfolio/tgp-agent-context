# Phase 2 Cleanup Plan — POST_MERGE Audit Findings

**Synthesized from:** POST_MERGE audit files for PR400, PR396, PR398, PR397, PR252, PR250, PR249, PR254, PR251, PR253, PR326, PR395/PR402 + BACKFILL_LEDGER_2026-06-14  
**Synthesis date:** 2026-06-16  
**Synthesized by:** Documentation synthesis subagent  
**Method:** Read-only synthesis of existing audit documents — no new intent introduced.

---

## Table of Contents

1. [Context: How Phase 2 Came to Be](#1-context-how-phase-2-came-to-be)
2. [Audit Summary by PR](#2-audit-summary-by-pr)
   - [PR395 / PR402 — First Payment Ledger (Backend)](#pr395--pr402--first-payment-ledger-backend)
   - [PR326 — push-to-existing Endpoint (Backend)](#pr326--push-to-existing-endpoint-backend)
   - [PR396 — Classroom Posts Backend](#pr396--classroom-posts-backend)
   - [PR398 — Coach-Reviewed Backend](#pr398--coach-reviewed-backend)
   - [PR400 — Daily Rings Backend](#pr400--daily-rings-backend)
   - [PR397 — Voice Notes Backend](#pr397--voice-notes-backend)
   - [PR252 — Onboarding Polish (Mobile)](#pr252--onboarding-polish-mobile)
   - [PR250 — Competence Pill (Mobile)](#pr250--competence-pill-mobile)
   - [PR249 — Voice Notes (Mobile)](#pr249--voice-notes-mobile)
   - [PR254 — Three-Arc Router (Mobile)](#pr254--three-arc-router-mobile)
   - [PR251 — Community Search + Wearable Prompts (Mobile)](#pr251--community-search--wearable-prompts-mobile)
   - [PR253 — MWB Undo Button + Command Stack (Mobile)](#pr253--mwb-undo-button--command-stack-mobile)
3. [PRs Not Covered by POST_MERGE Paired Audits](#3-prs-not-covered-by-post_merge-paired-audits)
4. [Fixer Queue from BACKFILL_LEDGER](#4-fixer-queue-from-backfill_ledger)
5. [Open Finding Register](#5-open-finding-register)
   - [P0 Findings](#p0-findings)
   - [P1 Findings](#p1-findings)
   - [P2 Findings](#p2-findings)
   - [P3 Findings](#p3-findings)
6. [Recurring Phase 2 Patterns](#6-recurring-phase-2-patterns)
7. [CLEAN PRs (holding, not yet merged)](#7-clean-prs-holding-not-yet-merged)
8. [Discrepancies Between Paired and Solo Audits](#8-discrepancies-between-paired-and-solo-audits)

---

## 1. Context: How Phase 2 Came to Be

Phase 2 exists because R81 — the rule requiring an independent adversarial audit before any merge — was instituted after PR #326 was merged on 2026-06-14 without such an audit. The operator recognized the gap and declared R81 immediately: "NO MERGES EVER without verbatim audit cycle."

The BACKFILL_LEDGER_2026-06-14 documents this event:

> "Sixteen (16) PRs were merged into `main` on backend and mobile repos under CI-only gates BEFORE R81 existed. Each shipped to `main` without an independent adversarial auditor sweeping it under R72 exhaustive standard. That is the gap. R81 closes it forward; this ledger closes it backward."

The backfill process produced audits for all 16 un-audited historical merges. This Phase 2 cleanup plan synthesizes the findings from those POST_MERGE audits and the BACKFILL_LEDGER to define the fixer work needed before any Phase 2 surface can be considered R81-clean.

**Structural difference from Phase 1:** Phase 2 POST_MERGE audits were produced in two parallel tracks for several PRs: a **paired audit** (two auditors working together) and a **solo audit** (one auditor working independently). Discrepancies between the two tracks are flagged throughout this document and consolidated in Section 8.

---

## 2. Audit Summary by PR

---

### PR395 / PR402 — First Payment Ledger (Backend)

**Original PR #395 verdict (pre-R81):** REVERT_REQUIRED_P0 (transaction escape)  
**Fix PR #402 verdict:** CLEAN_NO_FINDINGS  
**Post-merge re-audit (PR #395 + PR #402 combined):** FOLLOW_UP_REQUIRED — P1: 1

#### Background

PR #395 introduced the first-payment notification ledger (FIRST_PAYMENT kind, coach celebration, once-ever per coach). The original backfill audit found a P0: notification rows escaped the purchase transaction, so rollback + Stripe retry could produce duplicate first-payment notifications. PR #402 was the fix PR; it threaded `tx` through the notification emit path and added rollback/refund/sub-coach tests. PR #402 re-audited as CLEAN_NO_FINDINGS and was merged at commit `fea925a8`.

#### Remaining Finding from POST_MERGE Re-Audit

**N1 (P1) — `FIRST_PAYMENT` push can be lost after rollback + Stripe retry within 60s:**

The PR #402 tx fix correctly moved the `Notification` DB rows onto the ambient transaction. However, the in-process push throttle (`recentPushes` module-level Map in `NotificationsService`) is mutated before the ambient transaction commits.

Repro: A Stripe webhook processes a first payment inside a transaction. `FirstPaymentEmitter` writes in-app and push rows via `createNotification(..., tx)`. Before the DB rows commit, `recentPushes.set('coach_1:first_payment', now)` is called. A downstream step throws, rolling back the transaction. Stripe redelivers within 60 seconds. The ledger insert wins again (P2002 ignored), the in-app row is written via tx, but the push call sees `now - last < 60_000` and returns `null`. Only the in-app notification commits; the push is silently lost.

The PR #402 regression tests do not catch this because both rollback suites advance `Date.now()` by 120 seconds on every read, making the push throttle impossible to hit in tests.

**Feature flag status:** `FEATURE_ROMAN_FIRST_PAYMENT` is default-OFF. Production blast radius is currently gated.

**Required fix:** Do not mutate `recentPushes` for transactional notification writes. Minimal safe patch: in `createNotification()`, skip the in-process push throttle when `tx` is present (first-payment already has a DB-backed exactly-once ledger). Add a regression test without fake time advancement that simulates rollback + immediate redelivery and asserts both `['inapp', 'push']` commit.

---

### PR326 — push-to-existing Endpoint (Backend)

**Original backfill audit verdict:** CHANGES_REQUESTED — P1: 1 · P2: 2 · P3: 1  
**POST_MERGE re-audit verdict:** FOLLOW_UP_REQUIRED — all original findings still present; no new findings

#### Findings (all still present on main)

**F1 (P1) — Dispatcher-claim race: per-drop update is not check-and-set:**  
`pushToExisting()` reads pending drops via `findMany` then updates them via `tx.scheduledDrop.update({ where: { id: drop.id } })`. The WHERE clause does not include `status: 'pending'`. Between the `findMany` and the `update`, the `DripDispatcherCron.claim()` can commit an atomic claim that changes the row's status to `dispatching`. The `update` then overwrites a `dispatching` row's cadence/fire_at/display snapshot fields, corrupting a drop already claimed for delivery.

**F2 (P2) — Missing explicit `@Throttle` on bulk-write endpoint:**  
The `POST :contentId/push-to-existing` controller action has `@Roles`, `@Post`, `@HttpCode` but no `@Throttle`. This endpoint executes up to 10,000 per-row updates inside a transaction and advisory lock; it must have an explicit mutation-specific throttle ceiling.

**F3 (P2) — No Zod `.strict()` response schema:**  
The request body has a `PushToExistingSchema` (strict). The response is a plain TypeScript object with no runtime Zod fence. A future edit could accidentally include internals in the return object.

**F4 (P3) — Bulk push produces only a transient logger line, not a durable audit entry:**  
`PackageContentsService` has no `AuditService` injection. The bulk push operation that rewrites every current buyer's pending drops is logged with `this.logger.log()` but not written to a durable audit log.

**R74 note:** The historical PR #326 merge commit has Author `BradleyGleavePortfolio <bradleyapple1031@gmail.com>` instead of the current R74-required `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Do not rewrite main; enforce R74 on the follow-up cleanup PR.

**R82 note:** No PR #326 / push-to-existing R81-backfill tracking issue was found at time of audit.

---

### PR396 — Classroom Posts Backend

**Original backfill audit verdict:** AUDITED — P2: 4 · P3: 2 (no P0/P1)  
**POST_MERGE re-audit verdict:** FOLLOW_UP_REQUIRED — P2: 5 · P3: 2

#### Findings

**F1 (P2) — Create-time media storage key uses throwaway randomUUID() instead of persisted post id:**  
When a classroom post with media is created, the storage key for the uploaded media asset is derived from a `randomUUID()` called at creation time rather than from the persisted post ID. This means the storage key cannot be reconstructed after the fact, and if the post record is lost or the creation transaction rolls back after the upload but before the post is written, the uploaded media is orphaned with an irrecoverable key.

**F2 (P2) — Media arrays unbounded (no `@ArrayMaxSize`):**  
The DTO for classroom posts accepts media arrays with no `@ArrayMaxSize` validator. A single request could submit an arbitrarily large array of media items, creating unbounded storage and processing load.

**F3 (P2) — Classroom telemetry registered but never emitted:**  
Community telemetry events for classroom post actions are registered in the telemetry registry but no actual `track(...)` emit call exists in the classroom posts service or controller. Registered-but-never-emitted telemetry produces a misleading analytics picture — the registry implies tracking is active, but no events flow.

**F4 (P2) — Read routes (listFeed, getOne) lack explicit throttle despite signing signed download URLs:**  
The `listFeed` and `getOne` routes generate signed download URLs per row on each response. Signing URLs is a non-trivial operation; without an explicit throttle, these endpoints are vulnerable to amplification attacks that force mass URL signing.

**F5 (P2) — No R82 tracking issue:**  
No tracking issue was found for the open classroom posts findings.

**F6 (P3) — Test-only `@ts-expect-error` directives:**  
Test files contain `@ts-expect-error` directives for type casting. These are test-only, but the repo's standard is to use typed stub helpers rather than inline casts in test files.

**F7 (P3) — Re-publish/re-schedule keeps original `published_at` ordering anchor:**  
When a classroom post is re-published after being unpublished, it retains its original `published_at` timestamp as its feed-ordering anchor. This means re-published posts do not appear at the top of the feed for subscribers — they appear at the position corresponding to their original creation time, which may be unexpected UX.

---

### PR398 — Coach-Reviewed Backend

**Original backfill audit verdict:** PASS_WITH_FINDINGS — P2: 3 · P3: 2  
**POST_MERGE re-audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 3 · P3: 2 (same findings confirmed still present)

#### Findings

**F1 (P2) — `POST /coach/clients/:id/check-ins/:id/reviewed` has no `@Throttle`:**  
The coach-reviewed endpoint has no explicit throttle decorator. This is a write endpoint that updates check-in review state; it must have a rate limit.

**F2 (P2) — Raw Prisma `CheckIn` response (no Zod `.strict()`, no `select`):**  
The endpoint returns the raw Prisma `CheckIn` model without a Zod parse fence or field selection. Internal Prisma model fields could leak in the response.

**F3 (P2) — Non-atomic `assertCheckInOfCoach` + `update` pattern (TOCTOU ownership gap):**  
The handler first calls `assertCheckInOfCoach(checkInId, coachId)` (a separate read) and then calls `update(...)` in a separate operation. Between the assertion and the update, another request could transfer or delete the check-in. The correct pattern is to collapse the ownership assertion into the update's WHERE clause: `update({ where: { id: checkInId, coach_id: coachId } })`.

**F4 (P3) — No sub-coach marker attribution test for ConversationReview:**  
When a sub-coach marks a check-in reviewed, the marker should attribute the action to the sub-coach's ID. There is no test verifying this attribution.

**F5 (P3) — No telemetry:**  
No telemetry event is emitted for coach-reviewed actions.

---

### PR400 — Daily Rings Backend

**Original backfill audit verdict:** PASS_WITH_FINDINGS — P2: 5 · P3: 3  
**POST_MERGE re-audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 5 · P3: 3 (confirmed still present)

#### Findings

**F1 (P2) — No explicit throttle on `GET /coach/home/daily-rings`:**  
The daily rings read route has no `@Throttle` decorator. This endpoint returns per-day ring completion state; it must have a rate limit consistent with other coach home read routes.

**F2 (P2) — No Zod `.strict()` response envelope:**  
The daily rings response is not parsed through a Zod `.strict()` schema before being returned. Internal fields could leak.

**F3 (P2) — Missing `(coach_id, coach_reviewed_at)` composite index:**  
The most common query pattern for daily rings filters by `coach_id` and sorts/filters by `coach_reviewed_at`. Without this composite index, the query plans a full-scan or single-column index scan for coach-large datasets.

**F4 (P2) — No R82 tracking issue:**  
No tracking issue was filed for the open daily rings findings.

**F5 (P2) — R74 identity (wrong author email on merge commit):**  
The merge commit author email does not match the current R74 requirement. Do not rewrite history; enforce R74 on the cleanup PR.

**F6 (P3) — Cache Map never pruned:**  
The in-process cache Map for daily rings entries grows unboundedly. A long-running server process with many coaches will accumulate stale entries. The cache needs an eviction policy or TTL-based pruning.

**F7 (P3) — No telemetry register + emit:**  
No telemetry events are registered or emitted for daily rings access or update.

**F8 (P3) — R74 identity:**  
(See F5 above — same R74 concern at P3 level for the process observation, distinct from the merge-commit identity classification.)

---

### PR397 — Voice Notes Backend

**Original backfill audit verdict:** PASS_WITH_FINDINGS — P2: 1 · P3: 1  
**POST_MERGE re-audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 4 · P3: 1

#### Findings

**F1 (P2) — Read routes (list, getOne) unthrottled despite signing download URLs per row:**  
The voice notes list and getOne routes generate signed download URLs for every row in the response. These routes have no explicit `@Throttle` decorator, creating the same amplification risk as PR396's classroom post read routes.

**F2 (P2) — No R82 tracking issue:**  
No tracking issue was filed for the open voice notes backend findings.

**F3 (P2) — R74 identity:**  
The merge commit carries the non-R74-compliant author email.

**F4 (P3) — community-voice.e2e.spec.ts is reflection-only (no supertest/HTTP integration):**  
The end-to-end spec file for community voice notes only reflects/describes expected behavior rather than executing actual HTTP requests through the NestJS test harness. This does not provide the integration coverage its name implies.

---

### PR252 — Onboarding Polish (Mobile)

**Paired audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 2 · P3: 1  
**Solo audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 4 · P3: 2  
**Discrepancy:** Solo found 2 additional P2s and 1 additional P3. See Section 8.

#### Paired Findings

**F1 (P2) — StripeConnectCard / PermanenceMarker components built but NOT wired to any production host:**  
The `StripeConnectCard` and `PermanenceMarker` components were added in this PR but are not wired to any host screen. These components will have no effect until wired. The follow-up wiring PR must be audited specifically for the PR #242 MMKV-gate pattern to ensure `PermanenceMarker` does not re-trigger on app restart.

**F2 (P2) — CTA lacks guaranteed 48dp Android touch target:**  
The CTA button in the onboarding polish flow does not guarantee a 48dp minimum touch target on Android, falling below the Android accessibility bar.

**F3 (P3) — (Paired audit P3):** Polish-level finding noted; detail carried by the solo audit expansion below.

#### Additional Solo Findings

**N1 (P2) — Inactive face not hidden from accessibility tree:**  
The inactive/dimmed face in the onboarding animation is not hidden from the accessibility tree (`accessibilityElementsHidden` / `importantForAccessibility` not set). Screen readers will announce the inactive face as a separate interactive element.

**N2 (P2) — No R82 tracking issue:**  
No R82 tracking issue was filed for the open onboarding polish findings.

**N3 (P3) — R74 merge commit identity mismatch:**  
The merge commit carries a non-R74-compliant author identity.

---

### PR250 — Competence Pill (Mobile)

**Paired audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 2 · P3: 2  
**Solo audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 4 · P3: 4  
**Discrepancy:** Solo found 2 additional P2s and 2 additional P3s. See Section 8.

#### Paired Findings

**F1 (P2) — No flag-off static pin for `romanCompetencePill`:**  
There is no static pin test that asserts the `romanCompetencePill` feature flag defaults off and that the competence pill component is not rendered when the flag is off.

**F2 (P2) — HabitsScreen raw `coach_reviewed_at` cast (no runtime type guard):**  
`HabitsScreen` casts `coach_reviewed_at` directly without a runtime type guard. If the backend returns a non-date or null, the cast produces a runtime error rather than a graceful unavailable state.

**F3/F4 (P3):** Polish-level findings noted; detail expanded in solo findings.

#### Additional Solo Findings

**N1 (P2) — Decorative `RomanAvatar` uses `importantForAccessibility="no"` (not `"no-hide-descendants"`) — Android accessibility leak:**  
The decorative `RomanAvatar` in the competence pill uses `importantForAccessibility="no"`, which on Android does not hide the element's descendants from accessibility services. The correct value is `"no-hide-descendants"` to fully exclude the decorative tree from Android TalkBack.

**N2 (P2) — Malformed `reviewedAt` renders "on undefined NaN" (no `Number.isFinite` guard):**  
When `coach_reviewed_at` is missing, null, or not a valid timestamp, the date display renders "on undefined NaN" instead of a fallback empty state. A `Number.isFinite` guard is required before date formatting.

**N3 (P3) — R74 identity:**  
Merge commit identity mismatch.

**N4 (P3) — No R82 tracking issue:**  
No tracking issue filed.

---

### PR249 — Voice Notes (Mobile)

**Paired audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 2 · P3: 1  
**Solo audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 3 · P3: 2  
**Discrepancy:** Solo found 1 additional P2 (recorder lifecycle) missed by paired. See Section 8.

#### Paired Findings

**F1 (P2) — VoiceNotePlayer toggle is 36×36dp with no `hitSlop`:**  
The play/pause toggle for voice notes is 36×36dp, below the iOS 44dp minimum. No `hitSlop` is present to expand the touch target.

**F2 (P2) — No `CommunityVoiceComposerScreen` dedicated test:**  
The voice composer screen has no dedicated screen-level test covering loading/error states, permission denial, recording abort, and upload failure flows.

**F3 (P3) — No mobile-side telemetry:**  
No mobile telemetry events are emitted for voice note play, record start/stop, upload, or error.

#### Additional Solo Finding

**N1 (P2) — Recorder unmount cleanup only calls `clearTick` — native recorder not cancelled on unmount:**  
When the voice recorder component unmounts (e.g., user navigates away during recording), the cleanup only calls `clearTick` to stop the progress ticker. The native audio recorder is not cancelled. This leaves the native recorder running in the background, holding the microphone permission and potentially producing a file that is never used. This is both a resource leak and a privacy concern (microphone held after UI dismissal).

**N2 (P3) — R74 merge commit identity:**  
Merge commit identity mismatch.

---

### PR254 — Three-Arc Router (Mobile)

**Paired audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 0 · P3: 2  
**Solo audit verdict:** PASS_WITH_FINDINGS, NOT R81-CLEAN — P2: 2 · P3: 2  
**Discrepancy:** Solo escalated severity from P3-only to P2:2 + P3:2. See Section 8.

#### Paired Findings (P3-only)

**F1 (P3) — Stale "Polled on Coach Home focus" docstring:**  
The hook's docstring says it polls on Coach Home focus via `useFocusEffect`, but the hook does not contain `useFocusEffect`. The docstring is stale from a prior implementation.

**F2 (P3) — Hardcoded `accessibilityState={{ busy: false }}` during loading:**  
During the loading state, the three-arc router hardcodes `accessibilityState={{ busy: false }}`. This incorrectly tells screen readers the UI is not busy when it is in a loading state. The correct value during loading is `busy: true`.

#### Additional Solo Findings (P2)

**S1 (P2) — BRIEF arc routes to `SettingsStack → CoachBrief`, which is gated by independent `featureFlags.coachBrief`:**  
The `romanThreeArcRouter` flag controls whether the three-arc routing is active. However, the BRIEF arc routes to `SettingsStack → CoachBrief`, which is controlled by a separate independent `featureFlags.coachBrief` flag. Flipping `romanThreeArcRouter` on while `coachBrief` is off exposes a broken tap target: the BRIEF arc is visible but navigates to a screen that is not registered.

**S2 (P2) — `dailyRingsQuery.error` ignored — API failures render as valid zero rings:**  
If the daily rings API returns an error, `dailyRingsQuery.error` is ignored and the three-arc router renders the rings as if they were all zero (completed). There is no error state or loading indicator for the rings arc when the API fails.

---

### PR251 — Community Search + Wearable Prompts (Mobile)

**Paired audit verdict:** CHANGES_REQUESTED — P1: 2 · P2: 6 · P3: 2  
**Solo audit verdict:** CHANGES_REQUESTED — P1: 2 · P2: 8 · P3: 2  
**Discrepancy:** Solo found 2 additional P2s (N1 and N2, both wearable prompts) missed by paired. See Section 8.

#### Paired Findings

**F1 (P1) — `CommunityVoiceNoteDetail` absent; voice transcript results still navigate to `CommunityThread` with a voice-note ID:**  
The D4B post-audit decision required building a `CommunityVoiceNoteDetail` screen and registering it. Current main has no such screen or route. `CommunityFindScreen.open()` handles `voice_note_transcript` in the same branch as `post` and navigates to `CommunityThread` with `{ postId: result.targetId }`, even though voice-note search result IDs are not post IDs. This will produce incorrect or broken screen rendering.

**F2 (P1) — D5B γ server-evaluated flags absent; search/wearable gating is local Expo env only:**  
The D5B post-audit decision required the γ pattern: server-evaluated feature flags via `GET /me/feature-flags`. Current main uses `readFlag('EXPO_PUBLIC_FF_COMMUNITY_SEARCH', false)` and `readFlag('EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS', false)` — local Expo environment variables, not server-evaluated per-user flags.

**F3 (P2) — Missing flag-off static pin tests for `communitySearch` and `communityWearablePrompts` routes:**  
Existing community flag-off tests cover prior lanes, but no `communitySearchFlagOff.test.ts` or `coachCommunityWearablePromptsFlagOff.test.ts` exists.

**F4 (P2) — No mobile telemetry emit sites for search submit/result tap or wearable generate/dismiss/act-on:**  
No `track(...)` calls exist in the PR #251 production files for any community search or wearable prompts user action.

**F5 (P2) — Issue #255 exists but falsely marks absent work as already resolved:**  
Issue #255 is open but its "Already resolved" section checks off `CommunityVoiceNoteDetail`, server-side kind filtering, and flag-off static pin tests. Current main has none of those artifacts.

**F6 (P2) — No dedicated screen-level tests for `CommunityFindScreen` or `CommunityWearablePromptsScreen`:**  
No `CommunityFindScreen.test.tsx` or `CommunityWearablePromptsScreen.test.tsx` exists.

**F7 (P3) — Search clear button touch target below 44/48dp:**  
`SearchBar.tsx` clear `Pressable` wraps an 18dp icon with `hitSlop={8}` and no explicit `minWidth`/`minHeight`.

**F8 (P3) — Search result routing ignores dependent route flags:**  
`CommunityFindScreen.open()` navigates to `CommunityLessonDetail` and `CommunityEventDetail` without checking whether `communityClassroom` / `communityEvents` are registered.

#### Additional Solo Findings

**N1 (P2) — `CommunityWearablePromptsScreen` starts coach-only prompt queries before flag, role, and `clientId` guards:**  
`useWearablePrompts` enables on `workspaceId` alone. The flag-off and missing-client guards are checked after the hooks are called, meaning the list query is eligible to fire before the screen reaches the guard returns. A missing `clientId` causes `listQueryParams` to omit `clientId`, and the backend then returns coach-scoped prompts without any client filter.

**N2 (P2) — Dismiss and mark-acted-on failures are silently swallowed:**  
Dismiss and mark-acted-on mutations use `.catch(absorbRejection)`, where `absorbRejection = useCallback((): void => undefined, [])`. Only `generate.isError` is rendered in the screen UI; `dismiss.isError` and `actOn.isError` have no rendered error state. A coach can tap Dismiss or Mark Acted On, see the busy state clear, and receive no indication that the server rejected the action.

**Feature flag status:** Both `communitySearch` and `communityWearablePrompts` default `false` locally. Both new routes (CommunityFind, CoachCommunityWearablePrompts) are correctly registered behind the flag ternary — dark by default. However, R81 audits the merged surface regardless of flag state.

---

### PR253 — MWB Undo Button + Command Stack (Mobile)

**Paired audit verdict:** CHANGES_REQUESTED — P1: 1 · P2: 2 · P3: 3  
**Solo audit verdict:** CHANGES_REQUESTED — P1: 2 · P2: 4 · P3: 3  
**Discrepancy:** Solo found 1 additional P1 (N1, add-undo after adoption) and 2 additional P2s (N2, N3). See Section 8.

#### Paired Findings

**F1 (P1) — D7B canonical delete-set refactor absent; remove-then-undo still leaves stale delete tracking:**  
The D7B post-audit decision required a canonical delete-set abstraction. Current main still has `deletedKeysRef` (Set) and `deletedSignaturesRef` (Map) as two independent structures inside `CoachWorkoutBuilderScreen`. The `applyInverse → addExercise` path re-adds the row with a fresh `clientId` but does not clear the original delete markers. On the next autosave adoption, the restored row can be matched against the stale delete intent and silently dropped from local state.

**F2 (P2) — No integration pin for remove-then-undo/adoption or reorder-undo:**  
The undo integration suite covers add-then-undo, plan-field-edit-then-undo, and empty-stack no-op. There is no remove-then-undo/adoption or reorder-undo integration pin.

**F3 (P2) — Undo success toast is visual-only (no live region):**  
The undo toast `<View>` has only `style` and `testID`; no `accessibilityLiveRegion`, `accessibilityRole="status"`, or `AccessibilityInfo.announceForAccessibility`. Screen reader users who trigger undo receive no status announcement.

**F4 (P3) — `applyInverse` empty dependency array is fragile:**  
`applyInverse` uses `useCallback(..., [])` while reading refs, setters, and helpers. Any future non-stable capture added to this function will not be surfaced by dependency review.

**F5 (P3) — Undo toast passes stack capacity (20) instead of remaining depth:**  
`commandCapacity = commandStack.capacity` is always 20 (the configured max), not the number of remaining undoable actions after the pop. The copy remains constant and can mislead users.

**F6 (P3) — `UndoButton` docstring still names the wrong divider token:**  
The docstring says `textMuted` for the divider; implementation correctly uses `sc.border`.

#### Additional Solo Findings

**N1 (P1) — `addExercise` undo breaks after normal row-id adoption remaps `clientId`:**  
After an exercise is added and saved, the post-save adoption refetch maps the server-assigned row ID to a fresh `clientId` via `clientIdForServerRow`. The command stack still holds the original pre-adoption `clientId`. When undo executes `removeExercise`, it finds the row by `clientId` — but that ID no longer exists in rows (it was remapped). `findIndex` returns -1, the inverse returns current rows unchanged, the command is popped, and the success toast fires. The coach sees "Reverted" while the exercise remains in the plan.

**N2 (P2) — Undo pushes happen inside React state updater functions:**  
`moveRow`, `removeRow`, and `updateRow` all call `pushUndoActionRef.current?.(...)` from inside `setRows((cur) => {...})` state updater lambdas. React may double-invoke state updaters (StrictMode, concurrent rendering). A single user gesture can push two undo commands for one action, violating the "ONE entry per user gesture" invariant documented in the hook.

**N3 (P2) — No undo invocation/failure/overflow telemetry:**  
No `track(...)` calls exist for undo invocations, undo failures/no-ops, or command-stack overflow/eviction. Stack overflow silently FIFO-evicts old entries with no signal.

**Feature flag status:** `EXPO_PUBLIC_FF_MWB_UNDO` defaults off. No undo button, toast, or Pan gesture is mounted when the flag is off.

---

## 3. PRs Not Covered by POST_MERGE Paired Audits

The BACKFILL_LEDGER_2026-06-14 records five additional PRs that have backfill audit docs but were not part of the 8-PR serial POST_MERGE paired/solo audit batch. Their open finding counts are recorded here as synthesized from the BACKFILL_LEDGER summary:

| PR | Repo | Backfill Verdict | Open Findings |
|----|------|-----------------|---------------|
| PR #200 | Backend | REVERT_REQUIRED_P0 (trailer) | 2 P2 + 1 P3 code findings open; trailer resolved via AUDIT_DEBT_PR200.md Option A |
| PR #242 | Mobile | CHANGES_REQUESTED | P1: write-only MMKV gate causes celebration re-fire across app restarts; + 3 P2 + 5 P3 |
| PR #248 | Mobile | CHANGES_REQUESTED | P1: Zod `.strict()` detail schema mismatch with backend `{post, upload_targets}` shape; + 3 P2 + 2 P3 |
| PR #399 | Backend | CHANGES_REQUESTED → **FIXED via PR #405, CLEAN** | Fixed; PR #405 at `b36799cf` is CLEAN_NO_FINDINGS, holding for ordered merge wave |
| PR #401 | Backend | CHANGES_REQUESTED → **FIXED via PR #403, CLEAN** | Fixed; PR #403 at `e8fef8c6` is CLEAN_NO_FINDINGS, holding for ordered merge wave |

---

## 4. Fixer Queue from BACKFILL_LEDGER

The BACKFILL_LEDGER_2026-06-14 (updated 2026-06-15 07:48 UTC) records the following fixer queue priority order:

**Urgent (P1, blocks flag-on) — ordered by severity and flag-flip imminence:**

1. **PR #401 / PR #403** — CLEAN_NO_FINDINGS, mergeable. DI cycle (AuthModule imported by RegimesModule → 5-node cycle) fixed via BillingPrimitivesModule pattern; partial-refund TOCTOU fixed. Holding for dependency-ordered merge wave.

2. **PR #399 / PR #405** — CLEAN_NO_FINDINGS, mergeable. ParseUUIDPipe(v4) → CUID-compatible validation fixed; 403→404 leak fixed; throttle decorators added; TOCTOU collapsed on markDismissed/markActedOn; cooldown-race redesigned. Holding for dependency-ordered merge wave. R82 issue #404 open (non-empty-env backfill path).

3. **PR #326 fixer** — P1 dispatcher-claim race; check-and-set broken. Fix: `updateMany({ where: { id, status: 'pending' } })` with `count===0 → throw`.

4. **PR #253 fixer** — Canonical delete-set refactor per D7B (biggest scope expansion). Plus add-undo-after-adoption clientId preservation (N1), undo-push-outside-updater fix (N2), telemetry (N3), accessibility live region, toast depth semantics.

5. **PR #242 fixer** — Gate `onFirstPayment` on `await hasSeenFirstPayment(coachId)` (read-on-mount); add regression test with pre-set persisted gate.

6. **PR #248 fixer** — Drop `.strict()` on detail schema OR accept `upload_targets` optionally; add `CommunityLessonDetailScreen.test.tsx`.

7. **PR #251 fixer** — Build `CommunityVoiceNoteDetail` per D4B; implement D5B γ `GET /me/feature-flags`; fix wearable-prompts hook enablement guards; render dismiss/act-on failure UX; add flag-off pin tests; add telemetry; correct issue #255.

**Pre-flag-flip (P2-only PRs) — once urgent queue clears:**

8. **PR #396 fixer** — Wire telemetry emits OR correct narrative; real post ID in create-path storage keys; `@ArrayMaxSize` on media arrays; explicit `@Throttle` on reads.

9. **PR #400 fixer** — Composite `(coach_id, coach_reviewed_at)` index; Zod `.strict()` on response; `@Throttle`; cache pruning.

10. **PR #398 fixer** — Collapse `assertCheckInOfCoach` + update to single `update({ where: { id, coach_id } })`; narrow response with `select`; `@Throttle`.

11. **PR #395 / PR #402 fixer** — Fix pre-commit `recentPushes` mutation (N1); add immediate-redelivery regression test without fake clock advancement.

12. **Polish wave** — PR #249, PR #250, PR #252, PR #254, PR #397: P2/P3 polish; can be batched into one cross-PR cleanup PR per repo.

**PR #200 followup** — Code findings (2 P2 + 1 P3) still open per the original PR200 audit. Trailer settled via AUDIT_DEBT_PR200.md Option A; do not rewrite history.

---

## 5. Open Finding Register

This register lists all open findings as of the POST_MERGE audit batch (2026-06-15). Findings that were subsequently resolved (PR #403 / PR #405) are not listed here.

### P0 Findings

No P0 findings remain open across the POST_MERGE audit set.

*(PR #395's original P0 was resolved by PR #402, which audited CLEAN. The remaining PR #395/PR #402 finding is P1.)*

---

### P1 Findings

| ID | PR | Finding | Flag status |
|----|----|---------|------------|
| — | PR395/PR402 | `FIRST_PAYMENT` push lost after rollback + Stripe retry within 60s (`recentPushes` mutated pre-commit) | `FEATURE_ROMAN_FIRST_PAYMENT` = default OFF |
| F1 | PR326 | Dispatcher-claim race: `scheduledDrop.update` WHERE does not include `status='pending'` | N/A (backend bulk mutation) |
| F1 | PR251 | `CommunityVoiceNoteDetail` absent; voice transcript results navigate to `CommunityThread` with wrong ID type | `communitySearch` = default OFF |
| F2 | PR251 | D5B γ server-evaluated flags absent; `communitySearch`/`communityWearablePrompts` remain local Expo env | both = default OFF |
| F1 | PR253 | D7B canonical delete-set refactor absent; remove-then-undo leaves stale delete markers | `EXPO_PUBLIC_FF_MWB_UNDO` = default OFF |
| N1 | PR253 | Add-undo after server-id adoption no-ops silently (clientId remapped, findIndex returns -1, success toast fires) | `EXPO_PUBLIC_FF_MWB_UNDO` = default OFF |
| F1 | PR242* | Write-only MMKV gate causes celebration re-fire across app restarts | per BACKFILL_LEDGER |
| F1 | PR248* | Zod `.strict()` detail schema mismatch with backend `{post, upload_targets}` shape | per BACKFILL_LEDGER |

*PR #242 and PR #248 findings sourced from BACKFILL_LEDGER summary, not from a separate POST_MERGE paired/solo audit file.

---

### P2 Findings

| ID | PR | Finding |
|----|----|---------|
| F1 | PR396 | Create-time media storage key uses throwaway randomUUID() instead of persisted post ID |
| F2 | PR396 | Media arrays unbounded (no `@ArrayMaxSize`) |
| F3 | PR396 | Classroom telemetry registered but never emitted |
| F4 | PR396 | listFeed / getOne unthrottled despite signing signed URLs per row |
| F5 | PR396 | No R82 tracking issue |
| F1 | PR398 | `POST /coach/clients/:id/check-ins/:id/reviewed` has no `@Throttle` |
| F2 | PR398 | Raw Prisma `CheckIn` response (no Zod `.strict()`, no `select`) |
| F3 | PR398 | Non-atomic `assertCheckInOfCoach` + `update` (TOCTOU ownership gap) |
| F1 | PR400 | No explicit throttle on `GET /coach/home/daily-rings` |
| F2 | PR400 | No Zod `.strict()` response envelope |
| F3 | PR400 | Missing `(coach_id, coach_reviewed_at)` composite index |
| F4 | PR400 | No R82 tracking issue |
| F5 | PR400 | R74 identity on merge commit |
| F1 | PR397 | list / getOne unthrottled despite signing download URLs per row |
| F2 | PR397 | No R82 tracking issue |
| F3 | PR397 | R74 identity on merge commit |
| F2 | PR326 | Missing explicit `@Throttle` on `POST :contentId/push-to-existing` |
| F3 | PR326 | No Zod `.strict()` response schema for push-to-existing |
| F1 | PR252 | StripeConnectCard / PermanenceMarker built but not wired to any host screen |
| F2 | PR252 | CTA lacks guaranteed 48dp Android touch target |
| N1 | PR252 (solo) | Inactive face not hidden from accessibility tree |
| N2 | PR252 (solo) | No R82 tracking issue |
| F1 | PR250 | No flag-off static pin for `romanCompetencePill` |
| F2 | PR250 | `HabitsScreen` raw `coach_reviewed_at` cast (no runtime type guard) |
| N1 | PR250 (solo) | `RomanAvatar` uses `importantForAccessibility="no"` instead of `"no-hide-descendants"` (Android leak) |
| N2 | PR250 (solo) | Malformed `reviewedAt` renders "on undefined NaN" (no `Number.isFinite` guard) |
| F1 | PR249 | VoiceNotePlayer toggle 36×36dp with no hitSlop |
| F2 | PR249 | No `CommunityVoiceComposerScreen` dedicated test |
| N1 | PR249 (solo) | Native recorder not cancelled on unmount (microphone leak + race) |
| S1 | PR254 (solo) | BRIEF arc routes to `coachBrief` gate-independent screen — broken tap target when `coachBrief` off |
| S2 | PR254 (solo) | `dailyRingsQuery.error` ignored — API failures render as valid zero rings |
| F3 | PR251 | Missing flag-off static pin tests for `communitySearch` / `communityWearablePrompts` |
| F4 | PR251 | No mobile telemetry for search submit/result tap or wearable prompts |
| F5 | PR251 | Issue #255 falsely marks absent work as already resolved |
| F6 | PR251 | No dedicated screen-level tests for `CommunityFindScreen` or `CommunityWearablePromptsScreen` |
| N1 | PR251 (solo) | Wearable prompts data hooks run before flag/role/clientId guards |
| N2 | PR251 (solo) | Dismiss / act-on mutation failures silently swallowed (no rendered error state) |
| F2 | PR253 | No integration pin for remove-then-undo/adoption or reorder-undo |
| F3 | PR253 | Undo success toast is visual-only (no live region) |
| N2 | PR253 (solo) | Undo pushes inside React state updater functions (double-invoke risk) |
| N3 | PR253 (solo) | No undo invocation/failure/overflow telemetry |

---

### P3 Findings

| ID | PR | Finding |
|----|----|---------|
| F4 | PR326 | Bulk push produces only a transient logger line (no durable audit entry) |
| F4 | PR398 | No sub-coach marker attribution test for ConversationReview |
| F5 | PR398 | No telemetry for coach-reviewed actions |
| F6 | PR400 | Cache Map never pruned |
| F7 | PR400 | No telemetry register + emit |
| F4 | PR397 | community-voice.e2e.spec.ts is reflection-only (no supertest/HTTP integration) |
| F3 | PR252 | (Paired P3 — polish; detail in audit file) |
| N3 | PR252 (solo) | R74 merge commit identity mismatch |
| F3/F4 | PR250 | (Paired P3s — polish; detail in audit file) |
| N3 | PR250 (solo) | R74 identity |
| N4 | PR250 (solo) | No R82 tracking issue |
| F3 | PR249 | No mobile-side telemetry |
| N2 | PR249 (solo) | R74 merge commit identity |
| F1 | PR254 | Stale "Polled on Coach Home focus" docstring |
| F2 | PR254 | Hardcoded `accessibilityState={{ busy: false }}` during loading |
| F7 | PR251 | Search clear button touch target below 44/48dp |
| F8 | PR251 | Search result routing ignores dependent route flags |
| F4 | PR253 | `applyInverse` empty dependency array is fragile |
| F5 | PR253 | Undo toast passes capacity instead of remaining depth |
| F6 | PR253 | `UndoButton` docstring names wrong divider token |

---

## 6. Recurring Phase 2 Patterns

The following patterns appeared across multiple Phase 2 POST_MERGE PRs. These are not introduced as new intent — they are observed from the audit documents.

**Missing `@Throttle` on write and URL-signing read routes (PR396, PR397, PR398, PR400, PR326):** Multiple new routes — including bulk mutations and read routes that sign download URLs — were merged without explicit throttle decorators. This appeared in both backend and is structurally the same gap: new routes fell through to global defaults rather than having mutation-specific or URL-signing-specific rate limits.

**No Zod `.strict()` response schema (PR326, PR398, PR400):** Backend routes that were careful to validate request bodies with Zod were not equally careful about validating and parsing response shapes. Response schemas prevent internal Prisma fields from leaking in API responses.

**Missing R82 tracking issues (PR396, PR397, PR400, PR251, PR252):** Several POST_MERGE PRs with open P2/P3 findings had no corresponding GitHub tracking issue. The BACKFILL_LEDGER requires R82 tracking issues for any deferred follow-up work.

**Solo audits finding additional severity (PR249, PR250, PR252, PR253, PR254):** Across five PRs, the solo audit found defects missed by the paired audit, in several cases escalating severity (e.g., PR254 went from P3-only to P2:2 + P3:2 in the solo pass). This supports the value of the independent solo audit track as a complementary adversarial check.

**React Native accessibility gaps (PR249, PR250, PR252, PR254):** Multiple mobile PRs had accessibility issues: touch targets below platform minimums (PR249, PR252), incorrect `importantForAccessibility` values (PR250), elements not hidden from accessibility tree (PR252), and hardcoded accessibility states during loading (PR254).

**Feature-flag surface without server-evaluated flag pattern (PR251):** The D5B requirement for γ (server-evaluated) feature flags was not implemented. Client-local Expo env flags were shipped instead, meaning the backend cannot control which result kinds are delivered to which users.

---

## 7. CLEAN PRs (Holding, Not Yet Merged)

The following PRs completed the full R81 audit cycle and reached CLEAN_NO_FINDINGS. They are waiting for the dependency-ordered merge wave:

| Fix PR | For | Verdict | Merge-ready commit | Notes |
|--------|-----|---------|-------------------|-------|
| PR #403 | PR #401 | CLEAN_NO_FINDINGS | `e8fef8c6` | CI green; holds for wave |
| PR #405 | PR #399 | CLEAN_NO_FINDINGS | `b36799cf` | CI green; R82 issue #404 open for non-empty-env backfill |

PR #402 (for PR #395) is already merged at `fea925a8` per BACKFILL_LEDGER.

---

## 8. Discrepancies Between Paired and Solo Audits

Per the task specification, discrepancies between paired and solo audits for the same PR are recorded here. Both verdicts are preserved; neither is resolved.

---

### PR252 — Onboarding Polish

**Paired:** P2: 2 · P3: 1  
**Solo:** P2: 4 · P3: 2  

Solo identified two additional P2 findings (inactive face not hidden from accessibility tree; no R82 tracking issue) and one additional P3 (R74 merge commit identity). The paired audit found the same P2s for StripeConnectCard/PermanenceMarker unwired and CTA touch target. The solo audit found the same findings plus the accessibility tree and R82 gaps. No factual contradiction on shared findings.

---

### PR250 — Competence Pill

**Paired:** P2: 2 · P3: 2  
**Solo:** P2: 4 · P3: 4  

Solo identified two additional P2 findings (Android `importantForAccessibility` leak on `RomanAvatar`; "on undefined NaN" render without `Number.isFinite` guard) and two additional P3 findings (R74 identity; no R82 tracking). The paired audit found the flag-off static pin gap and `coach_reviewed_at` cast gap. No factual contradiction on shared findings.

---

### PR249 — Voice Notes Mobile

**Paired:** P2: 2 · P3: 1  
**Solo:** P2: 3 · P3: 2  

Solo identified one additional P2 (native recorder not cancelled on unmount — microphone leak and race) and one additional P3 (R74 identity). The paired audit found the VoiceNotePlayer touch target and missing composer screen test. No factual contradiction on shared findings.

**Significance of solo N1:** The recorder lifecycle defect (P2) was missed by the paired audit. This is a privacy-relevant finding (microphone held after UI dismissal) that the solo audit's adversarial sweep detected.

---

### PR254 — Three-Arc Router

**Paired:** P2: 0 · P3: 2  
**Solo:** P2: 2 · P3: 2  

Solo identified two additional P2 findings (BRIEF arc flag coherence gap; `dailyRingsQuery.error` ignored). The paired audit classified both issues as P3 (stale docstring; hardcoded `accessibilityState`). However, the solo audit introduced two distinct P2 findings that the paired audit did not raise at all — the paired audit's P3s are about different issues (docstring staleness and loading accessibility state) than the solo P2s (flag coherence and error state rendering). No direct contradiction on any single finding; the solo pass found a severity escalation via entirely new findings.

---

### PR251 — Community Search + Wearable Prompts

**Paired:** P1: 2 · P2: 6 · P3: 2  
**Solo:** P1: 2 · P2: 8 · P3: 2  

Solo confirmed all paired findings (F1–F8) and added two new P2 findings specific to wearable prompts (N1: hook enablement before guards; N2: silent dismiss/act-on failure). Both audits agree on the P1 verdict (D4B absent, D5B absent) and the P2/P3 severity for shared findings. No factual contradiction on shared findings.

---

### PR253 — MWB Undo Button + Command Stack

**Paired:** P1: 1 · P2: 2 · P3: 3  
**Solo:** P1: 2 · P2: 4 · P3: 3  

Solo confirmed all paired findings (F1–F6) and added three new findings: N1 (P1: add-undo after adoption no-ops silently), N2 (P2: undo pushes inside React state updaters), N3 (P2: no undo telemetry). The solo audit identifies N1 as an additional P1 — a second correctness defect in the command stack identity contract. Both audits agree that the D7B canonical delete-set refactor is absent (F1/P1). No factual contradiction on shared findings.

**Significance of solo N1:** The add-after-adoption identity loss is a separate P1 from the D7B delete-set issue. Even if D7B is correctly implemented, N1 (clientId remapping after server-id adoption) would remain as a distinct failure mode. The solo audit's surfacing of this means the D7B fixer must also address identity preservation across adoption.
