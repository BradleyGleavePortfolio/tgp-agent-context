# AUD-OPUS report (Claude Opus 5.5 lens, agent 109 wave 1)

## backend#597 @ e3167fe7da96f72ca9b0ce0025f6e6b4b2e444c6 — APPROVE (A0 B0 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/597#issuecomment-5940240919
- A-597-1 closed (no destructive compensation at all; retain + same-password retry / marker-gated adoption). B-597-2 closed (password proof via email_not_confirmed). B-597-1 still closed. My C-597-1/2 moot (lock removed).
- New C: C-597-3 anon-signUp squatted address dead-ends email signup (safe direction; runbook/distinct codes); C-597-4 stranded coach registration adopted as client permanently (bind role into MAC); C-597-5 register password proof not under #604 per-account lock.
- Tests: heavy.sh env CI=false jest --runInBand (auth-signup-role-choice, c13-email-case-login, c13-fix-round, oauth-coach-signup-ceiling, auth-apple-mobile-contract): 5 suites, 112 passed, 1 skipped. CI: 9/9 required SUCCESS at head.

## backend#599 @ 7b496acad3342c0f71fb99855399804f385c33c5 — APPROVE (A0 B0 C2)
- range-diff vs my approved 9a0b9f94: all 3 commits patch-identical; prior CI gap closed (9/9 required SUCCESS).
- #597 r4 interplay: signupWithCode -> register can 409 signup_pending before attach (nothing written); adopted identities are not auto-attached (re-enter code; #607 answers not_attached).
- C-599-1 (Sol, concur): #607 attach-writer semantic conflict, not double-attach; keep #599 writer, drop #607 client_transferred branch.
- C-599-2 (new, release config): Supabase per-IP (server IP) limits 30 signups/5 min, /token 150/5 min, email send cap; confirm production Auth rate limits + SMTP cap before clinic event.
- comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/599#issuecomment-5940259473

## backend#595 @ e1dd4c390fc195c4ec7f2ae5b0dafb0aa483acc0 — APPROVE (A0 B0 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/595#issuecomment-5940273186
- B-595-1 closed (active-or-pending conditional tombstone; activation conditional + revoked_not_regranted; upsert update:{}). Range-diff: 3 C01 commits identical + fix commit.
- C-595-1 (Sol, concur) stale README SQL fallback. C-595-2 two consent ledgers: grants (contracts ON) need ClientCoachConsent onboarding.agreement, D2 box 1 lives only in #607 intake -> keep FEATURE_CONTRACTS_ENABLED off (already default off, legal gate) or bridge before flip. C-595-3 clinic package with programs + #607 clinic program = double assignment; ops default: entitlement-only clinic package.

## backend#604 @ 21ffc02c3d0e1235999380d23ea216f99f904e40 — APPROVE (A0 B0 C1 new + C-597-5 cross-ref)
- range-diff vs my approved c3abde8d: 4 C14 commits identical + test-only double commit (honest: runs the attempt). Adoption runs inside guardPasswordLogin. CI gap closed (9/9 SUCCESS).
- C-604-1: "Email not confirmed" (correct password) counts toward the 10/15 min account lock.
- Local: 8 suites, 213 passed, 9 skipped (live Redis) at 21ffc02c.

