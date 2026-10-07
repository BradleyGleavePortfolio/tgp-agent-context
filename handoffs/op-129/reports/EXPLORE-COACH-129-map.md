# EXPLORE-COACH-129 map — every coach pathway from code (independent coach persona)

Code: mobile main a1be6fb2, backend main c3324d4a (read-only worktrees). Built 16:05-16:35 PDT 10-07, agent 129.
FORGOTTEN = the screen file was not changed by any mobile merge on 10-07 AND no report in ops/reports names it.

## 1. Root and session (src/navigation/RootNavigator.tsx)
| State | What mounts | Notes / break points |
|---|---|---|
| loading | nothing (splash) | push taps held as `unknown` (pushTapRouter.ts:188) |
| unauthenticated | AuthNavigator | linking prefixes tgp://, com.growthproject.app://, https://app.trygrowthproject.com (RootNavigator.tsx:136); accept-invite and reset links replayed after sign-out (:400-:420, :555-:610) |
| coach_wizard | CoachWizardNavigator (5 steps) | GET /coach/onboarding is_complete=false; 404 -> POST /coach/onboarding/start (RootNavigator.tsx:714-750). Network/5xx fails OPEN to the dashboard (:744). Resume step from GET progress (CoachWizardNavigator.tsx:702-754) |
| coach / owner | CoachNavigator | owner role skips the wizard (:709) |
| push tap while signed out | dropped, never held (pushTapRouter.ts:240) | after sign-in the coach lands on Clients, not the tapped target (by design: wrong-account safety) |
| session expiry | api.ts:191-300 refresh mutex; refresh failure (incl. network error on refresh) -> signOut once (handleRefreshFailure :272) | unsaved form state is lost on that sign-out (C) |

Coach push targets (pushTapRouter.ts:93-120): Messages, NotificationCenter, NotificationPreferences, CoachBookingInbox, CoachBrief (flag),
CreditPackCheckout (store builds -> SettingsHome), CoachCommunityEvents (flags). Unknown -> NotificationCenter. Backend sends coach
actionScreen only for bookings (booking.emitter.ts:549), trials (trial-notice.service.ts:442) and CoachBrief (coach-brief.scheduler.ts:500).
Coach emails with links: coach-invites-client.hbs (client-facing), weekly-digest.hbs (app_url, prefs_url), dunning-v2-coach.hbs (no link).
coach-onboarding-welcome.hbs has console_url/invite_link but nothing sends it.

## 2. Tabs (CoachNavigator.tsx:669-806)
| Tab | Label | Mounted when | Initial |
|---|---|---|---|
| CommandCenter | Overview | always | only in mock builds (`__USING_MOCK_DATA`, :688) |
| ClientsStack | Clients | always | YES for real coaches |
| Templates | Programs (mwbPrograms on in eas production/clinic) | always | |
| Messages | (no label prop; badge = GET /coach/messages/unread-count every 30 s + on foreground, :640-666) | always | |
| TeamStack | Team | head coach whose roster has a sub-coach (:683) | |
| CommunityStack | Community | featureFlags.coachCommunity | |
| SettingsStack | Settings | always | |

## 3. Coach Settings rows (src/screens/coach/SettingsScreen.tsx, touched 10-07 by m#457 / m#507)
Featured coach (owner only) · Active Clients · Import my records (flag) · Invite Codes -> ClientsStack/InviteCodes · Bulk invite clients ->
BulkInvite · Invites & email -> CoachInvites · Packages -> CoachPackagesList · Payouts (Stripe Connect) -> CoachConnect · Money -> CoachMoney
· Workout Builder -> ClientsStack/CoachWorkoutBuilder · Booking Inbox · Availability · Appointment Types · Time Off · Booking options ·
Team / Gym profile -> CoachTeamProfile · **Billing & access -> Billing (CRASHES, B-1)** · Notification preferences · Roman ->
RomanChat · Blocked Users · Your conversations with Roman · Both pillars view · Support -> SupportInbox · Help centre · Delete account.

