# JOBS134 — operator agent 134, wave 1 (2026-10-08 19:40 PDT). Every entry obeys _COMMON_134.md P1-P12.
# Owner 19:34: "134-1 ... Default: yes - start builders on it in your first agent wave - cap agents to 18 - dont use less than 9 at
# any point - lets get this shit DONE!"  All builders claude_opus_5_5 (owner 16:36). Lenses: one Opus + one Sol per PR, at exact heads.
# Older reports (read the named one only): /home/user/workspace/repos/tgp-agent-context/handoffs/op-133/ops/reports/<JOB>.md
# (`git -C /home/user/workspace/repos/tgp-agent-context pull -q` first).

## Order and dependencies
BUILD GATE (Source of Truth A6.13 item 10 + decision 134-1): every PR below merged, backend deployed, the coach consultation merged.
Merge order inside stacks: m#579 -> m#581; m#603 -> m#604 -> m#605 -> m#606; m#590 -> m#607; progress-b -> progress-c (the loop
retargets each to main after its base merges). m#580 first of all (B14 on every phone). RootNavigator.tsx: m#580 lands first, then
START-HANG-134 merges origin/main. CoachWizardNavigator.tsx: m#576 lands first, then COACH-CONSULT-M-134 merges origin/main and edits it.
schema.prisma (backend): COACH-CONSULT-BE-134 only. backend ci.yml: NEST-TOKENS-134 only.

---

### LN-OPUS-134 (claude_opus_5_5) and LN-SOL-134 (gpt_6_1_sol) — instances A, B, C; one Opus + one Sol per slice
Review only your slice, at the exact current head, in the order listed (skip a PR until its builder posts READY / FIX ROUND at its
head). For every mobile UI PR open the named prototype screens in /home/user/workspace/specs134/shots/ (and the notes in index.json)
and check the parity table claim by claim; a missing table or an unsupported "matches" is a B. Re-reviews after a fix round or a
body-only fix = only the earlier Bs, the changed lines, the merge commit; time box 20 minutes (full 30). A body-only fix at the same
head: post a NEW verdict line at that head. A stacked PR's verdict stands at its head after retarget (same head). Loop on
/home/user/workspace/ops/board/board.md every 180 s. END when nothing in your slice has needed you for 20 minutes AND every builder
feeding it has a notify file, or at the operator's STOP. Report /home/user/workspace/ops/reports/<your ID>.md.
- SLICE A (LN-OPUS-A-134, LN-SOL-A-134): consultation + design system. m#580 FIRST (RootNavigator.tsx + eas.json: every new client
  to the consultation, lean flow never mounted, flags in every store profile; report CONSULT-ALL-M-133.md); m#579 (re-review at
  f2facf5d, FIX ROUND 2); m#581 (stacked on m#579); m#590 (FIX ROUND 2 = main merge with conflict resolution: review the merge commit
  only, earlier approvals were at a06da58d); m#582 (body-only fix at cb675bbe: re-check the parity row, post a new verdict); then the
  START-HANG-134 and CLIENT-HOME-134 PRs when READY. (m#607 is already dual-approved; review again only if its head moves.)
- SLICE B (LN-OPUS-B-134, LN-SOL-B-134): tour + Roman. m#603 (body-only fix at f8f569f5: the parity table now in the body; re-check,
  new verdict); m#604, m#605, m#606 (stacked chain; full review each; TOUR-133.md); m#613 (prototype 74; READY posted by the
  operator); m#592, m#601, m#602 after ROMAN-FIX-134 posts FIX ROUND 2 at each (delta: the listed Bs only; ROMAN-ROOM-133.md).
- SLICE C (LN-OPUS-C-134, LN-SOL-C-134): redesign, coach, backend. m#612 (Sol already APPROVE at 6fa49b1e: Opus only); m#609 (coach
  Settings); m#597 (FIX ROUND 2 = main merge with a README conflict: merge commit only; earlier dual APPROVE at 8113ab85); b#889
  (no-store API cache, B07 B38; T4 scan: auth/cache headers); b#888 after COACHLESS-FIX-134 posts FIX ROUND (coachless entitlements,
  T4); m#576 after its main merge (coach setup edges); then NEST-TOKENS-134 (T4), the REVIVE-134 PRs (habits rows, progress B, C),
  the house-fixture PR. The coach consultation PRs get a D slice the operator launches when they post READY.

### ROMAN-FIX-134 (claude_opus_5_5) — fix rounds for m#592, m#601, m#602 (B27 B30 B32); read ROMAN-ROOM-133.md "## HANDOFF" first
Worktrees: m#592 /home/user/workspace/wt/ROMAN-FIX-134-592 (agent133/roman-entry-133), m#601 /home/user/workspace/wt/ROMAN-FIX-134-601
(agent133/roman-room-133), m#602 /home/user/workspace/wt/ROMAN-FIX-134-602 (agent133/roman-turns-133). For each: `git merge origin/main`
only if GitHub shows a conflict; otherwise no main merge.
1. m#592: the coachless consent sheet must not say a coach sees their data; stack the "Allow and continue" pair so it never clips.
   Start from repos/tgp-agent-context/handoffs/op-133/ops/reports/roman-room-133/UNFINISHED-592-fix-round-2.patch but compute coachless
   from the cache (`readUserCacheSync()`; coachless = user id present and no coach_id), not the hook (its tests failed: setSentryUser
   mocked away). Consent TEXT stays the server's (decision 133-16). Tests listed in the HANDOFF, one at a time. One push. FIX ROUND 2.
