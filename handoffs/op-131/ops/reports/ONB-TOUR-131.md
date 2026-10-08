# ONB-TOUR-131 (Claude Opus 5.5, builder, T2 Roman copy) — operator agent 131, round 2026-10-08 09:10 PDT

Job: JOBS131 "ROUND 2026-10-08 09:10" row ONB-TOUR-131 = FW-ONB-128 B2 (lines 44-57) + ONB-TOUR-128 row (:139).
Worktree: /home/user/workspace/wt/ONB-TOUR-131-mobile, branch agent131/onb-tour-131 (from mobile main 868a629c).

## PR
- growth-project-mobile#565 https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/565
- head bcd9eac7f9c63d9acd122f2771f4da13bbdd43a7 (one commit, Bradley Gleave author and committer, no AI co-author line)
- 14 files, +452 / -40 = 492 changed lines. Body: ops/reports/ONB-TOUR-131-pr-body.md
- CI at bcd9eac7: Typecheck, lint, test SUCCESS (run 37809579122, job 113422628694); CodeQL, Analyze (actions), Analyze (javascript-typescript) SUCCESS. mergeable = MERGEABLE (no conflict with main 868a629c).
- READY posted 09:39 PDT: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/565#issuecomment-6064589502 (first line verified exact)
- Verdicts: none yet (lenses are launched by the operator).

## Scope traced (refs re-checked on main 868a629c)
- src/tutorial/tutorialSteps.ts:157 Welcome "I work with ${coachName}"; :97 StepRequirement had no 'coach'; :229-247 coach_messages, :327-345 first_message, :349-367 welcome_call (calendar only); :377 Complete line unconditional.
- src/tutorial/tutorialStore.ts:104 coachName falls back to "your coach"; the env had no coach signal.
- src/screens/client/settings/ClientTutorialSetting.tsx:17 "Take the tour again" for every non-paused, non-active status (including not_started).
- Also found, same B (coachless path): community (:207-227) and calendar (:249-270) lines name the coach ("where the people training with your coach talk", "your coach's open times"); community spaces are per coach workspace (backend community-wins.policy.ts:11-16, "no cross-tenant public feed") and open times are the coach's, so both now need the coach too.
- The welcome's "then you will try two things yourself" is false once first_message is skipped; the coachless welcome says "log your first meal yourself".
- The coach signal is `user.coach_id` (same as TutorialHomeSlot.tsx:27, CommunityTabScreen.tsx:47). Backend onboarding complete refuses a client without coach_id (onboarding.service.ts:674-675), so consultation clients always have it. The saved onboarding payload's coach is NOT used as the link (stale after an unlink).

## Fix (what the PR does)
- types.ts: TutorialContext.coachLinked?: boolean (absent = no coach); 'unavailable' doc covers "no coach linked".
- tutorialSteps.ts: StepRequirement adds 'coach'; `requires` may be a list; `stepRequirements()`; community ['community','coach'], coach_messages 'coach', calendar ['calendar','coach'], first_message 'coach', welcome_call ['calendar','coach']; welcomeLine (coachless variant; "your training" when no plan); completeLine built from outcomes (plan done / macros done / first_message done); CopyContext gains coachLinked and outcomes.
- tutorialMachine.ts: requirementOutcome walks every requirement; 'coach' -> 'unavailable' when not linked.
- tutorialStore.ts: store field coachLinked; hydrateTutorial(userId, firstName, coachLinked = false) (also updates it for the same user); envOf and buildCopyContext carry it (+ outcomes).
- TutorialHost.tsx: passes `!!user?.coach_id` to hydrateTutorial (effect deps include it).
- ClientTutorialSetting.tsx: "Take the tour" until status === 'completed', then "Take the tour again".
- READMEs: src/tutorial/README.md (steps marked "coach linked", "Truthful tour" section, tests line); src/screens/client/settings/README.md ClientTutorialSetting paragraph.
- Tests: new src/tutorial/__tests__/tutorialTruth.test.tsx (14). Existing tests that walk coach steps now pass a linked coach: tutorialMachine baseEnv, tutorialCalendarFlag env, tutorialStore (2 hydrate calls), TutorialOverlay begin(); tutorialCopy CTX gets coachLinked + outcomes and uses stepRequirements() for the calendar filters.
- Note: the test is .tsx, not the .ts named in the entry: it renders TutorialHost and the Settings row with JSX (React.createElement with a children prop fails ESLint react/no-children-prop, and without it tsc rejects the required children).

