# Operator agent 129: handoff (2026-10-07, written 16:50 PDT)

GitHub main wins. Verify every head and verdict on GitHub before acting on anything below.

## Production
- Backend: deploy 27 at backend main fd190078 (fly-deploy run 37702604355; production gate approved 16:31; success 16:37; /health and /readyz ok).
  Adds b#857 (payment emails to a client reply to that client's coach). No prisma change, no migrations.
- Flags: FEATURE_ROMAN_MEMORY declared and live since 15:57 (fly-env-sync apply run 37699335256; verify "declared present; Fly Deployed").
  The behaviour check is still owed and needs the tester accounts. FEATURE_ROMAN_PLAYBOOK stays unset tonight: PB-GAP (6-hour rebuild gap)
  was not built (owner 16:02: no cooldown without approval; owner 16:16: no new work). b#855 (the flip PR) conflicts with main and is untouched.
- Mobile main 1d0564ff at 16:43. The owner's plan (15:19): cut the iOS build from mobile main at 23:00.

## Merged by agent 129 (11; 103 merged today in total)
- 16:14-16:15: b#857, m#520, m#519, m#518, m#506.
- 16:42-16:43: m#485, m#523, m#525, m#494, m#504, m#514.
All through merge_if_dual.sh: Opus and Sol APPROVE at the exact head, every required check green.

## Fleet
- 50 agents launched 16:06-16:09. Owner 16:16: no new work. Owner 16:35: stop (credits 37k/45k). All 50 stopped with a HANDOFF by 16:41.
  Owner 16:43: five may finish their workflows.
- Running since 16:45: IOS-RELEASE-129 (m#528 CI fix, then READY), FIX-OPUS-129 (m#521 fix round, b#864 CI, fix lane to 22:30),
  FIX-SOL-129 (m#502 main merge, m#530 CI, fix lane to 22:30), LN-OPUS-A3-129 and LN-SOL-B3-129 (the only two lenses, to 22:45).
  Their exact queue is in ops/FLEET129.md (16:45 entry).
- Owner credit reports: 700 (16:02), 12k (16:16), 16k (16:19), 17k (16:20), 23k (16:24), 34k and 37k (16:35).

## Review queue at 16:50 (READY at head unless noted)
- Mobile: m#528 (App Store submit profile + iOS build 7; CI red, IOS-RELEASE-129 fixing), m#521 @0d278929 (T4, FIX ROUND 2),
  m#526 @61bf609c, m#490 @dcddb208 (main-merge-only round; dual approved at 3c5d793b), m#527 @f980a8e4, m#522 @ce336713,
  m#524 @0eca5fc2, m#531 @18bec1b5, m#529 @eed587f0, m#502 (conflict; FIX-SOL-129), m#530 (CI red; FIX-SOL-129).
  Hold m#513: its copy describes the coach playbook, which is off tonight.
- Backend: b#860 @b896ef9a (T4), b#861 @cf1c4176, b#863 @381fdda0, b#858 @14aaf3a7 (T4), b#859 @b7f74c4e, b#862 @a3401139,
  b#864 (CI red; FIX-OPUS-129). Backend merges need deploy 28 (fly-deploy.yml at main's exact SHA after CI, CodeQL and SBOM;
  none of these touch prisma).
- Eight READY comments were posted by the operator for builders stopped at 16:35 (m#531, m#529, m#521, b#860, b#861, b#863, b#859, b#862).

## Pushed branches with no PR yet (finish from each report's HANDOFF)
- Mobile: CF-MONEY-PLANS-128 331a3a58, CF-MONEY-MEMBER-128 f4d1d169, CF-SETTINGS-128 658e5def, CF-COMM-THREAD-128 d6e7900a,
  CF-LOGPLAN-128 74b605e1.
- Backend: CF-SHARE-GATE-128 dc75b0e5, CF-ALLERGY-128 be06333c (migration, T4), CF-COACH-PAY-BE-128 001f6b21 (new flag),
  CF-ROMAN-COPY-B-128 f772b8d7.
- Not committed: CF-TRAIN-TAB-128 (sandbox worktree only), CF-FAST-CALM-128 (reports/CF-FAST-CALM-128.wip.patch).

## Bs found tonight, not fixed (details in reports/)
1. Coach Settings > Billing & access crashes the app for every coach, including the App Store review coach
   (CoachBillingScreen.tsx:224-231 reads `state`; the backend sends `status`). AUD-COACH-WEEK1-129, EXPLORE-COACH-129.
2. Sign in with Apple fails for everyone (Supabase Apple provider off: authorize?provider=apple returns 400), and Google never
   returns to the app (tgp://auth/callback is not on the Redirect URLs list). Owner fix in the Supabase dashboard. AUD-FIN-ONB-129.
3. No App Store privacy-label answers exist; the full answer table is in STORE-AUD-129.
4. The coach daily brief and AI drafts ignore the client's sharing switches (AUD-FIN-COACH-129 B1, B2). No production exposure yet.
5. The coach Food log review returns the client's push token (AUD-FIN-FOOD-129 B1). No tokens exist until the iOS build.
6. A paying client's first access check on weak signal shows the paywall with no retry (AUD-FIN-FOOD-129 B2).
7. "New content unlocked" opens an empty screen; failed-payment copy promises retries Stripe will not make (AUD-FIN-MONEY-129 B-1, B-2).
8. A signal drop while the session renews signs the client out and deletes unsynced workout and meals (EXPLORE-CLIENT-129 B1; owner grades).
- Team feature (hidden for launch): latent Bs in AUD-ORG-129 and EXPLORE-SUBCOACH-129.

## Owner items
Tester accounts (a coach, and a client of that coach with an active package, one meal plan and one workout); TestFlight approval;
the 23:00 build go; Supabase Apple provider and Redirect URLs; App Store privacy labels; decisions listed in ops/FLEET129.md.

## Incidents and tooling
- git stash is shared across worktrees: CF-ROMAN-COPY-B-128 and CF-NOTIF-DIGEST-128 stashes crossed at 16:29; both restored
  (reports/STASH-MIXUP-129.md). Agents must not use git stash.
- GitHub proxy tokens expire after about 20 minutes. board_loop.sh re-reads ops/.ghtoken (sandbox only, never committed).
- gh commands that follow api.github.com URLs (for example `gh run view --json jobs`) hit the shared unauthenticated rate limit;
  use `gh api repos/<repo>/actions/...` through the proxy instead.
