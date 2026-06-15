# R81 BACKFILL LEDGER — Audit Debt Inventory

**Filed:** 2026-06-14
**Operator:** Bradley Gleave
**Trigger:** R81 instituted 2026-06-14 8:39 PM PDT after F1 PR #326 (`05af67e6`) merged without adversarial audit. Operator caught the gap and ruled: NO MERGES EVER without verbatim audit cycle.

## The Fuck-Up
Sixteen (16) PRs were merged into `main` on backend and mobile repos under CI-only gates BEFORE R81 existed. Each shipped to `main` without an independent adversarial auditor sweeping it under R72 exhaustive standard. That is the gap. R81 closes it forward; this ledger closes it backward.

## Itemized List — All 16 Un-Audited Historical Merges

Order: merge time (oldest first). Pairs = backfill batches under R81 cadence "2 at a time".

### Batch 1
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 1 | #200 | growth-project-backend | b6de53b7 | pre-Connect P1 cleanup (29 files) |
| 2 | #395 | growth-project-backend | adc066bd | Roman P4 FIRST_PAYMENT regime |

### Batch 2
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 3 | #396 | growth-project-backend | b19fee89 | community v3-2 classroom posts backend |
| 4 | #242 | growth-project-mobile  | f2dde9b3 | Roman P4 ED.3/ED.4 animations |

### Batch 3
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 5 | #248 | growth-project-mobile  | ce14bbe7 | community v3-2 mobile classroom posts |
| 6 | #397 | growth-project-backend | 592fc39e | community v3-3 voice notes backend |

### Batch 4
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 7 | #249 | growth-project-mobile  | (pending) | community v3-3 mobile voice notes |
| 8 | #399 | growth-project-backend | (pending) | community v3-4 backend |

### Batch 5
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 9 | #251 | growth-project-mobile  | (pending) | community v3-4 mobile |
| 10 | #398 | growth-project-backend | (pending) | community v3-5 backend |

### Batch 6
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 11 | #250 | growth-project-mobile  | (pending) | community v3-5 mobile |
| 12 | #400 | growth-project-backend | (pending) | community v3-6 backend |

### Batch 7
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 13 | #254 | growth-project-mobile  | (pending) | community v3-6 mobile |
| 14 | #252 | growth-project-mobile  | (pending) | community follow-up mobile |

### Batch 8
| # | PR | Repo | Merge SHA | Lane / Purpose |
|---|----|------|-----------|----------------|
| 15 | #253 | growth-project-mobile  | (pending) | community follow-up mobile |
| 16 | #326 | growth-project-mobile  | 05af67e6  | F1 mobile — the trigger merge for R81 |

## Current Status (2026-06-15 06:21 UTC / 11:21 PM PDT) — AUDIT PHASE COMPLETE

**All 16 backfill PRs + the live OPEN PR #401 now have independent adversarial audits on file.** Sixteen audit docs in `audits/`. R81 backfill audit phase: **DONE**. Fixer phase: queued, deferred to a later session per operator directive.

| PR | Audit Doc | Verdict | Fix Status |
|----|-----------|---------|------------|
| #200 | PR200_AUDIT_2026-06-14.md | REVERT_REQUIRED_P0 (trailer) + 2 P2 + 1 P3 | Trailer → AUDIT_DEBT_PR200.md (Option A); code findings → followup |
| #242 | PR242_AUDIT_2026-06-14.md | CHANGES_REQUESTED (P1 + 3 P2 + 5 P3) | Fixer needed — write-only MMKV gate causes celebration re-fire across app restarts |
| #248 | PR248_AUDIT_2026-06-14.md | CHANGES_REQUESTED (P1 + 3 P2 + 2 P3) | Fixer needed — Zod `.strict()` detail schema mismatch with backend `{post, upload_targets}` shape |
| #249 | PR249_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (2 P2 + 1 P3) | Polish-only — defer |
| #250 | PR250_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (2 P2 + 2 P3) | Polish-only — defer |
| #251 | PR251_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (3 P2 + 2 P3) | Polish-only — defer; F1 voice-note-transcript routing bug surfaces when indexer wires up |
| #252 | PR252_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (2 P2 + 1 P3) | StripeConnectCard + PermanenceMarker components built but NOT wired to any host screen — follow-up wiring PR must be audited specifically for the PR #242 MMKV-gate pattern |
| #253 | PR253_AUDIT_2026-06-14.md | CHANGES_REQUESTED (P1 + 2 P2 + 3 P3) | Fixer needed — undo of removeExercise silently negated by autosave drop-guard refetch |
| #254 | PR254_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (2 P3) | Polish-only — defer |
| #326 | PR326_AUDIT_2026-06-14.md | CHANGES_REQUESTED (P1 + 2 P2 + 1 P3) | Fixer needed — dispatcher-claim race; check-and-set broken (50-Failures #28/#29/#44) |
| #395 | PR395_AUDIT_2026-06-14.md | REVERT_REQUIRED_P0 (tx-escape) + 7 lower | **FIXED via PR #402, re-audit CLEAN, MERGED at fea925a8** |
| #396 | PR396_AUDIT_2026-06-14.md | AUDITED — no P0/P1; 4 P2 + 2 P3 | Fixer needed before flag-flip — dead telemetry, throwaway-postId storage key, missing array-size cap |
| #397 | PR397_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (1 P2 + 1 P3) | Polish-only — defer |
| #398 | PR398_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (3 P2 + 2 P3) | Fixer needed before flag-flip — TOCTOU on `markReviewedByCoach`, raw Prisma response, missing throttle |
| #399 | PR399_AUDIT_2026-06-14.md | CHANGES_REQUESTED (P1 + 4 P2 + 1 P3) | Fixer needed — ParseUUIDPipe on cuid IDs (routes dead on flag-on); plus 403-not-404 leak + TOCTOU + cooldown race |
| #400 | PR400_AUDIT_2026-06-14.md | PASS_WITH_FINDINGS (3 P2 + 2 P3) | Fixer needed before flag-flip — missing composite index, no Zod parse, no throttle |
| #401 | PR401_AUDIT_2026-06-14.md | **CHANGES_REQUESTED (2 P1 + 2 P2 + 1 P3) — OPEN, CI RED** | **CI failure is a real defect**: RegimesModule imports AuthModule directly → 5-node DI cycle (Auth→InviteCodes→Billing→Checkout→Regimes→Auth). module-graph.spec rejects cycles >2 nodes. Fix: use SecurityGuardsModule pattern. Plus onPartialRefund TOCTOU. |
| #402 | PR402_REAUDIT_2026-06-14.md | **CLEAN_NO_FINDINGS** | Merged at fea925a8 — the R81 cycle exemplar |

