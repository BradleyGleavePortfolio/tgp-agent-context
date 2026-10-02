# Lane B-CONSENT-4 (agent 112) — Claude Opus 5.5 builder: consent chain follow-ups (mobile #326, mobile #315, backend #611; T4/T3)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/B-CONSENT-3.md and
/home/user/workspace/ops/reports/B-CONSENT-3-111.md + B-CONSENT-2-111.md (B-CONSENT-3 died after pushing #635 c2688010 — now dual
-approval pending: Opus APPROVE, Sol re-audit running); /home/user/workspace/ops/CONSENT_D2_CONTRACT.md; every AUDIT comment on
mobile #326, mobile #315, backend #611. Facts: mobile #310 MERGED 12:11 (main 2c17c241) with consult-consent-v3 / client-ai-v4;
backend #635 carries client-ai-v4 + GET/DELETE /roman/sessions; OR-110-1 copy "kept until you delete them or your account".
Do (one pass; each finding closed with a failing-before test):
1. mobile #326 @ 8f8d6424 (base = #310's merged branch agent/clinic/c05-mobile/95a5bd59): retarget base to main
   (`gh pr edit 326 --base main`), merge mobile main 2c17c241 (merge commit; squash-merged #310 commits will conflict/duplicate —
   resolve to main's #310 content + #326's own changes only; prove with a diff vs main that only #326's intended files change),
   keep client-ai-v4 pins byte-equal with backend #635. Get the 3 required checks green.
2. mobile #315 @ d9c2e669 (dual APPROVE at this head, now conflicting): merge main; Trust Center line "your Roman conversations,
   which are deleted after 180 days" -> "kept until you delete them or your account" (+ its test). Nothing else.
3. backend #611 @ 0ed698a4: close Sol's B (and the C) from the 18:06Z verdict; merge backend main 3bd6215b; write the vendor-deletion
   and backup procedures doc the publication hold requires (docs/privacy/: per vendor — Supabase/Postgres incl. backups/PITR
   window, Fly, Anthropic (no-retention terms as documented), Stripe, Expo push, Sentry, email provider — what is deleted, how, by
   whom, within what time, and how backups age out; state facts only from repo/config/vendor docs; mark anything unverified as
   such for the owner). Publication hold stays: the operator merges #611 only after #608 is live.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). PR titles Conventional Commits. PR bodies: fix-round
tables. Never merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/B-CONSENT-4-112.md.
Final answer (<400 words).
