# TM-5 Audit — Lens A (EXHAUSTIVE adversarial auditor)

- **PR:** #435 — feat: TM-5 apply funnel + pre-coach account + applicant profile
- **SHA audited:** c7298ae101906e431cde248f5e1e7560b4b645a1
- **Branch:** feat/tm-5-apply-precoach
- **Base (main):** d04f0c7c21a3e6bcf19e00b762701fc6f71573b8
- **Audited:** 2026-06-18T (UTC) — Lens A, first audit of TM-5
- **Lens:** A — exhaustive adversarial; find EVERY finding at EVERY severity. PII / operator-sign-off gate PR: extra adversarial on PII, RLS, consent.

---

## VERDICT

**VERDICT: FINDINGS_PRESENT (P0/P1/P2/P3 = 0/0/2/3)**

---

## COUNTS

| Severity | Count |
|----------|-------|
| P0 (blocker) | 0 |
| P1 (must-fix before merge) | 0 |
| P2 (should-fix) | 2 |
| P3 (nice-to-fix / polish) | 3 |

---

## FINDINGS

### P2-1 — `NotFoundException`/`ConflictException` bodies use `{ kind: … }`, silently dropped by the HTTP envelope (no machine-readable code reaches the client)

**Where:** `src/talent-marketplace/apply.service.ts` — 6 sites:
- L65 `throw new NotFoundException({ kind: 'job_listing_not_found' })`
- L90 `throw new ConflictException({ kind: 'apply_in_flight' })`
- L127 `throw new NotFoundException({ kind: 'applicant_not_found' })`
- L141 `throw new NotFoundException({ kind: 'applicant_not_found' })`
- L317 `throw new ConflictException({ kind: 'apply_conflict' })`
- L328 `throw new ConflictException({ kind: 'apply_replay_corrupt' })`

**Why it matters:** The global `HttpExceptionFilter` (`src/filters/http-exception.filter.ts` L43–48) reads **only** `message`, `error`, and `code` off the exception body. The `kind` key is never read, so it is dropped from the serialized response. Every one of these errors therefore goes to the wire as a generic envelope:

```json
{ "statusCode": 404, "message": "Not Found", "error": "Not Found", ... }
```

The machine-readable discriminator the service author intended (`job_listing_not_found`, `apply_in_flight`, …) never reaches the mobile (TM-M5 ApplyFlow) / web (TM-W5) clients. Those clients cannot distinguish "listing gone" from "applicant profile missing" from "submit in-flight, retry" — the in-flight ConflictException (L90) is specifically meant to be a *retryable* signal, and the client has no programmatic way to detect it. The filter already supports the correct contract via the `code` field (used elsewhere, e.g. `invite_code_invalid_format`).

This is the **same defect class** flagged on TM-3 (B-CYCLE-P2-1: 404 drops `kind`). It recurs here at 6 sites. The controller spec only asserts the *service-layer* exception body (`apply.controller.spec.ts` L170 region / `apply.service.spec.ts`), never the HTTP wire envelope, so the gap is untested.

**Fix:** Replace `{ kind: X }` with `{ error: <human>, message: <human>, code: X }` (or at minimum add `code`) at all 6 sites, and add one HTTP-envelope assertion (E2E or filter-level) pinning that `code` survives serialization for at least the `apply_in_flight` retryable case. Severity P2: degrades client error-handling contract on a luxury-doctrine "definitive confirmation" funnel, but no data leak and the funnel still functions.

---

### P2-2 — No `(applicant_user_id, listing_id)` uniqueness: distinct client-supplied idempotency keys can create duplicate Applications for the same (account, listing)

**Where:** `src/talent-marketplace/apply.service.ts` L75–77 (default key) + L249 (`idempotency_key: \`${idempotencyKey}:application\``); `prisma/schema.prisma` `model Application` L6582–6602 (only `idempotency_key String? @unique`; **no** `@@unique([applicant_user_id, listing_id])`).

