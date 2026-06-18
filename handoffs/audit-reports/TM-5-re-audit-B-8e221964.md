---
audit: TM-5 — Apply funnel + pre-coach account + applicant profile
lens: B (cycle / drift / regression, read-only)
sha: 8e221964da18928355757ef277edf6911d4464f9
branch: feat/tm-5-apply-precoach
pr: "#435"
base_main: bdd709e85885c7f00c966078a60079a62a95c18b
prior_lens_b_baseline: 746c0a09cba75898e4b3f1a3429d5c85f4988c0a
diff_range: bdd709e8..8e221964
cycle_range: 746c0a09..8e221964
timestamp_utc: 2026-06-18T10:32:00Z
final_verdict: CLEAN_NO_FINDINGS
counts:
  P0: 0
  P1: 0
  P2: 0
  P3: 0
---

# TM-5 Lens B re-audit (cycle / drift / regression) @ 8e221964

**Verdict: CLEAN_NO_FINDINGS (P0 0 / P1 0 / P2 0 / P3 0)**

Read-only cycle audit of the post-rebase TM-5 head `8e221964`, branch
`feat/tm-5-apply-precoach` (PR #435), rebased from prior Lens-B baseline
`746c0a09` onto post-TM-3-merge main `bdd709e8`. The Lens-B charge is
drift/regression — did the rebase preserve the previously dual-CLEAN tree, did
the 4-lane module union drop or duplicate anything, do the cross-lane contracts
still converge, and are all prior findings still disposed. No backend code was
modified; no fixer run; no CI triggered.

| Severity | Count |
| -------- | ----- |
| P0 (blocker)    | 0 |
| P1 (must-fix)   | 0 |
| P2 (should-fix) | 0 |
| P3 (polish)     | 0 |

## Scope / SHA verification

- `git rev-parse HEAD` → `8e221964da18928355757ef277edf6911d4464f9` ✔
- `git merge-base HEAD origin/main` → `bdd709e85885c7f00c966078a60079a62a95c18b` ✔
  (clean linear base directly on post-TM-3 main; no merge commits).
- PR diff `bdd709e8..8e221964` = 13 files / +2034 / −2 (entire TM-5 surface).

## 1. Rebase fidelity — ZERO functional drift (the key Lens-B finding)

`git range-diff <oldbase>..746c0a09  bdd709e8..8e221964` (oldbase `d04f0c7c`):

```
 1:  af118f66 !  1:  99117d22  WIP snapshot: TM-5 apply + pre-coach account
 2:  d321dd05 =  2:  6e525722  TM-5: document PII guardrails for apply service
 3:  7248cbbd =  3:  5ddee8d8  TM-5: remove banned as-unknown-as casts; validate ledger JSON by shape
 4:  7ecee886 =  4:  dbde6fe8  TM-5: add apply-fit and application-cursor unit specs
 5:  54764fc0 =  5:  f5c8f8b2  TM-5: add apply service and controller specs (PII, owner-scope, idempotency)
 6:  15c64ae8 =  6:  1d266dad  TM-5: fix spec types for strict tsc; targeted suite green (34 tests)
 7:  0e0d033c =  7:  6fea758a  TM-5: gate ApplyController routes to fix roles-enforced doctrine pin
 8:  c7298ae1 =  8:  8d5c8ba4  TM-5: lock apply auth-boundary + anonymous-confirmation PII contract in specs
 9:  2c6af1c0 =  9:  2c154cc0  TM-5: surface machine-readable error code on apply HTTP envelope
10:  96bed50c = 10:  a089e6b8  TM-5: add (applicant_user_id, listing_id) unique backstop to Application
11:  746c0a09 = 11:  8e221964  TM-5: pin distinct-key recovery + free-text trim parity
```

**Commits 2–11 are byte-identical (`=`).** Only commit 1 (`!`) differs, and the
sole delta there is the `talent-marketplace.module.ts` additive union (the
documented rebase conflict resolution). Therefore: `apply.service.ts`,
`apply.controller.ts`, `apply.dto.ts`, `apply-fit.ts`, `application-cursor.ts`,
the migration, the schema change, and all 5 specs replayed UNCHANGED from the
`746c0a09` tree that was previously audited DUAL-CLEAN. The audited security/PII/
idempotency surface carries forward intact; the only thing a Lens-B re-read must
clear anew is the module union. **No finding.**

## 2. module.ts 4-lane union — no drops, no dups

Read at `8e221964`. Clean additive union of TM-2 + TM-3 + TM-5 + TM-14:

- **imports:** `[AntiBotModule, TalentConnectAdapterModule]`
  (TM-5 anti-bot gate + TM-14 Connect adapter).
- **controllers:** `[JobListingController, ApplyController,
  TalentConnectWebhookController, PublicListingController]`
  (TM-2 + TM-5 + TM-14 + TM-3 — all four present exactly once).
- **providers:** `JobListingService, ApplyService,
  MarketplaceIdempotencyService, PublicListingService, PrismaService,
  JwtAuthGuard, JwksVerifierService, HirerVerifiedGuard,
  TalentConnectWebhookService` (no duplicates; each provider once).
- **exports:** `[JobListingService, ApplyService]`.
- **doc banners:** TM-2 / TM-3 / TM-5 / TM-14 all retained.

Every symbol resolves (tsc exit 0 — DI graph compiles). TM-3 lane code (now on
main) was preserved untouched; only the wiring list was unioned. **No finding.**

## 3. Prior-finding disposition

The prior TM-5 Lens-A and Lens-B audits at `746c0a09` were both
`DUAL-CLEAN_NO_FINDINGS` (P0 0 / P1 0 / P2 0 / P3 0). There were no open
P0/P1/P2/P3 to regress. The internal in-cycle fixes that had already landed by
`746c0a09` remain in place and unchanged (range-diff `=` on the relevant
commits):
- commit 3 — banned `as unknown as` casts removed; ledger validated by shape.
- commit 7 — ApplyController routes gated (roles-enforced doctrine pin).
- commit 8 — auth-boundary + anonymous-confirmation PII contract locked.
- commit 9 — machine-readable `code` surfaced on the apply HTTP envelope.
- commit 10 — `(applicant_user_id, listing_id)` composite-unique backstop.
- commit 11 — distinct-key recovery + free-text trim parity (P2-2 / P3-3).
All carried forward byte-identical. **No finding.**

## 4. Cross-lane envelope convergence with TM-3 — stable

TM-5's throw sites use the house shape `{ error, message, code }`. The global
`HttpExceptionFilter` (unchanged on main; re-read this cycle, L44-47) reads ONLY
`body.message` / `body.error` / `body.code` and emits `{ statusCode, code?,
message, error, timestamp, path, request_id? }` — never `kind`. TM-5's
`job_listing_not_found` 404 is therefore byte-identical to TM-3's public-detail
404 contract; both lanes converge at the filter boundary. Proven end-to-end by
`apply.controller.http.spec.ts` (real Nest app + production filter + real POST
over Node `http`), which pins the 409 `apply_in_flight` wire body to EXACTLY
`{ code, error, message, path, statusCode, timestamp }` with `kind`/`stack`/
`hirer_id` absent — the same closed-key-set discipline TM-3's
`public-listing.controller.http.spec.ts` enforces for its 404. No divergence
introduced by the rebase. **No finding.**

## 5. DB constraints — stable across rebase

`@@unique([applicant_user_id, listing_id])` (schema) + migration
`20261220000031_application_applicant_listing_unique` (`CREATE UNIQUE INDEX IF
NOT EXISTS`) replayed identically (range-diff `=` on commit 10). Additive DDL,
dated after the prior shipped `20261220000020` migration, idempotent, alters no
shipped migration, and cannot fail (PR unshipped → no pre-existing duplicates).
The dual-P2002 recovery path (this composite OR `idempotency_key` unique →
release claim → owner-scoped read-back) is unchanged. **No finding.**

## 6. Banned-token grep — empty

`grep -rnE '@ts-ignore|as any|as unknown as|as never|\.catch\(\(\)=>undefined\)|Coming soon'`
over `src/talent-marketplace/` → `BANNED_OK_EMPTY` (zero hits, source + specs).
The ledger-parse helpers validate JSON by shape (return `null` on mismatch) and
`toLedgerJson` returns `Prisma.InputJsonValue` explicitly — no forbidden cast
re-introduced by the rebase. **No finding.**

## 7. Doctrine pins — intact

Doctrine sweep
(`doctrine|FlagOff|quietLuxury|pin|posthog-event-names|roles-enforced`) → 0
failures (46 suites / 137 matched tests). The `roles-enforced` pin holds: the
apply route is `@Public()` + anti-bot, the profile/applications routes are
`@Roles('student')`, never `@Public()` (pinned in `apply.controller.spec.ts`).
Quiet-luxury confirmation copy ("You're in." peak-end closure, one fit chip not
a scorecard) preserved. **No finding.**

## 8. PII drops — preserved

Allow-list mappers (`toProfile` / `toCard` / `toConfirmation`) unchanged; raw
entities never spread. Identity echoed only to the owning applicant; the
anonymous confirmation is ids + status + fit chip + closure copy only (spec
asserts exact key-set + email/`hirer_id` absent from the serialized payload +
no email in logs). Cursor is owner-scoped plaintext (the `where` pins the JWT
subject before merging the tuple, so a forged cursor cannot widen scope — not a
regression; documented same-surface helper). **No finding.**

## 9. R81 §Severity — no P3+ outstanding

Per R81, any P3 or higher must be fixed before merge. This cycle surfaces 0
findings at every severity, so the merge gate is satisfied from the Lens-B
perspective. (The only in-cycle P-items ever raised — P2-2 distinct-key
recovery, P3-3 trim parity — were fixed at commit 11 and carried forward
unchanged.) **No finding.**

## Cycle delta vs 746c0a09 (summary)

| Dimension | 746c0a09 (prior) | 8e221964 (now) | Delta |
| --------- | ---------------- | -------------- | ----- |
| Verdict | DUAL-CLEAN | CLEAN_NO_FINDINGS | none |
| apply.service / dto / controller / fit / cursor | audited clean | range-diff `=` | identical |
| migration + schema | audited clean | range-diff `=` | identical |
| 5 specs | audited clean | range-diff `=` | identical |
| module.ts | TM-2/5 wiring | 4-lane union (TM-2/3/5/14) | additive union only |
| base main | pre-TM-3 | post-TM-3 (`bdd709e8`) | rebased forward |
| TM lane tests | green | 16 suites / 161 tests green | +TM-3/TM-14 surfaces coexist |
| tsc | exit 0 | exit 0 | none |

## Run gates (this cycle)

- `tsc --noEmit` → exit 0 (after `prisma generate`).
- `jest --testPathPatterns='talent-marketplace'` → 16 suites / 161 tests, 0 fail.
- Doctrine sweep → 0 failures.
- Banned-token grep → empty.

## R74 identity

All 11 commits `bdd709e8..HEAD` authored `Bradley Gleave
<bradley@bradleytgpcoaching.com>`. No AI / Claude / Anthropic / Co-Authored /
Agent / Computer / GPT strings in any author or message. IDENTITY clean.

## Conclusion

TM-5 @ `8e221964` is **CLEAN_NO_FINDINGS** under Lens B. The post-TM-3 rebase
introduced ZERO functional drift (commits 2–11 byte-identical; only the
module.ts 4-lane additive union changed), the union drops/duplicates nothing,
the cross-lane envelope still converges byte-identically with TM-3, the DB
backstop and PII/doctrine invariants are stable, and all prior in-cycle fixes
carry forward. No P0/P1/P2/P3. Clear to proceed to the operator's dual-CLEAN
merge pipeline pending the 4 required CI checks (build-and-test, rls-floor-guard,
rls-live-tests, mwb-3-live-tests).
