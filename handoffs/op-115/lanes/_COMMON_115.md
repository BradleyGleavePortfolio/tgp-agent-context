# Agent 115 lane common rules (SCALE 2 wave, owner 2026-10-03 10:15 PDT). This file WINS on any conflict.

Read in this order: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (governing rules, sandbox, git, PR body contract, audit
contract, report format), then THIS file, then your lane section in /home/user/workspace/ops/lanes115/LANES.md. Builders also read
/home/user/workspace/ops/_BUILD_COMMON.md; lenses also read /home/user/workspace/ops/_AUD_COMMON.md and
/home/user/workspace/ops/lanes/AUD-<SOL|OPUS>-3.md. Product decisions of the last 72 hours: /home/user/workspace/ops/LEDGER-72H.md
(binding). Law: /home/user/workspace/repos/tgp-agent-context/AGENT_RULES.md (G01-G22) + MODEL_ROUTING.md. Older "operator 113/114",
"Facts at ..." and lane names in those files are STALE: GitHub is the truth.

## Who and when
- Operator: agent 115 (Computer session 443a815b) from 2026-10-03 10:08 PDT. Owner (Bradley) said "SCALE 2 + EXECUTE" at 10:15 PDT:
  scale to 16 agents now, then STOP-AND-DRAIN. You are one of exactly 16 agents. NO agent will be launched to replace you, and a
  finished agent is never re-tasked. Whatever you leave unfinished waits for the owner's next SCALE. So:
  * BUILDERS own their PRs until each one is MERGED or dual-APPROVED (Claude Opus 5.5 + GPT-6.1 Sol) at a green, current head. After
    you post READY FOR AUDIT, poll your PRs with `/home/user/workspace/ops/prstate.sh <backend|mobile> <n>` (cached, cheap; sleep 120-240 s
    between polls, never tighter). When a lens posts REQUEST CHANGES or BLOCK at your head, do the next round yourself at once and fold
    BOTH lenses' open findings into that one round. While waiting on CI or audits, work your next queue item. Push progress at least
    every 20 minutes (green -> PR branch; otherwise wip/<lane>-<topic>) and keep your report current, so a credit cutoff loses nothing.
  * LENSES never end while builders run. Loop: `/home/user/workspace/ops/wait_audit.sh "<Claude Opus 5.5|GPT-6.1 Sol>" 1500
    /home/user/workspace/ops/lanes115/q/<YOUR-LANE>.txt` (use the longest command timeout your tool allows; if it returns early, call it
    again). Audit every PR it prints as AUDITABLE, oldest first. The queue file is re-read every loop; builders and the operator append
    new PRs to it. End only when /home/user/workspace/ops/lanes115/LENSES_MAY_END exists, or your budget is nearly spent (then write
    your report HANDOFF with what is still unaudited).
  * Everyone: end with a short final answer only when the rule above says you may.