## Evidence (local, heavy.sh, one file at a time)
- tutorialTruth.test.tsx 14/14 on the branch.
- Failing-first: main 868a629c's six source files + this test = 12/14 fail. The 2 that pass are the unchanged coached cases (community shown with a coach; full closing line when all done). Source restored from HEAD afterwards (git checkout HEAD -- files; tree clean).
- tutorialCopy 33/33, tutorialMachine 21/21, tutorialCalendarFlag 5/5, tutorialStore 13/13, TutorialOverlay 9/9.
- ESLint on the 12 changed .ts/.tsx files: clean.

## B list
- B2 (FW-ONB-128): coachless client told "I work with your coach", led through coach-only steps, told "your coach has your message". Fixed in #565.

## U list
- U: Settings says "Take the tour again" to a client who never took it. Fixed in #565.
- U: coached client without a plan told "get the most from your plan". Fixed in #565 ("your training").

## C one-liners
- C (edge, deferred to 10k clients): a client paused on a coach step's later gate before this change stays there after resume.
- C (edge): the progress count jumps over skipped steps (already true for pending/unavailable steps).
- C: `pendingLine` copy (plan, macros) names the coach but is never rendered by TutorialOverlay (dead copy).

## Proposed (needs operator)
1. src/components/tutorial/TutorialSettingsRow.tsx:25-30 still says "Take the tour again" for not_started, but nothing renders it (only ClientTutorialSetting is mounted, SettingsScreen.tsx:550). Default: leave it; delete it in a later cleanup PR (it is listed in src/components/README.md:74).
2. src/tutorial/tutorialSteps.ts plan/macros `pendingLine` (dead copy naming the coach). Default: remove in the same cleanup, or wire it only with a coach-aware variant.

## HANDOFF
- State: growth-project-mobile#565 open, head bcd9eac7f9c63d9acd122f2771f4da13bbdd43a7, CI green (all four checks), MERGEABLE, READY posted 09:39 PDT. One round only (R7): this builder is done and has not waited for verdicts. Nothing merged or deployed, no flags changed.
- Lenses: review #565 at bcd9eac7. Check (a) the coachless walk in tutorialTruth.test.tsx (outcomes: community, coach_messages, calendar, first_message, welcome_call are 'unavailable'); (b) that coachLinked = `!!user.coach_id` is passed from TutorialHost.tsx:66-69; (c) the closing-line clauses in tutorialSteps.ts completeLine; (d) ClientTutorialSetting.tsx:19-21.
- If a lens asks for changes (R8: no fix round in this batch), a fixer works in a worktree on branch agent131/onb-tour-131. Re-run only tutorialTruth.test.tsx plus the changed suite. The test is .tsx on purpose (see Fix above).
- Merge order: no shared files with the other five builders' PRs this round, except possibly src/screens/client/settings/README.md (this PR edits only the ClientTutorialSetting paragraph, line 17).
- Files of this PR: src/tutorial/{tutorialSteps,tutorialMachine,tutorialStore,types}.ts, src/components/tutorial/TutorialHost.tsx, src/screens/client/settings/ClientTutorialSetting.tsx, src/tutorial/README.md, src/screens/client/settings/README.md, src/tutorial/__tests__/{tutorialTruth.test.tsx (new), tutorialCopy, tutorialMachine, tutorialCalendarFlag, tutorialStore}.ts(x), src/components/tutorial/__tests__/TutorialOverlay.test.tsx.
- Needs operator: 0 blocking. 2 optional cleanups are listed under Proposed (both default to a later cleanup PR).
