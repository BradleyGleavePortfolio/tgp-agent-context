Tier: T2
Why: Reorganizes the client Settings surface without changing any service operation or adding navigation steps.
T4 trigger scan: none; existing auth, biometric verification, consent, data export, deletion and sign-out implementations remain unchanged.
T3 trigger scan: none; private Settings presentation, no shared theme or backend contract changes.
Bounded T1: NO; integrated rendered parity and conditional section visibility need validation.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 128
Acceptance evidence: failing-first seven-group inventory test; rendered action parity; legacy check-in/appearance tests; updated legacy heading fixture; CI lint/typecheck/test.
Promotion triggers: any necessary change to auth, consent, PII access, account deletion, payments or backend contracts goes to the operator.

## What changes for coaches/clients
Part 2 of merged #477: clients keep every existing row and one-tap destination in seven quiet visible groups on one scrollable Settings screen. In order: Account, Training and food, Notifications, Privacy and data, Roman, Support, About. There is no drill-down, accordion or removed pathway.

The tutorial is a client-private flat row within Support, preserving the same feature gate, store actions and parent Home navigation without a separate filled Tutorial block. The shared component and coach screen are untouched.

## Routes/actions before -> after
All destination/effect values stay unchanged. Group placement changes only.

| Label before -> after (unchanged) | Destination or effect before -> after (unchanged) | New group |
|---|---|---|
| Back | `navigation.goBack()` | Header |
| Name, Email, initial | Current account data or existing empty-name fallback | Account |
| Change Password | Existing password modal | Account |
| Delete account | `DeleteAccount` | Account |
| Appearance: Light, System | Same persisted appearance choice, both use light; no Dark option | Account |
| Haptics enabled | `hapticsEnabled` local preference | Account |
| Biometric unlock | Same capability gate, native verification and opt-in persistence | Account |
| Reset Onboarding / Cancel / Reset | Existing confirmation, profile update, local flag removal and auth event | Account |
| Sign Out / Cancel / Sign Out | Existing confirmation and `signOut()` | Account |
| Meals Per Day minus, plus | Same clamps 2–6, haptics, local preference and `meals_per_day` profile write | Training and food |
| Water Goal (fl oz) minus, plus | Same ±10, clamps 40–200, local preference and `water_goal_oz` profile write | Training and food |
| Daily Check-in | Same local and `daily_checkin_enabled` preference | Notifications |
| Check-in Time | Same saved account-specific time when check-in is enabled and a choice exists | Notifications |
| Meal Reminders | Same local and `eat_enabled` preference | Notifications |
| Fasting Alerts | Same local and `fasting_enabled` preference | Notifications |
| Weekly Summary | Same local and `weekly_summary_enabled` preference | Notifications |
| Notification preferences | `NotificationSettings` | Notifications |
| Trust & Privacy | `TrustCenter` | Privacy and data |
| Coach sharing | `CoachSharing` | Privacy and data |
| Blocked Users | `BlockedUsers` | Privacy and data |
| My data / Request my data export | `DataExport` | Privacy and data |
| Roman and AI | `RomanAiConsent`, same consultation/roman flag gate | Roman |
| Support / Support inbox | `SupportInbox` | Support |
| Resume the tour | `RESUME`, parent Home navigation | Support |
| Take the tour again | Same restart and parent Home navigation | Support |
| The tour is in progress | Same disabled active-tour status | Support |
| Version and A daily practice. | Same existing information | About |
| Password modal: New password, Confirm new password | Same secure controlled inputs | Modal |
| Password modal: Close | Same dismissal and input/error clearing | Modal |
| Password modal: Update password | Same validation, busy gate, service update, success haptic/alert and dismissal | Modal |

## Truthful sweep
New copy consists only of neutral group titles. Account values, saved time, nutrition preferences, flags and tutorial state remain real-data driven. No counts, progress, promises, sharing claims, permission claims or Roman memory claims are added. The Roman section is absent when its existing entry gate is off. `RomanAiConsentScreen.tsx` is not touched; FIN-C2C-128 owns that screen.

## Design reference
Matches the editorial title, quiet small-caps overlines, generous spacing and hairlines in `design-targets/mobile/progress-details/luxury.jpg`, with Inter for readable utility controls. Intentionally keeps every utility action instead of copying the reference's report layout. Uses existing `SettingsSection` and theme tokens; no new palettes, dependencies, photos, animation or shared primitives.

## B/U list
- B: none in this presentation-only delta.
- U1: Related choices are split across repeated groups; consolidate into the seven owner-approved visible groups without adding taps.

## Validation and boundaries
- Round 2 main refresh: `e5f8800d24dfd120c28866e9031cb158e964dcf9` merges current main `8e649d058bf5bb789a995799400bbce6ada83048`. Only conflict/manual resolution is `src/screens/client/README.md`, keeping main's Profile entry and the seven-group Settings entry in their existing table. The local rendered parity file passes all six tests before one push. No notice-copy follow-up is added. New-head CI and all CodeQL checks are green: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685445356/job/113011953401 ; both new-head verdicts are requested.
- Under 450 changed lines, tests included.
- Deterministic failing-first grouping proof: the same Node assertion runs against the saved unchanged `d0875d26` screen (exit 1: nine old headings) and updated screen (exit 0: seven approved groups). Both runs use `ops/heavy.sh`; logs are in `ops/reports/DES-S2-128-{baseline,updated}-proof.log`.
- Opening tests-only CI https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680437999 passed lint/typecheck and 678 suites / 8,915 tests. Its one new test failed on an unsupported `within(header)` self-query, not a valid grouping assertion; that query is corrected to compare rendered header children. The opening failure is NOT claimed as the semantic failing-first proof.
- Shared mobile dependencies became READY after the final push. Five targeted files pass locally through `ops/heavy.sh`: rendered parity (6), saved check-in/appearance (10), consent heading fixture (33), quiet-luxury doctrine (10), voice guard (8): 67 passing tests. No local dependency installation or broad suite was run.
- Final full PR CI at `888925955665824b64676eac358d0fbc43671a9c` is green: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681442820/job/112998232746 and both CodeQL analyses.
- No backend, dependency, lockfile, production, navigation stack or Roman consent screen edits.
- Documentation follows `QUIET_LUXURY_DOCTRINE.md` section 8.
- No new unsafe casts, first-person copy, hype, emoji, exclamation marks, boxed cards or heavy display weights.
