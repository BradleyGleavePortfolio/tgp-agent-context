# B5_DIGITAL_CONTRACTS_SPEC — Digital Contracts + E-Signatures at Checkout

> Standalone spec for inline, legally enforceable e-signatures at checkout for TGP coach packages. Source of truth for behavior; code references point at `growth-project-backend` (NestJS + Prisma) and the storefront/checkout frontend. Builder = Opus 4.8.
>
> **Status: signature stack NOT yet chosen by operator.** This spec presents three paths with explicit tradeoffs, recommends one as the v1 default, and keeps the other two as feature-flagged future options. See §1 (comparison), §2 (recommendation), §9 (open decisions).

---

## 0. One-line goal

Every coach package purchase that requires a contract (operator configures **per-package**) flows through an **inline e-signature step BEFORE Stripe checkout**, producing a **legally enforceable signed PDF** stored against the purchase row, accessible to both coach and client forever.

**Non-goals.**

- NOT a generic document-management system. Contracts are scoped to package purchases.
- NOT a CLM (contract lifecycle management) suite — no negotiation/redline rounds, no counter-party markup. One template → one signature request → one signed PDF.
- NO contract step for packages where the coach left `requires_contract = false`. Default behavior is unchanged for those.
- NO Stripe charge before a SIGNED envelope when a contract is required. The signature is a **hard gate** in front of checkout.

---

## 1. Three signature-stack options (side-by-side)

The operator has not yet picked a signature stack. The three viable paths:

|  | **DocuSign API** | **Dropbox Sign (HelloSign) API** | **Native canvas + server-generated PDF** |
|---|---|---|---|
| **Cost per envelope** | ~$0.50–2.00 | ~$0.25–1.50 | $0 (just storage) |
| **Legal weight** | ESIGN + UETA + eIDAS | ESIGN + UETA + eIDAS | ESIGN + UETA (US only, weaker for disputes) |
| **Audit trail** | Full court-admissible | Full court-admissible | Custom — we build it (IP, UA, timestamp, geo, signature image hash) |
| **Implementation effort** | 3–5 days (their SDK is great) | 2–4 days (cleanest API) | 5–8 days (we own everything) |
| **UX** | Redirect or embedded iframe | Embedded — best UX of the three | Fully native (best feel) |
| **Operator hard-cost @ 10k contracts/yr** | ~$15k | ~$8k | ~$0 |
| **Enterprise-credibility signal** | Highest | Medium | Lowest |

### 1.1 Reading the table

- **DocuSign** is the market-credibility leader and has the broadest international legal coverage, but it is the most expensive per envelope and carries the heaviest enterprise procurement baggage. Its value shows up specifically when a buyer is paying enough that "signed via DocuSign" is itself a trust signal (high-ticket coaching, $5k+ packages, corporate wellness buyers).
- **Dropbox Sign (HelloSign)** is the cleanest API of the three, the fastest to integrate, and offers the best embedded UX while still delivering full court-admissible audit trails and the same core legal frameworks (ESIGN + UETA + eIDAS). It sits at roughly half DocuSign's per-envelope cost.
- **Native canvas** is free at the margin (storage only) and gives the most control over feel and self-hosting, but the legal posture is materially weaker: ESIGN + UETA only (US-centric), and **we** become responsible for building and defending a court-admissible audit trail. In a real dispute, "we rolled our own" is a liability surface, not an asset.

### 1.2 The decision axis that matters most

For TGP's v1 buyer (individual coaches selling $200–$2,000 packages to individual clients), the binding constraints are: **(a)** legal enforceability that survives a dispute, **(b)** an embedded checkout UX with zero redirect friction, and **(c)** a per-envelope cost the operator can absorb at scale. HelloSign is the only option that scores well on all three simultaneously. DocuSign wins (a) and credibility but loses on cost; native canvas wins on cost but loses on (a) and dispute defensibility.

---

## 2. Recommendation

**Default v1 = Dropbox Sign (HelloSign) API — Embedded.**

