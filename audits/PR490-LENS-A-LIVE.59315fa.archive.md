# PR #490 — Lens A Audit — claude_opus_4_8

## BUILD MATRIX (R124)
```
- backend repo: BradleyGleavePortfolio/growth-project-backend
- PR #490 head SHA: 59315faf7b5f39179a11e99695c6eefdb82b06ca
    verified: `git rev-parse HEAD` in /tmp/gpb == 59315faf...
    verified: `gh pr view 490 --json headRefOid` == 59315faf... (re-checked mid-audit, stable)
- PR #490 base: main @ 185444e4326e61fd964c18498a3805533bd85152 (per PR body)
- PR title: fix(test): sync migration-spec fixtures to post-repair chain [TEST-FIX]
- Branch: fix/migration-spec-pre-existing-floor-and-path
- Dispatch UTC: 2026-06-30T22:09Z
- Audit start UTC: 2026-06-30T22:20Z
- ctxrepo: BradleyGleavePortfolio/tgp-agent-context (default branch main)
- Auditor: Lens A, model claude_opus_4_8 (R11 independence honored — Lens B file NOT read)
- Diff: 2 files, +12 / -4. Zero prod LOC. Zero migration files touched.
```
No SHA drift observed → no INFRA_DEATH.

## CHECKLIST RESULTS

1. **R76 §6 append-only invariant (146→149 bump).** **VERIFIED.** I independently
   read all three new below-floor migrations and their immediate predecessors:
   - `20260425030001_add_community_win_visibility` sits at listing position 8, immediately
     after `20260425030000_add_community_win_and_coach_guideline` (pos 7). Content:
     `ALTER TABLE "CommunityWin" ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'circle';`
     — adds a column to the table its predecessor CREATEd. **True companion/hygiene.**
   - `20260701235900_add_sub_coach_role_value` sits at pos 88, immediately between
     `20260621000000_fix_workout_rls_policies` (pos 87) and `20260702000000_fix_workout_rls_coach_role`
     (pos 89). Content: `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'sub_coach';` — and the
     migration header explicitly states it is *required by* the next migration (20260702000000),
     which compares `User.role` against literal `'sub_coach'`. **True companion** (a dependency
     prerequisite landed in its correct chronological slot).
   - `20261207000001_pr14_..._idx_concurrent` sits at pos 119, immediately after
     `20261207000000_pr14_..._id_and_guest_subscription` (pos 118). Content is a single
     `CREATE INDEX CONCURRENTLY IF NOT EXISTS "ClientPurchase_landing_page_id_idx"`, with a
     header stating it was *split out of* 20261207000000 because CONCURRENTLY cannot run inside
     a transaction. **True hygiene split.**
   None is unrelated later work that merely carries a low timestamp; each genuinely belongs to
   its low-timestamp neighborhood. The R76 §6 "grandfathered hygiene, not back-dating" claim holds.
   **Below-floor count independently computed = 149** via
   `ls -1 prisma/migrations/ | while read d; do p=${d:0:14}; if [[ "$p" < "20261219000000" ]]; then echo "$d"; fi; done | wc -l`
   → 149. Matches PR. Total migration dirs = 160.

2. **FLOOR_TS structural pin.** **VERIFIED with a line-number correction (see Defect P3-2).**
   The assertion `expect(self.slice(0, 14)).toBe(FLOOR_TS)` exists and is correct — at head it is
   **line 229**, not the "line 221" the PR body cites (and `KNOWN_BELOW_FLOOR_COUNT` is line 225,
   not "223"). `self = '20261219000000_conv_review_coach_reviewed_at_idx'` (line 227) and
   `FLOOR_TS = '20261219000000'` (line 212), so `self.slice(0,14)===FLOOR_TS` holds and the floor
   is indeed structurally pinned to the conv-review slot. The mechanism the PR describes is real;
   only its cited line numbers are stale (Root-cause-1 header even says ":223").

