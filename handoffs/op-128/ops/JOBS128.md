# JOBS128 — agent 128 job entries (read _COMMON_128.md first, then ONLY your entry; the LAST occurrence of a heading wins)

Tranche 3 screen jobs (DES-AA-127 ... DES-BD-127) are NOT copied here: read your entry, word for word, in
/home/user/workspace/tgp-agent-context/handoffs/op-127/ops/DES-JOBS-PASTE.md under "# TRANCHE 3" (heading "## <JOB> (...)"), applying the
translation rules at the end of _COMMON_128.md. Older DES entries (DES-H/K/P/S/Q/V-127) live in
/home/user/workspace/tgp-agent-context/handoffs/op-127/ops/JOBS127.md (last occurrence wins) and are amended below.

# ---- Lens queues (4 Claude Opus 5.5 + 4 GPT-6.1 Sol) ----

## LN-OPUS-128 (Claude Opus 5.5, LENS, T1-T4) — Opus lens queue; instances A, B, C, D. Run until 18:30 PDT or an operator stop.
Sign verdicts "(LN-OPUS-<X>-128)" where <X> is your instance letter; report /home/user/workspace/ops/reports/LN-OPUS-<X>-128.md (one line
per verdict: PR, head, verdict, Bs); notify LN-OPUS-<X>-128.txt when you finish.
Loop (sleep 300 between polls): list open PRs in growth-project-backend and growth-project-mobile whose head branch starts with "agent127/"
or "agent128/" and whose latest comment containing "— READY FOR AUDIT" names the CURRENT head sha (`gh pr view N --json headRefOid`), and
that have no comment starting "AUDIT Claude Opus 5.5" at that head. Pick order: instance A and C oldest READY first; B and D newest READY
first; within that, backend T4/T3 Roman and consent PRs before mobile. Before each PR: re-check no Opus verdict exists at that head and no
"OPUS LENS CLAIM" comment for that head newer than 40 minutes; post "OPUS LENS CLAIM (LN-OPUS-<X>-128) @ <full sha>"; re-read the comments:
if an earlier OPUS LENS CLAIM for the same head exists, delete yours (`gh api -X DELETE repos/<o>/<r>/issues/comments/<id>`) and move on.
Review: full review 30 minutes, delta re-review 20 minutes (if any Opus lens reviewed an earlier head, review the delta plus whether the
previous Bs are fixed). Never read a GPT-6.1 Sol verdict at that head before posting yours. Apply SoT A2 overrides 1-11 strictly (Bs only
for item-1 consequences, each with its one-sentence normal-user story; edge cases are one-line Cs). Size over 1,500 changed lines =
REQUEST CHANGES "SIZE FAIL (over 1,500 lines)". For mobile UI (DES-*) PRs the six owner redo rules in _COMMON_128.md are acceptance
criteria: rule 1 (read every changed user-facing string against the data that drives it: a false claim is a B), rule 2 (dead buttons),
rule 4/6 (the PR body's "Routes/actions before -> after" table matches the code, nothing a user had is gone, and a parity test proves it),
rule 7 (no legacy palette or new hex literals in changed code), the quiet-luxury doctrine; a purely aesthetic disagreement is a C. For
backend T4: tenancy (caller-scoped queries), consent gates, PII in logs/egress, money, and that flags keep main inert. Post ONE comment,
first line exactly `AUDIT Claude Opus 5.5 (LN-OPUS-<X>-128) — growth-project-<repo>#<n> @ <full head sha> — VERDICT: APPROVE` (or
REQUEST CHANGES). Bs first (one-sentence user story, file:line, smallest fix), then Cs as a one-line list. If the head moves while you
work, stop and start over at the new head. If nothing is READY for 45 minutes in a row, finish. No code edits, no other comments.

## LN-SOL-128 (GPT-6.1 Sol, LENS, T1-T4) — Sol lens queue; instances A, B, C, D. Run until 18:30 PDT or an operator stop.
Exactly LN-OPUS-128, but you are the GPT-6.1 Sol lens: you look for heads with no comment starting "AUDIT GPT-6.1 Sol"; claim with
"SOL LENS CLAIM (LN-SOL-<X>-128) @ <full sha>"; never read a Claude Opus 5.5 verdict at that head before posting yours; first line
`AUDIT GPT-6.1 Sol (LN-SOL-<X>-128) — growth-project-<repo>#<n> @ <full head sha> — VERDICT: APPROVE` (or REQUEST CHANGES). Report
/home/user/workspace/ops/reports/LN-SOL-<X>-128.md, notify LN-SOL-<X>-128.txt. Flag-manifest PRs (.github/fly-env-desired-state.json):
check values against src/common/env-validation.ts closed sets, scripts/fly-env/fly-env-manifest.js PRECONDITIONS and the gate text.

# ---- Finishing agent 127's half-done PRs ----

## FIN-T1B-128 (Claude Opus 5.5, BUILDER, T4 tenancy/PII, 75 min) — finish backend#843 R11-T1b, then AIB-INJ-128.
PR growth-project-backend#843 "R11-T1b read_history covers device health, fasting, past Roman chats and own posts" (branch
agent127/r11-t1b-127, head a000be7b, 376 lines, CI green at that head but no READY comment; main has since merged #842 R11-W1 which also
edits src/roman/tools/roman-read-tools.ts). Steps: worktree on the PR branch (_COMMON item 3); `git merge origin/main`, resolve conflicts
keeping BOTH #842's personal_baselines and #843's new kinds; run test/roman/tools/roman-read-tools.spec.ts and the T1b spec through
heavy.sh; check the T4 rules still hold (run() refuses every role but 'student'; subject is caller.id only, never input; zod input with
unknown keys rejected; per-day device health only, never raw heart-rate samples; result clamp + truncated flag; numbers computed in code).
Push once; CI green; post `FIX ROUND 1 (OPENING) (R11-T1B-127, agent 128) — growth-project-backend#843 @ <full sha> — READY FOR AUDIT`
with tier T4 in the comment body; then _COMMON item 7. The privacy policy text naming these inputs is FIN-L2-128's job (b#844); bloodwork
is not read (future slice). Report ops/reports/FIN-T1B-128.md.
Second job (start while you wait for verdicts, separate worktree, new PR): AIB-INJ-128 (T3, backend, under 120 lines). The AI workout
builder is LIVE. When a coach sets an injury area, injury-risky built-in exercises are removed from the library list the model sees, so an
exercise already IN the workout (e.g. a squat) reaches the model only as an id: a coach asking "swap squats for something knee-friendly"
gets a model that cannot see the squat's name. Find the prompt builder under src/ai/gateway/workout-builder/ (b#841 "AI builder exercise
names" added names for non-seed rows; read its diff). Smallest fix: names (and muscle group when known) for EXISTING rows always come from
the full library/catalog or the row's stored name, independent of the injury filter; the list of exercises the model may ADD stays
filtered exactly as today. Failing-first spec. Seed-row behaviour without an injury stays byte-identical. Title "fix(ai): the AI builder
sees the names of injury-filtered exercises already in the workout (AIB-INJ, T3)". READY comment as above with job AIB-INJ-128.

