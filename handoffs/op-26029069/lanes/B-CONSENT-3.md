# Lane B-CONSENT-3 (agent 111) — Claude Opus 5.5 builder: consent chain round 3 (#635 first; T4 consent/privacy)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/CONSENT_D2_CONTRACT.md;
/home/user/workspace/ops/lanes111/B-CONSENT-2.md + /home/user/workspace/ops/reports/B-CONSENT-2-111.md (previous lane, finished;
its logs under /home/user/workspace/ops/bconsent2-111/). Owner rules: "keep past AI chats forever" (no time-based purge); OR-110-1
client chat delete + account deletion still erase; privacy copy "kept until you delete them or your account"; single support address
Bradleyapple1031@gmail.com. Release chain: backend #635 -> #607 -> mobile #310 -> mobile #326 (stacked on #310); #611 after deploy.
1. backend #635 @ e7f67576: BOTH lenses posted REQUEST CHANGES at this head after your predecessor finished — Opus 0/1/2 (its B was
   found at 0a32b4fe and first posted now) and Sol 0/2/3. Read both AUDIT comments in full and close every B (and cheap C) in one
   pass, each with a failing-before test (live PostgreSQL CI suites where the defect is a DB behavior). Merge main (now e867fe62+)
   with a merge commit. Push, fix-round comment, report "STEP 1 DONE <head>".
2. mobile #326 @ 8f8d6424: merge #310's new head c2414203 into it (stacked; merge commit), rerun its tests, push.
3. mobile #315 @ d9c2e669 (dual-approved, DIRTY; Trust Center): merge mobile main (merge commit), change the Roman line "deleted
   after 180 days" to "kept until you delete them or your account" (+ its pinned test), keep everything else; push and post a
   fix-round comment explaining the delta (it will need dual delta audits).
4. backend #611 @ 0ed698a4 publication hold B-611-1: write the vendor-deletion and backup/restore-erasure procedures as docs in the
   repo (docs/privacy/ — what is deleted where, by whom, in what time, how backups age out; no secrets, no patient data), linked from
   the PR body's ship-order table. Do not change approved copy beyond what audits require.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/B-CONSENT-3-111.md. Final answer (<400 words).