HelloSign is the best balance of legal weight, cost, UX, and implementation effort. It delivers full ESIGN + UETA + eIDAS coverage with court-admissible audit trails (matching DocuSign on the legal axis that matters for disputes), at roughly half the per-envelope cost, with the cleanest API and the best embedded checkout UX of the three. The embedded plan (vs. plain HelloSign) is the chosen UX because the entire premise of this feature is an **inline** step before Stripe — a redirect would break the flow and depress conversion. The Embedded plan is ~30% more expensive per envelope; that delta is accepted as the cost of the inline experience (see §9 open decision).

**Native canvas = future fallback**, behind `FEATURE_CONTRACTS_NATIVE_CANVAS`, for operators who want self-hosting and a per-envelope cost of $0 at scale. We accept the weaker (US-only, self-built audit trail) legal posture as a deliberate cost/control tradeoff, NOT as the default.

**DocuSign = enterprise-tier upgrade**, behind `FEATURE_CONTRACTS_DOCUSIGN_PROVIDER`, flag-flipped for high-ticket coaching ($5k+ packages) where "signed via DocuSign" is itself a credibility signal and the broadest international legal coverage is worth the premium.

The provider is abstracted behind a single interface (§3.5) so all three paths share the same envelope state machine, the same Prisma models, the same checkout integration, and the same audit log. **Only the provider adapter changes between paths.** This is what makes the two future options cheap flag-flips rather than rewrites.

---

## 3. Backend module sketch

### 3.1 New module: `src/contracts/`

```
src/contracts/
  contract-template.service.ts        ContractTemplateService
  contract-envelope.service.ts        ContractEnvelopeService
  contract-envelope.controller.ts     ContractEnvelopeController (coach + client endpoints)
  webhooks/
    hellosign-webhook.controller.ts   POST /webhooks/hellosign
  providers/
    signature-provider.interface.ts   SignatureProvider (abstraction — §3.5)
    hellosign.provider.ts             v1 default
    docusign.provider.ts              future (flag-gated)
    native-canvas.provider.ts         future (flag-gated)
  contracts.module.ts
```

- **`ContractTemplateService`** — CRUD over `ContractTemplate`, version bump on edit, merge-field rendering, `test-render` against sample data.
- **`ContractEnvelopeService`** — creates envelopes, calls the active `SignatureProvider`, owns the envelope state machine (§3.6), writes the audit log, fires downstream events (allow-checkout / void-purchase).
- **`ContractEnvelopeController`** — coach-side template endpoints + client-side envelope endpoints (§3.3, §3.4).
- **`HelloSignWebhookController`** — verifies webhook signature, maps provider events → envelope state transitions, fires downstream events.

### 3.2 New Prisma models

```prisma
model ContractTemplate {
  id                   String   @id @default(cuid())
  coach_id             String
  name                 String
  body_markdown        String
  version              Int      @default(1)
  dynamic_fields_json  Json
  requires_signature   Boolean  @default(true)
  created_at           DateTime @default(now())

  coach     User               @relation(fields: [coach_id], references: [id])
  envelopes ContractEnvelope[]

  @@index([coach_id])
}

enum ContractEnvelopeStatus {
  DRAFT
  SENT
  VIEWED
  SIGNED
  DECLINED
  EXPIRED
}

model ContractEnvelope {
  id                  String                 @id @default(cuid())
  template_id         String
  template_version    Int                                   // locked at send time (§5.2)
  client_id           String
  coach_id            String
  purchase_id         String?                                // nullable — set after Stripe success
  status              ContractEnvelopeStatus @default(DRAFT)
  hellosign_request_id String?                               // provider request id (generic across providers)
  signed_pdf_url      String?
  ip                  String?
  user_agent          String?
  signed_at           DateTime?
  expires_at          DateTime?                              // default now()+7d at SENT
  created_at          DateTime               @default(now())

  template ContractTemplate     @relation(fields: [template_id], references: [id])
  client   User                 @relation("ClientEnvelopes", fields: [client_id], references: [id])
  coach    User                 @relation("CoachEnvelopes",  fields: [coach_id], references: [id])
  events   ContractAuditEvent[]

  @@index([client_id])
  @@index([coach_id])
  @@index([status])
}

model ContractAuditEvent {
  id          String   @id @default(cuid())
  envelope_id String
  actor_id    String?                          // null for system/provider-originated events
  action      String                           // VIEW | SIGN | DECLINE | SEND | EXPIRE | WEBHOOK
  ip          String?
  user_agent  String?
  created_at  DateTime @default(now())

  envelope ContractEnvelope @relation(fields: [envelope_id], references: [id])

  @@index([envelope_id])
}
```

