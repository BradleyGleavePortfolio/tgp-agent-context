# PR #375 Fixer Brief — B5 Digital Contracts R1 DIRTY Resolution

**You are the Opus 4.8 fixer (R31). The R1 auditor returned DIRTY with several CRITICAL operator-mandate failures. Fix in order; HECTACORN security stays priority.**

## Repo & branch
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Worktree: `/home/user/workspace/tgp/backend-b5-contracts` (builder's worktree; pull latest)
- Branch: `feature/b5-digital-contracts` (PR #375, head `3f35447`)
- Base: `main` @ `9322eeb`

## Read first
- Audit report: `/home/user/workspace/tgp/backend-b5-audit/AUDIT_R1_PR_375_REPORT.md`
- Original builder brief: `/home/user/workspace/B5_BUILDER_BRIEF.md`
- Spec: `/tmp/B5_SPEC.md`
- Deliverables summary: `/home/user/workspace/B5_DELIVERABLES_SUMMARY.md`

## REAL ISSUES TO FIX (priority order)

### Fix 1 — CRITICAL: `.env.example` operator-mandate flag default
Add to `.env.example`:
```
# B5 Digital Contracts — operator mandate: MUST remain false in prod until counsel review
FEATURE_CONTRACTS_ENABLED=false

# HelloSign / Dropbox Sign (only used when FEATURE_CONTRACTS_ENABLED=true)
HELLOSIGN_API_KEY=
HELLOSIGN_CLIENT_ID=
HELLOSIGN_TEST_MODE=true
```
This is non-negotiable per operator decision. The server-side invariant is already enforced; this is the launch-posture default.

### Fix 2 — HECTACORN: RLS on contracts tables
The 3 new contracts tables (`ContractTemplate`, `ContractEnvelope`, `ContractEnvelopeEvent` — verify exact names in migration) need RLS policies to prevent IDOR/cross-tenant reads.

Add a NEW migration `prisma/migrations/20261215000200_contracts_rls/migration.sql` (additive — RLS DDL only, no schema changes):

```sql
-- Enable + force RLS on contracts tables
ALTER TABLE "ContractTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContractTemplate" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ContractEnvelope" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContractEnvelope" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ContractEnvelopeEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContractEnvelopeEvent" FORCE ROW LEVEL SECURITY;
```

Then write policies:
- **`ContractTemplate`**:
  - Coach can SELECT/INSERT/UPDATE own templates (`coach_id = app.current_user_id()`).
  - System templates (`coach_id IS NULL` or platform-owned) readable by all authenticated.
  - anon: zero.
  - service_role: bypass.
- **`ContractEnvelope`**:
  - Coach can SELECT/INSERT/UPDATE envelopes where `coach_id = app.current_user_id()`.
  - Client can SELECT envelopes where `client_id = app.current_user_id()`.
  - Sub-coach: SELECT only envelopes where the related package belongs to their tenant scope (use existing sub-coach helper).
  - anon: zero.
  - service_role: bypass.
- **`ContractEnvelopeEvent`**:
  - Owner-of-envelope SELECT only.
  - INSERT only via SECURITY DEFINER helper (webhook handler runs as service_role; tests bypass).
  - anon: zero.

Use the existing harness pattern from `test/rls-tier3-workouts-policies.spec.ts` and the MWB-1 finisher's `test/rls-mwb1-workout-builder-policies.spec.ts`. Write a spec `test/rls-b5-contracts-policies.spec.ts` covering:
- Coach owner read/write
- Client read of own envelope
- Sub-coach scoped read
- Cross-coach denial (IDOR)
- anon zero-access
- service_role bypass

Run with: `RLS_FN_TEST_DATABASE_URL=postgresql://rls_tester:rls_tester_pw@localhost:5432/rls_fn_test ./node_modules/.bin/jest test/rls-b5-contracts-policies.spec.ts --runInBand`

If schema USAGE grant is missing: `psql "$RLS_FN_TEST_DATABASE_URL" -c "GRANT USAGE ON SCHEMA app TO anon, app_authenticated, service_role;"`

Expect all assertions to pass. If you cannot get the RLS test DB up in budget, write the spec + migration anyway; document in PR comment that the spec was added but full verification awaits CI.

### Fix 3 — HelloSign HMAC scheme verification
Check current Dropbox Sign API docs (v3.x with `@dropbox/sign` SDK ^1.8.0) for the canonical webhook verification scheme:
- If docs confirm `event_hash` over `${event_time}${event_type}` with `api_key` (HelloSign's historical pattern), keep the current impl AND add a brief code comment citing the doc URL.
- If docs require raw-body HMAC: refactor `HelloSignProvider.verifyWebhook()` to compute HMAC over `ProviderWebhookRequest.rawBody`. Update tests accordingly.

Also: confirm or rename `embedUrlForSignature` → `createEmbeddedSignUrl` to match the spec phrasing, OR leave private and add a public method with the spec name that delegates. Pick the lighter change.

### Fix 4 — Disclaimer wording verbatim
The 4 contract template frontmatter disclaimers MUST be byte-identical to the seed migration header disclaimer text. Pick ONE canonical wording and propagate. Use the operator's locked text:

```
Draft wording prepared by an automated agent WITHOUT licensed legal review. FEATURE_CONTRACTS_ENABLED MUST remain OFF in production until reviewed by counsel.
```

Update the seed migration `prisma/migrations/20261215000100_seed_b5_contract_templates/migration.sql` header comment to match the template frontmatter exactly.

### Fix 5 — Migration grep self-trigger
The migration comment `-- ADDITIVE-ONLY migration. ZERO DROP / RENAME / ALTER COLUMN TYPE.` triggers the audit grep. Rewrite the comment to avoid the trigger tokens:
```
-- Additive-only migration. No destructive operations performed.
```

### Fix 6 — Hosted checkout `contract_envelope_id` linkage
`createCheckoutForClient()` runs the gate but doesn't carry `contract_envelope_id` into `ClientPurchase`. `createPaymentIntentForClient()` does. Mirror the PaymentIntent path: after the contract gate returns `{ ok: true, envelopeId }`, bind that to the `ClientPurchase` created/upserted in the hosted-checkout path. Add a test asserting the linkage in `test/checkout/...`.

### Fix 7 — Platform waiver 8th source
Audit says 7 URLs in `platform-waiver-v1.md`; brief expected 8. Add ONE additional cited legal source (e.g., a relevant US state consumer-protection statute or a fitness/wellness liability case citation). Use deep research; the source must be a real, accessible URL.

## OUT OF SCOPE (do NOT change)
- `src/notifications/notification-kind.ts` additions for contract events — legitimate
- `scripts/gen-b5-seed-migration.ts` + `scripts/patch-lock-dropbox-sign.py` — legitimate seed helpers
- `test/checkout-buyer-drops.spec.ts`, `test/checkout.service.spec.ts` — legitimate
- The `requires_contract` vs `contract_required` field name — keep `requires_contract` (already implemented); update the spec comment only

## Process
1. Pull branch latest.
2. Apply fixes in order: 1 → 2 → 5 → 4 → 6 → 3 → 7
3. Run focused lanes:
   - `./node_modules/.bin/jest test/contracts --runInBand` → expect ≥31 + new RLS spec
   - `./node_modules/.bin/jest test/checkout --runInBand` → expect 131+ with new hosted-checkout linkage test
   - `./node_modules/.bin/jest test/dunning test/entitlement --runInBand` → no regression
4. `./node_modules/.bin/tsc --noEmit` → 0
5. Commit per-fix, title-only, author `Dynasia G <dynasia@trygrowthproject.com>`. Suggested:
   - `chore(contracts): add FEATURE_CONTRACTS_ENABLED + HelloSign keys to .env.example (off default)`
   - `feat(contracts): RLS policies for contract tables + sub-coach scoped reads`
   - `test(contracts): RLS spec covers owner/client/sub-coach/anon/service_role`
   - `chore(contracts): rewrite migration comment to avoid destructive-token grep collision`
   - `chore(contracts): unify disclaimer wording across templates and seed migration`
   - `feat(checkout): bind contract_envelope_id to hosted-checkout ClientPurchase`
   - `docs(contracts): cite Dropbox Sign webhook HMAC scheme + verify HelloSignProvider`
   - `docs(contracts): add 8th cited source to platform-waiver-v1`
6. Push, comment on PR #375, journal entry.

## Hard rules
- Opus 4.8 runtime (Sonnet 4.6 forbidden).
- Title-only commits, author Dynasia G.
- Force-push `--force-with-lease`.
- `api_credentials=["github"]` for gh.
- Use `./node_modules/.bin/prisma` v6, `migrate diff` only.

End with: head SHA + PR comment URL + status: FIXED_READY_FOR_RE_AUDIT | PARTIAL_NEED_GUIDANCE.
