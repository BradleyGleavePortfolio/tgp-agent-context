# B-CONSENT-COPY (agent 110) — AI-chat retention truth (T4 consent copy) + #326 + #611

Builder: Claude Opus 5.5. Status: IN PROGRESS. Never merged, never pushed main, no flags or workflows touched.

## Context read
- AGENT_BRIEF_COMMON.md, lane file, CONSENT_D2_CONTRACT.md, AGENT_RULES.md, LIVE_STATE.md.
- AUD-OPUS-2 verdicts: backend #626 (R-626-1), mobile #310 (B-310-6, C-310-11), mobile #326 (B-326-1/2, C-326-1..3).
- Sol verdict on mobile #326 (B-326-1..4). Every AUDIT comment on backend #611 (Sol x2, Opus x1) and the B-COPY fix round.

## Facts found on main (backend 7a6cfd82, mobile 0b7f197)
- Box-2 server copy `client-ai-v3` says chats are "kept for 180 days" (src/ai-consent/ai-consent.constants.ts:34).
- No Roman/AI-chat purge job or retention env exists on backend main (rg for retention/180/purge in src, env-validation, .env.example).
- `DELETE /roman/sessions/:id` is a SOFT delete on main (sets deleted_at; messages stay). So "kept until you delete them" would be
  false unless the client delete erases the transcript (OR-110-1). Fixed in the backend PR (see below).
- #607 (open, other lane) accepts only `consult-consent-v2` by default (`DEFAULT_CONSULT_CONSENT_COPY_VERSION`).

## 1. Backend PR #635 (new, onto main 7a6cfd82) — branch agent/clinic/ai-consent-copy-v4, head 0a32b4fe
- client-ai-v4 copy: "...private from your coach and are kept until you delete them or delete your account." combined sha256 fbf82140...
- v3 grants: unchanged exact-match rule -> needs_reconsent, no consent, history kept; POST v3 -> 409; withdraw recorded against v3.
- DELETE /roman/sessions/:id now ERASES (was soft delete on main): messages hard-deleted + subject context cleared in one tx;
  appendMessage refuses a deleted session; content-free in-window user-turn count kept so a delete never resets the daily cap.
- No 180-day purge job/config exists on main (nothing to remove). Account-deletion half depends on #608 (manifest erases Roman rows).
- Local: 7 suites passed (ai-consent x3, roman x4); tsc 0; eslint 0. Body: ops/bconsent110/be_pr_body.md.

## 2. Mobile #310 (agent/clinic/c05-mobile/95a5bd59): e1dbe7f9 -> f85ffd36

- Merged mobile main e3986e89 (#313) as 229beb3 (no rebase). Conflicts: TrustCenterScreen (took #313 navigation), DeleteAccountScreen (+test): kept #310 draft purge after successful requestDeletion (C-310-10).
- f85ffd3: B-310-6 copy v4 + consult-consent-v3 + hashes (P0 79ceeb6b...31c9, AI fbf82140...34f4 = backend #635), byte-exact parity test; B-310-7 `runAiLedgerWriteAs` / `grantAiChoiceAs` / `withdrawAiChoiceAs` identity fence for Settings (+ tests A->B held queue); C-310-11 `markAiPendingOnce` (test fails with 2 writes on old code).
- Local: jest 12 suites / 304 passed; check-expected-env OK; tsc 0; eslint clean (14 files). Pushed fast-forward. PR body updated (fix round 6 table, release order).
- #607 note for B-607-FIX lane: ops/bconsent110/607_consult_consent_v3_note.md (#607 default still consult-consent-v2 at e8feb0d2).