> Note: the field is named `hellosign_request_id` per the operator spec, but it carries the **active provider's** request id regardless of provider (DocuSign envelope id / native canvas job id when those flags are on). Keep the column name for migration stability; treat it as a generic provider-request-id at the code layer.

### 3.3 Migration

- **2 new tables** (`ContractTemplate`, `ContractEnvelope`) + the audit table (`ContractAuditEvent`) introduced in §7.
- **No alters on existing tables EXCEPT** a single new **nullable** FK on `Purchase`:

```prisma
model Purchase {
  // ...existing fields unchanged...
  contract_envelope_id String?           @unique
  contract_envelope    ContractEnvelope? @relation(fields: [contract_envelope_id], references: [id])
}
```

- Nullable + `@unique` (one envelope ↔ one purchase). Backfill: none — existing purchases keep `null`. The migration is additive and reversible.

### 3.4 Coach-side endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/contracts/templates` | Create a template (starts at version 1). |
| `GET` | `/contracts/templates` | List the coach's templates (latest version of each). |
| `PUT` | `/contracts/templates/:id` | Edit → creates a **new version** (§5.2). |
| `POST` | `/contracts/templates/:id/test-render` | Render the template against sample merge-field data; returns preview HTML/PDF. No envelope created. |

All coach endpoints are `@Roles('coach')`-gated and ownership-checked (`coach_id` must match the authenticated coach — IDOR guard before any read/write).

### 3.5 Client-side endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/contracts/envelopes/:id` | Returns current envelope state + provider embed URL (HelloSign embedded signing URL). |
| `POST` | `/contracts/envelopes/:id/sign` | Server-to-server confirmation after the provider webhook (idempotent; the webhook is the source of truth, this is the client-acknowledged confirmation). |
| `POST` | `/contracts/envelopes/:id/decline` | Client declines → state → `DECLINED` → downstream void. |

Client endpoints are ownership-checked (`client_id` must match the authenticated client). The embed URL is minted fresh per request and is short-lived.

### 3.6 Provider abstraction (`SignatureProvider`)

```ts
interface SignatureProvider {
  createSignatureRequest(input: {
    envelopeId: string;
    renderedHtml: string;          // merge-field-resolved contract body
    client: { email: string; name: string };
    coach:  { email: string; name: string };
    expiresAt: Date;
  }): Promise<{ providerRequestId: string; embedUrl: string }>;

  fetchSignedPdf(providerRequestId: string): Promise<{ pdfBuffer: Buffer }>;

  verifyWebhook(req: RawRequest): boolean;  // signature verification
  parseWebhookEvent(req: RawRequest): { providerRequestId: string; event: 'VIEWED' | 'SIGNED' | 'DECLINED' };
}
```

- v1: `HelloSignProvider` is bound in `contracts.module.ts`.
- `FEATURE_CONTRACTS_DOCUSIGN_PROVIDER` → bind `DocuSignProvider` (enterprise tier).
- `FEATURE_CONTRACTS_NATIVE_CANVAS` → bind `NativeCanvasProvider` (renders contract + captures canvas signature image, server-generates the PDF, builds the audit trail itself).
- The envelope state machine, controllers, models, checkout integration, and audit log are **provider-agnostic** — only the bound adapter changes.

### 3.7 Envelope state machine

```
 DRAFT ──send──▶ SENT ──provider:view──▶ VIEWED ──provider:sign──▶ SIGNED ──▶ (allow Stripe checkout)
   │               │                        │
   │               │                        └──provider:decline──▶ DECLINED ──▶ (void purchase, no charge)
   │               │
   │               └──expires_at reached (cron)──▶ EXPIRED ──▶ (client may restart; coach notified)
   │
   └──(never sent; coach abandons)
```

