# AUD-OPUS-4 (agent 112) — second Claude Opus 5.5 lens

Queue per operator 12:33: #641 + #329 (#609/#312 dropped, owned by AUD-OPUS-3).

## backend #641 @ 563e3f80f913dd2a2b4efa5099d5e5944dabb19d — REQUEST CHANGES (A0 B2 C4)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960027984

AUDIT Claude Opus 5.5 — growth-project-backend#641 @ 563e3f80f913dd2a2b4efa5099d5e5944dabb19d — VERDICT: REQUEST CHANGES

Lane AUD-OPUS-4 (agent 112), independent second Opus lens. First audit of this PR (no prior AUDIT comments). The builder lane (S-COACH, agent 111) died without a report, so I also checked completeness against its objective (section at the end). Diff read in full at the head: one commit on base e867fe62, 14 files, +1710/-12. Required checks at this head are all green: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity. No migration, no env name, no CI gate file touched, no package change.

What holds up: tenancy (every query is scoped to `req.user.id` as seller `coach_user_id` or ledger `payee_user_id`; a foreign charge id gives `404 MONEY_CHARGE_NOT_FOUND`); an explicit `select` with no Stripe secrets; the ledger fold (each slice adds amount - reversed once; slice kinds match #627 head 9d6351b0 `destination | application_fee | stripe_fee | head_coach_split`); `processing_paid_by` does not make up a fee before #627; stable 400 codes; the public onboarding landings read and echo nothing; `deriveConnectState` and deauthorization handling; and the `refreshed` check (Prisma `@updatedAt` moves on every successful `syncFromStripe` update).

## Findings

**B-641-1 — `card_update_link_sent_at` is always null in production, and the test fixture covers a state the code can never reach.**
`src/coach-money/coach-money.service.ts:611-616,666-668` reads the latest `PaymentReminder` with `status: 'sent'`. No code ever writes `'sent'`: `DunningService.markReminderSent` (`src/checkout/dunning.service.ts:1008`) has no caller anywhere in `src/`, and `enqueueReminder` only creates `queued` rows. Those rows also have kinds `payment_failed | final_warning | canceled_for_nonpayment`, not a card-update link. Dunning v2, which sends the card-update push and email, does not write `PaymentReminder` at all (`src/checkout/dunning-v2/*`). The spec mocks `reminders: [{ sent_at: ... }]` (`test/coach-money.service.spec.ts:399,431`), so it proves a dead field. A coach would never see "card update link sent". That breaks the rule that nothing fake or dead is reachable.
Minimal fix: read the real send record that dunning v2 writes (the dispatcher's per-step client email/push send log, for example a `DunningAttempt`/telemetry row with the step and channel). If no such record exists, remove the field from the DTO and from the PR body until one does. Replace the fixture with a row shaped like what production writes.

**B-641-2 — A lost chargeback is reported as `paid`, and it counts as a paid sale.**
On a lost dispute, `refund-dispute-handler.service.ts:574-595` sets `ChargeDispute.status='lost'` and `ClientPurchase.status='chargeback_lost'`, and reverses the ledger. The destination slice stays `posted`/`reversed`. In `toCharge` (`coach-money.service.ts:551-563`), `lost` is not in `OPEN_DISPUTE_STATUSES`, the charge has no `ChargeRefund` row and `chargeback_lost` is not a failed status. So `r.splits.length > 0` makes the state `paid`. `PAID_WHERE` (`:177-182`) matches the same purchase through `splits.some(destination)`, so a charged-back sale:
- shows as "paid" in recent charges and under the `paid` filter;
- is missing from the `refunded` filter;
- counts toward `new_clients_30d`;
- ticks the mobile "first client payment" checklist item (#329 reads `charges?status=paid&limit=1`).
Minimal fix: add `chargeback_lost` (and `lost` disputes) as an explicit coach-facing state, for example `charged_back`. Exclude `status: 'chargeback_lost'` from `PAID_WHERE`. Include lost disputes in the `refunded` filter (or add a `disputed` filter). Add spec cases for a lost dispute and a won dispute.

**C-641-1 — Refunds and dispute reversals land in the sale's window, not the refund's window.** `windowWhere` filters slices by `posted_at`, and the reversal is `reversed_cents` on the original slice (`:325-334`). Today's net does not drop when an old sale is refunded today, and last month's net changes after the fact. Consider windowing reversals by `reversed_at`, or label the number "net on sales made in this period" in the UI.

**C-641-2 (pre-existing, out of diff; operator item) — Stripe secrets leak to coaches on older routes.** The builder's own gap G-1 is confirmed: `src/checkout/payment-ops.controller.ts:644` (`GET /v1/coach/payments/purchases`), `:675` (`/purchases/:id`) and the `failed` handler (`:860`) return full `ClientPurchase` rows, including `stripe_client_secret` and `stripe_ephemeral_key`. Recommend a separate small T4 PR with explicit `select` before launch.

**C-641-3 — #627 seam for the open balance.** Under OR-111-1, after a refund or chargeback TGP holds 2% plus Stripe fees from the coach's next sale. The summary has no `open_balance`/held-amount field, so net can overstate what the coach will actually receive. When #627 merges, add the open-balance read (or reserve a nullable `held_cents` field now so mobile can feature-detect it).

**C-641-4 — No server CSV export for taxes.** The objective's Money footer item "Export CSV for taxes" has no route. Mobile can build the CSV from paginated `/charges`, or add `GET /v1/coach/money/charges.csv`.

## Completeness vs S-COACH objective (backend share; evidence at 563e3f80)
| Objective item | Status | Evidence |
|---|---|---|
| Truthful Connect status incl. requirements due + deadline | done | `coach-connect.service.ts` `state`, `requirements{...}`, `deriveConnectState` |
| Return/refresh links back into the app | done (operator must set the 2 env values) | `connect-onboarding-return.controller.ts`; `tgp` scheme is registered in mobile `app.json` |
| Re-read Stripe on return | done | `POST /coach/connect/status/refresh` (12/min) |
| Net with Today/30d/90d/YTD + change vs previous period | done (windows computed on device) | `GET /v1/coach/money/summary` with compare window |
| Tap amount: price - processing - TGP 2% = net | done | `GET /v1/coach/money/charges/:id` |
| Needs attention: failed payments with dunning status | partial | attempt/next retry/lockout real; card-update-link time dead (B-641-1) |
| Needs attention: disputes, Stripe requirements, "Message client" ids | done | `getAttention` |
| Next payout amount/date | partial (existing route) | `GET /coach/connect/payouts` (Stripe list includes pending payouts); not part of the Money read model |
| MRR, paying clients, churn 30d, new clients 30d | done, with B-641-2 skew | `recurring()` |
| Recent charges last 5 + See all paid/failed/refunded | partial | `/charges`; lost chargebacks wrong (B-641-2) |
| Payout settings (Stripe dashboard link) | existing route | `POST /v1/connect/accounts/dashboard-link` |
| Export CSV for taxes | missing | C-641-4 |
| Open-balance seam for #627 | missing | C-641-3 |
| Coach Home card / Money page / redirects of Earnings and Business metrics / retire 404 calls | missing (mobile; no PR exists) | see mobile #329 A-329-1 |

## Counts
A 0 · B 2 · C 4. APPROVE needs B-641-1 and B-641-2 closed with code and honest tests at a new head.

---

## mobile #329 @ 4071d0ce40d2c451addf1540654c2b16e5f66395 — BLOCK (A1 B2 C4)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960028238

AUDIT Claude Opus 5.5 — growth-project-mobile#329 @ 4071d0ce40d2c451addf1540654c2b16e5f66395 — VERDICT: BLOCK

Lane AUD-OPUS-4 (agent 112), independent second Opus lens. First audit of this PR (no prior AUDIT comments). The builder lane (S-COACH, agent 111) died without a report, so I also audited against its objective (completeness section below). Diff read at the head: 2 commits on base e3986e89, 19 files, +3527/-142. Required checks at this head are green: Typecheck/lint/test, Analyze (js-ts), Analyze (actions). The PR grades itself T3. With backend #641 it is part of a T4 money pair; this PR adds no fee math, so I leave the tier for the operator.

What holds up:
- `toConnectView` handles older payloads.
- The refresh call falls back to GET status on 404/405.
- `advanceWizardTo` walks forward one step at a time, matching `coach-onboarding.service.ts:179`.
- `assertStripeUrl` runs before `openAuthSessionAsync`; the `tgp` scheme is registered in `app.json`.
- The expired link is re-minted once.
- The $19.99-or-free rule matches #629.
- The free package is bound to the invite link.
- The vendored QR encoder is MIT and works offline.
- Error copy maps 401, 429, offline, CONNECT_NOT_CONFIGURED, STRIPE_CONNECT_ERROR and step codes; unknown errors give a reference plus the support address and go to Sentry. Copy has no "something went wrong", no exclamation marks and no emojis.

## Findings

**A-329-1 — The new Home checklist sends coaches into the dead Earnings screen. The Money page the owner requires does not exist.**
`src/screens/coach/command-center/CoachHomeCards.tsx:37`: the "Get your first client payment" item navigates to `SettingsStack > CoachEarnings` (`CoachNavigator.tsx:471`). That is `screens/coach/CoachEarningsScreen.tsx`, which calls six routes that do not exist on the backend: `/v1/coach/earnings`, `/v1/coach/payouts/readiness`, `/v1/coach/payouts`, `/v1/coach/reconciliation`, `/v1/coach/refunds`, `/v1/coach/dashboard-link` (`src/api/coachEarningsApi.ts:144-161`; no matching controller at backend 563e3f80 or main). Owner rulings: Earnings dead = blocker, nothing dead reachable. The PR body defers "TGP Money (Home Money card + Money page, redirects old Earnings/Business metrics)" to a stacked follow-up, but no such branch or PR exists (the open mobile PR list has only #329 for S-COACH). The PR also points users at "Money" in copy:
- `CoachWizardNavigator.tsx:532` "Your first client payment shows up in Money."
- `CoachSetupChecklist.tsx:81` "See it in Money."
- `lib/coachSetup/errors.ts:120,144`
Minimal fix: ship the Money page in this PR or a stacked PR that merges together with it. That means: the Home Money card (net 30d plus red attention count) built on `/v1/coach/money/summary` and `/attention`; the Money page on #641 routes, reusing `command-center/` and absorbing Business metrics; Payout settings via `POST /v1/connect/accounts/dashboard-link`; and `CoachEarnings`/`CoachBusinessMetrics` redirected to Money with the 404 calls removed. Until then, the checklist must not route to `CoachEarnings`, and no copy may name Money.

**B-329-1 — A retry after a partial failure creates a duplicate package.**
`src/components/coach/setup/FirstPackageForm.tsx:101-131` rotates `idemKey` on any error in the try block, including errors after `coachPackagesApi.create` succeeded (`publishPackage`, `inviteLink`, `bindFreePackage`) and a create that timed out after the server committed it. The next tap sends a new key and creates a second package. This contradicts the comment at `:87-88`.
Minimal fix: keep the created package id in a ref and resume from publish/bind on retry. Rotate the key only after a definitive 4xx from `create`. Add a test where publish fails once and the retry calls `create` 0 times.

**B-329-2 — CONNECT_NOT_CONFIGURED copy is untrue.** `lib/coachSetup/errors.ts:117-120` says Stripe payouts are "not available in this version of the app yet". This is a server configuration state (`assertConnectReady` 503, or missing `STRIPE_CONNECT_*_URL` = `configuration_missing`), not an app-version state, and the copy sends the coach to a page that does not exist ("connect Stripe later from Money"). Fix: say payouts are not switched on for the account yet, the coach can finish setup and connect Stripe later from the Home checklist, and give support plus a reference ID.

**C-329-1** — `CoachWizardNavigator.tsx:372`: `find(active) ?? res.data[0]` treats a draft or archived package as existing, then shows "First package live" as done (`:510`). Use active packages only.
**C-329-2** — `CoachSetupChecklist.tsx:115`: "Invite your first client" is done only from a device-local MMKV flag. Reinstalling or switching devices loses it, and sharing a link is not inviting a client. Use a server signal (invite redemption or client count).
**C-329-3** — `CoachWizardNavigator.tsx:506`: "Stripe ready to pay you" reads in-memory `state.connect`, which is null when the wizard resumes on step 5, so an active account shows "still to do". Fetch status on mount.
**C-329-4** — `CoachSetupChecklist.tsx:102-103`: load failures are dropped silently (`catch(() => null)`). The checklist then looks undone with no retry or error copy.

## Completeness vs S-COACH objective (mobile share; evidence at 4071d0ce)
| Objective item | Status | Evidence |
|---|---|---|
| Wizard: practice basics | done | Step 1, saved to backend step 1 with time zone |
| Get paid: Stripe Express hosted, return/refresh into the app, truthful status + requirements due | done (needs #641 + operator env) | `GetPaidPanel.tsx`, `connectCopy.ts` |
| First package prefilled ($19.99+ or free per #629) | done, with B-329-1 | `FirstPackageForm.tsx` |
| Invite first client (link, share, QR) | done | `InviteShareCard.tsx`, `QrCode.tsx`, `vendor/toqr` |
| Home checklist ending in the first-payment celebration | partial | checklist done; last item opens dead Earnings (A-329-1); celebration is the existing flag-gated `FirstPaymentWowHost` |
| Always reachable | done | `SettingsStack.CoachSetup` + Home checklist |
| Coach Home Money card (net 30d + red attention count) | missing | no component |
| Money page: chips, change, tap for breakdown, Needs attention + Message client, next payout, MRR/paying/churn/new, recent charges + See all | missing | no screen; #641 routes are unused except `/charges?status=paid&limit=1` |
| Merge Business metrics; reuse command-center/ | missing | `CoachBusinessMetrics` unchanged (`CoachNavigator.tsx:445`) |
| Payout settings = Stripe dashboard link under Earnings/Money | missing (dead) | Earnings calls 404 `/v1/coach/dashboard-link` |
| Packages link, Export CSV for taxes | missing | none |
| Old Earnings/Business metrics redirect to Money; retire the 404 calls | missing | `coachEarningsApi.ts:144-161` still live and now reachable from Home |

## Counts
A 1 · B 2 · C 4. Blocked until the Money surface ships and the checklist stops routing to the dead Earnings screen.

---

## Queue 2 (operator 13:09): backend #610 + mobile #314 (B-UGC-4 fix round 5)

## backend #610 @ 7a67fbef28a3b23343d69675746078df7192a4d9 — APPROVE (A0 B0 C5)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5960733421

AUDIT Claude Opus 5.5 — growth-project-backend#610 @ 7a67fbef28a3b23343d69675746078df7192a4d9 — VERDICT: APPROVE

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is the T4 re-audit of fix round 5 (lane B-UGC-4), paired with mobile #314. I read every earlier AUDIT comment and the B-UGC-4 report. Of the earlier verdicts, Sol BLOCK at c710b0dc (5957253617) and Opus RC at c710b0dc (5957432795) left A-610-2 = B-610-6, B-610-4, B-610-5 and B-610-7 open. I read the delta ea72c1fc..7a67fbef in full (20 files, +1246/-96), with the migration and ci.yml line by line.

**A 0 · B 0 · C 5.** Every open finding is closed, each with code and a test that runs.

### Merge purity
Merge ea72c1fc (parents c710b0dc + main 3bd6215b) has tree 9f6dcddb, which is identical to `git merge-tree --write-tree` of its parents, so it is a pure merge. The three later commits are the fix (3c29f3b8) plus test-only follow-ups (6397f84b, 7a67fbef).

### Prior findings, verified
- **A-610-2 / B-610-6 (forgeable win coach_id): CLOSED.**
  - `migration.sql` section 4 adds the SECURITY DEFINER `app.community_win_author_coach` (pinned search_path; the coach's own id for a coach author, else `User.coach_id`; NULL for a deleted user).
  - The INSERT WITH CHECK adds `coach_id IS NOT DISTINCT FROM app.community_win_author_coach(user_id)`, and the trigger's INSERT branch raises 42501 on a mismatch.
  - The moderator arm is now only `app.is_current_coach_of(user_id)`, in SELECT, UPDATE and the hide/unhide trigger. The `coach_id = current_user_id()` arm is gone everywhere.
  - `community_win_teammate_visible` now also requires the author's coach to equal `p_coach_id`.
  - Live negatives in `community-wins-rls.live.spec.ts`: self-as-coach INSERT, forged foreign coach, NULL coach, forged self-coach row giving no moderator power, forged foreign row never reaching the other circle.
  - These ran for real: in the `community-live-tests` job at this head (job 111005983947), the wins RLS suite passes, 10 suites / 99 tests, none skipped.
- **B-610-4 (Warn then Ban leaves only the warning): CLOSED.**
  - Strength ordering is dismiss < warn < hide < ban. A weaker action or a Dismiss on an actioned report is refused with 409 `community.moderation.already_actioned` before any enforcement. The 409 copy names the current action and says what to do next.
  - Resolution is a compare-and-set (`resolveIfUnchanged`: updateMany where status+action match) inside the notice transaction, with up to 3 re-evaluations, then 409 `community.moderation.changed`.
  - The notice key is `(report, action)`, so an escalation writes a new ban notice. `stored` reflects created/exists, and push fires only on `created`.
  - I walked the races: Ban vs Warn either order, Dismiss vs Ban, Hide vs Ban. Each ends at the stronger action or a coded 409, and any enforcement already applied is contained in the stronger action.
  - Tests: `community-ugc-round2.spec.ts:513,549`, plus the round-5 block.
- **B-610-5 (failed storage erasure never retried): CLOSED.**
  - New `community_voice_erasures` table: no FK to User, so the work outlives account finalization. It has ENABLE + FORCE RLS, a service_role-only permissive policy, RESTRICTIVE deny for anon and authenticated, and REVOKE ALL.
  - `recordVoiceErasures` runs before the soft delete in author delete (`community-voice.service.ts deleteAndErase`), moderation (`hideTarget`) and account deletion (`eraseCommunityVoice`). A failed record throws, so nothing is acknowledged.
  - A row completes only when `objectGone`/`ownerFolderEmpty` returns true.
  - `VoiceErasureService` runs every 10 minutes with a lease (conditional updateMany on `next_attempt_at`) and exponential backoff capped at 6 h. `CommunityModule` is always imported, so the cron runs even with the community flags off.
  - Tests: `community-ugc-round2.spec.ts:579,600` (outage, then cron completion), `account-deletion.voice-erasure.spec.ts`, `community-voice.service.spec.ts`.
- **B-610-7 (NULL discriminator passes the CHECK): CLOSED.** Both arms are wrapped in `IS TRUE`, and the comment arm adds `plan_context_type IS NOT NULL`. The new `community-message-shape.live.spec.ts` refuses the NULL shape and every other cohort-less untagged shape, and still accepts the legitimate ones. It ran in CI (PASS, not skipped).

### T4 gate file: `.github/workflows/ci.yml`
The one-line change only adds `test/community/rls/community-message-shape.live.spec.ts` to the community-live-tests jest list. Nothing is removed, no condition or `continue-on-error` is changed, and the gate is not weakened. Approved as written.

### C findings (optional)
- **C-610-8: the erasure check counts some storage errors as "already gone".** `voice-upload.provider.ts:329-333` maps HTTP 400, or any message matching `/not.?found/` (which includes "Bucket not found"), to `missing`. Then `voice-erasure.ts:122-123` completes the row. For the publish check (A-610-1) "missing" was the safe direction; for erasure it is not. A misconfigured bucket, or a storage 400 that is not an object-level not-found, would close the work while the recording still exists. Fix: give erasure its own check that accepts only an object-level not-found and returns null otherwise, and add a test that "Bucket not found" keeps the row open.
- **C-610-9: an owner folder with a placeholder entry can never complete.** `ownerFolderEmpty` counts every listed entry, including a Supabase `.emptyFolderPlaceholder`. Such a row retries every 6 h forever and logs an error after 10 attempts. Fix: filter the placeholder name.
- **C-610-10: a crash between recording the work and soft-deleting the note can leave a live note with no audio.** Author delete and hide are not one transaction. After such a crash the cron erases the audio of a note that is still live, so it fails to play until the member retries the delete. Fix: write the erasure row and the soft delete in one transaction, and call storage after commit.
- **C-610-11: the new coach lookup is callable directly by any signed-in database role.** `app.community_win_author_coach` is SECURITY DEFINER with EXECUTE granted to `authenticated`. If the `app` schema were ever exposed over the Data API, any signed-in role could resolve any user id to their coach. That is not exposed today, and the backend runs with BYPASSRLS. Consider a boolean matcher, or keep the `app` schema off the exposed schemas list.
- **C-610-12: a reopened erasure keeps its old failure count.** `recordVoiceErasures` re-opens a completed row without resetting `attempts`, so the first failure after the re-open backs off from the old count. Fix: reset `attempts` to 0 in the upsert's update.

### CI, merge and release
- **CI at this exact head:** all required checks pass (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, Schema parity). So do the migration-apply and reversibility jobs, actionlint and community-live-tests (99/99).
- **Main has moved.** Backend main is now f04289f9: #607 merged, touching `ci.yml`, `schema.prisma` and migration 20270212000000. `git merge-tree --write-tree origin/main 7a67fbef` is clean. 20270211 (this PR) sorts before 20270212 and 20270216, both already on main, so environments that already applied those will apply this one out of order. CI's forward-apply passing shows that works.
- **Operator:** update-branch, then require all checks green at the new head (I will review the seam on request).
- **Owner decision flagged by the builder:** account deletion now stops finalization (and retries next run) when the voice-note read or the erasure record fails. I concur and recommend accepting it, because it fails closed.
- **Voice notes:** FEATURE_COMMUNITY_VOICE_NOTES stays off until the mobile native build and the device pass.

I made no push, merge, dispatch or production action.

---

## mobile #314 @ 48d76d21476b99a486c0d129c1a0cf7b55d133f0 — APPROVE (A0 B0 C2)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5960733821

AUDIT Claude Opus 5.5 — growth-project-mobile#314 @ 48d76d21476b99a486c0d129c1a0cf7b55d133f0 — VERDICT: APPROVE

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is the T4 re-audit of fix round 5 (lane B-UGC-4), paired with backend #610. I read every earlier AUDIT comment: Sol RC at 4192ba9d (5957254228) and Opus RC at 4192ba9d (5957461031), which left B-314-7 and B-314-8 open. I read the delta a532b0b..48d76d21 in full: 11 files, +631/-37, with no package.json or lock change.

**A 0 · B 0 · C 2.**

### Merge purity
Merge a532b0b (parents 4192ba9d + main 2c17c241) has tree df4d8219, which is identical to `git merge-tree --write-tree` of its parents, so it is a pure merge. The head contains current mobile main 2c17c241.

### Prior findings, verified
- **B-314-7 (recorder start not fenced; permission rejections escape; audio mode not restored): CLOSED.**
  - `useVoiceRecorder.ts` adds a single-flight `startingRef` plus a `generationRef` fence. Unmount, `cancel()` and `reset()` bump the generation.
  - Unmount cancels whenever a start is in flight or a recording is live (`wasCapturing = startedAtRef || startingRef`).
  - A start that finishes after it was retired calls `recorder.cancel()` and touches no state or ticker.
  - Both permission reads, and `retryPermission`, are inside try. A failure goes to `fail(kind, err)`, which reports to Sentry with a request id and sets `{kind, reference}`.
  - `voiceAudio.ts` restores playback mode on a failed set-mode/prepare/record before rethrowing, and in `finally` on `stop()`. `cancel()` already restored it in `finally`.
  - `VoiceNoteComposer.tsx` shows specific copy for permission_check, start and stop, with Try again, the support email and the reference. There is no generic error, no exclamation mark and no emoji.
  - Tests: `useVoiceRecorderLifecycle.test.tsx` (held start then unmount, rejected permission, double start), `voiceAudio.test.tsx` (failed prepare and failed stop restore the mode through the default adapter fake), and `VoiceNoteComposer.test.tsx`.
- **B-314-8 (two Play taps orphan a handle): CLOSED.**
  - `VoiceNotePlayer.tsx` sets `loadingRef` to the load's generation synchronously, before `await port.load`. A second tap in the same frame returns early.
  - The control is disabled while loading, and `accessibilityState.disabled` matches.
  - When a handle is adopted, any different handle already adopted is unloaded.
  - A URL change or unmount ends the generation, so a late load is unloaded, never adopted.
  - The `finally` clears `loadingRef` only for its own generation.
  - I traced the same-frame double tap and reversed resolution order: one native load, nothing orphaned.
  - Tests: the `VoiceNotePlayer.test.tsx` B-314-8 cases (4), including two same-frame taps in an async act.
- **#610 round 5 contract:** `communityErrors.ts` maps `community.moderation.already_actioned` (the server's wording is shown as written, since it names the current action) and `community.moderation.changed`. Both explain what happened and say to pull down to refresh. `communityErrorsContract.test.ts` covers them.
- Earlier closures (B-314-2..6, C-314-4) are unchanged in this delta.

### C findings (optional)
- **C-314-9: Record can be silently ignored for a moment after Try again or Cancel.** `useVoiceRecorder.ts`: a `reset()`/`cancel()` during an in-flight start leaves `startingRef` true until that start settles, so an immediate re-tap of Record does nothing, with no visual cue. Consider exposing a `starting` state that shows a spinner on the record button.
- **C-314-10: resuming an already-loaded clip has no single-flight guard.** `VoiceNotePlayer.tsx`: two taps can call `play()` twice on the same handle. That is harmless (one handle), so this is noted only for completeness.

### CI and release
- **CI at this exact head:** Typecheck/lint/test, Analyze (javascript-typescript) and Analyze (actions) all pass.
- **Native build:** expo-audio is native, so voice notes need a new EAS build (OTA cannot deliver it).
- **Before FEATURE_COMMUNITY_VOICE_NOTES / EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES go on:** a real iOS and Android device pass covering record, play, report, coach Hide, permission denial, backgrounding during recording, and double-tap Play.
- **Pair gate:** backend #610 is approved at 7a67fbef and needs update-branch to main f04289f9 before merge.

I made no push, merge, dispatch or production action.

---

## backend #610 delta @ a98d08b589fec0d52128e6439e091b91134916c7 (update-branch, merge of main f04289f9) — APPROVE (A0 B0 C0 new; C-610-8..12 open for post-merge follow-up per operator)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5960838176

AUDIT Claude Opus 5.5 — growth-project-backend#610 @ a98d08b589fec0d52128e6439e091b91134916c7 — VERDICT: APPROVE

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is a T4 delta review of the operator's update-branch. It follows my APPROVE at 7a67fbef ([5960733421](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5960733421)). The head a98d08b5 is a merge of main f04289f9 (#607) into 7a67fbef.

**A 0 · B 0 · C 0 new.** The five Cs from my 7a67fbef verdict (C-610-8..12) stay open. Operator ruling: they go to a post-merge follow-up PR before launch.

### Purity (merge-tree + patch-ids)
- a98d08b5 has parents 7a67fbef and f04289f9, and tree 8df7869c. That is identical to `git merge-tree --write-tree 7a67fbef f04289f9`, so the merge adds no hand edits.
- The incoming side matches main: `git diff 7a67fbef a98d08b5` and `git diff 3bd6215b f04289f9` have the same stable patch-id, 2579c58c.
- The PR's own change is unchanged: `git diff 3bd6215b 7a67fbef` and `git diff f04289f9 a98d08b5` have the same stable patch-id, 8b0a2dac. What I approved at 7a67fbef is exactly what this head adds to main.

### Seam review
- **`.github/workflows/ci.yml` (T4 gate file).** Main (#607) and this PR touch separate places.
  - Main's changes, in `rls-live-tests` and `mwb-3-live-tests`: the onboarding-intake bootstrap/migration/grants step, `test/rls/onboarding-intake-rls.spec.ts`, and `test/onboarding-tenancy-fence.live.spec.ts`.
  - This PR's change: its own `community-live-tests` job, plus the one-line message-shape spec.
  - Main's steps are all present, nothing is removed or loosened, and no `continue-on-error` or condition changed.
  - `community-live-tests` runs `prisma migrate deploy` over the whole chain, so it now also applies 20270212 on a real Postgres.
- **`prisma/schema.prisma`.**
  - Main adds `ClientOnboardingIntake`, `ClientOnboardingIntakeRevision` and `ClinicProgramSet`, plus a User relation hunk at line 516.
  - This PR adds `CommunityWorkspaceBan` and `CommunityVoiceErasure`, plus CommunityWin, enum and User relation hunks at line 507.
  - The hunks do not overlap, and Schema parity at this head checks the merged result.
- **Migration order (20270211 vs 20270212 and 20270216).**
  - Production has applied 20270216 (`package_first_published_at`: `ALTER TABLE "CoachPackage"` only). #607's 20270212 is on main and may not be deployed yet.
  - So production applies 20270211 after 20270216. A fresh database (CI and the dry run) applies 0211 → 0212 → 0216.
  - The three migrations touch disjoint objects:
    - 0211 touches the community tables, `CommunityWin` policies and trigger, the `community_messages` CHECK and `CommunityModerationTargetType` values, and creates `app.community_win_*` and `public.community_win_guard_moderation`.
    - 0212 creates the onboarding tables and policies, plus `app.can_read_client_consultation` and `app.sub_coach_membership_head`.
    - 0216 alters only `CoachPackage`.
  - No function is replaced by two of them, no object is created in one and used in another, and 0211 does not touch `CoachPackage`. Both orders give the same schema.
  - `prisma migrate deploy` applies pending migrations by name and does not refuse an older pending one, so the production order is safe. The forward-apply and reversibility gates check this at the head.
  - One rollback note: 0211's `down.sql` prerequisites are unchanged (no open `community_voice_erasures` rows; re-home cohort-less comments first).

### CI at this exact head
All 10 required checks are SUCCESS: build-and-test (665 suites / 11,577 tests passed; 22 suites skipped, as on main), rls-floor-guard, rls-live-tests (now including #607's onboarding-intake RLS spec), mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, and Schema parity (merged schema vs the full migration chain).

Also SUCCESS: Forward migrations apply cleanly, New migrations reversible, actionlint, shellcheck, test-deploy-readiness, and community-live-tests (job at a98d08b5: 10 suites / 99 tests passed, 0 skipped, including community-wins-rls.live and community-message-shape.live). deploy-readiness-gate is skipped, as on every PR.

### Operator rulings recorded
- The account-deletion fail-safe is accepted.
- FEATURE_COMMUNITY_VOICE_NOTES stays off until a native EAS build and an iOS/Android device pass.
- C-610-8..12 go to a post-merge follow-up PR before launch.

I made no push, merge, dispatch or production action.

---

## Queue 3 (operator 13:26): mobile #329 re-audit + #332 (S-COACH-MOB-2)

## mobile #329 @ 83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa — BLOCK (A1 B0 C2)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5961048256

AUDIT Claude Opus 5.5 — growth-project-mobile#329 @ 83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa — VERDICT: BLOCK

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is the T4 re-audit after my BLOCK at 4071d0ce (5960028238), reading the fix-round comment 5960887111. I read the delta 4071d0ce..83ee0e46 in full: 12 files, +1162/-169, own commits 7ec0b2c and 83ee0e4.

**A 1 · B 0 · C 2.** The only thing left blocking is A-329-1, by construction: the Money page is in stacked #332. It closes on the #329 delta after #332 merges into this branch.

### Merge purity
Merge c57e380 (parents 4071d0ce + main 2c17c241) has tree 908666ca, which is identical to `git merge-tree --write-tree` of its parents, so it is a pure merge. This head contains current mobile main.

### Prior findings
- **A-329-1 (no Money page; the checklist opened the dead Earnings screen): NARROWED, still OPEN at this head.**
  - `CoachHomeCards.tsx:36-50` no longer routes to `CoachEarnings` (Invite before the first payment, Packages after). The early "Money" copy is gone (`errors.ts` CONNECT_NOT_CONFIGURED and ONBOARDING_COMPLETED; wizard step 5 body).
  - But the owner-required Money page, and retiring the Earnings and Business metrics routes, exist only in #332. Settings → Earnings on this head still opens the screen that calls the six 404 routes (pre-existing on main).
  - Closure: merge a dual-approved #332 here, then I review that delta.
- **B-329-1 (duplicate package on retry): CLOSED for its scope** (the key rotated after a successful create, then publish/bind failed, and a retry created a second package).
  - `FirstPackageForm.tsx:187-215` keeps `created` across retries, so a retry after a create the server answered never calls create again.
  - A create with no definitive answer (`pending`) is looked up first, using ids not seen before plus name, price and billing.
  - The key rotates only on a definitive 4xx, and changed inputs update the existing package.
  - Covered by `coachSetupRound2.test.tsx` (4 tests).
  - My residual is C-329-6, not B. Unlike AUD-SOL-5 I grade it C. Backend `packages.service.ts:146-169` creates every package as a draft (`published_at: null`), and the flow publishes only the package it adopted. So the one remaining interleaving produces an extra draft that clients cannot buy, not a second live package or a second charge. The operator can rule on the grade.
- **B-329-2 (untrue copy): CLOSED.** `errors.ts` CONNECT_NOT_CONFIGURED now says payouts are not switched on for the account, that the coach can finish the rest, where to connect later (Get paid on the Home checklist), and gives support plus a reference. No more "this version of the app".
- **B-329-3 (Sol: step-blob wire shape): CLOSED.** `coachSetupApi.ts:243-246` sends the flat body, and `stepBlob()` resumes both the flat shape and the legacy `{data}` shape (`CoachWizardNavigator.tsx` resume). There are backend-faithful round-trip tests.
- **B-329-4 (Sol: active account with requirements due): CLOSED.** `connectCopy.ts:100-123` covers it: "Stripe needs an update from you", the due items and deadline, and "Update details with Stripe", while keeping "Clients can pay you now".
- **C-329-1..4: CLOSED.**
  - Only live packages count (`isLivePackage`, with a draft "Make X live" action).
  - The client tick comes from `/coach/clients?status=all&take=1` (backend `coach.controller.ts:63-72` accepts both params). The shared link is only a hint.
  - Step 5 reads `loadSetupStatus` on mount.
  - Checklist read failures show specific copy, a reference and a retry, and unknown items are labelled "We could not check this just now".

### C findings (optional)
- **C-329-6: package create still has no idempotency on the server.**
  - Backend `POST /v1/coach/packages` (`packages.controller.ts:97-113`) ignores `Idempotency-Key`, so the client key is cosmetic and dedupe rests on the list lookup.
  - The remaining window: the device times out (`api.ts` 30 s, Fly cold start) while the server is still executing, the retry's list sees nothing, the retry creates, then the first insert commits. The result is one extra draft.
  - Fix (backend, additive): a coach-scoped idempotency key on create that replays the original row. Mobile already sends the key.
- **C-329-7: the "You have been paid" tick relies on #641's paid filter.** `setupStatus.ts` reads `/v1/coach/money/charges?status=paid&limit=1`, and at #641 563e3f80 `paid` still includes `chargeback_lost` (B-641-2). This is harmless for a "first payment happened" tick, but re-check once #641's fix round settles the meaning of `paid`.

### CI
At this exact head, Typecheck/lint/test, Analyze (javascript-typescript), Analyze (actions) and CodeQL all pass. The builder ran the targeted setup suites through heavy.sh (2 suites / 33 tests), and AUD-SOL-5 ran the same.

I made no push, merge, dispatch or production action.

---

## mobile #332 @ 61eea1159aa68835ef2269a4cb9e9d46cd2533f6 — REQUEST CHANGES (A0 B1 C4)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/332#issuecomment-5961048508

AUDIT Claude Opus 5.5 — growth-project-mobile#332 @ 61eea1159aa68835ef2269a4cb9e9d46cd2533f6 — VERDICT: REQUEST CHANGES

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is the first T4 audit of the coach Money page and Home Money card (S-COACH-MOB-2), stacked on #329 at 83ee0e46. I read the own diff 83ee0e46..61eea115 in full: 25 files, +3177/-1406, own commit 5db9082.

**A 0 · B 1 · C 4.** I checked the page against backend #641 at 563e3f80, and the summary-data assumptions are listed for #641's fix round.

### Merge purity
Merge 61eea11 (parents 5db9082 + #329 head 83ee0e46) has tree d52fc383, which is identical to `git merge-tree --write-tree` of its parents, so it is a pure merge.

### What is right
- Every amount comes from a live route, and each route exists with the shape the client parses:
  - `/v1/coach/money/{summary,charges,charges/:id,attention}` at #641 563e3f80 (`coach-money.controller.ts:29-110`, DTOs at `coach-money.service.ts:55-157`).
  - `/coach/connect/payouts` and `/coach/connect/metrics` on main (`coach-connect.service.ts:155-200,353-359`; payouts arrive in major units and `toPayout` converts them).
  - `POST /v1/connect/accounts/dashboard-link` on main (`connect.controller.ts:82`).
- The six 404 routes are gone. `coachEarningsApi`, `CoachEarningsScreen` and `CoachBusinessMetricsScreen` are deleted. `CoachEarnings` and `CoachBusinessMetrics` now `replace` to `CoachMoney`. Settings, Billing, Team profile and the Home checklist all open Money. `paymentsConnectPackages.test.ts:510-536` checks the source tree.
- Each section loads and fails on its own, with specific copy and a reference (`useSection`). There are offline banners, pull-to-refresh, an empty state that offers the setup or invite action, and attention items that open the client thread or Stripe update. The Payout settings link is validated with `assertStripeUrl`. The charges list resets on a filter change and pages with a sequence guard.

### B finding (must fix)
**B-332-1: after a period change, the previous period's money is shown under the new period's name.**
- `MoneyScreen.tsx:86-90` loads the summary through `useSection(..., [range])`. `useSection` deliberately keeps the last data across a reload and a failed reload.
- `MoneyScreen.tsx:272-288` shows the error only when `!s`, and passes the new `range` to `NetBlock`, which labels the hero, the change line and the breakdown with `RANGE_LABEL[range]` / `RANGE_COMPARE_LABEL[range]`.
- So when the coach taps Year to date and that load fails (offline, 5xx, a 400 window), the page states the 30-day net as the year-to-date net, compares it with "the same time last year", and shows no error. During any slow load it shows the same wrong pairing.
- Executed probe (`ops/evidence/AUD-OPUS-4-112/aud-opus4-332-probe.test.tsx`, through heavy.sh, against this head's code):
  - 30d loads $94.80; then the summary route fails and the coach taps YTD.
  - Rendered result: `LABEL: "Net to you, Year to date"`, `AMOUNT: $94.80`, `CHANGE: "Up $47.40 (100.0%) on the same time last year"`, `ERROR SHOWN: false`.
- Minimal fix:
  - Tag the summary with the range it was loaded for, e.g. the fetcher returns `{ range, summary }`.
  - Render the numbers only when `data.range === range`. Otherwise show the loader, or on failure the specific error with a retry, for the selected period. The offline banner may still offer the last loaded period under its own name.
  - Add a test for a failed and a slow period switch.

### C findings (optional)
- **C-332-1: active sub-coaches get a permanent 403 card on Home.**
  - `CoachHomeCards.tsx` mounts `MoneyHomeCard` (and #329's checklist) for every coach.
  - The Money and Connect routes are behind `NoActiveSubCoachGuard` (403 `sub_coach_billing_blocked`), so an active sub-coach sees a permanent "Only the coach who owns this practice can do that" card on Home.
  - Fix: hide both cards for active sub-coaches, or map that code to a quiet "Money is managed by your head coach".
- **C-332-2: dead code calling the old earnings route is left in the tree.**
  - `src/screens/coach/payments/CoachEarningsScreen.tsx` is still there and calls `coachPackagesApi.earnings()`. It is unreachable (not imported), and the source-tree test misses it because the route string differs.
  - Fix: delete the screen and the `earnings()` client.
- **C-332-3: an unknown payout status could be shown as the next payout.** `toPayout` (`coachMoneyApi.ts:352`) maps an unknown status to `"pending"`, so it can become "Next payout · On the way soon". Fix: map an unknown status to its own state, excluded from `nextPayout`.
- **C-332-4: no CSV export.** There is no coach CSV route on main or #641, so this is a product gap to track, not a client bug.

### Summary-data assumptions to re-check against #641's fix round (not findings on this PR)
- **Currency (B-641-3).**
  - The client reads one `summary.currency` and one `totals`, and #641 563e3f80 hard-codes `currency: 'usd'` (`coach-money.service.ts:312`).
  - If the fix makes totals per currency, `toSummary` must be changed to match. Do not sum across currencies or show a USD label on a mixed total.
  - #332 needs a delta review once #641's final shape lands.
- **Monthly recurring (B-641-4).** The "Monthly recurring" tile shows `recurring.mrr_cents` as sent. The cadence fix changes the value, not the client, but the test fixtures assume monthly-only plans.
- **Breakdown arithmetic.**
  - The "How we got there" rows (`moneyCopy.ts breakdownRows`) assume net = gross − processing − TGP fee kept − head-coach split kept − refunds (destination reversal) + team income.
  - With `foldTotals` (`coach-money.service.ts:206-250`) that only adds up if the application fee is **not** reversed on a refund (the OR-111-1 policy: TGP keeps its 2%). If #641 or #627 ever reverses the fee, the rows will not sum to net. Pin this with a backend test.
- **Paid includes chargeback_lost (B-641-2).** Charges filtered "Paid" and the first-payment tick rely on `PAID_WHERE`. Re-check once #641 reclassifies `chargeback_lost`.
- **Held from next sale.** It is feature-detected under 4 candidate names (`held_from_next_sale_cents`, `held_cents`, `open_balance.held_cents`, `open_balance.amount_cents`). Pin the one #627 ships and drop the rest.

### Verification
- CI does not run on stacked PRs.
- My runs through heavy.sh:
  - `npx jest --runInBand src/screens/coach/money src/__tests__/paymentsConnectPackages.test.ts`: 2 suites / 50 tests passed (`ops/evidence/AUD-OPUS-4-112/332-targeted.log`).
  - The B-332-1 probe above (`332-probe.log`).
- Others' runs:
  - AUD-SOL-5's run: 8 suites / 153 tests passed.
  - The builder reports `tsc --noEmit` exit 0.
- The full required checks must pass on #329 after #332 merges into it.

I made no push, merge, dispatch or production action.

---

## Queue 4 (operator 13:31): mobile #317 re-audit (S-WEAR-2 rounds 4 + 4b)

## mobile #317 @ 58c2d53fa061071e193e5e3b5f981209425e9e0c — APPROVE (A0 B0 C2)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995

AUDIT Claude Opus 5.5 — growth-project-mobile#317 @ 58c2d53fa061071e193e5e3b5f981209425e9e0c — VERDICT: APPROVE

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is the T4 re-audit after my RC at c7e35d84 (5940512410) and AUD-SOL-5's BLOCK at c7e35d84 (5939974918). The range read was c7e35d84..58c2d53:
- merge 54916fa (main 2c17c241);
- fix round 4, 0b733fb (34 files);
- fix round 4b, 58c2d53 (7 files, read in full).

**A 0 · B 0 · C 2.**

### Merge seam (54916fa)
This merge had conflicts, so it is not tree-equal to `merge-tree`. I reviewed the resolution against the conflicted merge-tree (138be84). There were 8 files; the resolution keeps both sides and adds nothing else:
- **`authActions.ts`:** the sign-out sweep keeps `ON_DEVICE_STATE_PREFIX` (this PR) and `LEGACY_DRAFT_PREFIX` plus `purgeConsultationDraft` (#310).
- **`ConnectProviderSheet.tsx`:** keeps the on-device import flow and #323's `'disabled'` Health Connect case.
- **`healthConnectSyncService.ts`:** keeps #323's `assertAndroidHealthConnectEnabled` and this PR's scoped progress store. The removed `secureStorage` import was the legacy cursor store, which this PR retires.
- **`onDeviceConnect.ts`:** keeps #323's type-only `react-native-health-connect` import (lazy load for builds without Health Connect) plus this PR's permission builders.
- **`expected-env.json`:** adds `EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS` (default off), as #319's env-manifest guard requires.
- **Deleted:** the test for the hook this PR removed.
- **Build guard test:** updated to the new `syncHealthConnect(scope)` signature.

### Prior findings
- **A-317-1 r3 (Sol: account captured only after the permission dialog): CLOSED.**
  - `handleOnDeviceConnect` (`ConnectProviderSheet.tsx:244-275`) awaits `beginOnDeviceConnect()` before `connectOnDeviceProvider()`, i.e. before the native prompt.
  - `beginSessionFence` (`sessionFence.ts:118-125`) captures the auth generation synchronously, then reads the user, so an auth event during that read also yields null.
  - The fence is carried into `connectOnDevice` (`onDeviceSync.ts:234-258`). There `assertCurrent()` runs before register, again before `recordLocalAuthorization`, and before every read, request and progress save in the HK and HC services. The scope's `userId` comes from the fence.
  - The sheet cancels the fence on close, provider change and unmount (`:136-152`), and drops a stale continuation (`attemptRef.current !== fence`).
  - Sol's interleaving (A taps; B signs in while the prompt is up; the prompt resolves granted) now raises `session_changed` at the first `assertCurrent`, before any registration. `ConnectProviderSheet.accountSwitch.test.tsx` drives the real sheet, orchestrator, fence and storage with a deferred prompt, covering A→B, sign-out and same-account re-login. All three end with zero registrations, zero local grants and zero reads or posts, and there is a positive control.
  - The dormant `samsungHealthSyncService` uploader, which posted with no fence, is removed. The fenced HK and HC services are the only ingest posters left.
- **B-317-2 (Sol: an incomplete import closed as a success): CLOSED.**
  - `handleImportOutcome` (`:194-227`) closes only when `complete`.
  - A partial import keeps the sheet open with a truthful message and Continue import (`resumeOnDeviceImport`, the same fence, and a local grant required for the same connection). All reads failing gives Try again.
  - The refresh when Health opens surfaces partial and failed results.
  - Tests: `ConnectProviderSheet.test.tsx:196,247` and the WearablesShell partial-refresh case.
- **B-317-5 (mine: an on-device source silently stops syncing after sign-out): CLOSED.**
  - The Connections row shows "Not syncing here" with Reconnect when the server row is connected but this phone holds no local Connect for the person (`isConnectedButNotSyncingHere`), including a local Connect bound to an older connection. Health shows the same note.
  - The check reads app storage only and makes zero native reads before the tap.
  - Tests: `ConnectionsScreen.test.tsx:319,339`.
- **C-317-4 (mine: no confirm on Disconnect): CLOSED in 4b.**
  - `DisconnectConfirmDialog` names the source and what stops, says "Data already shared stays with your coach", and makes Cancel the first (default) action.
  - Failures get coded copy (offline, 401, 404 already, 403, 429, 5xx/unknown with a reference and support).
  - Tests: `ConnectionsScreen.test.tsx:212-227` and others.
- **Least privilege (4b): VERIFIED.**
  - `app.json` drops `READ_TOTAL_CALORIES_BURNED`, `READ_BASAL_BODY_TEMPERATURE` and `READ_HEALTH_DATA_IN_BACKGROUND`.
  - `healthPlatformConfig.test.ts` now asserts that the declared `android.permission.health.*` set equals the set derived from `HEALTH_CONNECT_RECORD_TYPES`. Runtime requests (`buildReadPermissions`) come from the same list.
- **Health Connect clinic-only: VERIFIED.** `eas.json` sets `TGP_ANDROID_HEALTH_CONNECT="1"` for clinic only. In preview and production `app.config.js` strips the Health Connect permissions and plugins.

### C findings (optional)
- **C-317-5: two Samsung-era permissions remain with nothing reading them.**
  - With Health Connect enabled (clinic), the manifest still declares `com.samsung.android.hardware.sensormanager.permission.READ_ADDITIONAL_HEALTH_DATA` (`app.config.js:5-38`, `app.json`) and `android.permission.ACTIVITY_RECOGNITION`.
  - After the uploader removal, no app code reads Samsung data or activity recognition. `src/services/health/samsungHealth/*` is imported only by its own tests.
  - Fix: drop both permissions and the unimported Samsung client before the Play health declaration, or justify them in it.
- **C-317-6: release ordering (carries C-317-3).**
  - FEATURE_WEARABLES_INGEST_POST stays off until backend #608 (the account-deletion fan-out over the wearable tables) is deployed.
  - `EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS` stays unset everywhere (no box-2 check).
  - A new clinic binary is required (native permissions and plugins; never OTA), followed by the owner's iPhone and Android device pass.
  - The Play Health Connect declaration must be filed before reviewed tracks.

### Residuals accepted as documented
- **Check-then-send:** the fence is checked before each request, but not atomically with the send. The server bounds this: every sample carries the starting account's connection id, and backend #623 returns 403 for a connection the JWT user does not own.
- **Session change during register:** this can leave an empty connected row for the new account (no grant, nothing read). That row shows "Not syncing here" plus Reconnect.

### Evidence
- **CI at this exact head:** Typecheck/lint/test, Analyze (javascript-typescript), Analyze (actions) and CodeQL all pass.
- **Local run (heavy.sh, `--runInBand`, at 58c2d53):** 7 suites / 119 tests passed (`ops/evidence/AUD-OPUS-4-112/317-targeted.log`). The suites:
  - `ConnectProviderSheet.accountSwitch`
  - `ConnectProviderSheet`
  - `ConnectionsScreen`
  - `WearablesShell`
  - `healthPlatformConfig`
  - `onDeviceSync`
  - `sessionFence`
- **Not run:** no device test and no prebuild.

I made no push, merge, dispatch or production action.

---

## HANDOFF FOR AGENT 113

Lane AUD-OPUS-4 (Claude Opus 5.5 audit lens), operator 112. Clean stop at 13:34 PDT order. All assigned items audited; no new items accepted.

| PR | Exact head | Verdict | A/B/C | Comment id |
|---|---|---|---|---|
| backend #641 | 563e3f80f913dd2a2b4efa5099d5e5944dabb19d | REQUEST CHANGES | 0/2/4 | 5960027984 |
| mobile #329 (r1) | 4071d0ce40d2c451addf1540654c2b16e5f66395 | BLOCK | 1/2/4 | 5960028238 |
| backend #610 | 7a67fbef28a3b23343d69675746078df7192a4d9 | APPROVE | 0/0/5 | 5960733421 |
| mobile #314 | 48d76d21476b99a486c0d129c1a0cf7b55d133f0 | APPROVE | 0/0/2 | 5960733821 |
| backend #610 (delta, update-branch) | a98d08b589fec0d52128e6439e091b91134916c7 | APPROVE | 0/0/0 new | 5960838176 |
| mobile #329 (r2) | 83ee0e46a81a1a24f8d8a5696cc3dfe92ce6ddfa | BLOCK | 1/0/2 | 5961048256 |
| mobile #332 | 61eea1159aa68835ef2269a4cb9e9d46cd2533f6 | REQUEST CHANGES | 0/1/4 | 5961048508 |
| mobile #317 | 58c2d53fa061071e193e5e3b5f981209425e9e0c | APPROVE | 0/0/2 | 5961091995 |

NOT AUDITED: none.

Open threads for 113:
- #332 B-332-1 (period switch shows the previous period's money under the new label, no error on failure; executed probe in ops/evidence/AUD-OPUS-4-112/). After the fix: #332 delta audit; then merge #332 into #329 and audit that #329 delta to close A-329-1.
- #329 B-329-1: this lens grades the timeout residual C (late duplicate is an unpublished draft; backend packages create ignores Idempotency-Key). AUD-SOL-5 (5960983148) holds it as B. Operator ruling needed.
- #641 is mid fix round (B-641-3 currency, B-641-4 MRR cadence, B-641-1/2 from this lens). #332's summary-data assumptions are listed in 5961048508; re-check #332 against #641's final shape.
- #610: C-610-8..12 go to a post-merge follow-up PR before launch (operator ruling). Voice-notes flag off until native EAS build + device pass.
- #317: C-317-5 (unused Samsung / ACTIVITY_RECOGNITION permissions) before the Play health declaration; FEATURE_WEARABLES_INGEST_POST only after backend #608 deploys.

Worktrees: the only one this lane created (wt/aud-opus4-317) is removed. Evidence: ops/evidence/AUD-OPUS-4-112/ (probe test, configs, logs). Comment bodies: ops/aud-opus4-112/.
