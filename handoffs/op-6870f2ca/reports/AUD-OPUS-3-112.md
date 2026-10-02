# AUD-OPUS-3 (agent 112) — Claude Opus 5.5 audit lens

## backend#607 @ b4750d053b466453ee9b34808abd405b85e5a892 — REQUEST CHANGES (A0 B1 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/607#issuecomment-5959887165
- Merge purity proven (merge-tree tree 1b3108b7 = head tree; patch-id of merge delta = main delta 81c42372). No src/onboarding change. Seam (env-validation, fly-env manifest loader, ledger ON, mobile pins) clean.
- B-607-5: required 'danger' red — PR title not Conventional Commits and latest subject is now the merge commit. Operator fix, no push: retitle to 'feat(onboarding): ...' then 'gh run rerun 37052493943 --failed'. Closes without re-audit when danger is green at the same head (then APPROVE A0 B0 C1).
- C-607-6: migration 20270212 sorts before prod-applied 20270216 (#629); benign (migrate deploy, disjoint objects); no action.

## backend#635 @ c2688010c9a665e70106123fae6a8a8d35c7df83 — APPROVE (A0 B0 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5959942798
- Merges 526036e8 / c2688010 pure (merge-tree trees a312ce66 / 68bc6fbe match). Fix commits 653a9bfb, 98af609e touch only src/roman, test/roman, docs.
- CLOSED: B-635-2 (GET/DELETE /roman/sessions + any-day DELETE :id, outside flag, user_id-scoped, cap kept, live 11/11), Sol B-635-3 (safeDiagnostic + Sentry summary), Sol C-635-1 (follow-up/retry/stalled), C-635-2 (coded 404, idempotent 204), C-635-3 (verified erase, NOBYPASSRLS live probe).
- C-635-4 (optional): sub_coach role gets 403 on list/delete own chats (@Roles lacks sub_coach; roleSatisfies has no inheritance).
- Release items: mobile has NO list/delete-chat screen while v4 copy "kept until you delete them" ships via #310 (launch-blocking mobile slice); "or your account" needs #608; export lacks Roman chats (B-EXPORT); #635 deploys before any #310 build (main ledger still client-ai-v3).
- 10/10 required checks SUCCESS at head.

## backend#607 @ b4750d053b466453ee9b34808abd405b85e5a892 — APPROVE (A0 B0 C1) — posted 2026-10-02 (supersedes RC 5959887165 at the same head)
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/607#issuecomment-5959951180
- B-607-5 CLOSED: operator retitled to feat(onboarding): ...; danger SUCCESS at b4750d05 19:30:41Z; 10/10 required green. No code change. C-607-6 stands (informational).

## #609 / mobile #312 — briefly reassigned to AUD-OPUS-4 (12:30), returned to this lane (12:33).

## backend#609 @ 40616dcfa273501f1314890fa8966144b334cbdb — REQUEST CHANGES (A0 B2 C3) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/609#issuecomment-5960037347
- First AUDIT on thread; own diff isolated vs merge-tree(f6fa244b,97467678)=f59aaf66 (33 files); merges aac5bcb6/4c1bbd0e pure; merge with #607 b4750d05 clean.
- B-609-1: required rls-live-tests red — idempotency test regex /unique|duplicate key/ vs Prisma "Code: `23505` ... already exists" (constraint works); assert SQLSTATE 23505 at spec :499/:506/:514.
- B-609-2: on the required update-branch onto main 3bd6215b, both defaults-on kill switches need values ['true','false'] + unsetIs 'on' and entries in .github/fly-env-desired-state.json (else outside #637 plan/apply/verify + kill table).
- C-609-3 no_coach head-of-line in schedule(); C-609-4 reminder tick scale; C-609-5 retitle to Conventional Commits before the merge commit (else danger red like #607).
- Release: coach-message push rows never sent to Expo (no coach message reaches lock screen) — needs own lane; #608 manifest should list the 3 tables; order #607 -> #609 -> deploy -> mobile #312.

## mobile#312 @ 90e78abe92ed94aea5f116fe630eb96c4c5f7b5a — REQUEST CHANGES (A0 B1 C2) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960043718
- Contract with #609 verified; TZ-1 per-account stamp verified; CI 3/3 green; clean merge with main 2c17c241.
- B-312-1: toggle failure = one generic alert for every status, no request id, no Sentry (NotificationPreferencesScreen.tsx:192-204); branch network/401/other with reportUnexpected + tests.
- C-312-2 hide toggle for coach/owner; C-312-3 resync timezone on AppState active.

## backend#642 @ 859509843e787afab1d7aa172381478b93f3ad94 — REQUEST CHANGES (A0 B1 C0) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/642#issuecomment-5960151535
- Diff correct (one manifest line GOOGLE_CLIENT_IDS unset -> github-secret); 10/10 required green.
- B-642-1: hold merge (whole-manifest apply arms it) until #608 is in production: mobile delete re-auth sends provider 'google_session', main DTO accepts only google/apple -> 400, so new Google-only users cannot delete in-app (5.1.1(v)). Closes without re-audit when #608 is live + head unchanged -> APPROVE.

## backend#643 @ f21b3c632a80037c852f91e5d41e33d31d99ef9e — REQUEST CHANGES (A0 B1 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/643#issuecomment-5960179586
- Diff correct ('on' literal, values/unsetIs, sweeps idempotent, no Expo call); 10/10 required green.
- B-643-1: flip exposes booking reminders in UTC ("at 00:30 UTC", booking.emitter.ts:249-252) and twice in inbox/unread (inapp+push rows; listNotifications filters user_id only). Hold merge until a notification follow-up lane is deployed (local-time copy + inbox channel filter), or the owner explicitly accepts. Closes without re-audit then.
- C-643-2: push rows never reach devices (also coach messages, #609 welcome) — route to the same lane.

## backend#634 @ d1661ab873610e1707619a14bc1352293d093ac1 — APPROVE (A0 B0 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5960354631
- Merge b5e6e62d pure (tree c1142bb1 = merge-tree 2a07ab25+3bd6215b); clean vs main f04289f9. 10/10 required + migration checks green.
- Sol B-634-2 closed: band-independent recovery of retry/expired-lease rows, retire with receipts kept, advancing-clock tests; (kind,status) index in unapplied migration.
- C-634-5: seed keep path does not mark an existing non-welcome "Quick initialization" as welcome nor report it (operator SQL check before C04 bootstrap).

## mobile#325 @ 36f05bbabe529bc25020f48e5a0026392a543b70 — APPROVE (A0 B0 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5960647810
- Merge ae55530 of main 2c17c241: only conflict eas.json (clinic profile), resolved as the union (CLIENT_CALENDAR + CONSULTATION_ONBOARDING + COMMUNITY_DM=false); no other hand edit.
- Sol B-325-2 closed (intent-aware approve copy -> Decline); B-325-3 closed (support.ts = ruled address; consultation copy re-exports; literal-pinned test). Legacy ClientBookingRequest removed; #310 tour -> welcome call hand-off tested.
- C-325-7: #327 still adds src/constants/support.ts (same value) — converge to one module when it updates.
- CI required 3/3 green; local targeted jest could not run (heavy lock wait timed out).

- Operator 13:11: C-634-5 moot (production has 0 'Quick initialization' types). Review worktree wt-audopus3-325 removed; future review worktrees removed right after posting.

## mobile#331 @ a224e5bd9b2100c68ce9290a59221404f73b7838 — REQUEST CHANGES (A0 B1 C2) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331#issuecomment-5960943313
- Verified vs #635 pushed fix round 9c5ae5ef: codes/status mapping, wire shapes, cuid id fix (schema cuid), account fence, optimistic delete/rollback, typed DELETE confirm, flag-independent routes; CI 3/3 green; clean merges with main/#325/#326.
- B-331-1: chatDateLabel shows local date only; sessions are per UTC day so two chats on one local evening share a label, incl. the permanent-delete confirm. Fix: add local start time + test.
- C-331-2 copy voice ("I could not reach") / "still listed" on transcript. C-331-3 coach row shown to sub-coaches (403).
- Worktree removed after posting.

## mobile#333 @ abfc5d12ae593de67e83e8cf5d7bfe53cca61afc — APPROVE (A0 B0 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/333#issuecomment-5961012291
- Hook pre-install safe (fs/path only; typescript lazy), fails closed without profile, development skipped; value checks never print values. C-333-1: BAD_HOST misses 172.16/12, IPv6 loopback/ULA, *.internal.

## mobile#330 @ 4c61d9151be5a50e67c3b0b33ba54995b973bb59 — APPROVE (A0 B0 C2) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/330#issuecomment-5961012859
- Native SDKs reachable (Sentry/HybridSDK pod; api sentry-android), safe-literal validation, release/env parity with JS, PII off, user id only. C-330-1 stale services/README.md:55; C-330-2 release gate: preview build compile + forced pre-JS crash; Sentry IP storage off.

## mobile#305 @ 92c25ec81db4cd1e5fd5cf0af766d1d97ab1de03 — REQUEST CHANGES (A0 B2 C1) — posted 2026-10-02
Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5961013415
- Dep/lock additions only; ON_LOAD/timeout 0 enforced by validator (Sol C4 closed); Sol B1/C1 closed by main.
- B-305-5: runbook staged rollout via raw eas update bypasses guard and drops clinic profile env (flags) — add --rollout-percentage to guard.
- B-305-6: OTA bundles get no Sentry source maps (Debug IDs differ; release unchanged) — guard uploads via sentry-expo-upload-sourcemaps dist; fix runbook step 5.
- C-305-7: iOS buildNumber still 6 for a new native binary (operator check).
- All three: no worktree created (git show only). Pairwise merges clean.

