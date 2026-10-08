# PR board (operator agent 131) - updated 20:59 PDT; refreshed every 3 minutes
Open agent127-131 PRs in both repos: 15 (dependabot, cand/* and other old PRs are out of scope). GitHub calls this refresh: 10.
Verdicts and claims count only AT THE CURRENT HEAD. Re-check the head on GitHub before you claim or post a verdict.

| PR | head | lines | CI | READY@head | Opus@head | Sol@head | claims@head (age) | needs | branch |
|---|---|---:|---|---|---|---|---|---|---|
| b#876 | 15db749298b1a0a4b63837adfe40653b81566b5e | 64 | green | no | - | - | - | needs READY at head | agent131/workout-clamp-131 |
| b#875 | 118ae6a2594f6c6482d07d3e6979586ea0fe3ba9 | 47 | green | no | - | - | - | needs READY at head | agent131/session-reminder-copy-131 |
| b#874 | fbab7f996c5cd52426857cdcd8bad4e0b3a4a91a | 626 | running | no | - | - | - | CI running | agent130/credit-meter-130 |
| b#872 | 1509818e765c882721118bf1023c85d1a17b1bfd | 391 | green | yes | APPROVE | REQUEST CHANGES | OPUS LENS:LN-OPUS-E-130 97m; SOL LENS:LN-SOL-A-131 11m | needs fix: REQUEST CHANGES by Sol | agent130/coach-ai-gate-130 |
| b#871 | fa38982ea9ef8ba7b796142e869ce03caa838998 | 166 | green | yes | APPROVE | APPROVE | OPUS LENS:LN-OPUS-D-130 116m; SOL LENS:LN-SOL-A-130 115m | DUAL APPROVED: operator merge | agent130/money-dunning-copy-130 |
| b#870 | 5849066994da5934a6c2d25dea16c5c337afad93 | 444 | running | no | - | - | - | CI running | agent130/credit-refill-130 |
| b#865 | 51a1766c0b3d084aa5d316eb567c2f5ea66d1d33 | 639 | green | yes | APPROVE | REQUEST CHANGES | OPUS LENS:LN-OPUS-A-130 87m; SOL LENS:LN-SOL-C-130 87m | needs fix: REQUEST CHANGES by Sol | agent129/cf-share-gate-128 |
| b#855 | 015b8d6ca226374b2b914d2d316146cbec33b50a | 10 | green | yes | APPROVE | APPROVE | OPUS LENS:LN-OPUS-E-131 13m; SOL LENS:LN-SOL-B-131 12m | DUAL APPROVED: operator merge | agent128/flip-pb-128 |
| m#549 | 534908a1154b3a3e531c39d7595dc2abca5d1cce | 360 | running | no | - | - | - | CI running | agent131/home-food-ui-131 |
| m#548 | 62e897ddd4c3db08c6dd541619374fdfd1d8d916 | 82 | FAIL | no | - | - | - | CI failing: Typecheck, lint, test | agent131/habit-add-guard-131 |
| m#547 | 54b4552deb702f910b1f05c48a67c588c2d959b9 | 88 | green | yes | - | - | - | needs Opus and Sol | agent131/home-food-store-131 |
| m#546 | 0b1a6b43c0a302ced857285972d10ca0458cc1f9 | 38 | green | yes | APPROVE | APPROVE | OPUS LENS:LN-OPUS-B-131 5m; SOL LENS:LN-SOL-F-131 5m | DUAL APPROVED: operator merge | agent130/coach-roman-row-130 |
| m#545 | d13041ca5577664c5e30b9481e4509d2a6b379dc | 1132 | running | no | - | - | - | CI running | agent130/coach-pay-m-130 |
| m#542 | 9e83832d2a10f2761d451af30e645fc3a6962ddf | 1068 | running | no | - | - | - | CI running | agent130/train-tab-fin-130 |
| m#537 | abb296689f21ba7a7dbecb514e404e932ad40044 | 641 | green | yes | APPROVE | APPROVE | SOL LENS:LN-SOL-E-131 13m; OPUS LENS:LN-OPUS-D-131 13m; SOL LENS:LN-SOL-A-131 13m | DUAL APPROVED: operator merge | agent129/cf-settings-128 |

## Merged in the last 4 hours

- m#544 2026-10-08T03:44:16Z feat(recipes): show declared allergens and say when saved allergies hide recipes
- b#873 2026-10-08T03:44:12Z fix(roman): coach Roman says it sees no client data and never states a number it
- m#524 2026-10-08T02:21:24Z fix(home): open assigned workouts and resume saved sessions
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
- m#529 2026-10-08T00:35:41Z fix(community): self-harm report shows 911 and 988; a refused leaderboard name s
- m#532 2026-10-08T00:35:34Z fix(coach): Billing & access no longer crashes (CF-COACH-BILLING-129, T2)
- b#858 2026-10-08T00:35:27Z feat(nutrition): a client can delete their own water entry or fast (CF-FOOD-UNDO
- b#860 2026-10-08T00:35:19Z fix(coach): clients can read their coach guidelines (GUIDE-READ, T4)
- b#863 2026-10-08T00:35:11Z fix(leaderboard): display names pass the community content filter (CF-COMM-SAFE,
- m#522 2026-10-08T00:23:03Z fix(profile): show real saved values and server daily targets
- m#531 2026-10-08T00:22:56Z fix(privacy): coach sharing says what its switches cover; device copy without a 
- m#527 2026-10-08T00:17:36Z fix(grocery): one Grocery list, Shopping row removed and its items shown in Groc
- m#528 2026-10-08T00:17:29Z chore(release): add App Store submit profiles and iOS build 7
