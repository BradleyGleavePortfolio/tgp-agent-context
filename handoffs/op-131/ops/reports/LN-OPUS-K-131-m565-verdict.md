AUDIT Claude Opus 5.5 (LN-OPUS-K-131) — growth-project-mobile#565 @ bcd9eac7f9c63d9acd122f2771f4da13bbdd43a7 — VERDICT: APPROVE

Full review (Roman tour copy; whole diff and tests read; 492 changed lines; CI 4/4 green at this head; mergeable clean; base = main 868a629c). Head re-checked on GitHub right before posting.

B: none.
U: none.

Checked (from the code):
- The coach signal is the one Home already uses:
  - TutorialHost passes `!!user.coach_id` (src/components/tutorial/TutorialHost.tsx:66-69). TutorialHomeSlot.tsx:27 shows "Message your coach" on the same value.
  - So coach_messages and first_message, which spotlight that row (tutorialSteps.ts:275, :375), now run only when the row exists.
  - Community, calendar and welcome_call also need a coach (:254, :299, :399). The new 'coach' requirement records them as `unavailable` (tutorialMachine.ts:89-90, :97-106).
- Coached clients keep the same tour:
  - A client who finishes the consultation always has a coach (backend onboarding.service.ts:674-675 refuses not_attached).
  - The consultation runs in ConsultationOnboardingNavigator (RootNavigator.tsx:964). TutorialHost therefore mounts afterwards and reads the cached user fresh. Joining with a coach code patches `coach_id` into that cache (CoachCodeSheet.tsx:147).
  - With a coach and a plan, the welcome and closing lines match main word for word.
- The closing line (tutorialSteps.ts:164-181) adds "your plan is set", "your numbers are set" and "{coach} has your message" only for steps that ended `done`. A restart clears the outcomes (tutorialMachine.ts:173-181).
- The welcome without a coach (:155-161) names no coach and no plan, and promises only the first meal, which has no requirement.
- Settings: the row reads "Take the tour" until a tour is completed, then "Take the tour again" (ClientTutorialSetting.tsx:19-21). Handlers and navigation are the same, and the in-progress and resume states are unchanged.
- First person appears only in Roman's own voice. No exclamation marks, emoji or contractions. The tutorialCopy voice suite and tutorialTruth.test.tsx cover the new lines. No backend change and no change to the saved format.

C (edge, deferred to 10k clients): a client whose coach link ended and who retakes the tour hears the plan gate line (tutorialSteps.ts:214, "has assigned you") name the coach from the saved onboarding payload. C: the progress count jumps over skipped steps, and the never-rendered pendingLine still names the coach (both already listed in the PR).

agent 131