## FIN-L2-128 (Claude Opus 5.5, BUILDER, T3 legal copy, 60 min) — finish backend#844 R11-L2, then CI-APT-128.
PR growth-project-backend#844 (branch agent127/r11-l2-127, head 0168b451, WIP STOP comment on the PR). Done there: both policies follow the
owner's 11:46 ruling (Roman's notes are kept with the account and deleted only with it; memory off, Roman withdrawal and chat deletion keep
them, unread while memory is off; no "delete my notes" control). Remaining: (1) the operator add-on: in src/public-pages/trust-pages.html.ts
(privacy policy + health-data policy), name the R11-T1b (#843) inputs among what Roman may read: fasting logs, past Roman conversations,
the client's own community posts, per-day device health (sleep stages, bedtime and wake time, body weight and body fat, blood pressure),
never raw heart-rate samples; (2) re-check that no line still offers deleting notes from Settings (b#845's note named trust-pages L270, L271,
L433 at its time) and that the text matches merged R11-L1 (#831); (3) POLICY_LAST_REVIEWED = today from `TZ=America/Los_Angeles date`;
(4) test/trust-pages.spec.ts asserts the new sentences failing-first. No first person, no exclamation marks, never name the clinic
partner, no new promises. Merge origin/main first. Push once, CI green, `FIX ROUND 1 (OPENING) (R11-L2-127, agent 128) — ... READY FOR
AUDIT`, then _COMMON item 7. Report ops/reports/FIN-L2-128.md.
Second job (start while you wait, separate worktree, new PR): CI-APT-128 (T3 CI, backend, under 80 lines). In
.github/workflows/*.yml every "Install postgresql-client" step (`sudo apt-get update && sudo apt-get install -y postgresql-client`) hung for
up to 90 minutes on 10-07 (runs 37666084730, 37667394228, 37667372801), blocking required checks. Fix fail-closed: give each such step
`timeout-minutes: 10`; if `psql` is already on the runner image use it (`command -v psql && psql --version`), otherwise install with a
bounded retry (`for i in 1 2 3; do timeout 120 sudo apt-get update -o Acquire::Retries=3 && timeout 240 sudo apt-get install -y
postgresql-client && break; sleep 10; done`), and end the step with `command -v psql` so a missing client still fails the job. No check is
removed, skipped, made optional or weakened; required-check names unchanged. Prove it with the PR's own CI run (each job's step log shows
psql --version). Title "ci: bounded, fail-closed postgresql-client install (CI-APT, T3)". READY comment with job CI-APT-128.

## FIN-C2C-128 (Claude Opus 5.5, BUILDER, T4 consent, 2 h) — finish backend#845 R11-C2C, then mobile#463.
Owner 11:46 RULING: Roman's notes are deleted ONLY on account deletion. Memory off, Roman withdrawal and chat deletion keep the notes (they
are not read while memory is off). No "Delete my notes" control anywhere. Owner 10:18: memory is ON by default (it rides in the Roman
consent box 2 every client already ticks; merged m#461), with an off switch "Roman's memory" at the very bottom of Settings > Roman AI.
(1) growth-project-backend#845 (branch agent127/r11-c2c-127, head b8883e82; WIP STOP comment): memory off (v4 over v5) keeps notes; the
delete-first path and its 503 are removed; tests pin that withdrawal keeps notes and account deletion erases them via the deletion
manifest. Its community-live-tests job was cancelled: re-run it (_COMMON item 5) or merge origin/main and push once; verify the specs pass;
post `FIX ROUND 1 (OPENING) (R11-C2C-127, agent 128) — growth-project-backend#845 @ <sha> — READY FOR AUDIT` (T4); _COMMON item 7.
(2) growth-project-mobile#463 (branch agent127/r11-c2b-127-switch, head 7e67482a; dual APPROVE at that head is now void; OPERATOR HOLD
comment; conflicting with main): merge origin/main and resolve; change every user-facing line that says turning memory off deletes notes,
and remove any delete-notes control or confirmation. Row label "Roman's memory"; helper (default) "Roman keeps notes from chats and logs to
give answers that fit. Turning this off stops Roman from using them. Notes are deleted when the account is deleted." Keep the switch at
the very bottom of Settings > Roman AI; ON for a client-ai-v5 holder; off = memory withdrawal (Roman stays allowed under v4); on = re-grant
v5 with the same text and sha. It must work against the CURRENT production backend (deploy 23 still deletes notes on memory off until
#845 deploys: the copy must not promise keeping notes before that is live — if the app cannot tell, use copy true in both cases, e.g.
"Turning this off stops Roman from using his notes." and leave deletion wording out). Tests updated failing-first. Push once, CI green,
`FIX ROUND 2 (R11-C2C-127, agent 128) — growth-project-mobile#463 @ <sha> — READY FOR AUDIT`; _COMMON item 7.
Report ops/reports/FIN-C2C-128.md.

## FIN-T3-128 (Claude Opus 5.5, BUILDER, T3 prompt/eval, 90 min) — finish backend#846 R11-T3.
PR growth-project-backend#846 (branch agent127/r11-t3-127, head 29613d2f, 583 lines; WIP HANDOFF comment; build-and-test FAILED at that
head). Scope = JOBS127 entry "R11-T3-127" + "R11-T3 AMENDMENT" (read both): answer contract + "LOOKING THINGS UP" sections only on tools
turns (prompt byte-identical otherwise), golden cases G38-G47 + Layer 7, and the reply check (fact gate) knows the protein fact and every
numeric field the T1 and W1 tools return, so a tool-fetched number is not treated as invented. Steps: worktree on the branch; merge
origin/main (#842 W1 is merged now); read the failing job log (`gh run view <id> --log-failed -R ...`); fix; run test/roman/eval/* and
roman-read-tools specs one file at a time via heavy.sh; stay under 800 lines; push once; CI green; `FIX ROUND 1 (OPENING) (R11-T3-127,
agent 128) — growth-project-backend#846 @ <sha> — READY FOR AUDIT`; _COMMON item 7. If #843 (T1b) merges before you are READY, merge main
again and register its numeric fields too; otherwise list them under "Not fixed (needs operator)". The FEATURE_ROMAN_TOOLS flip waits for
this PR merged and deployed. Report ops/reports/FIN-T3-128.md.

## FIN-DESV-128 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h) — finish mobile#470 (fix round 3), then mobile#473.
(1) growth-project-mobile#470 DES-V part 1 (branch agent127/des-v-127-train, head ec5dc175). BOTH lenses posted REQUEST CHANGES at that head
with the same B1: ProfileScreen.tsx (~79-83) tells a client with no coach, or with a normal coach and sharing off, "Workouts are visible only
to you." / "Workouts and meals are visible only to you.", but the platform owner account can still read those logs (backend
CoachService.loadFitnessConsents and ConsentService.coachCanAccess bypass for role owner). Read both verdicts in full. Smallest fix: never
claim exclusivity; describe only the client-coach sharing state from /consent/me: coach linked + shared -> "Workouts and meals are shared
with <coach name>." (name only what is actually shared when partial); coach linked + not shared -> "Workouts and meals are not shared with
<coach name>."; owner_access true -> keep the existing "visible to you and <coach name>" line; no coach -> no sharing sentence. Update the
tests that expect "only to you". Push once, CI green, `FIX ROUND 3 (DES-V-127, agent 128) — growth-project-mobile#470 @ <sha> — READY FOR
AUDIT` naming B1; _COMMON item 7.
(2) growth-project-mobile#473 DES-V part 2 (branch agent127/des-v-127-payments, head 199037a9, never READY, one failing check). Start only
after #469 and #470 are merged (poll every 5 minutes). Merge origin/main, fix the failing check, verify rows #31-#37 + the guard tests of
the JOBS127 entry "DES-V-127" (last occurrence) are done as written (row #33: keep "has been notified" only if backend main sends that
notification), push once, CI green, `FIX ROUND 1 (OPENING) (DES-V-127, agent 128) — growth-project-mobile#473 @ <sha> — READY FOR AUDIT`;
_COMMON item 7. Report ops/reports/FIN-DESV-128.md.

## FIN-DESQ-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 45 min) — finish mobile#479 DES-Q, then DES-AC-127.
growth-project-mobile#479 (branch agent127/des-q-127, head ddd95f4d; WIP HANDOFF comment; CI now green at that head). Scope = JOBS127 entry
"DES-Q-127" (last occurrence). Verify against the entry and the six rules: underline tabs, "<x> of <y> workouts done this week" only when y
is known (otherwise "<x> workouts this week"), hairline rows with real dates/duration/RPE only where recorded, strength chart only with >= 2
points, "Adjust for <first name>" and every other action kept, parity table + parity test, failing-first evidence (the tests-only head
f0aa8fb0 run). Fix anything missing in one push. Post `FIX ROUND 1 (OPENING) (DES-Q-127, agent 128) — growth-project-mobile#479 @ <sha> —
READY FOR AUDIT`; _COMMON item 7. Second job, while you wait (separate worktree, new PR): DES-AC-127 (macro targets) from DES-JOBS-PASTE.md
TRANCHE 3 (DES-F #471 is merged). Report ops/reports/FIN-DESQ-128.md and DES-AC-127.md.

# ---- Redo jobs that were not started (amended for agent 128) ----

## DES-S2-128 (GPT-6.1 Sol, BUILDER, T2 mobile, 2 h) — client Settings, part 2: seven groups on one screen.
Base: JOBS127 entry "DES-S-127" (last occurrence) + owner 11:26 "Client Settings grouped on one screen, nothing removed". Part 1 merged as
m#477 (themed sections and controls; read its diff and body first). Part 2: consolidate src/screens/client/SettingsScreen.tsx into seven
groups on ONE screen with small-caps overlines and hairlines, in this order: Account, Training and food, Notifications, Privacy and data,
Roman, Support, About. NOT a drill-down: every row, switch and destination stays on the same screen, one tap as today. Update the legacy
heading fixture. Parity test enumerates every row before and after. Do not edit src/screens/settings/RomanAiConsentScreen.tsx
(FIN-C2C-128 owns it via #463). Files: src/screens/client/SettingsScreen.tsx, src/screens/client/settings/** (+ tests). One PR under 450
lines. Report ops/reports/DES-S2-128.md.

## DES-H-128 (GPT-6.1 Sol, BUILDER, T2 mobile, 90 min) — Health without rings, with honest Starter goals.
Base: JOBS127 entry "DES-H-127" (last occurrence), AMENDED by the owner 11:26 ("maybe populate a basic, easy to hit goal set by default for
everyone"): every client gets STARTER goals used only when no coach- or client-set target exists: Steps 5,000, Exercise 20 minutes, Active
energy 250 kcal, kept in ONE constants file (new src/screens/client/wearables/starterGoals.ts) with a test. Replace the concentric rings
(HealthFitnessScreen.tsx + cards/ThreeRingHero.tsx, or a new bars card that replaces it) with three labelled rows using QuietBar
(src/ui/progress/QuietBar.tsx): "Active energy", "Exercise minutes", "Steps" (never Move / Exercise / Stand; nothing that resembles Apple's
Activity rings), each with its real value and sample date ("Tue 6 Oct"); the fill is against the coach/client target when one exists, else
the Starter goal with the visible label "Starter goal" (e.g. "Starter goal: 5,000 steps"); a real target drops the word Starter. Remove the
old invented RING_GOALS (500 kcal / 30 min / 10,000 steps). If an in-app goal editor exists, link it; if not, add no button. Every metric
shown today stays; goToMetricDetail taps and the connect CTA stay; coach-embed mode stays read-only. Tests: no data, stale sample (dated),
real target, starter goal, coach embed, parity of taps. One PR under 400 lines. Report ops/reports/DES-H-128.md.

## DES-K-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min) — Home layout per the A23 targets (after mobile#469 DES-T merges).
Base: JOBS127 entry "DES-K-127" (last occurrence; DES-A merged as m#467). mobile#469 (DES-T, Home honest copy) is READY and in review now;
poll every 5 minutes until it is MERGED (meanwhile read HomeScreen.tsx on the #469 branch, the target images plan/plan_luxury.jpg and
coach-home-solo/luxury.jpg, plan/README.md, and plan your change). Then branch from the new origin/main. Do exactly the entry: overline
date; serif headline = DES-T's truthful line; one forest primary action; every number cell homeCells() returns in one hairline row of serif
tabular numerals, each keeping its tap-to-Log; remove the 96 px gap; below-fold cards stay as hairline sections in the same order; a 32 pt
Roman avatar in the header opening Roman chat when featureFlags.romanChat is on (an added route). No copy change beyond layout. Files:
src/screens/client/HomeScreen.tsx, src/components/home/HomeHeaderActions.tsx (+ tests). One PR under 400 lines. If #469 is not merged by
15:30 PDT, tell the operator and stop. Report ops/reports/DES-K-128.md.

## DES-P-128 (GPT-6.1 Sol, BUILDER, T1 mobile, 90 min) — Progress, "the full picture" (after mobile#470 AND #473 merge).
Base: JOBS127 entry "DES-P-127" (last occurrence); image design-targets/mobile/progress-details/luxury.jpg. Branch from origin/main after
both DES-V PRs are merged. One PR under 400 lines. Report ops/reports/DES-P-128.md.

## FLIP-PB-128 (Claude Opus 5.5, BUILDER, T4 AI/config, 60 min) — the FEATURE_ROMAN_PLAYBOOK flip PR (second job of FIN-T3-128).
Backend deploy 24 (0d179edb, 13:15 PDT) put b#837 R11-P3b-2 (playbook builder + schedule) in production. Verify every playbook
precondition on main with file:line: all playbook slices merged and deployed (schema/migration, signals, builder + scheduler, the coach-method
augmenter in roman.module.ts), consent gates (whose data the builder reads and under which consent; nothing from a client without the
consent the policy names), the background cost cap (coaches per run, tokens/credits metered to the right pool, no unmetered model call),
the kill switch (unset = off, no timer, no reads), the merged privacy text (b#831 R11-L1) describing coach-method learning truthfully, and
that coaches never see the playbook (owner 11:22: coaches see Roman's proposals only). If ALL hold: ONE PR, branch agent128/flip-pb-128, that
changes only "FEATURE_ROMAN_PLAYBOOK": "unset" -> "true" in .github/fly-env-desired-state.json, its gates note, and the
docs/runbooks/launch-flags.md row; precondition evidence in the body; test/ci/fly-env-manifest.spec.ts passes (heavy.sh). Title
"chore(flags): turn on Roman's coach playbook (FLIP-PB, T4)". READY per _COMMON item 7 (job FLIP-PB-128). If any precondition fails, open
no PR: write the gap and the smallest fix in ops/reports/FLIP-PB-128.md. Never run fly-env-sync (the operator applies after merge).

## FLIP-TOOLS-128 (Claude Opus 5.5, BUILDER, T4 AI/config, 60 min) — the FEATURE_ROMAN_TOOLS flip PR (next job of FIN-T1B-128).
All tools pieces are merged on backend main (14:06): R11-T1 #840, R11-T2B #838 (budgeted, metered tool loop), R11-W1 #842, R11-T1b #843,
R11-T3 #846 (answer contract, golden cases, reply check) and the policy text #844 (names what Roman may read). R11-T3-FU (#849, reply-check
follow-up) is in review; deploy 25 follows it. Verify every tools precondition on main with file:line: tools only on student turns, subject =
caller only, per-turn and per-day budgets metered to the right AI pool, no unmetered model call, the result clamp, the reply check active,
the policy names every data kind the tools read, the kill switch (unset = off, prompt byte-identical), and no mobile change needed. If ALL
hold: ONE PR, branch agent128/flip-tools-128, changing only "FEATURE_ROMAN_TOOLS": "unset" -> "true" in .github/fly-env-desired-state.json,
its gates note and the docs/runbooks/launch-flags.md row; evidence in the body; test/ci/fly-env-manifest.spec.ts passes (heavy.sh). Title
"chore(flags): turn on Roman's tools (FLIP-TOOLS, T4)". READY per _COMMON item 7 (job FLIP-TOOLS-128). The operator merges and applies it
only after deploy 25 is live. If a precondition fails: no PR; the gap + smallest fix in ops/reports/FLIP-TOOLS-128.md.

# ---- OWNER 14:08: builders finish at READY; fresh agent per screen; a standing FIX lane handles findings and conflicts ----

## FIX-128 (fix lane; instances FIX-SOL-A-128, FIX-SOL-B-128 = GPT-6.1 Sol for T1/T2; FIX-OPUS-A-128 = Claude Opus 5.5 for T3/T4 and any
## consent, privacy, money or Roman PR). Run until 18:30 PDT or an operator stop; finish if the queue is empty for 45 minutes in a row.
Loop (sleep 240 between polls) over open PRs in growth-project-backend and growth-project-mobile with head branch "agent127/*" or
"agent128/*". A PR is in YOUR queue when one of these holds at its CURRENT head (gh pr view N --json headRefOid,mergeable):
 (a) a lens verdict "AUDIT ... @ <head> — VERDICT: REQUEST CHANGES" exists and no "READY FOR AUDIT" comment is newer than it;
 (b) both lenses APPROVE at the head but mergeable is CONFLICTING;
 (c) the latest READY names the head but a required check FAILED at the head.
Sol instances take T1/T2 PRs (tier in the PR body header) except consent/privacy/money/Roman; FIX-OPUS-A takes T3/T4 and those. Claim with
"FIX CLAIM (<your id>) @ <full sha>"; re-read comments; if an earlier FIX CLAIM for that head exists (under 60 minutes old), delete yours and
move on. Work in a worktree on the PR's own branch (_COMMON item 3, "Finishing an existing PR"; worktree /home/user/workspace/wt/FIX-<n>-<repo>,
remove it when done). Read the PR body, the original job entry it names, the builder's report if present in /home/user/workspace/ops/reports/,
and BOTH verdicts in full. Fix ONLY the Bs (plus a U if it is one line), each with a test where behaviour changes; for (b) merge origin/main
and resolve keeping both sides (README rule: own entry in place); for (c) read the failed log and fix. Merge origin/main, confirm no conflict,
run the touched tests via heavy.sh, push ONCE, wait for CI green (poll every 120 s), then post
`FIX ROUND <k> (<original JOB>, agent 128, <your id>) — growth-project-<repo>#<n> @ <full sha> — READY FOR AUDIT` (k = previous round + 1)
listing each finding fixed (B1 ... with file:line). A finding you judge wrong: answer it in that comment with evidence (file:line), do not
silently skip it. Never merge; never touch other PRs. One line per PR in /home/user/workspace/ops/reports/<your id>.md.

## NEXT SCREENS (operator launches each as a FRESH builder, one screen per agent, as slots free; same entries as before)
DES-AQ (after #491 merges), DES-AR, DES-AT, DES-AU, DES-AV, DES-AW, DES-AX, DES-AY, DES-AZ (after #483 merges), DES-BA, DES-BB (Claude Opus
5.5), DES-BC, DES-BD, DES-P-128 (after #473 merges). The 14:10/14:11 "second job" messages are WITHDRAWN except for a second job the agent
had already pushed commits for (it brings that one to READY, then finishes).

## R11-INT-AUD-128 (Claude Opus 5.5, AUDITOR, read-only, T4, 90 min) — Roman v1.1 with ALL switches on, before they flip.
Owner 14:14: push Roman's increased intelligence into production. Every R11 slice is merged on backend main (L1 #831, T2A, T1 #840, T2B #838,
M4, M5 #834, P3b #833/#837, P4, T3 #846, W1 #842, T1b #843, C2B #835, C2C #845, L2 #844; open: R11-T3-FU #849, R11-L3 #850 coach wording,
FLIP-TOOLS PR coming). Each slice was reviewed alone; nobody has traced them TOGETHER. Trace on current main, as if FEATURE_ROMAN_MEMORY,
FEATURE_ROMAN_TOOLS and FEATURE_ROMAN_PLAYBOOK were all 'true' (read src/common/env-validation.ts for any companion flags): (1) one student
turn end to end: consent scope per path (v4 'base' vs v5 'memory' in src/ai-consent/ai-consent.constants.ts), memory block + coach-method
block + tools sections in one prompt (size limits, ordering, truncation), the tool loop budget and metering to the right pool, the reply
check, what the client sees on provider error/timeout/budget exhaustion; (2) the memory writer after the turn (what is stored, PII, which
consent, chat deletion keeps notes, account deletion erases via the manifest); (3) the playbook builder schedule (whose data, cost cap,
failure handling) and the augmenter; (4) memory off / Roman withdrawal / v4-only clients: nothing memory-scoped is read or written;
(5) logs and errors carry no PII or note text; (6) the coach never sees notes, playbook or chats; (7) mobile: the Roman chat screen and
the memory switch (m#463) behave with tools latency and the new states. Use A2 overrides strictly: Bs only with a one-sentence normal-user
story; edge cases one line. Output /home/user/workspace/ops/reports/R11-INT-AUD-128.md: B list (file:line, smallest fix, which flag it
blocks), U list, a per-flag GO / NO-GO table (TOOLS, MEMORY, PLAYBOOK) with evidence, then "## HANDOFF". No code, no PRs, no comments.
Read-only on Supabase only if truly needed (SELECT; never print personal data). Final answer under 200 words with the GO/NO-GO table.

## NUTR-AUD-128 (Claude Opus 5.5, AUDITOR, read-only, T2/T3, 90 min) — meal plans, grocery, shopping, prep and recipes, end to end.
Owner 14:14 (verbatim): "Is the grocery and meal plan tools in the app working correctly? Is it world class, luxurious, calm, and useful?
Dead buttons? Lets get an opus5.5 agent to investigate this area!" Trace client AND coach paths on mobile main + backend main: client meal
plan (daily and week views), macro targets, recipes and recipe detail, grocery list, shopping list, prep guide, logging a planned meal into
the food log, and the coach side that creates/assigns meal plans and recipes (including any AI drafts). For each screen: does every
button do something real (dead buttons), are the numbers right (portions, units, per-meal and daily totals, grocery aggregation and
de-duplication, check-off persistence across app restarts and days), loading/empty/error states, honest copy, and the calm luxury rules
of _COMMON_128. Open redo PRs on these screens: m#490 (DES-AB meal plan), m#494 (DES-AN recipes), m#500 (DES-AO grocery/shopping/prep);
read their diffs and judge at their heads so you do not re-report what they fix. Output /home/user/workspace/ops/reports/NUTR-AUD-128.md:
(1) B list (one-sentence normal-user story, file:line, smallest fix); (2) U list; (3) dead-button table; (4) "world class and useful":
the 5-8 highest-value improvements ranked, each marked FIX (within the existing feature) or NEW (needs an owner yes, with a recommended
default); (5) proposed fix jobs, each file-disjoint, under 400 lines, with exact files, tier and model, ready for the operator to launch;
then "## HANDOFF". No code, no PRs, no comments. Final answer under 200 words.

## ALLERGY-128 (Claude Opus 5.5, BUILDER, T3 safety copy, 60 min) — the allergy prompt must not promise filtering that does not exist.
Found by DES-AN-127 (report /home/user/workspace/ops/reports/DES-AN-127.md, B2): a client opens Recipes for the first time, the allergy prompt
(src/components/AllergySafetyPrompt.tsx ~109-110) says recipes that conflict with their allergies are hidden, they pick a nut allergy, but
RecipesScreen.tsx (~202-208) filters only by search and tags; a client could cook a recipe with nuts trusting that promise. FIRST verify on
backend main whether any recipe/meal-plan endpoint filters by the client's stored allergies or dietary restrictions (and what
src/lib/profileCompletion.ts:31 "the recipe engine reads ..." refers to); record the evidence. If nothing filters recipes the client sees:
smallest fix = make every user-facing line true (the prompt states what the saved allergies are actually used for, if anything, and tells
the client plainly to check each recipe's ingredients; no promise of hiding, no "yet"); keep the prompt's actions (submit, later, dismiss)
and where the answer is saved. Do NOT build keyword allergen matching (false negatives would create false safety); list real filtering as an
owner decision (NEW) with a recommended default in your report. If something DOES filter, make the copy match exactly what it does. Mobile
files: src/components/AllergySafetyPrompt.tsx (+ its tests; RecipesScreen.tsx only if a line there is false — m#494 DES-AN edits
RecipesScreen.tsx, so prefer not to touch it; if you must, merge origin/main after #494 merges). Failing-first test on the copy. Under 150
lines. Title "fix(recipes): the allergy prompt says what saved allergies actually do (ALLERGY, T3)". READY per _COMMON item 7 (job
ALLERGY-128), then finish (owner 14:08 override). Report ops/reports/ALLERGY-128.md.

## DES-K2-128 (GPT-6.1 Sol, BUILDER, T1 mobile presentation, 75 min) — Home's child cards in the calm look (DES-K m#492 merged).
DES-K-128 (report /home/user/workspace/ops/reports/DES-K-128.md, "Not fixed") left the boxed chrome inside Home's child components:
src/components/home/PushPermissionCard.tsx (~86), src/components/home/CoachIntroductionBanner.tsx (~160),
src/components/home/HolisticInsightsTile.tsx (~141), src/entitlements/dunning/DunningBanner.tsx (~108), plus any other card Home renders
with its own box (list them first). Presentation only: replace boxes, fills and shadows with hairline sections in the A23 look (overline,
Inter body, one forest action where the card has a primary action), theme tokens only. Every action, handler, condition and order stays
exactly as on main; consent (push permission) and payment (dunning) logic untouched, copy unchanged unless false (then fix truthfully and
say so). Optional presentation props are fine if a component is also used outside Home (check every caller; other callers keep today's
look unless the prop is passed). Parity test: every card's actions still reachable and firing the same handlers. One PR under 400 lines,
branch agent128/des-k2-128. README rule. READY per _COMMON item 7 (job DES-K2-128), then finish. Report ops/reports/DES-K2-128.md.

## FLIP-MEM-PB-128 (Claude Opus 5.5, BUILDER, T4 AI/config, 75 min) — the FEATURE_ROMAN_MEMORY and FEATURE_ROMAN_PLAYBOOK flip PRs.
Owner 14:25 (decision 1, verbatim): "turn on memory and the coach playbook as soon as the coach wording is live; recommended yes". This
waives agent 127's "m#463 in a shipped store build" precondition (only builds with m#461 grant client-ai-v5; v4 holders stay 'base'; a
fresh APK with the m#463 off switch follows). Preconditions to verify on main with file:line: b#845 (memory off keeps notes), b#844 (policy
names Roman's inputs), b#850 R11-L3 (coach-method wording; in review — if not merged yet, open the PRs anyway and say so in the body),
m#461 + m#463 merged on mobile main, consent scope gating ('memory' only for client-ai-v5), the playbook cost cap and pool (read
/home/user/workspace/ops/reports/FLIP-PB-128.md; the R11-INT-AUD-128 auditor is checking the coach-credit disclosure — read its report
/home/user/workspace/ops/reports/R11-INT-AUD-128.md if present and cite its GO/NO-GO), kill switches. Open TWO separate PRs (every flip is its
own audited PR): agent128/flip-mem-128 ("FEATURE_ROMAN_MEMORY": "unset" -> "true") and agent128/flip-pb-128 ("FEATURE_ROMAN_PLAYBOOK":
"unset" -> "true"), each also updating its gates note and its docs/runbooks/launch-flags.md row, evidence in the body, test/ci/fly-env-
manifest.spec.ts passing (heavy.sh; LEFTHOOK=0 commits). Titles "chore(flags): turn on Roman's memory (FLIP-MEM, T4)" and "chore(flags):
turn on Roman's coach playbook (FLIP-PB, T4)". READY per _COMMON item 7 for each (jobs FLIP-MEM-128, FLIP-PB-128), then finish. If a
precondition fails for one flag, open only the other and write the gap + smallest fix in ops/reports/FLIP-MEM-PB-128.md.

## FW-AUD-128 (Claude Opus 5.5, AUDITOR, read-only, 90 min) — first-week client journeys, audited with scrutiny. One instance per area.
Owner 14:25 (verbatim): "We need to identify more areas of small features a client oculd run into within the first week (like the meal
prep area) and audit them with scruitiny!" and "I want top models producing top grade UI/UX design!". Your area is named in your objective
(table below). Trace it on mobile main + backend main as a brand-new client in their first 7 days would meet it, in BOTH states that apply
(with a coach / without a coach; memory on / off where relevant). For every screen and small feature in the area: does each button and
row do something real (dead buttons), are numbers/units/dates right, do loading/empty/error/offline states exist and say true things,
does data persist (restart, next day), is anything private shown to the wrong person, is the copy honest, and does it meet the calm luxury
rules of _COMMON_128 (mobile redo rules 1-8). Before reporting, list the open agent127/agent128 PRs touching your files
(`gh pr list -R ... --state open --json number,title,files`) and judge those screens at the PR heads so you do not re-report what they fix.
Apply SoT A2 overrides strictly (B only with a one-sentence normal-user story; edge cases one line). Output
/home/user/workspace/ops/reports/<your id>.md: (1) B list (story, file:line, smallest fix); (2) U list; (3) dead-button table;
(4) "first-week polish": the 5-8 highest-value improvements ranked, each FIX (inside the existing feature) or NEW (needs an owner yes; give
a recommended default); (5) proposed fix jobs, file-disjoint from each other and from open PRs, each under 400 lines, exact files, tier,
model (Claude Opus 5.5 for T3/T4, consent, privacy, money, safety; GPT-6.1 Sol otherwise), ready for the operator to launch; "## HANDOFF".
No code, no PRs, no comments. Supabase SELECT only if truly needed, never print personal data. Final answer under 200 words: Bs first.
| id | area |
|---|---|
| FW-ONB-128 | first open to first Home: welcome, sign up, verify email, role choice, consultation (Roman consent boxes), Day-1 onboarding, the first Home, first push/email; new client with an invite vs. without |
| FW-FOOD-128 | food logging beyond the main log: search, barcode scan, recents/favorites, custom foods, edit/delete entries, copy a meal or day, quick add, water, fasting timer and history, meal reminders, day navigation |
| FW-TRAIN-128 | training beyond the live set rows: assigned vs. empty workout start, swap/replace/add exercise, notes, rest timer settings, finish/abandon, history edit/delete, personal bests, routines, workout reminders |
| FW-BODY-128 | weight log, body measurements, progress photos (who can see them, storage, delete), charts and trends, units kg/lb and cm/in, goals, Apple Health / Health Connect connect, permissions, sync status, disconnect |
| FW-COACH-128 | the client side of the coach relationship: joining a coach or accepting an invite, coach profile, messages, booking a session and its reminders, check-in forms, coach-assigned habits and plans appearing, sharing settings, leaving a coach |
| FW-MONEY-128 | client money: packages, buying, receipts, subscription status and renewal date, cancel, failed payment / dunning, restore, refunds and support path, promo codes, what access ends on expiry (money must be bulletproof) |
| FW-ROMAN-128 | Roman in week one: first chat, consent boxes, replies with no data yet, AI guide, limit/credit messages, error states, crisis and safety routing (self-harm, eating disorder, medical emergency), chat history and deletion, the memory switch |
| FW-NOTIF-128 | notifications and reminders: push permission, everything that fires in week one, preferences honoured (mute all), deep links landing on the right screen, badges, email digests |
| FW-ACCOUNT-128 | account and settings: change email/password, sign out, delete account (what goes, who is told), data export, blocked users, units, support/contact, legal links (privacy, terms) open the right pages |
| FW-COMM-128 | community in week one: first post, reply, reactions, report and block (App Store 1.2: report, block, act within 24 h), direct messages, notifications, challenges join/leave, leaderboard names and privacy |

## DESIGN-QA-128 (Claude Opus 5.5, AUDITOR, read-only, 90 min) — top-grade UI/UX: cross-screen consistency of the redo.
Owner 14:25: "I want top models producing top grade UI/UX design!". About 25 redo PRs by different builders merged or are in review today
(DES-A/F/J/L/M/O/W/X/Z/S/T/R/K/Q/AA-AP...). Read the doctrine sources in _COMMON_128 and mobile docs/QUIET_LUXURY_DOCTRINE.md, then the
current main code of every redone screen (git log --since=2026-10-07 on mobile main; open DES PR heads too). Find DRIFT that a client would
notice moving between screens: different overline styles or sizes, mixed type scales and weights, inconsistent spacing rhythm and page
margins, hairline vs. box mixing, more than one forest primary per screen, different press states/haptics, different empty/loading/error
patterns, icons, tab-label and header treatments, tabular numerals, and theme-token violations. Check src/ui primitives: is there ONE
shared overline / hairline section / quiet row / primary button component, or did builders each roll their own? Output
/home/user/workspace/ops/reports/DESIGN-QA-128.md: a ranked drift list (screen, file:line, what differs, the house rule), a proposal for the
smallest set of shared primitives or tokens that removes the drift (only if small and safe), and fix jobs (file-disjoint, under 400 lines
each, exact files, model Claude Opus 5.5) ready to launch; "## HANDOFF". Use the target images in design-targets/mobile (read tool) as the
bar. No code, no PRs, no comments. Final answer under 200 words.

## R11-FIX-128 (Claude Opus 5.5, BUILDER, T4 AI, 60 min) — R11-INT-AUD-128 U1 + U2, one backend PR.
Read /home/user/workspace/ops/reports/R11-INT-AUD-128.md (U list). U1: a 3-round tools turn can outlive the app's 60 s abort (the 25 s wall
is checked only before a call, roman-tool-loop.ts:127), so the client reads "No connection to Roman right now", no reply is stored and the
tokens are still debited. Smallest fix: turn_wall_ms 25_000 -> 15_000 (roman-tool.types.ts:66) plus a spec proving a worst-case 3-round
turn (wall + last round + final call at their timeouts) finishes inside 60 s; if the arithmetic says 15 s is not enough, pick the number
that is and show it. U2: the memory augmenter reads a v4 / memory-off client's notes before the scope check drops them
(roman.service.ts:1031-1035); read consentedClients('memory') first and skip the augmenter without it (~5 lines + spec). Failing-first
specs; heavy.sh; LEFTHOOK=0 commits. Branch agent128/r11-fix-128, title "fix(roman): a tools turn ends before the app gives up, and notes
are read only with memory consent (R11-FIX, T4)". Under 150 lines. READY per _COMMON item 7 (job R11-FIX-128), then finish.

## PB-POOL-128 (Claude Opus 5.5, BUILDER, T4 money, 75 min) — playbook learning paid by the platform, not the head coach's AI credits.
R11-INT-AUD-128 B2 (report section "Playbook metering"): every playbook rebuild (up to 4 a day) debits the head coach's AI credits
(playbook-builder.service.ts:173) while coach-facing text never says so. Owner decision pending (operator recommended option B, platform
pays); build it now, the operator merges only after the owner's yes. Option B: add payer {kind:'platform'} to RomanBackgroundPayer
(roman-background-spend.ts:39-41), skip the coach-pool pre-check and debit for it (:110-120, :211-233) while still recording the spend in
the platform ledger/meter the background ceiling reads, pass it at playbook-builder.service.ts:173; spend stays bounded by the $10/day
background ceiling (prove it in a spec). No other payer changes. Failing-first specs (coach pool unchanged after a playbook build; ceiling
still enforced). heavy.sh; LEFTHOOK=0. Branch agent128/pb-pool-128, title "fix(roman): coach playbook learning no longer spends the
coach's AI credits (PB-POOL, T4)"; body line "Owner decision pending: merge only after the owner's yes." Under 200 lines. READY per
_COMMON item 7 (job PB-POOL-128), then finish.

## NUTR-BE-128 (GPT-6.1 Sol, BUILDER, T2 backend, 90 min) — NUTR-AUD-128 backend rows, one PR.
Read /home/user/workspace/ops/reports/NUTR-AUD-128.md (B1, U2, U3, U4 and the fix-job rows NUTR-PREP-B, NUTR-LISTS, NUTR-PLAN-B).
(1) prep-guide.service.ts: stop presenting the newest visible recipes as the client's planned prep: return what the data really is with a
`source` field ('plan' when it comes from the client's assigned meal plan, 'library' otherwise), no invented week (the week parameter
must either filter truly or be ignored and reported as such), canonical singular units before aggregation (cup/cups, tbsp/tablespoon,
lb/lbs, g/grams...). (2) lists.service.ts addItem: merge into an unchecked row with the same lower-cased name + canonical unit (sum
quantity) instead of a duplicate. (3) meal-plans.service.ts canonical fallback: exclude ended plans (OR ends_on null / ends_on >= today, as
real-meal-plans.service.ts:289). Additive and safe for the production app (old clients ignore `source`). Specs for each; heavy.sh;
LEFTHOOK=0. Branch agent128/nutr-be-128, title "fix(nutrition): prep guide says where its recipes come from, grocery items merge, ended
plans leave (NUTR-BE, T2)". Under 400 lines. READY per _COMMON item 7 (job NUTR-BE-128), then finish.

## FIX-PR-128 (Claude Opus 5.5, FIXER, one PR per instance, 75 min) — fix one redo PR's findings plus folded audit fixes, same branch.
Your instance names the PR. Follow ## FIX-128 (claim comment, failing-first, push once, CI green, FIX ROUND n READY, README rule, merge
origin/main first) for that PR only, at its current head: fix every finding of any REQUEST CHANGES verdict at the head, then the folded
NUTR-AUD-128 items listed for your PR (read /home/user/workspace/ops/reports/NUTR-AUD-128.md). Keep every existing pathway; parity test
updated; whole PR stays under 800 lines. If another lane posted a FIX CLAIM at this head in the last 60 min, stop and report.
| instance | PR | folded audit items |
|---|---|---|
| FIX-490-128 | mobile#490 (DES-AB meal plan) | U1 (de-duplicate the plan shown twice, PlanScreen.tsx:244-256) and U12 (one tabular day-total line, ClientDailyMealPlanScreen.tsx:139-141) |
| FIX-494-128 | mobile#494 (DES-AN recipes) | U5 (saved state from /recipes/saved, not the list cache; a "Saved" filter backed by /recipes/saved); NOT the allergy prompt (ALLERGY-128 owns it) |
| FIX-500-128 | mobile#500 (DES-AO grocery/prep) | B1 mobile (Prep guide copy says where the recipes come from: missing `source` = library, honest wording, week arrows removed or truthful), U3 mobile ("Add all" calls POST /lists/grocery/bulk once), recipe rows tappable to detail |

## NUTR-COPY-128 (GPT-6.1 Sol, BUILDER, T1 copy, 45 min) — NUTR-AUD-128 U7, U8, U9.
U7 client-detail/MealPlanTab.tsx:57-59 "the client will see it on their Plan tab" -> "The client sees it under Meal plan."; U8
AIMealPlanDraftScreen.tsx:225 pass initialTab: 'mealplan' (ClientDetailScreen reads it, line 86) so approval lands where the flow says;
U9 MoreScreen.tsx:52 "The meals planned for you this week" -> "The meals your coach planned for you" (check the no-coach state: if a
client without a coach can reach it, make the line true for them too). Tests. Branch agent128/nutr-copy-128, title "fix(copy): meal plan
lines say where things really are (NUTR-COPY, T1)". Under 120 lines. READY per _COMMON item 7, then finish.

## FIXWAVE-128 (owner 14:58: "get to work fixing this broken BULLSHIT") — six builders, one PR each, READY per _COMMON item 7, then finish.
Each instance does the job row named below from the audit report given (read that report's B/U text and job row first), plus the owner's
words where quoted. Failing-first tests, parity for any screen touched, theme tokens, honest copy, heavy.sh, LEFTHOOK=0 for backend.
If an open PR edits the same file, merge origin/main first and keep your diff minimal; say so in the PR body. Tonight's store builds are
cut from mobile main at 23:00 PDT.
| instance | report + row | owner's words / extra |
|---|---|---|
| WEIGH-KB-128 (Opus, mobile) | ops/reports/FW-BODY-128.md B1 + job row J1 (FW-BODY-J1-128) | "the number pad covers the Log weight sheet ... well thats awful - fix it!" Log weight must work on iPhone: field and Save visible above the keyboard, a Done/tap-outside dismiss, Save disabled while saving. Include the J1 truthful-number fixes only if they stay in the same file and under 300 lines total. |
| TRAIN-GATE-128 (Opus, mobile, T4) | ops/reports/FW-TRAIN-128.md B1 + job row J1 TRAIN-GATE-128 | Owner: leaving the app or screen mid-workout must NOT close or lose the workout; returning shows it exactly where it was. Deleting a workout in progress is its own clearly named action ("Discard workout", with a confirm), never the first choice and never called "Start Fresh"; "Resume" is the first choice. A paid client on weak signal must never be dropped to "Choose a Plan" mid-workout (keep the screen while re-checking; only a confirmed inactive result gates). |
| ONB-RESEND-128 (Opus, mobile, T3) | ops/reports/FW-ONB-128.md B1 + job row ONB-RESEND-128 | "a new client can't ask for the confirmation email again - WTF!?!" Call the live POST /auth/resend-verification from the verify step, the sign-in "confirm your email" error and the expired-link screen, with honest sent/limit/error states. m#504 (sign in) and m#502 (role choice/invite) are open on nearby auth files: base on main, keep the diff minimal. |
| MONEY-MAIL-128 (Opus, backend, T3) | ops/reports/FW-MONEY-128.md B2 + job row MONEY-MAIL-128 | Owner: "coaches can read it no?" Payment/dunning emails to a client set Reply-To to that client's coach's email, so a reply reaches the coach; emails with no coach (or platform-level) reply to the support address. Template lines say exactly where a reply goes. No other email behaviour changes. |
| EXLIB-128 (Opus, mobile first) | ops/reports/FW-TRAIN-128.md U2 (exercise library empty: ExerciseCatalogItem 0 rows) | "Empty exercise library ... wtf!?!" Make the client Exercise library show real exercises in production WITHOUT a production write if possible: the coach builder and in-workout picker already use a working catalog (exerciseLibraryApi / seed library); point the client library and detail at the source that has data, keeping search, filters and detail. If that is impossible, prepare (do not run) the exact idempotent seed command and the before/after count queries for the operator, and say so. |
| REFUND-COPY-128 (Sol, mobile, T1) | ops/reports/FW-MONEY-128.md B1 (ClientPackagesScreen.tsx:588) | Owner wants coaches to issue refunds (agent 129 builds coach payment controls). Until that ships, the line must be true today: refunds are issued by The Growth Project team; tell the client how to ask (the in-app support/contact path that exists). One line plus its test; no other change. |