**Why it matters:** Dedup is enforced solely through the idempotency ledger keyed on `idempotencyKey`. When the client omits `idempotency_key`, the server defaults to `apply:${account.id}:${listing.id}` (L76–77), so a naive double-tap correctly replays. **But** `ApplyDto.idempotency_key` is a free, client-controlled string (`apply.dto.ts` L89–92). A client (or a buggy retry layer that regenerates a UUID per attempt) that sends two *different* explicit keys for the same account+listing will pass `claimOrReplay` twice (two distinct ledger rows), and `runApply` will `create` two `Application` rows — both valid, both pointing at the same applicant+listing. The global `@unique` on `idempotency_key` does **not** prevent this because the two keys differ. There is no DB backstop.

The applicant's "my applications" list and the hirer's inbox would then show duplicate submissions for one listing. For an apply funnel this is a realistic duplicate-submission vector under flaky-network retry libraries that mint a fresh key per attempt.

**Fix:** Add a `@@unique([applicant_user_id, listing_id])` to `Application` (with the accompanying migration — note this PR ships no migration, see SHA STABILITY), and catch its P2002 in `apply()` to route into the existing `recoverConfirmation` idempotent path (the catch at L109–115 already handles P2002 for the idempotency_key constraint; broaden it to the composite). Severity P2: requires an atypical client (distinct keys per retry) to trigger, owner-scoped (no cross-user impact), and the existing default-key path is safe — but it is a real duplicate-write gap with no DB guard.

---

### P3-1 — Keyset cursor is plain (unsigned) base64url; TM-3 signs the equivalent cursor with HMAC

**Where:** `src/talent-marketplace/application-cursor.ts` — `buildTupleCursor`/`parseTupleCursor` encode `${created_at}|${id}` as plain base64url with no integrity tag. (TM-3's `public-listing.cursor.ts` HMAC-signs the analogous tuple.)

**Why it matters:** The cursor is consumed by `myApplications` (`apply.service.ts` L162–198), which is **owner-scoped** (`where.applicant_user_id = caller`) and JWT-gated. A forged/tampered cursor only shifts the caller's *own* page boundary within their own rows; `parseTupleCursor` degrades malformed input to `null` → page 1 (verified by `application-cursor.spec.ts` L41–69). So there is **no IDOR / cross-tenant** exposure and no integrity risk to other users' data. The file's own header comment (L6–9) already flags it as an inline copy to be hoisted onto the shared signed module once TM-3 lands. Worth noting because (a) it is inconsistent with the TM-3 signed-cursor doctrine, and (b) once hoisted, the apply path should inherit signing for free. P3: consistency / future-dedup, not a security hole given owner-scope.

**Fix:** None required for merge given owner-scope; track the hoist-and-sign on TM-3 landing (the comment already does). If the team wants uniformity now, switch to the signed helper.

---

### P3-2 — Anonymous apply mints a real `User` row (role `student`) for any unverified email; abuse control is solely the anti-bot gate

**Where:** `src/talent-marketplace/apply.service.ts` `resolveAccount` L263–299 — creates a `User` with `supabase_id: precoach:${sha256(email)}`, `role: 'student'`, from an **unverified** body email on the `@Public()` apply route (`apply.controller.ts` L56–66).

**Why it matters:** The apply funnel is deliberately anonymous (correct per the luxury 3-taps doctrine) and is gated by `@AntiBotGate(ANTI_BOT_SURFACES.Apply) + AntiBotGuard` (the documented abuse control — `anti-bot.guard.ts`). However, account creation happens on an **unverified** email: anyone can cause a pre-coach `User` + `Applicant` row to be minted for an email address they do not own (subject to anti-bot rate/identity limits). Consequences to weigh on the PII/consent gate:
- A pre-coach account is squatted on a victim's email before they sign up; TM-12 auto-flip later links a real Supabase identity to a row created by a third party.
- The minted `User.email` is `@unique` (schema L157), so a squat could block or interfere with the legitimate owner's later signup flow (depends on TM-12 link semantics — out of this PR's scope but worth a sign-off note).

