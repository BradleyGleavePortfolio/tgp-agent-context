AUDIT GPT-6.1 Sol — growth-project-mobile#329 @ 4071d0ce40d2c451addf1540654c2b16e5f66395 — VERDICT: BLOCK

Third independent lens, AUD-SOL-5 / operator 112. **Open A/B/C: 1/4/4**, including the inherited findings below; **two additional B findings** in this comment.

### Inherited dispositions, not duplicate findings

A-329-1, B-329-1, and B-329-2 remain open at this candidate head; C-329-1 through C-329-4 remain optional. Use [the existing Opus exact-head audit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/329#issuecomment-5960028238) for the original finding text and closure requirements, including the missing coach Money surface; a separate unmerged follow-up is not evidence that this candidate contains it.

### Additional findings

**B-329-3 — Wizard save/resume has a real backend wire-shape mismatch.** `src/api/coachSetupApi.ts:239-247` wraps the step in `{data}`, but backend `src/coach/coach-onboarding.controller.ts:48-62` passes the entire request body as `input.data`, and `coach-onboarding.service.ts:187-203` stores it verbatim under `step_data[step]`; mobile `src/navigation/CoachWizardNavigator.tsx:617-626` resumes by reading flat `practice_name` and `focus`. ([Mobile request](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/api/coachSetupApi.ts#L239-L247), [backend request contract](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach/coach-onboarding.controller.ts#L48-L62), [backend persistence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach/coach-onboarding.service.ts#L187-L203), [resume consumer](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/navigation/CoachWizardNavigator.tsx#L617-L626))

The independent round-trip fixture, using the actual mobile API and a backend-contract-faithful persistence mock, returns `stepData["1"] = {data: {practice_name: "North", focus: ["Strength"]}}`, so the candidate resume code loses the saved practice name/focus and package prefill after reopening. **Minimal fix:** send the flat per-step blob required by the backend, accept any already-saved nested legacy blob on resume, and add honest backend-shape round-trip/resume tests rather than reinforcing the wrapper in the current mock assertion. ([Consumer](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/navigation/CoachWizardNavigator.tsx#L617-L626), [current mocked test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/components/coach/setup/__tests__/coachSetup.test.tsx#L140-L170))

**B-329-4 — An active Connect account with outstanding requirements has no remediation action.** `src/lib/coachSetup/connectCopy.ts:100-108` always hides due requirements and returns `action: null` for `active`; `GetPaidPanel` renders the action from that copy, so an account that can currently charge/pay out but has `action_required`, `currently_due`, or an upcoming deadline offers no Update details action. ([Copy mapping](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/lib/coachSetup/connectCopy.ts#L64-L117), [action rendering](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/components/coach/setup/GetPaidPanel.tsx#L145-L171), [backend Connect state/requirements implementation](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-connect/coach-connect.service.ts))

An independent test against `toConnectView` plus `connectCopy` supplies enabled charges/payouts and a bank-account requirement, but gets `due: []`, `action: null`, and done copy. **Minimal fix:** keep the truthful active capability state while separately surfacing due items/deadline and “Update details with Stripe” whenever action is required; test active/currently-due and active/past-due combinations so the coach can act before capability loss. ([Affected mapping](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/4071d0ce40d2c451addf1540654c2b16e5f66395/src/lib/coachSetup/connectCopy.ts#L64-L117))

### Verification

All three required mobile checks are green at this exact head, but these do not close the product blocker or the two additional regressions. ([Exact audited head](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/4071d0ce40d2c451addf1540654c2b16e5f66395))

Local commands through `/home/user/workspace/ops/heavy.sh`:

- `npx jest --runInBand --forceExit src/components/coach/setup/__tests__/coachSetup.test.tsx` — **1 suite / 17 tests passed**.
- `npx jest --config /home/user/workspace/ops/evidence/AUD-SOL-5-112/jest329.config.cjs --runInBand --forceExit` — **2 independent assertions failed as expected**, reproducing the additional findings above.

Evidence: `329-targeted.log`, `329-independent-probes-r2.log`, `aud-sol5-setup.test.ts`, and config under `ops/evidence/AUD-SOL-5-112/`. Keep mobile build/release gates from the common brief; no code pushed, merge, dispatch, or production action.
