# LN-SOL-M-131 — assigned single review pass

Reviewer: GPT-6.1 Sol, agent 131.

## Proven blocker

**B-569-SOL-M-131-1 — seen in a test:** the new Recipes-sheet Fish answer reaches the backend, but `RecipesScreen.tsx:174-189` leaves the canonical user cache unchanged; an ordinary subsequent Edit Profile → add Soy → Save sends only `['Soy']`, silently removing Fish and its declared-allergen protection. ([Assigned mobile flow](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569), [Backend Fish filtering evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))

Smallest fix: replace that legacy `user_data` write with awaited `patchUserCache({ profile: { diet_restrictions: restrictions } })` after successful profile save, plus a composition regression exercising real cache hydration before adding a second allergy. ([Affected code](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569))

The read-only proof is saved as `/home/user/workspace/ops/reports/LN-SOL-M-131-m569-cache-proof.cjs`; it extracts and runs the actual READY-head Recipes handler, canonical cache, Edit Profile initializer/toggle and payload builder with synthetic in-memory storage/API dependencies. It passed through `ops/heavy.sh` and reproduced Fish disappearing from the next save payload, without any production interaction; its complete output is retained in `LN-SOL-M-131-m569-cache-proof-result.txt`. This is a function/cache composition proof, not a rendered-device end-to-end test.

## Scope traced

- Mobile #563 follow-up delta at `161fcbeb226a5cd39f501bacd3ff3d3b02ef341c`: the normal main merge's combined README resolution, status-based Shortcuts failure handling, existing backend fasting responses and all changed regression assertions. ([PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))
- Mobile #566 full diff at `6edd77e9a931828861942c9f822117383593f65b`: explicit Attach, optional preview, sharing notice/payload, user-cache patch, server entitlement re-read, Home query key/invalidation, failure handling, both retained actions, semantic styles and changed tests. ([PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566))
- Mobile #568 full diff at READY head `5109af023669ae4c5da258de51669ba1a5fde378`: literal flag loading, preview-only profile switch, per-platform pack gate/header, every priced pack surface, checkout preselect/custom focus, browser return/refetch, retained navigation, current backend controller/DTO/tier mapping and the purchase-policy hash lock. ([PR #568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568))
- Mobile #569 full diff at READY head `ec513fc994c8211256b3bdbbafcfd55eed1f68d9`: Sesame enum/summary, Fish sheet/profile chips, profile write/cache/hydration/payload composition and the existing backend restriction/allergen path. ([PR #569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569))
- Backend #881 full diff at READY head `fe17941dc6f5d1d29086b7a14a9cae7b2b00de03`: additive N2 validation, coach-view label, existing profile mapping and all changed declared-allergen tests. ([PR #881](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))
- #569 and #881 initially lacked READY at 10:14 PDT; their READY comments were found on the subsequent spaced checks, before the cutoff. ([Mobile READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065194853), [Backend READY](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881#issuecomment-6065253645))

## B list

- B-569-SOL-M-131-1 as above; the inherited handler now reached by the new Fish choice causes normal-use allergy data loss, not an edge case. ([PR #569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569))
- No B in the other four reviewed changes. ([PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563), [PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566), [PR #568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568), [PR #881](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))

## U list

None in the five reviewed changes. ([PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563), [PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566), [PR #568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568), [PR #569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569), [PR #881](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))

## C one-liners

None requiring action in the reviewed deltas. ([PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563), [PR #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566), [PR #568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568), [PR #569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569), [PR #881](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))

## PRs

| PR | Reviewed head | Changed lines | CI | Sol result |
|---|---|---:|---|---|
| [mobile #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563) | `161fcbeb226a5cd39f501bacd3ff3d3b02ef341c` | 170 | 4/4 green at final check | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065209521) |
| [mobile #566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566) | `6edd77e9a931828861942c9f822117383593f65b` | 340 | 4/4 green at final check | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566#issuecomment-6065245692) |
| [mobile #568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568) | `5109af023669ae4c5da258de51669ba1a5fde378` | 491 | 4/4 green at final check | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568#issuecomment-6065299277) |
| [mobile #569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569) | `ec513fc994c8211256b3bdbbafcfd55eed1f68d9` | 49 | 4/4 green at final check | [REQUEST CHANGES posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065360693) |
| [backend #881](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881) | `fe17941dc6f5d1d29086b7a14a9cae7b2b00de03` | 32 | 15 passing checks; one conditional skip at final check | [APPROVE posted](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881#issuecomment-6065363824) |

Each GitHub head matched its review target on the final pre-post check; no head moved and no assigned PR was skipped. ([#563 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065209521), [#566 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566#issuecomment-6065245692), [#568 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568#issuecomment-6065299277), [#569 verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065360693), [#881 verdict](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881#issuecomment-6065363824))

## Evidence and limitations

Read-only review; one isolated synthetic composition proof run through `ops/heavy.sh`, no local backend tests or repository-wide checks, no worktree created, and no repository code changes, merges, deployments, production writes or purchase attempts.

Process caveat: the initial unfiltered GitHub metadata response for #566 included its existing Opus verdict before this lens posted. The Sol assessment above was derived directly from the full diff, changed tests and supporting runtime code rather than adopting that verdict; the operator should decide whether that accidental exposure affects the independence requirement. ([PR #566 comments](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566))

## Not fixed (needs operator)

- Keep #569 open for B-569-SOL-M-131-1 in the next round; R8 prohibits a fix round in this review batch. ([PR #569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569))
- #569's original deployment prerequisite was backend #880; the operator's fleet record now reports deploy 39 at `f545c7c1` completed successfully with healthy health/readiness checks, but that does not resolve the independent cache/data-loss blocker. ([Deployment run recorded by the operator](https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37814339018), [Mobile prerequisite](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065194853))
- Keep the Android external-pack switch confined to preview; enabling it in a store profile requires a separate owner decision. ([PR #568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568))
- The later mobile consultation Fish option and its summary word must wait until #881 is deployed; that option is intentionally absent from #569 and no new work was started. ([Backend follow-up](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))
- Decide whether to accept the independently code-derived #566 Sol assessment despite the initial comment-response exposure; default: record the caveat rather than run an unauthorized second pass.

## HANDOFF

Complete: all five assigned PRs reviewed once, final heads re-checked, and all five signed Sol verdicts posted; four APPROVE and one REQUEST CHANGES, B=1 / U=0. ([#563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065209521), [#566](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566#issuecomment-6065245692), [#568](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/568#issuecomment-6065299277), [#569](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065360693), [#881](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881#issuecomment-6065363824))

Operator actions/defaults:

1. Leave #569 open; route the canonical-cache fix and composition regression to an Opus builder in the next round, not this batch. The exact blocker, minimal change and reproducible proof are above. ([Blocking verdict](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/569#issuecomment-6065360693))
2. Preserve the backend-first order for the future consultation Fish option; #881's approval is not deployment evidence. Default: add that mobile option/summary only after the operator deploys #881, as its builder's brief requires. ([Backend scope and dependency](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/881))
3. Decide how to record the #566 comment-exposure caveat. Default: keep the independently code-derived assessment with the disclosure; this lens will not perform an unauthorized second pass.

Keep Android store-profile links off unless separately authorized. No repository fixes, merges, deployments or production changes were performed.

Saved artifacts: this report, all five `LN-SOL-M-131-{m563,m566,m568,m569,b881}-verdict.txt` comment payloads, the cache proof `.cjs`, its result `.txt`, and `/home/user/workspace/ops/lanes131/notify/LN-SOL-M-131.txt`.
