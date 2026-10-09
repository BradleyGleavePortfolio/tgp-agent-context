# Operator agent 134 HANDOFF (written 2026-10-08 22:3x PDT at 40k/45k credits)

Agent 134 took over from agent 133 at 19:2x PDT (start prompt: handoffs/op-133/AGENT_134_START_PROMPT.md). Owner goal: build 8
(Android clinic-apk + iOS clinic, auto-submit) carrying the consultative onboarding for every client and coach (134-1: the coach
consultation, prototype 75-86, is IN build 8 and build 8 waits for it), Roman knowing who he talks to, and the luxury screens.
"NO DO NOT KICKOFF A HALF ASSED BUILD."

## FINAL STATE (22:5x PDT, owner: "42k hit - start graceful stop and handoff documents for agent 135")
- SAFE STOP sent to every agent (22:39); all builders and lenses wrote their HANDOFFs (copied in ops/reports/). The only work allowed
  after the stop: LN-OPUS-D-134 and LN-SOL-D-134 verdicts on m#642.
- Merged today: 94 (last: m#635 22:32 B22/B24, m#623 22:35 coach consultation K5-K8, m#638 22:38 Back on 3 coach screens).
  Deploys today: 11 (production backend 30535548, deploy 11 live 22:19). Mobile main: cc5f67af.
- 41-problem register: 39 DONE (ops/BUGS134.md). Left: B29 (small polish PRs below), B41 (owner phone check of build 8).
- BUILD 8 NOT STARTED. It waits only for m#642.

## Agent 135: first moves, in order
1. m#642 (operator agent 134; Opus D REQUEST CHANGES B-642-1 at 2bc2a659 = two tests pinned build 7 numbers; round 1 at 314e4df2 missed androidHealthConnectConfig.test.js:41; round 2 fixes it, repo-wide search finds no other version pin, 12 suites 353/353 pass locally; Opus D and Sol D both REQUEST CHANGES at 314e4df2 for androidHealthConnectConfig.test.js:41, already fixed at 5ca5253f; both lenses stopped, so agent 135 gets one Opus + one Sol verdict at 5ca5253f (only that line and the version pins)): app.json iOS buildNumber 7 -> 8 and Android versionCode 6 -> 7 (eas.json appVersionSource
   local; EAS build:list shows iOS clinic 1.0.0 (7) and Android clinic-apk 1.0.0 (6) finished today, so without this the iOS submit
   is refused as a duplicate) + the K8 hand-off line (no coach tour exists; finishing lands on Clients): Roman line "Next is your Clients
   page. Share your link there to bring in your first client.", button "Go to my clients". Tests pass locally (19/19). Opus D + Sol D
   were asked for verdicts at 22:4x; check the PR comments. Merge via merge_if_dual.sh when both APPROVE at the exact head.
2. BUILD 8 at the main SHA that contains m#642: clean worktree, `cp -al` a real node_modules (lock identical to deps/mobile at
   cc5f67af), then (api_credentials ["custom-cred:a58dfd11-9a2a-4b51-b25e-a4c9ce356336@api.expo.dev"]):
   `bash ops/eas.sh build -p android --profile clinic-apk --non-interactive --no-wait` and
   `bash ops/eas.sh build -p ios --profile clinic --auto-submit --non-interactive --no-wait`. eas.json cli requireCommit true: the
   worktree must be clean. Send the owner the APK link and the TestFlight status.
