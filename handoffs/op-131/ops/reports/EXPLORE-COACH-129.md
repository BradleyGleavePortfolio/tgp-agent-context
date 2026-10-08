# EXPLORE-COACH-129 — an independent coach's first two weeks, trying to break it (auditor, agent 129, read-only)

Status: DONE 16:33 PDT 10-07 (operator 16:24: credits short, finished early). Model: Claude Opus 5.5.
No PRs, no comments, no pushes, no production sign-in, no data created.
Code: mobile main a1be6fb2 (wt/RO-mobile), backend main c3324d4a (wt/RO-backend); production = backend deploy 26 87f4489b (the
backend files cited below are unchanged since 2026-05/09, so production runs the same code).
Labels: REPRODUCED = shown by a throwaway jest render test in my own worktree (wt/EXPLORE-COACH-129-mobile, branch
agent129/explore-coach-129, never pushed) or a read-only GET/SELECT. CODE-ONLY = traced from code (file:line, handler, API path).
Map: /home/user/workspace/ops/reports/EXPLORE-COACH-129-map.md (root/session states, tabs, Settings rows, core flows with break
points, 94-route table with FORGOTTEN marks).

## B list

### REPRODUCED
| ID | Grade | User story (one sentence) | Steps | Evidence |
|---|---|---|---|---|
| B-1 | B (App Store 2.1 crash) | A coach, or the App Store reviewer signed in as the review coach, opens Settings and taps Subscription > "Billing & access", and the whole app is replaced by "Something went wrong / Try Again". | Settings tab > Billing & access | See below |

B-1 evidence:
- Handler: src/screens/coach/SettingsScreen.tsx:270 handleOpenBilling -> navigate('Billing') -> CoachBillingScreen
  (src/navigation/CoachNavigator.tsx:522). The row is unconditional on every build (SettingsScreen.tsx:622 BillingSection ->
  src/screens/coach/settings/BillingSection.tsx:40-50).
- API: GET /coach/billing/status (mobile src/services/api.ts:1145, raw `api.get<CoachBillingStatus>`, no mapping). Backend answers
  `{ status: 'unprovisioned' | <stripe status>, plan_tier, current_period_end, cancel_at_period_end, trial_end }`
  (backend src/billing/mobile-coach-billing.controller.ts:43-64, unchanged since 2026-05-30). Mobile reads `state`
  (api.ts:1103), so `STATE_COPY[s.state]` is undefined and `copy.tone` throws (src/screens/coach/CoachBillingScreen.tsx:229-234).
  The only boundary is the app-level one (App.tsx:249): full-app error screen.
- Why CI is green: the existing tests mock the mobile's own assumed shape `{ state }`
  (src/screens/coach/__tests__/CoachBillingScreenAndroidPolicy.test.tsx:57, CoachBillingScreenUrlGuard.test.tsx:53).
- Proof: wt/EXPLORE-COACH-129-mobile/src/screens/coach/__tests__/EXPLORE_COACH_129_billingShape.test.tsx, 4/4 pass (iOS and Android
  store settings, `unprovisioned` and `active`): `TypeError: Cannot read properties of undefined (reading 'tone')`.
- Same finding as AUD-COACH-WEEK1-129 B1 (found independently, same root cause); use its job CF-COACH-BILLING-129, do not launch a
  second job. Addition for that job: the owner removed coach tiers 10-06 19:23, so removing the row is the smaller alternative.
- Smallest fix (T1 mobile, about 40 lines + test): the owner removed coach subscription tiers (10-06 19:23), so remove the
  "Subscription > Billing & access" row (rule 1/2: it describes a product that no longer exists), and map the backend shape in
  coachBillingApi.getStatus (`status` -> `state`, `unprovisioned` -> `none`) with `STATE_COPY[s.state] ?? STATE_COPY.none`.

### CODE-ONLY
None.

## U list

