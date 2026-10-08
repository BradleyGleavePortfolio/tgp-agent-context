# DES-AP-127 — edit profile

## Scope traced
- Started 2026-10-07 13:51 PDT, agent 128. Worktree `/home/user/workspace/wt/DES-AP-127-mobile`, branch `agent128/des-ap-127`.
- Start condition verified: [mobile#470](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/470) merged at 13:44 PDT; main base `8e649d05`.
- Own only `src/screens/client/EditProfileScreen.tsx` and its tests. Current screen has eleven profile fields and Back/Save; no photo, name, unit selector or separate Cancel exists. Preserve all actual fields, options, navigation and persistence; Back is cancel, units remain pounds/cm.
- Module header will be updated in-place. Shared client README has no EditProfile entry; do not touch another screen's row or append documentation.

## B list
- B1: A client opening Edit profile is told a coach sees their data and that nothing leaves the app even when no coach is linked and the app uses backend/service providers. Replace that sentence with neutral instructional text.
- B2: A client selecting mobility sees “no caloric target” even though saving computes a maintenance calorie target. Replace with “Maintenance calorie target.”

## U list
- U1: Boxed cream fields, fixed palette, 32-point Back target and black all-caps primary violate the calm theme-led brief.
- U2: Current weight and height errors appear under target weight; move each error beside its own field, retaining existing 90–250 cm validation contract.
- U3: Save fallback is generic; name the failed profile operation and the recovery.
- U4: Recipe filtering promise is replaced with neutral restriction-entry guidance.
- U5: Saved fields remained blank because the user cache loads after mount and the form never adopted it. Added ordinary hydration synchronization, proven failing-first.

## C one-liners
- None.

## PRs
- [mobile#496](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/496) current head `4d657072daf64326413eedba46a0d6df3f5060c0`: 380 changed lines (246 source + 134 tests), two owned files. Targeted tests 12/12; doctrine 30/30; targeted ESLint pass. Failing-first logs saved under `ops/reports/DES-AP-127-*.log`.
- Opening head `f190436a31ccdfe932e58a45678bdb8194470e17` CI all green at 14:13 PDT. Latest main `9e6e6fc27be1fc2b09316304452e8ed4ea1e9928` merged without conflict at 14:13 PDT and pushed; exact-head CI pending.
- Post-main targeted tests 12/12 pass. Old/new two-file patch hashes are identical (`b3f89e72004dadeb5edb89de9113f16e26b940c7a63c23e2badb50563a02b9c3`). Working tree clean; no unresolved conflict or builder change outside the two owned files. Shared README changes arrived solely from main.
- Exact-head CI all SUCCESS at 14:23 PDT: Typecheck/lint/test, Analyze(actions), Analyze(javascript-typescript), CodeQL. GitHub reports MERGEABLE. [FIX ROUND 1 READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/496#issuecomment-6047140263) posted at 14:24 PDT.
- Verdicts: Opus pending / Sol pending; not awaited under OWNER 14:08 override. No PR merge/deploy/production write.

## Not fixed (needs operator)
- Entry lists photo/name/unit selector, but none exist in the assigned current screen; no unowned screen/API changes will be made. Recommended default: preserve the actual eleven-field screen.
- Shared `src/screens/client/README.md` has no own-screen entry. Recommended default: accept updated module documentation in this tightly scoped PR; operator may separately authorize an in-table EditProfile row.

## HANDOFF
- DONE at 14:24 PDT: [mobile#496](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/496) READY at exact head `4d657072daf64326413eedba46a0d6df3f5060c0`, 380 lines, all CI green, no conflict. Own code and tests only; main snapshot `9e6e6fc2` merged at 14:13 PDT. Other workers continue advancing main; strict-up-to-date protection is off and standing FIX lane owns future conflicts.
- Report, PR body, READY body and failing-first/green logs are in `ops/reports/DES-AP-127*`. Worktree `/home/user/workspace/wt/DES-AP-127-mobile`; branch `agent128/des-ap-127`; no uncommitted edits.
- Owner 14:08 override: builder finishes now, without waiting for verdicts and without a second job. Operator sends exact-head Opus/Sol lenses and decides the two scope/documentation notes above; recommended defaults are preserve the actual eleven-field screen and accept updated in-place module documentation.
