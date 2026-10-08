# CF-GUIDE-READ-128 — clients can read their Coach Guidelines (agent 129 worker, Claude Opus 5.5)

Status: STOPPED by operator 16:40 PDT. b#860 CI ALL GREEN at b896ef9a (checked 16:40); READY comment NOT posted. Source: FW-TRAIN-128 U1 / job J2 GUIDE-READ-128 (replaces FW-COACH FWC-GUIDE-128 "remove the button").
Branch agent129/cf-guide-read-128 (backend), based on backend main fd190078. Worktree /home/user/workspace/wt/CF-GUIDE-READ-128-backend.
PR b#860 @ b896ef9aa3662aabdaff161cde16f93aca57b97a (255 lines: +228/-27). Done: code, spec, local runs, push, PR.
Left: CI green -> READY comment -> notify line -> finish.

Design (one backend PR, NO mobile change): GET /coach/my-guidelines moves out of CoachController (CoachGuard) into a new
ClientGuidelinesController (same path; JwtAuthGuard + RolesGuard + ClientEntitlementGuard, @Roles('student'), like the other client
reads). CoachService.getClientGuidelines(req.user.id) reads only the (current coach, this client) row and returns
{ description, created_at, updated_at } (the field names the shipped screen reads), or null (empty 200 = "No guidelines yet").
Same path => every installed build and tonight's iOS cut work once the backend deploys; no deploy-order dependency.
Graded T4 (A3 step 1: role/ownership enforcement changes on one route); entry said T3; both lenses needed either way.

## Scope traced
- Mobile (main a1be6fb2): Train header clipboard icon (WorkoutScreen.tsx:670-678) -> CoachGuidelinesScreen.tsx:35-48 ->
  coachApi.getMyGuidelines (services/api.ts:792-793) -> GET /coach/my-guidelines. The screen reads `title`, `description`,
  `created_at` (CoachGuidelinesScreen.tsx:26,92-97); `null`/empty -> "No guidelines yet" (pinned by learningParity.test.tsx).
  Error copy on main is already fixed text ("Guidelines did not load. Check your connection and try again."), not raw axios text.
- Backend (main fd190078): CoachController (class-level JwtAuthGuard + CoachGuard, coach.controller.ts:13-15) owns
  GET /coach/my-guidelines (:189-192) -> every client gets 403 "Coach access required". CoachService.getGuidelines client branch
  (coach.service.ts:~548-553) returns the raw row (`content`, ids), which the screen would not render even without the 403.
- Privacy: RLS p_coachguideline_select already allows the guideline's client; data export already gives the client their rows;
  Roman's context reads the guideline for (current coach, client) only (roman-client-context.service.ts:562-567).
- Open PRs touching the area (git diff --name-only origin/main...origin/<branch>, board 16:09): b#857 (email/checkout, merged
  16:1x), b#855 (flags/docs) — none touch src/coach/*, test/roles-enforced.spec.ts or README.md. Mobile m#518/m#514 touch
  src/services/api.ts; this job makes NO mobile change, so no overlap.

## B list
None.

## U list
- U1 (FW-TRAIN-128): Coach guidelines icon dead for every client (403). Fixing in this PR.

## C one-liners
- C (edge, deferred to 10k clients): a guideline from a former coach stays stored; the read shows only the current coach's.

## PRs
- b#860 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/860 head b896ef9aa3662aabdaff161cde16f93aca57b97a,
  255 lines, CI all green (16:40), READY not posted, verdicts none. Local: test/client-guidelines-read.spec.ts 5/5 pass; same file on main fd190078
  4/5 FAIL with 403 (failing-first, worktree wt/CF-GUIDE-READ-128-main-proof); test/roles-enforced.spec.ts 2/2 pass.
  PR body copy: ops/reports/CF-GUIDE-READ-128.pr-body.md.

## Not fixed (needs operator)
- No coach-facing writer for guidelines in production: only mobile ProgramTemplatesScreen (hidden by mwbPrograms) calls
  POST /coach/guidelines/:client_id; production CoachGuideline = 0 rows. Clients will see "No guidelines yet" (true) until one is
  written. Default: leave as is for launch.
- CF-TRAIN-TAB-128 (J4 TRAIN-TAB) must KEEP the guidelines icon in WorkoutScreen.tsx (job says hide only if J2 is not live). b#860
  needs no mobile change; the icon works once b#860 deploys.
- Deploy: b#860 is backend-only, no migration. Once merged, the next backend deploy turns the icon on for every build.

## HANDOFF
- Branch agent129/cf-guide-read-128 (backend), PR b#860, exact head b896ef9aa3662aabdaff161cde16f93aca57b97a, 255 lines, nothing unpushed.
- Done: client read of GET /coach/my-guidelines (ClientGuidelinesController, scoped to current coach + client, no mobile change); spec 5/5
  pass, the same spec fails 4/5 on main (403); roles-enforced 2/2; every CI check green at b896ef9a (16:40).
- Left: post `FIX ROUND 1 (OPENING) (CF-GUIDE-READ-128, agent 129) — growth-project-backend#860 @ b896ef9aa3662aabdaff161cde16f93aca57b97a — READY FOR AUDIT`
  (re-check the head first), then both lenses (T4), merge, backend deploy. Tell CF-TRAIN-TAB-128 to keep the guidelines icon.