## Fixer Queue (priority order for next operator)

**Urgent (P1, blocks flag-on)** — surface order matches likely flag-flip-imminence given all 16 surfaces are launching together on Day 1:

1. **PR #401 fixer** — OPEN PR sitting CI-red on `main`; the most immediately actionable cleanup. Fix the DI cycle via SecurityGuardsModule pattern; fix the partial-refund TOCTOU; rerun R79 pin tests; re-audit; merge.
2. **PR #399 fixer** — `ParseUUIDPipe(v4)` → CUID-compatible validation on dismiss/act-on routes (routes are dead until fixed). Plus 403→404 leak fix, throttle decorators, TOCTOU collapse on markDismissed/markActedOn, cooldown-race redesign.
3. **PR #326 fixer** — `updateMany({where: {id, status: 'pending'}})` with `count===0 → throw` for the per-drop check-and-set. Plus @Throttle, Zod response, AuditService write.
4. **PR #253 fixer** — clear `deletedKeysRef`/`deletedSignaturesRef` in the inverse-addExercise branch of `applyInverse`. Add integration test for delete→undo→refetch cycle. Plus accessibilityLiveRegion on toast.
5. **PR #242 fixer** — gate `onFirstPayment` on `await hasSeenFirstPayment(coachId)` (read-on-mount); add regression test with pre-set persisted gate. Plus P2 polish.
6. **PR #248 fixer** — drop `.strict()` on detail schema OR accept `upload_targets` optionally; add `CommunityLessonDetailScreen.test.tsx` covering 404, release-locked, null-url, flag-off.

**Pre-flag-flip (P2-only PRs)** — once urgent queue clears:
7. **PR #396 fixer** — wire telemetry emits OR correct narrative; real-post-id in create-path storage keys; @ArrayMaxSize on media arrays; explicit @Throttle on reads.
8. **PR #400 fixer** — composite `(coach_id, coach_reviewed_at)` index; Zod `.strict()` on response; @Throttle.
9. **PR #398 fixer** — collapse `assertCheckInOfCoach`+update to single `update({where: {id, coach_id}})`; narrow response with `select`; @Throttle.
10. **Polish wave** — #249/#250/#251/#252/#254/#397 P2/P3 polish; can be batched into one cross-PR cleanup PR per repo.

**PR #200 followup** — code findings (2 P2 + 1 P3) still open per the original PR200 audit's `PR-200-FOLLOWUP` brief. Trailer is settled via AUDIT_DEBT_PR200.md Option A; do not rewrite history.

## Sequencing principle

All 16 surfaces launch together on Day 1 (pre-launch, no individual flag-flip priority). Therefore: order fixers by **severity** (P1s first, then P2-only PRs), not by feature-priority. The PR #402 R81 cycle is the template — single-loop audit→fix→re-audit→CLEAN→merge, one PR at a time, R74-clean commits, push every 2 min.

## Trailer Sweep Result
Of 16 merged PRs, only **PR #200** carries a banned `Co-Authored-By: Claude Opus 4.7` trailer. The other 15 sweep clean (only legitimate human co-authors `Bradley Gleave` and `Dynasia G`). PR #200 trailer handled via Option A (AUDIT_DEBT_PR200.md) — no history rewrite.

## R81 Enforcement Going Forward
Every PR — old or new — must follow:
1. CI green + doctrine sweep clean + R74 commit identity verified
2. Independent adversarial auditor (Opus 4.8, R72 exhaustive, no time budget, R77 read-only)
3. Audit doc at `audits/PR<N>_AUDIT_<date>.md` pushed to tgp-agent-context
4. If `CLEAN_NO_FINDINGS` → merge authorized
5. Any finding (P0–P3) → fixer dispatched per finding → re-audit → cycle until CLEAN
6. Only then `gh pr merge --squash --delete-branch`

R81 is tied with R0 at top priority per operator directive 2026-06-14 8:40 PM PDT: "RULE 81 stays above all else with R0 / MAKE IT ABOVE ALL WITH R0".
