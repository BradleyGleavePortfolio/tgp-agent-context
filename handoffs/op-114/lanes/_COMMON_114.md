# Agent 114 lane common addendum (read AFTER /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; this file wins on conflict)

- Operator: agent 114 (Computer session d11c4bf8), from 2026-10-02 18:13 PDT. Wherever AGENT_BRIEF_COMMON.md says "operator 113" or
  "agent 113", read "operator agent 114". Its "Facts at 16:20" and older facts sections are STALE; GitHub is the truth.
- Facts verified 18:15-18:20 PDT: production backend = backend main = 53b6d472 (#610 deployed 16:55; /health ok, /readyz db up).
  Mobile main = aae30ac0 (#330 merged 17:08). Highest applied migration in prod includes 20270224000000 and 20270211000000.
  Backend required checks (11, strict): build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical,
  whole graph), CodeQL JS/TS (javascript-typescript), Banned cast tokens (R75 / R100.A2), build-sbom, danger, Schema parity (migrations
  match schema.prisma), community-live-tests. Mobile required (3, strict): Typecheck, lint, test / Analyze (javascript-typescript) /
  Analyze (actions). Ignore Release Please. Known flake: test/ci/release-evidence-gate.spec.ts:367 (rerun the failed job once).
- Commit identity: `git -c user.name="TGP Agent 114" -c user.email="agent@tgp.invalid" commit ...` (identity is irrelevant per owner).
- Reports: /home/user/workspace/ops/reports/<LANE>-114.md (append as you go, end with "## HANDOFF").
- OFF LIMITS (owned by sub-manager session 114-S; never push, comment fixes, or audit unless the operator re-tasks you):
  mobile #305, #317, #326, #315, #325; backend #634, #651. Also off limits: annex PRs (#657-#660 and any "Builder: TGP annex lane" PR),
  every PR not named in your lane file, Dependabot, importer/scout.
- GitHub CI is the parallel engine (free for these public repos): push early, let build-and-test/tsc/full suites run in CI, run only
  targeted jest locally through /home/user/workspace/ops/heavy.sh --runInBand. Read CI with `gh pr checks <n>` and
  `gh run view <id> --log-failed`. While CI runs, keep working (next item, next finding); never sit idle on one PR.
- Owner bar (binding): hyperscaler quality; wall clock is the #1 resource; do it right the first time (no audit ping-pong); more
  functionality, not less; pristine Apple-level UX; no generic errors ever; Quiet Luxury copy (no emojis, no exclamation marks, no
  first-person "we/us" in client-facing error copy). Recurring packages are the owner's most critical item: never compromise to
  one-time-only.
- Never merge, never update-branch someone else's PR, never dispatch workflows, never touch production/Fly/Supabase/Stripe/Expo,
  never start an EAS build, never change branch protection or flags. Never name the clinic partner; never commit the coach welcome text.
