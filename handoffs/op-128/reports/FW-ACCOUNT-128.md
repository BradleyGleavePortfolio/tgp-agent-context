# FW-ACCOUNT-128 — first-week audit: account and settings (auditor, read-only)

Auditor: Claude Opus 5.5 (FW-AUD-128 instance), agent 128, 2026-10-07 ~14:35-15:20 PDT. No code, no PRs, no comments.
Code read at mobile main **8d92dc99** (newer than RO-mobile d0875d26; includes merged m#481 DES-S2 Settings regroup and m#496 Edit profile)
and backend main **c7caffff**, via detached read-only worktrees `/home/user/workspace/wt/FW-ACCOUNT-128-{mobile,backend}`.
Live public pages checked with plain GET (no auth): /privacy, /terms, /consumer-health-privacy, /help, /help/contact,
/help/delete-account, /help/support, /help/faq all 200 with the right titles; `/api/system/trust-meta` read.

## Scope traced
Client "You" tab -> More -> Profile and Settings (`src/screens/client/ProfileScreen.tsx`, `SettingsScreen.tsx`), change password modal
(`src/utils/supabaseAuth.ts`), sign out (`src/services/authActions.ts:316`), Delete account (`src/screens/settings/DeleteAccountScreen.tsx`
+ backend `src/account-deletion/*`), My data (`DataExportScreen.tsx` + backend `src/data-export/*`), Blocked users
(`BlockedUsersScreen.tsx`, backend `messages-safety` + `community/safety`, same `UserBlock` table), units (no setting; `PreferencesScreen`
has no entry point), Support (`src/screens/support/SupportInboxScreen.tsx`, Crisp + email fallback), Trust & Privacy
(`src/screens/TrustCenterScreen.tsx`, `trustCenterLinks.ts`, `src/lib/legalLinks.ts`). States: with coach / coachless; memory switch is FW-ROMAN.

Open PRs touching my files (checked heads): none touch ProfileScreen, SettingsScreen, TrustCenter, DeleteAccount, DataExport,
BlockedUsers or SupportInbox. m#507 (0cd0e8ee) touches settings/NotificationPreferencesScreen + settings/README (FW-NOTIF area);
m#504 (68494bce) touches password-recovery screens (FW-ONB). Profile "Day 7 of 30" and the exclusivity privacy line are already fixed on main
(e0ba7662), so not re-reported.

## (1) B list
- **None.** Deletion (14-day grace, re-auth, Stripe subscriptions cancelled at finalize, honest "stays active until then"), export
  (private bucket, 5-minute links, prod fails closed without secret), sign out (push token cleared, device unregistered), blocks
  (one shared table, so community blocks also list) and every legal link all work and say true things. Nothing below reaches the item-1 list.

## (2) U list
- **U1 (highest) Profile shows "Not set" for data the client already gave.** `ProfileScreen.tsx:~120-136` reads legacy names
  (`current_weight`, `target_weight`, `dob`, `diet_type`, `gym_membership`, `primary_goal`, `calorie_target`...), but `/auth/me` returns the raw
  `UserProfile` row (`current_weight_lbs`, `target_weight_lbs`, `date_of_birth`, `dietary_pattern`, `has_gym_membership`, `goal_type`,
  `macro_target_*`; backend `auth.service.ts:825`, schema `UserProfile`). A client who finished onboarding sees Current weight, Target weight,
  Date of birth, Goal, Diet and Equipment as "Not set" and all Daily Targets as "--" (TDEE has no column at all); Sex shows the raw enum
  "Prefer_not_to_say", Activity shows raw "moderate". The completion line uses the normaliser and can disagree with the rows.
  Fix: map through the existing `resolveProfileFields` (`src/lib/profileCompletion.ts:89`) plus label maps; read targets from `macro_target_*`;
  drop the TDEE row when there is no value.
- **U2 Trust & Privacy "Who can see your data" is not state-driven.** `TrustCenterScreen.tsx:538` says "Your coach — your consultation answers,
  logs, check-ins and connected health data" for coachless clients and for clients who turned sharing off in Coach sharing. Fix: coachless ->
  omit; with coach -> "Your coach — what you share in Coach sharing" (owner-coach: say the account sees logs, as ProfileScreen already does).
- **U3 Trust & Privacy shows invented security facts.** `TrustCenterScreen.tsx:453-466` "Last security update" comes from a hard floor
  (`2026-04-25`, live trust-meta; LAST_SECURITY_DEPLOY_AT unset) so it reads "5 months ago"; "Audit policy Version v1.0" means nothing to a client;
  offline it shows the same canned values (`:343-350`). Fix: keep only the encryption line; remove the other two rows and the canned fallback.
- **U4 Terms of Service is not reachable after sign-up.** Only CreateAccount and the community gate link it; Settings/Trust links list Privacy,
  Consumer Health and Help (`trustCenterLinks.ts:30-54`). Fix: add a Terms of Service entry (`TERMS_URL`, live 200).
- **U5 Screens name Settings rows that do not exist.** DataExport says "open Request my data" (`DataExportScreen.tsx:193`, also 170/251/263);
  Delete account says "Settings under Data & Privacy" (`DeleteAccountScreen.tsx:662-663`); Trust alert says "Open Privacy in Settings"
  (`TrustCenterScreen.tsx:363`). The row is "My data" in "Privacy and data". Fix: use the real path; make the Delete account line tap through to DataExport.
- **U6 Export note contradicts the grace period.** `DataExportScreen.tsx:848-849` "Once deletion is confirmed your data cannot be recovered"
  — deletion can be cancelled for 14 days. Fix: "When the deletion grace period ends your data cannot be recovered."
- **U7 Change password is weaker and rawer than sign-up.** `SettingsScreen.tsx:71-93` checks only 8 characters while sign-up/reset require
  upper case, number and symbol (`CreateAccountScreen.tsx:447-451`, `ResetPasswordScreen.tsx:57-64`); Supabase errors are shown raw
  (`supabaseAuth.ts:38`). Fix: reuse the reset rule set and map errors to plain copy.
- **U8 Blocked users copy.** `BlockedUsersScreen.tsx:56` "Pull to retry" (no pull-to-refresh; a Retry button exists); `:85` generic
  "Something went wrong. Please try again."; `:144` "from a conversation" though community blocks also land here. Fix copy only.
- **U9 Settings notification switches fail silently.** `SettingsScreen.tsx:158-171` flips the switch, swallows a failed save; values come from
  local AsyncStorage defaults (`useSettings.ts:21-24`), not the server. Fix: revert + one-line error on failure. (Cross-area FW-NOTIF owns the model.)
- **U10 Title case / calm rules on account screens.** "Change Password", "Reset Onboarding", "Sign Out", "Meals Per Day", "Daily Check-in",
  "Blocked Users" (`SettingsScreen.tsx:96,116,213,254,272,278,306,415,488`), "Live Support"/"Open Support Chat" (`SupportInboxScreen.tsx:104,145`),
  "Security Status"/"What You Can Do"/"Full Transparency"/"Export Requested" (TrustCenter), "Personal Info"/"Daily Targets"/"Sign Out" (Profile).
- **U11 "Reset Onboarding" says nothing about what it keeps.** `SettingsScreen.tsx:95-113` restarts setup with "This will restart your profile
  setup"; re-answering recalculates targets server-side. Fix: label "Redo profile setup" + one sentence that logs and coach plans are kept.
- **U12 Help page names a tab that does not exist.** backend `src/public-pages/help-pages.html.ts:665` "open the profile tab" — the tab is
  labelled "You". Fix: "open the You tab".

## C one-liners
- C (edge, deferred to 10k clients): sign-out drops unsynced offline workout rows (`authActions.ts:367-372`).
- C (edge, deferred to 10k clients): `gp_client_settings` is one device-wide key, not per user (`useSettings.ts:5`).
- C (edge, deferred to 10k clients): password change does not ask for the current password (phone-in-hand only).
- C: About shows a literal "v1.0.0" (`SettingsScreen.tsx:477`); true today, read from expo-constants later.

## (3) Dead-button table (client, mobile main 8d92dc99)
| Screen | Element | Result |
|---|---|---|
| Settings | Back, Change password, Appearance (both light, stated), Haptics, Biometric, Reset onboarding, Delete account, Sign out | all wired |
| Settings | Meals per day, Water goal steppers | saved (server + local); water used by WaterTracker; meals read only by Roman context |
| Settings | Daily check-in, Meal reminders, Fasting alerts, Weekly summary | wired; failure silent (U9) |
| Settings | Notification preferences, Trust & Privacy, Coach sharing, Blocked users, My data, Roman and AI, Support, Tutorial | all navigate to registered routes |
| Profile | Settings, Report, Widgets, Learn, Edit, each row -> EditProfile, Sign out | all wired; row values wrong (U1) |
| Trust & Privacy | Request data export, Delete account, Privacy Policy, Consumer Health policy, Help centre, copy address/email | all wired; links live 200 |
| Delete account | confirm field, password/Apple/Google re-auth, Keep my account, Sign out, Try again | wired |
| My data | Request, Download (browser), Request new, Check again, Go back | wired |
| Blocked users | Unblock, Retry | wired; "Pull to retry" text has no gesture (U8) |
| Support | Open chat (Crisp) / Email support / Report a problem by email | wired; unavailable state honest |
| Missing | Change email; Units; Terms of Service after sign-up | no control exists (NEW / U4) |

## (4) First-week polish (ranked)
1. FIX — Profile shows the client's real saved values and targets (U1). Biggest trust hit in week one.
2. FIX — Trust & Privacy says true, state-driven things: coach line by sharing state, no invented security date, Terms link (U2, U3, U4).
3. FIX — One vocabulary for the Settings path across Delete, My data and Trust; Delete account links straight to My data (U5, U6).
4. FIX — Change password: sign-up rules, plain errors, sentence case; Settings sentence case pass (U7, U10, U11).
5. FIX — Settings notification switches revert and say so on failure (U9).
6. NEW — Change email. Recommended default for launch: a "Change email" row in Account that opens the support email prefilled
   ("Email support to change the email you sign in with"); self-serve email change later as a T4 auth job.
7. FIX — Blocked users and Support copy (U8, U10).
8. NEW — Units (kg/lb, ml/fl oz). Recommended default: not for launch; keep lbs / fl oz and always print the unit (FW-BODY owns units).
   Also NEW — tell the coach when a client deletes: recommended default no notification at launch (client simply leaves the roster at finalize).

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs m#504/m#507; each under 400 lines)
| Job | Files (+ their tests) | Tier | Model | Scope |
|---|---|---|---|---|
| FWA-PROFILE-128 | `src/screens/client/ProfileScreen.tsx`, `src/screens/client/__tests__/ProfileScreen.*.test.tsx` | T2 | GPT-6.1 Sol | U1 + Profile title case; read via `resolveProfileFields`, `macro_target_*`, label maps; failing-first test with a server-shaped profile row; parity table |
| FWA-TRUST-128 | `src/screens/TrustCenterScreen.tsx`, `src/screens/trustCenterLinks.ts`, their tests | T3 (privacy copy) | Claude Opus 5.5 | U2, U3, U4, TrustCenter part of U5 and U10 |
| FWA-DATA-COPY-128 | `src/screens/settings/DataExportScreen.tsx`, `src/screens/settings/DeleteAccountScreen.tsx` (line 660-664 block only), `src/screens/settings/BlockedUsersScreen.tsx`, `src/screens/support/SupportInboxScreen.tsx`, their tests | T2 | Claude Opus 5.5 (touches deletion screen) | U5, U6, U8, Support part of U10; Delete account "My data" line becomes a link; no logic change |
| FWA-SETTINGS-128 | `src/screens/client/SettingsScreen.tsx`, `src/screens/client/settings/__tests__/*` | T2 | GPT-6.1 Sol | U7 (reuse the reset rule set; map Supabase errors), U9 (revert + error), U10, U11; keep DES-S2 groups and parity test |
| FWA-HELP-128 (backend) | `src/public-pages/help-pages.html.ts`, `test/*help*` | T1 | GPT-6.1 Sol | U12 one line; not in open b#850 (trust-pages.html.ts) |

## Cross-area findings (one line each, for the operator)
- FW-NOTIF: Settings notification switches show local defaults, not server state, and a failed save is silent (`SettingsScreen.tsx:158-171`).
- FW-BODY: no units preference anywhere; `PreferencesScreen` Units control has no entry point (open m#507 touches it).
- FW-COACH: Trust & Privacy coach line ignores Coach sharing state (fix lives in FWA-TRUST-128).

## Not fixed (needs operator)
- Owner decision N1 (change email row, default: support-email row now), N2 (units, default: not for launch), N3 (coach told on client
  deletion, default: no). Everything else is ready to launch as the five jobs above.

## HANDOFF
- Audit complete; read-only. Report: this file. Notify: `/home/user/workspace/ops/lanes128/notify/FW-ACCOUNT-128.txt`.
- Read-only worktrees left in place: `/home/user/workspace/wt/FW-ACCOUNT-128-mobile` (8d92dc99), `/home/user/workspace/wt/FW-ACCOUNT-128-backend` (c7caffff), detached.
- A builder should re-check line numbers on current main before editing; U1 is the one to launch first.
