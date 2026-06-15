# F2 — Named Regimes (backend + mobile)

**Lane:** backend + mobile
**Branch (backend):** `feature/named-regimes`
**Branch (mobile):** `feature/named-regimes`
**Worktrees:** `/tmp/gpb-F2` (backend, at main `0d13bfb2`), `/tmp/gpm-F2` (mobile, at main `64e2de4d`)
**Flag (backend):** `FEATURE_NAMED_REGIMES`
**Flag (mobile):** `EXPO_PUBLIC_FF_NAMED_REGIMES`

## Operator intent (locked answers)

1. **Live-edit propagation:** opt-in push button per edit. **Use PR #326's endpoint** (`POST /v1/coach/packages/:packageId/contents/:contentId/push-to-existing`) — F1 is resurrecting that PR; you do NOT touch propagation infrastructure, you only **render the button** in the regime editor and call the endpoint. If F1 hasn't merged yet by the time you need it, your mobile UI should still wire the button (it's gated by `EXPO_PUBLIC_FF_NAMED_REGIMES` and will simply 404 until F1 lands — acceptable since the flag is OFF).
2. **Pause:** dropped. Do NOT build a pause action.
3. **Refund — full:** already handled by PR-16 (`fanout.cancelPendingForPurchase('refund')`). Do NOT touch refund handler.
4. **Refund — partial:** add a NEW coach-facing action surface. When a partial refund fires (existing `ChargeRefund` row created by the refund handler), the coach gets a card on the affected client's record offering "Unassign drops" or "Keep drops". DO NOT auto-cancel partial-refund drops. Implement as a coach-decision flow.
5. **Reassignment after refund:** new purchase = brand-new fan-out. No resurrection logic. (Already true today — confirming, no work needed.)
6. **Naming:** regime name is INDEPENDENT of package name. Package "36-week personal coaching + IRL classes" can carry regime "12-week hypertrophy for men under 30". Each is its own string field.
7. **Regime versioning:** keep the **last 2 versions plus the new** one (rolling 3-deep history). Older versions evicted on new save.
8. **Regime archive:** active clients on it continue receiving until their schedule completes; new purchases blocked from selecting it.

## Empirical reality (verified from `prisma/schema.prisma` HEAD `0d13bfb2`)

- `WorkoutProgram` (schema.prisma:2170) — existing template construct with `coach_id`, `owner_user_id`, `visibility`, `weeks`, `days_per_week`, `is_template`, `goal_tag`, `version`, `head_revision_id`, `archived_at`. **THIS IS THE BASE FOR THE NAMED REGIME.** Do NOT introduce a parallel `Regime` table. Add the regime layer on top of `WorkoutProgram`.
- `WorkoutProgramRevision` (schema.prisma:2233) — append-only revision log with `revision_index`, `structure_json`, `author_kind`, `cause`. Already supports rolling history; you'll add the "keep last 2+new" eviction logic on save.
- `CoachPackage` (schema.prisma:3208) — package model. NO regime FK today.
- `CoachPackageContent` (schema.prisma:5036) — package→asset link with `asset_type='workout_program'`. **This is the existing regime-attached-to-package mechanism.** A regime IS a `WorkoutProgram` attached via `CoachPackageContent` with `asset_type='workout_program'`.
- `ClientWorkoutAssignmentSnapshot` (schema.prisma:2255) — immutable point-in-time snapshot per assignment. Already provides the "history stays UNTOUCHED" guarantee. Do NOT redesign.
- `ScheduledDrop` (schema.prisma:5057) — per-buyer drip schedule. PR #326 (F1) handles propagation.

## What F2 ships

### Backend
1. **`WorkoutProgram` schema additions** (additive migration):
   - `is_regime Boolean @default(false)` — coach-marked "named regime" flag. Distinguishes regimes (named, surfaced in regime UI) from raw programs (workout-builder authoring only). Default false so all existing programs are unaffected.
   - `regime_display_name String?` — independent name shown in regime UI. Falls back to `WorkoutProgram.name` if null.
   - `revision_retention_count Int @default(3)` — rolling history depth. Default 3 per operator decision.
