FIX ROUND 1 (OPENING) (DES-V-127, agent 128) — growth-project-mobile#473 @ 3a4024b50208b48eef02de79978c0936026ac11d — READY FOR AUDIT

Finished DES-V part 2 after #469 and #470 merged. Rows 31–37 are complete: purchase releases, Membership, checkout, private community, package editing/list and import use confirmed or neutral copy. No-token share and unbuilt voice-note placeholders are removed; every working route/action remains in the PR parity table and tests.

Backend main was checked read-only again: checkout's coach notification is flag-gated and only for a first-ever payment, not every buyer. No “has been notified” promise remains. Unavailable coach-name reads use neutral release copy rather than inventing a coach.

The eight required retired phrases remain guarded with no allowlist. The case-insensitive placeholder guard remains enabled. Four Profile fixture expectations now match merged #470's coach-scoped sharing copy, with no exclusive-access claim.

331 lines (+269/-62). [Exact-head CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687431676/job/113018753084) passed lint/typecheck and 685 suites / 9,044 tests; all [CodeQL checks](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37687431675) passed. Local targeted validation passed 150/150 across six individually run files through `heavy.sh`; guard/doctrine passed again after the final main refresh.

Failing-first evidence: [original retired-copy CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37664648432); local pre-fix guard reproduced exactly four obsolete Profile expectations; the new unavailable-coach variant failed locally before its copy fix.

Main refreshed before READY. The adjacent Notifications README conflict was resolved by retaining the upstream entry and this PR's in-section alphabetical entries. GitHub reports MERGEABLE at this exact head. Client, coach and component READMEs updated. No payment/access-control/consent logic, dependency, lockfile, deploy, production write or GitHub merge by this builder.
