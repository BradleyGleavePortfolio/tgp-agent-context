# TGP Launch — One Page (draft for owner approval)

Drafted by operator agent 116, 2026-10-03 21:16 PDT. Status: fleet paused 21:04 PDT 10-03; resume from handoffs/op-116/pause/PAUSE_STATE.md.
Goal: App Store and Play submission plus clinic go-live (target Wed 10-07), at hyperscaler quality, with recurring packages on day 1.

| # | Launch step | What lands | State at 2026-10-03 21:16 | Owner action |
|---|---|---|---|---|
| 1 | Privacy | backend #611 public privacy policy + mobile #315 trust-center links | #315 dual APPROVE; #611 round 9 pushed (b09f2061), Opus approval drafted, Sol owed | none |
| 2 | Money | fees #681-#686 as one stack -> deploy -> recurring #678-#680 (+ R4 tests piece) and mobile sheet #342-#344 -> deploy -> trials #671-#673 + mobile #338 -> deploy; #661 PaymentSheet credentials | all in fix rounds; #685/#686 approved; recurring round 4 pushed | Stripe events setup_intent.succeeded (before recurring deploy) and customer.subscription.trial_will_end (before trials deploy); Stripe Billing retry: "leave the subscription past-due" |
| 3 | Coach | backend #674-#677 -> deploy -> mobile #345-#351 -> #340 | #677 and #675 approved; #674/#676 round pushed | none |
| 4 | Failed payments | backend #687-#691 -> deploy -> mobile #352-#354 | #688/#689 ready for audit; rest pushed | none |
| 5 | Health Connect | mobile #359-#364 -> flag flip -> flag sync -> late-data follow-up -> clinic Android build -> device pass | #359 approved; #360 fix saved on a WIP branch | Play Console Data safety + Health apps forms; build spend approval |
| 6 | Remainder | #642, #312, #335, Programs #355-#358; CI #694 + #695 first | #664 and #652 merged and deployed 10-03 | none |
| 7 | Builds and review | EAS builds -> device pass -> store review | not started | EAS spend approval; Apple Sign-in keys; FCM V1 key; POSTHOG_KEY confirm |

Fast-follow after day 1 (default unless the owner objects): push #692-#693, Roman, S-SCHED-2, annex.
Biggest risks: (1) money stacks keep producing new must-fix findings each round (real defects caught pre-production, but slow);
(2) GitHub Actions capacity (36 queued runs at peak) sets the pace more than agent count; (3) owner-only store and Stripe actions
gate steps 2, 5 and 7; (4) no database backups on the Supabase Free plan.
Decisions needed: Supabase Pro yes/no (default Free); day-1 scope (default above); approve this page.
