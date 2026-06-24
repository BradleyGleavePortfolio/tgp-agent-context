# PR #427 — Consolidated Dual-Lens Verdict

**PR:** feat(coach): custom-exercise storage layer (#427)
**Branch:** feat/coach-custom-exercise-data → main
**Commit:** bafa2b25
**Audited:** 2026-06-24

## Lenses

- Lens A (Opus 4.8) → DIRTY (P3-only, non-blocking by Lens A's reading)
- Lens B (GPT-5.5) → DIRTY (P1 BLOCKING)

## Disagreement resolution (verified by direct filesystem inspection)

Lens A asserted migration ordering was correct because `...000001` is strictly after `...000000_talent_marketplace_rls`. **Lens B is correct.** Since the PR branched, four more migrations have landed on main:

```
20261220000000_talent_marketplace_rls    (when PR branched, this was the tail)
20261220000010_marketplace_idempotency_claim_nonce
20261220000020_marketplace_abuse_signal_rls
20261220000030_marketplace_connect_event
20261220000031_application_applicant_listing_unique
20261220000001_coach_custom_exercises    ← PR would land HERE, lexically behind 4 landed migrations
```

This violates the append-only ordering doctrine (R76 §6) and risks a Prisma migration-history mismatch at `prisma migrate deploy` time.

## CONSOLIDATED VERDICT: DIRTY — P1 BLOCKING

## Findings (P0 → P3)

### P1 (BLOCKING — must fix before merge)

**F1 — Migration ordering violation.**
- File: `prisma/migrations/20261220000001_coach_custom_exercises/migration.sql`
- Problem: Lexically behind 4 migrations already on main (`...000010`, `...000020`, `...000030`, `...000031`).
- Fix: Rebase branch on current `origin/main`. Rename migration directory from `20261220000001_coach_custom_exercises` to `20261220000032_coach_custom_exercises`. Update the migration's leading header comment referencing the previous migration to `20261220000031_application_applicant_listing_unique`. No SQL body changes.

### P2 (Advisory — defer to B2 #428)

**F2 — Presign provider does not enforce MIME allow-list or max-size at the seam.**
- File: `src/coach-exercise/coach-exercise-upload.provider.ts`
- Lens B argues the provider should fail closed.
- Lens A and direct sibling inspection: `src/community/voice/voice-upload.provider.ts` follows the **identical** pattern ("caller validates duration/size/content_type up-front"). This is precedented, landed, and operational. Carrying it into the coach-exercise slice does not introduce a regression.
- Disposition: not a B1 blocker. Track for B2 (#428) — the API-layer DTO + service MUST enforce: positive `size_bytes`, image/video max-byte caps, MIME allow-list of `image/jpeg|png|webp` + `video/mp4|quicktime`. Add a forward-reference comment in B1's provider.

### P3 (Non-blocking)

**F3** — Commit body cites `20261220000000_coach_custom_exercises`; actual directory is `20261220000001_coach_custom_exercises`. After P1 fix → also wrong; commit body should cite the new `...000032_coach_custom_exercises` name. **Resolved by P1 fix + amend.**

**F4** — Author identity: commit is `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Per Lens A, every landed PR commit on main uses `BradleyGleavePortfolio <bradleyapple1031@gmail.com>`. **However** standing R3 doctrine in this session's rules is "Bradley Gleave + bradley@bradleytgpcoaching.com" — so the current author identity matches R3. Lens A's recommendation conflicts with R3. **No-op: leave author identity as-is.** (Confirm with the user only if F4 fix would otherwise be applied.)

**F5** — No DB CHECK on `media_kind` (`VARCHAR(16)` accepts any string). Consistent with repo style (community uses both enums and varchars). Defer.

**F6** — Single-statement `$transaction([create])` in repository is redundant. Defensible as forward-scaffolding for B2. Defer.

**F7** — `getPublicUrl` fallback synthesizes a `…/object/public/…` path for private buckets. Same latent shape as `voice-upload.provider.ts`; document in B2 that `public_url` must not be persisted/served for private buckets.

## Fixer scope (single commit on top of branch)

1. **Rebase** `feat/coach-custom-exercise-data` onto current `origin/main`.
2. **Rename** migration directory `20261220000001_coach_custom_exercises` → `20261220000032_coach_custom_exercises`.
3. **Update** the migration's header comment to reference the new predecessor `20261220000031_application_applicant_listing_unique` (or just remove the specific predecessor citation; keep the doctrinal explanation of "lands after the latest landed migration").
4. **Add** a forward-reference comment block at the top of `coach-exercise-upload.provider.ts` documenting B2's responsibility to enforce MIME allow-list + max-size (P2 advisory).
5. **R3 author identity:** keep `Bradley Gleave <bradley@bradleytgpcoaching.com>` per standing R3 rule (Lens A's PR-history observation noted but supplanted by explicit operator R3).
6. **R-live-push** at end.
7. **Conventional Commits subject** on the last commit: `fix(coach): TM-427 P1 — re-date migration to land after ...000031`.

## Acceptance for re-audit

- Migration filename `20261220000032_coach_custom_exercises/migration.sql` exists (or higher timestamp); old `...000001` directory removed.
- `ls prisma/migrations/ | sort | tail -5` shows the new file as the new tail.
- `git log --format='%an|%ae' origin/main..HEAD` shows all commits as `Bradley Gleave|bradley@bradleytgpcoaching.com` (R3).
- Last commit subject matches Conventional Commits.
- CI: build-and-test + rls-floor-guard + rls-live-tests + mwb-3-live-tests all GREEN.
