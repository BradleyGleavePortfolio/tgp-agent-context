# B-AUDIT-GATE — Claude Opus 5.5 builder (T4: trusted CI enforcement), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports, Final
answer), /home/user/workspace/ops/_BUILD_COMMON.md, then /home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict).
Report: /home/user/workspace/ops/reports/B-AUDIT-GATE-114.md.

Problem (verified by the operator 18:45 PDT): the backend required check "npm audit (high+critical, whole graph)"
(.github/workflows/dependency-audit.yml, fail-closed `npm audit --package-lock-only --include=prod --include=dev --include=optional
--include=peer --audit-level=high`) now fails on EVERY backend PR because of GHSA-vfj7-8cjw-p6xm (CVE-2026-93687, braces <= 3.0.3,
stack-exhaustion DoS via deeply nested patterns; advisory updated 2026-10-02 22:36Z; NO patched version exists on npm: latest braces is
3.0.3). In backend's lockfile braces has one copy, node_modules/braces 3.0.3, dev:true, reached only through micromatch (dev). The other
"high" lines are the same advisory propagated through micromatch. Example failing run: actions/runs/37086679478 (PR #608).

Operator ruling OR-114-2: keep the gate fail-closed and add the narrowest possible, time-boxed, self-verifying exception. New branch from
origin/main, ONE PR "ci(audit): time-boxed dev-only exception for GHSA-vfj7-8cjw-p6xm (braces, no patch)", tier T4 in the body.
Design (improve if you find a stricter equivalent; never broaden):
1. Keep the job name EXACTLY "npm audit (high+critical, whole graph)" (it is a required context) and keep the same audit scope
   (--package-lock-only, all four --include flags, high threshold, whole graph).
2. Run `npm audit --json` with those flags and evaluate the JSON with a small checked-in script (scripts/ci/audit-gate.mjs or similar, no
   new dependencies). Fail if ANY high/critical vulnerability is not fully explained by an exception. An exception file
   (.github/audit-exceptions.json) lists entries {ghsa, package, max_version, reason, expires (ISO date), owner_ruling}. An entry applies
   only if: the advisory id matches exactly; today (UTC) is before `expires` (set 2026-10-31); EVERY lockfile copy of that package is
   dev:true and none is optional-prod/peer-prod (read package-lock.json; if any copy is prod, the exception does not apply and the job
   fails); the locked version is <= max_version. Vulnerabilities whose `via` chain is only the excepted advisory (e.g. micromatch ->
   braces) are covered; anything with any other advisory in its chain is not. Moderate/low stay non-blocking as today.
3. The job prints every applied exception loudly (advisory, package, expiry, reason) and, once a patched braces exists on the registry
   (npm view braces versions), the job FAILS with "patched version available: upgrade and delete the exception" so the exception
   cannot outlive the fix. If the registry is unreachable, treat it as no patch and continue (never fail open on the audit itself).
4. Tests under test/ci/ (jest) with JSON fixtures: no vulns -> pass; excepted dev-only braces -> pass; same advisory but a prod copy ->
   fail; expired exception -> fail; a different high advisory -> fail; mixed via chain -> fail; patched version available -> fail;
   malformed exception file -> fail. Each test fails before the script exists.
5. Prove it live: the PR's own "npm audit (high+critical, whole graph)" run is green and its log shows the applied exception; also
   show (in the PR body) a local run of the script against the real lockfile + real audit JSON.
6. All 11 required checks green at your head. Post "READY FOR AUDIT — growth-project-backend#<n> @ <full sha>".
Item 2 (separate PR, only after item 1 is READY): the same audit shows a MODERATE prod advisory GHSA-3pph-fpjx-jg34 (multer DoS via
orphaned disk writes on aborted uploads). If a patched multer exists, open a small PR bumping it (lockfile change allowed in this
dedicated dependency PR), run the upload-related specs, and state the tier (T3 unless it changes behavior). If no patch exists, record
that in the report and stop.
Never touch branch protection. Never merge. Final answer (<300 words): PR numbers, heads, checks, anything for the operator.
