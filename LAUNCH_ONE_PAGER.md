# TGP Launch — One Page (APPROVED by the owner 10:40 PDT 10-05)

Version 2.1, operator agent 120, 2026-10-05 10:40 PDT (v1 by agents 116/117, 10-03). Fleet size is dynamic: each operator sizes it to its own credits (agent 120: up to 7 at once).
Goal: App Store and Play submission plus clinic go-live, at hyperscaler quality, with recurring packages on day 1. Original target Wed
10-07; with the expanded day 1 the estimate is: launch-path steps 2-6 done Wed-Thu, the full day-1 list about Mon 10-12.

## Launch path (7 steps)
| # | Step | What lands | State 10:36 10-05 |
|---|---|---|---|
| 1 | Privacy | policy, trust center, delete-account | DONE (deployed 10-03) |
| 2 | Money | fees; recurring; card-secrets fix #661/#702; payment sheet m#342-#344; trials #671-#673, #706, #707 + m#338 | fees + recurring DEPLOYED (recurring 09:33 today); #661 fix building; sheet approved, held for D4; trials: one shared trial rule, builder next |
| 3 | Coach | backend #674 #676 #677 #703 -> deploy -> wizard and money screens m#345-#351 | Sol approved 3 of 4 (#674 has 3 fixes); Opus reviewing |
| 4 | Failed payments | dunning #687-#691, #642 -> deploy -> lockout m#352-#354 | D1-D2c and lockout fixed and ready; reviews running/queued |
| 5 | Health Connect | m#359-#364, #369 -> flag on -> late-data follow-up -> device pass | all approved except one #369 fix (building) |
| 6 | Remainder | programs m#355-#358 (+ small backend fix), m#312, #335, #339, #340 | programs fixes queued |
| 7 | Builds and review | EAS builds (Free plan) -> device pass -> store review | not started |

## Added to day 1 today (owner rulings 09:46-10:33)
- Push notifications b#692/#693: fixes building (lock screens show generic text, no email or health details; Android channels).
- Community: coachless and featured coach #657, invite codes #658 (fixed, ready for review) + mobile codes screen, broadcasts #659,
  messaging inbox #660 (split into #708-#711 at 10:3x; production message privacy checked: on).
- Roman: client-data answers, safety checks, live chat, 30-case quality test, "your conversations", approve-to-adjust. v1.1 plan written.
- Scheduling, all of it: no double booking, appointment types, coach approval or instant confirm, request expiry, reminders, coach and
  client calendar screens, phone time zone. Coaches decide their times (open hours, time off, notice, booking window, buffers, daily max);
  onboarding unchanged.

## Owner actions
- Done today: FCM V1 key in Expo; old ci branches deleted (iOS push key already in Expo since May).
- Stripe: add refund.updated to webhook we_1UMt9WDUoC5CCVhShvAELVmI; confirm customer.subscription.trial_will_end before the trials deploy.
- Supabase Pro on launch day 1 (database backups). Apple Sign-in key. Confirm POSTHOG_KEY. Play reviewer accounts on the next APK.
  Health Connect device pass. Play Console Data safety + Health apps forms.

APPROVED by the owner 2026-10-05 10:40 PDT ("approved").