2. **Regime-revision eviction service** — on `WorkoutProgramRevision` insert where `program.is_regime=true`, after the new row commits, delete rows with `revision_index < (max - revision_retention_count + 1)`. Idempotent under retry. Test: bulk insert 5 revisions on one regime, assert exactly 3 remain (the latest 3).
3. **`GET /coach/regimes` endpoint** — lists `WorkoutProgram` rows for the calling coach where `is_regime=true AND archived_at IS NULL`. Class-level `@Roles('coach')` (R80 lesson). Returns: `{ id, name, regime_display_name, weeks, days_per_week, head_revision_id, archived_at, package_attachments_count }`. The last field is `COUNT(CoachPackageContent WHERE asset_type='workout_program' AND asset_id = program.id AND removed_at IS NULL)` — operator wants to see "this regime is attached to N packages" in the list.
4. **`POST /coach/regimes/:id/archive` endpoint** — sets `archived_at = now()`. Active clients continue receiving (no drop cancellation — leave existing ScheduledDrops alone). New `CoachPackageContent` rows referencing this program return 422 from the package authoring endpoint (you'll add the validation in `PackageContentService.createContent` or its equivalent — verify the file name empirically).
5. **`POST /coach/regimes/:id/promote-from-program` endpoint** — flips `is_regime=true` on an existing `WorkoutProgram`. Body: `{ regime_display_name?: string }`. Validates the program belongs to the calling coach (tenant + owner via existing `WorkoutProgram` RLS pattern).
6. **`PATCH /coach/regimes/:id` endpoint** — updates `regime_display_name` only. Other program fields edit via existing `/coach/programs/:id` (don't duplicate). After save, writes a new `WorkoutProgramRevision` row with `cause='manual_edit'`, then triggers eviction. **Do NOT auto-push to existing buyers** — that's the operator's manual button via F1's endpoint.
7. **Partial-refund decision surface** — new `PartialRefundDecision` model:
   ```
   id String @id
   client_purchase_id String (FK ClientPurchase, indexed)
   stripe_refund_id String @unique
   decision String  // 'pending' | 'keep_drops' | 'unassign_drops'
   decided_at DateTime?
   decided_by_coach_id String?
   created_at DateTime @default(now())
   ```
   On `ChargeRefund` insert where partial (`amount_cents < purchase.amount_cents` AND `entitlement_active` remains true), create a `PartialRefundDecision` with `decision='pending'`. Add `GET /coach/refunds/pending-decisions` (lists pending decisions for the coach) and `POST /coach/refunds/:refundId/decide` body `{ decision: 'keep_drops' | 'unassign_drops' }`. On `unassign_drops`, call existing `fanout.cancelPendingForPurchase(purchaseId, 'partial_refund_decision', tx)`. R80: ensure `roles-enforced.spec.ts` covers both endpoints with class-level `@Roles('coach')`.

### Mobile
1. **`RegimeListScreen`** at `src/screens/coach/RegimeListScreen.tsx` — flag-gated, mounted on `CoachNavigator`. Lists regimes with package-attachment counts. "+ New Regime" button.
2. **`RegimeEditorScreen`** at `src/screens/coach/RegimeEditorScreen.tsx` — reuses existing `WorkoutProgram` editor primitives. Adds:
   - Regime-name input (independent of package name)
   - "Last 3 versions" revision drawer (read-only history, shows `revision_index` + `created_at` + `cause`)
   - **"Push changes to existing buyers" button** — calls F1's `POST /v1/coach/packages/:packageId/contents/:contentId/push-to-existing` per package attachment. If F1 is unmerged it 404s — that's fine, the flag is OFF.
   - "Archive regime" button → confirmation modal → calls `POST /coach/regimes/:id/archive`
3. **`RefundDecisionCard`** at `src/components/coach/RefundDecisionCard.tsx` — surfaces a pending partial-refund decision on the affected client's profile screen. Two buttons: "Keep client's drops" and "Unassign client's drops". Calls `POST /coach/refunds/:refundId/decide`.
4. **Roman voice integration** — add to `src/lib/roman/copy.ts` under a NEW section header `// ── F: Named Regimes ────────────────────────`:
   - `romanRegimePromoted`: 'Marked as a regime. You can attach it to packages.'
   - `romanRegimePushed(args: { drops_updated, buyers_affected })`: parameterised — "Pushed. {n} active buyers updated."
   - `romanRegimeArchived`: 'Archived. Active clients continue, new purchases blocked.'
   - `romanPartialRefundDecided(args: { decision })`: parameterised
5. **Hooks** — `useRegimes`, `useRegime(id)`, `usePromoteToRegime`, `useArchiveRegime`, `usePartialRefundDecisions`, `useDecideRefund`. TanStack Query v5 — every mutation followed by `await waitFor(() => expect(result.current.data?.id).toBe(...))` in tests.
6. **Flag-off doctrine pin** at `src/__tests__/namedRegimesFlagOff.test.tsx` — when `EXPO_PUBLIC_FF_NAMED_REGIMES=false`, none of `RegimeListScreen`, `RegimeEditorScreen`, `RefundDecisionCard` mount; routes return 404 placeholder.

## Tests required (encode L8/L10/L12/L13 learnings)

- **Backend:**
   - `coach/regimes/list.controller.spec.ts` — coach-only, returns `package_attachments_count`
   - `coach/regimes/promote.controller.spec.ts` — flips is_regime, idempotent on retry
   - `coach/regimes/archive.controller.spec.ts` — sets archived_at, blocks future content attachment
   - `coach/regimes/revision-retention.service.spec.ts` — bulk-insert 5 revisions → only 3 retained
   - `coach/refunds/partial-refund-decision.service.spec.ts` — partial refund creates pending row; full refund does NOT
   - `coach/refunds/decide.controller.spec.ts` — keep_drops leaves drops, unassign_drops cancels pending
   - **roles-enforced.spec.ts** — every new controller MUST be in the pin and class-level `@Roles('coach')` (R80 lesson).
- **Mobile:**
   - `RegimeListScreen.test.tsx` — RNTL v14 `await render(...)`, semanticColors.bgSurface theme token
   - `RegimeEditorScreen.test.tsx` — push-button calls push-to-existing endpoint with the right (packageId, contentId) pair
   - `RefundDecisionCard.test.tsx` — both decision buttons fire the right mutation
   - `useRegimes.test.tsx` — `await renderHook(...)`
   - `namedRegimesFlagOff.test.tsx` — flag-off doctrine pin

## R-rule compliance

- **R0** ban-scan zero
- **R52** push every ~2 min
- **R74** every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- **R77** backend stays in `/tmp/gpb-F2`, mobile in `/tmp/gpm-F2`. Do NOT touch `/tmp/gpb-F1` (F1's lane).
- **R78** if you add telemetry events for regime promote/push/archive, update the telemetry-pin file in the SAME PR.
- **R79** doctrine sweep green pre-PR-open.
- **R80** verify any pre-existing-failure claim against `origin/main` before declaring it unrelated.

## PR workflow

1. Two separate PRs: backend on `growth-project-backend`, mobile on `growth-project-mobile`. Title pattern:
   - Backend: `feat(regimes): named regimes + partial-refund decision surface — FEATURE_NAMED_REGIMES off`
   - Mobile: `feat(regimes): named regimes UI + partial-refund decision card — EXPO_PUBLIC_FF_NAMED_REGIMES off`
2. **Do NOT merge.** Parent handles merge train.

## Cross-lane dependency note

F2 mobile's "Push to existing buyers" button calls F1's endpoint. If F1 hasn't merged when F2 opens its mobile PR, that's fine — the F2 flag is OFF, so the button never mounts in production. Parent will merge F1 first, then F2.

Report back with two PR URLs, gate command outputs, all commits R74-authored.
