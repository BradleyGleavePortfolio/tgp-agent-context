# B-CONSENT-2 (agent 111) — consent truth across #607, #635, #326, #611

Builder: Claude Opus 5.5. Never merged, never pushed main, no workflows dispatched, no production touched.
Scratch: ops/bconsent2-111/ (PR bodies, comments, logs/, probe/).

## Step 1 — backend #607 (agent/clinic/c05-c07-onboarding/a02c2791): e8feb0d2 -> b74384fb
- Merged main e5a6044a (f1eec9a0) and e5d10bd8 (7556aa95), merge commits, both clean.
- b74384fb: P0 accepts consult-consent-v3 ONLY, and only with text_sha256 = 79ceeb6b...31c9 (sha256 of the whole v3 screen,
  byte-identical to mobile #310 f85ffd36 consentCopyText(); builder cross-check: mobile text transpiled + hashed locally,
  1613 bytes). Paragraph 4 + box 2 digest fbf82140...34f4 = ledger client-ai-v4 (#635). New src/onboarding/consult-consent-copy.ts.
  One rule (onFileConsentVersion) for save gate, GET consent_recorded and completion. CONSULT_CONSENT_COPY_VERSIONS registered
  in ENV_RULES (optional, default, no validator); unknown names ignored + logged once.
- Local: 8 suites / 318 tests passed; env-validation + deploy-readiness 85 passed 1 skipped; tsc 0 (3.5 GB heap; 2.5 GB OOMs);
  eslint 0; R75 range OK. PR body updated (fix round 3 note + fix round 4 table); fix-round comment 5955587361.
- Mobile #310 needs no change for this.

STEP 1 DONE b74384fb3915f3b482384ddddb609e618bd8bc36

## Operator-added: backend #635 fix round (Sol B-635-1, C-635-1)
- Branch `agent/clinic/ai-consent-copy-v4`: 0a32b4fe -> **e7f67576fddfe77418b51a653d3492fcb43fba5f** (fast-forward push). Commits: merge of main e5d10bd8 = b012ae99; fix = dba3af5f; test pin = e7f67576.
- B-635-1 FIXED (no schema change, no migration prefix taken). A delete moves the row to `day_key = erased:<id>` inside the erase transaction, which frees the same-day unique key. The shell keeps only the content-free in-window user-turn count.
  - The open path keeps the P2002 race recovery. When an unerased pre-upgrade row holds today's key, the open path erases it and retries once; a second failure returns a 503 ROMAN_UNAVAILABLE with a next action.
  - The cap sums erased shells with an aggregate (the old 16-row bound is removed) and excludes unerased rows (no double count).
- C-635-1 FIXED. `RomanErasureSweep` runs 60 s after boot and at 04:00 UTC, and `eraseUnerasedDeletedSessions` erases every deleted row still holding a calendar day_key. It uses a per-row compare-and-set, is idempotent and bounded, never touches live chats, and sends failures to Sentry. The production inventory cannot be proven empty because I have no production access; the code handles any count.
- Tests:
  - The fake enforces the real unique key (Prisma P2002, with a negative control).
  - New live Postgres spec `test/roman/roman-session-erase.live.spec.ts` (8 cases), run by a new final step in `mwb-3-live-tests`.
  - New `test/roman/roman-erasure.sweep.spec.ts` (7 cases, pins the CI step and the provider).
- Local results:
  - `heavy.sh npx jest --runInBand --forceExit --runTestsByPath test/roman/{roman.service,roman-erasure.sweep,roman-session-erase.live,roman.controller,roman-streaming,roman-sse-error-contract,roman.prompts}.spec.ts test/ai-consent/{ai-consent.service,ai-consent.controller,ai-consent-dunning-lockout.e2e}.spec.ts test/module-graph.spec.ts`: 10 passed / 188 tests, live skipped. The sweep spec re-run after the extension: 7/7.
  - Live spec on local PostgreSQL 18.6 (MWB3_TEST_DATABASE_URL): 8/8.
  - tsc exit 0, eslint 0, R75 OK.
- PR body updated; fix-round comment https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5956261388
- Logs: ops/bconsent2-111/logs/635-*.log
