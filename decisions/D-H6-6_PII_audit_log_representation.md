# D-H6-6 (REVISED) — Write-path PII representation in audit_log

**Status:** OPEN (operator decision required)
**Doctrine cite:** R-META-1 (first-principles), R-META-2 (hyperscaler research + metaphor), D-H6-1 (audit_log immutability), D-H6-4 (GDPR Art. 17)
**Surfaced from:** H6A PR #493 adjudication (Lens A F8 vs Lens B F4 dispute)

---

## The metaphor

> **A bank security camera films everything in the lobby forever, but the customer's name is never written on the footage — only their account number, which the bank can later unlink from any real identity. The video stays. The name vanishes.**

The audit log is the camera footage. The "name" is the PII. The "account number" is the token. Erasure = unlinking the token from any way to recover the name.

## The first-principles question

**Do we even need PII in `before_state` / `after_state`?** No. We need enough to prove what changed and who it belonged to *at write time*. After erasure, the audit row's purpose is forensic continuity, not identity recall. So: don't write raw PII at all. Write a token at ingestion. The link from token → identity lives in a SEPARATE structure we can break.

## What hyperscalers actually do

| Vendor | Strategy | Citation |
|---|---|---|
| **AWS CloudTrail** | No row-level deletion. Redact PII at write — "the best protection is to not log it." | [AWS CloudTrail redaction guidance](https://docs.aws.amazon.com/solutions/latest/amazon-marketing-cloud-uploader-from-aws/redact-sensitive-data-from-cloudtrail-logs.html), [sota.io structural analysis](https://sota.io/blog/aws-cloudtrail-eu-alternative-gdpr-cloud-act-2026) |
| **GCP Cloud Audit Logs** | Log is immutable; PII (caller email) stays. Erasure handled by a SEPARATE deletion pipeline acting on identity tables, not the log. | [Google Cloud Audit Logs overview](https://docs.cloud.google.com/logging/docs/audit), [Google Cloud Trust whitepaper](https://services.google.com/fh/files/misc/072022_google_cloud_trust_whitepaper.pdf) |
| **Azure Monitor / Entra ID** | Active redaction at write. `PII Removed` markers; partial IP redaction (`.XXX`) for cross-tenant. | [Microsoft Entra activity-logs FAQ](https://docs.azure.cn/en-us/entra/identity/monitoring-health/reports-faq) |
| **Datadog Audit Trail (Sensitive Data Scanner)** | Scan + **SHA-256 hash** or redact at ingestion before indexing. 60+ predefined PII patterns. | [Datadog Sensitive Data Scanner](https://docs.datadoghq.com/observability_pipelines/processors/sensitive_data_scanner/), [Datadog Audit Trail](https://www.datadoghq.com/product/audit-trail/) |
| **Snowflake** | **PII Vault** pattern: PII lives in a separate column/table with restricted access. Audit/analytics tables hold only "unintelligent keys." Drop the vault → all linked data is erased. | [Snowflake GDPR best practices](https://www.snowflake.com/en/blog/gdpr-best-practices/), [Harbinger Cloud GDPR deep dive](https://www.harbingerexplorer.com/aws/cloud-data-compliance-gdpr) |
| **Kafka (compliance pattern)** | **Crypto-shredding**: encrypt PII with per-user key; delete key on erasure → ciphertext becomes irrecoverable. | [Conduktor GDPR + Kafka](https://www.conduktor.io/blog/gdpr-kafka-right-to-erasure) |

**Convergent pattern:** Don't put raw PII in the immutable log. Either (1) hash it deterministically (Datadog), (2) put it in a separate vault and reference it by ID (Snowflake), or (3) crypto-shred (Kafka).

NO hyperscaler keeps raw PII inside an append-only audit log and then mutates it for erasure later. That approach is what we currently ship (sentinel-replacement after-the-fact), and it requires UPDATE permission on a no-UPDATE table — which is exactly why H6A PR #493 BLOCKER B2 exists.

## The three options, with hyperscaler precedent

### Option A — Sentinel-only (current code path)
**What it does:** Write `[REDACTED:GDPR-ART-17]` for any PII key at audit time. Same string forever.
**Hyperscaler equivalent:** Closest to Azure Entra's `PII Removed` marker.
**Metaphor:** Every face in the camera footage is replaced with a black silhouette. You see something happened; you can't tell whose face it was — not even whether the same person came back twice.
**Pros:** Unlinkable. No key management. No vault.
**Cons:** Loses forensic correlation: can't tell "all rows touching customer X" even when investigating fraud BEFORE any erasure request. Auditor utility is weak.
**Pick this if:** Privacy is absolute priority and forensic correlation is acceptable to lose.

### Option B — Deterministic token (Datadog-style hash)
**What it does:** Write `tok_<sha256(salt || pii)[:16]>` at audit time. Same PII → same token, forever.
**Hyperscaler equivalent:** Datadog Sensitive Data Scanner (SHA-256 hash mode).
**Metaphor:** Every face in the camera footage is replaced with a fingerprint. You can tell when the same person came back (same fingerprint), but you can't reconstruct the face from the fingerprint alone.
**Pros:** Industry standard. Forensic correlation works. No need for UPDATE-after-the-fact.
**Cons:** Durable pseudonym remains forever. If the salt key leaks, low-entropy PII (emails, phone numbers) is brute-forceable offline. Erasure is impossible — same plaintext always produces same token, so post-erasure events for the same user are still re-linkable.
**Pick this if:** Forensic correlation matters more than absolute Art. 17 compliance (lawyer risk acceptance required).

### Option C — Crypto-shredding (Snowflake vault + Kafka shred, hybrid)
**What it does:** PII goes into a `pii_vault` table keyed by `pii_id` (uuid). Vault row stores PII encrypted with a per-user data key (DEK), which is itself encrypted by a master key in KMS. Audit log writes `pii_id` only — NEVER plaintext or hash. On Art. 17 erasure → delete the per-user DEK from KMS. The audit log row still references `pii_id` but the ciphertext in the vault is now unrecoverable. The audit log itself is never touched.
**Hyperscaler equivalent:** Snowflake PII Vault (Harbinger pattern) + Kafka crypto-shredding (Conduktor pattern). This is what AWS / GCP / large banks actually deploy at scale.
**Metaphor:** The camera footage shows a locker number, not a face. The locker holds the photograph. To "erase" someone, we shred the key to their locker — the photograph is still inside, but no one can ever open the locker again. The footage (which only ever showed the locker number) is never touched.
**Pros:**
- True Art. 17 erasure without ever touching the audit log (closes H6A B2 entirely — no UPDATE permission needed).
- Forensic correlation works for non-erased users (same person → same pii_id → can join).
- Crypto-shredded users vanish completely (no plaintext, no hash, no token to brute-force).
- Standard at hyperscale.
**Cons:**
- More LOC (~200 prod LOC for vault + KMS DEK rotation; ~50 LOC for audit-log write path change).
- KMS-key-per-user is the most expensive AWS KMS pattern (~$1/key/month + API call costs). Need to estimate scale impact — at 1K coaches × 10K clients = 10M keys = ~$10M/yr in KMS fees. That kills the math. **Mitigation:** use envelope encryption with one DEK per coach (not per client) → 1K DEKs total ($1K/yr). Forensic correlation still works within a coach's scope; erasure for a single coach's client requires re-encrypting that coach's other vault rows with a new DEK (acceptable batch op).
- Requires a vault migration + KMS dependency before launch.

## Adjudicator recommendation

**Option C (crypto-shredding with coach-scoped DEK).**

Rationale via first-principles:
- **Question the requirement** ("must PII be in audit_log?"): No. So delete it. (Camp 1 hyperscalers all agree.)
- **Delete the part**: Move PII out of audit_log entirely. Audit_log holds only `pii_id` references.
- **Simplify**: Coach-scoped DEK (not per-client) keeps KMS cost trivial.
- **Accelerate cycle time**: This closes H6A B2 (privileged erasure client) by removing the need for one. The audit_log table can keep its REVOKE UPDATE/DELETE permissions exactly as locked in D-H6-1. No new role, no new test, no privilege escalation.
- **Automate last**: DEK rotation can be a cron job later; v1 ships with manual operator-triggered DEK delete on Art. 17 request.

It also gives Bradley the **strongest possible answer** when a future Bradley/lawyer/auditor asks "what happens when a coach asks to delete a client?" → "We shred the encryption key. The data is mathematically unrecoverable. CloudTrail can't do that. We can. That's the moat."

## Required operator pick

**A / B / C.** Default if you don't pick: A (status quo, current code). Default kills the moat story and leaves B2 unresolved.

Once picked, I lock D-H6-6, dispatch a fixer slice for the chosen path, and update H6A PR #493's MAJOR M5 fix accordingly.