2. m#601: a failed chip send never replaces a typed draft (+ regression test); body: parity row 69 moves "history action" to
   "What differs" (existing Your conversations entry kept) and notes the upright serif launch line. One push. FIX ROUND 2.
3. m#602: the "reply was cut off" note is part of the accessible label when message.interrupted (+ label tests both cases); the reveal
   effect deps `[animate, blocks.length]`. One push. FIX ROUND 2.
Then poll each PR every 180 s for up to 90 minutes and fix any new B (one push, next FIX ROUND line). Files: only those three PRs' files.

### COACHLESS-FIX-134 (claude_opus_5_5) — b#888 CodeQL, m#576 main merge, house-program fixture PR (B22 B23 B24, B01 B05 B06 B08 B09 B10)
1. b#888 (/home/user/workspace/wt/COACHLESS-FIX-134-backend, agent132/coachless-log-132 @ 9f4d3753): read the failing CodeQL alert
   (`gh api repos/BradleyGleavePortfolio/growth-project-backend/code-scanning/alerts?ref=refs/pull/888/merge` or the check run), fix the
   real cause in the PR's code (never dismiss an alert, never weaken the query). T4 (entitlements): keep every non-coachless path
   byte-identical. Targeted tests. One push. FIX ROUND 2 (COACHLESS-LOG-132, agent 134, COACHLESS-FIX-134).
2. m#576 (/home/user/workspace/wt/COACHLESS-FIX-134-mobile, agent132/coach-edges-132 @ 22919982): `git merge origin/main`, resolve the
   conflict keeping main's merged redesign (m#589/m#599 coach work, m#577 primitives) AND the PR's B01 B05 B08 B09 B10 fixes; switch any
   SafeAreaView from 'react-native' to react-native-safe-area-context; rounded tokens. Targeted tests. One push. FIX ROUND 2
   (COACH-EDGES-132, agent 134, COACHLESS-FIX-134) with the conflict files listed. This unblocks COACH-CONSULT-M-134 (tell the operator
   the moment it is READY).
