AUDIT Claude Opus 5.5 — growth-project-backend#610 @ a98d08b589fec0d52128e6439e091b91134916c7 — VERDICT: APPROVE

Lane AUD-OPUS-4 (agent 112), the second Opus lens. This is a T4 delta review of the operator's update-branch. It follows my APPROVE at 7a67fbef ([5960733421](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/610#issuecomment-5960733421)). The head a98d08b5 is a merge of main f04289f9 (#607) into 7a67fbef.

**A 0 · B 0 · C 0 new.** The five Cs from my 7a67fbef verdict (C-610-8..12) stay open. Operator ruling: they go to a post-merge follow-up PR before launch.

### Purity (merge-tree + patch-ids)
- a98d08b5 has parents 7a67fbef and f04289f9, and tree 8df7869c. That is identical to `git merge-tree --write-tree 7a67fbef f04289f9`, so the merge adds no hand edits.
- The incoming side matches main: `git diff 7a67fbef a98d08b5` and `git diff 3bd6215b f04289f9` have the same stable patch-id, 2579c58c.
- The PR's own change is unchanged: `git diff 3bd6215b 7a67fbef` and `git diff f04289f9 a98d08b5` have the same stable patch-id, 8b0a2dac. What I approved at 7a67fbef is exactly what this head adds to main.

### Seam review
- **`.github/workflows/ci.yml` (T4 gate file).** Main (#607) and this PR touch separate places.
  - Main's changes, in `rls-live-tests` and `mwb-3-live-tests`: the onboarding-intake bootstrap/migration/grants step, `test/rls/onboarding-intake-rls.spec.ts`, and `test/onboarding-tenancy-fence.live.spec.ts`.
  - This PR's change: its own `community-live-tests` job, plus the one-line message-shape spec.
  - Main's steps are all present, nothing is removed or loosened, and no `continue-on-error` or condition changed.
  - `community-live-tests` runs `prisma migrate deploy` over the whole chain, so it now also applies 20270212 on a real Postgres.
- **`prisma/schema.prisma`.**
  - Main adds `ClientOnboardingIntake`, `ClientOnboardingIntakeRevision` and `ClinicProgramSet`, plus a User relation hunk at line 516.
  - This PR adds `CommunityWorkspaceBan` and `CommunityVoiceErasure`, plus CommunityWin, enum and User relation hunks at line 507.
  - The hunks do not overlap, and Schema parity at this head checks the merged result.
- **Migration order (20270211 vs 20270212 and 20270216).**
  - Production has applied 20270216 (`package_first_published_at`: `ALTER TABLE "CoachPackage"` only). #607's 20270212 is on main and may not be deployed yet.
  - So production applies 20270211 after 20270216. A fresh database (CI and the dry run) applies 0211 → 0212 → 0216.
  - The three migrations touch disjoint objects:
    - 0211 touches the community tables, `CommunityWin` policies and trigger, the `community_messages` CHECK and `CommunityModerationTargetType` values, and creates `app.community_win_*` and `public.community_win_guard_moderation`.
    - 0212 creates the onboarding tables and policies, plus `app.can_read_client_consultation` and `app.sub_coach_membership_head`.
    - 0216 alters only `CoachPackage`.
  - No function is replaced by two of them, no object is created in one and used in another, and 0211 does not touch `CoachPackage`. Both orders give the same schema.
  - `prisma migrate deploy` applies pending migrations by name and does not refuse an older pending one, so the production order is safe. The forward-apply and reversibility gates check this at the head.
  - One rollback note: 0211's `down.sql` prerequisites are unchanged (no open `community_voice_erasures` rows; re-home cohort-less comments first).

### CI at this exact head
All 10 required checks are SUCCESS: build-and-test (665 suites / 11,577 tests passed; 22 suites skipped, as on main), rls-floor-guard, rls-live-tests (now including #607's onboarding-intake RLS spec), mwb-3-live-tests, npm audit, CodeQL, Banned cast tokens, build-sbom, danger, and Schema parity (merged schema vs the full migration chain).

Also SUCCESS: Forward migrations apply cleanly, New migrations reversible, actionlint, shellcheck, test-deploy-readiness, and community-live-tests (job at a98d08b5: 10 suites / 99 tests passed, 0 skipped, including community-wins-rls.live and community-message-shape.live). deploy-readiness-gate is skipped, as on every PR.

### Operator rulings recorded
- The account-deletion fail-safe is accepted.
- FEATURE_COMMUNITY_VOICE_NOTES stays off until a native EAS build and an iOS/Android device pass.
- C-610-8..12 go to a post-merge follow-up PR before launch.

I made no push, merge, dispatch or production action.