### REPRODUCED
| ID | Grade | User story | Steps | Evidence |
|---|---|---|---|---|
| U-1 | U (false copy offline) | A coach on a weak gym connection opens a client's Timeline and reads "No activity in the last 30 days" (Weekly: "No data in the last 7 days") for a client who logged every day, and may chase the client for nothing. | Clients > client > Timeline or Weekly tab, wifi off or API error | useClientDetailData.ts:217-220 (loadTimeline catch: console.error only, "empty state is acceptable") and :343-346 (loadWeeklySummaries); `if (data.error) return;` :139 also silent; TimelineTab.tsx:115-119, WeeklySummaryTab.tsx:20-24 render the empty claim. API GET /coach/clients/:id/timeline (api.ts:851-858). Proof: wt/EXPLORE-COACH-129-mobile/src/screens/coach/client-detail/__tests__/EXPLORE_COACH_129_timelineOffline.test.tsx 2/2: network error -> "No activity in the last 30 days" / "No data in the last 7 days", loadError=null, no error text. Fix: a timelineError/weeklyError state with "This client's activity could not be loaded. Pull to refresh." and a retry; never the empty line on failure. |
| U-6 | U (feature gap, dormant link; duplicate of AUD-COACH-WEEK1-129 U1 and EXPLORE-CLIENT-129 R2) | A coach who wants to text a prospect a checkout link for a package has none: the app never mints a share token, so "Share link" never shows, and if one existed the link opens a raw 404 JSON page on iPhones. | Settings > Packages > a package | Read-only GETs 16:27-16:31: `GET https://app.trygrowthproject.com/p/explore129probe` -> 404 application/json "Cannot GET /p/explore129probe" (router no-route 404; backend has only `p/:coachSlug/:pageSlug`, landing-pages.public.controller.ts:258); production AASA paths only `/join/*`, `/invite/*`, `/billing/update-card` (well-known.controller.ts:116-131). Mobile builds `https://app.trygrowthproject.com/p/<token>` (utils/packageShare.ts:9-14), button gated on shareToken (CoachPackageEditScreen.tsx:906); no mobile call to POST /v1/coach/packages/:id/share-link; backend's own share_url is `${STOREFRONT_BASE_URL}/join/<token>` (share-link.service.ts:248). Not a B today only because the button is hidden; AUD-COACH-WEEK1-129 routed it as NEW (polish 5). If links are switched on: add `/p/*` to the AASA and a bare `/p/:token` HTML landing, or switch the app to the server's share_url. |
### CODE-ONLY
| ID | Grade | User story | Steps | Evidence (file:line, handler, API) |
|---|---|---|---|---|
| U-2 | U (owner decision 10-07 unmet; money) | A coach whose client quits archives the client, sees "X has been archived.", and the client's monthly plan keeps charging because the coach has no cancel, pause or refund tool and no per-client payments view. | Clients > client > archive icon | ClientDetailScreen.tsx:304-321 handleToggleArchive -> POST /coach/clients/:id/archive -> backend coach.service.ts archiveClient (sets User.archived_at only; billing untouched). No coach route cancels/pauses/refunds a ClientPurchase: only client-billing.controller.ts:207 (client cancel), payment-ops.controller.ts:325/552 (admin dunning cancel, admin refund). Money charges filter by status only (coachMoneyApi.ts:128); ClientDetail has no payments section. Owner 10-07 (op-128 HANDOFF section 9): "coaches must be able to see payments per client, refund, pause and cancel." Interim copy fix: archive confirmation says "Archiving does not stop their plan's payments. To end the plan, the client cancels in Membership or support can cancel it." |
| U-3 | U (data lost on back; developer copy) | A coach edits Roman's AI workout draft for a client, swipes back by habit, and every edit is gone without a prompt; the footer meanwhile shows "Model used: <model> · 1234+567 tokens · $0.03". | Clients > client > AI section > workout draft > edit > back | AIWorkoutDraftScreen.tsx:321 back = navigation.goBack() with no dirty check (the dirty prompt exists only on Approve, :217-243); provenance footer :441-445; reject copy "Tell the system why this draft was rejected." :276. API PATCH/POST /coach/ai/drafts/:id (coachAiApi.editDraft / approveDraft / rejectDraft). Approve itself is fenced server-side (backend coach-ai.service.ts:441-488). FORGOTTEN screen. |
| U-4 | U (data lost on back/close) | A coach writes a long broadcast to all clients, the app is backgrounded or they swipe back, and the text is gone. | Settings/Clients > Broadcasts > new | BroadcastComposerScreen.tsx:78 body is component state only; no draft persistence, no beforeRemove guard; send itself is safe (Idempotency-Key :85-101, disabled while pending :333-337). FORGOTTEN screen. |
| U-5 | U (neglected feature) | A coach looking for "Meal templates" cannot find them: the screen exists but nothing opens it. | none | CoachNavigator.tsx:408-411 registers CoachMealTemplates; no navigate('CoachMealTemplates') anywhere in src (only tests). The screen also uses a FAB (doctrine ban), raw `err.message` alerts (CoachMealTemplatesScreen.tsx:137-141) and 12 pt-style pills. Owner decision needed: wire it from the meal-plan tab or delete it. |

## C one-liners
- C (edge, deferred to 10k clients): package price has no upper bound (utils/currency.ts:57, maxLength 12; packages.dto.ts:19-24 no @Max;
  amount_cents Int). Above $999,999.99 the package saves and publishes but checkout fails at Stripe (checkout.service.ts:1228); above
  $21.4M the int32 column overflows.
- C (edge, deferred to 10k clients): AI meal-plan approve is not claim-fenced (coach-ai.service.ts:419-429) like the workout path; a
  same-instant double request could materialise two meal plans. Mobile disables the button while approving.
