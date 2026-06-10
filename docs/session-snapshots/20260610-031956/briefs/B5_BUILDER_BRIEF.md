# B5 — Digital Contracts + E-Signatures (HelloSign Embedded)

**Builder model:** Opus 4.8
**Worktree:** `/home/user/workspace/tgp/backend-b5-contracts`
**Branch:** `feature/b5-digital-contracts`
**Base:** `origin/main` at `9322eeb`

## Operator-locked decisions (do NOT re-debate)
1. Provider = **HelloSign** (Dropbox Sign) — Embedded plan (inline iframe, no redirect)
2. **Two-layer contract scope:**
   - **Layer 1 — Platform Liability Waiver (TGP ↔ Client):** REQUIRED for every client. Signed once at first purchase or onboarding. Covers: TGP is a marketplace platform, not a coaching provider; TGP not liable for coach actions, content, results, injuries, refunds, medical advice. Client acknowledges they're contracting directly with the coach for services.
   - **Layer 2 — Coach Service Agreement (Coach ↔ Client):** OPT-IN per package by the coach. Uses one of 3 starter templates: Standard Coaching, Group Program, Course Purchase.
3. eIDAS Advanced (EU stronger tier) — **defer to v1.1**. v1 ships ESIGN + UETA (US) + eIDAS Simple.
4. **Lawyer review:** none yet. YOU draft all 4 contracts (Layer 1 waiver + 3 Layer 2 templates) using deep live web research. `FEATURE_CONTRACTS_ENABLED` MUST default OFF in prod and BE WIRED AS A CODE-LEVEL INVARIANT (server refuses to send any envelope when OFF, regardless of caller).
5. Per-package opt-in via `Package.requires_contract` boolean + `contract_template_id` FK.

## Mission
Implement B5 backend per `strategy/B5_DIGITAL_CONTRACTS_SPEC.md` from the `spec/b5-digital-contracts` branch of `tgp-agent-context`. The spec is your source of truth. Read it first.

## Read FIRST — ground truth (in order)
1. `/tmp/B5_SPEC.md` (already saved locally — read the whole thing, all 412 lines)
2. `src/checkout/*` to understand the existing Stripe checkout path you must gate before
3. `prisma/schema.prisma` lines around `Purchase`, `Package`, `User`
4. `src/notifications/notification-kind.ts` — add new kinds for contract events
5. `src/community/notifications/community-notifications.service.ts` for the in-app notification wiring pattern

## Scope (this PR)
### A. Backend module `src/contracts/`
Per spec §3.1:
- `ContractTemplateService` — CRUD over `ContractTemplate`, version bump on edit, merge-field rendering, `test-render` against sample data
- `ContractEnvelopeService` — creates envelopes, owns state machine, writes audit log, fires allow-checkout / void-purchase events
- `ContractEnvelopeController` — coach + client endpoints per §3.4 & §3.5
- `webhooks/hellosign-webhook.controller.ts` — POST `/webhooks/hellosign` with mandatory signature verification (401 on fail)
- `providers/signature-provider.interface.ts` — abstraction per §3.6
- `providers/hellosign.provider.ts` — v1 default adapter (Embedded plan)
- `providers/docusign.provider.ts` + `providers/native-canvas.provider.ts` — STUB implementations only, throw `NotImplementedException`. Flag-gated for future use; NOT wired now.

### B. Prisma models (additive only) per spec §3.2
- `ContractTemplate`, `ContractEnvelope`, `ContractAuditEvent`, enum `ContractEnvelopeStatus`
- ONE new nullable `@unique` FK on `Purchase`: `contract_envelope_id`
- ZERO alters on other existing tables

### C. Two-layer wiring
- **Layer 1 (Platform Waiver) implementation:**
  - On client signup OR first purchase attempt: backend creates a `PLATFORM_WAIVER` envelope using the platform-owned `ContractTemplate` (special `coach_id = NULL` is INVALID — instead seed a TGP "system coach" user OR add an `is_platform` boolean on `ContractTemplate` — your call, document choice in commit msg)
  - Platform waiver MUST be `SIGNED` before any first purchase can complete
  - Idempotent: a client who already signed v1 of the waiver does NOT re-sign on every purchase
  - Versioned: if the waiver template version bumps, NEW clients see v2; existing signed clients are grandfathered to their signed version (a future migration prompt is out of scope for now)
- **Layer 2 (Coach Service Agreement):**
  - Add `Package.requires_contract Boolean @default(false)` and `Package.contract_template_id String?` columns (additive, nullable)
  - When `requires_contract = true` AND template id present: backend creates a `ContractEnvelope` AFTER platform-waiver gate clears, BEFORE Stripe PaymentIntent creation
  - Stripe checkout is HARD-BLOCKED until `SIGNED`

