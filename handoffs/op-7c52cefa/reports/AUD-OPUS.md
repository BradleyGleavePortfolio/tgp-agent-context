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