## Chain judgment (#597 -> #599 -> #595 -> #604)
- signup -> role (flag on: client|coach; flag off: coach degrades to client at every entry; kill switch tested) -> invite attach (single conditional writer, no re-parenting, outcome reported) -> free/prepaid grant on attach (contracts off in prod: active immediately) -> coach code (allocated pre-signUp, coach ceiling). No A/B open across the chain.
- #607 interplay: no double attach (#607 never attaches; completion requires attachment, FOR SHARE re-read). Risks: C-599-1 attach-writer merge semantics; C-595-3 double program if clinic package carries programs; C-595-2 consent ledger mismatch if contracts flag ever flips.
- Release config: C-599-2 Supabase per-IP/server-IP limits and email send cap vs clinic room.
- Final-head delta checks after update to main: ci.yml (Redis service vs #606 mwb-3 line), throttler bucket for #606 routes, env registration collision with #624 (all new stack env names into ENV_RULES), migration ordering for #595, byte-identity of register/_passwordLogin/adopt and revoke/activateRow.
- comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/604#issuecomment-5940289971

## backend#623 @ 4cc366fca242a4be7e007fd7dddb66c5d4a946e5 — APPROVE (A0 B0 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/623#issuecomment-5940356014
- B-623-1 closed (skip map + own default limits; per-user tracker since JwtAuthGuard is first APP_GUARD). JWT-only subject, typed userId 400, ownership/provider/live gate, bucket refine, race-safe on-device upsert, kill switch before DB.
- C-623-1 RELEASE ORDER: account deletion at main tombstones User and never deletes wearable rows (cascade never fires) -> flip FEATURE_WEARABLES_INGEST_POST only after #608 (manifest covers wearables) is deployed. C-623-2 wearable_insight.* capabilities lack box-2 check -> keep out of AI_GATEWAY_CAPABILITIES until R2b. C-623-3 final-head: re-run isolation spec after #604; reconcile with #624 ENV_RULES.
- Local: 5 suites / 59 passed at head; fixture sha256 matches pin 3c8701f9...; CI 9/9 SUCCESS.

## mobile#317 @ c7e35d847dae7cb08422d221ec0657b769192e7c — REQUEST CHANGES (A0 B1 C2)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5940512410
- Sol A-317-1, B-317-1..4, C-317-1..2 closed in code + tests (local authorization keyed user+source bound to connection id; session fence before each request/save; per user+connection progress; HC resume tokens; per-session sleep with 36 h look-back; weight unit 'kg' verified against locked native lib).
- B-317-5 NEW: sign-out sweeps local authorization but the server row stays connected; ConnectionsScreen maps connected -> Disconnect only, refresh returns not_authorized silently -> sync stops with no way back except Disconnect (also second phone / reinstall). Fix: Reconnect action when no local authorization; test.
- C-317-3 release order (#608 before flag flip; AI flag off). C-317-4 disconnect keeps server samples, no confirm (pre-existing).
- Local: 24 suites / 327 passed at head; fixture sha256 matches backend pin; CI 4/4 SUCCESS.

## backend#624 @ c82f254859133ca15dd33c40c1c44e3c6e7c3264 — REQUEST CHANGES (A0 B1 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/624#issuecomment-5940649899
- PASS: dispatch-only, app allowlist + confirm=SET, production environment (1 required reviewer, protected branches, no admin bypass), no boot change (no hard/prod tiers or validators added; launch/default descriptive), registry scanner honest (AST, dynamic sites recorded, floor guard), values never printed.
- B-624-1: env-truth report prints every present env NAME verbatim incl. malformed ones (probe: name `q9Zr+/kL2pX` appears in JSON and markdown) -> a value-derived name from a mis-paste reaches job summary + 30-day artifact. Fix: opaque id for unregistered names failing ENV_NAME_RE + test.
- C-624-1 allowlist includes 3 optional-integration Google Calendar names + 16 cloud wearable creds. C-624-2 flyctl table parse/argv/overwrite visibility. C-624-3 first operator run is the ssh proof. Merge-order: FEATURE_WEARABLES_INGEST_POST vs #623; invariant will fail stack PRs adding env reads; GOOGLE_CLIENT_IDS supersedes GOOGLE_CLIENT_ID.
- Local: 5 suites, 167 passed / 1 skipped (pre-existing). CI required SUCCESS; shellcheck SC2015 pre-existing.

## backend#625 @ 3647e78532a1216b239392547dddada3ebabf4c5 — APPROVE (A0 B0 C5) — P0 schema drift
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/625#issuecomment-5940892537
- Complete vs schema.prisma and the prod evidence (4 tables, 10 columns, ListType enum); additive, guarded, fast-default/catalog-only, one tx with 5 s lock / 30 s statement timeouts; verify block asserts shape, policies and grants; RLS server-only posture (precedent 20261224000000); down.sql CI-only; parity gate blocking, shrink-only baseline, missing objects never baselinable.
- C-625-1 dormant /recipes goes live: public-by-default cross-tenant UGC with remote image_url, no moderation (App Store 1.2) -> follow-up before broader launch. C-625-2 onboarding-abandoned nudge false positives + cron restart burst. C-625-3 shared 20270125000000_ prefix with #595/#604/#587. C-625-4 prod-vs-schema read-only diff after deploy; add required check; stack PRs must pass gate. C-625-5 EXPO_PUBLIC_COACH_SIGNUP_SECRET: unused anywhere (main, history, 605+306 PR heads); backend trusts nothing; low unless value reused as a server secret (rotate then).
- Local: 2 suites / 42 passed. CI all SUCCESS at head (shellcheck pre-existing).

## backend#625 @ f6c6c809c4ca686de8bb99cce44e7b61a77dec63 — REQUEST CHANGES (A0 B1 C6) — supersedes the 3647e785 APPROVE
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/625#issuecomment-5941193933
- Self-correction: at 3647e785 "shrink-only" was a comment, not a check; Sol's B-625-1 was right and I missed it. Now CLOSED (approved-baseline comparison vs base commit; no default skip; bootstrap only when the base has no file; probe exits 1/2/0/0 as designed). Sol C-625-2 closed (comment narrowed; SQL byte-identical). Migration SQL approved.
- B-625-1: actionlint turns red (green on main and at 3647e785): schema-parity.yml:157 unquoted $PARITY_APPROVED_ARGS, SC2086 (Infra Lint run 36928335351). Not a required check. One-line fix (shellcheck disable directive or set -- "$@" mode). Operator may treat as CI-only for the outage.
- C-625-1..5 carried; C-625-6 gate files (workflow, script, baseline) run from the PR's own copy -> make changes to them a T4 trigger.
- Local jest: queued behind the shared heavy lock at posting time (result appended below when done). CI build-and-test SUCCESS.
- #625 f6c6c809 local: test/ci/schema-parity-gate.spec.ts + test/restore-schema-declared-objects-migration.spec.ts -> 2 suites / 46 passed (log ops/aud-opus/jest_625_f6c6.log).

## mobile#306 @ a81a6c8652feb5cf56b9990b8adccd985a52c9af — APPROVE (A0 B0 C3 new) — fix round 5
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306#issuecomment-5941291283
- My r4 B-306-1 closed (owner-scoped gate, persisted recovery record, Login settles the gate on every success). C-306-1 partly closed: invite/QR signups never consult markers; Apple uses identity-token email; residual method-only match for a no-email provider marker accepted (same device, same provider, <30 min, wrong copy only; removing it reopens Sol B2-R3). C-306-2/3 closed.
- New C: C-306-5 Sentry `code` falls back to response.data.error (free text) -> allowlist pattern; C-306-6 401 branch provider-agnostic copy; C-306-7 legacy unowned flag routes next signer-in to RoleSelection once (safe).
- Operator: CRISP id in clinic EAS profile; Messages "contact support and we will connect you" only if support can attach codes manually; role choice flag default on.
- Local: 27 PR test files -> 27 suites / 351 passed (ops/aud-opus/jest_306.log). CI 4/4 SUCCESS.

## backend#625 @ 67e707f0b60af397616a3807cfa401a1fac765cc — APPROVE (A0 B0 C6 carried) — fix round 2, final head
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/625#issuecomment-5941388212
- B-625-1 closed: PARITY_MODE + `set --` + "$@", unknown/empty mode fails closed (probe: approved 0, bootstrap 0, empty 1, junk 1, grown baseline 1). actionlint SUCCESS at exact head (local actionlint exit 0). No prisma/ change; SQL identical to 3647e785.
- Local: 2 suites / 46 passed (ops/aud-opus/jest_625_67e7.log). CI: all SUCCESS incl. build-and-test, Schema parity, forward/reversible migrations, rls-live-tests; shellcheck SC2015 pre-existing.

## mobile#319 @ 9080afadc4ff4a69c6ea1fd1c8a626dd2fbf9275 — APPROVE (A0 B0 C3) — S-ENVTRUTH (T2)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/319#issuecomment-5941390652
- Manifest has 56 publishable-only EXPO_PUBLIC names, no values, no EXPO_PUBLIC_COACH_SIGNUP_SECRET. Stripe resolver canonical-first, literal member reads, fails closed. Guard honest for its stated scope (probe: undeclared read 1, declared-unread 1).
- C-319-1 no secret-name denylist (probe: declared EXPO_PUBLIC_COACH_SIGNUP_SECRET passes) and no view of EAS server env; C-319-2 `required` is documentation only, add eas-build-pre-install check (non-empty + pk_ prefix); C-319-3 legacy STRIPE_PK fallback could pick a stale key, delete it per env.
- Local: 3 suites / 24 passed (ops/aud-opus/jest_319.log). CI 4/4 SUCCESS.

## Lane close (AUD-OPUS)
- EXPO_PUBLIC_COACH_SIGNUP_SECRET: no code reads it (backend and mobile main, full history, every open PR head). The backend trusts nothing with that name: coach elevation is operator-only (selectRole refuses coach/owner; /auth/become-coach behind ALLOW_SELF_SERVICE_BECOME_COACH, default off; bootstrap uses BOOTSTRAP_SECRET). Severity low. Delete it from all EAS environments; rotate any server secret that ever shared its value.
- Worktrees aud-opus-be and aud-opus-mob removed. Disk 63%.

## Merge train (attestor role, from 15:25 PDT)
### backend#597 @ b6b383c70d16b9eb20bd33ac9eef1d1b303db39f — APPROVE (A0 B0, C-597-1..3 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/597#issuecomment-5941554558
- Pure integration: parents e3167fe7 + 8a709a68; fresh local merge tree 3ea28242d905 == PR tree, no conflicts.
- Main delta #606/#625: only ci.yml overlaps (different jobs, both hunks present); #597 has no prisma changes or migrations; Schema parity approved-mode OK (104/104) vs baseline at 8a709a68.
- Local: 5 suites / 112 passed, 1 skipped (ops/aud-opus/jest_597_b6b3.log). Required CI all SUCCESS; shellcheck SC2015 pre-existing.

### mobile#306 @ 501a9e0b4101c0210efe2c8a7ad94ec96d712165 — APPROVE (A0 B0 C1 new) — fix round 6
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306#issuecomment-5941788926
- C-306-5 closed (SAFE_CODE identifier-only), C-306-6 closed (bare 401 = wrong creds only for email). Backend main bab05f44 contract: 401 "Email not confirmed..." -> email_unconfirmed; 401 "Invalid email or password" -> invalid_credentials; both exact strings pinned in r6 tests.
- C-306-8 Google 401 "email address is not verified" matches the provider-agnostic unconfirmed text -> "open the link we sent" copy for Google (rare).
- Local: 29 PR test files -> 29 suites / 390 passed (ops/aud-opus/jest_306_r6.log). CI 4/4 SUCCESS.

### backend#622 @ 42f2013dfc4f0fc62a50f146f80fbd23cc460251 — APPROVE (A0 B0, C-622-6/7 carried) — merge train
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/622#issuecomment-5941848049
- Pure integration: parents fcb984f2 + bab05f44; fresh local merge tree dfef0ced == PR tree, no conflicts. Overlap only .env.example, prod-switches.yml (dup set identical to main), ci.yml (adds the R2a RLS step).
- Migration 20270203000000_ai_processing_consent_ledger orders after #625's 20270125000000_; forward/reversible SUCCESS on the full chain. Schema parity approved-mode vs baseline at bab05f44: 104/104 OK; baseline file untouched.
- Local: 7 suites / 209 passed (ops/aud-opus/jest_622_42f2.log). CI all SUCCESS incl. rls-live-tests (consent RLS suite 27/27); shellcheck SC2015 pre-existing.

### backend#626 @ 360d8705acdd73c68b01640b753087bca06819fe — APPROVE (A0 B0 C3) — R2b AI egress gate, full T4
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/626#issuecomment-5942230057
- Only src/ai-egress constructs SDK clients and calls providers; every send awaits assertMaySend; live ledger read per send (flag off or error = no grant); client data only to anthropic; retries/repairs re-check; wearables checks before cache. Crons/brief/triage filter to consenting ids and re-check at send; partial-consent brief re-aggregates from consenting ids only; triage cache key covers exact consented set. 403 ai_consent_required / 503 ai_egress_blocked / 404 tenancy pre-flight before consent read; refusals never wrapped. Forks hold (flag ON at clinic deploy; head-coach business brief and Roman coach surface exempt; triage/404 side effects). Diagnostic noted only (being removed).
- C-626-1 guard is a source lint (call sites still hold SDK instances; aliasing/bracket shapes pass) -> egress owns clients; C-626-2 stored AI outputs from before a withdrawal remain served (brief row, drafts); C-626-3 triage send-time refusal collapses to empty triage.
- Local: 14 suites / 298 passed (ops/aud-opus/jest_626.log). CI all SUCCESS at head.

### mobile#306 @ 33eec6bcaa4951bd672b651faae61b80bb5f3153 — APPROVE (A0 B0, no new C) — fix round 7
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/306#issuecomment-5942285811
- C-306-8 closed (provider-specific unverified-email copy). Google backend failure is now a failure (provisional session and user_data removed; no server_confirmed bypass). Identity-free markers match only identity-free sign-ins; method-only kept for the refusal caution only (removes my r5 accepted residual). Provider config faults referenced and reported; native Apple codes through SAFE_CODE; provider invite refusals mapped.
- Local: 31 PR test files -> 31 suites / 411 passed (ops/aud-opus/jest_306_r7.log). CI 4/4 SUCCESS.

### backend#599 (merge train) @ 8ae0fea5341b1e832356e725fafb46ee1025ea71 — APPROVE (A0 B0 C3: C-599-1/2 carried, C-599-3 new optional)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/599#issuecomment-5942356078
- Pure integration verified: patch-id of diff(10dff85c, 894263f5) == patch-id of audited diff(e3167fe7, 7b496aca) (c3c450fc); merge-tree(base e3167fe7, 10dff85c, 7b496aca) tree == 894263f5 tree (1f7c5d1f). 12-hunk table consistent. No migration/schema change; parity green.
- 8ae0fea5 reviewed fully: one coach_cannot_redeem constant + body shared with select-role; warn log (id + role only) restored; no decision/status change. C-599-3: owner refusal copy has no next step.
- Local: 7 suites / 149 passed (ops/aud-opus/jest_599_8ae0.log). CI all SUCCESS.

### backend#624 @ 1159da9bd4391aa50b13131cccb008623d06e17e — APPROVE (A0 B0; B-624-1 closed; C-624-4/5 new; C-624-1/2/3 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/624#issuecomment-5942356461
- Range-diff: 3 audited commits identical after rebase onto 10dff85c; delta 7654b3ad + 1159da9b. Malformed unregistered names -> MALFORMED_n + length bucket (probe: absent from JSON and markdown). Post-check via --json + jq; specific errors. Registrations match code defaults.
- C-624-4: new deploy_staged=true runs fly secrets deploy (applies every staged secret on the app; rolling restart). C-624-5: well-formed unregistered names still printed (by design).
- Local: 6 suites / 202 passed, 1 skipped (ops/aud-opus/jest_624_1159.log). CI green except pre-existing shellcheck SC2015 (s10-core-diff-gate.sh, also failing on main).

### backend#610 @ d1e1732f0196490746ce9a09b7fc93685f29afdc — REQUEST CHANGES (A0 B1 C4) — UGC safety, full T4 (head as is, BEHIND main)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5942471860
- PASS: two-way block on every src/community read route (route guard enumerates Nest metadata over all controllers; unclassified/stale fail); 404 reuse for hidden content; ban refuses workspace coach + platform owner and runs before any write; removed membership is never re-activated by bootstrap; content filter on post/comment/message/DM/challenge-comment create+edit; first names only to members; DM report/react participants only; voice writes behind FEATURE_COMMUNITY_VOICE_NOTES (off); coach-member block hides coach content (accepted).
- B-610-1: member wins (POST /community/wins, GET /community/feed; live in mobile More > Community, no flag) have no content filter and no report target; coach-less clients see every tenant's public wins. Fix: gate behind the community flag (voice-note treatment) or add filter + report + no cross-tenant public feed.
- C-610-1 DM 403 dm.blocked distinguishes block from 404 not_found and gives the blocker no unblock step; C-610-2 guard limits (src/community GETs; checks method body, not handler wiring); C-610-3 cannot_ban_coach has no message; C-610-4 community DB e2e suites skip without COMMUNITY_TEST_DATABASE_URL.
- Local: 22 changed specs -> 14 suites / 247 passed, 8 DB suites skipped (ops/aud-opus/jest_610.log). CI all SUCCESS (no parity run: base predates it; no migration).

### mobile#314 @ 2f7789eca795d6fe7f895ae2b498435605feec01 — REQUEST CHANGES (A0 B1 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/314#issuecomment-5942472172
- Contract matches #610 (report/block endpoints and shapes; 6 SafetyMenu sites; Block hidden on own and own-coach content; 16 mapped codes exist on backend; reference + support + one sanitised Sentry event).
- B-314-1 (root B-610-1): legacy wins screen (More > Community) is live UGC without Report/Block, outside featureFlags.communityTab. C-314-1 duplicate report entry on challenge comments; C-314-2 block copy mentions voice notes; C-314-3 blocker DM copy.
- Local: 6 suites / 131 passed (ops/aud-opus/jest_314.log). CI 4/4 SUCCESS.

## mobile#310 @ 1d7cc72058fdff5e95faa6db751299e203ea6d28 (T4 Opus lens, round 4) — APPROVE, A0 B0 C3
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310#issuecomment-5942613385
- Verified: D2 copy exact vs contract; box 2 sha equals backend main CLIENT_AI_CONSENT_COPY_SHA256; API matches merged #622; B-310-3/4, C-310-6/7 closed; flag default off (clinic profile on); merge-tree with main 56d4fc6 clean. CI green. Local 12 suites / 246 passed.
- C-310-8 release order: clinic build needs backend #607 (/me/onboarding, still open) deployed first; ledger flag on at the same clinic deploy as #626. C-310-9 unknown box-2 state after the 3 s fallback sends nothing. C-310-10 merge order with #313 (DeleteAccountScreen conflict; keep the draft purge).

## backend#608 @ 117596803ecf48e424f9d4a9cefc47b7bcc71f78 (T4 Opus lens) — APPROVE, A0 B0 C3 (+C-608-2 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/608#issuecomment-5942613902
- Verified: receipt endpoint answers only for a Supabase-signed token's own subject (iss/aud/ES256/signature kept, 30-day expiry tolerance), same 404 for live and unknown, throttled; receipt key hashed, written after identity removal, dropped after 30 days; guard 403 ACCOUNT_DELETED vs 401 USER_NOT_FOUND; AiProcessingConsentEvent manifest DELETE; export fence (RUNNING-only READY, own-file delete, 0600, orphan sweep). No migration. Required CI green (shellcheck SC2015 pre-existing). Local 17 suites / 293 passed.
- C-608-7 unkeyed receipt digest (use HMAC). C-608-8 per-machine export files survive up to ~25 h on other machines. C-608-9 Apple secrets workflow uses `secrets import` without --stage (rolling restart).

## mobile#313 @ 4c6028d580d537a97af917d9515a8439140d652f (T4 Opus lens) — APPROVE, A0 B0 C2 (+C-313-5 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/313#issuecomment-5942613690
- Verified: re-auth, schedule, ACCOUNT_DELETED and receipt contracts match #608; receipt call skips refresh; deletionErrors copy specific with reference and support address. CI green. Local 6 suites / 79 passed.
- C-313-7 raw axios error to Sentry (holds the re-auth body; not serialized by default integrations). C-313-8 conflicts with main (#306, appleAuth.test.ts) and with #310; rebase, keep the draft purge, delta check.

## backend#627 @ 606b4760efb2b35ab4a5fded7bea034f88fec101 (T4 Opus lens, S-FEE round 2) — REQUEST CHANGES, A0 B2 C2
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/627#issuecomment-5942708157
- Holds: actual-fee split math, settle CAS + fixed-amount transfer outbox with idempotency keys, legacy detection, free/$0 never settle, migration RLS/CHECKs. Required CI green; merge-tree with main 53b625d2 clean. Local 11 suites / 215 passed.
- B-627-1: a failed webhook-time settlement is never retried automatically (errors swallowed -> 2xx; sweeper is admin-endpoint only, no cron; backfill skips purchases that already have a settlement and anything older than 14 days -> missed renewals never paid). Fix: cron the sweeper, backfill per paid invoice without a settlement, alert on stale awaiting rows.
- B-627-2: no per-charge lock across applyAdjustments/convergeLeg; probe (ops/aud-opus/probe_627_concurrency.*) shows two concurrent refund states reverse 1960 + 2940 against a 1690 target (coach over-recovered by 1960), and a duplicate delivery double-counts the ledger reversal (3920 vs 1960). Fix: advisory/row lock per charge, absolute reversed amounts, concurrency test.
- C-627-1 migration timestamp sorts before #622's 20270203 (rename on rebase). C-627-2 #608 manifest needs ChargeSettlement/PayeeRecovery user columns (whichever lands second).

## Handoff (19:10 wrap-up order)
- Not started: backend #630 @ 5b873988 (recipes private, T4). #628/#322 on hold per operator. #595/#604 merge-train heads pending (after #599, now merged as 53b625d2). Re-checks owed after rebases: #313 (conflicts with main and #310), #627 fix round.