- Transitions are **monotonic toward a terminal state**; `SIGNED`, `DECLINED`, `EXPIRED` are terminal. A new attempt after `EXPIRED`/`DECLINED` creates a **new** envelope, never resurrects the old one.
- The webhook (§3.8) is the authoritative source for `VIEWED`/`SIGNED`/`DECLINED`. The client-side `/sign` endpoint is a confirmation/UX accelerator, not the source of truth.

### 3.8 HelloSign webhook handler

`POST /webhooks/hellosign`:

1. **Verify signature** (mandatory — §7). Reject with 401 on failure; never trust an unverified webhook.
2. Look up envelope by `hellosign_request_id`.
3. Map provider event → envelope state transition (idempotent — replays are no-ops if already in the target terminal state).
4. On `SIGNED`: fetch the signed PDF via `fetchSignedPdf()`, store to S3 (§6.3), set `signed_pdf_url`, `signed_at`, `ip`, `user_agent`; fire **allow-checkout** event.
5. On `DECLINED`: fire **void-purchase** event (no Stripe charge).
6. Write a `ContractAuditEvent` (`action = WEBHOOK` + the resolved action) for every received webhook.
7. Respond `200` quickly; do heavy work (PDF fetch/store) async where possible, but the state transition itself must commit before responding.

---

## 4. Checkout integration flow

```
Coach configures package:  requires_contract = true,  contract_template_id = <id>   (storefront builder)
        │
        ▼
Client clicks "Buy"
        │
        ├── requires_contract == false ──▶ (existing flow) ──▶ Stripe Checkout
        │
        └── requires_contract == true
                │
                ▼
        Backend creates ContractEnvelope (DRAFT → SENT, template_version locked, expires_at = now()+7d)
                │  calls active SignatureProvider.createSignatureRequest()
                ▼
        Returns embed URL  ──▶  Client signs in embedded iframe
                │
                ▼
        Provider webhook fires  ──▶  envelope state → SIGNED
                │
                ▼
        Frontend polls envelope state OR listens via Supabase realtime
                │
                ├── SIGNED ──▶ proceed to Stripe Checkout
                │                     │
                │                     └── payment success ──▶ Purchase.contract_envelope_id = <id>
                │                                              signed PDF accessible to BOTH parties forever
                │
                ├── DECLINED ──▶ purchase voided, NO Stripe charge
                │
                └── EXPIRED (7-day default) ──▶ client can restart (new envelope); coach gets notification
```

### 4.1 Ordering guarantees

- **Contract before charge, always.** The contract step is a hard gate. There is no code path that reaches Stripe Checkout for a `requires_contract` package without a `SIGNED` envelope.
- **Webhook is authoritative for SIGNED.** The frontend may *observe* `SIGNED` via Supabase realtime or polling, but the transition to "allow checkout" is gated server-side on the verified webhook, not on a client claim.
- **Purchase linkage is post-payment.** `Purchase.contract_envelope_id` is set only after Stripe payment success, binding the signed PDF to the realized purchase. The envelope exists before the purchase row; the FK is set when both succeed.
- **DECLINED is a clean abort.** No Stripe PaymentIntent is created (or any created intent is canceled) — the client is never charged for a declined contract.

### 4.2 Realtime vs. polling

Frontend listens via **Supabase realtime** on the envelope row for low-latency `SIGNED`/`DECLINED` transitions, with a **polling fallback** (`GET /contracts/envelopes/:id`, ~3s interval) if the realtime channel drops. Both observe the same server-owned state; neither can advance it.

---

## 5. Contract template editor (coach side)

### 5.1 Merge-field tokens

Markdown editor with merge-field tokens resolved at render time:

