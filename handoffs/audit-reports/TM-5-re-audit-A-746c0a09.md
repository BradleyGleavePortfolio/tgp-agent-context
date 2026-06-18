# TM-5 Re-Audit — Lens A (EXHAUSTIVE adversarial auditor)

- **PR:** #435 — feat: TM-5 apply funnel + pre-coach account + applicant profile
- **SHA audited (post-fixer):** `746c0a09cba75898e4b3f1a3429d5c85f4988c0a`
- **Prior SHA audited:** `c7298ae101906e431cde248f5e1e7560b4b645a1` (Lens A R1: P0/P1/P2/P3 = 0/0/2/3)
- **Branch:** `feat/tm-5-apply-precoach`
- **Base (branch root / true PR diff base):** `d04f0c7c21a3e6bcf19e00b762701fc6f71573b8`
- **Base main (per brief, for reference):** `96d7f464f50ad0af19004c1c5e125ec80b395032` — *NOTE: branch has NO merge-base with this SHA; rebase deferred by fixer brief (operator handles at rebase step). See SHA STABILITY.*
- **Audited:** 2026-06-18 (UTC) — Lens A re-audit of the binding PII-sign-off gate PR.
- **Lens:** A — exhaustive adversarial; find EVERY finding at EVERY severity. Extra-adversarial on PII / RLS / consent / idempotency / migration safety / HTTP envelope.

---

## VERDICT

**VERDICT: CLEAN_NO_FINDINGS (P0/P1/P2/P3 = 0/0/0/0)**

All three actionable R1 findings (P2-1, P2-2, P3-3) are fixed and spec-pinned. P3-1 and P3-2 are unchanged code-wise per the fixer brief's explicit deferral. The fixer pass introduced no new findings at any severity. Banned-token grep is empty.

---

## COUNTS

| Severity | Count |
|----------|-------|
| P0 (blocker) | 0 |
| P1 (must-fix before merge) | 0 |
| P2 (should-fix) | 0 |
| P3 (nice-to-fix / polish) | 0 |

Prior-cycle delta: P2 2 → 0, P3 3 → 0 (P3-1/P3-2 deferred-by-design, not regressions).

---

## PRIOR-FINDING DISPOSITION

### P2-1 — HTTP envelope dropped `kind`; clients could not read machine-readable error codes → **FIXED**

**Verification:** All **6** throw sites in `src/talent-marketplace/apply.service.ts` now emit the house envelope `{ error, message, code }` that the global `HttpExceptionFilter` actually serializes (filter reads `message`/`error`/`code` at `src/filters/http-exception.filter.ts` L44–47, emits `code` at L79). Confirmed verbatim:

| Site | New body | `code` |
|------|----------|--------|
| L70–74 (listing not found) | `{ error: 'Not Found', message: 'Job listing not found', code: 'job_listing_not_found' }` | ✅ |
| L102–107 (in-flight, RETRYABLE) | `{ error: 'Conflict', message: 'A submission for this application is already in progress; retry shortly.', code: 'apply_in_flight' }` | ✅ |
| L154–158 (getOwnProfile not found) | `{ error: 'Not Found', message: 'Applicant profile not found', code: 'applicant_not_found' }` | ✅ |
| L174–178 (updateOwnProfile not found) | `{ error: 'Not Found', message: 'Applicant profile not found', code: 'applicant_not_found' }` | ✅ |
| L358–362 (recover conflict) | `{ error: 'Conflict', message: 'Apply conflict', code: 'apply_conflict' }` | ✅ |
| L374–378 (replay corrupt) | `{ error: 'Conflict', message: 'Apply replay corrupt', code: 'apply_replay_corrupt' }` | ✅ |

Zero `{ kind: … }` bodies remain (grep across the file confirms no `kind:` survivors). The two `apply_conflict`/`apply_replay_corrupt` sites use `error: 'Conflict'` (the HTTP status name) with the human string in `message` and the discriminator in `code` — a defensible variation from the brief's suggested `error: 'Apply conflict'`; the machine-readable `code` still reaches the wire, which is the contract. Not a finding.

**Spec pin (the requested HTTP-envelope assertion):** NEW file `src/talent-marketplace/__tests__/apply.controller.http.spec.ts` boots a **real Nest HTTP app** (`createNestApplication` + `app.listen(0)`) with the **production global filter** (`app.useGlobalFilters(new HttpExceptionFilter())`, L80) and issues a **real POST over Node's `http` module** (no supertest — matches the repo's golden node_modules / the TM-3 pattern). It pins the retryable `apply_in_flight` case:
- L132–140: asserts `status === 409`, `body.statusCode === 409`, `body.error === 'Conflict'`, exact `body.message`, and **`body.code === 'apply_in_flight'`** survives serialization.
- L143–162: negative pins — exact wire key-set `['code','error','message','path','statusCode','timestamp']`, and `kind`/`stack`/`hirer_id` are all **absent**.