## 4. Core coach flows: handler -> API -> break points checked
| Flow | Screen / handler | API | Close mid-flow | Offline save | Double tap | Back mid-save | Result |
|---|---|---|---|---|---|---|---|
| Sign-up wizard | CoachWizardNavigator steps 1-5 | /coach/onboarding/*, package create/publish | resumes at server step (:702) | per-step error | intent + key | n/a | OK |
| Stripe Connect | GetPaidPanel.openStripe (components/coach/setup/GetPaidPanel.tsx) | POST onboarding link, GET status, refresh | relaunch reads saved status; "Continue" re-mints link | friendly SetupNotice + retry | `opening` disables | auth session dismissed on sign-out | OK |
| Packages create/edit | CoachPackageEditScreen.handleSave :323 | POST/PATCH /v1/coach/packages (Idempotency-Key) | durable create intent survives kill (:356-:392) | edits kept, coded copy | saveInFlight ref | n/a | OK |
| Package price | parseDollarsToCents (utils/currency.ts:57), maxLength 12 | amount_cents Int, no @Max (packages.dto.ts:19-24) | | | | | C: > $999,999.99 fails only at checkout (Stripe cap), > $21.4M overflows int32 |
| Invite codes | CoachCodesScreen create/rotate/revoke | /coach/codes (Idempotency-Key) | | banner copy | busy/busyId | | OK |
| Email invites | BulkInviteScreen.doSubmit :146; CoachInvitesScreen resend/revoke | /coach/invite-codes/bulk, invites | list kept | "Your email list is still here" | disabled | | OK |
| Programs | ProgramForm/Editor/Assign | /coach/programs (Idempotency-Key) | server-saved per step | describeProgramFailure | running + key | | OK |
| AI workout draft | AIWorkoutDraftScreen approve :246 | POST /coach/ai/drafts/:id/approve (claim fence coach-ai.service.ts:441) | unsaved edits lost on back (no guard, :321) | "Approve failed" + errorMessage | fenced server-side | | U-3 |
| AI meal-plan draft | AIMealPlanDraftScreen | approveDraft MEAL_PLAN path not fenced (coach-ai.service.ts:419-429) | | | C (same-instant) | | C |
| Messaging | ClientMessagesScreen.handleSend :215 | v2 send with clientMessageId | text kept until success | "Message not sent", resend same key | sending | | OK |
| Broadcasts | BroadcastComposerScreen.onSubmit | POST /coach/broadcasts (Idempotency-Key) | draft text lost (no draft, no leave guard) | mutation error | isPending | | U-4 |
| Nudge | ClientDetailScreen.sendNudge :267 | POST nudge | modal text lost | inline error | nudgeSending | | OK |
| Archive client | ClientDetailScreen.handleToggleArchive :304 | POST /coach/clients/:id/archive (sets archived_at only, coach.service.ts archiveClient) | | "Error" + errorMessage | archiveBusy | | U-2 (billing untouched, no cancel/refund tool) |
| Billing & access | CoachBillingScreen | GET /coach/billing/status | | | | | **B-1 crash** |
| Money | MoneyScreen (+Charges, Charge) | /v1/coach/money/* | | friendly errors | | | OK, read-only: no refund/pause/cancel (owner 10-07 wants them) |
| Meal templates | CoachMealTemplatesScreen | /coach/meal-templates | | raw err.message | | | orphan route: nothing navigates to it (U-5) |

## 5. Route table (auto-generated; entries = files that name the route)
| Stack | Route | Screen file | Lines | Touched 10-07 | Reports | Mark | Entry points (first 4) |
|---|---|---|---:|---|---:|---|---|
| ClientsStack | ClientsList | screens/coach/ClientsListScreen.tsx | 611 | yes | 1 |  | ExtensionPairingPanel.tsx |
| ClientsStack | ClientDetail | screens/coach/ClientDetailScreen.tsx | 656 | yes | 2 |  | CoachHomeScreen.tsx, types.ts, AIMealPlanDraftScreen.tsx, ClientsListScreen.tsx |
| ClientsStack | ClientWearablePrompts | screens/community/CommunityWearablePromptsScreen.tsx | 516 | no | 0 | FORGOTTEN | ClientDetailScreen.tsx |
| ClientsStack | ClientMessages | screens/coach/ClientMessagesScreen.tsx | 628 | no | 2 |  | MessagesScreen.tsx, CommandCenterScreen.tsx, ClientInsightScreen.tsx, MoneyChargeScreen.tsx |
| ClientsStack | InviteCodes | screens/coach/CoachCodesEntry.tsx | 74 | no | 0 | FORGOTTEN | MessagesScreen.tsx, CoachHomeScreen.tsx, CoachInvitesScreen.tsx, CoachInboxV2.tsx |
| ClientsStack | RiskBoard | screens/coach/RiskBoardScreen.tsx | 400 | no | 0 | FORGOTTEN | CoachHomeScreen.tsx, ClientsListScreen.tsx |
| ClientsStack | ClientRiskDetail | screens/coach/ClientRiskDetailScreen.tsx | 342 | no | 0 | FORGOTTEN | - |
| ClientsStack | BloodworkReviewQueue | screens/coach/BloodworkReviewQueueScreen.tsx | 317 | no | 0 | FORGOTTEN | - |
| ClientsStack | Dashboard | screens/coach/CoachHomeScreen.tsx | 785 | no | 2 |  | README.md |
| ClientsStack | CoachMacrosReview | screens/coach/CoachMacrosReviewScreen.tsx | 355 | no | 0 | FORGOTTEN | ClientDetailScreen.tsx |
| ClientsStack | ClientConsultation | screens/coach/ClientConsultationScreen.tsx | 423 | no | 0 | FORGOTTEN | ConsultationSummaryCard.tsx |
| ClientsStack | CoachWorkoutBuilder | screens/coach/CoachWorkoutBuilderScreen.tsx | 2090 | yes | 2 |  | SettingsScreen.tsx, ClientDetailScreen.tsx, ProgramsLibraryScreen.tsx, ProgramEditorScreen.tsx |
| ClientsStack | CoachMealTemplates | screens/coach/CoachMealTemplatesScreen.tsx | 401 | no | 1 |  | - |
| ClientsStack | CoachBulkInvite | screens/coach/CoachBulkInviteScreen.tsx | 318 | no | 0 | FORGOTTEN | InviteCodesScreen.tsx |
| ClientsStack | BulkInvite | screens/coach/BulkInviteScreen.tsx | 608 | no | 0 | FORGOTTEN | SettingsScreen.tsx, CoachCodesScreen.tsx, CoachInvitesScreen.tsx |
| ClientsStack | CoachInvites | screens/coach/CoachInvitesScreen.tsx | 636 | no | 0 | FORGOTTEN | CoachCodesScreen.tsx, SettingsScreen.tsx |
| ClientsStack | CoachAvailabilityEditor | screens/coach/CoachAvailabilityEditorScreen.tsx | 406 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| ClientsStack | CoachBookingInbox | screens/coach/CoachBookingInboxScreen.tsx | 503 | no | 0 | FORGOTTEN | pushTapRouter.ts, SettingsScreen.tsx |
| ClientsStack | CoachAppointmentTypes | screens/coach/CoachAppointmentTypesScreen.tsx | 297 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| ClientsStack | CoachTimeOff | screens/coach/CoachTimeOffScreen.tsx | 204 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| ClientsStack | CoachBookingOptions | screens/coach/CoachBookingOptionsScreen.tsx | 365 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| ClientsStack | FeaturedCoachEditor | screens/coach/featured/FeaturedCoachEditorScreen.tsx | 404 | yes | 0 |  | SettingsScreen.tsx |
| ClientsStack | CoachBroadcasts | screens/coach/broadcasts/CoachBroadcastsScreen.tsx | 236 | no | 0 | FORGOTTEN | BroadcastsEntry.tsx |
| ClientsStack | CoachBroadcastComposer | screens/coach/broadcasts/BroadcastComposerScreen.tsx | 357 | no | 0 | FORGOTTEN | CoachBroadcastsScreen.tsx |
| ClientsStack | CoachCommunityModeration | screens/community/CoachCommunityModerationScreen.tsx | 482 | no | 0 | FORGOTTEN | CoachCommunityHomeScreen.tsx, CommunityReportsEntry.tsx |
| ClientsStack | CoachCommunityPostDetail | screens/community/CoachCommunityPostDetailScreen.tsx | 237 | no | 0 | FORGOTTEN | CoachCommunityModerationScreen.tsx |
| ClientsStack | AIWorkoutDraft | screens/coach/AIWorkoutDraftScreen.tsx | 900 | no | 0 | FORGOTTEN | CoachAiSection.tsx |
| ClientsStack | AIMealPlanDraft | screens/coach/AIMealPlanDraftScreen.tsx | 861 | yes | 1 |  | CoachAiSection.tsx |
| ClientsStack | ClientInsight | screens/coach/ClientInsightScreen.tsx | 392 | no | 0 | FORGOTTEN | CoachAiSection.tsx |
| ClientsStack | PendingAiDrafts | screens/coach/PendingAiDraftsScreen.tsx | 430 | no | 0 | FORGOTTEN | ClientDetailScreen.tsx |
| ClientsStack | NotificationCenter | screens/notifications/NotificationCenterScreen.tsx | 472 | yes | 2 |  | HomeHeaderActions.tsx, pushTapRouter.ts |
| ClientsStack | NotificationPreferences | screens/notifications/NotificationPreferencesScreen.tsx | 516 | yes | 7 |  | SettingsScreen.tsx, NotificationCenterScreen.tsx, pushTapRouter.ts |
| ClientsStack | InviteCodeRedeemers | screens/coach/InviteCodeRedeemersScreen.tsx | 195 | no | 0 | FORGOTTEN | InviteCodesScreen.tsx, CoachCodesScreen.tsx |
| ClientsStack | ContactView | screens/messaging/ContactView.tsx | 280 | yes | 3 |  | MessagesScreen.tsx, ClientMessagesScreen.tsx |
| SettingsStack | SettingsHome | screens/coach/SettingsScreen.tsx | 918 | yes | 13 |  | pushTapRouter.ts |
| SettingsStack | Billing | screens/coach/CoachBillingScreen.tsx | 504 | no | 1 |  | StripeSetupBanner.tsx, CoachPackageEditScreen.tsx, SettingsScreen.tsx |
| SettingsStack | TrustCenter | screens/TrustCenterScreen.tsx | 699 | yes | 2 |  | SettingsScreen.tsx, SettingsScreen.tsx |
| SettingsStack | CoachBrief | screens/coach/CoachBriefScreen.tsx | 558 | no | 1 |  | pushTapRouter.ts, COACH_BRIEF_README.md, CoachHomeScreen.tsx, CoachHomeCards.tsx |
| SettingsStack | AdminControlRoom | screens/coach/AdminControlRoomScreen.tsx | 252 | no | 0 | FORGOTTEN | - |
| SettingsStack | RomanChat |  | 0 | no | 0 | FORGOTTEN | MoreScreen.tsx, HomeHeaderActions.tsx, SettingsScreen.tsx |
| SettingsStack | SupportInbox | screens/support/SupportInboxScreen.tsx | 264 | no | 2 |  | MessagesScreen.tsx, SettingsScreen.tsx, useOpenSupport.ts, EmailVerifiedScreen.tsx |
| SettingsStack | BothPillars | screens/coach/cross-pillar/CrossPillarNavigator.tsx | 113 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| SettingsStack | DeleteAccount | screens/settings/DeleteAccountScreen.tsx | 983 | yes | 4 |  | SettingsScreen.tsx, TrustCenterScreen.tsx, RomanAiConsentScreen.tsx, SettingsScreen.tsx |
| SettingsStack | RomanConversations | RomanConversationsScreen | 0 | no | 0 | FORGOTTEN | RomanConversationsButton.tsx, SettingsScreen.tsx, RomanAiConsentScreen.tsx |
| SettingsStack | RomanConversation | screens/settings/RomanConversationScreen.tsx | 426 | no | 1 |  | RomanConversationsScreen.tsx |
| SettingsStack | DataExport | screens/settings/DataExportScreen.tsx | 1021 | yes | 3 |  | SettingsScreen.tsx, SettingsScreen.tsx |
| SettingsStack | ImportData | screens/coach/ImportDataScreen.tsx | 394 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| SettingsStack | CoachBusinessMetrics | screens/coach/money/MoneyRedirect.tsx | 37 | no | 0 | FORGOTTEN | - |
| SettingsStack | CoachTeamProfile | screens/coach/CoachTeamProfileScreen.tsx | 290 | no | 1 |  | SettingsScreen.tsx |
| SettingsStack | CoachConnect | screens/coach/payments/CoachConnectScreen.tsx | 274 | no | 0 | FORGOTTEN | SettingsScreen.tsx |
| SettingsStack | CoachSetup | screens/coach/setup/CoachSetupScreen.tsx | 96 | no | 0 | FORGOTTEN | CoachHomeCards.tsx, MoneyScreen.tsx, CoachTeamProfileScreen.tsx |
| SettingsStack | CoachPackagesList | screens/coach/payments/CoachPackagesListScreen.tsx | 374 | yes | 0 |  | CoachPackageEditScreen.tsx, CoachHomeCards.tsx, SettingsScreen.tsx, MoneyScreen.tsx |
| SettingsStack | CoachPackageEdit | screens/coach/payments/CoachPackageEditScreen.tsx | 1246 | yes | 1 |  | CoachPackagesListScreen.tsx |
| SettingsStack | CoachPackageSubscribers | screens/coach/payments/CoachPackageSubscribersScreen.tsx | 330 | no | 0 | FORGOTTEN | CoachPackageEditScreen.tsx |
| SettingsStack | CoachPackageContents | screens/coach/payments/CoachPackageContentsScreen.tsx | 784 | no | 0 | FORGOTTEN | CoachPackageEditScreen.tsx |
| SettingsStack | CoachMoney | screens/coach/money/MoneyScreen.tsx | 1244 | no | 0 | FORGOTTEN | CoachTeamProfileScreen.tsx, CoachHomeCards.tsx, SettingsScreen.tsx, MoneyRedirect.tsx |
| SettingsStack | CoachMoneyCharges | screens/coach/money/MoneyChargesScreen.tsx | 217 | no | 0 | FORGOTTEN | MoneyScreen.tsx |
| SettingsStack | CoachMoneyCharge | screens/coach/money/MoneyChargeScreen.tsx | 252 | no | 0 | FORGOTTEN | MoneyScreen.tsx, MoneyChargesScreen.tsx |
| SettingsStack | CoachEarnings | screens/coach/money/MoneyRedirect.tsx | 37 | no | 0 | FORGOTTEN | - |
| SettingsStack | BlockedUsers | screens/settings/BlockedUsersScreen.tsx | 262 | yes | 3 |  | SettingsScreen.tsx, SettingsScreen.tsx |
| SettingsStack | CreditPackCheckout | GatedCreditPackCheckoutScreen | 0 | no | 0 | FORGOTTEN | AIBudgetMount.tsx, pushTapRouter.ts |
| TeamStack | TeamManagement | screens/coach/TeamManagementScreen.tsx | 427 | no | 2 |  | - |
| TeamStack | SubCoachDetail | screens/coach/SubCoachDetailScreen.tsx | 455 | no | 1 |  | TeamManagementScreen.tsx |
| TeamStack | ClientReassign | screens/coach/ClientReassignModal.tsx | 288 | no | 1 |  | SubCoachDetailScreen.tsx |
| Tab | CommandCenter | screens/coach/command-center/CommandCenterScreen.tsx | 183 | no | 0 |  | MoneyBack.tsx |
| Tab | ClientsStack | ClientsStackNavigator | 0 | no | 0 |  | ExtensionPairingPanel.tsx, pushTapRouter.ts, MessagesScreen.tsx, CoachHomeScreen.tsx |
| Tab | Templates | navigation/ProgramsStackNavigator.tsx | 72 | no | 0 |  | - |
| Tab | Messages | screens/coach/MessagesScreen.tsx | 286 | no | 3 |  | HomeHeaderActions.tsx, dropRow.tsx, ClientPackagesScreen.tsx, MessagesScreen.tsx |
| Tab | TeamStack | TeamStackNavigator | 0 | no | 0 |  | CoachBriefScreen.tsx |
| Tab | CommunityStack | navigation/CoachCommunityNavigator.tsx | 109 | no | 0 |  | pushTapRouter.ts |
| Tab | SettingsStack | SettingsStackNavigator | 0 | no | 0 |  | AIBudgetMount.tsx, StripeSetupBanner.tsx, useOpenSupport.ts, CoachHomeScreen.tsx |
| Stack | ProgramsLibrary | ProgramsLibraryScreen | 0 | yes | 0 |  | - |
| Stack | ProgramEditor | ProgramEditorScreen | 0 | no | 0 | FORGOTTEN | ProgramFormScreen.tsx, ProgramEditorScreen.tsx, ProgramsLibraryScreen.tsx |
| Stack | ProgramForm | ProgramFormScreen | 0 | no | 0 | FORGOTTEN | ProgramFormScreen.tsx, ProgramEditorScreen.tsx, ProgramsLibraryScreen.tsx |
| Stack | ProgramDayPicker | ProgramDayPickerScreen | 0 | no | 0 | FORGOTTEN | ProgramDayPickerScreen.tsx, ProgramEditorScreen.tsx |
| Stack | ProgramAssign | ProgramAssignScreen | 0 | no | 0 | FORGOTTEN | ProgramAssignScreen.tsx, ProgramEditorScreen.tsx |
| Stack | ProgramPackages | ProgramPackagesScreen | 0 | no | 0 | FORGOTTEN | ProgramEditorScreen.tsx, ProgramPackagesScreen.tsx |
| Stack | ProgramHistory | ProgramHistoryScreen | 0 | no | 0 | FORGOTTEN | ProgramEditorScreen.tsx, ProgramHistoryScreen.tsx |
| Stack | CoachWorkoutBuilder | screens/coach/CoachWorkoutBuilderScreen.tsx | 2090 | yes | 2 |  | ClientDetailScreen.tsx, SettingsScreen.tsx, ProgramsLibraryScreen.tsx, ProgramEditorScreen.tsx |
| Stack | SupportInbox | screens/support/SupportInboxScreen.tsx | 264 | no | 2 |  | MessagesScreen.tsx, SettingsScreen.tsx, EmailVerifiedScreen.tsx, CreateAccountScreen.tsx |
| CoachCommunityStack | CoachCommunityHome | screens/community/CoachCommunityHomeScreen.tsx | 352 | no | 0 | FORGOTTEN | - |
| CoachCommunityStack | CoachCommunityInbox | screens/community/CoachCommunityInboxScreen.tsx | 756 | no | 0 | FORGOTTEN | CoachCommunityHomeScreen.tsx |
| CoachCommunityStack | CoachCommunityCohorts | screens/community/CoachCommunityCohortsScreen.tsx | 367 | no | 0 | FORGOTTEN | CoachCommunityHomeScreen.tsx |
| CoachCommunityStack | CoachCommunityCohortDetail | screens/community/CoachCommunityCohortDetailScreen.tsx | 536 | no | 0 | FORGOTTEN | CoachCommunityCohortsScreen.tsx |
| CoachCommunityStack | CoachCommunityPostDetail | screens/community/CoachCommunityPostDetailScreen.tsx | 237 | no | 0 | FORGOTTEN | CoachCommunityModerationScreen.tsx |
| CoachCommunityStack | CoachCommunityModeration | screens/community/CoachCommunityModerationScreen.tsx | 482 | no | 0 | FORGOTTEN | CoachCommunityHomeScreen.tsx, CommunityReportsEntry.tsx |
| CoachCommunityStack | CoachCommunityEvents | screens/community/CoachCommunityEventsScreen.tsx | 1133 | no | 0 | FORGOTTEN | CoachCommunityHomeScreen.tsx, pushTapRouter.ts |
| CoachCommunityStack | CoachCommunityWearablePrompts | screens/community/CommunityWearablePromptsScreen.tsx | 516 | no | 0 | FORGOTTEN | - |
| Stack | PracticeSelection | screens/coach/cross-pillar/PracticeSelectionScreen.tsx | 261 | no | 0 | FORGOTTEN | CrossPillarNavigator.tsx |
| Stack | CrossPillarHome | screens/coach/cross-pillar/CrossPillarHomeScreen.tsx | 487 | no | 0 | FORGOTTEN | CrossPillarNavigator.tsx |
| Stack | CrossPillarClients | screens/coach/cross-pillar/CrossPillarClientsListScreen.tsx | 365 | no | 0 | FORGOTTEN | CrossPillarNavigator.tsx, CrossPillarHomeScreen.tsx |
| Stack | CrossPillarClientDetail | screens/coach/cross-pillar/CrossPillarClientDetailScreen.tsx | 530 | no | 0 | FORGOTTEN | CrossPillarClientsListScreen.tsx, CrossPillarNavigator.tsx, CrossPillarAssignmentsScreen.tsx |
| Stack | CrossPillarMessages | screens/coach/cross-pillar/CrossPillarMessagesScreen.tsx | 242 | no | 0 | FORGOTTEN | CrossPillarNavigator.tsx, CrossPillarHomeScreen.tsx |
| Stack | CrossPillarAssignments | screens/coach/cross-pillar/CrossPillarAssignmentsScreen.tsx | 215 | no | 0 | FORGOTTEN | CrossPillarNavigator.tsx, CrossPillarHomeScreen.tsx |