3. House-program fixture PR (decision 133-2; /home/user/workspace/wt/COACHLESS-FIX-134-fixture, agent134/house-fixture-134): compare the
   owner's fixture /home/user/workspace/specs134/owner/TGP-Fitness-Four-week-master-programs-JSON-fixture.json with backend seed/ (the
   clinic-programs.v1 file and scripts/seed-clinic-programs*). If it differs, open a PR that places it as the seed fixture, validates
   every exercise slug against the seeded ExerciseCatalogItem catalog (test), and keeps `production_seed_authorized` false (the seed is
   an operator step after the owner's yes). Report CONSULT-ALL-BE-133.md has the seed steps. Then wait for verdicts on all three.

### START-HANG-134 (claude_opus_5_5) — B35 B36 B37: the app never opens (logo, "Locked", endless spinner)
Worktree: /home/user/workspace/wt/START-HANG-134-mobile (agent134/start-hang-134 off main). The full brief is START-HANG-132 in
repos/tgp-agent-context/handoffs/op-132/ops/lanes132/JOBS132.md:236-248 (never started; follow it exactly), with these updates: you
own RootNavigator.tsx for this PR, src/components/BiometricUnlockGate.tsx, src/hooks/useBiometricGate.ts, the persisted query restore
gate and a new startup time-box helper; m#580 also edits RootNavigator.tsx (consultationApplies and the new-client route): stay off
those lines, and after m#580 merges run `git merge origin/main` before your push. The calm error screen follows prototype 44
(ST-ERROR) and the shared Screen/PrimaryButton. src/services/api.ts only if the cause is there (say so). Tests include a promise that
never settles. One PR under 800 lines, READY, then wait for verdicts (fix Bs).

### REVIVE-134 (claude_opus_5_5) — open the three saved branches as PRs, finished and green
Worktrees: /home/user/workspace/wt/REVIVE-134-habits (agent133/redo-habits-rows-133 @ 39b23a2b, Habits part 2), wt/REVIVE-134-progb
(agent133/redo-progress-133-b @ 8113224f), wt/REVIVE-134-progc (agent133/redo-progress-133-c @ 72fc8280; contains B). For each:
`git merge origin/main`, resolve keeping main's merged primitives and pages, targeted tests one at a time, one push, open the PR with
the body from the report (REDO-HABITS-CAL-COMM-133-pr-habits-rows-body.md, REDO-PROGRESS-133-prB-body.md, -prC-body.md; refresh every
file:line and "matches" claim against today's main), title "[133] ..." as written, READY line (job REDO-HABITS-CAL-COMM-133 /
REDO-PROGRESS-133, agent 134, REVIVE-134). Progress C: base = agent133/redo-progress-133-b (stacked; the loop retargets it). Then wait
for verdicts and fix Bs.

### NEST-TOKENS-134 (claude_opus_5_5, T4) — the B31 no-injection-token bug elsewhere + Roman live DB tests in CI + 133-11
Worktree: /home/user/workspace/wt/NEST-TOKENS-134-backend (agent134/nest-tokens-134 off main). Root cause (ROMAN-CONTEXT-133.md):
constructor params typed `X | null` (or `| undefined`) with no @Inject token receive null/undefined from Nest. From the code:
src/messaging/messaging.service.ts:146 (MessagesSafetyService: message safety screening may never run) and :158 (VoiceUploadProvider),
src/ai/gateway/ai-approval.service.ts:105, src/throttler/login-throttle-reset.service.ts:90. PR 1: prove each on a test module (fails
on main), add the tokens / @Optional() correctly, wiring tests; grep the whole src/ for the same pattern and fix every real one; state
in the body exactly what changes for users (e.g. safety screening now runs: which messages could now be held). Add the two Roman live
DB tests named in ROMAN-CONTEXT-133.md to `.github/workflows/ci.yml` job mwb-3-live-tests (you own ci.yml). One push, READY. PR 2
(new branch agent134/coachless-alert-134 off main): decision 133-11, flagged screenings of coachless clients alert the owner's house
coach account (steps in CONSULT-ALL-BE-133.md); reuse the existing coach alert path; no new external sender. READY. Wait for verdicts.

### CLIENT-HOME-134 (claude_opus_5_5) — B25 B26 B34 (client Home and tab bar, coachless truthful)
Worktree: /home/user/workspace/wt/CLIENT-HOME-134-mobile (agent134/client-home-134 off main). B25: Home never says "Message your
coach" (or any coach action) to a coachless client: calm truthful alternative (Roman, or nothing). B26: "Community" fits on one line
on a 360 pt wide Android phone with the 6 tabs kept (label sizing/letter spacing via tokens, no tab removed). B34: the Home date
heading reads naturally ("Thursday, 8 October" style, locale-aware, no ordinal words, no shouting caps unless an overline token).
First list the files the open tour PRs m#603-m#606 and m#612 touch (`gh pr diff --name-only`); if one overlaps, change only lines they
do not touch and say so. One PR under 800 lines with a parity table, READY, wait for verdicts.

### COACH-CONSULT-BE-134 (claude_opus_5_5, T4 coach profile data) — K0-K8 backend (B02 B03), decision 134-1
Worktree: /home/user/workspace/wt/COACH-CONSULT-BE-134-backend (agent134/coach-consult-be-134 off main). Read prototype 75-86
(shots + notes + js/screens-app.js coach track) and today's coach onboarding (src/coach/coach-onboarding.*, CoachProfile,
CoachOnboardingProgress, invite_code). Within your first 30 minutes write "## API" in your report: every field K1-K6 saves (card:
display name, photo, headline, bio, years; specialties; clients today; coaching touch; programming style; personal link = existing
invite_code /join link + QR), the endpoints (GET/PUT a coach consultation draft with resume, POST complete), validation, and what
already exists. Reuse existing columns and endpoints first; any schema change is ADDITIVE with a migration timestamp newer than
production's latest (you own schema.prisma this wave). Tenancy: a coach reads/writes only their own profile. Completing the consultation
never requires Stripe or a package (profile first, money last, B02). PR(s) under 800 lines, READY, wait for verdicts.