This is a real-app + global-filter test (not service-level only), exactly as the brief required. Verdict: **FIXED**.

### P2-2 — Missing `(applicant_user_id, listing_id)` uniqueness; distinct client keys could create duplicate Applications → **FIXED**

**Schema:** `prisma/schema.prisma` `model Application` now carries `@@unique([applicant_user_id, listing_id])` (alongside the retained `idempotency_key String? @unique`). Confirmed in the model block.

**Migration:** NEW `prisma/migrations/20261220000031_application_applicant_listing_unique/migration.sql`:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS "Application_applicant_user_id_listing_id_key"
    ON "Application"("applicant_user_id", "listing_id");
```
- **Date:** `20261220000031` > `20261220000020_marketplace_abuse_signal_rls` ✅ (and > `20261220000010`).
- **Idempotent:** `CREATE UNIQUE INDEX IF NOT EXISTS` — re-apply is a no-op ✅.
- **Additive-only DDL:** does not alter any shipped migration, does not touch the existing `Application_idempotency_key_key`, the 3 existing `@@index`es, or any RLS policy on `Application` (RLS lives in `20261220000000_talent_marketplace_rls` and is untouched) ✅.
- **Backfill / dup-row safety:** index would fail only if pre-existing duplicate `(applicant_user_id, listing_id)` rows existed; this PR has not shipped to any environment, so none can exist (documented in the migration header) ✅.
- **Index-name correctness:** `Application_applicant_user_id_listing_id_key` is exactly Prisma's auto-generated name for `@@unique([applicant_user_id, listing_id])`, so `prisma migrate diff` sees **no drift** between schema and DB ✅.
- **Concurrency note:** the index is created non-concurrently (inside Prisma's per-migration transaction). On an unshipped, empty-of-dupes table this is correct and avoids the `CREATE INDEX CONCURRENTLY` "cannot run inside a transaction" pitfall. No finding.

**P2002 catch broadening:** `apply.service.ts` L123–145 — the `catch` now documents and routes **both** Application unique constraints (the `idempotency_key` same-key race AND the new composite distinct-key vector) through `releaseClaim` → `recoverConfirmation`. Because the only writes inside the `$transaction` are `applicant.upsert` (keyed on `user_id`, cannot raise a meaningful P2002 here) and `application.create`, any P2002 in the tx is necessarily one of the two Application constraints — both correctly recover. `recoverConfirmation` (L344–366) reads the single existing row **owner-scoped** (`where: { applicant_user_id, listing_id }`) and replays its confirmation.

**Spec pin:** `apply.service.spec.ts` L353–420 — "recovers idempotently when a DISTINCT key hits the (applicant, listing) composite unique": stubs `application.create` to throw P2002 with `meta.target: ['applicant_user_id','listing_id']`, sends `idempotency_key: 'distinct-second-key'`, and asserts (a) `create` called exactly **once** (the duplicate is rejected, not created), (b) `releaseClaim` called once, (c) `recoverConfirmation` reads back scoped to `{ applicant_user_id:'user-1', listing_id:'listing-1' }`, (d) result `application_id === 'app-1'` (the ONE existing row), (e) **no error** reaches the client. This is exactly the contract the brief demanded. Verdict: **FIXED**.

### P3-3 — Inconsistent free-text trimming → **FIXED**

**`updateOwnProfile` (L184–192):** `first_name`/`last_name` `.trim()`; `headline`/`bio`/`sample_program_url` via `trimOrNull` (preserves explicit null); `specialties`/`certifications` via `trimEntries` (per-entry trim). `years_experience` passed through (numeric — correct).

**`runApply` upsert-create (L270–277):** same parity — names trimmed, `headline`/`bio`/`sample_program_url` via `trimOrNull`, `specialties`/`certifications` via `trimEntries`.

Helpers `trimEntries` (L439–441) and `trimOrNull` (L445–447) are pure and preserve order/null/absence; DTO length bounds still apply post-trim.

**Spec pin:** `apply.service.spec.ts` L149–171 — feeds `'  Jordan  '`, `headline:'  Strength Coach  '`, `bio:'  10 years in the gym.  '`, `specialties:['  Strength  ','Mobility']`, `sample_program_url:'  https://example.com/p  '` and asserts the written `data` equals the fully-trimmed set (names, headline, bio, per-entry specialty, url). Verdict: **FIXED**.

### P3-1 (unsigned cursor) — **NO CODE CHANGE (per brief deferral)** ✅

`src/talent-marketplace/application-cursor.ts` is byte-identical between `c7298ae` and `746c0a09` (no diff in the fixer pass). Owner-scoped consumer (`myApplications` filters `applicant_user_id = caller`), malformed cursor degrades to page-1 → no IDOR. Tracked for hoist-and-sign once TM-3 lands, as the file header comment and the brief both record. Correctly unchanged.

### P3-2 (anonymous unverified-email account minting) — **NO CODE CHANGE (per brief deferral)** ✅

`resolveAccount` (L304–340) is unchanged in intent: mints a pre-coach `User` (`supabase_id: precoach:${sha256(email)}`, `role:'student'`) from an unverified body email on the `@Public()` apply route, gated solely by `@AntiBotGate(Apply) + AntiBotGuard`. This remains a **consent / account-provenance operator-sign-off item**, not a code defect — anti-bot is the agreed control. The email is never logged and never echoed to the anonymous caller. **Operator sign-off must explicitly record:** "anonymous apply mints unverified-email pre-coach accounts, gated by anti-bot; TM-12 link must re-verify identity before trusting the pre-existing row." Correctly unchanged.

---

## NEW-ISSUE ADVERSARIAL SWEEP (fixer-introduced regressions) — NONE

- **Over-broad P2002 catch?** No. Only two unique constraints can fire inside the tx (both on `Application`); the `applicant.upsert` is keyed on `user_id` and uses `update: {}`, so it cannot surface a duplicate that misroutes. No other entity is written in the tx. The `User`/email uniqueness is handled separately in `resolveAccount` (its own P2002 → re-read winner, L325–339) **before** the tx, so it never reaches the apply catch. Clean.
- **`recoverConfirmation` race correctness?** Reads `findFirst` ordered `created_at desc` scoped to `(applicant_user_id, listing_id)` → with the new composite there is at most one row, so "first" is deterministic. Clean.
- **Envelope `error: 'Conflict'` vs brief's `'Apply conflict'`?** Cosmetic; `code` carries the discriminator to the wire. Not a finding.
- **Migration transaction safety / RLS impact?** Additive unique index, non-concurrent on an empty-of-dupes unshipped table; no RLS policy references index names; service_role bypass + applicant/hirer SELECT policies unaffected. Clean.
- **New HTTP spec leak surface?** The spec itself asserts no `stack`/`kind`/`hirer_id` leak and a closed key-set — it is a guardrail, not a leak. Clean.
- **Banned tokens in the new migration/spec/service edits?** Empty (see checklist #10).

No P0/P1/P2/P3 introduced.

---

## VERIFICATION CHECKLIST (12 items)

1. **Roles on every route.** PASS. `apply.controller.ts`: `applyToListing` `@Public()` + `@AntiBotGate(Apply)` + `@UseGuards(AntiBotGuard)` (anonymous-by-design); `getMyProfile`/`updateMyProfile`/`myApplications` each `@Roles('student')` + `@UseGuards(JwtAuthGuard)`. No coach/owner. `apply.controller.spec.ts` L117–162 pins the exact posture positively (Public + anti-bot surface on apply; `@Roles(['student'])` on the three reads-own) and negatively (apply carries no `@Roles`; reads-own never `@Public`; no coach/owner anywhere).
2. **Profile PII / no raw-entity leak + no PII in logs.** PASS. Every response goes through allow-list mappers `toProfile`/`toCard`/`toConfirmation` (L385–433); no raw entity spread. **Zero** `console.*`/`logger`/`Logger` calls in any TM-5 source file (grep empty) — no path can log email/name/IP. `apply.service.spec.ts` PII-hygiene block (L423+) pins console.log/error/warn never carry the email on the happy path.
3. **Response shapes (allow-list DTOs).** PASS. `apply.dto.ts` response interfaces are explicit allow-lists. Spec key-set pins: profile (L122–126 region), card (L199–201: no `hirer_id`/`applicant_user_id`/`email`), confirmation positive+negative scans.
4. **applyToListing idempotency / race — INCLUDING new P2-2 fix.** PASS. replay→`fromLedger`; in_flight→409 `apply_in_flight`; claimed→`runApply`; markCompleted conflict→`recoverConfirmation`; **P2002 (idempotency_key OR composite)→releaseClaim + recoverConfirmation**. Default key namespaced `apply:${account.id}:${listing.id}`. Distinct-key composite path now pinned (L353–420). No remaining dedup gap.
5. **Anonymous confirmation contract.** PASS. `toConfirmation`/`fromLedger` return exactly `{application_id, applicant_id, account_id, status, fit, confirmation}` — no applicant email/name, no hirer identity. 201 + full payload, never an empty 200.
6. **Fit scoring — no protected attributes.** PASS. `apply-fit.ts` (unchanged) consumes ONLY `applicantSpecialties`, `listingSpecialty`, `listingCompensationType`; pure/deterministic; grep for age/gender/race/ethnicity/name/email/religion/disability → none. Blend `0.7*specialty + 0.3*comp`, thresholds 67/34, clamped 0–100. `fitFromScore` mirrors thresholds for list/replay parity.
7. **Migration date > 20261220000020 + RLS implications of the new index.** PASS. `20261220000031` > `20261220000020`; additive `CREATE UNIQUE INDEX IF NOT EXISTS`; idempotent; no RLS interaction (policies untouched, no index-name references in policies); index name matches Prisma convention (no drift).
8. **RLS on applications.** PASS (inherited from `main` `20261220000000`, unmodified). applicant reads/writes own (`applicant_user_id = app.current_user_id()`), hirer reads its listing's apps (`hirer_id`), anon → zero, service_role bypass. New index does not weaken any policy. Service-layer owner-scope is defense-in-depth on top.
9. **Cursor PII discipline.** PASS. Cursor carries only `(created_at, id)` — no PII; opaque base64url; owner-scoped consumer → no IDOR. Unsigned (P3-1) deferred per brief; not a leak given owner-scope.
10. **Banned tokens grep (full diff vs branch base).** PASS — **CLEAN/EMPTY**. `git diff --name-only d04f0c7c...HEAD | grep '^(src|test|prisma)/' | xargs grep -nE '@ts-ignore|as any|as unknown as|as never|.catch(()=>undefined)|Coming soon'` → no matches. Ledger JSON validated field-by-field (`parseLedger*`) instead of casting; `toLedgerJson` widens via an explicit literal, not a double-cast. (The pre-existing `as any`-style cast in `http-exception.filter.ts` is on `main`, not in the TM-5 diff.)
11. **Doctrine pins.** PASS. No doctrine-pin file touched by the PR (grep for doctrine/posthog/FlagOff/roles-enforced/pin in the diff name-list → none). Luxury doctrine respected: one primary fit chip, definitive confirmation payload, minimum-field apply.
12. **PostHog events.** PASS — NONE. No posthog/capture/track in any TM-5 file; nothing to reconcile against the posthog-event-names pin.

---

## SHA STABILITY

- Audited tree pinned at HEAD `746c0a09cba75898e4b3f1a3429d5c85f4988c0a` (branch `feat/tm-5-apply-precoach`).
- True PR diff base (branch root) `d04f0c7c21a3e6bcf19e00b762701fc6f71573b8`. All line references above are at the audited SHA.
- **Base-main discrepancy (informational, not a finding):** the branch has **no merge-base** with the brief-cited base main `96d7f464f50ad0af19004c1c5e125ec80b395032` (`git merge-base HEAD 96d7f464` → empty; `... no merge base`). The branch sits on the older `d04f0c7c`. The fixer brief explicitly states "Do NOT rebase onto current main (`96d7f464`) yet — the operator's loop handles rebase as a separate step after the lane is dual-CLEAN." This audit therefore diffs against the branch root; the rebase onto `96d7f464` (which carries TM-3/TM-14) is the operator's responsibility and may shift `talent-marketplace.module.ts` and line numbers. Re-verify line numbers post-rebase.
- Fixer-pass diff (`c7298ae..746c0a09`) touched exactly 6 paths, all in-scope per brief: migration (new), `prisma/schema.prisma`, `apply.controller.http.spec.ts` (new), `apply.controller.spec.ts`, `apply.service.spec.ts`, `apply.service.ts`. No out-of-scope files (`talent-marketplace.module.ts`, doctrine pins, posthog) were modified.
- Full PR diff vs branch root: 13 files (1 migration + schema + 6 source/module + 5 spec). The composite-unique migration is the PR's first migration (anticipated by the R1 report's P2-2 note).
- **Build/test state:** this audit ran against a sparse/mirror checkout with no `node_modules`, so `tsc --noEmit` and `npm test` were NOT re-executed locally. Code/spec consistency was verified statically. CI gates (`build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`) remain the operator's green-before-merge responsibility per the fixer brief.
- This was a **read-only** audit. No backend code was written or pushed. Report persisted to `/tmp/TM-5-re-audit-A-746c0a09.md` and to the context repo at `handoffs/audit-reports/TM-5-re-audit-A-746c0a09.md`.

---

## COMMIT IDENTITY (R74) — fixer commits verified

The 3 fixer commits (`2c6af1c`, `96bed50`, `746c0a0`) are each authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>` with no AI/Claude/Computer/Agent/co-author attribution in subjects. (This auditor's own report commit is likewise authored as Bradley Gleave per R74.)