The email is **never logged** (PII hygiene verified — see checklist #2), the confirmation payload leaks no PII back to the anonymous caller (verified — checklist #4), and the supabase_id is a hashed placeholder, so this is not a data-leak. It is a **consent / account-provenance** consideration for the operator sign-off, not a code defect. P3: anti-bot is the agreed control; flag for explicit operator acknowledgement that unverified-email account-minting is accepted for the pre-coach funnel, and confirm TM-12 link semantics don't trust the pre-existing row's identity.

**Fix:** No code change mandated. Recommend the PII/operator sign-off explicitly records "anonymous apply mints unverified-email pre-coach accounts, gated by anti-bot; TM-12 link must re-verify identity." Optionally add a verification/claim step at TM-12 rather than here.

---

### P3-3 — `updateOwnProfile` passes `headline`/`bio`/array fields straight through without trim; partial inconsistency with name-field trimming

**Where:** `src/talent-marketplace/apply.service.ts` `updateOwnProfile` L143–157 — `first_name`/`last_name` are `.trim()`'d (L144–145) but `headline`, `bio`, `specialties`, `certifications`, `sample_program_url` are assigned verbatim (L146–151). `runApply` likewise trims only names (L229–230).

**Why it matters:** Purely cosmetic data-hygiene inconsistency: a profile update can store `"  Strength  "` headline / untrimmed specialties while names are normalized. No security, PII, or correctness impact — DTO length bounds (`apply.dto.ts`) still apply. The `apply.service.spec.ts` "only provided fields are written, trimmed" test (L156) only asserts the name case, so untrimmed free-text is unpinned. P3: consistency polish.

**Fix:** Either trim all free-text string fields consistently or document that only identity names are normalized. Low priority.

---

## VERIFICATION CHECKLIST (12 items)

1. **Roles on every route.** PASS. `apply.controller.ts`: `applyToListing` is `@Public()` + `@AntiBotGate(Apply)` + `@UseGuards(AntiBotGuard)` (anonymous-by-design, correct). `getMyProfile` / `updateMyProfile` / `myApplications` each `@Roles('student')` + `@UseGuards(JwtAuthGuard)`. None carry coach/owner roles. Global `APP_GUARD` order (app.module L392–429): JwtAuthGuard → UserThrottlerGuard → RLS interceptor → RolesGuard; JwtAuthGuard short-circuits on `@Public()`. Satisfies the roles-enforced doctrine pin (`@Public` is an accepted branch).

2. **Profile PII / no raw-entity leak + no PII in logs.** PASS. All responses go through allow-list mappers `toProfile`/`toCard`/`toConfirmation` (apply.service L334–382); no raw `Applicant`/`Application`/`User` is spread. Email/names echoed only to the owner via `toProfile`. No `console.*` / logger call emits email anywhere in TM-5 files; `apply.service.spec.ts` L340–391 pins console.log/error/warn never contain the email on the happy path. PASS.

3. **Response shapes (allow-list DTOs).** PASS. `apply.dto.ts` response interfaces are explicit allow-lists. `apply.service.spec.ts` L114–129 (profile key-set), L185–187 (card key-set: no hirer_id/applicant_user_id/email), L263–276 (confirmation key-set + negative scan for `jo@example.com` / `hirer-1`) lock the shapes positively and negatively.

4. **applyToListing idempotency / race.** PASS (with P2-2 caveat). claimOrReplay outcomes handled: replay → `fromLedger` (no re-create, pinned L223–276), in_flight → ConflictException (L88–91, tested L278–303), claimed → runApply. P2002 on Application.idempotency_key → releaseClaim + `recoverConfirmation` (L106–119). markCompleted conflict → recover (L100–104). Default key namespaced per (account, listing) `apply:user:listing` (tested L305–337). **Gap:** distinct client keys bypass dedup — see **P2-2**.

5. **Anonymous confirmation contract.** PASS. `toConfirmation`/`fromLedger` return exactly `{application_id, applicant_id, account_id, status, fit, confirmation}` — no applicant email/name, no hirer identity. Pinned positively + negatively in `apply.service.spec.ts` L263–276. Never an empty 200 (201 + full payload).

6. **Fit scoring — no protected attributes.** PASS. `apply-fit.ts` `computeFitSignal` is pure/deterministic and consumes ONLY `applicantSpecialties`, `listingSpecialty`, `listingCompensationType`. No age/gender/ethnicity/name/email. Blend documented (`0.7*specialty + 0.3*comp`), thresholds 67/34, integer-clamped 0–100. `apply-fit.spec.ts` pins determinism, axis ranking, output contract. `fitFromScore` mirrors thresholds for replay/list parity.

7. **Migration present + date > 20261220000020 + RLS.** N/A at this SHA — **TM-5 ships NO migration** (10 files changed, none under `prisma/migrations/`). The `Applicant`/`Application` models and their RLS policies already exist on `main` (`prisma/schema.prisma` + `migrations/20261220000000_talent_marketplace_rls`). The brief's "migration date > …" expectation does not apply to this PR. See **P2-2** for the one schema change that *should* accompany a future fix.

8. **RLS on applications.** PASS (inherited from main, verified present). Application RLS: applicant reads/writes own (`applicant_user_id = app.current_user_id()`), hirer reads its listing's apps (`hirer_id`), anon → zero rows, service_role bypass. MarketplaceMutationIdempotency: RESTRICTIVE deny-all to anon+authenticated, service_role only. Service-layer owner-scope (`where: { user_id }` / `applicant_user_id`) is defense-in-depth on top.

9. **Cursor PII discipline.** PASS (with P3-1 note). Cursor carries only `(created_at, id)` — no PII. Opaque base64url; `application-cursor.spec.ts` L24–31 asserts no raw timestamp/id visible. Owner-scoped consumer → no IDOR. Unsigned vs TM-3's HMAC — **P3-1** (consistency only).

10. **Banned tokens grep.** PASS — EMPTY. No `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `"Coming soon"` in any TM-5 diff file. (Note: `http-exception.filter.ts` contains an `as any`-style cast but is pre-existing on main, **not** in the TM-5 diff.) Ledger JSON is validated field-by-field (`parseLedgerConfirmation`/`parseLedgerFit`/`parseLedgerCopy`) instead of casting — good.

11. **Doctrine pins green.** PASS. No doctrine-pin files modified (FlagOff, roles-enforced, posthog-event-names, quietLuxuryDoctrine). The apply route satisfies roles-enforced via `@Public()`. Luxury doctrine respected: one primary fit chip (not a scorecard), definitive confirmation payload, minimum-field apply (Hick's law).

12. **PostHog events.** PASS — NONE. No posthog/capture/track calls in any TM-5 file; nothing to reconcile against posthog-event-names pin.

---

## SHA STABILITY

- Audited tree pinned at HEAD `c7298ae101906e431cde248f5e1e7560b4b645a1` (branch `feat/tm-5-apply-precoach`); base `main` `d04f0c7c21a3e6bcf19e00b762701fc6f71573b8`.
- Diff scope: 10 files (3 source + 1 module + 6 spec), **no migration**, no doctrine-pin edits.
- `Applicant`/`Application` schema models and RLS policies are pre-existing on `main` at this SHA; this PR adds application logic only. Any fix for **P2-2** (composite unique) will introduce the PR's first migration and shift the SHA.
- Findings reference exact files+line numbers at this SHA; re-verify line numbers if the branch is rebased onto a newer `main`.
- This was a read-only audit. No backend code written or pushed. Report persisted to `/tmp/TM-5-audit-A-c7298ae1.md` and to the context repo at `handoffs/audit-reports/TM-5-audit-A-c7298ae1.md`.