- C (edge, deferred to 10k clients): a refresh that fails on a network error signs the coach out (api.ts handleRefreshFailure :272),
  dropping any unsaved form.
- C (edge, deferred to 10k clients): coach wizard gate fails open to the dashboard when GET /coach/onboarding errors (RootNavigator.tsx:744).
- C: a push tapped while signed out is dropped (pushTapRouter.ts:240, by design); after sign-in the coach lands on Clients.
- C: coach timeline weight rows always say lbs (useClientDetailData.ts:165 `Weight: ${w.weight_lbs} lbs`).
- C: ClientDetail error alerts are titled "Error" with backend text (ClientDetailScreen.tsx:318).

## Checked and holding (break points tried, no finding)
Coach sign-up wizard (resumes at server step), Stripe Connect (GetPaidPanel: kill mid-onboarding -> saved status + "Continue";
sign-out dismisses the sheet), package create/edit (durable create intent survives a kill; Idempotency-Key; saveInFlight),
invite codes (Idempotency-Key, busy guards), bulk email invites (list kept on failure), programs create/assign (Idempotency-Key,
`running` + key, allow_repeat refusal), AI workout approve (server claim fence), coach messaging (text kept until success,
clientMessageId resend), nudge (sending guard), Money screens (friendly errors, sub-coach block), package subscribers (adapter maps
the live snake_case shape), team profile (shape matches backend team.service.ts:46-50), unread badge (shape matches
messaging.service.ts:1204), coach account deletion (cancels client subscriptions in both directions, account-deletion.billing.ts:47-73).

## FORGOTTEN features (coach screens no 10-07 merge or report touched; full list in the map, 58 routes)
Deepest risk first: CoachBillingScreen (B-1), client-detail Timeline/Weekly tabs (U-1), AIWorkoutDraftScreen (U-3),
BroadcastComposerScreen + CoachBroadcastsScreen (U-4), CoachMealTemplatesScreen (U-5, orphan), MoneyScreen / MoneyCharges / MoneyCharge
(read-only, no refund/pause/cancel: U-2), CoachConnectScreen, CoachPackageContentsScreen, CoachPackageSubscribersScreen,
CoachInvitesScreen, BulkInviteScreen, CoachCodesScreen, InviteCodesScreen (legacy), InviteCodeRedeemersScreen, ProgramEditor / Form /
Assign / DayPicker / Packages / History, PendingAiDraftsScreen, ClientInsightScreen, ClientConsultationScreen, CoachMacrosReviewScreen,
RiskBoard / ClientRiskDetail, BloodworkReviewQueue, CoachBookingInbox, CoachAvailabilityEditor, CoachAppointmentTypes, CoachTimeOff,
CoachBookingOptions, CoachBriefScreen, CoachSetupScreen, CreditPackCheckoutScreen (hidden on store builds), SupportInboxScreen,
ImportDataScreen, CrossPillar (Both pillars) screens, CoachHomeScreen ("Dashboard", unreachable).

## Proposed fix jobs (file-disjoint, each under 400 lines)
| Job | Model / tier | Files | Content |
|---|---|---|---|
| (none: use CF-COACH-BILLING-129 from AUD-COACH-WEEK1-129) | | | B-1. Do not launch EC-BILLING-129 below if CF-COACH-BILLING-129 is queued. |
| EC-BILLING-129 (fallback only) | GPT-6.1 Sol, T1 mobile | src/screens/coach/settings/BillingSection.tsx, src/services/api.ts (coachBillingApi.getStatus only), src/screens/coach/CoachBillingScreen.tsx, src/screens/coach/__tests__/CoachBillingScreenAndroidPolicy.test.tsx (+ a new backend-shape test), src/screens/coach/README.md | B-1: remove the row (parity table cites rule 1/2: coach tiers removed 10-06 19:23), map `status`->`state`, fallback copy. Failing-first: the backend-shape test above. About 60 lines. |
| EC-TIMELINE-129 | GPT-6.1 Sol, T1 mobile | src/screens/coach/client-detail/useClientDetailData.ts (loadTimeline, loadWeeklySummaries), TimelineTab.tsx, WeeklySummaryTab.tsx, ClientDetailScreen.tsx (2 props), tests | U-1: error state + retry instead of the empty claim. About 120 lines. |
| EC-AIDRAFT-129 | GPT-6.1 Sol, T1 mobile | src/screens/coach/AIWorkoutDraftScreen.tsx, its test | U-3: beforeRemove guard when dirty ("Discard edits?"), drop the model/tokens/$ footer, reword the reject prompt. About 80 lines. |
| EC-BROADCAST-129 | GPT-6.1 Sol, T1 mobile | src/screens/coach/broadcasts/BroadcastComposerScreen.tsx, its test | U-4: leave guard when the body is not empty (and optional AsyncStorage draft). About 60 lines. |
| EC-ARCHIVE-COPY-129 | GPT-6.1 Sol, T1 mobile | src/screens/coach/ClientDetailScreen.tsx (handleToggleArchive copy only), test | U-2 interim: confirmation states that payments continue and who can end them. About 40 lines. Conflicts with EC-TIMELINE-129 on ClientDetailScreen.tsx: run after it. |
| (already routed) | | CF-COACH-PAY-BE-128 / COACH-PAY-M-129 | U-2 proper (payments per client, refund, pause, cancel). No new job. |
| EC-MEALTPL-129 (owner decision) | GPT-6.1 Sol, T1 mobile | CoachMealTemplatesScreen.tsx (+ an entry in client-detail/MealPlanTab.tsx, or delete the route) | U-5. Recommended default: delete the orphan route now (rule 2), keep the API. |

