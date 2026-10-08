Tier: T3 (T2 lean input/copy slice; T3 post-auth onboarding routing slice)
Why: Make lean answers truthful and prevent an already-onboarded client from being sent through another setup flow.
T4 trigger scan: None. Existing profile fields/finalizer only; no token, server-role, invite redemption, tenancy, sharing consent, money, backend or production-setting changes.
T3 trigger scan: Removal of the post-auth Day-1 onboarding route, explicitly requested by the owner default in CF-ONB-LEAN-128.
Bounded T1: NO — coordinated state/input and post-auth routing behavior, not mechanical UI copy only.
Canonical builder: GPT-6.1 Sol, assigned CLIENTFIX-128 row.
Parent owner: operator agent 129.
Acceptance evidence: Failing-first render/interaction and real RootNavigator regressions; 115 targeted tests passed through ops/heavy.sh, one file at a time; full CI required at the final head.
Promotion triggers: Any required auth/role, invite-attachment, sharing-consent, backend schema or financial invariant change returns to the operator.

## What changes for coaches/clients

Clients may provide sex alongside optional measurements so the existing finalizer can estimate daily targets when all required inputs are present. The birth-year wheel no longer saves the displayed default, and old unconfirmed drafts do not count as a choice. Six-step labels, neutral instructions and sentence-case controls replace misleading progress/copy.

Finished lean/consultation onboarding never starts another Day-1 setup flow, even while lean profile sync is pending or a legacy checkpoint remains. The separate, skippable first-win action remains. The retained legacy Day-1 stack no longer presents a check-in-time step that schedules nothing.

## B / U list

- B: none in this assigned slice; the audit's resend/tour Bs belong to other jobs.
- U1: optional Q4 sex feeds the existing target calculator.
- U2: only an explicitly chosen birth year is saved/restored.
- U3/U4/U12: remove unwired Home/title promises; consistent Step n of 6 labels; no first-person CTAs/arrow glyphs; Q1 skip points to Profile > Edit profile.
- U5 / owner D1: no duplicate Day-1 onboarding after completion.
- U6 / owner D3: remove the ineffective check-in-time step; notification grant/deny/skip all advance to Ready.
- **Not fixed here — owner D2/U7:** asking a coachless client for a code once requires the auth-screen owner. #502/#504/#518 and ClientNavigator.tsx (#521) were explicitly excluded. This PR does not bypass server role selection, policy, notices, invite retries or sharing consent. Recommended default: the #502 auth owner auto-continues ordinary codeless client signup only, retaining those guarded cases.

## Minimal diff / ownership

Based on main, not another open PR. Before edits, fetched origin and listed the file diffs of every open mobile branch on ops/board/board.md. Auth screens, services/api.ts, ClientNavigator.tsx, dependencies and lockfiles are untouched.

The only necessary shared-file edit is two CheckInTime -> Ready expectations in quietLuxuryDoctrine.test.ts; #522's Profile assertions are untouched. Copy/data first, no full Lean redesign or unrelated polish. Matching onboarding/navigation/root READMEs are updated.

## Routes/actions before -> after

| Surface / control | Before | After |
| --- | --- | --- |
| Q1 goal choices | Save primaryGoal -> Q2; existing coach-sharing acceptance | Same effects, sentence-case labels |
| Q1 Skip / confirmation Back / Skip anyway | Dismiss confirmation or finalize -> authEvents | Same effects; correct later-edit destination |
| Q2 experience choices / Skip / Back | Save fitnessLevel -> Q3 / finalize / goBack | Same |
| Q3 intent choices / Skip / Back | Save intent -> Q4 / finalize / goBack | Same; Track meals label, no fabricated Home/title promise |
| Q4 imperial/metric, height/current weight | Existing optional values and conversion | Same |
| Q4 Female / Male | Not available | Optional, unselected sex input for existing target calculation |
| Q4 Save / Skip / Back | Save available answers -> Q5 / goBack | Same; optional sex included if chosen |
| Q5 birth-year wheel / target weight / lbs/kg | Save DOB even if untouched; weight conversion | Same explicit-choice/weight pathways; no untouched/default DOB |
| Q5 Save / Skip / Back | Q6 / goBack | Same |
| Q6 dietary chips / None | Persist restrictions; None clears selection | Same |
| Q6 Continue / Skip / Back | Finalize, completion flags, authEvents / goBack | Same |
| Root after lean completion | Could open six more setup screens | First-win/app path directly; second onboarding removed by owner D1 |
| Root after consultation | App | Same |
| Legacy Day-1 notification enable / denial Continue / Skip | CheckInTime | Ready, with permission/outcome handlers retained |
| Legacy Day-1 check-in-time form | Device-only time; no scheduled reminder | Removed from stack by owner D3 and dead-control rule 2 |
| Legacy Day-1 Ready finish / retry / offline | Existing completion handlers | Same; truthful step 5 of 5 |

Parity tests press the Lean answer/Back/skip/unit/diet controls and finalizer; the existing Day-1 render tests cover notification outcomes and Ready handlers. Auth entry points and all six client tabs are unchanged.

## Truthful sweep

- No invented completion duration, birth date, tailored Home, title, coach, program or reminder promise.
- All six Lean screens use semantic theme tokens; no new fixed palette or hex literals.
- Every original Lean navigation/finalize/sharing handler remains; only the owner-requested second setup/dead check-in step is removed.
- No device run or production sign-in claimed; validation is code, targeted tests and CI.

## Failing-first / acceptance

Before implementation, with only regression tests changed on main:
- leanHonest.test.tsx: 20 failed / 4 passed, including missing sex, invented DOB with/without an old draft, and six-step/copy regressions.
- rootNavigatorConsultationAvailable.test.tsx: 2 failed / 6 passed; real RootNavigator mounted the extra Day-1 stack after local completion / a legacy checkpoint.

After implementation, targeted files passed: leanHonest (24), RootNavigator consultation availability (8), LeanQ1 coach sharing (2), Day-1 structural flow (23), Day-1 render/actions (28), quiet-luxury doctrine (30): **115 passing tests**. Each file ran separately through ops/heavy.sh. No full local typecheck/lint/suite.

agent 129