## Facts verified 10:06-10:30 PDT 10-03
- Production backend = backend main = ec911328 (#608 deletion + data export, deployed 20:06 PDT 10-02). Mobile main = 4f1d74d8.
- Backend required checks (11, strict up-to-date): build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit
  (high+critical, whole graph), CodeQL JS/TS (javascript-typescript), Banned cast tokens (R75 / R100.A2), build-sbom, danger, Schema
  parity, community-live-tests. npm audit is GREEN on main (OR-114-2 braces exception merged in #663, expires 2026-10-31): every
  required check must now be green at your head, no exceptions. Mobile required (3, strict): Typecheck, lint, test / Analyze
  (javascript-typescript) / Analyze (actions). Ignore Release Please. Known flake: test/ci/release-evidence-gate.spec.ts:367 (rerun the
  failed job once with `gh run rerun <id> --failed`).
- Production migrations applied through 20270224000000 (+ 0220, 0221); 20270222* NOT applied. OR-113-4: out-of-order apply is proven
  safe; pending prefixes keep their numbers. Reserved: annex 20270301-20270306, #647 20270301000000 (own folder), #648 20270307000000,
  #609 20270213000000. NEW migrations in this wave use your lane block only: B-FEE-9 20270310*, B-RECUR-3 20270311*, B-DUNNING-7
  20270312*, B-TRIALS-3 20270313*, B-COACH-5 20270314*, B-NOTIF-6 20270315*, B-SCHED-ROMAN 20270316* (each must also be added to
  #608's deletion manifest when it holds a user id).

## Git, identity, workspace
- Full clones: /home/user/workspace/repos/{growth-project-backend,growth-project-mobile,tgp-agent-context} (tgp-agent-context is
  read-only for you and PUBLIC). `git fetch` first. gh/git need bash api_credentials=["github"]. Owner: BradleyGleavePortfolio.
- Your worktrees only: /home/user/workspace/wt/<LANE>-<n>. Remove them when your lane ends.
- Commit identity: `git -c user.name="TGP Agent 115" -c user.email="agent@tgp.invalid" commit ...` (identity is not a gate; owner).
- Merge origin/main with a merge commit; never force-push, never rebase a pushed branch.
- Deps: wait for /home/user/workspace/deps/<backend|mobile>/READY (mobile may still be installing at launch: read code first), then
  `/home/user/workspace/ops/link_deps.sh <backend|mobile> <worktree>`; backend then `/home/user/workspace/ops/heavy.sh npx prisma generate`.
- Sandbox (2 CPU, 7.9 GB, 16 agents): EVERY heavy command through /home/user/workspace/ops/heavy.sh (never wrap it in a short timeout).
  Targeted jest only (`heavy.sh npx jest --runInBand --ci <files>`), eslint/prettier on changed files. NEVER run full tsc or the full jest
  suite locally (it OOMs this box; two lanes did last night): push and let GitHub CI run them (`gh pr checks <n>`, `gh run view <id>
  --log-failed`). GitHub CI is the parallel engine; never sit idle on one PR.
- Reports: /home/user/workspace/ops/reports/<LANE>-115.md (append as you go; end with "## HANDOFF").

## Builder contract (every builder lane)
1. Sole writer of the PRs in your lane. Never push to, comment fixes on, update-branch, or audit any other PR.
2. Before coding, read EVERY AUDIT and FIX ROUND comment on your PRs; list each open finding (A/B/C) from BOTH lenses at their latest
   verdict heads; verify claimed-but-uncommented fixes in code + tests.
3. Close every A and B (and every cheap C) with code + a test that FAILS before and PASSES after (show both). Do it right once: the next
   verdict from both lenses must be APPROVE. More functionality, never less.
4. Pre-push checklist (binding): (a) no free-form text, emails, tokens or message bodies reach logs/Sentry/analytics (ids and codes
   only); (b) every await followed by a state write re-checks account/session identity; (c) cancellation/unmount races covered by a
   test; (d) copy: no "we/us/our", no exclamation marks, no generic errors, no emojis, Quiet Luxury voice; (e) failing-before test per
   finding.
5. Post one comment per PR per round: "FIX ROUND <k> (<LANE>, agent 115) — <repo>#<n> @ <full 40-char sha>" with a finding -> change ->
   commit -> test table; update the PR body (tier header, Fix round table); end with the line "READY FOR AUDIT" ONLY when every required
   check is green at that exact head. Merge-only updates you make for conflicts: "FIX ROUND <k> (merge-only) ... READY FOR AUDIT".
6. A NEW PR you open: tier header in the body, then append "<backend|mobile>#<n>" to the queue files of BOTH lenses that cover it
   (/home/user/workspace/ops/lanes115/q/AUD-*.txt; see LANES.md for which), and post READY FOR AUDIT when green.
7. Strict branch protection: the OPERATOR merges and runs mechanical update-branch (merge-only, no conflicts). If your PR is DIRTY
   (conflict), you resolve it with a merge commit and post a merge-only FIX ROUND.

## Lens contract (every audit lane)
- Verdict first line exactly: `AUDIT <Claude Opus 5.5 | GPT-6.1 Sol> — <repo>#<n> @ <full 40-char sha> — VERDICT: APPROVE | REQUEST
  CHANGES | BLOCK`, then A/B/C counts and findings with IDs (B-<n>-<k> etc.), each with file:line, a concrete counterexample or probe,
  and the fix rule. Re-read the head right before posting; one verdict per PR per head. APPROVE only with zero A and zero B.
- First decide YOUR lens's prior findings on that PR (closed with code + failing-before test, or not), then audit the rest at the tier
  in the body (raise it if money, auth, privacy, tenancy, health data or deletion are touched: max-tier rule).
- Merge-only heads (operator update-branch or builder conflict merge): delta audit — confirm the new head adds nothing beyond main plus
  any conflict resolution (`git diff <your last verdict head> <new head>` against main's changes; read every conflict hunk), then post a
  verdict at the new head. Fast but real.
- Findings outside the diff: note them as "outside this diff" (C) unless they make the PR unsafe.
- Probes go in /home/user/workspace/ops/aud-115/<LANE>/; never push to PR branches.

## Binding rulings (newest wins; full list in LEDGER-72H.md and repos/tgp-agent-context/LAST_OPERATOR_STATE.md)
- Recurring packages are the owner's most critical item: native PaymentSheet subscriptions (default_incomplete, first-invoice PI);
  never one-time-only. Fee = price - actual Stripe fee - 2%. $19.99 floor or free. Real free trials (coach sets 0-30 days, card up
  front, one per client per coach, trial-ending notice). Apple Pay / Google Pay in the sheet off-by-config until merchant ID.
- Dunning: retries Days 1/3/7; Day-10 lockout; card update during dunning auto-charges the open invoice; cancel during dunning voids
  the invoice and ends access; voluntary cancel keeps access to period end; free/code grants never enter dunning.
- OR-112-13 pairs merge together: #627/#321, #654/#334, #628/#322, #640/#328, #609/#312, #641/#329+#332, #656/#338, #634/#325.
- OR-114-4 more functionality: #332 CSV export ships as a real .csv attachment (follow-up mobile PR with expo-file-system).
- OR-115-1 #651 C-651-5: keep the safety audit row and ids; no crisis/health words in audit action names, ledger metadata or info logs:
  one neutral action (roman.safety_route) + a closed reason code in a single restricted-read field covered by the #608 manifest.
- OR-115-2 #651 FR1-651-7: keep (crisis 911/988 templates answer without box-2 consent; nothing reaches the processor).
- OR-115-3 #603 carry-overs (2,000-char cap; AI Guide calorie floor 1200 F / 1500 M): one separate PR (T4).
- OR-115-4 mobile copy on main ("On our side", retired-period comment, "write to us", first-person errors): one copy PR with a
  repo-wide voice guard test.
- OR-115-5 docs/OTA_UPDATES.md clinic Health Connect line: whichever of #305/#317 merges second fixes it.
- #322/#334 both edit ClientPackagesScreen.tsx: the second to merge keeps the native card-update screen. #654/#628 both define a
  never-entitled check: the second to merge unifies them into one helper. #641/#656 edit the same package files: second resolves.
- AI chats are kept until the client deletes them or the account (never "180 days").

## Never
- Merge; update-branch another lane's PR; dispatch any workflow other than the CI-lane list below (never fly-*, release-please, h4-readiness); touch production, Fly, Supabase, Stripe, Expo or EAS; start any build;
  change branch protection, required checks or flag manifests in production; spend money.
- Name the clinic partner anywhere (say "the clinic partner"); commit the coach welcome text (runtime config only).
- Edit lockfiles unless your lane scope says so. Touch importer/scout, Dependabot or annex PRs (#657-#660).
- Use timestamps you did not get from `date`.

## GitHub CI lanes (OWNER 2026-10-03 10:27 PDT, verbatim: "use github CI lanes for speed") — BINDING, wins over anything above
This sandbox is saturated (2 CPU, load ~11 with 16 agents). GitHub Actions is free and parallel for these PUBLIC repos. Default to CI:
- `ci.yml` in BOTH repos accepts workflow_dispatch on ANY branch: `gh workflow run ci.yml -R BradleyGleavePortfolio/<repo> --ref <branch>`,
  then `gh run list -R ... --workflow ci.yml --branch <branch> -L 1` and `gh run watch <id> --exit-status` / `gh run view <id> --log-failed`.
  Backend ci.yml runs build-and-test (full jest + tsc), rls-floor-guard, rls-live-tests, community-live-tests, mwb-3-live-tests (own
  Postgres services). Also dispatchable and safe: schema-parity.yml, dependency-audit.yml, migration-dry-run.yml (throwaway Postgres),
  sbom.yml, infra-lint.yml. NEVER dispatch fly-*.yml, release-please.yml, h4-readiness.yml or anything that deploys or sets secrets.
- BUILDERS: failing-before proof runs in CI, not locally. Push the new test(s) alone to `ci/<LANE>-<pr>-before` (branched from your PR
  head), dispatch ci.yml, and cite the red run URL + failing test name in the FIX ROUND table. Push the fix to the PR branch; the PR's own
  CI is the "after" proof. Run several `ci/<LANE>-*` experiment branches in parallel when you are unsure between approaches. Local jest:
  at most ONE spec file at a time through heavy.sh, only when it saves a CI round trip; never tsc or full suites locally.
- LENSES: probes run in CI too. Branch from the exact PR head to `audit/<LANE>/<pr>-<probe>`, add the probe spec only, push, dispatch
  ci.yml, cite the run URL (red = counterexample proven) in the verdict. Never push to a PR branch.
- While CI runs (backend ~10-15 min), work the next item; never wait idle. Delete your ci/* and audit/* branches when your lane ends
  (`git push origin --delete <branch>`).

## Audit claims (operator 10:47 PDT; more lenses were added): BINDING for every lens
- Right before you start auditing a PR head, claim it atomically: `mkdir /home/user/workspace/ops/lanes115/claims/<backend|mobile>-<n>-<head8>-<opus|sol>`
  (head8 = first 8 chars of the head sha; opus for Claude Opus 5.5 lenses, sol for GPT-6.1 Sol lenses). If mkdir fails, another lens
  of your model owns that head: skip it. wait_audit.sh already hides heads claimed by others.
- Lenses (lens model must never sit idle) do NO heavy local work: probes run in GitHub CI (section "GitHub CI lanes").
