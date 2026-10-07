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
