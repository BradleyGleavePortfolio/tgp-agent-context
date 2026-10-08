Tier: T2
Why: Small preference read-state and load-recovery corrections accompany the bounded three-screen visual/copy pass.
T4 trigger scan: none; no auth, tenancy, PII, money, credential or destructive-data changes.
T3 trigger scan: none; no new persistence contract, endpoint or cross-service behaviour.
Bounded T1: NO; server hydration and initial-load retry are small T2 behaviours.
Canonical builder: GPT-6.1 Sol, DES-BA-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: failing-first screen tests; 7 new parity/copy/theme tests, 27 category tests, 33 notification center/preferences tests, 30 doctrine tests, all through heavy.sh.
Promotion triggers: changing preference consumers, notification delivery policy, permissions, backend contracts or sensitive-data boundaries.

## What changes for coaches/clients

Three preference screens use the active semantic palette, unfilled hairline groups, quiet overlines, readable descriptions and larger controls. Every option remains. Category switches read their real server values. A failed channel-preferences load has a specific notice with retry/back instead of a blank screen.

No new dependencies, endpoint, lockfile, navigation or production changes. Client/coach role visibility and existing save payloads, rollback, quiet hours, mute-all, support and analytics remain.

## B/U list

- B1 fixed: users were told category switches disabled session/water/check-in alerts although they PATCH different fields; descriptions now match those fields.
- B2 fixed: users opening category settings after changing channels elsewhere saw stale/default category values; all categories now hydrate from server fields.
- U1 fixed: undersized targets/descriptions and filled cards now use 44 pt controls, readable Inter and semantic hairlines.
- U2 fixed: failed initial channel load previously showed nothing; retry and back now work.

## Truthful sweep

Pre-change line numbers refer to the c00a2a5f base.

| File:line | Before | What is true / after |
| --- | --- | --- |
| settings/NotificationPreferencesScreen.tsx:128 | Direct messages and session reminders from your coach. | PATCHes message_push/inapp, not booking reminders. “Direct message push and in-app alerts.” |
| settings/NotificationPreferencesScreen.tsx:135 | Meal, water, and daily check-in nudges. | Only eat_enabled is saved. “Meal reminder preference.” Backend consumer follow-up is explicitly reported below. |
| settings/NotificationPreferencesScreen.tsx:149 | Streak extensions and personal records. | Milestone fields control recorded milestone alerts; do not invent triggers. “Recorded milestone alerts.” |
| settings/NotificationPreferencesScreen.tsx:326 | Coach messages are always important; reminders can be silenced without affecting your coach relationship. | Unsupported judgment/delivery promise removed. “Choose which alerts to receive.” |
| settings/NotificationPreferencesScreen.tsx:424 | Critical billing/security alerts will still be delivered regardless. | System PATCHes weekly_summary_enabled only. “The System switch controls weekly summary email.” |
| notifications/NotificationPreferencesScreen.tsx:56 | Streak or programme marker that your coach has set. | No coach-set target available here. “Alerts for recorded milestones.” |
| notifications/NotificationPreferencesScreen.tsx:60 | Daily check-in not logged by midday. | No midday schedule shown. “Reminders for a missed check-in.” |
| client/PreferencesScreen.tsx:224 | Control how the app works for you. Changes save automatically. | These choices persist, but current consumers do not apply them. “Choose and save preferences.” |
| settings screen load:228 | Only workout reminders hydrated from server. | Every category uses its mapped real server field before showing the switch. |

All other rendered factual copy stays word for word, including fixed quiet hours, mute-all, workout reminders, channel descriptions and tone samples. Changes to headline/module case are presentation-only.

## Routes/actions before -> after

| Screen / label before -> after | Destination or effect before -> after |
| --- | --- |
| Categories: Go back | navigation.goBack(), unchanged |
| Coach Messages -> Coach messages (accessibility label retained) | message_push + message_inapp PATCH, unchanged |
| Reminders | eat_enabled PATCH, unchanged |
| Workout reminders | workout_reminder_push + workout_reminder_inapp PATCH, unchanged; client-only visibility |
| Milestones | milestone_push + milestone_inapp PATCH, unchanged |
| System | weekly_summary_enabled PATCH, unchanged |
| Categories: Try again | Retry the failed category/value, unchanged |
| Categories: Write to support | Open existing support email, unchanged |
| Categories: support fallback actions | Existing copy/address/email fallback, unchanged |
| Channels: Go back | navigation.goBack(), unchanged |
| Mute all notifications | Save muteAll, unchanged; other switches disabled while muted/saving |
| Direct messages via Push / In-app / Email | Save each message channel separately, unchanged |
| Build week gates via Push / In-app / Email | Save each build_week channel separately, unchanged |
| Milestones via Push / In-app / Email | Save each milestone channel separately, unchanged |
| Check-in reminders via Push / In-app / Email | Save each check_in channel separately, unchanged |
| Quiet hours | Read-only fixed 9 PM–8 AM information, unchanged; never a button |
| Channels load failure: Try again / Go back | Newly available retry GET / navigation.goBack() |
| Personalization: Go back | navigation.goBack(), unchanged |
| Hero Action -> Hero action | Toggle hero in homeModules, unchanged |
| Milestone Card -> Milestone card | Toggle milestone in homeModules, unchanged |
| Trust Cues -> Trust cues | Toggle trustcues in homeModules, unchanged |
| Secondary Tiles -> Secondary tiles | Toggle secondary in homeModules, unchanged |
| Community Feed -> Community feed | Toggle community in homeModules, unchanged |
| Daily / Weekly / Off | notificationCadence daily / weekly / off, unchanged |
| Gentle / Direct / Drill | motivationalTone gentle / direct / drill, samples unchanged |
| Metric / Imperial | units metric / imperial, unchanged |
| Sunday / Monday / Saturday | firstDayOfWeek 0 / 1 / 6, unchanged |

No action or route removed. New render tests exercise every switch/option, exact payloads, back, mute-disabled channels and initial-load retry. Existing category tests exercise failure retry/support and coach/client visibility.

## Not fixed: separate operator-owned scope

1. Personalization fields are persisted but current Home, reminder delivery, unit and calendar consumers do not use usePreferences; HeroAction explicitly ignores tone. Recommended default: separate consumer-integration lane, retaining all options as required here. This PR makes no promise that those choices already change every screen.
2. Backend eat_enabled is saved in notifications.service.ts:249 but no emitter currently reads it. Recommended default: backend meal-reminder consumer/gate follow-up; this UI labels the saved preference accurately without changing its payload.
3. usePreferences.ts:92-107 silently rolls back failed saves and exposes no mutation-error/async save result. Recommended default: separate hook contract and specific inline notice work.

## Evidence / documentation

- New: src/screens/settings/__tests__/PreferenceScreens.calm.test.tsx, 7/7.
- Existing category screen: 27/27.
- Existing notification center/preferences: 33/33.
- Quiet-luxury doctrine: 30/30.
- All commands use ops/heavy.sh, one test file per run. No local full-project tsc/eslint.
- Only these three screens' existing README entries updated, not appended.
- Semantic light/dark assertions; dark remains hidden and six client tabs unchanged.
- No heavy display weights, new emoji, hype, placeholders, photos, motion, gradients, FABs or banners.