3. Open PRs (each READY, CI green unless noted; reviewers' state from their HANDOFFs):
   - b#898 @765dd23c + m#637 @be853f88 (coachless coach-code card shows headline + specialties): Opus D APPROVE, Sol not yet. b#898
     needs deploy 12 after merge (no migrations expected; check).
   - m#639 @8f4b22a9 (P0 Continue says to tick the box): Opus D APPROVE (pre-READY), Sol E REQUEST CHANGES B=1 = PR-body parity
     correction only (no code). Fix the body, re-verdict.
   - m#640 @25305923 (sign-in underline inputs, "Continue with Google"): unreviewed.
   - m#641 @e60b8ec4 (coach Home cards to coach-home-solo, "Send a message" reachable, tab strip / greeting / numeral fixes):
     unreviewed (Sol D prepared notes in its HANDOFF).
   - Unpushed branch agent134/client-polish-134-f @2be89305 (Community tab label shrink-to-fit; tests pass locally) in the
     CLIENT-POLISH worktree (sandbox-local: re-create from the HANDOFF if the sandbox is gone).
   - Not started: Home "Allergies and restrictions" line (SHOTS-134B item e).
4. Decision for the owner (new, with default): coachless consent text. The server accepts only consent wording it already holds, so
   a coach-free consent for coachless clients needs new backend consent versions plus mobile (CLIENT-POLISH-134 wrote a removals-only
   draft in its report). Default: next lane after build 8, wording removals only (legal text).
5. Deferred by agent 134: live Roman eval "never claims to be the coach" (b#605 harness unmerged); K7 "Show me how" opens Import once
   the importer flag is on; SHOTS re-run (harness steps in ops/reports/SHOTS-134B.md) after the polish PRs; Home "Today" row style
   question from the owner (today's workout is the hero line "<plan> is ready." + the "Start <plan>" button).

## State at the first handoff write (22:3x, kept for history)
- Production backend: deploy 11 live 22:19 PDT at 30535548 (b#897), /health ok, /readyz db up. Deploys today: 11 (8-11 by agent 134).
  Deploy 10 included the additive migration 20270408000000_coach_consultation (has down.sql).
- Mobile main: e3c55596 (green). Merged today (both repos): 91.
- House seed APPLIED in production 21:18 (house-seed.yml run 37883078655, exercise_catalog=upsert, coach_id = the owner's coach
  account, found by SELECT: the coach User created 2026-10-08 14:33 PDT named "Bradley G..."; never put its email anywhere).
  SELECT check: 1 active house ClinicProgramSet owned by that account. 133-2, 133-9 (m#581 merged), 133-10 are closed.
- The 41-problem register: 36 DONE (ops/BUGS134.md, labels "from the code" / "seen in a test"; nothing seen on a device).
  Left: B02 B03 (m#623 K5-K8 re-verdict; b#898 + m#637 coach-code card), B22 (m#635 coachless never gated), B29 (two small coach
  follow-ups), B41 (the owner's phone check of build 8).

## Build 8 gate (all must be true)
1. Merged: m#623 (K5-K8, head fd7fd734 after a main merge; needs fresh Opus B + Sol B2 verdicts) and m#635 (B22/B24; Sol E APPROVE,
   Opus D asked). Nice-to-have before the build if they are already dual-approved: m#637 + b#898 (coach-code card), m#638, the
   COACH-HOME cards follow-up, COACH-INSETS-A follow-up (Back on Risk board / SubCoachDetail / CoachTeamProfile + 24 pt gutters),
   CLIENT-POLISH SHOTS items a-e (coachless consent coach lines: removals only, see JOBS134 "SHOTS-134B findings").
2. Backend deployed at main (b#898 needs deploy 12 if merged; deploy_when_green.sh <sha> "<label>" [apply-migrations]; pass
   apply-migrations ONLY when prisma/migrations changed since the running commit; the fly-deploy gate refuses otherwise).
3. Build from a clean main worktree with a REAL node_modules (hard-linked copy `cp -al deps/mobile/node_modules`, never a symlink:
   fingerprint mismatch). Agent 134 prepared wt/BUILD8-mobile (sandbox-local). Commands (bash, api_credentials
   ["custom-cred:a58dfd11-9a2a-4b51-b25e-a4c9ce356336@api.expo.dev"]):
   `bash ops/eas.sh build -p android --profile clinic-apk --non-interactive --no-wait` and
   `bash ops/eas.sh build -p ios --profile clinic --auto-submit --non-interactive --no-wait`. ops/eas.sh = eas-cli 24.12.0 with
   EXPO_TOKEN=proxy-injected; fetch.js patched so only api.expo.dev uses the proxy.
4. After the build: the owner's phone pass (B41) incl. a coachless test client reaching the macro reveal (LN-OPUS-A-134), a cold start
   on a stalled network (START-HANG-134), the "Community" tab label at 360 pt, consent at 360x800.

## Open decisions (defaults stand unless the owner says otherwise)
133-6 (separate optional coach-sharing yes, counsel wording), 133-15, 133-16, keep the 9 redesigned screens, Habits/Progress PRs
(merged), snapshot lines, 134-2 (owner's house account gets the flagged-screening alert for coachless clients but cannot open the
intake: default NO access), coachless consent variant (default: removals-only in CLIENT-POLISH if no backend change, else next lane).
V1.1 ideal (owner 21:0x): profile pictures (SoT A6.14 item 5).

## Fleet at handoff (all Opus 5.5 builders; lenses one Opus + one Sol per PR)
Running at 22:3x: CLIENT-POLISH-134 (m#635 + SHOTS items a-e), COACH-HOME-134 (cards follow-up + item f), COACH-INSETS-A-134
(Back + gutters follow-up), COACH-CONSULT-BE-134 (b#898/m#637 coach-code card), COACH-CONSULT-M2-134 (m#623), lenses LN-OPUS-B,
LN-SOL-B2 (m#623), LN-OPUS-D, LN-SOL-D (coach PRs + Opus side of client PRs), LN-SOL-E. Each keeps ops/reports/<ID>.md with a
"## HANDOFF" (copied here under ops/reports/).
Done: NEST-TOKENS, HOUSE-SEED, COACHLESS-FIX, ROMAN-FIX, START-HANG, CLIENT-HOME, REVIVE, ORPHAN-FIX, COACH-CONSULT-M,
COACH-INSETS-B, SHOTS-134 / SHOTS-134B (62 web renders + 6 compare sheets, sandbox-local shots134/, harness steps in
ops/reports/SHOTS-134*.md), lenses LN-OPUS-A, LN-SOL-A2, LN-OPUS-C, LN-SOL-C2, LN-OPUS-E.

## Ops lessons (agent 134)
- Background loops must start with `setsid nohup ... < /dev/null &` or they die with the bash call.
- `pkill -f` on a loop name can kill your own shell: use exact PIDs.
- Merge gate: count only the LATEST run of each check name (ops/scripts/merge_if_dual.sh, 21:2x fix); a stale failure from a red
  main otherwise blocks forever, and `gh run rerun` re-tests the old merge commit: close/reopen (or a new commit) is the fix.
- Retargeted PRs lack the CodeQL "Analyze" checks: close/reopen them (merge_loop134b.sh does it).
- GitHub proxy tokens expire about every 20 minutes: loops must re-read ops/.ghtoken each pass (agent 134 symlinked .ghtoken134).
- deploy_when_green.sh: give the third argument apply-migrations when the release adds migrations (deploy 10's first run was refused).
- Flaky CI tests (pass on rerun): ConnectProviderSheet.attemptFence, ConnectProviderSheet.importEpoch, WorkoutScreen.calm130,
  useBiometricGate.

Ops scripts (no secrets; tokens are read from mode-600 files at run time) are in ops/scripts/; the fleet log is ops/FLEET134.md;
the lane header and every job entry are in ops/lanes134/ (JOBS134.md waves 1 to 1g).