### COACH-CONSULT-M-134 (claude_opus_5_5) — K0-K4 + the flow, chapters and routing (B02 B03, prototype 75-81, 86)
Worktree: /home/user/workspace/wt/COACH-CONSULT-M-134-mobile (agent134/coach-consult-m-134 off main). You own the coach consultation
flow: new files under src/screens/coach/consultation/** and src/lib/coachConsultation/** (flow registry, answers store with resume,
chapters, progress bar, "Finish later", time left, like the client consultation in src/screens/consultation/** + src/lib/consultation/**,
which you read and reuse but do not edit without a NEED line), screens 75 ROLE-C and 76 CREATE-C deltas if any, K0 Welcome, K1 Your card,
K2 Specialties, K3 Clients today, K4 Coaching touch, and the landing 86 K-LAND (Clients). Routing: every new coach goes to the
consultation (no flag the owner's builds keep off); today's CoachWizard money steps (Get paid, first package, invite) move AFTER the
consultation as optional next steps, never before (B02). CoachWizardNavigator.tsx is yours ONLY after m#576 merges (the operator
messages you); until then build everything else and keep the navigator edit as the last commit. Within 30 minutes write "## API" in
your report: the step component contract (props, onNext/onBack, answers shape) COACH-CONSULT-M2-134 builds K5-K8 against, and use the
backend contract from COACH-CONSULT-BE-134's "## API" (/home/user/workspace/ops/reports/COACH-CONSULT-BE-134.md); until the backend is
live, the client falls back to saving locally and syncing (mobile must work with the current production backend, A5 rule 5). PRs
under 800 lines each (engine + K0-K2, then K3-K4 + routing), parity tables, READY, wait for verdicts.

### COACH-CONSULT-M2-134 (claude_opus_5_5) — K5-K8 (prototype 82-85)
Worktree: /home/user/workspace/wt/COACH-CONSULT-M2-134-mobile (agent134/coach-consult-m2-134 off main). Build K5 Programming style, K6
Your personal link (the coach's real /join/<invite_code> link, copy/share, QR; use a QR library already in package.json or an SVG
generator already present; a new dependency is a NEED line), K7 Import offer (only when the importer flag is on; otherwise skipped),
K8 Practice ready, as step components in src/screens/coach/consultation/steps/ against the contract in
/home/user/workspace/ops/reports/COACH-CONSULT-M-134.md "## API" (poll it every 10 minutes until posted; meanwhile build presentation,
copy and tests). Never edit the flow registry or the navigator (COACH-CONSULT-M-134 owns them): when your PR is ready, its body lists
the one registry line M-134 adds, or `git merge origin/agent134/coach-consult-m-134` and base your PR on that branch (stacked) if the
registry must import your files. PR under 800 lines, parity table, READY, wait for verdicts.

---
## WAVE 1b (operator agent 134, 20:12 PDT): the three Sol lenses stopped in the 19:50-20:06 sandbox stall after posting their
## verdicts; their slices continue as A2/B2/C2. One builder owns the agent-133 PRs nobody owned. Read P13 and P14 first.

### LN-SOL-A2-134, LN-SOL-B2-134, LN-SOL-C2-134 (gpt_6_1_sol) — continue SLICE A / B / C from the LN-SOL-134 entry above
First read your predecessor's report (/home/user/workspace/ops/reports/LN-SOL-A-134.md, -B-, -C-): every verdict it posted stands at
that head; do not re-review a PR whose head has not moved. Then:
- A2: m#617 FIRST (MAIN-RED-134, test-only T1: 2 deleted lines; confirm line 62 keeps the same value and CI is green; 5 minutes).
  Then m#579 and m#581 after ORPHAN-FIX-134 posts FIX ROUND (main-merge conflict resolution only: the merge commit + the test file),
  then the START-HANG-134 and CLIENT-HOME-134 PRs when READY (full review, prototype parity).
- B2: m#592, m#601, m#602 (ROMAN-FIX-134 FIX ROUND 2: delta, only the Bs listed in the earlier verdicts + changed lines), then m#605
  and m#606 after ORPHAN-FIX-134 posts FIX ROUND (merge commit + B-606-1 only; your predecessor approved both at the old heads).
- C2: b#888 (COACHLESS-FIX-134 FIX ROUND: the CodeQL fix only + T4 scan that non-coachless paths are unchanged), m#576 after its FIX
  ROUND (full review: coach setup edges; it merges main), the NEST-TOKENS-134 PRs (T4, full), the REVIVE-134 PRs (m#614 habits rows,
  m#615 progress B, m#616 progress C; full with prototype parity), and any house-fixture PR (none opened so far).
END as in the LN entry (20 minutes with nothing to do in your slice and every feeder has a notify file) or at the operator's STOP.

### ORPHAN-FIX-134 (claude_opus_5_5) — fix rounds for agent 133's PRs that no builder owns (m#579 m#581 m#605 m#606)
Worktrees (made by the operator): /home/user/workspace/wt/ORPHAN-FIX-134-579 (agent133/consult-parity-133), -581
(agent133/consult-parity-133-b), -605 (agent133/tour-133-c), -606 (agent133/tour-133-d). Read the "## Proposed (needs operator)" and
findings in /home/user/workspace/ops/reports/LN-OPUS-A-134.md and LN-OPUS-B-134.md first; the old reports are
repos/tgp-agent-context/handoffs/op-133/ops/reports/CONSULT-PARITY-133.md and TOUR-133.md.
1. m#579: `git merge origin/main` (main has m#590 and m#617 once merged). The one conflict is
   src/screens/consultation/__tests__/consultationQuietLook.test.tsx:31-35 (main `borderRadius: radius.lg`, PR `radius.chip`):
   resolve so the test asserts what the MERGED component code really renders (read the component on the merged tree; say which one
   and why). Targeted tests via heavy.sh. One push. FIX ROUND 3 (CONSULT-PARITY-133, agent 134, ORPHAN-FIX-134).
2. m#581 (stacked on m#579): `git merge origin/agent133/consult-parity-133` after step 1 (or origin/main once the loop retargets it
   after m#579 merges), resolve the same test the same way. One push. FIX ROUND.
3. m#605: once m#604 merges and the loop retargets m#605 to main (check `gh pr view 605 --json baseRefName`), `git merge origin/main`.
   Conflict in src/screens/client/WorkoutAssignmentDetailScreen.tsx: keep main's rows (APPLY-LIVE-133 part 2) and wrap the first
   `assignment-row-*` View in `<TutorialTarget id={i === 0 ? 'first-exercise' : undefined}>`. Targeted tests. One push. FIX ROUND.
4. m#606: `git merge origin/agent133/tour-133-c` (after step 3) and fix B-606-1: the tab beats (prototype 47, 51, 55 "Tap Home" and the
   Roman beat) draw the coach-mark card just above the tab bar, as the prototype does, not at the top (`cardAtTop`); fix the parity
   rows that said "none". Test for the card position. One push. FIX ROUND.
Files: only these PRs' files. Then poll each PR every 180 s for up to 90 minutes and fix any new B (one push each).

### HOUSE-SEED-134 (claude_opus_5_5, T4 production data path) — make the house-program seed runnable in production (B14, 133-2, 133-9, 133-10)
Why: production has 0 ClinicProgramSet rows (B14 root cause), so coachless clients get no plan. The seed script exists
(backend scripts/seed-clinic-programs.ts --dry-run --house; CONSULT-ALL-BE-133.md "Operator steps") but CANNOT run in production: the
runtime image ships only dist/ (Dockerfile COPY --from=build /app/dist), there is no seed workflow, and the fixture says
production_seed_authorized false. Owner decisions taken at their defaults: 133-2 the owner's fixture (identical to seed/clinic-programs.v1.json,
checked by COACHLESS-FIX-134) is approved; 133-10 the house account is the owner's own account, passed by ID (CLINIC_OWNER_COACH_ID), never an
email in the repo (public repo).
Backend worktree /home/user/workspace/wt/HOUSE-SEED-134-backend (agent134/house-seed-134 off main):
1. One PR: (a) a workflow_dispatch workflow `.github/workflows/house-seed.yml` with inputs mode (dry-run | apply) and coach_id, job
   `environment: production` (required reviewers gate it), that runs the EXISTING script with the existing production secrets; read
   fly-db-secrets-set.yml, fly-secrets-list.yml and fly-deploy.yml to find what already exists: either run on the runner with a database URL
   secret that already exists in the production environment, or `flyctl ssh console` into the app running a compiled copy of the script
   that the build now includes in dist/ (choose the path that needs NO new secret; if every path needs a new secret, stop and write a NEED
   with the exact secret name). Never print connection strings; the output is the script's JSON (ids only). (b) the fixture edit:
   `approval_status` approved and `production_seed_authorized: true`, and the workflow sets CLINIC_PROGRAMS_SEED_APPROVED to
   `clinic-programs.v1:<sha256 of the committed file>` computed at run time. (c) tests: the workflow's script path exists in the build output
   (if you take the dist path), the guard still refuses without the approval hash. Under 800 lines, T4 body ("what changes for users":
   nothing until the operator dispatches it). READY, wait for verdicts. You never dispatch it.
2. Mobile check (decision 133-9, U-890-1): on mobile main, does a coachless client with a screening yes still read "your coach has been
   told" (src/screens/consultation/**/RevealScreens.tsx ~:336 :377 :409 via the fillCopy fallback)? If yes: a small PR in
   /home/user/workspace/wt/HOUSE-SEED-134-mobile (agent134/coachless-reveal-134 off main) with calm truthful copy for coachless (no coach
   mentioned, no first person, no exclamation marks), tests. First `gh pr diff 581 --name-only` and 579: if they touch those lines, change
   only lines they do not touch, or write a NEED. If no: write "133-9 already true on main" with file:line in your report.

