# TOUR-133 report (agent 133 lane, builder claude_opus_5_5)

Job: B33; prototype 46-66 adapted to today's 6 tabs. Worktree /home/user/workspace/wt/TOUR-133-mobile.

## Status (18:58 PDT, owner stop-and-drain 18:53: no new work)
- 17:00 started; node_modules linked. 18:03 DS-PRIMITIVES-133 (#577) merged; branch brought to origin/main a279e1f6 (fast-forward; no rebase, the brief forbids it).
- Full change set ~2,300 lines, split into a 4-PR stack, each under 800 lines, each a working state:

| PR | Base | Head (READY posted) | Lines | CI | Content |
|---|---|---|---|---|---|
| growth-project-mobile#603 | main | f8f569f511263a00a3f4861879e59b021435b2e9 | 725 | green | fold Calendar, Community, devices, welcome call into the completion (133-5); state v2 maps v1 |
| #604 | agent133/tour-133 | 4210f3997f34bdf1241b0685d36dfe2fd8959c1d | 780 | green | the seven beats (46-60, 66), Roman beat for coachless, Later on the message beat, plan card "Next: Day 1" row; state v3 maps v1/v2 |
| #605 | agent133/tour-133-b | acfc684b1ee85671de587774a35a8c366c0fc2a3 | 254 | green | spotlight targets (first exercise, Add food), pushPriming (61-62) logic, Home push card hides during the tour, re-offer line (65), radius tokens on Home slot / Settings row |
| #606 | agent133/tour-133-c | f6c3b6852e8ea823e699731d41da914711297e3e | 771 | green | overlay to 46-66 on src/ui PrimaryButton/TextLink/Headline, radius.card/sheet/chip, rounded SVG spotlight, notice, completion "Got it", priming card, landing Home, skip sheet |

- CI round 1: #606 typecheck failed (untyped jest mock, fixed e36bf650); #604/#605 failed copyVoice.guard ("we will look at logging" in the no-plan line, fixed 4210f399 on #604 and merged forward into #605/#606, no rebase). All green now.
- #603 lens round 1 (Sol C, Opus A): REQUEST CHANGES, both a single B: no parity table in the body. Fixed by a body edit (head unchanged); FIX ROUND 2 posted at f8f569f5. Also added the staging note (U-603-C-1: old near-square card until #606) to #603-#605.
- #604/#605/#606: FIX ROUND 1 (OPENING) READY posted at the heads above; no verdicts yet.
- Merge order 603 -> 604 -> 605 -> 606. merge_loop133.sh only merges base=main PRs, so a stacked PR can never merge into its parent branch. After each merge, retarget the next: `gh pr edit <n> --base main -R BradleyGleavePortfolio/growth-project-mobile` (head unchanged, verdicts stay valid).

## Scope traced
- The tour starts only after the consultation (TutorialHost.tsx:89-99, consultationOnboarding + GET /me/onboarding; or "Show me around" in ConsultationFlow/RevealScreens -> startClientTutorial). Consultation was unreachable (backend 73e71cd5, S-REVENUE-124, B-REV-1: needs a coach with an active ClinicProgramSet, 0 in production). clientTutorial was ON only in eas.json clinic/clinic-apk. CONSULT-ALL-M-133 (other lane) turns consultationOnboarding + clientTutorial on in every profile; this lane needs no eas.json change.
- The old tour: 090bbf9b (#309, C09), nine steps (eleven with Calendar).

## B list
- B33: tour never ran and was not the prototype. Fixed by #603-#606 (once CONSULT-ALL-M-133 makes it reachable).

## U list
- none.

## C one-liners
- Prototype TU3 gate is a row expand; ours is Continue (the one control). "Keep going" on the skip sheet is a TextLink (no outlined primitive). "Got it" is the forest PrimaryButton (prototype draws it ink) to keep one filled forest button per screen. Copy without contractions. Pending line says "It will appear on Train once it is ready" instead of "I'll let you know" (no unkept promise).

## Evidence
- Targeted jest per PR listed in each PR body (all green locally); targeted tsc and eslint on changed files clean.
- Render: TutorialOverlay.test renders the welcome at 360x800 and 390x844, card corner = radius.card.
- Not seen on a device.

## Not fixed (needs operator)
- Retarget #604/#605/#606 to main after each predecessor merges (or let this lane do it if still running).
- Device check after the build: run the tour on Android and iOS (consultation -> Show me around).

## Backups
- Final full change set: /home/user/workspace/ops/tour133/full/ (pre-split; version 2 there became 3 in the stack). PR bodies: /home/user/workspace/ops/tour133/pr/body{1..4}b.md.

## HANDOFF
- State: four PRs open, CI green, READY / FIX ROUND posted at every head: #603 @ f8f569f5 (FIX ROUND 2, body-only), #604 @ 4210f399, #605 @ acfc684b, #606 @ f6c3b685. Waiting only on lenses (19:01: #603 has both round-1 REQUEST CHANGES answered by FIX ROUND 2, no re-verdict yet; #604-#606 no verdicts yet). Owner safe stop 18:57: stopped; nothing half-done, nothing unpushed; worktree clean at #606's head.
- Needs operator (1): after #603 merges, retarget #604 to main; after #604, #605; after #605, #606 (`gh pr edit <n> --base main`). Heads do not change, so verdicts stay valid.
- Next agent first: read the newest verdicts on #603-#606 at the heads above; if #603 is re-approved and merged, retarget #604. If a lens asks for changes on PR k: check out its branch in /home/user/workspace/wt/TOUR-133-mobile, commit, push once, then `git merge` that branch into each later branch (never rebase) and push those once each; README conflicts are only in src/tutorial/README.md's notes list.
- Depends on CONSULT-ALL-M-133 (flags consultationOnboarding + clientTutorial on in every profile, consultation reachable) for clients to see the tour at all.
- Not seen on a device. Device check after the build: consultation -> Show me around, on Android and iOS, at both a coached and a coachless account.
