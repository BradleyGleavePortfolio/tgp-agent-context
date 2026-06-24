# PR #427 — P1 Fixer Summary

**Fixer:** Opus 4.8
**Date:** 2026-06-24
**Repo:** BradleyGleavePortfolio/growth-project-backend
**Remote branch:** feat/coach-custom-exercise-data
**Local branch:** pr427

## Outcome: P1 RESOLVED — branch pushed

### New HEAD SHA
`592f2f8b4bf44d265f4353165bd1cf8f60e5df5c`
(remote advanced bafa2b25 → 592f2f8b, forced update via --force-with-lease)

### P1 fix applied (F1 — migration ordering violation)
- Rebased `pr427` onto current `origin/main` (clean — no conflicts).
- After rebase, the four marketplace migrations from main appeared
  (`...000010`, `...000020`, `...000030`, `...000031`) with coach-exercise still at `...000001`,
  confirming it was lexically behind 4 landed migrations.
- Renamed via `git mv`: `20261220000001_coach_custom_exercises` → `20261220000032_coach_custom_exercises`.
- Updated the migration header comment to read: "Lands after
  `20261220000031_application_applicant_listing_unique` (current migration tail at time of
  authoring). Append-only — see R76 §6."

### P2 advisory documentation (forward reference for B2 #428)
- Added a FORWARD REFERENCE block to the top of the `createSignedUpload` JSDoc in
  `src/coach-exercise/coach-exercise-upload.provider.ts` stating the API-layer service MUST
  enforce positive integer `size_bytes` within max-byte caps and the MIME allow-list
  `image/jpeg|image/png|image/webp|video/mp4|video/quicktime` before calling the provider;
  noting the provider is a storage seam mirroring `community/voice/voice-upload.provider.ts`.

### Migration ordering (ls prisma/migrations | sort | tail -8)
```
20261220000010_marketplace_idempotency_claim_nonce
20261220000020_marketplace_abuse_signal_rls
20261220000030_marketplace_connect_event
20261220000031_application_applicant_listing_unique
20261220000032_coach_custom_exercises   <- new tail, correctly after ...000031
gym_distribution_scaffold.md
migration_lock.toml
rls_fitness_backend.sql
```

### Last commit (git show --stat HEAD)
```
commit 592f2f8b4bf44d265f4353165bd1cf8f60e5df5c
Author: Bradley Gleave <bradley@bradleytgpcoaching.com>
    fix(coach): TM-427 P1 — re-date migration to land after ...000031

 .../migration.sql                                        | 7 +++----
 src/coach-exercise/coach-exercise-upload.provider.ts     | 7 +++++++
 2 files changed, 10 insertions(+), 4 deletions(-)
```
The stat confirms both the directory rename (migration.sql 94% similarity) and the provider edit.
Three unrelated untracked probe files (`*_probe_reaudit.ts`) were deliberately NOT staged;
files were staged by explicit path rather than `git add -A` to keep the commit clean.

### R3 identity verification — PASS
`git log --format='%an|%ae|%cn|%ce' origin/main..HEAD` — both commits ahead of main
(3e5dcab3 original feature commit + 592f2f8b fix commit) are
`Bradley Gleave|bradley@bradleytgpcoaching.com` for both author and committer.
No filter-branch normalization required.

### Push confirmation
`git push --force-with-lease origin pr427:feat/coach-custom-exercise-data` → exit 0
`+ bafa2b25...592f2f8b pr427 -> feat/coach-custom-exercise-data (forced update)`

### GitHub PR state (gh pr view 427)
- headRefName: feat/coach-custom-exercise-data
- headRefOid: 592f2f8b4bf44d265f4353165bd1cf8f60e5df5c (matches local HEAD)
- state: OPEN
- mergeStateStatus: UNSTABLE (CI checks pending/running post-push; not blocked)
