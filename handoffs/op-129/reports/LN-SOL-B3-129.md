# LN-SOL-B3-129 — standing Sol review lane

## B list

### B-513-SOL-129-1 — false condition on credit-spending refreshes

A coach archives an existing template without adding anything, and Roman can still spend credits on a refresh although the tutorial promises refreshes run “only when something new was added.” ([tutorial at reviewed head](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/79e0760d90c7a3cebee3728d4c7e94113498f8d7/src/components/coach/ai-budget/AIBudgetTutorialModal.tsx#L81-L98), [archive exclusion](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3324d4a24a9b211199b994b312ffc6b44b964a8/src/roman/playbook/playbook-sources.ts#L152-L185), [digest gate and paid refresh](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3324d4a24a9b211199b994b312ffc6b44b964a8/src/roman/playbook/playbook-builder.service.ts#L149-L197))

- Smallest fix: remove the unsupported “only when something new was added” qualifier, or say refreshes check for changes in the source material; retain the credit-spending disclosure.
- Proof: archive removes an ID from the sorted source ledger; its digest changes, so `buildFor` does not return `unchanged` and follows the same paid refresh path. ([source collector](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3324d4a24a9b211199b994b312ffc6b44b964a8/src/roman/playbook/playbook-sources.ts#L152-L185), [builder](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/c3324d4a24a9b211199b994b312ffc6b44b964a8/src/roman/playbook/playbook-builder.service.ts#L149-L197))

## Scope traced

- Agent 129 overrides and the full common brief read; only LN-SOL-128 job entry read.
- Source-of-truth A1, A2 owner overrides 1–11, A6, and operator 128 handoff section 9 read.
- Standing review deadline: 22:45 PDT on 2026-10-07.
- Work discovery: local board only, bottom-up with T4/T3 and blocker fixes prioritized.
- Every claim and verdict will be bound to the exact GitHub head. Other-lens review bodies will not be read before an independent verdict.

## U list

### U-526-SOL-129-1 — unknown water shown as zero after a partial day-read failure

A client selects another day whose food read succeeds but water read fails, and the water tracker shows 0 oz although that day's water is unknown. ([store sets loaded with reset water](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/61bf609ce531fcec11c55876d806a402b32b8768/src/store/clientStore.ts#L142-L160), [tracker render gate](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/61bf609ce531fcec11c55876d806a402b32b8768/src/screens/client/LogScreen.tsx#L570-L598))

Nonblocking U: the explicit water-read failure notice is present and food logging stays reachable; recommended follow-up is to withhold the numeric water tracker until water is confirmed, while retaining same-day verified water on refresh failure. ([error/render paths](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/61bf609ce531fcec11c55876d806a402b32b8768/src/screens/client/LogScreen.tsx#L570-L598), [water preservation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/61bf609ce531fcec11c55876d806a402b32b8768/src/store/clientStore.ts#L142-L160))

## C one-liners

- C (edge, deferred to 10k clients): #514 ambiguous lost-response failure copy remains unchanged; not investigated or probed. ([bounded fix scope](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/514#issuecomment-6048970961))

## PRs

- Mobile #513: exact head `79e0760d90c7a3cebee3728d4c7e94113498f8d7`; 33 changed lines; four CI checks SUCCESS; Sol REQUEST CHANGES posted with B=1 at 16:11 PDT. ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6048663197), [verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6048719105))
- Mobile #494: exact head `7109690f2ca2c8ac3f816381cdfd4ad2bbf1e102`; 533 changed lines; four CI checks SUCCESS; Sol APPROVE posted at 16:32 PDT, B=0 U=0 in the fix delta. ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494#issuecomment-6048937049), [verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494#issuecomment-6048972610), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37700488528/job/113062491455))
- #494 proof: inherited allergy copy now explicitly disclaims recipe filtering and instructs checking ingredients; independent automatic merge-tree and committed tree both equal `eefae9dab170c6fd749d10bf9152997a53fb9003`. ([integrated wording](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/7109690f2ca2c8ac3f816381cdfd4ad2bbf1e102/src/components/AllergySafetyPrompt.tsx#L109-L114), [merge commit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/7109690f2ca2c8ac3f816381cdfd4ad2bbf1e102))
- Mobile #514: exact head `7691dc6096b198c5ecdfbf64af492a55823f0fcd`; 189 changed lines; four CI checks SUCCESS; Sol APPROVE posted at 16:36 PDT, B=0 U=0 in the fix delta. Previous B1 (unknown source denied a plan) and U1 (week arrows did nothing) are closed at `PrepGuideScreen.tsx:95,98,219`. ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/514#issuecomment-6048977560), [verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/514#issuecomment-6049013999), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701841460/job/113066873116))
- Mobile #526: claim made before operator STOP at head `61bf609ce531fcec11c55876d806a402b32b8768`, branch `agent129/cf-food-load-128`, 460 changed lines; READY reports green CI; diff saved, but review is incomplete and no Sol verdict was posted. ([READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/526#issuecomment-6048990078))

## Not fixed (needs operator)

- #513 remains held under operator instruction because the coach playbook stays off tonight; its recorded B does not request a flag or backend change.
- Optional small follow-up: U-526-SOL-129-1, unknown-water presentation after a partial first read; not a merge blocker.

## HANDOFF

- RESUMED by operator agent 129; only Sol lens in the five-agent fleet, standing until 22:45 PDT unless STOP arrives. No branch created or commits to push.
- Current branch/claim: `agent129/cf-food-load-128`, mobile #526, exact head `61bf609ce531fcec11c55876d806a402b32b8768`; live head and four green CI checks confirmed, source/state/parity review complete, B=0 and one nonblocking U; verdict awaits final head check. ([claim](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/526#issuecomment-6049022035), [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37702217053/job/113068104572))
- Done: Sol REQUEST CHANGES #513 at `79e0760d90c7a3cebee3728d4c7e94113498f8d7`; APPROVE #494 at `7109690f2ca2c8ac3f816381cdfd4ad2bbf1e102` and #514 at `7691dc6096b198c5ecdfbf64af492a55823f0fcd`, all after exact-head checks. ([#513 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/513#issuecomment-6048719105), [#494 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/494#issuecomment-6048972610), [#514 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/514#issuecomment-6049013999))
- Next: follow operator's explicit mobile-then-backend review order, using READY exact heads; direct GitHub discovery only if board is over ten minutes stale, no faster than three-minute polling. Hold #513 tonight under operator instruction; playbook stays off.
- Evidence and helpers: `ops/review-evidence/LN-SOL-B3-129/`; no watcher currently running, no stash/tests/production writes started.