### D. Contract drafting (4 contracts)
Use **deep live web research** to draft the strongest, plainest-English contract wording for each. Cite at least 5 authoritative legal sources per contract in commit message / draft notes. The 4 contracts:

1. **Platform Liability Waiver (TGP ↔ Client)** — covers ESIGN + UETA basics, platform-not-provider posture, no medical/legal/financial advice, refund disclaimers, dispute resolution clause (arbitration in TGP's jurisdiction), DMCA & content liability shield, governing law.
2. **Standard Coaching Agreement** (1:1) — coach-to-client service contract template; cancellation, refund policy, scope of services, IP, confidentiality, no medical advice.
3. **Group Program Terms** — cohort/group-coaching version of #2; group dynamics, individual responsibility, no peer-liability.
4. **Course Purchase Terms** — self-paced digital course; revocation rights, no refunds after access granted, license to content (not ownership), DMCA.

Store the drafts as **Markdown files** in `src/contracts/templates/seed/` (e.g. `platform-waiver-v1.md`, `standard-coaching-v1.md`). On migration run, seed them into `ContractTemplate` rows. Each contract MUST include `{{*.signature_block}}` merge anchors per spec §5.1.

**Disclaimer in the migration seeder commit message:** "Draft wording prepared by agent without licensed legal review. `FEATURE_CONTRACTS_ENABLED` MUST remain OFF in prod until reviewed by counsel."

### E. Code-level invariant: `FEATURE_CONTRACTS_ENABLED`
- Default OFF in all envs except dev/test
- `ContractEnvelopeService.createEnvelope()` MUST throw `ServiceUnavailableException('Contracts disabled')` when flag OFF
- Webhook handler MUST refuse to process events when flag OFF (200 ack, no state mutation)
- Tests verify both behaviors

### F. Telemetry (PostHog)
New events:
- `contract.envelope.created`
- `contract.envelope.viewed`
- `contract.envelope.signed`
- `contract.envelope.declined`
- `contract.envelope.expired`
- `contract.checkout.blocked` (when client tries Stripe without signed envelope)
- `contract.checkout.gate.cleared`

## Hard constraints
- **Additive migration only.** Zero DROP/RENAME/ALTER COLUMN TYPE.
- **Webhook signature verification mandatory.** No state advancement on unverified webhook (401).
- **Signed PDF URLs are 5-min signed URLs.** No long-lived public links.
- **No Stripe PaymentIntent code path exists for a `requires_contract` package without `SIGNED` envelope** — invariant proven by an integration test.
- **Sonnet 4.6 FORBIDDEN as agent runtime.**

## Hard gates (R66 — full-suite-before-PR)
1. `npx tsc --noEmit` exits 0
2. New migration runs clean and is additive-only
3. Full non-RLS/non-OpenAPI Jest lane passes
4. New tests cover: provider abstraction, envelope state machine (all transitions), webhook signature verification (verified + reject), two-layer gate (platform waiver before coach contract before Stripe), idempotency on re-signed waiver, `FEATURE_CONTRACTS_ENABLED=OFF` refuses all writes
5. v1 dunning 26/26 lane stays green
6. Entitlement pins 17/17 lane stays green
7. R70 fail-fast lane if present

## Workflow
1. Read spec + existing checkout code first
2. Schema migration + Prisma models
3. Provider abstraction + HelloSign adapter (use the official `@dropbox/sign` npm package — add to deps; **AWS-SDK approach approved by operator as core dep, follow the same precedent here**)
4. Service + controller + webhook
5. Two-layer wiring at checkout
6. Draft the 4 contracts with deep research — cite sources in each .md file's frontmatter
7. Seeder + flag invariants
8. Tests
9. Commit title-only, push every commit (R64)
10. PR titled `feat(contracts): B5 digital contracts + HelloSign Embedded (FEATURE_CONTRACTS_ENABLED off)` against `growth-project-backend` main
11. Journal entry in `dispatch.json`

## Anti-scope (do NOT do)
- Mobile UI for the embedded iframe (separate PR)
- Web app embedding (Tier 5)
- eIDAS Advanced (v1.1)
- DocuSign or native-canvas live wiring (stub interfaces only)
- Lawyer-review tooling (operator owns offline)
- Anything outside `src/contracts/**`, `prisma/`, and the minimum required checkout-gate edits

## Deliverables (final message)
- Branch + final commit SHA(s)
- PR URL
- Test counts
- Migration SQL path
- 4 contract draft paths + citation list
- Confirmation `FEATURE_CONTRACTS_ENABLED` defaults OFF and is enforced server-side
- Token usage
