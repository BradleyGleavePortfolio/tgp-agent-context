# PR board (operator agent 131) - updated 21:56 PDT; refreshed every 3 minutes
Open agent127-131 PRs in both repos: 9 (dependabot, cand/* and other old PRs are out of scope). GitHub calls this refresh: 13 (full comment re-read).
Verdicts and claims count only AT THE CURRENT HEAD. Re-check the head on GitHub before you claim or post a verdict.

| PR | head | lines | CI | READY@head | Opus@head | Sol@head | claims@head (age) | needs | branch |
|---|---|---:|---|---|---|---|---|---|---|
| b#878 | 3ec27c47de4e838c93de63e3ba3c7d99aa1b8092 | 159 | green | yes | - | - | - | needs Opus and Sol | agent130/coach-row-scrub-130 |
| b#877 | dc6149d74ee69ba7778585fb5602b4cdff8acb7f | 386 | green | yes | APPROVE | APPROVE | OPUS LENS:LN-OPUS-A-131 25m; SOL LENS:LN-SOL-F-131 23m | conflict with main: merge origin/main | agent131/credit-pay-131 |
| b#872 | b84193df74ffe1c14e874e35f38bbc7261bc8306 | 520 | green | yes | - | - | - | needs Opus and Sol | agent130/coach-ai-gate-130 |
| b#871 | fa38982ea9ef8ba7b796142e869ce03caa838998 | 166 | green | yes | APPROVE | APPROVE | OPUS LENS:LN-OPUS-D-130 173m; SOL LENS:LN-SOL-A-130 172m | DUAL APPROVED: operator merge | agent130/money-dunning-copy-130 |
| b#870 | 87f7f27543963ab6d3cfdaf1def1e643ba37e2f4 | 479 | green | yes | - | - | OPUS LENS:LN-OPUS-C-131 2m | conflict with main: merge origin/main | agent130/credit-refill-130 |
| m#556 | 53f10d0a84ac7a342b996a6d8fe57fc6895dc5b7 | 746 | green | yes | - | - | - | needs Opus and Sol | agent131/qa-coach-states-131 |
| m#552 | f41ea9b11a89cd3fe6c351e40bfda19967c80ca9 | 747 | green | yes | APPROVE | REQUEST CHANGES | OPUS LENS:LN-OPUS-D-131 37m; SOL LENS:LN-SOL-B-131 37m | conflict with main: merge origin/main | agent130/fast-calm-fin-130 |
| m#551 | ae7e2a94b4c12c08bcbf96e55c58eb313b3d987b | 786 | green | yes | REQUEST CHANGES | APPROVE | OPUS LENS:LN-OPUS-E-131 25m; SOL LENS:LN-SOL-D-131 24m | conflict with main: merge origin/main | agent130/credit-pay-m-130 |
| m#549 | 371c555bbbdbc4a8402baf2733715ab3517ae498 | 371 | green | no | - | - | - | needs READY at head | agent131/home-food-ui-131 |

## Merged in the last 4 hours

- m#554 2026-10-08T04:51:39Z fix(coach-home): keep setup and Money cards while numbers load or fail; calm sta
- m#555 2026-10-08T04:51:31Z fix(empty-states): calm 44 pt buttons, brand titles and honest invite label
- b#874 2026-10-08T04:51:18Z fix(ai-credits): debit the exact AI cost and round once per period (CREDIT-METER
- m#553 2026-10-08T04:31:37Z fix(workout): reopened workout counts time to its last change, empty saved one g
- m#550 2026-10-08T04:31:30Z fix(coach): align weekly totals and daily summaries
- m#548 2026-10-08T04:31:22Z fix(habits): disable create while saving (HABIT-ADD-GUARD-131)
- m#547 2026-10-08T04:31:14Z fix(store): keep Home day data and round water failure copy
- m#542 2026-10-08T04:31:07Z fix(train): the Train tab shows true states in the calm layout (TRAIN-TAB-FIN-13
- m#545 2026-10-08T04:30:59Z feat(coach): coaches refund, pause and cancel a client's payments (COACH-PAY-M-1
- b#876 2026-10-08T04:30:55Z fix(workout): clamp stale session durations before validation
- b#875 2026-10-08T04:30:50Z fix(notifications): keep session reminder copy factual
- b#865 2026-10-08T04:30:46Z fix(privacy): coach sharing switches gate every coach read (CF-SHARE-GATE-128, T
- b#855 2026-10-08T04:05:53Z chore(flags): turn on Roman's coach playbook (FLIP-PB, T4)
- m#537 2026-10-08T04:05:48Z fix(settings): Settings switches say and do what they name (SETTINGS-FIN-130, T2
- m#546 2026-10-08T04:05:44Z fix(coach): describe Roman's supported topics in Settings (COACH-ROMAN-ROW-130)
- m#544 2026-10-08T03:44:16Z feat(recipes): show declared allergens and say when saved allergies hide recipes
- b#873 2026-10-08T03:44:12Z fix(roman): coach Roman says it sees no client data and never states a number it
- m#535 2026-10-08T02:21:19Z fix(membership): status shows the client's real plan and a failed payment (MONEY
- m#543 2026-10-08T02:21:15Z fix(auth): keep sign-in when renewal gets no answer; name unsynced logs before s
- b#866 2026-10-08T02:16:53Z fix(roman): safety copy assumes no coach, a fixed eating-disorder reply when Rom
- m#540 2026-10-08T02:13:02Z fix(community): thread reactions show and toggle, author and time, own-post dele
- m#541 2026-10-08T02:12:58Z fix(entitlements): a failed access check says so and offers Try again (FOOD-GATE
- m#538 2026-10-08T02:01:28Z feat(mealplan): log a planned meal to today's food log in one tap (LOGPLAN-FIN-1
- m#539 2026-10-08T02:01:23Z fix(notifications): money rows get real titles and open the right screen (MONEY-
- b#869 2026-10-08T02:01:18Z feat(checkout): coaches refund, pause and cancel a client's payments, flag off (
- b#868 2026-10-08T02:01:13Z feat(recipes): hide a coach recipe only when its declared allergens match the cl
- b#867 2026-10-08T01:56:37Z fix(roman): rebuild a coach's playbook at most once every 6 hours (PB-GAP-130, T
- m#536 2026-10-08T01:52:08Z feat(food): let clients remove water entries and fasts
- m#534 2026-10-08T01:46:03Z fix(plans): a true refund path, honest trial terms and each plan shown once (MON
- m#533 2026-10-08T01:45:59Z fix(health): correct Apple Health permission messages
- b#861 2026-10-08T01:39:33Z fix(roman): the reply check keeps a correct today figure next to your usual or l
- m#530 2026-10-08T01:16:18Z fix(onboarding): keep lean answers honest and avoid repeated setup
- b#859 2026-10-08T01:16:14Z feat(weight): a client can edit or delete their own weigh-in (CF-BODY-J2, T4)
- b#862 2026-10-08T01:16:09Z fix(community): posts and replies carry the author first name and their reaction
- b#864 2026-10-08T01:16:04Z fix(notifications): client digest numbers are true; client daily digest off by d
