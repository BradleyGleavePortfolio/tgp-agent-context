# Lane B-315-ERR (agent 112, post-stop light round) — Claude Opus 5.5 builder, mobile PR #315 only

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Commit identity: git -c user.name="TGP Agent 112" -c user.email="agent@tgp.invalid".
gh/git need bash api_credentials=["github"].

PR: BradleyGleavePortfolio/growth-project-mobile #315 "fix(trust-center): open the real privacy policy, link the consumer health
policy, accurate disclosures", branch agent/clinic/policies/m3v8r1tz, head de1c79aa (T3). Last dual APPROVE was at d9c2e669.

Task (operator ruling OR-112-15; owner rule "no generic error messages, ever"): src/screens/TrustCenterScreen.tsx ~line 370 shows
"Could not open this page right now. Please try again later." when a policy link fails. Replace it with specific, actionable copy:
- name the page that failed (e.g. "Privacy Policy", "Consumer Health Data Policy");
- by cause: offline -> say so and to tap again once connected; device can't open links (Linking.canOpenURL false / openURL throws)
  -> give the exact web address to open in a browser; anything else -> the web address plus the support email
  (use the shared SupportEmailFallback / support-email constant from mobile #324 if present on main; Bradleyapple1031@gmail.com);
- report unexpected failures to Sentry without PII (no email, no URL query strings);
- no first-person copy, no "Please try again later".
If the branch lacks main's f34b5b99 (#324: SupportEmailFallback), merge origin/main into the branch first (it is BEHIND anyway).
Tests: update src/screens/__tests__/trustCenterPolicyLinks.test.tsx; add cases per cause; they must fail on de1c79aa and pass after.
Run targeted jest via /home/user/workspace/ops/heavy.sh (never wrap heavy.sh in a short `timeout`), eslint on changed files, the
vendor-name/copy guards that CI runs (see package.json scripts). CI runs tsc + full suite.
Push to the #315 branch; wait for the 3 required checks green (max 30 min). Update the PR body fix-round table (row "OR-112-15
policy-link failure copy") and post one fix-round comment. An Opus auditor (lane AUD-OPUS-5) will delta-audit the new head right after.
Worktree: /home/user/workspace/wt/b-315-err, `bash /home/user/workspace/ops/link_deps.sh mobile`; at the end unlink node_modules and
`git worktree remove --force`. Report: /home/user/workspace/ops/reports/B-315-ERR-112.md ending with "## HANDOFF FOR AGENT 113".
Never merge, never dispatch workflows, never touch production. Final answer (<250 words): head, CI, copy shown per cause, tests.