---
## WAVE 1c (operator agent 134, 20:38 PDT): coach consultation + house seed reviews. Slice changes (each lens: add these after your
## current queue; review at exact heads when the builder posts READY; drafts only when marked ready):
- SLICE B (LN-OPUS-B-134 + LN-SOL-B2-134) ADDS the coach consultation MOBILE PRs: m#620 (engine + K0-K2), m#621, m#622 (K3-K4 +
  routing; draft until READY), and COACH-CONSULT-M2-134's K5-K8 PR. Full review with prototype 75-86 parity (shots + index.json notes).
  Check: every new coach goes to the consultation; the money steps (Get paid, first package, invite) come AFTER it as optional (B02);
  it works against today's production backend (local save + sync) until b#894 deploys.
- SLICE D (NEW LN-OPUS-D-134 + LN-SOL-C2-134 as its Sol): b#894 (COACH-CONSULT-BE-134, T4 coach profile data: tenancy = a coach reads
  and writes only their own profile; additive migration newer than production's latest; completing never needs Stripe), b#896
  (HOUSE-SEED-134, T4 production data path: never prints secrets, cannot run without the production environment reviewers and the
  approval hash, no new secret). LN-OPUS-D-134 then helps SLICE B with the M2 PR if it is READY and unreviewed by Opus.
