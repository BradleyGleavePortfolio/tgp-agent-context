# D-H6-6 (REVISED v2 — zero-cost) — Write-path PII representation in audit_log

**Status:** OPEN (operator decision required)
**Doctrine cite:** R-META-1 (first-principles), R-META-2 (hyperscaler research + metaphor), **R-META-3 (zero-cost / free-tier default)**, D-H6-1 (audit_log immutability), D-H6-4 (GDPR Art. 17)
**Supersedes:** D-H6-6 v1 (KMS-based; violates R-META-3)

---

## The metaphor (unchanged)

> **A bank security camera films everything in the lobby forever, but the customer's name is never written on the footage — only their account number, which the bank can later unlink from any real identity.**

The audit log is the camera footage. The "name" is the PII. The "account number" is the token. Erasure = unlinking the token from any way to recover the name.

## The first-principles question (unchanged)

**Do we need PII in `before_state` / `after_state`?** No. We need enough to prove what changed. Write a token at ingestion. The link from token → identity lives in a SEPARATE structure we can break.

## What hyperscalers actually do (unchanged from v1; cited)

| Vendor | Strategy | Free for us? |
|---|---|---|
| **AWS CloudTrail** | Redact PII at write — "best protection is to not log it" ([AWS Docs](https://docs.aws.amazon.com/solutions/latest/amazon-marketing-cloud-uploader-from-aws/redact-sensitive-data-from-cloudtrail-logs.html), [sota.io](https://sota.io/blog/aws-cloudtrail-eu-alternative-gdpr-cloud-act-2026)) | YES — write-time logic only, no $$ |
| **GCP Cloud Audit Logs** | Immutable; separate deletion pipeline ([Google Cloud](https://docs.cloud.google.com/logging/docs/audit)) | YES — pattern only |
| **Azure Entra** | Active redaction at write (`PII Removed`, partial IP `.XXX`) ([Microsoft Docs](https://docs.azure.cn/en-us/entra/identity/monitoring-health/reports-faq)) | YES — pattern only |
| **Datadog** | SHA-256 hash at ingestion ([Datadog Sensitive Data Scanner](https://docs.datadoghq.com/observability_pipelines/processors/sensitive_data_scanner/)) | YES — SHA-256 is free |
| **Snowflake** | PII Vault: separate table with restricted access ([Snowflake](https://www.snowflake.com/en/blog/gdpr-best-practices/)) | YES — pattern in Postgres + RLS |
| **Kafka** | Crypto-shredding: per-user key + delete key ([Conduktor](https://www.conduktor.io/blog/gdpr-kafka-right-to-erasure)) | YES — if key store is free |

## The R-META-3 problem with v1 Option C

v1 recommended AWS KMS for per-coach DEKs. Even at coach-scope: ~$1K/yr recurring at 1K coaches, scaling linearly. **R-META-3 violation.** Re-deriving with free key stores.

## Free key-store alternatives (researched)

| Option | Cost | Pros | Cons |
|---|---|---|---|
| **PostgreSQL `pgcrypto` extension** ([Postgres docs](https://www.postgresql.org/docs/current/pgcrypto.html)) | $0 (built into Postgres) | Already running Postgres. Trusted extension (non-superuser installable). `pgp_sym_encrypt` / `pgp_sym_decrypt` primitives. Same DB transaction as audit writes. | Master key must live SOMEWHERE outside the DB (env var or secrets file). If master key + DB dump both leak, game over. |
| **HashiCorp Vault (self-hosted, open-source)** ([HashiCorp](https://developer.hashicorp.com/vault/docs)) | $0 (open source, free tier) | Encryption-as-a-service; key rotation built-in; widely used. | Extra service to run (Postgres backend possible). Operational overhead = profile-drift cost in disguise. |
| **OpenBao (Linux Foundation fork of Vault)** ([GitHub](https://github.com/openbao/openbao)) | $0 | Same as Vault, Linux Foundation governance. | Same operational overhead. |
| **App-layer envelope with master key in env / secrets file** | $0 | Trivial. No extra service. Master key rotates manually. | Single master key = single point of failure. |

**Recommended free path:** **`pgcrypto` + master key in env var, with per-coach DEK stored in DB encrypted by master key.** This is the "vault" pattern compressed into Postgres + one env var. Crypto-shredding works by deleting the per-coach DEK row from the DB (which is itself encrypted, but irrelevant — once the row is gone, the data it could decrypt is unrecoverable).

## The three options, re-derived under R-META-3

### Option A — Sentinel-only (zero LOC change, current code)
**What it does:** Write `[REDACTED:GDPR-ART-17]` at audit time. Same string forever.
**Cost:** $0 forever. No extra deps.
**Metaphor:** Every face in the camera footage is replaced with a black silhouette. You see something happened; you can't tell whose face it was — not even whether the same person came back twice.
**Pros:** Unlinkable. No key management. No vault. ZERO ops cost.
**Cons:** No forensic correlation across rows for the same user. Auditor utility weak. Still requires UPDATE-after-erasure for the cleanup (the original B2 problem is NOT solved).
**Wait — does it solve B2?** YES if we don't allow per-user "delete me" beyond what's already in the sentinel. We just need to **stop calling `redactPii` entirely** and remove the `update` path from the service. The sentinel was already written at audit time; there's nothing to redact later. **This is the cheapest fix to B2.**

### Option B — Deterministic hash token (Datadog pattern)
**What it does:** Write `tok_<HMAC-SHA256(secret, pii)[:16]>` at audit time. Same PII → same token, forever.
**Cost:** $0 forever. Just SHA-256 (Node crypto stdlib).
**Metaphor:** Every face in the camera footage is replaced with a fingerprint. You can tell when the same person came back (same fingerprint), but you can't reconstruct the face from the fingerprint alone.
**Pros:** Forensic correlation works. No UPDATE on audit_log. B2 closes naturally (nothing to redact later). Already 90% built in the current code (`erasureToken`).
**Cons:** Durable pseudonym remains. If secret leaks, low-entropy PII brute-forceable offline. Not TRUE Art. 17 erasure (token never goes away).
**Mitigation:** Rotate the HMAC secret on Art. 17 erasure event for that specific user. Requires per-user secret storage → enters Option C territory.

### Option C-free — Crypto-shredding with pgcrypto + per-coach DEK in Postgres
**What it does:**
- Add `pii_vault` table: `(pii_id uuid PK, coach_id, ciphertext bytea, created_at)`. RLS Tier-1.
- Add `coach_pii_keys` table: `(coach_id PK, dek_encrypted bytea, created_at, deleted_at)`. RLS operator-only.
- DEK is a 256-bit AES key, encrypted at rest via `pgp_sym_encrypt(dek, env('PII_MASTER_KEY'))` using pgcrypto.
- Audit write: caller resolves PII → encrypts with coach's DEK (decrypted in a CTE via `pgp_sym_decrypt`) → inserts ciphertext into `pii_vault` → writes only `pii_id` into `audit_log.before_state` / `after_state`.
- Erasure: `DELETE FROM coach_pii_keys WHERE coach_id = $1` (or `WHERE coach_id = $1 AND scope = 'client-' || $2` if we want client-level shred). Ciphertext in vault remains, but DEK is gone → mathematically unrecoverable.

**Cost:**
- pgcrypto extension: **$0** (built into Postgres).
- Master key: stored in env var (Railway / Fly.io / Vercel secrets) → **$0**.
- DEK rows: live in our existing Postgres → **$0**.
- Total recurring cost: **$0**.

**Metaphor:** The camera footage shows a locker number, not a face. The locker holds the photograph. To "erase" someone, we shred the locker key — the photograph is still inside, but no one can ever open the locker again. The footage (which only ever showed the locker number) is never touched.

**Pros:**
- True Art. 17 erasure: mathematically irrecoverable.
- Closes H6A B2 entirely: audit_log keeps REVOKE UPDATE/DELETE forever (D-H6-1 preserved).
- Forensic correlation works for non-erased users (same `pii_id` → same person within a coach).
- **Zero recurring cost.**
- Becomes the moat story.

**Cons:**
- ~200 prod LOC for vault + DEK encryption/decryption helpers (within R76 cap for one slice).
- One critical secret to protect: `PII_MASTER_KEY`. If this leaks AND a DB dump leaks AND a DEK row hasn't been deleted, the PII is recoverable for that coach. **Mitigation:** rotate master key annually; rotate DEKs on rotation (re-encrypt all DEK rows under new master); keep master key off the same host as DB backups.
- pgcrypto MUST be enabled in the migration.

## Adjudicator recommendation under R-META-3

**Option C-free (pgcrypto + per-coach DEK).**

Rationale via first-principles:
- **Question the requirement** ("must PII be in audit_log?"): No. Delete it.
- **Delete the part**: Move PII out of audit_log entirely. Audit_log holds only `pii_id` references. Also DELETE the `redactPii` codepath — no longer needed.
- **Simplify**: Coach-scoped DEK in Postgres. No extra service. No KMS. One env var.
- **Accelerate cycle time**: Closes H6A B2 with zero new privilege model. The audit_log can keep its REVOKE intact.
- **Automate last**: DEK rotation = manual operator script for v1.

Under R-META-3:
- **No KMS spend.** $0/mo.
- **No HashiCorp Vault server.** Save ops cost.
- **pgcrypto already in Postgres.** Free.
- **Master key in Railway/Vercel/Fly secret store.** Free tier.

It also gives Bradley the **strongest possible answer** when a future Bradley/lawyer/auditor asks "what happens when a coach asks to delete a client?" → "We shred the encryption key. The data is mathematically unrecoverable. We did it for $0/mo. CloudTrail can't do that. That's the moat."

## Required operator pick

**A / B / C-free.** Default if you don't pick: A (status quo behavior — but with `redactPii` codepath DELETED to close B2).

| Option | Cost | B2 closes? | Art. 17 strength | Forensic correlation | LOC |
|---|---|---|---|---|---|
| A — Sentinel | $0 | Yes (if we delete redactPii) | Strong (unlinkable) | None | -30 LOC (deletion) |
| B — Hash token | $0 | Yes (no UPDATE needed) | Weak (durable pseudonym) | Strong | ~50 LOC |
| C-free — Crypto-shred (pgcrypto) | $0 | Yes | Strongest (mathematical) | Strong | ~200 LOC |

All three are now $0 recurring. Option C-free is the recommended path.

Once picked, I lock D-H6-6, dispatch a fixer slice for the chosen path, and update H6A PR #493's MAJOR M5 fix accordingly.