## Not fixed (needs operator)
- B-1: make sure CF-COACH-BILLING-129 (AUD-COACH-WEEK1-129) lands before the 23:00 iOS cut. Until then the App Store reviewer can
  crash the app from coach Settings.
- U-2: coach refund/pause/cancel is already routed (CF-COACH-PAY-BE-128 / COACH-PAY-M-129); only the interim client-archive copy
  (EC-ARCHIVE-COPY-129) is new and needs no owner decision.
- U-5: owner decision wire-or-delete (recommended default: delete the orphan route).

## Progress log
- 16:05 read _COMMON_128 (129 overrides), JOBS129 EXPLORE-129, SoT A1/A2 overrides/A6.10, op-128 HANDOFF section 9.
- 16:14 coach navigator mapped; FORGOTTEN list drafted; mobile deps READY, linked into my worktree.
- 16:19 B-1 REPRODUCED (Billing & access crash).
- 16:25 U-1 REPRODUCED (Timeline/Weekly offline false empty). Map written.
- 16:27 report rewritten per operator 16:24 (credits short).
- 16:31 package share link 404 reproduced by read-only GETs; 16:32 downgraded to U-6 (dormant: no token is ever minted, button hidden),
  duplicate of AUD-COACH-WEEK1-129 U1 / EXPLORE-CLIENT-129 R2. B-1 also matches AUD-COACH-WEEK1-129 B1.
- 16:33 booking inbox spot-checked (busy guards, paged queries): holding. Wrapped up per operator 16:24.

## Scope traced
Coach root/session states, tabs, all Settings rows and their targets (map), sign-up wizard resume, Stripe Connect panel, packages
create/edit/share link, invite codes and bulk email invites, programs create/assign, AI workout and meal-plan drafts, coach messaging,
broadcasts, nudge, client archive, client detail Timeline/Weekly/check-in review, Money screens, team profile, unread badge, coach
account deletion billing, booking inbox (spot check), push-tap and deep-link handling, session refresh.
Not checked (credits): Roman for coaches (RomanChat in Settings), availability/appointment types/time off editors, AI builder assign
to client, ClientConsultation, CoachMacrosReview, PendingAiDrafts, RiskBoard, Bloodwork queue, large-roster performance.

## PRs
None (explorer; read-only). Throwaway tests live only in wt/EXPLORE-COACH-129-mobile (branch agent129/explore-coach-129, never pushed):
src/screens/coach/__tests__/EXPLORE_COACH_129_billingShape.test.tsx (4/4), 
src/screens/coach/client-detail/__tests__/EXPLORE_COACH_129_timelineOffline.test.tsx (2/2).

## HANDOFF
- Proven B: B-1 Billing & access crash (REPRODUCED; same as AUD-COACH-WEEK1-129 B1 -> land CF-COACH-BILLING-129 before the 23:00
  iOS cut; removing the row is the smaller alternative because coach tiers are gone).
- New Us unique to this lane: U-1 Timeline/Weekly false "No activity" offline (REPRODUCED, job EC-TIMELINE-129), U-3 AI workout
  draft edits lost on back + model/tokens/$ footer (EC-AIDRAFT-129), U-4 broadcast text lost on back/close (EC-BROADCAST-129),
  U-5 Meal templates orphan route (owner: wire or delete; default delete), U-2 client archive leaves payments running with no
  hint (interim copy EC-ARCHIVE-COPY-129; the real tools are already routed as CF-COACH-PAY-BE-128 / COACH-PAY-M-129).
- Duplicates, no new job: U-6 package share link (AUD-COACH-WEEK1-129 U1, EXPLORE-CLIENT-129 R2).
- Files: this report, ops/reports/EXPLORE-COACH-129-map.md, ops/lanes128/notify/EXPLORE-COACH-129.txt.
- Nothing was pushed, merged, deployed, commented or created; no production sign-in. Production was only read with three
  unauthenticated GETs (/p/<fake>, /join/<fake>, AASA/assetlinks, public join JSON with a fake token).