- LN-SOL-C2-134 keeps m#576, b#893, b#895 and ADDS b#894, b#896; it HANDS the REVIVE PRs (m#614, m#615, m#616) to LN-SOL-A2-134.
- LN-SOL-A2-134 ADDS m#614, m#615, m#616 (REVIVE-134; Sol side) after m#617, m#579/m#581, m#618, m#619.
- LN-OPUS-C-134 unchanged (m#576, m#614-616, b#893, b#895).

---
## WAVE 1d (operator agent 134, 20:50 PDT; owner 20:4x "you can scale to 22 agents"): the coach side of B13 B28 B39 B16 B29.
## Owner 20:2x: "alert me when all 41 issues are done and UI is improved for clients and coaches clearly".
Shared rules for the three coach builders: use the shared `Screen` primitive (src/components, m#577) for insets and the rounded tokens
(Q10b: buttons 12, cards 16, sheets 24; `radius.*` tokens, never literals); SafeAreaView only from react-native-safe-area-context;
presentation only (no data, endpoint or navigation changes); copy rules (no first person, no exclamation marks, no emojis). Do NOT touch
files in open PRs (`gh pr diff <n> --name-only` for m#576 m#618-m#622): src/screens/coach/README.md rows go in a LAST commit after
`git merge origin/main`. Tests: inset/radius renders at 360x800 and 390x844 like REDO-INSETS-133 (repos/tgp-agent-context/handoffs/
op-133/ops/reports/REDO-INSETS-133.md), via heavy.sh, one file at a time. PRs under 800 lines, "[134]" titles with bug IDs, a "Before ->
after" table per screen, READY, wait for verdicts, fix Bs. A screen with no route (unreachable): leave it and list it.

### COACH-INSETS-A-134 (claude_opus_5_5) — worktree /home/user/workspace/wt/COACH-INSETS-A-134-mobile (agent134/coach-insets-a-134)
Move onto Screen + rounded tokens (they have fixed paddingTop 56/60 or react-native SafeAreaView today, from the code):
AIWorkoutDraftScreen, AIMealPlanDraftScreen, CoachInboxV2, ClientMessagesScreen, MessagesScreen (coach), ClientInsightScreen,
ClientRiskDetailScreen, RiskBoardScreen, client-detail/styles.ts, ClientReassignModal, SubCoachDetailScreen, CoachTeamProfileScreen
(all under src/screens/coach/). Two PRs if needed to stay under 800.

### COACH-INSETS-B-134 (claude_opus_5_5) — worktree /home/user/workspace/wt/COACH-INSETS-B-134-mobile (agent134/coach-insets-b-134)
Same for: CoachBillingScreen, TeamManagementScreen, InviteCodesScreen, CoachInvitesScreen, InviteCodeRedeemersScreen,
ProgramTemplatesScreen, payments/CoachPackagesListScreen, payments/CoachPackageEditScreen, payments/CoachPackageContentsScreen,
payments/CoachPackageSubscribersScreen, payments/CoachConnectScreen, CoachHomeScreen (only if a route still reaches it), plus the
U-589-SOL-A-133-1 follow-up: ClientsListScreen.tsx:496,529 literal 22 / 3 circle radii -> `radius.chip`, dropping the allowance in
coachRedesign133.test.ts:45-48. Two PRs if needed.

### COACH-HOME-134 (claude_opus_5_5) — worktree /home/user/workspace/wt/COACH-HOME-134-mobile (agent134/coach-home-134)
The coach's first tab (CommandCenter: src/screens/coach/command-center/ OverviewScreen, CoachHomeCards, CommandCenterScreen) to the
luxury bar in repos/tgp-agent-context/design-targets/mobile/coach-home-solo and coach-home-headcoach (read CATALOG.md first: "the bar,
not the blueprint"; the "same studio" test). Keep every real number, card and action it shows today (the 10-08 calm states, setup and
Money cards); restyle hierarchy: overline date + greeting, one serif hero number (only a real value; a calm empty line when there is none,
never a fake or a dash wall), hairline stat row, "Your clients today" with the most urgent client first, rounded tokens. No new endpoints.
A new coach with zero clients must look calm and complete (the consultation's K-LAND 86 sends coaches to Clients; Home must still read
well empty). One PR under 800 lines with a parity table against the two targets, READY, wait for verdicts.

### LN-SOL-D-134 (gpt_6_1_sol) — the Sol side of SLICE D
Takes b#894 and b#896 from LN-SOL-C2-134 (C2 keeps m#576, b#893, b#895), then the COACH-INSETS-A/B-134 and COACH-HOME-134 PRs (with
LN-OPUS-D-134 as the Opus side). Full review; for the coach UI PRs check the Before -> after tables and the luxury target parity claim.

### CLIENT-POLISH-134 (claude_opus_5_5) — client follow-ups left by agent 133's builders (B13 B16 B28 B29 polish)
Worktree /home/user/workspace/wt/CLIENT-POLISH-134-mobile (agent134/client-polish-134 off main). Same shared rules as WAVE 1d (Screen
primitive, rounded tokens, presentation only, no files in open PRs: check `gh pr diff --name-only` for every open agent13x PR first).
Items (each from a HANDOFF in repos/tgp-agent-context/handoffs/op-133/ops/reports/):
1. Leaderboard onto the shared `Screen` (REDO-INSETS-133 leftover 1: its tests mock safe-area-context without SafeAreaInsetsContext;
   give the mocks the context, then move it).
2. Connected devices: chevrons on the rows + `radius.chip` (REDO-DEVICES-133).
3. Sign-up/Log in (AUTH-ENTRY-133 optional items): no lone "or" divider when the Apple button is absent (Android / no Apple); the
   pinned footer must not cover the fields on 360x800 with the keyboard open (render test at 360x800 with a keyboard inset).
4. "Add a coach code" accepts a pasted invite link (…/join/<code>): extract the code (LN-OPUS-C-133 finding), with tests; and if the
   older coach-code sheet (REDO-SETTINGS-133) calls a different endpoint from the Settings row, make both use the same existing one
   (no new endpoint; say which).
One or two PRs under 800 lines, "[134]" titles, Before -> after table, READY, wait for verdicts (SLICE A lenses), fix Bs.

---
## WAVE 1e (operator agent 134, 20:58 PDT): the consultation answers must reach clients and Roman (no data collected for nothing).
### COACH-CARD-134 (given to COACH-CONSULT-BE-134 after b#894 merged at 20:55)
Worktrees: /home/user/workspace/wt/COACH-CARD-134-backend (agent134/coach-card-be-134), /home/user/workspace/wt/COACH-CARD-134-mobile
(agent134/coach-card-134), both off main.
1. Backend src/invite-codes: the invite / join preview returns the coach card fields saved by the consultation (headline, specialties,
   whatever K1-K6 store that the prototype's client-side coach card shows; additive optional fields, null-safe for coaches who never did
   the consultation). Tests.
2. Backend src/roman: for a coached client, Roman's context includes the coach's coaching touch and programming style (only when set;
   no change for coachless clients; Roman must never claim to be the coach). Follow the Roman rules in _COMMON_134 / the Roman eval
   harness; tests.
3. Mobile: the client's coach card in the join flow renders headline + specialties when present (no blank rows when absent), rounded
   tokens, copy rules. Check with `gh pr diff --name-only` that no open PR (m#579 m#581 m#621 m#622 M2) owns that file; if one does,
   send the change to that PR's builder via the report instead and say so.
Each PR under 800 lines, "[134]" titles, READY; lenses SLICE D (LN-OPUS-D-134 + LN-SOL-D-134).

### REFUSAL-COACHLESS-134 (follow-up given to ROMAN-FIX-134, 21:08 PDT)
Worktree /home/user/workspace/wt/REFUSAL-134-mobile (agent134/refusal-coachless-134). src/lib/ai/aiRefusal.ts:155 still tells clients
with no coach "Your coach still sees..." (ROMAN-FIX-134, from the code). Make it coachless-aware the same way m#592 did (no coach
mention for coachless clients; coached copy unchanged), plus any other "your coach" line in src/lib/ai/ that a coachless client can
reach (grep). Tests both ways. One small PR, "[134]", SLICE A lenses.
### START-HANG-FOLLOW-134 (follow-up given to START-HANG-134, 21:08 PDT; after m#619 merges)
Worktree /home/user/workspace/wt/START-HANG-FOLLOW-134-mobile (agent134/start-hang-follow-134; merge origin/main after m#619 lands).
The two U findings on m#619: the lock shows at once for opted-in users when the app returns from the background; the cache purge logs
a warning instead of an empty catch. About 20 lines plus tests, "[134]", SLICE A lenses.

---
## WAVE 1f (operator agent 134, 21:30 PDT): SLICE E lens pair (review backlog of ~10 fresh PRs; LN-SOL-C2-134 finished).
### LN-OPUS-E-134 (claude_opus_5_5) and LN-SOL-E-134 (gpt_6_1_sol) — SLICE E: client follow-ups
m#624 and m#631 (CLIENT-POLISH-134 A/B), m#628 (START-HANG follow-up: lock on return from background), m#629 (coachless AI copy,
REFUSAL-COACHLESS-134), the REVIVE-134 rating-fit PR (360 pt "Exhausted"/"Energized" clip; may add a Save a11y label), and any
further CLIENT-POLISH-134 PR. Full review per the LN-OPUS-134 / LN-SOL-134 entry: exact head, B/U findings, "seen in a test" / "from
the code", Before -> after tables checked against the code, copy rules, rounded tokens, 360x800 and 390x844. SLICE A (LN-OPUS-A-134 +
LN-SOL-A2-134) keeps m#618 and m#604-m#607.

### CLIENT-POLISH-134 item 5 (operator 21:28): B22/B24 app copy for coachless clients
From the code on main: src/entitlements/PaywallSheet.tsx:47 COACHLESS_TITLE "Logging comes with coaching" and
src/screens/client/HomeScreen.tsx:409 "Food and water logging need active access." still exist. The server (b#888, deploy 9) lets a
coachless client log food and water. Owner rule: coachless clients can do everything a coached client can, besides direct coaching (no
lock pages). Trace (from the code + tests) whether a coachless client can still reach either line (entitlement state from the server,
local fallbacks, offline/cached state). If reachable: logging is never gated for coachless clients; remove/replace those lines (coached
clients whose plan lapsed keep today's coach-facing copy). Tests both ways. Small PR, "[134] B22 B24", SLICE E lenses.

---
## WAVE 1g (operator agent 134, 21:3x PDT): SHOTS-134 — B41 pre-build screen pass + "UI clearly improved" evidence for the owner
### SHOTS-134 (claude_opus_5_5). WORKSPACE ONLY: no PR, no push, nothing in the product repos changes.
Detached worktree /home/user/workspace/wt/SHOTS-134-mobile at main (node_modules: ops/link_deps.sh mobile <path>; react-native-web
0.21 and react-dom 19 are already deps). Playwright chromium is at ~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome.
Goal: PNG renders of key screens at 360x800 and 390x844, written to /home/user/workspace/shots134/<screen>-<w>x<h>.png, each labelled
"web render, not a device" in shots134/INDEX.md. Screens (in this order; stop adding when time runs out): coach Home (CommandCenter),
Clients list, coach consultation K0-K6 (on main once m#621-m#623 merge; use what is on main), client Home coached + coachless, Progress
("The full picture"), Habits, client onboarding chapter screens, Sign up / Log in, Roman chat, Settings.
Approach (choose the cheapest that works; P13 shared sandbox: heavy.sh for any bundling, one at a time): a small harness OUTSIDE src/
(e.g. /home/user/workspace/shots134/harness/) that renders individual screens with mocked providers/navigation/API data (realistic but
clearly sample data: no real names or emails), bundled for web (expo export --platform web, or Metro/webpack/esbuild with
react-native-web aliasing), then Playwright screenshots. TIME BOX: if no screen renders after 25 minutes of trying, stop and write the
HANDOFF with what blocked. For every screen note anything that looks wrong (clipped text, square corners, crowded top, overlap) as
"seen in a web render" findings in the report; do not fix product code. Report /home/user/workspace/ops/reports/SHOTS-134.md.

### SHOTS-134B (claude_opus_5_5) — continue SHOTS-134 from its HANDOFF (ops/reports/SHOTS-134.md): the pipeline works
(harness at /home/user/workspace/shots134/harness, web export via heavy.sh ~21 s, Python Playwright at 360x800 and 390x844). Same
entry and rules as SHOTS-134 (WAVE 1g): workspace only, no PR, no product src/ changes, sample data only, every PNG labelled "web
render, not a device" in shots134/INDEX.md, findings "seen in a web render". Fetch main again first (merges keep landing). Same screen
order. Report ops/reports/SHOTS-134B.md.

### SHOTS-134B findings (operator 22:2x; all "seen in a web render" unless marked "from the code"); details ops/reports/SHOTS-134B.md
To CLIENT-POLISH-134 (after m#635; small separate PRs, SLICE E: LN-SOL-E-134 + LN-OPUS-D-134 as Opus):
 a. Coachless consent P0 says "The Growth Project and your coach collect..." / "your messages with your coach" (from the code:
    src/lib/consultation/copy.ts:33). Coachless clients must not see coach lines. Find how the consent version is recorded (mobile +
    backend). If a coachless variant needs only a new version id that the server accepts as-is (no backend change), do it with the coach
    clauses removed and nothing else changed. If it needs a backend change, write it up in your HANDOFF and tell the operator (the
    wording is a legal text: removals only, no new claims).
 b. P0 at 360x800: the tick box sits below the fold, so Continue looks disabled for no visible reason: keep the tick box visible with
    Continue (or say "Tick the box above to continue" next to the disabled button).
 c. Sign in / sign up: underline inputs curl at the ends (a radius on a bottom-border-only input): no radius on underline inputs;
    "CONTINUE WITH GOOGLE" in sentence case "Continue with Google" (Google's own button text).
 d. Tab bar: "Community" truncated to "Commu..." in the web render (m#618 measured fit from the Inter file; a phone may differ): add a
    safe shrink-to-fit on the tab labels (adjustsFontSizeToFit, minimumFontScale 0.85, one line) so it can never clip.
 e. Client Home: "Add Allergies and restrictions to set daily targets." -> sentence case and true logic (targets already show; say what
    adding them changes, or drop the line when targets exist).
To COACH-HOME-134 (fold into the cards follow-up PR):
 f. Coach Home top tab strip: the last tab ("Actions") is cut at the right edge at 360 and 390: make the tabs fit, or show a clear
    scroll affordance (fade + partial chip by design, not a hard clip). At 360 the date line and greeting stack onto two lines; the
    serif "1" in the "At risk" row reads like a capital I (tabular lining figures or the sans numeral for small counts).
