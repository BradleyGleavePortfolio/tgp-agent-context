# AUD-OPUS-2 report (second Claude Opus 5.5 lens, operator agent 110; consent + UGC)

## backend#626 @ d9be0c0d47859d6eb7bf76ddaa74372e2aa8da3b — APPROVE (T4 re-audit; A0 B0 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/626#issuecomment-5946273863
- Both main merges are pure (merge-tree 68902e6f and 599da90b match the commit trees); the main side has no AI-egress change.
- B-626-2 CLOSED: the SSE error frame is allowlisted to exactly {code,message}; the reference is the X-Request-ID header. The contract spec's mobile schema is identical to mobile main romanApi.ts:173-178. C-626-4 CLOSED: triage failure gives 503 ai_triage_unavailable, uncached. A-626-1/2, B-626-1, C-626-1/3 still closed (files unchanged).
- Bypass hunt: no SDK, provider host or other AI vendor outside src/ai-egress; every caller goes through the gate.
- C: C-626-5 carried (gate retries stack, cost only). C-626-6 new: in-stream Roman errors never reach Sentry. C-626-7 new: a failed consent read is shown as "you have not allowed AI help".
- Release blocker outside the PR (R-626-1): the box-2 consent copy (backend ai-consent.constants.ts:34 and mobile #310 copy.ts:33) still says chats are "kept for 180 days". The owner decided at 20:32 to keep them forever, and no purge exists. Needs a coordinated client-ai-v4 copy bump; filed as a B on #310.
- Local: 9 suites / 136 tests passed (heavy.sh, log ops/aud-opus2-110/jest_626_d9be.log). CI: 9/9 required checks plus Schema parity SUCCESS.

## mobile#326 @ 32ed85460dc8b6d0b2c0f10e82f3459b2f454589 — REQUEST CHANGES (T4 first audit; A0 B2 C3)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5946335206
- Holds:
  - Refusal detection reads status plus code.
  - The strict SSE parser is unchanged and matches #626.
  - All 7 surfaces are mapped.
  - Copy is clean: specific, with working actions and a reference.
  - aiConsentApi/correlation are byte-identical to #310.
- B-326-1: on any failed POST, including a lost response, timeout or 5xx, the consent sheet says "AI help is still off". The grant may be on file (Sol's B-310-5 class). Fix: re-read GET once, then "not confirmed" copy.
- B-326-2: the sheet grant bypasses #310's runAiLedgerWrite queue and pending-withdrawal marker.
  - The merged-tree probe (ops/aud-opus2-110/probe_326x310_sheetVsPendingWithdrawal.test.tsx, PASS) shows the next foreground drain withdraws the client's newer yes.
  - #326 also cannot ship without #310: the sheet and coach copy point to Settings > Privacy, and main has no withdrawal path at all.
  - Fix: land #310 first, then the sheet clears the marker and grants inside the queue.
- C-326-1: an in-stream refusal rolls back a turn the server already stored. C-326-2: the needs_reconsent copy is inaccurate. C-326-3: egress_blocked is not sent to Sentry.
- Local: 6 suites / 108 tests passed. CI: all 4 checks green.

## mobile#310 @ e1dbe7f93597b988ca989b2343c016a4ac9320fe — REQUEST CHANGES (T4 delta; A0 B1 C1 new; C-310-8/9/10 carried)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/310#issuecomment-5946350633
- Merge 62015d9: the RootNavigator conflict is resolved correctly (remerge-diff), and #320's camelCase read is kept.
- Sol B-310-5 is closed in code. Ambiguous grant outcomes become unconfirmed/aiAttempted, a later no always sends an idempotent DELETE, a per-user pending marker is drained on app open and foreground and in Settings, there is one ledger queue, and the copy says "not confirmed".
- e1dbe7f (T4 CI data): one manifest entry, flag, default off. It matches the code default and the clinic-only EAS setting. The guard is unchanged and OK.
- Consistent with #326 at the API level (identical blobs). The semantic conflict sits on the #326 side (B-326-2). C-310-10 holds: #313 is open at 1e80017b and conflicts in 3 files; the purge at DeleteAccountScreen.tsx:79 must survive.
- B-310-6: the box-2 paragraph (copy.ts:33, shown at P0 and in Settings) says Roman chats are "kept for 180 days". The owner decided at 20:32 to keep them forever, and no purge exists.
  - Needs a coordinated backend client-ai-v4 server-copy bump plus #310 copy, version and sha updates.
  - Operator decision: also bump consult-consent-v2 to v3 (recommended yes).
- C-310-11: the pending marker can be double-written, leaving a stale marker (harmless here; it widens B-326-2).
- Local: 7 suites / 182 tests passed, expected-env guard OK. CI: 4/4 green.