3. **Path A is the right choice / Path D missed.** **VERIFIED that A is defensible; Path D was
   NOT considered (see Defect P3-1).** Path B (advance FLOOR_TS) is correctly eliminated: line 229
   pins `self.slice(0,14)===FLOOR_TS`, so moving the floor would either break that assertion or
   require re-pinning `self` to a non-existent slot, misrepresenting the sentinel. Path C (refactor)
   is moot given B is impossible without redesign. HOWEVER, a fourth option exists — compute the
   below-floor count dynamically from the directory listing (the spec already calls
   `sortedMigrationDirs()`), guarded by a *different* append-only invariant (e.g. "no NEW dir below
   the floor relative to the git-tracked baseline"). The PR did not enumerate or rebut this. Filed
   as P3-1. (Caveat: the pinned literal is a deliberate tripwire by design — its comment says "Bump
   this ONLY when intentionally landing a migration with a prefix below the floor" — so this is a
   recommendation, not a correctness defect.)

4. **ENOENT root cause.** **VERIFIED.**
   (a) `ls -1d prisma/migrations/20261214000000_named_regimes_and_partial_refund_decision` →
   "No such file or directory" — old dir absent at head. ✓
   (b) `20261215000300_named_regimes_and_partial_refund_decision/` DOES exist at head. ✓
   (c) The path on line 44 is the place that needed updating; `readOriginalMigrationSql()` now
   points to the new dir. Grep of `test/` for `20261214000000` returns ONE other hit —
   `test/rls-tier5-policies.spec.ts:1184` — but that is an unrelated dummy string literal
   `'20261214000000_dummy_followup'` (different suffix, used as an INSERT VALUES fixture), NOT a
   missed reference to the renamed migration. No missed references in the two changed specs.

5. **F3 sibling existence already covered.** **VERIFIED.** `readNewMigrationSql()` (lines 25-36)
   reads `20261218000100_rls_partial_refund_decision/migration.sql` via `readFileSync`, and that
   directory exists at head. `const sql = readNewMigrationSql();` runs at suite-construction
   time (line 52), so a missing sibling would ENOENT at suite load. Six `expect(sql).toMatch(...)`
   blocks beneath assert ENABLE+FORCE RLS, service_role bypass, coach-of-purchase SELECT, UPDATE
   with WITH CHECK, and no client/INSERT/DELETE policy (lines 57-121). The sibling file contains 2
   matches for ENABLE/FORCE RLS. A separate `toBeTruthy()` existence check is genuinely redundant;
   not adding it is correct and within scope.

6. **Line-124 ordering comparison still true.** **VERIFIED.** At head, line 124 reads
   `expect('20261218000100' > '20261215000300').toBe(true);`. `'20261218000100' > '20261215000300'`
   == True (Python-checked). The line number matches head exactly. The old literal
   `'20261218000100' > '20261214000000'` also evaluated true, so this change is cosmetic correctness
   (keeping the spec internally consistent with the renamed dir), exactly as the PR states — it was
   not required to fix a failure. No line drift here.

7. **R19 pre-existing failure.** **VERIFIED as internally consistent (re-run UNVERIFIABLE in
   sandbox, as the brief anticipates).** The diff changes exactly the two assertions the failure
   signatures name: (a) the `KNOWN_BELOW_FLOOR_COUNT` 146→149 (the
   "Expected 146 / Received 149" toHaveLength failure), and (b) the ENOENT path on
   `20261214000000`. With the diff reverted, the count assertion would compare 146 against the
   on-disk 149 (fail) and `readOriginalMigrationSql()` would ENOENT on the renamed dir (fail) — so
   both specs WOULD be red on the base SHA, and the changes do not exceed what the two failures
   require. No R18 lane-scope overreach. I cannot re-run the full 7088-test suite to confirm the
   verbatim `2 failed / 154 skipped / 5 todo / 6927 passed` signature; that claim is taken as
   internally consistent per the brief's contract.

8. **R18 OWNS discipline.** **VERIFIED.** `gh pr view 490 --json files` → exactly
   `test/partial-refund-decision-rls-migration.spec.ts` (+3/-3) and
   `test/roman-coach-reviewed-migration.spec.ts` (+9/-1). Non-test path additions = 0. Nothing under
   `prisma/migrations/`, `supabase/migrations/`, `src/`, or workflows touched.

9. **R3 commit identity.** **VERIFIED.** Single commit 59315faf. `git log -1`:
   author = `Bradley Gleave <bradley@bradleytgpcoaching.com>`,
   committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Grep of message for
   claude/co-authored/ai-generated/computer/assistant/agent/dynasia/bot → NONE.

10. **R75 / R100.A2 banned-cast net delta.** **VERIFIED = 0.** Grep of added (`^+`) diff lines for
    `as any | as unknown as | as never | @ts-ignore | @ts-nocheck | <any> | Coming soon | .catch(()=>` → NONE.

11. **R74 test:src density.** **VERIFIED N/A correctly.** Non-test additions = 0 (item 8). With zero
    prod-LOC delta the ratio is undefined/N/A, exactly as the PR body claims.

12. **R117 / R123 assertion-bearing tests.** **VERIFIED.** Every modified `it()` retains its
    `expect(...)`. The Path A hunk preserves `expect(belowFloor).toHaveLength(KNOWN_BELOW_FLOOR_COUNT)`
    (line 231) — only the literal value and a comment changed. The RLS spec's three changed lines are
    a docblock comment (line 7), the path string (line 44, inside a function — assertions in the
    consuming `it()` blocks unchanged), and the ordering literal (line 124, still
    `expect(...).toBe(true)`). No assertion deleted or weakened.

13. **R109 no half-ass.** **VERIFIED.** Diff adds no `.skip(` / `xit(` / `it.todo(` / `xdescribe` /
    `fit(` / `fdescribe`. No `Coming soon` literal. The regression is fixed in place, not quarantined.

14. **R20 tracking-issue discipline.** **VERIFIED.** Grep of diff for TODO/FIXME/follow-up/next
    operator/descope → NONE. The PR body descopes nothing requiring a tracking issue.

15. **R102 / R122 branch-protection re-enable claim.** **UNVERIFIABLE (operator-facing, as the brief
    states).** I cannot re-run the suite to confirm these two are the *last* red specs on the base
    SHA. The PR body cites a signature of exactly `2 failed` on main HEAD; if accurate, these two ARE
    the only reds and merging them serves the stated purpose. I found no evidence of OTHER failing
    specs introduced by this diff. No P1 raised on this item — I have no contradicting evidence, only
    inability to re-run.

## NEW DEFECTS FOUND

- **P3-1 — Path D (dynamic count) not considered.**
  `test/roman-coach-reviewed-migration.spec.ts:225,230-231`. The PR enumerated Paths A/B/C but did
  not consider computing `KNOWN_BELOW_FLOOR_COUNT` dynamically from `sortedMigrationDirs()` under a
  baseline-relative invariant, instead of pinning a literal that must be hand-bumped on every
  legitimate below-floor hygiene migration. Recommended fix: either (a) document in the spec comment
  why a pinned literal is *deliberately* chosen over a dynamic count (it functions as a
  human-review tripwire — which is a legitimate design choice), or (b) file a tracking issue to
  evaluate a git-baseline-diff invariant. Severity P3 because the current behavior is correct and the
  tripwire design is defensible; this is a maintainability recommendation, not a bug.

- **P3-2 — Stale line numbers in the PR body.**
  PR "Root cause 1" cites `:223` for the counter and "line 221" for the `self.slice(0,14)` pin; at
  head SHA 59315faf the counter is line **225** and the pin is line **229**. The mechanism described
  is correct; only the cited line numbers are off by ~2-8. Severity P3 (documentation drift only;
  no behavioral impact). Recommended fix: none required for merge; correct the body if amended.

No P0, P1, or P2 defects found.

## RE-AUDIT SWEEP (50 failures / R24-R73)
Swept the diff in severity-pass order against the §7/§8 catalogue:
- Security (R24-R32 / failures #1-9): no auth, query, secret, injection, or RLS-logic change in the
  diff — it edits test fixtures only; the RLS *spec* still asserts service_role bypass + coach-only
  policies + no client policy. None tripped.
- Data integrity (incl. R52 idempotency, R97 money, R96 time): no prod data path touched. None tripped.
- Concurrency: none — static, DB-free specs. None tripped.
- Error handling / swallowed errors (Failure #36, R79): no `.catch(()=>…)` or empty catch added; the
  specs intentionally let `readFileSync` ENOENT propagate (correct, that IS the existence guard).
  None tripped.
- Performance: n/a. None tripped.
- Architecture / R82 migration safety: zero migration files changed — on-disk chain byte-identical to
  main; the three below-floor migrations are pre-existing and each is reversible-or-documented-IRREVERSIBLE
  in its own header. None tripped by THIS diff.
- Code quality (R75 casts, R117/R123 assertions, R109 half-ass): all clean (items 10, 12, 13).
- Infrastructure (R3 identity, R18 scope, R124 SHA): all clean (items 8, 9, BUILD MATRIX).
- False-green / quarantine drift / assertion-less tests (the brief's named test-fix failure modes):
  the bump preserves a real assertion against a real on-disk count (149 verified independently), the
  path fix points at a real file, and nothing was `.skip()`-ed. No false-green introduced.
None tripped beyond the two P3 maintainability/documentation notes above.

## VERDICT
VERDICT: FINDINGS