| Token | Resolves to |
|---|---|
| `{{client.first_name}}` | Client given name |
| `{{client.last_name}}` | Client family name |
| `{{client.email}}` | Client email |
| `{{coach.first_name}}` | Coach given name |
| `{{coach.business_name}}` | Coach business / brand name |
| `{{package.name}}` | Package name |
| `{{package.price}}` | Package price (formatted, currency-aware) |
| `{{package.duration}}` | Package duration |
| `{{today}}` | Date of signing |
| `{{client.signature_block}}` | Client signature placeholder (provider-anchored) |
| `{{coach.signature_block}}` | Coach signature placeholder (provider-anchored) |

- Unknown tokens fail **loudly** in `test-render` (returned as an error list), never silently rendered as empty — a blank merge field in a legal document is a defect.
- `{{*.signature_block}}` tokens map to provider signature anchors (HelloSign text tags / DocuSign anchor strings / native-canvas capture regions) depending on the bound provider.

### 5.2 Template versioning

- Editing a template via `PUT /contracts/templates/:id` **creates a new version** (increments `version`); the prior version's body is retained.
- **Existing envelopes lock to the version they were sent under** (`ContractEnvelope.template_version`). A coach editing a template never alters a contract a client has already been sent or signed.
- The rendered, version-locked body is what is sent to the provider and what the signed PDF reflects.

### 5.3 Default template library

Three starter templates ship as a library:

1. **Standard Coaching Agreement** (1:1 coaching).
2. **Group Program Terms** (cohort / group offerings).
3. **Course Purchase Terms** (self-paced digital courses).

> **HARD BLOCKER FOR GO-LIVE:** the operator must have a **real lawyer** review and approve the wording of all three starter templates before launch. Shipping un-reviewed contract wording is not acceptable. This blocker is enforced operationally via the global feature flag (`FEATURE_CONTRACTS_ENABLED` stays OFF in prod until reviewed templates land — §8).

---

## 6. Legal + compliance posture

### 6.1 ESIGN Act (US) + UETA

US e-signature enforceability under the ESIGN Act and UETA requires four elements:

1. **Intent to sign** — the signer deliberately executes the signature.
2. **Consent to do business electronically** — an explicit click-to-consent before signing.
3. **Association with the record** — the signature is bound to the specific document.
4. **Record retention** — the signed record is retained and reproducible.

HelloSign satisfies all four. The **click-to-consent UX is documented explicitly**: before the embedded signing surface loads, the client sees a consent statement ("I agree to sign electronically and to do business electronically") with an affirmative checkbox/click that is itself logged to `ContractAuditEvent`. Intent (1) is captured by the deliberate signing action; association (3) by the provider binding the signature to the rendered document; retention (4) by §6.3.

### 6.2 eIDAS (EU)

- HelloSign supports **Advanced Electronic Signatures (AES)** on the Standard plan, which is the eIDAS tier appropriate for cross-border enforceability beyond "Simple" signatures.
- **EU-specific opt-in is documented**: for EU clients, the coach (or operator policy) selects **Advanced** vs **Simple** signature level. Advanced carries stronger identity-binding requirements and is the recommended setting for EU-jurisdiction contracts. This selection is surfaced at template/package config and recorded on the envelope.
- See §9: whether eIDAS Advanced is required for **v1** or deferred to **v1.1** is an open operator decision.

### 6.3 Retention

- Signed PDFs are stored on **S3** — the **same bucket as the GDPR export** path. **Dependency: BUG-R4 (PR pending)** wires that bucket; contract retention depends on it landing.
- **Minimum 7-year retention**, aligned to the typical state statute of limitations on contracts.
- **Both coach AND client can download the signed PDF anytime** via an authenticated, short-lived signed URL (§7).

### 6.4 GDPR

