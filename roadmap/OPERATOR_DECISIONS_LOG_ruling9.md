# OPERATOR_DECISIONS_LOG — Ruling #9

**Date:** 2026-06-27 (Op 50.5)
**Operator:** Bradley Gleave
**Type:** Architectural pivot — supersedes prior M-NEW-LIVE briefs

---

## Ruling #9: M-NEW-LIVE substrate SHELVED. Browser extension is the canonical import path.

### Decision

The M-NEW-LIVE server-side credential-replay substrate is **SHELVED, not deleted**. All 10 M-NEW-* briefs in `audit_briefs/` remain in the repo as preserved-but-inactive design history. The canonical import architecture is now **M-IMPORTER-EXTENSION_v1.md** — a Chrome MV3 extension that rides the coach's own logged-in session in the coach's own browser tab, with explicit click consent before any byte moves.

### What this kills

| Killed artifact | Status |
|---|---|
| PR #493 (H6A audit-log substrate) | CLOSED without merge, branch `wave-h6a-audit-log` preserved |
| PR #494 (H6B circuit breakers) | CLOSED without merge, branch `wave-h6b-circuit-breakers` preserved |
| M-NEW-SUBSTRATE.A through .F | SHELVED |
| M-NEW-ONBOARDING (full) | SHELVED — replaced by ~80-LOC extension install prompt |
| M-NEW-RECONCILER | SHELVED — replaced by ~150-LOC idempotent upsert in `/api/scout/ingest` |
| M-NEW-PROFILE-TRUECOACH | SHELVED — replaced by ~250-LOC `extractors/truecoach.ts` |
| D-H6-6 (PII audit-log representation) | **MOOT** — no credentials/cookies at rest |
| pgcrypto + KMS + DEK rotation | OUT OF SCOPE |
| MFA relay, device-trust handling, session pool | OUT OF SCOPE |

### Why (R-META-1 first-principles)

- **Question the requirement:** Why was substrate needed? To replay coach logins server-side. Why? To extract data the coach already has access to. **The coach extracting their own data inside their own browser is strictly simpler and strictly safer.**
- **Delete the part:** 5 sub-systems (credential storage, MFA relay, device trust, session pool, audit-log substrate) deleted. ~5,250 LOC removed from forward roadmap.
- **Simplify what remains:** Replace 5,250 LOC of substrate with ~4,920 LOC of extension across 6 platforms (Day-1: ~1,270 LOC for TrueCoach only).

### Why (R-META-2 hyperscaler precedent)

The pattern is industry-validated by 1Password, Dashlane, Bitwarden, Honey (PayPal $4B acquisition), Rakuten, and Grammarly (30M DAU). Server-side credential replay (the M-NEW-LIVE path) is NOT what these hyperscalers ship — for good reason. **Metaphor:** "The coach is the key. The extension is just the hand that turns it."

### Why (R-META-3 zero-cost)

- Chrome Web Store dev fee: **$5 one-time.**
- Recurring infrastructure cost: **$0** (no KMS, no per-key fees, no extra storage).
- Compare: M-NEW-LIVE substrate v1 path estimated ~$100-300/mo recurring with KMS DEK rotation. D-H6-6 v2 reduced that to ~$0 via pgcrypto — but the extension pivot makes the entire decision **moot** because no credentials are stored at all.

### Why (R-META-4 model discipline)

Builder spawn for extension v0 will use **`claude_opus_4_8` only**. Auditor will use **`gpt_5_5` only**. No Sonnet. No Gemini. No Haiku. Codified.

### Verification basis (Q2 — completed 2026-06-27)

All 6 target platforms verified via GPT-5.5 research subagents. Reports at `/home/user/workspace/platform_verification/*.md`. Summary:

| Platform | Feasibility | Path | LOC Est |
|---|---|---|---|
| TrueCoach | HIGH | internal-api (bearer token, `/proxy/api`) | 250 |
| CoachRx | HIGH | internal-api (`/api/v1/*` + CSRF) | 350 |
| MyPTHub | HIGH | internal-api (bearer, `auth/check2fa` present) | 700 |
| Trainerize | MEDIUM | internal-api (Studio/Enterprise) or DOM | 500 |
| PT Distinction | MEDIUM | hybrid (Laravel session + DOM) | 900 |
| FitSW | MEDIUM | hybrid (`/api/auth/` + DOM) | 1200 |

**All 6 are feasible. TrueCoach is Day-1 target.**

### Day-1 acceptance

Operator installs unpacked extension, clicks "Import → TrueCoach" in TGP, logs into his own TrueCoach test account, clicks Start banner, sees his clients appear in TGP `clients` table within 60 seconds. No server-side credentials at any point.

### Doctrine status

R0/R3 unchanged. R52, R71, R72, R74, R75, R76, R78, R82, R86, R107, R125 all still apply to extension code. **R-META-1, R-META-2, R-META-3, R-META-4 codified as immutable.**

---

**R3 footer:** Authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero AI/Claude/agent/Co-authored-by tokens. Ever.
