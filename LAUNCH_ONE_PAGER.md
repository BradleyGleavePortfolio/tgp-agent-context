# TGP Launch — One Page (draft for owner approval)

Drafted by operator agent 116, 2026-10-03 21:16 PDT; kept current by operator agent 117 (updated 2026-10-03 22:07 PDT). Fleet resumed 21:31 PDT.
Goal: App Store and Play submission plus clinic go-live (target Wed 10-07), at hyperscaler quality, with recurring packages on day 1.

| # | Launch step | What lands | State at 2026-10-03 22:07 | Owner action |
|---|---|---|---|---|
| 1 | Privacy | backend #611 public privacy policy + mobile #315 trust-center links | DONE: #611 + #315 merged 21:41; deployed 22:03 (main 643817b3); /privacy, /consumer-health-privacy, /help, /help/delete-account live | none |
| 2 | Money | fees #681-#686 as one stack -> deploy -> recurring #678-#680 (+ R4 tests piece) and mobile sheet #342-#344 -> deploy -> trials #671-#673 + mobile #338 -> deploy; #661 PaymentSheet credentials | fees round 13 in progress (B-FEES-117; Sol/Opus findings on #681/#683/#684); #685/#686 round 12 green; recurring #680 + R4 builder running; #661 round 5 builder running | Stripe events setup_intent.succeeded (before recurring deploy) and customer.subscription.trial_will_end (before trials deploy); Stripe Billing retry: "leave the subscription past-due" |
| 3 | Coach | backend #674-#677 -> deploy -> mobile #345-#351 -> #340 | #675 MERGED + deployed 22:03; #674/#676 round in progress (B-CM-117); #677 Sol APPROVE | none |
| 4 | Failed payments | backend #687-#691 -> deploy -> mobile #352-#354 | restack D1 -> D5 in progress (B-DUN-117), then lens pairs | none |
| 5 | Health Connect | mobile #359-#364 -> flag flip -> flag sync -> late-data follow-up -> clinic Android build -> device pass | #359 approved; #360 fix saved on a WIP branch | Play Console Data safety + Health apps forms; build spend approval |
| 6 | Remainder | #642, #312, #335, Programs #355-#358; CI #694 + #695 first | #694 MERGED 22:05; #695 dual APPROVE, refreshed, merging when green | none |
| 7 | Builds and review | EAS builds -> device pass -> store review | not started | EAS spend approval; Apple Sign-in keys; FCM V1 key; POSTHOG_KEY confirm |

Fast-follow after day 1 (default unless the owner objects): push #692-#693, Roman, S-SCHED-2, annex.
Biggest risks: (1) money stacks keep producing new must-fix findings each round (real defects caught pre-production, but slow);
(2) GitHub Actions capacity (36 queued runs at peak) sets the pace more than agent count; (3) owner-only store and Stripe actions
gate steps 2, 5 and 7; (4) no database backups until the Supabase Pro upgrade (owner approved 21:31; dashboard billing step).
Decisions: Supabase Pro APPROVED 21:31 (owner upgrades in the dashboard). Still open: day-1 scope (default above); approve this page.