- A signed PDF **is personal data**.
- A GDPR deletion request triggers a **tombstone**, not a hard delete: the **PDF is retained for the legal statute-of-limitations period** (we have a competing legal obligation to retain it), while the **coach-side display is anonymized** (the envelope is shown as a redacted/anonymized record on the coach's side). Document this competing-obligation reconciliation in the privacy posture; do not silently hard-delete a legally retained contract, and do not silently ignore a deletion request.

---

## 7. Security

- **API key in env:** `HELLOSIGN_API_KEY`. **Rotate quarterly.** Never commit; never log. (DocuSign / native-canvas paths use their own env credentials behind the provider abstraction.)
- **Webhook signature verification is mandatory.** `POST /webhooks/hellosign` rejects any request whose signature does not verify (401). The webhook is authoritative for state — an unverified webhook must never move an envelope.
- **Signed-URL TTL on PDF downloads: 5 minutes.** Every download mints a fresh, expiring URL; no long-lived public links to signed contracts.
- **Audit log:** every **view, sign, decline** (and `SEND`, `EXPIRE`, `WEBHOOK`) writes a `ContractAuditEvent` row: `envelope_id`, `actor_id`, `action`, `ip`, `user_agent`, `timestamp`. This is the spine of dispute defensibility — especially critical if the native-canvas provider is ever enabled, since under that path the audit trail is **ours** to produce in court.

---

## 8. Feature flags

| Flag | Scope | Default | Purpose |
|---|---|---|---|
| `FEATURE_CONTRACTS_ENABLED` | Global gate | **OFF in prod** | Master switch. Stays OFF in prod until lawyer-reviewed templates land (§5.3 hard blocker). |
| `FEATURE_CONTRACTS_DOCUSIGN_PROVIDER` | Provider swap | OFF | Flag-flip to swap HelloSign → DocuSign for the enterprise tier (future). |
| `FEATURE_CONTRACTS_NATIVE_CANVAS` | Provider swap | OFF | Flag-flip to disable HelloSign + use our own canvas signature (future cost-reduction path). |

- `FEATURE_CONTRACTS_ENABLED` is the go-live gate and the operational enforcement of the lawyer-review blocker.
- The two provider flags are **mutually exclusive with the HelloSign default**; provider binding resolves in `contracts.module.ts` with a clear precedence (native-canvas > docusign > hellosign-default, or operator-defined) so exactly one adapter is active.

---

## 9. Open decisions for operator

1. **Final pick: HelloSign vs DocuSign for v1?** (Spec recommends HelloSign Embedded; DocuSign as enterprise-tier upgrade.)
2. **Lawyer-review budget + timeline for the 3 starter templates?** This is the go-live hard blocker (§5.3) — nothing ships in prod until this clears.
3. **Contracts required for ALL packages by default, or per-coach opt-in per package?** (Spec assumes per-package opt-in via `requires_contract`.)
4. **International (eIDAS Advanced) — required for v1 or v1.1?**
5. **HelloSign vs HelloSign Embedded plan?** Embedded is the better UX (and the basis of the inline-before-Stripe flow) but ~30% more expensive per envelope. (Spec recommends Embedded; flag the cost delta.)

---

## 10. Dependencies & sequencing

- **BUG-R4 (PR pending)** — S3 bucket for GDPR export, reused for signed-PDF retention (§6.3). Contract retention cannot ship before this lands.
- **Storefront builder** — must add `requires_contract` + `contract_template_id` to the package config surface (§4).
- **Stripe checkout** — must accept the contract gate (no charge path without a `SIGNED` envelope for `requires_contract` packages).
- **Supabase realtime** — envelope-row channel for the frontend `SIGNED`/`DECLINED` listener (§4.2).
- **Lawyer review of starter templates** — go-live hard blocker (§5.3, §9.2), enforced via `FEATURE_CONTRACTS_ENABLED` OFF in prod.

## 11. Doctrine

- Provider-agnostic by construction: models, controllers, state machine, checkout integration, and audit log do not know which provider is bound. Only the `SignatureProvider` adapter changes. This is what makes DocuSign and native-canvas cheap flag-flips, not rewrites.
- Contract-before-charge is a hard invariant, not a convention. No Stripe path exists for a `requires_contract` package without a `SIGNED` envelope.
- Webhook is the source of truth for envelope state; client claims never advance state.
- Audit everything. Every view/sign/decline is logged with IP + UA + timestamp — the dispute-defensibility spine.
- Do NOT ship un-reviewed contract wording. `FEATURE_CONTRACTS_ENABLED` stays OFF in prod until a lawyer signs off on the three starter templates.
