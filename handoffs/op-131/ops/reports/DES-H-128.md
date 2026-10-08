# DES-H-128 — Health with Starter goals

## Scope traced
- Assigned mobile-only T2 visual/behaviour change; no backend, permission, deployment or production writes.
- Read common brief, own job, owner rules A1/A2 overrides/A6, base DES-H-127 and design acceptance sections.
- Working tree: `/home/user/workspace/wt/DES-H-128-mobile`, branch `agent128/des-h-128`, base `d0875d26650932c079c0d7c055b1d3bf69864293`.
- Traced HealthFitnessScreen, empty state, current hero, all four metric cards, samples schema and current target/editor search.
- Current samples API contains no activity target fields; no activity goal editor or persistent coach/client activity targets found. Use Starter goals now, with an explicit typed target input for real targets when supplied by a host. Do not invent a route or API.

## B list
- B1: A client opens Health with older samples and sees invented targets and steps labelled Stand without sample dates, implying current activity incorrectly. Fix: dated real values, correct names, explicit owner-approved Starter goals; cached-error copy no longer calls the request-window end a last-sync time.
- B2 (Sol B1; inherited unchanged, needs FIX lane): A client with existing synced samples is told “No sample yet” while the initial query is still loading. [Sol requested changes at prior head](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483#issuecomment-6046664855); Opus classified this as C. Recommended default: neutral loading metadata, reserve absence copy for completed-empty responses. No builder fix after the owner stop-at-READY override.

## U list
- U1: Replace visually competing rings with three monochrome QuietBar rows; preserve detail taps, retry/refresh, connect and coach read-only behavior.

## C one-liners
- Loading-copy classification is disputed between the prior-head lenses; see B2 for operator/FIX-lane disposition.
- C (edge, deferred to 10k clients): Raw evening sample dates use UTC; no timezone hardening.
- C: Legacy ThreeRingHero module is unused; later cleanup, no shipped references.

## PRs
- Completed implementation is now 384 changed lines (239 additions / 145 deletions), including tests and README. Shared deps became READY at 13:31 PDT; no local install or full-project check.
- [Mobile PR #483](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483), draft opening tests-only head `ee64c3aa7522ea3231d90313c783b8e5c6728567` (14 changed lines), [failing-first CI proof](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680783157) complete at 13:22 PDT: exactly 3 expected empty-state assertion failures; 678 suites / 8,913 other tests passed. Guards/lint/typecheck and CodeQL green.
- Complete head pushed: `4a94564e5eaf4664fc0b98edab29cd814d2b9a04`. [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681611184) failed typecheck at 13:30 PDT because RNTL 14 removed UNSAFE_getByType from its render result; replaced the test query with an explicit RefreshControl test ID. Guards/lint passed; tests were skipped.
- Targeted tests passed locally through heavy.sh: HealthFitnessScreen.rhr 11/11, HealthFitnessEmptyState 4/4, quietLuxuryDoctrine 10/10; detached main proof independently reproduced exactly 3 expected failures. Native RefreshControl's Jest mock omits view props, so the final parity assertion uses the existing ScrollView-parent handler pattern, not a new test ID.
- Fetched latest main after operator's 13:34 message: merged changes do not overlap any of this PR's seven touched files; no main merge needed.
- Current exact head `994daf822f5431f14067d1efb43f15cde489bdc0`, 384 changed lines (239 additions / 145 deletions). [CI green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37683908910): 683 suites / 8,977 tests / 5 snapshots; guards/lint/typecheck and [CodeQL green](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37683909008).
- Marked PR ready and posted [FIX ROUND 1 opening](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483#issuecomment-6046575188) at 13:48 PDT.
- [Opus APPROVE](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483#issuecomment-6046640026) at `994daf822f5431f14067d1efb43f15cde489bdc0`; no Bs. Sol still pending as of 13:54 PDT.
- Operator's new 13:51 README/main-refresh rule arrived after READY: move the new Health entry under Key files in alphabetical A→H→Logging position, then merge current main before the next READY comment. No product-code change; preserve C deferrals.
- README relocated and current main merged without conflict. Refreshed head `98358a9cf79f2922c12de7a095ed5026d4bae42a` pushed at 13:58 PDT; 384 changed lines unchanged. Local post-merge checks passed: 11 Health/parity tests, 4 empty-state tests and the expanded quietLuxuryDoctrine/truthful-copy file. Current-head CI and both lens verdicts pending; old Opus verdict is historical.
- Main merged: `8e649d058bf5bb789a995799400bbce6ada83048`. At 14:01 PDT GitHub confirms MERGEABLE (no conflicts); [refreshed CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37686066754) and [CodeQL](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37686066491) queued. Round 2 READY will follow green checks.
- FINAL CURRENT STATE at 14:12 PDT: exact head `98358a9cf79f2922c12de7a095ed5026d4bae42a`, 384 changed lines (239 additions / 145 deletions), all four checks SUCCESS, GitHub MERGEABLE. [Round 2 READY posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483#issuecomment-6046955003).
- Current-head verdicts pending/pending. Prior head `994daf82` has [Opus APPROVE](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483#issuecomment-6046640026) and [Sol REQUEST CHANGES](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/483#issuecomment-6046664855) for the inherited loading-copy issue. Neither is an exact-current-head verdict.

## Not fixed (needs operator)
- `src/screens/client/wearables/HealthFitnessScreen.tsx:180` / `cards/ActivityBars.tsx:34`: route the prior Sol loading-copy finding to the standing FIX lane. Smallest fix: pass a loading flag (or a loading-only skeleton), render neutral “Loading samples…” metadata, and change the loading test to reject “No sample yet”; completed-empty behavior stays. Recommended default: take the small truthful-copy fix rather than debate classification.
- Absence of activity-target persistence/editor is outside this bounded job, not a customer-visible button.

## HANDOFF
- FINISHED per owner 14:08 stop-at-READY override. No waiting for verdicts and no second job; DES-AZ was withdrawn before any work or branch creation.
- Open PR #483: `98358a9cf79f2922c12de7a095ed5026d4bae42a`; current-head CI/CodeQL green, MERGEABLE, round 2 READY posted, 384 lines. Working tree clean at `/home/user/workspace/wt/DES-H-128-mobile`, branch `agent128/des-h-128`.
- Operator/lenses/FIX lane own what follows. Resolve inherited Sol loading-copy B2 as above; then exact-head dual approval is required before the operator merges. Builder did not merge/deploy or change production.
- Post-merge local checks passed: Health/parity 11/11, empty states 4/4, expanded doctrine/truthful-copy file. Failing-first CI and local baseline proof are preserved; detached proof worktree is `/home/user/workspace/wt/DES-H-128-proof`.
- PR body and both READY comment payloads are saved as `DES-H-128-pr-body.md`, `DES-H-128-ready-comment.md`, `DES-H-128-ready-round2.md` in this report folder. Goal storage/editor remains absent; no fabricated API or button was added.
