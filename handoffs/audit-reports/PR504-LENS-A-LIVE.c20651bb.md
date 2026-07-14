# PR #504 — Lens A (Adversarial) Re-Audit — Fixer Round 1

- **PR:** #504 `feat(contract): freeze tgp-importer OpenAPI slice + truthful error envelope`
- **Head re-audited:** `c20651bb4783c9ae0fa3fef483f72a390cf208de` (confirmed via `gh`, state OPEN)
- **Prior audited head:** `31add499` (FAIL: P1=2, P3=1)
- **Base:** `main` `7b6a2438`
- **Lens:** A (adversarial, R72) — AUDIT ONLY, no commits/merge
- **Date:** 2026-07-14

## Verdict summary

**CLEAN** — P0=0 P1=0 P2=0 P3=0. All three prior findings resolved; no new P0–P3 introduced.

Fixer commit `c20651b` touched exactly 5 files (3 controllers + regenerated artifact +
spec). No production runtime behavior changed — decorators + regenerated schema only.
Byte-identity drift test passes against a fresh regeneration, so the committed artifact
truthfully reflects the current decorators. **55/55** contract tests pass (was 48; +7).

---

## Prior findings — re-verification

### [P1-A] ValidationPipe `400` on refresh / pair/status / progress / complete → **RESOLVED**

Global pipe is `whitelist:true, forbidNonWhitelisted:true` (`src/main.ts:98`), so each of
these validated-DTO routes can emit a `400`. Fixer added:
- `refresh` → `400` (`auth.controller.ts`, `errorEnvelopeSchema()`)
- `pair/status` → `400` (`extension-pair.controller.ts`, explicitly notes the shared
  `@Matches(/^[0-9]{6}$/)` rule with redeem)
- `progress` + `complete` → `400` via a class-level `@ApiResponse` on `ScoutController`
  (`scout.controller.ts`) — covers both methods; `scout/ingest` (separate controller)
  already had its method-level 400.

Verified in the regenerated artifact: **all 7 routes now carry a `400`** referencing the
shared `ErrorEnvelope` (or `envelopeWithCode` where a domain code exists). ✓

### [P1-B] pair/init and pair/status missing `401` → **RESOLVED**

Both routes are authenticated (not `@Public`; global `JwtAuthGuard` is the first
`APP_GUARD`, `app.module.ts:395`, running before role checks). Fixer added `401 →
errorEnvelopeSchema()` to both `init` and `status`, with descriptions correctly noting
"JwtAuthGuard runs before role checks." Artifact confirms `init` and `status` now expose
`401` (plain envelope, no domain code — correct for a guard rejection). ✓

### [P3-A] redeem `500` unmodeled → **RESOLVED**

`redeem` calls `mintExtensionSessionForCoach`, which throws
`InternalServerErrorException('pair_redeem_session_mint_failed')`
(`auth.service.ts:342,360`). Fixer added `500 → errorEnvelopeSchema()` to `redeem`.
Artifact confirms. ✓

---

## Adversarial sweep for NEW issues (fixer round 1)

- **Artifact integrity:** still **7 paths / 17 schemas**, **no dangling `$ref`**, **no
  unused schema**. Path/schema counts unchanged — the fix added responses only, no new
  schema. ✓
- **Byte-identity / drift:** `npx jest test/contracts/*` → **55/55 pass**, incl. the live
  byte-identity regeneration + cross-process determinism. Committed artifact is not stale. ✓
- **No over-documentation:** every added status is genuinely reachable — 400 (ValidationPipe),
  401 (JwtAuthGuard on authenticated routes), 500 (explicit throw). No route advertises an
  unreachable status. ✓
- **5xx completeness (consistency check):** grepped all explicit `5xx` throws in importer
  code. The only ones reachable from the 7 contract routes are the two
  `pair_redeem_session_mint_failed` sites — both in the `redeem` path, now documented. The
  other 5xx throws (`ServiceUnavailable` Apple sign-in, sensitive-action, recent-auth) are
  non-importer `/auth` routes, correctly out of contract scope. No new 5xx gap. ✓
- **`refresh` correctly omits 403/500** (`@Public`, no explicit 5xx throw); **`redeem`
  correctly omits 401** (`@Public`). No inconsistency introduced. ✓
- **Test rigor (non-blocking note, not a finding):** the 7 new tests are `toBeDefined()`
  presence checks rather than asserting the `$ref` targets `ErrorEnvelope`. This is
  adequately backstopped by the byte-identity drift test and the existing envelope-shape
  assertions, and I independently confirmed every new 400/401/500 resolves to the shared
  `ErrorEnvelope` in the artifact. No action required.

---

## Resolution ledger

| ID | Prior severity | Status |
|---|---|---|
| P1-A (400 × 4 routes) | P1 | RESOLVED |
| P1-B (401 × init/status) | P1 | RESOLVED |
| P3-A (redeem 500) | P3 | RESOLVED |

No new findings.

VERDICT: CLEAN
