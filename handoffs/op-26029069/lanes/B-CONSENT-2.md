# Lane B-CONSENT-2 (agent 111) — Claude Opus 5.5 builder: consent truth across #607, #326, #611 (T4 consent/privacy)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/CONSENT_D2_CONTRACT.md;
/home/user/workspace/ops/lanes110/B-CONSENT-COPY.md + /home/user/workspace/ops/reports/B-CONSENT-COPY-110.md (110's lane: it
opened backend #635 @0a32b4fe = client-ai-v4 copy + erasing Roman delete, and moved mobile #310 to f85ffd36 = AI copy v4 +
consult-consent-v3 + hashes; it died before the items below); /home/user/workspace/ops/reports/AUD-OPUS-2-110.md (R-626-1,
B-310-6, B-326-1/2, C-326-1..3); every AUDIT comment and fix-round comment on backend #607, #611, #635 and mobile #310, #326.
Owner rules: "keep past AI chats forever" (no time-based purge); OR-110-1 client chat delete + account deletion still erase;
privacy copy "kept until you delete them or your account"; support email everywhere = Bradleyapple1031@gmail.com; the
income/body/lifestyle diagnostic quiz belongs to a different product (remove it from TGP privacy text).
Do in this order, pushing each as soon as its tests pass (the auditors are waiting on step 1):
1. backend #607 @ e8feb0d2 (branch agent/clinic/c05-c07-onboarding/a02c2791): accept consult-consent-v3 exactly as mobile #310
   f85ffd36 defines it (version string + combined sha256 + byte-exact text parity), v3 only (no live clients on v2; same rule as
   the earlier "v2 only, no compat window"), update DEFAULT_CONSULT_CONSENT_COPY_VERSION, tests and the PR body. Merge main
   first if needed (merge commit, no rebase). Post a fix-round comment. Then append "STEP 1 DONE <head>" to your report.
2. mobile #326 @ 32ed8546 fix round: Opus B-326-1 (any failed/lost POST must re-read GET once, then "not confirmed" copy),
   B-326-2 (the sheet grant must go through #310's runAiLedgerWrite queue and clear the pending-withdrawal marker; #326 cannot
   ship without #310 -> make #326 stack on #310's branch (base = #310 head branch) so it lands after #310), C-326-1..3, and every
   Sol B-326-x. Keep byte parity with #635's v4 copy.
3. backend #611 @ e5777735 fix round: every open Sol finding (0/4/1) and Opus finding; privacy copy for kept AI chats ("kept until
   you delete them or your account"), no 180-day sweep text, quiz text removed, ACCOUNT_DELETION_EMAIL -> the single
   SUPPORT_EMAIL (Bradleyapple1031@gmail.com), consistent with #635 and #310 copy. Note mobile #315 (dual-approved, DIRTY)
   ships with/after #611: do not touch #315; report whether #315 needs any change.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/B-CONSENT-2-111.md (append per PR). Final answer (<400 words): heads, findings closed,
tests, CI, open risks/decisions.
